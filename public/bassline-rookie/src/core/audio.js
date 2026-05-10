(function initAudio(root, factory) {
  const api = factory();
  root.BasslineAudio = api;
})(typeof window !== 'undefined' ? window : globalThis, function audioFactory() {
  class BassAudio {
    constructor() {
      this.ctx = null;
    }

    ensure() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }

      if (this.ctx?.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playNote(frequency, duration = 0.42) {
      this.ensure();
      if (!this.ctx || !frequency) return;

      const now = this.ctx.currentTime;
      const oscillator = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(540, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    }

    click(success = true) {
      this.playNote(success ? 196 : 73.42, success ? 0.12 : 0.2);
    }
  }

  return { BassAudio };
});
