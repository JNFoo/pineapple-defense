/* Test Lab: tester build only. Not part of the public game. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE). */
var LAB0 = { aim: SK_AIM, g: SK_G, kz: SK_KZ, inc: SK_INC, rb: SK_RB, balls: SK_BALLS, rim: SK_RIM, wall: SK_WALL, din: SK_DIN, cup: 1, spd: 1 }, LAB_R = SK_HOLES.map(function (h) { return h.r; }), labCup = 1;
(function () {
  var st = document.createElement('style');
  st.textContent = '.lab{text-align:left;font:700 .95rem/1.25 var(--body);color:var(--fg)}.lab h3{margin:.7rem 0 .25rem;font:800 1rem/1 var(--display);color:#7a3a05}.lab h3:first-child{margin-top:0}' +
    '.lab .row{justify-content:flex-start;margin:.15rem 0}.lab .btn{min-height:2.4rem;font-size:.85rem;padding:.4em .8em .5em;margin:0;}.lab select{font:700 .9rem var(--body);padding:.45em;border-radius:.6em;border:2px solid #b79a63;background:#fffaf0;color:#4a2b0f}' +
    '.lab .sl{display:grid;grid-template-columns:7.2em 1fr 3.2em;align-items:center;gap:.5em;margin:.2rem 0}.lab .sl output{text-align:right;font-variant-numeric:tabular-nums}.lab input[type=range]{width:100%;accent-color:#e08a00}' +
    '.lab .note{font-weight:600;font-size:.8rem;opacity:.75;margin:.2rem 0}.lab .msg{min-height:1.1em;font-size:.82rem;color:#2f6f9f;margin:.3rem 0 0}';
  document.head.appendChild(st);
  var SL = [
    ['spd', 'Game speed', 0.25, 2, 0.05, 'Everything, both modes'], ['aim', 'Aim gain', 0.3, 1.2, 0.05, 'Roll: swipe angle to roll angle'], ['g', 'Gravity', 6, 24, 0.5, 'Roll: higher = flatter, quicker arcs'], ['kz', 'Hop kick', 0.2, 0.8, 0.05, 'Roll: how steeply the hop launches'], ['inc', 'Incline (deg)', 15, 50, 1, 'Roll: board tilt; steeper = faster roll back'], ['rb', 'Ball size', 0.05, 0.12, 0.005, 'Roll: ball radius vs the holes'],
    ['balls', 'Balls per round', 3, 20, 1, 'Roll: applies to the next round'], ['cup', 'Cup size', 0.6, 1.6, 0.05, 'Roll: all cups'], ['rim', 'Rim bounce', 0, 0.9, 0.05, 'Roll: bounciness off rims'],
    ['wall', 'Wall bounce', 1, 2, 0.05, 'Roll: 1 = dead, 2 = springy'], ['din', 'Hole catch', 0.5, 1, 0.05, 'Roll: how much of the opening scores']];
  function apply(k, v) {
    if (k === 'spd') timeScale = v; else if (k === 'aim') SK_AIM = v; else if (k === 'g') SK_G = v; else if (k === 'kz') SK_KZ = v; else if (k === 'inc') SK_INC = v; else if (k === 'rb') SK_RB = v; else if (k === 'balls') SK_BALLS = v | 0; else if (k === 'rim') SK_RIM = v;
    else if (k === 'wall') SK_WALL = v; else if (k === 'din') SK_DIN = v; else if (k === 'cup') { labCup = v; SK_HOLES.forEach(function (h, i) { h.r = LAB_R[i] * v; }); }
  }
  function cur(k) { return k === 'spd' ? timeScale : k === 'aim' ? SK_AIM : k === 'g' ? SK_G : k === 'kz' ? SK_KZ : k === 'inc' ? SK_INC : k === 'rb' ? SK_RB : k === 'balls' ? SK_BALLS : k === 'rim' ? SK_RIM : k === 'wall' ? SK_WALL : k === 'din' ? SK_DIN : labCup; }
  function labClose() { if (!$('cw').hidden) { $('cw').hidden = true; root.removeAttribute('data-dlg'); } if (!$('gcw').hidden) hideCard(); }
  function labGo(fn) { labClose(); if (!gameEl.hidden) toTitle(); fn(); }
  function startFrom(from) { titleEl.hidden = true; gameEl.hidden = false; loadAssets().then(function () { resize(); startStage(from); run(); }); }
  /* Color view (tester only): look at the whole page the way a color-blind player might. Standard simulation matrices; a rough check, not a medical one.
     Matrices: protan and deutan from the Machado et al. style approximations used by hail2u/color-blindness-emulation; gray is luminance. */
  var CB = [['Normal', ''], ['Protan (red-weak)', '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0'], ['Deutan (green-weak)', '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0'], ['Tritan (blue-weak)', '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0'], ['Gray', '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0']], cbI = 0;
  (function () {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), h = '<defs>', i;
    s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.setAttribute('aria-hidden', 'true'); s.style.cssText = 'position:absolute;width:0;height:0';
    for (i = 1; i < CB.length; i++) h += '<filter id="cb' + i + '" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="' + CB[i][1] + '"/></filter>';
    s.innerHTML = h + '</defs>'; document.body.appendChild(s);
  }());
  function cbSet(i) { cbI = i; document.body.style.filter = i ? 'url(#cb' + i + ')' : ''; root.setAttribute('data-cb', String(i));   /* on <body>: Firefox ignores a filter on <html> */ return CB[i][0]; }
  window.__cb = cbSet;
  /* Flash check (tester only; the idea of WCAG 2.3.1): two busy scenes are played at 60 steps a second by a helper that always throws, a tiny copy of the picture is
     sampled every step, and big opposite brightness changes are counted per second. A change counts when 10% or more of the cells get brighter (or darker) by 0.1 of relative
     luminance with the darker side under 0.8, and at least a quarter of the cells do it together. Red is counted separately. A rough check, not a legal or medical test. */
  function relLum(r, g, b) { function c(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); } return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b); }
  function worstPer(list) {   /* the most transitions inside any one second, as flashes (a flash is a pair of opposite changes) */
    var i, j = 0, mx = 0, at = 0; for (i = 0; i < list.length; i++) { while (list[i] - list[j] > 1) j++; if (i - j + 1 > mx) { mx = i - j + 1; at = list[j]; } }
    return { n: mx / 2, at: at };
  }
  /* the counting core: feed it one frame of RGBA pixels (GW x GH) and the time; it keeps the brightness-change times and a "moved" count */
  function flashMeter() {
    var prev = null, dir = 0, rdir = 0, ev = [], rv = [], moved = 0, frames = 0;
    return {
      push: function (d, simT) {
        var n = d.length / 4, L = new Float32Array(n), R = new Uint8Array(n), i, up = 0, dn = 0, ru = 0, rd = 0, mv = 0;
        for (i = 0; i < n; i++) { L[i] = relLum(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); R[i] = d[i * 4] > 200 && d[i * 4 + 1] < 90 && d[i * 4 + 2] < 90 ? 1 : 0; }
        frames++;
        if (prev) {
          for (i = 0; i < n; i++) { var a = prev.L[i], c = L[i]; if (c - a >= 0.1 && a < 0.8) up++; else if (a - c >= 0.1 && c < 0.8) dn++; if (R[i] > prev.R[i]) ru++; else if (R[i] < prev.R[i]) rd++; if (Math.abs(c - a) > 0.01) mv++; }
          if (mv) moved++;
          if (up >= n * 0.25 && dir !== 1) { dir = 1; ev.push(simT); } else if (dn >= n * 0.25 && dir !== -1) { dir = -1; ev.push(simT); }
          if (ru >= n * 0.25 && rdir !== 1) { rdir = 1; rv.push(simT); } else if (rd >= n * 0.25 && rdir !== -1) { rdir = -1; rv.push(simT); }
        }
        prev = { L: L, R: R };
      },
      result: function () { return { g: worstPer(ev), r: worstPer(rv), moved: moved, frames: frames }; }
    };
  }
  window.__flashTest = function (hz, steps) {   /* QA: a synthetic picture that flips between black and white hz times a second, to prove the meter counts */
    var c = document.createElement('canvas'), x, m = flashMeter(), i; c.width = 16; c.height = 28; x = c.getContext('2d', { willReadFrequently: true });
    for (i = 0; i < steps; i++) { x.fillStyle = hz > 0 && Math.floor(i / 60 * hz * 2) % 2 ? '#fff' : '#000'; x.fillRect(0, 0, 16, 28); m.push(x.getImageData(0, 0, 16, 28).data, i / 60); }
    return m.result();
  };
  function flashCheck(say) {
    var scenes = [{ nm: 'Stage 2, wave 3', from: { stage: 2, wave: 2, golden: 0, cheer: 100 } }, { nm: 'Champion fight', from: { stage: 2, wave: NWAVES, golden: 0, cheer: 100 } }], si = 0, res = [];
    var GW = 16, GH = 28, tc = document.createElement('canvas'), tx; tc.width = GW; tc.height = GH; tx = tc.getContext('2d', { willReadFrequently: true });
    function runScene() {
      if (si >= scenes.length) { labBot = false; finish(); return; }
      var sc = scenes[si], tries = 0, simT = 0, steps = 0, m = flashMeter();
      startFrom(sc.from);
      (function wait() {
        if (!(S && !S.over && !gameEl.hidden && running && S.stage === 2)) { if (++tries > 100) { res.push({ nm: sc.nm, bad: 1 }); si++; runScene(); return; } setTimeout(wait, 50); return; }
        halt(); labBot = true;
        (function chunk() {
          var k;
          for (k = 0; k < 40 && steps < 720 && !S.over; k++, steps++) { update(1 / 60); draw(); simT += 1 / 60; tx.drawImage(cv, 0, 0, GW, GH); m.push(tx.getImageData(0, 0, GW, GH).data, simT); }
          say('Checking ' + sc.nm + ' (' + Math.round(steps / 7.2) + '%)');
          if (steps < 720 && !S.over) { setTimeout(chunk, 0); return; }
          var r = m.result(); r.nm = sc.nm; if (r.moved < r.frames * 0.1) r.bad = 1;   /* a picture that never changed proves nothing */
          res.push(r); si++; runScene();
        }());
      }());
    }
    function finish() {
      var worst = 0, wn = '', wt = 0, wr = 0, i, bad = 0;
      for (i = 0; i < res.length; i++) { if (res[i].bad) { bad++; continue; } if (res[i].g.n > worst) { worst = res[i].g.n; wn = res[i].nm; wt = res[i].g.at; } if (res[i].r.n > wr) wr = res[i].r.n; }
      var top = Math.max(worst, wr), word = bad === res.length ? 'Could not check' : top > 3 ? 'Problem' : top > 1.5 ? 'Good' : 'Great';
      var txt = word + '. Most big flashes in any one second: ' + (Math.round(worst * 10) / 10) + ' (the limit is 3). Red flashes: ' + (Math.round(wr * 10) / 10) + '.';
      if (word === 'Problem') txt += ' Cause: ' + wn + ' at about ' + Math.round(wt * 10) / 10 + ' s. Next step: soften or shorten the flash effects there.';
      else if (word === 'Could not check') txt += ' The picture did not change or a scene did not start. Next step: try again from the title screen.';
      else txt += ' Checked ' + (res.length - bad) + ' busy scenes with a helper that always throws. A rough check, not a legal or medical test.';
      labBot = false; showCard('Flash check', txt, 'Close', function () { toTitle(); }); $('gBtn2').hidden = true;
    }
    labClose(); if (!gameEl.hidden) toTitle(); runScene();
  }
  function tapTime() {
    var f = performance.getEntriesByName && performance.getEntriesByName('first-contentful-paint')[0], fp = f ? Math.round(f.startTime) : -1, tp = BOOT_MS;
    var word = tp <= 1000 ? 'Great' : tp <= 2000 ? 'Good' : tp <= 4000 ? 'Needs attention' : 'Problem';
    return word + '. The game finished starting after ' + tp + ' ms' + (fp >= 0 ? ' (first paint at ' + fp + ' ms)' : '') + '. The menu answers taps from then on. Measured on this load only; a slow phone will differ. The goal is under 1000 ms.' + (word === 'Needs attention' || word === 'Problem' ? ' Next step: look at what runs before the title appears.' : '');
  }
  function panel() {
    var d = document.createElement('div'), h, i, w = '';
    d.className = 'lab';
    for (i = 1; i <= NWAVES; i++) w += '<option value="' + i + '">Wave ' + i + '</option>';
    h = '<h3>Minigame</h3><div class="row"><button class="btn" data-a="roll" type="button">Play Pineapple Roll</button></div>' +
      '<h3>Stages</h3><div class="row"><select id="labS" aria-label="Stage"><option value="1">Stage 1</option><option value="2">Stage 2</option><option value="3">Stage 3</option><option value="4">Stage 4</option><option value="5">Stage 5</option></select><select id="labW" aria-label="Wave">' + w + '<option value="9">Champion</option></select><button class="btn" data-a="stage" type="button">Start there</button></div>' +
      '<h3>Give</h3><div class="row"><button class="btn" data-a="b10" type="button">+10 bank</button><button class="btn" data-a="b100" type="button">+100 bank</button><button class="btn" data-a="tro" type="button">All trophies</button><button class="btn" data-a="upg" type="button">All upgrades</button><button class="btn" data-a="rst" type="button">Reset save</button></div>' +
      '<div class="row"><button class="btn" data-a="pz" type="button">Zippy</button><button class="btn" data-a="pm" type="button">Mega</button><button class="btn" data-a="ph" type="button">Cheer up</button><button class="btn" data-a="pf" type="button">Toasty</button><button class="btn" data-a="nt" type="button">Next trophy</button></div>' +
      '<h3>Checks</h3><div class="row"><button class="btn" data-a="flash" type="button">Flash check</button><button class="btn" data-a="tap1" type="button">First tap time</button></div>' +
      '<h3>Color view</h3><div class="row"><button class="btn" data-a="cb" type="button">Color view: ' + CB[cbI][0] + '</button></div>' +
      '<div class="note">Power-ups and trophies appear on the table while a stage is running (open this from the pause card).</div><h3>Tuning</h3>';
    SL.forEach(function (s) { h += '<label class="sl" title="' + s[5] + '"><span>' + s[1] + '</span><input type="range" data-k="' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="' + s[4] + '"><output></output></label>'; });
    h += '<div class="row"><button class="btn" data-a="def" type="button">Reset tuning</button></div><div class="msg" aria-live="polite"></div>';
    d.innerHTML = h;
    function sync() { SL.forEach(function (s) { var r = d.querySelector('[data-k="' + s[0] + '"]'); r.value = cur(s[0]); r.nextSibling.textContent = String(Math.round(cur(s[0]) * 100) / 100); }); }
    sync();
    function say(t) { d.querySelector('.msg').textContent = t; }
    d.addEventListener('input', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (!k) return; apply(k, +e.target.value); e.target.nextSibling.textContent = String(Math.round(+e.target.value * 100) / 100); });
    d.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'), live = !gameEl.hidden && !K && S && !S.over, i, k, o;
      if (!a) return;
      if (a === 'roll') labGo(startSkee);
      else if (a === 'stage') { var n = +d.querySelector('#labW').value; labGo(function () { startFrom({ stage: +d.querySelector('#labS').value, wave: n >= 9 ? NWAVES : n - 1, golden: 0, cheer: 100 }); }); }
      else if (a === 'b10' || a === 'b100') { sv.bank = Math.min(999999, sv.bank + (a === 'b10' ? 10 : 100)); kit.save(sv); say('Bank: ' + sv.bank); }
      else if (a === 'tro') { sv.ach = 1023; kit.save(sv); say('All 10 trophies unlocked.'); }
      else if (a === 'upg') { sv.au = 1; sv.ar = 3; sv.ap = 2; sv.lm = 3; kit.save(sv); say('Auto Slingshot, Faster Fling, Better Pineapples and the Lime Launcher maxed.'); }
      else if (a === 'rst') { o = kit.validate({}); for (k in o) sv[k] = o[k]; kit.save(sv); updateContinue(); say('Save reset.'); }
      else if (a === 'flash') { say('Checking Stage 2, wave 3 (0%)'); flashCheck(say); }
      else if (a === 'tap1') say(tapTime());
      else if (a === 'cb') { var nm = cbSet((cbI + 1) % CB.length); e.target.textContent = 'Color view: ' + nm; say('Showing: ' + nm + (cbI ? '. Tap again for the next view.' : '.')); }
      else if (a === 'def') { for (k in LAB0) apply(k, LAB0[k]); sync(); say('Tuning back to normal.'); }
      else if (a === 'nt') { if (!live) { say('Start a stage first.'); return; } for (i = 0; i < ACH.length; i++) if (!((sv.ach | S.earned) & (1 << i))) { award(i); break; } labClose(); if (S.paused) resume(); }
      else if (a === 'pz' || a === 'pm' || a === 'ph' || a === 'pf') { if (!live) { say('Start a stage first.'); return; } spawnPU(a); labClose(); if (S.paused) resume(); }
    });
    return d;
  }
  var bLab = $('bLab');
  if (bLab) bLab.addEventListener('click', function () {
    $('cardBody').replaceChildren(panel()); $('cardTitle').textContent = 'Test Lab'; $('cw').hidden = false; root.setAttribute('data-dlg', '1'); $('cardOk').focus();
  });
  var gLab = document.createElement('button'), gcw = $('gcw'), body = $('gBody'), box = null;
  gLab.className = 'btn'; gLab.type = 'button'; gLab.id = 'gLab'; gLab.textContent = 'Test Lab'; gLab.style.margin = '.5rem .4rem 0 0';
  $('gBtn2').parentNode.insertBefore(gLab, $('gBtn2'));
  gLab.addEventListener('click', function () { $('gTitle').textContent = 'Test Lab'; body.hidden = true; gLab.hidden = true; box = panel(); body.parentNode.insertBefore(box, body.nextSibling); });
  new MutationObserver(function () { if (gcw.hidden && box) { box.remove(); box = null; body.hidden = false; gLab.hidden = false; } }).observe(gcw, { attributes: true, attributeFilter: ['hidden'] });
}());
