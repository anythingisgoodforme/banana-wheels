# 🎮 Banana Wheels - Game Development Learning Project

A beginner-friendly JavaScript game development project with professional best practices, GitHub Actions workflows, and automated quality checks.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
# or for watching changes:
npm run dev
```

Your game will open at `http://localhost:8000`

### 3. Code Your Game

Edit the files in `src/` and `public/` to create your game.

## 📁 Project Structure

```
banana-wheels/
├── public/                 # Web server files (HTML, CSS, assets)
│   ├── index.html         # Main game page
│   ├── styles.css         # Game styling
│   ├── assets/            # Images, sounds, spritesheets
│   └── game.js            # Game entry point (or link to src/)
├── src/                   # Game source code
│   ├── game.js            # Main game class
│   ├── player.js          # Player class
│   ├── enemy.js           # Enemy class
│   └── utils.js           # Helper functions
├── tests/                 # Test files
├── .github/               # GitHub configuration
│   └── workflows/         # Automated CI/CD workflows
├── package.json           # Dependencies and scripts
├── .eslintrc.json         # Code quality rules
└── .prettierrc.json       # Code formatting rules
```

## 📚 Available Scripts

### Development
```bash
npm run dev          # Start dev server with live reload
npm start            # Start dev server and open in browser
npm run serve        # Start server without opening browser
```

### Code Quality
```bash
npm run lint         # Check for code quality issues
npm run lint:fix     # Automatically fix linting issues
npm run format       # Format all code with Prettier
npm run format:check # Check if code is formatted correctly
```

### Testing
```bash
npm test             # Run all tests
npm test:watch       # Run tests and watch for changes
```

### Build & Deploy
```bash
npm run build        # Build/verify the game
```

## ✅ Automated Workflows

### 1. **Code Quality Pipeline** (`ci.yml`)
Runs on every push and pull request:
- ✓ ESLint code checking
- ✓ Prettier formatting verification
- ✓ Running tests
- ✓ Build verification

### 2. **Publish Release** (`publish.yml`)
Runs when you create a version tag:
- ✓ All quality checks
- ✓ Creates GitHub Release
- ✓ Deploys to GitHub Pages (optional)
- ✓ Generates release notes

## 🎯 Development Best Practices

### Commit Often
```bash
# Good commits (specific, small changes)
git commit -m "feat: add jump mechanic"
git commit -m "fix: correct collision detection"
git commit -m "docs: update README with instructions"

# Avoid (vague, large commits)
git commit -m "stuff"
git commit -m "updated code"
```

### Code Quality
Before committing, always run:
```bash
npm run lint:fix && npm run format
```

### Testing
Write tests for your game logic:
```bash
npm test                # Run once
npm run test:watch     # Run and watch for changes
```

## 🚀 Publishing Your Game

### Step 1: Create a Release Tag
```bash
git tag -a v1.0.0 -m "Initial game release"
git push origin v1.0.0
```

### Step 2: GitHub Actions Will:
- Run all quality checks
- Create a GitHub Release
- Deploy to GitHub Pages (if enabled)
- Create release notes

### Step 3: Your Game is Live!
- Access it on GitHub Pages
- Share the link with friends and family

## 📖 Learning Resources

- **[MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/)** - Learn JavaScript
- **[HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** - Draw graphics
- **[Game Development Tips](https://gamedev.stackexchange.com/)** - Game dev community
- **[Git Tutorial](https://www.atlassian.com/git/tutorials)** - Version control
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Detailed contribution guide

## 🐛 Debugging Tips

### Browser Developer Tools
1. Press `F12` or `Cmd+Option+I` to open DevTools
2. Use Console tab to run JavaScript commands
3. Use Debugger to step through code
4. Use Network tab to check for missing files

### Common Debug Commands
```javascript
// Check your game state
console.log('Game state:', gameState);

// Measure performance
console.time('gameLoop');
// ... your code ...
console.timeEnd('gameLoop');

// Set breakpoints in debugger
debugger;  // Code will pause here
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Setting up your development environment
- Code standards and conventions
- Commit message best practices
- Pull request workflow
- Code review process

## 📝 Code Organization Tips

### Use Classes for Game Objects
```javascript
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5;
  }

  move(direction) {
    if (direction === 'left') this.x -= this.speed;
    if (direction === 'right') this.x += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y, 32, 32);
  }
}
```

### Separate Concerns
- Game logic → separate from rendering
- Physics → separate from input handling
- Utilities → in their own files

## 🎮 Getting Started with Your First Game

1. **Edit `public/index.html`** - Create your game canvas
2. **Edit `src/game.js`** - Write your game logic
3. **Add styling** - `public/styles.css`
4. **Test locally** - `npm run dev`
5. **Commit changes** - `git add . && git commit -m "your message"`
6. **Push to GitHub** - `git push`

## 📚 Example Game Loop

```javascript
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = true;
  }

  start() {
    this.gameLoop();
  }

  gameLoop = () => {
    if (!this.running) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update
    this.update();

    // Draw
    this.draw();

    // Next frame
    requestAnimationFrame(this.gameLoop);
  };

  update() {
    // Update game state
  }

  draw() {
    // Render everything
  }
}
```

## ❓ FAQ

**Q: How do I test my game?**
A: Run `npm run dev` and open the browser at `http://localhost:8000`

**Q: What if I break something?**
A: Git history is saved! Run `git log` to see commits and `git revert COMMIT_ID` to undo changes

**Q: How do I add images or sounds?**
A: Put them in `public/assets/` and reference them in your code

**Q: Can I work on this on multiple computers?**
A: Yes! Push your changes with `git push` and pull them with `git pull`

## 🎯 Next Steps

1. ✅ Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. ✅ Run `npm install` to install dependencies
3. ✅ Run `npm run dev` to start developing
4. ✅ Create your first game!
5. ✅ Make your first commit and push to GitHub
6. ✅ Create a release tag when ready

---

**Happy Game Development!** 🎮✨

Have questions? Check the [CONTRIBUTING.md](CONTRIBUTING.md) guide or the resources above.
