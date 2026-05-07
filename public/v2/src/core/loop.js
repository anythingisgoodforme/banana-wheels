export class Loop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.accumulator = 0;
    this.lastTime = 0;
    this.fixedStep = 1 / 60;
    this.raf = null;
  }

  start() {
    const tick = (time) => {
      const seconds = Math.min(0.08, (time - this.lastTime) / 1000 || 0);
      this.lastTime = time;
      this.accumulator += seconds;
      while (this.accumulator >= this.fixedStep) {
        this.update(this.fixedStep);
        this.accumulator -= this.fixedStep;
      }
      this.render(this.accumulator / this.fixedStep);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}
