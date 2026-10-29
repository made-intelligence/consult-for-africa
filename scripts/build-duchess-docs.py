"""
Build the Duchess International Hospital documents as branded PDFs.

    python3 scripts/build-duchess-docs.py

The fee schedule goes to the client and carries a bespoke cover matching the
pitch deck. The prep and benchmarking briefs are internal and must never be
sent. The deck is built by scripts/build-duchess-deck.py.
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from osteon_doc import build_doc  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "duchess"

_SUPP = "/System/Library/Fonts/Supplemental/"
SERIF, SERIF_B, SERIF_I = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"
try:
    pdfmetrics.registerFont(TTFont("Georgia", _SUPP + "Georgia.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", _SUPP + "Georgia Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Italic", _SUPP + "Georgia Italic.ttf"))
    SERIF, SERIF_B, SERIF_I = "Georgia", "Georgia-Bold", "Georgia-Italic"
except Exception:
    pass

# palette sampled from docs/c4a-icon.png, matching the pitch deck
INK = HexColor("#182448")
IND2 = HexColor("#3C4878")
IND3 = HexColor("#485484")
SKY = HexColor("#6090C0")
SAGE = HexColor("#CCD8C0")
SAGE_D = HexColor("#8FA383")
GOLD = HexColor("#D4AF37")
MUTED = HexColor("#6B7280")
RULE = HexColor("#DED9CE")

PW, PH = A4
MX = 46

CLIENT_FOOTER = "Confidential  /  Prepared for Duchess International Hospital, Lagos"
INTERNAL_FOOTER = "Consult for Africa internal  /  Never send  /  Never leave in the room"


def _tracked(c, text, x, y, font, size, colour, track=2.0):
    c.setFont(font, size)
    c.setFillColor(colour)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + track


def _rule(c, x, y, w, col=RULE, lw=0.7):
    c.setStrokeColor(col)
    c.setLineWidth(lw)
    c.line(x, y, x + w, y)


def fee_cover(c, doc):
    """Cover for the fee schedule. Same language as the pitch deck cover."""
    c.setFillColor(HexColor("#FFFFFF"))
    c.rect(0, 0, PW, PH, fill=1, stroke=0)

    try:
        img = ImageReader(str(DOCS / "c4a-logo.png"))
        iw, ih = img.getSize()
        dw = 150
        c.drawImage(img, MX, PH - 68, width=dw, height=dw * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFillColor(INK)
        c.setFont(SERIF_B, 14)
        c.drawString(MX, PH - 56, "CONSULT FOR AFRICA")

    _tracked(c, "PREPARED FOR", PW - MX - 176, PH - 38, "Helvetica-Bold", 6.4, SAGE_D, 1.9)
    try:
        dl = ImageReader(str(OUT / "duchess-logo.png"))
        dw2 = 176
        diw, dih = dl.getSize()
        c.drawImage(dl, PW - MX - dw2, PH - 68, width=dw2, height=dw2 * dih / diw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFont(SERIF_B, 11.5)
        c.setFillColor(INK)
        c.drawRightString(PW - MX, PH - 56, "Duchess International Hospital")
    c.setFont(SERIF_I, 8.8)
    c.setFillColor(SAGE_D)
    c.drawRightString(PW - MX, PH - 78, "Ikeja GRA, Lagos")

    _rule(c, MX, PH - 92, PW - 2 * MX)

    _tracked(c, "FEE SCHEDULE  /  23 SEPTEMBER 2026", MX, PH - 124,
             "Helvetica-Bold", 7.4, GOLD, 2.3)

    c.setFont(SERIF, 30)
    c.setFillColor(INK)
    c.drawString(MX, PH - 172, "Healthcare Risk Management")
    c.setFont(SERIF_B, 30)
    c.drawString(MX, PH - 208, "Framework and Implementation")

    _rule(c, MX, PH - 232, 300, GOLD, 1.2)

    c.setFont(SERIF_I, 11.5)
    c.setFillColor(IND2)
    c.drawString(MX, PH - 256, "Re-scoped after our meeting. Priced by phase, against defined deliverables.")

    # the number, said plainly
    c.setFont("Helvetica", 8)
    c.setFillColor(SAGE_D)
    _tracked(c, "TOTAL FEE PAYABLE, SIX MONTHS", MX, PH - 316, "Helvetica-Bold", 7, SAGE_D, 2.1)
    c.setFont(SERIF_B, 40)
    c.setFillColor(INK)
    c.drawString(MX, PH - 364, "N21,060,000")
    c.setFont("Helvetica", 9.6)
    c.setFillColor(MUTED)
    c.drawString(MX, PH - 384, "Across six months.  N23,400,000 standard, less a 10 per cent programme rate for a single continuous mandate.")

    # the five phases, drawn to scale
    _tracked(c, "WHERE THE FEE SITS", MX, PH - 428, "Helvetica-Bold", 7, SAGE_D, 2.1)
    phases = [("01", "Discovery and diagnostic", 13, 5.40, INK),
              ("02", "Framework and policy", 16, 6.00, IND2),
              ("03", "Implementation and training", 14, 5.25, IND3),
              ("04", "Review and handover", 7, 3.00, SKY),
              ("05", "Embedding and assurance", 8, 3.75, SAGE_D)]
    maxv = max(p[3] for p in phases)
    barw = PW - 2 * MX - 306
    y = PH - 452
    for num, lab, days, val, col in phases:
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(SAGE_D)
        c.drawString(MX, y, num)
        c.setFont(SERIF_B, 9.6)
        c.setFillColor(INK)
        c.drawString(MX + 18, y, lab)
        c.setFillColor(col)
        c.roundRect(MX + 188, y - 2, barw * (val / maxv), 9, 2, fill=1, stroke=0)
        c.setFont("Helvetica", 7.6)
        c.setFillColor(MUTED)
        c.drawRightString(PW - MX, y, "N%.2fm" % val)
        y -= 26

    # payment against delivery, so the cover answers the cash question too
    _tracked(c, "PAYMENT AGAINST DELIVERY", MX, y - 16, "Helvetica-Bold", 7, SAGE_D, 2.1)
    mil = [("60%", "N12,636,000", "On engagement confirmation", "and mobilisation"),
           ("20%", "N4,212,000", "On approval of the framework", "and policy suite"),
           ("20%", "N4,212,000", "On completion of training", "and handover")]
    mw = (PW - 2 * MX - 2 * 12) / 3
    my = y - 104
    for i, (pct, amt, l1, l2) in enumerate(mil):
        mx2 = MX + i * (mw + 12)
        c.setFillColor(HexColor("#F4F6FA"))
        c.roundRect(mx2, my, mw, 72, 6, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(mx2, my, mw, 2.5, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(SAGE_D)
        c.drawString(mx2 + 14, my + 54, pct)
        c.setFont(SERIF_B, 13)
        c.setFillColor(INK)
        c.drawString(mx2 + 14, my + 34, amt)
        c.setFont("Helvetica", 7.4)
        c.setFillColor(MUTED)
        c.drawString(mx2 + 14, my + 21, l1)
        c.drawString(mx2 + 14, my + 12, l2)

    c.setFont("Helvetica-Oblique", 7.6)
    c.setFillColor(MUTED)
    c.drawString(MX, my - 20, "Fees exclusive of value added tax, capped at the total stated, and billed against the milestone schedule above.")

    _rule(c, MX, 128, PW - 2 * MX)
    c.setFont(SERIF_B, 9.6)
    c.setFillColor(INK)
    c.drawString(MX, 108, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 8.4)
    c.setFillColor(SAGE_D)
    c.drawString(MX, 95, "Consult for Africa Management Services Limited")
    c.drawString(MX, 82, "Replaces the schedule of 23 September 2026")
    c.drawRightString(PW - MX, 108, "hello@consultforafrica.com")
    c.drawRightString(PW - MX, 95, "+234 913 813 8553")
    c.drawRightString(PW - MX, 82, "Confidential")


DOCS_TO_BUILD = [
    ("duchess-fee-schedule-cfa", "Duchess International Hospital  /  Fee Schedule", CLIENT_FOOTER, fee_cover),
    ("duchess-pitch-prep-PRIVATE", "Duchess  /  Presentation Prep  /  INTERNAL", INTERNAL_FOOTER, None),
    ("duchess-fee-benchmarking-PRIVATE", "Duchess  /  Fee Benchmarking  /  INTERNAL", INTERNAL_FOOTER, None),
]


if __name__ == "__main__":
    for stem, header, footer, cover in DOCS_TO_BUILD:
        build_doc(OUT / f"{stem}.md", OUT / f"{stem}.pdf", header, footer, cover_draw=cover)
        print("wrote", OUT / f"{stem}.pdf")
