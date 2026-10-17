# Rules for anyone (or any Claude thread) working on Pineapple Defense

Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE). Forged by LFC Foundry. Commits and authorship stay JNFoo.

## Test browsers (owner rule, 2026-10-17)

- Test only with the browsers on the `browsers` branch of the private lfcfoundry/knowledge-base: Firefox 158, ungoogled Chromium 155 and WebKitGTK 2.52.6 (GNOME Web 46.5). Never stock Chromium, and never two browsers at once.
- Before each test run, re-read that branch's README: versions can be updated, and browsers can be added or removed. Follow what it says now.
- Label every result with the browser and its version. `python3 -I tools/qa.py` prints and records the versions that really ran (`.qa-browsers.json`); see `docs/qa-process.md` for the setup (`PD_CHROME`, `PD_FF`, `PD_GECKO`, `--ff`, `--wk`).
- Every release lists the browsers, with versions, that tested it: the changelog entry ("Tested in", written by `tools/release.py` from the recorded versions) and the README ("Test browsers"). Where an older release did not record them, the changelog says "not recorded". Do not guess.
- Keep checks cheap: `--smart` (or `--quick`) while iterating, `--only REGEX` while writing a check; the full three-browser run only for a release. `QA_TIMES=1` shows where the time goes. Tick loops in the suite use `tk()` (no unneeded frame draws), and timers the game owns are jumped with `fakeClock()`, never slept through; see `docs/qa-process.md`.
- **Faster, trustworthy testing:** follow the universal QA and browser-testing guide at `build-notes/qa/QA-AND-BROWSER-TESTING-UNIVERSAL-GUIDE.md` in the private knowledge-base repo (print the real browser version on line 1 of every run; targeted checks while working; full run once when the design is final).

## Changelog

- Every entry says, in plain words, how much each change helps (how much faster, how many KB smaller, how many px bigger) or what each new feature does.
- The entry for the next release sits under `## @VER@`; `tools/release.py` turns that into the version stamp.

## Shared files and private notes

- Hard-to-reach downloads and private build notes (secret features, upgrades, stages) go in the private lfcfoundry/knowledge-base repo, on a new branch when needed, not in this public repo.
- Never write the owner's real name anywhere; the only personal name is JNFoo.
