import maplibregl from 'maplibre-gl';
import { createMap } from './scene.js';
import { applyLighting, localHourToDate } from './lighting.js';
import { AIRPORTS, DEFAULT_AIRPORT } from './airports.js';
import { Aircraft } from './aircraft.js';
import { setupHud } from './hud.js';
import { createAircraftOverlay } from './aircraftLayer.js';
import { createGPWS } from './gpws.js';
import { setupMinimap } from './minimap.js';

let currentAirport = AIRPORTS[DEFAULT_AIRPORT];
const aircraft = new Aircraft(currentAirport);

const map = await createMap('map', currentAirport);

// ---- 程序化 737 模型（独立透明 Three.js 画布，叠加在地图前景）----
const aircraftOverlay = createAircraftOverlay(() => aircraft.state());

// 当前时间状态（可被时间滑块覆盖）
let simDate = new Date();
let manualLocalHour = null; // 非 null 时用机场当地钟点

function currentDate() {
  if (manualLocalHour != null) {
    return localHourToDate(currentAirport, manualLocalHour, simDate);
  }
  return simDate;
}

// ---- 相机：第三人称追尾，用 calculateCameraOptionsFromTo（MapLibre 4.x）----
let camMode = 'chase'; // chase | cockpit
const DEG = Math.PI / 180;

function updateCamera() {
  const s = aircraft.state();
  const hdg = s.headingDeg * DEG;

  // 关键：相机到飞机的距离需随高度增大，否则 MapLibre 的 zoom 不变、
  // 地形尺度恒定，飞得再高地面也不会变小变远。
  // 飞机由独立 Three 叠层渲染，放大相机距离不会改变飞机在屏幕上的大小，
  // 只会让地形按真实透视缩小。
  // 用"离地高度(AGL)"作为基准：dist 随 AGL 线性增长，并设上下限。
  let groundElev = 0;
  try {
    const e = map.queryTerrainElevation([s.lon, s.lat], { exaggerated: false });
    if (typeof e === 'number' && isFinite(e)) groundElev = e;
  } catch (_) {}
  const agl = Math.max(30, s.alt - groundElev);

  // 追尾：基础 180m + 随 AGL 增长；座舱：贴近机头
  let back, up;
  if (camMode === 'chase') {
    back = 180 + agl * 0.9;          // 高度越高，镜头拉得越远
    up = 60 + agl * 0.35;            // 视点也相应抬高
  } else {
    back = -10;
    up = 3;
  }

  // 相机经纬度（在机的反航向方向后退 back 米）
  const latRad = s.lat * DEG;
  const camLat = s.lat - (back * Math.cos(hdg)) / 111320;
  const camLon = s.lon - (back * Math.sin(hdg)) / (111320 * Math.cos(latRad));
  const camAlt = s.alt + up;

  // 由"相机点 -> 目标点"反算 center/zoom/bearing/pitch
  const camPos = { lng: camLon, lat: camLat, alt: camAlt };
  const target = { lng: s.lon, lat: s.lat, alt: s.alt };
  try {
    const opts = map.calculateCameraOptionsFromTo(
      camPos,
      camAlt,
      target,
      s.alt
    );
    map.jumpTo(opts);
  } catch (e) {
    // 兜底：直接对准飞机
    map.jumpTo({ center: [s.lon, s.lat], bearing: s.headingDeg, pitch: 75, zoom: 15 });
  }
}

// ---- 光照刷新 ----
function refreshLighting() {
  const info = applyLighting(map, currentDate(), aircraft.lon, aircraft.lat);
  hud.setNightOverlay(info ? info.sunAltDeg : 90);
  if (info) {
    aircraftOverlay.setLight(info.sunAltDeg, info.azimuth);
  }
}

// ---- 键盘输入 ----
const keys = new Set();
window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'KeyV') {
    camMode = camMode === 'chase' ? 'cockpit' : 'chase';
    aircraftOverlay.setCamMode(camMode);
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

function pollInput() {
  const i = aircraft.input;
  i.pitch = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
  i.roll = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
  i.yaw = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
  i.throttleDelta =
    (keys.has('KeyW') || keys.has('ShiftLeft') ? 1 : 0) -
    (keys.has('KeyS') || keys.has('ControlLeft') ? 1 : 0);
}

// ---- 机场切换 ----
function goToAirport(icao) {
  currentAirport = AIRPORTS[icao];
  aircraft.reset(currentAirport);
  map.jumpTo({
    center: [currentAirport.lon, currentAirport.lat],
    zoom: 14,
    pitch: 75,
    bearing: currentAirport.runwayHeading,
  });
  if (typeof minimap !== 'undefined') minimap.reset(); // 清空航迹
  refreshLighting();
}

// ---- 对外 API（供 HUD / 截图脚本）----
window.flySim = {
  map,
  aircraft,
  goToAirport,
  setLocalHour: (h) => {
    manualLocalHour = h;
    refreshLighting();
  },
  setRealTime: () => {
    manualLocalHour = null;
    simDate = new Date();
    refreshLighting();
  },
  setCamMode: (m) => {
    camMode = m;
    aircraftOverlay.setCamMode(m);
  },
  setAirborne: (altMeters = 1500, speedKt = 200) => {
    aircraft.onGround = false;
    aircraft.alt = altMeters;
    aircraft.speed = speedKt / 1.94384;
    aircraft.throttle = 0.85;
    aircraft.pitch = 3 * DEG;
  },
  setBank: (deg) => (aircraft.roll = deg * DEG),
  getState: () => {
    const s = aircraft.state();
    return {
      airport: currentAirport.icao,
      alt: Math.round(s.alt),
      speedKt: Math.round(s.speedKt),
      headingDeg: Math.round((s.headingDeg + 360) % 360),
      onGround: s.onGround,
      stalled: s.stalled,
      loadFactor: s.loadFactor,
      ready: true,
    };
  },
};

const hud = setupHud(window.flySim, AIRPORTS);

// ---- 右下角导航小地图（ND）----
const minimap = setupMinimap(AIRPORTS);

// ---- 近地警告系统（GPWS）----
const gpws = createGPWS(map, () => aircraft.state());
let gpwsInfo = { level: 'none', aglHere: Infinity };
let lastGpwsEval = 0;
window.flySim.getGPWS = () => gpwsInfo;

// ---- 主循环 ----
let last = performance.now();
function frame() {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  pollInput();
  aircraft.update(dt);

  // 真实时间推进（未手动锁定时）
  if (manualLocalHour == null) simDate = new Date();

  updateCamera();
  aircraftOverlay.render();

  // GPWS 评估（约每 250ms 一次，地形查询有开销），闪烁每帧更新
  if (now - lastGpwsEval > 250) {
    gpwsInfo = gpws.evaluate();
    lastGpwsEval = now;
  }
  hud.update();
  hud.setGPWS(gpwsInfo, now); // 须在 update 之后，避免 AGL 读数被重建覆盖

  // 导航小地图
  const ms = aircraft.state();
  minimap.update(
    {
      lon: ms.lon,
      lat: ms.lat,
      headingDeg: (ms.headingDeg + 360) % 360,
      onGround: ms.onGround,
      alt: ms.alt,
    },
    currentAirport.icao,
    now
  );
  requestAnimationFrame(frame);
}

// 初始光照 + 启动
refreshLighting();
// 光照随时间缓慢刷新（每 5 秒，避免每帧重算）
setInterval(refreshLighting, 5000);
updateCamera();
requestAnimationFrame(frame);

console.log('[flySim] 就绪。免费全球地形：AWS Terrarium DEM + Esri 影像（无需 token）');
