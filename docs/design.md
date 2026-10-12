# Pineapple Defense: Design Brief (Draft 1)

Copyright © 2026 JNFoo. All Rights Reserved.
Brief date: 2026.10.12 (version stamps use year.month.day.HHMM, US Eastern)

## Status
Design phase. No code written and no checks or benchmarks run yet (held until the design is final).

## Decisions made (your answers)
- Audience and tone: kids first, all ages welcome. Silliness only: no cruelty, no gore, no blood, nobody gets hurt (corrected Oct 12, 3:31 PM; the earlier "splatted" wording is retired). Simple, addictive, free play.
- Look: glossy 3D toy sprites drawn on a 2D canvas, scaled by depth. Matches the Apple Press and Fancy style. Lightest option for Android Chrome, Firefox 158 and ungoogled-Chromium.
- Structure: stages of waves, with a boss penguin at the end of each stage. Short story cards between stages, upgrades between stages, saves and unlocks like Fancy.
- Repo: new public repo JNFoo/pineapple-defense (you create it; I attach it and push builds).
- Aiming: aim-assist hybrid. Flick direction picks the target area, flick speed sets power and flight time, with a gentle snap toward the nearest penguin.
- Stakes: a fruit stand with a friendly health meter. Penguins that reach the front line boop it and it wobbles and loses cheer; boss penguins boop harder. Cheered back up between stages. Nothing is smashed.
- Ammo: unlimited with a quick reload. Each pineapple type has its own cooldown. The rail gun uses a charge meter.
- Cast: real species first, then silly game-only types in later stages.

## From your original description
- First-person view from a fixed point. The weapon is never shown, only the pineapple projectiles.
- Controls in the main game: flick from the bottom of the screen toward the enemies (touchscreen or touchpad).
- Pineapple types vary: single-target, multi-target, dramatic arcs and flatter shots.
- Top upgrade: the world's first pineapple-firing rail gun.

## PROPOSED pineapple roster (needs your approval)
| Name | Targets | Arc | Cooldown | Notes |
|---|---|---|---|---|
| Classic Pineapple | 1 | Medium | Fast | Starter |
| Lobber Pine | 1 + small splash | High, dramatic | Medium | Lands on rows behind shields |
| Mini-Pine Cluster | Many | Medium, splits mid-air | Slow | Bursts into 5 minis near the target |
| Bowling Pine | A lane | Flat, rolls along the ice | Medium | Tumbles through a line of penguins and sends them all home (baked rolling frames from sprite-baker) |
| Juice Bomb | Area | High | Slow | Sticky puddle slows penguins |
| Rail Gun (top upgrade) | Whole column | Straight line, no arc | Charge meter | Pierces everything in a lane |

## PROPOSED penguin roster (needs your approval)
Real species (early stages):
- Adélie: basic and quick
- Chinstrap: steady walker
- Gentoo: fast sprinter
- Rockhopper: hops and dodges flat shots
- Macaroni: medium, takes 2 hits
- Little blue: tiny, arrives in swarms
- Magellanic: tanky, takes 3 hits
- Humboldt: slow and heavy
- (Emperor and King species dropped Oct 12: nothing royal anywhere. Yellow-eyed and Galápagos available as extra variants.)

Game-only (later stages):
- Jetpack: flies over flat shots
- Armored: helmet blocks flat shots, weak to arcs
- Splitter: splits into two small penguins
- Sled Slider: very fast, short warning
- Igloo Carrier: shield bearer that shelters those behind it

Bosses: one Penguin Champion per stage (Bronze, Silver, Gold, Platinum, Grand), with names and gimmicks to be decided. No kings, queens, emperors or admirals.

## Technical plan (efficiency first)
- One self-contained HTML file; 2D canvas; pointer events for touch, mouse and touchpad.
- Pre-render the glossy sprites once to offscreen canvases; no per-frame allocation; object pools; fixed-timestep update.
- Cap device pixel ratio and adapt quality automatically if the frame rate drops.
- Shared code pulled from JS-modules where it fits.
- Test targets: Firefox 158 on Windows (stress test), ungoogled-Chromium on Windows, Chrome on Android. Checks and benchmarks held until the design is final, then profiled to keep time and compute low.

## Decisions made, round 2 (2026.10.12.1527)
- Setting: a sunny tropical fruit stand on a sandy strip with a glacier shelf behind it; penguins march in from the ice.
- Art: reuse the JS-modules sprite kits (cartoon-3d-kit and sprite-baker first, then frame-kit, fx-governor and others as they fit). Check `modules.json` and the public page before writing any reusable code. Apple Press style guide to be attached by the owner so the penguins match.
- First beta: 5 stages (four themed plus a final boss stage), about 8 waves each.
- Saving: copy/paste save code and save file, like Fancy (save-kit from JS-modules). No sound or music in the first alpha; added later only with approval.
- Repo: https://github.com/JNFoo/pineapple-defense created by the owner on Oct 12 and attached to this session with push access.

## How we work (from the Master Guide)
- Plain words, short replies; every question asked with the multiple-choice pop-up, recommended option first.
- No checks or benchmarks while the design is open; run them once the design is final.
- Test targets: Firefox 158 (stress test), ungoogled-Chromium on Windows, Chrome on the Pixel; laptop first, phone second.
- Version stamps: year.month.day.HHMM in US Eastern. Copyright holder: JNFoo only. American English.
- Sessions follow AGENTS.md and TASKS.md rules (section 28 of the guide).

## Decisions made, round 3 (2026.10.12.1531)
- Premise (owner's own words): penguins despise tropical fruit because they can't eat it and can't go to the tropical zones. Played for slapstick envy, not cruelty.
- Stages: 1 Beach, 2 Ice flats, 3 Iceberg harbor, 4 Storm sea, 5 Glacier fortress. Each stage pushes the penguins closer to their home.
- Bosses: one big Penguin Champion per stage, each with a gimmick and a weak spot that a particular pineapple exploits (names and gimmicks still to be proposed).
- Pages: https://jnfoo.github.io/pineapple-defense/ is live (README only for now).
- Push access to the repo confirmed Oct 12 (commit 5bc738e).

## Look: the glossy 3D toy style (source: JS-modules `modules/cartoon-3d-kit/STYLE-GUIDE.md`)
The owner asked on Oct 12 that this style be understood and used. In one line: glossy, round, lit, squishy, calm background. Nothing is a real 3D model; every object is a flat shape that feels like a soft toy.
- **One light, upper left, on everything.** Radial gradient focus at 36% / 30%; soft shade pooled lower right; a tilted soft white gloss; one crisp white dot (without it things look matte); a thin bounced rim light on the right edge.
- **Three-tone ramps from one hue** (hi / mid / lo, plus glow and label), held in variables so a skin change is one switch. `lo` is deeper and more saturated, never gray or black.
- **Warm ink, never black.** All dark lines use `#2a120d`; stickers and the logo use a cream outline `#fff7e3`. (Fancy keeps its plum outline by the owner's choice; Pineapple Defense follows the guide unless he says otherwise.)
- **Faces:** big wide-set eyes set low (about 52% of the height), white catch-light on the upper right of each pupil in the same spot on every character, blush cheeks below and outside the eyes, a tiny low smile. Moods change eyes, mouth and cheek strength only, never the body.
- **One asymmetry per character** (a dimple, a lean, a curl) so nothing reads as clip art.
- **Squash and stretch on every touch:** 300 ms, scale 1.09/0.88 then 0.96/1.07, origin at the ground, volume kept about constant. Idle life with unequal loop lengths (bob 3.4 s, blink 4.6 s, wiggle 9 s).
- **Calm stage, loud hero:** scenery is pale, desaturated, flat layers (sky gradient, far hill, mid hill, ground, props, a 0.2 vignette); the pineapples are the most saturated things on screen. Contact shadows are separate blurred ellipses.
- **Juice:** pop numbers with overshoot, a ring on impact, little bits in three shapes with gravity. Sticker lettering for titles. Calm mode and reduced motion are part of the style, not optional polish.
- **Proposed palette notes (to confirm in a look test):** classic pineapple uses the guide's yellow ramp (hi `#fdf6ae`, mid `#fbec5d`, lo `#a38b12`, dark-brown label) with a flat green crown; each pineapple type gets its own ramp. Penguins use a deep blue-plum body instead of black, a cream belly and warm orange beak and feet.
- **Art technique (proposed):** draw characters and pineapples as SVG built from the guide's recipes, then rasterize each once at load into offscreen canvases at a few sizes for the depth scaling; use `sprite-baker` for the pieces that roll or spin (Bowling Pine, spinning flight frames, the rail-gun pineapple). Bake in idle slices with `frame-kit`'s JobPump so no frame hitches.
- No Apple Press characters or art are reused; only the style.

## Kid-safe tone and free play (rules, partly from the guide's section 20)
- **Silly, never cruel.** A pineapple hit "sends penguins home": a pineapple hat pops on, dizzy stars, a giggle, then the penguin slides home on its belly with a poof. Nobody is hurt, eliminated or splatted. Bosses sulk and flounce off. Penguins that reach the stand "boop" it and it wobbles; the stand is a cheerful meter, never "smashed".
- **Free means free:** no ads, no purchases, no accounts, no leaderboards. Upgrades are earned only by playing.
- **Addictive in a kind way:** short waves (about 20 to 60 seconds), instant feedback, combos, tiny upgrade steps, a clear "one more wave" moment. Not allowed: login streaks, daily appointments, missable limited-time items, random prize boxes, social comparison, run-ruining choices.
- **Losing is gentle:** retry without punishment, and progress is kept.
- **Safe to watch:** no more than 3 flashes in any second; Calm mode and OS reduced motion honored; no audio-only cues; big tap targets (at least 2 cm) and an optional tap-to-throw alternative to the flick for small hands (proposed).
- Story stays silly: the penguins are jealous because they can't eat tropical fruit or visit the tropics.

## JS-modules to use (owner said: use all you need)
Cloned read-only for this session from https://github.com/JNFoo/JS-modules (commit be68acd). Each module is one dependency-free file copied in at build time with its MIT header kept.
| Module | Use in Pineapple Defense |
|---|---|
| cartoon-3d-kit | The style guide above and its demo, as the visual reference |
| sprite-baker | Baked 3D roll and spin frames for pineapples |
| frame-kit | EvenDt for smooth motion, QualityGovernor, JobPump for baking in idle slices |
| fx-governor | Full / Lite / Calm effect levels, never stepping back up behind the player |
| env-probes | Canvas read-back, rounded timer, storage and reduced-motion checks (Firefox privacy mode) |
| save-kit | Safe saves, backup slot, copy/paste save code |
| sticker-text | Title and stage-card lettering |
| stage-curtains | Stage-change transitions (optional) |
| pad-nav | Controller menus (optional) |
| idle-core | Cost and milestone math for the upgrade shop (if it fits) |
| lzma-pack, single-file-tools | Shrinking the single shipped file |
| fuzz-kit, fuzz-play, marionette-lite | Bug hunts and Firefox driving, only once the design is final |
Not needed: hold-press (the control is a flick), fly-to-mini. Improvements to a module go back to JS-modules (needs that repo attached with push access).

## Decisions made, round 4 (Oct 12, afternoon)
- Pineapples all have happy faces (big glossy eyes, blush cheeks, tiny smile); they squeal "wheee!" in flight and look surprised on impact. Moods change eyes, mouth and cheeks only.
- Hit reaction: a pineapple-crown hat pops onto the penguin, dizzy stars orbit, it giggles and belly-slides home with a poof. Works for one penguin or a whole row.
- Rewards: Golden Pineapple points earned from every wave, spent on stand upgrades and new pineapple types. No random boxes, no streaks, no purchases.

## Decisions made, round 5 (Oct 12, 3:36 PM)
- No King or Queen penguins, and no royalty of any kind (no emperors or admirals either). The Emperor and King species are dropped from the roster; Magellanic and Humboldt take the tanky and heavy roles.
- Bosses are Penguin Champions of different levels, one per stage: Bronze, Silver, Gold, Platinum and Grand Champion. Each wears a bigger, shinier medal ribbon in its rank color so a child reads the rank at a glance (Grand uses a rainbow medal). Ramp colors follow the style guide's hi / mid / lo recipe.
- The main audience is kids; the game stays welcoming for all ages. Anything that needs reading is short and picture-first.
- Backgrounds include silly anti-pineapple and anti-tropical-island "propaganda" posters, drawn as flat toy-style shapes in the calm background layer (see next section).

## Propaganda backdrop (proposed content, needs approval)
Pure silliness: the penguins' own jealous signs, never mean and never about real people, real governments or real-world political styles. No real flags, symbols or slogans.
- **Poster art vocabulary:** a pineapple inside a red "no" circle, a crossed-out palm tree, a frowning sun with a snowflake, a penguin flexing next to a smiling fish, a thermometer shivering happily, a coconut with a sad face, a medal-wearing Champion pointing at you. Tilted a few degrees, taped at the corners, gently flapping in the wind.
- **Rendering:** drawn once as SVG shapes and baked into the background layer at load, so it costs nothing per frame. Pale and low-contrast so the glossy pineapples stay the loudest thing on screen. Sticker lettering for slogans (sticker-text style).
- **Slogans (short and picture-first; first drafts):**
  - Stage 1, Beach: "Brrr Is Best!", "No Pineapples On Our Shore!", "Palm Trees? No Thank You!"
  - Stage 2, Ice flats: "Cold Toes Forever!", "Too Sunny = Too Funny", "Fish Are Fruity Enough!"
  - Stage 3, Iceberg harbor: "No Fruit Boats!", "Ahoy, Ice!", "Coconuts Are Just Hairy Rocks!"
  - Stage 4, Storm sea: "Waves, Not Palms!", "Stormy Seas, No Fruit Please!"
  - Stage 5, Glacier fortress: "Home Is Where The Snow Is!", "Champions Say NO To Pineapples!", "Penguin Power!"
- **Story link:** the posters show the penguins can't eat tropical fruit or visit the tropics, and are a little jealous; each stage's posters get sillier, and the Grand Champion's fortress is wallpapered with them.

## Still open
- Story card text: first draft of the one-screen premise from the envy idea above (needs approval).
- Names and gimmicks for the five bosses and the five stage titles.
- Which proposed pineapples and penguins to keep, change or drop.
- Upgrade shop between stages: what can be bought and how it scales (including the rail gun's place in the order).
