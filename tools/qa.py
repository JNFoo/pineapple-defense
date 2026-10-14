#!/usr/bin/env python3 -I
"""One-command QA for Pineapple Defense. Copyright (c) 2026 JNFoo. All rights reserved.

  python3 -I tools/qa.py            build, syntax check, then the in-page suite in Chromium (about 10 s)
  python3 -I tools/qa.py --ff       also run it in Firefox (the stress test)
  python3 -I tools/qa.py --lab      test the tester (lab) build instead
  python3 -I tools/qa.py --min      test the minified page (the one that gets packed)
  python3 -I tools/qa.py --fuzz 300 longer random-action fuzzing (game seconds per stage, default 60)
  python3 -I tools/qa.py --force    ignore the "nothing changed since the last pass" cache
  python3 -I tools/qa.py --shots DIR  save a few screenshots into DIR
  python3 -I tools/qa.py --quick [SEED]  quick tier while you iterate: all fast checks plus a seeded quarter of the slow ones
                                    (SEED defaults to the day number, so four days in a row cover every slow check) and 5 s of fuzzing.
                                    Never cached and never a release gate: the full run stays mandatory before a release.
  python3 -I tools/qa.py --only REGEX  run only the checks whose name matches REGEX (fast loop while writing a check; not cached)
  python3 -I tools/qa.py --calm     run the suite with the system's reduced-motion setting on (calm mode starts by itself)

Why it is cheap: the suite fast-forwards game time inside the page (no waiting on frames, no per-frame screenshots),
runs everything in ONE browser session, skips work when index.html and the suite are byte-identical to the last pass,
and fails fast on a JavaScript syntax error before any browser starts.
"""
import hashlib, json, os, shutil, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
flag = lambda f: f in args
opt = lambda f, d: args[args.index(f) + 1] if f in args and args.index(f) + 1 < len(args) else d
QUICK = flag('--quick'); CALM = flag('--calm')
_qi = args.index('--quick') + 1 if QUICK else 0
SEED = int(args[_qi]) if QUICK and _qi < len(args) and args[_qi].isdigit() else int(time.time() // 86400)
FUZZ = int(opt('--fuzz', 5 if QUICK else 60)); SHOTS = opt('--shots', ''); ONLY = opt('--only', '')   # --only REGEX runs just the checks whose names match (never cached)
t0 = time.time(); stamp = lambda: '%5.1fs' % (time.time() - t0)

def run(cmd):
    return subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)

# 1. build (about 0.4 s) and the page under test
lab = flag('--lab')
mini = flag('--min')
b = run([sys.executable, '-I', 'build.py'] + (['--lab'] if lab else []) + (['--min'] if mini else []))
if b.returncode: print(b.stdout, b.stderr); sys.exit(2)
page = os.path.join(ROOT, ('dist/lab-min' if lab else 'dist/min') + '/index.html' if mini else 'dist/lab/index.html' if lab else 'index.html')
if not os.path.exists(page): print('minified page missing (npm i --no-save esbuild)'); sys.exit(2)
src = open(page, encoding='utf-8').read()

# 2. syntax check of every inline script before any browser starts
node = shutil.which('node')
if node:
    import re
    for i, m in enumerate(re.finditer(r'<script(?![^>]*src)[^>]*>(.*?)</script>', src, re.S)):
        tmp = os.path.join(ROOT, '.qa-syntax.js'); open(tmp, 'w', encoding='utf-8').write(m.group(1))
        r = run([node, '--check', tmp]); os.remove(tmp)
        if r.returncode: print('SYNTAX ERROR in inline script %d:\n%s' % (i, r.stderr[:800])); sys.exit(3)
print('[%s] built and syntax ok (%d KB)' % (stamp(), len(src) // 1024))

# 2b. the shipped page makes no network requests and has no links out (the "For grown-ups" card says so, so a machine checks it)
if not lab:
    import re as _re
    net = _re.findall(r'\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|importScripts|<script[^>]+\ssrc=|<link[^>]+href=["\']?https?:|<a\s[^>]*href|window\.open\s*\(', src)
    if net: print('NETWORK OR LINK FOUND in the shipped page (the grown-ups card says there is none): %s' % sorted(set(net))); sys.exit(4)

# 3. skip when nothing changed since the last pass
suite = open(os.path.join(ROOT, 'tools/qa_suite.js'), encoding='utf-8').read()
layout = open(os.path.join(ROOT, 'tools/qa_layout.js'), encoding='utf-8').read()
PROBE = open(os.path.join(ROOT, 'tools/canvas-probe.js'), encoding='utf-8').read()
key = hashlib.sha1((src + suite + layout + PROBE + str(FUZZ) + str(flag('--ff')) + str(CALM)).encode()).hexdigest()
cache = os.path.join(ROOT, '.qa-cache'); mode = ('lab' if lab else 'main') + ('-min' if mini else '') + ('-calm' if CALM else '')
store = json.load(open(cache)) if os.path.exists(cache) else {}
if store.get(mode) == key and not flag('--force') and not QUICK and not ONLY:
    print('[%s] unchanged since the last passing run: skipped (use --force to rerun)' % stamp()); sys.exit(0)

VIEWPORTS = [(360, 640), (412, 915), (1280, 720), (820, 1180), (892, 412), (640, 360)]   # the last two are a phone held sideways
fails = []

def report(label, res, lay):
    for r in res['r']:
        print('  %-4s %-46s %5d ms  %s' % ('ok' if r['ok'] else 'FAIL', r['n'], r['ms'], r['d'] if (not r['ok'] or r['d']) else ''))
        if not r['ok']: fails.append(label + ': ' + r['n'] + ': ' + r['d'])
    for e in res['errs']: fails.append(label + ' page error: ' + e)
    for vw, vh, bad in lay:
        print('  %-4s layout %dx%d %s' % ('ok' if not bad else 'FAIL', vw, vh, '; '.join(bad)))
        for x in bad: fails.append('%s layout %dx%d: %s' % (label, vw, vh, x))

# 3b. frozen saves from older releases must still load, keep their values and start a game (Round 41)
OLDSAVE_JS = '''(async()=>{const raw=JSON.parse(window.__fixRaw),bad=[],sv=__pd.sv(),wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const k in raw){if(k==='seen')continue;if(sv[k]!==raw[k])bad.push(k+' is '+sv[k]+', saved as '+raw[k]);}
const D={sl:0,sg:0,sc:0,hs:0,sk:2,sa:0,cp:0};for(const k in D)if(sv[k]!==D[k]&&!(k in raw))bad.push('new field '+k+' started as '+sv[k]+', not '+D[k]);
const c=document.getElementById('bCont');if(!c||c.disabled)bad.push('Continue is not offered');
__pd.cont();await wait(150);if(__pd.S.stage!==raw.stage||__pd.S.wave!==raw.wave+1)bad.push('Continue started stage '+__pd.S.stage+' wave '+__pd.S.wave);
document.getElementById('bPause').click();await wait(50);
return bad;})()'''
def oldsaves(br):
    import glob
    out = []
    for fx in sorted(glob.glob(os.path.join(ROOT, 'tools/fixtures/save-*.json'))):
        d = json.load(open(fx)); q = br.new_page(viewport={'width': 500, 'height': 827}); errs = []
        q.on('pageerror', lambda e: errs.append(str(e)))
        q.add_init_script('localStorage.setItem(%s,%s);window.__fixRaw=%s' % (json.dumps(d['storageKey']), json.dumps(d['raw']), json.dumps(d['raw'])))
        q.goto(url); q.wait_for_function('window.__pd')
        bad = q.evaluate(OLDSAVE_JS) + ['page error: ' + e for e in errs]
        q.close(); out.append((os.path.basename(fx), bad))
    return out

# 3c. two real tabs, and the tester's color view (screenshots of the lab build, compared in numbers)
def twintabs(br):
    bad = []; u0 = 'file://' + page; ctx = br.new_context(viewport={'width': 500, 'height': 827}); title = "(()=>{const c=document.getElementById('cw');return c&&!c.hidden?document.getElementById('cardTitle').textContent:''})()"
    a = ctx.new_page(); a.goto(u0); a.wait_for_timeout(500); b = ctx.new_page(); b.goto(u0); b.wait_for_timeout(1500)
    if b.evaluate(title) != 'Open in another tab': bad.append('the second tab did not show the twin card (it shows %r)' % b.evaluate(title))
    if a.evaluate(title) == 'Open in another tab': bad.append('the first tab was called a twin')
    if not bad:
        b.evaluate("document.getElementById('twUse').click()"); a.wait_for_timeout(1500)
        if a.evaluate(title) != 'Open in another tab': bad.append('after Use this tab, the first tab did not become the twin (it shows %r)' % a.evaluate(title))
        if b.evaluate(title) == 'Open in another tab': bad.append('after taking over, the second tab is still a twin')
    ctx.close(); return bad
CBV = "(()=>{document.getElementById('bLab').click();})()"
def labview(shoot, run_js, name):
    import io
    from PIL import Image
    import numpy as np
    bad = []; run_js(CBV); time.sleep(0.3); imgs = []
    for i in range(5):
        if i: run_js("document.querySelector('[data-a=cb]').click()"); time.sleep(0.25)
        imgs.append(np.asarray(Image.open(io.BytesIO(shoot())).convert('RGB')).astype(float))
    base = imgs[0]
    for i, nm in ((1, 'Protan'), (2, 'Deutan'), (3, 'Tritan'), (4, 'Gray')):
        d = float(np.abs(imgs[i] - base).mean())
        if d < 1.0: bad.append('%s: the %s view looks the same as Normal (difference %.2f)' % (name, nm, d))
    sat = lambda im: float((np.abs(im[..., 0] - im[..., 1]) + np.abs(im[..., 1] - im[..., 2])).mean())
    if sat(imgs[4]) > 2.0: bad.append('%s: Gray view still has color (%.1f)' % (name, sat(imgs[4])))
    if sat(base) < 4.0: bad.append('%s: Normal view has almost no color (%.1f), so the test cannot tell' % (name, sat(base)))
    if float(np.abs(imgs[1] - imgs[2]).mean()) < 0.3: bad.append('%s: Protan and Deutan look identical' % name)
    return bad

# 4. Chromium: one browser, one page for the suite, one fresh page per viewport for layout
from playwright.sync_api import sync_playwright
url = 'file://' + page + '#qa'
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = br.new_page(viewport={'width': 500, 'height': 827}, **({'reduced_motion': 'reduce'} if CALM else {})); perr = []
    pg.on('pageerror', lambda e: perr.append(str(e))); pg.on('console', lambda m: perr.append(m.text) if m.type == 'error' else None)
    pg.goto(url); pg.wait_for_function('window.__pd')
    pg.evaluate('window.__qaFuzz=%d;window.__qaQuick=%d;window.__qaOnly=%s' % (FUZZ, SEED if QUICK else 0, json.dumps(ONLY))); pg.evaluate(PROBE)
    res = pg.evaluate('(async()=>{' + suite + '})()')
    if SHOTS:
        os.makedirs(SHOTS, exist_ok=True); pg.screenshot(path=os.path.join(SHOTS, 'suite-end.png'))
    lay = []
    for vw, vh in VIEWPORTS:
        q = br.new_page(viewport={'width': vw, 'height': vh}); q.on('pageerror', lambda e: perr.append(str(e)))
        q.goto(url); q.wait_for_function('window.__pd')
        out = q.evaluate('(async()=>{' + layout + '})()'); lay.append((out['vw'], out['vh'], out['bad']))
        if SHOTS: q.screenshot(path=os.path.join(SHOTS, 'layout-%dx%d.png' % (vw, vh)))
        q.close()
    old = oldsaves(br) if not QUICK and not ONLY else []
    extra = []
    if not QUICK and not ONLY:
        extra.append(('two real tabs', twintabs(br)))
        run([sys.executable, '-I', 'build.py', '--lab'])
        lp = br.new_page(viewport={'width': 500, 'height': 827}); lp.goto('file://' + os.path.join(ROOT, 'dist/lab/index.html') + '#qa'); lp.wait_for_function('window.__pd')
        extra.append(('tester color view', labview(lambda: lp.screenshot(), lp.evaluate, 'chromium'))); lp.close()
    br.close()
print('[%s] Chromium%s' % (stamp(), ' (reduced motion on)' if CALM else '')); report('chromium', res, lay)
for nm, bad in extra:
    print('  %-4s %s %s' % ('ok' if not bad else 'FAIL', nm, '; '.join(bad)))
    for x in bad: fails.append('%s: %s' % (nm, x))
for fx, bad in old:
    print('  %-4s old save %s %s' % ('ok' if not bad else 'FAIL', fx, '; '.join(bad)))
    for x in bad: fails.append('old save %s: %s' % (fx, x))
for e in perr: fails.append('chromium console: ' + e)

# 5. Firefox (optional): the same suite, the performance and compatibility stress test
if flag('--ff'):
    from selenium import webdriver
    from selenium.webdriver.firefox.service import Service
    from selenium.webdriver.firefox.options import Options
    o = Options(); o.add_argument('-headless'); o.set_preference('ui.prefersReducedMotion', 1) if CALM else None; o.binary_location = os.environ.get('PD_FF', '/opt/ff158dl/firefox/firefox')
    d = webdriver.Firefox(service=Service(os.environ.get('PD_GECKO', '/opt/ff158dl/geckodriver')), options=o)
    try:
        d.set_script_timeout(120); d.set_window_size(500, 900); d.get(url); time.sleep(0.4)
        d.execute_script('window.__qaFuzz=%d;window.__qaQuick=%d;window.__qaOnly=%s' % (min(FUZZ, 60), SEED if QUICK else 0, json.dumps(ONLY))); d.execute_script(PROBE)
        res = d.execute_async_script('var cb=arguments[arguments.length-1];(async()=>{' + suite + '})().then(cb,e=>cb({r:[{n:"suite crashed",ok:false,ms:0,d:String(e)}],errs:[]}))')
        lay = []
        d.set_window_size(412, 915); d.get(url); time.sleep(0.4)
        out = d.execute_async_script('var cb=arguments[arguments.length-1];(async()=>{' + layout + '})().then(cb,e=>cb({vw:0,vh:0,bad:[String(e)]}))'); lay.append((out['vw'], out['vh'], out['bad']))
        print('[%s] Firefox' % stamp()); report('firefox', res, lay)
        if not QUICK and not ONLY:
            d.set_window_size(500, 900); d.get('file://' + os.path.join(ROOT, 'dist/lab/index.html') + '#qa'); time.sleep(0.6)
            bad = labview(d.get_screenshot_as_png, d.execute_script, 'firefox'); print('  %-4s tester color view (Firefox) %s' % ('ok' if not bad else 'FAIL', '; '.join(bad)))
            for x in bad: fails.append('tester color view: ' + x)
    finally:
        d.quit()

if fails:
    print('\nFAILED (%d):' % len(fails)); [print(' - ' + f) for f in fails]; sys.exit(1)
if not QUICK and not ONLY: store[mode] = key; json.dump(store, open(cache, 'w'))
if QUICK: print('(quick tier, seed %d: not cached, not a release gate)' % SEED)
print('\nall checks passed in %s' % stamp())
