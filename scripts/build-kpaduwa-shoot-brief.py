"""
One-page brief for Dr Chinwe Kpaduwa on the video sessions of Thursday 29 and
Friday 30 October 2026. Direct, business English, bullet points (Debo, 28 Oct).

Light touch: no instructions on appearance or wardrobe, no deadlines, one
planning question only. See memory feedback_light_touch_with_chinwe.

Run:
  python3 scripts/build-kpaduwa-shoot-brief.py

No em dashes.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from svglib.svglib import svg2rlg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "kpaduwa-filming-brief-cfa.pdf"
LOGO = ROOT / "docs" / "ageless" / "print" / "logos" / "medlyfe.svg"
LOGO_H = 22

BRAND = "Lyfe Plastics & Aesthetics by MedLYFE"

INK = HexColor("#1C2414")
GREEN = HexColor("#4A6131")      # the MedLYFE logo
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
RULE = HexColor("#DCE2D3")
SURFACE = HexColor("#F3F5EF")

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 34
FULLW = PAGE_W - 2 * MARGIN - 12
GAP = 16
COLW = (FULLW - 2 * GAP) / 3

for _name, _idx in [("Didot", 0)]:
    try:
        pdfmetrics.registerFont(TTFont(_name, "/System/Library/Fonts/Supplemental/Didot.ttc", subfontIndex=_idx))
    except Exception:
        pass
DISPLAY = "Didot" if "Didot" in pdfmetrics.getRegisteredFontNames() else "Times-Roman"


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=8.4, leading=10.8, textColor=BODY, alignment=TA_LEFT, spaceAfter=0)
    base.update(kw)
    return ParagraphStyle(name, **base)


TITLE = style("t", fontName=DISPLAY, fontSize=22, leading=25, textColor=INK, spaceAfter=2)
SUB = style("sub", fontSize=9.5, leading=12, textColor=MUTED, spaceAfter=6)
DAY = style("d", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=INK, spaceBefore=2, spaceAfter=2)
BLOCK = style("b", fontName="Helvetica-Bold", fontSize=7.6, leading=10, textColor=MUTED, spaceBefore=8, spaceAfter=2)
BULLET = style("li", leftIndent=9, bulletIndent=0, spaceAfter=1.2)
VIDEO = style("v", fontName=DISPLAY, fontSize=13, leading=15, textColor=INK, spaceAfter=1)
KEY = style("k", fontSize=8.8, leading=12, spaceAfter=1.5, leftIndent=9, bulletIndent=0)

FORMAT = style("f", fontName="Helvetica-Oblique", fontSize=8.4, leading=11, textColor=MUTED, spaceAfter=3)
HOOK = style("h", fontName=DISPLAY, fontSize=10.5, leading=12.5, textColor=GREEN, spaceAfter=3)
SHOT = style("sh", fontName="Helvetica-Bold", fontSize=9.5, leading=12.5, textColor=GREEN, spaceAfter=1)
END = style("end", fontName="Helvetica-Bold", fontSize=8.6, leading=12, textColor=INK, spaceBefore=3)

AT_A_GLANCE = [
    "<b>Where:</b> Thursday, the white wall at our office reception and the Treasure Gardens grounds; Friday, the clinic",
    "<b>When:</b> both days, arrive around 7:30, filming 7:45 to 10:20, away by 10:30",
    "<b>Five films:</b> three for patients, two for referring doctors; each cut into 30 to 90 second clips",
    "<b>Patient films:</b> one woman, never seen full face, decides. She could be anyone you know",
    "<b>Doctor films:</b> in full on YouTube; clips to doctor groups, our platforms and email",
    "<b>Your part:</b> lines in green are suggestions; say them your own way",
]

THURSDAY = [
    ("7:45 to 8:25  /  Film 1  /  Patients", "The London Question",
     "Opens on: she unpacks a suitcase; her phone lights up, \u201cWhere are you?\u201d She types: \u201cHome.\u201d",
     "\u201cThe question I am asked most in Lagos: why not just fly to London?\u201d", [
        "The same Beverly Hills standard, in Lagos",
        "One surgeon at every follow-up, from week one to month eight",
        "Privacy: recovery at home, results that read as rested, not done",
     ], "End card: Stay home. Private consultations in Lagos"),
    ("8:25 to 9:05  /  Film 2  /  Patients", "After Children",
     "Opens on: an aso ebi on the wardrobe door; she puts the waist trainer down",
     "\u201cYour waist trainer can hide it. It cannot repair it.\u201d", [
        "What pregnancy and caesareans change, and what can be repaired",
        "Liposuction or tummy tuck",
        "Scar placement and keloid on darker skin",
     ], "End card: Ask for a private consultation"),
]

FRIDAY = [
    ("8:05 to 9:30  /  Film 3  /  Patients", "Your First Hour",
     "Opens on: her hand filling in a health form; she sits down across from you",
     "\u201cBefore I agree to operate, there are things I need to know about you.\u201d", [
        "The checks before anaesthesia: blood, genotype, pressure, diabetes",
        "The patients you send home without surgery",
        "What she leaves with: a plan and a written estimate",
        "Closing shot: she walks out into the Lagos morning",
     ], "End card: Book your first hour, with the number"),
    ("9:05 to 9:40  /  Film 4  /  Doctors", "After Cancer and Weight Loss",
     "For oncologists, breast and bariatric surgeons. Opens on a WhatsApp: \u201cI have a patient for you\u201d",
     "\u201cSome of the women who need me most are already in your care.\u201d", [
        "Reconstruction after mastectomy, if offered here",
        "After major weight loss: when a patient is ready",
        "What you get back: a letter, and your patient returned to you",
     ], "End card: Refer a patient, with the number"),
    ("9:40 to 10:00  /  Film 5  /  Doctors", "After Caesareans",
     "For gynaecologists and GPs. Seated, framed landscape",
     "\u201cWhen the abdomen after several caesareans is a medical problem.\u201d", [
        "Hernia, separated muscles, overhang, skin breakdown",
        "Abdominoplasty, panniculectomy or hernia repair: which one",
        "How to refer, and what to send with the patient",
     ], "End card: Refer a patient, with the number"),
]


LAGOS_SHOTS = ("10:00 to 10:20  /  Outdoors", "You, in Lagos", [
    "A short walk in the Treasure Gardens estate grounds, near the office",
    "Your car on the Link Bridge, shot on a phone on the way in",
])
CLINIC_SHOTS = ("7:45 to 8:05  /  Clinic", "You, in the clinic", [
    "Arriving and greeting the team at reception",
    "The corridor with the MedLYFE sign; the consultation room door",
    "Cut into every film, so no one doubts you are seeing patients here",
])

PICKUPS = ("9:30 to 10:20  /  Clinic", "Pickups", [
    "Any line you want to say again, and short answers for clips",
])


def shots(block):
    head, name, items = block
    return [Paragraph(head.upper(), BLOCK), Paragraph(f"<b>{name}</b>", SHOT)] + \
        [Paragraph(i, BULLET, bulletText="\u2022") for i in items]


def column(title, blocks, lead=(), tail=()):
    out = [Paragraph(title, DAY)]
    for block in lead:
        out += shots(block)
    for head, name, fmt, hook, items, end in blocks:
        out.append(Paragraph(head.upper(), BLOCK))
        out.append(Paragraph(f"<b>{name}</b>", VIDEO))
        out.append(Paragraph(fmt, FORMAT))
        out.append(Paragraph(hook, HOOK))
        out += [Paragraph(i, BULLET, bulletText="\u2022") for i in items]
        out.append(Paragraph(end, END))
    for block in tail:
        out += shots(block)
    return out


def page(c, doc):
    c.saveState()
    logo = svg2rlg(str(LOGO))
    k = LOGO_H / logo.height
    logo.scale(k, k)
    renderPDF.draw(logo, c, MARGIN + 6, PAGE_H - 22 - LOGO_H)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_W - MARGIN - 6, PAGE_H - 22 - LOGO_H / 2 - 3, "Prepared by Consult For Africa")
    c.drawString(MARGIN + 6, 16, f"{BRAND}  /  Dr Chinwe Kpaduwa")
    c.restoreState()


def build() -> Path:
    doc = SimpleDocTemplate(str(OUT), pagesize=landscape(A4), leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=50, bottomMargin=30,
                            title="From Beverly Hills. Now in Lagos.", author="Consult For Africa")
    el = [
        Paragraph("From Beverly Hills. Now in Lagos.", TITLE),
        Paragraph("Five films with Dr Chinwe Kpaduwa  /  Thursday 29 and Friday 30 October 2026", SUB),
    ]
    half = (len(AT_A_GLANCE) + 1) // 2
    glance = Table([[[Paragraph(t, KEY, bulletText="\u2022") for t in AT_A_GLANCE[:half]], "",
                     [Paragraph(t, KEY, bulletText="\u2022") for t in AT_A_GLANCE[half:]]]],
                   colWidths=[(FULLW - GAP) / 2, GAP, (FULLW - GAP) / 2])
    glance.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("LINEBEFORE", (0, 0), (0, -1), 2, GREEN),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    el += [glance, Spacer(1, 8)]

    cols = Table([[column("Thursday 29 October  /  Office, white wall", THURSDAY), "",
                   column("Thursday, continued  /  For doctors", FRIDAY[1:], tail=[LAGOS_SHOTS]), "",
                   column("Friday 30 October  /  At the clinic", FRIDAY[:1], [CLINIC_SHOTS], [PICKUPS])]],
                 colWidths=[COLW, GAP, COLW, GAP, COLW])
    cols.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("LINEABOVE", (0, 0), (0, 0), 0.6, RULE), ("LINEABOVE", (2, 0), (2, 0), 0.6, RULE),
        ("LINEABOVE", (4, 0), (4, 0), 0.6, RULE),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
    ]))
    el.append(cols)

    doc.build(el, onFirstPage=page, onLaterPages=page)
    return OUT


if __name__ == "__main__":
    print(build())
