export const CONFIG = { STARTING_MONEY: 1500, CAR_PRICE: 400, WASH_PRICE: 1000 };
const groups = {
  Engine:
    'Engine,Air filter,Oil filter,Fuel pump,Radiator,Turbocharger,Exhaust,Intake manifold,Camshaft,Crankshaft,Pistons,Connecting rods,Timing belt,Water pump,Oil pump,Intercooler,Throttle body,Injectors,Spark plugs,Head gasket,Valve springs,Flywheel,Engine mounts,Sump,Thermostat',
  'Running gear':
    'Tyres,Brakes,Gearbox,Clutch,Differential,Drive shaft,Front springs,Rear springs,Front dampers,Rear dampers,Anti roll bar,Steering rack,Wheel bearings,Brake hoses,Brake pads,Brake discs,Control arms,Tie rods,Ball joints,Alloy wheels,Wheel nuts,Brake fluid reservoir,Handbrake cable,Clutch cable,Axle shafts',
  Electrics:
    'Battery,Alternator,Starter motor,Headlights,Tail lights,Indicators,Horn,Fuse box,Wiring loom,Ignition coil,ECU,Oxygen sensor,Temperature sensor,Oil pressure sensor,Speed sensor,Reverse lights,Fog lights,Number plate lights,Instrument cluster,Relay box',
  Body: 'Windshield,Bonnet,Boot lid,Front bumper,Rear bumper,Left door,Right door,Left mirror,Right mirror,Roof panel,Front grille,Front wings,Rear wings,Undertray,Door seals,Window seals,Wipers,Washer pump,Washer reservoir,Paintwork',
  Cabin:
    'Driver seat,Passenger seat,Rear seats,Seat belts,Steering wheel,Dashboard,Carpet,Headlining,Door cards,Gear knob,Pedals,Heater,Air conditioning,Radio,Speakers,Sun visors,Rearview mirror,Glovebox,Cup holders,Boot lining',
  'Engine internals':
    'Inlet valves,Exhaust valves,Valve guides,Valve seals,Cam bearings,Main bearings,Big end bearings,Piston rings,Gudgeon pins,Timing tensioner,Timing idler,Timing cover,Rocker arms,Rocker cover,Rocker gasket,Cylinder head,Engine block,Oil pickup,Oil cooler,Oil dipstick,Dipstick tube,Drain plug,Fuel rail,Fuel lines,Fuel filter,Fuel tank,Fuel cap,Evaporative canister,Intake gasket,Exhaust gasket',
  'Chassis details':
    'Front subframe,Rear subframe,Front hub left,Front hub right,Rear hub left,Rear hub right,Front caliper left,Front caliper right,Rear caliper left,Rear caliper right,Brake master cylinder,Brake servo,ABS module,ABS sensor front left,ABS sensor front right,ABS sensor rear left,ABS sensor rear right,Steering column,Steering joint,Power steering pump,Power steering reservoir,Spring seats,Bump stops,Dust boots,Drop links,Subframe bushes,Trailing arms,Wheel studs,Spare wheel,Jack',
  'Finishing touches':
    'Door handles,Door locks,Boot latch,Bonnet latch,Bonnet hinges,Door hinges,Boot hinges,Window regulators,Window motors,Window switches,Central locking motor,Interior lamp,Map lights,Dashboard lights,Hazard switch,Indicator stalk,Wiper stalk,Heater fan,Heater core,Cabin filter,Air vents,Seat rails,Head restraints,Seat belt buckles,Parcel shelf,Boot carpet,Pedal rubbers,Handbrake lever,Gear gaiter,Number plates,Tow eye',
};
const required = ['Engine', 'Tyres', 'Brakes', 'Gearbox', 'Battery', 'Windshield'];
export const PARTS = Object.entries(groups).flatMap(([category, names]) =>
  names.split(',').map((name) => ({
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    category,
    required: required.includes(name),
    price: required.includes(name) ? 100 : 45,
    description:
      category === 'Engine' || category === 'Engine internals'
        ? 'Help your engine breathe, cool and deliver power.'
        : category === 'Running gear' || category === 'Chassis details'
          ? 'Put power on the road with better control and grip.'
          : category === 'Electrics'
            ? 'Keep the car powered, visible and running reliably.'
            : category === 'Body' || category === 'Finishing touches'
              ? 'Protect your car from weather and the road.'
              : 'Make every long drive more comfortable.',
  }))
);
export function newState(now = Date.now()) {
  return {
    version: 1,
    bank: CONFIG.STARTING_MONEY,
    pending: 0,
    owned: false,
    clean: 0,
    parts: {},
    rust: 65,
    lastSeen: now,
    awaySince: null,
    activity: [],
    totalDistance: 0,
    totalEarned: 0,
    factsRead: 0,
  };
}
export function blockers(s) {
  return PARTS.filter((p) => p.required && (!s.parts[p.id] || s.parts[p.id].condition <= 0));
}
export function rate(s) {
  return !s.owned || s.clean < 100 || s.rust >= 100 || blockers(s).length
    ? 0
    : 120 + Object.values(s.parts).reduce((n, p) => n + 3 + (p.tier - 1) * 14, 0);
}
export function partCost(s, p) {
  const old = s.parts[p.id];
  return p.price * (old && old.condition > 0 ? Math.min(3, old.tier + 1) : old?.tier || 1);
}
export function buyPart(s, id) {
  const p = PARTS.find((p) => p.id === id);
  if (!p || !s.owned) return false;
  const old = s.parts[id];
  if (old?.tier === 3 && old.condition === 100) return false;
  const cost = partCost(s, p);
  if (s.bank < cost) return false;
  s.bank -= cost;
  s.parts[id] = {
    tier: old && old.condition > 0 ? Math.min(3, old.tier + 1) : old?.tier || 1,
    condition: 100,
  };
  return true;
}
export function sellPart(s, id) {
  const p = PARTS.find((p) => p.id === id),
    old = s.parts[id];
  if (!p || !old) return false;
  s.bank += Math.floor((p.price * old.tier * 0.5 * old.condition) / 100);
  delete s.parts[id];
  return true;
}
export function buyCar(s) {
  if (s.owned || s.bank < CONFIG.CAR_PRICE) return false;
  s.bank -= CONFIG.CAR_PRICE;
  s.owned = true;
  return true;
}
export function cleanCar(s) {
  if (!s.owned) return false;
  if (s.clean >= 100) {
    if (s.bank < CONFIG.WASH_PRICE) return false;
    s.bank -= CONFIG.WASH_PRICE;
  }
  s.clean = Math.min(100, s.clean + 25);
  s.rust = Math.max(0, s.rust - 25);
  return true;
}
export function settle(s, now = Date.now()) {
  const elapsed = Math.max(0, (now - s.lastSeen) / 3600000);
  const away = s.awaySince === null ? 0 : Math.max(0, Math.min(72, (now - s.awaySince) / 3600000));
  const hourly = rate(s);
  const wearLimit = Math.min(
    ...PARTS.filter((p) => p.required).map((p) =>
      s.parts[p.id]
        ? (s.parts[p.id].condition / (p.id === 'tyres' ? 5 : 1.5)) * s.parts[p.id].tier
        : 0
    )
  );
  const hours = hourly ? Math.min(away, wearLimit, (100 - s.rust) * 0.72) : 0;
  const earned = hours * hourly;
  if (hours > 0) {
    const routes =
        hourly >= 220
          ? ['Summit Serpent', 'Glacier Pass', 'Midnight Mountain']
          : hourly >= 160
            ? ['Fjordlight Loop', 'Saltwind Raceway', 'Lighthouse Run']
            : ['Cloverfield Circuit', 'Birchwood Bend', 'Lantern Lane'],
      track = routes[s.activity.length % routes.length];
    for (const [id, p] of Object.entries(s.parts))
      p.condition = Math.max(0, p.condition - (hours * (id === 'tyres' ? 5 : 1.5)) / p.tier);
    s.pending += earned;
    s.totalEarned += earned;
    s.totalDistance += hours * 65;
    s.activity.unshift({
      track,
      hours,
      distance: hours * 65,
      earned,
    });
    s.activity = s.activity.slice(0, 20);
  }
  if (s.owned) s.rust = Math.min(100, s.rust + elapsed / 0.72);
  s.lastSeen = now;
  s.awaySince = null;
  return earned;
}
