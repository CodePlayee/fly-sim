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
 *   flapL / flapR          内段襟翼（起降放下）            —— rotation.y
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
      segments: [
        { type: 'flap',    span: [2.2, 9.5],   cf: 0.30 }, // 内段后缘襟翼
        { type: 'aileron', span: [10.5, 14.8], cf: 0.26 }, // 外段后缘副翼
      ],
      flapFairings: { span: [2.6, 9.2], cf: 0.30, count: 4 }, // 襟翼滑轨整流罩
      spoilerSpan: [5.5, 10.0],
    });
    mountWing(w, side, WING, WING.rootX, WING.rootY, WING.rootZ);
    plane.add(w.group);
    if (side === 1) { controls.aileronL = w.aileron; controls.flapL = w.flap; controls.spoilerL = w.spoiler; }
    else { controls.aileronR = w.aileron; controls.flapR = w.flap; controls.spoilerR = w.spoiler; }
  }
  // 翼根整流（wing-body fairing）：贴机腹与翼根之间
  {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(WING.rootChord * 1.05, FUS_R * 1.7, 1.0), M.fuse);
    fr.position.set(WING.rootX - 0.3, 0, -FUS_R * 0.55);
    plane.add(fr);
  }

  // =========================================================================
  // 发动机（CFM56）：吊挂于翼下，短舱跨过当地机翼前缘（进气口前伸、尾喷在翼下）。
  // =========================================================================
  // 机翼前缘在 plane 坐标随展向后掠：LE(y)=rootX + rootChord/2 - tan(sweep)*|y|
  const wingLEAt = (y) =>
    WING.rootX + WING.rootChord * 0.5 - Math.tan(THREE.MathUtils.degToRad(WING.sweepLE)) * Math.abs(y);
  const ENG_Y = 5.6;                       // 发动机横向站位
  const engLE = wingLEAt(ENG_Y);           // 该站位的当地前缘 x
  for (const side of [1, -1]) {
    const eng = makeEngine(M);
    const y = side * ENG_Y;
    // 短舱中心略前于当地前缘：进气口前伸约 2m，尾喷落在翼下。吊在翼下、高于地面。
    eng.group.position.set(engLE - 0.3, y, WING.rootZ - 0.35);
    eng.group.scale.y = side;
    plane.add(eng.group);
    if (side === 1) controls.fanL = eng.fan; else controls.fanR = eng.fan;

    // 吊挂(pylon)：从短舱顶斜接到当地翼前缘下方（短粗，紧贴翼下）
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.7), M.nacelle);
    pylon.position.set(engLE + 0.2, y, WING.rootZ + 0.05);
    pylon.rotation.y = 0.1;
    plane.add(pylon);
  }

  // =========================================================================
  // 尾翼（常规布局）：平尾在尾椎中后部，垂尾前移、带背鳍
  // =========================================================================
  const HTAIL = { span: 6.2, rootChord: 3.6, tipChord: 1.2, sweepLE: 28, dihedral: 6,
    rootX: CYL_BACK - TAIL_LEN * 0.55, rootZ: FUS_R * 0.55, rootY: FUS_R * 0.3 };
  for (const side of [1, -1]) {
    const t = makeWing(HTAIL, M, {
      winglet: false,
      segments: [{ type: 'elevator', span: [0.5, 5.7], cf: 0.34 }],
      spoilerSpan: null,
    });
    mountWing(t, side, HTAIL, HTAIL.rootX, HTAIL.rootY, HTAIL.rootZ);
    plane.add(t.group);
    if (side === 1) controls.elevatorL = t.elevator; else controls.elevatorR = t.elevator;
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

  // =========================================================================
  // 外部灯光（夜间开启）：航行灯/防撞信标/频闪/着陆灯。
  // =========================================================================
  controls.lights = buildExteriorLights(plane, M, {
    WING, FUS_R, CYL_FRONT, CYL_BACK, TAIL_LEN, GROUND_Z,
    wingLEAt,
  });

  plane.updateMatrixWorld(true);
  return plane;
}

/**
 * 后掠梯形翼。返回 { group, surfaces, aileron, flap, elevator, spoiler }。
 * 局部坐标：x=弦向(+前 -后)，y=展向(0=翼根)，z=厚度(向上)。
 * 翼面用 1/4 弦后掠定位：前缘随展向后移 tan(sweepLE)*y。
 *
 * 关键：后缘操纵面（襟翼/副翼/升降舵）不再是"挂在满弦翼后的悬浮薄板"，而是
 * 把固定翼面的后缘在各操纵面展向区间**向前切出凹槽**(notch)，操纵面恰好嵌入凹槽、
 * 铰链在凹槽前沿、后端齐平真后缘。这样俯视后缘是分段精细的（与真机一致），
 * 且操纵面绕铰链偏转时凹槽露出、外形连续。
 *
 * opt.segments: [{ type:'flap'|'aileron'|'elevator', span:[y1,y2], cf }]
 *   cf = 操纵面弦 / 当地弦长（0~1），铰链线 = 真后缘前移 cf*当地弦。
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
  const chordAt = (y) => leAt(y) - teAt(y);
  // 某操纵面在展向 y 处的铰链 x（真后缘前移 cf*当地弦）
  const hingeAt = (y, cf) => teAt(y) + cf * chordAt(y);

  const WING_TH = 0.34;
  const thickFrac = (y) => 1 - 0.5 * (y / span); // 翼尖减薄系数
  // 展向局部厚度（用于操纵面/扰流板贴合）
  const halfThickAt = (y) => (WING_TH / 2) * thickFrac(y);

  // 操纵面区间（按展向从外到内排序，便于沿后缘走线切凹槽）
  const segments = (opt.segments || []).slice().sort((a, b) => b.span[1] - a.span[1]);

  // ---- 固定翼面外形：前缘 + 翼尖 + 带凹槽的后缘 ----
  const shape = new THREE.Shape();
  shape.moveTo(leRootX, 0);          // 翼根前缘
  shape.lineTo(leTipX, span);        // 前缘到翼尖
  shape.lineTo(teTipX, span);        // 翼尖后缘（满弦）
  // 后缘自翼尖向翼根回走，遇操纵面区间则前移到铰链线形成凹槽
  for (const sgmt of segments) {
    const [y1, y2] = sgmt.span;
    shape.lineTo(teAt(y2), y2);             // 区间外端：真后缘
    shape.lineTo(hingeAt(y2, sgmt.cf), y2); // 前移到铰链（凹槽外壁）
    shape.lineTo(hingeAt(y1, sgmt.cf), y1); // 沿铰链线到内端
    shape.lineTo(teAt(y1), y1);             // 退回真后缘（凹槽内壁）
  }
  shape.lineTo(teRootX, 0);           // 翼根后缘
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: WING_TH, bevelEnabled: false });
  geo.translate(0, 0, -WING_TH / 2);
  // 翼尖减薄（z 减薄）
  {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      p.setZ(i, p.getZ(i) * thickFrac(p.getY(i)));
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  }
  g.add(new THREE.Mesh(geo, M.wing));

  // ---- 后缘操纵面：嵌入各自凹槽，铰链在凹槽前沿(x=0)，绕 +Y 偏转 ----
  const surfaces = {};
  for (const sgmt of segments) {
    const [y1, y2] = sgmt.span;
    const ymid = (y1 + y2) / 2;
    const hx = hingeAt(ymid, sgmt.cf); // 铰链中点 x（作为子组原点，rotation.y 绕此处的 +Y）
    const grp = new THREE.Group();
    grp.position.set(hx, ymid, 0);
    // 梯形面：前沿沿铰链线，后沿齐真后缘；相对子组原点
    const s = new THREE.Shape();
    s.moveTo(hingeAt(y1, sgmt.cf) - hx, y1 - ymid); // 前内
    s.lineTo(hingeAt(y2, sgmt.cf) - hx, y2 - ymid); // 前外
    s.lineTo(teAt(y2) - hx, y2 - ymid);             // 后外
    s.lineTo(teAt(y1) - hx, y1 - ymid);             // 后内
    s.closePath();
    const th = halfThickAt(ymid) * 2 * 0.92;
    const sg = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: false });
    sg.translate(0, 0, -th / 2);
    grp.add(new THREE.Mesh(sg, M.ctrl));
    g.add(grp);
    surfaces[sgmt.type] = grp; // 同型多段时取最后一段（本模型每型单段）
  }

  // 襟翼滑轨整流罩（flap track fairings，737 标志性"独木舟"鼓包）：
  // 沿襟翼后缘下方等距分布，跨铰链线前后延伸，向后伸出真后缘、向下鼓出。
  if (opt.flapFairings) {
    const { span: fsp, cf, count } = opt.flapFairings;
    const [fy1, fy2] = fsp;
    for (let i = 0; i < count; i++) {
      const y = fy1 + (fy2 - fy1) * ((i + 0.5) / count);
      const hx = hingeAt(y, cf);
      const teX = teAt(y);
      const len = (hx - teX) + 0.7;            // 跨铰链前 + 略伸出后缘
      const cx = (hx + 0.4) - len / 2;         // 中心：略前于铰链
      const fair = new THREE.Group();
      const zBot = -halfThickAt(y) - 0.16;     // 鼓出在翼下
      fair.position.set(cx, y, zBot);
      // 流线鼓包：拉长椭球压扁成"独木舟"
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), M.wing);
      body.scale.set(len / 1.0, 0.4, 0.46);
      fair.add(body);
      // 尾椎（向后收尖，钝短地伸出后缘）
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 12), M.wing);
      tip.rotation.z = Math.PI / 2;            // 尖朝 -X(后)
      tip.position.set(-len / 2 + 0.05, 0, 0);
      tip.scale.set(1, 0.8, 0.62);
      fair.add(tip);
      g.add(fair);
    }
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
    const topZ = halfThickAt(ymid) - 0.04;
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
  return {
    group: g,
    surfaces,
    aileron: surfaces.aileron || null,
    flap: surfaces.flap || null,
    elevator: surfaces.elevator || null,
    spoiler,
  };
}

// 把翼面安装到机体：先镜像(scale.y)，再施加随侧别翻转的上反角，使左右对称。
// 注意：dihedral 必须随 side 翻转，否则被 scale.y=-1 镜像后两翼会一上一下。
function mountWing(w, side, P, posX, posY, posZ) {
  w.group.scale.y = side;
  // makeWing 内部已设 g.rotation.x=-dihedral（针对未镜像的左翼为正确上反）。
  // 镜像侧需把该旋转翻正，故整体改由此处按 side 设定，覆盖内部值。
  w.group.rotation.x = THREE.MathUtils.degToRad(P.dihedral) * side;
  w.group.position.set(posX, side * posY, posZ);
}

/** 垂直尾翼（后掠 + 蓝涂装 + 背鳍），方向舵嵌入鳍后缘凹槽、绕 Z 偏转 */
function makeVerticalTail(M) {
  const g = new THREE.Group();
  const H = 7.0;
  const TH = 0.26;
  // 鳍前/后缘随高度的 x（底→顶）：前缘 3.0→1.3，后缘 -1.8→-0.6
  const leAt = (z) => 3.0 + (1.3 - 3.0) * (z / H);
  const teAt = (z) => -1.8 + (-0.6 - (-1.8)) * (z / H);
  const chordAt = (z) => leAt(z) - teAt(z);
  // 方向舵：占后缘 cf 弦、自 z1 到 z2
  const rCf = 0.30;
  const z1 = H * 0.04, z2 = H * 0.86;
  const hingeAt = (z) => teAt(z) + rCf * chordAt(z);

  // 固定鳍外形（shape: x=弦, y=高度）：前缘 + 顶 + 带凹槽后缘 + 底
  const shape = new THREE.Shape();
  shape.moveTo(leAt(0), 0);     // 底前缘
  shape.lineTo(leAt(H), H);     // 前缘到顶
  shape.lineTo(teAt(H), H);     // 顶后缘（满弦）
  shape.lineTo(teAt(z2), z2);   // 后缘下行到方向舵顶
  shape.lineTo(hingeAt(z2), z2);// 前移到铰链（凹槽）
  shape.lineTo(hingeAt(z1), z1);// 沿铰链线下行
  shape.lineTo(teAt(z1), z1);   // 退回真后缘
  shape.lineTo(teAt(0), 0);     // 底后缘
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: TH, bevelEnabled: false });
  geo.translate(0, 0, -TH / 2);
  {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      p.setZ(i, p.getZ(i) * (1 - 0.45 * (p.getY(i) / H)));
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

  // 方向舵：嵌入凹槽，铰链在凹槽前沿，绕模型 +Z(竖轴) 偏转 -> 偏航。
  const zmid = (z1 + z2) / 2;
  const hx = hingeAt(zmid);
  const rudder = new THREE.Group();
  rudder.position.set(hx, 0, zmid);
  // 舵面外形（shape: x=弦, y=高度），相对 rudder 原点
  const rs = new THREE.Shape();
  rs.moveTo(hingeAt(z1) - hx, z1 - zmid); // 前下
  rs.lineTo(hingeAt(z2) - hx, z2 - zmid); // 前上
  rs.lineTo(teAt(z2) - hx, z2 - zmid);    // 后上
  rs.lineTo(teAt(z1) - hx, z1 - zmid);    // 后下
  rs.closePath();
  const rg = new THREE.ExtrudeGeometry(rs, { depth: TH * 0.92, bevelEnabled: false });
  rg.translate(0, 0, -TH * 0.46);
  // 顶端略减薄（贴合鳍尖收拢）
  {
    const p = rg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const zz = zmid + p.getY(i);
      p.setZ(i, p.getZ(i) * (1 - 0.45 * (zz / H)));
    }
    p.needsUpdate = true; rg.computeVertexNormals();
  }
  const surf = new THREE.Mesh(rg, M.accent);
  surf.rotation.x = Math.PI / 2; // 与鳍同样把 shape-y(高度)→模型 +Z
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

// ===========================================================================
// 外部灯光系统
// ===========================================================================

/** 生成一张径向渐变的圆形光晕贴图（中心亮、边缘透明），供 Sprite 用。 */
let _glowTex = null;
function glowTexture() {
  if (_glowTex) return _glowTex;
  const s = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.65)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  _glowTex = new THREE.CanvasTexture(cv);
  return _glowTex;
}

/**
 * 单盏灯：一个小发光球(core) + 一个加法混合光晕(halo Sprite)。
 * 返回 { group, set(on,intensity) }。set 控制亮灭与强度（0~1）。
 */
function makeLamp(color, coreR = 0.12, haloScale = 1.6) {
  const group = new THREE.Group();
  const col = new THREE.Color(color);
  const coreMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(coreR, 8, 8), coreMat);
  group.add(core);

  const haloMat = new THREE.SpriteMaterial({
    map: glowTexture(),
    color: col,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(haloScale);
  group.add(halo);

  function set(on, intensity = 1) {
    const k = on ? intensity : 0;
    group.visible = k > 0.01;
    coreMat.opacity = Math.min(1, k * 1.2);
    haloMat.opacity = 0.9 * k;
    halo.scale.setScalar(haloScale * (0.7 + 0.3 * k));
  }
  set(false);
  return { group, set };
}

/**
 * 在机体上布置全部外部灯，返回 { update(opts) }。
 * 颜色与位置依据真实客机：
 *   航行灯  左翼尖红 / 右翼尖绿 / 尾椎白（夜间常亮）
 *   防撞信标 机身上+下 红（夜间闪烁，慢）
 *   频闪灯  两翼尖 + 尾椎 白（高频双闪）
 *   着陆灯  翼根前缘 + 机头 白（低空/地面，含 SpotLight 前射光锥）
 */
function buildExteriorLights(plane, M, P) {
  const { WING, FUS_R, CYL_FRONT, CYL_BACK, TAIL_LEN, GROUND_Z, wingLEAt } = P;
  const lamps = { nav: [], beacon: [], strobe: [], landing: [] };

  // ---- 翼尖坐标（plane 局部）：用前缘后掠公式求翼尖前缘 x，叠加上反高度 ----
  const tipY = WING.span;
  const dihed = THREE.MathUtils.degToRad(WING.dihedral);
  // 翼尖前缘 x（含后掠），略偏前缘放灯
  const tipLEx = wingLEAt(tipY);
  const tipZ = WING.rootZ + Math.sin(dihed) * tipY; // 上反抬升
  for (const side of [1, -1]) {
    const y = side * tipY;
    // 航行灯：左(+Y, side=1)红、右(-Y, side=-1)绿。靠前缘、翼尖。
    const nav = makeLamp(side === 1 ? 0xff2222 : 0x22ff44, 0.1, 1.3);
    nav.group.position.set(tipLEx - 0.1, y, tipZ);
    plane.add(nav.group);
    lamps.nav.push(nav);
    // 频闪：白，翼尖（与航行灯同位略后）
    const st = makeLamp(0xffffff, 0.1, 1.8);
    st.group.position.set(tipLEx - 0.4, y, tipZ);
    plane.add(st.group);
    lamps.strobe.push(st);
  }

  // ---- 尾椎航行灯(白) + 尾频闪(白) ----
  const tailX = CYL_BACK - TAIL_LEN * 0.92;
  const tailZ = FUS_R * 0.2;
  const tailNav = makeLamp(0xffffff, 0.1, 1.3);
  tailNav.group.position.set(tailX, 0, tailZ);
  plane.add(tailNav.group);
  lamps.nav.push(tailNav);
  const tailStrobe = makeLamp(0xffffff, 0.11, 1.9);
  tailStrobe.group.position.set(tailX + 0.05, 0, tailZ);
  plane.add(tailStrobe.group);
  lamps.strobe.push(tailStrobe);

  // ---- 防撞信标(红)：机身顶 + 机腹，闪烁 ----
  const beaconTop = makeLamp(0xff3010, 0.13, 1.8);
  beaconTop.group.position.set(WING.rootX + 0.5, 0, FUS_R * 1.02);
  plane.add(beaconTop.group);
  lamps.beacon.push(beaconTop);
  const beaconBot = makeLamp(0xff3010, 0.13, 1.8);
  beaconBot.group.position.set(WING.rootX + 0.5, 0, -FUS_R * 1.02);
  plane.add(beaconBot.group);
  lamps.beacon.push(beaconBot);

  // ---- 着陆/滑行灯(白)：翼根前缘两侧 + 机头下方，带 SpotLight 真实前射光锥 ----
  const landGeoms = [
    { x: wingLEAt(WING.rootY + 1.5) - 0.1, y: WING.rootY + 1.2, z: WING.rootZ },
    { x: wingLEAt(WING.rootY + 1.5) - 0.1, y: -(WING.rootY + 1.2), z: WING.rootZ },
    { x: CYL_FRONT - 0.4, y: 0, z: -FUS_R * 0.9 }, // 机头/前起落架附近
  ];
  for (const g of landGeoms) {
    const lp = makeLamp(0xfff4e0, 0.14, 2.0);
    lp.group.position.set(g.x, g.y, g.z);
    plane.add(lp.group);
    // SpotLight：朝机头前方(+X)、略下俯，照亮前方
    const spot = new THREE.SpotLight(0xfff0d8, 0, 600, Math.PI / 7, 0.4, 1.2);
    spot.position.set(g.x, g.y, g.z);
    const tgt = new THREE.Object3D();
    tgt.position.set(g.x + 200, g.y, g.z - 30); // 前下方
    plane.add(tgt);
    spot.target = tgt;
    plane.add(spot);
    lamps.landing.push({ lamp: lp, spot });
  }

  // ---- 逐帧驱动 ----
  // opts: { night(bool), agl(米), onGround(bool), tMs(时间 ms 用于闪烁) }
  let _spin = 0;
  function update(opts) {
    const night = !!opts.night;
    const t = opts.tMs || 0;
    // 航行灯：夜间常亮
    for (const l of lamps.nav) l.set(night, 1);

    // 防撞信标：夜间慢速旋转闪（约 0.7s 周期的脉冲）
    _spin = (t / 1000) % 1;
    const beaconPulse = Math.pow(Math.max(0, Math.sin(t * 0.006)), 8); // 尖脉冲
    for (const l of lamps.beacon) l.set(night, beaconPulse);

    // 频闪：夜间高频双闪（每 ~1.2s 来一组两下白闪）
    const cyc = (t % 1200) / 1200;
    const flash = (cyc < 0.04 || (cyc > 0.10 && cyc < 0.14)) ? 1 : 0;
    for (const l of lamps.strobe) l.set(night, flash);

    // 着陆灯：夜间且低空(<450m AGL)或地面时亮，SpotLight 同步给强度
    const landOn = night && (opts.onGround || (opts.agl != null && opts.agl < 450));
    for (const { lamp, spot } of lamps.landing) {
      lamp.set(landOn, 1);
      spot.intensity = landOn ? 800 : 0;
    }
  }
  update({ night: false });
  return { update, lamps };
}

