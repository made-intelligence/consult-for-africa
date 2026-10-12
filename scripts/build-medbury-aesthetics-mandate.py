"""
Build the Medbury Aesthetics setup mandate, Lagos.

Written for Dr Itunu Akinware. She has offered NGN 15M for the setup, anchored
off the Abuja document where NGN 45M INCLUDED CFA's project management fee on
the facility build. Strip that fee out, because her own contractors may manage
the Lagos build, and what remains is the
operating build across FIVE entities rather than one, which is the harder half.
CFA has countered at NGN 25M and she is considering it.

The argument this document has to win is not that setup is expensive. It is that
what is being bought is not registration and paperwork, which is what "setup"
sounds like. It is a division: one rate card, one procurement framework, one protocol
set and one patient record across five businesses, with the service partners
found, negotiated and put under SLA before anybody opens a door.

Priced as a three month sprint plus two months of handover, with the fee tied to
KPIs so the client can see what it is buying and withhold if it is not delivered.

Deliberately NO day-rate defence. A day rate anchors the conversation on CFA's
input cost, invites a negotiation on the rate, and makes the team sound barely
present when the days are divided across five businesses. The fee is tested three
ways instead: what it produces, what it prevents, and what building the same
capability in house would cost.

CFA house style, navy and gold. NGN. No em dashes.

Run:
  python3 scripts/build-medbury-aesthetics-mandate.py
"""

from __future__ import annotations

import sys

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Frame, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "medbury-aesthetics-mandate-cfa.pdf"

M = 1_000_000

# ---------------------------------------------------------------- commercials
FEE = 25 * M
SPRINT_MONTHS = 3
HANDOVER_MONTHS = 2
CLIENT_OFFER = 15 * M               # her opening offer. Settled at 25 on 2026-09-18, so this
                                    # is kept for the record and no longer appears in the copy.
REGULATORY_ABSORBED = 3.1 * M
# Front loaded: mobilisation on signature, then against measures, then a holdback.
TRANCHES = {"mob": 0.60, "m3": 0.20, "m6": 0.20}
assert abs(sum(TRANCHES.values()) - 1) < 1e-9       # government and regulatory fees across five entities,
                                    # absorbed by CFA rather than excluded

# The value proposition, in naira, and the basis of the KPI targets below.
# Illustrative and to be tuned, but each is a number the Board can verify later.
DIVISION_REVENUE_Y2 = 400 * M       # division-wide, at modelled volumes
MARGIN_GAIN = 0.05                  # a rate card built properly against one built badly
PRESELL_TARGET = 25 * M             # programme revenue contracted before opening
ABUJA_AVOIDED = 18 * M              # the setup Abuja does not repeat
ABUJA_TOTAL = 45 * M
# The management agreement, from scripts/lib_medbury_mgmt_fee.py so the mandate and the
# terms sheet cannot disagree. Base plus a fee on collections plus a share of profit.
sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib_medbury_mgmt_fee as MF

MGMT_BASE_MONTH = MF.CFA_BASE_MONTH
MGMT_REV_RATE = MF.CFA_REV_RATE
MGMT_EBITDA_RATE = MF.CFA_EBITDA_RATE
MGMT_AT_MODEL = MF.counter(DIVISION_REVENUE_Y2)   # what it pays at the modelled revenue

# ---------------------------------------------------------------- the capital
# Equipment, pre-opening and working capital. EXCLUDES fit-out, which Medbury's own
# contractors price. "worked" means the number comes from a model already built;
# "indicative" means an order of magnitude to be firmed in tranche one of the sprint.
CAPITAL = [
    ("Lyfe Plastics and Dermatology", 126, 126, "worked",
     "Modelled in the memorandum already: consulting and minor procedure rooms, surgical "
     "kit, stage one costs and working capital through the ramp"),
    ("Aesthetic devices, first tranche", 105, 105, "worked",
     "Three devices specified against Fitzpatrick IV to VI skin rather than a vendor's "
     "catalogue. Shared across dermatology and the aesthetic menu"),
    ("Cosmetic Dentistry", 95, 145, "indicative",
     "The most capital intensive of the five. Chairs, imaging, intraoral scanning, milling "
     "and the compressed air and suction behind them"),
    ("Medlyfe Regenerative and Longevity", 55, 75, "indicative",
     "Infusion bays, cold chain, compounding, and an opening stock of injectables. Trading "
     "already but nascent, so part of this is a step up rather than a standing start"),
    ("Bariatric and Metabolic", 55, 85, "indicative",
     "Light on equipment. The opening drug stock is the largest single item and it is "
     "cold chain"),
    ("Hair Restoration", 18, 28, "indicative",
     "The lightest of the five, because the operating partner brings the instruments"),
    ("Division shared: front of house, plant, platform hardware", 25, 40, "indicative",
     "Reception, records, waiting, power backup and the terminals the platform runs on"),
]
CAP_LO = sum(lo for _, lo, _hi, _s, _n in CAPITAL)
CAP_HI = sum(hi for _n1, _lo, hi, _s, _n in CAPITAL)

ENTITIES = [
    ("Medlyfe Regenerative and Longevity", "Regenerative medicine, longevity programmes and "
     "infusion. Already trading but nascent, and the only one of the five with patients today. "
     "Programme based and pre-sellable, so revenue can be taken before the doors open. Highest "
     "revenue per square metre on the campus"),
    ("Bariatric and Metabolic", "Medical weight management. Long programmes, high retention, "
     "feeds pharmacy and laboratory directly"),
    ("Cosmetic Dentistry", "Veneers, whitening, alignment and implants. High ticket, cash paying, "
     "and the most natural cross-sell in the division: the patient having her face treated wants "
     "her smile to match"),
    ("Hair Restoration", "Single patient days, instruments brought by the operating partner, "
     "very little fixed cost"),
    ("Lyfe Plastics and Dermatology", "The surgical end, with medical and surgical dermatology "
     "alongside it. Its own tri-party shareholding, its own clinical director, its own "
     "memorandum, already drafted"),
]

PAGE_W, PAGE_H = A4
MARGIN = 46
FULLW = PAGE_W - 2 * MARGIN

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


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=8.8, leading=11.8, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=5)
    base.update(kw)
    return ParagraphStyle(name, **base)


EYEBROW = style("eyebrow", fontName="Helvetica-Bold", fontSize=8.0, leading=10.5,
                textColor=GOLD, spaceBefore=11, spaceAfter=2, keepWithNext=1)
H1 = style("h1", fontName="Helvetica-Bold", fontSize=13, leading=16.5, textColor=NAVY,
           spaceAfter=6, keepWithNext=1)
H2 = style("h2", fontName="Helvetica-Bold", fontSize=9.6, leading=12.5, textColor=TEAL,
           spaceBefore=7, spaceAfter=3, keepWithNext=1)
P = style("p")
LEDE = style("lede", fontSize=9.6, leading=13.4, textColor=HexColor("#2C3A34"))
SMALL = style("small", fontSize=7.6, leading=10.2, textColor=MUTED)
BUL = style("bul", leftIndent=11, bulletIndent=2, spaceAfter=2.6)
CELL = style("cell", fontSize=8.0, leading=10.6)
CELL_R = style("cellr", fontSize=8.0, leading=10.6, alignment=2)
CELL_B = style("cellb", fontSize=8.0, leading=10.6, fontName="Helvetica-Bold", textColor=NAVY)
CELL_BR = style("cellbr", fontSize=8.0, leading=10.6, fontName="Helvetica-Bold",
                textColor=NAVY, alignment=2)
CELL_W = style("cellw", fontSize=8.0, leading=10.6, fontName="Helvetica-Bold", textColor=white)
CELL_WR = style("cellwr", fontSize=8.0, leading=10.6, fontName="Helvetica-Bold",
                textColor=white, alignment=2)
SIG = style("sig", fontSize=8.8, leading=12.4)


def ngn(x):
    return f"{x/M:,.0f}"


def page_bg(c, doc):
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, PAGE_H - 30, PAGE_W, 30, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PAGE_H - 33, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 8)
    c.drawString(MARGIN, PAGE_H - 20, "MEDBURY AESTHETICS, LAGOS")
    c.setFillColor(LIGHT); c.setFont("Helvetica", 8)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 20, "Setup mandate")
    c.setFillColor(GOLD); c.rect(MARGIN, 26, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7.3)
    c.drawString(MARGIN, 15, "Private and confidential  /  Prepared for Dr Itunu Akinware, Group CEO")
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


def tbl(el, rows, labels, widths, total_row=False, aligns=None, hi=None):
    ncols = len(labels)
    if aligns is None:
        aligns = ["l"] * (ncols - 1)
    hi = hi or set()
    data = [[Paragraph(labels[0], CELL_W)] +
            [Paragraph(t, CELL_WR if aligns[j] == "r" else CELL_W) for j, t in enumerate(labels[1:])]]
    for i, r in enumerate(rows):
        emph = (total_row and i == len(rows) - 1) or i in hi
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
        ("TOPPADDING", (0, 0), (-1, -1), 2.9), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.9),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2 if total_row else -1), [white, SURFACE]),
    ]
    if total_row:
        st += [("BACKGROUND", (0, -1), (-1, -1), CREAM), ("LINEABOVE", (0, -1), (-1, -1), 1, GOLD)]
    for i in hi:
        st.append(("BACKGROUND", (0, i + 1), (-1, i + 1), PANEL))
    t.setStyle(TableStyle(st))
    el.append(t)
    el.append(Spacer(1, 5))


def sec(el, num, eyebrow, title):
    el.append(CondPageBreak(84))
    el.append(Paragraph(num + "  /  " + eyebrow, EYEBROW))
    el.append(Paragraph(title, H1))


def bullets(el, items):
    for i in items:
        el.append(Paragraph(i, BUL, bulletText="•"))


def build():
    doc = BaseDocTemplate(
        str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=42, bottomMargin=30,
        title="Medbury Aesthetics Lagos - setup mandate", author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 30, FULLW, PAGE_H - 42 - 30, id="f")], onPage=page_bg)])
    el = []

    # ------------------------------------------------------------------ letter
    el.append(Spacer(1, 4))
    el.append(Paragraph("SETTING UP MEDBURY AESTHETICS", H1))
    el.append(Paragraph("Lagos first. Five businesses, one division. What the work is, how it is "
                        "measured, and what it costs.", LEDE))
    el.append(Spacer(1, 6))
    el.append(card(
        "Itunu,<br/><br/>"
        "You have offered NGN 15M and I came back at 25. Rather than split it, let me show you "
        "what is actually in the work, because I do not think the word setup is helping either "
        "of us. It sounds like registration and paperwork. It is not.<br/><br/>"
        "The number you were working from was the Abuja document, where NGN 45M covered the "
        "project management fee on the facility build as well. In Lagos your own contractors may "
        "well manage that build, and if they do I should not be charging you to manage it. "
        "Strip that fee out and what is left is the harder half: the "
        "operating build. One rate card, one procurement framework, one protocol set and one patient "
        "record across five businesses, with every service partner found, negotiated and under a "
        "signed service level agreement before a single door opens.<br/><br/>"
        "That is five businesses, not one. And almost none of it is a Lagos asset: the rate "
        "card, the protocols, the record, the partner terms and the procedures are written once "
        "and transferred to Abuja when it is ready. Build it cheaply here and Abuja has to be "
        "build the same thing a second time.<br/><br/>"
        "I have also put the government and regulatory fees inside the number rather than on "
        "top of it. Across five entities they are about NGN 3M, so what CFA actually earns is "
        "under 22. You should not be receiving invoices for filing fees from me.<br/><br/>"
        "So I have written the scope out, tied the fee to key performance indicators you can "
        "hold me to, and set it out as one arrangement rather than two: three months to build, "
        "two months to move it onto the management rhythm, and then CFA runs the division from "
        "month 6 on the management terms we have now agreed. If I miss the measures, you do not "
        "pay the tranche. That is the part I would hold me to if I were you.<br/><br/>"
        "<b>Debo Odulana</b><br/>Founding Partner, Consult for Africa",
        bg=PANEL))

    # ============================================================== 01
    sec(el, "01", "WHAT IS BEING SET UP", "Five businesses, deliberately run as one division.")
    el.append(Paragraph(
        "Medbury Aesthetics is not a clinic. It is five separate operating companies that share a "
        "market, a supplier base and a patient. Lyfe Plastics and Dermatology is one of the five "
        "and already has its own memorandum and its own shareholders. The other four are yours.", P))
    el.append(Paragraph(
        "Four of the five are built from nothing. Only Medlyfe Regenerative and Longevity is "
        "trading today and it is nascent, so there is very little book to inherit and almost no "
        "patients to start from. That is exactly why the cross-sell between them has to be "
        "designed in from the first day rather than hoped for later. A patient acquired once "
        "should be reachable by four more businesses without being acquired again, and that only "
        "happens if the record, the rate card and the referral path were built to allow it. The "
        "regenerative book, small as it is, is the one warm list the division starts with and it "
        "should be the first thing the cross-sell is pointed at.", P))
    tbl(el, [[a, b] for a, b in ENTITIES], ["Entity", "What it is and why it is in the division"],
        [128, FULLW - 128])
    el.append(card(
        "<b>The whole commercial argument for the division is that these five share.</b> One "
        "procurement framework buys devices and non-clinical supply once, not five times, and "
        "routes the clinical supply to the group's own companies. One rate card "
        "stops five businesses pricing against each other in the same building. One patient "
        "record means the woman who arrives for one of the five is known to the other four, "
        "without being acquired a second time. Set them up separately and you get five small clinics with five cost "
        "bases. Set them up as a division and the second, third and fourth cost almost nothing "
        "to add.", bg=CREAM))

    # ============================================================== 02
    sec(el, "02", "WHAT THE WORK ACTUALLY IS", "Not registration. The operating build.")
    el.append(Paragraph(
        "Company formation is a week of somebody's time and a few hundred thousand naira of "
        "government fees. It is not what you are buying and I would not charge for it as though "
        "it were. This is the work.", P))

    el.append(Paragraph("Built once, and every entity inherits it", H2))
    tbl(el, [
        ["The operating model", "How five businesses share one reception, one record, one "
         "booking spine and one back office without stepping on each other. Who owns which "
         "patient, how a referral moves between them, how the revenue is attributed"],
        ["The rate card", "One pricing architecture across all five, researched and sensitivity "
         "tested rather than copied. Set out in full at section 04 because it is the largest "
         "single item of value in this mandate"],
        ["Supply and demand routing", "The division's consumables, dispensing and laboratory "
         "demand specified once and routed to Medbury's own pharmacy and diagnostics businesses, "
         "with service levels between group companies. Any margin there stays in the group, which "
         "is why it is not claimed as value at section 07"],
        ["Clinical governance", "Protocol set per entity, credentialing standard, complications "
         "and escalation, incident reporting, consent architecture. Written so a regulator, an "
         "insurer and a plaintiff's lawyer all find the same answer"],
        ["The technology platform", "One record, one diary, one till and one dashboard across "
         "five companies, configured and live before opening. Set out at section 03 because it "
         "is what makes the division a division rather than five clinics at one address"],
        ["The funnel", "Channels, enquiry handling, conversion, and the content engine. Built "
         "once and pointed at five menus"],
        ["Front office and revenue cycle", "The path from enquiry to booking to deposit to "
         "collection, written down and enforced. Deposit rules, the no-show and cancellation "
         "policy, instalment and refund terms, and who chases what. In a cash paying premium "
         "business this is the difference between revenue and a receivables ledger"],
        ["The governance rhythm", "The board pack, the management dashboard and the operating "
         "cadence. What the Board sees each month, what the division reviews each week, and "
         "which numbers trigger a decision rather than a discussion"],
    ], ["Workstream", "What is delivered"], [104, FULLW - 104])

    el.append(Paragraph("Built per entity", H2))
    tbl(el, [
        ["Scope and menu", "What each entity sells and, as importantly, what it does not"],
        ["Staffing model", "Establishment, grade mix, rota, and what each role costs fully loaded"],
        ["Equipment specification", "Specified against this patient population rather than a "
         "vendor's catalogue. Several of the best known devices are the wrong instruments for "
         "the skin this division will treat, and buying by brand recognition is the most "
         "expensive mistake available here"],
        ["The clinical brief to the build", "What the space has to do before anyone draws it. "
         "Room adjacencies, the patient path and where it must not cross a staff or soiled path, "
         "privacy and discretion for a clientele that expects it, recovery, and the power, water "
         "and gas the clinical rooms depend on. Your contractors build it. This is what they "
         "build to, and it is cheaper to say now than to move a wall later"],
        ["Launch sequence", "The order the five open in, so that the earliest cash funds the "
         "later builds"],
        ["Commissioning and opening readiness", "Before the first real patient: equipment "
         "accepted and calibrated, the platform run end to end on mock bookings, dry runs with "
         "the actual staff through the actual rooms, snagging closed, and a signed go-live "
         "checklist per entity. An opening date is not a readiness test"],
    ], ["Per entity", "What is delivered"], [104, FULLW - 104])

    # ============================================================== 02C
    sec(el, "03", "THE TECHNOLOGY PLATFORM", "Five businesses cannot run as one division on paper.")
    el.append(Paragraph(
        "Everything claimed for the division in section 01 depends on software that most clinics "
        "of this size do not have. One rate card is a document until something enforces it at the "
        "point of booking. One patient across five businesses is an aspiration until one record "
        "holds her. Programme revenue cannot be taken before opening unless something can sell a "
        "course of treatment, collect for it and track what has been delivered against it. This "
        "is a platform "
        "build, not a software purchase, and it is configured and implemented as part of the "
        "mandate rather than bought in afterwards.", P))
    tbl(el, [
        ["One clinical record across five companies",
         "Shared demographics and history, entity-level clinical notes, so a patient treated by "
         "one is known to the other four without her file being duplicated or her consent assumed"],
        ["Scheduling across shared rooms and diaries",
         "Five businesses competing for the same rooms, chairs and clinicians. Room and resource "
         "booking, not just appointment slots, or the division loses its capacity advantage on "
         "day one"],
        ["Programme and course management",
         "Sell a course of treatment, collect for it in full or by instalment, and track "
         "sessions delivered "
         "against sessions paid. This is the machinery behind the pre-opening revenue at section "
         "07, and without it that revenue cannot be recognised or refunded safely"],
        ["Billing, deposits and collections",
         "Deposits at booking, instalments, refunds and credit notes, reconciled to the payment "
         "gateway. Cash paying and premium means collection discipline is the difference between "
         "revenue and receivables"],
        ["Clinical imaging and consent capture",
         "Standardised before and after photography held against the record, with the consent to "
         "treat and the separate consent to publish captured, versioned and revocable. In "
         "aesthetics this is both the marketing asset and the legal exposure"],
        ["Inventory, cold chain and expiry",
         "Batch and expiry tracking for injectables and consumables, cold chain exceptions "
         "logged, and usage tied to the procedure so cost of care is real rather than estimated"],
        ["The enquiry funnel and customer relationship",
         "Every enquiry captured, sourced, followed up and converted, so cost per booked patient "
         "is measurable rather than assumed. The cross-sell between the five is executed here"],
        ["Reporting and the board pack",
         "Management accounts, clinical quality and complications, utilisation, conversion and "
         "pipeline, produced from the system rather than assembled by hand each month"],
    ], ["What it has to do", "Why the division depends on it"], [124, FULLW - 124])
    el.append(card(
        "<b>This is where the division is won or lost.</b> Five clinics each with its own diary, "
        "its own spreadsheet and its own cash box is what Medbury would get by default, and it "
        "makes every claim in section 01 untrue. The platform is what turns five companies into "
        "one operating business, and it transfers to Abuja already configured.", bg=CREAM))
    el.append(Paragraph(
        "CFA's own platforms are licensed to the division for the term and the configuration, the "
        "data and the integrations belong to the company. What is built here is not a demo. It is "
        "the system the five businesses run on from the first patient, and the staff are trained "
        "on it before opening rather than during.", P))

    # ============================================================== 02B
    sec(el, "04", "THE PRICING WORK", "Researched, costed and sensitivity tested. Not copied.")
    el.append(Paragraph(
        "This is the largest single item of value in the mandate and the one most often done "
        "badly, because a rate card looks like something you can assemble in an afternoon from a "
        "competitor's website. Done properly it is six weeks of work and it sets the margin of "
        "five businesses for years. Done badly it is unrecoverable: you cannot raise prices on a "
        "patient base you acquired at the wrong number.", P))

    el.append(Paragraph("What is actually done", H2))
    tbl(el, [
        ["Primary price research", "Every comparable provider in Lagos priced at the point of "
         "enquiry rather than from a website, because published prices and quoted prices are not "
         "the same thing. Covering the premium clinics, the mid market and the diaspora "
         "alternative, which for several of these lines is a flight"],
        ["Willingness to pay", "Structured testing with the segment this division is actually "
         "for, on price points and on what moves a patient from enquiry to booking. Programme "
         "pricing tested separately from single treatment pricing, because they behave differently"],
        ["Cost to serve, bottom up", "Every procedure costed from its own consumables, clinician "
         "time, room time and share of fixed cost. Not a percentage applied across a menu. This "
         "is what tells you which treatments are worth having on the list at all"],
        ["Margin architecture", "Target gross margin set per entity and per line, with the "
         "loss leaders identified deliberately rather than discovered later. Some treatments "
         "exist to fill a diary and some exist to pay for it, and the two should not be confused"],
        ["Programme and bundle design", "The programme structures that let regenerative, longevity and "
         "weight management be sold and paid for before delivery. This is what creates the "
         "pre-opening revenue at section 07, so it is priced with the cash profile in mind and "
         "not only the margin"],
        ["The published card", "The final rate card, the internal margin model behind it, the "
         "discount authority matrix, and the review cadence that keeps it current"],
    ], ["Step", "What it involves"], [104, FULLW - 104])

    el.append(Paragraph("The sensitivity testing, which is the part that is usually skipped", H2))
    el.append(Paragraph(
        "A rate card that only works at the planned volume, the planned mix and today's exchange "
        "rate is not a rate card, it is a hope. Each of these is modelled and the card is set so "
        "it survives them.", P))
    tbl(el, [
        ["Volume", "At sixty, eighty and one hundred per cent of planned fill. The card has to "
         "clear contribution at the low case, because the low case is what year one looks like"],
        ["Exchange rate", "Consumables and devices are imported and priced in dollars. Modelled "
         "across a realistic naira band, with the trigger points identified at which a price has "
         "to move rather than a margin quietly disappear"],
        ["Mix", "If the high margin lines underperform and the volume lines carry the division, "
         "does it still work. This is the most common way an aesthetics plan fails"],
        ["Price elasticity", "What a ten per cent move in either direction does to volume and to "
         "contribution, so the discount authority given to the front desk is bounded by evidence"],
        ["Ramp", "Break-even by entity and by month, so it is known before opening which of the "
         "five carries the division early and which take longer to stand up"],
    ], ["Tested against", "What is modelled"], [82, FULLW - 82])
    el.append(card(
        "<b>What you get at the end of it.</b> A rate card, the model underneath it that shows "
        "how every number was reached, and the break-even position of each of the five entities. "
        "All three are yours, they transfer to Abuja, and they are the reason the pricing line at "
        "section 07 is worth more than the fee on its own.", bg=CREAM))

    # ============================================================== 03
    sec(el, "05", "THE SERVICE PARTNERS", "Found, negotiated, and under a signed SLA.")
    el.append(Paragraph(
        "A division like this does not own everything it needs. Each of these is a search, a "
        "negotiation and a contract, and each carries a service level agreement with a measure "
        "in it, because a partner without a measure is a promise.", P))
    el.append(Paragraph(
        "Laboratory, pharmacy and imaging are not on this list. Medbury owns those businesses and "
        "the division should be their customer, not the market's. The work there is different and "
        "it is still work: specifying what the division needs, routing its demand internally, and "
        "writing service levels between group companies so that the newest and smallest customer "
        "is not the one served last. That is an internal negotiation rather than an external one, "
        "and the margin stays in the group.", P))
    tbl(el, [
        ["Partner theatre and anaesthesia", "Theatre access and scheduling, anaesthesia, "
         "recovery, escalation and admission, per-case fees and the flow of funds",
         "Case slots available within X days; escalation answered in minutes not hours"],
        ["Specialist operating partners", "The hair restoration and dental operating partners, "
         "without whom two of the five entities do not exist. Sourced, credentialed and "
         "contracted",
         "Named, credentialed and contracted before that entity is committed to"],
        ["Equipment service and maintenance", "Devices, autoclave, power",
         "Response and restore times, planned maintenance calendar"],
        ["Medical indemnity and insurance", "Cover for the division, each entity and each "
         "clinician, plus the premises",
         "Cover in force before any patient is seen, evidenced annually"],
        ["Clinical waste", "Collection, documentation, compliance", "Collection frequency and "
         "consignment notes"],
        ["Marketing and content", "Production, media buying, the enquiry desk",
         "Cost per qualified enquiry and conversion to booked"],
    ], ["Partner", "What is contracted", "The measure in the SLA"], [96, 168, FULLW - 264])
    el.append(card(
        "Identifying a partner is the easy part. The value is in what the agreement says when "
        "the partner underperforms, and in having a named second source for anything that can "
        "stop a list. Every one of these arrangements is contracted by the company rather than "
        "by any individual, so the relationship belongs to the business and not to a person.",
        bg=SURFACE))

    # ============================================================== 03B
    sec(el, "06", "BUILT ONCE, USED TWICE", "Lagos builds the operating system Abuja inherits.")
    el.append(Paragraph(
        "This is the part of the price that is easiest to miss, and it is the reason I would "
        "rather you paid properly for it now than cheaply twice. Almost everything in sections "
        "02 to 04 is not a Lagos asset. It is a division asset. It is written once, and when "
        "Abuja is ready it is transferred rather than rebuilt.", P))
    tbl(el, [
        ["The rate card and pricing architecture", "Transfers whole", "Abuja adjusts for local "
         "willingness to pay. The architecture, the programme logic and the pre-sell model do not "
         "change"],
        ["The procurement framework", "Transfers whole", "Device and equipment terms negotiated "
         "on two-campus volume, and the internal routing to the group's pharmacy and diagnostics "
         "already specified. Abuja inherits both"],
        ["Clinical protocols and governance", "Transfers whole", "Same protocols, same "
         "credentialing standard, same complications and escalation framework. A clinician "
         "trained in one is competent in the other"],
        ["The patient record and its configuration", "Transfers whole", "One record across two "
         "campuses, so a patient known in Lagos is known in Abuja"],
        ["SLA templates and partner terms", "Transfers as templates", "The agreements are "
         "re-papered with Abuja partners, but the terms, the measures and the negotiating "
         "position are already won"],
        ["Standard operating procedures", "Transfers whole", "Reception, booking, consent, "
         "stock, cold chain, incident reporting, month end"],
        ["The funnel and content engine", "Transfers with local media", "Channels, enquiry "
         "handling and conversion are the same machine pointed at a different city"],
        ["Facility, team and licences", "Does not transfer", "Local to each campus, and correctly "
         "excluded from this fee"],
    ], ["What is built in Lagos", "To Abuja", "Why"], [124, 62, FULLW - 186])
    el.append(card(
        "<b>So the fee is not really a Lagos fee.</b> It buys the operating system for the "
        "division, and Abuja inherits it for the cost of re-papering, which is why Abuja sits "
        "inside this fee rather than behind a second one. Set it up cheaply here and there is "
        "nothing to transfer, so Abuja has to be built a second time. "
        "Judged across both campuses this is the least expensive way to arrive at two.",
        bg=CREAM))

    # ============================================================== 04B
    sec(el, "07", "WHAT THIS IS WORTH", "Four numbers, each of which outlives the fee.")
    el.append(Paragraph(
        "A setup fee is only defensible if it returns more than it costs, and in a way the Board "
        "can check afterwards. These are the four places the money comes back. They are also the "
        "targets the fee is measured against at section 08, so this is not a brochure claim: it "
        "is what I am asking to be held to.", P))
    tbl(el, [
        ["The pricing architecture",
         f"{ngn(DIVISION_REVENUE_Y2*MARGIN_GAIN)}",
         f"A rate card built on what this market pays, with the programme and bundle logic "
         f"designed in, against one built by copying a list. {MARGIN_GAIN*100:.0f} points of "
         f"margin on modelled division revenue of NGN {ngn(DIVISION_REVENUE_Y2)}M. It is set "
         f"once and it compounds every year afterwards"],
        ["Revenue before opening",
         f"{ngn(PRESELL_TARGET)}",
         "Regenerative, longevity and weight management are sold as programmes, so they can be "
         "contracted and paid for before the doors open. No other clinical model in the group "
         "lets you bank revenue ahead of trading"],
        ["The Abuja build not repeated",
         f"{ngn(ABUJA_AVOIDED)}",
         "The rate card, the procurement framework, the protocols, the record and the "
         "procedures transfer. Abuja is re-papered rather than rebuilt, which is what lets it "
         "sit inside this fee. Section 06"],
        ["Cross-sell between the five",
         "recurring",
         "A patient acquired once is reachable by four more businesses at no further acquisition "
         "cost. Over time the cheapest revenue in the plan, and it only exists if the division is "
         "designed for it at the start"],
        [f"<b>Against a fee of</b>", f"<b>{ngn(FEE)}</b>",
         "<b>The first three alone exceed it inside year one, and two of them repeat</b>"],
    ], ["Where the value is", "NGN M", "How it arises"],
        [104, 40, FULLW - 144], aligns=["r", "l"], total_row=True)
    el.append(card(
        "<b>Supply, pharmacy and diagnostics are deliberately absent from this table.</b> "
        "Medbury already owns those businesses, and any saving or margin the division produces "
        "there belongs to the group rather than to me. I will put the division's consumables, "
        "dispensing and laboratory demand through your own companies and write the service levels "
        "that make them work, but I am not going to present internal capture as value I brokered. "
        "It is a real upside and it is entirely yours.", bg=PANEL))
    el.append(card(
        "<b>The honest version of this table.</b> Every figure in it is a target I am proposing, "
        "not a promise I have banked. That is precisely why they appear again in the next section "
        "as the measures that release the tranches. If the pricing work does not defend itself, the "
        "tranche does not get paid. I would rather be paid for what these produce than for the "
        "meetings that produced them.",
        bg=ALERT, rule=RUST))

    # ============================================================== 04
    sec(el, "08", "THE SPRINT", "Three months, with the measures that release the money.")
    el.append(Paragraph(
        "The old version of this page measured activity: suppliers approached, documents "
        "approved, models signed off. None of that is worth paying for. These measure outcomes, "
        "in naira or in dates, and each one is verifiable by someone who was not in the room.", P))
    tbl(el, [
        ["On signing", f"{FEE*TRANCHES['mob']/M:.0f}",
         "<b>Mobilisation.</b> The team stands up and is paid from the first week, the government "
         "and regulatory fees CFA absorbs start falling due, and every workstream opens at once "
         "because the sequence does not allow them to run one after another. This is the only "
         "tranche not tied to an outcome, and it is the cost of starting"],
        ["1", "",
         "<b>A rate card that survives its sensitivities.</b> Delivered with the primary price "
         "research behind it, the bottom-up cost to serve per procedure, and the model showing "
         "each entity still clears contribution at sixty per cent of planned fill and across a "
         "realistic naira band. A card without that model attached does not count as delivered"],
        ["1", "",
         "<b>Internal supply routed and specified.</b> The division's consumables, dispensing and "
         "laboratory demand specified and routed through Medbury's own pharmacy and diagnostics "
         "businesses, with service levels written so the division is not the customer they "
         "serve last"],
        ["2", "",
         f"<b>Cash before opening.</b> At least NGN {ngn(PRESELL_TARGET)}M of programme revenue "
         f"contracted and collected from regenerative, longevity and weight management before the "
         f"first door opens"],
        ["2", "",
         "<b>Supply that cannot stop a list.</b> Primary supplier and a named, quoted second "
         "source signed in every critical category, with lead times in the agreement"],
        ["3", f"{FEE*TRANCHES['m3']/M:.0f}",
         "<b>Trading.</b> First entity lawfully open and first revenue banked, with every service "
         "partner under a signed SLA carrying a numeric measure and a remedy. This tranche is "
         "released only if <i>every</i> measure above it has also been met, so one missed "
         "milestone holds the whole of it"],
        ["3", "",
         "<b>Cross-sell working.</b> An agreed proportion of patients treated by the first "
         "trading entity booked into a second within ninety days, measured from the record"],
        ["6", f"{FEE*TRANCHES['m6']/M:.0f}",
         "<b>At the switch to management.</b> The handover is complete, the division is running "
         "on the normal management rhythm rather than the sprint, and the measures above are "
         "still being met. It is easy to hit a number once. This payment is for it holding, and "
         "it falls due on the day the management agreement starts"],
        ["<b>Total</b>", f"<b>{ngn(FEE)}</b>", ""],
    ], ["When", "NGN M", "What has to be true"],
        [52, 44, FULLW - 96], aligns=["r", "l"], total_row=True)
    el.append(card(
        f"<b>Three payments, and the shape is deliberate.</b> NGN {FEE*TRANCHES['mob']/M:.0f}M "
        f"to start, because the team is assembled and paid before a single measure can be met "
        f"and the sequence needs every workstream open at once rather than in turn. NGN "
        f"{FEE*TRANCHES['m3']/M:.0f}M when the division is trading, and only if every measure "
        f"has been met. NGN {FEE*TRANCHES['m6']/M:.0f}M at the switch to management in month 6, "
        f"and only if it is still trading to the same measures once the sprint is over. "
        f"Certainty on the cost of starting, and the whole of the rest at risk.", bg=ALERT, rule=RUST))

    # ============================================================== 05
    sec(el, "09", "THE HANDOVER, AND THEN MANAGEMENT",
        "Two months of transition, and then CFA runs the division.")
    el.append(Paragraph(
        "We have agreed that CFA manages Medbury Aesthetics once it is built. So this is not a "
        "setup that ends and hands over to a stranger. The two months are a transition between "
        "two phases of the same relationship, and that changes how the build is done: I am "
        "building something I then have to run, which is the strongest guarantee available that "
        "it is built properly.", P))
    bullets(el, [
        "<b>Month 4.</b> The division moves from build to operation. Every function has a written "
        "operating pack: the procurement framework with its terms, the SLA file, the protocol set, "
        "the platform administration, the rate card and its logic, the funnel and its numbers.",
        "<b>Month 5.</b> The division runs on the normal management rhythm, with the board pack "
        "produced from the platform and the weekly operating review in place. The last of the "
        "setup fee is released only if the measures are still being met.",
        "<b>Month 6.</b> The management agreement starts on its own contract, with the KPIs that "
        "sit behind it agreed before it begins rather than after.",
    ])
    tbl(el, [
        ["The two chief operating officers", "Medbury employs and pays",
         "CFA recruits both at its own cost, Medbury approves each appointment, and both are "
         "seconded to CFA and report to CFA for delivery"],
        ["Support fee", "NGN 3.0M a month",
         "The CFA back office, and the direction of the division toward the goals the Board "
         "sets. Payable in advance on the fifth business day of each month from month 6"],
        ["Performance fee", "3% of collected net revenue",
         "Cash actually collected, net of VAT and refunds, and net only of items passed through "
         "at cost. One element only, with no share of EBITDA. Payable only where the Board's "
         "revenue and EBITDA goals are both met, so it is not paid on revenue bought at the "
         "expense of profit"],
        ["Term", "24 months",
         "Reviewed at 12 months, with Medbury's right to terminate for sustained failure "
         "against the agreed measures"],
    ], ["The management agreement", "", "What it means"], [86, 92, FULLW - 178])
    tbl(el, [
        ["What it covers", "A chief operating officer inside the division, and the whole back "
         "office behind that person sitting at CFA rather than on your payroll: finance and "
         "revenue cycle, marketing and communications, clinical governance and quality, platform "
         "administration and the board pack, recruitment, procurement and the rate card kept "
         "live. The division pays only for the front line, meaning everyone who touches a "
         "patient, plus stock, licence and marketing spend"],
        ["Why most of it is variable",
         "Because it puts CFA on the same side of the table as the Board. Two of the three parts "
         "pay nothing unless cash is collected or profit beats budget, and the fee is on "
         "collections rather than billings, so a division that bills well and collects badly "
         "pays me nothing on the difference"],
        ["What it is worth to Medbury",
         f"An operating team for a five business division without carrying one post of it on "
         f"your payroll or one desk of it in your building. On "
         f"modelled revenue of NGN {ngn(DIVISION_REVENUE_Y2)}M that is about NGN "
         f"about NGN 36M a year of support fee for the whole CFA back office and the direction "
         f"of the division, against five or six salaries and the desks they sit at if you hire "
         f"the same capability and carry it every month, trading or not"],
    ], ["In practice", "What it means for Medbury"], [86, FULLW - 86])
    el.append(card(
        f"<b>The setup fee and the management agreement are one arrangement, not two.</b> CFA "
        f"prices the build at NGN {ngn(FEE)}M, which is well below what the work costs on its own "
        f"schedule, precisely because CFA runs what it builds afterwards. If the management "
        f"agreement is not part of this, the setup is a different piece of work at a different "
        f"price, and I would say so rather than pretend otherwise.", bg=CREAM))

    # ============================================================== 06
    sec(el, "10", "WHAT THE DIVISION COSTS TO BUILD",
        "The decision underneath the fee, and the one nobody has put a number to yet.")
    el.append(Paragraph(
        "This has been discussed as a fee. The fee is the small number. The decision actually in "
        "front of the Board is the capital behind five clinical businesses, and it has not been "
        "put on a page yet. It belongs here, because a setup mandate that does not tell you what "
        "the setup costs is not a mandate, it is an invoice.", P))
    tbl(el,
        [[n, f"{lo}" if lo == hi else f"{lo} to {hi}",
          ("Worked" if st == "worked" else "Indicative"), note]
         for n, lo, hi, st, note in CAPITAL] +
        [["<b>Equipment, pre-opening and working capital</b>",
          f"<b>{CAP_LO} to {CAP_HI}</b>", "", "<b>Fit-out sits outside this and is priced by "
          "your own contractors</b>"]],
        ["", "NGN M", "Basis", "What drives it"], [112, 44, 52, FULLW - 208],
        aligns=["r", "l", "l"], total_row=True)
    el.append(card(
        f"<b>Two of the seven lines are worked and five are indicative.</b> Lyfe Plastics and "
        f"Dermatology and the device tranche are modelled already, to the line. The other four "
        f"entities have never been costed by anybody, and costing them is the first thing the "
        f"sprint produces, because specifying equipment against this patient population is one of "
        f"the deliverables. Treat the range as the order of magnitude, not the budget.", bg=CREAM))
    tbl(el, [
        ["What the fee is, as a proportion",
         f"NGN {ngn(FEE)}M against NGN {CAP_LO} to {CAP_HI}M of capital. Between four and five "
         f"per cent of the money at risk, spent on deciding where the rest of it goes"],
        ["Why the order matters",
         "The capital budget is an output of the sprint, not an input to it. You are not being "
         "asked to commit the capital to approve this mandate. You are being asked to buy the "
         "work that tells you what the capital is, before you commit it"],
        ["Where it goes wrong without this",
         "Five businesses buying equipment separately, on vendor advice, against catalogues "
         "written for other skin. One wrong device is tens of millions in a room, and the "
         "cosmetic dentistry line alone can be specified fifty million apart by two honest people"],
    ], ["", "Why it matters"], [118, FULLW - 118])
    el.append(card(
        "<b>The first tranche of the sprint delivers the capital budget.</b> Entity by entity, "
        "specified, quoted and sequenced against the launch order, so the earliest cash funds the "
        "later builds. That is the deliverable that turns the range above into a number the Board "
        "can approve.", bg=PANEL))

    sec(el, "11", "WHAT IT COSTS", "What the fee covers, and how it sits against Abuja.")
    el.append(Paragraph(
        f"Against that capital, this is the fee and where it comes from. The Abuja figure was "
        f"NGN {ngn(ABUJA_TOTAL)}M and it included the "
        f"project management fee on the facility build. In Lagos that build may well be managed by "
        f"your own contractors, in which case there is no fee for me to charge, and there is "
        f"none in this price.", P))
    tbl(el, [
        [f"Abuja, as quoted", f"{ngn(ABUJA_TOTAL)}", "Included CFA project management on the facility build"],
        ["Less that project management fee", "(20)", "Your contractors manage the Lagos build, so there is nothing for CFA to charge"],
        ["<b>Comparable scope</b>", f"<b>{ngn(25*M)}</b>",
         "<b>The operating build, across five entities rather than one</b>"],
    ], ["", "NGN M", "Note"], [148, 44, FULLW - 192], aligns=["r", "l"], total_row=True)
    el.append(card(
        f"<b>CFA absorbs the government and regulatory fees.</b> Incorporation, tax registration, "
        f"facility registration, clinical and practitioner registrations, pharmacy and dispensing "
        f"permissions, controlled drug handling, data protection and the trade mark "
        f"filings across all five entities come to roughly NGN "
        f"{REGULATORY_ABSORBED/M:.1f}M. They are inside the NGN {ngn(FEE)}M rather than billed on "
        f"top, so the net fee to CFA is under NGN {(FEE-REGULATORY_ABSORBED)/M:.0f}M. I would "
        f"rather absorb them than have you receive a schedule of small government charges and "
        f"have to wonder what else is coming.", bg=PANEL))
    el.append(Paragraph("The three ways to test the number", H2))
    el.append(Paragraph(
        "A day rate is the wrong test and I am not going to offer one. What matters is what the "
        "fee produces, what it prevents, and what the alternative costs.", P))
    tbl(el, [
        ["Against what it produces",
         f"Section 07, not repeated here: NGN "
         f"{ngn(DIVISION_REVENUE_Y2*MARGIN_GAIN + PRESELL_TARGET + ABUJA_AVOIDED)}M of identified "
         f"year-one value against a fee of NGN {ngn(FEE)}M, two lines of which recur"],
        ["Against what it prevents",
         f"A rate card set five points light on division revenue of NGN "
         f"{ngn(DIVISION_REVENUE_Y2)}M costs NGN {ngn(DIVISION_REVENUE_Y2*MARGIN_GAIN)}M a year "
         f"and cannot be corrected, because you do not raise prices on a base you acquired at the "
         f"wrong number. One quarter of delay across five businesses costs a full quarter of "
         f"their revenue, permanently. One wrong device is tens of millions of naira of capital "
         f"in a room, unused"],
        ["Against building it yourself",
         "The capability is a division lead, a pricing analyst, a platform implementer, a "
         "regulatory hand and a recruiter. Resourced honestly that is close to three full time "
         "people for five months. Hire them and you are above this fee before anyone has "
         "negotiated anything, you carry them after the build is finished, and you have nothing "
         "written down to transfer to Abuja"],
    ], ["Test", "What it shows"], [104, FULLW - 104])
    el.append(card(
        "<b>The test I would apply if I were you.</b> Hold the whole fee against the rate card "
        "alone. If the pricing work at section 04 does not defend its own margin assumption under "
        "the sensitivities, on evidence you can read, then nothing else in this mandate was worth "
        "buying either. I am content for that to be the measure, and it is why the pricing "
        "tranche is the first one and the largest.", bg=CREAM))

    # ============================================================== 07
    sec(el, "12", "WHAT MEDBURY DOES", "So that nothing waits on an unnamed decision.")
    tbl(el, [
        ["A single decision maker", "One person who can approve a rate card, a supplier and an "
         "SLA without a second meeting. Most setups lose more time to waiting than to work"],
        ["The facility", "Whoever builds it, on a programme CFA can plan the launch sequence "
         "against"],
        ["The funding", "Against the approved budget, drawn as the sequence requires"],
        ["The operating lead", "CFA recruits and the Group approves, in post by month 4, so the "
         "person who will run the division is chosen for it"],
        ["Group access", "Referrals, laboratory, pharmacy and the relationships that open a "
         "partner theatre faster than a cold approach"],
    ], ["Medbury provides", "Why it matters"], [104, FULLW - 104])

    # ============================================================== 08
    sec(el, "13", "THE BOUNDARY", "What this fee does not cover.")
    bullets(el, [
        "Project management of the facility build and fit-out, which is why this is 25 and not 45. If Medbury would rather CFA managed that build after all, it is quoted separately and it is not in this number.",

        "Equipment and stock, which is capital and sits in the company's budget.",
        "Hardware, connectivity and third party subscriptions behind the platform. The build, the "
        "configuration, the migration and the training are in the fee. The terminals, the network "
        "and the payment gateway charges are the company's.",
        "Salaries of the front line team recruited during the sprint, meaning everyone who "
        "touches a patient, who are the company's employees from day one. Under the management "
        "agreement that follows, the back office behind them sits at CFA and not on your payroll.",
        "The shareholder negotiation for Lyfe Plastics and Dermatology, which is separately "
        "mandated and already in hand.",
        "The management of the division from month 6, which is agreed and sits on its own "
        "contract rather than inside this fee.",
    ])

    # ============================================================== 09
    sec(el, "14", "DECISIONS", "Four, and then we start.")
    tbl(el, [
        ["The fee", f"NGN {ngn(FEE)}M against the tranches and measures at section 08",
         "Yours"],
        ["The start date", "The sprint is three months from mobilisation and the sequence is "
         "tight. A start in the next fortnight puts first revenue inside the year", "Yours"],
        ["The management agreement", "Terms agreed and issued separately. What remains is the "
         "contract, the KPI schedule and the budget process, all drafted during the sprint "
         "rather than at the end of it", "Joint"],
        ["The operating lead", "Recruited by CFA during the sprint and in post by month 4, so "
         "that the person who runs the division was chosen for it rather than inherited", "Mine"],
    ], ["Decision", "What is being decided", "Whose"], [82, FULLW - 142, 60])
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; Lagos and Abuja<br/>"
        "+234 913 813 8553 &nbsp; / &nbsp; hello@consultforafrica.com &nbsp; / &nbsp; "
        "consultforafrica.com", bg=NAVY, fg=white, rule=GOLD))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "Prepared for Dr Itunu Akinware, Group Chief Executive, Medbury Healthcare Group. "
        "Private and confidential. Capital figures at section 10 are worked for two lines and "
        "indicative for five, and are firmed in tranche one of the sprint.",
        SMALL))

    doc.build(el)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
