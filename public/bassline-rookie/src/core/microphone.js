(function initMicrophone(root, factory) {
  const api = factory();
  root.BasslineMicrophone = api;
})(typeof window !== 'undefined' ? window : globalThis, function microphoneFactory() {
  const BASS_MIN_FREQUENCY = 31;
  const BASS_MAX_FREQUENCY = 330;
  const MIN_RMS = 0.006;
  const MIN_CLARITY = 0.72;
  const STABLE_CENTS = 35;
  const STABLE_FRAME_COUNT = 3;
  const EMIT_INTERVAL_MS = 160;

  class MicrophonePitch {
    constructor({ onPitch }) {
      this.onPitch = onPitch;
      this.ctx = null;
      this.stream = null;
      this.source = null;
      this.analyser = null;
      this.buffer = null;
      this.frameId = null;
      this.lastEmitTime = 0;
      this.lastEmittedFrequency = 0;
      this.tracker = new StablePitchTracker();
    }

    async start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone listening is not supported in this browser.');
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      this.source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 32768;
      this.analyser.smoothingTimeConstant = 0;
      this.buffer = new Float32Array(this.analyser.fftSize);
      this.source.connect(this.analyser);
      this.listen();
    }

    stop() {
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
      this.stream?.getTracks().forEach((track) => track.stop());
      this.ctx?.close().catch(() => {});
      this.stream = null;
      this.ctx = null;
      this.source = null;
      this.analyser = null;
      this.tracker.reset();
    }

    listen() {
      if (!this.analyser || !this.ctx) return;
      this.analyser.getFloatTimeDomainData(this.buffer);
      const frequency = detectPitch(this.buffer, this.ctx.sampleRate);
      const now = performance.now();
      const stableFrequency = this.tracker.update(frequency, now);

      if (
        stableFrequency &&
        now - this.lastEmitTime > EMIT_INTERVAL_MS &&
        shouldEmitFrequency(stableFrequency, this.lastEmittedFrequency, now - this.lastEmitTime)
      ) {
        this.lastEmittedFrequency = stableFrequency;
        this.lastEmitTime = now;
        this.onPitch(stableFrequency);
      }

      this.frameId = requestAnimationFrame(() => this.listen());
    }
  }

  class StablePitchTracker {
    constructor() {
      this.frequency = 0;
      this.count = 0;
      this.lastSeenAt = 0;
    }

    reset() {
      this.frequency = 0;
      this.count = 0;
      this.lastSeenAt = 0;
    }

    update(frequency, now = 0) {
      if (!frequency) {
        if (now - this.lastSeenAt > 180) this.reset();
        return null;
      }

      if (!this.frequency || Math.abs(centsBetween(frequency, this.frequency)) > STABLE_CENTS) {
        this.frequency = frequency;
        this.count = 1;
        this.lastSeenAt = now;
        return null;
      }

      this.frequency = this.frequency * 0.65 + frequency * 0.35;
      this.count += 1;
      this.lastSeenAt = now;
      return this.count >= STABLE_FRAME_COUNT ? this.frequency : null;
    }
  }

  function detectPitch(buffer, sampleRate) {
    const prepared = prepareBuffer(buffer);
    if (prepared.length < sampleRate / BASS_MIN_FREQUENCY) return null;

    let rms = 0;
    for (let index = 0; index < prepared.length; index += 1) {
      rms += prepared[index] * prepared[index];
    }
    rms = Math.sqrt(rms / prepared.length);
    if (rms < MIN_RMS) return null;

    const minLag = Math.floor(sampleRate / BASS_MAX_FREQUENCY);
    const maxLag = Math.min(Math.floor(sampleRate / BASS_MIN_FREQUENCY), prepared.length - 2);
    const peaks = findCorrelationPeaks(prepared, minLag, maxLag);
    if (!peaks.length) return null;

    const bestPeak = peaks.reduce((best, peak) => (peak.clarity > best.clarity ? peak : best));
    const selectedPeak =
      peaks.find((peak) => peak.clarity >= MIN_CLARITY && peak.clarity >= bestPeak.clarity * 0.88) ||
      bestPeak;

    if (selectedPeak.clarity < MIN_CLARITY) return null;
    return Number((sampleRate / selectedPeak.lag).toFixed(2));
  }

  function prepareBuffer(buffer) {
    const threshold = 0.004;
    let start = 0;
    let end = buffer.length - 1;

    while (start < buffer.length && Math.abs(buffer[start]) < threshold) {
      start += 1;
    }

    while (end > start && Math.abs(buffer[end]) < threshold) {
      end -= 1;
    }

    const trimmed = buffer.subarray(start, end + 1);
    if (!trimmed.length) return trimmed;

    let mean = 0;
    for (let index = 0; index < trimmed.length; index += 1) {
      mean += trimmed[index];
    }
    mean /= trimmed.length;

    const prepared = new Float32Array(trimmed.length);
    const lastIndex = Math.max(1, trimmed.length - 1);
    for (let index = 0; index < trimmed.length; index += 1) {
      const windowValue = 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / lastIndex);
      prepared[index] = (trimmed[index] - mean) * windowValue;
    }

    return prepared;
  }

  function findCorrelationPeaks(buffer, minLag, maxLag) {
    const scores = new Float32Array(maxLag + 1);
    const peaks = [];

    for (let lag = minLag; lag <= maxLag; lag += 1) {
      scores[lag] = normalizedCorrelation(buffer, lag);
    }

    for (let lag = minLag + 1; lag < maxLag; lag += 1) {
      const clarity = scores[lag];
      if (clarity < MIN_CLARITY || clarity < scores[lag - 1] || clarity < scores[lag + 1]) {
        continue;
      }

      peaks.push({
        lag: refineLag(lag, scores[lag - 1], clarity, scores[lag + 1]),
        clarity,
      });
    }

    return peaks;
  }

  function normalizedCorrelation(buffer, lag) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;

    for (let index = 0; index < buffer.length - lag; index += 1) {
      const a = buffer[index];
      const b = buffer[index + lag];
      correlation += a * b;
      energyA += a * a;
      energyB += b * b;
    }

    if (!energyA || !energyB) return 0;
    return correlation / Math.sqrt(energyA * energyB);
  }

  function refineLag(lag, left, center, right) {
    const divisor = left - 2 * center + right;
    const adjustment = divisor ? (left - right) / (2 * divisor) : 0;
    return lag + adjustment;
  }

  function shouldEmitFrequency(frequency, lastFrequency, elapsedMs) {
    if (!lastFrequency) return true;
    return elapsedMs > 650 || Math.abs(centsBetween(frequency, lastFrequency)) > 18;
  }

  function centsBetween(frequency, referenceFrequency) {
    return 1200 * Math.log2(frequency / referenceFrequency);
  }

  const api = { MicrophonePitch, StablePitchTracker, detectPitch };
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  return api;
});
