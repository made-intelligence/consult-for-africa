#!/usr/bin/env python3
"""A flyer per speaker, in the invitation's own style, at full resolution.

    python3 docs/ageless/speakers/build_flyers.py

The invitation is the artwork: its border, logos, wordmark, standfirst and
footer are kept exactly as drawn. The six-tile grid is replaced by one large
tile built the way the designer built the small ones (a colour ground, the
portrait cut out with the head breaking the top edge, a name band below), but
from each speaker's full-size photograph rather than an enlarged 220px tile,
so the face is sharp at 1080 wide.

Cut-outs come from macOS person segmentation (lift.swift, compiled once):

    swiftc -O lift.swift -o /tmp/lift
    /tmp/lift public/lyfe/gbemi-portrait.jpg cutouts/gbemi-mask.png

Writes flyer-<slug>.png at 1080x1350.
"""
import os

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
SOURCE = os.path.join(HERE, "invitation-source.jpg")
FONTS = os.path.join(HERE, "fonts")

# Sampled from the invitation.
GREEN = (148, 178, 92)
YELLOW = (243, 176, 35)
NAVY = (11, 21, 30)
OLIVE = (97, 116, 70)
TEXT_GREEN = (94, 119, 61)
WHITE = (255, 255, 255)

# The clear area between the standfirst and the footer.
BOX = (178, 505, 902, 1124)

# Tile geometry. The head may rise HEAD_ROOM above the tile, as on the invitation.
TILE_W, TILE_H, BAND_H, RADIUS = 460, 500, 128, 26
TILE_X = (1080 - TILE_W) // 2
TILE_Y = 560
HEAD_ROOM = 42

SPEAKERS = [
    # slug, photo, mask, ground, band, name, role lines, subject
    dict(slug="awosika", photo="public/lyfe/joycee-portrait.jpg", mask="joycee",
         ground=GREEN, band=YELLOW, name="Mrs. Joycee Awosika",
         role=["Founder & CEO,", "ORIKI Group"],
         subject="Speaking to stress management, self care and longevity", frame=0.60),
    dict(slug="giwa", photo="public/lyfe/gbemi-portrait.jpg", mask="gbemi",
         ground=YELLOW, band=OLIVE, name="Ms. Gbemi Giwa",
         role=["Founder, African", "Fat Loss Method"],
         subject="Speaking to lifestyle and behaviour change for longevity", frame=0.62,
         # Her photograph crops the hair flat at the top, so that edge sits on
         # the tile's top edge instead of rising above it.
         room=0),
    dict(slug="adenuga", photo="public/lyfe/adenuga-portrait.jpg", mask="adenuga",
         ground=GREEN, band=NAVY, name="Dr. Timi Adenuga",
         role=["Lead Bariatric &", "Laparoscopic Surgeon"],
         subject="Speaking to weight, metabolism and longevity", frame=0.62),
    dict(slug="kpaduwa", photo="docs/lyfe-rounds/chinwe-smiling.png", mask="chinwe-smiling",
         ground=YELLOW, band=NAVY, name="Dr. Chinwe, MD, FACS",
         role=["Founder,", "KP Plastic Surgery"],
         subject="Speaking to maintaining beauty, aesthetics and skin as we age", frame=1.0),
    dict(slug="ajelabi", photo="public/lyfe/adedotun-portrait.jpg", mask="adedotun",
         ground=GREEN, band=YELLOW, name="Dr. Adedotun Ajelabi",
         role=["Head of Medical", "Services, MedLYFE"],
         subject="Opening the evening: can we live to 100 and still live well?", frame=0.62),
    dict(slug="odulana", photo="public/lyfe/debo-portrait.jpg", mask="debo",
         ground=YELLOW, band=OLIVE, name="Dr. Debo Odulana",
         role=["Founding Partner,", "Consult for Africa"],
         subject="Chairing the panel", frame=0.82),
]


def font(weight, size):
    return ImageFont.truetype(os.path.join(FONTS, f"Poppins-{weight}.ttf"), size)


def rounded(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    return m


def cutout(sp):
    """The speaker cut out, scaled so head-to-chest fills the photo area."""
    photo = Image.open(os.path.join(ROOT, sp["photo"])).convert("RGB")
    mask = Image.open(os.path.join(HERE, "cutouts", f"{sp['mask']}-mask.png")).convert("L")
    mask = mask.resize(photo.size).filter(ImageFilter.GaussianBlur(0.8))
    # Drop faint halo so the colour ground does not show grey fringes.
    mask = mask.point(lambda v: 0 if v < 40 else min(255, int((v - 40) * 255 / 175)))
    box = mask.getbbox()
    top, bottom = box[1], photo.height
    # The visible height runs from HEAD_ROOM above the tile to the band.
    room = sp.get("room", HEAD_ROOM)
    visible = room + TILE_H - BAND_H
    scale = visible / ((bottom - top) * sp["frame"])
    w, h = int(photo.width * scale), int(photo.height * scale)
    photo = photo.resize((w, h), Image.LANCZOS)
    mask = mask.resize((w, h), Image.LANCZOS)
    # Centre on the head: the middle of the mask across its top fifth.
    head = mask.crop((0, int(top * scale), w, int((top + (bottom - top) * 0.2) * scale))).getbbox()
    cx = (head[0] + head[2]) // 2 if head else w // 2
    x = TILE_X + TILE_W // 2 - cx
    y = TILE_Y - room - int(top * scale)
    return photo, mask, (x, y)


def centred(d, text, f, cy, fill):
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    d.text((540 - (r - l) // 2 - l, cy - (b - t) // 2 - t), text, font=f, fill=fill)


def flyer(src, sp):
    im = src.copy().convert("RGB")
    d = ImageDraw.Draw(im)
    d.rectangle(BOX, fill=WHITE)

    # The ground, rounded, with the band across its foot.
    tile = Image.new("RGB", (TILE_W, TILE_H), sp["ground"])
    ImageDraw.Draw(tile).rectangle((0, TILE_H - BAND_H, TILE_W, TILE_H), fill=sp["band"])
    im.paste(tile, (TILE_X, TILE_Y), rounded((TILE_W, TILE_H), RADIUS))

    # The portrait: inside the tile's width, from HEAD_ROOM above it to the band.
    photo, mask, (x, y) = cutout(sp)
    clip = Image.new("L", im.size, 0)
    ImageDraw.Draw(clip).rectangle(
        (TILE_X, TILE_Y - HEAD_ROOM, TILE_X + TILE_W - 1, TILE_Y + TILE_H - BAND_H - 1), fill=255
    )
    # Below the tile's top edge the photo also respects the rounded corners.
    corners = Image.new("L", im.size, 255)
    corners.paste(0, (TILE_X, TILE_Y, TILE_X + TILE_W, TILE_Y + TILE_H))
    corners.paste(rounded((TILE_W, TILE_H), RADIUS), (TILE_X, TILE_Y))
    clip = ImageChops.multiply(clip, corners)
    layer = Image.new("RGB", im.size)
    layer.paste(photo, (x, y))
    full = Image.new("L", im.size, 0)
    full.paste(mask, (x, y))
    im.paste(layer, (0, 0), ImageChops.multiply(full, clip))

    d = ImageDraw.Draw(im)
    band_mid = TILE_Y + TILE_H - BAND_H // 2
    centred(d, sp["name"], font("ExtraBold", 34), band_mid - 30, WHITE)
    for i, line in enumerate(sp["role"]):
        centred(d, line, font("Regular", 23), band_mid + 14 + i * 28, WHITE)

    centred(d, sp["subject"], font("Medium", 22), TILE_Y + TILE_H + 38, TEXT_GREEN)
    return im


def main():
    src = Image.open(SOURCE).convert("RGB")
    for sp in SPEAKERS:
        out = os.path.join(HERE, f"flyer-{sp['slug']}.png")
        flyer(src, sp).save(out, optimize=True)
        print("wrote", os.path.relpath(out, ROOT))


if __name__ == "__main__":
    main()
