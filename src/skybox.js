/**
 * 夜空增强：星空 + 月亮 + 地平线暮光渐变。
 * 与 three.js Sky（Preetham 大气）叠加：Sky 负责日间/暮光大气散射，
 * 本模块负责夜间天体（星、月）与近地平线的逼真渐变，按 night 因子淡入。
 *
 * 所有天体挂在“天球组”上，跟随相机平移（恒在无穷远），不随飞机位移视差。
 */
import * as THREE from 'three';

const R_STAR = 4000000; // 星空半径（< 相机 far=5e6）
const R_MOON = 3800000;

// 程序化生成圆形径向渐变贴图（白心->透明），供星点/月亮光晕加性混合
function radialTexture(size, inner, color = [255, 255, 255]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},1)`);
  g.addColorStop(inner, `rgba(${color[0]},${color[1]},${color[2]},0.5)`);
  g.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 月面贴图：暖白圆盘 + 几块淡灰“月海”，自带边缘柔化
function moonFaceTexture(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;
  // 圆盘
  const g = ctx.createRadialGradient(r * 0.85, r * 0.8, r * 0.1, r, r, r);
  g.addColorStop(0, '#fffaf0');
  g.addColorStop(0.7, '#f0ead8');
  g.addColorStop(1, '#d8d0bc');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(r, r, r * 0.96, 0, Math.PI * 2); ctx.fill();
  // 月海（淡灰斑）
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#9a9488';
  const maria = [[0.42, 0.38, 0.16], [0.6, 0.5, 0.12], [0.5, 0.66, 0.13], [0.36, 0.58, 0.09], [0.68, 0.34, 0.08]];
  for (const [mx, my, mr] of maria) {
    ctx.beginPath(); ctx.arc(r * 2 * mx, r * 2 * my, r * mr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function setupSkybox(scene, camera) {
  const group = new THREE.Group();
  group.renderOrder = -1; // 在地形/飞机之前画（背景）
  scene.add(group);

  // ---- 星空：随机分布在天球上的点 ----
  const STAR_N = 2200;
  const positions = new Float32Array(STAR_N * 3);
  const sizes = new Float32Array(STAR_N);
  const colors = new Float32Array(STAR_N * 3);
  // 伪随机（确定性，避免每次刷新位置跳变）
  let seed = 1337;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < STAR_N; i++) {
    // 球面均匀采样，仅取地平线以上稍微多一点（u 偏上）
    const u = rnd() * 2 - 1;
    const phi = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const x = s * Math.cos(phi), y = Math.abs(u) * 0.9 + 0.02, z = s * Math.sin(phi);
    positions[i * 3] = x * R_STAR;
    positions[i * 3 + 1] = y * R_STAR;
    positions[i * 3 + 2] = z * R_STAR;
    // 大小：少量亮星更大
    const bright = Math.pow(rnd(), 6);
    sizes[i] = 8000 + bright * 60000;
    // 色温：多数偏白，少量偏蓝/偏橙
    const t = rnd();
    let cr = 1, cg = 1, cb = 1;
    if (t > 0.85) { cr = 0.8; cg = 0.86; cb = 1; }      // 蓝白
    else if (t < 0.12) { cr = 1; cg = 0.86; cb = 0.7; } // 橙
    const lum = 0.6 + bright * 0.4;
    colors[i * 3] = cr * lum; colors[i * 3 + 1] = cg * lum; colors[i * 3 + 2] = cb * lum;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starTex = radialTexture(64, 0.3);
  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTex: { value: starTex },
      uOpacity: { value: 0 },
      uTwinkle: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uTex;
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(vColor, 1.0) * t.a * uOpacity;
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    vertexColors: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  group.add(stars);

  // ---- 月亮：圆盘 + 光晕（加性光晕，圆盘正常混合保留月面）----
  const moonGroup = new THREE.Group();
  group.add(moonGroup);

  const haloMat = new THREE.SpriteMaterial({
    map: radialTexture(128, 0.18, [220, 230, 255]),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    fog: false, // 天体在 fog.far 之外，须关雾否则被雾色染黑
    opacity: 0,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(900000);
  moonGroup.add(halo);

  const diskMat = new THREE.SpriteMaterial({
    map: moonFaceTexture(256),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    fog: false, // 同上，否则月面被夜雾染成黑盘
    opacity: 0,
  });
  const disk = new THREE.Sprite(diskMat);
  disk.scale.setScalar(260000);
  moonGroup.add(disk);

  // ---- 地平线暮光渐变：一个略大于相机近处的天幕半球内壁色带 ----
  // 用一个跟随相机的大反向球，底部暖、顶部深蓝，按 night/dusk 调色与透明度。
  const gradGeo = new THREE.SphereGeometry(R_STAR * 0.92, 32, 16);
  const gradMat = new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: new THREE.Color('#0a1226') },
      uHorizon: { value: new THREE.Color('#1a2647') },
      uOpacity: { value: 0 },
    },
    vertexShader: `
      varying float vY;
      void main() {
        vY = normalize(position).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uTop; uniform vec3 uHorizon; uniform float uOpacity;
      varying float vY;
      void main() {
        float t = clamp(vY * 1.6, 0.0, 1.0);       // 地平线->天顶
        float band = clamp(1.0 - abs(vY) * 3.2, 0.0, 1.0); // 近地平线带
        vec3 col = mix(uHorizon, uTop, t);
        float a = uOpacity * (0.45 + band * 0.55);
        gl_FragColor = vec4(col, a);
      }`,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const gradDome = new THREE.Mesh(gradGeo, gradMat);
  gradDome.renderOrder = -2;
  gradDome.frustumCulled = false;
  group.add(gradDome);

  const _moonColor = new THREE.Color();

  /**
   * 每帧更新。info 来自 applyLighting 的返回。
   * @param info { night, moonDir(THREE.Vector3,单位), moonAltDeg, moonFraction, sunAltDeg }
   */
  function update(info) {
    // 天球跟随相机（恒无穷远）
    group.position.copy(camera.position);

    const night = info ? info.night : 0;
    const sunAlt = info ? info.sunAltDeg : 90;

    // 星空：夜间淡入（满月稍减弱以模拟月光洗淡）
    const moonWash = info && info.moonAltDeg > 0 ? info.moonFraction * 0.25 : 0;
    starMat.uniforms.uOpacity.value = Math.max(0, night * (1 - moonWash));

    // 暮光渐变：暮光(−2~−12°)最强，深夜略降，白天关闭
    let duskW = 0;
    if (sunAlt < 6) duskW = Math.min(1, (6 - sunAlt) / 14);
    gradMat.uniforms.uOpacity.value = duskW * 0.8;
    // 暮光偏暖蓝，深夜偏深蓝
    const warm = Math.max(0, 1 - night); // 越接近黄昏越暖
    gradMat.uniforms.uHorizon.value.setRGB(
      0.10 + warm * 0.32,
      0.15 + warm * 0.14,
      0.28
    );
    gradMat.uniforms.uTop.value.setRGB(0.04, 0.07, 0.15);

    // 月亮：地平线以上才显示，按夜间因子淡入
    if (info && info.moonDir && info.moonAltDeg > -2) {
      moonGroup.visible = true;
      moonGroup.position.copy(info.moonDir).multiplyScalar(R_MOON);
      const vis = Math.min(1, Math.max(0, (info.moonAltDeg + 2) / 8)) * Math.max(0.25, night);
      // 满月更亮更白，月牙偏暗
      const frac = info.moonFraction != null ? info.moonFraction : 1;
      diskMat.opacity = vis;
      haloMat.opacity = vis * (0.18 + frac * 0.28);
      _moonColor.setRGB(1, 0.97, 0.9);
      diskMat.color.copy(_moonColor);
      halo.scale.setScalar(360000 + frac * 320000);
    } else {
      moonGroup.visible = false;
    }
  }

  return { update };
}
