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
    BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "medbury-management-costed-cfa.pdf"

# Single source of truth for the mandate's own figures, and for the fee model.
_spec = importlib.util.spec_from_file_location(
    "_mandate", Path(__file__).resolve().parent / "build-medbury-aesthetics-mandate.py")
_m = importlib.util.module_from_spec(_spec)
sys.modules["_mandate"] = _m
_spec.loader.exec_module(_m)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib_medbury_mgmt_v2 as V

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
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 18, "Management and setup  /  costed")
    c.setFillColor(GOLD); c.rect(MARGIN, 24, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.8)
    c.drawString(MARGIN, 14, "Private and confidential  /  Dr Itunu Akinware, Group CEO  /  figures illustrate the structure, they are not a forecast")
    c.drawRightString(PAGE_W - MARGIN, 14, "Page %d" % doc.page)
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







def orgcol(title, items, width):
    """A column of stacked boxes standing in for an org chart branch."""
    rows = [[Paragraph(title, CELL_W)]]
    style = [("BACKGROUND", (0, 0), (0, 0), NAVY),
             ("LINEBELOW", (0, 0), (0, 0), 1.2, GOLD),
             ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
             ("TOPPADDING", (0, 0), (-1, -1), 1.8), ("BOTTOMPADDING", (0, 0), (-1, -1), 1.8),
             ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5)]
    for i, (name, who, is_mgmt) in enumerate(items, start=1):
        cfa = who.startswith("CFA")
        rows.append([Paragraph(f"{name} <font size=6.2 color='#7C7C74'>({who})</font>",
                               CELL_B if cfa else CELL)])
        style.append(("BACKGROUND", (0, i), (0, i),
                      PANEL if cfa else (ALERT if is_mgmt else SURFACE)))
        style.append(("LINEBEFORE", (0, i), (0, i), 2.0,
                      TEAL if cfa else (RUST if is_mgmt else LIGHT)))
    t = Table(rows, colWidths=[width])
    t.setStyle(TableStyle(style))
    return t


def build():
    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=32, bottomMargin=20,
                          title="Medbury: management and setup, costed",
                          author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 20, FULLW, PAGE_H - 32 - 20, id="f")], onPage=page_bg)])
    el = []
    m = V.M

    el.append(Paragraph("MANAGEMENT AND SETUP, COSTED", TITLE))
    el.append(Paragraph("Your feedback taken, and the four numbers that have to move.", SUB))
    el.append(card(
        "<b>SUPERSEDED. Retained as the working behind the negotiation, not as an offer.</b> "
        "The terms settled on 21 September differ from this paper: the two chief operating "
        "officers are employed and paid by Medbury and seconded to CFA, the monthly fee is NGN "
        "3.0M rather than the figure argued here, and the performance remuneration is 3.5 per "
        "cent of collected net revenue alone with no share of EBITDA. The Memorandum of "
        "Understanding governs.", bg=ALERT, rule=RUST))

    el.append(card(
        "<b>Most of this is agreed and I am not going to relitigate it.</b> Two chief operating "
        "officers, yes. A shared CFA management layer, yes. 3.5 per cent on net revenue gated on "
        "both benchmark revenue and EBITDA, yes. A share of profit above the budget your Board "
        "sets, yes, and the principle is exactly right. Twenty five million for the setup, yes, "
        "unmoved. Four things do have to move: the base, the shape of the setup tranches, when "
        "the revenue fee is paid, and the size of that profit share, each below with the "
        "working.", bg=CREAM))

    el.append(Paragraph("What changed since the last paper: Medlyfe is in", H))
    el.append(Paragraph(
        "The group structure puts Medbury Aesthetics and Medlyfe Wellness and Regenerative both "
        "under CFA managed special units. So it is one special division of five businesses: "
        "cosmetic dentistry, hair restoration, plastics and dermatology, weight and bariatric, "
        "and Medlyfe wellness and regenerative. Medlyfe was not in the last paper and that is "
        "what changed. It is also why you are right that it needs two chief operating officers, "
        "one across the aesthetics businesses and one for Medlyfe. And it means the revenue the "
        "variable is calculated on is all five, so the upside you are giving me is larger than "
        "it was. I am pricing the base against the larger scope and I am content for the "
        "variable to be judged the same way.", P))

    el.append(card(
        "<b>And on the word division, since you corrected me and you were right to.</b> A "
        "division is a unit of several businesses that share resources. That definition is the "
        "whole argument, because the shared resources are the thing being priced here. The rate "
        "card, the record, the back office and the operating rhythm are what the management "
        "layer provides, and they are what makes five businesses one division. The same five "
        "without them are five businesses at one address, each carrying its own protocols, its "
        "own staffing model, its own regulatory file and its own profit and loss. <b>So the "
        "bench is not an overhead sitting on top of the division. It is the thing that makes it "
        "one.</b><br/><br/>You group by similarity and by size, and you grow a business until it "
        "is big enough to stand on its own. That is exactly the job here. These five are one "
        "division because at this size shared resources are the only way they are viable, and "
        "the work is to grow them to the point where that stops being true. It is also why the "
        "structure has a trigger in it rather than a fixed shape.", bg=CREAM))

    el.append(card(
        "<b>Which is also where the bench earns its place.</b> A chief operating officer owns a "
        "profit and loss, so there are two P&amp;L owners here: one for Medbury Aesthetics and "
        "one for Medlyfe. Each will optimise their own, correctly and in good faith. But the "
        "cross-sell between them, the one rate card across all five, the shared record and the "
        "referral path belong to neither, because not one of those sits inside a single P&amp;L. "
        "<b>Shared resources with no owner do not stay shared.</b> That is what the bench owns, "
        "and it is the reason the five hold together as a division rather than drifting back "
        "into separate businesses at one address.", bg=PANEL))

    el.append(Paragraph("The base, costed from the bottom up", H))
    el.append(Paragraph(
        f"Two chief operating officers at {V.COO_CAP:.1f} a month gross, which is your own cap "
        f"for the post and not a number I have argued up. Loaded at {(V.LOADING-1)*100:.0f} per "
        f"cent for the employer contributions set out in Appendix A, because a "
        f"salary is not what a person costs. Every figure below is either yours or a statutory "
        f"one.", P))
    tbl(el, [
        ["Two chief operating officers, fully loaded", f"{V.COO_LOADED/m:.2f}", f"{V.COO_LOADED/m:.2f}",
         f"One across the aesthetics businesses, one for Medlyfe, at your cap of "
         f"{V.COO_CAP:.1f} gross. Dedicated, full time, and not shareable with anyone"],
    ] + [[n, f"{a2:.2f}", f"{b2:.2f}", ""] for n, a2, b2 in V.SHARED] + [
        ["<b>The establishment, monthly</b>", f"<b>{V.STANDALONE/m:.2f}</b>",
         f"<b>{V.BASE_ASK/m:.2f}</b>",
         "<b>What it costs, before anything is discounted</b>"],
    ], ["The post or function", "If you hire it", "Through CFA", "Note"],
        [196, 46, 44, FULLW - 286], aligns=["r", "r", "l"], total_row=True)
    el.append(card(
        f"<b>Your {V.HER_UNIT/m:.1f} does not cover the two chief operating officers at your own "
        f"cap, before a single person behind them.</b> Two COOs at {V.COO_CAP:.1f} gross cost "
        f"{V.COO_LOADED/m:.2f} a month once loaded. Add the bench and the establishment is "
        f"{V.BASE_ASK/m:.2f}, so {V.HER_UNIT/m:.1f} is short by {(V.BASE_ASK-V.HER_UNIT)/m:.2f}. "
        f"I am not disputing the salary. I am saying that two of them plus a back office is not "
        f"{V.HER_UNIT/m:.1f}.", bg=PANEL))
    el.append(card(
        f"<b>The bench is not general administration and it should not be priced as though it "
        f"were.</b> It is finance that can account for a course of treatment paid for before it "
        f"is delivered, "
        f"marketing into a discretionary category where conversion is the whole game, clinical "
        f"governance in a field with real medico-legal exposure, and pricing for elasticity "
        f"rather than a tariff. Employ that directly and you are at {V.STANDALONE/m:.0f} a month "
        f"plus the desks. Through CFA it is {V.BASE_ASK/m:.2f}, because the bench serves more "
        f"than one client and you pay for the share you use.", bg=CREAM))

    el.append(Paragraph(f"What I am proposing: the full establishment, for {V.PRICE/m:.1f}", H))
    tbl(el, [
        ["Two COO salaries, gross", f"{V.COO_GROSS/m:.2f}",
         f"Two posts at your cap of {V.COO_CAP:.2f} a month each"],
        [f"Employer contributions at {V.LOADING_PCT:.0%}", f"{V.COO_GROSS*V.LOADING_PCT/m:.2f}",
         "Pension, thirteenth month, NSITF, ITF, group life and HMO. Broken out in Appendix A"],
        ["<b>Two COOs, fully loaded</b>", f"<b>{V.COO_LOADED/m:.2f}</b>", ""],
        ["The shared CFA bench", f"{V.MGMT_CHARGE/m:.2f}",
         "Finance, marketing and sales, HR, clinical governance, technology, procurement and "
         "oversight, carried at CFA and not on your payroll"],
        ["What it costs", f"{V.BASE_ASK/m:.2f}", ""],
        ["CFA absorbs", f"({V.ABSORBED/m:.2f})",
         f"{V.ABSORB_PCT*100:.0f} per cent of it, carried by me rather than billed to you"],
        ["<b>What you pay</b>", f"<b>{V.PRICE/m:.2f}</b>",
         "<b>For the full establishment above, nothing removed</b>"],
    ], ["", "NGN M a month", "What it is"], [150, 58, FULLW - 208],
        aligns=["r", "l"], total_row=True)
    el.append(card(
        f"<b>That is about {V.ABSORBED*12/m:.0f} million a year I am carrying, and I would "
        f"rather show it than bury it.</b> The return on this should come from the variable once "
        f"the division is performing, not from a monthly cheque while it is being built. "
        f"Both appointments are yours to approve, you see what they cost, and the search, "
        f"assessment and onboarding of both is mine and not billed to you.", bg=PANEL))

    el.append(Paragraph("What happens if the COO salary lands somewhere else", H))
    el.append(Paragraph(
        f"The salary element is a pass-through at actual cost, so the base moves with whatever "
        f"it takes to land the right person. Worth seeing the sensitivity now rather than "
        f"arguing about it at offer stage with a candidate waiting on an answer. The "
        f"{V.PRICE/m:.1f} holds in every line below. What changes is how much of the "
        f"establishment I am carrying.", P))
    tbl(el, [[f"{g:.2f}", f"{g*V.LOADING:.2f}", f"{2*g*V.LOADING:.2f}",
              f"{V.establishment(g)/m:.2f}", f"{(V.establishment(g)-V.ABSORBED)/m:.2f}",
              V.SCENARIO_NOTE[g]]
             for g in V.SALARY_SCENARIOS],
        ["COO gross", "Loaded, each", "Two COOs", "Establishment", "You would pay",
         "What it buys you"],
        [44, 46, 40, 68, 46, FULLW - 244], aligns=["r", "r", "r", "r", "r"])
    el.append(card(
        f"<b>Your cap is the middle line and it is what this paper is built on.</b> I am not "
        f"pushing you above it. But if a candidate you want needs more, I would rather we both "
        f"knew today that the base follows the salary by the naira movement and nothing else, "
        f"and that I keep carrying the same {V.ABSORBED/m:.2f} whichever line we land on. If "
        f"you fill the posts below your cap the base falls the same way. This is symmetric and I "
        f"would not propose it otherwise.", bg=CREAM))

    el.append(Paragraph("Which means the whole question is what the bench is worth", H))
    el.append(Paragraph(
        f"The two salaries are settled at your own cap and I am not arguing about them. So it is "
        f"worth being blunt about what is actually left in dispute. At {V.PRICE/m:.1f}, once the "
        f"two chief operating officers are paid for, this is what remains for everything behind "
        f"them.", P))
    tbl(el, [
        ["What you pay", f"{V.PRICE/m:.2f}", ""],
        ["Two COOs at your cap, fully loaded", f"({V.COO_LOADED/m:.2f})",
         f"{V.COO_GROSS/m:.2f} gross plus {V.COO_GROSS*V.LOADING_PCT/m:.2f} of employer "
         f"contributions. Not in dispute"],
        ["<b>Left for the entire back office</b>", f"<b>{V.BENCH_IMPLIED/m:.2f}</b>",
         f"<b>Across {len(V.SHARED)} specialist functions, about NGN "
         f"{format(int(V.BENCH_PER_FUNCTION), ',')} a month each</b>"],
    ], ["", "NGN M a month", "Note"], [150, 58, FULLW - 208], aligns=["r", "l"], total_row=True)
    el.append(card(
        f"<b>NGN {V.BENCH_IMPLIED/m:.2f}M a month.</b> That is what the finance function, the "
        f"marketing and sales function, HR, clinical governance, the platform, pricing, "
        f"procurement and my own time come to at this price. It is less than one junior manager, "
        f"for capability that would cost you {V.SHARED_STANDALONE/m:.1f} a month to employ and "
        f"costs me {V.SHARED_CHARGED/m:.2f} to provide. I am not presenting that as a bargain to "
        f"be proud of. I am presenting it because it is the number the conversation is actually "
        f"about.", bg=PANEL))
    el.append(card(
        "<b>And the thing I would say plainly.</b> I am content to carry part of this while the "
        "division is being built, because that is what a partner does and because my return "
        "should come from it performing. What I am not willing to do is have it run as the "
        "group's leanest division because I am absorbing its management. A division that looks "
        "efficient because its operator is subsidising it is not efficient, it is subsidised, and "
        "the day that stops the numbers move. I would rather the cost sat on the page and the "
        "division were judged on what it actually earns.", bg=ALERT, rule=RUST))

    el.append(Paragraph("How the base moves each year, and the escalator", H))
    el.append(Paragraph(
        f"A fee fixed in naira and reviewed vaguely at some future date is how this kind of "
        f"arrangement sours. Salaries move here, the statutory stack moves and inflation is what "
        f"it is, so I would rather write the mechanism now while neither of us is under "
        f"pressure. It cuts both ways: if the establishment is smaller next year, so is the "
        f"base.", P))
    tbl(el, [[n, h, w] for n, h, w in V.ESCALATOR],
        ["Element", "How it is set", "When it moves"], [96, 140, FULLW - 236])
    el.append(card(
        f"<b>The collar is the point.</b> A charge indexed to Nigerian inflation with no cap is "
        f"not something a Board should sign, and a charge frozen in naira is not something I can "
        f"carry. So the bench escalates by published CPI between {V.CPI_FLOOR:.0%} and "
        f"{V.CPI_CAP:.0%}, and if inflation runs past the cap for two years running we look at "
        f"it together rather than one of us absorbing it in silence. The salaries are not "
        f"indexed at all, because they are a fact on a payslip rather than a forecast.", bg=PANEL))
    el.append(card(
        f"<b>And one thing that is not a payroll question.</b> If the division outgrows this "
        f"structure, {V.STEP_TRIGGER.lower()}, we look at it then rather than pretending a "
        f"bigger business runs on the same management. Between the annual review and that "
        f"trigger, I am comfortable carrying {V.ABSORBED*12/m:.0f} a year in the meantime. "
        f"Without them I would not be, and you would not expect me to.", bg=CREAM))

    el.append(Paragraph("The variable: what it pays, and when it is paid", H))
    el.append(Paragraph(
        f"Both percentages are yours in principle and the structure is yours entirely: a share "
        f"of collected net revenue gated on hitting benchmark revenue and EBITDA, and a share of "
        f"EBITDA once the division is at or above the budget your Board approved. Modelled on "
        f"combined revenue across all five businesses, collected net at {V.NET_FACTOR:.0%} of "
        f"gross, and a Board-approved EBITDA margin of {V.BUDGET_MARGIN:.0%}.", P))
    tbl(el, [[f"{g:,}", f"{V.PRICE*12/m:.1f}", f"{V.rev_fee(g*m)/m:.1f}",
              f"{g*V.BUDGET_MARGIN:.0f}",
              f"{V.profit_share(g*m)/m:.1f}",
              f"{V.cfa_year(g*m, V.PRICE)/m:.1f}",
              f"{V.cfa_year(g*m, V.PRICE)/(g*m)*100:.1f}%"] for g in [400,600,800,1200,2000]],
        ["Combined revenue", "Base", f"{V.REV_RATE*100:.1f}% of net", "EBITDA at budget",
         f"{V.EBITDA_RATE*100:.0f}% of it", "Total to CFA", "Share of revenue"],
        [86, 44, 60, 62, 48, 58, FULLW - 358], aligns=["r", "r", "r", "r", "r", "r"])
    el.append(card(
        f"<b>You told me a share of revenue does not make me care about profit. You were right, "
        f"and this is the number that fixes it.</b> At your {V.HER_EBITDA_RATE:.0%}, about three "
        f"quarters of what I earn still follows turnover. At {V.EBITDA_RATE:.0%} roughly a third "
        f"of it follows margin instead, which is the balance you were asking for when you raised "
        f"the objection. It is also the only place the part of the establishment I am absorbing "
        f"ever comes back to me, and it comes back only if the division is genuinely profitable.",
        bg=ALERT, rule=RUST))
    el.append(card(
        f"<b>And the column to watch is the last one.</b> Everything I earn <b>falls as a share "
        f"of your revenue as the division grows</b>, from "
        f"{V.cfa_year(400*m,V.PRICE)/(400*m)*100:.0f} per cent at four hundred million to about "
        f"{V.cfa_year(2000*m,V.PRICE)/(2000*m)*100:.0f} per cent at two billion. That is the "
        f"right way round, and the opposite of what a flat percentage of revenue would have "
        f"done.", bg=CREAM))
    tbl(el, [
        [f"{V.REV_RATE*100:.1f}% of collected net revenue",
         "Gated on both benchmark revenue and EBITDA, as you asked. Accepted",
         "<b>Quarterly, trued up annually</b>"],
        [f"{V.EBITDA_RATE*100:.0f}% of EBITDA",
         f"Payable only once EBITDA is at or above the Board-approved budget. Your structure and "
         f"your hurdle, rate raised from {V.HER_EBITDA_RATE:.0%}",
         "Annually, as you asked"],
    ], ["Component", "The measure", "When it is paid"], [124, FULLW - 234, 110])
    el.append(card(
        "<b>On timing, the profit share annually is right</b> and I am not arguing with it: you "
        "cannot know what EBITDA did against budget until the year closes. <b>The revenue fee "
        "annually is a different thing.</b> It is calculated on cash you have already banked, and "
        "waiting twelve months to be paid on money collected in month seven means I am financing "
        "your working capital for free while carrying two COOs and a back office. Quarterly in "
        "arrears, against the gate measured on a rolling basis and trued up at year end, gives "
        "you every protection the annual version gives you. If the annual gate is missed, the "
        "true-up claws it back.", bg=CREAM))

    el.append(Paragraph("What CFA runs, and what the company pays for", H))
    el.append(Paragraph(
        "CFA provides the function. The company bears the cost of doing it. Marketing and sales "
        "operations are run by CFA; the marketing and sales spend is yours.", P))
    tbl(el, [[n, a, b] for n, a, b in V.FUNCTION_VS_SPEND],
        ["", "CFA runs this", "The company pays for this"], [76, 170, FULLW - 246])
    el.append(card(
        "<b>Facilities and biomedical sit outside this fee, and that is deliberate rather than a "
        "refusal.</b> CFA does provide facilities management including biomedical engineering, "
        "and I would like to. It belongs on its own retainer because it is a different "
        "discipline with a different cost base and a different risk profile, and folding it into "
        "a management fee would hide what it costs from both of us. Appendix B sets out what "
        "it would cover and the three things we need to settle before it can be priced honestly.",
        bg=CREAM))

    el.append(Paragraph("Which posts sit where, since payables and receivables is a fair question", H))
    el.append(Paragraph(
        "Two tests settle almost all of this. <b>First, capability or volume.</b> A post whose "
        "number does not change as revenue grows is capability and it sits with me. A post you "
        "need more of at a billion than at four hundred million is volume, and I cannot absorb "
        "headcount that scales with your revenue inside a fixed fee without one of us being "
        "wrong about it later. <b>Second, does it have to be at a site to do the job.</b> If it "
        "does, it is the division's. Either way CFA specifies, recruits, trains and supervises "
        "the post, and the division's finance staff work to my controls and report into my "
        "finance function for standards. The unit lead layer is the reason two COOs can carry "
        "five businesses at all, and it is worth saying that rather than leaving you to wonder "
        "about the span of control.", P))
    tbl(el, [[n, w, d] for n, w, d in V.ROLE_TEST],
        ["The post", "Paid by", "Why"], [150, 44, FULLW - 194])
    el.append(card(
        "<b>So on your question directly: payables is mine, receivables is yours.</b> Accounts "
        "payable processes off site, centrally, and one officer can serve more than one client. "
        "Collections scale with the number of patients and the size of the programme book, they "
        "work accounts belonging to your clinics, and at volume you will need several. What you "
        "get from me on that side is the revenue cycle itself: the deposit and instalment rules, "
        "the chase discipline, the ageing report and a collections performance I am measured on "
        "whether or not I employ the people doing it.", bg=CREAM))

    el.append(Paragraph("What the structure looks like with CFA, and without", H))
    el.append(Paragraph(
        f"The front line is identical either way. Every clinician, nurse, therapist, technician "
        f"and receptionist across the five businesses is a Medbury employee in both "
        f"pictures, because they have to be. The difference is the management layer above them "
        f"and who carries it.", P))
    half = (FULLW - 10) / 2
    left = orgcol("WITH CFA", V.ORG_WITH, half)
    right = orgcol("WITHOUT CFA", V.ORG_WITHOUT, half)
    pair = Table([[left, right]], colWidths=[half, half], style=TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0), ("RIGHTPADDING", (0, 0), (0, 0), 5),
        ("LEFTPADDING", (1, 0), (1, 0), 5), ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    el.append(pair)
    el.append(Spacer(1, 5))
    tbl(el, [
        ["Management posts on your payroll", f"{V.MGMT_POSTS_WITH}",
         f"{V.MGMT_POSTS_WITHOUT}",
         "Desks, systems, leave cover, appraisals and the cost of a wrong hire come with each "
         "one of them"],
        ["Monthly cost of that layer to you", f"{V.PRICE/m:.2f}", f"{V.STANDALONE/m:.2f}",
         "And the right hand column is before anyone has negotiated a salary upward"],
        ["Front line posts", "Unchanged", "Unchanged", "Identical in both structures"],
        ["Who answers to your Board for the division", "Two COOs, and me behind them",
         "Two COOs, and whoever has capacity",
         "This is the part that does not show up in a headcount comparison"],
    ], ["What you carry", "With CFA", "Without", "Note"], [140, 54, 50, FULLW - 244],
        aligns=["r", "r", "l"])
    el.append(card(
        f"<b>Ten posts against nothing, for a layer that costs you {V.PRICE/m:.2f} instead of "
        f"{V.STANDALONE/m:.2f}.</b> That is the whole proposition and it is why the fee is not "
        f"really a fee. You are not buying management advice, you are declining to build a "
        f"management department. If the division ever grows to the point where you want that "
        f"department in house, the handover is a conversation and not a rescue, because "
        f"everything it runs on is already written down and already yours.", bg=PANEL))

    el.append(Paragraph("The setup tranches", H))
    el.append(Paragraph(
        f"The twenty five million has not moved and I am not asking it to. The shape has to. "
        f"Every workstream opens on day one across all five businesses, the team is deployed in full "
        f"from the first week, and additional people are brought on for this specifically. "
        f"{V.HER_TRANCHES[0]:.1f} does not stand that up.", P))
    tbl(el, [
        ["Your shape", "  /  ".join(f"{t:.1f}" for t in V.HER_TRANCHES), "25", ""],
        ["<b>Mine</b>", "  /  ".join(f"{t:.1f}" for t in V.CFA_TRANCHES), "<b>25</b>",
         "<b>Same four steps and the same total. Fifty per cent on mobilisation</b>"],
    ], ["Shape", "Tranches, NGN M", "Total", "Note"], [58, 140, 32, FULLW - 230], aligns=["l", "r", "l"],
        total_row=True)
    el.append(card(
        f"<b>Mobilisation is not a deposit.</b> It is the cost of starting: five businesses "
        f"standing up at once, every workstream open because the sequence does not allow them "
        f"to run in turn, and people who are paid from week one and cannot be paid out of a "
        f"milestone that has not happened yet. The other "
        f"{sum(V.CFA_TRANCHES[1:]):.1f} stays exactly where you put it, released against agreed "
        f"milestones, and I am happy for those milestones to be as hard as you like.", bg=PANEL))

    el.append(Paragraph("Lagos and Abuja", H))
    el.append(Paragraph(
        "Your note puts Lagos and Abuja inside the same five months and the same twenty five "
        "million. That works, and I am not asking for more. One exclusion only, and it is the "
        "same one that applies in Lagos.", P))
    tbl(el, [
        ["Inside the 25, both cities",
         "All of it. The operating system built once, meaning the rate card and the model under "
         "it, the protocol set, the platform configuration, the standard operating procedures, "
         "the procurement framework and the partner terms. And Abuja's own licensing, "
         "registrations, recruitment and commissioning when the site is ready. Abuja costs less "
         "to stand up than Lagos precisely because the first list is already written"],
        ["Not inside the 25",
         "Project management of the Abuja renovation, exactly as in Lagos. If your own "
         "contractors run that build there is nothing for me to charge and nothing here to "
         "discuss. If you would rather CFA managed it, it is quoted separately when you have a "
         "programme and a scope, and it sits outside this fee either way"],
    ], ["Scope", "What it means"], [92, FULLW - 92])

    el.append(Paragraph("Where that leaves us", H))
    tbl(el, [
        ["Setup", f"NGN 25M, unchanged, in tranches of "
         + " / ".join(f"{t:.1f}" for t in V.CFA_TRANCHES), "Moved"],
        ["Base", f"NGN {V.PRICE/m:.1f}M a month for two COOs and the full bench, fixed for "
         f"twelve months then reviewed against actual cost. The establishment costs NGN "
         f"{V.BASE_ASK/m:.2f}M, so CFA carries NGN {V.ABSORBED/m:.2f}M a month", "Moved"],
        ["Revenue fee", f"{V.REV_RATE*100:.1f}% of collected net revenue, gated as you specified, "
         "paid quarterly and trued up annually", "Timing only"],
        ["Profit share", f"{V.EBITDA_RATE*100:.0f}% of EBITDA, payable only in a year when "
         f"EBITDA is at or above the Board-approved budget. Paid annually. Your structure and "
         f"your hurdle, rate raised from {V.HER_EBITDA_RATE:.0%}", "Moved"],
        ["Facilities and<br/>biomedical", "Outside this fee. CFA would take it on a separate "
         "retainer, quoted apart for Lagos and Abuja once the estate question is settled. "
         "Appendix B", "For discussion"],
    ], ["Item", "Where it lands", "Status"], [70, FULLW - 150, 80])
    el.append(Spacer(1, 2))
    el.append(card(
        "<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; +234 913 813 8553 "
        "&nbsp; / &nbsp; hello@consultforafrica.com", bg=NAVY, fg=white, rule=GOLD))

    el.append(Spacer(1, 8))
    el.append(Paragraph("APPENDIX A: HOW THE BENCH CHARGE IS BUILT", TITLE))
    el.append(Paragraph("The working behind the 2.40, so it can be checked rather than taken on trust.", SUB))
    el.append(Paragraph(
        f"Each function is provided by a named post on CFA's payroll. You are charged for the "
        f"share of that post the division actually consumes, not for the post. That is the "
        f"whole mechanic of a shared bench and it is why the number is small.", P))
    tbl(el, [[f, po, f"{c:.2f}", f"{ch/c*V.WORKING_DAYS:.1f}", f"{ch/c*100:.0f}%", f"{ch:.2f}"]
             for f, po, c, ch in V.BENCH_SCHEDULE] +
            [["<b>Total</b>", "", f"<b>{V.BENCH_STANDALONE:.2f}</b>",
              f"<b>{V.BENCH_DAYS:.1f}</b>", "", f"<b>{V.BENCH_CHARGED:.2f}</b>"]],
        ["Function", "The post providing it", "Loaded cost of the post",
         "Days a month to you", "Share", "Charged"],
        [88, 146, 54, 46, 34, FULLW - 368],
        aligns=["l", "r", "r", "r", "r"], total_row=True)
    el.append(Paragraph("The employer contributions inside the loaded salary", H))
    el.append(Paragraph(
        f"Two salaries at your cap of {V.COO_CAP:.2f} are {V.COO_GROSS/m:.2f} a month gross. "
        f"The loaded figure of {V.COO_LOADED/m:.2f} is that plus the employer costs below. "
        f"NHF is not in this list because it is a deduction from the employee's basic rather "
        f"than a cost to the employer.", P))
    tbl(el, [[n, f"{r:.1%}", f"{V.COO_CAP*r:.3f}", f"{V.COO_GROSS/m*r:.3f}", d]
             for n, r, d in V.EMPLOYER_COSTS] +
            [["<b>Total</b>", f"<b>{V.LOADING_PCT:.1%}</b>",
              f"<b>{V.COO_CAP*V.LOADING_PCT:.3f}</b>",
              f"<b>{V.COO_GROSS/m*V.LOADING_PCT:.2f}</b>", ""]],
        ["Employer cost", "Rate", "Per COO", "Both", "Basis"],
        [104, 38, 40, 36, FULLW - 218], aligns=["r", "r", "r", "l"], total_row=True)
    el.append(Spacer(1, 4))

    el.append(card(
        f"<b>That is {V.BENCH_DAYS:.0f} days a month of specialist time, about "
        f"{V.BENCH_FTE:.1f} full time equivalents, for {V.BENCH_CHARGED:.2f} a month.</b> The "
        f"same people employed directly would cost {V.BENCH_STANDALONE:.2f} a month plus the "
        f"desks, and you would be carrying eight posts to get a fraction of each one's time. "
        f"The share is set at what the division consumes today. If it consumes materially more "
        f"as it grows, that is a conversation at the annual review and it is visible in this "
        f"schedule rather than hidden in a fee.", bg=PANEL))
    el.append(card(
        "<b>What this schedule is not.</b> It is not a promise that a named individual is "
        "dedicated to you, because a shared bench does not work that way and pretending "
        "otherwise would be dishonest. It is a commitment to the function, to the output and to "
        "the service levels behind it. If the output is not there, the schedule is the document "
        "we both look at.", bg=CREAM))

    el.append(PageBreak())
    el.append(Paragraph("APPENDIX B: FACILITIES MANAGEMENT AND BIOMEDICAL ENGINEERING", TITLE))
    el.append(Paragraph("A separate retainer. Declared here so it is not assumed either way.", SUB))
    el.append(Paragraph(
        "This is not part of the management fee and nothing above depends on it. I am setting it "
        "out because CFA provides the service, because a division this equipment-heavy will need "
        "it, and because the worst outcome is the one where it is neither priced nor owned and "
        "everyone discovers that on the morning a theatre list cannot start.", P))
    el.append(Paragraph("What the retainer would cover", H))
    tbl(el, [[n, d] for n, d in V.FM_SCOPE], ["The service", "What it means"], [150, FULLW - 150])
    el.append(Paragraph("Three things to settle before it can be priced", H))
    tbl(el, [[n, d] for n, d in V.FM_OPEN], ["Question", "Why it changes the answer"],
        [122, FULLW - 122])
    el.append(card(
        "<b>The question I would put back to you first.</b> Whether this is the whole of Lyfe "
        "Place or only the division's spaces is a Medbury decision rather than a CFA one, and it "
        "decides everything else. If it is the whole campus then the other tenants and the common "
        "plant are in scope and the conversation is with the landlord side of the group as much "
        "as with the division. If it is the division's spaces, it is a much smaller and faster "
        "thing to put in place, and it can start with the biomedical estate alone, which is the "
        "part where uptime turns directly into revenue.", bg=PANEL))
    el.append(Paragraph(
        "Either way it is quoted separately for Lagos and for Abuja, and neither quote is inside "
        "the 25 or inside the monthly base.", P))

    doc.build(el)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
