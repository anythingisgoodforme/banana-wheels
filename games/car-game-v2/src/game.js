(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const input = window.CarGameInput;

  const ui = {
    score: document.getElementById("scoreValue"),
    combo: document.getElementById("comboValue"),
    best: document.getElementById("bestValue"),
    bananas: document.getElementById("bananaValue"),
    money: document.getElementById("moneyValue"),
    driver: document.getElementById("driverValue"),
    practice: document.getElementById("practiceValue"),
    boost: document.getElementById("boostFill"),
    panel: document.getElementById("messagePanel"),
    start: document.getElementById("startButton"),
    aiButton: document.getElementById("aiButton"),
    aiWarning: document.getElementById("aiWarning"),
    turboUpgrade: document.getElementById("turboUpgradeButton"),
    turboUpgradeValue: document.getElementById("turboUpgradeValue"),
    magnetUpgrade: document.getElementById("magnetUpgradeButton"),
    magnetUpgradeValue: document.getElementById("magnetUpgradeValue"),
  };

  const assets = {
    truck: loadImage("assets/pickup-truck.svg"),
    trafficCar: loadImage("assets/traffic-car.svg"),
    banana: loadImage("assets/banana.svg"),
  };

  const laneCount = 5;
  const road = {
    x: 210,
    y: 0,
    width: 540,
    height: canvas.height,
  };
  const baseTruckCapacity = 20;
  const magnetTruckCapacity = 50;
  const bananaPrice = 20;
  const sellEvery = 0.14;
  const postSellShieldSeconds = 3;
  const finishScore = 100000;
  const bananaTrafficGap = 90;
  const aiLineSafetyGap = 90;
  const laneLineDangerSeconds = 3;
  const brakingLaneLineDangerSeconds = 4.5;
  const aiDecisionEvery = 0.5;
  const aiLookAheadDistance = 1600;
  const aiLaneChangeSpeed = 520;
  const aiPracticeGoalSeconds = 60 * 60;
  const upgradeMaxLevel = 3;
  const shopZone = {
    x: road.x + road.width - 120,
    worldY: 520,
    width: 96,
    height: 138,
  };

  const state = {
    mode: "menu",
    time: 0,
    lastTraffic: 0,
    lastPickup: 0,
    distance: 0,
    score: 0,
    best: readBestScore(),
    combo: 1,
    comboTimer: 0,
    bananasCollected: 0,
    money: 0,
    upgrades: {
      turbo: 0,
      magnet: 0,
    },
    sellTimer: 0,
    sellShieldTimer: 0,
    shopOpen: false,
    finishLineWorldY: null,
    laneLineTimer: 0,
    policeAttackTimer: 0,
    policeAttackSide: 1,
    currentControls: null,
    aiDriving: false,
    aiTargetX: canvas.width / 2,
    aiDecisionTimer: 0,
    aiControls: null,
    aiLineEscapeTimer: 0,
    aiLineEscapeTarget: null,
    aiPracticeSeconds: readAiPracticeSeconds(),
    aiPracticeSaveTimer: 0,
    aiServerPolicy: null,
    aiPolicyLoadTimer: 0,
    stackWobble: 0,
    boost: 0,
    shake: 0,
    objects: [],
    particles: [],
    player: createPlayer(),
  };
  const music = {
    audio: null,
    master: null,
    timers: [],
    playing: false,
    step: 0,
    songIndex: 0,
    songs: [
      {
        name: "Build Up",
        beatMs: 240,
        length: 16,
        bass: [73.42, 73.42, 98, 110, 123.47, 146.83, 164.81, 196],
        melody: [293.66, 329.63, 392, 493.88, 587.33, 659.25, 783.99, 987.77],
        party: false,
      },
      {
        name: "Banana Party",
        beatMs: 190,
        length: 32,
        bass: [110, 110, 146.83, 110, 164.81, 146.83, 98, 98],
        melody: [440, 493.88, 587.33, 493.88, 659.25, 587.33, 493.88, 392],
        party: true,
      },
      {
        name: "Turbo Street",
        beatMs: 175,
        length: 32,
        bass: [130.81, 130.81, 174.61, 196, 220, 196, 174.61, 146.83],
        melody: [523.25, 659.25, 783.99, 659.25, 880, 783.99, 659.25, 587.33],
        party: true,
      },
      {
        name: "Night Drive",
        beatMs: 215,
        length: 32,
        bass: [98, 123.47, 146.83, 123.47, 87.31, 110, 130.81, 110],
        melody: [392, 466.16, 523.25, 587.33, 523.25, 466.16, 392, 349.23],
        party: true,
      },
    ],
  };

  ui.best.textContent = String(state.best);

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
  }

  function readBestScore() {
    try {
      return Number(localStorage.getItem("car-game-v2-best") || 0);
    } catch (error) {
      return 0;
    }
  }

  function saveBestScore(score) {
    try {
      localStorage.setItem("car-game-v2-best", String(score));
    } catch (error) {
      // Best score persistence is optional when the game is opened from file URLs.
    }
  }

  function readAiPracticeSeconds() {
    try {
      return Number(localStorage.getItem("car-game-v2-ai-practice-seconds") || 0);
    } catch (error) {
      return 0;
    }
  }

  function saveAiPracticeSeconds() {
    try {
      localStorage.setItem("car-game-v2-ai-practice-seconds", String(Math.floor(state.aiPracticeSeconds)));
    } catch (error) {
      // AI practice can still work for this run if browser storage is unavailable.
    }
  }

  function createPlayer() {
    return {
      x: canvas.width / 2,
      y: canvas.height - 112,
      worldY: 0,
      width: 70,
      height: 112,
      vx: 0,
      speed: 270,
      maxSpeed: 760,
      crashed: false,
    };
  }

  function resetGame() {
    state.mode = "playing";
    state.time = 0;
    state.lastTraffic = 0;
    state.lastPickup = 0;
    state.distance = 0;
    state.score = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.bananasCollected = 0;
    state.money = 0;
    state.upgrades = {
      turbo: 0,
      magnet: 0,
    };
    state.sellTimer = 0;
    state.sellShieldTimer = 0;
    state.shopOpen = false;
    state.finishLineWorldY = null;
    state.laneLineTimer = 0;
    state.policeAttackTimer = 0;
    state.policeAttackSide = 1;
    state.currentControls = null;
    state.aiDriving = false;
    state.aiTargetX = state.player.x;
    state.aiDecisionTimer = 0;
    state.aiControls = null;
    state.aiLineEscapeTimer = 0;
    state.aiLineEscapeTarget = null;
    state.stackWobble = 0;
    state.boost = 35;
    state.shake = 0;
    state.objects = [];
    state.particles = [];
    state.player = createPlayer();
    shopZone.worldY = state.player.worldY + 520;
    ui.panel.classList.add("hidden");
    startMusic();
    updateHud();
  }

  function pauseGame() {
    if (state.mode === "playing") {
      state.mode = "paused";
      stopMusic();
      ui.panel.querySelector("h1").textContent = "Paused";
      ui.panel.querySelector("p").textContent = "Press Start Race or P to keep driving.";
      ui.start.textContent = "Resume";
      ui.panel.classList.remove("hidden");
    } else if (state.mode === "paused") {
      state.mode = "playing";
      startMusic();
      ui.panel.classList.add("hidden");
    }
  }

  function getPlayerControls() {
    return {
      steering: (input.isDown("right") ? 1 : 0) - (input.isDown("left") ? 1 : 0),
      up: input.isDown("up"),
      brake: input.isDown("brake"),
      boost: input.isDown("boost"),
    };
  }

  function getAiControls() {
    const heldLine = getHeldAiLineEscape();
    if (heldLine) {
      state.aiControls = null;
      state.aiTargetX = heldLine;
      return {
        steering: getAiSteering(heldLine, true),
        up: false,
        brake: true,
        boost: false,
      };
    }

    const emergency = getAiEmergencyControls();
    if (emergency) {
      state.aiControls = null;
      state.aiTargetX = emergency.targetX;
      return emergency.controls;
    }

    if (state.aiControls) {
      return {
        ...state.aiControls,
        steering: getAiSteering(state.aiTargetX, false),
      };
    }

    const plan = chooseAiPlan();
    state.aiTargetX = plan.targetX;
    const dangerAhead = findDangerCar(aiBrakeLookAhead(), aiSideDistance());
    const cautious = plan.risk > 120 || Boolean(dangerAhead);

    state.aiControls = {
      steering: getAiSteering(plan.targetX, false),
      up: !cautious,
      brake: cautious,
      boost: false,
    };
    return state.aiControls;
  }

  function getAiEmergencyControls() {
    const danger = findDangerCar(aiEmergencyLookAhead(), aiEmergencySideDistance());
    if (!danger) return null;

    const escapeLine = chooseAiLineEscapeTarget();
    const targetX = escapeLine || chooseAiPlan().targetX;
    if (escapeLine) {
      state.aiLineEscapeTimer = 0.85;
      state.aiLineEscapeTarget = escapeLine;
    }
    return {
      targetX,
      controls: {
        steering: getAiSteering(targetX, true),
        up: false,
        brake: true,
        boost: false,
      },
    };
  }

  function getHeldAiLineEscape() {
    if (state.aiLineEscapeTimer <= 0 || state.aiLineEscapeTarget === null) return null;
    if (getAiSafeLaneFromLine(state.aiLineEscapeTarget) !== null) {
      state.aiLineEscapeTarget = null;
      state.aiLineEscapeTimer = 0;
      return null;
    }

    state.aiLineEscapeTimer = 0.85;
    return state.aiLineEscapeTarget;
  }

  function getAiSafeLaneFromLine(lineX) {
    const laneWidth = road.width / laneCount;
    const laneCenters = [lineX - laneWidth / 2, lineX + laneWidth / 2].filter((center) => {
      return center > road.x && center < road.x + road.width;
    });

    let safest = null;
    let bestScore = -Infinity;

    laneCenters.forEach((center) => {
      let blocked = false;
      let score = -Math.abs(center - state.player.x) * 0.04;

      state.objects.forEach((object) => {
        if (object.type !== "trafficCar") return;
        const ahead = object.worldY - state.player.worldY;
        const inLane = Math.abs(object.x - center) < laneWidth * 0.45;
        if (!inLane) return;

        if (ahead > -aiLineSafetyGap && ahead < aiLineSafetyGap) {
          blocked = true;
        }

        if (ahead > -80 && ahead < 520) {
          score -= 1000 / Math.max(60, ahead + 120);
        }
      });

      if (!blocked && score > bestScore) {
        bestScore = score;
        safest = center;
      }
    });

    return safest;
  }

  function getAiSteering(targetX, emergency) {
    const difference = targetX - state.player.x;
    const deadzone = emergency ? 6 : 16;
    const maxSteering = emergency ? 1 : 0.62;

    if (Math.abs(difference) < deadzone && Math.abs(state.player.vx) < 24) return 0;

    const positionSteering = difference / (emergency ? 46 : 135);
    const velocityDamping = state.player.vx / (emergency ? 520 : 360);
    return clamp(positionSteering - velocityDamping, -maxSteering, maxSteering);
  }

  function chooseAiLineEscapeTarget() {
    const laneWidth = road.width / laneCount;
    const stripeLines = Array.from({ length: laneCount - 1 }, (_, lane) => road.x + laneWidth * (lane + 1));
    let bestLine = null;
    let bestScore = -Infinity;

    stripeLines.forEach((lineX) => {
      let closeLeftCar = false;
      let closeRightCar = false;
      let score = -Math.abs(lineX - state.player.x) * 0.08;

      state.objects.forEach((object) => {
        if (object.type !== "trafficCar") return;
        const ahead = object.worldY - state.player.worldY;
        if (ahead < -70 || ahead > 620) return;

        const sideFromPlayer = object.x - state.player.x;
        const distanceFromLine = Math.abs(object.x - lineX);
        const closeBesideTruck = ahead < 420 && Math.abs(sideFromPlayer) < laneWidth * 1.25;

        if (closeBesideTruck && sideFromPlayer < -34) {
          closeLeftCar = true;
        }

        if (closeBesideTruck && sideFromPlayer > 34) {
          closeRightCar = true;
        }

        if (distanceFromLine < laneWidth * 0.55) {
          score += ahead < 360 ? 80 : 28;
        }

        if (distanceFromLine < 42) {
          score -= 900;
        }
      });

      if (closeLeftCar && closeRightCar) score += 520;
      if (Math.abs(lineX - state.player.x) > laneWidth * 1.25) score -= 260;

      if (score > bestScore) {
        bestScore = score;
        bestLine = lineX;
      }
    });

    return bestScore > 360 ? bestLine : null;
  }

  function chooseAiTargetX() {
    return chooseAiPlan().targetX;
  }

  function chooseAiPlan() {
    const laneWidth = road.width / laneCount;
    const laneCenters = getLaneCenters();
    const lookAhead = aiLookAheadDistance + aiSkill() * 1000;
    const banana = findAiWorthwhileBanana(lookAhead);
    const shopCenter = shopZone.x + shopZone.width / 2;
    const currentLaneCenter = getClosestLaneCenter(state.player.x);
    const wantedX = state.shopOpen ? shopCenter : banana ? banana.x : currentLaneCenter;
    let best = wantedX;
    let bestScore = -Infinity;
    let bestRisk = Infinity;

    laneCenters.forEach((center) => {
      let score = -Math.abs(center - wantedX) * 0.08 - Math.abs(center - state.player.x) * 0.05;
      if (Math.abs(center - currentLaneCenter) < 1) score += 42;
      let risk = 0;
      const crossingLeft = Math.min(state.player.x, center) - laneWidth * 0.18;
      const crossingRight = Math.max(state.player.x, center) + laneWidth * 0.18;

      state.objects.forEach((object) => {
        const ahead = object.worldY - state.player.worldY;
        if (ahead < -90 || ahead > lookAhead) return;

        const laneDistance = Math.abs(object.x - center);
        const sameLane = laneDistance < laneWidth * 0.45;

        if (object.type === "trafficCar") {
          const nearLane = laneDistance < laneWidth * 0.82;
          if (sameLane || nearLane) {
            const closeDanger = ahead < 340 ? 28000 : ahead < 720 ? 14000 : 4200;
            const laneFactor = sameLane ? 1 : 0.35;
            const carRisk = (closeDanger * laneFactor * aiDangerWeight()) / Math.max(40, ahead);
            risk += carRisk;
            score -= carRisk;
          }

          const timeToCar = ahead / Math.max(state.player.speed, 1);
          const timeToLane = Math.abs(center - state.player.x) / aiLaneChangeSpeed;
          if (sameLane && timeToCar < timeToLane + 0.55) {
            risk += 260;
            score -= 260;
          }

          const crossingCar = object.x > crossingLeft && object.x < crossingRight;
          if (crossingCar && ahead > -70 && ahead < 900) {
            const timeToCrossCarLane = Math.abs(object.x - state.player.x) / aiLaneChangeSpeed;
            if (timeToCar < timeToCrossCarLane + 0.85) {
              const crossingRisk = ahead < 360 ? 520 : 220;
              risk += crossingRisk;
              score -= crossingRisk;
            }
          }
        }

        if (object.type === "banana" && sameLane && !state.shopOpen) score += ahead < 700 ? 24 : 8;
      });

      if (isOnStripeLine(center)) score -= 100;
      if (score > bestScore) {
        bestScore = score;
        best = center;
        bestRisk = risk;
      }
    });

    return {
      targetX: best,
      score: bestScore,
      risk: bestRisk,
    };
  }

  function getLaneCenters() {
    const laneWidth = road.width / laneCount;
    return Array.from({ length: laneCount }, (_, lane) => road.x + laneWidth * lane + laneWidth / 2);
  }

  function getClosestLaneCenter(x) {
    return getLaneCenters().reduce((best, center) => (Math.abs(center - x) < Math.abs(best - x) ? center : best));
  }

  function findAiWorthwhileBanana(maxAhead) {
    if (state.shopOpen || state.bananasCollected >= getTruckCapacity()) return null;

    let best = null;
    let bestScore = -Infinity;
    state.objects.forEach((object) => {
      if (object.type !== "banana") return;
      const ahead = object.worldY - state.player.worldY;
      if (ahead < 120 || ahead > maxAhead * 0.72) return;

      const sideDistance = Math.abs(object.x - state.player.x);
      if (sideDistance > 110) return;

      const danger = getTrafficRiskNear(object.x, ahead, 520);
      const score = 120 - sideDistance * 0.42 - danger * 2;
      if (score > bestScore) {
        bestScore = score;
        best = object;
      }
    });

    return bestScore > 34 ? best : null;
  }

  function getTrafficRiskNear(x, ahead, range) {
    let risk = 0;
    state.objects.forEach((object) => {
      if (object.type !== "trafficCar") return;
      const carAhead = object.worldY - state.player.worldY;
      if (Math.abs(carAhead - ahead) > range) return;
      const sideDistance = Math.abs(object.x - x);
      if (sideDistance > 120) return;
      risk += (120 - sideDistance) / 120;
    });
    return risk;
  }

  function findClosestObject(type, maxAhead) {
    let closest = null;
    state.objects.forEach((object) => {
      if (object.type !== type) return;
      const ahead = object.worldY - state.player.worldY;
      if (ahead < -40 || ahead > maxAhead) return;
      if (!closest || ahead < closest.worldY - state.player.worldY) closest = object;
    });
    return closest;
  }

  function findDangerCar(maxAhead, maxSideDistance) {
    let closest = null;
    state.objects.forEach((object) => {
      if (object.type !== "trafficCar") return;
      const ahead = object.worldY - state.player.worldY;
      if (ahead < -55 || ahead > maxAhead) return;
      if (Math.abs(object.x - state.player.x) > maxSideDistance) return;
      if (!closest || ahead < closest.worldY - state.player.worldY) closest = object;
    });
    return closest;
  }

  function toggleAiDriving() {
    if (state.mode === "menu") resetGame();
    state.aiDriving = !state.aiDriving;
    state.aiControls = null;
    state.aiDecisionTimer = 0;
    updateHud();
  }

  function updateAiPractice(dt) {
    if (!state.aiDriving || state.aiPracticeSeconds >= aiPracticeGoalSeconds) return;

    state.aiPracticeSeconds = Math.min(aiPracticeGoalSeconds, state.aiPracticeSeconds + dt);
    state.aiPracticeSaveTimer += dt;
    if (state.aiPracticeSaveTimer >= 5 || state.aiPracticeSeconds >= aiPracticeGoalSeconds) {
      state.aiPracticeSaveTimer = 0;
      saveAiPracticeSeconds();
    }
  }

  function aiPracticeSkill() {
    return clamp(state.aiPracticeSeconds / aiPracticeGoalSeconds, 0, 1);
  }

  function aiServerSkill() {
    return state.aiServerPolicy ? clamp(Number(state.aiServerPolicy.skill) || 0, 0, 1) : 0;
  }

  function aiSkill() {
    return Math.max(aiPracticeSkill(), aiServerSkill());
  }

  function aiDangerWeight() {
    const serverValue = state.aiServerPolicy ? Number(state.aiServerPolicy.dangerWeight) || 1 : 1;
    return Math.max(serverValue, 1 + aiPracticeSkill() * 1.35);
  }

  function aiBrakeLookAhead() {
    const serverValue = state.aiServerPolicy ? Number(state.aiServerPolicy.brakeLookAhead) || 560 : 560;
    return Math.max(serverValue, 560 + aiPracticeSkill() * 240);
  }

  function aiEmergencyLookAhead() {
    const serverValue = state.aiServerPolicy ? Number(state.aiServerPolicy.emergencyLookAhead) || 460 : 460;
    return Math.max(serverValue, 460 + aiPracticeSkill() * 200);
  }

  function aiSideDistance() {
    const serverValue = state.aiServerPolicy ? Number(state.aiServerPolicy.sideDistance) || 100 : 100;
    return Math.max(serverValue, 100 + aiPracticeSkill() * 38);
  }

  function aiEmergencySideDistance() {
    const serverValue = state.aiServerPolicy ? Number(state.aiServerPolicy.emergencySideDistance) || 76 : 76;
    return Math.max(serverValue, 76 + aiPracticeSkill() * 34);
  }

  function formatPractice() {
    return `${Math.floor(aiSkill() * 100)}%`;
  }

  function updateAiPolicyLoader(dt) {
    state.aiPolicyLoadTimer -= dt;
    if (state.aiPolicyLoadTimer > 0) return;
    state.aiPolicyLoadTimer = 15;
    loadTrainedAiPolicy();
  }

  function loadTrainedAiPolicy() {
    if (typeof fetch !== "function") return;
    fetch(`trainer/out/banana-ai-driver.json?cache=${Date.now()}`)
      .then((response) => {
        if (!response.ok) throw new Error("No trained AI policy yet");
        return response.json();
      })
      .then((policy) => {
        state.aiServerPolicy = policy;
        updateHud();
      })
      .catch(() => {
        // The game keeps using local practice until server training writes a policy.
      });
  }

  function update(dt) {
    if (state.mode !== "playing") return;

    const player = state.player;
    updateAiDecisionTimer(dt);
    state.aiLineEscapeTimer = Math.max(0, state.aiLineEscapeTimer - dt);
    const controls = state.aiDriving ? getAiControls() : getPlayerControls();
    state.currentControls = controls;
    const boosting = controls.boost && state.boost > 0;
    const selling = canSellBananas();
    const cruisingSpeed = controls.up ? (state.aiDriving ? 500 : 560) : 430;
    const boostedMaxSpeed = player.maxSpeed + state.upgrades.turbo * 85;
    const targetSpeed = selling ? 0 : controls.brake ? (state.aiDriving ? 95 : 210) : boosting ? boostedMaxSpeed : cruisingSpeed;
    const acceleration = targetSpeed > player.speed ? 520 : 680;
    player.speed += Math.sign(targetSpeed - player.speed) * acceleration * dt;
    player.speed = clamp(player.speed, selling ? 0 : state.aiDriving && controls.brake ? 70 : 180, boostedMaxSpeed);

    if (boosting && !selling) {
      state.boost = Math.max(0, state.boost - Math.max(30, 44 - state.upgrades.turbo * 4) * dt);
      emitTrail(player.x, player.y + player.height / 2, "#2fa7f7");
    } else {
      state.boost = Math.min(100, state.boost + (7 + state.upgrades.turbo * 4) * dt);
    }

    const steering = controls.steering;
    player.vx += steering * 1550 * dt;
    player.vx *= Math.pow(0.018, dt);
    player.x += player.vx * dt;
    player.x = clamp(player.x, road.x + 34, road.x + road.width - 34);

    state.time += dt;
    player.worldY += player.speed * dt;
    state.distance = player.worldY;
    const scoreRate = controls.brake ? 0.35 : 1;
    addScore((player.speed * dt * 0.04) * state.combo * scoreRate);
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer === 0) state.combo = 1;
    state.stackWobble *= Math.pow(0.07, dt);
    updateAiPractice(dt);
    updateAiPolicyLoader(dt);
    updateShop(dt);
    updateSellingShield(dt);
    updateFinishLine();
    updatePoliceDanger(dt);

    spawnObjects();
    updateObjects(dt);
    updateParticles(dt);
    checkCollisions();
    state.shake = Math.max(0, state.shake - 60 * dt);
    updateHud();
  }

  function updateAiDecisionTimer(dt) {
    if (!state.aiDriving) {
      state.aiDecisionTimer = 0;
      state.aiControls = null;
      return;
    }

    state.aiDecisionTimer -= dt;
    if (state.aiDecisionTimer <= 0) {
      state.aiDecisionTimer = aiDecisionEvery;
      state.aiControls = null;
    }
  }

  function spawnObjects() {
    const difficulty = Math.min(1, state.time / 80);
    const trafficEvery = 0.48 - difficulty * 0.12;
    const pickupEvery = 1.15 - difficulty * 0.2;
    const cargoLocked = state.shopOpen || state.bananasCollected >= getTruckCapacity();

    if (state.time - state.lastTraffic > trafficEvery) {
      state.lastTraffic = state.time;
      const traffic = createTrafficObject(1500);
      if (traffic) state.objects.push(traffic);
    }

    if (!cargoLocked && state.time - state.lastPickup > pickupEvery) {
      state.lastPickup = state.time;
      const banana = createBananaObject(1300);
      if (banana) state.objects.push(banana);
    }
  }

  function createTrafficObject(spawnAhead) {
    const worldY = state.player.worldY + spawnAhead + Math.random() * 190;
    const laneWidth = road.width / laneCount;
    const occupied = new Set();

    state.objects.forEach((object) => {
      if (object.type !== "trafficCar") return;
      if (Math.abs(object.worldY - worldY) > 680) return;
      const lane = Math.floor((object.x - road.x) / laneWidth);
      occupied.add(clamp(lane, 0, laneCount - 1));
    });

    const openLanes = Array.from({ length: laneCount }, (_, lane) => lane).filter((lane) => !occupied.has(lane));
    if (openLanes.length <= 2) return null;

    const lane = openLanes[Math.floor(Math.random() * openLanes.length)];
    return createObject("trafficCar", lane, spawnAhead, worldY);
  }

  function createBananaObject(spawnAhead) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const lane = Math.floor(Math.random() * laneCount);
      const worldY = state.player.worldY + spawnAhead + Math.random() * 190;
      if (isBananaClearBehindTraffic(lane, worldY)) {
        return createObject("banana", lane, spawnAhead, worldY);
      }
    }

    return null;
  }

  function isBananaClearBehindTraffic(lane, worldY) {
    return !state.objects.some((object) => {
      if (object.type !== "trafficCar" || object.lane !== lane) return false;
      const trafficAheadDistance = object.worldY - worldY;
      return trafficAheadDistance > 0 && trafficAheadDistance < bananaTrafficGap;
    });
  }

  function createObject(type, lane, spawnAhead, fixedWorldY) {
    const laneWidth = road.width / laneCount;
    const x = road.x + laneWidth * lane + laneWidth / 2;
    const width = type === "banana" ? 38 : 56;
    const height = type === "banana" ? 38 : 92;
    const worldY = fixedWorldY || state.player.worldY + spawnAhead + Math.random() * 190;

    return {
      type,
      lane,
      x,
      y: screenYFromWorld(worldY),
      worldY,
      width,
      height,
      rotation: type === "banana" ? Math.random() * 0.5 - 0.25 : Math.PI,
      hit: false,
    };
  }

  function updateObjects(dt) {
    state.objects.forEach((object) => {
      if (object.type === "banana") updateBananaMagnet(object, dt);
      object.y = screenYFromWorld(object.worldY);
      if (object.type === "banana") object.rotation += dt * 4;
    });
    state.objects = state.objects.filter((object) => object.worldY > state.player.worldY - 240 && !object.hit);
  }

  function updateBananaMagnet(object, dt) {
    if (state.upgrades.magnet <= 0 || state.bananasCollected >= getTruckCapacity() || state.shopOpen) return;

    const ahead = object.worldY - state.player.worldY;
    const range = 130 + state.upgrades.magnet * 70;
    const sideRange = 80 + state.upgrades.magnet * 48;
    if (ahead < -60 || ahead > range || Math.abs(object.x - state.player.x) > sideRange) return;

    const pull = 5 + state.upgrades.magnet * 2.2;
    object.x += (state.player.x - object.x) * clamp(dt * pull, 0, 1);
    object.worldY += (state.player.worldY - object.worldY) * clamp(dt * pull, 0, 1);
    emitTrail(object.x, screenYFromWorld(object.worldY), "#ffcc33");
  }

  function updateParticles(dt) {
    state.particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      particle.radius *= 0.985;
    });
    state.particles = state.particles.filter((particle) => particle.life > 0);
  }

  function checkCollisions() {
    const playerBox = worldBoxFromCenter(state.player.x, state.player.worldY, state.player.width, state.player.height, 12, 10);

    state.objects.forEach((object) => {
      const objectBox = worldBoxFromCenter(object.x, object.worldY, object.width, object.height, 7, 7);
      if (object.hit || !overlaps(playerBox, objectBox)) return;

      object.hit = true;
      if (object.type === "banana") {
        if (state.bananasCollected >= getTruckCapacity()) return;
        state.combo = Math.min(8, state.combo + 1);
        state.comboTimer = 3.2;
        state.bananasCollected += 1;
        if (state.bananasCollected >= getTruckCapacity()) openShopAhead();
        state.stackWobble = 1;
        state.boost = Math.min(100, state.boost + 18);
        addScore(75 * state.combo);
        burst(object.x, screenYFromWorld(object.worldY), "#ffcc33", 12);
      } else {
        if (hasSellingShield()) {
          state.shake = Math.max(state.shake, 6);
          burst(object.x, screenYFromWorld(object.worldY), "#2fa7f7", 16);
          addScore(10);
          return;
        }
        burst(state.player.x, state.player.y, "#f05b42", 18);
        endGame();
      }
    });
  }

  function updateShop(dt) {
    if (state.shopOpen && shopZone.worldY < state.player.worldY - 220) {
      shopZone.worldY = state.player.worldY + 520;
    }

    if (!canSellBananas()) {
      state.sellTimer = 0;
      return;
    }

    state.sellTimer += dt;
    if (state.sellTimer >= sellEvery) {
      state.sellTimer = 0;
      state.bananasCollected -= 1;
      state.money += bananaPrice;
      addScore(20);
      state.stackWobble = 1;
      burst(state.player.x + 18, state.player.y - 12, "#ffcc33", 8);
      if (state.bananasCollected === 0) state.shopOpen = false;
    }
  }

  function updateSellingShield(dt) {
    if (canSellBananas()) {
      state.sellShieldTimer = postSellShieldSeconds;
      return;
    }

    state.sellShieldTimer = Math.max(0, state.sellShieldTimer - dt);
  }

  function openShopAhead() {
    if (state.shopOpen) return;
    state.shopOpen = true;
    shopZone.worldY = state.player.worldY + 520;
  }

  function canSellBananas() {
    const playerBox = worldBoxFromCenter(state.player.x, state.player.worldY, state.player.width, state.player.height, 8, 8);
    return state.shopOpen && state.bananasCollected > 0 && overlaps(playerBox, boxFromShopZone());
  }

  function hasSellingShield() {
    return canSellBananas() || state.sellShieldTimer > 0;
  }

  function getTruckCapacity() {
    return state.upgrades.magnet > 0 ? magnetTruckCapacity : baseTruckCapacity;
  }

  function upgradeCost(type) {
    const level = state.upgrades[type];
    if (level >= upgradeMaxLevel) return null;
    return type === "turbo" ? 200 + level * 180 : 240 + level * 220;
  }

  function buyUpgrade(type) {
    const cost = upgradeCost(type);
    if (cost === null || state.money < cost) return;

    state.money -= cost;
    state.upgrades[type] += 1;
    state.stackWobble = 1;
    state.shake = Math.max(state.shake, 4);
    burst(state.player.x, state.player.y - 24, type === "turbo" ? "#2fa7f7" : "#ffcc33", 18);
    updateHud();
  }

  function endGame() {
    stopMusic();
    playFailVoice(state.aiDriving);
    state.mode = "ended";
    state.shake = 18;
    state.best = Math.max(state.best, Math.floor(state.score));
    saveBestScore(state.best);
    ui.panel.querySelector("h1").textContent = "FAIL!!!!!!!!";
    ui.panel.querySelector("p").textContent = `Score ${Math.floor(state.score)}. Press Enter or start a fresh run.`;
    ui.start.textContent = "Race Again";
    ui.panel.classList.remove("hidden");
    updateHud();
  }

  function finishGame() {
    stopMusic();
    state.score = finishScore;
    state.mode = "finished";
    state.shake = 0;
    state.best = Math.max(state.best, finishScore);
    saveBestScore(state.best);
    ui.panel.querySelector("h1").textContent = "Finish Line";
    ui.panel.querySelector("p").textContent = `You reached exactly ${finishScore} score. Press Enter or start a fresh run.`;
    ui.start.textContent = "Race Again";
    ui.panel.classList.remove("hidden");
    updateHud();
  }

  function addScore(amount) {
    if (state.mode !== "playing") return;
    state.score = Math.min(finishScore, state.score + amount);
    if (state.score >= finishScore) finishGame();
  }

  function updateFinishLine() {
    if (state.finishLineWorldY || state.score < finishScore - 2500) return;
    state.finishLineWorldY = state.player.worldY + 620;
  }

  function updatePoliceDanger(dt) {
    if (state.policeAttackTimer > 0) {
      state.policeAttackTimer -= dt;
      state.player.vx += state.policeAttackSide * 1650 * dt;
      state.player.x += state.policeAttackSide * 240 * dt;
      state.shake = Math.max(state.shake, 10);
      emitTrail(state.player.x - state.policeAttackSide * 22, state.player.y + 34, "#17202a");
      if (state.policeAttackTimer <= 0) {
        endPoliceCrash();
      }
      return;
    }

    const onStripeLine = isOnStripeLine(state.player.x);
    if (!onStripeLine) {
      state.laneLineTimer = 0;
      return;
    }

    const braking = Boolean(state.currentControls && state.currentControls.brake);
    const steering = input.isDown("left") || input.isDown("right");
    if (!state.aiDriving && (steering || (!braking && state.player.speed < 160))) {
      state.laneLineTimer = 0;
      return;
    }

    state.laneLineTimer += dt;
    if (state.laneLineTimer >= getLaneLineDangerSeconds()) {
      startPoliceAttack();
    }
  }

  function getLaneLineDangerSeconds() {
    const braking = Boolean(state.currentControls && state.currentControls.brake);
    return braking ? brakingLaneLineDangerSeconds : laneLineDangerSeconds;
  }

  function startPoliceAttack() {
    state.laneLineTimer = 0;
    state.policeAttackTimer = 1.2;
    state.policeAttackSide = state.player.x < road.x + road.width / 2 ? 1 : -1;
    burst(state.player.x - state.policeAttackSide * 26, state.player.y + 14, "#ffcc33", 10);
  }

  function endPoliceCrash() {
    stopMusic();
    playFailVoice(state.aiDriving);
    state.mode = "ended";
    state.shake = 18;
    state.best = Math.max(state.best, Math.floor(state.score));
    saveBestScore(state.best);
    ui.panel.querySelector("h1").textContent = "FAIL!!!!!!!!";
    ui.panel.querySelector("p").textContent = `You stayed centered too long. Score ${Math.floor(state.score)}. Press Enter or start a fresh run.`;
    ui.start.textContent = "Race Again";
    ui.panel.classList.remove("hidden");
    updateHud();
  }

  function playFailVoice(aiFailed) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(aiFailed ? "you failed you dumb thing" : "fail");
    voice.rate = 0.62;
    voice.pitch = 1.35;
    voice.volume = 1;
    window.speechSynthesis.speak(voice);
  }

  function startMusic() {
    if (music.playing) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!music.audio) {
      music.audio = new AudioContext();
      music.master = music.audio.createGain();
      music.master.gain.value = 0.14;
      music.master.connect(music.audio.destination);
    }

    if (music.audio.state === "suspended") {
      music.audio.resume();
    }

    music.playing = true;
    music.step = 0;
    music.songIndex = 0;
    scheduleMusicStep();
  }

  function stopMusic() {
    music.playing = false;
    music.timers.forEach((timer) => window.clearTimeout(timer));
    music.timers = [];
  }

  function scheduleMusicStep() {
    if (!music.playing || !music.audio || !music.master) return;

    const song = music.songs[music.songIndex];
    const step = music.step % song.length;
    const note = step % song.bass.length;
    const buildAmount = song.party ? 1 : (step + 1) / song.length;
    const bassVolume = song.party ? 0.15 : 0.06 + buildAmount * 0.09;
    const melodyVolume = song.party ? 0.06 : 0.02 + buildAmount * 0.04;

    playMusicNote(song.bass[note], song.beatMs / 1000 * 0.78, bassVolume, song.party ? "sawtooth" : "triangle");

    if (song.party || step > 5) {
      if (step % 2 === 0) playMusicNote(song.melody[note], 0.1 + buildAmount * 0.05, melodyVolume, "square");
      if (step % 8 === 6) playMusicNote(song.melody[(note + 2) % song.melody.length] * 1.5, 0.08, melodyVolume * 0.7, "triangle");
    }

    if (step % 4 === 0 && (song.party || step > 7)) playMusicKick(song.party ? 0.2 : 0.08 + buildAmount * 0.12);
    if (step % 4 === 2 && (song.party || step > 9)) playMusicHat(song.party ? 0.04 : 0.015 + buildAmount * 0.025);
    if (song.party && step % 8 === 7) playMusicSnare();

    music.step += 1;
    if (music.step >= song.length) {
      music.step = 0;
      music.songIndex = (music.songIndex + 1) % music.songs.length;
    }

    music.timers.push(window.setTimeout(scheduleMusicStep, song.beatMs));
  }

  function playMusicNote(frequency, duration, volume, type) {
    const now = music.audio.currentTime;
    const oscillator = music.audio.createOscillator();
    const gain = music.audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(music.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function playMusicKick(volume) {
    const now = music.audio.currentTime;
    const oscillator = music.audio.createOscillator();
    const gain = music.audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(90, now);
    oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.12);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(gain);
    gain.connect(music.master);
    oscillator.start(now);
    oscillator.stop(now + 0.16);
  }

  function playMusicHat(volume) {
    const now = music.audio.currentTime;
    const oscillator = music.audio.createOscillator();
    const gain = music.audio.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(950, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    oscillator.connect(gain);
    gain.connect(music.master);
    oscillator.start(now);
    oscillator.stop(now + 0.07);
  }

  function playMusicSnare() {
    const now = music.audio.currentTime;
    playMusicNote(220, 0.05, 0.035, "triangle");
    const oscillator = music.audio.createOscillator();
    const gain = music.audio.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(180, now);
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    oscillator.connect(gain);
    gain.connect(music.master);
    oscillator.start(now);
    oscillator.stop(now + 0.09);
  }

  function updateHud() {
    ui.score.textContent = String(Math.floor(state.score));
    ui.combo.textContent = `x${state.combo}`;
    ui.best.textContent = String(state.best);
    ui.bananas.textContent = `${state.bananasCollected}/${getTruckCapacity()}`;
    ui.money.textContent = `$${state.money}`;
    ui.driver.textContent = state.aiDriving ? "AI" : "You";
    ui.practice.textContent = formatPractice();
    if (ui.aiButton) ui.aiButton.textContent = state.aiDriving ? "You Drive" : "AI Drive";
    if (ui.aiWarning) ui.aiWarning.classList.toggle("visible", state.aiDriving && state.mode === "playing");
    ui.boost.style.width = `${Math.floor(state.boost)}%`;
    updateGarage();
  }

  function updateGarage() {
    updateUpgradeButton(ui.turboUpgrade, ui.turboUpgradeValue, "turbo", "Turbo");
    updateUpgradeButton(ui.magnetUpgrade, ui.magnetUpgradeValue, "magnet", "Magnet");
  }

  function updateUpgradeButton(button, label, type, name) {
    if (!button || !label) return;

    const level = state.upgrades[type];
    const cost = upgradeCost(type);
    button.disabled = cost === null || state.money < cost;
    button.querySelector("span").textContent = `${name} ${level}/${upgradeMaxLevel}`;
    label.textContent = cost === null ? "MAX" : `$${cost}`;
  }

  function render() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
    }

    drawWorld();
    drawRoad();
    drawFinishLine();
    drawShop();
    drawObjects();
    drawParticles();
    drawAiAssist();
    drawPoliceCar();
    drawPlayer();
    drawVignette();

    ctx.restore();
  }

  function drawWorld() {
    const horizon = 160;
    ctx.fillStyle = "#9ed8ff";
    ctx.fillRect(0, 0, canvas.width, horizon);
    ctx.fillStyle = "#74c56d";
    ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);

    drawBuildings(32, "#5b7892", 0.38);
    drawBuildings(canvas.width - 150, "#456579", 0.54);

    ctx.fillStyle = "#4c9a54";
    for (let i = 0; i < 14; i += 1) {
      const y = ((i * 102 + state.distance * 0.1) % (canvas.height + 120)) - 80;
      drawTree(92, y);
      drawTree(846, y + 50);
    }
  }

  function drawBuildings(x, color, speed) {
    for (let i = 0; i < 6; i += 1) {
      const y = ((i * 130 + state.distance * speed) % (canvas.height + 160)) - 120;
      const width = 72 + (i % 2) * 28;
      const height = 94 + (i % 3) * 36;
      const buildingX = x + (i % 2) * 24;
      const depth = 18 + (i % 3) * 5;
      const sideDirection = buildingX < canvas.width / 2 ? 1 : -1;
      const sideX = sideDirection * depth;

      ctx.save();
      ctx.fillStyle = "rgba(13, 21, 32, 0.18)";
      ctx.beginPath();
      ctx.ellipse(buildingX + width / 2 + sideX * 0.5, y + height + 10, width * 0.62, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = shadeColor(color, -18);
      ctx.beginPath();
      ctx.moveTo(buildingX + width, y + 10);
      ctx.lineTo(buildingX + width + sideX, y);
      ctx.lineTo(buildingX + width + sideX, y + height - 8);
      ctx.lineTo(buildingX + width, y + height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = shadeColor(color, 22);
      ctx.beginPath();
      ctx.moveTo(buildingX, y);
      ctx.lineTo(buildingX + width, y + 10);
      ctx.lineTo(buildingX + width + sideX, y);
      ctx.lineTo(buildingX + sideX, y - 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = color;
      ctx.fillRect(buildingX, y, width, height);

      ctx.strokeStyle = "rgba(248, 251, 255, 0.18)";
      ctx.lineWidth = 2;
      ctx.strokeRect(buildingX + 1, y + 1, width - 2, height - 2);

      for (let row = 0; row < 3; row += 1) {
        drawWindow(buildingX + 14, y + 18 + row * 24);
        drawWindow(buildingX + 44, y + 18 + row * 24);
      }

      ctx.restore();
    }
  }

  function drawWindow(x, y) {
    ctx.fillStyle = "rgba(13, 21, 32, 0.28)";
    ctx.fillRect(x - 2, y - 2, 16, 14);
    ctx.fillStyle = "rgba(255, 241, 150, 0.86)";
    ctx.fillRect(x, y, 12, 10);
    ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
    ctx.fillRect(x + 2, y + 1, 3, 8);
  }

  function drawTree(x, y) {
    ctx.fillStyle = "#7d542b";
    ctx.fillRect(x - 5, y + 18, 10, 32);
    ctx.fillStyle = "#2f7d45";
    ctx.beginPath();
    ctx.arc(x, y + 16, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRoad() {
    ctx.fillStyle = "#30353f";
    ctx.fillRect(road.x, 0, road.width, road.height);
    ctx.fillStyle = "#252b34";
    ctx.fillRect(road.x, 0, 18, road.height);
    ctx.fillRect(road.x + road.width - 18, 0, 18, road.height);

    const laneWidth = road.width / laneCount;
    ctx.strokeStyle = "rgba(248, 251, 255, 0.56)";
    ctx.lineWidth = 6;
    ctx.setLineDash([32, 34]);
    ctx.lineDashOffset = -state.distance * 0.35;
    for (let lane = 1; lane < laneCount; lane += 1) {
      const x = road.x + lane * laneWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawShop() {
    const selling = canSellBananas();

    if (!state.shopOpen) return;

    const shopScreenY = screenYFromWorld(shopZone.worldY);
    const shopX = shopZone.x;
    const shopY = shopScreenY - shopZone.height / 2;
    if (shopScreenY < -120 || shopScreenY > canvas.height + 180) {
      drawShopArrow(shopZone.x + shopZone.width / 2, 82);
      return;
    }

    ctx.save();
    ctx.fillStyle = selling ? "rgba(255, 204, 51, 0.42)" : "rgba(47, 167, 247, 0.28)";
    ctx.strokeStyle = selling ? "#ffcc33" : "#2fa7f7";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    roundRect(shopX, shopY, shopZone.width, shopZone.height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#17202a";
    ctx.font = "900 20px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("$20", shopX + shopZone.width / 2, shopY + 34);
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.fillText("SELL", shopX + shopZone.width / 2, shopY + 55);

    drawShopArrow(shopX + shopZone.width / 2, shopY - 34);

    if (selling) {
      const progress = state.sellTimer / sellEvery;
      ctx.fillStyle = "#ffcc33";
      roundRect(shopX + 14, shopY + shopZone.height - 20, (shopZone.width - 28) * progress, 8, 4);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawFinishLine() {
    if (!state.finishLineWorldY) return;

    const y = screenYFromWorld(state.finishLineWorldY);
    if (y < -80 || y > canvas.height + 80) return;

    const tileSize = 24;
    const rows = 3;
    const cols = Math.ceil(road.width / tileSize);

    ctx.save();
    ctx.fillStyle = "#f8fbff";
    ctx.fillRect(road.x, y - rows * tileSize, road.width, rows * tileSize);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if ((row + col) % 2 === 0) {
          ctx.fillStyle = "#17202a";
          ctx.fillRect(road.x + col * tileSize, y - rows * tileSize + row * tileSize, tileSize, tileSize);
        }
      }
    }

    ctx.fillStyle = "#ffcc33";
    ctx.strokeStyle = "#17202a";
    ctx.lineWidth = 4;
    ctx.font = "900 28px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText("FINISH 100000", road.x + road.width / 2, y - rows * tileSize - 18);
    ctx.fillText("FINISH 100000", road.x + road.width / 2, y - rows * tileSize - 18);
    ctx.restore();
  }

  function drawPoliceCar() {
    const warning = state.laneLineTimer / getLaneLineDangerSeconds();
    if (warning <= 0 && state.policeAttackTimer <= 0) return;

    const chaseY = state.player.y + 136;
    const attack = state.policeAttackTimer > 0;
    const carScale = attack ? 1 : 0.74 + warning * 0.26;
    const lightFlash = Math.floor(state.time * 12) % 2 === 0;

    ctx.save();
    ctx.translate(state.player.x, chaseY);
    ctx.scale(carScale, carScale);

    ctx.fillStyle = "rgba(23, 32, 42, 0.32)";
    ctx.beginPath();
    ctx.ellipse(0, 46, 46, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f8fbff";
    roundRect(-32, -46, 64, 100, 18);
    ctx.fill();
    ctx.strokeStyle = "#17202a";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#17202a";
    roundRect(-21, -20, 42, 32, 8);
    ctx.fill();
    ctx.fillStyle = "#2fa7f7";
    ctx.fillRect(-24, -35, 20, 10);
    ctx.fillStyle = "#f05b42";
    ctx.fillRect(4, -35, 20, 10);
    ctx.fillStyle = lightFlash ? "#f05b42" : "#2fa7f7";
    ctx.fillRect(-30, -55, 60, 10);

    if (attack) {
      ctx.strokeStyle = "#ffcc33";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(-state.policeAttackSide * 36, -120);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawShopArrow(x, y) {
    const bounce = Math.sin(state.time * 8) * 7;
    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.fillStyle = "#ffcc33";
    ctx.strokeStyle = "#17202a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.lineTo(-34, -4);
    ctx.lineTo(-12, -4);
    ctx.lineTo(-12, -34);
    ctx.lineTo(12, -34);
    ctx.lineTo(12, -4);
    ctx.lineTo(34, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#17202a";
    ctx.font = "900 15px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SHOP", 0, -10);
    ctx.restore();
  }

  function drawObjects() {
    state.objects.forEach((object) => {
      ctx.save();
      ctx.translate(object.x, object.y);
      ctx.rotate(object.rotation);
      if (object.type === "banana") {
        drawImageCentered(assets.banana, object.width, object.height);
      } else {
        drawImageCentered(assets.trafficCar, object.width, object.height);
      }
      ctx.restore();
    });
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(state.player.x, state.player.y);
    ctx.rotate(clamp(state.player.vx / 1700, -0.18, 0.18));
    drawSellingShield();
    drawUpgradeEffects();
    drawImageCentered(assets.truck, state.player.width, state.player.height);
    drawTruckBedBananas();
    ctx.restore();
  }

  function drawSellingShield() {
    if (!hasSellingShield()) return;

    const pulse = 0.5 + Math.sin(state.time * 10) * 0.5;
    const fade = canSellBananas() ? 1 : clamp(state.sellShieldTimer / postSellShieldSeconds, 0, 1);
    ctx.save();
    ctx.fillStyle = `rgba(47, 167, 247, ${(0.12 + pulse * 0.08) * fade})`;
    ctx.strokeStyle = `rgba(47, 167, 247, ${fade})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 58 + pulse * 5, 80 + pulse * 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawUpgradeEffects() {
    if (state.upgrades.magnet > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(255, 204, 51, ${0.22 + state.upgrades.magnet * 0.08})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 12]);
      ctx.lineDashOffset = -state.time * 28;
      ctx.beginPath();
      ctx.ellipse(0, 0, 48 + state.upgrades.magnet * 14, 70 + state.upgrades.magnet * 18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (state.upgrades.turbo > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(47, 167, 247, 0.55)";
      for (let i = 0; i < state.upgrades.turbo; i += 1) {
        const flicker = Math.sin(state.time * 18 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(-18 + i * 18, 52);
        ctx.lineTo(-27 + i * 18, 74 + flicker);
        ctx.lineTo(-9 + i * 18, 74 - flicker);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawAiAssist() {
    return;
  }

  function drawParticles() {
    state.particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawTruckBedBananas() {
    const count = state.bananasCollected;
    const visibleCount = Math.min(count, 18);
    const wobble = Math.sin(state.time * 18) * state.stackWobble;

    ctx.save();
    ctx.beginPath();
    roundRect(-27, -8, 54, 45, 6);
    ctx.clip();

    ctx.fillStyle = "rgba(54, 36, 20, 0.45)";
    ctx.fillRect(-27, -8, 54, 45);

    for (let i = 0; i < visibleCount; i += 1) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = -20 + col * 13 + Math.sin(i * 1.9 + count) * 2;
      const y = 25 - row * 8 + Math.cos(i + count) * 1.5;
      const angle = -0.55 + col * 0.28 + wobble * (0.18 + i * 0.02);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      drawImageCentered(assets.banana, 22, 22);
      ctx.restore();
    }

    ctx.restore();

    if (count > visibleCount) {
      ctx.save();
      ctx.translate(19, -15);
      ctx.fillStyle = "#17202a";
      ctx.strokeStyle = "#f8fbff";
      ctx.lineWidth = 3;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeText(`+${count - visibleCount}`, 0, 0);
      ctx.fillText(`+${count - visibleCount}`, 0, 0);
      ctx.restore();
    }
  }

  function drawVignette() {
    const gradient = ctx.createRadialGradient(480, 320, 180, 480, 320, 610);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(13, 21, 32, 0.28)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawImageCentered(image, width, height) {
    if (image.complete) {
      ctx.drawImage(image, -width / 2, -height / 2, width, height);
      return;
    }
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(-width / 2, -height / 2, width, height);
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  function emitTrail(x, y, color) {
    if (Math.random() > 0.62) {
      state.particles.push({
        x: x + (Math.random() - 0.5) * 28,
        y,
        vx: (Math.random() - 0.5) * 70,
        vy: 150 + Math.random() * 80,
        radius: 4 + Math.random() * 5,
        life: 0.45,
        color,
      });
    }
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 180;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        life: 0.55 + Math.random() * 0.35,
        color,
      });
    }
  }

  function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function worldBoxFromCenter(x, worldY, width, height, xInset, yInset) {
    return {
      left: x - width / 2 + xInset,
      right: x + width / 2 - xInset,
      top: worldY - height / 2 + yInset,
      bottom: worldY + height / 2 - yInset,
    };
  }

  function boxFromShopZone() {
    return {
      left: shopZone.x,
      right: shopZone.x + shopZone.width,
      top: shopZone.worldY - shopZone.height / 2,
      bottom: shopZone.worldY + shopZone.height / 2,
    };
  }

  function screenYFromWorld(worldY) {
    return state.player.y - (worldY - state.player.worldY);
  }

  function isOnStripeLine(x) {
    const laneWidth = road.width / laneCount;
    for (let lane = 1; lane < laneCount; lane += 1) {
      const stripeX = road.x + lane * laneWidth;
      if (Math.abs(x - stripeX) < 10) return true;
    }
    return false;
  }

  function shadeColor(color, amount) {
    const value = parseInt(color.slice(1), 16);
    const red = clamp((value >> 16) + amount, 0, 255);
    const green = clamp(((value >> 8) & 255) + amount, 0, 255);
    const blue = clamp((value & 255) + amount, 0, 255);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  let previous = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - previous) / 1000);
    previous = now;

    if (input.wasPressed("KeyP")) {
      input.clear("KeyP");
      pauseGame();
    }

    if (input.wasPressed("Escape")) {
      input.clear("Escape");
      pauseGame();
    }

    if (input.wasPressed("Space")) {
      input.clear("Space");
      toggleAiDriving();
    }

    if (input.wasPressed("Enter")) {
      input.clear("Enter");
      resetGame();
    }

    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  ui.start.addEventListener("click", () => {
    if (state.mode === "paused") {
      pauseGame();
      return;
    }
    ui.start.textContent = "Start Race";
    resetGame();
  });

  if (ui.aiButton) {
    ui.aiButton.addEventListener("click", toggleAiDriving);
  }

  if (ui.turboUpgrade) {
    ui.turboUpgrade.addEventListener("click", () => buyUpgrade("turbo"));
  }

  if (ui.magnetUpgrade) {
    ui.magnetUpgrade.addEventListener("click", () => buyUpgrade("magnet"));
  }

  updateHud();
  render();
  loadTrainedAiPolicy();
  requestAnimationFrame(frame);
})();
