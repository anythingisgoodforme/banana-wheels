import { createInput } from "./input.js";
import { createPlayer, resetPlayer } from "./player.js";
import { updatePlayer, getTrackRelativeState } from "./physics.js";
import { renderFrame } from "./renderer.js";
import { createTrack } from "./track.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const speedValue = document.getElementById("speedValue");
const progressValue = document.getElementById("progressValue");
const pauseOverlay = document.getElementById("pauseOverlay");

const track = createTrack(18);
const player = createPlayer(track);
const input = createInput();

let paused = false;
let lastTime = performance.now();
let simTime = 0;

function wrapAngle(angle) {
  let a = angle;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

function setupCanvas() {
  const aspect = 1200 / 700;
  const maxWidth = 1200;
  const maxHeight = 700;
  const viewportWidth = Math.max(320, Math.floor(window.innerWidth * 0.96));
  const viewportHeight = Math.max(240, Math.floor(window.innerHeight * 0.92));
  const scale = Math.min(maxWidth / 1200, maxHeight / 700, viewportWidth / 1200, viewportHeight / 700, 1);
  const width = Math.max(320, Math.floor(1200 * scale));
  const height = Math.max(180, Math.floor(width / aspect));

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width;
  canvas.height = height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function updateHud() {
  const speedKmh = Math.round(player.speed * 0.36);
  const progress = Math.round((player.progressIndex / track.points.length) * 100);
  speedValue.textContent = String(speedKmh);
  progressValue.textContent = String(progress);
}

function computeRoadState() {
  const trackState = getTrackRelativeState(player, track);
  const current = track.sample(player.progressIndex).tangent;
  const lookA = track.sample(player.progressIndex + 10).tangent;
  const lookB = track.sample(player.progressIndex + 22).tangent;
  const headingA = Math.atan2(lookA.y, lookA.x);
  const headingB = Math.atan2(lookB.y, lookB.x);
  const headingNow = Math.atan2(current.y, current.x);
  const turnLookahead =
    (wrapAngle(headingA - headingNow) + wrapAngle(headingB - headingA)) * 0.5;
  const safeLateral = Number.isFinite(trackState.lateralOffset) ? trackState.lateralOffset : 0;
  const safeTurn = Number.isFinite(turnLookahead) ? turnLookahead : 0;

  return {
    lateralOffset: safeLateral,
    turnLookahead: safeTurn,
    trackWidth: track.width,
  };
}

function setPaused(nextPaused) {
  paused = nextPaused;
  pauseOverlay.classList.toggle("hidden", !paused);
}

function tick(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  if (input.consumePauseToggle()) {
    setPaused(!paused);
  }

  if (input.consumeReset()) {
    resetPlayer(player, track);
  }

  if (!paused) {
    updatePlayer(player, input, track, dt);
    simTime += dt;
  }

  renderFrame(ctx, canvas, {
    roadState: computeRoadState(),
    motion: {
      timeSec: simTime,
      speedNorm: player.speed / player.maxSpeed,
      steer: player.steerInput,
    },
  });
  updateHud();
  requestAnimationFrame(tick);
}

window.addEventListener("resize", setupCanvas);
window.addEventListener("beforeunload", () => input.destroy());

setupCanvas();
requestAnimationFrame((t) => {
  lastTime = t;
  tick(t);
});
