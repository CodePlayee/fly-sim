import SunCalc from 'suncalc';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

/**
 * 用 SunCalc（纯本地计算，无网络）按真实经纬度+时刻求太阳/月亮位置，
 * 据此驱动 three.js 天空大气(Sky)、平行光(太阳/月亮)、环境光与雾，
 * 实现随真实时间变化的昼夜光照。
 *
 * SunCalc：azimuth 弧度（从正南起、向西为正），altitude 弧度（地平线以上为正）。
 * 天体方位角（以北为 0、顺时针）= 180 + azimuth(度)。
 */

const DEG = Math.PI / 180;

/** 根据太阳高度角返回一组天空/光照配色与强度 */
function palette(sunAltDeg) {
  if (sunAltDeg > 10) {
    // 白天
    return {
      fog: '#bcd9ff',
      sun: '#fffaf0',
      ambient: '#9fb8d8',
      ambientIntensity: 0.55,
      sunIntensity: 2.6,
      turbidity: 6,
      rayleigh: 1.6,
      ambientLevel: 1.0,
    };
  } else if (sunAltDeg > -2) {
    // 日出/日落金光
    return {
      fog: '#ffb56b',
      sun: '#ffd9a0',
      ambient: '#7a6a7a',
      ambientIntensity: 0.4,
      sunIntensity: 1.8,
      turbidity: 10,
      rayleigh: 3,
      ambientLevel: 0.6,
    };
  } else if (sunAltDeg > -10) {
    // 暮光/蓝调
    return {
      fog: '#3a4a6a',
      sun: '#9fb0d8',
      ambient: '#3a4660',
      ambientIntensity: 0.28,
      sunIntensity: 0.5,
      turbidity: 4,
      rayleigh: 1,
      ambientLevel: 0.35,
    };
  }
  // 夜晚（保留少量月光环境光，使地形不至于纯黑）
  return {
    fog: '#0a1024',
    sun: '#8c9ec4',
    ambient: '#33405e',
    ambientIntensity: 0.62,
    sunIntensity: 0.55,
    turbidity: 0.5,
    rayleigh: 0.2,
    ambientLevel: 0.18,
  };
}

/**
 * 建立一次光照装置（Sky 穹顶 + 平行光 + 环境光 + 雾），返回 env 句柄。
 * 之后 applyLighting(env, ...) 每次时间变化时更新它。
 */
export function setupSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);
  const u = sky.material.uniforms;
  u.turbidity.value = 6;
  u.rayleigh.value = 1.6;
  u.mieCoefficient.value = 0.005;
  u.mieDirectionalG.value = 0.8;

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  scene.add(sunLight);
  scene.add(sunLight.target);

  const ambLight = new THREE.AmbientLight(0x9fb8d8, 0.55);
  scene.add(ambLight);

  scene.fog = new THREE.Fog(0xbcd9ff, 8000, 160000);

  return { scene, sky, sunLight, ambLight };
}

/**
 * 应用某时刻、某经纬度的光照到 three.js 场景。
 * @param env setupSky 返回的句柄 { scene, sky, sunLight, ambLight }
 * @param date JS Date（UTC 时刻）
 * @param lon,lat 观察点
 * @returns { sunAltDeg, useMoon, azimuth, polar, ambient } （形状保持与旧版兼容）
 */
export function applyLighting(env, date, lon, lat) {
  const sun = SunCalc.getPosition(date, lat, lon);
  const moon = SunCalc.getMoonPosition(date, lat, lon);
  const sunAltDeg = (sun.altitude * 180) / Math.PI;

  // 夜间太阳在地平线下，改用月亮作为天体光照方向
  const useMoon = sunAltDeg < -6 && moon.altitude > 0;
  const bodyAz = useMoon ? moon.azimuth : sun.azimuth; // 弧度，从南起向西
  const bodyAlt = useMoon ? moon.altitude : sun.altitude;

  // 方位角（以北为 0、顺时针）与极角（天顶=0）
  const azimuthDeg = (180 + (bodyAz * 180) / Math.PI + 360) % 360;
  const polarDeg = 90 - (bodyAlt * 180) / Math.PI;
  const azimuth = azimuthDeg * DEG;
  const polar = polarDeg * DEG;

  const pal = palette(sunAltDeg);

  // ---- 天体方向单位向量（世界系：北=-Z、东=+X、上=+Y）----
  // 方位角以北(−Z)为 0、顺时针(向东+X)；极角自天顶。
  const sinP = Math.sin(polar);
  const dir = new THREE.Vector3(
    sinP * Math.sin(azimuth), // 东分量 +X
    Math.cos(polar), //          上分量 +Y
    -sinP * Math.cos(azimuth) // 北分量 -Z
  );

  // ---- Sky 穹顶 ----
  const u = env.sky.material.uniforms;
  u.sunPosition.value.copy(dir);
  u.turbidity.value = pal.turbidity;
  u.rayleigh.value = pal.rayleigh;

  // ---- 平行光（从天体方向射向场景）----
  env.sunLight.position.copy(dir).multiplyScalar(100000);
  env.sunLight.target.position.set(0, 0, 0);
  env.sunLight.target.updateMatrixWorld();
  env.sunLight.color.set(pal.sun);
  env.sunLight.intensity = pal.sunIntensity;

  // ---- 环境光 ----
  env.ambLight.color.set(pal.ambient);
  env.ambLight.intensity = pal.ambientIntensity;

  // ---- 雾 ----
  if (env.scene.fog) {
    env.scene.fog.color.set(pal.fog);
    // 白天看得远，夜晚/暮光收近
    env.scene.fog.far = sunAltDeg > 0 ? 180000 : 90000;
  }

  // ---- 月亮方向（独立于光照天体，供天空渲染月亮精灵）----
  const moonAzDeg = (180 + (moon.azimuth * 180) / Math.PI + 360) % 360;
  const moonPolar = (90 - (moon.altitude * 180) / Math.PI) * DEG;
  const moonAz = moonAzDeg * DEG;
  const sinMP = Math.sin(moonPolar);
  const moonDir = new THREE.Vector3(
    sinMP * Math.sin(moonAz),
    Math.cos(moonPolar),
    -sinMP * Math.cos(moonAz)
  );
  const illum = SunCalc.getMoonIllumination(date);

  // 夜间因子：0=白天/暮光，1=完全黑夜。用于星空/月亮淡入与背景压暗。
  const night = clampN((-4 - sunAltDeg) / 10, 0, 1);

  return {
    sunAltDeg,
    useMoon,
    azimuth,
    polar,
    ambient: pal.ambientLevel,
    night,
    moonDir,
    moonAltDeg: (moon.altitude * 180) / Math.PI,
    moonPhase: illum.phase, // 0=新月,0.5=满月,1=新月
    moonFraction: illum.fraction, // 被照亮比例
  };
}

function clampN(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/** 把"机场当地某钟点"换算为 UTC Date */
export function localHourToDate(airport, localHour, baseDate = new Date()) {
  const y = baseDate.getUTCFullYear();
  const m = baseDate.getUTCMonth();
  const d = baseDate.getUTCDate();
  const utcHour = localHour - airport.timezone;
  return new Date(Date.UTC(y, m, d) + utcHour * 3600 * 1000);
}
