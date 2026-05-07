import { HEIGHT, LANES, WIDTH } from '../game/constants.js';
import { BIOMES } from '../world/biomes.js';

export class Renderer {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = camera;
  }

  render(run, save) {
    const ctx = this.ctx;
    const biome = BIOMES[Math.floor((run.distance / 180) % BIOMES.length)];
    const shake = save.options.reducedMotion ? 0 : this.camera.shake;
    const ox = this.camera.look + (Math.random() - 0.5) * shake;
    const oy = (Math.random() - 0.5) * shake * 0.35;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.translate(ox, oy);
    this.drawWorld(ctx, biome, run);
    this.drawEntities(ctx, biome, run);
    this.drawVehicle(ctx, run.player);
    ctx.restore();
    this.drawParticles(ctx, run.particles);
    this.drawVignette(ctx);
  }

  drawWorld(ctx, biome, run) {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, biome.sky);
    sky.addColorStop(1, '#edf8f4');
    ctx.fillStyle = sky;
    ctx.fillRect(-80, 0, WIDTH + 160, HEIGHT);

    ctx.fillStyle = biome.verge;
    ctx.fillRect(-80, 250, WIDTH + 160, HEIGHT);

    for (let i = 0; i < 12; i += 1) {
      const x = ((i * 120 - ((run.distance * 0.45) % 120)) % (WIDTH + 160)) - 80;
      ctx.fillStyle = i % 2 ? '#1d734b' : '#2fa568';
      ctx.beginPath();
      ctx.ellipse(x, 248 + Math.sin(i) * 18, 92, 80, 0, Math.PI, 0);
      ctx.fill();
    }

    for (let y = 250; y < HEIGHT; y += 3) {
      const p = (y - 250) / (HEIGHT - 250);
      const width = 130 + p * p * 680;
      const center = WIDTH / 2 + Math.sin(run.distance * 0.018 + p * 2.1) * 58 * (1 - p);
      ctx.fillStyle = biome.road;
      ctx.fillRect(center - width / 2, y, width, 3);

      if (Math.floor((p * 60 + run.distance * 0.8) % 10) < 5) {
        ctx.fillStyle = 'rgba(255,255,255,0.58)';
        LANES.slice(0, 2).forEach((_, index) => {
          const lx = center + (index === 0 ? -0.18 : 0.18) * width;
          ctx.fillRect(lx - 2, y, 4, 3);
        });
      }
    }
  }

  project(z, laneIndex, distance) {
    const relative = z - distance;
    const depth = 1 - relative / 130;
    if (depth <= 0 || depth > 1.08) return null;
    const p = depth * depth;
    const y = 250 + p * (HEIGHT - 250);
    const roadWidth = 130 + p * p * 680;
    const center = WIDTH / 2 + Math.sin(distance * 0.018 + p * 2.1) * 58 * (1 - p);
    const x = center + LANES[laneIndex] * roadWidth * 0.28;
    return { x, y, scale: 0.4 + p * 2.6, p };
  }

  drawEntities(ctx, biome, run) {
    run.entities
      .map((entity) => ({
        entity,
        projected: this.project(entity.z, entity.laneIndex, run.distance),
      }))
      .filter((entry) => entry.projected)
      .sort((a, b) => a.entity.z - b.entity.z)
      .forEach(({ entity, projected }) => {
        if (entity.type === 'pickup') this.drawBanana(ctx, projected, entity.value);
        if (entity.type === 'obstacle') this.drawHazard(ctx, projected, entity, biome);
      });
  }

  drawBanana(ctx, projected, value) {
    const size = 12 * projected.scale * (value > 1 ? 1.25 : 1);
    ctx.save();
    ctx.translate(projected.x, projected.y - size);
    ctx.rotate(-0.55);
    ctx.fillStyle = '#ffd84d';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.4, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5420';
    ctx.fillRect(size * 0.9, -size * 0.16, size * 0.35, size * 0.28);
    ctx.restore();
  }

  drawHazard(ctx, projected, entity, biome) {
    const size = 22 * projected.scale;
    ctx.save();
    ctx.translate(projected.x, projected.y - size * 0.6);
    ctx.fillStyle = entity.hit ? '#222' : biome.hazard;
    if (entity.kind === 'oil' || entity.kind === 'peel') {
      ctx.beginPath();
      ctx.ellipse(0, size * 0.45, size * 1.25, size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = entity.kind === 'peel' ? '#ffd84d' : '#111820';
      ctx.fillRect(-size * 0.5, size * 0.15, size, size * 0.25);
    } else {
      ctx.beginPath();
      ctx.roundRect(-size, -size, size * 2, size * 1.7, Math.max(4, size * 0.18));
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(-size * 0.55, -size * 0.7, size * 0.4, size * 1.1);
    }
    ctx.restore();
  }

  drawVehicle(ctx, player) {
    const x = WIDTH / 2 + player.x * 128;
    const y = HEIGHT - 24;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.lean * 0.12);
    ctx.fillStyle = '#141b24';
    ctx.beginPath();
    ctx.moveTo(-210, 34);
    ctx.lineTo(-92, -72);
    ctx.lineTo(92, -72);
    ctx.lineTo(210, 34);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd84d';
    ctx.beginPath();
    ctx.moveTo(-112, 34);
    ctx.quadraticCurveTo(-70, -54, 0, -64);
    ctx.quadraticCurveTo(70, -54, 112, 34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0e131a';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(0, 18, 96, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(ctx, particles) {
    particles.forEach((particle) => {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  drawVignette(ctx) {
    const gradient = ctx.createRadialGradient(
      WIDTH / 2,
      HEIGHT / 2,
      140,
      WIDTH / 2,
      HEIGHT / 2,
      560
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.34)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}
