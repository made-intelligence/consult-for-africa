"""
Build the CFA Growth Book as an A4 PDF.

    python3 scripts/build-cfa-growth-book.py

The source is docs/growth/cfa-growth-book.html, written in the same course
format as the Mezo Growth Book (parts, modules, done and pending, check
yourself). Chrome renders it headless so the @page footers come through.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "growth" / "cfa-growth-book.html"
OUT = ROOT / "docs" / "growth" / "CFA Growth Book (Internal).pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


if __name__ == "__main__":
    subprocess.run(
        [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            "--virtual-time-budget=15000",
            f"--print-to-pdf={OUT}",
            SRC.as_uri(),
        ],
        check=True,
        capture_output=True,
    )
    print(OUT)
