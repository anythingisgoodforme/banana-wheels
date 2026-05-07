# Banana Wheels V3 Agent Mandate

This mandate comes from Agent `BW-V3-001: Principal Arcade Game Director`, hired after the V2 prototype failed the gameplay bar.

## Mandate

Build Banana Wheels V3 as an arcade game first, content platform second. V2 failed because it implemented a respectable feature list without proving the core driving feel was fun. V3 must ship a tight, readable, replayable 60-second-to-3-minute arcade loop before adding upgrades, cosmetics, extra modes, or more hazards.

## What Was Wrong With V2

- It expanded scope before the core action worked.
- Lane switching was functional, but not expressive enough to create mastery.
- Boost was mostly a speed/score modifier, not a dangerous decision.
- Pickups rewarded collection, but did not create interesting routes.
- Obstacles behaved too similarly: same avoidance verb, same collision consequence.
- Course generation was random pattern selection, not authored pressure with setups, tests, payoffs, and breathers.
- Scoring existed, but the player was not being asked to make stylish, readable, repeatable skill choices.
- Progression and upgrades arrived before the game had a strong reason to replay.
- Game feel was under-specified: no hard targets for input latency, lane-change timing, near-miss windows, hit recovery, shake, sound, or readable telegraphs.

## Core Fun Promise

Thread a ridiculous banana-wheeled cart through readable jungle traffic at unsafe speed, skim hazards for combo, spend boost when greed says yes, crash because it was your fault, and restart immediately.

If that sentence is not true in the first minute of play, V3 is failing.

## V3 Must Prioritize

1. Feel.
2. Readability.
3. Skill.
4. Replayability.

Feel requirements:

- Lane changes must be snappy, buffered, cancel-aware, and satisfying.
- Boost must feel powerful, risky, and noisy.
- Collisions must have readable cause, strong feedback, and fast recovery.

Readability requirements:

- Every hazard must be identifiable before it matters.
- Every lane must be legible at speed.
- Every death must feel fair within one replay.

Skill requirements:

- The best player should score much higher than a safe player on the same seed.
- Skill must come from route choice, timing, near misses, boost discipline, and recovery.

Replayability requirements:

- Runs need deterministic seeds.
- Pattern generation needs authored rhythm, not pure scatter.
- Scoring must expose "I can do better" immediately.

## Mechanics That Create Skill

- Three lanes stay because they make the game readable.
- Lane changes have commitment: short travel time, tiny lockout, input buffering, and clear lane intent.
- Boost is a risk contract: higher speed, higher score multiplier, tighter reaction window, increased near-miss reward.
- Near miss is central: passing close to hazards builds combo and boost, but only if the player holds their nerve.
- Banana routes matter: bananas should pull the player toward danger, not sit safely in the obvious open lane.
- Crash recovery matters: a hit should drop speed/combo and create a recovery challenge, not simply subtract health.
- Combos should decay fast enough that aggressive routing matters.
- Same seed, better run must be the main replay hook.

Hazards need unique verbs:

- Static blockers: choose lane early.
- Moving blockers: time the lane change.
- Oil/peels: avoid or enter with controlled drift/recovery.
- Ramps: line up, tilt/land cleanly, preserve combo.
- Heavy blockers: force boost/no-boost decisions.

## MVP Scope

V3 MVP should be deliberately small:

- One primary mode: Endless Arcade.
- One polished biome: Jungle Road.
- Three lanes.
- Keyboard and touch controls.
- Five to six hazard types maximum.
- Banana pickups, near misses, boost, combo, crash recovery.
- Deterministic seeded runs.
- Run summary with score breakdown:
  - distance
  - bananas
  - near misses
  - boost score
  - best combo
  - crashes
- Restart from summary in one action.
- Debug overlay for seed, speed, FPS, combo, entity count, and collision zones.

Defer upgrades, cosmetics, daily runs, multiple biomes, leaderboards, and challenge modes until this loop is fun with no progression attached.

## Architecture Constraints

- Keep static browser delivery and Canvas.
- Use ES modules, but avoid architecture theater.
- Simulation and rendering must stay separate.
- Fixed timestep simulation stays required.
- Input must support buffering and edge events cleanly.
- Course generation must be deterministic from seed.
- Pattern generation must use a difficulty budget plus authored pattern groups:
  - intro
  - pressure
  - reward
  - breather
  - spike
- Collision must be deterministic and inspectable.
- Rendering must not own gameplay state.
- No permanent progression should affect core tuning during MVP validation.
- Add gameplay tests for generator fairness, scoring rules, boost economy, and collision windows.

## Acceptance Criteria

V3 is not accepted unless all of this is true:

- A new player understands the goal within 10 seconds without reading instructions.
- A competent player can intentionally produce near misses within 30 seconds.
- Boost creates visible danger and visibly better score potential.
- On the same seed, a better player can reliably beat a safe player by at least 2x score.
- At least 90% of crashes in playtest are explainable by the player as their own mistake.
- No unavoidable obstacle patterns occur across 1,000 generated test seeds.
- The game holds 60 FPS on a mid-range mobile browser target.
- Restart-to-control time after a failed run is under 2 seconds.
- The first minute contains at least:
  - 3 simple reads
  - 3 risky banana routes
  - 2 near-miss opportunities
  - 1 boost-worthy section
  - 1 breather
- Run summary makes the player immediately know what to improve.
- The MVP is fun before upgrades exist.

## Blunt V3 Rule

Do not add content to hide weak feel.

Do not add progression to compensate for weak replayability.

Do not add systems until the same 60-second seed is fun to replay five times.
