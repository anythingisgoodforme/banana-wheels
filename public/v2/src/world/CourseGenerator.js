import { Random } from '../core/random.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Pickup } from '../entities/Pickup.js';
import { COURSE_AHEAD } from '../game/constants.js';
import { BIOMES } from './biomes.js';
import { OBSTACLE_KINDS, PATTERNS } from './obstaclePatterns.js';

export class CourseGenerator {
  constructor(seed) {
    this.random = new Random(seed);
    this.nextZ = 22;
  }

  reset(seed) {
    this.random = new Random(seed);
    this.nextZ = 22;
  }

  fill(entities, distance) {
    while (this.nextZ < distance + COURSE_AHEAD) {
      const difficulty = Math.min(7, 1 + distance / 220);
      const biome = BIOMES[Math.floor((distance / 180) % BIOMES.length)];
      const affordable = PATTERNS.filter(
        (pattern) => pattern.cost <= difficulty + this.random.range(0, 1.4)
      );
      const pattern = this.random.choice(affordable);
      const kind = this.random.choice(OBSTACLE_KINDS);

      pattern.blocked.forEach((laneIndex) => {
        entities.push(new Obstacle({ laneIndex, z: this.nextZ, kind, biome }));
      });

      const open = [0, 1, 2].filter((laneIndex) => !pattern.blocked.includes(laneIndex));
      const pickupLane = this.random.choice(open);
      entities.push(
        new Pickup({ laneIndex: pickupLane, z: this.nextZ - this.random.range(3, 8), value: 1 })
      );

      if (this.random.next() > 0.62) {
        entities.push(
          new Pickup({
            laneIndex: this.random.int(0, 2),
            z: this.nextZ + this.random.range(4, 9),
            value: 2,
          })
        );
      }

      this.nextZ += Math.max(9, 17 - difficulty + this.random.range(-1.4, 3.2));
    }
  }
}
