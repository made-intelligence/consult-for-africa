"""
ilé investor deck, the streamlined case: end-of-life care at home, a residential
care home, and a mortuary. Three businesses, one family record.

Numbers come from scripts/ile_model_eol.py. Drawing primitives, palette and fonts
are borrowed from scripts/build-ile-investor-deck.py, so both decks stay one
brand. The fuller eleven-stream deck is untouched.

    python3 scripts/build-ile-eol-deck.py
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
spec = importlib.util.spec_from_file_location("ile_deck", HERE / "build-ile-investor-deck.py")
D = importlib.util.module_from_spec(spec)
spec.loader.exec_module(D)
import ile_model_eol as M  # noqa: E402

from cfa_deck import PAGE_W, PAGE_H, wrap  # noqa: E402

GREEN, AMBER, INK, BODY, MUTED = D.GREEN, D.AMBER, D.INK, D.BODY, D.MUTED
GROUND, GROUND2, GROUND3, GTINT, ATINT, RULE, DEEP = (D.GROUND, D.GROUND2, D.GROUND3, D.GTINT,
                                                      D.ATINT, D.RULE, D.DEEP)
para, tracked, card, bullets, table, heading = D.para, D.tracked, D.card, D.bullets, D.table, D.heading
n, c0, usd, pct, arrow, dot = D.n, D.c0, D.usd, D.pct, D.arrow, D.dot
MX = D.MX

OUT = D.ROOT / "docs" / "Ile - Investor Presentation, End-of-Life Care (Deck).pdf"

SERIES = [("Care at home", HexColor("#12896C")), ("Palliative at home", HexColor("#5FB59A")),
          ("Care home", HexColor("#E09A2E")), ("Palliative wing", HexColor("#3F68B5")),
          ("Mortuary", HexColor("#C2557A"))]

S = M.summary()
Y = S["years"]
Y5 = Y[4]
LAST = S["rows"][-1]
MKT = M.market()
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
BEDS = M.RES_BEDS + M.PALL_BEDS
HOME_OPEN = M.label(M.RESIDENCES[0])


def residence_steady():
    lb, pb = M.RES_CAP, M.PALL_CAP
    rev = lb * M.RES_FEE + pb * M.PALL_FEE
    cost = M.RES_STAFF + (lb + pb) * M.RES_PER_BED + M.RES_UTIL + M.RES_RENT + M.RES_OTHER
    return rev, rev - cost


def mortuary_steady():
    held = M.MORT_CAP[-1][1] * M.MORT_FILL
    cases = held * M.DAYS / M.MORT_STAY
    rp = M.REPAT[-1][1]
    rev = held * M.DAYS * M.MORT_DAY + cases * M.MORT_CASE + rp * M.REPAT_FEE
    cost = (M.MORT_STAFF[-1][1] + M.MORT_POWER[-1][1] + M.MORT_RENT + M.MORT_OTHER
            + cases * M.MORT_CASE_COST + rp * M.REPAT_FEE * M.REPAT_DIRECT)
    return rev, rev - cost, held, cases


RES_REV, RES_EB = residence_steady()
MORT_REV, MORT_EB, MORT_HELD, MORT_CASES = mortuary_steady()

STAGES = ["Needing care at home", "Needing care round the clock", "The last months", "After death"]


def chrome(c, kicker):
    D.chrome(c, kicker)


def stage_box(c, x, y, w, h, text, i, size=11.5):
    c.setFillColor(DEEP if i == 3 else GREEN)
    c.roundRect(x, y - h, w, h, 6, fill=1, stroke=0)
    para(c, text, x + 12, y - h / 2 + (4 if len(wrap(c, text, "Sans-SB", size, w - 20)) == 1 else 11),
         size, white, w - 20, size + 2, font="Sans-SB")


# ---- slides -------------------------------------------------------------------
def s_cover(c):
    D._N[0] += 1
    c.setFillColor(GROUND)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GREEN)                      # quiet colour field, no marks in it
    c.rect(PAGE_W * 0.64, 0, PAGE_W * 0.36, PAGE_H, fill=1, stroke=0)
    D.logo(c, MX, PAGE_H - 92, h=34)
    c.setFillColor(AMBER)
    c.rect(MX, PAGE_H - 160, 34, 2.5, fill=1, stroke=0)
    tracked(c, "INVESTOR PRESENTATION", MX, PAGE_H - 182, 9.5)
    y = PAGE_H - 232
    c.setFont("Serif-SB", 36)
    c.setFillColor(INK)
    for ln in ["End-of-life care in Lagos,", "built for families abroad."]:
        c.drawString(MX, y, ln)
        y -= 44
    para(c, "Care at home, a residential care home with a palliative wing, and a mortuary. "
         "Three businesses, one family, one record.", MX, y - 6, 13.5, BODY, 440, 19)
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
    para(c, "pre-seed for %d%%, for %s of revenue at %s EBITDA in year five."
         % (100 * STAKE, n(Y5["revenue"], 2), MARGIN5),
         fx, PAGE_H / 2 + 4, 12.5, GTINT, PAGE_W * 0.36 - 80, 17)


def s_family(c):
    chrome(c, "One family")
    y = heading(c, "Ngozi lives in London. Her mother lives alone in Lekki.")
    para(c, "An illustrative family. Her mother's last years, as they happen in Lagos today.",
         MX, y - 2, 11.5, MUTED, 740, 15)
    rows = ["Her mother falls at 74. Ngozi hires a carer through a friend, and never meets her.",
            "She can no longer live alone. The homes Ngozi finds have no nurse at night.",
            "A cousin manages her pain at home, with no nurse and no doctor.",
            "She dies on a Tuesday. Ngozi lands on Friday. The hospital mortuary is full."]
    top, rh = y - 34, 58
    for i, today in enumerate(rows):
        ry = top - i * (rh + 9)
        stage_box(c, MX, ry, 170, rh, STAGES[i], i)
        card(c, MX + 182, ry - rh, PAGE_W - 2 * MX - 182, rh, GROUND3)
        c.setFont("Serif", 15.5)
        c.setFillColor(INK)
        c.drawString(MX + 200, ry - 34, today)
    by = top - 4 * (rh + 9) - 4
    c.setFillColor(AMBER)
    c.roundRect(MX, by - 34, PAGE_W - 2 * MX, 34, 6, fill=1, stroke=0)
    c.setFont("Sans-SB", 12)
    c.setFillColor(white)
    c.drawCentredString(PAGE_W / 2, by - 21, "Ngozi pays for all of it from London, in pieces, "
                                             "and sees none of it.")


def s_gap(c):
    chrome(c, "The gap in Nigeria")
    rows = [
        ("Needing care at home", "amedisys", 2.35, "Amedisys, 2024",
         "Family members and untrained informal carers; a few agencies",
         "No vetted carers. Nobody checks who enters the house, or that the visit happened."),
        ("Needing care round the clock", "brookdale", 3.19, "Brookdale, 2025",
         "Family at home; a handful of small homes at ₦79,000 to ₦249,000 a month",
         "No nursing-grade care home, with vetted staff, secure premises and a nurse at night."),
        ("The last months", "vitas", 1.6, "VITAS, 2025",
         "Family at home; cancer centres and teaching hospital units",
         "No hospice outside cancer care. Most people die at home without pain control."),
        ("After death", "sci", 4.19, "Service Corporation Intl, 2025",
         "Full hospital mortuaries, funeral homes of uneven standard",
         "No mortuary between Lagos Island and Epe. Elsewhere, no trusted standard."),
    ]
    total = sum(r[2] for r in rows)
    y = heading(c, "Abroad, four companies earn $%.0fbn a year from these four stages. In "
                   "Nigeria, families and informal carers fill every one." % total, max_w=740)
    xs = [MX, MX + 132, MX + 350, MX + 520]
    ws = [124, 210, 162, PAGE_W - MX - (MX + 520)]
    top = y - 8
    for k, (lab, col) in enumerate([("STAGE", MUTED), ("THE LEADER ABROAD", MUTED),
                                    ("NIGERIA: MOSTLY INFORMAL", MUTED), ("THE GAP", AMBER)]):
        tracked(c, lab, xs[k], top - 4, 7.5, col)
    rh = 62
    for i, (stage, logo, rev, who, ng, gap) in enumerate(rows):
        ry = top - 14 - i * (rh + 8)
        stage_box(c, xs[0], ry, ws[0], rh, stage, i, 11)
        c.setFillColor(white)
        c.roundRect(xs[1], ry - rh, ws[1], rh, 6, fill=1, stroke=0)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.6)
        c.roundRect(xs[1], ry - rh, ws[1], rh, 6, fill=0, stroke=1)
        im = ImageReader(str(D.COMPS / (logo + ".png")))
        iw, ih = im.getSize()
        h = 30 if iw / ih < 1.6 else 20
        wd = min(h * iw / ih, 100)
        h = wd * ih / iw
        c.drawImage(im, xs[1] + 10, ry - rh / 2 - h / 2, width=wd, height=h, mask="auto")
        c.setFont("Serif-SB", 22)
        c.setFillColor(GREEN)
        c.drawRightString(xs[1] + ws[1] - 10, ry - 30, "$%sbn" % (("%.2f" % rev).rstrip("0").rstrip(".")))
        c.setFont("Sans", 8)
        c.setFillColor(MUTED)
        c.drawRightString(xs[1] + ws[1] - 10, ry - 44, "revenue, " + who)
        card(c, xs[2], ry - rh, ws[2], rh, GROUND3)
        para(c, ng, xs[2] + 10, ry - 20, 9.4, BODY, ws[2] - 20, 12)
        c.setFillColor(ATINT)
        c.roundRect(xs[3], ry - rh, ws[3], rh, 6, fill=1, stroke=0)
        c.setStrokeColor(AMBER)
        c.setLineWidth(1.2)
        c.setDash(4, 3)
        c.roundRect(xs[3], ry - rh, ws[3], rh, 6, fill=0, stroke=1)
        c.setDash()
        para(c, gap, xs[3] + 12, ry - 24, 10.5, INK, ws[3] - 24, 13.5, font="Sans-SB")
    by = top - 14 - 4 * (rh + 8) - 4
    c.setFillColor(AMBER)
    c.roundRect(MX, by - 30, PAGE_W - 2 * MX, 30, 6, fill=1, stroke=0)
    c.setFont("Sans-SB", 11.5)
    c.setFillColor(white)
    c.drawCentredString(PAGE_W / 2, by - 19, "Ilé fills all four gaps, as one company, on one "
                                             "family record.")
    c.setFont("Sans", 7.5)
    c.setFillColor(MUTED)
    c.drawString(MX, 48, "Revenue from company filings; VITAS is the sum of 2025 quarterly figures. "
                         "Logos are their owners' trademarks.")


def s_businesses(c):
    chrome(c, "Three businesses")
    y = heading(c, "Ilé is three businesses that follow one family: care at home, a care home, "
                   "and a mortuary.", max_w=740)
    biz = [
        ("End-of-life care at home", "The front door, from the first fall to the last months.",
         [("Care at home", "Nurse, carer and physiotherapy visits, by subscription",
           "₦%s a month on average" % c0(M.HOME_ARPU),
           "%s contribution" % pct(1 - M.HOME_DIRECT, 1)),
          ("Palliative care at home", "Pain control and comfort in the family's house",
           "₦%s a month" % c0(M.PALL_HOME_ARPU),
           "%s contribution" % pct(1 - M.PALL_HOME_DIRECT, 1))],
         Y5["home_rev"], "You will know who is in your mother's house, and that the visit happened."),
        ("Residential care home", "%d beds: %d long-stay and a %d-bed palliative wing."
         % (BEDS, M.RES_BEDS, M.PALL_BEDS),
         [("Long-stay", "Assisted living and nursing care, a nurse awake every night",
           "₦%s a month" % c0(M.RES_FEE), ""),
          ("Palliative wing", "The last months, with pain managed and someone present",
           "₦%s a month" % c0(M.PALL_FEE), "")],
         Y5["res_rev"] + Y5["pall_rev"], "A nurse will be awake every night."),
        ("Mortuary", "On the Lekki corridor, where there is none between Lagos Island and Epe.",
         [("Preservation", "Cold storage while the family gathers",
           "₦%s a day" % c0(M.MORT_DAY), ""),
          ("Preparation and repatriation", "Embalming, dressing, transport; remains received "
           "from abroad", "₦%s a case; ₦%s a repatriation" % (c0(M.MORT_CASE), c0(M.REPAT_FEE)),
           "")],
         Y5["mort_rev"], "She will be kept with dignity until you are home."),
    ]
    steady = [None, "%s a month full, %s EBITDA" % (n(RES_REV), pct(RES_EB, RES_REV)),
              "%s a month full, %s EBITDA" % (n(MORT_REV), pct(MORT_EB, MORT_REV))]
    gap = 14
    w = (PAGE_W - 2 * MX - 2 * gap) / 3
    top, h = y - 6, 352
    for i, (name, sub, items, y5, promise) in enumerate(biz):
        x = MX + i * (w + gap)
        card(c, x, top - h, w, h, GROUND2, GREEN if i < 2 else DEEP)
        tracked(c, "0%d" % (i + 1), x + 18, top - 22, 8, AMBER)
        c.setFont("Serif-SB", 17)
        c.setFillColor(INK)
        c.drawString(x + 18, top - 44, name)
        yy = para(c, sub, x + 18, top - 62, 9.8, BODY, w - 34, 13)
        yy -= 8
        for t, d, price, note in items:
            c.setFont("Sans-SB", 10.5)
            c.setFillColor(INK)
            c.drawString(x + 18, yy, t)
            yy = para(c, d, x + 18, yy - 14, 9.4, BODY, w - 34, 12)
            c.setFont("Sans-SB", 10)
            c.setFillColor(GREEN)
            c.drawString(x + 18, yy - 1, price + ("  ·  " + note if note else ""))
            yy -= 22
        c.setStrokeColor(RULE)
        c.setLineWidth(0.7)
        c.line(x + 18, top - h + 112, x + w - 16, top - h + 112)
        c.setFont("Serif-SB", 24)
        c.setFillColor(GREEN)
        c.drawString(x + 18, top - h + 82, n(y5, 2))
        c.setFont("Sans", 9)
        c.setFillColor(MUTED)
        c.drawString(x + 18, top - h + 68, "Year five revenue, %s of the total" % pct(y5, Y5["revenue"]))
        if steady[i]:
            c.drawString(x + 18, top - h + 56, steady[i])
        para(c, "“%s”" % promise, x + 18, top - h + 34, 9.6, INK, w - 34, 12.5,
             font="Serif-I")
    para(c, "The promise in each card is measured and reported to the family every month.",
         MX, top - h - 18, 9, MUTED, 720, 12)


def s_flow(c):
    chrome(c, "How the three fit together")
    y = heading(c, "Care at home brings the family in. The care home is where it leads. The "
                   "mortuary earns from the whole city.", max_w=740)
    top = y - 18
    steps = [("Care at home", "From %s" % M.label(M.HOME_CLIENTS[0][0])),
             ("Care home", "Opens %s" % HOME_OPEN),
             ("Palliative care", "At home or in the wing"),
             ("Mortuary", "Opens %s" % M.label(M.MORT_OPEN))]
    w = (PAGE_W - 2 * MX - 3 * 26) / 4
    for i, (t, d) in enumerate(steps):
        x = MX + i * (w + 26)
        c.setFillColor(DEEP if i == 3 else GREEN)
        c.roundRect(x, top - 58, w, 58, 8, fill=1, stroke=0)
        c.setFont("Serif-SB", 16)
        c.setFillColor(white)
        c.drawString(x + 14, top - 26, t)
        c.setFont("Sans", 9.5)
        c.setFillColor(GTINT)
        c.drawString(x + 14, top - 44, d)
        if i < 3:
            arrow(c, x + w + 8, top - 29, AMBER, 7)
    links = ["The record watches for falls, admissions, carer strain and a decision-maker "
             "abroad. Those signals are the care home's admissions list.",
             "Residents and their families already know the team that will care for them "
             "at the end.",
             "Palliative patients at home or in the wing move to the next stage with no "
             "stranger in the room.",
             "Most bodies come from the city, not from Ilé's own care: hospitals, families, "
             "churches and mosques."]
    for i, t in enumerate(links):
        x = MX + i * (w + 26)
        para(c, t, x, top - 78, 9.8, BODY, w, 13)
    yt = top - 178
    tracked(c, "YEAR FIVE AGAINST THE LAGOS POOL", MX, yt, 8)
    pool_home = MKT["dep"] * M.PREMIUM
    pool_res = MKT["dep"] * M.NEEDS_24H * M.PREMIUM
    pool_pall = MKT["deaths"] * M.PALL_NEED * M.PREMIUM
    pool_mort = MKT["deaths"] * M.PRIVATE_MORT
    pall_people = (LAST["pall_beds"] + LAST["pall_home"]) * 12 / M.PALL_MONTHS
    mort_year = LAST["cases"] * 12
    rows = [["Year five", "Ilé", "Lagos pool", "Share"],
            ["Care at home clients", c0(LAST["home_clients"]), c0(pool_home), pct(LAST["home_clients"], pool_home)],
            ["Care home residents", c0(LAST["beds"]), c0(pool_res), pct(LAST["beds"], pool_res)],
            ["Palliative patients a year", c0(pall_people), c0(pool_pall), pct(pall_people, pool_pall)],
            ["Mortuary families a year", c0(mort_year), c0(pool_mort), pct(mort_year, pool_mort)]]
    table(c, rows, MX, yt - 10, [220, 80, 90, 80], size=10, pad=6.5, align=["l", "r", "r", "r"])
    x2 = MX + 500
    card(c, x2, 66, PAGE_W - MX - x2, yt - 60, GTINT, GREEN)
    tracked(c, "WHERE FAMILIES COME FROM", x2 + 18, yt - 16, 8)
    bullets(c, ["Families abroad: diaspora associations, churches abroad, search, referral",
                "Families in Lagos: family physicians, churches and mosques",
                "Hospitals: discharge planners and oncologists, for palliative care",
                "The city: hospitals without a mortuary, funeral directors abroad"],
            x2 + 18, yt - 38, PAGE_W - MX - x2 - 36, 9.6, 5)
    para(c, "Pool: premium families in Lagos, from the market sizing on the next slide.",
         MX, 66, 9, MUTED, 440, 12)


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
            ("Care home", "If premium Lagos families used care homes at the English rate of "
             "2.5%%, there would be %s residents. Our sizing uses %s." % (
                 c0(uk), c0(MKT["dep"] * M.NEEDS_24H * M.PREMIUM))),
            ("Palliative care", "At the American hospice rate of 51.7%% of deaths, %s premium "
             "families a year. Our sizing uses %s." % (
                 c0(us), c0(MKT["deaths"] * M.PALL_NEED * M.PREMIUM)))]:
        c.setFont("Serif-SB", 14)
        c.setFillColor(INK)
        c.drawString(x2 + 18, yy, head)
        yy = para(c, body, x2 + 18, yy - 17, 10, BODY, PAGE_W - MX - x2 - 36, 13.5) - 14
    para(c, "Bottom up: Lagos %sm people, %d%% aged 60+, %s%% of those dependent, %s deaths a "
         "year at %.0f per 1,000; %d%% of families able to pay these prices or funded from "
         "abroad." % (c0(M.LAGOS_POP / 1e6), 100 * M.SHARE_60, "%.1f" % (100 * M.ADL_DEP),
                      c0(MKT["deaths"]), 1000 * M.DEATH_RATE, 100 * M.PREMIUM),
         MX, 92, 9, MUTED, 480, 12)


def s_validation(c):
    chrome(c, "Validation")
    y = heading(c, "Families already pay for every stage. This round proves they will pay Ilé.")
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
         "before the care home opens:", x2 + 20, y - 48, 11, INK, PAGE_W - MX - x2 - 40, 15)
    bullets(c, ["%d care-at-home clients by %s" % (M.HOME_CLIENTS[1][1], M.label(M.HOME_CLIENTS[1][0])),
                "Palliative patients cared for at home, with pain controlled",
                "%d care home places reserved with a deposit before opening in %s"
                % (M.DEPOSITS_AT_OPEN, HOME_OPEN),
                "The mortuary holding %d bodies a day within a year of opening"
                % (M.MORT_CAP[0][1] * M.MORT_FILL)],
            x2 + 20, y - 100, PAGE_W - MX - x2 - 40, 11, 8)


def s_trust(c):
    chrome(c, "The family record")
    y = heading(c, "From London, Ngozi sees every visit, every dose and every reading.")
    para(c, "Every visit is checked in and out. Every dose is signed for. Vitals are recorded "
         "against a trend. Photographs are shared where the family has consented. A written "
         "report arrives each month with one bill. The record follows a loved one from the "
         "first visit into the care home without being keyed in again.",
         MX, y - 8, 12, BODY, 330, 17.5)
    bullets(c, ["Every carer identity-checked, referenced and background-checked before a first visit",
                "Carer app works without signal and syncs when it returns",
                "Every clinical entry is audited: who wrote it, when, what changed",
                "The same record watches for escalation, which is the care home's admissions list",
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
    c.drawString(x + 58, top - 46, "Care home · Room 7 · updated 08:25")
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
    y = heading(c, "Each competitor sells one stage. Ilé sells all four, on one record.",
                max_w=730)
    cols = ["Care at\nhome", "Palliative\nat home", "Care\nhome", "Palliative\nwing",
            "Mortuary", "Repatri-\nation", "Family record,\nFX billing"]
    rows = [
        ("Ilé", "Lagos", [2, 2, 2, 2, 2, 2, 2]),
        ("Gerocare", "National, from Abuja", [1, 0, 0, 0, 0, 0, 1]),
        ("Reliance Health, Alafia", "Health plan for parents", [0, 0, 0, 0, 0, 0, 1]),
        ("Rockgarden", "Lagos, Ikorodu", [2, 0, 2, 0, 0, 0, 0]),
        ("Caring Habitat", "Lekki-Ajah, 40 beds, since 2024", [0, 0, 1, 0, 0, 0, 0]),
        ("Agencies, informal carers", "Lagos-wide", [1, 0, 0, 0, 0, 0, 0]),
        ("Lakeshore Cancer Center", "Lagos, cancer patients", [0, 1, 0, 2, 0, 0, 0]),
        ("Hospitals", "Units and mortuaries", [0, 0, 0, 1, 2, 0, 0]),
        ("Private funeral homes", "e.g. Ebony, TOS Funerals", [0, 0, 0, 0, 2, 1, 0]),
    ]
    x0, cw = MX + 230, 70
    top = y - 18
    for j, h in enumerate(cols):
        for k, ln in enumerate(h.split("\n")):
            c.setFont("Sans-SB", 8.8)
            c.setFillColor(INK)
            c.drawCentredString(x0 + j * cw + cw / 2, top - k * 11, ln)
    yy = top - 30
    rh = 25
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
                "Opens with %d places in %s, expands to %d in %s" % (
                    M.MORT_CAP[0][1], M.label(M.MORT_OPEN), M.MORT_CAP[1][1],
                    M.label(M.MORT_CAP[1][0]))],
            MX, y - 120, 400, 11.5, 8)
    x2 = 500
    rows = [["At %d places, %d%% full" % (M.MORT_CAP[-1][1], 100 * M.MORT_FILL), "A month"],
            ["Bodies held on an average day", "%.0f" % MORT_HELD],
            ["Families served", "%.0f" % MORT_CASES],
            ["Remains received from abroad", "%d" % M.REPAT[-1][1]],
            ["Average stay", "%d days" % M.MORT_STAY],
            ["Revenue", n(MORT_REV)],
            ["EBITDA", "%s, %s" % (n(MORT_EB), pct(MORT_EB, MORT_REV))]]
    yy = table(c, rows, x2, y - 2, [190, PAGE_W - MX - x2 - 190], size=10.5, pad=6.5,
               bold_last=True)
    pw = PAGE_W - MX - x2
    card(c, x2, 58, pw, yy - 72, GTINT, GREEN)
    tracked(c, "PARTNERSHIPS AROUND IT", x2 + 18, yy - 30, 8)
    bullets(c, ["Hospitals without a mortuary: storage by contract",
                "Funeral directors and repatriation firms abroad",
                "Churches and mosques along the corridor",
                "Life insurers: one point of contact for a family's claim"],
            x2 + 18, yy - 50, pw - 34, 9.8, 5)
    para(c, "Priced at ₦%s a day and ₦%s a case, inside the ₦15,000 to ₦50,000 a day Lagos "
         "funeral homes charge." % (c0(M.MORT_DAY), c0(M.MORT_CASE)),
         MX, 62, 9, MUTED, 400, 12)


def s_financials(c):
    chrome(c, "Five-year financials")
    y = heading(c, "%s revenue and %s EBITDA in year five, from one care home and one "
                   "mortuary." % (n(Y5["revenue"], 2), MARGIN5), max_w=740)
    x0, base, cw, ch = MX + 30, 92, 330, 280
    vmax = 2e9
    c.setFont("Sans", 8.5)
    for t in range(0, 5):
        v = t * 0.5e9
        yy = base + ch * v / vmax
        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(x0, yy, x0 + cw, yy)
        c.setFillColor(MUTED)
        c.drawRightString(x0 - 6, yy - 3, ("₦%.1fbn" % (v / 1e9)).replace(".0bn", "bn") if t else "0")
    bw = 44
    keys = ["s_home", "s_pall_home", "res_rev", "pall_rev", "mort_rev"]
    for i, yr in enumerate(Y):
        bx = x0 + 18 + i * (cw - 18) / 5
        cy = base
        for k, (_, col) in zip(keys, SERIES):
            h = ch * yr[k] / vmax
            if h <= 0:
                continue
            c.setFillColor(col)
            c.rect(bx, cy, bw, max(h - 2, 0.5), fill=1, stroke=0)
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
        lx += c.stringWidth(name, "Sans", 9) + 24
    tx = 440
    rows = [["₦m", "Y1", "Y2", "Y3", "Y4", "Y5"]]
    for label_text, k in [("Care at home", "s_home"), ("Palliative at home", "s_pall_home"),
                          ("Care home", "res_rev"), ("Palliative wing", "pall_rev"),
                          ("Mortuary", "mort_rev"), ("Revenue", "revenue"), ("EBITDA", "ebitda"),
                          ("Capital spend", "capex"), ("Cash, cumulative", "end_cum")]:
        rows.append([label_text] + [c0(yr[k] / 1e6) for yr in Y])
    rows.append(["EBITDA margin"] + [pct(yr["ebitda"], yr["revenue"]) for yr in Y])
    yy = table(c, rows, tx, y - 6, [112] + [57] * 5, size=9.5, pad=6, bold_rows=(6, 7))
    para(c, "Year one is November 2026 to October 2027. Before tax. The mortuary includes "
         "preparation and repatriation. A second care home is beyond year five and not in "
         "these numbers.", tx, yy - 16, 9, MUTED, PAGE_W - MX - tx, 12)


def s_units(c):
    chrome(c, "Unit economics and assumptions")
    y = heading(c, "Care at home and the mortuary carry the margin. The care home carries the "
                   "promise.", max_w=740)
    rows = [["Business", "Unit", "Revenue a month", "Contribution", "Margin"]]
    for name, unit, fee, direct in [
            ("Care at home", "per client", M.HOME_ARPU, M.HOME_DIRECT),
            ("Palliative care at home", "per patient", M.PALL_HOME_ARPU, M.PALL_HOME_DIRECT)]:
        rows.append([name, unit, n(fee), n(fee * (1 - direct)), "%.0f%%" % (100 * (1 - direct))])
    rows.append(["Care home, %d beds" % BEDS, "%d long-stay and %d palliative filled"
                 % (M.RES_CAP, M.PALL_CAP), n(RES_REV), n(RES_EB) + " EBITDA",
                 pct(RES_EB, RES_REV)])
    rows.append(["Mortuary", "%d places, %d%% full" % (M.MORT_CAP[-1][1], 100 * M.MORT_FILL),
                 n(MORT_REV), n(MORT_EB) + " EBITDA", pct(MORT_EB, MORT_REV)])
    yy = table(c, rows, MX, y - 8, [200, 210, 110, 130, 84], size=10.5, pad=7,
               align=["l", "l", "r", "r", "r"])
    tracked(c, "KEY ASSUMPTIONS", MX, yy - 24, 8)
    bullets(c, ["Care home: staffing %s a month loaded with on-costs, nurses on every shift; "
                "building lease %s a year, paid a year ahead; building works %s and equipment %s"
                % (n(M.RES_STAFF), n(M.RES_RENT * 12), n(M.RES_CONVERSION), n(M.RES_CAPEX)),
                "Care home opens in %s with %d of %d beds filled, %d reserved by deposit, and "
                "adds about one a month" % (HOME_OPEN, M.RES_OPEN_OCC + M.PALL_OPEN_OCC, BEDS,
                                            M.DEPOSITS_AT_OPEN),
                "Mortuary: building and cold storage %s, site lease %s a year paid ahead; "
                "bodies held %d days on average" % (
                    n(sum(v for m, v in M.MORT_CAPEX if m < M.MORT_OPEN)), n(M.MORT_RENT * 12),
                    M.MORT_STAY),
                "Central team %s a month rising to %s; marketing %s rising to %s"
                % (n(M.CENTRAL[0][1]), n(M.CENTRAL[-1][1]), n(M.MARKETING[0][1]),
                   n(M.MARKETING[-1][1])),
                "Naira at ₦%s to the dollar throughout; all figures before tax"
                % c0(M.FX)], MX, yy - 44, 730, 10.5, 5)


def s_funding(c):
    chrome(c, "Funding")
    y = heading(c, "%s for %d%% covers the %s base-case peak. If the plan runs slow, the "
                   "peak reaches %s." % (RAISE_TXT, 100 * STAKE, n(PEAK), n(WORST)), max_w=740)
    top = y - 16
    tracked(c, "USE OF THE %s (%s)" % (RAISE_TXT.upper(), n(RAISE).upper()), MX, top, 8.5)
    tm = S["trough"]["m"]
    mort = sum(v for m, v in M.MORT_CAPEX if m <= tm)
    leases = sum(r["rent_paid"] for r in S["rows"][:tm])
    rows = [["Use", "₦m"],
            ["Mortuary: building, cold storage, vehicles", c0(mort / 1e6)],
            ["Care home: building works to a licensable home", c0(M.RES_CONVERSION / 1e6)],
            ["Care home: equipment, furnishing, nurse call, power, pre-opening", c0(M.RES_CAPEX / 1e6)],
            ["Leases to the low point, each a year paid ahead", c0(leases / 1e6)],
            ["Less cash earned by care at home and the mortuary, and deposits",
             c0((PEAK - CAPEX_TO_TROUGH - leases) / 1e6)],
            ["Reserve", c0((RAISE - PEAK) / 1e6)],
            ["Total", c0(RAISE / 1e6)]]
    table(c, rows, MX, top - 12, [356, 64], size=10.2, pad=6.5, bold_last=True)
    x2 = 500
    tracked(c, "IF THE PLAN RUNS SLOW", x2, top, 8.5)
    rows = [["Case", "Peak funding"]] + [[name, n(st["peak"])] for name, st in STRESS]
    table(c, rows, x2, top - 12, [200, PAGE_W - MX - x2 - 200], size=10.2, pad=6.5,
          bold_rows=(1,))
    para(c, "EBITDA is positive from %s and cumulative cash is back above zero by %s. "
         "Everything sits in Ilé: the leases, the building works, the equipment, the platform "
         "and the licences." % (EBITDA_POS, PAYBACK), MX, 120, 10.5, MUTED, PAGE_W - 2 * MX, 14)


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
    yy = table(c, rows, MX, y - 60, [180, 180, 180, 194], size=11.5, pad=10, bold_rows=(2,))
    para(c, "If the naira weakens to ₦2,000 to the dollar by exit, the 8x equity value is %s. "
         "Families abroad pay in dollars and pounds, which softens this." % usd(EXIT_WEAK[1][1]),
         MX, yy - 22, 10.5, MUTED, 720, 14)
    para(c, "The multiples are a discount to developed markets: Service Corporation "
         "International trades at about 12 times EBITDA and Amedisys sold for about 13 times.",
         MX, yy - 42, 10.5, MUTED, 720, 14)
    para(c, "Beyond year five: a second care home, a second mortuary, and the same record "
         "serving each. None of it is in these numbers.", MX, yy - 86, 11, INK, 720, 15,
         font="Sans-SB")


def s_risks(c):
    chrome(c, "Risks")
    y = heading(c, "What could go wrong, and what we do about it.")
    rows = [["Risk", "What we do about it"],
            ["The care home fills slowly", "It opens with places reserved by deposit and filled "
             "from care at home. The model assumes %d of %d beds on day one."
             % (M.RES_OPEN_OCC + M.PALL_OPEN_OCC, BEDS)],
            ["Families object to a care home", "We sell first to families abroad, who already "
             "pay others to care, and let the family record show the standard."],
            ["A clinical failure", "Admissions capped at an acuity ceiling set by the clinical "
             "co-founder. Every clinical entry audited. Two hospitals agree to receive "
             "emergencies before the care home opens."],
            ["Pain relief supply", "Controlled medicines are limited in Nigeria. We dispense "
             "through a licensed hospital pharmacy under the palliative lead."],
            ["The naira", "Families abroad pay in dollars or pounds, which covers imported "
             "consumables and equipment."],
            ["Losing trained staff", "Pay above the Lagos agency rate, a path from carer to "
             "nurse, and a clinical leadership share pool."]]
    table(c, rows, MX, y - 10, [220, PAGE_W - 2 * MX - 220], size=11.5, pad=9, align=["l", "l"])


def s_founders(c):
    """The founders slide from the full deck, with this deck's hires underneath."""
    hires = ["Head of care operations, for care at home and palliative care",
             "Care home manager, a registered nurse",
             "Palliative care lead nurse",
             "Mortuary manager"]
    real = D.bullets

    def swap(c_, items, *a, **k):
        return real(c_, hires if items and items[0].startswith("Head of technology") else items,
                    *a, **k)
    D.bullets = swap
    try:
        D.s_founders(c)
    finally:
        D.bullets = real


def s_plan(c):
    chrome(c, "Milestones")
    end = 48
    em = S["ebitda_positive"]["m"]
    y = heading(c, "All three businesses are trading by %s. EBITDA turns positive in %s and "
                   "keeps rising." % (HOME_OPEN, M.label(em)), max_w=740)
    x0, x1 = MX + 46, PAGE_W - MX
    xm = lambda m: x0 + (x1 - x0) * m / end
    ty = y - 40
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.4)
    c.line(x0, ty, x1, ty)
    marks = [(0, "Platform"), (M.HOME_CLIENTS[0][0], "Care at home"),
             (M.PALL_HOME[0][0], "Palliative at home"), (M.MORT_OPEN, "Mortuary opens"),
             (M.RESIDENCES[0], "Care home opens"), (em, "EBITDA positive"),
             (M.MORT_CAP[1][0], "Mortuary to %d places" % M.MORT_CAP[1][1])]
    levels = [12, -16]
    for k, (m, t) in enumerate(marks):
        key = t in ("Care home opens", "EBITDA positive")
        c.setFillColor(AMBER if key else GREEN)
        c.circle(xm(m), ty, 4.5 if key else 3.5, fill=1, stroke=0)
        lv = levels[k % 2]
        c.setStrokeColor(RULE)
        c.setLineWidth(0.6)
        c.line(xm(m), ty, xm(m), ty + (lv - 3 if lv > 0 else lv + 9))
        c.setFont("Sans-SB" if key else "Sans", 8.5)
        c.setFillColor(INK)
        c.drawString(xm(m) + 3, ty + lv, t)
        c.setFont("Sans", 7.5)
        c.setFillColor(MUTED)
        c.drawString(xm(m) + 3, ty + lv - 9, M.label(m) if m else "Oct 2026")
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
    c.drawString(MX, 56, "Cash is lowest at %s in %s, after the care home opens and before it "
                         "fills. The %s raise covers it." % (n(PEAK), TROUGH, RAISE_TXT))


def s_back(c):
    D._N[0] += 1
    c.setFillColor(DEEP)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    D.logo(c, MX, PAGE_H - 92, h=30, word=white)
    c.setFillColor(AMBER)
    c.rect(MX, PAGE_H / 2 + 70, 34, 2.5, fill=1, stroke=0)
    y = PAGE_H / 2 + 30
    c.setFont("Serif-SB", 32)
    c.setFillColor(white)
    for ln in wrap(c, "%s for %d%%, to %s of revenue and %s EBITDA by year five."
                   % (RAISE_TXT, 100 * STAKE, n(Y5["revenue"], 2), MARGIN5), "Serif-SB", 32, 660):
        c.drawString(MX, y, ln)
        y -= 40
    para(c, "End-of-life care in Lagos, at home, in a care home and after death, on one "
         "record, with the family abroad seeing every day of it.",
         MX, y - 10, 13, GTINT, 600, 19)
    c.setFont("Sans-SB", 12)
    c.setFillColor(white)
    c.drawString(MX, 84, "Kemi Balogun  ·  kemotoks@hotmail.com")
    c.setFont("Sans", 10)
    c.setFillColor(GTINT)
    c.drawString(MX, 50, "Figures are from the five-year operating model, before tax, at "
                         "₦%s to the dollar. Ilé is a working name." % c0(M.FX))


SLIDES = [s_cover, s_family, s_gap, s_market, s_businesses, s_flow, s_trust, s_mortuary,
          s_competition, s_validation, s_financials, s_units, s_plan, s_funding, s_returns,
          s_risks, s_founders, s_back]


def build(slides=SLIDES, out=OUT, title="Ilé, investor presentation"):
    D.TOTAL[0] = len(slides)
    D._N[0] = 0
    c = canvas.Canvas(str(out), pagesize=(PAGE_W, PAGE_H))
    c.setTitle(title)
    c.setAuthor("Ilé")
    for s in slides:
        s(c)
        c.showPage()
    c.save()
    print(out, D.TOTAL[0], "slides")


if __name__ == "__main__":
    build()
