# Moonberry

An original, playable 2D cozy lunar farming and exploration game. Your habitat sits on a mossy patch of moon. Grow peculiar alien plants, trade with Pip, pay recurring lunar rent, and uncover three ancient memories.

## Play

### Version 3: Mossfield Village

Mossfield is now a peaceful settlement with connected walking paths, a workshop, neighbor cottages, and a shared supply chest. **Mox**, **Bolt**, and **Lumi** are original robot residents with their own dialogue, friendship, positions, and work orders. Press **E** near a neighbor to talk. Chatting gives **10 friendship once per day**; gifting an equipped harvested crop gives **15 once per day**. At **10 friendship**, you can assign a job:

- Water all planted beds that need it.
- Plant empty beds using seeds deposited in the shared chest.
- Harvest a ripe crop and bring it to the chest.
- Gather a batch of **space wood**, **moon stone**, or **star fiber**, and deliver it to the chest.
- Return to the chest and stop working.

Robots follow actual traversable paths and work as the player walks or uses tools. They do not work while the game is idle or closed. Resource/harvest jobs finish after one delivery; water/plant jobs continue until no eligible beds remain. The notebook shows who is working. After completing a job, a helper gains one friendship point. You must stand nearby to chat, give gifts, or assign jobs.

**Shared supplies:** visit the chest at **(13,8)** or workshop at **(13,5)**. Deposit an equipped seed, crop, or material stack; withdraw stored stacks into your eight carry slots. Robot deliveries arrive here without using your carry slots. E next to a resource node gathers three units; taken nodes recover after three moondays. Sell carried materials at Pip’s, or save them for workshop recipes:

| Recipe | Shared materials | Effect |
| --- | --- | --- |
| Moon sprinkler | 10 wood + 6 stone | Waters up to six planted beds within eight tiles of home before resting |
| Helper drone | 12 wood + 8 fiber | Robots take work steps twice as often |

**Quieter combat:** the entire settlement (x 6–20, y 3–17) is safe from dustlings. A fresh game or overnight rest allows **180 actions** before a possible encounter. Later spawn checks are **120–200 actions** apart, only in the wilderness or cave, and there can be **only one dustling**. Each attack deals **4 health**, reduced from 10. Zero-oxygen damage remains 5 per action outside the house.

**Smoother presentation:** continuous held-key/touch movement, interpolated player and robot positions, eased camera tracking, four player-facing views with walking animation, debounced saves, and cached interface rendering. Narrow screens use a closer camera view. **Expand world** hides the notebook for a larger play area; **Show notebook** restores it. Seed details are tucked into a collapsible almanac.

v1 and v2 saves retain crops, inventory, credits, days, and discoveries when upgraded. Existing dustlings are cleared as the village is introduced. New village fields, friendships, jobs, cargo, materials, gathered nodes, and recipes are included in save export/import.

### Version 2: make the moon your own

The game now starts with an **eight-slot inventory**, a **hoe**, a **water bucket (12 uses)**, a **level-one laser**, and two seed stacks. Select slots with **1–8** or click/tap the item bar. Matching seeds and crops stack; a new type needs an empty slot. **Q** drops a selected seed/harvest stack; **E** picks it up nearby. Tools stay with you. Full inventory blocks purchases and harvesting without deleting anything. Reward seeds that cannot fit wait on the ground.

There are no fixed garden beds in new games. Equip the **hoe (1)**, stand on open moon dust, and press **Space** to till underfoot. Equip a **seed stack (4 or 5 initially)** and press Space to plant; equip the **bucket (2)** and press Space to water. Use the bucket or a seed/harvest stack to harvest a mature plant. Buildings, rocks, crystals, and caves cannot be tilled.

**Health, oxygen, and bucket meters** sit above the world. Oxygen drains by one every two movement/tool actions, while idle or closed games pause. At **zero oxygen**, each action outside causes **5 health damage**, and you can still walk home. Dustling attacks now deal 4 health outside the safe village. At zero health, the emergency tether returns you inside the house; it does not refill your meters. Walk onto the habitat at **(9,10)** and press **E** to rest inside. Only this rest advances the day, grows watered crops, and refills health, oxygen, energy, and bucket water.

Rare wilderness **dustlings** follow the quieter v3 encounter rules above. Equip the **laser (3)**, face one with a movement key, and press Space. It deals one damage, has a six-tile range, and cannot shoot through rocks. Two hits defeat a dustling. **Each defeat independently has a 10% chance** to drop a rare seed: **Comet melon** (3 nights, sells for 95 cr) or **Prism fern** (4 nights, 125 cr). Pick up the seed with E. These seeds are not sold in the shop.

Unexplored terrain is covered by drifting **silver moon dust**, which clears permanently as you explore. Existing v1 saves automatically receive tools, health, and oxygen while preserving day, credits, discoveries, and planted crops. Overflow stacks wait at the house and can be collected from an adjacent tile. v1 export files can also be imported.

The controls below describe the original release; use the v2 tool and inventory controls above for the current version.

Open `index.html` in a modern browser, or run `npm start` and visit http://127.0.0.1:4173. No dependencies, API keys, accounts, build tools, or paid services are required. Optional Google Fonts fall back to local system fonts when offline.

- **WASD / arrows:** walk. Touch direction buttons are also available.
- **Space:** use the selected tool or seed on the bed underfoot (or adjacent).
- **1–8:** equip an inventory slot. The item bar buttons work too.
- **E:** interact with a nearby habitat, trading post, cave, ruin, or crystal.
- **M:** surface chart. Discovered tiles stay revealed.
- **Rest until tomorrow:** works inside the habitat at (9,10); watered plants grow and all survival meters refill. Time never advances while the game is closed.

Your habitat is at (9,10), Pip is at (17,10), and you choose where your garden beds go. The Humming Hollow lies northeast. Two ancient surface gardens and one cave memory await discovery. Completing all three finishes the exploration story; farming continues indefinitely.

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

Run `npm test` (Node 18+). All **33 tests** cover the original farming economy, exploration, v2 inventory/survival, and v3 safe village, rare combat, friendship, gifts, real robot job deliveries, shared supplies, resources, recipes, and save upgrades. Browser interface and artwork are in `game.js`; `engine.js`, `survival.js`, and `village.js` build up the simulation in release order.

## Scope

Original single-player lunar village game with procedural canvas artwork, touch controls, a field journal, a surface chart, save import/export, and reduced-motion support. Farming, exploration, inventory, survival, robot friendships/jobs, materials and two workshop recipes are playable. Seasons/weather, fishing, animals, broader crafting/building, quests, skill progression, cloud saves, multiplayer, gamepad support, and audio remain future work. This is an evolving browser game; the full scope of a large commercial farming RPG is not implemented.
