/**
 * 右下角导航小地图（ND, Navigation Display 风格）。
 * 顶视、北朝上：绘制机场、已飞航迹、当前位置/航向、到目标的航线（虚线）、方位/距离。
 * 支持点击地图设定自定义航点（WPT）；双击清除回到默认目标机场。
 * 纯 2D canvas，无额外依赖。坐标用等距圆柱近似（小范围足够准）。
 */

const DEG = Math.PI / 180;

export function setupMinimap(airports) {
  const SIZE = 200; // 像素
  const wrap = document.createElement('div');
  wrap.id = 'nd-minimap';
  wrap.style.cssText = `
    position:absolute; right:14px; bottom:14px; width:${SIZE}px; height:${SIZE}px;
    z-index:10; border-radius:50%; overflow:hidden; cursor:crosshair;
    border:2px solid rgba(120,180,255,.45);
    box-shadow:0 2px 12px rgba(0,0,0,.5);
    background:radial-gradient(circle at 50% 50%, #0c2138 0%, #07111f 100%);`;
  document.body.appendChild(wrap);

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  canvas.style.cssText = `width:${SIZE}px; height:${SIZE}px;`;
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 量程标签
  const label = document.createElement('div');
  label.style.cssText = `
    position:absolute; left:8px; bottom:6px; font-size:10px; color:#9fc2e8;
    text-shadow:0 1px 2px #000; pointer-events:none; font-variant-numeric:tabular-nums;`;
  wrap.appendChild(label);

  // 目标方位/距离标签（左上）
  const tgtLabel = document.createElement('div');
  tgtLabel.id = 'nd-target';
  tgtLabel.style.cssText = `
    position:absolute; left:8px; top:22px; font-size:10px; color:#ff9ad8;
    text-shadow:0 1px 2px #000; pointer-events:none; font-variant-numeric:tabular-nums;
    line-height:1.4;`;
  wrap.appendChild(tgtLabel);

  // 标题
  const title = document.createElement('div');
  title.textContent = 'ND · 北朝上';
  title.style.cssText = `
    position:absolute; left:0; right:0; top:6px; text-align:center;
    font-size:10px; color:#9fc2e8; text-shadow:0 1px 2px #000; pointer-events:none;`;
  wrap.appendChild(title);

  const cx = SIZE / 2;
  const cy = SIZE / 2;

  // 已飞航迹（经纬度采样点）
  const trail = [];
  let lastSample = 0;

  // 自定义航点（点击设定）；为 null 时目标=最近的其它机场
  let manualWaypoint = null;
  // 航班计划目的地（由起始选择界面设定）：{icao,iata,name,city,lon,lat}
  let flightDest = null;
  // 保存最近一帧的投影参数，供点击反投影使用
  let lastProj = null;

  // 自动量程（公里）档位（扩到洲际 ~13000km）
  const RANGES = [1, 2, 5, 10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240, 13000];

  // ---- 交互：点击设航点，双击清除 ----
  function pixelToLonLat(clientX, clientY) {
    if (!lastProj) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const dxk = (px - cx) / lastProj.pxPerKm;
    const dyk = -(py - cy) / lastProj.pxPerKm; // 屏幕下=南
    const lon = lastProj.aLon + dxk / lastProj.kmPerDegLon;
    const lat = lastProj.aLat + dyk / lastProj.kmPerDegLat;
    return { lon, lat };
  }

  wrap.addEventListener('click', (e) => {
    const ll = pixelToLonLat(e.clientX, e.clientY);
    if (ll) manualWaypoint = { lon: ll.lon, lat: ll.lat };
  });
  wrap.addEventListener('dblclick', (e) => {
    e.preventDefault();
    manualWaypoint = null; // 清除自定义航点，回到默认目标机场
  });

  /** 计算目标：自定义航点 > 航班计划目的地 > 最近的其它机场 */
  function resolveTarget(state, currentIcao, kmPerDegLon, kmPerDegLat) {
    if (manualWaypoint) {
      return { name: 'WPT', lon: manualWaypoint.lon, lat: manualWaypoint.lat, custom: true };
    }
    if (flightDest) {
      return {
        name: flightDest.iata || flightDest.icao || '目的地',
        lon: flightDest.lon, lat: flightDest.lat, custom: false,
      };
    }
    let best = null;
    let bestD = Infinity;
    for (const icao of Object.keys(airports)) {
      if (icao === currentIcao) continue;
      const ap = airports[icao];
      const dxk = (ap.lon - state.lon) * kmPerDegLon;
      const dyk = (ap.lat - state.lat) * kmPerDegLat;
      const d = Math.hypot(dxk, dyk);
      if (d < bestD) { bestD = d; best = { name: icao, lon: ap.lon, lat: ap.lat, custom: false }; }
    }
    return best;
  }

  /**
   * @param state {lon,lat,headingDeg,onGround,alt}
   * @param currentIcao 当前出发机场代码
   * @param nowMs
   */
  function update(state, currentIcao, nowMs) {
    if (!state) return;

    // 采样航迹（约每 1s 一点，最多 600 点）
    if (nowMs - lastSample > 1000) {
      lastSample = nowMs;
      const lastP = trail[trail.length - 1];
      if (!lastP || Math.abs(lastP.lon - state.lon) > 1e-6 || Math.abs(lastP.lat - state.lat) > 1e-6) {
        trail.push({ lon: state.lon, lat: state.lat });
        if (trail.length > 600) trail.shift();
      }
    }

    const latRad = state.lat * DEG;
    const kmPerDegLat = 111.32;
    const kmPerDegLon = 111.32 * Math.cos(latRad);

    const target = resolveTarget(state, currentIcao, kmPerDegLon, kmPerDegLat);

    // 选择量程：保证出发机场与目标都能进画面
    const dep = airports[currentIcao];
    let needKm = 1.5;
    if (dep) {
      const dxk = (dep.lon - state.lon) * kmPerDegLon;
      const dyk = (dep.lat - state.lat) * kmPerDegLat;
      needKm = Math.max(needKm, Math.hypot(dxk, dyk) * 1.25);
    }
    if (target) {
      const dxk = (target.lon - state.lon) * kmPerDegLon;
      const dyk = (target.lat - state.lat) * kmPerDegLat;
      needKm = Math.max(needKm, Math.hypot(dxk, dyk) * 1.18);
    }
    let rangeKm = RANGES[RANGES.length - 1];
    for (const r of RANGES) {
      if (r >= needKm) { rangeKm = r; break; }
    }
    const pxPerKm = (SIZE / 2 - 14) / rangeKm; // 半径对应 rangeKm

    // 存投影参数供点击反投影
    lastProj = { aLon: state.lon, aLat: state.lat, pxPerKm, kmPerDegLon, kmPerDegLat };

    // 经纬度 -> 画布像素（以飞机为中心，北朝上）
    function project(lon, lat) {
      const dxk = (lon - state.lon) * kmPerDegLon;
      const dyk = (lat - state.lat) * kmPerDegLat;
      return [cx + dxk * pxPerKm, cy - dyk * pxPerKm]; // 北(+lat)朝上
    }
    const maxR = SIZE / 2 - 12;
    function clampToRim(px, py) {
      const dx = px - cx, dy = py - cy;
      const d = Math.hypot(dx, dy);
      if (d <= maxR) return [px, py, false];
      return [cx + (dx / d) * maxR, cy + (dy / d) * maxR, true];
    }

    // ---- 清屏 ----
    ctx.clearRect(0, 0, SIZE, SIZE);

    // ---- 距离环 ----
    ctx.strokeStyle = 'rgba(120,170,230,0.22)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (SIZE / 2 - 14) * (i / 2), 0, Math.PI * 2);
      ctx.stroke();
    }
    // 十字
    ctx.beginPath();
    ctx.moveTo(cx, 8); ctx.lineTo(cx, SIZE - 8);
    ctx.moveTo(8, cy); ctx.lineTo(SIZE - 8, cy);
    ctx.strokeStyle = 'rgba(120,170,230,0.12)';
    ctx.stroke();

    // 北标记 N
    ctx.fillStyle = '#9fc2e8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, 20);

    // ---- 到目标的航线（品红虚线）----
    if (target) {
      const [tpxRaw, tpyRaw] = project(target.lon, target.lat);
      const [tpx, tpy, tClipped] = clampToRim(tpxRaw, tpyRaw);

      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tpx, tpy);
      ctx.strokeStyle = 'rgba(255,120,210,0.95)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 目标符号：菱形 + 名称
      ctx.save();
      ctx.translate(tpx, tpy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = target.custom ? '#ff7ad2' : '#ff9ad8';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
      if (!tClipped) {
        ctx.fillStyle = '#ffc4ea';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(target.name, tpx + 7, tpy - 6);
      }

      // 方位/距离计算（平面近似，距离够小足够准）
      const dxk = (target.lon - state.lon) * kmPerDegLon;
      const dyk = (target.lat - state.lat) * kmPerDegLat;
      const distKm = Math.hypot(dxk, dyk);
      let brg = Math.atan2(dxk, dyk) / DEG; // 0=N, 顺时针
      brg = (brg + 360) % 360;
      // 相对方位（目标方位 - 当前航向），用于"该往左/右转多少"
      let rel = brg - ((state.headingDeg || 0) % 360);
      rel = ((rel + 540) % 360) - 180; // -180..180
      const turn = rel > 1 ? `右${Math.round(rel)}°` : rel < -1 ? `左${Math.round(-rel)}°` : '对准';
      const distStr = distKm >= 10 ? distKm.toFixed(0) : distKm.toFixed(1);
      tgtLabel.innerHTML =
        `→ ${target.name}<br>方位 ${String(Math.round(brg)).padStart(3, '0')}° ${turn}<br>距离 ${distStr} km`;
    } else {
      tgtLabel.innerHTML = '';
    }

    // ---- 已飞航迹 ----
    if (trail.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < trail.length; i++) {
        const [px, py] = project(trail[i].lon, trail[i].lat);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(110,235,150,0.95)';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // ---- 机场 ----
    for (const icao of Object.keys(airports)) {
      const ap = airports[icao];
      const [px, py] = project(ap.lon, ap.lat);
      const [mx, my, clipped] = clampToRim(px, py);
      const isDep = icao === currentIcao;
      ctx.fillStyle = isDep ? '#ffd24a' : '#7fb0e0';
      if (clipped) {
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(mx - 3, my - 3, 6, 6);
        ctx.fillStyle = isDep ? '#ffe49a' : '#bcd6f0';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(icao, mx + 6, my - 5);
      }
    }

    // ---- 航向矢量（从飞机指向前方）----
    const hdg = (state.headingDeg || 0) * DEG;
    const vlen = SIZE / 2 - 16;
    const vx = cx + Math.sin(hdg) * vlen;
    const vy = cy - Math.cos(hdg) * vlen;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vx, vy);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ---- 飞机符号（中心，按航向旋转的三角）----
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(hdg);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2a4d8f';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // ---- 量程标签 ----
    label.textContent = `量程 ${rangeKm} km`;
  }

  function reset() {
    trail.length = 0;
    manualWaypoint = null;
  }

  /** 设定航班计划目的地（起始选择界面）。dest={icao,iata,name,city,lon,lat} 或 null 清除 */
  function setFlightPlan(dest) {
    flightDest = dest || null;
    manualWaypoint = null; // 新航班覆盖手动航点
  }

  return { update, reset, setFlightPlan };
}
