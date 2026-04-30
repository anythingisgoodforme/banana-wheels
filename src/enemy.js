/**
 * Enemy Class for Game Development
 *
 * This file demonstrates how to create enemy objects with different behaviors.
 * You can extend this class to create different enemy types.
 */

class Enemy {
  /**
   * Create a new Enemy
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {number} width - Enemy width
   * @param {number} height - Enemy height
   * @param {number} speed - Movement speed
   */
  constructor(x, y, width = 50, height = 50, speed = 2) {
    // Position
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Movement
    this.velocityX = -speed;
    this.velocityY = 0;
    this.speed = speed;
    this.direction = -1; // -1 = left, 1 = right

    // State
    this.alive = true;
    this.health = 1;
    this.type = 'basic';

    // Appearance
    this.color = '#FFD700';
    this.rotation = 0;

    // Behavior
    this.patrolDistance = 0;
    this.patrolLimit = 200;
    this.patrolStart = x;
  }

  /**
   * Update enemy position and behavior
   */
  update() {
    // Move
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Patrol behavior
    this.updatePatrol();

    // Update rotation for visual effect
    this.rotation += 0.1;
  }

  /**
   * Patrol logic - move back and forth
   */
  updatePatrol() {
    this.patrolDistance = Math.abs(this.x - this.patrolStart);

    if (this.patrolDistance > this.patrolLimit) {
      this.direction *= -1;
      this.velocityX = -this.speed * this.direction;
    }
  }

  /**
   * Apply velocity to all directions
   * @param {number} deltaTime - Time since last frame
   */
  applyPhysics(deltaTime = 1) {
    this.velocity += (Math.random() - 0.5) * 0.1;
  }

  /**
   * Check if enemy is off screen (to the left)
   * @returns {boolean} - True if off screen
   */
  isOffScreen() {
    return this.x + this.width < 0;
  }

  /**
   * Take damage and potentially die
   * @param {number} damage - Amount of damage
   */
  takeDamage(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      this.die();
    }
  }

  /**
   * Kill the enemy
   */
  die() {
    this.alive = false;
    console.log(`${this.type} enemy defeated!`);
  }

  /**
   * Draw enemy on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    ctx.save();

    // Translate to center for rotation
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.translate(-this.width / 2, -this.height / 2);

    // Draw enemy body
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw enemy shape (circle in the middle)
    ctx.fillStyle = '#FFB700';
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Get bounding box for collision detection
   * @returns {Object} - Rectangle with x, y, width, height
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Check collision with another object
   * @param {Object} other - Other object with getBounds()
   * @returns {boolean} - True if colliding
   */
  collidesWith(other) {
    const myBounds = this.getBounds();
    const theirBounds = other.getBounds();

    return (
      myBounds.x < theirBounds.x + theirBounds.width &&
      myBounds.x + myBounds.width > theirBounds.x &&
      myBounds.y < theirBounds.y + theirBounds.height &&
      myBounds.y + myBounds.height > theirBounds.y
    );
  }

  /**
   * Reset enemy state
   * @param {number} newX - New X position
   * @param {number} newY - New Y position
   */
  reset(newX, newY) {
    this.x = newX;
    this.y = newY;
    this.alive = true;
    this.health = 1;
    this.rotation = 0;
  }

  /**
   * Get distance to another object
   * @param {Object} other - Other object
   * @returns {number} - Distance in pixels
   */
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * FlyingEnemy - Moves in a wave pattern
 */
class FlyingEnemy extends Enemy {
  constructor(x, y, speed = 3) {
    super(x, y, 40, 40, speed);
    this.type = 'flying';
    this.color = '#FF6B9D';
    this.waveOffset = 0;
    this.baseY = y;
  }

  update() {
    // Move horizontally
    this.x += this.velocityX;

    // Move vertically in a wave pattern
    this.waveOffset += 0.05;
    this.y = this.baseY + Math.sin(this.waveOffset) * 30;

    // Update rotation
    this.rotation += 0.15;
  }
}

/**
 * FastEnemy - Moves quickly for short distance
 */
class FastEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 35, 35, 4);
    this.type = 'fast';
    this.color = '#FF1493';
  }
}

/**
 * BossEnemy - Larger, stronger enemy
 */
class BossEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 80, 80, 1);
    this.type = 'boss';
    this.color = '#FF4500';
    this.health = 5;
    this.shootTimer = 0;
  }

  update() {
    super.update();
    this.shootTimer++;

    if (this.shootTimer > 60) {
      // Shoot every 60 frames
      this.shoot();
      this.shootTimer = 0;
    }
  }

  shoot() {
    console.log('Boss shoots!');
    // TODO: Implement bullet spawning
  }

  draw(ctx) {
    ctx.save();

    // Draw larger body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 15, this.y + 15, 15, 15);
    ctx.fillRect(this.x + 50, this.y + 15, 15, 15);

    // Draw health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y - 10, this.width, 5);

    ctx.fillStyle = 'green';
    const healthPercent = this.health / 5;
    ctx.fillRect(this.x, this.y - 10, this.width * healthPercent, 5);

    ctx.restore();
  }
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Enemy,
    FlyingEnemy,
    FastEnemy,
    BossEnemy,
  };
}
