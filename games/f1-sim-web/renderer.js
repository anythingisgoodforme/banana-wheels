function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function drawBackground(ctx, width, height) {
  const horizon = Math.floor(height * 0.46);

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#88d0ff");
  sky.addColorStop(1, "#ccedff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon);

  const grass = ctx.createLinearGradient(0, horizon, 0, height);
  grass.addColorStop(0, "#3b9f39");
  grass.addColorStop(1, "#236128");
  ctx.fillStyle = grass;
  ctx.fillRect(0, horizon, width, height - horizon);
}

function projectSlice(width, height, depthNorm, curveOffset, lateralOffset, roadHalfWidthWorld) {
  const horizonY = height * 0.46;
  const nearY = height * 0.96;
  const y = nearY - (nearY - horizonY) * depthNorm;
  const perspective = Math.pow(1 - depthNorm, 1.35);
  const halfWidth = 40 + 280 * perspective;
  const centerX = width * 0.5 + curveOffset - lateralOffset * (0.7 + perspective * 0.9);
  const laneWidth = (roadHalfWidthWorld * 0.04) * (0.3 + perspective);

  return { y, centerX, halfWidth, laneWidth };
}

function drawRoad(ctx, width, height, roadState, motion) {
  const slices = 52;
  const maxDepth = 600;
  const nearClip = 120;
  const roadHalf = roadState.trackWidth * 0.5;
  const lateral = clamp(roadState.lateralOffset, -60, 60);
  const curveStrength = clamp(roadState.turnLookahead * 260, -170, 170);
  const speedNorm = clamp(motion.speedNorm ?? 0, 0, 1);
  const flow = (motion.timeSec ?? 0) * (2.5 + speedNorm * 16);

  const projected = [];
  for (let i = 0; i <= slices; i += 1) {
    const depthNorm = i / slices;
    const z = nearClip + (maxDepth - nearClip) * depthNorm;
    const curveOffset = (1 - depthNorm) * curveStrength * (z / maxDepth);
    projected.push(projectSlice(width, height, depthNorm, curveOffset, lateral, roadHalf));
  }

  for (let i = slices; i > 0; i -= 1) {
    const far = projected[i];
    const near = projected[i - 1];
    const baseShade = 42 + Math.floor((i / slices) * 45);
    const travelPulse = Math.sin(i * 0.65 - flow * 2.9) * (4 + speedNorm * 12);
    const shade = clamp(Math.round(baseShade + travelPulse), 25, 120);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.beginPath();
    ctx.moveTo(far.centerX - far.halfWidth, far.y);
    ctx.lineTo(far.centerX + far.halfWidth, far.y);
    ctx.lineTo(near.centerX + near.halfWidth, near.y);
    ctx.lineTo(near.centerX - near.halfWidth, near.y);
    ctx.closePath();
    ctx.fill();

    // Rumble strips on both edges help communicate forward speed.
    if ((i + Math.floor(flow * 3.2)) % 5 < 2) {
      const stripWidthFar = Math.max(4, far.halfWidth * 0.08);
      const stripWidthNear = Math.max(5, near.halfWidth * 0.08);
      ctx.fillStyle = i % 2 === 0 ? "#d62828" : "#f2f2f2";

      ctx.beginPath();
      ctx.moveTo(far.centerX - far.halfWidth, far.y);
      ctx.lineTo(far.centerX - far.halfWidth + stripWidthFar, far.y);
      ctx.lineTo(near.centerX - near.halfWidth + stripWidthNear, near.y);
      ctx.lineTo(near.centerX - near.halfWidth, near.y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(far.centerX + far.halfWidth - stripWidthFar, far.y);
      ctx.lineTo(far.centerX + far.halfWidth, far.y);
      ctx.lineTo(near.centerX + near.halfWidth, near.y);
      ctx.lineTo(near.centerX + near.halfWidth - stripWidthNear, near.y);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  projected.forEach((s, i) => {
    const lx = s.centerX - s.halfWidth;
    if (i === 0) ctx.moveTo(lx, s.y);
    else ctx.lineTo(lx, s.y);
  });
  projected.forEach((s) => ctx.lineTo(s.centerX + s.halfWidth, s.y));
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#ffd84d";
  ctx.lineWidth = 2.5;
  for (let i = slices; i > 2; i -= 1) {
    if ((slices - i + Math.floor(flow * 5.5)) % 8 < 4) continue;
    const far = projected[i];
    const near = projected[i - 1];
    ctx.beginPath();
    ctx.moveTo(far.centerX, far.y);
    ctx.lineTo(near.centerX, near.y);
    ctx.stroke();
  }

  // Side posts in peripheral vision increase motion cues.
  for (let i = slices; i > 8; i -= 3) {
    if ((i + Math.floor(flow * 4.5)) % 7 !== 0) continue;
    const s = projected[i];
    const postHeight = clamp(4 + (1 - i / slices) * 32, 4, 28);
    ctx.strokeStyle = "#f4f4f4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.centerX - s.halfWidth - 10, s.y);
    ctx.lineTo(s.centerX - s.halfWidth - 10, s.y - postHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s.centerX + s.halfWidth + 10, s.y);
    ctx.lineTo(s.centerX + s.halfWidth + 10, s.y - postHeight);
    ctx.stroke();
  }
}

function drawTurnIndicator(ctx, width, turnAmount) {
  const clamped = clamp(turnAmount, -1, 1);
  const centerX = width * 0.5;
  const baseY = 70;
  const length = Math.abs(clamped) * 90;
  const endX = centerX + clamped * 120;
  const endY = baseY + 18;

  ctx.strokeStyle = "rgba(255, 70, 70, 0.95)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(centerX, baseY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  if (length > 6) {
    ctx.fillStyle = "rgba(255, 70, 70, 0.95)";
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - Math.sign(clamped || 1) * 12, endY - 6);
    ctx.lineTo(endX - Math.sign(clamped || 1) * 12, endY + 6);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCockpit(ctx, width, height, roadState, motion) {
  const speedNorm = clamp(motion.speedNorm ?? 0, 0, 1);
  const shake =
    (Math.sin((motion.timeSec ?? 0) * 77) + Math.cos((motion.timeSec ?? 0) * 59)) *
    0.5 *
    speedNorm *
    2.4;
  const steer = clamp(roadState.turnLookahead * 1.8, -1, 1);
  const centerX = width * 0.5 + steer * 20 + shake;
  const baseY = height * 0.95 + Math.abs(shake) * 0.3;

  const bodyWidth = width * 0.4;
  const noseWidth = bodyWidth * 0.22;
  const cockpitWidth = bodyWidth * 0.34;
  const bodyHeight = height * 0.34;
  const wheelWidth = bodyWidth * 0.18;
  const wheelHeight = bodyHeight * 0.44;
  const noseTopY = baseY - bodyHeight * 0.96;

  const bodyGrad = ctx.createLinearGradient(0, baseY - bodyHeight, 0, baseY);
  bodyGrad.addColorStop(0, "#ff4b4b");
  bodyGrad.addColorStop(1, "#ab131a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(centerX - bodyWidth * 0.5, baseY);
  ctx.lineTo(centerX - bodyWidth * 0.34, baseY - bodyHeight * 0.72);
  ctx.lineTo(centerX - cockpitWidth * 0.52, baseY - bodyHeight * 0.86);
  ctx.lineTo(centerX + cockpitWidth * 0.52, baseY - bodyHeight * 0.86);
  ctx.lineTo(centerX + bodyWidth * 0.34, baseY - bodyHeight * 0.72);
  ctx.lineTo(centerX + bodyWidth * 0.5, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#090909";
  ctx.fillRect(
    centerX - bodyWidth * 0.5 - wheelWidth * 0.62,
    baseY - wheelHeight * 1.02,
    wheelWidth,
    wheelHeight
  );
  ctx.fillRect(
    centerX + bodyWidth * 0.5 - wheelWidth * 0.38,
    baseY - wheelHeight * 1.02,
    wheelWidth,
    wheelHeight
  );

  ctx.fillStyle = "#dfe5ef";
  ctx.beginPath();
  ctx.moveTo(centerX - noseWidth * 0.5, baseY);
  ctx.lineTo(centerX - noseWidth * 0.38, noseTopY);
  ctx.lineTo(centerX + noseWidth * 0.38, noseTopY);
  ctx.lineTo(centerX + noseWidth * 0.5, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#cfd7e3";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - bodyHeight * 0.86);
  ctx.lineTo(centerX, baseY - bodyHeight * 0.62);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(centerX, baseY - bodyHeight * 0.62, bodyWidth * 0.13, Math.PI, 0, false);
  ctx.stroke();

  const cockpitGrad = ctx.createLinearGradient(0, baseY - bodyHeight * 0.9, 0, baseY - bodyHeight * 0.46);
  cockpitGrad.addColorStop(0, "#1f2838");
  cockpitGrad.addColorStop(1, "#05070b");
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, baseY - bodyHeight * 0.62, cockpitWidth * 0.35, bodyHeight * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foreground wheel/dash reinforces first-person cockpit framing.
  const wheelCenterY = height * 0.98;
  const wheelRadius = bodyWidth * 0.18;
  ctx.strokeStyle = "#151c26";
  ctx.lineWidth = Math.max(5, bodyWidth * 0.03);
  ctx.beginPath();
  ctx.arc(centerX, wheelCenterY, wheelRadius, Math.PI * 1.1, Math.PI * 1.9, false);
  ctx.stroke();

  ctx.fillStyle = "rgba(15, 21, 30, 0.88)";
  const dashWidth = bodyWidth * 0.95;
  const dashHeight = bodyHeight * 0.18;
  ctx.fillRect(centerX - dashWidth * 0.5, height - dashHeight, dashWidth, dashHeight);
}

export function renderFrame(ctx, canvas, state) {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const motion = state.motion ?? { timeSec: 0, speedNorm: 0, steer: 0 };
  drawBackground(ctx, width, height);
  drawRoad(ctx, width, height, state.roadState, motion);
  drawCockpit(ctx, width, height, state.roadState, motion);
  drawTurnIndicator(ctx, width, state.roadState.turnLookahead * 2.6);
}
