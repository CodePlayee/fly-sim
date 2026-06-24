import { createTerrain } from './terrain.js';

/**
 * 近地警告系统（GPWS / Ground Proximity Warning System）。
 *
 * 原理：从飞机当前位置出发，沿预测航迹（按当前航向、地速、垂直速度外推）
 * 采样若干点，取该点真实地形高度，
 * 计算预测航迹相对地形的最小离地余量(AGL)与"撞地剩余时间"，分级告警。
 *
 * 地形高程来自 src/terrain.js（直接解码 Terrarium DEM 瓦片），
 * 不用 map.queryTerrainElevation（其在大 pitch 下返回系统性错误值，
 * 实测把 957m 的山读成 64m 甚至负数）。
 *
 * 告警分级（参考真实 GPWS 模式）：
 *   none    安全
 *   caution "TERRAIN AHEAD" —— 预测路径将接近地形（黄色）
 *   warning "PULL UP"       —— 预测路径将在很短时间内撞地（红色）
 */

const DEG = Math.PI / 180;
const R = 6378137;

export function createGPWS(map, getAircraftState, terrain) {
  // 允许外部注入共享的 terrain 实例；未提供则自建
  const terr = terrain || createTerrain({ maxZoom: 14 });
  // 预测参数
  const HORIZON_S = 30;     // 向前预测的时间(秒)
  const STEP_S = 1.0;       // 采样步长(秒)
  const CAUTION_AGL = 150;  // 低于此离地高度(米) -> 黄色警戒
  const WARN_AGL = 60;      // 低于此离地高度(米) -> 红色警告
  const WARN_TTI = 12;      // 预测撞地剩余时间(秒)低于此 -> 红色
  const CAUTION_TTI = 22;

  let last = { level: 'none', minAgl: Infinity, timeToImpact: Infinity, text: '' };

  function evaluate() {
    const s = getAircraftState();
    if (!s || s.onGround) {
      last = { level: 'none', minAgl: Infinity, timeToImpact: Infinity, text: '' };
      return last;
    }

    const hdg = s.headingRad != null ? s.headingRad : (s.headingDeg || 0) * DEG;
    const groundSpeed = (s.speedKt || 0) / 1.94384; // m/s
    const vSpeed = s.vSpeedMs || 0;

    let lon = s.lon;
    let lat = s.lat;
    let alt = s.alt;

    let minAgl = Infinity;
    let timeToImpact = Infinity;

    // 飞机当前正下方离地（即时 AGL）
    const elevHere = sampleTerrain(terr, s.lon, s.lat);
    const aglHere = alt - elevHere;
    minAgl = aglHere;

    // 沿预测航迹外推
    const cosLat = Math.cos(lat * DEG);
    for (let t = STEP_S; t <= HORIZON_S; t += STEP_S) {
      // 水平推进
      const horiz = groundSpeed * STEP_S;
      const dLat = (horiz * Math.cos(hdg)) / R;
      const dLon = (horiz * Math.sin(hdg)) / (R * cosLat);
      lat += dLat / DEG;
      lon += dLon / DEG;
      // 垂直推进（假定当前垂直速度延续；预测保守起见不假设拉起）
      alt += vSpeed * STEP_S;

      // 预取更前方的瓦片，降低采样落空概率
      terr.prefetch(lon, lat);
      const elev = sampleTerrain(terr, lon, lat);
      if (elev == null) continue;
      const agl = alt - elev;
      if (agl < minAgl) minAgl = agl;

      // 预测撞地：航迹高度低于地形
      if (agl <= 0 && timeToImpact === Infinity) {
        timeToImpact = t;
        break;
      }
    }

    // 分级
    let level = 'none';
    let text = '';
    if (timeToImpact <= WARN_TTI || minAgl <= WARN_AGL) {
      level = 'warning';
      text = 'PULL UP';
    } else if (timeToImpact <= CAUTION_TTI || minAgl <= CAUTION_AGL) {
      level = 'caution';
      text = 'TERRAIN AHEAD';
    }

    last = { level, minAgl, timeToImpact, text, aglHere };
    return last;
  }

  return { evaluate, getLast: () => last };
}

/**
 * 查询某经纬度的地形高程（米）。
 * 用自解码 DEM；瓦片未就绪时返回上次有效值（避免瞬时落空导致 AGL 跳变）。
 */
let _lastElev = 0;
function sampleTerrain(terr, lon, lat) {
  const e = terr.elevationAt(lon, lat);
  if (typeof e === 'number' && isFinite(e)) {
    _lastElev = e;
    return e;
  }
  return _lastElev; // 兜底：用最近一次有效高程
}
