# 🚀 Quick Start Guide for Your Son

Welcome to Banana Wheels! This guide will get you coding and playing games in 5 minutes.

## Step 1: Install Node.js & npm (if you haven't already)

### Mac
```bash
# Using Homebrew (if installed)
brew install node

# Or download from https://nodejs.org/
```

### Windows
```bash
# Download and install from https://nodejs.org/
```

### Verify Installation
```bash
node --version
npm --version
```

## Step 2: Set Up the Project (One Time)

```bash
# Navigate to the project folder
cd banana-wheels

# Install dependencies
npm install

# This will take 1-2 minutes
```

## Step 3: Start Playing/Coding! 🎮

```bash
# Start the development server
npm run dev

# Your game will open automatically in your browser!
```

## The Game

### Controls
- **Arrow Keys** - Move left/right
- **Space** - Jump
- **P** - Pause/Resume

### Objective
- Avoid the falling bananas
- Collect points by dodging obstacles
- See how high a score you can get!

## Start Coding

### Edit the Game

Open `public/game.js` and make changes:

```javascript
// Change the player color
this.color = '#FF0000';  // Red instead of pink

// Make player faster
this.speed = 10;  // Up from 5

// Make obstacles spawn faster
this.spawnRate = 50;  // Down from 100
```

Save the file and your browser will automatically refresh! 🔄

## Your First Commit

```bash
# See what changed
git status

# Save your changes
git add .
git commit -m "feat: make player red and faster"

# Push to GitHub
git push
```

## Common Tasks

### Stop the Game
Press `Ctrl+C` in the terminal

### Run Tests
```bash
npm test
```

### Check Code Quality
```bash
npm run lint:fix
npm run format
```

## Having Issues?

### Game won't start?
```bash
# Kill any existing process
npm run dev
# This usually fixes it
```

### Port already in use?
```bash
# Try a different port
npx http-server ./public -p 3000
```

### Code has errors?
1. Open browser console (F12)
2. Read the error message
3. Check `public/game.js` for typos
4. Fix and save - browser auto-refreshes

## Next Steps

1. **Modify the game** - Change colors, speeds, add features
2. **Write tests** - Create files in `tests/` folder
3. **Commit often** - Save progress to Git
4. **Create a release** - Share your game when ready

## File Locations

```
banana-wheels/
├── public/game.js          ← Edit this to change the game
├── public/styles.css       ← Edit this to change colors/layout
├── public/index.html       ← Edit this to change the page
├── src/utils.js            ← Helper functions
└── tests/utils.test.js     ← Your tests
```

## Cool Ideas to Try

### Easy
- 🎨 Change colors
- ⚡ Change speeds and difficulty
- 📊 Modify score multiplier

### Medium
- 👾 Add a new enemy type
- 🏥 Add power-ups
- 🎵 Add sound effects

### Hard
- 🎮 Add new game modes
- 🤖 Add AI enemies
- 📱 Add mobile touch controls

## Useful Commands

```bash
npm run dev                # Start game (with auto-reload)
npm start                  # Start game (opens in browser)
npm run serve              # Start game (no auto-open)
npm run lint:fix           # Fix code formatting
npm run format             # Format all code
npm test                   # Run tests
npm run build              # Build the game
git status                 # See what changed
git add .                  # Stage changes
git commit -m "message"    # Save to Git
git push                   # Push to GitHub
```

## Need Help?

1. **Check the error message** - Usually tells you what's wrong
2. **Read the comments** in `game.js` 
3. **Look at CONTRIBUTING.md** for detailed guide
4. **Check README.md** for more info
5. **Ask for help!** 👨‍💻

## Remember

- Save often to Git (`git commit`)
- Test your changes in the browser
- Read error messages - they're helpful!
- Have fun! 🎮✨

---

**Now go build something awesome!** 🚀🍌
