(function initRhythms(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineRhythms = api;
})(typeof window !== 'undefined' ? window : globalThis, function rhythmsFactory() {
  const QUARTER_PULSE = {
    id: 'quarter-pulse',
    bpm: 72,
    beats: ['play', 'play', 'play', 'play'],
  };

  return { QUARTER_PULSE };
});
