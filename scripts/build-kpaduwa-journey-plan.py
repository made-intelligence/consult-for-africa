"""
One-page plan for Dr Chinwe Kpaduwa and Dr Itunu Akinware, posted to their
WhatsApp group: the "Welcome Back, Dr Chinwe" series, what is filmed, Monday
2 November at the estate, and the later Lyfe Place Lekki scene (Debo, 31 Oct).

Light touch: no appearance or wardrobe, no deadlines, one question each. The
crew-side rules stay in docs/kpaduwa-journey-callsheet-cfa.pdf, which does not
go to them. See memory feedback_light_touch_with_chinwe.

Run:
  python3 scripts/build-kpaduwa-journey-plan.py

No em dashes.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from svglib.svglib import svg2rlg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "kpaduwa-welcome-back-plan-cfa.pdf"
LOGO = ROOT / "docs" / "ageless" / "print" / "logos" / "medlyfe.svg"
LOGO_H = 22

INK = HexColor("#1C2414")
GREEN = HexColor("#4A6131")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
RULE = HexColor("#DCE2D3")
SURFACE = HexColor("#F3F5EF")

MARGIN = 44
PAGE_W, PAGE_H = A4
FULLW = PAGE_W - 2 * MARGIN

try:
    pdfmetrics.registerFont(TTFont("Didot", "/System/Library/Fonts/Supplemental/Didot.ttc", subfontIndex=0))
    DISPLAY = "Didot"
except Exception:
    DISPLAY = "Times-Roman"


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9, leading=12.2, textColor=BODY, alignment=TA_LEFT, spaceAfter=0)
    base.update(kw)
    return ParagraphStyle(name, **base)


TITLE = style("t", fontName=DISPLAY, fontSize=24, leading=28, textColor=INK, spaceAfter=2)
SUB = style("s", fontSize=10, leading=13, textColor=MUTED, spaceAfter=10)
H = style("h", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=GREEN, spaceBefore=12, spaceAfter=5)
BULLET = style("li", leftIndent=10, bulletIndent=0, spaceAfter=2.5)
CELL = style("c", fontSize=8.8, leading=11.4)
ASK = style("a", fontSize=9.2, leading=12.4, textColor=INK, leftIndent=10, bulletIndent=0, spaceAfter=3)

THE_IDEA = [
    "<b>Title:</b> Welcome Back, Dr Chinwe. Building a natural aesthetics practice in Lagos",
    "<b>The story:</b> a surgeon comes home and builds the practice Lagos women have been flying abroad for",
    "<b>The format:</b> short episodes, one for each visit home, told in Dr Chinwe's own words",
    "<b>The thread:</b> natural results; looking rested, not done",
]

FILMED = [
    "The welcome at the MedLYFE clinic, and Dr Chinwe answering the patient questions",
    "Setting up the procedure room with the nursing team",
    "The five patient and doctor films from Thursday and Friday",
]

MONDAY = [
    ("8:00", "Arrival home"),
    ("8:30", "At work: the desk, the plans, the signing"),
    ("9:15", "A conversation by the pool, about the journey so far"),
    ("10:30", "Anything Dr Chinwe would like to say again"),
    ("11:00", "Free for the rest of the day"),
]

THEMES = [
    "Coming home to practise in Lagos",
    "What natural means, and what she will not do",
    "What has been hardest about building this",
    "One surgeon from first consultation to final review",
    "What the practice looks like a year from now",
]

LATER = [
    "<b>The Lyfe Place, Lekki:</b> the build in progress, with the team on site",
    "<b>With Dr Itunu:</b> a short strategy conversation at the Lyfe Place, on a day that suits her",
]

ASKS = [
    "<b>Dr Chinwe:</b> does Monday morning at the estate work for you?",
    "<b>Dr Itunu:</b> would you be happy to appear in the Lyfe Place scene, and which day suits you?",
]


def bullets(items, st=BULLET):
    return [Paragraph(i, st, bulletText="•") for i in items]


def monday_table():
    rows = [[Paragraph(f"<b>{t}</b>", CELL), Paragraph(s, CELL)] for t, s in MONDAY]
    tbl = Table(rows, colWidths=[52, FULLW - 52])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return tbl


def page(c, doc):
    c.saveState()
    logo = svg2rlg(str(LOGO))
    k = LOGO_H / logo.height
    logo.scale(k, k)
    renderPDF.draw(logo, c, MARGIN, PAGE_H - 26 - LOGO_H)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 20, "Lyfe Plastics & Aesthetics by MedLYFE")
    c.drawRightString(PAGE_W - MARGIN, 20, "Prepared by Consult For Africa")
    c.restoreState()


def build() -> Path:
    doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=64, bottomMargin=36,
                            title="Welcome Back, Dr Chinwe", author="Consult For Africa")
    story = [
        Paragraph("Welcome Back, Dr Chinwe", TITLE),
        Paragraph("The content plan, and Monday 2 November", SUB),
        Paragraph("THE IDEA", H),
        *bullets(THE_IDEA),
        Paragraph("ALREADY FILMED", H),
        *bullets(FILMED),
        Paragraph("MONDAY 2 NOVEMBER, AT THE ESTATE", H),
        monday_table(),
        Paragraph("FOR THE CONVERSATION BY THE POOL  /  A GUIDE ONLY, IN YOUR OWN WORDS", H),
        *bullets(THEMES),
        Paragraph("LATER", H),
        *bullets(LATER),
        Paragraph("TWO QUESTIONS", H),
        *bullets(ASKS, ASK),
        Spacer(1, 4),
    ]
    doc.build(story, onFirstPage=page, onLaterPages=page)
    return OUT


if __name__ == "__main__":
    print(build())
