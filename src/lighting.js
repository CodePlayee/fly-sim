import SunCalc from 'suncalc';

/**
 * 用 SunCalc（纯本地计算，无网络）按真实经纬度+时刻求太阳/月亮位置，
 * 据此驱动 MapLibre 天空大气、雾霾、地形光照方向与昼夜明暗。
 *
 * MapLibre setSky 的 sun 用 [方位角(度), 极角(度)]：
 *   方位角 0=北，顺时针；极角 0=天顶，90=地平线，180=正下方。
 * SunCalc 返回 azimuth（弧度，从正南起，向西为正）与 altitude（弧度，地平线以上为正）。
 */

function sunCalcToSky(azimuthRad, altitudeRad) {
  // SunCalc azimuth: 0 = 南，π/2 = 西。转为以北为 0、顺时针的方位角：
  const azDeg = (180 + (azimuthRad * 180) / Math.PI + 360) % 360;
  // altitude -> 极角：天顶=0，地平线=90
  const polarDeg = 90 - (altitudeRad * 180) / Math.PI;
  return [azDeg, Math.max(0, Math.min(180, polarDeg))];
}

/** 根据太阳高度角返回一组天空/雾/光照配色 */
function palette(sunAltDeg) {
  // 关键阈值：白天 / 黄昏 / 夜晚
  if (sunAltDeg > 10) {
    return {
      atmosphere: '#bcd9ff',
      sky: '#4a90e2',
      fog: 'rgba(190,215,240,0.18)',
      ambient: 1.0,
      sunIntensity: 12,
      haloColor: '#fffaf0',
    };
  } else if (sunAltDeg > -2) {
    // 日出/日落金光
    return {
      atmosphere: '#ffb56b',
      sky: '#2a4a82',
      fog: 'rgba(255,170,100,0.22)',
      ambient: 0.6,
      sunIntensity: 8,
      haloColor: '#ffd9a0',
    };
  } else if (sunAltDeg > -10) {
    // 暮光/蓝调
    return {
      atmosphere: '#5a6a9a',
      sky: '#13203f',
      fog: 'rgba(60,75,120,0.3)',
      ambient: 0.35,
      sunIntensity: 4,
      haloColor: '#9fb0d8',
    };
  }
  // 夜晚
  return {
    atmosphere: '#1a2540',
    sky: '#05080f',
    fog: 'rgba(10,15,30,0.4)',
    ambient: 0.18,
    sunIntensity: 2,
    haloColor: '#2a3a60',
  };
}

/**
 * 应用某时刻、某经纬度的光照到地图。
 * @param map MapLibre 地图
 * @param date JS Date（UTC 时刻）
 * @param lon,lat 观察点
 */
export function applyLighting(map, date, lon, lat) {
  const sun = SunCalc.getPosition(date, lat, lon);
  const moon = SunCalc.getMoonPosition(date, lat, lon);
  const sunAltDeg = (sun.altitude * 180) / Math.PI;

  const [sunAz, sunPolar] = sunCalcToSky(sun.azimuth, sun.altitude);
  const pal = palette(sunAltDeg);

  // 夜间太阳在地平线下，改用月亮作为天体光照方向
  const useMoon = sunAltDeg < -6 && moon.altitude > 0;
  const [az, polar] = useMoon
    ? sunCalcToSky(moon.azimuth, moon.altitude)
    : [sunAz, sunPolar];

  // 天空大气（MapLibre v4 sky spec）
  try {
    map.setSky({
      'sky-color': pal.sky,
      'horizon-color': pal.atmosphere,
      'fog-color': pal.fog,
      'fog-ground-blend': sunAltDeg > 5 ? 0.85 : 0.5,
      'horizon-fog-blend': sunAltDeg > 5 ? 0.4 : 0.7,
      'sky-horizon-blend': 0.6,
      'atmosphere-blend': sunAltDeg > -10 ? 0.6 : 0.2,
    });
  } catch (e) {
    // 旧版 sky 规格回退
    map.setSky({
      'atmosphere-sun': [az, polar],
      'atmosphere-sun-intensity': pal.sunIntensity,
      'atmosphere-color': pal.atmosphere,
      'atmosphere-halo-color': pal.haloColor,
    });
  }

  // 用天体方位驱动山体阴影方向，模拟太阳/月亮真实照射角
  if (map.getLayer('hillshade')) {
    map.setPaintProperty('hillshade', 'hillshade-illumination-direction', Math.round(az));
    map.setPaintProperty(
      'hillshade',
      'hillshade-exaggeration',
      Math.max(0.15, pal.ambient * 0.55)
    );
    // 夜间整体压暗高光
    map.setPaintProperty(
      'hillshade',
      'hillshade-highlight-color',
      sunAltDeg > 0 ? '#ffffff' : '#3a4660'
    );
  }

  // 卫星影像随昼夜整体明暗（用 raster-brightness 模拟环境光）
  if (map.getLayer('satellite')) {
    const b = Math.max(0.12, Math.min(1, pal.ambient));
    map.setPaintProperty('satellite', 'raster-brightness-max', b);
    map.setPaintProperty('satellite', 'raster-brightness-min', 0);
  }

  return { sunAltDeg, useMoon, azimuth: az, polar, ambient: pal.ambient };
}

/** 把"机场当地某钟点"换算为 UTC Date */
export function localHourToDate(airport, localHour, baseDate = new Date()) {
  const y = baseDate.getUTCFullYear();
  const m = baseDate.getUTCMonth();
  const d = baseDate.getUTCDate();
  const utcHour = localHour - airport.timezone;
  return new Date(Date.UTC(y, m, d) + utcHour * 3600 * 1000);
}
