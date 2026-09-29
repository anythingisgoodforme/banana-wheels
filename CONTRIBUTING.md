# Contributing to Banana Wheels

## Setup

```bash
git clone https://github.com/anythingisgoodforme/banana-wheels.git
cd banana-wheels
npm install
npm run dev
```

The library opens at `http://localhost:8000/`. GT is served at `/games/banana-wheels-gt/`; the other projects retain their existing routes.

## Where to work

- `games/banana-wheels-gt/`: Banana Wheels GT page, game logic, and styles.
- `public/`: library page, V2, SCOOT, and Bassline Rookie.
- `src/` and `tests/`: shared utilities and their tests.

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
git add .
git commit -m "feat: improve spring timing"
git push
```

Use `feat:`, `fix:`, `docs:`, `refactor:`, or `test:` prefixes. Update the relevant docs when controls, routes, or setup steps change. If `package.json` scripts change, keep the docs aligned.
