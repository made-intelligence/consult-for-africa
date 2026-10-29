"""
Screen mock primitives for CFA software proposals.

A software proposal that shows no screens asks the client to buy a paragraph.
These helpers draw indicative phone and console frames straight onto the deck
canvas, at deck scale, so a mock costs a few lines rather than a design tool
and a round trip.

Two rules are deliberate.

The frames carry the CLIENT's palette, never CFA navy and gold. A mock in the
firm's own colours reads as the firm's product rather than the client's, and
the client has to imagine their brand onto it. Pass a palette into every call.

Nothing here is a design. The mocks show information architecture: what is on
the screen, in what order, and what the customer is being asked to do. The
deck says so on the page, because a client who mistakes a wireframe for a
finished design will litigate the colour of a button for a fortnight.

Used by scripts/build-greenhouse-deck.py.
"""

from __future__ import annotations

from dataclasses import dataclass

from reportlab.lib.colors import HexColor, white


# --------------------------------------------------------------- palette ----
@dataclass(frozen=True)
class Palette:
    """A client's colours, so the mocks are theirs and not the firm's."""
    ink: object          # headings and primary text
    body: object         # body text
    muted: object        # secondary text, placeholders
    accent: object       # the primary action
    accent_d: object     # pressed, headers, the dark field
    tint: object         # pale fill for cards and bars
    tint_d: object       # a second, slightly stronger tint
    rule: object         # hairlines and borders
    surface: object      # the screen ground
    warn: object         # the one attention colour


GREENHOUSE = Palette(
    ink=HexColor("#1C2E22"),
    body=HexColor("#3A4A40"),
    muted=HexColor("#8A9690"),
    accent=HexColor("#3F7D4E"),
    accent_d=HexColor("#204A2C"),
    tint=HexColor("#EEF4EC"),
    tint_d=HexColor("#DCE8D8"),
    rule=HexColor("#D6E0D2"),
    surface=HexColor("#FBFCFA"),
    warn=HexColor("#C2762C"),
)


# ------------------------------------------------------------- the frames ---
def phone(c, x, y, w=152.0, h=318.0, p=None, label=None, label_colour=None):
    """Device frame with a rounded bezel and a pill speaker. Returns the inner
    screen rect as (sx, sy, sw, sh), with the origin at its bottom left."""
    p = p or GREENHOUSE
    bez = 5.0

    c.setFillColor(HexColor("#20262A"))
    c.roundRect(x, y, w, h, 15, fill=1, stroke=0)

    sx, sy, sw, sh = x + bez, y + bez, w - 2 * bez, h - 2 * bez
    c.setFillColor(p.surface)
    c.roundRect(sx, sy, sw, sh, 11, fill=1, stroke=0)

    # the speaker pill, drawn over the screen ground so it reads as hardware
    c.setFillColor(HexColor("#20262A"))
    c.roundRect(x + w / 2.0 - 16, y + h - bez - 7.5, 32, 5, 2.5, fill=1, stroke=0)

    if label:
        c.setFont("Helvetica-Bold", 7.6)
        c.setFillColor(label_colour or p.muted)
        c.drawCentredString(x + w / 2.0, y - 13, label.upper())

    return sx, sy, sw, sh


def console(c, x, y, w, h, p=None, label=None, label_colour=None):
    """Desktop frame for the operations and admin screens, with a browser bar.
    Returns the inner viewport rect as (sx, sy, sw, sh)."""
    p = p or GREENHOUSE
    bar = 16.0
    bez = 3.0

    c.setFillColor(HexColor("#20262A"))
    c.roundRect(x, y, w, h, 7, fill=1, stroke=0)

    c.setFillColor(HexColor("#2E363B"))
    c.roundRect(x, y + h - bar - bez, w, bar + bez, 7, fill=1, stroke=0)
    c.rect(x, y + h - bar - bez, w, 6, fill=1, stroke=0)
    for i, col in enumerate(("#E06C5B", "#E3B341", "#5FA85C")):
        c.setFillColor(HexColor(col))
        c.circle(x + 12 + i * 10, y + h - bez - bar / 2.0, 3.0, fill=1, stroke=0)
    c.setFillColor(HexColor("#454E54"))
    c.roundRect(x + 48, y + h - bez - bar + 3.4, w - 62, bar - 6.8, 4, fill=1, stroke=0)

    sx, sy, sw, sh = x + bez, y + bez, w - 2 * bez, h - bar - 2 * bez
    c.setFillColor(p.surface)
    c.rect(sx, sy, sw, sh, fill=1, stroke=0)

    if label:
        c.setFont("Helvetica-Bold", 7.6)
        c.setFillColor(label_colour or p.muted)
        c.drawCentredString(x + w / 2.0, y - 13, label.upper())

    return sx, sy, sw, sh


# ------------------------------------------------------- screen furniture ---
def app_bar(c, sx, sy, sw, sh, title, p, sub=None, dark=True, h=30.0, radius=11.0):
    """Top bar. Returns the y of the content baseline below it. Pass radius=0
    on a console frame, whose viewport is square and would otherwise show four
    white notches where the bar's rounded corners fall short of the edge."""
    top = sy + sh
    c.setFillColor(p.accent_d if dark else p.tint)
    if radius:
        c.roundRect(sx, top - h, sw, h, radius, fill=1, stroke=0)
        c.rect(sx, top - h, sw, h - radius, fill=1, stroke=0)
    else:
        c.rect(sx, top - h, sw, h, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7.8)
    c.setFillColor(white if dark else p.ink)
    c.drawString(sx + 8, top - 13.5 if sub else top - h / 2.0 - 2.6, title)
    if sub:
        c.setFont("Helvetica", 6.4)
        c.setFillColor(HexColor("#B9CDBE") if dark else p.muted)
        c.drawString(sx + 8, top - 22.5, sub)
    return top - h - 9


def tabs(c, sx, sy, sw, items, p, active=0, h=15.0):
    """A row of section tabs. sy is the top of the row. Returns the y below."""
    c.setFillColor(p.tint)
    c.rect(sx, sy - h, sw, h, fill=1, stroke=0)
    cw = sw / float(len(items))
    for i, t in enumerate(items):
        if i == active:
            c.setFillColor(p.accent)
            c.rect(sx + i * cw + 4, sy - h, cw - 8, 2.0, fill=1, stroke=0)
        c.setFont("Helvetica-Bold" if i == active else "Helvetica", 6.0)
        c.setFillColor(p.accent if i == active else p.muted)
        c.drawCentredString(sx + i * cw + cw / 2.0, sy - h / 2.0 - 2.0, t)
    return sy - h - 8


def nav_bar(c, sx, sy, sw, items, p, active=0, h=24.0):
    """Bottom tab bar, pinned to the base of the screen."""
    c.setFillColor(white)
    c.roundRect(sx, sy, sw, h, 11, fill=1, stroke=0)
    c.rect(sx, sy + 11, sw, h - 11, fill=1, stroke=0)
    c.setStrokeColor(p.rule)
    c.setLineWidth(0.6)
    c.line(sx, sy + h, sx + sw, sy + h)
    cw = sw / float(len(items))
    for i, t in enumerate(items):
        cx = sx + i * cw + cw / 2.0
        c.setFillColor(p.accent if i == active else p.muted)
        c.circle(cx, sy + h - 8.5, 2.8, fill=1, stroke=0)
        c.setFont("Helvetica-Bold" if i == active else "Helvetica", 5.4)
        c.drawCentredString(cx, sy + 4.4, t)


def card(c, x, y, w, h, p, fill=None, border=True, radius=5.0):
    c.setFillColor(fill or white)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=0)
    if border:
        c.setStrokeColor(p.rule)
        c.setLineWidth(0.6)
        c.roundRect(x, y, w, h, radius, fill=0, stroke=1)


def text(c, s, x, y, size, colour, font="Helvetica"):
    c.setFont(font, size)
    c.setFillColor(colour)
    c.drawString(x, y, s)


def rtext(c, s, x, y, size, colour, font="Helvetica"):
    c.setFont(font, size)
    c.setFillColor(colour)
    c.drawRightString(x, y, s)


def stub(c, x, y, w, p, h=2.6, colour=None):
    """A grey text stub, for copy that is not the point of the mock."""
    c.setFillColor(colour or p.tint_d)
    c.roundRect(x, y, w, h, h / 2.0, fill=1, stroke=0)


def pill(c, x, y, label, p, bg=None, fg=None, size=5.6, pad=5.0, h=11.0):
    """A small status or filter chip. Returns its width."""
    w = c.stringWidth(label, "Helvetica-Bold", size) + 2 * pad
    c.setFillColor(bg or p.tint_d)
    c.roundRect(x, y, w, h, h / 2.0, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", size)
    c.setFillColor(fg or p.accent_d)
    c.drawString(x + pad, y + h / 2.0 - size / 2.0 + 0.6, label)
    return w


def button(c, x, y, w, label, p, h=18.0, bg=None, fg=None, size=7.0,
           outline=False):
    if outline:
        c.setFillColor(white)
        c.roundRect(x, y, w, h, 4, fill=1, stroke=0)
        c.setStrokeColor(bg or p.accent)
        c.setLineWidth(0.9)
        c.roundRect(x, y, w, h, 4, fill=0, stroke=1)
        c.setFillColor(bg or p.accent)
    else:
        c.setFillColor(bg or p.accent)
        c.roundRect(x, y, w, h, 4, fill=1, stroke=0)
        c.setFillColor(fg or white)
    c.setFont("Helvetica-Bold", size)
    c.drawCentredString(x + w / 2.0, y + h / 2.0 - size / 2.0 + 0.8, label)


def produce(c, cx, cy, r, p, kind=0):
    """A crude vegetable glyph, so a box tile is not an empty grey square.
    Deliberately simple: this is a wireframe, not an illustration."""
    if kind % 4 == 0:          # leaf
        c.setFillColor(p.accent)
        pth = c.beginPath()
        pth.moveTo(cx - r, cy - r * 0.5)
        pth.curveTo(cx - r * 0.4, cy + r, cx + r * 0.4, cy + r, cx + r, cy - r * 0.5)
        pth.curveTo(cx + r * 0.3, cy - r * 0.2, cx - r * 0.3, cy - r * 0.2,
                    cx - r, cy - r * 0.5)
        c.drawPath(pth, fill=1, stroke=0)
    elif kind % 4 == 1:        # tomato
        c.setFillColor(HexColor("#C4553B"))
        c.circle(cx, cy - r * 0.1, r * 0.78, fill=1, stroke=0)
        c.setFillColor(p.accent)
        c.rect(cx - r * 0.1, cy + r * 0.5, r * 0.2, r * 0.42, fill=1, stroke=0)
    elif kind % 4 == 2:        # pepper
        c.setFillColor(HexColor("#D08A2B"))
        c.roundRect(cx - r * 0.5, cy - r * 0.85, r, r * 1.45, r * 0.5, fill=1, stroke=0)
        c.setFillColor(p.accent)
        c.rect(cx - r * 0.08, cy + r * 0.55, r * 0.16, r * 0.4, fill=1, stroke=0)
    else:                      # cucumber
        c.setFillColor(HexColor("#4E8C44"))
        c.saveState()
        c.translate(cx, cy)
        c.rotate(28)
        c.roundRect(-r * 0.3, -r * 0.9, r * 0.6, r * 1.8, r * 0.3, fill=1, stroke=0)
        c.restoreState()


def box_tile(c, x, y, w, h, p, title, price, note=None, kind=0, badge=None):
    """A produce box as the customer sees it in a list."""
    card(c, x, y, w, h, p)
    ih = h * 0.52
    c.setFillColor(p.tint)
    c.roundRect(x, y + h - ih, w, ih, 5, fill=1, stroke=0)
    c.rect(x, y + h - ih, w, ih - 5, fill=1, stroke=0)
    for i in range(3):
        produce(c, x + w * (0.27 + 0.23 * i), y + h - ih / 2.0, min(w, ih) * 0.17,
                p, kind + i)
    if badge:
        bw = pill(c, x + 5, y + h - 13.5, badge, p, bg=p.warn, fg=white, size=5.0,
                  h=9.5, pad=4.0)
        del bw
    text(c, title, x + 6, y + h - ih - 11, 6.9, p.ink, "Helvetica-Bold")
    text(c, price, x + 6, y + h - ih - 21, 7.4, p.accent, "Helvetica-Bold")
    if note:
        text(c, note, x + 6, y + 7, 5.6, p.muted)


def row(c, x, y, w, p, left, right=None, sub=None, h=22.0, chip=None,
        chip_bg=None, rule=True):
    """A list row for the console screens. y is the top of the row."""
    text(c, left, x, y - 8.5, 6.8, p.ink, "Helvetica-Bold")
    if sub:
        text(c, sub, x, y - 17, 5.7, p.muted)
    if chip:
        _bg = chip_bg or p.tint_d
        pill(c, x + w - 44, y - 13.5, chip, p, bg=_bg,
             fg=white if _bg is p.warn else None, size=5.2, h=10.0, pad=4.0)
    elif right:
        rtext(c, right, x + w, y - 10.5, 6.8, p.body, "Helvetica-Bold")
    if rule:
        c.setStrokeColor(p.rule)
        c.setLineWidth(0.5)
        c.line(x, y - h, x + w, y - h)
    return y - h


def bars(c, x, y, w, h, values, p, labels=None, colour=None, target=None):
    """A small column chart for the console mocks."""
    n = len(values)
    gap = w / float(n) * 0.34
    bw = (w - gap * (n - 1)) / float(n)
    top = max(values) or 1
    for i, v in enumerate(values):
        bh = max(1.4, h * v / float(top))
        c.setFillColor(colour or p.accent)
        c.roundRect(x + i * (bw + gap), y, bw, bh, 1.6, fill=1, stroke=0)
        if labels:
            c.setFont("Helvetica", 5.0)
            c.setFillColor(p.muted)
            c.drawCentredString(x + i * (bw + gap) + bw / 2.0, y - 7, labels[i])
    if target is not None:
        ty = y + h * target / float(top)
        c.setStrokeColor(p.warn)
        c.setLineWidth(0.7)
        c.setDash(2, 2)
        c.line(x, ty, x + w, ty)
        c.setDash()


def kpi(c, x, y, w, h, p, label, value, note=None, accent=None):
    card(c, x, y, w, h, p, fill=p.tint, border=False)
    c.setFillColor(accent or p.accent)
    c.rect(x, y, 2.4, h, fill=1, stroke=0)
    text(c, label.upper(), x + 8, y + h - 11, 5.4, p.muted, "Helvetica-Bold")
    text(c, value, x + 8, y + h - 25, 11.5, p.ink, "Helvetica-Bold")
    if note:
        text(c, note, x + 8, y + 7, 5.6, p.body)
