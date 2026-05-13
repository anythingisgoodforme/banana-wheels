const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const noteDetection = require('../public/bassline-rookie/src/core/noteDetection');
const { detectPitch } = require('../public/bassline-rookie/src/core/microphone');

const PORT = Number(process.env.PORT || 8010);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const attempts = [];

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    sendCors(response, 204);
    response.end();
    return;
  }

  try {
    if (url.pathname === '/functions/v1/detect-note' && request.method === 'POST') {
      sendJson(response, noteDetection.analyzeFrequencyRequest(await readJson(request)));
      return;
    }

    if (url.pathname === '/functions/v1/analyze-audio-note' && request.method === 'POST') {
      sendJson(response, analyzeAudioRequest(await readJson(request)));
      return;
    }

    if (url.pathname === '/functions/v1/record-practice-attempt' && request.method === 'POST') {
      sendJson(response, recordPracticeAttempt(await readJson(request)));
      return;
    }

    if (url.pathname === '/functions/v1/practice-profile' && request.method === 'GET') {
      sendJson(response, practiceProfile(url.searchParams.get('playerId') || 'local-demo'));
      return;
    }

    serveStatic(url.pathname, response);
  } catch (error) {
    sendJson(response, { ok: false, status: 500, message: error.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(
    `Bassline Rookie hosted demo: http://localhost:${PORT}/bassline-rookie/hosting-demo.html`
  );
});

function analyzeAudioRequest(payload) {
  const sampleRate = Number(payload.sampleRate);
  const samples = decodeSamples(payload.samplesBase64, payload.encoding);
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || !samples.length) {
    return { ok: false, status: 400, message: 'sampleRate and samplesBase64 are required' };
  }

  const frequency = detectPitch(samples, sampleRate);
  if (!frequency) {
    return { ok: false, status: 422, message: 'No stable bass note found in the audio sample' };
  }

  return noteDetection.analyzeFrequencyRequest({
    frequency,
    mode: payload.mode || 'lesson',
    target: payload.target,
  });
}

function recordPracticeAttempt(payload) {
  const attempt = {
    id: `local-${attempts.length + 1}`,
    playerId: payload.playerId || 'local-demo',
    lessonId: payload.lessonId || 'demo',
    target: payload.target || null,
    detected: payload.detected || null,
    correct: Boolean(payload.correct),
    createdAt: new Date().toISOString(),
  };
  attempts.push(attempt);
  return {
    ok: true,
    status: 200,
    attempt,
    profile: practiceProfile(attempt.playerId).profile,
  };
}

function practiceProfile(playerId) {
  const playerAttempts = attempts.filter((attempt) => attempt.playerId === playerId);
  const correct = playerAttempts.filter((attempt) => attempt.correct).length;
  return {
    ok: true,
    status: 200,
    profile: {
      playerId,
      attempts: playerAttempts.length,
      correct,
      accuracy: playerAttempts.length ? Math.round((correct / playerAttempts.length) * 100) : 0,
    },
  };
}

function decodeSamples(base64, encoding = 'pcm16') {
  if (!base64) return new Float32Array();
  const bytes = Buffer.from(base64, 'base64');

  if (encoding === 'float32') {
    return new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 4));
  }

  const samples = new Float32Array(Math.floor(bytes.byteLength / 2));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = bytes.readInt16LE(index * 2) / 32768;
  }
  return samples;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

function serveStatic(pathname, response) {
  const safePath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(response, 'Not found', 404);
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendText(response, 'Not found', 404);
      return;
    }

    response.writeHead(200, {
      'content-type': contentType(filePath),
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

function sendJson(response, payload, forcedStatus = null) {
  const status = forcedStatus || payload.status || 200;
  sendCors(response, status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(payload));
}

function sendText(response, text, status) {
  response.writeHead(status, { 'content-type': 'text/plain' });
  response.end(text);
}

function sendCors(response, status, headers = {}) {
  response.writeHead(status, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    ...headers,
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  const types = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}
