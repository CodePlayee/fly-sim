/**
 * 离线构建航线数据：从 OpenFlights 公开数据集抽取本项目 3 个出发机场的真实航线，
 * 关联目的地机场经纬度/城市/国家/运营航司，生成精简的 src/routes.js（打包进项目，
 * 运行时无需联网）。
 *
 * 数据来源（公开，无需 key）：
 *   https://github.com/jpatokal/openflights  data/routes.dat + data/airports.dat
 *
 * 用法：node scripts/build_routes.mjs
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dir, '..');

const SRC = {
  routes: 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat',
  airports: 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
  airlines: 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat',
};
const CACHE = '/tmp';

// 本项目出发机场：ICAO -> IATA（OpenFlights routes 用 IATA）
const DEP = { VHHH: 'HKG', KSFO: 'SFO', LFPG: 'CDG' };
// 每个出发机场最多保留的目的地数（按运营航司数=热门度降序）
const MAX_PER_DEP = 90;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function load(name) {
  const cacheFile = path.join(CACHE, name + '.dat');
  if (fs.existsSync(cacheFile)) {
    const txt = fs.readFileSync(cacheFile, 'utf8');
    if (txt.length > 1000) { console.log(`用缓存 ${cacheFile}`); return txt; }
  }
  console.log(`下载 ${SRC[name]} ...`);
  const txt = await fetchText(SRC[name]);
  try { fs.writeFileSync(cacheFile, txt); } catch (_) {}
  return txt;
}

// CSV 行解析（airports.dat 字段含引号包裹、引号内可能有逗号）
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

async function main() {
  const [routesTxt, airportsTxt, airlinesTxt] = await Promise.all([
    load('routes'), load('airports'), load('airlines'),
  ]);

  // ---- 解析航司：IATA -> 名称（仅取 active=Y，优先有 IATA 的现役航司）----
  // airlines.dat 列: id,name,alias,IATA,ICAO,callsign,country,active
  const airlineName = new Map();
  for (const line of airlinesTxt.split('\n')) {
    if (!line.trim()) continue;
    const f = parseCSVLine(line);
    const iata = f[3], active = f[7], name = f[1];
    if (!iata || iata === '\\N' || iata.length !== 2) continue;
    if (active !== 'Y') continue;
    if (!airlineName.has(iata)) airlineName.set(iata, name); // 首个现役者
  }
  console.log(`航司（现役+IATA）: ${airlineName.size}`);

  // ---- 解析机场：IATA -> 信息 ----
  // airports.dat 列: id,name,city,country,IATA,ICAO,lat,lon,alt,tz,dst,tzdb,type,source
  const byIata = new Map();
  for (const line of airportsTxt.split('\n')) {
    if (!line.trim()) continue;
    const f = parseCSVLine(line);
    const iata = f[4];
    if (!iata || iata === '\\N' || iata.length !== 3) continue;
    const lat = num(f[6]), lon = num(f[7]);
    if (lat == null || lon == null) continue;
    byIata.set(iata, {
      iata,
      icao: f[5] && f[5] !== '\\N' ? f[5] : '',
      name: f[1] || iata,
      city: f[2] || '',
      country: f[3] || '',
      lon, lat,
    });
  }
  console.log(`机场（含 IATA+坐标）: ${byIata.size}`);

  // ---- 解析航线：聚合每个出发机场的目的地 ----
  // routes.dat 列: airline,airlineId,src,srcId,dst,dstId,codeshare,stops,equipment
  const depIatas = new Set(Object.values(DEP));
  // depIata -> Map(dstIata -> {airlines:Set})
  const agg = new Map();
  for (const d of depIatas) agg.set(d, new Map());

  for (const line of routesTxt.split('\n')) {
    if (!line.trim()) continue;
    const f = line.split(',');
    const airline = f[0], src = f[2], dst = f[4];
    if (!depIatas.has(src)) continue;
    if (!dst || dst === '\\N' || dst === src) continue;
    if (!byIata.has(dst)) continue; // 目的地需有坐标
    const m = agg.get(src);
    if (!m.has(dst)) m.set(dst, new Set());
    if (airline && airline !== '\\N') m.get(dst).add(airline);
  }

  // ---- 组装输出 ----
  const result = {};
  for (const [icao, iata] of Object.entries(DEP)) {
    const m = agg.get(iata);
    let list = [];
    for (const [dst, airlines] of m.entries()) {
      const ap = byIata.get(dst);
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
    // 按运营航司数（热门度代理）降序，再按城市名
    list.sort((a, b) => b.airlines.length - a.airlines.length || a.city.localeCompare(b.city));
    list = list.slice(0, MAX_PER_DEP);
    result[icao] = list;
    console.log(`${icao} (${iata}): ${m.size} 个目的地 -> 保留 ${list.length}`);
  }

  const header = `/**
 * 真实航班航线数据（自动生成，请勿手改）。
 * 来源：OpenFlights 公开数据集 https://github.com/jpatokal/openflights
 * 生成脚本：scripts/build_routes.mjs
 *
 * 结构：ROUTES[出发ICAO] = [{ iata,icao,name,city,country,lon,lat,airlines:[] }]
 *   按运营航司数（热门度）降序排列。airlines 为 IATA 航司代码列表。
 */
`;
  const body = 'export const ROUTES = ' + JSON.stringify(result, null, 1) + ';\n';
  const outFile = path.join(root, 'src', 'routes.js');
  fs.writeFileSync(outFile, header + body);
  const kb = (fs.statSync(outFile).size / 1024).toFixed(1);
  console.log(`\n已写出 ${outFile}  (${kb} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
