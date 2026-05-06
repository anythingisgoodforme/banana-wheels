const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CANVAS_ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
const HORIZON_Y = 170;
const ROAD_BOTTOM_Y = 560;
const TRACK_LENGTH = 18;
const DRIVE_SPEED = 0.085;
const SPRING_READY_MIN = 0.7;
const SPRING_READY_MAX = 1.35;
const COLLISION_Z = 0.7;
const LANE_TOLERANCE = 0.42;
const MAX_GORILLA_HITS = 3;

const keys = {};

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (event.key === ' ') {
    event.preventDefault();
  }

  if (event.key === ' ' && !event.repeat) {
    game.handleSpace();
  }

  if (key === 'r' && !event.repeat) {
    game.restart();
  }
});

document.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

class AudioEngine {
  constructor() {
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  beep({ frequency, duration, type = 'square', gain = 0.07, slideTo }) {
    this.ensure();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const volume = this.ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) {
      oscillator.frequency.linearRampToValueAtTime(slideTo, now + duration);
    }

    volume.gain.setValueAtTime(gain, now);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(volume);
    volume.connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  gorillaHit() {
    this.beep({ frequency: 210, duration: 0.08, slideTo: 150, gain: 0.08 });
    this.beep({ frequency: 130, duration: 0.14, slideTo: 85, gain: 0.06 });
  }

  launch() {
    this.beep({ frequency: 280, duration: 0.08, slideTo: 380, gain: 0.06 });
  }

  spring() {
    this.beep({ frequency: 380, duration: 0.08, slideTo: 560, gain: 0.08 });
    this.beep({ frequency: 560, duration: 0.14, slideTo: 760, gain: 0.05 });
  }

  fail() {
    this.beep({ frequency: 140, duration: 0.18, slideTo: 70, gain: 0.07 });
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = new AudioEngine();
    this.cameraLane = 0;
    this.trackOffset = 0;
    this.forwardDistance = 0;
    this.attempts = 1;
    this.gorillaHits = 0;
    this.hitFlash = 0;
    this.shake = 0;
    this.goalPulse = 0;
    this.springReady = false;
    this.phase = 'intro';
    this.message = 'Arrow keys or A/D to steer. Press Space to drive.';
    this.objects = [];

    this.restart(false);
    this.gameLoop();
  }

  buildTrack() {
    return [
      { type: 'monkey', lane: -0.85, z: 15.5, hit: false },
      { type: 'gorilla', lane: 0.8, z: 13.4, hit: false },
      { type: 'monkey', lane: 0.05, z: 11.8, hit: false },
      { type: 'gorilla', lane: -0.7, z: 9.8, hit: false },
      { type: 'monkey', lane: 0.7, z: 7.9, hit: false },
      { type: 'gorilla', lane: 0, z: 5.7, hit: false },
      { type: 'spring', lane: 0, z: 2.2, armed: false, spent: false },
    ];
  }

  restart(incrementAttempts = false) {
    if (incrementAttempts) {
      this.attempts += 1;
    }

    this.cameraLane = 0;
    this.trackOffset = 0;
    this.forwardDistance = 0;
    this.hitFlash = 0;
    this.shake = 0;
    this.goalPulse = 0;
    this.springReady = false;
    this.phase = 'intro';
    this.message = 'Arrow keys or A/D to steer. Press Space to drive.';
    this.objects = this.buildTrack();
  }

  handleSpace() {
    if (this.phase === 'intro') {
      this.phase = 'drive';
      this.message = 'Stay centered, dodge the primates, hit Space on the spring.';
      this.audio.launch();
      return;
    }

    if (this.phase === 'drive' && this.springReady) {
      const spring = this.objects.find((object) => object.type === 'spring');
      if (spring) {
        spring.spent = true;
      }

      this.phase = 'spring-flight';
      this.springReady = false;
      this.goalPulse = 32;
      this.message = 'Mini banana spring fired. Hold your line.';
      this.audio.spring();
      return;
    }

    if (this.phase === 'drive') {
      this.message = 'Too early. Wait until the spring pad flashes, then press Space.';
      return;
    }

    if (this.phase === 'won' || this.phase === 'lost') {
      this.restart(this.phase === 'lost');
    }
  }

  loseRound(message) {
    this.phase = 'lost';
    this.message = `${message} Press Space to retry.`;
    this.audio.fail();
  }

  updateSteering() {
    let direction = 0;
    if (keys['arrowleft'] || keys['a']) direction -= 1;
    if (keys['arrowright'] || keys['d']) direction += 1;

    this.cameraLane += direction * 0.055;
    this.cameraLane *= 0.9;
    this.cameraLane = Math.max(-1.15, Math.min(1.15, this.cameraLane));
    this.trackOffset += this.cameraLane * 0.024;
  }

  updateDrive() {
    this.forwardDistance += DRIVE_SPEED;
    this.springReady = false;

    this.objects.forEach((object) => {
      object.z -= DRIVE_SPEED;

      if (object.type === 'spring') {
        if (!object.spent && object.z <= SPRING_READY_MAX && object.z >= SPRING_READY_MIN) {
          this.springReady = true;
          object.armed = true;
          this.message = 'Spring in range. Press Space now.';
        }

        if (!object.spent && object.z < SPRING_READY_MIN) {
          this.loseRound('You missed the spring timing.');
        }
        return;
      }

      if (
        !object.hit &&
        object.z <= COLLISION_Z &&
        Math.abs(this.cameraLane - object.lane) < LANE_TOLERANCE
      ) {
        object.hit = true;
        this.hitFlash = 14;
        this.shake = 16;

        if (object.type === 'gorilla') {
          this.gorillaHits += 1;
          this.message = 'Gorilla hit. The banana car rattled hard.';
          this.audio.gorillaHit();

          if (this.gorillaHits >= MAX_GORILLA_HITS) {
            this.loseRound('Too many gorilla hits.');
          }
        } else {
          this.message = 'Monkey swipe. Keep steering through the chaos.';
        }
      }
    });
  }

  updateSpringFlight() {
    this.goalPulse = Math.max(0, this.goalPulse - 1);
    this.forwardDistance += DRIVE_SPEED * 0.6;

    if (this.forwardDistance > 2.8) {
      this.phase = 'won';
      this.message = 'Perfect timing. Press Space to run it again.';
    }
  }

  updateEffects() {
    if (this.hitFlash > 0) {
      this.hitFlash -= 1;
    }

    if (this.shake > 0) {
      this.shake -= 1;
    }
  }

  update() {
    this.updateEffects();

    if (this.phase === 'won' || this.phase === 'lost') {
      return;
    }

    this.updateSteering();

    if (this.phase === 'drive') {
      this.updateDrive();
    } else if (this.phase === 'spring-flight') {
      this.updateSpringFlight();
    }
  }

  getRoadCenter(y) {
    const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);
    const curve = Math.sin(this.trackOffset + perspective * 1.9) * 40 * (1 - perspective);
    return CANVAS_WIDTH / 2 - this.cameraLane * 120 * (1 - perspective) + curve;
  }

  getRoadHalfWidth(y) {
    const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);
    return 62 + perspective * perspective * 320;
  }

  projectObject(object) {
    const depth = 1 - object.z / TRACK_LENGTH;
    if (depth <= 0 || depth > 1.2) return null;

    const easedDepth = depth * depth;
    const y = HORIZON_Y + easedDepth * (ROAD_BOTTOM_Y - HORIZON_Y);
    const halfWidth = this.getRoadHalfWidth(y);
    const centerX = this.getRoadCenter(y);
    const x = centerX + object.lane * halfWidth * 0.58;
    const scale = 0.35 + easedDepth * 2.1;

    return { x, y, scale, depth };
  }

  drawBackground() {
    const sky = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#8de1ff');
    sky.addColorStop(0.45, '#caefff');
    sky.addColorStop(1, '#e8f6ff');
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#ffd45b';
    this.ctx.beginPath();
    this.ctx.arc(640, 92, 42, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#94c96c';
    this.ctx.fillRect(0, HORIZON_Y, CANVAS_WIDTH, CANVAS_HEIGHT - HORIZON_Y);

    this.ctx.fillStyle = '#78ab54';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 245);
    this.ctx.lineTo(160, 170);
    this.ctx.lineTo(310, 245);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(460, 230);
    this.ctx.lineTo(635, 150);
    this.ctx.lineTo(800, 240);
    this.ctx.fill();
  }

  drawRoad() {
    for (let y = HORIZON_Y; y <= ROAD_BOTTOM_Y; y += 2) {
      const center = this.getRoadCenter(y);
      const halfWidth = this.getRoadHalfWidth(y);
      const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);

      this.ctx.fillStyle = perspective < 0.75 ? '#4f5963' : '#3b424a';
      this.ctx.fillRect(center - halfWidth, y, halfWidth * 2, 2);

      this.ctx.fillStyle = '#7ec458';
      this.ctx.fillRect(0, y, center - halfWidth, 2);
      this.ctx.fillRect(center + halfWidth, y, CANVAS_WIDTH - (center + halfWidth), 2);

      if (Math.floor((perspective * 42 + this.forwardDistance * 8) % 6) === 0) {
        this.ctx.fillStyle = '#fff2a3';
        this.ctx.fillRect(center - 4, y, 8, 2);
      }
    }
  }

  drawCockpit() {
    this.ctx.fillStyle = '#20150e';
    this.ctx.beginPath();
    this.ctx.moveTo(0, CANVAS_HEIGHT);
    this.ctx.lineTo(220, 470);
    this.ctx.lineTo(580, 470);
    this.ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#f7cf42';
    this.ctx.beginPath();
    this.ctx.moveTo(260, CANVAS_HEIGHT);
    this.ctx.quadraticCurveTo(400, 500, 540, CANVAS_HEIGHT);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = '#3f2a19';
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.arc(400, 612, 138, Math.PI, Math.PI * 2);
    this.ctx.stroke();
  }

  drawMonkey(projected) {
    const size = 26 * projected.scale;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(projected.x, projected.y - size);

    ctx.fillStyle = '#8f6035';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#bd8550';
    ctx.beginPath();
    ctx.arc(0, size * 0.15, size * 0.62, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff5151';
    ctx.fillRect(-size * 0.52, -size * 0.2, size * 0.24, size * 0.12);
    ctx.fillRect(size * 0.28, -size * 0.2, size * 0.24, size * 0.12);

    ctx.strokeStyle = '#5d3c1e';
    ctx.lineWidth = Math.max(2, projected.scale * 2.4);
    ctx.beginPath();
    ctx.moveTo(-size * 0.75, size * 0.4);
    ctx.lineTo(-size * 1.1, size * 0.95);
    ctx.moveTo(size * 0.75, size * 0.4);
    ctx.lineTo(size * 1.1, size * 0.95);
    ctx.stroke();
    ctx.restore();
  }

  drawGorilla(projected) {
    const size = 34 * projected.scale;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(projected.x, projected.y - size);

    ctx.fillStyle = '#5b4330';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.55, size * 1.05, size * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.72, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d7a26f';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.35, size * 0.48, size * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff5959';
    ctx.fillRect(-size * 0.5, -size * 0.08, size * 0.18, size * 0.08);
    ctx.fillRect(size * 0.32, -size * 0.08, size * 0.18, size * 0.08);
    ctx.restore();
  }

  drawSpring(projected, object) {
    const width = 52 * projected.scale;
    const height = 22 * projected.scale;
    const active = this.springReady && !object.spent;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(projected.x, projected.y);

    ctx.fillStyle = active ? '#ff6f5c' : '#d75748';
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.strokeStyle = '#ffe37c';
    ctx.lineWidth = Math.max(2, projected.scale * 2.5);
    ctx.beginPath();
    ctx.moveTo(-width * 0.28, -height * 0.5);
    ctx.lineTo(-width * 0.16, -height * 1.2);
    ctx.lineTo(0, -height * 0.34);
    ctx.lineTo(width * 0.16, -height * 1.2);
    ctx.lineTo(width * 0.28, -height * 0.5);
    ctx.stroke();

    if (active) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -height * 1.35, 8 * projected.scale + this.goalPulse * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawObjects() {
    const drawables = this.objects
      .map((object) => ({ object, projected: this.projectObject(object) }))
      .filter((entry) => entry.projected)
      .sort((a, b) => a.object.z - b.object.z);

    drawables.forEach(({ object, projected }) => {
      if (object.type === 'monkey') {
        this.drawMonkey(projected);
      } else if (object.type === 'gorilla') {
        this.drawGorilla(projected);
      } else if (object.type === 'spring') {
        this.drawSpring(projected, object);
      }
    });
  }

  drawGoalBurst() {
    if (this.phase !== 'spring-flight' && this.phase !== 'won') return;

    const glow = this.phase === 'won' ? 34 : 16 + this.goalPulse * 0.3;
    this.ctx.save();
    this.ctx.translate(400, 210);

    this.ctx.fillStyle = 'rgba(255, 245, 182, 0.32)';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, glow * 2.4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#f7d11e';
    this.ctx.beginPath();
    this.ctx.moveTo(-42, 20);
    this.ctx.quadraticCurveTo(-6, -28, 42, -14);
    this.ctx.quadraticCurveTo(18, 22, -42, 20);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawUi() {
    this.ctx.fillStyle = 'rgba(14, 19, 26, 0.7)';
    this.ctx.fillRect(18, 18, 458, 96);

    this.ctx.fillStyle = '#ffd85b';
    this.ctx.font = 'bold 22px Arial';
    this.ctx.fillText(`Lane ${this.cameraLane.toFixed(2)}`, 34, 50);
    this.ctx.fillText(`Gorilla Hits ${this.gorillaHits}/${MAX_GORILLA_HITS}`, 170, 50);
    this.ctx.fillText(`Attempt ${this.attempts}`, 370, 50);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px Arial';
    this.ctx.fillText(this.message, 34, 84);
  }

  drawOverlay(title, subtitle) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffe16f';
    this.ctx.font = 'bold 50px Arial';
    this.ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '22px Arial';
    this.ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    this.ctx.textAlign = 'left';
  }

  drawHitFlash() {
    if (this.hitFlash <= 0) return;

    this.ctx.fillStyle = `rgba(255, 94, 76, ${this.hitFlash / 40})`;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawVignette() {
    const gradient = this.ctx.createRadialGradient(400, 300, 160, 400, 300, 440);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.38)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  draw() {
    const offsetX = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const offsetY = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 0.5 : 0;

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.drawBackground();
    this.drawRoad();
    this.drawObjects();
    this.drawGoalBurst();
    this.drawCockpit();
    this.drawHitFlash();
    this.drawVignette();
    this.ctx.restore();

    this.drawUi();

    if (this.phase === 'intro') {
      this.drawOverlay('FIRST PERSON MODE', 'Steer with A/D or arrow keys. Space starts the run.');
    } else if (this.phase === 'won') {
      this.drawOverlay('BANANA BOOST', 'You hit the spring perfectly. Space resets the track.');
    } else if (this.phase === 'lost') {
      this.drawOverlay('CRASHED OUT', 'Space restarts. R also resets instantly.');
    }
  }

  getPhaseLabel() {
    if (this.phase === 'spring-flight') return 'Boost';
    if (this.phase === 'drive') return 'Drive';
    if (this.phase === 'won') return 'Win';
    if (this.phase === 'lost') return 'Retry';
    return 'Ready';
  }

  gameLoop = () => {
    this.update();
    this.draw();

    document.getElementById('score').textContent = this.gorillaHits;
    document.getElementById('lives').textContent = this.attempts;
    document.getElementById('level').textContent = this.getPhaseLabel();

    requestAnimationFrame(this.gameLoop);
  };
}

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
