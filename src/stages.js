/* ---------- stages 2 to 5: scenery and Champions. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE). ---------- */
/* every stage is split in two: a warm color on the pineapple side (left) and a cool color on the penguin side (right) */
function hexRgb(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
function mixc(a, b, t) { var x = hexRgb(a), y = hexRgb(b); return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')'; }
/* a band whose top and bottom each blend from a left color to a right color */
function hband(g, y0, y1, tL, tR, bL, bR) {
  var n = Math.max(6, Math.round((y1 - y0) / 4)), i, gr, u;
  for (i = 0; i < n; i++) { u = i / (n - 1); gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, mixc(tL, bL, u)); gr.addColorStop(1, mixc(tR, bR, u)); g.fillStyle = gr; g.fillRect(0, y0 + (y1 - y0) * i / n, W, (y1 - y0) / n + 1.5); }
}
function hgrad(g, cL, cR) { var gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, cL); gr.addColorStop(1, cR); return gr; }
/* ---------- the lanes: each stage paints its own ground pattern in perspective ---------- */
function rnd(i) { var x = Math.sin(i * 12.9898 + 7.13) * 43758.5453; return x - Math.floor(x); }
function lq(g, xa, xb, p0, p1, fill) { g.fillStyle = fill; g.beginPath(); g.moveTo(px(xa, p0), py(p0)); g.lineTo(px(xb, p0), py(p0)); g.lineTo(px(xb, p1), py(p1)); g.lineTo(px(xa, p1), py(p1)); g.closePath(); g.fill(); }
function scatter(g, n, seed, fn) { for (var i = 0; i < n; i++) { var p = 0.09 + 0.88 * rnd(seed + i * 3.1), xn = (rnd(seed + i * 7.7) - 0.5) * 2.5; fn(g, px(xn, p), py(p), psz(p), rnd(seed + i * 5.3), i, xn, p); } }
function starfish(g, x, y, s, c) { g.fillStyle = c; g.strokeStyle = 'rgba(120,50,10,.35)'; g.lineWidth = 1; g.beginPath(); for (var i = 0; i < 10; i++) { var a = i * 0.628 - 1.57, r = i % 2 ? s * 0.045 : s * 0.12; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.55); } g.closePath(); g.fill(); g.stroke(); }
function shell(g, x, y, s, c) { g.fillStyle = c; g.strokeStyle = 'rgba(150,100,60,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + s * 0.03); g.quadraticCurveTo(x - s * 0.13, y - s * 0.06, x - s * 0.07, y - s * 0.1); g.quadraticCurveTo(x, y - s * 0.14, x + s * 0.07, y - s * 0.1); g.quadraticCurveTo(x + s * 0.13, y - s * 0.06, x, y + s * 0.03); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x, y + s * 0.02); g.lineTo(x - s * 0.04, y - s * 0.1); g.moveTo(x, y + s * 0.02); g.lineTo(x + s * 0.04, y - s * 0.1); g.moveTo(x, y + s * 0.02); g.lineTo(x, y - s * 0.12); g.stroke(); }
function prints(g, x, y, s, a) { g.fillStyle = 'rgba(70,90,120,.22)'; for (var k = 0; k < 2; k++) { g.beginPath(); g.ellipse(x + (k ? 1 : -1) * s * 0.05 + a * s * 0.04, y + k * s * 0.03, s * 0.025, s * 0.045, 0.2, 0, 6.3); g.fill(); } }
function crack(g, x, y, s, r) { g.strokeStyle = 'rgba(100,150,190,.45)'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); for (var k = 1; k <= 4; k++) g.lineTo(x + k * s * 0.07 * (r > 0.5 ? 1 : -1), y + (k % 2 ? -1 : 1) * s * 0.03 * (1 + r)); g.moveTo(x + s * 0.14 * (r > 0.5 ? 1 : -1), y); g.lineTo(x + s * 0.2 * (r > 0.5 ? 1 : -1), y + s * 0.07); g.stroke(); }
function laneDeco(g, st) {
  var l, k, x0, x1, p0, y, i, u;
  var pw = function (k2) { return Math.pow(k2, 1.7) * 1.04; };
  if (st === 1) {
    for (l = -2; l <= 2; l++) lq(g, (l - 0.5) * 0.4, (l + 0.5) * 0.4, 0.03, 1.06, l & 1 ? 'rgba(255,248,225,.16)' : 'rgba(190,150,80,.07)');
    g.strokeStyle = 'rgba(160,120,60,.16)'; g.lineWidth = 1.8; g.lineCap = 'round';
    for (k = 1; k <= 9; k++) { p0 = pw(k / 9); y = py(p0); g.beginPath(); for (i = 0; i <= 24; i++) { u = i / 24; var yy = y + Math.sin(u * 14 + k * 1.9) * (2 + 5 * p0) * 0.6; if (i) g.lineTo(u * W, yy); else g.moveTo(0, yy); } g.stroke(); }
    scatter(g, 16, 11, function (g2, x, yb, s, r, i) { if (i % 3 === 0) starfish(g2, x, yb, s, i % 2 ? '#ff9a4a' : '#ff7a6a'); else if (i % 3 === 1) shell(g2, x, yb, s, '#fff0dc'); else { g2.fillStyle = 'rgba(120,100,80,.35)'; g2.beginPath(); g2.ellipse(x, yb, s * 0.05, s * 0.025, 0, 0, 6.3); g2.fill(); } });
  } else if (st === 2) {
    for (l = -2; l <= 2; l++) lq(g, (l - 0.5) * 0.4, (l + 0.5) * 0.4, 0.03, 1.06, l & 1 ? 'rgba(255,255,255,.2)' : 'rgba(120,170,210,.1)');
    scatter(g, 9, 31, function (g2, x, yb, s, r) { crack(g2, x, yb, s, r); });
    scatter(g, 8, 47, function (g2, x, yb, s, r) { prints(g2, x, yb, s, r); prints(g2, x + s * 0.12, yb - s * 0.09, s, r); });
    scatter(g, 12, 53, function (g2, x, yb, s) { g2.fillStyle = 'rgba(255,255,255,.55)'; g2.beginPath(); g2.ellipse(x, yb, s * 0.07, s * 0.025, 0, 0, 6.3); g2.fill(); });
  } else if (st === 3) {
    /* dock boards: three boards per lane, each its own wood tone, with seams, knots, cross beams and nails */
    for (l = -2; l <= 2; l++) for (k = 0; k < 3; k++) { var xa = (l - 0.5 + k / 3) * 0.4, xb = (l - 0.5 + (k + 1) / 3) * 0.4, tn = rnd(l * 13 + k * 5 + 2); lq(g, xa, xb, 0.03, 1.06, 'rgba(' + (tn > 0.5 ? '110,66,28' : '150,98,48') + ',' + (0.13 + tn * 0.12) + ')'); }
    g.strokeStyle = 'rgba(50,25,8,.3)'; g.lineWidth = 1.3;
    for (l = -6; l <= 6; l++) { g.beginPath(); g.moveTo(px(l * 0.4 / 3 - 0.2 / 3 * 0 - 0.0, 0.03) + 0, py(0.03)); g.lineTo(px(l * 0.4 / 3, 1.06), py(1.06)); g.stroke(); }
    for (k = 1; k <= 6; k++) { p0 = pw(k / 6); g.strokeStyle = 'rgba(45,22,6,.34)'; g.lineWidth = 2.6 * (0.4 + p0); g.beginPath(); g.moveTo(0, py(p0)); g.lineTo(W, py(p0)); g.stroke();
      g.fillStyle = 'rgba(30,15,5,.55)'; for (l = -6; l <= 6; l++) { g.beginPath(); g.arc(px(l * 0.4 / 3 + 0.4 / 6, p0), py(p0), Math.max(1.1, psz(p0) * 0.012), 0, 6.3); g.fill(); } }
    scatter(g, 10, 71, function (g2, x, yb, s, r) { g2.strokeStyle = 'rgba(60,30,10,.35)'; g2.lineWidth = 1.2; g2.beginPath(); g2.ellipse(x, yb, s * 0.05, s * 0.022, 0, 0, 6.3); g2.ellipse(x, yb, s * 0.025, s * 0.01, 0, 0, 6.3); g2.stroke(); });
    scatter(g, 4, 83, function (g2, x, yb, s) { g2.fillStyle = 'rgba(120,180,215,.35)'; g2.beginPath(); g2.ellipse(x, yb, s * 0.12, s * 0.04, 0, 0, 6.3); g2.fill(); g2.fillStyle = 'rgba(255,255,255,.5)'; g2.beginPath(); g2.ellipse(x - s * 0.03, yb - s * 0.01, s * 0.04, s * 0.012, 0, 0, 6.3); g2.fill(); });
    /* rope coils */
    [[-0.95, 0.5], [1.0, 0.78]].forEach(function (c) { var x = px(c[0], c[1]), yb = py(c[1]), s = psz(c[1]); g.strokeStyle = '#c9a063'; g.lineWidth = Math.max(2, s * 0.035); for (var q = 0; q < 3; q++) { g.beginPath(); g.ellipse(x, yb, s * (0.1 - q * 0.025), s * (0.04 - q * 0.01), 0, 0, 6.3); g.stroke(); } });
  } else if (st === 4) {
    for (l = -2; l <= 2; l++) lq(g, (l - 0.5) * 0.4, (l + 0.5) * 0.4, 0.03, 1.06, l & 1 ? 'rgba(255,255,255,.07)' : 'rgba(20,20,60,.08)');
    g.lineCap = 'round';
    for (l = -3; l <= 2; l++) { var xe = (l + 0.5) * 0.4; g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2.4; g.beginPath(); for (i = 0; i <= 18; i++) { u = 0.06 + 0.98 * i / 18; var xx = px(xe + Math.sin(u * 9 + l * 1.7) * 0.05, u), yy2 = py(u); if (i) g.lineTo(xx, yy2); else g.moveTo(xx, yy2); } g.stroke(); }
    scatter(g, 14, 97, function (g2, x, yb, s, r) { g2.strokeStyle = 'rgba(255,255,255,.4)'; g2.lineWidth = 1.2; g2.beginPath(); g2.arc(x, yb, s * (0.02 + r * 0.03), 0, 6.3); g2.stroke(); });
    scatter(g, 7, 101, function (g2, x, yb, s, r) { g2.fillStyle = 'rgba(255,255,255,.28)'; g2.beginPath(); g2.ellipse(x, yb, s * (0.1 + r * 0.1), s * 0.03, 0, 0, 6.3); g2.fill(); });
  } else {
    /* the fortress courtyard: a long carpet in each lane, warm on the pineapple side and cool on the penguin side, with gold trim and diamonds */
    var cols = ['rgba(224,87,90,.34)', 'rgba(255,170,120,.3)', 'rgba(255,214,120,.34)', 'rgba(110,200,220,.3)', 'rgba(60,150,190,.34)'];
    for (l = -2; l <= 2; l++) {
      lq(g, (l - 0.42) * 0.4, (l + 0.42) * 0.4, 0.03, 1.06, cols[l + 2]);
      g.strokeStyle = 'rgba(255,214,90,.75)'; g.lineWidth = 2;
      [(l - 0.42) * 0.4, (l + 0.42) * 0.4].forEach(function (xe) { g.beginPath(); g.moveTo(px(xe, 0.03), py(0.03)); g.lineTo(px(xe, 1.06), py(1.06)); g.stroke(); });
      for (k = 1; k <= 8; k++) { p0 = pw(k / 8) * 0.98 + 0.02; var cx2 = px(l * 0.4, p0), cy2 = py(p0), ds = psz(p0) * 0.09; g.fillStyle = 'rgba(255,240,200,.55)'; g.beginPath(); g.moveTo(cx2, cy2 - ds * 0.5); g.lineTo(cx2 + ds, cy2); g.lineTo(cx2, cy2 + ds * 0.5); g.lineTo(cx2 - ds, cy2); g.closePath(); g.fill(); }
    }
    scatter(g, 8, 131, function (g2, x, yb, s) { g2.fillStyle = 'rgba(255,255,255,.6)'; g2.beginPath(); g2.ellipse(x, yb, s * 0.1, s * 0.03, 0, 0, 6.3); g2.fill(); });
  }
}
function laneLines(g, col) { laneDeco(g, stageNo()); }
function tileLines(g, col) {
  var k, y, x0, x1, xn;
  g.strokeStyle = col; g.lineWidth = 1.6;
  for (k = 1; k <= 7; k++) { y = py(Math.pow(k / 7, 1.7) * 1.04); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (k = -4; k <= 3; k++) { xn = (k + 0.5) * 0.4; x0 = px(xn, 0.02); x1 = px(xn, 1.05); g.beginPath(); g.moveTo(x0, py(0.02)); g.lineTo(x1, py(1.05)); g.stroke(); }
}
function dot(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill(); }
function cuteFace(g, x, y, s, blink) {
  g.fillStyle = '#2a120d'; g.beginPath(); if (blink) { g.rect(x - s * 0.34, y - s * 0.02, s * 0.2, s * 0.05); g.rect(x + s * 0.14, y - s * 0.02, s * 0.2, s * 0.05); } else { g.ellipse(x - s * 0.24, y, s * 0.09, s * 0.12, 0, 0, 6.3); g.ellipse(x + s * 0.24, y, s * 0.09, s * 0.12, 0, 0, 6.3); } g.fill();
  if (!blink) { g.fillStyle = '#fff'; g.beginPath(); g.arc(x - s * 0.21, y - s * 0.04, s * 0.032, 0, 6.3); g.arc(x + s * 0.27, y - s * 0.04, s * 0.032, 0, 6.3); g.fill(); }
  g.strokeStyle = '#2a120d'; g.lineWidth = Math.max(1.2, s * 0.05); g.lineCap = 'round'; g.beginPath(); g.arc(x, y + s * 0.1, s * 0.15, 0.2, 2.94); g.stroke();
  g.fillStyle = 'rgba(255,111,143,.45)'; g.beginPath(); g.ellipse(x - s * 0.45, y + s * 0.14, s * 0.1, s * 0.06, 0, 0, 6.3); g.ellipse(x + s * 0.45, y + s * 0.14, s * 0.1, s * 0.06, 0, 0, 6.3); g.fill();
}
function flipflop(g, x, y, s, c1, c2) {
  /* a giant flip-flop stuck upright in the sand: foot-shaped sole (wide toes, narrow arch, round heel), a thick midsole rim, a Y strap and a toe post */
  function foot(k, o) {
    var w = s * k, t = -s * 1.12 * k + o, h = -s * 0.02 + o;
    g.beginPath(); g.moveTo(0, t);
    g.bezierCurveTo(w * 0.27, t, w * 0.36, t + s * 0.16, w * 0.32, t + s * 0.4);
    g.bezierCurveTo(w * 0.3, t + s * 0.58, w * 0.21, t + s * 0.66, w * 0.22, t + s * 0.8);
    g.bezierCurveTo(w * 0.23, t + s * 0.95, w * 0.27, h - s * 0.08, w * 0.17, h);
    g.bezierCurveTo(w * 0.08, h + s * 0.06, -w * 0.08, h + s * 0.06, -w * 0.17, h);
    g.bezierCurveTo(-w * 0.27, h - s * 0.08, -w * 0.23, t + s * 0.95, -w * 0.22, t + s * 0.8);
    g.bezierCurveTo(-w * 0.21, t + s * 0.66, -w * 0.3, t + s * 0.58, -w * 0.32, t + s * 0.4);
    g.bezierCurveTo(-w * 0.36, t + s * 0.16, -w * 0.27, t, 0, t); g.closePath();
  }
  g.save(); g.translate(x, y); g.rotate(-0.1);
  g.fillStyle = 'rgba(40,30,60,.14)'; g.beginPath(); g.ellipse(0, 0, s * 0.42, s * 0.07, 0, 0, 6.3); g.fill();
  g.fillStyle = c2; foot(1.5, 0); g.fill();                         /* the thick sole edge */
  g.fillStyle = c1; foot(1.5 * 0.88, -s * 0.03); g.fill();           /* the top of the sole */
  g.fillStyle = 'rgba(255,255,255,.18)'; foot(1.5 * 0.62, -s * 0.05); g.fill();   /* the soft footbed */
  g.strokeStyle = c2; g.lineWidth = s * 0.03; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(-s * 0.1, -s * 0.15); g.lineTo(s * 0.1, -s * 0.15); g.moveTo(-s * 0.08, -s * 0.09); g.lineTo(s * 0.08, -s * 0.09); g.stroke(); g.globalAlpha = 1;
  /* the Y strap and the toe post */
  g.lineCap = 'round'; g.strokeStyle = c2; g.lineWidth = s * 0.14; g.beginPath(); g.moveTo(0, -s * 0.9); g.lineTo(-s * 0.3, -s * 0.5); g.moveTo(0, -s * 0.9); g.lineTo(s * 0.3, -s * 0.5); g.stroke();
  g.strokeStyle = '#fff7e3'; g.lineWidth = s * 0.09; g.beginPath(); g.moveTo(0, -s * 0.9); g.lineTo(-s * 0.3, -s * 0.5); g.moveTo(0, -s * 0.9); g.lineTo(s * 0.3, -s * 0.5); g.stroke();
  dot(g, 0, -s * 0.9, s * 0.07, c2); dot(g, 0, -s * 0.91, s * 0.045, '#fff7e3');
  cuteFace(g, 0, -s * 0.33, s * 0.4, false);
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-s * 0.2, -s * 0.78, s * 0.035, s * 0.12, 0.25, 0, 6.3); g.fill(); g.restore();
}
function igloo(g, x, y, s) {
  var gr = g.createLinearGradient(x, y - s, x, y); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#cfe6f2');
  g.fillStyle = gr; g.strokeStyle = 'rgba(110,160,190,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, s, s * 0.8, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(110,160,190,.45)'; g.lineWidth = 1.5; for (var k = 1; k < 4; k++) { g.beginPath(); g.ellipse(x, y, s, s * 0.8 * k / 4, 0, Math.PI, 0); g.stroke(); }
  g.fillStyle = '#5a7fa0'; g.beginPath(); g.ellipse(x, y, s * 0.28, s * 0.3, 0, Math.PI, 0); g.closePath(); g.fill();
  g.fillStyle = '#ffd98a'; g.beginPath(); g.ellipse(x, y, s * 0.17, s * 0.19, 0, Math.PI, 0); g.closePath(); g.fill();
}
function snowfall(t, n, col, speed) {
  var i, x, y, r;
  if (qLevel >= 2) n = Math.ceil(n * 0.4);
  ctx.fillStyle = col; ctx.beginPath();
  for (i = 0; i < n; i++) {
    r = (1.2 + (i % 3) * 0.9) * Math.max(1, H / 640);
    y = ((i * 97 + t * H * speed * (0.5 + (i % 4) * 0.18)) % (H * 0.95));
    x = ((i * 53.7) % 100) / 100 * W + Math.sin(t * 0.9 + i) * W * 0.02;
    ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.3);
  }
  ctx.fill();
}
function flag(x, y, s, t, c1, c2) {
  var i, n = 8, w = s * 0.9, h = s * 0.55;
  ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = Math.max(2, s * 0.06); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 1.3); ctx.stroke();
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(x, y - s * 1.3);
  for (i = 1; i <= n; i++) ctx.lineTo(x + w * i / n, y - s * 1.3 + Math.sin(t * 5 - i * 0.8) * s * 0.07 * i / n * 2);
  for (i = n; i >= 0; i--) ctx.lineTo(x + w * i / n, y - s * 1.3 + h + Math.sin(t * 5 - i * 0.8) * s * 0.07 * i / n * 2);
  ctx.closePath(); ctx.fill();
  dot(ctx, x + w * 0.34, y - s * 1.3 + h * 0.5 + Math.sin(t * 5 - 2.4) * s * 0.03, s * 0.12, c2);
}

/* ---------- Champions: a recolored Coach Waddles with their own gear ---------- */
var CHAMP = [null,
  { n: 'Coach Waddles', s: 'Waddles', rank: 'Bronze', kind: 'cw', hp: 3, shield: 4, help: 3.6, big: 1.35, tip: 'Pop the snowballs, then hit him!' },
  /* each Champion after the first plays a different kind of fight (see "Champion fight styles" in extras.js) */
  { n: 'Captain Flipper', s: 'Flipper', rank: 'Silver', kind: 'c2', hp: 4, shield: 0, mode: 'peek', noRegen: 1, help: 4.2, big: 1.35, tip: 'A shaking block means he pops up there!' },
  { n: 'Sir Slidealot', s: 'Slidealot', rank: 'Gold', kind: 'c3', hp: 5, shield: 2, mode: 'charge', noRegen: 1, nohelp: 1, big: 1.35, tip: 'He charges! Every hit knocks him back.' },
  { n: 'Madame Mohawk', s: 'Mohawk', rank: 'Platinum', kind: 'c4', hp: 4, shield: 0, mode: 'guard', noRegen: 1, nohelp: 1, big: 1.4, tip: 'Clear her squad, then hit her!' },
  { n: 'Grand Champion Bernard', s: 'Bernard', rank: 'Grand', kind: 'c5', hp: 6, shield: 3, mode: 'clones', help: 3.4, big: 1.5, tip: 'Only the solid Bernard is real!' }
];
var CHAMP_LOOK = {
  c2: { cap: '#24457a', band: '#a82a1f', medal: '#c4ccd8', medal2: '#f0f4fa', ribbon: '#1f9aa8', vars: '--ad-hi:#6f7f9a;--ad-mid:#34425e;--ad-lo:#141b2e',
    extra: '<path d="M62 52C76 46 124 46 138 52" fill="none" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="40" r="9" fill="#ffd23f" stroke="#fff7e3" stroke-width="2"/><path d="M100 33v14M94 38h12M94 44q6 5 12 0" fill="none" stroke="#24457a" stroke-width="2.4" stroke-linecap="round"/>' },
  c3: { cap: '#8a5a2b', band: '#5a3a18', medal: '#f0b72a', medal2: '#fff0a8', ribbon: '#d63a2e', vars: '--ad-hi:#85735f;--ad-mid:#46382c;--ad-lo:#1f1710',
    extra: '<circle cx="76" cy="46" r="13" fill="#3a2a18" stroke="#fff7e3" stroke-width="2"/><circle cx="124" cy="46" r="13" fill="#3a2a18" stroke="#fff7e3" stroke-width="2"/><circle cx="76" cy="46" r="8.5" fill="#9fe0ff"/><circle cx="124" cy="46" r="8.5" fill="#9fe0ff"/><ellipse cx="73" cy="43" rx="3" ry="2" fill="#fff" opacity=".8"/><ellipse cx="121" cy="43" rx="3" ry="2" fill="#fff" opacity=".8"/><path d="M89 46h22" stroke="#3a2a18" stroke-width="5"/><path d="M72 128c18 8 38 8 56 0l4 10c-20 10-44 10-64 0Z" fill="#ff8a2a" stroke="#fff7e3" stroke-width="2"/><path d="M128 132l22 10-8 12-18-10Z" fill="#ff8a2a" stroke="#fff7e3" stroke-width="2"/>' },
  c4: { cap: '#7a2bbf', band: '#4a1a82', medal: '#e2e6f0', medal2: '#ffffff', ribbon: '#9b5de5', vars: '--ad-hi:#847294;--ad-mid:#42335c;--ad-lo:#1a1230',
    extra: '<path d="M70 52l8-34 8 26 8-38 8 38 8-28 8 36 8-24 2 30Z" fill="#ff4fa3" stroke="#fff7e3" stroke-width="2.6" stroke-linejoin="round"/><path d="M82 48l4-14 4 12 6-18 5 18 5-12 4 14" fill="none" stroke="#ffc2e0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="112" r="5" fill="#ffd23f" stroke="#fff7e3" stroke-width="1.6"/><circle cx="154" cy="112" r="5" fill="#ffd23f" stroke="#fff7e3" stroke-width="1.6"/>' },
  c5: { cap: '#f0b72a', band: '#a8700f', medal: '#ffd23f', medal2: '#fff7c8', ribbon: '#e0286a', vars: '--ad-hi:#6a6a90;--ad-mid:#2c2a55;--ad-lo:#0f0d28',
    behind: '<path d="M44 100C26 130 16 160 14 188L186 188C184 160 174 130 156 100C140 116 60 116 44 100Z" fill="#8a1fd1" stroke="#ffd23f" stroke-width="3.4" stroke-linejoin="round"/><path d="M30 178h140" stroke="#ffd23f" stroke-width="3" stroke-dasharray="6 5"/>',
    extra: '<path d="M52 64C44 50 50 36 62 30M148 64C156 50 150 36 138 30" fill="none" stroke="#2f9a4a" stroke-width="7" stroke-linecap="round"/><path d="M56 46q-9 2-10 10M60 36q-9-2-13 5M144 46q9 2 10 10M140 36q9-2 13 5" fill="none" stroke="#5cc84a" stroke-width="5" stroke-linecap="round"/><path d="M100 14l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" fill="#ffd23f" stroke="#fff7e3" stroke-width="2" stroke-linejoin="round"/>' }
};
function champSvg(markup, k) {
  var L = CHAMP_LOOK[k], s = markup;
  s = s.split('#d63a2e').join(L.cap).split('#a82a1f').join(L.band).split('#cd7f32').join(L.medal).split('#f3c18a').join(L.medal2).split('#3a7bd5').join(L.ribbon);
  if (L.behind) s = s.replace('<ellipse cx="74" cy="184"', L.behind + '<ellipse cx="74" cy="184"');
  if (k === 'c5') s = s.replace('r="11" fill="' + L.medal, 'r="15" fill="' + L.medal);
  return s.replace(/<\/svg>\s*$/, L.extra + '</svg>');
}

/* ---------- the five stages ---------- */
var STAGES = [null,
  { title: 'Sandy Snack\nShore', cloud: 'rgba(255,255,255,.85)' },
  { title: 'Flip-Flop\nFlats', cloud: 'rgba(255,240,232,.86)',
    sky: ['#ffb48a', '#8fd8ee', '#ffe3bc', '#d9f4fa'], gnd: ['#fbe6da', '#d5f0f9', '#f2c9b6', '#a9d9ec'],
    draw: function (g) { sceneFlats(g); }, anim: function (t) { animFlats(t); } },
  { title: 'Iceberg Harbor\nHullabaloo', cloud: 'rgba(255,238,205,.82)',
    sky: ['#ff9f4a', '#4f93d3', '#ffe2a6', '#bfe3f6'], gnd: ['#dcab6c', '#a9c9dc', '#b8803f', '#7aa5bd'],
    draw: function (g) { sceneHarbor(g); }, anim: function (t) { animHarbor(t); } },
  { title: 'Stormy\nSplash Sea', cloud: 'rgba(78,48,100,.78)',
    sky: ['#7d3c8a', '#264a66', '#e47a8e', '#5aa3a8'], gnd: ['#c07894', '#418da0', '#8a4a6c', '#2a6075'],
    draw: function (g) { sceneStorm(g); }, anim: function (t) { animStorm(t); } },
  { title: 'Glacier Party\nFortress', cloud: 'rgba(255,228,218,.72)',
    sky: ['#ff8f78', '#1f8f9e', '#ffd5a4', '#8fd6e8'], gnd: ['#ffe5d4', '#cdeff6', '#f5c9b0', '#9fd4e6'],
    draw: function (g) { sceneFort(g); }, anim: function (t) { animFort(t); } }
];
function stageNo() { return (S && S.stage) || 1; }
function buildStageBg() {
  var d = STAGES[stageNo()], g;
  bg = document.createElement('canvas'); bg.width = cv.width; bg.height = cv.height;
  g = bg.getContext('2d'); g.scale(DPR, DPR);
  hband(g, 0, hy + 2, d.sky[0], d.sky[1], d.sky[2], d.sky[3]);
  d.draw(g);
  var vg = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.45, W / 2, H * 0.55, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(42,18,13,0)'); vg.addColorStop(1, 'rgba(42,18,13,.2)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function groundBand(g, y0) { var d = STAGES[stageNo()]; hband(g, y0, H, d.gnd[0], d.gnd[1], d.gnd[2], d.gnd[3]); }

/* stage 2: Flip-Flop Flats. A peach sunset over the beach melts into the ice flats. */
function sceneFlats(g) {
  var sr = Math.min(W, H) * 0.09;
  var sg = g.createRadialGradient(W * 0.1, hy, 0, W * 0.1, hy, sr * 2.2); sg.addColorStop(0, '#fff6d6'); sg.addColorStop(0.35, '#ffd08a'); sg.addColorStop(0.5, 'rgba(255,170,120,.4)'); sg.addColorStop(1, 'rgba(255,170,120,0)');
  g.fillStyle = sg; g.beginPath(); g.arc(W * 0.1, hy, sr * 2.2, 0, 6.3); g.fill();
  peaks(g, hy, H * 0.16, [0.5, 0.8, 0.45, 0.9, 0.6, 1, 0.55, 0.85, 0.5], hgrad(g, '#f6d9cf', '#d3ecf6'));
  peaks(g, hy + 2, H * 0.09, [0.6, 0.9, 0.5, 0.85, 1, 0.55, 0.9, 0.5, 0.8, 0.6], hgrad(g, '#f3cdc0', '#bfe0ee'));
  groundBand(g, hy);
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(W * 0.5, hy + H * 0.012, W * 0.6, H * 0.012, 0, 0, 6.3); g.fill();
  g.strokeStyle = 'rgba(120,170,200,.35)'; g.lineWidth = 1.6; g.lineCap = 'round';
  [[0.22, 0.58], [0.64, 0.7], [0.82, 0.62], [0.4, 0.86], [0.1, 0.8], [0.9, 0.9]].forEach(function (c) { var x = W * c[0], y = hy + (H - hy) * c[1]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + W * 0.06, y + 5); g.lineTo(x + W * 0.1, y - 3); g.moveTo(x + W * 0.06, y + 5); g.lineTo(x + W * 0.05, y + 14); g.stroke(); });
  laneLines(g, 'rgba(90,120,160,.1)');
  var fs = Math.min(H * 0.11, W * 0.19);
  flipflop(g, W * 0.07, hy + H * 0.06, fs, '#ff7f6e', '#c9483a'); flipflop(g, W * 0.2, hy + H * 0.045, fs * 0.78, '#ffd23f', '#c99410'); flipflop(g, W * 0.31, hy + H * 0.036, fs * 0.62, '#ff9fc2', '#c9608a');
  igloo(g, W * 0.9, hy + H * 0.055, Math.min(H * 0.09, W * 0.15));
}
function drawSeal(x, y, s, up, t) {
  /* a little seal rising out of a hole in the ice and waving */
  var wv = Math.sin(t * 9) * 0.5, blink = (t % 3.1) < 0.12;
  ctx.fillStyle = '#2f5d7a'; ctx.beginPath(); ctx.ellipse(x, y, s * 0.62, s * 0.2, 0, 0, 6.3); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(x - s, y - s * 2, s * 2, s * 2 + s * 0.02); ctx.clip();
  var hy0 = y + s * 0.4 - up * s * 0.9;
  ctx.fillStyle = '#9db0c4'; ctx.beginPath(); ctx.ellipse(x, hy0 + s * 0.45, s * 0.5, s * 0.58, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#b8c8d8'; ctx.beginPath(); ctx.ellipse(x, hy0 + s * 0.14, s * 0.42, s * 0.36, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#f2f6fa'; ctx.beginPath(); ctx.ellipse(x, hy0 + s * 0.27, s * 0.26, s * 0.2, 0, 0, 6.3); ctx.fill();
  dot(ctx, x, hy0 + s * 0.2, s * 0.06, '#2a2a3a');
  ctx.fillStyle = '#2a2a3a'; if (blink) ctx.fillRect(x - s * 0.24, hy0 + s * 0.06, s * 0.14, s * 0.03), ctx.fillRect(x + s * 0.1, hy0 + s * 0.06, s * 0.14, s * 0.03); else { dot(ctx, x - s * 0.17, hy0 + s * 0.08, s * 0.065, '#2a2a3a'); dot(ctx, x + s * 0.17, hy0 + s * 0.08, s * 0.065, '#2a2a3a'); dot(ctx, x - s * 0.15, hy0 + s * 0.06, s * 0.022, '#fff'); dot(ctx, x + s * 0.19, hy0 + s * 0.06, s * 0.022, '#fff'); }
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - s * 0.1, hy0 + s * 0.24); ctx.lineTo(x - s * 0.42, hy0 + s * 0.2); ctx.moveTo(x - s * 0.1, hy0 + s * 0.27); ctx.lineTo(x - s * 0.4, hy0 + s * 0.32); ctx.moveTo(x + s * 0.1, hy0 + s * 0.24); ctx.lineTo(x + s * 0.42, hy0 + s * 0.2); ctx.moveTo(x + s * 0.1, hy0 + s * 0.27); ctx.lineTo(x + s * 0.4, hy0 + s * 0.32); ctx.stroke();
  ctx.fillStyle = '#8397ac'; ctx.save(); ctx.translate(x + s * 0.46, hy0 + s * 0.55); ctx.rotate(-0.9 + wv); ctx.beginPath(); ctx.ellipse(0, -s * 0.22, s * 0.11, s * 0.28, 0, 0, 6.3); ctx.fill(); ctx.restore();
  ctx.restore();
}
function animFlats(t) {
  var i, u = H / 640;
  /* the sunset glow breathes */
  if (dyn.halo) { var hs = Math.min(W, H) * (0.5 + 0.04 * Math.sin(t * 1.1)); ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 1.1 + 1); ctx.drawImage(dyn.halo, W * 0.1 - hs / 2, hy - hs / 2, hs, hs); ctx.globalAlpha = 1; }
  /* a flip-flop sled slides along the far ice */
  var sx = ((t * W * 0.035) % (W * 1.2)) - W * 0.1, sy = hy + H * 0.02, ss = H * 0.035;
  ctx.save(); ctx.translate(sx, sy + Math.sin(t * 7) * 0.8); ctx.rotate(Math.PI / 2 - 0.08); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(0, 0, ss * 0.5, ss * 0.28, 0, 0, 6.3); ctx.fill(); ctx.restore();
  dot(ctx, sx + ss * 0.1, sy - ss * 0.38, ss * 0.18, '#fff7e3');
  if (qLevel < 2 && !calm) for (i = 1; i < 5; i++) { ctx.globalAlpha = 0.5 - i * 0.1; dot(ctx, sx - i * ss * 0.5, sy + ss * 0.1, ss * 0.1, '#fff'); } ctx.globalAlpha = 1;
  /* the seal pops up every few seconds */
  var cyc = (t % 8), up = cyc < 0.9 ? cyc / 0.9 : cyc < 4 ? 1 : cyc < 4.8 ? 1 - (cyc - 4) / 0.8 : 0;
  up = up * up * (3 - 2 * up);
  if (up > 0.02) drawSeal(W * 0.78, hy + H * 0.12, Math.min(H * 0.07, W * 0.12), up, t);
  else { ctx.fillStyle = '#2f5d7a'; ctx.beginPath(); ctx.ellipse(W * 0.78, hy + H * 0.12, Math.min(H * 0.07, W * 0.12) * 0.62, Math.min(H * 0.07, W * 0.12) * 0.2, 0, 0, 6.3); ctx.fill(); }
  if (qLevel < 2) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
    for (i = 0; i < 8; i++) { var a = Math.pow(Math.max(0, Math.sin(t * 1.8 + i * 1.9)), 6); if (a < 0.05) continue; var tx = W * (0.08 + ((i * 0.131) % 0.84)), ty = hy + H * (0.05 + (i % 4) * 0.12), r = H * 0.011 * (0.5 + a); ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(tx - r, ty); ctx.lineTo(tx + r, ty); ctx.moveTo(tx, ty - r); ctx.lineTo(tx, ty + r); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  snowfall(t, 16, 'rgba(255,255,255,.85)', 0.05 * u);
}

/* stage 3: Iceberg Harbor Hullabaloo. A golden dock on the left, big blue icebergs on the right. */
function sceneHarbor(g) {
  var wy = hy + H * 0.05, i;
  /* icebergs on the penguin side */
  [[0.74, 0.2, 0.14], [0.9, 0.26, 0.16], [0.6, 0.12, 0.09]].forEach(function (b) {
    var x = W * b[0], h = H * b[1], w = W * b[2], gr = g.createLinearGradient(x, hy - h, x, hy + 4); gr.addColorStop(0, '#f2fbff'); gr.addColorStop(1, '#a9d4ea');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, hy + 3); g.lineTo(x - w * 0.55, hy - h * 0.55); g.lineTo(x - w * 0.2, hy - h * 0.78); g.lineTo(x + w * 0.1, hy - h); g.lineTo(x + w * 0.5, hy - h * 0.5); g.lineTo(x + w, hy + 3); g.closePath(); g.fill();
    g.fillStyle = 'rgba(90,150,200,.4)'; g.beginPath(); g.moveTo(x + w * 0.1, hy - h); g.lineTo(x + w * 0.5, hy - h * 0.5); g.lineTo(x + w, hy + 3); g.lineTo(x + w * 0.2, hy + 3); g.closePath(); g.fill();
  });
  /* the sea */
  var sea = g.createLinearGradient(0, 0, W, 0); sea.addColorStop(0, '#f4b27c'); sea.addColorStop(0.5, '#8fc0de'); sea.addColorStop(1, '#2f7fb5');
  g.fillStyle = sea; g.fillRect(0, hy, W, wy - hy);
  g.fillStyle = 'rgba(255,255,255,.3)'; for (i = 0; i < 12; i++) g.fillRect(W * (i * 0.083 + 0.02), hy + H * (0.008 + (i % 3) * 0.012), W * 0.04, 2);
  /* the boardwalk: warm planks on the left, frosty ones on the right */
  groundBand(g, wy);
  laneLines(g, 'rgba(70,40,15,.12)');
  /* a lighthouse, a stack of fruit crates and lanterns on the sunny side */
  var lx = W * 0.1, lh = H * 0.24, lw = W * 0.06;
  g.fillStyle = '#fff7e3'; g.beginPath(); g.moveTo(lx - lw, wy); g.lineTo(lx - lw * 0.62, wy - lh); g.lineTo(lx + lw * 0.62, wy - lh); g.lineTo(lx + lw, wy); g.closePath(); g.fill();
  g.fillStyle = '#e0472f'; for (i = 0; i < 3; i++) { var a0 = wy - lh * (i * 0.34 + 0.08), a1 = wy - lh * (i * 0.34 + 0.24), k0 = 1 - (wy - a0) / lh * 0.38, k1 = 1 - (wy - a1) / lh * 0.38; g.beginPath(); g.moveTo(lx - lw * k0, a0); g.lineTo(lx - lw * k1, a1); g.lineTo(lx + lw * k1, a1); g.lineTo(lx + lw * k0, a0); g.closePath(); g.fill(); }
  g.fillStyle = '#4a3a58'; g.fillRect(lx - lw * 0.7, wy - lh - H * 0.03, lw * 1.4, H * 0.03); g.fillStyle = '#ffe58a'; g.fillRect(lx - lw * 0.5, wy - lh - H * 0.027, lw, H * 0.022);
  g.fillStyle = '#e0472f'; g.beginPath(); g.moveTo(lx - lw * 0.8, wy - lh - H * 0.03); g.lineTo(lx, wy - lh - H * 0.07); g.lineTo(lx + lw * 0.8, wy - lh - H * 0.03); g.closePath(); g.fill();
  var cs = H * 0.035;
  [[0.2, 0], [0.2 + 0.075, 0], [0.2 + 0.0375, -1]].forEach(function (c) {
    var cx = W * c[0], cy = wy + H * 0.03 + c[1] * cs; g.fillStyle = '#a8703a'; g.strokeStyle = '#6b4220'; g.lineWidth = 2; g.fillRect(cx - cs * 0.9, cy - cs, cs * 1.8, cs); g.strokeRect(cx - cs * 0.9, cy - cs, cs * 1.8, cs);
    g.beginPath(); g.moveTo(cx - cs * 0.9, cy - cs * 0.5); g.lineTo(cx + cs * 0.9, cy - cs * 0.5); g.stroke(); dot(g, cx - cs * 0.35, cy - cs * 1.15, cs * 0.3, '#ffd23f'); dot(g, cx + cs * 0.3, cy - cs * 1.12, cs * 0.28, '#ff9f4a');
  });
  g.strokeStyle = '#6b4220'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * 0.02, wy + H * 0.005); g.lineTo(W * 0.02, wy - H * 0.07); g.stroke();
}
function animHarbor(t) {
  var i, wy = hy + H * 0.05, bs = Math.min(H * 0.075, W * 0.13);
  /* the lighthouse beam sweeps back and forth */
  var lx = W * 0.1, ly = wy - H * 0.24 - H * 0.02, ang = Math.sin(t * 0.8) * 0.35;
  ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang); var bm = gk('beam', function () { var b = ctx.createLinearGradient(0, 0, W * 0.6, 0); b.addColorStop(0, 'rgba(255,240,170,.5)'); b.addColorStop(1, 'rgba(255,240,170,0)'); return b; });
  ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * 0.6, -H * 0.05); ctx.lineTo(W * 0.6, H * 0.05); ctx.closePath(); ctx.fill(); ctx.restore();
  /* a little sailboat with a pineapple on its sail drifts and bobs */
  var bx = W * 0.34 + Math.sin(t * 0.25) * W * 0.04, by = hy + H * 0.026 + Math.sin(t * 1.3) * 2.2;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(t * 1.3 + 1) * 0.05);
  ctx.fillStyle = '#7a4a22'; ctx.beginPath(); ctx.moveTo(-bs * 0.5, -bs * 0.1); ctx.lineTo(bs * 0.5, -bs * 0.1); ctx.lineTo(bs * 0.34, bs * 0.18); ctx.lineTo(-bs * 0.34, bs * 0.18); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#4a2f1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -bs * 0.1); ctx.lineTo(0, -bs * 0.95); ctx.stroke();
  ctx.fillStyle = '#fff7e3'; ctx.beginPath(); ctx.moveTo(bs * 0.04, -bs * 0.92); ctx.quadraticCurveTo(bs * (0.5 + Math.sin(t * 2) * 0.04), -bs * 0.5, bs * 0.04, -bs * 0.16); ctx.closePath(); ctx.fill();
  dot(ctx, bs * 0.17, -bs * 0.5, bs * 0.11, '#f8bd1c'); ctx.fillStyle = '#3fbf6a'; ctx.beginPath(); ctx.moveTo(bs * 0.1, -bs * 0.6); ctx.lineTo(bs * 0.17, -bs * 0.74); ctx.lineTo(bs * 0.24, -bs * 0.6); ctx.fill();
  ctx.restore();
  /* a bell buoy rings on the iceberg side */
  var ux = W * 0.62, uy = hy + H * 0.03 + Math.sin(t * 1.7) * 2.6, us = H * 0.05;
  ctx.save(); ctx.translate(ux, uy); ctx.rotate(Math.sin(t * 1.7 + 2) * 0.12);
  ctx.fillStyle = '#e0472f'; ctx.beginPath(); ctx.moveTo(-us * 0.5, 0); ctx.lineTo(-us * 0.28, -us * 0.8); ctx.lineTo(us * 0.28, -us * 0.8); ctx.lineTo(us * 0.5, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff7e3'; ctx.fillRect(-us * 0.4, -us * 0.5, us * 0.8, us * 0.16); ctx.strokeStyle = '#4a3a58'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-us * 0.2, -us * 0.8); ctx.lineTo(-us * 0.2, -us * 1.15); ctx.lineTo(us * 0.2, -us * 1.15); ctx.lineTo(us * 0.2, -us * 0.8); ctx.stroke();
  var sw = Math.sin(t * 5) * 0.5; ctx.save(); ctx.translate(0, -us * 1.15); ctx.rotate(sw); dot(ctx, 0, us * 0.12, us * 0.11, '#ffd23f'); ctx.restore();
  var blink = (t % 1.4) < 0.5; dot(ctx, 0, -us * 0.85, us * 0.07, blink ? '#fff3a8' : '#a8801a'); ctx.restore();
  if (Math.abs(sw) > 0.45 && qLevel < 2) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(ux, uy - us * 1.1, us * 0.36, -0.9, 0.2); ctx.stroke(); }
  /* a whale spouts far out */
  var wc = (t % 9), wx = W * 0.86, wyy = hy + H * 0.012;
  if (wc < 3) { var rise = Math.sin(wc / 3 * Math.PI); ctx.fillStyle = '#4a6f9a'; ctx.beginPath(); ctx.ellipse(wx, wyy + 2, H * 0.03, H * 0.016 * rise, 0, Math.PI, 0); ctx.fill();
    if (wc > 0.6 && wc < 2.4) { var sp = (wc - 0.6) / 1.8; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; for (i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(wx, wyy - H * 0.005); ctx.quadraticCurveTo(wx + i * H * 0.025 * sp, wyy - H * 0.06 * Math.min(1, sp * 2), wx + i * H * 0.04 * sp, wyy - H * 0.03 * (1 - sp) - H * 0.01); ctx.stroke(); } } }
  /* gulls */
  if (qLevel < 2) for (i = 0; i < 3; i++) {
    var gx = ((t * W * (0.03 + i * 0.01) + W * (0.1 + i * 0.4)) % (W * 1.3)) - W * 0.15, gyy = hy * (0.55 - i * 0.1) + Math.sin(t * 0.8 + i * 3) * H * 0.012, fl = Math.sin(t * 5 + i * 2) * 0.55, gs = W * 0.026;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(gx - gs, gyy - gs * fl * 0.6); ctx.quadraticCurveTo(gx - gs * 0.45, gyy - gs * (0.5 + fl * 0.5), gx, gyy); ctx.quadraticCurveTo(gx + gs * 0.45, gyy - gs * (0.5 + fl * 0.5), gx + gs, gyy - gs * fl * 0.6); ctx.stroke();
  }
  /* lantern glints on the dock */
  if (qLevel < 2) for (i = 0; i < 6; i++) { var a = Math.pow(Math.max(0, Math.sin(t * 2 + i * 1.7)), 6); if (a < 0.05) continue; var tx = W * (0.05 + ((i * 0.151) % 0.5)), ty = wy + H * (0.04 + (i % 3) * 0.1), r = H * 0.01 * (0.5 + a); ctx.globalAlpha = a; ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx - r, ty); ctx.lineTo(tx + r, ty); ctx.moveTo(tx, ty - r); ctx.lineTo(tx, ty + r); ctx.stroke(); ctx.globalAlpha = 1; }
}

/* stage 4: Stormy Splash Sea. Rosy-violet storm on the left, deep teal water on the right. */
function sceneStorm(g) {
  var i, wy = hy + H * 0.07;
  hband(g, hy - H * 0.04, wy, '#9a5aa0', '#2b6f80', '#6a3a7a', '#1d5666');
  g.fillStyle = hgrad(g, '#d98aa8', '#7fc3cc');
  for (i = 0; i < 14; i++) { var x = W * (i / 13); g.beginPath(); g.ellipse(x, hy + H * 0.005 + (i % 2) * H * 0.012, W * 0.055, H * 0.014, 0, Math.PI, 0); g.fill(); }
  groundBand(g, wy);
  g.fillStyle = 'rgba(255,255,255,.16)';
  for (i = 0; i < 7; i++) { var y = wy + (H - wy) * (0.12 + i * 0.13), x2 = W * (((i * 0.37) % 1) * 0.85 + 0.05); g.beginPath(); g.ellipse(x2, y, W * (0.05 + i * 0.01), H * 0.012, 0, 0, 6.3); g.fill(); }
  laneLines(g, 'rgba(255,255,255,.08)');
  stormLand(g, wy);
  /* big curling waves on each side */
  [[0.04, 1], [0.96, -1]].forEach(function (c) {
    var x = W * c[0], s = c[1], hh = H * 0.1, ww = W * 0.12;
    g.fillStyle = c[1] > 0 ? '#7a3c88' : '#1f6577'; g.beginPath(); g.moveTo(x - s * ww * 0.2, wy + 2); g.quadraticCurveTo(x + s * ww * 0.1, wy - hh * 1.3, x + s * ww * 0.9, wy - hh * 0.7); g.quadraticCurveTo(x + s * ww * 0.6, wy - hh * 0.5, x + s * ww * 0.7, wy - hh * 0.2); g.quadraticCurveTo(x + s * ww * 0.5, wy - hh * 0.05, x + s * ww * 0.9, wy + 2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + s * ww * 0.1, wy - hh * 1.0); g.quadraticCurveTo(x + s * ww * 0.5, wy - hh * 1.1, x + s * ww * 0.8, wy - hh * 0.62); g.stroke();
  });
}
function stormCloud(x, y, s, t, smile) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 0.9) * s * 0.04);
  var gr = gk('storm' + Math.round(s), function () { var g = ctx.createLinearGradient(0, -s * 0.5, 0, s * 0.5); g.addColorStop(0, '#6a5a8a'); g.addColorStop(1, '#3f3560'); return g; });
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, s * 0.18, s * 0.95, s * 0.3, 0, 0, 6.3); ctx.arc(-s * 0.5, 0, s * 0.34, 0, 6.3); ctx.arc(-s * 0.1, -s * 0.22, s * 0.46, 0, 6.3); ctx.arc(s * 0.42, -s * 0.02, s * 0.36, 0, 6.3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.ellipse(-s * 0.25, -s * 0.34, s * 0.22, s * 0.08, -0.3, 0, 6.3); ctx.fill();
  var blink = (t % 3.3) < 0.12;
  ctx.fillStyle = '#fff'; if (!blink) { ctx.beginPath(); ctx.ellipse(-s * 0.2, s * 0.02, s * 0.1, s * 0.12, 0, 0, 6.3); ctx.ellipse(s * 0.16, s * 0.02, s * 0.1, s * 0.12, 0, 0, 6.3); ctx.fill(); dot(ctx, -s * 0.18, s * 0.04, s * 0.05, '#2a1a40'); dot(ctx, s * 0.18, s * 0.04, s * 0.05, '#2a1a40'); } else { ctx.fillRect(-s * 0.3, s * 0.02, s * 0.2, 3); ctx.fillRect(s * 0.06, s * 0.02, s * 0.2, 3); }
  ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, s * 0.04); ctx.lineCap = 'round'; ctx.beginPath(); if (smile) ctx.arc(0, s * 0.12, s * 0.12, 0.2, 2.94); else ctx.arc(0, s * 0.3, s * 0.11, 3.5, 5.9); ctx.stroke();
  ctx.fillStyle = 'rgba(255,111,143,.5)'; ctx.beginPath(); ctx.ellipse(-s * 0.36, s * 0.14, s * 0.07, s * 0.045, 0, 0, 6.3); ctx.ellipse(s * 0.32, s * 0.14, s * 0.07, s * 0.045, 0, 0, 6.3); ctx.fill();
  ctx.restore();
}
function duck(x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.1) * 2.2); ctx.rotate(Math.sin(t * 1.5) * 0.12);
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.34, 0, 0, 6.3); ctx.fill(); dot(ctx, s * 0.32, -s * 0.3, s * 0.26, '#ffd23f');
  ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.moveTo(s * 0.52, -s * 0.3); ctx.lineTo(s * 0.8, -s * 0.24); ctx.lineTo(s * 0.52, -s * 0.18); ctx.fill();
  dot(ctx, s * 0.36, -s * 0.36, s * 0.045, '#2a120d'); ctx.fillStyle = '#e8aa22'; ctx.beginPath(); ctx.ellipse(-s * 0.12, -s * 0.04, s * 0.2, s * 0.13, -0.4, 0, 6.3); ctx.fill(); ctx.restore();
}
/* stage 4 extras: a striped lighthouse on a rocky islet, foam along the horizon, toy-glossy highlights on the swell */
function stormLand(g, wy) {
  var i, lx = W * 0.21, by = hy + H * 0.016, th = H * 0.15, tw = Math.max(14, W * 0.05), gr, y;
  /* foam and sparkle along the far water */
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath();
  for (i = 0; i < 22; i++) { var fx = W * (i / 21) + Math.sin(i * 2.3) * 8, fy = hy + H * (0.012 + (i % 3) * 0.006); g.ellipse(fx, fy, W * 0.022, H * 0.0035, 0, 0, 6.3); }
  g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, hy + H * 0.006, W, 2);
  /* the islet */
  gr = g.createLinearGradient(0, by - H * 0.02, 0, by + H * 0.02); gr.addColorStop(0, '#9c8aa8'); gr.addColorStop(1, '#4e4268');
  g.fillStyle = gr; g.beginPath(); g.ellipse(lx, by, tw * 2.1, H * 0.022, 0, Math.PI, 0); g.fill(); g.fillStyle = '#3d3358'; g.beginPath(); g.ellipse(lx, by, tw * 2.1, H * 0.008, 0, 0, Math.PI); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(lx - tw * 0.9, by - H * 0.01, tw * 0.5, H * 0.004, 0, 0, 6.3); g.fill();
  /* the tower: red and white stripes, a little round shading */
  g.save(); g.beginPath(); g.moveTo(lx - tw * 0.75, by - H * 0.006); g.lineTo(lx - tw * 0.45, by - th); g.lineTo(lx + tw * 0.45, by - th); g.lineTo(lx + tw * 0.75, by - H * 0.006); g.closePath(); g.clip();
  for (i = 0; i < 5; i++) { y = by - th + (th * i) / 5; g.fillStyle = i % 2 ? '#fff7e8' : '#e8473d'; g.fillRect(lx - tw, y, tw * 2, th / 5 + 1); }
  gr = g.createLinearGradient(lx - tw * 0.75, 0, lx + tw * 0.75, 0); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(30,10,60,.4)'); g.fillStyle = gr; g.fillRect(lx - tw, by - th, tw * 2, th + 4);
  g.restore();
  g.strokeStyle = 'rgba(60,20,40,.5)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(lx - tw * 0.75, by - H * 0.006); g.lineTo(lx - tw * 0.45, by - th); g.moveTo(lx + tw * 0.75, by - H * 0.006); g.lineTo(lx + tw * 0.45, by - th); g.stroke();
  /* gallery rail, lantern room and cap */
  g.fillStyle = '#3d3358'; g.fillRect(lx - tw * 0.75, by - th - H * 0.006, tw * 1.5, H * 0.008);
  g.fillStyle = '#ffe9a6'; g.strokeStyle = '#3d3358'; g.lineWidth = 1.5; g.fillRect(lx - tw * 0.32, by - th - H * 0.034, tw * 0.64, H * 0.028); g.strokeRect(lx - tw * 0.32, by - th - H * 0.034, tw * 0.64, H * 0.028);
  g.fillStyle = '#e8473d'; g.beginPath(); g.moveTo(lx - tw * 0.5, by - th - H * 0.034); g.lineTo(lx, by - th - H * 0.062); g.lineTo(lx + tw * 0.5, by - th - H * 0.034); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(lx - tw * 0.16, by - th * 0.55, tw * 0.08, th * 0.3, 0.08, 0, 6.3); g.fill();
}
function stormLay() {
  var u = Math.min(H * 0.1, W * 0.2);
  return { lh: { x: W * 0.21, y: hy + H * 0.016 - H * 0.15 - H * 0.025, r: H * 0.08 }, wh: { x: W * 0.62, y: hy + H * 0.035, r: H * 0.075 } };
}
/* little toys on the swell: a sailboat, two buoys with blinking lights, and a friendly whale that leaps and splashes now and then */
function stormToys(t) {
  var i, c = S.sc || (S.sc = {}), L = stormLay(), s, x, y, k, f;
  /* a sailboat crosses slowly */
  s = Math.min(H * 0.05, W * 0.1); x = ((t * W * 0.012 + W * 0.3) % (W * 1.3)) - W * 0.15; y = hy + H * 0.026 + Math.sin(t * 1.7) * 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.4) * 0.05);
  ctx.fillStyle = '#e8473d'; ctx.beginPath(); ctx.moveTo(-s * 0.55, -s * 0.12); ctx.lineTo(s * 0.55, -s * 0.12); ctx.lineTo(s * 0.38, s * 0.14); ctx.lineTo(-s * 0.4, s * 0.14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-s * 0.5, -s * 0.1, s * 1.0, s * 0.04);
  ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, -s * 0.12); ctx.lineTo(0, -s * 0.95); ctx.stroke();
  ctx.fillStyle = '#fff7e8'; ctx.beginPath(); ctx.moveTo(s * 0.04, -s * 0.9); ctx.quadraticCurveTo(s * 0.5, -s * 0.5, s * 0.46, -s * 0.2); ctx.lineTo(s * 0.04, -s * 0.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(s * 0.04, -s * 0.62); ctx.lineTo(s * 0.34, -s * 0.5); ctx.lineTo(s * 0.04, -s * 0.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff6f9c'; ctx.beginPath(); ctx.moveTo(-s * 0.02, -s * 0.95); ctx.lineTo(-s * 0.3, -s * 0.86); ctx.lineTo(-s * 0.02, -s * 0.78); ctx.fill();
  ctx.restore();
  /* buoys */
  for (i = 0; i < 2; i++) {
    s = Math.min(H * 0.032, W * 0.07); x = W * (i ? 0.88 : 0.46); y = hy + H * (i ? 0.05 : 0.043) + Math.sin(t * 2 + i * 2) * 2.4; f = (t * 1.3 + i * 0.5) % 1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.6 + i) * 0.1);
    ctx.fillStyle = '#e8473d'; ctx.beginPath(); ctx.moveTo(-s * 0.5, s * 0.2); ctx.quadraticCurveTo(-s * 0.5, -s * 0.5, 0, -s * 0.6); ctx.quadraticCurveTo(s * 0.5, -s * 0.5, s * 0.5, s * 0.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff7e8'; ctx.fillRect(-s * 0.5, -s * 0.12, s, s * 0.14);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-s * 0.22, -s * 0.3, s * 0.08, s * 0.15, 0.3, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#4a3a50'; ctx.fillRect(-s * 0.06, -s * 0.9, s * 0.12, s * 0.32);
    ctx.globalAlpha = f < 0.5 ? 0.9 : 0.25; ctx.drawImage(glowFor('255,225,110'), -s * 0.6, -s * 1.5, s * 1.2, s * 1.2); ctx.globalAlpha = 1;
    dot(ctx, 0, -s * 0.92, s * 0.1, f < 0.5 ? '#fff6b0' : '#c9a24a');
    ctx.restore();
  }
  /* the whale: up out of the swell, a flip, a spout, back in */
  var pc = (t % 13) / 2.1, tap = c.whT !== undefined ? S.t - c.whT : 9, ph = pc < 1 ? pc : tap < 2.3 ? tap / 1.9 : -1, wl = hy + H * 0.052;
  s = Math.min(H * 0.1, W * 0.2); x = L.wh.x; c.whA = false;
  if (ph >= 0 && ph <= 1.2) {
    c.whA = true; k = Math.sin(Math.min(1, ph) * Math.PI); y = wl + s * 0.3 - k * s * 0.7;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, wl + 2); ctx.clip(); ctx.translate(x, y); ctx.rotate(-0.6 + Math.min(1, ph) * 1.2);
    ctx.fillStyle = '#4f86d8'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.6, s * 0.32, 0, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.5, 0); ctx.quadraticCurveTo(s * 0.9, -s * 0.1, s * 0.95, -s * 0.38); ctx.quadraticCurveTo(s * 0.72, -s * 0.22, s * 0.7, -s * 0.12); ctx.quadraticCurveTo(s * 0.72, s * 0.04, s * 0.95, s * 0.14); ctx.quadraticCurveTo(s * 0.8, s * 0.06, s * 0.5, s * 0.1); ctx.fill();
    ctx.fillStyle = '#fff1dc'; ctx.beginPath(); ctx.ellipse(-s * 0.04, s * 0.14, s * 0.5, s * 0.15, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-s * 0.2, -s * 0.18, s * 0.26, s * 0.06, -0.15, 0, 6.3); ctx.fill();
    dot(ctx, -s * 0.34, -s * 0.04, s * 0.06, '#fff'); dot(ctx, -s * 0.33, -s * 0.03, s * 0.03, '#2a1a40');
    ctx.strokeStyle = '#2a1a40'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-s * 0.4, s * 0.06, s * 0.13, 0.3, 1.6); ctx.stroke();
    ctx.fillStyle = 'rgba(255,111,143,.5)'; ctx.beginPath(); ctx.ellipse(-s * 0.26, s * 0.06, s * 0.06, s * 0.04, 0, 0, 6.3); ctx.fill();
    ctx.restore();
    /* the spout */
    if (ph > 0.35) { f = (ph - 0.35) / 0.85; ctx.strokeStyle = 'rgba(200,235,255,' + (0.85 * (1 - f)) + ')'; ctx.lineWidth = Math.max(2, s * 0.05); ctx.lineCap = 'round'; ctx.beginPath();
      for (i = -1; i <= 1; i++) { ctx.moveTo(x - s * 0.3, y - s * 0.3); ctx.quadraticCurveTo(x - s * 0.3 + i * s * 0.2, y - s * (0.3 + 0.7 * Math.sin(f * 1.6)), x - s * 0.3 + i * s * 0.45, y - s * 0.3 + f * s * 0.5); } ctx.stroke(); }
  }
  /* splash rings where it dives */
  if (ph > 0.75 && ph < 1.4 || (pc > 1 && pc < 1.5)) { f = ph > 0.75 ? Math.min(1, (ph - 0.75) / 0.6) : (pc - 1) * 2; ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - f)) + ')'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(x, wl, s * (0.3 + f * 0.6), s * (0.07 + f * 0.1), 0, 0, 6.3); ctx.stroke(); }
}
/* a rainbow fades in over the sea while the cloud smiles; rain pocks the water with little rings */
function stormSky(t, smile) {
  var i, k = (S.sc && S.sc.clT !== undefined && S.t - S.sc.clT < 2.2) ? 1 : 0, cyc = t % 9, env = cyc > 6.5 && cyc < 8.2 ? Math.sin((cyc - 6.5) / 1.7 * Math.PI) : 0, rc = ['#ff5a6a', '#ff9a3d', '#ffe14a', '#6fe07a', '#4fc3ff', '#6a7cff', '#b06aff'], r0 = W * 0.34;
  if (k) env = Math.max(env, Math.sin(Math.min(1, (S.t - S.sc.clT) / 2.2) * Math.PI));
  if (env > 0.02 && !calm) {
    ctx.save(); ctx.globalAlpha = 0.5 * env; ctx.lineWidth = Math.max(3, H * 0.007);
    for (i = 0; i < 7; i++) { ctx.strokeStyle = rc[i]; ctx.beginPath(); ctx.arc(W * 0.46, hy + H * 0.03, r0 - i * ctx.lineWidth * 0.95, Math.PI * 1.04, Math.PI * 1.96); ctx.stroke(); }
    ctx.restore();
  }
  if (!calm && qLevel < 2) {
    ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (i = 0; i < 9; i++) { var f = (t * 1.6 + i * 0.37) % 1; if (f > 0.7) continue; var rx = W * (((i * 0.311 + 0.07) % 0.9) + 0.05), ry = hy + H * (0.12 + ((i * 0.173) % 0.7) * 0.7), rr = (3 + f * 12) * (H / 640); ctx.moveTo(rx + rr, ry); ctx.ellipse(rx, ry, rr, rr * 0.35, 0, 0, 6.3); }
    ctx.stroke();
  }
}
/* the lighthouse lamp sweeps a beam across the dusk */
function stormBeam(t) {
  var L = stormLay(), c = S.sc || (S.sc = {}), fl = c.lhT !== undefined ? Math.max(0, 1 - (S.t - c.lhT) / 1.4) : 0, a = Math.sin(t * 0.7), w = W * 0.2, len = W * 0.75;
  if (calm) a = 0.4;
  ctx.save(); ctx.translate(L.lh.x, L.lh.y + H * 0.045 - H * 0.01);
  ctx.globalAlpha = (0.35 + 0.25 * Math.abs(a) + 0.4 * fl); ctx.save(); ctx.rotate(Math.PI / 2 + 0.25 * a + 0.2); ctx.drawImage(skBeam('255,240,170'), -w / 2, 0, w, len); ctx.restore();
  ctx.save(); ctx.rotate(-Math.PI / 2 - 0.25 * a - 0.2); ctx.drawImage(skBeam('255,240,170'), -w / 2, 0, w, len * 0.6); ctx.restore();
  ctx.globalAlpha = 0.7 + 0.3 * fl; ctx.drawImage(glowFor('255,235,150'), -H * 0.05, -H * 0.05, H * 0.1, H * 0.1);
  ctx.restore();
}
/* taps on the scenery: the whale boops, the cloud smiles, the duck quacks, the lighthouse flashes */
function stormTap(p) {
  var c = S.sc || (S.sc = {}), L = stormLay(), q;
  if (c.cl && Math.hypot(p.x - c.cl.x, p.y - c.cl.y) < c.cl.s * 0.8) { c.clT = S.t; popText(c.cl.x, c.cl.y + c.cl.s * 0.4, 'Hello!', '#b06aff', 0); sparkBurst(c.cl.x, c.cl.y, 10, ['#fff7e3', '#ffd23f', '#ff9ec0']); return true; }
  if (c.dk && Math.hypot(p.x - c.dk.x, p.y - c.dk.y) < c.dk.s * 0.9) { c.dkT = S.t; popText(c.dk.x, c.dk.y - c.dk.s, 'Quack!', '#e8a21c', 0); return true; }
  if (Math.hypot(p.x - L.wh.x, p.y - (hy + H * 0.02)) < L.wh.r) { c.whT = S.t; popText(L.wh.x, hy - H * 0.04, 'Boop!', '#2f78d8', 0); sparkBurst(L.wh.x, hy + H * 0.03, 12, ['#bfe6ff', '#ffffff', '#8fd8ff']); rings.push({ x: L.wh.x, y: hy + H * 0.052, t: 0, ttl: 0.7, r: H * 0.07, c: '255,255,255' }); return true; }
  if (Math.hypot(p.x - L.lh.x, p.y - L.lh.y) < L.lh.r) { c.lhT = S.t; popText(L.lh.x, L.lh.y - H * 0.04, 'Flash!', '#e8a21c', 0); return true; }
  return false;
}
function animStorm(t) {
  var i, u = H / 640, wy = hy + H * 0.07;
  /* a stormy cloud with a face: grumpy, then it smiles and a rainbow-ish sparkle pops */
  var cyc = t % 9, gig = cyc > 6.5 && cyc < 8.2;
  var cc = S.sc || (S.sc = {}), cxp = W * (0.72 + Math.sin(t * 0.12) * 0.05), csz = Math.min(H * 0.1, W * 0.2);
  cc.cl = { x: cxp, y: hy * 0.4, s: csz }; if (cc.clT !== undefined && S.t - cc.clT < 2.2) gig = true;
  stormSky(t, gig); stormBeam(t);
  stormCloud(cxp, hy * 0.4, csz, t, gig);
  /* the rolling swell */
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (i = 0; i < 8; i++) { var wx = ((W * (0.05 + i * 0.13) + t * W * (0.02 + (i % 3) * 0.006)) % (W * 1.1)) - W * 0.05, wyy = hy + H * (0.015 + (i % 4) * 0.014) + Math.sin(t * 2 + i) * 2; ctx.beginPath(); ctx.moveTo(wx, wyy); ctx.quadraticCurveTo(wx + 14, wyy - 6 - Math.sin(t * 2.4 + i) * 2, wx + 28, wyy); ctx.stroke(); }
  var dkx = W * 0.34 + Math.sin(t * 0.3) * W * 0.03, dky = hy + H * 0.04, dks = Math.min(H * 0.045, W * 0.08), dkh = cc.dkT !== undefined && S.t - cc.dkT < 0.7 ? Math.abs(Math.sin((S.t - cc.dkT) * 9)) * dks * 0.7 * (1 - (S.t - cc.dkT) / 0.7) : 0;
  cc.dk = { x: dkx, y: dky, s: dks }; duck(dkx, dky - dkh, dks, t); stormToys(t);
  /* rain */
  if (!calm) {
    var n = qLevel === 0 ? 46 : qLevel === 1 ? 28 : 14; ctx.strokeStyle = 'rgba(200,225,255,.45)'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (i = 0; i < n; i++) { var x = (i * 71.3 % 100) / 100 * W * 1.1, y = ((i * 37 + t * H * (1.1 + (i % 3) * 0.2)) % (H * 0.92)); ctx.moveTo(x, y); ctx.lineTo(x - 5 * u, y + 13 * u); }
    ctx.stroke();
    /* lightning: a quick pink-white flash and a zigzag bolt on the stormy side */
    var lc = t % 9.5;
    if (lc < 0.28 && qLevel < 2) { var f = lc < 0.1 ? 1 : lc < 0.16 ? 0.15 : 0.7; ctx.fillStyle = 'rgba(255,225,240,' + (0.22 * f * (1 - lc / 0.3)) + ')'; ctx.fillRect(0, 0, W, H * 0.9);
      ctx.strokeStyle = 'rgba(255,250,210,' + f + ')'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath(); var bx = W * 0.2, by = 0; ctx.moveTo(bx, by); for (i = 1; i <= 6; i++) { bx += (i % 2 ? -1 : 1) * W * 0.035; by = hy * i / 6.4; ctx.lineTo(bx, by); } ctx.stroke(); }
  }
}

/* stage 5: Glacier Party Fortress. Sunset-coral on the left, aurora-teal on the right, ice walls with silly posters. */
function sceneFort(g) {
  var i, wy = hy + 2, wh = H * 0.15, bw = W * 0.09, bh = H * 0.03, x, y;
  var wg = g.createLinearGradient(0, hy - wh, 0, wy); wg.addColorStop(0, '#f2fcff'); wg.addColorStop(1, '#a9d6e8');
  g.fillStyle = hgrad(g, '#ffe3d6', '#d8f3fa'); g.fillRect(0, hy - wh, W, wh + 2);
  g.fillStyle = wg; g.globalAlpha = 0.55; g.fillRect(0, hy - wh, W, wh + 2); g.globalAlpha = 1;
  g.strokeStyle = 'rgba(100,150,185,.4)'; g.lineWidth = 1.6;
  for (y = hy - wh + bh; y < wy; y += bh) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (i = 0, y = hy - wh; y < wy; y += bh, i++) for (x = (i % 2) * bw / 2; x < W; x += bw) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + bh); g.stroke(); }
  g.fillStyle = hgrad(g, '#ffd0bc', '#c0e8f4'); for (x = 0; x < W; x += bw * 1.2) g.fillRect(x, hy - wh - bh * 0.7, bw * 0.7, bh * 0.75);
  /* the gate with a warm glow */
  g.fillStyle = '#3f4a78'; g.beginPath(); g.moveTo(W * 0.42, wy); g.lineTo(W * 0.42, hy - wh * 0.45); g.quadraticCurveTo(W * 0.5, hy - wh * 0.95, W * 0.58, hy - wh * 0.45); g.lineTo(W * 0.58, wy); g.closePath(); g.fill();
  g.fillStyle = '#ffd98a'; g.beginPath(); g.moveTo(W * 0.45, wy); g.lineTo(W * 0.45, hy - wh * 0.42); g.quadraticCurveTo(W * 0.5, hy - wh * 0.78, W * 0.55, hy - wh * 0.42); g.lineTo(W * 0.55, wy); g.closePath(); g.fill();
  /* two towers with pointy ice roofs */
  [[0.09, '#ffbfae'], [0.91, '#8fd4ea']].forEach(function (tw) {
    var tx = W * tw[0], tww = W * 0.075, th = H * 0.27, gr2 = g.createLinearGradient(tx - tww, 0, tx + tww, 0); gr2.addColorStop(0, '#ffffff'); gr2.addColorStop(1, tw[1]);
    g.fillStyle = gr2; g.strokeStyle = 'rgba(100,150,185,.55)'; g.lineWidth = 1.8; g.fillRect(tx - tww, hy - th, tww * 2, th + 2); g.strokeRect(tx - tww, hy - th, tww * 2, th + 2);
    g.fillStyle = tw[0] < 0.5 ? '#e0575a' : '#2f9aa8'; g.beginPath(); g.moveTo(tx - tww * 1.25, hy - th); g.lineTo(tx, hy - th - H * 0.1); g.lineTo(tx + tww * 1.25, hy - th); g.closePath(); g.fill();
    g.fillStyle = '#3f4a78'; g.beginPath(); g.ellipse(tx, hy - th * 0.6, tww * 0.32, tww * 0.45, 0, Math.PI, 0); g.rect(tx - tww * 0.32, hy - th * 0.6, tww * 0.64, tww * 0.5); g.fill();
  });
  /* silly posters pinned on the wall */
  [[0.25, '#fff3c8'], [0.36, '#ffd6e4'], [0.64, '#d6f0ff'], [0.75, '#e4ffd2']].forEach(function (p, k) {
    var px0 = W * p[0], pw = W * 0.07, ph0 = H * 0.085, py0 = hy - wh * 0.78 + (k % 2) * H * 0.012;
    g.save(); g.translate(px0, py0); g.rotate((k % 2 ? 1 : -1) * 0.05); g.fillStyle = p[1]; g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1.5; g.fillRect(-pw / 2, 0, pw, ph0); g.strokeRect(-pw / 2, 0, pw, ph0);
    dot(g, 0, ph0 * 0.45, pw * 0.26, '#f8bd1c'); g.fillStyle = '#3fbf6a'; g.beginPath(); g.moveTo(-pw * 0.14, ph0 * 0.3); g.lineTo(0, ph0 * 0.05); g.lineTo(pw * 0.14, ph0 * 0.3); g.fill();
    g.strokeStyle = '#e0472f'; g.lineWidth = Math.max(2, pw * 0.08); g.beginPath(); g.arc(0, ph0 * 0.45, pw * 0.36, 0, 6.3); g.moveTo(-pw * 0.26, ph0 * 0.2); g.lineTo(pw * 0.26, ph0 * 0.7); g.stroke();
    g.fillStyle = '#e0472f'; g.fillRect(-pw * 0.36, ph0 * 0.84, pw * 0.72, 3); g.restore();
  });
  fortParty(g, wy, wh, bw, bh);
  groundBand(g, wy);
  tileLines(g, 'rgba(110,150,190,.16)'); laneDeco(g, 5);
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, wy, W, 3);
}
/* stage 5 extras, baked: glossy shine on the ice blocks, a PARTY ribbon over the gate, pennants strung between the towers */
function fortParty(g, wy, wh, bw, bh) {
  var i, x, y, k, n = 26, c = ['#ff6fa8', '#ffd23f', '#6fe0b0', '#8fd8ff', '#c59bff'], rx0 = W * 0.09, rx1 = W * 0.91, top = hy - H * 0.27 - H * 0.02;
  for (i = 0, y = hy - wh; y < wy; y += bh, i++) for (x = (i % 2) * bw / 2; x < W; x += bw) { if ((Math.floor(x / bw) * 7 + i * 3) % 5) continue; g.fillStyle = 'rgba(255,255,255,.34)'; g.fillRect(x + bw * 0.12, y + bh * 0.16, bw * 0.34, bh * 0.14); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x + bw * 0.12, y + bh * 0.36, bw * 0.14, bh * 0.12); }
  /* pennant rope across the sky between the tower tops */
  g.strokeStyle = 'rgba(90,70,80,.7)'; g.lineWidth = 1.6; g.beginPath();
  for (k = 0; k <= n; k++) { x = rx0 + (rx1 - rx0) * k / n; y = top + Math.sin(k / n * Math.PI) * H * 0.05; if (k) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
  for (k = 0; k < n; k++) { x = rx0 + (rx1 - rx0) * (k + 0.5) / n; y = top + Math.sin((k + 0.5) / n * Math.PI) * H * 0.05; g.fillStyle = c[k % 5]; g.beginPath(); g.moveTo(x - W * 0.012, y); g.lineTo(x + W * 0.012, y); g.lineTo(x, y + H * 0.03); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(x - W * 0.012, y); g.lineTo(x, y); g.lineTo(x - W * 0.004, y + H * 0.012); g.closePath(); g.fill(); }
  /* a ribbon sign over the gate */
  var gx = W * 0.5, gy0 = hy - wh * 0.97 + H * 0.014, rw = W * 0.2, rh = H * 0.032, gr = g.createLinearGradient(0, gy0, 0, gy0 + rh);
  gr.addColorStop(0, '#ff9ec0'); gr.addColorStop(1, '#e0467f'); g.fillStyle = gr; g.strokeStyle = 'rgba(120,30,70,.5)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(gx - rw / 2, gy0); g.lineTo(gx + rw / 2, gy0); g.lineTo(gx + rw / 2 + rw * 0.06, gy0 + rh * 0.5); g.lineTo(gx + rw / 2, gy0 + rh); g.lineTo(gx - rw / 2, gy0 + rh); g.lineTo(gx - rw / 2 - rw * 0.06, gy0 + rh * 0.5); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(gx - rw / 2, gy0 + 1, rw, rh * 0.28);
  g.font = '800 ' + Math.round(rh * 0.7) + 'px "Bricolage Grotesque",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = rh * 0.16; g.strokeStyle = '#9a2a5c'; g.strokeText('PARTY!', gx, gy0 + rh * 0.55); g.fillStyle = '#fff7e3'; g.fillText('PARTY!', gx, gy0 + rh * 0.55);
}
function fortLay() {
  var wh = H * 0.15, wy = hy + 2, s = Math.min(H * 0.07, W * 0.14);
  return { sn: { x: W * 0.69, y: wy + H * 0.012, s: s }, db: { x: W * 0.3, y: hy - wh * 0.42, r: H * 0.026 },
    bal: [[0.17, 0.2, '#ff6fa8'], [0.3, 0.27, '#ffd23f'], [0.7, 0.24, '#6fe0b0'], [0.83, 0.18, '#8fd8ff'], [0.4, 0.3, '#c59bff']] };
}
/* the disco ball turns above the wall and scatters colored light across the ice */
function fortDisco(t) {
  var L = fortLay(), r = L.db.r, x = L.db.x, y = L.db.y, i, a, cols = ['255,111,168', '255,210,63', '111,224,176', '143,216,255', '197,155,255'], sw = (S.sc && S.sc.dbT !== undefined) ? Math.max(0, 1 - (S.t - S.sc.dbT) / 1.2) : 0;
  ctx.strokeStyle = 'rgba(90,70,80,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, hy - H * 0.15 - 2); ctx.lineTo(x, y - r); ctx.stroke();
  if (!calm && qLevel < 2) for (i = 0; i < (qLevel ? 4 : 7); i++) { a = t * 0.8 + i * 0.7; var sx = x + Math.cos(a * 1.3 + i) * W * (0.08 + (i % 4) * 0.03), sy = hy - H * 0.1 + Math.sin(a + i * 1.9) * H * 0.045; ctx.globalAlpha = 0.34 + 0.2 * sw; ctx.drawImage(glowFor(cols[i % 5]), sx - H * 0.02, sy - H * 0.02, H * 0.04, H * 0.04); } ctx.globalAlpha = 1;
  var gr = gk('disco' + Math.round(r), function () { var g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#c8d4e4'); g.addColorStop(1, '#6c7a96'); return g; });
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(70,80,110,.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (i = -2; i <= 2; i++) { ctx.moveTo(-r, i * r * 0.4); ctx.quadraticCurveTo(0, i * r * 0.55, r, i * r * 0.4); } for (i = 0; i < 4; i++) { var ph = (calm ? 0 : t * 0.9) + i * 0.8; ctx.moveTo(Math.cos(ph) * r, -r * 0.2); ctx.quadraticCurveTo(Math.cos(ph) * r * 0.6, 0, Math.cos(ph) * r * 0.2, r); }
  ctx.stroke();
  for (i = 0; i < 5; i++) { var tw = Math.max(0, Math.sin(t * 5 + i * 2.1)); if (tw < 0.2 && !sw) continue; ctx.fillStyle = 'rgba(255,255,255,' + Math.max(tw, sw) + ')'; var qx = Math.cos(i * 2.4 + t) * r * 0.7, qy = Math.sin(i * 1.7) * r * 0.6, qs = r * (0.18 + 0.2 * Math.max(tw, sw)); ctx.beginPath(); ctx.moveTo(qx, qy - qs); ctx.lineTo(qx + qs * 0.25, qy); ctx.lineTo(qx, qy + qs); ctx.lineTo(qx - qs * 0.25, qy); ctx.closePath(); ctx.moveTo(qx - qs, qy); ctx.lineTo(qx, qy - qs * 0.25); ctx.lineTo(qx + qs, qy); ctx.lineTo(qx, qy + qs * 0.25); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function fortBalloon(i, x, y, s, col) {
  var key = 'bal' + i + '_' + Math.round(s);
  stamp(key, x, y, s * 1.3, s * 1.5, s * 0.65, s * 0.75, function (ox, oy) {
    var g = ctx.createRadialGradient(ox - s * 0.18, oy - s * 0.22, s * 0.05, ox, oy, s * 0.62); g.addColorStop(0, '#fff'); g.addColorStop(0.25, col); g.addColorStop(1, mixc(col, '#3a1a50', 0.45));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ox, oy, s * 0.5, s * 0.6, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(ox - s * 0.2, oy - s * 0.26, s * 0.1, s * 0.17, 0.5, 0, 6.3); ctx.fill();
    ctx.fillStyle = mixc(col, '#3a1a50', 0.5); ctx.beginPath(); ctx.moveTo(ox, oy + s * 0.58); ctx.lineTo(ox - s * 0.07, oy + s * 0.7); ctx.lineTo(ox + s * 0.07, oy + s * 0.7); ctx.closePath(); ctx.fill();
  });
}
function fortBalloons(t) {
  var L = fortLay(), c = S.sc || (S.sc = {}), i, b, x, y, s = Math.min(H * 0.052, W * 0.1), pp, bp = c.bp || (c.bp = [-99, -99, -99, -99, -99]), ax, ay;
  c.balPos = [];
  for (i = 0; i < L.bal.length; i++) {
    b = L.bal[i]; if (S.t - bp[i] < 7) continue;
    x = W * b[0] + Math.sin(t * 0.9 + i * 1.7) * W * 0.012; y = hy - H * b[1] * 0.55 - H * 0.03 + Math.sin(t * 1.3 + i * 2.1) * H * 0.008; if (calm) { x = W * b[0]; y = hy - H * b[1] * 0.55 - H * 0.03; }
    ax = W * b[0] + W * (i % 2 ? 0.02 : -0.02); ay = hy + H * 0.006;
    ctx.strokeStyle = 'rgba(90,70,80,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y + s * 0.72); ctx.quadraticCurveTo(x + (ax - x) * 0.2, y + (ay - y) * 0.5, ax, ay); ctx.stroke();
    fortBalloon(i, x, y, s, b[2]); c.balPos.push({ i: i, x: x, y: y, r: s * 0.6, col: b[2] });
  }
}
/* fireworks over the fortress now and then, and searchlights that sweep the sky */
function fortShow(t) {
  var c = S.sc || (S.sc = {}), i, f, u, x, y;
  if (!calm) {
    ctx.save(); ctx.globalAlpha = 0.4;
    for (i = 0; i < 2; i++) { ctx.save(); ctx.translate(W * (i ? 0.91 : 0.09), hy - H * 0.37); ctx.rotate(Math.PI + (i ? -1 : 1) * 0.5 * Math.sin(t * 0.6 + i * 1.7) + (i ? 0.2 : -0.2)); ctx.drawImage(skBeam(i ? '143,216,255' : '255,200,220'), -W * 0.05, 0, W * 0.1, H * 0.4); ctx.restore(); }
    ctx.restore();
    if (c.fw === undefined) c.fw = { next: S.t + 2.2, n: 0, list: [] };
    f = c.fw;
    if (S.t >= f.next && !S.paused) { f.list.push({ x: W * (0.22 + 0.56 * ((f.n * 0.37) % 1)), t0: S.t, y1: hy * (0.2 + 0.25 * ((f.n * 0.61) % 1)), cl: FW_COLS[f.n % 4], done: false }); f.n++; f.next = S.t + 6 + (f.n % 3); }
    for (i = f.list.length - 1; i >= 0; i--) {
      var r = f.list[i]; u = (S.t - r.t0) / 0.8;
      if (u >= 1) { if (!r.done) { r.done = true; sparkBurst(r.x, r.y1, 26, r.cl); rings.push({ x: r.x, y: r.y1, t: 0, ttl: 0.8, r: H * 0.07, c: '255,230,150' }); } if (u > 1.2) f.list.splice(i, 1); continue; }
      y = hy * 0.62 + (r.y1 - hy * 0.62) * (1 - (1 - u) * (1 - u)); ctx.strokeStyle = 'rgba(255,235,170,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x, y + H * 0.04 * (1 - u)); ctx.lineTo(r.x, y); ctx.stroke(); dot(ctx, r.x, y, 2.4, '#fff7e3');
    }
  }
}
/* the lane tiles light up to the beat like a dance floor (very softly, so shots and penguins stay easy to see) */
function fortFloor(t) {
  if (calm || qLevel > 1) return;
  var c, r, k = Math.floor(t * 2), cols = ['rgba(255,111,168,', 'rgba(255,210,63,', 'rgba(111,224,176,', 'rgba(143,216,255,', 'rgba(197,155,255,'], ph = (t * 2) % 1;
  for (c = 0; c < 5; c++) for (r = 0; r < 5; r++) { if (((c * 3 + r * 5 + k) % 7) > 1) continue; lq(ctx, -1 + c * 0.4, -0.6 + c * 0.4, 0.12 + r * 0.17, 0.12 + (r + 1) * 0.17, cols[(c + r + k) % 5] + (0.1 * (1 - ph * 0.6)) + ')'); }
}
function fortBulb(q, x, y, r) {
  stamp('bulb' + q + '_' + Math.round(r), x, y, r * 6, r * 6, r * 3, r * 3, function (ox, oy) {
    var BC = ['#ff6fa8', '#ffd23f', '#6fe0b0', '#8fd8ff'], g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r * 3);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.35, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(ox - r * 3, oy - r * 3, r * 6, r * 6);
    ctx.fillStyle = BC[q]; ctx.beginPath(); ctx.arc(ox, oy, r, 0, 6.3); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(ox - r * 0.3, oy - r * 0.3, r * 0.3, 0, 6.3); ctx.fill();
  });
}
function fortLights(t) {
  var i, n = 22, wh = H * 0.15, x, y, rb = Math.max(2, W * 0.006), ph = Math.floor(t * 2.4);
  ctx.strokeStyle = 'rgba(90,70,80,.6)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (i = 0; i <= n; i++) { x = W * (0.12 + 0.76 * i / n); y = hy - wh * 0.08 + Math.sin(i / n * Math.PI * 4) * H * 0.012; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke();
  for (i = 0; i <= n; i++) { x = W * (0.12 + 0.76 * i / n); y = hy - wh * 0.08 + Math.sin(i / n * Math.PI * 4) * H * 0.012 + rb; fortBulb((i + ph) & 3, x, y, rb); }
}
/* a snowman DJ in a party hat dances by the gate, bouncing speakers beside him */
function fortDJ(t) {
  var L = fortLay(), c = S.sc || (S.sc = {}), s = L.sn.s, x = L.sn.x, y = L.sn.y, beat = calm ? 0 : Math.abs(Math.sin(t * Math.PI * 2 * 1.0)), tap = c.snT !== undefined ? S.t - c.snT : 9, jump = tap < 0.8 ? Math.sin(tap / 0.8 * Math.PI) * s * 0.6 : 0, i;
  /* speakers */
  for (i = -1; i <= 1; i += 2) { var spx = x + i * s * 0.95, sw = s * 0.42, sh = s * 0.6; ctx.fillStyle = '#3f4a78'; ctx.fillRect(spx - sw / 2, y - sh, sw, sh); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(spx - sw / 2, y - sh, sw * 0.18, sh); dot(ctx, spx, y - sh * 0.35, sw * (0.26 + 0.05 * beat), '#aab6e8'); dot(ctx, spx, y - sh * 0.78, sw * 0.12, '#aab6e8'); dot(ctx, spx, y - sh * 0.35, sw * 0.09, '#3f4a78'); }
  ctx.save(); ctx.translate(x, y - Math.abs(Math.sin(t * 6)) * s * 0.08 * (calm ? 0 : 1) - jump); ctx.rotate(calm ? 0 : Math.sin(t * 3) * 0.06 + (tap < 0.8 ? tap * 8 : 0));
  var g = gk('snow' + Math.round(s), function () { var q = ctx.createRadialGradient(-s * 0.08, -s * 0.12, s * 0.02, 0, 0, s * 0.4); q.addColorStop(0, '#ffffff'); q.addColorStop(1, '#bcd8ec'); return q; });
  ctx.fillStyle = g; ctx.strokeStyle = 'rgba(80,110,150,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -s * 0.22, s * 0.3, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -s * 0.7, s * 0.22, 0, 6.3); ctx.fill(); ctx.stroke();
  dot(ctx, -s * 0.08, -s * 0.74, s * 0.03, '#2a1a40'); dot(ctx, s * 0.08, -s * 0.74, s * 0.03, '#2a1a40');
  ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(s * 0.2, -s * 0.66); ctx.lineTo(0, -s * 0.64); ctx.fill();
  ctx.strokeStyle = '#2a1a40'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, -s * 0.66, s * 0.1, 0.3, 2.8); ctx.stroke();
  dot(ctx, -s * 0.12, -s * 0.64, s * 0.04, 'rgba(255,111,143,.6)'); dot(ctx, s * 0.12, -s * 0.64, s * 0.04, 'rgba(255,111,143,.6)');
  /* headphones, scarf and a party hat */
  ctx.strokeStyle = '#3f4a78'; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.arc(0, -s * 0.74, s * 0.24, Math.PI, 0); ctx.stroke(); dot(ctx, -s * 0.24, -s * 0.72, s * 0.07, '#ff6fa8'); dot(ctx, s * 0.24, -s * 0.72, s * 0.07, '#ff6fa8');
  ctx.fillStyle = '#e8473d'; ctx.fillRect(-s * 0.22, -s * 0.5, s * 0.44, s * 0.08);
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-s * 0.13, -s * 0.9); ctx.lineTo(s * 0.02, -s * 1.12); ctx.lineTo(s * 0.13, -s * 0.9); ctx.closePath(); ctx.fill(); dot(ctx, s * 0.02, -s * 1.13, s * 0.04, '#ff6fa8');
  ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = Math.max(2, s * 0.04); ctx.lineCap = 'round'; var arm = calm ? 0.4 : Math.sin(t * 6); ctx.beginPath(); ctx.moveTo(-s * 0.28, -s * 0.3); ctx.lineTo(-s * 0.5, -s * (0.45 + 0.2 * arm)); ctx.moveTo(s * 0.28, -s * 0.3); ctx.lineTo(s * 0.5, -s * (0.45 - 0.2 * arm)); ctx.stroke();
  ctx.restore();
}
function fortAnimMore(t) {
  fortLights(t); fortDisco(t); fortBalloons(t); fortDJ(t); fortShow(t);
}
function fortTap(p) {
  var c = S.sc || (S.sc = {}), L = fortLay(), i, b, cl = ['#ff6fa8', '#ffd23f', '#6fe0b0', '#8fd8ff', '#c59bff'];
  if (c.balPos) for (i = 0; i < c.balPos.length; i++) { b = c.balPos[i]; if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.4) { c.bp[b.i] = S.t; burst(b.x, b.y, 14, [b.col, '#fff7e3', '#ffd23f']); sparkBurst(b.x, b.y, 8, cl); popText(b.x, b.y - H * 0.03, 'Pop!', '#d9007a', 0); return true; } }
  if (Math.hypot(p.x - L.db.x, p.y - L.db.y) < L.db.r * 1.6) { c.dbT = S.t; sparkBurst(L.db.x, L.db.y, 16, cl); popText(L.db.x, L.db.y + H * 0.04, 'Disco!', '#8a4ad8', 0); return true; }
  if (Math.hypot(p.x - L.sn.x, p.y - (L.sn.y - L.sn.s * 0.5)) < L.sn.s * 0.8) { c.snT = S.t; sparkBurst(L.sn.x, L.sn.y - L.sn.s, 12, cl); popText(L.sn.x, L.sn.y - L.sn.s * 1.4, 'Party!', '#d9007a', 0); return true; }
  return false;
}
function sceneTap(p) {
  if (S.over || S.paused || S.rc > 0 || p.y > hy + H * 0.2) return false;
  var k = stageNo(); return k === 4 ? stormTap(p) : k === 5 ? fortTap(p) : false;
}
function animFort(t) {
  var i, wh = H * 0.15, wy = hy + 2;
  /* aurora ribbons ripple over the cool side */
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (i = 0; i < 3; i++) {
    var ay = hy * (0.2 + i * 0.12), gr = gk('aur' + i, function () { var g = ctx.createLinearGradient(0, ay - H * 0.07, 0, ay + H * 0.1); g.addColorStop(0, 'rgba(90,255,200,0)'); g.addColorStop(0.5, i === 1 ? 'rgba(140,120,255,.28)' : 'rgba(90,255,200,.3)'); g.addColorStop(1, 'rgba(90,255,200,0)'); return g; });
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(W * 0.35, ay);
    for (var k = 0; k <= 10; k++) ctx.lineTo(W * (0.35 + k * 0.065), ay + Math.sin(t * 0.9 + k * 0.7 + i * 1.7) * H * 0.035);
    for (k = 10; k >= 0; k--) ctx.lineTo(W * (0.35 + k * 0.065), ay + H * 0.07 + Math.sin(t * 0.9 + k * 0.7 + i * 1.7 + 0.6) * H * 0.03);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  /* stars twinkle at the top */
  for (i = 0; i < 8; i++) { var a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + i * 1.3)); ctx.globalAlpha = a * 0.8; dot(ctx, W * (0.55 + (i * 0.067) % 0.42), hy * (0.08 + (i % 4) * 0.07), 1.6 * H / 640, '#fff'); } ctx.globalAlpha = 1;
  /* flags on both towers */
  flag(W * 0.09, hy - H * 0.27 - H * 0.1, H * 0.08, t, '#ffd23f', '#e0472f'); flag(W * 0.91, hy - H * 0.27 - H * 0.1, H * 0.08, t + 1, '#ff6f9c', '#fff7e3');
  /* a penguin cheerleader on the wall waves pom-poms and hops */
  var cp = cheerPos(), cx = cp.x, cy = cp.y + cp.s * 0.45, s = cp.s, hop = Math.abs(Math.sin(t * 4)) * s * 0.25, age = S.t - S.chT, vis = true, ox = 0, oy = 0, rot = 0, al = 1, sc = 1, im = IMG.ad && (age < 0.9 ? IMG.ad.wow : IMG.ad.smile);
  if (age < 0.9) { ox = age * s * 1.6; oy = age * age * s * 3 - age * s * 1.2; rot = age * 11; al = 1 - age / 0.9; }
  else if (age < 5.6) vis = false;
  else if (age < 6.4) { var u = (age - 5.6) / 0.8; sc = 1 + Math.sin(u * Math.PI) * 0.35; al = u; }
  if (im && vis) {
    ctx.save(); ctx.globalAlpha = al; ctx.translate(cx + ox, cy + oy); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.drawImage(im, -s * 0.5, -hop - s * 0.94, s, s);
    for (i = -1; i <= 1; i += 2) { var px1 = i * s * 0.55, py1 = -hop - s * 0.5 + Math.sin(t * 8 + i) * s * 0.18; ctx.strokeStyle = i < 0 ? '#ff6f9c' : '#5bb8f0'; ctx.lineWidth = Math.max(2, s * 0.05); ctx.lineCap = 'round'; ctx.beginPath(); for (var q = 0; q < 6; q++) { var an = q * 1.05 + t * 3; ctx.moveTo(px1, py1); ctx.lineTo(px1 + Math.cos(an) * s * 0.2, py1 + Math.sin(an) * s * 0.2); } ctx.stroke(); dot(ctx, px1, py1, s * 0.05, '#fff7e3'); }
    ctx.restore();
  }
  fortFloor(t); fortAnimMore(t);
  snowfall(t, 22, 'rgba(255,255,255,.9)', 0.06);
  if (qLevel < 2) for (i = 0; i < 6; i++) { var a2 = Math.pow(Math.max(0, Math.sin(t * 1.9 + i * 1.7)), 6); if (a2 < 0.05) continue; var tx = W * (0.08 + ((i * 0.151) % 0.84)), ty = wy + H * (0.06 + (i % 3) * 0.13), r = H * 0.011 * (0.5 + a2); ctx.globalAlpha = a2; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx - r, ty); ctx.lineTo(tx + r, ty); ctx.moveTo(tx, ty - r); ctx.lineTo(tx, ty + r); ctx.stroke(); ctx.globalAlpha = 1; }
}

/* ---------- hidden bonus zones: one on each side of every stage; tap them for credits ---------- */
var ZONES = [null,
  [{ x: 0.14, y: 0.53 }, { x: 0.82, y: 0.16 }],
  [{ x: 0.2, y: 0.5 }, { x: 0.9, y: 0.51 }],
  [{ x: 0.1, y: 0.35 }, { x: 0.85, y: 0.38 }],
  [{ x: 0.06, y: 0.5 }, { x: 0.72, y: 0.19 }],
  [{ x: 0.09, y: 0.33 }, { x: 0.91, y: 0.33 }]
];
function zoneR() { return Math.max(28, Math.min(W, H) * 0.1); }
function zoneHit(p) {
  var z = ZONES[stageNo()], i, r = zoneR();
  if (!z || S.over || S.paused) return false;
  for (i = 0; i < 2; i++) {
    if (!(S.zones & (1 << i)) && Math.hypot(p.x - z[i].x * W, p.y - z[i].y * H) <= r) { zoneFound(i, z[i].x * W, z[i].y * H); return true; }
  }
  return false;
}
function zoneFound(i, x, y) {
  var n = 25 * stageNo(), bp = bankPos();
  S.zones |= 1 << i; earn(n); toast('Secret spot found! +' + n);
  popText(x, y - H * 0.03, '+' + n, '#d9007a', 2); coinBurst(x, y, 26, true); sparkBurst(x, y, 20, ['#ffd23f', '#fff7e3', '#ff6fa8', '#8fe0ff']); flyCoins(x, y, bp.x, bp.y, 8, false);
  rings.push({ x: x, y: y, t: 0, ttl: 0.7, r: zoneR() * 1.3, c: '255,111,168' }); rings.push({ x: x, y: y, t: -0.1, ttl: 0.7, r: zoneR() * 0.9, c: '255,210,63' });
  burst(x, y, 10, ['#ffd23f', '#fff7e3']);
}
/* a very faint twinkle now and then lets sharp eyes spot where a zone is */
function drawZoneHints(t) {
  var z = ZONES[stageNo()], i, ph, a, x, y, r;
  if (!z || calm) return;
  for (i = 0; i < 2; i++) {
    if (S.zones & (1 << i)) continue;
    ph = (t + i * 9 + stageNo() * 3) % 17; if (ph > 1.1) continue;
    a = Math.sin(ph / 1.1 * Math.PI) * 0.55; x = z[i].x * W; y = z[i].y * H; r = Math.max(7, Math.min(W, H) * 0.022);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff7c8'; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); ctx.restore();
  }
}

/* the cheerleader on the fortress wall: a flick that lines up with him bonks him off the wall for a bonus (the first time each stage run) */
function cheerPos() { var s = Math.min(H * 0.06, W * 0.12); return { x: W * 0.5, y: hy - H * 0.15 - H * 0.002 - s * 0.45, s: s }; }
function cheerHit(x, y) {
  S.chT = S.t; S.chN++; sparkBurst(x, y, 14, ['#ff6f9c', '#5bb8f0', '#fff7e3', '#ffd23f']); burst(x, y, 10, SNOW_COL);
  if (S.chN === 1) { var bp = bankPos(); earn(40); popText(x, y - H * 0.04, '+40', '#d9007a', 2); popText(x, y + H * 0.01, 'Whoa!', '#2f8fbf', 0); coinBurst(x, y, 20, true); flyCoins(x, y, bp.x, bp.y, 6, false); rings.push({ x: x, y: y, t: 0, ttl: 0.6, r: H * 0.07, c: '255,111,168' }); }
  else popText(x, y - H * 0.03, 'Whoa!', '#2f8fbf', 0);
}
