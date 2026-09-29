# Banana Wheels

Banana Wheels is a collection of browser games and music-practice tools built with static HTML, CSS, and JavaScript.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:8000/` for the library. The development server keeps the published routes and mounts the GT game from `games/`.

| Project | Local URL | Source |
| --- | --- | --- |
| Banana Wheels GT | `http://localhost:8000/games/banana-wheels-gt/` | `games/banana-wheels-gt/` |
| Banana Wheels V2 | `http://localhost:8000/v2/` | `public/v2/` |
| SCOOT | `http://localhost:8000/scoot/` | `public/scoot/` |
| Bassline Rookie | `http://localhost:8000/bassline-rookie/` | `public/bassline-rookie/` |

`npm start` builds the static site and opens it. `npm run serve` builds it and serves it without opening a browser. Both use `dist/`, which combines `public/` with the GT game under `/games/banana-wheels-gt/`.

## Banana Wheels GT

GT is a first-person arcade lane-driving game. Steer around monkey traffic and time the spring pad near the end of the run.

- Controls: `A`/`D` or arrow keys to change lanes, `Space` to start or trigger the spring, `R` to restart.
- Page and runtime: `games/banana-wheels-gt/index.html`, `games/banana-wheels-gt/game.js`, and `games/banana-wheels-gt/styles.css`.
- The game is also available at `/games/banana-wheels-gt/` in the deployed site.

## Bassline Rookie

The beginner bass practice app includes lessons, microphone pitch detection, a tuner, and a hosted API demo. Run the demo with `npm run bassline:demo`, then open `http://localhost:8010/bassline-rookie/hosting-demo.html`. Hosting details are in [docs/BASSLINE_ROOKIE_HOSTING.md](docs/BASSLINE_ROOKIE_HOSTING.md).

## Project Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Live-reload server for the library and games |
| `npm run build` | Compose the deployable site in `dist/` |
| `npm start` | Build and serve the site, opening a browser |
| `npm run serve` | Build and serve the site |
| `npm run lint` | Lint source, public, and game JavaScript |
| `npm run format:check` | Check formatting |
| `npm test` | Run Jest tests |

Gameplay behavior is best verified in a browser; Jest currently covers shared utilities and Bassline Rookie modules. See [QUICKSTART.md](QUICKSTART.md) to get started and [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow.
