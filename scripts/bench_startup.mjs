/**
 * 首屏耗时基准（npm run bench，需先 npm run dev）。
 *
 * 测两件事：
 *   1. 航班选择界面何时可用（目的地列表出现 / 默认航班「开始飞行」可点）
 *   2. 机场脚下地形何时真正达到各 LOD 层级
 *
 * 方法要点：
 *   - 先用一个**独立浏览器实例**跑一轮丢弃的预热，让 vite dev server 完成模块
 *     transform；正式测量换全新实例（空缓存），避免冷编译污染、保证瓦片是首次下载。
 *   - 地形就绪判定必须显式检查 heightLoaded/textureLoaded 与整条祖先链的 visible：
 *     three 的 raycast 不过滤 visible，而 MapHeightNode 在瓦片下载完成前就已存在
 *     （持有 1x1 占位几何体），否则会把「节点已创建」误判成「地形已就绪」。
 */
import puppeteer from 'puppeteer';

const URL = 'http://127.0.0.1:5273/';
const LABEL = process.argv[2] || 'run';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist',
  '--enable-webgl', '--window-size=1280,800'];

// —— 预热：用**独立浏览器实例**让 vite dev server 完成模块 transform，
//    随后整个实例销毁，正式测量的实例拥有全新的空缓存（瓦片/数据均为首次下载）——
{
  const warm = await puppeteer.launch({ headless: 'new', args: ARGS });
  const wp = await warm.newPage();
  await wp.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(6000);
  await warm.close();
}

const browser = await puppeteer.launch({ headless: 'new', args: ARGS });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.setCacheEnabled(false); // 瓦片/数据一律重新下载，公平对比

let reqCount = 0;
page.on('request', () => reqCount++);

const t0 = Date.now();
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

// —— 1a) 目的地航线列表首次渲染 ——
let listMs = -1;
try {
  await page.waitForFunction(() => {
    const ov = document.getElementById('flight-select');
    return !!ov && /\d+\s*\/\s*\d+\s*条航线/.test(ov.innerText);
  }, { timeout: 90000, polling: 100 });
  listMs = Date.now() - t0;
} catch (e) { /* 超时 */ }

// —— 1b) 「开始飞行」可点（默认航线已选中）——
let uiMs = -1, uiText = '';
try {
  await page.waitForFunction(() => {
    const ov = document.getElementById('flight-select');
    if (!ov) return false;
    const btn = [...ov.querySelectorAll('button')].find((b) => b.textContent.includes('开始飞行'));
    return btn && btn.style.pointerEvents === 'auto';
  }, { timeout: 8000, polling: 100 });
  uiMs = Date.now() - t0;
  uiText = await page.evaluate(() => {
    const ov = document.getElementById('flight-select');
    const c = [...ov.querySelectorAll('div')].filter((d) => d.innerText.includes('✈──→'));
    const s = c[c.length - 1];
    return s ? s.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
  });
} catch (e) { /* baseline：需手动选目的地 */ }

// —— 2) 地形：机场脚下 raycast 命中节点的最深 LOD 层级 ——
await page.waitForFunction(() => !!window.flySim, { timeout: 60000 });
await page.evaluate(() => {
  const { THREE, mapView, geoToWorld, aircraft } = window.flySim;
  const ray = new THREE.Raycaster();
  const p = new THREE.Vector3();
  const down = new THREE.Vector3(0, -1, 0);
  // 注意：不能 intersectObject(mapView)，geo-three 的 MapView.raycast 恒 return false，
  // three ≥0.164 会因此中断向子节点递归。从 mapView.children 起算。
  window.__levelAt = () => {
    geoToWorld(aircraft.lat, aircraft.lon, 0, p);
    ray.set(new THREE.Vector3(p.x, 1e6, p.z), down);
    let lv = -1;
    for (const h of ray.intersectObjects(mapView.children, true)) {
      const o = h.object;
      if (o.level == null || o.level <= lv) continue;
      if (o.heightLoaded !== true || o.textureLoaded !== true) continue;
      let n = o, shown = true;
      while (n && n !== mapView) { if (!n.visible) { shown = false; break; } n = n.parent; }
      if (shown) lv = o.level;
    }
    return lv;
  };
});

const marks = {};
const deadline = Date.now() + 90000;
while (Date.now() < deadline) {
  const lv = await page.evaluate(() => window.__levelAt());
  for (let L = 0; L <= lv; L++) if (marks[L] === undefined) marks[L] = Date.now() - t0;
  if (lv >= 14) break;
  await sleep(200);
}

const fmt = (v) => (v === undefined || v < 0 ? '  未达到(>90s)' : String(v).padStart(6) + ' ms');
console.log(`\n===== ${LABEL} =====`);
console.log(`目的地航线列表出现: ${fmt(listMs)}`);
console.log(`「开始飞行」可点:   ${uiMs < 0 ? '  未自动就绪（需手动选目的地）' : fmt(uiMs)}   ${uiText}`);
console.log('机场脚下地形达到各 LOD 层级（从页面打开算起）:');
for (const L of [4, 8, 10, 12, 13, 14]) console.log(`   z${String(L).padStart(2)}: ${fmt(marks[L])}`);
console.log(`总请求数: ${reqCount}`);
await browser.close();
