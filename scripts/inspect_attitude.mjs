// 姿态映射检验：直接设定 pitch/roll/heading，渲染正前/侧/俯视，
// 确认「纯俯仰只抬头不滚转、纯横滚只压坡度不偏航」。
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dir, '..');

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--use-gl=angle','--ignore-gpu-blocklist','--enable-webgl'] });
const p = await b.newPage();
await p.setViewport({ width: 1000, height: 640, deviceScaleFactor: 2 });
p.on('console', (m) => { if (m.type() === 'error') console.log('  [err]', m.text()); });
await p.goto('http://127.0.0.1:5273/scripts/inspect_control.html', { waitUntil: 'networkidle0' });
await p.waitForFunction('window.__ready === true', { timeout: 15000 });

const cases = [
  ['att-pitchup',   { pitch: 20, roll: 0,  hdg: 0 }, 'front'],
  ['att-pitchdown', { pitch: -20, roll: 0, hdg: 0 }, 'front'],
  ['att-rollright', { pitch: 0, roll: 30,  hdg: 0 }, 'front'],
  ['att-rollleft',  { pitch: 0, roll: -30, hdg: 0 }, 'front'],
  ['att-pitchup-side', { pitch: 20, roll: 0, hdg: 0 }, 'left'],
];
for (const [name, att, view] of cases) {
  await p.evaluate((a) => window.__setAttitude(a), att);
  await p.evaluate((v) => window.__aim(v), view);
  await new Promise((r) => setTimeout(r, 120));
  await p.screenshot({ path: path.join(root, `shots/${name}.png`) });
  console.log(name, JSON.stringify(att), 'view=' + view);
}

// 真实动力学：持续输入，看「机体姿态 + 舵面」是否同时正确
for (const [name, scene, view] of [['att-dyn-rollright','roll_right','chase'],['att-dyn-pitchup','pitch_up','chase']]) {
  const r = await p.evaluate((s) => window.__run(s), scene);
  await p.evaluate((v) => window.__aim(v), view);
  await new Promise((res) => setTimeout(res, 120));
  await p.screenshot({ path: path.join(root, `shots/${name}.png`) });
  console.log(name, `pitch=${r.pitchDeg.toFixed(1)} roll=${r.rollDeg.toFixed(1)} hdg=${r.headingDeg.toFixed(1)}`);
}

await b.close();
console.log('done');