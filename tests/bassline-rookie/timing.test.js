const {
  beatDurationMs,
  nearestBeatOffsetMs,
  timingWindow,
} = require('../../public/bassline-rookie/src/core/timing');

describe('Bassline Rookie timing', () => {
  test('converts bpm to beat duration', () => {
    expect(beatDurationMs(60)).toBe(1000);
    expect(beatDurationMs(120)).toBe(500);
  });

  test('rejects invalid tempos', () => {
    expect(() => beatDurationMs(0)).toThrow('bpm');
  });

  test('classifies timing hit windows', () => {
    expect(timingWindow(80)).toBe('good');
    expect(timingWindow(-180)).toBe('ok');
    expect(timingWindow(260)).toBe('miss');
  });

  test('finds the offset from the nearest beat', () => {
    expect(nearestBeatOffsetMs(1000, 2480, 60)).toBe(480);
    expect(nearestBeatOffsetMs(1000, 2520, 60)).toBe(-480);
  });
});
