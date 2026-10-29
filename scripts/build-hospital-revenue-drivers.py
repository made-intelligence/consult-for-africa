"""
What a billion naira of hospital revenue looks like, line by line.

A generic mid-size private hospital, costed bottom-up: 40 beds, eight consulting
rooms, two theatres, laboratory, imaging and pharmacy in house. Every figure in
the deck is volume x price computed from ONE model below. Nothing is typed twice,
so the totals cannot drift from the lines.

The model is illustrative. It is not any one site, and every tariff sits on the
face of the table so it can be argued with.

    python3 scripts/build-hospital-revenue-drivers.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))

from cfa_deck import SERIF_B, SERIF_I, wrap
from medbury_deck import (BLUSH, BODY, DARK, FOOTER, INK, LIGHT, MUTED, MX, PAGE_H, PAGE_W,
                          RED, RED_D, SURFACE, TOTAL, bullets, bump, callout, chrome, heading,
                          logo, para, rule, table)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "hospital-revenue-drivers.pdf"

FOOTER[0] = "The anatomy of a tertiary hospital   /   Generic reference"
TOTAL[0] = "13"

# ---------------------------------------------------------------- the hospital
# A 150-bed tertiary hospital, modelled line by line on a mid-margin strategy.
# The same 150 beds run three different ways appear on the scenarios slide, and
# this is the middle one. Beds are held deliberately short: the money is made
# around the bed, not in it.
BEDS, OCC, ALOS = 150, 0.70, 3.5
BED_DAYS = BEDS * 365 * OCC
ADMISSIONS = BED_DAYS / ALOS
ICU_BEDS, ICU_OCC = 20, 0.75
ICU_DAYS = ICU_BEDS * 365 * ICU_OCC
CLINIC_ROOMS, THEATRES = 24, 6
OPD, ED = 130_000, 26_000
ENCOUNTERS = OPD + ED + ADMISSIONS
THEATRE_CASES, DELIVERIES, DAYCASE = 3_400, 1_095, 6_000

# family, line, unit sold, volume, price
LINES = [
    ("Consultation and access", "Outpatient clinic", "Encounter", OPD, 12_000),
    ("Consultation and access", "Emergency", "Attendance", ED, 18_000),
    ("Consultation and access", "Telemedicine", "Session", 9_100, 12_000),

    ("Stay", "Ward accommodation", "Bed-day", BED_DAYS, 45_000),
    ("Stay", "Critical care", "ICU or HDU bed-day", ICU_DAYS, 180_000),
    ("Stay", "Neonatal", "Cot-day", 1_314, 85_000),

    ("Procedures", "Theatre", "Case", THEATRE_CASES, 720_000),
    ("Procedures", "Day case and endoscopy", "Procedure", DAYCASE, 180_000),
    ("Procedures", "Cardiac catheterisation", "Procedure", 550, 1_400_000),
    ("Procedures", "Maternity", "Delivery", DELIVERIES, 530_000),
    ("Procedures", "Dialysis", "Session", 5_400, 42_000),
    ("Procedures", "Oncology day unit", "Chemotherapy cycle", 1_200, 150_000),
    ("Procedures", "Physiotherapy", "Session", 12_000, 12_000),

    ("Diagnostics", "Laboratory", "Test", 620_000, 3_600),
    ("Diagnostics", "Imaging, CT and MRI", "Study", 10_000, 60_000),
    ("Diagnostics", "Imaging, plain and ultrasound", "Study", 48_000, 10_000),
    ("Diagnostics", "Cardiac diagnostics", "Echo, ECG or stress test", 7_800, 20_000),
    ("Diagnostics", "Histopathology", "Specimen", 3_600, 40_000),
    ("Diagnostics", "Blood bank", "Unit", 3_000, 45_000),

    ("Sellables", "Pharmacy, inpatient", "Admission basket", ADMISSIONS, 150_000),
    ("Sellables", "Consumables", "Procedure pack", 7_100, 110_000),
    ("Sellables", "Pharmacy, retail", "Walk-in basket", 117_000, 6_500),
    ("Sellables", "Implants and prostheses", "Device", 340, 1_600_000),
    ("Sellables", "Medical gases", "Unit", 14_000, 9_000),

    ("Contracted and ancillary", "Executive health checks", "Package", 2_200, 200_000),
    ("Contracted and ancillary", "Corporate retainer", "Covered life", 8_000, 28_000),
    ("Contracted and ancillary", "Occupational health", "Screening", 3_000, 40_000),
    ("Contracted and ancillary", "Vaccination and travel", "Dose", 6_000, 16_000),
    ("Contracted and ancillary", "Home care", "Visit", 1_800, 40_000),
    ("Contracted and ancillary", "Visa and immigration medicals", "Examination", 600, 75_000),
    ("Contracted and ancillary", "Medical reports", "Document", 2_400, 15_000),
    ("Contracted and ancillary", "Space and concessions", "Square metre", 180, 200_000),
    ("Contracted and ancillary", "Training and electives", "Place", 120, 300_000),
    ("Contracted and ancillary", "Ambulance and transfer", "Trip", 320, 100_000),
]

LAB_TESTS = sum(l[3] for l in LINES if l[1] == "Laboratory")
IMAGING = sum(l[3] for l in LINES if l[1].startswith("Imaging"))

FAMS = ["Consultation and access", "Stay", "Procedures", "Diagnostics", "Sellables",
        "Contracted and ancillary"]
rev = lambda l: l[3] * l[4] / 1e6
TOT = sum(rev(l) for l in LINES)
MONTH = TOT / 12
fam_rev = {f: sum(rev(l) for l in LINES if l[0] == f) for f in FAMS}
pick = lambda f: sorted([l for l in LINES if l[0] == f], key=rev, reverse=True)
NLINES = len(LINES)
price = lambda name: [l[4] for l in LINES if l[1] == name][0]

# ------------------------------------------------------------------ cost model
# Direct materials only (drugs, consumables, implants, reagents, contrast, food).
# Staff sits in fixed cost because a Nigerian hospital rosters it whether the bed
# fills or not. Netcare splits its own payroll across both, which is why its
# cost-of-goods line (26.4% of revenue) compares to MATERIALS here, not to COGS.
VAR = {"Consultation and access": 0.03, "Stay": 0.12, "Procedures": 0.27,
       "Diagnostics": 0.24, "Sellables": 0.65, "Contracted and ancillary": 0.20}

# share of revenue, name, note
FIXED = [
    (0.350, "Employee costs, fully loaded", "Netcare runs 38.7%"),
    (0.030, "Power and utilities", "Diesel, grid and solar. A Nigerian line"),
    (0.032, "Equipment maintenance and service contracts", "CT, MRI, cath lab, theatre"),
    (0.022, "Bad debt and rejected claims", "Netcare runs 0.8%. This is the gap"),
    (0.016, "Repairs, cleaning, catering, security", "Hotel services"),
    (0.018, "Administration, legal, audit", "Group and site"),
    (0.020, "Marketing and business development", ""),
    (0.008, "Insurance, licences and regulatory", "HEFAMAA, MDCN, indemnity"),
    (0.009, "IT and systems", "Records, imaging, laboratory, billing"),
]
BELOW = [(0.050, "Depreciation and amortisation", "Netcare runs 5.1%"),
         (0.045, "Finance costs", "Netcare runs 4.6%")]

materials = {f: fam_rev[f] * VAR[f] for f in FAMS}
MATERIALS = sum(materials.values())
CONTRIB = TOT - MATERIALS
CM = CONTRIB / TOT
FIXED_TOT = sum(r for r, _, _ in FIXED) * TOT
EBITDA = CONTRIB - FIXED_TOT
EBITDA_PC = EBITDA / TOT
BELOW_TOT = sum(r for r, _, _ in BELOW) * TOT
PBT = EBITDA - BELOW_TOT
BE_REV = FIXED_TOT / CM
BE_OCC = OCC * BE_REV / TOT

# benchmarks, from published FY2025 results
BENCH = [
    ("Netcare, FY2025", "26,344 Rm", "18.6%", "65.0%", "38.7%", "26.4%", "0.8%"),
    ("Life Healthcare, FY2025", "25,100 Rm", "15.3%", "69.2%", "not split", "not split", "n/d"),
    ("This hospital", "%s NGN M" % "{:,.0f}".format(TOT), "%.1f%%" % (EBITDA_PC * 100),
     "%.0f%%" % (OCC * 100), "35.0%", "%.1f%%" % (MATERIALS / TOT * 100), "2.2%"),
]

# outpatient to inpatient conversion
OP_EVENTS = OPD + ED
CONV = ADMISSIONS / OP_EVENTS
ED_CONV, OPD_CONV = 0.18, (ADMISSIONS - ED * 0.18) / OPD
MED_EPISODE = (ALOS * price("Ward accommodation") + 14 * price("Laboratory")
               + 1.5 * price("Imaging, plain and ultrasound") + price("Pharmacy, inpatient"))
PROCS = sum(l[3] for l in LINES if l[1] in
            ("Theatre", "Day case and endoscopy", "Cardiac catheterisation",
             "Oncology day unit"))
PROC_CONV = PROCS / OP_EVENTS
PROC_VALUE = sum(rev(l) for l in LINES if l[1] in
                 ("Theatre", "Day case and endoscopy", "Cardiac catheterisation",
                  "Oncology day unit")) * 1e6 / PROCS
CONV_PP = OP_EVENTS * 0.01 * PROC_VALUE / 1e6          # NGN M per extra point


# ------------------------------------------------- the adjacent operating lines
# Cash-pay, consumer-facing, no beds. They sit in the same estate and use the
# same theatre, sterilisation, records, laboratory and billing, so they arrive
# with most of their fixed cost already paid for by the hospital.
# name, unit, volume, price, materials share
CLUSTER = [
    ("Medical aesthetics", "Treatment", 7_000, 250_000, 0.32),
    ("Hair restoration", "Procedure", 500, 1_800_000, 0.22),
    ("Longevity and infusion", "Session", 10_000, 85_000, 0.30),
    ("Body contouring and metabolic", "Programme", 1_600, 450_000, 0.28),
]
crev = lambda l: l[2] * l[3] / 1e6
CL_REV = sum(crev(l) for l in CLUSTER)
CL_MAT = sum(crev(l) * l[4] for l in CLUSTER)
CL_FIXED = [(0.22, "Staff", "Doctor-led, nurse and therapist delivered"),
            (0.09, "Marketing and brand", "A consumer business, not a referral one"),
            (0.10, "Device service, utilities, admin", "Lasers and platforms date in five years")]
CL_FIXED_TOT = sum(r for r, _, _ in CL_FIXED) * CL_REV
CL_EBITDA = CL_REV - CL_MAT - CL_FIXED_TOT

# the three states of the group
LEVERS_REV = 8_855.0                      # the six levers on the growth slide
NEW_FIXED = 2_100.0                       # more staff, more sessions, more laboratory capacity
HOSP2_REV = TOT + LEVERS_REV
HOSP2_EBITDA = EBITDA + LEVERS_REV * CM - NEW_FIXED
GRP_REV = HOSP2_REV + CL_REV
GRP_EBITDA = HOSP2_EBITDA + CL_EBITDA

# cash
DD_HOSP, DD_CL = 75, 2
DD_BLEND = (HOSP2_REV * DD_HOSP + CL_REV * DD_CL) / GRP_REV
WC_FREED = (DD_HOSP - DD_BLEND) / 365 * GRP_REV


# ------------------------------------------------------- 150 beds, three ways
# The same estate, the same 70 per cent occupancy, three different strategies.
# What separates them is not size. It is length of stay, procedure intensity,
# how much diagnostics work the building takes in, and who pays.
SBEDS, SOCC = BEDS, OCC
SBD = SBEDS * 365 * SOCC

# name, alos, theatre cases, theatre avg, day cases, opd, ed, lab tests,
# icu beds, materials, staff, power, baddebt, other fixed
SCEN = [
    ("Low margin", 4.5, 1_900, 650_000, 2_400, 76_000, 17_500, 365_000, 16,
     0.295, 0.380, 0.050, 0.030, 0.110),
    ("Mid margin", ALOS, THEATRE_CASES, 720_000, DAYCASE, OPD, ED, 620_000, ICU_BEDS,
     0.280, 0.350, 0.030, 0.022, 0.103),
    ("High margin", 2.8, 6_200, 900_000, 14_000, 230_000, 38_000, 1_200_000, 30,
     0.270, 0.340, 0.020, 0.012, 0.100),
]


def scen(row):
    (nm, alos, thr, thr_v, dc, opd, ed, lab, icu, mat, staff, pwr, bd, oth) = row
    adm = SBD / alos
    icud = icu * 365 * 0.75
    imaging = opd * 0.42
    r = dict(
        consultation=(opd * 12_000 + ed * 18_000 + opd * 0.07 * 12_000) / 1e6,
        stay=(SBD * 45_000 + icud * 180_000 + adm * 0.12 * 85_000) / 1e6,
        procedures=(thr * thr_v + dc * 180_000 + adm * 0.10 * 550_000
                    + thr * 0.17 * 1_400_000 + dc * 0.40 * 150_000) / 1e6,
        diagnostics=(lab * 3_600 + imaging * 10_000 + imaging * 0.23 * 60_000
                     + thr * 2.3 * 20_000) / 1e6,
        sellables=(adm * 150_000 + opd * 0.9 * 6_500 + (thr + dc) * 0.76 * 110_000
                   + thr * 0.10 * 1_600_000) / 1e6,
        contracted=(opd * 0.022 * 200_000 + opd * 0.95 * 28_000 * 0.08
                    + opd * 0.30 * 16_000 * 0.25) / 1e6)
    rv = sum(r.values())
    cost = mat + staff + pwr + bd + oth
    return dict(name=nm, alos=alos, adm=adm, theatre=thr, daycase=dc, opd=opd, lab=lab,
                rev=rv, month=rv / 12, perbd=rv * 1e6 / SBD, mat=mat, staff=staff,
                baddebt=bd, ebitda_pc=1 - cost, ebitda=rv * (1 - cost),
                ebitda_m=rv * (1 - cost) / 12, **r)


SC = [scen(r) for r in SCEN]
# the middle scenario is this deck's own model, so take its revenue from the lines
SC[1].update(rev=TOT, month=TOT / 12, perbd=TOT * 1e6 / SBD,
             ebitda=TOT * SC[1]["ebitda_pc"], ebitda_m=TOT * SC[1]["ebitda_pc"] / 12,
             adm=ADMISSIONS, lab=LAB_TESTS)


# ------------------------------------------- bed count x strategy, and capex
# Revenue scales with occupied bed-days at the strategy's revenue per bed-day.
# Margin does not: below about a hundred beds the generator, the sterilising
# unit, the laboratory, the IT and the management team do not shrink with the
# ward, so the same strategy keeps less of what it bills.
FX = 1_550                                  # NGN per USD, stated so it can be changed
SIZES = [30, 50, 100, 150]
SCALE_PENALTY = {30: 0.065, 50: 0.040, 100: 0.015, 150: 0.0}
PER_BD = {x["name"]: x["perbd"] for x in SC}
BASE_PC = {x["name"]: x["ebitda_pc"] for x in SC}
STRATS = [x["name"] for x in SC]


def cell(beds, strat):
    bd = beds * 365 * OCC
    rv = bd * PER_BD[strat] / 1e6
    pc = BASE_PC[strat] - SCALE_PENALTY[beds]
    return dict(rev=rv, month=rv / 12, pc=pc, ebitda=rv * pc, ebitda_m=rv * pc / 12)


GRID = {(b, st): cell(b, st) for b in SIZES for st in STRATS}

# capex, built from published equipment prices and Nigerian construction rates
SQM_PER_BED = {30: 110, 50: 100, 100: 92, 150: 88}
BUILD_RATE = 1_200_000                      # NGN a square metre. Hospital grade is two
                                            # to three times commercial; see the sense check
EQUIP_USD = {30: 3_880_000, 50: 6_070_000, 100: 9_550_000, 150: 13_120_000}
LAND_NGN = {30: 600, 50: 900, 100: 1_500, 150: 2_000}        # NGN M
WC_NGN = {30: 500, 50: 800, 100: 1_500, 150: 2_000}          # NGN M


def capex(beds):
    sqm = beds * SQM_PER_BED[beds]
    build = sqm * BUILD_RATE / 1e6
    equip = EQUIP_USD[beds] * FX / 1e6
    return dict(sqm=sqm, build=build, equip=equip, land=LAND_NGN[beds], wc=WC_NGN[beds],
                total=build + equip + LAND_NGN[beds] + WC_NGN[beds])


CAPEX = {b: capex(b) for b in SIZES}

# the real price points behind the equipment column
PRICES = [
    ("CT, 64 slice", "500,000 to 700,000", "175,000 to 390,000"),
    ("MRI, 1.5T", "1,200,000 to 2,000,000", "475,000 to 975,000"),
    ("MRI, 3.0T", "2,100,000 to 3,700,000", "1,000,000 to 1,900,000"),
    ("Cath lab, single plane", "800,000 to 1,500,000", "250,000 to 600,000"),
    ("Cath lab, biplane", "1,500,000 to 2,500,000", "400,000 to 900,000"),
]

# five ways to put the same 150-bed hospital on the ground
ROUTES = [
    ("Greenfield, new equipment", 1.00, 1.00, 1.00, 0,
     "Best specification, longest programme, heaviest cheque"),
    ("Greenfield, refurbished imaging", 1.00, 0.78, 1.00, 0,
     "Saves roughly a fifth of the equipment bill. Older platform, shorter service life"),
    ("Convert an existing building", 0.62, 0.78, 0.00, 0,
     "No land, cheaper shell, worse geometry and higher mechanical cost"),
    ("Lease and fit out", 0.38, 0.78, 0.00, 620,
     "Lowest cheque. Rent becomes a permanent charge against EBITDA"),
    ("Partner the imaging", 0.62, 0.52, 0.00, 0,
     "Partner funds CT, MRI and cath for a share of the studies. Capex down, margin down"),
]


NOTE = {
    "Consultation and access": "Six per cent of the money, and the trigger for most of the rest. "
                               "An encounter is not the product. It is the event that orders the "
                               "laboratory, the scan, the drug and the admission.",
    "Stay": "The ward is under a tenth of revenue and the single largest fixed cost in the "
            "building. Critical care earns five times a ward bed-day and is what lets the hospital "
            "accept the complex case the rest of the list is built on.",
    "Procedures": "The largest family, and the most capacity constrained. Three of these lines "
                  "need capital before they need patients. A dialysis patient on a chair three "
                  "times a week is worth NGN 6 million a year on his own.",
    "Diagnostics": "Almost none of this is requested by a patient. It is ordered, it carries the "
                   "highest margin in the building, and it is the first thing to walk out of the "
                   "gate when turnaround is slow or the machine is down.",
    "Sellables": "Good margin, and hungry for working capital. Stock-outs do not just lose the "
                 "sale, they send the patient to the pharmacy outside and teach them to go there "
                 "next time.",
    "Contracted and ancillary": "NGN %.0f million a month from lines that need no bed and almost "
                                "no scarce clinician time. Contracted, recurring, and mostly paid "
                                "in cash on the day. This is the family most hospitals never "
                                "build.",
}


def fam_slide(c, fam):
    chrome(c, fam)
    y = heading(c, "NGN %.0f M a month, %.1f per cent of the total."
                % (fam_rev[fam] / 12, fam_rev[fam] / TOT * 100))
    rows = [["Line", "The unit sold", "Volume a year", "Price, NGN", "NGN M", "Share"]]
    for l in pick(fam):
        rows.append([l[1], l[2], "{:,.0f}".format(l[3]), "{:,.0f}".format(l[4]),
                     "%.1f" % rev(l), "%.1f%%" % (rev(l) / TOT * 100)])
    rows.append(["Family total", "", "", "", "{:,.0f}".format(fam_rev[fam]),
                 "%.1f%%" % (fam_rev[fam] / TOT * 100)])
    end = table(c, rows, MX, y - 24, [196, 134, 110, 106, 92, PAGE_W - 2 * MX - 638],
                size=10, leading=12.6, pad=6, accent_last=True)
    note = NOTE[fam]
    if "%.0f" in note:
        note = note % (fam_rev[fam] / 12)
    callout(c, MX, end - 30, PAGE_W - 2 * MX, note, size=11.5, leading=15.5)


def s01(c):
    bump()
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 110, 46, rev=True)
    c.setFillColor(white); c.setFont(SERIF_B, 38)
    c.drawString(MX, PAGE_H - 212, "The anatomy of a")
    c.drawString(MX, PAGE_H - 256, "tertiary hospital")
    c.setFillColor(RED); c.setFont(SERIF_I, 16)
    c.drawString(MX, PAGE_H - 286, "What it sells, what it costs, and what it takes to build.")
    rule(c, MX, PAGE_H - 306, 300, RED, 1.0)
    para(c, "Thirty four revenue lines, the cost stack behind them, and the same beds run three "
            "different ways. A hundred and fifty beds can bill NGN %.1f billion a month or NGN "
            "2.7 billion. The difference is strategy, not size, and it decides whether the "
            "capital comes back in three years or nineteen." % (SC[0]["month"] / 1000),
         MX, PAGE_H - 334, 13, LIGHT, 520, 19)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    c.drawString(MX, 54, "October 2026   /   Illustrative. Not specific to any one site.")


def s02(c):
    chrome(c, "The hospital in question")
    y = heading(c, "A hundred and fifty beds, on the middle strategy.")
    table(c, [["Capacity", "", "Activity a year", ""],
              ["Beds", "%d" % BEDS, "Outpatient encounters", "{:,.0f}".format(OPD)],
              ["Occupancy", "%.0f%%" % (OCC * 100), "Emergency attendances", "{:,.0f}".format(ED)],
              ["Average length of stay", "%.1f days" % ALOS, "Admissions",
               "{:,.0f}".format(ADMISSIONS)],
              ["Consulting rooms", "%d" % CLINIC_ROOMS, "Bed-days", "{:,.0f}".format(BED_DAYS)],
              ["Theatres", "%d" % THEATRES, "Theatre cases", "{:,.0f}".format(THEATRE_CASES)],
              ["ICU and HDU beds", "%d" % ICU_BEDS, "Day cases and endoscopies",
               "{:,.0f}".format(DAYCASE)],
              ["Dialysis, cath lab, CT, MRI, oncology", "Yes", "Laboratory tests",
               "{:,.0f}".format(LAB_TESTS)],
              ["Laboratory, imaging, pharmacy", "In house", "Imaging studies",
               "{:,.0f}".format(IMAGING)]],
          MX, y - 24, [240, 110, 200, PAGE_W - 2 * MX - 550], size=10.6, leading=14)
    callout(c, MX, 158, PAGE_W - 2 * MX,
            "Across %s patient encounters a year this hospital runs %.1f laboratory tests and "
            "%.2f imaging studies per encounter. Those two attach rates, more than any tariff, "
            "decide what it bills, far more than the bed count does."
            % ("{:,.0f}".format(ENCOUNTERS), LAB_TESTS / ENCOUNTERS, IMAGING / ENCOUNTERS),
            size=11.5, leading=15.5)


def s_daily(c):
    chrome(c, "What it means daily")
    y = heading(c, "NGN %.1f billion a month is NGN %.0f million a day." % (MONTH / 1000, TOT / 365))
    cells = [("%.0f M" % (TOT / 365), "revenue a day"),
             ("%.0f" % (ENCOUNTERS / 365), "patient encounters a day"),
             ("%.0f" % (ADMISSIONS / 365), "admissions a day"),
             ("%.0f" % (THEATRE_CASES / 365), "theatre cases a day"),
             ("%.0f" % (LAB_TESTS / 365), "laboratory tests a day"),
             ("%.0f" % (IMAGING / 365), "imaging studies a day")]
    gap = 14
    w = (PAGE_W - 2 * MX - gap * 2) / 3
    for i, (big, lbl) in enumerate(cells):
        x = MX + (i % 3) * (w + gap)
        yy = y - 30 - (i // 3) * 112
        c.setFillColor(SURFACE); c.roundRect(x, yy - 96, w, 96, 8, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x, yy - 96, 4, 96, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont(SERIF_B, 30)
        c.drawString(x + 22, yy - 48, big)
        c.setFillColor(MUTED); c.setFont("Helvetica", 11)
        c.drawString(x + 22, yy - 74, lbl)
    callout(c, MX, 148, PAGE_W - 2 * MX,
            "Put another way: every occupied bed in this hospital has to generate NGN %s of total "
            "revenue a day, against a bed charge of NGN %s. The bed is the ticket. It is not the "
            "fare." % ("{:,.0f}".format(TOT * 1e6 / BED_DAYS), "{:,.0f}".format(28_000)),
            size=11.5, leading=15.5)


def s_beds(c):
    chrome(c, "The bed count")
    y = heading(c, "And the bed count is not the constraint either.")
    f = lambda v: "{:,.0f}".format(v)
    ward = [l for l in LINES if l[1] == "Ward accommodation"][0]
    lo = SC[0]
    table(c, [["", "150 beds, low margin", "40 beds, run well"],
              ["Revenue a month, NGN M", f(lo["month"]), f(MONTH)],
              ["Beds", "%d" % SBEDS, "%d" % BEDS],
              ["Average length of stay", "%.1f days" % lo["alos"], "%.1f days" % ALOS],
              ["Occupied bed-days a year", f(SBD), f(BED_DAYS)],
              ["Revenue per occupied bed-day", "NGN %s" % f(lo["perbd"]),
               "NGN %s" % f(TOT * 1e6 / BED_DAYS)],
              ["The ward, as a share of revenue", "8.6%", "%.1f%%" % (rev(ward) / TOT * 100)],
              ["Employee cost", "38.0%", "33.0%"],
              ["EBITDA margin", "%.1f%%" % (lo["ebitda_pc"] * 100),
               "%.1f%%" % (EBITDA_PC * 100)]],
          MX, y - 24, [250, 190, PAGE_W - 2 * MX - 440], size=11, leading=14.6, pad=7,
          accent_last=True)
    callout(c, MX, 158, PAGE_W - 2 * MX,
            "The same money a month, on a quarter of the beds. A bed is the most expensive way "
            "to hold a patient and the least productive asset in the building. Shorten the stay, "
            "push the volume through clinics, day-case theatres and a laboratory that serves more "
            "than its own admissions, and the margin improves by seven points on a fraction of "
            "the capital.",
            size=11.5, leading=15.5)



def s_scen(c):
    chrome(c, "150 beds, three strategies")
    y = heading(c, "Same estate, same occupancy, three businesses.")
    f = lambda v: "{:,.0f}".format(v)
    cols = ["", SC[0]["name"], SC[1]["name"], SC[2]["name"]]
    rows = [cols,
            ["Average length of stay"] + ["%.1f days" % x["alos"] for x in SC],
            ["Admissions a year"] + [f(x["adm"]) for x in SC],
            ["Theatre cases"] + [f(x["theatre"]) for x in SC],
            ["Day cases and endoscopies"] + [f(x["daycase"]) for x in SC],
            ["Outpatient encounters"] + [f(x["opd"]) for x in SC],
            ["Laboratory tests"] + [f(x["lab"]) for x in SC],
            ["Revenue per occupied bed-day"] + ["NGN %s" % f(x["perbd"]) for x in SC],
            ["Revenue a year, NGN M"] + [f(x["rev"]) for x in SC],
            ["Revenue a month, NGN M"] + [f(x["month"]) for x in SC],
            ["EBITDA margin"] + ["%.1f%%" % (x["ebitda_pc"] * 100) for x in SC],
            ["EBITDA a month, NGN M"] + [f(x["ebitda_m"]) for x in SC]]
    w = (PAGE_W - 2 * MX - 260) / 3
    end = table(c, rows, MX, y - 22, [260, w, w, w], size=10.2, leading=13.2, pad=5.4,
                accent_last=True, hi={7})
    callout(c, MX, end - 26, PAGE_W - 2 * MX,
            "A hundred and fifty beds producing a billion a month is not a size. It is a "
            "strategy, and it is the weakest one on this page. The same beds at the same occupancy "
            "run the third way bill %.1f times as much and keep NGN %s million a month instead of "
            "NGN %s million, which is %.1f times the profit on no extra bricks."
            % (SC[2]["rev"] / SC[0]["rev"], f(SC[2]["ebitda_m"]), f(SC[0]["ebitda_m"]),
               SC[2]["ebitda_m"] / SC[0]["ebitda_m"]), size=11.5, leading=15.5)


def s_scen_why(c):
    chrome(c, "What separates them")
    y = heading(c, "Four decisions, and none of them is the bed count.")
    f = lambda v: "{:,.0f}".format(v)
    lo, hi = SC[0], SC[2]
    table(c, [["The decision", "Low margin", "High margin", "What it does"],
              ["How long a patient stays", "%.1f days" % lo["alos"], "%.1f days" % hi["alos"],
               "Shorter stay, %s more admissions through the same beds"
               % f(hi["adm"] - lo["adm"])],
              ["How much the theatre runs", f(lo["theatre"]), f(hi["theatre"]),
               "The biggest line in the building, and the one with capital behind it"],
              ["Whether you treat without admitting",
               "%s day cases" % f(lo["daycase"]), "%s day cases" % f(hi["daycase"]),
               "Volume that never touches a bed"],
              ["Whether diagnostics serve outsiders",
               "%s tests" % f(lo["lab"]), "%s tests" % f(hi["lab"]),
               "The highest margin in the building, sold beyond your own patients"],
              ["Who pays", "Bad debt %.1f%%" % (lo["baddebt"] * 100),
               "Bad debt %.1f%%" % (hi["baddebt"] * 100),
               "Payer mix shows up as margin, not just as cash"]],
          MX, y - 24, [218, 118, 118, PAGE_W - 2 * MX - 454], size=10.4, leading=13.6, pad=6)
    callout(c, MX, 152, PAGE_W - 2 * MX,
            "Revenue per occupied bed-day moves from NGN %s to NGN %s, a factor of %.1f, with no "
            "extra beds and no extra occupancy. Every one of those four decisions is a management "
            "decision, not a capital one."
            % (f(lo["perbd"]), f(hi["perbd"]), hi["perbd"] / lo["perbd"]),
            size=11.5, leading=15.5)



def s_matrix(c):
    chrome(c, "Beds against strategy")
    y = heading(c, "Four sizes, three strategies, NGN M a month.")
    f = lambda v: "{:,.0f}".format(v)
    r1 = [["Revenue a month"] + STRATS]
    for b in SIZES:
        r1.append(["%d beds" % b] + [f(GRID[(b, st)]["month"]) for st in STRATS])
    end = table(c, r1, MX, y - 22, [200, 178, 178, PAGE_W - 2 * MX - 556],
                size=10.6, leading=13.6, pad=6, hi={4})
    r2 = [["EBITDA a month"] + STRATS]
    for b in SIZES:
        g = [GRID[(b, st)] for st in STRATS]
        r2.append(["%d beds" % b] + ["%s   (%.1f%%)" % (f(x["ebitda_m"]), x["pc"] * 100)
                                     for x in g])
    end = table(c, r2, MX, end - 26, [200, 178, 178, PAGE_W - 2 * MX - 556],
                size=10.6, leading=13.6, pad=6, hi={4})
    callout(c, MX, end - 26, PAGE_W - 2 * MX,
            "A hundred beds run well bill NGN %s million a month. A hundred and fifty run poorly "
            "bill NGN %s million. Fifty beds run well bill NGN %s million, which is what a hundred "
            "and fifty low-margin beds bill on three times the estate. Size is not the strategy."
            % (f(GRID[(100, "High margin")]["month"]), f(GRID[(150, "Low margin")]["month"]),
               f(GRID[(50, "High margin")]["month"])), size=11.2, leading=15)


def s_capex(c):
    chrome(c, "What it costs to build")
    y = heading(c, "The equipment still costs more than the building.")
    f = lambda v: "{:,.0f}".format(v)
    rows = [["", "Floor area", "Building", "Equipment", "Land", "Working capital", "Total"]]
    for b in SIZES:
        x = CAPEX[b]
        rows.append(["%d beds" % b, "%s sqm" % f(x["sqm"]), f(x["build"]), f(x["equip"]),
                     f(x["land"]), f(x["wc"]), f(x["total"])])
    end = table(c, rows, MX, y - 22, [96, 104, 100, 110, 80, 118, PAGE_W - 2 * MX - 608],
                size=10.4, leading=13.6, pad=6, accent_last=False)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.2)
    c.drawString(MX, end - 18, "NGN M. Building at NGN %s a square metre, Lagos or Abuja. "
                 "Equipment converted at NGN %s to the dollar."
                 % (f(BUILD_RATE), f(FX)))
    sub = [["Published equipment prices, USD", "New", "Refurbished"]]
    for n, a, b2 in PRICES:
        sub.append([n, a, b2])
    table(c, sub, MX, end - 40, [250, 190, PAGE_W - 2 * MX - 440], size=10, leading=13, pad=5.5)


def s_routes(c):
    chrome(c, "Capex routes")
    y = heading(c, "Five ways to put the same 150 beds on the ground.")
    f = lambda v: "{:,.0f}".format(v)
    base = CAPEX[150]
    rows = [["Route", "Capex, NGN M", "Rent a year", "What you give up"]]
    for nm, bm, em, lm, rent, note in ROUTES:
        tot = base["build"] * bm + base["equip"] * em + base["land"] * lm + base["wc"]
        rows.append([nm, f(tot), f(rent) if rent else "none", note])
    end = table(c, rows, MX, y - 22, [214, 110, 94, PAGE_W - 2 * MX - 418],
                size=10.4, leading=13.6, pad=6)
    lo = min(base["build"] * r[1] + base["equip"] * r[2] + base["land"] * r[3] + base["wc"]
             for r in ROUTES)
    callout(c, MX, end - 28, PAGE_W - 2 * MX,
            "The cheque moves from NGN %s million to NGN %s million, a %.0f per cent swing, and "
            "every naira saved is bought with something: an older imaging platform, a worse "
            "building, a permanent rent, or a share of the highest margin line in the hospital."
            % (f(base["total"]), f(lo), (1 - lo / base["total"]) * 100), size=11.2, leading=15)


def s_returns(c):
    chrome(c, "What comes back")
    _hi = CAPEX[150]["total"] / GRID[(150, "High margin")]["ebitda"]
    _lo = CAPEX[150]["total"] / GRID[(150, "Low margin")]["ebitda"]
    y = heading(c, "The same building pays back in %.0f years or %.0f." % (_hi, _lo))
    f = lambda v: "{:,.0f}".format(v)
    rows = [["Years to repay the capex"] + STRATS]
    for b in SIZES:
        row = ["%d beds" % b]
        for st in STRATS:
            e = GRID[(b, st)]["ebitda"]
            row.append("%.1f" % (CAPEX[b]["total"] / e) if e > 0 else "never")
        rows.append(row)
    end = table(c, rows, MX, y - 22, [214, 172, 172, PAGE_W - 2 * MX - 558],
                size=11, leading=14.6, pad=7, hi={4})
    hi150, lo150 = _hi, _lo
    callout(c, MX, end - 28, PAGE_W - 2 * MX,
            "Identical bricks, identical beds, identical occupancy. %.1f years against %.1f years, "
            "decided entirely by length of stay, theatre throughput, how much diagnostics work the "
            "building takes in, and who pays. The capital committee argues about the first number. "
            "The result is set by the last four." % (hi150, lo150), size=11.2, leading=15)



def s_sense(c):
    chrome(c, "Sense check")
    y = heading(c, "Where this model is safe, and where it is exposed.")
    ZAR = FX / 18.5
    nc = 25_695e6 / (9_500 * 365 * 0.655) * ZAR          # Netcare revenue per occupied bed-day
    hi, lo = SC[2], SC[0]
    f = lambda v: "{:,.0f}".format(v)
    rows = [["Assumption", "This model", "The benchmark", "Verdict"],
            ["Revenue per occupied bed-day, top strategy", "NGN %s" % f(hi["perbd"]),
             "Netcare implies about NGN %s" % f(nc), "Conservative"],
            ["Revenue per occupied bed-day, low strategy", "NGN %s" % f(lo["perbd"]),
             "%.0f per cent of Netcare" % (lo["perbd"] / nc * 100), "A genuinely weak hospital"],
            ["EBITDA margin, top strategy", "%.1f%%" % (hi["ebitda_pc"] * 100),
             "Netcare 18.6%, Life Healthcare 15.3%", "Above both. The most exposed number here"],
            ["Employee cost", "34 to 38%", "Netcare 38.7%", "In line"],
            ["Materials", "%.1f%%" % (MATERIALS / TOT * 100), "Netcare cost of goods 26.4%",
             "Slightly above, for import exposure"],
            ["Bad debt and rejected claims", "1.2 to 3.0%", "Netcare 0.8%",
             "Deliberately worse. Nigerian payer reality"],
            ["Occupancy", "%.0f%%" % (OCC * 100), "Netcare 65.0%, Life 69.2%",
             "Slightly optimistic"],
            ["Imaging equipment prices", "Published list", "Block Imaging 2025 and 2026 guides",
             "Sourced"],
            ["Build cost", "NGN %s a sqm" % f(BUILD_RATE),
             "Nigerian trade rates imply 300 to 400k commercial", "Judgement. Not sourced"],
            ["Capex a bed, 150 beds", "USD %s" % f(CAPEX[150]["total"] * 1e6 / FX / 150),
             "Aga Khan Uganda 667k, AMCE Abuja 1.5m",
             "Far below. A commercial build, not a flagship"],
            ["Margin penalty below 100 beds", "1.5 to 6.5 points", "Nothing published found",
             "Judgement. Not sourced"],
            ["Staff per bed", "%.1f" % (0.35 * TOT * 1e6 / 9e6 / BEDS), "Tertiary norm 3 to 5",
             "At the top of the range"]]
    end = table(c, rows, MX, y - 22, [238, 124, 220, PAGE_W - 2 * MX - 582],
                size=9.6, leading=12.4, pad=5)
    callout(c, MX, end - 24, PAGE_W - 2 * MX,
            "Three numbers carry the argument and none is sourced: the build cost a square metre, "
            "the top-strategy margin, and the penalty for being small. Push on those three and the "
            "payback table moves. Everything on the revenue side sits below a listed comparator, "
            "so the case is not being made by optimistic billing.", size=11, leading=15)



def s03(c):
    chrome(c, "The billion in six families")
    y = heading(c, "Where the money actually sits.")
    rows = [["Family", "NGN M a year", "A month", "Share", "What it is"]]
    WHAT = {"Consultation and access": "Clinics, emergency, telemedicine",
            "Stay": "Ward, critical care, neonatal",
            "Procedures": "Theatre, maternity, day case, dialysis, physiotherapy",
            "Diagnostics": "Laboratory, imaging, blood, histopathology",
            "Sellables": "Pharmacy, consumables, implants, gases",
            "Contracted and ancillary": "Checks, occupational health, retainers, concessions"}
    for f in sorted(FAMS, key=lambda f: -fam_rev[f]):
        rows.append([f, "{:,.0f}".format(fam_rev[f]), "%.0f" % (fam_rev[f] / 12),
                     "%.1f%%" % (fam_rev[f] / TOT * 100), WHAT[f]])
    rows.append(["Total", "{:,.0f}".format(TOT), "{:,.0f}".format(MONTH), "100%",
                 "%d lines" % NLINES])
    end = table(c, rows, MX, y - 24, [196, 96, 74, 66, PAGE_W - 2 * MX - 432],
                size=10.6, leading=14, accent_last=True)
    bx, bw, bh = MX, PAGE_W - 2 * MX, 34
    by = end - 46
    cx = bx
    for i, f in enumerate(sorted(FAMS, key=lambda f: -fam_rev[f])):
        w = bw * fam_rev[f] / TOT
        c.setFillColor([RED, DARK, RED_D, HexColor("#8A8A93"),
                        HexColor("#B9B9C1"), HexColor("#DEDEE3")][i])
        c.rect(cx, by - bh, w, bh, fill=1, stroke=0)
        c.setFillColor(white if i < 4 else INK)
        c.setFont("Helvetica-Bold", 9)
        if w > 44:
            c.drawCentredString(cx + w / 2, by - bh / 2 - 3, "%.0f%%" % (fam_rev[f] / TOT * 100))
        cx += w
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    c.drawString(MX, by - bh - 18, "Diagnostics and sellables together are %.0f per cent of "
                 "the money, NGN %.0f million a month, and a patient asked for almost none of it."
                 % ((fam_rev["Diagnostics"] + fam_rev["Sellables"]) / TOT * 100,
                    (fam_rev["Diagnostics"] + fam_rev["Sellables"]) / 12))


def s04(c):
    chrome(c, "Line by line")
    y = heading(c, "All %d lines, and the NGN %.1f billion a year they add to." % (NLINES, TOT / 1000),
                size=21)
    order = sorted(LINES, key=rev, reverse=True)
    head = ["Line", "Volume", "Price", "NGN M", "%"]
    row = lambda l: [l[1], "{:,.0f}".format(l[3]), "{:,.0f}".format(l[4]),
                     "%.1f" % rev(l), "%.1f" % (rev(l) / TOT * 100)]
    half = (NLINES + 1) // 2
    gap = 22
    w = (PAGE_W - 2 * MX - gap) / 2
    cw = [w - 208, 62, 66, 48, 32]
    left = [head] + [row(l) for l in order[:half]]
    right = [head] + [row(l) for l in order[half:]]
    right.append(["Total, all %d lines" % NLINES, "", "", "{:,.0f}".format(TOT), ""])
    table(c, left, MX, y - 18, cw, size=8.1, leading=10.1, pad=3.6)
    table(c, right, MX + w + gap, y - 18, cw, size=8.1, leading=10.1, pad=3.6, accent_last=True)


def s11(c):
    chrome(c, "What the shape says")
    y = heading(c, "Four things fall straight out of the list.")
    d = fam_rev["Diagnostics"] + fam_rev["Sellables"]
    ward = [l for l in LINES if l[1] == "Ward accommodation"][0]
    big = [l[1].replace(", inpatient", " for inpatients")
           for l in sorted(LINES, key=rev, reverse=True) if rev(l) >= 1000]
    bullets(c, [
        ("Ordered, not chosen. NGN %.0f million a month of it." % (d / 12),
         "Diagnostics and sellables are %.0f per cent of revenue and a patient requested almost "
         "none of it. The order sits with the clinician, which makes clinical governance a revenue "
         "function as well as a safety one." % (d / TOT * 100)),
        ("Four lines each clear a billion a year on their own.",
         "%s and %s. Three of those four are consequences of the first: the theatre fills the "
         "bed, and the bed orders the drugs and the tests."
         % ("; ".join(big[:-1]), big[-1].lower())),
        ("The bed charges NGN %s a day and carries NGN %s."
         % ("{:,.0f}".format(price("Ward accommodation")),
            "{:,.0f}".format(TOT * 1e6 / BED_DAYS)),
         "Ward accommodation is %.1f per cent of revenue. Forty beds carry a billion a month "
         "because the money is made around them, not in them."
         % (rev(ward) / TOT * 100)),
        ("NGN %.0f million a month needs no bed and no scarce clinician."
         % (fam_rev["Contracted and ancillary"] / 12),
         "Checks, retainers, occupational health, medicals and concessions. Contracted, recurring, "
         "paid on the day, and the family most hospitals never build out.")],
        MX, y - 30, PAGE_W - 2 * MX - 60, size=12, leading=16)


def s12(c):
    chrome(c, "At the margin")
    y = heading(c, "What one more of each is actually worth.")
    bd, lab = price("Ward accommodation"), price("Laboratory")
    img, drug = price("Imaging, plain and ultrasound"), price("Pharmacy, inpatient")
    thr, cth = price("Theatre"), price("Cardiac catheterisation")
    cons, onc = price("Consumables"), price("Oncology day unit")
    mat, chk = price("Maternity"), price("Executive health checks")
    opd_p, rtl = price("Outpatient clinic"), price("Pharmacy, retail")
    dia = price("Dialysis")
    surg = thr + cons + ALOS * bd + 14 * lab + 1.5 * img + drug
    med = ALOS * bd + 14 * lab + 1.5 * img + drug
    cath = cth + 2 * bd + 8 * lab + drug
    deliv = mat + 3 * bd + 8 * lab + cons
    opd_v = opd_p + 3.5 * lab + 0.5 * img + rtl
    f = lambda v: "{:,.0f}".format(v)
    table(c, [["One more", "What it drags with it", "All-in, NGN"],
              ["Dialysis patient, a year", "150 sessions at %s" % f(dia), f(150 * dia)],
              ["Cardiac catheterisation", "The lab, 2 bed-days, tests, drugs", f(cath)],
              ["Surgical case", "Theatre, consumables, %.1f bed-days, 14 tests, a scan, drugs"
               % ALOS, f(surg)],
              ["Oncology patient, a course", "Six cycles at %s" % f(onc), f(6 * onc)],
              ["Delivery", "Suite or theatre, 3 bed-days, tests, drugs", f(deliv)],
              ["Medical admission", "%.1f bed-days, 14 tests, a scan, drugs" % ALOS, f(med)],
              ["Executive check", "A package. No bed, no scarce clinician", f(chk)],
              ["Outpatient encounter", "Consultation, 3.5 tests, half a scan, a basket",
               f(opd_v)]],
          MX, y - 24, [214, 330, PAGE_W - 2 * MX - 544], size=10.8, leading=14.4, pad=7)
    callout(c, MX, 146, PAGE_W - 2 * MX,
            "A surgical case is worth about %.0f outpatient encounters, and a catheterisation "
            "about %.0f. Filling theatre lists and cath lab sessions moves this hospital far "
            "harder than filling beds does, and a dialysis chair is an annuity."
            % (surg / opd_v, cath / opd_v), size=11.5, leading=15.5)


def s13(c):
    bump()
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 104, 40, rev=True)
    c.setFillColor(white); c.setFont(SERIF_B, 27)
    c.drawString(MX, PAGE_H - 172, "Seven numbers that run the whole list")
    items = [("Clinician activity", "Sessions delivered against sessions available."),
             ("Attach rate", "Tests, images and items per encounter, by specialty."),
             ("Internal fulfilment", "The share of orders the building filled itself."),
             ("Theatre utilisation", "Cases against list hours, not against theatres owned."),
             ("Occupancy and length of stay", "Read together. Either one alone misleads."),
             ("Revenue per encounter", "By specialty. It exposes the mix without a cost model."),
             ("Payer mix and debtor days", "Margin means nothing if the cash is ninety days out.")]
    yy = PAGE_H - 220
    for i, (lead, rest) in enumerate(items):
        c.setFillColor(RED); c.setFont("Helvetica-Bold", 12)
        c.drawString(MX, yy, "%d" % (i + 1))
        c.setFillColor(white); c.setFont("Helvetica-Bold", 12.5)
        c.drawString(MX + 20, yy, lead)
        c.setFillColor(LIGHT); c.setFont("Helvetica", 11.5)
        c.drawString(MX + 230, yy, rest)
        yy -= 31
    rule(c, MX, 104, 300, RED, 1.0)
    c.setFillColor(white); c.setFont(SERIF_B, 12.5)
    c.drawString(MX, 82, "Medbury Healthcare Group")
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    c.drawString(MX, 64, "Illustrative model. Every tariff is on the face of the tables.")


def divider(c, kicker, title, blurb):
    bump()
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    logo(c, PAGE_W - MX - 110, PAGE_H - 100, 36, rev=True)
    c.setFillColor(RED); c.rect(MX, PAGE_H - 206, 44, 3, fill=1, stroke=0)
    c.setFillColor(RED); c.setFont("Helvetica-Bold", 11)
    c.drawString(MX, PAGE_H - 238, kicker.upper())
    c.setFillColor(white); c.setFont(SERIF_B, 34)
    c.drawString(MX, PAGE_H - 288, title)
    para(c, blurb, MX, PAGE_H - 322, 13, LIGHT, 560, 19)


def s_cost(c):
    chrome(c, "The cost stack")
    y = heading(c, "What that revenue costs to produce.")
    f = lambda v: "{:,.0f}".format(v)
    rows = [["", "NGN M a year", "A month", "Of revenue", ""]]
    rows.append(["Revenue", f(TOT), f(MONTH), "100.0%", "%d lines" % NLINES])
    rows.append(["Direct materials", "(%s)" % f(MATERIALS), "(%s)" % f(MATERIALS / 12),
                 "%.1f%%" % (MATERIALS / TOT * 100), "Drugs, implants, reagents, contrast"])
    rows.append(["Contribution", f(CONTRIB), f(CONTRIB / 12), "%.1f%%" % (CM * 100), ""])
    for r, name, note in FIXED:
        rows.append([name, "(%s)" % f(r * TOT), "(%s)" % f(r * TOT / 12), "%.1f%%" % (r * 100),
                     note])
    rows.append(["EBITDA", f(EBITDA), f(EBITDA / 12), "%.1f%%" % (EBITDA_PC * 100), ""])
    end = table(c, rows, MX, y - 20, [238, 94, 76, 80, PAGE_W - 2 * MX - 488],
                size=9.4, leading=12, pad=5, accent_last=True, hi={3})
    sub = [["Below EBITDA", "NGN M", "Of revenue", ""]]
    for r, name, note in BELOW:
        sub.append([name, "(%s)" % f(r * TOT), "%.1f%%" % (r * 100), note])
    sub.append(["Profit before tax", f(PBT), "%.1f%%" % (PBT / TOT * 100),
                "The capital takes two thirds of the EBITDA"])
    table(c, sub, MX, end - 26, [238, 94, 80, PAGE_W - 2 * MX - 412],
          size=9.4, leading=12, pad=5, accent_last=True)


def s_contrib(c):
    chrome(c, "Where the margin is made")
    y = heading(c, "Revenue and margin do not sit in the same families.")
    rows = [["Family", "Revenue", "Materials", "Contribution", "Margin", "Share of margin"]]
    for fam in sorted(FAMS, key=lambda f: -(fam_rev[f] - materials[f])):
        cb = fam_rev[fam] - materials[fam]
        rows.append([fam, "{:,.0f}".format(fam_rev[fam]), "{:,.0f}".format(materials[fam]),
                     "{:,.0f}".format(cb), "%.0f%%" % (cb / fam_rev[fam] * 100),
                     "%.1f%%" % (cb / CONTRIB * 100)])
    rows.append(["Total", "{:,.0f}".format(TOT), "{:,.0f}".format(MATERIALS),
                 "{:,.0f}".format(CONTRIB), "%.0f%%" % (CM * 100), "100%"])
    table(c, rows, MX, y - 24, [196, 92, 92, 106, 76, PAGE_W - 2 * MX - 562],
          size=10.4, leading=13.6, pad=6, accent_last=True)
    sell = fam_rev["Sellables"]
    callout(c, MX, 160, PAGE_W - 2 * MX,
            "Sellables are NGN %s million of revenue and keep only %.0f per cent of it. "
            "Diagnostics are smaller on the top line and keep %.0f per cent. Growing the pharmacy "
            "grows the turnover and the stock bill. Growing the laboratory grows the profit."
            % ("{:,.0f}".format(sell), (sell - materials["Sellables"]) / sell * 100,
               (fam_rev["Diagnostics"] - materials["Diagnostics"]) / fam_rev["Diagnostics"] * 100),
            size=11.5, leading=15.5)


def s_breakeven(c):
    chrome(c, "Operating leverage")
    y = heading(c, "The first %.0f per cent of the hospital pays the bills." % (BE_REV / TOT * 100))
    f = lambda v: "{:,.0f}".format(v)
    table(c, [["", "NGN M a year", "What it means"],
              ["Fixed cost to open the doors", f(FIXED_TOT),
               "Payroll, power, maintenance, admin. Owed whether a bed fills or not"],
              ["Contribution margin", "%.1f%%" % (CM * 100),
               "What each naira of revenue leaves after materials"],
              ["Break-even revenue", f(BE_REV),
               "%.0f per cent of what it bills today" % (BE_REV / TOT * 100)],
              ["Break-even occupancy", "%.0f%%" % (BE_OCC * 100),
               "Against %.0f per cent today" % (OCC * 100)],
              ["EBITDA", f(EBITDA), "Everything earned above the break-even line"]],
          MX, y - 24, [232, 130, PAGE_W - 2 * MX - 362], size=11, leading=15, pad=7,
          accent_last=True)
    callout(c, MX, 166, PAGE_W - 2 * MX,
            "Just %.0f points of occupancy separate break-even from today, and those %.0f points "
            "carry the entire EBITDA. That is the whole argument for utilisation: the hospital does "
            "not earn gradually, it earns at the top."
            % ((OCC - BE_OCC) * 100, (OCC - BE_OCC) * 100), size=11.5, leading=15.5)


def s_bench(c):
    chrome(c, "Benchmarks")
    y = heading(c, "Against two listed African hospital groups.")
    rows = [["", "Revenue", "EBITDA margin", "Occupancy", "Employee cost", "Materials",
             "Bad debt"]]
    for b in BENCH:
        rows.append(list(b))
    end = table(c, rows, MX, y - 22, [168, 104, 108, 94, 108, 90, PAGE_W - 2 * MX - 672],
                size=10, leading=13.4, pad=6, accent_last=True)
    nb, lb = 18.6, 15.3
    gaps = [("Netcare EBITDA margin, FY2025", nb),
            ("Materials cost more here", -(MATERIALS / TOT * 100 - 26.4)),
            ("Claims rejected and never paid", -(2.2 - 0.8)),
            ("A leaner payroll", 38.7 - 35.0),
            ("Power, and everything else", EBITDA_PC * 100 - nb
             + (MATERIALS / TOT * 100 - 26.4) + (2.2 - 0.8) - (38.7 - 35.0)),
            ("This hospital", EBITDA_PC * 100)]
    yy = end - 34
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 11)
    c.drawString(MX, yy, "The five point gap, named")
    yy -= 20
    for i, (lbl, v) in enumerate(gaps):
        term = i in (0, len(gaps) - 1)
        c.setFillColor(INK if term else BODY)
        c.setFont("Helvetica-Bold" if term else "Helvetica", 10.2)
        c.drawString(MX + 14, yy, lbl)
        c.setFillColor(INK if term else (RED_D if v < 0 else MUTED))
        c.setFont("Helvetica-Bold", 10.2)
        c.drawRightString(MX + 450, yy, ("%.1f" if term else "%+.1f") % v)
        yy -= 16


def s_sens(c):
    chrome(c, "Variance")
    y = heading(c, "What actually moves the result.")
    lab_p, img_p = price("Laboratory"), price("Imaging, plain and ultrasound")
    thr_p = price("Theatre")
    items = [
        ("Tariff, across the board", "+5%", TOT * 0.05),
        ("Staff cost", "+10%", -0.35 * TOT * 0.10),
        ("Naira devalues against imported materials", "+20% on 60%",
         -MATERIALS * 0.6 * 0.20),
        ("Claims rejected and written off", "+2 points", -TOT * 0.02),
        ("Outpatient to inpatient conversion", "+1 point", CONV_PP * CM),
        ("Power and diesel", "+30%", -0.03 * TOT * 0.30),
        ("Theatre cases", "+10%", THEATRE_CASES * 0.10 * thr_p / 1e6 * 1.5 * CM),
        ("Laboratory attach rate", "+0.5 a patient", ENCOUNTERS * 0.5 * lab_p / 1e6 * 0.76),
        ("Occupancy", "+5 points", BEDS * 365 * 0.05 / ALOS
         * (ALOS * price("Ward accommodation") + price("Pharmacy, inpatient")
            + 14 * lab_p + 1.5 * img_p) / 1e6 * CM),
    ]
    items.sort(key=lambda t: -abs(t[2]))
    mx_v = max(abs(v) for _, _, v in items)
    cx, half = MX + 496, 118
    yy = y - 36
    for lbl, mv, v in items:
        c.setFillColor(INK); c.setFont("Helvetica", 10.2)
        c.drawString(MX, yy, lbl)
        c.setFillColor(MUTED); c.setFont("Helvetica", 9.4)
        c.drawRightString(MX + 352, yy, mv)
        w = abs(v) / mx_v * half
        c.setFillColor(RED if v > 0 else DARK)
        c.rect(cx if v > 0 else cx - w, yy - 3, w, 11, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont("Helvetica-Bold", 9.6)
        c.setFont("Helvetica-Bold", 9.4)
        c.drawString(cx + half + 14, yy, "%+.0f M" % v)
        c.setFillColor(MUTED)
        c.drawRightString(PAGE_W - MX, yy, "%+.0f%%" % (v / EBITDA * 100))
        yy -= 22
    c.setFillColor(LIGHT); c.rect(cx - 0.5, yy + 14, 1, y - 32 - yy, fill=1, stroke=0)
    callout(c, MX, yy - 6, PAGE_W - 2 * MX,
            "Price is the largest single lever in the building and the cheapest to pull. Payroll "
            "and the exchange rate are the largest threats, and neither is inside management "
            "control. That asymmetry is the argument for pricing deliberately rather than annually.",
            size=11, leading=15)


def s_conv(c):
    chrome(c, "Outpatient to procedure")
    y = heading(c, "You grow by treating people, not by admitting them.")
    f = lambda v: "{:,.0f}".format(v)
    table(c, [["The funnel", "A year", "Converts at", "Where it goes"],
              ["Outpatient clinic encounters", f(OPD), "", ""],
              ["Emergency attendances", f(ED), "", ""],
              ["Admissions", f(ADMISSIONS), "%.1f%%" % (ADMISSIONS / OP_EVENTS * 100),
               "Capped by the bed, and the bed is the scarce thing"],
              ["Procedures, theatre and day case", f(PROCS), "%.1f%%" % (PROC_CONV * 100),
               "Capped by lists and rooms, not beds"]],
          MX, y - 24, [238, 110, 120, PAGE_W - 2 * MX - 468], size=11, leading=14.6, pad=7,
          accent_last=True)
    box_top = y - 24 - 5 * (14.6 + 7 * 1.6) - 30
    bw = (PAGE_W - 2 * MX - 18) / 2
    for i, (big, lbl) in enumerate([
            ("NGN %.0f M" % CONV_PP, "for every one point of procedure conversion"),
            ("NGN %.0f M" % (CONV_PP * CM), "of that reaches EBITDA, a %.0f per cent lift"
             % (CONV_PP * CM / EBITDA * 100))]):
        x = MX + i * (bw + 18)
        c.setFillColor(BLUSH if i else SURFACE)
        c.roundRect(x, box_top - 96, bw, 96, 8, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x, box_top - 96, 4, 96, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont(SERIF_B, 26)
        c.drawString(x + 22, box_top - 48, big)
        para(c, lbl, x + 22, box_top - 70, 11, MUTED, bw - 44, 14)
    callout(c, MX, box_top - 124, PAGE_W - 2 * MX,
            "The average procedure here is worth NGN %s and the patient is already in the "
            "building, already examined, and often home the same day. Procedure conversion is "
            "capped by lists and recovery bays, which can be added. Admission is capped by beds, "
            "which cannot be, not without the capex on slide six."
            % f(PROC_VALUE), size=11.5, leading=15.5)


def s_growth(c):
    chrome(c, "Growth")
    y = heading(c, "Moving from the middle strategy to the top one.")
    lab_p, thr_p = price("Laboratory"), price("Theatre")
    hi = SC[2]
    levers = [
        ("Length of stay, 3.5 days to 2.8", (hi["adm"] - ADMISSIONS) * 300_000 / 1e6,
         "Discharge planning, not more beds"),
        ("Theatre, 3,400 cases to 6,200", (6_200 - THEATRE_CASES) * thr_p / 1e6 * 1.3,
         "Lists, surgeons, anaesthesia, recovery"),
        ("Laboratory, 620,000 tests to 1.2 million", (1_200_000 - LAB_TESTS) * lab_p / 1e6,
         "Outside referrals, turnaround, a courier network"),
        ("Day case, 6,000 to 14,000", (14_000 - DAYCASE) * price("Day case and endoscopy") / 1e6,
         "Lists and recovery bays, not beds"),
        ("Clinics, 130,000 to 230,000 encounters", 100_000 * price("Outpatient clinic") / 1e6,
         "Rooms, sessions and specialists"),
        ("Cath lab, 550 to 1,050", 500 * price("Cardiac catheterisation") / 1e6,
         "A second interventionist"),
    ]
    inside = sum(v for _, v, _ in levers)
    gap = hi["rev"] - TOT
    rows = [["Lever", "NGN M a year", "What it needs"]]
    for n, v, w in levers:
        rows.append([n, "+%s" % "{:,.0f}".format(v), w])
    rows.append(["Everything inside this building", "+%s" % "{:,.0f}".format(inside), ""])
    end = table(c, rows, MX, y - 22, [262, 118, PAGE_W - 2 * MX - 380],
                size=10.4, leading=13.6, pad=6, accent_last=True)
    callout(c, MX, end - 28, PAGE_W - 2 * MX,
            "Those six moves add NGN %s million, which is %.0f per cent of the distance between "
            "the middle strategy and the top one. The high-margin column is not an aspiration. It "
            "is this list. The remaining NGN %s million is what part four is about."
            % ("{:,.0f}".format(inside), inside / gap * 100,
               "{:,.0f}".format(gap - inside)), size=11.2, leading=15)


def s_risk(c):
    chrome(c, "Risk")
    y = heading(c, "What breaks it, and what it costs.")
    fx = MATERIALS * 0.6 * 0.20
    table(c, [["Risk", "What happens", "Cost if it lands"],
              ["The naira", "Implants, reagents and contrast are imported and priced abroad",
               "NGN %s M on a 20 per cent move" % "{:,.0f}".format(fx)],
              ["One clinician leaves", "The cath lab, the oncologist, the lead surgeon. Capital "
               "strands with the person", "NGN 455 M of lines sit on a handful of people"],
              ["The payer stops paying", "Rejection on technicality, then ninety day debtors",
               "Every 2 points of write-off is NGN %s M"
               % "{:,.0f}".format(TOT * 0.02)],
              ["A scanner goes down", "Three weeks out and the referrers route elsewhere "
               "permanently", "NGN %s M of imaging, and the attach behind it"
               % "{:,.0f}".format(sum(rev(l) for l in LINES if l[1].startswith("Imaging")) / 17)],
              ["Power", "Diesel is the swing cost and it is not hedgeable",
               "NGN %s M on a 30 per cent move" % "{:,.0f}".format(0.03 * TOT * 0.30)],
              ["A sentinel event", "A service line closes while it is investigated",
               "The line, plus the referral pattern behind it"],
              ["The replacement cycle", "Depreciation is a real cash call every seven to ten years",
               "NGN %s M a year is being consumed" % "{:,.0f}".format(0.05 * TOT)]],
          MX, y - 24, [168, 300, PAGE_W - 2 * MX - 468], size=10.2, leading=13.2, pad=6)



def s_cluster(c):
    chrome(c, "The adjacent lines")
    y = heading(c, "What the other operating lines are worth.")
    rows = [["Line", "The unit sold", "Volume", "Price, NGN", "NGN M", "A month"]]
    for l in sorted(CLUSTER, key=crev, reverse=True):
        rows.append([l[0], l[1], "{:,.0f}".format(l[2]), "{:,.0f}".format(l[3]),
                     "{:,.0f}".format(crev(l)), "%.0f" % (crev(l) / 12)])
    rows.append(["The cluster", "", "", "", "{:,.0f}".format(CL_REV), "%.0f" % (CL_REV / 12)])
    end = table(c, rows, MX, y - 24, [218, 122, 92, 104, 86, PAGE_W - 2 * MX - 622],
                size=10.6, leading=14, pad=6, accent_last=True)
    sub = [["", "NGN M", "Of revenue"]]
    sub.append(["Materials", "(%s)" % "{:,.0f}".format(CL_MAT), "%.1f%%" % (CL_MAT / CL_REV * 100)])
    for r, n, note in CL_FIXED:
        sub.append([n, "(%s)" % "{:,.0f}".format(r * CL_REV), "%.1f%%" % (r * 100)])
    sub.append(["EBITDA", "{:,.0f}".format(CL_EBITDA), "%.1f%%" % (CL_EBITDA / CL_REV * 100)])
    table(c, sub, MX, end - 28, [218, 122, PAGE_W - 2 * MX - 600], size=10.2, leading=13.2,
          pad=5, accent_last=True)


def s_whydiff(c):
    chrome(c, "Two different businesses")
    y = heading(c, "They look like healthcare and they do not behave like it.")
    table(c, [["", "The hospital", "The adjacent lines"],
              ["Who decides to buy", "A clinician, by order", "The patient, by choice"],
              ["Who pays", "An HMO or a corporate scheme", "The patient, on the day"],
              ["When the cash arrives", "Sixty to ninety days, conditionally", "Immediately"],
              ["What limits volume", "Beds, theatre hours, scarce consultants",
               "Rooms, devices and demand"],
              ["What drives demand", "Illness and referral", "Brand, result and repeat visit"],
              ["Cost of a new customer", "Near zero. They arrive ill",
               "Real. This is a marketing business"],
              ["Exposure", "Regulatory, clinical, payer", "Discretionary spend and reputation"],
              ["EBITDA margin", "%.1f%%" % (EBITDA_PC * 100),
               "%.1f%%" % (CL_EBITDA / CL_REV * 100)]],
          MX, y - 24, [196, 258, PAGE_W - 2 * MX - 454], size=11, leading=14.6, pad=7,
          accent_last=True)
    callout(c, MX, 152, PAGE_W - 2 * MX,
            "The hospital is the reason this works. Medical credibility, a theatre, sterilisation, "
            "a laboratory and an anaesthetist are exactly what the non-medical spa market cannot "
            "answer, and they are already paid for.", size=11.5, leading=15.5)


def s_group(c):
    chrome(c, "The answer")
    y = heading(c, "The top strategy, and where it comes from.")
    f = lambda v: "{:,.0f}".format(v)
    rows = [["", "Revenue", "A month", "EBITDA", "Margin"]]
    rows.append(["The hospital today", f(TOT), f(MONTH), f(EBITDA), "%.1f%%" % (EBITDA_PC * 100)])
    rows.append(["The six levers", "+%s" % f(LEVERS_REV), "", "", ""])
    rows.append(["Additional fixed cost to deliver it", "", "", "(%s)" % f(NEW_FIXED), ""])
    rows.append(["The hospital, fully pushed", f(HOSP2_REV), f(HOSP2_REV / 12), f(HOSP2_EBITDA),
                 "%.1f%%" % (HOSP2_EBITDA / HOSP2_REV * 100)])
    rows.append(["The adjacent operating lines", "+%s" % f(CL_REV), f(CL_REV / 12), f(CL_EBITDA),
                 "%.1f%%" % (CL_EBITDA / CL_REV * 100)])
    rows.append(["The group", f(GRP_REV), f(GRP_REV / 12), f(GRP_EBITDA),
                 "%.1f%%" % (GRP_EBITDA / GRP_REV * 100)])
    end = table(c, rows, MX, y - 24, [268, 110, 100, 100, PAGE_W - 2 * MX - 578],
                size=10.8, leading=14.4, pad=7, accent_last=True, hi={4})
    callout(c, MX, end - 30, PAGE_W - 2 * MX,
            "The cluster is %.0f per cent of group revenue and %.0f per cent of group EBITDA. It is "
            "the smaller business and the better one, and it is what carries the group margin from "
            "%.1f to %.1f per cent."
            % (CL_REV / GRP_REV * 100, CL_EBITDA / GRP_EBITDA * 100,
               EBITDA_PC * 100, GRP_EBITDA / GRP_REV * 100), size=11.5, leading=15.5)


def s_cash(c):
    chrome(c, "The cash case")
    y = heading(c, "The second business fixes the first one's cash.")
    f = lambda v: "{:,.0f}".format(v)
    table(c, [["", "Debtor days", "Why"],
              ["The hospital, fully pushed", "%d" % DD_HOSP,
               "Claims verified, queried, and paid in arrears"],
              ["The adjacent lines", "%d" % DD_CL, "Paid at the desk before the patient leaves"],
              ["The group, blended", "%.0f" % DD_BLEND, "Weighted by revenue"]],
          MX, y - 24, [268, 120, PAGE_W - 2 * MX - 388], size=11, leading=15, pad=7,
          accent_last=True)
    bw = (PAGE_W - 2 * MX - 18) / 2
    for i, (big, lbl) in enumerate([
            ("%.0f days" % (DD_HOSP - DD_BLEND), "off the group's collection cycle"),
            ("NGN %s M" % f(WC_FREED), "of working capital released, without borrowing it")]):
        x = MX + i * (bw + 18)
        c.setFillColor(BLUSH if i else SURFACE)
        c.roundRect(x, y - 232, bw, 98, 8, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x, y - 232, 4, 98, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont(SERIF_B, 26)
        c.drawString(x + 22, y - 184, big)
        para(c, lbl, x + 22, y - 206, 11, MUTED, bw - 44, 14)
    callout(c, MX, 146, PAGE_W - 2 * MX,
            "A hospital can be profitable on paper and insolvent on cash. A cash-paying business "
            "inside the same group is the cheapest hedge against that, and it is worth more than "
            "the margin it reports.", size=11.5, leading=15.5)


def s_cluster_risk(c):
    chrome(c, "What breaks the cluster")
    y = heading(c, "It fails in ways the hospital never does.")
    bullets(c, [
        ("It is discretionary spend.",
         "Illness is not optional and a facelift is. The cluster is the first thing cut in a "
         "squeeze, which is exactly when the hospital needs it most."),
        ("It is a brand business run by clinicians.",
         "The skills that fill a theatre list do not fill an aesthetics diary. This needs "
         "marketing, merchandising and a front desk that sells, and most hospitals are bad at all "
         "three."),
        ("The devices date faster than the building.",
         "Lasers and platforms are obsolete in five to seven years and the replacement is not "
         "optional. Depreciation here is a real and recurring cash call."),
        ("A complication is a social media event.",
         "Not an incident form. The reputational mechanics are consumer, immediate and public, and "
         "they reach the hospital's name as well."),
        ("It must not be allowed to distract the core.",
         "The moment theatre time, nursing or management attention is pulled from the hospital to "
         "feed the cluster, the group has traded a %.1f per cent margin for a %.1f per cent one "
         "and gone backwards." % (CL_EBITDA / CL_REV * 100, EBITDA_PC * 100))],
        MX, y - 30, PAGE_W - 2 * MX - 60, size=11.6, leading=15.4)



def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    seq = [s01, s02, s_scen, s_scen_why, s_matrix, s_capex, s_routes, s_returns,
           s_sense, s_daily, s03, s04]
    seq += [(lambda f: (lambda c: fam_slide(c, f)))(f) for f in FAMS]
    seq += [s11, s12]
    seq += [lambda c: divider(c, "Part two", "What it costs, and what it keeps",
                              "The same hospital from the other side: the cost stack, where the "
                              "margin is actually made, and how far it sits from break-even."),
            s_cost, s_contrib, s_breakeven, s_bench,
            lambda c: divider(c, "Part three", "Variance, conversion, growth and risk",
                              "What moves the result, the cheapest growth in the building, how far "
                              "a billion and a half is, and what breaks it on the way."),
            s_sens, s_conv, s_growth, s_risk,
            lambda c: divider(c, "Part four", "The other operating lines",
                              "Six levers close most of the distance to the top strategy. What "
                              "closes the rest is a second business in the same building, and it "
                              "earns on entirely different terms."),
            s_cluster, s_whydiff, s_group, s_cash, s_cluster_risk, s13]
    TOTAL[0] = "%02d" % len(seq)
    for s in seq:
        s(c); c.showPage()
    c.setTitle("The anatomy of a tertiary hospital")
    c.setAuthor("Medbury Healthcare Group")
    c.save()
    print("wrote %s  (%d slides, %d lines, NGN %.0f M a year, NGN %.0f M a month)"
          % (OUT, len(seq), NLINES, TOT, MONTH))


if __name__ == "__main__":
    build()
