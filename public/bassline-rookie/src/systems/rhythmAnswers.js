(function initRhythmAnswers(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineRhythmAnswers = api;
})(typeof window !== 'undefined' ? window : globalThis, function rhythmAnswersFactory() {
  function isTimedPulseTarget(target) {
    return Number.isInteger(target?.beatIndex);
  }

  function isPulseAnswerCorrect(target, selectedAnswer, activeBeat) {
    if (!isTimedPulseTarget(target)) return selectedAnswer === target?.answer;
    return selectedAnswer === target.answer && activeBeat === target.beatIndex;
  }

  function pulseTimingMessage(target, activeBeat) {
    if (!isTimedPulseTarget(target)) return '';
    const targetBeat = target.beatIndex + 1;
    const playedBeat = activeBeat + 1;

    if (targetBeat === playedBeat) {
      return `Right on beat ${targetBeat}.`;
    }

    return `Target was beat ${targetBeat}, but you answered on beat ${playedBeat}.`;
  }

  return { isPulseAnswerCorrect, isTimedPulseTarget, pulseTimingMessage };
});
