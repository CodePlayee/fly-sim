import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(__dirname, '..', 'shots');
mkdirSync(SHOTS, { recursive: true });

const URL = process.env.FLYSIM_URL || 'http://127.0.0.1:5273/';

// 截图场景：[机场, 当地小时, 标签]
const SCENES = [
  ['VHHH', 12, 'hongkong-noon'],
  ['VHHH', 19, 'hongkong-dusk'],
  ['KSFO', 8, 'sanfran-morning'],
  ['KSFO', 22, 'sanfran-night'],
  ['LFPG', 17, 'paris-afternoon'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=default', '--ignore-gpu-blocklist', '--enable-webgl', '--enable-unsafe-webgpu', '--window-size=1280,800'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
page.on('console', (m) => {
  const t = m.text();
  if (t.includes('[flySim]') || m.type() === 'error') console.log('  [page]', t);
});

console.log(`打开 ${URL} ...`);
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

// 等待 flySim API 就绪
await page.waitForFunction(() => window.flySim && window.flySim.getState().ready, { timeout: 60000 });
// 关闭起始航班选择界面（截图脚本通过 API 驱动，不走 UI 选择）
await page.evaluate(() => { const o = document.getElementById('flight-select'); if (o) o.remove(); });
// 再等地形/影像瓦片首次加载
await page.waitForFunction(() => window.flySim.tilesReady(), { timeout: 60000 }).catch(() => {});
console.log('flySim 就绪，开始截图。');

// 预热：先把三个机场各加载一遍，填充瓦片缓存，避免首截图瓦片未到位
for (const icao of ['VHHH', 'KSFO', 'LFPG']) {
  await page.evaluate((icao) => window.flySim.goToAirport(icao), icao);
  await page.waitForFunction(() => window.flySim.tilesReady(), { timeout: 30000 }).catch(() => {});
  await sleep(4000);
}

for (const [icao, hour, label] of SCENES) {
  await page.evaluate((icao, hour) => {
    window.flySim.goToAirport(icao);
    window.flySim.setLocalHour(hour);
  }, icao, hour);
  // 等地形/影像瓦片加载
  await page.waitForFunction(() => window.flySim.tilesReady(), { timeout: 30000 }).catch(() => {});
  await sleep(12000);
  const out = join(SHOTS, `${label}.png`);
  await page.screenshot({ path: out });
  console.log(`  ✓ ${label} -> ${out}`);
}

// 额外：空中巡航 + 盘旋姿态，验证飞行状态与机体可见性
await page.evaluate(() => {
  window.flySim.goToAirport('VHHH');
  window.flySim.setLocalHour(15);
  window.flySim.setAirborne(1800, 200);
  window.flySim.setBank(18);
});
await page.waitForFunction(() => window.flySim.tilesReady(), { timeout: 30000 }).catch(() => {});
await sleep(12000);
await page.screenshot({ path: join(SHOTS, 'vhhh-airborne-bank.png') });
console.log('  ✓ vhhh-airborne-bank');

await browser.close();
console.log('全部截图完成。');
