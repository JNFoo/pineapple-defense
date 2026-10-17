# Pineapple Defense: Design Brief (Draft 1)

Copyright © 2026 LFC Foundry. MIT License (see LICENSE).
Brief date: 2026.10.12 (version stamps use year.month.day.HHMM, US Eastern)

## Status
Built and playable (see the changelog for the current version). This file is the design record; later rounds are at the end of each section.

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
- First beta: 5 stages (four themed plus a final boss stage), 5 waves each (4, 5, 6, 7 and 8 penguins), then the stage's Champion.
- Saving: copy/paste save code and save file, like Fancy (save-kit from JS-modules). No sound or music in the first alpha; added later only with approval.
- Repo: created by the owner on Oct 12 as JNFoo/pineapple-defense, moved on Oct 16 to https://github.com/lfcfoundry/pineapple-defense (history kept; Pages is now https://lfcfoundry.github.io/pineapple-defense/).

## How we work (from the Master Guide)
- Plain words, short replies; every question asked with the multiple-choice pop-up, recommended option first.
- No checks or benchmarks while the design is open; run them once the design is final.
- Test targets: Firefox 158 (stress test), ungoogled-Chromium on Windows, Chrome on the Pixel; laptop first, phone second.
- Version stamps: year.month.day.HHMM in US Eastern. Copyright holder and credit: LFC Foundry (MIT, see LICENSE); commits are authored as JNFoo. American English.
- Sessions follow AGENTS.md and TASKS.md rules (section 28 of the guide).

## Decisions made, round 3 (2026.10.12.1531)
- Premise (owner's own words): penguins despise tropical fruit because they can't eat it and can't go to the tropical zones. Played for slapstick envy, not cruelty.
- Stages: 1 Beach, 2 Ice flats, 3 Iceberg harbor, 4 Storm sea, 5 Glacier fortress. Each stage pushes the penguins closer to their home.
- Bosses: one big Penguin Champion per stage, each with a gimmick and a weak spot that a particular pineapple exploits (names and gimmicks still to be proposed).
- Pages: https://lfcfoundry.github.io/pineapple-defense/ is live (README only for now).
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
Cloned read-only for this session from https://github.com/lfcfoundry/JS-modules (commit be68acd). Each module is one dependency-free file copied in at build time with its MIT header kept.
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
Pure silliness: the penguins' own jealous signs, never mean and never about real people, real governments or real-world political styles. No real flags, symbols or slogans. Also no slogans or lettering that echo real-world political topics or current events.
- **Poster art vocabulary:** a pineapple inside a red "no" circle, a crossed-out palm tree, a frowning sun with a snowflake, a penguin flexing next to a smiling fish, a thermometer shivering happily, a coconut with a sad face, a medal-wearing Champion pointing at you. Tilted a few degrees, taped at the corners, gently flapping in the wind.
- **Rendering:** drawn once as SVG shapes and baked into the background layer at load, so it costs nothing per frame. Pale and low-contrast so the glossy pineapples stay the loudest thing on screen. Sticker lettering for slogans (sticker-text style).
- **Slogans (short and picture-first; first drafts):**
  - Stage 1, Beach: "Brrr Is Best!", "No Pineapples On Our Shore!", "Palm Trees? No Thank You!"
  - Stage 2, Ice flats: "Cold Toes Forever!", "Too Sunny = Too Funny", "Fish Are Fruity Enough!"
  - Stage 3, Iceberg harbor: "No Fruit Boats!", "Ahoy, Ice!", "Coconuts Are Just Hairy Rocks!"
  - Stage 4, Storm sea: "Waves, Not Palms!", "Stormy Seas, No Fruit Please!"
  - Stage 5, Glacier fortress: "Home Is Where The Snow Is!", "Champions Say NO To Pineapples!", "Penguin Power!"
- **Story link:** the posters show the penguins can't eat tropical fruit or visit the tropics, and are a little jealous; each stage's posters get sillier, and the Grand Champion's fortress is wallpapered with them.

## Upgrade shop (built)
Rules decided and kept: points are Golden Pineapples earned only by playing; no purchases, no random boxes, no streaks, nothing missable; every upgrade can be earned by any player eventually. The shop opens from the title screen and between stages. Costs live in `SHOP.cost` and `LM.cost` in `src/game.js`.

| Upgrade | Steps | Cost (Golden Pineapples) | Needs |
|---|---|---|---|
| Auto Slingshot | 1 | 40 | none |
| Faster Fling | 3 | 50, 80, 120 | Auto Slingshot |
| Better Pineapples (Lobber, Mega) | 2 | 60, 100 | Auto Slingshot |
| Lime Launcher, More Limes, Lots of Limes | 3 | see `LM.cost` | none |
| Gull Pals | 3 | 60, 100, 150 | none |
| Paper Umbrellas | 3 | 50, 80, 120 | none |
| Pineapple Rain | 2 | 250, 400 | none |

"Try it" runs a ten-second demo before buying and the last purchase can be undone until the next stage starts (Round 39 and the shop rounds). Open question that stayed open: whether upgrades should carry over after the final stage as in Fancy (today a finished run keeps upgrades and credits, and "Reset completely" clears them).

## Friends from other games: visible nods (decided Oct 12, 3:41 PM)
Fun references to Apple Press and Fancy, the Banana, kept small and in the same silly spirit. Most cameos are hidden Easter eggs (details in the private file); these few are visible so kids can laugh at them.
- **Apple company billboards (from the owner):** early stages show a small billboard for a regional apple company; later stages show a much bigger, global version of the same company, so the ads visibly grow as you go. Name and slogans are placeholders (Apple Press is the obvious inspiration; draw it in this game's own glossy toy style, never a real company's logo).
- **Posters that tease the other fruits:** extra penguin signs such as "No Bananas! No Apples! No Pineapples!", in the same sticker lettering as the other propaganda.

## Secrets reward skill, curiosity and luck (decided Oct 12, 3:41 PM)
- **Skill:** a clever flick, a perfect combo, hitting something small or moving.
- **Curiosity:** poking at posters, scenery and odd corners; noticing a wobble or a wink.
- **Luck:** free chance events anyone can trigger just by playing (rare glints, lucky ricochets, surprise visitors), with a hidden kindness guarantee so nobody is ever shut out. Still no prize boxes, no pulls, no purchases and no pay-to-win.

## Secret content: reserved slots (details are NOT in this public file)
The game reserves slots for hidden areas and hidden enemies, plus unlock rules. Per the Master Guide, public text (this brief, the README, change logs, credits, help) never says what they are; it calls them "unlockable extras" until a player finds them. The working details live only in a private file that is never committed to this repository (`private/hidden-content-private.md`, ignored by git).

## Decisions, round 6 (Oct 12, 4:2x PM)
**Stage titles:** 1 Sandy Snack Shore, 2 Flip-Flop Flats, 3 Iceberg Harbor Hullabaloo, 4 Stormy Splash Sea, 5 Glacier Giggle Fortress.

**Penguin Champions** (medal rank is the title; the name is the personality; each has one gimmick kids can learn):
| Stage | Rank | Name | Gimmick |
|---|---|---|---|
| 1 | Bronze | Coach Waddles | Hides behind a shield of snowballs; hit the snowballs first |
| 2 | Silver | Captain Flipper | Hides behind three ice blocks and pops up behind one; hit him only while he is up |
| 3 | Gold | Sir Slidealot | Charges at your table; hits knock him back, reaching the table costs Cheer |
| 4 | Platinum | Madame Mohawk | Shielded by her squad; clear the squad and she is open for a few seconds |
| 5 | Grand | Grand Champion Bernard | Icy clones stand beside him; clones pop, only the solid one is hurt |

**Story card** (Play screen, short and giggly): "The penguins can't eat tropical fruit, and they can't visit the tropics. So they're a little jealous! Flick pineapples to send them home giggling. Nobody gets hurt!"

**Rosters:** keep all (six pineapples, eight real penguins, five game-only penguins); trim after testing.

## Decisions, round 7: upgrade shop
- **When:** a friendly fruit-stand screen between stages. Spend Golden Pineapple points. No timers, no purchases with money.
- **What:** new pineapple types (Lobber, Cluster, Bowling Pine, Juice Bomb, Rail Gun); faster cooldowns; stand cheer boost; aim helper strength (more forgiving flicks, good for little kids).
- **Levels and prices:** 3 levels per upgrade with gentle price steps (cheap first level) so nobody gets stuck.
- **Rail Gun:** unlocks after Stage 3, costs a lot of points, and uses a charge meter.
- The shop's slot layout (S1-S3, tabs, U01-U10) stays as the placeholder grid until we assign items to it.

## Decisions, round 8: first playable stage
- **View:** ground in perspective with 5 lanes; penguins walk out of the water at the horizon toward your fruit stand at the bottom of the screen.
- **Penguins:** Rockhopper and the new original Adélie (white eye rings, a cowlick, a little faster than Rockhopper).
- **Scope:** one stage (Sandy Snack Shore), 8 waves, the Classic pineapple, no shop or boss yet.
- **If a penguin reaches the stand:** it bumps the stand, the stand wobbles, the cheer meter dips a little, and the penguin pouts and waddles off.
- **Hit reaction:** a pineapple hat lands on its head, dizzy stars circle, then it belly-slides home giggling.
- **Cheer meter:** a bump costs 12, a hit adds 2, a cleared wave adds 15. At zero the stage ends with a friendly "try again".
- **Golden Pineapples:** 1 per cleared wave, plus 1 for a perfect wave with no bumps.

## Decisions, round 9: controls and saving
- **Controls:** flick only. A plain tap does nothing (click-drag works on touchpads and mice).
- **Continue:** autosaves after every cleared wave. Continue resumes at the next wave with your Golden Pineapples and cheer. Play always starts a fresh stage and keeps your old save until its first wave is cleared.
- **If the stand runs out of cheer:** "Try again" replays the same wave with the cheer refilled to 60.
- **Moving a game to another device:** Settings has Show save code, Copy, Save file, Load code and Load file. Loading asks for a second tap before replacing the game on that device.
- **Slogans:** no lettering that echoes real-world political topics or current events. The beach sign now reads "Brrr Is Best!".

## Decisions, round 10: title screen polish (Oct 12)
- **Faceoff:** on the title screen the pineapple and the penguin now lean toward each other with silly stare-down brows and eyes locked on each other; every few seconds they lean in a little closer. Tapping either one breaks the stare with giggles.
- **Beaks:** both penguins now have the bigger orange beak from the logo.
- **Palm tree and pineapple plants:** the palm is redrawn with proper drooping fronds, and low pineapple plants (spiky leaves with a fruit on top, how pineapples really grow) sit beside it, on the title screen and in the game stage.
- **Penguin faces:** the smile under the beak is gone; the beak is the mouth. Reaction faces (giggle, surprise, pout) still show briefly.

## Decisions, round 11: the slingshot (Oct 12)
- **One pineapple on the table:** the stand's counter now holds a single wooden slingshot with one pineapple primed in its pouch. Your flicks launch from it.
- **Reload as feedback:** after each throw the bands snap forward, the pouch sits empty for a moment, and a fresh pineapple pops in when you are ready to throw again. This replaces the old ready ring.
- This updates the earlier "weapon is never shown" idea: the slingshot is the only weapon shown; the pineapple types (and the rail gun later) will use their own primed contraptions.

## Decisions, round 12: Lobber, Coach Waddles, controls, shadows (Oct 12)
- **Slingshot aims:** the fork tilts toward where you drag, and your throw leaves from the tilted pouch.
- **Two pineapples to pick:** Classic (fast, single hit) and Lobber (orange, big high arc, slower, wide splash that knocks out nearby penguins together). Pick with the two round buttons at the bottom left, or the 1 and 2 keys.
- **Boss, Stage 1: Coach Waddles (Bronze Champion):** a big Adélie-style coach with a red cap and a bronze medal. He walks to the middle and stops behind a ring of snowballs. Pop the snowballs first (a Lobber pops two), then hit him; three hits send him belly-sliding home giggling. Helper penguins keep coming while he holds the line. Continue can resume at the boss.
- **Touchpad and mouse:** no click needed. A quick upward swipe of the cursor from the lower half of the screen throws, and click-and-drag still works. Touch screens use the finger flick.
- **Shadows:** soft, offset away from the sun, with small contact shadows under the feet that shrink as a penguin hops.

## Decisions, round 13: tall stage, table pickups, auto slingshot (Oct 12)
- The whole game now plays in a tall 9:16 stage (like Fancy the Banana), centered and letterboxed, so it suits phones and a narrow window beside other apps.
- Special power-up pineapples appear on the table (left) and can be clicked or tapped: Zippy (fast throws), Mega (every throw splashes), Cheer up (fills the cheer meter), Brrr (penguins walk slowly). They fade if ignored. Keys 3 and 4 also grab table items.
- Trophies (10 achievements) appear on the table (right) when earned. Collecting one gives 2 Golden Pineapples; a trophy left alone is collected automatically after 12 seconds, so nothing is lost. A Trophies card on the title screen lists them.
- More animated scenery: swaying palm, plants and sign, moving waves, bobbing icebergs, gulls, glints, a pulsing sun glow. All of it stops in Calm mode.
- Upgrade: the Auto Slingshot (title-screen Shop, paid with banked Golden Pineapples). A small teal slingshot on the table tosses pineapples by itself, slowly at first, and marks its next target so you can aim at a different penguin. Upgrades: Faster Fling (3 levels) and Better Pineapples (Lobber, then Mega splash).
- Title screen: menu moved under the logo; DEFENSE sign is larger, wider and battle-worn.

## Decisions, round 14: HUD and prices (Oct 12)
- Upgrade prices are now double: Auto Slingshot 8; Faster Fling 10, 16, 24; Better Pineapples 12, 20.
- The top of the game screen has more counters: Wave, penguins Left, Combo (hits in a row), Golden Pineapples this stage, Bank, and Cups (trophies). The Cheer meter is now a tall vertical bar on the right edge.
- Clarity: the two pineapple buttons are labeled (Classic, Lobber), table pickups carry name tags and a tip message, and the How to play card has a short guide to every pineapple and pickup.

## Still open
- Exact item list and point prices for each shop slot.
- Art for the shop screen and the other pineapple types (Cluster, Bowling Pine, Juice Bomb, Rail Gun).
- Flick feel and cursor-swipe sensitivity tuning from real phone and touchpad testing.

## Title screen and logo (alpha 2026.10.12.1556)
Built and playable in `index.html`. It is made from `src/` by `build.py` (never edit `index.html` by hand).
- **Scene:** a pineapple and a Rockhopper penguin face each other on a beach-meets-ice shoreline, with a palm tree, a fruit stand, and the silly "BRRR IS BEST!" sign with two cartoon no-pineapple and no-palm posters.
- **Logo:** sticker-style "Pineapple" lettering with a blue "Defense" pill, flanked by a mini pineapple and a mini Rockhopper. Exported as `assets/logo.png` (transparent).
- **Characters:** original sprites (`src/sprites/`), glossy toy style, with a lopsided crest on the penguin. Tap or poke them for squish, giggles and "wheee!" or "no thanks!" pops. Their eyes follow the pointer.
- **Menu:** Play (shows a "coming soon" card with the envy premise), Continue (greyed until saves exist), How to play, Settings (future items greyed), Calm mode (saved; also follows the device's reduced-motion setting).
- **Tech:** one offline file, strict CSP, subsetted fonts (Bricolage Grotesque and Figtree, SIL OFL, licenses in `src/fonts/`), vendored `sticker-text` from JS-modules (MIT).

## Decisions, round 24: five stages (Oct 12)
- **Waves:** every stage is 5 waves of 4, 5, 6, 7 and 8 penguins (one more penguin each wave), then that stage's Champion. Speed and Adélie share rise a little each stage.
- **Flow:** after a Champion giggles, a stage-clear card offers "Next stage" (a title banner announces it). After stage 5 the card says "You did it!" and Play again starts at stage 1. Continue remembers the stage and wave.
- **Scenery, warm on the pineapple side (left), cool on the penguin side (right):**
  - Stage 2 Flip-Flop Flats: peach sunset over ice flats; giant faced flip-flops, an igloo, a seal that pops up and waves, a gliding flip-flop sled, snowflakes.
  - Stage 3 Iceberg Harbor Hullabaloo: golden dock with a lighthouse (sweeping beam) and fruit crates melting into blue icebergs; bobbing pineapple sailboat, bell buoy, whale spout, gulls.
  - Stage 4 Stormy Splash Sea: violet storm to teal sea; a faced storm cloud that grumbles then giggles, rolling waves, a bobbing rubber duck, rain and a gentle flash (no rain or flash in calm mode).
  - Stage 5 Glacier Giggle Fortress: rose-gold dusk to aurora teal; ice wall and towers with flapping flags, silly "no pineapples" posters, a penguin cheerleader with pom-poms, shimmering aurora, snow.
- **Champions:** each has its own look and gimmick, and a two-line announcement sized to fit the screen: Coach Waddles (red cap, snowball shield), Captain Flipper (navy captain cap, dodges sideways; shots lead him), Sir Slidealot (aviator goggles and orange scarf, belly-slides across after a wiggle warning), Madame Mohawk (pink mohawk, calls helpers often), Grand Champion Bernard (laurel wreath, purple cape, big medal; a little shield, a small dodge, slides and helpers).
- **Tester:** the test build can start at any stage and wave, or at that stage's Champion.

## Decisions, round 25: live bank, power trade-offs, evolving penguins (Oct 12)
- **Power costs speed and money:** Classic is free and fast (0.42 s). Lobber is slower (0.9 s) and costs 2 Golden Pineapples per throw, taken from the bank at the moment of the throw (a "-2" pops up and coins fly from the Bank pill to the slingshot). Mega is slowest (1.1 s). The auto slingshot follows the same rule: better pineapples throw slower and cost 2 or 3 each, and it falls back to Classic when the bank is empty. Pickups stay free.
- **Pay in real time:** every dispatched penguin adds to the bank instantly with a coin burst and coins flying to the Bank pill: Rockhopper 1, Adélie 3, Gentoo 6, Champion 12 (bigger bursts, sparkle rings and a golden shimmer for the fancier ones). Wave clear pays 5 (10 if perfect), a trophy pays 10. Shop prices are 5 times higher: Auto Slingshot 40, Faster Fling 50/80/120, Better Pineapples 60/100.
- **Champions block the lane:** normal penguins, including summoned helpers, walk around a Champion and never through him, even when he dodges or slides.
- **Parachute fish:** every 9 to 14 seconds a fish floats down on a handkerchief parachute and lands in front of a walking penguin. When the penguin reaches it, it stops for about a second, eats the fish and levels up with a glow, stars and a ring: Rockhopper to Adélie (faster), Adélie to Gentoo (faster and takes two hits). The penguin can be hit at any moment, including mid-meal. An uneaten fish waits about 11 seconds, and any other walking penguin in that lane can grab it.

## Decisions, round 26: harder Champions, lanes, secrets (Oct 12)
- **Champion ladder:** Waddles stays the baseline (4 snowballs, 3 hits). Each later Champion is harder: Captain Flipper (4 hits, 3 snowballs, faster and wider dodge), Sir Slidealot (5 hits, 3 snowballs, a belly-slide every 3.2 s), Madame Mohawk (5 hits, 3 snowballs, helpers every 2.2 s), Grand Champion Bernard (6 hits, 3 snowballs, dodge, slide and helpers). While a Champion fights, his health shows as a tall bar on the left edge.
- **Lanes:** each stage paints its own ground: sand with starfish and shells, ice with cracks and footprints, a plank dock with nails and rope coils, foamy water streams, and a courtyard with a carpet in every lane (warm to cool).
- **Secret spots:** each stage hides one tap zone on each side. Each pays 25 times the stage number once per stage run and twinkles very rarely. The stage 5 cheerleader on the wall can be bonked by a flick for a one-time 40.
- **Toasty! replaces Brrr!:** penguins like the cold, so the slow-down pickup is now a warm orange glow that makes them sleepy for 6 seconds.
- **Fish timing:** the fish lands mid-field, only in front of penguins that have not passed that spot yet, so there is time to eat, level up and keep walking.
- **Pause:** the P key pauses and resumes, like Escape and the pause button.

## Decisions, round 27: shop extras, runs, combos (Oct 12)
- **Gull Pals (3 tiers, 60 / 100 / 150):** a gull swoops across the screen and snatches the falling fish before it lands, so fewer penguins level up. Chance per fish: 50%, 80%, 100%.
- **Paper Umbrellas (3 tiers, 50 / 80 / 120):** the tier is how many umbrellas you get per stage. They lie on the fruit stand table. When a penguin is about to knock the cheer down, one snaps open by itself and flings him away, costing no cheer.
- **Air Raid (2 tiers, 250 / 400):** one Raid button under the cheer bar (or R). A warning line shows where, then a row of classic pineapples falls across all lanes where the most penguins are. Tier 1 gives 1 raid per stage, tier 2 gives 2. A Champion can only be hit once per raid.
- **Combos:** every hit within a second and a half chains, from the slingshot, the auto slingshot, a splash or a raid. Calls grow with the chain (Double, Triple, Quadruple, Mega, Super, Ultra, Incredible, Unreal, LEGENDARY) with bigger text, rays, rings, confetti and shake. Mixed slingshot and auto chains are called Team and say you + auto.
- **Runs:** clearing all five stages is a run. Each finished run makes every penguin and Champion 10% faster (compounding, capped at double speed). Losing a wave and trying again keeps the streak; quitting the run and starting over from stage 1 resets it.
- **Challenges and trophies:** each run carries one new challenge (+100 Golden Pineapples) and there are 11 more trophies, 21 in all. The Cups counter on the HUD counts trophies, now shown with a trophy icon.
- **HUD:** the stage pineapple counter duplicated the bank, so it is gone; one bank counter remains.
- **Fanfare:** pickups and trophies on the table arrive with rings, a spinning halo, sparkles and a label.
- **Look:** the projectile shows its back (no face) as it flies at the penguins; the slingshot has a wrapped grip, brass caps, a shaded fork and a stitched pouch.

## Decisions, round 28: run end and QA (Oct 12)
- **Run-end card:** after the last stage you choose Save and restart (keeps upgrades, credits, trophies and the run speed streak) or Reset completely. Reset asks "Reset everything?" first and then erases upgrades, Golden Pineapples, run streak and progress; trophies stay.
- **QA process:** one command now runs the checks (see docs/qa-process.md).

## Change log
- 2026.10.12.1556: first title screen, logo and original pineapple and Rockhopper sprites.
- 2026.10.12.1620: story card text approved; stage titles, Champion names and rosters decided.
- 2026.10.12.1624: upgrade shop decisions recorded.
- 2026.10.12.1655: first playable stage 1 (5 lanes, 8 waves, Rockhopper and Adélie, Classic pineapple, cheer meter, pause, end cards, Calm mode).
- 2026.10.12.1700: flick only; Continue and autosave after each wave; save code and save file in Settings; beach sign slogan changed.
- 2026.10.12.1705: title faceoff, bigger orange beaks, redrawn palm tree.
- 2026.10.12.1703: pineapple plants in the background, penguin smile removed.
- 2026.10.12.1706: slingshot with one primed pineapple on the stand table.
- 2026.10.12.1712: slingshot tilt, Lobber pineapple and picker, Coach Waddles boss, cursor-swipe throwing, softer shadows.
- 2026.10.12.1726: tall 9:16 stage, table power-ups and trophies, animated scenery, Auto Slingshot shop upgrade, menu under logo, battle-worn DEFENSE sign.
- 2026.10.12.1738: redrawn worn DEFENSE sign, compact Trophies and Shop dialogs with a floating close button, dialogs pause background animation, packed single-file build tool.
- 2026.10.12.1743: billboard removed from the game field; title billboard rotates silly slogans; more title animation (gulls, snow, sparkles, swaying palm and plants, sun rays); closer, bigger pineapple and penguin faceoff.
- 2026.10.12.1752: logo: a mini pineapple replaces the letter a in Pineapple; rockhopper crest redrawn to match the logo penguin.
- 2026.10.12.1918: more top counters, vertical Cheer meter, upgrade prices doubled, labeled pineapples and pickups, pickup guide, README pictures.
- 2026.10.12.1933: polish and stability fixes.
- 2026.10.12.1940: more polish.
- 2026.10.12.1954: more polish.
- 2026.10.12.2002: more polish.
- 2026.10.12.2006: more polish.
- 2026.10.12.2015: more polish.
- 2026.10.12.2020: more polish.
- 2026.10.12.2112: five stages of 5 waves, stage scenery and five Champions.
- 2026.10.12.2205: live bank and costs, Champion lane blocking, parachute fish and evolving penguins.
- 2026.10.12.2223: harder Champions, Champion health bar, new lanes, secret spots, Toasty!, P to pause.
- 2026.10.12.2253: gulls, paper umbrellas, Air Raid, combo calls, run speed streak, challenges, 11 new trophies, better slingshot, faceless projectile, bigger special entrances.
- 2026.10.12.2306: run-end Save and restart / Reset completely, one-command QA and release tools, small fixes.
- 2026.10.12.2343: Lime Launcher (3 tiers), polished sprites and icons, canvas caching and batching (about 47% fewer canvas calls per frame), ideas file.
- 2026.10.13.0008: comfort settings, resume countdown, shop Try it and Undo, stage replay with best scores, next-goal chip, smoother resolution scaling, gradient caching, faster first frame, minified packed build.

### Round 29: Lime Launcher and polish
- **Lime Launcher (save field `lm`, 0 to 3):** costs 80 / 100 / 150. Tier 1 owns it, tier 2 (Rapid Limes) shortens the volley gap from 4.2 s to 3.0 s, tier 3 (Lime Volley) raises the volley from 2 to 4 missiles. Independent of the Auto Slingshot. Active only while a Champion holds its lane.
- Missiles home on a snowball of the Champion's shield (pop one each); when the shield is gone they hit the Champion for one health. A missile that arrives while the Champion is recovering or leaving fizzles into a lime puff. Hits use the Auto source in the combo counter, so lime hits chain with slingshot and Auto hits.
- The sling is drawn with the same code as the others using a green palette; its pouch holds a cached lime missile sprite. The Paper Umbrella shelf moved right to make room.
- Performance: see docs/ideas-qol-and-performance.md for what was done and what is open.

### Round 30: comfort, replay and speed
- **Comfort (save fields `lh, aim, arc, hc, lt`):** `mx(f)` mirrors every x position when left-handed (slots, auto and lime geometry, umbrella shelf, HUD through `html[data-lh]`). Aim help widens or narrows the sticky-aim window (`AIMW = [1.3, 0.9, 0.4]` times the penguin size); the dotted arc shows for the first 5 throws by default (`thr`). High contrast and large text are root attributes read by CSS and by the particle and banner code. Everything is part of the save, so it travels with the save code.
- **Resume countdown:** `S.rc` counts down 3 s after resume; update() returns early and input is ignored while it runs. Rotation pauses first. Not used in the bonus game.
- **Try it:** the shop lends the upgrade through an override object (`sp.over`), runs a 12 s or 14 s slice of a real stage with a forced Champion hold or umbrella raid, and blocks all saving while the demo runs (`kit.save` is a no-op, `award()` returns early); `restoreDemo()` puts the saved JSON copy back. **Undo** keeps one refund slot (`lastBuy`) until the next stage starts.
- **Replay:** `startStage({replay:true})`; credits are paid, runs count, but wave and stage progress, `cleared` and trophies for the main run are not written; `bs1..bs5` keep the best Golden Pineapples per stage.
- **Speed:** five governor steps map to canvas scales 2, 1.75, 1.5, 1.25, 1 and three effect levels; `gk(key, make)` caches gradients per layout and `stamp()` caches small sprites (sling caps and pouch); confetti objects are recycled (`addBit`, swap-remove); the depth list is reused and insertion-sorted; sprites outside stage one decode in the background after the first frame. The idle loop was already in place: every card, the title and a hidden tab halt the loop.

### Round 31: limes, umbrellas, gulls
- **Lime Launcher supply (replaces Rapid Limes and Lime Volley):** `LM.sup = [6, 12, 20]` limes per Champion fight, one every `LM.gap` = 0.8 s (halved by Zippy) while a Champion holds. `S.lm.fb` remembers the Champion, so a new Champion refills the supply. The sprite is a whole lime with a leaf; the flying lime tumbles instead of pointing like a rocket. Save field `lm` (0 to 3) is unchanged, so old saves keep their tier.
- **Warm-up queue (`warmAll`, `warmUmb`):** small sprite copies and the three umbrella canopies are built one at a time right after loading and at the start of each stage, so no frame pays for them the first time.
- Gulls: start at 22% to 32% of the height, dip a little lower on the swoop, slightly bigger.

### Round 32: champion fight styles, thrown pineapples
- **Fight styles (`CHAMP[n].mode`, code in the "Champion fight styles" section of extras.js):** `peek` (Flipper: three ice blocks at `SLOT_X = [-0.6, 0, 0.6]`; cycle hide 1.0 s, a shaking block 0.85 s, up 2.4 s; shots at blocks clink), `charge` (Slidealot: advances at 0.08 + 0.018 per heart lost; a hit knocks him back 0.16, a snowball 0.05; reaching the table costs 20 Cheer and sends him back with a 1.4 s daze), `guard` (Mohawk: a squad of 3, then 4, then 5 penguins; she is shielded until the last one is gone, then open for 3.4 s; a hit calls the next squad), `clones` (Bernard: two icy decoys, translucent and blue, that pop when hit and come back after 3 s; the real one is solid; everyone reshuffles after each hit or every 6.5 s). Waddles keeps the snowball ring and the original rules.
- `b.safe` marks a Champion who is present but cannot be hurt right now; `bossOpen(b)` is `hold` and not `safe` and is what the auto slingshot, the lime launcher, the Air Raid and the throw aim use. Each Champion shows a short tip when the fight starts.
- **Thrown pineapples:** with nothing to aim at, a harder flick now lands farther up the lane (it used to land nearer); a miss lands with a puff and fades where it landed instead of sliding. A pineapple aimed at a penguin that is gone by the time it arrives flies on along its line and falls farther up the lane, and can still hit whoever is there.
- **Lime flight:** each lime follows its curved path plus a corkscrew offset (about 2.8% of the screen, fading near the target), points along its direction and rolls about its long axis; the vapor trail is up to 15 fading puffs that grow with age. Calm mode has neither.
- **Auto slingshot and Lime Launcher** only turn up to 0.12 rad toward their target (about 7 degrees), no leaning.

### Round 33: ready set go, helpers wait, two rolls, steadier flicks
- **Ready, Set, Go:** `spawnBoss` sets `b.rs = 1` and shows Ready...; `updateBoss` (walk) moves to Set... at `p >= 0.22` and GO! on arrival (`rs` 0 again). Skipped in shop demos.
- **Helpers wait:** `S.pt` is false at `newState`, `beginWave` and `startBoss`, and true after the first `throwAt`. `helpOn()` (= `S.pt` or a demo) gates `updateAuto`, `drawAutoMark` and the Lime Launcher. The first throw sets the auto cooldown to at least 0.45 s and the lime cooldown to at least 0.7 s. `helpHint` limits the explanation toast to twice per page load.
- **Roll limit:** save field `rl` (0 to 9) counts plays in the run (`newSkee` adds one); it is reset wherever `cd` is reset (run complete, reset, and a fresh start from the title). `ROLL_MAX = 2`; `startSkee` refuses when none are left (shake of the secret spot, or on to stage 5 from the stage 4 card); the stage 4 offer is only shown while rolls remain; the end card names the rolls left and hides Roll again after the last.
- **Roll feel:** `SK_AIM` 0.3 (was 0.7), speed band `(spd - 1) / 7.5` (was `(spd - 1.2) / 5.3`), `SK_DIN` 1.25 (was 0.9). The lane and the board use fixed 1/240 s steps (`SK_H`, accumulator `b.acc`) so the roll is the same at any frame rate, and `skSim` replays a launch silently (used by the tests; `skSimOn` mutes the crowd). Measured by simulation with a human wobble (normal noise, 6 degrees and 12%): 58% of flicks sink, up from 33%, and a random flick sinks 38% of the time (19% before). All hole values (10 to 100) stay reachable. No aim assist on purpose (the player asked for none).
- **Audit:** see docs/ideas-qol-and-performance.md.

### Round 43: eight more ideas from the research report
- **Keep screen on (Q27):** field `wl` (default 1), row `cmWake`. `WakeKeeper` (vendored from JS-modules `wake-keeper`) wants the lock when `wakeOn()` is true (`sv.wl`, not Battery saver, `running`, not paused, not over). `run()` and `applyPrefs()` call `wakeSet()`; `halt()` releases (every card and the title call `halt()`); pointer and key events `poke()` the 60 s idle timer. A refusal is only counted (`wk.refusals`); no message, because the browser does not say why.
- **Hint ledger (Q21):** field `hh` (helper hint shown, max 2). The Champion tip toast needs `sv.cleared < S.stage` and not a replay or demo, so it stops after the first win over that Champion; no new field.
- **Assist offer (Q26):** field `ao` (offered once). `endStage(false)` counts consecutive losses of the same `stage:wave` (`lossKey`, `lossN`, this visit only, cleared by `waveClear`). The second loss, if `!ao`, not a replay, and Little hands is not already on, shows the three-button card and sets `ao = 1` whatever the answer. The help is `applyLittle()`, the same values as the Little hands row. Slower game speed is deliberately not offered, because it would pause two trophies.
- **Two tabs (P09):** `TabGuard` (vendored) with name `pd-open` (`pd-lab-open` in the tester). A twin sets `twin = true`; `kit.save` is wrapped to a no-op that returns true. `twinCard()` shows a title-screen card (`#twUse`, `#twLook`) or a game card (Use this tab / Keep playing without saving / Title). Use this tab calls `takeOver()`, the other copy gets the twin card and this one reloads to read the latest save. Not started with `#qa`, so test pages do not fight each other; `__pd.twinTest()` drives the same code.
- **Context loss (P13):** `contextlost` on the main canvas is prevented (so the browser can restore it) and calls `ctxLost()`: pause (which writes the Round 42 resume note) and a Reload card. `contextrestored` does the same, because baked sprites are blank after a restore and the game has no per-sprite recipes to re-run. Reload plus the resume note is the recovery.
- **Color view (Q48):** tester only. SVG `feColorMatrix` filters (protan, deutan, tritan, luminance gray) applied to `<body>` (Firefox ignores a filter on `<html>`; found by measurement). `__cb(i)` hook.
- **Docs drift (P66):** see `tools/docs_check.py` and `tools/test_docs_check.py` (9 planted-drift cases). **Hooks (P06):** `tools/hooks` copied from JS-modules, installed with `sh tools/hooks/install.sh`, tested by `tools/hooks/test.sh`.

### Round 44: ideas from the single-file UI report
- **Shop reasons (X35):** `shopNeeds(title)` and the row loop in `fillShop`: an unbuyable row gets class `dim`, `aria-disabled="true"` (not native `disabled`), an `aria-label` with the reason, and a `nope` shake on tap. Owned or Maxed rows stay natively disabled (they are done, not unavailable).
- **Sizes (X01, X02):** `.card .sb` and `.sb.try` `min-height:max(48px,2.7rem)`, `.pause` `max(55px,3rem)`, `.raid` `max(48px,2.5rem)` by `max(56px,3.1rem)`. The weapon picks keep their invisible hit pad (6 px above, 10 below).
- **Hold to reset (X10, X97):** `holdBtn(btn, ms, done)` is a reusable press-and-hold (rAF-driven bar so Calm cannot freeze it; `pointerdown` starts, `pointerup/cancel/leave/blur` cancel, Enter or Space held works). `confirmReset` uses it on `gBtn2`; `doReset` keeps `resetBackup` (a JSON copy of the save), shows the "Fresh start!" card with Play and Undo reset; `undoReset` copies the keys back and re-shows the run-end card. `holdDoneAt` blocks a click on `gBtn2` for 700 ms after a hold finishes, because the lift of the same finger would otherwise click the button that replaces it. `showCard` clears any hold bar and handlers.
- **Themed letterbox (X75):** `html[data-st]` (set in `startStage`, cleared in `toTitle`) picks `--w1 --w2 --w3`; `--wash` is a vertical gradient (portrait) or radial (`min-aspect-ratio:1/1`). Title uses the stage 1 colors. No art bytes.
- **Resume skip (X21):** a `pointerdown` while `S.rc > 0` sets it to 0 and is consumed. **Pressed ring (X08):** one capture-phase `pointerdown` listener adds `.pr` (outline) to the nearest `button,.so,.pick`; `pointerup/cancel/out/blur` remove it. Outline follows border-radius in Chrome 94+ and Firefox 88+.
- **Every finger plays (X12):** field `ef` (default 0), row `cmEf`. With it on, a new `pointerdown` clears `drag` and `hold`, so the new finger owns the throw. Menus are DOM buttons and are unaffected.
- **Danger glow (X34):** field `dg` (default 1, on for everyone; a player's own toggle is kept), row `cmDg`. `drawDanger` (ring, warning triangle with a bar and dot, no text) for a walking penguin with `p >= 0.72`, and `drawDangerEdge` (a red gradient above the stand strip scaled by the nearest walker). Calm holds the alpha still.
- **Test Lab (tester only):** Flash check (`flashCheck` in `src/lab/lab.js`: two scenes, 720 steps of 1/60 s each, a 16 x 28 sample every step, a change counts when at least a quarter of the cells move by 0.1 relative luminance with the darker side under 0.8, red counted separately, verdict Great, Good, Problem or Could not check; a scene whose picture barely changes is Could not check; `labBot` makes the helper throw; `__flashTest(hz, steps)` feeds the same counter a synthetic strobe so QA can prove it counts: still 0, 2 Hz reads 2.5, 8 Hz reads 8.5) and First tap time (`BOOT_MS`, the time the game's code finished starting).
- **QA:** `qa_layout.js` sweeps every visible button, link and field for a 44 px minimum (weapon picks skipped); new suite checks listed in the changelog.

### Round 45: sideways play, repeat waits, Danger glow default
- **Sideways layout:** `fit()` in `title.html` sets `html[data-land="1"]` and `--side` (the empty margin each side of the stage) when the area is at least 1.4 times wider than tall, at most 540 px tall and the margin is at least 130 px. Then `html[data-land][data-st]` lets `#stage` and `.game` overflow, `.hud` spans the whole screen (the progress bar keeps stage width), `.pill` uses `zoom:1.6`, `.picks` stack bottom-left (46 px tall), `.raid` sits bottom-right, left-handed mirrors both, and `.game:has(#gcw:not([hidden]))` makes Pause, picks and Rain inert and dim while a card is up. Menus and cards are enlarged too (Round 47).
- **Sideways tip:** field `lp` (default 0), element `#landTip`, `landTip()` from `startStage`; shows once when `data-land` is 1 and the pointer is coarse, hides after 7 s.
- **Repeat waits (X66):** `seen()` is `sv.cleared >= S.stage`; wave intro 1.2 to 0.6 s, wave clear 1.7 to 1.0 s, banners 1500/1300 to 900 ms, stage banner 2300 to 1500 ms, banner pop-in 420 to 260 ms for banners of 1 s or less. Champion intro, Ready/Set/GO and Champion win are untouched.
- **Danger glow:** `dg` default is now 1.
- **Motion audit:** `tools/motion_audit.py` (36 lengths: 25 loops, 11 one-shots and transitions; none over 0.5 s).

### Round 42: safety net, game feel, grown-ups card, cheaper checks
- **Back swipe (Q01):** `src/vendor/back-close/back-close.js` (from JS-modules) watches the hidden `#bcGuard` span. `run()` shows it and `halt()` hides it, so a `CloseWatcher` exists exactly while the game runs; its close handler calls `pause()`. The Paused card has none, so a second back leaves the page. `__pd.backArmed()` reports it.
- **Resume snapshot (Q08):** save fields `sl` (penguins left), `sg` (Golden Pineapples), `sc` (cheer). `snapSave()` runs from `pause()` (the hidden-tab handler already calls it) and `pagehide`, only in a normal wave (`run` or `intro` mode, not Champion, replay, demo or Pineapple Roll) and only when `sv.stage/sv.wave` match the wave in progress. `startStage(sv)` applies it (`S.toSpawn = min(...)`, golden, cheer floor 60) and toasts "Welcome back!". `waveClear`, a stage win, a reset and `start()` set `sl = 0`. A stale note can only give more penguins than were left, never fewer.
- **Little hands (Q38):** `LITTLE = {hp:1, bb:1, lt:1, ib:1, aim:0}`; `littlePrev` remembers the old values for one undo this session (after a reload the undo goes to the defaults). It never touches `sp`, because any speed below 100% blocks two trophies.
- **Hit pause (Q03):** field `hs`. `stopHit(o, sec)` sets `o.fz`; `updatePenguin` and `updateBoss` return early while `fz > 0`, so only that object freezes (`S.t` and every timer keep running). Lengths: tough hit 35 ms, a normal hit 50 ms, shield pop 40 ms, Champion hit 90 ms, Champion finisher 160 ms. A frozen sprite trembles less and less. Off in Calm.
- **Screen shake (Q13):** field `sk` (0 Off, 1 Low, 2 Normal = the old look, default, 3 Strong). Strong treats `S.shk` as trauma (hits add 0.08 to 0.6, drawn as trauma squared with smooth noise and a tiny turn). The strength values are my guesses, not measured.
- **Sticky aim (Q41):** field `sa`. `S.stk = {pg, t}` after each throw; for `STICKY_S` = 0.9 s that penguin gets a 30% wider aim window and a 0.4 score bonus. The window is longer than the sling cooldown (0.42 s) on purpose; the report's 100 to 150 ms was for continuous aiming, not repeated throws. Off when Aim help is Off.
- **Coalesced events (P22):** field `cp`. With it on, `pointermove` appends every coalesced sample and the drag buffer holds 40 points instead of 10. Benefit unmeasured; needs an eye test on a phone.
- **Grown-ups card (Q19):** template `t-grown`, opened from the `cmGrown` row. `tools/qa.py` scans the shipped page for `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `importScripts`, external `<script src>` and `<link href=http`, `<a href` and `window.open`, and fails the run if any appears, because the card says there is none.
- **Checks (P14, Q02, P05, P17):** `tools/canvas-probe.js` is a copy of the JS-modules tool; the suite installs it per stage with the bot playing and fails above a per-stage ceiling (sum of per-call medians: 620, 600, 750, 950, 670; measured 420, 304, 51x, 704, 49x) or on unbalanced `save()`/`restore()`. `--calm` sets `reducedMotion: 'reduce'` (Chromium) or `ui.prefersReducedMotion` (Firefox) and the two motion checks have a calm branch. `--quick [SEED]` skips slow checks by `hash(name) + SEED` mod 4. `tools/fixtures/save-2026.10.13.2220.json` holds a real save (storage value and save code) written by that release; every release must load it, keep its values, default the new fields and Continue.

### Round 41: little hands, FrameMeter, input buffer, WOFF2
- **Large buttons:** `html[data-big="1"] .raid` moves up by `.7rem` so Rain clears the cheer bar. `tools/qa_layout.js` now loops a `bb` (big buttons) dimension with left-handed, Larger text and High contrast (five combinations).
- **Edge touch targets (Q06):** `.pick::after` and `.pause::after` extend the hit area outward (toward the screen edge, mirrored in left-handed mode); `.raid::after` likewise. Test: `elementFromPoint` just outside each drawn edge returns the button.
- **First-run choice (Q22):** save field `tc` (0/1). `tourStart(first)` remembers it was the automatic start; `tourEnd` then calls `throwChoice()` unless `tc` is set. The card reuses `#cw` with two `.tchoice` buttons (Flick sets `hp=0`, Tap sets `hp=1`, both set `tc=1`). Turning the Hold row on in Settings also sets `tc`. Hook: `__pd.choice()`.
- **Early flick helper (Q04):** save field `ib` (0/1), row `cmBuf`. `throwAt` keeps one flick when `S.cd <= BUF_S` (0.15 s) in `S.buf`; `update()` throws it once `S.cd` reaches 0 and drops it after 0.4 s. It is not tied to Calm or Hold to press.
- **FrameMeter (P32, P02/P21):** `modules/frame-kit/frame-meter.js` from JS-modules (vendored in `src/vendor/frame-kit/`, injected through `/*{{FRAMEMETER}}*/`). `frame()` gets the time, our own update+draw time and the gap; `input(e.timeStamp)` is called from the canvas `pointerdown`; `lines()` builds the badge text. A hitch is a gap more than twice the last three and over 50 ms; it is blamed on the game when update+draw took at least 60% of the gap.
- **WOFF2 (P15):** `build.py` uses `brotli` when it is installed (`FONT_FLAVOR`), otherwise WOFF.

### Round 40: tap or hold to throw, FPS badge
- **Hold to press:** save field `hp` (0/1), Settings row `cmHold`. `penAt(p)` picks the walking penguin, Champion or clone nearest the finger within `max(0.62 * size, 30 px)`; the press sets `hold = { id, pg }` and calls `holdTick()`, which calls `throwAt(pouch, toward the penguin, 1.2, tapPoint, pg)`. The new 7th argument `want` forces the target (the usual aim-line scoring can pick another penguin on the same line). `holdTick` runs once per frame (and per `__pd.step` iteration) and throws only when `S.cd <= 0`, so the sling cooldown, Lobber/Mega costs, Ready/Set/GO block and pause all apply unchanged. The hold ends when the finger lifts (`pointerup`), the touch is cancelled (`pointercancel`, Android), the game stops (`halt`), or the target is gone; a Champion that is dashing or shielded stays the target and the next throw waits until it opens. No trophy or rule changed. The hint line reads "Tap a penguin to throw! Hold to keep throwing." when it is on.
- **FPS badge:** save field `fp` (0/1), Settings row `cmFps`, element `#fps` (bottom corner opposite the `.picks`, `pointer-events:none`, `aria-hidden`). `fpsTick(gap, now)` counts frames and the biggest gap and rewrites the text every 500 ms (three lines: `N fps`, `worst N ms`, `quality 0-2`). It runs only while the setting is on and the game is running; the badge hides on `halt()`.
- **Tests:** tap throws and locks on (`soft`), hold ends on release, hold repeats on the Champion at the sling cooldown, a flick still throws, off means a tap does nothing; the badge shows only when on, has the right text and covers no button. Hooks: `__pd.center(pg)`, `__pd.hp(x,y)`, `__pd.holdOn()`, `__pd.fpsTxt()`.
- Lesson: `P.sh` (the live shots array) shrinks as shots land, so count throws by the cooldown jump, not by array length.

### Round 39: settings in Fancy's row style
- Reviewed JNFoo/fancy-banana (a Settings panel of `.opt` rows: Calm, Game speed 100 to 60, Left-handed, Large buttons, Larger text, News ticker, Battery saver, Full screen; a separate Save panel with a storage warning; a win panel "What now, hero?") and JNFoo/apple-press (footer buttons: Effects, Hold to press, Theme, FPS counter, Save and load, a slow-moment note).
- `t-set` rows use `.so` (title, small help, `.st` pill). New save fields `sp` (speed index into `SPEEDS` 100/90/80/70/60), `bb` (large buttons, `data-big` on the root) and `bv` (battery saver). `spdK()` scales the main game's dt in `frame` (not Pineapple Roll); battery saver skips a frame when under 28 ms have passed. The Faster Fun and Top Speed trophies are only awarded at `sp = 0`. `#svWarn` shows when `kit.save` returns false.
- Not adopted in this round: news ticker (no ticker here), theme, the slow-moment note. FPS counter and hold-to-press arrived in Round 40.

### Round 38: victory card
- `showCard` takes optional `btn3, fn3` (`#gBtn3`, hidden unless used). `runEndCard()` shows Save and restart, Save and go to title (`kit.save(sv); toTitle()`) and Reset completely; "Keep my stuff" in the reset confirm returns to it.

### Round 37: first-load tour, calmer sling, pills, Ready block
- **Tour:** `TOUR` (five cards: SVG scene, short sentence) in `game.js`; `tourStart/tourShow/tourEnd` reuse the title's `#cw` card. Save field `tr` (int 0 or 1, set when the tour first opens). Auto-start 900 ms after load when `!sv.tr && !sv.thr && !sv.cleared && stage <= 1` and the page is not `#qa`; `#tourBtn` in How to play replays it. `__pd.tour()` opens it for tests.
- **Sling tilt:** the drag angle target is `clamp(atan2 * 0.3, +-AUTO_TURN)` (0.12 rad), the same as the helpers.
- **Pills:** `.pick` is a row (icon, name), 2.2 rem tall; the Lobber cost badge sits on the corner.
- **Ready, Set, GO:** `rsg()` is true in `bossIntro` and while `boss.rs > 0` (not in demos). `throwAt` and `callRaid` return early (a "Wait for GO!" pop at most every 1.2 s) and `helpOn()` is false, so the Auto Slingshot and Lime Launcher hold fire.
- **Stage names:** the stage banner shows at wave 1 of every stage (not demos).
- **Flip-flops:** `flipflop()` draws a foot-shaped sole with Bezier curves, a Y strap and a toe post.

### Round 36: rarer props, icons, logo, README
- **Props:** `rollGear` picks a count (0 for 66.7%, 1 for 25%, 2 for 7.3%, 3 for 1%) and fills distinct slots by weight (hat .34, scarf .30, mittens .22, item .14). Test hook `__pd.rollGear()`.
- **Icons:** `tools/make_icons.py` writes `src/sprites/icons.svg` (symbols `ia-0` to `ia-20` for trophies in `achAll()` order, `iu-*` for upgrades and pickups) and standalone SVGs in `docs/icons/`. `build.py` inlines it at `<!--{{icons}}-->`. `fillTrophies` uses `#ia-N`; `fillShop` maps the demo name through `SHOP_IC`. Shop icons ignore the gray "not owned" filter.
- **Logo:** `lr-art` (the title penguin) gained a beanie and scarf. `assets/logo.png` is a transparent capture of the live `h1.logo`.
- **README:** players first; screenshots in `docs/img/*.jpg`.

### Round 35: rim drama, penguin outfits, stage 4 and 5 scenery
- **Rim model (`skStep`):** each ring has a lip at radius `min(r * SK_LIP, ro - 0.012)` (SK_LIP 1.3) with a ball-sized lip radius `SK_RC` 0.085 and lip restitution `SK_RIME` 0.62. While `d < re` and the ball is near the ring height, the free middle sinks (`gap >= SK_RC * 0.92`), otherwise it is sphere-versus-edge contact: normal from the lip center, position correction, impulse `-(1 + SK_RIME) * vn`, tangential speed x0.97, and `b.lh/b.lt` mark recent contact. The flat-top landing hop is `max(1.0, imp * SK_RIM)` pushed away from the middle.
- **The invisible catch:** the wall branch slide push had the wrong sign (uphill), which balanced gravity on the flank. It is now `imp = (nx >= 0 ? -1 : 1) * (0.5 + max(0, -vn) * 0.4)`, applied downhill. `drawHoleFront` redraws the cup front over a sinking ball.
- **Outfits (`src/gear.js`):** `pg.gear = [hat, scarf, mitt, item]` from `rollGear` (50% hat, 42% scarf, 36% mittens, 20% item, at least one piece 70% of the time otherwise). Baked SVG overlays in the 200-unit sprite space, drawn by `drawOutfit` with sway (scarf, hat, item) and cocoa steam when `qLevel < 2`. Skipped for `mc` and for the hat while `pg.hat` (a stage hat) is on.
- **Stage 4 (`stages.js`):** `stormLand`, `stormLay`, `stormToys`, `stormSky`, `stormBeam`, `stormTap`; **stage 5:** `fortParty`, `fortLay`, `fortDisco`, `fortBalloons` (tethered, return after 7 s), `fortShow` (fireworks, searchlights), `fortFloor`, `fortBulb` (cached stamp), `fortLights`, `fortDJ`, `fortTap`. `sceneTap` routes a tap before the throw; it ignores taps in the lane, while paused and during the round-clear.
- **HUD:** `#progStg` label at the start of the progress bar; `#waveBox` is hidden outside the minigame.
- **Test hook:** `__pd.stap(x, y)` is the scenery tap (`__pd.tap` is the throw).

### Round 34: auto nerf, mecha, progress bar, atmosphere, minigame overhaul
- **Auto nerf:** `AUTO_INT = [5.2, 4.2, 3.4, 2.8]`, `AUTO_MISS = [0.28, 0.2, 0.12]` by `sv.ap`; `autoFire` adds `miss` (target x offset 1.0 to 1.4 body widths) and `landShot` treats `s.miss` as a miss.
- **Mecha:** `LEVEL.gt = 'mc'`, `LHP.mc = 3`, `LMULT.mc = 1.35`, `PAY.mc = 10`, `pg.big` 1.2. `mechaSvg` recolors the Adelie sprite (`TINT_MC`) and adds armor, antenna and a chest core. Fish ignore `mc` (`fishFree`).
- **Late fish:** `tryDrop` uses `late = mode run and wave >= NWAVES - 1` (T 2.0, landing 0.44 to 0.64); `updateFish` allows 2 fish and retries after 0.6 s when late; `beginWave` caps `S.fishT` at 2.2 on those waves.
- **Progress bar:** `#prog` (5 `.seg` plus a medal); `hud()` updates segment scale from `pf`, `data-boss` and `data-now`, only when the key changes.
- **Atmosphere (extras.js):** `drawAtmos` (rays, cloud shadows, motes) after the scenery, `drawAtmosTop` before the aim arc, `stepPuff` for walk dust. All cached sprites, off in Calm mode.
- **Minigame clock:** `SK_TS = 1.7` multiplies the dt that reaches `skUpdBall`; the fixed step `SK_H` stays 1/240 s of world time so `skSim` and the tests are unchanged. Gravity feels like 28.9 u/s^2 (real is about 26 at 0.38 m per unit).
- **Minigame physics:** floor drag `0.14 + 0.08 * speed`, landing restitution `clamp(0.52 - 0.05 * impact, 0.25, 0.5)`, walls keep 0.55 of the normal speed and lose 6% of the tangential.
- **Chase cam:** `skChase` (last ball, balls 0, one ball in lane/play/sink/out), `skCam(dt)` eases zoom (1.12 to 1.2 on the lane, 1.36 to 1.68 near rings, 1.75 sinking), focus and slow-mo `K.ts` (down to 0.3 on a sink). The view transform is applied inside `drawSkee` (anchor `SK_AY = 0.62`, clamped to the baked background with a 6 px margin for shake). `K.ts` also scales the effects clock. Shake `K.shake` comes from `skHit` (landings, rims, walls) and `skSinkFx`.
- **Minigame art:** baked in `skBg` (dusk sky, tents, pennants, pole lamps, brass rails, felt grain, light pool, wood grain, lacquer sheen); drawn live: Ferris wheel, beams, party lights, marquee with chasing bulbs, ring glows (`drawHoleGlow`, `SK_COL`), ball trail and overlay sprite `skBallOv`, sink light columns (`K.bm`), crowd wave and camera flashes.

### Round 46: license and credit
- `LICENSE` (MIT, Copyright (c) 2026 LFC Foundry, branding notice, third-party list). `src/header.txt` is the one source of the header block: `build.py` fills `<!--{{header}}-->` right after `<head>`, `tools/pack.py` writes it into the outer comment of the packed file. The title screen's `.legal` line reads "Alpha VERSION, Forged by LFC Foundry, MIT License". First-party file headers read "Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE)."; `src/vendor/` keeps JNFoo MIT headers from JS-modules and `src/fonts/` keeps the OFL files.

### Round 47: sideways menus and cards
- The title art now lives in `.scene` (clipped to the stage picture, rounded), so `html[data-land="1"] #stage,.title` can overflow without the art spilling. In sideways play the title `.menu` becomes a three-column grid over the whole screen (`--side` | stage | `--side`): Play, Continue, Replay a stage and Shop at left, How to play, Trophies, Settings and Calm mode at right, all at least 48 px tall; the order in the page (and so tab order) is unchanged.
- Cards: `.card-wrap` spans the whole screen (the dim also covers the side margins, so the side buttons stay inert) and `.cbox` uses `zoom:var(--cz)`; `fit()` sets `--cz` = max(1.4, 0.9/u) and `--ah` (usable height) so the card height and width are computed in zoomed units. The close button and shop Buy/Try buttons get sideways sizes.
- QA: the layout check now sweeps every screen for 44 px targets sideways (title, each title card, game, run end card); the old "known gap" is closed. Measured: 892 x 412 and 640 x 360 pass.

### Round 48: Roomy letters and the soft HUD plate
- **Roomy letters** (Settings, field `ro`, off by default, page attribute `data-ro`): letter spacing .04em, word spacing .16em and line height 1.55 on card text and menu buttons (cards get about 25 percent taller and scroll more). Picture first: `mockups/roomy-letters.png` in the project files.
- **Soft HUD plate:** each of the two HUD counter rows sits on a 50 percent cream plate with rounded corners (`.hud .hrow`); the second row hugs its content (right side when left-handed). No blur on purpose: a backdrop blur over the live canvas would be re-filtered every frame. Sideways play and the bonus game keep the bare pills. Picture first: `mockups/plated-strip.png`, middle version.
- Not built, by choice: the solid plate, pinch zoom (X81), extra palettes (X61).

### Round 49: Device check (tester build only)
- Test Lab, Checks row, **Device check (20 s)**: plays Stage 2 wave 3 in real time with the throwing helper (`labBot`), skips a 2 s warm-up, then records 20 s of real frames through `labTick` (a one-line hook in `frame()`, null in the public game) and ends with a plain-words card: Smooth, Mostly smooth, Choppy or Could not check (tab in the background, or too few frames), the likely cause (the game's own work versus the browser or device), frames a second and the screen rate it seems to run at, frame time percentiles, hitches (FrameMeter), the game's own work per frame, whether picture quality dropped, start time, browser, screen, cores, graphics name, settings and the user agent.
- **Copy report** puts the same text on the clipboard (clipboard API, then a hidden textarea as the fallback; if both fail the text on the card is selectable) so one paste brings the numbers back. Flash check stays separate because it steps time itself and says nothing about device speed.
- QA: `window.__deviceCheck({warm, run}, cb)` runs a 1.5 s version in the tester suite and checks the report lines and the verdict word.

