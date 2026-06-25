// 夜间外部灯光检视：多视角 + 不同飞行阶段 + 闪烁相位，截图验证。
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dir, '..');

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--use-gl=angle','--ignore-gpu-blocklist','--enable-webgl'] });
const p = await b.newPage();
await p.setViewport({ width: 1000, height: 640, deviceScaleFactor: 2 });
p.on('console', (m) => { if (m.type() === 'error') console.log('  [err]', m.text()); });
await p.goto('http://127.0.0.1:5273/scripts/inspect_lights.html', { waitUntil: 'networkidle0' });
await p.waitForFunction('window.__ready === true', { timeout: 15000 });

// 选 tMs 让频闪正好亮（cyc<0.04 -> t%1200<48ms，取 t=10）和信标亮
const shots = [
  ['lights-cruise-front', 'cruise', 'front', 10],
  ['lights-cruise-top',   'cruise', 'top', 10],
  ['lights-cruise-qrear', 'cruise', 'q-rear', 10],
  ['lights-cruise-wingtipL', 'cruise', 'wingtipL', 10],
  ['lights-strobe-off',   'cruise', 'top', 400],   // 频闪熄灭相位，仅航行/信标
  ['lights-ground-front', 'ground', 'front', 10],  // 地面：着陆/滑行灯亮
  ['lights-approach-front','lowapproach', 'front', 10],
  ['lights-day-top',      'day', 'top', 10],        // 白天：全灭
];
for (const [name, phase, view, t] of shots) {
  await p.evaluate((ph) => window.__setPhase(ph), phase);
  await p.evaluate(([v, tm]) => window.__renderAt(v, tm), [view, t]);
  await new Promise((r) => setTimeout(r, 80));
  await p.screenshot({ path: path.join(root, `shots/${name}.png`) });
  console.log(name, phase, view, 't=' + t);
}
await b.close();
console.log('done');
