"""
Build a signed transfer instruction to the bank, on Consult for Africa letterhead.

One page, print, sign, stamp, hand or email to the branch. The constants below
are the whole letter: change them and rebuild for the next transfer.

Output: docs/bank-transfer-instruction-firstbank-cfa.pdf

Run:
  python3 scripts/build-bank-transfer-instruction.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "bank-transfer-instruction-firstbank-cfa.pdf"

# ---- the letter -----------------------------------------------------------
LETTER_DATE = "21 September 2026"
REFERENCE = "CFA/FIN/2026/014"

BANK = "First Bank of Nigeria Limited"
BRANCH_LINES = ["The Branch Manager", BANK, "Lagos, Nigeria"]

DEBIT_NAME = "Consult for Africa Management Services Limited"
DEBIT_ACCOUNT = "2048848941"

BENEFICIARY_NAME = "Consult for Africa Management Services Limited"
BENEFICIARY_BANK = "Zenith Bank Plc"
BENEFICIARY_ACCOUNT = "1312352157"

AMOUNT_FIGURES = "NGN 80,000.00"
AMOUNT_WORDS = "Eighty Thousand Naira Only"
NARRATION = "Inter-account transfer"

SIGNATORY = "Dr Debo Odulana"
SIGNATORY_TITLE = "Managing Director"

# ---- brand palette (source: docs/brand-guide-cfa.pdf) ---------------------
NAVY = HexColor("#0B3C5D")
GOLD = HexColor("#D4AF37")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
HAIR = HexColor("#E8EBF0")
SURFACE = HexColor("#F7F9FB")

PAGE_W, PAGE_H = A4
MX = 18 * 2.83465
MY = 22 * 2.83465


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10.5, leading=16, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=10)
    base.update(kw)
    return ParagraphStyle(name, **base)


P = style("p")
ADDR = style("addr", fontSize=10, leading=14, spaceAfter=0)
SUBJ = style("subj", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=NAVY,
             spaceBefore=6, spaceAfter=10)
CELL = style("cell", fontSize=10, leading=14, spaceAfter=0)
CELL_L = style("celll", fontSize=9, leading=14, textColor=MUTED, spaceAfter=0)
CELL_B = style("cellb", fontName="Helvetica-Bold", fontSize=10, leading=14, spaceAfter=0)
SIG = style("sig", fontSize=10, leading=14, spaceAfter=0)
SMALL = style("small", fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=0)


def letterhead(c, doc):
    c.saveState()
    logo = ImageReader(str(DOCS / "c4a-logo.png"))
    lw, lh = logo.getSize()
    h = 34.0
    w = h * lw / lh
    logo_top = PAGE_H - MY
    c.drawImage(logo, MX, logo_top - h, width=w, height=h, mask="auto")

    rule_y = logo_top - h - 14
    c.setFillColor(GOLD)
    c.rect(MX, rule_y, PAGE_W - 2 * MX, 2, fill=1, stroke=0)

    fy = MY + 4
    c.setStrokeColor(HAIR)
    c.line(MX, fy, PAGE_W - MX, fy)
    c.setFillColor(NAVY)
    c.setFont("Helvetica", 7.5)
    c.drawString(MX, fy - 13, "CONSULT FOR AFRICA")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(MX + 108, fy - 13,
                 "hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com")
    c.drawRightString(PAGE_W - MX, fy - 13, "Lagos and Abuja, Nigeria")
    c.restoreState()


def detail_table():
    rows = [
        ("Beneficiary", BENEFICIARY_NAME),
        ("Beneficiary bank", BENEFICIARY_BANK),
        ("Account number", BENEFICIARY_ACCOUNT),
        ("Amount", f"{AMOUNT_FIGURES} ({AMOUNT_WORDS})"),
        ("Narration", NARRATION),
    ]
    data = [[Paragraph(k, CELL_L), Paragraph(v, CELL_B if k in ("Amount", "Account number") else CELL)]
            for k, v in rows]
    t = Table(data, colWidths=[115, PAGE_W - 2 * MX - 115 - 24])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, HAIR),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def signature_block():
    line = "_________________________________"
    left = [
        Paragraph("Yours faithfully,", SIG),
        Spacer(1, 6),
        Paragraph(f"For: <b>{DEBIT_NAME}</b>", SIG),
        Spacer(1, 46),
        Paragraph(line, SIG),
        Spacer(1, 4),
        Paragraph(f"<b>{SIGNATORY}</b>", SIG),
        Paragraph(SIGNATORY_TITLE, SIG),
        Paragraph("Authorised signatory", SMALL),
    ]
    stamp = Table([[Paragraph("Company stamp", SMALL)]], colWidths=[150], rowHeights=[92])
    stamp.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, HAIR),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))
    t = Table([[left, stamp]], colWidths=[PAGE_W - 2 * MX - 174, 174])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (0, 0), "TOP"),
        ("VALIGN", (1, 0), (1, 0), "BOTTOM"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def build():
    top = PAGE_H - MY - 34 - 14 - 2 - 30   # below the gold rule
    frame = Frame(MX, MY + 26, PAGE_W - 2 * MX, top - MY - 26,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc = BaseDocTemplate(str(OUT), pagesize=A4,
                          title="Transfer instruction - Consult for Africa",
                          author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(id="letter", frames=[frame], onPage=letterhead)])

    story = []
    story.append(Paragraph(LETTER_DATE, ADDR))
    story.append(Paragraph(f"Our ref: {REFERENCE}", SMALL))
    story.append(Spacer(1, 22))
    for line in BRANCH_LINES:
        story.append(Paragraph(line, ADDR))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Dear Sir/Madam,", P))
    story.append(Paragraph(
        f"TRANSFER INSTRUCTION ON ACCOUNT {DEBIT_ACCOUNT}", SUBJ))
    story.append(Paragraph(
        f"We hereby authorise and instruct you to debit our account number "
        f"<b>{DEBIT_ACCOUNT}</b>, held in the name of {DEBIT_NAME}, with the sum of "
        f"<b>{AMOUNT_FIGURES} ({AMOUNT_WORDS})</b>, and to transfer the funds to the "
        f"account set out below.", P))
    story.append(Spacer(1, 4))
    story.append(detail_table())
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "Any charges arising on this transfer should be applied to the same account. "
        "This instruction is given in accordance with the mandate held on the account "
        "and is signed by the authorised signatory.", P))
    story.append(Paragraph(
        "Kindly confirm to us once the transfer has been effected.", P))
    story.append(Spacer(1, 16))
    story.append(signature_block())

    doc.build(story)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
