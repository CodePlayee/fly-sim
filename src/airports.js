/**
 * 世界知名国际机场预设。
 * 坐标为跑道入口附近的真实经纬度，heading 为主跑道磁航向（度，0=北，顺时针）。
 * elevation 单位米（机场标高 / field elevation）。
 */
export const AIRPORTS = {
  VHHH: {
    icao: 'VHHH',
    name: '香港国际机场 Hong Kong Intl',
    city: '香港 Hong Kong',
    // 07R/25L 跑道
    lon: 113.9185,
    lat: 22.3089,
    elevation: 9,
    runwayHeading: 70, // 07R
    timezone: 8,
  },
  KSFO: {
    icao: 'KSFO',
    name: '旧金山国际机场 San Francisco Intl',
    city: '旧金山 San Francisco',
    // 28R 跑道
    lon: -122.3875,
    lat: 37.6189,
    elevation: 4,
    runwayHeading: 281, // 28R
    timezone: -7,
  },
  LFPG: {
    icao: 'LFPG',
    name: '巴黎戴高乐机场 Paris Charles de Gaulle',
    city: '巴黎 Paris',
    // 09L/27R
    lon: 2.5479,
    lat: 49.0205,
    elevation: 119,
    runwayHeading: 87, // 09L
    timezone: 2,
  },
};

export const DEFAULT_AIRPORT = 'VHHH';
