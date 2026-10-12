"""
ilé investor deck, twenty landscape slides, in the ilé brand (not CFA's).

Every number comes from scripts/ile_model.py. Palette and type follow the July
product brief: green #0F7C63, amber #E9A23B as the single action colour, warm
grounds, an old-style serif for display (Newsreader) and a humanist sans for
body (Source Sans 3). Both faces carry the naira sign.

    python3 scripts/build-ile-investor-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_deck import PAGE_W, PAGE_H, wrap  # noqa: E402
import ile_model as M  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "scripts" / "fonts" / "ile"
COMPS = ROOT / "scripts" / "assets" / "ile-comps"
DOCS_DIR = ROOT / "docs"
TEAM_LOGOS = ROOT / "scripts" / "assets" / "ile-team" / "logos"
OUT = ROOT / "docs" / "Ile - Investor Presentation (Deck).pdf"

for name, f in [("Serif", "Newsreader-Regular.ttf"), ("Serif-SB", "Newsreader-SemiBold.ttf"),
                ("Serif-I", "Newsreader-Italic.ttf"), ("Sans", "SourceSans3-Regular.ttf"),
                ("Sans-SB", "SourceSans3-SemiBold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / f)))

# ---- ilé palette, sampled from the July brief ------------------------------
GREEN = HexColor("#0F7C63")
AMBER = HexColor("#E9A23B")
INK = HexColor("#20302A")
BODY = HexColor("#46524C")
MUTED = HexColor("#7A847E")
GROUND = HexColor("#FCFBF8")
GROUND2 = HexColor("#FAF6EE")
GROUND3 = HexColor("#F4EDE1")
GTINT = HexColor("#E3EDE7")
ATINT = HexColor("#F7EBD7")
RULE = HexColor("#E7E0D2")
DEEP = HexColor("#0B4A3B")       # dark green for the back cover

# chart series, validated for colour-vision separation on the light ground
SERIES = [("Care at home", HexColor("#12896C")), ("Residence", HexColor("#E09A2E")),
          ("Palliative wing", HexColor("#3F68B5")), ("Mortuary", HexColor("#C2557A")),
          ("Software", HexColor("#6B4FA0"))]

MX = 54
TOTAL = [20]
_N = [0]

S = M.summary()
Y = S["years"]
Y5 = Y[4]
LAST = S["rows"][-1]
MKT = M.market()


def n(v, dp=None):
    """Naira, compact."""
    a = abs(v)
    if a >= 1e9:
        s = "₦%.*fbn" % (2 if dp is None else dp, a / 1e9)
    elif a >= 1e7:
        s = "₦%.0fm" % (a / 1e6)
    elif a >= 1e6:
        s = ("₦%.1fm" % (a / 1e6)).replace(".0m", "m")
    else:
        s = "₦{:,.0f}".format(a)
    return ("-" + s) if v < 0 else s


def c0(v):
    return "{:,.0f}".format(v)


def usd(v):
    return "$%.1fm" % (v / 1e6) if v >= 1e6 else "$%.0fk" % (v / 1e3)


def pct(a, b):
    return "%.0f%%" % (100 * a / b)


PEAK = S["peak"]
RAISE_USD = 500_000
RAISE = RAISE_USD * M.FX
RAISE_TXT = usd(RAISE_USD)
STAKE = 0.30
POST_USD = RAISE_USD / STAKE
PRE_USD = POST_USD - RAISE_USD
STRESS = [(name, M.stressed(**kw)) for name, kw in M.STRESSES]
WORST = max(s["peak"] for _, s in STRESS)
TROUGH = M.label(S["trough"]["m"])
EBITDA_POS = M.label(S["ebitda_positive"]["m"])
PAYBACK = M.label(S["payback"]["m"])
CAPEX_TO_TROUGH = sum(r["capex"] for r in S["rows"][:S["trough"]["m"]])
MARGIN5 = pct(Y5["ebitda"], Y5["revenue"])
EB5, CASH5, EXIT = M.returns(RAISE)
_, _, EXIT_WEAK = M.returns(RAISE, 2000)
BEDS = M.RES_BEDS + M.STEP_BEDS + M.PALL_BEDS


# ---- steady-state unit economics, straight from the model parameters ---------
def residence_steady():
    lb, sb, pb = M.RES_CAP, M.STEP_CAP, M.PALL_CAP
    rev = lb * M.RES_FEE + sb * M.DAYS * M.STEP_DAY + pb * M.PALL_FEE
    cost = (M.RES_STAFF + (lb + sb + pb) * M.RES_PER_BED + M.RES_UTIL + M.RES_RENT
            + M.RES_OTHER)
    return rev, rev - cost


def mortuary_steady():
    held = M.MORT_CAP[-1][1] * M.MORT_FILL
    cases = held * M.DAYS / M.MORT_STAY
    rp = M.REPAT[-1][1]
    ap = M.AUTOPSY[-1][1] * M.AUTOPSY_FEE
    rev = held * M.DAYS * M.MORT_DAY + cases * M.MORT_CASE + rp * M.REPAT_FEE + ap
    cost = (M.MORT_STAFF[-1][1] + M.MORT_POWER[-1][1] + M.MORT_RENT + M.MORT_OTHER
            + cases * M.MORT_CASE_COST + rp * M.REPAT_FEE * M.REPAT_DIRECT
            + ap * M.AUTOPSY_DIRECT)
    return rev, rev - cost, held, cases


RES_REV, RES_EB = residence_steady()
MORT_REV, MORT_EB, MORT_HELD, MORT_CASES = mortuary_steady()


# ---- drawing primitives ------------------------------------------------------
def para(c, text, x, y, size=12, color=BODY, max_w=300, leading=None, font="Sans"):
    leading = leading or size * 1.38
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(c, text, font, size, max_w):
        c.drawString(x, y, line)
        y -= leading
    return y


def tracked(c, text, x, y, size=8.5, color=GREEN, font="Sans-SB", track=1.6):
    c.setFont(font, size)
    c.setFillColor(color)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + track
    return x


def heart(c, cx, cy, s, color=white):
    c.setFillColor(color)
    p = c.beginPath()
    p.moveTo(cx, cy - 0.36 * s)
    p.curveTo(cx - 0.62 * s, cy + 0.02 * s, cx - 0.36 * s, cy + 0.52 * s, cx, cy + 0.2 * s)
    p.curveTo(cx + 0.36 * s, cy + 0.52 * s, cx + 0.62 * s, cy + 0.02 * s, cx, cy - 0.36 * s)
    p.close()
    c.drawPath(p, fill=1, stroke=0)


def logo(c, x, y, h=22, word=INK):
    """Amber rounded tile with a white heart, beside the name in the serif."""
    c.setFillColor(AMBER)
    c.roundRect(x, y, h, h, h * 0.26, fill=1, stroke=0)
    heart(c, x + h / 2, y + h / 2, h * 0.62)
    c.setFont("Serif-SB", h * 1.05)
    c.setFillColor(word)
    c.drawString(x + h * 1.35, y + h * 0.16, "Ilé")


def chrome(c, kicker):
    _N[0] += 1
    c.setFillColor(GROUND)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 52, h=17)
    k = kicker.upper()
    w = sum(c.stringWidth(ch, "Sans-SB", 8.5) + 1.6 for ch in k)
    tracked(c, k, PAGE_W - MX - w, PAGE_H - 46)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(MX, 40, PAGE_W - MX, 40)
    c.setFont("Sans", 8)
    c.setFillColor(MUTED)
    c.drawString(MX, 26, "Ilé  ·  Investor presentation  ·  October 2026  ·  Confidential  ·  "
                         "kemotoks@hotmail.com")
    c.drawRightString(PAGE_W - MX, 26, "%02d / %02d" % (_N[0], TOTAL[0]))


def heading(c, text, y=PAGE_H - 100, size=24, max_w=None, color=INK):
    max_w = max_w or PAGE_W - 2 * MX
    c.setFont("Serif-SB", size)
    c.setFillColor(color)
    for line in wrap(c, text, "Serif-SB", size, max_w):
        c.drawString(MX, y, line)
        y -= size + 6
    return y


def card(c, x, y, w, h, fill=GROUND2, spine=None):
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
    if spine:
        c.setFillColor(spine)
        c.roundRect(x, y, 4, h, 2, fill=1, stroke=0)


def bullets(c, items, x, y, max_w, size=11.5, gap=9, color=BODY, dot=AMBER):
    lead = size * 1.36
    for it in items:
        c.setFillColor(dot)
        c.circle(x + 2.5, y + size * 0.32, 2.3, fill=1, stroke=0)
        y = para(c, it, x + 13, y, size, color, max_w - 13, lead) - gap
    return y


def table(c, rows, x, y, widths, size=10.5, pad=7, head_fill=GREEN, bold_last=False,
          align=None, bold_rows=()):
    """align: per column 'l' or 'r'."""
    align = align or ["l"] + ["r"] * (len(widths) - 1)
    lead = size * 1.3
    for i, r in enumerate(rows):
        head = i == 0
        last = (bold_last and i == len(rows) - 1) or i in bold_rows
        cells = [wrap(c, str(v), "Sans-SB" if head or last or j == 0 else "Sans", size,
                      widths[j] - 2 * pad) for j, v in enumerate(r)]
        h = max(len(cl) for cl in cells) * lead + pad * 1.4
        if head:
            c.setFillColor(head_fill)
            c.rect(x, y - h, sum(widths), h, fill=1, stroke=0)
        elif last:
            c.setFillColor(GTINT)
            c.rect(x, y - h, sum(widths), h, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(GROUND2)
            c.rect(x, y - h, sum(widths), h, fill=1, stroke=0)
        cx = x
        for j, cl in enumerate(cells):
            ty = y - pad - size + 2
            for ln in cl:
                c.setFont("Sans-SB" if head or last or j == 0 else "Sans", size)
                c.setFillColor(white if head else (INK if j == 0 or last else BODY))
                if align[j] == "r":
                    c.drawRightString(cx + widths[j] - pad, ty, ln)
                elif align[j] == "c":
                    c.drawCentredString(cx + widths[j] / 2, ty, ln)
                else:
                    c.drawString(cx + pad, ty, ln)
                ty -= lead
            cx += widths[j]
        y -= h
    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(x, y, x + sum(widths), y)
    return y


def stat(c, x, y, value, label_text, w=160, color=GREEN, size=30):
    c.setFont("Serif-SB", size)
    c.setFillColor(color)
    c.drawString(x, y, value)
    return para(c, label_text, x, y - 18, 10.5, BODY, w, 13.5)


def arrow(c, x, y, col=GREEN, size=7):
    c.setFillColor(col)
    p = c.beginPath()
    p.moveTo(x, y + size / 2)
    p.lineTo(x + size * 1.4, y)
    p.lineTo(x, y - size / 2)
    p.close()
    c.drawPath(p, fill=1, stroke=0)


def dot(c, x, y, level, r=5.5):
    """level 2 full, 1 half, 0 none."""
    if level == 0:
        c.setStrokeColor(RULE)
        c.setLineWidth(0.8)
        c.circle(x, y, r, fill=0, stroke=1)
        return
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.1)
    c.setFillColor(GREEN)
    if level == 2:
        c.circle(x, y, r, fill=1, stroke=1)
    else:
        c.circle(x, y, r, fill=0, stroke=1)
        p = c.beginPath()
        p.moveTo(x, y - r)
        p.arcTo(x - r, y - r, x + r, y + r, startAng=-90, extent=180)
        p.close()
        c.drawPath(p, fill=1, stroke=0)


# ---- slides -------------------------------------------------------------------
def s_cover(c):
    _N[0] += 1
    c.setFillColor(GROUND)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GREEN)                      # quiet colour field, no marks in it
    c.rect(PAGE_W * 0.64, 0, PAGE_W * 0.36, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 92, h=34)
    c.setFillColor(AMBER)
    c.rect(MX, PAGE_H - 160, 34, 2.5, fill=1, stroke=0)
    tracked(c, "INVESTOR PRESENTATION", MX, PAGE_H - 182, 9.5)
    y = PAGE_H - 232
    c.setFont("Serif-SB", 36)
    c.setFillColor(INK)
    for ln in ["Care for the last years", "of life in Lagos, built for", "families abroad."]:
        c.drawString(MX, y, ln)
        y -= 44
    para(c, "Concierge geriatric care, care at home, rehabilitation, residential and "
         "palliative care, and mortuary services, on one family record, and the software "
         "that runs them.",
         MX, y - 6, 13.5, BODY, 440, 19)
    c.setFillColor(GROUND3)
    c.rect(0, 0, PAGE_W * 0.64, 64, fill=1, stroke=0)
    for i, (k, v) in enumerate([("DATE", "October 2026"), ("CONTACT", "kemotoks@hotmail.com"),
                                ("NAME", "Ilé is a working name")]):
        x = MX + i * 140
        tracked(c, k, x, 38, 7.5, MUTED)
        c.setFont("Sans-SB", 10.5)
        c.setFillColor(INK)
        c.drawString(x, 22, v)
    fx = PAGE_W * 0.64 + 40
    tracked(c, "RAISING", fx, PAGE_H / 2 + 92, 9, ATINT)
    c.setFont("Serif-SB", 54)
    c.setFillColor(white)
    c.drawString(fx, PAGE_H / 2 + 30, RAISE_TXT)
    para(c, "pre-seed for %d%%, for %s at %s EBITDA in year five." % (100 * STAKE, n(Y5["revenue"], 1), MARGIN5),
         fx, PAGE_H / 2 + 4, 12.5, GTINT, PAGE_W * 0.36 - 80, 17)


def s_story(c):
    chrome(c, "End-of-life care")
    y = heading(c, "End-of-life care is one of the largest markets in health care, and Nigeria "
                   "has more older people than any other country in Africa.", max_w=740)
    para(c, "It is everything a person needs in the last years of life. "
         "It begins when an older person first needs help to live at home and ends after "
         "their death. Along the way come the falls, operations and strokes that need "
         "recovery, the move into care, and the last months. In mature markets each of these "
         "is a large industry of its own.", MX, y - 4, 12, BODY, 740, 17)
    stages = [("Ageing at home", "Doctor, nurse, carer"),
              ("Post hospital stay", "Rehabilitation"),
              ("Needing care", "Residential care"),
              ("The last months", "Palliative care"),
              ("After death", "Mortuary, funeral")]
    w = (PAGE_W - 2 * MX - 4 * 10) / 5
    top = y - 80
    for i, (t, d) in enumerate(stages):
        x = MX + i * (w + 10)
        c.setFillColor(GREEN if i < 4 else DEEP)
        p = c.beginPath()
        p.moveTo(x, top)
        p.lineTo(x + w - 10, top)
        p.lineTo(x + w + 4, top - 26)
        p.lineTo(x + w - 10, top - 52)
        p.lineTo(x, top - 52)
        if i:
            p.lineTo(x + 14, top - 26)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        c.setFont("Sans-SB", 11.5)
        c.setFillColor(white)
        c.drawString(x + (24 if i else 12), top - 22, t)
        c.setFont("Sans", 9.5)
        c.setFillColor(GTINT)
        c.drawString(x + (24 if i else 12), top - 38, d)
    world = [("~$2trn", "a year on care for older people, 2025"),
             ("$114bn", "a year on death care services, 2025"),
             ("51.7%", "of Americans on Medicare who died in 2023 used hospice"),
             ("2.5%", "of people aged 65+ in England and Wales live in a care home")]
    nigeria = [("14.8m", "Nigerians aged 60 and over, the most in Africa (WHO, 2020)"),
               ("~3x", "growth in Nigerians aged 65 and over by 2050 (UN)"),
               ("%.1fm" % (M.NIGERIA_POP * M.DEATH_RATE / 1e6), "deaths a year in Nigeria"),
               ("$21.8bn", "sent home in 2025 by over 20 million Nigerians abroad")]
    yy = top - 74
    sw = (PAGE_W - 2 * MX - 84 - 3 * 12) / 4
    for r, (lab, row, col) in enumerate([("WORLD", world, AMBER), ("NIGERIA", nigeria, GREEN)]):
        ry = yy - r * 88
        tracked(c, lab, MX, ry - 30, 8.5, col)
        for i, (v, t) in enumerate(row):
            x = MX + 84 + i * (sw + 12)
            card(c, x, ry - 76, sw, 76, GROUND2 if r == 0 else GTINT, col)
            c.setFont("Serif-SB", 21)
            c.setFillColor(GREEN)
            c.drawString(x + 16, ry - 28, v)
            para(c, t, x + 16, ry - 45, 9.5, BODY, sw - 28, 12.5)
    para(c, "In Nigeria little of this is organised, and none of it is offered as one service. "
         "That is the opening Ilé is built for.", MX, yy - 196, 12.5, INK, 740, 17,
         font="Sans-SB")


def s_ecosystem(c):
    chrome(c, "The gap in Nigeria")
    rows = [
        ("Ageing at home", ["amedisys"], 2.35, "Amedisys, 2024",
         "Family members and untrained informal carers; a few agencies",
         "No vetted carers. Nobody checks who enters the house, or that the visit happened."),
        ("Post hospital stay", ["encompass"], 5.94, "Encompass Health, 2025",
         "Family at home; one 40-bed rehabilitation centre, opened in Lekki in 2024",
         "Too few step-down beds, and no rehabilitation at home. Most patients go home to nothing."),
        ("Needing care", ["brookdale"], 3.19, "Brookdale, 2025",
         "Family at home; a handful of small homes at ₦79,000 to ₦249,000 a month",
         "No nursing-grade residence, with vetted staff, secure premises and a nurse at night."),
        ("The last months", ["vitas"], 1.6, "VITAS, 2025",
         "Family at home; cancer centres and teaching hospital units",
         "No hospice outside cancer care. Most people die at home without pain control."),
        ("After death", ["sci"], 4.19, "Service Corporation Intl, 2025",
         "Full hospital mortuaries, funeral homes of uneven standard",
         "No mortuary between Lagos Island and Epe. Elsewhere, no trusted standard."),
    ]
    total = sum(r[2] for r in rows)
    y = heading(c, "Abroad, five companies earn $%.0fbn a year from these five stages. In "
                   "Nigeria, families and informal carers fill every one." % total, max_w=740)
    xs = [MX, MX + 112, MX + 330, MX + 500]
    ws = [104, 210, 162, PAGE_W - MX - (MX + 500)]
    top = y - 8
    for k, (lab, col) in enumerate([("STAGE", MUTED), ("THE LEADER ABROAD", MUTED),
                                    ("NIGERIA: MOSTLY INFORMAL", MUTED), ("THE GAP", AMBER)]):
        tracked(c, lab, xs[k], top - 4, 7.5, col)
    rh = 54
    for i, (stage, logos, rev, who, ng, gap) in enumerate(rows):
        ry = top - 14 - i * (rh + 6)
        # stage
        c.setFillColor(GREEN if i < 4 else DEEP)
        c.roundRect(xs[0], ry - rh, ws[0], rh, 6, fill=1, stroke=0)
        para(c, stage, xs[0] + 10, ry - 24, 12, white, ws[0] - 16, 14, font="Sans-SB")
        # leader abroad: logo and revenue
        c.setFillColor(white)
        c.roundRect(xs[1], ry - rh, ws[1], rh, 6, fill=1, stroke=0)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.6)
        c.roundRect(xs[1], ry - rh, ws[1], rh, 6, fill=0, stroke=1)
        im = ImageReader(str(COMPS / (logos[0] + ".png")))
        iw, ih = im.getSize()
        h = 30 if iw / ih < 1.6 else 20
        wd = min(h * iw / ih, 100)
        h = wd * ih / iw
        c.drawImage(im, xs[1] + 10, ry - rh / 2 - h / 2, width=wd, height=h, mask="auto")
        c.setFont("Serif-SB", 22)
        c.setFillColor(GREEN)
        c.drawRightString(xs[1] + ws[1] - 10, ry - 27, "$%sbn" % (("%.2f" % rev).rstrip("0").rstrip(".")))
        c.setFont("Sans", 8)
        c.setFillColor(MUTED)
        c.drawRightString(xs[1] + ws[1] - 10, ry - 41, "revenue, " + who)
        # nigeria today
        card(c, xs[2], ry - rh, ws[2], rh, GROUND3)
        para(c, ng, xs[2] + 10, ry - 18, 9.2, BODY, ws[2] - 20, 11.8)
        # the gap
        c.setFillColor(ATINT)
        c.roundRect(xs[3], ry - rh, ws[3], rh, 6, fill=1, stroke=0)
        c.setStrokeColor(AMBER)
        c.setLineWidth(1.2)
        c.setDash(4, 3)
        c.roundRect(xs[3], ry - rh, ws[3], rh, 6, fill=0, stroke=1)
        c.setDash()
        para(c, gap, xs[3] + 12, ry - 21, 10.5, INK, ws[3] - 24, 13.5, font="Sans-SB")
    by = top - 14 - 5 * (rh + 6) - 4
    c.setFillColor(AMBER)
    c.roundRect(MX, by - 30, PAGE_W - 2 * MX, 30, 6, fill=1, stroke=0)
    c.setFont("Sans-SB", 11.5)
    c.setFillColor(white)
    c.drawCentredString(PAGE_W / 2, by - 19, "Ilé fills all five gaps, as one company, on one "
                                             "family record.")
    c.setFont("Sans", 7.5)
    c.setFillColor(MUTED)
    c.drawString(MX, 48, "Revenue from company filings; VITAS is the sum of 2025 quarterly figures. "
                         "Logos are their owners' trademarks.")


def s_promise(c):
    chrome(c, "Our promise")
    y = heading(c, "What Ilé promises every family.")
    items = [("At home", "You will know who is in your mother's house, and that the visit happened."),
             ("After hospital", "She will not be sent home from surgery to manage alone."),
             ("In residence", "A nurse will be awake every night."),
             ("The last months", "Her pain will be managed, and someone will be with her."),
             ("After death", "She will be kept with dignity until you are home.")]
    top = y - 14
    rh = 58
    for i, (tag, line) in enumerate(items):
        ry = top - i * rh
        c.setFont("Serif-SB", 30)
        c.setFillColor(AMBER)
        c.drawString(MX, ry - 34, str(i + 1))
        tracked(c, tag.upper(), MX + 44, ry - 14, 8, GREEN)
        c.setFont("Serif", 21)
        c.setFillColor(INK)
        c.drawString(MX + 44, ry - 38, line)
        if i < len(items) - 1:
            c.setStrokeColor(RULE)
            c.setLineWidth(0.7)
            c.line(MX + 44, ry - rh + 8, PAGE_W - MX, ry - rh + 8)
    para(c, "Each promise is something we measure and report to the family every month.",
         MX + 44, top - 5 * rh - 6, 11, MUTED, 700, 15)


def s_problem(c):
    chrome(c, "One family")
    y = heading(c, "Ngozi lives in London. Her mother lives alone in Lekki.")
    para(c, "An illustrative family. Her mother's last years, as they happen in Lagos today.",
         MX, y - 2, 11.5, MUTED, 740, 15)
    rows = [("Ageing at home",
             "Her mother falls at 74. Ngozi hires a carer through a friend, and never meets her."),
            ("Post hospital stay",
             "After a hip operation her mother is home in four days. No one helps her walk again."),
            ("Needing care",
             "She can no longer live alone. The homes Ngozi finds have no nurse at night."),
            ("The last months",
             "A cousin manages her pain at home, with no nurse and no doctor."),
            ("After death",
             "She dies on a Tuesday. Ngozi lands on Friday. The hospital mortuary is full.")]
    xs = [MX, MX + 150]
    ws = [140, PAGE_W - MX - (MX + 150)]
    top = y - 30
    rh = 50
    for i, (stage, today) in enumerate(rows):
        ry = top - 4 - i * (rh + 7)
        c.setFillColor(GREEN if i < 4 else DEEP)
        c.roundRect(xs[0], ry - rh, ws[0], rh, 6, fill=1, stroke=0)
        c.setFont("Sans-SB", 11.5)
        c.setFillColor(white)
        c.drawString(xs[0] + 12, ry - 29, stage)
        card(c, xs[1], ry - rh, ws[1], rh, GROUND3)
        c.setFont("Serif", 15.5)
        c.setFillColor(INK)
        c.drawString(xs[1] + 18, ry - 30, today)
    by = top - 4 - 5 * (rh + 7) - 4
    c.setFillColor(AMBER)
    c.roundRect(MX, by - 34, PAGE_W - 2 * MX, 34, 6, fill=1, stroke=0)
    c.setFont("Sans-SB", 12)
    c.setFillColor(white)
    c.drawCentredString(PAGE_W / 2, by - 21, "Ngozi pays for all of it from London, in pieces, "
                                             "and sees none of it.")


def s_market(c):
    chrome(c, "Market size")
    y = heading(c, "Lagos alone is a %s a year market at premium prices. Year five needs %s "
                   "of it." % (n(MKT["total"], 0), pct(Y5["revenue"], MKT["total"])), max_w=740)
    segs = MKT["segments"]
    vmax = max(v for _, v, _ in segs)
    top = y - 20
    bw = 260
    for i, (name, v, basis) in enumerate(segs):
        yy = top - i * 62
        c.setFont("Sans-SB", 11.5)
        c.setFillColor(INK)
        c.drawString(MX, yy, name)
        c.setFillColor(GREEN)
        c.roundRect(MX + 130, yy - 6, bw * v / vmax, 18, 3, fill=1, stroke=0)
        c.setFont("Serif-SB", 14)
        c.setFillColor(INK)
        c.drawString(MX + 138 + bw * v / vmax, yy - 1, n(v, 1))
        para(c, basis, MX + 130, yy - 22, 9.5, MUTED, 380, 12)
    x2 = 560
    card(c, x2, 92, PAGE_W - MX - x2, top - 72, GTINT)
    tracked(c, "CHECKED AGAINST MATURE MARKETS", x2 + 18, top - 4, 8)
    uk = MKT["old"] * M.PREMIUM * M.UK_CAREHOME
    us = MKT["deaths"] * M.PREMIUM * M.US_HOSPICE
    yy = top - 30
    for head, body in [
            ("Residence", "If premium Lagos families used care homes at the English rate of "
             "2.5%%, there would be %s residents. Our sizing uses %s." % (
                 c0(uk), c0(MKT["dep"] * M.NEEDS_24H * M.PREMIUM))),
            ("Palliative care", "At the American hospice rate of 51.7%% of deaths, %s premium "
             "families a year. Our sizing uses %s." % (
                 c0(us), c0(MKT["deaths"] * M.PALL_NEED * M.PREMIUM))),
            ("Concierge", "Emoha in India charges $60 to $145 a month for check-ins and "
             "emergency cover. Ilé's ₦%s adds a named doctor and hospital visits."
             % c0(M.CONCIERGE_FEE))]:
        c.setFont("Serif-SB", 14)
        c.setFillColor(INK)
        c.drawString(x2 + 18, yy, head)
        yy = para(c, body, x2 + 18, yy - 17, 10, BODY, PAGE_W - MX - x2 - 36, 13.5) - 14
    para(c, "Bottom up: Lagos %sm people, %d%% aged 60+, %s%% of those dependent, %s deaths a "
         "year at %.0f per 1,000; %d%% of families able to pay these prices or funded from "
         "abroad. Care at home includes concierge and rehabilitation."
         % (c0(M.LAGOS_POP / 1e6), 100 * M.SHARE_60, "%.1f" % (100 * M.ADL_DEP),
            c0(MKT["deaths"]), 1000 * M.DEATH_RATE, 100 * M.PREMIUM),
         MX, 92, 9, MUTED, 480, 12)


def s_validation(c):
    chrome(c, "Validation")
    y = heading(c, "Families already pay for every stage. Nobody sells them all of it.")
    x2 = 450
    tracked(c, "WHAT THE MARKET ALREADY PAYS", MX, y - 6, 8)
    ev = [
        ("Care paid from abroad", "Gerocare has sold home doctor visits to diaspora "
         "families since 2017. Reliance Health raised $40m in 2022 and sells Alafia, a "
         "health plan children buy for their parents."),
        ("Residential care", "Lagos homes charge ₦79,000 to ₦249,000 a month; one charges "
         "$437 to $679, above most Nigerian household incomes."),
        ("A premium for a better mortuary", "Families pay ₦15,000 to ₦50,000 a day in a "
         "private home against ₦3,000 to ₦5,000 in a public one."),
        ("Remains flown home", "A recent UK case needed £10,000 to bring a body home."),
        ("Unmet need", "60% of older people in urban Nigeria have unmet needs for daily care."),
    ]
    yy = y - 30
    for t, d in ev:
        c.setFont("Sans-SB", 11)
        c.setFillColor(INK)
        c.drawString(MX, yy, t)
        yy = para(c, d, MX, yy - 15, 10.5, BODY, x2 - MX - 30, 14) - 10
    card(c, x2, 200, PAGE_W - MX - x2, y - 182, GTINT, GREEN)
    tracked(c, "WHAT THIS ROUND PROVES", x2 + 20, y - 26, 8)
    para(c, "Ilé has not yet taken a paying client. The round is built to prove four things "
         "before the residence opens:", x2 + 20, y - 48, 11, INK, PAGE_W - MX - x2 - 40, 15)
    bullets(c, ["%d care-at-home clients and %d concierge members by %s"
                % (M.HOME_CLIENTS[1][1], M.CONCIERGE[1][1], M.label(M.HOME_CLIENTS[1][0])),
                "%d residence places reserved with a deposit before opening in %s"
                % (M.DEPOSITS_AT_OPEN, M.label(M.RESIDENCES[0])),
                "The mortuary holding %d bodies a day within a year of opening"
                % (M.MORT_CAP[0][1] * M.MORT_FILL),
                "Surgeons referring post-operative rehabilitation every month"],
            x2 + 20, y - 100, PAGE_W - MX - x2 - 40, 11, 8)


def s_streams(c):
    chrome(c, "Value streams")
    y = heading(c, "Twelve revenue streams: eleven across the last years of life, and the software that runs them.", max_w=740)
    rows = [["Stream", "What the family buys", "Price", "Y5 ₦m", "Share"]]
    items = [
        ("Concierge geriatric care", "A named doctor and care manager, a 24-hour line, a companion at hospital visits",
         "₦%s a month" % c0(M.CONCIERGE_FEE), "s_concierge"),
        ("Care at home", "Nurse, carer and physiotherapy visits, by subscription or visit",
         "₦%s a month on average" % c0(M.HOME_ARPU), "s_home"),
        ("Virtual consultations", "Doctor reviews by video, notes on the family record",
         "₦%s each" % c0(M.CONSULT_FEE), "s_consult"),
        ("Post-operative rehabilitation", "Six weeks at home after surgery: physiotherapy, nursing, wound care",
         "₦%s a package" % c0(M.REHAB_FEE), "s_rehab"),
        ("Step-down beds", "Short stays after a hospital discharge or surgery, with daily therapy",
         "₦%s a day" % c0(M.STEP_DAY), "s_step"),
        ("Residence", "Assisted living and nursing care, staffed day and night",
         "₦%s a month" % c0(M.RES_FEE), "s_long"),
        ("Palliative wing", "Pain control and comfort in the residence",
         "₦%s a month" % c0(M.PALL_FEE), "pall_rev"),
        ("Palliative care at home", "The same team, in the family's house",
         "₦%s a month" % c0(M.PALL_HOME_ARPU), "s_pall_home"),
        ("Mortuary preservation", "Cold storage while the family gathers",
         "₦%s a day" % c0(M.MORT_DAY), "s_preserve"),
        ("Preparation and repatriation", "Embalming, dressing, transport; remains received from abroad",
         "₦%s a case; ₦%s a repatriation" % (c0(M.MORT_CASE), c0(M.REPAT_FEE)), None),
        ("Autopsy and pathology", "Post-mortems for families, hospitals, insurers and coroners",
         "₦%s an examination" % c0(M.AUTOPSY_FEE), "s_autopsy"),
        ("Software licence", "Ilé's care platform, licensed to agencies, care homes and hospices",
         "₦%s a month per organisation" % c0(M.SAAS_FEE), "saas_rev"),
    ]
    for name, what, price, key in items:
        v = Y5[key] if key else Y5["s_case"] + Y5["s_repat"]
        rows.append([name, what, price, c0(v / 1e6), pct(v, Y5["revenue"])])
    rows.append(["Total", "", "", c0(Y5["revenue"] / 1e6), "100%"])
    yy = table(c, rows, MX, y - 8, [170, 300, 150, 56, 58], size=9.8, pad=5.5, bold_last=True,
               align=["l", "l", "l", "r", "r"])
    para(c, "Not in the model, and open to us later: medicines and supplies to clients, a carer "
         "training school, and eldercare as an employee benefit.", MX, yy - 16, 9.5, MUTED,
         720, 13)


def s_pipeline(c):
    chrome(c, "Demand pipeline")
    y = heading(c, "Where the families come from, and how few of them year five needs.",
                max_w=720)
    top = y - 14
    tracked(c, "CHANNELS INTO EACH STREAM", MX, top, 8)
    chans = [("Families abroad", "Diaspora associations, churches abroad, search, referral",
              "Concierge, care at home, residence"),
             ("Families in Lagos", "Family physicians, churches and mosques, referral",
              "Care at home, residence"),
             ("Surgeons and hospitals", "Discharge planners, orthopaedic and spine surgeons",
              "Rehabilitation, step-down"),
             ("Ilé's own record", "Escalation signals: acuity, falls, admissions, carer strain",
              "Residence, palliative care"),
             ("The city", "Hospitals, insurers, coroners, churches and mosques",
              "Mortuary, autopsy, repatriation"),
             ("Other care providers", "Agencies, care homes and hospices across Nigeria",
              "Software licence")]
    yy = top - 18
    for src, how, into in chans:
        card(c, MX, yy - 44, 300, 44, GROUND2)
        c.setFont("Sans-SB", 10.5)
        c.setFillColor(INK)
        c.drawString(MX + 12, yy - 17, src)
        c.setFont("Sans", 9.2)
        c.setFillColor(BODY)
        c.drawString(MX + 12, yy - 32, how)
        arrow(c, MX + 306, yy - 22, AMBER, 6)
        para(c, into, MX + 322, yy - 19 if len(wrap(c, into, "Sans-SB", 9.5, 140)) > 1 else yy - 26,
             9.5, GREEN, 140, 12, font="Sans-SB")
        yy -= 52
    x2 = 520
    tracked(c, "YEAR FIVE AGAINST THE LAGOS POOL", x2, top, 8)
    pool_home = MKT["dep"] * M.PREMIUM
    pool_res = MKT["dep"] * M.NEEDS_24H * M.PREMIUM
    pool_pall = MKT["deaths"] * M.PALL_NEED * M.PREMIUM
    pool_mort = MKT["deaths"] * M.PRIVATE_MORT
    pall_people = (LAST["pall_beds"] + LAST["pall_home"]) * 12 / M.PALL_MONTHS
    mort_year = LAST["cases"] * 12
    rows = [["Year five", "Ilé", "Pool", "Share"],
            ["Care at home clients", c0(LAST["home_clients"]), c0(pool_home), pct(LAST["home_clients"], pool_home)],
            ["Concierge members", c0(LAST["members"]), c0(pool_home), pct(LAST["members"], pool_home)],
            ["Residents", c0(LAST["beds"]), c0(pool_res), pct(LAST["beds"], pool_res)],
            ["Palliative patients a year", c0(pall_people), c0(pool_pall), pct(pall_people, pool_pall)],
            ["Mortuary families a year", c0(mort_year), c0(pool_mort), pct(mort_year, pool_mort)]]
    yy = table(c, rows, x2, top - 12, [128, 44, 48, 48], size=9.6, pad=6)
    para(c, "Pool: premium families in Lagos, from the market sizing. Rehabilitation and "
         "step-down are fed by surgeons' lists, about %d packages and %d step-down "
         "admissions a year by year five." % (M.REHAB[-1][1] * 12,
                                              LAST["step_beds"] * 365 / M.STEP_STAY),
         x2, yy - 14, 9, MUTED, PAGE_W - MX - x2, 12)


def s_trust(c):
    chrome(c, "The family record")
    y = heading(c, "From London, Ngozi sees every visit, every dose and every reading.")
    para(c, "Every visit is checked in and out. Every dose is signed for. Vitals are recorded "
         "against a trend. Photographs are shared where the family has consented. A written "
         "report arrives each month with one bill. The record follows a loved one from the "
         "first visit into the residence without being keyed in again.",
         MX, y - 8, 12, BODY, 330, 17.5)
    bullets(c, ["Every carer identity-checked, referenced and background-checked before a first visit",
                "Carer app works without signal and syncs when it returns",
                "Every clinical entry is audited: who wrote it, when, what changed",
                "The same record watches for escalation, which is the residence's admissions list",
                "Registered under the Nigeria Data Protection Act 2023 before the first "
                "family record exists"], MX, y - 150, 330, 11, 8)
    x, w, top = 430, PAGE_W - MX - 430, y + 14
    card(c, x, 70, w, top - 70, white)
    c.setStrokeColor(RULE)
    c.roundRect(x, 70, w, top - 70, 8, fill=0, stroke=1)
    c.setFillColor(GREEN)
    c.circle(x + 34, top - 36, 15, fill=1, stroke=0)
    c.setFont("Sans-SB", 10)
    c.setFillColor(white)
    c.drawCentredString(x + 34, top - 40, "IO")
    c.setFont("Serif-SB", 15)
    c.setFillColor(INK)
    c.drawString(x + 58, top - 32, "Mrs Ifeoma O., Ngozi's mother")
    c.setFont("Sans", 9.5)
    c.setFillColor(MUTED)
    c.drawString(x + 58, top - 46, "Residence · Room 7 · updated 08:25")
    c.setFillColor(GTINT)
    c.roundRect(x + w - 82, top - 44, 64, 18, 9, fill=1, stroke=0)
    c.setFont("Sans-SB", 9)
    c.setFillColor(GREEN)
    c.drawCentredString(x + w - 50, top - 38, "Stable")
    items = [("08:12", "Morning check", "Nurse Grace K. · photo attached"),
             ("08:20", "Medicines given", "Amlodipine 5mg, Metformin 500mg · signed"),
             ("08:25", "Vitals", "BP 128/82 · pulse 74 · temp 36.6"),
             ("10:00", "Physiotherapy", "Walked 40 metres with a frame"),
             ("18:00", "Video call booked", "With Ngozi, London")]
    yy = top - 80
    for t, a, b in items:
        c.setFillColor(GREEN)
        c.circle(x + 26, yy + 3, 3.5, fill=1, stroke=0)
        c.setFont("Sans-SB", 10.5)
        c.setFillColor(INK)
        c.drawString(x + 40, yy, a)
        c.setFont("Sans", 9.5)
        c.setFillColor(BODY)
        c.drawString(x + 40, yy - 13, b)
        c.setFillColor(MUTED)
        c.drawRightString(x + w - 20, yy, t)
        yy -= 36
    c.setStrokeColor(RULE)
    c.line(x + 20, yy + 14, x + w - 20, yy + 14)
    c.setFont("Sans-SB", 10.5)
    c.setFillColor(INK)
    c.drawString(x + 20, yy - 6, "October invoice")
    c.setFont("Serif-SB", 16)
    c.drawString(x + 20, yy - 26, "$%s" % c0(M.RES_FEE / M.FX))
    c.setFillColor(AMBER)
    c.roundRect(x + w - 104, yy - 30, 84, 24, 6, fill=1, stroke=0)
    c.setFont("Sans-SB", 10.5)
    c.setFillColor(white)
    c.drawCentredString(x + w - 62, yy - 22, "Pay now")
    c.setFont("Sans", 8)
    c.setFillColor(MUTED)
    c.drawString(x, 56, "Illustrative screen. Names and readings are examples.")


def s_competition(c):
    chrome(c, "Competitive landscape")
    y = heading(c, "Each competitor sells one or two stages. Ilé sells all of them, on one "
                   "record.", max_w=730)
    cols = ["Concierge\ngeriatric", "Care at\nhome", "Virtual\nconsults", "Rehab and\nstep-down",
            "Residence", "Palliative\ncare", "Mortuary", "Family record,\nFX billing"]
    rows = [
        ("Ilé", "Lagos", [2, 2, 2, 2, 2, 2, 2, 2]),
        ("Gerocare", "National, from Abuja", [1, 1, 1, 0, 0, 0, 0, 1]),
        ("Reliance Health, Alafia", "Health plan for parents", [0, 0, 2, 0, 0, 0, 0, 1]),
        ("Caring Habitat", "Lekki-Ajah, 40 beds, since 2024", [0, 0, 0, 2, 1, 0, 0, 0]),
        ("Rockgarden", "Lagos, Ikorodu", [0, 2, 0, 0, 2, 0, 0, 0]),
        ("Agencies, informal carers", "Lagos-wide", [0, 1, 0, 0, 0, 0, 0, 0]),
        ("Hospitals", "Outpatient physiotherapy, units", [0, 0, 0, 1, 0, 1, 2, 0]),
        ("Lakeshore Cancer Center", "Lagos, cancer patients", [0, 0, 0, 0, 0, 2, 0, 0]),
        ("Private funeral homes", "e.g. Ebony, TOS Funerals", [0, 0, 0, 0, 0, 0, 2, 0]),
    ]
    x0, cw = MX + 210, 63
    top = y - 18
    for j, h in enumerate(cols):
        for k, ln in enumerate(h.split("\n")):
            c.setFont("Sans-SB", 8.8)
            c.setFillColor(INK)
            c.drawCentredString(x0 + j * cw + cw / 2, top - k * 11, ln)
    yy = top - 30
    rh = 24
    for i, (name, note, lv) in enumerate(rows):
        if i == 0:
            c.setFillColor(GTINT)
            c.rect(MX, yy - rh + 10, PAGE_W - 2 * MX, rh, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(GROUND2)
            c.rect(MX, yy - rh + 10, PAGE_W - 2 * MX, rh, fill=1, stroke=0)
        c.setFont("Sans-SB" if i else "Serif-SB", 11 if i else 13)
        c.setFillColor(GREEN if i == 0 else INK)
        c.drawString(MX + 8, yy - 2, name)
        c.setFont("Sans", 8.5)
        c.setFillColor(MUTED)
        c.drawString(MX + 8, yy - 14, note)
        for j, l in enumerate(lv):
            dot(c, x0 + j * cw + cw / 2, yy - 6, l)
        yy -= rh
    dot(c, MX + 6, yy - 6, 2, 4)
    dot(c, MX + 56, yy - 6, 1, 4)
    c.setFont("Sans", 8.5)
    c.setFillColor(MUTED)
    c.drawString(MX + 14, yy - 9, "offers")
    c.drawString(MX + 64, yy - 9, "partly")
    c.drawString(MX + 106, yy - 9, "From each provider's public website and press coverage, "
                                   "October 2026.")
    wins = [("One family, acquired once", "Joins for care at home, stays to the end."),
            ("The record fills the beds", "Escalation signals are the admissions list."),
            ("Proof for the payer abroad", "Every visit visible, billed in her currency."),
            ("Clinical governance", "A surgeon co-founder and an acuity ceiling.")]
    w = (PAGE_W - 2 * MX - 3 * 12) / 4
    for i, (t, d) in enumerate(wins):
        x = MX + i * (w + 12)
        card(c, x, 52, w, 56, GTINT, GREEN)
        c.setFont("Sans-SB", 10.5)
        c.setFillColor(INK)
        c.drawString(x + 14, 88, t)
        para(c, d, x + 14, 72, 9.5, BODY, w - 24, 12)


def s_mortuary(c):
    chrome(c, "The mortuary")
    y = heading(c, "There is no mortuary between Lagos Island and Epe. Ilé's serves that "
                   "corridor and earns the steadiest margin in the company.", max_w=740)
    para(c, "Lagos families hold a body for weeks, not days, while relatives travel home and "
         "the funeral is arranged. Demand does not depend on Ilé's care book, does not move "
         "with the economy and is paid before release. Hospital mortuaries are full and "
         "private homes vary widely. A clean facility with reliable cold storage and honest "
         "prices has room in this market.", MX, y - 6, 12, BODY, 400, 17.5)
    bullets(c, ["Sited on the Lekki corridor: there is no mortuary between Lagos Island and Epe",
                "Preservation, embalming, dressing and viewing",
                "Transport within Lagos",
                "Receipt of remains flown home from abroad, with the paperwork handled",
                "Autopsy and pathology: post-mortems with histology for families, hospitals, "
                "insurers and coroners, in our own suite with a consultant pathologist",
                "Opens with %d places in %s, expands to %d in %s" % (
                    M.MORT_CAP[0][1], M.label(M.MORT_OPEN), M.MORT_CAP[1][1],
                    M.label(M.MORT_CAP[1][0]))],
            MX, y - 120, 400, 11.5, 8)
    x2 = 500
    rows = [["At %d places, %d%% full" % (M.MORT_CAP[-1][1], 100 * M.MORT_FILL), "A month"],
            ["Bodies held on an average day", "%.0f" % MORT_HELD],
            ["Families served", "%.0f" % MORT_CASES],
            ["Autopsies", "%d" % M.AUTOPSY[-1][1]],
            ["Average stay", "%d days" % M.MORT_STAY],
            ["Revenue", n(MORT_REV)],
            ["EBITDA", "%s, %s" % (n(MORT_EB), pct(MORT_EB, MORT_REV))]]
    yy = table(c, rows, x2, y - 2, [190, PAGE_W - MX - x2 - 190], size=10.5, pad=6.5,
               bold_last=True)
    pw = PAGE_W - MX - x2
    card(c, x2, 58, pw, yy - 72, GTINT, GREEN)
    tracked(c, "PARTNERSHIPS AROUND IT", x2 + 18, yy - 30, 8)
    bullets(c, ["Hospitals without a mortuary or pathologist: storage and post-mortems by contract",
                "Life insurers and HMOs: cause-of-death reports for claims",
                "Coroners, police and the courts: medico-legal post-mortems",
                "Funeral directors and repatriation firms abroad",
                "Medical schools: pathology training placements"],
            x2 + 18, yy - 50, pw - 34, 9.6, 4)
    para(c, "Priced at ₦%s a day and ₦%s a case, inside the ₦15,000 to ₦50,000 a day Lagos "
         "funeral homes charge. Autopsy fee is an estimate." % (c0(M.MORT_DAY), c0(M.MORT_CASE)),
         MX, 62, 9, MUTED, 400, 12)


def s_units(c):
    chrome(c, "Unit economics and assumptions")
    y = heading(c, "Every stream pays its own way once it is full.")
    rows = [["Stream", "Unit", "Revenue a month", "Contribution", "Margin"]]
    for name, unit, fee, direct in [
            ("Concierge geriatric care", "per member", M.CONCIERGE_FEE, M.CONCIERGE_DIRECT),
            ("Care at home", "per client", M.HOME_ARPU, M.HOME_DIRECT),
            ("Post-operative rehabilitation", "per six-week package", M.REHAB_FEE, M.REHAB_DIRECT),
            ("Palliative care at home", "per patient", M.PALL_HOME_ARPU, M.PALL_HOME_DIRECT),
            ("Virtual consultation", "each", M.CONSULT_FEE, M.CONSULT_DIRECT),
            ("Software licence", "per organisation", M.SAAS_FEE, M.SAAS_DIRECT)]:
        rows.append([name, unit, n(fee), n(fee * (1 - direct)), "%.0f%%" % (100 * (1 - direct))])
    rows.append(["Residence, %d beds" % BEDS, "%d long-stay, %d step-down, %d palliative filled"
                 % (M.RES_CAP, M.STEP_CAP, M.PALL_CAP), n(RES_REV), n(RES_EB) + " EBITDA",
                 pct(RES_EB, RES_REV)])
    rows.append(["Mortuary", "%d places, %d%% full" % (M.MORT_CAP[-1][1], 100 * M.MORT_FILL),
                 n(MORT_REV), n(MORT_EB) + " EBITDA", pct(MORT_EB, MORT_REV)])
    yy = table(c, rows, MX, y - 8, [200, 210, 110, 130, 84], size=10.5, pad=7,
               align=["l", "l", "r", "r", "r"])
    tracked(c, "KEY ASSUMPTIONS", MX, yy - 24, 8)
    bullets(c, ["Residence: staffing %s a month loaded with on-costs, nurses on every shift; "
                "building lease %s a year, paid a year ahead; building works %s and equipment %s"
                % (n(M.RES_STAFF), n(M.RES_RENT * 12), n(M.RES_CONVERSION), n(M.RES_CAPEX)),
                "Residence opens with %d of %d beds filled and adds about one a month; "
                "step-down stays average %d days" % (
                    M.RES_OPEN_OCC + M.STEP_OPEN_OCC + M.PALL_OPEN_OCC, BEDS, M.STEP_STAY),
                "Central team %s a month rising to %s; marketing %s rising to %s"
                % (n(M.CENTRAL[0][1]), n(M.CENTRAL[-1][1]), n(M.MARKETING[0][1]),
                   n(M.MARKETING[-1][1])),
                "Naira at ₦%s to the dollar throughout; all figures before tax"
                % c0(M.FX)], MX, yy - 44, 730, 10.5, 5)


def s_financials(c):
    chrome(c, "Five-year financials")
    y = heading(c, "%s revenue and %s EBITDA in year five, with no further equity."
                % (n(Y5["revenue"], 2), MARGIN5), max_w=740)
    x0, base, cw, ch = MX + 30, 92, 330, 280
    vmax = 3.5e9
    c.setFont("Sans", 8.5)
    for t in range(0, 4):
        v = t * 1e9
        yy = base + ch * v / vmax
        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(x0, yy, x0 + cw, yy)
        c.setFillColor(MUTED)
        c.drawRightString(x0 - 6, yy - 3, "₦%dbn" % t if t else "0")
    bw = 44
    keys = ["home_rev", "res_rev", "pall_rev", "mort_rev", "saas_rev"]
    for i, yr in enumerate(Y):
        bx = x0 + 18 + i * (cw - 18) / 5
        cy = base
        for k, (_, col) in zip(keys, SERIES):
            h = ch * yr[k] / vmax
            if h <= 0:
                continue
            c.setFillColor(col)
            c.rect(bx, cy, bw, max(h - 2, 0.5), fill=1, stroke=0)   # 2pt gap between segments
            cy += h
        c.setFont("Sans-SB", 9.5)
        c.setFillColor(INK)
        c.drawCentredString(bx + bw / 2, cy + 5, n(yr["revenue"], 2))
        c.setFont("Sans", 9)
        c.setFillColor(BODY)
        c.drawCentredString(bx + bw / 2, base - 14, "Year %d" % (i + 1))
    lx = x0
    for name, col in SERIES:
        c.setFillColor(col)
        c.roundRect(lx, 56, 9, 9, 2, fill=1, stroke=0)
        c.setFont("Sans", 9)
        c.setFillColor(BODY)
        c.drawString(lx + 13, 57, name)
        lx += c.stringWidth(name, "Sans", 9) + 30
    tx = 440
    rows = [["₦m", "Y1", "Y2", "Y3", "Y4", "Y5"]]
    for label_text, k in [("Care at home", "home_rev"), ("Residence", "res_rev"),
                          ("Palliative wing", "pall_rev"), ("Mortuary", "mort_rev"),
                          ("Software", "saas_rev"), ("Revenue", "revenue"), ("EBITDA", "ebitda"), ("Capital spend", "capex"),
                          ("Cash, cumulative", "end_cum")]:
        rows.append([label_text] + [c0(yr[k] / 1e6) for yr in Y])
    rows.append(["EBITDA margin"] + [pct(yr["ebitda"], yr["revenue"]) for yr in Y])
    yy = table(c, rows, tx, y - 6, [112] + [57] * 5, size=9.5, pad=6, bold_rows=(6, 7))
    para(c, "Year one is November 2026 to October 2027. Before tax. Care at home includes "
         "concierge, rehabilitation, consultations and palliative care at home; residence "
         "includes step-down. Residence two opens in %s, paid for from cash flow."
         % M.label(M.RESIDENCES[1]), tx, yy - 16, 9, MUTED, PAGE_W - MX - tx, 12)


def s_funding(c):
    chrome(c, "Funding")
    y = heading(c, "%s for %d%% covers a %s peak, and %s if the plan runs slow. No further "
                   "round is in the plan." % (RAISE_TXT, 100 * STAKE, n(PEAK), n(WORST)), max_w=740)
    top = y - 16
    tracked(c, "USE OF THE %s (%s)" % (RAISE_TXT.upper(), n(RAISE).upper()), MX, top, 8.5)
    tm = S["trough"]["m"]
    mort = sum(v for m, v in M.MORT_CAPEX if m <= tm) + M.AUTOPSY_CAPEX[1]
    leases = sum(r["rent_paid"] for r in S["rows"][:tm])
    rows = [["Use", "₦m"],
            ["Mortuary: building, cold storage, autopsy suite, vehicles", c0(mort / 1e6)],
            ["Residence: building works to a licensable care home", c0(M.RES_CONVERSION / 1e6)],
            ["Residence: equipment, furnishing, nurse call, power, pre-opening", c0(M.RES_CAPEX / 1e6)],
            ["Residence building lease, a year paid ahead", c0(M.RES_RENT * 12 / 1e6)],
            ["Mortuary site lease, a year paid ahead", c0(M.MORT_RENT * 12 / 1e6)],
            ["Operating cash to the low point, net of residence deposits",
             c0((PEAK - CAPEX_TO_TROUGH - leases) / 1e6)],
            ["Reserve against a slower plan", c0((RAISE - PEAK) / 1e6)],
            ["Total", c0(RAISE / 1e6)]]
    table(c, rows, MX, top - 12, [356, 64], size=10.2, pad=6.5, bold_last=True)
    x2 = 500
    tracked(c, "IF THE PLAN RUNS SLOW", x2, top, 8.5)
    short = ["Base case", "Residence fills at half speed", "Mortuary fills at half speed",
             "Care at home at half the clients", "Concierge at half the members",
             "No software licences sold",
             "Residence opens six months late", "Residence and mortuary at half speed"]
    rows = [["Case", "Peak funding"]] + [[short[i], n(st["peak"])] for i, (_, st) in enumerate(STRESS)]
    yy = table(c, rows, x2, top - 12, [200, PAGE_W - MX - x2 - 200], size=10.2, pad=6.5,
               bold_rows=(1,))
    para(c, "Every case fits inside the %s. EBITDA is positive from %s and cumulative cash "
         "is back above zero by %s. Everything sits in Ilé: the leases, the building works, "
         "the equipment, the platform and the licences." % (n(RAISE), EBITDA_POS, PAYBACK),
         MX, 120, 10.5, MUTED, PAGE_W - 2 * MX, 14)


def s_returns(c):
    chrome(c, "Returns")
    y = heading(c, "At year five, Ilé is worth %s to %s on six to ten times EBITDA."
                % (usd(EXIT[0][1]), usd(EXIT[-1][1])), max_w=740)
    para(c, "The round: %s for %d%%, which values Ilé at %s before the money and %s after. "
         "Equity value at exit is year-five EBITDA of %s times the multiple, plus %s of cash, "
         "at ₦%s to the dollar, before any later dilution." % (
             RAISE_TXT, 100 * STAKE, usd(PRE_USD), usd(POST_USD), n(EB5), n(CASH5), c0(M.FX)),
         MX, y - 6, 11.5, BODY, 720, 16)
    rows = [["Exit multiple", "Ilé's equity value", "The investor's %d%%" % (100 * STAKE),
             "Multiple on %s" % RAISE_TXT]]
    for mult, eq in EXIT:
        rows.append(["%dx EBITDA" % mult, usd(eq), usd(eq * STAKE),
                     "%.1fx" % (eq * STAKE / RAISE_USD)])
    yy = table(c, rows, MX, y - 60, [180, 180, 180, 194], size=11.5, pad=10,
               bold_rows=(2,))
    para(c, "If the naira weakens to ₦2,000 to the dollar by exit, the 8x equity value is %s. "
         "Families abroad pay in dollars and pounds, which softens this." % usd(EXIT_WEAK[1][1]),
         MX, yy - 22, 10.5, MUTED, 720, 14)
    para(c, "The multiples are a discount to developed markets: Service Corporation "
         "International trades at about 12 times EBITDA and Amedisys sold for about 13 times.",
         MX, yy - 42, 10.5, MUTED, 720, 14)
    yy -= 30
    para(c, "Software licences bring in %s in year five, valued here at the same EBITDA "
         "multiple as the care business rather than a software multiple." % n(Y5["saas_rev"]),
         MX, yy - 42, 10.5, MUTED, 720, 14)
    yy -= 30
    para(c, "Beyond year five: further residences in Lagos and Abuja, a second mortuary, and "
         "the same record serving each. None of it is in these numbers.", MX, yy - 56, 11,
         INK, 720, 15, font="Sans-SB")


def s_risks(c):
    chrome(c, "Risks")
    y = heading(c, "What could go wrong, and what we do about it.")
    rows = [["Risk", "What we do about it"],
            ["The residence fills slowly", "It opens with places reserved by deposit, filled "
             "from care at home and step-down. The model assumes %d of %d beds on day one."
             % (M.RES_OPEN_OCC + M.STEP_OPEN_OCC + M.PALL_OPEN_OCC, BEDS)],
            ["Families object to a care home", "We sell first to families abroad, who already "
             "pay others to care, and let the family record show the standard."],
            ["A clinical failure", "Admissions capped at an acuity ceiling set by the clinical "
             "co-founder. Every clinical entry audited. Two hospitals agree to receive "
             "emergencies before the residence opens."],
            ["Pain relief supply", "Controlled medicines are limited in Nigeria. We dispense "
             "through a licensed hospital pharmacy under the palliative lead."],
            ["The naira", "Families abroad pay in dollars or pounds, which covers imported "
             "consumables and equipment."],
            ["Losing trained staff", "Pay above the Lagos agency rate, a path from carer to "
             "nurse, and a clinical leadership share pool."]]
    table(c, rows, MX, y - 10, [220, PAGE_W - 2 * MX - 220], size=11.5, pad=9,
          align=["l", "l"])


def photo(c, x, y, d, path=None, initials="", fill=GREEN):
    """Circular portrait, or initials on a colour disc when there is no photo yet."""
    c.saveState()
    if path:
        p = c.beginPath()
        p.circle(x + d / 2, y + d / 2, d / 2)
        c.clipPath(p, stroke=0, fill=0)
        c.drawImage(ImageReader(str(path)), x, y, width=d, height=d)
    else:
        c.setFillColor(fill)
        c.circle(x + d / 2, y + d / 2, d / 2, fill=1, stroke=0)
        c.setFont("Serif-SB", d * 0.36)
        c.setFillColor(white)
        c.drawCentredString(x + d / 2, y + d / 2 - d * 0.12, initials)
    c.restoreState()


def s_founders(c):
    chrome(c, "Founders and team")
    y = heading(c, "Capital, an operator who has built and sold a healthcare business, and a "
                   "clinical standard.", max_w=740)
    people = [
        dict(name="Kemi Balogun", role="Co-founder. Capital and property", initials="KB",
             spine=GREEN,
             bio="Chief Commercial Officer of the TotalEnergies Staff Housing Cooperative, "
                 "where she closed a $40m FCMB facility for Louisville, its $150m Eko "
                 "Atlantic development. Ten years in technology, latterly leading innovation "
                 "at VFD Tech. Brings capital and property experience.",
             cred="", aff=[["tehc", "louisville", "vfd", "axa"], ["imperial", "oxford"]]),
        dict(name="Dr Debo Odulana", role="Co-founder and promoter",
             initials="DO", logo=DOCS_DIR / "c4a-logo.png",
             spine=AMBER,
             bio="Physician; Founding Partner, Consult for Africa. Former Chief Executive of Cedarcrest "
                 "Hospitals Abuja, where revenue passed ₦1bn a month. Former Chief Innovation "
                 "and Strategy Officer, Evercare Hospital Lekki. Founded Doctoora, built it across 21 "
                 "states and sold it to Evercare. Independent director, Havana Specialist "
                 "Hospital. MBBS, Sharjah. MSc, Imperial.",
             cred="",
             aff=[["cedarcrest", "evercare", "doctoora", "havana"], ["imperial", "sharjah"]]),
        dict(name="Dr Chris Anele", role="Clinical co-founder", initials="CA",
             spine=GREEN,
             bio="Consultant Neurosurgeon, brain and spine, at Evercare Hospital Lekki, where "
                 "he heads the Emergency Department. Trained at Obafemi Awolowo University "
                 "Teaching Hospitals, with spine fellowships in Austria and with AO Spine in "
                 "Switzerland. Sets Ilé's care standard and chairs clinical governance.",
             cred="MBBS, Nigeria. FWACS (Neurosurgery).",
             aff=[["evercare", "unn", "wacs", "ao"]]),
    ]
    gap = 14
    small = (PAGE_W - 2 * MX - 300 - 2 * gap) / 2
    widths = [300 if pp.get("logo") else small for pp in people]
    top = y - 8
    h = 244
    x = MX
    for k, pp in enumerate(people):
        w = widths[k]
        card(c, x, top - h, w, h, GROUND2, pp["spine"])
        lead = bool(pp.get("logo"))
        d = 64 if lead else 50
        photo(c, x + 18, top - 18 - d, d, pp.get("photo"), pp.get("initials", ""))
        tx = x + 18 + d + 12
        c.setFont("Serif-SB", 15 if lead else 13.5)
        c.setFillColor(INK)
        c.drawString(tx, top - 34, pp["name"])
        para(c, pp["role"], tx, top - 50, 9.5, GREEN, w - (tx - x) - 14, 12, font="Sans-SB")
        if pp.get("logo"):
            im = ImageReader(str(pp["logo"]))
            iw, ih = im.getSize()
            lh = 20
            c.drawImage(im, tx, top - 18 - d - 2, width=lh * iw / ih, height=lh, mask="auto")
        by = para(c, pp["bio"], x + 18, top - 18 - d - 22, 9.6, BODY, w - 34, 12.8)
        if pp["cred"]:
            para(c, pp["cred"], x + 18, by - 4, 8.8, MUTED, w - 34, 11.5)
        if pp.get("aff"):
            ry = top - h + 6
            for row in reversed(pp["aff"]):
                ims = []
                for nm in row:
                    im = ImageReader(str(TEAM_LOGOS / (nm + ".png")))
                    iw, ih = im.getSize()
                    lh = {"imperial": 9, "sharjah": 26, "evercare": 13, "cedarcrest": 22,
                          "doctoora": 20, "havana": 21, "unn": 24, "wacs": 24,
                          "ao": 11, "tehc": 16, "louisville": 30, "vfd": 24, "axa": 26,
                          "oxford": 20}.get(nm, 18)
                    ims.append((im, lh * iw / ih, lh))
                tot = sum(wd for _, wd, _ in ims) + 14 * (len(ims) - 1)
                sc = min(1.0, (w - 36) / tot)
                lx = x + 18
                for im, wd, lh in ims:
                    c.drawImage(im, lx, ry + (26 - lh * sc) / 2, width=wd * sc, height=lh * sc,
                                mask="auto")
                    lx += (wd + 14) * sc
                ry += 30
        x += w + gap
    # bottom band: ownership, the hires this round pays for, governance
    yb = top - h - 22
    colw = (PAGE_W - 2 * MX - 2 * 24) / 3
    tracked(c, "THE ROUND", MX, yb, 8)
    rows = [["Terms", ""], ["Raising", RAISE_TXT], ["For", "%d%%" % (100 * STAKE)],
            ["Pre-money", usd(PRE_USD)], ["Post-money", usd(POST_USD)]]
    table(c, rows, MX, yb - 8, [colw - 80, 80], size=9.2, pad=4.5)
    x2 = MX + colw + 24
    tracked(c, "SENIOR HIRES THIS ROUND PAYS FOR", x2, yb, 8)
    bullets(c, ["Head of technology, for the platform and software licences",
                "Residence manager, a registered nurse",
                "Head of care operations for home, rehabilitation and palliative care",
                "Mortuary manager and a sessional consultant pathologist"],
            x2, yb - 18, colw, 9.4, 3)
    x3 = x2 + colw + 24
    tracked(c, "GOVERNANCE", x3, yb, 8)
    bullets(c, ["Founder shares vest, with good and bad leaver terms",
                "Clinical governance committee chaired by Dr Anele",
                "Investors' reserved matters agreed in the round"],
            x3, yb - 18, colw, 9.4, 3)


def s_plan(c):
    chrome(c, "Milestones")
    end = 48                                    # Oct 2026 (month 0) to Oct 2030
    em = S["ebitda_positive"]["m"]
    y = heading(c, "Every line is trading by %s. EBITDA turns positive in %s and keeps rising."
                % (M.label(M.RESIDENCES[0]), M.label(em)), max_w=740)
    x0, x1 = MX + 46, PAGE_W - MX
    xm = lambda m: x0 + (x1 - x0) * m / end
    # milestones on one dated line
    ty = y - 40
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.4)
    c.line(x0, ty, x1, ty)
    # the front door opens as one span: care at home, concierge, rehab, palliative at home
    a, b = M.HOME_CLIENTS[0][0], M.PALL_HOME[0][0]
    c.setFillColor(GREEN)
    c.roundRect(xm(a), ty - 3, xm(b) - xm(a), 6, 3, fill=1, stroke=0)
    c.setFont("Sans", 8.5)
    c.setFillColor(INK)
    c.drawString(xm(a), ty - 16, "Care at home, concierge,")
    c.drawString(xm(a), ty - 26, "rehab, palliative at home")
    c.setFont("Sans", 7.5)
    c.setFillColor(MUTED)
    c.drawString(xm(a), ty - 35, "%s to %s" % (M.label(a), M.label(b)))
    marks = [(0, "Platform"), (M.MORT_OPEN, "Mortuary opens"),
             (M.SAAS[0][0], "Software licences"), (M.RESIDENCES[0], "Residence opens"),
             (em, "EBITDA positive"), (M.MORT_CAP[1][0], "Mortuary to %d places" % M.MORT_CAP[1][1]),
             (M.RESIDENCES[1], "Residence two")]
    levels = [12, -16]
    for k, (m, t) in enumerate(marks):
        key = t in ("Residence opens", "EBITDA positive")
        c.setFillColor(AMBER if key else GREEN)
        c.circle(xm(m), ty, 4.5 if key else 3.5, fill=1, stroke=0)
        lv = levels[k % 2] if k else 12
        right = t == "Software licences"            # sits just left of EBITDA positive
        c.setStrokeColor(RULE)
        c.setLineWidth(0.6)
        c.line(xm(m), ty, xm(m), ty + (lv - 3 if lv > 0 else lv + 9))
        c.setFont("Sans-SB" if key else "Sans", 8.5)
        c.setFillColor(INK)
        draw = (lambda xx, yy, tt: c.drawRightString(xx - 6, yy, tt)) if right else \
            (lambda xx, yy, tt: c.drawString(xx + 3, yy, tt))
        draw(xm(m), ty + lv, t)
        c.setFont("Sans", 7.5)
        c.setFillColor(MUTED)
        draw(xm(m), ty + lv - 9, M.label(m) if m else "Oct 2026")
    # monthly revenue and EBITDA, one naira axis
    rows = [r for r in S["rows"] if r["m"] <= end]
    cb, ct = 80, ty - 66
    vmax = max(r["revenue"] for r in rows)
    vmin = min(r["ebitda"] for r in rows)
    top_v = 50e6 * (int(vmax / 50e6) + 1)
    bot_v = -25e6 * (int(-vmin / 25e6) + 1)
    yv = lambda v: cb + (ct - cb) * (v - bot_v) / (top_v - bot_v)
    for g in [int(bot_v)] + list(range(0, int(top_v) + 1, int(50e6))):
        c.setStrokeColor(RULE if g else MUTED)
        c.setLineWidth(0.5 if g else 0.8)
        c.line(x0, yv(g), x1, yv(g))
        c.setFont("Sans", 7.5)
        c.setFillColor(MUTED)
        c.drawRightString(x0 - 5, yv(g) - 3, "₦%dm" % (g / 1e6) if g else "0")
    bw = (x1 - x0) / end * 0.72
    for r in rows:
        c.setFillColor(GTINT)
        c.rect(xm(r["m"]) - bw / 2, yv(0), bw, yv(r["revenue"]) - yv(0), fill=1, stroke=0)
    p = c.beginPath()
    p.moveTo(xm(rows[0]["m"]), yv(rows[0]["ebitda"]))
    for r in rows[1:]:
        p.lineTo(xm(r["m"]), yv(r["ebitda"]))
    c.setStrokeColor(GREEN)
    c.setLineWidth(2)
    c.drawPath(p, stroke=1, fill=0)
    c.setStrokeColor(AMBER)
    c.setLineWidth(1)
    c.setDash(3, 3)
    c.line(xm(em), yv(bot_v), xm(em), ct + 4)
    c.setDash()
    # legend and the cash note
    c.setFillColor(GTINT)
    c.rect(x0, ct + 10, 10, 8, fill=1, stroke=0)
    c.setFont("Sans", 8.5)
    c.setFillColor(BODY)
    c.drawString(x0 + 14, ct + 10, "Revenue a month")
    c.setStrokeColor(GREEN)
    c.setLineWidth(2)
    c.line(x0 + 110, ct + 14, x0 + 124, ct + 14)
    c.drawString(x0 + 128, ct + 10, "EBITDA a month")
    last = rows[-1]
    c.setFont("Sans-SB", 9)
    c.setFillColor(INK)
    c.drawRightString(x1, yv(last["revenue"]) + 6, "%s a month by %s" % (n(last["revenue"]), M.label(end)))
    c.setFillColor(GREEN)
    c.drawRightString(x1, yv(last["ebitda"]) + 8, "%s EBITDA" % n(last["ebitda"]))
    c.setFont("Sans", 8)
    c.setFillColor(MUTED)
    c.drawString(MX, 56, "Cash is lowest at %s in %s, before the leases and building works start "
                         "paying back. The %s raise covers it." % (n(PEAK), TROUGH, RAISE_TXT))


def s_back(c):
    _N[0] += 1
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 92, h=30, word=white)
    c.setFillColor(AMBER)
    c.rect(MX, PAGE_H / 2 + 70, 34, 2.5, fill=1, stroke=0)
    y = PAGE_H / 2 + 30
    c.setFont("Serif-SB", 32)
    c.setFillColor(white)
    for ln in wrap(c, "%s for %d%%, to %s of revenue and %s EBITDA by year five."
                   % (RAISE_TXT, 100 * STAKE, n(Y5["revenue"], 1), MARGIN5), "Serif-SB", 32, 660):
        c.drawString(MX, y, ln)
        y -= 40
    para(c, "Care for the last years of life in Lagos, from the first visit to the funeral, "
         "on one record, with the family abroad seeing every day of it.",
         MX, y - 10, 13, GTINT, 600, 19)
    c.setFont("Sans-SB", 12)
    c.setFillColor(white)
    c.drawString(MX, 84, "Kemi Balogun  ·  kemotoks@hotmail.com")
    c.setFont("Sans", 10)
    c.setFillColor(GTINT)
    c.drawString(MX, 50, "Figures are from the five-year operating model, before tax, at "
                         "₦%s to the dollar. Ilé is a working name." % c0(M.FX))


SLIDES = [s_cover, s_problem, s_story, s_ecosystem, s_promise, s_market, s_validation, s_streams,
          s_pipeline, s_trust, s_competition, s_mortuary, s_units, s_financials,
          s_funding, s_returns, s_risks, s_founders, s_plan, s_back]


SHORT = [s_cover, s_problem, s_ecosystem, s_streams, s_financials, s_returns, s_founders]
OUT_SHORT = ROOT / "docs" / "Ile - Investor Summary, Seven Pages (Deck).pdf"


def build(slides=SLIDES, out=OUT, title="Ilé, investor presentation"):
    TOTAL[0] = len(slides)
    _N[0] = 0
    c = canvas.Canvas(str(out), pagesize=(PAGE_W, PAGE_H))
    c.setTitle(title)
    c.setAuthor("Ilé")
    for s in slides:
        s(c)
        c.showPage()
    c.save()
    print(out, TOTAL[0], "slides")


if __name__ == "__main__":
    build()
    build(SHORT, OUT_SHORT, "Ilé, investor summary")
