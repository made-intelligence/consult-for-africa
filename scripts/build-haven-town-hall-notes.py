"""
Build Debo's speaking notes for the Haven staff town hall. Reads continuously:
it is a card he holds, not a book.

    python3 scripts/build-haven-town-hall-notes.py

Source: docs/haven-town-hall-notes-cfa.md
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-town-hall-notes-cfa.md",
        DOCS / "haven-town-hall-notes-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  Town hall speaking notes",
        "Internal to Consult for Africa  /  Speaking notes, not a handout",
        section_breaks=False,
    )
