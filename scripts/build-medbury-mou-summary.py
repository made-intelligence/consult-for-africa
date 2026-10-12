"""
Build the one page summary that goes out with the MOU.

CFA opened at 10 per cent of division revenue. Medbury's adviser countered with a
fixed base, 3 per cent of collected net revenue and 5 per cent of EBITDA over budget.
Itunu's own condition was narrower and more useful than her adviser's paper: revenue
share is fine if it is gated on hitting EBITDA.

This accepts her architecture whole and moves three numbers. Figures come from
scripts/lib_medbury_mgmt_fee.py so nothing in the text can drift from the model.

CFA house style, navy and gold. NGN. No em dashes.

Run:
  python3 scripts/build-medbury-aesthetics-management-terms.py
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "medbury-mou-summary-cfa.pdf"

# Single source of truth for the mandate's own figures, and for the fee model.
_spec = importlib.util.spec_from_file_location(
    "_mandate", Path(__file__).resolve().parent / "build-medbury-aesthetics-mandate.py")
_m = importlib.util.module_from_spec(_spec)
sys.modules["_mandate"] = _m
_spec.loader.exec_module(_m)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib.util as _il
_sp = _il.spec_from_file_location("_mou", Path(__file__).resolve().parent / "build-medbury-division-mou.py")
MOU = _il.module_from_spec(_sp)
sys.modules["_mou"] = MOU
_sp.loader.exec_module(MOU)

M = _m.M
FEE = _m.FEE
DIVISION_REVENUE_Y2 = _m.DIVISION_REVENUE_Y2

PAGE_W, PAGE_H = A4
MARGIN = 44
FULLW = PAGE_W - 2 * MARGIN

NAVY, GOLD, TEAL = HexColor("#0F3D2E"), HexColor("#C6A15B"), HexColor("#2F6B52")
BODY, MUTED = HexColor("#23302B"), HexColor("#7C7C74")
SURFACE, LIGHT = HexColor("#F5F2EA"), HexColor("#CBDDD1")
PANEL, CREAM = HexColor("#E9F0EA"), HexColor("#F6EFDD")
ALERT, RUST = HexColor("#FBF0E4"), HexColor("#B8763A")


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=8.2, leading=10.9, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=4)
    base.update(kw)
    return ParagraphStyle(name, **base)


TITLE = style("t", fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=NAVY, spaceAfter=2)
SUB = style("sub", fontSize=9, leading=12, textColor=TEAL, spaceAfter=7)
H = style("h", fontName="Helvetica-Bold", fontSize=9.2, leading=11.8, textColor=NAVY,
          spaceBefore=3.5, spaceAfter=1.5, keepWithNext=1)
P = style("p")
BUL = style("bul", leftIndent=10, bulletIndent=2, spaceAfter=2.4)
CELL = style("cell", fontSize=7.6, leading=10.0)
CELL_R = style("cellr", fontSize=7.6, leading=10.0, alignment=2)
CELL_B = style("cellb", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold", textColor=NAVY)
CELL_BR = style("cellbr", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold",
                textColor=NAVY, alignment=2)
CELL_W = style("cellw", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold", textColor=white)
CELL_WR = style("cellwr", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold",
                textColor=white, alignment=2)
SMALL = style("small", fontSize=7.0, leading=9.4, textColor=MUTED)


def ngn(x):
    return f"{x/M:,.0f}"


def page_bg(c, doc):
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, PAGE_H - 26, PAGE_W, 26, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PAGE_H - 29, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 7.6)
    c.drawString(MARGIN, PAGE_H - 18, "MEDBURY: THE CFA MANAGED DIVISION")
    c.setFillColor(LIGHT); c.setFont("Helvetica", 7.6)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 18, "Memorandum of understanding  /  summary")
    c.setFillColor(GOLD); c.rect(MARGIN, 24, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.8)
    c.drawString(MARGIN, 14, "Private and confidential  /  Dr Itunu Akinware, Group CEO  /  a summary of the Memorandum, which governs")
    c.drawRightString(PAGE_W - MARGIN, 14, "One page  /  the Memorandum governs")
    c.restoreState()


def card(text, bg=SURFACE, fg=BODY, rule=GOLD):
    st = ParagraphStyle("c", parent=P, textColor=fg, leftIndent=5, rightIndent=5,
                        spaceBefore=1, spaceAfter=1)
    t = Table([[Paragraph(text, st)]], colWidths=[FULLW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, rule),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def tbl(el, rows, labels, widths, total_row=False, aligns=None):
    if aligns is None:
        aligns = ["l"] * (len(labels) - 1)
    data = [[Paragraph(labels[0], CELL_W)] +
            [Paragraph(t, CELL_WR if aligns[j] == "r" else CELL_W)
             for j, t in enumerate(labels[1:])]]
    for i, r in enumerate(rows):
        emph = total_row and i == len(rows) - 1
        cells = [Paragraph(r[0], CELL_B if emph else CELL)]
        for j, v in enumerate(r[1:]):
            cells.append(Paragraph(v, (CELL_BR if emph else CELL_R) if aligns[j] == "r"
                                   else (CELL_B if emph else CELL)))
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1)
    st = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.0), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.0),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2 if total_row else -1), [white, SURFACE]),
    ]
    if total_row:
        st += [("BACKGROUND", (0, -1), (-1, -1), CREAM),
               ("LINEABOVE", (0, -1), (-1, -1), 0.9, GOLD)]
    t.setStyle(TableStyle(st))
    el.append(t)
    el.append(Spacer(1, 4))


def bullets(el, items):
    for i in items:
        el.append(Paragraph(i, BUL, bulletText="•"))









def build():
    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=32, bottomMargin=20,
                          title="Medbury division MOU - summary",
                          author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 20, FULLW, PAGE_H - 32 - 20, id="f")], onPage=page_bg)])
    el = []
    T = {w: a for w, a, _n in MOU.TRANCHES}

    el.append(Paragraph("THE MEMORANDUM, IN ONE PAGE", TITLE))
    el.append(Paragraph("What we agreed, where it sits in the document, and what is needed to start.", SUB))

    el.append(card(
        "<b>This summarises the Memorandum. It does not replace it.</b> Where this page and a "
        "clause differ, the clause governs. The Memorandum records the terms we settled between "
        "ourselves on 20 and 21 September, and it is not binding except on confidentiality, "
        "status, governing law and the general clauses. The definitive services agreement "
        "follows.", bg=CREAM))

    el.append(Paragraph("The commercial terms", H))
    tbl(el, [
        ["Setup", f"NGN {MOU.SETUP_FEE}M across five months, Lagos and Abuja, in tranches of "
         + " / ".join(f"{a:.1f}" for _w, a, _n in MOU.TRANCHES) +
         ". Exclusive of VAT and of government and regulatory fees, which Medbury pays at cost. "
         "The platform build is inside it", "4, 5, 21"],
        ["The two COOs", "Medbury employs and pays salary and benefits. CFA recruits both at its "
         "own cost and Medbury approves each appointment. Both are seconded to CFA and report to "
         "CFA for delivery", "7"],
        ["Support fee", f"NGN {MOU.SUPPORT_FEE:.0f}M a month from month six, payable in advance "
         f"on the fifth business day of the month, on a standing instruction", "8, 14"],
        ["Performance", f"{MOU.REV_RATE} per cent of collected net revenue, paid quarterly and "
         f"trued up annually. One element only, with no share of EBITDA. Payable only where the "
         f"Board's revenue and EBITDA goals for the period are both met, so it is not paid on "
         f"revenue bought at the expense of profit. Only items passed through at cost are "
         f"outside the base", "9"],
        ["Term", f"{MOU.TERM_MONTHS} months, with a formal review at {MOU.REVIEW_MONTHS} months",
         "22"],
    ], ["", "What it says", "Clause"], [74, FULLW - 136, 62])

    el.append(Paragraph("What the monthly fee buys, which is two things and not one", H))
    tbl(el, [
        ["The support functions", "Finance, marketing and sales, HR, clinical governance and "
         "quality, technology, commercial and pricing, procurement, and partner oversight. Each "
         "carried at CFA's premises and on CFA's payroll, so none of these posts sits on yours"],
        ["The direction of the division", "Steering the five businesses toward the goals the "
         "Board sets, exercised through the seconded chief operating officers. CFA is engaged to "
         "manage the division and not merely to service it"],
    ], ["Clause 8.2", "What it covers"], [116, FULLW - 116])

    el.append(Paragraph("Five things worth knowing before you read the clauses", H))
    tbl(el, [
        ["The platform is built, not rented",
         "CFA builds a platform for the division inside the setup fee. No licence fee, build fee "
         "or implementation fee, now or later. On payment of the setup fee it is yours, with the "
         "source code and the documentation delivered and a copy held in escrow. CFA keeps only "
         "the frameworks and libraries it brings and reuses across its work, and you have a "
         "perpetual royalty free licence to those", "21"],
        ["There is a plan to hand it back",
         "The Memorandum does not assume CFA manages the division for ever. Each review asks "
         "whether it is ready to be run inside Medbury or by a successor, with 90 days' notice, "
         "a structured handover and no penalty either way. Everything it runs on is already "
         "yours, so a handover is a process rather than a rescue", "22"],
        ["If it goes well, there is a path",
         "Before appointing anyone else to manage another Medbury business on comparable terms, "
         "Medbury gives CFA a first opportunity to propose. It does not oblige you to accept it", "23"],
        ["Facilities is not inside this",
         "CFA does facilities management and biomedical engineering and would like to, but it "
         "belongs on its own retainer. Before it can be priced we need to settle whether the "
         "scope is the whole of Lyfe Place or only the division's spaces, and Lagos and Abuja "
         "are quoted apart", "20"],
        ["Clinical responsibility stays with Medbury",
         "The facility, clinical and professional registrations are held in Medbury's name, and "
         "clinical care and clinical negligence remain Medbury's. CFA is not a healthcare "
         "provider and does not practise medicine", "18, 19"],
    ], ["", "What it means", "Clause"], [108, FULLW - 170, 62])

    el.append(Paragraph("What is needed to start", H))
    bullets(el, [
        "<b>Signature, and the first tranche.</b> The five months run from the date the first "
        f"tranche is received, so that date is the Commencement Date.",
        "<b>The two chief operating officer briefs approved</b>, so recruitment can open in week "
        "one rather than after mobilisation.",
        "<b>A named finance contact on each side</b>, and the standing instruction for the "
        "monthly fee set up before month six.",
    ])
    el.append(Spacer(1, 2))
    el.append(card(
        "<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; +234 913 813 8553 "
        "&nbsp; / &nbsp; hello@consultforafrica.com", bg=NAVY, fg=white, rule=GOLD))

    doc.build(el)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
