#!/usr/bin/env python3 -I
"""Docs-drift check for Pineapple Defense. Copyright (c) 2026 JNFoo. All rights reserved.

  python3 -I tools/docs_check.py        about 0.1 s, no browser, no network; release.py runs it before packing

It fails on things a machine can check, and only those (paths, commands, counts, placeholders), so prose never gives a false alarm:
  1. a placeholder left in a document (TODO, TBD, XXX, FIXME; @VER@ too, except with --allow-unreleased, because release.py fills it in)
  2. a `path` in backticks (src/, tools/, docs/) that does not exist
  3. a `python3 -I tools/x.py --flag` command whose script is missing or does not know the flag
  4. "N trophies" in the README disagreeing with the trophies in the code
  5. "the N stages" / "N Champions" disagreeing with NSTAGES in the code
  6. a Status line that names a version stamp (it goes stale on the next release; point to the changelog instead)
  7. a status line saying the project has no code
  8. a version stamp written in an old, non-padded form (2026.1.5.0817)
  9. the newest CHANGELOG heading is not the version of the newest dist file, when a dist file exists
"""
import glob, os, re, sys
ROOT = os.environ.get('PD_DOCS_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # PD_DOCS_ROOT lets the test point it at a copy
rd = lambda p: open(os.path.join(ROOT, p), encoding='utf-8').read()
docs = ['README.md', 'CHANGELOG.md'] + sorted(os.path.relpath(p, ROOT) for p in glob.glob(os.path.join(ROOT, 'docs/*.md')))
bad = []
WORDS = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10}

def count_entries(path, var):
    s = rd(path); a = s[s.index('var %s = [' % var):]; a = a[:a.index('\n];')]
    return len(re.findall(r'^\s*\{', a, re.M))

trophies = count_entries('src/game.js', 'ACH') + count_entries('src/extras.js', 'ACH2')
nstages = int(re.search(r'NSTAGES = (\d+)', rd('src/game.js')).group(1))
champs = len(re.findall(r'^\s*\d: \{ n:', rd('src/stages.js'), re.M)) or nstages
qa_src = rd('tools/qa.py')

for d in docs:
    text = rd(d)
    for i, line in enumerate(text.split('\n'), 1):
        where = '%s:%d' % (d, i)
        if re.search(r'\bTODO\b|\bTBD\b|\bXXX\b|\bFIXME\b', line) or ('@VER@' in line and '--allow-unreleased' not in sys.argv): bad.append('%s: a placeholder is left in: %s' % (where, line.strip()[:80]))
        for m in re.finditer(r'`((?:src|tools|docs)/[A-Za-z0-9_./-]+)`', line):
            p = m.group(1).rstrip('.,')
            if re.search(r'[*<>{}]|NNN|YYYY', p): continue
            if not os.path.exists(os.path.join(ROOT, p)): bad.append('%s: `%s` does not exist' % (where, p))
        for m in re.finditer(r'(?:python3(?: -I)?|node) (tools/[A-Za-z0-9_./-]+\.(?:py|js))((?: --[a-z]+)*)', line):
            script, flags = m.group(1), m.group(2).split()
            if not os.path.exists(os.path.join(ROOT, script)): bad.append('%s: command script %s does not exist' % (where, script)); continue
            body = rd(script)
            for f in flags:
                if f not in body: bad.append('%s: %s does not know %s' % (where, script, f))
        m = re.search(r'(\d+) trophies', line)
        if d == 'README.md' and m and line.startswith('#') and int(m.group(1)) != trophies: bad.append('%s: says %s trophies, the code has %d' % (where, m.group(1), trophies))
        for m in re.finditer(r'\b(?:the |all )?(one|two|three|four|five|six|seven|eight|nine|ten|\d+) stages\b', line, re.I):
            n = WORDS.get(m.group(1).lower()) or int(m.group(1))
            if n != nstages and not re.search(r'stage[s]? (?:1|2|3|4|5)|first|last', line, re.I): bad.append('%s: says %s stages, the code has %d' % (where, n, nstages))
        if re.match(r'\s*(>\s*)?\**Status\**[: ]', line, re.I) and re.search(r'\b20\d\d\.\d+\.\d+\.\d+', line): bad.append('%s: a Status line names a version stamp; it will go stale (point to the changelog)' % where)
        if re.match(r'\s*(>\s*)?\**Status\**[: ]', line, re.I) and re.search(r'no code written|design phase', line, re.I): bad.append('%s: Status says there is no code, but the game is built' % where)
        for m in re.finditer(r'\b20\d\d\.(\d)\.(\d+)\.\d+\b|\b20\d\d\.\d+\.(\d)\.\d+\b', line):
            bad.append('%s: version stamp %s is not zero-padded (year.month.day.HHMM)' % (where, m.group(0)))

top = re.search(r'^## (\d{4}\.\d{2}\.\d{2}\.\d{4}|@VER@)', rd('CHANGELOG.md'), re.M) if '--allow-unreleased' in sys.argv else re.search(r'^## (\d{4}\.\d{2}\.\d{2}\.\d{4})', rd('CHANGELOG.md'), re.M)
if not top: bad.append('CHANGELOG.md: no heading like "## 2026.10.14.0817" at the top')
else:
    dist = sorted(glob.glob(os.path.join(ROOT, 'dist/pineapple-defense-2*.html')))
    if dist and '--no-dist' not in sys.argv:
        newest = re.search(r'(\d{4}\.\d{2}\.\d{2}\.\d{4})', os.path.basename(dist[-1])).group(1)
        if newest != top.group(1) and '--allow-unreleased' not in sys.argv: bad.append('CHANGELOG.md: newest heading %s, newest build %s (release.py runs this after the build; use --allow-unreleased before it)' % (top.group(1), newest))

if bad:
    print('DOCS DRIFT (%d):' % len(bad)); [print(' - ' + b) for b in bad]; sys.exit(1)
print('docs ok: %d files, %d trophies, %d stages' % (len(docs), trophies, nstages))
