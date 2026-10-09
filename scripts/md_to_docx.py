"""
Markdown in, an editable Word document out, in the MedLYFE livery.

For anything a client is meant to mark up and send back rather than read.
Dr Akinware asked for Word because she wants to type over it, so this is
built for editing, not for looking at: real Word headings so her navigation
pane works, one idea per paragraph so a tracked change lands on one line,
and nothing in a text box that fights the editor.

Handles the subset the briefs actually use: headings, paragraphs, bullets,
numbered lists, tables, block quotes, horizontal rules and inline bold.

  python3 scripts/md_to_docx.py in.md "out.docx" "Footer line"
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor

GREEN = RGBColor(0x1F, 0x3A, 0x2E)
MUTED = RGBColor(0x5F, 0x6B, 0x64)


def _styles(doc: Document) -> None:
    base = doc.styles["Normal"]
    base.font.name = "Calibri"
    base.font.size = Pt(11)
    base.paragraph_format.space_after = Pt(8)
    base.paragraph_format.line_spacing = 1.15

    for name, size, before in (("Heading 1", 18, 20), ("Heading 2", 14, 16), ("Heading 3", 12, 12)):
        st = doc.styles[name]
        st.font.name = "Calibri"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = GREEN
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(6)
        st.paragraph_format.keep_with_next = True


def _runs(p, text: str) -> None:
    """Inline bold only. Everything else is left as written."""
    for i, part in enumerate(re.split(r"\*\*(.+?)\*\*", text)):
        if not part:
            continue
        r = p.add_run(part)
        r.bold = i % 2 == 1


def _table(doc: Document, rows: list[list[str]]) -> None:
    head = rows[0]
    body = rows[1:]
    headed = any(c.strip() for c in head)

    t = doc.add_table(rows=0, cols=len(head))
    t.style = "Table Grid"
    if headed:
        cells = t.add_row().cells
        for c, txt in zip(cells, head):
            r = c.paragraphs[0].add_run(txt)
            r.bold = True
            r.font.size = Pt(10)
    for row in body:
        cells = t.add_row().cells
        for c, txt in zip(cells, row):
            _runs(c.paragraphs[0], txt)
            for run in c.paragraphs[0].runs:
                run.font.size = Pt(10)
    doc.add_paragraph()


def build(md: str, out: Path, footer: str) -> None:
    doc = Document()
    _styles(doc)

    sec = doc.sections[0]
    sec.left_margin = sec.right_margin = Inches(1.0)
    sec.top_margin = sec.bottom_margin = Inches(0.9)
    f = sec.footer.paragraphs[0]
    f.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = f.add_run(footer)
    fr.font.size = Pt(8)
    fr.font.color.rgb = MUTED

    lines = md.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()

        if not line.strip():
            i += 1
            continue

        if line.startswith("### "):
            doc.add_paragraph(style="Heading 3").add_run(line[4:].strip())
        elif line.startswith("## "):
            doc.add_paragraph(style="Heading 2").add_run(line[3:].strip())
        elif line.startswith("# "):
            doc.add_paragraph(style="Heading 1").add_run(line[2:].strip())
        elif line.strip() in ("---", "***", "___"):
            pass
        elif line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            if rows:
                _table(doc, rows)
            continue
        elif line.startswith("> "):
            # The lines to camera. Indented and italic so they read as speech.
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.35)
            p.paragraph_format.space_before = Pt(4)
            _runs(p, line[2:].strip())
            for r in p.runs:
                r.italic = True
        elif re.match(r"^\d+\.\s", line):
            p = doc.add_paragraph(style="List Number")
            _runs(p, re.sub(r"^\d+\.\s", "", line))
        elif line.startswith("- "):
            p = doc.add_paragraph(style="List Bullet")
            _runs(p, line[2:].strip())
        else:
            _runs(doc.add_paragraph(), line.strip())
        i += 1

    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(out)
    print("wrote", out)


if __name__ == "__main__":
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    foot = sys.argv[3] if len(sys.argv) > 3 else "for review"
    build(src.read_text(), dst, foot)
