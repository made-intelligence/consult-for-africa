"""
ilé investor summary on one A4 page, portrait, in the ilé brand.

Reuses the deck's fonts, palette, drawing primitives and figures, so the page
cannot disagree with the deck. Every number comes from scripts/ile_model.py.

    python3 scripts/build-ile-one-pager.py
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

from reportlab.lib.colors import white
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("ile_deck", HERE / "build-ile-investor-deck.py")
D = importlib.util.module_from_spec(spec)
spec.loader.exec_module(D)
M = D.M

OUT = D.ROOT / "docs" / "Ile - Investor Summary, One Page.pdf"
W, H = A4
MX = 40


def section(c, label, x, y):
    D.tracked(c, label, x, y, 7.5, D.GREEN)
    return y - 14


def build():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("Ilé, investor summary")
    c.setAuthor("Ilé")
    c.setFillColor(D.GROUND)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # header band
    c.setFillColor(D.GREEN)
    c.rect(0, H - 150, W, 150, fill=1, stroke=0)
    D.logo(c, MX, H - 50, h=22, word=white)
    c.setFont("Sans", 8)
    c.setFillColor(D.GTINT)
    c.drawRightString(W - MX, H - 42, "Investor summary  ·  October 2026  ·  Confidential")
    c.setFont("Serif-SB", 21)
    c.setFillColor(white)
    c.drawString(MX, H - 86, "Care for the last years of life in Lagos,")
    c.drawString(MX, H - 110, "built for families abroad.")
    c.setFont("Sans", 9.5)
    c.setFillColor(D.GTINT)
    c.drawString(MX, H - 132, "Concierge geriatric care, care at home, rehabilitation, residential and "
                              "palliative care, and mortuary services, on one record.")
    # the ask, top right
    bx, bw = W - MX - 150, 150
    c.setFillColor(D.AMBER)
    c.roundRect(bx, H - 122, bw, 58, 6, fill=1, stroke=0)
    c.setFont("Serif-SB", 18)
    c.setFillColor(white)
    c.drawString(bx + 12, H - 90, "%s for %d%%" % (D.RAISE_TXT, 100 * D.STAKE))
    c.setFont("Sans", 8)
    c.drawString(bx + 12, H - 106, "Pre-seed. %s post-money." % D.usd(D.POST_USD))

    col = (W - 2 * MX - 20) / 2
    lx, rx = MX, MX + col + 20
    y = H - 178

    # left column: the problem and the gap
    y = section(c, "THE PROBLEM", lx, y)
    y = D.para(c, "Ngozi lives in London. Her mother lives alone in Lekki. When her mother falls, "
               "Ngozi hires a carer she never meets. After a hip operation there is no one to "
               "help her walk again. The homes Ngozi finds have no nurse at night. At the end, "
               "a cousin manages the pain. When she dies, the hospital mortuary is full. Ngozi "
               "pays for all of it, in pieces, and sees none of it.",
               lx, y, 8.8, D.BODY, col, 11.8) - 10
    y = section(c, "THE GAP", lx, y)
    gaps = [("Ageing at home", "No vetted carers, no proof the visit happened"),
            ("Post hospital stay", "Too few step-down beds, no rehabilitation at home"),
            ("Needing care", "No nursing-grade residence with a nurse at night"),
            ("The last months", "No hospice outside cancer care"),
            ("After death", "No mortuary between Lagos Island and Epe")]
    for st, g in gaps:
        c.setFont("Sans-SB", 8.6)
        c.setFillColor(D.INK)
        c.drawString(lx, y, st)
        y = D.para(c, g, lx + 92, y, 8.6, D.BODY, col - 92, 11) - 3
    y -= 6
    y = section(c, "THE MARKET", lx, y)
    y = D.para(c, "Abroad, five companies earn $17bn a year from these stages; buyers pay 12 to "
               "13 times EBITDA. Nigeria has 14.8m people aged 60 and over and 20m+ abroad who "
               "sent home $21.8bn in 2025. Premium end-of-life care in Lagos alone is worth %s a "
               "year. Year five needs %s of it." % (D.n(D.MKT["total"], 0),
                                                    D.pct(D.Y5["revenue"], D.MKT["total"])),
               lx, y, 8.8, D.BODY, col, 11.8) - 10
    y = section(c, "OUR PROMISE", lx, y)
    D.bullets(c, ["You will know who is in your mother's house, and that the visit happened",
                  "A nurse will be awake every night",
                  "Her pain will be managed, and someone will be with her",
                  "She will be kept with dignity until you are home"],
              lx, y, col, 8.6, 2)

    # right column: what ilé does, numbers, team
    y = H - 178
    y = section(c, "TWELVE REVENUE STREAMS", rx, y)
    streams = [("Concierge geriatric care", "s_concierge"), ("Care at home", "s_home"),
               ("Virtual consultations", "s_consult"), ("Post-operative rehabilitation", "s_rehab"),
               ("Step-down beds", "s_step"), ("Residence", "s_long"),
               ("Palliative wing", "pall_rev"), ("Palliative care at home", "s_pall_home"),
               ("Mortuary preservation", "s_preserve"), ("Preparation and repatriation", None),
               ("Autopsy and pathology", "s_autopsy"), ("Software licence", "saas_rev")]
    rows = [["Stream", "Y5 ₦m"]]
    for name, k in streams:
        v = D.Y5[k] if k else D.Y5["s_case"] + D.Y5["s_repat"]
        rows.append([name, D.c0(v / 1e6)])
    y = D.table(c, rows, rx, y + 4, [col - 60, 60], size=8, pad=3.2) - 14
    y = section(c, "THE NUMBERS", rx, y)
    stats = [(D.n(D.Y5["revenue"], 2), "revenue, year five"), (D.MARGIN5, "EBITDA, year five"),
             (D.EBITDA_POS, "EBITDA positive"), (D.n(D.PEAK), "peak funding, covered")]
    sw = col / 2
    for i, (v, lab) in enumerate(stats):
        sx = rx + (i % 2) * sw
        sy = y - (i // 2) * 38
        c.setFont("Serif-SB", 16)
        c.setFillColor(D.GREEN)
        c.drawString(sx, sy - 12, v)
        c.setFont("Sans", 7.8)
        c.setFillColor(D.BODY)
        c.drawString(sx, sy - 24, lab)
    y -= 84
    y = section(c, "THE FOUNDERS", rx, y)
    for name, line in [("Kemi Balogun", "Co-founder. CCO, TotalEnergies Staff Housing Cooperative; "
                                        "closed $40m for Louisville, Eko Atlantic"),
                       ("Dr Debo Odulana", "Co-founder and promoter. Founding Partner, Consult "
                                           "for Africa; former CEO, Cedarcrest; built and sold "
                                           "Doctoora"),
                       ("Dr Chris Anele", "Clinical co-founder. Consultant neurosurgeon, "
                                          "Evercare Lekki; FWACS, AO Spine fellow")]:
        c.setFont("Sans-SB", 8.8)
        c.setFillColor(D.INK)
        c.drawString(rx, y, name)
        y = D.para(c, line, rx, y - 11, 8.2, D.BODY, col, 10.5) - 6

    # five years across the page
    y5 = 200
    D.tracked(c, "FIVE YEARS", MX, y5, 7.5, D.GREEN)
    rows = [["₦m"] + ["Y%d" % (i + 1) for i in range(5)]]
    for lab, k in [("Revenue", "revenue"), ("EBITDA", "ebitda")]:
        rows.append([lab] + [D.c0(yr[k] / 1e6) for yr in D.Y])
    rows.append(["EBITDA margin"] + [D.pct(yr["ebitda"], yr["revenue"]) for yr in D.Y])
    rows.append(["Cash, cumulative, before the raise"] + [D.c0(yr["end_cum"] / 1e6) for yr in D.Y])
    wtab = W - 2 * MX
    yy = D.table(c, rows, MX, y5 - 8, [wtab - 5 * 70] + [70] * 5, size=8.6, pad=4.5)
    D.para(c, "Year one is November 2026 to October 2027. Before tax. Residence two opens in "
           "%s, paid for from cash flow. No further equity in the plan." % M.label(M.RESIDENCES[1]),
           MX, yy - 12, 7.8, D.MUTED, wtab, 10)

    # footer band
    c.setFillColor(D.DEEP)
    c.rect(0, 0, W, 46, fill=1, stroke=0)
    c.setFont("Sans-SB", 9)
    c.setFillColor(white)
    c.drawString(MX, 26, "Kemi Balogun  ·  kemotoks@hotmail.com")
    c.setFont("Sans", 7.5)
    c.setFillColor(D.GTINT)
    c.drawString(MX, 14, "Figures from the five-year operating model, before tax, at ₦%s to the "
                         "dollar. Ilé is a working name." % D.c0(M.FX))
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
