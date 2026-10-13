"""
Kakulus Media: three invoices to Medbury for the AGELESS films.

One per film, each against its brief in docs/ageless/kakulus-brief-*.md:
the ten minute opening film, the MedLYFE Experience (90s) and LyfePlace (90s).
Laid out like Kakulus Media's invoice IVN07100601 and priced at that
invoice's rates. The half day live shoot sits on the opening film invoice;
the MedLYFE Experience film carries only its extra setups on the same day.

Run:
  python3 scripts/build-kakulus-medbury-invoices.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "ageless"
INVOICE_DATE = "13 October 2026"

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Sans", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Sans-Bold", str(FONT_DIR / "Arial Bold.ttf")))

INK = HexColor("#111111")
BODY = HexColor("#2B2B2B")
MUTED = HexColor("#6B6B6B")
RULE = HexColor("#D9D9D9")
BAND = HexColor("#F4F4F4")

PAGE_W, PAGE_H = A4
M = 18 * mm
W = PAGE_W - 2 * M

BILL_TO = [
    ("Medbury Healthcare Group", True),
    ("Attention: Opeoluwa", False),
    ("Communications Lead", False),
    ("Lagos, Nigeria", False),
]

INVOICES = [
    {
        "no": "IVN13100601",
        "project": "The opening film for AGELESS: ten minutes on ageing, licensed stock footage and stills under a "
                   "voiceover, with live footage from a half day at the MedLYFE centre, Lekki.",
        "lines": [
            ("1", "Script and research", "Voiceover script from the brief's structure, every statistic sourced", 150_000),
            ("2", "Voiceover", "Nigerian voice artist, two or three samples, ten minute recording", 120_000),
            ("3", "Stock footage licences", "Commercially licensed clips, predominantly African subjects", 250_000),
            ("4", "Stock stills licences", "Commercially licensed stills", 50_000),
            ("5", "Live shoot, half day", "Director, camera, sound and kit at the MedLYFE centre. Shared with the MedLYFE Experience film", 250_000),
            ("6", "Edit", "Ten minute film, to two rounds of notes", 300_000),
            ("7", "Motion graphics and titles", "Chapter titles, data graphics, lower thirds, end card", 120_000),
            ("8", "Grade, sound design and mix", "Colour grade, sound design, mix and loudness normalisation", 120_000),
            ("9", "Music licence", "Commercially cleared music, perpetual and worldwide", 80_000),
            ("10", "Captions and delivery", "Projection master, captioned version, archive drive with licences", 50_000),
        ],
        "notes": "Final file by Monday 19 October 2026, for the technical check at Capital Club on Tuesday 20 October.<br/>"
                 "Two rounds of notes are included. Full, perpetual, worldwide rights to Medbury Healthcare Group.",
    },
    {
        "no": "IVN13100602",
        "project": "The MedLYFE Experience: a 90 second slow-burn film to the client's copy, from live footage at the "
                   "MedLYFE centre and licensed stock.",
        "lines": [
            ("1", "Pre-production and shot list", "Treatment and shot list built from the copy", 50_000),
            ("2", "Additional setups", "Extra setups on the shoot day invoiced under IVN13100601", 60_000),
            ("3", "Stock footage licences", "Commercially licensed clips", 120_000),
            ("4", "Voiceover", "Voice artist and recording", 60_000),
            ("5", "Edit", "90 second film, to two rounds of notes", 120_000),
            ("6", "Typography and end card", "On-screen copy, MedLYFE mark resolve, end card", 80_000),
            ("7", "Grade, sound design and mix", "Colour grade, sound design and mix", 60_000),
            ("8", "Music licence", "Commercially cleared music, perpetual and worldwide", 50_000),
            ("9", "Versioning and delivery", "16:9 master, 9:16 and 1:1, archive drive with licences", 50_000),
        ],
        "notes": "Final file by Monday 19 October 2026. Two rounds of notes are included.<br/>"
                 "Full, perpetual, worldwide rights to Medbury Healthcare Group.",
    },
    {
        "no": "IVN13100603",
        "project": "LyfePlace: a 90 second film to the client's copy, slow at the start and building to swift cuts, "
                   "from licensed stock.",
        "lines": [
            ("1", "Pre-production and shot list", "Treatment and shot list built from the copy", 50_000),
            ("2", "Stock footage licences", "Commercially licensed clips, enough for the fast cut to the climax", 180_000),
            ("3", "Voiceover", "Voice artist and recording", 60_000),
            ("4", "Edit", "90 second film, to two rounds of notes", 140_000),
            ("5", "Typography and end card", "On-screen copy and end card", 80_000),
            ("6", "Grade, sound design and mix", "Colour grade, sound design and mix", 60_000),
            ("7", "Music licence", "Commercially cleared music, perpetual and worldwide", 50_000),
            ("8", "Versioning and delivery", "16:9 master, 9:16 and 1:1, archive drive with licences", 50_000),
        ],
        "notes": "Final file by Monday 19 October 2026. Two rounds of notes are included.<br/>"
                 "Full, perpetual, worldwide rights to Medbury Healthcare Group.",
    },
]

ss = {
    "cell": ParagraphStyle("cell", fontName="Sans", fontSize=7.6, leading=10, textColor=BODY),
    "cellb": ParagraphStyle("cellb", fontName="Sans-Bold", fontSize=8.2, leading=10.5, textColor=INK),
    "num": ParagraphStyle("num", fontName="Sans", fontSize=8.2, leading=10.5, textColor=BODY, alignment=2),
    "head": ParagraphStyle("head", fontName="Sans-Bold", fontSize=7.2, leading=9, textColor=white),
    "headr": ParagraphStyle("headr", fontName="Sans-Bold", fontSize=7.2, leading=9, textColor=white, alignment=2),
    "p": ParagraphStyle("p", fontName="Sans", fontSize=8.2, leading=11.5, textColor=BODY),
}


def naira(n: int) -> str:
    return f"{n:,}"


def P(t, s="cell"):
    return Paragraph(t, ss[s])


def label(c, x, y, text):
    c.setFont("Sans-Bold", 6.6)
    c.setFillColor(MUTED)
    c.drawString(x, y, text)


def lines_of(c, x, y, rows, lead=10.2):
    for i, (txt, bold) in enumerate(rows):
        c.setFont("Sans-Bold" if bold else "Sans", 8.6 if bold else 8)
        c.setFillColor(INK if bold else BODY)
        c.drawString(x, y - i * lead, txt)


def build(inv: dict) -> tuple[Path, int, int]:
    no = inv["no"]
    subtotal = sum(a for *_, a in inv["lines"])
    vat = subtotal * 75 // 1000
    total = subtotal + vat
    deposit = total * 70 // 100
    balance = total - deposit

    out = OUT_DIR / f"Invoice-{no}-Kakulus-Media.pdf"
    c = Canvas(str(out), pagesize=A4)
    c.setTitle(f"Invoice {no}")
    c.setAuthor("Kakulus Media Ltd")

    c.setFillColor(black)
    c.rect(0, PAGE_H - 26 * mm, PAGE_W, 26 * mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Sans-Bold", 16)
    c.drawString(M, PAGE_H - 15 * mm, "KAKULUS MEDIA LTD")
    c.setFont("Sans-Bold", 24)
    c.drawRightString(PAGE_W - M, PAGE_H - 16 * mm, "INVOICE")

    top = PAGE_H - 36 * mm
    col2, col3 = M + 70 * mm, M + 135 * mm
    label(c, M, top, "FROM")
    lines_of(c, M, top - 5 * mm, [
        ("Kakulus Media Ltd", True), ("Ark Towers, Ligali Ayorinde Street", False),
        ("Victoria Island, Lagos", False), ("kakulusmedia@gmail.com", False),
        ("08061530073", False), ("RC 6926968", False), ("TIN 31345591-0001", False),
    ])
    label(c, col2, top, "BILL TO")
    lines_of(c, col2, top - 5 * mm, BILL_TO)
    label(c, col3, top, "INVOICE NUMBER")
    lines_of(c, col3, top - 5 * mm, [(no, True)])
    label(c, col3, top - 12 * mm, "INVOICE DATE")
    lines_of(c, col3, top - 17 * mm, [(INVOICE_DATE, True)])

    y = top - 32 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(0.6)
    c.line(M, y, PAGE_W - M, y)
    label(c, M, y - 5 * mm, "PROJECT")
    proj = P(inv["project"], "p")
    _, ph = proj.wrap(W - 20 * mm, 30 * mm)
    proj.drawOn(c, M + 20 * mm, y - 3 * mm - ph)
    y = y - 6 * mm - ph
    c.line(M, y, PAGE_W - M, y)

    widths = [12 * mm, 50 * mm, W - 88 * mm, 26 * mm]
    data = [[P("LINE", "head"), P("ITEM", "head"), P("DELIVERABLES", "head"), P("AMOUNT (₦)", "headr")]]
    for ln, item, deliv, amt in inv["lines"]:
        data.append([P(ln), P(item, "cellb"), P(deliv), P(naira(amt), "num")])
    t = Table(data, colWidths=widths)
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), black),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3.6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.6),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, RULE),
        ("LINEBELOW", (0, -1), (-1, -1), 0.6, INK),
    ]
    for i in range(2, len(data), 2):
        cmds.append(("BACKGROUND", (0, i), (-1, i), BAND))
    t.setStyle(TableStyle(cmds))
    _, th = t.wrap(W, PAGE_H)
    y -= 5 * mm
    t.drawOn(c, M, y - th)
    y -= th + 4 * mm

    tx = M + W - 78 * mm
    c.setStrokeColor(RULE)
    for lab, val in (("Subtotal", naira(subtotal)), ("VAT at 7.5%", naira(vat))):
        c.setFont("Sans", 8.4)
        c.setFillColor(BODY)
        c.drawString(tx + 3 * mm, y - 4 * mm, lab)
        c.drawRightString(PAGE_W - M - 2 * mm, y - 4 * mm, val)
        c.line(tx, y - 7 * mm, PAGE_W - M, y - 7 * mm)
        y -= 8.5 * mm
    c.setFillColor(black)
    c.rect(tx, y - 9 * mm, 78 * mm, 10 * mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Sans-Bold", 10.5)
    c.drawString(tx + 3 * mm, y - 5.6 * mm, "TOTAL DUE")
    c.drawRightString(PAGE_W - M - 2 * mm, y - 5.6 * mm, f"₦{naira(total)}")
    y -= 15 * mm

    half = W / 2 - 6 * mm
    bx = M + W / 2 + 6 * mm
    c.setStrokeColor(INK)
    c.setLineWidth(0.6)
    c.line(M, y, M + half, y)
    c.line(bx, y, PAGE_W - M, y)
    label(c, M, y - 5 * mm, "PAYMENT TERMS")
    label(c, bx, y - 5 * mm, "BANK DETAILS")
    for i, (lab, val) in enumerate((("70% on acceptance", deposit), ("30% on delivery of the final files", balance))):
        yy = y - 11 * mm - i * 6 * mm
        c.setFont("Sans", 8.2)
        c.setFillColor(BODY)
        c.drawString(M, yy, lab)
        c.setFont("Sans-Bold", 8.2)
        c.setFillColor(INK)
        c.drawRightString(M + half, yy, f"₦{naira(val)}")
    for i, (lab, val) in enumerate((("Bank", "First Bank of Nigeria"), ("Account name", "Kakulus Media Ltd"), ("Account number", "2045051418"))):
        yy = y - 11 * mm - i * 6 * mm
        c.setFont("Sans", 8.2)
        c.setFillColor(BODY)
        c.drawString(bx, yy, lab)
        c.setFont("Sans-Bold", 8.2)
        c.setFillColor(INK)
        c.drawString(bx + 30 * mm, yy, val)
    y -= 27 * mm

    label(c, M, y, "NOTES")
    notes = P(inv["notes"], "p")
    _, nh = notes.wrap(W, 60 * mm)
    notes.drawOn(c, M, y - 3 * mm - nh)

    c.setStrokeColor(INK)
    c.setLineWidth(0.6)
    c.line(M, 16 * mm, PAGE_W - M, 16 * mm)
    c.setFont("Sans", 6.8)
    c.setFillColor(MUTED)
    c.drawString(M, 11.5 * mm, "Kakulus Media Ltd  ·  RC 6926968  ·  TIN 31345591-0001  ·  kakulusmedia@gmail.com  ·  08061530073")
    c.drawRightString(PAGE_W - M, 11.5 * mm, f"Invoice {no}  ·  Page 1")

    c.showPage()
    c.save()
    return out, subtotal, total


if __name__ == "__main__":
    for inv in INVOICES:
        out, sub, tot = build(inv)
        print(f"{out.name}  subtotal {naira(sub)}  total {naira(tot)}")
