"""
Grandville Medical Group: the growth, referrals and partnership proposal deck.

The one-page fee sheet ("Consult for Africa x Grandville Growth Proposal 3")
set as a landscape deck. Same services, fees and terms; short copy, one idea
per slide.

Run:
  python3 scripts/build-grandville-proposal-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib.colors import white           # noqa: E402
from reportlab.lib.pagesizes import landscape, A4  # noqa: E402
from reportlab.pdfgen import canvas              # noqa: E402
from reportlab.lib.utils import ImageReader      # noqa: E402

import cfa_deck as D                             # noqa: E402
from cfa_deck import (                           # noqa: E402
    BODY, CREAM, DOCS, GOLD, INK, MX, NAVY, PAGE_H, PAGE_W, SAGE, SKY, SURFACE,
    SERIF_B, SERIF_I, TEAL, DEEP_NAVY,
    box, bullet_block, callout, chrome, heading, para, simple_table, tracked, wrap,
)

OUT = ROOT / "docs" / "grandville" / "grandville-growth-proposal-deck-cfa.pdf"
SHARE = ROOT / "docs" / "Grandville Medical Group - Growth Proposal (Deck).pdf"

D.FOOTER[0] = "Consult for Africa   /   Private and confidential   /   Grandville Medical Group"
D.TOTAL[0] = "08"

W = PAGE_W - 2 * MX
PANEL_W = 240


def money(n):
    return "N" + format(n, ",")


# ----------------------------------------------------------------- cover -----
def cover(c):
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)

    # A quiet colour field on the right. No chevron on covers.
    px = PAGE_W - PANEL_W
    c.setFillColor(SURFACE)
    c.rect(px, 0, PANEL_W, PAGE_H - 10, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(px, 0, 4, PAGE_H - 10, fill=1, stroke=0)

    try:
        lg = ImageReader(str(DOCS / "c4a-logo.png"))
        lw, lh = lg.getSize()
        c.drawImage(lg, MX, PAGE_H - 94, width=32.0 * lw / lh, height=32.0, mask="auto")
    except Exception:
        pass

    c.setFillColor(GOLD)
    c.rect(MX, 424, 44, 3, fill=1, stroke=0)
    tracked(c, "PREPARED FOR GRANDVILLE MEDICAL GROUP", MX, 398,
            "Helvetica-Bold", 10.5, TEAL, 2.6)

    c.setFont(SERIF_B, 34)
    c.setFillColor(INK)
    y = 344
    for line in wrap(c, "Healthcare Growth, Referrals & Partnership Services",
                     SERIF_B, 34, 500):
        c.drawString(MX, y, line)
        y -= 42
    c.setFont(SERIF_I, 15)
    c.setFillColor(D.MUTED)
    c.drawString(MX, y - 2, "Healthcare Performance. Strategy. Growth.")

    c.setStrokeColor(D.RULE)
    c.setLineWidth(0.9)
    c.line(MX, 182, px - 26, 182)
    for dx, label, value in [
        (0, "PREPARED FOR", "Grandville Medical Group"),
        (150, "PREPARED BY", "Consult for Africa"),
        (290, "OFFICES", "Lagos and Abuja"),
        (400, "DATE", "October 2026"),
    ]:
        tracked(c, label, MX + dx, 160, "Helvetica-Bold", 8.0, TEAL, 1.9)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(NAVY)
        c.drawString(MX + dx, 138, value)

    c.setFont("Helvetica", 9)
    c.setFillColor(D.MUTED)
    c.drawString(MX, 86, "Private and confidential.")
    c.showPage()


# ------------------------------------------------------------ 02 outcomes ----
def s_outcomes(c):
    chrome(c, "Consult for Africa")
    heading(c, "Consult for Africa helps healthcare facilities:")
    cards = [
        ("01", "Increase", "referrals"),
        ("02", "Make better use", "of existing capacity"),
        ("03", "Build lasting", "partnerships"),
    ]
    gap = 22
    cw = (W - 2 * gap) / 3.0
    top, h = 400, 240
    for i, (n, title, line) in enumerate(cards):
        x = MX + i * (cw + gap)
        box(c, x, top - h, cw, h, SURFACE, spine=GOLD)
        c.setFont(SERIF_B, 40)
        c.setFillColor(SKY)
        c.drawString(x + 26, top - 64, n)
        c.setFont(SERIF_B, 20)
        c.setFillColor(INK)
        c.drawString(x + 26, top - 110, title)
        para(c, line, x + 26, top - 138, SERIF_I, 17, BODY, cw - 50, 22)
    c.showPage()


# ------------------------------------------------------------- 03 services ---
def s_services(c):
    chrome(c, "Services & Fees")
    y = heading(c, "Services & Fees")
    rows = [
        ["Service", "What it covers", "Duration", "Fee"],
        ["1. Mobilisation & Discovery",
         "Stakeholder meetings, facility familiarisation, data gathering, needs "
         "assessment and implementation plan.", "One-time\n1 to 2 weeks", money(450000)],
        ["2. Referral & Facility Utilisation Strategy",
         "Assess referral sources and gaps, build referral pathways, map partners, and "
         "track performance.\nGoal: more qualified referrals and better use of existing "
         "capacity.", "3 months", money(1700000)],
        ["3. B2B Partnership & Business Development",
         "Identify and engage corporates, HMOs, insurers, schools, NGOs, embassies, "
         "religious organisations and other providers, with outreach, presentations and "
         "follow-up.\nGoal: a sustainable B2B referral pipeline.", "3 months",
         money(2200000)],
        ["4. B2C Patient Acquisition & Marketing",
         "Digital and social media marketing, content, community outreach, promotions "
         "and lead generation.\nGoal: more awareness, enquiries, bookings and visits.",
         "3 months", money(1700000)],
        ["5. Integrated Healthcare Growth Programme",
         "Combines referral growth, B2B partnerships and B2C acquisition, with monthly "
         "performance reviews and tracking of referrals, partnerships and leads. Items 2, "
         "3 and 4 together.", "3 months", money(4700000)],
    ]
    cols = [210, W - 210 - 92 - 92, 92, 92]
    yb = simple_table(c, rows, MX, y - 6, cols, size=10.5, leading=13.5, pad=8)
    # Gold seat under the integrated row.
    c.setFillColor(GOLD)
    c.rect(MX, yb - 3, W, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Oblique", 9.5)
    c.setFillColor(D.MUTED)
    c.drawString(MX, yb - 22, "All fees are exclusive of VAT, currently 7.5%.")
    c.showPage()


# ------------------------------------------------------------- 04 bundle -----
def s_bundle(c):
    chrome(c, "Integrated Healthcare Growth Programme")
    heading(c, "Items 2, 3 and 4 together.")
    parts = [("Referral and Utilisation", 1700000),
             ("B2B Partnerships", 2200000),
             ("B2C Acquisition", 1700000)]
    x0, ytop, bar_w = MX, 400, 360
    scale = bar_w / 5600000.0
    tracked(c, "TAKEN SEPARATELY", x0, ytop, "Helvetica-Bold", 9, TEAL, 1.9)
    x = x0
    shades = [D.IND2, D.IND3, SKY]
    for (label, v), col in zip(parts, shades):
        w = v * scale
        c.setFillColor(col)
        c.rect(x, ytop - 54, w - 2, 40, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(white)
        c.drawString(x + 8, ytop - 30, money(v))
        c.setFont("Helvetica", 8.5)
        c.setFillColor(BODY)
        c.drawString(x, ytop - 70, label)
        x += w
    c.setFont(SERIF_B, 18)
    c.setFillColor(D.MUTED)
    c.drawString(x0 + bar_w + 18, ytop - 42, money(5600000))

    y2 = ytop - 120
    tracked(c, "INTEGRATED PROGRAMME", x0, y2, "Helvetica-Bold", 9, TEAL, 1.9)
    w = 4700000 * scale
    c.setFillColor(NAVY)
    c.rect(x0, y2 - 54, w, 40, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(x0, y2 - 57, w, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(white)
    c.drawString(x0 + 10, y2 - 38, "Items 2, 3 and 4  /  3 months")
    c.setFont(SERIF_B, 18)
    c.setFillColor(INK)
    c.drawString(x0 + w + 18, y2 - 42, money(4700000))

    # Saving tile on the right.
    tx, tw, th = PAGE_W - MX - 200, 200, 150
    box(c, tx, ytop - th - 20, tw, th, CREAM, spine=GOLD)
    tracked(c, "YOU SAVE", tx + 24, ytop - 54, "Helvetica-Bold", 9, TEAL, 1.9)
    c.setFont(SERIF_B, 30)
    c.setFillColor(INK)
    c.drawString(tx + 24, ytop - 98, money(900000))
    c.setFont("Helvetica", 11)
    c.setFillColor(BODY)
    c.drawString(tx + 24, ytop - 124, "a saving")

    bullet_block(c, [
        ("", "Taken separately, items 2, 3 and 4 total N5,600,000. The Integrated "
             "Programme covers all three for N4,700,000, a saving of N900,000."),
    ], MX, ytop - 230, W, size=12.5)
    c.showPage()


# ------------------------------------------------------------- 05 retainer ---
def s_retainer(c):
    chrome(c, "Retainer")
    heading(c, "An ongoing monthly engagement.")
    top, h = 400, 230
    lw = 300
    box(c, MX, top - h, lw, h, NAVY)
    c.setFillColor(GOLD)
    c.rect(MX, top - h, lw, 4, fill=1, stroke=0)
    c.setFont(SERIF_B, 40)
    c.setFillColor(white)
    c.drawString(MX + 28, top - 92, money(1700000))
    c.setFont("Helvetica", 14)
    c.setFillColor(SAGE)
    c.drawString(MX + 28, top - 120, "per month")
    tracked(c, "MINIMUM ENGAGEMENT: 3 MONTHS", MX + 28, top - 190, "Helvetica-Bold", 10, GOLD, 2.0)

    rx = MX + lw + 40
    tracked(c, "WHAT IT COVERS", rx, top - 14, "Helvetica-Bold", 9, TEAL, 1.9)
    bullet_block(c, [
        ("", "Business development"),
        ("", "Partnership outreach"),
        ("", "Referral development"),
        ("", "Marketing strategy"),
        ("", "Campaign management"),
        ("", "Monthly reviews"),
        ("", "Strategic advice"),
    ], rx, top - 46, W - lw - 40, size=13, gap=10)
    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(D.MUTED)
    c.drawString(rx, top - h + 4, "Scope can be reviewed after the first three months.")
    c.showPage()


# ------------------------------------------------------------- 06 timeline ---
def s_timeline(c):
    chrome(c, "Timelines")
    heading(c, "Timelines")
    steps = [
        ("1 month", "Strategy, assessment and mobilisation"),
        ("3 months", "Recommended minimum for active growth"),
        ("6+ months", "Deeper market penetration and long-term partnerships"),
    ]
    y_line = 330
    c.setStrokeColor(D.RULE)
    c.setLineWidth(2)
    c.line(MX, y_line, PAGE_W - MX, y_line)
    seg = W / 3.0
    for i, (when, what) in enumerate(steps):
        x = MX + i * seg
        c.setFillColor(GOLD if i == 1 else NAVY)
        c.circle(x + 10, y_line, 9, fill=1, stroke=0)
        c.setFont(SERIF_B, 26)
        c.setFillColor(INK)
        c.drawString(x, y_line + 32, when)
        para(c, what, x, y_line - 40, "Helvetica", 13, BODY, seg - 40, 18)
    c.showPage()


# --------------------------------------------------------------- 07 terms ----
def s_terms(c):
    chrome(c, "Terms")
    y = heading(c, "Terms")
    bullet_block(c, [
        ("", "Fees are proposed pricing for the initial engagement and are subject to "
             "discussion at the final scope and partnership meeting."),
        ("Fees are not negotiable", "for engagements shorter than three months."),
        ("", "Projects running beyond three months can be reviewed and renegotiated."),
        ("", "All fees are exclusive of VAT, currently 7.5%."),
        ("", "Advertising and media spend for B2C campaigns is funded by Grandville "
             "Medical Group, sits outside the fees above, and carries no commission."),
    ], MX, y - 22, W - 120, size=13.5, leading=19, gap=16)
    c.showPage()


# ---------------------------------------------------------------- 08 close ---
def s_close(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)
    try:
        lg = ImageReader(str(D.LOGO))
        lw, lh = lg.getSize()
        c.drawImage(lg, MX, PAGE_H - 100, width=34.0 * lw / lh, height=34.0, mask="auto")
    except Exception:
        pass
    c.setFillColor(GOLD)
    c.rect(MX, 330, 44, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 36)
    c.setFillColor(white)
    c.drawString(MX, 284, "Healthcare performance, restored.")
    c.setFont(SERIF_I, 15)
    c.setFillColor(SAGE)
    c.drawString(MX, 254, "We don\u2019t just identify the problem. We help build the pathway to better performance.")

    c.setFont("Helvetica", 11)
    c.setFillColor(SKY)
    c.drawString(MX, 110, "hello@consultforafrica.com   /   +234 913 813 8553   /   "
                          "consultforafrica.com   /   Lagos and Abuja")
    c.setFillColor(GOLD)
    c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFont("Helvetica", 8)
    c.setFillColor(D.LIGHT)
    c.drawString(MX, 19, D.FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, "08 / 08")
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Grandville Medical Group: Growth Proposal")
    c.setAuthor("Consult for Africa")
    cover(c)
    for fn in (s_outcomes, s_services, s_bundle, s_retainer, s_timeline, s_terms):
        fn(c)
    s_close(c)
    c.save()
    print("wrote", OUT)
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
