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

/** 内置 3 机场的 ICAO（即时可用 + 离线兜底）。 */
export const BUILTIN_KEYS = Object.keys(AIRPORTS);

/**
 * 运行时机场注册表：初始为内置 3 个，动态搜索到的机场并入此表，
 * 供 hud / minimap / main 统一按 ICAO 引用。
 */
export const REGISTRY = { ...AIRPORTS };

/**
 * 把数据层机场 record 规范成统一字段契约。
 * @param record dataSource 返回的 {icao,iata,name,city,country,lat,lon,elevation,timezone}
 * @param runwayHeading 真跑道航向（度）；为 null 时回退（朝北）
 */
export function makeAirport(record, runwayHeading) {
  const heading = (runwayHeading != null && Number.isFinite(runwayHeading))
    ? runwayHeading : 0;
  return {
    icao: record.icao || record.iata || '????',
    iata: record.iata || '',
    name: record.name || record.city || record.icao || '机场',
    city: record.city || record.name || '',
    country: record.country || '',
    lon: record.lon,
    lat: record.lat,
    elevation: Number.isFinite(record.elevation) ? record.elevation : 0,
    runwayHeading: heading,
    timezone: Number.isFinite(record.timezone)
      ? record.timezone : Math.round((record.lon || 0) / 15),
  };
}

/** 把机场并入运行时注册表（按 ICAO 去重，已存在则保留原有手工校准值）。 */
export function registerAirport(ap) {
  if (!ap || !ap.icao) return ap;
  if (!REGISTRY[ap.icao]) REGISTRY[ap.icao] = ap;
  return REGISTRY[ap.icao];
}
