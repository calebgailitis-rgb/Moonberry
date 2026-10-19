# Moonberry

An original cozy browser game about building a life in a lunar village. Farm unusual plants, make robot friends, explore ancient ruins, and turn a small habitat into your own home.

**Play:** https://calebgailitis-rgb.github.io/Moonberry/

## The current update

- Original illustrated tools, seed packets, crops, and materials, shared across the item bar, shop, and dropped items.
- A larger safe village with five residents and thirteen village landmarks, including a cafe, community hall, clinic, library, park, plaza, landing pad, workshop, and request board.
- Ten neighbor requests with progress tracking, trust/credit rewards, and follow-up chapters. Requests never expire. Up to three can be active.
- A walkable habitat with movable furniture, free wall/floor palettes, and indoor crop pots.
- Buildable outdoor paths, fences, lanterns, benches, and raised beds. Reclaiming pieces refunds their materials.
- Useful robot work orders, repeat deliveries, and standing jobs that resume after resting.
- Health, oxygen, rent, equipment upgrades, rare seed drops, exploration, and save import/export.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrows | Walk; hold to keep moving |
| 1–8 / item-bar click | Equip a carry slot |
| Space | Use the equipped item, or place a chosen blueprint |
| E | Talk, interact, gather, use the bed/cabinet |
| B | Decorate your home or build outdoors |
| R | Eat one equipped harvested crop: +10 health and +20 energy |
| Q | Drop a seed, crop, or material stack |
| M | Open your explored chart |
| Escape | Finish blueprint placement / close a dialog |

Touch direction and action buttons are available below the world. Expand world hides the notebook; Show notebook restores it. Days advance only when you rest. Nothing drains while idle or while the game is closed.

## A first moonday

1. Equip the hoe and use Space on open moon dust to till a bed underfoot.
2. Equip a seed stack to plant, then the bucket to water. A watered crop grows one stage each rest. Dry plants wait; crops never wither.
3. Walk onto your habitat door at **(9,10)** to go inside. Use E near the bed to rest, or use the Rest button while indoors.
4. Harvest a ripe crop using the bucket or a seed/crop stack. Visit Pip at **(17,10)** and press E to sell crops, buy seeds, sell materials, or upgrade equipment.
5. Meet the robot neighbors or visit the request board at **(19,8)**. Quests give a reason to explore, grow, craft, and help your neighbors.

## Make a home

Inside your house, move with the usual controls. Walk through the south doorway to leave. The supply cabinet accesses the same shared storage as the village chest.

Press B to choose free room colors, move existing furniture without charge, or build new furniture from carried/shared materials. Choose a blueprint, then click a tile or press Space to place it in front of you. Escape finishes placing. Door, bed, and storage access are protected against accidental blockage.

Starter furniture includes a bed, table, orbit rug, cabinet, potted plant, and reading lamp. Buildable furniture also includes a sofa and **indoor grow pots**. Stand beside a grow pot to plant with seeds, water with the bucket, and harvest when ripe. Indoor crops grow overnight like outdoor crops.

Outdoors, B offers paths, fences, lanterns, benches, and raised grow beds. Build within four tiles on revealed open ground. Fences affect player and robot routes. Reclaim the piece in front of you through the building menu to refund its materials to shared storage. Harvest an occupied raised bed before reclaiming it.

## Friends, trust, and quests

Mox, Bolt, Lumi, Nova, and Pico each have two requests. Chatting gives 10 trust once per day; gifting an equipped harvested crop gives 15 once per day. Quests award 20–30 trust plus credits. At 10 trust, a robot will help with jobs. At 60 trust, a close friend works twice as fast without a helper drone. Trust never decays.

Accept requests in the journal or through a neighbor's conversation. Return to that neighbor to turn in a completed request. Delivery items are counted across your carry slots and shared chest, and consumed only on successful turn-in. Exploration/crafting accomplishments are not consumed. Rewards can only be claimed once.

Robot jobs include watering, planting from shared seeds, harvesting, and gathering space wood, moon stone, or star fiber. Deliveries arrive at the shared chest at **(13,8)**. Enable repeat orders while talking to a nearby helper to repeat deliveries while resources last. Standing orders resume after rest; depleted resource nodes regrow after three moondays. Robots work while you walk/use tools, including while you are at home, and pause while idle/closed.

## Shared supplies and workshop

Visit the village chest at **(13,8)**, workshop at **(13,5)**, or your home's cabinet. Deposit an equipped stack, withdraw supplies, or craft these upgrades:

| Recipe | Cost from shared chest | Effect |
| --- | --- | --- |
| Moon sprinkler | 10 wood + 6 stone | Waters up to six planted beds within eight tiles of home before each rest |
| Helper drone | 12 wood + 8 fiber | Robots take work steps twice as often |

Home/outdoor building can use both carried materials and shared supplies. Tools, seeds, crops, and materials share exactly eight carry slots. Matching items stack. Full inventory prevents new stacks without deleting items. Resource/quest rewards that do not fit remain on the ground.

## Crops

| Crop | Watered nights | Seed price | Harvest value |
| --- | ---: | ---: | ---: |
| Moonberry | 2 | 8 | 24 |
| Wobble shroom | 3 | 14 | 42 |
| Eye of Saturn | 4 | 22 | 70 |
| Void trumpet | 5 | 30 | 105 |
| Comet melon | 3 | Rare drop | 95 |
| Prism fern | 4 | Rare drop | 125 |

The two rare seeds are dustling drops. Each defeat independently has a 10% chance to drop one of these seeds. The level-one laser has range six, deals one damage, and is blocked by rocks. Dustlings have two health.

## Survival and lease

The larger village is safe from dustlings (surface x 5–30, y 2–19). Wilderness spawn checks are far apart, only one dustling can be active, and a fresh game/overnight rest gives 180 actions before an encounter check. Attacks deal four health.

Oxygen drains one every two movement/tool actions outside. At zero oxygen, each action outside causes five health damage while you can still retreat. At zero health, the emergency tether brings you into your habitat. Rest indoors to recover health, oxygen, energy, and bucket water. Crops can be eaten for health/energy; they do not refill oxygen.

Rent starts at 80 credits, is due at the end of every seventh day, rises by 20 per week, and caps at 200. Paying early covers the current week. Unpaid rent carries forward without eviction. A bankrupt homestead with no remaining seeds, crops, or harvest receives recovery seeds after resting.

## Research-informed direction

[Player feedback and design notes](PLAYER_RESEARCH.md) document a small qualitative review of firsthand player discussions and the official Stardew Valley feature description. The priorities are autonomy, relationships, visible progress, personal spaces, and optional automation. Moonberry uses original art and systems; the research does not establish that it is better than a complete commercial farming RPG.

## Saves and running locally

Progress saves on this browser. Export a JSON backup to move between devices or addresses; import restores a validated save. Existing versions upgrade while preserving crops, money, inventory, trust, jobs, and discoveries. Interiors, themes, furniture, outdoor pieces, repeat orders, and quests are included in saves. Clearing browser storage removes local progress.

Open index.html directly, or run `npm start` and visit http://127.0.0.1:4173. There are no dependencies, API keys, accounts, or paid runtime services. Optional Google Fonts fall back to system fonts offline.

## Verification and publishing

`npm test` runs 54 simulation tests for farming, economy, inventory, survival, combat, jobs, quests, trust, interiors, placement safety, repeat work, indoor growing, construction/refunds, and save upgrades. Browser checks cover dialogue, a complete exploration-quest turn-in, house entry, theme persistence, item artwork, and responsive layouts.

GitHub Pages publishes main / (root). Keep the repository public for GitHub Free hosting. To configure a new copy: Settings → Pages → Deploy from a branch → main → / (root) → Save. See [GitHub's publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Still to build

This is an evolving single-player browser game. Seasons/weather, fishing, animals, cooking, broader stories/skills, audio, cloud saves, multiplayer, and a larger range of art/animations remain future work.
