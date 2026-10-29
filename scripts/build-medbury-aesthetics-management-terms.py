"""
Build the Medbury Aesthetics management agreement terms.

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
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "medbury-aesthetics-management-terms-cfa.pdf"

# Single source of truth for the mandate's own figures, and for the fee model.
_spec = importlib.util.spec_from_file_location(
    "_mandate", Path(__file__).resolve().parent / "build-medbury-aesthetics-mandate.py")
_m = importlib.util.module_from_spec(_spec)
sys.modules["_mandate"] = _m
_spec.loader.exec_module(_m)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib_medbury_mgmt_fee as F

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
          spaceBefore=4.5, spaceAfter=2, keepWithNext=1)
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
    c.drawString(MARGIN, PAGE_H - 18, "MEDBURY AESTHETICS, LAGOS")
    c.setFillColor(LIGHT); c.setFont("Helvetica", 7.6)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 18, "Management agreement  /  terms")
    c.setFillColor(GOLD); c.rect(MARGIN, 24, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.8)
    c.drawString(MARGIN, 14, "Private and confidential  /  Dr Itunu Akinware, Group CEO  /  figures illustrate the structure, they are not a forecast")
    c.drawRightString(PAGE_W - MARGIN, 14, "Page %d of 2" % doc.page)
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
        ("TOPPADDING", (0, 0), (-1, -1), 2.4), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.4),
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
                          title="Medbury Aesthetics - management agreement, terms",
                          author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 20, FULLW, PAGE_H - 32 - 20, id="f")], onPage=page_bg)])
    el = []
    b, r, e = F.CFA_BASE_MONTH / M, F.CFA_REV_RATE, F.CFA_EBITDA_RATE

    el.append(Paragraph("THE MANAGEMENT AGREEMENT", TITLE))
    el.append(Paragraph("Your structure, three numbers moved. Terms for signature.", SUB))

    el.append(card(
        "<b>Your adviser is right and I am taking the structure whole.</b> A share of revenue on "
        "its own does scale past what the work is worth, and it pays the same whether the division "
        "is profitable or not. Both are fair, and neither is answered by me repeating my number. "
        "So this is your paper: a base, a performance fee on collections, and a share of profit "
        "above budget. Three numbers moved, everything else accepted as written, including your "
        "definition of net revenue, the term, the review and your right to terminate.", bg=CREAM))

    el.append(Paragraph("The terms", H))
    tbl(el, [
        ["Base management fee", f"NGN {b:.1f}m a month",
         "The embedded chief operating officer and the whole CFA back office behind them, as set "
         "out below. Invoiced monthly in arrears from month 6"],
        ["Performance fee", f"{r*100:.1f}% of collected net revenue",
         "Cash actually collected, excluding VAT, refunds, drugs and implants and other agreed "
         "pass-through third party costs. Your definition, taken as written"],
        ["Profit incentive", f"{e*100:.1f}% of EBITDA above budget",
         "Measured against the Board-approved annual budget, so it pays for profitable growth "
         "and not for turnover"],
        ["Initial term", f"{F.TERM_MONTHS} months",
         f"With a formal review at {F.REVIEW_MONTHS} months"],
        ["Termination", "Medbury's right, as drafted",
         "For sustained failure against the agreed measures. Accepted without qualification: if "
         "the division is not performing you should not be tied to me"],
    ], ["", "", "What it means"], [96, 92, FULLW - 188])

    el.append(Paragraph("Our management structure: a COO in your building, a back office in mine", H))
    el.append(Paragraph(
        "You are not buying a manager. You are buying a management structure: one chief operating "
        "officer inside the division, and the back office that person needs sitting in my office "
        "rather than yours, on my payroll and at my desks.", P))
    tbl(el, [
        ["<b>The COO, in your building</b>",
         "Full time in the division, a member of my team and not yours, paid out of the base fee. "
         "Runs the five businesses day to day, sits in your management meetings like any other "
         "divisional head, answers to your Board through me"],
        ["<b>The back office, in mine</b>",
         "Three functions carried by CFA, costing you no headcount and no floor space. "
         "<b>Finance:</b> management accounts, revenue cycle and collections, payroll processing "
         "and the board pack. <b>Marketing and sales:</b> campaigns, content, the enquiry funnel "
         "and conversion. <b>HR:</b> recruitment, contracts, onboarding, credentialing files and "
         "performance. Behind those three, clinical governance and quality, platform "
         "administration and reporting, commercial and pricing so the rate card is repriced "
         "rather than left to age, procurement and supplier management, and my own partner time "
         "on anything that reaches your Board"],
        ["<b>The division pays for the front line, and only the front line</b>",
         "Practice leads, doctors, nurses, therapists, technicians and reception across the five "
         "entities, plus stock, the platform licence and hardware and marketing spend. Everything "
         "that touches a patient or is consumed by one"],
        ["<b>Facilities stays with Medbury</b>",
         "The building and everything in it: maintenance, security, cleaning, power, water, "
         "medical gases, waste and the service contracts behind them. I am not taking this on, "
         "and I would rather say so now than be assumed into it later. It needs a named owner on "
         "your side from day one: a list stops for a failed generator as surely as for a missing "
         "surgeon"],
    ], ["The layer", "What it is, and who carries it"], [104, FULLW - 104])
    el.append(card(
        f"<b>That is why {b:.1f} a month is not a management fee in the usual sense.</b> It buys "
        "a chief operating officer plus finance, marketing and sales, and HR. Replicate that by "
        "hiring and you are at five or six salaries plus the desks they sit at, before you have "
        "employed a single person who touches a patient. The dividing line is the front line: "
        "anything that touches a patient sits with you, everything behind it sits with me, and "
        "the one thing I am not taking is the building.", bg=PANEL))
    el.append(Paragraph("The COO, since it is the question underneath all of this", H))
    bullets(el, [
        "<b>Mine, not yours.</b> Employed by CFA and seconded full time, so you are not "
        "recruiting the post, carrying it on payroll or carrying the employment risk.",
        "<b>If they are wrong, I replace them.</b> At my cost, no recruitment fee to you, no "
        "notice to serve and no severance on your books.",
        "<b>And if you later want them in house</b>, that is a conversation at the twelve month "
        "review and I will not stand in the way of it.",
    ])

    el.append(Paragraph("The three numbers I have moved, and why", H))
    tbl(el, [
        ["Base", f"2.5 to {b:.1f}",
         "2.5 a month is a sound number for a division manager. It is not the grade of the person "
         "accountable to your Board for five operating companies, their clinical governance and "
         "their profit. I will not staff it at that grade and then be judged at this one"],
        ["Performance fee", f"3.0 to {r*100:.1f} per cent",
         "A half point, on collections rather than billings, so I am paid on cash in your bank "
         "rather than on invoices raised"],
        ["Profit incentive", f"5.0 to {e*100:.1f} per cent",
         "A half point on the only line that measures whether the division is actually working"],
    ], ["", "Moved", "Why"], [78, 62, FULLW - 140])

    el.append(Paragraph("Where the alignment sits, without anyone having to trust me", H))
    bullets(el, [
        "<b>Collected, not billed.</b> A division that bills well and collects badly pays me "
        "nothing on the difference, which puts me on the same side of the revenue cycle as your "
        "finance team rather than opposite it.",
        "<b>Net, not gross.</b> Drugs, implants and pass-through costs come out before the fee "
        "is calculated, so I cannot grow my fee by routing cost through the division.",
        "<b>Above budget, and you can leave.</b> You set the target the incentive is measured "
        "against, and sustained failure against the agreed measures ends the agreement.",
    ])

    el.append(Paragraph("What it costs, against the 10 per cent I opened with", H))
    el.append(Paragraph(
        "I would rather put this in front of you than have it found. On the division's own "
        f"modelled revenue this costs you more than the 10 per cent did, not less. It is cheaper "
        f"only above roughly NGN {F.crossover()/M:,.0f}m of revenue, and the gap widens from there.", P))
    tbl(el,
        [[f"NGN {g:,}m",
          f"{F.opening(g*M)/M:,.0f}",
          f"{F.adviser(g*M)/M:,.0f}",
          f"{F.counter(g*M)/M:,.0f}",
          note]
         for g, note in [
             (400, "The division's own year two model. This costs you more"),
             (1000, "Below the 10 per cent and falling away from it"),
             (2000, "Half of what the 10 per cent would have taken"),
             (5000, "Where your adviser's concern lived. It is answered")]],
        ["Division revenue", "The 10%", "Your paper", "This", "What it shows"],
        [66, 40, 44, 38, FULLW - 188], aligns=["r", "r", "r", "l"])
    el.append(card(
        "<b>That is the trade, plainly.</b> You have asked me to give up the top end and I am "
        "giving it up: at two billion this takes half of what my number would have taken, at five "
        "billion a little over a third. The price of capping the tail is a floor at the front, and "
        "the floor is the base fee. I would not ask for one without the other.", bg=PANEL))

    el.append(card(
        f"<b>Lyfe Plastics and Dermatology, since you asked: included.</b> The NGN {ngn(FEE)}m "
        "covers the operating build across all five entities and it is one of the five, so there "
        "is no second invoice for it and none coming. Outside that fee sit only the tri-party "
        "shareholder agreement, which is its own instrument and already in hand, and CFA's "
        "minority holding in that one company. That holding was calculated on the basis that the "
        "setup fee is charged in full: waiving the fee would have made the equity larger, not "
        "smaller.", bg=CREAM))

    el.append(Paragraph("The measures your termination right rests on", H))
    el.append(Paragraph(
        "Written now rather than at the end, and set where a well run division meets them rather "
        "than where it has to be exceptional. A measure you can only hit in a good quarter is not "
        "a control, it is a trap, and it would make me manage to the schedule instead of to the "
        "business.", P))
    tbl(el, [
        ["Revenue", "85% of the Board-approved budget or better",
         "Rolling two quarters, so one slow quarter does not count against the division"],
        ["Profit", "Within 3 points of the budgeted EBITDA margin",
         "Rolling two quarters, measured against the budget your Board sets"],
        ["Collections", "No more than 5% of billed revenue outstanding beyond 60 days",
         "Quarterly. Mostly a cash-paying division, so this is really about the programme book"],
        ["Utilisation", "55% of available clinical sessions",
         "Quarterly, from the platform rather than from a return someone types up"],
        ["Cross-sell", "15% of patients treated by one entity booked into a second within 180 days",
         "Quarterly, from the record. This is the number that proves it is a division"],
        ["Clinical governance", "No unreported serious incident. Quarterly clinical audit "
         "completed. Complaints closed within 14 days",
         "Quarterly. This one is binary and I would not ask for latitude on it"],
        ["Patients", "Satisfaction at 4.0 of 5 or better",
         "Rolling quarter, on a standing survey rather than a sample chosen after the fact"],
        ["Reporting", "Board pack within 10 working days of month end",
         "Monthly. If you cannot see the division you cannot hold anyone to any of the above"],
    ], ["Measure", "Target", "How it is measured"], [66, 138, FULLW - 204])
    el.append(card(
        "<b>How they bite.</b> Measured quarterly, starting from the third full quarter, because "
        "a division opening cold should not be judged on its ramp. A breach is the same measure "
        "failed in two consecutive quarters, which triggers written notice and one quarter to "
        "remedy. If it is not remedied, you terminate. I would rather that be written down in "
        "your favour than left to a conversation when we are both annoyed.", bg=PANEL))
    el.append(Paragraph("The budget both the revenue measure and the incentive hang on", H))
    el.append(Paragraph(
        "Two of the measures hang on a budget, so it cannot be a loose word in a contract. This "
        "is how it is set, written to stop either of us gaming it.", P))
    tbl(el, [
        ["CFA proposes", "Eight weeks before the financial year end, entity by entity, with the "
         "volume and price assumptions shown rather than a single revenue line"],
        ["Your Board approves or amends", "Whatever the Board approves is the budget. If it "
         "raises my revenue proposal, the measure and the incentive both move up with it. If it "
         "lowers it, they both move down. I do not get to be measured against a number the Board "
         "did not set, and I do not get to argue afterwards that the number was unfair"],
        ["Neither of us re-bases mid-year", "The approved budget stands for the year unless we "
         "both agree in writing to change it. That stops a target being lowered to release an "
         "incentive, and it stops one being raised to deny it"],
        ["One exception", "A material event outside the division's control, such as a site "
         "closure or a regulatory suspension, triggers a joint review rather than automatic "
         "failure. <b>What I have not asked for:</b> no minimum term on the incentive, no floor "
         "under the revenue measure and no carve-out from your right to terminate"],
    ], ["The budget process", "How it works"], [96, FULLW - 96])
    el.append(Spacer(1, 2))
    el.append(card(
        "<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; +234 913 813 8553 "
        "&nbsp; / &nbsp; hello@consultforafrica.com", bg=NAVY, fg=white, rule=GOLD))
    doc.build(el)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
