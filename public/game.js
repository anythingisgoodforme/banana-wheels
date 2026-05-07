const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CANVAS_ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
const HORIZON_Y = 170;
const ROAD_BOTTOM_Y = 560;
const TRACK_LENGTH = 18;
const DRIVE_SPEED = 0.085;
const SPRING_READY_MIN = 0.7;
const SPRING_READY_MAX = 1.35;
const SPRING_DELAY_SECONDS = 60;
const SPRING_SPAWN_Z = 15;
const COLLISION_Z = 0.7;
const COLLISION_TOLERANCE = 0.3;

const keys = {};

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;
  keys[event.key] = true;
  keys[event.code] = true;

  if (event.key === ' ' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
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
  keys[event.key] = false;
  keys[event.code] = false;
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
    this.lane = 0;
    this.carOffset = 0;
    this.trackOffset = 0;
    this.forwardDistance = 0;
    this.elapsedFrames = 0;
    this.attempts = 1;
    this.hitFlash = 0;
    this.shake = 0;
    this.goalPulse = 0;
    this.springReady = false;
    this.springUnlocked = false;
    this.springWarningFlash = 0;
    this.phase = 'intro';
    this.message = 'Arrow keys or A/D to steer. Press Space to drive.';
    this.objects = [];

    this.restart(false);
    this.gameLoop();
  }

  buildTrack() {
    return [
      { type: 'monkey', lane: -0.85, z: 15.5, hit: false },
      { type: 'monkey', lane: 0.85, z: 14.2, hit: false },
      { type: 'monkey', lane: 0, z: 11.8, hit: false },
      { type: 'monkey', lane: -0.7, z: 10.6, hit: false },
      { type: 'monkey', lane: 0.7, z: 7.9, hit: false },
      { type: 'monkey', lane: 0, z: 6.4, hit: false },
    ];
  }

  createSpring() {
    return { type: 'spring', lane: 0, z: SPRING_SPAWN_Z, armed: false, spent: false };
  }

  restart(incrementAttempts = false) {
    if (incrementAttempts) {
      this.attempts += 1;
    }

    this.lane = 0;
    this.carOffset = 0;
    this.trackOffset = 0;
    this.forwardDistance = 0;
    this.elapsedFrames = 0;
    this.hitFlash = 0;
    this.shake = 0;
    this.goalPulse = 0;
    this.springReady = false;
    this.springUnlocked = false;
    this.springWarningFlash = 0;
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
    this.lane = 0;
    this.carOffset = 0;
  }

  updateSpringUnlock() {
    if (this.phase !== 'drive') return;

    this.elapsedFrames += 1;
    const elapsedSeconds = this.elapsedFrames / 60;

    if (!this.springUnlocked && elapsedSeconds >= SPRING_DELAY_SECONDS) {
      this.springUnlocked = true;
      this.springWarningFlash = 180;
      this.objects.push(this.createSpring());
      this.message = 'Spring popped up ahead. Watch the red alert and hit Space.';
    }
  }

  updateDrive() {
    this.forwardDistance += DRIVE_SPEED;
    this.springReady = false;
    this.updateSpringUnlock();

    this.objects = this.objects.filter((object) => {
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

        return !object.spent && object.z > -1.5;
      }

      if (
        !object.hit &&
        object.z <= COLLISION_Z &&
        Math.abs(this.lane - object.lane) < COLLISION_TOLERANCE
      ) {
        object.hit = true;
        this.hitFlash = 14;
        this.shake = 16;
        this.message = 'Monkey swipe. Keep steering through the chaos.';
      }

      if (object.z < -1.5) {
        object.z = TRACK_LENGTH + Math.random() * 4;
        object.hit = false;
        object.lane = -0.9 + Math.random() * 1.8;
      }

      return true;
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

    if (this.springWarningFlash > 0) {
      this.springWarningFlash -= 1;
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
    const curve = Math.sin(this.trackOffset + perspective * 1.9) * 72 * (1 - perspective);
    return CANVAS_WIDTH / 2 + curve;
  }

  getRoadHalfWidth(y) {
    const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);
    return 90 + perspective * perspective * 380;
  }

  projectObject(object) {
    const depth = 1 - object.z / TRACK_LENGTH;
    if (depth <= 0 || depth > 1.2) return null;

    const easedDepth = depth * depth;
    const y = HORIZON_Y + easedDepth * (ROAD_BOTTOM_Y - HORIZON_Y);
    const halfWidth = this.getRoadHalfWidth(y);
    const centerX = this.getRoadCenter(y);
    const relativeLane = object.lane - this.lane;
    const x = centerX + relativeLane * halfWidth * 0.43;
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

    this.drawJungleBackdrop();
  }

  drawJungleBackdrop() {
    const ctx = this.ctx;
    const clusters = [
      { x: 40, width: 160, height: 90, dark: '#1d4725', mid: '#2d7d3d' },
      { x: 130, width: 150, height: 74, dark: '#285d32', mid: '#4fa65d' },
      { x: 235, width: 165, height: 102, dark: '#183f21', mid: '#458f50' },
      { x: 350, width: 190, height: 94, dark: '#20492a', mid: '#41894b' },
      { x: 470, width: 170, height: 110, dark: '#173b1e', mid: '#4b9b57' },
      { x: 600, width: 175, height: 98, dark: '#1f4727', mid: '#4a9454' },
      { x: 735, width: 165, height: 86, dark: '#285a30', mid: '#55a862' },
    ];

    ctx.fillStyle = 'rgba(100, 170, 115, 0.2)';
    ctx.fillRect(0, HORIZON_Y - 8, CANVAS_WIDTH, 72);

    clusters.forEach((cluster) => {
      ctx.fillStyle = cluster.dark;
      ctx.beginPath();
      ctx.moveTo(cluster.x - cluster.width / 2, HORIZON_Y + 20);
      ctx.quadraticCurveTo(
        cluster.x - cluster.width * 0.22,
        HORIZON_Y - cluster.height,
        cluster.x,
        HORIZON_Y - cluster.height * 0.78
      );
      ctx.quadraticCurveTo(
        cluster.x + cluster.width * 0.22,
        HORIZON_Y - cluster.height,
        cluster.x + cluster.width / 2,
        HORIZON_Y + 20
      );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = cluster.mid;
      ctx.beginPath();
      ctx.arc(cluster.x - cluster.width * 0.22, HORIZON_Y - cluster.height * 0.28, cluster.width * 0.18, Math.PI, 0);
      ctx.arc(cluster.x, HORIZON_Y - cluster.height * 0.4, cluster.width * 0.21, Math.PI, 0);
      ctx.arc(cluster.x + cluster.width * 0.24, HORIZON_Y - cluster.height * 0.24, cluster.width * 0.17, Math.PI, 0);
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(24, 71, 37, 0.78)';
    for (let i = 0; i < 18; i += 1) {
      const bushX = 20 + i * 46;
      const bushY = HORIZON_Y + 24 + Math.sin(i * 1.7) * 10;
      ctx.beginPath();
      ctx.arc(bushX, bushY, 18 + (i % 3) * 7, Math.PI, 0);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(35, 92, 44, 0.55)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 10; i += 1) {
      const vineX = 30 + i * 82;
      ctx.beginPath();
      ctx.moveTo(vineX, HORIZON_Y - 48 - (i % 2) * 18);
      ctx.quadraticCurveTo(vineX + 10, HORIZON_Y - 8, vineX - 6, HORIZON_Y + 34);
      ctx.quadraticCurveTo(vineX - 16, HORIZON_Y + 54, vineX + 2, HORIZON_Y + 68);
      ctx.stroke();
    }
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

      if (perspective > 0.08) {
        const laneLineOffset = halfWidth * 0.28;
        const laneDash = Math.floor((perspective * 52 + this.forwardDistance * 10) % 8) < 4;
        if (laneDash) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
          this.ctx.fillRect(center - laneLineOffset - 2, y, 4, 2);
          this.ctx.fillRect(center + laneLineOffset - 2, y, 4, 2);
        }
      }
    }

    this.drawRoadsideJungle();
  }

  drawRoadsideJungle() {
    const ctx = this.ctx;

    for (let y = HORIZON_Y + 14; y <= ROAD_BOTTOM_Y; y += 18) {
      const center = this.getRoadCenter(y);
      const halfWidth = this.getRoadHalfWidth(y);
      const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);
      const scale = 0.45 + perspective * 1.5;
      const sway = Math.sin(this.forwardDistance * 3.5 + y * 0.04) * 6;
      const leftBase = center - halfWidth - 18 - perspective * 46;
      const rightBase = center + halfWidth + 18 + perspective * 46;

      this.drawPalmClump(leftBase + sway, y + 2, scale, false);
      this.drawPalmClump(rightBase - sway, y + 2, scale, true);
      this.drawPalmClump(leftBase - 24 + sway * 0.6, y + 10, scale * 0.78, false);
      this.drawPalmClump(rightBase + 24 - sway * 0.6, y + 10, scale * 0.78, true);

      if (perspective > 0.24) {
        this.drawBroadLeaf(leftBase - 10 - perspective * 18, y + 8, scale * 0.92, false);
        this.drawBroadLeaf(rightBase + 10 + perspective * 18, y + 8, scale * 0.92, true);
        this.drawBroadLeaf(leftBase - 38 - perspective * 16, y + 14, scale * 0.76, false);
        this.drawBroadLeaf(rightBase + 38 + perspective * 16, y + 14, scale * 0.76, true);
      }
    }
  }

  drawPalmClump(x, y, scale, mirror) {
    const ctx = this.ctx;
    const direction = mirror ? -1 : 1;
    const trunkHeight = 18 * scale;
    const trunkWidth = Math.max(2, 4 * scale);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(direction, 1);

    ctx.strokeStyle = '#5f3d1f';
    ctx.lineWidth = trunkWidth;
    ctx.beginPath();
    ctx.moveTo(0, 6 * scale);
    ctx.quadraticCurveTo(2 * scale, -trunkHeight * 0.35, 0, -trunkHeight);
    ctx.stroke();

    const leafColors = ['#2f7d3b', '#45a552', '#276631'];
    const leafAngles = [-1.12, -0.56, -0.06, 0.42, 0.82];
    leafAngles.forEach((angle, index) => {
      ctx.strokeStyle = leafColors[index % leafColors.length];
      ctx.lineWidth = Math.max(2, 5 * scale);
      ctx.beginPath();
      ctx.moveTo(0, -trunkHeight);
      ctx.quadraticCurveTo(
        Math.cos(angle) * 18 * scale,
        -trunkHeight + Math.sin(angle) * 11 * scale,
        Math.cos(angle) * 30 * scale,
        -trunkHeight + Math.sin(angle) * 22 * scale
      );
      ctx.stroke();
    });

    ctx.restore();
  }

  drawBroadLeaf(x, y, scale, mirror) {
    const ctx = this.ctx;
    const direction = mirror ? -1 : 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(direction, 1);

    ctx.fillStyle = '#2e7e3d';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(22 * scale, -18 * scale, 34 * scale, 2 * scale);
    ctx.quadraticCurveTo(20 * scale, 18 * scale, 0, 0);
    ctx.fill();

    ctx.fillStyle = '#4ba85a';
    ctx.beginPath();
    ctx.moveTo(2 * scale, 1 * scale);
    ctx.quadraticCurveTo(15 * scale, -9 * scale, 24 * scale, 1 * scale);
    ctx.quadraticCurveTo(15 * scale, 10 * scale, 2 * scale, 1 * scale);
    ctx.fill();

    ctx.strokeStyle = '#1f5a2d';
    ctx.lineWidth = Math.max(1.5, 2.2 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(30 * scale, 1 * scale);
    ctx.stroke();

    ctx.restore();
  }

  drawCockpit() {
    const shift = this.carOffset * 62;
    const turnTilt = this.carOffset * -0.18;

    this.ctx.save();
    this.ctx.translate(400 + shift, 565);
    this.ctx.rotate(turnTilt);
    this.ctx.translate(-400, -565);
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
    this.ctx.moveTo(230, CANVAS_HEIGHT);
    this.ctx.quadraticCurveTo(308 + this.carOffset * 34, 520, 390 + this.carOffset * 18, 536);
    this.ctx.quadraticCurveTo(510 + this.carOffset * 42, 494, 570, CANVAS_HEIGHT);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(110, 69, 22, 0.55)';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(398, CANVAS_HEIGHT);
    this.ctx.quadraticCurveTo(404 + this.carOffset * 18, 560, 404 + this.carOffset * 10, 530);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#3f2a19';
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.arc(
      400,
      612,
      138,
      Math.PI + this.carOffset * 0.52,
      Math.PI * 2 + this.carOffset * 0.52
    );
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawMonkey(projected) {
    const size = 24 * projected.scale;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(projected.x, projected.y - size);

    const bodyGradient = ctx.createRadialGradient(
      -size * 0.22,
      size * 0.42,
      size * 0.2,
      0,
      size * 0.9,
      size * 1.15
    );
    bodyGradient.addColorStop(0, '#b27a43');
    bodyGradient.addColorStop(0.55, '#83552d');
    bodyGradient.addColorStop(1, '#4f2f18');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.92, size * 1.02, size * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(53, 30, 16, 0.35)';
    ctx.beginPath();
    ctx.ellipse(size * 0.14, size * 1.06, size * 0.82, size * 0.54, 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#744b28';
    ctx.beginPath();
    ctx.ellipse(-size * 0.74, size * 0.84, size * 0.38, size * 0.22, -0.75, 0, Math.PI * 2);
    ctx.ellipse(size * 0.74, size * 0.84, size * 0.38, size * 0.22, 0.75, 0, Math.PI * 2);
    ctx.fill();

    const headGradient = ctx.createRadialGradient(
      -size * 0.28,
      -size * 0.34,
      size * 0.18,
      0,
      0,
      size * 1.02
    );
    headGradient.addColorStop(0, '#b9854f');
    headGradient.addColorStop(0.52, '#8b5c31');
    headGradient.addColorStop(1, '#512f17');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7d522c';
    ctx.beginPath();
    ctx.arc(-size * 0.7, -size * 0.1, size * 0.3, 0, Math.PI * 2);
    ctx.arc(size * 0.7, -size * 0.1, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c99663';
    ctx.beginPath();
    ctx.arc(0, size * 0.24, size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f2d8b6';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.38, size * 0.34, size * 0.23, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 245, 220, 0.42)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.22, -size * 0.42, size * 0.34, size * 0.22, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#20150d';
    ctx.beginPath();
    ctx.arc(-size * 0.28, -size * 0.08, size * 0.1, 0, Math.PI * 2);
    ctx.arc(size * 0.28, -size * 0.08, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.25, -size * 0.1, size * 0.035, 0, Math.PI * 2);
    ctx.arc(size * 0.31, -size * 0.1, size * 0.035, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#25160c';
    ctx.lineWidth = Math.max(1.5, projected.scale * 1.8);
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, size * 0.24);
    ctx.lineTo(0, size * 0.16);
    ctx.lineTo(size * 0.12, size * 0.24);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.2, size * 0.5);
    ctx.quadraticCurveTo(0, size * 0.64, size * 0.22, size * 0.48);
    ctx.stroke();

    ctx.strokeStyle = '#5d3c1e';
    ctx.lineWidth = Math.max(2, projected.scale * 2.4);
    ctx.beginPath();
    ctx.moveTo(-size * 0.68, size * 0.66);
    ctx.lineTo(-size * 1.12, size * 1.1);
    ctx.moveTo(size * 0.68, size * 0.66);
    ctx.lineTo(size * 1.12, size * 1.1);
    ctx.moveTo(-size * 0.26, size * 1.5);
    ctx.lineTo(-size * 0.58, size * 1.98);
    ctx.moveTo(size * 0.26, size * 1.5);
    ctx.lineTo(size * 0.58, size * 1.98);
    ctx.stroke();

    ctx.strokeStyle = '#4c2e18';
    ctx.lineWidth = Math.max(2, projected.scale * 2.1);
    ctx.beginPath();
    ctx.moveTo(size * 0.86, size * 1.04);
    ctx.quadraticCurveTo(size * 1.5, size * 1.14, size * 1.34, size * 1.84);
    ctx.quadraticCurveTo(size * 1.22, size * 2.1, size * 0.98, size * 1.96);
    ctx.stroke();

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
    this.ctx.fillText('Straight Run', 34, 50);
    this.ctx.fillText(`Time ${Math.floor(this.elapsedFrames / 60)}s`, 200, 50);
    this.ctx.fillText(`Attempt ${this.attempts}`, 360, 50);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px Arial';
    this.ctx.fillText(this.message, 34, 84);

    const secondsLeft = Math.max(0, Math.ceil(SPRING_DELAY_SECONDS - this.elapsedFrames / 60));
    this.ctx.fillStyle = '#d6f5ff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(
      this.springUnlocked ? 'Spring Active' : `Spring in ${secondsLeft}s`,
      34,
      108
    );

    const indicatorCenterX = 392;
    const indicatorY = 84;
    this.ctx.fillStyle = 'rgba(255,255,255,0.18)';
    this.ctx.fillRect(indicatorCenterX - 54, indicatorY - 11, 108, 22);
    this.ctx.fillRect(indicatorCenterX, indicatorY - 11, 2, 22);
    this.ctx.fillStyle = '#f7cf42';
    this.ctx.beginPath();
    this.ctx.moveTo(indicatorCenterX + this.lane * 28 - 10, indicatorY + 8);
    this.ctx.quadraticCurveTo(
      indicatorCenterX + this.lane * 28,
      indicatorY - 10,
      indicatorCenterX + this.lane * 28 + 10,
      indicatorY + 8
    );
    this.ctx.quadraticCurveTo(
      indicatorCenterX + this.lane * 28,
      indicatorY + 2,
      indicatorCenterX + this.lane * 28 - 10,
      indicatorY + 8
    );
    this.ctx.fill();
  }

  drawSpringAlert() {
    if (!this.springUnlocked || this.phase !== 'drive') return;

    const flashing = Math.floor(this.elapsedFrames / 12) % 2 === 0 || this.springWarningFlash > 0;
    if (!flashing) return;

    this.ctx.fillStyle = 'rgba(255, 34, 34, 0.88)';
    this.ctx.fillRect(175, 18, 450, 42);
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('PRESS SPACE WHEN THE SPRING IS UNDER YOU', CANVAS_WIDTH / 2, 47);
    this.ctx.textAlign = 'left';
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
    const worldTilt = this.carOffset * -0.09;
    const worldShift = this.carOffset * 58;

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.save();
    this.ctx.translate(CANVAS_WIDTH / 2 + worldShift, CANVAS_HEIGHT * 0.58);
    this.ctx.rotate(worldTilt);
    this.ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT * 0.58);
    this.drawBackground();
    this.drawRoad();
    this.drawObjects();
    this.drawGoalBurst();
    this.ctx.restore();
    this.drawCockpit();
    this.drawHitFlash();
    this.drawVignette();
    this.ctx.restore();

    this.drawUi();
    this.drawSpringAlert();

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

    document.getElementById('score').textContent = Math.floor(this.elapsedFrames / 60);
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
