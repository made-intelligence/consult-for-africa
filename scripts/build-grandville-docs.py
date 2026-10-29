"""
Render the Grandville Medical Group markdown deliverables to branded PDFs,
using the shared house renderer in scripts/osteon_doc.py.

The call prep note is deliberately not in this list. It is internal and is not
rendered to a PDF that could be sent by accident.

    python3 scripts/build-grandville-docs.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from osteon_doc import build_doc  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "docs" / "grandville"
FOOTER = "Confidential  /  Prepared for Grandville Medical Group"

DOCS_TO_BUILD = [
    ("grandville-marketing-discovery-cfa.md", "Grandville  /  Discovery"),
]

if __name__ == "__main__":
    for name, header in DOCS_TO_BUILD:
        src = DIR / name
        build_doc(src, src.with_suffix(".pdf"), header, FOOTER)
        print("wrote", src.with_suffix(".pdf"))
