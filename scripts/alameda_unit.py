"""
Unit economics and the monthly path to breakeven for the Medbury Alameda SPV.

Built for the investor question, which is not "what does it return at run rate"
but "what do I have to fund, for how long, and when am I whole".

Run rate figures come from medbury_alameda_centre.py. This module is the monthly
path to that point, which the annual model cannot show.

    python3 scripts/alameda_unit.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import medbury_alameda_centre as C

HORIZON = 48
OPEN_M = 4                       # fit-out months 1 to 3
PAT_RUN, EXEC_RUN = 890.0, 92.0
PAT_RAMP, EXEC_RAMP, CONV_RAMP = 24, 30, 30
CONV0, CONV1 = C.CONVERSION[0], C.CONVERSION[-1]
PRE_OPEN_SHARE = 0.45            # rent and the team hired ahead of opening
CAPEX_DRAW = {1: 0.35, 2: 0.35, 3: 0.20, 4: 0.10}
FOREIGN_MIX = 0.045              # As-Salam consultants as a share of consultations


def _smooth(i, n):
    if i <= 0:
        return 0.0
    if i >= n:
        return 1.0
    x = i / n
    return x * x * (3 - 2 * x)


def unit(conversion=CONV1):
    """Revenue, direct cost and contribution for one patient through the pathway."""
    rev = {"Specialist consultation": C.OP_LOCAL * (1 - FOREIGN_MIX) + C.OP_FOREIGN * FOREIGN_MIX}
    for n, a, t, _d in C.DIAG:
        rev[n] = a * t
    rev["Procedure suite"] = C.PROCEDURE_RATE * C.PROCEDURE_TICKET
    rev["Observation and day admission"] = C.OBSERVATION_RATE * C.OBSERVATION_TICKET
    rev["Pharmacy"] = C.PHARMACY_RATE * C.PHARMACY_TICKET
    rev["Concierge and case management"] = conversion * C.CONCIERGE_MULTIPLE * C.CONCIERGE_TICKET
    rev["As-Salam referral at 15%"] = conversion * C.ARPD_USD * C.FX * C.IP_COMMISSION
    cost = {
        "Doctor fee": C.OP_LOCAL * (1 - FOREIGN_MIX) * C.DOCTOR_FEE_LOCAL
                      + C.OP_FOREIGN * FOREIGN_MIX * C.DOCTOR_FEE_FOREIGN,
        "Laboratory reagents": C.DIAG[0][1] * C.DIAG[0][2] * C.LAB_CONSUMABLES,
        "Imaging and cardiology consumables":
            (C.DIAG[1][1] * C.DIAG[1][2] + C.DIAG[2][1] * C.DIAG[2][2]) * C.IMAGING_CONSUMABLES,
        "Pharmacy cost of goods": C.PHARMACY_RATE * C.PHARMACY_TICKET * C.PHARMACY_COGS,
        "Procedure consumables": C.PROCEDURE_RATE * C.PROCEDURE_TICKET * C.PROCEDURE_CONSUMABLES,
        "Observation consumables": C.OBSERVATION_RATE * C.OBSERVATION_TICKET * C.OBSERVATION_CONSUMABLES,
        "Consultant share of the referral": rev["As-Salam referral at 15%"] * C.CONSULTANT_ON_IP,
    }
    R, K = sum(rev.values()), sum(cost.values())
    return dict(rev=rev, cost=cost, revenue=R, direct=K, contribution=R - K,
                margin=100 * (R - K) / R)


def exec_unit():
    c = C.EXEC_TICKET * C.EXEC_CONSUMABLES
    return dict(ticket=C.EXEC_TICKET, cost=c, contribution=C.EXEC_TICKET - c)


def fixed_monthly():
    pay = sum(q * s for _n, q, s in C.STAFF) * (1 + C.ON_COSTS)
    return [("Occupancy, the whole building", C.SQM * C.OCC_RATE / 12),
            ("Personnel, %d posts" % sum(q for _n, q, _s in C.STAFF), pay),
            ("Marketing and demand generation", C.MARKETING[0] * 1e6 / 12),
            ("As-Salam consultant travel and accommodation",
             (C.TRAVEL_DOCTORS[0] + C.ACCOMMODATION[0]) * 1e6 / 12),
            ("Biomedical maintenance contracts", C.MAINTENANCE[0] * 1e6 / 12),
            ("Office, business travel, misc and licences",
             (C.OFFICE[0] + C.TRAVEL_BUSINESS[0] + C.MISC[0] + C.LICENCES[0]) * 1e6 / 12)]


def build():
    U, EX = unit(), exec_unit()
    FIX = sum(v for _n, v in fixed_monthly())
    capex = sum(x for _n, x, _d in C.CAPEX)
    rows, cum = [], 0.0
    for mth in range(1, HORIZON + 1):
        t = mth - OPEN_M + 1
        open_ = mth >= OPEN_M
        pat = PAT_RUN * _smooth(t, PAT_RAMP) if open_ else 0.0
        exq = EXEC_RUN * _smooth(t, EXEC_RAMP) if open_ else 0.0
        conv = CONV0 + (CONV1 - CONV0) * _smooth(t, CONV_RAMP) if open_ else 0.0
        u = unit(conv)
        contrib = (pat * u["contribution"] + exq * EX["contribution"]) / 1e6
        fixed = FIX / 1e6 * (1.0 if open_ else PRE_OPEN_SHARE)
        eb = contrib - fixed
        cf = eb - capex * CAPEX_DRAW.get(mth, 0.0)
        cum += cf
        rows.append(dict(month=mth, patients=pat, exec=exq, conversion=conv,
                         contribution=contrib, fixed=fixed, ebitda=eb, cash=cf, cum=cum))
    trough = min(r["cum"] for r in rows)
    return dict(rows=rows, unit=U, exec_unit=EX, fixed=FIX, capex=capex,
                breakeven_patients=FIX / U["contribution"],
                trough=-trough,
                trough_month=next(r["month"] for r in rows if r["cum"] == trough),
                ebitda_month=next((r["month"] for r in rows
                                   if r["ebitda"] > 0 and r["month"] >= OPEN_M), None),
                cash_month=next((r["month"] for r in rows if r["cum"] > 0), None))


if __name__ == "__main__":
    B = build()
    U, EX = B["unit"], B["exec_unit"]
    f = lambda v: "{:,.0f}".format(v)
    print("ONE PATIENT THROUGH THE PATHWAY, NGN\n")
    for k, v in U["rev"].items():
        print("   %-40s %10s" % (k, f(v)))
    print("   %-40s %10s" % ("REVENUE", f(U["revenue"])))
    for k, v in U["cost"].items():
        print("   %-40s %10s" % (k, "(%s)" % f(v)))
    print("   %-40s %10s" % ("DIRECT COST", "(%s)" % f(U["direct"])))
    print("   %-40s %10s   %.0f%%" % ("CONTRIBUTION", f(U["contribution"]), U["margin"]))
    print("\n   %-40s %10s   contribution %s"
          % ("Executive health package", f(EX["ticket"]), f(EX["contribution"])))
    print("\nFIXED, A MONTH\n")
    for k, v in fixed_monthly():
        print("   %-46s %12s" % (k, f(v)))
    print("   %-46s %12s" % ("TOTAL", f(B["fixed"])))
    print("\n   breakeven %.0f patients a month, %.0f a working day, against a run rate of %.0f"
          % (B["breakeven_patients"], B["breakeven_patients"] / 21, PAT_RUN))
    print("\nTHE PATH\n")
    print("   EBITDA positive     month %d, %d months after opening"
          % (B["ebitda_month"], B["ebitda_month"] - OPEN_M + 1))
    print("   Deepest cash point  month %d at NGN %s M" % (B["trough_month"], f(B["trough"])))
    print("   Capital back        month %d, %d months after opening"
          % (B["cash_month"], B["cash_month"] - OPEN_M + 1))
    print("\n   capex %s M, operating losses to breakeven %s M, total funding %s M"
          % (f(B["capex"]), f(B["trough"] - B["capex"]), f(B["trough"])))
    print("   Medbury at %.0f%%: %s M of the funding" % (100 * C.MEDBURY_SHARE,
                                                         f(B["trough"] * C.MEDBURY_SHARE)))
