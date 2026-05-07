# Banana Wheels Game Spec

## Version 1.0 Baseline

Version 1.0 is the preserved browser-game baseline tagged as `v1.0`.

### Experience

Banana Wheels GT is a first-person arcade lane-driving game. The player drives through a jungle road from a cockpit view, reads upcoming monkey traffic, shifts between three lanes, survives collisions, and times a late-run spring pad to win.

### Platform

- Browser-hosted static game.
- Vanilla HTML, CSS, and JavaScript.
- Canvas-rendered game scene.
- No build step required.
- Current entry point: `public/index.html`.
- Current game file: `public/game.js`.
- Current styles: `public/styles.css`.

### Controls

- `ArrowLeft` / `A`: shift one lane left.
- `ArrowRight` / `D`: shift one lane right.
- `Space`: start the run, trigger the spring when ready, or restart after win/loss.
- `R`: restart the full run.
- Fullscreen button toggles the canvas container into fullscreen mode.

### Core Rules

- The road has three lane positions.
- Monkey waves spawn ahead of the player.
- Each wave blocks one or two lanes and leaves at least one lane open.
- The player must shift into the open lane before the wave reaches the collision zone.
- A monkey collision adds one damage hit.
- Five damage hits remove one life.
- The player starts with three lives.
- Losing a life resets the course but preserves remaining lives.
- Losing all lives ends the run.
- After 60 seconds, a spring pad appears.
- Pressing `Space` while the spring is in range triggers the win sequence.
- Missing the spring costs a life.

### Game States

- `intro`: waiting for the player to press `Space`.
- `drive`: lane-driving survival phase.
- `spring-flight`: short successful spring/boost sequence.
- `won`: post-win restart screen.
- `lost`: post-loss restart screen.

### Feedback

- Simple Web Audio beeps for launch, spring success, and failure.
- Camera shift and bank based on steering.
- Screen shake and red flash on collisions.
- Flashing spring alert when the spring objective is active.
- Canvas HUD shows title, elapsed time, lives, spring status, damage, lane indicator, and contextual messages.
- External HTML stats show time, lives, and phase.

### Visual Direction

- First-person jungle-road perspective.
- Drawn road, lane markers, jungle backdrop, roadside foliage, cockpit hood, monkeys, spring pad, overlays, and vignette.
- Responsive page layout with large canvas, fullscreen support, and side panels for controls and run stats.

### Current Limitations

- Gameplay is short and centered around a single 60-second spring objective.
- Course generation is random but not seeded or replayable.
- All gameplay, rendering, input, audio, state, and UI logic live in one large JavaScript file.
- No pickups, scoring system, progression, upgrades, challenge mode, mobile controls, gamepad controls, or persistent save data.
- Audio is functional but minimal.
- No asset pipeline, sprite system, or structured content definitions.
- Accessibility options are limited.

## Version 2 Enhanced Spec

### Product Goal

Version 2 should become a replayable, skill-based arcade driving game: fast to understand, funny in theme, more expressive in controls, and challenging through risk/reward decisions rather than only through obstacle speed.

### Target Experience

The player drives a banana-wheeled vehicle through a scrolling jungle course, collects bananas, chains stylish driving actions, avoids escalating hazards, uses banana energy for boosts, and finishes each run with a clear performance breakdown and unlock progress.

Runs should feel satisfying at 30 seconds, 2 minutes, or 10 minutes.

### Core Loop

1. Start an endless run or challenge run.
2. Drive through a generated course with lanes, curves, jumps, hazards, and pickups.
3. Collect bananas and maintain momentum.
4. Use banana energy for boosts and risky shortcuts.
5. Chain near misses, drifts, perfect landings, and banana streaks into combo score.
6. Crash, recover, or end the run based on damage and speed.
7. Review run summary, score sources, objective progress, and earned bananas.
8. Buy upgrades or cosmetics.
9. Restart quickly with a new seed, objective, or loadout.

### Moment-To-Moment Mechanics

- Three-lane driving remains the base readability model.
- Steering should feel smoother and more physical, with acceleration, drift, grip, and vehicle lean.
- Banana pickups serve as score, currency, and boost fuel.
- Boost increases speed, score potential, and danger.
- Hazards include monkey traffic, peel traps, potholes, oil slicks, crates, rolling barrels, market carts, ramps, mud, and moving blockers.
- Jumps allow midair tilt and landing bonuses.
- Mistakes should often be recoverable through speed loss, spinout, damage, or combo loss instead of immediate run termination.
- Perfect play should be rewarded through combo continuation and score multipliers.

### Scoring

Score should be legible and tied to skill.

```text
score =
  distance_score
  + banana_score
  + stunt_score
  + near_miss_score
  + combo_bonus
  - crash_penalty
```

Scoring events:

- Banana pickup streaks.
- Near misses.
- Drift distance.
- Perfect landings.
- Clean obstacle sections.
- Boost-chain segments.
- Challenge objective completion.

### Progression

Persistent bananas earned per run unlock lightweight upgrades and cosmetics.

Upgrade categories:

- Acceleration.
- Grip.
- Boost capacity.
- Suspension.
- Crash recovery.
- Banana magnet radius.

Cosmetic unlocks:

- Wheel skins.
- Cart bodies.
- Banana trails.
- Driver hats.
- HUD themes.

Progression must improve replayability without requiring grinding to enjoy the game.

### Modes

V2 initial modes:

- Endless Run: primary arcade mode.
- Challenge Runs: curated objectives using fixed seeds and constraints.

Later modes:

- Daily Run: deterministic seed and fixed loadout for leaderboard-friendly competition.
- Time Trial: fixed course, best time or longest distance.
- Practice Mode: slower speed, no permanent failure.

### Difficulty

Difficulty should escalate through layered pressure.

- Early sections use wide gaps and simple hazards.
- Later sections combine tighter lanes, mixed patterns, moving obstacles, terrain effects, and higher speed.
- Speed increases gradually.
- Boosts, shortcuts, and combo routes let expert players voluntarily take extra risk.
- Short breather segments should follow intense sequences.
- Course generation should use a difficulty budget so obstacle combinations remain fair.

Biome sections:

- Beach: forgiving, wide roads, simple ramps.
- Jungle: mud, vines, monkeys, falling fruit.
- Market: carts, crates, tight lanes, visual pressure.
- Volcano: lava cracks, falling rocks, narrow paths.

### Accessibility

- Keyboard controls for movement, boost, pause, and restart.
- Touch controls with large left/right zones and a dedicated boost button.
- Optional gamepad support.
- Pause menu.
- Separate music and sound effect volume.
- Reduced motion option.
- Screen shake intensity option.
- High contrast option.
- Colorblind-safe hazard treatment.
- Avoid relying on color alone for hazard readability.
- Mobile-readable UI.

### Technical Architecture

V2 should keep the static-hosted simplicity but replace the single-file implementation with ES modules under `public/v2/src`.

Architecture requirements:

- Fixed timestep simulation.
- Explicit game states.
- Input abstraction separated from gameplay.
- Rendering separated from simulation.
- Entity/component-lite organization for player, obstacles, pickups, particles, and terrain.
- Seeded random course generation.
- Data-driven biome and obstacle definitions.
- Local storage save wrapper.
- Central audio wrapper.
- Debug overlay for FPS, seed, speed, entity counts, and collision boxes.

### Proposed Folder Structure

```text
public/
  v2/
    index.html
    styles.css
    src/
      main.js
      game/
        Game.js
        GameState.js
        RunController.js
        constants.js
      core/
        loop.js
        input.js
        audio.js
        storage.js
        random.js
        math.js
      entities/
        Player.js
        Obstacle.js
        Pickup.js
        Particle.js
      world/
        CourseGenerator.js
        biomes.js
        obstaclePatterns.js
      systems/
        physics.js
        collisions.js
        scoring.js
        difficulty.js
        progression.js
      render/
        Renderer.js
        camera.js
        hud.js
      ui/
        menus.js
        runSummary.js
```

### Version 2 MVP Scope

The first V2 implementation should include:

- Refactored ES module folder structure.
- Hosted `public/v2/index.html` experience.
- Canvas game with menu, playing, paused, and run-complete states.
- Fixed timestep loop.
- Seeded endless course generation.
- Three-lane driving with smoother vehicle feel.
- Bananas, hazards, boost energy, combos, score, damage, and run summary.
- Persistent best score and banana wallet.
- Upgrade screen with a small set of functional upgrades.
- Keyboard and touch controls.
- Reduced motion and mute toggles.

### Non-Goals For Initial V2

- Online leaderboard.
- Heavy rendering framework.
- Server-side accounts.
- Full asset pipeline.
- Large campaign mode.
- Monetization.
