# QA and build process

Copyright (c) 2026 JNFoo. All rights reserved.

## One command
- `python3 -I tools/qa.py` builds, syntax-checks every inline script, then runs the in-page suite in Chromium (about 10 seconds).
- `--ff` also runs it in Firefox 158 (the stress test, about 25 seconds). `--lab` tests the tester build. `--min` tests the esbuild-minified page (`build.py --min`), which is the page that gets packed. `--fuzz N` fuzzes N game seconds per stage (default 60). `--force` ignores the cache. `--shots DIR` saves screenshots.
- `python3 -I tools/release.py` runs QA, then writes the regular and tester files into `dist/` and prunes older ones (keeps the newest two versions).

## Why it is cheap
- Time is fast-forwarded inside the page (`__pd.step`, only available with `#qa`), so no waiting on frames and no per-frame screenshots.
- One browser session runs everything. The old approach launched a browser for each throwaway script.
- A cache (`.qa-cache`, not committed) skips the whole run when the built page and the suite are byte-identical to the last passing run.
- A JavaScript syntax error stops the run in under a second, before any browser starts.
- Layout checks measure element rectangles instead of relying on screenshots.

## What it checks
- All five stages start and run with the auto-player; no NaN positions, cheer in range, bank a whole non-negative number, particle and shot lists bounded.
- Lime Launcher tiers (never more limes than 6 / 12 / 20 per fight), Lime Launcher (no missiles without it; with it, shield snowballs pop before the Champion loses health; missiles in flight stay bounded), combo calls, paper umbrellas (no cheer loss, stock counts), Air Raid (stock, one at a time), gulls (grab and leave), run speed math and its cap.
- Champion fights (Flipper only hurt while up, Slidealot charges and is knocked back and the table bonk costs Cheer, Mohawk shielded by her squad then open, Bernard's clones pop and never exceed two), thrown pineapples (harder flick lands farther, a miss stays put, a vanished target is flown past), the auto slingshot's small turn.
- Comfort settings (left-handed mirror, aim help widths, the 3-2-1 resume countdown, large text, high contrast), stage replay (credits paid, saved run untouched, best scores), shop Try it (save restored afterwards) and Undo (refund), the next-goal chip.
- Card flows: stage clear cards, the run-end card (Save and restart, Reset completely, the confirm step, trophies kept), pause keys.
- Random-action fuzzing of raids, pickups, gulls, combos, pauses, taps and zones across every stage, clicking through win and lose cards.
- Layout at 360x640, 412x915, 1280x720 and 820x1180: no sideways scroll, HUD pills do not overlap, the raid button clears the cheer bar and the picks, cards fit the screen.
- Any page error or console error fails the run.

## Old saves
Opening a save from an older build keeps all fields and fills the new ones with zeros (checked by loading an older build's save into the current one).

## Minified build
`python3 build.py --min` (and `--lab --min`) writes `dist/min/index.html` and `dist/lab-min/index.html` with every inline script and style run through esbuild (`npm i --no-save esbuild`, or set `PD_ESBUILD`). `release.py` tests that page with the same suite and packs it; if esbuild is missing it says so and packs the readable page. Scripts and styles are minified in one pass, each closed by its own tag, because the game script contains the text `</style>` inside a string.

## Habit
Design iteration: do not run QA until the design is settled. Before a release: `release.py --ff` once.

Round 33 additions: the fuzz test also plays all five Champion fights with every upgrade on (random raids, pickups, pauses, wild flicks); new tests cover the helpers waiting for the first throw, the two-rolls-per-run limit (card, secret spot, stage 4 offer) and the odds of a wobbly Pineapple Roll flick sinking (at least 40% at 6 degrees and 12%, and every hole value reachable).

Round 39 additions: the settings rows (each has a help line and a state), game speed steps and wraps and really slows the game clock (60% ran at about 60%), large buttons and battery saver switch, and no storage warning when saving works.

Round 40 additions: tap or hold on a penguin throws at it and the hold repeats at the cooldown on the Champion, a flick still works, off means taps do nothing, and the FPS badge shows only when on, has three lines of numbers and covers no button. Count throws by the cooldown jump, since the live shots array shrinks as shots land.

Round 38 additions: the run end card has three buttons, and Save and go to title closes the card, shows the title screen and writes the credits to the saved game.

Round 37 additions: sling tilt (at most about 7 degrees under a hard sideways drag), no throws or helper shots during Ready, Set, GO and free after GO, and the tour (five cards with pictures and Skip, flag saved, replay from How to play).

Round 36 additions: the prop rate test (about 33% have a prop, 8% two or more) and the icon test (21 distinct trophy icons and a shop icon on every row).

Round 35 additions: outfits (shape, mostly dressed, mecha bare), the progress bar stage label and hidden wave pill, scenery taps on stages 4 and 5 (cloud, duck, balloons), and the rim test (14 flicks: longest hang at most 0.5 s, rim touches, lip-outs). The mecha test now re-parks penguins each try so it no longer depends on a lucky fish.

Round 34 additions: new tests for the Auto Slingshot (tosses at least 2.8 s apart, about 28% miss), mecha penguins (a Gentoo that eats a fish gets 3 hits), the progress bar (segments change per wave, medal lights for the Champion), more fish in wave 4 than in wave 2, no "giggl" anywhere in the page, the Pineapple Roll chase camera (no zoom while balls remain; zoom above 1.3 and slow-mo below 0.5 on the last ball; eases back out) and the roll speed (a strong flick crosses the lane in under 0.7 s). Do not override `Math.random` with a constant in tests: the game has loops that need variation and will spin forever.
