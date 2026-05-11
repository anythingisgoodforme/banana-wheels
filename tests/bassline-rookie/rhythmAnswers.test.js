const {
  isPulseAnswerCorrect,
  isTimedPulseTarget,
  pulseTimingMessage,
} = require('../../public/bassline-rookie/src/systems/rhythmAnswers');

describe('Bassline Rookie rhythm answers', () => {
  const beatFourTarget = {
    label: 'Beat 4',
    answer: 'Play',
    beatIndex: 3,
  };

  test('requires Pulse answers to happen on the target beat', () => {
    expect(isTimedPulseTarget(beatFourTarget)).toBe(true);
    expect(isPulseAnswerCorrect(beatFourTarget, 'Play', 3)).toBe(true);
    expect(isPulseAnswerCorrect(beatFourTarget, 'Play', 1)).toBe(false);
    expect(isPulseAnswerCorrect(beatFourTarget, 'Wait', 3)).toBe(false);
  });

  test('explains early or late Pulse answers', () => {
    expect(pulseTimingMessage(beatFourTarget, 1)).toBe(
      'Target was beat 4, but you answered on beat 2.'
    );
    expect(pulseTimingMessage(beatFourTarget, 3)).toBe('Right on beat 4.');
  });
});
