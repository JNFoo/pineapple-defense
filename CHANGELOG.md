# Changelog

Pineapple Defense. Version stamps use `year.month.day.HHMM` (US Eastern). Copyright (c) 2026 JNFoo. All rights reserved.

## 2026.10.14.0817
- **Back swipe pauses.** On Android (Chrome 126+, Firefox 149+) the back swipe or back button now pauses the game instead of leaving the page. On the Paused card a second back leaves as before. Esc still pauses too.
- **A thrown-away tab costs less.** Pausing (which also happens when the tab is hidden or the phone is locked) notes how many penguins were left. If the browser throws the tab away, Continue picks that wave up with only those penguins, the same Golden Pineapples and the cheer you had, and says "Welcome back!". A cleared wave, a lost wave or a new game drops the note.
- **Little hands setup (Settings):** one tap sets tap or hold to throw, large buttons, larger text, the early flick helper and the most forgiving aim help. Game speed is not touched, so no trophy is affected. Tap again to undo.
- **Game feel (Settings, all for you to try):** *Hit pause* (off): only the penguin you hit freezes for a blink, 35 to 160 ms, never the game clock. *Screen shake* (Normal, as before): Off, Low, Normal or Strong; Strong also shakes a little on every hit and a lot on a Champion hit. *Sticky aim* (off): your last target stays picked for 0.9 seconds so a neighbor does not steal the throw (needs Aim help on). *Smoother flick speed* (off): reads every finger sample the device reports. Hit pause and shake are off in Calm mode.
- **For grown-ups (Settings):** a plain card saying no ads, no purchases, no accounts, no network, what is saved and how to clear it. The checks now fail if the shipped page ever contains a network call or a link out.
- **Checks got cheaper and wider (developer):** `qa.py --quick` (about 25 s instead of about 70 s), `--calm` (the whole suite with reduced motion on), `--only REGEX`, a per-stage canvas-call ceiling using `canvas-probe` from JS-modules, and a frozen save from the 2026.10.13.2220 release that must still load and Continue.

## 2026.10.14.0743
- **First-run choice, Flick or Tap:** after the tour (or when you skip it) a new game asks "How do you want to throw?" with two big picture buttons. Tap turns on tap or hold to throw; Flick leaves it off. It asks once and says you can change it later in Settings.
- **Edge touches count:** the Classic and Lobber pills and the pause button now answer a touch a little outside their drawn edge, so a thumb at the very edge of the screen still hits them. They look the same.
- **Large buttons fix:** with Large buttons on, the Pineapple Rain button no longer overlaps the cheer bar. The layout check now runs this combination too.
- **Early flick helper (Settings, off by default):** a flick that comes up to 0.15 seconds before the sling is ready is kept and thrown the moment it is ready, so quick fingers are not ignored. One flick is kept at a time. Same speed, costs and trophies. It is independent of Calm mode.
- **FPS badge upgrades:** the badge now shows the tap delay (from your touch to the next picture, median of the last 20) and a plain-words verdict: "smooth", or "2 hitches: the game / the device / both". It uses the new `FrameMeter` from JS-modules.
- **Fonts are WOFF2** (about 30% smaller than WOFF) when the build machine can compress them, otherwise WOFF as before.

## 2026.10.13.2220
- **Tap or hold to throw (for the youngest players):** a new Settings row, off by default. Tap a penguin (or the Champion) and a pineapple flies straight at it; keep your finger down and it keeps throwing, each time the sling is ready, until that penguin is bonked. Then tap the next one. Flicking still works, and a tap on empty ground still does nothing. The speed limits, Lobber and Mega costs, sling cooldown and all trophies are exactly the same.
- **FPS counter:** a new Settings row, off by default. A small badge in the bottom corner (opposite the pineapple buttons, so it never covers one) shows frames a second, the slowest frame in the last half second and the quality level (0 is the prettiest). It updates twice a second and costs almost nothing.
- **New notes file:** `docs/lessons-and-inventions.md` (what building this game taught us, and what exists here that is not in the other repos).

## 2026.10.13.2111
- **Settings dialog redone in the style of Fancy, the Banana:** big rows, each with a title, a one-line help and an On/Off (or value) pill. New options: **Game speed** (100%, 90%, 80%, 70% or 60%, set on the title screen; the Faster Fun and Top Speed trophies need 100%), **Large buttons** (bigger pineapple, pause and Rain buttons), **Battery saver** (about 30 pictures a second) and **Full screen** (where the browser allows it). Left-handed, Aim help, Aim dots, High contrast, Larger text and Calm mode moved into the same rows.
- **Save warning:** if the browser refuses to keep the saved game (a private window, perhaps), the Save code section now says so and points to the save code and save file.

## 2026.10.13.2059
- **The victory card ("You did it!") now has Save and go to title.** It offers Save and restart, Save and go to title (saves your game and returns to the title screen) and Reset completely, like the other games' "rest at the title screen" option. The cards can show a third button now.

## 2026.10.13.1645
- **First-load tour for kids:** five short picture cards (Welcome, Flick to throw, Bonk a penguin, Keep the cheer up, Waves and Champions) with a big Next button, Back, dots and a big "Skip the tour". It shows once on a brand-new game (never for anyone who already played), and you can replay it from **How to play** with "Play the tour". Calm mode stops its animations.
- **The main slingshot only tilts a few degrees** now (at most about 7), like the helper slingshots, instead of swinging far left and right. Throws still go exactly where you flick.
- **Pineapple buttons are short, wide pills** (Classic and Lobber side by side, about half as tall) so they cover less of the lane.
- **No throws during the Champion's Ready, Set, GO.** Nothing leaves any slingshot (yours, the Auto Slingshot or the Lime Launcher) and the Pineapple Rain button waits, until GO. A flick shows "Wait for GO!".
- **Stage 2's flip-flops look like flip-flops:** foot-shaped soles with a toe post, a Y strap and a thick edge.
- **Every stage opens with its name** (Stage 1 too, which was skipped before).

## 2026.10.13.1614
- **Penguin props are rarer.** About 1 in 3 penguins wears something now, about 1 in 12 wears two, and three at once is very rare. It makes a full outfit a treat to spot.
- **An icon for every trophy, upgrade and pickup:** 21 glossy round trophy badges (they show in color when earned and gray when not), nine shop upgrade icons and four pickup icons, now in the Trophies and Shop screens.
- **New logo:** the little penguin in the title wears a beanie and scarf. The banner in the README is rendered from the live title.
- **New README** written for players, with screenshots of all five stages, Pineapple Roll, the trophies and the shop, and icon tables for every upgrade, pickup and trophy. Developer notes moved to the bottom.

## 2026.10.13.1537
- **Pineapple Roll rims have drama.** Each ring now has a rounded lip: a ball that clips the edge rattles around it and can drop in, lip out, or pop in and straight back out like a basketball. The invisible "catch" is gone: the push that slid a ball off a ring's flank pointed uphill and balanced gravity, so it now runs downhill and balls roll off instead of hanging (longest hang in the test 0.00 s; about half of rolls now touch a rim). The cup front is redrawn over a ball that is dropping in so it really goes inside. The share of balls that sink stays at 40% or more.
- **Penguins dress up.** Almost every penguin now wears a random mix of warm hats (beanie, ear flaps, Santa cap, earmuffs, party cone), scarves, mittens and a held item (hot chocolate with steam, a candy cane, a cookie or a snowball). Scarves and hats sway as they waddle. Mecha penguins and the Champions keep their own look.
- **Stage 4 (the storm):** a lighthouse that sweeps a beam, a cloud with a face that smiles and shows a rainbow when tapped (it also does so on its own every so often), a sailboat and toys on the waves, a duck that says Quack, a whale that says Boop, and a lighthouse that says Flash.
- **Stage 5 (the fortress party):** floating balloons you can pop (they float back), a turning disco ball that sprays colored light, a snowman DJ, fireworks and searchlights, a softly lit dance floor, string lights, party-hat penguins.
- **Progress bar now starts with the stage label** (S1 to S5). The separate wave counter is hidden during play because the bar already shows it.
- Speed: stage 4 and 5 draw about 38% more canvas calls per frame (834 against 604 mean on the audit scenes, mostly cached stamps); frame time in the test browser is a median of 0.5 to 0.6 ms and about 1.4 to 1.9 ms at the 95th percentile. Lights and floor tiles turn off or shrink on lower quality tiers and in Calm mode.

## 2026.10.13.1452
- **Auto Slingshot is a helper, not a replacement.** It tosses slower (every 5.2, 4.2, 3.4 and 2.8 seconds by Faster Fling tier) and sometimes misses, landing just beside the penguin (28% of tosses, 20% with Better Pineapples 1, 12% with tier 2). The shop says so.
- **Stage progress bar** across the top of the game: one segment per wave that fills as the wave is cleared, and a Champion medal that lights up for the Champion fight (like Apple Press).
- **Mecha penguins:** a Gentoo that eats another fish becomes a mecha penguin: steel armor, antenna, glowing chest core, 3 hits to defeat (a Gentoo takes 2, a Champion much more) and a "Clang!" when it is hit. Mecha penguins walk a little slower than Gentoos and are worth more.
- **More fish in waves 4 and 5 of every stage:** the fish falls faster and lands farther, the first fish comes sooner, and two can be on the field at once, so most players will see a few fish every stage.
- **Graphics pass on the main game:** drifting light rays, cloud shadows and floating motes on every stage, puffs of snow behind walking penguins, a squash when a penguin is hit, a sparkling sun on the title screen, a shimmering sea and a shiny Play button.
- **Kid-friendly words everywhere:** how to play, about, cards, trophies and challenges are written for kids, and nothing giggles any more (penguins are now "happy", "glad" or "smile").
- **Pineapple Roll feel:** the ball now rolls 1.7 times faster (the game clock inside the minigame runs 1.7x, which makes gravity feel like the real thing instead of rolling in molasses). The landing spots are unchanged, so every flick lands where it did before, just sooner. Also more realistic: rolling resistance with a speed-dependent part, a hard landing bounces higher than a soft one, walls take a little speed from a sliding ball, and the ball squashes on landing.
- **Pineapple Roll chase camera:** on your last ball the view glides after it up the lane and over the board, leans in near the rings, slows to about 0.3x speed for the drop into a hole, shakes a little on rim and wall knocks, then eases back out for the end card. Calm mode keeps the view still.
- **Pineapple Roll graphics:** a dusk fairground with a turning Ferris wheel, circus tents, pennants, party lights, floodlights and sweeping light beams; a marquee with chasing bulbs and a neon glow; brass rails, felt grain, a warm light pool, lacquered wood grain; color-coded glowing rings (the 100s pulse); a shinier pineapple ball with a trail, a glow on the felt and dust when it lands; light columns, ring bursts and sparks when it sinks; livelier crowd with a wave and camera flashes.
- Speed: about 6% more canvas calls per frame than the previous build for everything above (951 against 894 on the audit scenes); the minigame costs about 0.3 ms more per frame in the test browser.

## 2026.10.13.1405
- **Ready, Set, Go!** While a Champion strolls out to the table, the banner now says Ready..., then Set..., then GO! when he stops. He cannot be hurt until GO!.
- **The helpers wait for you.** The Auto Slingshot and the Lime Launcher now stay quiet each round (every wave and every Champion fight) until you throw your first pineapple; then they join in after a short beat. A one-line hint explains this at the start of a stage (twice per visit at most). The shop demos still start them at once.
- **Pineapple Roll is limited to two plays per run** so it cannot be an endless source of credits. The count resets when you finish the game or reset. After the second roll the card says it was the last one, the stage 4 offer to roll disappears, and the secret spot gives a little shake instead.
- **Pineapple Roll is easier to flick:** the flick angle steers less (gain 0.3 instead of 0.7), the whole flick speed range now spreads over a wider band (so a small speed error moves the landing less), and a ball that reaches a hole sinks a little more readily. There is no aim assist. In the test browser, a flick with a typical 6 degree and 12% wobble now sinks about 58% of the time (it was about 30%). The roll also runs in fixed 1/240 second steps so it plays out the same at any frame rate.
- **Bug hunt and performance audit with every upgrade and special on** (Auto Slingshot, Faster Fling, Better Pineapples, Lime Launcher tier 3, Gull Pals, umbrellas, Air Raid, pickups) across all five stages and all four Champion styles, plus Champion fights with no throws, wild flicks, pauses and shop demos: no errors, no out-of-range values, nothing left over between stages, and every list stays small (confetti 160 at most, 25 rings, 11 shots, 2 limes in flight, 2 clones). Median frame cost 0.5 to 1 ms (software rendering), 95th percentile 1 to 2 ms, worst frames under 10 ms. The QA fuzz now also plays every Champion fight with everything on.

## 2026.10.13.1256
- **Champion fights are different now:** Captain Flipper hides behind three ice blocks and pops up behind one (the block shakes first); Sir Slidealot charges at your table and every hit knocks him back; Madame Mohawk is shielded by her squad until you clear it, then she is open for a few seconds before a bigger squad comes; Grand Champion Bernard brings icy clones and only the solid Bernard counts. Coach Waddles keeps the snowball fight. Each Champion shows a short tip when the fight starts.
- **Thrown pineapples:** a harder flick with nothing to aim at now flies farther (it used to land near the table), a miss lands with a puff and stays put instead of rolling, and a pineapple aimed at a penguin that is already gone flies on and falls farther up the lane.
- **Limes** now leave a vapor trail and fly like a spiralling football (long axis first, rolling, on a tight corkscrew path).
- **Auto slingshot** no longer leans: it turns only a few degrees toward its target (the Lime Launcher too).

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
