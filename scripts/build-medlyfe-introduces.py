"""
MEDLYFE INTRODUCES. The launch evening and the campaign around it.

An event plan, not a decision paper. Written to Dr Itunu Akinware and
Dr Chinwe Kpaduwa. Three weeks to build the evening, eight weeks in total, a
budget, and a format that repeats on each visit next year.

Model in lib_medlyfe_introduces.py. Nothing numeric is typed here.

Run:
  python3 scripts/build-medlyfe-introduces.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Frame, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer,
)

import lib_medlyfe_introduces as L
from lyfeplace_doc import (  # noqa: E402
    ALERT, CREAM, FULLW, GREEN, LIGHT, MARGIN, PH, P, SMALL, H1, H2,
    EYEBROW, TITLE, SUBTITLE, SIG, card, footer_bar, make_furniture, style, tbl,
)

OUT = ROOT / "docs" / "medlyfe-introduces-cfa.pdf"
SHARE = ROOT / "docs" / "Medlyfe Introduces - The Evening and the Campaign (Draft).pdf"

BUL = style("bul", spaceAfter=3.4, leftIndent=11, bulletIndent=2)
LEAD = style("lead", fontSize=9.8, leading=13.8, textColor=colors.HexColor("#243B33"),
             spaceAfter=7)
BIG = style("big", fontName="Helvetica-Bold", fontSize=15, leading=19,
            textColor=colors.HexColor("#0F3D2E"), spaceAfter=4)

ORDER = ["idea", "theme", "billing", "evening", "stage", "room", "look", "campaign",
         "build", "after", "cost", "nextyear"]
NUM = {label: i for i, label in enumerate(ORDER, start=1)}
_WRITTEN: list[str] = []


def sec(el, label, eyebrow, title):
    assert label in NUM, "unknown section %r" % label
    assert label not in _WRITTEN, "section %r written twice" % label
    _WRITTEN.append(label)
    el.append(CondPageBreak(104))
    el.append(KeepTogether([Paragraph("%02d  /  %s" % (NUM[label], eyebrow), EYEBROW),
                            Paragraph(title, H1)]))


def ref(label):
    assert label in NUM, "reference to unknown section %r" % label
    return "section %02d" % NUM[label]


def ngn(x, dp=1):
    return ("NGN {:,.%df}m" % dp).format(x / L.M)


def k(x):
    return "{:,.0f}".format(x / L.K)


def bullets(el, items):
    for i in items:
        el.append(Paragraph(i, BUL, bulletText="•"))


def build():
    doc = BaseDocTemplate(
        str(OUT), pagesize=(FULLW + 2 * MARGIN, PH),
        leftMargin=MARGIN, rightMargin=MARGIN, topMargin=20 * mm, bottomMargin=17 * mm,
        title="Medlyfe Introduces: the evening and the campaign",
        author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p",
        frames=[Frame(MARGIN, 17 * mm, FULLW, PH - 20 * mm - 17 * mm, id="f")],
        onPage=make_furniture(
            "MEDLYFE INTRODUCES", L.EDITION,
            note="Private and confidential  /  Prepared for Dr Itunu Akinware and "
                 "Dr Chinwe Kpaduwa"))])
    el = []

    # ------------------------------------------------------------------ letter
    el.append(Paragraph(L.PLATFORM, TITLE))
    el.append(Paragraph(L.EDITION + ".  " + L.EVENT_DATE, SUBTITLE))
    el.append(card(
        "<b>Itunu, Chinwe,</b><br/><br/>"

        "Here is the evening and the campaign around it.<br/><br/>"

        "The date is now " + L.EVENT_DATE + ", which gives us two and a half weeks. "
        "That is tight but workable, and it holds only if the venue is contracted and "
        "the invitations are at the printer by Friday. Otherwise it becomes " +
        L.FALLBACK_DATE + " and the conversion window loses a quarter of its "
        "length.<br/><br/>"

        "The bigger change is that the evening now leads with Medlyfe rather than with "
        "Chinwe, under your own lead clinician's line, " + L.THEME + ". I would not have "
        "written a better one and it is worth saying that it came from inside the "
        "clinic. The woman we want has one problem and is currently taking it to three "
        "places, and Medlyfe is the only clinic on that stretch of Lekki with both "
        "halves already under one roof.<br/><br/>"

        "It also changes the economics, which was not the reason for doing it but is the "
        "best argument for it. " + L.RECOVERY_LINE + " A surgeon led evening would have "
        "stored almost all of that in a surgical list that cannot open this year. The "
        "workings are in " + ref("after") + ".<br/><br/>"

        "Chinwe stays on the agenda and stays the reason a curated list accepts an "
        "invitation in October. She opens the conversation, she is on the panel, and "
        "she is in the room afterwards. What has moved is the billing rather than the "
        "prominence. Medlyfe is the name on the invitation and the name that takes the "
        "booking, because Medlyfe is licensed and trading and can see somebody on the "
        "Monday. That Medlyfe is introducing " + L.HOUSE_BRAND + ", promoted by Chinwe, "
        "sits in the fine print on the invitation footer, the programme card and the "
        "press note, which plants the venture without launching a clinic that is not "
        "built.<br/><br/>"

        "There is a practical benefit in that order, worth saying plainly. Promoter is "
        "a business role. Chinwe is building a company, which is true and sayable and "
        "waits on nothing, whereas anything that reads as her taking patients does wait "
        "on something. The fine print is not shyness, it is the framing that is both "
        "accurate and useful.<br/><br/>"

        "The budget is " + ngn(L.PROGRAMME_TOTAL, 1) + " all in. " +
        ngn(L.COST_TOTAL, 1) + " of that is suppliers at cost with nothing on top, and "
        + ngn(L.FEE, 1) + " is what running it costs us, which is all we are charging. "
        "Nineteen days of our own time are in it and are not billed.<br/><br/>"

        "Three decisions on the last page, and the first has to happen this "
        "week.<br/><br/>"

        "Warm regards,<br/><b>Dr Debo Odulana</b><br/>Founding Partner, Consult for "
        "Africa", bg=LIGHT))

    # ================================================================== 01
    sec(el, "idea", "THE IDEA", "A series, not a launch.")
    el.append(Paragraph(
        "<b>" + L.PLATFORM + "</b> is a recurring Medlyfe evening. Each edition "
        "introduces something worth introducing: a proposition, a service, a clinician. "
        "This one introduces the way Medlyfe now treats the inside and the outside as "
        "one appointment, and it is the expensive one, because it pays for the format, "
        "the identity, the set, the film library, the guest list and the press "
        "relationships that every edition after it reuses.", LEAD))
    el.append(Paragraph(
        "The alternative is a launch party, and the problem with a launch is that it is "
        "over. It produces one night of photographs, and the next time there is news the "
        "whole thing is built again from nothing. Chinwe is back three times next year. A "
        "series gives each of those visits a reason for a room to assemble, and gives the "
        "practice something that compounds rather than something that is spent.", P))
    el.append(card(
        "<b>Medlyfe is the right host for this one,</b> because it is trading and "
        "licensed and can take a booking on the night, which nothing newly incorporated "
        "can. The series then carries the house brand, " + L.HOUSE_BRAND + " on the "
        "working name, from the second edition onward. It moves when that brand is "
        "ready, and the format is built to travel from the start rather than adapted "
        "later.", bg=GREEN))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "That handover is the reason the design brief is what it is. If the identity is "
        "built as Medlyfe livery it has to be thrown away in February, and if it is built "
        "as a second logo it competes with the host. So it is built as a format: a "
        "typographic system, a portrait treatment, an invitation and a print size, "
        "carrying Medlyfe's marks this time and " + L.HOUSE_BRAND + "'s next time, with "
        "everything else unchanged.", P))
    el.append(Spacer(1, 3))
    el.append(Paragraph("What edition one builds that the next three inherit", H2))
    el.append(tbl([[a, b] for a, b in L.REUSED], ["", "How it carries over"],
                  [166, FULLW - 166], tiny=True))

    # ================================================================== 02
    sec(el, "theme", "THE THEMES", "One for the evening, one for Dr Kpaduwa's half.")
    el.append(Paragraph(L.THEME_LINE, BIG))
    el.append(Paragraph(
        "<b>" + L.THEME_CREDIT + "</b> We have kept it as the banner for the evening and "
        "the title of the panel, and given Dr Kpaduwa's segment its own title inside it, "
        "because her argument is sharper than the evening's and deserves its own name.",
        P))
    el.append(tbl([[a, b, c] for a, b, c in L.THEMES],
                  ["Where", "Title", "What it carries"],
                  [140, 132, FULLW - 272], tiny=True))
    el.append(Spacer(1, 5))
    el.append(Paragraph(
        "A woman who sleeps badly, has put on weight she cannot shift and does not like "
        "what her skin is doing has one problem. She is currently taking it to a gym, a "
        "dermatologist and a wellness clinic that do not speak to one another, and she "
        "is paying three times for a worse answer. Medlyfe already has both halves under "
        "one roof and has never said so out loud.", P))
    el.append(Paragraph(
        "So the theme is not a strapline written for a party. It is the proposition, and "
        "the evening is the first time it gets argued in public by the clinicians who do "
        "the work.", P))
    el.append(tbl(
        [[a, b] for a, b in [
            ("Within", "Metabolic and weight management, hormones, longevity "
                       "programmes, IV therapy and the diagnostics underneath them. "
                       "Programme priced, and sellable from the Monday after"),
            ("Outward", "Skin, injectables and the regenerative treatments, delivered "
                        "by Medlyfe's own registered clinicians to Dr Kpaduwa's "
                        "protocols"),
            ("What is coming", L.HOUSE_BRAND + ", described as being built, with no "
             "dates offered")]],
        ["The two halves", "What sits in each"], [118, FULLW - 118], tiny=True))
    el.append(Spacer(1, 5))
    el.append(card(
        "<b>The commercial consequence matters more than the creative one.</b> An "
        "evening built only on the surgical side would store almost all of its value in "
        "a list that cannot open this year. Putting the wellness half on the same stage "
        "means the programme earns inside the window, because those programmes are "
        "priced, available and wait on nothing.", bg=CREAM))

    # ================================================================== 03
    sec(el, "billing", "HOW IT IS BILLED",
        "Medlyfe takes the booking. Dr Kpaduwa fills the room.")
    el.append(Paragraph(
        "Three layers, and keeping them in this order is what makes the evening work "
        "commercially and stay proper.", LEAD))
    el.append(tbl([[a, b, c] for a, b, c in L.BILLING],
                  ["", "What it says", "Why"], [92, 186, FULLW - 278], tiny=True))
    el.append(Spacer(1, 5))
    el.append(card(
        "<b>Promoter is a business role, not a clinical one.</b> That distinction is "
        "what lets the fine print run at all, and it is why the line names a venture "
        "rather than a practitioner. The full set of what goes out and what never does "
        "is in " + ref("campaign") + ".", bg=GREEN))

    # ================================================================== 04
    sec(el, "evening", "THE EVENING",
        "Medlyfe first, then the panel, then Chinwe, then the menu.")
    el.append(Paragraph(
        "One room, three hours, " + str(L.ROOM_TOTAL) + " people. It is a social evening "
        "with substance in the middle of it, not a conference and not a party. The "
        "consultation desk is open from the moment the doors do, because the single "
        "biggest failure in an evening like this is a room full of interested women who "
        "leave without an appointment.", LEAD))
    el.append(tbl(
        [[t, w, d] for t, w, d in L.RUN_OF_SHOW],
        ["", "", "Run of show, " + L.EVENT_DATE],
        [46, 116, FULLW - 162], tiny=True, hi=[3, 4, 5]))
    el.append(Spacer(1, 4))
    el.append(card("<b>Why that order.</b> " + L.ORDER_NOTE, bg=GREEN))
    el.append(Spacer(1, 5))
    el.append(card(
        "<b>The part that earns the money is between 20:25 and 20:55.</b> The service "
        "walk through tells the room what is actually available and what it costs, the "
        "questions that follow turn private curiosity into a public conversation, and "
        "the half hour afterwards is when a woman who has just heard an honest answer "
        "walks to the desk. Everything before it exists to make that half hour "
        "possible.", bg=GREEN))

    # ================================================================== 04
    sec(el, "stage", "THE CHAT AND THE PANEL", "Four people, and what each is there to do.")
    el.append(Paragraph("The panel, thirty five minutes, first", H2))
    el.append(tbl(
        [[n, w, d] for n, w, d in L.PANEL],
        ["Who", "What they are", "Why they are on the panel"],
        [128, 116, FULLW - 244], tiny=True))
    el.append(Spacer(1, 4))
    el.append(Spacer(1, 4))
    el.append(Paragraph("In conversation with Dr Kpaduwa, twenty five minutes", H2))
    el.append(Paragraph(
        "Hosted, warm, and personal rather than clinical. It is the room meeting her. "
        "The questions are agreed in advance with Dr Kpaduwa and nothing goes in that "
        "she has not approved.", P))
    bullets(el, L.FIRESIDE)
    el.append(Paragraph("The services, walked through, fifteen minutes", H2))
    el.append(Paragraph(
        "This is the part most evenings leave out, and leaving it out is why most "
        "evenings do not convert. Delivered by the Medlyfe clinician with Dr Kpaduwa "
        "adding the surgical perspective, so the room sees the team it will actually be "
        "treated by.", P))
    el.append(tbl([[a, b] for a, b in L.SERVICE_TALK], ["", "What is said"],
                  [110, FULLW - 110], tiny=True))

    # ================================================================== 05
    sec(el, "room", "WHO IS IN THE ROOM", "Curated, invited by hand, chased by telephone.")
    el.append(Paragraph(
        "A guest list is the single highest leverage thing in an evening like this and "
        "it is where these events are usually lost. Invitations go out printed and by "
        "hand where it matters, and then every name is telephoned. An emailed "
        "invitation to a woman of this profile is not an invitation.", P))
    el.append(tbl(
        [[n, str(c), d] for n, c, d in L.ROOM] +
        [["Total in the room", str(L.ROOM_TOTAL), ""]],
        ["Who", "Number", "Why them"],
        [148, 50, FULLW - 198], aligns=["r", "l"], total_row=True, tiny=True))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>The doctors are in the same room rather than at their own evening, and that "
        "is a deliberate saving.</b> Twenty five referring clinicians see a full room of "
        "the patients they look after, hear the surgeon think, and meet her over a "
        "drink. It starts the referral network without paying for a second night, and a "
        "dedicated clinical session can run properly at edition two, when there are "
        "cases to present.", bg=LIGHT))

    # ================================================================== 06
    sec(el, "look", "THE LOOK", "The room has to demonstrate the argument.")
    el.append(tbl([[a, b] for a, b in L.ART_DIRECTION], ["", "How it is done"],
                  [150, FULLW - 150], tiny=True))

    # ================================================================== 07
    sec(el, "campaign", "THE CAMPAIGN", "Eight weeks, hung on one week of material.")
    el.append(Paragraph(
        "The shoot in week two is the centre of the campaign, not the evening itself. "
        "One controlled day produces the portraits, the interview masters, the ninety "
        "second film and the footage the education series is cut from. That material is "
        "what carries Medlyfe from November through to Chinwe's next visit, and it can "
        "only be made while she is in the country.", LEAD))
    el.append(tbl(
        [[w, t, d] for w, t, d in L.CAMPAIGN],
        ["", "When", "What runs"],
        [70, 76, FULLW - 146], tiny=True))
    el.append(Spacer(1, 5))
    el.append(Paragraph("The media plan, as agreed on 28 September", H2))
    el.append(Paragraph(
        "Bought placement, separate from the earned coverage the liaison works for. "
        "BellaNaija opens the longevity conversation before the night, Guardian Life is "
        "the anchor partner and covers the evening live, and the news placements that "
        "follow give it credibility rather than reach.", P))
    el.append(tbl(
        [[w, o, wh, a, "{:,}".format(c)] for w, o, wh, a, c in L.MEDIA_PLAN] +
        [["", "<b>Total</b>", "", "<b>As invoiced</b>", "<b>{:,}</b>".format(L.MEDIA_NET)],
         ["", "", "", "If any outlet charges VAT at 7.5 per cent",
          "{:,}".format(L.MEDIA_GROSS)]],
        ["When", "Outlet", "What", "Angle", "NGN"],
        [58, 68, 118, 118, FULLW - 362], tiny=True))
    el.append(card(
        "<b>Guardian Life is {:.0f} per cent of the media budget and it buys one day.</b> "
        "That is the right call for an evening that only happens once, because live "
        "coverage cannot be bought back afterwards. It also means the night has to be "
        "worth covering: if the room is thin or the panel is flat, that is the line that "
        "is wasted and the only one that cannot be re-run. Everything after the tenth is "
        "recoverable. That one is not.".format(L.MEDIA_ANCHOR_SHARE * 100), bg=ALERT))
    el.append(Spacer(1, 5))
    el.append(Paragraph("How Dr Kpaduwa is described, in every piece of this", H2))
    el.append(Paragraph(
        "This governs the announcement, the invitation, the captions, the interviews, the "
        "film and anything anybody says from the stage. It is checked before a word goes "
        "out, not after.", P))
    el.append(tbl(
        [["We say" if ok else "Never", a, b] for a, ok, b in L.POSITIONING],
        ["", "", "Why"], [50, 152, FULLW - 202], tiny=True,
        hi=[i for i, x in enumerate(L.POSITIONING) if not x[1]]))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>This is a stronger position than the obvious one, not a smaller one.</b> An "
        "evening built around a visiting surgeon sells her diary, which runs out the "
        "moment she boards a plane and leaves the clinic explaining her absence for three "
        "months. An evening built around a service she designed and a team she trained "
        "sells something that is open every week of the year, and it is the only version "
        "that still works in February.", bg=GREEN))
    el.append(Spacer(1, 4))
    el.append(Paragraph("Four lines we hold, and they cost us nothing we wanted", H2))
    el.append(tbl([[a, b] for a, b in L.CAMPAIGN_RULES], ["", "Why"],
                  [150, FULLW - 150], tiny=True))

    # ================================================================== 08
    sec(el, "build", "THE BUILD", "Ten days, and every one of them is spoken for.")
    el.append(tbl(
        [["Week %d" % w, d, h, t] for w, d, h, t in L.BUILD],
        ["", "Dates", "", "What happens"],
        [42, 68, 110, FULLW - 220], tiny=True))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>Three weeks is tight but it is the right length, because the two things that "
        "actually fill a room are a printed invitation and a telephone call, and both "
        "work better at short notice than at long.</b> What three weeks does not "
        "tolerate is a decision waiting a fortnight. The venue has to be contracted this "
        "week and the invitations have to be at the printer by the end of week one.",
        bg=ALERT))

    # ================================================================== 09
    sec(el, "after", "THE SEVEN WEEKS", "What the evening is supposed to produce.")
    el.append(tbl(
        [["Week %d" % w, d, h, t] for w, d, h, t in L.AFTER],
        ["", "Dates", "", "What happens"],
        [42, 68, 96, FULLW - 206], tiny=True))
    el.append(Spacer(1, 5))
    el.append(Paragraph("What we are held to by 13 November", H2))
    el.append(tbl(
        [[t, "{:,}".format(v), d] for t, v, d in L.TARGETS],
        ["", "Target", "What it has to mean to count"],
        [150, 44, FULLW - 194], aligns=["r", "l"], tiny=True))
    el.append(Spacer(1, 4))
    el.append(Paragraph("How those numbers are arrived at", H2))
    el.append(tbl(
        [[n, "{:,}".format(reach), "{:.0f}%".format(rate * 100),
          "{:,}".format(L.qualified(s)), note]
         for s in L.SOURCES for n, reach, rate, mult, note in [s]] +
        [["Qualified names", "", "", "{:,}".format(L.QUALIFIED), ""]],
        ["Source", "Reached", "Rate", "Names", "Basis"],
        [98, 46, 34, 44, FULLW - 222], aligns=["r", "r", "r", "l"],
        total_row=True, tiny=True))
    el.append(Spacer(1, 3))
    el.append(tbl(
        [["Consultations",
          "{:,}".format(L.CONSULTS),
          "{:.0f} per cent of the list would be {:,}, and the clinic can hold {:,} in "
          "the five weeks after the evening. Capacity is the constraint, not "
          "demand".format(L.CONSULT_RATE * 100, round(L.QUALIFIED * L.CONSULT_RATE),
                          L.CONSULT_CAPACITY)],
         ["Treated in the window", "{:,}".format(L.TREATED),
          "{:.0f} per cent take a treatment at about NGN {}k, and a quarter come back "
          "once".format(L.TREAT_RATE * 100, k(L.TREAT_VALUE))],
         ["Revenue before 13 November", ngn(L.IN_WINDOW_REVENUE),
          "Earned by Medlyfe, from work delivered by its own registered clinicians"],
         ["Interest in the surgical service", "{:,}".format(L.WAITING_LIST),
          "{:.0f} per cent of consultations register interest, consented, with no money "
          "taken and no date given".format(L.SURGICAL_RATE * 100)],
         ["What that is worth when it opens", ngn(L.PIPELINE, 0),
          "At the modelled average case of " + ngn(L.CASE_VALUE, 1)]],
        ["", "", "How it follows"], [140, 62, FULLW - 202],
        aligns=["r", "l"], hi=[2, 4], tiny=True))
    el.append(Spacer(1, 5))
    el.append(card(
        "<b>It does not pay for itself by November, and I would rather say so here than "
        "have you find it later.</b> The evening and the campaign earn about " +
        ngn(L.IN_WINDOW_REVENUE) + " of treatment revenue inside the window against " +
        ngn(L.PROGRAMME_TOTAL, 1) + " of spend. What they actually produce is " +
        "{:,}".format(L.QUALIFIED) + " qualified names, a list of people waiting for the "
        "surgical service worth around " + ngn(L.PIPELINE, 0) + " when it opens, a "
        "referral network, and a library of material with Chinwe in it. The whole "
        "programme is recovered on the first " + str(L.PAYBACK_CASES) + " operations.",
        bg=CREAM))

    # ================================================================== 10
    sec(el, "cost", "WHAT IT COSTS", "Line by line, and what can come off.")
    el.append(tbl(
        [[g, ngn(L.cost_group(g), 2)] for g in L.COST_GROUPS] +
        [["Programme costs, at cost", ngn(L.COST_TOTAL, 2)],
         ["CFA operational cost, a contribution rather than a fee", ngn(L.FEE, 2)],
         ["Total", ngn(L.PROGRAMME_TOTAL, 2)]],
        ["", "Amount"], [FULLW - 96, 96], aligns=["r"], total_row=True, hi=[3]))
    el.append(Spacer(1, 5))
    el.append(Paragraph("The evening and the campaign, at cost", H2))
    el.append(Paragraph(
        "Every line below is committed against a written quote, approved before it is "
        "committed, and invoiced at the amount on the supplier's invoice. We take no "
        "commission, margin or rebate on any of it, and unspent contingency is returned "
        "rather than absorbed.", SMALL))
    el.append(tbl(
        [[grp, item, detail, k(amt)] for grp, item, detail, amt, _ in L.COSTS] +
        [["", "Total", "", k(L.COST_TOTAL)]],
        ["", "Item", "What it covers", "NGN 000"],
        [74, 128, FULLW - 262, 60], aligns=["l", "l", "r"], total_row=True, tiny=True))
    el.append(Spacer(1, 5))
    el.append(Paragraph("What CFA charges, and why it is not a fee", H2))
    el.append(card("<b>Cost, and nothing else.</b> " + L.COST_BASIS, bg=GREEN))
    el.append(Spacer(1, 4))
    el.append(tbl(
        [[item, detail, k(amt)] for item, detail, amt in L.CFA_COSTS] +
        [["Total", "Recovered, not charged", k(L.FEE)]],
        ["What it costs us to run", "", "NGN 000"],
        [148, FULLW - 214, 66], aligns=["l", "r"], total_row=True, tiny=True))
    el.append(Spacer(1, 4))
    el.append(Paragraph("What those nineteen days cover", H2))
    el.append(tbl(
        [[name, what] for _, name, what in L.WORKSTREAMS],
        ["Workstream", "What it is"], [128, FULLW - 128], tiny=True))
    el.append(Spacer(1, 3))
    el.append(card("<b>What nineteen days stretches to, said plainly.</b> " +
                   L.SCOPE_NOTE, bg=ALERT))
    el.append(Spacer(1, 3))
    el.append(Paragraph(
        "It is a capped recovery rather than an open account. If it costs us less we "
        "invoice less. If the programme overruns, which an event with a three week "
        "build will, that is ours to carry.", SMALL))
    el.append(Spacer(1, 4))
    el.append(Paragraph("Payment", H2))
    el.append(tbl(
        [[when, "{:.0f}%".format(pct * 100), ngn(round(L.FEE * pct), 2), why]
         for when, pct, why in L.TRANCHES],
        ["Recovered", "", "Amount", "Against what"],
        [126, 36, 70, FULLW - 232], aligns=["r", "r", "l"], tiny=True))
    el.append(Spacer(1, 4))
    el.append(Paragraph("If the number needs to move", H2))
    el.append(tbl(
        [[label, ngn(cost, 2)] for _, label, cost in L.MODULES],
        ["Comes off", "Saves"], [FULLW - 90, 90], aligns=["r"], tiny=True))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>Take the education series off first and the press retainer second.</b> I "
        "would argue hard against the shoot, because it is the only line that cannot be "
        "bought back later: the portraits, the film and the interview masters need "
        "Chinwe in front of a camera, and after November that is not available at any "
        "price until she returns.", bg=ALERT))

    # ================================================================== 11
    sec(el, "nextyear", "NEXT YEAR",
        "Three visits, three editions, as " + L.HOUSE_BRAND + " Introduces.")
    el.append(tbl([[a, b, c] for a, b, c in L.NEXT_YEAR],
                  ["", "When", "What it introduces"],
                  [88, 96, FULLW - 184], tiny=True))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "Each of those costs a fraction of this one, because the format, the identity "
        "system, the set, the lists and the press relationships are already built and "
        "were built to move. That is the argument for spending properly on the first "
        "one.", P))
    el.append(card(
        "<b>The handover is worth stating plainly now rather than negotiating later.</b> "
        "Edition one is hosted by Medlyfe and paid for by Medbury, and the format, the "
        "lists and the material it produces carry across to " + L.HOUSE_BRAND + " when "
        "the series moves. Nothing about hosting the first edition attaches the series "
        "permanently to Medlyfe, and nothing about the move takes the value of it away "
        "from the party that funded it.", bg=CREAM))

    # ---------------------------------------------------------------- closing
    el.append(PageBreak())
    el.append(Paragraph("TO START", TITLE))
    el.append(Paragraph("Three things this week, and then we build", SUBTITLE))
    el.append(tbl(
        [["1", "Approve the budget", "Dr Itunu Akinware",
          "The venue and the printer both need committing in week one. " +
          ngn(round(L.FEE * L.TRANCHES[0][1]), 2) + " on approval"],
         ["2", "Confirm the date and the {:.0f} days".format(L.HER_TOTAL),
          "Dr Chinwe Kpaduwa",
          L.EVENT_DATE + ", the shoot in week two, and the training weeks"],
         ["3", "Name the four Medlyfe people", "Dr Itunu Akinware",
          "Coordinator, marketing lead, operations and clinic lead, paired with our team "
          "from week one"]],
        ["", "What", "Whose", "Detail"],
        [18, 150, 92, FULLW - 260], tiny=True))
    el.append(Spacer(1, 5))
    el.append(Paragraph("What we are asking of Dr Kpaduwa, to the half day", H2))
    el.append(tbl(
        [[n, "%.1f" % d, w] for n, d, w in L.HER_DAYS] +
        [["Total", "%.1f" % L.HER_TOTAL, "Across eight weeks"]],
        ["", "Days", "When"], [152, 40, FULLW - 192],
        aligns=["r", "l"], total_row=True, tiny=True))
    el.append(Spacer(1, 5))
    el.append(Paragraph("What Medlyfe provides", H2))
    bullets(el, L.MEDBURY_PROVIDES)
    el.append(Spacer(1, 4))
    el.append(Paragraph("And the four people, paired from week one", H2))
    el.append(tbl([[a, b, c, d] for a, b, c, d in L.TEAM],
                  ["The work", "CFA", "Medlyfe", "Takes it"],
                  [146, 104, 112, FULLW - 362], tiny=True))
    el.append(Spacer(1, 5))
    el.append(Paragraph("What we have assumed", H2))
    bullets(el, L.ASSUMPTIONS)
    el.append(Spacer(1, 8))
    el.append(Paragraph("Consult for Africa", SIG))
    el.append(footer_bar())

    assert set(_WRITTEN) == set(ORDER), "sections missing: %s" % (set(ORDER) - set(_WRITTEN))
    doc.build(el)
    print("wrote", OUT)
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
