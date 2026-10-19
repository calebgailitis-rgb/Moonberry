# Moonberry development notes

## v7.2 — Everything on screen

Moved the real eight-slot backpack beside the world. Shared chest contents (materials, seeds and harvest), upgrade levels and installed workshop equipment appear below it. Expanded play retains the inventory. Inventory selection uses the existing carry slots and preserves storage proximity rules. On phones all eight carry slots dock at the bottom while the world stays visible. Browser checks verified click-to-equip, a real wood deposit (bag 2 to 0, chest 0 to 2), expanded mode, 390px layout without overflow, and no console errors.

## v7 — A crew worth finding

Each of eight original characters now has one distinct specialty. Existing five remain known and keep their jobs. Tali (stone), Wisp (fiber) and Orbit (scouting) wait outside the village; walking within three tiles discovers them, a chat earns initial trust, and an explicit invitation recruits them.

Friendship at 10/30/60/90 affects actual simulation: gathering batches of 4/5/6/7 in a specialty, faster work intervals, extra farming steps at 60/90, wider scout radius, and stronger health care. General jobs remain available; care and scouting need their specialists. Existing jobs, supplies, homes, requests and reply memories survive migration.

Validation: 79 simulation tests, including actual discovery by movement, chat/invitation gating, specialist deliveries, care without oxygen generation, scouting without remote recruitment, farming bursts, and migration from five-person v6 saves. Browser play-test found Orbit, chatted, invited them and successfully assigned scouting, with no console errors.

Scheduled work is bounded through October 18, 2026, 10:37 PM America/New_York (02:37 UTC October 19). Respect this deadline and newer user directions.

## v6 — Neighbors with a little heart

Shipped: bottom-screen conversations with five original pixel portraits, branching replies, remembered choices, rotating daily lines, stories at 30/60 trust, and context-aware gardening/survival advice. Oxygen drains every ten outdoor actions (five times slower). No oxygen, energy or simulation time passes during chats. Old saves upgrade without losing progress.

Art pass: chunkier pixel crops and expressive astronaut/robot sprites, pastel lunar ground, stepped dome roofs and foliage, window boxes, flowers, moonmoths, tool-success sparkles, warm pixel-framed UI.

Validation: 66 simulation tests pass. Browser checks covered chat branches, daily trust cap, 30-trust story, remembered reply after reload, helper menus, and a 390px phone layout without horizontal overflow.

## Design direction

Primary goal: make the repeated actions enjoyable and the world feel personally owned. Original art and writing; genre inspiration only. Stardew Valley's official feature overview emphasizes customizable farms, character routines and unfolding friendships, meaningful skill progression, mysteries, and community work: https://www.stardewvalley.net/about/ . Moonberry adapts the friendship progression with original robot stories, player reply memory and no survival drain while talking.

Prioritize visible feedback, friendly neighbors, freedom to build, and rewarding discoveries. Do not mistake feature count for fun. Preserve the peaceful village, permanent exploration, forgiving rent, existing saves and eight-slot inventory.

## Next useful play-test questions

- Is the first successful moonberry harvest obvious and satisfying for a new player?
- Do resource-gathering and helper jobs reduce repetitive work without removing player choice?
- Would a small discovery collection or village celebration create a stronger reason to explore? Choose one coherent improvement, not all of these at once.
- World objects currently render in broad groups. Inspect depth/overlap around buildings before adding more clutter.
- The game is a prototype; commercial quality requires more content, balancing, usability testing and original audio. Do not claim it exceeds a finished commercial game.
