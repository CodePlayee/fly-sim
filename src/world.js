/**
 * 统一 three.js 世界：渲染器 + 场景 + 相机 + geo-three 全球地形 MapView。
 * 替代旧的 MapLibre scene.js。飞机与地形同处此场景，共享相机与深度缓冲，
 * 从而 AGL/碰撞/遮挡所见即所得。
 *
 * 地形数据源（免费无 token）：AWS Terrarium DEM（高程）+ Esri World Imagery（影像）。
 */
import * as THREE from 'three';
import { MapView, LODFrustum, MapHeightNode } from 'geo-three';
import { EsriImageryProvider } from './providers/EsriImageryProvider.js';
import { TerrariumHeightProvider } from './providers/TerrariumHeightProvider.js';
import { getOrigin } from './geoUtils.js';

/**
 * geo-three 补丁：让每个地形瓦片的**影像与高程并行下载**。
 *
 * 原实现（MapHeightNode.initialize）是串行 await：
 *   await this.loadData();           // Esri 影像
 *   await this.loadHeightGeometry(); // Terrarium DEM
 * 两者互不依赖，却要吃 **2 个串行 RTT**。而瓦片服务器只有 HTTP/1.1（单 origin 6 连接），
 * 首屏上百张瓦片下来，这一层串行直接让总时长翻倍。改成 Promise.all 并行即可。
 */
MapHeightNode.prototype.initialize = async function initializeParallel() {
  await Promise.all([this.loadData(), this.loadHeightGeometry()]);
  this.nodeReady();
};

export function createWorld() {
  // ---- 渲染器 ----
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true, // 近飞机 + 远地形 共存，避免 z-fighting
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  // CSS 全权控制显示尺寸（铺满视口）；缓冲区尺寸由 syncSize 对齐 canvas 实际显示尺寸。
  renderer.domElement.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; z-index:0;';
  document.body.appendChild(renderer.domElement);
  // 初始按显示尺寸设置缓冲区（false=不写内联 width/height，避免与 CSS inset:0 冲突）
  renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight, false);

  // ---- 场景 ----
  const scene = new THREE.Scene();

  // ---- 相机（近 1m 看清飞机，远 5000km 看远山）----
  const camera = new THREE.PerspectiveCamera(
    60,
    renderer.domElement.clientWidth / renderer.domElement.clientHeight,
    1,
    5_000_000
  );

  // ---- 全球地形 MapView（HEIGHT 模式=CPU mesh，可 raycast）----
  const imageryProvider = new EsriImageryProvider();
  const heightProvider = new TerrariumHeightProvider();
  const mapView = new MapView(MapView.HEIGHT, imageryProvider, heightProvider);

  // LOD：LODFrustum（仅细分视锥内的瓦片，把加载预算集中在可见区域，
  // 收敛快、不被四周不可见瓦片拖累）。距离按 2^(maxZoom-level) 缩放。
  const lod = new LODFrustum(160, 600);

  // 首屏期间可**暂停** LOD 细分：瓦片服务器都是 HTTP/1.1（单 origin 仅 6 条连接），
  // 而 LODFrustum 每帧会对视锥内（far=5000km，范围极大）的节点持续 subdivide，
  // 实测首屏就能甩出 350+ 个影像请求，把 terrainWarmup 预建的**关键路径**瓦片
  // 挤到队列后面去。首屏只需要机场脚下那一条链路，故先暂停、揭幕后再恢复。
  let lodEnabled = true;
  mapView.lod = {
    updateLOD(view, camera, renderer, scene) {
      if (lodEnabled) lod.updateLOD(view, camera, renderer, scene);
    },
  };
  const setLodEnabled = (v) => { lodEnabled = !!v; };

  // 原点平移：geo-three 地形顶点已在 XZ 平面、Y 向上（顶点 (x,0,z)），无需旋转。
  // MapView 根缩放 = (EARTH_PERIMETER,1,EARTH_PERIMETER)，世界 X=mercator x、Z=-mercator y。
  // 整体平移 -origin，使其与 geoToWorld(=(sx-ox, alt, -(sy-oy))) 对齐。
  const o = getOrigin();
  mapView.position.set(-o.x, 0, o.y);
  mapView.updateMatrixWorld(true);
  scene.add(mapView);

  // ---- resize ----
  // 每帧调用 syncSize：以 canvas 的实际显示尺寸(clientWidth/Height)为准对齐缓冲区与
  // 相机比例。这样无论初始化时 innerWidth 是否稳定、DPR/缩放如何变化，下一帧自动校正，
  // 从根本上避免「画面偏移、需手动 resize 才正」的问题。setSize 传 false 不改内联样式。
  function syncSize() {
    const cv = renderer.domElement;
    const w = cv.clientWidth, h = cv.clientHeight;
    if (w === 0 || h === 0) return;
    const pr = renderer.getPixelRatio();
    if (cv.width !== Math.floor(w * pr) || cv.height !== Math.floor(h * pr)) {
      renderer.setSize(w, h, false);
    }
    const aspect = w / h;
    if (Math.abs(camera.aspect - aspect) > 1e-4) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  }
  window.addEventListener('resize', syncSize);

  return { renderer, scene, camera, mapView, syncSize, setLodEnabled, imageryProvider, heightProvider };
}
