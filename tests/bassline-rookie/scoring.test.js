const { boundedScore, percent } = require('../../public/bassline-rookie/src/systems/scoring');

describe('Bassline Rookie scoring', () => {
  test('calculates raw percent accuracy', () => {
    expect(percent(4, 5)).toBe(80);
    expect(percent(0, 0)).toBe(0);
  });

  test('bounds score between zero and one hundred', () => {
    expect(boundedScore(-5)).toBe(0);
    expect(boundedScore(55)).toBe(55);
    expect(boundedScore(110)).toBe(100);
  });
});
