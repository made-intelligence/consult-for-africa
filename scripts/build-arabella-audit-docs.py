"""
Build the Arabella Women's Health diagnostic audit documents as branded PDFs.

    python3 scripts/build-arabella-audit-docs.py

osteon_doc is the shared CFA renderer despite its name. Import it rather than
copying it, per its own docstring.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from osteon_doc import build_doc  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "docs" / "arabella"

CLIENT_FOOTER = "Confidential  /  Prepared for Dr Chito Nwana and Arabella Women's Health"

DOCS_TO_BUILD = [
    (
        "arabella-audit-information-request-cfa",
        "Arabella Women's Health  /  Information Request",
        CLIENT_FOOTER,
    ),
]


if __name__ == "__main__":
    for stem, header, footer in DOCS_TO_BUILD:
        build_doc(OUT / f"{stem}.md", OUT / f"{stem}.pdf", header, footer)
