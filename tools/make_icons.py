"""Builds src/sprites/icons.svg: round glossy badges for the 21 trophies, the shop upgrades and the pickups.
Run: python3 -I tools/make_icons.py   (the output is committed; build.py inlines it)"""
import math, pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "sprites" / "icons.svg"
INK = "#6b3f12"
FACES = {  # name: (light, dark)
    "orange": ("#ffc66b", "#f08a1c"), "purple": ("#d3a8ff", "#8b4fd8"), "blue": ("#9fdcff", "#2f83d8"),
    "teal": ("#8ff0d8", "#1fa88c"), "red": ("#ff9a8a", "#d8383a"), "green": ("#c4f08a", "#3fae4a"),
    "pink": ("#ffb3d1", "#e0508c"), "yellow": ("#fff0a0", "#f2b81e"),
}


def pine(x, y, s=1.0, gold=False):
    body = "#ffd84a" if gold else "#ffc93c"
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0-5L-3.6-11.5 -1.2-8.6 0-13 1.2-8.6 3.6-11.5Z" fill="#3fae4a" stroke="{INK}" stroke-width=".9" stroke-linejoin="round"/>'
            f'<ellipse cx="0" cy="2" rx="6" ry="7.6" fill="{body}" stroke="{INK}" stroke-width="1.1"/>'
            f'<path d="M-3-3L3 7M3-3L-3 7M-5.5 1.5L0 8M5.5 1.5L0 8" fill="none" stroke="#c98a14" stroke-width=".8" stroke-linecap="round"/>'
            f'<ellipse cx="-2.4" cy="-1.6" rx="1.3" ry="2.4" fill="#fff" opacity=".55"/></g>')


def star(x, y, r, fill="#ffd23f", rot=0):
    pts = []
    for i in range(10):
        a = math.pi / 5 * i - math.pi / 2 + rot
        rr = r if i % 2 == 0 else r * 0.45
        pts.append(f"{x + rr * math.cos(a):.1f},{y + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="{INK}" stroke-width=".8" stroke-linejoin="round"/>'


def spark(x, y, r, fill="#fff"):
    return f'<path d="M{x} {y-r}Q{x} {y} {x+r} {y}Q{x} {y} {x} {y+r}Q{x} {y} {x-r} {y}Q{x} {y} {x} {y-r}Z" fill="{fill}"/>'


def cloud(x, y, s=1.0, fill="#fff"):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-10 4a5 5 0 0 1 1-9.6 6.5 6.5 0 0 1 12.2-1.4 5.5 5.5 0 0 1 7.8 6 4.2 4.2 0 0 1-1 5Z" fill="{fill}" stroke="#5b7aa0" stroke-width="1.1" stroke-linejoin="round"/></g>')


def gull():
    return ('<path d="M20 17Q14 9 5.5 14Q10 14.5 12.5 19Q9 19.5 7 22Q15 21 19 25Z" fill="#fff" stroke="#5b6f8c" stroke-width="1.2" stroke-linejoin="round"/>'
            '<path d="M20 17Q26 9 34.5 14Q30 14.5 27.5 19Q31 19.5 33 22Q25 21 21 25Z" fill="#fff" stroke="#5b6f8c" stroke-width="1.2" stroke-linejoin="round"/>'
            '<ellipse cx="20" cy="23" rx="4" ry="7" fill="#fff" stroke="#5b6f8c" stroke-width="1.2"/><circle cx="20" cy="15.4" r="3.6" fill="#fff" stroke="#5b6f8c" stroke-width="1.2"/>'
            '<path d="M22.9 15.2L27 16.4 22.9 17.6Z" fill="#ff9d2e" stroke="#b86a10" stroke-width=".7" stroke-linejoin="round"/><circle cx="19.4" cy="14.6" r="1" fill="#1d2630"/><path d="M18 30L20 33 22 30Z" fill="#ff9d2e"/>')


def umbrella():
    return (f'<path d="M20 20V31Q20 34.5 16.6 33.4" fill="none" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>'
            f'<path d="M6.5 20.5Q20 1.5 33.5 20.5Q29.6 17.4 26.8 20.5Q23.4 17.4 20 20.5Q16.6 17.4 13.2 20.5Q10 17.4 6.5 20.5Z" fill="#ff5a6a" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/>'
            '<path d="M20 5.5Q15.6 12 13.2 20M20 5.5Q24.4 12 26.8 20" fill="none" stroke="#fff" stroke-width="2.2" opacity=".85"/>')


def bolt(fill="#ffe14a"):
    return f'<polygon points="23.5,5.5 11.5,22 19,22 16,34.5 28.5,16.5 21,16.5" fill="{fill}" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/>'


def flame():
    return (f'<path d="M20 5.5Q21.6 12.5 27 16.8 33 21.6 29.4 29.4 26.4 34.5 20 34.5 13.2 34.5 11 28.4 9.6 22.6 15 18.2 14.6 23 18 23.4 16 14 20 5.5Z" fill="#ff7a2e" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/>'
            '<path d="M20.4 20.5Q23.5 24 22.6 28 21.6 31 19.6 31 16.8 31 16.6 28.2 16.4 25 20.4 20.5Z" fill="#ffe14a"/>')


def lime(x, y, r):
    segs = "".join(f'<path d="M{x} {y}L{x + (r-1.4)*math.cos(math.radians(a)):.1f} {y + (r-1.4)*math.sin(math.radians(a)):.1f}" stroke="#eaffc4" stroke-width=".9"/>' for a in range(0, 360, 45))
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="#7fcf3a" stroke="{INK}" stroke-width="1.1"/><circle cx="{x}" cy="{y}" r="{r-1.5}" fill="#c9f27a"/>{segs}<circle cx="{x}" cy="{y}" r="1" fill="#eaffc4"/>')


def slingshot(with_pine=True):
    s = (f'<path d="M20 34V22M20 22L11 9M20 22L29 9" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>'
         '<path d="M20 34V22M20 22L11 9M20 22L29 9" fill="none" stroke="#c98a4a" stroke-width="2.6" stroke-linecap="round"/>'
         '<path d="M11.5 10Q20 20 28.5 10" fill="none" stroke="#e0304a" stroke-width="1.6" stroke-linecap="round"/>')
    return s + (pine(20, 14.5, 0.5) if with_pine else "")


# ---- the 21 trophies: (face color, motif) in the same order as ACH + ACH2 in the game ----
def ach():
    A = []
    A.append(("orange", '<path d="M7 31Q9 15 16.5 17" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 3.4"/>' + pine(24, 19, 0.95)))  # First Toss
    A.append(("purple", f'<ellipse cx="20" cy="27" rx="11.5" ry="3" fill="#2c2c3a" stroke="{INK}" stroke-width=".8"/><rect x="13.5" y="9.5" width="13" height="17" rx="2" fill="#2c2c3a" stroke="{INK}" stroke-width=".8"/><rect x="13.5" y="20.5" width="13" height="3.6" fill="#e0304a"/>' + spark(29, 10, 3.4)))  # Hat Trick
    A.append(("blue", '<circle cx="20" cy="20" r="5" fill="#d4f0ff" stroke="#2f6fb8" stroke-width="1"/>' + "".join(f'<ellipse cx="{20 + 11 * math.cos(a):.1f}" cy="{20 + 11 * math.sin(a):.1f}" rx="2" ry="2.8" transform="rotate({math.degrees(a) + 90:.0f} {20 + 11 * math.cos(a):.1f} {20 + 11 * math.sin(a):.1f})" fill="#d4f0ff" stroke="#2f6fb8" stroke-width=".8"/>' for a in [i * math.pi / 3 for i in range(6)])))  # Splash Party
    A.append(("blue", '<path d="M6.5 24Q11 13 16 20T25 18Q29 12 33.5 20V31H6.5Z" fill="#fff" stroke="#2f6fb8" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 27Q14 23 19 27T29 27" fill="none" stroke="#9fdcff" stroke-width="1.6" stroke-linecap="round"/>' + star(29, 11, 4)))  # Perfect Wave
    A.append(("teal", "".join(f'<circle cx="{x}" cy="{y}" r="4.6" fill="#fff" stroke="#6a9bc4" stroke-width="1"/><circle cx="{x-1.4}" cy="{y-1.4}" r="1.2" fill="#d4ecff"/>' for x, y in [(13, 26), (22, 26), (17.5, 18)]) + star(29.5, 12, 4.4)))  # Snowball Popper
    A.append(("red", f'<circle cx="17" cy="23" r="8.4" fill="#dfe5ee" stroke="{INK}" stroke-width="1.2"/><rect x="22" y="15" width="11" height="6.6" rx="2.4" fill="#c7cfdc" stroke="{INK}" stroke-width="1.2"/><circle cx="17" cy="23" r="3" fill="#2c2c3a"/><path d="M11 17Q8 9 14 8" fill="none" stroke="#ffd23f" stroke-width="2" stroke-linecap="round"/>'))  # Coach Champ (a whistle)
    A.append(("green", bolt()))  # Power Pal
    A.append(("teal", f'<path d="M5.5 20Q20 5 34.5 20Q20 35 5.5 20Z" fill="#fff" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="20" cy="20" r="7" fill="#3b7bd5" stroke="{INK}" stroke-width="1"/><circle cx="20" cy="20" r="3.4" fill="#10182a"/><circle cx="17.8" cy="17.6" r="1.7" fill="#fff"/>'))  # Eagle Eye
    A.append(("pink", f'<path d="M20 6.5Q30.5 19.5 28.6 26A8.6 8.6 0 0 1 11.4 26Q9.5 19.5 20 6.5Z" fill="#cfeeff" stroke="#2f6fb8" stroke-width="1.3" stroke-linejoin="round"/><ellipse cx="16" cy="23" rx="2" ry="3.6" fill="#fff" opacity=".8" transform="rotate(14 16 23)"/>'))  # Phew!
    A.append(("green", f'<path d="M20 6L31.5 10.2V19Q31.5 28 20 34Q8.5 28 8.5 19V10.2Z" fill="#fff" stroke="{INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M20 10V30Q13 26 12.4 19V13Z" fill="#e7f6dd"/>' + star(20, 19.5, 5.4)))  # Spotless Stand
    A.append(("blue", gull()))  # Gull Pals
    A.append(("yellow", umbrella()))  # Brolly Boss
    A.append(("blue", cloud(20, 17.5, 1.0) + pine(12.5, 28.5, 0.42) + pine(20, 31.5, 0.42) + pine(27.5, 28.5, 0.42)))  # Pineapple Rain!
    A.append(("purple", cloud(20, 16.5, 1.05) + "".join(pine(x, y, 0.32) for x, y in [(10.5, 27), (15.5, 32), (20.5, 27), (25.5, 32), (30, 27)]) + spark(31, 9, 3)))  # Big Rain
    A.append(("pink", pine(13.5, 22, 0.8) + pine(26.5, 22, 0.8) + spark(20, 11, 3.8)))  # Team Spirit
    A.append(("red", flame()))  # Combo Master
    A.append(("purple", "".join(star(x, y, 3.3) for x, y in [(10.5, 23), (14.8, 16.4), (20, 13.4), (25.2, 16.4), (29.5, 23)]) + '<path d="M10 28Q20 33 30 28" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>'))  # All Five!
    A.append(("green", '<path d="M11 10.5L21 20 11 29.5M19.5 10.5L29.5 20 19.5 29.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>'))  # Faster Fun
    A.append(("orange", f'<circle cx="21" cy="23" r="10" fill="#fff" stroke="{INK}" stroke-width="1.4"/><rect x="18.4" y="8.5" width="5.2" height="3.6" rx="1" fill="{INK}"/><path d="M21 23V16.4M21 23L26 26" stroke="#e0304a" stroke-width="2" stroke-linecap="round"/><path d="M5 17H9.5M4 22H8.5M5 27H9.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>'))  # Top Speed
    A.append(("teal", f'<path d="M9 33L18 17L22 24L25 19L31 33Z" fill="#fff" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M18 8V25" stroke="{INK}" stroke-width="2" stroke-linecap="round"/><path d="M18.8 8.4L28 11.4L18.8 15Z" fill="#e0304a" stroke="{INK}" stroke-width="1" stroke-linejoin="round"/>'))  # Challenger
    cols = ["#ff6fa8", "#ffd23f", "#6fe0b0", "#8fd8ff"]
    A.append(("purple", "".join(f'<path d="M20 20L{20 + 11.5 * math.cos(a):.1f} {20 + 11.5 * math.sin(a):.1f}" stroke="{cols[i % 4]}" stroke-width="2.4" stroke-linecap="round"/><circle cx="{20 + 13 * math.cos(a):.1f}" cy="{20 + 13 * math.sin(a):.1f}" r="1.5" fill="{cols[i % 4]}"/>' for i, a in enumerate(i * math.pi / 4 for i in range(8))) + '<circle cx="20" cy="20" r="3.4" fill="#fff"/>'))  # Grand Finale
    return A


# ---- upgrades and pickups: id -> (face, motif) ----
def lime_set(n):
    pos = {1: [(20, 20, 9.5)], 2: [(14.5, 22, 7), (25.8, 18.5, 7)], 3: [(12.5, 24, 6.2), (26.5, 24, 6.2), (19.5, 14, 6.2)]}[n if n < 3 else 3]
    if n == 5:
        pos = [(11, 25, 5.4), (20, 26, 5.4), (29, 25, 5.4), (15.5, 16.5, 5.4), (24.5, 16.5, 5.4)]
    return "".join(lime(x, y, r) for x, y, r in pos)


def upg():
    return {
        "au": ("teal", slingshot()),
        "ar": ("orange", '<path d="M5.5 17H12M4.5 22.5H11M5.5 28H12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' + pine(24, 21, 0.95)),
        "ap": ("yellow", pine(20, 21, 1.25, True) + spark(29.5, 10, 3.4) + spark(10.5, 27, 2.4)),
        "lm": ("green", lime_set(1)), "lm2": ("green", lime_set(2)), "lm3": ("green", lime_set(5)),
        "gu": ("blue", gull()), "um": ("yellow", umbrella()), "ra": ("blue", cloud(20, 17, 1.05) + "".join(pine(x, y, 0.36) for x, y in [(11.5, 28.5), (20, 32), (28.5, 28.5)])),
        "pz": ("green", bolt()), "pm": ("purple", pine(20, 21, 1.4) + spark(30, 9, 3.2)),
        "ph": ("pink", f'<path d="M20 32Q6 22 8.6 14.6 11 8.4 16.6 9.6 19.2 10.2 20 13.4 20.8 10.2 23.4 9.6 29 8.4 31.4 14.6 34 22 20 32Z" fill="#ff4f7d" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round"/><ellipse cx="14.5" cy="15" rx="2" ry="3" fill="#fff" opacity=".6" transform="rotate(-30 14.5 15)"/>'),
        "pf": ("orange", flame()),
    }


def symbol(sid, face, motif):
    a, b = FACES[face]
    return (f'<symbol id="{sid}" viewBox="0 0 40 40" overflow="visible">'
            f'<circle cx="20" cy="21" r="18.4" fill="#2a120d" opacity=".16"/>'
            f'<circle cx="20" cy="20" r="18.4" fill="url(#ix-rim)"/><circle cx="20" cy="20" r="15.6" fill="url(#ix-{face})"/>'
            f'<path d="M8.6 15.2A13.2 13.2 0 0 1 28 8.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".4"/>{motif}</symbol>')


NAMES = ["first-toss", "hat-trick", "splash-party", "perfect-wave", "snowball-popper", "coach-champ", "power-pal", "eagle-eye", "phew", "spotless-stand",
         "gull-pals", "brolly-boss", "pineapple-rain", "big-rain", "team-spirit", "combo-master", "all-five", "faster-fun", "top-speed", "challenger", "grand-finale"]
UPG = {"au": "auto-slingshot", "ar": "faster-fling", "ap": "better-pineapples", "lm": "lime-launcher", "lm2": "more-limes", "lm3": "lots-of-limes", "gu": "gull-pals",
       "um": "paper-umbrellas", "ra": "pineapple-rain", "pz": "zippy", "pm": "mega", "ph": "cheer-up", "pf": "toasty"}


def standalone(face, motif):
    a, b = FACES[face]
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="96" height="96"><defs>'
            '<linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#f2b81e"/><stop offset="1" stop-color="#b87408"/></linearGradient>'
            f'<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>'
            '<circle cx="20" cy="21" r="18.4" fill="#2a120d" opacity=".16"/><circle cx="20" cy="20" r="18.4" fill="url(#r)"/><circle cx="20" cy="20" r="15.6" fill="url(#f)"/>'
            f'<path d="M8.6 15.2A13.2 13.2 0 0 1 28 8.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".4"/>{motif}</svg>')


def main():
    d = OUT.parent.parent.parent / "docs" / "icons"
    d.mkdir(exist_ok=True)
    for i, (f, m) in enumerate(ach()):
        (d / f"trophy-{i + 1:02d}-{NAMES[i]}.svg").write_text(standalone(f, m), encoding="utf-8")
    for k, (f, m) in upg().items():
        (d / f"{'pickup' if k in ('pz', 'pm', 'ph', 'pf') else 'upgrade'}-{UPG[k]}.svg").write_text(standalone(f, m), encoding="utf-8")
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>',
             '<linearGradient id="ix-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#f2b81e"/><stop offset="1" stop-color="#b87408"/></linearGradient>']
    for k, (a, b) in FACES.items():
        parts.append(f'<linearGradient id="ix-{k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>')
    parts.append("</defs>")
    for i, (f, m) in enumerate(ach()):
        parts.append(symbol(f"ia-{i}", f, m))
    for k, (f, m) in upg().items():
        parts.append(symbol(f"iu-{k}", f, m))
    parts.append("</svg>")
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print("wrote", OUT, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
