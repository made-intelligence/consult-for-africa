"""
Build the engagement guide for Abigail Oladejo, who runs the Haven people
workstream alongside Dr Omotanwa Gbadebo: staff realignment, job description
reviews, new contracts and objective setting. Internal: it carries the May 2026
framing rule and the pay sensitivities. Modelled on the operations lead guide,
and carries worked examples because new work comes to her with one that is
already right.

    python3 scripts/build-haven-people-guide.py

Source: docs/haven-people-lead-guide-cfa.md
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-people-lead-guide-cfa.md",
        DOCS / "haven-people-lead-guide-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  Engagement guide for the people workstream",
        "Internal to Consult for Africa  /  Not for the client",
        cover_list=[
            ("01", "Where you sit"),
            ("02", "Read this first. The sensitivities"),
            ("03", "What we found about Haven's people"),
            ("04", "The four pieces, and why the order matters"),
            ("05", "Staff realignment"),
            ("06", "Job descriptions"),
            ("07", "New contracts"),
            ("08", "Objectives"),
            ("09", "Talking to staff"),
            ("10", "Examples to copy"),
            ("11", "How we work"),
        ],
        section_breaks=False,
    )
