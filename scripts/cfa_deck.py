"""
Shared landscape deck system for Consult for Africa presentations.

Palette sampled from docs/c4a-icon.png, Georgia for display, and the page
furniture, table, callout and chevron primitives used across CFA decks.
Extracted from scripts/build-duchess-deck.py so a second deck does not become
a second copy. Set FOOTER[0] and TOTAL[0] before rendering.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

_SUPP = "/System/Library/Fonts/Supplemental/"
SERIF, SERIF_B, SERIF_I = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"
try:
    pdfmetrics.registerFont(TTFont("Georgia", _SUPP + "Georgia.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", _SUPP + "Georgia Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Italic", _SUPP + "Georgia Italic.ttf"))
    SERIF, SERIF_B, SERIF_I = "Georgia", "Georgia-Bold", "Georgia-Italic"
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
LOGO = DOCS / "c4a-logo-reversed.png"

# ---- brand palette (source: docs/brand-guide-cfa.pdf) ----------------------
NAVY = HexColor("#0B3C5D")
DEEP_NAVY = HexColor("#081521")
GOLD = HexColor("#D4AF37")
TEAL = HexColor("#1F7A8C")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
SURFACE = HexColor("#F1F5F9")
LIGHT = HexColor("#C9D6E0")
CREAM = HexColor("#FBF6E6")

# ---- palette sampled from docs/c4a-icon.png -------------------------------
INK = HexColor("#182448")      # deepest chevron
IND = HexColor("#243060")      # chevron 1
IND2 = HexColor("#3C4878")     # chevron 2
IND3 = HexColor("#485484")     # chevron 3
SKY = HexColor("#6090C0")      # chevron 4, the light face
SAGE = HexColor("#CCD8C0")     # the dotted continent
SAGE_D = HexColor("#8FA383")
IVORY = HexColor("#FFFFFF")
RULE = HexColor("#DED9CE")

CHEVRONS = [(INK, 9.0), (IND2, 7.2), (IND3, 5.6), (SKY, 4.2)]


def chevron_stack(c, x, y, w, h, gap, colours=CHEVRONS, cap=1):
    """The mark's nested chevron, drawn as open strokes."""
    c.saveState()
    c.setLineCap(cap)
    c.setLineJoin(1)
    for i, (col, lw) in enumerate(colours):
        off = i * gap
        c.setStrokeColor(col)
        c.setLineWidth(lw)
        pth = c.beginPath()
        pth.moveTo(x, y - off)
        pth.lineTo(x + w / 2.0, y + h - off)
        pth.lineTo(x + w, y - off)
        c.drawPath(pth, stroke=1, fill=0)
    c.restoreState()


def hairline(c, x, y, w, col=RULE, lw=0.7):
    c.setStrokeColor(col)
    c.setLineWidth(lw)
    c.line(x, y, x + w, y)


def tracked(c, text, x, y, font, size, colour, track=2.2):
    """Letterspaced small caps label."""
    c.setFont(font, size)
    c.setFillColor(colour)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + track
    return x


PAGE_W, PAGE_H = landscape(A4)   # 842 x 595
MX = 54
TOTAL = ["00"]
FOOTER = ["Consult for Africa   /   Confidential"]


# ----------------------------------------------------------- helpers ---------
def wrap(c, text, font, size, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def para(c, text, x, y, font, size, color, max_w, leading):
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(c, text, font, size, max_w):
        c.drawString(x, y, line)
        y -= leading
    return y


_N = [1]


def chrome(c, kicker):
    _N[0] += 1
    n = _N[0]
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 9, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 60, 26, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(TEAL)
    c.drawString(MX + 36, PAGE_H - 63, kicker.upper())
    c.setFillColor(GOLD)
    c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(MX, 19, FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, "%s / %s" % (str(n).zfill(2), TOTAL[0]))
    try:
        _ic = ImageReader(str(DOCS / "c4a-icon.png"))
        _iw, _ih = _ic.getSize()
        _h = 30.0
        _w = _h * _iw / _ih
        c.drawImage(_ic, PAGE_W - MX - _w, PAGE_H - 78, width=_w, height=_h, mask="auto")
    except Exception:
        pass


def heading(c, text, y=PAGE_H - 110, size=23, color=INK, max_w=None):
    max_w = max_w or (PAGE_W - 2 * MX)
    c.setFont(SERIF_B, size)
    c.setFillColor(color)
    leading = size + 8
    for line in wrap(c, text, SERIF_B, size, max_w):
        c.drawString(MX, y, line)
        y -= leading
    return y


def bullet_block(c, items, x, y, max_w, gap=14, size=12.5, leading=16.5,
                 lead_font="Helvetica-Bold", body_color=BODY, tick=GOLD,
                 lead_color=NAVY):
    """lead_color defaults to NAVY, which is right on a white page and invisible
    on a dark one. Pass something light when the ground is dark."""
    for lead, rest in items:
        c.setFillColor(tick)
        c.rect(x, y - 1, 7, 3, fill=1, stroke=0)
        tx = x + 18
        if lead:
            c.setFont(lead_font, size)
            c.setFillColor(lead_color)
            c.drawString(tx, y, lead)
            offset = c.stringWidth(lead + "  ", lead_font, size)
        else:
            offset = 0
        words = rest.split()
        cur, cy = "", y
        line_x = tx + offset
        avail = max_w - offset
        out_lines = []
        for w in words:
            trial = (cur + " " + w).strip()
            if c.stringWidth(trial, "Helvetica", size) <= avail:
                cur = trial
            else:
                out_lines.append((line_x, cur))
                cur = w
                line_x = tx
                avail = max_w
        if cur:
            out_lines.append((line_x, cur))
        for lx, ln in out_lines:
            c.setFont("Helvetica", size)
            c.setFillColor(body_color)
            c.drawString(lx, cy, ln)
            cy -= leading
        y = cy - gap
    return y


def callout(c, x, y, w, text, bg=SURFACE, spine=TEAL, fg=NAVY, pad=22,
            size=12.5, leading=17, font="Helvetica-Bold"):
    lines = wrap(c, text, font, size, w - 2 * pad)
    h = pad * 2 + leading * len(lines) - (leading - size)
    c.setFillColor(bg)
    c.roundRect(x, y - h, w, h, 8, fill=1, stroke=0)
    c.setFillColor(spine)
    c.rect(x, y - h, 5, h, fill=1, stroke=0)
    ty = y - pad - size + 3
    c.setFont(font, size)
    c.setFillColor(fg)
    for ln in lines:
        c.drawString(x + pad, ty, ln)
        ty -= leading
    return y - h


def box(c, x, y, w, h, fill, spine=None, spine_w=5):
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
    if spine:
        c.setFillColor(spine)
        c.rect(x, y, spine_w, h, fill=1, stroke=0)


# ----------------------------------------------------------- extras ---------
def simple_table(c, rows, x, y, col_w, size=11, leading=15, pad=9, head=True):
    """Two or three column table with a navy header and banded rows."""
    n = len(col_w)
    cy = y
    for i, r in enumerate(rows):
        cells = []
        for j in range(n):
            fnt = "Helvetica-Bold" if ((i == 0 and head) or (j == 0 and not (i == 0 and head))) else "Helvetica"
            out = []
            for seg in str(r[j]).split("\n"):
                out.extend(wrap(c, seg, fnt, size, col_w[j] - 2 * pad))
            cells.append(out)
        h = max(len(cl) for cl in cells) * leading + pad * 1.6
        if i == 0 and head:
            c.setFillColor(NAVY)
            c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
            c.setFillColor(GOLD)
            c.rect(x, cy - h - 2, sum(col_w), 2, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(SURFACE)
            c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
        cx = x
        for j in range(n):
            ty = cy - pad
            for ln in cells[j]:
                if i == 0 and head:
                    c.setFont("Helvetica-Bold", size)
                    c.setFillColor(white)
                else:
                    c.setFont("Helvetica-Bold" if j == 0 else "Helvetica", size)
                    c.setFillColor(NAVY if j == 0 else BODY)
                c.drawString(cx + pad, ty - size + 2, ln)
                ty -= leading
            cx += col_w[j]
        cy -= h
    return cy


