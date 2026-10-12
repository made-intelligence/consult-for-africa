"""
Cost schedules for the Medbury Alameda SPV.

Sub-schedules that sit under a line in medbury_alameda_centre.CAPEX, and the
build-ups behind the largest operating lines. Every one of them is asserted
against its parent, so a schedule that stops adding up fails the import rather
than printing a document that does not reconcile.

Data only. No layout.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import medbury_alameda_centre as C

CAPEX = {n: v for n, v, _d in C.CAPEX}
TOTAL_CAPEX = sum(v for _n, v, _d in C.CAPEX)

# ---- equipment schedules. Indicative at supplier list level, firmed at BOQ.
LAB = [
    ("Chemistry analyser, random access, with ISE", 45.0),
    ("Immunoassay, chemiluminescence", 42.0),
    ("Haematology, 5 part differential", 28.0),
    ("PCR: thermocycler, extraction, biosafety cabinet", 25.0),
    ("Coagulation analyser", 15.0),
    ("Microbiology: incubator, autoclave, microscopy", 12.0),
    ("Centrifuges, cold chain, water system, benching", 13.0),
]
IMG = [
    ("Digital radiography, flat panel detector", 62.0),
    ("Ultrasound, multi probe with Doppler", 45.0),
    ("Echocardiography system", 35.0),
    ("X-ray room shielding, lead lining, warning systems", 18.0),
    ("Cardiology: ECG, Holter, ambulatory BP, spirometry", 12.0),
    ("Radiology console, reporting workstation, DICOM", 10.0),
]
PROC = [
    ("Two procedure tables, lights, diathermy", 22.0),
    ("Monitoring, suction, crash trolley", 18.0),
    ("CSSD: autoclave", 14.0),
    ("CSSD: washer disinfector", 7.0),
    ("CSSD: sterile packing and storage", 4.0),
]
OBS = [
    ("Nine beds, lockers and bed side fit", 14.0),
    ("Patient monitors and central station", 15.0),
    ("Infusion pumps, trolleys and resuscitation", 6.0),
]
SYS = [
    ("HIS, LIS and PACS, with implementation", 28.0),
    ("Network, servers, archive and cabling", 17.0),
    ("Category B furniture and consulting fit", 30.0),
    ("Pharmacy fit, shelving and cold chain", 15.0),
    ("Biomedical workshop", 8.0),
]

GROUPS = [
    ("Diagnostics", ["Digital X-ray, shielding and console",
                     "Laboratory: chemistry, haematology, coagulation, immunoassay, PCR",
                     "Ultrasound with Doppler", "Echocardiography",
                     "Cardiology: ECG, Holter, ambulatory BP, spirometry"],
     "the part that earns on every patient"),
    ("Clinical", ["Two procedure suites", "CSSD: autoclave, washer, sterile storage",
                  "Observation unit, 9 beds and monitoring"],
     "procedures, sterile services, 9 beds"),
    ("Systems and fit", ["IT: HIS, LIS, PACS, network, archive",
                         "Category B furniture and consulting fit",
                         "Pharmacy fit, shelving and cold chain", "Biomedical workshop"],
     "what the building needs to run"),
    ("Launch and stock", ["Launch campaign", "Registration, licence and regulatory",
                          "Working capital"],
     "cash out before the first bill"),
]

# ---- the occupancy rate, quoted as three lines. Per sqm a year.
# Cost of housing a tenant, grossed to the rate actually charged.
OCC_COST = {"Rent": 111_771.0, "Fit-out recovery": 71_413.0, "Service charge": 224_134.0}
_G = C.OCC_RATE / sum(OCC_COST.values())
OCC_SPLIT = [
    ("Rent", OCC_COST["Rent"] * _G, "The space itself. Fixed for the five year term"),
    ("Fit-out recovery", OCC_COST["Fit-out recovery"] * _G,
     "The Lyfe Place fit-out, recovered across the term, then it falls away"),
    ("Service charge", OCC_COST["Service charge"] * _G,
     "Power, security, cleaning, facilities, insurance, reception and ICT"),
]

# ---- the establishment, grouped
STAFF_GROUPS = [
    ("Nursing and observation unit", ["Nursing, including observation unit"]),
    ("Diagnostic and dispensary", ["Laboratory scientists and technicians",
                                   "Radiographers and sonographer", "Cardiac technician",
                                   "Pharmacists and dispensary"]),
    ("Patient facing and revenue cycle", ["Concierge and case management",
                                          "Reception, registration and cashier",
                                          "Billing, claims and accounts"]),
    ("Management and technical", ["Centre management", "Biomedical engineer"]),
]

# ---- what the year one marketing budget buys
MARKETING_SPLIT = [
    ("Digital, search and social, always on", 18.0),
    ("Corporate and HMO business development", 14.0),
    ("Diaspora and referring physician programme", 12.0),
    ("Open days, screening drives and events", 10.0),
    ("Brand, signage, print and collateral", 8.0),
    ("Public relations and medical media", 8.0),
]

_STAFF = {n: (q, s) for n, q, s in C.STAFF}


def _eq(a, b, what):
    if abs(a - b) > 0.01:
        raise AssertionError("%s: schedule %.2f does not match parent %.2f" % (what, a, b))


_eq(sum(v for _n, v in LAB),
    CAPEX["Laboratory: chemistry, haematology, coagulation, immunoassay, PCR"], "laboratory")
_eq(sum(v for _n, v in IMG),
    CAPEX["Digital X-ray, shielding and console"] + CAPEX["Ultrasound with Doppler"]
    + CAPEX["Echocardiography"] + CAPEX["Cardiology: ECG, Holter, ambulatory BP, spirometry"],
    "imaging and cardiology")
_eq(sum(v for _n, v in PROC),
    CAPEX["Two procedure suites"] + CAPEX["CSSD: autoclave, washer, sterile storage"],
    "procedures and CSSD")
_eq(sum(v for _n, v in OBS), CAPEX["Observation unit, 9 beds and monitoring"], "observation")
_eq(sum(v for _n, v in SYS),
    CAPEX["IT: HIS, LIS, PACS, network, archive"]
    + CAPEX["Category B furniture and consulting fit"]
    + CAPEX["Pharmacy fit, shelving and cold chain"] + CAPEX["Biomedical workshop"], "systems")
_eq(sum(CAPEX[k] for _l, ks, _n in GROUPS for k in ks), TOTAL_CAPEX, "capital groups")
_eq(sum(v for _n, v, _d in OCC_SPLIT), C.OCC_RATE, "occupancy rate")
_eq(sum(q for _n, q, _s in C.STAFF),
    sum(_STAFF[r][0] for _g, rs in STAFF_GROUPS for r in rs), "establishment headcount")
_eq(sum(v for _n, v in MARKETING_SPLIT), C.MARKETING[0], "marketing")


def staff_group_rows():
    """(label, posts, gross monthly, loaded monthly) per group, plus the total."""
    out = []
    for lbl, roles in STAFF_GROUPS:
        q = sum(_STAFF[r][0] for r in roles)
        g = sum(_STAFF[r][0] * _STAFF[r][1] for r in roles)
        out.append((lbl, q, g, g * (1 + C.ON_COSTS)))
    return out


def direct_split(M):
    """Annual direct cost broken into four groups, in NGN M, per year."""
    n = C.YEARS
    clin = [(M["vol_local"][i] * C.OP_LOCAL * C.DOCTOR_FEE_LOCAL
             + M["vol_foreign"][i] * C.OP_FOREIGN * C.DOCTOR_FEE_FOREIGN) / 1e6
            + M["ip_rev"][i] * C.CONSULTANT_ON_IP for i in range(n)]
    diag = [M["lab"][i] * C.LAB_CONSUMABLES
            + (M["imaging"][i] + M["cardio"][i]) * C.IMAGING_CONSUMABLES for i in range(n)]
    phar = [M["pharmacy"][i] * C.PHARMACY_COGS for i in range(n)]
    proc = [M["procedures"][i] * C.PROCEDURE_CONSUMABLES
            + M["observation"][i] * C.OBSERVATION_CONSUMABLES
            + M["exec_rev"][i] * C.EXEC_CONSUMABLES for i in range(n)]
    rows = [("Clinician fees and consultant share", clin),
            ("Laboratory reagents and imaging consumables", diag),
            ("Pharmacy cost of goods", phar),
            ("Procedure, observation and executive workup", proc)]
    for i in range(n):
        _eq(sum(r[1][i] for r in rows), M["direct"][i], "direct cost year %d" % (i + 1))
    return rows


def fixed_split(M):
    """Annual fixed cost line by line, in NGN M, per year."""
    n = C.YEARS
    r = lambda v: [v[i] if i < len(v) else v[-1] for i in range(n)]
    rows = [("Occupancy, %s sqm at NGN %s a sqm" % ("{:,.1f}".format(C.SQM),
                                                    "{:,.0f}".format(C.OCC_RATE)),
             [C.SQM * C.OCC_RATE / 1e6 * (1 + C.OCC_ESC) ** i for i in range(n)]),
            ("Personnel, %d posts loaded" % sum(q for _x, q, _s in C.STAFF), M["personnel"]),
            ("Marketing and demand generation", r(C.MARKETING)),
            ("As-Salam consultant travel and accommodation",
             [a + b for a, b in zip(r(C.TRAVEL_DOCTORS), r(C.ACCOMMODATION))]),
            ("Biomedical maintenance contracts", r(C.MAINTENANCE)),
            ("Office, business travel, misc and licences",
             [a + b + c + d for a, b, c, d in zip(r(C.OFFICE), r(C.TRAVEL_BUSINESS),
                                                  r(C.MISC), r(C.LICENCES))])]
    for i in range(n):
        _eq(sum(x[1][i] for x in rows), M["opex"][i], "fixed cost year %d" % (i + 1))
    return rows


# ---- the rate behind each direct cost line, for the variable stack
DRIVERS = [
    ("Doctor fee", "%.0f%% of a local consultation, %.0f%% of an As-Salam one"
     % (100 * C.DOCTOR_FEE_LOCAL, 100 * C.DOCTOR_FEE_FOREIGN)),
    ("Laboratory reagents", "%.0f%% of laboratory revenue" % (100 * C.LAB_CONSUMABLES)),
    ("Imaging and cardiology consumables",
     "%.0f%% of imaging and cardiology revenue" % (100 * C.IMAGING_CONSUMABLES)),
    ("Pharmacy cost of goods", "%.0f%% of dispensary revenue" % (100 * C.PHARMACY_COGS)),
    ("Procedure consumables", "%.0f%% of procedure revenue" % (100 * C.PROCEDURE_CONSUMABLES)),
    ("Observation consumables",
     "%.0f%% of observation revenue" % (100 * C.OBSERVATION_CONSUMABLES)),
    ("Consultant share of the referral",
     "%.0f%% of the As-Salam commission" % (100 * C.CONSULTANT_ON_IP)),
]

# ---- capital, at component level, in the order it is presented
CAPEX_DETAIL = [
    ("Laboratory, the chalet", LAB),
    ("Imaging and cardiology, ground floor", IMG),
    ("Procedure suites and CSSD, first floor", PROC),
    ("Observation unit, first floor", OBS),
    ("Systems, furniture and dispensary", SYS),
    ("Launch, licence and opening stock",
     [("Launch campaign", CAPEX["Launch campaign"]),
      ("Registration, licence and regulatory", CAPEX["Registration, licence and regulatory"]),
      ("Working capital: reagent, drug and consumable stock", CAPEX["Working capital"])]),
]
_eq(sum(v for _g, rows in CAPEX_DETAIL for _n, v in rows), TOTAL_CAPEX, "capital detail")


def staff_rows():
    """Every post, in the order the establishment is presented."""
    return [(n, q, s, q * s, q * s * (1 + C.ON_COSTS)) for n, q, s in C.STAFF]


# =============================================================================
# THE TENANCY: the SPV on 113 sqm of the ground floor, not the whole building.
# Sub-schedules under alameda_clinic.CAPEX, asserted against it.
# =============================================================================
import alameda_clinic as T  # noqa: E402

T_CAPEX = {n: v for n, v, _d in T.CAPEX}
T_TOTAL_CAPEX = sum(v for _n, v, _d in T.CAPEX)

T_CLINICAL = [
    ("Examination couches, steps and screens, 5 rooms", 3.0),
    ("Minor procedure and dressing sets, instrument trolleys", 2.8),
    ("Vital signs monitors and weighing stations", 2.6),
    ("Diagnostic sets: ophthalmoscope, otoscope, BP, oximetry", 2.4),
    ("ECG machine and trolley", 2.0),
    ("Vaccine and specimen refrigerator, sharps and waste", 1.8),
    ("Examination lights and mobile screens", 1.4),
]
T_FIT = [
    ("Consulting desks, clinician and patient seating, 5 rooms", 3.2),
    ("Casework, storage and worktops", 2.1),
    ("Waiting and reception furniture within the demise", 1.8),
    ("Window treatment, soft furnishing and finishes", 0.9),
]
T_IT = [
    ("Practice management: booking, records, billing, reporting", 2.6),
    ("Workstations, printers and scanners", 2.2),
    ("Network, cabling and peripherals within the demise", 1.2),
]
T_BRAND = [
    ("Entrance and internal signage", 1.6),
    ("Wayfinding, room signage and collateral", 0.8),
    ("Photography and identity application", 0.6),
]
T_LAUNCH = [
    ("Digital, search and social", 11.0),
    ("Corporate, HMO and embassy business development", 8.0),
    ("Diaspora and referring physician programme", 8.0),
    ("Launch event and open days", 6.0),
    ("Public relations and medical media", 4.0),
    ("Brand assets, print and collateral", 3.0),
]
T_REG = [
    ("SPV incorporation, shareholder agreement and statutory", 1.5),
    ("FCT health premises registration and inspection", 1.2),
    ("MDCN practice registration and clinician licensing", 0.8),
    ("Data protection, insurance and professional indemnity", 0.5),
]
T_WC = [
    ("Payroll and consultant fees to first collections", 12.0),
    ("Occupancy deposit top-up and prepayments", 6.0),
    ("Consumables and office opening stock", 4.0),
    ("Contingency float", 3.0),
]

T_CAPEX_DETAIL = [
    ("Clinical equipment, 5 rooms", T_CLINICAL),
    ("Category B fit and furniture", T_FIT),
    ("IT, workstations and practice management", T_IT),
    ("Branding and signage within the demise", T_BRAND),
    ("Launch campaign", T_LAUNCH),
    ("Registration, licence and regulatory", T_REG),
    ("Working capital", T_WC),
]
for _g, _rows in T_CAPEX_DETAIL:
    _eq(sum(v for _n, v in _rows), T_CAPEX[_g], "tenancy capital: %s" % _g)
_eq(sum(v for _g, rows in T_CAPEX_DETAIL for _n, v in rows), T_TOTAL_CAPEX, "tenancy capital")

# What the year one launch and marketing budget buys, once open
T_MARKETING_SPLIT = [
    ("Digital, search and social, always on", 13.0),
    ("Corporate, HMO and embassy accounts", 10.0),
    ("Diaspora and referring physician programme", 9.0),
    ("Open days and screening events", 6.0),
    ("Public relations and medical media", 4.0),
    ("Print, collateral and brand upkeep", 3.0),
]
_eq(sum(v for _n, v in T_MARKETING_SPLIT), T.MARKETING[0], "tenancy marketing")

T_OCC_SPLIT = [(n, v, d) for n, v, d in OCC_SPLIT]   # same rate card, 113 sqm of it


def t_fixed_split(M):
    """Every fixed line, in NGN M, per year. Nine lines, not grouped."""
    n = T.YEARS
    r = lambda v: [v[i] if i < len(v) else v[-1] for i in range(n)]
    rows = [("Occupancy, %s sqm at NGN %s a sqm all in"
             % ("{:,.1f}".format(T.SQM), "{:,.0f}".format(T.OCC_RATE)), M["occupancy"]),
            ("Personnel, %d posts loaded" % sum(q for _x, q, _s in T.PERSONNEL), M["personnel"]),
            ("Marketing and demand generation", r(T.MARKETING)),
            ("As-Salam consultant travel", r(T.TRAVEL_DOCTORS)),
            ("As-Salam consultant accommodation", r(T.ACCOMMODATION)),
            ("Business travel", r(T.TRAVEL_BUSINESS)),
            ("Office and administration", r(T.OFFICE)),
            ("Contingency and miscellaneous", r(T.MISC)),
            ("Licences and annual returns", r(T.LICENCES))]
    for i in range(n):
        _eq(sum(x[1][i] for x in rows), M["opex"][i], "tenancy fixed year %d" % (i + 1))
    return rows


def t_unit(M, i):
    """Per consultation, for year i. Derived from the model, so it reconciles by construction."""
    v = M["vol"][i]
    rev = [("Consultation fee", M["op_rev"][i] * 1e6 / v),
           ("Diagnostic referral commission", M["diag_rev"][i] * 1e6 / v),
           ("As-Salam referral at %.0f%%" % (100 * T.IP_COMMISSION), M["ip_rev"][i] * 1e6 / v)]
    cost = [("Clinician fee", M["doctor_fee"][i] * 1e6 / v),
            ("Consultant share of the referral", M["ip_share"][i] * 1e6 / v),
            ("Consumables", M["consumables"][i] * 1e6 / v)]
    R, K = sum(x[1] for x in rev), sum(x[1] for x in cost)
    _eq(R * v / 1e6, M["revenue"][i], "tenancy unit revenue year %d" % (i + 1))
    _eq(K * v / 1e6, M["revenue"][i] - M["gross"][i], "tenancy unit cost year %d" % (i + 1))
    return dict(rev=rev, cost=cost, revenue=R, direct=K, contribution=R - K,
                margin=100 * (R - K) / R, volume=v)
