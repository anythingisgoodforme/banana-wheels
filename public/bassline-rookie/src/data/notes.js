(function initNotes(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineNotes = api;
})(typeof window !== 'undefined' ? window : globalThis, function notesFactory() {
  const OPEN_STRINGS = [
    { id: 'E', name: 'E', label: 'E string', octave: 1, frequency: 41.2, order: 0 },
    { id: 'A', name: 'A', label: 'A string', octave: 1, frequency: 55.0, order: 1 },
    { id: 'D', name: 'D', label: 'D string', octave: 2, frequency: 73.42, order: 2 },
    { id: 'G', name: 'G', label: 'G string', octave: 2, frequency: 98.0, order: 3 },
  ];

  const NOTE_SEQUENCE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  function getOpenString(id) {
    return OPEN_STRINGS.find((string) => string.id === id) || null;
  }

  function getOpenStringIds() {
    return OPEN_STRINGS.map((string) => string.id);
  }

  function frequencyForFret(stringId, fret) {
    const string = getOpenString(stringId);
    if (!string || fret < 0) return null;
    return Number((string.frequency * Math.pow(2, fret / 12)).toFixed(2));
  }

  function noteNameForFret(stringId, fret) {
    const string = getOpenString(stringId);
    if (!string || fret < 0) return null;
    const openIndex = NOTE_SEQUENCE.indexOf(string.name);
    return NOTE_SEQUENCE[(openIndex + fret) % NOTE_SEQUENCE.length];
  }

  function isCorrectString(targetId, selectedId) {
    return targetId === selectedId;
  }

  function noteFromFrequency(frequency) {
    if (!Number.isFinite(frequency) || frequency <= 0) return null;
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    const name = NOTE_SEQUENCE[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
      midi,
      name,
      octave,
      label: `${name}${octave}`,
    };
  }

  function centsOff(frequency, midi) {
    if (!Number.isFinite(frequency) || !Number.isFinite(midi)) return null;
    const targetFrequency = 440 * Math.pow(2, (midi - 69) / 12);
    return Math.round(1200 * Math.log2(frequency / targetFrequency));
  }

  return {
    OPEN_STRINGS,
    NOTE_SEQUENCE,
    centsOff,
    frequencyForFret,
    getOpenString,
    getOpenStringIds,
    isCorrectString,
    noteFromFrequency,
    noteNameForFret,
  };
});
