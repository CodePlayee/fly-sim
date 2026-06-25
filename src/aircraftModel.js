/**
 * 飞机模型控制器（统一场景版）：把程序化 737 模型加入共享 three.js 场景，
 * 按飞行状态写世界变换与姿态，并驱动控制面/风扇动画。
 *
 * 替代旧的 aircraftLayer.js（其为独立透明 canvas + 私有相机的叠加方案）。
 * 现在飞机是地形上方真实世界坐标处的实体，与地形共享相机和深度缓冲。
 *
 * 朝向：模型本地坐标 +X=机头、+Y=左翼、+Z=上。
 * 世界坐标：北=-Z、东=+X、上=+Y（见 geoUtils）。
 * 用 qBasis 把模型本地基底映射到世界基底，再叠加 heading/pitch/roll。
 *
 * 姿态轴（在 qBasis 之后用模型本地轴叠加，三轴互相垂直、互不耦合）：
 *   俯仰 pitch 绕横轴(左翼 +Y) —— 抬头时机头抬向机顶；
 *   横滚 roll  绕纵轴(机头 +X) —— 右滚时右翼下沉；
 *   航向 heading 绕世界竖轴 +Y。
 * 注意：曾把 pitch 误绕 +X(机头)→表现为横滚、roll 误绕 +Z(竖直)→表现为偏航，已修正。
 */
import * as THREE from 'three';
import { buildBoeing737 } from './boeing737.js';
import { geoToWorld } from './geoUtils.js';

const DEG = Math.PI / 180;

export function createAircraftModel(scene) {
  const pivot = new THREE.Group();
  const plane = buildBoeing737();
  pivot.add(plane);
  scene.add(pivot);
  const ctl = plane.userData.controls || {};

  // 模型视觉中心相对 pivot 原点的偏移（模型本地坐标）。
  // 重构后机身前后/上下不对称（尾椎、垂尾更长更高），几何中心并不在 pivot 原点；
  // 相机应对准此中心而非原点，飞机才真正居中。在初始姿态(identity)下测量一次即可。
  plane.updateMatrixWorld(true);
  const centerOffset = new THREE.Box3().setFromObject(plane).getCenter(new THREE.Vector3());

  // 控制面平滑状态 + 风扇转角累计 + 起落架收放进度
  const surf = { ail: 0, elev: 0, rud: 0, fanAngle: 0, gear: 1, steer: 0, spoiler: 0, flap: 0 };

  // 固定基变换：模型本地(+X机头,+Y左翼,+Z上) -> 世界(北=-Z,东=+X,上=+Y)。
  // 航向 0（朝北）时机头应指向 -Z：
  //   机头 +X -> -Z，左翼 +Y -> -X，机顶 +Z -> +Y
  const qBasis = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(
      new THREE.Vector3(0, 0, -1), // 模型 X(机头) 映射到世界 -Z
      new THREE.Vector3(-1, 0, 0), // 模型 Y(左翼) 映射到世界 -X
      new THREE.Vector3(0, 1, 0) //  模型 Z(机顶) 映射到世界 +Y
    )
  );

  // 复用临时对象，避免每帧分配
  const _pos = new THREE.Vector3();
  const _qHeading = new THREE.Quaternion();
  const _qPitch = new THREE.Quaternion();
  const _qRoll = new THREE.Quaternion();
  const _axisY = new THREE.Vector3(0, 1, 0);

  let lastState = null;

  /**
   * 写入飞行状态。
   * @param s { lon,lat,alt, headingRad|headingDeg, pitchDeg, rollDeg,
   *            inPitch,inRoll,inYaw,throttle }
   * @param dt 秒（用于控制面/风扇平滑）
   * @param env { night, tMs } 夜间灯光驱动（可选）
   */
  function update(s, dt, env) {
    if (!s) return;
    lastState = s;

    // ---- 世界位置 ----
    geoToWorld(s.lat, s.lon, s.alt, _pos);
    pivot.position.copy(_pos);

    // ---- 姿态 ----
    const heading = s.headingRad != null ? s.headingRad : (s.headingDeg || 0) * DEG;
    const pitch = (s.pitchDeg || 0) * DEG;
    const roll = (s.rollDeg || 0) * DEG;

    // 航向：绕世界 +Y 旋转。航向增大=顺时针(从上看)=朝东偏。
    // 机头默认指 -Z(北)，绕 +Y 转 -heading 使其朝正确方位。
    _qHeading.setFromAxisAngle(_axisY, -heading);
    // pitch/roll 在 qBasis 之后用「模型本地轴」叠加（机头+X，左翼+Y，机顶+Z）：
    //   俯仰 = 绕横轴(左翼 Y) 旋转；横滚 = 绕纵轴(机头 X) 旋转。
    //   抬头(pitch>0)：机头 +X 抬向机顶 +Z -> 绕 +Y 负向；故用 (0,-1,0)·pitch。
    //   右滚(roll>0)：右翼(-Y)下沉 -> 绕机头 +X 正向；故用 (1,0,0)·roll。
    _qPitch.setFromAxisAngle(new THREE.Vector3(0, -1, 0), pitch);
    _qRoll.setFromAxisAngle(new THREE.Vector3(1, 0, 0), roll);

    // 组合：world = heading ∘ basis ∘ (roll ∘ pitch)
    pivot.quaternion
      .copy(_qHeading)
      .multiply(qBasis)
      .multiply(_qRoll)
      .multiply(_qPitch);

    // ---- 控制面 / 风扇 ----
    animateControls(s, dt || 0);

    // ---- 外部灯光（夜间开启）----
    if (ctl.lights && env) {
      const agl = s.alt != null && s.fieldElevation != null
        ? s.alt - s.fieldElevation : (s.alt || 0);
      ctl.lights.update({
        night: !!env.night,
        tMs: env.tMs || 0,
        agl,
        onGround: !!s.onGround,
      });
    }
  }

  // 控制面 / 风扇动画：根据操纵指令与姿态平滑偏转
  const MAXDEF = 16 * DEG; // 舵面最大偏角（真实量级）
  function animateControls(s, dt) {
    const k = dt > 0 ? Math.min(dt * 8, 1) : 1;

    const rollCmd =
      s.inRoll != null && s.inRoll !== 0 ? s.inRoll : -(s.rollDeg || 0) / 35;
    const pitchCmd =
      s.inPitch != null && s.inPitch !== 0 ? s.inPitch : (s.pitchDeg || 0) / 30;
    const yawCmd =
      s.inYaw != null && s.inYaw !== 0 ? s.inYaw : -(s.rollDeg || 0) / 60;

    surf.ail += (clampUnit(rollCmd) * MAXDEF - surf.ail) * k;
    surf.elev += (clampUnit(pitchCmd) * MAXDEF - surf.elev) * k;
    surf.rud += (clampUnit(yawCmd) * MAXDEF - surf.rud) * k;

    // 副翼差动（横滚）：经数值探针实测，子组 rotation.y>0 -> 后缘上偏。
    // 关键：父级 scale.y=±1 镜像 *不会* 翻转子组 rotation.y 的竖直方向，
    // 故「左右同号=同步、左右反号=差动」。副翼要差动 -> 取反号。
    // 右滚(surf.ail>0)：左副翼下偏、右副翼上偏 -> 右翼下沉 -> 向右滚转。
    if (ctl.aileronL) ctl.aileronL.rotation.y = -surf.ail;
    if (ctl.aileronR) ctl.aileronR.rotation.y = surf.ail;
    // 升降舵同步（俯仰）：要两侧同向 -> 同号。抬头(surf.elev>0)：两侧后缘均上偏。
    if (ctl.elevatorL) ctl.elevatorL.rotation.y = surf.elev;
    if (ctl.elevatorR) ctl.elevatorR.rotation.y = surf.elev;
    if (ctl.rudder) ctl.rudder.rotation.z = surf.rud;

    const rps = 2 + (s.throttle || 0) * 26;
    surf.fanAngle += rps * Math.PI * 2 * dt;
    if (ctl.fanL) ctl.fanL.rotation.x = surf.fanAngle;
    if (ctl.fanR) ctl.fanR.rotation.x = surf.fanAngle;

    // ---- 起落架收放：在地面或低空(<150m AGL 近似用 alt-fieldElev 不可得，用低高度/低速)时放下 ----
    // 规则：地面 -> 放下；离地且爬升超过阈值高度 -> 收起。带迟滞避免抖动。
    const agl = s.alt != null && s.fieldElevation != null ? s.alt - s.fieldElevation : (s.alt || 0);
    const wantGear = s.onGround || agl < 120 ? 1 : 0;
    surf.gear += (wantGear - surf.gear) * Math.min(dt * 0.8, 1); // 收放约 1~2s
    if (ctl.setGear) ctl.setGear(surf.gear);

    // ---- 襟翼：起降构型放下（与起落架同逻辑：地面/低空放下，巡航收起）----
    // 模型上 rotation.y 为正=后缘上偏；襟翼后缘向下偏，故取负角。
    const wantFlap = s.onGround || agl < 600 ? 1 : 0;
    surf.flap += (wantFlap - surf.flap) * Math.min(dt * 0.6, 1); // 襟翼动作较慢
    const FLAP_MAX = 30 * DEG;
    if (ctl.flapL) ctl.flapL.rotation.y = -surf.flap * FLAP_MAX;
    if (ctl.flapR) ctl.flapR.rotation.y = -surf.flap * FLAP_MAX;

    // ---- 前轮转向：仅地面、随方向舵指令 ----
    const steerCmd = s.onGround ? clampUnit(yawCmd) : 0;
    surf.steer += (steerCmd * (35 * DEG) - surf.steer) * k; // 最大 ±35°
    if (ctl.noseSteer) ctl.noseSteer.rotation.z = surf.steer;

    // ---- 扰流板/减速板：地面 + 收油门时展开（着陆减速/滑行）----
    const wantSpoiler = s.onGround && (s.throttle || 0) < 0.2 && (s.speedKt || 0) > 30 ? 1 : 0;
    surf.spoiler += (wantSpoiler - surf.spoiler) * Math.min(dt * 4, 1);
    const SPOIL_MAX = 55 * DEG;
    if (ctl.spoilerL) ctl.spoilerL.rotation.y = -surf.spoiler * SPOIL_MAX; // 上掀
    if (ctl.spoilerR) ctl.spoilerR.rotation.y = -surf.spoiler * SPOIL_MAX;
  }

  function clampUnit(v) {
    return Math.max(-1, Math.min(1, v));
  }

  // 飞机视觉中心的世界坐标（pivot 原点 + 随姿态旋转的几何中心偏移）。
  // 相机用它对准飞机，保证模型几何重心居中而非 pivot 原点。
  const _center = new THREE.Vector3();
  function getVisualCenter(out) {
    pivot.updateMatrixWorld();
    out.copy(_center.copy(centerOffset)).applyMatrix4(pivot.matrixWorld);
    return out;
  }

  return { update, pivot, plane, getVisualCenter, getLastState: () => lastState };
}
