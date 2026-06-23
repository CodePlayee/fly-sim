import * as THREE from 'three';
import { buildBoeing737 } from './boeing737.js';

/**
 * 飞机渲染：独立的透明 Three.js 画布，叠加在 MapLibre 地图之上。
 *
 * 设计：追尾/座舱相机下，飞机始终是离镜头最近的物体，应当永远在前景，
 * 因此无需与地形做深度合成，也无需地理投影。
 * 飞机固定在 Three 场景原点，按其姿态(heading/pitch/roll)旋转；
 * 相机按"追尾偏移"放在机后上方。地形作为 MapLibre 背景透出。
 */
export function createAircraftOverlay(getAircraftState) {
  const DEG = Math.PI / 180;

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:6;';
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0); // 透明背景
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);

  // 光照
  const sun = new THREE.DirectionalLight(0xffffff, 3.0);
  scene.add(sun);
  const ambient = new THREE.AmbientLight(0x88aacc, 1.2);
  scene.add(ambient);

  // 飞机：放在原点的一个枢轴下，便于按姿态旋转
  const pivot = new THREE.Group();
  const plane = buildBoeing737();
  pivot.add(plane);
  scene.add(pivot);

  // 固定基变换：机体坐标(+X机头,+Y左翼,+Z上) -> 屏幕坐标
  //   机头 +X -> -Z（射入屏幕=飞行方向，远离追尾相机）
  //   左翼 +Y -> -X（屏幕左）
  //   机顶 +Z -> +Y（屏幕上）
  // 由此追尾相机（位于 +Z）看到的是机尾->机头，且机头朝飞行方向。
  const qBasis = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0)
    )
  );

  let camMode = 'chase';

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function setLight(sunAltDeg, azimuthDeg) {
    const azRad = (azimuthDeg || 0) * DEG;
    const altRad = Math.max(-0.2, (sunAltDeg || 0) * DEG);
    // 把天体方向放到飞机本地坐标系附近（近似：东=+X,北无关紧要，上=+Z）
    sun.position.set(
      Math.sin(azRad) * Math.cos(altRad),
      Math.sin(altRad),
      Math.cos(azRad) * Math.cos(altRad)
    );
    const day = Math.max(0, Math.min(1, (sunAltDeg + 6) / 18));
    sun.intensity = 0.6 + day * 3.0;
    ambient.intensity = 0.45 + day * 1.0;
    ambient.color.setHSL(0.6, 0.4, 0.32 + day * 0.28);
  }

  function setCamMode(m) {
    camMode = m;
  }

  function render() {
    const s = getAircraftState();
    if (!s) return;

    // 姿态：
    //  plane 固定承载基变换 qBasis（机头->-Z 飞行方向，机顶->+Y）。
    //  pivot 承载动态俯仰/滚转（在屏幕坐标系中）：
    //    pitch 绕屏幕 X（机体横轴/翼线）：抬头为正 -> 机头上扬
    //    roll  绕屏幕 Z（机体纵轴/机头线）：右压杆右翼下沉
    //  heading(航向) 由地图 bearing 跟随体现，追尾镜头始终在机后，
    //  因此机头在画面中恒指向飞行方向（射入屏幕）。
    plane.quaternion.copy(qBasis);
    pivot.rotation.order = 'ZYX';
    pivot.rotation.set(
      s.pitchDeg * DEG,   // 绕 X：俯仰
      0,
      -s.rollDeg * DEG    // 绕 Z：滚转
    );

    // 相机：追尾在机后上方，看向飞机
    if (camMode === 'chase') {
      camera.position.set(0, 14, 62); // 上方、后方（场景单位=米）
      camera.lookAt(0, 0, -4);
    } else {
      // 座舱：贴近机头前下方往前看
      camera.position.set(0, 1.5, -4);
      camera.lookAt(0, 1.2, -40);
    }

    renderer.render(scene, camera);
  }

  return { render, setLight, setCamMode, plane };
}
