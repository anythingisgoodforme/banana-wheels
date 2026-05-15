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

    playNote(frequency, duration = 0.9) {
      this.ensure();
      if (!this.ctx || !frequency) return;

      const now = this.ctx.currentTime;
      const oscillator = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(460, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    }

    success() {
      this.ensure();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.playNoiseHit(now, 0.055, 0.045);
      this.playBellTone(1046.5, now + 0.045, 0.16, 0.08);
      this.playBellTone(1568, now + 0.13, 0.28, 0.075);
    }

    playBellTone(frequency, startTime, duration, volume) {
      const oscillator = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.connect(gain);
      gain.connect(this.ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
    }

    playNoiseHit(startTime, duration, volume) {
      const sampleRate = this.ctx.sampleRate;
      const frameCount = Math.max(1, Math.floor(sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);

      for (let index = 0; index < frameCount; index += 1) {
        const fade = 1 - index / frameCount;
        data[index] = (Math.random() * 2 - 1) * fade;
      }

      const noise = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      noise.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4200, startTime);
      filter.Q.setValueAtTime(1.4, startTime);
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(startTime);
      noise.stop(startTime + duration);
    }

    beat(accent = false) {
      this.ensure();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.playNoiseHit(now, accent ? 0.045 : 0.03, accent ? 0.052 : 0.034);
      this.playBellTone(accent ? 523.25 : 392, now + 0.004, 0.11, accent ? 0.028 : 0.02);
    }

    songBacking({ accent = false, harmony = null } = {}) {
      this.ensure();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.playNoiseHit(now, accent ? 0.07 : 0.045, accent ? 0.07 : 0.045);
      this.playBellTone(accent ? 783.99 : 587.33, now + 0.01, 0.09, accent ? 0.026 : 0.018);

      if (!harmony) return;
      this.playHarmonyTone(harmony.frequency * 2, now + 0.035, harmony.duration || 0.34, 0.035);
      this.playHarmonyTone(harmony.frequency * 3, now + 0.035, harmony.duration || 0.34, 0.018);
    }

    playHarmonyTone(frequency, startTime, duration, volume) {
      const oscillator = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
    }

    click(success = true) {
      if (success) {
        this.success();
        return;
      }

      this.playNote(73.42, 0.2);
    }
  }

  return { BassAudio };
});
