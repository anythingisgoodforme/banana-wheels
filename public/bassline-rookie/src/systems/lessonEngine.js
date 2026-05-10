(function initLessonEngine(root, factory) {
  const dependency = typeof require === 'function' ? require('./scoring') : root.BasslineScoring;
  const api = factory(dependency);
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineLessonEngine = api;
})(typeof window !== 'undefined' ? window : globalThis, function lessonEngineFactory(scoring) {
  function createLessonState(lesson) {
    return {
      lessonId: lesson.id,
      type: lesson.type,
      attempts: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      score: 0,
      misses: 0,
      completed: false,
      labelRounds: 0,
      lastTarget: null,
      message: lesson.prompt || lesson.goal,
    };
  }

  function recordAnswer(state, lesson, isCorrect) {
    const next = { ...state };
    next.attempts += 1;

    if (isCorrect) {
      next.correct += 1;
      next.streak += 1;
      next.bestStreak = Math.max(next.bestStreak, next.streak);
    } else {
      next.streak = 0;
    }

    if (lesson.completion.scoreTarget) {
      const delta = isCorrect ? lesson.completion.correctScore : lesson.completion.wrongScore;
      next.score = Math.max(0, Math.min(100, next.score + delta));
    }

    next.completed = isLessonComplete(next, lesson);
    return next;
  }

  function recordFretPlacement(state, lesson, isCorrect) {
    return recordPracticeAnswer(state, lesson, isCorrect);
  }

  function recordPracticeAnswer(state, lesson, isCorrect) {
    const next = recordAnswer(state, lesson, isCorrect);
    if (!isCorrect) {
      next.misses += 1;
    }
    next.completed = isLessonComplete(next, lesson);
    return next;
  }

  function recordLabelRound(state, lesson, correctCount, totalCount) {
    const next = { ...state };
    next.attempts += totalCount;
    next.correct += correctCount;

    if (correctCount === totalCount) {
      next.labelRounds += 1;
      next.streak += correctCount;
      next.bestStreak = Math.max(next.bestStreak, next.streak);
    } else {
      next.streak = 0;
    }

    next.completed = isLessonComplete(next, lesson);
    return next;
  }

  function isLessonComplete(state, lesson) {
    if (lesson.type === 'labeling') {
      return state.labelRounds >= lesson.completion.correctRounds;
    }

    if (lesson.type === 'recognition') {
      if (lesson.completion.scoreTarget) {
        return state.score >= lesson.completion.scoreTarget;
      }

      return (
        state.attempts >= lesson.completion.attempts &&
        scoring.accuracy(state.correct, state.attempts) >= lesson.completion.minAccuracy
      );
    }

    if (lesson.type === 'fret-placement') {
      return (
        state.correct >= lesson.completion.correctTargets &&
        state.misses <= lesson.completion.maxMisses
      );
    }

    if (lesson.type === 'guided-choice') {
      return (
        state.correct >= lesson.completion.correctTargets &&
        state.misses <= lesson.completion.maxMisses
      );
    }

    return false;
  }

  function isLessonUnlocked(lesson, progress) {
    if (!lesson.requires) return true;
    return Boolean(progress.lessons[lesson.requires]?.completed);
  }

  return {
    createLessonState,
    isLessonComplete,
    isLessonUnlocked,
    recordAnswer,
    recordFretPlacement,
    recordLabelRound,
    recordPracticeAnswer,
  };
});
