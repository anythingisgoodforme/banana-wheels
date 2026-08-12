export function createPlayer(track) {
  const startPoint = track.sample(0);
  return {
    x: startPoint.current.x,
    y: startPoint.current.y,
    direction: Math.atan2(startPoint.tangent.y, startPoint.tangent.x),
    speed: 0,
    steerInput: 0,
    progressIndex: 0,
    maxSpeed: 400,
    acceleration: 300,
    brakingDecel: 400,
    frictionPer60fps: 0.92,
    turnRate: 3.0,
  };
}

export function resetPlayer(player, track) {
  const startPoint = track.sample(0);
  player.x = startPoint.current.x;
  player.y = startPoint.current.y;
  player.direction = Math.atan2(startPoint.tangent.y, startPoint.tangent.x);
  player.speed = 0;
  player.steerInput = 0;
  player.progressIndex = 0;
}
