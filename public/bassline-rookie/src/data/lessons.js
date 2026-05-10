(function initLessons(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineLessons = api;
})(typeof window !== 'undefined' ? window : globalThis, function lessonsFactory() {
  const LESSONS = [
    {
      id: 'meet-the-bass',
      number: 1,
      title: 'Meet the Bass',
      shortTitle: 'Layout',
      goal: 'Know the four open strings and where they sit on the bass.',
      type: 'labeling',
      prompt:
        'Pick a letter button, then tap the string where it belongs. The bass strings go E, A, D, G from low to high.',
      explanation:
        'A bass has four thick strings. Each string has a name. From the lowest sound to the highest sound they are E, A, D, and G.',
      completion: { correctRounds: 2 },
    },
    {
      id: 'open-strings',
      number: 2,
      title: 'Open Strings',
      shortTitle: 'Open Notes',
      goal: 'Recognize E, A, D, and G by sight and sound.',
      type: 'recognition',
      prompt:
        'Press Play String, listen to the sound, then choose the letter you think it is. Right answers add 10. Wrong answers take away 5.',
      explanation:
        'Open string means you play the string without pressing any fret. Listen for which string is making the sound.',
      completion: { scoreTarget: 100, correctScore: 10, wrongScore: -5 },
      requires: 'meet-the-bass',
    },
    {
      id: 'frets-and-fingers',
      number: 3,
      title: 'Frets And Fingers',
      shortTitle: 'Frets',
      goal: 'Place a finger just behind the requested fret.',
      type: 'fret-placement',
      prompt: 'Read the target. Pick the same fret number and finger number, then press Check.',
      explanation:
        'Frets are the metal lines on the neck. Fingers have numbers: pointer is 1, middle is 2, ring is 3, pinky is 4.',
      completion: { correctTargets: 10, maxMisses: 2 },
      requires: 'open-strings',
    },
    {
      id: 'first-notes-e-string',
      number: 4,
      title: 'First Notes: E String',
      shortTitle: 'E Notes',
      goal: 'Move between open E, F, and G.',
      type: 'guided-choice',
      prompt:
        'Look at the target. It tells you a note on the E string. Choose the matching note name.',
      explanation:
        'The E string is the lowest string. Open E means no finger. F is fret 1. G is fret 3.',
      completion: { correctTargets: 8, maxMisses: 3 },
      targets: [
        { label: 'Open E', answer: 'E', stringId: 'E', fret: 0, choices: ['E', 'F', 'G'] },
        { label: 'F on E string', answer: 'F', stringId: 'E', fret: 1, choices: ['E', 'F', 'G'] },
        { label: 'G on E string', answer: 'G', stringId: 'E', fret: 3, choices: ['E', 'F', 'G'] },
      ],
      requires: 'frets-and-fingers',
    },
    {
      id: 'first-groove-rhythm',
      number: 5,
      title: 'First Groove Rhythm',
      shortTitle: 'Pulse',
      goal: 'Play steady quarter notes.',
      type: 'guided-choice',
      prompt:
        'Watch the beat numbers blink. When the target is a beat, choose Play to keep the pulse going.',
      explanation:
        'Pulse means the steady beat in music. Count 1, 2, 3, 4 like a heartbeat and play with it.',
      completion: { correctTargets: 12, maxMisses: 4 },
      targets: [
        { label: 'Beat 1', answer: 'Play', stringId: 'E', fret: 0, choices: ['Play', 'Wait'] },
        { label: 'Beat 2', answer: 'Play', stringId: 'E', fret: 0, choices: ['Play', 'Wait'] },
        { label: 'Beat 3', answer: 'Play', stringId: 'E', fret: 0, choices: ['Play', 'Wait'] },
        { label: 'Beat 4', answer: 'Play', stringId: 'E', fret: 0, choices: ['Play', 'Wait'] },
      ],
      requires: 'first-notes-e-string',
    },
    {
      id: 'a-string-notes',
      number: 6,
      title: 'A String Notes',
      shortTitle: 'A Notes',
      goal: 'Add B and C on the A string.',
      type: 'guided-choice',
      prompt:
        'Look at the target. It tells you a note on the A string. Choose the matching note name.',
      explanation:
        'The A string is the next string after E. Open A means no finger. B is fret 2. C is fret 3.',
      completion: { correctTargets: 8, maxMisses: 3 },
      targets: [
        { label: 'Open A', answer: 'A', stringId: 'A', fret: 0, choices: ['A', 'B', 'C'] },
        { label: 'B on A string', answer: 'B', stringId: 'A', fret: 2, choices: ['A', 'B', 'C'] },
        { label: 'C on A string', answer: 'C', stringId: 'A', fret: 3, choices: ['A', 'B', 'C'] },
      ],
      requires: 'first-groove-rhythm',
    },
    {
      id: 'd-string-notes',
      number: 7,
      title: 'D String Notes',
      shortTitle: 'D Notes',
      goal: 'Add E and F on the D string.',
      type: 'guided-choice',
      prompt:
        'Look at the target. It tells you a note on the D string. Choose the matching note name.',
      explanation:
        'The D string is higher than E and A. Open D means no finger. E is fret 2. F is fret 3.',
      completion: { correctTargets: 8, maxMisses: 3 },
      targets: [
        { label: 'Open D', answer: 'D', stringId: 'D', fret: 0, choices: ['D', 'E', 'F'] },
        { label: 'E on D string', answer: 'E', stringId: 'D', fret: 2, choices: ['D', 'E', 'F'] },
        { label: 'F on D string', answer: 'F', stringId: 'D', fret: 3, choices: ['D', 'E', 'F'] },
      ],
      requires: 'a-string-notes',
    },
    {
      id: 'g-string-notes',
      number: 8,
      title: 'G String Notes',
      shortTitle: 'G Notes',
      goal: 'Add A and B on the G string.',
      type: 'guided-choice',
      prompt:
        'Look at the target. It tells you a note on the G string. Choose the matching note name.',
      explanation:
        'The G string is the highest string on a normal bass. Open G means no finger. A is fret 2. B is fret 4.',
      completion: { correctTargets: 8, maxMisses: 3 },
      targets: [
        { label: 'Open G', answer: 'G', stringId: 'G', fret: 0, choices: ['G', 'A', 'B'] },
        { label: 'A on G string', answer: 'A', stringId: 'G', fret: 2, choices: ['G', 'A', 'B'] },
        { label: 'B on G string', answer: 'B', stringId: 'G', fret: 4, choices: ['G', 'A', 'B'] },
      ],
      requires: 'd-string-notes',
    },
    {
      id: 'two-string-riffs',
      number: 9,
      title: 'Two-String Riffs',
      shortTitle: 'Riffs',
      goal: 'Repeat a short E/A string riff.',
      type: 'guided-choice',
      prompt:
        'A riff is a tiny bass pattern. Read the target, then choose the next note in the riff.',
      explanation:
        'A riff is a short group of notes that repeats. Bass players use riffs to make songs feel strong and fun.',
      completion: { correctTargets: 10, maxMisses: 3 },
      targets: [
        {
          label: 'Riff note 1',
          answer: 'E',
          stringId: 'E',
          fret: 0,
          choices: ['E', 'G', 'A', 'B'],
        },
        {
          label: 'Riff note 2',
          answer: 'G',
          stringId: 'E',
          fret: 3,
          choices: ['E', 'G', 'A', 'B'],
        },
        {
          label: 'Riff note 3',
          answer: 'A',
          stringId: 'A',
          fret: 0,
          choices: ['E', 'G', 'A', 'B'],
        },
        {
          label: 'Riff note 4',
          answer: 'B',
          stringId: 'A',
          fret: 2,
          choices: ['E', 'G', 'A', 'B'],
        },
      ],
      requires: 'g-string-notes',
    },
    {
      id: 'rests-and-space',
      number: 10,
      title: 'Rests And Space',
      shortTitle: 'Rests',
      goal: 'Leave silence on purpose.',
      type: 'guided-choice',
      prompt:
        'Sometimes music needs quiet space. Choose Play for a note and Rest when the target says silence.',
      explanation:
        'A rest means do not play for that beat. Quiet space is part of the groove, just like the notes.',
      completion: { correctTargets: 12, maxMisses: 2 },
      targets: [
        { label: 'Beat 1: E', answer: 'Play', stringId: 'E', fret: 0, choices: ['Play', 'Rest'] },
        { label: 'Beat 2: silence', answer: 'Rest', choices: ['Play', 'Rest'] },
        { label: 'Beat 3: A', answer: 'Play', stringId: 'A', fret: 0, choices: ['Play', 'Rest'] },
        { label: 'Beat 4: silence', answer: 'Rest', choices: ['Play', 'Rest'] },
      ],
      requires: 'two-string-riffs',
    },
    {
      id: 'first-full-bassline',
      number: 11,
      title: 'First Full Bassline',
      shortTitle: 'Bassline',
      goal: 'Combine notes, timing, and rests.',
      type: 'guided-choice',
      prompt:
        'This is a full bassline. Choose the note or Rest shown by each target, one step at a time.',
      explanation:
        'A bassline is the bass part of a song. It mixes notes, beats, and rests into one pattern.',
      completion: { correctTargets: 14, maxMisses: 4 },
      targets: [
        {
          label: 'Bar 1 beat 1',
          answer: 'E',
          stringId: 'E',
          fret: 0,
          choices: ['E', 'G', 'A', 'Rest'],
        },
        {
          label: 'Bar 1 beat 2',
          answer: 'G',
          stringId: 'E',
          fret: 3,
          choices: ['E', 'G', 'A', 'Rest'],
        },
        {
          label: 'Bar 1 beat 3',
          answer: 'A',
          stringId: 'A',
          fret: 0,
          choices: ['E', 'G', 'A', 'Rest'],
        },
        { label: 'Bar 1 beat 4', answer: 'Rest', choices: ['E', 'G', 'A', 'Rest'] },
      ],
      requires: 'rests-and-space',
    },
    {
      id: 'practice-routine',
      number: 12,
      title: 'Practice Routine',
      shortTitle: 'Routine',
      goal: 'Build a short independent practice habit.',
      type: 'guided-choice',
      prompt:
        'A routine is your practice plan. Choose the helpful practice step and avoid silly shortcuts.',
      explanation:
        'A practice routine is a small plan you can repeat: warm up, review notes, practice rhythm, play a riff, then pick what to try next.',
      completion: { correctTargets: 5, maxMisses: 2 },
      targets: [
        {
          label: 'Step 1',
          answer: 'Warm up',
          choices: ['Warm up', 'Rush fast', 'Skip tuning', 'Stop'],
        },
        {
          label: 'Step 2',
          answer: 'Review notes',
          choices: ['Review notes', 'Rush fast', 'Stop', 'Skip rhythm'],
        },
        {
          label: 'Step 3',
          answer: 'Clap rhythm',
          choices: ['Clap rhythm', 'Skip rhythm', 'Stop', 'Rush fast'],
        },
        {
          label: 'Step 4',
          answer: 'Play riff',
          choices: ['Play riff', 'Stop', 'Skip tuning', 'Rush fast'],
        },
        {
          label: 'Step 5',
          answer: 'Pick next goal',
          choices: ['Pick next goal', 'Forget it', 'Stop', 'Rush fast'],
        },
      ],
      requires: 'first-full-bassline',
    },
  ];

  function getLesson(id) {
    return LESSONS.find((lesson) => lesson.id === id) || null;
  }

  return { LESSONS, getLesson };
});
