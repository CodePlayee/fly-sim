/**
 * 地形高程查询器：直接解码 AWS Terrarium DEM 瓦片，按经纬度返回真实海拔（米）。
 *
 * 为什么不用 map.queryTerrainElevation：
 *   MapLibre 的该函数从 GPU 渲染的地形帧缓冲反查，在大 pitch（本项目 75°）或
 *   查询点偏离视口中心时会返回系统性错误甚至负数（实测大帽山 957m 被读成 64m
 *   甚至 −19.7m）。而原始 Terrarium 瓦片像素解码出来是准的（同点 952m）。
 *
 * 本模块直接抓 DEM 瓦片，按 Terrarium 公式解码：
 *   elevation = (R*256 + G + B/256) − 32768
 * 并对瓦片内像素做双线性插值。瓦片以 LRU 方式缓存（Uint8 像素），命中后纯本地计算，
 * 无网络、可在每帧/预测航迹上密集采样。
 */

const TILE = 256;
const DEM_URL = (z, x, y) =>
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

export function createTerrain({ maxZoom = 14, cacheSize = 256 } = {}) {
  // 瓦片缓存：key=`z/x/y` -> { data:Uint8ClampedArray|null, loading:bool }
  const cache = new Map();
  const order = []; // LRU 顺序

  // 离屏 canvas 复用
  const cv = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (cv) { cv.width = TILE; cv.height = TILE; }
  const cx = cv ? cv.getContext('2d', { willReadFrequently: true }) : null;

  function touch(key) {
    const i = order.indexOf(key);
    if (i >= 0) order.splice(i, 1);
    order.push(key);
    while (order.length > cacheSize) {
      const old = order.shift();
      cache.delete(old);
    }
  }

  function loadTile(z, x, y) {
    const key = `${z}/${x}/${y}`;
    let entry = cache.get(key);
    if (entry) { touch(key); return entry; }
    entry = { data: null, loading: true };
    cache.set(key, entry);
    touch(key);

    if (!cx) { entry.loading = false; return entry; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        cx.clearRect(0, 0, TILE, TILE);
        cx.drawImage(img, 0, 0, TILE, TILE);
        entry.data = cx.getImageData(0, 0, TILE, TILE).data; // RGBA
      } catch (_) {
        entry.data = null;
      }
      entry.loading = false;
    };
    img.onerror = () => { entry.loading = false; };
    img.src = DEM_URL(z, x, y);
    return entry;
  }

  // 解码单像素高程（Terrarium）
  function decode(data, px, py) {
    const i = (py * TILE + px) * 4;
    const R = data[i], G = data[i + 1], B = data[i + 2];
    return (R * 256 + G + B / 256) - 32768;
  }

  /**
   * 查询某经纬度的地形海拔（米）。
   * @returns {number|null} 米；瓦片尚未加载时返回 null（调用方可用上次值兜底）。
   */
  function elevationAt(lon, lat, zoom = maxZoom) {
    const z = Math.max(0, Math.min(maxZoom, Math.round(zoom)));
    const n = Math.pow(2, z);
    const xf = ((lon + 180) / 360) * n;
    const latR = (lat * Math.PI) / 180;
    const yf = ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n;
    const xt = Math.floor(xf), yt = Math.floor(yf);
    // 像素坐标（带小数，用于双线性）
    const fx = (xf - xt) * TILE;
    const fy = (yf - yt) * TILE;

    const entry = loadTile(z, xt, yt);
    if (!entry.data) return null; // 还没好

    // 双线性插值（边界夹紧；跨瓦片简单夹紧，误差可忽略）
    const x0 = Math.max(0, Math.min(TILE - 1, Math.floor(fx)));
    const y0 = Math.max(0, Math.min(TILE - 1, Math.floor(fy)));
    const x1 = Math.min(TILE - 1, x0 + 1);
    const y1 = Math.min(TILE - 1, y0 + 1);
    const tx = fx - x0, ty = fy - y0;

    const e00 = decode(entry.data, x0, y0);
    const e10 = decode(entry.data, x1, y0);
    const e01 = decode(entry.data, x0, y1);
    const e11 = decode(entry.data, x1, y1);
    const top = e00 * (1 - tx) + e10 * tx;
    const bot = e01 * (1 - tx) + e11 * tx;
    return top * (1 - ty) + bot * ty;
  }

  /** 预取某点所在瓦片（不阻塞，供提前拉取航迹上的瓦片）。 */
  function prefetch(lon, lat, zoom = maxZoom) {
    const z = Math.max(0, Math.min(maxZoom, Math.round(zoom)));
    const n = Math.pow(2, z);
    const xt = Math.floor(((lon + 180) / 360) * n);
    const latR = (lat * Math.PI) / 180;
    const yt = Math.floor(((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n);
    loadTile(z, xt, yt);
  }

  return { elevationAt, prefetch };
}
