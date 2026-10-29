"""
Generate lib/haven-plan.ts from the client-facing milestone tracker, so the
daily push cannot drift from the plan Haven was actually sold.

The people-and-performance items are added here rather than read from the
tracker: the tracker carries JDs and KPIs as a single Month 2 line inside the
staff-app milestone, which underweights them. These are marked `addedByCfa` so
it stays obvious which items are in the client's tracker PDF and which are not.

    python3 scripts/build-haven-plan.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "scripts" / "build-haven-milestone-tracker.py"
OUT = ROOT / "lib" / "haven-plan.ts"

OWNER_TO_SEAT = {
    "Board": "board",
    "Board + C4A": "board",
    "Business dev": "bd",
    "C4A": "cfa",
    "Clinical": "clinical",
    "Clinical + C4A": "clinical",
    "Clinical lead": "clinical",
    "Culture": "culture",
    "Dr Odedina + BD": "nicu",
    "Finance": "finance",
    "Finance + BD": "finance",
    "Finance + C4A": "finance",
    "HR + C4A": "hr",
    "HR + Clinical": "hr",
    "Marketing / agency": "marketing",
    "Membership + C4A": "membership",
    "Membership lead": "membership",
    "Operations": "operations",
    "Pharmacy + C4A": "pharmacy",
}

# Month index (1-based) -> extra items. Two tracks the tracker underweights:
# the OKR/JD/KPI work, and cultural transformation. Culture in the tracker is
# three scattered lines; here it is a stream with a spine, built on the premise
# that every member of staff is being onboarded afresh, as if Haven opened on
# the 6th of October.
EXTRA = {
    1: [
        {
            "what": "A one-page job description for every named seat",
            "done": "Each seat on this plan has a written JD: what it owns, what it decides alone, what it escalates. Signed by the holder.",
            "owner": "HR + C4A",
            "lever": "Lever 8",
        },
        {
            "what": "Three to five KPIs per seat, with a baseline",
            "done": "Every JD carries its measures and today's number against each, so month 6 can be read against something.",
            "owner": "HR + C4A",
            "lever": "Lever 8",
        },
        {
            "what": "Quarter one OKRs agreed with the board",
            "done": "Three objectives for the quarter, each with measurable key results tied to the run-rate ladder, agreed not announced.",
            "owner": "Board + C4A",
            "lever": "Lever 8",
        },
    ],
    2: [
        {
            "what": "Every seat has had its JD and KPI conversation",
            "done": "Each person has sat down with their JD and measures and said yes to them. Not a circulated document.",
            "owner": "HR + C4A",
            "lever": "Lever 8",
        },
    ],
    3: [
        {
            "what": "First OKR review",
            "done": "Quarter one key results scored honestly, and quarter two set from what the scoring showed.",
            "owner": "Board + C4A",
            "lever": "Lever 8",
        },
    ],
    5: [
        {
            "what": "Quarter two OKR review and KPI recalibration",
            "done": "Measures that turned out to drive the wrong behaviour are changed rather than defended.",
            "owner": "HR + C4A",
            "lever": "Lever 8",
        },
    ],
}

# Cultural transformation. Not a line item: the premise is that everybody is
# being onboarded afresh, so the stream runs from induction through to a
# re-survey against the baseline the audit already set.
CULTURE = {
    1: [
        {
            "what": "Re-onboarding designed, and the first cohort through it",
            "done": "A real induction, not an email: who Haven is now, what it is for, what is expected and what each person can expect back. First cohort attended and signed.",
            "owner": "Culture",
            "lever": "Lever 8",
        },
        {
            "what": "The culture baseline published to staff",
            "done": "What the safety and culture survey actually said, given back to the people who answered it, including the uncomfortable parts.",
            "owner": "Culture",
            "lever": "Lever 8",
        },
    ],
    2: [
        {
            "what": "Every member of staff re-onboarded",
            "done": "Everyone has been through it, including night shifts and the longest-serving. New starters now join through the same door.",
            "owner": "Culture",
            "lever": "Lever 8",
        },
        {
            "what": "What gets recognised, named out loud",
            "done": "The behaviours Haven rewards and the ones it will not carry, written down and visible, and the first recognitions actually made.",
            "owner": "Culture",
            "lever": "Lever 8",
        },
    ],
    3: [
        {
            "what": "Just culture tested on a real incident",
            "done": "The first incident under the new standard handled visibly: what happened, what changed, and nobody punished for reporting it.",
            "owner": "Culture",
            "lever": "Lever 8",
        },
    ],
    4: [
        {
            "what": "Leaders doing it, not announcing it",
            "done": "Heads of department holding the standards in their own teams without being prompted, with examples anyone can point to.",
            "owner": "Culture",
            "lever": "Lever 8",
        },
    ],
    6: [
        {
            "what": "Re-survey against the baseline",
            "done": "The same instrument the audit used, run again, and the movement shown to staff and board side by side with month 1.",
            "owner": "Culture",
            "lever": "Lever 8",
        },
    ],
}


def extract() -> list[dict]:
    s = SRC.read_text()
    block = s[s.index("MONTHS = [") : s.index("\n]\n", s.index("MONTHS = ["))]
    chunks = re.split(r'\n    \("(Month \d+[^"]*)", "([^"]*)", "([^"]*)", \[', block)
    months = []
    for i in range(1, len(chunks), 4):
        title, theme, target, body = chunks[i], chunks[i + 1], chunks[i + 2], chunks[i + 3]
        tasks = re.findall(
            r'\("((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)", "(Lever \d+)"\)', body
        )
        months.append(
            {
                "title": title.replace("·", "-"),
                "theme": theme.replace("&", "and"),
                "target": target,
                "tasks": [
                    {"what": t[0], "done": t[1], "owner": t[2], "lever": t[3], "addedByCfa": False}
                    for t in tasks
                ],
            }
        )
    for source in (EXTRA, CULTURE):
        for idx, items in source.items():
            for it in items:
                months[idx - 1]["tasks"].append({**it, "addedByCfa": True})
    for m in months:
        for t in m["tasks"]:
            seat = OWNER_TO_SEAT.get(t["owner"])
            if not seat:
                raise SystemExit(f"unmapped owner: {t['owner']!r}")
            t["seat"] = seat
    return months


def main() -> None:
    months = extract()
    body = json.dumps(months, indent=2, ensure_ascii=False)
    OUT.write_text(
        '/**\n'
        ' * The Haven six-month plan, as data.\n'
        ' *\n'
        ' * GENERATED by scripts/build-haven-plan.py from the client-facing milestone\n'
        ' * tracker. Do not edit by hand: edit the tracker (or the EXTRA block in the\n'
        ' * generator) and re-run, so the daily push cannot drift from the plan Haven\n'
        ' * was sold.\n'
        ' *\n'
        ' * `addedByCfa` marks the OKR, JD and KPI items, which are our delivery\n'
        ' * structure rather than lines in the tracker PDF the board already has.\n'
        ' */\n\n'
        "export type PlanTask = {\n"
        "  what: string;\n"
        "  done: string;\n"
        "  owner: string;\n"
        "  lever: string;\n"
        "  addedByCfa: boolean;\n"
        "  /** Workstream key in lib/haven-delivery.ts. 'cfa' is ours, not theirs. */\n"
        "  seat: string;\n"
        "};\n\n"
        "export type PlanMonth = {\n"
        "  title: string;\n"
        "  theme: string;\n"
        "  target: string;\n"
        "  tasks: PlanTask[];\n"
        "};\n\n"
        f"export const PLAN: PlanMonth[] = {body};\n\n"
        "export const tasksForSeat = (monthIndex: number, seat: string): PlanTask[] =>\n"
        "  (PLAN[monthIndex]?.tasks ?? []).filter((t) => t.seat === seat);\n"
    )
    total = sum(len(m["tasks"]) for m in months)
    added = sum(1 for m in months for t in m["tasks"] if t["addedByCfa"])
    print(f"wrote {OUT}: {len(months)} months, {total} tasks ({added} added by CFA)")


if __name__ == "__main__":
    main()
