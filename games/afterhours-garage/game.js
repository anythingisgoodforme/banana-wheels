import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  CAR_CATALOG,
  CONFIG,
  PARTS,
  newState,
  blockers,
  rate,
  partCost,
  buyPart,
  sellPart,
  buyCar,
  buyVehicle,
  carEarningsMultiplier,
  carExoticness,
  cleanCar,
  getCar,
  migrateState,
  saveActiveCar,
  settle,
  sellVehicle,
  switchCar,
  vehicleSaleValue,
} from './model.js';
const CAR_MODEL_FILES = {
  'little-comet': 'classic-car.glb',
  'pocket-rally': 'buggy.glb',
  'neon-street': 'mazda-rx7.glb',
  'sunset-roadster': 'convertible-open-top.glb',
  'popup-legend': 'sports-car.glb',
  'midnight-drift': 'mazda-rx7.glb',
  'v8-thunder': 'dodge-charger.glb',
  'safari-rally': 'suv.glb',
  'city-pickup': 'pickup-truck.glb',
  'electric-sprint': 'ignition-labs-car.glb',
  'classic-gt': 'convertible.glb',
  'monster-hauler': 'humvee.glb',
  'track-day-racer': 'sports-car.glb',
  'widebody-coupe': 'dominus-body-v2.glb',
  'carbon-supercar': 'ferrari-f40.glb',
  'grand-tourer': 'range-rover.glb',
  'rallycross-pro': 'buggy.glb',
  'aero-prototype': 'alternate-car.glb',
  'hyper-roadster': 'convertible-open-top.glb',
  'twin-turbo-legend': 'dodge-charger.glb',
  'apex-xr': 'sports-car-alt.glb',
  'nebula-hyper': 'ignition-labs-car.glb',
};
const NEWS_COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`;
const NEWS_COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });
const NEWS_COUNTRIES = NEWS_COUNTRY_CODES.split(' ').map((code) => ({
  code,
  name: NEWS_COUNTRY_NAMES.of(code),
}));
const NEWS_LOCALES = {
  AR: 'es-AR',
  AT: 'de-AT',
  AU: 'en-AU',
  BE: 'nl-BE',
  BR: 'pt-BR',
  CA: 'en-CA',
  CH: 'de-CH',
  CL: 'es-CL',
  CO: 'es-CO',
  DE: 'de-DE',
  DK: 'da-DK',
  ES: 'es-ES',
  FI: 'fi-FI',
  FR: 'fr-FR',
  GB: 'en-GB',
  IE: 'en-IE',
  IN: 'en-IN',
  IT: 'it-IT',
  JP: 'ja-JP',
  MX: 'es-MX',
  NL: 'nl-NL',
  NO: 'nb-NO',
  NZ: 'en-NZ',
  PL: 'pl-PL',
  PT: 'pt-PT',
  SE: 'sv-SE',
  US: 'en-US',
};
async function startGarage() {
  // One writer per browser prevents a second garage tab duplicating away rewards.
  if (navigator.locks) {
    const owner = await new Promise((resolve) =>
      navigator.locks.request('afterhours-garage', { ifAvailable: true }, (lock) => {
        resolve(Boolean(lock));
        return lock ? new Promise(() => {}) : undefined;
      })
    );
    if (!owner) {
      document.body.innerHTML =
        '<main class="empty"><h1>Your garage is open in another tab.</h1><p>Keep playing there, or close that tab and refresh this page.</p><button onclick="location.reload()">Try again</button></main>';
      return;
    }
  }
  const $ = (s) => document.querySelector(s),
    key = 'afterhours-garage-v1';
  const themeKey = 'afterhours-garage-theme';
  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    $('meta[name="theme-color"]').content = dark ? '#10191d' : '#edf0df';
    $('#themeToggle').setAttribute('aria-pressed', String(dark));
    $('#themeToggle').setAttribute(
      'aria-label',
      dark ? 'Dark mode is on. Switch to light mode' : 'Light mode is on. Switch to dark mode'
    );
    $('#themeToggle').innerHTML =
      `<span aria-hidden="true">${dark ? '☀' : '◐'}</span><b>Dark / Light</b>`;
  }
  let theme = 'light';
  try {
    theme = localStorage.getItem(themeKey) === 'dark' ? 'dark' : 'light';
  } catch {
    // The switch still works for this visit when browser storage is unavailable.
  }
  applyTheme(theme);
  $('#themeToggle').onclick = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      // Keep the selected theme for this visit.
    }
    applyTheme(theme);
  };
  let state;
  try {
    state = JSON.parse(localStorage.getItem(key));
    if (!state || state.version !== 1 || !state.parts) state = newState();
  } catch {
    state = newState();
  }
  state = migrateState(state);
  settle(state);
  let view = 'parts',
    category = 'Needed',
    query = '',
    selectedRepair = null,
    pendingFitId = null,
    fittingAnimation = null,
    sellConfirmationStep = 0,
    repair = false,
    angle = 0.6;
  let factIndex = 0,
    answered = false;
  const newsCache = new Map();
  let newsCountry = NEWS_COUNTRIES.find((country) => country.code === 'NO'),
    newsStatus = 'Choose a country to update the headlines.';
  let carNewsCache = null,
    carNewsCachedAt = 0;
  let hitTargets = [];
  const money = (n) => '£' + Math.floor(n).toLocaleString('en-GB');
  function save() {
    try {
      saveActiveCar(state);
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      toast('Storage is unavailable. Keep this tab open to preserve your garage.');
    }
  }
  function toast(text) {
    $('#toast').textContent = text;
    $('#toast').classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
  }
  function showPurchaseDenied() {
    document.body.classList.remove('purchase-denied');
    void $('.app').offsetWidth;
    document.body.classList.add('purchase-denied');
    clearTimeout(showPurchaseDenied.timer);
    showPurchaseDenied.timer = setTimeout(
      () => document.body.classList.remove('purchase-denied'),
      1000
    );
  }
  function act(fn, message) {
    settle(state);
    const result = fn();
    if (result === false) {
      showPurchaseDenied();
      toast('Not enough money yet. Car facts can help you earn a little more.');
      return;
    }
    save();
    render();
    if (message) toast(message);
  }
  function render() {
    const missing = blockers(state),
      hourly = rate(state),
      activeCar = getCar(state.carId),
      pendingPart = PARTS.find((p) => p.id === pendingFitId);
    loadVehicleModel(activeCar);
    $('#bank').textContent = money(state.bank);
    $('#collect').textContent = `Collect ${money(state.pending)} ↗`;
    $('#collect').disabled = state.pending < 1;
    $('#status').textContent = !state.owned
      ? 'Barn find · waiting for you'
      : hourly
        ? `● ${activeCar.name} · road ready`
        : state.clean < 100
          ? 'Restoration in progress'
          : missing.length
            ? `${missing.length} essential parts needed`
            : 'Time for a clean';
    $('#meters').innerHTML =
      `<div class="meter"><label>Body condition <b>${Math.round(100 - state.rust)}%</b></label><progress max="100" value="${100 - state.rust}"></progress></div><div class="meter"><label>Tyre life <b>${Math.round(state.parts.tyres?.condition || 0)}%</b></label><progress max="100" value="${state.parts.tyres?.condition || 0}"></progress></div>`;
    const tier = (id) => state.parts[id]?.tier || 0;
    $('#meters').insertAdjacentHTML(
      'beforeend',
      `<div class="trump-stats"><span>SPEED<b>${tier('engine') * 25 + tier('gearbox') * 8}</b></span><span>GRIP<b>${tier('tyres') * 25 + tier('brakes') * 8}</b></span><span>RELIABILITY<b>${Math.round(Object.values(state.parts).reduce((n, p) => n + p.condition, 0) / Math.max(1, Object.keys(state.parts).length))}</b></span></div>`
    );
    $('#care').innerHTML = !state.owned
      ? `<button class="primary" id="buyCar">Adopt the Comet · ${money(CONFIG.CAR_PRICE)}</button>`
      : `<button id="clean">✧ ${state.clean < 100 ? 'Scrub rust · Free' : `Wash & protect · ${money(CONFIG.WASH_PRICE)}`}</button><button id="repair">${repair ? 'Exit inspection' : '⌖ Repair me'}</button>`;
    $('#stageLabel').textContent = state.owned
      ? `${activeCar.type.toUpperCase()} / ${activeCar.name.toUpperCase()}`
      : '1978 / LITTLE COMET';
    $('#carCanvas').classList.toggle('fitting', Boolean(pendingPart));
    $('.car-hint').textContent = pendingPart
      ? `Tap the highlighted ${fitLocation(pendingPart)} to fit ${pendingPart.name}`
      : '↔ Drag to look around · arrow keys to rotate';
    $('#buyCar')?.addEventListener('click', () =>
      act(() => buyCar(state), 'Your Comet is home. Let’s clean it up!')
    );
    $('#clean')?.addEventListener('click', () => {
      const isPaidWash = state.clean >= 100;
      act(
        () => cleanCar(state),
        isPaidWash
          ? 'Washed and protected for the road!'
          : state.clean < 75
            ? 'A little shinier. Keep scrubbing!'
            : 'Looking good!'
      );
    });
    $('#repair')?.addEventListener('click', () => {
      pendingFitId = null;
      repair = !repair;
      render();
      toast('Tap an outlined part, or choose a missing part below.');
      category = 'Needed';
      view = 'parts';
      render();
    });
    let step = !state.owned
      ? [
          '01 / THE BARN FIND',
          'Every great car starts somewhere.',
          'Buy your rusty Comet. Your budget covers the car and six essential parts.',
        ]
      : state.clean < 100
        ? [
            '02 / A LITTLE ELBOW GREASE',
            'Let’s find the colour underneath.',
            'Press Scrub rust four times to restore the body. Cleaning is always free.',
          ]
        : missing.length
          ? [
              '03 / MAKE IT YOURS',
              `${missing.length} pieces away from your first adventure.`,
              `Fit the essential parts below. Need a little extra? Answer a car fact for £40.`,
            ]
          : [
              '04 / READY WHEN YOU ARE',
              'Your next adventure happens afterhours.',
              `Your car drives only while this tab is hidden or closed. Come back to collect. ${money(hourly)}/hour • driving stops if an essential part wears out.`,
            ];
    if (pendingPart) {
      step = [
        'READY TO FIT',
        `Where does the ${pendingPart.name} go?`,
        `Tap the highlighted ${fitLocation(pendingPart)}. You will only pay when you fit it.`,
      ];
    }
    $('#tutorial').innerHTML =
      view === 'garage'
        ? ''
        : `<span class="step">${step[0]}</span><h3>${step[1]}</h3><p>${step[2]}</p>`;
    if (repair && state.owned) {
      const issues = blockers(state);
      $('#care').insertAdjacentHTML(
        'beforeend',
        `<div class="repair-list">${issues.length ? issues.map((p) => `<button data-repair="${p.id}">Repair ${p.name} →</button>`).join('') : 'All essential parts are working.'}</div>`
      );
      $('#care')
        .querySelectorAll('[data-repair]')
        .forEach((b) => (b.onclick = () => openRepair(b.dataset.repair)));
    }
    if (pendingPart) {
      $('#care').insertAdjacentHTML(
        'beforeend',
        `<div class="fit-instruction"><strong>${pendingPart.name}</strong><span>Tap the ${fitLocation(pendingPart)} on the car</span><button id="cancelFit">Cancel</button></div>`
      );
      $('#cancelFit').onclick = () => {
        pendingFitId = null;
        render();
      };
    }
    document
      .querySelectorAll('[data-view]')
      .forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    $('#search').hidden = view !== 'parts';
    $('#filters').hidden = view !== 'parts';
    $('#heading').textContent =
      view === 'parts'
        ? 'Little parts. Big possibilities.'
        : view === 'garage'
          ? 'Your garage, your next ride.'
          : view === 'activity'
            ? 'Stories from the road.'
            : view === 'facts'
              ? 'Get to know your car.'
              : view === 'news'
                ? `Real news from around ${newsCountry.name}.`
                : 'Fresh stories from the car world.';
    $('#overline').textContent =
      view === 'parts'
        ? 'BUILD SOMETHING GOOD'
        : view === 'activity'
          ? 'THE ROAD LOG'
          : view === 'garage'
            ? 'THE CAR COLLECTION'
            : view === 'facts'
              ? 'THE CURIOUS DRIVER'
              : view === 'news'
                ? 'THE AFTERHOURS GAZETTE'
                : 'THE MOTORING DESK';
    $('#summary').textContent =
      view === 'parts'
        ? `${Object.keys(state.parts).length} / ${PARTS.length} fitted`
        : view === 'garage'
          ? `${Object.keys(state.cars || {}).length} / ${CAR_CATALOG.length} owned`
          : '';
    if (view === 'parts') renderParts();
    if (view === 'garage') renderGarage();
    if (view === 'activity') renderActivity();
    if (view === 'facts') renderFacts();
    if (view === 'news') renderNews();
    if (view === 'carnews') renderCarNews();
  }
  function openRepair(id) {
    const p = PARTS.find((p) => p.id === id);
    view = 'parts';
    category = 'All';
    query = p.name.toLowerCase();
    selectedRepair = id;
    $('#search').value = p.name;
    render();
    $('#content').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function fitLocation(part) {
    if (
      part.id === 'tyres' ||
      part.category === 'Running gear' ||
      part.category === 'Chassis details'
    )
      return 'front wheel';
    if (part.id === 'windshield') return 'windscreen';
    if (part.category === 'Cabin') return 'cabin';
    if (part.category === 'Body' || part.category === 'Finishing touches') return 'body';
    return 'front of the car';
  }
  function beginFit(id) {
    const part = PARTS.find((p) => p.id === id);
    if (!part || !state.owned) return;
    if (state.bank < partCost(state, part)) {
      showPurchaseDenied();
      toast('Not enough money yet. Car facts can help you earn a little more.');
      return;
    }
    pendingFitId = id;
    repair = false;
    render();
    $('#carCanvas').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('#carCanvas').focus({ preventScroll: true });
    toast(`Now tap the ${fitLocation(part)} to fit ${part.name}.`);
  }
  function completeFit(id) {
    const part = PARTS.find((p) => p.id === id);
    act(() => {
      const fitted = buyPart(state, id);
      if (fitted) {
        fittingAnimation = { part, startedAt: performance.now() };
        pendingFitId = null;
      }
      return fitted;
    }, `${part.name} fitted. A little closer to the open road.`);
  }
  function renderParts() {
    const cats = ['Needed', 'All', ...new Set(PARTS.map((p) => p.category))];
    $('#filters').innerHTML = cats
      .map((c) => `<button class="${c === category ? 'active' : ''}" data-cat="${c}">${c}</button>`)
      .join('');
    $('#filters')
      .querySelectorAll('button')
      .forEach(
        (b) =>
          (b.onclick = () => {
            category = b.dataset.cat;
            selectedRepair = null;
            query = '';
            $('#search').value = '';
            renderParts();
          })
      );
    const list = PARTS.filter(
      (p) =>
        (category === 'All' || (category === 'Needed' && p.required) || p.category === category) &&
        (selectedRepair ? p.id === selectedRepair : p.name.toLowerCase().includes(query))
    );
    $('#content').className = 'parts-grid';
    $('#content').innerHTML =
      list
        .map((p) => {
          const owned = state.parts[p.id],
            cost = partCost(state, p),
            max = owned?.tier === 3 && owned.condition === 100,
            actionText = max
              ? 'Fully upgraded'
              : pendingFitId === p.id
                ? `Tap ${fitLocation(p)} ↑`
                : owned?.condition < 100
                  ? 'Choose replacement'
                  : owned
                    ? 'Choose upgrade'
                    : 'Choose & place';
          return `<article class="part-card ${owned ? 'installed' : ''} ${pendingFitId === p.id ? 'fitting' : ''}"><div class="part-top"><span class="part-icon">${{ Engine: '⚙', 'Engine internals': '⚙', 'Running gear': '◉', 'Chassis details': '◉', Electrics: 'ϟ', Body: '▱', 'Finishing touches': '✧', Cabin: '▤' }[p.category]}</span><span class="badge">${owned ? `LEVEL ${owned.tier} / ${Math.round(owned.condition)}%` : p.required ? 'ESSENTIAL' : 'OPTIONAL'}</span></div><div class="part-category">${p.category}</div><h3>${p.name}</h3><p>${p.description}</p><div class="part-meta">${owned ? (owned.tier < 3 ? '+ £14/hr with next level' : 'Premium specification') : p.required ? 'Needed to drive' : '+ £3/hr when fitted'}</div><div class="part-actions"><button class="${owned ? 'secondary' : 'primary'}" data-buy="${p.id}" ${!state.owned || max ? 'disabled' : ''}>${actionText}${max || pendingFitId === p.id ? '' : ` · ${money(cost)}`}</button>${owned ? `<button class="sell" data-sell="${p.id}" aria-label="Sell ${p.name}" ${pendingFitId === p.id ? 'disabled' : ''}>Sell</button>` : ''}</div></article>`;
        })
        .join('') || '<p class="empty">No parts found. Try another search.</p>';
    $('#content')
      .querySelectorAll('[data-buy]')
      .forEach((b) => (b.onclick = () => beginFit(b.dataset.buy)));
    $('#content')
      .querySelectorAll('[data-sell]')
      .forEach(
        (b) =>
          (b.onclick = () =>
            act(
              () => sellPart(state, b.dataset.sell),
              'Part sold. Missing essentials pause driving.'
            ))
      );
  }
  function renderGarage() {
    $('#content').className = 'car-gallery';
    $('#content').innerHTML =
      `<div class="garage-toolbar"><p>Each ride has its own parts, condition and Top Trumps stats. Earn lifetime money to unlock it, then pay from your bank.</p><button id="sellCar" class="sell-car" ${state.owned ? '' : 'disabled'}>Sell car</button></div><div class="car-grid">${CAR_CATALOG.map(
        (car) => {
          const owned = Boolean(state.cars?.[car.id]),
            active = state.carId === car.id,
            earnedShort = Math.max(0, car.price - state.totalEarned),
            bankShort = Math.max(0, car.price - state.bank),
            locked = !owned && car.id !== 'little-comet' && earnedShort > 0,
            unavailable = !owned && (locked || bankShort > 0),
            actionText = active
              ? 'Current car'
              : owned
                ? 'Switch to car'
                : car.id === 'little-comet'
                  ? `Adopt · ${money(car.price)}`
                  : unavailable
                    ? locked
                      ? `Earn ${money(earnedShort)} more to unlock`
                      : `Need ${money(bankShort)} in bank`
                    : `Buy car · ${money(car.price)}`,
            features = [
              car.spoiler && 'Spoiler',
              car.bodyKit && 'Body kit',
              car.convertible && 'Convertible',
              car.popups && 'Popup lights',
              car.monster && 'Monster wheels',
              car.pickup && 'Pickup bed',
            ].filter(Boolean);
          return `<article class="car-card ${active ? 'active' : ''} ${unavailable ? 'locked' : ''}" style="--car-paint:${car.color}"><div class="car-card-top"><span class="car-type">${car.type}</span><span class="car-status">${active ? 'CURRENT' : owned ? 'OWNED' : locked ? 'LOCKED' : carExoticness(car) >= 65 ? 'EXOTIC' : 'AVAILABLE'}</span></div><div class="car-card-art" aria-hidden="true"><span class="mini-car"><i class="mini-roof"></i><i class="mini-body"></i><i class="mini-wheel left"></i><i class="mini-wheel right"></i>${car.spoiler ? '<i class="mini-spoiler"></i>' : ''}</span></div><h3>${car.name}</h3><div class="car-specs">${[
            ['DESIRABILITY', car.desirability, 10],
            ['POWER', car.power, 10],
            ['SPEED', car.speed, 10],
            ['SAFETY', car.safety, 10],
            ['SEATS', car.seats, 7],
          ]
            .map(
              ([label, value, max]) =>
                `<div class="car-spec"><span>${label}<b>${value}${label === 'SEATS' ? '' : '/10'}</b></span><progress max="${max}" value="${value}"></progress></div>`
            )
            .join(
              ''
            )}</div><div class="car-score"><span>EXOTIC SCORE <b>${carExoticness(car)}/100</b></span><span>AWAY RATE <b>${money(Math.round(138 * carEarningsMultiplier(car.id)))} / hr</b></span></div><div class="car-features">${features.map((feature) => `<span>${feature}</span>`).join('') || '<span>Classic trim</span>'}</div><p class="car-cost">${owned ? `Invested ${money(state.cars[car.id].investment)}` : `Price ${money(car.price)}${car.id === 'little-comet' ? '' : ` · lifetime unlock ${money(car.price)}`}`}</p><button class="${active ? 'secondary' : 'primary'} car-action" data-car-action="${car.id}" ${active || unavailable ? 'disabled' : ''}>${actionText}</button></article>`;
        }
      ).join('')}</div>`;
    $('#sellCar').onclick = beginSellConfirmation;
    $('#content')
      .querySelectorAll('[data-car-action]')
      .forEach((button) => {
        button.onclick = () => {
          const car = getCar(button.dataset.carAction),
            alreadyOwned = Boolean(state.cars?.[car.id]);
          if (car.id !== 'little-comet' && !alreadyOwned && state.totalEarned < car.price) {
            toast(`Earn ${money(car.price - state.totalEarned)} more to unlock ${car.name}.`);
            return;
          }
          if (!alreadyOwned && state.bank < car.price) {
            showPurchaseDenied();
            toast(`You need ${money(car.price - state.bank)} more in your bank.`);
            return;
          }
          act(
            () => (alreadyOwned ? switchCar(state, car.id) : buyVehicle(state, car.id)),
            alreadyOwned ? `${car.name} is ready to drive.` : `${car.name} added to your garage.`
          );
        };
      });
  }
  function beginSellConfirmation() {
    if (!state.owned || !state.carId) return;
    sellConfirmationStep = 1;
    renderSellConfirmation();
    $('#sellCarDialog').showModal();
  }
  function renderSellConfirmation() {
    const car = getCar(state.carId),
      value = vehicleSaleValue(state),
      prompts = [
        [
          `Sell ${car.name}?`,
          `The estimated offer is ${money(value)}. Your parts and upgrades are included in the car's value.`,
        ],
        [
          'Are you certain?',
          'Selling removes this car from your collection. Any other garage cars will be kept.',
        ],
        ['One last check', `Sell ${car.name} for ${money(value)}? This cannot be undone.`],
      ];
    $('#sellCarDialog').innerHTML =
      `<h2>${prompts[sellConfirmationStep - 1][0]}</h2><p>${prompts[sellConfirmationStep - 1][1]}</p><div class="dialog-actions"><button id="cancelCarSale">Keep car</button><button id="continueCarSale" class="${sellConfirmationStep === 3 ? 'danger' : 'primary'}">${sellConfirmationStep === 3 ? `Sell for ${money(value)}` : 'Continue'}</button></div>`;
    $('#cancelCarSale').onclick = () => $('#sellCarDialog').close();
    $('#continueCarSale').onclick = () => {
      if (sellConfirmationStep < 3) {
        sellConfirmationStep++;
        renderSellConfirmation();
        return;
      }
      const soldName = car.name;
      $('#sellCarDialog').close();
      view = 'garage';
      act(() => sellVehicle(state), `${soldName} sold for ${money(value)}.`);
    };
  }
  function trackPath(name) {
    const mountainTracks = ['Alpine pass', 'Summit Serpent', 'Glacier Pass', 'Midnight Mountain'],
      coastalTracks = ['Coastal loop', 'Fjordlight Loop', 'Saltwind Raceway', 'Lighthouse Run'];
    return mountainTracks.includes(name)
      ? 'M70 110 L110 30 Q140 10 160 40 L200 115 Q220 145 240 110 L285 35 Q340 15 345 80 Q330 140 270 135 L90 140 Z'
      : coastalTracks.includes(name)
        ? 'M70 110 C0 10 135 0 195 40 S370 25 355 85 S280 140 205 115 S105 170 70 110 Z'
        : 'M70 110 C10 20 220 5 210 55 S370 10 350 90 S125 170 70 110Z';
  }
  function trackLandscape(name) {
    if (['Alpine pass', 'Summit Serpent', 'Glacier Pass', 'Midnight Mountain'].includes(name))
      return '#d8dedd';
    if (['Coastal loop', 'Fjordlight Loop', 'Saltwind Raceway', 'Lighthouse Run'].includes(name))
      return '#c9e2df';
    return '#e6ebcd';
  }
  function renderActivity() {
    $('#content').className = 'activity-grid';
    $('#content').innerHTML =
      `<div class="stats-grid"><div class="stat"><span>AWAY EARNING RATE</span><strong>${money(rate(state))}<small>/hr</small></strong></div><div class="stat"><span>DISTANCE EXPLORED</span><strong>${state.totalDistance.toFixed(1)}<small>km</small></strong></div><div class="stat"><span>LIFETIME EARNINGS</span><strong>${money(state.totalEarned)}</strong></div></div><p class="activity-note">Your car rests while you’re here. Tracks unlock at £160/hr and £220/hr. Basic tyres last 20 driving hours; better tyres last longer. Rust builds over three real days.</p>` +
      (state.activity.length
        ? state.activity
            .map(
              (a, i) =>
                `<article class="track-card"><svg viewBox="0 0 400 160" aria-label="Illustration of ${a.track}" role="img"><rect width="400" height="160" fill="${trackLandscape(a.track)}"/><path d="M0 130 Q90 45 150 135 T400 110" fill="none" stroke="#c2d2b5" stroke-width="60"/><path d="${trackPath(a.track)}" fill="none" stroke="#657568" stroke-width="17"/><path d="${trackPath(a.track)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="6 8"/><circle cx="70" cy="110" r="7" fill="#d7ef70"/></svg><div><span class="eyebrow">${i === 0 ? 'LATEST ADVENTURE' : 'FROM YOUR LOGBOOK'}</span><h3>${a.track}</h3><p>${a.distance.toFixed(1)} km · ${Math.max(1, Math.round(a.hours * 60))} minutes away</p><strong>+ ${money(a.earned)}</strong></div></article>`
            )
            .join('')
        : '<div class="empty"><span>↗</span><h3>The road is waiting.</h3><p>Make your car road ready, switch to another tab, then come back. Your adventures will appear here.</p></div>');
  }
  const facts = [
    [
      'Why does a car need a differential?',
      'When a car turns, the outside wheels travel farther than the inside wheels. A differential allows driven wheels to turn at different speeds.',
      'What does it allow?',
      ['Different wheel speeds', 'Square wheels'],
      0,
    ],
    [
      'Your tyres have a tiny job with a big responsibility.',
      'Tyres are the only parts of your car that normally touch the road. Tread grooves help move water away from the contact area.',
      'What do tread grooves help move?',
      ['Water', 'The dashboard'],
      0,
    ],
    [
      'The radiator is your engine’s cooling station.',
      'Coolant carries heat away from the engine. In the radiator, that heat passes into the surrounding air.',
      'What does a radiator help control?',
      ['Engine temperature', 'Radio volume'],
      0,
    ],
    [
      'A battery gets things started.',
      'The battery supplies electrical energy to start the engine. Once the engine is running, the alternator supplies electricity and recharges the battery.',
      'What recharges the battery?',
      ['The alternator', 'The windscreen'],
      0,
    ],
    [
      'Braking turns motion into heat.',
      'Friction between brake pads and discs slows the wheels. Much of the moving car’s energy becomes heat.',
      'Brakes turn movement into…',
      ['Heat', 'Petrol'],
      0,
    ],
    [
      'Oil is a quiet hero.',
      'Engine oil forms a film between moving surfaces. It reduces friction and wear, and also helps carry away heat.',
      'Oil helps reduce…',
      ['Friction', 'The number of wheels'],
      0,
    ],
  ];
  function renderFacts() {
    const f = facts[factIndex % facts.length];
    $('#content').className = 'facts-view';
    $('#content').innerHTML =
      `<article class="fact-card"><div class="eyebrow">THE CURIOUS DRIVER / ${(factIndex % facts.length) + 1} OF ${facts.length}</div><div class="fact-symbol">✧</div><h2>${f[0]}</h2><p>${f[1]}</p><hr><h3>${f[2]}</h3><p class="reward">A little knowledge pays off. Earn £40 for the correct answer.</p><div class="fact-answers">${
        f[4] === 0
          ? [...f[3]]
              .sort(() => 0.5 - Math.random())
              .map((answer) => `<button data-answer="${answer}">${answer}</button>`)
              .join('')
          : ''
      }</div><button id="nextFact" hidden>Next car fact →</button></article>`;
    $('#content')
      .querySelectorAll('[data-answer]')
      .forEach(
        (b) =>
          (b.onclick = () => {
            if (answered) return;
            if (b.dataset.answer !== f[3][f[4]]) {
              toast('Have another look at the fact and try again.');
              return;
            }
            answered = true;
            state.bank += 40;
            state.factsRead++;
            save();
            $('#bank').textContent = money(state.bank);
            toast('Good thinking! £40 added to your bank.');
            $('#nextFact').hidden = false;
            $('#content')
              .querySelectorAll('[data-answer]')
              .forEach((x) => (x.disabled = true));
          })
      );
    if (answered) {
      $('#nextFact').hidden = false;
      $('#content')
        .querySelectorAll('[data-answer]')
        .forEach((x) => (x.disabled = true));
    }
    $('#nextFact').onclick = () => {
      factIndex++;
      answered = false;
      renderFacts();
    };
  }
  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
  function isToday(timestamp) {
    if (!timestamp) return false;
    const saved = new Date(timestamp),
      today = new Date();
    return (
      saved.getFullYear() === today.getFullYear() &&
      saved.getMonth() === today.getMonth() &&
      saved.getDate() === today.getDate()
    );
  }
  function safeGoogleNewsUrl(value) {
    try {
      const url = new URL(value);
      if (
        url.protocol === 'https:' &&
        (url.hostname === 'news.google.com' || url.hostname.endsWith('.news.google.com'))
      )
        return url.href;
    } catch {
      // Invalid feed URLs fall back to Google News.
    }
    return 'https://news.google.com/';
  }
  function newsShell(content) {
    const now = new Date(),
      locale = NEWS_LOCALES[newsCountry.code] || 'en-US',
      editionDate = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
    $('#content').className = 'news-view';
    $('#content').innerHTML =
      `<header class="newspaper-head"><span>NEWS FROM ${escapeHtml(newsCountry.name)} · GOOGLE NEWS</span><h2>${escapeHtml(newsCountry.name)} today</h2><time datetime="${now.toISOString().slice(0, 10)}">${editionDate}</time></header><form id="countryNewsForm" class="news-country-search"><label for="countryNewsInput">Find news by country</label><div class="country-search-row"><input id="countryNewsInput" type="search" list="newsCountries" value="${escapeHtml(newsCountry.name)}" placeholder="Search a country" autocomplete="off" required /><datalist id="newsCountries">${NEWS_COUNTRIES.map((country) => `<option value="${escapeHtml(country.name)}"></option>`).join('')}</datalist><button class="primary" type="submit">Show news</button></div><p id="countryNewsError" aria-live="polite">${escapeHtml(newsStatus)}</p></form><p class="newspaper-deck">Latest headlines from ${escapeHtml(newsCountry.name)}. Open a story through Google News to read the full report.</p>${content}`;
    $('#countryNewsForm').onsubmit = (event) => {
      event.preventDefault();
      const value = $('#countryNewsInput').value.trim().toLocaleLowerCase(),
        selected = NEWS_COUNTRIES.find(
          (country) =>
            country.name.toLocaleLowerCase() === value || country.code.toLowerCase() === value
        );
      if (!selected) {
        newsStatus = 'Choose a country from the suggestions.';
        $('#countryNewsError').textContent = newsStatus;
        return;
      }
      newsCountry = selected;
      newsStatus = `Showing headlines from ${newsCountry.name}.`;
      $('#heading').textContent = `Real news from around ${newsCountry.name}.`;
      renderNews(true);
    };
  }
  function showLiveNews(items, country, cachedAt) {
    const locale = NEWS_LOCALES[country.code] || 'en-US';
    const lead = items[0],
      published = (item) =>
        new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'short',
        }).format(item.published);
    newsShell(
      `<article class="news-lead"><div class="news-kicker">TOP STORY · ${published(lead)}</div><h2><a href="${escapeHtml(lead.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lead.title)}</a></h2>${lead.summary ? `<p>${escapeHtml(lead.summary)}</p>` : ''}<a class="news-read" href="${escapeHtml(lead.link)}" target="_blank" rel="noopener noreferrer">Read the full story →</a></article><aside class="news-numbers news-source"><div class="news-kicker">FROM GOOGLE NEWS</div><strong>${items.length} fresh stories</strong><p>Headlines are selected for ${escapeHtml(country.name)} and refreshed daily.</p><a href="https://news.google.com/" target="_blank" rel="noopener noreferrer">Open Google News →</a><small>Updated ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(cachedAt))}</small></aside>${items
        .slice(1)
        .map(
          (item, index) =>
            `<article class="news-brief"><div class="news-kicker">${index === 0 ? 'LATEST' : 'IN THE NEWS'} · ${published(item)}</div><h3><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}<a class="news-read" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Google News →</a></article>`
        )
        .join(
          ''
        )}<footer class="news-footer">Source: Google News · Links open at Google News · Updated daily</footer>`
    );
  }
  async function renderNews(forceRefresh = false) {
    const country = newsCountry,
      cached = newsCache.get(country.code);
    if (!forceRefresh && cached && isToday(cached.cachedAt)) {
      showLiveNews(cached.items, country, cached.cachedAt);
      return;
    }
    newsShell(
      `<div class="news-loading" role="status"><span></span><h3>Fetching news from ${escapeHtml(country.name)}…</h3><p>Connecting to the latest country edition.</p></div>`
    );
    const controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 7000),
      locale = NEWS_LOCALES[country.code] || 'en-US',
      language = locale.split('-')[0],
      feed = new URL('https://news.google.com/rss');
    feed.searchParams.set('hl', locale);
    feed.searchParams.set('gl', country.code);
    feed.searchParams.set('ceid', `${country.code}:${language}`);
    try {
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.href)}`,
        {
          signal: controller.signal,
          cache: 'no-store',
        }
      );
      if (!response.ok) throw new Error(`News reader returned ${response.status}`);
      const data = await response.json();
      if (data.status !== 'ok' || !Array.isArray(data.items))
        throw new Error('Country news feed was unavailable');
      const items = data.items.slice(0, 7).map((item) => {
        const description = String(item.description || item.content || ''),
          summary = new DOMParser()
            .parseFromString(description, 'text/html')
            .body.textContent.replace(/\s+/g, ' ')
            .trim(),
          published = new Date(item.pubDate || Date.now());
        return {
          title: String(item.title || `News from ${country.name}`).trim(),
          link: safeGoogleNewsUrl(item.link || ''),
          summary: summary.length > 560 ? `${summary.slice(0, 557)}…` : summary,
          published: Number.isNaN(published.getTime()) ? new Date() : published,
        };
      });
      if (!items.length) throw new Error('Country news feed contained no stories');
      const cachedAt = Date.now();
      newsCache.set(country.code, { items, cachedAt });
      if (view === 'news' && newsCountry.code === country.code)
        showLiveNews(items, country, cachedAt);
    } catch (error) {
      if (view !== 'news' || newsCountry.code !== country.code) return;
      newsShell(
        `<div class="news-error"><div class="news-kicker">NEWS UNAVAILABLE</div><h3>Could not load news from ${escapeHtml(country.name)}.</h3><p>Check your connection and try again.</p><button id="retryNews" class="primary">Try again</button><a href="https://news.google.com/" target="_blank" rel="noopener noreferrer">Open Google News directly →</a></div>`
      );
      $('#retryNews').onclick = () => renderNews(true);
      console.warn(`Could not load news from ${country.name}:`, error.message);
    } finally {
      clearTimeout(timeout);
    }
  }
  function safeCarNewsUrl(value) {
    try {
      const url = new URL(value);
      if (
        url.protocol === 'https:' &&
        (url.hostname === 'caranddriver.com' || url.hostname.endsWith('.caranddriver.com'))
      )
        return url.href;
    } catch {
      // Invalid feed URLs fall back to the publisher's front page.
    }
    return 'https://www.caranddriver.com/';
  }
  function carNewsShell(content) {
    const now = new Date(),
      editionDate = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
    $('#content').className = 'news-view car-news-view';
    $('#content').innerHTML =
      `<header class="newspaper-head"><span>LIVE MOTORING NEWS · CAR AND DRIVER</span><h2>The motoring desk</h2><time datetime="${now.toISOString().slice(0, 10)}">${editionDate}</time></header><p class="newspaper-deck">A longer read from the motoring desk: these are excerpts from the publisher's feed, with the full story and reporting one click away.</p>${content}`;
  }
  function showCarNews(items) {
    const lead = items[0],
      published = (item) =>
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'short',
        }).format(item.published);
    carNewsShell(
      `<article class="news-lead"><div class="news-kicker">TOP STORY · ${published(lead)}</div><h2><a href="${escapeHtml(lead.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lead.title)}</a></h2>${lead.summary ? `<p>${escapeHtml(lead.summary)}</p>` : ''}<a class="news-read" href="${escapeHtml(lead.link)}" target="_blank" rel="noopener noreferrer">Read at Car and Driver →</a></article><aside class="news-numbers news-source"><div class="news-kicker">FROM THE CAR WORLD</div><strong>${items.length} fresh stories</strong><p>Current headlines and summaries from Car and Driver's official feed.</p><a href="https://www.caranddriver.com/" target="_blank" rel="noopener noreferrer">Open Car and Driver →</a><small>Updated ${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(carNewsCachedAt))}</small></aside>${items
        .slice(1)
        .map(
          (item, index) =>
            `<article class="news-brief"><div class="news-kicker">${index === 0 ? 'LATEST' : 'ON THE ROAD'} · ${published(item)}</div><h3><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}<a class="news-read" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Car and Driver →</a></article>`
        )
        .join(
          ''
        )}<footer class="news-footer">Source: Car and Driver · Links open at the publisher · New edition every day</footer>`
    );
  }
  async function renderCarNews(forceRefresh = false) {
    if (!forceRefresh && carNewsCache && isToday(carNewsCachedAt)) {
      showCarNews(carNewsCache);
      return;
    }
    carNewsShell(
      '<div class="news-loading" role="status"><span></span><h3>Fetching fresh car news…</h3><p>Connecting to the Car and Driver news feed.</p></div>'
    );
    const controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 7000),
      feed = encodeURIComponent('https://www.caranddriver.com/rss/all.xml/');
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feed}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`News reader returned ${response.status}`);
      const data = await response.json();
      if (data.status !== 'ok' || !Array.isArray(data.items))
        throw new Error('Car news feed was unavailable');
      const items = data.items.slice(0, 7).map((item) => {
        const summary = new DOMParser()
            .parseFromString(item.description || '', 'text/html')
            .body.textContent.replace(/\s+/g, ' ')
            .trim(),
          published = new Date(item.pubDate || Date.now());
        return {
          title: String(item.title || 'New story from Car and Driver').trim(),
          link: safeCarNewsUrl(item.link || ''),
          summary: summary.length > 560 ? `${summary.slice(0, 557)}…` : summary,
          published: Number.isNaN(published.getTime()) ? new Date() : published,
        };
      });
      if (!items.length) throw new Error('Car news feed contained no stories');
      carNewsCache = items;
      carNewsCachedAt = Date.now();
      if (view === 'carnews') showCarNews(items);
    } catch (error) {
      if (view !== 'carnews') return;
      carNewsShell(
        '<div class="news-error"><div class="news-kicker">CAR NEWS IS OFFLINE</div><h3>The stories hit a roadblock.</h3><p>Check your internet connection and try again.</p><button id="retryCarNews" class="primary">Try again</button><a href="https://www.caranddriver.com/" target="_blank" rel="noopener noreferrer">Open Car and Driver directly →</a></div>'
      );
      $('#retryCarNews').onclick = () => renderCarNews(true);
      console.warn('Could not load car news:', error.message);
    } finally {
      clearTimeout(timeout);
    }
  }
  $('#search').oninput = (e) => {
    selectedRepair = null;
    query = e.target.value.toLowerCase();
    renderParts();
  };
  document.querySelectorAll('[data-view]').forEach(
    (b) =>
      (b.onclick = () => {
        view = b.dataset.view;
        pendingFitId = null;
        answered = false;
        render();
      })
  );
  $('#collect').onclick = () =>
    act(() => {
      const amount = Math.floor(state.pending);
      state.bank += amount;
      state.pending -= amount;
    }, 'Adventure money collected!');
  $('#reset').onclick = () => $('#confirmDialog').showModal();
  $('#cancelReset').onclick = () => $('#confirmDialog').close();
  $('#confirmReset').onclick = () => {
    state = newState();
    selectedRepair = null;
    pendingFitId = null;
    fittingAnimation = null;
    query = '';
    category = 'Needed';
    view = 'parts';
    repair = false;
    $('#search').value = '';
    save();
    $('#confirmDialog').close();
    render();
  };
  function leave() {
    if (state.awaySince === null) {
      settle(state);
      state.awaySince = Date.now();
      save();
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) leave();
    else {
      const earned = settle(state);
      save();
      render();
      if (earned >= 1) toast(`Welcome home! Your car earned ${money(earned)}.`);
    }
  });
  window.addEventListener('pagehide', leave);
  window.addEventListener('pageshow', () => {
    if (!document.hidden) {
      settle(state);
      save();
      render();
    }
  });
  // A heartbeat records when an unexpectedly closed browser was last active.
  setInterval(() => {
    if (!document.hidden) {
      settle(state);
      save();
      render();
    }
  }, 30000);
  const canvas = $('#carCanvas'),
    ctx = canvas.getContext('2d'),
    vehicleViewport = $('.vehicle-stage'),
    vehicleCanvas = $('#vehicleCanvas'),
    renderer = (() => {
      try {
        return new THREE.WebGLRenderer({ canvas: vehicleCanvas, alpha: true, antialias: true });
      } catch (error) {
        vehicleCanvas.hidden = true;
        console.warn('WebGL is unavailable; using the built-in car artwork.', error);
        return null;
      }
    })(),
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(32, 600 / 420, 0.1, 100),
    vehicleGroup = new THREE.Group(),
    modelLoader = new GLTFLoader(),
    modelCache = new Map();
  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  camera.position.set(4.4, 2.7, 5.6);
  camera.lookAt(0, 0.75, 0);
  scene.add(new THREE.HemisphereLight(0xe8f4f2, 0x34453e, 2.1));
  const keyLight = new THREE.DirectionalLight(0xfff5df, 3.2);
  keyLight.position.set(-3, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xb9d8ff, 1.2);
  fillLight.position.set(4, 3, -4);
  scene.add(fillLight);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 10),
    new THREE.ShadowMaterial({ opacity: 0.19 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.025;
  ground.receiveShadow = true;
  scene.add(ground, vehicleGroup);
  let modelLoaded = false,
    currentModelKey = '',
    modelRequest = 0;
  function showVehicleModel(source, car, file) {
    const model = source.clone(true),
      bounds = new THREE.Box3().setFromObject(model),
      size = bounds.getSize(new THREE.Vector3()),
      center = bounds.getCenter(new THREE.Vector3()),
      scale = 3.45 / Math.max(size.x, size.y, size.z, 0.001);
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    vehicleGroup.clear();
    vehicleGroup.add(model);
    vehicleGroup.userData.modelFile = file;
    vehicleGroup.userData.carId = car.id;
    currentModelKey = `${car.id}:${file}`;
    modelLoaded = true;
  }
  function loadVehicleModel(car) {
    if (!renderer) return;
    const file = CAR_MODEL_FILES[car.id],
      key = `${car.id}:${file}`;
    if (!file || key === currentModelKey) return;
    currentModelKey = key;
    modelLoaded = false;
    const request = ++modelRequest,
      cached = modelCache.get(file);
    if (cached) {
      showVehicleModel(cached, car, file);
      return;
    }
    modelLoader.load(
      new URL(`./assets/cars/${file}`, import.meta.url).href,
      (gltf) => {
        modelCache.set(file, gltf.scene);
        if (request === modelRequest) showVehicleModel(gltf.scene, car, file);
      },
      undefined,
      (error) => {
        if (request !== modelRequest) return;
        currentModelKey = '';
        modelLoaded = false;
        console.warn(`Could not load ${car.name} model; using the built-in car.`, error);
      }
    );
  }
  function resizeVehicleRenderer() {
    if (!renderer) return;
    const { width, height } = vehicleViewport.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resizeVehicleRenderer).observe(vehicleViewport);
  resizeVehicleRenderer();
  let drag = null;
  canvas.onpointerdown = (e) => {
    drag = { x: e.clientX, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
  };
  canvas.onpointermove = (e) => {
    if (drag) {
      angle += (e.clientX - drag.x) * 0.012;
      drag.moved += Math.abs(e.clientX - drag.x);
      drag.x = e.clientX;
    }
  };
  canvas.onpointerup = (e) => {
    if (drag && drag.moved < 8 && (repair || pendingFitId)) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * 600) / rect.width,
        y = ((e.clientY - rect.top) * 420) / rect.height;
      const target = hitTargets.find((t) => Math.hypot(x - t.x, y - t.y) < (t.radius || 42));
      if (target?.action === 'fit') completeFit(target.id);
      if (target?.action === 'repair') openRepair(target.id);
    }
    drag = null;
  };
  canvas.onpointercancel = () => (drag = null);
  canvas.onkeydown = (e) => {
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      angle += e.key === 'ArrowLeft' ? -0.15 : 0.15;
    }
    if (pendingFitId && ['Enter', ' '].includes(e.key)) {
      e.preventDefault();
      completeFit(pendingFitId);
    }
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw() {
    if (document.hidden) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, 600, 420);
    ctx.save();
    ctx.globalAlpha = modelLoaded ? 0 : 1;
    ctx.translate(300, 235);
    const vehicle = getCar(state.carId);
    ctx.fillStyle = '#142c2920';
    ctx.beginPath();
    ctx.ellipse(0, 70, 208, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    const cos = Math.cos(angle),
      sin = Math.sin(angle);
    const project = ([x, y, z]) => [
      (x * cos - z * sin) * 1.2,
      (x * sin + z * cos) * 0.37 - y * 1.2,
    ];
    let faces = [];
    function box(x, y, z, w, h, d, color) {
      const v = [
        [x, y, z],
        [x + w, y, z],
        [x + w, y, z + d],
        [x, y, z + d],
        [x, y + h, z],
        [x + w, y + h, z],
        [x + w, y + h, z + d],
        [x, y + h, z + d],
      ];
      [
        [0, 1, 5, 4],
        [1, 2, 6, 5],
        [2, 3, 7, 6],
        [3, 0, 4, 7],
        [4, 5, 6, 7],
      ].forEach((ids, i) =>
        faces.push({
          points: ids.map((n) => project(v[n])),
          depth: ids.reduce((n, j) => n + v[j][0] * sin + v[j][2] * cos, 0) / 4,
          color: color[i % color.length],
        })
      );
    }
    const shade = (hex, amount) =>
        '#' +
        [1, 3, 5]
          .map((index) =>
            Math.max(0, Math.min(255, Number.parseInt(hex.slice(index, index + 2), 16) + amount))
              .toString(16)
              .padStart(2, '0')
          )
          .join(''),
      rusty = state.rust > 45,
      paint = rusty
        ? ['#a96943', '#b57c50', '#976247', '#bd8655', '#cc9564']
        : [
            shade(vehicle.color, 18),
            shade(vehicle.color, 36),
            shade(vehicle.color, -14),
            shade(vehicle.color, 4),
            shade(vehicle.color, 46),
          ];
    function polygon(v, color) {
      faces.push({
        points: v.map(project),
        depth: v.reduce((sum, p) => sum + p[0] * sin + p[2] * cos, 0) / v.length,
        color,
      });
    }
    function discOnEnd(x, centerY, centerZ, radius, color, sides = 16) {
      polygon(
        Array.from({ length: sides }, (_, index) => {
          const discAngle = (index / sides) * Math.PI * 2;
          return [
            x,
            centerY + Math.cos(discAngle) * radius,
            centerZ + Math.sin(discAngle) * radius,
          ];
        }),
        color
      );
    }
    function roundedShell(sections, bottom, top, colors) {
      const rings = sections.map(([x, halfWidth, shoulder]) => [
        [x, bottom + 8, -halfWidth],
        [x, bottom, -halfWidth + 10],
        [x, bottom, halfWidth - 10],
        [x, bottom + 8, halfWidth],
        [x, top - shoulder, halfWidth],
        [x, top, halfWidth - 11],
        [x, top, -halfWidth + 11],
        [x, top - shoulder, -halfWidth],
      ]);
      rings.forEach((ring, section) => {
        if (section === rings.length - 1) return;
        ring.forEach((point, side) =>
          polygon(
            [
              point,
              ring[(side + 1) % ring.length],
              rings[section + 1][(side + 1) % ring.length],
              rings[section + 1][side],
            ],
            colors[side % colors.length]
          )
        );
      });
      polygon(rings[0], colors[2]);
      polygon([...rings.at(-1)].reverse(), colors[0]);
    }
    const wheelRadius = vehicle.monster ? 42 : vehicle.pickup ? 32 : 27,
      wheelHeight = vehicle.monster ? 14 : 12,
      wheelDepth = vehicle.monster ? 27 : 20,
      rimColors = {
        steel: '#b6c2b1',
        classic: '#d7d8ca',
        alloy: '#c7d8d0',
        rally: '#d7b94f',
        tuner: '#ca6670',
        utility: '#909a8d',
        monster: '#d1dbd1',
        track: '#d5d9e2',
        aero: '#95d5d4',
      },
      spokeCount =
        { alloy: 5, rally: 5, tuner: 6, track: 6, aero: 7, monster: 8 }[vehicle.wheelStyle] || 0;
    function wheel(x, z) {
      const ring = (depth, radius) =>
        Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return [x + Math.cos(a) * radius, wheelHeight + Math.sin(a) * radius, depth];
        });
      const front = ring(z, wheelRadius),
        back = ring(z + wheelDepth, wheelRadius);
      polygon(front, '#243633');
      polygon(back, '#243633');
      front.forEach((p, i) =>
        polygon(
          [p, front[(i + 1) % 16], back[(i + 1) % 16], back[i]],
          i < 8 ? '#263936' : '#182724'
        )
      );
      polygon(ring(z - 0.4, wheelRadius * 0.6), rimColors[vehicle.wheelStyle] || '#b6c2b1');
      polygon(
        ring(z + wheelDepth + 0.4, wheelRadius * 0.6),
        rimColors[vehicle.wheelStyle] || '#b6c2b1'
      );
      polygon(ring(z - 0.6, wheelRadius * 0.26), '#425e55');
      polygon(ring(z + wheelDepth + 0.6, wheelRadius * 0.26), '#425e55');
      for (let spoke = 0; spoke < spokeCount; spoke++) {
        const spokeAngle = (spoke / spokeCount) * Math.PI * 2,
          innerX = Math.cos(spokeAngle) * wheelRadius * 0.13,
          innerY = Math.sin(spokeAngle) * wheelRadius * 0.13,
          outerX = Math.cos(spokeAngle) * wheelRadius * 0.52,
          outerY = Math.sin(spokeAngle) * wheelRadius * 0.52,
          sideX = Math.cos(spokeAngle + Math.PI / 2) * 2,
          sideY = Math.sin(spokeAngle + Math.PI / 2) * 2;
        polygon(
          [
            [x + innerX - sideX, wheelHeight + innerY - sideY, z - 0.8],
            [x + outerX - sideX, wheelHeight + outerY - sideY, z - 0.8],
            [x + outerX + sideX, wheelHeight + outerY + sideY, z - 0.8],
            [x + innerX + sideX, wheelHeight + innerY + sideY, z - 0.8],
          ],
          '#f0f3e8'
        );
      }
    }
    for (const x of vehicle.monster ? [-112, 112] : [-97, 98])
      for (const z of [-71, 51]) wheel(x, z);
    roundedShell(
      [
        [-150, 45, 12],
        [-140, 57, 8],
        [-118, 61, 6],
        [112, 61, 6],
        [140, 55, 9],
        [151, 39, 13],
      ],
      20,
      67,
      paint
    );
    roundedShell(
      [
        [-145, 44, 10],
        [-136, 56, 7],
        [-76, 59, 6],
      ],
      57,
      73,
      paint
    );
    roundedShell(
      [
        [75, 58, 7],
        [122, 57, 8],
        [144, 45, 12],
      ],
      57,
      72,
      paint
    );
    const cabinSections = vehicle.pickup
      ? [
          [-68, 37, 17],
          [-57, 51, 10],
          [-39, 54, 7],
          [5, 52, 8],
          [18, 40, 15],
        ]
      : [
          [-68, 37, 17],
          [-57, 51, 10],
          [-39, 54, 7],
          [58, 54, 7],
          [77, 49, 11],
          [86, 34, 18],
        ];
    roundedShell(
      cabinSections,
      63,
      vehicle.convertible ? 95 : vehicle.pickup ? 104 : vehicle.monster ? 108 : 116,
      paint
    );
    if (vehicle.convertible) {
      box(-28, 67, -27, 24, 18, 23, ['#935d55', '#704b46']);
      box(20, 67, 4, 24, 18, 23, ['#935d55', '#704b46']);
    } else {
      polygon(
        [
          [-56, 75, -54],
          [-42, 106, -45],
          [5, 108, -45],
          [5, 75, -54],
        ],
        '#294c50'
      );
      polygon(
        [
          [12, 75, -54],
          [12, 108, -45],
          [61, 104, -43],
          [76, 75, -52],
        ],
        '#294c50'
      );
      polygon(
        [
          [-56, 75, 54],
          [-42, 106, 45],
          [5, 108, 45],
          [5, 75, 54],
        ],
        '#35585b'
      );
      polygon(
        [
          [12, 75, 54],
          [12, 108, 45],
          [61, 104, 43],
          [76, 75, 52],
        ],
        '#35585b'
      );
    }
    if (vehicle.pickup) {
      box(-143, 63, -42, 78, 13, 84, [shade(vehicle.color, -20), shade(vehicle.color, 8)]);
      box(-145, 77, -43, 78, 3, 4, [shade(vehicle.color, -35)]);
      box(-145, 77, 39, 78, 3, 4, [shade(vehicle.color, -35)]);
      box(-67, 77, -43, 3, 3, 86, [shade(vehicle.color, -35)]);
    }
    if (vehicle.bodyKit) {
      box(-112, 20, -66, 224, 8, 8, ['#253b3a']);
      box(-112, 20, 58, 224, 8, 8, ['#253b3a']);
      box(145, 21, -64, 18, 7, 128, ['#253b3a']);
    }
    if (vehicle.spoiler) {
      box(-153, 82, -76, 8, 4, 152, [shade(vehicle.color, 30)]);
      box(-150, 70, -57, 4, 13, 5, ['#253b3a']);
      box(-150, 70, 52, 4, 13, 5, ['#253b3a']);
    }
    if (vehicle.popups) {
      box(143, 67, -44, 10, 13, 30, ['#f5e7ad', '#d8c781']);
      box(143, 67, 14, 10, 13, 30, ['#f5e7ad', '#d8c781']);
    }
    polygon(
      [
        [89, 76, -27],
        [89, 101, -25],
        [89, 101, 25],
        [89, 76, 27],
      ],
      '#24484a'
    );
    polygon(
      [
        [-71, 76, -27],
        [-71, 101, -25],
        [-71, 101, 25],
        [-71, 76, 27],
      ],
      '#35585b'
    );
    box(15, 66, -64, 16, 3, 4, ['#b8c3b0']);
    box(15, 66, 60, 16, 3, 4, ['#b8c3b0']);
    box(71, 72, -71, 13, 10, 12, paint);
    box(71, 72, 59, 13, 10, 12, paint);
    if (state.rust > 10) {
      for (let i = 0; i < Math.ceil(state.rust / 9); i++) {
        const x = -130 + ((i * 37) % 250);
        box(x, 30 + ((i * 11) % 24), -60.5, 8 + (i % 4), 5, 1, ['#985b36']);
        box(x, 30 + ((i * 11) % 24), 60, 8 + (i % 4), 5, 1, ['#985b36']);
      }
    }
    box(148, 26, -60, 7, 13, 120, ['#b9bda9']);
    box(-154, 26, -60, 7, 13, 120, ['#b9bda9']);
    polygon(
      [
        [156, 31, -31],
        [156, 31, 31],
        [156, 49, 31],
        [156, 49, -31],
      ],
      '#29423d'
    );
    for (let grilleBar = -24; grilleBar <= 24; grilleBar += 8) {
      polygon(
        [
          [157, 33, grilleBar - 1],
          [157, 33, grilleBar + 1],
          [157, 47, grilleBar + 1],
          [157, 47, grilleBar - 1],
        ],
        '#9eaea5'
      );
    }
    discOnEnd(158, 53, -40, 10, '#fff0a8');
    discOnEnd(158.5, 53, -40, 5, '#f7d95f');
    discOnEnd(158, 53, 40, 10, '#fff0a8');
    discOnEnd(158.5, 53, 40, 5, '#f7d95f');
    polygon(
      [
        [159, 29, -14],
        [159, 29, 14],
        [159, 38, 14],
        [159, 38, -14],
      ],
      '#f2eee0'
    );
    discOnEnd(-157, 51, -43, 9, '#b94f42');
    discOnEnd(-157, 51, 43, 9, '#b94f42');
    polygon(
      [
        [-158, 30, -15],
        [-158, 38, -15],
        [-158, 38, 15],
        [-158, 30, 15],
      ],
      '#f2eee0'
    );
    faces
      .sort((a, b) => a.depth - b.depth)
      .forEach((f) => {
        ctx.beginPath();
        f.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.strokeStyle = '#18362b22';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });
    const visibleSide = cos >= 0 ? 61.5 : -61.5;
    const drawBodyLine = (points, color = '#365f55', width = 1.6) => {
      ctx.beginPath();
      points
        .map(project)
        .forEach(([lineX, lineY], index) =>
          index ? ctx.lineTo(lineX, lineY) : ctx.moveTo(lineX, lineY)
        );
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    };
    drawBodyLine([
      [-137, 66, visibleSide],
      [-75, 69, visibleSide],
      [74, 69, visibleSide],
      [139, 64, visibleSide],
    ]);
    drawBodyLine([
      [-58, 28, visibleSide],
      [-58, 72, visibleSide],
      [-42, 106, Math.sign(visibleSide) * 45],
    ]);
    drawBodyLine([
      [7, 27, visibleSide],
      [7, 108, Math.sign(visibleSide) * 45],
    ]);
    drawBodyLine([
      [77, 29, visibleSide],
      [77, 73, visibleSide],
      [62, 103, Math.sign(visibleSide) * 43],
    ]);
    drawBodyLine(
      [
        [83, 72, visibleSide],
        [116, 71, visibleSide],
        [143, 63, Math.sign(visibleSide) * 44],
      ],
      '#527b70',
      1.2
    );
    for (const wheelX of [-97, 98]) {
      drawBodyLine(
        Array.from({ length: 13 }, (_, index) => {
          const archAngle = (index / 12) * Math.PI;
          return [wheelX + Math.cos(archAngle) * 34, 14 + Math.sin(archAngle) * 34, visibleSide];
        }),
        '#2e5048',
        2.4
      );
    }
    drawBodyLine(
      [
        [-29, 66, visibleSide + Math.sign(visibleSide) * 1.5],
        [-15, 66, visibleSide + Math.sign(visibleSide) * 1.5],
      ],
      '#d9e0d3',
      3
    );
    drawBodyLine(
      [
        [38, 66, visibleSide + Math.sign(visibleSide) * 1.5],
        [52, 66, visibleSide + Math.sign(visibleSide) * 1.5],
      ],
      '#d9e0d3',
      3
    );
    if (
      (repair && blockers(state).some((p) => p.id === 'windshield')) ||
      pendingFitId === 'windshield'
    ) {
      ctx.beginPath();
      [
        [90, 76, -27],
        [90, 101, -25],
        [90, 101, 25],
        [90, 76, 27],
      ]
        .map(project)
        .forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
    hitTargets = [];
    const anchorFor = (part) => {
      if (part.id === 'tyres' || part.id === 'brakes') return [98, 12, 61];
      if (part.id === 'gearbox') return [10, 38, 48];
      if (part.id === 'battery') return [112, 66, 42];
      if (part.id === 'windshield') return [70, 91, 0];
      if (part.category === 'Running gear' || part.category === 'Chassis details')
        return [98, 12, 61];
      if (part.category === 'Cabin') return [0, 93, 48];
      if (part.category === 'Body') return [8, 52, 61];
      if (part.category === 'Finishing touches') return [-105, 53, 58];
      return [112, 66, 35];
    };
    const drawEnginePreview = (x, y, spin, scale = 1) => {
      const previewFaces = [],
        previewCos = Math.cos(spin),
        previewSin = Math.sin(spin),
        previewProject = ([localX, localY, localZ]) => [
          x + (localX * previewCos - localZ * previewSin) * scale,
          y + ((localX * previewSin + localZ * previewCos) * 0.34 - localY) * scale,
        ];
      const previewBox = (boxX, boxY, boxZ, width, height, depth, colors) => {
        const vertices = [
          [boxX, boxY, boxZ],
          [boxX + width, boxY, boxZ],
          [boxX + width, boxY, boxZ + depth],
          [boxX, boxY, boxZ + depth],
          [boxX, boxY + height, boxZ],
          [boxX + width, boxY + height, boxZ],
          [boxX + width, boxY + height, boxZ + depth],
          [boxX, boxY + height, boxZ + depth],
        ];
        [
          [0, 1, 5, 4],
          [1, 2, 6, 5],
          [2, 3, 7, 6],
          [3, 0, 4, 7],
          [4, 5, 6, 7],
        ].forEach((indices, side) =>
          previewFaces.push({
            points: indices.map((index) => previewProject(vertices[index])),
            depth:
              indices.reduce(
                (total, index) =>
                  total + vertices[index][0] * previewSin + vertices[index][2] * previewCos,
                0
              ) / indices.length,
            color: colors[side % colors.length],
          })
        );
      };
      previewBox(-25, 0, -15, 50, 25, 30, ['#4f655d', '#324a43', '#6f8378']);
      previewBox(-18, 25, -11, 36, 11, 22, ['#9bad9f', '#60756c', '#b7c4b5']);
      previewBox(-29, 7, -11, 7, 12, 22, ['#213a35', '#304d45']);
      previewBox(22, 7, -11, 7, 12, 22, ['#213a35', '#304d45']);
      previewBox(-12, 36, -8, 10, 4, 16, ['#c5f46b', '#8db844']);
      previewFaces
        .sort((a, b) => a.depth - b.depth)
        .forEach((face) => {
          ctx.beginPath();
          face.points.forEach(([pointX, pointY], index) =>
            index ? ctx.lineTo(pointX, pointY) : ctx.moveTo(pointX, pointY)
          );
          ctx.closePath();
          ctx.fillStyle = face.color;
          ctx.fill();
          ctx.strokeStyle = '#172a3288';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      const pulley = previewProject([30, 12, 0]);
      ctx.beginPath();
      ctx.ellipse(pulley[0], pulley[1], 7 * scale, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#d2ddce';
      ctx.fill();
      ctx.strokeStyle = '#233c36';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pulley[0], pulley[1], 2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#233c36';
      ctx.fill();
    };
    const drawPartPreview = (part, x, y, rotation, scale, opacity) => {
      const glyph =
        {
          'Engine internals': '⚙',
          'Running gear': '◉',
          'Chassis details': '◉',
          Electrics: 'ϟ',
          Body: '▱',
          'Finishing touches': '✧',
          Cabin: '▤',
        }[part.category] || '⚙';
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;
      ctx.shadowColor = '#142c2944';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#203b34';
      ctx.beginPath();
      ctx.roundRect(-57, -21, 114, 42, 10);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#c5f46b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#c5f46b';
      ctx.beginPath();
      ctx.roundRect(-51, -15, 29, 30, 6);
      ctx.fill();
      ctx.fillStyle = '#203b34';
      ctx.font = 'bold 17px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, -36.5, 0);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(part.name.toUpperCase(), -16, 0, 66);
      ctx.restore();
    };
    if (repair) {
      blockers(state).forEach((p) => {
        const [px, py] = project(anchorFor(p));
        const x = px + 300,
          y = py + 235;
        hitTargets.push({ id: p.id, x, y, action: 'repair' });
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#183b32';
        ctx.fillRect(x - 37, y - 10, 74, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, x, y + 4);
      });
    }
    if (pendingFitId) {
      const part = PARTS.find((p) => p.id === pendingFitId);
      const [px, py] = project(anchorFor(part));
      const x = px + 300,
        y = py + 235,
        pulse = reduced ? 0 : Math.sin(Date.now() / 180) * 3;
      hitTargets.push({ id: part.id, x, y, action: 'fit' });
      ctx.fillStyle = '#c5f46b55';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, 30 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#25623d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 37 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      const label = `FIT ${part.name.toUpperCase()} HERE`;
      ctx.font = 'bold 11px sans-serif';
      const labelWidth = Math.min(170, Math.max(105, ctx.measureText(label).width + 20));
      ctx.fillStyle = '#172a32';
      ctx.fillRect(x - labelWidth / 2, y - 58, labelWidth, 25);
      ctx.fillStyle = '#c5f46b';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 41, labelWidth - 14);
      if (part.id === 'engine') {
        const bob = reduced ? 0 : Math.sin(performance.now() / 220) * 5,
          spin = reduced ? 0.55 : performance.now() / 310,
          engineY = y - 69 + bob,
          orbitStart = spin % (Math.PI * 2),
          orbitEnd = orbitStart + Math.PI * 1.45;
        hitTargets.push({ id: part.id, x, y: engineY, radius: 54, action: 'fit' });
        ctx.fillStyle = '#172a3222';
        ctx.beginPath();
        ctx.ellipse(x, y - 20, 35, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#25623d';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, engineY, 47, orbitStart, orbitEnd);
        ctx.stroke();
        const arrowX = x + Math.cos(orbitEnd) * 47,
          arrowY = engineY + Math.sin(orbitEnd) * 47;
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(orbitEnd + Math.PI / 2);
        ctx.fillStyle = '#25623d';
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(6, 5);
        ctx.lineTo(-6, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        drawEnginePreview(x, engineY, spin, 1.28);
      }
    }
    if (fittingAnimation) {
      const elapsed = performance.now() - fittingAnimation.startedAt,
        progress = Math.min(1, elapsed / 1300),
        eased = 1 - Math.pow(1 - progress, 3),
        [px, py] = project(anchorFor(fittingAnimation.part)),
        x = px + 300,
        y = py + 235;
      if (fittingAnimation.part.id === 'engine') {
        const spin = reduced ? 0.55 : performance.now() / 190;
        drawEnginePreview(x, y - 69 + eased * 69, spin, 1.28 - eased * 0.42);
      } else {
        drawPartPreview(
          fittingAnimation.part,
          x,
          y - 82 * (1 - eased),
          reduced ? 0 : (1 - eased) * -0.42,
          1.08 - eased * 0.28,
          1 - Math.max(0, (progress - 0.72) / 0.28)
        );
      }
      ctx.strokeStyle = `rgba(197, 244, 107, ${1 - progress})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 24 + progress * 38, 0, Math.PI * 2);
      ctx.stroke();
      if (progress === 1) fittingAnimation = null;
    }
    if (!drag && !reduced && !pendingFitId) angle += 0.002;
    vehicleGroup.rotation.y = angle;
    if (renderer) renderer.render(scene, camera);
    requestAnimationFrame(draw);
  }
  save();
  render();
  draw();
}
startGarage();
