(function initBasslineTuner(root) {
  const notes = root.BasslineNotes;
  const { BassAudio } = root.BasslineAudio;
  const audio = new BassAudio();
  const strings = notes.OPEN_STRINGS;
  let currentIndex = 0;

  const elements = {
    step: document.querySelector('#tunerStep'),
    string: document.querySelector('#tunerString'),
    instruction: document.querySelector('#tunerInstruction'),
    play: document.querySelector('#playTune'),
    next: document.querySelector('#continueTune'),
    back: document.querySelector('#backToLessons'),
    sequence: [...document.querySelectorAll('.tuner-sequence span')],
  };

  elements.play.addEventListener('click', playCurrentTune);
  elements.next.addEventListener('click', continueTuning);
  render();

  function playCurrentTune() {
    const string = strings[currentIndex];
    audio.playNote(string.frequency, 1.1);
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
    elements.sequence.forEach((item, index) => {
      item.dataset.active = index === currentIndex ? 'true' : 'false';
      item.dataset.complete = index < currentIndex ? 'true' : 'false';
    });
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
