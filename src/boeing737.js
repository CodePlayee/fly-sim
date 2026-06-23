import * as THREE from 'three';

/**
 * 程序化生成一架波音 737 风格客机（不依赖任何外部模型文件）。
 * 模型本地坐标系：+X = 机头朝向，+Y = 左翼，+Z = 上。
 * 单位：米。总长约 39m，翼展约 34m（接近 737-800 真实尺寸）。
 *
 * 可动部件通过 group.userData.controls 暴露，供叠层按飞行状态做动画：
 *   aileronL / aileronR  副翼（差动，随滚转）
 *   elevatorL / elevatorR 升降舵（随俯仰）
 *   rudder               方向舵（随偏航/转弯）
 *   fanL / fanR          发动机风扇（随油门旋转）
 *   gearN / gearL / gearR 起落架（随地面/空中收放，可选）
 */
export function buildBoeing737() {
  const plane = new THREE.Group();
  plane.name = 'boeing737';

  const controls = {};
  plane.userData.controls = controls;

  // ---- 材质 ----
  const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xf2f4f7, metalness: 0.25, roughness: 0.55 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 0.3, roughness: 0.5 });
  const ctrlMat = new THREE.MeshStandardMaterial({ color: 0xc2ccd6, metalness: 0.3, roughness: 0.5 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x2a4d8f, metalness: 0.3, roughness: 0.5 });
  const engineMat = new THREE.MeshStandardMaterial({ color: 0xcfd6df, metalness: 0.6, roughness: 0.35 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c2530, metalness: 0.4, roughness: 0.4 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x101a26, metalness: 0.1, roughness: 0.15 });

  const FUS_LEN = 33;
  const FUS_R = 1.9;

  // ---- 机身 ----
  const body = new THREE.Mesh(new THREE.CylinderGeometry(FUS_R, FUS_R, FUS_LEN, 32), fuselageMat);
  body.rotation.z = Math.PI / 2;
  plane.add(body);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(FUS_R, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2), fuselageMat);
  nose.scale.set(1, 3.2, 1);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = FUS_LEN / 2;
  plane.add(nose);

  const radome = new THREE.Mesh(new THREE.SphereGeometry(FUS_R * 0.55, 20, 16), darkMat);
  radome.scale.set(1.4, 1, 1);
  radome.position.x = FUS_LEN / 2 + FUS_R * 1.6;
  plane.add(radome);

  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(FUS_R, 9, 32), fuselageMat);
  tailCone.rotation.z = Math.PI / 2;
  tailCone.position.x = -FUS_LEN / 2 - 3.2;
  tailCone.position.z = 0.6;
  plane.add(tailCone);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(FUS_R * 0.8, 16, 12, 0, Math.PI, 0, Math.PI / 2), glassMat);
  cockpit.scale.set(1.6, 1, 0.7);
  cockpit.rotation.z = -Math.PI / 2;
  cockpit.position.set(FUS_LEN / 2 - 1.2, 0, FUS_R * 0.55);
  plane.add(cockpit);

  // 舷窗带（两侧细蓝带）
  for (const side of [1, -1]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(FUS_LEN, 0.05, 0.7), accentMat);
    s.position.set(0, side * FUS_R * 0.98, 0.25);
    plane.add(s);
  }

  // ---- 主翼（左右分别构建，便于取副翼引用）----
  for (const side of [1, -1]) {
    const w = makeSweptWing(17, 4.2, 1.4, wingMat, ctrlMat, {
      winglet: true, aileron: true, aileronSpan: [9.5, 15.5],
    });
    w.group.scale.y = side; // side=1 左翼, side=-1 右翼镜像
    w.group.position.set(-1, 0, -FUS_R * 0.35);
    plane.add(w.group);
    if (side === 1) controls.aileronL = w.aileron;
    else controls.aileronR = w.aileron;
  }

  // ---- 平尾（左右分别构建，含升降舵）----
  for (const side of [1, -1]) {
    const t = makeSweptWing(6, 2.6, 1.0, wingMat, ctrlMat, {
      winglet: false, aileron: true, aileronSpan: [0.6, 5.4],
    });
    t.group.scale.y = side;
    t.group.position.set(-FUS_LEN / 2 - 1.5, 0, 0.8);
    plane.add(t.group);
    if (side === 1) controls.elevatorL = t.aileron;
    else controls.elevatorR = t.aileron;
  }

  // ---- 垂尾 + 方向舵 ----
  const vt = makeVerticalTail(accentMat, ctrlMat);
  vt.group.position.set(-FUS_LEN / 2 - 1.5, 0, FUS_R * 0.6);
  plane.add(vt.group);
  controls.rudder = vt.rudder;

  // ---- 发动机（含可旋转风扇）----
  for (const side of [1, -1]) {
    const y = side * 6.5;
    const e = makeEngine(engineMat, darkMat, ctrlMat);
    e.group.position.set(1.6, y, -FUS_R - 0.5);
    plane.add(e.group);
    if (side === 1) controls.fanL = e.fan;
    else controls.fanR = e.fan;

    const pylon = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 1.3), engineMat);
    pylon.position.set(1.4, y, -FUS_R + 0.4);
    plane.add(pylon);
  }

  plane.updateMatrixWorld(true);
  return plane;
}

/**
 * 后掠机翼：挤出固定翼面 + 可选翼梢小翼 + 可选后缘操纵面（铰接枢轴）。
 * 返回 { group, aileron }，aileron 为可绕展向轴旋转的枢轴 Group（无则 null）。
 */
function makeSweptWing(span, rootChord, tipChord, mat, ctrlMat, opt = {}) {
  const g = new THREE.Group();
  const sweep = 4.5;
  const tipTEx = -rootChord * 0.5 - sweep + (rootChord - tipChord) * 0.2; // 翼尖后缘 x
  const teRootX = -rootChord * 0.5; // 翼根后缘 x

  // 固定翼面（前缘 + 主体），后缘留给操纵面
  const shape = new THREE.Shape();
  shape.moveTo(rootChord * 0.5, 0);
  shape.lineTo(teRootX, 0);
  shape.lineTo(tipTEx, span);
  shape.lineTo(tipTEx + tipChord, span);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: false });
  geo.translate(0, 0, -0.14);
  g.add(new THREE.Mesh(geo, mat));

  if (opt.winglet) {
    const tipCenterX = tipTEx + tipChord * 0.5;
    const wl = new THREE.Mesh(new THREE.BoxGeometry(tipChord * 0.7, 0.22, 1.7), mat);
    wl.position.set(tipCenterX, span - 0.15, 0.85);
    g.add(wl);
  }

  // 后缘操纵面（副翼/升降舵）：铰接枢轴位于后缘线，舵面向后(−X)延伸
  let aileron = null;
  if (opt.aileron) {
    const [y1, y2] = opt.aileronSpan;
    const ymid = (y1 + y2) / 2;
    const surfSpan = y2 - y1;
    // 后缘线 x 随展向线性插值（与翼平面后缘一致）
    const teAt = (y) => teRootX + (tipTEx - teRootX) * (y / span);
    const hingeX = teAt(ymid);
    const chord = 0.95; // 舵面弦长

    aileron = new THREE.Group();
    aileron.position.set(hingeX, ymid, 0); // 铰链贴合后缘
    // 舵面做成贴合后缘的梯形薄板：用 ExtrudeGeometry 与翼后缘斜度匹配，避免悬空
    const slope = (teAt(y2) - teAt(y1)) / surfSpan; // 后缘随展向的 x 斜率
    const sShape = new THREE.Shape();
    // 局部坐标：x=弦向(0=铰链,负=向后), y=展向(相对 ymid)
    const halfS = surfSpan / 2;
    sShape.moveTo(slope * (-halfS), -halfS);
    sShape.lineTo(slope * (halfS), halfS);
    sShape.lineTo(slope * (halfS) - chord, halfS);
    sShape.lineTo(slope * (-halfS) - chord, -halfS);
    sShape.closePath();
    const sGeo = new THREE.ExtrudeGeometry(sShape, { depth: 0.16, bevelEnabled: false });
    sGeo.translate(0, 0, -0.08);
    const surf = new THREE.Mesh(sGeo, ctrlMat);
    aileron.add(surf);
    g.add(aileron);
  }

  // 上反角
  g.rotation.x = THREE.MathUtils.degToRad(-5);
  return { group: g, aileron };
}

/** 垂直尾翼（后掠 + 蓝色涂装），含可绕垂直轴旋转的方向舵 */
function makeVerticalTail(accentMat, ctrlMat) {
  const g = new THREE.Group();
  // 固定鳍（前缘部分），后缘留给方向舵
  const shape = new THREE.Shape();
  shape.moveTo(1.6, 0);
  shape.lineTo(-1.0, 0);
  shape.lineTo(-2.0, 5.2);
  shape.lineTo(-0.6, 5.2);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: false });
  geo.translate(0, 0, -0.11);
  const fin = new THREE.Mesh(geo, accentMat);
  fin.rotation.x = Math.PI / 2; // 立到 X-Z 平面
  g.add(fin);

  // 方向舵：铰接于鳍后缘，绕垂直(模型 Z)轴偏转。
  // 鳍立起后其"展向"沿 Z；方向舵做成竖直薄板，枢轴在后缘。
  const rudder = new THREE.Group();
  rudder.position.set(-1.3, 0, 2.6); // 后缘中部、竖直中心高度
  const chord = 0.9, height = 4.6;
  const surf = new THREE.Mesh(new THREE.BoxGeometry(chord, 0.18, height), ctrlMat);
  surf.position.set(-chord / 2, 0, 0);
  rudder.add(surf);
  g.add(rudder);

  return { group: g, rudder };
}

/** 发动机短舱：外涵 + 黑唇口 + 可旋转风扇叶 + 尾喷管。返回 { group, fan } */
function makeEngine(mat, darkMat, ctrlMat) {
  const g = new THREE.Group();
  const L = 4.2, R = 1.0;
  const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.9, L, 24), mat);
  nacelle.rotation.z = Math.PI / 2;
  g.add(nacelle);

  const lip = new THREE.Mesh(new THREE.TorusGeometry(R, 0.18, 12, 24), darkMat);
  lip.position.x = L / 2;
  g.add(lip);

  // 风扇：暗色背盘 + 数片叶片（绕 X 旋转可见）
  const fan = new THREE.Group();
  fan.position.x = L / 2 - 0.08;
  const disk = new THREE.Mesh(new THREE.CircleGeometry(R * 0.86, 24), darkMat);
  disk.rotation.y = Math.PI / 2; // 面朝 +X
  fan.add(disk);
  const bladeMat = ctrlMat;
  const BLADES = 10;
  for (let k = 0; k < BLADES; k++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, R * 0.78), bladeMat);
    const ang = (k / BLADES) * Math.PI * 2;
    // 叶片在 YZ 平面绕 X 轴分布
    blade.position.set(0.02, Math.sin(ang) * R * 0.42, Math.cos(ang) * R * 0.42);
    blade.rotation.x = ang;
    fan.add(blade);
  }
  // 旋转中心整流锥
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 12), darkMat);
  spinner.rotation.z = -Math.PI / 2;
  spinner.position.x = 0.2;
  fan.add(spinner);
  g.add(fan);

  const exhaust = new THREE.Mesh(new THREE.ConeGeometry(R * 0.55, 1.4, 20), darkMat);
  exhaust.rotation.z = -Math.PI / 2;
  exhaust.position.x = -L / 2 - 0.5;
  g.add(exhaust);

  return { group: g, fan };
}
