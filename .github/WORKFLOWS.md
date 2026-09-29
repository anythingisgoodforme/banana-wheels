# GitHub Actions workflows

All workflows use the Node version in `.node-version` and the dependencies pinned
in `package-lock.json`.

| Workflow      | Trigger                                      | Result                                                               |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| `ci.yml`      | Pushes and PRs targeting `main` or `develop` | Lint, formatting, tests, build                                       |
| `pages.yml`   | Push to `main`, or manual run                | Build and deploy `dist/` to GitHub Pages                             |
| `publish.yml` | `v*` tag push, or manual run                 | Lint, tests, build; tagged runs create a downloadable GitHub Release |

## From idea to live game

1. Use [the new-game prompt](../docs/NEW_GAME_PROMPT.md) and make a feature branch.
2. Make and push small, working commits. Open a PR so changes and check results
   are easy to review together.
3. Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
   Play the built game with `npm run serve`. Report existing failures separately;
   do not hide them or disable checks.
4. After review and passing required checks, merge into `main`. The Pages workflow
   builds the library and all immediate `games/` folders with an `index.html`.
5. Check **Actions → Deploy GitHub Pages**. Open the deployment URL and follow the
   library link to the game. Verify controls, assets, and restart before calling it live.

The Pages workflow deploys independently of CI. Required PR checks must be
configured in GitHub branch protection/rulesets to enforce review and passing
checks before merge; this repository file does not configure those settings.
Avoid direct pushes to `main`. A manual Pages run deploys its selected ref, so
select `main` for the normal production site.

## Releases

A version tag creates a downloadable release; it does not change the live site.
This avoids an old release tag overwriting the game library. When a release is
wanted, tag the intended reviewed commit and push that tag:

```bash
git tag -a v1.0.1 -m "Release improved rover controls"
git push origin v1.0.1
```

Choose a new version each time. A manual Publish run without a version tag checks
and builds the selected ref but does not create a Release.

## When checks fail

Open the failed job in GitHub's Actions tab and read the failing step. Reproduce
that command locally, fix the relevant files, and push a specific commit such as
`fix: reset rover battery on restart`. Format only changed files when working on
a small feature; avoid unrelated mass changes. If formatting debt already exists,
record it and resolve it in a separate cleanup before requiring a green merge.
