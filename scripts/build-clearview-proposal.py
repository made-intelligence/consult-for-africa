"""
Clearview: the mandate to build the IVF business.

The proposal that follows the strategy note and accompanies the five surveys.
Fee is a resourced-day build from scripts/clearview_fee.py, volumes from
scripts/clearview_model.py. Nothing is retyped, so the tables cannot disagree.

    python3 scripts/build-clearview-proposal.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, Image, PageBreak, PageTemplate,
                                Paragraph, Spacer)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import clearview_fee as F
import clearview_model as M
from lyfeplace_doc import (CREAM, FULLW, GREEN, H2, LETTER_TO, MARGIN, PH, P, SIG, SMALL,
                           SUBTITLE, TITLE, card, footer_bar, m, make_furniture, sec, tbl)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "clearview" / "clearview-ivf-mandate-cfa.pdf"
LOGO_DARK = ROOT / "docs" / "c4a-logo.png"
LOGO_RATIO = 968 / 230

D = M.MID
nm = lambda x: m(x / 1e6, 1)          # naira to NGN millions, one decimal
LINK = "consultforafrica.com/ClearviewProject"

el = []
p = lambda t, st=P: el.append(Paragraph(t, st))
sp = lambda h=4: el.append(Spacer(0, h))
h2 = lambda t: el.append(Paragraph(t, H2))

# ================================================================== letter ====
_logo = Image(str(LOGO_DARK), width=30 * mm, height=30 / LOGO_RATIO * mm)
_logo.hAlign = "LEFT"
el.append(_logo)
sp(12)
p("Building the IVF business", TITLE)
p("A nine month mandate to grow Clearview Fertility: what we would build, what you would own "
  "at the end of it, how it is measured, and what it costs.", SUBTITLE)
p("Dr Kunle Ajayi", LETTER_TO)
for t in [
    "Dr Kunle, thank you for the conversation and for the time you have given this. What follows "
    "is the proposal I said I would write, and it is deliberately narrower than the strategy note. "
    "That note covered the whole group. This covers one thing, which is building the fertility "
    "business, because that is where the money is and because it is the part you asked me about.",

    "I want to be straightforward about the argument, because it is the same one I made when we "
    "spoke and it has not softened. Growing an IVF business is not mainly a question of finding "
    "more patients. It is a question of four engines, and only one of them involves a stranger who "
    "has never heard of you. The other three are conversion, which is turning the people who "
    "already contact you into people who cycle, retention, which is the frozen transfers and the "
    "second child, and capture, which is making sure the pregnancy you created is looked after and "
    "delivered inside your own group rather than somebody else's. Those three run on demand you "
    "already generate and already pay for, so they are cheaper, faster and considerably more "
    "certain than advertising. We build those first. Then we open the catchment, which is the "
    "fourth engine and the one with the most room in it.",

    "The programme is nine months in three phases, and I have structured it so that you are never "
    "committed further than you have seen. The first phase is four weeks and it ends with a "
    "decision. If what we find does not support the rest, you stop there and you will have paid "
    "for four weeks, and you will still own a counted funnel and your own live birth rate by age "
    "band, which is worth having whatever you decide to do next.",

    "The five surveys are already live at %s, and I would like them running while we agree the "
    "rest, because the one for people who enquired and did not go ahead takes weeks to gather and "
    "it is the most useful thing on that page. Nothing on it commits you to anything." % LINK,

    "On the fee I have shown you the method rather than a headline. Section 06 sets out the grades, "
    "the published day rates and the number of days each piece of work actually takes, so you can "
    "see exactly what you are buying. You are paying for effort rather than a share of anything, "
    "which also means that if a workstream turns out not to be needed it comes straight off. I have "
    "tied the fee to measures you can hold me to, and if we miss them you withhold the tranche.",

    "The natural first step is to start Phase 1 while the surveys gather. I am ready when you are.",
]:
    p(t)
p("Warm regards,<br/><br/>Dr Debo Odulana<br/>"
  "<font size=8 color='#6b7280'>Founding Partner, Consult for Africa</font>", SIG)

# ================================================================ objective ===
el.append(PageBreak())
sec(el, "01", "THE OBJECTIVE", "What this mandate is for.")
el.append(tbl(
    [["1", "Grow Clearview Fertility without first spending money on acquisition, by closing the "
      "three leaks that sit inside demand you already generate."],
     ["2", "Make the fertility business legible: a counted funnel, a live birth rate by age band, "
      "a known laboratory ceiling, and a monthly pack that tells you what is happening."],
     ["3", "Capture the whole journey inside the group, so the pregnancy Clearview Fertility "
      "creates is booked, delivered and followed up at Clearview Hospital."],
     ["4", "Open the catchment beyond Lekki, so the laboratory is fed by mainland Lagos, the rest "
      "of Nigeria, West Africa and the diaspora rather than by six kilometres of the most "
      "contested market in the country."],
     ["5", "Build all of it so that it keeps working in a week when you are not in the building, "
      "which is what you actually asked me for."]],
    ["", "Objective"], [10 * mm, FULLW - 10 * mm]))
sp(5)
el.append(card(
    "What this mandate is not. It is not a marketing retainer and it does not include media spend. "
    "We do not advertise a business that loses nine enquiries in ten, because that makes the loss "
    "bigger rather than the business. Acquisition comes after the machine that catches it works, "
    "and by then it is a much smaller bill.", CREAM))

# ================================================================= engines ====
el.append(PageBreak())
sec(el, "02", "THE FOUR ENGINES", "Where IVF growth actually comes from, in order of cost.")
p("The figures below are calibrated on the assumptions in the strategy note, at %d cycles a month "
  "and an all in price around NGN %s million. They will move once Phase 1 counts them, which is "
  "the point of Phase 1." % (D["cycles"], m(D["fresh_rev"] / D["cycles"], 1)))
el.append(tbl(
    [["1", "Conversion",
      "Roughly %d people a month already contact you and around nine in ten never cycle. Five "
      "points of conversion is about %.0f more cycles a month on enquiries you already pay for."
      % (D["enquiries"], D["extra_cycles"]),
      "NGN %s m a month" % m(D["extra_cycles"] * D["fresh_rev"] / D["cycles"], 1), "Lowest"],
     ["2", "Retention",
      "A working recall turns the tank into about %.0f frozen transfers a month at the best margin "
      "in the building, plus annual storage you are currently not billing."
      % D["fet"],
      "NGN %s m a month" % m(D["fet_rev"] + D["storage_rev"], 1), "Low"],
     ["3", "Capture",
      "About %.0f ongoing pregnancies and %.0f caesarean sections a year, which you create. The "
      "only question is whose hospital bills them." % (D["pregnancies"], D["caesareans"]),
      "NGN %s m a year" % m(D["obstetric"], 0), "Low"],
     ["4", "Inbound",
      "Four additional cycles a month from outside Lagos, on a laboratory already built and already "
      "paid for. Slowest to build and the only one with real headroom.",
      "NGN 262 to 365 m a year", "Highest"]],
    ["", "Engine", "What it is", "What it is worth", "Cost to build"],
    [7 * mm, 26 * mm, FULLW - 106 * mm, 42 * mm, 31 * mm], aligns=["r", "r"], tiny=True))
sp(6)
el.append(card(
    "The order matters more than any single item on that list. Engines one, two and three run on "
    "demand that already exists, so they pay for engine four. Almost every fertility clinic in this "
    "market does it the other way round, spends a year of profit on acquisition, and finishes the "
    "year with the same number of cycles and a thinner margin.", GREEN))

# ================================================================ programme ===
el.append(PageBreak())
sec(el, "03", "THE PROGRAMME", "Three phases over nine months, with a decision after the first.")
rows = []
for ph, (name, when, why), days, val in F.phase_rows():
    ws = [w for w in F.WORK if w[0] == ph]
    rows.append([str(ph), name, why + "<br/><br/>" +
                 "<br/>".join("<b>%s.</b>  %s" % (c, n) for _p, c, n, _d in ws),
                 when, "%d" % days])
el.append(tbl(rows, ["", "Phase", "What it does, and the workstreams in it", "When", "Days"],
              [7 * mm, 34 * mm, FULLW - 87 * mm, 26 * mm, 20 * mm],
              aligns=["r", "r"], tiny=True))
sp(6)
h2("The decision at the end of Phase 1")
p("Phase 1 is four weeks and it stands on its own. At the end of it you will know your conversion, "
  "your live birth rate by age band, what is in the tank, where your pregnancies deliver and what "
  "your laboratory could carry. If that evidence does not support the rest of the programme, we "
  "stop and you have paid for four weeks. I would rather find that out in month one than have you "
  "discover it in month six, and a mandate that cannot survive its own baseline should not be sold "
  "to you in the first place.")

# ================================================================= outputs ====
el.append(PageBreak())
sec(el, "04", "WHAT YOU OWN AT THE END", "Working systems, not a report.")
el.append(tbl(
    [["The enquiry register and the pathway",
      "Every enquiry logged, a named coordinator role with a written job description and the person "
      "recruited into it, a same day response standard, and a follow up cadence that runs whether "
      "or not anybody remembers."],
     ["The price book and the packages",
      "A written, costed price list a patient can be sent the same day. Multi cycle and journey "
      "packages, an instalment structure, and a repricing schedule tied to the exchange rate so "
      "the currency stops setting your margin."],
     ["Your own outcome data",
      "Live birth rate by age band, from your own records, in a form you can put in front of a "
      "patient without flinching, and the rule for what may and may not be claimed from it."],
     ["The recall and sibling programme",
      "Every patient with embryos identified, the consent and disposal position settled, storage "
      "billed, and a standing recall that runs on a calendar."],
     ["The continuity pathway",
      "A written route from positive pregnancy test into Clearview Hospital, booked by default, "
      "with a shared antenatal protocol for patients who live elsewhere."],
     ["The shared care network",
      "Named partner gynaecologists under written agreement, paid for monitoring work rather than "
      "for referrals, with the protocol, the fee schedule and the clinical governance behind it."],
     ["The traveller package",
      "One price covering treatment, accommodation, transfers, coordination, and admission to "
      "Clearview Hospital if a complication of the cycle requires it."],
     ["The monthly pack",
      "One page a month: cycles, conversion, outcomes, the tank, the pregnancies, the money. "
      "Yours, and it keeps running after we leave."]],
    ["What", "What it actually is"], [46 * mm, FULLW - 46 * mm], tiny=True))

# ================================================================ measures ====
sp(6)
sec(el, "05", "HOW IT IS MEASURED", "What each phase has to put on the table.")
p("I would rather be held to something than ask you to take this on trust. Each phase carries a "
  "measure, and the final tranche of that phase is not invoiced until the measure is met.")
el.append(tbl(
    [[str(ph), F.PHASES[ph][0], F.MEASURES[ph]] for ph in sorted(F.MEASURES)],
    ["", "Phase", "What has to be true before the final tranche is invoiced"],
    [7 * mm, 40 * mm, FULLW - 47 * mm], tiny=True))

# ===================================================================== fee ====
el.append(PageBreak())
sec(el, "06", "WHAT IT COSTS", "Resourced time. Grades, published rates, and the days each piece takes.")
p("You are buying effort, not a percentage of anything. Every line below is a number of days at a "
  "published rate, which means you can see what you are paying for, you can challenge any line, and "
  "if a workstream is dropped it comes straight off the fee.")
rows = []
for ph, code, name, days in F.WORK:
    rows.append([code, name, "%d" % sum(days.values()), "%s" % nm(F.ws_value((ph, code, name, days)))])
el.append(tbl(rows, ["", "Workstream", "Days", "NGN m"],
              [9 * mm, FULLW - 47 * mm, 16 * mm, 22 * mm], aligns=["r", "r"], tiny=True))

sp(6)
h2("The same money, by grade")
grows = [[g, "{:,}".format(F.RATES[g]), "%d" % F.GRADE_DAYS[g], nm(F.RATES[g] * F.GRADE_DAYS[g])]
         for g in F.ORDER if F.GRADE_DAYS[g]]
grows.append(["Gross", "", "%d" % F.TOTAL_DAYS, nm(F.GROSS)])
el.append(tbl(grows, ["Grade", "Day rate", "Days", "NGN m"],
              [46 * mm, 30 * mm, 22 * mm, FULLW - 98 * mm],
              aligns=["r", "r", "r"], total_row=True, tiny=True))
sp(5)
el.append(tbl(
    [["Gross, at published rates", nm(F.GROSS)],
     ["Programme rate, because this is one continuous mandate rather than five engagements, at 10 "
      "per cent", "(%s)" % nm(F.DISCOUNT)],
     ["Net fee, for the whole nine months", nm(F.NET)]],
    ["", "NGN m"], [FULLW - 30 * mm, 30 * mm], aligns=["r"], total_row=True))
p("That is NGN %s million a month across a nine month programme, against a business the strategy "
  "note puts at roughly NGN %s million a month of fertility revenue today."
  % (nm(F.NET / F.MONTHS), m(D["fresh_rev"], 0)), SMALL)

# =================================================================== terms ====
el.append(PageBreak())
sec(el, "07", "TERMS", "How it is invoiced, and what is not in it.")
el.append(tbl(
    [["On signature", "A mobilisation payment of NGN %s million, credited in full against the "
      "first invoices. It is not an additional charge." % nm(F.MOBILISATION)],
     ["Thereafter", "Monthly in arrears against timesheets, capped at the net fee above. You never "
      "pay for a day that was not worked, and the cap does not move because we were slower than we "
      "expected to be."],
     ["The Phase 1 gate", "At four weeks you may stop. If you do, you pay for Phase 1 and nothing "
      "further, and you keep everything it produced."],
     ["Scope changes", "Any workstream may be dropped, and its days come off the fee. Anything "
      "added is quoted the same way before it starts."],
     ["Third party costs", "Legal drafting, any software you choose to license, and any clinical "
      "or laboratory specialist we bring in are passed through at cost. We do not mark them up."],
     ["Not included", "Media and advertising spend, equipment, laboratory consumables, recruitment "
      "salaries, and regulatory fees. Where we recruit for you, the fee for that is quoted "
      "separately and only if you ask for it."],
     ["Running it afterwards", "If, at the end of the nine months, you would rather have an "
      "operator than an adviser, that is a different arrangement on a separate management fee. "
      "Running a business for years cannot sensibly be billed by the day. It is not part of this "
      "proposal and nothing here commits you to it."],
     ["Confidentiality", "Everything we see is confidential to Consult for Africa. Patient level "
      "data stays inside your systems, and the surveys collect no patient identifiers at all."]],
    ["", "How it works"], [40 * mm, FULLW - 40 * mm], tiny=True))

sp(6)
sec(el, "08", "WHAT WE NEED FROM YOU", "Not much, and most of it is access rather than work.")
el.append(tbl(
    [["1", "A week of your own time across the nine months, most of it in the first month."],
     ["2", "Access to the cycle register, the laboratory records, the storage log and twelve months "
      "of management accounts across both companies."],
     ["3", "One person on your side who owns this with us. They do not have to be senior, but they "
      "do have to be in the building every day."],
     ["4", "Permission to speak to your team, to a number of your patients with their consent, and "
      "to two or three of the doctors who refer to you."],
     ["5", "The surveys pushed out properly. They cost nothing and they answer questions no amount "
      "of our time can."]],
    ["", "What"], [8 * mm, FULLW - 8 * mm], tiny=True))

sp(6)
el.append(card(
    "The first thirty days. Start the five surveys this week, because the one for people who "
    "enquired and did not go ahead needs time to gather. Begin the count on day one. Pull the "
    "outcomes. Open the tank. Trace ten patients end to end. Then the two of us sit down with what "
    "it says and decide whether the rest of this programme is worth your money, which is a question "
    "neither of us can honestly answer today.", CREAM))
p("Dr Debo Odulana<br/><font size=8 color='#6b7280'>Founding Partner, Consult for Africa</font>",
  SIG)
sp(6)
el.append(footer_bar("Dr Debo Odulana   Consult for Africa   /   +234 913 813 8553   /   "
                     "hello@consultforafrica.com"))

doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=22 * mm, bottomMargin=18 * mm,
                      title="Clearview: building the IVF business",
                      author="Consult for Africa")
doc.addPageTemplates([PageTemplate(
    id="m", frames=[Frame(MARGIN, 18 * mm, FULLW, PH - 40 * mm, id="f")],
    onPage=make_furniture("CLEARVIEW FERTILITY", "Building the IVF business   /   the mandate",
                          note="Private  /  Prepared for Dr Kunle Ajayi"))])
doc.build(el)
print("wrote %s" % OUT)
