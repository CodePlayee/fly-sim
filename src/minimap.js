/**
 * 右下角导航小地图（ND, Navigation Display 风格）。
 * 顶视、北朝上：绘制机场、已飞航迹、当前位置/航向、航向矢量、距离环。
 * 纯 2D canvas，无额外依赖。坐标用等距圆柱近似（小范围足够准）。
 */

const DEG = Math.PI / 180;

export function setupMinimap(airports) {
  const SIZE = 200; // 像素
  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position:absolute; right:14px; bottom:14px; width:${SIZE}px; height:${SIZE}px;
    z-index:10; border-radius:50%; overflow:hidden;
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

  // 自动量程（公里）档位
  const RANGES = [1, 2, 5, 10, 20, 40, 80, 160];

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

    // 选择量程：保证出发机场与当前位置都能进画面
    const dep = airports[currentIcao];
    const latRad = state.lat * DEG;
    const kmPerDegLat = 111.32;
    const kmPerDegLon = 111.32 * Math.cos(latRad);

    let needKm = 1.5;
    if (dep) {
      const dxk = (dep.lon - state.lon) * kmPerDegLon;
      const dyk = (dep.lat - state.lat) * kmPerDegLat;
      needKm = Math.max(needKm, Math.hypot(dxk, dyk) * 1.25);
    }
    let rangeKm = RANGES[RANGES.length - 1];
    for (const r of RANGES) {
      if (r >= needKm) { rangeKm = r; break; }
    }
    const pxPerKm = (SIZE / 2 - 14) / rangeKm; // 半径对应 rangeKm

    // 经纬度 -> 画布像素（以飞机为中心，北朝上）
    function project(lon, lat) {
      const dxk = (lon - state.lon) * kmPerDegLon;
      const dyk = (lat - state.lat) * kmPerDegLat;
      return [cx + dxk * pxPerKm, cy - dyk * pxPerKm]; // 北(+lat)朝上
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
      // 超出圆形范围则夹到边缘箭头位置
      const dx = px - cx, dy = py - cy;
      const dist = Math.hypot(dx, dy);
      const maxR = SIZE / 2 - 12;
      let mx = px, my = py, clipped = false;
      if (dist > maxR) {
        mx = cx + (dx / dist) * maxR;
        my = cy + (dy / dist) * maxR;
        clipped = true;
      }
      const isDep = icao === currentIcao;
      ctx.fillStyle = isDep ? '#ffd24a' : '#7fb0e0';
      if (clipped) {
        // 边缘三角箭头指向机场
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 机场符号：方块 + 代码（标签上移避开中心飞机符号）
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
  }

  return { update, reset };
}
