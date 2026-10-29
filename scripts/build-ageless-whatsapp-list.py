"""
The WhatsApp follow-up list as a PDF the MedLYFE coordinator works from on a
phone: each row's button opens WhatsApp with that guest's message written.

    python3 scripts/build-ageless-whatsapp-list.py

Reads and writes docs/ageless/lists/, which is gitignored (phone numbers).
"""

import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
LISTS = ROOT / "docs" / "ageless" / "lists"
GREEN = colors.HexColor("#1F3A2E")
LIME = colors.HexColor("#C4D7A6")
INK = colors.HexColor("#1E2B22")

rows = json.loads((LISTS / "whatsapp-followup.json").read_text())

h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=17, leading=22, textColor=GREEN, spaceAfter=8)
body = ParagraphStyle("b", fontName="Helvetica", fontSize=9.5, leading=13, textColor=INK)
cell = ParagraphStyle("c", fontName="Helvetica", fontSize=9.5, leading=12, textColor=INK)
link = ParagraphStyle("l", fontName="Helvetica-Bold", fontSize=9.5, leading=12, textColor=GREEN)

story = [
    Paragraph("AGELESS: WhatsApp follow-up", h1),
    Paragraph(
        "For the MedLYFE coordinator. Open this PDF on the phone that holds the MedLYFE WhatsApp account. "
        "Tap <b>Send on WhatsApp</b> on each row: WhatsApp opens with the guest's message and personal link "
        "already written. Check it and press send, then tick the row.",
        body,
    ),
    Spacer(1, 3 * mm),
    Paragraph(
        "The message thanks the guest, asks for feedback through their personal link, and reminds them of the "
        "voucher in their souvenir pack. Booking requests that come back go to the coordinator queue as usual.",
        body,
    ),
    Spacer(1, 6 * mm),
]

data = [["", "Guest", "Phone", "", "Sent"]]
for i, r in enumerate(rows, 1):
    btn = (
        Paragraph(f'<link href="{r["wa"].replace("&", "&amp;")}"><u>Send on WhatsApp</u></link>', link)
        if r["wa"]
        else Paragraph("No usable number", cell)
    )
    data.append([str(i), Paragraph(r["name"], cell), Paragraph(r["phone"], cell), btn, "[  ]"])

t = Table(data, colWidths=[9 * mm, 62 * mm, 38 * mm, 50 * mm, 13 * mm], repeatRows=1)
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), GREEN),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9.5),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5EC")]),
    ("LINEBELOW", (0, 0), (-1, -1), 0.3, colors.HexColor("#D5DDD0")),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(t)

out = LISTS / "AGELESS - WhatsApp Follow-up.pdf"
SimpleDocTemplate(str(out), pagesize=A4, leftMargin=14 * mm, rightMargin=14 * mm,
                  topMargin=14 * mm, bottomMargin=14 * mm,
                  title="AGELESS WhatsApp follow-up").build(story)
print(out)
