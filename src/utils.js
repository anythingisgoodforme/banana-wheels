/**
 * Helper utilities for game development
 *
 * This file contains common utility functions used in games
 */

/**
 * Detects collision between two rectangles
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} - True if rectangles overlap
 */
function detectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Clamps a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} - Distance between points
 */
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Gets a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} - Angle in degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

// Export functions for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectCollision,
    clamp,
    distance,
    randomInt,
    toRadians,
    toDegrees,
  };
}
