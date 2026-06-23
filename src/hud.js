/**
 * 简易 HUD：左上仪表盘 + 右上机场/时间控制。
 */
export function setupHud(api, airports) {
  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position:absolute; inset:0; pointer-events:none; color:#cfe8ff;
    text-shadow:0 1px 2px rgba(0,0,0,.8); font-size:13px; z-index:10;`;
  document.body.appendChild(wrap);

  // 夜间压暗叠层（模拟环境光不足）
  const nightOverlay = document.createElement('div');
  nightOverlay.style.cssText = `
    position:absolute; inset:0; pointer-events:none; z-index:5;
    background:#02030a; opacity:0; transition:opacity 1.5s;`;
  document.body.appendChild(nightOverlay);

  // 近地警告：屏幕红/黄边框闪烁 + 中央横幅
  const gpwsEdge = document.createElement('div');
  gpwsEdge.style.cssText = `
    position:absolute; inset:0; pointer-events:none; z-index:7;
    box-shadow:inset 0 0 0 0 rgba(0,0,0,0); transition:box-shadow .15s;`;
  document.body.appendChild(gpwsEdge);

  const gpwsBanner = document.createElement('div');
  gpwsBanner.style.cssText = `
    position:absolute; left:50%; top:22%;
    transform:translateX(-50%); pointer-events:none; z-index:11;
    padding:8px 22px; border-radius:6px; font-weight:800; letter-spacing:2px;
    font-size:26px; display:none; text-align:center;
    font-family:"Arial Black",Arial,sans-serif;`;
  document.body.appendChild(gpwsBanner);

  // 仪表盘
  const panel = document.createElement('div');
  panel.style.cssText = `
    position:absolute; left:14px; top:14px; padding:10px 14px;
    background:rgba(8,18,32,.55); border:1px solid rgba(120,180,255,.25);
    border-radius:8px; font-variant-numeric:tabular-nums; min-width:180px;
    backdrop-filter:blur(4px);`;
  wrap.appendChild(panel);

  // 控制条
  const ctrl = document.createElement('div');
  ctrl.style.cssText = `
    position:absolute; right:14px; top:14px; padding:10px 14px;
    background:rgba(8,18,32,.55); border:1px solid rgba(120,180,255,.25);
    border-radius:8px; pointer-events:auto; backdrop-filter:blur(4px);`;
  wrap.appendChild(ctrl);

  // 机场按钮
  const apRow = document.createElement('div');
  apRow.style.marginBottom = '8px';
  for (const icao of Object.keys(airports)) {
    const b = document.createElement('button');
    b.textContent = icao;
    b.style.cssText = `margin-right:6px; padding:4px 8px; cursor:pointer;
      background:#16324f; color:#cfe8ff; border:1px solid #2c5a8a; border-radius:4px;`;
    b.onclick = () => api.goToAirport(icao);
    apRow.appendChild(b);
  }
  ctrl.appendChild(apRow);

  // 时间滑块
  const timeLabel = document.createElement('div');
  timeLabel.textContent = '当地时间';
  timeLabel.style.fontSize = '12px';
  ctrl.appendChild(timeLabel);
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '24';
  slider.step = '0.5';
  slider.value = '12';
  slider.style.width = '180px';
  slider.oninput = () => {
    api.setLocalHour(parseFloat(slider.value));
    timeLabel.textContent = `当地时间 ${slider.value} 时`;
  };
  ctrl.appendChild(slider);

  // 实时按钮
  const realBtn = document.createElement('button');
  realBtn.textContent = '↻ 真实当前时间';
  realBtn.style.cssText = `margin-top:6px; padding:4px 8px; cursor:pointer; display:block;
    background:#16324f; color:#cfe8ff; border:1px solid #2c5a8a; border-radius:4px;`;
  realBtn.onclick = () => {
    api.setRealTime();
    timeLabel.textContent = '当地时间（实时）';
  };
  ctrl.appendChild(realBtn);

  // 帮助
  const help = document.createElement('div');
  help.style.cssText = 'margin-top:8px; font-size:11px; opacity:.8; line-height:1.5;';
  help.innerHTML = '↑↓ 俯仰 · ←→ 滚转 · W/S 油门 · A/D 方向舵 · V 视角';
  ctrl.appendChild(help);

  function update() {
    const s = api.getState();
    panel.innerHTML = `
      <div style="font-size:15px;font-weight:600;margin-bottom:4px;">${s.airport}</div>
      <div>空速 &nbsp;<b>${s.speedKt}</b> kt</div>
      <div>高度 &nbsp;<b>${s.alt}</b> m</div>
      <div>航向 &nbsp;<b>${String(s.headingDeg).padStart(3,'0')}</b>°</div>
      <div>离地 &nbsp;<b id="hud-agl">--</b> m</div>
      <div>状态 &nbsp;<b>${s.onGround ? '地面' : '空中'}</b></div>`;
  }

  // 近地警告状态显示（含闪烁）
  let blinkOn = false;
  let lastBlink = 0;
  function setGPWS(info, nowMs) {
    const aglEl = document.getElementById('hud-agl');
    if (aglEl && info && isFinite(info.aglHere)) {
      aglEl.textContent = Math.max(0, Math.round(info.aglHere));
      aglEl.style.color =
        info.level === 'warning' ? '#ff5252' :
        info.level === 'caution' ? '#ffd24a' : '#cfe8ff';
    }

    const level = info ? info.level : 'none';
    if (level === 'none') {
      gpwsEdge.style.boxShadow = 'inset 0 0 0 0 rgba(0,0,0,0)';
      gpwsBanner.style.display = 'none';
      return;
    }

    // 警告闪烁频率：warning 更快
    const period = level === 'warning' ? 350 : 650;
    if (nowMs - lastBlink > period) {
      blinkOn = !blinkOn;
      lastBlink = nowMs;
    }

    const color = level === 'warning' ? '255,60,60' : '255,200,60';
    gpwsEdge.style.boxShadow = blinkOn
      ? `inset 0 0 60px 14px rgba(${color},0.85)`
      : `inset 0 0 30px 6px rgba(${color},0.35)`;

    gpwsBanner.style.display = 'block';
    gpwsBanner.textContent = info.text + (level === 'warning' ? ' ▲' : '');
    gpwsBanner.style.background = level === 'warning' ? 'rgba(180,0,0,0.92)' : 'rgba(150,110,0,0.9)';
    gpwsBanner.style.color = level === 'warning' ? '#fff' : '#fff7d6';
    gpwsBanner.style.border = `2px solid rgba(${color},1)`;
    gpwsBanner.style.opacity = blinkOn ? '1' : '0.55';
  }

  // 根据太阳高度角设置夜间压暗强度
  function setNightOverlay(sunAltDeg) {
    let op = 0;
    if (sunAltDeg <= -10) op = 0.55;
    else if (sunAltDeg <= -2) op = 0.35 - (sunAltDeg + 10) * 0.025;
    else if (sunAltDeg <= 6) op = Math.max(0, (6 - sunAltDeg) * 0.02);
    nightOverlay.style.opacity = String(Math.max(0, Math.min(0.6, op)));
  }

  return { update, setNightOverlay, setGPWS };
}
