"""
Clearview: the content, advertising and conversion model.

Three lines, and only one of them is a fee:
  1. Content production, billed to Clearview. CFA's team, his raw material.
  2. Media spend, Clearview's cost, passed through at ZERO mark up.
  3. A conversion share: CFA earns a percentage of collected revenue from the
     patients the campaigns actually bring in, across their whole journey.

Every assumption below is a guess until the first ninety days of real campaign
data replace it. That is said out loud in the deck, because a media model
nobody has measured is a hypothesis, not a plan.

    python3 scripts/clearview_agency.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import clearview_model as CM

M = CM.MID
CYCLE = M["fresh_rev"] / M["cycles"]          # NGN m, an all in fresh cycle

# ------------------------------------------------------------- the funnel ----
# Cost of ONE qualified enquiry: a woman of reproductive age, in catchment,
# actually trying, who asks a real question. Not a click, not a like.
CPQE = 0.025                                   # NGN m, band below
CPQE_BAND = (0.015, 0.040)

ENQ_TO_CONSULT = 0.32                          # cold paid traffic, not referral
CONSULT_TO_CYCLE = 0.22                        # cold converts worse, and slower
ENQ_TO_CYCLE = ENQ_TO_CONSULT * CONSULT_TO_CYCLE

LAG_MONTHS = 4                                 # first contact to first cycle

# ---------------------------------------------------- what a patient is worth -
# Over 24 months, not one cycle. This is the number the whole deal turns on.
REPEAT_CYCLE_RATE = 0.40                       # comes back for a second fresh
FET_RATE = 0.30                                # returns for a frozen transfer
FET_PRICE = CYCLE * CM.mid(CM.FET_MULTIPLE)
STORAGE = 0.18                                 # NGN m, two years of storage
CAPTURE_RATE = 0.30                            # delivers at Clearview Hospital
DELIVERY = CM.mid(CM.DELIVERY_M)


def patient_ltv():
    return (CYCLE
            + REPEAT_CYCLE_RATE * CYCLE
            + FET_RATE * FET_PRICE
            + STORAGE
            + CAPTURE_RATE * DELIVERY)


LTV = patient_ltv()
CAC = CPQE / ENQ_TO_CYCLE                      # media cost per acquired patient

# ------------------------------------------------- the laboratory ceiling ----
# The binding constraint is not his wallet. It is how many retrievals the lab
# can run. Spending past this buys enquiries that cannot be treated.
LAB_CEILING = 30                               # fresh cycles a month, total
HEADROOM = LAB_CEILING - M["cycles"]           # cycles a month we can add

# ------------------------------------------------------------ what CFA bills -
# One full shoot day per campaign, at the C4A office rather than his clinic.
# Debo, 2026-09-24: "per quarter we can have one shoot day. full day, invite
# everybody to c4a office and shoot. then post production and archiving. 4 for
# the first year and review. or we do 2 per year."
#
# Everybody in on one day: the doctor, consented patients, the team, referring
# colleagues. One bill, one set-up, one consent session. Shooting at our own
# office means he is not paying for a studio, and the room is already built.
# Debo, 2026-09-24: "better 2 shoots per year", "so we get as many testimonials
# as possible", "we also get as many scripted content as possible".
#
# So each day is packed rather than economical, and the library it produces has
# to stretch. Two shoot days a year, each feeding two three month campaigns, is
# twelve months of continuous advertising off two days of everybody's time.
# Post production is the big line precisely because the day is packed.
BLOCK = [
    ("Crew for a full packed day: camera, lighting, sound, assistant", 1.2, 0.450),
    ("Studio set and strike at the C4A office", 1.0, 0.120),
    ("Creative direction, scripting and scheduling the contributors", 3.0, 0.150),
    ("Consent and compliance across every patient contributor", 1.5, 0.120),
    ("Post production: one packed day into a deep asset library", 14.0, 0.085),
    ("Archiving, tagging and library management", 2.0, 0.085),
]
BLOCK_DIRECT = sum(d * r for _n, d, r in BLOCK)
BLOCK_MARKUP = 0.25
BLOCK_FEE = round(BLOCK_DIRECT * (1 + BLOCK_MARKUP), 2)

# What one packed day is expected to yield. Targets, not promises.
YIELD = [
    ("Patient testimonials", "8 to 12", "Consented, filmed properly, the whole point of the day"),
    ("Scripted pieces from you", "20 to 30", "Short answers to the questions patients actually ask"),
    ("Your team and referring colleagues", "4 to 6", "Embryologist, nurses, a gynaecologist who refers"),
    ("Edited assets from the above", "60 to 80", "Cutdowns, vertical versions, captioned variants"),
]

# Debo, 2026-09-24: "PR on blogs". Earned and placed coverage on Nigerian health
# and lifestyle blogs, alongside the paid advertising. It is a different job from
# an advert: it carries credibility a sponsored post cannot buy, it ranks in
# search long after the campaign stops, and it is what she finds when she goes
# looking for whether Clearview is real. The pieces are written out of the same
# shoot day, so the library feeds both channels.
PR_PER_CAMPAIGN = 5                            # placements per three month campaign
PR_COST_EACH = 0.25                            # NGN m, band below
PR_COST_BAND = (0.15, 0.80)                    # tier one blogs cost far more

BLOCKS_PER_YEAR = 2
CAMPAIGNS_PER_BLOCK = 2                        # a deep library feeds two campaigns

CONTENT_ONCE = BLOCK_FEE
CONTENT_SETUP = 0.0
CONTENT_MONTHLY = 0.0                          # there is no retainer
EXTRA_SHOOT_DAY = 0.45

# Debo, 2026-09-24: "20% is high." It was, and the reason is that 20 per cent of
# GROSS revenue is roughly 45 per cent of his CONTRIBUTION on those patients, so
# on profit it read as an even split with the man who owns the laboratory, the
# staff and all the clinical risk.
#
# So the instrument changes rather than the number being shaved. CFA is paid a
# FIXED FEE per attributed patient who starts treatment, set at one fifth of a
# single cycle. Nothing on her second cycle, nothing on storage, nothing on her
# delivery: that tail becomes entirely his. It is the same arithmetic expressed
# in a way he can hold in his head, and it removes the audit of his books.
FEE_CYCLE_MULTIPLE = 0.20                      # of ONE cycle, not of lifetime value
CONVERSION_SHARE = FEE_CYCLE_MULTIPLE          # retained name, first cycle only

# Debo, 2026-09-24: "campaigns will run for 3 months." The MEDIA runs for three
# months. The ATTRIBUTION window is much longer, and the difference is the whole
# commercial point: a woman who enquires in month two may not cycle until month
# six, may return for a second cycle in month fourteen, and may deliver in month
# eighteen. A three month attribution window would pay CFA close to nothing,
# because the lag from first enquiry to first cycle is about four months.
CAMPAIGN_MONTHS = 3
TERM = 24                                      # attribution window, per patient


def cycles_from(media_monthly):
    """Fresh cycles a month acquired at a given monthly media spend, capped by
    what the laboratory can actually carry."""
    raw = media_monthly / CPQE * ENQ_TO_CYCLE
    return min(raw, HEADROOM)


def enquiries_from(media_monthly):
    return media_monthly / CPQE


def budget_row(media_monthly):
    cyc = cycles_from(media_monthly)
    return dict(
        media=media_monthly,
        enquiries=enquiries_from(media_monthly),
        cycles=cyc,
        capped=cyc < enquiries_from(media_monthly) * ENQ_TO_CYCLE - 1e-9,
        patient_value=cyc * LTV,               # NGN m of 24 month value created a month
        cfa_share=cyc * LTV * CONVERSION_SHARE,
        his_cost=media_monthly + CONTENT_MONTHLY,
    )


BUDGETS = [1.5, 3.0, 4.5, 6.0]


def ramp(month, start=2, full=9):
    if month < start:
        return 0.0
    if month >= full:
        return 1.0
    return (month - start) / (full - start)


# ------------------------------------------------------------ sensitivity ----
# A 22x return on media is what the base assumptions give, and a 22x claim in a
# client deck is a liability rather than a selling point. So the deck publishes
# the band, and the pessimistic corner is the one to talk to.
CASES = {
    "pessimistic": dict(cpqe=0.040, e2c=0.32 * 0.14, repeat=0.25, fet=0.20, capture=0.15),
    "base":        dict(cpqe=0.025, e2c=ENQ_TO_CYCLE, repeat=0.40, fet=0.30, capture=0.30),
    "optimistic":  dict(cpqe=0.015, e2c=0.38 * 0.28, repeat=0.50, fet=0.40, capture=0.45),
}


def campaign(media_monthly):
    """One three month campaign: what it costs him, what it brings, what it pays."""
    spend = media_monthly * CAMPAIGN_MONTHS
    enq = spend / CPQE
    patients = min(enq * ENQ_TO_CYCLE, HEADROOM * CAMPAIGN_MONTHS)
    value = patients * LTV                     # collected over TERM months
    return dict(
        media_monthly=media_monthly,
        spend=spend,
        enquiries=enq,
        patients=patients,
        value=value,
        cfa_conversion=value * CONVERSION_SHARE,
        his_cost=spend + CONTENT_ONCE + value * CONVERSION_SHARE,
        his_keep=value - (spend + CONTENT_ONCE + value * CONVERSION_SHARE),
    )


def campaign_case(name, media_monthly):
    """The same three month campaign under the sensitivity corners."""
    k = CASES[name]
    ltv = (CYCLE + k["repeat"] * CYCLE + k["fet"] * FET_PRICE + STORAGE
           + k["capture"] * DELIVERY)
    spend = media_monthly * CAMPAIGN_MONTHS
    patients = min(spend / k["cpqe"] * k["e2c"], HEADROOM * CAMPAIGN_MONTHS)
    value = patients * ltv
    return dict(name=name, patients=patients, value=value,
                cfa=value * CONVERSION_SHARE,
                keep=value - (spend + CONTENT_ONCE + value * CONVERSION_SHARE))


def m(x, dp=1):
    return ("{:,.%df}" % dp).format(x)


if __name__ == "__main__":
    print("Clearview: content, ads and conversion\n")
    print("  A fresh cycle                       NGN %s m" % m(CYCLE, 2))
    print("  Qualified enquiry costs             NGN %s m   (band %s to %s)"
          % (m(CPQE, 3), m(CPQE_BAND[0], 3), m(CPQE_BAND[1], 3)))
    print("  Enquiry to cycle                    %.1f%%" % (ENQ_TO_CYCLE * 100))
    print("  Media cost per acquired patient     NGN %s m" % m(CAC, 2))
    print("  What one patient is worth over %d mo NGN %s m" % (TERM, m(LTV, 2)))
    print("  Return on media                     %.0fx" % (LTV / CAC))
    print("\n  Laboratory ceiling %d cycles a month, so headroom is %d a month."
          % (LAB_CEILING, HEADROOM))

    print("\n  %-9s %10s %9s %9s %14s %12s" %
          ("media/mo", "enquiries", "cycles", "capped", "value created", "CFA share"))
    for b in BUDGETS:
        r = budget_row(b)
        print("  %-9s %10.0f %9.1f %9s %14s %12s"
              % ("N%.1fm" % b, r["enquiries"], r["cycles"], "yes" if r["capped"] else "no",
                 "N%s m" % m(r["patient_value"], 1), "N%s m" % m(r["cfa_share"], 1)))

    print("\n  Over %d months, at N3.0m a month of media:" % TERM)
    fee, rev, cost = project(3.0)
    print("    Clearview collects      NGN %s m" % m(sum(rev), 0))
    print("    Clearview pays CFA      NGN %s m  (content %s + conversion %s)"
          % (m(CONTENT_SETUP + CONTENT_MONTHLY * TERM + sum(fee), 0),
             m(CONTENT_SETUP + CONTENT_MONTHLY * TERM, 0), m(sum(fee), 0)))
    print("    Clearview pays media    NGN %s m" % m(3.0 * TERM, 0))
    print("    Clearview keeps         NGN %s m"
          % m(sum(rev) - (CONTENT_SETUP + CONTENT_MONTHLY * TERM + sum(fee)) - 3.0 * TERM, 0))


def case(name):
    k = CASES[name]
    ltv = (CYCLE + k["repeat"] * CYCLE + k["fet"] * FET_PRICE + STORAGE
           + k["capture"] * DELIVERY)
    cac = k["cpqe"] / k["e2c"]
    return dict(name=name, cac=cac, ltv=ltv, ret=ltv / cac,
                cycles_at=lambda media, e2c=k["e2c"], c=k["cpqe"]:
                    min(media / c * e2c, HEADROOM))


def case_row(name, media=3.0):
    c = case(name)
    cyc = c["cycles_at"](media)
    return dict(name=name, cac=c["cac"], ltv=c["ltv"], ret=c["ret"], cycles=cyc,
                value=cyc * c["ltv"], cfa=cyc * c["ltv"] * CONVERSION_SHARE)


if __name__ == "__main__":
    print("\n  Sensitivity, at N3.0m a month of media\n")
    print("  %-13s %9s %9s %7s %9s %14s %11s"
          % ("", "cost/pt", "worth", "return", "cycles/mo", "value created", "CFA share"))
    for n in CASES:
        r = case_row(n)
        print("  %-13s %9s %9s %6.0fx %9.1f %14s %11s"
              % (n, "N%s m" % m(r["cac"], 2), "N%s m" % m(r["ltv"], 1), r["ret"],
                 r["cycles"], "N%s m" % m(r["value"], 1), "N%s m" % m(r["cfa"], 1)))


# ------------------------------------------------------------------- year 1 --
FEE_PER_PATIENT = round(FEE_CYCLE_MULTIPLE * CYCLE, 2)


def year_one(media_monthly, blocks=BLOCKS_PER_YEAR):
    """A year of campaigns. Each shoot day feeds CAMPAIGNS_PER_BLOCK campaigns of
    CAMPAIGN_MONTHS each; every patient is then followed TERM months, which is
    why the value lands long after the year does."""
    live_months = blocks * CAMPAIGNS_PER_BLOCK * CAMPAIGN_MONTHS
    campaigns = blocks * CAMPAIGNS_PER_BLOCK
    ads = media_monthly * live_months
    pr = campaigns * PR_PER_CAMPAIGN * PR_COST_EACH
    spend = ads + pr
    enq = spend / CPQE
    patients = min(enq * ENQ_TO_CYCLE, HEADROOM * 12)
    value = patients * LTV
    content = BLOCK_FEE * blocks
    cfa = patients * FEE_PER_PATIENT
    return dict(blocks=blocks, campaigns=campaigns, live_months=live_months,
                ads=ads, pr=pr, spend=spend,
                enquiries=enq, patients=patients, value=value, content=content,
                cfa_conversion=cfa, outlay=spend + content,
                his_keep=value - spend - content - cfa)


def year_one_case(name, media_monthly, blocks=BLOCKS_PER_YEAR):
    """Year one under a sensitivity corner."""
    k = CASES[name]
    ltv = (CYCLE + k["repeat"] * CYCLE + k["fet"] * FET_PRICE + STORAGE
           + k["capture"] * DELIVERY)
    campaigns = blocks * CAMPAIGNS_PER_BLOCK
    spend = (media_monthly * campaigns * CAMPAIGN_MONTHS
             + campaigns * PR_PER_CAMPAIGN * PR_COST_EACH)
    content = BLOCK_FEE * blocks
    patients = min(spend / k["cpqe"] * k["e2c"], HEADROOM * 12)
    value = patients * ltv
    cfa = patients * FEE_CYCLE_MULTIPLE * CYCLE
    return dict(name=name, patients=patients, value=value, cfa=cfa,
                outlay=spend + content, keep=value - spend - content - cfa)


# ------------------------------------------------------ the Mezo channel -----
# Debo, 2026-10-11: Clearview is a live facility-use partner on Mezo, a C4A
# company, and Mezo is building an organic IVF search programme around it
# (growth/seo/IVF_CAPTURE.md in the Mezo workspace). So the proposal carries a
# second channel alongside the paid one.
#
# What it is: search pages for the whole journey (can't conceive, HSG and AMH
# prices, the all-in IVF price, IVF from abroad in GBP and USD), a fixed price
# Couple Fertility Check as the entry offer, and the Mezo network for remote
# monitoring scans (Beacon Ikeja and Sangotedo on the mainland, Abuja to follow).
#
# Terms: Mezo builds and runs it at its own cost. He pays no media and no
# content on it. The same fee per patient who starts treatment applies, once,
# and only on first contact through Mezo. Mezo publishes HIS price for the
# cycle with no markup, because he also sells direct and two prices for the
# same cycle would kill trust in both. Mezo earns the fee on the cycle and the
# network spread on the Fertility Check, which Mezo bills.
#
# Attribution is the strongest point: a patient who books and pays on Mezo
# carries her source on the payment itself, so for this channel the register
# argument does not arise.
#
# Organic volume is NOT in any modelled figure. Search takes three to six
# months to rank and nobody has measured it for this clinic, so it is shown as
# upside only. The illustrative band below is for the private guide, never the
# deck.
MEZO_FEE_PER_PATIENT = FEE_PER_PATIENT         # one fee, whichever channel
MEZO_RANK_MONTHS = (3, 6)                      # months before search pages earn
MEZO_PATIENTS_MONTH_BAND = (1, 4)              # illustrative, after ranking
MEZO_MARKUP_ON_CYCLE = 0.0                     # his price, published as his
