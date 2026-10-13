#!/usr/bin/env python3
"""Build index.html from src/. Never hand-edit index.html."""
import os, base64, io, re, sys, datetime, zoneinfo
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

R = Path(__file__).parent
S = R / "src"
CHARS = "".join(chr(c) for c in range(32, 127)) + "‘’“”©·…–—"

def font_face(fam, fname, weight):
    f = TTFont(S / "fonts" / fname)
    opts = subset.Options(); opts.flavor = "woff"; opts.layout_features = ["kern", "liga"]
    sub = subset.Subsetter(opts); sub.populate(text=CHARS); sub.subset(f)
    f.flavor = "woff"
    buf = io.BytesIO(); f.save(buf)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return ("@font-face{font-family:'%s';font-weight:%d;font-style:normal;font-display:swap;"
            "src:url(data:font/woff;base64,%s) format('woff')}" % (fam, weight, b64))

LAB = "--lab" in sys.argv
MIN = "--min" in sys.argv

def game_js():
    g = (S / "game.js").read_text(encoding="utf-8")
    if LAB:
        g = g.replace("key: 'pd-save'", "key: 'pd-lab-save'")  # the tester keeps its own save
    g = g.replace("/*{{STAGES_JS}}*/", (S / "stages.js").read_text(encoding="utf-8"))
    g = g.replace("/*{{EVOLVE_JS}}*/", (S / "evolve.js").read_text(encoding="utf-8"))
    g = g.replace("/*{{EXTRAS_JS}}*/", (S / "extras.js").read_text(encoding="utf-8"))
    return g.replace("/*{{LAB_JS}}*/", (S / "lab" / "lab.js").read_text(encoding="utf-8") if LAB else "")

def minify(t):
    """Shrink every inline script and style with esbuild (optional tool). Returns None when esbuild is missing."""
    import shutil, subprocess
    exe = os.environ.get("PD_ESBUILD") or shutil.which("esbuild") or str(R / "node_modules" / ".bin" / "esbuild")
    if not os.path.exists(exe) and not shutil.which(exe): return None
    def run(code, loader):
        r = subprocess.run([exe, "--minify", "--loader=" + loader, "--target=es2017"], input=code, capture_output=True, text=True)
        if r.returncode: raise SystemExit("minify failed: " + r.stderr[:400])
        return r.stdout.rstrip("\n")
    def js(m): return m.group(1) + (run(m.group(2), "js") if m.group(2).strip() else "") + m.group(3)
    def css(m): return m.group(1) + run(m.group(2), "css") + m.group(3)
    # scripts and styles in document order, each closed by its own tag, so a "</style>" string inside a script is left alone
    return re.sub(r"(<script(?![^>]*src)[^>]*>)(.*?)(</script>)|(<style[^>]*>)(.*?)(</style>)",
                  lambda m: js(m) if m.group(1) else m.group(4) + run(m.group(5), "css") + m.group(6), t, flags=re.S)

def main():
    now = datetime.datetime.now(zoneinfo.ZoneInfo("America/New_York"))
    ver = now.strftime("%Y.%-m.%-d.%H%M")
    t = (S / "title.html").read_text(encoding="utf-8")
    sp = S / "sprites"
    rep = {
        "<!--{{pineapple}}-->": (sp / "pineapple.svg").read_text(),
        "<!--{{rockhopper}}-->": (sp / "rockhopper.svg").read_text(),
        "<!--{{land}}-->": (sp / "land.svg").read_text(),
        "<!--{{logo-defs}}-->": (sp / "logo-defs.svg").read_text(),
        "/*{{FONTS}}*/": font_face("Bricolage Grotesque", "bricolage-grotesque-latin-800-normal.woff", 800)
                         + "\n" + font_face("Figtree", "figtree-latin-700-normal.woff", 700),
        "/*{{STICKER_CSS}}*/": (S / "vendor/sticker-text/sticker-text.css").read_text(),
        "/*{{STICKER_JS}}*/": (S / "vendor/sticker-text/sticker-text.js").read_text(),
        "/*{{EVEN_DT}}*/": (S / "vendor/frame-kit/even-dt.js").read_text(),
        "/*{{QGOV}}*/": (S / "vendor/frame-kit/quality-governor.js").read_text(),
        "/*{{SAVEKIT}}*/": (S / "vendor/save-kit/save-kit.js").read_text(),
        "/*{{GAME_JS}}*/": game_js(),
        "<!--{{adelie}}-->": (sp / "adelie.svg").read_text(),
        "<!--{{palm}}-->": (sp / "prop-palm.svg").read_text(),
        "<!--{{waddles}}-->": (sp / "waddles.svg").read_text(),
        "<!--{{plant}}-->": (sp / "prop-plant.svg").read_text(),
        "<!--{{sign}}-->": (sp / "prop-sign.svg").read_text(),
    }
    for k, v in rep.items():
        assert k in t, k
        t = t.replace(k, v)
    t = t.replace("<!--{{LAB_BTN}}-->", '<div class="row"><button class="btn" id="bLab" type="button">Test Lab</button></div>' if LAB else "")
    t = t.replace("{{VERSION}}", ver + (" LAB" if LAB else ""))
    assert "{{" not in re.sub(r"\$\{\{", "", t.replace("{{VERSION}}", "")) or True
    out = R / "dist" / "lab" / "index.html" if LAB else R / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(t, encoding="utf-8")
    print("built", out.relative_to(R), ver, len(t) // 1024, "KB")
    if MIN:
        m = minify(t)
        if m is None:
            print("no esbuild found (npm i --no-save esbuild, or set PD_ESBUILD): skipped the minified build")
        else:
            mo = R / "dist" / ("lab-min" if LAB else "min") / "index.html"
            mo.parent.mkdir(parents=True, exist_ok=True); mo.write_text(m, encoding="utf-8")
            print("built", mo.relative_to(R), len(m) // 1024, "KB (minified)")

main()
