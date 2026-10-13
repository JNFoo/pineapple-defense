# Ideas: 10 player comfort improvements and 10 performance ideas

Pineapple Defense. Written 2026-10-12. Copyright (c) 2026 JNFoo. All rights reserved.

The performance list marks what is already done in version 2026.10.12.2343 and what is still open. Reference for the canvas ideas: MDN, "Optimizing canvas" (cache repeated drawing in offscreen canvases, batch calls, avoid per-frame state changes, avoid fractional coordinates where it matters, scale with CSS or the backing store on purpose).

## 10 quality-of-life ideas for the player

1. **Left-handed layout.** One toggle mirrors the HUD and the pickup and trophy spots so the thumb that holds the phone is never in the way.
2. **Resume countdown.** After a pause, a tab switch or a rotation, show 3, 2, 1 before the penguins move again, so nobody loses a Cheer heart to a surprise restart.
3. **Aim help setting.** Generous, Normal or Off for the sticky aim, plus a faint dotted arc for the first few throws of a new player.
4. **Color and shape safety.** Every marker (teal auto marker, green lime missiles, raid line) also gets a distinct shape or pattern, plus a high-contrast option, so color alone never carries meaning.
5. **Haptics.** A short vibration on a hit, a longer one on a combo call and a pattern on Champion defeat, with an on and off switch (navigator.vibrate where supported).
6. **Readability options.** Bigger banners and combo calls, a calmer font weight, and a Reduce motion switch that also follows the system prefers-reduced-motion setting by default.
7. **Shop try-out and undo.** A "Try it" button runs a ten-second demo of an upgrade before buying, and the last purchase can be undone until the next stage starts.
8. **Stage replay.** Pick any cleared stage from the title screen to replay for credits and trophies, and show a small best-score line per stage.
9. **Next-goal chip.** One small chip shows the closest trophy or upgrade goal ("40 more for the Lime Launcher"), with progressive hints on locked trophies.
10. **Save backup code.** Export the save as a short text code or a .md file and import it on another device, since the game is fully offline and has no account.

## 10 performance and efficiency ideas for the code

1. **Cache static layers.** The striped stand, sling frames, power-up badges, the trophy, closed umbrellas and the open umbrella canopy are painted once per size into offscreen canvases. Done: this removed about 450 canvas calls per frame.
2. **Batch particles.** Confetti is bucketed by color and fade step and drawn as one path per bucket, with no per-bit save, restore or transform. Done: about 500 fewer calls in a busy Champion fight. Open: one prebuilt confetti atlas drawn with one call per bit.
3. **Mip copies of sprites.** Small or distant penguins and the pouch pineapple draw from a 192 or 96 pixel copy of the 384 pixel sprite. Done. Open: pack all sprites into one atlas to cut texture switches on GPU canvases.
4. **Do not draw when nothing changes.** Pause, cards and the title screen can stop the animation loop or drop to 30 frames per second with a single pending frame for the dialog fade.
5. **Smooth resolution scaling.** The quality governor already steps between three levels; let it move the backing-store scale in small steps (for example 0.1) between 1.0 and the device ratio, and restore it slowly when frames are fast.
6. **Cache gradients and sprites instead of creating them per frame.** The Champion snowballs, the stand and the halo stars no longer create gradients every frame. Done. Open: scenery gradients (lighthouse beam, aurora ribbons) can be built once per size.
7. **Raster SVG sprites off the main thread.** Use createImageBitmap or OffscreenCanvas in a worker for the 384 pixel sprite sheet at startup so the first screen appears sooner on slow phones.
8. **Pool short-lived objects.** Particles, missiles, pop-up texts and rings are created and dropped constantly; a fixed pool (or parallel typed arrays) removes garbage-collection hitches on low-memory phones.
9. **Cheaper depth sorting.** The per-frame concat and sort of penguins, fish and Champion can be an insertion sort on a nearly sorted list, which also avoids creating a new array each frame.
10. **Smaller file and faster load.** Minify the inline script and CSS, subset the font to the glyphs used, and compress the packed single file; keep the build strict-CSP friendly (no eval). Also keep the test loop fast: fast-forward time, one browser session, skip unchanged builds (already in tools/qa.py).
