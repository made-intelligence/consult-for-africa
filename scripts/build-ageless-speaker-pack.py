"""
The speaker pack, generated from the roster rather than written by hand.

It drifted three times in two days, because every change to a subject, a
question set or the chair had to be made twice. Now the roster is the only
place it is said, and this renders it.

  npx tsx scripts/dump-ageless-content.ts > /tmp/ageless.json
  python3 scripts/build-ageless-speaker-pack.py /tmp/ageless.json out.md
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

DEADLINE = "Friday 10 October"


def build(d: dict) -> str:
    ev = d["event"]
    out: list[str] = []
    w = out.append

    w("# AGELESS\n")
    w("## Speaker pack\n")
    w("FOR\nSpeakers and panellists\n")
    w(f"FROM\n{ev['host']}, with Consult for Africa\n")
    w(f"EVENING\n{ev['date']}\n")
    w("---\n")

    w("## In short\n")
    w(f"- **{ev['date']}. {ev['venueName']}. Be in the room by 6:15pm.**")
    w(f"- **Send your bio and a photograph by {DEADLINE}**, or you miss the printed programme.")
    w("- Your questions are below. They are a brief, not a script. Tell us what you would rather be asked.")
    w("- Speaker focus is what to prepare to open with, two to three minutes.")
    w(f"- {ev['places']} guests. {d['room']}")
    w("- No slides, no lectern. Cocktail dress.\n")

    w("## What we need from you\n")
    w("| What | Detail |")
    w("| --- | --- |")
    w("| Bio | 80 to 100 words, written as you want to be introduced |")
    w("| Photograph | Any good headshot, high resolution |")
    w("| Corrections | Questions you would rather not be asked, or would rather be asked |\n")
    w(f"By **{DEADLINE}**, or it misses the printed programme and the press pack.\n")

    w("## The panel\n")
    w(f"**{ev['panelTitle']}.** {ev['panelStandfirst']}\n")
    chair = next((s for s in d["speakers"] if s["slot"] == "the chair"), None)
    w(f"45 minutes. Four seats, about eleven minutes each. Chaired by {chair['name'] if chair else 'the chair'}.\n")
    w("**Rule: every answer ends in something a guest can do this week.** The chair will come back to anyone who finishes on a generality.\n")

    for s in d["speakers"]:
        if s["slot"] in ("the chair", "the host"):
            continue
        w(f"### {s['name']}\n")
        w(f"**{s['subject']}**\n")
        if s.get("focus"):
            w(f"{s['focus']}\n")
        for q in s["questions"]:
            w(f"- {q}")
        w("")

    if chair:
        w("## The chair\n")
        w(f"{chair['name']}, {chair['org']}.\n")
        if chair.get("focus"):
            w(f"{chair['focus']}\n")
        w("The conversation moves on if it reaches who may perform what. That is a live regulatory question, not entertainment.\n")

    w("## Running order\n")
    w("| Time | What |")
    w("| --- | --- |")
    for item in d["programme"]:
        w(f"| {item['time']} | {item['title']} |")
    w("")

    return "\n".join(out)


if __name__ == "__main__":
    data = json.loads(Path(sys.argv[1]).read_text())
    Path(sys.argv[2]).write_text(build(data))
    print("wrote", sys.argv[2])
