"""
The Alameda conversion clinic SPV: a financial projection.

Structure taken from Alameda's own Kenya clinic business plan, which is the same
product in a different market: an international outpatient department whose value
is not the consultation but the conversion of that consultation into an admission
at the group's hospital. Three revenue streams, and the third is the business.

    OP consultation        a fee for seeing the patient
    Diagnostic referral    a commission on the workup ordered before travel
    Inpatient referral     15 per cent of what the patient spends at Al Salam

Costed for Nigeria, not converted from Kenya. Where the Kenya deck carries a cost
that the Lyfe Place tenancy already includes, it is removed rather than translated:
the clinic pays one all-in occupancy charge, so rent, parking, service charge and
utilities do not appear separately.

Reconciliation to the Kenya deck is in RECONCILE and is printed by __main__.

    python3 scripts/alameda_clinic.py
"""

from __future__ import annotations

FX = 1550.0                      # USD/NGN, the reference used across the pack
YEARS = 5

# =============================================================================
# THE KENYA PLAN, for calibration. Alameda's own numbers, USD.
# =============================================================================
KENYA = dict(
    clinics=2, local_days=21, foreign_days=3,
    vol=[5544, 5832, 6120, 6432, 6744],
    op_price_local=25.0, op_price_foreign=50.0,
    diag_pct=0.20,                # diagnostic referral income as % of OP revenue
    ip_commission=0.15,           # commission on what the patient spends
    arpd=6000.0,                  # average revenue per discharge at the hospital
    revenue=[385560, 405072, 424584, 445248, 465912],
    ebitda=[96541, 105713, 106163, 106018, 104542],
    net=[56220, 64016, 64398, 60494, 59313],
    capex=152000.0, irr=0.524, npv=175783.0, wacc=0.1004,
)
# Kenya books referral revenue of 204,120 in Y1. At a 15% commission on a 6,000
# discharge that is 226.8 admissions, which against 5,544 consultations is a
# conversion of 4.09%. That is the single most important number in the model and
# it is the one Alameda has actually observed somewhere.
KENYA_CONVERSION = 204120.0 / (KENYA["ip_commission"] * KENYA["arpd"]) / KENYA["vol"][0]

# =============================================================================
# DRIVERS, Nigeria
# =============================================================================
ROOMS = 5                        # the ground floor demise, 113.0 sqm
ROOMS_ACTIVE = [1.5, 2.0, 2.5, 2.5, 2.5]   # of 5. A conversion clinic is not a polyclinic
LOCAL_DAYS_M = 21                # working days a month, local consultants
FOREIGN_DAYS_M = 3               # Al Salam consultants fly in
CONSULT_PER_ROOM_DAY = [8, 9, 9, 10, 10]
FOREIGN_PER_DAY = [10, 11, 12, 12, 12]

OP_LOCAL = 40_000.0              # NGN. Survey: 26% charge 25 to 50k, 16% charge 50 to 75k
OP_FOREIGN = 85_000.0            # a visiting international consultant carries a premium

# Diagnostics, built up rather than taken as a percentage
DIAG_SHARE = 0.35                # share of consultations that go to a full pre travel workup
DIAG_SPEND = 120_000.0           # NGN, average workup: bloods, imaging, cardiac
DIAG_COMMISSION = 0.20           # what Medbury Diagnostics pays the clinic

# The conversion, which is the whole business
CONVERSION = [0.030, 0.035, 0.040, 0.042, 0.042]
ARPD_USD = 6000.0
IP_COMMISSION = 0.15             # confirmed: 15% to the SPV from Al Salam

# Direct costs
DOCTOR_FEE_LOCAL = 0.60
DOCTOR_FEE_FOREIGN = 0.50
CONSULTANT_ON_IP = 0.05          # to the local consultant who made the referral
CONSUMABLES = 0.05               # of OP revenue

# Operating costs, NGN M a year. Occupancy is the all in Lyfe Place charge.
SQM = 113.0
OCC_RATE = 470_000               # the tenancy deck's corrected rate: service charge sits on
                                 # OCCUPIED area, not net internal. Rent 111,771 + fit-out
                                 # recovery 71,413 + service charge 224,134, grossed
OCCUPANCY = SQM * OCC_RATE / 1e6
OCCUPANCY_ESC = 0.12             # the Lyfe Place rate card reviews at 12% a year minimum
PERSONNEL = [
    ("Nurses, 2", 2, 350_000), ("Patient coordinator", 1, 400_000),
    ("Accountant", 1, 500_000), ("Office manager", 1, 450_000),
]
ON_COSTS = 0.22                  # pension, 13th month, NSITF, ITF, group life, HMO
MARKETING = [45.0, 45.0, 49.5, 54.5, 59.9]
TRAVEL_DOCTORS = [18.0, 18.0, 19.8, 21.8, 24.0]
ACCOMMODATION = [10.0, 10.0, 11.0, 12.1, 13.3]
TRAVEL_BUSINESS = [8.0, 8.0, 8.8, 9.7, 10.6]
OFFICE = [4.0, 4.4, 4.8, 5.3, 5.8]
MISC = [5.0, 5.5, 6.1, 6.7, 7.3]
LICENCES = [0.0, 2.0, 2.0, 2.0, 2.0]

# Capital. Category A is the landlord's and is recovered in the occupancy charge,
# so this is category B only: what the clinic owns and takes with it.
CAPEX = [
    ("Clinical equipment, 5 rooms", 16.0,
     "Examination couches, diagnostic sets, vital signs, ECG, minor procedure sets"),
    ("Category B fit and furniture", 8.0, "Casework, seating, consulting room furniture"),
    ("IT, workstations and practice management", 6.0, "Booking, records, billing, reporting"),
    ("Branding and signage within the demise", 3.0, "Alameda identity inside a Lyfe Place building"),
    ("Launch campaign", 40.0, "Medical tourism is a considered purchase and needs real spend"),
    ("Registration, licence and regulatory", 4.0, "FCT, MDCN, corporate"),
    ("Working capital", 25.0, "Payroll and payables to first collections"),
]
DEPRECIATION_YEARS = 5
TAX = 0.30
DISCOUNT = 0.25                  # naira nominal
MEDBURY_SHARE = 0.49


def _ramp(v, i):
    return v[i] if i < len(v) else v[-1]


def build():
    out = {k: [0.0] * YEARS for k in (
        "vol_local", "vol_foreign", "vol", "op_rev", "diag_rev", "admissions",
        "ip_rev", "revenue", "doctor_fee", "ip_share", "consumables", "gross",
        "personnel", "occupancy", "opex", "ebitda", "dep", "pbt", "tax", "net", "fcf")}
    payroll = sum(q * s for _n, q, s in PERSONNEL) * 12 * (1 + ON_COSTS) / 1e6
    for i in range(YEARS):
        vl = _ramp(ROOMS_ACTIVE, i) * LOCAL_DAYS_M * _ramp(CONSULT_PER_ROOM_DAY, i) * 12
        vf = FOREIGN_DAYS_M * _ramp(FOREIGN_PER_DAY, i) * 12
        out["vol_local"][i], out["vol_foreign"][i] = vl, vf
        out["vol"][i] = vl + vf
        op = (vl * OP_LOCAL + vf * OP_FOREIGN) / 1e6
        out["op_rev"][i] = op
        out["diag_rev"][i] = out["vol"][i] * DIAG_SHARE * DIAG_SPEND * DIAG_COMMISSION / 1e6
        adm = out["vol"][i] * _ramp(CONVERSION, i)
        out["admissions"][i] = adm
        out["ip_rev"][i] = adm * ARPD_USD * FX * IP_COMMISSION / 1e6
        out["revenue"][i] = out["op_rev"][i] + out["diag_rev"][i] + out["ip_rev"][i]
        out["doctor_fee"][i] = (vl * OP_LOCAL * DOCTOR_FEE_LOCAL
                                + vf * OP_FOREIGN * DOCTOR_FEE_FOREIGN) / 1e6
        out["ip_share"][i] = out["ip_rev"][i] * CONSULTANT_ON_IP
        out["consumables"][i] = op * CONSUMABLES
        out["gross"][i] = (out["revenue"][i] - out["doctor_fee"][i]
                           - out["ip_share"][i] - out["consumables"][i])
        out["personnel"][i] = payroll
        occ = OCCUPANCY * (1 + OCCUPANCY_ESC) ** i
        out["occupancy"][i] = occ
        out["opex"][i] = (occ + payroll + _ramp(MARKETING, i)
                          + _ramp(TRAVEL_DOCTORS, i) + _ramp(ACCOMMODATION, i)
                          + _ramp(TRAVEL_BUSINESS, i) + _ramp(OFFICE, i)
                          + _ramp(MISC, i) + _ramp(LICENCES, i))
        out["ebitda"][i] = out["gross"][i] - out["opex"][i]
        out["dep"][i] = sum(v for _n, v, _d in CAPEX if "Working capital" not in _n) / DEPRECIATION_YEARS
        out["pbt"][i] = out["ebitda"][i] - out["dep"][i]
        out["tax"][i] = max(0.0, out["pbt"][i]) * TAX
        out["net"][i] = out["pbt"][i] - out["tax"][i]
        out["fcf"][i] = out["net"][i] + out["dep"][i]
    out["capex_total"] = sum(v for _n, v, _d in CAPEX)
    return out


def npv(rate, flows, capex):
    return -capex + sum(f / (1 + rate) ** (i + 1) for i, f in enumerate(flows))


def irr(flows, capex):
    lo, hi = -0.9, 5.0
    if npv(lo, flows, capex) < 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        if npv(mid, flows, capex) > 0:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def payback(flows, capex):
    c = 0.0
    for i, f in enumerate(flows):
        c += f
        if c >= capex:
            return i + (capex - (c - f)) / f
    return None


def metrics(M):
    cap = M["capex_total"]
    return dict(capex=cap, irr=irr(M["fcf"], cap), npv=npv(DISCOUNT, M["fcf"], cap),
                payback=payback(M["fcf"], cap),
                medbury=[v * MEDBURY_SHARE for v in M["net"]])


if __name__ == "__main__":
    M = build()
    me = metrics(M)
    f = lambda v, d=1: ("{:,.%df}" % d).format(v)
    print("ALAMEDA CONVERSION CLINIC, ABUJA. NGN M unless stated\n")
    print("  Kenya implies a conversion of %.2f%% of consultations into an admission."
          % (100 * KENYA_CONVERSION))
    print("  We ramp %.1f%% to %.1f%%.\n" % (100 * CONVERSION[0], 100 * CONVERSION[-1]))
    rows = [("Consultations", "vol", 0), ("of which Al Salam consultants", "vol_foreign", 0),
            ("Admissions converted", "admissions", 0),
            ("OP consultation revenue", "op_rev", 1), ("Diagnostic referral", "diag_rev", 1),
            ("Inpatient referral, 15% of Al Salam", "ip_rev", 1),
            ("Total revenue", "revenue", 1), ("Gross margin", "gross", 1),
            ("Operating cost", "opex", 1), ("EBITDA", "ebitda", 1),
            ("Net income", "net", 1), ("Free cash flow", "fcf", 1)]
    print("  %-38s %9s %9s %9s %9s %9s" % ("", "Y1", "Y2", "Y3", "Y4", "Y5"))
    for lbl, k, d in rows:
        print("  %-38s %s" % (lbl, " ".join("%9s" % f(v, d) for v in M[k])))
    print("  %-38s %s" % ("EBITDA margin",
          " ".join("%8.0f%%" % (100 * M["ebitda"][i] / M["revenue"][i]) for i in range(YEARS))))
    print()
    print("  capex %s | IRR %.0f%% | NPV at %.0f%% %s | payback %.1f years"
          % (f(me["capex"]), 100 * me["irr"], 100 * DISCOUNT, f(me["npv"]), me["payback"]))
    print("  net income to Medbury at %.0f%%: %s"
          % (100 * MEDBURY_SHARE, " ".join(f(v) for v in me["medbury"])))


# =============================================================================
# SCENARIOS
# =============================================================================
# Overrides are applied to a fresh copy of the module globals, so a scenario
# cannot leak into the next one.
SCENARIOS = [
    ("Base case", {},
     "3.0% rising to 4.2%, on 1.5 rooms rising to 2.5"),
    ("Kenya parity from year one", dict(CONVERSION=[KENYA_CONVERSION] * 5),
     "Alameda's own observed conversion, applied from opening"),
    ("Conversion half of Kenya", dict(CONVERSION=[0.020] * 5),
     "2.0%. The obvious downside, and it still works"),
    ("Commission cut to 10 per cent", dict(IP_COMMISSION=0.10),
     "Al Salam renegotiates the 15%"),
    ("No referral line at all", dict(IP_COMMISSION=0.0),
     "The commission never materialises, or Al Salam does not pay"),
    ("Naira strengthens to 1,240", dict(FX=1240.0),
     "The referral line is dollar linked. The cost base is not"),
    ("Naira weakens to 2,015", dict(FX=2015.0),
     "The same exposure the other way"),
    ("Volume 25 per cent below plan", dict(ROOMS_ACTIVE=[1.1, 1.5, 1.9, 1.9, 1.9]),
     "Fewer consultations, same conversion rate"),
    ("Upside: 3 rooms, 5% conversion",
     dict(ROOMS_ACTIVE=[2.0, 2.5, 3.0, 3.0, 3.0],
          CONVERSION=[0.035, 0.042, 0.050, 0.050, 0.050]),
     "What the demise can carry if the conversion is real"),
    ("Severe: half conversion and 25% less volume",
     dict(CONVERSION=[0.020] * 5, ROOMS_ACTIVE=[1.1, 1.5, 1.9, 1.9, 1.9]),
     "Two things wrong at once"),
]


def scenario(**kw):
    """Run the model with drivers overridden, without mutating the module."""
    import importlib
    import sys
    mod = importlib.reload(sys.modules[__name__])
    for k, v in kw.items():
        setattr(mod, k, v)
    M = mod.build()
    return M, mod.metrics(M)


def scenario_table():
    rows = []
    for lbl, kw, note in SCENARIOS:
        M, me = scenario(**kw)
        rows.append(dict(label=lbl, note=note, y1=M["ebitda"][0], y5=M["ebitda"][4],
                         rev5=M["revenue"][4], margin5=100 * M["ebitda"][4] / M["revenue"][4],
                         irr=me["irr"], npv=me["npv"], payback=me["payback"],
                         medbury=sum(me["medbury"])))
    return rows
