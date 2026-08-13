# Banana Wheels

Banana Wheels is a small browser game collection built with plain JavaScript, static HTML/CSS, and the Canvas API. The repo includes multiple playable prototypes and a beginner bass practice app.

## Game Library

Start the local static server with `npm run dev` or `npm run serve`, then open these live URLs:

| Game                          | Live URL                                 | Source                                                             |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| Banana Wheels GT              | `http://localhost:8000/`                 | `public/index.html`, `public/game.js`                              |
| Banana Wheels V2: Jungle Rush | `http://localhost:8000/v2/`              | `public/v2/index.html`, `public/v2/src/`                           |
| SCOOT                         | `http://localhost:8000/scoot/`           | `public/scoot/index.html`                                          |
| Bassline Rookie               | `http://localhost:8000/bassline-rookie/` | `public/bassline-rookie/index.html`, `public/bassline-rookie/src/` |

Supporting Bassline Rookie pages:

| Page            | Live URL                                                  | Notes                            |
| --------------- | --------------------------------------------------------- | -------------------------------- |
| Tuner           | `http://localhost:8000/bassline-rookie/tuner.html`        | Browser microphone tuning flow   |
| Hosted API demo | `http://localhost:8010/bassline-rookie/hosting-demo.html` | Requires `npm run bassline:demo` |

If `public/` is deployed as the website root, the production paths match the local paths: `/`, `/v2/`, `/scoot/`, and `/bassline-rookie/`.

## Banana Wheels GT

The original Banana Wheels GT prototype is a first-person banana car run: steer left and right, dodge angry monkeys and gorillas, then press `Space` at the correct moment to trigger the mini-banana spring.

- Perspective: first-person cockpit view
- Controls: `A/D` or arrow keys to steer, `Space` to start and to trigger the spring, `R` to reset
- Main runtime file: `public/game.js`
- Main page: `public/index.html`

## Bassline Rookie

`public/bassline-rookie` is a beginner bass practice app with lessons, microphone pitch detection, a tuner, and a hosted API demo.

Run the hosted API demo locally:

```bash
npm run bassline:demo
```

Then open:

```text
http://localhost:8010/bassline-rookie/hosting-demo.html
```

Hosting instructions live in `docs/BASSLINE_ROOKIE_HOSTING.md`.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the game locally:

```bash
npm run dev
```

3. Open `http://localhost:8000` if your browser does not open automatically.

## Repo Workflow

The playable game lives in `public/`, not `src/`.

- Edit `public/game.js` for gameplay and rendering changes.
- Edit `public/index.html` for UI copy and layout.
- Edit `public/styles.css` for page styling.
- Use `src/` for reusable examples or utility code if you split the runtime later.

## Scripts

```bash
npm run dev          # Live reload dev server on port 8000
npm run bassline:demo # Local Bassline Rookie hosted API demo on port 8010
npm start            # Static server on port 8000 and open browser
npm run serve        # Static server only
npm run lint         # Lint src/ and public/ JavaScript
npm run lint:fix     # Lint with auto-fixes
npm run format       # Format JS, HTML, CSS, JSON, and Markdown
npm run format:check # Check formatting
npm test             # Run Jest tests
npm run build        # Placeholder build verification
```

## Development Notes

- The current game is a canvas-only prototype with hand-drawn shapes and generated 8-bit style sound via Web Audio.
- Fullscreen support is handled in `public/game.js`.
- The tests currently cover utility code in `tests/`; gameplay behavior is best verified in the browser.

## Release Checklist

Before pushing gameplay changes:

```bash
npm run lint:fix
npm run format
npm test
```

## Project Structure

```text
banana-wheels/
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── game.js
│   └── assets/
├── src/
├── tests/
├── README.md
├── QUICKSTART.md
├── CONTRIBUTING.md
└── package.json
```

See `QUICKSTART.md` for a shorter setup guide and `CONTRIBUTING.md` for the expected workflow.
