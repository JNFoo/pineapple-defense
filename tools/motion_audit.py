#!/usr/bin/env python3 -I
# Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE).
"""Motion audit (X21, X64-X66): lists every animation and transition length in the page against a small
duration scale and prints a plain table. Reads src/title.html and src/game.js only; no browser, under a second.
Run: python3 -I tools/motion_audit.py            (table)   |   python3 -I tools/motion_audit.py --check   (exit 1 on a flagged one-shot)
"""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
css = open(os.path.join(ROOT, 'src/title.html'), encoding='utf-8').read()
js = open(os.path.join(ROOT, 'src/game.js'), encoding='utf-8').read()
SCALE = [(0.12, 'tap feedback (about 100 ms)'), (0.25, 'small change (150-250 ms)'), (0.32, 'card or dialog (250-300 ms)'), (0.5, 'big travel (about 400 ms)'), (1.0, 'celebration (600-1000 ms)')]
def secs(v):
    m = re.match(r'(\d*\.?\d+)(ms|s)\b', v.strip())
    return None if not m else float(m.group(1)) / (1000 if m.group(2) == 'ms' else 1)
def band(d):
    for top, name in SCALE:
        if d <= top: return name
    return 'longer than a celebration'
rows = []
for m in re.finditer(r'([^{}@]+)\{([^{}]*)\}', css):
    sel, body = m.group(1).strip().split('\n')[-1][:48], m.group(2)
    if 'calm' in sel: continue
    for a in re.finditer(r'animation:([^;}]+)', body):
        parts = a.group(1).split(); d = next((secs(x) for x in parts if secs(x) is not None), None)
        if d is None: continue
        rows.append((sel, 'loop' if 'infinite' in parts else 'once', d, parts[0]))
    for t in re.finditer(r'(?<![-\w])transition:([^;}]+)', body):
        d = next((secs(x) for x in t.group(1).replace(',', ' ').split() if secs(x) is not None), None)
        if d is not None: rows.append((sel, 'transition', d, t.group(1).split()[0]))
for m in re.finditer(r'duration: *(\d+|ms <= 1000 \? 260 : 420)', js):
    rows.append(('game.js animate()', 'once', (int(m.group(1)) if m.group(1).isdigit() else 0.26 * 1000) / 1000, 'script'))
flag = [r for r in rows if r[1] != 'loop' and r[2] > 0.5]
print('%d lengths found (%d loops, %d one-shots and transitions)' % (len(rows), sum(r[1] == 'loop' for r in rows), sum(r[1] != 'loop' for r in rows)))
print('| where | kind | seconds | what it is | band |\n|---|---|---|---|---|')
for r in sorted(rows, key=lambda r: (r[1] == 'loop', r[2])):
    print('| %s | %s | %.2f | %s | %s |' % (r[0], r[1], r[2], r[3], 'ambient' if r[1] == 'loop' else band(r[2])))
print('\nFlagged one-shots over 0.5 s: %s' % (', '.join('%s %.2fs' % (r[0], r[2]) for r in flag) or 'none'))
sys.exit(1 if '--check' in sys.argv and flag else 0)
