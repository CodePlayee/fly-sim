/**
 * 地形加载过渡层：选定航线起飞后、3D 地形瓦片尚在加载时，
 * 覆盖一张全屏半透明 2D 航图（大圆航线 + 出发/目的地标记 + 距离 + 进度提示）。
 * 地形就绪后整层渐隐消失。纯 2D canvas，无依赖。
 *
 * 由主循环每帧驱动：show(dep,dest) 开始，update(now, terrainReady) 推进与渐隐。
 */

const DEG = Math.PI / 180;

// 经纬度 -> 单位球向量 / 反向（用于大圆 slerp 插值）
function llToVec(lat, lon) {
  const a = lat * DEG, b = lon * DEG;
  return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
}
function vecToLL(v) {
  return { lat: Math.asin(v[2]) / DEG, lon: Math.atan2(v[1], v[0]) / DEG };
}

/** 大圆插值：dep->dest 之间 n 段，返回 {lat,lon}[]（含两端）。 */
function greatCircle(dep, dest, n = 96) {
  const a = llToVec(dep.lat, dep.lon), b = llToVec(dest.lat, dest.lon);
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  dot = Math.max(-1, Math.min(1, dot));
  const omega = Math.acos(dot);
  const pts = [];
  if (omega < 1e-6) return [{ lat: dep.lat, lon: dep.lon }, { lat: dest.lat, lon: dest.lon }];
  const sinO = Math.sin(omega);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s0 = Math.sin((1 - t) * omega) / sinO;
    const s1 = Math.sin(t * omega) / sinO;
    const v = [a[0] * s0 + b[0] * s1, a[1] * s0 + b[1] * s1, a[2] * s0 + b[2] * s1];
    const len = Math.hypot(v[0], v[1], v[2]);
    pts.push(vecToLL([v[0] / len, v[1] / len, v[2] / len]));
  }
  return pts;
}

function haversineKm(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * DEG, dLon = (b.lon - a.lon) * DEG;
  const la1 = a.lat * DEG, la2 = b.lat * DEG;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function setupLoadingMap() {
  const overlay = document.createElement('div');
  overlay.id = 'loading-map';
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:900; display:none; opacity:0;
    pointer-events:none;
    background:
      radial-gradient(1200px 700px at 50% 38%, rgba(30,70,130,.30), transparent 62%),
      linear-gradient(160deg, rgba(5,11,20,.86) 0%, rgba(8,20,34,.80) 55%, rgba(4,9,16,.88) 100%);`;
  document.body.appendChild(overlay);

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
  overlay.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let active = false, fading = false;
  let showTime = 0, fadeStart = 0;
  let dep = null, dest = null, arc = null, distKm = 0;
  let unwrapped = null; // 经度去环绕后的投影点缓存

  const MIN_MS = 700;     // 最短展示，避免闪烁
  const MAX_MS = 18000;   // 兜底：无论是否就绪都消失
  const FADE_MS = 900;

  function show(depAp, destAp) {
    if (!depAp || !destAp) return;
    dep = { lat: depAp.lat, lon: depAp.lon, code: depAp.iata || depAp.icao || '', city: depAp.city || depAp.name || '' };
    dest = { lat: destAp.lat, lon: destAp.lon, code: destAp.iata || destAp.icao || '', city: destAp.city || destAp.name || '' };
    arc = greatCircle(dep, dest, 96);
    distKm = Math.round(haversineKm(dep, dest));

    // 经度去环绕：沿弧线逐点把 lon 调整到与前点最近，跨 ±180 也连续
    unwrapped = arc.map((p) => ({ ...p }));
    for (let i = 1; i < unwrapped.length; i++) {
      let d = unwrapped[i].lon - unwrapped[i - 1].lon;
      while (d > 180) { unwrapped[i].lon -= 360; d = unwrapped[i].lon - unwrapped[i - 1].lon; }
      while (d < -180) { unwrapped[i].lon += 360; d = unwrapped[i].lon - unwrapped[i - 1].lon; }
    }

    active = true; fading = false;
    showTime = performance.now();
    overlay.style.transition = 'none';
    overlay.style.display = 'block';
    overlay.style.opacity = '1';
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  // 计算等距圆柱投影（按中纬 cos 修正经度），把整条弧线居中铺满。
  function makeProjection(w, h) {
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const p of unwrapped) {
      if (p.lon < minLon) minLon = p.lon; if (p.lon > maxLon) maxLon = p.lon;
      if (p.lat < minLat) minLat = p.lat; if (p.lat > maxLat) maxLat = p.lat;
    }
    const midLat = (minLat + maxLat) / 2;
    const cosRef = Math.max(0.2, Math.cos(midLat * DEG));
    const lonSpan = Math.max(0.5, (maxLon - minLon) * cosRef);
    const latSpan = Math.max(0.5, maxLat - minLat);
    const padX = w * 0.16, padY = h * 0.24;
    const scale = Math.min((w - padX * 2) / lonSpan, (h - padY * 2) / latSpan);
    const midLon = (minLon + maxLon) / 2;
    return (lat, lon) => {
      const x = w / 2 + (lon - midLon) * cosRef * scale;
      const y = h / 2 - (lat - midLat) * scale;
      return [x, y];
    };
  }

  function drawGraticule(ctx, w, h, project) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(120,180,255,0.08)';
    ctx.fillStyle = 'rgba(150,195,255,0.22)';
    ctx.font = '10px system-ui, sans-serif';
    // 经线/纬线每 10°（范围由弧线边界扩展取整）
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const p of unwrapped) {
      if (p.lon < minLon) minLon = p.lon; if (p.lon > maxLon) maxLon = p.lon;
      if (p.lat < minLat) minLat = p.lat; if (p.lat > maxLat) maxLat = p.lat;
    }
    const step = (maxLon - minLon > 60 || maxLat - minLat > 60) ? 20 : 10;
    const lo = (v) => Math.floor(v / step) * step - step;
    const hi = (v) => Math.ceil(v / step) * step + step;
    for (let lon = lo(minLon); lon <= hi(maxLon); lon += step) {
      const [x1, y1] = project(minLat - step, lon);
      const [x2, y2] = project(maxLat + step, lon);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    for (let lat = lo(minLat); lat <= hi(maxLat); lat += step) {
      const [x1, y1] = project(lat, minLon - step);
      const [x2, y2] = project(lat, maxLon + step);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  }

  function marker(ctx, x, y, color, code, city, above) {
    ctx.save();
    // 光晕
    const g = ctx.createRadialGradient(x, y, 0, x, y, 16);
    g.addColorStop(0, color); g.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.55; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // 实心点
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
    // 标签
    const ty = above ? y - 14 : y + 24;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eaf4ff';
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.fillText(code, x, ty);
    if (city) {
      ctx.fillStyle = 'rgba(200,224,255,.7)';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(city, x, ty + (above ? -15 : 15));
    }
    ctx.restore();
  }

  function draw(now) {
    const { w, h } = resize();
    ctx.clearRect(0, 0, w, h);
    if (!arc) return;
    const project = makeProjection(w, h);

    drawGraticule(ctx, w, h, project);

    // —— 大圆航线：底色实线 + 流动虚线 ——
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < unwrapped.length; i++) {
      const [x, y] = project(unwrapped[i].lat, unwrapped[i].lon);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,95,208,0.35)'; ctx.lineWidth = 5; ctx.stroke();

    const phase = (now / 60) % 26;
    ctx.setLineDash([14, 12]); ctx.lineDashOffset = -phase;
    ctx.strokeStyle = '#ff8fde'; ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ff5fd0'; ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur = 0;

    // —— 沿航线滑动的小飞机标记 ——
    const ft = (now / 4200) % 1;
    const idx = Math.min(unwrapped.length - 2, Math.floor(ft * (unwrapped.length - 1)));
    const [px, py] = project(unwrapped[idx].lat, unwrapped[idx].lon);
    const [nx, ny] = project(unwrapped[idx + 1].lat, unwrapped[idx + 1].lon);
    const ang = Math.atan2(ny - py, nx - px);
    ctx.save();
    ctx.translate(px, py); ctx.rotate(ang);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-3, 0); ctx.lineTo(-6, 6);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // —— 机场标记 ——
    const [dx, dy] = project(dep.lat, dep.lon);
    const [ex, ey] = project(dest.lat, dest.lon);
    marker(ctx, dx, dy, '#ffd24a', dep.code, dep.city, true);
    marker(ctx, ex, ey, '#9fd0ff', dest.code, dest.city, false);

    // —— 顶部状态条 ——
    const dots = '.'.repeat(1 + (Math.floor(now / 450) % 3));
    ctx.textAlign = 'center';
    ctx.fillStyle = '#eaf4ff';
    ctx.font = '700 22px system-ui, sans-serif';
    ctx.fillText(`${dep.code}  ✈──→  ${dest.code}`, w / 2, h * 0.13);
    ctx.fillStyle = 'rgba(190,218,255,.85)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`大圆距离 ${distKm.toLocaleString()} km`, w / 2, h * 0.13 + 26);
    ctx.fillStyle = 'rgba(160,200,255,.75)';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`地形加载中${dots}`, w / 2, h * 0.13 + 50);

    // —— 底部不确定进度条（来回扫光）——
    const barW = Math.min(360, w * 0.5), barX = (w - barW) / 2, barY = h * 0.88, barH = 4;
    ctx.fillStyle = 'rgba(120,180,255,.18)';
    ctx.fillRect(barX, barY, barW, barH);
    const sw = barW * 0.28;
    const sx = barX + (Math.sin(now / 700) * 0.5 + 0.5) * (barW - sw);
    ctx.fillStyle = 'rgba(120,200,255,.85)';
    ctx.fillRect(sx, barY, sw, barH);
  }

  /** 每帧调用。terrainReady=主程序判定的"当前机场地形是否就绪"。 */
  function update(now, terrainReady) {
    if (!active) return;
    const elapsed = now - showTime;
    if (!fading && ((terrainReady && elapsed > MIN_MS) || elapsed > MAX_MS)) {
      fading = true; fadeStart = now;
    }
    draw(now);
    if (fading) {
      const p = Math.min((now - fadeStart) / FADE_MS, 1);
      overlay.style.opacity = String(1 - p);
      if (p >= 1) { active = false; overlay.style.display = 'none'; }
    }
  }

  function isActive() { return active; }

  return { show, update, isActive };
}
