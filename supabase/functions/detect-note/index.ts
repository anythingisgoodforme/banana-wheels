const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

const bassStrings = [
  { stringId: 'E', note: 'E', octave: 1, frequency: 41.2 },
  { stringId: 'A', note: 'A', octave: 1, frequency: 55.0 },
  { stringId: 'D', note: 'D', octave: 2, frequency: 73.42 },
  { stringId: 'G', note: 'G', octave: 2, frequency: 98.0 },
];
const noteSequence = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modeTolerances = { identify: 45, lesson: 45, tuner: 10 };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return json({ ok: false, message: 'Use POST' }, 405);

  const payload = await request.json().catch(() => null);
  const result = analyzeFrequencyRequest(payload || {});
  return json(result, result.status);
});

function analyzeFrequencyRequest(payload: Record<string, unknown>) {
  const frequency = Number(payload.frequency);
  const mode = normalizeMode(payload.mode);
  const target = normalizeTarget(payload.target);

  if (!Number.isFinite(frequency) || frequency <= 0) {
    return { ok: false, status: 400, message: 'frequency must be a positive number' };
  }

  if (frequency < 31 || frequency > 330) {
    return { ok: false, status: 422, message: 'frequency is outside the beginner bass range' };
  }

  const detected = noteFromFrequency(frequency);
  const nearestBassString = nearestBassStringForFrequency(frequency);
  const comparisonTarget = target || {
    stringId: nearestBassString.stringId,
    fret: 0,
    note: nearestBassString.note,
    frequency: nearestBassString.frequency,
  };
  const comparison = compareFrequencyToTarget(
    frequency,
    comparisonTarget.frequency,
    modeTolerances[mode]
  );
  const matchesTarget = target
    ? targetMatches(detected, frequency, target, comparison, mode)
    : mode === 'tuner'
      ? comparison.inTune
      : false;

  return {
    ok: true,
    status: 200,
    mode,
    detected: { note: detected.note, octave: detected.octave, label: detected.label, frequency },
    nearestBassString,
    target: comparisonTarget,
    centsOff: comparison.centsOff,
    direction: comparison.direction,
    inTune: comparison.inTune,
    matchesTarget,
    message: buildMessage(detected, frequency, target, comparison, matchesTarget, mode),
  };
}

function noteFromFrequency(frequency: number) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const note = noteSequence[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { midi, note, octave, label: `${note}${octave}` };
}

function nearestBassStringForFrequency(frequency: number) {
  return bassStrings.reduce((nearest, string) => {
    const nearestDistance = Math.abs(centsBetween(frequency, nearest.frequency));
    const stringDistance = Math.abs(centsBetween(frequency, string.frequency));
    return stringDistance < nearestDistance ? string : nearest;
  });
}

function compareFrequencyToTarget(
  frequency: number,
  targetFrequency: number,
  toleranceCents: number
) {
  const centsOff = centsBetween(frequency, targetFrequency);
  return {
    centsOff,
    direction: Math.abs(centsOff) <= 1 ? 'in-tune' : centsOff > 0 ? 'sharp' : 'flat',
    inTune: Math.abs(centsOff) <= toleranceCents,
  };
}

function centsBetween(frequency: number, targetFrequency: number) {
  return Math.round(1200 * Math.log2(frequency / targetFrequency));
}

function normalizeMode(mode: unknown): 'identify' | 'lesson' | 'tuner' {
  return mode === 'lesson' || mode === 'tuner' ? mode : 'identify';
}

function normalizeTarget(target: unknown) {
  if (!target || typeof target !== 'object') return null;
  const value = target as Record<string, unknown>;
  const frequency = Number(value.frequency);
  if (!Number.isFinite(frequency) || frequency <= 0) return null;

  return {
    stringId: typeof value.stringId === 'string' ? value.stringId : null,
    fret: Number.isInteger(value.fret) ? value.fret : null,
    note: typeof value.note === 'string' ? value.note : noteFromFrequency(frequency).note,
    frequency,
  };
}

function targetMatches(
  detected: { note: string },
  frequency: number,
  target: { note: string; frequency: number },
  comparison: { inTune: boolean },
  mode: 'identify' | 'lesson' | 'tuner'
) {
  if (mode === 'tuner') return detected.note === target.note && comparison.inTune;
  return (
    detected.note === target.note &&
    Math.abs(centsBetween(frequency, target.frequency)) <= 700 &&
    comparison.inTune
  );
}

function buildMessage(
  detected: { label: string },
  frequency: number,
  target: { note: string } | null,
  comparison: { centsOff: number; direction: string },
  matchesTarget: boolean,
  mode: string
) {
  const heard = `Heard ${detected.label} (${Math.round(frequency)} Hz, ${formatCents(comparison.centsOff)}).`;
  if (!target) return `${heard} No note target is active right now.`;
  if (matchesTarget) return `${heard} That matches the target.`;
  if (mode === 'tuner')
    return `${heard} Tune ${comparison.direction === 'sharp' ? 'down' : 'up'} toward ${target.note}.`;
  return `${heard} Target is ${target.note}.`;
}

function formatCents(cents: number) {
  if (Math.abs(cents) <= 1) return 'in tune';
  return cents > 0 ? `${cents} cents sharp` : `${Math.abs(cents)} cents flat`;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
