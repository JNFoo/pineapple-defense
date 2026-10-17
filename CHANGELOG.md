# Changelog

Pineapple Defense. Version stamps use `year.month.day.HHMM` (US Eastern). Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).

**Tested in:** each release below lists the browsers its checks ran in, taken from what the test runs recorded. Where a version was not recorded it says "not recorded"; nothing here was guessed or re-run after the fact. Since 2026-10-17 the rule is Firefox 158, ungoogled Chromium 155 and WebKitGTK 2.52.6, one at a time.

## @VER@
- **Saving code brought up to date (JS-modules save-kit 1.1.0, API 1):** the game carried an older copy that came before version labels. The new one fixes two bugs that do not show up in normal play: a default value was shared with the live state, so editing the state could change what a later reset gave back, and a default for a counted field was ignored when the field was missing. It also loads a saved game about 28 to 50% faster (the old time was tens of microseconds, so you will not feel it) and can warn an old tab when another tab saved. Cost: the readable page grows from 588 KB to 600 KB (about 2%, mostly notes in the code) and the shrunk page from about 418 KB to 423 KB (about 1%). Nothing in how saves or save codes look changed: a save code made by the old copy loads in the new one and the other way round (checked with a sample save in Node 22), and the old saved game in the checks still loads.
- **Tested in:** ungoogled Chromium 155.0.8059.39, Firefox 158.0, WebKitGTK 2.52.6 (quick check, one at a time); ungoogled Chromium 155.0.8059.39 (full check, 51.5 seconds). Not a release yet: the stamp comes with the next release.

## 2026.10.17.0716
- **Device check (tester build only):** one button in the Test Lab plays Stage 2 wave 3 for 20 seconds (after a 2 second warm-up) and ends with a plain-words verdict: Smooth, Mostly smooth, Choppy, Slow or Could not check. It also reports frames a second, the slowest frames, how long the game's own work takes per frame, and whether picture quality had to drop, and a Copy report button puts it all on the clipboard to paste into a message. On the test laptop it reads Smooth at 60 frames a second.
- **Slow phones are now called Slow, not Smooth:** a steady 8 to 15 frames a second used to count as Smooth because the frames were even. Now a typical frame over 25 ms (under 40 frames a second) is Slow, and over 40 ms (under 25 frames a second) with Battery saver on, because the game then draws about 30 pictures a second on purpose.
- **The game steps its picture quality down on very slow devices:** the quality governor (JS-modules frame-kit 1.1.0) used to ignore frames slower than about 10 per second, so a very weak phone never got the cheaper picture. It now counts frames up to 250 ms apart (down to 4 frames a second). In a test with the processor slowed 4 times (about 12 to 16 frames a second) quality dropped one step; before, it stayed at full and the game kept stuttering.
- **Speed meter (FPS counter) up to date, frame-kit 1.1.0 (API 1):** the game now carries the current JS-modules copy of the speed meter, not the first unlabeled one. A tab that comes back after a long break (a gap over 1 second) no longer counts as a hitch: in a test with fake frame times a 5 second break used to show "1 hitch: the device" and now shows "smooth", while a real half-second stall is still counted (1 before, 1 now). It also ignores a tap whose time does not fit the frame clock and counts the breaks it skipped, for a debug line. The other two frame-kit files (smoothing of uneven frame gaps and the quality governor) have the same logic as before and now say "Version 1.1.0 (API 1)"; the page grows by about 4.1 KB (3,293 bytes in the speed meter, 810 in the smoother). Not used here: env-probes and fx-governor (no part of the game or its tools loads them).
- **Sharper title and banner lettering (sticker-text 1.1.0):** the outline around the logo and the stage banners is now one ring of 32 copies instead of 3 rings of 48, which is 33% fewer to draw and misses about 35% fewer edge pixels in the review's tests (1.51% down to 0.99% in Chromium, 1.53% to 0.98% in Firefox, 2.83% to 1.82% in WebKitGTK). Letters with tails (g, p, y) keep their gold fill, and two-line banners no longer need our own white-space rule for the outline copies (removed from the page style). The module's review measured frame time on 40 words repainted every frame: Firefox about 20% faster, WebKitGTK about 25% faster, Chromium about 8% slower; we did not measure the game itself. Checked by eye in ungoogled Chromium 155, Firefox 158 and WebKitGTK 2.52.6: logo and a two-line banner look right in all three, and the stage banner looks the same as before in Chromium.
- **Floating words are easier to read:** four of the 13 floating words were pale against their cream outline: Zippy! 2.00 to 1 became 3.23, Toasty! 2.43 became 3.72, Cheer up! 2.46 became 3.68 and Wait for GO! 2.05 became 3.32 (3 to 1 is the usual floor for big text; the other nine were already at 3.16 or better, the lowest now 3.16). The bursts and glows keep their bright colors; only the floating word is darker. A new check reads every floating-word color and stops the run if one drops under 3 to 1 (it names all four when run on the old colors). Idea from cartoon-3d-kit 1.1.0.
- **Developer:** vendored library headers and `tools/canvas-probe.js` now name LFC Foundry as the copyright holder (they said JNFoo); the checks now run only in the test browsers from the shared browsers branch: `qa.py` takes `PD_CHROME`, `PD_FF` and `PD_GECKO` (stock Chromium is refused), a new `--wk` runs WebKitGTK 2.52.6, and the release tool always runs all three browsers one at a time, stops if one is missing or the README does not name it, and writes the versions that really ran into this entry as "Tested in". Stage starts get more patience in WebKitGTK, which starts stages slower here (6 times the wait, so 24 s instead of 4 s).
- **Developer, checks are about twice as fast:** the quick check run in all three test browsers, one at a time, went from 159 seconds to 72 (Chromium 46 to 21, Firefox 40 to 21, WebKitGTK 73 to 30; measured the same day in ungoogled Chromium 155.0.8059.39, Firefox 158.0 and WebKitGTK 2.52.6, all passing, with the same printed results apart from the checks that count random samples). Four causes: (1) the test loops drew a full picture after every 0.05 second step, about 500 per Champion fight; now they draw once a game second, which also removes the WebKitGTK stall where the stage start after a Champion fight took 12 to 18 seconds and sometimes timed out at 24 (now about 0.1 second; that check went from 25 seconds to 0.7); (2) the hold-to-reset check slept through the real 1.2 second holds, 7.3 seconds, and now jumps a fake clock, 1.0 second, and it also checks that a hold just short of 1.2 seconds does not reset (broken on purpose, a 1.0 second and a 1.5 second hold both fail it); (3) the six layout sizes run side by side, 13.4 seconds down to 5.6; (4) fixed sleeps became waits for the thing itself (the speed badge, the page being ready, the twin-tab card). The full check in all three browsers passed in 160 seconds, the first time the WebKitGTK full tier has finished here (it used to hit its time limit). New: `QA_TIMES=1` prints where each browser's time went and its slowest checks, and `--smart` runs nothing for a notes-only change, a 2 second smoke check when nothing changed, and the quick tier otherwise. The shipped page grows by about 20 bytes (one test-hook option).
- **Developer, the game speed check no longer fails by chance:** in the release run WebKitGTK measured 60% speed as 85% of normal (the limit is 80%) because one browser hitch landed in a 0.6 second sample, although the game was fine. It now takes three samples each and keeps the middle one; alone it read 58 to 66% in five runs. Cost: about 3.5 seconds more per browser. The limits (40% to 80%) did not change. The Reset hold check had the same kind of chance failure in WebKitGTK (real time passing while frames were drawn counted toward the 1.2 second hold, so a 1.1 second hold looked finished); the fake clock now stands still between jumps. Re-tested by making the hold 1.0 and 1.5 seconds on purpose: both still fail the check. The two-tabs check could read the page while the tab that takes over was reloading itself (one failure in about 5 runs); it now waits for the reload to finish (Chromium full check passed 3 of 3 afterwards, 54 to 56 seconds each).
- **Device check runs so far:** the Device check ran on the owner's laptop in Firefox 159.0 (tester build 2026.10.16.2048: Smooth, 60 frames a second) and in the cloud test machine in Chromium 141 with the processor slowed 1, 4 and 6 times. The Pixel 7 Pro result is still open. The release tool adds the "Tested in" line below when the release is cut.
- **Tested in:** ungoogled Chromium 155.0.8059.39, Firefox 158.0, WebKitGTK 2.52.6 (MiniBrowser) (one at a time); the shipped minified page: ungoogled Chromium 155.0.8059.39.

## 2026.10.16.1720
- **Sideways menus and cards:** held sideways on a phone, the title buttons now sit in the side margins (Play, Continue, Replay a stage and Shop at left; How to play, Trophies, Settings and Calm mode at right), and Settings, Shop, Trophies, How to play and the run end card fill the screen and are drawn at least 1.4 times larger than before. Every button there is at least 44 px (the smallest sideways button used to be under that); the layout check now sweeps every screen sideways, so the old known gap is closed.
- **Roomy letters (Settings, off by default):** letters sit 0.04 of a letter-height further apart, gaps between words are 0.16 wider, and lines are 1.55 times the text size tall, in cards and menu buttons. This helps readers who find tight text hard; with it off, nothing changes.
- **Soft plate behind the HUD counters:** the two counter rows sit on a soft cream plate that is half see-through, so the numbers stay readable over busy art, in portrait play (no blur, so no extra cost per frame); sideways play and the bonus game keep the bare pills.
- **Moved:** the game now lives at https://github.com/lfcfoundry/pineapple-defense (play page https://lfcfoundry.github.io/pineapple-defense/) and the shared code library at https://github.com/lfcfoundry/JS-modules; the old addresses redirect.

- **Tested in:** Chromium 141.0.7390.37 (the stock Playwright build, not ungoogled) for the full release run; no Firefox run for this release, because the cloud machine could not install Firefox then. Phone not tested.

## 2026.10.15.1102
- **Forged by LFC Foundry, MIT licensed:** a `LICENSE` file (MIT, with the branding notice and the notices of the vendored pieces), the same header block at the top of every built page (the packed file carries it outside the compressed part too), and "Forged by LFC Foundry, MIT License" on the title screen. First-party source, tool and doc headers now say Copyright (c) 2026 LFC Foundry. The vendored JS-modules files keep their own JNFoo MIT notices. Commits are still authored as JNFoo.
- **Developer:** the header text lives in `src/header.txt` (used by `build.py` and `tools/pack.py`); a new check confirms the header comment, branding notice and title credit are present.

- **Tested in:** Chromium (version not recorded) and Firefox 158 through the release tool; the first release run had one Firefox timing flake (the FPS badge overlapping a pick) that passed on rerun.

## 2026.10.14.1352
- **Sideways play is roomier:** held sideways on a phone, the counters, Pause, the weapon picks and Pineapple Rain move into the empty margins beside the picture and get bigger (the weapon picks were about 75 by 23 px, now 124 by 46). The picture itself is unchanged. While a card is open the side buttons go quiet so a stray tap cannot throw. Left-handed mode mirrors the sides. A small tip, once, on a touch phone: "Turn your phone upright for the biggest view." It never blocks and never comes back.
- **Shorter waits on stages you have already cleared (X66):** the wave intro is 0.6 s instead of 1.2 s, the wave clear 1.0 s instead of 1.7 s, and the wave banners are shorter and pop in faster. A first play and every Champion beat keep their full length.
- **Danger glow is on for everyone (X34):** the red ring and warning sign for a penguin close to your stand now start on; Settings still turns it off, and Calm keeps it still.
- **Developer:** `tools/motion_audit.py` lists every animation and transition length against a small duration scale (no one-shot is over 0.5 s, so nothing was retuned); the layout check also runs sideways at 892 x 412 and 640 x 360; new checks for the repeat waits and the tip.

## 2026.10.14.1334
- **Shop says why (X35):** a row you cannot buy yet stays visible, dimmed with a dashed edge, and tells you what is missing: "Need 30 more", "Needs Slingshot", "Needs Launcher", "Needs More Limes". Tapping it gives a small shake (Calm keeps it still) and never buys. It used to be a dead, faded button with no reason.
- **Bigger buttons (X01, X02):** shop Buy and Try it buttons are now at least 48 px tall (they were 37 to 42), Pause is at least 55 px (was 51) and the Pineapple Rain button at least 48 by 56 (was 40 by 50 on a small phone).
- **Reset needs a hold, and can be undone (X10, X97):** "Reset completely" is now a small quiet link under the run-end buttons. The confirm card has a Hold to reset button with a filling bar (1.2 seconds; letting go, sliding off or a plain tap cancels; holding Enter or Space works too). After the reset a "Fresh start!" card offers Play or Undo reset, which brings back everything exactly as it was.
- **Themed letterbox (X75):** the plain navy bars around the game are now a soft wash that matches the stage (shore sky and sand, ice, lighthouse sunset, storm night, party pink). In landscape the wash is a wide glow instead of a navy strip. No new art, just colors.
- **A tap skips the get-ready beat** after Resume (X21). The tap does not throw.
- **Pressed ring (X08):** any button gets a soft ring the instant a finger lands, so you can see it even where the fingertip covers the button.
- **Every finger plays (Settings, off by default, X12):** a second finger can throw even while another finger rests on the screen.
- **Danger glow (Settings, off by default, X34):** a penguin close to your stand gets a red ring and a warning sign, and the ground in front of the stand glows. Calm keeps it still.
- **Tester only:** Test Lab has a Flash check (two busy scenes played by a helper, counts big brightness flashes per second, plain verdict) and a First tap time line.
- **Developer:** the layout check now sweeps every button for a 44 px minimum on each screen; new checks cover the reset hold, undo and the lift-of-the-finger guard, shop reasons, sizes, ring, resume skip and both new settings.

## 2026.10.14.1256
- **Keep screen on (Settings, on by default):** the screen does not dim while you play. It is let go when you pause, open a menu or card, leave the game alone for a minute, hide the tab, or turn on Battery saver. If the phone refuses (low power), nothing happens.
- **Hints remember:** a Champion's tip now shows only until you have beaten that Champion once (before, it showed every fight), and the "helpers join in" hint shows twice in total, not twice per visit.
- **A kind offer after losing the same wave twice:** "Want a little help?" with three buttons (Yes, a little help / No thanks, try again / Title). Yes turns on the Little hands setup and says exactly what it turned on. It asks once, ever, and never when that help is already on.
- **Two tabs, one save:** a second copy of the game opened in another tab or window plays without saving and says so, with a big Use this tab button. Nothing is overwritten.
- **If the picture drops out** (a graphics reset or low-memory event), the game pauses, keeps your place in the wave and offers Reload.
- **Tester only:** Test Lab has a Color view button (Normal, Protan, Deutan, Tritan, Gray) for checking colors the way a color-blind player sees them.
- **Developer:** `tools/docs_check.py` fails a release on drift in the docs (missing paths, unknown flags, placeholders, wrong trophy or stage counts, stale Status lines); this release fixed four real drifts it found (an old "design phase, no code" line, a stale shop plan, a version in the README status line, one in the ideas file). House-rule git hooks are in `tools/hooks` and checked at release; they now also reject a version stamp that is not year.month.day.HHMM. `build.py` now zero-pads the month and day in stamps. New JS-modules piece: `wake-keeper`.

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

**Tested in, releases before 2026.10.15.1102 (back to 2026.10.12.2343):** the release tool (`tools/release.py --ff`) runs the suite in Chromium and then Firefox, and Firefox 158 was the Firefox the checks were written for. Which of these releases actually had the Firefox run, and the Chromium version, were not recorded. Earlier builds before the one-command tools: not recorded.
