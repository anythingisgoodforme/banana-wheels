# Bassline Rookie Hosting Guide

This guide is for a 12-year-old builder with an adult helping on accounts, passwords, and deployment settings.

Goal: put Bassline Rookie online so friends can open a link, allow the microphone, and try the bass note features.

## What You Are Building

There are two parts:

1. The website: the lesson app in `public/bassline-rookie`.
2. The note API: small Supabase Functions that answer questions like "what note is 55 Hz?"

For the first hosted version, the browser listens to the bass and finds a frequency. Supabase receives only that number, not the microphone recording.

## Try It Locally First

From the project folder:

```bash
npm install
npm run bassline:demo
```

Open:

```text
http://localhost:8010/bassline-rookie/hosting-demo.html
```

Try all three buttons:

- Version 1: sends a frequency to the note API.
- Version 2: sends a short demo audio sample to the local audio API.
- Version 3: saves a local practice attempt.

This local demo acts like Supabase, but it runs only on your computer.

## Run The Tests

Before changing hosting code:

```bash
npm test
```

The important tests check note names, tuning cents, lesson tolerance, and wrong-octave rejection.

## Step 1: Make A Supabase Project

Adult help recommended.

1. Go to `https://supabase.com`.
2. Sign in.
3. Create a new project.
4. Save these values somewhere private:
   - Project URL.
   - Anon public key.
   - Project ref.

Do not commit secret service-role keys to GitHub.

## Step 2: Install Supabase CLI

Adult help recommended.

Follow Supabase's current CLI install instructions for your computer.

Check it works:

```bash
supabase --version
```

Log in:

```bash
supabase login
```

Link this folder to the Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 3: Deploy The First Function

Start with the simple frequency API:

```bash
supabase functions deploy detect-note
```

The endpoint will look like:

```text
https://YOUR_PROJECT_REF.functions.supabase.co/detect-note
```

Test it:

```bash
curl -i \
  -X POST "https://YOUR_PROJECT_REF.functions.supabase.co/detect-note" \
  -H "Content-Type: application/json" \
  -d '{"frequency":55,"target":{"note":"A","frequency":55},"mode":"tuner"}'
```

You should see JSON that says `A1`, `inTune: true`, and `matchesTarget: true`.

## Step 4: Put The Website Online

Use one of these:

- GitHub Pages: good for a simple static site.
- Netlify: easy drag-and-drop or GitHub deploy.
- Vercel: good GitHub deploys.

Deploy the `public` folder as the website root.

After deploy, your app URL might look like:

```text
https://your-name.github.io/banana-wheels/bassline-rookie/
```

or:

```text
https://bassline-rookie.netlify.app/bassline-rookie/
```

## Step 5: Point The App At Supabase

For local demos, the app calls:

```text
/functions/v1
```

For the real hosted app, set:

```js
window.BasslineConfig = {
  functionsUrl: 'https://YOUR_PROJECT_REF.functions.supabase.co',
};
```

Add that before `src/core/noteApi.js` on pages that call the API.

## Step 6: CORS

CORS means "which websites are allowed to call the API."

The demo functions currently allow all origins with:

```text
access-control-allow-origin: *
```

That is convenient while building. Before sharing widely, change it so only your real website URL can call the functions.

## The Three Server Options

### Version 1: Frequency API

File:

```text
supabase/functions/detect-note/index.ts
```

Use this first.

The browser sends:

```json
{ "frequency": 55, "mode": "lesson" }
```

Supabase returns:

```json
{
  "detected": { "label": "A1" },
  "centsOff": 0,
  "matchesTarget": true
}
```

### Version 2: Audio API

File:

```text
supabase/functions/analyze-audio-note/index.ts
```

This is a placeholder for hosted deployment because raw audio upload has privacy and latency tradeoffs. The local demo implements it so you can understand the API shape.

Use this only if browser pitch detection is not good enough.

### Version 3: Practice API

File:

```text
supabase/functions/record-practice-attempt/index.ts
```

This receives practice attempts. Later, wire it to Supabase tables so progress follows a player between devices.

## Safety Rules

- Ask an adult before creating accounts or publishing links.
- Do not publish private keys.
- Do not upload microphone audio by default.
- Use the frequency API first because it sends only a number.
- If friends test it, tell them the app needs microphone permission to hear notes.

## Demo Checklist

Before sending the link to friends:

- `npm test` passes.
- `npm run bassline:demo` works locally.
- The hosted website loads.
- `detect-note` returns `A1` for `55 Hz`.
- The tuner page can show flat/sharp/in-tune locally.
- Microphone permission only appears after pressing a mic button.
