"""
Build the Haven operations handbook for Dr Omotanwa Gbadebo.

Numbered sections start on a fresh page: this is a book somebody opens at
section 10 on a Tuesday because the pharmacy has run out of something, not a
document read straight through.

    python3 scripts/build-haven-ops-handbook.py

Source: docs/haven-operations-handbook-cfa.md
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-operations-handbook-cfa.md",
        DOCS / "haven-operations-handbook-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  The Operations Handbook",
        "Internal to Consult for Africa  /  Prepared for Dr Omotanwa Gbadebo",
        cover_list=[
            ("I", "The job"),
            ("II", "The money"),
            ("III", "Running the hospital"),
            ("IV", "The people"),
            ("V", "Safety and governance"),
            ("VI", "Growth"),
            ("VII", "You"),
        ],
        section_breaks=True,
    )
