const BASE_WAYPOINTS = [
  { x: 0, y: -220 },
  { x: 220, y: -160 },
  { x: 360, y: 40 },
  { x: 300, y: 250 },
  { x: 120, y: 360 },
  { x: -130, y: 390 },
  { x: -340, y: 260 },
  { x: -390, y: 40 },
  { x: -280, y: -150 },
  { x: -120, y: -260 },
];

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      ((2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      ((2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

export function createTrack(stepsPerSegment = 16) {
  const points = [];
  const waypointCount = BASE_WAYPOINTS.length;
  for (let i = 0; i < waypointCount; i += 1) {
    const p0 = BASE_WAYPOINTS[(i - 1 + waypointCount) % waypointCount];
    const p1 = BASE_WAYPOINTS[i];
    const p2 = BASE_WAYPOINTS[(i + 1) % waypointCount];
    const p3 = BASE_WAYPOINTS[(i + 2) % waypointCount];
    for (let s = 0; s < stepsPerSegment; s += 1) {
      points.push(catmullRom(p0, p1, p2, p3, s / stepsPerSegment));
    }
  }

  let length = 0;
  const segmentLengths = [];
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    const dx = next.x - points[i].x;
    const dy = next.y - points[i].y;
    const segLen = Math.hypot(dx, dy);
    segmentLengths.push(segLen);
    length += segLen;
  }

  return {
    width: 80,
    points,
    segmentLengths,
    length,
    sample(index) {
      const i = ((index % points.length) + points.length) % points.length;
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const tangent = normalize(next.x - current.x, next.y - current.y);
      const normal = { x: -tangent.y, y: tangent.x };
      return { current, next, tangent, normal, index: i };
    },
  };
}

export function findClosestPoint(track, x, y, hintIndex = 0, window = 20) {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestIndex = hintIndex;
  const total = track.points.length;
  for (let offset = -window; offset <= window; offset += 1) {
    const idx = ((hintIndex + offset) % total + total) % total;
    const p = track.points[idx];
    const dx = x - p.x;
    const dy = y - p.y;
    const d = dx * dx + dy * dy;
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = idx;
    }
  }
  return bestIndex;
}
