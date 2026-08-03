/**
 * 夜间城市灯网：用真实 OSM 矢量瓦片（VectorTileSource）构建自发光的
 * 路网（线）、建筑（点）、机场跑道（亮带）、水体（暗遮罩），模拟夜航俯瞰的城市灯火。
 *
 * 仅在 AGL 2000–8000m 显示；按 AGL 选择瓦片 zoom 等级与范围做 LOD。
 * 瓦片缺失/断网/区间外时由 main 回退到 cityLights 光晕兜底。
 *
 * 坐标：要素经纬度 → geoToWorld（与 geo-three 地形同源 origin，必对齐）→ 贴地 elevationAt。
 */
import * as THREE from 'three';
import { geoToWorld } from './geoUtils.js';

const DEG = Math.PI / 180;
const EARTH_R = 6371000; // 米

// 从 (lat,lon) 沿真航向 bearingRad 前进 distM 米后的经纬度（球面，几十 km 内足够准）。
function destPoint(lat, lon, bearingRad, distM) {
  const d = distM / EARTH_R;
  const φ1 = lat * DEG, λ1 = lon * DEG;
  const sinφ2 = Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(bearingRad);
  const φ2 = Math.asin(Math.min(1, Math.max(-1, sinφ2)));
  const λ2 = λ1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(d) * Math.cos(φ1),
    Math.cos(d) - Math.sin(φ1) * sinφ2
  );
  return [λ2 / DEG, φ2 / DEG];
}

function clampN(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// AGL → LOD 档（zoom + 范围半径(瓦片) + 道路最大rank + 建筑抽稀步长）。
// 覆盖全高度：夜间始终显示。低空用稍粗 zoom + 大 radius 覆盖远视距(地平线可达数十 km)，
// 用更大瓦片换更广覆盖，避免视野中出现明显的"未加载边界"。
const LOD_BANDS = [
  { maxAgl: 1200, zoom: 14, radius: 4, roadMaxRank: 7, bldgStep: 1 }, // 近地精细 9x9 ~19km
  { maxAgl: 4000, zoom: 13, radius: 5, roadMaxRank: 5, bldgStep: 1 }, // 中低空 11x11 ~47km
  { maxAgl: 8000, zoom: 12, radius: 5, roadMaxRank: 4, bldgStep: 2 }, // 中高空 11x11 ~93km
  { maxAgl: Infinity, zoom: 11, radius: 6, roadMaxRank: 3, bldgStep: 3 }, // 高空 13x13 仅主干
];
const FADE_NIGHT = 0.4; // 夜间因子渐入区间

function pickBand(agl) {
  for (const b of LOD_BANDS) if (agl <= b.maxAgl) return b;
  return LOD_BANDS[LOD_BANDS.length - 1];
}

export function setupCityNetwork(scene, terrain, source) {
  const root = new THREE.Group();
  root.renderOrder = 4; // 在地形/飞机之后
  scene.add(root);

  // 瓦片键 -> { group, building Points/road Lines... }；用于增量加载/卸载
  const tiles = new Map();
  let pending = new Set(); // 正在请求的键
  let curZoom = 14;
  let lastUpdate = 0;
  let groupOpacity = 0; // 整体淡入淡出
  let active = false;    // 当前 AGL 区间内是否应显示

  // ---- 暖色光点贴图（建筑）。核心不全白，避免加性混合叠成白团过曝 ----
  function dotTexture(size = 32) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,210,150,0.85)');
    g.addColorStop(0.4, 'rgba(255,170,90,0.4)');
    g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const dotTex = dotTexture(48);

  // ---- 材质（共享）。暖橙主调，模拟钠灯/暖白城市灯火 ----
  // depthTest:true → 飞机(实体、离相机更近)正确遮挡其下方灯光，不会穿透压在机身之上。
  // 灯抬高 LIGHT_LIFT 米从地形 mesh 浮出（否则贴地几米会被地形遮挡、掠视时大片消失）。
  const roadMat = new THREE.LineBasicMaterial({
    color: 0xe07828, transparent: true, opacity: 1, // 次级路：暖橙(压暗)
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: true,
  });
  const roadMajorMat = new THREE.LineBasicMaterial({
    color: 0xe6a850, transparent: true, opacity: 1, // 主干路：金橙(压暗)
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: true,
  });
  const runwayMat = new THREE.LineBasicMaterial({
    color: 0xc8d4f0, transparent: true, opacity: 1, // 跑道：冷白(压暗)
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: true,
  });
  const bldgMat = new THREE.PointsMaterial({
    size: 44, map: dotTex, transparent: true, opacity: 1, // 建筑暖光点(缩小防过曝)
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
    sizeAttenuation: true, fog: true,
  });
  const waterMat = new THREE.MeshBasicMaterial({
    color: 0x05080f, transparent: true, opacity: 0.55,
    depthWrite: false, depthTest: true, fog: true,
  });

  const _v = new THREE.Vector3();
  // 灯光离地抬升：geo-three 视觉地形 mesh 高度与 terrain.elevationAt 采样不完全一致，
  // 灯若仅贴地几米会被地形 mesh 遮挡（掠视时大片消失）。抬高至此值可从地形浮出，
  // 而巡航高度(数千米)下这点偏移在视觉上仍"贴地"，飞机也仍能正确遮挡其下方灯光。
  const LIGHT_LIFT = 50;
  // 贴地高度采样（地形未加载用 0）
  function groundY(lon, lat) {
    const e = terrain ? terrain.elevationAt(lon, lat) : 0;
    return (e == null ? 0 : e);
  }

  // 把一条经纬度折线压成 LineSegments 顶点（成对相邻点）
  function pushLineSeg(arr, pts, yOffset) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [lon1, lat1] = pts[i], [lon2, lat2] = pts[i + 1];
      geoToWorld(lat1, lon1, groundY(lon1, lat1) + yOffset, _v);
      arr.push(_v.x, _v.y, _v.z);
      geoToWorld(lat2, lon2, groundY(lon2, lat2) + yOffset, _v);
      arr.push(_v.x, _v.y, _v.z);
    }
  }

  // 多边形质心（用于建筑点）
  function centroid(ring) {
    let sx = 0, sy = 0;
    for (const [lon, lat] of ring) { sx += lon; sy += lat; }
    return [sx / ring.length, sy / ring.length];
  }

  // 构建一个瓦片的 THREE 对象
  function buildTile(key, feats, band) {
    const group = new THREE.Group();

    // —— 道路：主干 vs 次级 两组 LineSegments ——
    const majorV = [], minorV = [];
    for (const r of feats.roads) {
      if (r.rank > band.roadMaxRank) continue;
      const target = r.rank <= 2 ? majorV : minorV;
      for (const ring of r.rings) if (ring.length >= 2) pushLineSeg(target, ring, LIGHT_LIFT);
    }
    if (majorV.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(majorV, 3));
      const seg = new THREE.LineSegments(g, roadMajorMat);
      seg.frustumCulled = false; group.add(seg);
    }
    if (minorV.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(minorV, 3));
      const seg = new THREE.LineSegments(g, roadMat);
      seg.frustumCulled = false; group.add(seg);
    }

    // —— 跑道/滑行道：亮白 LineSegments ——
    const rwV = [];
    for (const a of feats.aeroways) {
      if (a.cls === 'runway' || a.cls === 'taxiway') {
        for (const ring of a.rings) if (ring.length >= 2) pushLineSeg(rwV, ring, LIGHT_LIFT + 4);
      }
    }
    if (rwV.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(rwV, 3));
      const seg = new THREE.LineSegments(g, runwayMat);
      seg.frustumCulled = false; group.add(seg);
    }

    // —— 建筑：footprint 质心 → 暖光点（按 LOD 抽稀）——
    const bV = [];
    let bi = 0;
    for (const b of feats.buildings) {
      if ((bi++ % band.bldgStep) !== 0) continue;
      for (const ring of b.rings) {
        if (ring.length < 3) continue;
        const [lon, lat] = centroid(ring);
        geoToWorld(lat, lon, groundY(lon, lat) + LIGHT_LIFT + 6, _v);
        bV.push(_v.x, _v.y, _v.z);
      }
    }
    if (bV.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(bV, 3));
      const pts = new THREE.Points(g, bldgMat);
      pts.frustumCulled = false; group.add(pts);
    }

    // —— 水体：暗色面（仅 z>=13 时建，远景不必）——
    if (band.zoom >= 13) {
      for (const w of feats.water) {
        for (const ring of w.rings) {
          if (ring.length < 3) continue;
          const shape = new THREE.Shape();
          for (let i = 0; i < ring.length; i++) {
            const [lon, lat] = ring[i];
            geoToWorld(lat, lon, 0, _v);
            if (i === 0) shape.moveTo(_v.x, _v.z); else shape.lineTo(_v.x, _v.z);
          }
          const geo = new THREE.ShapeGeometry(shape);
          geo.rotateX(Math.PI / 2); // XY->XZ 平面
          const mesh = new THREE.Mesh(geo, waterMat);
          // ShapeGeometry 在 Y=0 平面，抬到地表略下
          mesh.position.y = 2;
          mesh.frustumCulled = false; group.add(mesh);
        }
      }
    }

    root.add(group);
    tiles.set(key, { group, zoom: band.zoom });
  }

  function disposeTile(key) {
    const t = tiles.get(key);
    if (!t) return;
    t.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    root.remove(t.group);
    tiles.delete(key);
  }

  function clearAll() {
    for (const key of [...tiles.keys()]) disposeTile(key);
    pending.clear();
  }

  /**
   * 每帧调用（内部节流）。
   * @param lon,lat 飞机位置
   * @param agl 离地高度(米)
   * @param night 夜间因子 0~1
   * @param nowMs
   * @param headingRad 真航向(弧度)，用于沿航线前向预加载
   * @param groundSpeedMps 地速(米/秒)，决定预加载提前量
   */
  function update(lon, lat, agl, night, nowMs, headingRad = 0, groundSpeedMps = 0) {
    // 夜间始终显示（不再做 AGL 区间门控）；透明度仅由夜间因子驱动，LOD 随 AGL 自适应。
    active = night > 0.05;
    const targetOp = active ? Math.min(1, (night - 0.05) / FADE_NIGHT) : 0;
    groupOpacity += (targetOp - groupOpacity) * 0.08;
    root.visible = groupOpacity > 0.01;
    applyOpacity(groupOpacity);

    // 完全淡出（白天）：卸载所有瓦片释放显存，停止请求
    if (groupOpacity <= 0.01) {
      if (tiles.size) clearAll();
      root.visible = false;
      return;
    }
    if (!source.isReady()) return;

    // 节流：每 ~400ms 重算瓦片集
    if (nowMs - lastUpdate < 400) return;
    lastUpdate = nowMs;

    const band = pickBand(agl);
    curZoom = band.zoom;
    const r = band.radius;

    // —— 前向偏置：把可见窗口沿航向推前，让前方先于正下方建好（航线可预测）——
    // 偏置量随地速增大（飞得快、看得更远），上限约 1.5 个瓦片半径。
    const tilesPerDeg = Math.pow(2, band.zoom) / 360; // 经度向，纬度向近似
    const leadVisM = clampN(groundSpeedMps * 8, 0, 60000); // 约 8 秒航程的前视
    const [vlon, vlat] = groundSpeedMps > 1
      ? destPoint(lat, lon, headingRad, leadVisM) : [lon, lat];
    const [cx, cy] = source.lonLatToTile(vlon, vlat, band.zoom);

    // 期望（可见+构建）瓦片集：以前向偏置中心展开 r 半径
    const want = new Set();
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        want.add(`${band.zoom}/${cx + dx}/${cy + dy}`);
      }
    }

    // 卸载：不在期望集 或 zoom 不符
    for (const key of [...tiles.keys()]) {
      if (!want.has(key)) disposeTile(key);
    }

    // 构建：可见集内缺失的，立即请求并建几何
    for (const key of want) {
      if (tiles.has(key) || pending.has(key)) continue;
      pending.add(key);
      const [z, x, y] = key.split('/').map(Number);
      source.fetchTileFeatures(z, x, y).then((feats) => {
        pending.delete(key);
        if (curZoom === z) buildTile(key, feats, pickBand(agl));
      }).catch(() => { pending.delete(key); });
    }

    // —— 沿航线远端预热缓存（只 fetch+解码，不建几何）——
    // 航线固定、路径可预测：提前把前方走廊的瓦片下载解码进 LRU 缓存，
    // 待飞机临近进入 want 集时即为即时命中(buildTile 不再等网络)，消除"临近才加载"的突兀。
    if (groundSpeedMps > 1) {
      prefetchCorridor(lat, lon, headingRad, groundSpeedMps, band);
    }
  }

  // 沿航向走廊预取：覆盖从可见窗口边缘到前方更远处的瓦片，预热进 LRU 缓存。
  let lastPrefetch = 0;
  function prefetchCorridor(lat, lon, headingRad, gsMps, band) {
    const now = performance.now ? performance.now() : Date.now();
    if (now - lastPrefetch < 1000) return; // 自身限流约 1s 一轮
    lastPrefetch = now;
    // 该 zoom 下单瓦片的地面宽度（米，按当前纬度）
    const tileGroundM = (2 * Math.PI * EARTH_R * Math.cos(lat * DEG)) / Math.pow(2, band.zoom);
    // 前视距离：取「时间法(45 秒航程)」与「至少 visibleRadius+5 个瓦片」两者较大值，
    // 保证高空(瓦片大、速度快)与低空(瓦片小)都有足够提前量。
    const byTime = gsMps * 45;
    const byTiles = (band.radius + 5) * tileGroundM;
    const horizonM = clampN(Math.max(byTime, byTiles), tileGroundM * 4, 200000);
    const steps = Math.min(12, Math.max(6, Math.ceil(horizonM / tileGroundM)));
    for (let s = 1; s <= steps; s++) {
      const distM = (horizonM * s) / steps;
      const [plon, plat] = destPoint(lat, lon, headingRad, distM);
      const [tx, ty] = source.lonLatToTile(plon, plat, band.zoom);
      for (let dx = -1; dx <= 1; dx++) { // 航线两侧各 1 格
        const key = `${band.zoom}/${tx + dx}/${ty}`;
        if (tiles.has(key) || pending.has(key)) continue;
        source.fetchTileFeatures(band.zoom, tx + dx, ty).catch(() => {});
      }
    }
  }

  function applyOpacity(op) {
    roadMat.opacity = op * 0.42;       // 次级路压低，作骨架
    roadMajorMat.opacity = op * 0.6;   // 主干路稍亮
    runwayMat.opacity = op * 0.7;
    bldgMat.opacity = op * 0.7;        // 建筑暖光点(降亮防过曝)
    waterMat.opacity = op * 0.55;
  }

  /** 切换机场：清空所有瓦片（origin 变了，世界坐标需重算）。 */
  function reset() { clearAll(); lastUpdate = 0; }

  /** 当前是否有已加载瓦片在显示（供 main 决定是否弱化 cityLights 兜底）。 */
  function isActive() { return root.visible && tiles.size > 0; }

  return { update, reset, isActive };
}
