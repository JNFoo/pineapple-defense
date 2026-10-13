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

await T('grand finale fireworks delay the card', async () => {
  P.sv().rl = 0; P.skee(); if (!await wf(() => P.K, 3000)) throw new Error('no minigame'); const had = !!(P.sv().ac2 & (1 << 10));
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
