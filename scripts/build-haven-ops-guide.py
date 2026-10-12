"""
Build the engagement guide for Dr Omotanwa Gbadebo, the CFA consultant going
into Haven to run operations. Internal: it carries the May 2026 framing rule. Reads continuously, so no section breaks: it is the short document
she reads once, before the handbook she works through.

    python3 scripts/build-haven-ops-guide.py

Source: docs/haven-ops-lead-guide-cfa.md
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-ops-lead-guide-cfa.md",
        DOCS / "haven-ops-lead-guide-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  Engagement guide for the operations lead",
        "Internal to Consult for Africa  /  Not for the client",
        cover_list=[
            ("01", "Where you sit"),
            ("02", "Read this first. The sensitivities"),
            ("03", "What Haven is"),
            ("04", "What we found"),
            ("05", "What you own at Haven"),
            ("06", "Your first ninety days"),
            ("07", "How we work"),
        ],
        section_breaks=False,
    )
