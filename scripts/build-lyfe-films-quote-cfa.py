"""
CFA's quote to MedLYFE for the five films with Dr Chinwe Kpaduwa, shot on
Thursday 29 and Friday 30 October 2026 (brief: docs/kpaduwa-filming-brief-cfa.pdf).

Debo, 29 Oct 2026: the same quote Kakulus Media gave for the cancelled 8 October
shoot (IVN07100601, N1.8m + VAT), now with CFA delivering. Same line amounts and
the same total; the scope is rewritten to this shoot. Hair and make-up becomes
casting, because Dr Chinwe does not wear make-up and the client is played by an
actor. Kakulus is not named on the quote.

Carries the non-refundable, substitution and reschedule terms every CFA invoice
needs, and the RC and TIN from cfa_company.

Output: docs/Quote-CFA-2026-1029-LPA.pdf

Run:
  python3 scripts/build-lyfe-films-quote-cfa.py
"""

from __future__ import annotations

from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_company import LEGAL_LINE, RC, TIN  # noqa: E402

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

QUOTE_NO = "CFA-2026-1029-LPA"
QUOTE_DATE = "29 October 2026"
VALID_UNTIL = "12 November 2026"
VAT_RATE = 0.075
CLIENT = ["MedLYFE, Medbury Healthcare Group",
          "Attention: Dr Itunu Akinware, Group Chief Executive"]
MATTER = ("Lyfe Plastics & Aesthetics by MedLYFE  /  five films with Dr Chinwe Kpaduwa, "
          "Thursday 29 and Friday 30 October 2026")

LINES = [
    ("Pre-production",
     "Creative treatment, question cards, recce of the office, Treasure Gardens and the clinic, "
     "schedule and call sheet", 110_000),
    ("Crew: director", "Two shoot mornings, three locations", 180_000),
    ("Crew: photographer", "Two shoot mornings", 70_000),
    ("Crew: sound recordist", "Two shoot mornings, two lapel microphones", 60_000),
    ("Crew: operator", "Two shoot mornings", 40_000),
    ("Equipment", "Cinema camera and lenses, lighting and grip, sound kit, field monitor, media",
     140_000),
    ("Casting and talent", "The client who appears in the three patient films, never shown full face",
     70_000),
    ("Stills and retouching",
     "20 retouched images of Dr Chinwe in Lagos and at the clinic, full and web resolution", 140_000),
    ("Film edits, 5 films",
     "Three patient films and two doctor films, 2 to 4 minutes each; the doctor films in 16:9 "
     "for YouTube", 350_000),
    ("Short-form edits, 10 clips",
     "10 clips of 30 to 90 seconds, delivered in 9:16 and 4:5 (20 files)", 140_000),
    ("Post: grade, sound mix, captioning, versioning",
     "Grade and mix on all films and clips, burned-in captions on every clip, end cards", 140_000),
    ("Music", "Commercially cleared music for all films and clips, covering paid social", 110_000),
    ("Delivery and archive", "Files named to MedLYFE's convention, all rushes on one drive",
     110_000),
    ("Travel and logistics", "Crew and equipment between the three locations, both days", 70_000),
    ("Production management", "Coordination of crew, locations and talent across both days",
     70_000),
]

TERMS = [
    ("The deposit is non-refundable.",
     "Crew, equipment and talent are booked against it."),
    ("Substitution is free.",
     "Any film or clip in the list can be swapped for another of the same length before the edit."),
    ("One reschedule is free.",
     "A shoot morning can move once at no charge if notice is given the day before."),
    ("One revision round per film and clip.",
     "Further rounds are quoted separately."),
    ("Ownership and use.",
     "The footage belongs to MedLYFE on final payment. ARCON approval before paid use sits with MedLYFE."),
]

PAYMENT = [
    ("70% on acceptance", 0.70),
    ("30% on delivery", 0.30),
]

BANK = [
    ("Bank", "Zenith Bank"),
    ("Account name", "Consult for Africa Management Services Limited"),
    ("Account number", "1312352157"),
]

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / f"Quote-{QUOTE_NO}.pdf"

NAVY = HexColor("#0F3D2E")
GOLD = HexColor("#C6A15B")
BODY = HexColor("#23302B")
MUTED = HexColor("#7C7C74")
SURFACE = HexColor("#F5F2EA")
LIGHT = HexColor("#CBDDD1")
CREAM = HexColor("#F6EFDD")

PAGE_W, PAGE_H = A4
MARGIN = 46
FULLW = PAGE_W - 2 * MARGIN


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=8.8, leading=11.6, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=5)
    base.update(kw)
    return ParagraphStyle(name, **base)


EYEBROW = style("eyebrow", fontName="Helvetica-Bold", fontSize=8.2, leading=10.8,
                textColor=GOLD, spaceAfter=2, spaceBefore=6)
H1 = style("h1", fontName="Helvetica-Bold", fontSize=13, leading=16.5, textColor=NAVY,
           spaceBefore=2, spaceAfter=5, keepWithNext=True)
SMALL = style("small", fontSize=7.5, leading=10.0, textColor=MUTED)
CELL = style("cell", fontSize=7.8, leading=9.6, spaceAfter=0)
CELL_R = style("cellr", fontSize=7.8, leading=9.6, alignment=2, spaceAfter=0)
CELL_B = style("cellb", fontSize=7.8, leading=9.6, fontName="Helvetica-Bold", textColor=NAVY,
               spaceAfter=0)
CELL_BR = style("cellbr", fontSize=8.0, leading=10.2, fontName="Helvetica-Bold",
                textColor=NAVY, alignment=2, spaceAfter=0)
CELL_W = style("cellw", fontSize=8.0, leading=10.2, fontName="Helvetica-Bold", textColor=white,
               spaceAfter=0)
CELL_WR = style("cellwr", fontSize=8.0, leading=10.2, fontName="Helvetica-Bold",
                textColor=white, alignment=2, spaceAfter=0)


def ngn(v: float) -> str:
    return "NGN %s" % format(int(round(v)), ",")


def page_bg(c, doc):
    c.saveState()
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 30, PAGE_W, 30, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 33, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(MARGIN, PAGE_H - 20, "CONSULT FOR AFRICA")
    c.setFillColor(LIGHT)
    c.setFont("Helvetica", 8)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 20, "Quote %s" % QUOTE_NO)
    c.setFillColor(GOLD)
    c.rect(MARGIN, 26, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.4)
    c.drawString(MARGIN, 15, LEGAL_LINE)
    c.drawRightString(PAGE_W - MARGIN, 15, "Page %d" % doc.page)
    c.restoreState()


def card(text, bg=SURFACE, fg=BODY):
    st = ParagraphStyle("c", parent=CELL, fontSize=8.0, leading=10.8, textColor=fg)
    t = Table([[Paragraph(text, st)]], colWidths=[FULLW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, GOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def tbl(rows, labels, widths, aligns, totals=0):
    head = [Paragraph(t, CELL_WR if a == "r" else CELL_W) for t, a in zip(labels, aligns)]
    data = [head]
    for i, r in enumerate(rows):
        emph = i >= len(rows) - totals
        data.append([Paragraph(v, (CELL_BR if emph else CELL_R) if a == "r"
                               else (CELL_B if emph or j == 0 else CELL))
                     for j, (v, a) in enumerate(zip(r, aligns))])
    t = Table(data, colWidths=widths)
    st = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.4), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.4),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1 - totals), [white, SURFACE]),
    ]
    if totals:
        st += [("BACKGROUND", (0, -totals), (-1, -1), CREAM),
               ("LINEABOVE", (0, -totals), (-1, -totals), 1, GOLD)]
    t.setStyle(TableStyle(st))
    return t


def build():
    subtotal = sum(a for *_, a in LINES)
    vat = subtotal * VAT_RATE
    total = subtotal + vat
    doc = BaseDocTemplate(
        str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=40, bottomMargin=28,
        title="Quote %s - Lyfe Plastics & Aesthetics films" % QUOTE_NO, author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 30, FULLW, PAGE_H - 42 - 30, id="f")], onPage=page_bg)])
    el = [
        Paragraph("Quote", style("t", fontName="Helvetica-Bold", fontSize=19, leading=22,
                                 textColor=NAVY, spaceAfter=2)),
        Paragraph("Five films with Dr Chinwe Kpaduwa, for patients and referring doctors.",
                  style("st", fontName="Helvetica-Oblique", fontSize=10.5, leading=13,
                        textColor=GOLD, spaceAfter=6)),
        tbl([["Quoted to", "<br/>".join(CLIENT)],
             ["Matter", MATTER],
             ["Quoted by", "%s<br/>RC %s  /  TIN %s" % (LEGAL_LINE.split("  ·  ")[0], RC, TIN)],
             ["Quote number", QUOTE_NO],
             ["Quote date", QUOTE_DATE],
             ["Valid until", VALID_UNTIL]],
            ["", ""], [104, FULLW - 104], ["l", "l"]),

        Paragraph("01  /  THE PRODUCTION", EYEBROW),
        Paragraph("Two shoot mornings, five films, ten clips, twenty stills.", H1),
        tbl([[t, d, format(a, ",")] for t, d, a in LINES]
            + [["Subtotal", "", format(subtotal, ",")],
               ["VAT at 7.5%", "", format(int(vat), ",")],
               ["Total", "", ngn(total)]],
            ["", "Deliverables", "NGN"], [128, FULLW - 214, 86], ["l", "l", "r"], totals=3),

        Paragraph("02  /  PAYMENT", EYEBROW),
        tbl([["Schedule", "  /  ".join("%s %s" % (k, ngn(total * p)) for k, p in PAYMENT)]]
            + [[k, v] for k, v in BANK], ["", ""], [128, FULLW - 128], ["l", "l"]),
        Spacer(1, 3),
        Paragraph("Please quote %s on the transfer. Withholding tax, where applicable, should be "
                  "deducted at the statutory rate and the remittance evidence sent to "
                  "finance@consultforafrica.com." % QUOTE_NO, SMALL),

        Paragraph("03  /  TERMS", EYEBROW),
        card("<br/>".join("<b>%s</b> %s" % (b, d) for b, d in TERMS), bg=CREAM),
        Spacer(1, 5),
        card("<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; +234 913 813 8553 &nbsp; / "
             "&nbsp; hello@consultforafrica.com", bg=NAVY, fg=white),
    ]
    doc.build(el)
    print("wrote %s  subtotal %s  total %s" % (OUT, ngn(subtotal), ngn(total)))


if __name__ == "__main__":
    build()
