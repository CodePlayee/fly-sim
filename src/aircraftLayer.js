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
  const ctl = plane.userData.controls || {};

  // 控制面平滑状态 + 风扇转角累计
  const surf = { ail: 0, elev: 0, rud: 0, fanAngle: 0 };
  let lastT = null;

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

    // ---- 控制面动画 ----
    // 时间步长（用 performance.now 的差；首帧置 0）
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const dt = lastT == null ? 0 : Math.min((now - lastT) / 1000, 0.1);
    lastT = now;
    animateControls(s, dt);

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

  // 控制面 / 风扇动画：根据操纵指令与姿态平滑偏转
  const MAXDEF = 16 * DEG; // 舵面最大偏角（真实量级）
  function animateControls(s, dt) {
    const k = dt > 0 ? Math.min(dt * 8, 1) : 1; // 平滑系数（趋向目标）

    // 目标偏角：优先用操纵指令，无输入时用姿态/转弯近似
    const rollCmd = s.inRoll != null && s.inRoll !== 0 ? s.inRoll : -s.rollDeg / 35;
    const pitchCmd = s.inPitch != null && s.inPitch !== 0 ? s.inPitch : s.pitchDeg / 30;
    const yawCmd = s.inYaw != null && s.inYaw !== 0 ? s.inYaw : -s.rollDeg / 60; // 转弯时方向舵随动

    surf.ail += (clampUnit(rollCmd) * MAXDEF - surf.ail) * k;
    surf.elev += (clampUnit(pitchCmd) * MAXDEF - surf.elev) * k;
    surf.rud += (clampUnit(yawCmd) * MAXDEF - surf.rud) * k;

    // 副翼差动：左右反向（右压杆 -> 右副翼上偏、左副翼下偏）
    // 舵面绕展向(本地 Y)轴旋转；左右翼组用 scale.y=±1 镜像，
    // 故同一旋转量在两侧表现相反，正好形成差动，这里再叠加符号确保方向正确。
    if (ctl.aileronL) ctl.aileronL.rotation.y = surf.ail;
    if (ctl.aileronR) ctl.aileronR.rotation.y = surf.ail;

    // 升降舵：左右同向，绕展向轴
    if (ctl.elevatorL) ctl.elevatorL.rotation.y = -surf.elev;
    if (ctl.elevatorR) ctl.elevatorR.rotation.y = -surf.elev;

    // 方向舵：绕垂直(本地 Z)轴
    if (ctl.rudder) ctl.rudder.rotation.z = surf.rud;

    // 风扇旋转：转速随油门（怠速也微转）
    const rps = 2 + (s.throttle || 0) * 26; // 转/秒
    surf.fanAngle += rps * Math.PI * 2 * dt;
    if (ctl.fanL) ctl.fanL.rotation.x = surf.fanAngle;
    if (ctl.fanR) ctl.fanR.rotation.x = surf.fanAngle;
  }

  function clampUnit(v) { return Math.max(-1, Math.min(1, v)); }

  return { render, setLight, setCamMode, plane };
}
