/* ---------- shop extras (gulls, paper umbrellas, air raid), run streak and challenges, fanfare. Copyright (c) 2026 JNFoo. All rights reserved. ---------- */
var GULL_P = [0, 0.5, 0.8, 1], RAID_N = [0, 1, 2], RUN_MAX = 2, RUN_STEP = 1.1;
function runK() { return Math.min(RUN_MAX, Math.pow(RUN_STEP, sv.run | 0)); }
function runPct() { return Math.round((runK() - 1) * 100); }

/* ---------- trophies: the first ten live in one bit field, the newer ones in a second ---------- */
var ACH2 = [
  { n: 'Gull Pals', d: 'A gull swoops in and snatches a fish.' },
  { n: 'Brolly Boss', d: 'Fling a penguin with a paper drink umbrella.' },
  { n: 'Air Raid!', d: 'Call in an air raid.' },
  { n: 'Carpet Bombing', d: 'Hit 4 penguins with one air raid.' },
  { n: 'Team Spirit', d: 'Chain a combo with both slingshots.' },
  { n: 'Combo Master', d: 'Reach a 6-hit combo.' },
  { n: 'Whole Shebang', d: 'Clear all five stages in one run.' },
  { n: 'Faster Fun', d: 'Win a run when penguins are 30% faster.' },
  { n: 'Top Speed', d: 'Win a run when penguins are nearly twice as fast.' },
  { n: 'Challenger', d: 'Finish a run challenge.' },
  { n: 'Grand Finale', d: 'End Pineapple Roll on a 100.' }
];
function achAll() { return ACH.concat(ACH2); }
function hasAch(i) { return i < 10 ? (sv.ach >> i) & 1 : (sv.ac2 >> (i - 10)) & 1; }
function setAch(i) { if (i < 10) sv.ach |= 1 << i; else sv.ac2 |= 1 << (i - 10); }
function cupsText() { return (popcount(sv.ach) + popcount(sv.ac2)) + '/' + (ACH.length + ACH2.length); }
/* a trophy handed over with no table pickup (end of a run, end of a bonus game); returns its name when it is new */
function quietAward(i) { if (hasAch(i)) return ''; setAch(i); sv.bank = Math.min(999999, sv.bank + 10); kit.save(sv); return achAll()[i].n; }

/* ---------- run challenges: one per run, scored when a stage is won ---------- */
var CHAL = [
  { n: 'Spotless Shore', d: 'Win stage 1 without a single bump.', st: 1, ok: function () { return S.allBumps === 0; } },
  { n: 'Combo Crazy', d: 'Reach a 5-hit combo in stage 2.', st: 2, ok: function () { return S.maxCmb >= 5; } },
  { n: 'Treasure Hunter', d: 'Find both secret spots in stage 3.', st: 3, ok: function () { return (S.zones & 3) === 3; } },
  { n: 'Classic Cool', d: 'Win stage 4 throwing only classic pineapples.', st: 4, ok: function () { return !S.fancy; } },
  { n: 'Splash Hero', d: 'Hit 4 penguins with one splash.', st: 0, ok: function () { return S.maxSp >= 4; } },
  { n: 'Big Haul', d: 'Collect 150 Golden Pineapples in stage 5.', st: 5, ok: function () { return S.golden >= 150; } },
  { n: 'Cozy Cheer', d: 'Win stage 3 with the cheer meter at 80 or more.', st: 3, ok: function () { return S.cheer >= 80; } },
  { n: 'Speedy Stage', d: 'Win stage 2 in under four minutes.', st: 2, ok: function () { return S.t < 240; } }
];
function chal() { return CHAL[(sv.run | 0) % CHAL.length]; }
/* called when a stage is won, before the card; returns extra card text */
function extrasWin(st, last) {
  var out = '', c = chal(), nm;
  if (!sv.cd && (c.st === 0 || c.st === st) && c.ok()) {
    sv.cd = 1; sv.bank = Math.min(999999, sv.bank + 100); award(19); out += ' Challenge done: ' + c.n + '! +100 Golden Pineapples.';
  }
  if (last) {
    var k = runK(); award(16); if (k >= 1.3) award(17); if (k >= 1.9) award(18);
    sv.run = Math.min(99, (sv.run | 0) + 1); sv.cd = 0;
    out += ' Run ' + sv.run + ' complete! Next run the penguins are ' + runPct() + '% faster' + (runK() >= RUN_MAX ? ' (the top speed).' : '.') + ' New challenge: ' + chal().d;
  }
  return out;
}
function runToast() {
  var c = chal();
  if (c.st === 0 || c.st === S.stage) toast('Challenge: ' + c.d);
  else if (sv.run > 0) toast('Run ' + (sv.run + 1) + ': penguins ' + runPct() + '% faster');
}

/* ---------- gulls: they swoop across the screen and snatch a falling fish ---------- */
function fishXY(f) {
  var s = psz(f.p), gx = px(f.xn, f.p), gy = py(f.p), u = Math.min(1, f.t / f.T), e = u < 0.85 ? u : 0.85 + (u - 0.85) * 0.7, top = -s * 2.4, sw = calm ? 0 : Math.sin(f.t * 2.3 + f.hop);
  return { x: gx + sw * s * 0.28 * (1 - u * 0.8), y: top + (gy - s * 0.12 - top) * e, s: s };
}
function gullFor(f) {
  var ch = GULL_P[sv.gu | 0]; if (!ch || Math.random() > ch) return;
  var side = Math.random() < 0.5 ? -1 : 1;
  S.gulls.push({ f: f, side: side, t: 0, T: 1.5, st: 'in', x: 0, y: 0, x0: side < 0 ? -W * 0.14 : W * 1.14, y0: H * (0.1 + Math.random() * 0.1), fl: Math.random() * 6, hold: false });
}
function updateGulls(dt) {
  var i, g, u, e, tg, s;
  for (i = S.gulls.length - 1; i >= 0; i--) {
    g = S.gulls[i]; g.t += dt; g.fl += dt * 13; s = Math.max(30, W * 0.085);
    if (g.st === 'in') {
      var ix = S.fish.indexOf(g.f);
      if (ix < 0 || g.f.st !== 'fall') { g.st = 'out'; g.t = 0; g.sx = g.x || g.x0; g.sy = g.y || g.y0; continue; }
      tg = fishXY(g.f); u = Math.min(1, g.t / g.T); e = u * u * (3 - 2 * u);
      g.x = g.x0 + (tg.x - g.x0) * e; g.y = g.y0 + (tg.y - g.y0) * e - Math.sin(u * 3.14) * H * 0.05;
      if (g.t >= g.T) {
        S.fish.splice(ix, 1); g.hold = true; g.st = 'out'; g.t = 0; g.sx = g.x; g.sy = g.y;
        burst(g.x, g.y, 8, ['#ffffff', '#dbe6ee']); sparkBurst(g.x, g.y, 6, ['#fff7e3', '#8fd8ff']); popText(g.x, g.y - s * 0.7, 'Squawk!', '#2f6fa0', 1);
        rings.push({ x: g.x, y: g.y, t: 0, ttl: 0.5, r: s * 0.9, c: '255,255,255' }); award(10);
      }
    } else {
      u = g.t / 1.5; g.x = g.sx - g.side * W * 1.3 * u * u - g.side * W * 0.1 * u; g.y = g.sy - H * 0.14 * u - Math.sin(g.t * 5) * 3;
      if (u >= 1) S.gulls.splice(i, 1);
    }
  }
}
function drawGull(x, y, s, dir, fl, fish) {
  var w = Math.sin(fl), k, c = Math.max(1, s * 0.035);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.fillStyle = 'rgba(0,0,0,.0)';
  for (k = 0; k < 2; k++) {
    ctx.save(); ctx.translate(-s * 0.04 + k * s * 0.1, -s * 0.1); ctx.rotate(-0.35 - (k ? -1 : 1) * w * 0.75 - (k ? 0.25 : 0));
    ctx.fillStyle = k ? '#c4d0da' : '#eef3f7'; ctx.strokeStyle = '#7e93a6'; ctx.lineWidth = c; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s * 0.18, -s * 0.62, -s * 0.78, -s * 0.52); ctx.quadraticCurveTo(-s * 0.46, -s * 0.18, -s * 0.12, s * 0.06); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2b3b4c'; ctx.beginPath(); ctx.moveTo(-s * 0.78, -s * 0.52); ctx.quadraticCurveTo(-s * 0.62, -s * 0.5, -s * 0.52, -s * 0.34); ctx.lineTo(-s * 0.7, -s * 0.28); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (k === 0) {
      var bg = gk('gull' + Math.round(s), function () { var b = ctx.createLinearGradient(0, -s * 0.2, 0, s * 0.22); b.addColorStop(0, '#ffffff'); b.addColorStop(1, '#cfdbe5'); return b; });
      ctx.fillStyle = bg; ctx.strokeStyle = '#7e93a6'; ctx.lineWidth = c; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.2, 0, 0, 6.3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e2eaf0'; ctx.beginPath(); ctx.moveTo(-s * 0.36, -s * 0.04); ctx.lineTo(-s * 0.66, -s * 0.12); ctx.lineTo(-s * 0.62, s * 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s * 0.4, -s * 0.12, s * 0.15, 0, 6.3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,140,150,.5)'; ctx.beginPath(); ctx.ellipse(s * 0.38, -s * 0.05, s * 0.06, s * 0.035, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.ellipse(-s * 0.08, -s * 0.1, s * 0.22, s * 0.04, -0.08, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#ffb02e'; ctx.strokeStyle = '#b86e00'; ctx.beginPath(); ctx.moveTo(s * 0.52, -s * 0.17); ctx.lineTo(s * 0.8, -s * 0.09); ctx.lineTo(s * 0.52, -s * 0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d6372a'; ctx.beginPath(); ctx.arc(s * 0.76, -s * 0.07, s * 0.022, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#1c1410'; ctx.beginPath(); ctx.arc(s * 0.45, -s * 0.15, s * 0.034, 0, 6.3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 0.46, -s * 0.16, s * 0.012, 0, 6.3); ctx.fill();
      ctx.strokeStyle = '#ff9a3a'; ctx.lineWidth = c * 1.2; ctx.beginPath(); ctx.moveTo(-s * 0.04, s * 0.16); ctx.lineTo(-s * 0.06, s * 0.3); ctx.moveTo(s * 0.12, s * 0.16); ctx.lineTo(s * 0.12, s * 0.3); ctx.stroke();
    }
  }
  ctx.restore();
  if (fish) drawFishBody(x + dir * s * 0.82, y + s * 0.13, s * 0.5, Math.sin(fl * 0.8), dir > 0 ? 0.25 : Math.PI - 0.25, true);
}
function drawGulls() {
  var i, g, s = Math.max(30, W * 0.085), dir;
  for (i = 0; i < S.gulls.length; i++) {
    g = S.gulls[i]; if (!g.x && !g.y) continue;
    dir = g.st === 'in' ? (g.side < 0 ? 1 : -1) : (g.side < 0 ? 1 : -1);
    drawShadow(g.x, Math.min(H * 0.92, g.y + s * 1.6), s * 0.28, 0.12);
    drawGull(g.x, g.y, s, dir, g.fl, g.hold);
  }
}

/* ---------- paper drink umbrellas: a last resort that flings a penguin who is about to knock the cheer down ---------- */
var UMB_COL = [['#ff6fa8', '#fff4f8', '#b8326a'], ['#3fc1b8', '#f2fffd', '#1f7f78'], ['#ffd23f', '#fffbe8', '#b88a0a']];
function umbrellaSave(pg) {
  if (!(S.umL > 0)) return false;
  var x = px(pg.xn, 0.95), y = py(0.95), c = S.umL % 3;
  S.umL--; S.umb.push({ x: x, y: y, t: 0, c: c });
  pg.st = 'fling'; pg.t = 0; pg.mood = 'wow'; pg.p = 0.93; pg.ev = 0; pg.side = Math.random() < 0.5 ? -1 : 1;
  burst(x, y - psz(0.95) * 0.3, 16, ['#ffffff'].concat(UMB_COL[c].slice(0, 2))); sparkBurst(x, y - psz(0.95) * 0.5, 14, [UMB_COL[c][0], '#fff7e3', '#ffd23f']);
  rings.push({ x: x, y: y - psz(0.95) * 0.3, t: 0, ttl: 0.6, r: psz(0.95) * 1.5, c: '255,255,255' });
  popText(x, y - psz(0.95) * 0.9, 'Brolly!', UMB_COL[c][2], 1);
  curSrc = 0; cmbHit(x, y - psz(0.95) * 0.4);
  reward(PAY[pg.kind] || 1, x, y - psz(0.95) * 0.5, pg.kind === 'rh' ? 0 : 1);
  award(11); S.shk = Math.max(S.shk, 0.4);
  return true;
}
function updateUmb(dt) { var i; for (i = S.umb.length - 1; i >= 0; i--) { S.umb[i].t += dt; if (S.umb[i].t > 1.1) S.umb.splice(i, 1); } }
/* canopy (open 0..1) with a stick; (x, y) is the foot of the stick */
function drawBrolly(x, y, r, open, col, rot) {
  var sh = r * 1.5 * (0.3 + 0.7 * open), rx = r * open, ry = r * 0.62 * open, n = 8, i, a0, a1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.strokeStyle = '#a8793e'; ctx.lineWidth = Math.max(2, r * 0.07); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -sh); ctx.stroke();
  ctx.strokeStyle = '#d9a863'; ctx.lineWidth = Math.max(1, r * 0.025); ctx.beginPath(); ctx.moveTo(-r * 0.015, 0); ctx.lineTo(-r * 0.015, -sh); ctx.stroke();
  if (open > 0.04) {
    var top = -sh;
    for (i = 0; i < n; i++) {
      a0 = Math.PI + i * Math.PI / n; a1 = Math.PI + (i + 1) * Math.PI / n;
      ctx.fillStyle = i % 2 ? col[1] : col[0]; ctx.strokeStyle = col[2]; ctx.lineWidth = Math.max(1, r * 0.03); ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, top + ry * 0.35);
      ctx.lineTo(Math.cos(a0) * rx, top + ry * 0.35 + Math.sin(a0) * ry * 0.18 + ry * 0.55);
      ctx.quadraticCurveTo((Math.cos(a0) + Math.cos(a1)) * rx * 0.5 * 1.05, top + ry * 0.35 + ry * 0.78, Math.cos(a1) * rx, top + ry * 0.35 + Math.sin(a1) * ry * 0.18 + ry * 0.55);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    /* the dome on top of the scalloped hem */
    var dg = ctx.createLinearGradient(0, top - ry * 0.5, 0, top + ry * 0.9); dg.addColorStop(0, 'rgba(255,255,255,.55)'); dg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, top + ry * 0.9, rx, ry * 1.25, 0, Math.PI, 0); ctx.closePath(); ctx.clip();
    for (i = 0; i < n; i++) {
      a0 = Math.PI + i * Math.PI / n; a1 = Math.PI + (i + 1) * Math.PI / n;
      ctx.fillStyle = i % 2 ? col[1] : col[0]; ctx.beginPath(); ctx.moveTo(0, top - ry * 0.35); ctx.lineTo(Math.cos(a0) * rx * 1.05, top + ry * 0.9 + Math.sin(a0) * ry * 1.3); ctx.lineTo(Math.cos(a1) * rx * 1.05, top + ry * 0.9 + Math.sin(a1) * ry * 1.3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = col[2]; ctx.lineWidth = Math.max(1, r * 0.025); ctx.stroke();
    }
    ctx.fillStyle = dg; ctx.fillRect(-rx, top - ry * 1.5, rx * 2, ry * 3); ctx.restore();
    ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#b88a0a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, top - ry * 0.3, r * 0.06, 0, 6.3); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
/* the open canopy is painted once per colour and size; opening is a scale about the foot of the stick */
var BROLLY = {};
function drawBrollyCached(x, y, r, open, ci, rot, alpha) {
  var key = ci + 'x' + Math.round(r) + 'x' + DPR, c = BROLLY[key], g, c0, pw = Math.ceil(r * 2.5), ph = Math.ceil(r * 2.9), pa = ctx.globalAlpha;
  if (!c) {
    if (Object.keys(BROLLY).length > 9) BROLLY = {};
    c = BROLLY[key] = document.createElement('canvas'); c.width = Math.ceil(pw * DPR); c.height = Math.ceil(ph * DPR); g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, pw / 2 * DPR, (ph - r * 0.2) * DPR);
    c0 = ctx; ctx = g; drawBrolly(0, 0, r, 1, UMB_COL[ci], 0); ctx = c0;
  }
  ctx.globalAlpha = pa * alpha; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(open, open);
  ctx.drawImage(c, -pw / 2, -(ph - r * 0.2), pw, ph); ctx.restore(); ctx.globalAlpha = pa;
}
var CLOSED = {};
function closedUmb(ci) {
  var key = ci + 'x' + W + 'x' + DPR, c = CLOSED[key], g, c0, L = W * 0.1, col = UMB_COL[ci];
  if (c) return c;
  if (Object.keys(CLOSED).length > 8) CLOSED = {};
  c = CLOSED[key] = document.createElement('canvas'); c.width = Math.ceil(L * 1.3 * DPR); c.height = Math.ceil(W * 0.05 * DPR); g = c.getContext('2d');
  g.setTransform(DPR, 0, 0, DPR, c.width / 2, c.height / 2); c0 = ctx; ctx = g;
  ctx.strokeStyle = '#a8793e'; ctx.lineWidth = Math.max(2, W * 0.006); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(L * 0.5, 0); ctx.stroke();
  ctx.fillStyle = col[0]; ctx.strokeStyle = col[2]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L * 0.5, 0); ctx.lineTo(-L * 0.12, -W * 0.014); ctx.lineTo(-L * 0.2, 0); ctx.lineTo(-L * 0.12, W * 0.014); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = col[1]; ctx.lineWidth = Math.max(1, W * 0.003); ctx.beginPath(); ctx.moveTo(L * 0.3, -W * 0.004); ctx.lineTo(-L * 0.1, -W * 0.01); ctx.moveTo(L * 0.3, W * 0.004); ctx.lineTo(-L * 0.1, W * 0.01); ctx.stroke();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(L * 0.52, 0, W * 0.006, 0, 6.3); ctx.fill();
  ctx = c0; return c;
}
function drawUmbrellas() {
  var i, u, o, e, s, al, op, wob;
  for (i = 0; i < S.umL; i++) {
    /* closed umbrellas lie on the table next to the sling: one small cached sprite per colour */
    var x = mx(0.345 + i * 0.04), y = H * 0.881, cu = closedUmb(i % 3);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.09 + i * 0.05); ctx.drawImage(cu, -cu.width / DPR / 2, -cu.height / DPR / 2, cu.width / DPR, cu.height / DPR); ctx.restore();
  }
  for (i = 0; i < S.umb.length; i++) {
    u = S.umb[i]; s = psz(0.95); op = u.t < 0.12 ? u.t / 0.12 : 1; op = op < 1 ? 1.18 * Math.sin(op * 1.4) : 1 + (calm ? 0 : Math.sin(u.t * 22) * 0.03 * (1 - u.t));
    al = u.t > 0.6 ? Math.max(0, 1 - (u.t - 0.6) / 0.5) : 1;
    drawBrollyCached(u.x, u.y, s * 1.05, Math.min(1.15, op), u.c, calm ? 0 : Math.sin(u.t * 16) * 0.05 * (1 - u.t), al);
  }
}

/* ---------- Air Raid: a line of classic pineapples falls across the lanes where the most penguins are ---------- */
function raidBand() {
  var best = 0.5, bn = -1, p, i, n, pg;
  for (p = 0.14; p <= 0.9; p += 0.03) {
    n = 0; for (i = 0; i < penguins.length; i++) { pg = penguins[i]; if (pg.st === 'walk' && Math.abs(pg.p - p) < 0.05) n++; }
    if (S.boss && S.boss.st === 'hold' && Math.abs(S.boss.p - p) < 0.06) n += 2;
    if (n > bn || (n === bn && p > best)) { bn = n; best = p; }
  }
  return bn <= 0 ? 0.5 : best;
}
function callRaid() {
  if (!S || S.over || S.paused || S.raid || !(S.raL > 0) || !(S.mode === 'run' || S.mode === 'boss')) return;
  var p = raidBand(), n = Math.max(7, Math.min(12, Math.round(1.9 * FW * sc(p) / (psz(p) * 0.85))));
  S.raL--; S.raid = { t: 0, p: p, n: n, hits: 0, bossHit: false, done: 0 };
  S.call = { txt: 'AIR RAID!', sub: 'Incoming pineapples!', tier: 4, t: 0, ttl: 1.6, n: 0 };
  S.gl = Math.max(S.gl, 0.45); S.shk = Math.max(S.shk, 0.5);
  award(12);
}
var RAID_WARN = 0.8, RAID_FALL = 0.55, RAID_GAP = 0.05;
function updateRaid(dt) {
  var r = S.raid; if (!r) return;
  r.t += dt;
  var i, t0, xn, x, y, c, pg, j, b, hit, s = psz(r.p);
  for (i = 0; i < r.n; i++) {
    t0 = RAID_WARN + i * RAID_GAP + RAID_FALL; if (r.t < t0 || (r.done >> i) & 1) continue;
    r.done |= 1 << i; xn = -0.95 + 1.9 * i / (r.n - 1); x = px(xn, r.p); y = py(r.p);
    burst(x, y - s * 0.1, 7, PINE_COL); if (!calm) rings.push({ x: x, y: y - s * 0.05, t: 0, ttl: 0.4, r: s * 0.7, c: '255,214,74' });
    curSrc = 2; hit = false;
    for (j = 0; j < penguins.length; j++) {
      pg = penguins[j]; if (pg.st !== 'walk') continue;
      if (Math.abs(pg.p - r.p) < 0.07 && Math.abs(px(pg.xn, pg.p) - x) < s * 0.62) { c = penCenter(pg); hitPenguin(pg, c.x, c.y - c.s * 0.2); if (pg.st === 'hit') r.hits++; }
    }
    b = S.boss;
    if (b && !r.bossHit && b.st === 'hold' && Math.abs(b.p - r.p) < 0.1 && Math.abs(px(b.xn, b.p) - x) < s * 0.7 * (b.big || 1)) { r.bossHit = true; hitBoss(1, penCenter(b)); }
  }
  if (r.t > RAID_WARN + r.n * RAID_GAP + RAID_FALL + 0.2) { if (r.hits >= 4) award(13); S.raid = null; }
}
function drawRaid() {
  var r = S.raid; if (!r) return;
  var i, t0, u, xn, x, yEnd = py(r.p), y, s = psz(r.p), sz = s * 0.6, a, im = IMG.pa.back, pulse = calm ? 1 : 0.6 + 0.4 * Math.sin(r.t * 22);
  if (r.t < RAID_WARN + r.n * RAID_GAP) {
    var xl = px(-1.05, r.p), xr = px(1.05, r.p), wa = r.t < RAID_WARN ? 1 : Math.max(0, 1 - (r.t - RAID_WARN) / (r.n * RAID_GAP));
    ctx.save(); ctx.globalAlpha = wa * pulse; ctx.lineCap = 'round'; ctx.setLineDash([s * 0.3, s * 0.18]); ctx.lineDashOffset = calm ? 0 : -r.t * 90;
    ctx.shadowColor = 'rgba(255,60,40,.9)'; ctx.shadowBlur = 12; ctx.strokeStyle = '#e0301f'; ctx.lineWidth = Math.max(6, s * 0.16); ctx.beginPath(); ctx.moveTo(xl, yEnd); ctx.lineTo(xr, yEnd); ctx.stroke();
    ctx.strokeStyle = '#fff7e3'; ctx.lineWidth = Math.max(1.5, s * 0.04); ctx.beginPath(); ctx.moveTo(xl, yEnd); ctx.lineTo(xr, yEnd); ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
    if (sv.hc) { ctx.strokeStyle = '#1c0f06'; ctx.lineWidth = Math.max(2, s * 0.05); ctx.setLineDash([s * 0.18, s * 0.5]); ctx.beginPath(); ctx.moveTo(xl, yEnd); ctx.lineTo(xr, yEnd); ctx.stroke(); ctx.setLineDash([]); }
    for (i = 0; i < r.n; i++) { xn = -0.95 + 1.9 * i / (r.n - 1); x = px(xn, r.p); ctx.fillStyle = 'rgba(224,48,31,.35)'; ctx.beginPath(); ctx.ellipse(x, yEnd, s * 0.22, s * 0.06, 0, 0, 6.3); ctx.fill(); }
    ctx.restore();
  }
  for (i = 0; i < r.n; i++) {
    t0 = RAID_WARN + i * RAID_GAP; u = (r.t - t0) / RAID_FALL; if (u <= 0 || u >= 1) continue;
    xn = -0.95 + 1.9 * i / (r.n - 1); x = px(xn, r.p); y = -sz + (yEnd - sz * 0.45 + sz) * u * u;
    ctx.strokeStyle = 'rgba(255,240,190,.55)'; ctx.lineWidth = Math.max(2, sz * 0.18); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - sz * 1.6 * u); ctx.lineTo(x, y); ctx.stroke();
    drawShadow(x, yEnd, sz * 0.3 * u, 0.5 * u);
    ctx.save(); ctx.translate(x, y); ctx.rotate(u * 5 * (i % 2 ? 1 : -1)); if (im) ctx.drawImage(im, -sz / 2, -sz / 2, sz, sz); ctx.restore();
  }
}

/* ---------- fanfare for the specials on the table ---------- */
function introFx(o, rgb, cols, label) {
  var i;
  for (i = 0; i < 3; i++) rings.push({ x: o.x, y: o.cy, t: -i * 0.12, ttl: 0.75, r: o.s * (1.1 + i * 0.55), c: rgb });
  sparkBurst(o.x, o.cy, 26, cols); burst(o.x, o.cy, 16, cols.concat(['#fff7e3']));
  popText(o.x, o.cy - o.s * 0.95, label, '#b86e00', 1);
  S.gl = Math.max(S.gl, 0.3);
}
/* a slow spinning halo with orbiting sparkles, brighter and bigger while the special is brand new */
var STARIMG = null;
function starImg() { if (!STARIMG) { STARIMG = document.createElement('canvas'); STARIMG.width = STARIMG.height = 64; star(STARIMG.getContext('2d'), 32, 32, 26); } return STARIMG; }
function drawHalo(o, rgb, t, age) {
  var fresh = Math.max(0, 1 - age / 1.2), i, a, rr = o.s * (1.15 + 0.5 * fresh), n = 10, rot = calm ? 0 : t * 0.8;
  ctx.save(); ctx.translate(o.x, o.cy); ctx.globalAlpha = 0.2 + 0.25 * fresh + (calm ? 0 : 0.05 * Math.sin(t * 5));
  ctx.fillStyle = 'rgb(' + rgb + ')'; ctx.beginPath();
  for (i = 0; i < n; i++) { a = rot + i * Math.PI * 2 / n; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.09) * rr * 1.5, Math.sin(a - 0.09) * rr * 1.5); ctx.lineTo(Math.cos(a + 0.09) * rr * 1.5, Math.sin(a + 0.09) * rr * 1.5); ctx.closePath(); }
  ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = '#fff7e3';
  if (!calm) for (i = 0; i < 4; i++) { a = t * 2.2 + i * 1.57; var sr = o.s * (0.05 + 0.03 * Math.sin(t * 6 + i)) * 1.15; ctx.drawImage(starImg(), Math.cos(a) * o.s * 0.62 - sr, Math.sin(a) * o.s * 0.5 - o.s * 0.05 - sr, sr * 2, sr * 2); }
  ctx.restore();
}

/* ---------- Lime Launcher: a small green helper for Champion fights. Its lime missiles pop the Champion's snowballs first; leftovers hit the Champion ---------- */
var LM = { cost: [80, 100, 150], rate: [4.2, 3.0], vol: [2, 4] };
var LIME_COL = ['#d8ff7a', '#a6e34a', '#5cb82a', '#fff7e3'], limeImg = null, LIME_TY = null, LIME_GAP = 0.14, LIME_T = 0.55;
function limeInt() { return LM.rate[sv.lm >= 2 ? 1 : 0] * (S.fx.zip > 0 ? 0.5 : 1); }
function limeVol() { return LM.vol[sv.lm >= 3 ? 1 : 0]; }
function limeGeom() { var s = slingGeom(); return { x: mx(0.255), base: s.base, f: s.f * 0.46, ps: s.f * 0.46 * 0.62 }; }
function limeReady() { var L = S.lm; return L.q > 0 ? 1 : 1 - Math.max(0, L.cd) / limeInt(); }
function limeTy() { return LIME_TY || (LIME_TY = { img: 'pa', size: 0.95, pic: limeSprite() }); }
/* the missile, drawn once and reused: nose up, a slice of lime in its window */
function limeSprite() {
  if (limeImg) return limeImg;
  var c = document.createElement('canvas'), g, bg, i, a, cy = 62; c.width = c.height = 128; g = c.getContext('2d');
  g.translate(64, 0); g.lineJoin = 'round'; g.strokeStyle = '#143d09'; g.lineWidth = 4;
  g.fillStyle = '#2f7a12';
  g.beginPath(); g.moveTo(-16, 80); g.quadraticCurveTo(-36, 88, -34, 116); g.lineTo(-14, 104); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(16, 80); g.quadraticCurveTo(36, 88, 34, 116); g.lineTo(14, 104); g.closePath(); g.fill(); g.stroke();
  bg = g.createLinearGradient(-20, 0, 20, 0); bg.addColorStop(0, '#9be03a'); bg.addColorStop(0.35, '#d8ff7a'); bg.addColorStop(0.72, '#7fcf3a'); bg.addColorStop(1, '#3f8f1d');
  g.fillStyle = bg; g.beginPath(); g.moveTo(-20, 100); g.lineTo(-20, 46); g.quadraticCurveTo(-20, 12, 0, 4); g.quadraticCurveTo(20, 12, 20, 46); g.lineTo(20, 100); g.quadraticCurveTo(0, 110, -20, 100); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#e9ffb0'; g.beginPath(); g.arc(0, cy, 13, 0, 6.3); g.fill(); g.stroke();
  g.fillStyle = '#8fd83e'; g.beginPath(); g.arc(0, cy, 9.5, 0, 6.3); g.fill();
  g.strokeStyle = '#e9ffb0'; g.lineWidth = 2; g.beginPath();
  for (i = 0; i < 6; i++) { a = i * Math.PI / 3; g.moveTo(0, cy); g.lineTo(Math.cos(a) * 9.5, cy + Math.sin(a) * 9.5); }
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,.62)'; g.beginPath(); g.ellipse(-10, 36, 3.5, 18, 0.06, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(20,61,9,.35)'; g.fillRect(-20, 88, 40, 5);
  limeImg = c; return c;
}
function limeTgt(m) {
  var b = S.boss, n, j, a, s;
  if (!b || b.st === 'slide' || b.st === 'gone') return { x: m.tx, y: m.ty };
  s = psz(b.p) * b.big; n = b.shield | 0;
  if (n > 0 && b.st === 'hold') { j = m.i % n; a = (calm ? 0 : b.sp * 0.9) + j * 6.283 / n; m.tx = px(b.xn, b.p) + Math.cos(a) * s * 0.66; m.ty = py(b.p) - s * 0.16 + Math.sin(a) * s * 0.09; }
  else { var c = penCenter(b); m.tx = c.x; m.ty = c.y - c.s * 0.05; }
  return { x: m.tx, y: m.ty };
}
function launchLime(i) {
  var po = pouchPos(limeGeom(), S.lm.a), c = penCenter(S.boss);
  S.ms.push({ i: i, t: 0, x0: po.x, y0: po.y, x: po.x, y: po.y, tx: c.x, ty: c.y, side: i % 2 ? 1 : -1, h: [], ang: -1.57 });
  burst(po.x, po.y, 4, LIME_COL);
}
function limeHit(m) {
  var b = S.boss, tp = limeTgt(m);
  curSrc = 1;
  if (b && b.st === 'hold') hitBoss(1, penCenter(b));
  burst(tp.x, tp.y, 9, LIME_COL); sparkBurst(tp.x, tp.y, 4, LIME_COL);
  if (!calm) rings.push({ x: tp.x, y: tp.y, t: 0, ttl: 0.35, r: psz(0.4) * 0.35, c: '166,227,74' });
}
function updateLime(dt) {
  var L = S.lm, b = S.boss, can, i, m, tp, u, uu, p, ta = 0, c, po;
  for (i = S.ms.length - 1; i >= 0; i--) {
    m = S.ms[i]; m.t += dt; tp = limeTgt(m); u = Math.min(1, m.t / LIME_T); uu = 0.3 * u + 0.7 * u * u;
    var cx = m.x0 + (tp.x - m.x0) * 0.3 + m.side * W * 0.07, cy = Math.min(m.y0, tp.y) - H * 0.1, k = 1 - uu;
    if (m.h.length > 7) m.h.shift(); m.h.push(m.x, m.y);
    m.x = k * k * m.x0 + 2 * k * uu * cx + uu * uu * tp.x; m.y = k * k * m.y0 + 2 * k * uu * cy + uu * uu * tp.y;
    m.ang = Math.atan2(2 * k * (cy - m.y0) + 2 * uu * (tp.y - cy), 2 * k * (cx - m.x0) + 2 * uu * (tp.x - cx));
    if (m.t >= LIME_T) { limeHit(m); S.ms.splice(i, 1); }
  }
  if (!sv.lm) return;
  can = !!b && b.st === 'hold' && S.mode === 'boss' && !S.over;
  L.cd = Math.max(0, L.cd - dt);
  if (can && L.q === 0 && L.cd <= 0) { L.q = limeVol(); L.qt = 0; L.n = 0; }
  if (L.q > 0) {
    L.qt -= dt;
    if (L.qt <= 0) { if (can) launchLime(L.n++); L.q--; L.qt = LIME_GAP; if (L.q === 0) L.cd = limeInt(); }
  }
  if (can || L.q > 0) { c = penCenter(b); po = pouchPos(limeGeom(), L.a); ta = Math.max(-0.3, Math.min(0.3, Math.atan2(c.x - po.x, po.y - c.y))); }
  L.a += (ta - L.a) * Math.min(1, dt * 9);
}
function drawMissiles() {
  var i, j, m, sz = Math.max(30, Math.min(W, H) * 0.075), h, n, fl;
  if (!S.ms.length) return;
  var im = limeSprite();
  for (i = 0; i < S.ms.length; i++) {
    m = S.ms[i]; h = m.h; n = h.length / 2;
    if (!calm) for (j = 0; j < n; j++) {
      ctx.globalAlpha = 0.5 * (j + 1) / (n + 1); ctx.fillStyle = j & 1 ? '#d8ff7a' : '#a6e34a';
      ctx.beginPath(); ctx.arc(h[j * 2], h[j * 2 + 1], sz * 0.2 * (j + 1) / (n + 1), 0, 6.3); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.ang + Math.PI / 2);
    fl = calm ? 1 : 0.8 + 0.3 * Math.sin(m.t * 60 + i);
    ctx.fillStyle = '#ff9f3a'; ctx.beginPath(); ctx.ellipse(0, sz * 0.62, sz * 0.12, sz * 0.24 * fl, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#fff2a8'; ctx.beginPath(); ctx.ellipse(0, sz * 0.58, sz * 0.06, sz * 0.14 * fl, 0, 0, 6.3); ctx.fill();
    ctx.drawImage(im, -sz / 2, -sz / 2, sz, sz); ctx.restore();
  }
}
