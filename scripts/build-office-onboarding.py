"""
Build the Office of the Founding Partner onboarding pack as a branded PDF.

    python3 scripts/build-office-onboarding.py

One document per joiner, because the pack names the person, carries the live
state of the book of work on the day it was written, and goes stale. Add an
entry to DOCS_TO_BUILD rather than editing an existing pack in place, so the
version a joiner was actually given stays recoverable.

Uses the house renderer in scripts/osteon_doc.py rather than carrying its own
styles. Facts in here overlap docs/marketing/cfa-marketing-handbook.md, so a
change to the firm, the brands or the rules needs checking against both.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from osteon_doc import build_doc  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "docs" / "office"

def footer(function: str) -> str:
    """The footer names the function the pack belongs to, not the office that
    happens to build it, because a page torn out of a growth pack should not
    read as though it came from the Founding Partner's own file."""
    return f"Consult for Africa internal  /  {function}  /  Not for circulation outside the firm"


DOCS_TO_BUILD = [
    (
        "ezinne",
        "ezinne-onboarding-pack-cfa",
        "Onboarding Pack  /  Executive Assistant to the Founding Partner",
        footer("Office of the Founding Partner"),
    ),
    (
        "dorathy",
        "dorathy-growth-pack-cfa",
        "Growth Pack  /  Director of Business Development and Growth",
        footer("Business Development and Growth"),
    ),
]


if __name__ == "__main__":
    wanted = set(sys.argv[1:])
    for key, stem, header, foot in DOCS_TO_BUILD:
        if wanted and key not in wanted:
            continue
        build_doc(OUT / f"{stem}.md", OUT / f"{stem}.pdf", header, foot)
