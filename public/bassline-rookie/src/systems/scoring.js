(function initScoring(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineScoring = api;
})(typeof window !== 'undefined' ? window : globalThis, function scoringFactory() {
  function accuracy(correct, attempts) {
    if (attempts <= 0) return 0;
    return correct / attempts;
  }

  function percent(correct, attempts) {
    return Math.round(accuracy(correct, attempts) * 100);
  }

  function boundedScore(value) {
    return Math.max(0, Math.min(100, value));
  }

  return { accuracy, boundedScore, percent };
});
