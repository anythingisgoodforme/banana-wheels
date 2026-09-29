# Afterhours Garage

A small car-care game: restore a rusty 1978 Comet, fit its essentials, and let it explore while you're away. Static HTML, CSS and JavaScript, with an original procedural rotating car rendered on Canvas.

## Play

Run `npm ci`, then `npm run dev`, and open http://localhost:8000/games/afterhours-garage/.

1. Adopt the Comet for £400, then press **Scrub rust** four times.
2. Fit the six essential parts in **Needed**. The default £1,500 covers everything.
3. Switch tabs, minimise the browser, or close the game. Driving happens only while this page is hidden or closed. Return and press **Collect** to move earnings to your bank.
4. Upgrade parts, check **Car activity**, and keep the body and tyres healthy. Missing or broken essentials stop driving. Wash for free; replace worn tyres in the shop.
5. **Car facts** has repeatable questions rewarding £40. You can always recover from selling essential parts.

Drag the car with mouse or touch, or focus it and use left/right arrows. Reduced-motion settings disable automatic rotation. **Repair me** marks missing/broken essentials on the car and provides named repair buttons; choosing one opens that part in the shop. **Start a new garage** asks before deleting the save.

## Change the starting money

Edit `CONFIG.STARTING_MONEY` at the top of **model.js** (default `1500`). It applies to new garages; use **Start a new garage** to try it with a fresh save. `CONFIG.CAR_PRICE` sets the starter car price. Prices and the 201-part catalog are also in that file.

`rate()` controls hourly earnings. `settle()` controls rust, driving wear, and the 72-hour maximum absence. Basic tyres last 20 driving hours; tier 2 lasts 40 and tier 3 lasts 60. Other parts wear more slowly. Rust takes 72 hours to go from clean to fully rusty, including time in the garage. Driving stops when an essential fails or rust reaches 100%. Cleaning remains free. Three routes unlock as hourly earnings increase; route illustrations and summaries are in `game.js`.

The six required entries represent major assemblies. Other components are collectible upgrades, not an engineering claim that cars can function without all their internal components. This release has one car with 201 named parts and three levels per part. It uses card-like part progression rather than competitive Top Trumps rules.

## Saves and offline simulation

Progress is saved in this browser's local storage. Offline driving is calculated on return; no server or actual background process runs. Normal page hiding/closing records the departure time. Browser crashes, storage clearing or blocked storage may lose progress. On browsers supporting Web Locks, a second garage tab displays a reminder to use the first one, preventing duplicate rewards. Otherwise use one open garage tab at a time. Saves do not sync between devices. The clock is local and this is a friendly single-player game, not an anti-cheat economy.

## Credits

Car model, interface, track diagrams and game code are original work for this repository, covered by its MIT license. No downloaded car assets, fonts, external runtime dependencies or third-party model licenses are required. The model is fictional and not associated with a car manufacturer.

## Checks

`npm test -- --runInBand` includes game-owned tests for affordability, the catalog, away-only earnings, duplicate settlement, essential sales, wear limits and upgrades. `npm run build` publishes this game under `dist/games/afterhours-garage/`, excluding tests.
