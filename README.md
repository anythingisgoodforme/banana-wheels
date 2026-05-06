# Banana Wheels

Banana Wheels is a small browser game prototype built with plain JavaScript and the Canvas API. The current version is a first-person banana car run: steer left and right, dodge angry monkeys and gorillas, then press `Space` at the correct moment to trigger the mini-banana spring.

## Current Game

- Perspective: first-person cockpit view
- Controls: `A/D` or arrow keys to steer, `Space` to start and to trigger the spring, `R` to reset
- Main runtime file: `public/game.js`
- Main page: `public/index.html`

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
