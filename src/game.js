/* Pineapple Defense: stage 1 (Sandy Snack Shore). Copyright (c) 2026 JNFoo. All rights reserved. */
(function () {
'use strict';
var $ = function (i) { return document.getElementById(i); };
var root = document.documentElement;
var titleEl = $('title'), gameEl = $('game'), cv = $('cv'), ctx = cv.getContext('2d');

/* ---------- settings ---------- */
var NWAVES = 8, WAVE_N = [4, 5, 6, 7, 8, 9, 10, 12];
var TAP_MIN = 0.03, FLICK_MIN = 0.025, COOLDOWN = 0.42;

/* ---------- layout and projection ---------- */
var W = 1, H = 1, DPR = 1, hy = 0, gy = 0, FW = 0, size0 = 100, bg = null;
function sc(p) { return 0.16 + 0.84 * p; }
function px(xn, p) { return W / 2 + xn * FW * sc(p); }
function py(p) { return hy + (gy - hy) * p; }
function psz(p) { return size0 * sc(p); }

/* ---------- sprites ---------- */
var SZ = 384, IMG = { pa: {}, rh: {}, ad: {} }, PROP = {}, assets = null;
var VARS = ':root{--pa-hi:#ffeaa0;--pa-mid:#f8bd1c;--pa-lo:#a85a07;--pg-hi:#6b6aab;--pg-mid:#383767;--pg-lo:#171538;--ad-hi:#6a6677;--ad-mid:#34303f;--ad-lo:#15121d}.m-o,.m-grin,.m-pout{display:none}';
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
function spriteSvg(markup, mood) {
  var clean = markup.replace(/\sstyle="transform[^"]*"/g, '');
  return clean.replace(/^[\s\S]*?<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + SZ + '" height="' + SZ + '"><style>' + VARS + MOOD[mood] + '</style>');
}
function loadAssets() {
  if (assets) return assets;
  var src = {
    pa: $('pa').querySelector('svg').outerHTML,
    rh: $('pg').querySelector('svg').outerHTML,
    ad: $('spr-ad').innerHTML
  };
  var jobs = [];
  Object.keys(src).forEach(function (k) {
    Object.keys(MOOD).forEach(function (m) {
      jobs.push(toImage(spriteSvg(src[k], m), { w: SZ, h: SZ }).then(function (c) { IMG[k][m] = c; }));
    });
  });
  jobs.push(toImage($('spr-palm').innerHTML, { w: 400, h: 520 }).then(function (c) { PROP.palm = c; }));
  jobs.push(toImage($('spr-sign').innerHTML, { w: 420, h: 490 }).then(function (c) { PROP.sign = c; }));
  jobs.push(document.fonts && document.fonts.load ? document.fonts.load('800 32px "Bricolage Grotesque"') : Promise.resolve());
  assets = Promise.all(jobs);
  return assets;
}

/* ---------- state ---------- */
var S, penguins, shots, bits, pops;
var calm = false, running = false, raf = 0, last = 0, timeScale = 1, qLevel = 0;
var even = new EvenDt();
var gov = new QualityGovernor({ levels: 3, onChange: function (l) { qLevel = l; resize(); } });

function newState() {
  S = { wave: 0, spawned: 0, toSpawn: 0, spawnT: 0, mode: 'intro', modeT: 0, cheer: 100, golden: 0, bumps: 0,
        cd: 0, t: 0, wob: 0, thrown: false, over: false, paused: false, id: 0, lastLane: -1 };
  penguins = []; shots = []; bits = []; pops = [];
}

/* ---------- HUD ---------- */
var elWave = $('waveTxt'), elGold = $('goldTxt'), elCheer = $('cheerFill'), elReady = $('ready'), elBanner = $('banner'), elHint = $('hint');
var shown = { wave: '', gold: -1, cheer: -1, ready: -1 };
function hud() {
  var w = 'Wave ' + Math.max(1, S.wave) + ' / ' + NWAVES;
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
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.lineCap = 'round';
  for (var i = 0; i < 9; i++) { var wx = W * (0.08 + i * 0.115), wy = hy + H * (0.012 + (i % 3) * 0.008); g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 12, wy - 4, wx + 24, wy); g.stroke(); }
  var gd = g.createLinearGradient(0, hy + H * 0.035, 0, H);
  gd.addColorStop(0, '#eef4f6'); gd.addColorStop(0.2, '#f3efdc'); gd.addColorStop(0.55, '#ecdcae'); gd.addColorStop(1, '#e0c688');
  g.fillStyle = gd; g.fillRect(0, hy + H * 0.035, W, H);
  g.strokeStyle = 'rgba(120,90,40,.08)'; g.lineWidth = 2;
  for (var l = -3; l <= 2; l++) {
    var xn = (l + 0.5) * 0.4;
    g.beginPath(); g.moveTo(px(xn, 0.06), py(0.06)); g.lineTo(px(xn, 1.05), py(1.05)); g.stroke();
  }
  if (PROP.palm) { var ph = Math.min(H * 0.3, W * 0.45), pw = ph * 100 / 130; g.drawImage(PROP.palm, W * 0.015, hy + H * 0.075 - ph * 0.954, pw, ph); }
  if (PROP.sign) {
    var sh = Math.min(H * 0.3, W * 0.45), sw = sh * 84 / 98, sxx = W - sw - W * 0.015, syy = hy + H * 0.085 - sh * 0.959;
    g.drawImage(PROP.sign, sxx, syy, sw, sh);
    g.font = '800 ' + (sw * 9.6 / 84) + 'px "Bricolage Grotesque",sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = sw * 2 / 84; g.strokeStyle = '#fff7e3'; g.fillStyle = '#2f6f9f';
    g.strokeText('BRRR IS BEST!', sxx + sw * 0.5, syy + sh * 0.1327);
    g.fillText('BRRR IS BEST!', sxx + sw * 0.5, syy + sh * 0.1327);
  }
  var vg = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.45, W / 2, H * 0.55, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(42,18,13,0)'); vg.addColorStop(1, 'rgba(42,18,13,.2)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
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
function popText(x, y, txt, col) { pops.push({ x: x, y: y, txt: txt, col: col, t: 0, ttl: 0.95, rot: (Math.random() - 0.5) * 0.4 }); }
var HIT_WORDS = ['hee hee!', 'tee hee!', 'oh my!', 'wheee!', 'ooh!'];

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
  S.wob = 1; S.bumps++; S.cheer = Math.max(0, S.cheer - 12);
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
    pg.p += pg.v * dt;
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
function penCenter(pg) { var s = psz(pg.p); return { x: px(pg.xn, pg.p), y: py(pg.p) - s * 0.42, s: s }; }
function throwAt(ox, oy, dx, dy, spd, tapPoint) {
  if (S.cd > 0 || S.over || S.paused) return;
  var len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
  var best = null, bs = 1e9, ttf = 0.6;
  for (var i = 0; i < penguins.length; i++) {
    var pg = penguins[i]; if (pg.st !== 'walk') continue;
    var c = penCenter(pg), wx = c.x - ox, wy = c.y - oy, t = wx * dx + wy * dy;
    if (t <= 0) continue;
    var perp = Math.abs(wx * dy - wy * dx);
    if (perp > c.s * 0.9) continue;
    var score = perp / c.s - 0.25 * pg.p;
    if (score < bs) { bs = score; best = pg; }
  }
  var xE, yE, pEnd;
  if (best) {
    ttf = 0.42 + 0.38 * (1 - best.p);
    pEnd = Math.min(0.94, best.p + best.v * ttf);
    xE = px(best.xn, pEnd); yE = py(pEnd) - psz(pEnd) * 0.42;
  } else {
    pEnd = tapPoint ? Math.max(0.12, Math.min(0.92, (tapPoint.y - hy) / (gy - hy))) : Math.max(0.25, Math.min(0.92, 0.25 + (spd - 0.8) * 0.2));
    yE = py(pEnd) - psz(pEnd) * 0.3;
    var tt = (yE - oy) / dy; xE = ox + dx * tt;
    ttf = 0.42 + 0.38 * (1 - pEnd);
  }
  S.cd = COOLDOWN; S.thrown = true;
  elHint.hidden = true;
  shots.push({ x0: ox, y0: oy, xE: xE, yE: yE, pEnd: pEnd, t: 0, T: ttf, arc: H * (0.14 + 0.2 * (1 - pEnd)), spin: (Math.random() < 0.5 ? -1 : 1) * 7, ph: 0, aim: best ? best.id : 0 });
}
function landShot(s) {
  var best = null, bd = 0.55;
  for (var i = 0; i < penguins.length; i++) {
    var pg = penguins[i]; if (pg.st !== 'walk') continue;
    var c = penCenter(pg), d = Math.hypot(c.x - s.xE, c.y - s.yE) / c.s;
    if (d < bd) { bd = d; best = pg; }
  }
  if (best) { var cc = penCenter(best); hitPenguin(best, cc.x, cc.y - cc.s * 0.2); return true; }
  burst(s.xE, s.yE + psz(s.pEnd) * 0.3, 5, PINE_COL);
  return false;
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
function startStage() {
  newState();
  S.t = 0; hud();
  elHint.hidden = false; elBanner.hidden = true;
  beginWave(1);
}
function endStage(win) {
  S.over = true;
  if (win) {
    burst(W / 2, H * 0.3, 60, PINE_COL.concat(['#ff6f86', '#8fc6e4']));
    showCard('Stage 1 clear!', 'You collected ' + S.golden + ' Golden Pineapples. Stage 2 and the upgrade shop are coming soon!', 'Play again', startAgain);
  } else {
    showCard('The stand needs a break!', 'Everyone is giggling. Want to try again?', 'Try again', startAgain);
  }
}
function waveClear() {
  S.mode = 'clear'; S.modeT = 0;
  S.cheer = Math.min(100, S.cheer + 15);
  S.golden += 1 + (S.bumps === 0 ? 1 : 0);
  if (S.wave >= NWAVES) { banner('All clear!', 1800); }
  else banner(S.bumps === 0 ? 'Perfect wave!' : 'Wave clear!', 1300);
}

/* ---------- update ---------- */
function update(dt) {
  S.t += dt; S.cd = Math.max(0, S.cd - dt); S.wob = Math.max(0, S.wob - dt * 1.6);
  var i;
  for (i = bits.length - 1; i >= 0; i--) {
    var b = bits[i]; b.t += dt; b.vy += 620 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
    if (b.t > b.ttl) bits.splice(i, 1);
  }
  for (i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > pops[i].ttl) pops.splice(i, 1); }
  if (S.over) return;
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
    if (S.wave >= NWAVES) endStage(true); else beginWave(S.wave + 1);
  }
  if (qa && qa.bot && S.cd <= 0) {
    var tgt = null;
    for (i = 0; i < penguins.length; i++) if (penguins[i].st === 'walk' && (!tgt || penguins[i].p > tgt.p)) tgt = penguins[i];
    if (tgt) { var c = penCenter(tgt); throwAt(W / 2, H * 0.93, c.x - W / 2, c.y - H * 0.93, 1.5, { x: c.x, y: c.y }); }
  }
}

/* ---------- drawing ---------- */
function star(g, x, y, r) {
  g.beginPath();
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.38 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fillStyle = '#ffd23f'; g.strokeStyle = '#fff7e3'; g.lineWidth = Math.max(1, r * 0.22); g.lineJoin = 'round'; g.stroke(); g.fill();
}
function drawShadow(x, y, w, a) {
  ctx.fillStyle = 'rgba(42,18,13,' + (0.26 * a) + ')';
  ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.22, 0, 0, 6.3); ctx.fill();
}
function drawPenguin(pg) {
  var s = psz(pg.p), x = px(pg.xn, pg.p), y = py(pg.p);
  ctx.save(); ctx.globalAlpha = pg.a;
  drawShadow(x, y - s * 0.02, s * 0.36, 1);
  var rot = 0, hop = 0, sx = 1, sy = 1, tt = calm ? 0 : S.t;
  if (pg.st === 'walk' || (pg.st === 'bump' && pg.t > 0.9)) { if (!calm) { rot = Math.sin(pg.ph) * 0.1; hop = Math.abs(Math.sin(pg.ph)) * s * 0.03; } }
  else if (pg.st === 'hit') { rot = calm ? 0 : Math.sin(pg.t * 30) * 0.05; }
  else if (pg.st === 'slide') { sx = 1.15; sy = 0.62; rot = 0.1; }
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
    size = (psz(1.02) + (psz(sh.pEnd) - psz(1.02)) * u) * 0.5 * (1 + 0.35 * Math.sin(Math.PI * u));
    rot = sh.spin * sh.t;
    var gyy = sh.y0 + (py(sh.pEnd) - sh.y0) * u;
    drawShadow(x, gyy, size * 0.3, 0.6);
  } else {
    u = Math.min(1, sh.t / sh.T);
    x = sh.xE + (sh.rx - sh.xE) * u; y = sh.yE + (sh.ry - sh.yE) * u - 4 * H * 0.04 * u * (1 - u);
    size = psz(sh.pEnd) * 0.5; a = 1 - u; rot = sh.spin * (sh.T * 0.3 + sh.t * 1.5);
  }
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
  if (IMG.pa.wow) ctx.drawImage(IMG.pa.wow, -size / 2, -size / 2, size, size);
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
  var ps = Math.min(h * 1.05, W * 0.2), xs = [W * 0.14, W * 0.5, W * 0.86];
  if (IMG.pa.happy) for (i = 0; i < 3; i++) {
    var j = calm ? 0 : Math.sin(S.t * 40 + i) * 5 * S.wob;
    ctx.drawImage(IMG.pa.happy, xs[i] - ps / 2, y0 - ps * 0.8 + j, ps, ps);
  }
  ctx.restore();
}
function drawCloud(x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.2, s * 0.9, s * 0.2, 0, 0, 6.3); ctx.arc(x - s * 0.35, y, s * 0.3, 0, 6.3); ctx.arc(x + s * 0.05, y - s * 0.12, s * 0.38, 0, 6.3); ctx.arc(x + s * 0.5, y + s * 0.02, s * 0.25, 0, 6.3); ctx.fill();
}
var TXT_FONT = '800 24px "Bricolage Grotesque",sans-serif';
function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.drawImage(bg, 0, 0, W, H);
  var drift = calm ? 0 : (S.t * 6) % (W * 1.4);
  var cl = Math.min(W, H) * 0.12;
  drawCloud(((W * 0.2 + drift) % (W * 1.4)) - W * 0.2, hy * 0.45, cl);
  drawCloud(((W * 0.7 + drift * 0.6) % (W * 1.4)) - W * 0.2, hy * 0.25, cl * 0.8);
  var list = penguins.slice().sort(function (a, b) { return a.p - b.p; }), i;
  for (i = 0; i < list.length; i++) drawPenguin(list[i]);
  drawStand();
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
  var p = rel(e); drag = { id: e.pointerId, sx: p.x, sy: p.y, t0: p.t, pts: [p] };
  e.preventDefault();
});
cv.addEventListener('pointermove', function (e) {
  if (!drag || e.pointerId !== drag.id) return;
  drag.pts.push(rel(e)); if (drag.pts.length > 10) drag.pts.shift();
});
cv.addEventListener('pointercancel', function () { drag = null; });
cv.addEventListener('pointerup', function (e) {
  if (!drag || e.pointerId !== drag.id) return;
  var d = drag; drag = null;
  var end = rel(e), vx = end.x - d.sx, vy = end.y - d.sy, len = Math.hypot(vx, vy), m = Math.min(W, H);
  var oy = H * 0.93, ox;
  if (len < TAP_MIN * m) {
    if (end.y > H * 0.88 || end.y < hy * 0.7) return;
    ox = W / 2 + (end.x - W / 2) * 0.5;
    throwAt(ox, oy, end.x - ox, end.y - oy, 1.5, { x: end.x, y: end.y });
    return;
  }
  if (vy > -FLICK_MIN * H) return;
  var old = d.pts[0], i;
  for (i = d.pts.length - 1; i >= 0; i--) { if (end.t - d.pts[i].t >= 60) { old = d.pts[i]; break; } }
  var dx = end.x - old.x, dy = end.y - old.y;
  if (dy > -2) { dx = vx; dy = vy; old = { t: d.t0 }; }
  var dur = Math.max(30, end.t - old.t), spd = Math.hypot(dx, dy) / dur * 1000 / H;
  ox = W / 2 + (d.sx - W / 2) * 0.55;
  throwAt(ox, oy, dx, dy, spd, null);
});
cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* ---------- cards, pause, screens ---------- */
var gcw = $('gcw');
function showCard(title, body, btn1, fn1, noTitleBtn) {
  $('gTitle').textContent = title; $('gBody').textContent = body;
  var b1 = $('gBtn1'); b1.textContent = btn1; b1.onclick = function () { hideCard(); fn1(); };
  $('gBtn2').onclick = function () { hideCard(); toTitle(); };
  gcw.hidden = false; b1.focus();
}
function hideCard() { gcw.hidden = true; }
function startAgain() { startStage(); run(); }
function pause() {
  if (S.paused || S.over || !running) return;
  S.paused = true; halt();
  showCard('Paused', 'Take your time.', 'Resume', resume);
  $('gBtn2').textContent = 'Back to title';
}
function resume() { S.paused = false; run(); }
$('bPause').addEventListener('click', pause);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gameEl.hidden === false && !S.paused) pause(); });
document.addEventListener('visibilitychange', function () { if (document.hidden && gameEl.hidden === false) pause(); });
function toTitle() { halt(); S.paused = false; gameEl.hidden = true; titleEl.hidden = false; $('bPlay').focus(); }
$('gBtn2').textContent = 'Title';
window.addEventListener('resize', function () { if (gameEl.hidden === false) { resize(); if (!running) { draw(); } } });

function start() {
  titleEl.hidden = true; gameEl.hidden = false;
  loadAssets().then(function () { resize(); startStage(); run(); });
}
$('bPlay').addEventListener('click', start);

/* test hook, only with #qa in the address */
var qa = null;
if (location.hash === '#qa') {
  qa = window.__pd = { bot: false, scale: function (v) { timeScale = v; }, get S() { return S; }, get penguins() { return penguins; },
    tap: function (x, y) { throwAt(W / 2, H * 0.93, x - W / 2, y - H * 0.93, 1.5, { x: x, y: y }); } };
}
}());
