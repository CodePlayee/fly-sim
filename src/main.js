import maplibregl from 'maplibre-gl';
import { createMap } from './scene.js';
import { applyLighting, localHourToDate } from './lighting.js';
import { AIRPORTS, DEFAULT_AIRPORT } from './airports.js';
import { Aircraft } from './aircraft.js';
import { setupHud } from './hud.js';
import { createAircraftOverlay } from './aircraftLayer.js';

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

  // 机后方水平距离 & 相对高度（chase）/ 机头前 & 视高（cockpit）
  const back = camMode === 'chase' ? 240 : -10; // 米，正=机后
  const up = camMode === 'chase' ? 85 : 3;

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
      ready: true,
    };
  },
};

const hud = setupHud(window.flySim, AIRPORTS);

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
  hud.update();
  requestAnimationFrame(frame);
}

// 初始光照 + 启动
refreshLighting();
// 光照随时间缓慢刷新（每 5 秒，避免每帧重算）
setInterval(refreshLighting, 5000);
updateCamera();
requestAnimationFrame(frame);

console.log('[flySim] 就绪。免费全球地形：AWS Terrarium DEM + Esri 影像（无需 token）');
