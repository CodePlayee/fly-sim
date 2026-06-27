/**
 * 运行时机场/航线数据层（在线请求，无需 token/API key）。
 *
 * 数据源（均返回 access-control-allow-origin:*，浏览器可直接 fetch）：
 *   - 机场库：OpenFlights airports.dat —— 单文件即含坐标、时区(UTC偏移)、标高(英尺)
 *   - 跑道航向：OurAirports runways.csv —— le_heading_degT（按 ICAO ident 关联）
 *   - 航线：OpenFlights routes.dat + airlines.dat
 *
 * 设计原则：
 *   - 惰性：每个数据源首次被需要时才 fetch，解析结果在会话内内存缓存。
 *   - 降级：任一 fetch 失败抛出 DataSourceError，调用方回退到内置离线数据。
 *   - 同构：getRoutesFrom 返回结构与内置 src/routes.js 的 ROUTES[icao] 一致，
 *           flightSelect 可零改动复用渲染逻辑。
 */

const SRC = {
  airports: 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
  routes: 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat',
  airlines: 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat',
  runways: 'https://davidmegginson.github.io/ourairports-data/runways.csv',
};

const FT_TO_M = 0.3048;

/**
 * 中文 -> 英文别名表。OpenFlights 数据城市/国家均为拉丁文，
 * 用户输入中文时先在此映射，再用英文去匹配。覆盖主要城市与国家。
 * 值为子串，匹配时用 includes（如"北京"->"beijing" 命中 Beijing Capital…）。
 */
const ZH_ALIAS = {
  // —— 中国大陆主要城市 ——
  '北京': 'beijing', '上海': 'shanghai', '广州': 'guangzhou', '深圳': 'shenzhen',
  '成都': 'chengdu', '重庆': 'chongqing', '杭州': 'hangzhou', '西安': 'xian',
  '南京': 'nanjing', '武汉': 'wuhan', '长沙': 'changsha', '青岛': 'qingdao',
  '厦门': 'xiamen', '昆明': 'kunming', '大连': 'dalian', '天津': 'tianjin',
  '郑州': 'zhengzhou', '沈阳': 'shenyang', '哈尔滨': 'harbin', '济南': 'jinan',
  '三亚': 'sanya', '海口': 'haikou', '乌鲁木齐': 'urumqi', '拉萨': 'lhasa',
  '桂林': 'guilin', '贵阳': 'guiyang', '南宁': 'nanning', '福州': 'fuzhou',
  '宁波': 'ningbo', '无锡': 'wuxi', '温州': 'wenzhou', '珠海': 'zhuhai',
  // —— 港澳台 ——
  '香港': 'hong kong', '澳门': 'macau', '台北': 'taipei', '高雄': 'kaohsiung',
  '台中': 'taichung',
  // —— 亚洲 ——
  '东京': 'tokyo', '大阪': 'osaka', '名古屋': 'nagoya', '札幌': 'sapporo',
  '福冈': 'fukuoka', '首尔': 'seoul', '釜山': 'busan', '曼谷': 'bangkok',
  '普吉': 'phuket', '新加坡': 'singapore', '吉隆坡': 'kuala lumpur',
  '雅加达': 'jakarta', '巴厘': 'denpasar', '马尼拉': 'manila', '河内': 'hanoi',
  '胡志明': 'ho chi minh', '金边': 'phnom penh', '仰光': 'yangon',
  '新德里': 'delhi', '德里': 'delhi', '孟买': 'mumbai', '迪拜': 'dubai',
  '阿布扎比': 'abu dhabi', '多哈': 'doha', '伊斯坦布尔': 'istanbul',
  '特拉维夫': 'tel aviv', '科伦坡': 'colombo', '加德满都': 'kathmandu',
  // —— 欧洲 ——
  '伦敦': 'london', '巴黎': 'paris', '法兰克福': 'frankfurt', '慕尼黑': 'munich',
  '柏林': 'berlin', '阿姆斯特丹': 'amsterdam', '罗马': 'rome', '米兰': 'milan',
  '马德里': 'madrid', '巴塞罗那': 'barcelona', '苏黎世': 'zurich', '日内瓦': 'geneva',
  '维也纳': 'vienna', '布鲁塞尔': 'brussels', '哥本哈根': 'copenhagen',
  '斯德哥尔摩': 'stockholm', '奥斯陆': 'oslo', '赫尔辛基': 'helsinki',
  '莫斯科': 'moscow', '雅典': 'athens', '里斯本': 'lisbon', '都柏林': 'dublin',
  '华沙': 'warsaw', '布拉格': 'prague', '日内瓦': 'geneva',
  // —— 美洲 ——
  '纽约': 'new york', '洛杉矶': 'los angeles', '旧金山': 'san francisco',
  '芝加哥': 'chicago', '西雅图': 'seattle', '波士顿': 'boston', '华盛顿': 'washington',
  '拉斯维加斯': 'las vegas', '迈阿密': 'miami', '休斯顿': 'houston',
  '达拉斯': 'dallas', '亚特兰大': 'atlanta', '多伦多': 'toronto',
  '温哥华': 'vancouver', '墨西哥城': 'mexico city', '圣保罗': 'sao paulo',
  '里约': 'rio de janeiro', '布宜诺斯艾利斯': 'buenos aires',
  // —— 大洋洲/非洲 ——
  '悉尼': 'sydney', '墨尔本': 'melbourne', '布里斯班': 'brisbane',
  '奥克兰': 'auckland', '开罗': 'cairo', '约翰内斯堡': 'johannesburg',
  '内罗毕': 'nairobi', '开普敦': 'cape town',
  // —— 国家 ——
  '中国': 'china', '日本': 'japan', '韩国': 'korea', '泰国': 'thailand',
  '美国': 'united states', '英国': 'united kingdom', '法国': 'france',
  '德国': 'germany', '意大利': 'italy', '西班牙': 'spain', '澳大利亚': 'australia',
  '加拿大': 'canada', '俄罗斯': 'russia', '印度': 'india', '新西兰': 'new zealand',
  '荷兰': 'netherlands', '瑞士': 'switzerland', '新加坡国': 'singapore',
  '马来西亚': 'malaysia', '印尼': 'indonesia', '越南': 'vietnam',
  '阿联酋': 'united arab emirates',
};

/**
 * 把含中文的查询翻译成英文匹配词。逐条子串替换；纯英文输入原样返回。
 */
function expandQuery(q) {
  if (!/[一-龥]/.test(q)) return q; // 无中文字符
  for (const [zh, en] of Object.entries(ZH_ALIAS)) {
    if (q.includes(zh)) return en; // 命中即返回对应英文（取首个）
  }
  return q; // 中文但无别名，原样（基本搜不到，UI 会提示无匹配）
}

export class DataSourceError extends Error {
  constructor(msg, cause) { super(msg); this.name = 'DataSourceError'; this.cause = cause; }
}

// ---- CSV 行解析（字段含引号包裹、引号内可能有逗号）。来自 build_routes.mjs ----
function parseCSVLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function num(s) { const v = parseFloat(s); return Number.isFinite(v) ? v : null; }

// ---- 带缓存的文本 fetch ----
const _textCache = new Map();
async function fetchText(url) {
  if (_textCache.has(url)) return _textCache.get(url);
  let res;
  try {
    res = await fetch(url, { mode: 'cors' });
  } catch (e) {
    throw new DataSourceError(`网络请求失败: ${url}`, e);
  }
  if (!res.ok) throw new DataSourceError(`HTTP ${res.status}: ${url}`);
  const txt = await res.text();
  _textCache.set(url, txt);
  return txt;
}

// ---- 惰性单例：解析后的数据集（Promise 复用，避免并发重复 fetch）----
let _airportsP = null;   // -> { byIcao:Map, byIata:Map }
let _runwaysP = null;    // -> Map<ICAO, headingDegT>
let _routesP = null;     // -> { routesTxt 聚合后的 Map<srcIata, Map<dstIata,Set<airlineCode>>> }
let _airlinesP = null;   // -> Map<IATA, name>

/**
 * 解析机场库。OpenFlights airports.dat 列：
 * id,name,city,country,IATA,ICAO,lat,lon,alt(ft),tz(UTC偏移),dst,tzdb,type,source
 */
function loadAirports() {
  if (_airportsP) return _airportsP;
  _airportsP = fetchText(SRC.airports).then((txt) => {
    const byIcao = new Map();
    const byIata = new Map();
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      const f = parseCSVLine(line);
      const iata = f[4], icao = f[5];
      const lat = num(f[6]), lon = num(f[7]);
      if (lat == null || lon == null) continue;
      const hasIcao = icao && icao !== '\\N' && icao.length === 4;
      const hasIata = iata && iata !== '\\N' && iata.length === 3;
      if (!hasIcao && !hasIata) continue;
      const rec = {
        icao: hasIcao ? icao : '',
        iata: hasIata ? iata : '',
        name: f[1] || '',
        city: f[2] || '',
        country: f[3] || '',
        lat, lon,
        elevation: (num(f[8]) ?? 0) * FT_TO_M,   // 英尺 -> 米
        timezone: num(f[9]) ?? Math.round(lon / 15), // UTC偏移；缺失时用经度近似
      };
      if (hasIcao) byIcao.set(icao, rec);
      if (hasIata && !byIata.has(iata)) byIata.set(iata, rec);
    }
    return { byIcao, byIata };
  }).catch((e) => { _airportsP = null; throw e; });
  return _airportsP;
}

/**
 * 解析跑道库 -> Map<ICAO, 主跑道航向(度真航向)>。
 * OurAirports runways.csv 列含：airport_ident, closed, le_heading_degT, length_ft …
 * 取每个机场最长且未关闭跑道的 le_heading_degT。
 */
function loadRunways() {
  if (_runwaysP) return _runwaysP;
  _runwaysP = fetchText(SRC.runways).then((txt) => {
    const lines = txt.split('\n');
    const header = parseCSVLine(lines[0]);
    const col = (n) => header.indexOf(n);
    const iIdent = col('airport_ident'), iClosed = col('closed'),
      iLen = col('length_ft'), iHead = col('le_heading_degT');
    const best = new Map(); // ICAO -> {heading, len}
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const f = parseCSVLine(lines[i]);
      const ident = f[iIdent];
      if (!ident) continue;
      if (f[iClosed] === '1') continue;
      const heading = num(f[iHead]);
      if (heading == null) continue;
      const len = num(f[iLen]) ?? 0;
      const prev = best.get(ident);
      if (!prev || len > prev.len) best.set(ident, { heading, len });
    }
    const out = new Map();
    for (const [icao, v] of best) out.set(icao, v.heading);
    return out;
  }).catch((e) => { _runwaysP = null; throw e; });
  return _runwaysP;
}

/** 解析航司库 -> Map<IATA, name>（仅现役、有 2 位 IATA 者）。来自 build_routes.mjs。 */
function loadAirlines() {
  if (_airlinesP) return _airlinesP;
  _airlinesP = fetchText(SRC.airlines).then((txt) => {
    const m = new Map();
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      const f = parseCSVLine(line);
      const iata = f[3], active = f[7], name = f[1];
      if (!iata || iata === '\\N' || iata.length !== 2) continue;
      if (active !== 'Y') continue;
      if (!m.has(iata)) m.set(iata, name);
    }
    return m;
  }).catch((e) => { _airlinesP = null; throw e; });
  return _airlinesP;
}

/** 解析航线库 -> Map<srcIata, Map<dstIata, Set<airlineCode>>>。来自 build_routes.mjs。 */
function loadRoutes() {
  if (_routesP) return _routesP;
  _routesP = fetchText(SRC.routes).then((txt) => {
    const agg = new Map();
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      const f = line.split(','); // routes.dat 无引号包裹
      const airline = f[0], src = f[2], dst = f[4];
      if (!src || src === '\\N' || !dst || dst === '\\N' || dst === src) continue;
      if (!agg.has(src)) agg.set(src, new Map());
      const m = agg.get(src);
      if (!m.has(dst)) m.set(dst, new Set());
      if (airline && airline !== '\\N') m.get(dst).add(airline);
    }
    return agg;
  }).catch((e) => { _routesP = null; throw e; });
  return _routesP;
}

// ---------------------------------------------------------------------------
// 对外 API
// ---------------------------------------------------------------------------

/**
 * 搜索机场（城市/国家/IATA/ICAO/名称）。
 * @param {string} query
 * @param {number} limit 最多返回数（默认 40）
 * @returns {Promise<Array<{icao,iata,name,city,country,lat,lon,elevation,timezone}>>}
 */
export async function searchAirports(query, limit = 40) {
  const raw = (query || '').trim().toLowerCase();
  if (!raw) return [];
  const q = expandQuery(raw); // 中文 -> 英文匹配词
  const { byIcao, byIata } = await loadAirports();
  // 去重（一个机场可能同时在 byIcao/byIata）
  const seen = new Set();
  const all = [];
  for (const rec of byIcao.values()) { all.push(rec); seen.add(rec); }
  for (const rec of byIata.values()) { if (!seen.has(rec)) all.push(rec); }

  const scored = [];
  for (const r of all) {
    const iata = (r.iata || '').toLowerCase();
    const icao = (r.icao || '').toLowerCase();
    const city = (r.city || '').toLowerCase();
    const country = (r.country || '').toLowerCase();
    const name = (r.name || '').toLowerCase();
    let score = -1;
    if (iata === q || icao === q) score = 0;            // 精确代码匹配最优
    else if (city === q) score = 1;                      // 城市完全匹配
    else if (country === q) score = 2;                   // 国家完全匹配（搜国家名时该国机场靠前）
    else if (iata.startsWith(q) || icao.startsWith(q)) score = 3;
    else if (city.startsWith(q)) score = 4;
    else if (city.includes(q) || country.includes(q) || name.includes(q)) score = 5;
    if (score >= 0) scored.push({ r, score });
  }
  // 同分排序：International 大型枢纽 > 有 IATA > 字母序
  const hub = (r) => /international/i.test(r.name || '') ? 1 : 0;
  scored.sort((a, b) => a.score - b.score
    || hub(b.r) - hub(a.r)
    || (b.r.iata ? 1 : 0) - (a.r.iata ? 1 : 0)
    || (a.r.city || a.r.name).localeCompare(b.r.city || b.r.name));
  return scored.slice(0, limit).map((s) => ({ ...s.r }));
}

/**
 * 取机场主跑道真航向（度）。无跑道数据时回退到正北(0)，由调用方决定是否再做经度近似。
 * @param {string} icao
 * @returns {Promise<number|null>}
 */
export async function getRunwayHeading(icao) {
  if (!icao) return null;
  const runways = await loadRunways();
  const h = runways.get(icao);
  return h == null ? null : h;
}

/**
 * 取某出发机场（ICAO）的真实航线目的地，结构同构于内置 ROUTES[icao]。
 * @param {string} icao
 * @returns {Promise<Array<{iata,icao,name,city,country,lon,lat,airlines:[{code,name}]}>>}
 */
export async function getRoutesFrom(icao) {
  const [{ byIcao, byIata }, agg, airlineName] = await Promise.all([
    loadAirports(), loadRoutes(), loadAirlines(),
  ]);
  const dep = byIcao.get(icao);
  if (!dep || !dep.iata) return []; // 无 IATA 无法在 routes.dat 里查
  const m = agg.get(dep.iata);
  if (!m) return [];
  const list = [];
  for (const [dstIata, airlines] of m.entries()) {
    const ap = byIata.get(dstIata);
    if (!ap) continue; // 目的地需有坐标
    const codes = [...airlines].sort();
    list.push({
      iata: ap.iata,
      icao: ap.icao,
      name: ap.name,
      city: ap.city,
      country: ap.country,
      lon: +ap.lon.toFixed(5),
      lat: +ap.lat.toFixed(5),
      airlines: codes.map((c) => ({ code: c, name: airlineName.get(c) || c })),
    });
  }
  // 与 build_routes.mjs 一致：按运营航司数（热门度代理）降序，再按城市名
  list.sort((a, b) => b.airlines.length - a.airlines.length
    || (a.city || '').localeCompare(b.city || ''));
  return list;
}

/** 取单个机场完整记录（ICAO）。供"换机场"或直接按代码起飞使用。 */
export async function getAirport(icao) {
  if (!icao) return null;
  const { byIcao } = await loadAirports();
  return byIcao.get(icao) ? { ...byIcao.get(icao) } : null;
}
