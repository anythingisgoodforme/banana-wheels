(function initFretboard(root, factory) {
  const api = factory();
  root.BasslineFretboard = api;
})(typeof window !== 'undefined' ? window : globalThis, function fretboardFactory() {
  function renderFretboard({
    container,
    strings,
    onStringClick,
    labels = {},
    targetId = null,
    showHeadLabels = false,
  }) {
    container.innerHTML = '';

    const neck = document.createElement('div');
    neck.className = 'bass-neck';
    neck.setAttribute('aria-label', 'Four string bass diagram');

    strings.forEach((string, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'string-row';
      row.dataset.stringId = string.id;
      row.dataset.target = string.id === targetId ? 'true' : 'false';
      row.setAttribute('aria-label', `String position ${index + 1}`);

      const label = labels[string.id] || '';
      row.innerHTML = `
          <span class="head-label">${showHeadLabels ? string.id : index + 1}</span>
          <span class="string-line"></span>
          <span class="placed-label">${label}</span>
        `;

      row.addEventListener('click', () => onStringClick(string.id));
      neck.appendChild(row);
    });

    const frets = document.createElement('div');
    frets.className = 'fret-markers';
    frets.innerHTML = '<span>0</span><span>1</span><span>2</span><span>3</span><span>4</span>';

    container.appendChild(neck);
    container.appendChild(frets);
  }

  function renderLabelChips({ container, strings, selectedLabel, onSelect }) {
    container.innerHTML = '';
    strings.forEach((string) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'label-chip';
      button.dataset.selected = selectedLabel === string.id ? 'true' : 'false';
      button.textContent = string.id;
      button.addEventListener('click', () => onSelect(string.id));
      container.appendChild(button);
    });
  }

  return { renderFretboard, renderLabelChips };
});
