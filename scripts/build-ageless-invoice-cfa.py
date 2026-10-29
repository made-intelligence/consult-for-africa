"""
CFA's invoices to Medbury for AGELESS: consultancy and event management
(CFA-2026-1015-AGL), and the backdrops and roll-up banners (CFA-2026-1015-BDR).
After the evening, CFA-2026-1022-AGL reissues the consultancy and event management
invoice to MedLYFE, dated 22 October and due on receipt. An invoice may override
the date, client, terms line and terms block with its own keys.

The evening is Wednesday 21 October 2026 at Capital Club. Billed in advance,
in full, because the work is delivered on the night. Carries the
non-refundable terms block every CFA invoice needs.

Output: docs/ageless/Invoice-CFA-2026-{1015-AGL,1015-BDR,1022-AGL}.pdf. An invoice with no
amount set is skipped.

Run:
  python3 scripts/build-ageless-invoice-cfa.py
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

INVOICE_DATE = "15 October 2026"
PAYMENT_TERMS = "Due on receipt, and in full before the evening."
CLIENT = ["Medbury Healthcare Group", "Attention: Dr Itunu Akinware, Group Chief Executive"]
MATTER = "AGELESS  /  Wednesday 21 October 2026, Capital Club, Victoria Island"

INVOICES = [
  {
    "no": "CFA-2026-1015-AGL",
    "subtitle": "AGELESS. Consultancy and event management.",
    "h1": "The evening, from concept to close.",
    "lines": [
    ("Consultancy",
     "The platform, the programme and the run of show; speaker and panel curation, briefs and "
     "speaker packs; the guest list, invitations and RSVP; the film briefs; design of the programme, "
     "badges, place cards, takeaway, speaker flyers, backdrop and signage", 1_400_000),
    ("Event management",
     "Supplier coordination across venue, film, photography and print; rehearsal and technical "
     "check on Tuesday 20 October; management of the evening from setup to close", None),
    ],
  },
  {
    "no": "CFA-2026-1015-BDR",
    "subtitle": "AGELESS. Backdrops and roll-up banners.",
    "h1": "Print for the room.",
    "lines": [
    ("Backdrops and roll-up banners",
     "Design, print and installation at Capital Club, Victoria Island, for Wednesday 21 October", None),
    ],
  },
  {
    "no": "CFA-2026-1022-AGL",
    "date": "22 October 2026",
    "terms_line": "Due on receipt.",
    "client": ["MedLYFE, Medbury Healthcare Group",
               "Attention: Dr Itunu Akinware, Group Chief Executive"],
    "terms": [
        ("The fee is non-refundable.",
         "The work was delivered in full on the evening of Wednesday 21 October."),
        ("Payment is due on receipt.",
         "This invoice replaces CFA-2026-1015-AGL, which was raised before the evening."),
    ],
    "subtitle": "AGELESS. Consultancy and event management.",
    "h1": "The evening, from concept to close.",
    "lines": [
    ("Consultancy",
     "The platform, the programme and the run of show; speaker and panel curation, briefs and "
     "speaker packs; the guest list, invitations, RSVP and personal access passes; the film "
     "briefs; design of the programme, speaker flyers, backdrop and signage", 1_400_000),
    ("Event management",
     "Supplier coordination across venue, film, photography and print; rehearsal and technical "
     "check on Tuesday 20 October; management of the evening on Wednesday 21 October from "
     "setup to close", None),
    ],
  },
]

TERMS = [
    ("The fee is non-refundable.",
     "The work and the suppliers are committed and built to this evening."),
    ("Postponement carries the fee.",
     "If the evening moves, the fee stands and applies to the new date."),
    ("Payment confirms the engagement.",
     "Payment is due in full before Wednesday 21 October."),
]

BANK = [
    ("Bank", "Zenith Bank"),
    ("Account name", "Consult for Africa Management Services Limited"),
    ("Account number", "1312352157"),
]

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "ageless"
INVOICE_NO = ""

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
    base = dict(fontName="Helvetica", fontSize=9.0, leading=12.2, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=5)
    base.update(kw)
    return ParagraphStyle(name, **base)


EYEBROW = style("eyebrow", fontName="Helvetica-Bold", fontSize=8.2, leading=10.8,
                textColor=GOLD, spaceAfter=2, spaceBefore=8)
H1 = style("h1", fontName="Helvetica-Bold", fontSize=13, leading=16.5, textColor=NAVY,
           spaceBefore=2, spaceAfter=5, keepWithNext=True)
SMALL = style("small", fontSize=7.5, leading=10.0, textColor=MUTED)
CELL = style("cell", fontSize=8.2, leading=10.6)
CELL_R = style("cellr", fontSize=8.2, leading=10.6, alignment=2)
CELL_B = style("cellb", fontSize=8.2, leading=10.6, fontName="Helvetica-Bold", textColor=NAVY)
CELL_BR = style("cellbr", fontSize=8.2, leading=10.6, fontName="Helvetica-Bold",
                textColor=NAVY, alignment=2)
CELL_W = style("cellw", fontSize=8.2, leading=10.6, fontName="Helvetica-Bold", textColor=white)
CELL_WR = style("cellwr", fontSize=8.2, leading=10.6, fontName="Helvetica-Bold",
                textColor=white, alignment=2)


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
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 20, "Invoice %s" % INVOICE_NO)
    c.setFillColor(GOLD)
    c.rect(MARGIN, 26, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.4)
    c.drawString(MARGIN, 15, LEGAL_LINE)
    c.drawRightString(PAGE_W - MARGIN, 15, "Page %d" % doc.page)
    c.restoreState()


def card(text, bg=SURFACE, fg=BODY):
    st = ParagraphStyle("c", parent=CELL, fontSize=8.6, leading=12, textColor=fg)
    t = Table([[Paragraph(text, st)]], colWidths=[FULLW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, GOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def tbl(rows, labels, widths, aligns, total_row=False):
    head = [Paragraph(t, CELL_WR if a == "r" else CELL_W) for t, a in zip(labels, aligns)]
    data = [head]
    for i, r in enumerate(rows):
        emph = total_row and i == len(rows) - 1
        data.append([Paragraph(v, (CELL_BR if emph else CELL_R) if a == "r"
                               else (CELL_B if emph or j == 0 else CELL))
                     for j, (v, a) in enumerate(zip(r, aligns))])
    t = Table(data, colWidths=widths)
    st = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2 if total_row else -1), [white, SURFACE]),
    ]
    if total_row:
        st += [("BACKGROUND", (0, -1), (-1, -1), CREAM), ("LINEABOVE", (0, -1), (-1, -1), 1, GOLD)]
    t.setStyle(TableStyle(st))
    return t


def build(inv):
    global INVOICE_NO
    INVOICE_NO = inv["no"]
    lines = [(t, d) for t, d, _ in inv["lines"]]
    fee = sum(a or 0 for *_, a in inv["lines"])
    out = OUT_DIR / f"Invoice-{INVOICE_NO}.pdf"
    doc = BaseDocTemplate(
        str(out), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=42, bottomMargin=30,
        title="Invoice %s - AGELESS" % INVOICE_NO, author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 30, FULLW, PAGE_H - 42 - 30, id="f")], onPage=page_bg)])
    el = []

    el.append(Paragraph("Invoice", style("t", fontName="Helvetica-Bold", fontSize=19, leading=22,
                                         textColor=NAVY, spaceAfter=2)))
    el.append(Paragraph(inv["subtitle"],
                        style("st", fontName="Helvetica-Oblique", fontSize=10.5, leading=13,
                              textColor=GOLD, spaceAfter=8)))

    el.append(tbl(
        [["Invoiced to", "<br/>".join(inv.get("client", CLIENT))],
         ["Matter", MATTER],
         ["Invoiced by", "%s<br/>RC %s  /  TIN %s" % (LEGAL_LINE.split("  ·  ")[0], RC, TIN)],
         ["Invoice number", INVOICE_NO],
         ["Invoice date", inv.get("date", INVOICE_DATE)],
         ["Terms", inv.get("terms_line", PAYMENT_TERMS)]],
        ["", ""], [104, FULLW - 104], ["l", "l"]))

    el.append(Paragraph("01  /  THE ENGAGEMENT", EYEBROW))
    el.append(Paragraph(inv["h1"], H1))
    el.append(tbl(
        [[t, d, ""] for t, d in lines] + [["Amount due", "", ngn(fee)]],
        ["", "Scope", "NGN"], [110, FULLW - 198, 88], ["l", "l", "r"], total_row=True))

    el.append(Paragraph("02  /  TERMS", EYEBROW))
    el.append(card("<br/>".join("<b>%s</b> %s" % (b, d) for b, d in inv.get("terms", TERMS)), bg=CREAM))

    el.append(Paragraph("03  /  PAYMENT", EYEBROW))
    el.append(tbl([[k, v] for k, v in BANK], ["", ""], [116, FULLW - 116], ["l", "l"]))
    el.append(Spacer(1, 3))
    el.append(Paragraph(
        "Please quote invoice number %s on the transfer. Withholding tax, where applicable, "
        "should be deducted at the statutory rate and the remittance evidence sent to "
        "finance@consultforafrica.com." % INVOICE_NO, SMALL))

    el.append(Spacer(1, 8))
    el.append(card(
        "<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; +234 913 813 8553 &nbsp; / "
        "&nbsp; hello@consultforafrica.com", bg=NAVY, fg=white))

    doc.build(el)
    print("wrote %s  %s" % (out, ngn(fee)))


if __name__ == "__main__":
    for inv in INVOICES:
        if any(a is None for *_, a in inv["lines"]) and not any(a for *_, a in inv["lines"]):
            print("skipped %s: no amount set" % inv["no"])
            continue
        build(inv)
