"""
Specialty strategy for Lyfe Place Abuja: what to build, what it costs, who already has it.

Written because the specialty mix was being chosen from what the building could
hold rather than from where the demand and the competition actually are.

The finding that reframes it: three of the four specialties driving Nigeria's
medical tourism outflow (oncology, cardiology, haematology) are exactly what the
African Medical Centre of Excellence opened in Abuja with, backed by Afreximbank
and King's College Hospital, at 170 beds going to 500, five theatres, three
catheterisation laboratories and a 20-bed intensive care unit. That market is
taken. Lyfe Place's opportunity is the ambulatory layer, not the quaternary one.

Demand figures are sourced and cited. Capex figures are ranges and need quotes.

    python3 scripts/build-lyfeplace-specialty-strategy.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lyfeplace_doc import (ALERT, CREAM, FULLW, GREEN, H2, LETTER_TO, MARGIN, P, PH, SIG,
                           SMALL, SUBTITLE, TITLE, card, footer_bar, make_furniture, sec, tbl)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "lyfeplace-abuja" / "lyfeplace-specialty-strategy.pdf"


def build():
    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=68, bottomMargin=46,
                          title="Lyfe Place Abuja: specialty strategy",
                          author="Consult for Africa")
    doc.addPageTemplates([PageTemplate(
        id="p", frames=[Frame(MARGIN, 46, FULLW, PH - 68 - 46, id="f")],
        onPage=make_furniture("LYFE PLACE ABUJA", "Specialty strategy",
                              "Private and confidential  /  Medbury Healthcare Group"))])
    el = []
    el.append(Paragraph("Which specialties, and what they cost", TITLE))
    el.append(Paragraph("Demand, competition and capital, for the Abuja campus.", SUBTITLE))
    el.append(Spacer(1, 8))
    el.append(card(
        "<b>One thing has changed the answer.</b> Three of the four specialties that drive Nigeria's "
        "medical tourism outflow are exactly what the African Medical Centre of Excellence opened in "
        "Abuja with. It is backed by Afreximbank and King's College Hospital and runs 170 beds going "
        "to 500, five theatres, three catheterisation laboratories, a 20-bed intensive care unit and "
        "the largest stem cell laboratory in the region. <b>Oncology, cardiology and haematology in "
        "Abuja are now taken.</b> The opportunity for this campus is the ambulatory layer beneath "
        "and beside that, which AMCE will not serve and does not want.", bg=ALERT))

    sec(el, "01", "WHERE THE DEMAND IS", "Four specialties carry most of the outflow.")
    el.append(tbl(
        [["Outbound medical spend, 2025", "USD 685 M", "Up from 643 M in 2024. Q3 2025 alone was "
          "208 M, about 18% above the same quarter a year earlier"],
         ["Concentration", "About 60%", "Of outbound travel is driven by four specialties: "
          "oncology, cardiology, nephrology and orthopaedic surgery"],
         ["Oncology alone", "About 40%", "Of cases"],
         ["Abuja cancer incidence", "144.1", "Age-standardised rate per 100,000, Abuja Cancer "
          "Registry 2009 to 2016"],
         ["Hypertension, North Central", "38.1%", "Among the highest regional point estimates in "
          "the country"],
         ["Diabetes, rural Abuja", "4.4%", "Against a national average of 2.2%"]],
        ["Signal", "Figure", "Detail"], [150, 76, FULLW - 226], aligns=["r", "l"]))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "The demand case for the big four is not in doubt. The question is whether this building can "
        "serve any of it, and whether anyone has got there first.", P))

    sec(el, "02", "WHO ALREADY HAS IT", "The Abuja competitive set.")
    el.append(tbl(
        [["African Medical Centre of Excellence", "Quaternary, opened 2025",
          "Oncology, haematology, cardiology. 170 beds to 500, five theatres, three cath labs, "
          "20-bed ICU, 20 chemotherapy chairs, regional stem cell laboratory"],
         ["Cedarcrest Hospitals", "Tertiary private",
          "Cardiac surgery, neurology, orthopaedics, oncology, NICU. The established private "
          "reference point in the FCT"],
         ["Nizamiye Hospital", "Tertiary private", "General and specialist, the other premier "
          "private name in Abuja"],
         ["NISA Premier Hospital", "Private", "Maternity, fertility, surgical, diagnostic"],
         ["Private Care Specialist Fertility", "Single specialty", "ART, fibroid surgery and "
          "obstetrics, Gwarinpa"],
         ["National Hospital Abuja", "Federal tertiary", "The public reference centre"]],
        ["Provider", "Position", "What they cover"], [160, 104, FULLW - 264], aligns=["l", "l"]))
    el.append(Spacer(1, 4))
    el.append(card(
        "<b>Read the first two rows together.</b> Between them AMCE and Cedarcrest hold oncology, "
        "cardiac and haematology, with beds, theatres, catheterisation and intensive care behind "
        "them. A campus with no beds, no ICU and one lift-less staircase cannot take them on, and "
        "should not try.", bg=CREAM))

    sec(el, "03", "WHAT THIS BUILDING CAN HOST", "Four hard filters.")
    el.append(tbl(
        [["Ambulatory only", "No beds, no intensive care, no overnight stay. Every patient goes "
          "home the same day"],
         ["Sedation on the ground floor only", "There is no lift, so a sedated patient cannot be "
          "evacuated from the first floor. The theatre and anything needing sedation sit on the "
          "ground"],
         ["One reception", "About 98 arrivals a day sustained. A high-volume specialty has to earn "
          "its share of that, and an all-day single-patient specialty is worth more per arrival "
          "than a high-churn one"],
         ["Cash-pay", "The patients this campus can reach pay out of pocket or through a corporate "
          "scheme. Specialties that depend on public reimbursement do not work here"]],
        ["Filter", "What it rules in and out"], [150, FULLW - 150], aligns=["l"]))

    sec(el, "04", "THE SPECIALTIES, ASSESSED", "Demand, competition, fit and capital.")
    el.append(tbl(
        [["Aesthetics and regenerative", "High", "Thin", "Excellent", "25 to 45", "BUILD"],
         ["Hair restoration, FUE", "High", "Almost none", "Excellent", "12 to 20", "BUILD"],
         ["Bariatric and metabolic, medical", "Very high", "Thin", "Excellent", "8 to 15", "BUILD"],
         ["Longevity and infusion", "Growing", "Thin", "Excellent", "15 to 25", "BUILD"],
         ["Dermatology", "High", "Thin", "Excellent", "8 to 14", "BUILD"],
         ["Endoscopy and GI day case", "High", "Moderate", "Good, needs the theatre", "35 to 60",
          "PHASE 2"],
         ["Ophthalmology day surgery", "Very high", "Moderate", "Good", "45 to 80", "PHASE 2"],
         ["Orthopaedics, day case and paediatric", "High", "Strong", "Good, X-ray is here",
          "10 to 18", "PHASE 2"],
         ["Nephrology and dialysis", "Very high", "Moderate", "Possible, water and space heavy",
          "90 to 160", "EVALUATE"],
         ["Fertility and IVF", "High", "Strong", "Possible", "120 to 220", "EVALUATE"],
         ["Oncology", "Highest", "AMCE, Cedarcrest", "No. Needs beds and ICU", "very high", "AVOID"],
         ["Cardiac surgery", "High", "AMCE, Cedarcrest", "No. Needs ICU and cath lab", "very high",
          "AVOID"],
         ["Haematology and stem cell", "Niche", "AMCE", "No", "very high", "AVOID"]],
        ["Specialty", "Demand", "Competition", "Fit with the building", "Capex NGN M", "Call"],
        [138, 50, 76, 108, 62, 54], aligns=["l", "l", "l", "r", "l"], tiny=True,
        verdict_col=5))
    el.append(Spacer(1, 3))
    el.append(Paragraph(
        "Capex is the clinical fit-out and equipment for that specialty only. It excludes the "
        "building, the theatre and the shared services, which the campus carries anyway. Ranges are "
        "indicative and need quotes before anything is committed.", SMALL))

    sec(el, "05", "WHAT TO BUILD", "Three tiers, and why.")
    el.append(Paragraph("Tier one, now", H2))
    el.append(Paragraph(
        "Five specialties at NGN 68 M to 119 M of clinical capital between them. Every one is "
        "cash-pay, ambulatory, uncontested in Abuja at any scale, and already in the plan. This is "
        "the tier that makes the campus work, and none of it depends on the theatre.", P))
    el.append(Spacer(1, 3))
    el.append(Paragraph("Tier two, with the theatre", H2))
    el.append(Paragraph(
        "Endoscopy, ophthalmic day surgery and day case orthopaedics all need the theatre or the "
        "imaging that is already here, and all three are genuine volume. <b>Ophthalmology is the "
        "one most often overlooked</b>: cataract surgery is high volume, entirely ambulatory, and "
        "the demand in the North is substantial. Day case orthopaedics is worth taking even against "
        "Cedarcrest, because fracture follow-up, injections and paediatric work are clinic business "
        "that a tertiary centre does not want.", P))
    el.append(Spacer(1, 3))
    el.append(Paragraph("Tier three, evaluate on their own merits", H2))
    el.append(Paragraph(
        "Dialysis and fertility both have real demand and both are ambulatory, but each is a "
        "different business rather than another room on this campus. Dialysis needs water treatment, "
        "a dedicated plant room and a recurring consumables chain, and the federal subsidy at "
        "NGN 12,000 a session has reset what patients expect to pay. Fertility needs a laboratory to "
        "a different standard and faces two established Abuja providers. Neither is wrong. Both need "
        "their own case.", P))

    sec(el, "06", "THE STRATEGIC CONSEQUENCE", "What AMCE means for the conversion clinic.")
    el.append(card(
        "<b>This needs saying before the joint session, not after it.</b> The conversion clinic's "
        "thesis is that Nigerian patients needing complex care go abroad, and that we can organise "
        "that journey. AMCE's thesis is that those same patients no longer need to. They are "
        "competing for one patient, and AMCE is in Abuja with beds, theatres and a King's College "
        "Hospital clinical partnership.", bg=ALERT))
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "That does not kill the conversion clinic. Outbound spend still rose in 2025 and Egypt "
        "competes on price and waiting time rather than on proximity. But it does mean two things. "
        "The conversion clinic should be positioned on what Egypt does better or cheaper rather "
        "than on access as such. And <b>the campus should not bet on conversion alone</b>: the "
        "ambulatory tier one specialties are the reliable business, and the conversion clinic is "
        "the upside on top.", P))
    el.append(Spacer(1, 3))
    el.append(card(
        "There is a friendlier reading worth testing in the room. A quaternary centre with 170 beds "
        "needs ambulatory feeders and does not want clinic work. Lyfe Place could be a referrer into "
        "AMCE as readily as a competitor with it, and that conversation is worth having early rather "
        "than after both sides have chosen their positions.", bg=GREEN))

    sec(el, "07", "WHAT TO VERIFY", "Before capital is committed.")
    el.append(tbl(
        [["Capex quotes", "Every figure in section 04 is a range from market reporting, not a "
          "quotation. Three quotes per specialty before any order"],
         ["AMCE's actual service lines", "What they have opened with against what they have "
          "announced. A 500-bed plan is not 500 beds today, and the gap is where the next two years "
          "sit"],
         ["Abuja cataract and endoscopy volumes", "The two tier two specialties where the demand "
          "case rests on national rather than FCT data"],
         ["Dialysis economics after the subsidy", "The federal subsidy has moved the price patients "
          "expect. A private unit has to be priced against NGN 12,000, not against what it cost "
          "last year"],
         ["Corporate and embassy schemes", "Abuja's cash-pay market is unusually weighted to "
          "diplomatic and government-linked schemes. Which of them cover which specialty decides "
          "the realistic ticket"]],
        ["Item", "Why"], [150, FULLW - 150], aligns=["l"]))
    el.append(Spacer(1, 8))
    el.append(Paragraph("Debo Odulana", SIG))
    el.append(Paragraph("Consult for Africa", SMALL))
    el.append(Spacer(1, 6))
    el.append(footer_bar())
    el.append(Spacer(1, 4))
    el.append(Paragraph(
        "Demand figures from Nigerian outbound medical travel reporting for 2024 and 2025, the Abuja "
        "Cancer Registry, and published prevalence studies for North Central and North West Nigeria. "
        "Competitive detail from provider public statements. Capital ranges are indicative and "
        "assembled from market reporting rather than quotations. Not a binding offer.", SMALL))
    doc.build(el)
    print("wrote %s" % OUT)


if __name__ == "__main__":
    build()
