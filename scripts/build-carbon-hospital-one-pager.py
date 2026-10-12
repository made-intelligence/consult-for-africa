"""
Hospital receivables: the one page a hospital sees.

For Debo to show interested hospitals, one copy per recipient (RECIPIENTS). The hospital's side of the
Carbon pilot terms of 12 October 2026: what it gets, what it pays, what it
agrees to. Same numbers as scripts/build-carbon-pilot-terms-deck.py. Carbon has
not signed, so the page says the terms are subject to its credit approval.
No em dashes, no chevrons.

Run:
  python3 scripts/build-carbon-hospital-one-pager.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib.colors import white            # noqa: E402
from reportlab.lib.pagesizes import A4, landscape  # noqa: E402
from reportlab.pdfgen import canvas                # noqa: E402

import cfa_deck as D                               # noqa: E402
from cfa_deck import (                             # noqa: E402
    BODY, CREAM, GOLD, MUTED, MX, NAVY, PAGE_H, PAGE_W, SERIF_B, SURFACE, TEAL,
    box, bullet_block, chrome, heading, para, simple_table, tracked,
)

# (file label, footer line). Add a hospital here and rerun.
RECIPIENTS = [
    ("Medbury", "Prepared for Dr Itunu Akinware, Medbury"),
    ("Dr Austin", "Prepared for Dr Austin"),
]

D.TOTAL[0] = "1"

W = PAGE_W - 2 * MX
CLAIM = 1_000_000
ADVANCE = CLAIM * 0.60
CARBON_MONTHLY = 0.025
CFA_FEE = 0.01
MIN_MONTHS = 2


def naira(x):
    return f"N{x:,.0f}"


def kicker_line(c, text, x, y, colour=TEAL, size=8.5):
    tracked(c, text.upper(), x, y, "Helvetica-Bold", size, colour, 1.6)


def build(label, prepared_for):
    out = ROOT / "docs" / f"Hospital Receivables - {label} One Pager.pdf"
    D.FOOTER[0] = f"Consult for Africa   /   Private and confidential   /   {prepared_for}"
    D._N[0] = 0
    c = canvas.Canvas(str(out), pagesize=landscape(A4))
    c.setTitle("Hospital Receivables: One Page")
    c.setAuthor("Consult for Africa")
    chrome(c, "Hospital receivables, with Carbon")
    y = heading(c, "Cash within 48 hours for claims your HMOs have already accepted.")

    gap = 14
    tw = (W - 2 * gap) / 3
    tiles = [
        ("60%", "of each accepted claim, less the discount, paid to you within 48 hours"),
        ("40%", "the balance, to your operating account within 48 hours of the HMO paying"),
        ("2.5% + 1%", "a month on the advance while it is out (60 days minimum), plus 1% once"),
    ]
    for i, (v, label) in enumerate(tiles):
        x = MX + i * (tw + gap)
        box(c, x, y - 8 - 82, tw, 82, SURFACE, spine=TEAL if i == 0 else GOLD)
        c.setFont(SERIF_B, 22)
        c.setFillColor(NAVY)
        c.drawString(x + 18, y - 8 - 38, v)
        para(c, label, x + 18, y - 8 - 58, "Helvetica", 10, BODY, tw - 32, 13)
    y -= 112

    lw = 380
    kicker_line(c, "On N1,000,000 accepted: an advance of N600,000", MX, y)
    monthly = ADVANCE * CARBON_MONTHLY
    upfront = monthly * MIN_MONTHS + ADVANCE * CFA_FEE
    rows = [["HMO pays after", "You receive on day one", "Total cost on the advance"]]
    for months in (2, 3, 4):
        total = upfront + monthly * (months - MIN_MONTHS)
        rows.append([f"{months * 30} days", naira(ADVANCE - upfront), f"{naira(total)}  ({total / ADVANCE:.1%})"])
    ty = simple_table(c, rows, MX, y - 10, [100, 140, lw - 240], size=10, leading=13, pad=7)
    para(c, f"Carbon's interest at {CARBON_MONTHLY:.1%} a month for the days the money is out, with the HMO's "
         f"expected time to pay as the minimum, and our fee of {CFA_FEE:.0%} of the advance, once. Both are taken "
         "as a discount on day one; days beyond the minimum come out of the HMO's payment. Nothing else.",
         MX, ty - 14, "Helvetica", 9.4, BODY, lw, 12.5)

    x = MX + lw + 34
    rw = PAGE_W - MX - x
    kicker_line(c, "What you agree to", x, y)
    yy = bullet_block(c, [
        ("", "Private HMO claims only, and only once the HMO has accepted them."),
        ("", "Your HMO payments go into a collection account at Carbon, and everything not owed comes back within 48 hours."),
        ("", "Your main HMOs sign a letter confirming where they pay. We arrange it."),
        ("", "If an HMO does not pay by the due date, you repay the advance."),
    ], x, y - 22, rw, gap=6, size=10.2, leading=13.5)
    kicker_line(c, "What we do", x, yy - 8)
    bullet_block(c, [
        ("", "A free review of your outstanding claims before anything is signed."),
        ("", "Every claim checked before it is funded, and every HMO payment chased and reconciled."),
    ], x, yy - 30, rw, gap=6, size=10.2, leading=13.5)

    box(c, MX, 44, W, 30, CREAM, spine=GOLD)
    c.setFont("Helvetica", 9.2)
    c.setFillColor(NAVY)
    c.drawString(MX + 16, 55, "Pilot terms, subject to Carbon's credit approval and a signed facility agreement. "
                 "Figures on 30-day months; the minimum period is set per HMO from its payment record.")
    c.save()
    print("wrote", out)


if __name__ == "__main__":
    for label, prepared_for in RECIPIENTS:
        build(label, prepared_for)
