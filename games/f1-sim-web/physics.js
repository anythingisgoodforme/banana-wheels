import { findClosestPoint } from "./track.js";

function wrapAngle(angle) {
  let a = angle;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export function updatePlayer(player, input, track, dt) {
  const steerLerpRate = 1 / 0.15;
  const steerDelta = (input.steerTarget - player.steerInput) * Math.min(1, dt * steerLerpRate);
  player.steerInput += steerDelta;

  if (input.throttle) {
    player.speed += player.acceleration * dt;
  } else if (input.brake) {
    player.speed -= player.brakingDecel * dt;
  } else {
    const frameScale = Math.max(0, dt * 60);
    const friction = Math.pow(player.frictionPer60fps, frameScale);
    player.speed *= friction;
  }

  player.speed = Math.max(0, Math.min(player.maxSpeed, player.speed));
  player.direction = wrapAngle(player.direction + player.steerInput * player.turnRate * dt);

  player.x += Math.cos(player.direction) * player.speed * dt;
  player.y += Math.sin(player.direction) * player.speed * dt;

  player.progressIndex = findClosestPoint(track, player.x, player.y, player.progressIndex, 28);
}

export function getTrackRelativeState(player, track) {
  const sample = track.sample(player.progressIndex);
  const toPlayerX = player.x - sample.current.x;
  const toPlayerY = player.y - sample.current.y;
  const lateral = toPlayerX * sample.normal.x + toPlayerY * sample.normal.y;
  const heading = Math.atan2(sample.tangent.y, sample.tangent.x);
  const headingError = wrapAngle(heading - player.direction);

  return {
    lateralOffset: lateral,
    headingError,
    heading,
  };
}
