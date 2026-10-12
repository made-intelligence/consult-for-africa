"""
Build the cultural transformation plan.

Internal: it names which of our own design decisions were wrong and reports an
eleven per cent activation rate, neither of which belongs in front of the
client. Reads continuously.

    python3 scripts/build-haven-culture-plan.py
"""
from __future__ import annotations
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from haven_doc import build_doc  # noqa: E402

DOCS = Path(__file__).resolve().parents[1] / "docs"

if __name__ == "__main__":
    build_doc(
        DOCS / "haven-culture-plan-cfa.md",
        DOCS / "haven-culture-plan-cfa.pdf",
        "Haven Paediatric Centre",
        "Haven Paediatric Centre  /  Cultural transformation plan",
        "Internal to Consult for Africa  /  Not for the client",
        cover_list=[
            ("01", "Where we actually are"),
            ("02", "Why the other seventeen did not come back"),
            ("03", "What we change"),
            ("04", "The sprints"),
            ("05", "The daily drip"),
            ("06", "Buddy pairs"),
            ("07", "Who does what"),
            ("09", "What would make this fail"),
        ],
        section_breaks=False,
    )
