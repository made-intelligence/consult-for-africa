"""
Expression of interest, Chief Executive Officer, Private Sector Health
Alliance of Nigeria. From Dr Debo Odulana to Oluwafunmbi Akinmulero at PwC
Nigeria, who is running the search.

PwC asked for "CVs and expressions of interest", so this is literally the
second thing they asked for rather than a covering letter dressed up.

It is deliberately not a summary of the CV. It makes one argument: PSHAN has
already proved that a revitalised primary health facility works, and the next
problem is not proof but keeping 774 of them open and full once the adopting
company's budget cycle turns over. That is an operating and financing problem,
which is the thing Debo is actually best at. The figures quoted back to PSHAN
are PSHAN's own, as reported in July 2026.

Personal masthead, not the Consult for Africa letterhead. He is applying, the
firm is not.

No em dashes, by standing instruction.

    python3 scripts/build-pshan-eoi.py
"""

from __future__ import annotations

import sys

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, HRFlowable, KeepTogether,
                                NextPageTemplate, PageTemplate, Paragraph, Spacer)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "pshan" / "debo-odulana-expression-of-interest.pdf"

NAVY = colors.HexColor("#0F3D2E")
GOLD = colors.HexColor("#C9A227")
BODY = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#6B7280")

PW, PH = A4
MARGIN = 20 * mm
FULLW = PW - 2 * MARGIN


def style(name, **kw):
    base = dict(name=name, fontName="Helvetica", fontSize=9.4, leading=13.6,
                textColor=BODY, alignment=TA_LEFT, spaceAfter=7)
    base.update(kw)
    return ParagraphStyle(**base)


NAMEST = style("name", fontName="Helvetica-Bold", fontSize=22, leading=24,
               textColor=NAVY, spaceAfter=1, alignment=TA_LEFT)
FORMAL = style("formal", fontSize=8.4, leading=11, textColor=MUTED, spaceAfter=4,
               alignment=TA_LEFT)
CONTACT = style("contact", fontSize=8.3, leading=11, textColor=BODY, spaceAfter=0,
                alignment=TA_LEFT)
META = style("meta", fontSize=9, leading=12.4, textColor=MUTED, spaceAfter=2,
             alignment=TA_LEFT)
SUBJ = style("subj", fontName="Helvetica-Bold", fontSize=10.2, leading=13.4,
             textColor=NAVY, spaceBefore=4, spaceAfter=8, alignment=TA_LEFT)
P = style("p")
SIGN = style("sign", fontName="Helvetica-Bold", fontSize=10, leading=13,
             textColor=NAVY, spaceBefore=2, spaceAfter=1, alignment=TA_LEFT)
SIGNC = style("signc", fontSize=8.6, leading=11.4, textColor=MUTED, spaceAfter=0,
              alignment=TA_LEFT)

el = []

# =============================================================== masthead ====
el.append(Paragraph("DEBO ODULANA", NAMEST))
el.append(Paragraph("Dr Jubril Adebowale Odulana&nbsp;&nbsp;/&nbsp;&nbsp;MBBS, MSc"
                    "&nbsp;&nbsp;/&nbsp;&nbsp;Medical and Dental Council of Nigeria, "
                    "full registration", FORMAL))
el.append(HRFlowable(width="100%", thickness=1.1, color=NAVY, spaceBefore=1, spaceAfter=5))
el.append(Paragraph(
    "Lagos, Nigeria&nbsp;&nbsp;|&nbsp;&nbsp;"
    "<a href='mailto:dodulana@gmail.com'>dodulana@gmail.com</a>&nbsp;&nbsp;|&nbsp;&nbsp;"
    "+234 913 813 8553&nbsp;&nbsp;|&nbsp;&nbsp;"
    "<a href='https://www.linkedin.com/in/deboodulana/'>linkedin.com/in/deboodulana</a>",
    CONTACT))
el.append(Spacer(0, 12))

el.append(Paragraph("24 September 2026", META))
el.append(Spacer(0, 6))
el.append(Paragraph("Oluwafunmbi Akinmulero<br/>PwC Nigeria", META))
el.append(Spacer(0, 10))

el.append(Paragraph("Dear Ms Akinmulero,", P))
el.append(Paragraph("Chief Executive Officer, Private Sector Health Alliance of Nigeria",
                    SUBJ))

# ==================================================================== body ====
for para in [
    "I would like to be considered for the PSHAN chief executive role. My CV is attached.",

    "I have spent sixteen years running health facilities, mostly ones that were not working when "
    "I got there. Cedarcrest in Abuja was the last of them. We took it past a billion naira a "
    "month, the best year in its history. Before that I was chief innovation and strategy officer "
    "at Evercare Lekki, where I cut $1.1M of cost without losing volume and put revenue up 23% in "
    "a quarter. And I built Doctoora, which reached 21 states without building a single facility, "
    "then sold it to Evercare.",

    "PSHAN has already won the hard argument. 800,000 people reached, utilisation up more than "
    "tenfold, no maternal deaths and no stockouts on the programme. Not many people in Nigerian "
    "health can show you numbers like that.",

    "What I would worry about is year three. A company adopts a centre, the refurbishment is "
    "done, the ribbon is cut, and then the budget cycle turns and the CSR line moves on. 774 LGAs "
    "means 774 small businesses that each have to earn their keep. Opening them is a mobilisation "
    "problem and PSHAN has solved it. Keeping them open is an operating problem, and that is my "
    "work.",

    "I have done it at this level too, which a CV full of hospital names hides. At Doctoora we "
    "ran a subscription primary care service in a riverine community you cannot drive to, and "
    "built a clinic for five thousand traders with their own association paying in. Neither was "
    "charity and neither fell over when the launch money ran out. I would also want to test "
    "whether Evercare Advantage, which I designed, can be pointed at ADHFP. We took over "
    "facilities we did not own and put in no capital. From outside, the scarce input at these "
    "centres looks like management rather than money.",

    "The ground has moved as well. Between the SWAp and the renewal investment programme there is "
    "now a federal mechanism with state money behind it. Dr Muntaqa Umar-Sadiq, who established "
    "PSHAN and now coordinates SWAp, has been a friend and a mentor of mine for years. PSHAN's "
    "facilities should be counted inside that architecture, not alongside it.",

    "On money, I have raised it, built a company and sold it, and I hold a fundraising mandate in "
    "Lagos that pays me only on what is actually raised. I know the donor side from the inside, "
    "having reported to a development finance fund at Evercare. And through the Doctors "
    "Foundation for Care, which I lead, the NESG Health Policy Commission and the Healthcare "
    "Federation of Nigeria, I am in regular contact with the global partners and the Nigerian "
    "funders working here. I would not be starting that network from scratch.",

    "MBBS, MSc from Imperial, full MDCN registration. I live in Lagos. I would be glad to talk, "
    "and to come in and go through the first hundred days properly.",
]:
    el.append(Paragraph(para, P))

el.append(Spacer(0, 4))
el.append(KeepTogether([
    Paragraph("Yours sincerely,", P),
    Spacer(0, 12),
    Paragraph("Dr Debo Odulana", SIGN),
    Paragraph("dodulana@gmail.com&nbsp;&nbsp;/&nbsp;&nbsp;+234 913 813 8553"
              "&nbsp;&nbsp;/&nbsp;&nbsp;linkedin.com/in/deboodulana", SIGNC),
]))


# ============================================================== furniture ====
def footer(canv, doc):
    canv.saveState()
    canv.setStrokeColor(GOLD)
    canv.setLineWidth(1.1)
    canv.line(MARGIN, 12.5 * mm, MARGIN + 11 * mm, 12.5 * mm)
    canv.setFillColor(MUTED)
    canv.setFont("Helvetica", 7.2)
    canv.drawString(MARGIN, 9 * mm,
                    "Dr Debo Odulana   /   Expression of interest   /   "
                    "Chief Executive Officer, Private Sector Health Alliance of Nigeria")
    canv.drawRightString(PW - MARGIN, 9 * mm, "Page %d" % doc.page)
    canv.restoreState()


def later(canv, doc):
    canv.saveState()
    canv.setFillColor(NAVY)
    canv.setFont("Helvetica-Bold", 8.2)
    canv.drawString(MARGIN, PH - 14 * mm, "Dr Debo Odulana   /   Expression of interest")
    canv.setStrokeColor(GOLD)
    canv.setLineWidth(1.1)
    canv.line(MARGIN, PH - 16 * mm, PW - MARGIN, PH - 16 * mm)
    canv.restoreState()
    footer(canv, doc)


TOP1, TOPN, BOT = 18 * mm, 22 * mm, 17 * mm
doc = BaseDocTemplate(
    str(OUT), pagesize=A4,
    title="Dr Debo Odulana, Expression of Interest, Chief Executive Officer, PSHAN",
    author="Dr Debo Odulana", subject="Expression of interest")
doc.addPageTemplates([
    PageTemplate(id="first", onPage=footer, frames=[
        Frame(MARGIN, BOT, FULLW, PH - TOP1 - BOT, id="f1",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)]),
    PageTemplate(id="later", onPage=later, frames=[
        Frame(MARGIN, BOT, FULLW, PH - TOPN - BOT, id="fn",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)]),
])
# The copy that went to PwC on 24 September 2026 was signed by hand in Preview, which is
# why the file on disk is far larger than this script produces. Rebuilding would silently
# destroy that signature, so refuse unless asked twice.
if OUT.exists() and "--force" not in sys.argv:
    raise SystemExit(
        "REFUSING to overwrite %s.\n"
        "That file is the hand-signed copy that was sent to PwC. Pass --force if you really\n"
        "mean to rebuild it, and get it signed again before it goes anywhere."
        % OUT.relative_to(ROOT))

el.insert(0, NextPageTemplate("later"))
doc.build(el)
print("wrote %s" % OUT.relative_to(ROOT))
