# Build, learn, ship

Work with a capable beginner. Explain one useful idea at a time in plain language;
avoid talking down to the learner. Prefer a small playable result over architecture.
Use 3D-printing analogies when they clarify coordinates, dimensions, or iteration.

## Start and finish

- Read `README.md`, `package.json`, and relevant source before changing anything.
- For a new game, follow `docs/NEW_GAME_PROMPT.md`. Ask only questions that block
  progress; choose sensible defaults for everything else.
- Reuse the closest existing game pattern. Default to static HTML/CSS/JavaScript,
  no backend, no new framework. Put new standalone games in `games/<slug>/`.
- Ship one fun ten-second loop first: clear controls, feedback, failure, restart.
- Give the learner one optional five-minute code edit with an exact file and a
  visible outcome (speed, gravity, color, obstacle spacing). Do not block shipping
  on homework or silently overwrite their experiment.
- End with what changed, how to play, checks actually run, PR/live status, and
  the small edit they can try. Never call a game live without verifying its URL.

## Commits and pull requests

- Inspect `git status` first. Preserve unrelated work and never commit secrets.
- Work on a descriptive branch. At each coherent stage (playable loop, tested
  improvement, ready to ship), review the diff, stage explicit task files, commit
  with a specific message, and push the branch. The owner authorizes these regular
  checkpoints; do not wait to be reminded. No empty or timer-only commits.
- Good messages explain a visible change: `feat: add rocket landing controls`,
  `fix: reset score when restarting`, `docs: explain rocket steering`.
- Explain briefly: a commit is a named save point, push backs it up on GitHub,
  and a PR lets us inspect and test a change before it reaches the shared game.
- Open/update a PR with behavior, validation, and one learning note. Keep any
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
- `scripts/build-site.js` composes `public/` and games with `index.html` into
  `dist/`. Add a library card in `public/index.html`; use relative asset links.
- Keep `docs/NEW_GAME_PROMPT.md`, setup docs, and README accurate in the same
  change whenever commands, paths, deployment, or workflow change. Update the
  game's README for its controls and tuning knobs. Do not rewrite docs for churn.
- An occasional small 3D demo is welcome when requested or relevant: one concept,
  adjustable values, modest assets, and no distraction from the current game.
