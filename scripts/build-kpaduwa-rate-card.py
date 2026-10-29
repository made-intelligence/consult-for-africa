"""
Build Dr Kpaduwa's surgical rate card for Lagos: one all-in naira price per
operation, set for elite Nigerians aged 40 to 60 who want nobody to know they
have had work done. Prices come from scripts/lib_kpaduwa_rate_card.py, so the
card and anything published later cannot disagree.

CFA house style. No em dashes. No provider named among the Lagos comparators,
because one of them is a live CFA prospect.

Run:
  python3 scripts/build-kpaduwa-rate-card.py
"""

from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image, ImageChops, ImageDraw
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Frame, KeepTogether, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

import lib_kpaduwa_rate_card as rc

M_ = rc.M

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "kpaduwa-rate-card-cfa.pdf"
NAMED = DOCS / "Lyfe Plastics & Aesthetics by MedLYFE - Lagos Rate Card (Draft).pdf"
TITLE = "Rate Card, Lagos"

NAVY = HexColor("#0B3C5D")
DEEP_NAVY = HexColor("#081521")
GOLD = HexColor("#D4AF37")
TEAL = HexColor("#1F7A8C")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
SURFACE = HexColor("#F1F5F9")
LIGHT = HexColor("#C9D6E0")
PANEL = HexColor("#EAF1F4")
CREAM_BG = HexColor("#FBF6E6")

PAGE_W, PAGE_H = A4
MARGIN = 46
FULLW = PAGE_W - 2 * MARGIN


def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10.5, leading=15, textColor=BODY, alignment=TA_LEFT, spaceAfter=6)
    base.update(kw)
    return ParagraphStyle(name, **base)


EYEBROW = style("eyebrow", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=GOLD, spaceAfter=3)
H1 = style("h1", fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=NAVY, spaceBefore=8, spaceAfter=6)
H2 = style("h2", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=TEAL, spaceBefore=7, spaceAfter=3)
P = style("p")
LEDE = style("lede", fontSize=11, leading=16, textColor=HexColor("#374151"))
SMALL = style("small", fontSize=8.5, leading=12, textColor=MUTED)
CELL = style("cell", fontSize=8.8, leading=11.5)
CELL_R = style("cellr", fontSize=8.8, leading=11.5, alignment=2)
CELL_B = style("cellb", fontSize=8.8, leading=11.5, fontName="Helvetica-Bold", textColor=NAVY)
CELL_BR = style("cellbr", fontSize=8.8, leading=11.5, fontName="Helvetica-Bold", textColor=NAVY, alignment=2)
CELL_N = style("celln", fontSize=7.8, leading=10, textColor=MUTED)
CELL_W = style("cellw", fontSize=8.8, leading=11.5, fontName="Helvetica-Bold", textColor=white)
CELL_WR = style("cellwr", fontSize=8.8, leading=11.5, fontName="Helvetica-Bold", textColor=white, alignment=2)


# ------------------------------------------------------------------ the cover
# Lyfe Plastics & Aesthetics by MedLYFE, not CFA livery: the near-black of her studio
# portrait's backdrop, Didot from the Lyfe creative set, bronze accents. The
# portrait is faded into the ground so there is no seam. No chevrons.
COVER_GROUND = (6, 9, 13)
BRONZE_LT = HexColor("#C9A27A")
STONE = HexColor("#B9B3A9")
PORTRAIT = ROOT / "public" / "lyfe" / "chinwe-portrait.jpg"
for _name, _idx in [("Didot", 0), ("Didot-Italic", 1)]:
    try:
        pdfmetrics.registerFont(TTFont(_name, "/System/Library/Fonts/Supplemental/Didot.ttc", subfontIndex=_idx))
    except Exception:
        pass
DISPLAY = "Didot" if "Didot" in pdfmetrics.getRegisteredFontNames() else "Times-Roman"
DISPLAY_I = "Didot-Italic" if "Didot-Italic" in pdfmetrics.getRegisteredFontNames() else "Times-Italic"


def cover_art() -> str:
    """The page ground with the portrait faded in from the right, as one image."""
    scale = 3
    W, H = int(PAGE_W * scale), int(PAGE_H * scale)
    page = Image.new("RGB", (W, H), COVER_GROUND)
    src = Image.open(PORTRAIT).convert("RGB")
    pw = int(W * 0.66)
    ph = int(pw * src.height / src.width)
    src = src.resize((pw, ph), Image.LANCZOS)
    mask = Image.new("L", (pw, ph), 255)
    md = ImageDraw.Draw(mask)
    fade_x, fade_y = int(pw * 0.42), int(ph * 0.18)
    for x in range(fade_x):
        a = int(255 * (x / fade_x) ** 1.6)
        md.line([(x, 0), (x, ph)], fill=a)
    top = Image.new("L", (pw, ph), 255)
    td = ImageDraw.Draw(top)
    for y in range(fade_y):
        td.line([(0, y), (pw, y)], fill=int(255 * (y / fade_y) ** 1.4))
    mask = ImageChops.multiply(mask, top)
    page.paste(src, (W - pw, H - ph), mask)
    out = Path(tempfile.gettempdir()) / "kpaduwa-rate-card-cover.jpg"
    page.save(out, quality=90)
    return str(out)


def cover_bg(c, doc):
    c.saveState()
    c.drawImage(cover_art(), 0, 0, width=PAGE_W, height=PAGE_H)
    x = MARGIN
    c.setFillColor(BRONZE_LT); c.setFont("Helvetica-Bold", 8.5)
    c.drawString(x, PAGE_H - 70, "LYFE PLASTICS & AESTHETICS BY MEDLYFE")
    c.setFillColor(STONE); c.setFont("Helvetica", 8.5)
    c.drawString(x, PAGE_H - 84, "Dr Chinwe Kpaduwa, plastic surgeon")

    c.setFillColor(white); c.setFont(DISPLAY, 58)
    c.drawString(x - 2, PAGE_H - 330, "Rate Card")
    c.setFillColor(BRONZE_LT); c.setFont(DISPLAY_I, 58)
    c.drawString(x - 2, PAGE_H - 394, "Lagos")
    c.setFillColor(BRONZE_LT); c.rect(x, PAGE_H - 426, 36, 1.2, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica", 12)
    c.drawString(x, PAGE_H - 450, "Surgery and dermatology")
    c.setFillColor(STONE); c.setFont("Helvetica", 10)
    c.drawString(x, PAGE_H - 466, "For clients aged 40 to 60 who want it kept private")

    y = 178
    for lb, v in [("PREPARED FOR", "Dr Chinwe Kpaduwa"), ("PREPARED BY", "Consult for Africa"),
                  ("DATE", "16 October 2026"), ("STATUS", "Draft 2. Not for client use")]:
        c.setFillColor(BRONZE_LT); c.setFont("Helvetica-Bold", 7)
        c.drawString(x, y, lb)
        c.setFillColor(white); c.setFont("Helvetica", 9.5)
        c.drawString(x, y - 12, v)
        y -= 30
    c.setFillColor(STONE); c.setFont("Helvetica", 7.5)
    c.drawString(x, 30, "Private and confidential")
    c.restoreState()


def content_bg(c, doc):
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, PAGE_H - 34, PAGE_W, 34, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PAGE_H - 37, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 8.5); c.drawString(MARGIN, PAGE_H - 23, "CONSULT FOR AFRICA")
    c.setFillColor(LIGHT); c.setFont("Helvetica", 8.5)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 23, "Lyfe Plastics & Aesthetics by MedLYFE  /  " + TITLE)
    c.setFillColor(GOLD); c.rect(MARGIN, 30, 24, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 8)
    c.drawString(MARGIN, 18, "Private and confidential  /  Draft for Dr Kpaduwa")
    c.drawRightString(PAGE_W - MARGIN, 18, "Page %d" % doc.page)
    try:
        _ic = ImageReader(str(DOCS / "c4a-icon.png"))
        _iw, _ih = _ic.getSize(); _h = 22.0; _w = _h * _iw / _ih
        c.drawImage(_ic, PAGE_W - MARGIN - _w, PAGE_H - 61, width=_w, height=_h, mask="auto")
    except Exception:
        pass
    c.restoreState()


def card(text, bg=SURFACE, fg=BODY):
    st = ParagraphStyle("c", parent=P, textColor=fg, leftIndent=8, rightIndent=8, spaceBefore=3, spaceAfter=3)
    t = Table([[Paragraph(text, st)]], colWidths=[FULLW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg), ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 11), ("RIGHTPADDING", (0, 0), (-1, -1), 11),
    ]))
    return t


def bullet(text):
    return Paragraph("<font color='#D4AF37'>&bull;</font>&nbsp; " + text,
                     ParagraphStyle("b", parent=P, leftIndent=12, spaceAfter=3))


def sec(el, num, eyebrow, title):
    el.append(CondPageBreak(160))
    el.append(Spacer(1, 10))
    el.append(Paragraph(num + "  /  " + eyebrow, EYEBROW))
    el.append(Paragraph(title, H1))


def m(n):
    return rc.ngn(n)


def nights(n):
    return "Day case" if n == rc.DAY else "Night if over 6 hrs"


# ------------------------------------------------------------------ the card
def rate_table(group, rows, width):
    widths = [width - 62 - 52, 62, 52]
    data = [[Paragraph(group, CELL_W), Paragraph("All-in, from", CELL_WR), Paragraph("Stay", CELL_W)]]
    for r in rows:
        first = [Paragraph(r["name"] + (" *" if r["floored"] else ""), CELL)]
        if r["note"]:
            first.append(Paragraph(r["note"], CELL_N))
        data.append([first, Paragraph(m(r["price"]), CELL_BR), Paragraph(nights(r["nights"]), CELL)])
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SURFACE]),
    ]))
    return t


def kv(rows, label_w=120, head=None):
    """Two-column label / fact table: the scannable replacement for bullets."""
    data = []
    if head:
        data.append([Paragraph(head[0], CELL_W), Paragraph(head[1], CELL_W)])
    data += [[Paragraph(a, CELL_B), Paragraph(b, CELL)] for a, b in rows]
    t = Table(data, colWidths=[label_w, FULLW - label_w])
    stl = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, LIGHT),
    ]
    if head:
        stl += [("BACKGROUND", (0, 0), (-1, 0), NAVY), ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD)]
    t.setStyle(TableStyle(stl))
    return t


def tiles(items):
    """Big-number tiles: (figure, label)."""
    big = style("big", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=NAVY, spaceAfter=2)
    lab = style("lab", fontSize=8.5, leading=11, textColor=MUTED, spaceAfter=0)
    w = FULLW / len(items)
    t = Table([[[Paragraph(f, big), Paragraph(l, lab)] for f, l in items]], colWidths=[w] * len(items))
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE), ("LINEABOVE", (0, 0), (-1, 0), 3, GOLD),
        ("LINEAFTER", (0, 0), (-2, -1), 4, white),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    return t


def build():
    rows = rc.rows()
    eyes = rc.by_name("Upper and lower eyelids")["price"]
    face = rc.by_name("Deep plane face and neck lift")["price"]
    tummy = rc.by_name("Tummy tuck")["price"]
    toxin = next(r["price"] for r in rc.derm_rows() if r["name"] == "Anti-wrinkle, per unit")
    lp_pct = int(rc.LAGOS_PREMIUM * 100)
    n_floored = sum(1 for r in rows if r["floored"])
    deposit_pct = int(rc.DEPOSIT * 100)
    combo_pct = int(rc.COMBINATION * 100)
    ratio_pct = int(rc.RATIO * 100)

    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=52, bottomMargin=42, title=TITLE, author="Consult for Africa")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[Frame(MARGIN, 150, FULLW, PAGE_H - 300, id="cover")], onPage=cover_bg),
        PageTemplate(id="content", frames=[Frame(MARGIN, 42, FULLW, PAGE_H - 52 - 42 - 24, id="content")], onPage=content_bg),
    ])

    # ---------------------------------------------------------------- cover
    el = [Spacer(1, 1), NextPageTemplate("content"), PageBreak()]

    # ----------------------------------------------------------------- memo
    for lb, v in [("To", "Dr Chinwe Kpaduwa"), ("From", "Dr Debo Odulana, Founding Partner, Consult for Africa"),
                  ("Date", "16 October 2026"), ("Subject", "Lagos rate card, revised for your notes of 15 October")]:
        el.append(Paragraph(f"<font color='#6B7280'>{lb}:</font>&nbsp; {v}", style("memo", spaceAfter=2)))
    el.append(Spacer(1, 12))

    # ------------------------------------------- governing thought + SCQ
    el.append(Paragraph("RECOMMENDATION", EYEBROW))
    el.append(Paragraph(
        f"One all-in naira price per operation and treatment: {ratio_pct}% of Beverly Hills, at least "
        f"{lp_pct}% above the Lagos top, privacy included, never published.", H1))
    el.append(Spacer(1, 6))
    el.append(tiles([(m(eyes), "Upper and lower eyelids"), (m(face), "Deep plane face and neck lift"),
                     (m(tummy), "Tummy tuck"), (m(toxin), "Anti-wrinkle, per unit")]))
    el.append(Spacer(1, 14))
    el.append(kv([
        ("Situation", "You begin operating in Lagos for Nigerians aged 40 to 60 who want treatment kept private."),
        ("Complication", "No surgical prices exist. Lagos providers mostly will not quote. The client's alternative is surgery abroad."),
        ("Question", "What should each operation cost, include, and how should it be quoted?"),
    ], label_w=90))
    el.append(Spacer(1, 14))
    el.append(Paragraph("THE ANSWER IN THREE POINTS", EYEBROW))
    el.append(kv([
        ("1  Price level", f"Surgery and dermatology at {ratio_pct}% of Beverly Hills; at least {lp_pct}% above the highest Lagos quote"),
        ("2  Inclusions", "Everything in one price, privacy included; no bill after surgery"),
        ("3  Quoting", f"Estimate on the phone; fixed written quote after consultation, valid {rc.QUOTE_DAYS} days; prices never published"),
    ]))
    el.append(Spacer(1, 14))
    el.append(card("Action: four decisions in section 04. Quotes to this week's patients go out now.", bg=CREAM_BG))

    # ------------------------------------------------- your notes, 15 October
    el.append(PageBreak())
    sec(el, "00", "YOUR NOTES OF 15 OCTOBER", "What changed in this draft.")
    el.append(kv([
        ("Anti-wrinkle", f"Per unit, {m(toxin)}. Per-area prices removed."),
        ("Bio-remodelling", "Renamed skin bio-remodelling: an injectable hyaluronic acid that hydrates and firms the skin rather than filling (Profhilo type). Remove if you do not offer it."),
        ("Threads", "Removed from the card."),
        ("Overnight stay", "Every line is a day case. Mommy makeover marked overnight only if over six hours."),
        ("Extended tummy tuck", "Removed. It carries the incision round the flanks for loose skin past the hips, which is the weight-loss lift already left off."),
        ("Follow-up", "Your schedule: weekly from one week until drains are out, two weeks where needed, then four weeks, eight weeks, four months, eight months, discharge."),
        ("Photographs", "Used for marketing only with the patient's signed photography consent."),
        ("Publication", "Prices never published. Estimates to callers; final quote after consultation to patients going ahead."),
        ("Lagos floor", f"At least {lp_pct}% above the highest Lagos quote on every line that has one. {n_floored} surgical lines raised."),
        ("MDCN pending", "This week's patients receive their quote now. See section 04."),
    ], label_w=120, head=("Your note", "Change")))

    # ------------------------------------------------------ 01 price level
    el.append(PageBreak())
    sec(el, "01", "PRICE LEVEL", f"{ratio_pct}% of Beverly Hills, never below the Lagos top.")
    el.append(kv([
        ("Comparison", "London, Dubai, Los Angeles. Not Lagos clinics."),
        ("Basis", f"Your lowest Beverly Hills fee plus theatre and anaesthesia, at N{rc.FX:,}/$"),
        ("Floor", f"{lp_pct}% above the highest Lagos quote held. {n_floored} lines raised to meet it (marked *)."),
        ("Dermatology", "Same rule on your Beverly Hills medspa schedule. Earlier list price kept only where no benchmark exists."),
        ("Not on the card", "Buttock fat transfer; lifts after major weight loss, including extended tummy tuck; thread lifts. IPL and ablative laser, pending your view."),
    ]))
    el.append(Spacer(1, 10))
    el.append(Paragraph("PREMIUM OVER LAGOS CLINICS", EYEBROW))
    prem = rc.premium_rows()
    surg = [p for p in prem if p[1] == "Surgery"]
    nons = [p for p in prem if p[1] == "Dermatology"]
    s_lo = min(rc.premium(p[2], p[4]) for p in surg); s_hi = max(rc.premium(p[2], p[4]) for p in surg)
    c_lo = min(rc.premium(p[2], p[3]) for p in surg); c_hi = max(rc.premium(p[2], p[3]) for p in surg)
    n_lo = min(rc.premium(p[2], p[4]) for p in nons); n_hi = max(rc.premium(p[2], p[3]) for p in nons)
    cons = next(p for p in prem if p[1] == "Consultation")
    el.append(kv([
        ("Surgery", f"{s_lo:+d}% to {s_hi:+d}% over the most expensive Lagos quote; {c_lo:+d}% to {c_hi:+d}% over the cheapest".replace("+0%", "0%")),
        ("Consultation", f"{cons[2] // cons[4]}x to {cons[2] // cons[3]}x the Lagos fee"),
        ("Dermatology", f"{n_lo:+d}% to {n_hi:+d}% over Lagos"),
    ]))
    el.append(Spacer(1, 8))

    def pct(v):
        col = "#B91C1C" if v < 0 else "#0B3C5D"
        return Paragraph(f"<font color='{col}'>{'+' if v > 0 else ''}{v}%</font>", CELL_BR)

    data = [[Paragraph(h, CELL_WR if i not in (0, 5) else CELL_W) for i, h in enumerate(
        ["Item", "Lagos low", "Lagos high", "Ours", "vs lowest / highest", "Provider"])]]
    styl = []
    kind = None
    for item, k, ours, lo, hi, prov, note in prem:
        if k != kind:
            kind = k
            data.append([Paragraph(k, CELL_B), "", "", "", "", ""])
            styl.append(("BACKGROUND", (0, len(data) - 1), (-1, len(data) - 1), PANEL))
            styl.append(("SPAN", (0, len(data) - 1), (-1, len(data) - 1)))
        first = [Paragraph(item, CELL)] + ([Paragraph(note, CELL_N)] if note else [])
        a, b = rc.premium(ours, lo), rc.premium(ours, hi)
        both = Table([[pct(a), pct(b)]], colWidths=[44, 44])
        both.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                                  ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
        data.append([first, Paragraph(m(lo), CELL_R), Paragraph(m(hi), CELL_R), Paragraph(m(ours), CELL_BR),
                     both, Paragraph(prov, CELL)])
    t = Table(data, colWidths=[FULLW - 66 * 3 - 98 - 52, 66, 66, 66, 98, 52], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LIGHT),
    ] + styl))
    el.append(t)
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "Source: team price comparison report, October 2026. Providers in Appendix B; method in Appendix A.", SMALL))

    # the card, on its own page, two columns
    el.append(PageBreak())
    el.append(Paragraph("THE CARD", EYEBROW))
    el.append(Paragraph("All-in prices, from. The written quote after consultation is fixed.", H1))
    gap = 12
    half = (FULLW - gap) / 2
    groups = {g: [r for r in rows if r["group"] == g] for g, _ in rc.GROUPS}
    names = [g for g, _ in rc.GROUPS]
    left = [rate_table(names[0], groups[names[0]], half)]
    right = []
    for g in names[1:]:
        right += [rate_table(g, groups[g], half), Spacer(1, 8)]
    two = Table([[left, right]], colWidths=[half, half], hAlign="LEFT")
    two.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                             ("RIGHTPADDING", (0, 0), (0, 0), gap), ("RIGHTPADDING", (1, 0), (1, 0), 0)]))
    el.append(two)
    el.append(Spacer(1, 6))
    el.append(Paragraph(
        f"* Raised to {lp_pct}% above the highest Lagos quote. Everything is outpatient; an overnight stay only where surgery runs past six hours. Quoted after consultation only: "
        + "; ".join(x.lower() for x in rc.CASE_BY_CASE) + ". Dermatology on the next page.", SMALL))

    # the dermatology card
    el.append(PageBreak())
    el.append(Paragraph("THE CARD: DERMATOLOGY", EYEBROW))
    el.append(Paragraph(f"Per treatment, product included. Consultation N{rc.DERM_CONSULT:,}, credited against treatment.", H1))
    drows = rc.derm_rows()
    data = [[Paragraph(h, CELL_WR if i in (1, 2, 3) else CELL_W) for i, h in enumerate(
        ["Treatment", "Price", "Lagos top", "Old list", "Change"])]]
    styl = []
    for g, _ in rc.DERM:
        data.append([Paragraph(g, CELL_B), "", "", "", ""])
        styl += [("BACKGROUND", (0, len(data) - 1), (-1, len(data) - 1), PANEL), ("SPAN", (0, len(data) - 1), (-1, len(data) - 1))]
        for r in [x for x in drows if x["group"] == g]:
            first = Paragraph(r["name"] + (f" <font size=7.5 color='#6B7280'>&nbsp;{r['note']}</font>" if r["note"] else ""), CELL)
            lag = f"{m(r['lagos'])} ({r['prov']})" if r["lagos"] else ""
            web = m(r["website"]) if r["website"] else "New"
            if r["website"] and r["website"] != r["price"]:
                chg = Paragraph(f"<font color='#B45309'>{'+' if r['price'] > r['website'] else ''}{m(r['price'] - r['website'])}</font>", CELL)
            else:
                chg = Paragraph("", CELL)
            data.append([first, Paragraph(m(r["price"]), CELL_BR), Paragraph(lag, CELL_R), Paragraph(web, CELL_R), chg])
    t = Table(data, colWidths=[FULLW - 70 - 96 - 70 - 70, 70, 96, 70, 70], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LIGHT),
    ] + styl))
    el.append(t)
    el.append(Spacer(1, 6))
    el.append(Paragraph(
        "Priced after consultation: " + "; ".join(x.lower() for x in rc.DERM_ON_CONSULT) + ". "
        "Left off pending your view: IPL and ablative laser resurfacing (pigmentation risk on darker skin); vitamin infusions.", SMALL))

    # ------------------------------------------------------ 02 inclusions
    el.append(PageBreak())
    sec(el, "02", "INCLUSIONS", "Surgery: everything in one price, privacy included.")
    clinical = [
        f"Consultation (N{rc.CONSULT_FEE:,}), credited in full",
        "Surgeon and consultant anaesthetist",
        "Theatre, drugs and consumables",
        "Pre-operative bloods and ECG",
        "Overnight room if surgery passes 6 hours",
        "Garments, dressings, take-home medication",
        "Reviews: weekly to drain removal, 2 wks if needed, 4 wks, 8 wks, 4 mths, 8 mths, discharge",
        "Return to theatre within 30 days: no fee",
    ]
    privacy = [
        "Private consultation room",
        "One coordinator, one number",
        "Messages never name the operation",
        "First or last list of the day",
        "Arrival and exit outside clinic hours",
        "Home nursing, first week",
        "Dates timed to the client's time away",
        "Marketing photographs only with signed consent",
    ]
    data = [[Paragraph("Clinical", CELL_W), Paragraph("Privacy", CELL_W)]]
    for a, b in zip(clinical, privacy):
        data.append([Paragraph("&#10003;&nbsp; " + a, CELL), Paragraph("&#10003;&nbsp; " + b, CELL)])
    t = Table(data, colWidths=[FULLW / 2, FULLW / 2])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SURFACE]),
    ]))
    el.append(t)
    el.append(Spacer(1, 8))
    el.append(kv([("Excluded", "Recovery residence (at cost, on request); travel; unrelated conditions found at pre-op")]))

    # ------------------------------------------------------ 03 quoting and terms
    sec(el, "03", "QUOTING AND TERMS", "Private, written, fixed.")
    el.append(kv([
        ("Callers", "Coordinators give an estimate range by phone. No price in any advert, post or web page."),
        ("Final quote", "In writing, after consultation, to patients who want to go ahead"),
        ("Combined", f"Highest-priced in full; each further operation at {combo_pct}%"),
        ("Quote", f"Fixed; valid {rc.QUOTE_DAYS} days"),
        ("Deposit", f"{deposit_pct}% to hold the date; non-refundable"),
        ("Balance", f"{rc.BALANCE_DAYS} days before surgery"),
        ("Date change", f"One free change, {rc.BALANCE_DAYS} days' notice; deposit transfers"),
        ("Review", f"Naira moves 10% from N{rc.FX:,}/$, or every six months"),
    ]))

    # ------------------------------------------------------ 04 decisions
    sec(el, "04", "DECISIONS REQUIRED", "Four items; quoting does not wait for them.")
    el.append(kv([
        ("Hospital rates", "Partner hospital per-case charges being collected. Any line they do not cover will be flagged."),
        ("MDCN registration", "Quotes issue now, including to patients seen this week, and do not mention registration. Internally, no deposit is taken and no date set until it is held."),
        ("Implants", "Confirm your range and landed cost. Breast prices assume your standard implant."),
        ("Dermatology clinician", "Name the registered clinician who delivers dermatology under your protocols."),
    ], head=("Item", "What is needed")))

    # ------------------------------------------------- appendix A: methodology
    el.append(PageBreak())
    el.append(Paragraph("APPENDIX A  /  METHODOLOGY", EYEBROW))
    el.append(Paragraph(f"Each price is {ratio_pct}% of Beverly Hills all-in, rounded up, floored at the Lagos top.", H1))
    el.append(Paragraph("Sources", H2))
    el.append(kv([
        ("Surgeon fees", "Your Beverly Hills recommended professional fee schedule (KPPS pro forma)"),
        ("Theatre, anaesthesia", "KPPS time-tiered schedule: $2,100 for 1 hour to $8,600 for 7 hours"),
        ("Lagos prices", "Team price comparison report, October 2026: seven providers (Appendix B)"),
        ("Exchange rate", f"N{rc.FX:,} to the dollar"),
    ], label_w=130))
    el.append(Paragraph("Steps", H2))
    el.append(kv([
        ("1  Beverly Hills all-in", "Lowest recommended professional fee plus the lowest theatre and anaesthesia tier for the usual duration"),
        ("2  Convert", f"At N{rc.FX:,}/$"),
        ("3  Apply ratio", f"{ratio_pct}%"),
        ("4  Round up", "To the next N250,000; N50,000 below N2m"),
        ("5  Floor", f"Raise to {lp_pct}% above the highest comparable Lagos quote, where one exists, then round up"),
        ("6  Comparators", "From-prices and grouped budgets are not used; surgery is compared with surgery only"),
        ("7  Dermatology", "Steps 1 to 5 on the medspa schedule, no theatre tier. No benchmark: website price kept"),
    ], label_w=130))
    ex = rc.by_name("Breast reduction")
    bh_ngn = ex["bh_usd"] * rc.FX
    el.append(Paragraph("Worked example: breast reduction", H2))
    el.append(kv([
        ("Beverly Hills all-in", f"$10,000 fee + $4,350 theatre and anaesthesia = ${ex['bh_usd']:,}"),
        ("In naira", f"${ex['bh_usd']:,} x N{rc.FX:,} = {m(bh_ngn)}"),
        (f"At {ratio_pct}%", f"{m(int(bh_ngn * rc.RATIO))}, rounded up to {m(rc._round_up(bh_ngn * rc.RATIO))}"),
        ("Floor", f"Highest Lagos quote N10.5m (Provider B), plus {lp_pct}% is {m(int(10.5 * M_ * (1 + rc.LAGOS_PREMIUM)))}, so raised"),
        ("Card price", m(ex["price"])),
    ], label_w=130))
    el.append(Paragraph(f"Why {ratio_pct}%", H2))
    shares = [("Breast reduction", 6.25, 10.5), ("Breast lift", 9, 10.5), ("Arm lift", 9, 10.5), ("Mommy makeover", 7.1, 17)]
    data = [[Paragraph(h, CELL_WR if i else CELL_W) for i, h in enumerate(
        ["Operation", "Lagos quotes", "Beverly Hills, naira", "Lagos as % of Beverly Hills", "This card"])]]
    lo_all, hi_all = 100, 0
    for n, lo, hi in shares:
        r = rc.by_name(n); bh = r["bh_usd"] * rc.FX
        a, b = round(lo * M_ / bh * 100), round(hi * M_ / bh * 100)
        lo_all, hi_all = min(lo_all, a), max(hi_all, b)
        data.append([Paragraph(n, CELL), Paragraph(r["lagos"], CELL_R), Paragraph(m(bh), CELL_R),
                     Paragraph(f"{a}% to {b}%", CELL_R), Paragraph(f"{round(r['price'] / bh * 100)}%", CELL_BR)])
    t = Table(data, colWidths=[FULLW - 4 * 92, 92, 92, 92, 92])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SURFACE]),
    ]))
    el.append(t)
    el.append(Spacer(1, 6))
    el.append(bullet(f"Lagos quotes sit at {lo_all}% to {hi_all}% of Beverly Hills all-in."))
    el.append(bullet(f"{ratio_pct}% is in the upper part of that range; the floor keeps every line at least {lp_pct}% above Lagos where Lagos is already higher."))
    el.append(bullet("Theatre tiers for operations not in the KPPS case table are read from its time tiers at the usual duration."))

    # --------------------------------------------- appendix B: local comparison
    el.append(PageBreak())
    el.append(Paragraph("APPENDIX B  /  LOCAL COMPARISON", EYEBROW))
    n_used = sum(1 for q in rc.LAGOS_QUOTES if q[4])
    el.append(Paragraph(f"{n_used} of the report's {len(rc.LAGOS_QUOTES)} quotes are fair comparators.", H1))
    el.append(kv([
        ("Source", "Team price comparison report, October 2026"),
        ("Providers", "Seven. Hospitals: B, F. Aesthetics clinics: A, C, D, E. Medical aesthetics centre, no plastic surgeon: G."),
        ("No price given", "Three providers would not quote without consultation (C in part, D, E)"),
        ("Consultation fees", f"Lagos N30,000 to N50,000; your consultation N{rc.CONSULT_FEE:,}"),
        ("Ticked rows", "Set the floor in step 5. G sets the dermatology floor only; it has no plastic surgeon."),
    ], label_w=130))
    el.append(Spacer(1, 10))
    data = [[Paragraph(h, CELL_W) for h in ["Provider", "Procedure", "Quote", "Basis", "Use on the card"]]]
    styl = []
    for i, (code, proc, quote, basis, used, reason) in enumerate(rc.LAGOS_QUOTES, start=1):
        data.append([Paragraph(rc.provider_label(code), CELL), Paragraph(proc, CELL),
                     Paragraph(quote, CELL_BR if used else CELL_R), Paragraph(basis, CELL_N),
                     Paragraph(("&#10003;&nbsp; " if used else "") + reason, CELL_B if used else CELL_N)])
    t = Table(data, colWidths=[62, 140, 76, FULLW - 62 - 140 - 76 - 120, 120], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("LINEBELOW", (0, 0), (-1, 0), 2, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SURFACE]),
    ]))
    el.append(t)

    doc.build(el)
    shutil.copyfile(OUT, NAMED)
    print(f"wrote {OUT}\nwrote {NAMED}")


if __name__ == "__main__":
    build()
