/* Test Lab: tester build only. Not part of the public game. Copyright (c) 2026 JNFoo. All rights reserved. */
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
  function panel() {
    var d = document.createElement('div'), h, i, w = '';
    d.className = 'lab';
    for (i = 1; i <= NWAVES; i++) w += '<option value="' + i + '">Wave ' + i + '</option>';
    h = '<h3>Minigame</h3><div class="row"><button class="btn" data-a="roll" type="button">Play Pineapple Roll</button></div>' +
      '<h3>Stages</h3><div class="row"><select id="labS" aria-label="Stage"><option value="1">Stage 1</option><option value="2">Stage 2</option><option value="3">Stage 3</option><option value="4">Stage 4</option><option value="5">Stage 5</option></select><select id="labW" aria-label="Wave">' + w + '<option value="9">Champion</option></select><button class="btn" data-a="stage" type="button">Start there</button></div>' +
      '<h3>Give</h3><div class="row"><button class="btn" data-a="b10" type="button">+10 bank</button><button class="btn" data-a="b100" type="button">+100 bank</button><button class="btn" data-a="tro" type="button">All trophies</button><button class="btn" data-a="upg" type="button">All upgrades</button><button class="btn" data-a="rst" type="button">Reset save</button></div>' +
      '<div class="row"><button class="btn" data-a="pz" type="button">Zippy</button><button class="btn" data-a="pm" type="button">Mega</button><button class="btn" data-a="ph" type="button">Cheer up</button><button class="btn" data-a="pf" type="button">Brrr</button><button class="btn" data-a="nt" type="button">Next trophy</button></div>' +
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
      else if (a === 'upg') { sv.au = 1; sv.ar = 3; sv.ap = 2; kit.save(sv); say('Auto Slingshot, Faster Fling and Better Pineapples maxed.'); }
      else if (a === 'rst') { o = kit.validate({}); for (k in o) sv[k] = o[k]; kit.save(sv); updateContinue(); say('Save reset.'); }
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
