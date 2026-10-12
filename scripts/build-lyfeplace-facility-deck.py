"""
"What are we doing with this facility" for the joint Medbury and Alameda session.

A different meeting from the tenancy one. The room holds both teams, so this
answers the whole-facility question rather than the ground floor question, and
it reads as a shared enterprise rather than a landlord pitch.

Numbers: areas and capacity only. No money, per Dr John, because the Egyptians
are in the room and the rate conversation is separate.

Geometry is the MEASURED set: 953.9 gross, 664.3 net. Several earlier documents
carry 711 / 519, which the survey superseded. Those are stale.

    python3 scripts/build-lyfeplace-facility-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))

import lyfeplace_campus as C
from cfa_deck import SERIF, SERIF_B, SERIF_I, wrap
from medbury_deck import (BLUSH, BODY, DARK, FOOTER, INK, IVORY, LIGHT, MUTED, MX,
                          PAGE_H, PAGE_W, RED, RED_D, SURFACE, TOTAL, bullets, bump,
                          callout, chrome, heading, logo, m, para, rule, table)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "lyfeplace-abuja" / "lyfeplace-facility-deck.pdf"

FOOTER[0] = "Lyfe Place Abuja   /   Medbury Healthcare Group and Alameda   /   Private"
TOTAL[0] = "10"
GROSS = 953.9


def s01(c):
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, 0, 9, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 108, 42, rev=True)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 40)
    c.drawString(MX, PAGE_H - 196, "Lyfe Place Abuja")
    c.setFillColor(RED); c.setFont(SERIF_I, 19)
    c.drawString(MX, PAGE_H - 232, "What we are doing with this facility.")
    rule(c, MX, PAGE_H - 258, 360, RED, 1.2)
    para(c, "A joint session for the Medbury and Alameda teams. What the building is, who is in "
            "it, how the pieces work together, and what each of us gets out of it.",
         MX, PAGE_H - 288, 13, LIGHT, 470, 19)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    c.drawString(MX, 54, "October 2026   /   Private and confidential")


def s02(c):
    chrome(c, "The answer")
    y = heading(c, "A medical park. Not a clinic with tenants in it.")
    para(c, "The distinction decides everything that follows. A clinic with tenants is one business "
            "that rents out spare rooms. A medical park is several businesses that each stand on "
            "their own, sharing one address, one front door and one set of clinical infrastructure "
            "that none of them could justify alone.",
         MX, y - 14, 13.5, BODY, PAGE_W - 2 * MX - 60, 19)
    c.setFillColor(SURFACE); c.roundRect(MX, 150, PAGE_W - 2 * MX, 150, 8, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, 150, 5, 150, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont(SERIF_B, 16)
    c.drawString(MX + 26, 266, "Seven businesses, one building")
    para(c, "A medical tourism conversion clinic. Four Medbury clinical companies. A laboratory and "
            "an imaging service. A pharmacy. A day case theatre every one of them can use, and a "
            "panel of visiting consultants who take rooms by the session without taking a lease.",
         MX + 26, 240, 12.5, BODY, PAGE_W - 2 * MX - 60, 17)
    para(c, "No single one of those would pay for a theatre, a laboratory and a full front office. "
            "Together they do, and each gets the use of all three.",
         MX + 26, 182, 12.5, RED_D, PAGE_W - 2 * MX - 60, 17)


def s03(c):
    chrome(c, "The building")
    y = heading(c, "Four structures, 953.9 sqm gross.")
    table(c, [["Structure", "Gross", "Net internal", "What it becomes"],
              ["Main building, ground", "402.9", m(C.GROUND_NET),
               "Arrival for the whole campus, the conversion clinic, the theatre suite, imaging "
               "and phlebotomy"],
              ["Main building, first", "402.9", m(C.FIRST_NET),
               "Medbury's own clinics, the bookable room pool, infusion and the members' lounge"],
              ["Guest chalet", "96.0", m(C.CHALET_NET), "Laboratory, reporting and specimen handling"],
              ["Boys' quarters", "52.0", m(C.BQ_NET), "Dispensary, retail pharmacy and cold chain"],
              ["Campus", m(GROSS), m(C.NET), "70% of the plate is usable room on both floors"]],
          MX, y - 24, [150, 70, 86, PAGE_W - 2 * MX - 306], size=11.2, leading=14.6,
          accent_last=True)
    callout(c, MX, 124, PAGE_W - 2 * MX,
            "Measured from the as-built drawings rather than taken from the brief. The plate is "
            "24.695 by 16.317 metres, and both floors independently return 70% efficiency, which is "
            "the check that the measurement is right rather than merely precise.", bg=SURFACE)


def s04(c):
    chrome(c, "Who is in it")
    y = heading(c, "Seven businesses, and where each one sits.")
    table(c, [["Business", "Where", "What it is"],
              ["Medical Tourism Conversion Clinic", "Ground floor",
               "The joint venture between Medbury and Alameda"],
              ["Day case theatre", "Ground floor", "Shared. Used by every clinical business here"],
              ["Medlyfe Aesthetics and Regenerative", "First floor", "Medbury clinical company"],
              ["Lyfe Place Hair Restoration", "First floor", "Medbury clinical company, FUE"],
              ["Bariatric, Metabolic and Endoscopic", "First floor", "Medbury clinical company"],
              ["Medlyfe Longevity and Infusion", "First floor", "Medbury clinical company, infusion bays"],
              ["Medbury Diagnostics", "Guest chalet and ground floor",
               "Laboratory, X-ray, ultrasound and echocardiography"],
              ["Medbury Pharmaceuticals", "Boys' quarters", "Dispensary, retail and cold chain"],
              ["The visiting panel", "First floor", "Up to 50 consultants taking rooms by the session"]],
          MX, y - 22, [230, 180, PAGE_W - 2 * MX - 410], size=11, leading=14.2, hi={0})


def s05(c):
    chrome(c, "The ground floor")
    y = heading(c, "Conversion, surgery and diagnostics, on one level.")
    table(c, [["", "sqm", ""],
              ["Shared arrival", m(C.GF_SHARED),
               "Reception, waiting, circulation spine, staircase, vestibule and porch. One entrance "
               "for the whole campus"],
              ["The conversion clinic", m(C.CONV_SQM),
               "Five consulting and procedure rooms, held for the joint venture's exclusive use"],
              ["The theatre suite", m(C.THEATRE_SQM),
               "Theatre, two monitored recovery bays, scrub and dirty utility. Level trolley access "
               "to the ambulance bay"],
              ["Imaging and phlebotomy", "35.6",
               "Digital X-ray lead shielded, control, and the draw point. Fixed here by weight, "
               "shielding and evacuation"]],
          MX, y - 24, [190, 70, PAGE_W - 2 * MX - 260], size=11.5, leading=15, head=False)
    callout(c, MX, 118, PAGE_W - 2 * MX,
            "Everything a conversion patient needs happens within a few metres of where they arrive: "
            "consulted, imaged, bled, and operated on if it comes to that, without leaving the floor "
            "or the building.")


def s06(c):
    chrome(c, "The first floor")
    y = heading(c, "Four clinical companies and a visiting panel.")
    para(c, "The upstairs floor is typed rather than demised. Rooms are built to a clinical "
            "standard and allocated by session, so a room can serve an aesthetics list in the "
            "morning and a visiting cardiologist in the evening.",
         MX, y - 14, 12.5, BODY, PAGE_W - 2 * MX - 40, 17)
    table(c, [["", "", ""],
              ["Consulting rooms", "%d" % C.ROOMS_CONSULT, "Bookable by the session"],
              ["Procedure rooms", "%d" % C.ROOMS_PROC,
               "One with 360 degree access for all-day hair restoration cases"],
              ["Infusion bays", "4", "Dedicated, for the longevity and infusion programme"],
              ["Members' lounge and terrace", "", "At the head of the stair. Part of what the "
               "visiting panel is buying"],
              ["Panel capacity", "about %d" % C.CONSULTANTS_CAP,
               "Consultants the room hours will carry before the floor runs out"]],
          MX, y - 86, [190, 70, PAGE_W - 2 * MX - 260], size=11.5, leading=15, head=False)
    callout(c, MX, 112, PAGE_W - 2 * MX,
            "A lease would let this floor to three or four practices. Letting it by the session "
            "lets it to fifty, and the rooms are busy in the evenings and on Saturdays when a leased "
            "practice would have gone home.", bg=SURFACE)


def s07(c):
    chrome(c, "The shared spine")
    y = heading(c, "What none of us would build alone.")
    table(c, [["Shared asset", "What it does for every business here"],
              ["The day case theatre", "600 sessions a year of capacity. A conversion clinic, an "
               "aesthetics practice and a bariatric service each need a theatre occasionally. None "
               "needs one every day, and none could justify buying one"],
              ["The laboratory", "Bloods drawn on either floor and processed on site, so results "
               "come back during the visit rather than after it"],
              ["Imaging", "X-ray, ultrasound and echocardiography, available to every clinician "
               "in the building without a referral out"],
              ["The pharmacy", "Dispensing and cold chain, with a collection hatch in the waiting "
               "hall, so the script is filled before the patient leaves"],
              ["The front office", "One reception, one booking platform, one standard of welcome, "
               "one billing and collection function, shared across all seven"]],
          MX, y - 22, [160, PAGE_W - 2 * MX - 160], size=11.2, leading=14.6, hi={0})


def s08(c):
    chrome(c, "Why one campus")
    y = heading(c, "The patient journey is the business model.")
    bullets(c, [("One visit, not four",
                 "Consulted, imaged, bled, prescribed and scheduled in a single attendance. The "
                 "thing patients actually complain about is the running around, and this removes it."),
                ("Referral stays inside the building",
                 "A conversion patient needing a scan, an aesthetics patient needing bloods, a "
                 "bariatric patient needing a theatre: each is served by another business on this "
                 "campus rather than lost to one off it."),
                ("Shared cost, separate books",
                 "Each business carries its own profit and loss and its own clinical governance, "
                 "while reception, security, power, cleaning and connectivity are bought once."),
                ("A template, not a one-off",
                 "What works here is a rate card, a service model and a clinical protocol set that "
                 "the second site inherits rather than invents.")],
            MX, y - 24, PAGE_W - 2 * MX - 60, size=12.5, leading=16.5, gap=14)


def s09(c):
    chrome(c, "What each of us gets")
    y = heading(c, "Three different returns from the same building.")
    table(c, [["", "What this facility gives you"],
              ["Alameda", "A conversion clinic that opens with diagnostics, a theatre and a "
                          "pharmacy already in the building and already staffed, on a floor of its "
                          "own, with a Nigerian partner whose name opens the market"],
              ["Medbury", "Four clinical companies trading from day one in a building it controls, "
                          "two support businesses with a captive market, and an operating template "
                          "worth more than the first site"],
              ["The visiting panel", "A clinical address without a lease, with the support and the "
                                     "equipment that a consultant cannot buy for one session a week"],
              ["The patient", "One building, one visit, one record, and a standard of welcome that "
                              "is the same whichever door they came in through"]],
          MX, y - 22, [160, PAGE_W - 2 * MX - 160], size=11.5, leading=15, hi={0})
    callout(c, MX, 112, PAGE_W - 2 * MX,
            "None of these three returns competes with the others. That is the test of whether a "
            "medical park is designed properly, and it is why the conversion clinic belongs here "
            "rather than in a unit of its own.")


def s10(c):
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, 0, 9, PAGE_H, fill=1, stroke=0)
    bump()
    logo(c, MX, PAGE_H - 96, 32, rev=True)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 30)
    c.drawString(MX, PAGE_H - 168, "What we settle in this room")
    bullets(c, [("The conversion clinic's floor",
                 "Confirm the demise, the fit-out specification and the opening programme."),
                ("The theatre",
                 "Who uses it, how lists are booked between businesses, and who holds the licence."),
                ("The clinical governance",
                 "Each business keeps its own, and we agree where they have to meet."),
                ("The sequence",
                 "Which parts of the building open first, and what each of us needs ready by then.")],
            MX, PAGE_H - 218, PAGE_W - 2 * MX - 120, dark=True, size=13, leading=17)
    rule(c, MX, 118, 300, RED, 1.2)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 13)
    c.drawString(MX, 96, "Medbury Healthcare Group   /   Alameda")
    c.setFillColor(MUTED); c.setFont("Helvetica", 10.5)
    c.drawString(MX, 76, "Lyfe Place Abuja   /   Private and confidential")


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for s in (s01, s02, s03, s04, s05, s06, s07, s08, s09, s10):
        s(c); c.showPage()
    c.setTitle("Lyfe Place Abuja: what we are doing with this facility")
    c.setAuthor("Medbury Healthcare Group")
    c.save()
    print("wrote %s" % OUT)


if __name__ == "__main__":
    build()
