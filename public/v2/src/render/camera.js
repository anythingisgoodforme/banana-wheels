import { lerp } from '../core/math.js';

export class Camera {
  constructor() {
    this.shake = 0;
    this.look = 0;
  }

  hit() {
    this.shake = 18;
  }

  update(dt, player, reducedMotion) {
    this.look = lerp(this.look, -player.x * 30, dt * 5);
    this.shake = Math.max(0, this.shake - (reducedMotion ? 80 : 42) * dt);
  }
}
