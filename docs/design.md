# Pineapple Defense: Design Brief (Draft 1)

Copyright © 2026 JNFoo. All Rights Reserved.
Brief date: 2026.10.12 (version stamps use year.month.day.HHMM, US Eastern)

## Status
Design phase. No code written and no checks or benchmarks run yet (held until the design is final).

## Decisions made (your answers)
- Audience and tone: all ages, slapstick. Penguins get splatted, dizzy-starred and slide away with a poof. No gore, no blood.
- Look: glossy 3D toy sprites drawn on a 2D canvas, scaled by depth. Matches the Apple Press and Fancy style. Lightest option for Android Chrome, Firefox 158 and ungoogled-Chromium.
- Structure: stages of waves, with a boss penguin at the end of each stage. Short story cards between stages, upgrades between stages, saves and unlocks like Fancy.
- Repo: new public repo JNFoo/pineapple-defense (you create it; I attach it and push builds).
- Aiming: aim-assist hybrid. Flick direction picks the target area, flick speed sets power and flight time, with a gentle snap toward the nearest penguin.
- Stakes: a fruit stand with a health bar. Penguins that reach the front line smash it. Boss penguins hit harder. Repaired between stages.
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
| Bowling Pine | A lane | Flat, rolls along the ice | Medium | Knocks over a line of penguins |
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
- Emperor: tanky, takes 3 hits
- King: slow and heavy

Game-only (later stages):
- Jetpack: flies over flat shots
- Armored: helmet blocks flat shots, weak to arcs
- Splitter: splits into two small penguins
- Sled Slider: very fast, short warning
- Igloo Carrier: shield bearer that shelters those behind it

Bosses: one per stage, for example Admiral Emperor (the first), with names and looks to be decided.

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
- Repo: https://github.com/JNFoo/pineapple-defense created by the owner on Oct 12 and attached to this session with push access (not yet test-pushed).

## How we work (from the Master Guide)
- Plain words, short replies; every question asked with the multiple-choice pop-up, recommended option first.
- No checks or benchmarks while the design is open; run them once the design is final.
- Test targets: Firefox 158 (stress test), ungoogled-Chromium on Windows, Chrome on the Pixel; laptop first, phone second.
- Version stamps: year.month.day.HHMM in US Eastern. Copyright holder: JNFoo only. American English.
- Sessions follow AGENTS.md and TASKS.md rules (section 28 of the guide).

## Still open
- Story: why do the penguins hate tropical fruit? A one-screen premise for the first story card.
- Names and look of the five stages and their bosses.
- Which proposed pineapples and penguins to keep, change or drop.
- Upgrade shop between stages: what can be bought and how it scales (including the rail gun's place in the order).
