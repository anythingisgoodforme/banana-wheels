(function initLessonMap(root, factory) {
  const api = factory();
  root.BasslineLessonMap = api;
})(typeof window !== 'undefined' ? window : globalThis, function lessonMapFactory() {
  function renderLessonMap({ container, lessons, progress, activeLessonId, isUnlocked, onSelect }) {
    container.innerHTML = '';

    lessons.forEach((lesson) => {
      const stats = progress.lessons[lesson.id] || {};
      const unlocked = isUnlocked(lesson, progress);
      const button = document.createElement('button');
      button.className = 'lesson-tile';
      button.type = 'button';
      button.disabled = !unlocked || lesson.type === 'locked';
      button.dataset.active = lesson.id === activeLessonId ? 'true' : 'false';
      button.dataset.complete = stats.completed ? 'true' : 'false';

      const status = stats.completed
        ? 'Done'
        : unlocked && lesson.type !== 'locked'
          ? 'Ready'
          : 'Locked';
      button.innerHTML = `
        <span class="lesson-number">${lesson.number}</span>
        <span class="lesson-name">${lesson.shortTitle}</span>
        <span class="lesson-status">${status}</span>
      `;

      if (!button.disabled) {
        button.addEventListener('click', () => onSelect(lesson.id));
      }

      container.appendChild(button);
    });
  }

  return { renderLessonMap };
});
