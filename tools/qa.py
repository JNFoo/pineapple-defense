#!/usr/bin/env python3 -I
"""One-command QA for Pineapple Defense. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).

  python3 -I tools/qa.py            build, syntax check, then the in-page suite in Chromium (about 10 s)
  python3 -I tools/qa.py --ff       also run it in Firefox (the stress test)
  python3 -I tools/qa.py --wk       also run it in WebKitGTK (the nearest WebKit a Linux cloud machine can run)
  python3 -I tools/qa.py --lab      test the tester (lab) build instead
  python3 -I tools/qa.py --min      test the minified page (the one that gets packed)
  python3 -I tools/qa.py --fuzz 300 longer random-action fuzzing (game seconds per stage, default 60)
  python3 -I tools/qa.py --force    ignore the "nothing changed since the last pass" cache
  python3 -I tools/qa.py --shots DIR  save a few screenshots into DIR
  python3 -I tools/qa.py --quick [SEED]  quick tier while you iterate: all fast checks plus a seeded quarter of the slow ones
                                    (SEED defaults to the day number, so four days in a row cover every slow check) and 5 s of fuzzing.
                                    Never cached and never a release gate: the full run stays mandatory before a release.
  python3 -I tools/qa.py --only REGEX  run only the checks whose name matches REGEX (fast loop while writing a check; not cached)
  python3 -I tools/qa.py --smart    pick the cheapest run for what changed since the last passing run: notes only = no browser, nothing = 2 s smoke, code = quick tier
  python3 -I tools/qa.py --calm     run the suite with the system's reduced-motion setting on (calm mode starts by itself)

Test browsers: only the ones on the "browsers" branch of JNFoo/knowledgebase-single-file (Firefox, ungoogled Chromium,
WebKitGTK), one at a time, each with its version printed and recorded in .qa-browsers.json (tools/release.py puts them in the
changelog). Point the harness at them with PD_CHROME, PD_FF, PD_GECKO; WebKitGTK needs WebKitWebDriver, xvfb-run and dbus-run-session
(kb-browsers/install.sh as root). Read that branch's README before each run: versions and browsers can change.

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
LEGS = ['chromium'] + (['firefox'] if flag('--ff') else []) + (['webkit'] if flag('--wk') else [])
# --smart: choose the cheapest run that still covers what changed since the last passing run (file fingerprints kept in .qa-smart.json)
SMART_ONLY = ''
def _fingerprints():
    import hashlib
    r = subprocess.run(['git', 'ls-files', '-c', '-o', '--exclude-standard'], cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))), capture_output=True, text=True)
    out = {}
    for f in r.stdout.split('\n'):
        full = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), f)
        if f and f != 'index.html' and os.path.isfile(full): out[f] = hashlib.sha1(open(full, 'rb').read()).hexdigest()
    return out
_docs_only = lambda f: f.endswith('.md') or f.startswith('docs/') or f in ('LICENSE', '.gitignore')
_smart_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.qa-smart.json')
if flag('--smart') and not QUICK:
    _now = _fingerprints(); _old = json.load(open(_smart_path)) if os.path.exists(_smart_path) else None
    if not _old or not set(LEGS) <= set(_old['legs']): QUICK = True; print('smart: no earlier passing run covers these browsers, so the quick tier')
    else:
        _chg = sorted(f for f in set(_now) | set(_old['files']) if _now.get(f) != _old['files'].get(f))
        if not _chg: SMART_ONLY = '^(load|stage 1 runs)$'; print('smart: nothing changed since the last passing run, so only the 2 second smoke check')
        elif all(_docs_only(f) for f in _chg): print('smart: only notes changed (%s), so no browser run is needed' % ', '.join(_chg[:4])); sys.exit(0)
        else: QUICK = True; print('smart: %d file(s) changed (%s), so the quick tier' % (len(_chg), ', '.join(_chg[:4])))
_qi = args.index('--quick') + 1 if '--quick' in args else len(args)
SEED = int(args[_qi]) if QUICK and _qi < len(args) and args[_qi].isdigit() else int(time.time() // 86400)
FUZZ = int(opt('--fuzz', 5 if QUICK else 60)); SHOTS = opt('--shots', ''); ONLY = opt('--only', SMART_ONLY)   # --only REGEX runs just the checks whose names match (never cached)
t0 = time.time(); stamp = lambda: '%5.1fs' % (time.time() - t0)
TIMES = os.environ.get('QA_TIMES') == '1'; _ph = [time.time()]; PHASES = []   # QA_TIMES=1 prints where each leg's time goes (checks, layout, old saves, launches) and the slowest checks
def phase(label):
    now = time.time(); PHASES.append((label, now - _ph[0])); _ph[0] = now

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
CHROME = os.environ.get('PD_CHROME', '')
if not CHROME or not os.path.exists(CHROME):
    print('PD_CHROME must point at the ungoogled Chromium from the browsers branch (see docs/qa-process.md); stock Chromium is not a test browser'); sys.exit(2)
USED = []   # (key, full label) of every browser this run really used
suite = open(os.path.join(ROOT, 'tools/qa_suite.js'), encoding='utf-8').read()
layout = open(os.path.join(ROOT, 'tools/qa_layout.js'), encoding='utf-8').read()
PROBE = open(os.path.join(ROOT, 'tools/canvas-probe.js'), encoding='utf-8').read()
key = hashlib.sha1((src + suite + layout + PROBE + str(FUZZ) + str(flag('--ff')) + str(flag('--wk')) + str(CALM) + os.environ.get('PD_CHROME', '')).encode()).hexdigest()
cache = os.path.join(ROOT, '.qa-cache'); mode = ('lab' if lab else 'main') + ('-min' if mini else '') + ('-calm' if CALM else '')
store = json.load(open(cache)) if os.path.exists(cache) else {}
if store.get(mode) == key and not flag('--force') and not QUICK and not ONLY:
    print('[%s] unchanged since the last passing run: skipped (use --force to rerun)' % stamp()); sys.exit(0)

VIEWPORTS = [(360, 640), (412, 915), (1280, 720), (820, 1180), (892, 412), (640, 360)]   # the last two are a phone held sideways
fails = []

def report(label, res, lay):
    if TIMES: PHASES.append(('%s: slowest checks' % label, sorted(((r['ms'] / 1000.0, r['n'][:50]) for r in res['r']), reverse=True)[:5]))
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
    twin = "() => { const c = document.getElementById('cw'); return !!c && !c.hidden && document.getElementById('cardTitle').textContent === 'Open in another tab'; }"
    booted = '() => !!document.getElementById("cardTitle") && document.readyState === "complete"'
    a = ctx.new_page(); a.goto(u0); a.wait_for_function(booted); a.wait_for_timeout(300); b = ctx.new_page(); b.goto(u0); b.wait_for_function(booted)
    try: b.wait_for_function(twin, timeout=5000)   # the second tab shows the twin card (wait for it instead of sleeping 1.5 s)
    except Exception: pass
    if b.evaluate(title) != 'Open in another tab': bad.append('the second tab did not show the twin card (it shows %r)' % b.evaluate(title))
    if a.evaluate(title) == 'Open in another tab': bad.append('the first tab was called a twin')
    if not bad:
        b.evaluate("document.getElementById('twUse').click()")
        try: a.wait_for_function(twin, timeout=5000)   # and the first tab becomes the twin
        except Exception: pass
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
    br = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    _cv = br.version; _cn = 'ungoogled Chromium' if 'ungoogled' in CHROME.lower() else 'Chromium'
    USED.append(('%s %s' % (_cn, _cv.split('.')[0]), '%s %s' % (_cn, _cv)))
    phase('chromium: launch')
    pg = br.new_page(viewport={'width': 500, 'height': 827}, **({'reduced_motion': 'reduce'} if CALM else {})); perr = []
    pg.on('pageerror', lambda e: perr.append(str(e))); pg.on('console', lambda m: perr.append(m.text) if m.type == 'error' else None)
    pg.goto(url); pg.wait_for_function('window.__pd')
    pg.evaluate('window.__qaFuzz=%d;window.__qaQuick=%d;window.__qaOnly=%s' % (FUZZ, SEED if QUICK else 0, json.dumps(ONLY))); pg.evaluate(PROBE)
    phase('chromium: page load')
    res = pg.evaluate('(async()=>{' + suite + '})()')
    phase('chromium: suite')
    if SHOTS:
        os.makedirs(SHOTS, exist_ok=True); pg.screenshot(path=os.path.join(SHOTS, 'suite-end.png'))
    # the six sizes are independent pages (each its own context, so the twin-tab guard never sees a second copy): start all six layout
    # scripts, then collect them, so their fixed waits overlap (about 1.5 s per size when run one after the other)
    lay = []; lps = []
    for vw, vh in ([] if ONLY else VIEWPORTS):   # --only (and smart's smoke) skip the layout sizes: they are a separate pass
        q = br.new_context(viewport={'width': vw, 'height': vh}).new_page(); q.on('pageerror', lambda e: perr.append(str(e)))
        q.goto(url); q.wait_for_function('window.__pd'); lps.append((vw, vh, q))
    for vw, vh, q in lps: q.evaluate('window.__lay=(async()=>{' + layout + '})();0')
    for vw, vh, q in lps:
        out = q.evaluate('window.__lay'); lay.append((out['vw'], out['vh'], out['bad']))
        if SHOTS: q.screenshot(path=os.path.join(SHOTS, 'layout-%dx%d.png' % (vw, vh)))
        q.context.close()
    phase('chromium: layout, 6 sizes')
    old = oldsaves(br) if not QUICK and not ONLY else []
    phase('chromium: old saves')
    extra = []
    if not QUICK and not ONLY:
        extra.append(('two real tabs', twintabs(br)))
        run([sys.executable, '-I', 'build.py', '--lab'])
        lp = br.new_page(viewport={'width': 500, 'height': 827}); lp.goto('file://' + os.path.join(ROOT, 'dist/lab/index.html') + '#qa'); lp.wait_for_function('window.__pd')
        extra.append(('tester color view', labview(lambda: lp.screenshot(), lp.evaluate, 'chromium'))); lp.close()
    br.close()
    phase('chromium: two tabs, color view, close')
print('[%s] Chromium%s' % (stamp(), ' (reduced motion on)' if CALM else '')); report('chromium', res, lay)
for nm, bad in extra:
    print('  %-4s %s %s' % ('ok' if not bad else 'FAIL', nm, '; '.join(bad)))
    for x in bad: fails.append('%s: %s' % (nm, x))
for fx, bad in old:
    print('  %-4s old save %s %s' % ('ok' if not bad else 'FAIL', fx, '; '.join(bad)))
    for x in bad: fails.append('old save %s: %s' % (fx, x))
for e in perr: fails.append('chromium console: ' + e)

# 5. Firefox and WebKitGTK (optional): the same suite through WebDriver, one browser after the other
def ready(d):   # wait until the page has made its test hook (instead of sleeping 0.4 s and hoping)
    t = time.time()
    while time.time() - t < 20:
        if d.execute_script('return !!window.__pd'): return
        time.sleep(0.03)

def sel_leg(d, name, slow=1):   # slow: patience factor for stage starts and the script timeout; WebKitGTK is slower to start stages here (its first frames take up to a second)
    d.set_script_timeout(120 * slow); phase(name + ': start')
    try: d.set_window_size(500, 900)
    except Exception: pass
    d.get(url); ready(d)
    phase(name + ': page load')
    d.execute_script('window.__qaSlow=%d;window.__qaFuzz=%d;window.__qaQuick=%d;window.__qaOnly=%s' % (slow, min(FUZZ, 60), SEED if QUICK else 0, json.dumps(ONLY))); d.execute_script(PROBE)
    res = d.execute_async_script('var cb=arguments[arguments.length-1];(async()=>{' + suite + '})().then(cb,e=>cb({r:[{n:"suite crashed",ok:false,ms:0,d:String(e)}],errs:[]}))')
    phase(name + ': suite')
    lay = []
    if not ONLY:
        try: d.set_window_size(412, 915)
        except Exception: pass
        d.get(url); ready(d)
        out = d.execute_async_script('var cb=arguments[arguments.length-1];(async()=>{' + layout + '})().then(cb,e=>cb({vw:0,vh:0,bad:[String(e)]}))'); lay.append((out['vw'], out['vh'], out['bad']))
    phase(name + ': layout')
    print('[%s] %s' % (stamp(), name)); report(name.split()[0].lower(), res, lay)

if flag('--ff'):
    from selenium import webdriver
    from selenium.webdriver.firefox.service import Service
    from selenium.webdriver.firefox.options import Options
    _ff, _gk = os.environ.get('PD_FF', ''), os.environ.get('PD_GECKO', '')
    if not (os.path.exists(_ff) and os.path.exists(_gk)): print('PD_FF and PD_GECKO must point at Firefox from the browsers branch and a geckodriver (see docs/qa-process.md)'); sys.exit(2)
    o = Options(); o.add_argument('-headless'); o.set_preference('ui.prefersReducedMotion', 1) if CALM else None; o.binary_location = _ff
    d = webdriver.Firefox(service=Service(_gk), options=o)
    try:
        _fv = d.capabilities.get('browserVersion', 'unknown'); USED.append(('Firefox %s' % _fv.split('.')[0], 'Firefox %s' % _fv))
        sel_leg(d, 'Firefox %s' % _fv)
        if not QUICK and not ONLY:
            d.set_window_size(500, 900); d.get('file://' + os.path.join(ROOT, 'dist/lab/index.html') + '#qa'); time.sleep(0.6)
            bad = labview(d.get_screenshot_as_png, d.execute_script, 'firefox'); print('  %-4s tester color view (Firefox) %s' % ('ok' if not bad else 'FAIL', '; '.join(bad)))
            for x in bad: fails.append('tester color view: ' + x)
    finally:
        d.quit()

if flag('--wk'):
    import signal
    from selenium import webdriver
    from selenium.webdriver.common.options import ArgOptions
    if not all(shutil.which(x) for x in ('WebKitWebDriver', 'xvfb-run', 'dbus-run-session')): print('WebKitWebDriver, xvfb-run or dbus-run-session is missing (run kb-browsers/install.sh as root)'); sys.exit(2)
    port = 4600 + os.getpid() % 300
    drv = subprocess.Popen(['xvfb-run', '-a', '-s', '-screen 0 1280x1024x24', 'dbus-run-session', '--', 'WebKitWebDriver', '--port=%d' % port],
                           env=dict(os.environ, GTK_A11Y='none', WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS='1'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    d = None
    try:
        for _ in range(40):
            try: d = webdriver.Remote(command_executor='http://127.0.0.1:%d' % port, options=ArgOptions()); break
            except Exception: time.sleep(0.5)
        if d is None: fails.append('webkitgtk: could not start a WebDriver session'); raise SystemExit
        _wv = d.capabilities.get('browserVersion', 'unknown'); USED.append(('WebKitGTK %s' % _wv, 'WebKitGTK %s (%s)' % (_wv, d.capabilities.get('browserName', 'MiniBrowser'))))
        sel_leg(d, 'WebKitGTK %s' % _wv, slow=6)
    except SystemExit: pass
    finally:
        try: d and d.quit()
        except Exception: pass
        try: os.killpg(drv.pid, signal.SIGTERM)
        except Exception: pass

if TIMES:
    for nm, v in PHASES:
        if isinstance(v, list): print('  times  %s: %s' % (nm, '; '.join('%.1f s %s' % x for x in v)))
        else: print('  times  %-44s %5.1f s' % (nm, v))
if fails:
    print('\nFAILED (%d):' % len(fails)); [print(' - ' + f) for f in fails]; sys.exit(1)
if not QUICK and not ONLY: store[mode] = key; json.dump(store, open(cache, 'w'))
if QUICK: print('(quick tier, seed %d: not cached, not a release gate)' % SEED)
if not ONLY and not SMART_ONLY: json.dump({'files': _fingerprints(), 'legs': LEGS}, open(_smart_path, 'w'))   # baseline for --smart: what was green, in which browsers
if not QUICK and not ONLY:   # what a release records: which browsers really ran this page (tools/release.py reads this file)
    rec = json.load(open(os.path.join(ROOT, '.qa-browsers.json'))) if os.path.exists(os.path.join(ROOT, '.qa-browsers.json')) else {}
    rec[mode] = [{'key': k, 'label': l} for k, l in USED]; json.dump(rec, open(os.path.join(ROOT, '.qa-browsers.json'), 'w'), indent=1)
print('tested in: ' + ', '.join(l for _, l in USED))
print('\nall checks passed in %s' % stamp())
