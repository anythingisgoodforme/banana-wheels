# Bass Guitar Sequel Game Plan

## Working Title

Bassline Rookie

## Studio Continuity

This is a second game from the same studio as Banana Wheels, but it should be a completely new app, not a reskin or mode inside the driving game.

Shared development practices:

- Static browser delivery.
- Vanilla HTML, CSS, and JavaScript unless a specific learning feature requires a small library.
- Canvas or DOM-first UI chosen by lesson needs, not by habit.
- Small playable vertical slices before broad feature expansion.
- Docs-first gameplay and learning design.
- Deterministic lesson content stored as structured data.
- Tests for pure learning logic such as note mapping, fret validation, rhythm timing windows, and lesson progression.

## Product Goal

Teach a fast-learning 10-year-old beginner to play bass guitar from zero through a confident first practice routine, using short interactive lessons, clear feedback, and repeatable mini-games.

The app should feel like a practice coach, not a music theory textbook.

## Target Player

- Age: 10.
- Learning style: quick pattern recognition, likely impatient with long explanations.
- Starting level: assumes no prior bass knowledge.
- Needs: posture, string names, fretting, plucking, rhythm, simple grooves, and confidence.
- Session length: 5 to 15 minutes.

## Core Learning Loop

1. Pick the next lesson.
2. Watch or read one compact instruction card.
3. Try a focused exercise.
4. Get immediate feedback.
5. Repeat until the lesson target is met.
6. Unlock the next lesson and a short recap.

## MVP Experience

The first implementation should include:

- Lesson map with 10 beginner lessons.
- Interactive bass fretboard.
- String and fret trainer.
- Rhythm pulse trainer with visual metronome.
- Call-and-response pattern practice.
- Lesson completion state in local storage.
- Practice stats per lesson: attempts, best streak, completion date.
- Simple audio feedback using Web Audio.
- No account system, backend, leaderboards, or paid progression.

## Pedagogy Principles

- Start with physical familiarity before theory.
- Teach one concept per lesson.
- Use retrieval practice: ask the player to identify or play, not only observe.
- Keep early wins frequent.
- Mix recognition, timing, and motor-control tasks.
- Introduce notation only after the player has felt the sound and pattern.
- Prefer steady timing and clean sound over speed.
- Use short loops and repetition without punishment.
- Review old skills inside later lessons.

## Ten Starting Lessons

### 1. Meet the Bass

Goal: understand the instrument layout and safe practice posture.

Skills:

- Identify body, neck, headstock, frets, pickups, and strings.
- Learn that bass is tuned low to high: E, A, D, G.
- Learn relaxed hand position.

Exercise:

- Tap the highlighted instrument part.
- Drag string labels onto the correct strings.

Completion:

- Correctly label all four strings twice.

### 2. Open Strings

Goal: play and recognize E, A, D, and G without fretting.

Skills:

- Pluck one string at a time.
- Hear low-to-high pitch order.
- Match string name to sound.

Exercise:

- The app plays a string sound; player selects E, A, D, or G.
- Visual metronome asks for steady open-string plucks.

Completion:

- 12 correct string identifications with an 80% or better score.

### 3. Frets And Fingers

Goal: understand what frets do and how to press cleanly.

Skills:

- Fret numbers.
- Finger numbers 1 through 4.
- Press just behind the fret.

Exercise:

- Highlighted fret targets on one string.
- Player clicks or taps the requested fret and finger number.

Completion:

- Correctly place 10 fret targets with no more than 2 misses.

### 4. First Notes: E String

Goal: play the first notes on the E string.

Skills:

- Open E.
- Fret 1 F.
- Fret 3 G.
- Move between open and fretted notes.

Exercise:

- Call-and-response: E, F, G patterns.
- Name-the-note challenge on the E string.

Completion:

- Play a 4-note pattern three times in time.

### 5. First Groove Rhythm

Goal: feel a steady pulse using quarter notes.

Skills:

- Count 1, 2, 3, 4.
- Play one note per beat.
- Start and stop with the metronome.

Exercise:

- Pulse lane with hit window.
- Player taps or clicks on beats while holding one note.

Completion:

- 16 beats with at least 12 in the good timing window.

### 6. A String Notes

Goal: add the A string and connect notes across strings.

Skills:

- Open A.
- Fret 2 B.
- Fret 3 C.
- Switch strings cleanly.

Exercise:

- Fretboard target sequence using E and A strings.
- Ear challenge: low string or higher string.

Completion:

- Complete an 8-note E/A pattern with 80% accuracy.

### 7. Two-String Riffs

Goal: play simple repeating riffs using E and A string notes.

Skills:

- Repeat a short pattern.
- Keep fingers close to the fretboard.
- Recognize riff shape.

Exercise:

- Pattern blocks show note names and fret positions.
- Player follows a looping riff at slow tempo.

Completion:

- Maintain the riff for 4 bars.

### 8. Rests And Space

Goal: learn that silence is part of groove.

Skills:

- Quarter rests.
- Muting.
- Counting while not playing.

Exercise:

- Rhythm grid includes play beats and rest beats.
- Player must avoid tapping during rests.

Completion:

- Finish a 4-bar rhythm with no more than 2 rest mistakes.

### 9. First Full Bassline

Goal: combine notes, timing, and rests into a musical phrase.

Skills:

- Follow a 4-bar bassline.
- Keep steady tempo.
- Recover after a mistake.

Exercise:

- Slow guided playthrough, then performance mode.

Completion:

- Score 75% or better on the full bassline.

### 10. Practice Routine

Goal: learn how to practice independently.

Skills:

- Warm up with open strings.
- Review a note set.
- Play one rhythm exercise.
- Play one riff.

Exercise:

- Build a 5-minute routine from unlocked exercises.

Completion:

- Finish the routine and choose the next personal goal.

## Proposed Game Folder

After review, implement the new game under:

```text
public/bassline-rookie/
  index.html
  styles.css
  src/
    main.js
    data/
      lessons.js
      notes.js
      rhythms.js
    core/
      audio.js
      storage.js
      timing.js
    ui/
      lessonMap.js
      fretboard.js
      rhythmTrainer.js
      feedback.js
    systems/
      lessonEngine.js
      scoring.js
```

Suggested tests:

```text
tests/bassline-rookie/
  notes.test.js
  timing.test.js
  lessonEngine.test.js
```

## First Implementation Slice

Build only lessons 1 and 2 first:

- Entry screen that opens directly into the lesson map.
- Interactive four-string bass diagram.
- String labeling exercise.
- Open string recognition exercise.
- Local completion tracking.
- Web Audio notes for E1, A1, D2, and G2.

Acceptance criteria:

- A new player can complete lesson 1 without external instructions.
- Lesson 2 produces distinct pitch feedback for all four open strings.
- Completion survives page refresh.
- UI works on desktop and tablet widths.

## Open Review Questions

- Should the first version assume the player has a real bass in hand, or should it also work as a pure screen-only trainer?
- Should lessons use note names only at first, or also introduce simple tab notation during lessons 4 and 5?
- Should the visual style stay close to Banana Wheels branding, or establish a separate music-school identity?
