"""
Medbury Alameda Centre for Advanced Diagnostics and Specialist Care.

The medical plan, costed. This is NOT the conversion clinic as a tenant on 113 sqm
of the ground floor. It is the whole building: ground floor public and diagnostic,
first floor specialist clinics, procedures and 9 observation beds, the chalet as a
comprehensive laboratory, the boys' quarters as engineering, store and IT.

The Anchored Hybrid, four layers, and only one of them is the referral:

    1  Owned diagnostic and pre-op workup hub    lab, imaging, cardiology
    2  As-Salam flagship referral relationship   15% commission, second partner by Y2
    3  Concierge and case management             visa, travel, post-return follow-up
    4  Corporate, HMO and diaspora contracts     the recurring backbone

The point of layers 1, 3 and 4 is that the earlier model died without layer 2.
Owning the diagnostics is what makes this a business rather than a commission agent.

    python3 scripts/medbury_alameda_centre.py
"""

from __future__ import annotations

FX = 1550.0
YEARS = 5
SQM = 664.3                      # the whole campus
OCC_RATE = 470_000               # Lyfe Place all in rate
OCC_ESC = 0.12

# ---- throughput. 5 consultation rooms, 21 working days.
ROOMS = 5
ROOMS_ACTIVE = [3.0, 3.5, 4.0, 4.5, 4.5]
DAYS_M = 21
PER_ROOM_DAY = [7, 8, 8, 9, 9]   # executive consultations run long. 40 a day, not 50
FOREIGN_DAYS_M = 3               # As-Salam consultants fly in
FOREIGN_PER_DAY = [10, 11, 12, 12, 12]

OP_LOCAL, OP_FOREIGN = 40_000.0, 85_000.0

# ---- layer 1: owned diagnostics. attach rate and average ticket per consultation.
DIAG = [
    ("Laboratory", 0.70, 45_000.0, "Chemistry, haematology, coagulation, immunology, PCR, tumour markers"),
    ("Imaging: X-ray, ultrasound, echo", 0.40, 55_000.0, "Digital DR, Doppler, echocardiography"),
    ("Cardiology diagnostics", 0.20, 35_000.0, "ECG, Holter, ambulatory BP, spirometry"),
]
PROCEDURE_RATE, PROCEDURE_TICKET = 0.08, 350_000.0     # 2 sterile suites
OBSERVATION_RATE, OBSERVATION_TICKET = 0.06, 180_000.0  # 9 beds, day admissions and infusions
PHARMACY_RATE, PHARMACY_TICKET, PHARMACY_MARGIN = 0.50, 25_000.0, 1.0

# ---- layer 4: the recurring backbone
EXEC_PACKAGES = [420, 620, 820, 980, 1100]
EXEC_TICKET = 450_000.0

# ---- layer 3: concierge, charged on every internationally coordinated patient
CONCIERGE_TICKET = 250_000.0
CONCIERGE_MULTIPLE = 1.8         # coordinated patients per patient who actually travels

# ---- layer 2: the referral
CONVERSION = [0.030, 0.035, 0.040, 0.042, 0.042]
ARPD_USD = 6000.0
IP_COMMISSION = 0.15

# ---- direct costs
DOCTOR_FEE_LOCAL, DOCTOR_FEE_FOREIGN = 0.60, 0.50
CONSULTANT_ON_IP = 0.05
LAB_CONSUMABLES = 0.32           # reagents, controls, QC, as a share of lab revenue
IMAGING_CONSUMABLES = 0.08
PHARMACY_COGS = 0.72
PROCEDURE_CONSUMABLES = 0.22
OBSERVATION_CONSUMABLES = 0.18
EXEC_CONSUMABLES = 0.30          # the workup inside an executive package

# ---- establishment. A centre, not a clinic.
STAFF = [
    ("Nursing, including observation unit", 10, 380_000),
    ("Laboratory scientists and technicians", 6, 450_000),
    ("Radiographers and sonographer", 3, 550_000),
    ("Cardiac technician", 1, 400_000),
    ("Pharmacists and dispensary", 3, 480_000),
    ("Concierge and case management", 3, 450_000),
    ("Reception, registration and cashier", 4, 300_000),
    ("Billing, claims and accounts", 3, 400_000),
    ("Biomedical engineer", 1, 500_000),
    ("Centre management", 3, 900_000),
]
ON_COSTS = 0.22

MARKETING = [70.0, 75.0, 82.5, 90.8, 99.8]
TRAVEL_DOCTORS = [18.0, 18.0, 19.8, 21.8, 24.0]
ACCOMMODATION = [10.0, 10.0, 11.0, 12.1, 13.3]
TRAVEL_BUSINESS = [10.0, 10.0, 11.0, 12.1, 13.3]
MAINTENANCE = [22.0, 26.0, 30.0, 33.0, 36.0]      # biomedical contracts on a lot of kit
OFFICE = [8.0, 8.8, 9.7, 10.6, 11.7]
MISC = [10.0, 11.0, 12.1, 13.3, 14.6]
LICENCES = [4.0, 4.0, 4.0, 4.0, 4.0]

CAPEX = [
    ("Digital X-ray, shielding and console", 90.0, "Ground floor, fixed by weight and shielding"),
    ("Laboratory: chemistry, haematology, coagulation, immunoassay, PCR", 180.0, "The chalet"),
    ("Ultrasound with Doppler", 45.0, "Ground floor"),
    ("Echocardiography", 35.0, "Ground floor"),
    ("Cardiology: ECG, Holter, ambulatory BP, spirometry", 12.0, "Ground floor"),
    ("Two procedure suites", 40.0, "First floor, converted kitchen and service area"),
    ("CSSD: autoclave, washer, sterile storage", 25.0, "First floor"),
    ("Observation unit, 9 beds and monitoring", 35.0, "6 general, 3 executive"),
    ("Pharmacy fit, shelving and cold chain", 15.0, "Ground floor"),
    ("IT: HIS, LIS, PACS, network, archive", 45.0, "Boys' quarters"),
    ("Category B furniture and consulting fit", 30.0, ""),
    ("Biomedical workshop", 8.0, "Boys' quarters"),
    ("Launch campaign", 50.0, ""),
    ("Registration, licence and regulatory", 6.0, "FCT, MDCN, MLSCN, PCN, NAFDAC"),
    ("Working capital", 80.0, "A lab and a pharmacy carry stock"),
]
DEP_YEARS = 7                    # medical equipment, not fit-out
TAX = 0.30
DISCOUNT = 0.25
MEDBURY_SHARE = 0.49


def _r(v, i):
    return v[i] if i < len(v) else v[-1]


def build():
    K = ("vol", "vol_local", "vol_foreign", "op_rev", "lab", "imaging", "cardio",
         "diag_rev", "procedures", "observation", "pharmacy", "exec_rev",
         "concierge", "admissions", "ip_rev", "revenue", "direct", "gross",
         "occupancy", "personnel", "opex", "ebitda", "dep", "pbt", "tax", "net", "fcf")
    o = {k: [0.0] * YEARS for k in K}
    payroll = sum(q * s for _n, q, s in STAFF) * 12 * (1 + ON_COSTS) / 1e6
    for i in range(YEARS):
        vl = _r(ROOMS_ACTIVE, i) * DAYS_M * _r(PER_ROOM_DAY, i) * 12
        vf = FOREIGN_DAYS_M * _r(FOREIGN_PER_DAY, i) * 12
        v = vl + vf
        o["vol_local"][i], o["vol_foreign"][i], o["vol"][i] = vl, vf, v
        o["op_rev"][i] = (vl * OP_LOCAL + vf * OP_FOREIGN) / 1e6
        o["lab"][i] = v * DIAG[0][1] * DIAG[0][2] / 1e6
        o["imaging"][i] = v * DIAG[1][1] * DIAG[1][2] / 1e6
        o["cardio"][i] = v * DIAG[2][1] * DIAG[2][2] / 1e6
        o["diag_rev"][i] = o["lab"][i] + o["imaging"][i] + o["cardio"][i]
        o["procedures"][i] = v * PROCEDURE_RATE * PROCEDURE_TICKET / 1e6
        o["observation"][i] = v * OBSERVATION_RATE * OBSERVATION_TICKET / 1e6
        o["pharmacy"][i] = v * PHARMACY_RATE * PHARMACY_TICKET / 1e6
        o["exec_rev"][i] = _r(EXEC_PACKAGES, i) * EXEC_TICKET / 1e6
        adm = v * _r(CONVERSION, i)
        o["admissions"][i] = adm
        o["ip_rev"][i] = adm * ARPD_USD * FX * IP_COMMISSION / 1e6
        o["concierge"][i] = adm * CONCIERGE_MULTIPLE * CONCIERGE_TICKET / 1e6
        o["revenue"][i] = (o["op_rev"][i] + o["diag_rev"][i] + o["procedures"][i]
                           + o["observation"][i] + o["pharmacy"][i] + o["exec_rev"][i]
                           + o["concierge"][i] + o["ip_rev"][i])
        o["direct"][i] = (
            (vl * OP_LOCAL * DOCTOR_FEE_LOCAL + vf * OP_FOREIGN * DOCTOR_FEE_FOREIGN) / 1e6
            + o["ip_rev"][i] * CONSULTANT_ON_IP
            + o["lab"][i] * LAB_CONSUMABLES
            + (o["imaging"][i] + o["cardio"][i]) * IMAGING_CONSUMABLES
            + o["pharmacy"][i] * PHARMACY_COGS
            + o["procedures"][i] * PROCEDURE_CONSUMABLES
            + o["observation"][i] * OBSERVATION_CONSUMABLES
            + o["exec_rev"][i] * EXEC_CONSUMABLES)
        o["gross"][i] = o["revenue"][i] - o["direct"][i]
        o["occupancy"][i] = SQM * OCC_RATE / 1e6 * (1 + OCC_ESC) ** i
        o["personnel"][i] = payroll
        o["opex"][i] = (o["occupancy"][i] + payroll + _r(MARKETING, i)
                        + _r(TRAVEL_DOCTORS, i) + _r(ACCOMMODATION, i)
                        + _r(TRAVEL_BUSINESS, i) + _r(MAINTENANCE, i)
                        + _r(OFFICE, i) + _r(MISC, i) + _r(LICENCES, i))
        o["ebitda"][i] = o["gross"][i] - o["opex"][i]
        o["dep"][i] = sum(x for _n, x, _d in CAPEX if "Working capital" not in _n) / DEP_YEARS
        o["pbt"][i] = o["ebitda"][i] - o["dep"][i]
        o["tax"][i] = max(0.0, o["pbt"][i]) * TAX
        o["net"][i] = o["pbt"][i] - o["tax"][i]
        o["fcf"][i] = o["net"][i] + o["dep"][i]
    o["capex_total"] = sum(x for _n, x, _d in CAPEX)
    return o


def npv(r, f, cap):
    return -cap + sum(x / (1 + r) ** (i + 1) for i, x in enumerate(f))


def irr(f, cap):
    lo, hi = -0.9, 5.0
    if npv(lo, f, cap) < 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if npv(mid, f, cap) > 0 else (lo, mid)
    return (lo + hi) / 2


def payback(f, cap):
    c = 0.0
    for i, x in enumerate(f):
        c += x
        if c >= cap:
            return i + (cap - (c - x)) / x
    return None


def metrics(M):
    cap = M["capex_total"]
    return dict(capex=cap, irr=irr(M["fcf"], cap), npv=npv(DISCOUNT, M["fcf"], cap),
                payback=payback(M["fcf"], cap),
                medbury=[v * MEDBURY_SHARE for v in M["net"]])


SCENARIOS = [
    ("Base case", {}, "Four layers, As-Salam referral at 15%"),
    ("No referral line at all", dict(IP_COMMISSION=0.0, CONCIERGE_MULTIPLE=0.0),
     "Layer 2 and 3 gone. Does the diagnostic hub stand on its own"),
    ("Conversion half of Kenya", dict(CONVERSION=[0.020] * 5), "2.0%"),
    ("No executive health contracts", dict(EXEC_PACKAGES=[0] * 5), "Layer 4 never lands"),
    ("Diagnostic attach 25% lower",
     dict(DIAG=[(n, a * 0.75, t, d) for n, a, t, d in DIAG]), "Patients do not buy the workup"),
    ("Volume 25% below plan", dict(ROOMS_ACTIVE=[2.2, 3.0, 3.4, 3.8, 3.8]), ""),
    ("Naira strengthens to 1,240", dict(FX=1240.0), "Dollar linked referral, naira cost base"),
    ("Severe: no referral and 25% less volume",
     dict(IP_COMMISSION=0.0, CONCIERGE_MULTIPLE=0.0,
          ROOMS_ACTIVE=[2.2, 3.0, 3.4, 3.8, 3.8]), "The test that matters"),
]


def scenario(**kw):
    import importlib
    import sys
    mod = importlib.reload(sys.modules[__name__])
    for k, v in kw.items():
        setattr(mod, k, v)
    M = mod.build()
    return M, mod.metrics(M)


def scenario_table():
    out = []
    for lbl, kw, note in SCENARIOS:
        M, me = scenario(**kw)
        out.append(dict(label=lbl, note=note, rev5=M["revenue"][4], y1=M["ebitda"][0],
                        y5=M["ebitda"][4], margin5=100 * M["ebitda"][4] / M["revenue"][4],
                        irr=me["irr"], npv=me["npv"], payback=me["payback"],
                        medbury=sum(me["medbury"])))
    return out


if __name__ == "__main__":
    M = build()
    me = metrics(M)
    f = lambda v, d=1: ("{:,.%df}" % d).format(v)
    print("MEDBURY ALAMEDA CENTRE, the whole building. NGN M\n")
    print("  %-34s %8s %8s %8s %8s %8s" % ("", "Y1", "Y2", "Y3", "Y4", "Y5"))
    for lbl, k, d in [("Consultations", "vol", 0), ("Admissions to As-Salam", "admissions", 0),
                      ("Specialist consultation", "op_rev", 0), ("Laboratory", "lab", 0),
                      ("Imaging", "imaging", 0), ("Cardiology", "cardio", 0),
                      ("Procedures", "procedures", 0), ("Observation", "observation", 0),
                      ("Pharmacy", "pharmacy", 0), ("Executive health", "exec_rev", 0),
                      ("Concierge and case management", "concierge", 0),
                      ("As-Salam referral, 15%", "ip_rev", 0),
                      ("TOTAL REVENUE", "revenue", 0), ("Gross margin", "gross", 0),
                      ("Occupancy, whole building", "occupancy", 0),
                      ("Operating cost", "opex", 0), ("EBITDA", "ebitda", 0),
                      ("Net income", "net", 0)]:
        print("  %-34s %s" % (lbl, " ".join("%8s" % f(v, d) for v in M[k])))
    print("  %-34s %s" % ("EBITDA margin", " ".join(
        "%7.0f%%" % (100 * M["ebitda"][i] / M["revenue"][i]) for i in range(YEARS))))
    print()
    print("  capex %s | IRR %s | NPV %s | payback %s"
          % (f(me["capex"], 0), ("%.0f%%" % (100 * me["irr"])) if me["irr"] else "n/a",
             f(me["npv"], 0), ("%.1f yr" % me["payback"]) if me["payback"] else "never"))
    print("  to Medbury at 49%%: %s" % " ".join(f(v, 0) for v in me["medbury"]))
