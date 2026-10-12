"""
Solace Healthcare, Games Village Abuja: the model.

Five residential units converted in three phases, inside the complex already owned.
No second property. No computed tomography or magnetic resonance on site, both go to
the flagship centre. Monthly cash model over seven years.

Money is NGN millions unless a name says otherwise.
"""

from __future__ import annotations

HORIZON = 84
DAYS = 30.4
HURDLE = 0.25

UNITS = 5
BEDROOMS_PER_UNIT = 6          # 30 rooms across the complex before a wall is moved
GROSS_SQM = 1_900.0            # five six-bedroom units plus quarters, pending survey
NET_FACTOR = 0.68
CONVERT_RATE = 430.0           # NGN '000 a square metre, clinical grade with structure
P1_SQM, P2_SQM = 1_250.0, 650.0
NET_SQM = GROSS_SQM * NET_FACTOR
SURVEY_VARIANCE = 0.342        # how far the last Abuja conversion's brief was out

OPEN_P1, OPEN_P2, OPEN_P3 = 9, 17, 22

# name, opens, steady state NGN m/month, half-life months, direct cost ratio, phase
LINES = [
    ("Oncology day therapy",                  9,  121.5, 6.2, 0.66, 1),
    ("Radiology and imaging",                  9,   45.0, 4.0, 0.34, 1),
    ("Laboratory and pathology",               9,   64.0, 4.5, 0.46, 1),
    ("Day surgery, endoscopy, interventions", 10,  106.0, 7.5, 0.42, 1),
    ("Family medicine, clinics, corporate",    9,   84.0, 2.8, 0.38, 1),
    ("Pharmacy and retail",                    9,   28.0, 3.5, 0.72, 1),
    ("Rehabilitation and physiotherapy",      11,   20.0, 6.9, 0.40, 1),
    ("Palliative and home based care",        12,   15.4, 8.6, 0.48, 1),
    ("Inpatient, day-of-surgery and HDU",     17,   78.0, 5.3, 0.44, 2),
    ("Renal dialysis",                        22,   44.0, 5.0, 0.52, 3),
]
SPOKE = "Diagnostic and clinic spoke"   # retired: no second property is being taken
SPOKE_CAPEX = 0.0

# Phase three is not a new building. It is the same walls worked harder: a six day
# week, evening sessions, more chairs. Only pays if the demand is there to fill it.
INTENSIFY = 1.12
INTENSIFY_LINES = ("Radiology and imaging", "Laboratory and pathology",
                   "Day surgery, endoscopy, interventions", "Family medicine, clinics, corporate")

DRIVERS = [
    ("Oncology day therapy", "85 patients on active treatment each month",
     "Chairs are not the constraint at this size. Referral volume is"),
    ("Radiology and imaging", "24 ultrasound, 16 plain film, 9 breast studies a day",
     "No computed tomography and no magnetic resonance on site. Both go to the flagship"),
    ("Laboratory and pathology", "135 tests a day plus 110 histopathology cases a month",
     "Rapid and routine in house, molecular and immunohistochemistry sent out"),
    ("Day surgery, endoscopy, interventions",
     "85 theatre cases, 110 endoscopies, 75 access procedures a month",
     "Surgeon sessions are the constraint here, not rooms"),
    ("Family medicine, clinics, corporate", "120 clinic visits a day plus 8,000 retained lives",
     "The promoter's own practice is the opening base"),
    ("Pharmacy and retail", "outpatient dispensing attached to clinic and day case volume",
     "Excludes oncology drugs, which sit in the oncology line"),
    ("Rehabilitation and physiotherapy", "38 sessions a day",
     "Oncology rehabilitation, lymphoedema, post-surgical and musculoskeletal"),
    ("Palliative and home based care", "48 households on an active package",
     "Requires a controlled drug licence, which is a phase one filing"),
    ("Inpatient, day-of-surgery and HDU", "28 beds at 55 per cent occupancy",
     "Four of them high dependency, six ring-fenced for palliative admissions"),
    ("Renal dialysis", "14 stations, two shifts a day, six days a week",
     "Fits a residential unit without structural work and suits the same patients"),
]

# name, share of revenue, days to cash
PAYORS = [
    ("Out of pocket and family funded, including diaspora", 0.44, 0),
    ("Corporate self-funded, retainers, missions",          0.21, 38),
    ("Private health maintenance organisations",            0.21, 82),
    ("NHIA formal sector, Cancer Health Fund, vulnerable group fund", 0.10, 135),
    ("Charity, manufacturer access programmes, non-governmental", 0.04, 60),
]
DSO = sum(s * d for _n, s, d in PAYORS)
DIO, DPO = 34, 26

CAPEX = {
    0: [("Measured survey, structural and services investigation", 14.0),
        ("Change of use, planning and development control", 16.0),
        ("Architecture and engineering, design to tender", 32.0),
        ("Corporate formation, shareholders' agreement, legal", 16.0)],
    1: [("Conversion, structure and clinical fit-out, 1,250 sqm", 537.5),
        ("Power: transformer, synchronised generation, uninterruptible supply, solar", 124.0),
        ("Ventilation, medical gas, water treatment", 100.0),
        ("Radiology equipment: ultrasound, digital radiography, mammography", 148.0),
        ("Radiology rooms, shielding and regulatory authorisation", 24.0),
        ("Laboratory, reagent rental deposits and histopathology", 54.0),
        ("Oncology day unit, 20 chairs, compounding isolator and clean room", 196.0),
        ("Theatre one, endoscopy suite and sterile services", 296.0),
        ("Rehabilitation gymnasium", 42.0),
        ("Records system, network, furniture, security, signage", 145.0),
        ("Ambulance", 46.0),
        ("Commissioning, licences, radiation authority, staff training", 52.0)],
    2: [("Conversion of the remaining units, 650 sqm", 279.5),
        ("Bed lift, external shaft and supporting structure", 104.0),
        ("Ward fit-out, 28 beds including four high dependency", 250.0),
        ("Theatre two", 142.0),
        ("Oxygen plant, services upgrade, additional sterile capacity", 46.0)],
    3: [("Dialysis unit: 14 stations, water treatment, conversion of the last unit", 205.0),
        ("Centre of excellence: accreditation, registry, tumour board, trials unit", 118.0),
        ("Additional infusion chairs and works to support a six day week", 40.0),
        ("Reporting platform and remote multidisciplinary team capability", 44.0)],
}
CAPEX_MONTHS = {0: range(1, 4), 1: range(3, 10), 2: range(11, 18), 3: range(19, 25)}
CAPEX_WEIGHTS = {
    0: [1 / 3, 1 / 3, 1 / 3],
    1: [0.083, 0.146, 0.187, 0.208, 0.194, 0.125, 0.057],
    2: [0.093, 0.170, 0.201, 0.201, 0.170, 0.108, 0.057],
    3: [0.112, 0.179, 0.223, 0.223, 0.156, 0.107],
}
CAPEX_TOTAL = {k: sum(v for _n, v in items) for k, items in CAPEX.items()}

OVERHEAD_STEPS = [(1, 5.0), (4, 11.0), (7, 30.0), (OPEN_P1, 88.0),
                  (OPEN_P2, 126.0), (OPEN_P3, 147.0)]
OVERHEAD_DETAIL = [
    ("Salaried clinical and scientific establishment", 72.0),
    ("Power, fuel and hybrid generation", 19.0),
    ("Estate, security, cleaning, waste and laundry", 13.0),
    ("Equipment service contracts and biomedical engineering", 9.0),
    ("Marketing, business development and referral programme", 9.0),
    ("Indirect consumables", 5.0),
    ("Records system, connectivity and telephony", 3.5),
    ("Insurance and professional indemnity", 3.0),
    ("Professional, regulatory and audit", 2.5),
    ("Facility leadership and administration", 10.0),
]

RATES = {"Partner": 750, "Principal": 450, "Senior consultant": 300,
         "Consultant": 190, "Analyst": 120}          # NGN '000 a day
GRADES = list(RATES)
PROGRAMME_RATE = 0.10
MOBILISATION = 25.0

ONCO_DCR_GOOD = 0.60   # drug cost if access programme sourcing lands, against 0.66 planned


def maturity(month, opens, half_life):
    e = month - opens + 1
    return 0.0 if e < 1 else e / (e + half_life)


def overhead(month, delay=0):
    v = 0.0
    for start, amount in OVERHEAD_STEPS:
        if month >= start + (delay if start >= OPEN_P1 else 0):
            v = amount
    return v if month >= 1 else 0.0


def capex_schedule(capex_mult=1.0, delay=0, drop_spoke=False):
    sched = [0.0] * (HORIZON + 1)
    for ph, months in CAPEX_MONTHS.items():
        total = CAPEX_TOTAL[ph]
        mult = capex_mult if ph else 1.0
        for w, mth in zip(CAPEX_WEIGHTS[ph], months):
            sched[min(mth + (delay if ph else 0), HORIZON)] += total * w * mult
    return sched


def build(line_mult=None, dso=None, capex_mult=1.0, delay=0,
          drop_spoke=False, overhead_mult=1.0, dcr_override=None, intensify=True):
    """One monthly run. Every stress case is this function with different arguments."""
    line_mult = line_mult or {}
    dso = DSO if dso is None else dso
    dcr = {n: d for n, _o, _s, _h, d, _p in LINES}
    dcr.update(dcr_override or {})
    cap = capex_schedule(capex_mult, delay, drop_spoke)
    rev, direct, ovh, ebitda, nwc, cash, cum = ([0.0] * (HORIZON + 1) for _ in range(7))
    prev_nwc = 0.0
    for t in range(1, HORIZON + 1):
        lr = {}
        for name, opens, steady, hl, _d, _p in LINES:
            v = steady * line_mult.get(name, 1.0) * maturity(t, opens + delay, hl)
            if intensify and name in INTENSIFY_LINES and t >= OPEN_P3 + delay:
                v *= INTENSIFY
            lr[name] = v
        r = sum(lr.values())
        d = sum(v * dcr[k] for k, v in lr.items())
        o = overhead(t, delay) * overhead_mult
        rev[t], direct[t], ovh[t] = r, d, o
        ebitda[t] = r - d - o
        nwc[t] = r * dso / DAYS + d * (DIO - DPO) / DAYS
        cash[t] = ebitda[t] - cap[t] - (nwc[t] - prev_nwc)
        prev_nwc = nwc[t]
        cum[t] = cum[t - 1] + cash[t]
    return dict(rev=rev, direct=direct, ovh=ovh, ebitda=ebitda, nwc=nwc,
                cash=cash, cum=cum, capex=cap)


def irr(flows, lo=-0.9, hi=3.0):
    f = lambda r: sum(c / (1 + r) ** (i / 12) for i, c in enumerate(flows))
    if f(lo) * f(hi) > 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if f(mid) > 0 else (lo, mid)
    return (lo + hi) / 2


def metrics(M):
    cum, cash = M["cum"], M["cash"]
    trough = min(range(1, HORIZON + 1), key=lambda t: cum[t])
    payback = next((t for t in range(trough, HORIZON + 1) if cum[t] >= 0), None)
    npv = sum(cash[t] / (1 + HURDLE) ** (t / 12) for t in range(1, HORIZON + 1))
    return dict(peak=-cum[trough], trough_m=trough, payback=payback, npv=npv,
                irr=irr([0.0] + cash[1:]))


def crosses(M, target=400.0):
    return next((t for t in range(1, HORIZON + 1) if M["rev"][t] >= target), None)
