#!/usr/bin/env python3
"""One card per speaker, cut from the invitation itself.

    python3 docs/ageless/speakers/build.py

A speaker given a card with their own face on it posts it. A speaker given
the event poster does not, because it is somebody else's. With the room still
mostly empty, six people with their own audiences is the cheapest reach there
is.

The design is not reinterpreted. The invitation is the artwork, so each card
keeps its border, its logos, its wordmark, its standfirst and its footer, and
only the six-tile grid is replaced by that speaker's own tile, enlarged. The
set cannot drift from the invitation, and nothing is redrawn in a font we do
not have.

Writes speaker-<slug>.png at 1080x1350.
"""
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
# The artwork the invitation emails serve, so a card and an email cannot
# differ. Taken from public/lyfe/ageless-invitation.jpg on main.
SOURCE = os.path.join(HERE, "invitation-source.jpg")

GREEN = (122, 143, 90)

# Where the six tiles sit on the invitation, found by looking rather than
# guessed: three columns of 220, two rows of about 257.
COLS = [(193, 413), (424, 644), (656, 876)]
ROWS = [(551, 810), (849, 1105)]

# Reading order on the invitation, left to right and top to bottom.
GRID = [["awosika", "giwa", "adenuga"], ["kpaduwa", "ajelabi", "odulana"]]

# The one line each of them is there for, from the running order, so a card
# and the stage cannot disagree.
SUBJECT = {
    "awosika": "Speaking to stress management, self care and longevity",
    "giwa": "Speaking to lifestyle and behaviour change for longevity",
    "adenuga": "Speaking to weight, metabolism and longevity",
    "kpaduwa": "Speaking to maintaining beauty, aesthetics and skin as we age",
    "ajelabi": "Opening the evening: can we live to 100 and still live well?",
    "odulana": "Chairing the panel",
}

# The clear area between the standfirst and the footer. Outside it the border,
# the logos and the type are left exactly as drawn.
BOX = (178, 512, 900, 1122)


def font(size):
    for n in ("Montserrat-Regular.ttf", "Arial.ttf", "Helvetica.ttc"):
        for base in ("/System/Library/Fonts/Supplemental/", "/System/Library/Fonts/", "/Library/Fonts/"):
            p = os.path.join(base, n)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except OSError:
                    pass
    return ImageFont.load_default()


def tiles(src):
    out = {}
    for r, (y0, y1) in enumerate(ROWS):
        for c, (x0, x1) in enumerate(COLS):
            out[GRID[r][c]] = src.crop((x0, y0, x1, y1))
    return out


def card(src, tile, subject):
    im = src.copy()
    d = ImageDraw.Draw(im)
    d.rectangle(BOX, fill=(255, 255, 255))

    scale = 1.92
    big = tile.resize((int(tile.width * scale), int(tile.height * scale)), Image.LANCZOS)
    bx = (im.width - big.width) // 2
    by = BOX[1] + 12
    im.paste(big, (bx, by))

    f = font(23)
    words, line, lines = subject.split(), "", []
    while words:
        trial = (line + " " + words[0]).strip()
        if d.textlength(trial, font=f) <= 700:
            line = trial
            words.pop(0)
        else:
            lines.append(line)
            line = ""
    if line:
        lines.append(line)

    y = by + big.height + 22
    for ln in lines:
        w = d.textlength(ln, font=f)
        d.text(((im.width - w) / 2, y), ln, font=f, fill=GREEN)
        y += 30
    return im


if __name__ == "__main__":
    src = Image.open(SOURCE).convert("RGB")
    for slug, tile in tiles(src).items():
        out = os.path.join(HERE, f"speaker-{slug}.png")
        card(src, tile, SUBJECT[slug]).save(out)
        print("  wrote", os.path.relpath(out, ROOT))
