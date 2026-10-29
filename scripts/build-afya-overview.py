"""
Afya Care: what I am building, how it is going, and where it touches your group.

Written for Mr Tosin Runsewe after the meeting. Not a proposal, not a job
application, and deliberately not a case for the Oakwood chief executive seat.
It concedes that seat in the first paragraph, then argues that the interesting
overlap is the third-party management business, and proposes a fractional
group-level mandate that Consult for Africa can live inside.

Client names withheld throughout, which is itself the point to a man who
manages other people's assets.

    python3 scripts/build-afya-overview.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, Image, PageBreak, PageTemplate,
                                Paragraph, Spacer)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyfeplace_doc import (ALERT, CREAM, FULLW, GREEN, H2, LETTER_TO, LIGHT, MARGIN, PH, P,
                           SIG, SMALL, SUBTITLE, TITLE, card, footer_bar, make_furniture,
                           sec, tbl)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "afya" / "afya-care-overview-cfa.pdf"
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
p("What I am building", TITLE)
p("The firm, the platforms and the operating mandates behind them, how each one is honestly "
  "going, and where I think they touch what you are building at Afya Care.", SUBTITLE)
p("Mr Tosin Runsewe&nbsp;&nbsp;/&nbsp;&nbsp;Afya Care", LETTER_TO)

for t in [
    "Mr Runsewe, thank you for the time and for being as open as you were about where the group is "
    "going. You have had a clear view of my work for a long time, from the chair of the board at "
    "Evercare while I was there through to the Cedarcrest years, so there was very little in the "
    "curriculum vitae you asked for that told you anything you did not already know.",

    "What you have not had a window into is the last two years, and that is the whole of this note. "
    "There is no fee in it, there is no scope of work in it, and I am not asking you to commission "
    "or to hire anything. I have simply written down what I have been building since, how each part "
    "of it is honestly going, and where I think it touches what you described to me.",

    "A few things I want to say plainly up front.",

    "The first is that this is not about the Oakwood seat. That decision is yours and you will make "
    "it on what the building needs. What I want to put to you is the question that sits above it.",

    "The second is that the part of our conversation that stayed with me was not the new hospital "
    "anyway. It was the management business, the one under which Afya runs Havana and other assets "
    "that belong to other people, because that is the same business I am in. I have spent the last "
    "two years building the things a business of that kind runs out of, and in September I signed "
    "my first full mandate to build and then manage a two-city division of a Nigerian hospital "
    "group, on terms very close to the ones you would recognise.",

    "The third is that I run a firm and a group of health technology companies alongside it, and I "
    "am not going to pretend that is a neutral fact in a conversation about my joining you. It is "
    "either the most useful thing I would bring or it is a conflict to be managed, and which of the "
    "two it turns out to be depends entirely on how the thing is structured. So I have set out in "
    "section 05 what I believe the honest structures are, including the one I would choose, which "
    "is a fractional group-level mandate rather than a building.",

    "The fourth is Havana, which I want to put on the table rather than leave sitting under it. I "
    "sit on that board as an independent non-executive director and my firm was paid to build the "
    "board operating model, so Afya and I already have a working relationship at one remove and "
    "your team already holds our work. If anything here progresses, that position has to be looked "
    "at properly and resolved in writing before it becomes anybody's problem.",

    "The fifth is that section 02 includes the parts that are not going well, with the numbers "
    "attached. I would rather you read those from me now than discover them later, and in my "
    "experience what somebody chooses to tell you about their own weak lines is a better guide to "
    "how they will report to you than anything in a curriculum vitae.",

    "The natural first step is a second conversation, on the management business rather than on the "
    "hospital, and I would be glad to have it at whatever hour suits you.",
]:
    p(t)

sp(2)
p("Warm regards,<br/>Dr Debo Odulana<br/>"
  "<font size=8 color='#6b7280'>Founding Partner, Consult for Africa</font>", SIG)
p("Client names are withheld throughout this document, including where the results are mine to "
  "claim. Nothing here discloses confidential information belonging to Havana Specialist Hospital, "
  "to Afya Care or to any client of my firm.", SMALL)

# ================================================================= building ====
el.append(PageBreak())
sec(el, "01", "WHAT I AM BUILDING", "One firm, three layers, and a reason they sit together.")

p("Consult for Africa is a healthcare advisory and venture firm working out of Lagos and Abuja. It "
  "was built by operators rather than by analysts, and the commercial consequence of that is that "
  "we take build and operate mandates as well as advisory ones, which means the plans we write "
  "frequently come back to us as a number we personally have to hit. Our clients are hospital "
  "groups, specialist practices, health insurers, family owners and boards.")

p("Underneath the firm I have built three layers, and they are deliberate rather than accidental. "
  "The operating problems I am asked to solve inside hospitals are almost always the same problems "
  "the products exist to answer, so the firm gives the products their requirements and their first "
  "customers, and the products give the firm a cost to serve that a conventional consultancy cannot "
  "match. Each side keeps the other honest.")
sp(3)

el.append(tbl(
    [["The firm",
      "Advisory and build and operate",
      "Turnaround and financial recovery, strategy and service line economics, feasibility, "
      "modelling and underwriting, licensing and commissioning, clinical governance, and then an "
      "operating mandate where the owner wants one. Seven practice areas, delivered by named "
      "grades at published rates"],
     ["The workforce layer",
      "A registry, an assessment and a diaspora bench",
      "A verified registry of Nigerian healthcare professionals across all sixteen regulated "
      "cadres, built in house rather than bought, with structured leadership and integrity "
      "assessment sitting on top of it and a diaspora physician body of more than eight hundred "
      "attached to it"],
     ["The operating stack",
      "The software a managed asset runs on",
      "Scheduling and clinic fill, facility and room contracting, claims processing and advance "
      "factoring against pending claims, patient membership, and decision-grade reporting that "
      "reads the same way across every asset it is installed in"],
     ["The ventures",
      "Four companies, separately held",
      "A healthcare cooperative for hospital staff, a business to business procurement and "
      "biomedical service platform, a medical tourism marketplace, and a food as medicine business "
      "that is already trading. Each has its own cap table and none of them is a consulting line"]],
    ["", "", "What sits inside it"],
    [26 * mm, 42 * mm, FULLW - 68 * mm], tiny=True))

sp(6)
el.append(card(
    "The short version is that I did not set out to build a software company and I have not built "
    "one. I built a firm that manages hospitals for their owners, and then built the registry, the "
    "assessment and the operating stack because I could not buy any of the three in this market and "
    "a management business cannot scale without all of them. That is the whole thesis, and it is "
    "the reason I think this conversation is worth having.", GREEN))

# ==================================================================== going ====
el.append(PageBreak())
sec(el, "02", "HOW IT IS GOING", "The traction and the weak lines, in the same table.")
p("Written as at September 2026. The middle column is where each line honestly stands, not where I "
  "intend it to be, and I have put the two lines I am least happy with in the same table as the "
  "ones I am pleased with rather than in a footnote.")
sp(3)

el.append(tbl(
    [["Advisory",
      "Working. This is the engine and it pays",
      "Live mandates across a hospital group, a paediatric and neonatal hospital, a specialist "
      "surgical practice, a day case facility, a health insurer and a medical campus. More than "
      "N2bn of planned annual revenue underwritten since the firm was founded"],
     ["Managed operations",
      "One mandate old. Signed 21 September 2026",
      "A two-city division of a Nigerian hospital group. I recruit the two chief operating "
      "officers, the group employs and pays them, they are seconded to my firm and report to me. "
      "Fixed setup fee, monthly support fee from month six, performance fee on collected net "
      "revenue gated on the board hitting both its revenue and its EBITDA goal. Twenty four "
      "months, reviewed at twelve"],
     ["Campus underwriting",
      "Delivered and being built",
      "A twelve-business medical campus taken from measured geometry through rent roll to a monthly "
      "cash model, peak funding and payback. N1.7bn of stabilised campus revenue. The model, not "
      "the brief, became the authority on timing, which is the single most useful thing that work "
      "produced"],
     ["The registry",
      "Real and compounding",
      "10,229 professional records across sixteen cadres. 1,015 hold accounts and 556 of them were "
      "active in September alone, which is more than the previous four months put together. The "
      "employer side of it is four weeks old and is the part I would not yet show a client"],
     ["The practice network",
      "Built, provisioned, and not yet claimed",
      "988 specialists provisioned onto the network against an eligible pool of exactly 988, so the "
      "plumbing works. Fourteen have claimed their place, which is 1.4 per cent, and the reason is "
      "simply that nobody was ever told they had one. The campaign is the missing piece and the "
      "failure is mine"],
     ["The ventures",
      "One trading, three pre-revenue",
      "The food as medicine business is live. The cooperative launches with ten founding hospitals, "
      "the procurement platform and the medical tourism marketplace are built and in pilot. I would "
      "describe all three as assets rather than as businesses until they bill"],
     ["Profession and policy",
      "Compounding quietly, and useful commercially",
      "President of a diaspora body of more than eight hundred Nigerian physicians, a seat on the "
      "Nigerian Economic Summit Group health policy commission, and programme and content lead at "
      "the Healthcare Federation of Nigeria, for whom I wrote the federation's policy brief to the "
      "Minister of State for Health on house officer placement"]],
    ["", "Where it stands", "The detail"],
    [30 * mm, 42 * mm, FULLW - 72 * mm], tiny=True))

sp(6)
el.append(card(
    "The two lines I would want you to press me on are the practice network and the ventures. The "
    "network is a distribution failure and not a product failure, which is a better problem to have "
    "but is still a failure, and it is a fair question whether I should have run the campaign "
    "before building the next thing. The ventures are real companies with real code in them and no "
    "revenue, and a person in your seat is entitled to ask whether they are an asset or a "
    "distraction. My answer is that three of the four exist because a client needed them and paid "
    "for the first version, but I would rather you test that than take it.", ALERT))

# =============================================================== constraint ====
el.append(PageBreak())
sec(el, "03", "WHERE THE CONSTRAINT SITS", "On a third-party management business, not on a hospital.")
p("This section is written about the management business generally rather than about Afya "
  "specifically, because I have not seen your contracts, your portfolio economics or your pipeline. "
  "I have set out the five things that in my experience bind a business that manages other people's "
  "hospitals, and against each one what I already have. Where a line is already solved on your "
  "side, please read it as evidence that I understand the problem rather than as advice you need.")
sp(3)

el.append(tbl(
    [["You can only manage as many assets as you have operators to put in them",
      "Contracts are not the scarce input. A credible chief executive or chief operating officer "
      "for an asset you have just taken on is, and the lead time is eight to twelve months once "
      "notice, credentialling and relocation are counted",
      "A registry of 10,229 professionals across sixteen cadres, structured assessment on every "
      "senior appointment, a diaspora bench of more than eight hundred physicians, and a secondment "
      "structure already contracted and tested: I recruit, the owner employs, the executive is "
      "seconded and reports to the management company"],
     ["Every asset arrives on a different information system",
      "A management company that cannot report across its own portfolio cannot price its next "
      "contract, cannot prove its value to the owner it already has, and ends up re-arguing its fee "
      "from a position of no evidence every single year",
      "An operating stack built to install on top of what is already in the building rather than to "
      "replace it, so that scheduling, claims, collections and productivity read the same way "
      "across assets that will never share a system"],
     ["The fee architecture is usually the thing that is wrong",
      "Management companies chronically take a rate that does not compensate the risk, or an EBITDA "
      "share in a group where the owner sets the group charges, the allocations and the transfer "
      "pricing, which means every lever that moves your fee sits on the other side of the table",
      "I have just negotiated this in anger, line by line, and would say two things. Take revenue "
      "over EBITDA in any group you do not control, and negotiate the base before you argue the "
      "rate, because a half point is visible and a word in the definition is invisible and usually "
      "worth more"],
     ["The failure mode is the owner relationship, not the operations",
      "Assets are lost because the owner stopped feeling in control, or because a family fell out "
      "over something the management company could have designed around, far more often than "
      "because the numbers missed",
      "This is the work my firm did at Havana: the board operating model, the committee terms, the "
      "delegation of authority, the instruments and the training, built so that the owners govern "
      "and the operator manages and neither side has to guess which is which"],
     ["The pipeline is owners who have an asset and no operator, and they are hard to find",
      "Management mandates are won one relationship at a time, usually after the owner has already "
      "tried and failed to run it themselves, and by then the asset is distressed and the terms are "
      "worse",
      "My advisory practice sits directly upstream of that. Every audit, feasibility and turnaround "
      "diagnostic I am commissioned to do puts me in a room with an owner who has an asset and is "
      "discovering that they do not want to run it. That is not a marketing channel, it is origination"]],
    ["What binds it", "Why it binds", "What I already have against it"],
    [40 * mm, 60 * mm, FULLW - 100 * mm], tiny=True))

sp(6)
el.append(card(
    "If I had to compress the whole of this note into one line it would be this. A business that "
    "manages hospitals for their owners is constrained by its bench, its visibility across the "
    "portfolio, its fee architecture, its owner governance and its origination, and in the last two "
    "years I have built something against each of those five. I did not build them for Afya and I "
    "am not pretending I did. But I would struggle to name another person in this market who has "
    "them sitting in one place.", CREAM))

# ================================================================== atgroup ====
el.append(PageBreak())
sec(el, "04", "WHERE I WOULD BE OF VALUE", "Group level work, described as mandates rather than as a job.")
p("These are written as pieces of work with an output and an owner rather than as a job "
  "description, because a job description at group level tends to describe a presence instead of a "
  "result, and because each of these is small enough to be tested inside a quarter.")
sp(3)

el.append(tbl(
    [["The managed assets business, as a business",
      "What it earns per asset after the true cost to serve, which contracts are underwater, what "
      "the standard mandate should look like, and what has to be true before it is worth taking on "
      "the sixth asset rather than the third"],
     ["The operating bench",
      "A named-seat plan for the next three to five mandates rather than a scramble per contract, "
      "built from the registry and the diaspora bench, with structured assessment on every senior "
      "appointment and a compensation model that survives the second year"],
     ["Portfolio reporting",
      "One set of numbers that reads the same way across every asset under management, installed "
      "over whatever each building already runs, so that the monthly pack to an owner is evidence "
      "rather than narrative and the next fee negotiation starts from a position of proof"],
     ["Owner governance as a product",
      "Packaging what a good owner relationship looks like into instruments that ship with every "
      "mandate: board and committee architecture, delegation of authority, the reporting cadence, "
      "and the escalation route. It reduces the single largest cause of asset loss and it is "
      "chargeable"],
     ["Origination",
      "A deliberate pipeline of owners with assets and no operator, worked through the advisory "
      "route rather than through business development, which is how these mandates actually arrive"],
     ["Oakwood, from the group side",
      "Not running it. Commissioning and activation discipline around whoever does: the ramp "
      "modelled monthly rather than a date asserted, readiness gates, the consultant bench secured "
      "ahead of the construction programme, and the first ninety days planned as an operating "
      "period rather than as a launch"]],
    ["", "What it involves"],
    [52 * mm, FULLW - 52 * mm], tiny=True))

# ==================================================================== shape ====
el.append(PageBreak())
sec(el, "05", "THE SHAPE", "Fractional at group level, and what happens to my firm.")
p("You raised the possibility of my joining you and I have thought about it properly rather than "
  "politely. What follows is what I actually think, including the objection to it.")

h2("What I would choose")
p("A fractional group-level mandate. A defined and protected portion of my week, two or three days, "
  "inside Afya at group level with accountability for the managed assets business rather than for a "
  "building, on a fixed term with a review at twelve months. My firm continues, and the arrangement "
  "is written so that what my firm has built is available to Afya on terms your board can see, "
  "rather than smuggled in through me or left outside where it is no use to either of us.")
p("I would put it to you that this is not a compromise between employment and independence but the "
  "better answer on its own merits, because the work in section 04 is design and installation work "
  "that has a natural end, and because you would be buying the registry, the assessment, the "
  "operating stack and the origination route along with the person, which you cannot do by hiring "
  "an individual and cannot easily do by retaining a consultancy either.")
sp(4)

h2("The objection, which is fair")
p("A part-time group role becomes an advisory seat with a title, and an advisory seat with a title "
  "helps nobody. I have watched it happen and I would not want it. The answer is not more days, it "
  "is that the mandate has to attach to a named number and a named set of deliverables rather than "
  "to a job description, with a reporting line that is observed in practice and not only in "
  "writing. I would want that written down at the start, because I have just spent a month "
  "negotiating exactly this clause on the other side of the table and I know precisely where it "
  "fails.")
sp(4)

h2("The three honest structures")
el.append(tbl(
    [["A&nbsp;&nbsp;Fractional group mandate",
      "Two or three protected days a week at group level, fixed term, reviewed at twelve months. My "
      "firm continues and licenses what Afya wants to use on arm's length terms your board approves",
      "My preference. Lowest risk for you, fastest to start, and it converts to full time if the "
      "managed assets business grows into it"],
     ["B&nbsp;&nbsp;Group executive, with the build and operate book folded in",
      "I join properly at group level and the part of my firm that does build and operate comes "
      "with me into Afya. The advisory and venture side stays separate and is ring-fenced",
      "Cleanest commercially and the most committed. Trust is not the obstacle between us, but a "
      "valuation conversation and the consent of my existing clients both are, so I would not "
      "start here"],
     ["C&nbsp;&nbsp;Firm to firm on one asset first",
      "No seat. Afya and my firm take one mandate together, on one asset, for twelve months, and "
      "see how we work",
      "The lowest-risk way to find out whether any of this is real. If it goes well, A or B "
      "follows on evidence rather than on impression"]],
    ["", "What it is", "My view of it"],
    [40 * mm, 62 * mm, FULLW - 102 * mm], tiny=True))

sp(5)
h2("Conflicts, and Havana")
p("Any of the three creates conflicts and they are manageable, but only if they are written down "
  "before they arise rather than after. I would expect to declare every client interest my firm "
  "holds, to stand recused from anything where my firm could bid, to give Afya a written position "
  "on whether my firm competes for management mandates and where it does not, and to have anything "
  "my firm licenses to Afya priced at arm's length and approved by your board with me out of the "
  "room. That is the same disclose and recuse discipline I already operate under elsewhere, so it "
  "is familiar rather than theoretical.")
p("Havana needs its own answer. I am an independent non-executive director there and my firm was "
  "paid by that board to build its governance framework, while Afya is the operating partner in the "
  "same building, which means I currently sit on the owner's side of a table where you sit on the "
  "operator's. That is a perfectly ordinary arrangement today and it stops being ordinary the "
  "moment I take a seat at Afya. I would not want to resolve it informally. Whichever way it goes, "
  "and I have no fixed view on which, it should be decided openly by both boards and recorded.")

# ==================================================================== asks ====
el.append(PageBreak())
sec(el, "06", "WHAT I WOULD WANT TO KNOW", "Seven questions that would change everything above.")
p("I would rather tell you what I cannot see than write around it. Each of these would move my view "
  "materially and each is answerable in a conversation rather than a study.")
sp(3)
el.append(tbl(
    [["The portfolio", "How many third-party assets are under management today, on what contract "
      "shapes, and what each one earns after the true cost of the people you put into it"],
     ["The intent", "Whether the management business is the strategy or the bridge. A group that "
      "intends to own assets eventually runs its management business very differently from one that "
      "intends to manage permanently, and almost every answer below turns on this"],
     ["The bench", "Where the operating bench stands against the next three mandates, counted in "
      "people you could name rather than roles you could advertise, and how you intend to backfill "
      "the seats a new asset empties"],
     ["Oakwood", "What the commissioning plan assumes month by month for the first year, whether "
      "the ramp is modelled or asserted, and who personally owns that number once the building is "
      "handed over"],
     ["The group operating model", "What consolidates at the centre and what stays with each asset, "
      "because a management company that has not settled this ends up with a head office that "
      "charges for services the assets do not want"],
     ["The seat", "What you actually need at group level, as distinct from what each asset needs "
      "inside it. If the honest answer is that the need is inside the buildings rather than above "
      "them, I would rather know that plainly"],
     ["Appetite", "Whether a structure of the kind in section 05 is something your group can "
      "accommodate at all, because if the answer is that it has to be a conventional full-time "
      "employment or nothing, I would rather know that early and think about it properly"]],
    ["", "The question I would ask first"],
    [38 * mm, FULLW - 38 * mm], tiny=True))
sp(6)
p("If those seven are all comfortable on your side, this note has cost you ten minutes and I would "
  "be glad to have been usefully wrong early.")

# =================================================================== record ====
el.append(PageBreak())
sec(el, "07", "THE RECORD BEHIND THIS", "For whoever you pass this to, rather than for you.")
p("You know most of this page at first hand, two of the lines from the chair of the board, so it "
  "is here only so that the document stands on its own if it goes to a colleague.")
sp(3)
el.append(tbl(
    [["N1.0bn monthly revenue, N1bn H1 EBITDA",
      "As chief executive of a 75-bed tertiary surgical hospital in Abuja. The strongest year in "
      "the hospital's sixteen-year history, and a first-half EBITDA ahead of the whole of the prior "
      "year"],
     ["USD 1.1m annualised cost out",
      "As chief innovation and strategy officer at a fund-owned 165-bed tertiary hospital in Lekki, "
      "through clinical workforce and service portfolio rebalancing, with clinical volume held"],
     ["23 per cent revenue growth in three months",
      "From a consultant pay-for-performance model that raised variable pay 15 per cent at the same "
      "time. The clinicians backed it because they were paid for it"],
     ["One exit",
      "Founder and chief executive of Nigeria's first technology-enabled private healthcare network, "
      "built from nothing across 21 states and acquired by the market leader"],
     ["Earlier",
      "Surgeon and theatre nurse training programmes across the Middle East and Africa, the "
      "technology strategy for a 90-bed COVID-19 field hospital in Eti-Osa delivered inside six "
      "weeks, and Nigeria's first electronic patient record implementation"],
     ["Education and registration",
      "MSc International Health Management, Imperial College Business School, London. MBBS, "
      "University of Sharjah. Full registration with the Medical and Dental Council of Nigeria"]],
    ["", ""],
    [56 * mm, FULLW - 56 * mm], tiny=True))

sp(7)
el.append(card(
    "Mr Runsewe, the ask in this document is a second conversation and nothing else. If what the "
    "group needs is people inside the buildings rather than a function above them, then this is the "
    "wrong conversation and I would rather you said so. If there is something at group level worth "
    "building, particularly on the management side, then I would like to be part of working out "
    "what it looks like, and I am comfortable starting that as one asset and twelve months rather "
    "than as a title.", CREAM))
p("Dr Debo Odulana<br/><font size=8 color='#6b7280'>Founding Partner, Consult for Africa</font>",
  SIG)
sp(6)
el.append(footer_bar("Dr Debo Odulana   Consult for Africa   /   +234 913 813 8553   /   "
                     "hello@consultforafrica.com   /   consultforafrica.com"))

doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=22 * mm, bottomMargin=18 * mm,
                      title="What I am building: a note for Afya Care",
                      author="Consult for Africa")
doc.addPageTemplates([PageTemplate(
    id="m", frames=[Frame(MARGIN, 18 * mm, FULLW, PH - 40 * mm, id="f")],
    onPage=make_furniture("CONSULT FOR AFRICA", "What I am building   /   a note for Afya Care",
                          note="Private  /  Prepared for Mr Tosin Runsewe"))])
doc.build(el)
print("wrote %s" % OUT)
