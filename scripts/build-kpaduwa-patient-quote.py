"""
A patient's written surgical quote from Dr Kpaduwa, issued after consultation.
Prices, inclusions and terms all come from scripts/lib_kpaduwa_rate_card.py, so
a quote can never disagree with the rate card.

Patient facing, so it carries the practice brand, Lyfe Plastics & Aesthetics by
MedLYFE (Debo, 22 Oct 2026), under the MedLYFE logo, with Dr Kpaduwa as the
named surgeon. Not CFA livery. Patient documents hold personal data, so they are
written to docs/lyfe-quotes/, which git ignores.

Run:
  python3 scripts/build-kpaduwa-patient-quote.py --name "Mrs A Bello" "Tummy tuck"
  python3 scripts/build-kpaduwa-patient-quote.py --name "Mrs A Bello" "Tummy tuck" "Liposuction, one trunk area"

The first operation named is not assumed to be the main one: the highest-priced
is charged in full and each further operation at COMBINATION.

No em dashes. NGN.
"""

from __future__ import annotations

import argparse
import re
from datetime import date, timedelta
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from svglib.svglib import svg2rlg

import lib_kpaduwa_rate_card as rc

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "lyfe-quotes"
LOGO = ROOT / "docs" / "ageless" / "print" / "logos" / "medlyfe.svg"
LOGO_H = 24

CENTRE = "MedLYFE Wellness and Longevity Centre"   # MEDLYFE_NAME in lib/lyfe.ts
BRAND = "Lyfe Plastics & Aesthetics by MedLYFE"
PHONE = "+234 911 981 9727"                         # MedLYFE's own line, from its brochure (19 Oct 2026)
EMAIL = "info@medlyfewellness.com"

INK = HexColor("#1C2414")
GREEN = HexColor("#4A6131")      # the MedLYFE logo
SAGE = HexColor("#A9B88F")
BRONZE = GREEN
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
RULE = HexColor("#DCE2D3")
SURFACE = HexColor("#F3F5EF")

PAGE_W, PAGE_H = A4
MARGIN = 50
FULLW = PAGE_W - 2 * MARGIN - 12   # the frame pads 6pt each side

for _name, _idx in [("Didot", 0), ("Didot-Italic", 1)]:
    try:
        pdfmetrics.registerFont(TTFont(_name, "/System/Library/Fonts/Supplemental/Didot.ttc", subfontIndex=_idx))
    except Exception:
        pass
DISPLAY = "Didot" if "Didot" in pdfmetrics.getRegisteredFontNames() else "Times-Roman"


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10, leading=14.5, textColor=BODY, alignment=TA_LEFT, spaceAfter=4)
    base.update(kw)
    return ParagraphStyle(name, **base)


TITLE = style("t", fontName=DISPLAY, fontSize=30, leading=34, textColor=INK, spaceAfter=6)
EYEBROW = style("e", fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=BRONZE, spaceBefore=9, spaceAfter=4)
P = style("p")
SMALL = style("s", fontSize=8.5, leading=12, textColor=MUTED)
CELL = style("c", fontSize=9, leading=12)
CELL_B = style("cb", fontSize=9.5, leading=13, fontName="Helvetica-Bold", textColor=INK)
CELL_R = style("cr", fontSize=9.5, leading=13, alignment=2)
CELL_BR = style("cbr", fontSize=9.5, leading=13, fontName="Helvetica-Bold", textColor=INK, alignment=2)
CELL_W = style("cw", fontSize=8.5, leading=11, fontName="Helvetica-Bold", textColor=white)
CELL_WR = style("cwr", fontSize=8.5, leading=11, fontName="Helvetica-Bold", textColor=white, alignment=2)

# The rate card's inclusions, worded for the patient.
INCLUDED = [
    "Your consultation, credited in full against surgery",
    "Your surgeon and a consultant anaesthetist",
    "Theatre, drugs and consumables",
    "Pre-operative blood tests and ECG",
    "Garments, dressings and take-home medication",
    "Home nursing in the first week",
    "Every follow-up visit for eight months, to discharge",
    "Return to theatre within 30 days, at no charge",
]
PRIVACY = [
    "One coordinator and one number for everything",
    "Messages to you never name the operation",
    "First or last list of the day, with arrival and exit outside clinic hours",
    "Dates planned around your time away",
    "No photograph is used for any purpose without your signed consent",
]
EXCLUDED = "Recovery residence (arranged at cost on request); travel; treatment of unrelated conditions found at pre-operative checks."


def naira(n: int) -> str:
    return f"N{n:,.0f}"


def priced(names: list[str]) -> list[tuple[str, int, int, int]]:
    """(name, list price, charged, stay) with the highest in full and the rest at COMBINATION."""
    lines = sorted((rc.by_name(n) for n in names), key=lambda r: -r["price"])
    out = []
    for i, r in enumerate(lines):
        charged = r["price"] if i == 0 else int(round(r["price"] * rc.COMBINATION))
        out.append((r["name"], r["price"], charged, r["nights"]))
    return out


def page(c, doc):
    c.saveState()
    c.setFillColor(GREEN); c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    logo = svg2rlg(str(LOGO))
    k = LOGO_H / logo.height
    logo.scale(k, k)
    renderPDF.draw(logo, c, MARGIN + 6, PAGE_H - 30 - LOGO_H)
    c.setFillColor(MUTED); c.setFont("Helvetica", 8)
    c.drawRightString(PAGE_W - MARGIN - 6, PAGE_H - 30 - LOGO_H / 2 - 3, "Private and confidential")
    c.setStrokeColor(RULE); c.setLineWidth(0.6); c.line(MARGIN + 6, 40, PAGE_W - MARGIN - 6, 40)
    c.drawString(MARGIN + 6, 26, f"{BRAND}  /  {PHONE}  /  {EMAIL}")
    c.drawRightString(PAGE_W - MARGIN - 6, 26, "Page %d" % doc.page)
    c.restoreState()


def build(name: str, operations: list[str], issued: date, ref: str, labels: dict[str, str] | None = None, tag: str = "",
          price: int | None = None) -> Path:
    lines = [((labels or {}).get(n, n), *rest) for n, *rest in priced(operations)]
    if price:   # agreed off the card for this patient; applies to the main operation
        n, _, _, nights = lines[0]
        lines[0] = (n, price, price, nights)
    total = sum(x[2] for x in lines)
    deposit = int(round(total * rc.DEPOSIT))
    valid = issued + timedelta(days=rc.QUOTE_DAYS)
    overnight = any(x[3] == rc.OVER_SIX for x in lines)
    day = lambda d: f"{d.day} {d:%B %Y}"

    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"quote-{issued:%Y%m%d}-{slug}{'-' + tag if tag else ''}.pdf"
    doc = SimpleDocTemplate(str(out), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=66, bottomMargin=50, title=f"Surgical quote, {name}",
                            author=BRAND)
    el = [Spacer(1, 4), Paragraph("Your surgical quote", TITLE),
          Paragraph(BRAND.replace("&", "&amp;"), style("sub", fontName="Helvetica-Bold", textColor=GREEN, fontSize=10.5, leading=14, spaceAfter=0)),
          Paragraph("Dr Chinwe Kpaduwa, plastic surgeon", style("sub2", textColor=MUTED, fontSize=9.5, leading=13)),
          Spacer(1, 8)]

    meta = [("Prepared for", name), ("Quote reference", ref), ("Issued", day(issued)),
            ("Valid until", day(valid))]
    cells = [[Paragraph(a, SMALL), Paragraph(b, CELL_B)] for a, b in meta]
    t = Table([cells[0] + cells[2], cells[1] + cells[3]], colWidths=[88, FULLW / 2 - 88, 70, FULLW / 2 - 70])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), SURFACE), ("LINEBEFORE", (0, 0), (0, -1), 3, GREEN),
                           ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                           ("LEFTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, 0), 9),
                           ("BOTTOMPADDING", (0, -1), (-1, -1), 9)]))
    el += [t, Spacer(1, 4)]

    el.append(Paragraph("YOUR OPERATION", EYEBROW))
    data = [[Paragraph("Operation", CELL_W), Paragraph("Stay", CELL_W), Paragraph("Price", CELL_WR)]]
    for n, full, charged, nights in lines:
        label = n if charged == full else f"{n}<br/><font size=8 color='#6B7280'>At the same sitting, {int(rc.COMBINATION * 100)}% of {naira(full)}</font>"
        stay = "Day case" if nights == rc.DAY else "Overnight if over six hours"
        data.append([Paragraph(label, CELL), Paragraph(stay, CELL), Paragraph(naira(charged), CELL_R)])
    data.append([Paragraph("Total, all inclusive", CELL_B), "", Paragraph(naira(total), CELL_BR)])
    t = Table(data, colWidths=[FULLW - 130 - 100, 130, 100])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 1), (-1, -2), 0.5, RULE),
        ("BACKGROUND", (0, -1), (-1, -1), SURFACE), ("LINEABOVE", (0, -1), (-1, -1), 1, GREEN),
    ]))
    el.append(t)
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "Nothing is added after surgery. "
        + ("Your operation is planned as a day case, with a night's stay included if surgery runs past six hours."
           if overnight else "Your operation is a day case: you go home the same day."), SMALL))

    el.append(Paragraph("WHAT THE PRICE INCLUDES", EYEBROW))
    gap = 14
    col = (FULLW - gap) / 2

    def ticks(head, items):
        tick = "<font color='#4A6131'>&#10003;</font>&nbsp; "
        data = [[Paragraph(head, CELL_W)]] + [[Paragraph(tick + x, CELL)] for x in items]
        t = Table(data, colWidths=[col])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), GREEN), ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 1), (-1, -1), 0.5, RULE),
        ]))
        return t

    t = Table([[ticks("Clinical", INCLUDED), ticks("Your privacy", PRIVACY)]], colWidths=[col + gap, col])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (0, 0), gap), ("RIGHTPADDING", (1, 0), (1, 0), 0),
                           ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    el.append(t)
    el.append(Spacer(1, 4))
    el.append(Paragraph("Not included: " + EXCLUDED, SMALL))

    el.append(Paragraph("BOOKING AND PAYMENT", EYEBROW))
    terms = [
        ("Deposit", f"{naira(deposit)} ({int(rc.DEPOSIT * 100)}%) holds your surgery date. The deposit is non-refundable."),
        ("Balance", f"{naira(total - deposit)}, due {rc.BALANCE_DAYS} days before surgery."),
        ("Changing your date", f"One change at no charge with {rc.BALANCE_DAYS} days' notice; your deposit moves to the new date."),
        ("Your date", "Agreed with your coordinator and secured by the deposit."),
        ("This quote", f"Held for {rc.QUOTE_DAYS} days, to {day(valid)}, subject to your pre-operative checks."),
    ]
    t = Table([[Paragraph(a, CELL_B), Paragraph(b, CELL)] for a, b in terms], colWidths=[118, FULLW - 118])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("LINEBELOW", (0, 0), (-1, -1), 0.5, RULE),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, RULE),
    ]))
    el.append(t)

    el.append(Spacer(1, 12))
    el.append(Paragraph(
        # The door to a concession, left ajar: never say discount (Debo, 22 Oct 2026).
        f"Your coordinator would be glad to go through this quote with you and see how we can make it "
        f"work for you, on {PHONE}.", P))
    el.append(Spacer(1, 10))
    el.append(Paragraph("Dr Chinwe Kpaduwa", style("sig", fontName=DISPLAY, fontSize=15, leading=18, textColor=INK)))
    el.append(Paragraph(f"Plastic surgeon, {BRAND}".replace("&", "&amp;"), SMALL))

    doc.build(el, onFirstPage=page, onLaterPages=page)
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True, help="Patient's name as it should appear")
    ap.add_argument("--ref", help="Quote reference; default MLQ-YYYYMMDD-INITIALS")
    ap.add_argument("--date", help="Issue date, YYYY-MM-DD; default today")
    ap.add_argument("--label", action="append", default=[], metavar="CARD LINE=WORDING",
                    help="Print a card line in the surgeon's own words, priced as that line")
    ap.add_argument("--price", type=int, help="Agreed naira price for the main operation, overriding the card")
    ap.add_argument("--tag", default="", help="Suffix for the file and reference when a patient has more than one version")
    ap.add_argument("operations", nargs="+", help="Line names exactly as on the rate card")
    a = ap.parse_args()
    issued = date.fromisoformat(a.date) if a.date else date.today()
    initials = "".join(w[0] for w in re.findall(r"[A-Za-z]+", a.name)).upper()
    ref = a.ref or f"MLQ-{issued:%Y%m%d}-{initials}" + (f"-{a.tag.upper()}" if a.tag else "")
    labels = dict(x.split("=", 1) for x in a.label)
    print(build(a.name, a.operations, issued, ref, labels, a.tag, a.price))
