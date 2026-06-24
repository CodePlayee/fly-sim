/**
 * 统一 three.js 世界：渲染器 + 场景 + 相机 + geo-three 全球地形 MapView。
 * 替代旧的 MapLibre scene.js。飞机与地形同处此场景，共享相机与深度缓冲，
 * 从而 AGL/碰撞/遮挡所见即所得。
 *
 * 地形数据源（免费无 token）：AWS Terrarium DEM（高程）+ Esri World Imagery（影像）。
 */
import * as THREE from 'three';
import { MapView, LODFrustum } from 'geo-three';
import { EsriImageryProvider } from './providers/EsriImageryProvider.js';
import { TerrariumHeightProvider } from './providers/TerrariumHeightProvider.js';
import { getOrigin } from './geoUtils.js';

export function createWorld() {
  // ---- 渲染器 ----
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true, // 近飞机 + 远地形 共存，避免 z-fighting
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.cssText = 'position:fixed; inset:0; z-index:0;';
  document.body.appendChild(renderer.domElement);

  // ---- 场景 ----
  const scene = new THREE.Scene();

  // ---- 相机（近 1m 看清飞机，远 5000km 看远山）----
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    5_000_000
  );

  // ---- 全球地形 MapView（HEIGHT 模式=CPU mesh，可 raycast）----
  const imageryProvider = new EsriImageryProvider();
  const heightProvider = new TerrariumHeightProvider();
  const mapView = new MapView(MapView.HEIGHT, imageryProvider, heightProvider);

  // LOD：LODFrustum（仅细分视锥内的瓦片，把加载预算集中在可见区域，
  // 收敛快、不被四周不可见瓦片拖累）。距离按 2^(maxZoom-level) 缩放。
  mapView.lod = new LODFrustum(160, 600);

  // 原点平移：geo-three 地形顶点已在 XZ 平面、Y 向上（顶点 (x,0,z)），无需旋转。
  // MapView 根缩放 = (EARTH_PERIMETER,1,EARTH_PERIMETER)，世界 X=mercator x、Z=-mercator y。
  // 整体平移 -origin，使其与 geoToWorld(=(sx-ox, alt, -(sy-oy))) 对齐。
  const o = getOrigin();
  mapView.position.set(-o.x, 0, o.y);
  mapView.updateMatrixWorld(true);
  scene.add(mapView);

  // ---- resize ----
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene, camera, mapView };
}
