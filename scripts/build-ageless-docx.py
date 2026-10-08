"""
The AGELESS speaker content as an editable Word document.

The chair asked for Word rather than PDF because she wants to mark it up and
send it back, so this is built to be edited: real Word headings so her
navigation pane works, each bio and each question in its own paragraph so a
tracked change lands on one line, and nothing in a text box or a table cell
that fights the editor.

Addresses are not in here. The file leaves our hands and comes back by
forward, and speakers' personal addresses were given to us for writing to
them, not for circulating.

  npx tsx scripts/dump-ageless-content.ts > /tmp/ageless.json
  python3 scripts/build-ageless-docx.py /tmp/ageless.json docs/ageless/x.docx
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor, Inches

GREEN = RGBColor(0x1F, 0x3A, 0x2E)
MUTED = RGBColor(0x5F, 0x6B, 0x64)


def _styles(doc: Document) -> None:
    base = doc.styles["Normal"]
    base.font.name = "Calibri"
    base.font.size = Pt(11)
    base.paragraph_format.space_after = Pt(8)
    base.paragraph_format.line_spacing = 1.15

    for name, size, colour, before in (
        ("Heading 1", 18, GREEN, 20),
        ("Heading 2", 14, GREEN, 16),
        ("Heading 3", 12, GREEN, 12),
    ):
        st = doc.styles[name]
        st.font.name = "Calibri"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = colour
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(6)
        st.paragraph_format.keep_with_next = True


def _note(doc: Document, text: str) -> None:
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.italic = True
    r.font.size = Pt(9.5)
    r.font.color.rgb = MUTED


def _kv(doc: Document, pairs: list[tuple[str, str]]) -> None:
    t = doc.add_table(rows=0, cols=2)
    t.style = "Table Grid"
    for k, v in pairs:
        row = t.add_row().cells
        row[0].width = Inches(1.7)
        kr = row[0].paragraphs[0].add_run(k)
        kr.bold = True
        kr.font.size = Pt(10)
        vr = row[1].paragraphs[0].add_run(v)
        vr.font.size = Pt(10)
    doc.add_paragraph()


def build(data: dict, out: Path) -> None:
    ev = data["event"]
    doc = Document()
    _styles(doc)

    sec = doc.sections[0]
    sec.left_margin = sec.right_margin = Inches(1.0)
    sec.top_margin = sec.bottom_margin = Inches(0.9)

    foot = sec.footer.paragraphs[0]
    foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = foot.add_run(f"{ev['theme'].upper()}  ·  {ev['host']}  ·  for review")
    fr.font.size = Pt(8)
    fr.font.color.rgb = MUTED

    # ── cover line ───────────────────────────────────────────────────────────
    h = doc.add_paragraph(style="Heading 1")
    h.add_run(f"{ev['theme'].upper()}: {ev['proposition']}")
    _note(doc, f"{ev['date']}  ·  {ev['venueName']}  ·  {ev['places']} places")
    doc.add_paragraph(f"{ev['proposition']}. {ev['standfirst']}")
    if data.get("tone"):
        doc.add_paragraph(data["tone"])

    doc.add_paragraph(style="Heading 2").add_run("How to use this")
    for line in [
        "Everything below is what each speaker has been sent and what will be printed.",
        "Edit it directly. Track changes if you prefer, or just type over it.",
        "Send it back and the site, the printed programme and the press pack all follow it.",
        "Anything you delete comes out. Anything you add goes in.",
    ]:
        doc.add_paragraph(line, style="List Bullet")

    # ── the facts ────────────────────────────────────────────────────────────
    doc.add_paragraph(style="Heading 2").add_run("The evening")
    _kv(doc, [
        ("Host", ev["host"]),
        ("Date", ev["date"]),
        ("Venue", ev["venueName"]),
        ("Arrival", ev["arrival"]),
        ("Programme", f"{ev['programme']} to 8:15 PM"),
        ("Close", ev["close"]),
        ("Places", str(ev["places"])),
        ("RSVP by", ev["rsvpBy"]),
        ("Panel", f"{ev['panelTitle']}. {ev['panelStandfirst']}"),
    ])

    doc.add_paragraph(style="Heading 2").add_run("Who the room is")
    if data.get("room"):
        doc.add_paragraph(data["room"])
    t = doc.add_table(rows=1, cols=2)
    t.style = "Table Grid"
    for i, label in enumerate(("Group", "Places")):
        r = t.rows[0].cells[i].paragraphs[0].add_run(label)
        r.bold = True
        r.font.size = Pt(10)
    for a in data["allocation"]:
        cells = t.add_row().cells
        cells[0].paragraphs[0].add_run(a["bucket"]).font.size = Pt(10)
        cells[1].paragraphs[0].add_run(str(a["places"])).font.size = Pt(10)
    doc.add_paragraph()

    # ── run of show ──────────────────────────────────────────────────────────
    doc.add_paragraph(style="Heading 2").add_run("Running order")
    for item in data["programme"]:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        tr = p.add_run(f"{item['time']}  {item['title']}")
        tr.bold = True
        b = doc.add_paragraph(item["body"])
        b.paragraph_format.left_indent = Inches(0.3)
        b.paragraph_format.space_after = Pt(10)

    # ── the speakers ─────────────────────────────────────────────────────────
    doc.add_page_break()
    doc.add_paragraph(style="Heading 1").add_run("The speakers")
    _note(
        doc,
        "Each person has been sent their own section only. The bio is printed "
        "as it reads here. The speaker focus explains what they should prepare "
        "to open with in two to three minutes. The questions are a brief for "
        "the chair, not a script, and each speaker has been told they can ask "
        "to be asked something else.",
    )

    for s in data["speakers"]:
        doc.add_paragraph(style="Heading 2").add_run(s["name"])
        _note(doc, f"{s['org']}  ·  {s['slot']}")

        doc.add_paragraph(style="Heading 3").add_run("Subject, as printed")
        doc.add_paragraph(s["subject"] or "[not set]")

        if s.get("focus") and "chair" not in s["slot"]:
            doc.add_paragraph(style="Heading 3").add_run("Speaker focus")
            doc.add_paragraph(s["focus"])

        doc.add_paragraph(style="Heading 3").add_run("Bio, as printed")
        doc.add_paragraph(s["bio"] or "[no bio on file]")

        if "chair" in s["slot"]:
            doc.add_paragraph(style="Heading 3").add_run("Chairing direction")
            doc.add_paragraph(
                s.get("focus")
                or "Each panellist's set is in their own section below."
            )
        elif s["questions"]:
            doc.add_paragraph(style="Heading 3").add_run("Questions they will be asked")
            for q in s["questions"]:
                doc.add_paragraph(q, style="List Bullet")

        if s["outstanding"]:
            _note(doc, "Still outstanding: " + ", ".join(s["outstanding"]))

    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(out)
    print("wrote", out)


if __name__ == "__main__":
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    build(json.loads(src.read_text()), dst)
