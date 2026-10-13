#!/usr/bin/env python3 -I
"""One-command QA for Pineapple Defense. Copyright (c) 2026 JNFoo. All rights reserved.

  python3 -I tools/qa.py            build, syntax check, then the in-page suite in Chromium (about 10 s)
  python3 -I tools/qa.py --ff       also run it in Firefox (the stress test)
  python3 -I tools/qa.py --lab      test the tester (lab) build instead
  python3 -I tools/qa.py --min      test the minified page (the one that gets packed)
  python3 -I tools/qa.py --fuzz 300 longer random-action fuzzing (game seconds per stage, default 60)
  python3 -I tools/qa.py --force    ignore the "nothing changed since the last pass" cache
  python3 -I tools/qa.py --shots DIR  save a few screenshots into DIR

Why it is cheap: the suite fast-forwards game time inside the page (no waiting on frames, no per-frame screenshots),
runs everything in ONE browser session, skips work when index.html and the suite are byte-identical to the last pass,
and fails fast on a JavaScript syntax error before any browser starts.
"""
import hashlib, json, os, shutil, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
flag = lambda f: f in args
opt = lambda f, d: args[args.index(f) + 1] if f in args and args.index(f) + 1 < len(args) else d
FUZZ = int(opt('--fuzz', 60)); SHOTS = opt('--shots', '')
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

# 3. skip when nothing changed since the last pass
suite = open(os.path.join(ROOT, 'tools/qa_suite.js'), encoding='utf-8').read()
layout = open(os.path.join(ROOT, 'tools/qa_layout.js'), encoding='utf-8').read()
key = hashlib.sha1((src + suite + layout + str(FUZZ) + str(flag('--ff'))).encode()).hexdigest()
cache = os.path.join(ROOT, '.qa-cache'); mode = ('lab' if lab else 'main') + ('-min' if mini else '')
store = json.load(open(cache)) if os.path.exists(cache) else {}
if store.get(mode) == key and not flag('--force'):
    print('[%s] unchanged since the last passing run: skipped (use --force to rerun)' % stamp()); sys.exit(0)

VIEWPORTS = [(360, 640), (412, 915), (1280, 720), (820, 1180)]
fails = []

def report(label, res, lay):
    for r in res['r']:
        print('  %-4s %-46s %5d ms  %s' % ('ok' if r['ok'] else 'FAIL', r['n'], r['ms'], r['d'] if (not r['ok'] or r['d']) else ''))
        if not r['ok']: fails.append(label + ': ' + r['n'] + ': ' + r['d'])
    for e in res['errs']: fails.append(label + ' page error: ' + e)
    for vw, vh, bad in lay:
        print('  %-4s layout %dx%d %s' % ('ok' if not bad else 'FAIL', vw, vh, '; '.join(bad)))
        for x in bad: fails.append('%s layout %dx%d: %s' % (label, vw, vh, x))

# 4. Chromium: one browser, one page for the suite, one fresh page per viewport for layout
from playwright.sync_api import sync_playwright
url = 'file://' + page + '#qa'
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg = br.new_page(viewport={'width': 500, 'height': 827}); perr = []
    pg.on('pageerror', lambda e: perr.append(str(e))); pg.on('console', lambda m: perr.append(m.text) if m.type == 'error' else None)
    pg.goto(url); pg.wait_for_function('window.__pd')
    pg.evaluate('window.__qaFuzz=%d' % FUZZ)
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
    br.close()
print('[%s] Chromium' % stamp()); report('chromium', res, lay)
for e in perr: fails.append('chromium console: ' + e)

# 5. Firefox (optional): the same suite, the performance and compatibility stress test
if flag('--ff'):
    from selenium import webdriver
    from selenium.webdriver.firefox.service import Service
    from selenium.webdriver.firefox.options import Options
    o = Options(); o.add_argument('-headless'); o.binary_location = os.environ.get('PD_FF', '/opt/ff158dl/firefox/firefox')
    d = webdriver.Firefox(service=Service(os.environ.get('PD_GECKO', '/opt/ff158dl/geckodriver')), options=o)
    try:
        d.set_script_timeout(120); d.set_window_size(500, 900); d.get(url); time.sleep(0.4)
        d.execute_script('window.__qaFuzz=%d' % min(FUZZ, 60))
        res = d.execute_async_script('var cb=arguments[arguments.length-1];(async()=>{' + suite + '})().then(cb,e=>cb({r:[{n:"suite crashed",ok:false,ms:0,d:String(e)}],errs:[]}))')
        lay = []
        d.set_window_size(412, 915); d.get(url); time.sleep(0.4)
        out = d.execute_async_script('var cb=arguments[arguments.length-1];(async()=>{' + layout + '})().then(cb,e=>cb({vw:0,vh:0,bad:[String(e)]}))'); lay.append((out['vw'], out['vh'], out['bad']))
        print('[%s] Firefox' % stamp()); report('firefox', res, lay)
    finally:
        d.quit()

if fails:
    print('\nFAILED (%d):' % len(fails)); [print(' - ' + f) for f in fails]; sys.exit(1)
store[mode] = key; json.dump(store, open(cache, 'w'))
print('\nall checks passed in %s' % stamp())
