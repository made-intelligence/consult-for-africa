"""
Consult for Africa: the company profile deck.

The deck that follows the introduction on WhatsApp. Not the generic
seven-practice profile: five capabilities, chosen because they bear on a group
opening a 140-bed mixed-use campus while running Lagoon and Euracare, each with
the proof for it on the same slide. Nothing on the bench or the diaspora, which
she has through Euracare. No fees.

Run:
  python3 scripts/build-cfa-profile-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_deck import (BODY, CREAM, DEEP_NAVY, DOCS, FOOTER, GOLD, IND, IND2, IND3, INK,
                      IVORY, LIGHT, MUTED, MX, NAVY, PAGE_H, PAGE_W, RULE, SAGE_D, SERIF,
                      SERIF_B, SERIF_I, SKY, SURFACE, TEAL, TOTAL, box, bullet_block,
                      callout, chevron_stack, chrome, hairline, heading, para,
                      simple_table, tracked)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "iwosan" / "cfa-profile-deck-iwosan.pdf"

FOOTER[0] = "Consult for Africa   /   Capabilities   /   Private, for Mrs Fola Laoye"
TOTAL[0] = "10"


# ------------------------------------------------------------------ 01 -------
PANEL = HexColor("#13263A")
PALE = HexColor("#AEBBD4")
GOLD_D = HexColor("#9A7B18")


def slide_cover(c):
    c.setFillColor(IVORY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # the mark, very large and very quiet, bled off the right edge
    chevron_stack(c, PAGE_W - 286, 236, 400, 236, 32,
                  colours=[(HexColor("#EEF2F7"), 16.0), (HexColor("#E7EDF4"), 13.0),
                           (HexColor("#E0E8F1"), 10.0), (HexColor("#D9E3EE"), 7.5)])

    try:
        img = ImageReader(str(DOCS / "c4a-logo.png"))
        iw, ih = img.getSize()
        dw = 180
        c.drawImage(img, MX, PAGE_H - 78, width=dw, height=dw * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFillColor(INK)
        c.setFont(SERIF_B, 15)
        c.drawString(MX, PAGE_H - 56, "CONSULT FOR AFRICA")

    tracked(c, "PREPARED FOR", PAGE_W - MX - 196, PAGE_H - 44, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    c.setFont(SERIF_B, 15)
    c.setFillColor(INK)
    c.drawRightString(PAGE_W - MX, PAGE_H - 66, "Mrs Fola Laoye")
    c.setFont(SERIF_I, 9.6)
    c.setFillColor(SAGE_D)
    c.drawRightString(PAGE_W - MX, PAGE_H - 83, "Chief Executive Officer")
    c.drawRightString(PAGE_W - MX, PAGE_H - 97, "Iwosan Investments  /  IASO Medipark")

    tracked(c, "AN INTRODUCTION  /  OCTOBER 2026", MX, PAGE_H - 152,
            "Helvetica-Bold", 7.6, GOLD, 2.4)

    c.setFont(SERIF, 34)
    c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 208, "Healthcare advisory")
    c.setFont(SERIF_B, 34)
    c.drawString(MX, PAGE_H - 250, "that carries the operating result")

    hairline(c, MX, PAGE_H - 278, 300, GOLD, 1.4)

    para(c, "We build, commission, fix and run health businesses in Nigeria, and we take build and "
            "operate mandates as well as advisory ones, so the plans we write come back to us as a "
            "number we have to hit.",
         MX, PAGE_H - 308, SERIF_I, 12.6, IND2, 470, 18)

    # three numbers rather than five category labels
    tiles = [("N1.7bn", "medical campus structured and costed, twelve businesses in occupation"),
             ("6 weeks", "from nothing to live for a 90-bed field hospital and its intensive care unit"),
             ("10,000+", "verified Nigerian clinicians on a registry we build and maintain ourselves")]
    tw = (PAGE_W - 2 * MX - 2 * 18) / 3.0
    for i, (big, cap) in enumerate(tiles):
        tx = MX + i * (tw + 18)
        c.setFillColor(SURFACE)
        c.roundRect(tx, 104, tw, 96, 7, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(tx, 196, 46, 3, fill=1, stroke=0)
        c.setFont(SERIF_B, 25)
        c.setFillColor(INK)
        c.drawString(tx + 18, 160, big)
        para(c, cap, tx + 18, 146, "Helvetica", 9, BODY, tw - 36, 12.4)

    c.setFont(SERIF_B, 10.4)
    c.setFillColor(INK)
    c.drawString(MX, 70, "Dr Debo Odulana")
    c.setFont("Helvetica", 9)
    c.setFillColor(SAGE_D)
    c.drawString(MX, 55, "Founding Partner, Consult for Africa")
    c.drawRightString(PAGE_W - MX, 70, "hello@consultforafrica.com   /   +234 913 813 8553")
    c.drawRightString(PAGE_W - MX, 55, "consultforafrica.com   /   Lagos and Abuja")


# ------------------------------------------------------------------ 02 -------
def slide_origin(c):
    chrome(c, "Where this comes from")
    hy = heading(c, "Sixteen years of running hospitals")
    para(c, "Consult for Africa came out of the operating jobs, not out of a consulting firm.",
         MX, hy - 14, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 20, 16)

    y = hy - 68
    steps = [("2019", "Doctoora", "A technology-enabled private healthcare network built from nothing "
                                  "across 21 states, and sold to Evercare"),
             ("2020", "Eti-Osa", "The COVID isolation centre. 90 beds, a 10-bed ICU and the state "
                                 "reporting dashboard, live in six weeks"),
             ("2021", "Evercare", "Chief Innovation and Strategy Officer. USD 1.1m of cost out with "
                                  "volume held, and pay for performance in"),
             ("2024", "Cedarcrest", "Chief Executive. N1.0bn a month and N1bn H1 EBITDA, the strongest "
                                    "year in the hospital's history"),
             ("Now", "Consult for Africa", "The same work, done for owners and boards rather than for "
                                           "one employer, and increasingly with our own money in it")]
    cols = [IND, IND2, IND3, SKY, GOLD]
    bw = (PAGE_W - 2 * MX - 4 * 12) / 5.0
    for i, (yr, lab, txt) in enumerate(steps):
        bx = MX + i * (bw + 12)
        box(c, bx, y - 124, bw, 124, SURFACE if i < 4 else CREAM, cols[i], 4)
        c.setFont("Helvetica-Bold", 7.4)
        c.setFillColor(cols[i] if i < 4 else HexColor("#9A7B18"))
        c.drawString(bx + 14, y - 22, yr.upper())
        c.setFont(SERIF_B, 12.6)
        c.setFillColor(INK)
        c.drawString(bx + 14, y - 42, lab)
        para(c, txt, bx + 14, y - 62, "Helvetica", 8.9, BODY, bw - 28, 12.2)

    callout(c, MX, y - 150, PAGE_W - 2 * MX,
            "Everything the firm sells, somebody here has already had to do with their own name against "
            "the number at the end of the month.",
            bg=CREAM, spine=GOLD, fg=INK, size=13, leading=18)


# ------------------------------------------------------------------ 05 -------
def slide_howwework(c):
    chrome(c, "How we work")
    hy = heading(c, "Four ways clients use us")
    para(c, "Consult for Africa is a healthcare advisory and venture firm in Lagos and Abuja, partner "
            "led and built by operators. Nobody should buy the fourth of these before they have seen us "
            "do the first.",
         MX, hy - 14, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 20, 15.6)

    shapes = [("01", "Diagnostic", "Two to four weeks",
               "A fixed scope. We count the thing, trace the cases and come back with what is actually "
               "true. Most clients start here and some stop here."),
              ("02", "Advisory", "Eight to sixteen weeks",
               "Strategy, feasibility, financial model, operating design or governance build, delivered "
               "as instruments the team can use rather than as recommendations."),
              ("03", "Build and commission", "Three to twelve months",
               "We stand the thing up. Licensing, fit-out sequencing, staffing, tariffs, systems and "
               "the opening plan, then we hand over a running business."),
              ("04", "Build and operate", "Two to five years",
               "We install and hold the management team and carry the number. The incentive is "
               "subordinated to the owner's return of capital: a lower share until the money is home, "
               "a higher one after.")]
    cw = (PAGE_W - 2 * MX - 3 * 14) / 4.0
    yy = hy - 62
    cols = [IND2, IND3, SKY, GOLD]
    for i, (num, t, dur, b) in enumerate(shapes):
        bx = MX + i * (cw + 14)
        box(c, bx, yy - 176, cw, 176, CREAM if i == 3 else SURFACE, cols[i], 4)
        c.setFont("Helvetica-Bold", 7.4)
        c.setFillColor(HexColor("#9A7B18") if i == 3 else cols[i])
        c.drawString(bx + 16, yy - 22, num)
        c.setFont(SERIF_B, 13.4)
        c.setFillColor(INK)
        c.drawString(bx + 16, yy - 44, t)
        c.setFont(SERIF_I, 9.4)
        c.setFillColor(SAGE_D)
        c.drawString(bx + 16, yy - 60, dur)
        para(c, b, bx + 16, yy - 80, "Helvetica", 9.4, BODY, cw - 32, 12.8)

    para(c, "Advisory work is billed as resourced time: named grades at published rates against the days "
            "each piece actually takes, invoiced monthly, so nothing you drop is ever paid for.",
         MX, yy - 198, SERIF_I, 10.6, HexColor("#5A6478"), PAGE_W - 2 * MX, 14.6)


# ------------------------------------------------------------------ 11 -------
def slide_start(c):
    chrome(c, "How it starts")
    hy = heading(c, "How a first piece of work gets scoped")
    y = para(c, "We do not ask anybody to commission a programme on the strength of a profile. The first "
                "piece of work is deliberately small, so that the decision to carry on is made on "
                "something we have actually done for you rather than on something we have written about "
                "ourselves.",
             MX, hy - 16, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 300, 16.2)
    bullet_block(c, [
        ("A conversation.", "Twenty minutes, to work out which of the six is genuinely heavy and which "
                            "is already handled."),
        ("A scope.", "One page, fixed, with a deliverable and a date on it. Priced once we have agreed "
                     "what is in it, which is a conversation rather than a document."),
        ("Two or three weeks.", "We do the work, inside the building, with whoever owns it on your side."),
        ("Then you decide.", "Either there is something worth carrying on with, or you have an early "
                             "and inexpensive answer. In our experience both are worth having."),
    ], MX, y - 22, PAGE_W - 2 * MX - 320, size=11, leading=14.6, gap=12)

    px = PAGE_W - MX - 268
    box(c, px, 168, 268, 220, SURFACE, TEAL, 5)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(TEAL)
    c.drawString(px + 22, 360, "ON FEES")
    para(c, "We would rather show you the method than quote you a figure in a document nobody asked for. "
            "Beyond a fixed first piece, advisory work is billed as resourced time: named grades at "
            "published rates against the days each piece actually takes, invoiced monthly.",
         px + 22, 336, "Helvetica", 10.2, BODY, 226, 14)
    hairline(c, px + 22, 244, 224, RULE, 0.8)
    para(c, "On build and operate mandates the incentive is subordinated to the owner's return of "
            "capital. A lower share until the money is home, a higher one after.",
         px + 22, 226, SERIF_I, 10.2, HexColor("#5A6478"), 226, 14)


# ------------------------------------------------------------------ 12 -------
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
    c.drawString(MX, PAGE_H - 182, "Twenty minutes, whenever suits.")
    c.setFont(SERIF_B, 27)
    c.drawString(MX, PAGE_H - 218, "And I would start with the campus.")
    hairline(c, MX, PAGE_H - 244, 420, GOLD, 1.2)

    para(c, "A medipark is a property business with a hospital inside it, and the diagnostics, "
            "training, retail and residential each need an operator and an occupancy number of their "
            "own. It is the piece least like anything else in the group. If it is already settled, say "
            "so and I will ask about the ramp instead, and if the timing is wrong altogether, tell me "
            "and I will come back after you have opened.",
         MX, PAGE_H - 274, SERIF_I, 12.6, HexColor("#AEBBD4"), 440, 18)

    para(c, "Either way, I would like to see the place before it opens.",
         MX, PAGE_H - 382, SERIF_B, 13.4, GOLD, 440, 18)

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


# ---------------------------------------------------------- capabilities -----
def _cap(c, kicker, head, frame, bullets, big, cap, note):
    """One capability: what we do on the left, the proof for it on the right."""
    chrome(c, kicker)
    hy = heading(c, head)
    y = para(c, frame, MX, hy - 16, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 320, 16.2)
    bullet_block(c, bullets, MX, y - 22, PAGE_W - 2 * MX - 320,
                 size=10.6, leading=14.2, gap=10)

    px = PAGE_W - MX - 268
    box(c, px, 150, 268, 250, CREAM, GOLD, 5)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(HexColor("#9A7B18"))
    c.drawString(px + 22, 372, "WHERE WE HAVE DONE IT")
    c.setFont(SERIF_B, 40)
    c.setFillColor(INK)
    c.drawString(px + 22, 318, big)
    ny = para(c, cap, px + 22, 302, "Helvetica", 10.2, BODY, 226, 13.8)
    hairline(c, px + 22, ny - 8, 224, HexColor("#E3D6AE"), 0.8)
    para(c, note, px + 22, ny - 26, SERIF_I, 10.2, HexColor("#5A6478"), 226, 14)


def slide_commissioning(c):
    _cap(c, "Capability 02  /  Commissioning",
         "A hospital earns its first year in the ninety days after it opens",
         "So we plan that period as an operating period, and we stay in the building for it.",
         [("Readiness and sequencing.", "A service-by-service opening plan with readiness gates, so the "
                                        "first patients arrive in the lines that are genuinely ready."),
          ("The ramp, modelled monthly.", "Volume, revenue, staffing and cash by month across the first "
                                          "year, with one person accountable to the number rather than "
                                          "to the date."),
          ("Licensing and regulatory.", "HEFAMAA, scope of practice, NAFDAC where relevant, and the "
                                        "inspection file assembled before anybody asks for it."),
          ("Systems before day one.", "Hospital information system, tariff schedule, rotas, standard "
                                      "operating procedures and the reporting cadence, so month one "
                                      "produces management information rather than anecdote."),
          ("Day one to day ninety.", "The period that decides the first year, worked through with the "
                                     "team rather than reviewed afterwards.")],
         "6 weeks",
         "from nothing to live for a 90-bed field hospital with a 10-bed intensive care unit, a "
         "customised health information system and the state-wide reporting dashboard.",
         "Eti-Osa, 2020, for the Lagos State response. Licensing, fit-out sequencing, staffing, "
         "systems and the opening plan, all of it compressed.")


def slide_bench(c):
    _cap(c, "Capability 05  /  Workforce",
         "Hiring a thousand people to a date is an operations problem",
         "Knowing good clinicians and being able to seat a thousand of them against an opening date are "
         "different problems. We are built for the second one.",
         [("Named-seat planning.", "The consultant bench mapped specialty by specialty against the "
                                   "service lines that carry margin, with lead times counted backwards "
                                   "from the opening date."),
          ("Volume without dropping the bar.", "Sourcing, screening and offer management run as a "
                                               "pipeline with a weekly fill rate against each seat, "
                                               "including returners where the role suits one."),
          ("Structured assessment.", "Credential verification and a structured leadership assessment on "
                                     "every senior appointment, so a board appoints on evidence rather "
                                     "than on interview performance."),
          ("Pay that survives year two.", "Fixed and variable design, session economics, and the "
                                          "governance that keeps it honest once volumes move."),
          ("Locum and interim cover.", "Temporary clinical cover filled in days, which is what keeps a "
                                       "new rota standing through its first six months.")],
         "10,000+",
         "verified Nigerian clinicians across sixteen cadres, on a registry we build and maintain "
         "ourselves, with salary and supply benchmarked by cadre and by state.",
         "We also designed a consultant pay-for-performance model that lifted revenue 23 per cent in "
         "three months while raising variable pay 15 per cent.")


def slide_campus(c):
    _cap(c, "Capability 01  /  Campus economics",
         "The space that is not the hospital needs its own owner",
         "Otherwise it sits empty for eighteen months while carrying its share of the fixed cost, "
         "because the hospital takes every hour of management attention in the opening year.",
         [("Measured geometry, not the brief.", "We measure what is actually built, because gross to net "
                                                "is where campus models break and the error is always "
                                                "in the corridors."),
          ("A rent roll and an occupancy model.", "Every non-clinical line given a tenant or an "
                                                  "operator, a price, an occupancy target and a named "
                                                  "owner before opening."),
          ("A monthly cash model.", "Peak funding, the trough month and the payback, modelled monthly, "
                                    "because annual models hide the months that decide whether the "
                                    "thing is fundable."),
          ("Tenant mix.", "Which occupiers feed the hospital, which compete with it, and what each one "
                          "should be paying for the footfall."),
          ("An operating model per line.", "Diagnostics, training, retail and residential each run as a "
                                           "business with its own profit and loss.")],
         "N1.7bn",
         "medical campus structured and costed last year: twelve businesses in occupation, measured "
         "geometry, rent roll, monthly cash model, peak funding and a 29-month payback.",
         "On that campus roughly a third of stabilised revenue came from lines that were not the anchor "
         "clinical service, and the fastest of them was paying before the anchor was.")


def slide_commercial(c):
    _cap(c, "Capability 04  /  Payer and tariff",
         "Tariff and payer mix, before volume",
         "Especially where a concession has already fixed part of the bed base and the rest of it has "
         "to carry the cost.",
         [("Tariff architecture.", "Price positions by site and by service line, benchmarked, with an "
                                   "explicit written position on what each address is for."),
          ("Payer strategy.", "Managed care terms and where to refuse them, corporate and embassy "
                              "contracting, and the self-pay proposition said in a sentence that is "
                              "not about equipment."),
          ("Revenue integrity.", "Billing capture, claims recovery, payer reconciliation and the "
                                 "leakage controls that stop the same money going missing twice."),
          ("Packaged pathways.", "Priced end to end, consultant named, escalation written down. This is "
                                 "what converts a family that would otherwise travel, because they are "
                                 "buying certainty rather than capability."),
          ("Service line economics.", "Contribution by line, so the mix is managed deliberately rather "
                                      "than inherited.")],
         "N1.0bn",
         "a month at a 75-bed Abuja tertiary surgical hospital, the strongest year in its sixteen-year "
         "history, built on tariff realignment, service mix and revenue governance.",
         "N1bn of EBITDA in the first half, ahead of the whole of the prior year, with no new "
         "capacity added.")


def slide_group(c):
    _cap(c, "Capability 03  /  Group operating model",
         "Lagoon, Euracare and Medipark, run as one group",
         "The stated model is that each hospital keeps its identity and benefits from shared resources "
         "underneath. The work is settling what actually gets shared, and what each address is for when "
         "several of them sit minutes apart.",
         [("What sits where.", "Service configuration across the brands, so two of your own addresses "
                               "are not competing for the same consultant and the same patient."),
          ("Referral architecture.", "How patients move between addresses, who owns the profit and loss "
                                     "when either could treat them, and how the referral is rewarded."),
          ("Shared services.", "What consolidates, what stays local, and who backfills the seats a new "
                               "site empties when it takes your best people."),
          ("Fractional and seconded leadership.", "Chief executive, operating, medical and technology "
                                                  "cover on fixed-term mandates, sitting inside the "
                                                  "building rather than reporting into it."),
          ("Build and operate.", "Where an owner wants it, we install and hold the management team and "
                                 "carry the number, with our incentive subordinated to their return of "
                                 "capital.")],
         "USD 1.1m",
         "of annualised cost taken out of a 165-bed fund-owned tertiary hospital through workforce and "
         "service portfolio rebalancing, with clinical volume held.",
         "Elsewhere, a leadership structure taken from twenty roles to eight, and an asset-light "
         "expansion model under which a hospital takes over management of existing facilities with no "
         "capital expenditure.")


SLIDES = [slide_cover, slide_origin, slide_howwework, slide_campus, slide_commissioning,
          slide_group, slide_commercial, slide_bench, slide_start, slide_close]


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Consult for Africa - Company Profile")
    c.setAuthor("Consult for Africa")
    for fn in SLIDES:
        fn(c)
        c.showPage()
    c.save()
    print("wrote %s" % OUT)
