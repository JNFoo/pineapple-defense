/* Pineapple Defense: stage 1 (Sandy Snack Shore). Copyright (c) 2026 JNFoo. All rights reserved. */
(function () {
'use strict';
var $ = function (i) { return document.getElementById(i); };
var root = document.documentElement;
var titleEl = $('title'), gameEl = $('game'), cv = $('cv'), ctx = cv.getContext('2d');

/* ---------- settings ---------- */
var NWAVES = 5, WAVE_N = [4, 5, 6, 7, 8], NSTAGES = 5;
var TAP_MIN = 0.03, FLICK_MIN = 0.025, COOLDOWN = 0.42;
var TYPES = {
  classic: { cd: 0.42, arc: 1, T: 1, rad: 0.55, splash: 0, size: 1, img: 'pa' },
  lobber: { cd: 0.9, arc: 2.2, T: 1.6, rad: 0.55, splash: 1.0, size: 1.3, img: 'pl' }
};
var curType = 'classic';

/* ---------- layout and projection ---------- */
var W = 1, H = 1, DPR = 1, hy = 0, gy = 0, FW = 0, size0 = 100, bg = null;
function sc(p) { return 0.16 + 0.84 * p; }
function px(xn, p) { return W / 2 + xn * FW * sc(p); }
function py(p) { return hy + (gy - hy) * p; }
function psz(p) { return size0 * sc(p); }

/* ---------- sprites ---------- */
var SZ = 384, IMG = { pa: {}, rh: {}, ad: {}, pl: {}, cw: {}, c2: {}, c3: {}, c4: {}, c5: {}, pz: {}, pm: {}, ph: {}, pf: {} }, PROP = {}, assets = null;
var VARS = ':root{--pa-hi:#ffeaa0;--pa-mid:#f8bd1c;--pa-lo:#a85a07;--pg-hi:#6b6aab;--pg-mid:#383767;--pg-lo:#171538;--ad-hi:#6a6677;--ad-mid:#34303f;--ad-lo:#15121d}.m-o,.m-grin,.m-pout,.brow{display:none}';
var MOOD = {
  happy: '',
  giggle: '.m-smile{display:none}.m-grin{display:block}',
  wow: '.m-smile{display:none}.m-o{display:block}',
  pout: '.m-smile{display:none}.m-pout{display:block}'
};
function toImage(svg, size) {
  return new Promise(function (res) {
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas');
      c.width = size.w; c.height = size.h;
      c.getContext('2d').drawImage(im, 0, 0, size.w, size.h);
      res(c);
    };
    im.onerror = function () { res(null); };
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
var TINT = { pl: ['#ffd9a8', '#f2862a', '#9a3a07'], pz: ['#e0ffb8', '#5cc84a', '#1f6a1c'], pm: ['#ecd8ff', '#9b5de5', '#4a1f8a'], ph: ['#ffd6e4', '#ff6f9c', '#9a1f4f'], pf: ['#e0f6ff', '#5bb8f0', '#1d5c99'] };
var MOODS_FOR = { pz: ['happy'], ph: ['happy'], pf: ['happy'], pm: ['happy', 'wow'] };
function spriteSvg(markup, mood, tint) {
  var vars = typeof tint === 'string' ? VARS + ':root{' + tint + '}' : tint ? VARS.replace('--pa-hi:#ffeaa0;--pa-mid:#f8bd1c;--pa-lo:#a85a07', '--pa-hi:' + tint[0] + ';--pa-mid:' + tint[1] + ';--pa-lo:' + tint[2]) : VARS;
  var clean = markup.replace(/\sstyle="transform[^"]*"/g, '');
  return clean.replace(/^[\s\S]*?<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + SZ + '" height="' + SZ + '"><style>' + vars + MOOD[mood] + '</style>');
}
function loadAssets() {
  if (assets) return assets;
  var src = {
    pa: $('pa').querySelector('svg').outerHTML,
    rh: $('pg').querySelector('svg').outerHTML,
    ad: $('spr-ad').innerHTML,
    cw: $('spr-cw').innerHTML
  };
  ['c2', 'c3', 'c4', 'c5'].forEach(function (k) { src[k] = champSvg(src.cw, k); TINT[k] = CHAMP_LOOK[k].vars; });
  src.pl = src.pz = src.pm = src.ph = src.pf = src.pa;
  var jobs = [];
  Object.keys(src).forEach(function (k) {
    (MOODS_FOR[k] || Object.keys(MOOD)).forEach(function (m) {
      jobs.push(toImage(spriteSvg(src[k], m, TINT[k]), { w: SZ, h: SZ }).then(function (c) { IMG[k][m] = c; }));
    });
  });
  jobs.push(toImage($('spr-palm').innerHTML, { w: 400, h: 520 }).then(function (c) { PROP.palm = c; }));
  jobs.push(toImage($('spr-plant').innerHTML, { w: 240, h: 240 }).then(function (c) { PROP.plant = c; }));
  jobs.push(document.fonts && document.fonts.load ? document.fonts.load('800 32px "Bricolage Grotesque"') : Promise.resolve());
  assets = Promise.all(jobs);
  return assets;
}

/* ---------- save ---------- */
var kit = SaveKit.create({ key: 'pd-save', prefix: 'PD1',
  schema: { stage: 'int:5', wave: 'int:8', golden: 'int:9999', cheer: 'int:100', cleared: 'int:5', bank: 'int:999999', ach: 'int:1023', au: 'int:1', ar: 'int:3', ap: 'int:2' },
  defaults: { stage: 1, wave: 0, golden: 0, cheer: 100, cleared: 0, bank: 0, ach: 0, au: 0, ar: 0, ap: 0 } });
var sv = kit.load() || kit.validate({});
sv.ach = sv.ach | 0; sv.au = sv.au | 0; sv.ar = sv.ar | 0; sv.ap = sv.ap | 0;
var btnCont = $('bCont');
function updateContinue() {
  var can = sv.wave > 0 || sv.stage > 1;
  btnCont.disabled = !can;
  btnCont.textContent = can ? 'Continue: ' + (sv.stage > 1 ? 'stage ' + sv.stage + (sv.wave > 0 ? ', ' : '') : '') + (sv.wave >= NWAVES ? 'boss' : sv.wave > 0 ? 'wave ' + (sv.wave + 1) : '') : 'Continue';
  btnCont.title = can ? 'Pick up where you left off' : 'No saved game yet';
}
updateContinue();

/* ---------- state ---------- */
var S, penguins, shots, bits, pops;
var calm = false, running = false, raf = 0, last = 0, timeScale = 1, qLevel = 0;
var even = new EvenDt();
var gov = new QualityGovernor({ levels: 3, onChange: function (l) { qLevel = l; resize(); } });

function newState() {
  S = { wave: 0, spawned: 0, toSpawn: 0, spawnT: 0, mode: 'intro', modeT: 0, cheer: 100, golden: 0, bumps: 0,
        cd: 0, cdMax: 0.42, t: 0, wob: 0, thrown: false, over: false, paused: false, id: 0, lastLane: -1, boss: null, inBoss: false, bossHp: 3, bossMax: 3, stage: 1, sa: 0,
        puT: 9, pu: null, lastPu: '', fx: { zip: 0, mega: 0, frost: 0 }, tro: null, tq: [], earned: 0, streak: 0, allBumps: 0, toast: null, au: { cd: 1.5, tgt: null, a: 0 } };
  penguins = []; shots = []; bits = []; pops = [];
}

/* ---------- HUD ---------- */
var elWave = $('waveTxt'), elGold = $('goldTxt'), elCheer = $('cheerFill'), elReady = $('ready'), elBanner = $('banner'), elHint = $('hint');
var shown = { wave: '', gold: -1, cheer: -1, ready: -1, left: -1, combo: -1, bank: -1, cups: '' };
var elLeft = $('leftTxt'), elCombo = $('comboTxt'), elBank = $('bankTxt'), elCups = $('cupsTxt');
function popcount(n) { var c = 0; while (n) { c += n & 1; n >>= 1; } return c; }
function setTxt(el, key, v) { if (shown[key] !== v) { shown[key] = v; el.textContent = String(v); } }
function hud() {
  var w = S.inBoss ? CHAMP[S.stage].s + ': ' + S.bossHp + ' / ' + S.bossMax : (S.stage > 1 ? 'S' + S.stage + ' · ' : '') + 'Wave ' + Math.max(1, S.wave) + ' / ' + NWAVES;
  if (w !== shown.wave) { shown.wave = w; elWave.textContent = w; }
  if (S.golden !== shown.gold) { shown.gold = S.golden; elGold.textContent = String(S.golden); }
  var c = Math.round(S.cheer);
  if (c !== shown.cheer) { shown.cheer = c; elCheer.style.transform = 'scaleY(' + (c / 100) + ')'; elCheer.parentNode.setAttribute('data-low', c < 35 ? '1' : '0'); }
  var nl = Math.max(0, S.toSpawn - S.spawned), j; for (j = 0; j < penguins.length; j++) if (penguins[j].st === 'walk') nl++;
  setTxt(elLeft, 'left', nl); setTxt(elCombo, 'combo', S.streak); setTxt(elBank, 'bank', sv.bank); setTxt(elCups, 'cups', popcount(sv.ach) + '/10');
  var r = Math.round((1 - Math.max(0, S.cd) / COOLDOWN) * 20);
  if (r !== shown.ready) { shown.ready = r; elReady.style.setProperty('--pct', (r * 5) + '%'); elReady.setAttribute('data-ready', r >= 20 ? '1' : '0'); }
}
var bannerT = 0;
function banner(text, ms) {
  elBanner.textContent = text; elBanner.classList.toggle('ml', text.indexOf('\n') >= 0);
  try { StickerText.apply(elBanner, { outline: '#fff7e3' }); } catch (e) {}
  elBanner.hidden = false;
  clearTimeout(bannerT);
  if (!calm && elBanner.animate) {
    elBanner.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.12)', opacity: 1, offset: .5 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 420, easing: 'ease-out' });
  }
  bannerT = setTimeout(function () { elBanner.hidden = true; }, ms);
}

/* ---------- canvas and background ---------- */
function resize() {
  var r = gameEl.getBoundingClientRect();
  W = Math.max(200, r.width); H = Math.max(200, r.height);
  var cap = qLevel === 0 ? 2 : qLevel === 1 ? 1.5 : 1;
  DPR = Math.min(window.devicePixelRatio || 1, cap);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  hy = H * 0.47; gy = H * 0.93; FW = W * 0.5;
  size0 = Math.min(W * 0.30, H * 0.30);
  if (K) buildSkeeBg(); else buildBg();
}
function peaks(g, base, ph, arr, color) {
  var n = arr.length, step = W / (n - 1);
  g.beginPath(); g.moveTo(0, base);
  for (var i = 0; i < n; i++) {
    g.lineTo(i * step, base - arr[i] * ph);
    if (i < n - 1) g.lineTo((i + 0.5) * step, base - ph * 0.22);
  }
  g.lineTo(W, base); g.closePath(); g.fillStyle = color; g.fill();
}
function buildBg() {
  if (stageNo() > 1) { buildStageBg(); return; }
  bg = document.createElement('canvas');
  bg.width = cv.width; bg.height = cv.height;
  var g = bg.getContext('2d'); g.scale(DPR, DPR);
  var sk = g.createLinearGradient(0, 0, 0, hy);
  sk.addColorStop(0, '#b5d6e8'); sk.addColorStop(0.7, '#cfe6ec'); sk.addColorStop(1, '#eef5f1');
  g.fillStyle = sk; g.fillRect(0, 0, W, hy + 2);
  var sx = W * 0.82, sy = hy * 0.34, sr = Math.min(W, H) * 0.075;
  var sg = g.createRadialGradient(sx, sy, 0, sx, sy, sr * 2);
  sg.addColorStop(0, '#fff3c4'); sg.addColorStop(0.4, '#ffe08a'); sg.addColorStop(0.5, 'rgba(255,217,138,.35)'); sg.addColorStop(1, 'rgba(255,217,138,0)');
  g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, sr * 2, 0, 6.3); g.fill();
  peaks(g, hy, H * 0.2, [0.7, 1, 0.55, 0.9, 0.6, 1, 0.5, 0.85, 0.7], '#dbe8f0');
  peaks(g, hy + 2, H * 0.12, [0.6, 0.9, 1, 0.55, 0.8, 0.95, 0.6, 1, 0.5, 0.8], '#c9dde8');
  g.fillStyle = '#b3cdc0'; g.beginPath(); g.ellipse(W * 0.12, hy + 2, W * 0.2, H * 0.07, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#ead7a0'; g.beginPath(); g.ellipse(W * 0.08, hy + 4, W * 0.18, H * 0.035, 0, Math.PI, 0); g.fill();
  var sea = g.createLinearGradient(0, hy, 0, hy + H * 0.035);
  sea.addColorStop(0, '#a8d6ec'); sea.addColorStop(1, '#7fbfe0');
  g.fillStyle = sea; g.fillRect(0, hy, W, H * 0.035);
  var gd = g.createLinearGradient(0, hy + H * 0.035, 0, H);
  gd.addColorStop(0, '#eef4f6'); gd.addColorStop(0.2, '#f3efdc'); gd.addColorStop(0.55, '#ecdcae'); gd.addColorStop(1, '#e0c688');
  g.fillStyle = gd; g.fillRect(0, hy + H * 0.035, W, H);
  g.strokeStyle = 'rgba(120,90,40,.08)'; g.lineWidth = 2;
  for (var l = -3; l <= 2; l++) {
    var xn = (l + 0.5) * 0.4;
    g.beginPath(); g.moveTo(px(xn, 0.06), py(0.06)); g.lineTo(px(xn, 1.05), py(1.05)); g.stroke();
  }
  buildDyn(sx, sy, sr);
  var vg = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.45, W / 2, H * 0.55, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(42,18,13,0)'); vg.addColorStop(1, 'rgba(42,18,13,.2)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

/* animated scenery: pieces are pre-drawn once, then moved every frame */
var dyn = {};
function buildDyn(sx, sy, sr) {
  dyn = { sx: sx, sy: sy, sr: sr };
  if (PROP.palm && stageNo() === 1) { var ph = Math.min(H * 0.3, W * 0.45), pw = ph * 100 / 130; dyn.palm = { x: W * 0.015, y: hy + H * 0.075 - ph * 0.954, w: pw, h: ph }; }
  if (PROP.plant && stageNo() === 1) { var qs = Math.min(H * 0.1, W * 0.17), by = hy + H * 0.07; dyn.pl = [{ x: W * 0.13, y: by - qs * 0.92, s: qs }, { x: W * 0.2, y: by + H * 0.012 - qs * 0.78 * 0.92, s: qs * 0.78 }]; }
  var hc = document.createElement('canvas'); hc.width = hc.height = 128;
  var hg = hc.getContext('2d'), gr = hg.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,236,160,.9)'); gr.addColorStop(0.35, 'rgba(255,224,138,.35)'); gr.addColorStop(1, 'rgba(255,224,138,0)');
  hg.fillStyle = gr; hg.fillRect(0, 0, 128, 128); dyn.halo = hc;
}
function sway(img, x, y, w, h, px0, py0, ang) {
  ctx.save(); ctx.translate(x + w * px0, y + h * py0); ctx.rotate(ang); ctx.drawImage(img, -w * px0, -h * py0, w, h); ctx.restore();
}
function drawScenery(t) {
  var q = qLevel;
  if (stageNo() > 1) { STAGES[stageNo()].anim(t); return; }
  if (dyn.halo) { var hs = dyn.sr * (4.4 + 0.5 * Math.sin(t * 1.1)); ctx.globalAlpha = 0.5 + 0.22 * Math.sin(t * 1.1 + 1); ctx.drawImage(dyn.halo, dyn.sx - hs / 2, dyn.sy - hs / 2, hs, hs); ctx.globalAlpha = 1; }
  /* sea: moving ripples, bobbing icebergs, twinkles */
  var sb = H * 0.035, i;
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  for (i = 0; i < 10; i++) {
    var wx = ((W * (0.05 + i * 0.105) + t * W * (0.012 + (i % 3) * 0.004)) % (W * 1.05)) - W * 0.03, wy = hy + H * (0.011 + (i % 3) * 0.009) + Math.sin(t * 1.6 + i) * 1.5;
    ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 12, wy - 4 - Math.sin(t * 2 + i) * 1.5, wx + 24, wy);
  }
  ctx.stroke();
  for (i = 0; i < 2; i++) {
    var ix = ((W * (0.42 + i * 0.3) + t * W * 0.006 * (i ? -1 : 1)) % (W * 1.1) + W * 1.1) % (W * 1.1) - W * 0.05, iy = hy + H * 0.026 + Math.sin(t * 0.9 + i * 2) * 2.2, is = H * (0.026 - i * 0.007);
    ctx.save(); ctx.translate(ix, iy); ctx.rotate(Math.sin(t * 0.7 + i) * 0.04);
    ctx.fillStyle = '#f4fbff'; ctx.beginPath(); ctx.moveTo(-is * 0.9, 0); ctx.lineTo(-is * 0.35, -is * 1.0); ctx.lineTo(0, -is * 0.55); ctx.lineTo(is * 0.4, -is * 1.25); ctx.lineTo(is * 0.95, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,180,215,.55)'; ctx.beginPath(); ctx.moveTo(0, -is * 0.55); ctx.lineTo(is * 0.4, -is * 1.25); ctx.lineTo(is * 0.95, 0); ctx.lineTo(is * 0.1, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* shore props sway */
  if (dyn.palm) sway(PROP.palm, dyn.palm.x, dyn.palm.y, dyn.palm.w, dyn.palm.h, 0.42, 0.95, Math.sin(t * 1.25) * 0.028);
  if (dyn.pl) for (i = 0; i < dyn.pl.length; i++) { var o = dyn.pl[i]; sway(PROP.plant, o.x, o.y, o.s, o.s, 0.5, 0.92, Math.sin(t * 1.7 + i * 1.3) * 0.045); }
  if (q < 2) {
    /* gulls and glints */
    for (i = 0; i < 2; i++) {
      var gx = ((t * W * (0.035 + i * 0.012) + W * (0.2 + i * 0.55)) % (W * 1.3)) - W * 0.15, gyy = hy * (0.5 - i * 0.12) + Math.sin(t * 0.8 + i * 3) * H * 0.012, fl = Math.sin(t * 5 + i * 2) * 0.55, gs = W * 0.03;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
      ctx.moveTo(gx - gs, gyy - gs * fl * 0.6); ctx.quadraticCurveTo(gx - gs * 0.45, gyy - gs * (0.5 + fl * 0.5), gx, gyy); ctx.quadraticCurveTo(gx + gs * 0.45, gyy - gs * (0.5 + fl * 0.5), gx + gs, gyy - gs * fl * 0.6); ctx.stroke();
    }
    for (i = 0; i < 7; i++) {
      var a = Math.pow(Math.max(0, Math.sin(t * 1.9 + i * 1.7)), 6); if (a < 0.05) continue;
      var tx = W * (0.1 + ((i * 0.137) % 0.8)), ty = i % 2 ? hy + sb * 0.5 : hy + H * (0.07 + (i % 3) * 0.11), r = H * 0.011 * (0.5 + a);
      ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx - r, ty); ctx.lineTo(tx + r, ty); ctx.moveTo(tx, ty - r); ctx.lineTo(tx, ty + r); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
}

/*{{STAGES_JS}}*/

/* ---------- particles ---------- */
var PINE_COL = ['#f8bd1c', '#ffe58a', '#7fd68f'], SNOW_COL = ['#ffffff', '#cfe9f5', '#a8d6ec'];
function burst(x, y, n, cols) {
  if (calm) return;
  var limit = qLevel === 0 ? 140 : qLevel === 1 ? 90 : 50;
  n = Math.round(n * (qLevel === 2 ? 0.6 : 1));
  for (var i = 0; i < n && bits.length < limit; i++) {
    var k = i % 3, a = Math.random() * 6.28, sp = 90 + Math.random() * 190;
    var s = 4 + Math.random() * 6;
    bits.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 140, rot: Math.random() * 6, vr: Math.random() * 14 - 7,
      w: k === 0 ? s * 0.8 : k === 1 ? s * 1.2 : 3.2, h: k === 0 ? s * 1.2 : k === 1 ? s * 0.75 : 5.6, k: k,
      c: k === 2 ? '#4a2c18' : cols[i % cols.length], t: 0, ttl: 0.7 + Math.random() * 0.5 });
  }
}
function popText(x, y, txt, col) { x = Math.max(W * 0.22, Math.min(W * 0.78, x)); pops.push({ x: x, y: y, txt: txt, col: col, t: 0, ttl: 0.95, rot: (Math.random() - 0.5) * 0.4 }); }
var HIT_WORDS = ['hee hee!', 'tee hee!', 'oh my!', 'wheee!', 'ooh!'];


/* ---------- trophies and power-ups (clickable on the table) ---------- */
var ACH = [
  { n: 'First Toss', d: 'Fling your very first pineapple.' },
  { n: 'Hat Trick', d: 'Hit 3 penguins in a row.' },
  { n: 'Splash Party', d: 'Giggle 3 penguins with one splash.' },
  { n: 'Perfect Wave', d: 'Clear a wave with no bumps.' },
  { n: 'Snowball Popper', d: 'Pop all of Coach Waddles’ snowballs.' },
  { n: 'Coach Giggles', d: 'Make Coach Waddles giggle.' },
  { n: 'Power Pal', d: 'Grab a power-up pineapple.' },
  { n: 'Eagle Eye', d: 'Hit 5 penguins in a row.' },
  { n: 'Phew!', d: 'Clear a wave when the cheer is low.' },
  { n: 'Spotless Stand', d: 'Win the stage with no bumps at all.' }
];
var PU = {
  pz: { name: 'Zippy!', col: '#5cc84a', glow: '92,200,74', secs: 8, tip: 'Super fast throws' },
  pm: { name: 'Mega!', col: '#9b5de5', glow: '155,93,229', secs: 8, tip: 'Every throw splashes' },
  ph: { name: 'Cheer up!', col: '#ff6f9c', glow: '255,111,156', secs: 0, tip: 'Fills the cheer meter' },
  pf: { name: 'Brrr!', col: '#5bb8f0', glow: '91,184,240', secs: 6, tip: 'Penguins walk slowly' }
};
var PU_KEYS = ['pz', 'pm', 'ph', 'pf'], slowK = 1;
function toast(txt) { S.toast = { txt: txt, t: 0, ttl: 2.4 }; }
function award(i) {
  var b = 1 << i;
  if ((sv.ach & b) || (S.earned & b)) return;
  S.earned |= b; S.tq.push(i); toast('Trophy: ' + ACH[i].n + '!');
}
function slot(k) { var s = Math.min(W * 0.2, H * 0.105), bottom = H * 0.882; return { x: k ? W * 0.89 : W * 0.115, bottom: bottom, s: s, cy: bottom - s * 0.5, r: Math.max(s * 0.62, 36) }; }
function saveGold() { var cl = S.inBoss ? NWAVES : S.wave - 1; if (cl > 0 && sv.wave === cl) sv.golden = S.golden; kit.save(sv); }
function collectTro(auto) {
  if (!S.tro) return;
  var id = S.tro.id, o = slot(1); S.tro = null;
  sv.ach |= 1 << id; S.golden += 2; saveGold();
  burst(o.x, o.cy, 14, PINE_COL.concat(['#fff7e3'])); popText(o.x, o.cy - o.s * 0.6, auto ? '+2 saved!' : '+2 golden!', '#b86e00');
}
function spawnPU(k) { S.pu = { k: k, t: 0, ttl: 9 }; S.lastPu = k; toast('Tap the ' + PU[k].name.replace('!', '') + ' pickup: ' + PU[k].tip); }
function collectPU() {
  if (!S.pu) return;
  var k = S.pu.k, d = PU[k], o = slot(0); S.pu = null;
  if (k === 'pz') S.fx.zip = d.secs; else if (k === 'pm') S.fx.mega = d.secs; else if (k === 'pf') S.fx.frost = d.secs;
  else S.cheer = Math.min(100, S.cheer + 35);
  burst(o.x, o.cy, 16, [d.col, '#fff7e3', '#ffe58a']); popText(o.x, o.cy - o.s * 0.6, d.name, d.col);
  award(6);
}
function updateTable(dt) {
  var f = S.fx; f.zip = Math.max(0, f.zip - dt); f.mega = Math.max(0, f.mega - dt); f.frost = Math.max(0, f.frost - dt);
  slowK = f.frost > 0 ? 0.4 : 1;
  if (S.tro) { S.tro.t += dt; if (S.tro.t > 12) collectTro(true); }
  else if (S.tq.length) S.tro = { id: S.tq.shift(), t: 0 };
  if (S.pu) { S.pu.t += dt; if (S.pu.t > S.pu.ttl) S.pu = null; }
  else if (S.mode === 'run' || S.mode === 'boss') {
    S.puT -= dt;
    if (S.puT <= 0) {
      var k;
      if (S.cheer < 45 && S.lastPu !== 'ph') k = 'ph';
      else do { k = PU_KEYS[Math.floor(Math.random() * 4)]; } while (k === S.lastPu);
      spawnPU(k); S.puT = 14 + Math.random() * 8;
    }
  }
  if (S.toast) { S.toast.t += dt; if (S.toast.t > S.toast.ttl) S.toast = null; }
}
function effType() {
  var b = TYPES[curType];
  if (S.fx.mega > 0) return { cd: b.cd, arc: b.arc, T: b.T, rad: b.rad, splash: Math.max(1.0, b.splash), size: Math.max(1.15, b.size), img: 'pm' };
  return b;
}


/* ---------- auto slingshot (bought in the shop) ---------- */
var AUTO_INT = [3.6, 2.7, 1.9, 1.3];
var AUTO_TYPES = [
  { cd: 0, arc: 1, T: 1, rad: 0.55, splash: 0, size: 1, img: 'pa' },
  { cd: 0, arc: 2.2, T: 1.6, rad: 0.55, splash: 1.0, size: 1.3, img: 'pl' },
  { cd: 0, arc: 2.2, T: 1.6, rad: 0.55, splash: 1.3, size: 1.45, img: 'pm' }
];
function autoInt() { return AUTO_INT[sv.ar] * (S.fx.zip > 0 ? 0.5 : 1); }
function autoType() { return AUTO_TYPES[sv.ap]; }
function autoPick() {
  var au = S.au, best = null, i, pg;
  if (au.tgt && !au.tgt.aut && (au.tgt.st === 'walk' || (au.tgt === S.boss && au.tgt.st === 'hold'))) return;
  for (i = 0; i < penguins.length; i++) { pg = penguins[i]; if (pg.st === 'walk' && !pg.aut && pg.p > 0.1 && (!best || pg.p > best.p)) best = pg; }
  if (!best && S.boss && S.boss.st === 'hold' && !S.boss.aut) best = S.boss;
  au.tgt = best;
}
function autoFire(tg) {
  var ty = autoType(), g = autoGeom(), au = S.au, po = pouchPos(g, au.a);
  var ttf = (0.42 + 0.38 * (1 - tg.p)) * ty.T, pEnd = Math.min(0.94, tg.p + (tg.st === 'walk' ? tg.v * slowK : 0) * ttf);
  var xE = px(tg.xn, pEnd), yE = py(pEnd) - psz(pEnd) * (tg.big || 1) * 0.42;
  var arc = Math.max(H * 0.05, Math.min(H * (0.14 + 0.2 * (1 - pEnd)) * ty.arc, (po.y + yE) / 2 - H * 0.06));
  shots.push({ ty: ty, s0: g.ps * 0.92 * ty.size, x0: po.x, y0: po.y, xE: xE, yE: yE, pEnd: pEnd, t: 0, T: ttf, arc: arc, spin: (Math.random() < 0.5 ? -1 : 1) * 7, ph: 0, auto: true, tgt: tg });
  tg.aut = true; elHint.hidden = true;
}
function updateAuto(dt) {
  var au = S.au, ta = 0;
  if (!sv.au) return;
  if (S.mode === 'run' || S.mode === 'boss') {
    au.cd -= dt; autoPick();
    if (au.tgt && au.cd <= 0) { autoFire(au.tgt); au.cd = autoInt(); au.tgt = null; autoPick(); }
  } else au.tgt = null;
  if (au.tgt) { var c = penCenter(au.tgt), po = pouchPos(autoGeom(), au.a); ta = Math.max(-0.6, Math.min(0.6, Math.atan2(c.x - po.x, po.y - c.y))); }
  au.a += (ta - au.a) * Math.min(1, dt * 9);
}
function drawAutoMark() {
  var au = S.au; if (!sv.au || !au.tgt || S.over) return;
  var c = penCenter(au.tgt), t = calm ? 0 : S.t, r = Math.max(13, c.s * 0.11), x = c.x, y = c.y - c.s * 0.62 - Math.abs(Math.sin(t * 4)) * c.s * 0.04, ready = 1 - Math.max(0, au.cd) / autoInt();
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(22,120,122,.9)'; ctx.lineWidth = Math.max(2.5, r * 0.22); ctx.setLineDash([r * 0.6, r * 0.5]); ctx.lineDashOffset = -t * 14;
  ctx.beginPath(); ctx.arc(c.x, c.y, c.s * 0.46, 0, 6.3); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#2fb3aa'; ctx.strokeStyle = '#fff7e3'; ctx.lineWidth = Math.max(2, r * 0.18);
  ctx.beginPath(); ctx.moveTo(x, y + r * 1.9); ctx.lineTo(x - r * 0.6, y + r * 1.0); ctx.lineTo(x + r * 0.6, y + r * 1.0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.6, r * 0.16);
  ctx.beginPath(); ctx.arc(x, y, r * 0.5, -Math.PI / 2, -Math.PI / 2 + 6.283 * ready); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r * 0.16, 0, 6.3); ctx.fill();
  ctx.restore();
}

/* ---------- waves and penguins ---------- */
function effW() { return S.wave + (S.stage - 1) * 2; }
function beginWave(n) {
  S.wave = n; S.spawned = 0; S.toSpawn = WAVE_N[n - 1]; S.spawnT = 0.6; S.bumps = 0;
  S.mode = 'intro'; S.modeT = 0;
  if (n === 1 && S.stage > 1) banner('Stage ' + S.stage + '\n' + STAGES[S.stage].title, 2300);
  else banner(n === NWAVES ? 'Final wave!' : 'Wave ' + n, 1500);
}
function spawn() {
  var w = effW(), lane;
  do { lane = Math.floor(Math.random() * 5); } while (lane === S.lastLane);
  S.lastLane = lane;
  var pAd = w < 3 ? 0 : Math.min(0.5, 0.12 * (w - 2));
  var kind = Math.random() < pAd ? 'ad' : 'rh';
  var base = 0.07 + 0.006 * w;
  penguins.push({ id: ++S.id, kind: kind, xn: (lane - 2) * 0.4 + (Math.random() - 0.5) * 0.06, p: 0.05, v: base * (kind === 'ad' ? 1.3 : 1),
    st: 'walk', t: 0, mood: 'happy', ph: Math.random() * 6, side: Math.random() < 0.5 ? -1 : 1, hat: false, puff: 0, a: 1 });
  S.spawned++;
}
function bump(pg) {
  pg.st = 'bump'; pg.t = 0; pg.mood = 'pout'; pg.p = 0.95;
  S.wob = 1; S.bumps++; S.allBumps++; S.cheer = Math.max(0, S.cheer - 12);
  if (S.cheer <= 0) endStage(false);
}
function hitPenguin(pg, x, y) {
  pg.st = 'hit'; pg.t = 0; pg.mood = 'wow'; pg.hat = true;
  S.cheer = Math.min(100, S.cheer + 2);
  burst(x, y, 12, PINE_COL);
  popText(x, y - psz(pg.p) * 0.3, HIT_WORDS[Math.floor(Math.random() * HIT_WORDS.length)], '#b86e00');
}
function updatePenguin(pg, dt) {
  pg.t += dt; pg.ph += dt * (6 + pg.v * 40);
  if (pg.st === 'walk') {
    pg.p += pg.v * dt * slowK;
    if (pg.p >= 0.95) bump(pg);
  } else if (pg.st === 'hit') {
    if (pg.t > 0.9) { pg.st = 'slide'; pg.t = 0; pg.mood = 'giggle'; }
  } else if (pg.st === 'slide') {
    pg.p -= (0.5 + pg.t * 1.4) * dt;
    pg.puff -= dt;
    if (pg.puff <= 0) { pg.puff = 0.07; burst(px(pg.xn, pg.p), py(pg.p), 2, SNOW_COL); }
    if (pg.p <= 0.06) pg.st = 'gone';
  } else if (pg.st === 'bump') {
    if (pg.t > 0.9) { pg.xn += pg.side * dt * 0.8; pg.mood = 'happy'; }
    if (pg.t > 1.9) pg.a = Math.max(0, 1 - (pg.t - 1.9) / 0.6);
    if (pg.t > 2.5) pg.st = 'gone';
  }
}

/* ---------- throwing ---------- */
function penCenter(pg) { var s = psz(pg.p) * (pg.big || 1); return { x: px(pg.xn, pg.p), y: py(pg.p) - s * 0.42, s: s }; }
function targets() {
  var out = [], i;
  for (i = 0; i < penguins.length; i++) if (penguins[i].st === 'walk') out.push(penguins[i]);
  if (S.boss && (S.boss.st === 'hold' || S.boss.st === 'walk')) out.push(S.boss);
  return out;
}
function throwAt(ox, oy, dx, dy, spd, tapPoint) {
  if (S.cd > 0 || S.over || S.paused) return;
  var ty = effType(), len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
  var best = null, bs = 1e9, ttf = 0.6, list = targets(), i;
  for (i = 0; i < list.length; i++) {
    var pg = list[i], c = penCenter(pg), wx = c.x - ox, wy = c.y - oy, t = wx * dx + wy * dy;
    if (t <= 0) continue;
    var perp = Math.abs(wx * dy - wy * dx);
    if (perp > c.s * 0.9) continue;
    var score = perp / c.s - 0.25 * pg.p + ((pg.aut || pg === S.au.tgt) ? 0.5 : 0);
    if (score < bs) { bs = score; best = pg; }
  }
  var xE, yE, pEnd;
  if (best) {
    ttf = (0.42 + 0.38 * (1 - best.p)) * ty.T;
    pEnd = Math.min(0.94, best.p + (best.st === 'walk' ? best.v * slowK : 0) * ttf);
    xE = px(best.xn + (best.vx || 0) * ttf, pEnd); yE = py(pEnd) - psz(pEnd) * (best.big || 1) * 0.42;
  } else {
    pEnd = tapPoint ? Math.max(0.12, Math.min(0.92, (tapPoint.y - hy) / (gy - hy))) : Math.max(0.25, Math.min(0.92, 0.25 + (spd - 0.8) * 0.2));
    yE = py(pEnd) - psz(pEnd) * 0.3;
    var tt = (yE - oy) / dy; xE = ox + dx * tt;
    ttf = (0.42 + 0.38 * (1 - pEnd)) * ty.T;
  }
  var cdv = S.fx.zip > 0 ? 0.15 : ty.cd;
  S.cd = cdv; S.cdMax = cdv; S.thrown = true; award(0);
  elHint.hidden = true;
  var arc = Math.max(H * 0.05, Math.min(H * (0.14 + 0.2 * (1 - pEnd)) * ty.arc, (oy + yE) / 2 - H * 0.06));
  shots.push({ ty: ty, s0: slingGeom().ps * 0.92 * ty.size, x0: ox, y0: oy, xE: xE, yE: yE, pEnd: pEnd, t: 0, T: ttf, arc: arc, spin: (Math.random() < 0.5 ? -1 : 1) * 7, ph: 0 });
}
function hitBoss(units, c) {
  var b = S.boss;
  if (b.shield > 0) {
    var had = b.shield; b.shield = Math.max(0, b.shield - units); if (had > 0 && b.shield === 0) award(4);
    burst(c.x, c.y, 8, SNOW_COL); popText(c.x, c.y - c.s * 0.35, 'poof!', '#2f6f9f');
    return true;
  }
  b.hp--; if (b.hp <= 0) award(5); S.bossHp = Math.max(0, b.hp); b.st = 'hit'; b.t = 0; b.mood = 'wow'; b.hat = true;
  S.cheer = Math.min(100, S.cheer + 4);
  burst(c.x, c.y, 18, PINE_COL); popText(c.x, c.y - c.s * 0.4, 'tee hee!', '#b86e00');
  return true;
}
function landShot(s) {
  var ty = s.ty, hit = false, i, c, d, best = null, bd = ty.rad, nh = 0;
  if (s.tgt) s.tgt.aut = false;
  if (S.boss && S.boss.st === 'hold') {
    c = penCenter(S.boss);
    if (Math.hypot(c.x - s.xE, c.y - s.yE) / c.s < 0.8) { hit = hitBoss(ty.splash ? 2 : 1, c); if (!ty.splash) { if (!s.auto) { S.streak++; if (S.streak >= 3) award(1); if (S.streak >= 5) award(7); } return true; } }
  }
  for (i = 0; i < penguins.length; i++) {
    var pg = penguins[i]; if (pg.st !== 'walk') continue;
    c = penCenter(pg); d = Math.hypot(c.x - s.xE, c.y - s.yE) / c.s;
    if (ty.splash) { if (d < ty.splash) { hitPenguin(pg, c.x, c.y - c.s * 0.2); hit = true; nh++; } }
    else if (d < bd) { bd = d; best = pg; }
  }
  if (best) { c = penCenter(best); hitPenguin(best, c.x, c.y - c.s * 0.2); hit = true; }
  if (!hit) burst(s.xE, s.yE + psz(s.pEnd) * 0.3, 5, PINE_COL);
  if (nh >= 3) award(2);
  if (!s.auto) { S.streak = hit ? S.streak + 1 : 0; if (S.streak >= 3) award(1); if (S.streak >= 5) award(7); }
  return hit;
}
function updateShot(s, dt) {
  s.t += dt;
  if (s.ph === 0 && s.t >= s.T) {
    if (landShot(s)) { s.dead = true; return; }
    s.ph = 1; s.t = 0; s.T = 0.5;
    var gx = (s.xE - s.x0), gy2 = (s.yE - s.y0), l = Math.hypot(gx, gy2) || 1;
    s.rx = s.xE + gx / l * W * 0.05; s.ry = s.yE + gy2 / l * W * 0.05;
  } else if (s.ph === 1 && s.t >= s.T) s.dead = true;
}

/* ---------- stage flow ---------- */
function startStage(from) {
  var st = from && from.stage >= 1 && from.stage <= NSTAGES ? from.stage : 1;
  newState(); S.stage = st; buildBg();
  S.t = 0;
  elBanner.hidden = true;
  elHint.hidden = !!(from && (from.wave > 0 || from.stage > 1));
  if (from) { S.golden = from.golden; S.cheer = Math.max(60, from.cheer); }
  hud();
  if (from && from.wave >= NWAVES) startBoss(); else beginWave(from ? from.wave + 1 : 1);
}
function continueGame() { titleEl.hidden = true; gameEl.hidden = false; loadAssets().then(function () { resize(); startStage(sv); run(); }); }
function retryWave() { var w = S.inBoss ? NWAVES : S.wave - 1, g = S.golden; startStage({ stage: S.stage, wave: w, golden: g, cheer: 60 }); run(); }
function endStage(win) {
  S.over = true;
  if (win) {
    burst(W / 2, H * 0.3, 60, PINE_COL.concat(['#ff6f86', '#8fc6e4']));
    if (S.allBumps === 0) award(9);
    if (S.tro) collectTro(true);
    while (S.tq.length) { S.tro = { id: S.tq.shift(), t: 0 }; collectTro(true); }
    var st = S.stage, last = st >= NSTAGES, CH = CHAMP[st];
    sv.bank = Math.min(999999, sv.bank + S.golden); sv.golden = 0; sv.wave = 0; sv.cheer = 100; sv.cleared = Math.max(sv.cleared, st); sv.stage = last ? 1 : st + 1;
    kit.save(sv); updateContinue();
    if (last) showCard('You did it!', CH.n + ' is giggling and every stage is clear! You collected ' + S.golden + ' Golden Pineapples. Spend them in the Shop on the title screen.', 'Play again', startAgain);
    else showCard('Stage ' + st + ' clear!', CH.n + ' is giggling! You collected ' + S.golden + ' Golden Pineapples. Next up: ' + STAGES[st + 1].title.replace('\n', ' ') + '.', 'Next stage', function () { startStage({ stage: st + 1, wave: 0, golden: 0, cheer: 100 }); run(); });
  } else {
    showCard('The stand needs a break!', 'Everyone is giggling. Let us try this wave again!', 'Try again', retryWave);
  }
}
function waveClear() {
  S.mode = 'clear'; S.modeT = 0;
  if (S.bumps === 0) award(3);
  if (S.cheer < 30) award(8);
  S.cheer = Math.min(100, S.cheer + 15);
  S.golden += 1 + (S.bumps === 0 ? 1 : 0);
  banner(S.bumps === 0 ? 'Perfect wave!' : 'Wave clear!', 1300);
  sv.stage = S.stage; sv.wave = S.wave; sv.golden = S.golden; sv.cheer = Math.round(S.cheer); kit.save(sv); updateContinue();
}

/* ---------- boss: Coach Waddles ---------- */
function startBoss() {
  var CH = CHAMP[S.stage];
  S.inBoss = true; S.mode = 'bossIntro'; S.modeT = 0; S.bossHp = CH.hp; S.bossMax = CH.hp; S.boss = null; S.spawnT = 2.5; S.wave = NWAVES;
  banner(CH.rank + ' Champion\n' + CH.n.replace('Grand Champion ', '') + '!', 2300);
}
function spawnBoss() {
  var CH = CHAMP[S.stage];
  S.boss = { id: ++S.id, kind: CH.kind, xn: 0, p: 0.05, v: 0.07, st: 'walk', t: 0, mood: 'happy', ph: 0, hat: false, a: 1, big: CH.big, hp: CH.hp, shield: CH.shield || 0, sp: 0, puff: 0, vx: 0, dph: 0, nd: CH.slide || 0, tele: false, x0: 0, x1: 0 };
}
function updateBoss(b, dt) {
  var CH = CHAMP[S.stage];
  b.t += dt; b.ph += dt * 5; b.sp += dt; b.vx = 0;
  if (b.st === 'walk') { b.p += b.v * dt * slowK; if (b.p >= 0.4) { b.p = 0.4; b.st = 'hold'; b.t = 0; } }
  else if (b.st === 'hold') {
    if (CH.dodge) { var om = CH.om; b.dph += dt * om * slowK; b.xn = Math.sin(b.dph) * CH.dodge; b.vx = Math.cos(b.dph) * CH.dodge * om * slowK; }
    if (CH.slide) {
      b.nd -= dt * slowK; b.tele = b.nd < 0.55 && b.nd > 0;
      if (b.nd <= 0) { var da = CH.dodge || 0.62; b.st = 'dash'; b.t = 0; b.tele = false; b.vx = 0; b.x0 = b.xn; b.x1 = b.xn > 0.05 ? -da : b.xn < -0.05 ? da : (Math.random() < 0.5 ? -da : da); }
    }
  } else if (b.st === 'dash') {
    var u = Math.min(1, b.t / 0.8); u = u * u * (3 - 2 * u); b.xn = b.x0 + (b.x1 - b.x0) * u; b.puff -= dt;
    if (b.puff <= 0) { b.puff = 0.06; burst(px(b.xn, b.p), py(b.p), 2, SNOW_COL); }
    if (b.t >= 0.8) { b.st = 'hold'; b.t = 0; b.nd = CH.slide; if (CH.dodge) b.dph = Math.asin(Math.max(-1, Math.min(1, b.xn / CH.dodge))); }
  }
  else if (b.st === 'hit') {
    if (b.t > 1.0) {
      if (b.hp <= 0) { b.st = 'slide'; b.t = 0; b.mood = 'giggle'; b.shield = 0; }
      else { b.st = 'hold'; b.mood = 'happy'; b.hat = false; b.shield = CH.kind === 'cw' ? b.hp + 1 : (CH.shield || 0); b.t = 0; b.nd = Math.max(b.nd, 2.2); }
    }
  } else if (b.st === 'slide') {
    b.p -= (0.35 + b.t * 1.1) * dt; b.puff -= dt;
    if (b.puff <= 0) { b.puff = 0.07; burst(px(b.xn, b.p), py(b.p), 3, SNOW_COL); }
    if (b.p <= 0.06) b.st = 'gone';
  }
}
function bossDefeated() {
  S.mode = 'bossWin'; S.modeT = 0; S.golden += 3; S.cheer = Math.min(100, S.cheer + 15);
  banner(CHAMP[S.stage].n.replace('Grand Champion ', '') + '\ngiggles!', 1900);
}
function drawShield(b) {
  if (b.shield <= 0 || b.st === 'slide') return;
  var s = psz(b.p) * b.big, cx = px(b.xn, b.p), cy = py(b.p) - s * 0.2, r = s * 0.13, n = b.shield, i;
  for (i = 0; i < n; i++) {
    var a = (calm ? 0 : b.sp * 0.9) + i * 6.283 / n, x = cx + Math.cos(a) * s * 0.66, y = cy + s * 0.04 + Math.sin(a) * s * 0.09;
    var gr = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#e6f3fa'); gr.addColorStop(1, '#a8d0e6');
    ctx.fillStyle = gr; ctx.strokeStyle = 'rgba(70,110,140,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill(); ctx.stroke();
  }
}

/* ---------- update ---------- */
function fxUpdate(dt) {
  var i, b;
  for (i = bits.length - 1; i >= 0; i--) {
    b = bits[i]; b.t += dt; b.vy += 620 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
    if (b.t > b.ttl) bits.splice(i, 1);
  }
  for (i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > pops[i].ttl) pops.splice(i, 1); }
}
function update(dt) {
  S.t += dt; S.cd = Math.max(0, S.cd - dt); S.wob = Math.max(0, S.wob - dt * 1.6);
  var i, ta = 0;
  if (drag) { var cu = drag.pts[drag.pts.length - 1], ddx = cu.x - drag.sx, ddy = cu.y - drag.sy; if (Math.hypot(ddx, ddy) > 0.02 * Math.min(W, H)) ta = Math.max(-0.6, Math.min(0.6, Math.atan2(ddx, -ddy))); }
  S.sa += (ta - S.sa) * Math.min(1, dt * 14);
  fxUpdate(dt);
  if (S.over) return;
  updateTable(dt); updateAuto(dt);
  for (i = shots.length - 1; i >= 0; i--) { updateShot(shots[i], dt); if (shots[i].dead) shots.splice(i, 1); }
  S.modeT += dt;
  if (S.mode === 'intro' && S.modeT > 1.2) { S.mode = 'run'; S.modeT = 0; }
  if (S.mode === 'run') {
    S.spawnT -= dt;
    if (S.spawned < S.toSpawn && S.spawnT <= 0) { spawn(); S.spawnT = Math.max(0.7, 1.9 - 0.12 * effW()); }
  }
  for (i = penguins.length - 1; i >= 0; i--) { updatePenguin(penguins[i], dt); if (penguins[i].st === 'gone') penguins.splice(i, 1); }
  if (S.over) return;
  if (S.mode === 'run' && S.spawned >= S.toSpawn && penguins.length === 0) waveClear();
  if (S.mode === 'clear' && S.modeT > 1.7) {
    if (S.wave >= NWAVES) startBoss(); else beginWave(S.wave + 1);
  }
  if (S.mode === 'bossIntro' && S.modeT > 1.9) { spawnBoss(); S.mode = 'boss'; S.modeT = 0; }
  if (S.mode === 'boss') {
    S.spawnT -= dt;
    if (S.boss && S.boss.st === 'hold' && S.spawnT <= 0 && penguins.length < (CHAMP[S.stage].call ? 4 : 3)) { spawn(); S.spawnT = CHAMP[S.stage].help; if (CHAMP[S.stage].call === 2) popText(px(S.boss.xn, S.boss.p), py(S.boss.p) - psz(S.boss.p) * 1.5, 'Squad up!', '#9b3fd0'); }
    if (S.boss) { updateBoss(S.boss, dt); if (S.boss.st === 'gone') { S.boss = null; bossDefeated(); } }
  }
  if (S.mode === 'bossWin' && S.modeT > 2.2) endStage(true);
  if (qa && qa.bot && S.cd <= 0) {
    var tgt = (S.boss && S.boss.st === 'hold') ? S.boss : null;
    for (i = 0; !tgt && i < penguins.length; i++) if (penguins[i].st === 'walk' && (!tgt || penguins[i].p > tgt.p)) tgt = penguins[i];
    if (tgt) { var c = penCenter(tgt), o = pouchPos(); throwAt(o.x, o.y, c.x - o.x, c.y - o.y, 1.5, { x: c.x, y: c.y }); }
  }
}

/* ---------- drawing ---------- */
function star(g, x, y, r) {
  g.beginPath();
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.38 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fillStyle = '#ffd23f'; g.strokeStyle = '#fff7e3'; g.lineWidth = Math.max(1, r * 0.22); g.lineJoin = 'round'; g.stroke(); g.fill();
}
var SHAD = (function () {
  var c = document.createElement('canvas'); c.width = 128; c.height = 64;
  var g = c.getContext('2d'), gr = g.createRadialGradient(64, 32, 0, 64, 32, 62);
  gr.addColorStop(0, 'rgba(42,18,13,.55)'); gr.addColorStop(0.45, 'rgba(42,18,13,.34)'); gr.addColorStop(1, 'rgba(42,18,13,0)');
  g.save(); g.translate(0, 32); g.scale(1, 0.5); g.translate(0, -32); g.fillStyle = gr; g.fillRect(0, 0, 128, 64); g.restore();
  return c;
}());
function drawShadow(x, y, w, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.drawImage(SHAD, x - w * 1.3, y - w * 0.34, w * 2.6, w * 0.68);
  ctx.restore();
}
function drawPenguin(pg) {
  var s = psz(pg.p) * (pg.big || 1), x = px(pg.xn, pg.p), y = py(pg.p);
  ctx.save(); ctx.globalAlpha = pg.a;
  var rot = 0, hop = 0, sx = 1, sy = 1, tt = calm ? 0 : S.t;
  if (pg.st === 'walk' || pg.st === 'hold' || (pg.st === 'bump' && pg.t > 0.9)) { if (!calm) { rot = Math.sin(pg.ph) * 0.1; hop = Math.abs(Math.sin(pg.ph)) * s * 0.03; } }
  else if (pg.st === 'hit') { rot = calm ? 0 : Math.sin(pg.t * 30) * 0.05; }
  else if (pg.st === 'slide') { sx = 1.15; sy = 0.62; rot = 0.1; }
  else if (pg.st === 'dash') { sx = 1.2; sy = 0.64; rot = 0.1 * (pg.x1 > pg.x0 ? 1 : -1); }
  if (pg.tele && !calm) rot = Math.sin(S.t * 44) * 0.14;
  var lift = hop / (s * 0.03 || 1);
  drawShadow(x + s * 0.05, y - s * 0.015, s * 0.34 * sx * (1 - 0.16 * lift), 1 - 0.25 * lift);
  if (pg.st !== 'slide' && pg.st !== 'dash') {
    ctx.fillStyle = 'rgba(42,18,13,' + (0.28 - 0.14 * lift) + ')';
    ctx.beginPath(); ctx.ellipse(x - s * 0.17, y - s * 0.01, s * 0.1, s * 0.025, 0, 0, 6.3); ctx.ellipse(x + s * 0.17, y - s * 0.01, s * 0.1, s * 0.025, 0, 0, 6.3); ctx.fill();
  }
  ctx.translate(x, y - hop); ctx.rotate(rot); ctx.scale(sx, sy);
  var im = IMG[pg.kind][pg.mood];
  if (im) ctx.drawImage(im, -s / 2, -s * 0.965, s, s);
  if (pg.hat && IMG.pa.happy) {
    var hs = s * 0.42;
    ctx.save(); ctx.translate(0, -s * 0.745 - hs * 0.45 + s * 0.03); ctx.rotate(0.28);
    ctx.drawImage(IMG.pa.happy, -hs / 2, -hs / 2, hs, hs); ctx.restore();
  }
  if (pg.st === 'hit') {
    for (var i = 0; i < 3; i++) {
      var a = tt * 6 + i * 2.09;
      star(ctx, Math.cos(a) * s * 0.28, -s * 0.8 + Math.sin(a) * s * 0.07, s * 0.07);
    }
  }
  ctx.restore();
}
function drawShot(sh) {
  var u, x, y, size, a = 1, rot;
  if (sh.ph === 0) {
    u = Math.min(1, sh.t / sh.T);
    x = sh.x0 + (sh.xE - sh.x0) * u;
    y = sh.y0 + (sh.yE - sh.y0) * u - 4 * sh.arc * u * (1 - u);
    size = (sh.s0 + (psz(sh.pEnd) * 0.5 * sh.ty.size - sh.s0) * u) * (1 + 0.35 * Math.sin(Math.PI * u));
    rot = sh.spin * sh.t;
    var gyy = sh.y0 + (py(sh.pEnd) - sh.y0) * u;
    drawShadow(x, gyy, size * 0.3, 0.6);
  } else {
    u = Math.min(1, sh.t / sh.T);
    x = sh.xE + (sh.rx - sh.xE) * u; y = sh.yE + (sh.ry - sh.yE) * u - 4 * H * 0.04 * u * (1 - u);
    size = psz(sh.pEnd) * 0.5; a = 1 - u; rot = sh.spin * (sh.T * 0.3 + sh.t * 1.5);
  }
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
  var simg = IMG[sh.ty.img].wow; if (simg) ctx.drawImage(simg, -size / 2, -size / 2, size, size);
  ctx.restore();
}
function drawStand() {
  var h = H * 0.12, y0 = H - h, off = calm ? 0 : Math.sin(S.t * 46) * 12 * S.wob * S.wob;
  ctx.save(); ctx.translate(off, 0);
  var n = 16, sw = (W + 80) / n, i;
  for (i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? '#fff7e3' : '#d63a2e'; ctx.fillRect(-40 + i * sw, y0 + h * 0.18, sw + 1, h); }
  ctx.fillStyle = 'rgba(42,18,13,.12)'; ctx.fillRect(-40, y0 + h * 0.18, W + 80, h * 0.07);
  var top = ctx.createLinearGradient(0, y0 - h * 0.05, 0, y0 + h * 0.2);
  top.addColorStop(0, '#fffaf0'); top.addColorStop(1, '#e3d2a8');
  ctx.fillStyle = top; ctx.fillRect(-40, y0 - h * 0.05, W + 80, h * 0.25);
  ctx.fillStyle = '#b79a63'; ctx.fillRect(-40, y0 + h * 0.2, W + 80, h * 0.03);
  if (!K) drawSling(slingGeom(), S.sa || 0, 1 - Math.max(0, S.cd) / (S.cdMax || COOLDOWN), effType());
  if (sv.au && !K) drawSling(autoGeom(), S.au.a, 1 - Math.max(0, S.au.cd) / autoInt(), autoType(), '#16787a', '#3fc1b8');
  ctx.restore();
}

/* the slingshot on the table: one pineapple, primed in the pouch */
function slingGeom() { var h = H * 0.12, f = Math.min(H * 0.22, W * 0.36); return { x: W / 2, base: H - h + h * 0.06, f: f, ps: f * 0.62 }; }
function autoGeom() { var s = slingGeom(); return { x: W * 0.71, base: s.base, f: s.f * 0.58, ps: s.f * 0.58 * 0.62 }; }
function pouchPos(g, ang) { var s = g || slingGeom(), y0 = s.base - s.f * 0.5 - s.ps * 0.92 * 0.38, a = g ? ang : (S.sa || 0); return { x: s.x + (s.base - y0) * Math.sin(a), y: s.base - (s.base - y0) * Math.cos(a) }; }
function wood(x1, y1, x2, y2, w) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#4a2f1a'; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = '#8f5f30'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,226,170,.5)'; ctx.lineWidth = w * 0.28; ctx.beginPath(); ctx.moveTo(x1 - w * 0.2, y1); ctx.lineTo(x2 - w * 0.2, y2); ctx.stroke();
}
function band(x1, y1, x2, y2, w, c1, c2) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = c1 || '#a82a1f'; ctx.lineWidth = w + 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = c2 || '#e0483a'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function drawSling(s, ang, r, et, c1, c2) {
  var f = s.f, bx = s.x, by = s.base;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(ang); ctx.translate(-bx, -by);
  var tipY = by - f, dx = f * 0.3, stemTop = by - f * 0.4;
  wood(bx, by, bx, stemTop, f * 0.13);
  wood(bx, stemTop, bx - dx, tipY, f * 0.1);
  wood(bx, stemTop, bx + dx, tipY, f * 0.1);
  var snap = r < 0.2 ? 1 - r / 0.2 : 0;
  var py0 = by - f * 0.52 - snap * f * 0.22 + (calm ? 0 : Math.sin(S.t * 55) * snap * 3);
  var has = r >= 0.3, pop = has ? Math.min(1, (r - 0.3) / 0.45) : 0;
  band(bx + dx, tipY, bx + f * 0.14, py0, f * 0.05, c1, c2);
  var pim = IMG[et.img].happy;
  if (has && pim) {
    var zz = s.ps * 0.92 * et.size, k = pop < 1 ? 1 + 0.22 * Math.sin(pop * Math.PI) : 1, z = zz * pop * k;
    if (calm) z = zz;
    ctx.drawImage(pim, bx - z / 2, py0 - z * 0.88, z, z);
  }
  ctx.fillStyle = '#6b4a2f'; ctx.strokeStyle = '#3d2a18'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(bx, py0 + f * 0.01, f * 0.17, f * 0.06, 0, 0, 6.3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,226,170,.35)'; ctx.beginPath(); ctx.ellipse(bx - f * 0.05, py0 - f * 0.005, f * 0.08, f * 0.02, 0, 0, 6.3); ctx.fill();
  band(bx - dx, tipY, bx - f * 0.14, py0, f * 0.05, c1, c2);
  ctx.fillStyle = '#6b4a2f'; ctx.strokeStyle = '#3d2a18';
  [-dx, dx].forEach(function (o) { ctx.beginPath(); ctx.arc(bx + o, tipY, f * 0.07, 0, 6.3); ctx.fill(); ctx.stroke(); });
  ctx.restore();
}
function drawCloud(x, y, s) {
  ctx.fillStyle = stageNo() > 1 ? STAGES[S.stage].cloud : 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.2, s * 0.9, s * 0.2, 0, 0, 6.3); ctx.arc(x - s * 0.35, y, s * 0.3, 0, 6.3); ctx.arc(x + s * 0.05, y - s * 0.12, s * 0.38, 0, 6.3); ctx.arc(x + s * 0.5, y + s * 0.02, s * 0.25, 0, 6.3); ctx.fill();
}

function glowFor(key) {
  if (!glowFor.c) glowFor.c = {};
  if (!glowFor.c[key]) {
    var c = document.createElement('canvas'); c.width = c.height = 96; var g = c.getContext('2d'), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, 'rgba(' + key + ',.75)'); gr.addColorStop(0.55, 'rgba(' + key + ',.3)'); gr.addColorStop(1, 'rgba(' + key + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 96, 96); glowFor.c[key] = c;
  }
  return glowFor.c[key];
}
function icon(k, x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.5, r * 0.18);
  ctx.beginPath();
  if (k === 'pz') { ctx.moveTo(r * 0.2, -r); ctx.lineTo(-r * 0.55, r * 0.1); ctx.lineTo(-r * 0.05, r * 0.1); ctx.lineTo(-r * 0.2, r); ctx.lineTo(r * 0.55, -r * 0.2); ctx.lineTo(r * 0.05, -r * 0.2); ctx.closePath(); ctx.fill(); }
  else if (k === 'pm') { for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.4 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  else if (k === 'ph') { ctx.moveTo(0, r * 0.8); ctx.bezierCurveTo(-r * 1.35, -r * 0.1, -r * 0.7, -r * 1.0, 0, -r * 0.3); ctx.bezierCurveTo(r * 0.7, -r * 1.0, r * 1.35, -r * 0.1, 0, r * 0.8); ctx.fill(); }
  else { for (var j = 0; j < 3; j++) { var b = j * Math.PI / 3; ctx.moveTo(Math.cos(b) * r, Math.sin(b) * r); ctx.lineTo(-Math.cos(b) * r, -Math.sin(b) * r); } ctx.stroke(); }
  ctx.restore();
}
function badge(k, x, y, r) {
  ctx.fillStyle = PU[k].col; ctx.strokeStyle = '#fff7e3'; ctx.lineWidth = Math.max(2, r * 0.16);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill(); ctx.stroke(); icon(k, x, y, r * 0.58);
}
function drawTrophy(x, bottom, s) {
  var top = bottom - s * 0.9, cx = x;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = '#a8700f'; ctx.lineWidth = s * 0.07;
  ctx.beginPath(); ctx.arc(cx - s * 0.3, top + s * 0.2, s * 0.13, Math.PI * 0.45, Math.PI * 1.55); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + s * 0.3, top + s * 0.2, s * 0.13, Math.PI * 1.45, Math.PI * 0.55); ctx.stroke();
  var gr = ctx.createLinearGradient(cx - s * 0.3, 0, cx + s * 0.3, 0); gr.addColorStop(0, '#ffe58a'); gr.addColorStop(0.5, '#f8bd1c'); gr.addColorStop(1, '#c98a0c');
  ctx.fillStyle = '#d99a14'; ctx.fillRect(cx - s * 0.06, bottom - s * 0.3, s * 0.12, s * 0.2);
  ctx.fillStyle = '#7a4a12'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - s * 0.23, bottom - s * 0.14, s * 0.46, s * 0.14, s * 0.04) : ctx.rect(cx - s * 0.23, bottom - s * 0.14, s * 0.46, s * 0.14); ctx.fill();
  ctx.fillStyle = '#e8aa22'; ctx.fillRect(cx - s * 0.17, bottom - s * 0.19, s * 0.34, s * 0.06);
  ctx.fillStyle = gr; ctx.strokeStyle = '#a8700f'; ctx.lineWidth = s * 0.03;
  ctx.beginPath(); ctx.moveTo(cx - s * 0.32, top); ctx.lineTo(cx + s * 0.32, top); ctx.quadraticCurveTo(cx + s * 0.32, top + s * 0.5, cx, bottom - s * 0.28); ctx.quadraticCurveTo(cx - s * 0.32, top + s * 0.5, cx - s * 0.32, top); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(cx - s * 0.16, top + s * 0.22, s * 0.04, s * 0.13, 0.15, 0, 6.3); ctx.fill();
  star(ctx, cx, top + s * 0.27, s * 0.1);
}
function drawTable() {
  var t = calm ? 0 : S.t, o, bob;
  if (S.pu) {
    var d = PU[S.pu.k], left = S.pu.ttl - S.pu.t;
    if (left > 2 || calm || Math.sin(S.pu.t * 18) > -0.3) {
      o = slot(0); bob = Math.sin(t * 3.2) * o.s * 0.04; var pop = Math.min(1, S.pu.t / 0.3), sz = o.s * (0.2 + 0.8 * (1 - Math.pow(1 - pop, 3)) * (1 + (pop < 1 ? 0.12 : 0)));
      var gs = o.s * 1.7 * (1 + 0.08 * Math.sin(t * 4)); ctx.drawImage(glowFor(d.glow), o.x - gs / 2, o.cy - gs / 2 - bob, gs, gs);
      drawShadow(o.x, o.bottom - o.s * 0.02, o.s * 0.3, 0.6);
      ctx.save(); ctx.translate(o.x, o.bottom - o.s * 0.04 - bob); ctx.rotate(Math.sin(t * 2.6) * 0.07);
      var im = IMG[S.pu.k].happy; if (im) ctx.drawImage(im, -sz / 2, -sz * 0.95, sz, sz);
      ctx.restore();
      badge(S.pu.k, o.x + o.s * 0.36, o.bottom - o.s * 0.92 - bob, o.s * 0.2);
      tag(d.name.replace('!', ''), o.x, o.bottom - o.s * 1.2 - bob, o.s);
    }
  }
  if (S.tro) {
    o = slot(1); bob = Math.sin(t * 3 + 1) * o.s * 0.04; var pp = Math.min(1, S.tro.t / 0.3), ts = o.s * (0.2 + 0.8 * (1 - Math.pow(1 - pp, 3)));
    var g2 = o.s * 1.7 * (1 + 0.08 * Math.sin(t * 4 + 1)); ctx.drawImage(glowFor('255,214,74'), o.x - g2 / 2, o.cy - g2 / 2 - bob, g2, g2);
    drawShadow(o.x, o.bottom - o.s * 0.02, o.s * 0.3, 0.6);
    ctx.save(); ctx.translate(o.x, o.bottom - bob); ctx.rotate(Math.sin(t * 2.3 + 1) * 0.06); drawTrophy(0, 0, ts); ctx.restore();
    tag('Trophy', o.x, o.bottom - o.s * 1.08 - bob, o.s);
  }
}
function tag(txt, x, y, s) {
  var fs = Math.max(11, Math.round(s * 0.2));
  ctx.font = '800 ' + fs + 'px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  var w = ctx.measureText(txt).width + fs * 0.9; pill(x, y, w, fs * 1.4, 'rgba(255,247,227,.94)'); ctx.fillStyle = '#4a2b0f'; ctx.fillText(txt, x, y + 1);
}
function pill(x, y, w, h, fill) {
  ctx.fillStyle = fill; ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); else ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fill();
}
function drawFx(fs) {
  var f = S.fx, ks = [], i;
  if (f.frost > 0) { ctx.fillStyle = 'rgba(150,210,255,' + (0.1 + (calm ? 0 : 0.03 * Math.sin(S.t * 3))) + ')'; ctx.fillRect(0, 0, W, H * 0.88); }
  if (f.zip > 0) ks.push(['pz', f.zip / PU.pz.secs]); if (f.mega > 0) ks.push(['pm', f.mega / PU.pm.secs]); if (f.frost > 0) ks.push(['pf', f.frost / PU.pf.secs]);
  var r = Math.min(W * 0.05, H * 0.03), y = H * 0.225;
  for (i = 0; i < ks.length; i++) {
    var x = W / 2 + (i - (ks.length - 1) / 2) * r * 2.8;
    badge(ks[i][0], x, y, r);
    tag(PU[ks[i][0]].name.replace('!', ''), x, y + r * 2.1, r * 5);
    ctx.strokeStyle = '#fff7e3'; ctx.lineWidth = Math.max(2.5, r * 0.2); ctx.beginPath(); ctx.arc(x, y, r * 1.3, -Math.PI / 2, -Math.PI / 2 + 6.283 * ks[i][1]); ctx.stroke();
  }
  if (S.toast) {
    var tt = S.toast, u = tt.t / tt.ttl, a = u < 0.1 ? u / 0.1 : u > 0.8 ? (1 - u) / 0.2 : 1, ty = H * 0.335 - (calm ? 0 : u * 8);
    ctx.save(); ctx.globalAlpha = a; ctx.font = '800 ' + Math.round(fs * 0.62) + 'px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var tw = ctx.measureText(tt.txt).width + fs * 1.1;
    if (tw > W * 0.76) { ctx.font = '800 ' + Math.max(8, Math.floor(fs * 0.62 * (W * 0.76 - fs * 1.1) / (tw - fs * 1.1))) + 'px "Bricolage Grotesque",sans-serif'; tw = ctx.measureText(tt.txt).width + fs * 1.1; }
    pill(W / 2, ty, tw, fs * 1.15, 'rgba(255,247,227,.96)'); ctx.fillStyle = '#7a4a12'; ctx.fillText(tt.txt, W / 2, ty + 1);
    ctx.restore();
  }
}
function drawParticles() {
  var i, b, p, u, sc2, yy;
  for (i = 0; i < bits.length; i++) {
    b = bits[i]; ctx.save(); ctx.globalAlpha = Math.min(1, (b.ttl - b.t) * 3); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
    ctx.fillStyle = b.c;
    if (b.k === 0) { ctx.beginPath(); ctx.ellipse(0, 0, b.w / 2, b.h / 2, 0, 0, 6.3); ctx.fill(); }
    else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  }
  var fs = Math.round(Math.max(22, Math.min(W, H) * 0.06));
  ctx.font = '800 ' + fs + 'px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (i = 0; i < pops.length; i++) {
    p = pops[i]; u = p.t / p.ttl; sc2 = u < 0.18 ? 0.3 + 1.2 * (u / 0.18) : u < 0.42 ? 1.5 - 0.5 * ((u - 0.18) / 0.24) : 1 - (u - 0.42) * 0.25;
    yy = p.y - (calm ? 20 : 90) * Math.min(1, u * 1.3);
    ctx.save(); ctx.globalAlpha = u > 0.6 ? 1 - (u - 0.6) / 0.4 : 1; ctx.translate(p.x, yy); ctx.rotate(p.rot * (1 - u)); ctx.scale(sc2, sc2);
    ctx.lineWidth = fs * 0.2; ctx.strokeStyle = '#fff7e3'; ctx.strokeText(p.txt, 0, 0); ctx.fillStyle = p.col; ctx.fillText(p.txt, 0, 0);
    ctx.restore();
  }
  return fs;
}
var TXT_FONT = '800 24px "Bricolage Grotesque",sans-serif';
function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.drawImage(bg, 0, 0, W, H);
  var drift = calm ? 0 : (S.t * 6) % (W * 1.4);
  var cl = Math.min(W, H) * 0.12;
  drawCloud(((W * 0.2 + drift) % (W * 1.4)) - W * 0.2, hy * 0.45, cl);
  drawCloud(((W * 0.7 + drift * 0.6) % (W * 1.4)) - W * 0.2, hy * 0.25, cl * 0.8);
  drawCloud(((W * 1.1 + drift * 0.35) % (W * 1.4)) - W * 0.2, hy * 0.62, cl * 0.62);
  drawScenery(calm ? 0 : S.t);
  var list = penguins.slice(), i;
  if (S.boss) list.push(S.boss);
  list.sort(function (a, b) { return a.p - b.p; });
  for (i = 0; i < list.length; i++) { drawPenguin(list[i]); if (list[i] === S.boss) drawShield(list[i]); }
  drawAutoMark();
  drawStand(); drawTable();
  for (i = 0; i < shots.length; i++) drawShot(shots[i]);
  drawFx(drawParticles());
}

/* ---------- bonus game: a long lane, a hop, and a small 35 degree board of raised rings ---------- */
var K = null, skBg = null, HINT_TXT = elHint.lastChild ? elHint.lastChild.textContent : '';
/* world units: the board is 2 wide (u in -1..1); v runs up the incline from its front edge (v=0); the lane is below zero and the hop sits at SK_HUMP */
var SK_BALLS = 9, SK_RIM = 0.7, SK_WALL = 1.65, SK_G = 10, SK_KZ = 0.7, SK_INC = 35, SK_RB = 0.09, SK_DIN = 0.9, SK_ZC = 0.12;
var SK_V0 = -2.2, SK_HUMP = -0.2, SK_VMAX = 2.0, SK_K = 0.12, SK_RAT = 0.75, SK_LIFT = 0.55, SK_LFR = 0.5, SK_AIM = 0.7, SK_FL0 = 2.0, SK_FL1 = 2.9, SK_GV = -0.1, SK_DRN = 0.9;
var SK_HOLES = [{ v: 50, u: 0, c: 1.6, r: 0.12 }, { v: 40, u: 0, c: 1.25, r: 0.14 }, { v: 30, u: 0, c: 0.86, r: 0.16 }, { v: 10, u: -0.6, c: 0.55, r: 0.16 }, { v: 10, u: 0.6, c: 0.55, r: 0.16 }, { v: 20, u: 0, c: 0.38, r: 0.17 }, { v: 100, u: -0.66, c: 1.62, r: 0.11 }, { v: 100, u: 0.66, c: 1.62, r: 0.11 }];
var SK_CROWD = (function () { var a = [], r, c; for (r = 0; r < 12; r++) for (c = 0; c < 3; c++) a.push({ y: 0.27 + r * 0.0525 + (c % 2) * 0.008, k: 0.085 + 0.04 * r / 11, r: r, c: c }); return a; }());
function skCl(x, a, b) { return Math.max(a, Math.min(b, x)); }
function skFb() { return W * 0.29; }
function skS(v) { return v >= 0 ? 1 / (1 + SK_K * v) : 1 + 0.12 * (v / SK_V0); }
function skX(u, v) { return W / 2 + u * skFb() * skS(v); }
function skY(v) { var yB = H * 0.43; return v >= 0 ? yB - SK_RAT * skFb() / SK_K * Math.log(1 + SK_K * v) : yB + (H * 0.865 - yB) * (v / SK_V0); }
/* the world position along the machine for a screen y (used to keep the crowd off the machine) */
function skV(y) { var yB = H * 0.43; return y <= yB ? (Math.exp((yB - y) * SK_K / (SK_RAT * skFb())) - 1) / SK_K : SK_V0 * (y - yB) / (H * 0.865 - yB); }
function skCredits(score) { return Math.floor(score / 20); }
function newSkee() {
  newState();
  hs = null; hov.length = 0;
  K = { balls: SK_BALLS, score: 0, ball: null, over: false, cl: 99, cr: 99, clA: 1, bt: 99, say: [], bl: [], ball: null, cool: 0 };
  elBanner.hidden = true; elHint.hidden = false;
  if (elHint.lastChild) elHint.lastChild.textContent = 'Flick up to roll! Harder goes farther. Roll as many as you like!';
  banner('Pineapple Roll!', 1500);
}
function skLabels(on) {
  var a = elLeft.previousElementSibling, c = elCombo.previousElementSibling;
  if (a) a.textContent = on ? 'Balls' : 'Left'; if (c) c.textContent = on ? 'Score' : 'Combo';
}
function startSkee() {
  if (K) return;
  titleEl.hidden = true; gameEl.hidden = false; gameEl.setAttribute('data-bonus', '1');
  loadAssets().then(function () { newSkee(); skLabels(true); resize(); run(); });
}
function startSkeeAgain() { newSkee(); run(); }
function endSkee() {
  K.over = true;
  var cr = skCredits(K.score);
  sv.bank = Math.min(999999, sv.bank + cr); kit.save(sv);
  burst(W / 2, H * 0.4, 40, PINE_COL.concat(['#ff6f86', '#8fc6e4']));
  showCard('Pineapple Roll!', 'You scored ' + K.score + ' points and won ' + cr + ' Golden Pineapples! Every 20 points is one.', 'Roll again', startSkeeAgain);
}
/* read a swipe: the speed is the fastest 40-140 ms stretch of the last 300 ms, the direction runs from the start of that stretch to the end of the swipe */
function skFlick(d) {
  var pts = d.pts, n = pts.length, end = pts[n - 1], i, j, s = 0, dt, v, best = 0, bi = 0;
  if (n < 2 || end.y - d.sy > -FLICK_MIN * H || Math.hypot(end.x - d.sx, end.y - d.sy) < TAP_MIN * Math.min(W, H)) return null;
  while (s < n - 1 && pts[s].t < end.t - 300) s++;
  for (i = s; i < n - 1; i++) for (j = i + 1; j < n; j++) {
    dt = pts[j].t - pts[i].t; if (dt < 40) continue; if (dt > 140) break;
    v = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y) / dt * 1000 / H; if (v > best) { best = v; bi = i; }
  }
  if (!best) { dt = Math.max(30, end.t - pts[s].t); best = Math.hypot(end.x - pts[s].x, end.y - pts[s].y) / dt * 1000 / H; bi = s; }
  var dx = end.x - pts[bi].x, dy = end.y - pts[bi].y;
  if (dy > -2) return null;
  return { dx: dx, dy: dy, spd: best };
}
/* physics helpers: gravity splits into a pull down the incline and a pull into the board */
function skGs() { return SK_G * Math.sin(SK_INC * Math.PI / 180); }
function skGc() { return SK_G * Math.cos(SK_INC * Math.PI / 180); }
/* a flick: the swipe angle steers the roll (a straight, proportional gain) and the swipe speed sets the launch speed (linear); gravity does the rest */
function skLaunch(f) {
  var raw = skCl(Math.atan2(f.dx, -f.dy), -0.6, 0.6), ang = raw * SK_AIM, u01 = skCl((f.spd - 1.2) / 5.3, 0, 1), fl = SK_FL0 + SK_FL1 * u01;
  var gs = skGs(), gc = skGc(), ca = Math.cos(ang), sa = Math.sin(ang), kz = SK_KZ, T = 2 * kz * fl / gc, f0 = Math.sqrt(fl * fl + 2 * SK_LFR * (SK_HUMP - SK_V0) / ca), uLip = Math.tan(ang) * (SK_HUMP - SK_V0);
  return { vu0: f0 * sa, vv0: f0 * ca, fl: fl, T: T, uLip: uLip, vuL: fl * sa, vvL: fl * ca, vz: kz * fl, v: SK_HUMP + fl * ca * T - 0.5 * gs * T * T, u: skCl(uLip + fl * sa * T, -0.9, 0.9) };
}
function skeeRoll(dx, dy, spd) {
  if (!K || K.balls <= 0 || K.over || S.paused || K.cool > 0) return;
  var L = skLaunch({ dx: dx, dy: dy, spd: spd });
  K.ball = { u: 0, v: SK_V0, z: 0, vu: L.vu0, vv: L.vv0, vz: 0, st: 'lane', t: 0, rot: 0, ph: 0, dir: 0, still: 0 };
  K.bl.push(K.ball); K.balls--; K.cool = 0.18; elHint.hidden = true;
}
/* the crowd: pineapples on the left cheer for a score, penguins on the right cheer for a miss */
function skCheer(left, amp) {
  var w = left ? ['YAY!', 'WOO!', 'NICE!', 'GO GO!'] : ['hee hee!', 'oopsie!', 'ha ha!', 'bonk!'], c = SK_CROWD[Math.floor(Math.random() * SK_CROWD.length)], P = skCrowdPos(c);
  if (left) { K.cl = 0; K.clA = amp; if (amp >= 2) { K.bt = 0; w = ['CHEST BUMP!']; } } else { K.cr = 0; K.crA = 1; }
  K.say.push({ x: left ? P.x : W - P.x, y: P.y - P.s - 4, txt: w[Math.floor(Math.random() * w.length)], left: left, t: 0 });
  if (!calm) burst(left ? W * 0.1 : W * 0.9, H * 0.5, left ? 12 : 8, left ? PINE_COL.concat(['#fff7e3']) : ['#8fc6e4', '#fff7e3']);
}
function skResolve(hole, b) {
  var ix = K.bl.indexOf(b); if (ix >= 0) K.bl.splice(ix, 1);
  K.ball = K.bl.length ? K.bl[K.bl.length - 1] : null;
  if (hole) {
    K.score += hole.v;
    var x = skX(hole.u, hole.c), y = skY(hole.c);
    burst(x, y, hole.v >= 40 ? 22 : 12, PINE_COL.concat(['#fff7e3'])); popText(x, y - 26, '+' + hole.v + '!', hole.v >= 40 ? '#d4380d' : '#b86e00');
  }
  if (K.balls <= 0 && !K.bl.length) endSkee();
}
function skStep(b, h) {
  var gs = skGs(), gc = skGc(), pz = b.z, floor = b.z <= 0 && b.vz <= 0 && b.v >= 0, sp, k, i, c, d, zc = SK_ZC, nx, ny, imp, vn, ro, rr = SK_RB;
  if (floor) { sp = Math.hypot(b.vu, b.vv); k = sp ? Math.max(0, sp - 0.3 * h) / sp : 0; b.vu *= k; b.vv *= k; b.vv -= gs * 0.71 * h; }
  else { b.vv -= gs * h; b.vz -= gc * h; }
  b.u += b.vu * h; b.v += b.vv * h; b.z += b.vz * h; b.rot += Math.hypot(b.vu, b.vv) * h * 3 * (b.vv < 0 ? -1 : 1);
  if (b.u > 1 - rr) { b.u = 1 - rr; b.vu = -Math.abs(b.vu) * 0.5; } else if (b.u < rr - 1) { b.u = rr - 1; b.vu = Math.abs(b.vu) * 0.5; }
  if (b.v > SK_VMAX - rr) { b.v = SK_VMAX - rr; b.vv = -Math.abs(b.vv) * 0.35; }
  for (i = 0; i < SK_HOLES.length; i++) {
    c = SK_HOLES[i]; d = Math.hypot(b.u - c.u, b.v - c.c) || 0.001; ro = c.r + 0.05;
    if (d > ro + 0.6 * rr) continue;
    nx = (b.u - c.u) / d; ny = (b.v - c.c) / d;
    if (pz >= zc && b.z < zc && b.vz < 0 && d < ro + 0.5 * rr) {
      if (d < c.r * SK_DIN) { b.st = 'sink'; b.t = 0; b.hole = c; b.u0 = b.u; b.v0 = b.v; skCheer(true, c.v >= 100 ? 2 : c.v >= 40 ? 1.5 : 1); return; }
      imp = -b.vz; b.z = zc; b.vz = Math.max(1.3, imp * SK_RIM); b.vu = (b.vu + nx * imp * 0.9) * 0.9; b.vv = (b.vv + ny * imp * 0.9) * 0.9;
    } else if (b.z < zc) {
      b.u = c.u + nx * (ro + 0.6 * rr); b.v = c.c + ny * (ro + 0.6 * rr);
      vn = b.vu * nx + b.vv * ny;
      if (vn < 0) { b.vu -= SK_WALL * vn * nx; b.vv -= SK_WALL * vn * ny; b.vz = Math.max(b.vz, Math.min(2.2, -vn * 0.55)); }
      /* the rim is round: a ball pressed against it slides around and off instead of resting on it */
      ro = (b.u >= c.u ? 1 : -1) * (0.25 + Math.max(0, -vn) * 0.5); b.vu += -ny * ro * h * 6; b.vv += nx * ro * h * 6;
    }
  }
  if (b.v >= 0 && b.z <= 0 && b.vz < 0) { b.z = 0; if (b.vz < -0.6) { b.vz = -b.vz * 0.42; b.vu *= 0.88; b.vv *= 0.88; } else b.vz = 0; }
  if (b.v < 0 && b.vv < 0) { b.st = 'out'; b.t = 0; b.z = Math.max(0, b.z); b.vz = Math.min(b.vz, 0.4); skCheer(false); }
}
function updateSkee(dt) {
  S.t += dt; fxUpdate(dt);
  if (hs && performance.now() - hs.wall > 110 && hs.peak >= 1.2) hsFire(hs.pts[hs.pts.length - 1].t);
  K.cl += dt; K.cr += dt; K.bt += dt; var q = K.say.length;
  while (q--) { K.say[q].t += dt; if (K.say[q].t > 1.2) K.say.splice(q, 1); }
  K.cool -= dt; if (K.over) return;
  var bi = K.bl.length; while (bi--) skUpdBall(K.bl[bi], dt);
  skCollide(); K.ball = K.bl.length ? K.bl[K.bl.length - 1] : null;
}
/* balls knock into each other on the lane and on the board */
function skCollide() {
  var i, j, a, b, du, dv, d, nx, ny, vn, m = SK_RB * 1.9, ov, st = { lane: 1, play: 1, out: 1 };
  for (i = 0; i < K.bl.length; i++) for (j = i + 1; j < K.bl.length; j++) {
    a = K.bl[i]; b = K.bl[j]; if (!st[a.st] || !st[b.st] || Math.abs(a.z - b.z) > 0.12) continue;
    du = b.u - a.u; dv = b.v - a.v; d = Math.hypot(du, dv); if (d >= m || d < 1e-5) continue;
    nx = du / d; ny = dv / d; ov = (m - d) / 2; a.u -= nx * ov; a.v -= ny * ov; b.u += nx * ov; b.v += ny * ov;
    vn = (a.vu - b.vu) * nx + (a.vv - b.vv) * ny;
    if (vn > 0) { vn *= 0.9; a.vu -= vn * nx; a.vv -= vn * ny; b.vu += vn * nx; b.vv += vn * ny; a.vz = Math.max(a.vz, 0.5); b.vz = Math.max(b.vz, 0.5); }
    if (a.st === 'lane' && a.v >= SK_HUMP) a.v = SK_HUMP - 0.001; if (b.st === 'lane' && b.v >= SK_HUMP) b.v = SK_HUMP - 0.001;
    if (a.st === 'lane') a.u = skCl(a.u, -0.9, 0.9); if (b.st === 'lane') b.u = skCl(b.u, -0.9, 0.9);
  }
}
function skUpdBall(b, dt) {
  var sp, ns, k, n, i, h;
  b.t += dt;
  if (b.st === 'lane') {
    sp = Math.hypot(b.vu, b.vv); ns = Math.max(0.35, sp - SK_LFR * dt); k = sp ? ns / sp : 0; b.vu *= k; b.vv *= k;
    b.u = skCl(b.u + b.vu * dt, -0.9, 0.9); b.v += b.vv * dt; b.rot += ns * dt * 3;
    if (b.v >= SK_HUMP) { b.v = SK_HUMP; b.st = 'play'; b.t = 0; b.z = 0; b.vz = SK_KZ * Math.hypot(b.vu, b.vv); }
  } else if (b.st === 'play') {
    n = Math.max(1, Math.ceil(dt * 120)); h = dt / n;
    for (i = 0; i < n && b.st === 'play'; i++) skStep(b, h);
    if (b.st === 'play') {
      if (Math.hypot(b.vu, b.vv) < 0.25 && b.z < 0.12) { b.still += dt; if (b.still > 0.3) { b.vu = (b.u >= 0 ? 1 : -1) * 0.7; b.vv = -1; b.vz = 1; b.z = Math.max(b.z, 0.02); b.still = 0; K.kick = (K.kick || 0) + 1; } } else b.still = 0;
      if (b.t > 6) { b.vv = -1.5; b.vu = (b.u >= 0 ? 1 : -1) * 0.5; b.vz = 1; b.t = 3; }
    }
  } else if (b.st === 'out') {
    n = Math.max(1, Math.ceil(dt * 120)); h = dt / n;
    for (i = 0; i < n && b.st === 'out'; i++) {
      b.vz -= SK_G * h; b.z += b.vz * h; b.vv *= 1 - 9 * h; b.vv = Math.max(b.vv, -0.9); b.v += b.vv * h; b.u = skCl(b.u + b.vu * h, -0.89, 0.89);
      if (b.v <= SK_HUMP + 0.03 || b.z < -0.08 || b.t > 1.6) { b.st = 'gut'; b.t = 0; b.z = 0; b.vu = (Math.abs(b.u) < 0.03 ? (Math.random() < 0.5 ? 1 : -1) : (b.u > 0 ? 1 : -1)) * (0.7 + Math.min(0.8, Math.abs(b.vu))); b.vv = 0; }
    }
  } else if (b.st === 'gut') {
    /* the catch trough tips every miss toward a drain at the end: it gathers speed along the curve and drops out of sight */
    b.v += (SK_GV - b.v) * Math.min(1, dt * 14); b.vu += (b.vu < 0 ? -1 : 1) * 3.2 * dt; b.u += b.vu * dt; b.rot += b.vu * dt * 4;
    if (Math.abs(b.u) >= SK_DRN) { b.u = (b.u < 0 ? -1 : 1) * SK_DRN; b.st = 'drain'; b.t = 0; }
  } else if (b.st === 'drain') { b.rot += (b.vu < 0 ? -1 : 1) * dt * 6; if (b.t > 0.32) skResolve(null, b); }
  else if (b.st === 'sink') { if (b.t > 0.6) skResolve(b.hole, b); }
  if (b.st !== 'sink' && b.st !== 'drain') { sp = Math.hypot(b.vu, b.vv); b.ph += sp * dt / SK_RB * 0.7; }
}
function skBallPose(b) {
  var v = b.v, u = b.u, z = b.z, s, R, a = 1, y, x, fb = skFb(), e = 0, gt = b.st === 'gut' || b.st === 'drain';
  if (b.st === 'sink') { e = Math.min(1, b.t / 0.6); e = e * e * (3 - 2 * e); u = b.u0 + (b.hole.u - b.u0) * e; v = b.v0 + (b.hole.c - b.v0) * e; z = 0; a = 1 - Math.max(0, (b.t - 0.3) / 0.3); }
  s = skS(v); R = SK_RB * 1.1 * fb * s * (v < 0 ? 1 + 0.6 * (v / SK_V0) : 1) * (1 - 0.55 * e);
  if (gt) { z = -0.05; R *= 0.82; if (b.st === 'drain') { e = Math.min(1, b.t / 0.32); R *= 1 - 0.85 * e; a = 1 - e * e; } }
  x = skX(u, v); y = skY(v) - z * fb * s * SK_LIFT;
  if (gt && b.st === 'drain') y += e * R * 1.4;
  return { x: x, y: y, R: R, a: a, gy: skY(v), z: z };
}
/* a golden pineapple ball that really rolls: its skin pattern, face and crown wrap around a sphere as it travels, whatever the direction */
function drawSkeeBall(b) {
  var p = skBallPose(b), h = Math.max(0, p.z), fb = skFb(), s = skS(b.v), ph = h * fb * s * SK_LIFT, R = p.R * 1.12, sp = Math.hypot(b.vu, b.vv), k, al, c, yy, d, gr;
  if (p.a <= 0) return;
  if (sp > 0.04) b.dir = Math.atan2(b.vu * fb * s, -b.vv * (skY(b.v + 0.01) - skY(b.v)) / 0.01);
  if (b.st !== 'gut' && b.st !== 'drain') drawShadow(p.x + ph * 0.45, p.gy + p.R * 0.22, p.R * (1.05 + h * 0.5), Math.min(0.95, 0.9 / (1 + h * 2.2)) * p.a);
  ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y - p.R * 0.3);
  gr = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R); gr.addColorStop(0, '#ffe680'); gr.addColorStop(0.6, '#f6b229'); gr.addColorStop(1, '#c4731a');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.3); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.3); ctx.clip(); ctx.rotate(b.dir);
  /* diamond skin, scrolling with the roll */
  d = R * 0.7; k = (b.ph * R) % d; ctx.strokeStyle = 'rgba(140,70,8,.5)'; ctx.lineWidth = Math.max(1, R * 0.1);
  ctx.beginPath(); for (c = -4; c <= 4; c++) { yy = c * d - k; ctx.moveTo(-R * 2, yy - R * 2); ctx.lineTo(R * 2, yy + R * 2); ctx.moveTo(-R * 2, yy + R * 2); ctx.lineTo(R * 2, yy - R * 2); } ctx.stroke();
  /* the face wraps around the front and the crown sits a quarter turn from it */
  al = b.ph; c = Math.cos(al);
  if (c > 0) {
    yy = -R * 0.92 * Math.sin(al); ctx.save(); ctx.translate(0, yy); ctx.scale(1, Math.max(0.12, c)); ctx.rotate(-b.dir);
    ctx.fillStyle = '#3a1d08'; ctx.beginPath(); ctx.ellipse(-R * 0.3, -R * 0.12, R * 0.12, R * 0.17, 0, 0, 6.3); ctx.ellipse(R * 0.3, -R * 0.12, R * 0.12, R * 0.17, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-R * 0.27, -R * 0.17, R * 0.04, 0, 6.3); ctx.arc(R * 0.33, -R * 0.17, R * 0.04, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#3a1d08'; ctx.lineWidth = Math.max(1, R * 0.08); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, R * 0.08, R * 0.24, 0.25, 2.9); ctx.stroke(); ctx.restore();
  }
  al = b.ph + 1.5708; c = Math.cos(al);
  if (c > 0) { yy = -R * 0.95 * Math.sin(al); ctx.save(); ctx.translate(0, yy); ctx.scale(1, Math.max(0.12, c)); ctx.rotate(-b.dir); ctx.fillStyle = '#2f9a4a'; ctx.beginPath(); for (k = 0; k < 7; k++) { ctx.moveTo(0, 0); ctx.lineTo(Math.cos(k * 0.9) * R * 0.46, Math.sin(k * 0.9) * R * 0.46); ctx.lineTo(Math.cos(k * 0.9 + 0.45) * R * 0.2, Math.sin(k * 0.9 + 0.45) * R * 0.2); } ctx.fill(); ctx.restore(); }
  ctx.restore();
  /* leaves poking past the rim when the crown is on the edge */
  al = b.ph + 1.5708; c = Math.cos(al);
  if (Math.abs(c) < 0.55) { ctx.save(); ctx.rotate(b.dir); yy = -Math.sin(al) > 0 ? -1 : 1; ctx.fillStyle = '#2f9a4a'; ctx.beginPath(); for (k = -2; k <= 2; k++) { ctx.moveTo(k * R * 0.14, yy * R * 0.88); ctx.lineTo(k * R * 0.3, yy * R * 1.42); ctx.lineTo(k * R * 0.14 + R * 0.12, yy * R * 0.88); } ctx.fill(); ctx.restore(); }
  /* roundness: darker rim, one steady highlight */
  gr = ctx.createRadialGradient(0, 0, R * 0.55, 0, 0, R); gr.addColorStop(0, 'rgba(60,20,0,0)'); gr.addColorStop(1, 'rgba(60,20,0,.42)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-R * 0.34, -R * 0.4, R * 0.2, R * 0.12, -0.6, 0, 6.3); ctx.fill();
  ctx.restore();
}
/* a raised ring: a shadow on the felt, the ring's front wall, its bright top, then the dark hole */
function drawHoleB(h) {
  var fb = skFb(), s = skS(h.c), x = skX(h.u, h.c), y = skY(h.c), rx = h.r * fb * s, ry = rx * SK_RAT, ro = (h.r + 0.05) * fb * s, rro = ro * SK_RAT, hg = SK_ZC * fb * s * SK_LIFT * 1.3, yt = y - hg * 0.5;
  ctx.fillStyle = 'rgba(30,8,4,.38)'; ctx.beginPath(); ctx.ellipse(x + ro * 0.16, y + hg * 0.55 + ro * 0.1, ro * 1.04, rro * 1.0, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#cfc4a4'; ctx.strokeStyle = '#8a8168'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x - ro, yt); ctx.lineTo(x - ro, y + hg * 0.5); ctx.ellipse(x, y + hg * 0.5, ro, rro, 0, Math.PI, 0, true); ctx.lineTo(x + ro, yt); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f8f2df'; ctx.beginPath(); ctx.ellipse(x, yt, ro, rro, 0, 0, 6.3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#140a07'; ctx.beginPath(); ctx.ellipse(x, yt, rx, ry, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#3b2418'; ctx.beginPath(); ctx.ellipse(x, yt - ry * 0.2, rx * 0.88, ry * 0.68, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#0a0504'; ctx.beginPath(); ctx.ellipse(x, yt + ry * 0.12, rx * 0.8, ry * 0.7, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(x - ro * 0.45, yt - rro * 0.7, ro * 0.22, rro * 0.1, -0.4, 0, 6.3); ctx.fill();
  var fs = Math.max(11, Math.round(ro * 0.8)), side = h.u === 0 ? 0 : (h.u < 0 ? -1 : 1);
  ctx.font = '800 ' + fs + 'px "Bricolage Grotesque",sans-serif'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = fs * 0.22; ctx.strokeStyle = '#2a120d'; ctx.fillStyle = h.v >= 40 ? '#ffd23f' : '#fff7e3';
  if (side) { ctx.textAlign = 'center'; ctx.strokeText(h.v, x, yt - rro - fs * 0.62); ctx.fillText(h.v, x, yt - rro - fs * 0.62); }
  else if (h.v === 20) { ctx.textAlign = 'center'; ctx.strokeText(h.v, x, y + hg * 0.5 + rro + fs * 0.62); ctx.fillText(h.v, x, y + hg * 0.5 + rro + fs * 0.62); }
  else { ctx.textAlign = 'right'; ctx.strokeText(h.v, x - ro - 5, yt); ctx.fillText(h.v, x - ro - 5, yt); }
}
function skQuad(g, u0, v0, u1, v1, fill) {
  g.fillStyle = fill; g.beginPath(); g.moveTo(skX(u0, v0), skY(v0)); g.lineTo(skX(u1, v0), skY(v0)); g.lineTo(skX(u1, v1), skY(v1)); g.lineTo(skX(u0, v1), skY(v1)); g.closePath(); g.fill();
}
/* the arcade hall behind the machine: striped wall, bunting, posters, a tiled floor, and wooden bleachers for the crowds */
function skHall(g, yW) {
  var i, j, k, lg, x, y, y0, y1, n = 9, sc0, sc1, side, e, py, wd = W / 12;
  lg = g.createLinearGradient(0, 0, 0, yW); lg.addColorStop(0, '#241a48'); lg.addColorStop(1, '#4a3a84'); g.fillStyle = lg; g.fillRect(0, 0, W, yW);
  for (i = 0; i < 12; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.1)'; g.fillRect(i * wd, 0, wd, yW); }
  g.fillStyle = '#392b6b'; g.fillRect(0, yW - H * 0.04, W, H * 0.04); g.fillStyle = '#7762b4'; g.fillRect(0, yW - H * 0.04, W, 3); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, yW - 3, W, 3);
  /* posters in the upper corners */
  for (side = 0; side < 2; side++) {
    x = side ? W * 0.9 : W * 0.04; y = H * 0.175; g.fillStyle = '#e8d9b0'; g.fillRect(x - 3, y - 3, W * 0.07 + 6, H * 0.062 + 6); g.fillStyle = side ? '#2b7fb8' : '#e0472f'; g.fillRect(x, y, W * 0.07, H * 0.062);
    g.fillStyle = '#ffe680'; g.beginPath(); g.arc(x + W * 0.035, y + H * 0.03, W * 0.019, 0, 6.3); g.fill(); g.fillStyle = '#2f9a4a'; g.fillRect(x + W * 0.03, y + H * 0.005, W * 0.01, H * 0.012);
  }
  /* bunting across each side of the wall */
  for (side = 0; side < 2; side++) {
    var x0 = side ? W : 0, x1 = side ? W * 0.74 : W * 0.26, ya = H * 0.158, yb = H * 0.135;
    g.strokeStyle = '#d8c9a0'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, ya); g.quadraticCurveTo((x0 + x1) / 2, ya + H * 0.045, x1, yb); g.stroke();
    for (i = 0; i < 9; i++) {
      var tt = (i + 0.5) / 9, bx = x0 + (x1 - x0) * tt, by = (1 - tt) * (1 - tt) * ya + 2 * (1 - tt) * tt * (ya + H * 0.045) + tt * tt * yb;
      g.fillStyle = ['#e0472f', '#ffd23f', '#2b9fd8', '#3fbf6a'][i % 4]; g.beginPath(); g.moveTo(bx - 8, by); g.lineTo(bx + 8, by); g.lineTo(bx, by + 17); g.closePath(); g.fill();
    }
  }
  /* floor: dark checker tiles in perspective */
  lg = g.createLinearGradient(0, yW, 0, H); lg.addColorStop(0, '#2d2358'); lg.addColorStop(1, '#171030'); g.fillStyle = lg; g.fillRect(0, yW, W, H - yW);
  for (k = 0; k < n; k++) {
    y0 = yW + (H - yW) * Math.pow(k / n, 1.6); y1 = yW + (H - yW) * Math.pow((k + 1) / n, 1.6);
    sc0 = W * 0.1 * (1 + 2.6 * (y0 - yW) / (H - yW)); sc1 = W * 0.1 * (1 + 2.6 * (y1 - yW) / (H - yW));
    for (j = -9; j < 9; j++) {
      if ((j + k) & 1) continue;
      g.fillStyle = 'rgba(255,255,255,.045)'; g.beginPath(); g.moveTo(W / 2 + j * sc0, y0); g.lineTo(W / 2 + (j + 1) * sc0, y0); g.lineTo(W / 2 + (j + 1) * sc1, y1); g.lineTo(W / 2 + j * sc1, y1); g.closePath(); g.fill();
    }
  }
  /* wooden bleachers beside the machine, a step for each row of the crowd */
  for (side = 0; side < 2; side++) {
    var top = H * 0.255, prev = top; g.save(); if (side) { g.translate(W, 0); g.scale(-1, 1); }
    e = function (yy) { return skX(-1.12, skCl(skV(yy), SK_V0, SK_VMAX)) - 2; };
    g.fillStyle = '#3a2516'; g.beginPath(); g.moveTo(0, top); g.lineTo(e(top), top); g.lineTo(e(H * 0.88), H * 0.88); g.lineTo(0, H * 0.88); g.closePath(); g.fill();
    for (i = 0; i < 12; i++) {
      py = H * (0.27 + i * 0.0525) + H * 0.004; var ph = H * 0.017;
      g.fillStyle = '#7b5232'; g.fillRect(0, py, e(py), ph); g.fillStyle = '#a9754a'; g.fillRect(0, py, e(py), 2); g.fillStyle = '#5a3a21'; g.fillRect(0, py + ph, e(py), 3);
    }
    g.fillStyle = '#d6b04a'; g.fillRect(0, top - 4, e(top), 4);
    g.restore();
  }
}
function buildSkeeBg() {
  skBg = document.createElement('canvas'); skBg.width = cv.width; skBg.height = cv.height;
  var g = skBg.getContext('2d'), i, side, yT = skY(SK_VMAX), yB = skY(0), yH = skY(SK_HUMP), lg, yW = H * 0.26;
  g.scale(DPR, DPR);
  skHall(g, yW);
  /* the machine's cabinet under the lane */
  skQuad(g, -1.2, SK_V0 - 0.6, 1.2, 0.0, '#2b1f44');
  /* board: red felt, brighter toward the player */
  lg = g.createLinearGradient(0, yT, 0, yB); lg.addColorStop(0, '#8a3526'); lg.addColorStop(1, '#c75b40');
  skQuad(g, -1, 0, 1, SK_VMAX, lg);
  g.strokeStyle = 'rgba(255,230,200,.13)'; g.lineWidth = 1.2;
  for (i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(skX(i * 0.28, 0), yB); g.lineTo(skX(i * 0.28, SK_VMAX), yT); g.stroke(); }
  g.fillStyle = '#c9a23a'; g.fillRect(skX(-1.12, SK_VMAX), yT - 6, skX(1.12, SK_VMAX) - skX(-1.12, SK_VMAX), 6);
  for (side = -1; side <= 1; side += 2) {
    skQuad(g, side * 1, 0, side * 1.12, SK_VMAX, '#c9a23a'); skQuad(g, side * 1, SK_V0 - 0.6, side * 1.12, SK_HUMP, '#1f8a4d'); skQuad(g, side * 1, SK_V0 - 0.6, side * 1.05, SK_HUMP, '#34b86e');
  }
  /* the catch trough between the hop and the board: a dark curved gutter with a drain at each end and a raised front wall */
  lg = g.createLinearGradient(0, yH, 0, yB); lg.addColorStop(0, '#2f2350'); lg.addColorStop(0.45, '#0b0710'); lg.addColorStop(1, '#241a38'); skQuad(g, -1.12, SK_HUMP, 1.12, 0, lg);
  for (side = -1; side <= 1; side += 2) { g.fillStyle = '#05030a'; g.beginPath(); g.ellipse(skX(side * SK_DRN, SK_GV), skY(SK_GV), 0.12 * skFb() * skS(SK_GV), 0.07 * skFb() * skS(SK_GV), 0, 0, 6.3); g.fill(); g.strokeStyle = '#8d7b9f'; g.lineWidth = 2; g.stroke(); }
  g.fillStyle = '#e8d48a'; g.fillRect(skX(-1.12, 0), yB - 3, skX(1.12, 0) - skX(-1.12, 0), 5);
  lg = g.createLinearGradient(0, yH - (yH - yB) * 0.36, 0, yH); lg.addColorStop(0, '#9b89b3'); lg.addColorStop(0.18, '#6b5a8a'); lg.addColorStop(1, '#3c2f5c'); skQuad(g, -1.12, SK_HUMP, 1.12, SK_HUMP + (0 - SK_HUMP) * 0.36, lg);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(skX(-1.12, SK_HUMP * 0.64), yH - (yH - yB) * 0.36, skX(1.12, SK_HUMP * 0.64) - skX(-1.12, SK_HUMP * 0.64), 2);
  /* lane (wood) and the launch ramp */
  lg = g.createLinearGradient(0, yH, 0, H); lg.addColorStop(0, '#caa06a'); lg.addColorStop(1, '#efca8e'); skQuad(g, -1, SK_V0 - 0.6, 1, SK_HUMP, lg);
  g.strokeStyle = 'rgba(90,50,20,.16)'; g.lineWidth = 2;
  for (i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(skX(i * 0.25, SK_HUMP), yH); g.lineTo(skX(i * 0.25, SK_V0 - 0.6), skY(SK_V0 - 0.6)); g.stroke(); }
  lg = g.createLinearGradient(0, skY(SK_HUMP - 0.55), 0, yH); lg.addColorStop(0, '#d9b57c'); lg.addColorStop(1, '#fff0c8'); skQuad(g, -1, SK_HUMP - 0.55, 1, SK_HUMP, lg);
  g.fillStyle = 'rgba(60,30,10,.35)'; g.fillRect(skX(-1, SK_HUMP - 0.55), skY(SK_HUMP - 0.55) - 1, skX(1, SK_HUMP - 0.55) - skX(-1, SK_HUMP - 0.55), 3);
  g.strokeStyle = '#fff6d8'; g.lineWidth = 3; g.beginPath(); g.moveTo(skX(-1, SK_HUMP), yH); g.lineTo(skX(1, SK_HUMP), yH); g.stroke();
  lg = g.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.45, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  lg.addColorStop(0, 'rgba(10,5,25,0)'); lg.addColorStop(1, 'rgba(10,5,25,.35)'); g.fillStyle = lg; g.fillRect(0, 0, W, H);
}
function led(txt, x, y, w, h) {
  ctx.fillStyle = '#120808'; ctx.fillRect(x - w / 2, y - h / 2, w, h); ctx.strokeStyle = '#7d7d86'; ctx.lineWidth = 1.5; ctx.strokeRect(x - w / 2, y - h / 2, w, h);
  ctx.font = '800 ' + Math.round(h * 0.82) + 'px ui-monospace,Menlo,Consolas,monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,40,40,.35)'; ctx.fillText(txt, x + 1, y + 2); ctx.fillStyle = '#ff3b3b'; ctx.fillText(txt, x, y + 1);
}
/* the crowd stands on the floor beside the machine */
/* a crowd member's spot: packed against the machine's edge, each one overlapping the next, never over the lane or board */
function skCrowdPos(c) {
  var y = H * c.y, s = W * c.k, edge, sp, x;
  edge = skX(-1.12, skCl(skV(y - s * 0.4), SK_V0, SK_VMAX)) - 3;
  s = Math.min(s, edge / 1.55); sp = s * 0.55;
  x = edge - s * 0.42 - (2 - c.c) * sp - (c.r % 2) * s * 0.22;
  return { x: x, y: y, s: s };
}
function drawCrowd(left) {
  var i, c, y, s, x, ct = left ? K.cl : K.cr, amp = left ? K.clA : 1, kind, mood, im, hop, rot, sq, t = calm ? 0 : S.t, e, f, bu, step, dir, P, Q;
  for (i = 0; i < SK_CROWD.length; i++) {
    c = SK_CROWD[i]; P = skCrowdPos(c); x = left ? P.x : W - P.x; y = P.y; s = P.s;
    e = ct - c.r * 0.04 - c.c * 0.02; kind = left ? (i % 3 === 1 ? 'pl' : 'pa') : (i % 3 === 1 ? 'ad' : 'rh');
    hop = 0; rot = 0; sq = 1;
    if (e >= 0 && e < 1.4) { mood = 'giggle'; if (!calm) { f = 1 - e / 1.4; hop = Math.abs(Math.sin(e * 13 + i)) * s * 0.4 * f * amp; rot = Math.sin(e * 18 + i) * 0.2 * f; sq = 1 + 0.08 * Math.sin(e * 26) * f; } }
    else { mood = left ? 'happy' : 'pout'; if (!calm) { hop = Math.abs(Math.sin(t * 2 + i * 1.7)) * s * 0.03; rot = Math.sin(t * 1.6 + i) * 0.04; } }
    /* a 100 sends neighbors into a leaping chest bump: they hop toward each other, meet, squash, and bounce apart */
    bu = left ? K.bt - c.r * 0.04 : -1;
    if (bu >= 0 && bu < 1.3) {
      mood = 'giggle'; Q = skCrowdPos(SK_CROWD[c.c === 0 ? i + 1 : i - 1]); step = Math.abs(Q.x - P.x) * 0.5; dir = c.c === 0 ? 1 : -1;
      f = bu < 0.28 ? bu / 0.28 : bu < 0.5 ? 1 : Math.max(0, 1 - (bu - 0.5) / 0.3);
      if (!calm) { x += dir * step * 0.95 * f; hop = s * 0.55 * Math.sin(Math.min(1, bu / 0.5) * Math.PI) * (bu < 0.5 ? 1 : 0.25 * Math.max(0, 1 - (bu - 0.5) / 0.8)); rot = dir * 0.35 * f * (bu < 0.5 ? 1 : 0.3); sq = bu > 0.26 && bu < 0.42 ? 1.18 : 1; }
      if (bu > 0.26 && bu < 0.34 && !calm && c.c === 0) { ctx.save(); ctx.fillStyle = '#fff3a8'; ctx.beginPath(); ctx.arc(x + s * 0.25, y - s * 0.45, s * 0.22, 0, 6.3); ctx.fill(); ctx.restore(); }
    }
    im = IMG[kind][mood]; if (!im) continue;
    drawShadow(x, y, s * 0.34, 0.5 - hop / s);
    ctx.save(); ctx.translate(x, y - hop); ctx.rotate(rot); ctx.scale(1 / sq, sq); ctx.drawImage(im, -s / 2, -s * (left ? 0.93 : 0.965), s, s); ctx.restore();
  }
}
function drawSkee() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.drawImage(skBg, 0, 0, W, H);
  var t = calm ? 0 : S.t, i, b = K.ball, fb = skFb();
  if ((drag || hs) && !elHint.hidden) elHint.hidden = true;
  /* marquee */
  var bx = W * 0.5, by = H * 0.125, bw = W * 0.88, bh = H * 0.082, fl = calm ? 1 : 0.9 + 0.1 * Math.sin(t * 3);
  ctx.fillStyle = '#c8cdd4'; ctx.fillRect(bx - bw / 2 - 3, by - bh / 2 - 3, bw + 6, bh + 6); ctx.fillStyle = '#0c0c10'; ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
  ctx.font = '800 ' + Math.round(bh * 0.36) + 'px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,60,90,' + (0.7 * fl) + ')'; ctx.strokeText('PINEAPPLE ROLL', bx, by - bh * 0.25); ctx.fillStyle = '#fff'; ctx.fillText('PINEAPPLE ROLL', bx, by - bh * 0.25);
  ctx.font = '800 9px "Figtree",sans-serif'; ctx.fillStyle = '#9aa0ad'; ctx.textAlign = 'left'; ctx.fillText('SCORE', bx - bw * 0.46, by + bh * 0.22); ctx.textAlign = 'right'; ctx.fillText('BALLS', bx + bw * 0.46, by + bh * 0.22);
  led(String(K.score).padStart(3, '0'), bx - bw * 0.2, by + bh * 0.22, bw * 0.26, bh * 0.36); led(String(K.balls + K.bl.length).padStart(2, '0'), bx + bw * 0.2, by + bh * 0.22, bw * 0.26, bh * 0.36);
  drawCrowd(true); drawCrowd(false);
  for (i = 0; i < SK_HOLES.length; i++) drawHoleB(SK_HOLES[i]);
  var bs = K.bl.slice().sort(function (p, q) { return q.v - p.v; }), gutB = false;
  for (i = 0; i < bs.length; i++) { drawSkeeBall(bs[i]); if (bs[i].st === 'gut' || bs[i].st === 'drain') gutB = true; }
  if (gutB) { var yF = skY(SK_HUMP) - (skY(SK_HUMP) - skY(0)) * 0.36, yE = skY(SK_HUMP) + 2; ctx.drawImage(skBg, 0, yF * DPR, skBg.width, (yE - yF) * DPR, 0, yF, W, yE - yF); }
  drawStand();
  if (!K.over && K.balls > 0) {
    var R = SK_RB * 1.1 * fb * skS(SK_V0) * 1.6 * 1.15, bob = calm ? 0 : Math.sin(t * 3) * 2, im = IMG.pa.happy, yy = skY(SK_V0);
    drawShadow(W / 2, yy + 3, R * 0.9, 0.55);
    if (im) ctx.drawImage(im, W / 2 - R * 1.35, yy - R * 1.65 + bob, R * 2.7, R * 2.7);
  }
  for (i = 0; i < K.say.length; i++) {
    var sy = K.say[i], a = 1 - sy.t / 1.2; ctx.globalAlpha = a; ctx.font = '800 13px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2a120d'; ctx.fillStyle = sy.left ? '#ffd23f' : '#bfe6ff'; var bx2 = Math.max(48, Math.min(W - 48, sy.x)); ctx.strokeText(sy.txt, bx2, sy.y - sy.t * 18); ctx.fillText(sy.txt, bx2, sy.y - sy.t * 18); ctx.globalAlpha = 1;
  }
  drawParticles();
}
function hudSkee() {
  if (shown.wave !== 'Pineapple Roll') { shown.wave = 'Pineapple Roll'; elWave.textContent = 'Pineapple Roll'; }
  setTxt(elLeft, 'left', K.balls + K.bl.length); setTxt(elCombo, 'combo', K.score);
  var cr = skCredits(K.score); if (shown.gold !== cr) { shown.gold = cr; elGold.textContent = String(cr); }
  setTxt(elBank, 'bank', sv.bank); setTxt(elCups, 'cups', popcount(sv.ach) + '/10');
}
/* the way in is a secret */
var lpaEl = document.querySelector('.lpa'), lpaT = [];
if (lpaEl) lpaEl.addEventListener('click', function () {
  var n = performance.now(); lpaT.push(n); lpaT = lpaT.filter(function (x) { return n - x < 2200; });
  if (!calm && lpaEl.animate) lpaEl.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-16deg) scale(1.18)' }, { transform: 'rotate(0)' }], { duration: 260 });
  if (lpaT.length >= 3) { lpaT = []; setTimeout(startSkee, 380); }
});

/* ---------- loop ---------- */
function frame(now) {
  if (!running) return;
  raf = requestAnimationFrame(frame);
  if (!last) { last = now; return; }
  var gap = now - last; last = now;
  var dtMs = even.next(gap) || gap;
  gov.frame(gap, now);
  var dt = Math.min(dtMs, 50) / 1000 * timeScale;
  calm = root.getAttribute('data-calm') === '1';
  if (K) { updateSkee(dt); drawSkee(); hudSkee(); } else { update(dt); draw(); hud(); }
}
function run() { if (running) return; running = true; last = 0; even.reset(); raf = requestAnimationFrame(frame); }
function halt() { running = false; cancelAnimationFrame(raf); }

/* ---------- input ---------- */
var drag = null;
function rel(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp }; }
cv.addEventListener('pointerdown', function (e) {
  if (S.paused || S.over || drag) return;
  try { cv.setPointerCapture(e.pointerId); } catch (x) {}
  var p = rel(e);
  if (tableHit(p)) { e.preventDefault(); return; }
  drag = { id: e.pointerId, sx: p.x, sy: p.y, t0: p.t, pts: [p] };
  e.preventDefault();
});
function tableHit(p) {
  var o;
  if (S.pu) { o = slot(0); if (Math.hypot(p.x - o.x, p.y - o.cy) <= o.r) { collectPU(); return true; } }
  if (S.tro) { o = slot(1); if (Math.hypot(p.x - o.x, p.y - o.cy) <= o.r) { collectTro(false); return true; } }
  return false;
}
var hov = [], hovLock = 0;
/* minigame, mouse or touchpad: a swipe up the pad rolls the ball once the swipe eases off, so the whole swipe sets the speed */
var hs = null, hsLock = 0;
function hoverRoll(e) {
  if (e.pointerType === 'touch' || e.buttons !== 0 || S.over || S.paused || K.over || K.balls <= 0) { hs = null; hov.length = 0; return; }
  var p = rel(e), a, dx, dy, dtm, spd, last, f;
  if (p.t < hsLock) return;
  if (!hs) {
    hov.push(p); while (hov.length && p.t - hov[0].t > 100) hov.shift();
    if (hov.length < 2) return;
    a = hov[0]; dx = p.x - a.x; dy = p.y - a.y; dtm = Math.max(16, p.t - a.t); spd = Math.hypot(dx, dy) / dtm * 1000 / H;
    if (a.y >= H * 0.5 && -dy > H * 0.02 && -dy > Math.abs(dx) * 0.5 && spd >= 0.8) { hs = { pts: hov.slice(), sx: a.x, sy: a.y, t0: a.t, peak: spd, wall: performance.now() }; hov.length = 0; }
    return;
  }
  hs.pts.push(p); if (hs.pts.length > 60) hs.pts.shift(); hs.wall = performance.now();
  last = hs.pts[hs.pts.length - 2]; dtm = Math.max(8, p.t - last.t); spd = Math.hypot(p.x - last.x, p.y - last.y) / dtm * 1000 / H;
  if (p.y > hs.sy + 4 || p.t - hs.t0 > 1200) { hs = null; return; }
  if (spd > hs.peak) hs.peak = spd; else if (hs.peak >= 1.2 && spd < hs.peak * 0.35 && p.t - hs.t0 > 80) hsFire(p.t);
}
function hsFire(t) {
  var f = hs && skFlick(hs); hs = null; hov.length = 0; hsLock = t + 400;
  if (f) skeeRoll(f.dx, f.dy, f.spd);
}
function hoverFlick(e) {
  if (K) { hoverRoll(e); return; }
  if (e.pointerType === 'touch' || e.buttons !== 0 || S.over || S.paused || S.cd > 0) { hov.length = 0; return; }
  var p = rel(e); hov.push(p);
  while (hov.length && p.t - hov[0].t > 150) hov.shift();
  if (p.t < hovLock || hov.length < 3) return;
  var a = hov[0], dx = p.x - a.x, dy = p.y - a.y, dtm = Math.max(16, p.t - a.t), spd = Math.hypot(dx, dy) / dtm * 1000 / H;
  if (-dy >= H * 0.1 && -dy > Math.abs(dx) * 0.6 && spd >= 1.5 && a.y >= H * 0.45) {
    var po = pouchPos(); hov.length = 0; hovLock = p.t + 350;
    if (K) skeeRoll(dx, dy, spd); else throwAt(po.x, po.y, dx, dy, spd, null);
  }
}
cv.addEventListener('pointermove', function (e) {
  if (!drag) { hoverFlick(e); return; }
  if (e.pointerId !== drag.id) return;
  drag.pts.push(rel(e)); if (drag.pts.length > (K ? 48 : 10)) drag.pts.shift();
});
cv.addEventListener('pointercancel', function () { drag = null; });
cv.addEventListener('pointerup', function (e) {
  if (!drag || e.pointerId !== drag.id) return;
  var d = drag; drag = null;
  var end = rel(e), vx = end.x - d.sx, vy = end.y - d.sy, len = Math.hypot(vx, vy), m = Math.min(W, H);
  var po = pouchPos(), oy = po.y, ox;
  if (len < TAP_MIN * m) return;   // flick only: a plain tap does nothing
  if (vy > -FLICK_MIN * H) return;
  var old = d.pts[0], i;
  for (i = d.pts.length - 1; i >= 0; i--) { if (end.t - d.pts[i].t >= 60) { old = d.pts[i]; break; } }
  var dx = end.x - old.x, dy = end.y - old.y;
  if (dy > -2) { dx = vx; dy = vy; old = { t: d.t0 }; }
  var dur = Math.max(30, end.t - old.t), spd = Math.hypot(dx, dy) / dur * 1000 / H;
  ox = po.x;
  if (K) { var kf = skFlick(Object.assign({}, d, { pts: d.pts.concat([end]) })); if (kf) skeeRoll(kf.dx, kf.dy, kf.spd); return; }
  throwAt(ox, oy, dx, dy, spd, null);
});
cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

var picks = document.querySelectorAll('.pick');
function setType(t) { curType = t; Array.prototype.forEach.call(picks, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-t') === t ? 'true' : 'false'); }); }
Array.prototype.forEach.call(picks, function (b) { b.addEventListener('click', function () { setType(b.getAttribute('data-t')); }); });
document.addEventListener('keydown', function (e) { if (gameEl.hidden) return; if (e.key === '1') setType('classic'); else if (e.key === '2') setType('lobber'); else if (e.key === '3') collectPU(); else if (e.key === '4') collectTro(false); });

/* ---------- cards, pause, screens ---------- */
var gcw = $('gcw');
function showCard(title, body, btn1, fn1, noTitleBtn) {
  $('gTitle').textContent = title; $('gBody').textContent = body;
  var b1 = $('gBtn1'); b1.textContent = btn1; b1.onclick = function () { hideCard(); fn1(); };
  $('gBtn2').onclick = function () { hideCard(); toTitle(); };
  $('gX').hidden = true; halt(); gcw.hidden = false; b1.focus();
}
function hideCard() { gcw.hidden = true; }
function startAgain() { startStage(); run(); }
function pause() {
  if (S.paused || S.over || !running) return;
  S.paused = true; halt();
  showCard('Paused', 'Take your time.', 'Resume', resume);
  $('gX').hidden = false; $('gX').onclick = function () { hideCard(); resume(); };
  $('gBtn2').textContent = 'Back to title';
}
function resume() { S.paused = false; run(); }
$('bPause').addEventListener('click', pause);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gameEl.hidden === false && !S.paused) pause(); });
document.addEventListener('visibilitychange', function () { if (document.hidden && gameEl.hidden === false) pause(); });
function toTitle() { if (K) { K = null; skLabels(false); gameEl.removeAttribute('data-bonus'); if (elHint.lastChild) elHint.lastChild.textContent = HINT_TXT; } updateContinue(); halt(); S.paused = false; gameEl.hidden = true; titleEl.hidden = false; $('bPlay').focus(); }
$('gBtn2').textContent = 'Title';
window.addEventListener('resize', function () { if (gameEl.hidden === false) { resize(); if (!running) { draw(); } } });

function start() {
  titleEl.hidden = true; gameEl.hidden = false;
  loadAssets().then(function () { resize(); startStage(); run(); });
}
$('bPlay').addEventListener('click', start);
btnCont.addEventListener('click', function () { if (!btnCont.disabled) continueGame(); });

/* ---------- save code and file (Settings card) ---------- */
function wireSettings() {
  var body = $('cardBody'), $b = function (id) { return body.querySelector('#' + id); };
  if (!$b('svShow')) return;
  var msg = $b('svMsg'), codeBox = $b('svCode'), copyBtn = $b('svCopy'), paste = $b('svPaste'), pick = $b('svPick');
  function say(t) { msg.textContent = t; }
  function cur() { return JSON.parse(JSON.stringify(sv)); }
  $b('svShow').addEventListener('click', function () {
    kit.exportCode(cur()).then(function (c) { codeBox.value = c; codeBox.hidden = false; copyBtn.hidden = false; codeBox.focus(); codeBox.select(); say('Here is your save code.'); });
  });
  copyBtn.addEventListener('click', function () {
    codeBox.select();
    var done = function () { say('Copied!'); };
    var fallback = function () { try { document.execCommand('copy'); done(); } catch (e) { say('Select the code and copy it.'); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(codeBox.value).then(done, fallback); else fallback();
  });
  $b('svFile').addEventListener('click', function () {
    kit.exportCode(cur()).then(function (c) {
      var a = document.createElement('a'), url = URL.createObjectURL(new Blob([c + '\n'], { type: 'text/plain' }));
      a.href = url; a.download = 'pineapple-defense-save.txt'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000); say('Save file made.');
    });
  });
  function load(text) {
    kit.importCode(text).then(function (clean) {
      if (!kit.stageImport(clean, cur())) { say('This browser would not let me save that.'); return; }
      say('Loaded! Reloading...'); setTimeout(function () { location.reload(); }, 500);
    }, function (m) { say(String(m)); });
  }
  var loadBtn = $b('svLoad');
  loadBtn.addEventListener('click', SaveKit.twoTap(function () { load(paste.value); }, 3000,
    function () { loadBtn.textContent = 'Tap again to replace your game'; say('This replaces the game on this device.'); },
    function () { loadBtn.textContent = 'Load code'; }));
  $b('svFileLoad').addEventListener('click', function () { pick.click(); });
  pick.addEventListener('change', function () {
    var f = pick.files && pick.files[0]; if (!f) return;
    f.text().then(load, function () { say('I could not read that file.'); });
  });
}
$('bSet').addEventListener('click', wireSettings);
function fillTrophies() {
  var box = $('cardBody').querySelector('#trList'); if (!box) return;
  var got = 0, i, h = '';
  for (i = 0; i < ACH.length; i++) {
    var on = (sv.ach >> i) & 1; got += on;
    h += '<div class="ti" data-got="' + on + '"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 6h22v8c0 8-5 12-11 14-6-2-11-6-11-14Z" fill="#f8bd1c" stroke="#a8700f" stroke-width="2.5" stroke-linejoin="round"/><path d="M9 10H4c0 6 2 9 6 10M31 10h5c0 6-2 9-6 10" fill="none" stroke="#a8700f" stroke-width="2.5" stroke-linecap="round"/><path d="M16 28h8v5h5v3H11v-3h5Z" fill="#d99a14" stroke="#a8700f" stroke-width="2"/></svg><span><b></b><i></i></span></div>';
  }
  box.innerHTML = h;
  var rows = box.children;
  for (i = 0; i < ACH.length; i++) { rows[i].querySelector('b').textContent = (sv.ach >> i) & 1 ? ACH[i].n : '???'; rows[i].querySelector('i').textContent = ACH[i].d; }
  var n = $('cardBody').querySelector('#trNote'); if (n) n.textContent = got + ' of ' + ACH.length + ' collected. Tap a trophy on your table to collect it.';
}
$('bTro').addEventListener('click', fillTrophies);
/* ---------- shop (title screen): the auto slingshot ---------- */
var SHOP = {
  cost: { au: 8, ar: [10, 16, 24], ap: [12, 20] },
  pine: ['Classic pineapples', 'Lobber pineapples: splashy!', 'Mega pineapples: super splash!']
};
function fillShop() {
  var box = $('cardBody').querySelector('#shList'); if (!box) return;
  var note = $('cardBody').querySelector('#shNote');
  if (note) note.textContent = 'You have ' + sv.bank + ' Golden Pineapples. Earn more from waves, bosses and trophies.';
  var rows = [];
  rows.push({ k: 'au', title: 'Auto Slingshot', desc: sv.au ? 'A helper on your table. It aims at the penguin with the teal marker, so aim at a different one!' : 'A little helper that tosses pineapples all by itself and shows who it is aiming at.', cost: sv.au ? 0 : SHOP.cost.au, st: sv.au ? 'Owned' : '' });
  rows.push({ k: 'ar', title: 'Faster Fling ' + sv.ar + '/3', desc: 'Now: a toss every ' + AUTO_INT[sv.ar] + ' seconds.' + (sv.ar < 3 ? ' Next: ' + AUTO_INT[sv.ar + 1] + ' seconds.' : ''), cost: sv.ar < 3 ? SHOP.cost.ar[sv.ar] : 0, st: sv.ar >= 3 ? 'Maxed' : '', lock: !sv.au });
  rows.push({ k: 'ap', title: 'Better Pineapples ' + sv.ap + '/2', desc: 'Now: ' + SHOP.pine[sv.ap] + (sv.ap < 2 ? ' Next: ' + SHOP.pine[sv.ap + 1] : ''), cost: sv.ap < 2 ? SHOP.cost.ap[sv.ap] : 0, st: sv.ap >= 2 ? 'Maxed' : '', lock: !sv.au });
  box.textContent = '';
  rows.forEach(function (r) {
    var d = document.createElement('div'); d.className = 'ti sh'; d.setAttribute('data-got', r.st ? '1' : '0');
    var s = document.createElement('span'), b = document.createElement('b'), i = document.createElement('i');
    b.textContent = r.title; i.textContent = r.desc; s.appendChild(b); s.appendChild(i); d.appendChild(s);
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn sb';
    if (r.st) { btn.textContent = r.st; btn.disabled = true; }
    else { btn.textContent = r.lock ? 'Locked' : 'Buy ' + r.cost; btn.disabled = !!r.lock || sv.bank < r.cost;
      btn.addEventListener('click', function () { if (sv.bank < r.cost) return; sv.bank -= r.cost; sv[r.k]++; kit.save(sv); fillShop(); }); }
    d.appendChild(btn); box.appendChild(d);
  });
}
$('bShop').addEventListener('click', fillShop);


/* test hook, only with #qa in the address */
var qa = null;
if (location.hash === '#qa') {
  qa = window.__pd = { go: function (st, w) { titleEl.hidden = true; gameEl.hidden = false; loadAssets().then(function () { resize(); startStage({ stage: st, wave: w, golden: 0, cheer: 100 }); run(); }); }, bot: false, sv: function () { return sv; }, scale: function (v) { timeScale = v; }, get S() { return S; }, get penguins() { return penguins; },
    give: function (k) { spawnPU(k); }, award: award, collect: function () { collectPU(); collectTro(false); }, skee: startSkee, get K() { return K; }, roll: skeeRoll, plan: function (dx, dy, spd) { return skLaunch({ dx: dx, dy: dy, spd: spd }); }, get H() { return SK_HOLES; }, tap: function (x, y) { var o = pouchPos(); throwAt(o.x, o.y, x - o.x, y - o.y, 1.5, { x: x, y: y }); } };
}
/*{{LAB_JS}}*/
}());
