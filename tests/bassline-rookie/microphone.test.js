const {
  StablePitchTracker,
  detectPitch,
} = require('../../public/bassline-rookie/src/core/microphone');

function synthesizeBassNote(frequency, options = {}) {
  const sampleRate = options.sampleRate || 44100;
  const duration = options.duration || 0.85;
  const fundamentalGain = options.fundamentalGain ?? 0.45;
  const secondHarmonicGain = options.secondHarmonicGain ?? 0.65;
  const thirdHarmonicGain = options.thirdHarmonicGain ?? 0.22;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(samples);

  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const attack = Math.min(1, time / 0.035);
    const decay = Math.exp(-time * 1.2);
    const envelope = attack * decay;

    buffer[index] =
      envelope *
      (fundamentalGain * Math.sin(2 * Math.PI * frequency * time) +
        secondHarmonicGain * Math.sin(2 * Math.PI * frequency * 2 * time + 0.35) +
        thirdHarmonicGain * Math.sin(2 * Math.PI * frequency * 3 * time + 0.8));
  }

  return { buffer, sampleRate };
}

function expectNearFrequency(actual, expected) {
  const cents = 1200 * Math.log2(actual / expected);
  expect(Math.abs(cents)).toBeLessThanOrEqual(18);
}

describe('Bassline Rookie microphone pitch detection', () => {
  test.each([
    ['E1', 41.2],
    ['A1', 55.0],
    ['D2', 73.42],
    ['G2', 98.0],
  ])('detects harmonic-rich bass %s without jumping to the octave', (_label, frequency) => {
    const { buffer, sampleRate } = synthesizeBassNote(frequency);
    expectNearFrequency(detectPitch(buffer, sampleRate), frequency);
  });

  test('rejects quiet input instead of guessing a note', () => {
    const { buffer, sampleRate } = synthesizeBassNote(55, {
      fundamentalGain: 0.001,
      secondHarmonicGain: 0.001,
      thirdHarmonicGain: 0.001,
    });

    expect(detectPitch(buffer, sampleRate)).toBeNull();
  });

  test('only reports a note after several stable pitch frames', () => {
    const tracker = new StablePitchTracker();

    expect(tracker.update(55.0, 0)).toBeNull();
    expect(tracker.update(55.3, 16)).toBeNull();
    expectNearFrequency(tracker.update(54.9, 32), 55.0);
    expect(tracker.update(73.42, 48)).toBeNull();
  });
});
