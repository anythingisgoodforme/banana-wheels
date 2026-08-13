# Car Game V2

A revamped browser driving game prototype for the next Banana Wheels game iteration.

Drive a pickup truck through changing city lanes, collect up to 20 bananas in the truck bed, dodge other cars, and keep the combo meter alive. Buying Magnet raises the truck capacity to 50 bananas. When the truck bed is full, park in the shop square to automatically sell bananas for $20 each. A shield protects the truck while bananas are actively selling and stays on for 3 seconds after the last banana is sold. Spend money on Turbo and Magnet upgrades to make the truck stronger. The finish line is exactly 100000 score. Do not sit on a dashed lane stripe for 3 seconds, or the police car catches you. Braking on the stripe gives 4.5 seconds before the police shoot. The game is self-contained and runs with plain HTML, CSS, and JavaScript.

## Play

Open `index.html` from this folder in a browser.

Controls:

- Arrow keys or WASD: steer, accelerate, and brake
- Space: turn AI driving on or off
- Shift: boost when the boost meter is charged
- P or Escape: pause
- Enter: restart after a crash
- Money buttons: buy Turbo and Magnet upgrades
- Touch controls appear automatically on smaller screens

When AI driving is on, it uses any trained server policy it can load, then keeps practicing while it drives. The in-game practice goal is 1 hour. As practice increases, the AI looks farther ahead and gives enemy cars stronger danger scores.

## Project Layout

- `index.html` - game shell and HUD
- `styles.css` - responsive layout and controls
- `src/input.js` - keyboard and touch input
- `src/game.js` - canvas game loop, rendering, collisions, and scoring
- `trainer/ai-trainer-server.js` - separate local AI training server
- `assets/` - lightweight SVG game art

## AI Training Server

Run a separate local trainer:

```bash
cd /Users/matteo/Documents/Code/banana-wheels/games/car-game-v2
AI_AUTO_START=1 AI_NOTIFY_EMAIL=matteo.t.s.samuel@gmail.com node trainer/ai-trainer-server.js
```

Or start it manually by opening `http://127.0.0.1:4191/start`.

For a 1-hour danger-car training run:

```bash
cd /Users/matteo/Documents/Code/banana-wheels/games/car-game-v2
AI_AUTO_START=1 AI_EXIT_ON_FINISH=1 AI_TRAIN_MS=3600000 AI_NOTIFY_EMAIL=matteo.t.s.samuel@gmail.com node trainer/ai-trainer-server.js
```

The trainer writes `trainer/out/banana-ai-driver.json` while it runs. The browser game loads that file from the same game server, so Space starts the AI with the server-trained danger-car settings and then keeps improving during play.

## Notes

The pickup truck has a real forward world position. Bananas, traffic cars, and the shop stay in world positions instead of being moved down the screen directly.

No dependencies are required. Generated files, dependency folders, logs, caches, and Playwright artifacts are ignored by this project.
