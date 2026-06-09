Build a self-contained scooter trick game as a single HTML file called scooter-game.html.

It was designed by a kid and must include everything from his spec:

TRICKS (buttons on screen + keyboard shortcuts):
- Tail Whip, Front Flip, Back Flip, 180, 360, Bar Spin, Bri, No-Handing, Slap the Finger, Grind
- Each trick shows an animated toast message on screen with the trick name
- Jump button (SPACE bar) — tricks only score if you're in the air
- Combo multiplier: chain tricks within 2.5s to multiply score

SCREENS:
- Start screen: Play button, Settings, About the Game
- Game screen (see below)
- Settings screen: toggle FPS display, toggle timer, toggle wind, toggle birds
- Shop screen: buy scooters and grip tape with earned coins
- About screen: describe the game

GAME SCREEN includes:
- Score display + combo counter
- FPS counter (top right, toggleable)
- In-game timer (toggleable)
- Coin counter (earned from tricks)
- A visible scooter/player character that animates on tricks (flip/spin CSS animation)
- Teleport button that flashes white and switches between indoor/outdoor
- Switch environment button

OUTDOOR ENVIRONMENT:
- Blue sky gradient background
- Green ground
- Trees on left and right sides (CSS drawn, not emoji)
- Plant decorations
- Animated clouds drifting across
- Animated bird flying across (toggleable)
- Wind system: randomly switches between calm/weak/strong every ~7s, trees sway with CSS animation based on wind strength
- Wind strength indicator shown briefly when wind changes

INDOOR ENVIRONMENT:
- Dark purple/grey background
- Concrete floor
- Hanging lamp lights with glow effect
- Graffiti tag

FURNITURE (both environments):
- A half-pipe/ramp (CSS drawn)
- Two boxes (CSS drawn)
- A grind rail (CSS drawn with legs)

SHOP:
- 6 items: Red Scooter (500 coins), Fire Scooter (1200), Rocket Scooter (2500), Black Grip Tape (200), Neon Grip Tape (350), Gold Grip Tape (800)
- Buying a scooter changes the player emoji
- Shows owned state

TECHNICAL REQUIREMENTS:
- Single HTML file, no external dependencies (no Google Fonts, no CDN, no npm)
- Use system fonts only (system-ui, sans-serif)
- Pure HTML + CSS + vanilla JavaScript only
- Must work when opened directly in a browser (file://)
- No black screen issues — test that all screens render correctly
- CSS animations for: trick flips, trick spins, grind bob, cloud drift, bird fly, wind sway, toast pop, teleport flash
- Keyboard: SPACE=jump, T=tail whip, F=front flip, B=back flip, 1=180, 3=360, S=bar spin, N=no-handing, G=grind, P=teleport

Make it look cool — dark theme, orange/yellow accent colours, bold typography using font-weight:900, glowing effects on score, trick toast text is big and punchy. The overall vibe should feel like a real indie game start screen.

Output only the single HTML file. No explanation needed.