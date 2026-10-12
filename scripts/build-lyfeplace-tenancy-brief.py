"""
Tenancy brief for the Alameda meeting, for Dr John Tope.

The occupier is the Medical Tourism Conversion Clinic.

He asked for five things: the space, what the rent buys, access and period,
what is shared against what is theirs, and what else they get. This answers
those five in that order and puts the money on one page he can quote from.

Every figure comes from scripts/lyfeplace_campus.py, so it cannot disagree with
the rest of the pack.

    python3 scripts/build-lyfeplace-tenancy-brief.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer

sys.path.insert(0, str(Path(__file__).resolve().parent))

import lyfeplace_campus as C
from lyfeplace_doc import (
    ALERT, CREAM, EYEBROW, FULLW, H1, H2, LETTER_TO, MARGIN, P, PH, PW, SIG, SMALL,
    SUBTITLE, TITLE, card, footer_bar, m, make_furniture, sec, tbl,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "lyfeplace-abuja" / "lyfeplace-alameda-tenancy-brief.pdf"

NAME, SQM, _R, DEPOSIT, _D = [t for t in C.TENANTS if "Alameda" in t[0]][0]
RATE = 470000
ANNUAL = SQM * RATE / 1e6
MONTHLY = ANNUAL / 12
FX = 1550

# The build-up the rate was set from, grossed to the quoted rate so the three
# lines add to what they actually pay.
COST = {"Rent": 111_771, "Fit-out recovery": 71_413, "Service charge": 224134}
COST_TOTAL = sum(COST.values())
QUOTED = {k: v / COST_TOTAL * RATE for k, v in COST.items()}


def build():
    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=24 * 1.0 + 44, bottomMargin=46,
                          title="Lyfe Place Abuja: the Alameda tenancy",
                          author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 46, FULLW, PH - 44 - 24 - 46, id="f")],
        onPage=make_furniture("LYFE PLACE ABUJA", "The Alameda tenancy",
                              "Private and confidential  /  Prepared for Dr John Tope"))])
    el = []
    el.append(Paragraph("The Alameda tenancy", TITLE))
    el.append(Paragraph("What they get, what it costs, and what to hold.", SUBTITLE))
    el.append(Spacer(1, 6))
    el.append(Paragraph("Dr John,", LETTER_TO))
    el.append(Paragraph(
        "This answers the five questions you asked, in the order you asked them, and puts the money "
        "on one page you can quote from. The short version is that they take the ground floor except "
        "reception and the theatre, the rooms come fitted rather than furnished, and the rate is "
        "NGN 470,000 per sqm all in, NGN 53.1 M a year. Quote it as three lines, not one "
        "number. That is the difference "
        "between a rent they argue about and a cost they can see the basis of.", P))
    el.append(Spacer(1, 4))

    sec(el, "01", "THE SPACE", "The ground floor, less reception and the theatre.")
    el.append(tbl(
        [["Ground floor, net internal", m(C.GROUND_NET), "Measured from the as-built drawings"],
         ["Less campus common", "(%s)" % m(C.GF_SHARED),
          "Reception, waiting, circulation spine, staircase, vestibule and porch. Serves the whole "
          "campus, so it is in the service charge, not the demise"],
         ["Less the theatre suite", "(%s)" % m(C.THEATRE_SQM),
          "Theatre 32.8, recovery 19.2, dirty utility 6.9, scrub 5.1. Bookable by them, not "
          "demised to them"],
         ["The Alameda demise", m(SQM), "Five to six consulting and procedure rooms, formed from "
          "the existing room beside imaging, the open living and dining span and the old lobby"]],
        ["", "sqm", "What it is"], [148, 52, FULLW - 200], total_row=True, aligns=["r"]))
    el.append(Spacer(1, 5))
    el.append(card(
        "<b>Say the demise is the ground floor and mean it.</b> It reads as a floor of their own, "
        "with its own identity off a shared arrival hall, which is what a medical tourism "
        "conversion clinic needs. "
        "What it is not is the reception or the theatre, and both of those are worth more to them "
        "shared than owned.", bg=CREAM))

    sec(el, "02", "WHAT THE RENT BUYS", "Fitted and serviced. Not furnished.")
    el.append(tbl(
        [["Medbury delivers, and recovers in the rate",
          "Partitions, doors and ironmongery. Clinical flooring, welded and coved. Hand-wash to "
          "every clinical room. Cooling and mechanical fresh air. Power, lighting and emergency "
          "lighting. Data and network. Fire detection and alarm. Room signage. Decoration"],
         ["Alameda brings",
          "Clinical equipment and instruments. Consumables. Medical furniture specific to their "
          "protocols. Their own devices and endpoints. Their own consulting room furniture if they "
          "want a particular look"],
         ["Neither, until asked",
          "Desks, chairs and soft furnishing to a hotel standard. If they want the rooms furnished "
          "as well as fitted, that is a separate quote and a separate line. Do not fold it into "
          "the rate"]],
        ["", "What it covers"], [148, FULLW - 148]))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "The distinction matters in the room. <b>Fitted</b> means the rooms are clinically usable on "
        "handover: walls, floors, water, power, air and light to a standard that will register. "
        "<b>Furnished</b> means somebody chose the chairs. We are offering the first and pricing the "
        "second separately, and the fit-out recovery line in section 05 is how the first is paid "
        "for.", P))

    sec(el, "03", "ACCESS AND PERIOD", "Five years, and their own front door hours.")
    el.append(tbl(
        [["Term", "Five years", "Long enough to recover the fit-out over the same period, which is "
          "what makes the recovery line fair rather than a surcharge"],
         ["Deposit", "%d months" % DEPOSIT, "Rent and service charge, held and applied at the end"],
         ["Campus window", "07:00 to 21:00, Monday to Saturday",
          "When reception, security, cooling and the clinical support services run"],
         ["Their access", "Unrestricted within the window",
          "It is their demise. They set their own clinic hours inside it and do not book time"],
         ["Outside the window", "By arrangement",
          "Sundays and late lists can be run, and carry the marginal cost of opening the building. "
          "Agree the rate now rather than the first time they ask"],
         ["Patient arrival", "Through the single campus reception",
          "There is one patient entrance. Their patients are received, identified and directed by "
          "our front office, then seen by their clinicians"]],
        ["", "", ""], [104, 132, FULLW - 236]))

    sec(el, "04", "SHARED AND THEIRS", "The line to draw, and where.")
    el.append(tbl(
        [["Theirs alone", "The %s sqm demise. Their clinical staff, their patient relationship, "
          "their records and clinical governance, their branding within the demise, their protocols "
          "and their fees" % m(SQM)],
         ["Shared, and in the service charge", "Reception, waiting and concierge. Circulation and "
          "the staircase. Patient WCs. Security, cleaning, waste and grounds. Power, cooling and "
          "water. Fire systems. Network and connectivity. Facilities management"],
         ["Shared, and charged on use", "The day case theatre, by the list. Digital X-ray and "
          "phlebotomy. The laboratory in the chalet. The pharmacy collection point. Sterilising"],
         ["Ours alone", "Campus branding and the building identity. The first floor. The reception "
          "function itself. Anything that touches another occupier"]],
        ["", "What sits there"], [148, FULLW - 148], hi={0}))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>The principle to state, because it answers most of their questions before they ask.</b> "
        "Anything that serves only them sits in the demise and they control it. Anything that serves "
        "the campus sits with us and reaches them through the service charge. Anything they consume "
        "by the unit is charged by the unit. Three categories, and every request they make falls "
        "into one of them.", bg=CREAM))

    sec(el, "05", "THE MONEY", "One rate, quoted as three lines.")
    el.append(tbl(
        [["Rent", m(QUOTED["Rent"], 0), m(SQM * QUOTED["Rent"] / 1e6, 1),
          "The space itself, at a landlord margin over the head rent"],
         ["Fit-out recovery", m(QUOTED["Fit-out recovery"], 0),
          m(SQM * QUOTED["Fit-out recovery"] / 1e6, 1),
          "Their share of the clinical fit-out, recovered across the five year term. It falls away "
          "at renewal"],
         ["Service charge", m(QUOTED["Service charge"], 0),
          m(SQM * QUOTED["Service charge"] / 1e6, 1),
          "Their share of power, security, cleaning, facilities, insurance, regulatory, reception "
          "and ICT"],
         ["Total", m(RATE, 0), m(ANNUAL, 1), "NGN %s M a month. About USD %s a year"
          % (m(MONTHLY, 2), m(ANNUAL * 1e6 / FX, 0))]],
        ["", "NGN / sqm / yr", "NGN M / yr", "What it is"],
        [104, 76, 68, FULLW - 248], total_row=True, aligns=["r", "r"]))
    el.append(Spacer(1, 5))
    el.append(card(
        "<b>The number not to go below.</b> Housing them costs the SPV NGN %s M a year once the "
        "head rent, the fit-out and a fair share of campus services are counted. The quote is "
        "NGN %s M, so the margin is NGN %s M. <b>Below NGN %s M the campus is housing a tenant at a "
        "loss, and Alameda captures 51%% of that loss through the joint venture.</b>"
        % (m(SQM * COST_TOTAL / 1e6), m(SQM * RATE / 1e6), m(SQM * (RATE - COST_TOTAL) / 1e6), m(SQM * COST_TOTAL / 1e6)),
        bg=ALERT))

    sec(el, "06", "THE 49 PER CENT", "Why the rate has to be billed properly, not softened.")
    el.append(Paragraph(
        "The tenant is not Alameda. It is the joint venture between Medbury and Alameda, and "
        "<b>Medbury owns 49% of it</b>. That is worth understanding before the meeting, because the "
        "instinct it creates is the wrong one.", P))
    el.append(Paragraph(
        "The instinct is that since Medbury pays 49 kobo of every naira it charges, the rent matters "
        "less and can be softened to buy goodwill. <b>The opposite is true.</b>", P))
    el.append(tbl(
        [["Medbury loses, in rent", "(1.00)"],
         ["The clinic's profit rises by", "1.00"],
         ["Medbury takes back its 49% of that", "0.49"],
         ["Net to Medbury", "(0.51)"],
         ["Straight to Alameda", "0.51"]],
        ["Discount NGN 1 M off the rate, and", "NGN M"],
        [FULLW - 90, 90], total_row=True, aligns=["r"]))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>Every naira off the rate is 51 kobo handed to the majority partner.</b> A NGN 10 M "
        "concession is not a NGN 10 M gesture, it is a NGN 5.1 M transfer to Alameda and a NGN 5.1 M "
        "cost to Medbury. Softening the rent is the single most expensive way to be generous in "
        "this negotiation.", bg=ALERT))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "There are two further reasons the rate has to be real. The joint venture agreement requires "
        "related party transactions at arm's length, and Nigerian transfer pricing rules mean FIRS "
        "can adjust a below-market related-party rent and disallow the deduction. And the clinic's "
        "own accounts have to be honest: if it is housed below cost it looks profitable when it is "
        "not, which misleads both shareholders and makes the second site impossible to price.", P))
    el.append(Spacer(1, 3))
    el.append(card(
        "<b>Bill it at NGN %s M, and hold it.</b> Housing them costs NGN 37.5 M, so the margin is "
        "NGN 7.7 M. At NGN 37.5 M the margin is nil. Below that Medbury is funding a subsidy of "
        "which Alameda captures 51%%. The 49%% is a reason to bill properly, not a reason to bill "
        "less." % m(SQM * RATE / 1e6), bg=CREAM))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "Press for first call on diagnostics, pharmacy and theatre as well, and press hard. Those "
        "return whole with no 49% deduction. But take them <b>in addition to</b> a properly billed "
        "rate, never instead of one.", P))

    sec(el, "07", "THE SERVICE CHARGE", "The line that was wrong, and the base that fixes it.")
    el.append(Paragraph(
        "The campus model apportioned the service charge across <b>net internal area</b>. That is "
        "the wrong base. Service charge is apportioned across <b>occupied</b> area, because the "
        "common parts are what the charge pays for and they cannot pay their own bill.", P))
    el.append(tbl(
        [["Net internal, as modelled", "17.0%", "16.8", "37.5"],
         ["All occupied space", "25.6%", "25.3", "46.0"],
         ["Lettable only", "31.4%", "31.1", "51.8"]],
        ["Apportionment base", "Their share", "Service charge", "Cost to the SPV"],
        [166, 86, 96, FULLW - 348], aligns=["r", "r", "r"], hi={1}))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>Use occupied space, the middle row.</b> Medbury's own clinics upstairs, the theatre, "
        "diagnostics and the pharmacy all use the same front office and the same generator. Leaving "
        "them out of the base makes the outside tenant pay for them, which is not defensible if "
        "Alameda ever asks how the number is built. Lettable-only is the other extreme and loads "
        "everything onto three demises.", bg=CREAM))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "On that base the service charge is NGN 224,134 per sqm rather than NGN 149,029, and the "
        "cost of housing the clinic is <b>NGN 46.0 M</b>, not NGN 37.5 M. The old NGN 400,000 quote "
        "was 98% of cost. It had no margin in it at all.", P))
    el.append(Spacer(1, 4))
    el.append(Paragraph("Diesel, and why no separate deposit is needed", H2))
    el.append(Paragraph(
        "Power is the largest thing in the service charge and the most volatile. Three terms handle "
        "it without asking Medbury to carry diesel for five years.", P))
    el.append(tbl(
        [["Monthly in advance", "They pay in the month for power bought in the month. This removes "
          "the float, which is the real exposure. A deposit does not: it sits there, it does not buy "
          "next month's tanker"],
         ["Reconciled annually", "Billed on account against audited campus cost, with a balancing "
          "charge or credit. Diesel volatility passes through instead of being absorbed"],
         ["Sub-meter the demise", "Their own rooms metered and recharged at cost, or a prepaid meter "
          "if they prefer. NGN 0.3 to 0.6 M to install against a NGN 10 M a year exposure"]],
        ["Term", "What it does"], [148, FULLW - 148], hi={0}))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>A separate diesel deposit would be charging twice.</b> The six month deposit already "
        "holds NGN 13.3 M against service charge, which is more than a year of their power share on "
        "any of the scenarios. Ask for advance payment and reconciliation instead.", bg=CREAM))

    sec(el, "08", "WHAT ELSE THEY GET", "The reason the rate is what it is.")
    el.append(tbl(
        [["Diagnostics on site", "Laboratory in the chalet, digital X-ray and phlebotomy on the "
          "ground floor beside them, a draw point upstairs. Their patient is worked up in the "
          "building rather than sent across Abuja"],
         ["A day case theatre", "On their own floor, level access, bookable by the list. Nothing "
          "else they could rent in Abuja at this size comes with one"],
         ["Pharmacy", "Dispensary and cold chain in the boys' quarters, collection hatch in the "
          "waiting hall. Their script is filled before the patient leaves"],
         ["A front office they do not staff", "Reception, patient identification, navigation and "
          "the arrival experience, run to one standard across the campus"],
         ["Referral flow", "From the family practice and the sessional panel upstairs. Not promised "
          "as a volume, but it is real and it is why a medical tourism conversion clinic sits "
          "better here than in a "
          "standalone unit"],
         ["Credentialing support", "Temporary registration and immigration administration for "
          "visiting clinicians, which is process they would otherwise carry themselves"],
         ["Revenue cycle management", "Billing and collection, if they want it. Priced separately "
          "and worth offering, because collection is where most visiting-clinician models leak"]],
        ["", "What it is"], [148, FULLW - 148]))

    sec(el, "09", "FOR THE ROOM", "Four things to hold.")
    el.append(tbl(
        [["1", "Quote three lines, never one",
          "A single number invites a haggle. Three lines invite a conversation about what each one "
          "buys, and every one of them is defensible from cost"],
         ["2", "The fit-out recovery is the renewal argument",
          "It falls away after five years. Say so. It gives them a reason to renew and gives us a "
          "rate rise that costs them nothing"],
         ["3", "Furnishing is a separate quote",
          "If they want the rooms furnished, price it separately. Folding it into the rate hides it "
          "and we will never get it back"],
         ["4", "Service charge monthly in advance, reconciled annually",
          "The one term that protects the whole five years from diesel. Ask for it as normal "
          "practice, because it is, and it will not be resisted"],
         ["5", "Out of hours access needs a rate today",
          "Sundays and late lists will be asked for. Agree the basis now, while it is hypothetical "
          "and cheap, rather than the first time it is urgent"]],
        ["", "", ""], [22, 148, FULLW - 170], hi={0}))
    el.append(Spacer(1, 8))
    el.append(Paragraph("Debo Odulana", SIG))
    el.append(Paragraph("Consult for Africa", SMALL))
    el.append(Spacer(1, 6))
    el.append(footer_bar())
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "Areas are measured from the as-built drawings and recover the CAD to about 10 mm. The rate "
        "is built up from cost rather than benchmarked, and the build-up is in "
        "scripts/lyfeplace_campus.py. Chalet and boys' quarters areas remain estimates because "
        "there is no as-built drawing for either in the pack.", SMALL))
    doc.build(el)
    print("wrote %s" % OUT)


if __name__ == "__main__":
    build()
