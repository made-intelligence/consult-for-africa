"""
"Welcome Back, Dr Chinwe": the series story, Episode 1 and 2 storyboards,
cutdowns, release plan and production status, as a landscape deck in MedLYFE's
colours (Debo, 31 Oct 2026).

Shareable with Dr Chinwe and Dr Itunu, so it carries nothing on appearance or
wardrobe and none of the crew-side rules; those stay in
docs/kpaduwa-journey-callsheet-cfa.pdf. Cover is a quiet colour field and the
portrait, no chevrons.

Output: docs/welcome-back-dr-chinwe-deck-cfa.pdf

Run:
  python3 scripts/build-welcome-back-deck.py

No em dashes.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_deck import wrap  # noqa: E402

from reportlab.graphics import renderPDF
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from svglib.svglib import svg2rlg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "welcome-back-dr-chinwe-deck-cfa.pdf"
LOGO = ROOT / "docs" / "ageless" / "print" / "logos" / "medlyfe.svg"
PORTRAIT = ROOT / "public" / "lyfe" / "chinwe-portrait-centred.jpg"

PAGE_W, PAGE_H = landscape(A4)
MX = 44

GREEN = HexColor("#4A6131")      # the MedLYFE logo
DEEP = HexColor("#2E3D1F")
INK = HexColor("#1C2414")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
SAGE = HexColor("#E4EADB")
SAGE_D = HexColor("#B9C6A8")
SURFACE = HexColor("#F3F5EF")
CREAM = HexColor("#F7F4EC")
SAND = HexColor("#B89B6A")
WATER = HexColor("#BFD7DA")
RULE = HexColor("#DCE2D3")
FIG = HexColor("#5C6B4C")
FIG_SOFT = HexColor("#C7D0BC")

try:
    pdfmetrics.registerFont(TTFont("Didot", "/System/Library/Fonts/Supplemental/Didot.ttc", subfontIndex=0))
    DISPLAY = "Didot"
except Exception:
    DISPLAY = "Times-Roman"

BRAND = "Lyfe Plastics & Aesthetics by MedLYFE"
TOTAL = 12
_N = [0]


# ----------------------------------------------------------- furniture -------
def text(c, s, x, y, font="Helvetica", size=10, color=BODY, max_w=None, leading=None, right=False):
    c.setFont(font, size)
    c.setFillColor(color)
    if max_w is None:
        (c.drawRightString if right else c.drawString)(x, y, s)
        return y - (leading or size + 4)
    for ln in wrap(c, s, font, size, max_w):
        c.drawString(x, y, ln)
        y -= leading or size + 4
    return y


def logo(c, x, y, h):
    d = svg2rlg(str(LOGO))
    k = h / d.height
    d.scale(k, k)
    renderPDF.draw(d, c, x, y)
    return d.width * k


def chrome(c, kicker, title):
    _N[0] += 1
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, PAGE_H - 5, PAGE_W, 5, fill=1, stroke=0)
    c.setFillColor(SAND)
    c.rect(MX, PAGE_H - 40, 22, 2.5, fill=1, stroke=0)
    text(c, kicker.upper(), MX + 30, PAGE_H - 43, "Helvetica-Bold", 8.5, GREEN)
    d = svg2rlg(str(LOGO))
    h = 20
    w = d.width * h / d.height
    logo(c, PAGE_W - MX - w, PAGE_H - 50, h)
    y = PAGE_H - 74
    for ln in wrap(c, title, DISPLAY, 22, PAGE_W - 2 * MX - 140):
        text(c, ln, MX, y, DISPLAY, 22, INK)
        y -= 26
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(MX, 16, f"{BRAND}   /   Welcome Back, Dr Chinwe   /   Prepared by Consult For Africa")
    c.drawRightString(PAGE_W - MX, 16, f"{_N[0]:02d} / {TOTAL:02d}")
    return y - 6


def bullets(c, items, x, y, w, size=10.5, leading=14.5, gap=7):
    """Label: fact bullets."""
    for lead, rest in items:
        c.setFillColor(SAND)
        c.rect(x, y + 2, 6, 2.5, fill=1, stroke=0)
        tx = x + 15
        lead_s = lead + "  "
        c.setFont("Helvetica-Bold", size)
        c.setFillColor(DEEP)
        c.drawString(tx, y, lead_s)
        off = c.stringWidth(lead_s, "Helvetica-Bold", size)
        lines, cur, avail = [], "", w - 15 - off
        for word in rest.split():
            t = (cur + " " + word).strip()
            if c.stringWidth(t, "Helvetica", size) <= avail:
                cur = t
            else:
                lines.append(cur)
                cur, avail = word, w - 15
        lines.append(cur)
        c.setFont("Helvetica", size)
        c.setFillColor(BODY)
        for i, ln in enumerate(lines):
            c.drawString(tx + (off if i == 0 else 0), y, ln)
            y -= leading
        y -= gap
    return y


def table(c, rows, x, y, widths, size=10.5, leading=14, pad=8):
    for i, r in enumerate(rows):
        head = i == 0
        cells = []
        for j, cell in enumerate(r):
            fnt = "Helvetica-Bold" if head or j == 0 else "Helvetica"
            cells.append(wrap(c, str(cell), fnt, size, widths[j] - 2 * pad) or [""])
        h = max(len(cl) for cl in cells) * leading + pad * 1.4
        if head:
            c.setFillColor(GREEN)
            c.rect(x, y - h, sum(widths), h, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(SURFACE)
            c.rect(x, y - h, sum(widths), h, fill=1, stroke=0)
        cx = x
        for j, cl in enumerate(cells):
            ty = y - pad - size + 2
            for ln in cl:
                c.setFont("Helvetica-Bold" if head or j == 0 else "Helvetica", size)
                c.setFillColor(white if head else (DEEP if j == 0 else BODY))
                c.drawString(cx + pad, ty, ln)
                ty -= leading
            cx += widths[j]
        y -= h
    return y


def callout(c, x, y, w, s, size=11.5):
    lines = wrap(c, s, "Helvetica-Bold", size, w - 36)
    h = 26 + len(lines) * (size + 5)
    c.setFillColor(SAGE)
    c.roundRect(x, y - h, w, h, 6, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(x, y - h, 4, h, fill=1, stroke=0)
    ty = y - 14 - size + 2
    for ln in lines:
        text(c, ln, x + 18, ty, "Helvetica-Bold", size, DEEP)
        ty -= size + 5
    return y - h


# ----------------------------------------------------------- storyboard ------
def figure(c, cx, base, h, col=FIG):
    """A plain standing or seated figure: head and shoulders scale with h."""
    head_r = h * 0.11
    body_w = h * 0.36
    body_h = h * 0.62
    c.setFillColor(col)
    c.roundRect(cx - body_w / 2, base, body_w, body_h, body_w * 0.35, fill=1, stroke=0)
    c.circle(cx, base + body_h + head_r * 1.15, head_r, fill=1, stroke=0)


def draw_props(c, x, y, w, h, props):
    for p in props:
        kind, *a = p
        if kind == "pool":
            c.setFillColor(WATER)
            c.rect(x, y, w, h * 0.28, fill=1, stroke=0)
        elif kind == "sky":
            c.setFillColor(CREAM)
            c.rect(x, y + h * 0.45, w, h * 0.55, fill=1, stroke=0)
        elif kind == "car":
            cx = x + w * a[0]
            cw, ch = w * 0.42, h * 0.26
            c.setFillColor(HexColor("#2B2B2B"))
            c.roundRect(cx - cw / 2, y + h * 0.12, cw, ch, 4, fill=1, stroke=0)
            c.roundRect(cx - cw * 0.32, y + h * 0.12 + ch - 2, cw * 0.62, ch * 0.7, 3, fill=1, stroke=0)
            c.setFillColor(HexColor("#555555"))
            for fx in (-0.3, 0.3):
                c.circle(cx + cw * fx, y + h * 0.12, h * 0.06, fill=1, stroke=0)
        elif kind == "bags":
            for i, fx in enumerate(a):
                bx = x + w * fx
                c.setFillColor(SAND if i % 2 == 0 else HexColor("#8C7550"))
                c.roundRect(bx, y + h * 0.1, w * 0.13, h * 0.42, 3, fill=1, stroke=0)
                c.setStrokeColor(DEEP)
                c.setLineWidth(1.2)
                c.line(bx + w * 0.04, y + h * 0.52, bx + w * 0.04, y + h * 0.6)
                c.line(bx + w * 0.09, y + h * 0.52, bx + w * 0.09, y + h * 0.6)
                c.line(bx + w * 0.04, y + h * 0.6, bx + w * 0.09, y + h * 0.6)
        elif kind == "phone":
            pw, ph = w * 0.24, h * 0.78
            px, py = x + w * 0.38, y + h * 0.11
            c.setFillColor(INK)
            c.roundRect(px, py, pw, ph, 6, fill=1, stroke=0)
            c.setFillColor(white)
            c.roundRect(px + 4, py + 6, pw - 8, ph - 12, 3, fill=1, stroke=0)
            c.setFillColor(SAGE)
            c.roundRect(px + 8, py + ph * 0.62, pw - 22, 13, 4, fill=1, stroke=0)
            c.setFillColor(GREEN)
            c.roundRect(px + 14, py + ph * 0.36, pw - 22, 13, 4, fill=1, stroke=0)
            text(c, a[0], px + 11, py + ph * 0.62 + 4, "Helvetica", 5.6, INK)
            text(c, a[1], px + 17, py + ph * 0.36 + 4, "Helvetica-Bold", 5.6, white)
        elif kind == "desk":
            c.setFillColor(HexColor("#A68A64"))
            c.rect(x, y, w, h * 0.22, fill=1, stroke=0)
        elif kind == "screen":
            sx = x + w * a[0]
            c.setFillColor(INK)
            c.rect(sx, y + h * 0.22, w * 0.26, h * 0.34, fill=1, stroke=0)
            c.setFillColor(SAGE)
            c.rect(sx + 3, y + h * 0.22 + 3, w * 0.26 - 6, h * 0.34 - 6, fill=1, stroke=0)
            text(c, "Book a consultation", sx + 6, y + h * 0.42, "Helvetica-Bold", 4.8, DEEP)
        elif kind == "paper":
            c.setFillColor(white)
            c.rect(x + w * 0.2, y + h * 0.05, w * 0.5, h * 0.5, fill=1, stroke=0)
            c.setStrokeColor(SAGE_D)
            c.setLineWidth(0.8)
            for i in range(6):
                c.line(x + w * 0.25, y + h * (0.47 - i * 0.06), x + w * 0.62, y + h * (0.47 - i * 0.06))
        elif kind == "pen":
            c.setStrokeColor(INK)
            c.setLineWidth(3)
            c.line(x + w * 0.5, y + h * 0.14, x + w * 0.78, y + h * 0.62)
            c.setFillColor(FIG)
            c.roundRect(x + w * 0.64, y + h * 0.36, w * 0.22, h * 0.36, 8, fill=1, stroke=0)
        elif kind == "corridor":
            c.setStrokeColor(SAGE_D)
            c.setLineWidth(1)
            vx, vy = x + w * 0.5, y + h * 0.55
            for ex, ey in ((x, y), (x + w, y), (x, y + h), (x + w, y + h)):
                c.line(ex, ey, vx, vy)
            c.setFillColor(white)
            c.rect(vx - w * 0.08, vy - h * 0.18, w * 0.16, h * 0.34, fill=1, stroke=0)
        elif kind == "sign":
            sx, sy = x + w * a[0], y + h * a[1]
            c.setFillColor(white)
            c.rect(sx, sy, w * 0.26, h * 0.12, fill=1, stroke=0)
            text(c, "medLYFE", sx + 6, sy + h * 0.035, "Helvetica-Bold", 6.5, GREEN)
        elif kind == "counter":
            c.setFillColor(white)
            c.rect(x + w * a[0], y, w * 0.4, h * 0.3, fill=1, stroke=0)
            c.setStrokeColor(SAGE_D)
            c.rect(x + w * a[0], y, w * 0.4, h * 0.3, fill=0, stroke=1)
        elif kind == "bed":
            c.setFillColor(white)
            c.rect(x + w * 0.1, y + h * 0.16, w * 0.5, h * 0.14, fill=1, stroke=0)
            c.setFillColor(SAGE_D)
            c.rect(x + w * 0.12, y, w * 0.03, h * 0.16, fill=1, stroke=0)
            c.rect(x + w * 0.55, y, w * 0.03, h * 0.16, fill=1, stroke=0)
            c.setFillColor(HexColor("#D9E3E6"))
            c.circle(x + w * 0.75, y + h * 0.85, h * 0.1, fill=1, stroke=0)
        elif kind == "tray":
            c.setFillColor(white)
            c.rect(x + w * 0.15, y + h * 0.08, w * 0.7, h * 0.3, fill=1, stroke=0)
            c.setFillColor(SAGE_D)
            for i in range(5):
                c.rect(x + w * (0.22 + i * 0.12), y + h * 0.18, w * 0.06, h * 0.1, fill=1, stroke=0)
        elif kind == "hand":
            c.setFillColor(FIG)
            c.roundRect(x + w * a[0], y + h * a[1], w * 0.2, h * 0.12, 6, fill=1, stroke=0)
        elif kind == "building":
            bx, bw = x + w * 0.12, w * 0.76
            c.setFillColor(HexColor("#D8D2C4"))
            c.rect(bx, y + h * 0.12, bw, h * 0.62, fill=1, stroke=0)
            c.setFillColor(white)
            for r in range(2):
                for k in range(5):
                    c.rect(bx + 8 + k * bw / 5.2, y + h * (0.22 + r * 0.26), bw / 8, h * 0.14, fill=1, stroke=0)
            c.setStrokeColor(SAND)
            c.setLineWidth(1)
            sx = bx + bw * 0.6
            for k in range(4):
                c.line(sx + k * bw * 0.1, y + h * 0.12, sx + k * bw * 0.1, y + h * 0.8)
            for r in range(4):
                c.line(sx, y + h * (0.2 + r * 0.18), sx + bw * 0.3, y + h * (0.2 + r * 0.18))
        elif kind == "hats":
            for fx in a:
                c.setFillColor(HexColor("#E8B83A"))
                c.wedge(x + w * fx - 9, y + h * 0.66, x + w * fx + 9, y + h * 0.66 + 18, 0, 180, fill=1, stroke=0)
        elif kind == "plans":
            c.setFillColor(HexColor("#DCE7F0"))
            c.rect(x + w * 0.12, y + h * 0.08, w * 0.76, h * 0.42, fill=1, stroke=0)
            c.setStrokeColor(HexColor("#6E8EAA"))
            c.setLineWidth(0.8)
            c.rect(x + w * 0.2, y + h * 0.14, w * 0.3, h * 0.3, fill=0, stroke=1)
            c.rect(x + w * 0.5, y + h * 0.14, w * 0.3, h * 0.18, fill=0, stroke=1)
        elif kind == "room":
            c.setFillColor(white)
            c.rect(x, y, w, h, fill=1, stroke=0)
            c.setFillColor(SAGE)
            c.rect(x, y, w, h * 0.22, fill=1, stroke=0)
            c.setFillColor(CREAM)
            c.rect(x + w * 0.62, y + h * 0.3, w * 0.24, h * 0.42, fill=1, stroke=0)
        elif kind == "fig":
            figure(c, x + w * a[0], y + h * a[2], h * a[1])
        elif kind == "extra":
            figure(c, x + w * a[0], y + h * a[2], h * a[1], FIG_SOFT)
        elif kind == "title":
            c.setFillColor(HexColor("#000000"))
            c.setFillAlpha(0.35)
            c.rect(x, y + h * 0.36, w, h * 0.28, fill=1, stroke=0)
            c.setFillAlpha(1)
            c.setFont(DISPLAY, 13)
            c.setFillColor(white)
            c.drawCentredString(x + w / 2, y + h * 0.46, a[0])
        elif kind == "card":
            c.setFillColor(DEEP)
            c.rect(x, y, w, h, fill=1, stroke=0)
            c.setFont(DISPLAY, 12)
            c.setFillColor(white)
            c.drawCentredString(x + w / 2, y + h * 0.58, a[0])
            c.setFont("Helvetica", 7)
            c.setFillColor(SAGE)
            c.drawCentredString(x + w / 2, y + h * 0.4, a[1])


STATUS_COL = {"Filmed": GREEN, "Mon 2 Nov": SAND, "Later": MUTED, "Edit": HexColor("#6E8EAA")}


def frame(c, x, top, w, n, shot, props, action, audio, status, secs):
    h = w * 9 / 16
    y = top - h
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, 5)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(SAGE)
    c.rect(x, y, w, h, fill=1, stroke=0)
    draw_props(c, x, y, w, h, props)
    c.setStrokeColor(white)
    c.setLineWidth(0.4)
    c.setDash(2, 3)
    for k in ((1, 2) if props[0][0] != "card" else ()):
        c.line(x + w * k / 3, y, x + w * k / 3, y + h)
        c.line(x, y + h * k / 3, x + w, y + h * k / 3)
    c.restoreState()
    c.setStrokeColor(RULE)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 5, fill=0, stroke=1)
    # number badge
    c.setFillColor(INK)
    c.roundRect(x + 6, top - 18, 22, 13, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(white)
    c.drawCentredString(x + 17, top - 14, f"{n:02d}")
    # status chip
    sw = c.stringWidth(status, "Helvetica-Bold", 6.5) + 10
    c.setFillColor(STATUS_COL.get(status, MUTED))
    c.roundRect(x + w - sw - 6, top - 17, sw, 11, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawString(x + w - sw - 1, top - 13.5, status)
    # caption
    cy = y - 11
    text(c, f"{shot}   /   {secs}", x, cy, "Helvetica-Bold", 7.6, GREEN)
    cy -= 11
    for ln in wrap(c, action, "Helvetica", 7.8, w)[:3]:
        text(c, ln, x, cy, "Helvetica", 7.8, BODY)
        cy -= 10
    for ln in wrap(c, audio, "Helvetica-Oblique", 7.4, w)[:2]:
        text(c, ln, x, cy, "Helvetica-Oblique", 7.4, MUTED)
        cy -= 9.5


def board(c, frames, top):
    cols, gap = 3, 16
    w = (PAGE_W - 2 * MX - gap * (cols - 1)) / cols
    row_h = w * 9 / 16 + 66
    for i, f in enumerate(frames):
        r, k = divmod(i, cols)
        frame(c, MX + k * (w + gap), top - r * row_h, w, *f)


# ----------------------------------------------------------- content ---------
EP1_A = [
    (1, "Close-up", [("phone", "Where are you?", "Home.")],
     "Her phone lights up on a half-unpacked suitcase. She types one word back.",
     "Message tone. No music yet.", "Filmed", "0:00 to 0:08"),
    (2, "Wide", [("sky",), ("car", 0.5)],
     "Morning. The car comes up the estate drive and stops.",
     "Music in, soft. Engine settles.", "Mon 2 Nov", "0:08 to 0:14"),
    (3, "Close-up", [("sky",), ("bags", 0.3, 0.52)],
     "The driver lifts the suitcases from the boot and sets them down.",
     "Natural sound: boot, wheels on paving.", "Mon 2 Nov", "0:14 to 0:18"),
    (4, "Medium, from behind", [("sky",), ("fig", 0.55, 0.9, 0.0), ("bags", 0.15)],
     "She walks towards the house. The camera follows, a few steps behind.",
     "Her voice begins: why she came home (question 1).", "Mon 2 Nov", "0:18 to 0:30"),
    (5, "Medium, seated", [("pool",), ("extra", 0.15, 0.55, 0.22), ("extra", 0.85, 0.5, 0.24),
                           ("fig", 0.5, 0.95, 0.0), ("title", "Welcome Back, Dr Chinwe")],
     "By the pool, in shade, people at ease in the background. The title comes up.",
     "Title card over her first full answer.", "Mon 2 Nov", "0:30 to 0:45"),
    (6, "Wide", [("counter", 0.05), ("fig", 0.62, 0.8, 0.0), ("extra", 0.2, 0.7, 0.2),
                 ("extra", 0.34, 0.7, 0.2), ("sign", 0.68, 0.78)],
     "MedLYFE reception. The team greet her as she comes in.",
     "Natural sound: the welcome. Her voice returns under it.", "Filmed", "0:45 to 1:05"),
]

EP1_B = [
    (7, "Tracking", [("corridor",), ("sign", 0.06, 0.74), ("fig", 0.5, 0.55, 0.12)],
     "She walks the corridor to the consultation room door.",
     "Voice: what she saw in Lagos; women flying abroad (question 3).", "Filmed", "1:05 to 1:25"),
    (8, "Medium two-shot", [("room",), ("bed",), ("fig", 0.3, 0.85, 0.0), ("extra", 0.72, 0.8, 0.0)],
     "In the procedure room she shows the nurse how she wants it set up.",
     "Their conversation, then her voice: what natural means (question 2).", "Filmed", "1:25 to 1:50"),
    (9, "Close-up", [("tray",), ("hand", 0.3, 0.42), ("hand", 0.58, 0.48)],
     "Her hands at the instrument tray; the nurse follows her lead.",
     "Voice continues: what she will not do.", "Filmed", "1:50 to 2:00"),
    (10, "Medium", [("room",), ("desk",), ("screen", 0.62), ("fig", 0.35, 0.9, 0.05)],
     "At her desk. The booking page is open on the screen. Papers to sign.",
     "Voice: the hardest part of building this (question 4).", "Mon 2 Nov", "2:00 to 2:30"),
    (11, "Close-up", [("desk",), ("paper",), ("pen",)],
     "The pen on the page. She signs and closes the folder.",
     "Natural sound: pen, folder.", "Mon 2 Nov", "2:30 to 2:36"),
    (12, "Medium close-up, then card",
     [("card", "Private consultations in Lagos", "Book through MedLYFE  /  number and link")],
     "Back by the pool: one surgeon from first consultation to final review (question 5). End card.",
     "Music resolves. Next time: the Lyfe Place, Lekki.", "Mon 2 Nov", "2:36 to 3:20"),
]

EP2 = [
    (1, "Wide", [("sky",), ("building",), ("hats", 0.3, 0.42)],
     "The Lyfe Place, Lekki, from across the road. Builders at work; the scaffold on one side.",
     "Site sound. Music in.", "Later", "0:00 to 0:10"),
    (2, "Medium, walking", [("sky",), ("building",), ("fig", 0.4, 0.75, 0.0), ("fig", 0.6, 0.75, 0.0),
                            ("hats", 0.4, 0.6)],
     "Dr Chinwe and Dr Itunu arrive with the site manager and walk in, hard hats on.",
     "Natural sound. Dr Chinwe's voice: what this building is for.", "Later", "0:10 to 0:30"),
    (3, "Close-up", [("plans",), ("hand", 0.3, 0.5), ("hand", 0.6, 0.55)],
     "The plans unrolled on a trestle. A finger traces the patient's route through the floor.",
     "Voice: one route from consultation to recovery.", "Later", "0:30 to 0:45"),
    (4, "Wide, interior", [("room",), ("fig", 0.4, 0.7, 0.0)],
     "A finished room. She stands where the consultation chair will go.",
     "Her line, in the room: this will be where we meet.", "Later", "0:45 to 1:15"),
    (5, "Two-shot", [("room",), ("fig", 0.3, 0.9, 0.0), ("fig", 0.7, 0.9, 0.0)],
     "Dr Itunu and Dr Chinwe in conversation: why Lagos, why now, what comes next.",
     "Their conversation carries the scene.", "Later", "1:15 to 2:30"),
    (6, "Medium, then wide",
     [("card", "The Lyfe Place, Lekki", "Register your interest  /  number and link")],
     "A handshake, then the camera pulls back to the building. End card.",
     "Music resolves.", "Later", "2:30 to 3:00"),
]


def cover(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    pw = PAGE_W * 0.4
    c.setFillColor(GREEN)
    c.rect(PAGE_W - pw, 0, pw, PAGE_H, fill=1, stroke=0)
    img = ImageReader(str(PORTRAIT))
    iw, ih = img.getSize()
    h = PAGE_H - 90
    w = h * iw / ih
    c.drawImage(img, PAGE_W - pw / 2 - w / 2, 45, width=w, height=h, mask="auto")
    logo(c, MX, PAGE_H - 70, 26)
    c.setFillColor(SAND)
    c.rect(MX, PAGE_H - 200, 30, 3, fill=1, stroke=0)
    text(c, "A CONTENT SERIES", MX, PAGE_H - 222, "Helvetica-Bold", 9, GREEN)
    text(c, "Welcome Back,", MX, PAGE_H - 270, DISPLAY, 42, INK)
    text(c, "Dr Chinwe", MX, PAGE_H - 318, DISPLAY, 42, INK)
    text(c, "Building a natural aesthetics practice in Lagos", MX, PAGE_H - 352, "Helvetica", 14, BODY)
    text(c, "The story, the storyboards and the release plan", MX, PAGE_H - 372, "Helvetica", 11, MUTED)
    text(c, "For Dr Chinwe Kpaduwa and Dr Itunu Akinware", MX, 70, "Helvetica-Bold", 9.5, DEEP)
    text(c, "Prepared by Consult For Africa  /  31 October 2026", MX, 54, "Helvetica", 9, MUTED)


def build() -> Path:
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))
    c.setTitle("Welcome Back, Dr Chinwe")
    c.setAuthor("Consult For Africa")
    W = PAGE_W - 2 * MX

    # 1 cover
    _N[0] += 1
    cover(c)
    c.showPage()

    # 2 the series in one page
    y = chrome(c, "The series", "A surgeon comes home to build the practice Lagos women have been flying abroad for")
    left = W * 0.58
    bullets(c, [
        ("Title:", "Welcome Back, Dr Chinwe. Building a natural aesthetics practice in Lagos."),
        ("The story:", "Dr Chinwe trained and practised abroad, and has come home. Each episode follows "
                       "one step of building her practice, in her own words."),
        ("Who it is for:", "Lagos women who have looked at London or Dubai for aesthetic care, and the "
                           "doctors who refer them."),
        ("What it does:", "Builds trust before a first consultation. A viewer meets the surgeon, sees the "
                          "clinic and hears how she works before she books."),
        ("The thread:", "Natural results. Looking rested, not done. One surgeon from the first "
                        "consultation to the final review."),
        ("The format:", "One episode for each visit home, 3 to 4 minutes, with a 60-second cut and "
                        "short clips from every episode."),
        ("The voice:", "Hers. No narrator; the conversation by the pool carries each episode."),
    ], MX, y - 14, left)
    callout(c, MX + left + 26, y - 4, W - left - 26,
            "Every episode ends with a way to book. The journey is never a waiting room.")
    callout(c, MX + left + 26, y - 110, W - left - 26,
            "Coming home is the hook, and it repeats: each visit home is a new episode.", size=10.5)
    c.showPage()

    # 3 the arc
    y = chrome(c, "The arc", "Three chapters, one episode for each step and each visit home")
    rows = [
        ["Episode", "Chapter", "When", "Where", "What the viewer comes away with", "Status"],
        ["1. Welcome Back", "Coming home", "November 2026", "Estate, MedLYFE clinic",
         "She is here, she is seeing patients, and this is how she works", "Clinic filmed; estate Mon 2 Nov"],
        ["2. The Build", "Building", "A day that suits Dr Itunu", "The Lyfe Place, Lekki",
         "A real practice is being built, with a group behind it", "To film"],
        ["3. Your First Hour", "Building", "November 2026", "MedLYFE clinic",
         "What a first consultation is like, and that she will say no when surgery is wrong", "Filmed"],
        ["4. Back Again", "Open", "First visit of 2027", "The Lyfe Place, Lekki",
         "She keeps coming back, and her patients are followed up by her", "Plan on her return"],
        ["5. One Year On", "Open", "Last visit of 2027", "The Lyfe Place, Lekki",
         "What the practice has become; the team she has built", "Plan on her return"],
    ]
    y = table(c, rows, MX, y - 6, [W * 0.15, W * 0.1, W * 0.14, W * 0.16, W * 0.29, W * 0.16])
    bullets(c, [
        ("Between visits:", "clips, the doctor films and a waiting list for her next visit keep the series "
                            "running while she is away."),
        ("The five films from Thursday and Friday:", "Episode 3 is built from the clinic film; the patient "
                                                     "and doctor films run alongside as clips."),
    ], MX, y - 26, W, size=11)
    c.showPage()

    # 4 episode 1 beat sheet
    y = chrome(c, "Episode 1  /  Welcome Back", "She is home, and the practice is already running")
    rows = [
        ["Time", "Beat", "Picture", "What we hear"],
        ["0:00", "Cold open", "Phone on a suitcase: \"Where are you?\" She types \"Home.\"", "Message tone"],
        ["0:08", "Arrival", "The car up the drive; suitcases out; she walks to the house",
         "Her voice: why she came home"],
        ["0:30", "Title", "By the pool. Welcome Back, Dr Chinwe", "Her first full answer"],
        ["0:45", "The clinic", "The MedLYFE team welcome her; the corridor; the consultation room door",
         "Natural sound, then: what she saw in Lagos"],
        ["1:25", "The work", "Setting up the procedure room with the nurse; her hands at the tray",
         "Their conversation, then: what natural means and what she will not do"],
        ["2:00", "The builder", "At her desk; the booking page; she signs", "The hardest part of building this"],
        ["2:36", "The promise", "Back by the pool", "One surgeon from first consultation to final review"],
        ["3:05", "Close", "End card: private consultations in Lagos, with the number and link",
         "Next time: the Lyfe Place, Lekki"],
    ]
    y = table(c, rows, MX, y - 6, [W * 0.07, W * 0.12, W * 0.48, W * 0.33])
    text(c, "Running time about 3 minutes 20 seconds. The lines are the sense of each answer; "
            "Dr Chinwe says them her own way.", MX, y - 18, "Helvetica-Oblique", 9, MUTED)
    c.showPage()

    # 5, 6 storyboards
    y = chrome(c, "Episode 1  /  Storyboard, frames 1 to 6", "Coming home")
    board(c, EP1_A, y - 4)
    c.showPage()
    y = chrome(c, "Episode 1  /  Storyboard, frames 7 to 12", "At work, and the promise")
    board(c, EP1_B, y - 4)
    c.showPage()

    # 7 episode 2
    y = chrome(c, "Episode 2  /  The Build", "The Lyfe Place, Lekki, with Dr Itunu")
    board(c, EP2, y - 4)
    c.showPage()

    # 8 the conversation by the pool
    y = chrome(c, "The conversation by the pool", "The questions that carry the first episode, and set up the rest")
    rows = [
        ["", "Question", "Where it plays"],
        ["1", "When did you decide to come home and practise in Lagos?", "Arrival"],
        ["2", "What does natural mean in your work, and what will you not do?", "The procedure room"],
        ["3", "What did you see in Lagos that told you women here were underserved?", "The clinic corridor"],
        ["4", "What has been the hardest part of building this?", "The desk"],
        ["5", "Why does it matter that one surgeon sees a patient from first consultation to final review?",
         "Close"],
        ["6", "What will a woman find at the Lyfe Place that she would otherwise fly abroad for?", "Episode 2"],
        ["7", "What do you want a patient to feel when she leaves you?", "Clips"],
        ["8", "What does this practice look like a year from now?", "Episode 5"],
    ]
    y = table(c, rows, MX, y - 6, [W * 0.05, W * 0.7, W * 0.25])
    text(c, "A guide, not a script. Answers in her own words, as long or short as she likes.",
         MX, y - 20, "Helvetica-Oblique", 10, MUTED)
    c.showPage()

    # 9 cutdowns
    y = chrome(c, "From each episode", "One shoot, eight pieces, each with a way to book")
    rows = [
        ["Piece", "Length", "Shape", "Where it goes"],
        ["The episode", "3 to 4 minutes", "16:9", "YouTube, the MedLYFE site, WhatsApp to referring doctors"],
        ["The trailer", "60 seconds", "9:16 and 4:5", "Instagram, TikTok, WhatsApp status"],
        ["Three clips", "20 to 30 seconds each", "9:16", "Instagram, TikTok, WhatsApp status, one a week"],
        ["Quote cards", "Three lines in her words", "1:1", "Instagram feed and stories"],
        ["Stills", "Ten per episode", "4:5", "Instagram carousel, press, the MedLYFE site"],
    ]
    y = table(c, rows, MX, y - 6, [W * 0.18, W * 0.18, W * 0.14, W * 0.5])
    bullets(c, [
        ("Captions:", "on every clip, because most are watched with the sound off."),
        ("The end line:", "every piece closes on private consultations in Lagos, with the number and link."),
    ], MX, y - 24, W, size=11)
    c.showPage()

    # 10 release plan
    y = chrome(c, "Release plan, proposed", "The first episode goes out while Dr Chinwe is still in Lagos")
    rows = [
        ["Date", "What", "Note"],
        ["Mon 2 Nov", "Estate morning: arrival, desk, the conversation by the pool", "8:00 to 11:00"],
        ["Thu 5 Nov", "Episode 1 first cut to Dr Chinwe", "She sees every cut she appears in"],
        ["Fri 6 Nov", "Trailer", "From the Thursday and Friday footage"],
        ["Mon 9 Nov", "Episode 1: Welcome Back", "With the trailer and first clip"],
        ["Thu 12 Nov", "Episode 3: Your First Hour", "Built from the clinic film"],
        ["From 16 Nov", "Clips, one a week, and the doctor films to referrers", "Through December"],
        ["When filmed", "Episode 2: The Build", "Within a week of the Lekki shoot"],
        ["2027 visits", "Episodes 4 and 5", "Planned with her before each trip"],
    ]
    table(c, rows, MX, y - 6, [W * 0.15, W * 0.55, W * 0.3])
    c.showPage()

    # 11 production status
    y = chrome(c, "Where we are", "Half of the first episode is already filmed")
    rows = [
        ["Scene", "Episode", "Status", "Where"],
        ["Suitcase and phone", "1", "Filmed", "Thursday"],
        ["Clinic welcome and the corridor", "1", "Filmed", "MedLYFE clinic"],
        ["Procedure room with the nurse", "1", "Filmed", "MedLYFE clinic"],
        ["First consultation", "3", "Filmed", "MedLYFE clinic"],
        ["Arrival home", "1", "Monday 2 November", "The estate"],
        ["At the desk", "1", "Monday 2 November", "The estate"],
        ["The conversation by the pool", "1, 2, 5", "Monday 2 November", "The estate"],
        ["The build, and Dr Itunu", "2", "A day that suits Dr Itunu", "The Lyfe Place, Lekki"],
    ]
    table(c, rows, MX, y - 6, [W * 0.38, W * 0.12, W * 0.25, W * 0.25])
    c.showPage()

    # 12 ground rules and questions
    y = chrome(c, "Ground rules, and two questions", "What every episode keeps to")
    half = W * 0.55
    bullets(c, [
        ("Approval:", "Dr Chinwe sees every cut she appears in before it goes out."),
        ("Patients:", "no patient is shown or named. The patient in the films is played, and never shown "
                      "full face."),
        ("Claims:", "no before-and-after, no promised results and no prices on screen."),
        ("Paid promotion:", "only after ARCON approval, which MedLYFE holds."),
        ("Everyone on camera:", "signs a release first."),
        ("The name:", "Lyfe Plastics & Aesthetics by MedLYFE, on every end card."),
    ], MX, y - 14, half, size=11.5, leading=16, gap=9)
    qx = MX + half + 30
    qy = y - 4
    qy = callout(c, qx, qy, W - half - 30, "Dr Chinwe: does Monday morning at the estate work for you?",
                 size=10.5)
    qy = callout(c, qx, qy - 14, W - half - 30,
                 "Dr Itunu: would you be happy to appear in Episode 2 at the Lyfe Place, and which day suits you?",
                 size=10.5)
    c.showPage()

    c.save()
    return OUT


if __name__ == "__main__":
    print(build())
