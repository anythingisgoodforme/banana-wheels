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
const LANE_POSITIONS = [-0.92, 0, 0.92];
const STEER_EASE = 0.22;
const MAX_FRAME_SCALE = 2.2;
const CAMERA_STEER_STRENGTH = 54;
const MONKEY_WAVE_SPACING = 4.8;
const INITIAL_MONKEY_WAVES = 5;
const HITS_PER_LIFE = 5;
const STARTING_LIVES = 3;

const keys = {};

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;
  keys[event.key] = true;
  keys[event.code] = true;

  if (event.key === ' ' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
  }

  if (!event.repeat && (event.key === 'ArrowLeft' || key === 'a')) {
    game.shiftLane(-1);
  }

  if (!event.repeat && (event.key === 'ArrowRight' || key === 'd')) {
    game.shiftLane(1);
  }

  if (event.key === ' ' && !event.repeat) {
    game.handleSpace();
  }

  if (key === 'r' && !event.repeat) {
    game.restart(true);
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
    this.laneIndex = 1;
    this.targetLane = 1;
    this.lane = LANE_POSITIONS[this.laneIndex];
    this.carOffset = 0;
    this.carLean = 0;
    this.trackOffset = 0;
    this.forwardDistance = 0;
    this.elapsedFrames = 0;
    this.livesRemaining = STARTING_LIVES;
    this.damageHits = 0;
    this.hitFlash = 0;
    this.shake = 0;
    this.goalPulse = 0;
    this.springReady = false;
    this.springUnlocked = false;
    this.springWarningFlash = 0;
    this.nextMonkeyWaveZ = 0;
    this.lastOpenLane = 1;
    this.phase = 'intro';
    this.message = 'Arrow keys or A/D to swerve through the gaps. Press Space to drive.';
    this.objects = [];
    this.lastFrameTime = null;

    this.restart(true);
    this.gameLoop();
  }

  buildTrack() {
    const waves = [];
    this.nextMonkeyWaveZ = 7.8;

    for (let i = 0; i < INITIAL_MONKEY_WAVES; i += 1) {
      waves.push(this.createMonkeyWave(this.nextMonkeyWaveZ));
      this.nextMonkeyWaveZ += MONKEY_WAVE_SPACING;
    }

    return waves;
  }

  createSpring() {
    return { type: 'spring', lane: 0, z: SPRING_SPAWN_Z, armed: false, spent: false };
  }

  pickOpenLane() {
    const lanes = [0, 1, 2];
    const alternatives = lanes.filter((lane) => lane !== this.lastOpenLane);
    const weightedPool = Math.random() < 0.78 ? alternatives : lanes;
    const openLane = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    this.lastOpenLane = openLane;
    return openLane;
  }

  createMonkeyWave(z) {
    const openLane = this.pickOpenLane();
    const blockedLanes = LANE_POSITIONS.map((_, index) => index).filter((index) => index !== openLane);

    if (Math.random() < 0.22) {
      blockedLanes.splice(Math.floor(Math.random() * blockedLanes.length), 1);
    }

    return {
      type: 'wave',
      lanes: blockedLanes,
      openLane,
      z,
      hit: false,
    };
  }

  recycleMonkeyWave(wave) {
    const replacement = this.createMonkeyWave(this.nextMonkeyWaveZ + Math.random() * 0.6);
    this.nextMonkeyWaveZ += MONKEY_WAVE_SPACING;
    wave.lanes = replacement.lanes;
    wave.openLane = replacement.openLane;
    wave.z = replacement.z;
    wave.hit = false;
  }

  restart(resetLives = false) {
    if (resetLives) {
      this.livesRemaining = STARTING_LIVES;
      this.damageHits = 0;
    }

    this.laneIndex = 1;
    this.targetLane = 1;
    this.lane = LANE_POSITIONS[this.laneIndex];
    this.carOffset = 0;
    this.carLean = 0;
    this.trackOffset = 0;
    this.forwardDistance = 0;
    this.elapsedFrames = 0;
    this.hitFlash = 0;
    this.shake = 0;
    this.goalPulse = 0;
    this.springReady = false;
    this.springUnlocked = false;
    this.springWarningFlash = 0;
    this.lastOpenLane = 1;
    this.phase = 'intro';
    this.message = 'Arrow keys or A/D to swerve through the gaps. Press Space to drive.';
    this.objects = this.buildTrack();
  }

  shiftLane(direction) {
    const nextLane = Math.max(0, Math.min(LANE_POSITIONS.length - 1, this.targetLane + direction));
    this.targetLane = nextLane;
  }

  handleSpace() {
    if (this.phase === 'intro') {
      this.phase = 'drive';
      this.message = 'Need for Speed rules: read the open lane, flick across, avoid the monkeys.';
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
      this.restart(true);
    }
  }

  loseLife() {
    this.audio.fail();
    this.damageHits = 0;
    this.livesRemaining -= 1;

    if (this.livesRemaining <= 0) {
      this.phase = 'lost';
      this.message = 'Out of lives. Press Space to restart the run.';
      return;
    }

    this.restart(false);
    this.message = `You lost a life. ${this.livesRemaining} left. Press Space to jump back in.`;
  }

  updateSteering(frameScale) {
    this.lane = LANE_POSITIONS[this.targetLane];
    const easing = 1 - Math.pow(1 - STEER_EASE, frameScale);
    this.carOffset += (this.lane - this.carOffset) * easing;
    this.carLean += ((this.lane - this.carOffset) * 1.8 - this.carLean) * easing;
  }

  updateSpringUnlock(frameScale) {
    if (this.phase !== 'drive') return;

    this.elapsedFrames += frameScale;
    const elapsedSeconds = this.elapsedFrames / 60;

    if (!this.springUnlocked && elapsedSeconds >= SPRING_DELAY_SECONDS) {
      this.springUnlocked = true;
      this.springWarningFlash = 180;
      this.objects.push(this.createSpring());
      this.message = 'Spring popped up ahead. Watch the red alert and hit Space.';
    }
  }

  updateDrive(frameScale) {
    this.forwardDistance += DRIVE_SPEED * frameScale;
    this.springReady = false;
    this.updateSpringUnlock(frameScale);
    const retainedObjects = [];
    const playerLane = this.getPlayerLaneIndex();

    for (const object of this.objects) {
      object.z -= DRIVE_SPEED * frameScale;

      if (object.type === 'spring') {
        if (!object.spent && object.z <= SPRING_READY_MAX && object.z >= SPRING_READY_MIN) {
          this.springReady = true;
          object.armed = true;
          this.message = 'Spring in range. Press Space now.';
        }

        if (!object.spent && object.z < SPRING_READY_MIN) {
          this.loseLife();
          return;
        }

        if (!object.spent && object.z > -1.5) {
          retainedObjects.push(object);
        }
        continue;
      }

      if (
        !object.hit &&
        object.z <= COLLISION_Z &&
        object.z > COLLISION_Z - DRIVE_SPEED * frameScale * 2 &&
        object.lanes.includes(playerLane)
      ) {
        object.hit = true;
        this.damageHits += 1;
        this.hitFlash = 16;
        this.shake = 22;

        if (this.damageHits >= HITS_PER_LIFE) {
          this.loseLife();
          return;
        }

        this.message = `Monkey hit ${this.damageHits}/${HITS_PER_LIFE}. Find the open lane.`;
      }

      if (object.z < -1.5) {
        this.recycleMonkeyWave(object);
      }

      retainedObjects.push(object);
    }

    this.objects = retainedObjects;
  }

  updateSpringFlight(frameScale) {
    this.goalPulse = Math.max(0, this.goalPulse - frameScale);
    this.forwardDistance += DRIVE_SPEED * 0.6 * frameScale;

    if (this.forwardDistance > 2.8) {
      this.phase = 'won';
      this.message = 'Perfect timing. Press Space to run it again.';
    }
  }

  updateEffects(frameScale) {
    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - frameScale);
    }

    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - frameScale);
    }

    if (this.springWarningFlash > 0) {
      this.springWarningFlash = Math.max(0, this.springWarningFlash - frameScale);
    }
  }

  update(frameScale) {
    this.updateEffects(frameScale);

    if (this.phase === 'won' || this.phase === 'lost') {
      return;
    }

    this.updateSteering(frameScale);

    if (this.phase === 'drive') {
      this.updateDrive(frameScale);
    } else if (this.phase === 'spring-flight') {
      this.updateSpringFlight(frameScale);
    }
  }

  getRoadCenter(y) {
    const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);
    const curve = Math.sin(this.trackOffset + perspective * 1.9) * 72 * (1 - perspective);
    return CANVAS_WIDTH / 2 + curve - this.carOffset * CAMERA_STEER_STRENGTH * (0.2 + perspective * 0.85);
  }

  getRoadHalfWidth(y) {
    const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);
    return 120 + perspective * perspective * 450;
  }

  projectObject(object) {
    const depth = 1 - object.z / TRACK_LENGTH;
    if (depth <= 0 || depth > 1.2) return null;

    const easedDepth = depth * depth;
    const y = HORIZON_Y + easedDepth * (ROAD_BOTTOM_Y - HORIZON_Y);
    const halfWidth = this.getRoadHalfWidth(y);
    const centerX = this.getRoadCenter(y);
    const x = centerX + object.lane * halfWidth * 0.43;
    const scale = 0.35 + easedDepth * 2.1;

    return { x, y, scale, depth };
  }

  getPlayerLaneIndex() {
    let closestIndex = 0;
    let closestDistance = Infinity;

    LANE_POSITIONS.forEach((lanePosition, index) => {
      const distance = Math.abs(this.carOffset - lanePosition);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
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
      { x: 10, width: 320, height: 240, dark: '#1d4725', mid: '#2d7d3d' },
      { x: 118, width: 290, height: 210, dark: '#285d32', mid: '#4fa65d' },
      { x: 240, width: 330, height: 270, dark: '#183f21', mid: '#458f50' },
      { x: 380, width: 380, height: 255, dark: '#20492a', mid: '#41894b' },
      { x: 520, width: 350, height: 290, dark: '#173b1e', mid: '#4b9b57' },
      { x: 665, width: 340, height: 260, dark: '#1f4727', mid: '#4a9454' },
      { x: 805, width: 310, height: 225, dark: '#285a30', mid: '#55a862' },
    ];

    ctx.fillStyle = 'rgba(100, 170, 115, 0.2)';
    ctx.fillRect(0, HORIZON_Y - 34, CANVAS_WIDTH, 165);

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
      const bushY = HORIZON_Y + 52 + Math.sin(i * 1.7) * 16;
      ctx.beginPath();
      ctx.arc(bushX, bushY, 40 + (i % 3) * 14, Math.PI, 0);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(35, 92, 44, 0.55)';
    ctx.lineWidth = 10;
    for (let i = 0; i < 10; i += 1) {
      const vineX = 30 + i * 82;
      ctx.beginPath();
      ctx.moveTo(vineX, HORIZON_Y - 150 - (i % 2) * 38);
      ctx.quadraticCurveTo(vineX + 18, HORIZON_Y - 42, vineX - 14, HORIZON_Y + 72);
      ctx.quadraticCurveTo(vineX - 30, HORIZON_Y + 110, vineX + 8, HORIZON_Y + 156);
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

    for (let y = HORIZON_Y + 24; y <= ROAD_BOTTOM_Y; y += 28) {
      const center = this.getRoadCenter(y);
      const halfWidth = this.getRoadHalfWidth(y);
      const perspective = (y - HORIZON_Y) / (ROAD_BOTTOM_Y - HORIZON_Y);
      const scale = 1.05 + perspective * 2.9;
      const sway = Math.sin(this.forwardDistance * 3.5 + y * 0.04) * 10;
      const vergeInset = 40 + perspective * 74;
      const leftBase = center - halfWidth - vergeInset;
      const rightBase = center + halfWidth + vergeInset;

      this.drawPalmClump(leftBase + sway, y + 2, scale, false);
      this.drawPalmClump(rightBase - sway, y + 2, scale, true);

      if (perspective > 0.32) {
        this.drawBroadLeaf(leftBase - 30 - perspective * 10, y + 16, scale, false);
        this.drawBroadLeaf(rightBase + 30 + perspective * 10, y + 16, scale, true);
      }
    }
  }

  drawPalmClump(x, y, scale, mirror) {
    const ctx = this.ctx;
    const direction = mirror ? -1 : 1;
    const trunkHeight = 34 * scale;
    const trunkWidth = Math.max(4, 7 * scale);

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
      ctx.lineWidth = Math.max(3, 8 * scale);
      ctx.beginPath();
      ctx.moveTo(0, -trunkHeight);
      ctx.quadraticCurveTo(
        Math.cos(angle) * 30 * scale,
        -trunkHeight + Math.sin(angle) * 18 * scale,
        Math.cos(angle) * 52 * scale,
        -trunkHeight + Math.sin(angle) * 38 * scale
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
    const ctx = this.ctx;
    const centerX = CANVAS_WIDTH / 2 + this.carOffset * 112;
    const centerY = CANVAS_HEIGHT - 6;
    const turnTilt = this.carLean * -0.22;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(turnTilt);
    ctx.translate(-centerX, -centerY);

    ctx.fillStyle = '#12161d';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(140, 488);
    ctx.lineTo(278, 432);
    ctx.lineTo(522, 432);
    ctx.lineTo(660, 488);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    const hoodGradient = ctx.createLinearGradient(0, 448, 0, CANVAS_HEIGHT);
    hoodGradient.addColorStop(0, '#ffe15e');
    hoodGradient.addColorStop(0.52, '#f7be22');
    hoodGradient.addColorStop(1, '#d18f0f');
    ctx.fillStyle = hoodGradient;
    ctx.beginPath();
    ctx.moveTo(178, CANVAS_HEIGHT);
    ctx.quadraticCurveTo(252 + this.carOffset * 16, 520, 304, 470);
    ctx.quadraticCurveTo(354, 432, 400, 444);
    ctx.quadraticCurveTo(446, 432, 496, 470);
    ctx.quadraticCurveTo(548 - this.carOffset * 16, 520, 622, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2b313d';
    ctx.beginPath();
    ctx.moveTo(336, CANVAS_HEIGHT);
    ctx.quadraticCurveTo(352, 546, 400, 500);
    ctx.quadraticCurveTo(448, 546, 464, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0b0f14';
    ctx.beginPath();
    ctx.moveTo(304, 494);
    ctx.lineTo(496, 494);
    ctx.lineTo(448, 534);
    ctx.lineTo(352, 534);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(400, 448);
    ctx.quadraticCurveTo(398 + this.carOffset * 10, 516, 400, CANVAS_HEIGHT);
    ctx.stroke();

    ctx.strokeStyle = '#0f1218';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(400, 612, 144, Math.PI + this.carLean * 0.46, Math.PI * 2 + this.carLean * 0.46);
    ctx.stroke();

    ctx.fillStyle = '#161c25';
    ctx.beginPath();
    ctx.arc(400, 612, 118, Math.PI, Math.PI * 2);
    ctx.arc(400, 612, 76, Math.PI * 2, Math.PI, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7ce7ff';
    ctx.fillRect(386, 590, 28, 8);
    ctx.restore();
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
      if (object.type === 'wave') {
        object.lanes.forEach((laneIndex) => {
          const halfWidth = this.getRoadHalfWidth(projected.y);
          const centerX = this.getRoadCenter(projected.y);
          const laneX = centerX + LANE_POSITIONS[laneIndex] * halfWidth * 0.34;
          this.drawMonkey({ ...projected, x: laneX });
        });
      } else if (object.type === 'spring') {
        this.drawSpring(projected, object);
      }
    });
  }

  drawGoalBurst() {
    if (this.phase !== 'spring-flight' && this.phase !== 'won') return;

    const glow = this.phase === 'won' ? 34 : 16 + this.goalPulse * 0.3;
    this.ctx.save();
    this.ctx.translate(CANVAS_WIDTH / 2, 210);

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
    this.ctx.fillStyle = 'rgba(10, 16, 24, 0.78)';
    this.ctx.fillRect(18, 18, 510, 118);

    this.ctx.fillStyle = '#ffd85b';
    this.ctx.font = 'bold 22px Arial';
    this.ctx.fillText('Banana Wheels GT', 34, 50);
    this.ctx.fillText(`Time ${Math.floor(this.elapsedFrames / 60)}s`, 246, 50);
    this.ctx.fillText(`Lives ${this.livesRemaining}`, 418, 50);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px Arial';
    this.ctx.fillText(this.message, 34, 84);

    const secondsLeft = Math.max(0, Math.ceil(SPRING_DELAY_SECONDS - this.elapsedFrames / 60));
    this.ctx.fillStyle = '#d6f5ff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(
      this.springUnlocked ? 'Spring Active' : `Spring in ${secondsLeft}s`,
      34,
      110
    );

    this.ctx.fillStyle = '#ff8c69';
    this.ctx.fillText(`Damage ${this.damageHits}/${HITS_PER_LIFE}`, 208, 110);

    const indicatorCenterX = 444;
    const indicatorY = 104;
    this.ctx.fillStyle = 'rgba(255,255,255,0.18)';
    this.ctx.fillRect(indicatorCenterX - 66, indicatorY - 11, 132, 22);
    this.ctx.fillRect(indicatorCenterX - 22, indicatorY - 11, 2, 22);
    this.ctx.fillRect(indicatorCenterX + 22, indicatorY - 11, 2, 22);
    this.ctx.fillStyle = '#f7cf42';
    this.ctx.beginPath();
    this.ctx.moveTo(indicatorCenterX + this.carOffset * 34 - 10, indicatorY + 8);
    this.ctx.quadraticCurveTo(
      indicatorCenterX + this.carOffset * 34,
      indicatorY - 10,
      indicatorCenterX + this.carOffset * 34 + 10,
      indicatorY + 8
    );
    this.ctx.quadraticCurveTo(
      indicatorCenterX + this.carOffset * 34,
      indicatorY + 2,
      indicatorCenterX + this.carOffset * 34 - 10,
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
    const gradient = this.ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      160,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      440
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.38)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  draw() {
    const offsetX = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const offsetY = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 0.5 : 0;
    const cameraBank = this.carLean * -0.035;
    const cameraShift = -this.carOffset * 32;

    this.ctx.save();
    this.ctx.translate(offsetX + cameraShift, offsetY);
    this.ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);
    this.ctx.rotate(cameraBank);
    this.ctx.translate(-CANVAS_WIDTH / 2, -(CANVAS_HEIGHT - 120));
    this.ctx.save();
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
      this.drawOverlay('BANANA WHEELS GT', 'Swerve across three lanes. Space starts the run.');
    } else if (this.phase === 'won') {
      this.drawOverlay('BANANA BOOST', 'You hit the spring perfectly. Space resets the track.');
    } else if (this.phase === 'lost') {
      this.drawOverlay('CRASHED OUT', 'Out of lives. Space restarts. R also resets instantly.');
    }
  }

  getPhaseLabel() {
    if (this.phase === 'spring-flight') return 'Boost';
    if (this.phase === 'drive') return 'Drive';
    if (this.phase === 'won') return 'Win';
    if (this.phase === 'lost') return 'Retry';
    return 'Ready';
  }

  gameLoop = (timestamp = 0) => {
    if (this.lastFrameTime === null) {
      this.lastFrameTime = timestamp;
    }

    const deltaMs = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    const frameScale = Math.min(MAX_FRAME_SCALE, Math.max(deltaMs / (1000 / 60), 0.6));

    this.update(frameScale);
    this.draw();

    document.getElementById('score').textContent = Math.floor(this.elapsedFrames / 60);
    document.getElementById('lives').textContent = this.livesRemaining;
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
