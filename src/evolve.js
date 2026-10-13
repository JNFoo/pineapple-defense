/* ---------- parachute fish and penguin evolution. Copyright (c) 2026 JNFoo. All rights reserved. ---------- */
/* every so often a fish floats down on a handkerchief parachute and lands in front of a walking penguin; the penguin eats it
   and levels up: Rockhopper -> Adelie (faster) -> Gentoo (faster and takes two hits). A hit at any moment still counts. */
var LEVEL = { rh: 'ad', ad: 'gt' }, LMULT = { rh: 1, ad: 1.3, gt: 1.5 }, LHP = { rh: 1, ad: 1, gt: 2 }, LNAME = { ad: 'Adélie!', gt: 'Gentoo!' };
var EVT = 1.15, EV_SWAP = 0.62;
var TINT_GT = '--ad-hi:#5d6d86;--ad-mid:#243148;--ad-lo:#0b1220';
function gtSvg(markup) {
  var s = markup.replace('#ffc872', '#ff9a6a').replace('#ff9a2f', '#ff5a2a').replace('#c4560a', '#b3260a');
  var extra = '<path d="M60 66C78 46 122 46 140 66" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M60 66C78 46 122 46 140 66" fill="none" stroke="#d8e4f0" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>' +
    '<path d="M56 132C80 146 120 146 144 132L142 146C120 158 80 158 58 146Z" fill="#e0472f" stroke="#7a1f14" stroke-width="2" stroke-linejoin="round"/><path d="M70 140l-3 14M86 144l-3 14" stroke="#fff7e3" stroke-width="4" stroke-linecap="round"/><path d="M100 146l-2 18" stroke="#fff7e3" stroke-width="4" stroke-linecap="round"/>';
  return s.replace(/<\/svg>\s*$/, extra + '</svg>');
}

/* ---------- the fish ---------- */
function fishFree(pg) { return pg.st === 'walk' && !(pg.ev > 0) && pg.kind !== 'gt' && pg.p > 0.12; }
function tryDrop() {
  var c = [], i, pg, T = 2.6, pL = 0.36 + Math.random() * 0.18, b = S.boss, ok;
  /* the fish lands mid-field, so the penguin still has room to eat it and walk on; only penguins that will not have passed that spot by then qualify */
  for (i = 0; i < penguins.length; i++) {
    pg = penguins[i]; if (!fishFree(pg) || pg.p + pg.v * T + 0.05 > pL) continue;
    ok = true;
    if (b && b.st !== 'slide' && b.st !== 'gone' && Math.abs(pg.xn - b.xn) < 0.6 && pL > b.p - 0.16 && pL < b.p + 0.16) ok = false;
    if (ok) c.push({ pg: pg });
  }
  if (!c.length) return false;
  c = c[Math.floor(Math.random() * c.length)];
  var nf = { isFish: true, st: 'fall', t: 0, T: T, xn: c.pg.xn, p: pL, pg: null, hop: Math.random() * 6 };
  S.fish.push(nf); gullFor(nf);
  return true;
}
function startEvolve(pg, f) {
  var to = LEVEL[pg.kind]; if (!to) return;
  pg.ev = EVT; pg.evT = 0; pg.evTo = to; pg.evDone = false; pg.vs = pg.v; pg.v = 0; pg.mood = 'giggle';
  f.st = 'eaten'; f.t = 0; f.pg = pg;
  popText(px(pg.xn, pg.p), py(pg.p) - psz(pg.p) * 1.15, 'Yum!', '#2f8fbf', 0);
}
function evolveStep(pg, dt) {
  pg.evT += dt; pg.ev -= dt;
  if (!pg.evDone && pg.evT >= EV_SWAP) {
    pg.evDone = true; pg.kind = pg.evTo; pg.hp = LHP[pg.kind]; pg.vs = pg.base * LMULT[pg.kind]; pg.big = pg.kind === 'gt' ? 1.12 : 1; pg.pop = 0.4; pg.hat = false;
    var x = px(pg.xn, pg.p), y = py(pg.p) - psz(pg.p) * (pg.big || 1) * 0.45, gt = pg.kind === 'gt';
    sparkBurst(x, y, gt ? 26 : 16, gt ? ['#ffd23f', '#fff7e3', '#ff6fa8', '#8fe0ff'] : ['#8fe0ff', '#fff7e3', '#c9b8ff']);
    rings.push({ x: x, y: y, t: 0, ttl: 0.7, r: psz(pg.p) * (gt ? 1.7 : 1.3), c: gt ? '255,111,168' : '120,200,255' });
    rings.push({ x: x, y: y, t: -0.1, ttl: 0.7, r: psz(pg.p) * (gt ? 1.2 : 0.9), c: '255,230,120' });
    popText(x, y - psz(pg.p) * 0.35, LNAME[pg.kind], gt ? '#d9007a' : '#2f8fbf', 1);
    if (gt && !calm) S.gl = Math.max(S.gl, 0.45);
  }
  if (pg.ev <= 0) { pg.ev = 0; pg.v = pg.vs; pg.mood = 'happy'; }
}
function updateFish(dt) {
  var i, j, f, pg;
  if (S.over) return;
  if ((S.mode === 'run' || (S.mode === 'boss' && S.boss && S.boss.st === 'hold')) && !S.paused) {
    S.fishT -= dt;
    if (S.fishT <= 0 && S.fish.length === 0) S.fishT = tryDrop() ? 9 + Math.random() * 5 : 1.5;
  }
  for (i = S.fish.length - 1; i >= 0; i--) {
    f = S.fish[i]; f.t += dt;
    if (f.st === 'fall') {
      if (f.t >= f.T) { f.st = 'ground'; f.t = 0; burst(px(f.xn, f.p), py(f.p), 4, SNOW_COL); }
    } else if (f.st === 'ground') {
      for (j = 0; j < penguins.length; j++) {
        pg = penguins[j];
        if (fishFree(pg) && Math.abs(pg.xn - f.xn) < 0.3 && pg.p >= f.p - 0.015 && pg.p < f.p + 0.12) { startEvolve(pg, f); break; }
      }
      if (f.st === 'ground' && f.t > 11) { burst(px(f.xn, f.p), py(f.p), 6, SNOW_COL); S.fish.splice(i, 1); }
    } else if (f.st === 'eaten' && f.t > 0.4) S.fish.splice(i, 1);
  }
}

/* ---------- drawing ---------- */
function drawFishBody(x, y, s, flap, ang, face) {
  var gr, fy = flap * s * 0.1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  /* tail with two lobes and a lighter rim */
  gr = gk('ft' + Math.round(s * 4), function () { var g = ctx.createLinearGradient(-s * 0.8, 0, -s * 0.4, 0); g.addColorStop(0, '#ff9a4a'); g.addColorStop(1, '#e8601e'); return g; });
  ctx.fillStyle = gr; ctx.strokeStyle = '#b84a12'; ctx.lineWidth = Math.max(1.2, s * 0.04); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-s * 0.4, 0); ctx.quadraticCurveTo(-s * 0.62, -s * 0.06 + fy * 0.5, -s * 0.8, -s * 0.26 + fy); ctx.quadraticCurveTo(-s * 0.7, fy * 0.3, -s * 0.76, s * 0.28 + fy); ctx.quadraticCurveTo(-s * 0.6, s * 0.06 + fy * 0.5, -s * 0.4, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  /* top fin and belly fin */
  ctx.fillStyle = '#ffd7a8'; ctx.beginPath(); ctx.moveTo(-s * 0.12, -s * 0.27); ctx.quadraticCurveTo(-s * 0.02, -s * 0.56 + flap * s * 0.04, s * 0.22, -s * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.02, s * 0.27); ctx.quadraticCurveTo(s * 0.04, s * 0.44, s * 0.16, s * 0.28); ctx.closePath(); ctx.fill(); ctx.stroke();
  /* body: orange on top, cream belly, a glossy shine */
  gr = gk('fb' + Math.round(s * 4), function () { var g = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.3); g.addColorStop(0, '#ffc07a'); g.addColorStop(0.55, '#ff8a42'); g.addColorStop(1, '#e8601e'); return g; });
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.3, 0, 0, 6.3); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.3, 0, 0, 6.3); ctx.clip();
  ctx.fillStyle = 'rgba(255,240,214,.8)'; ctx.beginPath(); ctx.ellipse(s * 0.02, s * 0.3, s * 0.56, s * 0.17, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(184,74,18,.35)'; ctx.lineWidth = Math.max(1, s * 0.03); ctx.beginPath();
  for (var i = 0; i < 4; i++) { var sx = -s * 0.22 + i * s * 0.13; ctx.moveTo(sx, -s * 0.26); ctx.quadraticCurveTo(sx + s * 0.05, 0, sx, s * 0.12); }
  ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(s * 0.04, -s * 0.15, s * 0.28, s * 0.06, -0.08, 0, 6.3); ctx.fill();
  if (face) {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#b84a12'; ctx.lineWidth = Math.max(1, s * 0.03); ctx.beginPath(); ctx.arc(s * 0.28, -s * 0.06, s * 0.105, 0, 6.3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a120d'; ctx.beginPath(); ctx.arc(s * 0.31, -s * 0.06, s * 0.058, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 0.33, -s * 0.085, s * 0.02, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(255,111,143,.5)'; ctx.beginPath(); ctx.ellipse(s * 0.3, s * 0.06, s * 0.06, s * 0.035, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#2a120d'; ctx.lineWidth = Math.max(1.2, s * 0.045); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(s * 0.4, s * 0.06, s * 0.1, 0.3, 2.2); ctx.stroke();
  }
  ctx.restore();
}
function drawHanky(cx, cy, w, h, t, billow) {
  /* a square handkerchief puffed by the air, with a red check and a wavy hem */
  var i, n = 6;
  ctx.save(); ctx.beginPath(); ctx.moveTo(cx - w, cy + h * 0.35);
  ctx.bezierCurveTo(cx - w * 1.05, cy - h * (0.9 + billow), cx + w * 1.05, cy - h * (0.9 + billow), cx + w, cy + h * 0.35);
  for (i = n - 1; i >= 0; i--) ctx.lineTo(cx - w + (2 * w) * i / n, cy + h * 0.35 + Math.sin(t * 6 + i * 1.7) * h * 0.1 + (i % 2) * h * 0.12);
  ctx.closePath(); ctx.fillStyle = '#fff7e3'; ctx.fill(); ctx.clip();
  ctx.strokeStyle = 'rgba(224,71,47,.55)'; ctx.lineWidth = Math.max(1.5, w * 0.13);
  for (i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx + i * w * 0.4, cy - h * 2); ctx.lineTo(cx + i * w * 0.4 * 1.15, cy + h); ctx.stroke(); }
  for (i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(cx - w * 1.2, cy - h * (0.5 - i * 0.4)); ctx.lineTo(cx + w * 1.2, cy - h * (0.5 - i * 0.4)); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(cx - w * 0.3, cy - h * 0.55, w * 0.3, h * 0.18, -0.3, 0, 6.3); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#b84a3a'; ctx.lineWidth = Math.max(1.4, w * 0.06); ctx.beginPath(); ctx.moveTo(cx - w, cy + h * 0.35);
  ctx.bezierCurveTo(cx - w * 1.05, cy - h * (0.9 + billow), cx + w * 1.05, cy - h * (0.9 + billow), cx + w, cy + h * 0.35); ctx.stroke();
}
function drawFish(f) {
  var s = psz(f.p), gx = px(f.xn, f.p), gy = py(f.p), t = calm ? 0 : f.t, u, fs = s * 0.5;
  ctx.save();
  if (f.st === 'fall') {
    u = Math.min(1, f.t / f.T); var e = u < 0.85 ? u : 0.85 + (u - 0.85) * 0.7, top = -s * 2.4;
    var y = top + (gy - s * 0.12 - top) * e, sw = calm ? 0 : Math.sin(f.t * 2.3 + f.hop), x = gx + sw * s * 0.28 * (1 - u * 0.8), ang = sw * 0.16 * (1 - u * 0.6);
    var L = s * 0.78, cx = x + Math.sin(ang) * L * 0.9, cy = y - L * Math.cos(ang), hw = s * 0.34, hh = s * 0.17, bi = calm ? 0 : Math.sin(f.t * 5) * 0.12;
    drawShadow(gx, gy - s * 0.01, s * (0.1 + 0.2 * u), 0.2 + 0.35 * u);
    ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = Math.max(1.2, s * 0.02); ctx.beginPath();
    [-1, -0.34, 0.34, 1].forEach(function (k) { ctx.moveTo(cx + k * hw * 0.98, cy + hh * 0.3); ctx.lineTo(x, y - fs * 0.22); }); ctx.stroke();
    drawHanky(cx, cy, hw, hh, f.t, bi);
    drawFishBody(x, y, fs, calm ? 0 : Math.sin(f.t * 9), ang * 0.6 - 0.1, true);
  } else if (f.st === 'ground') {
    var hop = calm ? 0 : Math.max(0, Math.sin(f.t * 5 + f.hop)) * s * 0.12, blink = f.t > 9.2 && ((f.t * 6) | 0) % 2 === 0;
    drawShadow(gx, gy - s * 0.01, s * (0.2 - hop / s * 0.4), 0.45);
    ctx.fillStyle = '#fff7e3'; ctx.strokeStyle = '#b84a3a'; ctx.lineWidth = Math.max(1.4, s * 0.025);
    ctx.beginPath(); ctx.ellipse(gx + s * 0.34, gy - s * 0.03, s * 0.17, s * 0.06, 0.1, 0, 6.3); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(224,71,47,.6)'; ctx.beginPath(); ctx.moveTo(gx + s * 0.26, gy - s * 0.07); ctx.lineTo(gx + s * 0.3, gy + s * 0.0); ctx.moveTo(gx + s * 0.38, gy - s * 0.08); ctx.lineTo(gx + s * 0.42, gy); ctx.stroke();
    if (!blink) drawFishBody(gx - s * 0.02, gy - fs * 0.34 - hop, fs, calm ? 0 : Math.sin(f.t * 10), calm ? 0 : Math.sin(f.t * 5 + f.hop) * 0.18, true);
    if (!calm) { var tw = 0.5 + 0.5 * Math.sin(f.t * 5); ctx.globalAlpha = tw; star(ctx, gx + s * 0.25, gy - s * 0.62 - hop, s * 0.08); }
  } else {
    var pg = f.pg; u = Math.min(1, f.t / 0.4);
    if (pg) {
      var mx = px(pg.xn, pg.p), my = py(pg.p) - psz(pg.p) * (pg.big || 1) * 0.42, fx = gx + (mx - gx) * u, fy = gy - fs * 0.34 + (my - gy + fs * 0.34) * u - Math.sin(u * 3.14) * s * 0.4;
      drawFishBody(fx, fy, fs * (1 - 0.65 * u), 0, -u * 2.5, true);
    }
  }
  ctx.restore();
}
/* extra drawing for a penguin that is chewing, glowing or has just evolved; returns scale boosts */
function evolveLook(pg) {
  var r = { sx: 1, sy: 1, rot: 0, glow: 0 }, u, tt = pg.evT || 0;
  if (pg.ev > 0) {
    if (tt < 0.32) { r.sy = 1 + 0.08 * Math.sin(tt * 38); r.sx = 1 - 0.05 * Math.sin(tt * 38); }
    else { u = Math.min(1, (tt - 0.32) / (EV_SWAP - 0.32)); r.rot = Math.sin(tt * 70) * 0.08 * (tt < EV_SWAP ? 1 : 0.3); r.sx = r.sy = 1 + 0.12 * u * (tt < EV_SWAP ? 1 : 0); r.glow = tt < EV_SWAP ? u : Math.max(0, 1 - (tt - EV_SWAP) / 0.4) * 1.3; }
  }
  if (pg.pop > 0) { var k = 1 + pg.pop * 0.6; r.sx *= k; r.sy *= k; }
  return r;
}
function drawEvolveGlow(pg, x, y, s) {
  var u = pg.ev > 0 ? Math.min(1, Math.max(0, (pg.evT - 0.3) / 0.35)) : 0, g, i;
  if (pg.ev <= 0 || calm) return;
  g = evolveLook(pg).glow; if (g <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, g * 0.8);
  var gs = s * (1.4 + 0.5 * g); ctx.drawImage(glowFor(pg.evTo === 'gt' ? '255,150,200' : '140,210,255'), x - gs / 2, y - s * 0.5 - gs / 2, gs, gs);
  ctx.restore();
  if (qLevel < 2 && pg.evT > 0.28) {
    for (i = 0; i < 5; i++) { var a = pg.evT * 7 + i * 1.257, rr = s * (0.5 - 0.15 * u); star(ctx, x + Math.cos(a) * rr, y - s * 0.5 + Math.sin(a) * rr * 0.55, s * 0.06); }
  }
}
