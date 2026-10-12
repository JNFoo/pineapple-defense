<p align="center"><img src="assets/logo.png" alt="Pineapple Defense logo" width="420"></p>

# Pineapple Defense

A free, silly browser game for kids of all ages: flick pineapples at penguins who are a little jealous of tropical fruit. Nobody gets hurt; everyone goes home giggling.

**Play it:** <https://jnfoo.github.io/pineapple-defense/> (one small file, works offline, no ads, no tracking)

**Status:** early alpha. Stage 1 (Sandy Snack Shore, 8 waves and a boss) is playable. The pictures below are placeholders from the current build; the final art will replace them.

<p align="center">
<img src="docs/img/title.png" alt="Title screen" width="190">
<img src="docs/img/game.png" alt="Stage 1 gameplay" width="190">
<img src="docs/img/how-to-play.png" alt="How to play guide" width="190">
</p>
<p align="center">
<img src="docs/img/trophies.png" alt="Trophies" width="190">
<img src="docs/img/shop.png" alt="Shop" width="190">
</p>

## How to play

- Flick up from the bottom of the screen toward a penguin. On a touchpad or mouse, swipe up over the game.
- Penguins that reach your fruit stand make it wobble and lower the **Cheer** meter (the tall bar on the right). Clear waves to cheer it back up.
- Pick **Classic** (quick, one penguin) or **Lobber** (slower, splashes nearby penguins) at the bottom left.
- Tap the **pickups** that appear on the table: Zippy, Mega, Cheer up and Brrr give short boosts, and trophies give Golden Pineapples.
- Spend Golden Pineapples in the **Shop** on the title screen.
- Calm mode (on the title screen) turns off bobbing, confetti and other motion.

## Project

- Design brief: [docs/pineapple-defense-design.md](docs/pineapple-defense-design.md)
- Build: `python3 build.py` makes the single-file `index.html` from `src/` (needs `fonttools`). Don't edit `index.html` by hand.
- Packed single file: `python3 tools/pack.py` makes one smaller, self-unpacking `.html` in `dist/`.
- Tested in Chromium. Targets: Android Chrome, Firefox and Chromium-based desktop browsers.

Copyright © 2026 JNFoo. All rights reserved.
Fonts: Bricolage Grotesque and Figtree (SIL OFL 1.1, see `src/fonts/`). `sticker-text` from JS-modules (MIT, see header in `src/vendor/`). LZMA decoder: lzma-js (MIT, see `src/vendor/lzma/`).
