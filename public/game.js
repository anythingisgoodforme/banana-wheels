/**
 * Banana Wheels - Simple JavaScript Game
 * A starter template for learning game development
 *
 * This game demonstrates:
 * - Game loop with requestAnimationFrame
 * - Player movement with keyboard input
 * - Collision detection
 * - Sprite rendering
 * - Score tracking
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CANVAS_ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const PLAYER_SPEED = 5;
const PLAYER_JUMP_POWER = 15;
const GRAVITY = 0.5;

const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 50;

const GROUND_LEVEL = CANVAS_HEIGHT - 80;

// ============================================================================
// INPUT HANDLING
// ============================================================================

const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key === ' ') {
    e.preventDefault();
  }

  // Restart on Space after game over
  if (e.key === ' ' && game.gameOver) {
    game.restart();
    return;
  }

  // Pause on 'P' or Space during the game
  if ((e.key.toLowerCase() === 'p' || e.key === ' ') && !game.gameOver) {
    game.togglePause();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ============================================================================
// PLAYER CLASS
// ============================================================================

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.velY = 0;
    this.isJumping = false;
    this.speed = PLAYER_SPEED;
    this.color = '#FF6B6B';
  }

  update() {
    // Horizontal movement
    if (keys['arrowleft'] || keys['a']) {
      this.x -= this.speed;
    }
    if (keys['arrowright'] || keys['d']) {
      this.x += this.speed;
    }

    // Keep player on screen
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.width;
    }

    // Jump
    if (keys['w'] && !this.isJumping) {
      this.velY = -PLAYER_JUMP_POWER;
      this.isJumping = true;
    }

    // Apply gravity
    this.velY += GRAVITY;
    this.y += this.velY;

    // Ground collision
    if (this.y + this.height >= GROUND_LEVEL) {
      this.y = GROUND_LEVEL - this.height;
      this.velY = 0;
      this.isJumping = false;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 8, this.y + 8, 8, 8);
    ctx.fillRect(this.x + 24, this.y + 8, 8, 8);

    // Draw pupils
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x + 10, this.y + 10, 4, 4);
    ctx.fillRect(this.x + 26, this.y + 10, 4, 4);
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

// ============================================================================
// OBSTACLE CLASS
// ============================================================================

class Obstacle {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.width = OBSTACLE_WIDTH;
    this.height = OBSTACLE_HEIGHT;
    this.speed = speed;
    this.color = '#FFD700';
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-0.35);

    // Outer banana curve
    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.quadraticCurveTo(-28, -4, -10, -18);
    ctx.quadraticCurveTo(10, -30, 24, -12);
    ctx.quadraticCurveTo(14, -4, 10, 8);
    ctx.quadraticCurveTo(-1, 20, -16, 12);
    ctx.closePath();
    ctx.fillStyle = '#f7d11e';
    ctx.fill();

    // Inner cut to create the crescent banana shape
    ctx.beginPath();
    ctx.moveTo(-10, 9);
    ctx.quadraticCurveTo(-16, -2, -4, -10);
    ctx.quadraticCurveTo(8, -18, 16, -8);
    ctx.quadraticCurveTo(9, -2, 7, 6);
    ctx.quadraticCurveTo(-1, 13, -10, 9);
    ctx.closePath();
    ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
    ctx.fill();

    // Simple shading to keep it readable against the sky
    ctx.beginPath();
    ctx.moveTo(-15, 11);
    ctx.quadraticCurveTo(-21, -1, -8, -14);
    ctx.quadraticCurveTo(5, -21, 17, -10);
    ctx.strokeStyle = '#e5a910';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Stem and tip
    ctx.fillStyle = '#5a3511';
    ctx.fillRect(18, -13, 5, 6);
    ctx.fillRect(-19, 10, 4, 4);

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// ============================================================================
// GAME CLASS
// ============================================================================

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = true;
    this.paused = false;
    this.gameOver = false;

    this.player = new Player(100, GROUND_LEVEL - PLAYER_HEIGHT);
    this.obstacles = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.spawnRate = 60;
    this.gameTime = 0;

    this.start();
  }

  start() {
    this.gameLoop();
  }

  togglePause() {
    this.paused = !this.paused;
    console.log(this.paused ? '⏸️ Game Paused' : '▶️ Game Resumed');
  }

  restart() {
    this.paused = false;
    this.gameOver = false;
    this.player = new Player(100, GROUND_LEVEL - PLAYER_HEIGHT);
    this.obstacles = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.spawnRate = 60;
    this.gameTime = 0;
    console.log('🔄 Game Restarted!');
  }

  spawn() {
    if (this.gameTime % this.spawnRate === 0) {
      const obstacle = new Obstacle(
        CANVAS_WIDTH,
        GROUND_LEVEL - OBSTACLE_HEIGHT,
        5 + this.level
      );
      this.obstacles.push(obstacle);
    }
  }

  update() {
    if (this.paused || this.gameOver) return;

    this.gameTime++;
    this.player.update();
    this.spawn();

    // Update obstacles and check collisions
    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.update();

      // Check collision with player
      if (checkCollision(this.player.getBounds(), obstacle.getBounds())) {
        this.lives--;
        this.obstacles = [];
        console.log(`💥 Hit! Lives: ${this.lives}`);

        if (this.lives <= 0) {
          this.gameOver = true;
          console.log('❌ Game Over!');
        }
      }

      // Remove off-screen obstacles and increment score
      if (obstacle.isOffScreen()) {
        this.score += 15;
        return false;
      }

      return true;
    });

    // Increase difficulty
    if (this.score > 0 && this.score % 100 === 0) {
      const newLevel = Math.floor(this.score / 100) + 1;
      if (newLevel !== this.level) {
        this.level = newLevel;
        this.spawnRate = Math.max(25, 60 - this.level * 5);
        console.log(`📈 Level ${this.level}! Spawn rate: ${this.spawnRate}`);
      }
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, GROUND_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_LEVEL);

    // Draw player
    this.player.draw(this.ctx);

    // Draw obstacles
    this.obstacles.forEach((obstacle) => {
      obstacle.draw(this.ctx);
    });

    // Draw UI
    this.drawUI();

    // Draw pause overlay
    if (this.paused) {
      this.drawPauseOverlay();
    }

    // Draw game over overlay
    if (this.gameOver) {
      this.drawGameOverOverlay();
    }
  }

  drawUI() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, 60);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 35);
    this.ctx.fillText(`Lives: ${this.lives}`, 250, 35);
    this.ctx.fillText(`Level: ${this.level}`, 450, 35);
  }

  drawPauseOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 60px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press Space or P to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    this.ctx.textAlign = 'left';
  }

  drawGameOverOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = 'rgba(66, 20, 173, 0.82)';
    this.ctx.font = 'bold 60px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    this.ctx.fillStyle = '#68159fdd';
    this.ctx.font = 'bold 30px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press Space to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    this.ctx.textAlign = 'left';
  }

  gameLoop = () => {
    this.update();
    this.draw();

    // Update DOM elements
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('level').textContent = this.level;

    requestAnimationFrame(this.gameLoop);
  };
}

// ============================================================================
// INITIALIZE GAME
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const gamePanel = document.getElementById('gamePanel');
const fullscreenButton = document.getElementById('fullscreenButton');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const game = new Game(canvas);

function resizeCanvasDisplay() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (document.fullscreenElement === gamePanel) {
    const viewportRatio = viewportWidth / viewportHeight;

    if (viewportRatio > CANVAS_ASPECT_RATIO) {
      canvas.style.height = '100vh';
      canvas.style.width = `${Math.floor(viewportHeight * CANVAS_ASPECT_RATIO)}px`;
    } else {
      canvas.style.width = '100vw';
      canvas.style.height = `${Math.floor(viewportWidth / CANVAS_ASPECT_RATIO)}px`;
    }

    return;
  }

  canvas.style.width = '';
  canvas.style.height = '';
}

async function toggleFullscreen() {
  if (document.fullscreenElement === gamePanel) {
    await document.exitFullscreen();
    return;
  }

  await gamePanel.requestFullscreen();
}

function updateFullscreenButton() {
  fullscreenButton.textContent =
    document.fullscreenElement === gamePanel ? 'Exit Full Screen' : 'Full Screen';
  resizeCanvasDisplay();
}

fullscreenButton.addEventListener('click', () => {
  toggleFullscreen().catch((error) => {
    console.error('Fullscreen failed:', error);
  });
});

document.addEventListener('fullscreenchange', updateFullscreenButton);
window.addEventListener('resize', resizeCanvasDisplay);
updateFullscreenButton();

console.log('🎮 Game Started!');
console.log('Controls:');
console.log('  Arrow Keys or A/D - Move');
console.log('  W - Jump');
console.log('  Space or P - Pause/Resume');
