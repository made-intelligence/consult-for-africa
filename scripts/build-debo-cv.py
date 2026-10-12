"""
Dr Debo Odulana, curriculum vitae.

Positioned for three readers at once: a board hiring a group chief executive, a
group hiring a chief operating officer, and a fund hiring an operating partner.
The through line is the same in all three cases, so the document does not split
itself: he owns P&L, he resets the economics, and he has been through an exit.

House style. Helvetica has no naira glyph, so money is written N1.0bn.
No em dashes anywhere, by standing instruction.

    python3 scripts/build-debo-cv.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Frame, HRFlowable,
                                KeepTogether, NextPageTemplate, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "cv" / "debo-odulana-cv.pdf"

NAVY = colors.HexColor("#0F3D2E")
GOLD = colors.HexColor("#C9A227")
TEAL = colors.HexColor("#2F6F5E")
BODY = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#6B7280")
LIGHT = colors.HexColor("#EFF4F1")

PW, PH = A4
MARGIN = 16 * mm
FULLW = PW - 2 * MARGIN

NAME = "DEBO ODULANA"
RUNNING = "Dr Debo Odulana   /   Curriculum Vitae"


def style(name, **kw):
    base = dict(name=name, fontName="Helvetica", fontSize=8.8, leading=12.1,
                textColor=BODY, alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(**base)


NAMEST = style("name", fontName="Helvetica-Bold", fontSize=25, leading=27,
               textColor=NAVY, spaceAfter=1)
FORMAL = style("formal", fontSize=8.6, leading=11.4, textColor=MUTED, spaceAfter=5)
STRAP = style("strap", fontName="Helvetica-Bold", fontSize=9.6, leading=12.6,
              textColor=GOLD, spaceAfter=4)
CONTACT = style("contact", fontSize=8.3, leading=11, textColor=BODY, spaceAfter=0)
SEC = style("sec", fontName="Helvetica-Bold", fontSize=9, leading=11,
            textColor=NAVY, spaceBefore=0, spaceAfter=0)
P = style("p", spaceAfter=5)
LEAD = style("lead", fontSize=9.1, leading=12.8, spaceAfter=5)
ORG = style("org", fontName="Helvetica-Bold", fontSize=10.2, leading=12.6, textColor=NAVY)
DATES = style("dates", fontName="Helvetica-Bold", fontSize=8, leading=12.6,
              textColor=MUTED, alignment=TA_RIGHT)
ROLE = style("role", fontName="Helvetica-Bold", fontSize=9, leading=11.6, textColor=TEAL,
             spaceBefore=1, spaceAfter=1)
DESC = style("desc", fontName="Helvetica-Oblique", fontSize=8.2, leading=10.8,
             textColor=MUTED, spaceAfter=3)
BUL = style("bul", fontSize=8.7, leading=11.9, spaceAfter=2.6,
            leftIndent=9, bulletIndent=1, bulletFontSize=7)
EARLY = style("early", fontSize=8.5, leading=11.4, spaceAfter=2.4,
              leftIndent=9, bulletIndent=1, bulletFontSize=7)
NOTE = style("note", fontName="Helvetica-Oblique", fontSize=8.5, leading=11.6,
             textColor=TEAL, spaceAfter=4)

el = []
sp = lambda h=4: el.append(Spacer(0, h))


def section(title):
    """Caps label over a gold rule. Never lands alone at the foot of a page."""
    el.append(CondPageBreak(26 * mm))
    el.append(KeepTogether([
        Spacer(0, 7),
        Paragraph(title.upper(), SEC),
        HRFlowable(width="100%", thickness=1.1, color=GOLD, spaceBefore=2.5, spaceAfter=6),
    ]))


def role(org, dates, title, desc, bullets, keep_head=True):
    head = [
        Table([[Paragraph(org, ORG), Paragraph(dates, DATES)]],
              colWidths=[FULLW - 42 * mm, 42 * mm],
              style=TableStyle([("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                                ("TOPPADDING", (0, 0), (-1, -1), 0),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 1)])),
        Paragraph(title, ROLE),
    ]
    if desc:
        head.append(Paragraph(desc, DESC))
    if bullets and keep_head:
        head.append(Paragraph(bullets[0], BUL, bulletText="•"))
        bullets = bullets[1:]
    el.append(KeepTogether(head))
    for b in bullets:
        el.append(Paragraph(b, BUL, bulletText="•"))
    sp(5)


def early(org, dates, title, line):
    el.append(Paragraph(
        "<b>%s</b>, %s&nbsp;&nbsp;<font color='#6B7280'>%s</font><br/>%s"
        % (title, org, dates, line), EARLY, bulletText="•"))


def band(label, text):
    return [Paragraph("<b><font color='#0F3D2E'>%s</font></b>&nbsp;&nbsp;%s" % (label, text),
                      style("band", fontSize=8.6, leading=11.6))]


# ============================================================ name block ====
el.append(Paragraph(NAME, NAMEST))
el.append(Paragraph("Dr Jubril Adebowale Odulana&nbsp;&nbsp;/&nbsp;&nbsp;MBBS, MSc&nbsp;&nbsp;/"
                    "&nbsp;&nbsp;Medical and Dental Council of Nigeria, full registration",
                    FORMAL))
el.append(Paragraph("Healthcare group operator&nbsp; /&nbsp; turnaround and value creation"
                    "&nbsp; /&nbsp; founding partner, Consult for Africa", STRAP))
el.append(HRFlowable(width="100%", thickness=1.1, color=NAVY, spaceBefore=1, spaceAfter=5))
el.append(Paragraph(
    "Lagos and Abuja, Nigeria&nbsp;&nbsp;|&nbsp;&nbsp;"
    "<a href='mailto:dodulana@gmail.com'>dodulana@gmail.com</a>&nbsp;&nbsp;|&nbsp;&nbsp;"
    "+234 913 813 8553&nbsp;&nbsp;|&nbsp;&nbsp;"
    "<a href='https://www.linkedin.com/in/deboodulana/'>linkedin.com/in/deboodulana</a>",
    CONTACT))

# =============================================================== profile ====
section("Profile")
el.append(Paragraph(
    "Physician and operator, sixteen years in hospital leadership, health system strategy and "
    "healthcare venture building across Africa, the Middle East and the UK. I took a 75-bed "
    "Abuja surgical hospital to the strongest financial year in its sixteen-year history, reset "
    "the clinical workforce economics of a fund-owned tertiary network without losing volume, "
    "and built a 21-state private healthcare network that was acquired by the market leader.",
    LEAD))
el.append(Paragraph(
    "I now run Consult for Africa, a healthcare advisory and venture firm that takes build and "
    "operate mandates rather than reports, so the plans we write come back to us as a number to "
    "hit. That portfolio is the work of an operating partner in all but name: underwrite the "
    "asset, fix the economics, install the operator, hold the result.", LEAD))
el.append(Paragraph(
    "Open to group chief executive or chief operating officer responsibility in a multi-site "
    "healthcare platform, and to an operating partner seat with an investor in the sector.",
    NOTE))

# ====================================================== selected results ====
section("Selected results")
for b in [
    "<b>N1.0bn+ monthly revenue and N1bn+ EBITDA in H1</b> at Cedarcrest Abuja, the strongest "
    "performance in the hospital's sixteen-year history and ahead of the whole of the prior year.",
    "<b>$1.1M annualised cost out</b> at Evercare Lekki, through clinical workforce and service "
    "portfolio rebalancing, with volume held.",
    "<b>23% revenue growth in three months</b> from a consultant pay-for-performance model that "
    "raised variable pay 15% at the same time. Clinicians backed it because they were paid for it.",
    "<b>One exit.</b> Doctoora built from nothing to a network across 21 states and sold to "
    "Evercare Hospital Lekki.",
    "<b>An asset-light expansion model</b> designed and adopted at Evercare, under which the "
    "hospital takes over management of existing facilities with no capital expenditure. It opened "
    "new Lagos sites.",
    "<b>More than N2bn of planned annual revenue</b> underwritten since founding Consult for "
    "Africa, across a medical campus development, a paediatric and neonatal hospital, a "
    "specialist surgical group, a day case facility and an HMO network.",
]:
    el.append(Paragraph(b, BUL, bulletText="•"))

# ============================================================ experience ====
section("Experience")

role("Consult for Africa", "Nov 2025 – Present", "Founding Partner",
     "Healthcare advisory and venture firm. Strategy, operating turnarounds, board work and "
     "build and operate mandates for hospital groups, specialist practices, HMOs and owners.",
     [
         "Built the firm from nothing to a live portfolio: a multi-business medical campus, a "
         "paediatric and neonatal hospital turnaround, an orthopaedic surgical group, a takaful "
         "HMO network strategy, a day case cancer and surgical facility, and a multi-sector "
         "family holding company.",
         "Structured and costed a <b>N1.7bn medical campus</b> in Abuja: measured geometry, rent "
         "roll, a twelve-business operating model, a monthly cash model, peak funding of N718M "
         "and a 29-month payback. The model, not the brief, is the authority on timing.",
         "Ran a full organisational and financial audit of a paediatric and neonatal hospital, "
         "then wrote the growth plan behind it: <b>N45 to N50M monthly revenue at 18 to 20% "
         "EBITDA inside six months</b>, NICU led, funded by a tariff reset in two tranches.",
         "Price build and operate mandates so that the incentive is subordinated to the client's "
         "return of capital: a lower share until the money is home, a higher one after. Owners "
         "sign it because the downside is ours too.",
         "Carry the operating result on mandates where Consult for Africa installs and manages "
         "the team, not only the plan.",
     ])

role("Mezo Health", "Mar 2026 – Present", "Founder  (a Consult for Africa venture)",
     "Verified specialist network and hospital operating stack. mezohealth.com",
     [
         "The Doctoora thesis rebuilt with the layer it was missing. The platform fills the "
         "clinic, runs the schedule, processes the HMO claim and collects the money, so a "
         "specialist can run a private practice without building one.",
         "<b>Asset-light capacity monetisation.</b> Facility, room and visit-block contracting "
         "lets a hospital sell idle clinical capacity by the session instead of carrying it as "
         "fixed cost. The same arbitrage as Evercare Advantage, pointed at the consultant.",
         "<b>A working capital product</b> at the centre of it: advance factoring of up to 80% on "
         "pending HMO claims. Receivables, not demand, are what actually cap private practice "
         "growth in this market.",
         "Sits on a verified workforce registry of more than 10,000 Nigerian clinicians, built "
         "and maintained in house, which is also the recruitment channel for client hospitals.",
     ])

role("Cedarcrest Hospitals Abuja", "Oct 2024 – Nov 2025", "Chief Executive Officer",
     "75-bed tertiary surgical hospital and the largest revenue contributor within Cedarcrest "
     "Hospitals Ltd.",
     [
         "<b>Financial turnaround.</b> N1.0bn+ monthly revenue by October 2025, the highest in "
         "the hospital's history, and N1bn+ EBITDA in H1, surpassing the full prior year.",
         "<b>Commercial reset.</b> Tariffs realigned to the market, service mix rebalanced, "
         "revenue governance and leakage controls installed.",
         "<b>People and structure.</b> Leadership cut from 20 roles to 8, the consultant "
         "compensation framework rewritten, revenue-based variable pay introduced for full time "
         "consultants, psychological safety and engagement measurably improved.",
         "<b>Growth.</b> Built digital referral systems and B2B partnerships, stood up commercial "
         "and digital innovation functions, redesigned patient acquisition.",
         "<b>Operations.</b> Enterprise-wide process controls and service reliability frameworks.",
     ])

role("Evercare Hospital Lekki", "Mar 2023 – Oct 2024", "Chief Innovation and Strategy Officer",
     "165-bed tertiary hospital inside Evercare's fund-owned Africa and South Asia network.",
     [
         "Delivered <b>$1.1M in annualised savings</b> through clinical workforce and service "
         "portfolio optimisation.",
         "Designed and implemented the <b>doctor pay-for-performance model</b>: revenue up 23% in "
         "three months, variable pay up 15%.",
         "Authored the two-year digital transformation roadmap for Evercare Nigeria and Pakistan, "
         "covering EMR optimisation, the digital front door and remote care pathways.",
         "Launched telemedicine, homecare, digital sales channels and outreach, with the referral "
         "workflows and partnerships that fed specialist volume.",
         "Developed <b>Evercare Advantage</b>, a capital-free network expansion model under which "
         "the hospital takes over management of existing facilities. Used to open new Lagos "
         "outreach branches.",
     ])

role("Doctoora Health", "Dec 2016 – Mar 2023", "Founder and Chief Executive Officer",
     "Nigeria's first technology-enabled private healthcare network. Acquired by Evercare "
     "Hospital Lekki.",
     [
         "Built and bootstrapped a distributed provider network across <b>21 states</b>, "
         "monetising underused clinic and hospital capacity on an as-needed basis.",
         "Ran the whole company: operations, clinical governance, technology and finance across "
         "multisite services, with a team of eleven through market entry.",
         "Designed community health models reaching more than <b>6,000 households</b>, including "
         "a subscription primary care service in a hard to reach riverine community and a clinic "
         "for 5,000 traders built with a trade association.",
         "Positioned the business for acquisition and sold it to Evercare Hospital Lekki.",
     ])

role("Cooked Indoors Medical Nutrition", "Nov 2022 – Present", "Founder",
     "Clinical nutrition platform for hospitals, HMOs, pharmacies and patients.",
     [
         "Built a personalised food as medicine platform and a clinical recipe library of more "
         "than 1,000 condition-specific recipes.",
         "Hired a chief executive in October 2024 and stepped back to a non-executive role. The "
         "company trades without me in it, which was the point.",
     ])

role("House of Refuge, Lagos", "Jun 2024 – Present", "Consultant, Strategy and Financial Modelling",
     "A Freedom House project. Specialist addiction rehabilitation network at founding stage.",
     [
         "Financial model, operating plan and organisational design for a 10-bed pilot centre in "
         "Lekki, with the scale framework and investment roadmap to <b>120 beds across four "
         "sites by 2027</b>.",
         "Service model, pricing, clinical and service workflows, staffing, governance and the "
         "fundraising case.",
     ])

# ======================================================== earlier career ====
section("Earlier career")
early("Eti-Osa COVID-19 Isolation and Treatment Centre, Lagos", "Apr 2020 – Jul 2020",
      "Chief Information Officer",
      "Full technology strategy for a 90-bed field hospital inside six weeks, including a 10-bed "
      "ICU with remote patient monitoring, a customised HMIS and the state-wide reporting "
      "dashboard that connected every Lagos isolation centre.")
early("Lifeplan Hospital, now Evercare Hospital Lagos", "Mar 2017 – Jul 2017",
      "Consultant, Care Model Design",
      "Care models for a 350-bed teaching hospital, a 165-bed multispecialty hospital and 60 "
      "community clinics, and the operating process for phase one in Lekki.")
early("SynbiCITE, United Kingdom", "Nov 2016 – Jan 2017", "Business Development Executive",
      "Compiled the first UK synthetic biology start-up annual report and ran the Bio-Start "
      "accelerator campaign, which lifted applicants 60% in the first month.")
early("Imperial Consulting Group, United Kingdom", "Feb 2016 – Sep 2016", "Engagement Manager",
      "Led a team of eight on business planning and market entry for a technology start-up, and "
      "wrote the launch strategy and pricing case for a consumer electronics device.")
early("Hammersmith Hospital, Imperial College Healthcare NHS Trust", "Jun 2016 – Aug 2016",
      "Interim Process Improvement Consultant",
      "Lean implementation in haematology outpatients: value stream mapping, bottleneck "
      "diagnosis, benchmarking, and a recommendation set worth 5% quickly and a further 10 to 15% "
      "over a year.")
early("St Nicholas Hospital, Lagos", "May 2014 – Sep 2015",
      "Surgical Team Lead and Lead Quality Champion",
      "Led Nigeria's first electronic patient record implementation, 30% of a GBP 1.8M expansion "
      "programme across four sites, prepared the hospital for COHSASA accreditation, and ran the "
      "surgical team and junior doctor training.")
early("General Hospital Moniya and NYSC Camp Clinic, Oyo State", "2013 – 2014",
      "Medical Officer and Chief Medical Officer",
      "Acute and surgical services to a rural catchment of 250,000, and camp clinic operations "
      "for 5,000 with zero mortality.")
early("Lagos State University Teaching Hospital", "Nov 2011 – Dec 2012", "House Officer",
      "Core rotations across surgery, medicine, paediatrics and obstetrics.")
early("DePuy Orthopaedics, Johnson and Johnson, UAE", "Dec 2010 – Oct 2011",
      "Professional Education Consultant, DEPAT",
      "Surgeon and theatre nurse training programmes across the Middle East and Africa, and 150 "
      "new sales leads from the Sharjah Surgical Institute in a year.")

# =================================================== board and governance ====
section("Board, governance and profession")
for b in [
    "<b>Independent Non-Executive Director</b>, Havana Specialist Hospital, Lagos. Structuring a "
    "two-family shareholder board under a partnership with a regional operator, with fair process "
    "as the source of its legitimacy.",
    "<b>President</b>, Doctors Foundation for Care, since April 2025. Leads 800+ diaspora-trained "
    "Nigerian physicians on capacity building and contributory work that turns brain drain into "
    "brain gain. Established the Secretariat and governance structures, membership up 10%, led "
    "the digital platform that launched in January 2026.",
    "<b>Member</b>, Nigerian Economic Summit Group Health Policy Commission. Health as a business, "
    "and public health reform.",
    "<b>Lead</b>, Programme and Content Planning, Healthcare Federation of Nigeria. Authored the "
    "federation's policy brief to the Minister of State for Health on the house officer placement "
    "bottleneck.",
]:
    el.append(Paragraph(b, BUL, bulletText="•"))

# ============================================================= education ====
section("Education")
el.append(Paragraph(
    "<b>MSc, International Health Management</b>&nbsp;&nbsp;Imperial College Business School, "
    "London, 2016&nbsp;&nbsp;<font color='#6B7280'>Student-Staff Committee Chair, Dean's Student "
    "Advisory Council, founder of the Africa Business Club</font>", BUL, bulletText="•"))
el.append(Paragraph(
    "<b>MBBS, Medicine and Surgery</b>&nbsp;&nbsp;University of Sharjah, United Arab Emirates, "
    "2011", BUL, bulletText="•"))

# ============================================================ capability ====
section("What I bring")
rows = [
    band("Group leadership",
         "Multi-site P&amp;L ownership, organisational design, executive team building, clinical "
         "governance, board and shareholder reporting, culture and psychological safety."),
    band("Operations",
         "Tariff and revenue governance, service line economics, workforce and rota economics, "
         "process control, lean and six sigma, quality accreditation, HIS and HMIS."),
    band("Capital and investment",
         "Financial modelling and underwriting, feasibility, capital expenditure planning, build "
         "and operate structuring, buy-side diligence-grade audit, one founder-side exit, post "
         "deal value creation."),
    band("Digital",
         "EMR and HMIS optimisation, digital front door, referral systems, telemedicine and "
         "homecare, platform design and build, Power BI and Tableau."),
]
t = Table([[r[0]] for r in rows], colWidths=[FULLW])
t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 9),
                       ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                       ("TOPPADDING", (0, 0), (-1, -1), 5),
                       ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                       ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                       ("LINEBEFORE", (0, 0), (0, -1), 2.2, GOLD),
                       ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT, colors.HexColor("#F7FAF8")])]))
el.append(t)

sp(7)
el.append(Paragraph(
    "<b><font color='#0F3D2E'>Honours</font></b>&nbsp;&nbsp;Winner, Nigerian Economic Summit "
    "Group 25th Anniversary Startup Pitch, 2019&nbsp;&nbsp;/&nbsp;&nbsp;Global Action on Poverty "
    "Changemaker Award, 2016&nbsp;&nbsp;/&nbsp;&nbsp;Founder, Africa Business Club, Imperial "
    "College Business School.&nbsp;&nbsp;<b><font color='#0F3D2E'>Languages</font></b>&nbsp;&nbsp;"
    "English and Yoruba, native. Arabic, basic.", P))


# ============================================================= furniture ====
def footer(canv, doc):
    canv.saveState()
    canv.setStrokeColor(GOLD)
    canv.setLineWidth(1.1)
    canv.line(MARGIN, 12.5 * mm, MARGIN + 11 * mm, 12.5 * mm)
    canv.setFillColor(MUTED)
    canv.setFont("Helvetica", 7.2)
    canv.drawString(MARGIN, 9 * mm, "Dr Debo Odulana   /   +234 913 813 8553   /   "
                                    "dodulana@gmail.com   /   linkedin.com/in/deboodulana")
    canv.drawRightString(PW - MARGIN, 9 * mm, "Page %d" % doc.page)
    canv.restoreState()


def later(canv, doc):
    canv.saveState()
    canv.setFillColor(NAVY)
    canv.setFont("Helvetica-Bold", 8.2)
    canv.drawString(MARGIN, PH - 14 * mm, RUNNING)
    canv.setStrokeColor(GOLD)
    canv.setLineWidth(1.1)
    canv.line(MARGIN, PH - 16 * mm, PW - MARGIN, PH - 16 * mm)
    canv.restoreState()
    footer(canv, doc)


TOP1, TOPN, BOT = 15 * mm, 21 * mm, 16 * mm
doc = BaseDocTemplate(str(OUT), pagesize=A4, title="Dr Debo Odulana, Curriculum Vitae",
                      author="Dr Debo Odulana", subject="Curriculum Vitae")
doc.addPageTemplates([
    PageTemplate(id="first", onPage=footer, frames=[
        Frame(MARGIN, BOT, FULLW, PH - TOP1 - BOT, id="f1",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)]),
    PageTemplate(id="later", onPage=later, frames=[
        Frame(MARGIN, BOT, FULLW, PH - TOPN - BOT, id="fn",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)]),
])
el.insert(0, NextPageTemplate("later"))
doc.build(el)
print("wrote %s" % OUT.relative_to(ROOT))
