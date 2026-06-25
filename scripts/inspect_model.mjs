// 隔离检视 737 模型：纯 Three.js 离屏渲染，多视角出图，不依赖地图。
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dir, '..');

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--use-gl=angle', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 640, deviceScaleFactor: 2 });

const url = 'http://127.0.0.1:5273/scripts/inspect_model.html';
await page.goto(url, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 15000 });

const views = await page.evaluate(() => window.__views);
for (const v of views) {
  await page.evaluate((view) => window.__setView(view), v);
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: path.join(root, `shots/model-${v}.png`) });
  console.log('shot', v);
}

// 偏转控制面后，再出关键几张（俯视/前视/后视）检视后缘分段与铰链动作
await page.evaluate(() => window.__deflect(true));
for (const v of ['top', 'front', 'tail', 'q-rear', 'htail-close']) {
  await page.evaluate((view) => window.__setView(view), v);
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: path.join(root, `shots/model-${v}-deflect.png`) });
  console.log('shot', v, 'deflect');
}

await browser.close();
console.log('done', views.length);
