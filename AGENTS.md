# Build, play, ship

Work with a capable beginner who wants to make lots of features and enjoy visible
progress. Prioritize building, playing, and quick feedback. Keep explanations short
and relevant to the current feature; teach fundamentals when asked. The parent
will introduce those later. Prefer simple playable results over architecture.

## Start and finish

- Read `README.md`, `package.json`, and relevant source before changing anything.
- For a new game, follow `docs/NEW_GAME_PROMPT.md`. Ask only questions that block
  progress; choose sensible defaults for everything else.
- Reuse the closest existing game pattern. Default to static HTML/CSS/JavaScript,
  no backend, no new framework. Put new standalone games in `games/<slug>/`.
- Ship one fun ten-second loop first: clear controls, feedback, failure, restart.
- Let the learner steer ideas and try code when interested. Offer a small code
  experiment only when requested or naturally useful; do not append homework or
  a mandatory lesson to every feature. Preserve their experiments.
- End with what changed, how to try it, checks actually run, and brief PR/live
  status. Never call a game live without verifying its URL.

## Commits and pull requests

- Inspect `git status` first. Preserve unrelated work and never commit secrets.
- Work on a descriptive branch. At each coherent stage (playable loop, tested
  improvement, ready to ship), review the diff, stage explicit task files, commit
  with a specific message, and push the branch. The owner authorizes these regular
  checkpoints; do not wait to be reminded. No empty or timer-only commits.
- Good messages explain a visible change: `feat: add rocket landing controls`,
  `fix: reset score when restarting`, `docs: explain rocket steering`.
- Handle Git and PR mechanics quietly during active work. For larger features,
  open/update PRs as a review and history trail, not a teaching exercise. Do not
  require the son to study PRs, coordinate reviews, or learn Git to make progress.
- Record behavior and validation in PRs without a required learning note. Keep any
  failing checks visible. Merge only when the user asks to merge/ship or has
  otherwise authorized it, and required checks pass. Never bypass protections,
  force-push, invent author identity, or claim a blocked push succeeded.
- If credentials/identity are missing, finish local work and state the exact
  blocker. These checkpoints run during active sessions, not in the background.

## Small team, small context

The lead developer owns integration and shipping. For simple changes, one agent
can apply all roles. Delegate only independent, bounded work that saves effort:
UX designer checks controls/onboarding; UI designer checks readability/feedback;
game tester checks restart, collision, input, and browser errors. Use a specialist
for difficult 3D/performance issues when useful. Give each agent relevant files,
acceptance criteria, and clear ownership; ask for short findings, not essays.
Avoid ceremonial teams and repeated full-repo reviews. Never invent experience.

## Validation and maintenance

- Use `npm ci`, `npm run build`, and `npm test -- --runInBand`; run lint and
  formatting checks and distinguish baseline failures from regressions.
- Playtest affected controls, lose/restart, and browser console. For new routes,
  test the built site with the GitHub Pages `/banana-wheels/` prefix too.
- Keep source and tests owned by their game: GT learning samples in
  `games/banana-wheels-gt/src/` and `tests/`; Bassline source and tests in
  `public/bassline-rookie/src/` and `tests/`. GT samples are not its runtime.
  Jest discovers game-owned `tests/` folders in `games/` and `public/`.
- `scripts/build-site.js` excludes `tests/`, `__tests__/`, test/spec JavaScript,
  and `node_modules/` from publication. Keep that boundary when adding tests.
- `scripts/build-site.js` composes `public/` and games with `index.html` into
  `dist/`. Add a library card in `public/index.html`; use relative asset links.
- Keep `docs/NEW_GAME_PROMPT.md`, setup docs, and README accurate in the same
  change whenever commands, paths, deployment, or workflow change. Update the
  game's README for its controls and tuning knobs. Do not rewrite docs for churn.
- An occasional small 3D demo is welcome when requested or relevant: one concept,
  adjustable values, modest assets, and no distraction from the current game.
