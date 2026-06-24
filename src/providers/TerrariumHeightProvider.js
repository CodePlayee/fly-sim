import { MapProvider } from 'geo-three';

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
 * ⚠️ 瓦片 URL 顺序是 {z}/{x}/{y}（与 Esri 的 {z}/{y}/{x} 不同）。
 * ⚠️ crossOrigin 必须设，否则 canvas 被污染、getImageData 抛 SecurityError。
 */
export class TerrariumHeightProvider extends MapProvider {
  constructor() {
    super();
    this.name = 'aws-terrarium';
    this.minZoom = 0;
    this.maxZoom = 15; // Terrarium 最高 z15
    this.base = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium';
  }

  fetchTile(zoom, x, y) {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = img.naturalWidth || 256;
          const h = img.naturalHeight || 256;
          const cv = document.createElement('canvas');
          cv.width = w;
          cv.height = h;
          const ctx = cv.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, w, h);
          const id = ctx.getImageData(0, 0, w, h);
          const d = id.data;
          for (let i = 0; i < d.length; i += 4) {
            // Terrarium 解码
            const elev = d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768;
            // Mapbox RGB 反编码：v = round((elev + 10000) * 10)
            const v = Math.max(0, Math.min(0xffffff, Math.round((elev + 10000) * 10)));
            d[i] = (v >> 16) & 0xff; // R
            d[i + 1] = (v >> 8) & 0xff; // G
            d[i + 2] = v & 0xff; // B
            d[i + 3] = 255;
          }
          ctx.putImageData(id, 0, 0);
          resolve(cv); // 返回 canvas
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = `${this.base}/${zoom}/${x}/${y}.png`; // 注意：{z}/{x}/{y}
    });
  }
}
