const {
  detectCollision,
  clamp,
  distance,
  randomInt,
  toRadians,
  toDegrees,
} = require('../src/utils');

describe('Game Utilities', () => {
  describe('detectCollision', () => {
    test('should detect collision when rectangles overlap', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 25, y: 25, width: 50, height: 50 };
      expect(detectCollision(rect1, rect2)).toBe(true);
    });

    test('should not detect collision when rectangles do not overlap', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 100, y: 100, width: 50, height: 50 };
      expect(detectCollision(rect1, rect2)).toBe(false);
    });

    test('should detect collision when rectangles touch', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 50, y: 0, width: 50, height: 50 };
      expect(detectCollision(rect1, rect2)).toBe(false);
    });
  });

  describe('clamp', () => {
    test('should clamp value to min when below range', () => {
      expect(clamp(5, 10, 20)).toBe(10);
    });

    test('should clamp value to max when above range', () => {
      expect(clamp(25, 10, 20)).toBe(20);
    });

    test('should return value when within range', () => {
      expect(clamp(15, 10, 20)).toBe(15);
    });

    test('should handle negative values', () => {
      expect(clamp(-5, -10, 10)).toBe(-5);
      expect(clamp(-15, -10, 10)).toBe(-10);
    });
  });

  describe('distance', () => {
    test('should calculate distance between two points', () => {
      expect(distance(0, 0, 3, 4)).toBe(5);
    });

    test('should return 0 for same point', () => {
      expect(distance(5, 5, 5, 5)).toBe(0);
    });

    test('should work with negative coordinates', () => {
      const result = distance(-3, -4, 0, 0);
      expect(result).toBeCloseTo(5);
    });
  });

  describe('randomInt', () => {
    test('should return value within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    test('should return same value when min equals max', () => {
      expect(randomInt(5, 5)).toBe(5);
    });
  });

  describe('toRadians', () => {
    test('should convert degrees to radians', () => {
      expect(toRadians(180)).toBeCloseTo(Math.PI);
      expect(toRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(toRadians(0)).toBe(0);
    });
  });

  describe('toDegrees', () => {
    test('should convert radians to degrees', () => {
      expect(toDegrees(Math.PI)).toBeCloseTo(180);
      expect(toDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(toDegrees(0)).toBe(0);
    });
  });
});
