/**
 * 简化飞行模型（纯数学，不依赖渲染库）。
 * 状态单位：lon/lat 度，alt 米，heading/pitch/roll 弧度，speed m/s。
 * heading: 0=北，顺时针（与航空磁航向一致）。
 */
const DEG = Math.PI / 180;
const R = 6378137; // 地球半径(米)

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
    this.speed = 0;
    this.throttle = 0;
    this.onGround = true;
  }

  update(dt) {
    const i = this.input;
    const maxSpeed = 110; // m/s ≈ 214 节
    const rotateSpeed = 60; // 抬轮速度 ≈ 117 节

    // 油门 -> 目标速度
    this.throttle = clamp(this.throttle + i.throttleDelta * dt * 0.5, 0, 1);
    const targetSpeed = this.throttle * maxSpeed;
    this.speed += (targetSpeed - this.speed) * clamp(dt * 0.35, 0, 1);
    this.speed = clamp(this.speed, 0, maxSpeed);

    // 操控权随速度上升
    const authority = clamp(this.speed / rotateSpeed, 0, 1);
    this.pitch += i.pitch * dt * 0.6 * authority;
    this.roll += i.roll * dt * 1.2 * authority;
    this.heading += Math.sin(this.roll) * dt * 0.6 * authority; // 协调转弯
    this.heading += i.yaw * dt * 0.5 * authority;
    this.heading = (this.heading + Math.PI * 2) % (Math.PI * 2);

    // 松杆趋稳
    if (i.roll === 0) this.roll *= 1 - Math.min(dt * 1.5, 1);
    if (i.pitch === 0 && !this.onGround) this.pitch *= 1 - Math.min(dt * 0.4, 1);

    this.pitch = clamp(this.pitch, -30 * DEG, 35 * DEG);
    this.roll = clamp(this.roll, -45 * DEG, 45 * DEG); // 典型客机坡度上限

    // 地面逻辑
    if (this.onGround) {
      this.pitch = Math.max(this.pitch, 0);
      this.roll = 0;
      if (this.speed >= rotateSpeed && this.pitch > 2 * DEG) this.onGround = false;
    }

    // 垂直速度
    let vSpeed = 0;
    if (!this.onGround) {
      const lift = Math.sin(this.pitch) * this.speed;
      const sink = (1 - clamp(this.speed / rotateSpeed, 0, 1)) * 8; // 失速下沉
      vSpeed = lift - sink;
    }

    // 水平位移（沿大圆近似）
    const horiz = this.speed * Math.cos(this.pitch) * dt;
    if (horiz > 0.0001) {
      const latRad = this.lat * DEG;
      const dLat = (horiz * Math.cos(this.heading)) / R;
      const dLon = (horiz * Math.sin(this.heading)) / (R * Math.cos(latRad));
      this.lat += dLat / DEG;
      this.lon += dLon / DEG;
    }

    // 高度
    this.alt += vSpeed * dt;
    const ground = this.fieldElevation + 3;
    if (this.alt <= ground) {
      this.alt = ground;
      if (!this.onGround && this.speed < rotateSpeed + 5) {
        this.onGround = true;
        this.pitch = 0;
      }
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
      onGround: this.onGround,
    };
  }
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
