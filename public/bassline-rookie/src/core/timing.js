(function initTiming(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineTiming = api;
})(typeof window !== 'undefined' ? window : globalThis, function timingFactory() {
  function beatDurationMs(bpm) {
    if (!Number.isFinite(bpm) || bpm <= 0) {
      throw new Error('bpm must be a positive number');
    }
    return 60000 / bpm;
  }

  function timingWindow(offsetMs, goodWindowMs = 120, okWindowMs = 220) {
    const distance = Math.abs(offsetMs);
    if (distance <= goodWindowMs) return 'good';
    if (distance <= okWindowMs) return 'ok';
    return 'miss';
  }

  function nearestBeatOffsetMs(startTimeMs, currentTimeMs, bpm) {
    const duration = beatDurationMs(bpm);
    const elapsed = currentTimeMs - startTimeMs;
    const nearestBeat = Math.round(elapsed / duration) * duration;
    return elapsed - nearestBeat;
  }

  return { beatDurationMs, nearestBeatOffsetMs, timingWindow };
});
