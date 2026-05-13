(function initHostingDemo(root) {
  const api = root.BasslineNoteApi;
  const { MicrophonePitch } = root.BasslineMicrophone;
  const noteDetection = root.BasslineNoteDetection;
  const strings = {
    E: { stringId: 'E', fret: 0, note: 'E', frequency: 41.2 },
    A: { stringId: 'A', fret: 0, note: 'A', frequency: 55.0 },
    D: { stringId: 'D', fret: 0, note: 'D', frequency: 73.42 },
    G: { stringId: 'G', fret: 0, note: 'G', frequency: 98.0 },
  };

  const elements = {
    string: document.querySelector('#demoString'),
    frequency: document.querySelector('#runFrequencyDemo'),
    audio: document.querySelector('#runAudioDemo'),
    practice: document.querySelector('#runPracticeDemo'),
    mic: document.querySelector('#demoMicButton'),
    micLabel: document.querySelector('#demoMicLabel'),
    liveNote: document.querySelector('#liveNote'),
    liveFrequency: document.querySelector('#liveFrequency'),
    liveCents: document.querySelector('#liveCents'),
    liveNeedle: document.querySelector('#liveNeedle'),
    liveStatus: document.querySelector('#liveStatus'),
    summary: document.querySelector('#demoSummary'),
    json: document.querySelector('#demoJson'),
  };

  let mic = null;
  let micListening = false;

  elements.frequency.addEventListener('click', runFrequencyDemo);
  elements.audio.addEventListener('click', runAudioDemo);
  elements.practice.addEventListener('click', runPracticeDemo);
  elements.mic.addEventListener('click', toggleMic);
  window.addEventListener('beforeunload', stopMic);

  async function toggleMic() {
    if (micListening) {
      stopMic();
      return;
    }

    try {
      mic = new MicrophonePitch({ onPitch: handleLivePitch });
      await mic.start();
      micListening = true;
      elements.mic.dataset.listening = 'true';
      elements.mic.setAttribute('aria-pressed', 'true');
      elements.micLabel.textContent = 'Mic on';
      elements.liveStatus.textContent = 'Listening. Play one bass note close to the device.';
      elements.liveStatus.dataset.tone = 'neutral';
    } catch (error) {
      elements.liveStatus.textContent = error.message;
      elements.liveStatus.dataset.tone = 'sharp';
    }
  }

  function stopMic() {
    mic?.stop();
    mic = null;
    micListening = false;
    elements.mic.dataset.listening = 'false';
    elements.mic.setAttribute('aria-pressed', 'false');
    elements.micLabel.textContent = 'Mic off';
  }

  async function handleLivePitch(frequency) {
    const target = selectedTarget();

    try {
      const result = await api.detectNote({ frequency, target, mode: 'lesson' });
      renderLiveResult(result);
      render(result.message, result);
    } catch (_error) {
      const result = noteDetection.analyzeFrequencyRequest({ frequency, target, mode: 'lesson' });
      renderLiveResult(result);
      render(result.message, result);
    }
  }

  async function runFrequencyDemo() {
    const target = selectedTarget();
    const result = await api.detectNote({
      frequency: Number((target.frequency * 1.006).toFixed(2)),
      target,
      mode: 'lesson',
    });
    render(result.message, result);
  }

  async function runAudioDemo() {
    const target = selectedTarget();
    const sample = synthesizePcm16(target.frequency);
    const result = await api.analyzeAudioNote({
      sampleRate: sample.sampleRate,
      samplesBase64: sample.samplesBase64,
      encoding: 'pcm16',
      target,
      mode: 'lesson',
    });
    render(result.message, result);
  }

  async function runPracticeDemo() {
    const target = selectedTarget();
    const detected = await api.detectNote({
      frequency: target.frequency,
      target,
      mode: 'lesson',
    });
    const result = await api.recordPracticeAttempt({
      playerId: 'local-demo',
      lessonId: 'hosted-api-demo',
      target,
      detected: {
        note: detected.detected.note,
        frequency: detected.detected.frequency,
        centsOff: detected.centsOff,
      },
      correct: detected.matchesTarget,
    });
    render(`Saved attempt. Local demo accuracy is ${result.profile.accuracy}%.`, result);
  }

  function selectedTarget() {
    return strings[elements.string.value];
  }

  function synthesizePcm16(frequency) {
    const sampleRate = 44100;
    const duration = 0.85;
    const samples = Math.floor(sampleRate * duration);
    const bytes = new Uint8Array(samples * 2);
    const view = new DataView(bytes.buffer);

    for (let index = 0; index < samples; index += 1) {
      const time = index / sampleRate;
      const attack = Math.min(1, time / 0.035);
      const decay = Math.exp(-time * 1.2);
      const envelope = attack * decay;
      const value =
        envelope *
        (0.45 * Math.sin(2 * Math.PI * frequency * time) +
          0.65 * Math.sin(2 * Math.PI * frequency * 2 * time + 0.35) +
          0.22 * Math.sin(2 * Math.PI * frequency * 3 * time + 0.8));
      view.setInt16(index * 2, Math.max(-1, Math.min(1, value)) * 32767, true);
    }

    return {
      sampleRate,
      samplesBase64: bytesToBase64(bytes),
    };
  }

  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function render(summary, payload) {
    elements.summary.textContent = summary;
    elements.json.textContent = JSON.stringify(payload, null, 2);
  }

  function renderLiveResult(result) {
    const offset = Math.max(-50, Math.min(50, result.centsOff || 0));
    elements.liveNote.textContent = result.detected.label;
    elements.liveFrequency.textContent = `${Math.round(result.detected.frequency)} Hz`;
    elements.liveCents.textContent = formatCents(result.centsOff);
    elements.liveNeedle.style.left = `${50 + offset}%`;
    elements.liveStatus.textContent = result.message;
    elements.liveStatus.dataset.tone = result.matchesTarget
      ? 'good'
      : result.direction || 'neutral';
  }

  function formatCents(cents) {
    if (Math.abs(cents) <= 1) return 'In tune';
    return cents > 0 ? `${cents} sharp` : `${Math.abs(cents)} flat`;
  }
})(typeof window !== 'undefined' ? window : globalThis);
