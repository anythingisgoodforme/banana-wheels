export class AudioEngine {
  constructor(save) {
    this.save = save;
    this.ctx = null;
  }

  ensure() {
    if (this.save.options.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  tone(frequency, duration = 0.08, type = 'square', gain = 0.04, slideTo = null) {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const volume = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, now + duration);
    volume.gain.setValueAtTime(gain, now);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(volume);
    volume.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  pickup() {
    this.tone(680, 0.06, 'triangle', 0.035, 880);
  }

  boost() {
    this.tone(220, 0.18, 'sawtooth', 0.045, 420);
  }

  crash() {
    this.tone(130, 0.2, 'square', 0.05, 70);
  }

  combo() {
    this.tone(920, 0.08, 'triangle', 0.035, 1240);
  }
}
