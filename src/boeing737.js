import * as THREE from 'three';

/**
 * 程序化生成一架波音 737-800 风格客机（不依赖任何外部模型文件）。
 *
 * 模型本地坐标系：+X = 机头朝向，+Y = 左翼，+Z = 上。单位：米。
 * 真实尺寸（737-800）：总长 39.47m × 翼展 35.79m × 机高 12.55m，机身直径 3.76m。
 * 模型原点（pivot）≈ 机身中线，离地约 3.5m（主轮触地时）。
 *
 * 可动部件通过 plane.userData.controls 暴露，供 aircraftModel.js 按飞行状态做动画：
 *   aileronL / aileronR    副翼（差动，随滚转）           —— rotation.y
 *   elevatorL / elevatorR  升降舵（随俯仰）               —— rotation.y
 *   rudder                 方向舵（随偏航/转弯）           —— rotation.z
 *   fanL / fanR            发动机风扇（随油门旋转）         —— rotation.x
 *   spoilerL / spoilerR    扰流板/减速板（地面低油门展开）   —— rotation.y
 *   noseSteer              前轮转向枢轴（随方向舵）         —— rotation.z
 *   setGear(f)             起落架收放：f∈[0,1]，0=收起 1=放下
 *   gearN / gearL / gearR  三套起落架枢轴（如需直接访问）
 */
export function buildBoeing737() {
  const plane = new THREE.Group();
  plane.name = 'boeing737';
  const controls = {};
  plane.userData.controls = controls;

  // ---- 材质 ----
  const M = {
    fuse:   new THREE.MeshStandardMaterial({ color: 0xf3f5f8, metalness: 0.15, roughness: 0.52 }),
    wing:   new THREE.MeshStandardMaterial({ color: 0xe4e9ef, metalness: 0.22, roughness: 0.5 }),
    ctrl:   new THREE.MeshStandardMaterial({ color: 0xd2dae3, metalness: 0.22, roughness: 0.5 }),
    accent: new THREE.MeshStandardMaterial({ color: 0x21407a, metalness: 0.28, roughness: 0.45 }),
    cheat:  new THREE.MeshStandardMaterial({ color: 0x1d3566, metalness: 0.28, roughness: 0.45 }),
    nacelle:new THREE.MeshStandardMaterial({ color: 0xe9edf2, metalness: 0.45, roughness: 0.35 }),
    dark:   new THREE.MeshStandardMaterial({ color: 0x14181f, metalness: 0.4, roughness: 0.45 }),
    tire:   new THREE.MeshStandardMaterial({ color: 0x16191d, metalness: 0.1, roughness: 0.85 }),
    metal:  new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.8, roughness: 0.32 }),
    glass:  new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.25, roughness: 0.12 }),
  };

  // ---- 主尺寸 ----
  const FUS_R = 1.88;
  const TOTAL_LEN = 39.47;
  const CYL_LEN = 24.0;          // 等直径筒身
  const NOSE_LEN = 4.8;
  const TAIL_LEN = TOTAL_LEN - CYL_LEN - NOSE_LEN; // ≈10.67 尾椎(含上翘)
  const CYL_FRONT = CYL_LEN / 2;
  const CYL_BACK = -CYL_LEN / 2;

  // =========================================================================
  // 机身
  // =========================================================================
  const fuselage = new THREE.Group();
  plane.add(fuselage);

  // 等直径筒身
  const body = new THREE.Mesh(new THREE.CylinderGeometry(FUS_R, FUS_R, CYL_LEN, 40), M.fuse);
  body.rotation.z = Math.PI / 2;
  fuselage.add(body);

  // 机头：平滑 ogive（Lathe），渐缩到近似闭合的圆钝头
  {
    const pts = [];
    const segs = 20;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const x = t * NOSE_LEN;
      // 饱满 ogive：根=FUS_R，t→1 时半径平滑收到≈0（闭合，避免机头开洞）
      const r = FUS_R * Math.sqrt(Math.max(0, 1 - t * t)) * (0.55 + 0.45 * (1 - t)) + 0.02;
      pts.push(new THREE.Vector2(Math.max(0.02, r), x));
    }
    const geo = new THREE.LatheGeometry(pts, 40);
    const nose = new THREE.Mesh(geo, M.fuse);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = CYL_FRONT;
    fuselage.add(nose);
  }

  // 尾椎：渐缩 + 上翘（upsweep）
  {
    const pts = [];
    const segs = 18;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const x = t * TAIL_LEN;
      const r = FUS_R * (1 - Math.pow(t, 1.5)) + 0.06;
      pts.push(new THREE.Vector2(Math.max(0.05, r), x));
    }
    const geo = new THREE.LatheGeometry(pts, 40);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const along = pos.getY(i); // lathe 轴向距离
      const up = Math.pow(along / TAIL_LEN, 1.7) * FUS_R * 1.15;
      pos.setZ(i, pos.getZ(i) + up);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    const tail = new THREE.Mesh(geo, M.fuse);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = CYL_BACK;
    fuselage.add(tail);
  }

  // 驾驶舱风挡：737 风格——机头上前部的深色窗带（前风挡 + 侧窗），
  // 贴合机头实际锥面半径（机头是渐缩 ogive，此处半径远小于机身半径）。
  {
    const wxFront = CYL_FRONT + NOSE_LEN * 0.42;
    const wxSide = CYL_FRONT + NOSE_LEN * 0.2;
    // 机头某站位处的半径（与机头 Lathe 剖面一致）
    const noseR = (x) => {
      const t = Math.max(0, Math.min(1, (x - CYL_FRONT) / NOSE_LEN));
      return FUS_R * Math.sqrt(Math.max(0, 1 - t * t)) * (0.55 + 0.45 * (1 - t)) + 0.02;
    };
    // 在机头上半、给定纵向站位 x、周向角 a(0=机顶) 处放一片贴合曲面的窗
    const addPane = (x, a, w, h, tiltY) => {
      const r = noseR(x);
      const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), M.glass);
      // 贴在锥面上：法向沿 (sin a 侧, cos a 上)
      pane.position.set(x, Math.sin(a) * r, Math.cos(a) * r);
      pane.rotation.x = a;             // 让板面贴合周向
      pane.rotation.y = tiltY;         // 纵向前倾
      fuselage.add(pane);
    };
    for (const side of [1, -1]) {
      // 前风挡：两片靠近机顶（小角度），略前倾
      addPane(wxFront, side * 0.42, 1.0, 0.5, -0.32);
      // 侧窗：一片在更侧、更后
      addPane(wxSide, side * 0.72, 0.9, 0.46, -0.12);
    }
  }

  // 舷窗带 + cheatline（机身侧面深色细带）
  for (const side of [1, -1]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(CYL_LEN * 0.96, 0.04, 0.34), M.dark);
    win.position.set(-0.5, side * FUS_R * 0.992, FUS_R * 0.32);
    fuselage.add(win);
    const cheat = new THREE.Mesh(new THREE.BoxGeometry(TOTAL_LEN * 0.78, 0.04, 0.2), M.cheat);
    cheat.position.set(-0.5, side * FUS_R * 0.999, -FUS_R * 0.02);
    fuselage.add(cheat);
  }

  // =========================================================================
  // 主翼（低单翼）。翼根在机身中后段稍前；发动机前伸到翼前缘之前。
  // =========================================================================
  const WING = {
    span: 16.0,        // 单侧半展（含 winglet 前的翼面）
    rootChord: 6.4,
    tipChord: 1.6,
    sweepLE: 25,       // 前缘后掠角(度)
    dihedral: 6,
    rootX: -1.2,       // 翼根 1/4 弦处机身站位
    rootZ: -FUS_R * 0.62,
    rootY: FUS_R * 0.5,
  };
  for (const side of [1, -1]) {
    const w = makeWing(WING, M, {
      winglet: true,
      aileronSpan: [11.5, 15.2],
      spoilerSpan: [5.5, 10.0],
    });
    w.group.scale.y = side;
    w.group.position.set(WING.rootX, side * WING.rootY, WING.rootZ);
    plane.add(w.group);
    if (side === 1) { controls.aileronL = w.aileron; controls.spoilerL = w.spoiler; }
    else { controls.aileronR = w.aileron; controls.spoilerR = w.spoiler; }
  }
  // 翼根整流（wing-body fairing）：贴机腹与翼根之间
  {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(WING.rootChord * 1.05, FUS_R * 1.7, 1.0), M.fuse);
    fr.position.set(WING.rootX - 0.3, 0, -FUS_R * 0.55);
    plane.add(fr);
  }

  // =========================================================================
  // 发动机（CFM56）：吊挂于翼下，明显前伸到机翼前缘之前。
  // =========================================================================
  // 翼前缘在翼根处的 x（1/4 弦定位法：rootX 是 1/4 弦，前缘 = rootX + rootChord*0.25）
  const wingLE_root = WING.rootX + WING.rootChord * 0.25;
  for (const side of [1, -1]) {
    const eng = makeEngine(M);
    const y = side * 5.6;       // 横向：离机身中线
    // 短舱中心：前伸到翼前缘之前；吊在翼下、底部高于地面（中心-R > GROUND_Z）
    eng.group.position.set(wingLE_root + 2.6, y, WING.rootZ - 0.55);
    eng.group.scale.y = side;
    plane.add(eng.group);
    if (side === 1) controls.fanL = eng.fan; else controls.fanR = eng.fan;

    // 吊挂(pylon)：从短舱顶斜接到翼前缘下方
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.32, 1.0), M.nacelle);
    pylon.position.set(wingLE_root + 1.4, y, WING.rootZ - 0.3);
    pylon.rotation.y = 0.18;
    plane.add(pylon);
  }

  // =========================================================================
  // 尾翼（常规布局）：平尾在尾椎中后部，垂尾前移、带背鳍
  // =========================================================================
  const HTAIL = { span: 6.2, rootChord: 3.6, tipChord: 1.2, sweepLE: 28, dihedral: 6,
    rootX: CYL_BACK - TAIL_LEN * 0.55, rootZ: FUS_R * 0.55, rootY: FUS_R * 0.3 };
  for (const side of [1, -1]) {
    const t = makeWing(HTAIL, M, { winglet: false, aileronSpan: [0.5, 5.7], spoilerSpan: null });
    t.group.scale.y = side;
    t.group.position.set(HTAIL.rootX, side * HTAIL.rootY, HTAIL.rootZ);
    plane.add(t.group);
    if (side === 1) controls.elevatorL = t.aileron; else controls.elevatorR = t.aileron;
  }
  {
    const vt = makeVerticalTail(M);
    vt.group.position.set(CYL_BACK - TAIL_LEN * 0.42, 0, FUS_R * 0.85);
    plane.add(vt.group);
    controls.rudder = vt.rudder;
  }

  // =========================================================================
  // 起落架（三套双轮，可收放；前轮可转向）
  // =========================================================================
  // 主轮触地时机身中线离地约 GEAR_DROP（从翼根机腹算）。所有 gear group 原点放在
  // 各自机腹挂点，drop=该挂点到轮底的竖直距离，使三组轮底落在同一地平面。
  const GROUND_Z = -3.05;              // 轮底所在的 plane 局部 z（同一地平面，机身坐姿较低更真实）
  // 前起落架（挂点在机头腹部）
  const ngAttachZ = -FUS_R * 0.95;
  const ng = makeNoseGear(M, ngAttachZ - GROUND_Z);
  ng.group.position.set(CYL_FRONT - 0.6, 0, ngAttachZ);
  plane.add(ng.group);
  controls.gearN = ng.group;
  controls.noseSteer = ng.steer;

  const mains = {};
  const mgAttachZ = WING.rootZ - 0.2;
  const MG_Y = 2.5;                     // 放下时主轮横向站位（翼根下、机身外侧）
  for (const side of [1, -1]) {
    const mg = makeMainGear(M, mgAttachZ - GROUND_Z);
    mg.group.position.set(WING.rootX - 1.6, side * MG_Y, mgAttachZ);
    mg.group.scale.y = side;
    plane.add(mg.group);
    if (side === 1) { controls.gearL = mg.group; mains.L = mg; }
    else { controls.gearR = mg.group; mains.R = mg; }
  }

  // 轮舱整流鼓包（机腹翼根处，收起时轮子藏入其内的视觉依托）
  {
    const bay = new THREE.Mesh(new THREE.BoxGeometry(4.2, FUS_R * 1.5, 1.2), M.fuse);
    bay.position.set(WING.rootX - 1.4, 0, -FUS_R * 0.75);
    plane.add(bay);
  }

  controls.setGear = (f) => {
    f = Math.max(0, Math.min(1, f));
    // 前轮：向后收（绕 +Y 转）
    ng.group.rotation.y = (1 - f) * (95 * Math.PI / 180);
    // 主轮：向内收（绕 +X 转）+ 横向缩进机身中线 + 略上抬，收起后藏进机腹轮舱
    const mr = (1 - f) * (88 * Math.PI / 180);
    const yIn = (1 - f) * (MG_Y - 0.3);      // 收起时横向缩到接近中线
    const zUp = (1 - f) * 0.5;               // 略上抬贴机腹
    for (const side of [1, -1]) {
      const mg = side === 1 ? mains.L : mains.R;
      if (!mg) continue;
      mg.group.rotation.x = mr;
      mg.group.position.set(WING.rootX - 1.6, side * (MG_Y - yIn), mgAttachZ + zUp);
    }
  };
  controls.setGear(1);

  plane.updateMatrixWorld(true);
  return plane;
}

/**
 * 后掠梯形翼。返回 { group, aileron, spoiler }。
 * 局部坐标：x=弦向(+前 -后)，y=展向(0=翼根)，z=厚度(向上)。
 * 翼面用 1/4 弦后掠定位：前缘随展向后移 tan(sweepLE)*y。
 */
function makeWing(P, M, opt) {
  const { span, rootChord, tipChord, sweepLE, dihedral } = P;
  const g = new THREE.Group();

  const dxLE = Math.tan(THREE.MathUtils.degToRad(sweepLE)) * span; // 翼尖前缘后移量
  const leRootX = rootChord * 0.5;
  const teRootX = -rootChord * 0.5;
  const leTipX = leRootX - dxLE;
  const teTipX = leTipX - tipChord;

  const leAt = (y) => leRootX + (leTipX - leRootX) * (y / span);
  const teAt = (y) => teRootX + (teTipX - teRootX) * (y / span);

  // 操纵面占后缘弦的比例
  const ctrlFrac = 0.26;
  // 固定翼面后缘 = 真后缘 + ctrlFrac*弦（即把后 ctrlFrac 留给操纵面区间内，区间外仍是满弦）
  // 简化：固定翼面用满外形，操纵面以薄板叠在后缘上方/对齐，避免外挂碎块——
  // 这里固定翼面用满外形，操纵面区间内在后缘"内嵌"切口由操纵面板补齐。
  const WING_TH = 0.34;

  // 固定翼面外形（满梯形）
  const shape = new THREE.Shape();
  shape.moveTo(leRootX, 0);
  shape.lineTo(teRootX, 0);
  shape.lineTo(teTipX, span);
  shape.lineTo(leTipX, span);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: WING_TH, bevelEnabled: false });
  geo.translate(0, 0, -WING_TH / 2);
  // 翼尖减薄（前后缘收拢 + z 减薄）
  {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const yy = p.getY(i);
      p.setZ(i, p.getZ(i) * (1 - 0.5 * (yy / span)));
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  }
  g.add(new THREE.Mesh(geo, M.wing));

  // 后缘操纵面（副翼/升降舵）：贴合后缘的梯形薄板，铰链在后缘线
  let aileron = null;
  if (opt.aileronSpan) {
    const [y1, y2] = opt.aileronSpan;
    const ymid = (y1 + y2) / 2;
    const half = (y2 - y1) / 2;
    const chord = Math.max(0.7, rootChord * ctrlFrac);
    aileron = new THREE.Group();
    aileron.position.set(teAt(ymid), ymid, 0);
    const slope = (teAt(y2) - teAt(y1)) / (y2 - y1);
    const s = new THREE.Shape();
    // 局部：x=0 铰链(后缘)，向后(-x)延伸 chord；y 相对 ymid
    s.moveTo(slope * (-half), -half);
    s.lineTo(slope * (half), half);
    s.lineTo(slope * (half) - chord, half);
    s.lineTo(slope * (-half) - chord, -half);
    s.closePath();
    const sg = new THREE.ExtrudeGeometry(s, { depth: WING_TH * 0.7, bevelEnabled: false });
    sg.translate(0, 0, -WING_TH * 0.35);
    aileron.add(new THREE.Mesh(sg, M.ctrl));
    g.add(aileron);
  }

  // 上表面扰流板：贴翼上表面的薄板，铰链在板前缘，向上掀。
  // 面板完全位于翼面弦长之内（不超出后缘），收起时嵌入翼上表面（无悬浮缝隙）。
  let spoiler = null;
  if (opt.spoilerSpan) {
    const [y1, y2] = opt.spoilerSpan;
    const ymid = (y1 + y2) / 2;
    const sp = y2 - y1;
    const chord = 0.9;
    // 该展向位置的翼面上表面高度（考虑翼尖减薄），面板略嵌入以消除悬浮缝
    const topZ = (WING_TH / 2) * (1 - 0.5 * (ymid / span)) - 0.04;
    spoiler = new THREE.Group();
    spoiler.position.set(teAt(ymid) + chord, ymid, topZ);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(chord, sp * 0.8, 0.05), M.wing);
    panel.position.set(-chord / 2, 0, 0); // 向后(-x)延伸
    spoiler.add(panel);
    g.add(spoiler);
  }

  // 融合翼梢小翼：翼尖向上翘起的小翼面。
  // 在翼尖站位(y=span)竖一片在 X-Z 平面内的后掠梯形板，向上延伸 + 顶端略外倾。
  if (opt.winglet) {
    const c = tipChord;
    const h = 2.3;
    // 直接在 X-Z 平面构造：shape 的 (x,y) -> 模型 (x, , z)。Extrude 沿 +Z(厚度=展向)。
    const ws = new THREE.Shape();
    ws.moveTo(leTipX, 0);                 // 底前缘
    ws.lineTo(teTipX, 0);                 // 底后缘
    ws.lineTo(teTipX + c * 0.5, h);       // 顶后缘（向上+后掠）
    ws.lineTo(leTipX + c * 0.2, h);       // 顶前缘
    ws.closePath();
    const wg = new THREE.ExtrudeGeometry(ws, { depth: 0.14, bevelEnabled: false });
    wg.translate(0, 0, -0.07);
    const wl = new THREE.Mesh(wg, M.wing);
    // shape 的 +Y 就是"高度"，需把它从 Z(挤出方向无关) -> 让 shape 平面立在 X-Z：
    // ExtrudeGeometry 默认 shape 在 XY 平面、挤出沿 +Z。当前 shape-y=高度在模型 +Y(展向)，
    // 需绕 X 轴 +90° 把 shape-y 转到模型 +Z(上)，挤出方向 +Z 转到 -Y(展向厚度)。
    wl.rotation.x = Math.PI / 2;
    wl.position.set(0, span - 0.05, 0);
    g.add(wl);
  }

  g.rotation.x = THREE.MathUtils.degToRad(-dihedral); // 上反
  return { group: g, aileron, spoiler };
}

/** 垂直尾翼（后掠 + 蓝涂装 + 背鳍），含可绕 Z 偏转的方向舵 */
function makeVerticalTail(M) {
  const g = new THREE.Group();
  const H = 7.0;
  const shape = new THREE.Shape();
  shape.moveTo(3.0, 0);
  shape.lineTo(-1.8, 0);
  shape.lineTo(-0.6, H);
  shape.lineTo(1.3, H);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.26, bevelEnabled: false });
  geo.translate(0, 0, -0.13);
  {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const yy = p.getY(i);
      p.setZ(i, p.getZ(i) * (1 - 0.45 * (yy / H)));
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  }
  const fin = new THREE.Mesh(geo, M.accent);
  fin.rotation.x = Math.PI / 2;
  g.add(fin);

  // 背鳍（dorsal fillet）：根前缘向机身平滑过渡的窄长低矮三角
  const d = new THREE.Shape();
  d.moveTo(3.0, 0);
  d.lineTo(7.5, 0);
  d.lineTo(3.0, 0.9);
  d.closePath();
  const dg = new THREE.ExtrudeGeometry(d, { depth: 0.14, bevelEnabled: false });
  dg.translate(0, 0, -0.07);
  const dorsal = new THREE.Mesh(dg, M.accent);
  dorsal.rotation.x = Math.PI / 2;
  g.add(dorsal);

  // 方向舵：铰接鳍后缘，绕 Z 偏转。蓝色涂装（与鳍一体），贴合后掠后缘。
  // 鳍后缘：底(z=0)在 x=-1.8，顶(z=H)在 x=-0.6。铰链取中部高度的后缘 x。
  const rudder = new THREE.Group();
  const hingeZ = H * 0.46;
  const teX = -1.8 + (-0.6 - (-1.8)) * (hingeZ / H); // 该高度后缘 x
  rudder.position.set(teX, 0, hingeZ);
  const rChord = 0.9, rHeight = H * 0.82;
  const surf = new THREE.Mesh(new THREE.BoxGeometry(rChord, 0.16, rHeight), M.accent);
  surf.position.set(-rChord / 2, 0, 0);
  // 顶端略缩（贴合鳍尖收拢）
  {
    const p = surf.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      if (p.getZ(i) > 0) p.setX(i, p.getX(i) * 0.6); // 上端弦缩短
    }
    p.needsUpdate = true; surf.geometry.computeVertexNormals();
  }
  rudder.add(surf);
  g.add(rudder);

  return { group: g, rudder };
}

/**
 * CFM56 短舱：干净的圆筒涵道（进气唇口 + 嵌入式风扇 + 收敛尾喷 + 中心锥）。
 * 局部 +X = 前（进气）。返回 { group, fan }。
 */
function makeEngine(M) {
  const g = new THREE.Group();
  const R = 1.12;
  const L_INLET = 0.9, L_CORE = 3.0, L_NOZ = 1.2;

  // 短舱外罩（圆筒，进气端略大）
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.97, L_CORE, 32), M.nacelle);
  cowl.rotation.z = Math.PI / 2;
  g.add(cowl);
  // 进气段（略外张唇口）
  const inlet = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.02, R, L_INLET, 32), M.nacelle);
  inlet.rotation.z = Math.PI / 2;
  inlet.position.x = L_CORE / 2 + L_INLET / 2;
  g.add(inlet);
  // 进气唇口暗环（环轴沿 X，正对前方）
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, 0.12, 14, 32), M.dark);
  lip.rotation.y = Math.PI / 2;
  lip.position.x = L_CORE / 2 + L_INLET;
  g.add(lip);
  // 收敛尾喷
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.97, L_NOZ, 32), M.nacelle);
  noz.rotation.z = Math.PI / 2;
  noz.position.x = -L_CORE / 2 - L_NOZ / 2;
  g.add(noz);

  // 风扇：嵌入进气口内（盘面朝 +X），略低于唇口平面
  const fan = new THREE.Group();
  fan.position.x = L_CORE / 2 + L_INLET - 0.18;
  const disk = new THREE.Mesh(new THREE.CircleGeometry(R * 0.9, 28), M.dark);
  disk.rotation.y = Math.PI / 2;
  fan.add(disk);
  const BLADES = 22;
  for (let k = 0; k < BLADES; k++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, R * 0.82), M.metal);
    const a = (k / BLADES) * Math.PI * 2;
    b.position.set(0.02, Math.sin(a) * R * 0.46, Math.cos(a) * R * 0.46);
    b.rotation.x = a;
    b.rotation.z = 0.32;
    fan.add(b);
  }
  const spin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 16), M.dark);
  spin.rotation.z = -Math.PI / 2;
  spin.position.x = 0.26;
  fan.add(spin);
  g.add(fan);

  // 尾喷中心锥（收纳在尾喷口内，仅锥尖微露，不突出短舱外）
  const plug = new THREE.Mesh(new THREE.ConeGeometry(R * 0.42, 0.8, 18), M.dark);
  plug.rotation.z = -Math.PI / 2;          // 锥尖朝 -X（向后）
  plug.position.x = -L_CORE / 2 - L_NOZ + 0.55;
  g.add(plug);

  return { group: g, fan };
}

/** 双轮组件（共轴），轮组中心在局部原点；轮轴沿 y。 */
function makeWheels(M, radius, halfGauge) {
  const grp = new THREE.Group();
  for (const sy of [1, -1]) {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.32, 18), M.tire);
    tire.rotation.x = Math.PI / 2;
    tire.position.set(0, sy * halfGauge, 0);
    grp.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, 0.34, 10), M.metal);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, sy * halfGauge, 0);
    grp.add(hub);
  }
  return grp;
}

/** 前起落架：支柱(沿 -Z) + 底端转向枢轴 + 双前轮。drop=group 原点到轮底的正距离。 */
function makeNoseGear(M, drop) {
  const group = new THREE.Group();
  const R = 0.42;
  const wheelZ = -drop + R;            // 轮中心 z（轮底落在 -drop）
  const len = Math.max(0.2, -wheelZ);  // 支柱从原点(0)向下到轮中心
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, len, 12), M.metal);
  strut.position.z = -len / 2;
  group.add(strut);
  // 减震筒（上段更粗）
  const oleo = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, len * 0.4, 12), M.dark);
  oleo.position.z = -len * 0.25;
  group.add(oleo);

  const steer = new THREE.Group();
  steer.position.z = wheelZ;
  steer.add(makeWheels(M, R, 0.22));
  group.add(steer);
  return { group, steer };
}

/** 主起落架：粗支柱 + 双轮。drop=group 原点到轮底的正距离。 */
function makeMainGear(M, drop) {
  const group = new THREE.Group();
  const R = 0.52;
  const wheelZ = -drop + R;
  const len = Math.max(0.2, -wheelZ);
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, len, 12), M.metal);
  strut.position.z = -len / 2;
  group.add(strut);
  // 减震筒（上段更粗）
  const oleo = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, len * 0.42, 12), M.dark);
  oleo.position.z = -len * 0.26;
  group.add(oleo);
  const wheels = makeWheels(M, R, 0.3);
  wheels.position.z = wheelZ;
  group.add(wheels);
  return { group };
}
