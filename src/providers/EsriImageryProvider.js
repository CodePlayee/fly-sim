import { MapProvider } from 'geo-three';
import { RetryingImageLoader } from './RetryingImageLoader.js';

/**
 * Esri World Imagery 卫星影像 provider（免费、无需 token）。
 * 作为 geo-three 地形的颜色贴图。
 *
 * ⚠️ 瓦片 URL 顺序是 {z}/{y}/{x}（Esri/TMS-like），
 *    与 Terrarium DEM 的 {z}/{x}/{y} 不同——搞反会导致影像错位/镜像。
 *
 * 服务器只支持 HTTP/1.1（单 origin 仅 6 条并发连接），故经 RetryingImageLoader 加载：
 * 换机场时 abortPending() 中止旧机场在途请求把连接让给新机场，且这些请求会**自动重排**，
 * 不会因失败被 geo-three 贴上纯黑 defaultTexture（黑色矩形）。
 */
export class EsriImageryProvider extends MapProvider {
  constructor() {
    super();
    this.name = 'esri-world-imagery';
    this.minZoom = 0;
    this.maxZoom = 19;
    this.base =
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile';
    this.loader = new RetryingImageLoader();
  }

  fetchTile(zoom, x, y) {
    return this.loader.load(`${this.base}/${zoom}/${y}/${x}`); // 注意：{z}/{y}/{x}
  }

  /** 中止并重排所有在途瓦片请求（换机场时释放 HTTP/1.1 的连接额度）。 */
  abortPending() {
    return this.loader.abortPending();
  }
}
