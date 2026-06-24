/**
 * 地理坐标 <-> three.js 世界坐标 的转换（基于 geo-three 的 Web Mercator）。
 *
 * geo-three 把地形铺在 XZ 平面、高度在 +Y（顶点 (x,0,z)，法线 (0,1,0)），
 * MapView 根缩放 = (EARTH_PERIMETER, 1, EARTH_PERIMETER)，局部平面 [-0.5,0.5]。
 * 故某 mercator 点 (sx, sy) 的地形世界坐标 = (sx, 高度, -sy)（北在 -z）。
 *
 * 浮点抖动：mercator 坐标 ~1e7 米，单精度 float 远离原点会抖。
 * 用 setOrigin(lat0,lon0) 把整个场景平移到 spawn 区域附近：
 *   mapView.position = (-ox, 0, +oy)，geoToWorld 同步减去 origin，二者对齐。
 * spawn 时设一次，飞行中不改（改会瞬移整个世界）。
 */
import * as THREE from 'three';
import { UnitsUtils } from 'geo-three';

// origin = datumsToSpherical(lat0,lon0)，单位米
let origin = new THREE.Vector2(0, 0);

export function setOrigin(lat0, lon0) {
  origin = UnitsUtils.datumsToSpherical(lat0, lon0);
  return origin;
}

export function getOrigin() {
  return origin;
}

/**
 * 地理点 -> three.js 世界坐标（已做 origin 平移）。
 * @param lat,lon 度  @param altMeters 海拔米（不平移，直接作 Y，与地形顶点 Y 同坐标系）
 */
export function geoToWorld(lat, lon, altMeters, target = new THREE.Vector3()) {
  const c = UnitsUtils.datumsToSpherical(lat, lon); // Vector2 米
  return target.set(c.x - origin.x, altMeters, -(c.y - origin.y));
}

/** 世界坐标 -> 地理点（minimap/HUD 备用）。返回 {latitude, longitude} */
export function worldToGeo(v) {
  const sx = v.x + origin.x;
  const sy = -v.z + origin.y;
  return UnitsUtils.sphericalToDatums(sx, sy);
}

/**
 * 航向(弧度,0=北顺时针) -> 世界前向单位向量（北=-z）。
 * forward = (sin h, 0, -cos h)
 */
export function headingToForward(headingRad, target = new THREE.Vector3()) {
  return target.set(Math.sin(headingRad), 0, -Math.cos(headingRad));
}
