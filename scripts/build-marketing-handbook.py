"""
Build the two marketing documents as branded PDFs.

    python3 scripts/build-marketing-handbook.py            # both
    python3 scripts/build-marketing-handbook.py handbook   # just one

The handbook is the reference layer for the team: the firm, the four brands,
positioning and targeting, and the anonymised case study library. The operating
brief is the lead's document: the agency's responsibilities and KPIs, and the
standing ask to plan for scale and execution efficiency.

Both share the house renderer in scripts/osteon_doc.py rather than carrying
their own styles. Facts common to both (brand positioning, the rules, the case
study index) live in both files, so a change to one needs checking against the
other.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from osteon_doc import build_doc  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "docs" / "marketing"

FOOTER = "Consult for Africa internal  /  Not for circulation outside the firm"

DOCS_TO_BUILD = [
    ("handbook", "cfa-marketing-handbook", "Marketing Handbook"),
    ("brief", "cfa-marketing-operating-brief", "Marketing Operating Brief"),
]


if __name__ == "__main__":
    wanted = set(sys.argv[1:])
    for key, stem, header in DOCS_TO_BUILD:
        if wanted and key not in wanted:
            continue
        build_doc(OUT / f"{stem}.md", OUT / f"{stem}.pdf", header, FOOTER)
