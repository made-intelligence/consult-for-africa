"""
Memorandum of Understanding between Medbury Healthcare Group and Consult for
Africa, for the setup and management of the CFA managed special division.

Records the terms settled between Dr Itunu Akinware and Dr Adebowale Odulana on
WhatsApp, 20 and 21 September 2026:

  - CFA sets up the division for NGN 25m across five months, Lagos and Abuja,
    in tranches of 12.5 / 5 / 4 / 3.5 against agreed measures.
  - From month six CFA manages it. Two chief operating officers are recruited by
    CFA, employed and paid by Medbury, and seconded to CFA reporting to Debo
    Odulana.
  - Medbury pays CFA NGN 3m a month for the shared support functions.
  - CFA earns 3.5 per cent of collected net revenue and 3 per cent of EBITDA,
    both subject to the revenue and EBITDA goals being met.

Conventional legal form: front sheet, contents, recitals, numbered clauses with
hanging indents, schedules and an execution block. Serif, black, no branding.
An instrument, not a brochure.

MECE by construction. Symbolic cross-references resolved over two passes.

NGN. No em dashes.

Run:
  python3 scripts/build-medbury-division-mou.py
"""

from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib.colors import HexColor, black
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Frame, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "medbury-division-mou-cfa.pdf"

PAGE_W, PAGE_H = A4
LM = RM = 64
TM, BM = 62, 58
FULLW = PAGE_W - LM - RM

RULE = HexColor("#000000")
FAINT = HexColor("#666666")

SERIF, SERIF_B, SERIF_I = "Times-Roman", "Times-Bold", "Times-Italic"


def st(name, **kw):
    base = dict(fontName=SERIF, fontSize=10.5, leading=14.6, textColor=black,
                alignment=TA_JUSTIFY, spaceAfter=0)
    base.update(kw)
    return ParagraphStyle(name, **base)


FS_DATE = st("fsdate", fontName=SERIF_B, fontSize=12, leading=16, alignment=TA_CENTER)
FS_TITLE = st("fstitle", fontName=SERIF_B, fontSize=19, leading=24, alignment=TA_CENTER)
FS_CONN = st("fsconn", fontName=SERIF_I, fontSize=11, leading=15, alignment=TA_CENTER)
FS_PARTY = st("fsparty", fontName=SERIF_B, fontSize=12, leading=16, alignment=TA_CENTER)
FS_SUB = st("fssub", fontSize=11, leading=15, alignment=TA_CENTER)
FS_FOOT = st("fsfoot", fontSize=9, leading=12.5, alignment=TA_CENTER, textColor=FAINT)

H = st("h", fontName=SERIF_B, fontSize=10.5, leading=14.6, alignment=TA_LEFT,
       leftIndent=34, bulletIndent=0, spaceBefore=13, spaceAfter=5, keepWithNext=1)
CL = st("cl", leftIndent=34, bulletIndent=0, spaceAfter=6)
SUBCL = st("subcl", leftIndent=64, bulletIndent=34, spaceAfter=5)
PLAIN = st("plain", spaceAfter=7)
CENTRE_B = st("centreb", fontName=SERIF_B, fontSize=11, leading=15, alignment=TA_CENTER,
              spaceBefore=6, spaceAfter=8)
CENTRE = st("centre", alignment=TA_CENTER, spaceAfter=6)
REC = st("rec", leftIndent=34, bulletIndent=0, spaceAfter=6)
TH = st("th", fontName=SERIF_B, fontSize=9.5, leading=12.6, alignment=TA_LEFT)
TD = st("td", fontSize=9.5, leading=12.6, alignment=TA_LEFT)
TD_C = st("tdc", fontSize=9.5, leading=12.6, alignment=TA_CENTER)
THR = st("thr", fontName=SERIF_B, fontSize=9.5, leading=12.6, alignment=2)
TDR = st("tdr", fontSize=9.5, leading=12.6, alignment=2)
TDB = st("tdb", fontName=SERIF_B, fontSize=9.5, leading=12.6, alignment=TA_LEFT)
TDBR = st("tdbr", fontName=SERIF_B, fontSize=9.5, leading=12.6, alignment=2)
SIGL = st("sigl", fontSize=10, leading=14, alignment=TA_LEFT)


def front_page(c, doc):
    c.saveState()
    c.setStrokeColor(RULE)
    c.setLineWidth(0.8)
    c.rect(LM - 16, BM - 10, FULLW + 32, PAGE_H - TM - BM + 26, fill=0, stroke=1)
    c.restoreState()


def body_page(c, doc):
    c.saveState()
    c.setFont(SERIF, 9)
    c.setFillColor(FAINT)
    c.drawCentredString(PAGE_W / 2.0, 34, str(doc.page - 2))
    c.restoreState()


def plain_page(c, doc):
    return


# Cross-references are SYMBOLIC. A clause registers a label; references write
# {label} and are resolved at build time. The document is built twice: the first
# pass assigns numbers, the second renders with them substituted. Inserting a
# clause anywhere can no longer silently misdirect a reference, which is exactly
# what went wrong before.
_CL = {"clause": 0, "sub": 0}
_TOC = []
_LABELS = {}
_RESOLVING = {"pass": 1}


def _res(text):
    if _RESOLVING["pass"] == 1:
        return re.sub(r"\{([a-z0-9_]+)\}", "0.0", text)
    def sub_(m):
        k = m.group(1)
        if k not in _LABELS:
            raise KeyError("undefined cross-reference label: " + k)
        return _LABELS[k]
    return re.sub(r"\{([a-z0-9_]+)\}", sub_, text)


def heading(el, title, label=None):
    _CL["clause"] += 1
    _CL["sub"] = 0
    if label:
        _LABELS[label] = str(_CL["clause"])
    if _RESOLVING["pass"] == 1:
        _TOC.append(("%d." % _CL["clause"], title))
    el.append(CondPageBreak(96))
    el.append(Paragraph(title.upper(), H, bulletText="%d." % _CL["clause"]))


def c(el, text, label=None):
    _CL["sub"] += 1
    num = "%d.%d" % (_CL["clause"], _CL["sub"])
    if label:
        _LABELS[label] = num
    el.append(Paragraph(_res(text), CL, bulletText=num))


def sub(el, letter, text):
    el.append(Paragraph(_res(text), SUBCL, bulletText="(%s)" % letter))


def subs(el, items):
    for i, t in enumerate(items):
        sub(el, "abcdefghijklmnop"[i], t)


def table(el, rows, widths, header=None, indent=34, align_c=()):
    data = []
    if header:
        data.append([Paragraph(_res(h), TH) for h in header])
    for r in rows:
        data.append([Paragraph(_res(v), TD_C if j in align_c else TD) for j, v in enumerate(r)])
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("GRID", (0, 0), (-1, -1), 0.5, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    if header:
        style.append(("LINEBELOW", (0, 0), (-1, 0), 0.9, RULE))
    t.setStyle(TableStyle(style))
    if not indent:
        # append directly: a table nested in a holder cannot split across pages
        el.append(Spacer(1, 3))
        el.append(t)
        el.append(Spacer(1, 10))
        return
    holder = Table([["", t]], colWidths=[indent, FULLW - indent])
    holder.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    el.append(holder)


def sig_block(el, party, signatory):
    rows = [
        [Paragraph("SIGNED for and on behalf of<br/><b>%s</b>" % party, SIGL),
         Paragraph("&nbsp;<br/>&nbsp;<br/>_______________________________<br/>%s" % signatory, SIGL)],
        [Paragraph("Date", SIGL), Paragraph("_______________________________", SIGL)],
    ]
    t = Table(rows, colWidths=[FULLW * 0.45, FULLW * 0.55])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    el.append(t)
    el.append(Spacer(1, 30))



# ---------------------------------------------------------------- the terms
SETUP_FEE = 25
TRANCHES = [("On signature", 12.5, "Mobilisation. The team is deployed in full and every "
             "workstream opens."),
            ("Month 1", 5.0, "The rate card delivered with the primary price research, the "
             "bottom-up cost to serve and the sensitivity model behind it. Internal supply "
             "specified and routed."),
            ("Month 3", 4.0, "The first business lawfully trading and first revenue banked, "
             "every service partner under a signed service level agreement, and the "
             "pre-opening programme revenue target met."),
            ("Month 6", 3.5, "At the switch to management. The handover complete, the Division "
             "running on the normal management rhythm, and the measures above still met.")]
SUPPORT_FEE = 3.0
REV_RATE = "3"
EBITDA_RATE = None          # no EBITDA share: Itunu required a single element
TERM_MONTHS = 24
REVIEW_MONTHS = 12

BUSINESSES = [
    ("Cosmetic dentistry", "Veneers, whitening, alignment and implants"),
    ("Hair restoration", "Surgical and non-surgical hair restoration"),
    ("Plastics and dermatology", "Lyfe Plastics and Dermatology, which has its own "
     "shareholders and its own memorandum"),
    ("Weight and bariatric", "Medical weight management and metabolic health"),
    ("Medlyfe wellness and regenerative", "Regenerative medicine, longevity programmes and "
     "infusion. Trading already"),
]

BENCH = [
    ("Finance", "Management accounts, the revenue cycle and its controls, deferred revenue on "
     "treatment programmes sold before delivery, instalment and refund control, payables, "
     "payroll processing and the board pack"),
    ("Marketing and sales", "Strategy, campaigns, content, the enquiry funnel, conversion and "
     "the customer relationship management system"),
    ("Human resources", "Recruitment, contracts, onboarding, credentialing files, scope of "
     "practice, the rota model and performance management"),
    ("Clinical governance and quality", "The protocol set per modality, complications and "
     "escalation, consent and image consent, clinical audit, incidents and complaints"),
    ("Technology", "Administration and support of the Platform across "
     "the five businesses, and the reporting behind the board pack"),
    ("Commercial and pricing", "The rate card kept live against elasticity and mix, programme "
     "and bundle design, and the model underneath both"),
    ("Procurement and supply", "Specification, negotiation, second sourcing and the service "
     "level agreements behind them"),
    ("Executive oversight", "The time of a CFA partner on any matter reaching the Board"),
]

POSTS = [
    ("The two chief operating officers", "Medbury employs and pays. CFA recruits, and they are "
     "seconded to CFA and report to CFA for delivery"),
    ("The CFA support functions at Schedule 2", "CFA employs, pays and carries at its own "
     "premises. No post sits on Medbury's payroll"),
    ("Unit leads, one per clinic or service line", "Medbury employs and pays. CFA recruits and "
     "sets the standard they work to"),
    ("Patient care coordinators", "Medbury employs and pays. CFA writes the pathway, trains "
     "them and is measured on conversion"),
    ("Clinicians, nurses, therapists, technicians and reception", "Medbury employs and pays"),
    ("Receivables, collections, cashiers, storekeepers and medical records",
     "Medbury employs and pays. CFA writes the controls and audits against them"),
]

MEASURES = [
    ("Revenue", "85 per cent of the Board-approved budget or better", "Rolling two quarters"),
    ("Profit", "Within 3 points of the budgeted EBITDA margin", "Rolling two quarters"),
    ("Collections", "No more than 5 per cent of billed revenue outstanding beyond 60 days",
     "Quarterly"),
    ("Utilisation", "55 per cent of available clinical sessions", "Quarterly, from the Platform"),
    ("Cross-sell", "15 per cent of patients treated by one business booked into a second "
     "within 180 days", "Quarterly, from the record"),
    ("Clinical governance", "No unreported serious incident. Quarterly clinical audit "
     "completed. Complaints closed within 14 days", "Quarterly"),
    ("Patients", "Satisfaction at 4.0 of 5 or better", "Rolling quarter"),
    ("Reporting", "Board pack within 10 working days of month end", "Monthly"),
]


def build():
    doc = BaseDocTemplate(
        str(OUT), pagesize=A4, leftMargin=LM, rightMargin=RM, topMargin=TM, bottomMargin=BM,
        title="Memorandum of Understanding", author="Consult for Africa")
    doc.addPageTemplates([
        PageTemplate(id="front", frames=[Frame(LM, BM, FULLW, PAGE_H - TM - BM, id="f")],
                     onPage=front_page),
        PageTemplate(id="plain", frames=[Frame(LM, BM, FULLW, PAGE_H - TM - BM, id="p")],
                     onPage=plain_page),
        PageTemplate(id="body", frames=[Frame(LM, BM, FULLW, PAGE_H - TM - BM, id="b")],
                     onPage=body_page),
    ])
    el = []

    # ------------------------------------------------------------ front sheet
    el.append(Spacer(1, 60))
    el.append(Paragraph("DATED&nbsp;&nbsp;__________________&nbsp;&nbsp;2026", FS_DATE))
    el.append(Spacer(1, 86))
    el.append(Paragraph("MEDBURY HEALTHCARE GROUP", FS_PARTY))
    el.append(Paragraph("and", FS_CONN))
    el.append(Paragraph("CONSULT FOR AFRICA", FS_PARTY))
    el.append(Spacer(1, 86))
    el.append(Paragraph("MEMORANDUM OF UNDERSTANDING", FS_TITLE))
    el.append(Spacer(1, 14))
    el.append(Paragraph("relating to the establishment and management of the "
                        "CFA managed special division", FS_SUB))
    el.append(Spacer(1, 150))
    el.append(Paragraph("Private and confidential.", FS_FOOT))

    el.append(NextPageTemplate("plain"))
    el.append(PageBreak())

    # --------------------------------------------------------------- contents
    el.append(Paragraph("CONTENTS", CENTRE_B))
    el.append(Spacer(1, 6))
    contents = _TOC or [("1.", "Definitions and interpretation")]
    tt = Table([[n, t] for n, t in contents], colWidths=[34, FULLW - 34])
    tt.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), SERIF), ("FONTSIZE", (0, 0), (-1, -1), 10.5),
        ("TOPPADDING", (0, 0), (-1, -1), 2.6), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.6),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    el.append(tt)
    el.append(Spacer(1, 18))
    tt = Table([["Schedule 1", "The five businesses"],
                ["Schedule 2", "The CFA support functions"],
                ["Schedule 3", "Setup deliverables"],
                ["Schedule 4", "Performance measures for the management period"],
                ["Schedule 5", "Who employs and pays which post"]],
               colWidths=[80, FULLW - 80])
    tt.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), SERIF), ("FONTSIZE", (0, 0), (-1, -1), 10.5),
        ("TOPPADDING", (0, 0), (-1, -1), 2.6), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.6),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    el.append(tt)
    el.append(NextPageTemplate("body"))
    el.append(PageBreak())

    # -------------------------------------------------------------- the parties
    el.append(Paragraph("MEMORANDUM OF UNDERSTANDING", CENTRE_B))
    el.append(Paragraph("<b>DATED</b> __________________ 2026", PLAIN))
    el.append(Paragraph("<b>BETWEEN</b>", PLAIN))
    el.append(Paragraph("(1) <b>MEDBURY HEALTHCARE GROUP</b>, a company incorporated in Nigeria "
                        "and having its registered office in Lagos (<b>Medbury</b>); and", PLAIN))
    el.append(Paragraph("(2) <b>CONSULT FOR AFRICA</b>, a healthcare advisory and operating firm "
                        "having its principal office in Lagos (<b>CFA</b>),", PLAIN))
    el.append(Paragraph("each a <b>Party</b> and together the <b>Parties</b>.", PLAIN))
    el.append(Spacer(1, 8))
    el.append(Paragraph("<b>RECITALS</b>", PLAIN))
    el.append(Paragraph("(A) Medbury has grouped five of its businesses into a single special "
                        "division so that they may share resources, and has asked CFA to "
                        "establish and then manage it.", REC))
    el.append(Paragraph("(B) The five businesses are listed at Schedule 1. Plastics and "
                        "dermatology has its own shareholders and its own memorandum, and "
                        "nothing here varies that.", REC))
    el.append(Paragraph("(C) The Parties settled the commercial terms in correspondence on 20 "
                        "and 21 September 2026 and wish to record them.", REC))
    el.append(Paragraph(_res("(D) This Memorandum is not intended to be legally binding except "
                             "as stated at clause {status}."), REC))
    el.append(Spacer(1, 6))
    el.append(Paragraph("<b>IT IS AGREED</b> as follows.", PLAIN))

    # ------------------------------------------------------------------ 1
    heading(el, "Definitions and interpretation")
    c(el, "In this Memorandum: <b>Division</b> means the CFA managed special division comprising "
          "the five businesses at Schedule 1; <b>Business</b> means any one of them; "
          "<b>Commencement Date</b> means the date on which the first setup tranche under clause "
          "{setuptranches} is received by CFA, or such other date as the Parties agree in "
          "writing; <b>Setup Period</b> means the five months from the Commencement Date; "
          "<b>Management Period</b> means the period beginning at month six; "
          "<b>Platform</b> means the software platform CFA builds for the Division under clause "
          "{platform}; <b>Collected Net Revenue</b> has the meaning at clause {cnr}; "
          "<b>EBITDA</b> means "
          "earnings before interest, tax, depreciation and amortisation for the Division, "
          "prepared on the accounting policies the Board approves; and <b>Board</b> means the "
          "board of Medbury or such committee as it appoints.")
    c(el, "A reference to a clause or Schedule is to a clause of or Schedule to this Memorandum. "
          "The Schedules form part of it. Headings do not affect its construction. Amounts are "
          "in Nigerian Naira and, where expressed in millions, are written as NGN followed by "
          "the figure and the letter m.")

    # ------------------------------------------------------------------ 2
    heading(el, "Purpose")
    c(el, "CFA will establish the Division over the Setup Period and manage it thereafter, so "
          "that five separate businesses operate as one division with one rate card, one "
          "clinical record, one back office and one operating rhythm.")
    c(el, "The Parties acknowledge that the shared resources are what make the Division a "
          "division rather than five businesses at one address, and that they are the substance "
          "of what CFA provides.")
    c(el, "A purpose of this arrangement is that the Board is not required to manage the "
          "Division day to day. The Board sets the goals and the budget and receives the "
          "reporting at clause {reporting}, and CFA carries the running of it.")

    # ------------------------------------------------------------------ 3
    heading(el, "The Division")
    c(el, "The Division comprises the five Businesses at Schedule 1, in Lagos and, when that site "
          "is ready, in Abuja.")
    c(el, "The Division is grouped for operating efficiency. Where a Business grows to a size at "
          "which it is better run on its own, the Parties will consider separating it, and "
          "clause {review} applies.")

    # ------------------------------------------------------------------ 4
    heading(el, "The setup")
    c(el, "The Setup Period is five months from the Commencement Date and covers both Lagos and "
          "Abuja.")
    c(el, "CFA will deliver the operating system once for the whole Division, and it will apply "
          "to Abuja from the day that site is ready. It comprises the rate card and the model "
          "beneath it, the clinical protocol set, the build and configuration of the Platform, "
          "the standard operating procedures, the procurement framework and the partner terms.")
    c(el, "The registrations, licensing, recruitment and commissioning of each site, in both "
          "cities, are inside the setup fee at clause {setupfee}.")
    c(el, "Project management of any building works is not inside that fee. Where Medbury's own "
          "contractors manage the works, CFA charges nothing for it. Where Medbury asks CFA to "
          "manage them, that is quoted separately against a defined programme and scope.",
      label="pm")
    c(el, "The setup deliverables are at Schedule 3.")

    # ------------------------------------------------------------------ 5
    heading(el, "The setup fee")
    c(el, f"Medbury will pay CFA NGN {SETUP_FEE}m for the setup, exclusive of value added tax "
          f"and exclusive of government and regulatory fees.", label="setupfee")
    c(el, "Government and regulatory fees, meaning incorporation and tax registrations, facility "
          "registration, clinical and practitioner registrations, pharmacy and dispensing "
          "permissions, data protection filings and trade mark filings, are payable by Medbury. "
          "Medbury may settle them directly or reimburse CFA at cost against receipts, and CFA "
          "applies no mark-up to them.", label="govfees")
    c(el, "CFA will provide a schedule of the expected fees for both cities before the "
          "Commencement Date and will notify Medbury before incurring any fee not on that "
          "schedule, so that none of them arrives as a surprise.")
    c(el, "It is payable in four tranches, the first on signature and the remainder against the "
          "measures set out below. The deliverables those measures test are at Schedule 3.",
      label="setuptranches")
    table(el, [[w, f"{a:.1f}", n] for w, a, n in TRANCHES],
          [88, 56, FULLW - 34 - 144], header=["When", "NGN m", "What has to be true"])
    c(el, "Where a tranche measure is not met, that tranche is not payable until it is. No "
          "tranche measure may be waived except in writing by both Parties.")
    c(el, "Travel and accommodation between Lagos and Abuja are inside the setup fee. Travel "
          "outside those two cities is not, and is recharged at cost with Medbury's prior "
          "approval.")

    # ------------------------------------------------------------------ 6
    heading(el, "Management from month six")
    c(el, "From month six CFA manages the Division. The two months preceding are a transition "
          "between the Setup Period and the Management Period and not an exit.")
    c(el, "CFA's management comprises the two chief operating officers at clause {coo} and the "
          "support functions at Schedule 2, and CFA is accountable to the Board for the "
          "performance of the Division against the measures at Schedule 4.")
    c(el, "CFA will hold what no single Business owns: the rate card across the five, the shared "
          "clinical record, the referral path and the cross-sell between them.")

    # ------------------------------------------------------------------ 7
    heading(el, "The chief operating officers", label="coo")
    c(el, "The Division has two chief operating officers, one for the aesthetics Businesses and "
          "one for Medlyfe wellness and regenerative, each accountable for the profit and loss "
          "of their part of the Division.")
    c(el, "CFA recruits both, against a brief and a specification CFA prepares. Medbury approves "
          "each appointment, and the search, assessment and onboarding are at CFA's cost and are "
          "not recharged.")
    c(el, "Medbury employs both and pays their salaries, employer contributions and benefits "
          "directly. Neither sits on CFA's payroll.")
    c(el, "Both are seconded to CFA for the term of this arrangement, for the purpose of "
          "operationalising the Division, and report to CFA for delivery. CFA directs their "
          "work, sets their objectives and appraises them, and the Board holds CFA rather than "
          "either individual accountable for the measures at Schedule 4.", label="secondment")
    c(el, "Where CFA considers that a chief operating officer is not performing, CFA will say so "
          "in writing and the Parties will agree a remedy or a replacement. CFA will conduct any "
          "replacement search at its own cost.")
    c(el, "The Parties record that this arrangement gives CFA direction without employment, and "
          "gives Medbury the employment relationship. It works only while the reporting line at "
          "clause {secondment} is observed in practice as well as in writing.")

    # ------------------------------------------------------------------ 8
    heading(el, "The support fee")
    c(el, f"Medbury will pay CFA NGN {SUPPORT_FEE:.0f}m a month, exclusive of value added tax, "
          f"monthly in advance from month six, on the payment date at clause {{paydate}}.",
      label="support")
    c(el, "The fee is for two things and not one. First, the support functions at Schedule 2, "
          "which CFA carries at its own premises and on its own payroll. Second, the direction "
          "of the Division toward the goals the Board sets, exercised through the seconded "
          "chief operating officers under clause {secondment} and through CFA's own oversight.",
      label="whatfeebuys")
    c(el, "Accordingly CFA is engaged to manage the Division and not merely to service it. The "
          "Parties record that the second limb of clause {whatfeebuys} is the substance of the "
          "engagement, and that the support functions exist to make it deliverable.")
    c(el, "The fee covers the functions, their output and the service levels behind them. It does "
          "not reserve any named individual to the Division, because the functions are shared "
          "across CFA's clients, which is why the fee is what it is.")
    c(el, "The fee is fixed for the first twelve months. It is reviewed on each anniversary "
          "against the actual cost of the agreed establishment, on an open book basis.")
    c(el, "On review the fee moves by the National Bureau of Statistics headline consumer price "
          "index, year on year for the month preceding the anniversary, subject to a floor of "
          "nil and a cap of 15 per cent. Where that index exceeds 15 per cent in two consecutive "
          "years, either Party may call a review.")
    c(el, "Either Party may call a review outside the anniversary where the actual cost of the "
          "agreed establishment moves by more than 15 per cent between anniversaries. Such a "
          "review is to be concluded within 30 days.")
    c(el, "Where the Division's demand on the support functions grows materially beyond what is "
          "assumed at Schedule 2, that is a matter for the annual review and not for a separate "
          "charge in the meantime.")

    # ------------------------------------------------------------------ 9
    heading(el, "Performance remuneration")
    c(el, f"In addition to the support fee, and subject to the goals at clause {{goals}} being "
          f"met, CFA will receive {REV_RATE} per cent of Collected Net Revenue. This is the "
          f"whole of CFA's performance remuneration and no share of EBITDA or of any other "
          f"measure is payable.", label="perf")
    c(el, "<b>Collected Net Revenue</b> means cash actually collected by the Division for its "
          "services and products, excluding value added tax, refunds and credit notes, and "
          "excluding any third party item the Division passes through at cost without taking a "
          "margin on it. It is measured on cash received and not on invoices raised.",
      label="cnr")
    c(el, "For the avoidance of doubt, drugs, implants, devices and consumables that the Division "
          "sells at a margin form part of Collected Net Revenue. Only items genuinely passed "
          "through at cost are excluded, and the Parties will agree the list of those items "
          "before the Management Period begins and review it at each anniversary.")
    c(el, "It is payable only where the Division meets both the revenue goal and the EBITDA goal "
          "in the Board-approved budget for the period. Although CFA is paid on revenue, it is "
          "not paid on revenue bought at the expense of profit.", label="goals")
    c(el, "It is paid quarterly in arrears, measured on a rolling basis, and trued up at the "
          "year end once the audited or Board-approved figures are available. Where the annual "
          "goals are not met, the true-up recovers what was paid.")
    c(el, "The Parties record that CFA's margin on the support fee is slight, and that CFA's "
          "return on this arrangement depends on this clause. Neither Party should treat the "
          "performance remuneration as incidental.")

    # ------------------------------------------------------------------ 10
    heading(el, "The budget")
    c(el, "The Board-approved budget is the reference for the goals at clause {goals} and for the "
          "measures at Schedule 4, so the way it is set matters to both Parties.")
    c(el, "CFA proposes the annual budget not less than eight weeks before the financial year "
          "end, Business by Business, showing the volume and price assumptions rather than a "
          "single revenue line.")
    c(el, "The Board approves or amends it. Whatever the Board approves is the budget. Where the "
          "Board raises CFA's proposal, the goals and the measures rise with it. Where the Board "
          "lowers it, they fall with it.")
    c(el, "Neither Party may re-base the approved budget during the year except by written "
          "agreement, so that a target is neither lowered to release remuneration nor raised to "
          "withhold it.")
    c(el, "A material event outside the Division's control, including a site closure or a "
          "regulatory suspension, triggers a joint review of the budget rather than an automatic "
          "failure against it.")

    # ------------------------------------------------------------------ 11
    heading(el, "Measures and reporting", label="reporting")
    c(el, "The measures for the Management Period are at Schedule 4. They are set where a well "
          "run division meets them rather than where it must be exceptional.")
    c(el, "They are measured quarterly and apply from the third full quarter of the Management "
          "Period, so that the Division is not judged on its opening ramp.")
    c(el, "CFA will deliver a board pack within ten working days of each month end, produced from "
          "the Platform rather than compiled by hand.")

    # ------------------------------------------------------------------ 12
    heading(el, "What each party provides")
    c(el, "CFA provides the functions at Schedule 2 and carries every post behind them at its own "
          "premises and on its own payroll.")
    c(el, "Medbury provides and pays for everything that touches a patient or is consumed by one, "
          "and for the posts recorded as Medbury's at Schedule 5.")
    c(el, "The general rule is that CFA provides the function and Medbury bears the cost of doing "
          "it. Accordingly CFA runs marketing and sales and Medbury bears the marketing and "
          "sales spend; CFA runs recruitment and Medbury bears every salary in the Division; CFA "
          "runs procurement and Medbury bears the cost of the goods; and CFA administers the "
          "Platform while Medbury bears its hosting, licences, hardware, connectivity and "
          "payment gateway charges.", label="whopays_tech")
    c(el, "Schedule 5 records who employs and pays each post. Where a post is not listed, the "
          "tests are whether its number changes as revenue grows and whether it must be at a "
          "site to do the job. A post that grows with volume or must be on site is Medbury's.",
      label="whopays")

    # ------------------------------------------------------------------ 12A
    heading(el, "Standard of performance")
    c(el, "CFA will perform its obligations with the reasonable skill, care and diligence to be "
          "expected of a professional firm experienced in managing healthcare businesses in "
          "Nigeria, and will assign personnel with appropriate qualifications and experience.")
    c(el, "CFA does not guarantee any particular financial outcome. The measures at Schedule 4 "
          "are the agreed standard against which performance is judged, and clause {review} is "
          "the agreed consequence of failing them.")
    c(el, "Medbury will provide CFA with timely access to the premises, records, systems, staff "
          "and decisions it reasonably requires, and CFA is not responsible for a failure caused "
          "by Medbury not doing so.")

    # ------------------------------------------------------------------ 12B
    heading(el, "Invoicing, payment and taxes")
    c(el, "The support fee is payable monthly in advance on or before the fifth business day of "
          "the month to which it relates, on a fixed date each month and not by reference to a "
          "period running from an invoice. CFA will issue its invoice by the twenty fifth day of "
          "the preceding month.", label="paydate")
    c(el, "The Parties will put the support fee on a standing payment instruction so that it "
          "does not depend on a monthly approval, and Medbury will notify CFA before cancelling "
          "or varying that instruction.")
    c(el, "Each setup tranche is payable within ten business days of the relevant measure being "
          "met and CFA's invoice for it. The first tranche is payable on signature.")
    c(el, "All fees are exclusive of value added tax, which Medbury pays in addition at the "
          "prevailing rate against a valid invoice.")
    c(el, "Medbury may deduct withholding tax where it is required by law to do so, and will "
          "provide CFA with the credit note or receipt evidencing the deduction within 30 days "
          "of remittance so that CFA can claim the credit.", label="wht")
    c(el, "Payment is made in full and in cleared funds, without set-off, counterclaim, "
          "withholding or deduction of any kind, other than a withholding tax Medbury is "
          "required by law to deduct under clause {wht}.", label="nosetoff")
    c(el, "The support fee is payable for CFA making the functions and the management available "
          "for the month. It is not conditional on the approval of any particular deliverable, "
          "report or outcome, and no deliverable is a precondition to it falling due.")
    c(el, "Where Medbury disputes part of an amount in good faith, it pays the undisputed part "
          "on the due date and notifies CFA of the disputed part, with reasons, within five "
          "business days of the due date. A dispute does not entitle Medbury to withhold any "
          "other amount. The Parties will resolve it between the Group Chief Executive and the "
          "Founding Partner within fifteen business days.", label="paydispute")
    c(el, "Each Party will name a finance contact for this arrangement. Where a payment has not "
          "reached CFA by its due date, CFA notifies that contact, and if it is not resolved "
          "within five business days the matter is escalated to the Group Chief Executive.")
    c(el, "Before the Management Period begins Medbury will pay CFA a sum equal to one month's "
          "support fee, which CFA holds and applies against the final month of the arrangement. "
          "It is not additional consideration and it is refundable to the extent it is not so "
          "applied. Its purpose is that a delay in any single month does not interrupt the "
          "running of the Division.", label="deposit")
    c(el, "An amount not paid by its due date carries interest from that date until payment at "
          "three per cent a year above the Central Bank of Nigeria monetary policy rate, "
          "accruing daily. CFA may waive interest in any instance without affecting the right.")
    c(el, "Where payment is late on two or more occasions in any twelve month period, that is a "
          "material breach for the purposes of clause {review}, and CFA may in addition require "
          "the support fee to be paid quarterly in advance for the remainder of the term.")
    c(el, "Where an amount is not paid within 14 days of its due date and is not disputed under "
          "clause {paydispute}, CFA may suspend the affected services on 14 days' written "
          "notice. Suspension does not relieve Medbury of accrued fees, and CFA will not suspend "
          "anything that would put a patient at risk.")

    # ------------------------------------------------------------------ 12C
    heading(el, "Records and audit")
    c(el, "CFA will keep proper records of the establishment it provides and of the costs it "
          "puts forward on an open book basis under clause {support}, and will retain them for "
          "three years.")
    c(el, "Medbury may audit those records once in any twelve month period, on 14 days' notice, "
          "during normal business hours, itself or through an adviser bound to confidentiality. "
          "Medbury bears the cost of the audit unless it shows an overcharge of more than five "
          "per cent, in which case CFA bears it and refunds the difference.")
    c(el, "CFA may examine the Division's records to the extent reasonably necessary to verify "
          "Collected Net Revenue and EBITDA for the purposes of clause {perf}.")

    # ------------------------------------------------------------------ 12D
    heading(el, "Conflicts and non-exclusivity")
    c(el, "CFA provides the functions at Schedule 2 from a shared bench that serves other "
          "clients, and this Memorandum is not exclusive. Medbury acknowledges that this is the "
          "basis on which the support fee is set.")
    c(el, "CFA will not, during the term, manage or advise a competing aesthetics, longevity or "
          "regenerative business operating in the same city as a Business, without Medbury's "
          "prior written consent, which will not be unreasonably withheld.")
    c(el, "CFA will disclose any actual or potential conflict of interest promptly, and will not "
          "place a CFA-related supplier with the Division without disclosing the relationship "
          "and obtaining the Board's approval.")

    # ------------------------------------------------------------------ 12E
    heading(el, "Non-solicitation")
    c(el, "During the term and for twelve months after it, neither Party will solicit or employ "
          "any employee, secondee or contractor of the other who has been materially engaged in "
          "the Division, without the other's prior written consent.")
    c(el, "This does not apply to a response to a public advertisement not directed at the "
          "individual, nor to the two chief operating officers, whose position is governed by "
          "clause {coo}.")

    # ------------------------------------------------------------------ 12F
    heading(el, "Insurance and liability")
    c(el, "CFA will maintain professional indemnity insurance appropriate to the value of this "
          "engagement and will provide evidence of it on request.")
    c(el, "Because the registrations are held in Medbury's name under clause {licences}, Medbury "
          "remains responsible for clinical care, for clinical negligence and for the acts and "
          "omissions of clinicians. CFA is not a healthcare provider, does not practise medicine "
          "and does not hold itself out as doing so.", label="clinliab")
    c(el, "Subject to clause {liabcarve}, CFA's aggregate liability arising out of this "
          "Memorandum in any twelve month period is limited to the total fees received by CFA "
          "under clauses {support} and {perf} in that period.")
    c(el, "Nothing in this Memorandum limits either Party's liability for fraud, wilful "
          "misconduct, death or personal injury caused by negligence, breach of confidentiality, "
          "or any liability that cannot lawfully be limited. The clinical responsibility at "
          "clause {clinliab} is not limited by this clause.", label="liabcarve")
    c(el, "Neither Party is liable to the other for indirect or consequential loss, or for loss "
          "of profit, revenue or goodwill, however arising.")

    # ------------------------------------------------------------------ 12G
    heading(el, "Compliance and licences")
    c(el, "Each Party warrants that it has the authority to enter into this Memorandum and will "
          "comply with all applicable laws, including the Nigeria Data Protection Act 2023 and "
          "the rules of the Medical and Dental Council of Nigeria and the relevant State health "
          "facility monitoring and accreditation agency.")
    c(el, "Medbury is responsible for obtaining and maintaining every facility, clinical, "
          "professional and other licence, registration and accreditation the Businesses "
          "require. CFA will prepare, submit and manage the applications as part of the setup, "
          "but each is held in Medbury's name.", label="licences")
    c(el, "Neither Party, nor anyone acting on its behalf, will offer or accept any bribe, "
          "facilitation payment or improper advantage in connection with the Division, and each "
          "will comply with applicable anti-corruption law.")

    # ------------------------------------------------------------------ 13
    heading(el, "Facilities and biomedical")
    c(el, "Facilities management and biomedical engineering are not inside the support fee at "
          "clause {support}.")
    c(el, "CFA provides those services and the Parties intend to discuss them separately. They "
          "belong on their own retainer because they carry a different cost base and a different "
          "risk profile.")
    c(el, "Before they can be priced the Parties must settle whether the scope is the whole of "
          "Lyfe Place or only the spaces the Division occupies, and Lagos and Abuja are quoted "
          "separately. Until a retainer is agreed, facilities and biomedical remain with Medbury.")

    # ------------------------------------------------------------------ 14
    heading(el, "Intellectual property and data", label="ip")
    c(el, "Everything produced for the Division under this Memorandum belongs to Medbury: the "
          "rate card and the model beneath it, the clinical protocols, the standard operating "
          "procedures and the partner agreements. The Platform is dealt with at clause "
          "{platformowned} and the data at clause {dataowned}.")
    c(el, "CFA will build the Platform for the Division rather than licence an existing product "
          "to it. The build is inside the setup fee at clause {setupfee} and is not charged in "
          "addition to it. No licence fee, build fee or implementation fee is payable for the "
          "Platform, whether during the Setup Period or afterwards.", label="platform")
    c(el, "On payment of the setup fee in full, the Platform as delivered, together with its "
          "configuration and its integrations, belongs to Medbury. CFA will deliver "
          "the source code and the technical documentation, and will keep an up to date copy in "
          "escrow or in a repository under Medbury's control.", label="platformowned")
    c(el, "CFA retains its background intellectual property, meaning the frameworks, libraries, "
          "tools, methods and pre-existing code CFA brings to the build and uses across its "
          "work. CFA grants Medbury a perpetual, non-exclusive, royalty free licence to use that "
          "background intellectual property to the extent it is embedded in the Platform, for "
          "the operation of the Division and any successor to it.", label="background")
    c(el, "Clause {background} does not prevent CFA from using its background intellectual "
          "property for other clients, and does not give CFA any right to use the Division's "
          "data for any purpose other than operating the Division.")
    c(el, "Medbury bears the third party costs of running the Platform, being hosting, "
          "third party software licences, hardware, connectivity and payment gateway charges, "
          "as recorded at clause {whopays_tech}. CFA administers it under clause {support}.")
    c(el, "All data of the Division, including patient data, belongs to Medbury at all times "
          "and no part of it vests in CFA. On expiry or termination, and at any time on "
          "reasonable request, CFA will deliver that data and the Platform configuration in a "
          "structured and commonly used format that Medbury can carry elsewhere, and will "
          "provide reasonable assistance with the migration.", label="dataowned")
    c(el, "Patient data is processed in accordance with the Nigeria Data Protection Act 2023. "
          "Medbury is the data controller and CFA processes on its instructions.")

    # ------------------------------------------------------------------ 15
    heading(el, "Term, review and termination", label="review")
    # the term clause itself is labelled below
    c(el, f"This arrangement runs for {TERM_MONTHS} months from the Commencement Date, with a "
          f"formal review at {REVIEW_MONTHS} months at which the Parties will consider the "
          f"support fee, the measures, the establishment and whether the Division should be "
          f"structured differently.", label="termclause")
    c(el, "Medbury may terminate for sustained failure against the measures at Schedule 4. "
          "Sustained failure means failure against the same measure in two consecutive quarters, "
          "which entitles Medbury to give written notice and CFA to one quarter in which to "
          "remedy it. Where it is not remedied, Medbury may terminate on 30 days' notice.")
    c(el, "Either Party may terminate for material breach not remedied within 30 days of written "
          "notice, or on the insolvency of the other.")
    c(el, "On termination CFA will hand over every operating document, the Platform "
          "configuration and the data, and will provide reasonable transition assistance for up "
          "to 60 days. Fees accrued to the date of termination remain payable, and the "
          "performance remuneration is apportioned to that date.")
    c(el, "The secondments at clause {secondment} end on termination and the chief operating "
          "officers report to Medbury from that date.")
    c(el, "The Parties do not intend that CFA manages the Division indefinitely. At each review "
          "under clause {termclause} they will consider whether the Division is ready to be "
          "managed within Medbury or by a successor, and CFA will support that transition rather "
          "than resist it.", label="succession")
    c(el, "Where Medbury decides to take management in house or to appoint a successor, it will "
          "give CFA not less than 90 days' notice. CFA will deliver a structured handover across "
          "that period covering the operating documents, the Platform configuration and its "
          "administration, the partner relationships, the budget and the reporting, and the "
          "induction of whoever takes over. Neither Party pays a penalty for such a transition.")
    c(el, "Because everything the Division runs on already belongs to Medbury under clause {ip}, "
          "a handover is a process and not a recovery. The Parties record that this is "
          "deliberate, and that CFA has built the Division so that Medbury is able to leave.")

    # ------------------------------------------------------------------ 16
    heading(el, "Other Medbury businesses")
    c(el, "Where the Division performs, the Parties may agree to bring other Medbury businesses "
          "under CFA management.")
    c(el, "Before appointing a third party to manage any other Medbury business or division on "
          "terms comparable to these, Medbury will give CFA a first opportunity to propose terms, "
          "and will consider that proposal in good faith. This does not oblige Medbury to accept "
          "it.")
    c(el, "Any such extension is a separate arrangement, scoped, costed and documented on its "
          "own terms, and nothing in it varies this Memorandum.")

    heading(el, "Confidentiality", label="conf")
    c(el, "Each Party will keep confidential the other's commercial and clinical information and "
          "use it only for the purposes of this arrangement. The obligation survives termination "
          "for three years and does not apply to information that is public through no fault of "
          "the receiving Party or that must be disclosed by law or by a regulator.")

    # ------------------------------------------------------------------ 17
    heading(el, "Status of this Memorandum", label="status")
    c(el, "This Memorandum records the Parties' intentions and is not legally binding, save for "
          "clauses {conf}, {status}, {law} and {gen}, which are binding.")
    c(el, "The Parties will negotiate a definitive services agreement in good faith. Until it is "
          "executed, the Parties will conduct themselves in accordance with this Memorandum.")

    # ------------------------------------------------------------------ 18
    heading(el, "Governing law and disputes", label="law")
    c(el, "This Memorandum is governed by the laws of the Federal Republic of Nigeria.")
    c(el, "The Parties will attempt in good faith to resolve any dispute between the principals "
          "within 21 days. Failing that, the dispute is referred to mediation and, if still "
          "unresolved, to arbitration in Lagos under the Arbitration and Mediation Act 2023 "
          "before a single arbitrator.")

    # ------------------------------------------------------------------ 19
    heading(el, "General", label="gen")
    c(el, "Neither Party may assign this Memorandum without the other's written consent. Nothing "
          "here creates a partnership, a joint venture or an employment relationship between the "
          "Parties, save for the secondment arrangements at clause {secondment}.")
    c(el, "No variation is effective unless in writing and signed by both Parties. This "
          "Memorandum may be executed in counterparts, each of which is an original and which "
          "together constitute one instrument.")
    c(el, "Notices under this Memorandum are given in writing to the address or email each Party "
          "notifies to the other, marked for the attention of the Group Chief Executive in the "
          "case of Medbury and the Founding Partner in the case of CFA. A notice sent by email "
          "is treated as received on the next business day.")
    c(el, "This Memorandum, together with its Schedules, records the whole of what the Parties "
          "have agreed on its subject matter and replaces any earlier understanding between "
          "them, save that nothing here varies the memorandum relating to plastics and "
          "dermatology referred to at Schedule 1.")
    c(el, "Where any provision is found to be unenforceable, it is severed and the remainder "
          "continues in force. A failure to enforce a provision is not a waiver of it.")
    c(el, "A person who is not a Party has no right to enforce any provision of this Memorandum.")
    c(el, "Neither Party is liable for a failure to perform caused by an event beyond its "
          "reasonable control, including an epidemic, civil disturbance, act of government or "
          "sustained failure of public infrastructure. The affected Party will notify the other "
          "promptly and both will work in good faith to resume. Where such an event continues "
          "for more than 90 days, either Party may terminate on 30 days' notice, and clause "
          "{succession} applies to the handover.")

    # ---------------------------------------------------------------- execution
    el.append(Spacer(1, 16))
    el.append(Paragraph("<b>EXECUTED</b> by the Parties on the date first written above.", PLAIN))
    el.append(Spacer(1, 18))
    sig_block(el, "MEDBURY HEALTHCARE GROUP", "Dr Itunu Akinware, Group Chief Executive")
    sig_block(el, "CONSULT FOR AFRICA", "Dr Adebowale Odulana, Founding Partner")

    # ---------------------------------------------------------------- schedules
    el.append(PageBreak())
    el.append(Paragraph("SCHEDULE 1", CENTRE_B))
    el.append(Paragraph("The five businesses", CENTRE))
    table(el, [[n, d] for n, d in BUSINESSES], [150, FULLW - 34 - 150],
          header=["Business", "What it is"])
    el.append(Paragraph("Plastics and dermatology has its own shareholders and its own "
                        "memorandum. Nothing in this Memorandum varies that, and CFA's role "
                        "there is the same operating role it has in the other four.", PLAIN))

    el.append(PageBreak())
    el.append(Paragraph("SCHEDULE 2", CENTRE_B))
    el.append(Paragraph("The CFA support functions", CENTRE))
    el.append(Paragraph(_res("The first limb of what the monthly fee buys under clause "
                             "{whatfeebuys}. Each function is carried at CFA's premises and on "
                             "CFA's payroll, and none of these posts sits on Medbury's payroll. "
                             "The second limb, the direction of the Division toward the Board's "
                             "goals, is not a schedule of tasks and is not listed here."), PLAIN))
    table(el, [[n, d] for n, d in BENCH], [128, FULLW - 34 - 128],
          header=["Function", "What it covers"])

    el.append(PageBreak())
    el.append(Paragraph("SCHEDULE 3", CENTRE_B))
    el.append(Paragraph("Setup deliverables", CENTRE))
    el.append(Paragraph(_res("What CFA delivers across the Setup Period. The tranche measures "
                             "that test them, and the amounts, are at clause {setuptranches} "
                             "and are not repeated here."), PLAIN))
    el.append(Paragraph("Delivered across the Setup Period, once for the whole Division and "
                        "applying to both cities: the rate card and the model beneath it; the "
                        "operating model across the five Businesses; the clinical protocol set "
                        "and governance framework; the build and configuration of the Platform "
                        "and the migration onto it; the standard operating procedures; the "
                        "procurement framework and the signed partner agreements; the funnel and "
                        "the front office; the governance rhythm and the board pack; and per "
                        "Business the scope and menu, the staffing model, the equipment "
                        "specification, the clinical brief for the space, the launch sequence "
                        "and commissioning.", PLAIN))

    el.append(PageBreak())
    el.append(Paragraph("SCHEDULE 4", CENTRE_B))
    el.append(Paragraph("Performance measures for the management period", CENTRE))
    table(el, [[n, t, h] for n, t, h in MEASURES], [96, 208, FULLW - 34 - 304],
          header=["Measure", "Target", "How it is measured"])
    el.append(Paragraph(_res("Measured quarterly from the third full quarter of the Management "
                             "Period. A breach is failure against the same measure in two "
                             "consecutive quarters, and clause {review} then applies."), PLAIN))

    el.append(PageBreak())
    el.append(Paragraph("SCHEDULE 5", CENTRE_B))
    el.append(Paragraph("Who employs and pays which post", CENTRE))
    table(el, [[n, d] for n, d in POSTS], [176, FULLW - 34 - 176],
          header=["Post", "Who employs and pays"])
    el.append(Paragraph(_res("Where a post is not listed, clause {whopays} applies."), PLAIN))

    doc.build(el)


if __name__ == "__main__":
    _RESOLVING["pass"] = 1
    build()
    _CL["clause"] = 0
    _CL["sub"] = 0
    _RESOLVING["pass"] = 2
    build()
    print(f"wrote {OUT}")
