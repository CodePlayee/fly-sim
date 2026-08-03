import { MapProvider } from 'geo-three';
import { demTileUrl } from './demHosts.js';
import { RetryingImageLoader } from './RetryingImageLoader.js';
import { flattenAt, flattenIntersects, hasFlattenZones, FLATTEN_MIN_ZOOM } from '../runwayFlatten.js';

/**
 * AWS 开放数据集 Terrarium DEM 高程 provider（免费、无需 token）。
 *
 * geo-three 把 Mapbox RGB 解码公式硬编码在 MapNodeHeightGeometry：
 *   height = (R*65536 + G*256 + B) * 0.1 − 10000
 * 而本源是 Terrarium 编码：
 *   height = R*256 + G + B/256 − 32768
 * 故在 fetchTile 里**转码**：解 Terrarium 高程，再反编码成 Mapbox RGB 写进 canvas
 * 返回（geo-three 当成普通高程图解码即得正确高程）。往返误差 ≤ 0.05m，可忽略。
 *
 * 转码的同时顺带做**机场跑道压平**（runwayFlatten.js），使视觉地形 mesh 与
 * `aircraft.js` 的触地高度、`terrain.js` 的 AGL 读数在机场区域严格一致，
 * 否则起飞滑跑时飞机会陷进起伏的低精度地形里。
 *
 * ⚠️ 瓦片 URL 顺序是 {z}/{x}/{y}（与 Esri 的 {z}/{y}/{x} 不同）。
 * ⚠️ crossOrigin 必须设，否则 canvas 被污染、getImageData 抛 SecurityError。
 * ⚠️ 主机来自 demHosts.js 的多 origin 轮转（S3 只有 HTTP/1.1，单 origin 仅 6 条连接）。
 */

/** slippy 瓦片行/列 -> 经纬度（用于压平时定位像素）。 */
function tileLon(zoom, x, fx) { return ((x + fx) / 2 ** zoom) * 360 - 180; }
function tileLat(zoom, y, fy) {
  const n = Math.PI * (1 - 2 * (y + fy) / 2 ** zoom);
  return (Math.atan(Math.sinh(n)) * 180) / Math.PI;
}

export class TerrariumHeightProvider extends MapProvider {
  constructor() {
    super();
    this.name = 'aws-terrarium';
    this.minZoom = 0;
    this.maxZoom = 15; // Terrarium 最高 z15
    this.loader = new RetryingImageLoader();
  }

  fetchTile(zoom, x, y) {
    return this.loader.load(demTileUrl(zoom, x, y)) // 注意：{z}/{x}/{y}
      .then((img) => this.transcode(img, zoom, x, y));
  }

  /** Terrarium -> Mapbox RGB 转码（顺带做机场跑道压平），返回 canvas 供 geo-three 解码。 */
  transcode(img, zoom, x, y) {
    const w = img.naturalWidth || 256;
    const h = img.naturalHeight || 256;
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;

    // 本瓦片是否落在某个机场压平区内（先用包围盒排除，绝大多数瓦片直接跳过）
    let flat = false, lons = null, lats = null;
    if (zoom >= FLATTEN_MIN_ZOOM && hasFlattenZones()) {
      const lonA = tileLon(zoom, x, 0), lonB = tileLon(zoom, x, 1);
      const latA = tileLat(zoom, y, 0), latB = tileLat(zoom, y, 1);
      flat = flattenIntersects(
        Math.min(lonA, lonB), Math.min(latA, latB),
        Math.max(lonA, lonB), Math.max(latA, latB)
      );
      if (flat) {
        // 逐行/逐列预算经纬度（避免在 65536 次内层循环里反复算 atan/sinh）
        lons = new Float64Array(w);
        lats = new Float64Array(h);
        for (let px = 0; px < w; px++) lons[px] = tileLon(zoom, x, (px + 0.5) / w);
        for (let py = 0; py < h; py++) lats[py] = tileLat(zoom, y, (py + 0.5) / h);
      }
    }

    for (let i = 0; i < d.length; i += 4) {
      // Terrarium 解码
      let elev = d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768;
      if (flat) {
        const p = i >> 2;
        elev = flattenAt(lons[p % w], lats[(p / w) | 0], elev); // 机场跑道压平
      }
      // Mapbox RGB 反编码：v = round((elev + 10000) * 10)
      const v = Math.max(0, Math.min(0xffffff, Math.round((elev + 10000) * 10)));
      d[i] = (v >> 16) & 0xff; // R
      d[i + 1] = (v >> 8) & 0xff; // G
      d[i + 2] = v & 0xff; // B
      d[i + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    return cv;
  }

  /** 中止并重排所有在途瓦片请求（换机场时释放 HTTP/1.1 的连接额度）。 */
  abortPending() {
    return this.loader.abortPending();
  }
}
