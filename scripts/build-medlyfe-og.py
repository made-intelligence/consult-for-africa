"""
The Medlyfe link preview card, 1200x630.

Without one, a link to the evening previews with whatever the root layout
declares, which is Consult for Africa's. An invitation that a guest forwards
should carry Medlyfe's mark, not its management consultant's.

  python3 scripts/build-medlyfe-og.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]

GREEN = (31, 58, 46)
GREEN_DEEP = (21, 41, 31)
LIME = (196, 215, 166)
MIST = (216, 227, 214)

W, H = 1200, 630


def _font(names: list[str], size: int):
    for n in names:
        for base in ("/System/Library/Fonts/Supplemental/", "/System/Library/Fonts/", "/Library/Fonts/"):
            p = Path(base) / n
            if p.exists():
                try:
                    return ImageFont.truetype(str(p), size)
                except OSError:
                    pass
    return ImageFont.load_default()


SERIF = ["Didot.ttc", "Georgia.ttf", "Times New Roman.ttf"]
SANS = ["HelveticaNeue.ttc", "Helvetica.ttc", "Arial.ttf"]
SANS_B = ["Arial Bold.ttf", "Helvetica.ttc", "HelveticaNeue.ttc"]


def mark(d: ImageDraw.ImageDraw, x: int, y: int, s: float) -> None:
    """Medlyfe's monogram, the same geometry as the favicon."""
    def r(x0, y0, w, h):
        d.rounded_rectangle(
            [x + x0 * s, y + y0 * s, x + (x0 + w) * s, y + (y0 + h) * s],
            radius=(w / 2) * s, fill=LIME,
        )
    r(0, 12, 15, 48)
    d.ellipse([x + 19 * s, y - 0.5 * s, x + 40 * s, y + 20.5 * s], fill=LIME)
    r(22, 27, 15, 46)
    r(44, 12, 15, 47)


def build(out: Path) -> None:
    im = Image.new("RGB", (W, H), GREEN)
    d = ImageDraw.Draw(im)

    # A soft diagonal, so the card is not a flat rectangle of one colour.
    for i in range(H):
        t = i / H
        d.line(
            [(0, i), (W, i)],
            fill=tuple(int(GREEN[k] + (GREEN_DEEP[k] - GREEN[k]) * t) for k in range(3)),
        )

    mark(d, 84, 74, 1.15)

    f_eyebrow = _font(SANS_B, 20)
    f_title = _font(SERIF, 112)
    f_sub = _font(SANS, 30)
    f_foot = _font(SANS, 24)

    d.text((84, 214), "M E D L Y F E   P R E S E N T S", font=f_eyebrow, fill=LIME)
    d.text((84, 252), "AGELESS", font=f_title, fill=(255, 255, 255))
    d.text((84, 392), "A New Era of Health, Beauty and Longevity", font=f_sub, fill=MIST)

    d.line([(84, 476), (W - 84, 476)], fill=(60, 92, 76), width=1)
    d.text(
        (84, 504),
        "Wednesday 21 October 2026   ·   Capital Club, Lagos",
        font=f_foot,
        fill=MIST,
    )

    d.rectangle([0, H - 7, W, H], fill=LIME)

    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, quality=92, optimize=True)
    print("wrote", out, im.size)


if __name__ == "__main__":
    build(ROOT / "public" / "medlyfe-og.jpg")
