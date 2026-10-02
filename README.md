# Banana Wheels

Banana Wheels is a collection of browser games and music-practice tools built with static HTML, CSS, and JavaScript.

Want to make a new game? Copy the [new-game prompt](docs/NEW_GAME_PROMPT.md)
and describe your idea in one sentence. For a new Mac, follow
[Mac setup](docs/MAC_SETUP.md). Coding assistants use [AGENTS.md](AGENTS.md)
for small shipping milestones, clear commits, PRs, and learning exercises.

## Run Locally

```bash
npm ci
npm run dev
```

Open `http://localhost:8000/` for the library. The development server keeps the published routes and mounts the GT game from `games/`.

| Project          | Local URL                                       | Source                    |
| ---------------- | ----------------------------------------------- | ------------------------- |
| Banana Wheels GT | `http://localhost:8000/games/banana-wheels-gt/` | `games/banana-wheels-gt/` |
| Banana Wheels V2 | `http://localhost:8000/v2/`                     | `public/v2/`              |
| SCOOT            | `http://localhost:8000/scoot/`                  | `public/scoot/`           |
| Bassline Rookie  | `http://localhost:8000/bassline-rookie/`        | `public/bassline-rookie/` |

`npm start` builds the static site and opens it. `npm run serve` builds it and serves it without opening a browser. Both use `dist/`, which combines `public/` with every immediate `games/` folder containing `index.html`, under `/games/<folder>/`. GitHub Pages builds and publishes this same output when `main` changes; release tags create downloadable releases without redeploying the site.

## Afterhours Garage

Restore a rusty Comet, collect 201 parts, and earn money while the tab is hidden or closed. Open `http://localhost:8000/games/afterhours-garage/` after `npm run dev`. Starting money and balance settings live in `games/afterhours-garage/model.js`; see the [game guide](games/afterhours-garage/README.md).

## Banana Wheels GT

GT is a first-person arcade lane-driving game. Steer around monkey traffic and time the spring pad near the end of the run.

- Controls: `A`/`D` or arrow keys to change lanes, `Space` to start or trigger the spring, `R` to restart.
- Page and runtime: `games/banana-wheels-gt/index.html`, `games/banana-wheels-gt/game.js`, and `games/banana-wheels-gt/styles.css`.
- The game is also available at `/games/banana-wheels-gt/` in the deployed site.

## Bassline Rookie

The beginner bass practice app includes lessons, microphone pitch detection, a tuner, and a hosted API demo. Run the demo with `npm run bassline:demo`, then open `http://localhost:8010/bassline-rookie/hosting-demo.html`. Hosting details are in [docs/BASSLINE_ROOKIE_HOSTING.md](docs/BASSLINE_ROOKIE_HOSTING.md).

## Project Commands

| Command                | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Live-reload server for the library and games |
| `npm run build`        | Compose the deployable site in `dist/`       |
| `npm start`            | Build and serve the site, opening a browser  |
| `npm run serve`        | Build and serve the site                     |
| `npm run lint`         | Lint source, public, and game JavaScript     |
| `npm run format:check` | Check formatting                             |
| `npm test`             | Run Jest tests                               |

Gameplay behavior is best verified in a browser; Jest tests GT learning utilities in `games/banana-wheels-gt/tests/` and Bassline Rookie modules in `public/bassline-rookie/tests/`. The preserved GT sample modules (`enemy.js`, `player.js`, `utils.js`) live in `games/banana-wheels-gt/src/`; they are learning material and are not imported by GT’s `game.js`. Test folders and JavaScript test/spec files are excluded from the published build. See [QUICKSTART.md](QUICKSTART.md) to get started and [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow.
