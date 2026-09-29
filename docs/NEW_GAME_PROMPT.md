# Make my next game

Open this repository in your coding assistant, paste the prompt below, and replace the idea. A sentence is enough.

```text
Read AGENTS.md and docs/NEW_GAME_PROMPT.md, then help me build and ship a
small game in this repo using the closest existing game's patterns.

My idea: [What does the player do, and what makes it fun?]

Start with a playable 10-second loop. Pick sensible defaults and explain
the few choices that matter. Teach me one thing and give me one small
code change I can try. Test it, make clear commits and push at working
milestones, open a PR, and help get the reviewed game live on GitHub Pages.
Keep this prompt and the repo instructions accurate as the project changes.
```

Optional details, only if you already know:

```text
Game name:
Keyboard, touch, or both:
2D or 3D / visual inspiration:
Win or lose condition:
The one feature I care about most:
Something I want to code myself:
```

Example idea: “Drive a tiny 3D-printed rover across a desk, collect three screws, and reach the charging station before the battery runs out.” A simple first version could use a top-down canvas; use 3D when depth makes the game better, with a small working demo before committing to an engine.

## Instructions for the coding assistant

Treat the learner as a capable beginner. Use short explanations and concrete examples. Explain a pull request once as a place to see the proposed change, run checks, and get feedback before it reaches the live game. Like checking a 3D model before printing, a PR helps catch mistakes while they are easy to fix.

1. **Look first.** Read applicable `AGENTS.md` files, `package.json`, `scripts/build-site.js`, the Pages workflow, and the nearest existing game. Check the branch, working tree, remotes, and GitHub authentication before changing anything. Preserve unrelated work. Ask only questions that block a playable first version; otherwise state a reasonable assumption and proceed.
2. **Make one fun action work.** State the fun promise in one sentence and implement a tiny loop: start, act, get feedback, finish or fail, restart. Make the action clear in the first ten seconds, failures understandable, and restart immediate. Delay accounts, upgrades, complicated architecture, and extra modes until the loop is worth playing.
3. **Follow the repository.** Prefer static HTML, CSS, and JavaScript. Reuse a small relevant pattern rather than copying a whole game or inventing a framework. Make important tuning values easy to find. A 3D engine is an option when it serves the idea, not a requirement; keep any new dependency justified and reproducible.
4. **Ship in working steps.** Work on a feature branch. At each useful milestone—playable loop, feedback and controls, tested release—review the diff, stage only this task's files, make a meaningful commit, and push the branch. Do this proactively even if the learner forgets. Examples: `feat: add rover steering and screw pickups`, `fix: reset battery when restarting rover`, `docs: explain rover controls`. Never commit credentials, force-push, or discard someone else's edits. If authentication or access blocks progress, preserve local work and report the exact next step.
5. **Give the learner ownership.** Explain one useful concept while showing the relevant code, then suggest one small experiment, such as changing rover speed and predicting the result. Keep shipping independent of the optional exercise. Leave a specific file and value to change; avoid turning every step into homework.
6. **Use specialists selectively.** The lead developer owns the small plan and integration. Use one bounded UI/UX review when readability or controls need it, and an independent game tester when a playable loop exists. Delegate in parallel only when it saves time and each agent has a clear task and separate files. Do not spawn a standing team for a tiny change or make the learner coordinate agents. Summarize findings briefly.
7. **Review and release.** Run the relevant checks below, open a PR with the included template, explain the change and evidence, and resolve failures related to the change. Report pre-existing failures honestly. Merge when authorized under the current session and repository rules; otherwise leave a reviewable PR ready for the final decision. A pushed branch or an open PR is not a live release. After merge, verify the Pages run and published game before saying it is live.
8. **Keep the helper current.** In the same PR, update this file, `AGENTS.md`, and the relevant README when paths, commands, deployment, or working conventions change. Keep the copyable prompt short. End with the PR link, live link if verified, test results, and one optional learner experiment.

## Repository map and release checks

Verify this map against the code each time; source files and workflows are authoritative.

| Purpose                                  | Current location or command                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Small arcade example with separate files | `games/banana-wheels-gt/index.html`, `game.js`, `styles.css`                       |
| More modular game example                | `public/v2/src/`                                                                   |
| Self-contained game example              | `public/scoot/index.html`                                                          |
| Game library and its styles              | `public/index.html`, `public/library.css`                                          |
| Suggested new game                       | `games/<game-slug>/index.html`, `game.js`, `styles.css`                            |
| Install pinned dependencies              | `npm ci`                                                                           |
| Development server                       | `npm run dev` → `http://localhost:8000/`                                           |
| New game's local route                   | `http://localhost:8000/games/<game-slug>/`                                         |
| Build / preview the built site           | `npm run build` / `npm run serve`                                                  |
| Automated checks                         | `npm run lint`, `npm run format:check`, `npm test -- --runInBand`, `npm run build` |
| Deployment configuration                 | `.github/workflows/pages.yml`                                                      |

GT learning samples live in `games/banana-wheels-gt/src/`, with utility tests in `games/banana-wheels-gt/tests/`; the playable GT runtime remains `game.js`. Bassline owns `public/bassline-rookie/src/` and `public/bassline-rookie/tests/`. Keep new tests in their game’s `tests/` folder. Jest searches these folders within `games/` and `public/`, excluding generated output.

The build excludes `tests/`, `__tests__/`, JavaScript test/spec files, and `node_modules/` from publication. The build copies `public/` and each immediate `games/` directory containing an `index.html` into `dist/`. Keep new game folders deployable: avoid nested `node_modules`, private files, or server-only code. Do not edit generated `dist/` files. Add a relative library link such as `games/rover/` in `public/index.html`; use relative game assets so they work under the GitHub Pages repository path.

Before opening the PR, play the built version: start, move, score, fail/win, and restart twice. Check console errors, asset loading, readable instructions, and a narrow window; test touch controls if promised. Add focused automated tests for meaningful logic such as scoring or collision edge cases, not tests that merely repeat the implementation. Record what was actually tested and what remains unverified.

Before calling it shipped, ensure the Pages workflow builds and uploads **`dist/`**, not only `public/`, and that the successful deployment corresponds to the merged commit. Use the URL reported by the Pages deployment, then follow the library link and play the new game there. Check both the library and game assets under the repository base path. GitHub Actions success alone is not a browser playtest.
