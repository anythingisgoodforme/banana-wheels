const { searchGlossary } = require('../../public/bassline-rookie/src/data/glossary');

describe('Bassline Rookie glossary search', () => {
  test('answers natural questions about riffs', () => {
    const result = searchGlossary('what are riffs');

    expect(result).toMatchObject({ term: 'Riffs' });
    expect(result.explanation).toContain('short group of notes');
  });

  test('answers lesson terms with beginner explanations', () => {
    expect(searchGlossary('what is pulse')).toMatchObject({ term: 'Pulse' });
    expect(searchGlossary('open strings')).toMatchObject({ term: 'Open strings' });
    expect(searchGlossary('how do frets work')).toMatchObject({ term: 'Frets' });
    expect(searchGlossary('why is my bass buzzing')).toMatchObject({ term: 'Buzzing notes' });
    expect(searchGlossary('what is groove')).toMatchObject({ term: 'Groove' });
    expect(searchGlossary('how does the mic hear my bass')).toMatchObject({ term: 'Mic input' });
  });

  test('answers broader bass guitar topics', () => {
    expect(searchGlossary('how do i tune my bass')).toMatchObject({ term: 'Tuning' });
    expect(searchGlossary('what is a pick')).toMatchObject({ term: 'Pick' });
    expect(searchGlossary('what are pickups')).toMatchObject({ term: 'Pickups' });
    expect(searchGlossary('what is action')).toMatchObject({ term: 'Action' });
    expect(searchGlossary('what is intonation')).toMatchObject({ term: 'Intonation' });
    expect(searchGlossary('how do i slap')).toMatchObject({ term: 'Slap bass' });
    expect(searchGlossary('what is a hammer on')).toMatchObject({ term: 'Hammer-ons' });
    expect(searchGlossary('what are octaves')).toMatchObject({ term: 'Octaves' });
    expect(searchGlossary('what is bass tab')).toMatchObject({ term: 'Bass tab' });
    expect(searchGlossary('how do i mute strings')).toMatchObject({ term: 'Muting' });
    expect(searchGlossary('what is bpm')).toMatchObject({ term: 'Metronome' });
    expect(searchGlossary('my finger hurts')).toMatchObject({ term: 'Calluses' });
  });

  test('gives a bass-specific fallback for broad bass questions', () => {
    expect(searchGlossary('tell me about bass guitar')).toMatchObject({
      term: 'Bass guitar help',
    });
  });

  test('returns no result for unknown questions', () => {
    expect(searchGlossary('how do i tune a piano')).toBeNull();
  });
});
