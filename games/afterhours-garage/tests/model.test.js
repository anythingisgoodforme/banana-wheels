import {
  newState,
  buyCar,
  cleanCar,
  PARTS,
  buyPart,
  sellPart,
  settle,
  rate,
  blockers,
} from '../model';
const HOUR = 3600000;
function ready() {
  const s = newState(0);
  buyCar(s);
  for (let i = 0; i < 4; i++) cleanCar(s);
  PARTS.filter((p) => p.required).forEach((p) => buyPart(s, p.id));
  return s;
}
test('starter budget covers restoration and the six essentials', () => {
  const s = ready();
  expect(s.bank).toBeGreaterThanOrEqual(0);
  expect(blockers(s)).toHaveLength(0);
  expect(rate(s)).toBeGreaterThan(0);
});
test('catalog contains 201 unique actual parts', () => {
  expect(PARTS).toHaveLength(201);
  expect(new Set(PARTS.map((p) => p.id)).size).toBe(201);
});
test('visible garage never earns', () => {
  const s = ready();
  settle(s, 3 * HOUR);
  expect(s.pending).toBe(0);
  expect(s.rust).toBeGreaterThan(0);
});
test('away earnings are queued, never counted twice', () => {
  const s = ready(),
    bank = s.bank,
    hourly = rate(s);
  s.awaySince = 0;
  settle(s, 3 * HOUR);
  expect(s.pending).toBeCloseTo(hourly * 3);
  expect(s.bank).toBe(bank);
  settle(s, 3 * HOUR);
  expect(s.pending).toBeCloseTo(hourly * 3);
});
test('route names keep rotating after the activity log reaches its cap', () => {
  const s = ready();
  s.activity = Array.from({ length: 20 }, (_, index) => ({ track: `Old track ${index}` }));
  delete s.routeCount;
  let now = 0;
  const newTracks = [];
  for (let trip = 0; trip < 4; trip++) {
    s.lastSeen = now;
    s.awaySince = now;
    now += HOUR / 10;
    settle(s, now);
    newTracks.push(s.activity[0].track);
  }
  expect(new Set(newTracks.slice(0, 3)).size).toBe(3);
  expect(s.activity).toHaveLength(20);
  expect(s.routeCount).toBe(24);
});
test('selling an essential stops the car and buying it restores readiness', () => {
  const s = ready();
  sellPart(s, 'engine');
  s.awaySince = 0;
  settle(s, HOUR);
  expect(s.pending).toBe(0);
  expect(buyPart(s, 'engine')).toBe(true);
  expect(rate(s)).toBeGreaterThan(0);
});
test('tyres stop an extended drive exactly when worn out', () => {
  const s = ready(),
    hourly = rate(s);
  s.awaySince = 0;
  settle(s, 72 * HOUR);
  expect(s.pending).toBeCloseTo(hourly * 20);
  expect(s.parts.tyres.condition).toBe(0);
  expect(rate(s)).toBe(0);
  expect(s.rust).toBe(100);
});
test('upgrades increase rate and selling optional parts keeps driving', () => {
  const s = ready(),
    before = rate(s);
  buyPart(s, 'engine');
  expect(rate(s)).toBeGreaterThan(before);
  buyPart(s, 'air-filter');
  sellPart(s, 'air-filter');
  expect(rate(s)).toBeGreaterThan(0);
});
test('clock moving backwards never creates earnings or negative wear', () => {
  const s = ready();
  s.lastSeen = HOUR;
  s.awaySince = HOUR;
  settle(s, 0);
  expect(s.pending).toBe(0);
  expect(s.parts.tyres.condition).toBe(100);
});
test('later washes cost £1,000 but tutorial scrubbing stays free', () => {
  const s = newState(0);
  buyCar(s);
  const afterCar = s.bank;
  for (let i = 0; i < 4; i++) expect(cleanCar(s)).toBe(true);
  expect(s.bank).toBe(afterCar);
  s.rust = 25;
  expect(cleanCar(s)).toBe(true);
  expect(s.bank).toBe(afterCar - 1000);
  expect(s.rust).toBe(0);
  s.rust = 25;
  expect(cleanCar(s)).toBe(false);
  expect(s.rust).toBe(25);
});
