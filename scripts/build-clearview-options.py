"""
Clearview Fertility and Clearview Hospital: strategic options.

A prospect note, not a plan and not a proposal. It postulates possibilities,
publishes ranges rather than point estimates, and is explicit about what has
not been counted. Bands come from scripts/clearview_model.py.

    python3 scripts/build-clearview-options.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, Image, PageBreak, PageTemplate,
                                Paragraph, Spacer)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import clearview_model as M
from lyfeplace_doc import (ALERT, CREAM, FULLW, GREEN, H2, LETTER_TO, MARGIN, PH, P, SIG,
                           SMALL, SUBTITLE, TITLE, card, footer_bar, m, make_furniture,
                           sec, tbl)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "clearview" / "clearview-options-cfa.pdf"
LOGO_DARK = ROOT / "docs" / "c4a-logo.png"
LOGO_RATIO = 968 / 230

D = M.MID
B = M.BANDS


def band(key, dp=0, unit=""):
    lo, hi = B[key]
    return "NGN %s to %s%s" % (m(lo, dp), m(hi, dp), unit)


el = []
p = lambda t, st=P: el.append(Paragraph(t, st))
sp = lambda h=4: el.append(Spacer(0, h))
h2 = lambda t: el.append(Paragraph(t, H2))

# ==================================================================== note ====
_logo = Image(str(LOGO_DARK), width=30 * mm, height=30 / LOGO_RATIO * mm)
_logo.hAlign = "LEFT"
el.append(_logo)
sp(12)
p("Clearview Fertility and Clearview Hospital", TITLE)
p("Where a nine year old fertility business actually leaks, four directions the group "
  "could take, and the questions that decide which one is available.", SUBTITLE)
p("Dr Kunle Ajayi", LETTER_TO)
for t in [
    "Dr Kunle, thank you for the conversation, and for being as open as you were about where "
    "Clearview sits after nine years. I have been thinking about it since, and this is the short "
    "version of what I suspect is going on and what I would do about it.",

    "A few things I want to say plainly up front.",

    "The first is that you told me you believe in systems and do not think you have one yet, and I "
    "would put that slightly differently. You have a system, and it has worked for nine years, "
    "which is longer than a great many fertility units in this country manage. The difficulty is "
    "that the system is you, because the patients come on the strength of your name, the referrals "
    "come from colleagues who know you personally, and the judgements that matter are made in your "
    "head rather than written down anywhere, which means the business cannot grow past your own "
    "clinic hours and it is worth considerably less to anybody else than it is to you. Stability "
    "and sustainability, which is what you said you were after, are really another way of "
    "describing a business that still works in a week when you are not in it.",

    "The second is about marketing, and I want to be careful here, because I do not think a funnel "
    "is your first problem. In a fertility business the money is almost never lost between the "
    "advertisement and the enquiry. It is lost between the enquiry and the first cycle, in the "
    "weeks when somebody who has already decided they want a child is working out whether they can "
    "afford one and whether they trust you, and in most units I have looked at that gap is where "
    "the majority of the revenue quietly goes. If that is also true at Clearview then spending on "
    "advertising before the gap is closed simply buys more people into the same leak, so the cost "
    "of winning a cycle rises while the margin falls. I would want to count it before I would want "
    "to spend on it.",

    "The third is that the phrase cash cow is the risk in this group rather than the strength of "
    "it. If the fertility clinic carries the hospital, then you have one lumpy revenue line, sold "
    "to households paying out of savings, delivered by a very small number of people, with a third "
    "or more of the input cost priced in dollars. That is not the kind of instability better "
    "marketing fixes. Stability comes from putting something recurring underneath the lumpy thing, "
    "and you already own the two most obvious candidates, which are the hospital and the patients "
    "you have already treated.",

    "The fourth is what this document is and is not. It is not a plan and it is not a proposal, "
    "because nothing at Clearview has been counted yet and I would rather be useful than "
    "confident. It sets out four genuinely different directions the group could take, what each "
    "would cost and what would kill it, and then a set of conditionals, which is the if this is "
    "true then expect that section in the middle and the part I would read first. The last two "
    "pages are the questions I cannot answer from outside, and what I would do about them.",

    "Every number here is a range, and the ranges are calibrated rather than measured. They will "
    "move once somebody counts, which is rather the point of the last section.",

    "The natural first step is a conversation about the conditionals, because if we go through "
    "that table together you will know inside an hour which of the four directions is genuinely "
    "available to you, and so will I.",
]:
    p(t)
p("Warm regards,<br/><br/>Dr Debo Odulana<br/>"
  "<font size=8 color='#6b7280'>Founding Partner, Consult for Africa</font>", SIG)

# ================================================================= context ====
el.append(PageBreak())
sec(el, "01", "CONTEXT", "Six things that are true of this market before we look at yours.")
for t, body in [
    ("Demand has never been the problem.",
     "Infertility prevalence across this region runs well above the global average, driven by "
     "tubal factor following untreated pelvic infection and by male factor, which in most Nigerian "
     "series accounts for something between a third and a half of cases either on its own or in "
     "combination. Set that against the social weight childlessness carries here and you have a "
     "population that wants this service badly and is not shy about seeking it. Very few fertility "
     "units in this country fail because there were not enough people who needed treatment. They "
     "fail because the people who needed it could not pay for it in one instalment, or because "
     "they did not believe the clinic would tell them the truth."),
    ("This is a self pay market, and that single fact sets everything else.",
     "Almost no health scheme in Nigeria funds a cycle, so your patient pays out of savings, out "
     "of family contribution, or out of a transfer from a relative abroad, and that cheque is "
     "competing with a plot of land and a car. The clinical decision takes one consultation. The "
     "financial decision takes months, it is discussed with other people, and it is shopped "
     "against two or three other clinics. Any unit that treats the enquiry as a lead to be "
     "converted this week has misunderstood what the patient is actually doing."),
    ("Most cycles do not work, and how a unit handles that decides whether it has a business.",
     "Even in the best laboratories in the world a single fresh cycle ends in a live birth for "
     "roughly a third of women under thirty five, and for a good deal less than half of that by "
     "the early forties. So the ordinary path for a fertility patient is more than one attempt. A "
     "unit built around selling one cycle is therefore hunting a new stranger every month, while a "
     "unit built around getting a patient to a baby across two or three attempts keeps the "
     "patient, and keeps the revenue."),
    ("The frozen transfer is the most profitable thing in a fertility clinic and the most commonly "
     "wasted.",
     "There is no stimulation drug, no retrieval, no anaesthetist and no theatre list, so the cost "
     "of delivering one is a fraction of a fresh cycle while the price is typically around a "
     "third of it. In units that run the recall properly it is a substantial share of all "
     "transfers and it carries the best margin in the building. In units that do not, embryos sit "
     "in the tank, nobody telephones the patient, and the clinic goes looking for strangers "
     "instead."),
    ("Your input costs are in dollars and your prices are in naira.",
     "Stimulation drugs, culture media, catheters, disposables and most of the laboratory "
     "consumables are imported, and in a business where the drugs alone are commonly a third of "
     "the price of a cycle, it is the exchange rate rather than your pricing that sets your "
     "margin. The units that survive a currency move are the ones that reprice on a published "
     "schedule and buy consumables in planned quantities against a forecast, rather than ordering "
     "per patient at whatever the rate is that week."),
    ("The laboratory is one or two people, and that is the real fragility in the group.",
     "A clinical embryologist is among the scarcest roles in Nigerian medicine, they are actively "
     "recruited out of the country, and when yours stops the business stops, because no amount of "
     "demand converts into revenue without somebody to work the dish. It is also the first thing a "
     "serious buyer or investor examines, and a unit that depends on one pair of hands is "
     "discounted heavily for it."),
]:
    h2(t)
    p(body)

# =============================================================== the leak =====
el.append(PageBreak())
sec(el, "02", "WHERE THE MONEY GOES", "The three leaks, and which one I would close first.")
p("What follows is arithmetic on assumed numbers, not on yours. I have used a unit doing "
  "%d fresh cycles a month at an all in price around NGN %s million, which is where I would expect "
  "a nine year old consultant led clinic to sit. If those two figures are wrong the shape still "
  "holds, because what matters here is the ratios rather than the absolute values."
  % (D["cycles"], m(D["fresh_rev"] / D["cycles"], 1)))

h2("Leak one.  Between the enquiry and the first cycle.")
p("At %d cycles a month and the conversion these units typically run at before anybody owns the "
  "pathway, something in the region of %d people a month are already contacting you, and roughly "
  "nine in ten of them never cycle. Moving that conversion by five percentage points, which is "
  "what a named coordinator, a costed written package and a reply inside a day reliably achieve, "
  "is worth about %.0f more cycles a month on the enquiries you are already generating and paying "
  "nothing extra for. In money that is %s million a month, and it arrives without a single "
  "additional advertisement."
  % (D["cycles"], D["enquiries"], D["extra_cycles"], band("revenue from conversion alone")))

h2("Leak two.  The tank, and the patients you have already treated.")
p("Across nine years you will have frozen embryos for a great many patients. A recall programme "
  "that runs properly turns that into roughly %.0f frozen transfers a month at maturity, worth "
  "around NGN %s million a month at the best margin in the building, and annual storage billed "
  "to the patients whose embryos you are already paying nitrogen to keep is worth something like "
  "NGN %s million a month by the third year, at almost no cost at all. Neither of those requires "
  "you to find one new patient."
  % (D["fet"], m(D["fet_rev"], 1), m(D["storage_rev"], 1)))

h2("Leak three.  The back end, which is the one that surprises people.")
p("Every transfer that works becomes a pregnancy, and an IVF pregnancy is the most valuable "
  "obstetric booking in the country, because the caesarean rate is high, the twin rate is elevated "
  "and nobody involved is willing to take a risk. At the volumes above that is in the region of "
  "%.0f ongoing pregnancies a year and roughly %.0f caesarean sections, worth somewhere around "
  "NGN %s million a year of obstetric revenue. You own a hospital. The question is what share of "
  "that is currently delivering in it."
  % (D["pregnancies"], D["caesareans"], m(D["obstetric"], 0)))

sp(5)
el.append(card(
    "If you take one thing from this document, take this. The three leaks above are worth more "
    "than any marketing campaign you could buy, they are all inside a business you already own, "
    "and none of them requires a new patient. That is why I would count before I would spend.",
    CREAM))

sp(6)
h2("What that means for the marketing question you actually asked")
p("I am not saying do not market. I am saying that a funnel poured into a clinic that converts one "
  "enquiry in ten makes the loss larger and the cost per cycle worse, so the order matters. Close "
  "the conversion, build the recall, capture the obstetrics, and then advertise, because at that "
  "point every naira of spend lands in a business that holds on to what it catches. Doing it in "
  "the other order is how fertility clinics in this market spend a year of profit on "
  "acquisition and end the year with the same number of cycles.")

# ================================================================ options =====
el.append(PageBreak())
sec(el, "03", "FOUR DIRECTIONS", "Genuinely different businesses, not four phases of one plan.")
el.append(tbl(
    [["A", "Run the business you already have, properly",
      "Own the pathway from enquiry to cycle. A named fertility coordinator, a written and costed "
      "package, a reply inside a day, the frozen transfer recall, billed storage, and the "
      "obstetric pathway into your own hospital. Nothing new is built.",
      "NGN %s to %s m" % (m(M.OPTIONS["A"]["capital"][0], 0), m(M.OPTIONS["A"]["capital"][1], 0)),
      "NGN %s to %s m" % (m(M.OPTIONS["A"]["revenue"][0], 0), m(M.OPTIONS["A"]["revenue"][1], 0)),
      "6 to 12"],
     ["B", "A women's health business underneath the fertility business",
      "Monetise the majority of people who walk in and are not yet candidates for a cycle. "
      "Diagnostics and workup, andrology, ovulation induction and intrauterine insemination, "
      "hysteroscopy and laparoscopy, fibroid and endometriosis surgery, and the obstetrics. "
      "Recurring, unglamorous, and far less lumpy than IVF.",
      "NGN %s to %s m" % (m(M.OPTIONS["B"]["capital"][0], 0), m(M.OPTIONS["B"]["capital"][1], 0)),
      "NGN %s to %s m" % (m(M.OPTIONS["B"]["revenue"][0], 0), m(M.OPTIONS["B"]["revenue"][1], 0)),
      "9 to 18"],
     ["C", "One laboratory, many front doors",
      "Your laboratory almost certainly has headroom, because the constraint in IVF is the lab and "
      "the lab is already built. Put consultation and scanning points where the patients are, or "
      "partner the gynaecologists who have infertility patients and no laboratory, and bring "
      "retrieval and transfer back to the hub.",
      "NGN %s to %s m" % (m(M.OPTIONS["C"]["capital"][0], 0), m(M.OPTIONS["C"]["capital"][1], 0)),
      "NGN %s to %s m" % (m(M.OPTIONS["C"]["revenue"][0], 0), m(M.OPTIONS["C"]["revenue"][1], 0)),
      "12 to 24"],
     ["D", "Sell the outcome rather than the cycle",
      "Multi cycle and shared risk packages, instalment and cooperative payment, employer and "
      "diaspora schemes. It addresses the real objection, which is not price but the fear of "
      "paying once and getting nothing, and it converts a single purchase into a programme.",
      "NGN %s to %s m" % (m(M.OPTIONS["D"]["capital"][0], 0), m(M.OPTIONS["D"]["capital"][1], 0)),
      "NGN %s to %s m" % (m(M.OPTIONS["D"]["revenue"][0], 0), m(M.OPTIONS["D"]["revenue"][1], 0)),
      "9 to 18"]],
    ["", "The direction", "What it is", "Capital", "Revenue a month", "Months"],
    [8 * mm, 40 * mm, FULLW - 130 * mm, 24 * mm, 30 * mm, 14 * mm],
    aligns=["r", "r", "r", "r"], tiny=True))
p("Capital and revenue are indicative bands calibrated to the assumptions in section 02. Revenue "
  "is the addition at maturity, not the group total. The bands are wide on purpose, because their "
  "width is honest about what has not been measured.", SMALL)

sp(6)
h2("What has to be true, and what kills each one")
el.append(tbl(
    [["A", "That the enquiries are real and the leak is conversion rather than demand. Everything "
      "in A is a recall and a pathway, so it needs volume already arriving.",
      "Nothing kills it outright. It fails quietly if the coordinator role is given to somebody "
      "already doing three other jobs, which is how this is usually attempted and why it usually "
      "does not stick."],
     ["B", "That you have, or can reach, a theatre list and the imaging, and that you are willing "
      "to be known for something broader than IVF without diluting the fertility name.",
      "Standing up a full salaried establishment ahead of the volume. That turns the thing meant "
      "to stabilise the group into a fixed cost that makes a quiet month worse rather than "
      "better."],
     ["C", "That the laboratory genuinely has spare capacity, and that a referring doctor is paid "
      "transparently for the work they do and keeps the patient afterwards.",
      "Two things. Owning and salarying spokes before they have volume, and any arrangement that "
      "looks like paying for referrals rather than paying for clinical work, which is a "
      "professional conduct problem long before it is a commercial one."],
     ["D", "That you know your own live birth rate by age band, from your own records, well enough "
      "to price a package that includes the patients who need three attempts.",
      "Selling a refund or guarantee package without that outcome data. It is the single fastest "
      "way to destroy a fertility clinic, because the liability lands two years after the revenue "
      "and every patient it lands on is one who did not get a baby."]],
    ["", "What has to be true", "What kills it"],
    [8 * mm, (FULLW - 8 * mm) / 2, (FULLW - 8 * mm) / 2], tiny=True))

sp(6)
h2("Which one I would back, and the caveat attached to it")
p("I would do A first, and I would do it whatever else you decide, because it costs the least of "
  "the four by a wide margin, it works on demand you are already generating and already paying "
  "for, and because every one of the other three is actively worse if the conversion leak is still "
  "open underneath it. There is no sense in building spokes to send more people into a pathway "
  "that loses nine in ten of them, and there is certainly no sense in advertising into it.")
p("Then I would expect the choice to fall between B and C, and the honest position is that I "
  "cannot tell you which from outside, because they answer different questions. B is the answer if "
  "your constraint is that the revenue is lumpy and the group needs something recurring underneath "
  "it. C is the answer if your constraint is that demand at the top is genuinely thin and the "
  "laboratory is sitting half used. Those are opposite diagnoses and the numbers in section 05 "
  "settle which one you have.")
p("D I would hold back deliberately until you have twelve months of your own outcome data in a "
  "form you trust, because it is the most powerful conversion instrument in this market and also "
  "the only one on the list that can take the whole business down with it.")

# ============================================================ conditionals ====
sec(el, "04", "IF, THEN EXPECT", "The spine of this note. Take it to your own numbers.")
p("This is the section I would read with your management accounts and your cycle register open in "
  "front of you. Each line is a test you can run yourself this week.")
el.append(tbl(
    [["Fewer than one in six people who enquire go on to cycle",
      "Advertising to make the loss bigger rather than smaller, because every naira of new spend "
      "buys another enquiry into the same leak, so your cost per cycle rises while the margin "
      "falls. Close the pathway first."],
     ["More than half of your cycles originate in your own consulting room",
      "A business that is you rather than a business you own, which cannot grow past your clinic "
      "hours, cannot be delegated, cannot be sold for what you think it is worth, and stops "
      "entirely in the month you are unwell."],
     ["Fewer than one in five of your transfers is a frozen one",
      "Your revenue to depend on finding new strangers, permanently, because you are leaving the "
      "cheapest and highest margin cycle you will ever sell sitting in a tank."],
     ["Embryos in storage that nobody is billing an annual fee for",
      "A recurring line at almost no cost that you are giving away, and a consent and disposal "
      "exposure sitting behind it that grows every year you do not address it."],
     ["One embryologist",
      "A month with no retrievals in the quarter they travel, resign or fall ill, and a heavy "
      "discount from any buyer or investor who looks properly, because they will price the risk "
      "you are carrying for free."],
     ["Drugs bought in dollars and cycles priced in naira on a list you last revised some time ago",
      "The exchange rate rather than your pricing to set your margin, so a twenty per cent move "
      "takes a large part of the year with it before anybody notices in the accounts."],
     ["IVF pregnancies booking and delivering somewhere other than Clearview Hospital",
      "The most valuable obstetric work the group produces to be leaving the group, at something "
      "in the order of %.0f caesarean sections a year that you created and somebody else billed."
      % D["caesareans"]],
     ["More than ninety days from first contact to first cycle",
      "Most of that gap to be saving and shopping rather than deciding, which means the thing that "
      "wins the patient is the payment plan and the follow up, not the medicine and not the "
      "advertisement."],
     ["The hospital running at a loss and being carried by the clinic",
      "The cash cow framing to be concealing a cross subsidy, in which case the real question is "
      "whether the hospital is a strategy or a habit, and that question has to be answered before "
      "any of the four directions makes sense."],
     ["No live birth rate broken out by age band, from your own records",
      "Every claim you make in marketing to be unsafe, every package to be unpriceable, and your "
      "own counselling to be running on impression rather than evidence. This is the one I would "
      "fix first regardless of everything else."]],
    ["If this is true at Clearview", "Then expect"],
    [72 * mm, FULLW - 72 * mm], tiny=True))

# ========================================================== what I dont know ==
el.append(PageBreak())
sec(el, "05", "WHAT I DO NOT KNOW", "The questions that would change the answers above.")
p("I have been deliberate about the limits of this note. What follows is not a list of things I "
  "could look up. It is the list of things that decide which of the four directions is real, and "
  "none of them can be answered from outside your building.")
el.append(tbl(
    [["How many people contact you in a month, and what happens to each one",
      "Count the telephone, the messages and the walk ins for eight weeks against a simple sheet",
      "It separates a demand problem from a conversion problem, and those have opposite answers. "
      "This single count decides between A and C."],
     ["Your live birth rate, by age band, from your own records",
      "A retrospective pull across the last two to three years of cycles",
      "It sets what you can honestly claim, what you can price, and whether D is ever available "
      "to you"],
     ["How many patients have embryos in your tank, and how many have been called",
      "A day in the laboratory records and the storage log",
      "It is the fastest revenue in this document and it is sitting in a freezer"],
     ["Drug and consumable cost as a share of the price of a cycle",
      "Twelve months of purchase invoices against twelve months of cycle billing",
      "It tells you how exposed the margin is to the currency, and whether repricing or "
      "buying differently is the larger lever"],
     ["Where your patients actually come from",
      "Ask every patient at booking, for eight weeks, and record it",
      "If most trace back to you personally, the honest strategic problem is succession rather "
      "than marketing"],
     ["Whether the two companies are one business or two",
      "The accounts, the shareholdings, and how work and money pass between them today",
      "It decides whether the obstetric capture in section 02 is a transfer between your own "
      "pockets or a genuine gain, and it decides what the group is worth"],
     ["How many IVF pregnancies deliver at Clearview Hospital",
      "Cross match the pregnancy list against the delivery register",
      "It is the difference between owning a pathway and owning the first half of one"],
     ["How deep the laboratory is",
      "How many people can independently run a retrieval day, and what happens in August",
      "It caps every growth option on the list, and it is what an investor examines first"],
     ["What the clinic up the road charges, and what they promise",
      "A morning of price shopping, done properly",
      "You cannot position underneath, alongside or above somebody whose actual offer you have "
      "not read"]],
    ["What I do not know", "How it gets answered", "Why it matters"],
    [52 * mm, 48 * mm, FULLW - 100 * mm], tiny=True))

sp(5)
el.append(card(
    "Almost all of that is two to three weeks of work and none of it requires you to commit to "
    "anything. At the end of it you either have a growth plan built on measured facts, or you have "
    "an early and inexpensive reason not to proceed, and in my experience both of those are worth "
    "having.", GREEN))

# ================================================================== how we ====
el.append(PageBreak())
sec(el, "06", "HOW WE WOULD WORK", "The small first step, and nothing larger than that yet.")
p("Consult for Africa builds and runs health businesses in Nigeria. We have taken facilities "
  "through licensing, structured medical joint ventures and shareholder agreements, rebuilt tariff "
  "and payor strategies, run organisational audits for founder led practices at roughly the stage "
  "Clearview is at now, and recruited consultants, including from the diaspora.")
p("I am not proposing a programme, because I do not yet know which of the four directions is "
  "available to you and neither do you. What I would propose is the counting exercise in section "
  "05, run over about three weeks.")
el.append(tbl(
    [["1", "Count the funnel",
      "Every enquiry for the period, what happened to it, and how long each step took. This is the "
      "number that decides between a demand problem and a conversion problem."],
     ["2", "Pull the outcomes",
      "Cycles, transfers, clinical pregnancies and live births by age band across the last two to "
      "three years, presented in a form you can put in front of a patient without flinching."],
     ["3", "Open the tank",
      "Who has embryos, who has been contacted, what is billed and what is not, and the consent "
      "position on each."],
     ["4", "Trace ten patients end to end",
      "From first contact to delivery, across both companies, following the money. Ten cases tell "
      "you more about a group than a year of management accounts, because they show you where the "
      "pathway actually breaks rather than where the ledger says it did."],
     ["5", "Sit down with the answers",
      "Half a day with you and whoever else should be in the room, going through the conditionals "
      "in section 04 against real numbers, and settling which direction you are taking."]],
    ["", "What we would do", "What it involves and why it comes in this order"],
    [8 * mm, 40 * mm, FULLW - 48 * mm], tiny=True))

sp(6)
h2("On fees")
p("I would rather show you the method than quote you a figure today. The counting exercise is a "
  "small piece of work with a fixed scope, and I will price it once we have agreed what is in "
  "it, which is a conversation rather than a document. Anything that "
  "follows it would be billed as resourced time, which means named grades at published rates "
  "against the days each piece actually takes, invoiced monthly, so you never pay for a day that "
  "was not worked and anything you drop comes straight off the fee.")

sp(5)
el.append(card(
    "The natural first step is a conversation about section 04. Bring your cycle register and your "
    "last twelve months, and we can go through the conditionals line by line. If the leaks are "
    "where I think they are, you will have found the money before you have spent any. If they are "
    "not, then I have been usefully wrong early and we will both know what the real question is.",
    CREAM))
p("Dr Debo Odulana<br/><font size=8 color='#6b7280'>Founding Partner, Consult for Africa</font>",
  SIG)
sp(6)
el.append(footer_bar("Dr Debo Odulana   Consult for Africa   /   +234 913 813 8553   /   "
                     "hello@consultforafrica.com"))

doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=22 * mm, bottomMargin=18 * mm,
                      title="Clearview Fertility and Clearview Hospital: strategic options",
                      author="Consult for Africa")
doc.addPageTemplates([PageTemplate(
    id="m", frames=[Frame(MARGIN, 18 * mm, FULLW, PH - 40 * mm, id="f")],
    onPage=make_furniture("CLEARVIEW", "Fertility and Hospital   /   strategic options",
                          note="Private  /  Prepared for Dr Kunle Ajayi"))])
doc.build(el)
print("wrote %s" % OUT)
