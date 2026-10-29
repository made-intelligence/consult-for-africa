"""
LYFE PLASTICS AND DERMATOLOGY. The conversion plan, as a deck.

The lead deliverable for Dr Itunu Akinware and Dr Chinwe Kpaduwa. Landscape,
one idea per slide, headings carry the argument.

Model in lib_lyfe_conversion.py. Nothing numeric is typed here.

Run:
  python3 scripts/build-lyfe-conversion-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib.colors import white
from reportlab.pdfgen import canvas

import lib_lyfe_conversion as L
import cfa_deck as D
from cfa_deck import (  # noqa: E402
    BODY, CREAM, DEEP_NAVY, GOLD, INK, MUTED, MX, NAVY, PAGE_H, PAGE_W, SAGE,
    SKY, SURFACE, SERIF, SERIF_B, SERIF_I, TEAL,
    box, bullet_block, callout, chevron_stack, chrome, heading, para,
    simple_table, tracked, wrap,
)

OUT = ROOT / "docs" / "lyfe-conversion-plan-cfa.pdf"
SHARE = ROOT / "docs" / "Lyfe Plastics - The Conversion Plan (Deck).pdf"

D.FOOTER[0] = "Consult for Africa   /   Private and confidential   /   Medlyfe and Lyfe Plastics"
D.TOTAL[0] = "18"

W = PAGE_W - 2 * MX


# ------------------------------------------------------------------ 01 cover
def s_cover(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    chevron_stack(c, PAGE_W - 250, 210, 190, 130, 15)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 132, 44, 3, fill=1, stroke=0)
    tracked(c, "LYFE PLASTICS AND DERMATOLOGY", MX, PAGE_H - 160, "Helvetica-Bold", 11.5, GOLD, 3.0)

    c.setFont(SERIF_B, 38)
    c.setFillColor(white)
    y = PAGE_H - 212
    for line in wrap(c, "Getting her in front of patients, in six weeks", SERIF_B, 38, 540):
        c.drawString(MX, y, line)
        y -= 46

    c.setFont(SERIF_I, 15)
    c.setFillColor(SAGE)
    y -= 8
    for line in wrap(
        c,
        "A hundred and seventy names produced nothing. This is why, and what to do "
        "about it before she travels.",
        SERIF_I, 15, 520,
    ):
        c.drawString(MX, y, line)
        y -= 21

    box(c, MX, 74, 250, 78, D.IND, spine=GOLD)
    c.setFont("Helvetica", 10)
    c.setFillColor(SAGE)
    c.drawString(MX + 22, 74 + 52, "CONSULTATIONS HELD, SIX WEEKS")
    c.setFont(SERIF_B, 27)
    c.setFillColor(white)
    c.drawString(MX + 22, 74 + 17, "%d to %d" % (L.HELD_LOW, L.HELD_THIRD_DAY))

    c.setFont("Helvetica", 11)
    c.setFillColor(SAGE)
    c.drawString(MX + 288, 74 + 52, "Prepared " + L.TODAY)
    c.drawString(MX + 288, 74 + 34, "For Dr Itunu Akinware and " + L.SURGEON)
    c.drawString(MX + 288, 74 + 16, "Window closes " + L.WINDOW_END)
    c.showPage()


# ---------------------------------------------------------------- 02 the gap
def s_gap(c):
    chrome(c, "Where we are")
    y = heading(c, "A hundred and seventy leads, eleven warm, nothing closed.")
    y = para(
        c,
        "That is a warm rate of {:.1f} per cent against a benchmark band of 20 to 35 per "
        "cent. The practice is running at between a sixth and a quarter of normal, which "
        "is not the kind of gap that creative explains.".format(L.MARCH_WARM_RATE * 100),
        MX, y - 22, "Helvetica", 13, BODY, W - 290, 19,
    )
    rows = [["", "March 2026", "Benchmark"]]
    rows += [
        ["Leads", "{:,}".format(L.MARCH_LEADS), ""],
        ["Reached the warm stage", "{} ({:.1f}%)".format(L.MARCH_WARM, L.MARCH_WARM_RATE * 100),
         "{:.0f}% to {:.0f}%".format(L.BENCH_LEAD_TO_CONSULT[0] * 100, L.BENCH_LEAD_TO_CONSULT[1] * 100)],
        ["Consultations held", "Not recorded", ""],
        ["Cases", str(L.MARCH_CONVERTED), "{:.0f}% of consultations, median".format(L.BSM_CONVERT_MEDIAN * 100)],
    ]
    # Held to the left of the callout rather than the full page width.
    simple_table(c, rows, MX, y - 20, [190, 150, 160], size=11, leading=14, pad=8)
    callout(
        c, PAGE_W - MX - 258, PAGE_H - 150, 258,
        "A Nigerian practice published 392 consultations producing 245 operations. "
        "Closing is not this market's problem.",
        bg=CREAM, spine=GOLD, size=11.5, leading=15.5,
    )
    c.showPage()


# ------------------------------------------------------------- 03 diagnosis
def s_diagnosis(c):
    chrome(c, "Where we are")
    y = heading(c, "It is a speed problem or an audience problem. One day of digging says which.")
    y = bullet_block(
        c, [(a, b) for a, b in L.DIAGNOSIS], MX, y - 26, W - 300, size=12, leading=16, gap=12,
    )
    callout(
        c, PAGE_W - MX - 268, PAGE_H - 150, 268,
        "If the answer is speed, the fix costs nothing and starts on Monday. Find out "
        "before spending a naira on media.",
        bg=SURFACE, spine=TEAL, size=12, leading=16,
    )
    c.showPage()


# ----------------------------------------------------------------- 04 speed
def s_speed(c):
    chrome(c, "The fix that is free")
    y = heading(c, "The clock is the campaign.")
    y = para(c, L.SPEED_HEADLINE, MX, y - 22, "Helvetica", 13, BODY, W - 300, 19)
    rows = [["First call placed at", "Lift in conversion"]]
    rows += [[a, b] for a, b in L.SPEED]
    simple_table(c, rows, MX, y - 22, [230, 150], size=11, leading=14, pad=7)

    x2 = MX + 420
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x2, PAGE_H - 178, "AND THEN KEEP CALLING")
    yy = PAGE_H - 202
    for line in L.PERSISTENCE:
        c.setFillColor(GOLD)
        c.rect(x2, yy - 1, 7, 3, fill=1, stroke=0)
        yy = para(c, line, x2 + 16, yy, "Helvetica", 11.5, BODY, W - 420 - 16, 15) - 8
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(x2, yy - 4, "Velocify, " + L.VELOCIFY_LEADS + " leads from 400+ companies")
    c.showPage()


# --------------------------------------------------------------- 05 cadence
def s_cadence(c):
    chrome(c, "The fix that is free")
    y = heading(c, "Six calls, five emails, twenty two days. Printed and on the wall.")
    rows = [["When", "Time", "Channel", "Worth"]]
    rows += [[a, b, cc, d] for a, b, cc, d in L.CADENCE]
    y2 = simple_table(c, rows, MX, y - 24, [90, 150, 130, 110], size=10, leading=12.5, pad=5)
    callout(c, MX, y2 - 16, W, L.CADENCE_NOTE, bg=CREAM, spine=GOLD, size=11, leading=15, pad=16)
    c.showPage()


# --------------------------------------------------------------- 06 the gate
def s_gates(c):
    chrome(c, "What has to clear first")
    y = heading(c, "Five regulators, and the one everybody forgets is the one with the fine attached.", size=21)
    rows = [["", "Bites on", "Exposure", "What it says", "What we do"]]
    rows += [[a, b, cc, d, e] for a, b, cc, d, e in L.GATES]
    simple_table(c, rows, MX, y - 20, [96, 86, 112, 250, W - 544], size=8.7, leading=11, pad=5)
    c.showPage()


def s_gate_urgent(c):
    chrome(c, "What has to clear first")
    y = heading(c, "Do not market a clinic date we cannot legally staff.")
    y = para(
        c,
        "A foreign practitioner needs a Special Temporary Permit or Temporary Limited "
        "Registration from the Council before carrying out medical activity in Nigeria. "
        "Separately, a medical mission must be notified to the Diaspora Unit of the "
        "Federal Ministry of Health three months in advance. Nobody has established "
        "which of those two a commercial visiting clinic is read as. If it is the "
        "second, a November clinic date has already passed its notice period.",
        MX, y - 24, "Helvetica", 13, BODY, W - 280, 19,
    )
    y = bullet_block(c, [
        ("This week.", "Call the Council and get the position in writing. Not an opinion "
                       "from a lawyer who has not called them."),
        ("Until then.", "Everything says she sets the standard and the clinic's own "
                        "registered clinicians treat. The page is already built that way, "
                        "so nothing has to be retracted."),
        ("The upside.", "A virtual consultation is a real consultation. A study of 1,889 "
                        "new plastic surgery patients found no difference in whether they "
                        "went on to have a procedure. She can qualify a diary from abroad "
                        "while the registration is in train."),
    ], MX, y - 20, W - 290, size=12, leading=16, gap=12)
    callout(
        c, PAGE_W - MX - 248, PAGE_H - 150, 248,
        "This is the critical path. Everything in this deck is contingent on it and "
        "nothing else in it is.",
        bg=CREAM, spine=GOLD, size=12, leading=16,
    )
    c.showPage()


# -------------------------------------------------------------- 08 the market
def s_supply(c):
    chrome(c, "The market")
    y = heading(c, "There are about a hundred and twenty four plastic surgeons for two hundred and thirty five million people.")
    rows = [["", "", ""]]
    rows += [[a, b, cc] for a, b, cc in L.SUPPLY]
    y2 = simple_table(c, rows, MX, y - 24, [300, 150, W - 450], size=11.5, leading=14.5, pad=9)
    callout(c, MX, y2 - 18, W, L.SUPPLY_NOTE, bg=SURFACE, spine=TEAL, size=12.5, leading=17, pad=18)
    c.showPage()


def s_turkey(c):
    chrome(c, "The market")
    y = heading(c, "We are not competing with Lagos. We are competing with Istanbul, and we already win on price.")
    rows = [["", "All in", "What is in the number"]]
    rows += [[a, b, cc] for a, b, cc in L.TURKEY]
    y2 = simple_table(c, rows, MX, y - 24, [310, 140, W - 450], size=10.5, leading=13.5, pad=8)
    callout(c, MX, y2 - 18, W, L.TURKEY_FINDING, bg=CREAM, spine=GOLD, size=12.5, leading=17, pad=18)
    c.showPage()


def s_aftercare(c):
    chrome(c, "The open ground")
    y = heading(c, "The operation is not the expensive part. Nobody in Lagos prices the rest.")
    y = para(
        c,
        "One Lagos patient published every line of what she spent. It is the most useful "
        "document in this market and it says the same thing on every line: the quote was "
        "for the surgery, and the surgery was the cheap half.",
        MX, y - 22, "Helvetica", 13, BODY, W - 280, 19,
    )
    rows = [["", "NGN m", "What it was"]]
    rows += [[a, "{:,.2f}".format(b), cc] for a, b, cc in L.AFTERCARE_CASE]
    y2 = simple_table(c, rows, MX, y - 22, [190, 90, W - 280 - 10], size=10.5, leading=13.5, pad=7)
    callout(
        c, MX, y2 - 16, W - 270,
        L.AFTERCARE_LINE + " A named, included, priced aftercare programme is the clearest "
        "piece of open ground in this market, and it is what Istanbul is actually selling.",
        bg=SURFACE, spine=TEAL, size=12, leading=16,
    )
    callout(
        c, PAGE_W - MX - 248, PAGE_H - 150, 248,
        "It only works if it is true. Cost it and staff it in week one, or take it off "
        "the page.",
        bg=CREAM, spine=GOLD, size=11.5, leading=15.5,
    )
    c.showPage()


def s_trust(c):
    chrome(c, "The market")
    y = heading(c, "This market does not need convincing that surgery is desirable. It needs convincing that it is survivable.")
    rows = [["When", "What the market remembers"]]
    rows += [[a, b] for a, b in L.TRUST]
    y2 = simple_table(c, rows, MX, y - 24, [110, W - 110], size=10, leading=13, pad=7)
    callout(c, MX, y2 - 16, W, L.TRUST_FINDING, bg=CREAM, spine=GOLD, size=12, leading=16, pad=16)
    c.showPage()


# ---------------------------------------------------------- 11 the positioning
def s_position(c):
    chrome(c, "The position")
    y = heading(c, "She teaches. She does not sell. That is forced on us, and it is also the better strategy.")
    rows = [["", ""]]
    rows += [[a, b] for a, b in L.POSITION]
    simple_table(c, rows, MX, y - 24, [250, W - 250], size=11, leading=14.5, pad=8)
    c.showPage()


# ------------------------------------------------------------- 12 the channels
def s_channels(c):
    chrome(c, "The channels")
    y = heading(c, "Instagram is a quarter the size everybody thinks, and it is shrinking.")
    rows = [["", "Reach in Nigeria", ""]]
    rows += [[a, b, cc] for a, b, cc in L.CHANNELS]
    y2 = simple_table(c, rows, MX, y - 24, [110, 230, W - 340], size=10, leading=13, pad=7)
    callout(c, MX, y2 - 16, W, L.CHANNEL_NOTE, bg=SURFACE, spine=TEAL, size=11, leading=15, pad=16)
    c.showPage()


# --------------------------------------------------------------- 13 the engine
def s_engine(c):
    chrome(c, "The engine")
    y = heading(c, "The page is built, and every decision in it traces to something measured.")
    bullet_block(
        c, [(a, b) for a, b in L.ENGINE], MX, y - 26, W, size=11.5, leading=15, gap=10,
    )
    c.showPage()


# ---------------------------------------------------------------- 14 the rooms
def s_rooms(c):
    chrome(c, "The rooms")
    y = heading(c, "Eight rooms we can name, and not one of them needs a launch.")
    rows = [["", "What it is", "What we do with it"]]
    rows += [[a, b, cc] for a, b, cc in L.ROOMS]
    simple_table(c, rows, MX, y - 22, [168, 250, W - 418], size=8.4, leading=10.6, pad=4.2)
    c.showPage()


def s_rooms_note(c):
    chrome(c, "The rooms")
    y = heading(c, "The evening on the tenth should be the first of seven things, not the only one.")
    y = para(c, L.ROOMS_FINDING, MX, y - 24, "Helvetica", 13, BODY, W - 280, 19)
    y = bullet_block(c, [
        ("The host is the draw, not us.", "A private evening works because it is "
         "somebody's room and somebody's guest list. We bring the conversation, they "
         "bring the people, and nobody is paid."),
        ("The doctors' session is different.", "Continuing professional development is "
         "compulsory at 36 points every two years. A session for referring clinicians "
         "fills itself, is the one promotion the Council permits, and puts us in front "
         "of the people who send patients rather than the patients."),
        ("Everything terminates in the same place.", "One WhatsApp number, one page, one "
         "coordinator, one queue. Seven rooms feeding seven different inboxes is how "
         "March happened."),
    ], MX, y - 20, W - 290, size=12, leading=16, gap=12)
    callout(
        c, PAGE_W - MX - 248, PAGE_H - 150, 248,
        "Twenty five people in a members club with a host who vouches for you is worth "
        "more than two hundred at a launch.",
        bg=CREAM, spine=GOLD, size=12, leading=16,
    )
    c.showPage()


# ------------------------------------------------------------------ 16 the 170
def s_cold(c):
    chrome(c, "The hundred and seventy")
    y = heading(c, "The eleven are worth more than the other hundred and fifty nine put together.")
    rows = [["", "Count", "What we do with them"]]
    rows += [[a, str(b), cc] for a, b, cc in L.COLD_MODEL]
    y2 = simple_table(c, rows, MX, y - 22, [190, 70, W - 260], size=11, leading=14, pad=8)

    rows2 = [["What the list is actually worth", ""]]
    rows2 += [
        ["People the message reaches at all", "{} to {}".format(*L.COLD_REACHABLE)],
        ["Live conversations", "{} to {}".format(*L.COLD_CONVERSATIONS)],
        ["Consultations booked", "{} to {}".format(*L.COLD_CONSULTS)],
        ["Cases, eventually", "{} to {}".format(*L.COLD_CASES)],
    ]
    y3 = simple_table(c, rows2, MX, y2 - 20, [320, 130], size=10.5, leading=13.5, pad=7)
    callout(
        c, PAGE_W - MX - 268, PAGE_H - 150, 268, L.COLD_WARNING,
        bg=CREAM, spine=GOLD, size=11.5, leading=15.5,
    )
    c.showPage()


# ------------------------------------------------------------- 17 the calendar
def s_plan(c):
    chrome(c, "The six weeks")
    y = heading(c, "Week one clears the gate and stops the leak. Everything else is sequencing.")
    rows = [["", "", "", ""]]
    rows += [[str(a), b, cc, d] for a, b, cc, d in L.PLAN]
    y2 = simple_table(c, rows, MX, y - 22, [30, 110, 200, W - 340], size=9.2, leading=11.8, pad=5)
    callout(c, MX, y2 - 14, W, L.DECEMBER, bg=SURFACE, spine=TEAL, size=10.5, leading=14.5, pad=15)
    c.showPage()


# -------------------------------------------------------------- 18 the numbers
def s_numbers(c):
    chrome(c, "What good looks like")
    y = heading(c, "On these rates we run out of chairs before we run out of people.")
    rows = [["", "Target", ""]]
    rows += [[a, b, cc] for a, b, cc in L.TARGETS]
    y2 = simple_table(c, rows, MX, y - 22, [250, 110, W - 360], size=10.5, leading=13.5, pad=7)
    callout(
        c, MX, y2 - 16, W,
        "Both ends of the demand range clear the diary, so the question in week two is "
        "not how much media to buy. It is whether the clinic will give a third "
        "consultation day, which is worth {} more consultations held and costs nothing "
        "in marketing.".format(L.HELD_THIRD_DAY - L.HELD_LOW),
        bg=CREAM, spine=GOLD, size=11.5, leading=15.5, pad=16,
    )
    c.showPage()


def s_needs(c):
    chrome(c, "What we need")
    y = heading(c, "One of these is worth more than the entire media budget.")
    bullet_block(c, [(a, b) for a, b in L.NEEDS], MX, y - 26, W, size=11.5, leading=15, gap=10)
    c.showPage()


def s_risks(c):
    chrome(c, "What would change the plan")
    y = heading(c, "Five things could break this, and one of them is ours.")
    rows = [["", ""]]
    rows += [[a, b] for a, b in L.RISKS]
    simple_table(c, rows, MX, y - 24, [240, W - 240], size=9.6, leading=12.4, pad=6)
    c.showPage()


def s_language(c):
    chrome(c, "What has to clear first")
    y = heading(c, "The copy rules, on one page, so nobody has to remember the reasoning.")
    y = para(
        c,
        "The clinic advertises. She educates. Every line on the left is sayable because "
        "it describes a business role or a factual American credential. Every line on "
        "the right holds her out as a practitioner available to treat Nigerian patients, "
        "which she is not yet registered to be.",
        MX, y - 22, "Helvetica", 12.5, BODY, W, 18,
    )
    rows = [["Say this", "Never this"]]
    rows += [[a, b] for a, b in L.LANGUAGE]
    y2 = simple_table(c, rows, MX, y - 22, [340, 340], size=11, leading=14, pad=8)
    callout(c, MX, y2 - 16, W, L.IMAGE_PRECEDENT, bg=CREAM, spine=GOLD, size=10.5, leading=14.5, pad=15)
    c.showPage()


def s_audience(c):
    chrome(c, "What she actually brings")
    y = heading(c, "She is a credentials asset, not a distribution asset.")
    rows = [["", "Scale", ""]]
    rows += [[a, b, cc] for a, b, cc in L.HER_AUDIENCE]
    y2 = simple_table(c, rows, MX, y - 24, [160, 230, W - 390], size=10, leading=13, pad=7)
    callout(c, MX, y2 - 16, W, L.AUDIENCE_FINDING, bg=SURFACE, spine=TEAL, size=11.5, leading=15.5, pad=16)
    c.showPage()


def s_library(c):
    chrome(c, "What she actually brings")
    y = heading(c, "Three hundred and three videos already exist, in her voice, arguing our thesis.")
    bullet_block(c, [(a, b) for a, b in L.HER_ASSETS], MX, y - 26, W, size=11.5, leading=15, gap=11)
    c.showPage()


def s_nigeria(c):
    chrome(c, "What she actually brings")
    y = heading(c, "Twelve years of teaching and building in West Africa, never once used.")
    rows = [["", ""]]
    rows += [[a, b] for a, b in L.HER_NIGERIA]
    y2 = simple_table(c, rows, MX, y - 24, [80, W - 80], size=11, leading=14.5, pad=8)
    callout(c, MX, y2 - 16, W, L.SAFARI_ANSWER, bg=CREAM, spine=GOLD, size=11.5, leading=15.5, pad=16)
    c.showPage()


def s_comparator(c):
    chrome(c, "The competition")
    y = heading(c, "American standard, close to home is taken. Do not fight for it.")
    rows = [["", ""]]
    rows += [[a, b] for a, b in L.COMPARATOR]
    simple_table(c, rows, MX, y - 24, [190, W - 190], size=11, leading=14.5, pad=8)
    c.showPage()


def s_search(c):
    chrome(c, "Two things to fix in week one")
    y = heading(c, "What happens when a Lagos prospect does the obvious thing and searches her name.")
    y = callout(c, MX, y - 26, W, L.SEARCH_RISK, bg=CREAM, spine=GOLD, size=12, leading=16.5, pad=18)
    y = heading(c, "And the two offers that contradict each other.", y - 42, size=19)
    callout(c, MX, y - 18, W, L.OFFER_CLASH, bg=SURFACE, spine=TEAL, size=12, leading=16.5, pad=18)
    c.showPage()


def s_close(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    chevron_stack(c, PAGE_W - 230, 180, 170, 120, 14)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 150, 44, 3, fill=1, stroke=0)
    tracked(c, "WHAT HAPPENS ON MONDAY", MX, PAGE_H - 178, "Helvetica-Bold", 11.5, GOLD, 3.0)

    c.setFont(SERIF_B, 31)
    c.setFillColor(white)
    y = PAGE_H - 232
    for line in wrap(c, "Three things, and none of them cost money.", SERIF_B, 31, 540):
        c.drawString(MX, y, line)
        y -= 38

    items = [
        ("Call the Council", "Get the registration position in writing. Everything else "
                             "waits on it."),
        ("Name the coordinator", "One person, the telephone, the grid on the wall, and "
                                 "time to first contact measured from Monday."),
        ("Pull the March data", "Time to first call, number of attempts, and what the "
                                "landing page weighed. One day of work settles the whole "
                                "diagnosis."),
    ]
    y -= 18
    for t, b in items:
        c.setFillColor(GOLD)
        c.rect(MX, y + 3, 8, 3, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(white)
        c.drawString(MX + 20, y, t)
        c.setFont("Helvetica", 12)
        c.setFillColor(SAGE)
        yy = y - 18
        for line in wrap(c, b, "Helvetica", 12, 520):
            c.drawString(MX + 20, yy, line)
            yy -= 16
        y = yy - 14

    c.setFont("Helvetica", 10)
    c.setFillColor(SKY)
    c.drawString(MX, 56, "Consult for Africa   /   hello@consultforafrica.com   /   +234 913 813 8553")
    c.showPage()


SLIDES = [
    s_cover, s_gap, s_diagnosis, s_speed, s_cadence,
    s_gates, s_gate_urgent, s_language,
    s_supply, s_turkey, s_aftercare, s_trust, s_comparator,
    s_audience, s_library, s_nigeria,
    s_position, s_channels, s_engine,
    s_rooms, s_rooms_note, s_cold, s_search,
    s_plan, s_numbers, s_needs, s_risks, s_close,
]


def build():
    D.TOTAL[0] = str(len(SLIDES) - 1).zfill(2)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H))
    c.setTitle("Lyfe Plastics and Dermatology, the conversion plan")
    for s in SLIDES:
        s(c)
    c.save()
    SHARE.write_bytes(OUT.read_bytes())
    print("Wrote", OUT.relative_to(ROOT))
    print("Wrote", SHARE.relative_to(ROOT))


if __name__ == "__main__":
    build()
