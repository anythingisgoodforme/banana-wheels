# Afterhours Garage

A small car-care game: restore a rusty 1978 Comet, collect 21 more rides, fit their parts, and let them explore while you're away. Static HTML, CSS and JavaScript, with original procedural cars rendered on Canvas.

## Play

Run `npm ci`, then `npm run dev`, and open http://localhost:8000/games/afterhours-garage/.

1. Adopt the Comet for £400, then press **Scrub rust** four times.
2. Choose each of the six essential parts in **Needed**, then tap its highlighted place on the car to fit it. The default £1,500 covers everything, and money is charged only after you tap the car.
3. Switch tabs, minimise the browser, or close the game. Driving happens only while this page is hidden or closed. Return and press **Collect** to move earnings to your bank.
4. Upgrade parts, check **Car activity**, and keep the body and tyres healthy. Missing or broken essentials stop driving. Tutorial scrubbing is free; later **Wash & protect** treatments cost £1,000. Replace worn tyres in the shop.
5. **Car facts** has repeatable questions rewarding £40. You can always recover from selling essential parts.
6. **Daily news** lets you search for a country and loads its current Google News headlines. Choose a country from the suggestions; stories open through Google News. Each country's edition is cached for the day, with a retry option if the feed or internet connection is unavailable.
7. **Car news** loads current motoring headlines and longer feed excerpts from [Car and Driver's official RSS feed](https://www.caranddriver.com/rss/all.xml/). A fresh edition is fetched on each new calendar day. Stories open on the publisher's site, and the game shows a retry screen if the feed is unavailable.
8. Use **Dark / Light** in the top bar to change the whole garage theme. The choice is remembered on this browser.

Press **Garage** over the car to browse all 22 vehicles. Cars unlock as lifetime road earnings reach their price and are bought with bank money. The final **Nebula Hyper** costs £21,000. Each vehicle keeps its own fitted parts and condition. Compare desirability, power, speed, safety and seats on the Top Trumps-style scales; stronger cars earn more while away. **Sell car** appears at the top of the collection and asks for three confirmations. Standard cars return 90% of their recorded purchase and parts investment. High-exoticness cars can appreciate; the spec score determines the resale multiplier.

If a car, part, upgrade or wash costs more than the current balance, the garage shakes and flashes red for one second. Reduced-motion mode keeps the red flash without the shake.

On desktop, the car garage and the shop have separate scroll areas: place the pointer over the side you want to move, then scroll. On mobile they stack into one normal page.

Drag the car with mouse or touch, or focus it and use left/right arrows. Reduced-motion settings disable automatic rotation. Every new part, replacement and upgrade must be placed on the highlighted area of the car; press Enter or Space while the car is focused for an accessible alternative. The car pauses while a part is waiting to be fitted. The engine spins above the bonnet while selected; tap either the engine or the bonnet target to drop it into place. Engine and electrical parts use the front, tyres and running gear use a wheel, cabin parts use the roof, and body parts use their body area. **Repair me** marks missing/broken essentials on the car and provides named repair buttons; choosing one opens that part in the shop. **Start a new garage** asks before deleting the save.

## Change the starting money

Edit `CONFIG.STARTING_MONEY` at the top of **model.js** (default `1500`). It applies to new garages; use **Start a new garage** to try it with a fresh save. `CONFIG.CAR_PRICE` sets the starter car price and `CONFIG.WASH_PRICE` sets the later wash price. Prices and the 201-part catalog are also in that file.

`rate()` controls hourly earnings. `settle()` controls rust, driving wear, and the 72-hour maximum absence. Basic tyres last 20 driving hours; tier 2 lasts 40 and tier 3 lasts 60. Other parts wear more slowly. Rust takes 72 hours to go from clean to fully rusty, including time in the garage. Driving stops when an essential fails or rust reaches 100%. The initial restoration scrubs remain free; maintenance washes cost `CONFIG.WASH_PRICE`. Nine named tracks are split across three earning tiers and unlock as hourly earnings increase; route illustrations and summaries are in `game.js`.

The six required entries represent major assemblies. Other components are collectible upgrades, not an engineering claim that cars can function without all their internal components. The garage has 22 car profiles and a shared catalog of 201 named parts with three levels per part. Spec scales affect away earnings and resale value; the game is not a competitive Top Trumps game.

## Saves and offline simulation

Progress, car ownership, and each car's parts are saved as browser-local JSON in local storage. A database or server is not needed for this single-player offline version. Offline driving is calculated on return; no server or actual background process runs. Normal page hiding/closing records the departure time. Browser crashes, storage clearing or blocked storage may lose progress. On browsers supporting Web Locks, a second garage tab displays a reminder to use the first one, preventing duplicate rewards. Otherwise use one open garage tab at a time. Saves do not sync between devices. Online play with friends would need a hosted backend and shared database. The clock is local and this is a friendly single-player game, not an anti-cheat economy.

## Credits

Car model, interface, track diagrams and game code are original work for this repository, covered by its MIT license. No downloaded car assets, fonts, external runtime dependencies or third-party model licenses are required. The model is fictional and not associated with a car manufacturer.

## Checks

`npm test -- --runInBand` includes game-owned tests for affordability, the catalog, away-only earnings, duplicate settlement, essential sales, wear limits and upgrades. `npm run build` publishes this game under `dist/games/afterhours-garage/`, excluding tests.
