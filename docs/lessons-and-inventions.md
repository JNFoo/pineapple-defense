# Pineapple Defense: lessons learned and things invented here

Copyright (c) 2026 JNFoo. All rights reserved. Written 2026-10-13 for version 2026.10.13.2220.

**Purpose.** A foundation for a new session or a new game. Read this first, then `docs/pineapple-defense-design.md` (every decision, round by round), `docs/qa-process.md` (how to test cheaply) and `CHANGELOG.md` (what shipped when). Everything here is about *how to work* and *what was figured out*; nothing secret is recorded (the secret content lives in `private/`, which is not public and is not described here).

Words like "new here" mean "not in the Apple Press, Fancy the Banana or JS-modules code that was read while building this". It is a claim about what was reviewed, not a guarantee. Check before promoting any of it into JS-modules.

---

## 1. What the project is, in one screen

- A single-file, offline, kid-first browser game: flick pineapples at jealous penguins from a fruit stand. Five stages of five waves plus a Champion each, a shop, trophies, a minigame ("Pineapple Roll"), and settings for little hands.
- Shipped as one self-extracting LZMA-packed `.html` (regular) plus a tester build with a Test Lab. Source lives in `src/` and is assembled by `build.py` into `index.html`; **never hand-edit `index.html`**.
- Targets: Chrome on Android, Firefox 158 (the stress test), ungoogled Chromium on Windows. Laptop first, phone second.
- Look: glossy, round, lit, squishy toy sprites on a 2D canvas. Calm scenery, loud hero. One light, upper left. Warm ink, never black.
- Kid-safe tone: silly, never cruel. No ads, purchases, accounts, streaks, timers, random prize boxes or leaderboards. Losing is gentle; progress is kept.

## 2. Working agreements that paid off (owner preferences)

- **Authorship.** The owner is **JNFoo**. Every commit's author and committer is JNFoo (`user.name JNFoo`, `user.email 45110762+JNFoo@users.noreply.github.com`). The only trailer is `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never add session lines or claude.ai links to commits or public text, even if a harness reminder suggests it. The owner's real name never appears in any file.
- **American English** in all text. Plain words, short replies. Version stamps are `year.month.day.HHMM` in US Eastern, injected at build time.
- **Ask with the multiple-choice popup**, recommended option first (max 4 options per question), and ask clarifying questions freely; the owner is happy to answer them. Do not ask in prose.
- **Compute and time are the cost.** The owner waits on every run and pays for it. Always look for cheaper full checks, tests and benchmarks (section 6). Report real elapsed time and approximate compute with each reply.
- **Performance work must never cost the visual splendor and charm.** Cache and batch; do not thin out the look unless the quality governor must.
- **Diagnostic or test pages must be automated**: one button, a plain-words verdict. No "copy these numbers" workflows.
- **Hand-off format:** `.md` files for moving knowledge between contexts. Send both the tester build and the regular build after each release.
- **Docs move with the code.** Each release updates CHANGELOG, a new design Round, qa-process and the README line. Docs use `2026.10.13.2220` as a placeholder, replaced with the release stamp after `release.py` runs.
- **Public text hygiene.** Commit messages and README are public. Keep them free of private plans and of anything personal.

## 3. Architecture and build

| Piece | Where | Notes |
|---|---|---|
| Game loop, input, throwing, HUD, settings, tour | `src/game.js` (one ES5 IIFE, ~180 KB) | ES5 on purpose: no transpile, small, runs on old browsers. |
| Page shell, CSS, dialog templates | `src/title.html` | `t-set` is the Settings template; rows use `.so`. |
| Stage scenery, stage taps | `src/stages.js` | Per-stage functions (`stormLand`, `fortParty`, ...). |
| Champion fight styles, shop extras, raids, combos | `src/extras.js` | `peek`, `charge`, `guard`, `squad`, `clone` modes. |
| Penguin level-up (fish), sprites tint | `src/evolve.js` | |
| Penguin outfits | `src/gear.js` | `rollGear` rarity; baked SVG overlays. |
| Tester Lab | `src/lab/lab.js` | Only in the tester build. Sliders for roll physics and game speed. |
| Sprites, icons, logo | `src/sprites/*.svg` | `icons.svg` is **generated** by `tools/make_icons.py`. |
| Vendored modules | `src/vendor/{frame-kit,save-kit,sticker-text,lzma}` | Copied from JS-modules with MIT headers kept. |
| Build / QA / release | `build.py`, `tools/qa.py`, `tools/qa_suite.js`, `tools/release.py`, `tools/pack.py` | See section 6. |

Build facts: `python3 -I build.py` (the `-I` isolates Python from the working directory). `--min` uses esbuild; `--lab` adds the tester. The inline script and CSS are minified for the shipped build and the font is subset to the glyphs used. The packed file is a tiny decoder plus a base64 LZMA blob; the build stays strict-CSP friendly (no eval).

## 4. Game-design lessons (what worked, what we changed our minds about)

1. **Flick first, then add friendlier paths.** The original rule was "a plain tap does nothing". Very young players could not flick, so the opt-in "tap or hold on a penguin" mode was added (section 7), without touching any speed, cost or trophy rule. Accessibility options should *add a path*, not *change the rules*.
2. **Aim assist is generous but bounded.** `AIMW = [1.3, 0.9, 0.4]` (times the penguin size) picks the target nearest the flick line. A thrown pineapple that arrives after its target is gone flies on and can still hit someone else; a miss lands and stays. Harder flicks fly farther.
3. **Economy in real time.** Every dispatched penguin pays instantly with coins flying to the bank (Rockhopper 1, Adélie 3, Gentoo 6, Champion 12). Better pineapples are slower and cost bank points per throw (Lobber 0.9 s and 2, Mega 1.1 s). Power should cost *speed and money*, never just money.
4. **Champions each teach one gimmick** (snowball shield, ice-block peek, belly-slide charge, squad shield, icy clones) and show a short tip. `bossOpen(b)` is the single question "can this Champion be hurt now?" used by the throw aim, the auto slingshot, the lime launcher and the air raid.
5. **Ready, Set, GO!** Nothing may leave any slingshot (yours, the Auto Slingshot or the Lime Launcher) and the Rain button waits, until GO. `rsg()` is the one gate, checked in `throwAt`, `callRaid` and the helpers.
6. **Helpers wait for the player.** `S.pt` (player has thrown) gates the helpers so a round never starts with the machine already playing.
7. **Rarity should be rare.** Penguin outfits: 0 props 66.7%, 1 prop 25%, 2 props 7.3%, 3 props 1%, slots by weight (hat .34, scarf .30, mittens .22, item .14).
8. **Show, then tell.** The first-load tour is five picture cards with a giant Next, Back, dots and a big "Skip the tour"; it replays from How to play. Little children read pictures, not paragraphs. Use `role="status"` on the big sentence, size to fit, no wrapping surprises.
9. **Name the thing.** Each stage opens with a banner of its name (Stage 1 was skipped once; do not skip it).
10. **Kind losing.** Try again keeps progress; the stand's cheer meter is a friendly meter, never a "health bar" of anything hurt.
11. **Run structure.** Clearing five stages is a run; each run makes penguins 10% faster (compounding, capped at double). Trophies requiring speed (Faster Fun, Top Speed) require 100% game speed, which is what keeps the "game speed" accessibility option fair.
12. **Minigame ("Pineapple Roll") physics must be frame-rate independent.** Fixed 1/240 s steps with an accumulator, plus `skSim` that replays a launch silently so tests can measure sink rates. A rim model (lip radius, restitution) plus a wrong-sign slide push were the "invisible catch" bug; fixed by pushing downhill.

## 5. Input and UI lessons

- **Pointer events everywhere.** One `pointerdown/move/up/cancel` path for touch, mouse and touchpad. Touch uses a finger flick; mouse and touchpad can throw with a quick upward swipe without clicking (`hoverFlick`).
- **Android sends `pointercancel`** when it takes over a gesture. Always clear held state there too, or a "hold" sticks forever.
- **Swallow the trailing click** after a hold or you get a phantom press on whatever is under the finger.
- **Settings rows (`.so`)** are one button each: title, one-line help, and a state pill (`On`/`Off` or a value). `wireComfort($b)` paints every row from the save and `bind(id, fn)` runs `fn`, `applyPrefs()`, `kit.save(sv)` and repaints. Adding a setting is three steps: a save field with a default, a row in `t-set`, a `bind` and a `row()` call.
- **Settings travel with the save** (and so with the save code). Every saved field needs both a schema entry (`'int:N'`) and a default, and old saves must still load.
- **Private windows:** `kit.save(sv)` returns `false` when the browser refuses to keep data; the Settings card then shows a warning pointing at the save code and save file.
- **Cards and dialogs** pause the background animation. A game card supports up to three buttons (`showCard(title, body, b1, f1, b2, f2, b3, f3)`).
- **Corners are precious.** Pineapple buttons sit bottom-left (bottom-right when left-handed); the Rain button sits on the opposite side at 25% height; HUD on top. The FPS badge goes bottom-right (mirrored for left-handed) so it never covers a control, and is `pointer-events:none`.
- **Large tap targets** (at least 2 cm in spirit), Calm mode that also follows the OS reduced-motion setting, high contrast, larger text, large buttons, left-handed mirror via `mx(f)` and `html[data-lh]`.
- **Never use alerts or modal browser dialogs** in the game; they block everything.

## 6. Testing and release: the cheap way (the owner's top concern)

The suite is designed so a full check costs seconds, not minutes of babysitting.

- **One command:** `python3 -I tools/qa.py [--ff] [--fuzz N] [--force] [--min] [--lab] [--shots DIR]`. Builds, syntax-checks every inline script (fails in under a second on a typo), then runs the in-page suite in Chromium; `--ff` adds Firefox (the stress test).
- **Fast-forward inside the page.** `#qa` in the URL exposes `window.__pd`. `__pd.step(sec, dt, every)` advances game time with no frames and no screenshots. This is what makes 60+ checks run in about a minute in Chromium and about a minute more in Firefox.
- **One browser session** runs everything (the old way launched a browser per throwaway script).
- **A cache** (`.qa-cache`, not committed) skips the whole run when `index.html` and the suite are byte-identical to the last pass. Use `--force` when you changed only the harness or the environment.
- **Layout checks measure rectangles**, not screenshots.
- **`tools/release.py [--ff --force]`** runs QA, builds the lab and minified pages, re-runs QA on the minified page (it is what ships), packs both, and prunes `dist/` to the newest two versions.
- **Hooks (`__pd`)** include `go(stage, wave)`, `step`, `flick`, `stap` (scenery tap), `st(key, value)` (set a save field), `rsg`, `rollGear`, `tour`, `center(pg)`, `hp(x, y)`, `holdOn()`, `fpsTxt()`, `sv()`, `S`, `penguins`, `sh`.
- **Flaky-test rules we learned:**
  - Never override `Math.random` with a constant.
  - Headless Chromium sometimes stalls about 500 ms; ignore such outliers instead of tuning the game to them.
  - Tests that depend on randomness must retry in a bounded loop (Mecha, rim lip-out: up to 24 or 32 tries) rather than assert one roll.
  - Duplicate keys in the hook object silently shadow each other (`tap` vs `stap` once hid a bug).
  - `__pd.sh` (live shots) *shrinks* as shots land; count throws by the cooldown jump (`S.cd` going up) or a counter, not by array length.
- **Firefox is the pessimist.** If it passes in Firefox with `--fuzz`, Chrome will.
- **Real numbers.** Per-frame canvas calls dropped about 51% (1,936 to 952) from caching, batching and gradient caching; later scenery added back some. The full audit tables are in `docs/ideas-qol-and-performance.md`.

## 7. New here (relative to the repos that were reviewed)

Each item says what it is and where to find it. If you are starting a new game, these are the pieces worth lifting first.

1. **In-page fast-forward QA with a cache and one-session Chromium plus Firefox** (`tools/qa.py`, `tools/qa_suite.js`, `__pd.step`). See section 6.
2. **Tester build with a Test Lab** (`src/lab/lab.js`): live sliders for roll aim, gravity, incline, rim bounce, cup size, balls per round and game speed, plus one-button scenarios. Lets the owner tune feel on a phone without a code change.
3. **Shop "Try it" demo with a save lock** (`sp.over`, `restoreDemo()`): lends an upgrade for a 12 to 14 second slice of a real stage, blocks every save and award while it runs, and restores a JSON copy afterward. One-slot **Undo** refund (`lastBuy`).
4. **Governor with five steps mapped to three effect levels** (`gov` in `game.js`, `Q_OF`): canvas scale walks down 2, 1.75, 1.5, 1.25, 1 while heavy effects thin out on `qLevel` 0 to 2. Quality never steps back up behind the player. The FPS badge shows `qLevel` so the owner can see it.
5. **Hold to press with forced targeting** (`penAt`, `holdTick`, `throwAt(..., want)`): the press picks the nearest walking penguin within `max(0.62 * size, 30 px)`; the held state re-throws exactly when the sling is ready; same cooldown, same costs, same Ready/Set/GO block, same trophies. The existing `HoldPress` module is a generic press-repeat helper; this version is game-aware (target locking, cooldown-driven repeat, Champion dodge handling). Candidate to generalize into JS-modules.
6. **FPS badge that costs nothing** (`fpsTick`): counts frames and the largest gap and rewrites three lines of text twice a second; runs only when on. "Worst frame" is the number that explains a hitch; the average hides it.
7. **Fixed-step minigame physics with a silent simulator** (`SK_H`, `skSim`): same roll at any frame rate, and tests can measure "58% of human-wobbled flicks sink" without rendering.
8. **Parachute-fish penguin evolution** (`evolve.js`): a fish lands in front of walkers; the penguin stops, eats, levels up (Rockhopper to Adélie to Gentoo). Gulls (Gull Pals) steal fish. Fully deterministic enough to test.
9. **Champion fight styles as data** (`CHAMP[n].mode` plus `b.safe`, `bossOpen`): five behaviors with one shared "can I be hurt now" gate that every helper respects.
10. **Combo system across all sources** (slingshot, auto, splash, raid, limes): a 1.5 s chain window, escalating calls and "Team" chains for mixed sources.
11. **Icon pipeline** (`tools/make_icons.py` writes `src/sprites/icons.svg` and `docs/icons/`): 21 trophy icons and shop/pickup icons from code, checked by a test (every trophy and upgrade row has its own icon, no repeats).
12. **Penguin outfits** (`gear.js`): baked SVG overlays in the 200-unit sprite space with sway and steam, rolled by weighted rarity.
13. **Baked-in glossy sprites with background warm-up** (`warmAll`, `warmUmb`, `stamp`, `gk`): small copies, canopies and gradients are built one at a time after load so no frame pays for them. Sprites after stage 1 decode after the first frame.
14. **First-load tour and "Play the tour" replay**, **three-button game card**, **Save and go to title** victory card, **Settings in row style** with a storage warning.
15. **Ready/Set/GO gate** (`rsg()`) shared by player, helpers and raid.
16. **Scenery taps** (`sceneTap` before the throw, ignoring lane taps) for tiny discoverable reactions, plus tap zones per stage.

## 8. Mistakes worth not repeating

- A **duplicate key** in the `__pd` object shadowed the scenery tap hook; the test then failed for the wrong reason.
- A **local git history rewrite** duplicated a cleanup another session had already pushed. Always `git fetch` and compare with `origin/main` before rewriting anything; never force-push over history you have not read.
- **Fixed pixel sizes inside a `rem`-scaled page** (the FPS badge first used `.72rem` and came out 305 px wide). Check widths in a real screenshot at 500 x 827; use `px` for tiny diagnostics and a stacked layout for narrow screens.
- **Counting `P.sh.length`** to measure throws (see section 6).
- **Overly strict timing assertions** around random events (Mecha, rim lip-out). Loop until the condition occurs, with a bound.
- **Icon geometry** that overflowed a badge (clouds) or blobbed at small size (gull); check icons at the size they ship.
- **A hidden hand on frame 0** in an animated tour slide; draw a static first frame and animate a copy.
- **Wrapping button text** ("Let's play!") on small screens; set `nowrap` and a clamp font size.
- **`AskUserQuestion` allows at most 4 options per question.**

## 9. Reuse recipe for a new game

1. Create the repo with `src/`, `build.py`, `tools/`, `docs/`, `CHANGELOG.md`, `README.md` (players first, with screenshots), a design doc, and a qa-process doc. Set git identity to JNFoo before the first commit.
2. Copy `tools/qa.py`, `tools/release.py`, `tools/pack.py` and the `__pd` hook pattern. Write the first test (the game loads and runs a stage) before the second feature.
3. Vendor `save-kit`, `frame-kit` (EvenDt, QualityGovernor), `sticker-text`, `lzma`. Keep MIT headers.
4. Add the Settings rows pattern (`.so`, `wireComfort`, `applyPrefs`) and the comfort set: left-handed, aim help, calm, high contrast, larger text, large buttons, game speed, battery saver, FPS counter, hold to press, full screen, save warning.
5. Put the kid-safe tone rules and the "free means free" rules in the design doc on day one; they decide a lot of later arguments.
6. Ask the owner through popups, ship small releases, send both builds, and always report real time and approximate compute.

## 10. Open ideas

- Generalize `penAt` plus `holdTick` into a JS-modules helper (target-lock press-repeat).
- Add a slow-moment note (Apple Press has one) that tells a player in plain words when the game slowed down.
- Pool short-lived objects and pack sprites into an atlas (judged not worth it so far; see the audits).
- Haptics were excluded on request.

## Added in 2026.10.14.0743
- **A badge is only useful with a verdict.** Numbers (fps, slowest frame) need a plain sentence next to them. `FrameMeter` (now in JS-modules `frame-kit`) counts a hitch as a gap more than twice the last three and over 50 ms, then blames the game when our own update+draw took at least 60% of the gap, otherwise the device. Tap delay is measured from the event's `timeStamp` to the next frame callback, so it says "the next frame started", not "the picture reached the glass".
- **Test the combination, not the setting.** The Large-buttons overlap with the cheer bar only appeared with that setting on; the layout check now loops the setting with left-handed, Larger text and High contrast.
- **Touch targets can be bigger than they look.** `::after` pseudo-elements extend a button's hit area toward the screen edge without changing its look; check with `elementFromPoint` just outside the drawn edge.
- **Ask a young player's preference once.** Flick or Tap is a card after the tour that sets one setting and remembers it was asked (`tc`).
- **A tiny input buffer (0.15 s, one flick) forgives early taps** without changing speed or costs; keep it off by default and independent of Calm.
- **Earlier tests can leave a card open.** A test that checks hits on the play screen should close cards first and assert they are closed.
