const {
  OPEN_STRINGS,
  frequencyForFret,
  getOpenStringIds,
  isCorrectString,
  noteFromFrequency,
  noteNameForFret,
} = require('../../public/bassline-rookie/src/data/notes');

describe('Bassline Rookie notes', () => {
  test('defines standard bass open strings from low to high', () => {
    expect(getOpenStringIds()).toEqual(['E', 'A', 'D', 'G']);
    expect(OPEN_STRINGS.map((string) => string.frequency)).toEqual([41.2, 55.0, 73.42, 98.0]);
  });

  test('maps frets to note names', () => {
    expect(noteNameForFret('E', 0)).toBe('E');
    expect(noteNameForFret('E', 1)).toBe('F');
    expect(noteNameForFret('E', 3)).toBe('G');
    expect(noteNameForFret('A', 2)).toBe('B');
    expect(noteNameForFret('A', 3)).toBe('C');
  });

  test('calculates fret frequencies by semitone ratio', () => {
    expect(frequencyForFret('A', 12)).toBe(110);
    expect(frequencyForFret('G', 0)).toBe(98);
  });

  test('validates selected string answers', () => {
    expect(isCorrectString('E', 'E')).toBe(true);
    expect(isCorrectString('E', 'A')).toBe(false);
  });

  test('names detected microphone frequencies', () => {
    expect(noteFromFrequency(73.42)).toMatchObject({ name: 'D', octave: 2, label: 'D2' });
    expect(noteFromFrequency(82.41)).toMatchObject({ name: 'E', octave: 2, label: 'E2' });
  });
});
