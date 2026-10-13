#!/usr/bin/env python3
"""Build index.html from src/. Never hand-edit index.html."""
import base64, io, re, sys, datetime, zoneinfo
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

def game_js():
    g = (S / "game.js").read_text(encoding="utf-8")
    if LAB:
        g = g.replace("key: 'pd-save'", "key: 'pd-lab-save'")  # the tester keeps its own save
    g = g.replace("/*{{STAGES_JS}}*/", (S / "stages.js").read_text(encoding="utf-8"))
    return g.replace("/*{{LAB_JS}}*/", (S / "lab" / "lab.js").read_text(encoding="utf-8") if LAB else "")

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

main()
