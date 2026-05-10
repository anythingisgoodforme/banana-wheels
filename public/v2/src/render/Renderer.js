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

    ctx.fillStyle = 'rgba(255, 235, 145, 0.82)';
    ctx.beginPath();
    ctx.arc(WIDTH - 155, 84, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(33, 95, 75, 0.32)';
    ctx.beginPath();
    ctx.moveTo(-80, 250);
    ctx.bezierCurveTo(120, 170, 235, 214, 390, 164);
    ctx.bezierCurveTo(545, 116, 720, 194, WIDTH + 80, 142);
    ctx.lineTo(WIDTH + 80, 302);
    ctx.lineTo(-80, 302);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = biome.verge;
    ctx.fillRect(-80, 250, WIDTH + 160, HEIGHT);

    for (let i = 0; i < 12; i += 1) {
      const x = ((i * 120 - ((run.distance * 0.45) % 120)) % (WIDTH + 160)) - 80;
      const treeGradient = ctx.createLinearGradient(x, 170, x, 330);
      treeGradient.addColorStop(0, i % 2 ? '#3fb77a' : '#59d084');
      treeGradient.addColorStop(0.65, i % 2 ? '#1d734b' : '#2fa568');
      treeGradient.addColorStop(1, '#135438');
      ctx.fillStyle = treeGradient;
      ctx.beginPath();
      ctx.ellipse(x, 248 + Math.sin(i) * 18, 92, 80, 0, Math.PI, 0);
      ctx.fill();
    }

    for (let y = 250; y < HEIGHT; y += 3) {
      const p = (y - 250) / (HEIGHT - 250);
      const width = 130 + p * p * 680;
      const center = WIDTH / 2 + Math.sin(run.distance * 0.018 + p * 2.1) * 58 * (1 - p);

      const shade = Math.floor(34 + p * 42);
      ctx.fillStyle = `rgb(${shade + 34}, ${shade + 30}, ${shade + 26})`;
      ctx.fillRect(center - width / 2, y, width, 3);

      ctx.fillStyle = `rgba(255,255,255,${0.04 + p * 0.08})`;
      ctx.fillRect(center - width * 0.18, y, width * 0.36, 3);

      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(center - width / 2, y, Math.max(2, width * 0.025), 3);
      ctx.fillRect(
        center + width / 2 - Math.max(2, width * 0.025),
        y,
        Math.max(2, width * 0.025),
        3
      );

      if (Math.floor((p * 60 + run.distance * 0.8) % 10) < 5) {
        ctx.fillStyle = 'rgba(255,255,255,0.58)';
        LANES.slice(0, 2).forEach((_, index) => {
          const lx = center + (index === 0 ? -0.18 : 0.18) * width;
          ctx.fillRect(lx - 2, y, 4, 3);
        });
      }
    }

    const haze = ctx.createLinearGradient(0, 210, 0, 380);
    haze.addColorStop(0, 'rgba(237, 248, 244, 0.42)');
    haze.addColorStop(1, 'rgba(237, 248, 244, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(-80, 210, WIDTH + 160, 180);
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
        if (entity.type === 'spring') this.drawSpring(ctx, projected, entity);
        if (entity.type === 'obstacle') this.drawHazard(ctx, projected, entity, biome);
      });
  }

  drawBanana(ctx, projected, value) {
    const size = 12 * projected.scale * (value > 1 ? 1.25 : 1);
    ctx.save();
    ctx.translate(projected.x, projected.y - size);
    ctx.rotate(-0.48);

    ctx.fillStyle = 'rgba(20, 18, 8, 0.24)';
    ctx.beginPath();
    ctx.ellipse(size * 0.1, size * 0.72, size * 1.35, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    const bananaGradient = ctx.createLinearGradient(
      -size * 1.35,
      -size * 0.55,
      size * 1.35,
      size * 0.7
    );
    bananaGradient.addColorStop(0, '#b96d17');
    bananaGradient.addColorStop(0.12, '#f0b92f');
    bananaGradient.addColorStop(0.34, '#ffe77a');
    bananaGradient.addColorStop(0.62, '#ffd84d');
    bananaGradient.addColorStop(0.86, '#d8951f');
    bananaGradient.addColorStop(1, '#7d4c15');
    ctx.fillStyle = bananaGradient;
    ctx.beginPath();
    ctx.moveTo(-size * 1.45, size * 0.1);
    ctx.bezierCurveTo(
      -size * 0.82,
      -size * 0.82,
      size * 0.52,
      -size * 0.82,
      size * 1.46,
      -size * 0.16
    );
    ctx.bezierCurveTo(
      size * 0.82,
      size * 0.62,
      -size * 0.46,
      size * 0.74,
      -size * 1.45,
      size * 0.1
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(104, 68, 17, 0.78)';
    ctx.lineWidth = Math.max(1.4, size * 0.12);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 249, 188, 0.82)';
    ctx.lineWidth = Math.max(1.2, size * 0.11);
    ctx.beginPath();
    ctx.moveTo(-size * 0.95, -size * 0.08);
    ctx.bezierCurveTo(
      -size * 0.36,
      -size * 0.46,
      size * 0.42,
      -size * 0.46,
      size * 0.92,
      -size * 0.16
    );
    ctx.stroke();

    ctx.strokeStyle = 'rgba(139, 89, 18, 0.45)';
    ctx.lineWidth = Math.max(1, size * 0.08);
    ctx.beginPath();
    ctx.moveTo(-size * 0.78, size * 0.18);
    ctx.bezierCurveTo(
      -size * 0.22,
      size * 0.38,
      size * 0.42,
      size * 0.34,
      size * 0.96,
      size * 0.04
    );
    ctx.stroke();

    ctx.fillStyle = '#7a5420';
    ctx.beginPath();
    ctx.roundRect(size * 1.25, -size * 0.32, size * 0.36, size * 0.28, size * 0.08);
    ctx.fill();

    ctx.fillStyle = '#5b3712';
    ctx.beginPath();
    ctx.roundRect(-size * 1.56, size * 0.01, size * 0.34, size * 0.24, size * 0.08);
    ctx.fill();
    ctx.restore();
  }

  drawSpring(ctx, projected, entity) {
    const size = 20 * projected.scale;
    const compression = entity.used ? 0.62 : 1;
    const coilHeight = size * 1.55 * compression;
    const baseGradient = ctx.createLinearGradient(0, -size * 0.2, 0, size * 0.55);
    baseGradient.addColorStop(0, '#f35f4a');
    baseGradient.addColorStop(0.58, '#9f2c26');
    baseGradient.addColorStop(1, '#571616');

    ctx.save();
    ctx.translate(projected.x, projected.y - size * 0.2);

    ctx.fillStyle = 'rgba(11, 16, 20, 0.32)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.65, size * 1.55, size * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.roundRect(-size * 1.25, size * 0.24, size * 2.5, size * 0.52, size * 0.12);
    ctx.fill();

    ctx.fillStyle = '#ffcf56';
    ctx.beginPath();
    ctx.roundRect(-size * 0.78, -coilHeight - size * 0.18, size * 1.56, size * 0.36, size * 0.1);
    ctx.fill();

    const metalGradient = ctx.createLinearGradient(-size, -coilHeight, size, size * 0.1);
    metalGradient.addColorStop(0, '#56636c');
    metalGradient.addColorStop(0.22, '#eef6fa');
    metalGradient.addColorStop(0.5, '#8a979f');
    metalGradient.addColorStop(0.78, '#ffffff');
    metalGradient.addColorStop(1, '#48545d');

    ctx.strokeStyle = metalGradient;
    ctx.lineWidth = Math.max(3, size * 0.18);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 34; i += 1) {
      const t = i / 34;
      const angle = t * Math.PI * 8.5;
      const x = Math.sin(angle) * size * 0.72;
      const y = size * 0.16 - t * coilHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.lineWidth = Math.max(1.2, size * 0.055);
    ctx.beginPath();
    for (let i = 2; i <= 30; i += 4) {
      const t = i / 34;
      const angle = t * Math.PI * 8.5;
      ctx.moveTo(Math.sin(angle) * size * 0.72, size * 0.16 - t * coilHeight);
      ctx.lineTo(Math.sin(angle + 0.42) * size * 0.72, size * 0.16 - (t + 0.04) * coilHeight);
    }
    ctx.stroke();

    ctx.restore();
  }

  drawHazard(ctx, projected, entity, biome) {
    const size = 22 * projected.scale;
    ctx.save();
    ctx.translate(projected.x, projected.y - size * 0.6);

    ctx.fillStyle = `rgba(8, 10, 12, ${0.18 + projected.p * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(0, size * 1.1, size * 1.35, size * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    if (entity.kind === 'oil' || entity.kind === 'peel') {
      const slickGradient = ctx.createRadialGradient(
        -size * 0.3,
        size * 0.26,
        size * 0.1,
        0,
        size * 0.45,
        size * 1.3
      );
      slickGradient.addColorStop(0, entity.kind === 'peel' ? '#fff39b' : '#5b6470');
      slickGradient.addColorStop(0.52, entity.kind === 'peel' ? '#ffd84d' : '#17202a');
      slickGradient.addColorStop(1, entity.kind === 'peel' ? '#a66a12' : '#030608');
      ctx.fillStyle = slickGradient;
      ctx.beginPath();
      ctx.ellipse(0, size * 0.45, size * 1.25, size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.42)';
      ctx.lineWidth = Math.max(1, size * 0.06);
      ctx.beginPath();
      ctx.ellipse(-size * 0.22, size * 0.32, size * 0.42, size * 0.1, -0.18, 0, Math.PI * 1.4);
      ctx.stroke();
    } else {
      const boxGradient = ctx.createLinearGradient(-size, -size, size, size * 0.7);
      boxGradient.addColorStop(0, entity.hit ? '#2d2d2d' : '#f0a05b');
      boxGradient.addColorStop(0.45, entity.hit ? '#222' : biome.hazard);
      boxGradient.addColorStop(1, entity.hit ? '#111' : '#5b2b1d');
      ctx.fillStyle = boxGradient;
      ctx.beginPath();
      ctx.roundRect(-size, -size, size * 2, size * 1.7, Math.max(4, size * 0.18));
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.26)';
      ctx.beginPath();
      ctx.moveTo(-size * 0.82, -size * 0.78);
      ctx.lineTo(size * 0.68, -size * 0.78);
      ctx.lineTo(size * 0.42, -size * 0.42);
      ctx.lineTo(-size * 0.96, -size * 0.42);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.fillRect(size * 0.48, -size * 0.42, size * 0.28, size * 1.12);

      ctx.strokeStyle = 'rgba(50, 26, 16, 0.65)';
      ctx.lineWidth = Math.max(1, size * 0.06);
      ctx.strokeRect(-size * 0.78, -size * 0.62, size * 1.5, size * 1.08);
    }
    ctx.restore();
  }

  drawVehicle(ctx, player) {
    const x = WIDTH / 2 + player.x * 128;
    const jumpArc = Math.sin((player.airTime / 0.95) * Math.PI);
    const y = HEIGHT - 24 - jumpArc * 96;
    ctx.save();

    if (player.airTime > 0) {
      ctx.fillStyle = `rgba(5, 8, 12, ${0.22 - jumpArc * 0.11})`;
      ctx.beginPath();
      ctx.ellipse(
        WIDTH / 2 + player.x * 128,
        HEIGHT - 4,
        150 - jumpArc * 36,
        18,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.translate(x, y);
    ctx.rotate(player.lean * 0.12);

    const cockpitGradient = ctx.createLinearGradient(0, -90, 0, 42);
    cockpitGradient.addColorStop(0, '#303a47');
    cockpitGradient.addColorStop(0.48, '#141b24');
    cockpitGradient.addColorStop(1, '#080b10');
    ctx.fillStyle = cockpitGradient;
    ctx.beginPath();
    ctx.moveTo(-210, 34);
    ctx.lineTo(-92, -72);
    ctx.lineTo(92, -72);
    ctx.lineTo(210, 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(-118, -58);
    ctx.lineTo(118, -58);
    ctx.lineTo(78, -26);
    ctx.lineTo(-78, -26);
    ctx.closePath();
    ctx.fill();

    const hoodGradient = ctx.createLinearGradient(0, -78, 0, 48);
    hoodGradient.addColorStop(0, '#fff49a');
    hoodGradient.addColorStop(0.32, '#ffd84d');
    hoodGradient.addColorStop(0.72, '#d9951a');
    hoodGradient.addColorStop(1, '#8f5311');
    ctx.fillStyle = hoodGradient;
    ctx.beginPath();
    ctx.moveTo(-112, 34);
    ctx.quadraticCurveTo(-70, -54, 0, -64);
    ctx.quadraticCurveTo(70, -54, 112, 34);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.36)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-56, 10);
    ctx.quadraticCurveTo(-32, -36, 0, -44);
    ctx.quadraticCurveTo(32, -36, 56, 10);
    ctx.stroke();

    ctx.strokeStyle = '#0e131a';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(0, 18, 96, Math.PI, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#2f3844';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 18, 74, Math.PI, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#10161d';
    ctx.beginPath();
    ctx.ellipse(-116, 30, 34, 18, -0.2, 0, Math.PI * 2);
    ctx.ellipse(116, 30, 34, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd84d';
    ctx.beginPath();
    ctx.ellipse(-116, 30, 21, 11, -0.2, 0, Math.PI * 2);
    ctx.ellipse(116, 30, 21, 11, 0.2, 0, Math.PI * 2);
    ctx.fill();

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
