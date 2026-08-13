# SCOOT World Console Spec

This spec describes a new version of SCOOT. Do not replace or edit the existing `public/scoot/` game. Use `docs/SCOOT_GAME_PLAN.md` as the baseline feature list, then build this as a separate project or separate web entry point.

Recommended repo target for a web prototype:

```text
public/scoot-world/
```

Recommended standalone target for a 3D/console prototype:

```text
scoot-world-unity/
```

## Vision

Make SCOOT feel less like a flat menu-and-trick toy and more like a real scooter game:

- Third-person GTA-style follow camera by default.
- First-person camera available at any time with one button.
- A small rideable world with ramps, rails, stairs, boxes, curbs, ledges, indoor park areas, and outdoor street spots.
- Tricks have a 3 second cooldown so the player cannot spam them.
- Tricks must look physically believable, especially scooter-specific tricks like Bri flips.
- The current SCOOT game remains untouched as Version 1.

## Build Targets

### First Build: Web Prototype

Build a playable browser prototype first. It can run locally from `public/scoot-world/` using the same static server as the rest of this repo.

Local URL:

```text
http://localhost:8000/scoot-world/
```

The web prototype can be simpler than the final console version, but it must prove:

- Third-person follow camera.
- First-person camera toggle.
- Rideable open area.
- Jumping, landing, rails, ramps, and basic collision.
- Trick cooldown.
- Real trick animation timing.

### Future Target: PlayStation 4 or PlayStation 5

The current HTML/CSS/JavaScript version cannot be directly shipped as a normal PS4 or PS5 game. A real PlayStation version needs a console-capable engine, a PlayStation Partner account, Sony SDK access, and PlayStation development or test hardware.

Practical route:

1. Build the design on PC/Mac first.
2. Use Unity or Unreal Engine for the serious 3D version.
3. Apply to PlayStation Partners when the game has a strong prototype.
4. Port and certify after Sony access is approved.

References:

- PlayStation Partners: `https://partners.playstation.net/`
- PlayStation develop page: `https://www.playstation.com/en-us/develop/`
- Unreal Engine supports console-class 3D development, including PlayStation targets once the developer has the required platform access.
- Unity supports console development, but PlayStation build support requires the appropriate console/platform access and licensing.

## Can We Build It From Our Computers?

### MacBook Pro

Good for:

- Web prototype.
- Unity prototype.
- Blender asset work.
- Game design, levels, controls, and animation tests.

Limitations:

- Final PlayStation builds usually require Sony SDK access and platform-specific tooling.
- Some console workflows are easier or only supported on Windows, depending on the engine version and SDK access.
- Unreal Engine can run on macOS, but heavy 3D open-world work may be slow on older or lower-spec Mac hardware.

### Older Windows 11 PC

Good for:

- Unity prototype if it has a reasonable GPU.
- Blender at low/medium scene complexity.
- Playtesting controller controls.
- Possible PlayStation SDK host machine after partner approval, if it meets Sony and engine requirements.

Limitations:

- Unreal Engine 5 open-world work may be too heavy on an older PC.
- PS5-quality visuals are not a good first goal on weak hardware.
- Use low-poly assets, simple lighting, and small levels first.

### Recommendation

Use the MacBook Pro or Windows 11 PC for the first prototype. Choose Unity if the goal is to learn quickly and make a controllable 3D scooter game. Choose Unreal only if the machine can handle it and the team wants higher-end visuals later.

## Core Gameplay

The player rides a scooter through a small open area and earns score by performing tricks in the air or on rails.

Main loop:

1. Ride around the world.
2. Find a ramp, rail, ledge, stair set, or gap.
3. Jump or grind.
4. Trigger one trick if the trick cooldown is ready.
5. Land cleanly to bank score and coins.
6. Chain lines by moving from one obstacle to the next.

Fail states:

- Bad landing angle.
- Landing sideways at high speed.
- Hitting an obstacle head-on.
- Starting a trick too low and not finishing before landing.

Keep failure kid-friendly: quick tumble, reset nearby, no gore.

## Camera System

### Third-Person Follow Camera

Default camera.

Requirements:

- Camera follows behind the rider like a GTA-style third-person view.
- Camera slightly raises when the rider jumps.
- Camera pulls back during big jumps and flips.
- Camera does not clip through walls if possible.
- Camera recenters behind movement direction after a short delay.
- Camera can rotate around the player with the right stick or mouse.

### First-Person Camera

Toggle camera.

Requirements:

- Camera sits near the rider's head/chest.
- Scooter bars and front wheel are visible.
- Landing should feel clear, not confusing.
- Tricks can briefly pull to a cinematic close camera if full first-person motion becomes too dizzy.

Camera switch:

- Keyboard: `V`
- PlayStation controller: `Triangle`
- Xbox/PC controller: `Y`

Camera modes:

- `Follow`: third-person default.
- `FirstPerson`: rider view.
- `CinematicTrick`: optional temporary camera during major tricks.

## Controls

### Keyboard

| Action           | Key       |
| ---------------- | --------- |
| Accelerate       | `W`       |
| Brake / reverse  | `S`       |
| Steer            | `A` / `D` |
| Jump / bunny hop | `Space`   |
| Camera toggle    | `V`       |
| Trick 1          | `1`       |
| Trick 2          | `2`       |
| Trick 3          | `3`       |
| Trick 4          | `4`       |
| Grind / lock-on  | `G`       |
| Reset nearby     | `R`       |
| Pause            | `Esc`     |

### PlayStation Controller

| Action           | Button      |
| ---------------- | ----------- |
| Accelerate       | `R2`        |
| Brake / reverse  | `L2`        |
| Steer            | Left stick  |
| Camera rotate    | Right stick |
| Jump / bunny hop | `Cross`     |
| Camera toggle    | `Triangle`  |
| Trick modifier   | `Square`    |
| Spin modifier    | `Circle`    |
| Grind / lock-on  | `L1`        |
| Boost / pump     | `R1`        |
| Pause            | Options     |

## Trick Rules

### Cooldown

Every major trick has a 3 second cooldown.

Rules:

- Cooldown starts when the trick begins.
- Trick buttons are disabled during cooldown.
- UI shows cooldown as a radial meter or shrinking bar.
- Player can still steer, jump, land, and grind during cooldown.
- Basic style moves may still happen, but they should not score like a full trick.

### Trick Validity

A trick scores only when:

- The rider is airborne, or
- The rider is locked into a grind for grind tricks.

A trick fails or gives reduced score when:

- The rider lands before the animation finishes.
- The scooter rotation is incomplete.
- The rider hits a wall or obstacle mid-trick.
- The same trick is repeated too many times in a row.

## Realistic Trick Animation Notes

Do not fake every trick with the same spin animation. The scooter, rider, bars, deck, and body need separate motion.

Minimum animation parts:

- Rider body.
- Scooter deck.
- Handlebar/fork/front wheel.
- Back wheel.
- Hands.
- Feet.

### Tail Whip

The deck spins horizontally around the handlebar/fork axis while the rider stays mostly upright. Feet leave the deck, deck rotates once, then feet catch before landing.

### Bar Spin

The handlebars rotate around the vertical fork axis. Rider releases and catches the bars. The deck does not spin.

### 180 / 360

The whole rider and scooter rotate together around the vertical axis. This should be driven by body rotation, not just the scooter spinning by itself.

### Front Flip / Back Flip

The rider and scooter rotate together around a horizontal axis. The camera should pull back in third-person. First-person should either reduce motion intensity or use a short cinematic camera to avoid sickness.

### No-Hander

The rider releases both hands from the bars while the scooter stays stable under the feet. Hands return before landing.

### Grind

The scooter locks onto a rail, ledge, or box. Sparks or scrape effects are optional. The rider should balance and lean, not float above the rail.

### Bri Flip

This must not be treated as a generic backflip.

Animation intent:

- The rider keeps hold of the handlebars.
- The scooter rotates in a vertical, over-the-head arc.
- The deck and bars travel around the rider like a big vertical whip.
- The rider's body follows the motion with shoulders and arms, but the rider does not simply do a full body flip.
- The scooter returns underneath the rider for the catch and landing.

Implementation note:

Use a named animation clip for Bri. If hand-authoring it, split it into four beats:

1. Pop upward and pull bars across the body.
2. Scooter rises into a vertical arc beside/above the rider.
3. Scooter completes the over-the-head rotation.
4. Rider catches bars/deck alignment and lands.

## World Design

Start with one compact map, not a huge city.

Required areas:

- Outdoor street spot.
- Indoor skatepark.
- Ramp area.
- Rail line.
- Stair set.
- Box and ledge zone.
- A clear spawn area.

Nice-to-have areas:

- Rooftop line.
- Car park.
- Schoolyard.
- Small shop/garage.
- Hidden coin route.

The world should be readable from both third-person and first-person cameras.

## Obstacles

Required:

- Quarter pipe.
- Half pipe.
- Flat rail.
- Down rail.
- Manual pad / box.
- Stairs.
- Ledge.
- Gap.
- Curbs.

Collision requirements:

- Ramps launch the rider smoothly.
- Rails have a grind trigger area.
- Stairs should be rideable but bumpy.
- Reset zones catch the player if they fall out of the map.

## Scoring

Score is based on:

- Trick difficulty.
- Airtime.
- Landing cleanliness.
- Combo chain.
- Grind distance.
- Variety bonus.

Example base values:

| Trick      |    Base Score |
| ---------- | ------------: |
| 180        |           100 |
| Bar Spin   |           150 |
| Tail Whip  |           200 |
| No-Hander  |           200 |
| Grind      | 25 per second |
| 360        |           300 |
| Bri Flip   |           500 |
| Back Flip  |           600 |
| Front Flip |           700 |

Landing quality:

- Perfect: 1.5x
- Good: 1.0x
- Sketchy: 0.5x
- Crash: 0x

Combo timeout:

- Keep the original fast arcade feel, but use 3 seconds after landing or grind exit before the combo banks.

## UI

Required:

- Score.
- Coins.
- Combo.
- Current trick.
- Trick cooldown indicator.
- Camera mode label.
- Speed.
- Small minimap or compass for larger maps.

Menus:

- Start.
- Settings.
- Trick guide.
- Shop.
- Pause.
- About.

Settings:

- Camera sensitivity.
- First-person motion comfort.
- Music volume.
- SFX volume.
- Show FPS.
- Show timer.
- Reduced motion.

## Shop

Reuse the spirit of `docs/SCOOT_GAME_PLAN.md`:

- Scooters.
- Grip tape.
- Wheels.
- Helmets.
- Shirts/hoodies.

Shop items are cosmetic only for the first version. Avoid pay-to-win behavior.

## Art Direction

Style:

- Bright indie street-sports look.
- Readable shapes.
- Strong orange/yellow SCOOT identity.
- Not realistic GTA crime content; only the useful camera/world feel.

3D target:

- Low-poly or stylized models first.
- Smooth animations matter more than detailed textures.
- Use real scooter proportions: deck, bars, fork, wheels, grips.

Avoid:

- Emoji player as the main character for this version.
- One generic spin animation for all tricks.
- Giant empty open world.

## Audio

Required:

- Wheel roll loop.
- Jump pop.
- Landing sounds.
- Grind scrape.
- Trick whoosh.
- UI click.
- Crash/tumble.

Nice-to-have:

- Crowd cheer on big combos.
- Different wheel sounds for concrete, wood, metal, and street.
- Music toggle.

## Technical Direction

### Web Prototype Option

Use one of:

- Plain HTML/CSS/JS with canvas for a simpler fake-3D prototype.
- Three.js for a real browser 3D prototype.

If using Three.js:

- Keep the map small.
- Use simple collision boxes.
- Use basic character/scooter meshes.
- Use separate object transforms for rider, deck, and bars.

### Unity Option

Recommended for the family-friendly 3D prototype.

Reasons:

- Easier controller setup.
- Easier camera follow rigs.
- Good for Mac and Windows development.
- Better path to consoles once official access exists.

Suggested Unity packages:

- Cinemachine for cameras.
- Input System for keyboard/controller support.
- ProBuilder for greybox skatepark geometry.

### Unreal Option

Use only if the available PC/Mac can run it comfortably.

Reasons to use Unreal:

- Strong third-person template.
- High visual ceiling.
- Good console reputation.

Risks:

- Larger downloads.
- Heavier editor.
- More complex for a first 3D scooter game.

## PlayStation Reality Check

To ship on PS4 or PS5:

- You need approval through PlayStation Partners.
- You need Sony platform SDK access.
- You need PlayStation development/test hardware.
- You need to follow Sony technical requirements and certification.
- You cannot publish a normal PS4/PS5 game just by copying an HTML file to a console.

Best plan:

1. Build the prototype on Mac/Windows.
2. Make the game fun with controller support.
3. Record gameplay.
4. Apply to PlayStation Partners with the prototype and pitch.
5. Port after approval.

## Milestones

### Milestone 1: Separate Web Prototype

- Add `public/scoot-world/index.html`.
- Add a small rideable test area.
- Add third-person follow camera.
- Add first-person camera toggle.
- Add jump.
- Add one ramp.
- Add 3 second trick cooldown.
- Add Tail Whip, Bar Spin, 180, and Bri placeholder animation.

### Milestone 2: Trick Animation Upgrade

- Replace placeholder tricks with separate scooter/body animation parts.
- Add real Bri flip motion.
- Add landing quality.
- Add crash/reset.
- Add cooldown UI.

### Milestone 3: Small World

- Add indoor skatepark.
- Add outdoor street zone.
- Add rails, stairs, ledges, boxes, and curbs.
- Add coins and shop.
- Add controller support.

### Milestone 4: Unity/Console Prototype

- Rebuild or port the prototype in Unity.
- Use a real third-person controller.
- Use Cinemachine camera modes.
- Use a rigged rider/scooter model.
- Export Windows/Mac builds for testing.

### Milestone 5: PlayStation Preparation

- Prepare a short pitch.
- Prepare gameplay video.
- Prepare build notes.
- Apply to PlayStation Partners.
- After approval, evaluate PS4 vs PS5 support.

## Acceptance Criteria

The new version is acceptable when:

- The old SCOOT game still works unchanged.
- The new version has its own path or project folder.
- Third-person camera is the default.
- Camera can switch to first-person with one button.
- Tricks have a visible 3 second cooldown.
- Bri flip has a distinct animation plan and is not a generic flip.
- The game is playable with keyboard and controller.
- A player can ride, jump, trick, land, score, and reset.
- The README or project notes list the new local URL.
