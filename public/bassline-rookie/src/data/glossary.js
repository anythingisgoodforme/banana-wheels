(function initGlossary(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.BasslineGlossary = api;
})(typeof window !== 'undefined' ? window : globalThis, function glossaryFactory() {
  const TOPICS = [
    {
      term: 'Riffs',
      keywords: ['riff', 'riffs', 'pattern', 'repeat', 'repeating', 'main part'],
      explanation:
        'A riff is a short group of notes that repeats. On bass, a riff often gives the song its groove and makes the music feel strong. A riff is not usually a whole song by itself. It is a small pattern you can remember and play again. For example, E, G, A, B played again and again can be a simple bass riff. When you practice a riff, go slowly first, keep the notes even, then repeat it until your fingers know where to go.',
    },
    {
      term: 'Pulse',
      keywords: ['pulse', 'beat', 'beats', 'time', 'timing', 'quarter', 'quarter notes', 'count'],
      explanation:
        'Pulse is the steady beat you count while music plays. If you count 1, 2, 3, 4 at the same speed, that is the pulse. Bass players need a strong pulse because the bass helps the whole band feel where the beat is. A quarter note means one sound on one beat. If the target says beat 4, wait until the fourth beat is highlighted before you press Play.',
    },
    {
      term: 'Rests',
      keywords: ['rest', 'rests', 'silence', 'quiet', 'space', 'stop'],
      explanation:
        'A rest means you stay quiet for that beat. Rests are important because silence gives the groove shape. Playing every beat can sound too busy, but adding rests can make the bassline feel cleaner. If beat 2 is a rest, you do not play on beat 2. Keep counting during the rest so you know when to come back in.',
    },
    {
      term: 'Bassline',
      keywords: ['bassline', 'bass line', 'song part', 'line', 'bass part'],
      explanation:
        'A bassline is the bass part of a song. It mixes notes, timing, and rests into a pattern that supports the music. The bassline often connects the rhythm with the chords, so it should feel steady and clear. A simple bassline could be E, G, A, rest. When learning a bassline, first learn the notes, then learn when each note happens.',
    },
    {
      term: 'Open strings',
      keywords: ['open', 'open string', 'open strings', 'bass strings', 'e a d g', 'no finger'],
      explanation:
        'An open string is played with no finger pressing a fret. A normal four-string bass has open strings E, A, D, and G from lowest sound to highest sound. Open E is the thickest, lowest string. Open G is the thinnest, highest string. Open strings are useful because they let you make a note without moving your left hand.',
    },
    {
      term: 'Frets',
      keywords: ['fret', 'frets', 'finger', 'fingers', 'neck', 'press', 'metal lines'],
      explanation:
        'Frets are the metal lines on the bass neck. Put your finger just behind a fret to change the note. Do not press on top of the metal line. Press just behind it so the note sounds clean and does not buzz. Finger 1 is pointer, 2 is middle, 3 is ring, and 4 is pinky. Fret 3 with finger 3 means ring finger behind the third fret.',
    },
    {
      term: 'Notes',
      keywords: ['note', 'notes', 'music notes', 'bass notes', 'named sounds'],
      explanation:
        'Notes are the named sounds in music. In these lessons you use notes like E, F, G, A, B, C, and D. Different strings and frets make different notes. For example, open E is E, fret 1 on the E string is F, and fret 3 on the E string is G. Learning notes helps you know what you are playing instead of only copying finger shapes.',
    },
    {
      term: 'Practice routine',
      keywords: ['routine', 'practice', 'warm up', 'goal', 'review'],
      explanation:
        'A practice routine is a short plan you repeat. A good beginner routine is: warm up, review notes, clap rhythm, play a riff, then choose what to improve next. Keep it small so you can do it often. Five focused minutes every day is better than a long practice where you rush and stop listening.',
    },
    {
      term: 'Groove',
      keywords: ['groove', 'feel', 'lock in', 'steady'],
      explanation:
        'Groove is how the bassline feels with the beat. A good groove feels steady, strong, and easy to move to. You build groove by playing notes at the right time, keeping rests quiet, and repeating patterns evenly. If the notes are correct but the timing is messy, the groove will not feel right yet.',
    },
    {
      term: 'String names',
      keywords: ['string names', 'eadg', 'e string', 'a string', 'd string', 'g string'],
      explanation:
        'The four strings on a normal bass are E, A, D, and G from lowest to highest. The E string is thickest and closest to your face when you hold the bass. The G string is thinnest and highest sounding. Saying E, A, D, G out loud while touching each string helps you remember them.',
    },
    {
      term: 'Finger numbers',
      keywords: ['finger numbers', 'finger 1', 'finger 2', 'finger 3', 'finger 4', 'pointer', 'middle', 'ring', 'pinky'],
      explanation:
        'Finger numbers tell you which left-hand finger to use. Finger 1 is pointer, finger 2 is middle, finger 3 is ring, and finger 4 is pinky. Using finger numbers helps you avoid jumping around too much. Start slowly and keep your fingers relaxed.',
    },
    {
      term: 'Mic input',
      keywords: ['mic', 'microphone', 'real bass', 'listen', 'hear my bass'],
      explanation:
        'Mic input lets the app listen to your real bass. Turn the mic on, allow browser microphone access, and play one clear note close to the device. Try to play one string at a time and let other strings stay quiet. If the room is noisy or the note buzzes, the app may have a harder time reading it.',
    },
    {
      term: 'Buzzing notes',
      keywords: ['buzz', 'buzzing', 'bad sound', 'not clean', 'rattle'],
      explanation:
        'Buzzing happens when the string does not ring cleanly. It can happen if your finger is too far from the fret, if you press too lightly, or if another finger touches the string by accident. Move your finger just behind the fret and press firmly enough for a clear note.',
    },
    {
      term: 'Playing slowly',
      keywords: ['slow', 'slowly', 'speed', 'fast', 'too fast'],
      explanation:
        'Playing slowly is how you learn accurately. If you rush, your fingers may guess and your timing can fall apart. Start slow enough that you can play the right note at the right time. After it feels easy, make it a little faster.',
    },
    {
      term: 'Tuning',
      keywords: ['bass tuning', 'tune bass', 'tune my bass', 'standard tuning', 'eadg tuning'],
      explanation:
        'Tuning means adjusting the strings so they make the right notes. Standard four-string bass tuning is E, A, D, G from lowest to highest. Use a tuner, play one open string at a time, and turn the tuning peg slowly until the tuner says the note is correct. Tune before you practice so the notes you learn sound right.',
    },
    {
      term: 'Plucking',
      keywords: ['pluck', 'plucking', 'right hand', 'playing hand', 'index finger', 'middle finger'],
      explanation:
        'Plucking is how you make the string sound with your playing hand. Many bass players use index and middle fingers, taking turns. Pull the string across, not up away from the bass. Try to make each note the same volume so your bassline sounds steady.',
    },
    {
      term: 'Muting',
      keywords: ['mute', 'muting', 'stop strings', 'stop ringing', 'unwanted noise'],
      explanation:
        'Muting means stopping strings you do not want to hear. Bass strings can keep ringing after you play them, so use spare fingers or your plucking hand to quiet them. Good muting makes your notes cleaner and helps the groove sound tight.',
    },
    {
      term: 'Bass tab',
      keywords: ['tab', 'tabs', 'bass tab', 'tablature', 'numbers on lines'],
      explanation:
        'Bass tab is a simple way to write where your fingers go. The lines are strings and the numbers are frets. A 0 means open string. A 3 means press fret 3. Tab is useful for learning songs, but it does not always show rhythm clearly, so still count the beat.',
    },
    {
      term: 'Root notes',
      keywords: ['root', 'root note', 'root notes', 'chord note', 'chords'],
      explanation:
        'A root note is the main note of a chord. Bass players often play root notes because they make the music feel grounded. If the chord is E, playing an E on bass usually sounds strong. Root notes are a good first step before adding extra notes.',
    },
    {
      term: 'Scales',
      keywords: ['scale', 'scales', 'major scale', 'minor scale'],
      explanation:
        'A scale is a set of notes that fit together. Scales help you find notes for basslines and riffs. You do not need many scales at first. Start by learning where notes are on the fretboard, then add simple major and minor patterns later.',
    },
    {
      term: 'Metronome',
      keywords: ['metronome', 'click', 'bpm', 'tempo'],
      explanation:
        'A metronome makes a steady click so you can practice timing. BPM means beats per minute. A slower BPM gives you more time between beats. Practice with a metronome by counting 1, 2, 3, 4 and playing exactly with the click.',
    },
    {
      term: 'Bass tone',
      keywords: ['tone', 'sound', 'amp', 'amplifier', 'volume', 'eq'],
      explanation:
        'Tone is the sound quality of your bass. Your fingers, bass knobs, and amp settings all change tone. For beginner practice, use a clear sound: not too loud, not too much bass, and not too much distortion. A clear tone makes it easier to hear mistakes.',
    },
    {
      term: 'Holding the bass',
      keywords: ['hold bass', 'holding bass', 'strap', 'posture', 'sit', 'stand'],
      explanation:
        'Hold the bass so both hands feel relaxed. The neck should not be too low, because that makes fretting harder. If you use a strap, set it so the bass sits in a comfortable place when standing or sitting. Relax your shoulders and keep your wrist from bending too much.',
    },
    {
      term: 'Fretboard',
      keywords: ['fretboard', 'fingerboard', 'where are notes', 'neck map'],
      explanation:
        'The fretboard is the long part of the bass where you press notes. Moving toward the body makes notes higher. Each fret is one small step higher in pitch. Learning the fretboard means learning where notes like E, F, G, A, B, C, and D live.',
    },
    {
      term: 'Calluses',
      keywords: ['callus', 'calluses', 'finger hurts', 'sore fingers', 'pain'],
      explanation:
        'Your fingertips may feel sore when you start bass. Over time they build calluses, which are tougher skin that makes playing easier. Practice in short sessions, stop if pain feels sharp, and avoid pressing harder than needed.',
    },
  ];

  function searchGlossary(query) {
    const normalized = normalize(query);
    if (!normalized) return null;

    return (
      TOPICS.find((topic) => normalize(topic.term) === normalized) ||
      bestKeywordMatch(normalized) ||
      TOPICS.find((topic) => normalize(topic.explanation).includes(normalized)) ||
      bassFallback(normalized) ||
      null
    );
  }

  function bestKeywordMatch(normalized) {
    return TOPICS.map((topic) => {
      const score = topic.keywords.reduce((total, keyword) => {
        const normalizedKeyword = normalize(keyword);
        return includesPhrase(normalized, normalizedKeyword)
          ? total + normalizedKeyword.length
          : total;
      }, 0);
      return { topic, score };
    })
      .filter((match) => match.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.topic;
  }

  function includesPhrase(normalized, normalizedKeyword) {
    return new RegExp(`(^|\\s)${escapeRegExp(normalizedKeyword)}(\\s|$)`).test(normalized);
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function bassFallback(normalized) {
    const bassWords = ['bass', 'bass guitar', 'bass guiter'];
    if (!bassWords.some((word) => normalized.includes(word))) return null;

    return {
      term: 'Bass guitar help',
      keywords: [],
      explanation:
        'This search covers beginner bass guitar ideas like tuning, strings, frets, plucking, muting, notes, riffs, pulse, rests, basslines, groove, tab, scales, tone, posture, and practice. Try searching one clear word, for example: tuning, muting, tab, metronome, groove, or buzzing notes.',
    };
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return { TOPICS, searchGlossary };
});
