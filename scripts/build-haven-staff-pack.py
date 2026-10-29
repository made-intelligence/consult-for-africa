"""
Build the Haven staff onboarding and reorientation pack.

Goes to all nineteen, from the attendants to the Chief Medical Director, so the
language is deliberately plain and the sections are short. Section breaks on, so
somebody can open it at section 6 when they want to report something.

Staff-facing, therefore: no reference to May 2026, no money of any kind, no
naming of the platform behind the assessment, nothing about Dr Gbadebo, and no
promise about jobs or pay.

    python3 scripts/build-haven-staff-pack.py

Source: docs/haven-staff-onboarding-pack-cfa.md
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-staff-onboarding-pack-cfa.md",
        DOCS / "haven-staff-onboarding-pack-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  Onboarding and reorientation",
        "For everyone at Haven  /  Consult for Africa",
        cover_list=[
            ("01", "Why everybody is getting this"),
            ("02", "What we are trying to achieve"),
            ("03", "How we will see how we are doing"),
            ("04", "What good looks like in your job"),
            ("06", "Speaking up"),
            ("07", "Your buddy"),
            ("08", "Your assessment"),
        ],
        section_breaks=True,
    )
