"""
A personal access pass for each AGELESS guest, in the invitation's own style.

The top of the pass is cut from the printed invitation itself, so the logos and
the wordmark are the real ones rather than a redraw. Below it, the guest's
name, how many the pass admits, and a code the door can check against the list.

  python3 scripts/build-ageless-passes.py guests.json out_dir

guests.json is [{"key": ..., "name": ..., "admits": 2, "code": "AGL-7K3P"}].
Writes out_dir/<key>.png, 1080 x 1350, one per guest.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
INVITATION = ROOT / "public" / "lyfe" / "ageless-invitation.jpg"

SANS = "/System/Library/Fonts/HelveticaNeue.ttc"
# HelveticaNeue.ttc faces: 0 regular, 1 bold, 7 light, 10 medium.
REG, BOLD, LIGHT, MED = 0, 1, 7, 10

# Sampled from the invitation, not from the web palette.
OLIVE = "#65734E"
OLIVE_DARK = "#4A5638"
SAGE = "#9CA786"
MUSTARD = "#E5B03F"
INK = "#1E2418"
MUTED = "#6B7260"
PAPER = "#FFFFFF"
MIST = "#F4F6EF"

W, H = 1080, 1350

DATE = "WEDNESDAY, 21 OCTOBER 2026"
TIMES = "Arrival 6:00 PM  ·  Programme 6:30 PM  ·  Close 9:30 PM"
VENUE = "Capital Club Lagos"
ADDRESS = "6 Elsie Femi Pearse Street, Victoria Island, Lagos"


def font(index: int, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(SANS, size, index=index)


def centred(draw: ImageDraw.ImageDraw, y: int, s: str, f, fill, track: int = 0) -> int:
    """Draw s centred at y, letterspaced by track. Returns the line height."""
    if track:
        widths = [draw.textbbox((0, 0), ch, font=f)[2] for ch in s]
        total = sum(widths) + track * (len(s) - 1)
        x = (W - total) // 2
        for ch, w in zip(s, widths):
            draw.text((x, y), ch, font=f, fill=fill)
            x += w + track
    else:
        w = draw.textbbox((0, 0), s, font=f)[2]
        draw.text(((W - w) // 2, y), s, font=f, fill=fill)
    box = draw.textbbox((0, 0), s, font=f)
    return box[3] - box[1]


def fit(draw: ImageDraw.ImageDraw, s: str, index: int, size: int, max_w: int) -> ImageFont.FreeTypeFont:
    """The largest face at or under size that keeps s inside max_w."""
    while size > 28:
        f = font(index, size)
        if draw.textbbox((0, 0), s, font=f)[2] <= max_w:
            return f
        size -= 2
    return font(index, size)


def build(guest: dict, out: Path) -> None:
    src = Image.open(INVITATION).convert("RGB")
    im = Image.new("RGB", (W, H), PAPER)

    # The invitation's frame, its swirled border, kept whole; then the inside
    # cleared below the wordmark so the pass reads as the same card.
    im.paste(src, (0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((40, 400, W - 40, H - 44), fill=PAPER)

    # Swap "INVITATION TO" for the pass label, in the same tracked caps.
    d.rectangle((250, 225, 830, 275), fill=PAPER)
    centred(d, 232, "ACCESS PASS TO", font(LIGHT, 34), INK, track=22)

    y = 430
    centred(d, y, "THIS PASS ADMITS", font(MED, 22), MUTED, track=6)
    y += 44
    name = guest["name"].strip()
    nf = fit(d, name, BOLD, 74, W - 220)
    y += centred(d, y, name, nf, OLIVE_DARK) + 26

    admits = int(guest.get("admits") or 1)
    plus = admits - 1
    line = "and one guest" if plus == 1 else (f"and {plus} guests" if plus > 1 else "")
    if line:
        y += centred(d, y, line, font(REG, 34), INK) + 18
    # The mustard rule from the invitation's highlight, as a divider.
    d.rectangle((W // 2 - 60, y + 14, W // 2 + 60, y + 19), fill=MUSTARD)
    y += 52

    # Date block on a pale ground, the way the invitation sets its details.
    d.rounded_rectangle((150, y, W - 150, y + 190), radius=22, fill=MIST)
    centred(d, y + 30, DATE, font(BOLD, 34), OLIVE)
    centred(d, y + 82, TIMES, font(REG, 24), INK)
    centred(d, y + 122, VENUE, font(MED, 26), INK)
    centred(d, y + 156, ADDRESS, font(REG, 21), MUTED)
    y += 230

    # QR and code side by side. The QR carries the code and the name, so a
    # phone camera at the door shows who it is without any app or network.
    qr = qrcode.QRCode(border=1, box_size=10, error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(f"AGELESS {guest['code']} {name} admits {admits}")
    qr.make(fit=True)
    q = qr.make_image(fill_color=OLIVE_DARK, back_color=PAPER).convert("RGB").resize((250, 250), Image.NEAREST)
    qx = 190
    im.paste(q, (qx, y))
    tx = qx + 250 + 50
    d.text((tx, y + 40), "PASS CODE", font=font(MED, 22), fill=MUTED)
    d.text((tx, y + 74), guest["code"], font=font(BOLD, 58), fill=INK)
    d.text((tx, y + 150), "Show this at the door,", font=font(REG, 24), fill=INK)
    d.text((tx, y + 182), "on your phone or printed.", font=font(REG, 24), fill=INK)

    centred(d, H - 108, "Personal to the guest named. Not transferable.", font(REG, 20), MUTED)

    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG", optimize=True)


def main() -> None:
    guests = json.loads(Path(sys.argv[1]).read_text())
    out_dir = Path(sys.argv[2])
    for g in guests:
        build(g, out_dir / f"{g['key']}.png")
        print(out_dir / f"{g['key']}.png")


if __name__ == "__main__":
    main()
