"""
ilé operating company, five-year monthly model: the streamlined case.

Three businesses only: end-of-life care at home (care at home in the last years,
the feeder, and palliative care at home in the last months), a residential care
home (long-stay and a palliative wing), and a mortuary (preservation, preparation
and repatriation). Concierge geriatric care, virtual consultations, post-operative
rehabilitation, step-down beds, autopsy and the software licence are out.

The fuller eleven-stream model in scripts/ile_model.py is kept for reference and
is untouched. Same conventions: month 1 is November 2026, naira, before tax,
buildings leased as a shell and converted by the company, rent a year ahead in
cash and monthly in EBITDA.

    python3 scripts/ile_model_eol.py
"""

from __future__ import annotations

START_YEAR, START_MONTH = 2026, 11
MONTHS = 60
FX = 1500                      # naira per US dollar, for quoting diaspora prices
DAYS = 30.4

# ---- end-of-life care at home ------------------------------------------------
HOME_CLIENTS = [(2, 4), (18, 60), (60, 110)]          # care at home in the last years, the feeder
HOME_ARPU = 420_000            # blended monthly subscription, local and diaspora
HOME_DIRECT = 0.60             # carer pay, travel, consumables as share of revenue

PALL_HOME = [(6, 2), (24, 15), (60, 25)]              # palliative care at home, the last months
PALL_HOME_ARPU = 900_000
PALL_HOME_DIRECT = 0.65

# ---- residential care home ---------------------------------------------------
# Each home, 20 beds: 16 long-stay assisted and nursing, and a 4-bed palliative wing.
RES_BEDS, PALL_BEDS = 16, 4
RES_FEE, PALL_FEE = 1_600_000, 2_400_000
RES_OPEN_OCC, RES_STEP, RES_CAP = 6, 0.9, 15          # occupied beds at opening, monthly gain, ceiling
PALL_OPEN_OCC, PALL_STEP, PALL_CAP = 1, 0.3, 3
RES_STAFF = 13_000_000         # monthly, loaded with on-costs, both wings
RES_PER_BED = 220_000          # food, consumables, laundry per occupied bed
RES_UTIL = 2_800_000           # power and diesel
RES_RENT = 100_000_000 / 12    # lease of the unconverted building, ₦100m a year, paid a year ahead
RENT_ADVANCE = 12              # months of rent paid ahead, from lease signing
RES_OTHER = 2_000_000          # insurance, maintenance, licences
RES_CAPEX = 130_000_000        # equipment, furnishing, nurse call, power backup, pre-opening
RES_CONVERSION = 200_000_000   # building works to a licensable care home, sized on the site
LEASE_LEAD = 6                 # months from lease signing to opening, while the works run
RESIDENCES = [21]              # opening month: July 2028. One home in the five years; at $500k
                               # a second home is beyond year five, or the raise grows
DEPOSIT = 1_600_000            # one month's fee, taken to reserve a place, held not earned
DEPOSITS_AT_OPEN = 7

# ---- mortuary: preservation, preparation, repatriation -----------------------
MORT_OPEN = 10                 # August 2027
MORT_CAP = [(10, 40), (34, 80)]                       # body capacity, expanded in month 34
MORT_HELD_OPEN, MORT_HELD_STEP, MORT_FILL = 8, 1.6, 0.80
MORT_DAY = 18_000              # daily preservation fee
MORT_STAY = 35                 # average days held, while the family gathers
MORT_CASE = 280_000            # embalming, dressing, documentation, local transport
MORT_CASE_COST = 45_000        # chemicals and consumables per case
MORT_STAFF = [(10, 7_000_000), (34, 11_500_000)]
MORT_POWER = [(10, 3_200_000), (34, 5_000_000)]
MORT_RENT, MORT_OTHER = 40_000_000 / 12, 2_000_000   # mortuary site ₦40m a year, paid a year ahead
MORT_LEASE_FROM = 7            # lease signed when the build starts
MORT_CAPEX = [(7, 70_000_000), (8, 70_000_000), (9, 70_000_000),
              (31, 30_000_000), (32, 30_000_000), (33, 30_000_000)]
REPAT = [(16, 1), (40, 4), (60, 4)]                   # remains received from abroad a month
REPAT_FEE, REPAT_DIRECT = 1_200_000, 0.60

# ---- the company -----------------------------------------------------------
CENTRAL = [(1, 5_000_000), (15, 9_000_000), (40, 12_000_000)]
MARKETING = [(1, 1_500_000), (12, 2_500_000)]


def ramp(points, m):
    """Linear between (month, value) points, zero before the first."""
    if m < points[0][0]:
        return 0.0
    for (m0, v0), (m1, v1) in zip(points, points[1:]):
        if m0 <= m <= m1:
            return v0 + (v1 - v0) * (m - m0) / (m1 - m0)
    return float(points[-1][1])


def step(points, m):
    """The value of the latest point at or before m, zero before the first."""
    val = 0.0
    for m0, v in points:
        if m >= m0:
            val = v
    return float(val)


def label(m):
    y, mo = divmod(START_MONTH - 1 + m - 1, 12)
    return "%s %d" % (["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                       "Oct", "Nov", "Dec"][mo], START_YEAR + y)


def month(m):
    r = dict(m=m)
    # end-of-life care at home
    hc = ramp(HOME_CLIENTS, m)
    ph = ramp(PALL_HOME, m)
    r["s_home"], r["s_pall_home"] = hc * HOME_ARPU, ph * PALL_HOME_ARPU
    r["home_rev"] = r["s_home"] + r["s_pall_home"]
    r["home_cost"] = r["s_home"] * HOME_DIRECT + r["s_pall_home"] * PALL_HOME_DIRECT
    r["home_clients"], r["pall_home"] = hc, ph

    # residential care homes, each with its palliative wing
    r.update(res_rev=0.0, pall_rev=0.0, res_cost=0.0, capex=0.0, deposits=0.0,
             beds=0.0, pall_beds=0.0, rent_paid=0.0, rent_accrued=0.0)
    for op in RESIDENCES:
        if op - LEASE_LEAD <= m < op:
            r["capex"] += RES_CONVERSION / LEASE_LEAD
        if op - 5 <= m < op:
            r["capex"] += RES_CAPEX / 5
        if m >= op - LEASE_LEAD and (m - (op - LEASE_LEAD)) % RENT_ADVANCE == 0:
            r["rent_paid"] += RES_RENT * RENT_ADVANCE
        if m >= op - LEASE_LEAD:
            r["rent_accrued"] += RES_RENT
        if m == op - 2:
            r["res_cost"] += RES_STAFF * 0.6          # hiring and training before opening
        if m == op - 1:
            r["res_cost"] += RES_STAFF * 0.6
            r["deposits"] += DEPOSIT * DEPOSITS_AT_OPEN
        if m >= op:
            k = m - op
            beds = min(RES_CAP, RES_OPEN_OCC + RES_STEP * k)
            pb = min(PALL_CAP, PALL_OPEN_OCC + PALL_STEP * k)
            r["beds"] += beds
            r["pall_beds"] += pb
            r["res_rev"] += beds * RES_FEE
            r["pall_rev"] += pb * PALL_FEE
            r["res_cost"] += RES_STAFF + (beds + pb) * RES_PER_BED + RES_UTIL + RES_OTHER

    # mortuary
    r["capex"] += sum(v for mm, v in MORT_CAPEX if mm == m)
    r.update(mort_rev=0.0, mort_cost=0.0, held=0.0, cases=0.0, s_preserve=0.0, s_case=0.0,
             s_repat=0.0)
    if m >= MORT_OPEN:
        cap = step(MORT_CAP, m)
        held = min(cap * MORT_FILL, MORT_HELD_OPEN + MORT_HELD_STEP * (m - MORT_OPEN))
        cases = held * DAYS / MORT_STAY
        rp = ramp(REPAT, m)
        r["held"], r["cases"] = held, cases
        r["s_preserve"], r["s_case"], r["s_repat"] = held * DAYS * MORT_DAY, cases * MORT_CASE, rp * REPAT_FEE
        r["mort_rev"] = r["s_preserve"] + r["s_case"] + r["s_repat"]
        r["mort_cost"] = (step(MORT_STAFF, m) + step(MORT_POWER, m) + MORT_OTHER
                          + cases * MORT_CASE_COST + rp * REPAT_FEE * REPAT_DIRECT)

    # mortuary lease: charged monthly from signing, paid a year ahead
    if m >= MORT_LEASE_FROM:
        r["rent_accrued"] += MORT_RENT
        if (m - MORT_LEASE_FROM) % RENT_ADVANCE == 0:
            r["rent_paid"] += MORT_RENT * RENT_ADVANCE

    r["central"] = step(CENTRAL, m) + step(MARKETING, m)
    r["revenue"] = r["home_rev"] + r["res_rev"] + r["pall_rev"] + r["mort_rev"]
    r["ebitda"] = (r["revenue"] - r["home_cost"] - r["res_cost"] - r["mort_cost"]
                   - r["central"] - r["rent_accrued"])
    r["cash"] = r["ebitda"] + r["rent_accrued"] - r["rent_paid"] - r["capex"] + r["deposits"]
    return r


def run():
    rows, cum = [], 0.0
    for m in range(1, MONTHS + 1):
        r = month(m)
        cum += r["cash"]
        r["cum"] = cum
        rows.append(r)
    return rows


KEYS = ("home_rev", "res_rev", "pall_rev", "mort_rev", "revenue", "ebitda", "capex", "cash",
        "s_home", "s_pall_home", "s_preserve", "s_case", "s_repat")


def years(rows):
    out = []
    for y in range(5):
        chunk = rows[y * 12:(y + 1) * 12]
        s = {k: sum(r[k] for r in chunk) for k in KEYS}
        s["label"] = "Year %d" % (y + 1)
        s["span"] = "%s to %s" % (label(y * 12 + 1), label(y * 12 + 12))
        s["end_cum"] = chunk[-1]["cum"]
        out.append(s)
    return out


def summary():
    rows = run()
    trough = min(rows, key=lambda r: r["cum"])
    first_pos = next((r for r in rows if r["ebitda"] > 0 and all(
        x["ebitda"] > 0 for x in rows[r["m"] - 1:r["m"] + 5])), None)
    payback = next((r for r in rows[trough["m"]:] if r["cum"] >= 0), None)
    return dict(rows=rows, years=years(rows), peak=-trough["cum"], trough=trough,
                ebitda_positive=first_pos, payback=payback)


def stressed(**overrides):
    """summary() with some parameters overridden, then restored."""
    g = globals()
    saved = {k: g[k] for k in overrides}
    g.update(overrides)
    try:
        return summary()
    finally:
        g.update(saved)


SLOW_FILL = dict(RES_STEP=RES_STEP / 2, PALL_STEP=PALL_STEP / 2,
                 MORT_HELD_STEP=MORT_HELD_STEP / 2)

STRESSES = [
    ("Base case", {}),
    ("Care home fills at half speed", dict(RES_STEP=RES_STEP / 2, PALL_STEP=PALL_STEP / 2)),
    ("Mortuary fills at half speed", dict(MORT_HELD_STEP=MORT_HELD_STEP / 2)),
    ("Care at home at half the clients", dict(HOME_CLIENTS=[(2, 2), (18, 30), (60, 110)],
                                              PALL_HOME=[(6, 1), (24, 8), (60, 25)])),
    ("Care home opens six months late", dict(RESIDENCES=[r + 6 for r in RESIDENCES])),
    ("Care home and mortuary at half speed", SLOW_FILL),
]


# ---- market size, Lagos, bottom up ------------------------------------------
LAGOS_POP = 15_000_000         # estimates run 12.8m to 17.2m
NIGERIA_POP = 237_500_000      # UN estimate, 2025
SHARE_60 = 0.05                # Lagos is younger than Nigeria (7% nationally)
ADL_DEP = 0.283                # aged 60+ dependent in daily living, Nigerian study
NEEDS_24H = 0.10               # of the dependent, those needing round-the-clock care
DEATH_RATE = 0.011             # crude, per person a year
PALL_NEED = 0.50               # deaths that would benefit from palliative care
PALL_MONTHS = 2
PRIVATE_MORT = 0.10            # deaths kept in a private funeral home at the upper tier
PREMIUM = 0.05                 # families able to pay these prices, or funded from abroad
UK_CAREHOME = 0.025            # aged 65+ living in a care home, England and Wales, 2021
US_HOSPICE = 0.517             # Medicare decedents using hospice, 2023


def market():
    old = LAGOS_POP * SHARE_60
    dep = old * ADL_DEP
    deaths = LAGOS_POP * DEATH_RATE
    case_value = MORT_STAY * MORT_DAY + MORT_CASE
    seg = [
        ("Care at home", dep * PREMIUM * HOME_ARPU * 12,
         "%.0fk dependent people aged 60+, 5%% at premium prices" % (dep / 1e3)),
        ("Care home", dep * NEEDS_24H * PREMIUM * RES_FEE * 12,
         "1 in 10 of them needing care round the clock"),
        ("Palliative care", deaths * PALL_NEED * PREMIUM * PALL_MONTHS * PALL_FEE,
         "%.0fk deaths a year, half needing palliative care, two months" % (deaths / 1e3)),
        ("Mortuary", deaths * PRIVATE_MORT * case_value,
         "1 in 10 deaths kept in a private funeral home"),
    ]
    return dict(old=old, dep=dep, deaths=deaths, segments=seg, total=sum(v for _, v, _ in seg))


# ---- returns ----------------------------------------------------------------
EXIT_MULTIPLES = (6, 8, 10)    # EV / EBITDA, healthcare services


def returns(raise_ngn, fx_exit=FX):
    s = summary()
    eb = s["years"][4]["ebitda"]
    cash = raise_ngn + s["rows"][-1]["cum"]
    return eb, cash, [(mult, (mult * eb + cash) / fx_exit) for mult in EXIT_MULTIPLES]


def bn(v):
    return "N%.2fbn" % (v / 1e9) if abs(v) >= 1e9 else "N%.0fm" % (v / 1e6)


if __name__ == "__main__":
    s = summary()
    for y in s["years"]:
        print("%s %-22s rev %-9s home %-8s res %-8s pall %-8s mort %-8s ebitda %-9s %4.0f%% capex %-7s cum %s" % (
            y["label"], y["span"], bn(y["revenue"]), bn(y["home_rev"]), bn(y["res_rev"]),
            bn(y["pall_rev"]), bn(y["mort_rev"]), bn(y["ebitda"]),
            100 * y["ebitda"] / y["revenue"], bn(y["capex"]), bn(y["end_cum"])))
    print("peak funding", bn(s["peak"]), "trough", label(s["trough"]["m"]))
    print("EBITDA positive from", label(s["ebitda_positive"]["m"]) if s["ebitda_positive"] else None)
    print("cumulative cash back to zero", label(s["payback"]["m"]) if s["payback"] else "not in five years")
    for name, kw in STRESSES:
        print("  %-40s peak %s" % (name, bn(stressed(**kw)["peak"])))
    last = s["rows"][-1]
    print("month 60: beds %.0f pall %.0f home %.0f pall home %.0f held %.0f cases %.0f" % (
        last["beds"], last["pall_beds"], last["home_clients"], last["pall_home"], last["held"],
        last["cases"]))
