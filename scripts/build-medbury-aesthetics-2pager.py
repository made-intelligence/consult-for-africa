"""
Build the two page version of the Medbury Aesthetics setup mandate.

The six page mandate is the full argument. This is what Itunu reads first, and
possibly all she reads. It has to carry the whole case on its own: what is being
set up, what the work is, what it is worth, what it costs and why, and the three
decisions.

Reads its figures from the same constants as the long document so the two cannot
disagree. If the fee or the value changes there, it changes here.

CFA house style, navy and gold. NGN. No em dashes.

Run:
  python3 scripts/build-medbury-aesthetics-2pager.py
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
OUT = ROOT / "docs" / "medbury-aesthetics-2pager-cfa.pdf"

# Single source of truth: the long mandate's constants.
_spec = importlib.util.spec_from_file_location(
    "_mandate", Path(__file__).resolve().parent / "build-medbury-aesthetics-mandate.py")
_m = importlib.util.module_from_spec(_spec)
sys.modules["_mandate"] = _m
_spec.loader.exec_module(_m)

M = _m.M
FEE, CLIENT_OFFER, ABUJA_TOTAL = _m.FEE, _m.CLIENT_OFFER, _m.ABUJA_TOTAL
REGULATORY_ABSORBED = _m.REGULATORY_ABSORBED
DIVISION_REVENUE_Y2, MARGIN_GAIN = _m.DIVISION_REVENUE_Y2, _m.MARGIN_GAIN
MGMT_BASE_MONTH, MGMT_REV_RATE = _m.MGMT_BASE_MONTH, _m.MGMT_REV_RATE
MGMT_EBITDA_RATE, MGMT_AT_MODEL = _m.MGMT_EBITDA_RATE, _m.MGMT_AT_MODEL
PRESELL_TARGET, ABUJA_AVOIDED = _m.PRESELL_TARGET, _m.ABUJA_AVOIDED
TRANCHES = _m.TRANCHES
ENTITIES = _m.ENTITIES
PRICING_VALUE = DIVISION_REVENUE_Y2 * MARGIN_GAIN
TOTAL_VALUE = PRICING_VALUE + PRESELL_TARGET + ABUJA_AVOIDED

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
          spaceBefore=8, spaceAfter=3, keepWithNext=1)
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
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 18, "Setup mandate  /  summary")
    c.setFillColor(GOLD); c.rect(MARGIN, 24, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.8)
    c.drawString(MARGIN, 14, "Private and confidential  /  Dr Itunu Akinware, Group CEO  /  summary of the full setup mandate")
    c.drawRightString(PAGE_W - MARGIN, 14, "Page %d of 2  /  full mandate available" % doc.page)
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
                          topMargin=36, bottomMargin=28,
                          title="Medbury Aesthetics Lagos - setup mandate, summary",
                          author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 28, FULLW, PAGE_H - 36 - 28, id="f")], onPage=page_bg)])
    el = []

    # ---------------------------------------------------------------- page 1
    el.append(Paragraph("SETTING UP MEDBURY AESTHETICS", TITLE))
    el.append(Paragraph("Lagos first. Five businesses, one division. The case in two pages.", SUB))

    el.append(card(
        f"<b>The ask.</b> NGN {ngn(FEE)}M for a three month build and a two month handover across "
        f"five companies, in three payments: NGN {FEE*TRANCHES['mob']/M:.0f}M to start, NGN "
        f"{FEE*TRANCHES['m3']/M:.0f}M when the division is trading and NGN "
        f"{FEE*TRANCHES['m6']/M:.0f}M at the switch to management, the last two released only "
        f"against measured outcomes. Government and regulatory fees of about NGN "
        f"{REGULATORY_ABSORBED/M:.1f}M are absorbed inside that number, so what CFA earns is "
        f"under NGN {(FEE-REGULATORY_ABSORBED)/M:.0f}M.", bg=PANEL))

    el.append(Paragraph("What is being set up", H))
    el.append(Paragraph(
        "Five separate operating companies sharing one market, one supply chain and one patient. "
        "Four of the five are built from nothing. Only Medlyfe Regenerative and Longevity trades "
        "today and it is nascent, so it is the one warm list the division starts with. Lyfe "
        "Plastics and Dermatology is another of the five and already has its own memorandum and "
        "shareholders.", P))
    tbl(el, [[a, b] for a, b in ENTITIES], ["Entity", "What it is"], [104, FULLW - 104])

    el.append(Paragraph("Why it is a division and not five clinics", H))
    el.append(Paragraph(
        "One rate card stops five businesses pricing against each other in the same building. One "
        "clinical record means the woman who arrives for one of the five is known to the other "
        "four without being acquired a second time. One procurement framework buys devices once "
        "and routes the clinical supply to Medbury's own pharmacy and diagnostics. Set them up "
        "separately and you get five small clinics with five cost bases.", P))
    el.append(card(
        "<b>None of that is true on paper, so a platform is being built to make it true.</b> One "
        "clinical record across the five, room and diary scheduling so they share space without "
        "colliding, programme and course management so treatment can be sold and collected before "
        "it is delivered, deposits and instalments reconciled to the gateway, imaging and consent "
        "held against the record, batch and expiry on every injectable, the enquiry funnel, and a "
        "board dashboard produced by the system rather than by hand. It is configured, migrated, "
        "staffed and live before opening, and it transfers to Abuja already built.", bg=CREAM))

    el.append(Paragraph("What the work actually is", H))
    el.append(Paragraph(
        "Not registration. Company formation is a week of somebody's time. The work is the "
        "operating build: the pricing architecture, the clinical governance and protocol set, the "
        "technology platform, the service partners under signed service levels, the funnel, the "
        "front office and revenue cycle, and the governance rhythm the Board will read. Per "
        "entity, the scope and menu, the staffing model, the equipment specification, the clinical "
        "brief the space is built to, the launch sequence, and commissioning before the first real "
        "patient rather than after.", P))
    el.append(card(
        "<b>The pricing work is the largest single item and the one most often done badly.</b> "
        "Primary price research taken at the point of enquiry rather than off websites, "
        "willingness to pay tested with the actual segment, cost to serve built bottom up per "
        "procedure, then sensitivity tested against volume at sixty per cent of planned fill, a "
        "realistic naira band, mix, elasticity and ramp. A rate card without that model behind it "
        "is a hope, and it cannot be corrected later: you do not raise prices on a base you "
        "acquired at the wrong number.", bg=CREAM))

    el.append(Paragraph("Built once, used twice", H))
    el.append(Paragraph(
        "Almost none of this is a Lagos asset. The rate card, the procurement framework, the "
        "protocols, the configured platform, the partner terms and the standard operating "
        "procedures are written once and transfer to Abuja when it is ready. Only the facility, the team and "
        "the licences are local. Build it cheaply here and Abuja has to be built a second "
        "second time.", P))

    # ---------------------------------------------------------------- page 2
    el.append(Paragraph("What it is worth", H))
    tbl(el, [
        ["The pricing architecture", f"{ngn(PRICING_VALUE)}",
         f"{MARGIN_GAIN*100:.0f} points of margin on modelled division revenue of NGN "
         f"{ngn(DIVISION_REVENUE_Y2)}M. Set once, compounds every year"],
        ["Revenue before opening", f"{ngn(PRESELL_TARGET)}",
         "Regenerative, longevity and weight management sell as programmes, so they can be contracted "
         "and paid for before the doors open"],
        ["The Abuja build not repeated", f"{ngn(ABUJA_AVOIDED)}",
         "Abuja re-papers the operating system rather than rebuilding it"],
        ["Cross-sell between the five", "recurring",
         "A patient acquired once is reachable by four more businesses at no further acquisition "
         "cost, but only if the division is designed for it at the start"],
        ["<b>Against a fee of</b>", f"<b>{ngn(FEE)}</b>",
         "<b>The first three exceed it inside year one and two of them repeat</b>"],
    ], ["Where the value is", "NGN M", "How it arises"],
        [88, 42, FULLW - 130], aligns=["r", "l"], total_row=True)
    el.append(card(
        "<b>Supply, pharmacy and diagnostics are deliberately absent.</b> Medbury owns those "
        "businesses and any margin the division produces there belongs to the group. CFA will "
        "route the demand internally and write the service levels, but will not present internal "
        "capture as value it brokered.", bg=PANEL))

    el.append(Paragraph("How the fee is released", H))
    tbl(el, [
        ["On signing", f"{FEE*TRANCHES['mob']/M:.0f}", "Mobilisation. The team stands up and is "
         "paid from week one. The only payment not tied to an outcome"],
        ["1", "", "A rate card that survives its sensitivities, "
         "delivered with the research and the model behind it. Internal supply routed and "
         "specified"],
        ["2", "", f"NGN {ngn(PRESELL_TARGET)}M of programme revenue "
         f"contracted and collected before opening. Primary and named second source signed in "
         f"every critical category"],
        ["3", f"{FEE*TRANCHES['m3']/M:.0f}", "First entity lawfully trading and first revenue "
         "banked, every partner under a signed SLA with a numeric measure, cross-sell working. "
         "Released only if every measure above it has also been met"],
        ["6", f"{FEE*TRANCHES['m6']/M:.0f}", "At the switch to management. Handover complete, "
         "the division on the normal management rhythm, and the measures still holding"],
        ["<b>Total</b>", f"<b>{ngn(FEE)}</b>", ""],
    ], ["When", "NGN M", "What has to be true"], [48, 40, FULLW - 88],
        aligns=["r", "l"], total_row=True)
    el.append(card(
        f"<b>Three payments.</b> NGN {FEE*TRANCHES['mob']/M:.0f}M to start, because the team is "
        f"paid before any measure can be met. NGN {FEE*TRANCHES['m3']/M:.0f}M when the division "
        f"is trading and only if every measure has been met. NGN {FEE*TRANCHES['m6']/M:.0f}M at "
        f"the switch to management in month 6, and only if it is still trading to the same "
        f"measures once the sprint is over.", bg=ALERT, rule=RUST))

    el.append(Paragraph("Where the 25 comes from", H))
    tbl(el, [
        ["Abuja, as quoted", f"{ngn(ABUJA_TOTAL)}", "Included CFA project management on the facility build"],
        ["Less that project management fee", "(20)", "Your contractors manage the Lagos build"],
        ["<b>Comparable scope</b>", f"<b>{ngn(FEE)}</b>",
         "<b>The operating build, across five entities rather than one</b>"],
    ], ["", "NGN M", "Note"], [132, 38, FULLW - 170], aligns=["r", "l"], total_row=True)
    el.append(Paragraph(
        f"A day rate is the wrong test. What matters is that the identified value is NGN "
        f"{ngn(TOTAL_VALUE)}M against a fee of NGN {ngn(FEE)}M; that a rate card set five points "
        f"light costs NGN {ngn(PRICING_VALUE)}M a year and cannot be corrected; and that hiring a "
        f"division lead, a pricing analyst, a regulatory hand and a recruiter for five months "
        f"costs more than this before anyone has negotiated anything, leaves you carrying the "
        f"team afterwards, and leaves nothing written down to transfer to Abuja.", P))

    el.append(Paragraph("What Medbury provides, and what the fee excludes", H))
    tbl(el, [
        ["Medbury provides",
         "A single decision maker who can approve a rate card, a supplier and an SLA without a "
         "second meeting. The facility on a programme CFA can plan the launch against. Funding "
         "against the approved budget. Approval of the operating lead CFA recruits. Group access to "
         "referrals, laboratory, pharmacy and the relationships that open a partner theatre"],
        ["The fee excludes",
         "Project management of the facility build, which is why this is 25 and not 45, and which "
         "is quoted separately if Medbury would rather CFA managed it. Equipment and stock, which "
         "are capital. Salaries of the team recruited, who are the company's employees from day "
         "one. Hardware, connectivity and the payment gateway charges behind the platform, where "
         "the build, configuration, migration and training are in the fee but the terminals and "
         "the network are the company's. The shareholder negotiation for Lyfe Plastics and "
         "Dermatology, separately mandated. The management of the division from month 6, which "
         "is agreed and sits on its own contract rather than inside this fee"],
    ], ["", "Detail"], [88, FULLW - 88])

    el.append(Paragraph("Who owns what is built", H))
    el.append(Paragraph(
        "Everything produced under this mandate belongs to the company: the rate card and the "
        "model underneath it, the protocols, the standard operating procedures, the partner "
        "agreements, the platform configuration, the patient data and the integrations. CFA's own "
        "platforms are licensed to the division for the term at a rate agreed before we start, "
        "and if that licence ever ends the company keeps its data and configuration in a form it "
        "can carry elsewhere.", P))

    el.append(Paragraph("Setup and management are one arrangement", H))
    el.append(Paragraph(
        f"CFA manages Medbury Aesthetics from month 6, as agreed: two chief operating officers "
        f"employed by Medbury and seconded to CFA, a support fee of NGN 3.0m a month, and 3 "
        f"per cent of collected net revenue where the Board's goals are met. The handover months "
        f"are a "
        f"transition, not an exit, and it is why the build is priced where it is: I am building "
        f"something I then have to run.", P))

    el.append(Paragraph("The four decisions", H))
    bullets(el, [
        f"<b>The fee.</b> NGN {ngn(FEE)}M against the tranches above.",
        "<b>The start date.</b> Three months from mobilisation. A start in the next fortnight "
        "puts first revenue inside the year.",
        "<b>The management agreement.</b> Terms agreed and issued separately, with the KPI "
        "schedule and budget process drafted during the sprint.",
        "<b>The operating lead.</b> CFA recruits, the Group approves, in post by month 4.",
    ])
    el.append(Spacer(1, 1))
    el.append(card(
        "<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; +234 913 813 8553 "
        "&nbsp; / &nbsp; hello@consultforafrica.com", bg=NAVY, fg=white, rule=GOLD))
    doc.build(el)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
