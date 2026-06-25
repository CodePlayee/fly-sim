// 全链路操控检视：驱动真实 Aircraft 动力学 + aircraftModel，
// 模拟俯仰/横滚/偏航输入，多视角截图验证「姿态变化」与「舵面动画」一致。
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
page.on('console', (m) => { if (m.type() === 'error') console.log('  [page error]', m.text()); });

await page.goto('http://127.0.0.1:5273/scripts/inspect_control.html', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 15000 });

const scenes = await page.evaluate(() => window.__scenes);
// 每个场景，选最能体现该轴的视角
const sceneView = {
  neutral: 'tail',
  pitch_up: 'tail', pitch_down: 'tail',
  roll_left: 'rear', roll_right: 'rear',
  yaw_left: 'tailrear', yaw_right: 'tailrear',
};
for (const sc of scenes) {
  const res = await page.evaluate((s) => window.__run(s), sc);
  const v = sceneView[sc] || 'chase';
  await page.evaluate((vv) => window.__aim(vv), v);
  await new Promise((r) => setTimeout(r, 120));
  await page.screenshot({ path: path.join(root, `shots/ctl-${sc}.png`) });
  console.log(`${sc.padEnd(11)} view=${v.padEnd(6)} pitch=${res.pitchDeg.toFixed(1).padStart(6)} roll=${res.rollDeg.toFixed(1).padStart(6)} hdg=${res.headingDeg.toFixed(1).padStart(6)}  in(P,R,Y)=${res.inPitch},${res.inRoll},${res.inYaw}`);
}
// 隔离测试：冻结水平姿态，只看舵面方向（解耦机身姿态）
const surfTests = [
  ['pitch_up', 'tailside'], ['pitch_down', 'tailside'],
  ['roll_right', 'rolltop'], ['roll_left', 'rolltop'],
  ['yaw_right', 'tailtop'], ['yaw_left', 'tailtop'],
];
for (const [sc, v] of surfTests) {
  await page.evaluate((s) => window.__surfOnly(s), sc);
  await page.evaluate((vv) => window.__aim(vv), v);
  await new Promise((r) => setTimeout(r, 120));
  await page.screenshot({ path: path.join(root, `shots/ctlsurf-${sc}.png`) });
  console.log(`surfOnly ${sc.padEnd(11)} view=${v}`);
}

await browser.close();
console.log('done', scenes.length);