(function initNoteDetection(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineNoteDetection = api;
})(typeof window !== 'undefined' ? window : globalThis, function noteDetectionFactory() {
  const BASS_STRINGS = [
    { stringId: 'E', note: 'E', octave: 1, frequency: 41.2 },
    { stringId: 'A', note: 'A', octave: 1, frequency: 55.0 },
    { stringId: 'D', note: 'D', octave: 2, frequency: 73.42 },
    { stringId: 'G', note: 'G', octave: 2, frequency: 98.0 },
  ];
  const NOTE_SEQUENCE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const MIN_SUPPORTED_FREQUENCY = 31;
  const MAX_SUPPORTED_FREQUENCY = 330;
  const MODE_TOLERANCES = {
    identify: 45,
    lesson: 45,
    tuner: 10,
  };

  function analyzeFrequencyRequest(payload = {}) {
    const frequency = Number(payload.frequency);
    const mode = normalizeMode(payload.mode);
    const target = normalizeTarget(payload.target);

    if (!Number.isFinite(frequency) || frequency <= 0) {
      return errorResult('frequency must be a positive number', 400);
    }

    if (frequency < MIN_SUPPORTED_FREQUENCY || frequency > MAX_SUPPORTED_FREQUENCY) {
      return errorResult('frequency is outside the beginner bass range', 422);
    }

    const detected = noteFromFrequency(frequency);
    const nearestBassString = nearestBassStringForFrequency(frequency);
    const comparisonTarget = target || noteTargetFromBassString(nearestBassString);
    const tolerance = MODE_TOLERANCES[mode];
    const comparison = compareFrequencyToTarget(frequency, comparisonTarget.frequency, tolerance);
    const matchesTarget = target
      ? targetMatches({ detected, frequency, target, comparison, mode })
      : mode === 'tuner'
        ? comparison.inTune
        : false;

    return {
      ok: true,
      status: 200,
      mode,
      detected: {
        note: detected.note,
        octave: detected.octave,
        label: detected.label,
        frequency,
      },
      nearestBassString,
      target: comparisonTarget,
      centsOff: comparison.centsOff,
      direction: comparison.direction,
      inTune: comparison.inTune,
      matchesTarget,
      message: buildMessage({ detected, frequency, target, comparison, matchesTarget, mode }),
    };
  }

  function noteFromFrequency(frequency) {
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    const note = NOTE_SEQUENCE[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return { midi, note, octave, label: `${note}${octave}` };
  }

  function nearestBassStringForFrequency(frequency) {
    return BASS_STRINGS.reduce((nearest, string) => {
      const nearestDistance = Math.abs(centsBetween(frequency, nearest.frequency));
      const stringDistance = Math.abs(centsBetween(frequency, string.frequency));
      return stringDistance < nearestDistance ? string : nearest;
    });
  }

  function compareFrequencyToTarget(frequency, targetFrequency, toleranceCents = 10) {
    const centsOff = centsBetween(frequency, targetFrequency);
    return {
      centsOff,
      direction: directionForCents(centsOff),
      inTune: Math.abs(centsOff) <= toleranceCents,
    };
  }

  function centsBetween(frequency, targetFrequency) {
    return Math.round(1200 * Math.log2(frequency / targetFrequency));
  }

  function directionForCents(cents) {
    if (Math.abs(cents) <= 1) return 'in-tune';
    return cents > 0 ? 'sharp' : 'flat';
  }

  function normalizeMode(mode) {
    return Object.prototype.hasOwnProperty.call(MODE_TOLERANCES, mode) ? mode : 'identify';
  }

  function normalizeTarget(target) {
    if (!target || typeof target !== 'object') return null;
    const frequency = Number(target.frequency);
    if (!Number.isFinite(frequency) || frequency <= 0) return null;

    return {
      stringId: target.stringId || null,
      fret: Number.isInteger(target.fret) ? target.fret : null,
      note: target.note || noteFromFrequency(frequency).note,
      frequency,
    };
  }

  function noteTargetFromBassString(string) {
    return {
      stringId: string.stringId,
      fret: 0,
      note: string.note,
      frequency: string.frequency,
    };
  }

  function targetMatches({ detected, frequency, target, comparison, mode }) {
    if (mode === 'tuner') {
      return detected.note === target.note && comparison.inTune;
    }

    const plausibleRange = Math.abs(centsBetween(frequency, target.frequency)) <= 700;
    return detected.note === target.note && plausibleRange && comparison.inTune;
  }

  function buildMessage({ detected, frequency, target, comparison, matchesTarget, mode }) {
    const heard = `Heard ${detected.label} (${Math.round(frequency)} Hz, ${formatCents(comparison.centsOff)}).`;
    if (!target) return `${heard} No note target is active right now.`;
    if (matchesTarget) return `${heard} That matches the target.`;
    if (mode === 'tuner')
      return `${heard} Tune ${comparison.direction === 'sharp' ? 'down' : 'up'} toward ${target.note}.`;
    return `${heard} Target is ${target.note}.`;
  }

  function formatCents(cents) {
    if (Math.abs(cents) <= 1) return 'in tune';
    return cents > 0 ? `${cents} cents sharp` : `${Math.abs(cents)} cents flat`;
  }

  function errorResult(message, status) {
    return {
      ok: false,
      status,
      error: message,
      message,
    };
  }

  return {
    BASS_STRINGS,
    MAX_SUPPORTED_FREQUENCY,
    MIN_SUPPORTED_FREQUENCY,
    analyzeFrequencyRequest,
    centsBetween,
    compareFrequencyToTarget,
    nearestBassStringForFrequency,
    noteFromFrequency,
  };
});
