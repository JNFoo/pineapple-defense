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
- Lime Launcher (no missiles without it; with it, shield snowballs pop before the Champion loses health; missiles in flight stay bounded), combo calls, paper umbrellas (no cheer loss, stock counts), Air Raid (stock, one at a time), gulls (grab and leave), run speed math and its cap.
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
