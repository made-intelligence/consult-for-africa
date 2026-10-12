"""
Build the Haven operations working pack: the forms the handbook tells her to
keep. Printed and filled in by hand, so every form starts on its own page.

    python3 scripts/build-haven-ops-working-pack.py

Source: docs/haven-ops-working-pack-cfa.md
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-ops-working-pack-cfa.md",
        DOCS / "haven-ops-working-pack-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  The Working Pack",
        "Internal to Consult for Africa  /  Prepared for Dr Omotanwa Gbadebo",
        cover_list=[
            ("01", "The monthly numbers page"),
            ("03", "The weekly operating review"),
            ("04", "The board page"),
            ("05", "The tariff worksheet"),
            ("06", "The HMO reconciliation"),
            ("08", "The incident register"),
            ("10", "The ninety-day tracker"),
        ],
        section_breaks=True,
    )
