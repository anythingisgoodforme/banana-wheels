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

  // Pause on 'P'
  if (e.key.toLowerCase() === 'p') {
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
    if ((keys[' '] || keys['w']) && !this.isJumping) {
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
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw banana shape indicator
    ctx.fillStyle = '#FFB700';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 15, 0, Math.PI * 2);
    ctx.fill();
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
    this.spawnRate = 100;
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

  spawn() {
    if (this.gameTime % this.spawnRate === 0) {
      const obstacle = new Obstacle(
        CANVAS_WIDTH,
        GROUND_LEVEL - OBSTACLE_HEIGHT,
        2 + this.level * 0.5
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
        this.score += 10;
        return false;
      }

      return true;
    });

    // Increase difficulty
    if (this.score > 0 && this.score % 100 === 0) {
      const newLevel = Math.floor(this.score / 100) + 1;
      if (newLevel !== this.level) {
        this.level = newLevel;
        this.spawnRate = Math.max(40, 100 - this.level * 10);
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
    this.ctx.fillText('Press P to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    this.ctx.textAlign = 'left';
  }

  drawGameOverOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = 'bold 60px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 30px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    this.ctx.font = '20px Arial';
    this.ctx.fillText('Refresh page to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
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
const game = new Game(canvas);

console.log('🎮 Game Started!');
console.log('Controls:');
console.log('  Arrow Keys or A/D - Move');
console.log('  Space or W - Jump');
console.log('  P - Pause/Resume');
