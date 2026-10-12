"""
Build the final budget for Medlyfe Introduces, edition one.

CFA opened at 10 per cent of division revenue. Medbury's adviser countered with a
fixed base, 3 per cent of collected net revenue and 5 per cent of EBITDA over budget.
Itunu's own condition was narrower and more useful than her adviser's paper: revenue
share is fine if it is gated on hitting EBITDA.

This accepts her architecture whole and moves three numbers. Figures come from
scripts/lib_medbury_mgmt_fee.py so nothing in the text can drift from the model.

CFA house style, navy and gold. NGN. No em dashes.

Run:
  python3 scripts/build-medbury-aesthetics-management-terms.py
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "medlyfe-introduces-budget-cfa.pdf"

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib_medlyfe_introduces as L

M = 1_000_000

PAGE_W, PAGE_H = A4
MARGIN = 44
FULLW = PAGE_W - 2 * MARGIN

NAVY, GOLD, TEAL = HexColor("#0F3D2E"), HexColor("#C6A15B"), HexColor("#2F6B52")
BODY, MUTED = HexColor("#23302B"), HexColor("#7C7C74")
SURFACE, LIGHT = HexColor("#F5F2EA"), HexColor("#CBDDD1")
PANEL, CREAM = HexColor("#E9F0EA"), HexColor("#F6EFDD")
ALERT, RUST = HexColor("#FBF0E4"), HexColor("#B8763A")


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=8.2, leading=10.9, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=4)
    base.update(kw)
    return ParagraphStyle(name, **base)


TITLE = style("t", fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=NAVY, spaceAfter=2)
SUB = style("sub", fontSize=9, leading=12, textColor=TEAL, spaceAfter=7)
H = style("h", fontName="Helvetica-Bold", fontSize=9.2, leading=11.8, textColor=NAVY,
          spaceBefore=3.5, spaceAfter=1.5, keepWithNext=1)
P = style("p")
BUL = style("bul", leftIndent=10, bulletIndent=2, spaceAfter=2.4)
CELL = style("cell", fontSize=7.6, leading=10.0)
CELL_R = style("cellr", fontSize=7.6, leading=10.0, alignment=2)
CELL_B = style("cellb", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold", textColor=NAVY)
CELL_BR = style("cellbr", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold",
                textColor=NAVY, alignment=2)
CELL_W = style("cellw", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold", textColor=white)
CELL_WR = style("cellwr", fontSize=7.6, leading=10.0, fontName="Helvetica-Bold",
                textColor=white, alignment=2)
SMALL = style("small", fontSize=7.0, leading=9.4, textColor=MUTED)


def ngn(x):
    return f"{x/M:,.0f}"


def page_bg(c, doc):
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, PAGE_H - 26, PAGE_W, 26, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PAGE_H - 29, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 7.6)
    c.drawString(MARGIN, PAGE_H - 18, "MEDLYFE INTRODUCES")
    c.setFillColor(LIGHT); c.setFont("Helvetica", 7.6)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 18, "Edition one  /  the budget")
    c.setFillColor(GOLD); c.rect(MARGIN, 24, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.8)
    c.drawString(MARGIN, 14, "Private and confidential  /  Prepared for Dr Itunu Akinware and Dr Chinwe Kpaduwa")
    c.drawRightString(PAGE_W - MARGIN, 14, "Page %d" % doc.page)
    c.restoreState()


def card(text, bg=SURFACE, fg=BODY, rule=GOLD):
    st = ParagraphStyle("c", parent=P, textColor=fg, leftIndent=5, rightIndent=5,
                        spaceBefore=1, spaceAfter=1)
    t = Table([[Paragraph(text, st)]], colWidths=[FULLW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, rule),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def tbl(el, rows, labels, widths, total_row=False, aligns=None):
    if aligns is None:
        aligns = ["l"] * (len(labels) - 1)
    data = [[Paragraph(labels[0], CELL_W)] +
            [Paragraph(t, CELL_WR if aligns[j] == "r" else CELL_W)
             for j, t in enumerate(labels[1:])]]
    for i, r in enumerate(rows):
        emph = total_row and i == len(rows) - 1
        cells = [Paragraph(r[0], CELL_B if emph else CELL)]
        for j, v in enumerate(r[1:]):
            cells.append(Paragraph(v, (CELL_BR if emph else CELL_R) if aligns[j] == "r"
                                   else (CELL_B if emph else CELL)))
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1)
    st = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.0), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.0),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2 if total_row else -1), [white, SURFACE]),
    ]
    if total_row:
        st += [("BACKGROUND", (0, -1), (-1, -1), CREAM),
               ("LINEABOVE", (0, -1), (-1, -1), 0.9, GOLD)]
    t.setStyle(TableStyle(st))
    el.append(t)
    el.append(Spacer(1, 4))


def bullets(el, items):
    for i in items:
        el.append(Paragraph(i, BUL, bulletText="•"))











def n(x):
    return "{:,}".format(int(round(x)))


def build():
    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=30, bottomMargin=18,
                          title="Medlyfe Introduces - budget and plan", author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 18, FULLW, PAGE_H - 30 - 18, id="f")], onPage=page_bg)])
    el = []

    el.append(Paragraph("THE BUDGET AND THE PLAN", TITLE))
    el.append(Paragraph("Edition one. " + L.EVENT_DATE + ".", SUB))

    el.append(card(
        f"<b>NGN {n(L.PROGRAMME_TOTAL)}.</b> One evening, {L.ROOM_TOTAL} in the room, four "
        f"outlets covering it, and twelve pieces of film that carry Medlyfe to her next visit.",
        bg=CREAM))

    el.append(Paragraph("The budget", H))
    tbl(el, [[g, n(L.cost_group(g)), d] for g, d in [
                 ("The evening", "Venue, set, catering, crew, print and front of house"),
                 ("The campaign", "Media, the twelve piece series, logistics and licensing"),
                 ("Website and print", "Site, hosting and clinic collateral")]] +
            [["CFA operational cost", n(L.FEE),
              "Programme lead, event executive, coordination, travel and comms"],
             ["<b>Total</b>", f"<b>{n(L.PROGRAMME_TOTAL)}</b>", ""]],
        ["", "NGN", ""], [116, 86, FULLW - 202], aligns=["r", "l"], total_row=True)

    el.append(Paragraph("Media, agreed 28 September", H))
    tbl(el, [[w, o, wh, n(c)] for w, o, wh, _a, c in L.MEDIA_PLAN] +
            [["<b>Total</b>", "", "", f"<b>{n(L.MEDIA_NET)}</b>"]],
        ["When", "Outlet", "What", "NGN"], [66, 70, FULLW - 216, 80],
        aligns=["l", "l", "r"], total_row=True)
    el.append(card(
        f"Guardian Life is {L.MEDIA_ANCHOR_SHARE*100:.0f} per cent of the media and buys the "
        f"night itself. Everything from the sixteenth can be re-run. That one cannot.",
        bg=ALERT, rule=RUST))

    el.append(Paragraph("The plan", H))
    tbl(el, [["Week %d" % w, d, h] for w, d, h, _t in L.BUILD + L.AFTER],
        ["", "Dates", ""], [48, 86, FULLW - 134])

    el.append(Paragraph("Billing", H))
    tbl(el, [[w, f"{p*100:.0f}%", n(L.PROGRAMME_TOTAL * p)] for w, p, _d in L.TRANCHES],
        ["", "", "NGN"], [FULLW - 180, 72, 108], aligns=["r", "r"])
    el.append(Spacer(1, 3))
    el.append(card(
        "<b>Debo Odulana</b> &nbsp; Consult for Africa &nbsp; / &nbsp; +234 913 813 8553 "
        "&nbsp; / &nbsp; hello@consultforafrica.com", bg=NAVY, fg=white, rule=GOLD))

    doc.build(el)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
