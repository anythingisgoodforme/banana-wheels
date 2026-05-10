(function initFeedback(root, factory) {
  const api = factory();
  root.BasslineFeedback = api;
})(typeof window !== 'undefined' ? window : globalThis, function feedbackFactory() {
  function setFeedback(element, message, tone = 'neutral') {
    element.textContent = message;
    element.dataset.tone = tone;
  }

  return { setFeedback };
});
