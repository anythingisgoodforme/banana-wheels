#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const PORT = Number(process.env.AI_TRAINER_PORT || 4191);
const TRAIN_MS = Number(process.env.AI_TRAIN_MS || 2 * 60 * 60 * 1000);
const AUTO_START = process.env.AI_AUTO_START === "1";
const EMAIL_TO = process.env.AI_NOTIFY_EMAIL || "matteo.t.s.samuel@gmail.com";
const OUT_DIR = path.join(__dirname, "out");
const POLICY_FILE = path.join(OUT_DIR, "banana-ai-policy.json");
const DRIVER_POLICY_FILE = path.join(OUT_DIR, "banana-ai-driver.json");
const NOTICE_FILE = path.join(OUT_DIR, "training-finished-notice.txt");
const PROGRESS_FILE = path.join(OUT_DIR, "training-progress.json");
const ERROR_FILE = path.join(OUT_DIR, "training-error.txt");

const actions = ["left", "stay", "right"];
const q = new Map();
const state = {
  running: false,
  finished: false,
  startedAt: null,
  finishedAt: null,
  episodes: 0,
  bestScore: 0,
  epsilon: 0.28,
  timer: null,
  endTimer: null,
  emailStatus: "not-sent",
  progressTimer: null,
  driverPolicy: {
    version: 1,
    trainedAt: null,
    trainedSeconds: 0,
    skill: 0,
    lookAheadBonus: 0,
    dangerWeight: 1,
    brakeLookAhead: 520,
    emergencyLookAhead: 230,
    sideDistance: 100,
    emergencySideDistance: 76,
  },
};

fs.mkdirSync(OUT_DIR, { recursive: true });

function keyFor(sim) {
  const obstacleLane = sim.obstacleLane === null ? "none" : sim.obstacleLane;
  const bananaLane = sim.bananaLane === null ? "none" : sim.bananaLane;
  return `${sim.lane}|${obstacleLane}|${bananaLane}|${sim.cargo}`;
}

function valuesFor(key) {
  if (!q.has(key)) q.set(key, [0, 0, 0]);
  return q.get(key);
}

function chooseAction(key) {
  if (Math.random() < state.epsilon) return Math.floor(Math.random() * actions.length);
  const values = valuesFor(key);
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}

function randomLane() {
  return Math.floor(Math.random() * 5);
}

function trainEpisode() {
  const sim = {
    lane: 2,
    cargo: 0,
    score: 0,
    obstacleLane: randomLane(),
    bananaLane: randomLane(),
  };

  for (let step = 0; step < 240; step += 1) {
    const oldKey = keyFor(sim);
    const actionIndex = chooseAction(oldKey);
    const action = actions[actionIndex];
    if (action === "left") sim.lane = Math.max(0, sim.lane - 1);
    if (action === "right") sim.lane = Math.min(4, sim.lane + 1);

    let reward = 1;
    if (sim.lane === sim.obstacleLane) reward -= 180;
    if (sim.lane === sim.bananaLane && sim.cargo < 50) {
      sim.cargo += 1;
      reward += 55;
    }
    if (sim.cargo === 50) {
      reward += 1000;
      sim.cargo = 0;
    }

    sim.score += reward;
    sim.obstacleLane = Math.random() < 0.74 ? randomLane() : null;
    sim.bananaLane = Math.random() < 0.52 ? randomLane() : null;

    const newKey = keyFor(sim);
    const oldValues = valuesFor(oldKey);
    const nextBest = Math.max(...valuesFor(newKey));
    oldValues[actionIndex] += 0.18 * (reward + 0.88 * nextBest - oldValues[actionIndex]);
  }

  state.episodes += 1;
  state.bestScore = Math.max(state.bestScore, Math.round(sim.score));
  state.epsilon = Math.max(0.04, state.epsilon * 0.99996);
}

function tick() {
  const batchSize = 220;
  for (let i = 0; i < batchSize; i += 1) trainEpisode();
  updateDriverPolicy();
}

function startTraining() {
  if (state.running) return;
  state.running = true;
  state.finished = false;
  state.startedAt = new Date().toISOString();
  state.finishedAt = null;
  state.emailStatus = "not-sent";
  state.timer = setInterval(tick, 25);
  state.progressTimer = setInterval(saveProgress, 5000);
  state.endTimer = setTimeout(finishTraining, TRAIN_MS);
  saveProgress();
}

function finishTraining() {
  if (!state.running) return;
  clearInterval(state.timer);
  clearInterval(state.progressTimer);
  clearTimeout(state.endTimer);
  state.running = false;
  state.finished = true;
  state.finishedAt = new Date().toISOString();
  updateDriverPolicy();
  savePolicy();
  saveDriverPolicy();
  saveProgress();
  writeNotice("finished");
  sendFinishedEmail();
  if (process.env.AI_EXIT_ON_FINISH === "1") {
    setTimeout(() => process.exit(0), 1000);
  }
}

function updateDriverPolicy() {
  const elapsed = state.startedAt ? Date.now() - Date.parse(state.startedAt) : 0;
  const timeSkill = Math.min(1, elapsed / TRAIN_MS);
  const scoreSkill = Math.min(1, Math.max(0, state.bestScore) / 5000);
  const skill = Math.max(timeSkill, scoreSkill * 0.65);

  state.driverPolicy = {
    version: 1,
    trainedAt: new Date().toISOString(),
    trainedSeconds: Math.floor(elapsed / 1000),
    skill: Number(skill.toFixed(4)),
    lookAheadBonus: Math.round(1000 * skill),
    dangerWeight: Number((1 + skill * 1.35).toFixed(3)),
    brakeLookAhead: Math.round(520 + skill * 320),
    emergencyLookAhead: Math.round(230 + skill * 230),
    sideDistance: Math.round(100 + skill * 38),
    emergencySideDistance: Math.round(76 + skill * 34),
    episodes: state.episodes,
    bestScore: state.bestScore,
  };
}

function savePolicy() {
  const policy = {
    trainedAt: state.finishedAt || new Date().toISOString(),
    episodes: state.episodes,
    bestScore: state.bestScore,
    actions,
    q: Object.fromEntries(q),
  };
  fs.writeFileSync(POLICY_FILE, JSON.stringify(policy, null, 2));
}

function saveDriverPolicy() {
  fs.writeFileSync(DRIVER_POLICY_FILE, JSON.stringify(state.driverPolicy, null, 2));
}

function saveProgress() {
  updateDriverPolicy();
  saveDriverPolicy();
  const progress = {
    ...publicStatus(),
    driverPolicyFile: DRIVER_POLICY_FILE,
    driverPolicy: state.driverPolicy,
  };
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function writeNotice(reason) {
  const text = [
    `AI training ${reason}.`,
    `Finished: ${state.finishedAt || new Date().toISOString()}`,
    `Episodes: ${state.episodes}`,
    `Best score: ${state.bestScore}`,
    `Email target: ${EMAIL_TO}`,
    `Email status: ${state.emailStatus}`,
    `Policy file: ${POLICY_FILE}`,
    `Driver policy file: ${DRIVER_POLICY_FILE}`,
  ].join(os.EOL);
  fs.writeFileSync(NOTICE_FILE, `${text}${os.EOL}`);
}

function sendFinishedEmail() {
  const subject = "Banana Drive AI training finished";
  const body = "The AI has finished.";
  const sendmail = spawn("sendmail", ["-t"]);
  let failed = false;

  sendmail.on("error", () => {
    failed = true;
    state.emailStatus = "sendmail-not-available";
    writeNotice("finished, but email could not be sent");
  });

  sendmail.on("close", (code) => {
    if (failed) return;
    state.emailStatus = code === 0 ? "sent-with-sendmail" : `sendmail-exit-${code}`;
    writeNotice(code === 0 ? "finished and email sent" : "finished, but email failed");
  });

  sendmail.stdin.end([
    `To: ${EMAIL_TO}`,
    `Subject: ${subject}`,
    "",
    body,
    "",
  ].join(os.EOL));
}

function publicStatus() {
  return {
    running: state.running,
    finished: state.finished,
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    trainMs: TRAIN_MS,
    episodes: state.episodes,
    bestScore: state.bestScore,
    epsilon: Number(state.epsilon.toFixed(4)),
    emailTo: EMAIL_TO,
    emailStatus: state.emailStatus,
    policyFile: POLICY_FILE,
    driverPolicyFile: DRIVER_POLICY_FILE,
    noticeFile: NOTICE_FILE,
    driverPolicy: state.driverPolicy,
  };
}

process.on("uncaughtException", (error) => {
  fs.writeFileSync(ERROR_FILE, `${new Date().toISOString()}\n${error.stack || error.message}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  fs.writeFileSync(ERROR_FILE, `${new Date().toISOString()}\n${error && error.stack ? error.stack : error}\n`);
  process.exit(1);
});

const server = http.createServer((req, res) => {
  if (req.url === "/start") {
    startTraining();
    return json(res, publicStatus());
  }
  if (req.url === "/finish-now") {
    finishTraining();
    return json(res, publicStatus());
  }
  if (req.url === "/status" || req.url === "/") {
    return json(res, publicStatus());
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

function json(res, value) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(`${JSON.stringify(value, null, 2)}\n`);
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`AI trainer server listening on http://127.0.0.1:${PORT}`);
  console.log("Open /start to begin training.");
  if (AUTO_START) startTraining();
});
