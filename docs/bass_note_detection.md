# Bassline Rookie Hosted Note Detection Spec

## Purpose

Bassline Rookie should become a hosted beginner bass practice app that can be shared with friends. The app should keep the current lesson-first experience, but move toward a Supabase-backed deployment with a simple API for note detection and practice state.

This is not a generic tuner app. It is a real-bass input layer for Bassline Rookie lessons:

- Listen to a bass note.
- Detect or receive the detected frequency.
- Compare it to the active lesson target.
- Return simple beginner-friendly feedback.
- Optionally save practice attempts and progress.

## Product Context

Current app files:

- `public/bassline-rookie/index.html`: lesson app.
- `public/bassline-rookie/tuner.html`: tuning flow.
- `public/bassline-rookie/src/core/microphone.js`: browser microphone capture and pitch detection.
- `public/bassline-rookie/src/data/notes.js`: open string frequencies, fret frequencies, note naming, cents math.
- `public/bassline-rookie/src/main.js`: lesson state and mic feedback.

The app currently runs as static browser files. The hosted version should keep the frontend simple, but add Supabase for:

- Public hosting or deployable static frontend.
- Edge Function APIs.
- Optional practice progress sync.
- Optional shared class/friend sessions later.

## Recommended Direction

Use a hybrid approach first:

1. Browser captures microphone audio.
2. Browser estimates pitch with Web Audio/autocorrelation.
3. Browser sends `{ frequency, lessonTarget }` to a Supabase Edge Function.
4. Edge Function maps the frequency to the nearest bass note and returns feedback.
5. Frontend displays the feedback and updates lesson progress.

This avoids uploading raw microphone audio while still giving the app a simple server API that can be hosted, versioned, tested, and extended.

## Bass Notes

Standard four-string bass tuning:

| String | Note | Frequency |
| ------ | ---- | --------: |
| E      | E1   |  41.20 Hz |
| A      | A1   |  55.00 Hz |
| D      | D2   |  73.42 Hz |
| G      | G2   |  98.00 Hz |

Beginner lesson range should include open strings and early frets, roughly 31 Hz to 330 Hz.

## API Contract

### Endpoint

```text
POST /functions/v1/detect-note
```

### Request

```json
{
  "frequency": 55.4,
  "target": {
    "stringId": "A",
    "fret": 0,
    "note": "A",
    "frequency": 55.0
  },
  "mode": "lesson"
}
```

### Minimal Request

```json
{
  "frequency": 55.4
}
```

### Response

```json
{
  "detected": {
    "note": "A",
    "octave": 1,
    "label": "A1",
    "frequency": 55.4
  },
  "nearestBassString": {
    "stringId": "A",
    "note": "A",
    "frequency": 55.0
  },
  "target": {
    "note": "A",
    "frequency": 55.0
  },
  "centsOff": 13,
  "direction": "sharp",
  "inTune": false,
  "matchesTarget": true,
  "message": "Heard A1. That matches the target."
}
```

### Modes

`mode: "lesson"`:

- Forgiving target match.
- Accept same note name within lesson tolerance.
- Recommended tolerance: `45 cents`.
- Beginner wording.

`mode: "tuner"`:

- Strict tuning comparison.
- Compare against exact open string target frequency.
- Recommended tolerance: `10 cents`.
- Return flat/sharp/in-tune meter values.

`mode: "identify"`:

- No target required.
- Return detected note and nearest bass string.
- Useful when no lesson target is active.

## Server Version 1: Frequency API

This is the recommended first hosted version.

### Architecture

```text
Browser
  -> getUserMedia
  -> Web Audio pitch detection
  -> POST frequency to Supabase Edge Function
  -> receive note/target result
  -> update lesson UI
```

### Supabase Edge Function

Function: `detect-note`

Responsibilities:

- Validate request body.
- Reject invalid or out-of-range frequencies.
- Convert frequency to MIDI note.
- Calculate detected note label.
- Compare to optional target.
- Return `centsOff`, `direction`, `inTune`, `matchesTarget`, and `message`.

### Pros

- Fast to build from the current app.
- Keeps raw microphone audio private in the browser.
- Works well on a hosted public URL.
- Simple API for future clients.
- Easy to test.

### Cons

- Pitch detection still depends on browser/device microphone quality.
- The server trusts the frequency reported by the client.

### Best Use

Use for the first hosted shareable version.

## Server Version 2: Raw Audio Analysis API

This version sends a short audio sample to the server for analysis.

### Architecture

```text
Browser
  -> getUserMedia
  -> record short mono sample
  -> POST audio buffer/base64 to Supabase Edge Function
  -> server runs pitch detection
  -> return note/target result
```

### Endpoint

```text
POST /functions/v1/analyze-audio-note
```

### Request Shape

```json
{
  "sampleRate": 44100,
  "samplesBase64": "base64-encoded-float32-or-pcm16",
  "target": {
    "stringId": "E",
    "fret": 3,
    "note": "G",
    "frequency": 49.0
  },
  "mode": "lesson"
}
```

### Pros

- Server owns pitch detection.
- Easier to keep behavior consistent across browsers.
- Better API boundary for non-browser clients later.

### Cons

- More latency.
- More bandwidth.
- More privacy sensitivity because microphone audio leaves the device.
- More complicated Edge Function implementation.
- Supabase Edge Functions may not be ideal for heavy DSP.

### Best Use

Use only if client-side pitch detection proves too inconsistent.

## Server Version 3: Practice Session API

This version keeps frequency detection lightweight but adds hosted practice state.

### Architecture

```text
Browser
  -> detect frequency locally
  -> POST note event to Supabase
  -> server validates result
  -> save attempt/progress
  -> return feedback and updated stats
```

### Endpoints

```text
POST /functions/v1/detect-note
POST /functions/v1/record-practice-attempt
GET  /functions/v1/practice-profile
```

### `record-practice-attempt` Request

```json
{
  "playerId": "anonymous-or-auth-user-id",
  "lessonId": "open-strings",
  "target": {
    "stringId": "A",
    "fret": 0,
    "note": "A",
    "frequency": 55.0
  },
  "detected": {
    "note": "A",
    "frequency": 55.4,
    "centsOff": 13
  },
  "correct": true,
  "createdAt": "2026-05-13T12:00:00.000Z"
}
```

### Pros

- Makes the hosted app feel real and shareable.
- Allows progress across devices.
- Enables friend/class features later.
- Keeps audio local while storing useful learning data.

### Cons

- Requires auth or anonymous player IDs.
- Adds database schema and privacy decisions.
- More moving parts than the first hosted version.

### Best Use

Use after Version 1 works reliably.

## Supabase Database Sketch

Start optional. Local storage can remain the first progress store.

### `practice_attempts`

```sql
create table practice_attempts (
  id uuid primary key default gen_random_uuid(),
  player_id text,
  lesson_id text not null,
  target_note text,
  target_frequency numeric,
  detected_note text,
  detected_frequency numeric,
  cents_off integer,
  correct boolean not null,
  created_at timestamptz not null default now()
);
```

### `lesson_progress`

```sql
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  lesson_id text not null,
  attempts integer not null default 0,
  best_streak integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(player_id, lesson_id)
);
```

## Edge Function Detection Logic

Shared TypeScript logic for the Edge Function:

```ts
const BASS_STRINGS = [
  { stringId: 'E', note: 'E', octave: 1, frequency: 41.2 },
  { stringId: 'A', note: 'A', octave: 1, frequency: 55.0 },
  { stringId: 'D', note: 'D', octave: 2, frequency: 73.42 },
  { stringId: 'G', note: 'G', octave: 2, frequency: 98.0 },
];

const NOTE_SEQUENCE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteFromFrequency(frequency: number) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const note = NOTE_SEQUENCE[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { midi, note, octave, label: `${note}${octave}` };
}

function centsBetween(frequency: number, targetFrequency: number) {
  return Math.round(1200 * Math.log2(frequency / targetFrequency));
}

function directionFor(cents: number) {
  if (Math.abs(cents) <= 1) return 'in-tune';
  return cents > 0 ? 'sharp' : 'flat';
}
```

Target comparison:

```ts
function compareToTarget(frequency: number, targetFrequency: number, tolerance: number) {
  const centsOff = centsBetween(frequency, targetFrequency);
  return {
    centsOff,
    direction: directionFor(centsOff),
    inTune: Math.abs(centsOff) <= tolerance,
  };
}
```

## Frontend Integration

### Main Lesson App

Keep `MicrophonePitch` as the browser pitch source for Version 1.

When it emits a stable frequency:

1. Build the current lesson target from `recognitionTarget`, `fretTarget`, or `guidedTarget`.
2. Send frequency and target to `/functions/v1/detect-note`.
3. Display the returned `message`.
4. If `matchesTarget` is true, answer the current lesson prompt.
5. Throttle answers so one ringing note cannot complete several targets.

### Tuner Page

Upgrade `tuner.html` from reference-tone only to server-backed tuning:

1. Current string target is E, A, D, or G.
2. Browser detects frequency.
3. Frontend calls `detect-note` with `mode: "tuner"`.
4. UI shows:
   - Detected note.
   - Cents off.
   - Flat/sharp/in-tune state.
   - A simple meter.
5. User manually continues to the next string.

## Hosting Plan

Recommended simple deployment:

1. Keep frontend in `public/bassline-rookie`.
2. Deploy static frontend to Supabase hosting-compatible static deployment, Netlify, Vercel, or GitHub Pages.
3. Create Supabase project for Edge Functions and optional database.
4. Configure frontend with:

```js
const SUPABASE_FUNCTIONS_URL = 'https://PROJECT_REF.functions.supabase.co';
```

5. Use public anon key only if the frontend later calls Supabase client APIs directly.
6. Keep the note detection endpoint CORS-enabled for the hosted frontend origin.

## CORS

The Edge Function must accept requests from the hosted app URL.

Development can allow:

```text
http://localhost:*
http://127.0.0.1:*
```

Production should allow only the deployed app origins.

## Privacy

Version 1 sends only numbers, not microphone audio.

Request example:

```json
{ "frequency": 55.4, "mode": "lesson" }
```

Version 2 sends audio and should require stronger privacy copy before use. Do not make raw audio upload the default for a child-focused learning app.

## Tests

### Frontend Tests

Preserve current tests:

- `tests/bassline-rookie/microphone.test.js`
- `tests/bassline-rookie/notes.test.js`

Add tests for:

- Building API payloads from active lesson targets.
- Handling API success, wrong note, and network failure.
- Preventing repeated auto-answer from one sustained note.

### Edge Function Tests

Add tests for:

- Frequency `41.2` returns `E1`.
- Frequency `55.0` returns `A1`.
- Frequency `73.42` returns `D2`.
- Frequency `98.0` returns `G2`.
- Tuner mode accepts within `10 cents`.
- Lesson mode accepts within `45 cents`.
- Wrong note returns `matchesTarget: false`.
- Invalid frequency returns `400`.

## Implementation Order

1. Add Supabase Edge Function `detect-note`.
2. Copy or port shared note math from `notes.js` into the Edge Function.
3. Add frontend API client wrapper, for example `src/core/noteApi.js`.
4. Update `main.js` mic handling to call the API.
5. Keep local fallback note matching for offline development or API failure.
6. Upgrade `tuner.html` and `tuner.js` to use the API.
7. Add Edge Function tests.
8. Deploy frontend and Supabase function.
9. Add optional `practice_attempts` after the detection loop works.

## Acceptance Criteria

Version 1 is ready when:

- The app is available at a public URL.
- A friend can open the app without installing anything.
- The app asks for mic access only after pressing the mic button.
- Browser pitch detection sends frequency to Supabase.
- Supabase returns detected note, cents, direction, and target match.
- Correct notes can advance lesson prompts.
- Wrong notes do not advance lesson prompts.
- The tuner page can report flat/sharp/in-tune through the API.
- If the API fails, the app gives a useful message and does not break the lesson.

## Deferred Scope

Defer until Version 1 works:

- Raw audio upload analysis.
- Accounts.
- Friend leaderboards.
- Multiplayer/class mode.
- Mobile app rewrite.
- Full React/Vite migration.
