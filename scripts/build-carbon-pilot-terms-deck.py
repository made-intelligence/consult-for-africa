"""
Carbon pilot terms: Debo's reply to Chijioke Dozie's note after 8 October.

His note said yes to a pilot on five conditions (full recourse; our fee after
Carbon is repaid; HMO acknowledgment letters with every HMO receipt into the
Carbon account; the hospital's total cost shown; private HMOs only, diagnostic
centres in the first batch) and asked for interest that runs daily, above the
policy rate.

The answer, as Debo set it on 12 October 2026: yes to all five; we fund only
claims the HMO has already accepted, at 60%; Carbon charges 2.5% a month on the
actual days, with the HMO's expected time to pay as the minimum, taken as a
discount at disbursement; our fee is a fixed 1% of the advance, withheld and
released once Carbon is repaid and nothing is overdue.

Written as a reply between principals, not a pitch: each page takes one of his
points in his order and says how it works. Layout follows the ilé investor deck
(warm light grounds, Newsreader and Source Sans, labelled rows) in CFA's navy
and gold. Debo does not want dark pages. No em dashes, no chevrons.

    python3 scripts/build-carbon-pilot-terms-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_deck import PAGE_H, PAGE_W, wrap  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "scripts" / "fonts" / "ile"
OUT = ROOT / "docs" / "carbon" / "carbon-pilot-terms-deck-cfa.pdf"
SHARE = ROOT / "docs" / "Carbon - Pilot Terms (Deck).pdf"
LOGO = ROOT / "docs" / "c4a-logo.png"

for name, f in [("Serif", "Newsreader-Regular.ttf"), ("Serif-SB", "Newsreader-SemiBold.ttf"),
                ("Serif-I", "Newsreader-Italic.ttf"), ("Sans", "SourceSans3-Regular.ttf"),
                ("Sans-SB", "SourceSans3-SemiBold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / f)))

# CFA colours on ilé's warm grounds
NAVY = HexColor("#0B3C5D")
GOLD = HexColor("#D4AF37")
TEAL = HexColor("#1F7A8C")
INK = HexColor("#1B2A38")
BODY = HexColor("#45505A")
MUTED = HexColor("#7B858E")
GROUND = HexColor("#FCFBF8")
GROUND2 = HexColor("#F7F3EA")
NTINT = HexColor("#E4ECF2")
GTINT = HexColor("#F6EDCF")
RULE = HexColor("#E5DFD3")

MX = 54
W = PAGE_W - 2 * MX
TOTAL = 8
_N = [0]

CLAIM = 1_000_000
ADVANCE_RATE = 0.60
MONTHLY = 0.025
FEE_RATE = 0.01
MIN_DAYS = 60
MAX_DUE = 120
ADVANCE = CLAIM * ADVANCE_RATE
DISCOUNT = ADVANCE * MONTHLY * MIN_DAYS / 30
FEE = ADVANCE * FEE_RATE
NET = ADVANCE - DISCOUNT - FEE


def n(v):
    return "₦{:,.0f}".format(v)


# ---- primitives ---------------------------------------------------------------
def para(c, text, x, y, size=12, color=BODY, max_w=300, leading=None, font="Sans"):
    leading = leading or size * 1.38
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(c, text, font, size, max_w):
        c.drawString(x, y, line)
        y -= leading
    return y


def lines(c, text, font, size, max_w):
    return len(wrap(c, text, font, size, max_w))


def tracked(c, text, x, y, size=8.5, color=TEAL, font="Sans-SB", track=1.6):
    c.setFont(font, size)
    c.setFillColor(color)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + track
    return x


def tracked_w(c, text, size=8.5, font="Sans-SB", track=1.6):
    return sum(c.stringWidth(ch, font, size) + track for ch in text)


def card(c, x, y, w, h, fill=GROUND2, spine=None):
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
    if spine:
        c.setFillColor(spine)
        c.roundRect(x, y, 4, h, 2, fill=1, stroke=0)


def _clear_logo():
    """The logo file has a white ground; on the warm pages it shows as a box."""
    from PIL import Image
    im = Image.open(LOGO).convert("RGBA")
    im.putdata([(r, g, b, 0) if r > 245 and g > 245 and b > 245 else (r, g, b, a) for r, g, b, a in im.getdata()])
    return ImageReader(im)


_LOGO = []


def logo(c, x, y, h=16):
    if not _LOGO:
        _LOGO.append(_clear_logo())
    img = _LOGO[0]
    iw, ih = img.getSize()
    c.drawImage(img, x, y, width=h * iw / ih, height=h, mask="auto")


def chrome(c, kicker):
    _N[0] += 1
    c.setFillColor(GROUND)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 56, 20)
    k = kicker.upper()
    tracked(c, k, PAGE_W - MX - tracked_w(c, k), PAGE_H - 46)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(MX, 40, PAGE_W - MX, 40)
    c.setFont("Sans", 8)
    c.setFillColor(MUTED)
    c.drawString(MX, 26, "Consult for Africa  ·  Pilot terms for Carbon  ·  12 October 2026  ·  Confidential")
    c.drawRightString(PAGE_W - MX, 26, "%02d / %02d" % (_N[0], TOTAL))


def heading(c, text, y=PAGE_H - 100, size=24, max_w=None, color=INK):
    max_w = max_w or W
    c.setFont("Serif", size)
    c.setFillColor(color)
    for line in wrap(c, text, "Serif", size, max_w):
        c.drawString(MX, y, line)
        y -= size + 6
    return y


def sub(c, text, y, max_w=None):
    return para(c, text, MX, y, 10.5, MUTED, max_w or W * 0.8, 14)


def row(c, y, chip, body, quote=None, chip_w=150, fill=GROUND2, chip_fill=NAVY, size=11.5):
    """ilé's labelled row: a coloured chip, then the statement on a warm card."""
    bx = MX + chip_w + 8
    bw = PAGE_W - MX - bx
    qh = lines(c, quote, "Serif-I", 10.5, bw - 28) * 14 if quote else 0
    bh = lines(c, body, "Sans", size, bw - 28) * size * 1.36
    h = max(40, qh + bh + 22 + (4 if quote else 0))
    c.setFillColor(chip_fill)
    c.roundRect(MX, y - h, chip_w, h, 6, fill=1, stroke=0)
    para(c, chip, MX + 12, y - 22, 10.5, white, chip_w - 22, 13, "Sans-SB")
    c.setFillColor(fill)
    c.roundRect(bx, y - h, bw, h, 6, fill=1, stroke=0)
    ty = y - 22
    if quote:
        ty = para(c, quote, bx + 14, ty, 10.5, MUTED, bw - 28, 14, "Serif-I") - 4
    para(c, body, bx + 14, ty, size, INK, bw - 28, size * 1.36)
    return y - h - 8


def strip(c, text, y, h=30, fill=GOLD, color=INK):
    c.setFillColor(fill)
    c.roundRect(MX, y - h, W, h, 6, fill=1, stroke=0)
    c.setFont("Sans-SB", 11)
    c.setFillColor(color)
    c.drawCentredString(PAGE_W / 2, y - h / 2 - 4, text)
    return y - h


def figure(c, x, y, w, value, caption, fill=NTINT, vcol=NAVY, h=78):
    card(c, x, y - h, w, h, fill)
    c.setFont("Serif", 28)
    c.setFillColor(vcol)
    c.drawString(x + 16, y - 38, value)
    para(c, caption, x + 16, y - 56, 9.6, BODY, w - 30, 12.5)


# ---- 01 cover -----------------------------------------------------------------
def cover(c):
    _N[0] += 1
    c.setFillColor(GROUND)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    split = PAGE_W * 0.63
    c.setFillColor(NTINT)
    c.rect(split, 0, PAGE_W - split, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 84, 30)
    c.setFillColor(GOLD)
    c.rect(MX, 418, 30, 2.5, fill=1, stroke=0)
    tracked(c, "PREPARED FOR CARBON", MX, 398)
    y = 360
    for line in wrap(c, "Pilot terms for hospital receivables", "Serif", 34, split - MX - 50):
        c.setFont("Serif", 34)
        c.setFillColor(INK)
        c.drawString(MX, y, line)
        y -= 42
    para(c, "Our answers to your five points, how each one works, and what the hospital pays in total.",
         MX, y - 10, 12.5, BODY, split - MX - 70, 17)
    c.setFillColor(GROUND2)
    c.rect(0, 0, split, 70, fill=1, stroke=0)
    for dx, lab, val in [(0, "FOR", "Chijioke Dozie, Carbon"), (170, "FROM", "Dr Debo Odulana"), (310, "DATE", "12 October 2026")]:
        tracked(c, lab, MX + dx, 44, 7.5, MUTED)
        c.setFont("Sans", 10.5)
        c.setFillColor(INK)
        c.drawString(MX + dx, 26, val)
    rx = split + 34
    tracked(c, "THE TERMS", rx, PAGE_H - 120, 8.5, NAVY)
    for i, (v, l) in enumerate([("60%", "of the accepted claim, advanced"), ("2.5%", "a month to Carbon, 60 days minimum"), ("1%", "of the advance to us, once, paid last")]):
        yy = PAGE_H - 190 - i * 104
        c.setFont("Serif", 46)
        c.setFillColor(NAVY)
        c.drawString(rx, yy, v)
        para(c, l, rx + 2, yy - 22, 10.5, BODY, PAGE_W - rx - 34, 13.5)
    c.showPage()


# ---- 02 the reply on one page -------------------------------------------------
def s_reply(c):
    chrome(c, "Your five points")
    y = heading(c, "Yes to all five, with one change from us that makes them easier for a hospital to accept.")
    y = sub(c, "Your words in italics, our answer under them. The pages that follow take each point in turn.", y - 2)
    y -= 10
    pts = [
        ("Recourse", "Full recourse to the hospital on every advance, not only rejections it controlled.",
         "Agreed. The hospital repays any advance its HMO has not settled by the due date, whatever the reason."),
        ("Order of payment", "Your fee on a hospital's book comes out after Carbon has been repaid on it.",
         "Agreed. Our 1% is withheld at disbursement and released only while nothing on that book is overdue."),
        ("HMOs and the account", "Acknowledgment letters from the top HMOs, and all HMO receipts into the Carbon account.",
         "Agreed, as the default. I will take the letters to the HMOs myself, with the account openings."),
        ("Total cost", "What you charge the hospital for recovery. I want to see what the hospital pays in total.",
         "6% of the advance if the HMO pays inside 60 days, 11% at 120 days. Nothing else is charged."),
        ("Payors", "Private HMOs only, no government or military payers, and add diagnostic centres.",
         "Agreed. Diagnostic centres join the first batch alongside the hospitals."),
    ]
    for chip, q, a in pts:
        y = row(c, y, chip, a, q, chip_w=140, size=11)
    strip(c, "Our change: we only fund claims the HMO has already accepted, and never more than 60% of the accepted value.", y - 2, 30)
    c.showPage()


# ---- 03 recourse and order of payment -----------------------------------------
def s_recourse(c):
    chrome(c, "Points 1 and 2")
    y = heading(c, "Full recourse on every advance, and Carbon repaid before we are.")
    y -= 8
    lw = 470
    items = [
        ("Due date", f"Set per HMO from its payment record, {MAX_DUE} days after disbursement at most."),
        ("If the HMO is late", "Carbon recovers the advance and its interest from the hospital's other HMO receipts in the collection account, oldest overdue first. We keep pursuing the HMO for the hospital."),
        ("New draws", "Stop for that hospital while any of its advances is overdue."),
        ("Our fee", "Withheld at disbursement. Released only when the advance is repaid and nothing on the hospital's book is overdue."),
        ("Why overdue, not outstanding", "A revolving book is never at zero, so a test of nothing outstanding would never be met."),
    ]
    yy = y
    for chip, body in items:
        bx = MX + 140
        h = max(42, lines(c, body, "Sans", 11, lw - 140 - 26) * 15 + 22)
        c.setFillColor(NAVY)
        c.roundRect(MX, yy - h, 132, h, 6, fill=1, stroke=0)
        para(c, chip, MX + 12, yy - 22, 10.2, white, 112, 13, "Sans-SB")
        card(c, bx, yy - h, lw - 140, h)
        para(c, body, bx + 13, yy - 22, 11, INK, lw - 140 - 26, 15)
        yy -= h + 8

    rx = MX + lw + 24
    rw = PAGE_W - MX - rx
    card(c, rx, 60, rw, y - 60, NTINT)
    tracked(c, "WHEN AN HMO PAYS", rx + 20, y - 28, 8.5, NAVY)
    steps = [("1", "Carbon", "principal, and interest for any days past the minimum"),
             ("2", "Overdue advances", "on the same hospital's book, oldest first"),
             ("3", "Our 1%", "released from what was withheld, if nothing is overdue"),
             ("4", "The hospital", "everything else, within 48 hours")]
    sy = y - 64
    for num, t, s in steps:
        c.setFillColor(NAVY if num != "3" else GOLD)
        c.circle(rx + 32, sy + 4, 11, fill=1, stroke=0)
        c.setFont("Sans-SB", 11)
        c.setFillColor(white)
        c.drawCentredString(rx + 32, sy, num)
        c.setFont("Serif", 15)
        c.setFillColor(INK)
        c.drawString(rx + 54, sy, t)
        para(c, s, rx + 54, sy - 16, 10, BODY, rw - 74, 13)
        sy -= 72
    c.showPage()


# ---- 04 HMO letters and the account ---------------------------------------------
def s_account(c):
    chrome(c, "Point 3")
    y = heading(c, "The top HMOs sign before a hospital draws, and every HMO payment goes through Carbon.")
    y -= 10
    gap = 18
    cw = (W - gap) / 2
    h = 250
    card(c, MX, y - h, cw, h)
    tracked(c, "THE ACKNOWLEDGMENT LETTER", MX + 20, y - 28)
    c.setFont("Serif", 16)
    c.setFillColor(INK)
    c.drawString(MX + 20, y - 54, "Each HMO confirms, for each hospital:")
    ly = y - 88
    for i, t in enumerate(["the amount it has accepted on each claim;",
                           "that it pays into the hospital's collection account at Carbon;",
                           "that it will not set off older balances against funded claims without notice."]):
        c.setFont("Serif", 22)
        c.setFillColor(GOLD)
        c.drawString(MX + 20, ly - 4, str(i + 1))
        ly = para(c, t, MX + 48, ly, 11.5, INK, cw - 70, 15.5) - 14
    para(c, "I will take the letter to the HMOs myself, alongside the account openings.", MX + 20, y - h + 22, 10.5, MUTED, cw - 40, 14, "Serif-I")

    x2 = MX + cw + gap
    card(c, x2, y - h, cw, h, NTINT)
    tracked(c, "THE COLLECTION ACCOUNT", x2 + 20, y - 28, 8.5, NAVY)
    c.setFont("Serif", 16)
    c.setFillColor(INK)
    c.drawString(x2 + 20, y - 54, "Every HMO receipt, funded or not.")
    ay = para(c, "HMOs pay in batches across many claims, so routing everything through one account is also the only clean way to reconcile. The split is recorded claim by claim the day the money lands.",
              x2 + 20, y - 84, 11.5, INK, cw - 40, 15.5)
    para(c, "Whatever is not owed to Carbon, or to us under the waterfall, goes to the hospital's operating account within 48 hours, so it keeps its working capital.",
         x2 + 20, ay - 10, 11.5, INK, cw - 40, 15.5)

    yy = y - h - 18
    figure(c, MX, yy, (W - 2 * gap) / 3, "60%", "of a hospital's HMO billing must be on signed HMOs before it draws")
    figure(c, MX + (W - 2 * gap) / 3 + gap, yy, (W - 2 * gap) / 3, "Signed only", "claims are funded only on the HMOs that have signed")
    figure(c, MX + 2 * ((W - 2 * gap) / 3 + gap), yy, (W - 2 * gap) / 3, "48 hours", "for the hospital's share to leave the collection account", GTINT)
    c.showPage()


# ---- 05 what the hospital pays -------------------------------------------------
def s_price(c):
    chrome(c, "Point 4")
    y = heading(c, "On every ₦1,000,000 the HMO accepts, the hospital pays 6% of the advance if the HMO pays within 60 days, and 11% at 120.")
    y -= 6
    rows = [
        ("Advance, 60% of the accepted claim", n(ADVANCE), ""),
        ("Carbon's interest for the first 60 days, 2.5% a month", "less " + n(DISCOUNT), "taken at disbursement"),
        ("Our fee, 1% of the advance", "less " + n(FEE), "withheld, paid after Carbon"),
        ("Reaches the hospital on day one", n(NET), "within 48 hours"),
    ]
    lw = 440
    yy = y
    for i, (a, b, s) in enumerate(rows):
        last = i == len(rows) - 1
        h = 36
        card(c, MX, yy - h, lw, h, NTINT if last else GROUND2)
        c.setFont("Sans-SB" if last else "Sans", 11)
        c.setFillColor(INK)
        c.drawString(MX + 14, yy - 22, a)
        c.setFont("Serif-SB" if last else "Serif", 13)
        c.setFillColor(NAVY)
        c.drawRightString(MX + lw - 14, yy - 22, b)
        if s:
            c.setFont("Sans", 8.5)
            c.setFillColor(MUTED)
            c.drawRightString(MX + lw - 14, yy - 33, s)
        yy -= h + 6

    tracked(c, "TOTAL COST BY THE DAY THE HMO PAYS", MX, yy - 22)
    by = yy - 40
    maxv = ADVANCE * (MONTHLY * 4 + FEE_RATE)
    barw = lw - 190
    for days in (30, 60, 90, 120):
        cost = ADVANCE * (MONTHLY * max(days, MIN_DAYS) / 30 + FEE_RATE)
        c.setFont("Sans", 10.5)
        c.setFillColor(BODY)
        c.drawString(MX, by - 4, f"{days} days")
        w = barw * cost / maxv
        c.setFillColor(NAVY)
        c.roundRect(MX + 70, by - 9, w, 16, 3, fill=1, stroke=0)
        c.setFont("Sans-SB", 10.5)
        c.setFillColor(INK)
        c.drawString(MX + 78 + w, by - 4, f"{n(cost)}  ({cost / ADVANCE:.1%})")
        by -= 26

    rx = MX + lw + 26
    rw = PAGE_W - MX - rx
    card(c, rx, 60, rw, y - 60, GROUND2, spine=GOLD)
    tracked(c, "ON YOUR RATE POINT", rx + 22, y - 28)
    ty = para(c, "Interest now runs daily on the days the money is out, with the HMO's expected time to pay as the minimum. Days beyond it come out of the HMO's payment.",
              rx + 22, y - 56, 11.5, INK, rw - 44, 15.5)
    c.setFont("Serif", 40)
    c.setFillColor(NAVY)
    c.drawString(rx + 22, ty - 52, "30%+")
    para(c, "a year to Carbon on the days its money is out, never less, and more when an HMO pays early. The CBN policy rate is 23%.",
         rx + 22, ty - 74, 10.5, BODY, rw - 44, 14)
    para(c, "Recovery of claims an HMO has not yet accepted is separate work, agreed with the hospital and paid behind Carbon. It never touches the funded book.",
         rx + 22, 112, 10, MUTED, rw - 44, 13.5, "Serif-I")
    c.showPage()


# ---- 06 who is in the first batch --------------------------------------------------
def s_batch(c):
    chrome(c, "Point 5")
    y = heading(c, "Private HMOs only, with diagnostic centres alongside the hospitals in the first batch.")
    y -= 10
    gap = 18
    cw = (W - gap) / 2
    h = 130
    card(c, MX, y - h, cw, h, NTINT)
    tracked(c, "FUNDED", MX + 20, y - 28, 8.5, NAVY)
    c.setFont("Serif", 20)
    c.setFillColor(INK)
    c.drawString(MX + 20, y - 60, "Private HMOs")
    para(c, "Claims each HMO has accepted, from HMOs that have signed the letter for that hospital.", MX + 20, y - 86, 11.5, INK, cw - 40, 15.5)
    card(c, MX + cw + gap, y - h, cw, h)
    tracked(c, "NOT FUNDED", MX + cw + gap + 20, y - 28, 8.5, MUTED)
    c.setFont("Serif", 20)
    c.setFillColor(INK)
    c.drawString(MX + cw + gap + 20, y - 60, "Every other payor")
    para(c, "NHIA, state schemes, military and corporate accounts. Their claims can still come through the desk for recovery, but are never advanced against.",
         MX + cw + gap + 20, y - 86, 11.5, INK, cw - 40, 15.5)
    yy = y - h - 18
    yy = row(c, yy, "Hospitals", "Private hospitals with a meaningful HMO book. Each starts with a free review of its outstanding claims before anything is signed.", chip_w=140)
    row(c, yy, "Diagnostic centres", "Small, frequent claims priced off standard tariffs, which suit a first tranche. Same review, same rules, same letters.", chip_w=140, chip_fill=TEAL)
    c.showPage()


# ---- 07 the ninety days ----------------------------------------------------------
def s_pilot(c):
    chrome(c, "The pilot")
    y = heading(c, "If these land, free reviews start this month and the first tranche follows.")
    y -= 14
    steps = [
        ("Weeks 0 to 2", "Terms", "Facility agreement signed by Carbon, the hospital and us. Collection accounts opened."),
        ("Weeks 2 to 4", "HMO letters and reviews", "Letters taken to the top HMOs. Free reviews of each facility's outstanding claims."),
        ("Week 4", "First tranche", "To the first facility whose HMOs have signed, against claims they have accepted."),
        ("Day 90", "Review", "Rate, recourse and facility sizes reset on the pilot's own numbers."),
    ]
    cw = (W - 3 * 14) / 4
    for i, (when, what, body) in enumerate(steps):
        x = MX + i * (cw + 14)
        card(c, x, y - 160, cw, 160, GTINT if i == 2 else GROUND2)
        tracked(c, when.upper(), x + 16, y - 26, 8, NAVY)
        c.setFont("Serif", 18)
        c.setFillColor(INK)
        ty = y - 56
        for ln in wrap(c, what, "Serif", 18, cw - 32):
            c.drawString(x + 16, ty, ln)
            ty -= 22
        para(c, body, x + 16, ty - 6, 10.5, BODY, cw - 32, 14)
    yy = y - 160 - 22
    yy = row(c, yy, "Agreed first", "The loss rate that stops the pilot, and the payment record that lifts an HMO's advance or a facility's limit.", chip_w=140)
    row(c, yy, "Already built", "Our desk already records HMO acceptance and the letters, fixes each advance's terms at disbursement, splits every receipt and produces the book for Carbon each week.", chip_w=140, chip_fill=TEAL)
    c.showPage()


# ---- 08 what we need -------------------------------------------------------------
def s_need(c):
    chrome(c, "From Carbon")
    y = heading(c, "Three things from Carbon, and we can start.")
    y -= 14
    items = [("Credit criteria", "and the facility limit you want for each hospital and diagnostic centre."),
             ("Letter wording", "for the HMO acknowledgment, from your counsel, so the HMOs see one version."),
             ("Data format", "for the claim-level book and receipts: a weekly file now, a feed later.")]
    cw = (W - 2 * 18) / 3
    for i, (t, s) in enumerate(items):
        x = MX + i * (cw + 18)
        card(c, x, y - 170, cw, 170, NTINT if i == 0 else GROUND2)
        c.setFont("Serif", 34)
        c.setFillColor(GOLD)
        c.drawString(x + 18, y - 50, f"{i + 1}")
        c.setFont("Serif", 19)
        c.setFillColor(INK)
        c.drawString(x + 18, y - 86, t)
        para(c, s, x + 18, y - 108, 11, BODY, cw - 36, 14.5)
    yy = y - 170 - 40
    c.setFillColor(GOLD)
    c.rect(MX, yy, 30, 2.5, fill=1, stroke=0)
    c.setFont("Serif", 15)
    c.setFillColor(INK)
    c.drawString(MX, yy - 30, "Debo")
    c.setFont("Sans", 10.5)
    c.setFillColor(BODY)
    c.drawString(MX, yy - 48, "Dr Debo Odulana  ·  Founding Partner, Consult for Africa  ·  hello@consultforafrica.com  ·  +234 913 813 8553")
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Carbon: Pilot Terms")
    c.setAuthor("Consult for Africa")
    for fn in (cover, s_reply, s_recourse, s_account, s_price, s_batch, s_pilot, s_need):
        fn(c)
    c.save()
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
