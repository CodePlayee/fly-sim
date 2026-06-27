import * as THREE from 'three';
import { createWorld } from './world.js';
import { setOrigin, getOrigin, geoToWorld, headingToForward } from './geoUtils.js';
import { applyLighting, localHourToDate, setupSky } from './lighting.js';
import { AIRPORTS, DEFAULT_AIRPORT, REGISTRY, registerAirport } from './airports.js';
import { Aircraft } from './aircraft.js';
import { setupHud } from './hud.js';
import { createAircraftModel } from './aircraftModel.js';
import { createGPWS } from './gpws.js';
import { setupMinimap } from './minimap.js';
import { setupFlightSelect } from './flightSelect.js';
import { createTerrain } from './terrain.js';
import { setupLoadingMap } from './loadingMap.js';
import { setupSkybox } from './skybox.js';
import { setupCityLights } from './cityLights.js';
import { createVectorTileSource } from './providers/VectorTileSource.js';
import { setupCityNetwork } from './cityNetwork.js';

const DEG = Math.PI / 180;

let currentAirport = AIRPORTS[DEFAULT_AIRPORT];
let currentFlight = null; // { depIcao, dest } 由起始选择界面设定
const aircraft = new Aircraft(currentAirport);

// ---- 统一 three.js 世界（场景原点平移到起始机场，避免浮点抖动）----
setOrigin(currentAirport.lat, currentAirport.lon);
const { renderer, scene, camera, mapView, syncSize } = createWorld();

// ---- 光照装置（Sky 穹顶 + 平行光 + 环境光 + 雾）----
const env = setupSky(scene);

// ---- 夜空增强（星空 + 月亮 + 地平线暮光渐变）----
const skybox = setupSkybox(scene, camera);

// ---- 程序化 737 模型（进共享场景）----
const aircraftModel = createAircraftModel(scene);

// ---- 地形高程查询器（自解码 Terrarium DEM，供 AGL/GPWS）----
// 注意：geo-three 负责"视觉"地形；AGL 数字仍用 terrain.js（准、不依赖 LOD 加载态）。
const terrain = createTerrain({ maxZoom: 14 });

// ---- 城市灯光（夜间在城区叠加暖色发光精灵）----
const cityLights = setupCityLights(scene, terrain, REGISTRY);

// ---- 真实 OSM 矢量瓦片城市灯网（路网/建筑/跑道/水体，AGL 2000–8000m，带 LOD）----
const vtSource = createVectorTileSource({ cacheSize: 600, maxConcurrent: 10 });
const cityNetwork = setupCityNetwork(scene, terrain, vtSource);

// 当前时间状态（可被时间滑块覆盖）
let simDate = new Date();
let manualLocalHour = null; // 非 null 时用机场当地钟点

function currentDate() {
  if (manualLocalHour != null) {
    return localHourToDate(currentAirport, manualLocalHour, simDate);
  }
  return simDate;
}

// ---- 相机：第三人称追尾 / 座舱 / 自由环绕（世界坐标直接放置）----
let camMode = 'chase'; // chase | cockpit | free
let timeScale = 1; // 时间加速倍率（1=实时，最大 100）
const _acPos = new THREE.Vector3();
const _focus = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

// 自由相机：以飞机为中心的环绕轨道（方位角相对机头，跟随转弯）
const orbit = { az: 0, el: 0.32, dist: 140, dragging: false, px: 0, py: 0 };
const _right = new THREE.Vector3();
const _offset = new THREE.Vector3();

function updateCamera() {
  const s = aircraft.state();
  geoToWorld(s.lat, s.lon, s.alt, _acPos); // pivot 原点世界位置（座舱锚点）
  headingToForward(s.headingRad, _fwd); // 前向单位向量（北=-z）

  if (camMode === 'cockpit') {
    // 座舱：机头前上方一点，朝飞行方向看（贴 pivot 机头，不用几何中心）
    _camPos.copy(_acPos).addScaledVector(_fwd, 6);
    _camPos.y += 2;
    camera.position.copy(_camPos);
    camera.up.set(0, 1, 0);
    const look = _acPos.clone().addScaledVector(_fwd, 1000);
    look.y += 2;
    camera.lookAt(look);
    return;
  }

  // 追尾 / 自由：对准飞机视觉中心（几何重心），保证机体真正居中。
  aircraftModel.getVisualCenter(_focus);

  if (camMode === 'free') {
    // 自由环绕：方位角相对机头(0=正后方)，仰角抬升，距离可缩放。始终看向飞机。
    _right.crossVectors(_fwd, _up).normalize();
    const ch = Math.cos(orbit.az), sh = Math.sin(orbit.az);
    // behindDir = -fwd 旋转 az：cos*(-fwd) + sin*right
    _offset.copy(_fwd).multiplyScalar(-ch).addScaledVector(_right, sh);
    const ce = Math.cos(orbit.el), se = Math.sin(orbit.el);
    _offset.multiplyScalar(ce).addScaledVector(_up, se).multiplyScalar(orbit.dist);
    _camPos.copy(_focus).add(_offset);
    camera.position.copy(_camPos);
    camera.up.set(0, 1, 0);
    camera.lookAt(_focus);
  } else {
    // 追尾：机后上方，距离随高度（视觉舒适）
    const back = 120;
    const up = 42;
    _camPos.copy(_focus).addScaledVector(_fwd, -back);
    _camPos.y += up;
    camera.position.copy(_camPos);
    camera.up.set(0, 1, 0);
    camera.lookAt(_focus);
  }
}

// ---- 光照刷新 ----
let currentSunAltDeg = 90; // 缓存最新太阳高度角，供逐帧灯光昼夜判定
let lightInfo = null;      // 缓存最新光照信息（含月亮/夜间因子），供天空/城市灯逐帧用
function refreshLighting() {
  const info = applyLighting(env, currentDate(), aircraft.lon, aircraft.lat);
  if (info) { currentSunAltDeg = info.sunAltDeg; lightInfo = info; }
  hud.setNightOverlay(info ? info.sunAltDeg : 90);
}

// ---- 键盘输入 ----
const keys = new Set();
const CAM_MODES = ['chase', 'cockpit', 'free'];
window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'KeyV') {
    camMode = CAM_MODES[(CAM_MODES.indexOf(camMode) + 1) % CAM_MODES.length];
    hud.setCamMode && hud.setCamMode(camMode);
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

// ---- 自由相机：鼠标拖拽环绕 + 滚轮缩放（仅 free 模式生效）----
function setupFreeCameraControls() {
  const el = renderer.domElement;
  el.addEventListener('mousedown', (e) => {
    if (camMode !== 'free' || e.button !== 0) return;
    orbit.dragging = true;
    orbit.px = e.clientX;
    orbit.py = e.clientY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!orbit.dragging) return;
    const dx = e.clientX - orbit.px;
    const dy = e.clientY - orbit.py;
    orbit.px = e.clientX;
    orbit.py = e.clientY;
    orbit.az -= dx * 0.006; // 左右拖动绕飞机旋转
    orbit.el = Math.max(-1.2, Math.min(1.45, orbit.el + dy * 0.006)); // 上下拖动改仰角
  });
  window.addEventListener('mouseup', () => { orbit.dragging = false; });
  el.addEventListener('wheel', (e) => {
    if (camMode !== 'free') return;
    e.preventDefault();
    orbit.dist = Math.max(25, Math.min(2000, orbit.dist * (1 + Math.sign(e.deltaY) * 0.12)));
  }, { passive: false });
  // 自由模式下光标提示可拖拽
  el.style.cursor = 'default';
}

function pollInput() {
  const i = aircraft.input;
  // ↑=拉杆抬头(+1)，↓=推杆低头(-1)。与 aircraft.js 约定 input.pitch>0=抬头 一致。
  i.pitch = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0);
  i.roll = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
  i.yaw = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
  i.throttleDelta =
    (keys.has('KeyW') || keys.has('ShiftLeft') ? 1 : 0) -
    (keys.has('KeyS') || keys.has('ControlLeft') ? 1 : 0);
}

// ---- 机场切换 ----
// 接受 ICAO 字符串或机场对象。切换出发机场时**必须重设场景原点并重定位 mapView**，
// 否则远机场的墨卡托世界坐标(~1e7 米)会引发单精度浮点抖动。
function goToAirport(icaoOrAirport) {
  let ap = typeof icaoOrAirport === 'string'
    ? (REGISTRY[icaoOrAirport] || AIRPORTS[icaoOrAirport])
    : icaoOrAirport;
  if (!ap) return;
  if (typeof icaoOrAirport !== 'string') registerAirport(ap);
  currentAirport = ap;

  // 原点平移到新机场 + 同步 mapView 位置（与 world.js 初始化一致）。
  setOrigin(ap.lat, ap.lon);
  const o = getOrigin();
  mapView.position.set(-o.x, 0, o.y);
  mapView.updateMatrixWorld(true);

  aircraft.reset(currentAirport);
  if (typeof minimap !== 'undefined') minimap.reset(); // 清空航迹
  if (typeof cityLights !== 'undefined') cityLights.rebuild(ap.lat, ap.lon); // 重建附近城市灯
  if (typeof cityNetwork !== 'undefined') cityNetwork.reset(); // 清空矢量灯网（origin 变）
  refreshLighting();
}

// ---- 起飞航班计划：跳转出发机场并设定小地图导航目的地 ----
function startFlight({ depIcao, dest }) {
  goToAirport(depIcao);
  currentFlight = { depIcao, dest };
  minimap.setFlightPlan(dest); // dest 含 lon/lat/iata 等
  hud.setFlight && hud.setFlight(depIcao, dest);
  // 地形加载过渡层：覆盖 2D 航图，地形就绪后渐隐
  if (typeof loadingMap !== 'undefined') loadingMap.show(currentAirport, dest);
}

// ---- tilesReady：地形是否就绪（替代 MapLibre areTilesLoaded）----
// 用飞机正下方向下 raycast 命中 mapView 判断；并有启动超时兜底，截图不挂死。
const _ray = new THREE.Raycaster();
const _down = new THREE.Vector3(0, -1, 0);
const _startTime = performance.now();
function tilesReady() {
  if (performance.now() - _startTime > 6000) return true; // 兜底超时
  return terrainLoadedHere();
}

// 当前机场正下方地形是否已加载（纯 raycast，无全局超时——供加载过渡层判定，
// 否则页面开启 6s 后换机场会让过渡层立即消失）。
function terrainLoadedHere() {
  geoToWorld(aircraft.lat, aircraft.lon, 0, _acPos);
  _ray.set(new THREE.Vector3(_acPos.x, 1e6, _acPos.z), _down);
  return _ray.intersectObject(mapView, true).length > 0;
}

// ---- 对外 API（供 HUD / 小地图 / 截图脚本）----
window.flySim = {
  scene,
  camera,
  mapView,
  THREE,
  geoToWorld,
  aircraft,
  goToAirport,
  startFlight,
  tilesReady,
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
  },
  setTimeScale: (s) => {
    timeScale = Math.max(1, Math.min(100, s || 1));
    return timeScale;
  },
  getTimeScale: () => timeScale,
  _lightInfo: () => lightInfo,
  _cityNetActive: () => cityNetwork.isActive(),
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

const hud = setupHud(window.flySim, REGISTRY);

// ---- 右下角导航小地图（ND）----
const minimap = setupMinimap(REGISTRY);

// ---- 地形加载过渡层（全屏 2D 航图，地形就绪后渐隐）----
const loadingMap = setupLoadingMap();

// ---- 起始航班选择界面（全屏覆盖层，可被 hud "换机场" 重新打开）----
const flightSelect = setupFlightSelect(REGISTRY, (plan) => {
  startFlight(plan);
});
window.flySim.openFlightSelect = () => flightSelect.show();

// ---- 近地警告系统（GPWS）----
const gpws = createGPWS(null, () => aircraft.state(), terrain);
let gpwsInfo = { level: 'none', aglHere: Infinity };
let lastGpwsEval = 0;
window.flySim.getGPWS = () => gpwsInfo;

// ---- 主循环 ----
let last = performance.now();
function frame() {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  syncSize(); // 每帧自愈画布尺寸/相机比例，防止进入游戏后画面偏移

  pollInput();
  // 时间加速：把加速后的时长切成多个 ≤ 基准步长的子步逐步积分，保证物理稳定
  // （单步 dt 过大会让升力/姿态积分发散）。地面或暂停时不加速。
  const scaledDt = dt * timeScale;
  if (timeScale <= 1) {
    aircraft.update(dt);
  } else {
    const MAX_SUB = 0.02; // 每子步最长 20ms
    const n = Math.min(120, Math.ceil(scaledDt / MAX_SUB));
    const sub = scaledDt / n;
    for (let k = 0; k < n; k++) aircraft.update(sub);
  }

  // 预取飞机正下方 DEM 瓦片，保证 AGL 查询命中
  terrain.prefetch(aircraft.lon, aircraft.lat);

  // 真实时间推进（未手动锁定时）
  if (manualLocalHour == null) simDate = new Date();

  // 飞机姿态写入共享场景 + 控制面动画 + 外部灯光（夜间开启）
  aircraftModel.update(aircraft.state(), dt, {
    night: currentSunAltDeg < -3, // 暮光起即开灯
    tMs: now,
  });

  updateCamera();
  skybox.update(lightInfo); // 夜空（星/月/暮光渐变）跟随相机更新

  // 城市夜景：矢量灯网（真实路网，夜间全程显示，LOD 随 AGL 自适应）为主，cityLights 光晕兜底。
  const acs = aircraft.state();
  const elevHere = terrain.elevationAt(acs.lon, acs.lat);
  const aglHere = elevHere == null ? acs.alt : acs.alt - elevHere;
  const night = lightInfo ? lightInfo.night : 0;
  // 传入航向与地速：航线固定、路径可预测 → 沿航向前向偏置 + 远端预热缓存，提前加载前方灯网
  const gsMps = acs.speedKt / 1.94384;
  cityNetwork.update(acs.lon, acs.lat, aglHere, night, now, acs.headingRad, gsMps);
  // 灯网活跃时关闭光晕兜底，避免模糊光斑污染真实灯网；否则光晕全亮
  cityLights.update(night, now, cityNetwork.isActive() ? 0 : 1);

  renderer.render(scene, camera);

  // 地形加载过渡层：地形就绪后渐隐（用无超时的 raycast 判定当前机场脚下地形）
  loadingMap.update(now, terrainLoadedHere());

  // GPWS 评估（约每 250ms 一次），闪烁每帧更新
  if (now - lastGpwsEval > 250) {
    gpwsInfo = gpws.evaluate();
    lastGpwsEval = now;
  }
  hud.update();
  hud.setGPWS(gpwsInfo, now);

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
cityLights.rebuild(currentAirport.lat, currentAirport.lon); // 初始机场城市灯
setInterval(refreshLighting, 5000); // 随时间缓慢刷新
setupFreeCameraControls();
updateCamera();
requestAnimationFrame(frame);

console.log('[flySim] 就绪。统一 three.js 场景 + geo-three 全球地形（AWS Terrarium DEM + Esri 影像，无需 token）');
