#!/usr/bin/env python3 -I
"""Release in one command. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).
   python3 -I tools/release.py [--ff] [--force]   QA (skipped when nothing changed), then both packed files, old dist files pruned."""
import glob, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); py = [sys.executable, '-I']
def run(*a):
    r = subprocess.run(py + list(a), cwd=ROOT, capture_output=True, text=True); sys.stdout.write(r.stdout); sys.stderr.write(r.stderr)
    if r.returncode: sys.exit(r.returncode)
r = subprocess.run(['sh', 'tools/hooks/test.sh'], cwd=ROOT, capture_output=True, text=True); sys.stdout.write(r.stdout[-200:])
if r.returncode: sys.stderr.write(r.stdout + r.stderr); sys.exit(r.returncode)   # the house-rule git hooks still work
run('tools/test_docs_check.py'); run('tools/docs_check.py', '--allow-unreleased')   # cheap, so before the browsers
run('tools/qa.py', *[a for a in sys.argv[1:] if a in ('--ff', '--force', '--fuzz') or a.isdigit()])
run('build.py', '--lab', '--min'); run('build.py', '--min')
if os.path.exists(os.path.join(ROOT, 'dist/min/index.html')):
    run('tools/qa.py', '--min', *[a for a in sys.argv[1:] if a == '--force'])   # the minified page is what ships, so it gets the same suite
else: print('note: esbuild not found, packing the readable page')
run('tools/pack.py', '--min'); run('tools/pack.py', '--lab', '--min')
files = sorted(glob.glob(os.path.join(ROOT, 'dist/pineapple-defense*-20*.html')))
vers = sorted({re.search(r'(20\d\d\.\d+\.\d+\.\d+)', f).group(1) for f in files})
for d in ['CHANGELOG.md', 'README.md'] + sorted(glob.glob(os.path.join(ROOT, 'docs/*.md'))):   # the changelog heading "## @VER@" becomes this release's stamp
    p = d if os.path.isabs(d) else os.path.join(ROOT, d); t = open(p, encoding='utf-8').read()
    if '@VER@' in t: open(p, 'w', encoding='utf-8').write(t.replace('@VER@', vers[-1]))
run('tools/docs_check.py')   # now strict: the newest changelog heading must be the version just built
for f in files:                      # keep only the newest two versions
    if re.search(r'(20\d\d\.\d+\.\d+\.\d+)', f).group(1) not in vers[-2:]: os.remove(f)
print('release ready:', *[os.path.basename(f) for f in sorted(glob.glob(os.path.join(ROOT, 'dist/pineapple-defense*-' + vers[-1] + '.html')))])
