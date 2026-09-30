import {
  CONFIG,
  PARTS,
  newState,
  blockers,
  rate,
  partCost,
  buyPart,
  sellPart,
  buyCar,
  cleanCar,
  settle,
} from './model.js';
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
  let state;
  try {
    state = JSON.parse(localStorage.getItem(key));
    if (!state || state.version !== 1 || !state.parts) state = newState();
  } catch {
    state = newState();
  }
  settle(state);
  let view = 'parts',
    category = 'Needed',
    query = '',
    selectedRepair = null,
    pendingFitId = null,
    fittingAnimation = null,
    repair = false,
    angle = 0.6;
  let factIndex = 0,
    answered = false;
  let hitTargets = [];
  const money = (n) => '£' + Math.floor(n).toLocaleString('en-GB');
  function save() {
    try {
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
      pendingPart = PARTS.find((p) => p.id === pendingFitId);
    $('#bank').textContent = money(state.bank);
    $('#collect').textContent = `Collect ${money(state.pending)} ↗`;
    $('#collect').disabled = state.pending < 1;
    $('#status').textContent = !state.owned
      ? 'Barn find · waiting for you'
      : hourly
        ? '● Road ready · resting in garage'
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
      `<span class="step">${step[0]}</span><h3>${step[1]}</h3><p>${step[2]}</p>`;
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
        : view === 'activity'
          ? 'Stories from the road.'
          : 'Get to know your car.';
    $('#summary').textContent =
      view === 'parts' ? `${Object.keys(state.parts).length} / ${PARTS.length} fitted` : '';
    if (view === 'parts') renderParts();
    if (view === 'activity') renderActivity();
    if (view === 'facts') renderFacts();
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
  function trackPath(name) {
    return name === 'Alpine pass'
      ? 'M70 110 L110 30 Q140 10 160 40 L200 115 Q220 145 240 110 L285 35 Q340 15 345 80 Q330 140 270 135 L90 140 Z'
      : name === 'Coastal loop'
        ? 'M70 110 C0 10 135 0 195 40 S370 25 355 85 S280 140 205 115 S105 170 70 110 Z'
        : 'M70 110 C10 20 220 5 210 55 S370 10 350 90 S125 170 70 110Z';
  }
  function renderActivity() {
    $('#content').className = 'activity-grid';
    $('#content').innerHTML =
      `<div class="stats-grid"><div class="stat"><span>AWAY EARNING RATE</span><strong>${money(rate(state))}<small>/hr</small></strong></div><div class="stat"><span>DISTANCE EXPLORED</span><strong>${state.totalDistance.toFixed(1)}<small>km</small></strong></div><div class="stat"><span>LIFETIME EARNINGS</span><strong>${money(state.totalEarned)}</strong></div></div><p class="activity-note">Your car rests while you’re here. Tracks unlock at £160/hr and £220/hr. Basic tyres last 20 driving hours; better tyres last longer. Rust builds over three real days.</p>` +
      (state.activity.length
        ? state.activity
            .map(
              (a, i) =>
                `<article class="track-card"><svg viewBox="0 0 400 160" aria-label="Illustration of ${a.track}" role="img"><rect width="400" height="160" fill="${a.track === 'Coastal loop' ? '#c9e2df' : a.track === 'Alpine pass' ? '#d8dedd' : '#e6ebcd'}"/><path d="M0 130 Q90 45 150 135 T400 110" fill="none" stroke="#c2d2b5" stroke-width="60"/><path d="${trackPath(a.track)}" fill="none" stroke="#657568" stroke-width="17"/><path d="${trackPath(a.track)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="6 8"/><circle cx="70" cy="110" r="7" fill="#d7ef70"/></svg><div><span class="eyebrow">${i === 0 ? 'LATEST ADVENTURE' : 'FROM YOUR LOGBOOK'}</span><h3>${a.track}</h3><p>${a.distance.toFixed(1)} km · ${Math.max(1, Math.round(a.hours * 60))} minutes away</p><strong>+ ${money(a.earned)}</strong></div></article>`
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
    ctx = canvas.getContext('2d');
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
    ctx.translate(300, 235);
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
    const rusty = state.rust > 45,
      paint = rusty
        ? ['#a96943', '#b57c50', '#976247', '#bd8655', '#cc9564']
        : ['#7faaa0', '#a1c2b0', '#6d978c', '#82ac9c', '#c0d5b6'];
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
    function wheel(x, z) {
      const ring = (depth, radius) =>
        Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return [x + Math.cos(a) * radius, 12 + Math.sin(a) * radius, depth];
        });
      const front = ring(z, 27),
        back = ring(z + 20, 27);
      polygon(front, '#243633');
      polygon(back, '#243633');
      front.forEach((p, i) =>
        polygon(
          [p, front[(i + 1) % 16], back[(i + 1) % 16], back[i]],
          i < 8 ? '#263936' : '#182724'
        )
      );
      polygon(ring(z - 0.4, 16), '#b6c2b1');
      polygon(ring(z + 20.4, 16), '#b6c2b1');
      polygon(ring(z - 0.6, 7), '#425e55');
      polygon(ring(z + 20.6, 7), '#425e55');
    }
    for (const x of [-97, 98]) for (const z of [-71, 51]) wheel(x, z);
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
    roundedShell(
      [
        [-68, 37, 17],
        [-57, 51, 10],
        [-39, 54, 7],
        [58, 54, 7],
        [77, 49, 11],
        [86, 34, 18],
      ],
      63,
      116,
      paint
    );
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
      }
      ctx.strokeStyle = `rgba(197, 244, 107, ${1 - progress})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 24 + progress * 38, 0, Math.PI * 2);
      ctx.stroke();
      if (progress === 1) fittingAnimation = null;
    }
    if (!drag && !reduced && !pendingFitId) angle += 0.002;
    requestAnimationFrame(draw);
  }
  save();
  render();
  draw();
}
startGarage();
