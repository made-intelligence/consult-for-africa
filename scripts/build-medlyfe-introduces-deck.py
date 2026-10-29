"""
MEDLYFE INTRODUCES, as a deck.

The lead deliverable for Itunu and Chinwe. The prose plan is the leave-behind.
Landscape, one idea per slide, headings carry the argument.

Model in lib_medlyfe_introduces.py. Nothing numeric is typed here.

Run:
  python3 scripts/build-medlyfe-introduces-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib.colors import white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

import lib_medlyfe_introduces as L
import cfa_deck as D
from cfa_deck import (  # noqa: E402
    BODY, CREAM, GOLD, INK, MUTED, MX, NAVY, PAGE_H, PAGE_W, SAGE, SKY, SURFACE,
    SERIF, SERIF_B, SERIF_I, TEAL, DEEP_NAVY,
    box, bullet_block, callout, chevron_stack, chrome, hairline, heading, para,
    simple_table, tracked, wrap,
)

OUT = ROOT / "docs" / "medlyfe-introduces-deck-cfa.pdf"
SHARE = ROOT / "docs" / "Medlyfe Introduces - The Evening (Deck).pdf"

D.FOOTER[0] = "Consult for Africa   /   Private and confidential   /   Medlyfe"
D.TOTAL[0] = "15"

W = PAGE_W - 2 * MX


def ngn(x, dp=1):
    return ("NGN {:,.%df}m" % dp).format(x / L.M)


def k(x):
    return "{:,.0f}k".format(x / L.K)


def plain(s):
    return s.replace("&amp;", "&")


def cover(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    chevron_stack(c, PAGE_W - 250, 210, 190, 130, 15)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 132, 44, 3, fill=1, stroke=0)
    tracked(c, "MEDLYFE INTRODUCES", MX, PAGE_H - 160, "Helvetica-Bold", 11.5, GOLD, 3.0)

    c.setFont(SERIF_B, 40)
    c.setFillColor(white)
    y = PAGE_H - 215
    for line in wrap(c, "Feel Good Within and Look Better Outward", SERIF_B, 40, 560):
        c.drawString(MX, y, line)
        y -= 48

    c.setFont(SERIF_I, 15)
    c.setFillColor(SAGE)
    y -= 6
    for line in wrap(c, L.THEME_LINE, SERIF_I, 15, 520):
        c.drawString(MX, y, line)
        y -= 21

    c.setFont("Helvetica", 12)
    c.setFillColor(SKY)
    c.drawString(MX, y - 22, plain(L.FINE_PRINT))

    box(c, MX, 74, 300, 78, D.IND, spine=GOLD)
    c.setFont("Helvetica", 10.5)
    c.setFillColor(SAGE)
    c.drawString(MX + 22, 74 + 52, "ONE EVENING, SEVEN WEEKS, ALL IN")
    c.setFont(SERIF_B, 27)
    c.setFillColor(white)
    c.drawString(MX + 22, 74 + 17, ngn(L.PROGRAMME_TOTAL, 1))

    c.setFont("Helvetica", 11)
    c.setFillColor(SAGE)
    c.drawString(MX + 340, 74 + 52, L.EVENT_DATE.upper())
    c.setFont("Helvetica", 11)
    c.setFillColor(D.LIGHT)
    c.drawString(MX + 340, 74 + 33, "%d in the room" % L.ROOM_TOTAL)
    c.drawString(MX + 340, 74 + 17, "For Dr Itunu Akinware and Dr Chinwe Kpaduwa")
    c.showPage()


def s_theme(c):
    chrome(c, "The idea")
    y = heading(c, "Your patients are already buying both halves. They are buying them "
                   "in two different places.")
    y = para(c, "A woman who sleeps badly, has put on weight she cannot shift and hates "
                "what her skin is doing has one problem. She is currently taking it to "
                "a gym, a dermatologist and a wellness clinic that do not speak to each "
                "other. Medlyfe already has both halves under one roof and has never "
                "said so out loud.",
             MX, y - 22, "Helvetica", 13, BODY, W - 300, 19)
    y = bullet_block(c, [
        ("Within.", "Metabolic and weight management, hormones, longevity programmes, "
                    "IV therapy and the diagnostics underneath them."),
        ("Outward.", "Skin, injectables and the regenerative treatments, and in time "
                     "the surgical line."),
        ("The evening.", "One room, both halves argued by the clinicians who do them, "
                         "with the menu and the prices said out loud."),
    ], MX, y - 20, W - 310)
    rows = [["Where", "Title"]]
    rows += [[a, plain(b)] for a, b, _ in L.THEMES]
    simple_table(c, rows, MX, y - 16, [300, 300], size=11, leading=14, pad=8)
    callout(c, PAGE_W - MX - 270, PAGE_H - 150, 270,
            plain(L.THEME_CREDIT), bg=CREAM, spine=GOLD, size=11.5, leading=15.5)
    c.showPage()


def s_series(c):
    chrome(c, "The idea")
    y = heading(c, "A series, not a launch. The launch is over by breakfast.")
    y = para(c, "Each edition introduces something worth introducing. This one carries "
                "the cost of the format, the identity, the set, the film library, the "
                "guest list and the press relationships. The next three inherit all of "
                "it, and Dr Kpaduwa is back three times next year.",
             MX, y - 22, "Helvetica", 13, BODY, W, 19)
    rows = [["What edition one builds", "How it carries over"]]
    rows += [[a, plain(b)] for a, b in L.REUSED]
    simple_table(c, rows, MX, y - 24, [240, W - 240], size=10.5, leading=13.5, pad=8)
    c.showPage()


def s_billing(c):
    chrome(c, "How it is billed")
    y = heading(c, "Medlyfe takes the booking. Dr Kpaduwa fills the room.")
    y = para(c, "Three layers, and keeping them in this order is what makes the evening "
                "work commercially and stay proper.",
             MX, y - 20, "Helvetica", 13, BODY, W, 19)
    rows = [["Layer", "What it says", "Why"]]
    rows += [[a, plain(b), plain(cc)] for a, b, cc in L.BILLING]
    simple_table(c, rows, MX, y - 22, [110, 230, W - 340], size=10.5, leading=13.5, pad=8)
    c.showPage()


def s_positioning(c):
    chrome(c, "How she is described")
    y = heading(c, "Promoter is a business role. That is what makes it sayable.")
    y = para(c, "Her licence arrangements are still in train, so nothing presents her as "
                "here to take patients. Promoting a company she is building is true, "
                "sayable and depends on nothing being finalised.",
             MX, y - 20, "Helvetica", 13, BODY, W, 19)
    rows = [["", "What goes out"]]
    rows += [["We say" if ok else "Never", plain(a)] for a, ok, _ in L.POSITIONING]
    simple_table(c, rows, MX, y - 22, [90, W - 90], size=11, leading=14, pad=8)
    callout(c, MX, 128, W,
            "It is also the stronger position. An evening built on a visiting surgeon "
            "sells a diary that runs out when she boards a plane. This one sells a "
            "service that is open every week.",
            bg=SURFACE, spine=TEAL, size=12, leading=16)
    c.showPage()


def s_evening(c):
    chrome(c, "The evening")
    y = heading(c, "Medlyfe first, then the panel, then Chinwe, then the menu.",
                size=22)
    rows = [["", "", "Run of show, " + L.EVENT_DATE]]
    rows += [[a, plain(b), plain(cc)] for a, b, cc in L.RUN_OF_SHOW]
    y2 = simple_table(c, rows, MX, y - 18, [62, 210, W - 272], size=9.6, leading=12,
                      pad=5.5)
    callout(c, MX, y2 - 14, W, plain(L.ORDER_NOTE),
            bg=CREAM, spine=GOLD, size=11, leading=15, pad=16)
    c.showPage()


def s_crux(c):
    chrome(c, "The evening")
    y = heading(c, "The half hour between 20:25 and 20:55 is what pays for the night.")
    y = para(c, "Most evenings of this kind leave the menu out, and that is why they do "
                "not convert. The service walk through tells the room what is actually "
                "available on each side and what it costs. The questions that follow "
                "turn private curiosity into a public conversation, and the half hour "
                "afterwards is when a woman who has just heard an honest answer walks "
                "to the desk.",
             MX, y - 22, "Helvetica", 13, BODY, W - 290, 19)
    y = bullet_block(c, [(a, plain(b)) for a, b in L.SERVICE_TALK],
                     MX, y - 18, W - 300, size=11.5, leading=15, gap=11)
    callout(c, PAGE_W - MX - 258, PAGE_H - 150, 258,
            "Everything before that half hour exists to make it possible. The desk is "
            "staffed from the door, not set up at nine.",
            bg=CREAM, spine=GOLD, size=12, leading=16)
    c.showPage()


def s_room(c):
    chrome(c, "The room")
    y = heading(c, "A hundred and thirty three people, invited by hand and chased by "
                   "telephone.", size=21)
    rows = [["Who", "How many", "Why them"]]
    rows += [[a, str(b), plain(cc)] for a, b, cc in L.ROOM]
    rows += [["Total", str(L.ROOM_TOTAL), ""]]
    simple_table(c, rows, MX, y - 20, [190, 82, W - 272], size=10.5, leading=13.5, pad=7)
    callout(c, MX, 120, W,
            "An emailed invitation to a woman of this profile is not an invitation. "
            "Printed, delivered, then telephoned, is the difference between this room "
            "and half of it.",
            bg=SURFACE, spine=TEAL, size=12, leading=16)
    c.showPage()


def s_campaign(c):
    chrome(c, "The campaign")
    y = heading(c, "The shoot is the centre of the campaign, not the evening.")
    y = para(c, "One controlled day makes the portraits, the interview masters, the "
                "ninety second film and the footage the education series is cut from. "
                "It can only be made while she is in the country.",
             MX, y - 20, "Helvetica", 13, BODY, W, 19)
    rows = [["", "When", "What runs"]]
    rows += [[a, b, plain(cc)] for a, b, cc in L.CAMPAIGN]
    simple_table(c, rows, MX, y - 22, [86, 110, W - 196], size=10.2, leading=13, pad=7)
    c.showPage()


def s_rules(c):
    chrome(c, "The campaign")
    y = heading(c, "Four lines we hold, and none of them costs us anything we wanted.")
    y = para(c, "A licensed clinic launching a service and introducing the people behind "
                "it is ordinary professional practice. The rules bite narrowly, in four "
                "places worth knowing precisely rather than avoiding vaguely.",
             MX, y - 20, "Helvetica", 13, BODY, W, 19)
    y = bullet_block(c, [(a, plain(b)) for a, b in L.CAMPAIGN_RULES],
                     MX, y - 20, W, size=11.5, leading=15, gap=12)
    c.showPage()


def s_produces(c):
    chrome(c, "What it produces")
    y = heading(c, "Capacity is the ceiling, not demand.")
    y = para(c, "The list would support %d consultations. Medlyfe can hold %d in the "
                "four weeks after the evening. The constraint on this programme is the "
                "clinic diary, which also means it is not fragile to the marketing "
                "underperforming."
             % (round(L.QUALIFIED * L.CONSULT_RATE), L.CONSULT_CAPACITY),
             MX, y - 20, "Helvetica", 13, BODY, W - 280, 19)
    rows = [["By 13 November", "Target"]]
    rows += [[plain(a), "{:,}".format(v)] for a, v, _ in L.TARGETS]
    simple_table(c, rows, MX, y - 22, [W - 380, 100], size=11.5, leading=14.5, pad=8)
    callout(c, PAGE_W - MX - 262, PAGE_H - 150, 262,
            "%s qualified names is the asset. Everything else on this slide is a "
            "consequence of it." % "{:,}".format(L.QUALIFIED),
            bg=CREAM, spine=GOLD, size=12, leading=16)
    c.showPage()


def s_revenue(c):
    chrome(c, "What it produces")
    y = heading(c, "It pays for itself before she travels, and the Medlyfe half is "
                   "what does it.", size=22)
    y = para(c, "A surgeon led evening would have left almost all of the return sitting "
                "in a surgical list that cannot open this year. Putting the wellness "
                "side on the same stage changes that, because programmes sell from the "
                "Monday after and wait on nothing.",
             MX, y - 20, "Helvetica", 13, BODY, W, 19)
    rows = [["Inside the window", "Basis", "Value"]]
    rows += [
        ["Aesthetic treatment",
         "%d of %d consultations at %s, a quarter returning once"
         % (L.TREATED, L.CONSULTS, k(L.TREAT_VALUE)), ngn(L.AESTHETIC_REVENUE, 2)],
        ["Wellness and metabolic programmes",
         "%d of %d at %s, programme priced" % (L.WELLNESS, L.CONSULTS,
                                               k(L.WELLNESS_VALUE)),
         ngn(L.WELLNESS_REVENUE, 2)],
        ["Revenue before 13 November", "Earned by Medlyfe",
         ngn(L.IN_WINDOW_REVENUE, 2)],
        ["Against a programme costing", "", ngn(L.PROGRAMME_TOTAL, 2)],
    ]
    y2 = simple_table(c, rows, MX, y - 22, [250, W - 400, 150], size=11, leading=14,
                      pad=8)
    callout(c, MX, y2 - 16, W,
            plain(L.RECOVERY_LINE) + " The %s of registered surgical interest sits on "
            "top of that." % ngn(L.PIPELINE, 0),
            bg=SURFACE, spine=TEAL, size=12.5, leading=17)
    c.showPage()


def s_cost(c):
    chrome(c, "What it costs")
    y = heading(c, "Suppliers at cost, and we charge what it costs us to run.")
    rows = [["", "Amount"]]
    rows += [[g, ngn(L.cost_group(g), 2)] for g in L.COST_GROUPS]
    rows += [["Programme costs, at cost, no commission or mark up",
              ngn(L.COST_TOTAL, 2)],
             ["CFA operational cost, recovered, not a fee", ngn(L.FEE, 2)],
             ["Total", ngn(L.PROGRAMME_TOTAL, 2)]]
    y2 = simple_table(c, rows, MX, y - 20, [W - 400, 150], size=11.5, leading=14.5,
                      pad=8)
    callout(c, MX, y2 - 18, W,
            "CFA is a shareholder, so on the launch edition we charge cost and nothing "
            "else: no rate card, no margin, no management fee. Nineteen days of our own "
            "time are not billed. That is specific to this edition and is not the basis "
            "for the services agreement.",
            bg=CREAM, spine=GOLD, size=12, leading=16.5)
    c.showPage()


def s_build(c):
    chrome(c, "The build")
    y = heading(c, "Two and a half weeks, and it starts this week or the date moves.")
    rows = [["", "Dates", "What happens"]]
    rows += [["Week %d" % w, d, plain(t)] for w, d, h, t in L.BUILD]
    y2 = simple_table(c, rows, MX, y - 20, [76, 118, W - 194], size=10.2, leading=13,
                      pad=7)
    callout(c, MX, y2 - 16, W,
            "The venue has to be contracted and the invitations at the printer by "
            "Friday. If that slips the evening moves to %s and the conversion window "
            "loses a quarter of its length." % L.FALLBACK_DATE,
            bg=SURFACE, spine=TEAL, size=12, leading=16)
    c.showPage()


def s_close(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    chevron_stack(c, PAGE_W - 210, PAGE_H - 152, 140, 95, 12)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 118, 44, 3, fill=1, stroke=0)
    tracked(c, "TO START", MX, PAGE_H - 146, "Helvetica-Bold", 11.5, GOLD, 3.0)

    c.setFont(SERIF_B, 29)
    c.setFillColor(white)
    y = PAGE_H - 196
    for line in wrap(c, "Three decisions, and the printer takes the invitation on "
                        "Friday.", SERIF_B, 29, 620):
        c.drawString(MX, y, line)
        y -= 36

    items = [
        ("1", "Approve the budget", "Dr Itunu Akinware",
         ngn(round(L.FEE * L.TRANCHES[0][1]), 2) + " on approval"),
        ("2", "Confirm the date and the %.0f days" % L.HER_TOTAL,
         "Dr Chinwe Kpaduwa", L.EVENT_DATE + ", and the shoot the week before"),
        ("3", "Name the four Medlyfe people", "Dr Itunu Akinware",
         "Coordinator, marketing, operations, clinic lead"),
    ]
    yy = y - 18
    for n, what, who, detail in items:
        c.setFillColor(GOLD)
        c.setFont(SERIF_B, 17)
        c.drawString(MX, yy, n)
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(white)
        c.drawString(MX + 26, yy, what)
        c.setFont("Helvetica", 11.5)
        c.setFillColor(SKY)
        c.drawString(MX + 300, yy, who)
        c.setFont("Helvetica", 11.5)
        c.setFillColor(SAGE)
        c.drawString(MX + 470, yy, detail)
        yy -= 30

    c.setFillColor(GOLD)
    c.rect(MX, yy - 8, 40, 2, fill=1, stroke=0)
    c.setFont(SERIF_I, 14)
    c.setFillColor(SAGE)
    para(c, "The shoot and the evening are the two things that cannot be done after "
            "Chinwe travels. Everything else can be rebuilt next year at the same price.",
         MX, yy - 36, SERIF_I, 14, SAGE, 640, 20)

    c.setFont("Helvetica", 10)
    c.setFillColor(D.LIGHT)
    c.drawString(MX, 40, "Consult for Africa   /   hello@consultforafrica.com   /   "
                         "+234 913 813 8553")
    c.showPage()


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Medlyfe Introduces: Feel Good Within and Look Better Outward")
    c.setAuthor("Consult for Africa")
    cover(c)
    for fn in (s_theme, s_series, s_billing, s_positioning, s_evening, s_crux,
               s_room, s_campaign, s_rules, s_produces, s_revenue, s_cost, s_build):
        fn(c)
    s_close(c)
    c.save()
    print("wrote", OUT)
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
