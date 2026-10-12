"""
Iwosan and IASO Medipark: a note for Mrs Fola Laoye.

Written to somebody Debo knows and has worked with, so there is no introduction,
no credentials pitch and no bio. Not a proposal. It reads the twelve months
either side of an opening, publishes conditionals rather than findings, and is
explicit about what has not been seen.

    python3 scripts/build-iwosan-note.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, Image, PageBreak, PageTemplate,
                                Paragraph, Spacer)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyfeplace_doc import (CREAM, FULLW, GREEN, H2, LETTER_TO, LIGHT, MARGIN, PH, P, SIG,
                           SMALL, SUBTITLE, TITLE, card, footer_bar, make_furniture,
                           sec, tbl)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "iwosan" / "iwosan-medipark-note-cfa.pdf"
LOGO_DARK = ROOT / "docs" / "c4a-logo.png"
LOGO_RATIO = 968 / 230

el = []
p = lambda t, st=P: el.append(Paragraph(t, st))
sp = lambda h=4: el.append(Spacer(0, h))
h2 = lambda t: el.append(Paragraph(t, H2))

# =================================================================== letter ====
_logo = Image(str(LOGO_DARK), width=30 * mm, height=30 / LOGO_RATIO * mm)
_logo.hAlign = "LEFT"
el.append(_logo)
sp(12)
p("Iwosan and Medipark", TITLE)
p("What tends to get heavy in the twelve months on either side of an opening, and what I "
  "could take off your plate.", SUBTITLE)
p("Mrs Fola Laoye&nbsp;&nbsp;/&nbsp;&nbsp;Chief Executive Officer, Iwosan Investments and "
  "IASO Medipark", LETTER_TO)

for t in [
    "Dear Ma, congratulations. Medipark is nearly there, and I have followed it since the "
    "groundbreaking with a good deal of pride, because it is the most serious piece of health "
    "infrastructure anybody has put up in this country in years.",

    "You have known me since I was pitching Doctoora at you, and you watched the rest of it from "
    "Evercare through to Cedarcrest, so I will skip the introduction and come straight to why I am "
    "writing.",

    "The last time you and I worked on a building together it was the isolation centre in Eti-Osa, "
    "which had to be standing, wired and taking patients inside six weeks. Medipark is a different "
    "order of thing entirely, but the questions in the months before a facility opens are largely "
    "the same questions, and they are the ones I have spent the years since getting a great deal "
    "better at answering.",

    "The twelve months on either side of an opening are the months that set what an asset earns "
    "for the rest of a forty year concession, and they are also the months in which the person "
    "carrying it has the least room to think, which is usually when an extra pair of hands is "
    "worth something. So the question I actually want to ask you is a simple one. What can I take "
    "off your plate?",

    "The pages behind this are my attempt to be useful before asking rather than after. A few "
    "things to say plainly about them.",

    "The first is that this is not a proposal and there is no fee in it. It is a few pages on what "
    "tends to get heavy in the year either side of an opening, so that you can tell me which of it "
    "is wrong and which of it you settled months ago.",

    "The second is that I am working from the public record. I have not seen your commissioning "
    "plan, your recruitment position, your payer contracts or your model, so section 02 is written "
    "as conditionals rather than as findings, and where I do not know something I have put it in "
    "section 03 instead of guessing at it.",

    "The third is where I think the pressure actually sits, and I would say the same thing to you "
    "on the telephone. Having taken a surgical hospital through a financial turnaround and having "
    "structured and costed a medical campus with a dozen separate businesses inside it, my view is "
    "that the binding constraint on a project of this kind is almost never the capital and almost "
    "never the building. It is the senior clinical bench, because a consultant seat agreed in the "
    "first month of operations is eight to twelve months late, and it is the non-clinical square "
    "metres, because a campus that is underwritten as one building tends to get run as one hospital "
    "with some empty space attached to it. Both of those are settled before opening and both are "
    "expensive to revisit afterwards.",

    "The fourth is that Consult for Africa is the part of the story you will not know, so there is "
    "a page on the firm at the back in section 05. Almost everything on it is work we have actually "
    "done rather than work we are able to do.",

    "Tell me what is heaviest on your desk this month and I will tell you honestly whether it is "
    "something we should be doing for you or whether you already have it covered. Either way, I "
    "would love to see the place before it opens.",
]:
    p(t)

sp(2)
p("Warm regards,<br/>Debo", SIG)
p("Dr Debo Odulana&nbsp;&nbsp;/&nbsp;&nbsp;Founding Partner, Consult for Africa<br/>"
  "<font color='#6b7280'>Everything in this note comes from the public record, because I have not "
  "seen your numbers. None of it should be read as a representation about them.</font>", SMALL)

# ================================================================== reading ====
el.append(PageBreak())
sec(el, "01", "HOW I READ IT", "Six things that get heavy between groundbreaking and run rate.")

h2("A 140-bed hospital does not open, it ramps, and the ramp is the return")
p("An opening is a date, and a ramp is a curve, and the two get confused in almost every "
  "commissioning plan I have read. The first ninety days after a hospital takes its first patient "
  "are usually consumed by defect correction, induction, workflow rework and the discovery of "
  "everything the drawings did not anticipate, which pushes the revenue curve a full quarter to "
  "the right while the cost base arrives on time and in full. Under a forty year concession that "
  "quarter matters more than it looks, because the early years are the ones the whole return "
  "compounds off, and because a facility that opens slowly acquires a reputation for being quiet "
  "that then takes a year of marketing to undo. The answer is not to open faster. It is to open in "
  "a deliberate sequence, service line by service line, with the monthly ramp modelled and a named "
  "person accountable to the number rather than to the date.")

h2("The scarce input is the consultant bench, not the capital")
p("Nigeria is exporting its senior clinicians faster than any of us can replace them, and a "
  "multi-specialist hospital of this size needs a named consultant in every service line that "
  "carries margin, which is a recruitment problem with a lead time of eight to twelve months once "
  "notice periods, credentialling and relocation are counted. Facilities that leave this to the "
  "construction timetable open on locum and visiting cover in exactly the specialties where "
  "continuity is what the patient is paying for, and because the reputation of a hospital among "
  "referring doctors is formed in its first six months, that opening posture is expensive and slow "
  "to correct. If Medipark is intended, as it has been described publicly, to keep Nigerian "
  "patients in Nigeria, then the bench is the proposition, and senior Nigerians practising abroad "
  "have to be worked as a genuine recruitment channel with terms, sessions and a landing plan "
  "rather than as a line in a launch announcement.")

h2("A fifth address in Ikoyi is a portfolio question, not a site question")
p("Awolowo Road is a few minutes from your Ikoyi and Victoria Island hospitals, which means the "
  "decision that matters is not what Medipark can do but what each of the five addresses is now "
  "for. Without an explicit position on that, the new asset is priced as a better version of a "
  "hospital you already own, the same consultants split their sessions across two of your "
  "buildings, and a share of the volume that arrives looks like growth while it is actually "
  "transfer. This is solvable, and it is much easier to solve on paper before opening than to "
  "unwind afterwards, because it comes down to three decisions: which service lines sit where, how "
  "referral flows between the sites are designed and rewarded, and who owns the profit and loss "
  "for a patient who could reasonably be treated at either address.")

h2("The square metres that are not the hospital are businesses, and they get forgotten")
p("A campus with a diagnostics centre, training facilities, retail medical outlets and residential "
  "space has four or five businesses in it besides the hospital, and each one has a tenant or an "
  "operator, a tariff, an occupancy assumption and a person whose job it is to fill it. What "
  "happens in practice is that the hospital absorbs all of the management attention in the opening "
  "year, because the hospital is the thing that can hurt somebody, and the rest of the floor plate "
  "sits empty for eighteen months while carrying its share of the cost. On the medical campus we "
  "structured last year the non-clinical lines were roughly a third of the stabilised revenue and "
  "the fastest of them was paying before the anchor clinical service did, which is the argument "
  "for giving each of them a profit and loss, an occupancy target and a name against it well "
  "before the doors open.")

h2("Twenty per cent of the beds sets the arithmetic for the other eighty")
p("Reserving a fifth of the beds for indigent patients is the right thing to have negotiated and "
  "it is also the most demanding piece of commercial design in the project, because the remaining "
  "beds now have to carry a fixed cost base at an occupancy and a price that were both set by a "
  "concession. That requires a payer and tariff architecture built deliberately before opening: "
  "what the self-pay proposition actually is and why a family would choose it, which corporate and "
  "embassy accounts are signed rather than discussed, what the managed care position is and where "
  "it is refused, and how the reserved beds are funded, reported and staffed so that they are run "
  "as a programme with its own accountability rather than absorbed as a loss and quietly resented "
  "by the people delivering them.")

h2("Repatriating medical tourism is a purchasing decision, not a capability statement")
p("The family that currently flies to India or the United Kingdom is not buying a scanner or a "
  "bed. It is buying certainty, and specifically a named surgeon, a date, a fixed all-in price, an "
  "explicit statement of what happens if something goes wrong, and somebody who answers the "
  "telephone at ten at night. Capability alone produces enquiries and very few conversions, which "
  "is the pattern at almost every Nigerian facility that has gone after this market. Three or four "
  "pathways packaged end to end, priced as one number, with the consultant named and the escalation "
  "route written down, will convert more of that demand in a year than any amount of equipment "
  "messaging, and they have to exist on day one because the first cohort of patients is what the "
  "referral network talks about.")

# ============================================================== conditionals ====
el.append(PageBreak())
sec(el, "02", "IF, THEN EXPECT", "Conditionals rather than findings, because I have not seen your numbers.")
p("None of the following is a claim about Iwosan. Each line is a pattern I have watched play out "
  "in facilities at this stage, written so that you can test it against what you already know in "
  "about ten minutes.")
sp(3)
el.append(tbl(
    [["Senior recruitment is running on the construction timetable rather than ahead of it",
      "Opening on locum and visiting cover in the specialties that carry margin, and a first year "
      "spent buying back a reputation for who works there",
      "Run the bench now as a named-seat exercise by specialty, with the diaspora treated as a real "
      "channel and a structured assessment on every senior appointment"],
     ["The campus is underwritten as one building",
      "Eighteen months of empty non-clinical floor plate carrying its share of the fixed cost while "
      "the hospital takes all the attention",
      "Give diagnostics, training, retail and residential their own profit and loss, occupancy "
      "target and named owner before opening"],
     ["Tariffs are set against the existing Lagoon schedule",
      "The new asset reads as a better version of a hospital you already own, and a share of the "
      "volume is transfer rather than growth",
      "Price the campus as a separate exercise, with an explicit written position on what each of "
      "the five addresses is for"],
     ["The opening is planned as a single date",
      "The first ninety days go to defects and induction, the revenue curve moves a quarter right, "
      "and the first-year miss is blamed on demand",
      "Sequence the opening by service line, high certainty first, and model the ramp monthly with "
      "one person accountable to it"],
     ["Medical tourism is positioned as a capability",
      "Enquiries in volume and conversions in single figures, because certainty is what is being "
      "bought and it has not been packaged",
      "Build three or four pathways end to end, one price, named consultant, written escalation, "
      "live on day one"],
     ["The reserved beds are treated as a cost line",
      "They are managed as a loss, resented internally, and the strongest institutional "
      "relationship the campus has is left unused",
      "Design them as a funded programme with its own reporting to the State and its own staffing "
      "model"],
     ["Support functions are shared with the existing group without a settled operating model",
      "The best people at Lagoon are pulled into Medipark and the four existing hospitals soften "
      "at exactly the wrong moment",
      "Settle the group operating model first: what consolidates, what stays local, and who "
      "backfills the seats the new campus empties"]],
    ["If", "Then expect", "What I would do about it now"],
    [46 * mm, 62 * mm, FULLW - 108 * mm], tiny=True))

sp(6)
el.append(card(
    "If most of these already have an owner and a date against them, then you are further ahead "
    "than the majority of projects I see at this stage, and the honest answer is that you do not "
    "need me. If two or three of them are still sitting with you personally, that is usually "
    "because they are the ones that cut across the construction programme, the existing group and "
    "the State at the same time, and those are the pieces I would be most useful on.", LIGHT))

# ============================================================== do not know ====
el.append(PageBreak())
sec(el, "03", "WHAT I DO NOT KNOW", "The questions that would change everything above.")
p("I would rather tell you what I cannot see than write around it. Each of these would move my "
  "view materially, and each is answerable in a conversation rather than a study.")
sp(3)
el.append(tbl(
    [["The ramp", "What the commissioning plan assumes month by month for the first year, whether "
      "it is modelled or asserted, and who personally owns that number"],
     ["The bench", "Where senior recruitment actually stands by specialty, counted in signed terms "
      "rather than expressions of interest, and what the credentialling lead time looks like"],
     ["The rent roll", "Whether the non-clinical space has an occupancy assumption, a pricing basis "
      "and an accountable owner, or whether it is still described as future upside"],
     ["The payer position", "What the strategy is for the eighty per cent of beds, and which "
      "corporate, embassy and international accounts are signed rather than in discussion"],
     ["The group", "How the four existing hospitals are expected to change once the fifth address "
      "opens, and whether that has been written down anywhere the management teams can read it"],
     ["The academy", "What the training facility is expected to earn, and whether it is a school, "
      "a continuing education business, a recruitment funnel or all three"],
     ["The consortium", "How delivery responsibility divides between the partners once the "
      "building is finished, because the operating phase asks for a different structure from the "
      "construction phase"]],
    ["", "The question I would ask first"],
    [34 * mm, FULLW - 34 * mm], tiny=True))
sp(6)
p("If the answers to those seven are all comfortable, this note has cost you eight minutes and I "
  "would be glad to have been usefully wrong early.")

# ================================================================== useful ====
el.append(PageBreak())
sec(el, "04", "WHERE I COULD BE USEFUL", "Six shapes of help. Take one, or none.")
p("These are described as pieces of work rather than as a programme, because nobody at your stage "
  "should be buying a programme. Each one stands alone and each one starts small.")
sp(3)
el.append(tbl(
    [["Commissioning and activation",
      "A sequenced opening plan built service line by service line, with the ramp modelled monthly, "
      "the readiness gates defined, and the first ninety days planned as an operating period rather "
      "than as a launch"],
     ["The consultant bench",
      "Named-seat recruitment in the specialties that carry margin, including senior Nigerians "
      "practising abroad, with a structured leadership assessment on every senior appointment and a "
      "compensation model that survives the second year"],
     ["Campus economics",
      "The diagnostics, training, retail and residential lines treated as businesses with tenants, "
      "tariffs, occupancy targets and owners, which is the work we did on a medical campus of "
      "comparable ambition last year"],
     ["Payer and tariff architecture",
      "Price positions by site and by service line, the self-pay proposition, corporate and "
      "international contracting, and the funding and reporting design for the reserved beds"],
     ["Group operating model",
      "What sits where across five addresses, how referral flows between them are designed and "
      "rewarded, where support functions consolidate, and how the existing hospitals are protected "
      "while the new one fills"],
     ["Fractional or seconded leadership",
      "If what is missing is a pair of experienced hands inside the building rather than a view "
      "from outside it, we second healthcare executives on fixed-term mandates and hold the "
      "operating result"]],
    ["", "What it involves"],
    [46 * mm, FULLW - 46 * mm], tiny=True))

sp(6)
el.append(card(
    "Any one of these begins as two or three weeks of work with a fixed scope, and I would rather "
    "agree that scope with you on the telephone than quote you a figure in a document you did not "
    "ask for. Everything beyond it is billed as resourced time, which means named grades at "
    "published rates against the days each piece actually takes, so nothing you drop is ever "
    "paid for.", GREEN))

# ==================================================================== firm ====
el.append(PageBreak())
sec(el, "05", "CONSULT FOR AFRICA", "What the firm is now, and what it has actually done.")
p("You have watched most of my trajectory, so this is only the part that came after Cedarcrest. "
  "Consult for Africa is a healthcare advisory and venture firm working out of Lagos and Abuja. We "
  "were built by operators rather than by analysts, and the distinction matters commercially, "
  "because we take build and operate mandates as well as advisory ones, which means the plans we "
  "write frequently come back to us as a number we have to hit. Our clients are hospital groups, "
  "specialist practices, health insurers, family owners and boards, and the work runs from a "
  "three-week diagnostic through to installing and holding a management team for two years. I run "
  "it alongside the health technology companies I founded, which is deliberate rather than "
  "accidental, because the operating problems we are asked to solve are usually the same problems "
  "the products exist to answer, and each side keeps the other honest.")
sp(4)
h2("Practice areas")
el.append(tbl(
    [["Turnaround and financial recovery",
      "Revenue integrity, claims recovery, tariff realisation, cost and leakage control, theatre "
      "and bed productivity, and a management reporting cadence that survives us leaving"],
     ["Strategy, growth and commercial",
      "Market and demand mapping, service line economics, referral architecture, payer mix and "
      "tariff negotiation, and the self-pay proposition"],
     ["Build, commission and operate",
      "Feasibility, financial modelling and underwriting, capital planning, licensing, "
      "commissioning and activation, then an operating mandate if the owner wants one"],
     ["Clinical governance and quality",
      "Committee structure, escalation and board reporting, incident and mortality review, and "
      "preparation for JCI, COHSASA and SafeCare"],
     ["Workforce, recruitment and leadership",
      "Senior and specialist recruitment from a verified registry of more than ten thousand "
      "Nigerian clinicians maintained in house, structured pre-employment and leadership "
      "assessment, retention economics, and coaching for clinical leaders"],
     ["Fractional leadership and secondments",
      "Chief executive, operating, medical and technology cover on fixed-term mandates, two to "
      "three days a week or full time, with performance-linked terms"],
     ["Digital and health systems",
      "Hospital information system selection and implementation oversight, executive dashboards "
      "and decision-grade reporting, digital front door, referral systems and remote care"]],
    ["", "What sits inside it"],
    [50 * mm, FULLW - 50 * mm], tiny=True))

sp(6)
h2("Selected results")
el.append(tbl(
    [["N1.0bn monthly revenue, N1bn H1 EBITDA",
      "At Cedarcrest Abuja, a 75-bed tertiary surgical hospital, under me as chief executive. The "
      "strongest year in its sixteen-year history, and an H1 EBITDA ahead of the whole of the prior "
      "year"],
     ["USD 1.1m annualised cost out",
      "At Evercare Lekki, through clinical workforce and service portfolio rebalancing, with "
      "clinical volume held"],
     ["23 per cent revenue growth in three months",
      "From a consultant pay-for-performance model that raised variable pay 15 per cent at the same "
      "time. The clinicians backed it because they were paid for it"],
     ["N1.7bn medical campus structured",
      "A twelve-business campus in Abuja taken from measured geometry through rent roll, monthly "
      "cash model, peak funding and payback. The model, not the brief, became the authority on "
      "timing"],
     ["N45 to 50m per month at 18 to 20 per cent EBITDA",
      "The growth plan behind a full organisational and financial audit of a paediatric and "
      "neonatal hospital, neonatal intensive care led, funded by a tariff reset in two tranches"],
     ["More than N2bn of planned annual revenue underwritten",
      "Since the firm was founded, across a medical campus, a paediatric and neonatal hospital, a "
      "specialist surgical group, a day case facility and a health insurance network"]],
    ["", "Where"],
    [58 * mm, FULLW - 58 * mm], tiny=True))
sp(4)
p("Client names are withheld where the work is live or the engagement is confidential. Happy to "
  "give you references privately, and happy to put you in front of any of them.", SMALL)

sp(7)
el.append(card(
    "Ma, the ask here is a conversation, not a mandate. Tell me what is heaviest on your desk this "
    "month and I will tell you honestly whether it is something we should be doing for you or "
    "whether you have it covered already. If the timing is wrong, say so and I will come back after "
    "you have opened, because the second year of a campus asks harder questions than the first and "
    "I would be glad to be useful then instead.", CREAM))
p("Debo<br/><font size=8 color='#6b7280'>Dr Debo Odulana, Founding Partner, Consult for Africa"
  "</font>", SIG)
sp(6)
el.append(footer_bar("Dr Debo Odulana   Consult for Africa   /   +234 913 813 8553   /   "
                     "hello@consultforafrica.com   /   consultforafrica.com"))

doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=22 * mm, bottomMargin=18 * mm,
                      title="Iwosan and Medipark: a note from Debo Odulana",
                      author="Consult for Africa")
doc.addPageTemplates([PageTemplate(
    id="m", frames=[Frame(MARGIN, 18 * mm, FULLW, PH - 40 * mm, id="f")],
    onPage=make_furniture("IWOSAN", "Medipark   /   the year either side of opening",
                          note="Private  /  For Mrs Fola Laoye"))])
doc.build(el)
print("wrote %s" % OUT)
