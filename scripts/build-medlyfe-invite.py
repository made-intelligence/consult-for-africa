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


def build_png(kind, name, places, out_path):
    W, H = 1080, 1350
    M = 76
    img = gradient((W, H), BLUE, BLUE_DARK).convert("RGBA")

    # Her portrait, lower right, under the type.
    pw, ph = int(W * 0.50), int(H * 0.50)
    img.alpha_composite(portrait_panel(pw, ph), (W - pw, H - ph - int(H * 0.055)))

    d = ImageDraw.Draw(img)

    # The keyline frame, their device.
    inset = 34
    d.rectangle([inset, inset, W - inset, H - inset], outline=LIME + "00", width=0)
    for seg in [((inset, inset), (W - inset, inset)),
                ((inset, H - inset), (W - inset, H - inset)),
                ((inset, inset), (inset, H - inset)),
                ((W - inset, inset), (W - inset, H - inset))]:
        d.line([seg[0], seg[1]], fill=LIME, width=1)

    y = M + 14
    draw_lockup(img, d, M, y, mark_h=56)
    y += 108

    f_eye = font(SANS, SANS_B, 19)
    tracked(d, (M + 2, y), "WITH " + WITH_WHOM.upper(), f_eye, LIME, track=4)
    y += 54

    f_h = font(DISPLAY, DISPLAY_I, 76)
    for ln in wrap(d, TAGLINE, f_h, W - 2 * M - 40):
        d.text((M, y), ln, font=f_h, fill=PAPER)
        y += 84
    y += 10

    f_s = font(SANS, SANS_R, 27)
    for ln in wrap(d, STANDFIRST, f_s, int(W * 0.62)):
        d.text((M, y), ln, font=f_s, fill=LIME_SOFT)
        y += 37

    y += 26
    d.line([(M, y), (M + 78, y)], fill=LIME, width=3)
    y += 34

    f_lab = font(SANS, SANS_R, 21)
    f_ses = font(DISPLAY, DISPLAY_I, 37)
    d.text((M, y), "In conversation with " + WITH_WHOM, font=f_lab, fill=MIST)
    y += 34
    for ln in wrap(d, SESSION, f_ses, int(W * 0.60)):
        d.text((M, y), ln, font=f_ses, fill=PAPER)
        y += 44

    # The personalisation block, which is the whole point of the artwork.
    y += 34
    f_pl = font(SANS, SANS_R, 21)
    f_pn = font(DISPLAY, DISPLAY_I, 40)
    if kind == "group":
        d.text((M, y), "Invites", font=f_pl, fill=LIME)
        y += 32
        for ln in wrap(d, name, f_pn, int(W * 0.58)):
            d.text((M, y), ln, font=f_pn, fill=PAPER)
            y += 47
        d.text((M, y + 2), f"{places} places reserved by name", font=f_pl, fill=MIST)
        y += 34
    else:
        d.text((M, y), "Requests the pleasure of the company of", font=f_pl, fill=LIME)
        y += 32
        for ln in wrap(d, name, f_pn, int(W * 0.58)):
            d.text((M, y), ln, font=f_pn, fill=PAPER)
            y += 47

    # Details, pinned to the bottom left so the portrait keeps the right.
    by = H - M - 214
    f_dk = font(SANS, SANS_B, 17)
    f_dv = font(SANS, SANS_R, 22)
    for label, value in [("DATE", DATE),
                         ("TIME", f"Cocktails {COCKTAILS}  /  Programme {PROGRAMME}"),
                         ("", f"Close {CLOSE}"),
                         ("VENUE", VENUE)]:
        if label:
            tracked(d, (M, by + 4), label, f_dk, LIME, track=3)
        d.text((M + 104, by), value, font=f_dv, fill=PAPER)
        by += 32

    by += 12
    rsvp = (f"Please RSVP with attendee names by {RSVP_BY}" if kind == "group"
            else f"Personal invitation. RSVP by {RSVP_BY}")
    d.text((M, by), rsvp, font=font(SANS, SANS_R, 20), fill=MIST)
    d.text((M, by + 28), PHONE_DISPLAY, font=font(SANS, SANS_B, 22), fill=LIME)

    d.text((M, H - M - 18), FOOTER, font=font(SANS, SANS_R, 16), fill=BLUE_SOFT)

    img.convert("RGB").save(out_path, "PNG", optimize=True)
    return out_path


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


def build_pdf(kind, name, places, out_path):
    PW, PH = A5
    M = 34
    c = canvaslib.Canvas(str(out_path), pagesize=A5)
    c.setTitle("Medlyfe, an invitation")

    # Ground: a soft wash, drawn as bands.
    steps = 120
    t = tuple(int(BLUE[i:i + 2], 16) for i in (1, 3, 5))
    b = tuple(int(BLUE_DARK[i:i + 2], 16) for i in (1, 3, 5))
    for i in range(steps):
        k = i / (steps - 1)
        col = tuple((t[j] + (b[j] - t[j]) * k) / 255.0 for j in range(3))
        c.setFillColorRGB(*col)
        c.rect(0, PH - (i + 1) * PH / steps, PW, PH / steps + 1, fill=1, stroke=0)

    # Her portrait, bottom right, with a soft left edge.
    pw, ph = PW * 0.46, PH * 0.40
    tmp = OUT / ".portrait-tmp.png"
    portrait_panel(int(pw * 3), int(ph * 3)).save(tmp)
    c.drawImage(ImageReader(str(tmp)), PW - pw, PH * 0.085, width=pw, height=ph, mask="auto")

    c.setStrokeColor(HexColor(LIME))
    c.setLineWidth(0.6)
    c.rect(M * 0.6, M * 0.6, PW - 1.2 * M, PH - 1.2 * M, fill=0, stroke=1)

    y = PH - M - 34
    pdf_mark(c, M, y - 6, 30)
    c.setFillColor(white)
    c.setFont("Times-Roman", 20)
    c.drawString(M + 34, y + 2, "med")
    c.setFont("Helvetica-Bold", 20)
    c.drawString(M + 34 + c.stringWidth("med", "Times-Roman", 20) + 1, y + 2, "LYFE")
    c.setFont("Helvetica", 6.4)
    c.drawString(M + 35, y - 8, "Wellness and Longevity Centre")

    y -= 52
    pdf_tracked(c, "WITH " + WITH_WHOM.upper(), M, y, "Helvetica-Bold", 7.2, HexColor(LIME), 1.3)

    y -= 30
    c.setFillColor(white)
    c.setFont("Times-Roman", 27)
    for ln in pdf_wrap(c, TAGLINE, "Times-Roman", 27, PW - 2 * M - 10):
        c.drawString(M, y, ln)
        y -= 30

    y -= 4
    c.setFillColor(HexColor(LIME_SOFT))
    c.setFont("Helvetica", 10)
    for ln in pdf_wrap(c, STANDFIRST, "Helvetica", 10, PW * 0.60):
        c.drawString(M, y, ln)
        y -= 13.5

    y -= 12
    c.setFillColor(HexColor(LIME))
    c.rect(M, y, 30, 1.6, fill=1, stroke=0)
    y -= 22

    c.setFillColor(HexColor(MIST))
    c.setFont("Helvetica", 8.4)
    c.drawString(M, y, "In conversation with " + WITH_WHOM)
    y -= 19
    c.setFillColor(white)
    c.setFont("Times-Roman", 15)
    for ln in pdf_wrap(c, SESSION, "Times-Roman", 15, PW * 0.58):
        c.drawString(M, y, ln)
        y -= 18

    y -= 16
    c.setFillColor(HexColor(LIME))
    c.setFont("Helvetica", 8.4)
    if kind == "group":
        c.drawString(M, y, "Invites")
        y -= 20
        c.setFillColor(white)
        c.setFont("Times-Roman", 16)
        for ln in pdf_wrap(c, name, "Times-Roman", 16, PW * 0.56):
            c.drawString(M, y, ln)
            y -= 19
        c.setFillColor(HexColor(MIST))
        c.setFont("Helvetica", 8.4)
        c.drawString(M, y, f"{places} places reserved by name")
    else:
        c.drawString(M, y, "Requests the pleasure of the company of")
        y -= 20
        c.setFillColor(white)
        c.setFont("Times-Roman", 16)
        for ln in pdf_wrap(c, name, "Times-Roman", 16, PW * 0.56):
            c.drawString(M, y, ln)
            y -= 19

    by = M + 86
    for label, value in [("DATE", DATE),
                         ("TIME", f"Cocktails {COCKTAILS} / Programme {PROGRAMME} / Close {CLOSE}"),
                         ("VENUE", VENUE)]:
        pdf_tracked(c, label, M, by, "Helvetica-Bold", 6.4, HexColor(LIME), 1.1)
        c.setFillColor(white)
        c.setFont("Helvetica", 8.6)
        c.drawString(M + 44, by, value)
        by -= 13

    by -= 6
    c.setFillColor(HexColor(MIST))
    c.setFont("Helvetica", 8)
    c.drawString(M, by, (f"Please RSVP with attendee names by {RSVP_BY}" if kind == "group"
                         else f"Personal invitation. RSVP by {RSVP_BY}"))
    c.setFillColor(HexColor(LIME))
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(M, by - 13, PHONE_DISPLAY)

    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=1)
    qr.add_data(wa(f"Hello, I would like to RSVP to the evening on {DATE}."))
    qr.make(fit=True)
    qimg = qr.make_image(fill_color=BLUE_DARK, back_color=LIME).convert("RGB")
    qtmp = OUT / ".qr-tmp.png"
    qimg.save(qtmp)
    c.drawImage(ImageReader(str(qtmp)), PW - M - 54, M + 30, width=54, height=54, mask="auto")

    c.setFillColor(HexColor(BLUE_SOFT))
    c.setFont("Helvetica", 6.2)
    c.drawString(M, M * 0.9, FOOTER)

    c.showPage()
    c.save()
    for f in (tmp, qtmp):
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
