const { measureRms } = require('../../public/bassline-rookie/src/core/microphone');

describe('Bassline Rookie raw mic level', () => {
  test('returns zero for silence', () => {
    expect(measureRms(new Float32Array(128))).toBe(0);
  });

  test('measures signal energy for a waveform', () => {
    const buffer = new Float32Array([1, -1, 1, -1]);
    expect(measureRms(buffer)).toBe(1);
  });
});
