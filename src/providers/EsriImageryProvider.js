import { MapProvider } from 'geo-three';

/**
 * Esri World Imagery 卫星影像 provider（免费、无需 token）。
 * 作为 geo-three 地形的颜色贴图。
 *
 * ⚠️ 瓦片 URL 顺序是 {z}/{y}/{x}（Esri/TMS-like），
 *    与 Terrarium DEM 的 {z}/{x}/{y} 不同——搞反会导致影像错位/镜像。
 */
export class EsriImageryProvider extends MapProvider {
  constructor() {
    super();
    this.name = 'esri-world-imagery';
    this.minZoom = 0;
    this.maxZoom = 19;
    this.base =
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile';
  }

  fetchTile(zoom, x, y) {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous'; // 供 three 纹理使用
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `${this.base}/${zoom}/${y}/${x}`; // 注意：{z}/{y}/{x}
    });
  }
}
