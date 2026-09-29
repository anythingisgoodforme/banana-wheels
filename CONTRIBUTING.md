# Contributing to Banana Wheels

## Setup

```bash
git clone https://github.com/anythingisgoodforme/banana-wheels.git
cd banana-wheels
npm ci
npm run dev
```

The library opens at `http://localhost:8000/`. GT is served at `/games/banana-wheels-gt/`; the other projects retain their existing routes.

## Where to work

- `games/banana-wheels-gt/`: Banana Wheels GT page, game logic, and styles.
- `public/`: library page, V2, SCOOT, and Bassline Rookie.
- `games/banana-wheels-gt/src/` and `games/banana-wheels-gt/tests/`: preserved learning modules and utility tests, separate from the playable GT runtime.
- `public/bassline-rookie/src/` and `public/bassline-rookie/tests/`: Bassline modules and their tests.

Put tests in the owning game’s `tests/` folder. Jest discovers them in `games/` and `public/`; the site build excludes test folders and JavaScript test/spec files. Coverage includes the GT learning modules and Bassline source, not generated `dist/`.

## Workflow

1. Create a branch, make the change, and validate it:

```bash
git checkout -b feature/your-change
npm run lint
npm run format:check
npm test
```

2. Commit with a specific message and open a pull request:

```bash
git add path/to/changed-file
git commit -m "feat: improve spring timing"
git push -u origin HEAD
gh pr create --fill
```

Use `feat:`, `fix:`, `docs:`, `refactor:`, or `test:` prefixes. Update the relevant docs when controls, routes, or setup steps change. If `package.json` scripts change, keep the docs aligned.

A commit is a named save point. Pushing backs it up on GitHub. A pull request
shows exactly what will change and gives checks and another person a chance to
catch mistakes before the shared game changes. Make small PRs that are easy to
play and review. Merge a reviewed PR into `main` to trigger Pages, then check
the deployment and live game. A pushed branch is not yet a published game.

Start new games with [the game prompt](docs/NEW_GAME_PROMPT.md). Keep its paths
and commands current as the repository changes.
