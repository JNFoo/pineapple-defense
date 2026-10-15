/* Penguin outfits. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).
   Hats, scarves, mittens and a treat to hold, drawn as small glossy overlays in the penguin's own 200 x 200 sprite space and rasterized once each
   (in the background, like the sprites). A penguin picks its outfit when it spawns: pg.gear = [hat, scarf, mittens, item], 0 meaning none. */
var GEAR_K = 1.5;   /* pixels per sprite unit for the overlay bitmaps */
var GEAR_DEF = {};
var GEAR_IMG = {};
var GEAR_N = { h: 6, s: 6, m: 4, i: 4 };
function gLg(id, a, b) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
function gRg(id, a, b) { return '<radialGradient id="' + id + '" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></radialGradient>'; }
var G_LN = ' stroke="#2a120d" stroke-opacity=".45" stroke-width="2" stroke-linejoin="round"';
function gPom(cx, cy, r, a, b) {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#pm)"' + G_LN + '/><circle cx="' + (cx - r * 0.3) + '" cy="' + (cy - r * 0.35) + '" r="' + r * 0.3 + '" fill="#fff" opacity=".6"/>' +
    '<circle cx="' + (cx + r * 0.5) + '" cy="' + (cy + r * 0.2) + '" r="' + r * 0.28 + '" fill="' + b + '" opacity=".35"/>';
}
function gloss(cx, cy, rx, ry, rot) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".42" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"/>'; }
function gRibs(x0, x1, y0, y1, n) { var d = '', i; for (i = 1; i < n; i++) { var x = x0 + (x1 - x0) * i / n; d += 'M' + x + ' ' + y0 + 'L' + x + ' ' + y1; } return '<path d="' + d + '" stroke="#000" stroke-opacity=".16" stroke-width="2"/>'; }
/* a knit cap: dome, striped or plain, a ribbed cuff and a pom-pom */
function gBeanie(c1, c2, cf1, cf2, stripe, pom1, pom2) {
  var dome = 'M62 52C60 30 78 14 100 14C122 14 140 30 138 52Z', s = '';
  if (stripe) s = '<g clip-path="url(#kc)" fill="' + stripe + '"><rect x="50" y="26" width="100" height="7" transform="rotate(-6 100 30)"/><rect x="50" y="39" width="100" height="7" transform="rotate(-6 100 42)"/></g>';
  return { x: 40, y: 0, w: 120, h: 80, svg: '<defs>' + gLg('d', c1, c2) + gLg('cf', cf1, cf2) + gRg('pm', pom1, pom2) + '<clipPath id="kc"><path d="' + dome + '"/></clipPath></defs>' +
    '<path d="' + dome + '" fill="url(#d)"' + G_LN + '/>' + s + gloss(84, 28, 13, 6, -28) +
    '<path d="M57 47Q100 55 143 47L143 60Q100 68 57 60Z" fill="url(#cf)"' + G_LN + '/>' + gRibs(66, 134, 52, 63, 9) + gPom(100, 12, 11, pom1, pom2) };
}
/* a big furry earflap hat */
function gFlap() {
  return { x: 30, y: 0, w: 140, h: 120, svg: '<defs>' + gLg('d', '#c98a52', '#8a5428') + gLg('fr', '#ffffff', '#e4d6c6') + gRg('pm', '#fff', '#d8c8b8') + '</defs>' +
    '<path d="M54 100C46 86 48 70 58 62L66 66L68 100Z" fill="url(#d)"' + G_LN + '/><path d="M146 100C154 86 152 70 142 62L134 66L132 100Z" fill="url(#d)"' + G_LN + '/>' +
    '<path d="M60 52C58 28 78 12 100 12C122 12 142 28 140 52Z" fill="url(#d)"' + G_LN + '/>' + gloss(84, 26, 13, 6, -28) +
    '<path d="M52 50Q100 62 148 50Q150 62 142 66Q100 74 58 66Q50 62 52 50Z" fill="url(#fr)"' + G_LN + '/>' +
    '<circle cx="62" cy="104" r="7" fill="#fff"' + G_LN + '/><circle cx="138" cy="104" r="7" fill="#fff"' + G_LN + '/>' +
    '<path d="M62 86L62 98M138 86L138 98" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' + gPom(100, 12, 9, '#fff', '#d8c8b8') };
}
/* a floppy red holiday cap, pom-pom hanging off one side */
function gSanta() {
  return { x: 40, y: 0, w: 130, h: 90, svg: '<defs>' + gLg('d', '#ff6a5e', '#c2272d') + gLg('fr', '#ffffff', '#e8e0f0') + gRg('pm', '#fff', '#d8d0e0') + '</defs>' +
    '<path d="M62 50C60 28 84 12 112 18C134 24 150 38 160 62C146 54 138 50 138 50Z" fill="url(#d)"' + G_LN + '/>' + gloss(88, 28, 13, 6, -18) +
    '<path d="M54 46Q100 58 146 46Q150 58 142 64Q100 74 58 64Q50 58 54 46Z" fill="url(#fr)"' + G_LN + '/>' + gPom(162, 64, 11, '#fff', '#d8d0e0') };
}
/* warm earmuffs over the head */
function gMuffs() {
  return { x: 20, y: 18, w: 160, h: 110, svg: '<defs>' + gRg('p', '#ff9ec0', '#d6366f') + '</defs>' +
    '<path d="M54 92C50 54 74 34 100 34C126 34 150 54 146 92" fill="none" stroke="#6d5a78" stroke-width="7" stroke-linecap="round"/><path d="M54 92C50 54 74 34 100 34C126 34 150 54 146 92" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round" transform="translate(0 -2)"/>' +
    '<circle cx="50" cy="96" r="19" fill="url(#p)"' + G_LN + '/><circle cx="150" cy="96" r="19" fill="url(#p)"' + G_LN + '/>' +
    '<circle cx="44" cy="90" r="6" fill="#fff" opacity=".45"/><circle cx="144" cy="90" r="6" fill="#fff" opacity=".45"/>' };
}
/* a pointy party hat with dots and a streamer pom */
function gParty() {
  return { x: 50, y: -12, w: 100, h: 82, svg: '<defs>' + gLg('d', '#ffd23f', '#f08a1c') + '<clipPath id="kc"><path d="M68 56L102 -4L134 56Z"/></clipPath></defs>' +
    '<path d="M68 56L102 -4L134 56Q101 64 68 56Z" fill="url(#d)"' + G_LN + '/>' +
    '<g clip-path="url(#kc)"><circle cx="90" cy="38" r="5" fill="#ff6fa8"/><circle cx="108" cy="26" r="5" fill="#6fd8ff"/><circle cx="116" cy="46" r="5" fill="#8fe06a"/><circle cx="96" cy="14" r="4" fill="#c59bff"/><circle cx="80" cy="50" r="4" fill="#fff"/></g>' +
    '<path d="M68 56Q101 66 134 56" fill="none" stroke="#ff6fa8" stroke-width="5" stroke-linecap="round"/>' + gloss(92, 26, 5, 14, 22) +
    '<path d="M102 -4L98 -10M102 -4L108 -9M102 -4L103 -12" stroke="#ff6fa8" stroke-width="3" stroke-linecap="round"/><circle cx="102" cy="-6" r="5" fill="#fff"' + G_LN + '/>' };
}
/* a scarf wrapped under the beak with a tail hanging at one side */
function gScarf(c1, c2, st) {
  var band = 'M44 124Q100 152 156 124L156 142Q100 172 44 142Z', tail = 'M126 148L148 142L156 184L130 190Z', s = '', i;
  if (st) { for (i = 0; i < 7; i++) s += '<rect x="' + (46 + i * 16) + '" y="110" width="8" height="70" transform="skewX(-14)"/>'; s = '<g clip-path="url(#kc)" fill="' + st + '" opacity=".95">' + s + '</g>'; }
  return { x: 36, y: 108, w: 128, h: 88, svg: '<defs>' + gLg('d', c1, c2) + '<clipPath id="kc"><path d="' + band + '"/><path d="' + tail + '"/></clipPath></defs>' +
    '<path d="' + tail + '" fill="url(#d)"' + G_LN + '/><path d="' + band + '" fill="url(#d)"' + G_LN + '/>' + s +
    '<path d="M132 186L154 180M131 190L135 196M139 188L143 195M147 185L151 192" stroke="' + c2 + '" stroke-width="3" stroke-linecap="round"/>' + gloss(78, 138, 22, 3.5, 8) };
}
/* mittens on both flipper tips; the second pair of numbers is for the Rockhopper, whose left flipper waves */
function gMitt(c1, c2, kind) {
  function m(cx, cy, rot) { return '<g transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"><ellipse cx="' + cx + '" cy="' + cy + '" rx="13" ry="15" fill="url(#d)"' + G_LN + '/><ellipse cx="' + (cx + 11) + '" cy="' + (cy - 2) + '" rx="5" ry="7" fill="url(#d)"' + G_LN + '/><rect x="' + (cx - 13) + '" y="' + (cy - 17) + '" width="26" height="9" rx="4" fill="#fff"' + G_LN + '/>' + gloss(cx - 4, cy + 2, 4, 7, 10) + '</g>'; }
  var a = kind === 'rh' ? [[17, 72, -160], [166, 160, 18]] : [[26, 160, 20], [185, 152, -20]];
  return { x: 0, y: 40, w: 200, h: 140, svg: '<defs>' + gLg('d', c1, c2) + '</defs>' + m(a[0][0], a[0][1], a[0][2]) + m(a[1][0], a[1][1], a[1][2]) };
}
/* something to hold by the right flipper: cocoa, a candy cane or a cookie */
function gItem(n) {
  if (n === 1) return { x: 128, y: 120, w: 64, h: 62, svg: '<defs>' + gLg('d', '#ff7a7a', '#c0262e') + gLg('co', '#7a3d1d', '#4a2210') + '</defs>' +
    '<path d="M178 140C196 136 196 164 178 162" fill="none" stroke="#c0262e" stroke-width="6" stroke-linecap="round"/><path d="M148 134L172 134L170 168Q160 174 150 168Z" fill="url(#d)"' + G_LN + '/>' +
    '<ellipse cx="160" cy="134" rx="12" ry="4.5" fill="url(#co)"' + G_LN + '/><circle cx="154" cy="132" r="3.6" fill="#fff"/><circle cx="162" cy="131" r="3.6" fill="#fff"/><circle cx="168" cy="133" r="3" fill="#fff"/>' +
    '<rect x="148" y="148" width="22" height="5" fill="#fff" opacity=".85"/>' + gloss(153, 148, 2.6, 9, 4) };
  if (n === 2) { var P = 'M160 180L160 120C160 100 188 100 188 120'; return { x: 130, y: 100, w: 64, h: 86, svg: '<path d="' + P + '" fill="none" stroke="#2a120d" stroke-opacity=".4" stroke-width="14" stroke-linecap="round"/><path d="' + P + '" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/><path d="' + P + '" fill="none" stroke="#e03a3e" stroke-width="11" stroke-dasharray="8 10"/>' + gloss(157, 140, 2, 18, 0) }; }
  if (n === 4) return { x: 146, y: 130, w: 44, h: 44, svg: '<defs>' + gRg('d', '#ffffff', '#a9c4e0') + '</defs><circle cx="168" cy="152" r="15" fill="url(#d)"' + G_LN + '/>' + gloss(162, 145, 5, 3, -30) + '<circle cx="173" cy="158" r="2" fill="#8aa6c4"/><circle cx="164" cy="160" r="1.5" fill="#8aa6c4"/>' };
  return { x: 134, y: 112, w: 56, h: 56, svg: '<defs>' + gRg('d', '#e8b878', '#a8672c') + '</defs><circle cx="160" cy="140" r="22"' + ' fill="url(#d)"' + G_LN + '/><circle cx="152" cy="132" r="4" fill="#4a2210"/><circle cx="168" cy="136" r="4" fill="#4a2210"/><circle cx="158" cy="150" r="4" fill="#4a2210"/><circle cx="170" cy="148" r="3" fill="#4a2210"/><circle cx="148" cy="144" r="3" fill="#4a2210"/>' + gloss(150, 128, 8, 3.5, -30) };
}
/* every overlay: a key, the rectangle it covers in sprite units and its svg */
(function () {
  var D = GEAR_DEF;
  D.h1 = gBeanie('#ff7a6e', '#c2272d', '#ffffff', '#e0d6ec', 0, '#fff', '#d8d0e0');
  D.h2 = gBeanie('#7fc8ff', '#2f78d8', '#ffe27a', '#f0a81c', '#fff', '#ffe27a', '#f0a81c');
  D.h3 = gFlap(); D.h4 = gSanta(); D.h5 = gMuffs(); D.h6 = gParty();
  D.s1 = gScarf('#ff7a6e', '#c2272d', '#fff'); D.s2 = gScarf('#7fc8ff', '#2f78d8', 0); D.s3 = gScarf('#8fe08a', '#2f9a4a', '#fff');
  D.s4 = gScarf('#ffe27a', '#e8a21c', '#ff6fa8'); D.s5 = gScarf('#ff9ec0', '#d6366f', 0); D.s6 = gScarf('#c59bff', '#6a3bc2', '#ffe27a');
  D.m1 = gMitt('#ff7a6e', '#c2272d'); D.m2 = gMitt('#7fc8ff', '#2f78d8'); D.m3 = gMitt('#ffe27a', '#e8a21c'); D.m4 = gMitt('#c59bff', '#6a3bc2');
  D.m1r = gMitt('#ff7a6e', '#c2272d', 'rh'); D.m2r = gMitt('#7fc8ff', '#2f78d8', 'rh'); D.m3r = gMitt('#ffe27a', '#e8a21c', 'rh'); D.m4r = gMitt('#c59bff', '#6a3bc2', 'rh');
  D.i1 = gItem(1); D.i2 = gItem(2); D.i3 = gItem(3);
}());
function gearSvg(d) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + d.x + ' ' + d.y + ' ' + d.w + ' ' + d.h + '" width="' + Math.ceil(d.w * GEAR_K) + '" height="' + Math.ceil(d.h * GEAR_K) + '">' + d.svg + '</svg>'; }
/* one decode per overlay, queued by the loader; a draw skips an overlay that is not there yet */
function gearJobs(push) {
  Object.keys(GEAR_DEF).forEach(function (k) { push(function () { var d = GEAR_DEF[k]; return toImage(gearSvg(d), { w: Math.ceil(d.w * GEAR_K), h: Math.ceil(d.h * GEAR_K) }).then(function (c) { GEAR_IMG[k] = c; }); }); });
}
function rollGear() {
  /* props are a treat: about 2 in 3 penguins wear nothing, 1 in 4 wear one prop, 1 in 12 wear two (and a rare few, three) */
  var g = [0, 0, 0, 0], r = Math.random(), n = r < 0.667 ? 0 : r < 0.917 ? 1 : r < 0.99 ? 2 : 3, W = [0.34, 0.3, 0.22, 0.14], i, k, t, tot;
  for (i = 0; i < n; i++) {
    for (tot = 0, k = 0; k < 4; k++) if (!g[k]) tot += W[k];
    t = Math.random() * tot;
    for (k = 0; k < 3; k++) { if (g[k]) continue; if (t < W[k]) break; t -= W[k]; }
    if (g[k]) for (k = 0; k < 4 && g[k]; k++);
    g[k] = 1 + Math.floor(Math.random() * GEAR_N[['h', 's', 'm', 'i'][k]]);
  }
  return g;
}
/* draw one overlay at the penguin's current scale: the sprite sits at (-s/2, -0.965 s) and is 200 units wide */
function drawGear(k, s) {
  var im = GEAR_IMG[k], d = GEAR_DEF[k], u = s / 200;
  if (im) ctx.drawImage(im, -s / 2 + d.x * u, -s * 0.965 + d.y * u, d.w * u, d.h * u);
}
function drawOutfit(pg, s, tt) {
  var g = pg.gear, k;
  if (!g || pg.kind === 'mc') return;
  if (g[1]) { ctx.save(); if (!calm) { ctx.translate(s * 0.08, -s * 0.5); ctx.rotate(Math.sin(tt * 3 + pg.ph) * 0.03); ctx.translate(-s * 0.08, s * 0.5); } drawGear('s' + g[1], s); ctx.restore(); }
  if (g[2]) drawGear('m' + g[2] + (pg.kind === 'rh' ? 'r' : ''), s);
  if (g[3]) {
    if (!calm) { ctx.save(); ctx.translate(s * 0.3, -s * 0.2); ctx.rotate(Math.sin(tt * 2.2 + pg.ph) * 0.1); ctx.translate(-s * 0.3, s * 0.2); }
    drawGear('i' + g[3], s);
    if (!calm) ctx.restore();
    if (g[3] === 1 && !calm && qLevel < 2) {
      /* steam curls up from the cocoa */
      var u = s / 200, x0 = -s / 2 + 160 * u, y0 = -s * 0.965 + 128 * u, i, f;
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath();
      for (i = 0; i < 3; i++) { f = ((tt * 0.8 + i * 0.33 + pg.ph) % 1); ctx.moveTo(x0 + Math.sin(f * 7 + i * 2) * 5 * u + (3 - f * 2) * u, y0 - f * 24 * u); ctx.arc(x0 + Math.sin(f * 7 + i * 2) * 5 * u, y0 - f * 24 * u, (3 - f * 2) * u, 0, 6.3); }
      ctx.globalAlpha *= 0.8; ctx.fill(); ctx.globalAlpha /= 0.8;
    }
  }
  if (g[0] && !pg.hat) { ctx.save(); if (!calm) { ctx.translate(0, -s * 0.72); ctx.rotate(Math.sin(tt * 4 + pg.ph) * 0.025); ctx.translate(0, s * 0.72); } drawGear('h' + g[0], s); ctx.restore(); }
}
