"""
Fee model for the Tony Elumelu Foundation review tender (business plan,
financials and pitch video review), October 2026.

Every number in the proposal's financial section and the reviewer capacity
line comes from here, so the tables cannot disagree with each other.

Per-review rates are built from reviewer minutes per item at a consultant
reviewer rate, loaded for calibration and blind double scoring, then rounded.
The working stays in this file. The proposal shows minutes and rates only.

VOLUMES ARE ASSUMED until the current RFP's indicative volumes are in hand.
Last year's review RFP named 10,000+ applications; the split and the
Component 2 shortlist below are placeholders and must be replaced.
"""

from __future__ import annotations

# CFA day rates (NGN), per the published grade card
DAY = {"partner": 750_000, "principal": 450_000, "senior": 300_000,
       "consultant": 190_000, "analyst": 120_000}

REVIEWER_HOURLY = 24_000          # consultant grade, 190k over an 8-hour day, rounded
QA_LOADING = 0.15                 # calibration set, 10% blind double scoring, lead third reads
NON_ENGLISH_TIME = 1.30           # French and Arabic: slower read plus language QA
PROGRAMME_RATE = 0.10             # one continuous programme, applied to fixed components only

# reviewer minutes per item, English
MINUTES = {
    "stage2": 20,       # expert application review against TEF's criteria
    "plan": 45,         # Component 2 business plan
    "financials": 30,   # Component 2 financial projections
    "pitch": 12,        # Component 2 pitch video, 2 to 3 minutes watched at least twice
}
REREVIEW_SHARE = 0.5              # a re-review reads the corrected Component 2 file at half time
REREVIEW_ALLOWANCE = 0.10         # included re-reviews, as a share of Component 2 files

# ASSUMED volumes, replace with the RFP's indicative volumes
VOLUMES = {
    "stage2": {"en": 7_500, "ne": 2_500},
    "component2": {"en": 2_250, "ne": 750},
}

# production window and reviewer commitment, for the capacity line
WEEKS_STAGE2 = 8
WEEKS_COMPONENT2 = 6
REVIEWER_HOURS_PER_WEEK = 20


def _round(x: float, step: int = 500) -> int:
    return int(round(x / step) * step)


def unit_rate(minutes: float, lang: str) -> int:
    m = minutes * (NON_ENGLISH_TIME if lang == "ne" else 1.0)
    return _round(REVIEWER_HOURLY * m / 60 * (1 + QA_LOADING))


def rates() -> dict:
    out = {}
    for lang in ("en", "ne"):
        out[("stage2", lang)] = unit_rate(MINUTES["stage2"], lang)
        out[("plan", lang)] = unit_rate(MINUTES["plan"], lang)
        out[("financials", lang)] = unit_rate(MINUTES["financials"], lang)
        out[("pitch", lang)] = unit_rate(MINUTES["pitch"], lang)
        c2 = MINUTES["plan"] + MINUTES["financials"] + MINUTES["pitch"]
        out[("rereview", lang)] = unit_rate(c2 * REREVIEW_SHARE, lang)
    return out


# Fixed components, resourced as grade-days
STAGE1_DAYS = {   # framework, enumerator materials, training, mock review, certification
    "en": {"principal": 4, "senior": 6, "consultant": 6, "analyst": 4},
    "ne": {"senior": 4, "consultant": 2},      # French and Arabic materials and sessions
}
PM_DAYS_PER_WEEK = {  # programme management and QA across the production window
    "partner": 0.25,     # executive sponsor, weekly TEF meeting and escalation
    "principal": 2.0,    # engagement director 1.5, data and compliance 0.5
    "senior": 2.0,       # QA and calibration audits
    "analyst": 5.0,      # review operations, queue and daily reporting
}


def _cost(days: dict) -> int:
    return sum(DAY[g] * d for g, d in days.items())


def fixed() -> dict:
    weeks = max(WEEKS_STAGE2, WEEKS_COMPONENT2) + 2
    pm_total = _cost(PM_DAYS_PER_WEEK) * weeks
    share_en = _lang_share("en")
    return {
        ("stage1", "en"): _cost(STAGE1_DAYS["en"]),
        ("stage1", "ne"): _cost(STAGE1_DAYS["ne"]),
        ("pm", "en"): _round(pm_total * share_en, 1000),
        ("pm", "ne"): _round(pm_total * (1 - share_en), 1000),
        "pm_weeks": weeks,
    }


def _lang_share(lang: str) -> float:
    tot = sum(VOLUMES["stage2"].values()) + sum(VOLUMES["component2"].values())
    return (VOLUMES["stage2"][lang] + VOLUMES["component2"][lang]) / tot


def schedule() -> dict:
    """Line items for the lump-sum table, by language."""
    r, f = rates(), fixed()
    lines = {}
    for lang in ("en", "ne"):
        s2 = VOLUMES["stage2"][lang]
        c2 = VOLUMES["component2"][lang]
        rr = round(c2 * REREVIEW_ALLOWANCE)
        lines[lang] = {
            "stage1": f[("stage1", lang)],
            "stage2": s2 * r[("stage2", lang)],
            "plan": c2 * r[("plan", lang)],
            "financials": c2 * r[("financials", lang)],
            "pitch": c2 * r[("pitch", lang)],
            "rereview": rr * r[("rereview", lang)],
            "pm": f[("pm", lang)],
            "rereview_count": rr,
        }
        fixed_part = lines[lang]["stage1"] + lines[lang]["pm"]
        lines[lang]["programme_rate"] = -_round(fixed_part * PROGRAMME_RATE, 1000)
        lines[lang]["total"] = sum(lines[lang][k] for k in
                                   ("stage1", "stage2", "plan", "financials", "pitch",
                                    "rereview", "pm", "programme_rate"))
    return lines


def reviewer_hours() -> dict:
    out = {}
    c2min = MINUTES["plan"] + MINUTES["financials"] + MINUTES["pitch"]
    for lang in ("en", "ne"):
        k = NON_ENGLISH_TIME if lang == "ne" else 1.0
        dbl = 1 + 0.10  # blind double scoring
        out[("stage2", lang)] = VOLUMES["stage2"][lang] * MINUTES["stage2"] * k / 60 * dbl
        c2 = VOLUMES["component2"][lang]
        out[("component2", lang)] = (c2 * c2min + c2 * REREVIEW_ALLOWANCE * c2min * REREVIEW_SHARE) * k / 60 * dbl
    return out


def reviewer_pool() -> dict:
    h = reviewer_hours()
    import math
    pool = {}
    for lang in ("en", "ne"):
        s2 = math.ceil(h[("stage2", lang)] / (WEEKS_STAGE2 * REVIEWER_HOURS_PER_WEEK))
        c2 = math.ceil(h[("component2", lang)] / (WEEKS_COMPONENT2 * REVIEWER_HOURS_PER_WEEK))
        pool[lang] = max(s2, c2)
        pool[(lang, "hours")] = round(h[("stage2", lang)] + h[("component2", lang)])
    return pool


def naira(x: int) -> str:
    return ("-N{:,}".format(-x)) if x < 0 else "N{:,}".format(x)


if __name__ == "__main__":
    r = rates()
    for k, v in r.items():
        print(k, naira(v))
    s = schedule()
    for lang in s:
        print(lang, {k: naira(v) if k != "rereview_count" else v for k, v in s[lang].items()})
    print("grand total", naira(s["en"]["total"] + s["ne"]["total"]))
    print("pool", reviewer_pool())
