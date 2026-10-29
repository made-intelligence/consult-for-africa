"""
Clearview: growing the IVF business.

The argument comes first and the fee comes last, which is the opposite of how
this deck was built originally. Slides 2 to 5 are his business: what the bleed
costs him, why Lekki is the wrong catchment, why the hospital is a moat nobody
can copy, and what a patient is actually worth. The commercial mechanism sits
from slide 11.

Economics: scripts/clearview_agency.py

    python3 scripts/build-clearview-performance-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cfa_deck as D  # noqa: E402
import clearview_agency as A  # noqa: E402
import clearview_model as CM  # noqa: E402
from cfa_deck import (  # noqa: E402
    PAGE_W, PAGE_H, MX, DOCS, SERIF, SERIF_B, SERIF_I,
    INK, IND2, SKY, SAGE, SAGE_D, GOLD, BODY, MUTED, SURFACE, CREAM, RULE, white,
    HexColor, ImageReader, canvas, landscape, A4,
    chrome, heading, para, bullet_block, callout, box, simple_table, tracked, hairline,
)

OUT = DOCS / "clearview" / "clearview-performance-mandate-cfa.pdf"
D.FOOTER[0] = ("Consult for Africa   /   Confidential   /   Growing Clearview Fertility")

f = lambda x, dp=0: ("{:,.%df}" % dp).format(x)
SHARE = A.CONVERSION_SHARE
MEDIA = 3.0
Y1 = A.year_one(MEDIA)
TOT_REV, TOT_FEE = Y1["value"], Y1["cfa_conversion"]
TOT_CONTENT, TOT_MEDIA, KEEPS = Y1["content"], Y1["spend"], Y1["his_keep"]
OUTLAY = Y1["outlay"]
PESS = A.year_one_case("pessimistic", MEDIA)
M = CM.MID


def slide_cover(c):
    c.setFillColor(white); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    try:
        img = ImageReader(str(DOCS / "c4a-logo.png")); iw, ih = img.getSize()
        c.drawImage(img, MX, PAGE_H - 72, width=166, height=166 * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        pass
    tracked(c, "PREPARED FOR", PAGE_W - MX - 214, PAGE_H - 42, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    c.setFont(SERIF_B, 17); c.setFillColor(INK)
    c.drawRightString(PAGE_W - MX, PAGE_H - 66, "Clearview Fertility")
    c.setFont(SERIF_I, 9.4); c.setFillColor(SAGE_D)
    c.drawRightString(PAGE_W - MX, PAGE_H - 84, "For the attention of Dr Kunle Ajayi")
    hairline(c, PAGE_W - MX - 214, PAGE_H - 95, 214, RULE, 0.7)
    hairline(c, MX, PAGE_H - 95, 300, RULE, 0.7)

    tracked(c, "GROWING CLEARVIEW FERTILITY  /  11 OCTOBER 2026", MX, PAGE_H - 132,
            "Helvetica-Bold", 7.6, GOLD, 2.4)
    c.setFont(SERIF, 30); c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 186, "Your laboratory is half empty.")
    c.setFont(SERIF_B, 30)
    c.drawString(MX, PAGE_H - 224, "The patients are not in Lekki.")
    hairline(c, MX, PAGE_H - 248, 404, GOLD, 1.2)
    y = para(c, "Nine years in, about a hundred people a month contact Clearview and fifteen "
                "start treatment. The laboratory runs at half what it could carry. The patients "
                "who would fill it are in mainland Lagos, in Abuja and Port Harcourt, in Accra, "
                "and in London and Houston, and they cannot get this done at home.",
             MX, PAGE_H - 272, SERIF_I, 12.2, IND2, 404, 17.5)
    y = para(c, "Consult for Africa and Mezo would go and get them, and be paid only when they arrive.",
             MX, y - 10, SERIF_B, 11.6, GOLD, 404, 15)
    para(c, "Indicative throughout. The commercial terms are fixed once we have your numbers, "
            "and not before. Nothing here is for signing.",
         MX, y - 12, SERIF_I, 10, SAGE_D, 404, 13.5)

    box(c, PAGE_W - MX - 250, 150, 250, 196, SURFACE, GOLD, 5)
    c.setFont("Helvetica-Bold", 8.4); c.setFillColor(SAGE_D)
    c.drawString(PAGE_W - MX - 228, 316, "OUR FEE")
    c.setFont(SERIF_B, 40); c.setFillColor(INK)
    c.drawString(PAGE_W - MX - 228, 268, "N%s" % f(A.FEE_PER_PATIENT * 1e6, 0))
    para(c, "per patient who starts treatment. One fifth of a single cycle, paid once. Nothing on "
            "her second cycle, her storage or her delivery.",
         PAGE_W - MX - 228, 244, "Helvetica", 10.2, BODY, 206, 13.6)
    c.setFont("Helvetica-Bold", 10.2); c.setFillColor(IND2)
    c.drawString(PAGE_W - MX - 228, 182, "No patient, no fee.")
    c.setFont("Helvetica-Oblique", 9); c.setFillColor(SAGE_D)
    c.drawString(PAGE_W - MX - 228, 166, "Indicative. Fixed at stage two.")

    hairline(c, MX, 104, PAGE_W - 2 * MX, RULE, 0.7)
    c.setFont(SERIF_B, 10.4); c.setFillColor(INK)
    c.drawString(MX, 84, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 9); c.setFillColor(SAGE_D)
    c.drawString(MX, 69, "Consult for Africa")
    c.drawRightString(PAGE_W - MX, 84, "hello@consultforafrica.com   /   +234 913 813 8553")
    c.drawRightString(PAGE_W - MX, 69, "consultforafrica.com   /   Confidential")


def slide_deal(c):
    chrome(c, "The deal")
    y = heading(c, "Five lines. You pay for three, and we carry two.") - 27
    rows = [
        ["", "What it is", "Who pays"],
        ["Content", "**Two shoot days a year**, each a full packed day at the C4A office with "
         "everybody in: you, consented patients, your team, the colleagues who refer to you. "
         "N%s m a day, so N%s m for the year, and that is the only fixed fee here."
         % (f(A.BLOCK_FEE, 2), f(A.BLOCK_FEE * A.BLOCKS_PER_YEAR, 2)), "You, to us"],
        ["Running it", "Building, running, optimising and refreshing every campaign off that "
         "library. **We absorb this.** We are paid on conversion, so keeping it working is how "
         "we get paid.", "Nobody. It is ours."],
        ["Media and PR", "Paid advertising plus placed coverage on Nigerian blogs. At N%s m a "
         "month of ads and %d placements a campaign, that is N%s m across the year. Passed "
         "through at cost, and **we take no commission on it.**"
         % (f(MEDIA, 1), A.PR_PER_CAMPAIGN, f(Y1["spend"], 1)), "You, to the platforms"],
        ["Search and Mezo", "The organic side: search pages for the whole journey, the Couple "
         "Fertility Check, the diaspora page and the Mezo network for remote scans. **Mezo builds "
         "and runs it at its own cost.** No media, no content fee.", "Nobody. It is ours."],
        ["Our fee", "N%s m for each attributed patient who starts treatment, from either "
         "channel, paid once, when she pays you. One fifth of a single cycle. **Everything she spends after that first "
         "cycle is entirely yours.** If nobody comes, we are paid nothing."
         % f(A.FEE_PER_PATIENT, 2), "You, to us, only when it works"],
    ]
    rows = [[a, b.replace("**", ""), d] for a, b, d in rows]
    y = simple_table(c, rows, MX, y, [150, PAGE_W - 2 * MX - 320, 170], size=10.2,
                     leading=13.2, pad=6)
    callout(c, MX, y - 16, PAGE_W - 2 * MX,
            "Every agency in Lagos takes fifteen to twenty per cent of your media budget, which "
            "pays them more the more you spend, whether or not a single patient arrives. We take "
            "nothing on media and carry our upside on the only number that matters to you.",
            bg=CREAM, spine=GOLD, size=11.6, leading=16)


def slide_content(c):
    chrome(c, "What we need from you")
    y = heading(c, "The one thing we cannot manufacture is you") - 27
    para(c, "Fertility is bought on trust, from a named doctor, by a woman who has already been "
            "disappointed. No agency can invent that. It has to come out of your head and your "
            "clinic, and then we do the rest.",
         MX, y, SERIF_I, 12.2, IND2, PAGE_W - 2 * MX, 17)
    y -= 56
    items = [
        ("Two days of filming a year.", "At our office, which is already set up for it. We ask "
         "the questions, we leave, and that is the whole of your time on camera. You never edit "
         "anything and you never post anything."),
        ("Patients willing to tell their story.", "Recorded in the same session, properly "
         "consented in writing, and never used beyond what they agreed to. One real voice does "
         "more than a year of stock photography."),
        ("Your team, and the colleagues who refer to you.", "Your embryologist, your nurses, a "
         "gynaecologist who sends you patients. It is the same shoot day and it costs nothing "
         "extra."),
        ("The questions your patients actually ask.", "From you and from your front desk. The ones "
         "asked at three in the morning are the ones worth answering publicly."),
        ("Your honest position on the hard things.", "Age and odds. When IVF is not the right next "
         "step. What a cycle really costs. This is the content nobody in this market makes, and "
         "it is the content that converts."),
        ("A decision inside a week.", "On anything we send you for approval. Campaigns die in "
         "approval queues."),
    ]
    bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.6, leading=15.4, gap=12)


def slide_engine(c):
    chrome(c, "The shoot day")
    y = heading(c, "One packed day, and we take everything we can get") - 23
    para(c, "Everybody comes to our office on the same day and we film until we run out of "
            "daylight. The point is volume: the more testimonials and the more scripted answers "
            "we get in the room, the longer the library lasts and the fewer days of your life "
            "this costs.",
         MX, y, SERIF_I, 11.4, IND2, PAGE_W - 2 * MX, 16)
    y -= 46
    rows = [["What we take", "Per day", "Why"]]
    for a, b, d in A.YIELD:
        rows.append([a, b, d])
    y = simple_table(c, rows, MX, y, [230, 110, PAGE_W - 2 * MX - 340],
                     size=10.6, leading=14, pad=8)
    callout(c, MX, y - 20, PAGE_W - 2 * MX,
            "Two of these days a year is the whole of your time on camera. Everything you see "
            "running for the next twelve months, in the adverts and in the blog pieces, comes "
            "out of those two days.",
            bg=CREAM, spine=GOLD, size=11.6, leading=16)


def slide_production(c):
    chrome(c, "What the content costs")
    y = heading(c, "Two days a year, priced openly") - 21
    rows = [["One packed shoot day", "Days", "Rate", "NGN m"]]
    for n, d, r in A.BLOCK:
        rows.append([n, ("%g" % d), f(r, 3), f(d * r, 3)])
    rows.append(["Direct cost", "", "", f(A.BLOCK_DIRECT, 3)])
    rows.append(["Our margin, %d per cent" % (A.BLOCK_MARKUP * 100), "", "",
                 f(A.BLOCK_DIRECT * A.BLOCK_MARKUP, 3)])
    rows.append(["Per shoot day", "", "", f(A.BLOCK_FEE, 2)])
    rows.append(["Two days, the whole year", "", "", f(A.BLOCK_FEE * A.BLOCKS_PER_YEAR, 2)])
    y = simple_table(c, rows, MX, y, [PAGE_W - 2 * MX - 330, 90, 110, 130],
                     size=10.2, leading=13.2, pad=6)
    y = callout(c, MX, y - 18, PAGE_W - 2 * MX,
                "Post production is the largest line because the day is packed, and that is the "
                "right trade: crew time is expensive and editing is not. We shoot at our own "
                "office, so you are not paying for a studio.",
                bg=SURFACE, spine=IND2, size=11.4, leading=15.6)
    para(c, "Each library feeds two three month campaigns, so two days covers twelve months of "
            "advertising. Creative does tire eventually, and when it does we reshoot at our own "
            "cost, because we are paid when it converts and not before.",
         MX, y - 16, SERIF_I, 9.8, MUTED, PAGE_W - 2 * MX, 13)


def slide_pr(c):
    chrome(c, "The other half of the media")
    y = heading(c, "Adverts buy attention. Blogs buy belief.") - 27
    items = [
        ("She will search you before she calls.", "Nobody spends four million naira on a clinic "
         "they found in an advert without going looking first. What she finds at that moment "
         "decides whether she picks up the phone."),
        ("A placed piece outlives the campaign.", "An advert stops the day you stop paying for "
         "it. An article on a Nigerian health or lifestyle blog keeps ranking in search for "
         "years, and it keeps working in the months when nothing is running."),
        ("It is written out of the same shoot day.", "The scripted answers you give on camera "
         "become the articles. You are not asked for anything additional, and we are not "
         "charging you a second time to produce them."),
        ("%d placements a campaign, at cost." % A.PR_PER_CAMPAIGN,
         "Typically N%s m to N%s m each depending on the title. We place them, we write them, "
         "and we take no commission on what you pay the publisher."
         % (f(A.PR_COST_BAND[0], 2), f(A.PR_COST_BAND[1], 2))),
    ]
    bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.6, leading=15.4, gap=14)


def slide_mezo(c):
    chrome(c, "The channel you do not pay for")
    y = heading(c, "Adverts find her when she is ready. Search finds her a year earlier.") - 25
    para(c, "Clearview is already a partner on Mezo, our patient platform. Alongside the paid "
            "campaigns, Mezo would build the search side around you, at its own cost, and be paid "
            "the same single fee if a patient it brings starts treatment.",
         MX, y, SERIF_I, 11.4, IND2, PAGE_W - 2 * MX, 16)
    y -= 50
    items = [
        ("She searches the worry before she searches the clinic.", "\"Can't get pregnant after a "
         "year\", \"HSG price Lagos\", \"low sperm count\". Nobody in Lagos answers those "
         "properly, and the couple asking them has not chosen a clinic yet."),
        ("The Couple Fertility Check is the front door.", "Both partners, one morning, one fixed "
         "price: consultation, scan, AMH, HSG and semen analysis. The result points to one next "
         "step, and if that step is IVF the fee counts towards the cycle."),
        ("Your price, published as yours, drugs included.", "Every competitor publishes a cycle "
         "price with the drugs left out. Yours would be the only all-in figure in the market, at "
         "exactly what you charge. Mezo adds nothing to it."),
        ("A page for the patient abroad.", "Days in Lagos, the price in pounds and dollars, "
         "monitoring near home, and the hospital behind the laboratory. Written for London and "
         "Houston separately, because their reasons are different."),
        ("Paid on the platform, so attribution is settled.", "She books and pays through Mezo, "
         "so where she came from is on the receipt. There is nothing to argue about."),
    ]
    y = bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11, leading=14.4, gap=10)
    para(c, "No patient from this channel is counted anywhere else in this document. Search takes "
            "three to six months to earn, and we will not model what we have not measured.",
         MX, 92, SERIF_I, 9.6, MUTED, PAGE_W - 2 * MX, 12.5)


def slide_bleed(c):
    chrome(c, "Where you are now")
    y = heading(c, "What another year of this costs you") - 22
    para(c, "Every figure below comes from the assumptions in your strategy note and will move "
            "once you send us the real ones. The shape will not move.",
         MX, y, SERIF_I, 11, MUTED, PAGE_W - 2 * MX, 15)
    y -= 36
    rows = [["", "What is happening", "What it is worth"]]
    rows.append(["1", "About %.0f people contact you in a month and about %.0f start treatment. "
                 "The other %.0f go somewhere else, or nowhere."
                 % (M["enquiries"], M["cycles"], M["enquiries"] - M["cycles"]),
                 "Five points of conversion is N%s m a year"
                 % f(M["extra_cycles"] * M["fresh_rev"] / M["cycles"] * 12, 0)])
    rows.append(["2", "Your laboratory can run about %d cycles a month. It runs about %d."
                 % (A.LAB_CEILING, M["cycles"]),
                 "Half of the most expensive asset you own, idle"])
    rows.append(["3", "You create around %.0f pregnancies and %.0f caesarean sections a year."
                 % (M["pregnancies"], M["caesareans"]),
                 "N%s m a year of obstetric work, and we do not know whose hospital bills it"
                 % f(M["obstetric"], 0)])
    rows.append(["4", "Embryos sit in your tank and nobody telephones the patient.",
                 "N%s m a month at the best margin in the building"
                 % f(M["fet_rev"] + M["storage_rev"], 1)])
    y = simple_table(c, rows, MX, y, [24, 330, PAGE_W - 2 * MX - 354], size=10.4,
                     leading=13.6, pad=7)
    callout(c, MX, y - 18, PAGE_W - 2 * MX,
            "None of that is a marketing problem and none of it needs a new patient. It is demand "
            "you already generate and already pay for, leaking out of a business that has worked "
            "for nine years on your name alone.",
            bg=CREAM, spine=GOLD, size=11.6, leading=16)


def slide_catchment(c):
    chrome(c, "The reframe")
    y = heading(c, "You are fishing in the most crowded water in West Africa") - 24
    para(c, "Lekki is an excellent destination and a poor catchment. Nordica, The Bridge Clinic "
            "and Medical ART Center have twenty years and national recognition, and every new "
            "boutique on this axis is fighting for the same six kilometres. The people who cannot "
            "get this done at home are not.",
         MX, y, SERIF_I, 11.6, IND2, PAGE_W - 2 * MX, 16)
    y -= 58
    rows = [["Where they would come from", "What stops them today", "Four cycles a month is"]]
    for name, stops, val in [
        ("Mainland Lagos", "Traffic, and fourteen monitoring visits", "228"),
        ("The rest of Nigeria", "Relocating to Lagos for three weeks", "262"),
        ("West Africa", "Language, payment, and no reason to believe us yet", "285"),
        ("The diaspora", "Trust, entirely", "365"),
    ]:
        rows.append([name, stops, "N%s m a year" % val])
    y = simple_table(c, rows, MX, y, [170, PAGE_W - 2 * MX - 340, 170], size=10.6,
                     leading=14, pad=8)
    callout(c, MX, y - 18, PAGE_W - 2 * MX,
            "A woman in Abuja or Accra or Houston is not choosing between you and Nordica. She is "
            "choosing between you and nothing.",
            bg=SURFACE, spine=IND2, size=12, leading=16)


def slide_moat(c):
    chrome(c, "Why you")
    y = heading(c, "The one thing none of them can copy") - 26
    items = [
        ("She cannot live in Lagos for three weeks.", "A stimulation cycle needs near daily "
         "scans. Monitoring done near her home turns a three week relocation into a few days here. "
         "The Mezo network already has scan sites on the mainland, Abuja is next, and almost "
         "nobody in Nigeria runs this properly."),
        ("She is frightened of being unwell far from home.", "Ovarian hyperstimulation declares "
         "itself several days after retrieval, which is exactly when she has flown home to a "
         "doctor who does not know what she was given. That single fear is why fertility travel "
         "in this region stays small."),
        ("You own a hospital.", "So you can tell her that if anything goes wrong she is admitted "
         "by your own team and it is already in the price. No fertility clinic in Lekki can say "
         "that sentence."),
        ("And they cannot buy their way to it.", "A clinic would have to buy a hospital and "
         "recruit obstetricians. A hospital would have to build an embryology laboratory and find "
         "an embryologist, which takes years. You are an obstetrician who already owns both."),
    ]
    bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.6, leading=15.4, gap=14)


def slide_ltv(c):
    chrome(c, "The number this turns on")
    y = heading(c, "A fertility patient is not one cycle, and the rest of her is yours") - 23
    rows = [["", "What she is worth to Clearview", "NGN m", "Who is paid on it"]]
    rows.append(["", "Her first fresh cycle", f(A.CYCLE, 2), "We take one fifth of this. Once."])
    for lbl, val in [
        ("A second cycle, %d%% of the time" % (A.REPEAT_CYCLE_RATE * 100),
         A.REPEAT_CYCLE_RATE * A.CYCLE),
        ("A frozen transfer, %d%% of the time" % (A.FET_RATE * 100), A.FET_RATE * A.FET_PRICE),
        ("Two years of embryo storage", A.STORAGE),
        ("Her delivery at Clearview Hospital, %d%% of the time" % (A.CAPTURE_RATE * 100),
         A.CAPTURE_RATE * A.DELIVERY),
    ]:
        rows.append(["", lbl, f(val, 2), "Yours. We are paid nothing on it."])
    rows.append(["", "What one patient is worth over %d months" % A.TERM, f(A.LTV, 2), ""])
    y = simple_table(c, rows, MX, y, [16, PAGE_W - 2 * MX - 316, 90, 210],
                     size=10.2, leading=13.4, pad=7)
    callout(c, MX, y - 18, PAGE_W - 2 * MX,
            "We are paid on the hardest part, which is getting her through the door the first "
            "time. Everything that follows, and it is more than half of what she is worth, is "
            "yours without a further naira to us. On her whole journey our fee is about "
            "%.0f per cent of your own contribution."
            % (100 * A.FEE_PER_PATIENT / (A.LTV * 0.46)),
            bg=CREAM, spine=GOLD, size=11.4, leading=15.6)


def slide_sensitivity(c):
    chrome(c, "If we are wrong")
    y = heading(c, "Judge this on the bad case, not the middle one") - 25
    rows = [["Year one", "Patients", "They pay you", "Our fee", "You keep"]]
    labels = {"pessimistic": "If it goes badly", "base": "If it goes as modelled",
              "optimistic": "If it goes well"}
    for n in ("pessimistic", "base", "optimistic"):
        r = A.year_one_case(n, MEDIA)
        rows.append([labels[n], "%.0f" % r["patients"], "N%s m" % f(r["value"], 0),
                     "N%s m" % f(r["cfa"], 0), "N%s m" % f(r["keep"], 0)])
    rows.append(["If nobody comes", "0", "N0", "N0", "(N%s m)" % f(OUTLAY, 1)])
    y = simple_table(c, rows, MX, y, [180, 110, 160, 140, PAGE_W - 2 * MX - 590],
                     size=10.8, leading=14, pad=8)
    y = callout(c, MX, y - 20, PAGE_W - 2 * MX,
                "Even in the bad case, a year of content, advertising and PR costing N%s m returns "
                "N%s m over two years. "
                "The worst outcome on the table is the last row, and it costs you N%s m."
                % (f(OUTLAY, 1), f(PESS["value"], 0), f(OUTLAY, 1)),
                bg=CREAM, spine=GOLD, size=11.6, leading=16)
    para(c, "Every figure here is an assumption until the first campaign replaces it with your own "
            "cost per patient. That is the honest position, and it is why we are willing to be "
            "paid on the outcome rather than asking you to buy the forecast.",
         MX, y - 16, SERIF_I, 9.6, MUTED, PAGE_W - 2 * MX, 12.5)


def slide_budget(c):
    chrome(c, "How much to spend")
    y = heading(c, "Your budget is capped by your laboratory, not your wallet") - 25
    rows = [["Ads a month", "Year one media and PR", "Qualified enquiries", "Patients",
             "Constraint"]]
    for b in A.BUDGETS:
        r = A.year_one(b)
        uncapped = r["enquiries"] * A.ENQ_TO_CYCLE
        rows.append(["N%s m" % f(b, 1), "N%s m" % f(r["spend"], 1), "%.0f" % r["enquiries"],
                     "%.0f" % r["patients"],
                     "Laboratory is full" if r["patients"] < uncapped - 1e-9 else "Media"])
    y = simple_table(c, rows, MX, y, [120, 180, 170, 110, PAGE_W - 2 * MX - 580],
                     size=10.8, leading=14, pad=8)
    y = callout(c, MX, y - 20, PAGE_W - 2 * MX,
                "At about N%s m a month of advertising you run out of laboratory before you run "
                "out of demand. Past that point more spend buys enquiries you cannot treat, and "
                "the right answer is a second embryologist rather than a bigger budget."
                % f(A.CPQE / A.ENQ_TO_CYCLE * A.HEADROOM, 1),
                bg=SURFACE, spine=IND2, size=11.4, leading=15.6)
    para(c, "Assumes a ceiling of %d fresh cycles a month against the %d you run today. "
            "Confirming the real ceiling is the first thing we would check."
            % (A.LAB_CEILING, A.M["cycles"]),
         MX, y - 16, SERIF_I, 9.6, MUTED, PAGE_W - 2 * MX, 12.5)


def slide_24(c):
    chrome(c, "Year one")
    y = heading(c, "Two shoot days. Four campaigns. Twelve months live.") - 23
    rows = [["What you spend", "NGN m"]]
    rows.append(["Content: %d shoot days at N%s m" % (Y1["blocks"], f(A.BLOCK_FEE, 2)),
                 f(Y1["content"], 2)])
    rows.append(["Paid advertising: N%s m a month across %d live months"
                 % (f(MEDIA, 1), Y1["live_months"]), f(Y1["ads"], 1)])
    rows.append(["PR: %d placements on Nigerian blogs"
                 % (Y1["campaigns"] * A.PR_PER_CAMPAIGN), f(Y1["pr"], 1)])
    rows.append(["Your whole outlay for the year", f(OUTLAY, 1)])
    y = simple_table(c, rows, MX, y, [PAGE_W - 2 * MX - 180, 180], size=10.6, leading=14, pad=8)

    rows = [["What comes back", ""]]
    rows.append(["Qualified enquiries it produces", "%s" % f(Y1["enquiries"], 0)])
    rows.append(["Patients who go on to treatment", "%s" % f(Y1["patients"], 0)])
    rows.append(["What they pay Clearview over %d months each, NGN m" % A.TERM, f(TOT_REV, 0)])
    rows.append(["Our fee: %.0f patients at N%s, NGN m" % (Y1["patients"], f(A.FEE_PER_PATIENT * 1e6, 0)),
                 f(TOT_FEE, 0)])
    rows.append(["Clearview keeps, NGN m", f(KEEPS, 0)])
    y = simple_table(c, rows, MX, y - 14, [PAGE_W - 2 * MX - 180, 180], size=10.6, leading=14, pad=8)

    callout(c, MX, y - 14, PAGE_W - 2 * MX,
            "You commit the N%s m at the top and nothing else. The fee below it falls due only "
            "once patients have paid you." % f(OUTLAY, 1),
            bg=CREAM, spine=GOLD, size=11.6, leading=16)


def slide_gate(c):
    chrome(c, "Before we price it")
    y = heading(c, "We will not quote you a number we cannot yet count") - 21
    para(c, "Any agency will put a price in front of you this week. We will not, and the reason is "
            "not caution. It is that we are the ones carrying the risk in this arrangement, so we "
            "are the ones who need the numbers. Ten of them, and you already have all ten.",
         MX, y, SERIF_I, 11.4, IND2, PAGE_W - 2 * MX, 16)
    y -= 48
    rows = [["", "What we need", "What it decides"]]
    for i, (a, b) in enumerate([
        ("Fresh cycles in a normal month, and in a bad one",
         "The baseline everything is measured against"),
        ("All in price of a cycle, and whether drugs are inside it",
         "What one patient is worth, which sets our fee"),
        ("Enquiries a month, and how many ever cycle",
         "Whether this is a demand problem or a conversion problem"),
        ("Live birth rate by age band, from your records",
         "What may honestly be claimed, and the repeat rate"),
        ("Share who return for a second cycle or a frozen transfer",
         "Most of the patient value sits here"),
        ("Patients with embryos stored, and whether storage is billed",
         "A revenue line you may already own"),
        ("Share of your IVF pregnancies that deliver with you",
         "The largest single number in the model"),
        ("Retrievals the laboratory could run in a week",
         "The ceiling on the whole plan, and on the media budget"),
        ("Where your patients travel from today",
         "Whether inbound is new or already happening quietly"),
        ("What you spend on marketing now, and what it produces",
         "The only real read we have on your cost per enquiry"),
    ], start=1):
        rows.append([str(i), a, b])
    simple_table(c, rows, MX, y, [26, 300, PAGE_W - 2 * MX - 326], size=9.8, leading=12.8, pad=6)


def slide_stages(c):
    chrome(c, "How we would proceed")
    y = heading(c, "Three stages, and nobody is committed until the third") - 25
    rows = [["", "What happens", "What you commit", "What we commit"]]
    rows.append(["One", "You send the ten numbers. The five surveys run, and they are already "
                 "live. Two to three weeks.", "Nothing. No fee and no contract.",
                 "Nothing charged. We read it and we tell you honestly what we think."])
    rows.append(["Two", "We price it properly off your numbers rather than our assumptions, and "
                 "put the final terms in front of you.", "Nothing. You may walk away here having "
                 "paid nothing and still keep the analysis.",
                 "A firm price, held open for thirty days."])
    rows.append(["Three", "First shoot day, then the campaign goes live.",
                 "The shoot day and the media. That is your whole exposure.",
                 "Everything else, at our own risk."])
    y = simple_table(c, rows, MX, y, [50, 250, 210, PAGE_W - 2 * MX - 510],
                     size=10, leading=13.2, pad=7)
    y = callout(c, MX, y - 20, PAGE_W - 2 * MX,
                "What we can price today is what we control: a shoot day is N%s m because that is "
                "what a shoot day costs, and we take no commission on media whatever your numbers "
                "say. What we will not fix today is the part that depends on how your business "
                "actually behaves."
                % f(A.BLOCK_FEE, 2),
                bg=CREAM, spine=GOLD, size=11.4, leading=15.6)
    para(c, "Every figure elsewhere in this document is indicative and built on assumed volumes. "
            "It is here to show you the shape of the arrangement, not to be signed.",
         MX, y - 16, SERIF_I, 9.6, MUTED, PAGE_W - 2 * MX, 12.5)


def slide_attribution(c):
    chrome(c, "The crux")
    y = heading(c, "One question a month, and you can audit every answer") - 21
    para(c, "Because the fee is a flat amount when she starts treatment, there is only ever one "
            "thing to agree: did this patient come from a campaign we ran. No share of your "
            "revenue, no look at your books, and no argument two years later about who her "
            "second cycle belonged to.",
         MX, y, SERIF_I, 11.4, IND2, PAGE_W - 2 * MX, 16)
    y -= 48
    rows = [
        ["", "The rule"],
        ["What counts", "A patient whose first contact with Clearview came through a campaign we "
         "ran, and who then starts and pays for treatment."],
        ["What never counts", "Anyone already in your records, anyone a colleague referred, and "
         "anyone who walks in. Your existing business is yours and we do not touch it."],
        ["How it is tagged", "Every enquiry logged at source, by the register we build in week "
         "one, plus the question asked at booking. A patient who books through Mezo carries her "
         "source on the payment itself. If the source is unclear, it does not count."],
        ["When we invoice", "When she has paid you, and not before."],
        ["Anything arguable", "Goes your way. We would rather lose a fee than have this "
         "conversation every month."],
    ]
    simple_table(c, rows, MX, y, [150, PAGE_W - 2 * MX - 150], size=10.6, leading=14, pad=8)


def slide_next(c):
    chrome(c, "Next")
    y = heading(c, "This week, and it costs you nothing") - 31
    rows = [
        ["", "What", "Who"],
        ["1", "Push the five surveys out. They are live at "
         "consultforafrica.com/ClearviewProject. The one for people who enquired and did not "
         "proceed is the most useful and needs the most time.", "Your team"],
        ["2", "Send the ten numbers on page " + str(SLIDES.index(slide_gate) + 1) + ". Estimates are fine. Where you do not "
         "track something, say so, because that is itself an answer and usually the most "
         "useful one.", "You"],
        ["3", "Approve how Clearview appears on Mezo: your name, your cycle prices as you set "
         "them, and the consultant who reviews the pages. The search work starts on that "
         "alone, because it takes months to rank and costs you nothing.", "You"],
        ["4", "We come back with the real model, priced off your business, and you decide.",
         "Us"],
    ]
    y = simple_table(c, rows, MX, y, [34, PAGE_W - 2 * MX - 174, 140], size=10.4,
                     leading=13.6, pad=7)
    callout(c, MX, y - 18, PAGE_W - 2 * MX,
            "There is nothing to sign and nothing to pay at this stage. If the numbers come back "
            "and the case is not there, I will tell you so, and that will have cost you a fortnight "
            "and no money at all.",
            bg=CREAM, spine=GOLD, size=11.8, leading=16.4)


def slide_back(c):
    c.setFillColor(INK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    try:
        img = ImageReader(str(DOCS / "c4a-logo-reversed.png")); iw, ih = img.getSize()
        c.drawImage(img, MX, PAGE_H - 96, width=150, height=150 * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        pass
    c.setFont(SERIF, 27); c.setFillColor(white)
    c.drawString(MX, PAGE_H - 200, "We will not charge you for spending your money.")
    c.setFont(SERIF_B, 27); c.setFillColor(GOLD)
    c.drawString(MX, PAGE_H - 238, "We will charge you for filling your theatre.")
    para(c, "You pay for the production and the media. We are paid when a patient our work "
            "brought in pays you. If they do not come, that line is zero.",
         MX, PAGE_H - 282, SERIF, 11.6, HexColor("#AEBBD4"), 470, 17)
    c.setFillColor(GOLD); c.rect(MX, 112, 52, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 11); c.setFillColor(white)
    c.drawString(MX, 90, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 9.4); c.setFillColor(HexColor("#AEBBD4"))
    c.drawString(MX, 74, "Consult for Africa Management Services Limited")
    c.drawString(MX, 58, "hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com")
    c.drawString(MX, 42, "Lagos and Abuja, Nigeria")


SLIDES = [slide_cover, slide_bleed, slide_catchment, slide_moat, slide_ltv,
          slide_engine, slide_content, slide_pr, slide_mezo, slide_24, slide_sensitivity,
          slide_deal, slide_production, slide_attribution, slide_gate, slide_stages,
          slide_next, slide_back]

if __name__ == "__main__":
    D.TOTAL[0] = str(len(SLIDES))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Clearview Fertility - growing the IVF business")
    c.setAuthor("Consult for Africa")
    for fn in SLIDES:
        fn(c); c.showPage()
    c.save()
    print("wrote %s  (%d slides)" % (OUT, len(SLIDES)))
