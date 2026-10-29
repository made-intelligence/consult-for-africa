"""
The Lyfe Place Abuja tenancy deck for the Medical Tourism Conversion Clinic,
for the Alameda team.

Goes TO them, so everything in the internal brief that is ours stays ours: the
cost of housing them, the margin, the floor, the concession ladder.

Branded Medbury, not Consult for Africa. Medbury is the landlord making the
offer and CFA is not a party to it. Palette and marks taken from the Medbury
Healthcare Group logo: red ED1C24 and black.

The question it is built to answer without being asked twice: what does the
space cost, fully fitted out. Slide 04 carries the capital, slide 08 the annual.

Numbers come from scripts/lyfeplace_campus.py.

    python3 scripts/build-alameda-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))

import lyfeplace_campus as C
from cfa_deck import SERIF, SERIF_B, SERIF_I, wrap
from medbury_deck import (BLUSH, BODY, DARK, FOOTER, INK, IVORY, LIGHT, MUTED, MX,
                          PAGE_H, PAGE_W, RED, RED_D, SURFACE, TOTAL, bullets,
                          bump, callout, chrome, heading, logo, m, para, rule, table)

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PRICED = "--priced" in sys.argv
OUT = DOCS / "lyfeplace-abuja" / (
    "lyfeplace-alameda-deck-priced.pdf" if PRICED else "lyfeplace-alameda-deck.pdf")
LOGO, LOGO_REV = DOCS / "medbury-logo.png", DOCS / "medbury-logo-reversed.png"

FOOTER[0] = "Lyfe Place Abuja   /   Medbury Healthcare Group   /   Private and confidential"
TOTAL[0] = "09"

NAME, SQM, _R, DEPOSIT, _ = [t for t in C.TENANTS if "Alameda" in t[0]][0]
# The campus model still carries 400,000, which apportions the service charge across
# net internal area. Service charge belongs on OCCUPIED area, because the common
# parts are what it pays for. Corrected here; lyfeplace_campus.py needs the same.
RATE = 470000
ANNUAL = SQM * RATE / 1e6
FX = 1550
COST = {"Rent": 111_771, "Fit-out recovery": 71_413, "Service charge": 224134}
CT = sum(COST.values())
G = RATE / CT
Q = {k: v * G for k, v in COST.items()}
FITOUT = 40.3
FURNISH = 15.0


# ------------------------------------------------------------------ slides --
def s01(c):
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, 0, 9, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 108, 42, rev=True)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 38)
    c.drawString(MX, PAGE_H - 192, "The Medical Tourism")
    c.drawString(MX, PAGE_H - 238, "Conversion Clinic")
    c.setFillColor(RED); c.setFont(SERIF_I, 19)
    c.drawString(MX, PAGE_H - 274, "A tenancy on the ground floor, for Alameda.")
    rule(c, MX, PAGE_H - 300, 360, RED, 1.2)
    para(c, "A private ambulatory medical campus in Abuja. Five consulting and procedure rooms on a "
            "floor of your own, fitted and ready to register, with diagnostics, a day case theatre "
            "and a pharmacy already in the building.",
         MX, PAGE_H - 330, 13, LIGHT, 470, 19)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    c.drawString(MX, 54, "Medbury Healthcare Group   /   September 2026   /   Private and confidential")


def s02(c):
    chrome(c, "The campus")
    y = heading(c, "One building, and everything a visiting clinic needs inside it.")
    para(c, "Lyfe Place Abuja is a converted four-structure compound: a main building over two "
            "floors, a guest chalet and a service block. It runs as a medical park rather than a "
            "clinic, with several clinical businesses in occupation and one shared front office.",
         MX, y - 14, 13, BODY, PAGE_W - 2 * MX - 40, 18)
    table(c, [["", "What is there", "Who it serves"],
              ["Ground floor", "Your clinic, the day case theatre, digital X-ray and phlebotomy",
               "You, and the campus"],
              ["First floor", "Consulting and procedure rooms, aesthetics, hair restoration, a "
               "doctors' lounge", "Medbury's own clinics and a panel of specialists"],
              ["Guest chalet", "The laboratory and reporting", "The whole campus"],
              ["Service block", "Dispensary, retail pharmacy and cold chain", "The whole campus"]],
          MX, y - 96, [130, 330, 220])
    callout(c, MX, 118, PAGE_W - 2 * MX,
            "You are not renting rooms in an office. You are joining a working clinical campus, and "
            "the services around you are already staffed and running.")


def s03(c):
    chrome(c, "The arrangement")
    if PRICED:
        y = heading(c, "The ground floor, less reception and the theatre.")
        table(c, [["The ground floor", "sqm", "What it is"],
                  ["Ground floor, net internal", m(C.GROUND_NET), "Measured from the as-built drawings"],
                  ["Campus common", "(%s)" % m(C.GF_SHARED),
                   "Reception, waiting, circulation, staircase and entrance. Shared, and in the "
                   "service charge"],
                  ["Theatre suite", "(%s)" % m(C.THEATRE_SQM),
                   "Theatre, recovery, scrub and dirty utility. Available to you by the list"],
                  ["The clinic's demise", m(SQM), "Five consulting and procedure rooms"]],
              MX, y - 24, [210, 90, 380], size=11.5, leading=15, accent_last=True)
    else:
        y = heading(c, "How the arrangement is structured.")
        table(c, [["", ""],
                  ["The landlord", "Lyfe Place Abuja, the property company within Medbury "
                                   "Healthcare Group that holds the campus"],
                  ["The tenant", "The joint venture between Medbury and Alameda. Not Alameda "
                                 "directly, so the clinic's accounts stand on their own"],
                  ["The basis", "Arm's length terms, set so that neither shareholder is advantaged "
                                "or disadvantaged by the tenancy"],
                  ["The demise", "The ground floor, less the shared reception and the theatre "
                                 "suite. Five consulting and procedure rooms held for the clinic's "
                                 "exclusive use"],
                  ["The term", "Five years, with a conventional deposit against rent and service "
                               "charge"],
                  ["The charge", "One monthly figure, built as three lines: the space, the fit-out "
                                 "and the services"]],
              MX, y - 24, [150, PAGE_W - 2 * MX - 150], size=11.5, leading=15, head=False)
    c.setFillColor(SURFACE); c.roundRect(MX, 104, PAGE_W - 2 * MX, 96, 8, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, 104, 5, 96, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont(SERIF_B, 15)
    c.drawString(MX + 24, 168, "A floor of its own, off a shared arrival hall")
    para(c, "The demise is formed from the existing consulting room beside imaging, the open living "
            "and dining span, and the old lobby. It reads as the clinic's own floor, entered from "
            "the campus reception, with its own signage inside the demise.",
         MX + 24, 146, 12, BODY, PAGE_W - 2 * MX - 48, 16)


def s04(c):
    chrome(c, "Fully fitted")
    if PRICED:
        y = heading(c, "What the fitted space costs, and who carries it.")
        table(c, [["", "", ""],
                  ["Fit-out of the clinic's five rooms", "NGN %s M" % m(FITOUT),
                   "About NGN %s per sqm. Partitions, clinical flooring, hand-wash, cooling, fresh "
                   "air, power, data, fire, lighting and signage" % m(round(FITOUT * 1e6 / SQM, -3), 0)],
                  ["Funded by", "Medbury", "We carry the capital and the construction risk"],
                  ["The clinic pays up front", "Nothing",
                   "No fit-out contribution and no premium on taking occupation"],
                  ["Recovered through the rate", "NGN %s M a year" % m(SQM * Q["Fit-out recovery"] / 1e6),
                   "For five years, then it falls away"]],
              MX, y - 24, [220, 130, 330], size=11.5, leading=15, accent_last=True, head=False)
        c.setFillColor(SURFACE); c.roundRect(MX, 96, PAGE_W - 2 * MX, 104, 8, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(MX, 96, 5, 104, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont(SERIF_B, 14)
        c.drawString(MX + 24, 170, "If the clinic wants the rooms furnished as well as fitted")
        para(c, "Five rooms furnished to clinical standard is about NGN %s M. The clinic can fund it "
                "directly, or Lyfe Place funds it and adds NGN %s M a year to the recovery line for "
                "the same five years. Either way it is quoted on its own."
                % (m(FURNISH), m(FURNISH / 5 * G, 2)),
             MX + 24, 148, 12, BODY, PAGE_W - 2 * MX - 48, 16)
        return
    y = heading(c, "The rooms are handed over ready to register.")
    table(c, [["", "", ""],
              ["Built and finished", "Lyfe Place",
               "Partitions, doors, clinical flooring welded and coved, hand-wash to every room, "
               "decoration and room signage"],
              ["Serviced and powered", "Lyfe Place",
               "Cooling and mechanical fresh air, power and emergency lighting, data and network, "
               "fire detection and alarm"],
              ["Capital and construction risk", "Lyfe Place", "Carried by us, not by the clinic"],
              ["Paid up front by the clinic", "Nothing",
               "No fit-out contribution and no premium on taking occupation"]],
          MX, y - 24, [220, 130, 330], size=11.5, leading=15, accent_last=True, head=False)
    c.setFillColor(SURFACE); c.roundRect(MX, 104, PAGE_W - 2 * MX, 96, 8, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, 104, 5, 96, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont(SERIF_B, 14)
    c.drawString(MX + 24, 166, "Fitted, and furnished if you want it")
    para(c, "Fitted means clinically usable on handover. The clinic brings its equipment, "
            "instruments and consumables. If you would rather the rooms arrived furnished as well, "
            "we will specify and quote that separately.",
         MX + 24, 144, 12, BODY, PAGE_W - 2 * MX - 48, 16)


def s05(c):
    chrome(c, "What surrounds you")
    y = heading(c, "The services are already here, and already staffed.")
    table(c, [["", "Where", "What it means for your patient"],
              ["Laboratory", "Guest chalet", "Bloods drawn on your floor, processed on site"],
              ["Digital X-ray", "Ground floor, beside you", "Imaged without leaving the building"],
              ["Ultrasound and echo", "First floor", "Same visit, same building"],
              ["Day case theatre", "Ground floor, your level", "Level access, bookable by the list"],
              ["Pharmacy", "Service block, hatch in the waiting hall",
               "Script filled before the patient leaves"],
              ["Front office", "Campus reception", "Received, identified and directed by our team"]],
          MX, y - 22, [150, 230, 300])
    callout(c, MX, 104, PAGE_W - 2 * MX,
            "A patient can be consulted, worked up, treated and dispensed to in one visit, on one "
            "site. That is the difference between a medical tourism conversion clinic and a "
            "consulting room.",
            bg=SURFACE)


def s06(c):
    chrome(c, "Shared and yours")
    y = heading(c, "Three categories, and every question falls into one.")
    table(c, [["", "What sits there"],
              ["The clinic's alone", ("The %s sqm demise. " % m(SQM) if PRICED else "The demise. ") +
               "Your clinical staff, your patients, your records and clinical governance, your "
               "branding inside the demise, your protocols and your fees"],
              ["Shared, in the service charge",
               "Reception, waiting and concierge. Circulation and staircase. Patient WCs. Security, "
               "cleaning, waste and grounds. Power, cooling and water. Fire systems. Network. "
               "Facilities management"],
              ["Shared, charged on use",
               "The day case theatre by the list. X-ray and phlebotomy. The laboratory. The "
               "pharmacy. Sterilising"]],
          MX, y - 22, [230, 450], size=11.5, leading=15)
    callout(c, MX, 118, PAGE_W - 2 * MX,
            "Anything that serves only you sits in your demise and you control it. Anything that "
            "serves the campus reaches you through the service charge. Anything you consume by the "
            "unit is charged by the unit.")


def s07(c):
    chrome(c, "Access and term")
    y = heading(c, "Five years, and your own clinic hours inside them.")
    table(c, [["", "", ""],
              ["Term", "Five years", "Matched to the period the fit-out is recovered over"],
              ["Deposit", "%d months" % DEPOSIT, "Rent and service charge"],
              ["Campus window", "07:00 to 21:00, Monday to Saturday",
               "When reception, security and the clinical services run"],
              ["Your access", "Unrestricted within the window",
               "It is your demise. You set your clinic hours and you do not book time"],
              ["Outside the window", "By arrangement", "Sundays and late lists can be run"],
              ["Patient arrival", "Through the campus reception",
               "One entrance, one standard of welcome, then your clinicians"]],
          MX, y - 22, [140, 220, 320], head=False)
    callout(c, MX, 104, PAGE_W - 2 * MX,
            "We also carry the administration that visiting clinicians usually carry themselves: "
            "temporary registration and immigration support for your team.", bg=SURFACE)


def s08(c):
    chrome(c, "The rate" if PRICED else "What is included")
    if PRICED:
        y = heading(c, "One rate, quoted as three lines.")
        table(c, [["", "NGN / sqm / yr", "NGN M / yr", "What it is"],
                  ["Rent", m(Q["Rent"], 0), m(SQM * Q["Rent"] / 1e6), "The space itself"],
                  ["Fit-out recovery", m(Q["Fit-out recovery"], 0),
                   m(SQM * Q["Fit-out recovery"] / 1e6),
                   "The NGN %s M fit-out, recovered across the five year term" % m(FITOUT)],
                  ["Service charge", m(Q["Service charge"], 0), m(SQM * Q["Service charge"] / 1e6),
                   "Power, security, cleaning, facilities, insurance, regulatory, reception and ICT. "
                   "Billed on account and reconciled annually against audited cost"],
                  ["Total, fully fitted", m(RATE, 0), m(ANNUAL),
                   "NGN %s M a month. About USD %s a year" % (m(ANNUAL / 12, 2), m(ANNUAL * 1e6 / FX, 0))]],
              MX, y - 22, [150, 120, 105, 305], accent_last=True)
        callout(c, MX, 182, PAGE_W - 2 * MX,
                "That is the fitted rate. Nothing further is payable to take occupation, and the "
                "fit-out recovery line falls away at the end of the term. Rent and fit-out recovery "
                "are fixed for the five years; only the service charge moves, and only with audited "
                "cost.")
        return
    y = heading(c, "What one monthly figure covers.")
    table(c, [["", "What is included"],
              ["The space", "Five fitted consulting and procedure rooms, held for the clinic's "
                            "exclusive use across the term"],
              ["The fit-out", "Built, finished and paid for by Lyfe Place, recovered across the "
                              "term rather than charged up front"],
              ["The building", "Power and standby generation, cooling, water, security, cleaning, "
                               "waste, grounds, fire systems, insurance and facilities management"],
              ["The front office", "Reception, patient identification, navigation and the arrival "
                                   "experience, run to one standard for the whole campus"],
              ["The network", "Connectivity, booking platform and ICT support"],
              ["The compliance", "Regulatory permits, waste licensing, and credentialing and "
                                 "immigration support for visiting clinicians"]],
          MX, y - 22, [150, PAGE_W - 2 * MX - 150], size=11.5, leading=15)
    callout(c, MX, 124, PAGE_W - 2 * MX,
            "One monthly figure, quoted as three lines so the basis of each is visible: the space, "
            "the fit-out and the services. We would rather show you how it is built than hand you a "
            "single number.")


def s09(c):
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, 0, 9, PAGE_H, fill=1, stroke=0)
    bump()
    logo(c, MX, PAGE_H - 96, 32, rev=True)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 30)
    c.drawString(MX, PAGE_H - 168, "Four things, and we can start")
    bullets(c, [("Walk the floor", "See the demise, the theatre and the arrival sequence as drawn."),
                ("Agree the fit-out specification",
                 "So the rooms are handed over ready for your protocols, not ours."),
                ("Settle heads of terms",
                 "Term, deposit, commencement and the fit-out programme."),
                ("Name your clinical lead",
                 "So credentialing and registration can start in parallel.")],
            MX, PAGE_H - 218, PAGE_W - 2 * MX - 120, dark=True, size=13, leading=17)
    rule(c, MX, 118, 300, RED, 1.2)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 13)
    c.drawString(MX, 96, "Medbury Healthcare Group")
    c.setFillColor(MUTED); c.setFont("Helvetica", 10.5)
    c.drawString(MX, 76, "Lyfe Place Abuja   /   Private and confidential")


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for s in (s01, s02, s03, s04, s05, s06, s07, s08, s09):
        s(c); c.showPage()
    c.setTitle("Lyfe Place Abuja: the Medical Tourism Conversion Clinic tenancy")
    c.setAuthor("Medbury Healthcare Group")
    c.save()
    print("wrote %s" % OUT)


if __name__ == "__main__":
    build()
