(function initBasslineRookie(root) {
  const { LESSONS, getLesson } = root.BasslineLessons;
  const glossary = root.BasslineGlossary;
  const notes = root.BasslineNotes;
  const storage = root.BasslineStorage;
  const lessonEngine = root.BasslineLessonEngine;
  const rhythmAnswers = root.BasslineRhythmAnswers;
  const scoring = root.BasslineScoring;
  const { BassAudio } = root.BasslineAudio;
  const { MicrophonePitch } = root.BasslineMicrophone;
  const { setFeedback } = root.BasslineFeedback;
  const { renderFretboard, renderLabelChips } = root.BasslineFretboard;
  const { renderLessonMap } = root.BasslineLessonMap;
  const { renderPulse } = root.BasslineRhythmTrainer;
  const { QUARTER_PULSE } = root.BasslineRhythms;
  const ONLY_LAYOUT_LESSON = false;
  const DEMO_MODE_KEY = 'basslineRookieDemoMode';
  const INTRO_DISMISSED_KEY = 'basslineRookieIntroDismissed';
  const THEME_KEY = 'basslineRookieTheme';
  const SEARCH_HISTORY_KEY = 'basslineRookieSearchHistory';
  const MAX_SEARCH_HISTORY = 6;
  const INTRO_TOPICS = {
    strings: {
      title: 'Hear the strings',
      body: 'This part is about learning the four open bass strings: E, A, D, and G. The app helps you recognize each string by name and connect the sound to the right string.',
      points: [
        'Learn the string names in order',
        'Practice matching string names to the bass',
        'Use the mic later to check real notes',
      ],
    },
    frets: {
      title: 'Find the frets',
      body: 'This part is about finding notes by moving along the fretboard. Frets are the metal lines that change the pitch when you press a string down.',
      points: [
        'Learn what fret numbers mean',
        'See how one string can make many notes',
        'Build confidence moving from fret to fret',
      ],
    },
    fingers: {
      title: 'Place your fingers',
      body: 'This part is about using relaxed, accurate finger placement. The goal is to press close to the fret, avoid buzzing, and use fingers that make the next move easier.',
      points: [
        'Use simple finger numbers',
        'Press near the fret instead of far behind it',
        'Practice clean notes without pressing too hard',
      ],
    },
    rhythm: {
      title: 'Lock in rhythm',
      body: 'This part is about playing notes at the right time. Bass is often the bridge between drums and harmony, so steady timing matters as much as choosing the right note.',
      points: [
        'Count beats slowly',
        'Practice simple pulse patterns',
        'Learn when to leave space between notes',
      ],
    },
    bassline: {
      title: 'Build a bassline',
      body: 'This part is about turning notes and rhythm into a small musical idea. You start with simple choices, then combine them into short basslines and riffs.',
      points: [
        'Choose notes that fit together',
        'Put them into a repeatable pattern',
        'Use rhythm to make the line feel musical',
      ],
    },
  };

  const elements = {
    questionSearchForm: document.querySelector('#questionSearchForm'),
    questionSearch: document.querySelector('#questionSearch'),
    searchHistory: document.querySelector('#searchHistory'),
    searchResult: document.querySelector('#searchResult'),
    themeToggleButton: document.querySelector('#themeToggleButton'),
    demoModeToggle: document.querySelector('#demoModeToggle'),
    showIntroButton: document.querySelector('#showIntroButton'),
    gettingStartedPanel: document.querySelector('#gettingStartedPanel'),
    gettingStartedCopy: document.querySelector('.getting-started-copy'),
    gettingStartedSteps: document.querySelector('.getting-started-steps'),
    understandIntroButton: document.querySelector('#understandIntroButton'),
    introTopicButtons: document.querySelectorAll('[data-intro-topic]'),
    introTopicPage: document.querySelector('#introTopicPage'),
    introTopicTitle: document.querySelector('#introTopicTitle'),
    introTopicBody: document.querySelector('#introTopicBody'),
    introTopicList: document.querySelector('#introTopicList'),
    introBackButton: document.querySelector('#introBackButton'),
    lessonMap: document.querySelector('#lessonMap'),
    lessonTitle: document.querySelector('#lessonTitle'),
    lessonGoal: document.querySelector('#lessonGoal'),
    lessonExplanation: document.querySelector('#lessonExplanation'),
    lessonExample: document.querySelector('#lessonExample'),
    lessonPrompt: document.querySelector('#lessonPrompt'),
    helpButton: document.querySelector('#helpButton'),
    lessonHelp: document.querySelector('#lessonHelp'),
    micButton: document.querySelector('#micButton'),
    micLabel: document.querySelector('#micLabel'),
    micStatus: document.querySelector('#micStatus'),
    sensitiveMic: document.querySelector('#sensitiveMicToggle'),
    micLevelText: document.querySelector('#micLevelText'),
    micLevelBar: document.querySelector('#micLevelBar'),
    micThresholdMarker: document.querySelector('#micThresholdMarker'),
    confettiLayer: document.querySelector('#confettiLayer'),
    fretboard: document.querySelector('#fretboard'),
    labelChips: document.querySelector('#labelChips'),
    actionArea: document.querySelector('#actionArea'),
    feedback: document.querySelector('#feedback'),
    attempts: document.querySelector('#attempts'),
    streak: document.querySelector('#streak'),
    accuracy: document.querySelector('#accuracy'),
    completed: document.querySelector('#completed'),
    pulse: document.querySelector('#pulse'),
  };

  const audio = new BassAudio();
  applySavedTheme();

  const app = {
    progress: storage.loadProgress(),
    activeLessonId: 'meet-the-bass',
    lessonState: null,
    selectedLabel: null,
    placedLabels: {},
    recognitionTarget: null,
    fretTarget: null,
    guidedTarget: null,
    selectedFret: null,
    selectedFinger: null,
    sessionBaseline: null,
    pulseBeat: 0,
    pulseTimer: null,
    songTimer: null,
    songPhase: 'ready',
    songCountIn: 4,
    songStep: 0,
    songBeatAt: 0,
    songBounceTick: 0,
    mic: null,
    micListening: false,
    lastMicAnswerAt: 0,
    lessonPhase: 'learn',
    riffAnswer: [],
    riffPattern: [],
    riffChoices: [],
    demoMode: loadDemoMode(),
    searchHistory: loadSearchHistory(),
  };

  function init() {
    elements.demoModeToggle.checked = app.demoMode;
    renderThemeButton();
    selectLesson(firstPlayableLessonId());
    renderSearchHistory();
    elements.questionSearchForm.addEventListener('submit', searchQuestion);
    elements.questionSearch.addEventListener('input', searchQuestion);
    elements.searchHistory.addEventListener('click', handleSearchHistoryAction);
    elements.searchResult.addEventListener('click', handleSearchResultAction);
    elements.themeToggleButton.addEventListener('click', toggleTheme);
    elements.demoModeToggle.addEventListener('change', toggleDemoMode);
    elements.understandIntroButton.addEventListener('click', dismissIntro);
    elements.showIntroButton.addEventListener('click', showIntro);
    elements.introTopicButtons.forEach((button) => {
      button.addEventListener('click', handleIntroTopic);
    });
    elements.introBackButton.addEventListener('click', showIntroHome);
    elements.micButton.addEventListener('click', toggleMicrophone);
    elements.sensitiveMic.addEventListener('change', restartMicIfListening);
    window.addEventListener('beforeunload', () => {
      clearPulse();
      clearSongPlayback();
    });
    renderIntroState();
  }

  function applySavedTheme() {
    const savedTheme = window.localStorage?.getItem(THEME_KEY) || 'light';
    document.body.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
  }

  function toggleTheme() {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = nextTheme;
    window.localStorage?.setItem(THEME_KEY, nextTheme);
    renderThemeButton();
  }

  function renderThemeButton() {
    elements.themeToggleButton.textContent =
      document.body.dataset.theme === 'dark' ? 'Light mode' : 'Dark mode';
  }

  function loadDemoMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      window.localStorage?.setItem(DEMO_MODE_KEY, 'true');
      return true;
    }

    return window.localStorage?.getItem(DEMO_MODE_KEY) === 'true';
  }

  function toggleDemoMode() {
    app.demoMode = elements.demoModeToggle.checked;
    window.localStorage?.setItem(DEMO_MODE_KEY, app.demoMode ? 'true' : 'false');

    const activeLesson = getLesson(app.activeLessonId);
    if (!activeLesson || !isLessonAvailable(activeLesson)) {
      selectLesson(firstPlayableLessonId());
      return;
    }

    render();
  }

  function dismissIntro() {
    window.localStorage?.setItem(INTRO_DISMISSED_KEY, 'true');
    renderIntroState();
    elements.lessonTitle.focus({ preventScroll: true });
  }

  function showIntro() {
    window.localStorage?.setItem(INTRO_DISMISSED_KEY, 'false');
    showIntroHome();
    renderIntroState();
  }

  function handleIntroTopic(event) {
    const topic = INTRO_TOPICS[event.currentTarget.dataset.introTopic];
    if (!topic) return;

    elements.gettingStartedPanel.dataset.topicOpen = 'true';
    elements.gettingStartedCopy.hidden = true;
    elements.gettingStartedSteps.hidden = true;
    elements.introTopicPage.hidden = false;
    elements.introTopicTitle.textContent = topic.title;
    elements.introTopicBody.textContent = topic.body;
    elements.introTopicList.replaceChildren(
      ...topic.points.map((point) => {
        const item = document.createElement('p');
        item.textContent = point;
        return item;
      })
    );
    elements.introTopicTitle.focus({ preventScroll: true });
  }

  function showIntroHome() {
    elements.gettingStartedPanel.dataset.topicOpen = 'false';
    elements.gettingStartedCopy.hidden = false;
    elements.gettingStartedSteps.hidden = false;
    elements.introTopicPage.hidden = true;
  }

  function renderIntroState() {
    const dismissed = window.localStorage?.getItem(INTRO_DISMISSED_KEY) === 'true';
    elements.gettingStartedPanel.hidden = dismissed;
    elements.gettingStartedPanel.setAttribute('aria-modal', dismissed ? 'false' : 'true');
    elements.showIntroButton.hidden = !dismissed;
    document.body.dataset.introOpen = dismissed ? 'false' : 'true';
  }

  function searchQuestion(event) {
    event.preventDefault();
    const query = elements.questionSearch.value;
    const results = searchBassGuide(query);

    if (!normalizeSearchText(query)) {
      renderSearchIntro();
      return;
    }

    if (event.type === 'submit' || event.saveHistory) {
      saveSearchQuery(query);
    }

    const answer = buildBassSearchAnswer(query, results);

    elements.searchResult.innerHTML = `
      <section class="search-answer-card" aria-label="Bass guitar answer">
        <span>Quick answer</span>
        <strong>${answer.title}</strong>
        <p>${answer.shortAnswer}</p>
        <button class="search-result-action" type="button" data-search-answer>Read full answer</button>
      </section>
      <span>${results.length ? `${results.length} related result${results.length === 1 ? '' : 's'}` : 'Try next'}</span>
      <strong>${results.length ? 'Related bass guitar matches' : 'Good next searches'}</strong>
      <div class="search-results-list">
        ${
          results.length
            ? results.map(renderSearchResult).join('')
            : ['tuning', 'plucking', 'muting', 'groove']
                .map((term) => renderSearchSuggestion(term))
                .join('')
        }
      </div>
    `;
  }

  function renderSearchIntro() {
    elements.searchResult.innerHTML = `
      <span>Search</span>
      <strong>Search the whole beginner bass guide</strong>
      <p>Look up technique, fretboard ideas, practice questions, rhythm terms, gear basics, or lessons.</p>
      <div class="search-hit-actions">
        <button class="search-result-action" type="button" data-search-suggestion="tuning">Tuning</button>
        <button class="search-result-action" type="button" data-search-suggestion="rhythm">Rhythm</button>
        <button class="search-result-action" type="button" data-search-suggestion="bassline">Bassline</button>
      </div>
    `;
  }

  function handleSearchResultAction(event) {
    if (event.target.closest('[data-search-answer]')) {
      renderFocusedSearchAnswer(elements.questionSearch.value);
      return;
    }

    const lessonButton = event.target.closest('[data-search-lesson]');
    if (lessonButton) {
      renderFocusedSearchLesson(lessonButton.dataset.searchLesson);
      return;
    }

    const guideButton = event.target.closest('[data-search-guide]');
    if (guideButton) {
      renderFocusedSearchGuide(guideButton.dataset.searchGuide);
      return;
    }

    const suggestionButton = event.target.closest('[data-search-suggestion]');
    if (suggestionButton) {
      elements.questionSearch.value = suggestionButton.dataset.searchSuggestion;
      searchQuestion({ preventDefault() {}, saveHistory: true });
      return;
    }

    if (event.target.closest('[data-search-back]')) {
      searchQuestion({ preventDefault() {} });
    }
  }

  function handleSearchHistoryAction(event) {
    const historyButton = event.target.closest('[data-search-history]');
    if (historyButton) {
      elements.questionSearch.value = historyButton.dataset.searchHistory;
      searchQuestion({ preventDefault() {} });
      return;
    }

    if (event.target.closest('[data-clear-search-history]')) {
      app.searchHistory = [];
      window.localStorage?.removeItem(SEARCH_HISTORY_KEY);
      renderSearchHistory();
    }
  }

  function saveSearchQuery(query) {
    const cleanQuery = String(query || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanQuery) return;

    const lowerQuery = cleanQuery.toLowerCase();
    app.searchHistory = [
      cleanQuery,
      ...app.searchHistory.filter((item) => item.toLowerCase() !== lowerQuery),
    ].slice(0, MAX_SEARCH_HISTORY);

    try {
      window.localStorage?.setItem(SEARCH_HISTORY_KEY, JSON.stringify(app.searchHistory));
    } catch (_error) {
      // Search history is optional; ignore storage errors.
    }

    renderSearchHistory();
  }

  function loadSearchHistory() {
    try {
      const parsed = JSON.parse(window.localStorage?.getItem(SEARCH_HISTORY_KEY) || '[]');
      return Array.isArray(parsed)
        ? parsed
            .filter((item) => typeof item === 'string' && item.trim())
            .slice(0, MAX_SEARCH_HISTORY)
        : [];
    } catch (_error) {
      return [];
    }
  }

  function renderSearchHistory() {
    if (!app.searchHistory.length) {
      elements.searchHistory.innerHTML = '';
      elements.searchHistory.hidden = true;
      return;
    }

    elements.searchHistory.hidden = false;
    elements.searchHistory.innerHTML = `
      <span>History</span>
      <div class="search-history-actions">
        ${app.searchHistory
          .map(
            (query) => `
              <button type="button" data-search-history="${escapeHtml(query)}">${escapeHtml(query)}</button>
            `
          )
          .join('')}
        <button type="button" data-clear-search-history>Clear</button>
      </div>
    `;
  }

  function renderFocusedSearchGuide(term) {
    const topic = glossary.TOPICS.find((item) => item.term === term);
    if (!topic) return;

    const toolAction = searchToolActionForTopic(topic);
    elements.searchResult.innerHTML = `
      <section class="search-focus-card" aria-label="${topic.term} guide">
        <div class="search-focus-progress">
          <span>Guide result</span>
          <strong>${topic.term}</strong>
        </div>
        <p>${topic.explanation}</p>
        <div class="search-focus-actions">
          ${
            toolAction
              ? `<a class="primary-action search-focus-link" href="${toolAction.href}">${toolAction.label}</a>`
              : ''
          }
          <button class="secondary-action" type="button" data-search-suggestion="${topic.term}">
            Search related
          </button>
          <button class="secondary-action" type="button" data-search-back>Back to results</button>
        </div>
      </section>
    `;
  }

  function renderFocusedSearchAnswer(query) {
    const results = searchBassGuide(query);
    const answer = buildBassSearchAnswer(query, results);

    elements.searchResult.innerHTML = `
      <section class="search-focus-card" aria-label="${answer.title} answer">
        <div class="search-focus-progress">
          <span>Bass answer</span>
          <strong>${answer.title}</strong>
        </div>
        <p>${answer.fullAnswer}</p>
        <div class="search-focus-notes">
          ${answer.steps
            .map(
              (step, index) => `
                <span>
                  <small>Step ${index + 1}</small>
                  ${step}
                </span>
              `
            )
            .join('')}
        </div>
        <div class="search-focus-actions">
          <button class="secondary-action" type="button" data-search-suggestion="${answer.relatedSearch}">
            Search related
          </button>
          <button class="secondary-action" type="button" data-search-back>Back to results</button>
        </div>
      </section>
    `;
  }

  function renderFocusedSearchLesson(lessonId) {
    const lesson = getLesson(lessonId);
    if (!lesson) return;

    elements.searchResult.innerHTML = `
      <section class="search-focus-card" aria-label="${lesson.title} search detail">
        <div class="search-focus-progress">
          <span>Lesson idea</span>
          <strong>${lesson.title}</strong>
        </div>
        <p>${lesson.explanation}</p>
        <div class="search-focus-notes">
          <span>
            <small>Goal</small>
            ${lesson.goal}
          </span>
          <span>
            <small>Example</small>
            ${lesson.example}
          </span>
          <span>
            <small>Practice</small>
            ${lesson.prompt}
          </span>
        </div>
        <div class="search-focus-actions">
          <button class="secondary-action" type="button" data-search-suggestion="${lesson.shortTitle || lesson.title}">
            Search related
          </button>
          <button class="secondary-action" type="button" data-search-back>Back to results</button>
        </div>
      </section>
    `;
  }

  function searchBassGuide(query) {
    const normalized = normalizeSearchText(query);
    if (!normalized) return [];
    const terms = getSearchTerms(normalized);
    const searchableQuery = terms.join(' ');

    const topicResults = glossary.TOPICS.map((topic) => ({
      type: 'Guide',
      title: topic.term,
      body: topic.explanation,
      guideTerm: topic.term,
      toolAction: searchToolActionForTopic(topic),
      score: scoreSearchDocument(searchableQuery, terms, [
        topic.term,
        ...(topic.keywords || []),
        topic.explanation,
      ]),
    }));

    const lessonResults = LESSONS.map((lesson) => ({
      type: 'Lesson',
      title: `${lesson.number}. ${lesson.title}`,
      body: lesson.goal,
      lessonId: lesson.id,
      score: scoreSearchDocument(searchableQuery, terms, [
        lesson.title,
        lesson.shortTitle,
        lesson.goal,
        lesson.prompt,
        lesson.explanation,
        lesson.example,
      ]),
    }));

    const rankedResults = [...topicResults, ...lessonResults]
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
      .slice(0, 6);

    const fallback = glossary.searchGlossary(query);
    if (fallback && !rankedResults.some((result) => result.guideTerm === fallback.term)) {
      rankedResults.unshift({
        type: 'Guide',
        title: fallback.term,
        body: fallback.explanation,
        guideTerm: fallback.term,
        score: rankedResults[0]?.score ? rankedResults[0].score + 1 : 1,
      });
    }

    if (rankedResults.length) return rankedResults.slice(0, 6);

    return fallback
      ? [
          {
            type: 'Guide',
            title: fallback.term,
            body: fallback.explanation,
            guideTerm: fallback.term,
            score: 1,
          },
        ]
      : [];
  }

  function renderSearchResult(result) {
    const lessonAction = result.lessonId
      ? `<button class="search-result-action" type="button" data-search-lesson="${result.lessonId}">Learn more</button>`
      : '';
    const guideAction = result.guideTerm
      ? `<button class="search-result-action" type="button" data-search-guide="${result.guideTerm}">Learn more</button>`
      : '';
    const toolAction = result.toolAction
      ? `<a class="search-result-action" href="${result.toolAction.href}">${result.toolAction.label}</a>`
      : '';

    return `
      <article class="search-hit">
        <div class="search-hit-meta">
          <span>${result.type}</span>
          <div class="search-hit-actions">
            ${toolAction}
            ${lessonAction}
            ${guideAction}
          </div>
        </div>
        <h3>${result.title}</h3>
        <p>${result.body}</p>
      </article>
    `;
  }

  function renderSearchSuggestion(term) {
    return `
      <article class="search-hit">
        <div class="search-hit-meta">
          <span>Suggestion</span>
          <div class="search-hit-actions">
            <button class="search-result-action" type="button" data-search-suggestion="${term}">Search</button>
          </div>
        </div>
        <h3>${term}</h3>
        <p>Press Search to get a beginner bass guitar answer about ${term}.</p>
      </article>
    `;
  }

  function searchToolActionForTopic(topic) {
    if (topic.term === 'Tuning') {
      return { label: 'Tuner', href: 'tuner.html' };
    }

    return null;
  }

  function buildBassSearchAnswer(query, results) {
    const cleanQuery = escapeHtml(String(query || '').trim());
    const guideResult = results.find((result) => result.guideTerm);
    const lessonResult = results.find((result) => result.lessonId);

    if (guideResult) {
      return {
        title: guideResult.title,
        shortAnswer: firstSentences(guideResult.body, 2),
        fullAnswer: guideResult.body,
        relatedSearch: guideResult.title,
        steps: [
          `Say the idea out loud: ${guideResult.title}.`,
          'Try one slow example on the bass before making it faster.',
          'Listen for clean sound and steady timing, not speed.',
        ],
      };
    }

    if (lessonResult) {
      const lesson = getLesson(lessonResult.lessonId);
      return {
        title: lesson.title,
        shortAnswer: `${lesson.explanation} ${lesson.example}`,
        fullAnswer: `${lesson.explanation} ${lesson.example} ${lesson.prompt}`,
        relatedSearch: lesson.shortTitle || lesson.title,
        steps: [lesson.goal, lesson.example, lesson.prompt],
      };
    }

    return {
      title: cleanQuery ? `About ${cleanQuery}` : 'Bass guitar answer',
      shortAnswer:
        'For bass guitar, connect the question to one of the basics: the note, the timing, or the technique. Start slowly, make the note clean, then repeat it with a steady beat.',
      fullAnswer: `For "${cleanQuery || 'this'}", think like a bass player: what note should happen, when should it happen, and how cleanly can you play it? Most beginner bass questions become easier when you slow down, name the string or fret, count the beat, and listen for unwanted string noise.`,
      relatedSearch: 'bass guitar basics',
      steps: [
        'Find the string, fret, or rhythm the question is really about.',
        'Try one slow example and count 1, 2, 3, 4 while you play.',
        'If it sounds messy, check tuning, finger placement, plucking, and muting.',
      ],
    };
  }

  function firstSentences(value, count) {
    const sentences = String(value || '').match(/[^.!?]+[.!?]+/g) || [String(value || '')];
    return sentences.slice(0, count).join(' ').trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function scoreSearchDocument(normalizedQuery, words, fields) {
    if (!words.length) return 0;

    return fields.reduce((total, field, index) => {
      const normalizedField = normalizeSearchText(field);
      if (!normalizedField) return total;

      let score = total;
      if (normalizedField === normalizedQuery) score += 120 - index * 4;
      if (normalizedField.includes(normalizedQuery)) score += 64 - index * 3;

      words.forEach((word) => {
        if (normalizedField.includes(word)) score += Math.max(6, 18 - index * 2);
      });

      return score;
    }, 0);
  }

  function getSearchTerms(normalizedQuery) {
    const stopWords = new Set([
      'a',
      'an',
      'and',
      'about',
      'can',
      'do',
      'for',
      'guitar',
      'how',
      'i',
      'is',
      'me',
      'my',
      'of',
      'the',
      'to',
      'what',
      'with',
    ]);

    const terms = normalizedQuery
      .split(' ')
      .filter((word) => word.length > 1 && !stopWords.has(word));

    return terms.length ? terms : normalizedQuery.split(' ').filter(Boolean);
  }

  function normalizeSearchText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function firstPlayableLessonId() {
    const firstOpen = LESSONS.find(
      (lesson) =>
        lesson.type !== 'locked' &&
        isLessonAvailable(lesson) &&
        !app.progress.lessons[lesson.id]?.completed
    );
    return firstOpen?.id || 'meet-the-bass';
  }

  function selectLesson(lessonId) {
    const lesson = getLesson(lessonId);
    if (!lesson || !isLessonAvailable(lesson) || lesson.type === 'locked') {
      return;
    }

    clearPulse();
    clearSongPlayback();
    app.activeLessonId = lesson.id;
    app.lessonState = lessonEngine.createLessonState(lesson);
    app.sessionBaseline = app.progress.lessons[lesson.id] || {};
    app.lessonState.completed = Boolean(app.sessionBaseline.completed);
    app.lessonPhase = app.lessonState.completed ? 'test' : 'learn';
    app.selectedLabel = null;
    app.placedLabels = {};
    app.recognitionTarget = null;
    app.fretTarget = null;
    app.guidedTarget = null;
    app.selectedFret = null;
    app.selectedFinger = null;
    app.riffAnswer = [];
    app.riffPattern = [];
    app.riffChoices = [];
    resetSongRun();
    elements.feedback.textContent = '';
    render();
  }

  function render() {
    const lesson = getLesson(app.activeLessonId);
    renderLessonMap({
      container: elements.lessonMap,
      lessons: LESSONS,
      progress: app.progress,
      activeLessonId: app.activeLessonId,
      isUnlocked: isLessonAvailable,
      onSelect: selectLesson,
    });

    elements.lessonTitle.textContent = `${lesson.number}. ${lesson.title}`;
    elements.lessonGoal.textContent = lesson.goal;
    elements.lessonExplanation.textContent =
      lesson.explanation || 'This lesson helps you practice one small bass skill.';
    elements.lessonExample.textContent = lesson.example ? `Example: ${lesson.example}` : '';
    elements.lessonExample.hidden = !lesson.example;
    elements.lessonPrompt.textContent =
      app.lessonPhase === 'learn'
        ? 'Read the explanation first. When it makes sense, start the test.'
        : lesson.prompt;
    renderLessonHelp(lesson);
    renderStats();

    if (app.lessonState.completed) {
      renderCompletedLesson(lesson);
      return;
    }

    if (app.lessonPhase === 'learn') {
      renderLearnLesson(lesson);
      return;
    }

    if (lesson.type === 'labeling') {
      renderLabelingLesson();
    } else if (lesson.type === 'recognition') {
      renderRecognitionLesson();
    } else if (lesson.type === 'fret-placement') {
      renderFretLesson();
    } else if (lesson.type === 'guided-choice') {
      renderGuidedChoiceLesson();
    }
  }

  function renderLearnLesson(lesson) {
    clearPulse();
    app.selectedLabel = null;
    app.placedLabels = {};
    app.recognitionTarget = null;
    app.fretTarget = null;
    app.guidedTarget = null;
    app.selectedFret = null;
    app.selectedFinger = null;
    app.riffAnswer = [];
    elements.labelChips.innerHTML = '';
    elements.pulse.hidden = true;
    elements.actionArea.innerHTML = `
      <div class="lesson-phase-card">
        <span>Part 1</span>
        <strong>Learn</strong>
        <p>${lesson.explanation}</p>
      </div>
      <div class="lesson-phase-card" data-muted="true">
        <span>Part 2</span>
        <strong>Test</strong>
        <p>${lesson.testIntro || lesson.prompt}</p>
      </div>
      <button class="primary-action" type="button" id="startLessonTest">Start test</button>
    `;

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      onStringClick: (stringId) => playOpenString(stringId),
      onFretClick: playFretNote,
    });

    document.querySelector('#startLessonTest').addEventListener('click', () => {
      app.lessonPhase = 'test';
      elements.feedback.textContent = '';
      render();
    });

    setFeedback(
      elements.feedback,
      'Part 1 is for learning. Press Start test when you are ready. Only Part 2 can complete the lesson.',
      'neutral'
    );
  }

  function renderLessonHelp(lesson) {
    updateLessonHelp(lesson);
    elements.lessonHelp.hidden = true;
    elements.helpButton.setAttribute('aria-expanded', 'false');
    elements.helpButton.onclick = () => {
      updateLessonHelp(getLesson(app.activeLessonId));
      const shouldShow = elements.lessonHelp.hidden;
      elements.lessonHelp.hidden = !shouldShow;
      elements.helpButton.setAttribute('aria-expanded', shouldShow ? 'true' : 'false');
    };
  }

  function updateLessonHelp(lesson) {
    const targetHelp = explainCurrentTarget();
    elements.lessonHelp.textContent = targetHelp
      ? `${lesson.explanation} ${targetHelp}`
      : lesson.explanation || 'This lesson helps you practice one small bass skill.';
  }

  function explainCurrentTarget() {
    const target = app.guidedTarget || app.fretTarget;
    if (!target) return '';

    if (target.stringId && Number.isInteger(target.fret)) {
      const noteName = notes.noteNameForFret(target.stringId, target.fret);
      if (target.fret === 0) {
        return `${noteName} on ${target.stringId} string means play the ${target.stringId} string with no finger pressing down.`;
      }
      return `${noteName} on ${target.stringId} string means put your finger just behind fret ${target.fret} on the ${target.stringId} string.`;
    }

    if (target.answer === 'Rest') {
      return 'Rest means stay quiet for that beat. Do not play a note.';
    }

    if (target.answer === 'Play') {
      return 'Play means make a sound on that beat.';
    }

    return '';
  }

  function renderCompletedLesson(lesson) {
    clearPulse();
    elements.labelChips.innerHTML = '';
    elements.pulse.hidden = true;

    const nextLesson = nextPlayableLessonAfter(lesson);
    elements.actionArea.innerHTML = nextLesson
      ? `
        <button class="primary-action" type="button" id="nextLesson">Start ${nextLesson.shortTitle}</button>
        <button class="secondary-action" type="button" id="redoLesson">Redo lesson</button>
      `
      : `
        <button class="secondary-action" type="button" disabled>Next lesson coming soon</button>
        <button class="primary-action" type="button" id="redoLesson">Redo lesson</button>
      `;

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      onStringClick: (stringId) => playOpenString(stringId),
      onFretClick: playFretNote,
    });

    if (nextLesson) {
      document
        .querySelector('#nextLesson')
        .addEventListener('click', () => selectLesson(nextLesson.id));
      setFeedback(
        elements.feedback,
        `Complete. ${nextLesson.title} is unlocked, so you can move on.`,
        'good'
      );
    } else {
      setFeedback(elements.feedback, 'Complete. More lessons can be built next.', 'good');
    }

    document.querySelector('#redoLesson').addEventListener('click', () => redoLesson(lesson));
  }

  function redoLesson(lesson) {
    clearPulse();
    app.lessonState = lessonEngine.createLessonState(lesson);
    app.lessonPhase = 'learn';
    app.selectedLabel = null;
    app.placedLabels = {};
    app.recognitionTarget = null;
    app.fretTarget = null;
    app.guidedTarget = null;
    app.selectedFret = null;
    app.selectedFinger = null;
    app.riffAnswer = [];
    app.riffPattern = [];
    app.riffChoices = [];
    resetSongRun();
    elements.feedback.textContent = '';
    render();
  }

  function renderStats() {
    const state = app.lessonState;
    const lesson = getLesson(app.activeLessonId);
    const displayedAccuracy = lesson.completion?.scoreTarget
      ? scoring.boundedScore(state.score)
      : scoring.percent(state.correct, state.attempts);

    elements.attempts.textContent = String(state.attempts);
    elements.streak.textContent = String(state.bestStreak);
    elements.accuracy.textContent = `${displayedAccuracy}%`;
    elements.completed.textContent = state.completed ? 'Yes' : 'No';
  }

  function renderLabelingLesson() {
    elements.actionArea.innerHTML = `
      <button class="primary-action" type="button" id="checkLabels">Check Labels</button>
      <button class="secondary-action" type="button" id="clearLabels">Clear</button>
    `;
    elements.pulse.hidden = true;

    renderLabelChips({
      container: elements.labelChips,
      strings: shuffled(notes.OPEN_STRINGS),
      selectedLabel: app.selectedLabel,
      onSelect: (stringId) => {
        app.selectedLabel = stringId;
        setFeedback(
          elements.feedback,
          `Selected ${stringId}. Tap the matching string on the bass.`,
          'neutral'
        );
        renderLabelingLesson();
      },
    });

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      labels: app.placedLabels,
      onStringClick: placeSelectedLabel,
      onFretClick: (stringId) => placeSelectedLabel(stringId),
    });

    document.querySelector('#checkLabels').addEventListener('click', checkLabels);
    document.querySelector('#clearLabels').addEventListener('click', () => {
      app.placedLabels = {};
      app.selectedLabel = null;
      setFeedback(elements.feedback, 'Labels cleared. Start again from E, A, D, and G.', 'neutral');
      renderLabelingLesson();
    });

    if (!elements.feedback.textContent) {
      setFeedback(
        elements.feedback,
        'Select a string label, then tap where it belongs on the bass.',
        'neutral'
      );
    }
  }

  function placeSelectedLabel(stringId) {
    if (!app.selectedLabel) {
      setFeedback(elements.feedback, 'Pick a label first, then tap a string.', 'neutral');
      return;
    }

    app.placedLabels[stringId] = app.selectedLabel;
    audio.playNote(notes.frequencyForFret(stringId, 0), 0.26);
    app.selectedLabel = null;
    renderLabelingLesson();
  }

  function checkLabels() {
    const lesson = getLesson(app.activeLessonId);
    const correctCount = notes.OPEN_STRINGS.filter(
      (string) => app.placedLabels[string.id] === string.id
    ).length;

    app.lessonState = lessonEngine.recordLabelRound(
      app.lessonState,
      lesson,
      correctCount,
      notes.OPEN_STRINGS.length
    );

    if (correctCount === notes.OPEN_STRINGS.length) {
      audio.click(true);
      setFeedback(
        elements.feedback,
        app.lessonState.completed
          ? 'Lesson complete. Open Strings is unlocked.'
          : 'Perfect. Do it once more to lock it in.',
        'good'
      );
      app.placedLabels = {};
    } else {
      audio.click(false);
      setFeedback(
        elements.feedback,
        `${correctCount} of 4 are correct. Listen low to high: E, A, D, G.`,
        'bad'
      );
    }

    persistLessonIfComplete();
    render();
  }

  function renderRecognitionLesson() {
    elements.labelChips.innerHTML = '';

    elements.actionArea.innerHTML = `
      <button class="primary-action" type="button" id="playTarget">Play String</button>
      <div class="choice-grid" id="choiceGrid"></div>
    `;
    elements.pulse.hidden = false;
    renderPulse({
      container: elements.pulse,
      beats: QUARTER_PULSE.beats,
      activeBeat: app.pulseBeat,
    });
    startPulse();

    if (!app.recognitionTarget) {
      app.recognitionTarget = randomStringId();
    }

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      onStringClick: (stringId) => playOpenString(stringId),
      onFretClick: playFretNote,
    });

    const choiceGrid = document.querySelector('#choiceGrid');
    shuffled(notes.OPEN_STRINGS).forEach((string) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.textContent = string.id;
      button.addEventListener('click', () => answerRecognition(string.id));
      choiceGrid.appendChild(button);
    });

    document.querySelector('#playTarget').addEventListener('click', () => {
      playOpenString(app.recognitionTarget);
      setFeedback(elements.feedback, 'Choose the string name that matches that sound.', 'neutral');
    });

    if (app.micListening) {
      elements.micStatus.textContent =
        'Guitar mode — play any open string and the app will identify it.';
    }

    if (!elements.feedback.textContent) {
      setFeedback(
        elements.feedback,
        app.micListening
          ? 'Play any open string on your bass — or press Play String and choose the letter.'
          : 'Press Play String, listen, then choose E, A, D, or G.',
        'neutral'
      );
    }
  }

  function answerRecognition(selectedId) {
    const lesson = getLesson(app.activeLessonId);
    const correct = notes.isCorrectString(app.recognitionTarget, selectedId);
    app.lessonState = lessonEngine.recordAnswer(app.lessonState, lesson, correct);

    if (correct) {
      audio.click(true);
      setFeedback(
        elements.feedback,
        app.lessonState.completed
          ? 'Complete. Frets is unlocked, so you can move on to lesson 3.'
          : 'Correct. The next sound is ready.',
        'good'
      );
      app.recognitionTarget = randomStringId(app.recognitionTarget);
    } else {
      audio.click(false);
      setFeedback(elements.feedback, `That was ${app.recognitionTarget}. Try the next one.`, 'bad');
      app.recognitionTarget = randomStringId(app.recognitionTarget);
    }

    persistLessonIfComplete();
    render();
    if (!app.lessonState.completed) {
      playOpenString(app.recognitionTarget);
    }
  }

  function renderFretLesson() {
    clearPulse();
    elements.labelChips.innerHTML = '';
    elements.pulse.hidden = true;

    if (!app.fretTarget) {
      app.fretTarget = randomFretTarget();
    }
    updateLessonHelp(getLesson(app.activeLessonId));

    elements.actionArea.innerHTML = `
      <div class="target-card">
        <span>Target</span>
        <strong>${app.fretTarget.stringId} string, fret ${app.fretTarget.fret}, finger ${app.fretTarget.finger}</strong>
      </div>
      <div class="control-label">Fret</div>
      <div class="choice-grid" id="fretChoices"></div>
      <div class="control-label">Finger</div>
      <div class="choice-grid" id="fingerChoices"></div>
      <button class="primary-action" type="button" id="checkFret">Check</button>
      <button class="secondary-action" type="button" id="newFretTarget">New Target</button>
    `;

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      targetId: app.fretTarget.stringId,
      targetFret: app.fretTarget.fret,
      selectedFret: app.selectedFret,
      onStringClick: (stringId) => playOpenString(stringId),
      onFretClick: selectFretFromBoard,
    });

    renderNumberChoices(
      document.querySelector('#fretChoices'),
      shuffled([0, 1, 2, 3, 4]),
      app.selectedFret,
      (value) => {
        app.selectedFret = value;
        renderFretLesson();
      }
    );
    renderNumberChoices(
      document.querySelector('#fingerChoices'),
      shuffled([1, 2, 3, 4]),
      app.selectedFinger,
      (value) => {
        app.selectedFinger = value;
        renderFretLesson();
      }
    );

    document.querySelector('#checkFret').addEventListener('click', checkFretTarget);
    document.querySelector('#newFretTarget').addEventListener('click', () => {
      app.fretTarget = randomFretTarget(app.fretTarget);
      app.selectedFret = null;
      app.selectedFinger = null;
      setFeedback(elements.feedback, 'New fret target ready.', 'neutral');
      renderFretLesson();
    });

    if (!elements.feedback.textContent) {
      setFeedback(elements.feedback, 'Pick the fret and finger shown in the target.', 'neutral');
    }
  }

  function renderNumberChoices(container, values, selectedValue, onSelect) {
    values.forEach((value) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.dataset.selected = selectedValue === value ? 'true' : 'false';
      button.textContent = String(value);
      button.addEventListener('click', () => onSelect(value));
      container.appendChild(button);
    });
  }

  function checkFretTarget() {
    if (app.selectedFret === null || app.selectedFinger === null) {
      setFeedback(elements.feedback, 'Choose both a fret and a finger before checking.', 'neutral');
      return;
    }

    const lesson = getLesson(app.activeLessonId);
    const correct =
      app.selectedFret === app.fretTarget.fret && app.selectedFinger === app.fretTarget.finger;
    app.lessonState = lessonEngine.recordFretPlacement(app.lessonState, lesson, correct);

    if (correct) {
      audio.success();
      setFeedback(
        elements.feedback,
        app.lessonState.completed
          ? 'Complete. You placed 10 fret targets with no more than 2 misses.'
          : 'Correct. Try the next fret target.',
        'good'
      );
      app.fretTarget = randomFretTarget(app.fretTarget);
    } else {
      audio.click(false);
      setFeedback(
        elements.feedback,
        `Not yet. Misses: ${app.lessonState.misses}/2. Match both the fret and finger.`,
        'bad'
      );
    }

    app.selectedFret = null;
    app.selectedFinger = null;
    persistLessonIfComplete();
    render();
  }

  function renderGuidedChoiceLesson() {
    clearPulse();
    elements.labelChips.innerHTML = '';
    elements.pulse.hidden = app.activeLessonId !== 'first-groove-rhythm';

    if (app.activeLessonId === 'first-groove-rhythm') {
      renderPulse({
        container: elements.pulse,
        beats: QUARTER_PULSE.beats,
        activeBeat: app.pulseBeat,
      });
      startPulse();
    }

    const lesson = getLesson(app.activeLessonId);
    if (isRiffSequenceLesson(lesson)) {
      renderRiffBuilderLesson(lesson);
      return;
    }
    if (isBasslineSequenceLesson(lesson)) {
      renderBasslineBuilderLesson(lesson);
      return;
    }
    if (isSongPerformanceLesson(lesson)) {
      renderSongPerformanceLesson(lesson);
      return;
    }

    if (!app.guidedTarget) {
      app.guidedTarget = randomGuidedTarget(lesson);
    }
    updateLessonHelp(lesson);

    const guitarHint =
      app.micListening && app.guidedTarget.stringId
        ? `<p class="mic-guitar-hint">Play this note on your guitar</p>`
        : '';
    const buttonLabel =
      app.micListening && app.guidedTarget.stringId
        ? `<p class="choice-grid-label">or press a button:</p>`
        : '';
    elements.actionArea.innerHTML = `
      <div class="target-card">
        <span>Target</span>
        <strong>${app.guidedTarget.label}</strong>
        ${guitarHint}
      </div>
      ${buttonLabel}
      <div class="choice-grid" id="guidedChoices"></div>
    `;

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      targetId: app.guidedTarget.stringId || null,
      targetFret: Number.isInteger(app.guidedTarget.fret) ? app.guidedTarget.fret : null,
      onStringClick: (stringId) => playOpenString(stringId),
      onFretClick: playFretNote,
    });

    const choiceGrid = document.querySelector('#guidedChoices');
    guidedChoiceOrder(lesson, app.guidedTarget).forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.textContent = choice;
      button.addEventListener('click', () => answerGuidedChoice(choice));
      choiceGrid.appendChild(button);
    });

    if (app.guidedTarget.stringId) {
      if (app.micListening) {
        const targetNote = notes.noteNameForFret(app.guidedTarget.stringId, app.guidedTarget.fret);
        elements.micStatus.textContent = `Guitar mode — play ${targetNote} on your bass.`;
      } else {
        audio.playNote(
          notes.frequencyForFret(app.guidedTarget.stringId, app.guidedTarget.fret),
          0.24
        );
      }
    }

    if (!elements.feedback.textContent) {
      setFeedback(elements.feedback, 'Choose the answer that matches the target.', 'neutral');
    }
  }

  function answerGuidedChoice(selectedAnswer) {
    const lesson = getLesson(app.activeLessonId);
    const timingMessage = rhythmAnswers.pulseTimingMessage(app.guidedTarget, app.pulseBeat);
    const correct = rhythmAnswers.isPulseAnswerCorrect(
      app.guidedTarget,
      selectedAnswer,
      app.pulseBeat
    );
    app.lessonState = lessonEngine.recordPracticeAnswer(app.lessonState, lesson, correct);

    if (correct) {
      audio.success();
      setFeedback(
        elements.feedback,
        app.lessonState.completed
          ? 'Complete. You can move on.'
          : `${timingMessage || 'Correct.'} Next target.`,
        'good'
      );
      app.guidedTarget = randomGuidedTarget(lesson, app.guidedTarget);
    } else {
      audio.click(false);
      setFeedback(
        elements.feedback,
        `${timingMessage || `The answer was ${app.guidedTarget.answer}.`} Misses: ${app.lessonState.misses}/${lesson.completion.maxMisses}.`,
        'bad'
      );
      app.guidedTarget = randomGuidedTarget(lesson, app.guidedTarget);
    }

    persistLessonIfComplete();
    render();
  }

  function guidedChoiceOrder(lesson, target) {
    if (lesson.id === 'first-groove-rhythm') {
      return target.choices;
    }

    return shuffled(target.choices);
  }

  function renderRiffBuilderLesson(lesson) {
    app.guidedTarget = null;
    updateLessonHelp(lesson);

    const riffNotes = currentRiffPattern(lesson);
    elements.actionArea.innerHTML = `
      <div class="target-card">
        <span>Build the riff</span>
        <strong>${riffNotes.join(' - ')}</strong>
      </div>
      <div class="riff-slots" aria-label="Your riff answer">
        ${riffNotes
          .map(
            (_note, index) =>
              `<span data-filled="${app.riffAnswer[index] ? 'true' : 'false'}">${app.riffAnswer[index] || index + 1}</span>`
          )
          .join('')}
      </div>
      <div class="choice-grid" id="riffChoices"></div>
      <button class="primary-action" type="button" id="checkRiff">Check riff</button>
      <button class="secondary-action" type="button" id="clearRiff">Clear</button>
    `;

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      onStringClick: (stringId) => playOpenString(stringId),
      onFretClick: playFretNote,
    });

    const choices = currentRiffChoices(riffNotes);
    const choiceGrid = document.querySelector('#riffChoices');
    choices.forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.textContent = choice;
      button.addEventListener('click', () => addRiffAnswer(choice));
      choiceGrid.appendChild(button);
    });

    document.querySelector('#checkRiff').addEventListener('click', () => checkRiffAnswer(lesson));
    document.querySelector('#clearRiff').addEventListener('click', () => {
      app.riffAnswer = [];
      setFeedback(
        elements.feedback,
        'Riff cleared. Build the mixed pattern from the start.',
        'neutral'
      );
      renderRiffBuilderLesson(lesson);
    });

    if (!elements.feedback.textContent) {
      setFeedback(elements.feedback, 'Choose four notes to fill the riff slots.', 'neutral');
    }
  }

  function addRiffAnswer(choice) {
    const lesson = getLesson(app.activeLessonId);
    if (app.riffAnswer.length >= lesson.targets.length) {
      setFeedback(
        elements.feedback,
        'All four slots are full. Press Check riff or Clear.',
        'neutral'
      );
      return;
    }

    app.riffAnswer = [...app.riffAnswer, choice];
    renderRiffBuilderLesson(lesson);
  }

  function checkRiffAnswer(lesson) {
    const riffNotes = currentRiffPattern(lesson);
    if (app.riffAnswer.length < riffNotes.length) {
      setFeedback(elements.feedback, 'Fill all four riff slots before checking.', 'neutral');
      return;
    }

    const correct = riffNotes.every((note, index) => app.riffAnswer[index] === note);
    app.lessonState = lessonEngine.recordPracticeAnswer(app.lessonState, lesson, correct);

    if (correct) {
      audio.success();
      setFeedback(
        elements.feedback,
        app.lessonState.completed
          ? 'Complete. You built the riff.'
          : 'Correct riff. Build it again to lock it in.',
        'good'
      );
    } else {
      audio.click(false);
      setFeedback(
        elements.feedback,
        `Not yet. The riff is ${riffNotes.join(', ')}. Misses: ${app.lessonState.misses}/${lesson.completion.maxMisses}.`,
        'bad'
      );
    }

    app.riffAnswer = [];
    app.riffPattern = mixedRiffPattern(lesson, app.riffPattern);
    app.riffChoices = mixedRiffChoices(app.riffPattern);
    persistLessonIfComplete();
    render();
  }

  function currentRiffPattern(lesson) {
    if (app.riffPattern.length !== lesson.targets.length) {
      app.riffPattern = mixedRiffPattern(lesson);
    }

    return app.riffPattern;
  }

  function mixedRiffPattern(lesson, previousPattern = []) {
    const basePattern = lesson.targets.map((target) => target.answer);
    let nextPattern = shuffled(basePattern);

    if (
      previousPattern.length === nextPattern.length &&
      nextPattern.every((note, index) => note === previousPattern[index])
    ) {
      nextPattern = nextPattern.slice(1).concat(nextPattern[0]);
    }

    return nextPattern;
  }

  function currentRiffChoices(riffNotes) {
    if (app.riffChoices.length !== riffNotes.length) {
      app.riffChoices = mixedRiffChoices(riffNotes);
    }

    return app.riffChoices;
  }

  function mixedRiffChoices(riffNotes) {
    return shuffled([...new Set(riffNotes)]);
  }

  function renderBasslineBuilderLesson(lesson) {
    app.guidedTarget = null;
    updateLessonHelp(lesson);

    const basslineNotes = lesson.targets.map((target) => target.answer);
    const basslineChoices = shuffled([...new Set(basslineNotes)]);
    elements.actionArea.innerHTML = `
      <div class="target-card">
        <span>Build the bassline</span>
        <strong>${basslineNotes.join(' - ')}</strong>
      </div>
      <div class="bassline-beats" aria-label="Bassline beat order">
        ${lesson.targets
          .map(
            (target, index) => `
              <div class="bassline-beat">
                <span>${target.label}</span>
                <strong data-filled="${app.riffAnswer[index] ? 'true' : 'false'}">${app.riffAnswer[index] || index + 1}</strong>
              </div>
            `
          )
          .join('')}
      </div>
      <div class="choice-grid" id="basslineChoices"></div>
      <button class="primary-action" type="button" id="checkBassline">Check bassline</button>
      <button class="secondary-action" type="button" id="clearBassline">Clear</button>
    `;

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      onStringClick: (stringId) => playOpenString(stringId),
      onFretClick: playFretNote,
    });

    const choiceGrid = document.querySelector('#basslineChoices');
    basslineChoices.forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.textContent = choice;
      button.addEventListener('click', () => addBasslineAnswer(choice));
      choiceGrid.appendChild(button);
    });

    document
      .querySelector('#checkBassline')
      .addEventListener('click', () => checkBasslineAnswer(lesson));
    document.querySelector('#clearBassline').addEventListener('click', () => {
      app.riffAnswer = [];
      setFeedback(
        elements.feedback,
        'Bassline cleared. Rebuild the full phrase from beat 1.',
        'neutral'
      );
      renderBasslineBuilderLesson(lesson);
    });

    if (!elements.feedback.textContent) {
      setFeedback(
        elements.feedback,
        'Fill each beat slot to build the complete bassline.',
        'neutral'
      );
    }
  }

  function addBasslineAnswer(choice) {
    const lesson = getLesson(app.activeLessonId);
    if (app.riffAnswer.length >= lesson.targets.length) {
      setFeedback(
        elements.feedback,
        'All bassline slots are full. Press Check bassline or Clear.',
        'neutral'
      );
      return;
    }

    app.riffAnswer = [...app.riffAnswer, choice];
    renderBasslineBuilderLesson(lesson);
  }

  function checkBasslineAnswer(lesson) {
    const basslineNotes = lesson.targets.map((target) => target.answer);
    if (app.riffAnswer.length < basslineNotes.length) {
      setFeedback(elements.feedback, 'Fill every bassline beat before checking.', 'neutral');
      return;
    }

    const correct = basslineNotes.every((note, index) => app.riffAnswer[index] === note);
    app.lessonState = lessonEngine.recordPracticeAnswer(app.lessonState, lesson, correct);

    if (correct) {
      audio.success();
      setFeedback(
        elements.feedback,
        app.lessonState.completed
          ? 'Complete. You built the full bassline.'
          : 'Correct bassline. Build it again to lock in the pattern.',
        'good'
      );
    } else {
      audio.click(false);
      setFeedback(
        elements.feedback,
        `Not yet. The bassline is ${basslineNotes.join(', ')}. Misses: ${app.lessonState.misses}/${lesson.completion.maxMisses}.`,
        'bad'
      );
    }

    app.riffAnswer = [];
    persistLessonIfComplete();
    render();
  }

  function renderSongPerformanceLesson(lesson) {
    clearPulse();
    app.guidedTarget = lesson.targets[app.songStep] || null;
    updateLessonHelp(lesson);

    const activeTarget = app.guidedTarget;
    const songComplete = app.songPhase === 'done';
    const activeBarIndex = songComplete
      ? Math.max(0, Math.ceil(lesson.targets.length / 4) - 1)
      : Math.floor(app.songStep / 4);
    const songTitle = lesson.song?.title || lesson.title;
    const songFeel = lesson.song?.feel || 'Beginner groove';
    const phaseCopy =
      app.songPhase === 'ready'
        ? 'Press Start song. The ball gives a four-beat count-in before the bass begins.'
        : app.songPhase === 'count-in'
          ? `Count in: ${Math.max(1, app.songCountIn)}`
          : songComplete
            ? 'Song complete. You played the full phrase.'
            : `Play ${activeTarget.answer} on ${activeTarget.stringId} string, fret ${activeTarget.fret}.`;

    elements.actionArea.innerHTML = `
      <div class="song-chart" aria-label="Song chart">
        <div class="song-title-block">
          <span>${songFeel}</span>
          <strong>${songTitle}</strong>
        </div>
        <div class="song-bars">
          ${(lesson.song?.sections || [])
            .map(
              (section, index) => `
                <span data-active="${index === activeBarIndex && !songComplete ? 'true' : 'false'}" data-complete="${index < activeBarIndex || songComplete ? 'true' : 'false'}">
                  <small>${section.label}</small>
                  ${section.beats}
                </span>
              `
            )
            .join('')}
        </div>
      </div>
      <div class="song-stage">
        <div class="song-ball-track" aria-label="Rhythm ball">
          <span class="song-ball" data-tick="${app.songBounceTick % 4}"></span>
        </div>
        <div class="song-meter">
          <span>${songComplete ? 'Finished' : app.songPhase === 'count-in' ? 'Count-in' : `Song note ${Math.min(app.songStep + 1, lesson.targets.length)} of ${lesson.targets.length}`}</span>
          <strong>${songComplete ? 'Backed by steady time' : phaseCopy}</strong>
        </div>
        ${
          songComplete
            ? '<div class="song-celebration" aria-label="Celebration">🎉🔥🎊🔥🥳🔥🎉🎊🔥🥳🎉🔥</div>'
            : ''
        }
      </div>
      <div class="song-notes" aria-label="Song phrase">
        ${lesson.targets
          .map(
            (target, index) => `
              <span data-active="${index === app.songStep && !songComplete ? 'true' : 'false'}" data-complete="${index < app.songStep || songComplete ? 'true' : 'false'}">
                ${target.answer}<small>${target.stringId}${target.fret}</small>
                <small>${target.label.replace(' beat ', '.')}</small>
              </span>
            `
          )
          .join('')}
      </div>
      ${
        app.songPhase === 'ready'
          ? '<button class="primary-action" type="button" id="startSong">Start song</button>'
          : songComplete
            ? '<button class="secondary-action" type="button" id="replaySong">Play again</button>'
            : '<button class="secondary-action" type="button" id="stopSong">Restart song</button>'
      }
    `;

    renderFretboard({
      container: elements.fretboard,
      strings: notes.OPEN_STRINGS,
      showHeadLabels: true,
      targetId: activeTarget?.stringId || null,
      targetFret: Number.isInteger(activeTarget?.fret) ? activeTarget.fret : null,
      onStringClick: (stringId) => answerSongFret(stringId, 0),
      onFretClick: answerSongFret,
    });

    document.querySelector('#startSong')?.addEventListener('click', startSongPlayback);
    document.querySelector('#stopSong')?.addEventListener('click', () => {
      resetSongRun();
      setFeedback(elements.feedback, 'Song reset. Start again when ready.', 'neutral');
      renderSongPerformanceLesson(lesson);
    });
    document.querySelector('#replaySong')?.addEventListener('click', () => {
      resetSongRun();
      setFeedback(elements.feedback, 'Song ready. Start the count-in again.', 'neutral');
      renderSongPerformanceLesson(lesson);
    });

    if (!elements.feedback.textContent) {
      setFeedback(elements.feedback, phaseCopy, 'neutral');
    }
  }

  function startSongPlayback() {
    const lesson = getLesson(app.activeLessonId);
    if (!isSongPerformanceLesson(lesson)) return;

    resetSongRun();
    app.songPhase = 'count-in';
    app.songCountIn = 4;
    app.songBeatAt = performance.now();
    bounceSongBall();
    audio.beat(true);
    setFeedback(elements.feedback, 'Count in: 4', 'neutral');
    renderSongPerformanceLesson(lesson);

    app.songTimer = window.setInterval(() => advanceSongBeat(lesson), 60000 / QUARTER_PULSE.bpm);
  }

  function advanceSongBeat(lesson) {
    bounceSongBall();
    app.songBeatAt = performance.now();

    if (app.songPhase === 'count-in') {
      audio.beat(true);
      app.songCountIn -= 1;
      if (app.songCountIn <= 0) {
        app.songPhase = 'playing';
        setFeedback(
          elements.feedback,
          'Bass is in. Press the target fret on the bounce.',
          'neutral'
        );
      } else {
        setFeedback(elements.feedback, `Count in: ${app.songCountIn}`, 'neutral');
      }
    }

    if (app.songPhase === 'playing') {
      audio.songBacking({
        accent: app.songStep % 4 === 0,
        harmony: songHarmonyForTarget(lesson.targets[app.songStep]),
      });
    }

    renderSongPerformanceLesson(lesson);
  }

  function answerSongFret(stringId, fret) {
    const lesson = getLesson(app.activeLessonId);
    if (!isSongPerformanceLesson(lesson) || app.songPhase !== 'playing') {
      return;
    }

    const target = lesson.targets[app.songStep];
    const elapsed = performance.now() - app.songBeatAt;
    const inTime = elapsed <= 560;
    const positionCorrect = target.stringId === stringId && target.fret === fret;
    const correct = inTime && positionCorrect;
    playFretNote(stringId, fret);
    app.lessonState = lessonEngine.recordPracticeAnswer(app.lessonState, lesson, correct);

    if (correct) {
      app.songStep += 1;
      if (app.songStep >= lesson.targets.length) {
        app.songPhase = 'done';
        clearSongPlayback(false);
        setFeedback(
          elements.feedback,
          'Song complete. You hit every target in the phrase.',
          'good'
        );
      } else {
        const next = lesson.targets[app.songStep];
        setFeedback(
          elements.feedback,
          `Good. Next: ${next.answer} on ${next.stringId} string, fret ${next.fret}.`,
          'good'
        );
      }
    } else {
      audio.click(false);
      const timing = inTime ? 'Wrong fret or string.' : 'Too late for that bounce.';
      setFeedback(
        elements.feedback,
        `${timing} Target is ${target.answer} on ${target.stringId} string, fret ${target.fret}. Misses: ${app.lessonState.misses}/${lesson.completion.maxMisses}.`,
        'bad'
      );
    }

    persistLessonIfComplete();
    render();
  }

  function bounceSongBall() {
    app.songBounceTick += 1;
  }

  function songHarmonyForTarget(target) {
    if (!target) return null;
    const frequency = notes.frequencyForFret(target.stringId, target.fret);
    return frequency ? { frequency, duration: 0.32 } : null;
  }

  function resetSongRun() {
    clearSongPlayback();
    app.songPhase = 'ready';
    app.songCountIn = 4;
    app.songStep = 0;
    app.songBeatAt = 0;
    app.songBounceTick = 0;
  }

  function clearSongPlayback(resetPhase = true) {
    if (app.songTimer) {
      window.clearInterval(app.songTimer);
      app.songTimer = null;
    }

    if (resetPhase) {
      app.songBeatAt = 0;
    }
  }

  async function toggleMicrophone() {
    if (app.micListening) {
      stopMicrophone();
      return;
    }

    try {
      const sensitive = elements.sensitiveMic.checked;
      elements.micThresholdMarker.style.left = sensitive ? '3%' : '8%';
      app.mic = new MicrophonePitch({
        onPitch: handleMicPitch,
        onLevel: renderMicLevel,
        inputGain: sensitive ? 4 : 1,
        minRms: sensitive ? 0.002 : 0.006,
      });
      await app.mic.start();
      app.micListening = true;
      elements.micButton.dataset.listening = 'true';
      elements.micButton.setAttribute('aria-pressed', 'true');
      elements.micLabel.textContent = 'Mic on';
      elements.micStatus.textContent = sensitive
        ? 'Listening in sensitive mode. Play one bass note close to the device.'
        : 'Listening. Play one bass note close to the device.';
    } catch (error) {
      app.micListening = false;
      elements.micStatus.textContent = error.message;
    }
  }

  function stopMicrophone() {
    app.mic?.stop();
    app.mic = null;
    app.micListening = false;
    elements.micButton.dataset.listening = 'false';
    elements.micButton.setAttribute('aria-pressed', 'false');
    elements.micLabel.textContent = 'Mic off';
    elements.micStatus.textContent = 'Use the mic to hear a real bass note.';
    renderMicLevel(0);
  }

  async function restartMicIfListening() {
    if (!app.micListening) return;
    stopMicrophone();
    await toggleMicrophone();
  }

  function renderMicLevel(rms) {
    const percent = Math.max(0, Math.min(100, Math.round((rms / 0.08) * 100)));
    elements.micLevelText.textContent = `${percent}%`;
    elements.micLevelBar.style.width = `${percent}%`;
    elements.micLevelBar.dataset.hot = percent > 12 ? 'true' : 'false';
  }

  function handleMicPitch(frequency) {
    const heard = notes.noteFromFrequency(frequency);
    if (!heard) return;

    const cents = notes.centsOff(frequency, heard.midi);
    const target = app.guidedTarget || app.fretTarget;
    const targetNote =
      target?.stringId && Number.isInteger(target.fret)
        ? notes.noteNameForFret(target.stringId, target.fret)
        : app.recognitionTarget;
    const matchesTarget = Boolean(targetNote && heard.name === targetNote && Math.abs(cents) <= 45);
    const matchText = targetNote
      ? matchesTarget
        ? 'That matches the target.'
        : `Target is ${targetNote}.`
      : 'No note target is active right now.';

    if (navigator.vibrate) {
      navigator.vibrate(45);
    }

    elements.micStatus.textContent = `Heard ${heard.label} (${Math.round(
      frequency
    )} Hz, ${formatCents(cents)}). ${matchText}`;

    if (matchesTarget && performance.now() - app.lastMicAnswerAt > 900) {
      app.lastMicAnswerAt = performance.now();
      answerWithCurrentMicTarget();
    }
  }

  function answerWithCurrentMicTarget() {
    const lesson = getLesson(app.activeLessonId);
    if (lesson.type === 'recognition' && app.recognitionTarget) {
      answerRecognition(app.recognitionTarget);
      return;
    }

    if (isSongPerformanceLesson(lesson) && app.guidedTarget) {
      answerSongFret(app.guidedTarget.stringId, app.guidedTarget.fret);
      return;
    }

    if (lesson.type === 'guided-choice' && app.guidedTarget?.answer) {
      answerGuidedChoice(app.guidedTarget.answer);
      return;
    }

    if (lesson.type === 'fret-placement' && app.fretTarget) {
      app.selectedFret = app.fretTarget.fret;
      app.selectedFinger = app.fretTarget.finger;
      checkFretTarget();
    }
  }

  function formatCents(cents) {
    if (cents === 0) return 'in tune';
    return cents > 0 ? `${cents} cents sharp` : `${Math.abs(cents)} cents flat`;
  }

  function playOpenString(stringId) {
    audio.playNote(notes.frequencyForFret(stringId, 0));
  }

  function playFretNote(stringId, fret) {
    audio.playNote(notes.frequencyForFret(stringId, fret));
  }

  function selectFretFromBoard(stringId, fret) {
    app.selectedFret = fret;
    playFretNote(stringId, fret);
    setFeedback(
      elements.feedback,
      `Selected fret ${fret}. Now choose the finger number.`,
      'neutral'
    );
    renderFretLesson();
  }

  function randomStringId(previousId = null) {
    const ids = notes.getOpenStringIds().filter((id) => id !== previousId);
    return ids[Math.floor(Math.random() * ids.length)];
  }

  function randomFretTarget(previousTarget = null) {
    const targets = notes.OPEN_STRINGS.flatMap((string) =>
      [0, 1, 2, 3, 4].map((fret) => ({
        stringId: string.id,
        fret,
        finger: fret === 0 ? randomFrom([1, 2]) : Math.min(fret, 4),
      }))
    ).filter(
      (target) =>
        !previousTarget ||
        target.stringId !== previousTarget.stringId ||
        target.fret !== previousTarget.fret ||
        target.finger !== previousTarget.finger
    );

    return targets[Math.floor(Math.random() * targets.length)];
  }

  function randomGuidedTarget(lesson, previousTarget = null) {
    const targets = lesson.targets.filter(
      (target) =>
        !previousTarget ||
        target.label !== previousTarget.label ||
        target.answer !== previousTarget.answer
    );
    return randomFrom(targets.length ? targets : lesson.targets);
  }

  function isRiffSequenceLesson(lesson) {
    return lesson.practiceMode === 'riff-sequence';
  }

  function isBasslineSequenceLesson(lesson) {
    return lesson.practiceMode === 'bassline-sequence';
  }

  function isSongPerformanceLesson(lesson) {
    return lesson.practiceMode === 'song-performance';
  }

  function shuffled(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function nextPlayableLessonAfter(currentLesson) {
    const currentIndex = LESSONS.findIndex((lesson) => lesson.id === currentLesson.id);
    return (
      LESSONS.slice(currentIndex + 1).find(
        (lesson) => lesson.type !== 'locked' && isLessonAvailable(lesson)
      ) || null
    );
  }

  function isLessonAvailable(lesson) {
    if (ONLY_LAYOUT_LESSON) {
      return lesson.id === 'meet-the-bass';
    }

    return app.demoMode || lessonEngine.isLessonUnlocked(lesson, app.progress);
  }

  function persistLessonIfComplete() {
    const state = app.lessonState;
    const existing = app.sessionBaseline || {};
    const newlyCompleted = state.completed && !existing.completed;
    const completedAt = newlyCompleted ? new Date().toISOString() : existing.completedAt;

    storage.updateLessonStats(app.progress, state.lessonId, {
      attempts: (existing.attempts || 0) + state.attempts,
      bestStreak: Math.max(existing.bestStreak || 0, state.bestStreak),
      completed: Boolean(existing.completed || state.completed),
      completedAt: completedAt || null,
    });
    storage.saveProgress(app.progress);

    if (newlyCompleted) {
      burstConfetti();
    }
  }

  function burstConfetti() {
    const colors = ['#2f7f84', '#d89b32', '#b14a3a', '#f7f1e4', '#74c889'];
    elements.confettiLayer.innerHTML = '';

    for (let index = 0; index < 34; index += 1) {
      const piece = document.createElement('span');
      piece.style.left = `${8 + Math.random() * 84}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.animationDelay = `${Math.random() * 140}ms`;
      piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
      piece.style.setProperty('--spin', `${Math.random() * 540 + 240}deg`);
      elements.confettiLayer.appendChild(piece);
    }

    window.setTimeout(() => {
      elements.confettiLayer.innerHTML = '';
    }, 1700);
  }

  function startPulse() {
    if (app.pulseTimer) return;
    app.pulseTimer = window.setInterval(() => {
      app.pulseBeat = (app.pulseBeat + 1) % QUARTER_PULSE.beats.length;
      renderPulse({
        container: elements.pulse,
        beats: QUARTER_PULSE.beats,
        activeBeat: app.pulseBeat,
      });
    }, 60000 / QUARTER_PULSE.bpm);
  }

  function clearPulse() {
    if (app.pulseTimer) {
      window.clearInterval(app.pulseTimer);
      app.pulseTimer = null;
    }
    app.pulseBeat = 0;
  }

  init();
})(window);
