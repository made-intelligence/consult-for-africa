"""
Clearview: what a pure pay-for-performance mandate actually pays.

No fees, no retainer, no day rates. CFA is paid a share of INCREMENTAL COLLECTED
REVENUE above an agreed baseline. The model exists to answer one question: does
taking the whole risk pay CFA better than billing the time would have, and by
how much, over what period.

Fee is on collected revenue and never on cycles started, deliberately. A fee per
cycle started would pay CFA to push people into treatment, which is the
reputational wound this sector already has.

    python3 scripts/clearview_performance.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import clearview_model as M
import clearview_fee as F

D = M.MID
HORIZON = 36                      # months modelled
TERM = 24                         # months the fee runs for, from month 1

# clearview_model works in NGN MILLIONS a month; clearview_fee works in naira.
# Everything below is NGN millions, so the fee build is converted once, here.
DAY_RATE_EQUIVALENT = F.NET / 1e6

# ------------------------------------------------------------------ engines --
# (name, monthly value at full ramp, month it starts, month it reaches full)
#
# Capture lags hardest: a pregnancy conceived in month 6 does not deliver, and
# therefore does not collect, until month 15.
ENGINES = [
    ("Conversion, extra cycles from the same enquiries",
     D["extra_cycles"] * D["fresh_rev"] / D["cycles"], 3, 12),
    ("Retention, frozen transfers and billed storage",
     D["fet_rev"] + D["storage_rev"], 4, 15),
    ("Capture, obstetrics kept inside the group",
     D["obstetric"] / 12, 9, 22),
    ("Inbound, patients from outside Lagos",
     M.inbound(4, "Rest of Nigeria") / 12, 9, 28),
]

# How much of the modelled ceiling actually lands. Nothing in this sector hits
# its own model, so the note publishes a band rather than the mid.
DELIVERY = {"cautious": 0.55, "expected": 0.75, "good": 0.95}


def ramp(month, start, full):
    """Straight line from start to full. Zero before, flat after."""
    if month < start:
        return 0.0
    if month >= full:
        return 1.0
    return (month - start) / (full - start)


def monthly_incremental(delivery=1.0):
    """Incremental collected revenue in each month, NGN millions."""
    out = []
    for mth in range(1, HORIZON + 1):
        v = sum(val * ramp(mth, s, f) for _n, val, s, f in ENGINES)
        out.append(v * delivery)
    return out


def cumulative(delivery=1.0, months=TERM):
    return sum(monthly_incremental(delivery)[:months])


def fee(share, delivery=1.0, months=TERM):
    return cumulative(delivery, months) * share


def run_rate(delivery=1.0, month=24):
    return monthly_incremental(delivery)[month - 1]


SHARES = [0.15, 0.20, 0.25, 0.30]


def m(x, dp=1):
    return ("{:,.%df}" % dp).format(x)


if __name__ == "__main__":
    print("Clearview: pay for performance\n")
    print("  Engines, at full ramp (NGN m a month)")
    for n, val, s, f in ENGINES:
        print("    %-52s %6s   months %2d to %2d" % (n, m(val, 1), s, f))
    print("    %-52s %6s" % ("Total at full ramp",
                             m(sum(v for _n, v, _s, _f in ENGINES), 1)))

    print("\n  Cumulative incremental collected revenue over %d months (NGN m)" % TERM)
    for k, d in DELIVERY.items():
        print("    %-10s %10s     run rate at month 24: %s m a month"
              % (k, m(cumulative(d), 0), m(run_rate(d), 1)))

    print("\n  CFA fee over %d months, NGN m" % TERM)
    print("    %-10s %s" % ("share", "".join("%12s" % k for k in DELIVERY)))
    for sh in SHARES:
        print("    %-10s %s" % ("%d%%" % (sh * 100),
                                "".join("%12s" % m(fee(sh, d), 0) for d in DELIVERY.values())))

    print("\n  Against billing the time: NGN %s m" % m(DAY_RATE_EQUIVALENT, 1))
    for sh in SHARES:
        r = fee(sh, DELIVERY["expected"]) / DAY_RATE_EQUIVALENT
        print("    %d%% at expected delivery = %4.2fx the day rate build" % (sh * 100, r))

    print("\n  Cash exposure: CFA funds the work before anything is collected.")
    cum = 0.0
    first = None
    for i, v in enumerate(monthly_incremental(DELIVERY["expected"]), start=1):
        cum += v * 0.25
        if first is None and cum > 0:
            first = i
    print("    first fee lands around month %d, at 25%%" % (first or 0))
