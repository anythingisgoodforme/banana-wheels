(function initBasslineTuner(root) {
  const notes = root.BasslineNotes;
  const { BassAudio } = root.BasslineAudio;
  const { MicrophonePitch } = root.BasslineMicrophone;
  const noteDetection = root.BasslineNoteDetection;
  const noteApi = root.BasslineNoteApi;
  const audio = new BassAudio();
  const strings = notes.OPEN_STRINGS;
  let currentIndex = 0;
  let mic = null;
  let micListening = false;

  const elements = {
    step: document.querySelector('#tunerStep'),
    string: document.querySelector('#tunerString'),
    instruction: document.querySelector('#tunerInstruction'),
    mic: document.querySelector('#micTune'),
    play: document.querySelector('#playTune'),
    next: document.querySelector('#continueTune'),
    back: document.querySelector('#backToLessons'),
    readout: document.querySelector('#tunerReadout'),
    needle: document.querySelector('#tunerNeedle'),
    sequence: [...document.querySelectorAll('.tuner-sequence span')],
  };

  elements.mic.addEventListener('click', toggleMic);
  elements.play.addEventListener('click', playCurrentTune);
  elements.next.addEventListener('click', continueTuning);
  window.addEventListener('beforeunload', stopMic);
  render();

  async function toggleMic() {
    if (micListening) {
      stopMic();
      return;
    }

    try {
      mic = new MicrophonePitch({ onPitch: handlePitch });
      await mic.start();
      micListening = true;
      elements.mic.textContent = 'Mic off';
      elements.mic.setAttribute('aria-pressed', 'true');
      elements.readout.textContent = `Listening for open ${strings[currentIndex].name}.`;
    } catch (error) {
      elements.readout.textContent = error.message;
    }
  }

  function stopMic() {
    mic?.stop();
    mic = null;
    micListening = false;
    elements.mic.textContent = 'Mic on';
    elements.mic.setAttribute('aria-pressed', 'false');
  }

  function playCurrentTune() {
    const string = strings[currentIndex];
    audio.playNote(string.frequency, 1.1);
  }

  async function handlePitch(frequency) {
    const string = strings[currentIndex];
    const target = {
      stringId: string.id,
      fret: 0,
      note: string.name,
      frequency: string.frequency,
    };

    try {
      const result = await noteApi.detectNote({ frequency, target, mode: 'tuner' });
      renderPitchResult(result);
    } catch (_error) {
      renderPitchResult(
        noteDetection.analyzeFrequencyRequest({ frequency, target, mode: 'tuner' })
      );
    }
  }

  function continueTuning() {
    if (currentIndex < strings.length - 1) {
      currentIndex += 1;
      render();
      return;
    }

    elements.play.hidden = true;
    elements.next.hidden = true;
    elements.back.hidden = false;
    elements.readout.textContent = 'All four strings are covered.';
    elements.instruction.textContent =
      'All four open strings are covered. Go back to lessons when you are ready.';
  }

  function render() {
    const string = strings[currentIndex];
    elements.step.textContent = `String ${currentIndex + 1} of ${strings.length}`;
    elements.string.textContent = string.name;
    elements.instruction.textContent = instructionFor(string.name);
    elements.play.hidden = false;
    elements.next.hidden = false;
    elements.back.hidden = true;
    elements.readout.textContent = micListening
      ? `Listening for open ${string.name}.`
      : 'Press Mic on and play one open string.';
    elements.needle.style.left = '50%';
    elements.sequence.forEach((item, index) => {
      item.dataset.active = index === currentIndex ? 'true' : 'false';
      item.dataset.complete = index < currentIndex ? 'true' : 'false';
    });
  }

  function renderPitchResult(result) {
    const offset = Math.max(-50, Math.min(50, result.centsOff || 0));
    elements.needle.style.left = `${50 + offset}%`;
    elements.readout.textContent = result.message;
    elements.readout.dataset.tone = result.matchesTarget ? 'good' : result.direction || 'neutral';
  }

  function instructionFor(noteName) {
    const instructions = {
      E: 'Tune your lowest open string until it matches E.',
      A: 'Tune the next open string until it matches A.',
      D: 'Tune the next open string until it matches D.',
      G: 'Tune your highest open string until it matches G.',
    };

    return instructions[noteName];
  }
})(typeof window !== 'undefined' ? window : globalThis);
