"""
Dr Debo Odulana, one-page biography.

The long form of the bio, in the CV's house style. Client names withheld;
Havana is named because the board seat is of record.

House style. Helvetica has no naira glyph, so money is written N1bn.
No em dashes anywhere, by standing instruction.

    python3 scripts/build-debo-bio.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "cv" / "debo-odulana-bio.pdf"

NAVY = colors.HexColor("#0F3D2E")
GOLD = colors.HexColor("#C9A227")
BODY = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#6B7280")

MARGIN = 22 * mm


def style(name, **kw):
    base = dict(name=name, fontName="Helvetica", fontSize=10.5, leading=15.5,
                textColor=BODY, alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(**base)


NAMEST = style("name", fontName="Helvetica-Bold", fontSize=24, leading=27, textColor=NAVY)
STRAP = style("strap", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=GOLD,
              spaceBefore=2)
LABEL = style("label", fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=NAVY)
P = style("p", spaceAfter=10)
FOOT = style("foot", fontSize=8.5, leading=11, textColor=MUTED)

PARAS = [
    "Dr Debo Odulana is a physician and healthcare operator with sixteen years in hospital "
    "leadership, health system strategy and building healthcare ventures across Africa, the "
    "Middle East and the UK. He is Founding Partner of Consult for Africa, which strategises, "
    "builds and operates healthcare businesses for hospital groups, investors and founders.",

    "As Chief Executive of Cedarcrest Hospitals Abuja, he took the hospital to more than N1bn "
    "in monthly revenue and more than N1bn of EBITDA in a single half-year, the best results in "
    "its history. At Evercare Hospital Lekki he took $1.1m a year out of costs and designed "
    "Evercare Advantage, a model for expanding the network without capital. He founded "
    "Doctoora, built it into a provider network across 21 states and sold it to Evercare.",

    "During the pandemic he was Chief Information Officer of the Eti-Osa COVID-19 Isolation and "
    "Treatment Centre. There he delivered the technology for a 90-bed field hospital in six "
    "weeks, including a 10-bed ICU with remote monitoring. Earlier he worked on process "
    "improvement at Hammersmith Hospital in the NHS, and on care model design for what is now "
    "Evercare Hospital Lagos.",

    "He is President of Doctors Foundation for Care, which has more than 800 diaspora-trained "
    "Nigerian physicians, and an Independent Non-Executive Director of Havana Specialist "
    "Hospital. He holds an MBBS from the University of Sharjah and an MSc in International "
    "Health Management from Imperial College Business School.",
]

el = [
    Paragraph("DR DEBO ODULANA", NAMEST),
    Paragraph("Founding Partner, Consult for Africa", STRAP),
    HRFlowable(width="100%", thickness=1.2, color=GOLD, spaceBefore=8, spaceAfter=16),
    Paragraph("BIOGRAPHY", LABEL),
    Spacer(0, 8),
    *[Paragraph(t, P) for t in PARAS],
    Spacer(0, 10),
    HRFlowable(width="100%", thickness=0.6, color=MUTED, spaceBefore=0, spaceAfter=6),
    Paragraph("MBBS, MSc&nbsp;&nbsp;|&nbsp;&nbsp;Lagos, Nigeria&nbsp;&nbsp;|&nbsp;&nbsp;"
              "linkedin.com/in/deboodulana", FOOT),
]

OUT.parent.mkdir(parents=True, exist_ok=True)
SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                  topMargin=MARGIN, bottomMargin=MARGIN,
                  title="Dr Debo Odulana, Biography", author="Debo Odulana").build(el)
print(OUT)
