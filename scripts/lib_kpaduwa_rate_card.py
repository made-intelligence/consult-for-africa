"""
Dr Kpaduwa's surgical rate card for Lagos. Single source of truth for the card
(scripts/build-kpaduwa-rate-card.py) and anything that later publishes from it.

THE RULE, one dial: the Lagos all-in price is RATIO of what the same operation
costs a patient in Beverly Hills on her own recommended schedule, taking the
BOTTOM of her professional fee band plus the bottom of the matching theatre and
anaesthesia tier. Both come from the KPPS pro forma (~/Downloads, Oct 2026).
The Beverly Hills figures are professional fee only, which is why the theatre
tier is added before comparing; see reference_aesthetic_pricing_benchmarks.

Why 0.40. Lagos quotes collected in October 2026 sit at 18 to 47 per cent of
Beverly Hills all-in. 0.40 is the upper part of that range and still well under
half of Los Angeles. Change RATIO and every line moves.

THE FLOOR (Dr Kpaduwa, 15 Oct 2026): every line sits at least LAGOS_PREMIUM
above the highest Lagos quote for the same item, "consistently even if that is
just by 5%". Where 40% of Beverly Hills is already higher, it stands.

HER NOTES OF 15 OCT 2026, applied here: anti-wrinkle is priced per unit, not
per area; no threads; overnight stays only for operations over six hours, which
on this list means at most the mommy makeover; extended tummy tuck dropped.

Lagos comparators are ANONYMISED on purpose. One of them is a live CFA
prospect, so no provider is named in anything that leaves the building.

WHO IT IS FOR (Debo, 14 Oct 2026): elite Nigerians aged 40 to 60 who do not
want anyone to know they have had work done. So the card leads with the face
and the body after children, and leaves off the conspicuous operations: no
buttock fat transfer and no massive weight loss lifts. This client's reference
price is London, Dubai or the US, not a Lagos clinic, which is why the anchor
is her own Beverly Hills schedule and the Lagos quotes are shown only as the
floor.

Theatre tiers marked est. are not in the pro forma's case table; they are read
off its time tiers at the duration the operation normally takes.

No em dashes. NGN.
"""

from __future__ import annotations

import math
import re

FX = 1_550                 # NGN per USD, the rate used across the aesthetics work
RATIO = 0.40               # Lagos all-in as a share of Beverly Hills all-in
LAGOS_PREMIUM = 0.05       # at least this far above the highest Lagos quote
COMBINATION = 0.80         # each further operation at the same sitting
DEPOSIT = 0.30             # booking deposit, holds the date
CONSULT_FEE = 150_000      # matches LYFE_CONSULT.fee in lib/lyfe.ts
QUOTE_DAYS = 90
BALANCE_DAYS = 14

M = 1_000_000

# (name, BH professional fee low $, theatre + anaesthesia low $, stay,
#  Lagos quotes held or None, note). Everything is outpatient; OVER_SIX is the
# one line that may run past six hours and so may stay a night.
DAY = 0
OVER_SIX = -1
GROUPS: list[tuple[str, list[tuple]]] = [
    ("Face", [
        ("Upper eyelids", 5_500, 2_100, DAY, None, ""),
        ("Lower eyelids", 7_500, 2_850, DAY, None, ""),
        ("Upper and lower eyelids", 12_000, 3_100, DAY, None, ""),
        ("Brow lift, endoscopic", 10_000, 3_100, DAY, None, ""),
        ("Mini face lift", 15_000, 4_350, DAY, None, ""),
        ("Neck lift", 12_000, 4_350, DAY, None, ""),
        ("Deep plane face lift", 22_000, 5_850, DAY, "No surgical quote held", "Thread lifts sold as face lifts run to N2.9m"),
        ("Deep plane face and neck lift", 28_000, 6_850, DAY, None, ""),
        ("Rhinoplasty", 14_000, 4_350, DAY, None, ""),
        ("Septorhinoplasty", 16_000, 4_350, DAY, None, ""),
        ("Revision rhinoplasty", 20_000, 5_850, DAY, None, "From; the quote follows the scan"),
        ("Chin implant", 7_500, 2_600, DAY, None, ""),
        ("Chin and neck liposuction", 5_000, 2_100, DAY, None, ""),
        ("Buccal fat reduction", 5_000, 2_100, DAY, None, ""),
        ("Lip lift", 5_000, 2_100, DAY, None, ""),
        ("Ear correction", 8_000, 3_100, DAY, None, ""),
        ("Facial fat grafting", 6_000, 2_600, DAY, None, ""),
    ]),
    ("Breast", [
        ("Breast enlargement, implants included", 12_000, 2_850, DAY, None, ""),
        ("Breast lift", 9_000, 3_850, DAY, "N9m to N10.5m", ""),
        ("Breast lift with implants, implants included", 17_500, 4_350, DAY, None, ""),
        ("Breast reduction", 10_000, 4_350, DAY, "N6.25m to N10.5m", ""),
        ("Implant exchange or revision", 10_000, 3_100, DAY, None, "Implants extra if replaced"),
        ("Implant removal with capsule", 9_000, 3_600, DAY, None, ""),
        ("Fat grafting to the breast", 7_500, 3_100, DAY, None, ""),
        ("Male breast reduction", 8_000, 3_100, DAY, None, ""),
    ]),
    ("Body", [
        ("Liposuction, one trunk area", 4_000, 2_350, DAY, None, "Each further area at 80%"),
        ("Liposuction, several areas", 10_000, 3_600, DAY, None, ""),
        ("Mini tummy tuck", 10_000, 3_100, DAY, None, ""),
        ("Tummy tuck", 14_000, 4_350, DAY, None, ""),
        ("Arm lift", 10_000, 3_850, DAY, "N9m to N10.5m", ""),
        ("Inner thigh lift", 12_000, 4_100, DAY, None, ""),
        ("Mommy makeover", 22_000, 6_850, OVER_SIX, "N7.1m to N17m", "Tummy tuck, breast and liposuction together"),
    ]),
    ("Scars and minor procedures, under local", [
        ("Scar revision, per 15 cm", 2_500, 0, DAY, None, ""),
        ("Lesion removal", 1_500, 0, DAY, None, ""),
        ("Earlobe repair", 1_500, 0, DAY, None, ""),
    ]),
]

# THE TEAM'S REPORT: "Hospital & Aesthetic Plastic Surgery Price Comparison
# Report", October 2026 (~/Downloads). Every quote in it, with whether it is a
# fair comparator for a line on the card and why. Providers are shown by alias
# unless SHOW_NAMES is set: one of them (F) is a live CFA prospect.
SHOW_NAMES = False
PROVIDERS = {
    "A": ("Reverse Aesthetics", "Aesthetics clinic, Victoria Island and Abuja"),
    "B": ("CGE Healthcare", "Hospital"),
    "C": ("Soul Place", "Aesthetics clinic"),
    "D": ("Renew Aesthetics", "Aesthetics clinic, Abuja"),
    "E": ("BM Empire", "Aesthetics clinic"),
    "F": ("Grandville Medical and Laser", "Hospital"),
    "G": ("Skye Medical Aesthetics", "Medical aesthetics centre, no plastic surgeon"),
}
# (provider, procedure, quote, basis, used, reason)
LAGOS_QUOTES = [
    ("A", "Face lift", "From N350,000", "From price; plan after examination", False, "Not an all-in surgical price"),
    ("A", "Lip lift with Botox", "From N200,000", "WhatsApp", False, "Non-surgical"),
    ("A", "Consultation", "N30,000", "Waived if treated same day", False, "Consultation fee"),
    ("B", "Breast lift or reduction", "N9m to N10.5m", "Range", True, "Breast lift; breast reduction"),
    ("B", "Arm lift", "N9m to N10.5m", "Range", True, "Arm lift"),
    ("B", "Mummy makeover", "N12m to N16m", "Personalised combination", True, "Mommy makeover"),
    ("B", "360 liposuction with fat grafting", "N8.5m to N10m", "Range", False, "Operation not on the card"),
    ("B", "Four operations grouped", "N8.5m to N10m",
     "One budget for the group", False, "Report: not a standalone price per operation"),
    ("C", "Mummy makeover", "N7.1m to N17m", "Personalised", True, "Mommy makeover"),
    ("C", "Body lift, breast enlargement", "None", "Consultation required", False, "No price given"),
    ("D", "Any procedure", "None", "Consultation required", False, "No price given"),
    ("E", "Procedure and admission", "None", "Physical assessment required", False, "No price given"),
    ("F", "Breast reduction", "N6,247,125", "Itemised: procedure N4.96m, tests, stay, drugs N1.29m", True, "Breast reduction"),
    ("F", "Consultation", "N50,000", "Weekdays, 8am", False, "Consultation fee"),
    ("A", "Lip definition with filler", "N400,000", "WhatsApp", True, "Lip filler"),
    ("G", "Anti-wrinkle", "N10,735/unit", "Catalogue", True, "Anti-wrinkle, per unit"),
    ("G", "Hyaluronic filler", "N338,153 to N570,000", "Catalogue, per syringe", True, "Dermal, cheek and jaw filler"),
    ("G", "Tear trough filler", "N390,754", "Catalogue, per syringe", True, "Under-eye filler"),
    ("G", "Profhilo", "N299,936", "Catalogue", True, "Skin bio-remodelling"),
    ("G", "RF microneedling, full face", "N523,868", "Catalogue", True, "RF microneedling, face"),
    ("G", "Focused ultrasound, face and neck", "N206,112", "Catalogue", True, "Skin tightening"),
    ("G", "Focused ultrasound, stomach", "N251,199", "Catalogue", True, "Body contouring"),
    ("G", "Full face thread lift", "N2,870,839", "Catalogue", False, "Not offered"),
    ("G", "Lower face thread lift", "N1,766,680", "Catalogue", False, "Not offered"),
    ("G", "Endolift, full face", "N3.35m to N4.51m", "Catalogue", False, "Not offered"),
]


# ---------------------------------------------------------------- dermatology
# Same rule as surgery: RATIO of her Beverly Hills recommended fee (KPPS
# Non-Surgical MedSpa sheet, bottom of band), floored at the highest Lagos quote
# for the same item in the team's report, then rounded up. Where she has no
# Beverly Hills line the Lagos top alone sets it; where there is neither, the
# website price stands. "Website" is LYFE_PRICING in lib/lyfe.ts today.
#
# Left off pending her view: IPL and ablative laser resurfacing, which carry
# pigmentation risk on darker skin; vitamin infusions, which her own schedule
# says not to emphasise. Left off at her word (15 Oct): thread lifts.
# (group, item, BH low $, Lagos top NGN, provider, website NGN, note)
DERM = [
    ("Injectables", [
        ("Anti-wrinkle, per unit", 18, 10_735, "G", None, "Forehead alone is 10 to 20 units"),
        ("Dermal filler, per syringe", 850, 570_000, "G", 600_000, ""),
        ("Cheek and jaw filler, per syringe", 950, 570_000, "G", None, ""),
        ("Under-eye filler", 850, 390_754, "G", None, ""),
        ("Lip filler", 850, 400_000, "A", None, ""),
        ("Skin bio-remodelling, per session", 850, 299_936, "G", 550_000, "Profhilo type; a course is two"),
        ("Skin boosters and mesotherapy", None, None, "", 350_000, "No benchmark; website price kept"),
        ("Collagen stimulator, per vial", 1_000, None, "", None, ""),
        ("Calcium-based filler, per syringe", 950, None, "", None, ""),
        ("Fat-dissolving injection, per session", 1_200, None, "", None, ""),
    ]),
    ("Skin and devices", [
        ("RF microneedling, face", 1_200, 523_868, "G", 600_000, ""),
        ("RF microneedling, face and neck", 1_800, None, "", None, ""),
        ("RF microneedling, course of three", 4_500, None, "", None, ""),
        ("Skin tightening, face and neck", 750, 206_112, "G", None, "Focused ultrasound"),
        ("Body contouring, per area", 750, 251_199, "G", None, ""),
        ("Superficial chemical peel", 250, None, "", 200_000, ""),
        ("Medium-depth chemical peel", 750, None, "", None, ""),
        ("Medical facial", 850, None, "", 150_000, ""),
        ("Laser hair removal, per area", 300, None, "", None, "Laser suited to darker skin"),
    ]),
    ("Regenerative and lifting", [
        ("PRP, skin or hair", 750, None, "", 350_000, "Per session"),
        ("PRF, under the eyes", 900, None, "", None, ""),
    ]),
]
DERM_CONSULT = 100_000   # LYFE_PRICING aesthetic consultation, credited against treatment
DERM_ON_CONSULT = [
    "Pigmentation and melasma programmes",
    "Keloid treatment",
    "Acne and acne-scar programmes",
]


def derm_price(bh: int | None, lagos: int | None, website: int | None) -> int:
    if bh is None and lagos is None:
        return website
    return _round_up(max((bh or 0) * FX * RATIO, (lagos or 0) * (1 + LAGOS_PREMIUM)))


def derm_rows():
    out = []
    for group, items in DERM:
        for item, bh, lagos, prov, web, note in items:
            out.append(dict(group=group, name=item, bh=bh, lagos=lagos, prov=prov, website=web,
                            note=note, price=derm_price(bh, lagos, web)))
    return out


# PREMIUM OVER LAGOS: our price against the lowest and highest Lagos quote for
# the same item in the team's report. Non-surgical prices are copied from
# LYFE_PRICING in lib/lyfe.ts; change both together.
# (item, kind, ours NGN, lagos low, lagos high, providers, note)
CONSULT_LAGOS = (30_000, 50_000, "A, F")


def premium_rows():
    """(item, kind, ours, low, high, providers, note) for every item with a Lagos price."""
    out = []
    for name in ["Breast reduction", "Breast lift", "Arm lift", "Mommy makeover"]:
        r = by_name(name)
        qs = [q for q in LAGOS_QUOTES if q[4] and name.lower() in q[5].lower()]
        vals, provs = [], []
        for q in qs:
            nums = [float(x) * M for x in re.findall(r"N(\d+(?:\.\d+)?)m", q[2])]
            nums += [int(x.replace(",", "")) for x in re.findall(r"N(\d{1,3}(?:,\d{3})+)", q[2])]
            vals += nums; provs.append(q[0])
        out.append((name, "Surgery", r["price"], int(min(vals)), int(max(vals)), ", ".join(sorted(set(provs))), ""))
    out.append(("Surgeon consultation", "Consultation", CONSULT_FEE, CONSULT_LAGOS[0], CONSULT_LAGOS[1], CONSULT_LAGOS[2], ""))
    for r in derm_rows():
        if r["lagos"]:
            out.append((r["name"], "Dermatology", r["price"], r["lagos"], r["lagos"], r["prov"], ""))
    return out


def premium(ours: int, quote: int) -> int:
    return round((ours / quote - 1) * 100)


def provider_label(code: str) -> str:
    name, kind = PROVIDERS[code]
    return name if SHOW_NAMES else f"Provider {code}"


# Quoted only after consultation, because the operation is defined by the case.
CASE_BY_CASE = [
    "Breast reconstruction, including after cancer",
    "Correction of surgery done elsewhere",
    "Wound and deformity reconstruction",
]


def _round_up(n: float) -> int:
    step = 250_000 if n >= 2 * M else 50_000 if n >= 100_000 else 500
    return int(math.ceil(n / step) * step)


def bh_all_in_usd(prof: int, theatre: int) -> int:
    return prof + theatre


def lagos_top(quote: str | None) -> int:
    """The highest figure in a Lagos quote string, in naira, or 0."""
    found = re.findall(r"N(\d+(?:\.\d+)?)m", quote or "")
    return int(max(float(f) for f in found) * M) if found else 0


def lagos_price(prof: int, theatre: int, quote: str | None = None) -> int:
    """RATIO of Beverly Hills all-in, at least LAGOS_PREMIUM above the highest Lagos quote."""
    return _round_up(max(bh_all_in_usd(prof, theatre) * FX * RATIO, lagos_floor(quote)))


def lagos_floor(quote: str | None) -> float:
    return lagos_top(quote) * (1 + LAGOS_PREMIUM)


def ngn(n: int) -> str:
    if n >= M:
        v = n / M
        return f"N{v:,.2f}m".replace(".00m", "m").replace("0m", "m") if v % 1 else f"N{v:,.0f}m"
    return f"N{n:,.0f}"


def rows():
    """Every priced line with its computed figures."""
    out = []
    for group, items in GROUPS:
        for name, prof, theatre, nights, lagos, note in items:
            out.append(dict(
                group=group, name=name, nights=nights, lagos=lagos, note=note,
                bh_usd=bh_all_in_usd(prof, theatre), price=lagos_price(prof, theatre, lagos),
                floored=lagos_floor(lagos) > bh_all_in_usd(prof, theatre) * FX * RATIO,
            ))
    return out


def by_name(name: str) -> dict:
    return next(r for r in rows() if r["name"] == name)


if __name__ == "__main__":
    for r in rows():
        print(f"{r['group'][:6]:6} {r['name'][:44]:44} {ngn(r['price']):>9}  BH ${r['bh_usd']:,}  {r['lagos'] or ''}")
