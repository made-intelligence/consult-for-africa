"""
Crew call sheet for the third shoot morning with Dr Chinwe Kpaduwa, Monday
2 November 2026: the scenes for "Welcome Back, Dr Chinwe", the series about
building a natural aesthetics practice in Lagos (Debo, 30 to 31 Oct).

Internal: this goes to the crew, not to Dr Chinwe. Crew-side rules (bare-skin
lighting, hard hats, props) live here and never in a message to her. See memory
feedback_light_touch_with_chinwe.

Run:
  python3 scripts/build-kpaduwa-journey-callsheet.py

No em dashes.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "kpaduwa-journey-callsheet-cfa.pdf"

INK = HexColor("#1C2414")
GREEN = HexColor("#4A6131")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
RULE = HexColor("#DCE2D3")
SURFACE = HexColor("#F3F5EF")
AMBER = HexColor("#92400E")

MARGIN = 40
PAGE_W, PAGE_H = A4
FULLW = PAGE_W - 2 * MARGIN

try:
    pdfmetrics.registerFont(TTFont("Didot", "/System/Library/Fonts/Supplemental/Didot.ttc", subfontIndex=0))
    DISPLAY = "Didot"
except Exception:
    DISPLAY = "Times-Roman"


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=8.4, leading=11, textColor=BODY, alignment=TA_LEFT, spaceAfter=0)
    base.update(kw)
    return ParagraphStyle(name, **base)


TITLE = style("t", fontName=DISPLAY, fontSize=21, leading=24, textColor=INK, spaceAfter=2)
SUB = style("s", fontSize=9.5, leading=12, textColor=MUTED, spaceAfter=8)
H = style("h", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=GREEN, spaceBefore=10, spaceAfter=4)
CELL = style("c", fontSize=8, leading=10.4)
CELL_B = style("cb", fontName="Helvetica-Bold", fontSize=8, leading=10.4, textColor=INK)
BULLET = style("li", leftIndent=9, bulletIndent=0, spaceAfter=1.5)
OPEN = style("o", leftIndent=9, bulletIndent=0, spaceAfter=1.5, textColor=AMBER)

AT_A_GLANCE = [
    "<b>Crew call:</b> 7:30 at the estate. <b>Dr Chinwe:</b> 8:00. <b>Wrap:</b> 11:00",
    "<b>Crew:</b> director, photographer, sound recordist (two lapel mics), operator",
    "<b>Already shot:</b> clinic welcome, script questions, procedure room with the nurse",
    "<b>The spine:</b> the poolside interview is the voice-over for every other scene",
    "<b>Later, on its own day:</b> the Lyfe Place Lekki build with the builders, and the scene with Dr Itunu",
]

# (time, scene, location, what the shot needs)
SCHEDULE = [
    ("8:00 to 8:30", "Arrival", "Estate gate and drive",
     "G-Wagon pulls up; driver takes the suitcases out; she walks in. Two takes, one wide, one close on the bags"),
    ("8:30 to 9:15", "The executive", "Debo's office",
     "At the computer, then signing. Screen shows the booking page. Prop documents only"),
    ("9:15 to 10:30", "Poolside interview", "Estate pool",
     "Seated, in shade. 2 to 3 extras in the background, out of focus. Questions below"),
    ("10:30 to 11:00", "Pickups", "Estate",
     "Any line she wants to say again, and short answers for clips"),
]

QUESTIONS = [
    "When did you decide to come home and practise in Lagos?",
    "What does natural mean in your work, and what will you not do?",
    "What did you see in Lagos that told you women here were underserved?",
    "What has been the hardest part of building this?",
    "Why does it matter that one surgeon sees a patient from first consultation to final review?",
    "What will a woman find at the Lyfe Place that she would otherwise fly abroad for?",
    "What do you want a patient to feel when she leaves you?",
    "What does this practice look like a year from now?",
]

CREW_RULES = [
    "Light for bare skin. No make-up on set, and no comment on appearance or wardrobe",
    "Props only on the desk: no real contract, figures, letterhead or company branding in frame",
    "No patient details on any screen or paper",
    "Every extra and every builder on camera signs a release before filming",
        "Retakes: two per line, then move on. She answers in her own words",
]

OPEN_ITEMS = [
    "G-Wagon and driver: who provides it, and confirmed for 7:45",
    "MedLYFE: no consultations booked for Dr Chinwe on Monday morning",
    "2 to 3 extras for the pool, with releases",
]


def table(rows):
    data = [[Paragraph("<b>Time</b>", CELL_B), Paragraph("<b>Scene</b>", CELL_B),
             Paragraph("<b>Where</b>", CELL_B), Paragraph("<b>What the shot needs</b>", CELL_B)]]
    for t, scene, where, need in rows:
        data.append([Paragraph(t, CELL), Paragraph(f"<b>{scene}</b>", CELL), Paragraph(where, CELL), Paragraph(need, CELL)])
    tbl = Table(data, colWidths=[70, 105, 95, FULLW - 270])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return tbl


def bullets(items, st=BULLET, mark="•"):
    return [Paragraph(i, st, bulletText=mark) for i in items]


def footer(c, doc):
    c.saveState()
    c.setFont("Helvetica", 7.5)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 20, "Lyfe Plastics & Aesthetics by MedLYFE  /  Crew only, not for circulation")
    c.drawRightString(PAGE_W - MARGIN, 20, "Prepared by Consult For Africa")
    c.restoreState()


def build() -> Path:
    doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=36, bottomMargin=34,
                            title="Welcome Back, Dr Chinwe: call sheet", author="Consult For Africa")
    story = [
        Paragraph("Welcome Back, Dr Chinwe", TITLE),
        Paragraph("Call sheet  /  Monday 2 November 2026  /  The estate", SUB),
        *bullets(AT_A_GLANCE),
        Paragraph("SCHEDULE", H),
        table(SCHEDULE),
        Paragraph("POOLSIDE QUESTIONS  /  SHE ANSWERS IN HER OWN WORDS", H),
        *[Paragraph(q, BULLET, bulletText=f"{i}.") for i, q in enumerate(QUESTIONS, 1)],
        Paragraph("CREW RULES", H),
        *bullets(CREW_RULES),
        Paragraph("TO CONFIRM BY SUNDAY EVENING", H),
        *bullets(OPEN_ITEMS, OPEN, "□"),
        Spacer(1, 4),
    ]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return OUT


if __name__ == "__main__":
    print(build())
