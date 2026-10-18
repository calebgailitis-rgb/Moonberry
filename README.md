# Moonberry

An original, playable 2D cozy lunar farming and exploration game. Your habitat sits on a mossy patch of moon. Grow peculiar alien plants, trade with Pip, pay recurring lunar rent, and uncover three ancient memories.

## Play

Open `index.html` in a modern browser, or run `npm start` and visit http://127.0.0.1:4173. No dependencies, API keys, accounts, build tools, or paid services are required. Optional Google Fonts fall back to local system fonts when offline.

- **WASD / arrows:** walk. Touch direction buttons are also available.
- **Space:** plant the selected seed on the bed underfoot (or adjacent), water it, or harvest a ripe crop.
- **1–4:** choose seed. The satchel buttons work too.
- **E:** interact with a nearby habitat, trading post, cave, ruin, or crystal.
- **M:** surface chart. Discovered tiles stay revealed.
- **Rest until tomorrow:** watered plants grow, suit energy refills, and the next day begins at home. Time never advances while the game is closed.

Your habitat is at (9,10), Pip is at (17,10), and the garden beds span (10–14,12–15). The Humming Hollow lies northeast. Two ancient surface gardens and one cave memory await discovery. Completing all three finishes the exploration story; farming continues indefinitely.

## Farming and lease

| Crop | Watered nights | Seed price | Harvest value |
| --- | ---: | ---: | ---: |
| Moonberry | 2 | 8 | 24 |
| Wobble shroom | 3 | 14 | 42 |
| Eye of Saturn | 4 | 22 | 70 |
| Void trumpet | 5 | 30 | 105 |

Water each crop before resting to advance growth. Dry plants pause; plants never wither. Harvesting clears a bed. The moonwater kit reduces watering energy and doubles yields at level two. Boots reduce walking energy costs; the scanner expands discovery radius.

Rent is due when resting at the end of every seventh day. It starts at 80 credits, rises by 20 each week, and caps at 200. Pay with the lease card. Paying early covers the current week only. Unpaid amounts carry forward as debt; you are never evicted or prevented from exploring. If you run out of credits, seeds, plants, and harvested crops, Pip supplies three recovery seeds after resting.

## Saves

The game automatically stores progress in this browser's `localStorage` after every action. Use **Export save** for backups and **Import save** to restore a validated JSON file. Saves are local to each browser and website address, so export before switching from a local copy to GitHub Pages. Clearing browser data clears local progress. Imports and new-game resets ask before replacing progress. If browser storage is blocked, export manually.

## Free GitHub Pages deployment

1. Keep this repository public for GitHub Free hosting.
2. Open repository **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose **main**, folder **/ (root)**, then **Save**.
5. Wait for the Pages deployment to finish, then use the **Visit site** link. For this repository the expected address is https://calebgailitis-rgb.github.io/Moonberry/ .

The game uses relative asset paths and `.nojekyll`, so it works directly under a project Pages URL. No custom workflow is needed. Publication can take several minutes. See [GitHub's official instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Verification

Run `npm test` (Node 18+) to verify farming, growth, sale prices, weekly rent and arrears, spending limits, upgrades, fog persistence, route reachability, unique exploration rewards, save validation, and recovery seeds. Browser interface and artwork are in `game.js`; the independently testable deterministic simulation is `engine.js`.

## Scope

First playable single-player release. All sprites are original procedural canvas artwork. Includes responsive controls, a field journal, a surface chart, save import/export, and reduced-motion support. No cloud saves, multiplayer, gamepad support, or audio yet.
