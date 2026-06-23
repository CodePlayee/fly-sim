/**
 * 起始航班选择界面：全屏覆盖层。
 * 流程：选出发机场 -> 选目的地航线（真实 OpenFlights 数据，含城市/国家/运营航司）
 *       -> 确认 -> 回调 onConfirm({ depIcao, dest })，主程序据此跳转并设定小地图导航。
 *
 * dest = { iata,icao,name,city,country,lon,lat, airlines:[{code,name}] }
 */
import { ROUTES } from './routes.js';

export function setupFlightSelect(airports, onConfirm) {
  const DEP_KEYS = Object.keys(airports);

  const overlay = document.createElement('div');
  overlay.id = 'flight-select';
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:1000; display:flex; align-items:center;
    justify-content:center; color:#dCEaff; font-family:system-ui,"PingFang SC",sans-serif;
    background:
      radial-gradient(1200px 600px at 50% -10%, rgba(40,90,160,.45), transparent 60%),
      linear-gradient(160deg, #060d18 0%, #0a1726 55%, #050a12 100%);`;
  document.body.appendChild(overlay);

  const panel = document.createElement('div');
  panel.style.cssText = `
    width:min(760px,92vw); max-height:88vh; display:flex; flex-direction:column;
    background:rgba(10,22,38,.72); border:1px solid rgba(120,180,255,.25);
    border-radius:14px; box-shadow:0 12px 48px rgba(0,0,0,.6); overflow:hidden;
    backdrop-filter:blur(8px);`;
  overlay.appendChild(panel);

  // ---- 标题 ----
  const head = document.createElement('div');
  head.style.cssText = `padding:18px 24px 10px; border-bottom:1px solid rgba(120,180,255,.15);`;
  head.innerHTML = `
    <div style="font-size:20px;font-weight:700;letter-spacing:1px;">✈ flySim 航班计划</div>
    <div style="font-size:12px;opacity:.7;margin-top:4px;">
      选择出发机场与目的地航线（真实航线数据 · OpenFlights）。确认后小地图自动导航。</div>`;
  panel.appendChild(head);

  // ---- 出发机场选择 ----
  const depRow = document.createElement('div');
  depRow.style.cssText = `display:flex; gap:10px; padding:16px 24px 8px; flex-wrap:wrap;`;
  panel.appendChild(depRow);

  const depLabel = document.createElement('div');
  depLabel.textContent = '出发机场';
  depLabel.style.cssText = 'width:100%;font-size:12px;opacity:.65;margin-bottom:2px;';
  depRow.appendChild(depLabel);

  let selectedDep = DEP_KEYS[0];
  const depBtns = {};
  for (const icao of DEP_KEYS) {
    const ap = airports[icao];
    const b = document.createElement('button');
    b.innerHTML = `<b>${icao}</b><span style="opacity:.7;font-weight:400;"> · ${ap.city || ap.name}</span>`;
    b.style.cssText = btnCss(false);
    b.onclick = () => { selectedDep = icao; renderDep(); renderDests(); };
    depBtns[icao] = b;
    depRow.appendChild(b);
  }

  // ---- 搜索框 ----
  const searchWrap = document.createElement('div');
  searchWrap.style.cssText = `padding:6px 24px 10px; display:flex; gap:10px; align-items:center;`;
  const search = document.createElement('input');
  search.type = 'text';
  search.placeholder = '搜索目的地：城市 / 国家 / IATA…';
  search.style.cssText = `
    flex:1; padding:8px 12px; border-radius:8px; font-size:13px;
    background:rgba(255,255,255,.06); color:#dCEaff;
    border:1px solid rgba(120,180,255,.25); outline:none;`;
  search.oninput = () => renderDests();
  searchWrap.appendChild(search);
  const countTag = document.createElement('span');
  countTag.style.cssText = 'font-size:11px;opacity:.6;white-space:nowrap;';
  searchWrap.appendChild(countTag);
  panel.appendChild(searchWrap);

  // ---- 目的地列表 ----
  const listWrap = document.createElement('div');
  listWrap.style.cssText = `flex:1; overflow-y:auto; padding:0 16px 8px; min-height:180px;`;
  panel.appendChild(listWrap);

  // ---- 底部：所选航班摘要 + 确认 ----
  const foot = document.createElement('div');
  foot.style.cssText = `
    padding:14px 24px; border-top:1px solid rgba(120,180,255,.15);
    display:flex; align-items:center; gap:16px;`;
  panel.appendChild(foot);

  const summary = document.createElement('div');
  summary.style.cssText = 'flex:1; font-size:13px; line-height:1.5; min-height:34px;';
  summary.innerHTML = '<span style="opacity:.6;">请选择一条航线…</span>';
  foot.appendChild(summary);

  const goBtn = document.createElement('button');
  goBtn.textContent = '开始飞行 ▶';
  goBtn.style.cssText = `
    padding:11px 26px; font-size:15px; font-weight:700; border-radius:10px;
    background:#2a6cc0; color:#fff; border:1px solid #4a8fe0; cursor:pointer;
    opacity:.45; pointer-events:none; transition:opacity .2s;`;
  goBtn.onclick = () => confirm();
  foot.appendChild(goBtn);

  let selectedDest = null;

  function btnCss(active) {
    return `padding:8px 14px; cursor:pointer; font-size:13px; border-radius:8px;
      background:${active ? '#2a6cc0' : 'rgba(255,255,255,.06)'};
      color:#dCEaff; border:1px solid ${active ? '#5a9ae8' : 'rgba(120,180,255,.22)'};
      transition:all .15s;`;
  }

  function renderDep() {
    for (const icao of DEP_KEYS) depBtns[icao].style.cssText = btnCss(icao === selectedDep);
  }

  function haversineKm(a, b) {
    const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180,
      dLon = (b.lon - a.lon) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function renderDests() {
    const dep = airports[selectedDep];
    const all = ROUTES[selectedDep] || [];
    const q = search.value.trim().toLowerCase();
    const dests = all.filter((d) => {
      if (!q) return true;
      return (d.city || '').toLowerCase().includes(q)
        || (d.country || '').toLowerCase().includes(q)
        || (d.iata || '').toLowerCase().includes(q)
        || (d.name || '').toLowerCase().includes(q);
    });
    countTag.textContent = `${dests.length} / ${all.length} 条航线`;

    listWrap.innerHTML = '';
    if (!dests.length) {
      listWrap.innerHTML = '<div style="opacity:.5;padding:24px;text-align:center;">无匹配航线</div>';
      return;
    }
    for (const d of dests) {
      const distKm = dep ? Math.round(haversineKm(dep, d)) : 0;
      const row = document.createElement('div');
      const isSel = selectedDest && selectedDest.iata === d.iata;
      row.style.cssText = rowCss(isSel);
      const airlines = (d.airlines || []).slice(0, 4)
        .map((a) => a.name || a.code).join('、');
      const more = (d.airlines || []).length > 4 ? ` 等${d.airlines.length}家` : '';
      row.innerHTML = `
        <div style="display:flex;align-items:baseline;gap:8px;">
          <b style="font-size:15px;color:#9fd0ff;">${d.iata}</b>
          <b style="font-size:14px;">${d.city || d.name}</b>
          <span style="font-size:11px;opacity:.6;">${d.country || ''}</span>
          <span style="margin-left:auto;font-size:12px;opacity:.7;font-variant-numeric:tabular-nums;">${distKm} km</span>
        </div>
        <div style="font-size:11px;opacity:.62;margin-top:3px;">运营：${airlines}${more}</div>`;
      row.onclick = () => { selectedDest = d; renderDests(); renderSummary(); };
      listWrap.appendChild(row);
    }
  }

  function rowCss(sel) {
    return `padding:10px 14px; margin:5px 0; border-radius:9px; cursor:pointer;
      background:${sel ? 'rgba(42,108,192,.32)' : 'rgba(255,255,255,.035)'};
      border:1px solid ${sel ? '#4a8fe0' : 'rgba(120,180,255,.12)'};
      transition:all .12s;`;
  }

  function renderSummary() {
    if (!selectedDest) {
      summary.innerHTML = '<span style="opacity:.6;">请选择一条航线…</span>';
      goBtn.style.opacity = '.45'; goBtn.style.pointerEvents = 'none';
      return;
    }
    const dep = airports[selectedDep];
    const d = selectedDest;
    const lead = (d.airlines && d.airlines[0]) ? (d.airlines[0].name || d.airlines[0].code) : '';
    summary.innerHTML = `
      <b style="font-size:15px;">${selectedDep}</b>
      <span style="opacity:.6;">${dep.city || ''}</span>
      <span style="margin:0 8px;color:#5a9ae8;">✈──→</span>
      <b style="font-size:15px;color:#9fd0ff;">${d.iata}</b>
      <span style="opacity:.85;">${d.city || d.name}</span>
      <span style="opacity:.55;">· ${d.country || ''}</span>
      ${lead ? `<div style="font-size:11px;opacity:.6;margin-top:3px;">${lead}${d.airlines.length > 1 ? ` 等${d.airlines.length}家航司运营` : ''}</div>` : ''}`;
    goBtn.style.opacity = '1'; goBtn.style.pointerEvents = 'auto';
  }

  function confirm() {
    if (!selectedDest) return;
    overlay.style.transition = 'opacity .4s';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 400);
    onConfirm({ depIcao: selectedDep, dest: selectedDest });
  }

  // 初始渲染
  renderDep();
  renderDests();

  return {
    show: () => { overlay.style.display = 'flex'; overlay.style.opacity = '1'; },
  };
}
