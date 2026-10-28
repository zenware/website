#!/usr/bin/env python3
"""Check every text/background pair in zenware's palette.

    python3 themes/zenware/scripts/check-contrast.py

Reads the colors straight out of sass/style.scss, so there is nothing to keep
in sync. Reports both WCAG 2 contrast ratio and APCA Lc (WCAG 3 candidate).

Targets (see README → Design decisions):
  prose  (body, links, muted): WCAG >= 7.0 (AAA, SC 1.4.6) and APCA |Lc| >= 75
  code tokens:                 WCAG >= 4.5 (AA,  SC 1.4.3)
Exits non-zero if any pair misses its target.
"""
import pathlib
import re
import sys

SCSS = pathlib.Path(__file__).resolve().parent.parent / "sass" / "style.scss"

PROSE = [("fg", "bg"), ("muted", "bg"), ("link", "bg"), ("visited", "bg")]
CODE = [("code-fg", "code-bg"), ("fg", "code-bg"), ("link", "code-bg")] + [
    (t, "code-bg")
    for t in ("t-com", "t-punct", "t-kw", "t-str", "t-num", "t-fn",
              "t-type", "t-op", "t-param", "t-red")
]


def palettes(src):
    light = re.search(r":root\s*\{(.*?)\}", src, re.S).group(1)
    dark = re.search(r"prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{(.*?)\}", src, re.S).group(1)
    grab = lambda block: dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})", block))
    l = grab(light)
    return {"light": l, "dark": {**l, **grab(dark)}}


def rgb(h):
    return [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]


def wcag(fg, bg):
    def lum(c):
        r, g, b = (x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in rgb(c))
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    a, b = sorted((lum(fg), lum(bg)), reverse=True)
    return (a + 0.05) / (b + 0.05)


def apca(fg, bg):
    """APCA-W3 0.0.98G-4g. Returns Lc (positive: dark on light)."""
    def y(c):
        r, g, b = (x ** 2.4 for x in rgb(c))
        v = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
        return v + (0.022 - v) ** 1.414 if v < 0.022 else v
    yt, yb = y(fg), y(bg)
    if abs(yb - yt) < 0.0005:
        return 0.0
    if yb > yt:
        s = (yb ** 0.56 - yt ** 0.57) * 1.14
        return 0.0 if s < 0.1 else (s - 0.027) * 100
    s = (yb ** 0.65 - yt ** 0.62) * 1.14
    return 0.0 if s > -0.1 else (s + 0.027) * 100


def main():
    fails = 0
    for mode, pal in palettes(SCSS.read_text()).items():
        print(f"\n{mode:>5}  {'pair':<22} {'WCAG':>6} {'APCA':>6}")
        for pairs, min_wcag, min_lc in ((PROSE, 7.0, 75), (CODE, 4.5, 0)):
            for fg, bg in pairs:
                w, lc = wcag(pal[fg], pal[bg]), apca(pal[fg], pal[bg])
                ok = w >= min_wcag and abs(lc) >= min_lc
                fails += not ok
                print(f"{'ok' if ok else 'FAIL':>5}  {fg + ' / ' + bg:<22} {w:6.2f} {lc:6.1f}")
    print(f"\n{fails} failing pair(s)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
