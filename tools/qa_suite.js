/* In-page QA suite for Pineapple Defense. Copyright (c) 2026 JNFoo. All rights reserved.
   Evaluated as the body of an async function by tools/qa.py in Chromium and Firefox (page opened with #qa).
   It fast-forwards game time with __pd.step (no per-frame waiting), checks invariants, fuzzes random actions and walks the card flows. */
const P = window.__pd, R = [], ERR = (window.__qaErr = window.__qaErr || []), FUZZ = window.__qaFuzz || 60;
if (!window.__qaHooked) {
  window.__qaHooked = true;
  window.addEventListener('error', e => ERR.push(String(e.message)));
  window.addEventListener('unhandledrejection', e => ERR.push('promise: ' + e.reason));
  const ce = console.error; console.error = function () { ERR.push([].join.call(arguments, ' ')); return ce.apply(console, arguments); };
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const $ = id => document.getElementById(id);
const cardUp = () => !$('gcw').hidden;
const card = () => ({ t: $('gTitle').textContent, b1: $('gBtn1').textContent, b2: $('gBtn2').textContent, b3: $('gBtn3').hidden ? '' : $('gBtn3').textContent, body: $('gBody').textContent });
async function wf(fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < (ms || 3000)) { if (fn()) return true; await wait(25); } return false; }
function inv(tag) {
  const S = P.S, bad = [], sv = P.sv();
  P.penguins.forEach(p => { if (!isFinite(p.xn) || !isFinite(p.p) || !isFinite(p.v)) bad.push('penguin NaN ' + p.kind + ' ' + p.st); if (p.p < -0.2 || p.p > 1.3) bad.push('penguin p out of range ' + p.p + ' ' + p.st); });
  if (!isFinite(S.cheer) || S.cheer < 0 || S.cheer > 100) bad.push('cheer ' + S.cheer);
  if (!isFinite(sv.bank) || sv.bank < 0 || sv.bank % 1) bad.push('bank ' + sv.bank);
  if (P.bits > 400) bad.push('bits ' + P.bits); if (P.shots > 60) bad.push('shots ' + P.shots); if (P.rings > 90) bad.push('rings ' + P.rings);
  if (S.gulls && S.gulls.length > 6) bad.push('gulls ' + S.gulls.length); if (S.umb && S.umb.length > 5) bad.push('umb ' + S.umb.length);
  if (S.ms && S.ms.length > 12) bad.push('missiles ' + S.ms.length);
  if (S.umL < 0 || S.raL < 0) bad.push('negative stock');
  if (bad.length) throw new Error(tag + ': ' + bad.join('; '));
}
async function T(name, fn) {
  const t0 = performance.now(), e0 = ERR.length; let ok = true, d = '';
  try { const r = await fn(); if (typeof r === 'string') d = r; } catch (e) { ok = false; d = String(e && e.message || e); }
  if (ERR.length > e0) { ok = false; d += ' | page errors: ' + ERR.slice(e0).join(' // ').slice(0, 300); }
  R.push({ n: name, ok, ms: Math.round(performance.now() - t0), d });
}
async function go(st, w) { P.go(st, w); if (!await wf(() => P.S && P.S.stage === st && P.penguins !== undefined && !$('game').hidden, 4000)) throw new Error('go timeout'); await wait(80); P.bot = false; }

await T('load', async () => { if (!P) throw new Error('no __pd'); const sv = P.sv(); ['stage', 'wave', 'bank', 'ach', 'ac2', 'gu', 'um', 'ra', 'run', 'cd', 'rl', 'lm', 'lh', 'aim', 'arc', 'hc', 'lt', 'thr'].forEach(k => { if (!isFinite(sv[k])) throw new Error('save field ' + k + ' = ' + sv[k]); }); });

for (let st = 1; st <= 5; st++) await T('stage ' + st + ' runs', async () => { await go(st, 0); P.bot = true; P.step(25, 0.033, 40); inv('stage' + st); P.bot = false; });

await T('combo calls', async () => {
  await go(1, 1); const S = P.S;
  P.cmb(2, 2); P.step(0.1, 0.033); if (!S.call || S.call.txt !== 'Double!') throw new Error('double: ' + JSON.stringify(S.call));
  S.cmb.t = -9; P.cmb(6, 2); P.step(0.1, 0.033); if (S.call.tier < 3) throw new Error('tier ' + S.call.tier);
  S.cmb.t = -9; P.cmb(3, 3); P.step(0.1, 0.033); if (!/^Team/.test(S.call.txt) || !/auto/.test(S.call.sub)) throw new Error('mixed: ' + JSON.stringify(S.call));
  S.cmb.t = -9; P.cmb(12, 2); P.step(0.1, 0.033); if (S.call.txt !== 'LEGENDARY!') throw new Error('legendary: ' + S.call.txt);
});

await T('umbrella flings, no cheer loss', async () => {
  await go(1, 3); P.st('um', 2); const S = P.S; P.step(2, 0.033);
  const pg = P.penguins.find(p => p.st === 'walk'); if (!pg) throw new Error('no walker');
  const c0 = S.cheer, b0 = S.bumps; pg.p = 0.949; pg.v = 0.3; P.step(0.2, 0.033);
  if (S.umL !== 1 || pg.st !== 'fling') throw new Error('umL ' + S.umL + ' state ' + pg.st);
  P.step(1.8, 0.033, 10); if (S.bumps !== b0 || S.cheer < c0) throw new Error('bumped or lost cheer'); if (P.penguins.includes(pg)) throw new Error('flung penguin still around');
  const p2 = P.penguins.find(p => p.st === 'walk'); if (p2) { p2.p = 0.949; P.step(0.2, 0.033); } P.step(0.5, 0.033);
  const p3 = P.penguins.find(p => p.st === 'walk'); if (p3) { p3.p = 0.949; P.step(0.2, 0.033); }
  P.step(0.5, 0.033); const p4 = P.penguins.find(p => p.st === 'walk'); if (p4 && S.umL === 0) { p4.p = 0.949; P.step(0.2, 0.033); if (p4.st !== 'bump' && p4.st !== 'walk') throw new Error('out of umbrellas should bump, got ' + p4.st); }
  inv('umbrella');
});

await T('air raid', async () => {
  await go(2, 3); P.st('ra', 2); const S = P.S; P.step(2, 0.033);
  P.raid(); if (S.raL !== 1 || !S.raid) throw new Error('raid did not start'); P.raid(); if (S.raL !== 1) throw new Error('second raid allowed while one is active');
  P.step(3, 0.033, 6); if (S.raid) throw new Error('raid never ended'); P.raid(); if (S.raL !== 0) throw new Error('second raid'); P.step(3, 0.033); P.raid(); if (S.raL !== 0) throw new Error('over-stock raid'); inv('raid');
});

await T('thrown pineapples: harder flicks fly farther, misses land and stay put, a vanished target is flown past', async () => {
  await go(1, 1); const S = P.S; S.mode = 'intro'; P.penguins.length = 0; S.spawnT = 99;
  const land = async spd => { S.cd = 0; P.flick(0, -1, spd); const s = P.sh[P.sh.length - 1]; if (!s) throw new Error('no shot'); const pe = s.pEnd; for (let i = 0; i < 40 && P.sh.length; i++) P.step(0.05, 0.05); return pe; };
  const soft = await land(1.6), hard = await land(4.0);
  if (!(hard < soft - 0.15)) throw new Error('a harder flick should land farther: soft ' + soft + ' hard ' + hard);
  S.cd = 0; P.flick(0, -1, 2.5); let s = P.sh[P.sh.length - 1]; P.step(s.T + 0.02, 0.01);
  if (!(s.ph === 1 && s.rx === s.xE && s.ry === s.yE)) throw new Error('a missed pineapple should stay where it landed');
  P.step(1, 0.05); inv('flicks');
  /* aimed at a penguin that is gone by the time it arrives: the pineapple flies on past the spot */
  P.bot = false; S.mode = 'run'; S.toSpawn = 9; S.spawned = 0; S.spawnT = 0; P.step(1.2, 0.05); const pg = P.penguins.find(q => q.st === 'walk'); if (!pg) throw new Error('no penguin');
  S.cd = 0; const c = P.plan ? null : null; P.tap(window.innerWidth / 2, window.innerHeight / 2);
  const aimed = P.sh[P.sh.length - 1]; if (!aimed) throw new Error('no aimed shot'); aimed.soft = true; P.penguins.length = 0;
  P.step(aimed.T + 0.02, 0.01); if (!aimed.ext) throw new Error('shot did not fly on'); P.step(1, 0.05); inv('fly on'); S.toSpawn = 0;
  return 'soft ' + soft.toFixed(2) + ' hard ' + hard.toFixed(2);
});

await T('helpers wait for the first throw each round', async () => {
  const sv = P.sv(); sv.au = 1; sv.ar = 3; sv.lm = 3; await go(1, 1); P.bot = false; const S = P.S;
  if (S.pt) throw new Error('pt should start false');
  let seen = 0; for (let i = 0; i < 120; i++) { P.step(0.05, 0.05); seen = Math.max(seen, P.sh.length); }
  if (seen) throw new Error('a helper fired before the first throw');
  P.flick(0, -1, 3); if (!S.pt) throw new Error('first throw did not release the helpers');
  const ids = new Set(); for (let i = 0; i < 160; i++) { P.step(0.05, 0.05); P.sh.forEach(s => ids.add(s)); } const fired = ids.size; if (fired < 3) throw new Error('helpers never joined in: ' + fired);
  P.win(); sv.au = 0; sv.ar = 0; sv.lm = 0; return 'shots after first throw ' + fired;
});

await T('auto slingshot only turns slightly', async () => {
  const sv = P.sv(); sv.au = 1; await go(1, 3); P.bot = false; P.S.pt = true; let mx = 0;
  for (let i = 0; i < 300; i++) { P.step(0.1, 0.05); mx = Math.max(mx, Math.abs(P.S.au.a)); }
  sv.au = 0; if (mx > 0.125) throw new Error('auto slingshot leaned ' + mx.toFixed(2)); return 'max turn ' + mx.toFixed(2) + ' rad';
});

await T('auto slingshot is slower and sometimes misses', async () => {
  const sv = P.sv(); sv.au = 1; sv.ar = 3; sv.ap = 0; let n = 0, miss = 0, minGap = 99;
  try {
    for (let r = 0; r < 4; r++) {
      await go(1, 3); P.bot = false; P.S.pt = true; const seen = new Map();
      for (let i = 0; i < 300; i++) { P.step(0.1, 0.05); P.S.cheer = 100; P.sh.forEach(q => { if (q.auto && !seen.has(q)) seen.set(q, P.S.t); }); }
      const ts = [...seen.values()].sort((x, y) => x - y); for (let k = 1; k < ts.length; k++) minGap = Math.min(minGap, ts[k] - ts[k - 1]);
      n += seen.size; miss += [...seen.keys()].filter(q => q.miss).length;
    }
  } finally { sv.au = 0; sv.ar = 0; }
  if (n < 4) throw new Error('auto barely fired: ' + n); if (minGap < 2.7) throw new Error('two auto tosses only ' + minGap.toFixed(2) + ' s apart at the fastest tier (needs >= 2.8)');
  if (miss / n < 0.05 || miss / n > 0.6) throw new Error('auto missed ' + miss + ' of ' + n + ' (expected about 28%)');
  return n + ' tosses, ' + miss + ' missed, shortest gap ' + minGap.toFixed(2) + ' s';
});

await T('mecha penguins: a Gentoo that eats a fish is tougher than a normal penguin', async () => {
  await go(2, 2); P.bot = false; P.step(4, 0.05); const S = P.S, L = P.penguins; if (!L.length) throw new Error('no penguins');
  L.forEach(pg => { if (pg.st === 'walk') { pg.kind = 'gt'; pg.hp = 2; pg.big = 1.12; pg.p = 0.18; pg.v = Math.min(pg.v, 0.02); } });
  let mc = null; for (let k = 0; k < 24 && !mc; k++) { P.fish(); P.step(4.5, 0.05); mc = P.penguins.find(pg => pg.kind === 'mc'); if (!mc) P.penguins.forEach(pg => { if (pg.st === 'walk') { if (pg.kind === 'ad') { pg.kind = 'gt'; pg.hp = 2; } if (pg.p > 0.3) pg.p = 0.18; } }); }
  if (!mc) throw new Error('no Gentoo ever became a mecha penguin');
  if (mc.hp !== 3) throw new Error('mecha hp ' + mc.hp + ', wanted 3'); if (!(mc.hp > 2 && mc.hp < 8)) throw new Error('mecha toughness out of range');
  const hits0 = mc.hp; P.penguins.forEach(pg => { if (pg !== mc) pg.p = -9; }); return 'mecha with ' + hits0 + ' hits';
});

await T('stage progress bar fills with each wave and lights the Champion medal', async () => {
  await go(1, 0); P.bot = false; const bar = $('prog'); if (!bar || bar.querySelectorAll('.seg').length !== 5) throw new Error('bar missing or not 5 segments');
  P.step(0.2, 0.05, 1); const f0 = [...bar.querySelectorAll('.seg i')].map(i => i.style.transform);
  await go(1, 3); P.step(0.2, 0.05, 1); const f3 = [...bar.querySelectorAll('.seg i')].map(i => i.style.transform);
  if (f0.join() === f3.join()) throw new Error('bar did not change between wave 1 and wave 4: ' + f3.join());
  if (bar.getAttribute('data-boss') !== '0') throw new Error('medal lit too early');
  await go(1, 8); P.step(0.3, 0.05, 1); if (bar.getAttribute('data-boss') !== '1') throw new Error('medal not lit in the Champion fight: ' + bar.getAttribute('data-boss'));
  return f3.join(' ');
});

await T('more fish fall in the last two waves', async () => {
  const count = async (w) => { let tot = 0; for (let k = 0; k < 3; k++) { await go(2, w); P.bot = true; const S = P.S, seen = new Set(), wave = S.wave; for (let i = 0; i < 1000 && S.wave === wave && S.mode !== 'boss' && S.mode !== 'bossIntro' && !S.over; i++) { P.step(0.05, 0.05); S.fish.forEach(f => seen.add(f)); } tot += seen.size; } P.bot = false; return tot; };
  const early = await count(1), late = await count(3); if (late < 1 || late <= early) throw new Error('only ' + late + ' fish in 3 late-wave tries (early ' + early + ')');
  return 'fish in 3 tries: waves 2 = ' + early + ', wave 4 = ' + late;
});

await T('no giggling anywhere in the page text', async () => {
  const html = document.documentElement.innerHTML; if (/giggl/i.test(html)) throw new Error('found giggl in ' + html.match(/.{30}giggl.{30}/i)[0]);
});

await T('penguin outfits: props are rare, two at once are rarer, mecha penguins have none', async () => {
  await go(2, 3); P.bot = false; const S = P.S; for (let i = 0; i < 300 && P.penguins.length < 4; i++) { P.step(0.1, 0.1); S.cheer = 100; }
  const L = P.penguins.filter(p => p.kind !== 'mc'); if (L.length < 2) throw new Error('too few penguins: ' + L.length);
  if (L.some(p => !Array.isArray(p.gear) || p.gear.length !== 4)) throw new Error('bad gear shape');
  /* roll many outfits the way the spawner does (a fresh spawn each) and count: about 33% have a prop, 8% two or more */
  let one = 0, two = 0, N = 3000, i;
  for (i = 0; i < N; i++) { const g = P.rollGear(); const c = g.filter(x => x).length; if (c) one++; if (c > 1) two++; }
  const pa = one / N, pb = two / N; if (pa < 0.26 || pa > 0.41) throw new Error('props on ' + Math.round(pa * 100) + '% of penguins, wanted about 33%'); if (pb < 0.04 || pb > 0.13) throw new Error('two or more props on ' + Math.round(pb * 100) + '%, wanted about 8%');
  P.penguins[0].gear = [1, 1, 1, 1]; P.penguins[0].kind = 'mc'; P.step(0.1, 0.05, 1); /* a mecha draws without error */ P.penguins[0].kind = 'ad'; P.step(0.1, 0.05, 1);
  return Math.round(pa * 100) + '% have a prop, ' + Math.round(pb * 100) + '% two or more';
});

await T('the main sling only tilts a little, like the helpers', async () => {
  await go(1, 3); P.bot = false; const S = P.S, cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), x0 = r.left + r.width * 0.5, y0 = r.top + r.height * 0.8;
  cv.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, clientX: x0, clientY: y0, bubbles: true, cancelable: true }));
  let worst = 0; for (const dx of [-160, 160, -120, 120]) { cv.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, clientX: x0 + dx, clientY: y0 - 40, bubbles: true })); P.step(0.6, 0.03, 1); worst = Math.max(worst, Math.abs(S.sa)); }
  cv.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 7, clientX: x0, clientY: y0, bubbles: true }));
  if (worst < 0.02) throw new Error('the sling did not tilt at all (' + worst.toFixed(3) + ')'); if (worst > 0.13) throw new Error('the sling tilted ' + (worst * 57.3).toFixed(0) + ' degrees, wanted at most about 7');
  return 'max tilt ' + (worst * 57.3).toFixed(1) + ' degrees';
});

await T('no throws leave any slingshot during the Champion Ready, Set, GO', async () => {
  const sv = P.sv(); sv.au = 1; sv.lm = 1; await go(1, 8); const S = P.S, sh0 = P.sh.length; let saw = 0;
  for (let i = 0; i < 400 && !(S.boss && S.boss.rs > 0); i++) P.step(0.05, 0.05);   /* run into the Ready window */
  if (!P.rsg()) throw new Error('never saw the Ready window');
  const before = P.sh.length; S.cd = 0; P.flick(0, -1, 4); P.step(0.1, 0.05); S.au.cd = 0; S.lm.cd = 0; S.pt = true; P.step(1.5, 0.05); P.flick(0.1, -1, 4); P.step(0.2, 0.05); saw++;
  if (P.sh.length !== before) throw new Error('a shot left a slingshot during Ready (' + (P.sh.length - before) + ')'); if (S.lm.sup < 6 && sv.lm) throw new Error('the lime launcher fired during Ready');
  for (let i = 0; i < 400 && P.rsg(); i++) P.step(0.05, 0.05); if (P.rsg()) throw new Error('Ready, Set, GO never ended');
  S.cd = 0; P.flick(0, -1, 4); if (P.sh.length <= before) throw new Error('could not throw after GO'); sv.au = 0; sv.lm = 0;
  return 'blocked until GO, then free';
});

await T('first-load tour: five cards, skip, replay', async () => {
  const sv = P.sv(); document.getElementById('game').hidden = true; document.getElementById('title').hidden = false; sv.tr = 0; P.tour();
  const cw = document.getElementById('cw'); if (cw.hidden) throw new Error('tour did not open'); if (!sv.tr) throw new Error('tour flag not saved');
  const titles = [], click = sel => document.querySelector(sel).click();
  for (let i = 0; i < 5; i++) { titles.push(document.getElementById('cardTitle').textContent); if (!document.querySelector('.tour .tvis')) throw new Error('no picture on card ' + (i + 1)); if (!document.querySelector('.tskip')) throw new Error('no skip button on card ' + (i + 1)); if (i < 4) click('.tnext'); }
  if (new Set(titles).size !== 5) throw new Error('cards repeat: ' + titles.join('|'));
  click('.tback'); click('.tnext'); click('.tnext'); if (!cw.hidden) throw new Error('last card did not close the tour');
  P.tour(); click('.tskip'); if (!cw.hidden) throw new Error('skip did not close the tour');
  document.getElementById('bHow').click(); const rb = document.getElementById('tourBtn'); if (!rb) throw new Error('no replay button in How to play'); rb.click(); if (cw.hidden || !document.querySelector('.tour')) throw new Error('replay did not start'); click('.tskip');
  document.getElementById('title').hidden = true; document.getElementById('game').hidden = false; return titles.join(' / ');
});

await T('settings: rows, game speed, large buttons, battery saver', async () => {
  const sv = P.sv(); sv.sp = 0; sv.bb = 0; sv.bv = 0; $('bSet').click(); await wait(50);
  const rows = [...document.querySelectorAll('#cardBody .so')].filter(r => !r.hidden); if (rows.length < 9) throw new Error('settings rows ' + rows.length);
  if (rows.some(r => !r.querySelector('small') || !r.querySelector('.st').textContent)) throw new Error('a settings row has no help line or no state');
  $('cmSp').click(); if (sv.sp !== 1 || $('cmSp').querySelector('.st').textContent !== '90%') throw new Error('speed did not step to 90%: ' + sv.sp);
  for (let i = 0; i < 4; i++) $('cmSp').click(); if (sv.sp !== 0) throw new Error('speed did not wrap to 100%');
  $('cmBig').click(); if (document.documentElement.dataset.big !== '1' || !sv.bb) throw new Error('large buttons did not switch on'); $('cmBig').click();
  $('cmSave').click(); if (!sv.bv) throw new Error('battery saver did not switch on'); $('cmSave').click();
  const warn = $('svWarn'); if (!warn || !warn.hidden) throw new Error('storage warning shown although saving works');
  $('cardOk').click(); document.getElementById('title').hidden = true; document.getElementById('game').hidden = false;
  /* the speed setting slows the game clock in real play */
  const meas = async (sp) => { sv.sp = sp; await go(1, 3); P.bot = false; const S = P.S; await wait(150); const t0 = S.t; await wait(600); return S.t - t0; };
  const full = await meas(0), slow = await meas(4); sv.sp = 0;
  if (!(full > 0.3)) throw new Error('the clock did not run (' + full + ')'); if (slow > full * 0.8 || slow < full * 0.4) throw new Error('60% speed ran at ' + Math.round(slow / full * 100) + '% of normal');
  return 'steps 100>90, 60% ran at ' + Math.round(slow / full * 100) + '% of normal';
});

await T('every trophy and shop upgrade has its own icon', async () => {
  $('bTro').click(); await new Promise(r => setTimeout(r, 50));
  const us = [...document.querySelectorAll('#trList use')].map(u => u.getAttribute('href')); if (us.length !== 21) throw new Error('trophy rows ' + us.length);
  const miss = us.filter(h => !document.querySelector(h)); if (miss.length) throw new Error('missing icon symbols: ' + miss.join()); if (new Set(us).size !== 21) throw new Error('trophy icons repeat');
  $('cardOk').click(); $('bShop').click(); await new Promise(r => setTimeout(r, 50));
  const rows = [...document.querySelectorAll('#shList .ti')]; const ic = rows.map(r => r.querySelector('use')); if (rows.length < 9 || ic.some(u => !u || !document.querySelector(u.getAttribute('href')))) throw new Error('shop rows without an icon');
  $('cardOk').click(); return us.length + ' trophy icons, ' + rows.length + ' shop icons';
});

await T('the wave counter pill is gone from play (the progress bar shows it)', async () => {
  await go(4, 1); const pill = $('waveBox'); if (getComputedStyle(pill).display !== 'none') throw new Error('wave pill still shown'); P.step(0.2, 0.05, 1);
  if (!/^S4$/.test($("progStg").textContent)) throw new Error("stage label missing: " + $("progStg").textContent);
  if ($('prog').querySelectorAll('.seg').length !== 5) throw new Error('progress bar missing');
});

await T('stage 4 and 5 scenery reacts to taps', async () => {
  await go(4, 1); const S = P.S, W = innerWidth, H = innerHeight; P.step(0.3, 0.05, 1); S.t = 20; S.rc = 0;
  const c = P.sc.cl; if (!c) throw new Error('no cloud'); if (!P.stap(c.x, c.y)) throw new Error('the cloud ignored a tap'); if (!(P.sc.clT >= 0)) throw new Error('cloud did not react');
  if (!P.stap(P.sc.dk.x, P.sc.dk.y)) throw new Error('the duck ignored a tap'); if (P.stap(W * 0.5, H * 0.9)) throw new Error('a tap on the lane was swallowed');
  await go(5, 1); P.S.rc = 0; P.step(0.3, 0.05, 1); const b = P.sc.balPos; if (!b || b.length < 3) throw new Error('no balloons'); const n0 = b.length, q = b[0]; if (!P.stap(q.x, q.y)) throw new Error('balloon did not pop'); P.step(0.1, 0.05, 1);
  if (P.sc.balPos.length !== n0 - 1) throw new Error('balloon count ' + P.sc.balPos.length); P.step(8, 0.05, 20); if (P.sc.balPos.length !== n0) throw new Error('balloon did not come back');
  return n0 + ' balloons, one popped and returned';
});

/* Champion fights: every Champion after Coach Waddles plays a different way */
const fightSim = async (st, rule) => {
  await go(st, 8); const S = P.S; P.bot = true; let t = 0, prevHp = null, prevSafe = false, prevP = 0, seen = {};
  while (S.mode !== 'bossWin' && !S.over && t < 160) {
    const b = S.boss; P.step(0.05, 0.05); t += 0.05; if (!S.boss) continue;
    rule(S, S.boss, { prevHp, prevSafe, prevP, seen }); prevHp = S.boss.hp; prevSafe = S.boss.safe; prevP = S.boss.p;
  }
  P.bot = false; inv('fight' + st);
  if (S.mode !== 'bossWin') throw new Error('the bot did not win in ' + t.toFixed(0) + ' s: mode ' + S.mode + ' hp ' + (S.boss && S.boss.hp));
  return seen;
};
await T('champion 2 (Flipper): hits only count while he is up', async () => {
  const seen = {}; await fightSim(2, (S, b, o) => { if (o.prevHp !== null && b.hp < o.prevHp && o.prevSafe) throw new Error('hit while hidden'); if (b.safe) seen.hid = 1; else if (b.st === 'hold') seen.up = 1; Object.assign(o.seen, seen); });
  return 'hid and up both seen';
});
await T('champion 3 (Slidealot): charges, hits knock him back', async () => {
  let back = 0, chg = 0; await fightSim(3, (S, b, o) => { if (o.prevHp !== null && b.hp < o.prevHp && b.p < o.prevP - 0.05) back++; if (b.p > o.prevP + 0.0005) chg++; });
  if (!back || !chg) throw new Error('knockbacks ' + back + ', advances ' + chg); return 'knockbacks ' + back;
});
await T('champion 3 (Slidealot): reaching the table costs cheer', async () => {
  await go(3, 8); const S = P.S; P.bot = false; let t = 0; while (!(S.boss && S.boss.st === 'hold') && t < 40) { P.step(0.1, 0.05); t += 0.1; }
  const c0 = S.cheer; let bonk = false; for (let i = 0; i < 300 && !bonk; i++) { P.step(0.1, 0.05); if (S.cheer < c0 - 10) bonk = true; }
  if (!bonk) throw new Error('he never reached the table'); if (S.boss.p > 0.6) throw new Error('he should be sent back, p=' + S.boss.p); return 'cheer ' + Math.round(S.cheer);
});
await T('champion 4 (Mohawk): shielded by her squad, then open', async () => {
  const seen = {}; await fightSim(4, (S, b, o) => { if (o.prevHp !== null && b.hp < o.prevHp && o.prevSafe) throw new Error('hit while shielded'); if (b.safe && P.penguins.some(q => q.st === 'walk')) seen.sq = 1; if (!b.safe && b.st === 'hold') seen.open = 1; Object.assign(o.seen, seen); });
  return 'squad and open window seen';
});
await T('champion 5 (Bernard): clones pop, only the real one is hurt', async () => {
  let clones = 0; await fightSim(5, (S, b, o) => { if (S.clones.length > 2) throw new Error('too many clones'); if (S.clones.length) clones++; if (S.clones.some(d => !isFinite(d.xn))) throw new Error('bad clone'); });
  if (!clones) throw new Error('no clones appeared'); return 'clone frames ' + clones;
});

await T('lime launcher: tiers set the limes per Champion fight', async () => {
  const sv = P.sv(), out = [];
  for (const tier of [1, 2, 3]) {
    sv.lm = tier; await go(1, 8); const S = P.S; let t = 0;
    while (S.mode !== 'boss' || !S.boss || S.boss.st !== 'hold') { P.step(0.1, 0.05); if ((t += 0.1) > 30) throw new Error('boss never held'); }
    S.pt = true; const start = S.lm.sup; let low = start;
    for (let i = 0; i < 1200 && S.boss && S.mode === 'boss'; i++) { P.step(0.05, 0.05); if (S.boss) low = Math.min(low, S.lm.sup); }
    const fired = start - low;
    const want = [6, 12, 20][tier - 1]; if (start > want || fired > want) throw new Error('tier ' + tier + ' supply ' + start + ' fired ' + fired + ' (limit ' + want + ')');
    if (!fired) throw new Error('tier ' + tier + ' fired nothing'); if (tier === 1 && (fired < 5 || fired > 6)) throw new Error('tier 1 should use about 6 limes, used ' + fired); out.push(tier + ':' + fired);
  }
  sv.lm = 0; return 'limes fired per fight ' + out.join(' ');
});

await T('lime launcher: shield first, then Champion', async () => {
  const sv = P.sv(); sv.lm = 0; await go(1, 8);
  const S = P.S; let sawM = 0, t = 0; while (S.mode !== 'boss' || !S.boss || S.boss.st !== 'hold') { P.step(0.1, 0.05); if ((t += 0.1) > 30) throw new Error('boss never held'); }
  P.step(9, 0.05); sawM = S.ms.length; if (sawM || S.boss.hp !== S.bossMax) throw new Error('missiles fired without the launcher');
  sv.lm = 3; S.pt = true; S.boss.shield = S.boss.shield || 3; let popped = 0, hurt = 0, maxM = 0, hp = S.boss.hp, sh = S.boss.shield, first = '';
  for (let i = 0; i < 1600 && S.boss && S.mode === 'boss'; i++) {
    P.step(0.05, 0.05); maxM = Math.max(maxM, S.ms.length); if (!S.boss) break;
    if (S.boss.shield < sh && !first) first = 'pop'; if (S.boss.hp < hp && !first) first = 'hurt'; if (S.boss.hp < hp) hurt++; if (S.boss.shield < sh) popped++;
    hp = S.boss.hp; sh = S.boss.shield; if (S.boss.st === 'hold' && S.boss.shield > S.boss.hp + 10) break;
  }
  if (first !== 'pop') throw new Error('first effect was ' + first); if (!hurt || !popped) throw new Error('popped ' + popped + ' hurt ' + hurt); if (maxM > 8) throw new Error('too many missiles ' + maxM);
  const lm = P.S.lm; if (lm.sup < 0 || lm.sup > 20) throw new Error('lime supply out of range ' + lm.sup);
  sv.lm = 0; inv('lime'); return 'popped ' + popped + ', hurt ' + hurt + ', max in flight ' + maxM;
});

await T('comfort: left-handed, aim help, countdown, text, contrast', async () => {
  const sv = P.sv(); await go(1, 2); const S = P.S, r = document.documentElement;
  sv.lh = 1; sv.hc = 1; sv.lt = 1; sv.aim = 0; sv.arc = 1; document.documentElement.setAttribute('data-lh', '1');
  P.step(1, 0.033); const cheer = document.querySelector('.cheer').getBoundingClientRect(), boss = document.querySelector('.bossbar');
  if (cheer.left > innerWidth / 2) throw new Error('left-handed cheer bar is still on the right');
  const hrow = [...document.querySelectorAll('.hud .hrow > *')].filter(e => e.offsetParent); if (hrow.some(e => { const b = e.getBoundingClientRect(); return b.left < -1 || b.right > innerWidth + 1; })) throw new Error('left-handed HUD overflows');
  sv.lh = 0; sv.hc = 0; sv.lt = 0; sv.aim = 1; sv.arc = 0; document.documentElement.setAttribute('data-lh', '0');
  P.pause(); P.resume(); if (!(S.rc > 2.9)) throw new Error('no resume countdown'); const t0 = S.t; P.step(1, 0.05); if (S.t !== t0) throw new Error('world moved during countdown'); P.step(3, 0.05); if (S.rc !== 0) throw new Error('countdown did not finish');
  inv('comfort');
});

await T('replay keeps the saved run; best scores', async () => {
  const sv = P.sv(); sv.cleared = 2; sv.stage = 4; sv.wave = 3; sv.golden = 77; sv.bs2 = 0; P.replay(2); if (!await wf(() => P.S && P.S.replay, 3000)) throw new Error('replay did not start');
  const S = P.S; P.bot = true; P.step(40, 0.05, 0); if (sv.stage !== 4 || sv.wave !== 3 || sv.golden !== 77) throw new Error('replay overwrote progress: ' + sv.stage + '/' + sv.wave + '/' + sv.golden);
  P.bot = false; P.win(); if (!sv.bs2) throw new Error('no best score recorded'); if (sv.stage !== 4 || sv.wave !== 3) throw new Error('replay win changed progress'); const c = card(); if (!/Play it again/.test(c.b1)) throw new Error('replay card: ' + c.b1);
  $('gBtn2').click(); await wait(50);
});

await T('shop: try it restores the save; undo refunds', async () => {
  const sv = P.sv(); sv.bank = 500; sv.lm = 0; sv.gu = 0; sv.au = 0; const before = JSON.stringify(sv);
  P.demo({ name: 'Lime Launcher', kind: 'boss', over: { lm: 3 } }); if (!await wf(() => P.S && P.S.stage === 2 && P.dm, 3000)) throw new Error('demo did not start');
  if (sv.lm !== 3) throw new Error('upgrade was not lent'); for (let i = 0; i < 400 && P.dm; i++) P.step(0.1, 0.05); await wait(80);
  if (P.dm) throw new Error('demo never ended'); const strip = (j) => j.replace(/,"seen":\d+/, ''); if (strip(JSON.stringify(sv)) !== strip(before)) throw new Error('save was not restored: ' + JSON.stringify(sv) + ' vs ' + before);   /* "seen" is the save time stamp and may move */
  $('cardOk') && $('cardOk').click(); document.getElementById('bShop').click(); const buy = [...document.querySelectorAll('#shList .sb')].find(b => /^Buy/.test(b.textContent)); buy.click();
  if (sv.bank >= 500) throw new Error('buy did nothing'); P.undoShop(); if (sv.bank !== 500 || sv.au) throw new Error('undo did not refund: bank ' + sv.bank + ' au ' + sv.au); $('cardOk').click();
});

await T('next goal chip', async () => {
  const sv = P.sv(); sv.bank = 10; sv.au = 0; sv.lm = 0; sv.gu = 0; sv.um = 0; sv.ra = 0; P.goal(); const g = $('goal'); if (g.hidden || !/more Golden Pineapples for the Auto Slingshot/.test(g.textContent)) throw new Error('goal: ' + g.textContent);
  sv.bank = 500; P.goal(); if (!/can buy/.test(g.textContent)) throw new Error('goal2: ' + g.textContent); sv.bank = 0;
});

await T('gull grabs fish', async () => {
  await go(1, 2); P.st('gu', 3); const S = P.S; S.fishT = 1e9; /* no natural fish during the check */ P.step(1, 0.033); let ok = false;
  for (let i = 0; i < 40 && !ok; i++) { ok = P.gull(); if (!ok) P.step(0.5, 0.033); }
  if (!ok) throw new Error('no fish could drop'); if (!S.gulls.length) throw new Error('no gull at tier 3');
  P.step(2.2, 0.033, 10); if (S.fish.length) throw new Error('fish not grabbed'); P.step(2, 0.033); if (S.gulls.length) throw new Error('gull never left'); inv('gull');
});

await T('run speed math', async () => {
  const sv = P.sv(), old = sv.run; sv.run = 0; if (Math.abs(P.runK() - 1) > 1e-9) throw new Error('k0');
  sv.run = 3; if (Math.abs(P.runK() - 1.331) > 1e-6) throw new Error('k3 ' + P.runK()); sv.run = 7; if (P.runK() < 1.94 || P.runK() > 1.95) throw new Error('k7 ' + P.runK()); sv.run = 12; if (P.runK() !== 2) throw new Error('cap ' + P.runK()); sv.run = old;
});

await T('stage 4 offer, roll, on to 5', async () => {
  P.sv().rl = 0; await go(4, 0); P.win(); await wait(50); let c = card();
  if (c.t !== 'Stage 4 clear!' || !/Roll/.test(c.b1) || !/Skip/.test(c.b2)) throw new Error(JSON.stringify(c));
  $('gBtn1').click(); if (!await wf(() => P.K, 3000)) throw new Error('roll did not start');
  P.endSk(50); P.step(0.2, 0.033); if (!await wf(cardUp, 2000)) throw new Error('no end card'); c = card();
  if (!/Roll again/.test(c.b1) || !/stage 5/.test(c.b2)) throw new Error(JSON.stringify(c));
  $('gBtn2').click(); if (!await wf(() => !P.K && P.S.stage === 5, 3000)) throw new Error('did not reach stage 5');
  await go(4, 0); P.win(); await wait(50); $('gBtn2').click(); if (!await wf(() => P.S.stage === 5 && !P.K, 3000)) throw new Error('skip failed');
});

await T('bonus game: two rolls per run', async () => {
  const sv = P.sv(); sv.rl = 0; P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('first roll'); if (sv.rl !== 1) throw new Error('rl ' + sv.rl);
  P.endSk(50); P.step(0.2, 0.033); if (!await wf(cardUp, 2000)) throw new Error('no card'); let c = card();
  if (!/Roll again/.test(c.b1) || !/one more/.test(c.body)) throw new Error(JSON.stringify(c));
  $('gBtn1').click(); if (!await wf(() => P.K && P.sv().rl === 2, 3000)) throw new Error('second roll');
  P.endSk(50); P.step(0.2, 0.033); if (!await wf(cardUp, 2000)) throw new Error('no card 2'); c = card();
  if (/Roll again/.test(c.b1) || !/last roll/.test(c.body)) throw new Error('no limit: ' + JSON.stringify(c)); if (!$('gBtn2').hidden) throw new Error('second button should hide');
  $('gBtn1').click(); await wait(80); P.skee(); await wait(120); if (P.K) throw new Error('a third roll started'); if (sv.rl !== 2) throw new Error('rl moved ' + sv.rl);
  await go(4, 0); P.win(); await wait(50); c = card(); if (c.t !== 'Stage 4 clear!' || !/Next stage/.test(c.b1)) throw new Error('offer should vanish: ' + JSON.stringify(c)); $('gBtn1').click(); await wait(80); sv.rl = 0;
});

await T('bonus game: a human-sized flick wobble still sinks often', async () => {
  const sv = P.sv(); sv.rl = 0; P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('no minigame');
  const rnd = () => { let u = 0; for (let i = 0; i < 6; i++) u += Math.random(); return (u - 3) / Math.sqrt(0.5); }, good = [], vals = {};
  for (let a = -22; a <= 22; a++) for (let s = 2.5; s <= 8.5; s += 0.1) { const v = P.sim(Math.sin(a * Math.PI / 180), -Math.cos(a * Math.PI / 180), s, 0, 0); if (v) { good.push([a, s]); vals[v] = 1; } }
  for (const v of [10, 20, 30, 40, 50, 100]) if (!vals[v]) throw new Error('no flick reaches the ' + v + ' hole');
  let h = 0; const n = 400; for (let i = 0; i < n; i++) { const q = good[Math.floor(Math.random() * good.length)], a = (q[0] + rnd() * 6) * Math.PI / 180, s = q[1] * (1 + rnd() * 0.12); if (P.sim(Math.sin(a), -Math.cos(a), s, 0, 0)) h++; }
  if (h / n < 0.4) throw new Error('only ' + Math.round(100 * h / n) + '% sink with a 6 degree, 12% wobble'); P.endSk(0); P.step(0.2, 0.033); await wait(50); $('gBtn1').click(); await wait(50); sv.rl = 0;
  return Math.round(100 * h / n) + '% sink with a 6 degree, 12% wobble';
});

await T('bonus game: the last ball gets a chase camera with slow-mo at the hole', async () => {
  const sv = P.sv(); sv.rl = 0; P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('no minigame'); await wait(200);
  let f = null; for (let a = -10; a <= 10 && !f; a++) for (let s = 2.5; s <= 8.5 && !f; s += 0.1) if (P.sim(Math.sin(a * Math.PI / 180), -Math.cos(a * Math.PI / 180), s, 0, 0) === 40) f = [a, s];
  if (!f) throw new Error('no flick sinks the 40'); const K = P.K;
  /* a ball with others still to throw is not chased */
  K.balls = 2; P.roll(Math.sin(f[0] * Math.PI / 180), -Math.cos(f[0] * Math.PI / 180), f[1]); P.step(0.3, 0.016); if (K.cam.z > 1.01) throw new Error('camera moved with balls left: ' + K.cam.z);
  K.cool = 0; K.balls = 1; P.roll(Math.sin(f[0] * Math.PI / 180), -Math.cos(f[0] * Math.PI / 180), f[1]); let zMax = 1, tsMin = 1;
  for (let i = 0; i < 160; i++) { P.step(0.016, 0.016); zMax = Math.max(zMax, K.cam.z); tsMin = Math.min(tsMin, K.ts); if (!K.bl.length) break; }
  if (zMax < 1.3) throw new Error('chase cam never zoomed in: ' + zMax.toFixed(2)); if (tsMin > 0.5) throw new Error('no slow-mo at the hole: ' + tsMin.toFixed(2));
  P.step(3, 0.033, 6); if (K.cam.z > 1.05 || K.ts < 0.95) throw new Error('view did not ease back: z ' + K.cam.z.toFixed(2) + ' ts ' + K.ts.toFixed(2));
  P.endSk(0); P.step(0.2, 0.033); await wait(50); if (cardUp()) $('gBtn1').click(); await wait(50); sv.rl = 0;
  return 'zoom up to ' + zMax.toFixed(2) + 'x, slow to ' + tsMin.toFixed(2);
});

await T('bonus game: the ball rolls at real-feeling speed', async () => {
  const sv = P.sv(); sv.rl = 0; P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('no minigame'); await wait(200); const K = P.K; K.balls = 3;
  P.roll(0, -1, 6); const b = K.ball; let t = 0; while (b.st === 'lane' && t < 3) { P.step(0.01, 0.01); t += 0.01; } const tl = t;
  if (tl > 0.7) throw new Error('lane took ' + tl.toFixed(2) + ' s; the ball is rolling in molasses'); if (tl < 0.12) throw new Error('lane took only ' + tl.toFixed(2) + ' s');
  P.endSk(0); P.step(0.2, 0.033); await wait(50); if (cardUp()) $('gBtn1').click(); await wait(50); sv.rl = 0; return 'lane in ' + tl.toFixed(2) + ' s at a strong flick';
});

await T('bonus game: balls roll off ring walls instead of hanging, and rims rattle', async () => {
  const sv = P.sv(); sv.rl = 0; P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('no minigame'); await wait(200); const K = P.K; K.balls = 99;
  let worst = 0, lip = 0, lipOut = 0, n = 0;
  for (let k = 0; k < 32 && (k < 14 || lip < 2 || lipOut < 1); k++) {
    K.cool = 0; K.bl.length = 0; const a = (Math.random() * 30 - 15) * Math.PI / 180, s = 3 + Math.random() * 5; P.roll(Math.sin(a), -Math.cos(a), s); const b = K.bl[0]; let t = 0, slow = 0, w = 0, touched = false;
    while (K.bl.includes(b) && t < 6) { P.step(0.04, 0.04); t += 0.068; if (b.lh) touched = true; if (b.st === 'play' && Math.hypot(b.vu, b.vv) < 0.12 && b.z < 0.1) { slow += 0.068; w = Math.max(w, slow); } else slow = 0; }
    worst = Math.max(worst, w); n++; if (touched) { lip++; if (!b.hole) lipOut++; }
  }
  if (worst > 0.5) throw new Error('a ball hung on something for ' + worst.toFixed(2) + ' s');
  if (lip < 2) throw new Error('rims were almost never touched: ' + lip); if (lipOut < 1) throw new Error('no ball ever lipped out');
  P.endSk(0); P.step(0.2, 0.033); await wait(50); if (cardUp()) $('gBtn1').click(); await wait(50); sv.rl = 0;
  return 'longest hang ' + worst.toFixed(2) + ' s; rim touches ' + lip + '/' + n + ', lip-outs ' + lipOut;
});

await T('grand finale fireworks delay the card', async () => {
  P.sv().rl = 0; P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('no minigame'); const had = !!(P.sv().ac2 & (1 << 10));
  P.endSk(100); P.step(0.3, 0.033); if (cardUp()) throw new Error('card came before the fireworks'); P.step(4, 0.033, 12);
  if (!cardUp()) throw new Error('card never came'); if (!had && !/Grand Finale/.test(card().body)) throw new Error('trophy text missing'); $('gBtn2').click(); await wait(100);
});

await T('run end card: save, reset, confirm', async () => {
  await go(5, 0); const sv = P.sv(); sv.bank = 500; sv.gu = 2; sv.ra = 1; sv.ach = sv.ach | 5; const ach0 = sv.ach, run0 = sv.run;
  P.win(); await wait(50); let c = card(); if (c.t !== 'You did it!' || c.b1 !== 'Save and restart' || c.b2 !== 'Save and go to title' || c.b3 !== 'Reset completely') throw new Error(JSON.stringify(c));
  if (sv.run !== run0 + 1) throw new Error('run did not count: ' + sv.run);
  $('gBtn3').click(); await wait(30); c = card(); if (c.t !== 'Reset everything?' || c.b1 !== 'Keep my stuff') throw new Error('no confirm: ' + JSON.stringify(c));
  $('gBtn1').click(); await wait(30); c = card(); if (c.t !== 'You did it!') throw new Error('keep did not return: ' + c.t); if (sv.bank < 500) throw new Error('keep lost credits');
  $('gBtn1').click(); if (!await wf(() => !cardUp() && P.S.stage === 1, 3000)) throw new Error('save and restart did not start stage 1'); if (sv.bank < 500 || sv.gu !== 2) throw new Error('save and restart lost upgrades');
  /* save and go to title: the card closes, the title shows, the progress is kept and Continue is ready */
  await go(5, 0); sv.bank = 321; P.win(); await wait(50); $('gBtn2').click(); await wait(50);
  if (cardUp() || document.getElementById('title').hidden || !document.getElementById('game').hidden) throw new Error('did not return to the title screen'); if (sv.bank !== 321) throw new Error('save lost credits');
  if (JSON.parse(localStorage.getItem('pd-save')).bank !== 321) throw new Error('the credits were not written to the saved game');
  document.getElementById('title').hidden = true; document.getElementById('game').hidden = false;
  await go(5, 0); P.win(); await wait(50); $('gBtn3').click(); await wait(30); $('gBtn2').click();
  if (!await wf(() => !cardUp() && P.S.stage === 1, 3000)) throw new Error('reset did not start stage 1');
  if (sv.bank !== 0 || sv.gu || sv.ra || sv.um || sv.au || sv.ar || sv.ap || sv.run) throw new Error('reset left data: ' + JSON.stringify(sv)); if ((sv.ach & ach0 & 5) !== 5 && (ach0 & 5) === 5 && (sv.ach & 5) !== 5) throw new Error('trophies lost');
});

await T('pause keys', async () => {
  await go(1, 2); const S = P.S; P.key('p'); if (!S.paused || !cardUp()) throw new Error('p did not pause'); P.key('p'); if (S.paused || cardUp()) throw new Error('p did not resume');
  P.key('Escape'); if (!S.paused) throw new Error('escape did not pause'); P.resume();
});

await T('fuzz ' + FUZZ + 's per stage, random actions', async () => {
  const sv = P.sv(); sv.gu = 3; sv.um = 3; sv.ra = 2; sv.au = 1; sv.ar = 3; sv.ap = 2; sv.lm = 3; sv.bank = 5000; let clicks = 0, stages = new Set();
  for (const st of [1, 2, 3, 4, 5]) {
    await go(st, 0); P.st('um', 3); P.bot = true; const W = window.innerWidth, H = window.innerHeight;
    for (let i = 0, n = Math.round(FUZZ / 1.5); i < n; i++) {
      if (cardUp()) { clicks++; $(/Skip|stage 5/.test($('gBtn2').textContent) ? 'gBtn2' : 'gBtn1').click(); await wait(40); if (P.K) { P.endSk(0); P.step(0.2, 0.033); } continue; }
      stages.add(P.S.stage); P.step(1.5, 0.033, 25); const r = Math.random();
      if (r < 0.14) P.raid(); else if (r < 0.28) P.give(['pz', 'pm', 'ph', 'pf'][i % 4]); else if (r < 0.38) P.collect(); else if (r < 0.5) P.gull();
      else if (r < 0.62) P.cmb(2 + Math.floor(Math.random() * 9), 1 + Math.floor(Math.random() * 3)); else if (r < 0.7) { P.key('p'); P.key('p'); }
      else if (r < 0.82) P.tap(W * Math.random(), H * (0.45 + 0.4 * Math.random())); else if (r < 0.9) P.award(Math.floor(Math.random() * 21)); else P.zone(Math.floor(Math.random() * 2));
      inv('fuzz stage ' + P.S.stage + ' step ' + i);
    }
    P.bot = false;
    /* every Champion fight with every upgrade on, poked with specials, pauses and wild flicks */
    await go(st, 8); P.st('um', 3); P.st('ra', 2); P.bot = Math.random() < 0.5;
    for (let i = 0, n = Math.round(FUZZ / 3); i < n && P.S.stage === st; i++) {
      if (cardUp()) { clicks++; $('gBtn1').click(); await wait(40); break; }
      P.step(1.2, 0.033, 25); const r = Math.random();
      if (r < 0.2) P.raid(); else if (r < 0.35) P.give(['pz', 'pm', 'ph', 'pf'][i % 4]); else if (r < 0.45) P.collect(); else if (r < 0.55) { P.key('p'); P.key('p'); }
      else if (r < 0.8) P.flick((Math.random() - 0.5) * 2, -1, 0.5 + Math.random() * 6); else P.tap(W * Math.random(), H * (0.2 + 0.5 * Math.random()));
      inv('champion fuzz ' + st + ' step ' + i);
      if (P.S.mode === 'bossWin') break;
    }
    P.bot = false;
  }
  return 'card clicks ' + clicks + ', stages seen ' + [...stages].join(',');
});

return { r: R, errs: ERR.slice(0, 20) };
