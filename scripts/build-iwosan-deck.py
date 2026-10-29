"""
Build the Iwosan / IASO Medipark deck for Mrs Fola Laoye.

Landscape, slide per page, house system from scripts/cfa_deck.py. Written to
somebody Debo has known since the Doctoora raise and worked with on the Eti-Osa
isolation centre, so there is no introduction and no credentials pitch.

Run:
  python3 scripts/build-iwosan-deck.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_deck import (BODY, CREAM, DEEP_NAVY, DOCS, FOOTER, GOLD, IND, IND2, IND3, INK,
                      IVORY, LIGHT, MUTED, MX, NAVY, PAGE_H, PAGE_W, RULE, SAGE_D, SERIF,
                      SERIF_B, SERIF_I, SKY, SURFACE, TEAL, TOTAL, box, bullet_block,
                      callout, chevron_stack, chrome, hairline, heading, para,
                      simple_table, tracked, wrap)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "iwosan" / "iwosan-medipark-deck-cfa.pdf"

FOOTER[0] = "Consult for Africa   /   Private   /   For Mrs Fola Laoye"
TOTAL[0] = "13"


# ------------------------------------------------------------------ 01 -------
def slide_cover(c):
    c.setFillColor(IVORY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    try:
        img = ImageReader(str(DOCS / "c4a-logo.png"))
        iw, ih = img.getSize()
        dw = 166
        c.drawImage(img, MX, PAGE_H - 72, width=dw, height=dw * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFillColor(IND)
        c.setFont(SERIF_B, 15)
        c.drawString(MX, PAGE_H - 56, "CONSULT FOR AFRICA")

    tracked(c, "PREPARED FOR", PAGE_W - MX - 214, PAGE_H - 42, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    c.setFont(SERIF_B, 15)
    c.setFillColor(INK)
    c.drawRightString(PAGE_W - MX, PAGE_H - 64, "Mrs Fola Laoye")
    c.setFont(SERIF_I, 9.4)
    c.setFillColor(SAGE_D)
    c.drawRightString(PAGE_W - MX, PAGE_H - 80, "Chief Executive Officer")
    c.drawRightString(PAGE_W - MX, PAGE_H - 93, "Iwosan Investments  /  IASO Medipark")
    hairline(c, PAGE_W - MX - 240, PAGE_H - 104, 240, RULE, 0.7)
    hairline(c, MX, PAGE_H - 104, 300, RULE, 0.7)

    tracked(c, "PRIVATE  /  SEPTEMBER 2026", MX, PAGE_H - 138, "Helvetica-Bold", 7.6, GOLD, 2.4)

    c.setFont(SERIF, 30)
    c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 192, "Iwosan and Medipark")
    c.setFont(SERIF_B, 30)
    c.drawString(MX, PAGE_H - 230, "The year either side of opening")

    hairline(c, MX, PAGE_H - 254, 430, GOLD, 1.2)

    para(c, "What tends to get heavy in the twelve months on either side of an opening, what I would "
            "want to know before saying anything firmer, and what I could take off your plate.",
         MX, PAGE_H - 282, SERIF_I, 12.2, IND2, 430, 17.5)

    para(c, "Not a proposal. No fee in it. Written from the public record, because I have not seen "
            "your numbers.",
         MX, PAGE_H - 334, SERIF, 10.6, SAGE_D, 430, 15)

    chevron_stack(c, PAGE_W - MX - 196, 214, 176, 104, 19)

    sy = 168
    tracked(c, "WHERE THE PRESSURE SITS", MX, sy + 26, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    stages = [("01", "The ramp"), ("02", "The bench"), ("03", "Five addresses"),
              ("04", "The empty space"), ("05", "The payer mix")]
    cols = [IND, IND2, IND3, SKY, SAGE_D]
    for i, (num, lab) in enumerate(stages):
        sx = MX + i * 140
        c.setStrokeColor(cols[i])
        c.setLineWidth(2.6)
        c.line(sx, sy + 14, sx + 112, sy + 14)
        c.setFont("Helvetica-Bold", 6.6)
        c.setFillColor(cols[i])
        c.drawString(sx, sy, num)
        c.setFont(SERIF_B, 10.4)
        c.setFillColor(INK)
        c.drawString(sx + 16, sy, lab)

    hairline(c, MX, 104, PAGE_W - 2 * MX, RULE, 0.7)
    c.setFont(SERIF_B, 10.4)
    c.setFillColor(INK)
    c.drawString(MX, 84, "Dr Debo Odulana")
    c.setFont("Helvetica", 9)
    c.setFillColor(SAGE_D)
    c.drawString(MX, 69, "Founding Partner, Consult for Africa")
    c.drawRightString(PAGE_W - MX, 84, "hello@consultforafrica.com   /   +234 913 813 8553")
    c.drawRightString(PAGE_W - MX, 69, "consultforafrica.com   /   Private")


# ------------------------------------------------------------------ 02 -------
def slide_why(c):
    chrome(c, "Why I am writing")
    hy = heading(c, "The last time we worked on a building together, it had six weeks.")
    para(c, "You have known me since I was pitching Doctoora at you, and you watched the rest of it from "
            "Evercare through to Cedarcrest. So no introduction. Just the reason for the note.",
         MX, hy - 14, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 20, 16)

    y = hy - 68
    steps = [("2019", "Doctoora", "You saw the raise. It went on to run across 21 states and was "
                                  "acquired by Evercare"),
             ("2020", "Eti-Osa", "The isolation centre. 90 beds, a 10-bed ICU and the state reporting "
                                 "dashboard, live in six weeks"),
             ("2021", "Evercare", "Chief Innovation and Strategy Officer. USD 1.1m out, volume held, "
                                  "pay for performance in"),
             ("2024", "Cedarcrest", "Chief Executive. N1.0bn a month and N1bn H1 EBITDA, the best in "
                                    "the hospital's history"),
             ("Now", "Consult for Africa", "Advisory and venture firm. We take build and operate "
                                           "mandates, so the plans come back to us as a number")]
    cols = [IND, IND2, IND3, SKY, GOLD]
    bw = (PAGE_W - 2 * MX - 4 * 12) / 5.0
    for i, (yr, lab, txt) in enumerate(steps):
        bx = MX + i * (bw + 12)
        box(c, bx, y - 116, bw, 116, SURFACE if i < 4 else CREAM, cols[i], 4)
        c.setFont("Helvetica-Bold", 7.4)
        c.setFillColor(cols[i] if i < 4 else HexColor("#9A7B18"))
        c.drawString(bx + 14, y - 22, yr.upper())
        c.setFont(SERIF_B, 12.6)
        c.setFillColor(INK)
        c.drawString(bx + 14, y - 42, lab)
        para(c, txt, bx + 14, y - 62, "Helvetica", 8.9, BODY, bw - 28, 12.2)

    callout(c, MX, y - 152, PAGE_W - 2 * MX,
            "Medipark is a different order of thing entirely, but the questions in the months before a "
            "facility opens are largely the same questions. So the question I want to ask you is a simple "
            "one. What can I take off your plate?",
            bg=CREAM, spine=GOLD, fg=INK, size=13, leading=18)


# ------------------------------------------------------------------ 03 -------
def slide_map(c):
    chrome(c, "How I read it")
    hy = heading(c, "Six things that get heavy between groundbreaking and run rate",
                 size=22)
    para(c, "None of this is a claim about Iwosan. It is the pattern in facilities at this stage, written so "
            "you can test it against what you already know.",
         MX, hy - 14, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 20, 15.5)

    items = [("01", "A 140-bed hospital does not open, it ramps",
              "And under a forty year concession the ramp is the return"),
             ("02", "The scarce input is the consultant bench",
              "Eight to twelve months of lead time, and it is the proposition"),
             ("03", "A fifth address in Ikoyi is a portfolio question",
              "Minutes from your own hospitals, so growth can be transfer"),
             ("04", "The square metres that are not the hospital are businesses",
              "Four or five of them, and they are the ones that get forgotten"),
             ("05", "Twenty per cent of the beds sets the arithmetic for eighty",
              "Payer and tariff architecture has to exist before day one"),
             ("06", "Repatriating medical tourism is a purchasing decision",
              "Families buy certainty, which has to be packaged and priced")]
    y = hy - 60
    cw = (PAGE_W - 2 * MX - 26) / 2.0
    for i, (num, title, sub) in enumerate(items):
        col = i % 2
        row = i // 2
        x = MX + col * (cw + 26)
        yy = y - row * 106
        c.setFillColor(GOLD)
        c.rect(x, yy - 3, 22, 3, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 7.4)
        c.setFillColor(TEAL)
        c.drawString(x + 32, yy - 4, num)
        ny = para(c, title, x, yy - 26, SERIF_B, 13.4, INK, cw - 10, 17.5)
        para(c, sub, x, ny - 4, "Helvetica", 10.2, MUTED, cw - 10, 13.5)


# ------------------------------------------------------------------ 04 -------
def slide_ramp(c):
    chrome(c, "01  /  The ramp")
    hy = heading(c, "An opening is a date. A ramp is a curve. Plans confuse the two.")
    y = para(c, "The first ninety days after a hospital takes its first patient go to defect correction, "
                "induction, workflow rework and everything the drawings did not anticipate, which moves the "
                "revenue curve a quarter to the right while the cost base arrives on time and in full.",
             MX, hy - 16, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 320, 16.4)
    bullet_block(c, [
        ("Why it compounds.", "The early years are the ones a forty year concession earns off, so a "
                              "quarter lost at the start is not a quarter lost once."),
        ("Why it lingers.", "A facility that opens quiet acquires a reputation for being quiet, and that "
                            "takes a year of marketing to undo."),
        ("The answer is not to open faster.", "It is to open in a deliberate sequence, service line by "
                                              "service line, with the monthly ramp modelled and one person "
                                              "accountable to the number rather than to the date."),
    ], MX, y - 22, PAGE_W - 2 * MX - 320, size=11.2, leading=15, gap=13)

    px = PAGE_W - MX - 262
    box(c, px, 132, 262, 258, SURFACE)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(TEAL)
    c.drawString(px + 20, 362, "THE SHAPE OF THE FIRST YEAR")
    bx, by, bw, bh = px + 22, 176, 218, 150
    c.setStrokeColor(LIGHT)
    c.setLineWidth(0.8)
    c.line(bx, by, bx + bw, by)
    c.line(bx, by, bx, by + bh)
    pts_plan = [(0, 0.06), (0.2, 0.34), (0.4, 0.62), (0.6, 0.82), (0.8, 0.94), (1.0, 1.0)]
    pts_real = [(0, 0.02), (0.2, 0.08), (0.4, 0.26), (0.6, 0.52), (0.8, 0.76), (1.0, 0.92)]
    for pts, col, lw in ((pts_plan, SKY, 2.0), (pts_real, GOLD, 2.6)):
        pth = c.beginPath()
        pth.moveTo(bx + pts[0][0] * bw, by + pts[0][1] * bh)
        for fx, fy in pts[1:]:
            pth.lineTo(bx + fx * bw, by + fy * bh)
        c.setStrokeColor(col)
        c.setLineWidth(lw)
        c.drawPath(pth, stroke=1, fill=0)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(SKY)
    c.drawString(bx + 4, by + bh + 6, "The plan")
    c.setFillColor(HexColor("#9A7B18"))
    c.drawString(bx + 108, by + 30, "What actually happens")
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(bx, by - 13, "Month 1")
    c.drawRightString(bx + bw, by - 13, "Month 12")
    c.setFont(SERIF_I, 9.4)
    c.setFillColor(HexColor("#5A6478"))
    c.drawString(px + 20, 152, "The gap between the two lines is funded")
    c.drawString(px + 20, 140, "by somebody. Usually the shareholder.")


# ------------------------------------------------------------------ 05 -------
def slide_bench(c):
    chrome(c, "02  /  The bench")
    hy = heading(c, "The scarce input is the consultant bench, not the capital")
    y = para(c, "A multi-specialist hospital of this size needs a named consultant in every service line "
                "that carries margin. Counting notice periods, credentialling and relocation, that is a "
                "recruitment problem with eight to twelve months of lead time.",
             MX, hy - 16, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 20, 16.4)

    cards = [("Leave it to the construction timetable",
              "You open on locum and visiting cover in exactly the specialties where continuity is what "
              "the patient is paying for.", HexColor("#FDF3E3"), HexColor("#C77B30")),
             ("The first six months set the reputation",
              "Referring doctors decide who works there early, and that judgement is expensive and slow "
              "to correct afterwards.", SURFACE, IND3),
             ("The bench is the proposition",
              "If Medipark is meant to keep Nigerian patients in Nigeria, the names on the rota are the "
              "product, not the equipment.", CREAM, GOLD)]
    cw = (PAGE_W - 2 * MX - 2 * 16) / 3.0
    yy = y - 38
    for i, (t, b, bg, sp) in enumerate(cards):
        bx = MX + i * (cw + 16)
        box(c, bx, yy - 130, cw, 130, bg, sp, 4)
        ny = para(c, t, bx + 16, yy - 28, SERIF_B, 12.6, INK, cw - 32, 16)
        para(c, b, bx + 16, ny - 8, "Helvetica", 9.8, BODY, cw - 32, 13.4)

    callout(c, MX, yy - 158, PAGE_W - 2 * MX,
            "Senior Nigerians practising abroad have to be worked as a real recruitment channel, with "
            "terms, sessions and a landing plan, rather than as a line in a launch announcement.",
            bg=SURFACE, spine=TEAL, fg=NAVY, size=12.4, leading=17)


# ------------------------------------------------------------------ 06 -------
def slide_portfolio(c):
    chrome(c, "03  /  The portfolio")
    hy = heading(c, "Awolowo Road is minutes from two hospitals you already own")
    y = para(c, "Which means the decision that matters is not what Medipark can do. It is what each of the "
                "five addresses is now for.",
             MX, hy - 16, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 20, 16.4)

    sites = ["Ikeja", "Apapa", "Victoria Island", "Ikoyi", "Medipark"]
    sw = (PAGE_W - 2 * MX - 4 * 14) / 5.0
    yy = y - 34
    for i, s in enumerate(sites):
        bx = MX + i * (sw + 14)
        last = i == 4
        box(c, bx, yy - 52, sw, 52, CREAM if last else SURFACE, GOLD if last else IND3, 4)
        c.setFont(SERIF_B, 13)
        c.setFillColor(INK)
        c.drawString(bx + 14, yy - 24, s)
        c.setFont("Helvetica", 8.6)
        c.setFillColor(MUTED)
        c.drawString(bx + 14, yy - 39, "Iwosan Lagoon" if not last else "140 beds, opening")

    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(TEAL)
    c.drawString(MX, yy - 84, "WITHOUT AN EXPLICIT POSITION, THREE THINGS HAPPEN")
    bullet_block(c, [
        ("", "The new asset gets priced as a better version of a hospital you already own, because the "
             "existing schedule is the nearest reference point anybody has."),
        ("", "The same consultants split their sessions across two of your buildings, and neither rota "
             "is full."),
        ("", "A share of the volume that arrives looks like growth while it is actually transfer, which "
             "shows up first in the Ikoyi and Victoria Island books."),
    ], MX, yy - 106, PAGE_W - 2 * MX - 336, size=11, leading=14.6, gap=9)

    px = PAGE_W - MX - 282
    box(c, px, 96, 282, 158, SURFACE, TEAL, 4)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(TEAL)
    c.drawString(px + 20, 228, "THREE DECISIONS, BEST MADE ON PAPER")
    for i, t in enumerate(["Which service lines sit where",
                           "How referral flows between sites are designed and rewarded",
                           "Who owns the profit and loss for a patient who could go to either"]):
        yy2 = 204 - i * 36
        c.setFillColor(GOLD)
        c.rect(px + 20, yy2 - 2, 7, 3, fill=1, stroke=0)
        para(c, t, px + 34, yy2, "Helvetica", 10, BODY, 226, 13.4)


# ------------------------------------------------------------------ 07 -------
def slide_metres(c):
    chrome(c, "04  /  The square metres")
    hy = heading(c, "Four or five businesses sit on that campus besides the hospital")
    y = para(c, "Each one has a tenant or an operator, a tariff, an occupancy assumption and somebody whose "
                "job it is to fill it. What happens in practice is that the hospital absorbs every hour of "
                "management attention in the opening year, because the hospital is the thing that can hurt "
                "somebody, and the rest of the floor plate sits empty for eighteen months while carrying "
                "its share of the cost.",
             MX, hy - 16, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 320, 16.4)

    bullet_block(c, [
        ("Diagnostics.", "Its own referral base, its own price list, and outside demand from the moment "
                         "it is accredited."),
        ("Training.", "A school, a continuing education business, a recruitment funnel, or all three. "
                      "Each earns differently."),
        ("Retail medical.", "A rent roll, with a tenant mix that either feeds the hospital or competes "
                            "with it."),
        ("Residential.", "The most forgiving line on the campus and usually the first one paying."),
    ], MX, y - 20, PAGE_W - 2 * MX - 320, size=11, leading=14.6, gap=10)

    px = PAGE_W - MX - 268
    box(c, px, 150, 268, 250, CREAM, GOLD, 5)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(HexColor("#9A7B18"))
    c.drawString(px + 22, 372, "FROM A CAMPUS WE STRUCTURED LAST YEAR")
    c.setFont(SERIF_B, 46)
    c.setFillColor(INK)
    c.drawString(px + 22, 316, "~1/3")
    para(c, "of stabilised campus revenue came from the lines that were not the anchor clinical service.",
         px + 22, 300, "Helvetica", 10.6, BODY, 226, 14.4)
    hairline(c, px + 22, 254, 224, HexColor("#E3D6AE"), 0.8)
    para(c, "And the fastest of them was paying before the anchor service was. Which is the whole argument "
            "for giving each line a profit and loss, an occupancy target and a name against it well before "
            "the doors open.",
         px + 22, 236, SERIF_I, 10.6, HexColor("#5A6478"), 226, 14.6)


# ------------------------------------------------------------------ 08 -------
def slide_eighty(c):
    chrome(c, "05  /  The eighty per cent")
    hy = heading(c, "Twenty per cent of the beds sets the arithmetic for the other eighty",
                 size=22)
    y = para(c, "Reserving a fifth of the beds for indigent patients is the right thing to have negotiated, "
                "and it is also the most demanding piece of commercial design in the project, because the "
                "remaining beds carry a fixed cost base at an occupancy and a price that a concession has "
                "already shaped.",
             MX, hy - 16, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 20, 16.4)

    rows = [["What has to be settled before day one", "The question inside it"],
            ["The self-pay proposition",
             "Why a family chooses you at your price, said in a sentence that is not about equipment"],
            ["Corporate, embassy and international accounts",
             "Which are signed rather than discussed, because contracting takes longer than commissioning"],
            ["The managed care position",
             "Which schemes you take, at what tariff, and where you are willing to refuse"],
            ["The reserved beds",
             "Funded, reported and staffed as a programme with its own accountability, rather than "
             "absorbed as a loss and quietly resented by the people delivering it"],
            ["Medical tourism pathways",
             "Three or four packaged end to end at one price, consultant named, escalation written down, "
             "live on day one. Families are buying certainty, not capability"]]
    simple_table(c, rows, MX, y - 26, [268, PAGE_W - 2 * MX - 268], size=10.4, leading=14, pad=9)


# ------------------------------------------------------------------ 09 -------
def slide_conditionals(c):
    chrome(c, "If, then expect")
    hy = heading(c, "Conditionals, because I have not seen your numbers")
    rows = [["If", "Then expect", "What I would do about it now"],
            ["Senior recruitment runs on the construction timetable",
             "Opening on locum cover in the specialties that carry margin, and a first year spent buying "
             "back a reputation",
             "Run the bench now as a named-seat exercise by specialty, diaspora included, with assessment "
             "on every senior hire"],
            ["The campus is underwritten as one building",
             "Eighteen months of empty non-clinical floor plate carrying its share of the fixed cost",
             "Give each line its own profit and loss, occupancy target and named owner before opening"],
            ["Tariffs are set against the existing Lagoon schedule",
             "The new asset reads as a better version of a hospital you own, and volume is transfer "
             "rather than growth",
             "Price the campus separately, with a written position on what each of the five addresses "
             "is for"],
            ["The opening is planned as a single date",
             "The first ninety days go to defects and induction, and the first-year miss is blamed on "
             "demand",
             "Sequence by service line, high certainty first, and model the ramp monthly with one owner"],
            ["Medical tourism is positioned as a capability",
             "Enquiries in volume and conversions in single figures",
             "Package three or four pathways end to end, one price, named consultant, written escalation"],
            ["Support functions are shared with the group without a settled operating model",
             "The best people at Lagoon get pulled into Medipark and four hospitals soften at the wrong "
             "moment",
             "Settle the group operating model first: what consolidates, what stays local, who backfills"]]
    simple_table(c, rows, MX, hy - 20, [204, 250, PAGE_W - 2 * MX - 454],
                 size=10, leading=13.2, pad=8.5)


# ------------------------------------------------------------------ 10 -------
def slide_unknown(c):
    chrome(c, "What I do not know")
    hy = heading(c, "The seven questions that would change everything I have just said",
                 size=22)
    para(c, "I would rather tell you what I cannot see than write around it. Each of these moves my view "
            "materially, and each is answerable in a conversation rather than a study.",
         MX, hy - 14, "Helvetica", 11, BODY, PAGE_W - 2 * MX - 20, 15)
    rows = [["", "The question I would ask first"],
            ["The ramp", "What the commissioning plan assumes month by month for year one, whether it is "
                          "modelled or asserted, and who personally owns that number"],
            ["The bench", "Where senior recruitment stands by specialty, counted in signed terms rather "
                          "than expressions of interest"],
            ["The rent roll", "Whether the non-clinical space has an occupancy assumption, a pricing basis "
                              "and an accountable owner, or is still described as future upside"],
            ["The payer position", "The strategy for the eighty per cent, and which corporate, embassy and "
                                   "international accounts are signed rather than in discussion"],
            ["The group", "How the four existing hospitals change once the fifth address opens, and whether "
                          "that is written down anywhere the management teams can read it"],
            ["The academy", "What the training facility is expected to earn, and whether it is a school, a "
                            "CPD business, a recruitment funnel or all three"],
            ["The consortium", "How delivery responsibility divides between the partners once the building "
                               "is finished, because operating asks for a different structure from building"]]
    simple_table(c, rows, MX, hy - 54, [150, PAGE_W - 2 * MX - 150],
                 size=10, leading=13.4, pad=8)


# ------------------------------------------------------------------ 11 -------
def slide_useful(c):
    chrome(c, "Where I could be useful")
    hy = heading(c, "Six shapes of help. Take one, or none.")
    para(c, "Pieces of work rather than a programme. Each one stands alone, and each one starts as two or "
            "three weeks with a fixed scope.",
         MX, hy - 14, "Helvetica", 11, BODY, PAGE_W - 2 * MX - 20, 15)

    items = [("Commissioning and activation",
              "A sequenced opening plan service line by service line, the ramp modelled monthly, readiness "
              "gates defined, and the first ninety days planned as an operating period rather than a launch"),
             ("The consultant bench",
              "Named-seat recruitment in the specialties that carry margin, diaspora included, structured "
              "assessment on every senior appointment, and pay that survives the second year"),
             ("Campus economics",
              "Diagnostics, training, retail and residential run as businesses with tenants, tariffs, "
              "occupancy targets and owners. This is the work we did on a campus of comparable ambition"),
             ("Payer and tariff architecture",
              "Price positions by site and service line, the self-pay proposition, corporate and "
              "international contracting, and the funding design for the reserved beds"),
             ("Group operating model",
              "What sits where across five addresses, how referral flows are designed and rewarded, where "
              "support functions consolidate, and how the existing hospitals are protected"),
             ("Fractional or seconded leadership",
              "If what is missing is a pair of experienced hands inside the building rather than a view "
              "from outside it. We second executives on fixed terms and hold the operating result")]
    cw = (PAGE_W - 2 * MX - 2 * 16) / 3.0
    for i, (t, b) in enumerate(items):
        col = i % 3
        row = i // 3
        bx = MX + col * (cw + 16)
        yy = hy - 78 - row * 132
        box(c, bx, yy - 118, cw, 118, SURFACE if row == 0 else CREAM,
            IND3 if row == 0 else GOLD, 4)
        ny = para(c, t, bx + 16, yy - 26, SERIF_B, 12.4, INK, cw - 32, 16)
        para(c, b, bx + 16, ny - 6, "Helvetica", 9.4, BODY, cw - 32, 12.8)


# ------------------------------------------------------------------ 12 -------
def slide_firm(c):
    chrome(c, "Consult for Africa")
    hy = heading(c, "The part of the story you will not know")
    para(c, "A healthcare advisory and venture firm in Lagos and Abuja, built by operators. We take build "
            "and operate mandates as well as advisory ones, which means the plans we write come back to us "
            "as a number we have to hit. I run it alongside the health technology companies I founded.",
         MX, hy - 14, "Helvetica", 10.8, BODY, PAGE_W - 2 * MX - 20, 14.8)

    lx, lw = MX, 392
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(TEAL)
    c.drawString(lx, hy - 70, "WHAT WE DO")
    practice = ["Turnaround and financial recovery",
                "Strategy, growth and commercial performance",
                "Build, commission and operate",
                "Clinical governance, quality and accreditation",
                "Workforce, senior recruitment and leadership",
                "Fractional leadership and executive secondments",
                "Digital, hospital systems and decision reporting"]
    yy = hy - 94
    for t in practice:
        c.setFillColor(GOLD)
        c.rect(lx, yy - 2, 7, 3, fill=1, stroke=0)
        c.setFont("Helvetica", 10.6)
        c.setFillColor(BODY)
        c.drawString(lx + 16, yy - 3, t)
        yy -= 22
    hairline(c, lx, yy + 4, lw - 20, RULE, 0.7)
    para(c, "Senior recruitment runs off a verified registry of more than ten thousand Nigerian clinicians "
            "that we build and maintain in house.",
         lx, yy - 12, SERIF_I, 10, HexColor("#5A6478"), lw - 20, 13.4)

    rx = MX + 420
    rw = PAGE_W - MX - rx
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(TEAL)
    c.drawString(rx, hy - 70, "SELECTED RESULTS")
    stats = [("N1.0bn", "a month and N1bn H1 EBITDA at Cedarcrest Abuja, under me as chief executive. "
                        "The best year in its history"),
             ("USD 1.1m", "of annualised cost out at Evercare Lekki, with clinical volume held"),
             ("N1.7bn", "medical campus structured last year: measured geometry, rent roll, monthly cash "
                        "model, peak funding and payback"),
             ("N2bn+", "of planned annual revenue underwritten since the firm was founded, across five "
                       "health businesses")]
    yy = hy - 96
    for big, rest in stats:
        c.setFont(SERIF_B, 20)
        c.setFillColor(INK)
        c.drawString(rx, yy - 16, big)
        w = c.stringWidth(big, SERIF_B, 20)
        ny = para(c, rest, rx + w + 10, yy - 14, "Helvetica", 9.6, BODY, rw - w - 10, 12.8)
        yy = min(ny - 8, yy - 44)
    c.setFont("Helvetica", 8.6)
    c.setFillColor(MUTED)
    c.drawString(rx, yy + 2, "Client names withheld where the work is live. References on request.")


# ------------------------------------------------------------------ 13 -------
def slide_close(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 5, PAGE_W, 5, fill=1, stroke=0)

    try:
        img = ImageReader(str(DOCS / "c4a-logo-reversed.png"))
        iw, ih = img.getSize()
        dw = 150
        c.drawImage(img, MX, PAGE_H - 70, width=dw, height=dw * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        pass

    tracked(c, "THE ASK", MX, PAGE_H - 132, "Helvetica-Bold", 7.6, GOLD, 2.4)
    c.setFont(SERIF, 27)
    c.setFillColor(white)
    c.drawString(MX, PAGE_H - 182, "A conversation, not a mandate.")
    c.setFont(SERIF_B, 27)
    c.drawString(MX, PAGE_H - 218, "Tell me what is heaviest this month.")
    hairline(c, MX, PAGE_H - 244, 420, GOLD, 1.2)

    para(c, "I will tell you honestly whether it is something we should be doing for you or whether you "
            "have it covered already. If the timing is wrong, say so and I will come back after you have "
            "opened, because the second year of a campus asks harder questions than the first and I would "
            "be glad to be useful then instead.",
         MX, PAGE_H - 274, SERIF_I, 12.6, HexColor("#AEBBD4"), 430, 18)

    para(c, "Either way, I would love to see the place before it opens.",
         MX, PAGE_H - 382, SERIF_B, 13.4, GOLD, 430, 18)

    chevron_stack(c, PAGE_W - MX - 230, 196, 200, 120, 21,
                  colours=[(HexColor("#1B2A4A"), 9.0), (HexColor("#2C3C66"), 7.2),
                           (HexColor("#3F5180"), 5.6), (SKY, 4.2)])

    c.setFillColor(GOLD)
    c.rect(MX, 112, 52, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 11)
    c.setFillColor(white)
    c.drawString(MX, 90, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 9.4)
    c.setFillColor(HexColor("#AEBBD4"))
    c.drawString(MX, 74, "Consult for Africa Management Services Limited")
    c.drawString(MX, 58, "hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com")
    c.drawString(MX, 42, "Lagos and Abuja, Nigeria")


SLIDES = [slide_cover, slide_why, slide_map, slide_ramp, slide_bench, slide_portfolio,
          slide_metres, slide_eighty, slide_conditionals, slide_unknown, slide_useful,
          slide_firm, slide_close]


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Iwosan and Medipark - the year either side of opening - Consult for Africa")
    c.setAuthor("Consult for Africa")
    for fn in SLIDES:
        fn(c)
        c.showPage()
    c.save()
    print("wrote %s" % OUT)
