/**
 * 城市灯光：夜间在城市区域叠加暖色加性发光精灵，模拟万家灯火。
 * 白天全灭，暮光起（太阳高度角 < ~2°）按夜间因子淡入。
 *
 * 城市种子来源：内置主要城市经纬度表 + 运行时机场注册表(REGISTRY)。
 * 仅实例化当前场景原点附近(可见范围)的城市，每城撒若干随机微光点成簇。
 * 灯光锚定地形高度(terrain.elevationAt)，置于地表略上方。
 */
import * as THREE from 'three';
import { geoToWorld } from './geoUtils.js';

// 内置主要城市（经纬度 + 规模权重 1~3，权重越大灯越多越亮）。覆盖各大洲枢纽，
// 保证无论从哪个机场起飞，附近都有可信的城市灯火。
const CITIES = [
  // 东亚
  ['Hong Kong', 114.17, 22.30, 3], ['Shenzhen', 114.06, 22.55, 3], ['Guangzhou', 113.26, 23.13, 3],
  ['Macau', 113.54, 22.19, 2], ['Zhuhai', 113.55, 22.27, 2], ['Dongguan', 113.75, 23.02, 2],
  ['Shanghai', 121.47, 31.23, 3], ['Beijing', 116.41, 39.90, 3], ['Tianjin', 117.20, 39.13, 2],
  ['Chengdu', 104.07, 30.57, 3], ['Chongqing', 106.55, 29.56, 3], ['Wuhan', 114.30, 30.59, 2],
  ['Xian', 108.94, 34.34, 2], ['Hangzhou', 120.16, 30.29, 2], ['Nanjing', 118.80, 32.06, 2],
  ['Taipei', 121.56, 25.03, 3], ['Kaohsiung', 120.30, 22.63, 2],
  ['Tokyo', 139.69, 35.69, 3], ['Osaka', 135.50, 34.69, 3], ['Nagoya', 136.91, 35.18, 2],
  ['Seoul', 126.98, 37.57, 3], ['Busan', 129.08, 35.18, 2],
  // 东南亚 / 南亚
  ['Bangkok', 100.50, 13.75, 3], ['Singapore', 103.82, 1.35, 3], ['Kuala Lumpur', 101.69, 3.14, 3],
  ['Jakarta', 106.85, -6.21, 3], ['Manila', 120.98, 14.60, 3], ['Ho Chi Minh City', 106.66, 10.76, 3],
  ['Hanoi', 105.83, 21.03, 2], ['Bangalore', 77.59, 12.97, 3], ['Mumbai', 72.88, 19.08, 3],
  ['Delhi', 77.21, 28.61, 3], ['Kolkata', 88.36, 22.57, 3], ['Chennai', 80.27, 13.08, 2],
  // 中东 / 中亚
  ['Dubai', 55.27, 25.20, 3], ['Abu Dhabi', 54.37, 24.45, 2], ['Doha', 51.53, 25.29, 2],
  ['Riyadh', 46.72, 24.71, 2], ['Tehran', 51.39, 35.69, 3], ['Istanbul', 28.98, 41.01, 3],
  // 欧洲
  ['London', -0.13, 51.51, 3], ['Paris', 2.35, 48.86, 3], ['Madrid', -3.70, 40.42, 3],
  ['Barcelona', 2.17, 41.39, 2], ['Rome', 12.50, 41.90, 3], ['Milan', 9.19, 45.46, 2],
  ['Berlin', 13.40, 52.52, 3], ['Munich', 11.58, 48.14, 2], ['Frankfurt', 8.68, 50.11, 2],
  ['Amsterdam', 4.90, 52.37, 2], ['Madrid', -3.70, 40.42, 3], ['Moscow', 37.62, 55.75, 3],
  ['Vienna', 16.37, 48.21, 2], ['Zurich', 8.54, 47.37, 2], ['Brussels', 4.35, 50.85, 2],
  ['Athens', 23.73, 37.98, 2], ['Lisbon', -9.14, 38.72, 2], ['Dublin', -6.26, 53.35, 2],
  ['Warsaw', 21.01, 52.23, 2], ['Stockholm', 18.07, 59.33, 2], ['Copenhagen', 12.57, 55.68, 2],
  // 北美
  ['New York', -74.01, 40.71, 3], ['Los Angeles', -118.24, 34.05, 3], ['San Francisco', -122.42, 37.77, 3],
  ['Chicago', -87.63, 41.88, 3], ['Seattle', -122.33, 47.61, 2], ['Boston', -71.06, 42.36, 2],
  ['Washington', -77.04, 38.91, 2], ['Las Vegas', -115.14, 36.17, 2], ['Miami', -80.19, 25.76, 2],
  ['Houston', -95.37, 29.76, 2], ['Dallas', -96.80, 32.78, 2], ['Atlanta', -84.39, 33.75, 2],
  ['Toronto', -79.38, 43.65, 3], ['Vancouver', -123.12, 49.28, 2], ['Mexico City', -99.13, 19.43, 3],
  ['San Jose', -121.89, 37.34, 2], ['Oakland', -122.27, 37.80, 2], ['Sacramento', -121.49, 38.58, 1],
  // 南美 / 非洲 / 大洋洲
  ['Sao Paulo', -46.63, -23.55, 3], ['Rio de Janeiro', -43.17, -22.91, 3], ['Buenos Aires', -58.38, -34.60, 3],
  ['Santiago', -70.65, -33.46, 2], ['Lima', -77.04, -12.05, 2], ['Bogota', -74.07, 4.71, 2],
  ['Cairo', 31.24, 30.04, 3], ['Johannesburg', 28.05, -26.20, 2], ['Cape Town', 18.42, -33.93, 2],
  ['Nairobi', 36.82, -1.29, 2], ['Lagos', 3.38, 6.52, 3],
  ['Sydney', 151.21, -33.87, 3], ['Melbourne', 144.96, -37.81, 3], ['Brisbane', 153.03, -27.47, 2],
  ['Auckland', 174.76, -36.85, 2], ['Perth', 115.86, -31.95, 2],
];

function haversineKm(aLat, aLon, bLat, bLon) {
  const R = 6371, DEG = Math.PI / 180;
  const dLat = (bLat - aLat) * DEG, dLon = (bLon - aLon) * DEG;
  const la1 = aLat * DEG, la2 = bLat * DEG;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 暖色城市光点贴图（白心->暖橙->透明）
function glowTexture(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,244,214,1)');
  g.addColorStop(0.25, 'rgba(255,206,128,0.7)');
  g.addColorStop(0.6, 'rgba(255,170,80,0.22)');
  g.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function setupCityLights(scene, terrain, registry) {
  const group = new THREE.Group();
  scene.add(group);

  const tex = glowTexture(64);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false, // 关键：灯光辉光始终穿透显示，不被地形/起伏遮挡（同月亮/星空处理）
    fog: true, // 受雾影响->远处城市灯自然隐入夜雾，符合真实
    opacity: 1,
  });

  group.renderOrder = 3; // 在地形/飞机之后绘制（depthTest:false 时靠 renderOrder 定层）

  const RADIUS_KM = 420;   // 仅实例化原点附近城市
  const MAX_SPRITES = 2600; // 上限，避免过多精灵
  const _v = new THREE.Vector3();
  let built = [];          // 当前已建灯光精灵
  let curNight = 0;

  // 收集城市种子（内置 + 注册表机场城市，去重）
  function collectSeeds() {
    const seeds = [];
    const seen = new Set();
    for (const [name, lon, lat, w] of CITIES) {
      const k = name + '|' + lon.toFixed(1);
      if (seen.has(k)) continue; seen.add(k);
      seeds.push({ lon, lat, w });
    }
    if (registry) {
      for (const icao of Object.keys(registry)) {
        const ap = registry[icao];
        if (!ap || ap.lon == null) continue;
        const k = 'ap|' + ap.lon.toFixed(1) + ',' + ap.lat.toFixed(1);
        if (seen.has(k)) continue; seen.add(k);
        seeds.push({ lon: ap.lon, lat: ap.lat, w: 2 }); // 机场周边视为城区
      }
    }
    return seeds;
  }

  // 伪随机（确定性）
  function makeRnd(s) { let x = s; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }

  /**
   * 按当前场景原点(机场)重建附近城市灯光。切换机场后调用。
   * @param originLat,originLon 当前原点经纬度
   */
  function rebuild(originLat, originLon) {
    for (const s of built) group.remove(s);
    built = [];
    const seeds = collectSeeds();
    let count = 0;
    for (const seed of seeds) {
      if (count >= MAX_SPRITES) break;
      const dist = haversineKm(originLat, originLon, seed.lat, seed.lon);
      if (dist > RADIUS_KM) continue;
      // 每城按权重撒点成簇（权重 1/2/3 -> 约 12/30/55 点，密集成灯网）
      const n = [0, 12, 30, 55][seed.w] || 14;
      const spreadDeg = 0.020 + seed.w * 0.014; // 簇半径（度）
      const rnd = makeRnd(Math.round((seed.lon + 200) * 1000) ^ Math.round((seed.lat + 200) * 1000));
      const baseElev = terrain ? (terrain.elevationAt(seed.lon, seed.lat) ?? 0) : 0;
      for (let i = 0; i < n && count < MAX_SPRITES; i++) {
        // 高斯偏移成簇
        const dx = (rnd() + rnd() + rnd() - 1.5) * spreadDeg;
        const dy = (rnd() + rnd() + rnd() - 1.5) * spreadDeg;
        const lon = seed.lon + dx, lat = seed.lat + dy;
        const sp = new THREE.Sprite(mat.clone());
        geoToWorld(lat, lon, baseElev + 8, _v);
        sp.position.copy(_v);
        const sz = 90 + rnd() * 170 + seed.w * 45;
        sp.scale.setScalar(sz);
        sp.material.opacity = 0; // 由 update 控制
        // 暖度微抖：部分偏白、部分偏橙
        const warm = rnd();
        sp.material.color.setRGB(1, 0.82 + warm * 0.14, 0.55 + warm * 0.3);
        sp.userData.baseOp = 0.5 + rnd() * 0.5;
        sp.userData.tw = rnd() * 6.28; // 闪烁相位
        group.add(sp);
        built.push(sp);
        count++;
      }
    }
  }

  /** 每帧更新。night=夜间因子(0~1)；nowMs 闪烁；dim=被灯网接管时的整体衰减(默认1)。 */
  function update(night, nowMs, dim = 1) {
    curNight = night;
    group.visible = night > 0.01 && dim > 0.01;
    if (!group.visible) return;
    for (const sp of built) {
      // 极轻微闪烁（大气视宁度）
      const tw = 0.88 + 0.12 * Math.sin(nowMs / 700 + sp.userData.tw);
      sp.material.opacity = night * sp.userData.baseOp * tw * dim;
    }
  }

  return { rebuild, update };
}
