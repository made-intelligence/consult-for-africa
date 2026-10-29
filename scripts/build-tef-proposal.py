"""
Build the Consult for Africa proposal to the Tony Elumelu Foundation for
Business Plan, Financials and Pitch Video Review Services (due 9 October 2026).

    python3 scripts/build-tef-proposal.py

The text lives in docs/tef/tef-review-proposal.template.md. Every figure in
braces is filled from scripts/lib_tef_review_fee.py, so the rate card, the
lump sum and the reviewer pool cannot drift apart. The rendered markdown and
the PDF land beside the template.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lib_tef_review_fee as fee  # noqa: E402
from osteon_doc import build_doc  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "tef"
TEMPLATE = OUT / "tef-review-proposal.template.md"
STEM = "Consult for Africa - TEF Review Services Proposal"

FOOTER = "Confidential  /  Submitted to The Tony Elumelu Foundation, October 2026"
HEADER = "Business Plan, Financials and Pitch Video Review"


def values() -> dict:
    n = fee.naira
    r, s, pool = fee.rates(), fee.schedule(), fee.reviewer_pool()
    v = {}
    for (item, lang), rate in r.items():
        v[f"r_{item}_{lang}"] = n(rate)
    for lang in ("en", "ne"):
        for k, amt in s[lang].items():
            v[f"s_{k}_{lang}"] = n(amt) if k != "rereview_count" else f"{amt:,}"
        v[f"pool_{lang}"] = pool[lang]
        v[f"hours_{lang}"] = f"{pool[(lang, 'hours')]:,}"
        v[f"vol_s2_{lang}"] = f"{fee.VOLUMES['stage2'][lang]:,}"
        v[f"vol_c2_{lang}"] = f"{fee.VOLUMES['component2'][lang]:,}"
    for k in ("stage1", "stage2", "plan", "financials", "pitch", "rereview", "pm", "programme_rate", "total"):
        v[f"s_{k}_all"] = n(s["en"][k] + s["ne"][k])
    v["pool_all"] = pool["en"] + pool["ne"]
    v["vol_s2_all"] = f"{sum(fee.VOLUMES['stage2'].values()):,}"
    v["vol_c2_all"] = f"{sum(fee.VOLUMES['component2'].values()):,}"
    for k, m in fee.MINUTES.items():
        v[f"min_{k}"] = m
        v[f"min_{k}_ne"] = round(m * fee.NON_ENGLISH_TIME)
    v["pm_weeks"] = fee.fixed()["pm_weeks"]
    v["weeks_s2"] = fee.WEEKS_STAGE2
    v["weeks_c2"] = fee.WEEKS_COMPONENT2
    v["rev_hours_wk"] = fee.REVIEWER_HOURS_PER_WEEK
    v["rereview_pct"] = int(fee.REREVIEW_ALLOWANCE * 100)
    v["programme_pct"] = int(fee.PROGRAMME_RATE * 100)
    return v


if __name__ == "__main__":
    md = TEMPLATE.read_text(encoding="utf-8").format_map(values())
    src = OUT / f"{STEM}.md"
    src.write_text(md, encoding="utf-8")
    build_doc(src, OUT / f"{STEM}.pdf", HEADER, FOOTER)
