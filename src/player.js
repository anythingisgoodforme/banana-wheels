/**
 * Player Class for Game Development
 *
 * This file demonstrates best practices for creating a reusable Player class.
 * You can expand this class to add more features like health, weapons, etc.
 */

class Player {
  /**
   * Create a new Player
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {number} width - Player width
   * @param {number} height - Player height
   */
  constructor(x, y, width = 40, height = 40) {
    // Position
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Movement
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpPower = 15;

    // State
    this.isJumping = false;
    this.isFalling = false;
    this.isDead = false;

    // Appearance
    this.color = '#FF6B6B';
    this.scale = 1;
  }

  /**
   * Update player position and state
   * Called every frame
   */
  update(deltaTime = 1) {
    // Apply velocity
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  /**
   * Move player left
   */
  moveLeft() {
    this.velocityX = -this.speed;
  }

  /**
   * Move player right
   */
  moveRight() {
    this.velocityX = this.speed;
  }

  /**
   * Stop horizontal movement
   */
  stopMovement() {
    this.velocityX = 0;
  }

  /**
   * Make player jump
   */
  jump() {
    if (!this.isJumping) {
      this.velocityY = -this.jumpPower;
      this.isJumping = true;
    }
  }

  /**
   * Apply gravity to player
   * @param {number} gravityStrength - Gravity force
   */
  applyGravity(gravityStrength = 0.5) {
    this.velocityY += gravityStrength;
  }

  /**
   * Check if player is on ground
   * @param {number} groundLevel - Y position of ground
   * @returns {boolean} - True if on ground
   */
  isOnGround(groundLevel) {
    return this.y + this.height >= groundLevel;
  }

  /**
   * Land on ground (reset jump state)
   * @param {number} groundLevel - Y position of ground
   */
  land(groundLevel) {
    this.y = groundLevel - this.height;
    this.velocityY = 0;
    this.isJumping = false;
    this.isFalling = false;
  }

  /**
   * Keep player within bounds
   * @param {number} minX - Left boundary
   * @param {number} maxX - Right boundary
   */
  keepInBounds(minX, maxX) {
    if (this.x < minX) this.x = minX;
    if (this.x + this.width > maxX) this.x = maxX - this.width;
  }

  /**
   * Draw player on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Save context state
    ctx.save();

    // Translate to player position (for scaling/rotation)
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.width / 2, -this.height / 2);

    // Draw player body
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillRect(24, 8, 8, 8);

    // Draw pupils
    ctx.fillStyle = 'black';
    ctx.fillRect(10, 10, 4, 4);
    ctx.fillRect(26, 10, 4, 4);

    // Restore context state
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
   * Kill the player
   */
  die() {
    this.isDead = true;
    console.log('Player died!');
  }

  /**
   * Reset player to starting position
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   */
  reset(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isDead = false;
  }

  /**
   * Get player data for saving
   * @returns {Object} - Player state
   */
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      speed: this.speed,
      jumpPower: this.jumpPower,
      color: this.color,
    };
  }
}

// Export for use in other modules/tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Player;
}
