import { AudioEngine } from '../core/audio.js';
import { Random } from '../core/random.js';
import { COLLISION_Z, MAX_DAMAGE, BASE_SPEED, BOOST_COST, BOOST_GAIN } from './constants.js';
import { Player } from '../entities/Player.js';
import { Particle } from '../entities/Particle.js';
import { CourseGenerator } from '../world/CourseGenerator.js';
import { Scoring } from '../systems/scoring.js';

export class RunController {
  constructor(save) {
    this.save = save;
    this.audio = new AudioEngine(save);
    this.scoring = new Scoring();
    this.player = new Player(save);
    this.entities = [];
    this.particles = [];
    this.distance = 0;
    this.seed = 0;
    this.generator = new CourseGenerator(0);
    this.complete = false;
    this.random = new Random(0);
  }

  start(seed = Date.now()) {
    this.seed = seed >>> 0;
    this.generator.reset(this.seed);
    this.random = new Random(this.seed ^ 0x9e3779b9);
    this.player.reset();
    this.scoring.reset();
    this.entities = [];
    this.particles = [];
    this.distance = 0;
    this.complete = false;
    this.generator.fill(this.entities, this.distance);
  }

  update(dt, input) {
    if (input.leftTap) this.player.shift(-1);
    if (input.rightTap) this.player.shift(1);

    const boosting = input.boostHeld && this.player.boost > 0;
    if (boosting) {
      this.player.boost = Math.max(0, this.player.boost - BOOST_COST * dt);
    } else {
      this.player.boost = Math.min(100, this.player.boost + BOOST_GAIN * dt * 0.22);
    }

    const targetSpeed = BASE_SPEED + Math.min(18, this.distance / 40) + (boosting ? 12 : 0);
    this.player.update(dt, targetSpeed);
    const distanceGain = this.player.speed * dt;
    this.distance += distanceGain;
    this.scoring.update(dt, distanceGain, boosting);

    this.generator.fill(this.entities, this.distance);
    this.updateEntities(dt);
    this.updateParticles(dt);

    if (boosting && Math.random() < 0.35) {
      this.spawnParticles(480 + this.player.x * 110, 570, '#54c6d6', 1);
    }
  }

  updateEntities(dt) {
    const playerLane = this.player.laneIndex;
    const remaining = [];

    for (const entity of this.entities) {
      const relative = entity.z - this.distance;
      if (relative < -12) continue;

      if (
        !entity.hit &&
        !entity.collected &&
        Math.abs(relative) <= COLLISION_Z &&
        entity.laneIndex === playerLane
      ) {
        if (entity.type === 'pickup') {
          entity.collected = true;
          this.player.boost = Math.min(100, this.player.boost + 8 * entity.value);
          this.scoring.pickup(entity.value);
          this.audio.pickup();
          this.spawnParticles(480 + this.player.x * 110, 450, '#ffd84d', 8);
          continue;
        }

        if (entity.type === 'obstacle' && this.player.invulnerable <= 0) {
          entity.hit = true;
          this.player.damage += 1;
          this.player.speed *= 0.44;
          this.player.invulnerable = 0.8;
          this.scoring.crash();
          this.audio.crash();
          this.spawnParticles(480 + this.player.x * 110, 475, '#f25f4c', 14);
          if (this.player.damage >= MAX_DAMAGE) this.complete = true;
        }
      } else if (
        entity.type === 'obstacle' &&
        !entity.hit &&
        relative < -COLLISION_Z &&
        relative > -COLLISION_Z - this.player.speed * dt &&
        Math.abs(entity.laneIndex - playerLane) === 1
      ) {
        this.scoring.nearMiss();
        this.audio.combo();
      }

      remaining.push(entity);
    }

    this.entities = remaining;
  }

  updateParticles(dt) {
    this.particles.forEach((particle) => particle.update(dt));
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push(
        new Particle({
          x,
          y,
          vx: this.random.range(-120, 120),
          vy: this.random.range(-220, -60),
          color,
          life: this.random.range(0.25, 0.55),
          size: this.random.range(3, 8),
        })
      );
    }
  }

  summary() {
    return {
      score: Math.floor(this.scoring.score),
      distance: Math.floor(this.distance),
      bananas: this.scoring.bananas,
      bestCombo: this.scoring.bestCombo,
    };
  }
}
