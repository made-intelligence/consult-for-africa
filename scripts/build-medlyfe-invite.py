"""
Build the Medlyfe invitation to the evening of Thursday 15 October 2026.

Two versions, exactly as the client wrote them:

  individual   "Requests the pleasure of the company of [Name]"
  group        "Invites [Organisation]. [N] places reserved by name."

Each renders as a print PDF (A5 portrait) and a 1080 x 1350 image for
WhatsApp and the feed. Personalise one at a time with --name or --org, or
hand it a CSV and it writes one per guest, which is what a hand delivered
invitation programme actually needs.

BRANDING NOTE, READ THIS.

The evening is Medlyfe's. Medlyfe is the trading, licensed, bookable entity
and it hosts; Lyfe Plastics is introduced on the night, in the footer, small.
That billing is the compliance position, not a courtesy, so this artwork wears
Medlyfe livery throughout and the Lyfe palette appears nowhere on it.

The palette is sampled from Medlyfe's own poster: blue 336276, pale chartreuse
C4D7A6, white. The mark is rebuilt from measured geometry, three pill bars
with a dot over the middle one, because a knockout lifted from a flattened
JPEG looked exactly like a knockout lifted from a flattened JPEG. The wordmark
is set in the nearest available pairing, a light serif against a heavy
grotesque.

**The real Medlyfe logo file should replace the drawn one.** Drop a
transparent PNG or SVG at docs/brand/medlyfe-logo.png and this picks it up
automatically.

Run:
  python3 scripts/build-medlyfe-invite.py
  python3 scripts/build-medlyfe-invite.py --name "Mrs Folake Adeyemi"
  python3 scripts/build-medlyfe-invite.py --org "Ikoyi Club 1938 Ladies Section" --places 8
  python3 scripts/build-medlyfe-invite.py --csv guests.csv
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path
from urllib.parse import quote

import qrcode
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A5
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as canvaslib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "lyfe-creative" / "invitations"
PORTRAIT = ROOT / "public" / "lyfe" / "chinwe-portrait.jpg"
REAL_LOGO = ROOT / "docs" / "brand" / "medlyfe-logo.png"

# ---- Medlyfe palette, sampled from their poster -----------------------------
BLUE = "#336276"
BLUE_DEEP = "#1E3C4A"
BLUE_DARK = "#162C36"
BLUE_SOFT = "#7F9EA1"
LIME = "#C4D7A6"
LIME_SOFT = "#DCE8C8"
PAPER = "#FFFFFF"
MIST = "#D5E2E6"

DISPLAY = "/System/Library/Fonts/Supplemental/Didot.ttc"
DISPLAY_I = 0
SANS = "/System/Library/Fonts/HelveticaNeue.ttc"
SANS_R, SANS_B = 0, 1

# ---- the evening, as written ------------------------------------------------
HOST = "Medlyfe Wellness and Longevity Centre"
WITH_WHOM = "Dr Chinwe Kpaduwa, MD FACS"
TAGLINE = "Feel Good, Look Good, Live Better."
STANDFIRST = "One evening. One conversation about how you feel and how you look."
SESSION = "The Art of Looking Like Yourself"
BLURB = ("An evening exploring wellness, longevity, aesthetics and the connection "
         "between feeling well and looking like yourself.")
DATE = "Thursday, 15 October 2026"
COCKTAILS = "6:30 PM"
PROGRAMME = "7:15 PM"
CLOSE = "9:30 PM"
VENUE = "Greenhouse, Lagos"
RSVP_BY = "12 October"
FOOTER = "Medlyfe introduces Lyfe Plastics & Dermatology."

WHATSAPP = "2349138138553"
PHONE_DISPLAY = "+234 913 813 8553"


def wa(msg: str) -> str:
    return "https://wa.me/%s?text=%s" % (WHATSAPP, quote(msg))


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "invitation"


# ============================================================ raster (PNG) ===

def font(path, index, size):
    return ImageFont.truetype(path, size, index=index)


def tw(d, s, f):
    return int(d.textbbox((0, 0), s, font=f)[2])


def wrap(d, s, f, max_w):
    words, lines, cur = s.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if tw(d, t, f) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def tracked(d, xy, s, f, fill, track=6):
    x, y = xy
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill)
        x += tw(d, ch, f) + track
    return x


def gradient(size, top, bottom):
    """Their poster is a soft vertical wash, so the invitation is too."""
    w, h = size
    img = Image.new("RGB", (1, h))
    t = tuple(int(top[i:i + 2], 16) for i in (1, 3, 5))
    b = tuple(int(bottom[i:i + 2], 16) for i in (1, 3, 5))
    px = img.load()
    for y in range(h):
        k = y / max(1, h - 1)
        px[0, y] = tuple(round(t[i] + (b[i] - t[i]) * k) for i in range(3))
    return img.resize((w, h), Image.BILINEAR)


def draw_mark(d, x, y, h, colour=PAPER):
    """
    Medlyfe's mark, from measured geometry: three pill bars, the middle one
    dropped and carrying a dot. Source ratio is 59 wide by 73 tall.
    """
    s = h / 73.0
    def pill(px, py, pw, ph):
        d.rounded_rectangle([x + px * s, y + py * s, x + (px + pw) * s, y + (py + ph) * s],
                            radius=(pw * s) / 2, fill=colour)
    pill(0, 12, 15, 48)
    r = 10.5 * s
    cx, cy = x + 29.5 * s, y + 10 * s
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=colour)
    pill(22, 27, 15, 46)
    pill(44, 12, 15, 47)
    return 59 * s


def draw_lockup(img, d, x, y, mark_h=54):
    """Mark plus wordmark. Uses the real logo file when one is present."""
    if REAL_LOGO.exists():
        logo = Image.open(REAL_LOGO).convert("RGBA")
        scale = (mark_h * 1.5) / logo.height
        logo = logo.resize((round(logo.width * scale), round(logo.height * scale)), Image.LANCZOS)
        img.paste(logo, (int(x), int(y)), logo)
        return logo.width

    w = draw_mark(d, x, y, mark_h)
    tx = x + w + mark_h * 0.34
    f_med = font(DISPLAY, DISPLAY_I, int(mark_h * 0.80))
    f_lyfe = font(SANS, SANS_B, int(mark_h * 0.78))
    base = y + mark_h * 0.16
    d.text((tx, base), "med", font=f_med, fill=PAPER)
    tx2 = tx + tw(d, "med", f_med) + mark_h * 0.03
    d.text((tx2, base + mark_h * 0.045), "LYFE", font=f_lyfe, fill=PAPER)
    end = tx2 + tw(d, "LYFE", f_lyfe)
    f_sub = font(SANS, SANS_R, int(mark_h * 0.235))
    d.text((tx + 2, base + mark_h * 0.86), "Wellness and Longevity Centre", font=f_sub, fill=PAPER)
    return end - x


# ---------------------------------------------------------------- ornament ---

def mark_tile(size, colour=(255, 255, 255), alpha=14):
    """
    The Medlyfe mark, drawn once into a transparent tile so it can be repeated
    as a monogram field. Luxury houses pattern their own mark rather than
    importing an ornament, and Medlyfe already has a mark worth repeating.
    """
    t = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(t)
    h = size * 0.46
    w = h * 59 / 73
    draw_mark(d, (size - w) / 2, (size - h) / 2, h, colour=colour + (alpha,))
    return t


def monogram_field(W, H, tile=132, alpha=13):
    """A half dropped repeat, which reads as cloth rather than as a grid."""
    field = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    t = mark_tile(tile, alpha=alpha)
    rows = H // tile + 2
    cols = W // tile + 2
    for r in range(rows):
        off = (tile // 2) if r % 2 else 0
        for c in range(cols):
            field.alpha_composite(t, (c * tile - off, r * tile))
    return field


def halo(W, H, cx, cy, radius, colour=(255, 255, 255), peak=30):
    """
    The soft bloom behind the lockup on their own poster. Drawn small and
    scaled up, because a per pixel radial gradient at this size is slow and
    looks no better.
    """
    s = 180
    g = Image.new("L", (s, s), 0)
    gd = ImageDraw.Draw(g)
    for i in range(s // 2, 0, -1):
        k = 1 - (i / (s / 2))
        gd.ellipse([s / 2 - i, s / 2 - i, s / 2 + i, s / 2 + i], fill=int(peak * (k ** 2.2)))
    g = g.resize((radius * 2, radius * 2), Image.BILINEAR)
    layer = Image.new("RGBA", (W, H), colour + (0,))
    layer.putalpha(0)
    tint = Image.new("RGBA", (radius * 2, radius * 2), colour + (255,))
    tint.putalpha(g)
    layer.alpha_composite(tint, (int(cx - radius), int(cy - radius)))
    return layer


def grain(W, H, strength=7):
    """A whisper of noise. Flat digital gradients read cheap when printed."""
    import random
    n = Image.new("L", (W // 2, H // 2))
    px = n.load()
    rnd = random.Random(7)
    for y in range(n.height):
        for x in range(n.width):
            px[x, y] = rnd.randint(0, strength)
    n = n.resize((W, H), Image.BILINEAR)
    layer = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    layer.putalpha(n)
    return layer


def rule_with_diamond(d, cx, y, half=92, colour=LIME, lw=1):
    """A centred hairline broken by a small diamond. The invitation's comma."""
    d.line([(cx - half, y), (cx - 13, y)], fill=colour, width=lw)
    d.line([(cx + 13, y), (cx + half, y)], fill=colour, width=lw)
    d.polygon([(cx, y - 5), (cx + 5, y), (cx, y + 5), (cx - 5, y)], fill=colour)


def corner_marks(d, inset, W, H, length=34, colour=LIME, lw=1):
    """Inner corner brackets, set in from the frame. A bookbinding cue."""
    o = inset + 15
    for (x, y, dx, dy) in [(o, o, 1, 1), (W - o, o, -1, 1), (o, H - o, 1, -1), (W - o, H - o, -1, -1)]:
        d.line([(x, y), (x + dx * length, y)], fill=colour, width=lw)
        d.line([(x, y), (x, y + dy * length)], fill=colour, width=lw)


def arched_portrait(w, h):
    """
    Her portrait in an arch. A niche reads as a portrait that belongs in the
    invitation; a rectangle reads as a photograph dropped on top of one.
    """
    p = Image.open(PORTRAIT).convert("RGB")
    tr = w / h
    nh = int(p.width / tr)
    if nh <= p.height:
        top = int((p.height - nh) * 0.06)
        p = p.crop((0, top, p.width, top + nh))
    else:
        nw = int(p.height * tr)
        p = p.crop(((p.width - nw) // 2, 0, (p.width + nw) // 2, p.height))
    p = p.resize((w, h), Image.LANCZOS)

    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    r = w / 2
    md.pieslice([0, 0, w, w], 180, 360, fill=255)
    md.rectangle([0, r, w, h], fill=255)
    # Soften the foot so she rises out of the ground rather than sitting on it.
    fb = int(h * 0.26)
    mpx = mask.load()
    for y in range(h - fb, h):
        k = (h - y) / fb
        k = k * k * (3 - 2 * k)
        for x in range(w):
            mpx[x, y] = int(mpx[x, y] * k)
    p.putalpha(mask)
    return p


def portrait_panel(w, h):
    """
    Her portrait, cropped to fill and feathered into the blue on the left so
    it sits in the layout rather than on top of it. The source is already a
    near black studio background, which is why this works at all.
    """
    p = Image.open(PORTRAIT).convert("RGB")
    sr, tr = p.width / p.height, w / h
    if sr > tr:
        nw = int(p.height * tr)
        p = p.crop(((p.width - nw) // 2, 0, (p.width + nw) // 2, p.height))
    else:
        nh = int(p.width / tr)
        # Bias the crop upward so the face is not cut at the chin.
        top = int((p.height - nh) * 0.18)
        p = p.crop((0, top, p.width, top + nh))
    p = p.resize((w, h), Image.LANCZOS)

    # Feather left, top and bottom so the panel dissolves into the wash
    # instead of sitting on it as a rectangle. Multiplied rather than drawn,
    # so the corners fade on both axes at once.
    import math
    mask = Image.new("L", (w, h))
    px = mask.load()
    fx = max(1, int(w * 0.30))
    ft = max(1, int(h * 0.16))
    fb = max(1, int(h * 0.10))
    for y in range(h):
        ky = 1.0
        if y < ft:
            ky = y / ft
        if y > h - fb:
            ky = min(ky, (h - y) / fb)
        ky = ky * ky * (3 - 2 * ky)  # smoothstep, so the edge has no seam
        for x in range(w):
            kx = x / fx if x < fx else 1.0
            kx = kx * kx * (3 - 2 * kx)
            px[x, y] = int(255 * kx * ky)
    p.putalpha(mask)
    return p


def centred(d, text, f, cx, y, fill):
    d.text((cx - tw(d, text, f) / 2, y), text, font=f, fill=fill)


def centred_block(d, text, f, cx, y, fill, max_w, lead):
    for ln in wrap(d, text, f, max_w):
        centred(d, ln, f, cx, y, fill)
        y += lead
    return y


def centred_tracked(d, text, f, cx, y, fill, track=5):
    w = sum(tw(d, ch, f) + track for ch in text) - track
    tracked(d, (cx - w / 2, y), text, f, fill, track)
    return w


def build_png(kind, name, places, out_path):
    """
    Composed as a formal invitation rather than a poster: centred, generous,
    patterned, with her portrait in an arch.

    Laid out by measuring every block first and giving the arch whatever is
    left between the head and the foot. Pinning the portrait to a fraction of
    the page and hoping the text cleared it is what put the standfirst through
    the arch and the guest's name through the particulars.
    """
    W, H = 1080, 1350
    cx = W // 2
    M = 96

    probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))

    f_eye = font(SANS, SANS_B, 17)
    f_h = font(DISPLAY, DISPLAY_I, 68)
    f_s = font(DISPLAY, DISPLAY_I + 1, 25)
    f_lab = font(SANS, SANS_R, 19)
    f_nm = font(SANS, SANS_B, 23)
    f_ses = font(DISPLAY, DISPLAY_I + 1, 34)
    f_pl = font(SANS, SANS_R, 18)
    f_pn = font(DISPLAY, DISPLAY_I, 37)

    tag_lines = wrap(probe, TAGLINE, f_h, W - 2 * M - 60)
    sf_lines = wrap(probe, STANDFIRST, f_s, int(W * 0.62))
    ses_lines = wrap(probe, "\u201C" + SESSION + "\u201D", f_ses, int(W * 0.72))
    name_lines = wrap(probe, name, f_pn, int(W * 0.72))

    # Head: lockup, eyebrow, tagline, standfirst, rule.
    head_h = 112 + 50 + 76 * len(tag_lines) + 12 + 34 * len(sf_lines) + 30
    # Below the arch: her conversation, then the personalisation panel.
    conv_h = 26 + 28 + 38 + 42 * len(ses_lines)
    pers_h = 30 + 26 + 30 + 44 * len(name_lines) + (32 if kind == "group" else 0) + 16
    foot_h = 164

    top = M + 26
    avail = (H - M - foot_h - 26) - (top + head_h + conv_h + pers_h)
    ah = max(250, min(int(H * 0.30), avail - 40))
    aw = int(ah * 0.82)
    ay = top + head_h + 22
    ax = cx - aw // 2

    img = gradient((W, H), BLUE, BLUE_DARK).convert("RGBA")
    img.alpha_composite(monogram_field(W, H, tile=150, alpha=6))
    img.alpha_composite(halo(W, H, cx, int(H * 0.145), 340, peak=16))
    img.alpha_composite(arched_portrait(aw, ah), (ax, ay))

    d = ImageDraw.Draw(img)

    # A hairline arch a few pixels proud of the photograph, which is the
    # detail that makes it look set into the page rather than laid on it.

    inset = 44
    d.rectangle([inset, inset, W - inset, H - inset], outline=LIME + "99", width=1)

    # ---- head
    y = top
    draw_lockup_centred(img, d, cx, y, mark_h=58)
    y += 112
    centred_tracked(d, "WITH " + WITH_WHOM.upper(), f_eye, cx, y, LIME, track=5)
    y += 50
    for ln in tag_lines:
        centred(d, ln, f_h, cx, y, PAPER)
        y += 76
    y += 12
    for ln in sf_lines:
        centred(d, ln, f_s, cx, y, LIME_SOFT)
        y += 34

    # ---- below the arch
    y = ay + ah + 26
    centred(d, "In conversation with", f_lab, cx, y, MIST)
    y += 28
    centred(d, WITH_WHOM, f_nm, cx, y, PAPER)
    y += 38
    for ln in ses_lines:
        centred(d, ln, f_ses, cx, y, LIME)
        y += 42

    # ---- the personalisation, ruled above and below
    y += 30
    d.line([(cx - 150, y), (cx + 150, y)], fill=LIME + "77", width=1)
    y += 26
    if kind == "group":
        centred(d, "Invites", f_pl, cx, y, LIME)
        y += 30
        for ln in name_lines:
            centred(d, ln, f_pn, cx, y, PAPER)
            y += 44
        centred(d, f"{places} places reserved by name", f_pl, cx, y + 2, MIST)
        y += 32
    else:
        centred(d, "Requests the pleasure of the company of", f_pl, cx, y, LIME)
        y += 30
        for ln in name_lines:
            centred(d, ln, f_pn, cx, y, PAPER)
            y += 44
    y += 16
    d.line([(cx - 150, y), (cx + 150, y)], fill=LIME + "77", width=1)

    # ---- the particulars, at the foot. Pinned, but never above the flow,
    # because a closing rule through the date is worse than a tight margin.
    by = max(H - M - foot_h + 16, y + 34)
    centred(d, DATE, font(SANS, SANS_B, 21), cx, by, PAPER)
    by += 32
    f_dv = font(SANS, SANS_R, 18)
    centred(d, f"Cocktails {COCKTAILS}   \u00b7   Programme {PROGRAMME}   \u00b7   Close {CLOSE}", f_dv, cx, by, MIST)
    by += 26
    centred(d, VENUE, f_dv, cx, by, MIST)
    by += 32
    rsvp = (f"Please RSVP with attendee names by {RSVP_BY}" if kind == "group"
            else f"Personal invitation.  RSVP by {RSVP_BY}")
    centred(d, rsvp, font(SANS, SANS_R, 17), cx, by, LIME_SOFT)
    by += 25
    centred(d, PHONE_DISPLAY, font(SANS, SANS_B, 20), cx, by, LIME)

    centred(d, FOOTER, font(SANS, SANS_R, 14), cx, max(H - M + 16, by + 34), BLUE_SOFT)

    img.alpha_composite(grain(W, H, strength=5))
    img.convert("RGB").save(out_path, "PNG", optimize=True)
    return out_path


def draw_lockup_centred(img, d, cx, y, mark_h=58):
    """The lockup, measured first so it can be centred rather than guessed at."""
    if REAL_LOGO.exists():
        logo = Image.open(REAL_LOGO).convert("RGBA")
        scale = (mark_h * 1.5) / logo.height
        logo = logo.resize((round(logo.width * scale), round(logo.height * scale)), Image.LANCZOS)
        img.paste(logo, (int(cx - logo.width / 2), int(y)), logo)
        return logo.width

    f_med = font(DISPLAY, DISPLAY_I, int(mark_h * 0.80))
    f_lyfe = font(SANS, SANS_B, int(mark_h * 0.78))
    mw = 59 * (mark_h / 73.0)
    gap = mark_h * 0.34
    total = mw + gap + tw(d, "med", f_med) + mark_h * 0.03 + tw(d, "LYFE", f_lyfe)
    x = cx - total / 2

    draw_mark(d, x, y, mark_h)
    tx = x + mw + gap
    base = y + mark_h * 0.16
    d.text((tx, base), "med", font=f_med, fill=PAPER)
    tx2 = tx + tw(d, "med", f_med) + mark_h * 0.03
    d.text((tx2, base + mark_h * 0.045), "LYFE", font=f_lyfe, fill=PAPER)

    f_sub = font(SANS, SANS_R, int(mark_h * 0.215))
    centred_tracked(d, "WELLNESS AND LONGEVITY CENTRE", f_sub, cx, y + mark_h * 1.02, PAPER, track=2.4)
    return total


# ============================================================== print (PDF) ==

def pdf_wrap(c, text, f, size, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if c.stringWidth(t, f, size) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def pdf_tracked(c, text, x, y, f, size, colour, track=1.4):
    c.setFillColor(colour)
    c.setFont(f, size)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, f, size) + track
    return x


def pdf_mark(c, x, y, h, colour=white):
    """Same geometry as the raster mark, in reportlab's y-up space."""
    s = h / 73.0
    c.setFillColor(colour)
    def pill(px, py, pw, ph):
        c.roundRect(x + px * s, y + (73 - py - ph) * s, pw * s, ph * s, (pw * s) / 2, fill=1, stroke=0)
    pill(0, 12, 15, 48)
    r = 10.5 * s
    c.circle(x + 29.5 * s, y + (73 - 10) * s, r, fill=1, stroke=0)
    pill(22, 27, 15, 46)
    pill(44, 12, 15, 47)
    return 59 * s


def pdf_centred(c, text, f, size, cx, y, colour):
    c.setFont(f, size)
    c.setFillColor(colour)
    c.drawString(cx - c.stringWidth(text, f, size) / 2, y, text)


def pdf_centred_tracked(c, text, x_centre, y, f, size, colour, track=1.3):
    w = sum(c.stringWidth(ch, f, size) + track for ch in text) - track
    pdf_tracked(c, text, x_centre - w / 2, y, f, size, colour, track)


def build_pdf(kind, name, places, out_path):
    """A5, same composition as the raster, measured the same way."""
    PW, PH = A5
    cx = PW / 2
    M = 38
    c = canvaslib.Canvas(str(out_path), pagesize=A5)
    c.setTitle("Medlyfe, an invitation")

    # Ground wash with the monogram field and grain baked in, so the print
    # carries the same texture as the screen version.
    bg = gradient((int(PW * 3), int(PH * 3)), BLUE, BLUE_DARK).convert("RGBA")
    bg.alpha_composite(monogram_field(bg.width, bg.height, tile=int(150 * 1.1), alpha=6))
    bg.alpha_composite(halo(bg.width, bg.height, bg.width // 2, int(bg.height * 0.145), int(bg.width * 0.48), peak=16))
    bg.alpha_composite(grain(bg.width, bg.height, strength=5))
    btmp = OUT / ".bg-tmp.png"
    bg.convert("RGB").save(btmp)
    c.drawImage(ImageReader(str(btmp)), 0, 0, width=PW, height=PH)

    tag_lines = pdf_wrap(c, TAGLINE, "Times-Roman", 25, PW - 2 * M - 24)
    sf_lines = pdf_wrap(c, STANDFIRST, "Times-Italic", 10, PW * 0.64)
    ses_lines = pdf_wrap(c, "\u201C" + SESSION + "\u201D", "Times-Italic", 13.5, PW * 0.74)
    name_lines = pdf_wrap(c, name, "Times-Roman", 15, PW * 0.74)

    head_h = 46 + 20 + 28 * len(tag_lines) + 6 + 13 * len(sf_lines)
    conv_h = 12 + 12 + 15 + 16.5 * len(ses_lines)
    pers_h = 14 + 11 + 12 + 18 * len(name_lines) + (12 if kind == "group" else 0) + 8
    foot_h = 78

    top = PH - M - 26
    avail = (top - head_h - conv_h - pers_h) - (M + foot_h)
    ah = max(96, min(PH * 0.28, avail - 16))
    aw = ah * 0.82

    # Her portrait, arched.
    atmp = OUT / ".arch-tmp.png"
    arched_portrait(int(aw * 4), int(ah * 4)).save(atmp)
    ay_top = top - head_h - 14
    c.drawImage(ImageReader(str(atmp)), cx - aw / 2, ay_top - ah, width=aw, height=ah, mask="auto")

    # Frame, inner keyline and corner brackets.
    c.setStrokeColor(HexColor(LIME))
    c.setLineWidth(0.45)
    c.rect(M * 0.55, M * 0.55, PW - 1.1 * M, PH - 1.1 * M, fill=0, stroke=1)

    # ---- head
    y = top
    pdf_mark(c, cx - 48, y - 8, 26)
    c.setFillColor(white)
    c.setFont("Times-Roman", 18)
    c.drawString(cx - 48 + 28, y, "med")
    c.setFont("Helvetica-Bold", 18)
    c.drawString(cx - 48 + 28 + c.stringWidth("med", "Times-Roman", 18) + 1, y, "LYFE")
    pdf_centred_tracked(c, "WELLNESS AND LONGEVITY CENTRE", cx, y - 11, "Helvetica", 5.2, HexColor(LIME_SOFT), 0.9)
    y -= 34

    pdf_centred_tracked(c, "WITH " + WITH_WHOM.upper(), cx, y, "Helvetica-Bold", 6.6, HexColor(LIME), 1.2)
    y -= 26

    for ln in tag_lines:
        pdf_centred(c, ln, "Times-Roman", 25, cx, y, white)
        y -= 28
    y -= 4
    for ln in sf_lines:
        pdf_centred(c, ln, "Times-Italic", 10, cx, y, HexColor(LIME_SOFT))
        y -= 13

    # ---- below the arch
    y = ay_top - ah - 16
    pdf_centred(c, "In conversation with", "Helvetica", 8, cx, y, HexColor(MIST))
    y -= 13
    pdf_centred(c, WITH_WHOM, "Helvetica-Bold", 10, cx, y, white)
    y -= 17
    for ln in ses_lines:
        pdf_centred(c, ln, "Times-Italic", 13.5, cx, y, HexColor(LIME))
        y -= 16.5

    # ---- personalisation
    y -= 13
    c.setStrokeColor(HexColor(LIME))
    c.setLineWidth(0.4)
    c.line(cx - 62, y, cx + 62, y)
    y -= 13
    if kind == "group":
        pdf_centred(c, "Invites", "Helvetica", 8, cx, y, HexColor(LIME))
        y -= 17
        for ln in name_lines:
            pdf_centred(c, ln, "Times-Roman", 15, cx, y, white)
            y -= 18
        pdf_centred(c, f"{places} places reserved by name", "Helvetica", 8, cx, y, HexColor(MIST))
        y -= 12
    else:
        pdf_centred(c, "Requests the pleasure of the company of", "Helvetica", 8, cx, y, HexColor(LIME))
        y -= 17
        for ln in name_lines:
            pdf_centred(c, ln, "Times-Roman", 15, cx, y, white)
            y -= 18
    y -= 4
    c.line(cx - 62, y, cx + 62, y)

    # ---- particulars
    by = min(M + foot_h, y - 16)
    pdf_centred(c, DATE, "Helvetica-Bold", 9.5, cx, by, white)
    by -= 13
    pdf_centred(c, f"Cocktails {COCKTAILS}   \u00b7   Programme {PROGRAMME}   \u00b7   Close {CLOSE}", "Helvetica", 8, cx, by, HexColor(MIST))
    by -= 11
    pdf_centred(c, VENUE, "Helvetica", 8, cx, by, HexColor(MIST))
    by -= 14
    pdf_centred(c, (f"Please RSVP with attendee names by {RSVP_BY}" if kind == "group"
                    else f"Personal invitation.  RSVP by {RSVP_BY}"), "Helvetica", 7.6, cx, by, HexColor(LIME_SOFT))
    by -= 12
    pdf_centred(c, PHONE_DISPLAY, "Helvetica-Bold", 9, cx, by, HexColor(LIME))
    by -= 13
    pdf_centred(c, FOOTER, "Helvetica", 6, cx, max(M * 0.78, by), HexColor(BLUE_SOFT))

    c.showPage()
    c.save()
    for f in (btmp, atmp):
        if f.exists():
            f.unlink()
    return out_path


# ===================================================================== main ==

def emit(kind, name, places):
    tag = slug(name)
    png = build_png(kind, name, places, OUT / f"invite-{kind}-{tag}.png")
    pdf = build_pdf(kind, name, places, OUT / f"invite-{kind}-{tag}.pdf")
    print("  ", png.name)
    print("  ", pdf.name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", help="Guest name, for the individual version")
    ap.add_argument("--org", help="Organisation name, for the group version")
    ap.add_argument("--places", type=int, default=6, help="Places reserved, group version")
    ap.add_argument("--csv", help="CSV with columns: kind,name,places. One invitation per row.")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    if not PORTRAIT.exists():
        raise SystemExit(f"Portrait missing at {PORTRAIT}")
    print("Building invitations into docs/lyfe-creative/invitations/")
    if REAL_LOGO.exists():
        print("   using the real Medlyfe logo at docs/brand/medlyfe-logo.png")
    else:
        print("   NOTE: drawing the Medlyfe mark. Drop the real logo at docs/brand/medlyfe-logo.png to use it.")

    if args.csv:
        with open(args.csv, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                emit((row.get("kind") or "individual").strip().lower(),
                     (row.get("name") or "").strip(),
                     int(row.get("places") or args.places))
    elif args.org:
        emit("group", args.org, args.places)
    elif args.name:
        emit("individual", args.name, args.places)
    else:
        # Specimens, so the design can be signed off before any name is set.
        emit("individual", "[Guest Name]", args.places)
        emit("group", "[Organisation Name]", args.places)
    print("Done.")


if __name__ == "__main__":
    main()
