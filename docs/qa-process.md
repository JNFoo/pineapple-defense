# QA and build process

Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).

## One command
- `python3 -I tools/qa.py` builds, syntax-checks every inline script, then runs the in-page suite in Chromium (about 10 seconds).
- `--ff` also runs it in Firefox 158 (the stress test, about 25 seconds). `--lab` tests the tester build. `--min` tests the esbuild-minified page (`build.py --min`), which is the page that gets packed. `release.py` also opens both packed files (the regular one in all four test browsers, the tester one in Chromium) before it stamps anything. `--fuzz N` fuzzes N game seconds per stage (default 60). `--force` ignores the cache. `--shots DIR` saves screenshots.
- Test browsers (rule from 2026-10-17): only the ones on the `browsers` branch of lfcfoundry/knowledge-base, one at a time, version labeled: Firefox 158, ungoogled Chromium 155 and WebKitGTK 2.52.6 / GNOME Web 46.5. Read that branch's README before each run, since versions can change and browsers can be added or removed (the release tool prints a reminder). `install.sh` (as root, for WebKitGTK) installs them. Point the harness at them with `PD_CHROME` (Chromium path, required), `PD_FF` and `PD_GECKO` (Firefox and geckodriver paths, for `--ff`); `--wk` needs `WebKitWebDriver`, `xvfb-run` and `dbus-run-session`, which the installer provides. WebKitGTK ignores the window size, so its layout check runs at about 447 x 877. `tools/release.py` always runs all three, writes the versions that really ran into the changelog entry ("Tested in") and refuses to finish if the README does not name them. Stock Chromium, Chromium 153 and Firefox 157 are not used.
- `python3 -I tools/qa.py --gnome` also runs the checks in GNOME Web (Epiphany) itself, the real browser on WebKitGTK's engine; it is not one of the three release browsers, so a release does not need it.
- `python3 -I tools/qa.py --packed FILE [--ff] [--wk]` opens a packed file (what players get) and runs the two smoke checks; no build, nothing cached or recorded.
- `python3 -I tools/release.py` runs QA, then writes the regular and tester files into `dist/` and prunes older ones (keeps the newest two versions).

## Why it is cheap
- Time is fast-forwarded inside the page (`__pd.step`, only available with `#qa`), so no waiting on frames and no per-frame screenshots.
- One browser session runs everything. The old approach launched a browser for each throwaway script.
- A cache (`.qa-cache`, not committed) skips the whole run when the built page and the suite are byte-identical to the last passing run.
- A JavaScript syntax error stops the run in under a second, before any browser starts.
- Layout checks measure element rectangles instead of relying on screenshots.

## Keeping the checks fast (rules from the universal QA guide, 2026-10-17)
- **Time every check first.** `QA_TIMES=1 python3 -I tools/qa.py ...` also prints where each browser's time went (start, page load, suite, layout) and its five slowest checks. A check that takes a round number of milliseconds is a sleep, not work.
- **Do not draw frames nobody looks at.** `__pd.step(sec, dt, every, lazy)` draws and refreshes the page at the end of every call; in a loop of 0.05 s ticks that was hundreds of full frames per Champion fight. WebKitGTK queues them and pays at the next pause (a stage start 12 to 18 s later, which is what used to time out). The suite's `tk(sec, dt)` ticks without drawing and draws one frame every 20 ticks (one game second), so the draw code still meets every phase of a fight. The fuzz check keeps drawing every 25 ticks, and the page's own loop draws real frames whenever the suite waits.
- **Wait for the thing, not the clock.** The suite polls with `wf(condition)`; the FPS badge check waits for the badge text instead of 1.3 s. The WebDriver legs wait for the test hook instead of sleeping 0.4 s.
- **A fake clock for the game's own timers.** `fakeClock()` moves `performance.now()` forward (hold-to-reset reads it), so the run-end check jumps over 1.2 second holds instead of sleeping through them. It also tests more: a 1.1 second hold must not finish and a 1.3 second hold must. Broken on purpose, a hold length of 1.0 s and one of 1.5 s both fail the check. Only the game's own timers can be jumped; CSS animations still take real time.
- **Layout sizes run side by side.** The six sizes are independent pages (each in its own browser context, so the twin-tab guard never sees a second copy); all six scripts start, then the results are collected. It is one browser, not several.
- **Smart mode.** `--smart` compares file fingerprints with the last passing run (`.qa-smart.json`, not committed): only notes changed means no browser run, nothing changed means a 2 second smoke check (load and stage 1), anything else means the quick tier. No earlier pass for the requested browsers means the quick tier. A pass of the quick tier counts as the baseline, so `--smart` is for iterating; the full run before a release is unchanged.
- **Off switches.** Every shortcut can be turned off: no `--quick` or `--smart` runs everything (`tk` is the only change to what the checks do and the full run uses it too, so a check that must draw every tick calls `P.step` directly); `--only` and smart's smoke skip the layout sizes, a full run never does.
- **Measured (2026-10-17, Chromium 155, Firefox 158.0, WebKitGTK 2.52.6, quick tier):** see the changelog entry for the numbers.

## What it checks
- All five stages start and run with the auto-player; no NaN positions, cheer in range, bank a whole non-negative number, particle and shot lists bounded.
- Lime Launcher tiers (never more limes than 6 / 12 / 20 per fight), Lime Launcher (no missiles without it; with it, shield snowballs pop before the Champion loses health; missiles in flight stay bounded), combo calls, paper umbrellas (no cheer loss, stock counts), Air Raid (stock, one at a time), gulls (grab and leave), run speed math and its cap.
- Champion fights (Flipper only hurt while up, Slidealot charges and is knocked back and the table bonk costs Cheer, Mohawk shielded by her squad then open, Bernard's clones pop and never exceed two), thrown pineapples (harder flick lands farther, a miss stays put, a vanished target is flown past), the auto slingshot's small turn.
- Comfort settings (left-handed mirror, aim help widths, the 3-2-1 resume countdown, large text, high contrast), stage replay (credits paid, saved run untouched, best scores), shop Try it (save restored afterwards) and Undo (refund), the next-goal chip.
- Card flows: stage clear cards, the run-end card (Save and restart, Reset completely, the confirm step, trophies kept), pause keys.
- Random-action fuzzing of raids, pickups, gulls, combos, pauses, taps and zones across every stage, clicking through win and lose cards.
- Layout at 360x640, 412x915, 1280x720 and 820x1180: no sideways scroll, HUD pills do not overlap, the raid button clears the cheer bar and the picks, cards fit the screen.
- Every floating word (pop text) has at least 3:1 contrast against its cream outline, read straight from the source before any browser starts.
- Any page error or console error fails the run.

## Old saves
Opening a save from an older build keeps all fields and fills the new ones with zeros (checked by loading an older build's save into the current one).

## Minified build
`python3 build.py --min` (and `--lab --min`) writes `dist/min/index.html` and `dist/lab-min/index.html` with every inline script and style run through esbuild (`npm i --no-save esbuild`, or set `PD_ESBUILD`). `release.py` tests that page with the same suite and packs it; if esbuild is missing it says so and packs the readable page. Scripts and styles are minified in one pass, each closed by its own tag, because the game script contains the text `</style>` inside a string.

## Habit
Design iteration: do not run QA until the design is settled. Before a release: `release.py --ff` once.

Round 33 additions: the fuzz test also plays all five Champion fights with every upgrade on (random raids, pickups, pauses, wild flicks); new tests cover the helpers waiting for the first throw, the two-rolls-per-run limit (card, secret spot, stage 4 offer) and the odds of a wobbly Pineapple Roll flick sinking (at least 40% at 6 degrees and 12%, and every hole value reachable).

Round 39 additions: the settings rows (each has a help line and a state), game speed steps and wraps and really slows the game clock (60% ran at about 60%), large buttons and battery saver switch, and no storage warning when saving works.

Round 43 additions: keep-screen-on is wanted only while playing (and held, or refused by the browser, never both ways); Champion tips stop after a win and the helper hint is counted across visits; the assist offer appears on the second loss of the same wave only, once; a lost canvas context pauses and offers Reload; a twin tab shows its card, does not write the save, and the real two-tab test (two pages from the shipped file) shows the card in the second tab and swaps on Use this tab; the tester's color view changes the screenshot (Normal against Protan, Deutan, Tritan and Gray, Gray with no color), in Chromium and Firefox; the docs check and its nine planted-drift tests; the hooks test. `python3 -I tools/docs_check.py` takes 0.1 s.

Round 42 additions: `--quick` (about 25 s), `--calm`, `--only REGEX`; back swipe guard follows play and pause; the resume snapshot is kept, resumed and dropped; hit pause freezes only the hit object and nothing in Calm; shake strengths; sticky aim and its window; coalesced-event flick; Little hands setup and undo; the grown-ups card text; canvas calls per frame under a ceiling and `save()`/`restore()` balanced; the old-save fixture loads; no network call or link in the shipped page. Time budget: full run about 70 s in Chromium plus about 70 s in Firefox; quick tier about 25 s. Use quick while iterating and the full run once before a release.

Round 41 additions: the layout check runs a Large-buttons combination; edge touches at the screen edge reach the pills and pause; the first-run card sets Flick or Tap and closes; the early flick helper keeps a flick 0.1 s early, drops one 0.3 s early, and does nothing when off; the FPS badge text accepts the tap line and the verdict; fonts are embedded as WOFF2.

Round 46 addition: a check that the header comment (forged by, MIT, copyright, branding notice) and the title credit are in the page.

Round 45 additions: the layout check also runs sideways (892 x 412 and 640 x 360; there every screen is swept for 44 px targets from Round 47, and the side-margin picks, Rain and Pause are checked to stay on screen without overlapping the counters); checks for the shorter waits on a cleared stage and for no sideways tip upright; `tools/motion_audit.py` lists animation lengths.

Round 44 additions: the layout check sweeps every visible button, link and field on the title, each title card and the game screen for a 44 CSS px minimum (weapon picks skipped because of their invisible pad); the run end test now holds the Reset button (a tap, an early release and a slide-off must not reset; the lift of the same finger must not click Undo; Undo must bring the save back); new checks for shop reasons and sizes, the Pause size, the pressed ring, the Resume skip, Every finger plays, the Danger glow default and draw and, in the tester build only, the Flash check (plus a synthetic strobe that proves the meter counts) and First tap time (a plain verdict each).

Round 40 additions: tap or hold on a penguin throws at it and the hold repeats at the cooldown on the Champion, a flick still works, off means taps do nothing, and the FPS badge shows only when on, has three lines of numbers and covers no button. Count throws by the cooldown jump, since the live shots array shrinks as shots land.

Round 38 additions: the run end card has three buttons, and Save and go to title closes the card, shows the title screen and writes the credits to the saved game.

Round 37 additions: sling tilt (at most about 7 degrees under a hard sideways drag), no throws or helper shots during Ready, Set, GO and free after GO, and the tour (five cards with pictures and Skip, flag saved, replay from How to play).

Round 36 additions: the prop rate test (about 33% have a prop, 8% two or more) and the icon test (21 distinct trophy icons and a shop icon on every row).

Round 35 additions: outfits (shape, mostly dressed, mecha bare), the progress bar stage label and hidden wave pill, scenery taps on stages 4 and 5 (cloud, duck, balloons), and the rim test (14 flicks: longest hang at most 0.5 s, rim touches, lip-outs). The mecha test now re-parks penguins each try so it no longer depends on a lucky fish.

Round 34 additions: new tests for the Auto Slingshot (tosses at least 2.8 s apart, about 28% miss), mecha penguins (a Gentoo that eats a fish gets 3 hits), the progress bar (segments change per wave, medal lights for the Champion), more fish in wave 4 than in wave 2, no "giggl" anywhere in the page, the Pineapple Roll chase camera (no zoom while balls remain; zoom above 1.3 and slow-mo below 0.5 on the last ball; eases back out) and the roll speed (a strong flick crosses the lane in under 0.7 s). Do not override `Math.random` with a constant in tests: the game has loops that need variation and will spin forever.
