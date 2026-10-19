# Moonberry development notes

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
