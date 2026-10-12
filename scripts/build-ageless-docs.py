"""
Rebuild the AGELESS document pack from its markdown.

ageless_doc.py is a renderer with no entry point, so each of these PDFs was
built by hand and then drifted the moment a time changed. This is the caller.
Header and footer strings are the ones the existing PDFs already carried, so
a rebuild does not restyle anything; it only picks up the current markdown.

    python3 scripts/build-ageless-docs.py            everything
    python3 scripts/build-ageless-docs.py programme  one of them
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ageless_doc

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs" / "ageless"
TODAY = date.today().strftime("%-d %B %Y")
EVENING = "Wednesday 21 October 2026"

# stem: (header, footer)
PACK = {
    "ageless-programme-cfa": (
        "AGELESS  ·  The programme", f"MedLYFE with Consult for Africa  ·  {TODAY}"),
    "ageless-speaker-pack-cfa": (
        "AGELESS  ·  Speaker pack", f"MedLYFE  ·  {EVENING}"),
    "ageless-promoter-brief-cfa": (
        "AGELESS  ·  Promoter brief", f"Medlyfe  ·  {EVENING}"),
    "ageless-status-2pp-cfa": (
        "AGELESS  ·  Status", "Consult for Africa  ·  Confidential"),
    "ageless-task-plan-cfa": (
        "AGELESS  ·  Task plan", f"Medlyfe with Consult for Africa  ·  {TODAY}"),
    "ageless-invite-links-cfa": (
        "AGELESS  ·  Invitation links", f"Medlyfe with Consult for Africa  ·  {TODAY}"),
    "medlyfe-film-brief-cfa": (
        "MedLYFE  ·  The introduction film", f"Consult for Africa  ·  {TODAY}"),
    "ageless-plan-summary-cfa": (
        "AGELESS  ·  Plan summary", "Consult for Africa  ·  Confidential"),
    "ageless-note-to-chinwe-cfa": (
        "AGELESS  ·  For Dr Kpaduwa", f"Consult for Africa  ·  {EVENING}"),
    "shoot-replan-session-cfa": (
        "Medlyfe  ·  The content shoot", f"Consult for Africa  ·  {TODAY}"),
}


def main() -> None:
    only = sys.argv[1:] 
    built = 0
    for stem, (header, footer) in PACK.items():
        if only and not any(o in stem for o in only):
            continue
        src = DOCS / f"{stem}.md"
        if not src.exists():
            print(f"  skip {stem}: no markdown")
            continue
        ageless_doc.build(src, DOCS / f"{stem}.pdf", header, footer)
        built += 1
    print(f"\n{built} rebuilt")


if __name__ == "__main__":
    main()
