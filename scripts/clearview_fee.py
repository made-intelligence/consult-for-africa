"""
Clearview: the resourced-day build behind the IVF mandate.

Published day rates, the days each workstream actually takes, and one
structural concession. Grade totals are derived FROM the workstream arrays, so
the fee table and the grade table cannot disagree with each other.

    python3 scripts/clearview_fee.py
"""

from __future__ import annotations

# ------------------------------------------------------------------- rates ---
RATES = {
    "Partner": 750_000,
    "Principal": 450_000,
    "Senior consultant": 300_000,
    "Consultant": 190_000,
    "Analyst": 120_000,
}
ORDER = list(RATES)

# One structural concession, and one only: the workstreams below are a single
# continuous mandate rather than five separate engagements.
PROGRAMME_RATE = 0.10

# ------------------------------------------------------------- workstreams ---
# (phase, code, name, {grade: days})
WORK = [
    (1, "A", "Count the funnel, and pull the outcomes",
     {"Partner": 3, "Senior consultant": 10, "Analyst": 12}),
    (1, "B", "The tank: storage, consent and the recall list",
     {"Senior consultant": 5, "Analyst": 6}),
    (1, "C", "Ten patients traced end to end, across both companies",
     {"Partner": 2, "Senior consultant": 8, "Analyst": 4}),
    (1, "D", "The five surveys, the site visit and the findings session",
     {"Partner": 3, "Senior consultant": 6, "Analyst": 5}),

    (2, "E", "The enquiry pathway, and the coordinator function",
     {"Partner": 3, "Principal": 12, "Senior consultant": 20, "Analyst": 8}),
    (2, "F", "Packages, pricing, and how a family actually pays",
     {"Partner": 4, "Principal": 10, "Senior consultant": 12, "Analyst": 6}),
    (2, "G", "The recall and sibling programme",
     {"Principal": 6, "Senior consultant": 14, "Analyst": 6}),
    (2, "H", "Downstream capture into Clearview Hospital",
     {"Partner": 4, "Principal": 10, "Senior consultant": 16, "Analyst": 4}),
    (2, "I", "Outcomes reporting, and what may honestly be claimed",
     {"Partner": 3, "Principal": 8, "Senior consultant": 10, "Analyst": 8}),

    (3, "J", "The traveller proposition and the package",
     {"Partner": 3, "Principal": 8, "Senior consultant": 12, "Analyst": 4}),
    (3, "K", "The shared care network: recruit, contract, protocol",
     {"Partner": 6, "Principal": 14, "Senior consultant": 22, "Consultant": 10, "Analyst": 6}),
    (3, "L", "Laboratory depth and the capacity ceiling",
     {"Partner": 3, "Principal": 6, "Senior consultant": 10}),
    (3, "M", "Running the programme, and the monthly pack",
     {"Partner": 6, "Principal": 10, "Senior consultant": 12, "Analyst": 10}),
]

# What each phase has to put on the table before its final tranche is invoiced.
MEASURES = {
    1: "A counted funnel, a live birth rate by age band, and a capacity ceiling for the "
       "laboratory, all in writing.",
    2: "Enquiry to cycle conversion improved by at least five percentage points on the Phase 1 "
       "baseline, and every IVF pregnancy offered a booking at Clearview Hospital by default.",
    3: "At least six partner gynaecologists contracted and running monitoring under protocol, "
       "and the first travelling patients treated on the package.",
}

PHASES = {
    1: ("Baseline", "Weeks 1 to 4",
        "Establish what is actually true before anything is built."),
    2: ("The conversion and continuity build", "Months 2 to 6",
        "Turn demand you already generate into cycles, and keep what you win."),
    3: ("The inbound engine", "Months 4 to 9",
        "Open the catchment beyond Lekki, and make the laboratory carry it."),
}


def ws_days(w):
    return sum(w[3].values())


def ws_value(w):
    return sum(RATES[g] * d for g, d in w[3].items())


def grade_days():
    out = {g: 0 for g in ORDER}
    for w in WORK:
        for g, d in w[3].items():
            out[g] += d
    return out


def phase_rows():
    rows = []
    for p in sorted(PHASES):
        ws = [w for w in WORK if w[0] == p]
        rows.append((p, PHASES[p], sum(ws_days(w) for w in ws), sum(ws_value(w) for w in ws)))
    return rows


GRADE_DAYS = grade_days()
TOTAL_DAYS = sum(GRADE_DAYS.values())
GROSS = sum(ws_value(w) for w in WORK)
DISCOUNT = GROSS * PROGRAMME_RATE
NET = GROSS - DISCOUNT

# Mobilisation on signature, credited in full against the first invoices.
MOBILISATION = 10_000_000
MONTHS = 9

# Cross-check: grade table and workstream table must agree, to the naira.
assert sum(RATES[g] * d for g, d in GRADE_DAYS.items()) == GROSS


def m(x, dp=1):
    return ("{:,.%df}" % dp).format(x)


if __name__ == "__main__":
    print("Clearview IVF mandate: the resourced build\n")
    for p, (name, when, _why), days, val in phase_rows():
        print("  Phase %d  %-38s %-14s %4d days   NGN %9s m"
              % (p, name, when, days, m(val / 1e6, 1)))
    print()
    for g in ORDER:
        d = GRADE_DAYS[g]
        if d:
            print("  %-20s %4d days  x  %7s  =  NGN %8s m"
                  % (g, d, "{:,}".format(RATES[g]), m(RATES[g] * d / 1e6, 1)))
    print("\n  %-20s %4d days              NGN %8s m" % ("Gross", TOTAL_DAYS, m(GROSS / 1e6, 1)))
    print("  %-20s %4s                    NGN %8s m" % ("Programme rate 10%", "", m(-DISCOUNT / 1e6, 1)))
    print("  %-20s %4s                    NGN %8s m" % ("NET", "", m(NET / 1e6, 1)))
    print("\n  Over %d months, that is NGN %s m a month." % (MONTHS, m(NET / MONTHS / 1e6, 1)))
    print("  Mobilisation on signature: NGN %s m, credited against the first invoices."
          % m(MOBILISATION / 1e6, 0))
