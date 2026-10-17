#!/usr/bin/env python3 -I
"""Release in one command. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).
   python3 -I tools/release.py [--force]   QA in all three test browsers (skipped when nothing changed), then both packed files, old dist files pruned.
   Test browsers are the ones on the "browsers" branch of JNFoo/knowledgebase-single-file (read its README first; versions can change):
   Firefox, ungoogled Chromium and WebKitGTK, one at a time (set PD_CHROME, PD_FF, PD_GECKO). The release records the versions that really ran
   and writes them into the changelog entry ("Tested in"); it stops if one of the three did not run or the README does not name them."""
import glob, json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); py = [sys.executable, '-I']
def run(*a):
    r = subprocess.run(py + list(a), cwd=ROOT, capture_output=True, text=True); sys.stdout.write(r.stdout); sys.stderr.write(r.stderr)
    if r.returncode: sys.exit(r.returncode)
r = subprocess.run(['sh', 'tools/hooks/test.sh'], cwd=ROOT, capture_output=True, text=True); sys.stdout.write(r.stdout[-200:])
if r.returncode: sys.stderr.write(r.stdout + r.stderr); sys.exit(r.returncode)   # the house-rule git hooks still work
run('tools/test_docs_check.py'); run('tools/docs_check.py', '--allow-unreleased')   # cheap, so before the browsers
print('reminder: re-read the browsers branch README (git -C <kb-browsers> pull) before relying on these versions')
run('tools/qa.py', '--ff', '--wk', *[a for a in sys.argv[1:] if a in ('--force', '--fuzz') or a.isdigit()])   # three browsers, always
run('build.py', '--lab', '--min'); run('build.py', '--min')
if os.path.exists(os.path.join(ROOT, 'dist/min/index.html')):
    run('tools/qa.py', '--min', *[a for a in sys.argv[1:] if a == '--force'])   # the minified page is what ships, so it gets the same suite
else: print('note: esbuild not found, packing the readable page')
run('tools/pack.py', '--min'); run('tools/pack.py', '--lab', '--min')
files = sorted(glob.glob(os.path.join(ROOT, 'dist/pineapple-defense*-20*.html')))
vers = sorted({re.search(r'(20\d\d\.\d+\.\d+\.\d+)', f).group(1) for f in files})
# what really ran: qa.py wrote it; the release needs all three test browsers, named in the README, and puts them in the changelog entry
rec = json.load(open(os.path.join(ROOT, '.qa-browsers.json'))) if os.path.exists(os.path.join(ROOT, '.qa-browsers.json')) else {}
main, ship = [b['key'] for b in rec.get('main', [])], [b['key'] for b in rec.get('main-min', [])]
for need in ('Firefox', 'ungoogled Chromium', 'WebKitGTK'):
    if not any(k.startswith(need) for k in main): sys.exit('release stopped: %s did not run on the page (see tools/qa.py header; run with all three test browsers)' % need)
readme = open(os.path.join(ROOT, 'README.md'), encoding='utf-8').read()
miss = [k for k in main if k not in readme]
if miss: sys.exit('release stopped: the README does not name the test browsers that ran: %s (edit its "Test browsers" line)' % ', '.join(miss))
tested = '- **Tested in:** ' + ', '.join(b['label'] for b in rec['main']) + ' (one at a time)' + ('; the shipped minified page: ' + ', '.join(b['label'] for b in rec['main-min']) if ship else '; the shipped minified page: not run') + '.\n'
cl = os.path.join(ROOT, 'CHANGELOG.md'); t = open(cl, encoding='utf-8').read()
m = re.search(r'^## @VER@\n(.*?)(?=^## |\Z)', t, re.S | re.M)
if m:
    body = re.sub(r'^- \*\*Tested in[^\n]*\n', '', m.group(1), flags=re.M).rstrip('\n') + '\n' + tested + '\n'
    open(cl, 'w', encoding='utf-8').write(t[:m.start(1)] + body + t[m.end(1):])
for d in ['CHANGELOG.md', 'README.md'] + sorted(glob.glob(os.path.join(ROOT, 'docs/*.md'))):   # the changelog heading "## @VER@" becomes this release's stamp
    p = d if os.path.isabs(d) else os.path.join(ROOT, d); t = open(p, encoding='utf-8').read()
    if '@VER@' in t: open(p, 'w', encoding='utf-8').write(t.replace('@VER@', vers[-1]))
run('tools/docs_check.py')   # now strict: the newest changelog heading must be the version just built
for f in files:                      # keep only the newest two versions
    if re.search(r'(20\d\d\.\d+\.\d+\.\d+)', f).group(1) not in vers[-2:]: os.remove(f)
print('release ready:', *[os.path.basename(f) for f in sorted(glob.glob(os.path.join(ROOT, 'dist/pineapple-defense*-' + vers[-1] + '.html')))])
