#!/usr/bin/env python3 -I
"""Pack index.html into one self-extracting, LZMA-compressed .html file.
Usage: python3 -I tools/pack.py [out.html]   (run build.py first)
The packer and unpacker are JS-modules lzma-pack and lzma-decode (MIT), vendored in tools/vendor/. Copyright (c) 2026 LFC Foundry. MIT License (see LICENSE)."""
import os, re, subprocess, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
lab = '--lab' in sys.argv
mn = '--min' in sys.argv   # pack the esbuild-minified page (build.py --min first); falls back to the readable page if it is missing
args = [a for a in sys.argv[1:] if not a.startswith('--')]
pg = (root / 'dist' / ('lab-min' if lab else 'min') / 'index.html') if mn else None
if not (pg and pg.exists()): pg = (root / 'dist' / 'lab' / 'index.html') if lab else (root / 'index.html')
src = pg.read_bytes()
src = re.sub(rb'<meta http-equiv="Content-Security-Policy"[^>]*>\n?', b'', src)  # the wrapper carries the same policy
ver = re.search(rb'Alpha ([0-9.]+)', src)
ver = ver.group(1).decode() if ver else 'dev'
csp = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'wasm-unsafe-eval'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"
hdr = (root / 'src' / 'header.txt').read_text(encoding='utf-8').rstrip('\n')
head = f'<meta http-equiv="Content-Security-Policy" content="{csp}">\n<!-- Pineapple Defense {ver}, LZMA self-extracting (lzma-pack and lzma-decode from JS-modules, MIT).\n{hdr}\n-->'
out = pathlib.Path(args[0]) if args else root / 'dist' / (f'pineapple-defense-tester-{ver}.html' if lab else f'pineapple-defense-{ver}.html')
out.parent.mkdir(exist_ok=True)
tmp = out.with_name(out.name + '.src.html')
tmp.write_bytes(src)
try:
    r = subprocess.run([sys.executable, '-I', str(root / 'tools/vendor/tools/lzma-pack/pack.py'), str(tmp), str(out), '--title', 'Pineapple Defense' + (' Test Lab' if lab else ''),
                        '--head', head, '--encoding', 'base64', '--tune', '--wasm'], capture_output=True, text=True, env={**os.environ, **({'ESBUILD': os.environ['PD_ESBUILD']} if os.environ.get('PD_ESBUILD') else {})})
finally:
    tmp.unlink()
if r.returncode: sys.exit(r.stdout + r.stderr)
print(f'{out.name}: {len(src)//1024} KB -> {out.stat().st_size//1024} KB file (lzma-pack, text-safe, with the WebAssembly unpacker and the plain one as fallback)')
