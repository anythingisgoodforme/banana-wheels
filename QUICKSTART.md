# Quick Start

## Start the site

Follow [Mac setup](docs/MAC_SETUP.md) for Node 24 and npm, then run these commands from the repository root:

```bash
npm ci
npm run dev
```

Open `http://localhost:8000/`. The library links to GT, V2, SCOOT, and Bassline Rookie.

## Work on Banana Wheels GT

The GT source is in `games/banana-wheels-gt/`:

- `index.html`: page structure and controls
- `game.js`: gameplay, rendering, and audio
- `styles.css`: game page styling

Controls: `A`/`D` or arrow keys change lanes, `Space` starts or triggers the spring, and `R` restarts.

## Check your changes

```bash
npm run lint
npm run format:check
npm test
```

Use `npm run build` to compose the static site in `dist/`. `npm start` builds and serves it; `npm run serve` does the same without opening a browser.

## Make your own game

Copy [the new-game prompt](docs/NEW_GAME_PROMPT.md) and replace the idea with one sentence.
