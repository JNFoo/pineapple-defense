/* Pineapple Defense: stage 1 (Sandy Snack Shore). Copyright (c) 2026 JNFoo. All rights reserved. */
(function () {
'use strict';
var $ = function (i) { return document.getElementById(i); };
var root = document.documentElement;
var titleEl = $('title'), gameEl = $('game'), cv = $('cv'), ctx = cv.getContext('2d');

/* ---------- settings ---------- */
var NWAVES = 8, WAVE_N = [4, 5, 6, 7, 8, 9, 10, 12];
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
var SZ = 384, IMG = { pa: {}, rh: {}, ad: {}, pl: {}, cw: {}, pz: {}, pm: {}, ph: {}, pf: {} }, PROP = {}, assets = null;
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
  var vars = tint ? VARS.replace('--pa-hi:#ffeaa0;--pa-mid:#f8bd1c;--pa-lo:#a85a07', '--pa-hi:' + tint[0] + ';--pa-mid:' + tint[1] + ';--pa-lo:' + tint[2]) : VARS;
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
  src.pl = src.pz = src.pm = src.ph = src.pf = src.pa;
  var jobs = [];
  Object.keys(src).forEach(function (k) {
    (MOODS_FOR[k] || Object.keys(MOOD)).forEach(function (m) {
      jobs.push(toImage(spriteSvg(src[k], m, TINT[k]), { w: SZ, h: SZ }).then(function (c) { IMG[k][m] = c; }));
    });
  });
  jobs.push(toImage($('spr-palm').innerHTML, { w: 400, h: 520 }).then(function (c) { PROP.palm = c; }));
  jobs.push(toImage($('spr-plant').innerHTML, { w: 240, h: 240 }).then(function (c) { PROP.plant = c; }));
  jobs.push(toImage($('spr-sign').innerHTML, { w: 420, h: 490 }).then(function (c) { PROP.sign = c; }));
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
  var can = sv.wave > 0;
  btnCont.disabled = !can;
  btnCont.textContent = can ? (sv.wave >= NWAVES ? 'Continue: boss' : 'Continue: wave ' + (sv.wave + 1)) : 'Continue';
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
        cd: 0, cdMax: 0.42, t: 0, wob: 0, thrown: false, over: false, paused: false, id: 0, lastLane: -1, boss: null, inBoss: false, bossHp: 3, sa: 0,
        puT: 9, pu: null, lastPu: '', fx: { zip: 0, mega: 0, frost: 0 }, tro: null, tq: [], earned: 0, streak: 0, allBumps: 0, toast: null, au: { cd: 1.5, tgt: null, a: 0 } };
  penguins = []; shots = []; bits = []; pops = [];
}

/* ---------- HUD ---------- */
var elWave = $('waveTxt'), elGold = $('goldTxt'), elCheer = $('cheerFill'), elReady = $('ready'), elBanner = $('banner'), elHint = $('hint');
var shown = { wave: '', gold: -1, cheer: -1, ready: -1 };
function hud() {
  var w = S.inBoss ? 'Coach Waddles: ' + S.bossHp + ' / 3' : 'Wave ' + Math.max(1, S.wave) + ' / ' + NWAVES;
  if (w !== shown.wave) { shown.wave = w; elWave.textContent = w; }
  if (S.golden !== shown.gold) { shown.gold = S.golden; elGold.textContent = String(S.golden); }
  var c = Math.round(S.cheer);
  if (c !== shown.cheer) { shown.cheer = c; elCheer.style.transform = 'scaleX(' + (c / 100) + ')'; elCheer.parentNode.setAttribute('data-low', c < 35 ? '1' : '0'); }
  var r = Math.round((1 - Math.max(0, S.cd) / COOLDOWN) * 20);
  if (r !== shown.ready) { shown.ready = r; elReady.style.setProperty('--pct', (r * 5) + '%'); elReady.setAttribute('data-ready', r >= 20 ? '1' : '0'); }
}
var bannerT = 0;
function banner(text, ms) {
  elBanner.textContent = text;
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
  buildBg();
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
  if (PROP.palm) { var ph = Math.min(H * 0.3, W * 0.45), pw = ph * 100 / 130; dyn.palm = { x: W * 0.015, y: hy + H * 0.075 - ph * 0.954, w: pw, h: ph }; }
  if (PROP.plant) { var qs = Math.min(H * 0.1, W * 0.17), by = hy + H * 0.07; dyn.pl = [{ x: W * 0.13, y: by - qs * 0.92, s: qs }, { x: W * 0.2, y: by + H * 0.012 - qs * 0.78 * 0.92, s: qs * 0.78 }]; }
  if (PROP.sign) {
    var sh = Math.min(H * 0.3, W * 0.45), sw = sh * 84 / 98, c = document.createElement('canvas');
    c.width = Math.ceil(sw * DPR); c.height = Math.ceil(sh * DPR);
    var g = c.getContext('2d'); g.scale(DPR, DPR); g.drawImage(PROP.sign, 0, 0, sw, sh);
    g.font = '800 ' + (sw * 9.6 / 84) + 'px "Bricolage Grotesque",sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = sw * 2 / 84; g.strokeStyle = '#fff7e3'; g.fillStyle = '#2f6f9f';
    g.strokeText('BRRR IS BEST!', sw * 0.5, sh * 0.1327); g.fillText('BRRR IS BEST!', sw * 0.5, sh * 0.1327);
    dyn.sign = { c: c, x: W - sw - W * 0.015, y: hy + H * 0.085 - sh * 0.959, w: sw, h: sh };
  }
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
  if (dyn.sign) sway(dyn.sign.c, dyn.sign.x, dyn.sign.y, dyn.sign.w, dyn.sign.h, 0.5, 0.96, Math.sin(t * 1.05 + 2) * 0.014);
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
function spawnPU(k) { S.pu = { k: k, t: 0, ttl: 9 }; S.lastPu = k; }
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
function beginWave(n) {
  S.wave = n; S.spawned = 0; S.toSpawn = WAVE_N[n - 1]; S.spawnT = 0.6; S.bumps = 0;
  S.mode = 'intro'; S.modeT = 0;
  banner(n === NWAVES ? 'Final wave!' : 'Wave ' + n, 1500);
}
function spawn() {
  var w = S.wave, lane;
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
    xE = px(best.xn, pEnd); yE = py(pEnd) - psz(pEnd) * (best.big || 1) * 0.42;
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
  newState();
  S.t = 0;
  elBanner.hidden = true;
  elHint.hidden = !!(from && from.wave > 0);
  if (from) { S.golden = from.golden; S.cheer = Math.max(60, from.cheer); }
  hud();
  if (from && from.wave >= NWAVES) startBoss(); else beginWave(from ? from.wave + 1 : 1);
}
function continueGame() { titleEl.hidden = true; gameEl.hidden = false; loadAssets().then(function () { resize(); startStage(sv); run(); }); }
function retryWave() { var w = S.inBoss ? NWAVES : S.wave - 1, g = S.golden; startStage({ wave: w, golden: g, cheer: 60 }); run(); }
function endStage(win) {
  S.over = true;
  if (win) {
    burst(W / 2, H * 0.3, 60, PINE_COL.concat(['#ff6f86', '#8fc6e4']));
    if (S.allBumps === 0) award(9);
    if (S.tro) collectTro(true);
    while (S.tq.length) { S.tro = { id: S.tq.shift(), t: 0 }; collectTro(true); }
    sv.bank = Math.min(999999, sv.bank + S.golden); sv.golden = 0; sv.wave = 0; sv.cheer = 100; sv.cleared = Math.max(sv.cleared, 1);
    kit.save(sv); updateContinue();
    showCard('Stage 1 clear!', 'Coach Waddles is giggling! You collected ' + S.golden + ' Golden Pineapples. Spend them in the Shop on the title screen. Stage 2 is coming soon!', 'Play again', startAgain);
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
  sv.wave = S.wave; sv.golden = S.golden; sv.cheer = Math.round(S.cheer); kit.save(sv); updateContinue();
}

/* ---------- boss: Coach Waddles ---------- */
function startBoss() {
  S.inBoss = true; S.mode = 'bossIntro'; S.modeT = 0; S.bossHp = 3; S.boss = null; S.spawnT = 2.5; S.wave = NWAVES;
  banner('Boss: Coach Waddles!', 2000);
}
function spawnBoss() {
  S.boss = { id: ++S.id, kind: 'cw', xn: 0, p: 0.05, v: 0.07, st: 'walk', t: 0, mood: 'happy', ph: 0, hat: false, a: 1, big: 1.35, hp: 3, shield: 4, sp: 0, puff: 0 };
}
function updateBoss(b, dt) {
  b.t += dt; b.ph += dt * 5; b.sp += dt;
  if (b.st === 'walk') { b.p += b.v * dt * slowK; if (b.p >= 0.4) { b.p = 0.4; b.st = 'hold'; b.t = 0; } }
  else if (b.st === 'hit') {
    if (b.t > 1.0) {
      if (b.hp <= 0) { b.st = 'slide'; b.t = 0; b.mood = 'giggle'; b.shield = 0; }
      else { b.st = 'hold'; b.mood = 'happy'; b.hat = false; b.shield = b.hp + 1; b.t = 0; }
    }
  } else if (b.st === 'slide') {
    b.p -= (0.35 + b.t * 1.1) * dt; b.puff -= dt;
    if (b.puff <= 0) { b.puff = 0.07; burst(px(b.xn, b.p), py(b.p), 3, SNOW_COL); }
    if (b.p <= 0.06) b.st = 'gone';
  }
}
function bossDefeated() {
  S.mode = 'bossWin'; S.modeT = 0; S.golden += 3; S.cheer = Math.min(100, S.cheer + 15);
  banner('Coach Waddles giggles!', 1900);
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
function update(dt) {
  S.t += dt; S.cd = Math.max(0, S.cd - dt); S.wob = Math.max(0, S.wob - dt * 1.6);
  var i, ta = 0;
  if (drag) { var cu = drag.pts[drag.pts.length - 1], ddx = cu.x - drag.sx, ddy = cu.y - drag.sy; if (Math.hypot(ddx, ddy) > 0.02 * Math.min(W, H)) ta = Math.max(-0.6, Math.min(0.6, Math.atan2(ddx, -ddy))); }
  S.sa += (ta - S.sa) * Math.min(1, dt * 14);
  for (i = bits.length - 1; i >= 0; i--) {
    var b = bits[i]; b.t += dt; b.vy += 620 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
    if (b.t > b.ttl) bits.splice(i, 1);
  }
  for (i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > pops[i].ttl) pops.splice(i, 1); }
  if (S.over) return;
  updateTable(dt); updateAuto(dt);
  for (i = shots.length - 1; i >= 0; i--) { updateShot(shots[i], dt); if (shots[i].dead) shots.splice(i, 1); }
  S.modeT += dt;
  if (S.mode === 'intro' && S.modeT > 1.2) { S.mode = 'run'; S.modeT = 0; }
  if (S.mode === 'run') {
    S.spawnT -= dt;
    if (S.spawned < S.toSpawn && S.spawnT <= 0) { spawn(); S.spawnT = Math.max(0.7, 1.9 - 0.12 * S.wave); }
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
    if (S.boss && S.boss.st === 'hold' && S.spawnT <= 0 && penguins.length < 3) { spawn(); S.spawnT = 3.6; }
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
  var lift = hop / (s * 0.03 || 1);
  drawShadow(x + s * 0.05, y - s * 0.015, s * 0.34 * sx * (1 - 0.16 * lift), 1 - 0.25 * lift);
  if (pg.st !== 'slide') {
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
  drawSling(slingGeom(), S.sa || 0, 1 - Math.max(0, S.cd) / (S.cdMax || COOLDOWN), effType());
  if (sv.au) drawSling(autoGeom(), S.au.a, 1 - Math.max(0, S.au.cd) / autoInt(), autoType(), '#16787a', '#3fc1b8');
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
  ctx.fillStyle = 'rgba(255,255,255,.85)';
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
    }
  }
  if (S.tro) {
    o = slot(1); bob = Math.sin(t * 3 + 1) * o.s * 0.04; var pp = Math.min(1, S.tro.t / 0.3), ts = o.s * (0.2 + 0.8 * (1 - Math.pow(1 - pp, 3)));
    var g2 = o.s * 1.7 * (1 + 0.08 * Math.sin(t * 4 + 1)); ctx.drawImage(glowFor('255,214,74'), o.x - g2 / 2, o.cy - g2 / 2 - bob, g2, g2);
    drawShadow(o.x, o.bottom - o.s * 0.02, o.s * 0.3, 0.6);
    ctx.save(); ctx.translate(o.x, o.bottom - bob); ctx.rotate(Math.sin(t * 2.3 + 1) * 0.06); drawTrophy(0, 0, ts); ctx.restore();
  }
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
    ctx.strokeStyle = '#fff7e3'; ctx.lineWidth = Math.max(2.5, r * 0.2); ctx.beginPath(); ctx.arc(x, y, r * 1.3, -Math.PI / 2, -Math.PI / 2 + 6.283 * ks[i][1]); ctx.stroke();
  }
  if (S.toast) {
    var tt = S.toast, u = tt.t / tt.ttl, a = u < 0.1 ? u / 0.1 : u > 0.8 ? (1 - u) / 0.2 : 1, ty = H * 0.285 - (calm ? 0 : u * 8);
    ctx.save(); ctx.globalAlpha = a; ctx.font = '800 ' + Math.round(fs * 0.62) + 'px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var tw = ctx.measureText(tt.txt).width + fs * 1.1; pill(W / 2, ty, tw, fs * 1.15, 'rgba(255,247,227,.96)'); ctx.fillStyle = '#7a4a12'; ctx.fillText(tt.txt, W / 2, ty + 1);
    ctx.restore();
  }
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
  for (i = 0; i < bits.length; i++) {
    var b = bits[i]; ctx.save(); ctx.globalAlpha = Math.min(1, (b.ttl - b.t) * 3); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
    ctx.fillStyle = b.c;
    if (b.k === 0) { ctx.beginPath(); ctx.ellipse(0, 0, b.w / 2, b.h / 2, 0, 0, 6.3); ctx.fill(); }
    else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  }
  var fs = Math.round(Math.max(22, Math.min(W, H) * 0.06));
  ctx.font = '800 ' + fs + 'px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (i = 0; i < pops.length; i++) {
    var p = pops[i], u = p.t / p.ttl, sc2 = u < 0.18 ? 0.3 + 1.2 * (u / 0.18) : u < 0.42 ? 1.5 - 0.5 * ((u - 0.18) / 0.24) : 1 - (u - 0.42) * 0.25;
    var yy = p.y - (calm ? 20 : 90) * Math.min(1, u * 1.3);
    ctx.save(); ctx.globalAlpha = u > 0.6 ? 1 - (u - 0.6) / 0.4 : 1; ctx.translate(p.x, yy); ctx.rotate(p.rot * (1 - u)); ctx.scale(sc2, sc2);
    ctx.lineWidth = fs * 0.2; ctx.strokeStyle = '#fff7e3'; ctx.strokeText(p.txt, 0, 0); ctx.fillStyle = p.col; ctx.fillText(p.txt, 0, 0);
    ctx.restore();
  }
  drawFx(fs);
}

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
  update(dt); draw(); hud();
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
function hoverFlick(e) {
  if (e.pointerType === 'touch' || e.buttons !== 0 || S.over || S.paused || S.cd > 0) { hov.length = 0; return; }
  var p = rel(e); hov.push(p);
  while (hov.length && p.t - hov[0].t > 150) hov.shift();
  if (p.t < hovLock || hov.length < 3) return;
  var a = hov[0], dx = p.x - a.x, dy = p.y - a.y, dtm = Math.max(16, p.t - a.t), spd = Math.hypot(dx, dy) / dtm * 1000 / H;
  if (-dy >= H * 0.1 && -dy > Math.abs(dx) * 0.6 && spd >= 1.5 && a.y >= H * 0.45) {
    var po = pouchPos(); hov.length = 0; hovLock = p.t + 350;
    throwAt(po.x, po.y, dx, dy, spd, null);
  }
}
cv.addEventListener('pointermove', function (e) {
  if (!drag) { hoverFlick(e); return; }
  if (e.pointerId !== drag.id) return;
  drag.pts.push(rel(e)); if (drag.pts.length > 10) drag.pts.shift();
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
function toTitle() { updateContinue(); halt(); S.paused = false; gameEl.hidden = true; titleEl.hidden = false; $('bPlay').focus(); }
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
  cost: { au: 4, ar: [5, 8, 12], ap: [6, 10] },
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
  qa = window.__pd = { bot: false, sv: function () { return sv; }, scale: function (v) { timeScale = v; }, get S() { return S; }, get penguins() { return penguins; },
    give: function (k) { spawnPU(k); }, award: award, collect: function () { collectPU(); collectTro(false); }, tap: function (x, y) { var o = pouchPos(); throwAt(o.x, o.y, x - o.x, y - o.y, 1.5, { x: x, y: y }); } };
}
}());
