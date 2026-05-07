# Banana Wheels Codex Agent Ledger

This file records specialist Codex agents used for Banana Wheels design work, their mandate, performance, and current status.

## Agent BW-V2-001: Senior Game Developer

### Status

Fired.

### Claimed Experience

15 years of game development experience, focused on arcade/browser game direction.

### Original Mandate

Review the Banana Wheels V1 baseline and recommend a more modern, entertaining, and challenging V2 browser game.

### Output Used

The agent supplied recommendations that were folded into `docs/GAME_SPEC.md` under `Version 2 Enhanced Spec`, including:

- Banana-powered boost.
- Combo scoring.
- Biome-based difficulty.
- Seeded course generation.
- Modular vanilla JavaScript architecture.
- Progression, upgrades, and accessibility options.

### Performance Review

The agent's output was directionally plausible but failed the most important standard: it did not force a playable prototype with a strong central fun mechanic before expanding scope.

Specific failures:

- Prioritized architecture and feature inventory over game feel.
- Accepted generic endless-runner ideas instead of a distinctive Banana Wheels hook.
- Did not define a clear 10-second fun test.
- Did not specify enough tuning targets for speed, input response, collision forgiveness, or scoring feedback.
- Did not require playtest acceptance criteria before implementation.
- Did not protect the project from a V2 that looked more organized but still played poorly.

### Termination Reason

The V2 gameplay bar was missed. The agent is removed from future design authority for Banana Wheels.

## Agent BW-V3-001: Principal Arcade Game Director

### Status

Hired for V3 planning.

### Required Experience

25+ years of arcade/action game development experience, with shipped browser or mobile skill games and specific strength in game feel, tuning, and replayable core loops.

### Mandate

Design Banana Wheels V3 around a proven playable core before any broad feature expansion.

Full mandate: `docs/V3_AGENT_MANDATE.md`.

The V3 agent must:

- Start from what the player does every second.
- Define the core fun promise in one sentence.
- Specify a 10-second prototype loop.
- Define input feel, speed, recovery, and scoring targets.
- Cut features that do not improve the central loop.
- Require measurable acceptance criteria before implementation is considered complete.
- Treat visual polish, progression, upgrades, and architecture as support for gameplay, not substitutes for it.

### V3 Design Bar

V3 must be playable and interesting before it is large.

Minimum acceptance criteria:

- The first 10 seconds must present a clear, satisfying action.
- The player must understand why they failed.
- Restart must be instant.
- Boosting must create a meaningful risk/reward decision.
- Obstacles must be readable at speed.
- Score feedback must make skillful play obvious.
- The game must be fun without upgrades.
- Architecture must serve iteration speed.

### Authority

The V3 agent replaces the V2 agent for future game-design recommendations.
