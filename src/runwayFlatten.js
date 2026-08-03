/**
 * 机场跑道压平（runway flattening）——真实模拟器的标准做法。
 *
 * ## 要解决的问题
 * 全球 DEM 精度有限（Terrarium z14/z15 约 10~30m/px），而 geo-three 每块瓦片
 * 只把 256×256 高程降采样成 **17×17 个顶点**（z14 下约 150m 一个采样点），
 * 于是跑道沿线的地形 mesh 是**起伏**的。而 `aircraft.js` 的触地判定用的是常数
 * `fieldElevation + 3`（机场标高），两者对不上 —— 滑跑中只要某处地形高过机场标高，
 * 飞机就会被埋进地面。
 *
 * 更麻烦的是，即使让飞机改为跟随 `terrain.elevationAt` 也**解决不了**：
 * 那是 256×256 双线性采样，与 geo-three 的 17×17 最近邻降采样根本是两个值，
 * 差异可达数十米（`cityNetwork.js` 的 `LIGHT_LIFT` 正是为绕开这个差异而存在）。
 *
 * ## 做法
 * 在机场周围把高程**强制压平到机场标高**，并向外平滑过渡回真实地形：
 *
 *   d ≤ FLAT_RADIUS                     -> 恒等于 airport.elevation（完全平）
 *   FLAT_RADIUS < d < BLEND_RADIUS      -> smoothstep 混合，避免出现环形悬崖
 *   d ≥ BLEND_RADIUS                    -> 原始高程，真实地貌不受影响
 *
 * 压平同时作用于**两条链路**，从而两者在机场区域严格相等、误差为 0：
 *   - `TerrariumHeightProvider`：写进瓦片像素 -> 决定 geo-three 的**视觉 mesh**
 *   - `terrain.js elevationAt`：输出端修正   -> 决定 **AGL / GPWS** 读数
 *
 * ## 注册时机
 * 必须在该机场的瓦片被加载**之前**注册（`main.js` 在启动和 goToAirport 里、
 * warmupTerrain 之前调用），否则已解码缓存的瓦片不会重新压平。
 * 注册表是累积的（去过的机场都保持压平），来回切换机场也不会失效。
 */

const DEG = Math.PI / 180;

const FLAT_RADIUS = 2200;   // m：完全压平半径（覆盖最长跑道的半长，如 VHHH 3800m 跑道半长 1900m）
const BLEND_RADIUS = 6000;  // m：过渡到真实地形的外半径

/**
 * 低于此 zoom 的瓦片不做压平：z9 瓦片一个像素已代表 ~300m、经 geo-three 降采样后
 * 顶点间距达数 km，压平区只落在 0~1 个顶点上，做了也没有视觉意义，
 * 却要为每块瓦片白跑 65536 次逐像素计算（链路上每一级都有一块与压平区相交）。
 */
export const FLATTEN_MIN_ZOOM = 10;

/** @type {Array<{lat:number, lon:number, elevation:number, cosLat:number}>} */
const zones = [];

/** 注册一个机场压平区（按经纬度去重）。 */
export function registerFlatten(airport) {
  if (!airport || !Number.isFinite(airport.lat) || !Number.isFinite(airport.lon)) return;
  const elevation = Number.isFinite(airport.elevation) ? airport.elevation : 0;
  for (const z of zones) {
    if (Math.abs(z.lat - airport.lat) < 1e-6 && Math.abs(z.lon - airport.lon) < 1e-6) {
      z.elevation = elevation;
      return;
    }
  }
  zones.push({
    lat: airport.lat,
    lon: airport.lon,
    elevation,
    cosLat: Math.cos(airport.lat * DEG),
  });
}

/** 压平区的经纬度半跨度（用于瓦片包围盒快速排除）。 */
function lonSpan(z) { return BLEND_RADIUS / (111320 * Math.max(0.05, z.cosLat)); }
const LAT_SPAN = BLEND_RADIUS / 110540;

/**
 * 某个经纬度包围盒是否与任一压平区相交。瓦片解码前先用它排除绝大多数瓦片，
 * 避免为每块瓦片白跑 65536 次逐像素计算。
 */
export function flattenIntersects(lonMin, latMin, lonMax, latMax) {
  for (const z of zones) {
    const dLon = lonSpan(z);
    if (lonMax < z.lon - dLon || lonMin > z.lon + dLon) continue;
    if (latMax < z.lat - LAT_SPAN || latMin > z.lat + LAT_SPAN) continue;
    return true;
  }
  return false;
}

/** 是否已注册任何压平区。 */
export function hasFlattenZones() { return zones.length > 0; }

/**
 * 对某点的原始高程应用压平。不在任何压平区内则原样返回。
 * @param {number} lon
 * @param {number} lat
 * @param {number} rawElev 原始高程（米）
 * @returns {number}
 */
export function flattenAt(lon, lat, rawElev) {
  let out = rawElev;
  for (const z of zones) {
    // 局部平面近似即可（作用半径仅数 km）
    const dx = (lon - z.lon) * 111320 * z.cosLat;
    const dy = (lat - z.lat) * 110540;
    const d = Math.hypot(dx, dy);
    if (d >= BLEND_RADIUS) continue;
    let w = 1; // 压平权重
    if (d > FLAT_RADIUS) {
      const t = (d - FLAT_RADIUS) / (BLEND_RADIUS - FLAT_RADIUS);
      w = 1 - t * t * (3 - 2 * t); // smoothstep 反向：内 1 -> 外 0
    }
    out = out * (1 - w) + z.elevation * w;
  }
  return out;
}
