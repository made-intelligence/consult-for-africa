"""
Shared deck furniture for Medbury Healthcare Group decks.

Palette and marks taken from the Medbury logo: red ED1C24 and black. Page
furniture carries no Consult for Africa mark, because these documents are
Medbury's and go to its partners.

Style only. No model, no numbers. Import this, not another copy of it.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader

from cfa_deck import SERIF, SERIF_B, SERIF_I, wrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
LOGO, LOGO_REV = DOCS / "medbury-logo.png", DOCS / "medbury-logo-reversed.png"

# ---- Medbury palette, sampled from the logo --------------------------------
RED = HexColor("#ED1C24")
RED_D = HexColor("#B7141B")
DARK = HexColor("#111114")
INK = HexColor("#1A1A1E")
BODY = HexColor("#2B2B31")
MUTED = HexColor("#6E6E76")
LIGHT = HexColor("#C7C7CE")
SURFACE = HexColor("#F4F4F6")
BLUSH = HexColor("#FDF1F1")
IVORY = white

PAGE_W, PAGE_H = landscape(A4)
MX = 54
_N = [0]
TOTAL = ["00"]
FOOTER = ["Medbury Healthcare Group   /   Private and confidential"]



def logo(c, x, y, h, rev=False):
    try:
        img = ImageReader(str(LOGO_REV if rev else LOGO))
        iw, ih = img.getSize()
        c.drawImage(img, x, y, width=h * iw / ih, height=h, mask="auto")
    except Exception:
        c.setFillColor(IVORY if rev else INK)
        c.setFont(SERIF_B, h * 0.6)
        c.drawString(x, y + h * 0.2, "MEDBURY")


def chrome(c, kicker):
    _N[0] += 1
    c.setFillColor(DARK); c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, PAGE_H - 60, 26, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10.5); c.setFillColor(RED_D)
    c.drawString(MX + 36, PAGE_H - 63, kicker.upper())
    logo(c, PAGE_W - MX - 92, PAGE_H - 74, 22)
    c.setFillColor(RED); c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 8)
    c.drawString(MX, 19, FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, "%s / %s" % (str(_N[0]).zfill(2), TOTAL[0]))


def heading(c, text, y=PAGE_H - 112, size=23, color=INK, max_w=None):
    max_w = max_w or (PAGE_W - 2 * MX)
    c.setFont(SERIF_B, size); c.setFillColor(color)
    for line in wrap(c, text, SERIF_B, size, max_w):
        c.drawString(MX, y, line); y -= size + 8
    return y


def para(c, text, x, y, size, color, max_w, leading, font="Helvetica"):
    c.setFont(font, size); c.setFillColor(color)
    for ln in wrap(c, text, font, size, max_w):
        c.drawString(x, y, ln); y -= leading
    return y


def rule(c, x, y, w, col=RED, lw=1.0):
    c.setStrokeColor(col); c.setLineWidth(lw); c.line(x, y, x + w, y)


def table(c, rows, x, y, col_w, size=11.2, leading=14.6, pad=9, accent_last=False,
          head=True, hi=None):
    n = len(col_w); cy = y
    if not head:
        rows = rows[1:] if all(str(cc).strip() == '' for cc in rows[0]) else rows
    for i, r in enumerate(rows):
        cells = []
        for j in range(n):
            fnt = "Helvetica-Bold" if (i == 0 or j == 0) else "Helvetica"
            out = []
            for seg in str(r[j]).split("\n"):
                out.extend(wrap(c, seg, fnt, size, col_w[j] - 2 * pad))
            cells.append(out)
        h = max(len(cl) for cl in cells) * leading + pad * 1.6
        last = accent_last and i == len(rows) - 1
        if i == 0 and head:
            c.setFillColor(DARK); c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, cy - h - 2, sum(col_w), 2, fill=1, stroke=0)
        elif last:
            c.setFillColor(BLUSH); c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, cy - h, 4, h, fill=1, stroke=0)
        elif i in (hi or ()):
            c.setFillColor(BLUSH); c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, cy - h, 4, h, fill=1, stroke=0)
        elif (i % 2 == 0) == head:
            c.setFillColor(SURFACE); c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
        cx = x
        for j in range(n):
            ty = cy - pad
            for ln in cells[j]:
                if i == 0 and head:
                    c.setFont("Helvetica-Bold", size); c.setFillColor(IVORY)
                elif last:
                    c.setFont("Helvetica-Bold", size); c.setFillColor(INK if j == 0 else RED_D)
                else:
                    c.setFont("Helvetica-Bold" if j == 0 else "Helvetica", size)
                    c.setFillColor(INK if j == 0 else BODY)
                c.drawString(cx + pad, ty - size + 2, ln); ty -= leading
            cx += col_w[j]
        cy -= h
    return cy


def callout(c, x, y, w, text, bg=BLUSH, spine=RED, fg=INK, pad=20, size=12.5, leading=17):
    lines = wrap(c, text, "Helvetica-Bold", size, w - 2 * pad)
    h = pad * 2 + leading * len(lines) - (leading - size)
    c.setFillColor(bg); c.roundRect(x, y - h, w, h, 8, fill=1, stroke=0)
    c.setFillColor(spine); c.rect(x, y - h, 5, h, fill=1, stroke=0)
    ty = y - pad - size + 3
    c.setFont("Helvetica-Bold", size); c.setFillColor(fg)
    for ln in lines:
        c.drawString(x + pad, ty, ln); ty -= leading
    return y - h


def bullets(c, items, x, y, max_w, dark=False, size=12.5, leading=16.5, gap=15):
    for lead, rest in items:
        c.setFillColor(RED); c.rect(x, y - 1, 7, 3, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", size); c.setFillColor(IVORY if dark else INK)
        c.drawString(x + 18, y, lead)
        yy = y - leading
        for ln in wrap(c, rest, "Helvetica", size, max_w):
            c.setFont("Helvetica", size); c.setFillColor(LIGHT if dark else BODY)
            c.drawString(x + 18, yy, ln); yy -= leading
        y = yy - gap
    return y




def m(x, d=1):
    return ("{:,.%df}" % d).format(x)


def bump():
    """Count a slide that draws its own furniture, so numbering stays right."""
    _N[0] += 1
