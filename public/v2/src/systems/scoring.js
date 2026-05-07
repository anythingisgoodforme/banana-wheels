export class Scoring {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.bananas = 0;
    this.combo = 1;
    this.bestCombo = 1;
    this.comboTimer = 0;
  }

  update(dt, distanceGain, boosting) {
    this.score += distanceGain * (boosting ? 2.2 : 1.1) * this.combo;
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = Math.max(1, this.combo - dt * 0.8);
    this.bestCombo = Math.max(this.bestCombo, this.combo);
  }

  pickup(value) {
    this.bananas += value;
    this.score += 40 * value * this.combo;
    this.combo = Math.min(12, this.combo + 0.18 * value);
    this.comboTimer = 2.4;
  }

  nearMiss() {
    this.score += 65 * this.combo;
    this.combo = Math.min(12, this.combo + 0.28);
    this.comboTimer = 1.8;
  }

  crash() {
    this.score = Math.max(0, this.score - 180);
    this.combo = 1;
    this.comboTimer = 0;
  }
}
