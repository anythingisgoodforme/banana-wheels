# Contributing to Banana Wheels

Welcome to the Banana Wheels game development project! This guide will help you follow best practices as you learn and develop games.

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/banana-wheels.git
cd banana-wheels
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Developing
```bash
npm run dev
# or
npm start
```

The game will open automatically in your browser at `http://localhost:8000`

## Development Workflow

### Making Changes

1. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-game-feature
   ```

2. **Make your changes** in the `src/` and `public/` directories

3. **Test locally**:
   ```bash
   npm run dev
   ```

4. **Lint and format** your code:
   ```bash
   npm run lint:fix    # Fix linting issues
   npm run format      # Format code automatically
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add awesome new game mechanic"
   ```

6. **Push to GitHub**:
   ```bash
   git push origin feature/your-game-feature
   ```

7. **Create a Pull Request** on GitHub and describe your changes

## Commit Message Conventions

Use clear, descriptive commit messages following this pattern:

- `feat:` - New feature or game mechanic
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring without changing functionality
- `style:` - Code style/formatting changes
- `test:` - Adding or updating tests

**Examples:**
```bash
git commit -m "feat: add jump mechanic to player"
git commit -m "fix: correct collision detection"
git commit -m "docs: update README with gameplay instructions"
```

## Before You Push

Always run these commands before pushing:

```bash
npm run lint:fix    # Fix any linting issues
npm run format      # Format code
npm test            # Run tests (if any)
```

## Code Quality Standards

### JavaScript Best Practices

✅ **DO:**
- Use `const` by default, `let` for variables that change
- Use meaningful variable names (`playerX` not `px`)
- Add comments for complex logic
- Keep functions small and focused
- Use console.log for debugging, but remove debug logs before committing

❌ **DON'T:**
- Use `var` (it's outdated)
- Use magic numbers - define constants instead
- Write functions that do too many things
- Leave console logs in production code
- Commit code with syntax errors

### Naming Conventions

```javascript
// Classes/Constructors - PascalCase
class Player {
}

// Functions/Variables - camelCase
function updatePlayerPosition() {
}

let playerHealth = 100;

// Constants - UPPER_SNAKE_CASE
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
```

## File Structure

```
banana-wheels/
├── public/              # Files served by the web server
│   ├── index.html      # Main game page
│   ├── styles.css      # Game styling
│   └── assets/         # Images, sounds, etc.
├── src/                # Source JavaScript files
│   ├── game.js         # Main game logic
│   ├── player.js       # Player class
│   └── utils.js        # Helper functions
├── tests/              # Test files
├── package.json        # Project configuration
├── .eslintrc.json      # Linting rules
└── .prettierrc.json    # Formatting rules
```

## Publishing Your Game

When you're ready to release a version:

1. Ensure all tests pass:
   ```bash
   npm test
   ```

2. Create a tag for the release:
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   ```

3. Push the tag:
   ```bash
   git push origin v1.0.0
   ```

4. GitHub Actions will automatically:
   - Run all code quality checks
   - Build your game
   - Create a release on GitHub
   - Deploy to GitHub Pages (if configured)

## Debugging Tips

### Using the Browser

1. Open your browser's Developer Tools (`F12` or `Cmd+Option+I`)
2. Use the JavaScript Console to run commands
3. Use the Debugger to step through code
4. Use the Network tab to check for missing assets

### Common Commands

```javascript
// Log variables
console.log('Player position:', playerX, playerY);

// Check if code is running
console.warn('This is a warning');

// Check for errors
console.error('Something went wrong!');
```

## Need Help?

- Add comments to confusing code
- Create issues on GitHub with questions
- Discuss with your learning partner (your dad!)

## Code Review Process

When you submit a pull request:

1. GitHub Actions will automatically check your code
2. Linting and formatting must pass
3. Tests must pass
4. Get feedback from reviewers
5. Make updates if requested
6. Merge when approved!

## Resources

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/)
- [JavaScript.info](https://javascript.info/)
- [Game Development Tips](https://gamedev.stackexchange.com/)
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

Happy coding! 🎮
