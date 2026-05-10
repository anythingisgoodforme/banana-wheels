(function initRhythmTrainer(root, factory) {
  const api = factory();
  root.BasslineRhythmTrainer = api;
})(typeof window !== 'undefined' ? window : globalThis, function rhythmTrainerFactory() {
  function renderPulse({ container, beats, activeBeat = 0 }) {
    container.innerHTML = '';
    beats.forEach((beat, index) => {
      const cell = document.createElement('span');
      cell.className = 'beat-cell';
      cell.dataset.active = index === activeBeat ? 'true' : 'false';
      cell.textContent = String(index + 1);
      container.appendChild(cell);
    });
  }

  return { renderPulse };
});
