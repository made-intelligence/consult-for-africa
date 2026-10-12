"""
Build the invoice for Medlyfe Introduces, edition one.

The media plan agreed on 28 September is EXCLUDED and settled directly with the
outlets, so this invoice covers the programme less that line.

Figures read from scripts/lib_medlyfe_introduces.py so the invoice cannot drift
from the budget document.

Output: docs/medlyfe-introduces-invoice-cfa.pdf

Run:
  python3 scripts/build-medlyfe-introduces-invoice.py
"""

from __future__ import annotations

import sys

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

# ---------------------------------------------------------------- parameters
INVOICE_NO = "CFA-2026-1005-MLI"
INVOICE_DATE = "5 October 2026"
PAYMENT_TERMS = "Due on receipt."
CLIENT = ["Medbury Healthcare Group", "Attention: Dr Itunu Akinware, Group Chief Executive"]
MATTER = "Medlyfe Introduces, edition one  /  Thursday 15 October 2026"

BANK = [
    ("Bank", "Zenith Bank"),
    ("Account name", "Consult for Africa Management Services Limited"),
    ("Account number", "1312352157"),
]

# ---------------------------------------------------------------- style
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "medlyfe-introduces-invoice-cfa.pdf"

NAVY = HexColor("#0F3D2E")
GOLD = HexColor("#C6A15B")
TEAL = HexColor("#2F6B52")
BODY = HexColor("#23302B")
MUTED = HexColor("#7C7C74")
SURFACE = HexColor("#F5F2EA")
LIGHT = HexColor("#CBDDD1")
PANEL = HexColor("#E9F0EA")
CREAM = HexColor("#F6EFDD")
ALERT = HexColor("#FBF0E4")
RUST = HexColor("#B8763A")

PAGE_W, PAGE_H = A4
MARGIN = 46
FULLW = PAGE_W - 2 * MARGIN
ss = getSampleStyleSheet()


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9.0, leading=12.2, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=5)
    base.update(kw)
    return ParagraphStyle(name, **base)


EYEBROW = style("eyebrow", fontName="Helvetica-Bold", fontSize=8.2, leading=10.8,
                textColor=GOLD, spaceAfter=2)
H1 = style("h1", fontName="Helvetica-Bold", fontSize=13, leading=16.5, textColor=NAVY,
           spaceBefore=7, spaceAfter=5, keepWithNext=True)
H2 = style("h2", fontName="Helvetica-Bold", fontSize=9.8, leading=12.8, textColor=TEAL,
           spaceBefore=8, spaceAfter=3, keepWithNext=True)
P = style("p")
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
    c.drawString(MARGIN, 15, "Consult for Africa Management Services Limited")
    c.drawRightString(PAGE_W - MARGIN, 15, "Page %d" % doc.page)
    c.restoreState()


def card(text, bg=SURFACE, fg=BODY, rule=GOLD):
    st = ParagraphStyle("c", parent=P, textColor=fg, leftIndent=6, rightIndent=6,
                        spaceBefore=2, spaceAfter=2)
    t = Table([[Paragraph(text, st)]], colWidths=[FULLW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, rule),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def tbl(rows, labels, widths, total_row=False, aligns=None, hi=None, sub=None):
    ncols = len(labels)
    if aligns is None:
        aligns = ["r"] * (ncols - 1)
    hi = hi or set()
    sub = sub or set()
    for i, r in enumerate(rows):
        assert len(r) == ncols, "row %d has %d cells, header has %d" % (i, len(r), ncols)
    data = [[Paragraph(labels[0], CELL_W)] +
            [Paragraph(t, CELL_WR if aligns[j] == "r" else CELL_W) for j, t in enumerate(labels[1:])]]
    for i, r in enumerate(rows):
        emph = (total_row and i == len(rows) - 1) or i in hi or i in sub
        cells = [Paragraph(r[0], CELL_B if emph else CELL)]
        for j, v in enumerate(r[1:]):
            cells.append(Paragraph(v, (CELL_BR if emph else CELL_R) if aligns[j] == "r"
                                   else (CELL_B if emph else CELL)))
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1)
    st = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3.4), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.4),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2 if total_row else -1), [white, SURFACE]),
    ]
    if total_row:
        st += [("BACKGROUND", (0, -1), (-1, -1), CREAM), ("LINEABOVE", (0, -1), (-1, -1), 1, GOLD)]
    for i in hi:
        st.append(("BACKGROUND", (0, i + 1), (-1, i + 1), PANEL))
    for i in sub:
        st.append(("LINEABOVE", (0, i + 1), (-1, i + 1), 0.6, GOLD))
    t.setStyle(TableStyle(st))
    return t



sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib_medlyfe_introduces as L

MEDIA = L.MEDIA_NET
INVOICED = L.PROGRAMME_TOTAL - MEDIA
TR1, TR2 = 0.80, 0.20

GROUPS = [
    ("The evening", L.cost_group("The evening"),
     "Venue, set, catering, crew, print and front of house"),
    ("The campaign, excluding media", L.cost_group("The campaign") - MEDIA,
     "The twelve piece education series, logistics and licensing"),
    ("Website and print", L.cost_group("Website and print"),
     "Site, hosting and clinic collateral"),
    ("CFA operational cost", L.FEE,
     "Programme lead, event executive, coordination, travel and comms"),
]


def build():
    doc = BaseDocTemplate(
        str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=42, bottomMargin=30,
        title="Invoice %s - Medlyfe Introduces" % INVOICE_NO, author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 30, FULLW, PAGE_H - 42 - 30, id="f")], onPage=page_bg)])
    el = []

    el.append(Paragraph("Invoice", style("t", fontName="Helvetica-Bold", fontSize=19, leading=22,
                                         textColor=NAVY, spaceAfter=2)))
    el.append(Paragraph("Medlyfe Introduces, edition one.",
                        style("st", fontName="Helvetica-Oblique", fontSize=10.5, leading=13,
                              textColor=GOLD, spaceAfter=8)))

    el.append(tbl(
        [["Invoiced to", "<br/>".join(CLIENT)],
         ["Matter", MATTER],
         ["Invoice number", INVOICE_NO],
         ["Invoice date", INVOICE_DATE],
         ["Terms", PAYMENT_TERMS]],
        ["", ""], [104, FULLW - 104], aligns=["l"]))

    el.append(Paragraph("01  /  THE PROGRAMME", EYEBROW))
    el.append(Paragraph("The evening and the eight weeks that follow it.", H1))
    el.append(tbl(
        [[t, d, ngn(v)] for t, v, d in GROUPS] + [["Total", "", ngn(INVOICED)]],
        ["", "", "NGN"], [146, FULLW - 234, 88], total_row=True, aligns=["l", "l"]))
    el.append(Spacer(1, 3))
    el.append(Paragraph(
        "The media plan agreed on 28 September, NGN %s, is settled directly with the outlets "
        "and is not included above." % "{:,}".format(MEDIA), SMALL))

    el.append(Paragraph("02  /  DUE NOW", EYEBROW))
    el.append(Paragraph("On approval.", H1))
    el.append(tbl(
        [["On approval, %d%% of the programme" % (TR1 * 100), ngn(INVOICED * TR1)],
         ["Amount due now", ngn(INVOICED * TR1)]],
        ["", "NGN"], [FULLW - 128, 128], total_row=True, hi={0}))
    el.append(Spacer(1, 4))
    el.append(card(
        "The venue, the set, the crew, the printer and the anchor outlet are all settled before "
        "the night. This tranche is non-refundable once committed to suppliers. If the evening "
        "is postponed, committed costs stand and the balance carries to the new date.", bg=PANEL))

    el.append(Paragraph("03  /  THE BALANCE", EYEBROW))
    el.append(Paragraph("After the evening.", H1))
    el.append(tbl(
        [["After the evening", "%d%%" % (TR2 * 100), ngn(INVOICED * TR2),
          "The campaign weeks, and the account reconciled against what was spent"]],
        ["Stage", "Share", "NGN", ""],
        [138, 44, 88, FULLW - 270], aligns=["r", "r", "l"]))

    el.append(Paragraph("04  /  PAYMENT", EYEBROW))
    el.append(Paragraph("Where to send it.", H1))
    el.append(tbl([[k, v] for k, v in BANK], ["", ""], [116, FULLW - 116], aligns=["l"]))
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
    print("wrote %s" % OUT)


if __name__ == "__main__":
    build()
