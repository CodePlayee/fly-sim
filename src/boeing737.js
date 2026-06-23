import * as THREE from 'three';

/**
 * 程序化生成一架波音 737 风格客机（不依赖任何外部模型文件）。
 * 模型本地坐标系：+X = 机头朝向，+Y = 左翼，+Z = 上。
 * 单位：米。总长约 39m，翼展约 34m（接近 737-800 真实尺寸）。
 *
 * 返回一个 THREE.Group，可直接加入场景。
 */
export function buildBoeing737() {
  const plane = new THREE.Group();
  plane.name = 'boeing737';

  // ---- 材质 ----
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xf2f4f7, metalness: 0.25, roughness: 0.55,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xdfe4ea, metalness: 0.3, roughness: 0.5,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x2a4d8f, metalness: 0.3, roughness: 0.5, // 机身蓝色涂装带
  });
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0xcfd6df, metalness: 0.6, roughness: 0.35,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1c2530, metalness: 0.4, roughness: 0.4, // 进气口/雷达罩
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x101a26, metalness: 0.1, roughness: 0.15, // 驾驶舱风挡
  });

  // ---- 机身：中段圆柱 + 机头/机尾锥化 ----
  const FUS_LEN = 33;
  const FUS_R = 1.9;

  // 主体圆柱（沿 X）
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(FUS_R, FUS_R, FUS_LEN, 32),
    fuselageMat
  );
  body.rotation.z = Math.PI / 2; // 让圆柱轴朝 X
  plane.add(body);

  // 机头整流罩（半椭球）
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(FUS_R, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    fuselageMat
  );
  nose.scale.set(1, 3.2, 1);          // 沿 Y 拉长（旋转前的轴）
  nose.rotation.z = -Math.PI / 2;     // 朝 +X
  nose.position.x = FUS_LEN / 2;
  plane.add(nose);

  // 雷达罩尖端
  const radome = new THREE.Mesh(new THREE.SphereGeometry(FUS_R * 0.55, 20, 16), darkMat);
  radome.scale.set(1.4, 1, 1);
  radome.position.x = FUS_LEN / 2 + FUS_R * 1.6;
  plane.add(radome);

  // 机尾锥（向上微翘）
  const tailCone = new THREE.Mesh(
    new THREE.ConeGeometry(FUS_R, 9, 32),
    fuselageMat
  );
  tailCone.rotation.z = Math.PI / 2;  // 尖朝 -X
  tailCone.position.x = -FUS_LEN / 2 - 3.2;
  tailCone.position.z = 0.6;          // 上翘
  plane.add(tailCone);

  // 驾驶舱风挡
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(FUS_R * 0.8, 16, 12, 0, Math.PI, 0, Math.PI / 2),
    glassMat
  );
  cockpit.scale.set(1.6, 1, 0.7);
  cockpit.rotation.z = -Math.PI / 2;
  cockpit.position.set(FUS_LEN / 2 - 1.2, 0, FUS_R * 0.55);
  plane.add(cockpit);

  // 机身涂装带（细长盒子，沿 X，位于侧面中部）
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(FUS_LEN + 4, FUS_R * 2.02, 0.5),
    accentMat
  );
  stripe.position.z = -0.2;
  // 用很薄的高度让它像窗带：改用环绕的方式——这里用两个侧贴板
  plane.remove(stripe);
  for (const side of [1, -1]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(FUS_LEN, 0.05, 0.7), accentMat);
    s.position.set(0, side * FUS_R * 0.98, 0.25);
    plane.add(s);
  }

  // ---- 主翼：后掠，带上反角，翼梢小翼 ----
  const wing = makeSweptWing(17, 4.2, 1.4, wingMat, true); // 半展长、翼根弦、翼尖弦、含小翼
  wing.position.set(-1, 0, -FUS_R * 0.35);
  plane.add(wing);
  const wingR = wing.clone();
  wingR.scale.y = -1; // 镜像到右翼
  plane.add(wingR);

  // ---- 平尾（无小翼）----
  const htail = makeSweptWing(6, 2.6, 1.0, wingMat, false);
  htail.position.set(-FUS_LEN / 2 - 1.5, 0, 0.8);
  plane.add(htail);
  const htailR = htail.clone();
  htailR.scale.y = -1;
  plane.add(htailR);

  // ---- 垂尾 ----
  const vtail = makeVerticalTail(wingMat, accentMat);
  vtail.position.set(-FUS_LEN / 2 - 1.5, 0, FUS_R * 0.6);
  plane.add(vtail);

  // ---- 发动机短舱（吊挂在翼下、略前于前缘）----
  for (const side of [1, -1]) {
    const y = side * 6.5; // 翼展方向位置（在机翼下方）
    // 该展向位置的机翼因后掠+上反，前缘大致在 x≈0.3、z≈翼面高度
    const eng = makeEngine(engineMat, darkMat);
    eng.position.set(1.6, y, -FUS_R - 0.5);
    plane.add(eng);
    // 吊挂塔（pylon）：竖直薄板，连接翼下表面与发动机顶部
    const pylon = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.35, 1.3),
      engineMat
    );
    pylon.position.set(1.4, y, -FUS_R + 0.4);
    plane.add(pylon);
  }

  plane.updateMatrixWorld(true);
  return plane;
}

/** 后掠机翼：挤出多边形（上反角作用于整组，可选翼梢小翼） */
function makeSweptWing(span, rootChord, tipChord, mat, withWinglet) {
  const g = new THREE.Group();
  const sweep = 4.5; // 翼尖相对翼根向后偏移量
  const shape = new THREE.Shape();
  // 在 X(弦向)-Y(展向) 平面绘制半翼平面形
  const tipTEx = -rootChord * 0.5 - sweep + (rootChord - tipChord) * 0.2;
  shape.moveTo(rootChord * 0.5, 0);
  shape.lineTo(-rootChord * 0.5, 0);
  shape.lineTo(tipTEx, span);
  shape.lineTo(tipTEx + tipChord, span);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: false });
  geo.translate(0, 0, -0.14);
  const wing = new THREE.Mesh(geo, mat);
  g.add(wing);

  // 翼梢小翼（winglet）：放在真实翼尖处，随整组一起上反，不会脱离
  if (withWinglet) {
    const tipCenterX = tipTEx + tipChord * 0.5;
    const wl = new THREE.Mesh(new THREE.BoxGeometry(tipChord * 0.7, 0.22, 1.7), mat);
    wl.position.set(tipCenterX, span - 0.15, 0.85);
    g.add(wl);
  }

  // 上反角：整组（含翼尖小翼）一起抬升，保证连接
  g.rotation.x = THREE.MathUtils.degToRad(-5);
  return g;
}

/** 垂直尾翼（后掠 + 蓝色涂装） */
function makeVerticalTail(mat, accentMat) {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(1.6, 0);
  shape.lineTo(-1.8, 0);
  shape.lineTo(-2.8, 5.2);
  shape.lineTo(-0.6, 5.2);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: false });
  geo.translate(0, 0, -0.11);
  const fin = new THREE.Mesh(geo, accentMat);
  // 立起来：从 X-Y 平面转到 X-Z 平面
  fin.rotation.x = Math.PI / 2;
  g.add(fin);
  return g;
}

/** 发动机短舱：外涵 + 黑色进气唇口 + 内芯 */
function makeEngine(mat, darkMat) {
  const g = new THREE.Group();
  const L = 4.2, R = 1.0;
  const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.9, L, 24), mat);
  nacelle.rotation.z = Math.PI / 2;
  g.add(nacelle);
  // 进气唇口
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R, 0.18, 12, 24), darkMat);
  lip.position.x = L / 2;
  g.add(lip);
  // 风扇（深色圆盘）
  const fan = new THREE.Mesh(new THREE.CircleGeometry(R * 0.85, 24), darkMat);
  fan.position.x = L / 2 - 0.05;
  fan.rotation.y = Math.PI / 2;
  g.add(fan);
  // 尾喷管
  const exhaust = new THREE.Mesh(new THREE.ConeGeometry(R * 0.55, 1.4, 20), darkMat);
  exhaust.rotation.z = -Math.PI / 2;
  exhaust.position.x = -L / 2 - 0.5;
  g.add(exhaust);
  return g;
}
