# GitHub Actions Workflows

This document explains the automated workflows that run to maintain code quality and publish your games.

## 📋 Overview

GitHub Actions are automated tasks that run in the cloud when you push code or create releases. This project has two main workflows:

1. **CI (Continuous Integration)** - Runs on every push and pull request
2. **Publish** - Runs when you create a release

## 🔄 CI Workflow (`.github/workflows/ci.yml`)

### What It Does

The CI workflow runs automatically on every push and pull request to ensure code quality.

### When It Runs

- On every `git push` to `main` or `develop` branches
- On every pull request to `main` or `develop` branches

### The Jobs

#### 1. **Lint Job**
Checks code quality using ESLint:
- Reads your JavaScript files
- Checks for style issues
- Checks for potential bugs
- Fails if serious issues are found

**View Results:**
1. Go to GitHub.com and open your repository
2. Click the "Actions" tab
3. Click on a workflow run
4. Click "Lint Code" to see details

#### 2. **Test Job**
Runs all your tests using Jest:
- Executes test files in `tests/` directory
- Reports which tests pass/fail
- Shows code coverage if configured

**Command Equivalent:**
```bash
npm test
```

#### 3. **Build Job**
Verifies your game builds correctly:
- Runs the build script
- Checks for compilation errors
- Ensures all files are present

**Command Equivalent:**
```bash
npm run build
```

### How to Read Workflow Results

1. **On GitHub:** Actions tab → select workflow → see job results
2. **Check failures:**
   - Click the failed job
   - Scroll to see error messages
   - Fix issues locally, then push again

### Example Workflow Run

```
Commit to main branch
        ↓
GitHub detects push
        ↓
Triggers CI workflow
        ↓
┌─ Lint Code (checks formatting)
├─ Run Tests (runs test suite)
└─ Build Game (verifies build)
        ↓
All pass? → Green checkmark ✅
Any fail? → Red X ❌ (prevents merge)
```

## 🚀 Publish Workflow (`.github/workflows/publish.yml`)

### What It Does

Publishes a formal release of your game with:
- GitHub Release page
- Release artifacts
- GitHub Pages deployment
- Release notes

### When It Runs

- Automatically when you push a version tag (e.g., `v1.0.0`)
- Manually via "Run workflow" in GitHub Actions

### The Jobs

#### 1. **Release Job**
Creates an official GitHub release:
- Runs all quality checks first
- Creates a GitHub Release page
- Attaches game files
- Generates release notes

#### 2. **Deploy Pages Job**
Publishes your game to GitHub Pages:
- Takes publishing files from `public/`
- Deploys to yourname.github.io/repo-name
- Makes game playable online

### How to Create a Release

```bash
# 1. Make sure everything is committed
git status

# 2. Create a version tag
git tag -a v1.0.0 -m "Initial game release"

# 3. Push the tag
git push origin v1.0.0
```

### What Happens Next

1. GitHub detects the new tag
2. Publish workflow starts automatically
3. Runs all tests and quality checks
4. Creates a Release on GitHub
5. Deploys to GitHub Pages
6. You're done! 🎉

### View Your Release

1. Go to GitHub.com repository
2. Click "Releases" section
3. See your new release with download links

## ⚙️ Configuration Files

### `.github/workflows/ci.yml`
Main continuous integration workflow:
- Triggers on pushes to `main` and `develop`
- Triggers on pull requests
- Runs linting, testing, and build checks

### `.github/workflows/publish.yml`
Release and deployment workflow:
- Triggers on version tags
- Creates GitHub releases
- Deploys to GitHub Pages

## 🔧 Debugging Workflow Issues

### Issue: Workflow Fails

**Steps to fix:**

1. Click the failed workflow on GitHub Actions
2. Click the failed job
3. Expand failed steps to see error messages
4. Fix the issue locally:
   ```bash
   npm run lint:fix    # Fix lint errors
   npm run format      # Fix formatting
   npm test            # Run tests
   ```
5. Commit and push:
   ```bash
   git add .
   git commit -m "fix: resolve CI issues"
   git push
   ```

### Common Issues

**Issue: "ESLint found issues"**
```bash
# Solution: Fix linting
npm run lint:fix
```

**Issue: "Code formatting issues found"**
```bash
# Solution: Format code
npm run format
```

**Issue: "Tests failed"**
```bash
# Solution: Run tests locally
npm test
# Check the failing test
# Fix your code
# Run tests again
```

**Issue: Build fails**
```bash
# Solution: Check build locally
npm run build
```

## 📊 Workflow Status Badges

You can add a status badge to your README:

```markdown
![CI](https://github.com/YOUR-USERNAME/banana-wheels/actions/workflows/ci.yml/badge.svg)
```

## 🎯 Best Practices

### Keep Workflows Clean

✅ **DO:**
- Keep code quality high so workflows pass
- Commit often with meaningful messages
- Test locally before pushing

❌ **DON'T:**
- Push code knowing tests will fail
- Ignore workflow failures
- Disable quality checks

### Pre-Commit Checks

Run before every commit:
```bash
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm test              # Run tests
git add .
git commit -m "message"
```

### Release Checklist

Before creating a release:
- [ ] All tests pass locally (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Tested in browser (works as expected)
- [ ] Updated version in `package.json`
- [ ] Created meaningful commits
- [ ] Ready to tag: `git tag -a vX.Y.Z`

## 📈 Monitoring Workflows

### Dashboard

Workflows appear in:
- **Repository:** Actions tab shows all workflow runs
- **Commit history:** Green checkmark (✅) or red X (❌) next to each commit
- **Pull Requests:** Status checks show if PR is "Ready to merge"

### Notifications

GitHub will notify you of:
- Workflow failures
- Deployment successes
- Action required situations

## 🤖 How GitHub Actions Help

1. **Consistency** - Same checks run every time
2. **Automation** - No manual steps needed
3. **Safety** - Prevents broken code from deploying
4. **Collaboration** - Everyone sees the same checks
5. **Publishing** - Auto-deploy to GitHub Pages
6. **Documentation** - Shows code quality history

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Jest Testing](https://jestjs.io/docs/getting-started)

---

**Remember:** Workflows automate quality checks so you can focus on building great games! 🎮🚀
