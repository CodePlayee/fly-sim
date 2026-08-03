/**
 * 起始航班选择界面：全屏覆盖层（可被 hud "换机场" 重新打开）。
 * 流程：选出发机场（内置快捷 + 全球在线搜索）-> 选目的地航线（在线真实 OpenFlights 数据，
 *       失败回退内置 ROUTES）-> 确认 -> 回调 onConfirm({ depIcao, dep, dest })。
 *
 * dest = { iata,icao,name,city,country,lon,lat, airlines:[{code,name}] }
 */
import { ROUTES } from './routes.js';
import { BUILTIN_KEYS, DEFAULT_DEST_IATA, makeAirport, registerAirport } from './airports.js';
import { searchAirports, getRunwayHeading, getRoutesFrom } from './dataSource.js';

export function setupFlightSelect(airports, onConfirm) {
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
      选择出发机场（内置快捷或在线搜索全球）与目的地航线（真实航线数据 · OpenFlights）。</div>`;
  panel.appendChild(head);

  // ---- 出发机场：内置快捷按钮 ----
  const depRow = document.createElement('div');
  depRow.style.cssText = `display:flex; gap:10px; padding:16px 24px 4px; flex-wrap:wrap;`;
  panel.appendChild(depRow);

  const depLabel = document.createElement('div');
  depLabel.textContent = '出发机场';
  depLabel.style.cssText = 'width:100%;font-size:12px;opacity:.65;margin-bottom:2px;';
  depRow.appendChild(depLabel);

  let selectedDep = BUILTIN_KEYS[0];
  let depAirport = airports[selectedDep];
  const depBtns = {};
  for (const icao of BUILTIN_KEYS) {
    const ap = airports[icao];
    const b = document.createElement('button');
    b.innerHTML = `<b>${icao}</b><span style="opacity:.7;font-weight:400;"> · ${ap.city || ap.name}</span>`;
    b.style.cssText = btnCss(false);
    b.onclick = () => selectDep(icao, airports[icao]);
    depBtns[icao] = b;
    depRow.appendChild(b);
  }

  // ---- 出发机场：全球在线搜索 ----
  const depSearchWrap = document.createElement('div');
  depSearchWrap.style.cssText = `padding:4px 24px 6px; position:relative;`;
  const depSearch = document.createElement('input');
  depSearch.type = 'text';
  depSearch.placeholder = '在线搜索出发机场：城市 / 国家 / IATA / ICAO…';
  depSearch.style.cssText = inputCss();
  depSearchWrap.appendChild(depSearch);
  // 下拉建议列表
  const depSug = document.createElement('div');
  depSug.style.cssText = `
    position:absolute; left:24px; right:24px; top:100%; z-index:5; max-height:260px;
    overflow-y:auto; background:#0c1c30; border:1px solid rgba(120,180,255,.3);
    border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,.5); display:none;`;
  depSearchWrap.appendChild(depSug);
  panel.appendChild(depSearchWrap);

  // ---- 目的地标题 + 搜索 ----
  const searchWrap = document.createElement('div');
  searchWrap.style.cssText = `padding:8px 24px 10px; display:flex; gap:10px; align-items:center;`;
  const search = document.createElement('input');
  search.type = 'text';
  search.placeholder = '过滤目的地：城市 / 国家 / IATA…';
  search.style.cssText = inputCss();
  search.style.flex = '1';
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
  let destList = [];        // 当前出发机场的目的地（在线或内置离线）
  let destOffline = false;  // 当前列表是否来自内置离线数据（在线到达后会被替换）
  let depReqSeq = 0;        // 防止异步竞态：仅最后一次出发选择的航线生效

  function inputCss() {
    return `width:100%; box-sizing:border-box; padding:8px 12px; border-radius:8px;
      font-size:13px; background:rgba(255,255,255,.06); color:#dCEaff;
      border:1px solid rgba(120,180,255,.25); outline:none;`;
  }
  function btnCss(active) {
    return `padding:8px 14px; cursor:pointer; font-size:13px; border-radius:8px;
      background:${active ? '#2a6cc0' : 'rgba(255,255,255,.06)'};
      color:#dCEaff; border:1px solid ${active ? '#5a9ae8' : 'rgba(120,180,255,.22)'};
      transition:all .15s;`;
  }
  function rowCss(sel) {
    return `padding:10px 14px; margin:5px 0; border-radius:9px; cursor:pointer;
      background:${sel ? 'rgba(42,108,192,.32)' : 'rgba(255,255,255,.035)'};
      border:1px solid ${sel ? '#4a8fe0' : 'rgba(120,180,255,.12)'};
      transition:all .12s;`;
  }

  function renderDep() {
    for (const icao of BUILTIN_KEYS) {
      depBtns[icao].style.cssText = btnCss(icao === selectedDep);
    }
  }

  function haversineKm(a, b) {
    const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180,
      dLon = (b.lon - a.lon) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // ---- 出发机场选择（内置或在线搜索结果）----
  // 策略：**离线优先、在线增补**。内置机场（含默认的 VHHH）在 src/routes.js 里已有
  // 完整航线，先同步渲染出来（0 网络等待、可立即开飞）；在线的 OpenFlights 全量数据
  // 到达后再无缝替换列表，并按 IATA 复位已选中的目的地。
  // 旧实现是先 await 在线三份 CSV（~860KB gzip，跨域 raw.githubusercontent.com）
  // 才渲染，把内置数据只当失败兜底，导致首屏白等一个完整往返。
  async function selectDep(icao, ap, opts = {}) {
    selectedDep = icao;
    depAirport = ap || airports[icao];
    selectedDest = null;
    renderDep();
    const seq = ++depReqSeq;

    // ① 内置离线航线：同步立即渲染
    const offline = ROUTES[icao];
    if (offline && offline.length) {
      destList = offline;
      destOffline = true;
      if (opts.preselectIata) {
        selectedDest = offline.find((d) => d.iata === opts.preselectIata) || null;
      }
      renderDests();
    } else {
      destList = [];
      destOffline = false;
      listWrap.innerHTML = '<div style="opacity:.6;padding:24px;text-align:center;">正在加载航线…</div>';
      countTag.textContent = '';
    }
    renderSummary();

    // ② 在线真实航线：到达后替换（保持当前选中的目的地）
    let list = null;
    try {
      list = await getRoutesFrom(icao);
    } catch (e) {
      list = null; // 在线失败 -> 保留离线列表
    }
    if (seq !== depReqSeq) return; // 已被新的选择取代

    if (list && list.length) {
      const keep = selectedDest && selectedDest.iata;
      destList = list;
      destOffline = false;
      if (keep) selectedDest = list.find((d) => d.iata === keep) || selectedDest;
      renderDests();
      renderSummary();
    } else if (!destList.length) {
      listWrap.innerHTML = '<div style="opacity:.6;padding:24px;text-align:center;">'
        + '航线数据加载失败，请检查网络后重选出发机场。</div>';
    }
  }

  // ---- 出发机场在线搜索（防抖）----
  let depSearchTimer = null;
  let depSearchSeq = 0;
  depSearch.oninput = () => {
    clearTimeout(depSearchTimer);
    const q = depSearch.value.trim();
    if (q.length < 2) { depSug.style.display = 'none'; return; }
    depSearchTimer = setTimeout(() => runDepSearch(q), 250);
  };
  depSearch.onblur = () => setTimeout(() => { depSug.style.display = 'none'; }, 150);
  depSearch.onfocus = () => { if (depSug.children.length) depSug.style.display = 'block'; };

  async function runDepSearch(q) {
    const seq = ++depSearchSeq;
    depSug.innerHTML = '<div style="padding:10px 14px;opacity:.6;">搜索中…</div>';
    depSug.style.display = 'block';
    let results = [];
    try {
      results = await searchAirports(q, 30);
    } catch (e) {
      if (seq !== depSearchSeq) return;
      depSug.innerHTML = '<div style="padding:10px 14px;opacity:.6;">搜索失败（网络）。仅可用内置机场。</div>';
      return;
    }
    if (seq !== depSearchSeq) return;
    if (!results.length) {
      depSug.innerHTML = '<div style="padding:10px 14px;opacity:.6;">无匹配机场</div>';
      return;
    }
    depSug.innerHTML = '';
    for (const r of results) {
      const item = document.createElement('div');
      item.style.cssText = `padding:9px 14px; cursor:pointer; border-bottom:1px solid rgba(120,180,255,.08);`;
      item.onmouseenter = () => item.style.background = 'rgba(42,108,192,.3)';
      item.onmouseleave = () => item.style.background = 'transparent';
      const code = r.icao || r.iata || '????';
      item.innerHTML = `
        <span style="color:#9fd0ff;font-weight:700;">${code}</span>
        <span style="margin-left:8px;">${r.city || r.name}</span>
        <span style="font-size:11px;opacity:.55;margin-left:6px;">${r.country || ''}</span>`;
      // mousedown 先于 blur，确保点击生效
      item.onmousedown = (ev) => { ev.preventDefault(); pickDepFromSearch(r); };
      depSug.appendChild(item);
    }
  }

  // 选定一个在线搜索机场作为出发点：补跑道航向 + 注册 + 切换
  async function pickDepFromSearch(record) {
    depSug.style.display = 'none';
    depSearch.value = `${record.icao || record.iata} · ${record.city || record.name}`;
    const icao = record.icao || record.iata;
    listWrap.innerHTML = '<div style="opacity:.6;padding:24px;text-align:center;">正在获取机场跑道数据…</div>';
    let heading = null;
    try {
      if (record.icao) heading = await getRunwayHeading(record.icao);
    } catch (e) { heading = null; }
    const ap = registerAirport(makeAirport(record, heading));
    airports[ap.icao] = ap; // 并入传入的注册表引用
    // 内置按钮取消高亮（当前出发为搜索结果）
    selectedDep = ap.icao;
    for (const k of BUILTIN_KEYS) depBtns[k].style.cssText = btnCss(false);
    await selectDep(ap.icao, ap);
  }

  // ---- 目的地列表渲染 ----
  function renderDests() {
    const dep = depAirport;
    const all = destList || [];
    const q = search.value.trim().toLowerCase();
    const dests = all.filter((d) => {
      if (!q) return true;
      return (d.city || '').toLowerCase().includes(q)
        || (d.country || '').toLowerCase().includes(q)
        || (d.iata || '').toLowerCase().includes(q)
        || (d.name || '').toLowerCase().includes(q);
    });
    const offline = destOffline ? '（内置离线数据 · 在线航线加载中…）' : '';
    countTag.textContent = `${dests.length} / ${all.length} 条航线 ${offline}`;

    listWrap.innerHTML = '';
    if (!dests.length) {
      listWrap.innerHTML = '<div style="opacity:.5;padding:24px;text-align:center;">无匹配航线</div>';
      return;
    }
    let selRow = null;
    for (const d of dests) {
      const distKm = dep ? Math.round(haversineKm(dep, d)) : 0;
      const row = document.createElement('div');
      const isSel = selectedDest && selectedDest.iata === d.iata;
      row.style.cssText = rowCss(isSel);
      if (isSel) selRow = row;
      const airlines = (d.airlines || []).slice(0, 4)
        .map((a) => a.name || a.code).join('、');
      const more = (d.airlines || []).length > 4 ? ` 等${d.airlines.length}家` : '';
      row.innerHTML = `
        <div style="display:flex;align-items:baseline;gap:8px;">
          <b style="font-size:15px;color:#9fd0ff;">${d.iata || d.icao}</b>
          <b style="font-size:14px;">${d.city || d.name}</b>
          <span style="font-size:11px;opacity:.6;">${d.country || ''}</span>
          <span style="margin-left:auto;font-size:12px;opacity:.7;font-variant-numeric:tabular-nums;">${distKm} km</span>
        </div>
        <div style="font-size:11px;opacity:.62;margin-top:3px;">运营：${airlines}${more}</div>`;
      row.onclick = () => { selectedDest = d; renderDests(); renderSummary(); };
      listWrap.appendChild(row);
    }
    // 默认预选项（如杭州）可能排在列表深处，滚动到可见处
    if (selRow) listWrap.scrollTop = Math.max(0, selRow.offsetTop - listWrap.clientHeight / 2);
  }

  function renderSummary() {
    if (!selectedDest) {
      summary.innerHTML = '<span style="opacity:.6;">请选择一条航线…</span>';
      goBtn.style.opacity = '.45'; goBtn.style.pointerEvents = 'none';
      return;
    }
    const dep = depAirport;
    const d = selectedDest;
    const lead = (d.airlines && d.airlines[0]) ? (d.airlines[0].name || d.airlines[0].code) : '';
    summary.innerHTML = `
      <b style="font-size:15px;">${selectedDep}</b>
      <span style="opacity:.6;">${(dep && dep.city) || ''}</span>
      <span style="margin:0 8px;color:#5a9ae8;">✈──→</span>
      <b style="font-size:15px;color:#9fd0ff;">${d.iata || d.icao}</b>
      <span style="opacity:.85;">${d.city || d.name}</span>
      <span style="opacity:.55;">· ${d.country || ''}</span>
      ${lead ? `<div style="font-size:11px;opacity:.6;margin-top:3px;">${lead}${d.airlines.length > 1 ? ` 等${d.airlines.length}家航司运营` : ''}</div>` : ''}`;
    goBtn.style.opacity = '1'; goBtn.style.pointerEvents = 'auto';
  }

  function confirm() {
    if (!selectedDest) return;
    overlay.style.transition = 'opacity .4s';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 400); // 隐藏而非移除，可重开
    onConfirm({ depIcao: selectedDep, dep: depAirport, dest: selectedDest });
  }

  // 初始渲染：默认航班 = 香港 VHHH ✈──→ 杭州 HGH。
  // 出发/目的地都来自内置离线数据，界面**同步**就绪、「开始飞行」立即可点，
  // 无需等待任何网络请求；在线全量航线到达后再静默替换列表。
  renderDep();
  selectDep(selectedDep, depAirport, { preselectIata: DEFAULT_DEST_IATA });

  return {
    show: () => {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
    },
  };
}
