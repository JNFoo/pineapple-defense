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
const card = () => ({ t: $('gTitle').textContent, b1: $('gBtn1').textContent, b2: $('gBtn2').textContent, body: $('gBody').textContent });
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

await T('load', async () => { if (!P) throw new Error('no __pd'); const sv = P.sv(); ['stage', 'wave', 'bank', 'ach', 'ac2', 'gu', 'um', 'ra', 'run', 'cd', 'lm', 'lh', 'aim', 'arc', 'hc', 'lt', 'thr'].forEach(k => { if (!isFinite(sv[k])) throw new Error('save field ' + k + ' = ' + sv[k]); }); });

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

await T('lime launcher: shield first, then Champion', async () => {
  const sv = P.sv(); sv.lm = 0; await go(2, 8);
  const S = P.S; let sawM = 0, t = 0; while (S.mode !== 'boss' || !S.boss || S.boss.st !== 'hold') { P.step(0.1, 0.05); if ((t += 0.1) > 30) throw new Error('boss never held'); }
  P.step(9, 0.05); sawM = S.ms.length; if (sawM || S.boss.hp !== S.bossMax) throw new Error('missiles fired without the launcher');
  sv.lm = 3; S.boss.shield = S.boss.shield || 3; let popped = 0, hurt = 0, maxM = 0, hp = S.boss.hp, sh = S.boss.shield, first = '';
  for (let i = 0; i < 1600 && S.boss && S.mode === 'boss'; i++) {
    P.step(0.05, 0.05); maxM = Math.max(maxM, S.ms.length); if (!S.boss) break;
    if (S.boss.shield < sh && !first) first = 'pop'; if (S.boss.hp < hp && !first) first = 'hurt'; if (S.boss.hp < hp) hurt++; if (S.boss.shield < sh) popped++;
    hp = S.boss.hp; sh = S.boss.shield; if (S.boss.st === 'hold' && S.boss.shield > S.boss.hp + 10) break;
  }
  if (first !== 'pop') throw new Error('first effect was ' + first); if (!hurt || !popped) throw new Error('popped ' + popped + ' hurt ' + hurt); if (maxM > 8) throw new Error('too many missiles ' + maxM);
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
  if (P.dm) throw new Error('demo never ended'); if (JSON.stringify(sv) !== before) throw new Error('save was not restored: ' + JSON.stringify(sv) + ' vs ' + before);
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
  await go(4, 0); P.win(); await wait(50); let c = card();
  if (c.t !== 'Stage 4 clear!' || !/Roll/.test(c.b1) || !/Skip/.test(c.b2)) throw new Error(JSON.stringify(c));
  $('gBtn1').click(); if (!await wf(() => P.K, 3000)) throw new Error('roll did not start');
  P.endSk(50); P.step(0.2, 0.033); if (!await wf(cardUp, 2000)) throw new Error('no end card'); c = card();
  if (!/Roll again/.test(c.b1) || !/stage 5/.test(c.b2)) throw new Error(JSON.stringify(c));
  $('gBtn2').click(); if (!await wf(() => !P.K && P.S.stage === 5, 3000)) throw new Error('did not reach stage 5');
  await go(4, 0); P.win(); await wait(50); $('gBtn2').click(); if (!await wf(() => P.S.stage === 5 && !P.K, 3000)) throw new Error('skip failed');
});

await T('grand finale fireworks delay the card', async () => {
  P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('no minigame'); const had = !!(P.sv().ac2 & (1 << 10));
  P.endSk(100); P.step(0.3, 0.033); if (cardUp()) throw new Error('card came before the fireworks'); P.step(4, 0.033, 12);
  if (!cardUp()) throw new Error('card never came'); if (!had && !/Grand Finale/.test(card().body)) throw new Error('trophy text missing'); $('gBtn2').click(); await wait(100);
});

await T('run end card: save, reset, confirm', async () => {
  await go(5, 0); const sv = P.sv(); sv.bank = 500; sv.gu = 2; sv.ra = 1; sv.ach = sv.ach | 5; const ach0 = sv.ach, run0 = sv.run;
  P.win(); await wait(50); let c = card(); if (c.t !== 'You did it!' || c.b1 !== 'Save and restart' || c.b2 !== 'Reset completely') throw new Error(JSON.stringify(c));
  if (sv.run !== run0 + 1) throw new Error('run did not count: ' + sv.run);
  $('gBtn2').click(); await wait(30); c = card(); if (c.t !== 'Reset everything?' || c.b1 !== 'Keep my stuff') throw new Error('no confirm: ' + JSON.stringify(c));
  $('gBtn1').click(); await wait(30); c = card(); if (c.t !== 'You did it!') throw new Error('keep did not return: ' + c.t); if (sv.bank < 500) throw new Error('keep lost credits');
  $('gBtn1').click(); if (!await wf(() => !cardUp() && P.S.stage === 1, 3000)) throw new Error('save and restart did not start stage 1'); if (sv.bank < 500 || sv.gu !== 2) throw new Error('save and restart lost upgrades');
  await go(5, 0); P.win(); await wait(50); $('gBtn2').click(); await wait(30); $('gBtn2').click();
  if (!await wf(() => !cardUp() && P.S.stage === 1, 3000)) throw new Error('reset did not start stage 1');
  if (sv.bank !== 0 || sv.gu || sv.ra || sv.um || sv.au || sv.ar || sv.ap || sv.run) throw new Error('reset left data: ' + JSON.stringify(sv)); if ((sv.ach & ach0 & 5) !== 5 && (ach0 & 5) === 5 && (sv.ach & 5) !== 5) throw new Error('trophies lost');
});

await T('pause keys', async () => {
  await go(1, 2); const S = P.S; P.key('p'); if (!S.paused || !cardUp()) throw new Error('p did not pause'); P.key('p'); if (S.paused || cardUp()) throw new Error('p did not resume');
  P.key('Escape'); if (!S.paused) throw new Error('escape did not pause'); P.resume();
});

await T('fuzz ' + FUZZ + 's per stage, random actions', async () => {
  const sv = P.sv(); sv.gu = 3; sv.um = 3; sv.ra = 2; sv.au = 1; sv.ar = 3; sv.ap = 2; sv.bank = 5000; let clicks = 0, stages = new Set();
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
  }
  return 'card clicks ' + clicks + ', stages seen ' + [...stages].join(',');
});

return { r: R, errs: ERR.slice(0, 20) };
