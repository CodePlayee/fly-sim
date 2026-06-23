/**
 * 飞行动力学：点质量 + 姿态的简化 6-DOF（"街机增强"档）。
 * 不用通用物理引擎——通用引擎不含空气动力学，且本项目在地理坐标
 * (经纬度+海拔+大圆推进) 中运动，与引擎的局部笛卡尔空间存在坐标系阻抗。
 * 这里直接用力/力矩积分 + 带攻角的升力曲线（真实感来源），稳定且可逐项调参。
 *
 * 物理量：
 *   V      空速 (m/s)               this.speed
 *   gamma  航迹角 (rad, 抬升为正)    this.gamma
 *   pitch  俯仰姿态 (rad)            this.pitch    (= gamma + 攻角 alpha)
 *   roll   滚转 (rad)               this.roll
 *   heading 航向 (rad, 0=北顺时针)   this.heading
 * 关系：alpha = pitch - gamma；升力随 alpha 增大，超过失速角后骤降。
 *
 * 控制(input)沿用既有约定：
 *   input.pitch  >0=拉杆抬头(俯仰指令)   input.roll >0=右压杆
 *   input.yaw    >0=右舵               input.throttleDelta 油门增减
 * 自动回稳：松杆后滚转归零、俯仰趋向当前速度的平飞配平，转弯自动协调。
 */
const DEG = Math.PI / 180;
const R = 6378137; // 地球半径(米)

// ---- 机体与气动常数（737 量级，街机化调校）----
const MASS = 60000;        // kg
const G = 9.81;            // m/s²
const WING_S = 125;        // 机翼面积 m²
const RHO0 = 1.225;        // 海平面空气密度 kg/m³
const CL_ALPHA = 5.2;      // 升力线斜率 (每弧度)
const CL0 = 0.18;          // 零攻角升力系数（弯度）
const ALPHA_STALL = 16 * DEG;
const CD0 = 0.024;         // 零升阻力系数
const K_INDUCED = 0.045;   // 诱导阻力因子
const THRUST_MAX = 230000; // 最大推力 N（双发量级）
const V_MAX = 175;         // 结构限速 m/s（约 340 节）

// 操纵速率（街机增强：足够灵敏又不过激）
const PITCH_RATE = 18 * DEG;  // 每秒最大俯仰指令速率
const ROLL_RATE = 55 * DEG;   // 每秒最大滚转速率
const YAW_RATE = 8 * DEG;     // 方向舵直接偏航
const MAX_BANK = 50 * DEG;    // 坡度上限（姿态保护，街机+辅助）
const MAX_PITCH = 30 * DEG;
const MIN_PITCH = -25 * DEG;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/** 随高度衰减的空气密度（等温近似，够用） */
function densityAt(altM) {
  return RHO0 * Math.exp(-altM / 9200);
}

export class Aircraft {
  constructor(airport) {
    this.reset(airport);
    this.input = { pitch: 0, roll: 0, yaw: 0, throttleDelta: 0 };
  }

  reset(airport) {
    this.lon = airport.lon;
    this.lat = airport.lat;
    this.fieldElevation = airport.elevation;
    this.alt = airport.elevation + 3;
    this.heading = airport.runwayHeading * DEG;
    this.pitch = 0;
    this.roll = 0;
    this.gamma = 0;       // 航迹角
    this.speed = 0;       // 空速 V
    this.throttle = 0;
    this.onGround = true;
    this.vSpeed = 0;
    this.stalled = false;
    this.loadFactor = 1;  // 过载 g
  }

  /** 升力系数随攻角（含失速后骤降） */
  clOfAlpha(alpha) {
    const linear = CL0 + CL_ALPHA * alpha;
    const aAbs = Math.abs(alpha);
    if (aAbs <= ALPHA_STALL) return linear;
    // 失速：超过失速角后升力按角度回落
    const over = aAbs - ALPHA_STALL;
    const peak = CL0 + CL_ALPHA * ALPHA_STALL;
    const fade = Math.max(0.35, 1 - over / (14 * DEG)); // 渐降但不为 0
    return Math.sign(alpha) * peak * fade;
  }

  update(dt) {
    const i = this.input;

    // ---- 油门 ----
    this.throttle = clamp(this.throttle + i.throttleDelta * dt * 0.45, 0, 1);

    // ---- 地面滑跑 ----
    const Vr = 65; // 抬轮速度 ~126 节
    if (this.onGround) {
      this.updateGround(dt, i, Vr);
      this.advance(dt);
      return;
    }

    const V = Math.max(this.speed, 1e-3);
    const rho = densityAt(this.alt);
    const qS = 0.5 * rho * V * V * WING_S; // 动压 × 面积

    // ---- 操纵：俯仰/滚转姿态速率 ----
    // 操纵效能随动压(空速)上升；极低速时操纵无力
    const authority = clamp((V - 25) / 45, 0.05, 1);

    // 滚转：直接速率 + 自动回稳（松杆归零）
    this.roll += i.roll * ROLL_RATE * dt * authority;
    if (i.roll === 0) this.roll += (0 - this.roll) * clamp(dt * 1.6, 0, 1);
    this.roll = clamp(this.roll, -MAX_BANK, MAX_BANK);

    // 偏航（方向舵）：小幅直接改航向（侧滑在街机档忽略）
    this.heading += i.yaw * YAW_RATE * dt * authority;

    // 俯仰：拉/推杆改俯仰姿态；松杆趋向当前速度的平飞配平
    this.pitch += i.pitch * PITCH_RATE * dt * authority;
    if (i.pitch === 0) {
      const trim = this.levelTrimPitch(rho, V, this.roll);
      this.pitch += (trim - this.pitch) * clamp(dt * 0.8, 0, 1);
    }
    this.pitch = clamp(this.pitch, MIN_PITCH, MAX_PITCH);

    // ---- 气动力 ----
    const alpha = this.pitch - this.gamma;          // 攻角
    const CL = this.clOfAlpha(alpha);
    const CD = CD0 + K_INDUCED * CL * CL;           // 极曲线
    const lift = CL * qS;                            // N
    const drag = CD * qS;                            // N
    const thrust = this.throttle * THRUST_MAX;
    const weight = MASS * G;

    this.stalled = Math.abs(alpha) > ALPHA_STALL;

    // 失速：升降舵失效 + 自然低头力矩，使俯仰下降以减小攻角（自动趋向改出）
    if (this.stalled && !this.onGround) {
      const over = Math.abs(alpha) - ALPHA_STALL;
      this.pitch -= Math.sign(alpha) * Math.min(over, 12 * DEG) * dt * 2.2;
      this.pitch = clamp(this.pitch, MIN_PITCH, MAX_PITCH);
    }

    // ---- 纵向：空速变化 dV/dt = (T - D)/m - g·sinγ ----
    const dV = (thrust - drag) / MASS - G * Math.sin(this.gamma);
    this.speed = clamp(this.speed + dV * dt, 0, V_MAX);

    // ---- 法向：航迹角变化（升力 vs 重力的垂直分量）----
    // dγ/dt = (L·cosφ − W·cosγ) / (m·V)
    const dGamma = (lift * Math.cos(this.roll) - weight * Math.cos(this.gamma)) / (MASS * V);
    this.gamma += dGamma * dt;
    this.gamma = clamp(this.gamma, -35 * DEG, 35 * DEG);

    // 过载（仅供显示）：垂直方向合力 / 重力
    this.loadFactor = (lift * Math.cos(this.roll)) / weight;

    // ---- 协调转弯：坡度的水平升力分量改变航向 ----
    // dψ/dt = (L·sinφ) / (m·V)
    const dPsi = (lift * Math.sin(this.roll)) / (MASS * V);
    this.heading += dPsi * dt;
    this.heading = (this.heading + Math.PI * 2) % (Math.PI * 2);

    // ---- 由航迹角得到垂直速度，并推进位置 ----
    this.vSpeed = this.speed * Math.sin(this.gamma);
    this.advance(dt);

    // ---- 触地判定 ----
    const ground = this.fieldElevation + 3;
    if (this.alt <= ground) {
      this.alt = ground;
      this.gamma = 0;
      this.vSpeed = 0;
      if (this.speed < Vr + 8) {
        this.onGround = true;
        this.pitch = 0;
        this.roll = 0;
      }
    }
  }

  /** 求当前速度下、坡度φ时维持平飞(γ=0)所需的俯仰配平角 */
  levelTrimPitch(rho, V, roll = 0) {
    const qS = 0.5 * rho * V * V * WING_S;
    if (qS < 1) return 0;
    // 转弯时垂直升力分量为 L·cosφ，需更大 CL 维持高度 -> 除以 cosφ
    const cosR = Math.max(0.3, Math.cos(roll));
    const clNeeded = clamp((MASS * G) / (qS * cosR), -1.4, 1.6);
    const alphaNeeded = clamp((clNeeded - CL0) / CL_ALPHA, MIN_PITCH, ALPHA_STALL * 0.92);
    // 平飞 γ=0 时 pitch = alpha
    return alphaNeeded;
  }

  /** 地面滑跑：加速、抬轮 */
  updateGround(dt, i, Vr) {
    const thrust = this.throttle * THRUST_MAX;
    const rollResist = 0.02 * MASS * G;           // 滚阻
    const drag = 0.5 * RHO0 * this.speed * this.speed * WING_S * CD0;
    const net = thrust - drag - rollResist;
    this.speed = clamp(this.speed + (net / MASS) * dt, 0, V_MAX);

    // 抬轮：达到 Vr 且拉杆，俯仰抬起
    this.roll = 0;
    this.gamma = 0;
    if (this.speed >= Vr && i.pitch > 0) {
      this.pitch += PITCH_RATE * dt;
      this.pitch = clamp(this.pitch, 0, MAX_PITCH);
      if (this.pitch > 4 * DEG) {
        this.onGround = false;
        this.gamma = 0; // 离地瞬间航迹角从 0 起步，靠升力爬升
      }
    } else {
      this.pitch = Math.max(0, this.pitch - PITCH_RATE * dt);
    }
    this.vSpeed = 0;
  }

  /** 沿航向在椭球面上水平推进，并按 vSpeed 改变高度 */
  advance(dt) {
    const horiz = this.speed * Math.cos(this.gamma) * dt;
    if (horiz > 1e-4) {
      const latRad = this.lat * DEG;
      const dLat = (horiz * Math.cos(this.heading)) / R;
      const dLon = (horiz * Math.sin(this.heading)) / (R * Math.cos(latRad));
      this.lat += dLat / DEG;
      this.lon += dLon / DEG;
    }
    if (!this.onGround) {
      this.alt += this.vSpeed * dt;
    }
  }

  state() {
    return {
      lon: this.lon,
      lat: this.lat,
      alt: this.alt,
      headingDeg: (this.heading / DEG) % 360,
      pitchDeg: this.pitch / DEG,
      rollDeg: this.roll / DEG,
      speedKt: this.speed * 1.94384,
      vSpeedMs: this.vSpeed || 0,
      headingRad: this.heading,
      onGround: this.onGround,
      stalled: this.stalled,
      loadFactor: this.loadFactor,
      alphaDeg: (this.pitch - this.gamma) / DEG,
    };
  }
}
