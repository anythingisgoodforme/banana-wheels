export const CONFIG = { STARTING_MONEY: 1500, CAR_PRICE: 400, WASH_PRICE: 1000 };
export const CAR_CATALOG = [
  {
    id: 'little-comet',
    name: 'Little Comet',
    type: 'Classic coupe',
    price: 400,
    desirability: 4,
    power: 2,
    speed: 3,
    safety: 7,
    seats: 5,
    color: '#83aaa0',
    style: 'classic',
    wheelStyle: 'steel',
  },
  {
    id: 'pocket-rally',
    name: 'Pocket Rally',
    type: 'Rally hatchback',
    price: 700,
    desirability: 5,
    power: 4,
    speed: 4,
    safety: 7,
    seats: 5,
    color: '#d9b849',
    style: 'hatch',
    bodyKit: true,
    wheelStyle: 'rally',
  },
  {
    id: 'neon-street',
    name: 'Neon Street',
    type: 'Street tuner',
    price: 1200,
    desirability: 6,
    power: 5,
    speed: 6,
    safety: 6,
    seats: 4,
    color: '#cf5963',
    style: 'sport',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'tuner',
  },
  {
    id: 'sunset-roadster',
    name: 'Sunset Roadster',
    type: 'Convertible',
    price: 1800,
    desirability: 6,
    power: 4,
    speed: 5,
    safety: 6,
    seats: 2,
    color: '#d5874d',
    style: 'convertible',
    convertible: true,
    wheelStyle: 'alloy',
  },
  {
    id: 'popup-legend',
    name: 'Popup Legend',
    type: 'Retro sports coupe',
    price: 2600,
    desirability: 7,
    power: 5,
    speed: 6,
    safety: 6,
    seats: 2,
    color: '#477f9e',
    style: 'popup',
    popups: true,
    wheelStyle: 'classic',
  },
  {
    id: 'midnight-drift',
    name: 'Midnight Drift',
    type: 'Drift coupe',
    price: 3500,
    desirability: 7,
    power: 7,
    speed: 7,
    safety: 5,
    seats: 2,
    color: '#695e9a',
    style: 'sport',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'tuner',
  },
  {
    id: 'v8-thunder',
    name: 'V8 Thunder',
    type: 'Muscle car',
    price: 4700,
    desirability: 7,
    power: 8,
    speed: 7,
    safety: 6,
    seats: 4,
    color: '#b9473f',
    style: 'muscle',
    spoiler: true,
    wheelStyle: 'classic',
  },
  {
    id: 'safari-rally',
    name: 'Safari Rally',
    type: 'Rally wagon',
    price: 6000,
    desirability: 6,
    power: 7,
    speed: 7,
    safety: 8,
    seats: 5,
    color: '#79934a',
    style: 'wagon',
    bodyKit: true,
    wheelStyle: 'rally',
  },
  {
    id: 'city-pickup',
    name: 'City Pickup',
    type: 'Utility pickup',
    price: 7200,
    desirability: 6,
    power: 7,
    speed: 6,
    safety: 8,
    seats: 5,
    color: '#b78254',
    style: 'pickup',
    pickup: true,
    wheelStyle: 'utility',
  },
  {
    id: 'electric-sprint',
    name: 'Electric Sprint',
    type: 'Electric sport hatch',
    price: 8500,
    desirability: 7,
    power: 8,
    speed: 8,
    safety: 8,
    seats: 4,
    color: '#45a99d',
    style: 'sport',
    bodyKit: true,
    wheelStyle: 'aero',
  },
  {
    id: 'classic-gt',
    name: 'Classic GT',
    type: 'Grand touring roadster',
    price: 9900,
    desirability: 8,
    power: 7,
    speed: 8,
    safety: 7,
    seats: 2,
    color: '#bd9950',
    style: 'convertible',
    convertible: true,
    spoiler: true,
    wheelStyle: 'alloy',
  },
  {
    id: 'monster-hauler',
    name: 'Monster Hauler',
    type: 'Monster truck',
    price: 11400,
    desirability: 7,
    power: 9,
    speed: 5,
    safety: 8,
    seats: 5,
    color: '#6f985b',
    style: 'monster',
    monster: true,
    pickup: true,
    wheelStyle: 'monster',
  },
  {
    id: 'track-day-racer',
    name: 'Track Day Racer',
    type: 'Circuit racer',
    price: 12800,
    desirability: 8,
    power: 8,
    speed: 9,
    safety: 7,
    seats: 2,
    color: '#e16c43',
    style: 'racer',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'track',
  },
  {
    id: 'widebody-coupe',
    name: 'Widebody Coupe',
    type: 'Widebody tuner',
    price: 14000,
    desirability: 8,
    power: 8,
    speed: 9,
    safety: 6,
    seats: 4,
    color: '#5681ad',
    style: 'sport',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'tuner',
  },
  {
    id: 'carbon-supercar',
    name: 'Carbon Supercar',
    type: 'Exotic supercar',
    price: 15300,
    desirability: 9,
    power: 9,
    speed: 9,
    safety: 7,
    seats: 2,
    color: '#565c68',
    style: 'supercar',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'aero',
  },
  {
    id: 'grand-tourer',
    name: 'Grand Tourer',
    type: 'Luxury GT',
    price: 16500,
    desirability: 9,
    power: 8,
    speed: 8,
    safety: 10,
    seats: 4,
    color: '#477669',
    style: 'tourer',
    wheelStyle: 'alloy',
  },
  {
    id: 'rallycross-pro',
    name: 'Rallycross Pro',
    type: 'Rallycross racer',
    price: 17600,
    desirability: 8,
    power: 9,
    speed: 9,
    safety: 8,
    seats: 2,
    color: '#d4a83f',
    style: 'racer',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'rally',
  },
  {
    id: 'aero-prototype',
    name: 'Aero Prototype',
    type: 'Aerodynamic prototype',
    price: 18600,
    desirability: 9,
    power: 9,
    speed: 10,
    safety: 8,
    seats: 2,
    color: '#5ba8ba',
    style: 'prototype',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'aero',
  },
  {
    id: 'hyper-roadster',
    name: 'Hyper Roadster',
    type: 'Open-top hypercar',
    price: 19500,
    desirability: 9,
    power: 10,
    speed: 10,
    safety: 7,
    seats: 2,
    color: '#cf5e75',
    style: 'convertible',
    convertible: true,
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'track',
  },
  {
    id: 'twin-turbo-legend',
    name: 'Twin Turbo Legend',
    type: 'Twin-turbo street car',
    price: 20300,
    desirability: 9,
    power: 10,
    speed: 10,
    safety: 8,
    seats: 4,
    color: '#725b9b',
    style: 'sport',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'tuner',
  },
  {
    id: 'apex-xr',
    name: 'Apex XR',
    type: 'Track-focused supercar',
    price: 20800,
    desirability: 10,
    power: 10,
    speed: 10,
    safety: 8,
    seats: 2,
    color: '#cf553e',
    style: 'supercar',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'track',
  },
  {
    id: 'nebula-hyper',
    name: 'Nebula Hyper',
    type: 'One-of-one hypercar',
    price: 21000,
    desirability: 10,
    power: 10,
    speed: 10,
    safety: 9,
    seats: 2,
    color: '#75a7a5',
    style: 'prototype',
    spoiler: true,
    bodyKit: true,
    wheelStyle: 'aero',
  },
];
export function getCar(id) {
  return CAR_CATALOG.find((car) => car.id === id) || CAR_CATALOG[0];
}
export function carExoticness(carOrId) {
  const car = typeof carOrId === 'string' ? getCar(carOrId) : carOrId;
  const seatScore = Math.max(1, 10 - (car.seats - 2) * 1.25);
  return Math.round(
    (car.desirability * 0.3 +
      car.power * 0.25 +
      car.speed * 0.25 +
      car.safety * 0.1 +
      seatScore * 0.1) *
      10
  );
}
export function carEarningsMultiplier(carOrId) {
  const car = typeof carOrId === 'string' ? getCar(carOrId) : carOrId;
  return (
    1 +
    (car.power - 2) * 0.035 +
    (car.speed - 3) * 0.045 +
    (car.desirability - 4) * 0.012 +
    (car.safety - 7) * 0.008 +
    (5 - car.seats) * 0.003
  );
}
export function resaleMultiplier(carOrId) {
  const exoticness = carExoticness(carOrId);
  return exoticness >= 65 ? 1 + (exoticness - 65) / 100 : 0.9;
}
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
    carId: null,
    carInvestment: 0,
    cars: {},
    clean: 0,
    parts: {},
    rust: 65,
    lastSeen: now,
    awaySince: null,
    activity: [],
    routeCount: 0,
    totalDistance: 0,
    totalEarned: 0,
    factsRead: 0,
  };
}
export function migrateState(s) {
  if (!s || s.version !== 1 || !s.parts) return newState();
  s.cars = s.cars && typeof s.cars === 'object' ? s.cars : {};
  s.totalEarned = Math.max(0, Number(s.totalEarned) || 0);
  if (s.owned) {
    const carId = CAR_CATALOG.some((car) => car.id === s.carId) ? s.carId : 'little-comet';
    s.carId = carId;
    const record = s.cars[carId] || {};
    const recoveredInvestment =
      getCar(carId).price +
      Object.entries(s.parts).reduce((total, [partId, part]) => {
        const catalogPart = PARTS.find((entry) => entry.id === partId),
          tier = Math.max(1, Number(part.tier) || 1);
        return total + (catalogPart ? (catalogPart.price * tier * (tier + 1)) / 2 : 0);
      }, 0);
    s.carInvestment = Number(record.investment ?? s.carInvestment) || recoveredInvestment;
    s.cars[carId] = {
      ...record,
      id: carId,
      investment: s.carInvestment,
      parts: s.parts,
      clean: s.clean,
      rust: s.rust,
    };
  } else {
    s.carId = null;
    s.carInvestment = 0;
  }
  return s;
}
export function saveActiveCar(s) {
  if (!s.owned || !s.carId) return;
  s.cars ||= {};
  s.cars[s.carId] = {
    ...(s.cars[s.carId] || {}),
    id: s.carId,
    investment: s.carInvestment,
    parts: s.parts,
    clean: s.clean,
    rust: s.rust,
  };
}
export function switchCar(s, id) {
  const record = s.cars?.[id];
  if (!record) return false;
  saveActiveCar(s);
  s.carId = id;
  s.owned = true;
  s.carInvestment = record.investment;
  s.parts = record.parts || {};
  s.clean = record.clean;
  s.rust = record.rust;
  return true;
}
export function buyVehicle(s, id) {
  const car = CAR_CATALOG.find((vehicle) => vehicle.id === id);
  if (!car) return false;
  if (s.cars?.[id]) return switchCar(s, id);
  if (id === 'little-comet') return buyCar(s);
  if (s.totalEarned < car.price || s.bank < car.price) return false;
  saveActiveCar(s);
  s.bank -= car.price;
  const parts = Object.fromEntries(
    PARTS.filter((part) => part.required).map((part) => [part.id, { tier: 1, condition: 100 }])
  );
  s.cars[id] = { id, investment: car.price, parts, clean: 100, rust: 0 };
  return switchCar(s, id);
}
export function vehicleSaleValue(s, id = s.carId) {
  const car = CAR_CATALOG.find((vehicle) => vehicle.id === id);
  const record = id === s.carId ? { investment: s.carInvestment } : s.cars?.[id];
  return car && record ? Math.floor(record.investment * resaleMultiplier(car)) : 0;
}
export function sellVehicle(s, id = s.carId) {
  if (!s.owned || id !== s.carId || !s.cars?.[id]) return false;
  saveActiveCar(s);
  const value = vehicleSaleValue(s, id);
  s.bank += value;
  delete s.cars[id];
  const nextCarId = Object.keys(s.cars)[0];
  s.owned = false;
  s.carId = null;
  s.carInvestment = 0;
  s.parts = {};
  s.clean = 0;
  s.rust = 65;
  if (nextCarId) switchCar(s, nextCarId);
  return value;
}
export function blockers(s) {
  return PARTS.filter((p) => p.required && (!s.parts[p.id] || s.parts[p.id].condition <= 0));
}
export function rate(s) {
  return !s.owned || s.clean < 100 || s.rust >= 100 || blockers(s).length
    ? 0
    : Math.round(
        (120 + Object.values(s.parts).reduce((n, p) => n + 3 + (p.tier - 1) * 14, 0)) *
          carEarningsMultiplier(s.carId || 'little-comet')
      );
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
  s.carInvestment = (s.carInvestment || getCar(s.carId).price) + cost;
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
  s.cars ||= {};
  s.cars['little-comet'] = {
    id: 'little-comet',
    investment: CONFIG.CAR_PRICE,
    parts: {},
    clean: 0,
    rust: 65,
  };
  return switchCar(s, 'little-comet');
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
      routeCount =
        Number.isInteger(s.routeCount) && s.routeCount >= 0 ? s.routeCount : s.activity.length,
      track = routes[routeCount % routes.length];
    s.routeCount = routeCount + 1;
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
