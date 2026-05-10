import { LANES } from '../game/constants.js';
import { clamp, lerp } from '../core/math.js';

export class Player {
  constructor(save) {
    this.save = save;
    this.reset();
  }

  reset() {
    this.laneIndex = 1;
    this.lane = LANES[this.laneIndex];
    this.x = this.lane;
    this.lean = 0;
    this.speed = 0;
    this.damage = 0;
    this.boost = 35 + this.save.upgrades.boost * 8;
    this.invulnerable = 0;
    this.airTime = 0;
  }

  shift(direction) {
    this.laneIndex = clamp(this.laneIndex + direction, 0, LANES.length - 1);
    this.lane = LANES[this.laneIndex];
  }

  update(dt, targetSpeed) {
    const accel = 7.5 + this.save.upgrades.acceleration * 1.5;
    const grip = 7.5 + this.save.upgrades.grip * 1.2;
    this.speed = lerp(this.speed, targetSpeed, clamp(dt * accel, 0, 1));
    this.x = lerp(this.x, this.lane, clamp(dt * grip, 0, 1));
    this.lean = lerp(this.lean, (this.lane - this.x) * -1.8, clamp(dt * 8, 0, 1));
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.airTime = Math.max(0, this.airTime - dt);
  }
}
