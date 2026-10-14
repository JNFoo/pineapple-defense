/* In-page layout checks, run by tools/qa.py once per viewport. Copyright (c) 2026 JNFoo. All rights reserved. */
const P = window.__pd, bad = [], wait = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
const hit = (a, b) => a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
const vw = window.innerWidth, vh = window.innerHeight;
if (document.documentElement.scrollWidth > vw + 1) bad.push('page scrolls sideways: ' + document.documentElement.scrollWidth + ' > ' + vw);
/* target-size sweep (idea X134): every visible button, link or field must be at least 44 CSS px on its short side; the weapon picks carry an invisible pad, so they are skipped */
const sweep = where => document.querySelectorAll('button,[role=button],a,input,select').forEach(e => { if (!e.offsetParent || e.hidden || e.closest('.pick')) return; const r = R(e); if (r.w && r.h && Math.min(r.w, r.h) < 44) bad.push('target under 44 px in ' + where + ': ' + (e.id || e.className || e.tagName) + ' ' + Math.round(r.w) + 'x' + Math.round(r.h)); });
sweep('title');
/* title cards: shop, trophies, how to play must fit the screen */
for (const id of ['bShop', 'bTro', 'bHow', 'bSet']) {
  $(id).click(); await wait(60);
  sweep(id);
  const c = document.querySelector('#cw .card'); if (!c) { bad.push(id + ': no card'); continue; }
  const r = R(c); if (r.l < -1 || r.r > vw + 1 || r.t < -1 || r.b > vh + 1) bad.push(id + ' card outside screen ' + JSON.stringify(r));
  const sc = c.scrollHeight > c.clientHeight + 2 || $('cardBody').scrollHeight > $('cardBody').clientHeight + 2; const ok = $('cardOk'); if (ok) { const o = R(ok); if (o.t < -1 || o.r > vw + 1) bad.push(id + ' close button off screen'); }
  $('cardOk').click(); await wait(40);
}
/* game HUD: maxed shop so the raid button shows */
const sv = P.sv(); sv.ra = 2; sv.um = 3; sv.gu = 3; sv.au = 1;
P.go(2, 2); for (let i = 0; i < 80 && !(P.S && P.S.stage === 2 && !$('bRaid').hidden); i++) await wait(25); await wait(60);
sweep('game');
const ids = ['waveBox', 'leftPill', 'comboPill', 'bPause', 'bankTxt', 'cupsTxt'];
const els = ids.map(i => $(i)).filter(Boolean).map(e => e.closest('.pill') || e);
for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) if (els[i] !== els[j] && hit(R(els[i]), R(els[j]))) bad.push('HUD overlap ' + els[i].id + '/' + els[j].id);
els.forEach(e => { const r = R(e); if (r.r > vw + 1 || r.l < -1) bad.push('HUD item off screen ' + (e.id || e.textContent.slice(0, 12))); });
const rb = $('bRaid'), ch = document.querySelector('.cheer'), g = R($('game'));
if (rb.hidden) bad.push('raid button hidden although bought'); else {
  const a = R(rb), b = R(ch); if (hit(a, b)) bad.push('raid button overlaps cheer bar'); if (a.r > g.r + 1 || a.b > g.b - 0.1 * g.h) bad.push('raid button too low or off the right edge ' + JSON.stringify(a));
  if (a.t < b.b - 2) bad.push('raid button above the cheer bar bottom');
  document.querySelectorAll('.pick').forEach(p => { if (hit(a, R(p))) bad.push('raid button overlaps a pick button'); });
  const cr = R(ch); if (cr.h < g.h * 0.3) bad.push('cheer bar too short: ' + Math.round(cr.h) + 'px');
}
/* comfort options: left-handed, large text and high contrast must not overlap or leave the screen */
for (const v of [{ lh: 1, lt: 0, hc: 0, bb: 0 }, { lh: 1, lt: 1, hc: 1, bb: 0 }, { lh: 0, lt: 1, hc: 0, bb: 0 }, { lh: 0, lt: 0, hc: 0, bb: 1 }, { lh: 1, lt: 1, hc: 0, bb: 1 }]) {
  Object.assign(sv, v); const d = document.documentElement; d.setAttribute('data-big', v.bb); d.setAttribute('data-lh', v.lh); d.setAttribute('data-lt', v.lt); d.setAttribute('data-hc', v.hc); await wait(60);
  const tag = ' (lh' + v.lh + ' lt' + v.lt + ' hc' + v.hc + ' bb' + v.bb + ')', vis = ids.map(i => $(i)).filter(Boolean).map(e => e.closest('.pill') || e).filter(e => e.offsetParent);
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) if (vis[i] !== vis[j] && hit(R(vis[i]), R(vis[j]))) bad.push('HUD overlap ' + vis[i].id + '/' + vis[j].id + tag);
  vis.forEach(e => { const r = R(e); if (r.r > vw + 1 || r.l < -1) bad.push('HUD item off screen ' + (e.id || e.textContent.slice(0, 12)) + tag); });
  const a = R($('bRaid')); document.querySelectorAll('.pick').forEach(p => { if (hit(a, R(p))) bad.push('raid button overlaps a pick button' + tag); });
  if (hit(a, R(document.querySelector('.cheer')))) bad.push('raid button overlaps cheer bar' + tag);
}
Object.assign(sv, { lh: 0, lt: 0, hc: 0, bb: 0 }); ['lh', 'lt', 'hc', 'big'].forEach(k => document.documentElement.setAttribute('data-' + k, '0'));
/* run end card with the longest text */
P.go(5, 0); for (let i = 0; i < 80 && !(P.S && P.S.stage === 5); i++) await wait(25); await wait(40); P.sv().run = 6; P.win(); await wait(80);
const gc = document.querySelector('#gcw .card'), gr = R(gc); if (gr.l < -1 || gr.r > vw + 1 || gr.t < -1 || gr.b > vh + 1) bad.push('run end card outside screen ' + JSON.stringify(gr));
return { vw, vh, bad };
