#!/usr/bin/env python3 -I
"""Tests docs_check.py by planting each kind of drift in a throwaway copy. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).  python3 -I tools/test_docs_check.py"""
import os, shutil, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def fresh():
    d = tempfile.mkdtemp()
    for k in ('src', 'tools'): os.symlink(os.path.join(ROOT, k), os.path.join(d, k))   # code is only read, never changed
    for k in ('README.md', 'CHANGELOG.md'): shutil.copy(os.path.join(ROOT, k), os.path.join(d, k))
    os.makedirs(os.path.join(d, 'docs'))
    for f in os.listdir(os.path.join(ROOT, 'docs')):
        src = os.path.join(ROOT, 'docs', f)
        if f.endswith('.md'): shutil.copy(src, os.path.join(d, 'docs', f))
        else: os.symlink(src, os.path.join(d, 'docs', f))
    return d
def run(d): r = subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'tools/docs_check.py'), '--allow-unreleased'], capture_output=True, text=True, env=dict(os.environ, PD_DOCS_ROOT=d)); return r.returncode, r.stdout
def edit(d, p, f): s = open(os.path.join(d, p), encoding='utf-8').read(); open(os.path.join(d, p), 'w', encoding='utf-8').write(f(s))
CASES = [
  ('a clean copy passes', lambda d: None, 0, 'docs ok'),
  ('a placeholder is caught', lambda d: edit(d, 'README.md', lambda s: s + '\nTODO write this\n'), 1, 'placeholder'),
  ('a missing path is caught', lambda d: edit(d, 'README.md', lambda s: s + '\nSee `tools/nope.py`.\n'), 1, 'does not exist'),
  ('an unknown flag is caught', lambda d: edit(d, 'README.md', lambda s: s + '\nRun python3 -I tools/qa.py --bogus\n'), 1, 'does not know --bogus'),
  ('a wrong trophy count is caught', lambda d: edit(d, 'README.md', lambda s: s.replace('## 21 trophies', '## 22 trophies')), 1, 'trophies'),
  ('a wrong stage count is caught', lambda d: edit(d, 'README.md', lambda s: s + '\nThere are seven stages in all.\n'), 1, 'stages'),
  ('a version in a Status line is caught', lambda d: edit(d, 'README.md', lambda s: s + '\n> **Status:** alpha, version 2026.10.13.1614\n'), 1, 'Status line'),
  ('"no code written" in a Status line is caught', lambda d: edit(d, 'README.md', lambda s: s + '\nStatus: design phase, no code written\n'), 1, 'no code'),
  ('an unpadded version stamp is caught', lambda d: edit(d, 'CHANGELOG.md', lambda s: s + '\nSee 2026.1.5.0817\n'), 1, 'zero-padded'),
]
bad = 0
for name, mutate, want, word in CASES:
    d = fresh(); mutate(d); code, out = run(d); ok = code == want and word in out; bad += not ok
    print('  %-4s %s' % ('ok' if ok else 'FAIL', name) + ('' if ok else '  -> exit %d: %s' % (code, out.strip()[:200]))); shutil.rmtree(d)
print('%d of %d passed' % (len(CASES) - bad, len(CASES))); sys.exit(1 if bad else 0)
