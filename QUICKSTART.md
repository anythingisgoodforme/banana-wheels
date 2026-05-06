# Quick Start

## 1. Install Node.js

Check that Node.js and npm are available:

```bash
node --version
npm --version
```

## 2. Install dependencies

From the repo root:

```bash
npm install
```

## 3. Start the local game server

```bash
npm run dev
```

This serves the game at `http://localhost:8000`.

## 4. Edit the right files

The current playable prototype lives in `public/`.

- `public/game.js`: first-person gameplay loop, controls, drawing, sound
- `public/index.html`: HUD labels and page structure
- `public/styles.css`: page styling

## 5. Play the current build

- `A/D` or arrow keys: steer
- `Space`: start the run
- `Space` again: trigger the spring when the pad flashes
- `R`: reset the round

## 6. Validate changes

```bash
npm run lint
npm run format:check
npm test
```

## Common commands

```bash
npm run dev
npm start
npm run serve
npm run lint:fix
npm run format
npm test
```
