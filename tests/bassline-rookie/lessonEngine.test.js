const { LESSONS } = require('../../public/bassline-rookie/src/data/lessons');
const {
  createLessonState,
  isLessonUnlocked,
  recordAnswer,
  recordFretPlacement,
  recordLabelRound,
  recordPracticeAnswer,
} = require('../../public/bassline-rookie/src/systems/lessonEngine');

describe('Bassline Rookie lesson engine', () => {
  const labelingLesson = LESSONS[0];
  const recognitionLesson = LESSONS[1];
  const fretLesson = LESSONS[2];

  test('completes lesson 1 after two perfect label rounds', () => {
    let state = createLessonState(labelingLesson);
    state = recordLabelRound(state, labelingLesson, 4, 4);
    expect(state.completed).toBe(false);
    state = recordLabelRound(state, labelingLesson, 4, 4);
    expect(state.completed).toBe(true);
  });

  test('does not count imperfect label rounds toward completion', () => {
    let state = createLessonState(labelingLesson);
    state = recordLabelRound(state, labelingLesson, 3, 4);
    state = recordLabelRound(state, labelingLesson, 4, 4);
    expect(state.labelRounds).toBe(1);
    expect(state.completed).toBe(false);
  });

  test('scores lesson 2 with ten points right and minus five wrong', () => {
    let state = createLessonState(recognitionLesson);
    state = recordAnswer(state, recognitionLesson, true);
    state = recordAnswer(state, recognitionLesson, true);
    state = recordAnswer(state, recognitionLesson, false);
    expect(state.score).toBe(15);
    expect(state.completed).toBe(false);
  });

  test('completes lesson 2 when the score reaches one hundred', () => {
    let state = createLessonState(recognitionLesson);
    for (let i = 0; i < 9; i += 1) {
      state = recordAnswer(state, recognitionLesson, true);
    }
    expect(state.score).toBe(90);
    expect(state.completed).toBe(false);

    state = recordAnswer(state, recognitionLesson, true);
    expect(state.score).toBe(100);
    expect(state.completed).toBe(true);
  });

  test('keeps lesson 2 score between zero and one hundred', () => {
    let state = createLessonState(recognitionLesson);
    state = recordAnswer(state, recognitionLesson, false);
    expect(state.score).toBe(0);

    for (let i = 0; i < 12; i += 1) {
      state = recordAnswer(state, recognitionLesson, true);
    }

    expect(state.score).toBe(100);
  });

  test('unlocks dependent lessons only after required completion', () => {
    expect(isLessonUnlocked(labelingLesson, { lessons: {} })).toBe(true);
    expect(isLessonUnlocked(recognitionLesson, { lessons: {} })).toBe(false);
    expect(
      isLessonUnlocked(recognitionLesson, {
        lessons: { 'meet-the-bass': { completed: true } },
      })
    ).toBe(true);
    expect(
      isLessonUnlocked(fretLesson, {
        lessons: { 'open-strings': { completed: true } },
      })
    ).toBe(true);
  });

  test('completes lesson 3 after ten correct fret placements with no more than two misses', () => {
    let state = createLessonState(fretLesson);
    state = recordFretPlacement(state, fretLesson, false);
    state = recordFretPlacement(state, fretLesson, false);

    for (let i = 0; i < 9; i += 1) {
      state = recordFretPlacement(state, fretLesson, true);
    }

    expect(state.completed).toBe(false);
    state = recordFretPlacement(state, fretLesson, true);
    expect(state.misses).toBe(2);
    expect(state.completed).toBe(true);
  });

  test('keeps lesson 3 incomplete after more than two misses', () => {
    let state = createLessonState(fretLesson);
    state = recordFretPlacement(state, fretLesson, false);
    state = recordFretPlacement(state, fretLesson, false);
    state = recordFretPlacement(state, fretLesson, false);

    for (let i = 0; i < 10; i += 1) {
      state = recordFretPlacement(state, fretLesson, true);
    }

    expect(state.misses).toBe(3);
    expect(state.completed).toBe(false);
  });

  test('remaining named lessons are playable and unlock in order', () => {
    const playableLessons = LESSONS.filter((lesson) => lesson.number >= 4);
    expect(playableLessons.map((lesson) => lesson.shortTitle)).toEqual([
      'E Notes',
      'Pulse',
      'A Notes',
      'D Notes',
      'G Notes',
      'Riffs',
      'Rests',
      'Bassline',
      'Routine',
      'Song',
    ]);
    expect(playableLessons.every((lesson) => lesson.type === 'guided-choice')).toBe(true);

    const progress = {
      lessons: {
        'frets-and-fingers': { completed: true },
      },
    };

    playableLessons.forEach((lesson) => {
      expect(isLessonUnlocked(lesson, progress)).toBe(true);
      progress.lessons[lesson.id] = { completed: true };
    });
  });

  test('guided-choice lessons complete at their correct target count', () => {
    const eNotesLesson = LESSONS[3];
    let state = createLessonState(eNotesLesson);

    for (let i = 0; i < eNotesLesson.completion.correctTargets - 1; i += 1) {
      state = recordPracticeAnswer(state, eNotesLesson, true);
    }

    expect(state.completed).toBe(false);
    state = recordPracticeAnswer(state, eNotesLesson, true);
    expect(state.completed).toBe(true);
  });

  test('every lesson explains the concept and gives an example', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.explanation).toEqual(expect.any(String));
      expect(lesson.explanation.length).toBeGreaterThan(24);
      expect(lesson.example).toEqual(expect.any(String));
      expect(lesson.example.length).toBeGreaterThan(16);
    });
  });

  test('riff lesson stays beginner friendly', () => {
    const riffLesson = LESSONS.find((lesson) => lesson.id === 'two-string-riffs');

    expect(riffLesson.practiceMode).toBe('riff-sequence');
    expect(riffLesson.targets.map((target) => target.answer)).toEqual(['E', 'G', 'A', 'B']);
    expect(riffLesson.completion).toMatchObject({ correctTargets: 3, maxMisses: 4 });
    riffLesson.targets.forEach((target) => {
      expect(target.choices).toHaveLength(2);
      expect(target.choices).toContain(target.answer);
    });
  });
});
