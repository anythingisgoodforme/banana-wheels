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
  function act(fn, message) {
    settle(state);
    const result = fn();
    if (result === false) {
      toast('Not enough money yet. Car facts can help you earn a little more.');
      return;
    }
    save();
    render();
    if (message) toast(message);
  }
  function render() {
    const missing = blockers(state),
      hourly = rate(state);
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
      : `<button id="clean">✧ ${state.clean < 100 ? 'Scrub rust' : 'Wash & protect'} · Free</button><button id="repair">${repair ? 'Exit inspection' : '⌖ Repair me'}</button>`;
    $('#buyCar')?.addEventListener('click', () =>
      act(() => buyCar(state), 'Your Comet is home. Let’s clean it up!')
    );
    $('#clean')?.addEventListener('click', () =>
      act(
        () => cleanCar(state),
        state.clean < 75 ? 'A little shinier. Keep scrubbing!' : 'Looking good!'
      )
    );
    $('#repair')?.addEventListener('click', () => {
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
            max = owned?.tier === 3 && owned.condition === 100;
          return `<article class="part-card ${owned ? 'installed' : ''}"><div class="part-top"><span class="part-icon">${{ Engine: '⚙', 'Running gear': '◉', Electrics: 'ϟ', Body: '▱', Cabin: '▤' }[p.category]}</span><span class="badge">${owned ? `LEVEL ${owned.tier} / ${Math.round(owned.condition)}%` : p.required ? 'ESSENTIAL' : 'OPTIONAL'}</span></div><div class="part-category">${p.category}</div><h3>${p.name}</h3><p>${p.description}</p><div class="part-meta">${owned ? (owned.tier < 3 ? '+ £14/hr with next level' : 'Premium specification') : p.required ? 'Needed to drive' : '+ £3/hr when fitted'}</div><div class="part-actions"><button class="${owned ? 'secondary' : 'primary'}" data-buy="${p.id}" ${!state.owned || max ? 'disabled' : ''}>${max ? 'Fully upgraded' : owned?.condition < 100 ? 'Replace / upgrade' : owned ? 'Upgrade' : 'Fit part'}${max ? '' : ` · ${money(cost)}`}</button>${owned ? `<button class="sell" data-sell="${p.id}" aria-label="Sell ${p.name}">Sell</button>` : ''}</div></article>`;
        })
        .join('') || '<p class="empty">No parts found. Try another search.</p>';
    $('#content')
      .querySelectorAll('[data-buy]')
      .forEach(
        (b) =>
          (b.onclick = () =>
            act(
              () => buyPart(state, b.dataset.buy),
              'Part fitted. A little closer to the open road.'
            ))
      );
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
    if (drag && drag.moved < 8 && repair) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * 600) / rect.width,
        y = ((e.clientY - rect.top) * 420) / rect.height;
      const target = hitTargets.find((t) => Math.hypot(x - t.x, y - t.y) < 32);
      if (target) openRepair(target.id);
    }
    drag = null;
  };
  canvas.onpointercancel = () => (drag = null);
  canvas.onkeydown = (e) => {
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      angle += e.key === 'ArrowLeft' ? -0.15 : 0.15;
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
    box(-150, 20, -60, 300, 45, 120, paint);
    box(-62, 65, -52, 143, 49, 104, paint);
    box(-54, 73, -54, 57, 34, 2, ['#294c50']);
    box(14, 73, -54, 57, 34, 2, ['#294c50']);
    box(-54, 73, 52, 57, 34, 2, ['#35585b']);
    box(14, 73, 52, 57, 34, 2, ['#35585b']);
    box(80, 73, -44, 2, 32, 88, ['#24484a']);
    box(-64, 73, -44, 2, 32, 88, ['#35585b']);
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
    box(150, 43, -49, 3, 15, 27, ['#fbefb6']);
    box(150, 43, 22, 3, 15, 27, ['#fbefb6']);
    box(-153, 44, -50, 2, 13, 24, ['#b95440']);
    box(-153, 44, 26, 2, 13, 24, ['#b95440']);
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
    if (repair && blockers(state).some((p) => p.id === 'windshield')) {
      ctx.beginPath();
      [
        [83, 72, -44],
        [83, 106, -44],
        [83, 106, 44],
        [83, 72, 44],
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
    if (repair) {
      const anchors = {
        engine: [112, 76, 0],
        tyres: [-95, 10, 60],
        brakes: [97, 10, 60],
        gearbox: [0, 25, 0],
        battery: [110, 68, -45],
        windshield: [82, 95, 0],
      };
      blockers(state).forEach((p) => {
        const [px, py] = project(anchors[p.id]);
        const x = px + 300,
          y = py + 235;
        hitTargets.push({ id: p.id, x, y });
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
    if (!drag && !reduced) angle += 0.002;
    requestAnimationFrame(draw);
  }
  save();
  render();
  draw();
}
startGarage();
