# Best Practices Guide for Game Development

This project is set up with industry best practices to help you develop games professionally from the start.

## 📋 Table of Contents

1. [Code Quality](#code-quality)
2. [Version Control](#version-control)
3. [Testing](#testing)
4. [Performance](#performance)
5. [Security](#security)
6. [Deployment](#deployment)
7. [Development Workflow](#development-workflow)

## 🔍 Code Quality

### Linting with ESLint

**What it does:** Catches common programming mistakes and ensures consistent code style.

**Setup:** Already configured in `.eslintrc.json`

**Rules:**
- `semi: true` - Requires semicolons at end of statements
- `eqeqeq: 'always'` - Requires === instead of ==
- `no-unused-vars: 'warn'` - Warns about unused variables

**Before committing:**
```bash
npm run lint         # Check for issues
npm run lint:fix     # Automatically fix issues
```

### Code Formatting with Prettier

**What it does:** Automatically formats code consistently (spacing, quotes, line length).

**Setup:** Configured in `.prettierrc.json`

**Before committing:**
```bash
npm run format       # Format all code
npm run format:check # Check if formatting is needed
```

## 🔐 Version Control (Git)

### Branching Strategy

```
main (production - stable releases)
  ├── develop (development - next release)
       ├── feature/add-jump-mechanic
       ├── feature/add-enemies
       └── fix/collision-detection
```

### Commit Message Format

**Format:** `<type>: <description>`

**Types:**
- `feat:` - New feature (`feat: add double jump mechanic`)
- `fix:` - Bug fix (`fix: correct player collision`)
- `docs:` - Documentation (`docs: update README`)
- `refactor:` - Code cleanup (`refactor: simplify math functions`)
- `test:` - Test changes (`test: add player movement tests`)
- `style:` - Formatting only (`style: fix indentation`)

**Good vs Bad Examples:**
```bash
# ✅ GOOD
git commit -m "feat: add enemy spawning system"
git commit -m "fix: prevent player from jumping twice"

# ❌ BAD
git commit -m "updated stuff"
git commit -m "bug fix"
git commit -m "changes"
```

### Workflow

```bash
# 1. Create a branch
git checkout -b feature/your-feature

# 2. Make changes and test
npm run dev

# 3. Check quality
npm run lint:fix
npm run format
npm test

# 4. Commit
git add .
git commit -m "feat: describe your feature"

# 5. Push
git push origin feature/your-feature

# 6. Create Pull Request on GitHub
```

## 🧪 Testing

### Writing Tests

Tests help catch bugs early and document how code should work.

**Test File Location:** `tests/` directory with `.test.js` extension

**Example Test:**
```javascript
describe('Collision Detection', () => {
  test('should detect collision when rectangles overlap', () => {
    const rect1 = { x: 0, y: 0, width: 50, height: 50 };
    const rect2 = { x: 25, y: 25, width: 50, height: 50 };
    expect(detectCollision(rect1, rect2)).toBe(true);
  });
});
```

**Run Tests:**
```bash
npm test              # Run once
npm run test:watch    # Run and re-run on changes
```

**Best Practices:**
- Test game logic separately from rendering
- Test collision detection thoroughly
- Test edge cases (boundaries, zero values)
- Write tests as you code, not after

## ⚡ Performance

### Game Loop Best Practices

✅ **DO:**
```javascript
// Use requestAnimationFrame for smooth animation
function gameLoop() {
  update();      // Update game state
  draw();        // Render graphics
  requestAnimationFrame(gameLoop);
}
```

❌ **DON'T:**
```javascript
// Don't use setInterval - it's less efficient
setInterval(gameLoop, 16); // Roughly 60 FPS but not smooth
```

### Object Pooling

Reuse objects instead of creating new ones:

```javascript
// ❌ Creates new objects every frame
coordinates = { x: 0, y: 0 };

// ✅ Reuse objects
const coords = { x: 0, y: 0 };
// ...update values...
coords.x = newX;
coords.y = newY;
```

### Avoid Memory Leaks

```javascript
// ❌ Keeps growing - memory leak
this.obstacles = [];
// ...add obstacles...
// Never clear the array

// ✅ Remove off-screen objects
this.obstacles = this.obstacles.filter(obs => !obs.isOffScreen());
```

## 🔒 Security

### JavaScript Game Security Best Practices

1. **Don't store sensitive data in client-side code**
   ```javascript
   // ❌ DON'T - Anyone can see this
   const API_KEY = 'secret123';
   
   // ✅ DO - Use environment variables (server-side)
   const apiKey = process.env.API_KEY;
   ```

2. **Validate user input**
   ```javascript
   // ✅ Check input bounds
   if (playerX < 0 || playerX > CANVAS_WIDTH) {
     playerX = clamp(playerX, 0, CANVAS_WIDTH);
   }
   ```

3. **Keep dependencies updated**
   ```bash
   npm audit       # Check for vulnerabilities
   npm update      # Update to latest versions
   ```

## 🚀 Deployment

### GitHub Pages Deployment

Your game is automatically deployed when you create a release:

```bash
# 1. Create a tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# 2. Push the tag
git push origin v1.0.0

# 3. GitHub Actions automatically:
#    - Runs all tests
#    - Deploys to GitHub Pages
#    - Creates a release
```

### Release Checklist

Before creating a release tag:

- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Tested in browser locally
- [ ] Updated version in `package.json`
- [ ] Updated `CHANGELOG.md` (if you have one)
- [ ] Meaningful commit message

## 📋 Development Workflow

### Development Setup

```bash
# First time
npm install

# Every development session
npm run dev          # Starts server with live reload
```

### Standard Workflow

1. **Start your dev server**
   ```bash
   npm run dev
   ```

2. **Edit code** (browser auto-refreshes)

3. **Before committing:**
   ```bash
   npm run lint:fix
   npm run format
   npm test
   ```

4. **Commit with meaningful message**
   ```bash
   git commit -m "feat: add new game feature"
   ```

5. **Push to GitHub**
   ```bash
   git push
   ```

### Quick Quality Check

Create an alias in your terminal:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias check-code="npm run lint:fix && npm run format && npm test"

# Then use:
check-code
```

## 🎮 Game-Specific Best Practices

### Code Organization

```javascript
// ✅ Good structure
class Game {
  constructor() {
    this.player = new Player();
    this.enemies = [];
  }

  update() {
    // Update all game objects
    this.player.update();
    this.enemies.forEach(e => e.update());
  }

  draw() {
    // Render all game objects
    this.player.draw();
    this.enemies.forEach(e => e.draw());
  }
}

// ❌ Avoid - Mixed concerns
function gameLoop() {
  // Physics
  updatePlayerPosition();
  // Rendering
  drawPlayer();
  // Input
  handleKeyboard();
  // Scoring
  updateScore();
  // Everything together!
}
```

### Comments and Documentation

```javascript
/**
 * Calculates collision between two rectangles
 * @param {Object} rect1 - Rectangle 1 with x, y, width, height
 * @param {Object} rect2 - Rectangle 2 with x, y, width, height
 * @returns {boolean} - True if rectangles collide
 */
function checkCollision(rect1, rect2) {
  // Implementation
}
```

### Constants Over Magic Numbers

```javascript
// ❌ Magic numbers - What do these mean?
player.x += 5;
player.y -= 15;
if (score > 1000) /* ... */

// ✅ Named constants
const PLAYER_SPEED = 5;
const JUMP_POWER = 15;
const HIGH_SCORE = 1000;

player.x += PLAYER_SPEED;
player.y -= JUMP_POWER;
if (score > HIGH_SCORE) /* ... */
```

## 📚 Further Reading

- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/)
- [Game Development Fundamentals](https://www.khanacademy.org/computing/computer-programming)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Canvas API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

**Remember:** These best practices exist to help you write better code, collaborate effectively, and build professional-quality games. Start simple and gradually apply more practices as you grow! 🎮✨
