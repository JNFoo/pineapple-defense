#!/usr/bin/env python3 -I
"""Pack index.html into one self-extracting, LZMA-compressed .html file.
Usage: python3 -I tools/pack.py [out.html]   (run build.py first)
The decoder is lzma-js (MIT), vendored in src/vendor/lzma/. Copyright (c) 2026 JNFoo. All rights reserved."""
import base64, lzma, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
lab = '--lab' in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith('--')]
src = ((root / 'dist' / 'lab' / 'index.html') if lab else (root / 'index.html')).read_bytes()
src = re.sub(rb'<meta http-equiv="Content-Security-Policy"[^>]*>\n?', b'', src)  # the wrapper carries the same policy
ver = re.search(rb'Alpha ([0-9.]+)', src)
ver = ver.group(1).decode() if ver else 'dev'
best = None
for lc in range(0, 5):
    for pb in range(0, 3):
        f = [{'id': lzma.FILTER_LZMA1, 'preset': 9 | lzma.PRESET_EXTREME, 'dict_size': 1 << 20, 'lc': lc, 'lp': 0, 'pb': pb}]
        c = lzma.compress(src, format=lzma.FORMAT_ALONE, filters=f)
        if best is None or len(c) < len(best): best = c
dec = (root / 'src/vendor/lzma/lzma-d-min.js').read_text(encoding='utf-8')
b64 = base64.b64encode(best).decode()
csp = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"
html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta http-equiv="Content-Security-Policy" content="{csp}"><title>Pineapple Defense{' Test Lab' if lab else ''}</title>
</head>
<body><p id="m" style="font:700 18px system-ui,sans-serif;text-align:center;margin:30vh 1em 0;color:#23203f">Unpacking Pineapple Defense...</p><noscript>Pineapple Defense needs JavaScript to run. Sorry!</noscript>
<!-- Pineapple Defense {ver}, LZMA self-extracting. Copyright (c) 2026 JNFoo. All rights reserved. Decoder: lzma-js (MIT). -->
<script>{dec}</script>
<script>
(function(){{try{{var s=atob("{b64}"),a=new Array(s.length),i;for(i=0;i<s.length;i++)a[i]=s.charCodeAt(i);
var t=LZMA.decompress(a),m=document.getElementById("m");m.parentNode.removeChild(m);document.open();document.write(t);document.close()}}catch(e){{document.getElementById("m").textContent="Sorry, the game could not unpack: "+e}}}}());
</script></body></html>
'''
out = pathlib.Path(args[0]) if args else root / 'dist' / (f'pineapple-defense-tester-{ver}.html' if lab else f'pineapple-defense-{ver}.html')
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'{out.name}: {len(src)//1024} KB -> {len(best)//1024} KB lzma, {len(html)//1024} KB file (lc/pb searched)')
