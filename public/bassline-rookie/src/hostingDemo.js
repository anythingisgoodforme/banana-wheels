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
  const timelinePattern = ['E', 'A', 'D', 'G', 'D', 'A', 'E', 'A'];
  const timelineDurationMs = 9600;
  const timelineLeadMs = 1800;
  const hitWindowMs = 650;

  const elements = {
    string: document.querySelector('#demoString'),
    frequency: document.querySelector('#runFrequencyDemo'),
    audio: document.querySelector('#runAudioDemo'),
    practice: document.querySelector('#runPracticeDemo'),
    mic: document.querySelector('#demoMicButton'),
    micLabel: document.querySelector('#demoMicLabel'),
    sensitiveMic: document.querySelector('#sensitiveMicToggle'),
    simulateLive: document.querySelector('#simulateLiveButton'),
    simulateFlat: document.querySelector('#simulateFlatButton'),
    simulateSharp: document.querySelector('#simulateSharpButton'),
    playTargetTone: document.querySelector('#playTargetToneButton'),
    liveNote: document.querySelector('#liveNote'),
    liveFrequency: document.querySelector('#liveFrequency'),
    liveCents: document.querySelector('#liveCents'),
    micLevelText: document.querySelector('#micLevelText'),
    micLevelBar: document.querySelector('#micLevelBar'),
    micThresholdMarker: document.querySelector('#micThresholdMarker'),
    liveNeedle: document.querySelector('#liveNeedle'),
    liveStatus: document.querySelector('#liveStatus'),
    startTimeline: document.querySelector('#startTimelineButton'),
    resetTimeline: document.querySelector('#resetTimelineButton'),
    targetNotesLayer: document.querySelector('#targetNotesLayer'),
    detectedNotesLayer: document.querySelector('#detectedNotesLayer'),
    timelineHits: document.querySelector('#timelineHits'),
    timelineMisses: document.querySelector('#timelineMisses'),
    timelineTarget: document.querySelector('#timelineTarget'),
    summary: document.querySelector('#demoSummary'),
    json: document.querySelector('#demoJson'),
  };

  let mic = null;
  let micListening = false;
  let timeline = createTimelineState();

  elements.frequency.addEventListener('click', runFrequencyDemo);
  elements.audio.addEventListener('click', runAudioDemo);
  elements.practice.addEventListener('click', runPracticeDemo);
  elements.mic.addEventListener('click', toggleMic);
  elements.sensitiveMic.addEventListener('change', restartMicIfListening);
  elements.simulateLive.addEventListener('click', simulateLiveDetection);
  elements.simulateFlat.addEventListener('click', () => simulateOffsetDetection(-25));
  elements.simulateSharp.addEventListener('click', () => simulateOffsetDetection(25));
  elements.playTargetTone.addEventListener('click', playTargetTone);
  elements.startTimeline.addEventListener('click', startTimeline);
  elements.resetTimeline.addEventListener('click', resetTimeline);
  window.addEventListener('beforeunload', stopMic);
  renderTimeline();

  async function toggleMic() {
    if (micListening) {
      stopMic();
      return;
    }

    try {
      const sensitive = elements.sensitiveMic.checked;
      elements.micThresholdMarker.style.left = sensitive ? '3%' : '8%';
      mic = new MicrophonePitch({
        onPitch: handleLivePitch,
        onLevel: renderMicLevel,
        inputGain: sensitive ? 4 : 1,
        minRms: sensitive ? 0.002 : 0.006,
      });
      await mic.start();
      micListening = true;
      elements.mic.dataset.listening = 'true';
      elements.mic.setAttribute('aria-pressed', 'true');
      elements.micLabel.textContent = 'Mic on';
      elements.liveStatus.textContent = sensitive
        ? 'Listening in sensitive mode. This is easier to trigger, but may be noisier.'
        : 'Listening. Play one bass note close to the device.';
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

  async function restartMicIfListening() {
    if (!micListening) return;
    stopMic();
    await toggleMic();
  }

  async function handleLivePitch(frequency) {
    const target = selectedTarget();

    try {
      const result = await api.detectNote({ frequency, target, mode: 'lesson' });
      renderLiveResult(result);
      scoreTimelineNote(result);
      render(result.message, result);
    } catch (_error) {
      const result = noteDetection.analyzeFrequencyRequest({ frequency, target, mode: 'lesson' });
      renderLiveResult(result);
      scoreTimelineNote(result);
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

  async function simulateLiveDetection() {
    return simulateOffsetDetection(0);
  }

  async function simulateOffsetDetection(cents) {
    const target = selectedTarget();
    const result = await api.detectNote({
      frequency: Number((target.frequency * Math.pow(2, cents / 1200)).toFixed(2)),
      target,
      mode: 'lesson',
    });
    renderLiveResult(result);
    scoreTimelineNote(result);
    render(result.message, result);
  }

  function playTargetTone() {
    const target = selectedTarget();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      elements.liveStatus.textContent = 'This browser cannot play test tones.';
      return;
    }

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(target.frequency, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 1.15);
    setTimeout(() => ctx.close().catch(() => {}), 1300);
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

  function createTimelineState() {
    return {
      running: false,
      startedAt: 0,
      frameId: null,
      hits: 0,
      misses: 0,
      notes: timelinePattern.map((id, index) => ({
        id,
        note: strings[id],
        dueAt: timelineLeadMs + index * 900,
        status: 'pending',
      })),
      detections: [],
    };
  }

  function startTimeline() {
    timeline = createTimelineState();
    timeline.running = true;
    timeline.startedAt = performance.now();
    elements.startTimeline.textContent = 'Restart timeline';
    renderTimeline();
    tickTimeline();
  }

  function resetTimeline() {
    if (timeline.frameId) cancelAnimationFrame(timeline.frameId);
    timeline = createTimelineState();
    elements.startTimeline.textContent = 'Start timeline';
    renderTimeline();
  }

  function tickTimeline() {
    if (!timeline.running) return;
    const elapsed = performance.now() - timeline.startedAt;

    timeline.notes.forEach((target) => {
      if (target.status === 'pending' && elapsed - target.dueAt > hitWindowMs) {
        target.status = 'miss';
        timeline.misses += 1;
      }
    });

    if (elapsed > timelineDurationMs) {
      timeline.running = false;
      elements.startTimeline.textContent = 'Start timeline';
    }

    renderTimeline(elapsed);
    if (timeline.running) {
      timeline.frameId = requestAnimationFrame(tickTimeline);
    }
  }

  function scoreTimelineNote(result) {
    const now = timeline.running ? performance.now() - timeline.startedAt : timelineLeadMs;
    const target = timeline.notes.find(
      (note) =>
        note.status === 'pending' &&
        note.note.note === result.detected.note &&
        Math.abs(note.dueAt - now) <= hitWindowMs
    );
    const hit = Boolean(target);

    if (target) {
      target.status = 'hit';
      timeline.hits += 1;
    } else if (timeline.running) {
      timeline.misses += 1;
    }

    timeline.detections.push({
      note: result.detected.note,
      label: result.detected.label,
      at: now,
      hit,
    });
    timeline.detections = timeline.detections.slice(-12);
    renderTimeline(now);
  }

  function renderTimeline(elapsed = timeline.running ? performance.now() - timeline.startedAt : 0) {
    const trackWidthPercent = 100;
    const activeTarget = timeline.notes.find(
      (note) => note.status === 'pending' && note.dueAt >= elapsed - hitWindowMs
    );
    elements.timelineHits.textContent = String(timeline.hits);
    elements.timelineMisses.textContent = String(timeline.misses);
    elements.timelineTarget.textContent = activeTarget ? activeTarget.note.note : '--';

    elements.targetNotesLayer.innerHTML = timeline.notes
      .map((target) => {
        const left =
          trackWidthPercent - ((target.dueAt - elapsed) / timelineLeadMs) * trackWidthPercent;
        return `
          <span
            class="timeline-note"
            data-status="${target.status}"
            style="left: ${left}%"
          >${target.note.note}</span>
        `;
      })
      .join('');

    elements.detectedNotesLayer.innerHTML = timeline.detections
      .map((detection) => {
        const age = Math.max(0, elapsed - detection.at);
        const left = Math.max(4, Math.min(96, 50 - age / 45));
        return `
          <span
            class="detected-note"
            data-hit="${detection.hit ? 'true' : 'false'}"
            style="left: ${left}%"
          >${detection.note}</span>
        `;
      })
      .join('');
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

  function renderMicLevel(rms) {
    const percent = Math.max(0, Math.min(100, Math.round((rms / 0.08) * 100)));
    elements.micLevelText.textContent = `${percent}%`;
    elements.micLevelBar.style.width = `${percent}%`;
    elements.micLevelBar.dataset.hot = percent > 12 ? 'true' : 'false';
  }

  function formatCents(cents) {
    if (Math.abs(cents) <= 1) return 'In tune';
    return cents > 0 ? `${cents} sharp` : `${Math.abs(cents)} flat`;
  }
})(typeof window !== 'undefined' ? window : globalThis);
