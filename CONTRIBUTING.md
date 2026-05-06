# Contributing to Banana Wheels

## Setup

```bash
git clone https://github.com/your-username/banana-wheels.git
cd banana-wheels
npm install
npm run dev
```

The local game runs at `http://localhost:8000`.

## Where to work

The current playable game is in `public/`.

- `public/game.js`: first-person game loop and rendering
- `public/index.html`: controls text and HUD markup
- `public/styles.css`: page styling

If you add reusable helpers, keep them in `src/` and add tests in `tests/`.

## Typical workflow

1. Create a branch.

```bash
git checkout -b feature/your-change
```

2. Make your changes.

3. Validate them.

```bash
npm run lint:fix
npm run format
npm test
```

4. Commit with a specific message.

```bash
git add .
git commit -m "feat: improve first-person spring timing"
```

5. Push and open a pull request.

## Commit prefixes

- `feat:` new gameplay or UI behavior
- `fix:` bug fix
- `docs:` documentation update
- `refactor:` internal cleanup
- `test:` test changes

## Review expectations

- Keep gameplay changes understandable in `public/game.js`.
- Update docs when controls or setup steps change.
- Do not leave debug logging in the final patch.
- If you change scripts in `package.json`, make sure the docs match.

## Before pushing

```bash
npm run lint
npm run format:check
npm test
```
