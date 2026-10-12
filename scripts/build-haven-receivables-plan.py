"""
Build the Working Capital and Receivables Recovery Plan: the second of the two
deliverables promised from workstream 1, due 6 August and written late.

It is written late because the receivables ageing and the claims schedules were
never supplied, which the audit itself records. The document says so in the
opening letter rather than quietly presenting a plan built on figures nobody
has seen.

Reads continuously, so no section breaks.

    python3 scripts/build-haven-receivables-plan.py

Source: docs/haven-receivables-recovery-plan-cfa.md
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-receivables-recovery-plan-cfa.md",
        DOCS / "haven-receivables-recovery-plan-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  Working capital and receivables",
        "Confidential  /  Prepared for the Haven Paediatric Centre board",
        cover_list=[
            ("01", "What we established"),
            ("02", "What we still need"),
            ("03", "The recovery, in four moves"),
            ("04", "The other half of the working capital"),
            ("05", "What this is worth"),
            ("06", "The first fortnight"),
            ("07", "What we need from you"),
        ],
        section_breaks=False,
    )
