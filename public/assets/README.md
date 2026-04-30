# Game Assets

This folder contains images, sounds, spritesheets, and other assets for your game.

## Folder Structure

```
assets/
├── images/           # PNG, JPG, SVG images
├── sounds/           # MP3, WAV, OGG audio files
├── sprites/          # Spritesheets and animations
└── fonts/            # Web fonts
```

## How to Use Assets

### Images

```javascript
// Create an image element
const image = new Image();
image.src = 'assets/images/player.png';

image.onload = function() {
  // Draw image on canvas
  ctx.drawImage(image, x, y, width, height);
};
```

### Sounds

```javascript
// Create audio element
const sound = new Audio('assets/sounds/jump.wav');
sound.play();
```

### Spritesheets

```javascript
// For animated sprites
const spritesheet = new Image();
spritesheet.src = 'assets/sprites/player-walk.png';

// Draw specific frame from spritesheet
// (assuming 4 frames of 32x32 pixels each)
const frame = 0;
ctx.drawImage(
  spritesheet,
  frame * 32,  // source X
  0,           // source Y
  32,          // source width
  32,          // source height
  playerX,     // destination X
  playerY,     // destination Y
  32,          // destination width
  32           // destination height
);
```

## Asset Tips

### Images
- Use PNG for transparency (alpha channel)
- Use JPG for photographs
- Keep file sizes small for faster loading
- Recommended: 72-96 DPI

### Sounds
- Use MP3 for compatibility
- Use OWG for smaller file sizes
- Keep under 1-2 MB per sound
- Test audio playback on different devices

### Finding Free Assets

- **Images:** [Unsplash](https://unsplash.com), [Pexels](https://www.pexels.com)
- **Sounds:** [Freesound](https://freesound.org), [Zapsplat](https://www.zapsplat.com)
- **Sprites:** [Itch.io](https://itch.io/game-assets/free)
- **Icons:** [FontAwesome](https://fontawesome.com), [Feather Icons](https://feathericons.com)

## Optimization

### For Web

1. Compress images: [TinyPNG](https://tinypng.com)
2. Optimize sounds: Use audio editor to remove silence
3. Cache assets in code to prevent re-loading
4. Use WebP format for modern browsers

### Example Optimization

```javascript
// ✅ Cache images
const imageCache = {};

function loadImage(src) {
  if (!imageCache[src]) {
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
  }
  return imageCache[src];
}

// Use cached image
const playerImage = loadImage('assets/images/player.png');
```

---

**Tip:** Always test your game with assets to ensure everything loads correctly! 🎮
