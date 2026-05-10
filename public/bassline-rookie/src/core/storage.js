(function initStorage(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineStorage = api;
})(typeof window !== 'undefined' ? window : globalThis, function storageFactory() {
  const STORAGE_KEY = 'bassline-rookie-progress-v1';

  function emptyProgress() {
    return { lessons: {} };
  }

  function safeStorage() {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (error) {
      return null;
    }
  }

  function loadProgress() {
    const storage = safeStorage();
    if (!storage) return emptyProgress();

    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
      return parsed && parsed.lessons ? parsed : emptyProgress();
    } catch (error) {
      return emptyProgress();
    }
  }

  function saveProgress(progress) {
    const storage = safeStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function updateLessonStats(progress, lessonId, patch) {
    const current = progress.lessons[lessonId] || {
      attempts: 0,
      bestStreak: 0,
      completed: false,
      completedAt: null,
    };
    progress.lessons[lessonId] = { ...current, ...patch };
    return progress.lessons[lessonId];
  }

  return { STORAGE_KEY, emptyProgress, loadProgress, saveProgress, updateLessonStats };
});
