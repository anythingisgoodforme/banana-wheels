const {
  analyzeFrequencyRequest,
  compareFrequencyToTarget,
  nearestBassStringForFrequency,
  noteFromFrequency,
} = require('../../public/bassline-rookie/src/core/noteDetection');

function frequencyAtCents(target, cents) {
  return target * Math.pow(2, cents / 1200);
}

describe('Bassline Rookie hosted note detection math', () => {
  test.each([
    [41.2, { note: 'E', octave: 1, label: 'E1' }],
    [55.0, { note: 'A', octave: 1, label: 'A1' }],
    [73.42, { note: 'D', octave: 2, label: 'D2' }],
    [98.0, { note: 'G', octave: 2, label: 'G2' }],
  ])('maps %s Hz to %j', (frequency, expected) => {
    expect(noteFromFrequency(frequency)).toMatchObject(expected);
  });

  test('finds nearest bass string by cents distance', () => {
    expect(nearestBassStringForFrequency(54.7)).toMatchObject({ stringId: 'A' });
    expect(nearestBassStringForFrequency(100)).toMatchObject({ stringId: 'G' });
  });

  test.each([[0], [-55], [Number.NaN], [30.9], [330.1]])(
    'rejects invalid or unsupported frequency %s',
    (frequency) => {
      expect(analyzeFrequencyRequest({ frequency })).toMatchObject({ ok: false });
    }
  );

  test.each([
    [44, true],
    [45, true],
    [46, false],
    [-44, true],
    [-45, true],
    [-46, false],
  ])('lesson mode target comparison at %s cents returns %s', (cents, matchesTarget) => {
    const target = { stringId: 'A', fret: 0, note: 'A', frequency: 55 };
    const result = analyzeFrequencyRequest({
      frequency: frequencyAtCents(target.frequency, cents),
      target,
      mode: 'lesson',
    });

    expect(result.matchesTarget).toBe(matchesTarget);
  });

  test.each([
    [9, true],
    [10, true],
    [11, false],
    [-9, true],
    [-10, true],
    [-11, false],
  ])('tuner mode target comparison at %s cents returns %s', (cents, matchesTarget) => {
    const target = { stringId: 'D', fret: 0, note: 'D', frequency: 73.42 };
    const result = analyzeFrequencyRequest({
      frequency: frequencyAtCents(target.frequency, cents),
      target,
      mode: 'tuner',
    });

    expect(result.matchesTarget).toBe(matchesTarget);
  });

  test('rejects same note name when the octave is too far from the target frequency', () => {
    const result = analyzeFrequencyRequest({
      frequency: 110,
      target: { stringId: 'A', fret: 0, note: 'A', frequency: 55 },
      mode: 'lesson',
    });

    expect(result.detected.label).toBe('A2');
    expect(result.matchesTarget).toBe(false);
  });

  test('returns flat, sharp, and in-tune directions', () => {
    expect(compareFrequencyToTarget(54, 55, 10)).toMatchObject({ direction: 'flat' });
    expect(compareFrequencyToTarget(56, 55, 10)).toMatchObject({ direction: 'sharp' });
    expect(compareFrequencyToTarget(55, 55, 10)).toMatchObject({
      direction: 'in-tune',
      inTune: true,
    });
  });
});
