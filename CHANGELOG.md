# Changelog

Pineapple Defense. Version stamps use `year.month.day.HHMM` (US Eastern). Copyright (c) 2026 JNFoo. All rights reserved.

## 2026.10.13.0956
- **Lime Launcher tiers are now supply, not speed:** 6, 12 and 20 limes in every Champion fight (shop rows: Lime Launcher, More Limes, Lots of Limes, same prices), fired at one steady pace. The missiles are now round limes with a leaf that tumble in flight, a little bigger.
- **Umbrella stutter fixed:** the umbrella canopies and every sprite's small copies are now built in the background, so the first Brolly (or the first new mood) no longer costs a frame. Opening the first umbrella dropped from about 21 ms of extra work to under 7 ms in the test browser.
- Gulls swoop lower (and a little bigger) so they are easier to see.
- Tester (Lab) build: the pickup button that said Brrr now says Toasty.

## 2026.10.13.0008
- **Comfort settings** (Settings card): left-handed layout, aim help (Generous, Normal, Off) with a dotted aim arc for the first 5 throws, high contrast (auto marker gets a diamond emblem, snowballs and raid hazards get outlines or dashes), large text, Calm mode mirrored. A 3, 2, 1 countdown follows every pause, and rotating the phone pauses.
- **Shop:** a **Try it** button runs a short demo of an upgrade on a copy of your save (nothing is spent or earned), and **Undo** refunds the last purchase.
- **Replay:** replay any cleared stage from the title for full credits; your saved run is untouched; best score per stage is kept. A next-goal chip shows the cheapest upgrade you do not own yet.
- Speed: canvas calls per frame down about 51% since the previous round (952 against 1,936), no gradients created per frame, five small resolution steps instead of three big ones, confetti recycled, cheaper draw-order sort, and stage-one art loads first (tap to first frame about 175 ms instead of 300 ms in the test browser).
- Build: `build.py --min` minifies the inline script and CSS (esbuild, optional); the QA suite and the packer use it; `qa.py --min` tests the minified page.
- `docs/ideas-qol-and-performance.md` now carries the status of every idea and an audit with before and after numbers.

## 2026.10.12.2343
- New shop item: the **Lime Launcher**, a small green slingshot that stands on the table on its own (no Auto Slingshot needed). Three tiers: buy it (80), More Limes and Lots of Limes (see the later entry: the tiers became limes per fight). In Champion fights its homing lime missiles pop the snowballs around the Champion first; any missiles left over hit the Champion. Missiles count toward combos.
- Graphics polish: richer penguin, Champion and pineapple sprites, glossy shared trophy, heart, medal, pause and raid icons, a more detailed fish and gull, wooden slings with a green variant.
- Speed: canvas calls per frame down about 47% (stand, sling frames, badges, trophy and umbrellas cached; confetti drawn in color batches; smaller sprite copies for small penguins); the Paper Umbrella shelf moved to make room.
- New file: `docs/ideas-qol-and-performance.md` (10 comfort ideas and 10 performance ideas).

## 2026.10.12.2307
- Run-end card: **Save and restart** keeps upgrades, credits, trophies and the speed streak; **Reset completely** (with a confirm step) erases upgrades, credits, streak and progress, and keeps trophies.
- One-command QA (`tools/qa.py`) and release (`tools/release.py`): time is fast-forwarded in one browser session, random-action fuzzing, layout checks at four screen sizes, Firefox option, cache that skips unchanged builds. See `docs/qa-process.md`.
- Fixes found by the audit: the Air Raid line now lands mid-field when no penguins are near; test hooks corrected.

## 2026.10.12.2253
- New shop upgrades: **Gull Pals** (3 tiers), **Paper Umbrellas** (3 tiers, an automatic last resort), **Air Raid** (2 tiers, button under the Cheer bar or the R key).
- **Combos:** calls grow with the chain (Double up to LEGENDARY) with rays, rings, confetti and shake. Slingshot, Auto Slingshot, splash and raid hits chain together; mixed chains are called Team.
- **Runs:** every finished run makes penguins and Champions 10% faster (capped at double speed); one new challenge per run (+100 Golden Pineapples); 11 new trophies (21 in all).
- Pickups and trophies on the table arrive with rings, a spinning halo and sparkles.
- Redrawn slingshot (wrapped grip, brass caps, shaded fork, stitched pouch); the projectile now shows its back instead of a face.
- HUD: one bank counter (the duplicate stage counter is gone) and a trophy count with an icon.

## 2026.10.12.2223
- Harder, more distinct Champions; Champion health bar on the left edge; new lane art for every stage; secret tap spots; Toasty! replaces Brrr!; P pauses.

## 2026.10.12.2205
- Live bank and per-throw costs; Champion lane blocking; parachute fish and evolving penguins.

## 2026.10.12.2112
- Five stages of five waves, with stage scenery and five Champions.

## 2026.10.12.1918 to 2026.10.12.2020
- More top counters, vertical Cheer meter, labeled pineapples and pickups, pickup guide, README pictures, and a long run of polish and stability fixes.

## 2026.10.12.1726 to 2026.10.12.1752
- Tall 9:16 stage, table power-ups and trophies, Auto Slingshot, animated scenery, redrawn sign, compact dialogs, packed single-file build tool, new logo.

## 2026.10.12.1655 to 2026.10.12.1712
- First playable stage 1: five lanes, waves, Rockhopper and Adélie, Classic and Lobber pineapples, Cheer meter, pause, end cards, Calm mode, saves with Continue, flick throwing, Coach Waddles.

## 2026.10.12.1556
- First title screen, logo and original pineapple and Rockhopper sprites.
