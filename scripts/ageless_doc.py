"""
A4 document renderer in the AGELESS livery.

The CFA house renderer puts navy and gold on everything, which is right for a
Consult for Africa deliverable and wrong for a document about MedLYFE's own
evening. Anything a principal reads about AGELESS should look like AGELESS.

Deep forest ground with the chartreuse accent, the MedLYFE mark drawn from
measured geometry, Didot for display against a plain sans for anything that
has to be read quickly, and the monogram field at a whisper. Dark header
band, light body, because a full bleed dark page is heavy to print and tiring
to read.

Markdown in, PDF out. Supports headings, paragraphs, two and three column
tables, and a bold lead-in on a list item. Deliberately small: it exists to
make two page documents, not reports.

  from ageless_doc import build
  build(Path("x.md"), Path("x.pdf"), "Header label")
"""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageDraw
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as canvaslib

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "docs" / "ageless" / ".render"

# Sampled from MedLYFE's own poster. The blue that used to be here came off a
# photograph inside it, which is the hazard of sampling a flattened composite.
GREEN = "#1F3A2E"
GREEN_DEEP = "#15291F"
GREEN_DARK = "#0F1E17"
LIME = "#C4D7A6"
LIME_DEEP = "#7E9A6B"
PAPER = "#FBFAF6"
INK = "#1A211C"
BODY = "#44504A"
MUTED = "#7C877F"
RULE = "#DDE3D8"

try:
    pdfmetrics.registerFont(TTFont("Didot", "/System/Library/Fonts/Supplemental/Didot.ttc"))
    DISPLAY = "Didot"
except Exception:
    DISPLAY = "Times-Roman"

SANS, SANS_B = "Helvetica", "Helvetica-Bold"
PW, PH = A4
M = 52


def _monogram(w: int, h: int, alpha: int = 5) -> ImageReader:
    """The MedLYFE mark tiled on a half drop, at a whisper, over paper."""
    TMP.mkdir(parents=True, exist_ok=True)
    out = TMP / f"mono-{w}x{h}-{alpha}.png"
    if not out.exists():
        tile = 150
        t = Image.new("RGBA", (tile, tile), (0, 0, 0, 0))
        d = ImageDraw.Draw(t)
        s = (tile * 0.42) / 73.0
        ox, oy = (tile - 59 * s) / 2, (tile - 73 * s) / 2
        col = tuple(int(GREEN[i:i + 2], 16) for i in (1, 3, 5)) + (alpha,)
        for px, py, pw, ph in [(0, 12, 15, 48), (22, 27, 15, 46), (44, 12, 15, 47)]:
            d.rounded_rectangle([ox + px * s, oy + py * s, ox + (px + pw) * s, oy + (py + ph) * s],
                                radius=(pw * s) / 2, fill=col)
        r = 10.5 * s
        d.ellipse([ox + 29.5 * s - r, oy + 10 * s - r, ox + 29.5 * s + r, oy + 10 * s + r], fill=col)
        field = Image.new("RGB", (w, h), tuple(int(PAPER[i:i + 2], 16) for i in (1, 3, 5)))
        for row in range(h // tile + 2):
            off = (tile // 2) if row % 2 else 0
            for cjj in range(w // tile + 2):
                field.paste(t, (cjj * tile - off, row * tile), t)
        field.save(out)
    return ImageReader(str(out))


def _mark(c, x, y, h, colour=white):
    """Three pill bars with a dot over the middle one, in reportlab's y-up space."""
    s = h / 73.0
    c.setFillColor(colour)
    for px, py, pw, ph in [(0, 12, 15, 48), (22, 27, 15, 46), (44, 12, 15, 47)]:
        c.roundRect(x + px * s, y + (73 - py - ph) * s, pw * s, ph * s, (pw * s) / 2, fill=1, stroke=0)
    c.circle(x + 29.5 * s, y + (73 - 10) * s, 10.5 * s, fill=1, stroke=0)
    return 59 * s


def _tracked(c, text, x, y, font, size, colour, track=1.2):
    c.setFillColor(colour)
    c.setFont(font, size)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + track
    return x


def _wrap(c, text, font, size, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if c.stringWidth(t, font, size) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def _clean(s: str) -> str:
    """Markdown emphasis out, entities in. Bold is handled by the caller."""
    s = s.replace("**", "").replace("&", "&amp;")
    return s.strip()


def _page_furniture(c, header, footer, page):
    c.drawImage(_monogram(int(PW), int(PH)), 0, 0, width=PW, height=PH)
    c.setFillColor(HexColor(GREEN_DEEP))
    c.rect(0, PH - 58, PW, 58, fill=1, stroke=0)
    c.setFillColor(HexColor(LIME))
    c.rect(0, PH - 61, PW, 3, fill=1, stroke=0)
    _mark(c, M, PH - 46, 26)
    c.setFillColor(white)
    c.setFont(DISPLAY, 15)
    c.drawString(M + 28, PH - 38, "med")
    c.setFont(SANS_B, 15)
    c.drawString(M + 28 + c.stringWidth("med", DISPLAY, 15) + 1, PH - 38, "LYFE")
    c.setFillColor(HexColor(LIME))
    c.setFont(SANS, 8)
    c.drawRightString(PW - M, PH - 36, header)
    c.setFillColor(HexColor(LIME_DEEP))
    c.rect(M, 34, 18, 2, fill=1, stroke=0)
    c.setFillColor(HexColor(MUTED))
    c.setFont(SANS, 7.4)
    c.drawString(M, 22, footer)
    c.drawRightString(PW - M, 22, str(page))


def _table(c, rows, x, y, widths, size=9.2, lead=12, pad=7, headed=True):
    """Header row in forest, body banded on paper, chartreuse keyline under the head."""
    n = len(widths)
    cy = y
    for i, row in enumerate(rows):
        cells, head = [], (i == 0 and headed)
        for j in range(n):
            f = SANS_B if (head or j == 0) else SANS
            cells.append(_wrap(c, _clean(str(row[j])), f, size, widths[j] - 2 * pad))
        h = max(len(cl) for cl in cells) * lead + pad * 1.7
        if head:
            c.setFillColor(HexColor(GREEN))
            c.rect(x, cy - h, sum(widths), h, fill=1, stroke=0)
            c.setFillColor(HexColor(LIME))
            c.rect(x, cy - h - 2, sum(widths), 2, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(HexColor("#F2F4EE"))
            c.rect(x, cy - h, sum(widths), h, fill=1, stroke=0)
        cx = x
        for j in range(n):
            ty = cy - pad - size + 2
            for ln in cells[j]:
                if head:
                    c.setFont(SANS_B, size); c.setFillColor(white)
                else:
                    c.setFont(SANS_B if j == 0 else SANS, size)
                    c.setFillColor(HexColor(INK if j == 0 else BODY))
                c.drawString(cx + pad, ty, ln)
                ty -= lead
            cx += widths[j]
        cy -= h
    return cy


def build(src: Path, out: Path, header: str, footer: str = "Confidential"):
    md = src.read_text().split("\n")
    c = canvaslib.Canvas(str(out), pagesize=A4)
    c.setTitle(src.stem)
    page = [1]
    W = PW - 2 * M

    def new_page():
        c.showPage()
        page[0] += 1
        _page_furniture(c, header, footer, page[0])
        return PH - 92

    _page_furniture(c, header, footer, 1)
    y = PH - 92
    i = 0

    # Cover block: title, subtitle, then the meta pairs up to the first rule.
    while i < len(md) and not md[i].startswith("# "):
        i += 1
    if i < len(md):
        c.setFillColor(HexColor(INK))
        c.setFont(DISPLAY, 34)
        for ln in _wrap(c, _clean(md[i][2:]), DISPLAY, 34, W):
            c.drawString(M, y, ln); y -= 38
        i += 1
    while i < len(md) and not md[i].startswith("## "):
        i += 1
    if i < len(md):
        c.setFillColor(HexColor(LIME_DEEP))
        c.setFont(SANS, 12.5)
        for ln in _wrap(c, _clean(md[i][3:]), SANS, 12.5, W):
            c.drawString(M, y, ln); y -= 16
        i += 1
    y -= 6
    c.setFillColor(HexColor(LIME_DEEP)); c.rect(M, y, 38, 2, fill=1, stroke=0); y -= 20

    meta = []
    while i < len(md) and not md[i].startswith("---"):
        if md[i].strip():
            meta.append(md[i].strip())
        i += 1
    for k in range(0, len(meta) - 1, 2):
        _tracked(c, meta[k].upper(), M, y, SANS_B, 6.8, HexColor(LIME_DEEP), 1.1)
        c.setFillColor(HexColor(BODY)); c.setFont(SANS, 9)
        c.drawString(M + 108, y, _clean(meta[k + 1])); y -= 13
    y -= 14

    while i < len(md):
        line = md[i]
        if y < 110:
            y = new_page()

        if line.startswith("## "):
            # A heading stranded at the foot of a page with its section on the
            # next one is the commonest way a short document looks careless.
            if y < 165:
                y = new_page()
            y -= 10
            c.setFillColor(HexColor(GREEN)); c.setFont(DISPLAY, 17)
            for ln in _wrap(c, _clean(line[3:]), DISPLAY, 17, W):
                c.drawString(M, y, ln); y -= 20
            c.setFillColor(HexColor(LIME)); c.rect(M, y + 6, 26, 1.6, fill=1, stroke=0)
            y -= 10
        elif line.startswith("|"):
            tbl = []
            while i < len(md) and md[i].startswith("|"):
                cells = [x.strip() for x in md[i].strip().strip("|").split("|")]
                # A separator row must actually contain dashes. Testing only
                # for a subset of "-: " swallowed an all-empty header row,
                # which then promoted the first real row into the header band.
                sep = all(set(x) <= set("-: ") for x in cells) and any("-" in x for x in cells)
                if not sep:
                    tbl.append(cells)
                i += 1
            # An all-empty first row means the author wanted no header.
            headed = True
            if tbl and not any(str(v).strip() for v in tbl[0]):
                tbl, headed = tbl[1:], False
            if not tbl:
                continue
            n = len(tbl[0])
            widths = [W * 0.30] + [(W * 0.70) / (n - 1)] * (n - 1) if n > 1 else [W]
            need = sum(max(len(_wrap(c, _clean(str(r[j])), SANS, 9.2, widths[j] - 14))
                           for j in range(n)) * 12 + 12 for r in tbl)
            if y - need < 90 and need < PH - 200:
                y = new_page()
            y = _table(c, tbl, M, y, widths, headed=headed) - 14
            continue
        elif line.startswith("- "):
            txt = _clean(line[2:])
            c.setFillColor(HexColor(LIME_DEEP)); c.circle(M + 3, y + 3, 1.9, fill=1, stroke=0)
            c.setFillColor(HexColor(BODY)); c.setFont(SANS, 9.6)
            for ln in _wrap(c, txt, SANS, 9.6, W - 14):
                c.drawString(M + 14, y, ln); y -= 12.4
            y -= 3
        elif line.strip() == "---":
            pass
        elif line.strip():
            bold = line.strip().startswith("**")
            c.setFillColor(HexColor(INK if bold else BODY))
            f = SANS_B if bold else SANS
            for ln in _wrap(c, _clean(line), f, 9.8, W):
                c.setFont(f, 9.8); c.drawString(M, y, ln); y -= 13
            y -= 6
        i += 1

    c.save()
    print("wrote", out)
