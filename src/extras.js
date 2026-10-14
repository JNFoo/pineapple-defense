/* ---------- shop extras (gulls, paper umbrellas, air raid), run streak and challenges, fanfare. Copyright (c) 2026 JNFoo. All rights reserved. ---------- */
var GULL_P = [0, 0.5, 0.8, 1], RAID_N = [0, 1, 2], RUN_MAX = 2, RUN_STEP = 1.1;
function runK() { return Math.min(RUN_MAX, Math.pow(RUN_STEP, sv.run | 0)); }
function runPct() { return Math.round((runK() - 1) * 100); }

/* ---------- trophies: the first ten live in one bit field, the newer ones in a second ---------- */
var ACH2 = [
  { n: 'Gull Pals', d: 'A gull swoops in and snatches a fish.' },
  { n: 'Brolly Boss', d: 'Fling a penguin with a paper drink umbrella.' },
  { n: 'Pineapple Rain!', d: 'Make it rain pineapples.' },
  { n: 'Big Rain', d: 'Hit 4 penguins with one Pineapple Rain.' },
  { n: 'Team Spirit', d: 'Chain a combo with both slingshots.' },
  { n: 'Combo Master', d: 'Reach a 6-hit combo.' },
  { n: 'All Five!', d: 'Clear all five stages in one run.' },
  { n: 'Faster Fun', d: 'Win a run when the penguins are a lot faster.' },
  { n: 'Top Speed', d: 'Win a run when the penguins are super fast.' },
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
    var k = runK(); award(16); if (!sv.sp && k >= 1.3) award(17); if (!sv.sp && k >= 1.9) award(18);
    sv.run = Math.min(99, (sv.run | 0) + 1); sv.cd = 0; sv.rl = 0;
    out += ' Run ' + sv.run + ' is done! Next time the penguins are ' + runPct() + '% faster' + (runK() >= RUN_MAX ? ' (the top speed).' : '.') + ' New challenge: ' + chal().d;
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
  S.gulls.push({ f: f, side: side, t: 0, T: 1.5, st: 'in', x: 0, y: 0, x0: side < 0 ? -W * 0.14 : W * 1.14, y0: H * (0.22 + Math.random() * 0.1), fl: Math.random() * 6, hold: false });
}
function updateGulls(dt) {
  var i, g, u, e, tg, s;
  for (i = S.gulls.length - 1; i >= 0; i--) {
    g = S.gulls[i]; g.t += dt; g.fl += dt * 13; s = Math.max(32, W * 0.095);
    if (g.st === 'in') {
      var ix = S.fish.indexOf(g.f);
      if (ix < 0 || g.f.st !== 'fall') { g.st = 'out'; g.t = 0; g.sx = g.x || g.x0; g.sy = g.y || g.y0; continue; }
      tg = fishXY(g.f); u = Math.min(1, g.t / g.T); e = u * u * (3 - 2 * u);
      g.x = g.x0 + (tg.x - g.x0) * e; g.y = g.y0 + (tg.y - g.y0) * e + Math.sin(u * 3.14) * H * 0.035;   /* a low swoop, easy to see over the lanes */
      if (g.t >= g.T) {
        S.fish.splice(ix, 1); g.hold = true; g.st = 'out'; g.t = 0; g.sx = g.x; g.sy = g.y;
        burst(g.x, g.y, 8, ['#ffffff', '#dbe6ee']); sparkBurst(g.x, g.y, 6, ['#fff7e3', '#8fd8ff']); popText(g.x, g.y - s * 0.7, 'Squawk!', '#2f6fa0', 1);
        rings.push({ x: g.x, y: g.y, t: 0, ttl: 0.5, r: s * 0.9, c: '255,255,255' }); award(10);
      }
    } else {
      u = g.t / 1.5; g.x = g.sx - g.side * W * 1.3 * u * u - g.side * W * 0.1 * u; g.y = g.sy - H * 0.1 * u - Math.sin(g.t * 5) * 3;
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
  var i, g, s = Math.max(32, W * 0.095), dir;
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
function brollyCanvas(ci, r) {
  var key = ci + 'x' + Math.round(r) + 'x' + DPR, c = BROLLY[key], g, c0, pw = Math.ceil(r * 2.5), ph = Math.ceil(r * 2.9);
  if (!c) {
    if (Object.keys(BROLLY).length > 9) BROLLY = {};
    c = BROLLY[key] = document.createElement('canvas'); c.width = Math.ceil(pw * DPR); c.height = Math.ceil(ph * DPR); g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, pw / 2 * DPR, (ph - r * 0.2) * DPR);
    c0 = ctx; ctx = g; drawBrolly(0, 0, r, 1, UMB_COL[ci], 0); ctx = c0;
  }
  return c;
}
/* build the three canopies and the closed umbrellas before the first one opens, so opening never costs a frame */
function warmUmb() { if (!S || !(sv.um > 0)) return; for (var ci = 0; ci < 3; ci++) { brollyCanvas(ci, psz(0.95) * 1.05); closedUmb(ci); } }
function drawBrollyCached(x, y, r, open, ci, rot, alpha) {
  var c = brollyCanvas(ci, r), pw = Math.ceil(r * 2.5), ph = Math.ceil(r * 2.9), pa = ctx.globalAlpha;
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
    if (bossOpen(S.boss) && Math.abs(S.boss.p - p) < 0.06) n += 2;
    if (n > bn || (n === bn && p > best)) { bn = n; best = p; }
  }
  return bn <= 0 ? 0.5 : best;
}
function callRaid() {
  if (!S || S.over || S.paused || S.raid || rsg() || !(S.raL > 0) || !(S.mode === 'run' || S.mode === 'boss')) return;
  var p = raidBand(), n = Math.max(7, Math.min(12, Math.round(1.9 * FW * sc(p) / (psz(p) * 0.85))));
  S.raL--; S.raid = { t: 0, p: p, n: n, hits: 0, bossHit: false, done: 0 };
  S.call = { txt: 'PINEAPPLE RAIN!', sub: 'Here they come!', tier: 4, t: 0, ttl: 1.6, n: 0 };
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
    if (b && !r.bossHit && bossOpen(b) && Math.abs(b.p - r.p) < 0.1 && Math.abs(px(b.xn, b.p) - x) < s * 0.7 * (b.big || 1)) { r.bossHit = true; hitBoss(1, penCenter(b)); }
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
/* the tiers set how many limes the launcher has for each Champion fight; it fires them at one steady pace */
var LM = { cost: [80, 100, 150], sup: [6, 12, 20], gap: 0.8 };
var LIME_COL = ['#d8ff7a', '#a6e34a', '#5cb82a', '#fff7e3'], limeImg = null, LIME_TY = null, LIME_GAP = 0.14, LIME_T = 0.55;
function limeInt() { return LM.gap * (S.fx.zip > 0 ? 0.5 : 1); }
function limeSup() { return LM.sup[Math.max(0, Math.min(2, (sv.lm | 0) - 1))]; }
function limeGeom() { var s = slingGeom(); return { x: mx(0.255), base: s.base, f: s.f * 0.46, ps: s.f * 0.46 * 0.62 }; }
function limeReady() { var L = S.lm; return L.fb && L.sup <= 0 ? 0 : 1 - Math.max(0, L.cd) / limeInt(); }
function limeTy() { return LIME_TY || (LIME_TY = { img: 'pa', size: 0.95, pic: limeSprite() }); }
/* the missile is a whole lime with a leaf, drawn once and reused */
function limeSprite() {
  if (limeImg) return limeImg;
  var c = document.createElement('canvas'), g, bg, i, a; c.width = c.height = 128; g = c.getContext('2d');
  g.lineJoin = 'round'; g.strokeStyle = '#143d09'; g.lineWidth = 4;
  bg = g.createRadialGradient(50, 58, 4, 64, 72, 50); bg.addColorStop(0, '#f0ffa8'); bg.addColorStop(0.35, '#a6e34a'); bg.addColorStop(1, '#3f8f1d');
  g.fillStyle = bg; g.beginPath(); g.moveTo(64, 28); g.bezierCurveTo(96, 28, 112, 52, 108, 78); g.bezierCurveTo(104, 104, 84, 118, 64, 118); g.bezierCurveTo(44, 118, 24, 104, 20, 78); g.bezierCurveTo(16, 52, 32, 28, 64, 28); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#e9ffb0'; g.beginPath(); g.arc(64, 118, 3.5, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(31,100,12,.55)'; for (i = 0; i < 9; i++) { a = i * 2.4; g.beginPath(); g.arc(64 + Math.cos(a) * (14 + i * 4), 76 + Math.sin(a) * (10 + i * 3.4), 2, 0, 6.3); g.fill(); }
  g.fillStyle = '#4fa81e'; g.beginPath(); g.moveTo(64, 30); g.quadraticCurveTo(70, 8, 98, 6); g.quadraticCurveTo(92, 30, 64, 30); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#a6e34a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(68, 26); g.quadraticCurveTo(80, 18, 92, 11); g.stroke();
  g.fillStyle = '#5a3a14'; g.fillRect(60, 24, 8, 9);
  g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(42, 62, 8, 17, 0.5, 0, 6.3); g.fill();
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
  if (bossOpen(b)) hitBoss(1, penCenter(b));
  burst(tp.x, tp.y, 9, LIME_COL); sparkBurst(tp.x, tp.y, 4, LIME_COL);
  if (!calm) rings.push({ x: tp.x, y: tp.y, t: 0, ttl: 0.35, r: psz(0.4) * 0.35, c: '166,227,74' });
}
function updateLime(dt) {
  var L = S.lm, b = S.boss, can, i, m, tp, u, uu, p, ta = 0, c, po;
  for (i = S.ms.length - 1; i >= 0; i--) {
    m = S.ms[i]; m.t += dt; tp = limeTgt(m); u = Math.min(1, m.t / LIME_T); uu = 0.3 * u + 0.7 * u * u;
    var cx = m.x0 + (tp.x - m.x0) * 0.3 + m.side * W * 0.07, cy = Math.min(m.y0, tp.y) - H * 0.1, k = 1 - uu;
    if (m.h.length > 30) { m.h.shift(); m.h.shift(); } m.h.push(m.x, m.y);
    m.x = k * k * m.x0 + 2 * k * uu * cx + uu * uu * tp.x; m.y = k * k * m.y0 + 2 * k * uu * cy + uu * uu * tp.y;
    m.ang = Math.atan2(2 * k * (cy - m.y0) + 2 * uu * (tp.y - cy), 2 * k * (cx - m.x0) + 2 * uu * (tp.x - cx));
    if (!calm) { var sp = Math.sin(m.t * 30 + m.i * 2) * Math.min(W, H) * 0.028 * Math.min(1, u * 6) * (1 - 0.7 * u); m.x += -Math.sin(m.ang) * sp; m.y += Math.cos(m.ang) * sp; }   /* a tight corkscrew around the path, like a spiralling football */
    if (m.t >= LIME_T) { limeHit(m); S.ms.splice(i, 1); }
  }
  if (!sv.lm) return;
  if (b !== L.fb) { L.fb = b; L.sup = b ? limeSup() : 0; L.cd = Math.min(L.cd, 0.4); }   /* a fresh Champion means a fresh supply */
  can = bossOpen(b) && S.mode === 'boss' && !S.over && helpOn();
  L.cd = Math.max(0, L.cd - dt);
  if (can && L.sup > 0 && L.cd <= 0) { launchLime(L.n++); L.sup--; L.cd = limeInt(); }
  if (can && L.sup > 0) { c = penCenter(b); po = pouchPos(limeGeom(), L.a); ta = Math.max(-AUTO_TURN, Math.min(AUTO_TURN, Math.atan2(c.x - po.x, po.y - c.y) * 0.3)); }
  L.a += (ta - L.a) * Math.min(1, dt * 9);
}
function drawMissiles() {
  var i, j, m, sz = Math.max(36, Math.min(W, H) * 0.095), h, n;
  if (!S.ms.length) return;
  var im = limeSprite();
  for (i = 0; i < S.ms.length; i++) {
    m = S.ms[i]; h = m.h; n = h.length / 2;
    if (!calm) for (j = 0; j < n; j++) {   /* vapor trail: puffs that grow and fade as they age, following the corkscrew */
      var age = 1 - (j + 1) / (n + 1);
      ctx.globalAlpha = 0.9 * (1 - age * 0.85); ctx.fillStyle = j & 1 ? '#ffffff' : '#d6ff8a';
      ctx.beginPath(); ctx.arc(h[j * 2], h[j * 2 + 1], sz * (0.13 + 0.22 * age), 0, 6.3); ctx.fill();
    }
    /* the lime flies long axis first and rolls about it, so it looks like a spiralling football */
    ctx.globalAlpha = 1; ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.ang - Math.PI / 2);
    var roll = calm ? 1 : Math.cos(m.t * 30 + m.i * 2 + 1.2);
    ctx.scale(0.78 + 0.16 * roll, 1.22);
    ctx.drawImage(im, -sz / 2, -sz / 2, sz, sz); ctx.restore();
  }
}

/* ---------- Champion fight styles: each Champion after Coach Waddles plays a different kind of fight ----------
   Waddles  ring    pop his snowballs, then hit him (the original fight)
   Flipper  peek    he hides behind three ice blocks and pops up behind one; hit him only while he is up
   Slidealot charge he runs at your table; every hit knocks him back, reaching the table costs Cheer
   Mohawk   guard   a squad shields her; clear the squad and she is open for a few seconds, then a bigger squad comes
   Bernard  clones  icy clones stand beside the real Bernard; clones pop, only the solid one takes damage */
var SLOT_X = [-0.6, 0, 0.6], GUARD_OPEN = 3.4;
function bossOpen(b) { return !!b && b.st === 'hold' && !b.safe; }
function champMode() { return S && S.stage ? CHAMP[S.stage].mode || '' : ''; }
function champInit(b) { b.slot = 1; b.pk = 'hid'; b.pt = 0.9; b.gs = 0; b.n = 3; b.stun = 0; b.safe = false; b.shuf = 5; b.cl0 = 0; b.cr = 0; S.clones = []; }
function champHidden(b) { return champMode() === 'peek' && b.st === 'hold' && b.pk !== 'up'; }
function freeSlot(b) { var i, j, ok; for (i = 0; i < 3; i++) { ok = i !== b.slot; for (j = 0; j < S.clones.length && ok; j++) if (S.clones[j].slot === i) ok = false; if (ok) return i; } return -1; }
function makeDecoy(b, slot) {
  var d = { id: ++S.id, kind: b.kind, xn: SLOT_X[slot], p: b.p, v: 0, st: 'hold', t: 0, mood: 'happy', ph: Math.random() * 6, hp: 1, ev: 0, evT: 0, pop: 0, hat: false, a: 0.7, big: b.big, side: 1, slot: slot, ice: 1, decoy: true, x0: 0, x1: 0 };
  burst(px(d.xn, d.p), py(d.p), 6, SNOW_COL); return d;
}
function champShuffle(b) {
  var o = [0, 1, 2], i, j, t;
  for (i = 2; i > 0; i--) { j = (Math.random() * (i + 1)) | 0; t = o[i]; o[i] = o[j]; o[j] = t; }
  b.slot = o[0]; b.xn = SLOT_X[o[0]]; S.clones = [];
  S.clones.push(makeDecoy(b, o[1])); S.clones.push(makeDecoy(b, o[2]));
  burst(px(b.xn, b.p), py(b.p), 8, SNOW_COL); b.shuf = 6.5; b.cr = 0;
}
function callSquad(b) {
  var n = Math.min(5, b.n), i; b.n++;
  for (i = 0; i < n; i++) spawn();
  popText(px(b.xn, b.p), py(b.p) - psz(b.p) * 1.5, 'Squad up!', '#9b3fd0', 1);
}
function champUpdate(b, dt) {
  var m = champMode(), i, alive, np;
  if (m === 'peek') {
    b.pt -= dt * slowK;
    if (b.pk === 'hid' && b.pt <= 0) { do { np = (Math.random() * 3) | 0; } while (np === b.slot); b.slot = np; b.xn = SLOT_X[np]; b.pk = 'tell'; b.pt = 0.85; }
    else if (b.pk === 'tell' && b.pt <= 0) { b.pk = 'up'; b.pt = 2.4; b.mood = 'glad'; burst(px(b.xn, b.p), py(b.p) - psz(b.p) * 0.6, 8, SNOW_COL); }
    else if (b.pk === 'up' && b.pt <= 0) { b.pk = 'hid'; b.pt = 1.0; b.mood = 'happy'; burst(px(b.xn, b.p), py(b.p) - psz(b.p) * 0.4, 6, SNOW_COL); }
    b.safe = b.pk !== 'up'; b.lift = b.pk === 'up' ? Math.min(0.3, (2.4 - b.pt) * 2) : 0;
  } else if (m === 'charge') {
    if (b.stun > 0) { b.stun -= dt; b.mood = 'pout'; }
    else {
      b.mood = 'wow'; b.p += (0.08 + 0.018 * (CHAMP[S.stage].hp - b.hp)) * dt * slowK;
      b.puff -= dt; if (b.puff <= 0) { b.puff = 0.11; burst(px(b.xn, b.p), py(b.p), 2, SNOW_COL); }
      if (b.p >= 0.9) {
        S.cheer = Math.max(0, S.cheer - 20); S.wob = 1; S.bumps++; S.allBumps++; S.shk = Math.max(S.shk, 0.8);
        popText(px(b.xn, b.p), py(b.p) - psz(b.p) * 1.4, 'BONK!', '#b8321f', 1); burst(px(b.xn, b.p), py(b.p), 14, SNOW_COL);
        b.p = 0.48; b.stun = 1.4; if (S.cheer <= 0) endStage(false);
      }
    }
  } else if (m === 'guard') {
    alive = 0; for (i = 0; i < penguins.length; i++) if (penguins[i].st === 'walk') alive++;
    if (b.gs === 0) { callSquad(b); b.gs = 1; }
    else if (b.gs === 1 && alive === 0) { b.gs = 2; b.pt = GUARD_OPEN; popText(px(b.xn, b.p), py(b.p) - psz(b.p) * 1.5, 'Get her!', '#d4380d', 1); sparkBurst(px(b.xn, b.p), py(b.p) - psz(b.p) * 0.5, 10, ['#ff6fa8', '#fff7e3', '#ffd23f']); }
    else if (b.gs === 2) { b.pt -= dt * slowK; if (b.pt <= 0) b.gs = 0; }
    b.safe = b.gs !== 2;
  } else if (m === 'clones') {
    if (!b.cl0) { b.cl0 = 1; champShuffle(b); }
    b.shuf -= dt * slowK; if (b.shuf <= 0) champShuffle(b);
    for (i = 0; i < S.clones.length; i++) S.clones[i].ph += dt * 5;
    if (S.clones.length < 2) { b.cr += dt; if (b.cr >= 3) { b.cr = 0; np = freeSlot(b); if (np >= 0) S.clones.push(makeDecoy(b, np)); } }
  }
}
/* a Champion was hit: kind 0 popped a snowball, kind 1 took a heart */
function champHit(b, kind) {
  var m = champMode();
  if (m === 'charge') b.p = Math.max(0.3, b.p - (kind ? 0.16 : 0.05));
}
/* a Champion is back from being hit */
function champReset(b) {
  var m = champMode();
  if (m === 'peek') { b.pk = 'hid'; b.pt = 1.0; b.safe = true; }
  else if (m === 'guard') { b.gs = 0; b.safe = true; }
  else if (m === 'clones') champShuffle(b);
  else if (m === 'charge') { b.stun = 0.6; }
}
function poofDecoy(d, x, y) {
  var i = S.clones.indexOf(d); if (i >= 0) S.clones.splice(i, 1);
  burst(x, y, 12, SNOW_COL); sparkBurst(x, y, 8, ['#ffffff', '#bfe8ff', '#8fd8ff']); popText(x, y - psz(d.p) * 0.4, 'Ice clone!', '#2f6f9f');
}
/* a pineapple lands at (xE, yE): clones pop, shielded Champions and ice blocks turn it away. True when it was used up. */
function champLand(s) {
  var m = champMode(), i, c, d, b = S.boss, any = false, ty = s.ty, r = ty.splash ? ty.splash : 0.8, best = null, bd = 9, bk;
  if (!b) return false;
  if (m === 'clones') {
    for (i = S.clones.length - 1; i >= 0; i--) {
      d = S.clones[i]; c = penCenter(d); bk = Math.hypot(c.x - s.xE, c.y - s.yE) / c.s;
      if (bk < r) { if (!ty.splash && bk >= bd) continue; if (!ty.splash) { best = d; bd = bk; } else { poofDecoy(d, c.x, c.y - c.s * 0.2); any = true; } }
    }
    if (best) {
      c = penCenter(best); var cb = penCenter(b);   /* the real one wins if the pineapple is nearer to him */
      if (!(bossOpen(b) && Math.hypot(cb.x - s.xE, cb.y - s.yE) / cb.s < bd)) { poofDecoy(best, c.x, c.y - c.s * 0.2); if (!s.auto) S.streak = 0; return true; }
    }
    return false;
  }
  if (b.st === 'hold' && b.safe && !ty.splash) {
    if (m === 'peek') {
      for (i = 0; i < 3; i++) { c = penCenter({ xn: SLOT_X[i], p: b.p, big: 0.62 }); if (Math.hypot(c.x - s.xE, c.y - s.yE) / (c.s * 1.2) < 0.7) { burst(c.x, c.y, 8, SNOW_COL); popText(c.x, c.y - c.s * 0.5, 'Clink!', '#2f6f9f'); if (!s.auto) S.streak = 0; return true; } }
    } else if (m === 'guard') {
      c = penCenter(b); if (Math.hypot(c.x - s.xE, c.y - s.yE) / c.s < 0.8) { sparkBurst(c.x, c.y, 8, ['#ff6fa8', '#fff7e3']); popText(c.x, c.y - c.s * 0.4, 'Shielded!', '#9b3fd0'); if (!s.auto) S.streak = 0; return true; }
    }
  }
  return false;
}
/* ice block and squad bubble art */
function drawIceBlock(x, y, sz) {
  stamp('ice' + Math.round(sz), x, y, Math.ceil(sz * 1.3), Math.ceil(sz * 1.2), Math.ceil(sz * 1.3) / 2, Math.ceil(sz * 1.2) - 2, function (ox, oy) {
    var w = sz * 0.98, h = sz * 0.9, g = ctx.createLinearGradient(0, oy - h, 0, oy);
    g.addColorStop(0, '#f2fcff'); g.addColorStop(0.55, '#bfe6f7'); g.addColorStop(1, '#86c4e4');
    ctx.fillStyle = g; ctx.strokeStyle = '#4f93bb'; ctx.lineWidth = Math.max(2, sz * 0.04); ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(ox - w / 2 + sz * 0.1, oy - h); ctx.lineTo(ox + w / 2 - sz * 0.1, oy - h); ctx.quadraticCurveTo(ox + w / 2, oy - h, ox + w / 2, oy - h + sz * 0.1); ctx.lineTo(ox + w / 2, oy - sz * 0.06); ctx.quadraticCurveTo(ox + w / 2, oy, ox + w / 2 - sz * 0.08, oy); ctx.lineTo(ox - w / 2 + sz * 0.08, oy); ctx.quadraticCurveTo(ox - w / 2, oy, ox - w / 2, oy - sz * 0.06); ctx.lineTo(ox - w / 2, oy - h + sz * 0.1); ctx.quadraticCurveTo(ox - w / 2, oy - h, ox - w / 2 + sz * 0.1, oy - h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(2, sz * 0.07); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox - w * 0.34, oy - h * 0.82); ctx.lineTo(ox - w * 0.34, oy - h * 0.42); ctx.moveTo(ox - w * 0.34, oy - h * 0.3); ctx.lineTo(ox - w * 0.34, oy - h * 0.26); ctx.stroke();
    ctx.strokeStyle = 'rgba(79,147,187,.55)'; ctx.lineWidth = Math.max(1, sz * 0.025); ctx.beginPath(); ctx.moveTo(ox + w * 0.1, oy - h * 0.9); ctx.lineTo(ox + w * 0.02, oy - h * 0.6); ctx.lineTo(ox + w * 0.2, oy - h * 0.45); ctx.moveTo(ox - w * 0.1, oy - h * 0.2); ctx.lineTo(ox + w * 0.05, oy - h * 0.05); ctx.stroke();
  });
}
function drawIceAura(x, y, s) {
  var g = gk('iceaura', function () { var q = ctx.createRadialGradient(0, 0, 0, 0, 0, 50); q.addColorStop(0, 'rgba(190,235,255,.6)'); q.addColorStop(1, 'rgba(190,235,255,0)'); return q; });
  ctx.save(); ctx.translate(x, y - s * 0.45); ctx.scale(s * 0.95 / 50, s * 0.95 / 50); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 50, 0, 6.3); ctx.fill(); ctx.restore();
}
function drawChampArt(b) {
  var m = champMode(), i, s, x, c, sh, bs;
  if (b.st === 'walk' || b.st === 'slide' || b.st === 'gone') return;
  if (m === 'peek') {
    s = psz(b.p) * b.big * 0.56;
    for (i = 0; i < 3; i++) { sh = (b.pk === 'tell' && i === b.slot && !calm) ? Math.sin(S.t * 55) * s * 0.05 : 0; drawIceBlock(px(SLOT_X[i], b.p) + sh, py(b.p) + s * 0.04, s); }
  } else if (m === 'guard' && b.safe && b.st === 'hold') {
    c = penCenter(b); bs = c.s * 0.64;
    ctx.save(); ctx.globalAlpha = 0.26; ctx.fillStyle = '#ff9fcd'; ctx.beginPath(); ctx.ellipse(c.x, c.y, bs, bs * 1.12, 0, 0, 6.3); ctx.fill();
    ctx.globalAlpha = 0.85; ctx.strokeStyle = '#d63a8a'; ctx.lineWidth = Math.max(2, c.s * 0.025); ctx.setLineDash([c.s * 0.08, c.s * 0.05]); ctx.lineDashOffset = calm ? 0 : -S.t * 20; ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 0.6; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(c.x - bs * 0.4, c.y - bs * 0.55, bs * 0.16, bs * 0.08, -0.6, 0, 6.3); ctx.fill(); ctx.restore();
  }
}

/* ---------- atmosphere: sun rays, cloud shadows, ground glints, drifting motes, stormy rain and a soft flash ----------
   Everything is cheap on purpose: a few sprites made once, a handful of image draws per frame, and one batched path for the rain.
   It thins out with the quality governor (qLevel) and stops moving in Calm mode. */
var ATM = { rays: null, cs: null };
var MOTE_COL = ['', '255,226,140', '190,232,255', '255,214,150', '210,170,255', '140,245,225'];
function raySprite() {
  if (ATM.rays) return ATM.rays;
  var c = document.createElement('canvas'), g, i, a0;
  c.width = c.height = 256; g = c.getContext('2d'); g.translate(128, 128);
  for (i = 0; i < 14; i++) {
    a0 = i * Math.PI * 2 / 14; var gr = g.createRadialGradient(0, 0, 8, 0, 0, 128);
    gr.addColorStop(0, 'rgba(255,244,190,.9)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 128, a0, a0 + Math.PI / 14 * (0.55 + 0.25 * (i % 3) / 2)); g.closePath(); g.fill();
  }
  return (ATM.rays = c);
}
function cloudShadowSprite() {
  if (ATM.cs) return ATM.cs;
  var c = document.createElement('canvas'), g, gr;
  c.width = 256; c.height = 96; g = c.getContext('2d'); g.translate(128, 48); g.scale(1, 0.375);
  gr = g.createRadialGradient(0, 0, 0, 0, 0, 128); gr.addColorStop(0, 'rgba(28,48,86,.55)'); gr.addColorStop(0.6, 'rgba(28,48,86,.28)'); gr.addColorStop(1, 'rgba(28,48,86,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 128, 0, 6.3); g.fill();
  return (ATM.cs = c);
}
/* behind the penguins: sun rays, cloud shadows sliding over the ground, twinkles on ice and tiles */
function drawAtmos(t) {
  var st = stageNo(), q = qLevel, i, x, y, w, a, r;
  if (st === 1 && dyn.sx && q < 2) {
    r = dyn.sr * 12; ctx.save(); ctx.globalAlpha = 0.17 + (calm ? 0 : 0.05 * Math.sin(t * 0.9)); ctx.globalCompositeOperation = 'lighter';
    ctx.translate(dyn.sx, dyn.sy); ctx.rotate(t * 0.04); ctx.drawImage(raySprite(), -r / 2, -r / 2, r, r); ctx.restore();
  }
  if (q < 2) {
    var cs = cloudShadowSprite(), sh = st === 4 ? 0.16 : 0.1;
    ctx.globalAlpha = sh;
    for (i = 0; i < 2; i++) { w = W * (0.85 - i * 0.2); x = ((t * W * (0.018 + i * 0.01) + W * (0.1 + i * 0.5)) % (W * 1.7)) - W * 0.5; y = hy + (H - hy) * (0.2 + i * 0.28); ctx.drawImage(cs, x, y, w, w * 0.375); }
    ctx.globalAlpha = 1;
  }
  if (st >= 2 && st !== 4 && q < 2) {
    ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.4, H * 0.0024);
    for (i = 0; i < 7; i++) {
      a = Math.pow(Math.max(0, Math.sin(t * 1.7 + i * 2.3)), 8); if (a < 0.08) continue;
      x = W * (0.08 + ((i * 0.151 + st * 0.07) % 0.84)); y = hy + (H - hy) * (0.16 + ((i * 0.23) % 0.5)); r = H * 0.014 * (0.4 + a);
      ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
/* in front of everything on the field: floating motes, the storm's rain, and one soft flash every so often */
function drawAtmosTop(t) {
  var st = stageNo(), q = qLevel, n = q === 0 ? 10 : q === 1 ? 5 : 0, i, x, y, s, a, g;
  if (calm) return;
  if (n) {
    g = glowFor(MOTE_COL[st] || MOTE_COL[1]); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < n; i++) {
      y = H * (0.08 + 0.8 * (1 - (((i * 0.37 + t * (0.012 + (i % 3) * 0.006)) % 1))));
      x = W * ((i * 0.173 + 0.07) % 1) + Math.sin(t * 0.5 + i * 1.9) * W * 0.03;
      s = H * 0.017 * (0.7 + (i % 3) * 0.3); a = 0.4 + 0.4 * Math.sin(t * 1.3 + i * 2.1);
      ctx.globalAlpha = Math.max(0, a) * (st === 4 ? 0.5 : 1); ctx.drawImage(g, x - s, y - s, s * 2, s * 2);
    }
    ctx.restore();
  }
  if (st === 4 && q < 2) {
    n = q === 0 ? 30 : 14; ctx.strokeStyle = 'rgba(225,235,255,.4)'; ctx.lineWidth = Math.max(1.2, W * 0.0035); ctx.lineCap = 'round'; ctx.beginPath();
    for (i = 0; i < n; i++) {
      x = ((i * 41.3 + t * W * 0.22) % (W * 1.15)) - W * 0.05; y = ((i * 67.9 + t * H * (1.5 + (i % 3) * 0.25)) % (H * 1.06)) - H * 0.03;
      ctx.moveTo(x, y); ctx.lineTo(x - W * 0.012, y + H * 0.032);
    }
    ctx.stroke();
    var ph = t % 12; if (ph > 11.3 && ph < 11.65) { a = Math.max(0, 1 - Math.abs(ph - 11.45) / 0.2); ctx.fillStyle = 'rgba(255,255,255,' + (0.18 * a) + ')'; ctx.fillRect(0, 0, W, H); }
  }
}
/* little puffs of sand or snow kicked up by walking penguins (not in Calm mode, not on slow devices) */
function stepPuff(pg, dt) {
  if (calm || qLevel > 0 || pg.p < 0.18 || bits.length > 110) return;
  pg.fs = (pg.fs || 0) - dt * (0.6 + pg.v * 9);
  if (pg.fs > 0) return;
  pg.fs = 0.5 + Math.random() * 0.2;
  var s = psz(pg.p), x = px(pg.xn, pg.p) + (Math.random() - 0.5) * s * 0.3, y = py(pg.p) - s * 0.02, c = stageNo() === 1 ? '#f1e0b0' : '#ffffff', j;
  for (j = 0; j < 2; j++) addBit(x, y, (j ? 1 : -1) * (14 + Math.random() * 18), -26 - Math.random() * 20, Math.random() * 6, 0, Math.max(3, s * 0.07), Math.max(3, s * 0.07), 0, c, 0.4);
}
