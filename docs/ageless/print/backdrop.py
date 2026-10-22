#!/usr/bin/env python3
"""AGELESS step-and-repeat backdrop: every Medbury company mark, vector.

    python3 docs/ageless/print/backdrop.py

medLYFE and The Lyfe Place host the evening, so they run larger and on
every other row; Medbury Healthcare Group and Medbury Medical Services sit
on the rows between. No clean logo files exist for medLYFE or The Lyfe
Place, so the marks are traced with potrace: medLYFE from the high
resolution mask in "the Medlyfe About Us.pdf", The Lyfe Place from the
invitation artwork. The traced SVGs land in print/logos/ for reuse.

Needs potrace (brew install potrace), numpy, Pillow, reportlab, svglib.
Writes ageless-backdrop.pdf at full size plus a preview PNG.
"""

import os
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageFilter
from reportlab.graphics import renderPDF
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from svglib.svglib import svg2rlg

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
LOGOS = os.path.join(HERE, "logos")
INVITE = os.path.join(ROOT, "docs/ageless/speakers/invitation-source.jpg")
MEDBURY_GROUP = os.path.join(ROOT, "docs/medbury-logo.png")
MEDBURY_MEDICAL = os.path.expanduser("~/Downloads/medbury_medical_service_log 2.png")
MEDBURY_PHARMA = os.path.join(ROOT, "docs/medbury-pharmaceuticals-logo.png")  # medburypharma.com
MEDLYFE_PDF = os.path.expanduser("~/Downloads/the Medlyfe About Us.pdf")

# Brand colours sampled from the source artwork.
OLIVE = "#5F7046"        # The Lyfe Place
MED_DARK = "#4A6131"     # medLYFE pills and "med"
MED_LIGHT = "#94B064"    # medLYFE dot, "LYFE", strapline
RED = "#EC1C24"
BLACK = "#111111"
GREY = "#58595B"

# 10 x 8 ft, the standard Lagos press wall. Add bleed in the print shop spec.
WIDTH_MM, HEIGHT_MM = 3048, 2438


# ── tracing ──────────────────────────────────────────────────────────────

def _potrace(mask):
    """Bool mask -> list of SVG path 'd' strings plus the group transform."""
    with tempfile.TemporaryDirectory() as t:
        pbm, svg = os.path.join(t, "m.pbm"), os.path.join(t, "m.svg")
        Image.fromarray((~mask).astype(np.uint8) * 255).convert("1").save(pbm)
        subprocess.run(["potrace", "-s", "-a", "1.1", "-O", "0.4", "-t", "6", pbm, "-o", svg], check=True)
        text = open(svg).read()
    g = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', text, re.S)
    return g.group(1), re.findall(r'd="([^"]+)"', g.group(2))


def trace(name, layers, size):
    """layers: [(bool mask, fill)], all the same shape. Writes logos/<name>.svg."""
    h, w = size
    union = np.zeros(size, bool)
    for m, _ in layers:
        union |= m
    ys, xs = np.where(union)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    groups = []
    for m, fill in layers:
        if not m.any():
            continue
        transform, paths = _potrace(m[y0:y1, x0:x1])
        body = "".join(f'<path d="{d}"/>' for d in paths)
        groups.append(f'<g transform="{transform}" fill="{fill}" stroke="none">{body}</g>')
    vw, vh = x1 - x0, y1 - y0
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{vw}" height="{vh}" '
           f'viewBox="0 0 {vw} {vh}">{"".join(groups)}</svg>')
    os.makedirs(LOGOS, exist_ok=True)
    path = os.path.join(LOGOS, f"{name}.svg")
    open(path, "w").write(svg)
    return path


def up(img, k):
    return img.resize((img.width * k, img.height * k), Image.LANCZOS)


def trace_medlyfe():
    with tempfile.TemporaryDirectory() as t:
        # The mark's alpha mask is image 7 on page 1 (1515 x 362).
        subprocess.run(["pdfimages", "-f", "1", "-l", "1", "-png", MEDLYFE_PDF, os.path.join(t, "i")], check=True)
        src = Image.open(os.path.join(t, "i-007.png")).convert("L")
    k = 3
    m = np.array(up(src, k)) > 128
    light = np.zeros_like(m)
    light[0:100 * k, 96 * k:193 * k] = True           # the dot over the middle pill
    light[:, 928 * k:] = True                         # "LYFE"
    light[285 * k:, 400 * k:] = True                  # the strapline
    return trace("medlyfe", [(m & ~light, MED_DARK), (m & light, MED_LIGHT)], m.shape)


def trace_lyfe_place():
    crop = Image.open(INVITE).convert("L").crop((650, 85, 810, 200))
    # The source is ~115px tall: blur after enlarging so the trace follows
    # the letterforms, not the JPEG pixel steps.
    m = np.array(up(crop, 8).filter(ImageFilter.GaussianBlur(3))) < 190
    return trace("lyfe-place", [(m, OLIVE)], m.shape)


def trace_medbury(path, name, dark_fill):
    im = up(Image.open(path).convert("RGBA"), 2)
    a = np.array(im).astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    ink = al > 128
    red = ink & (r > 150) & (g < 110) & (b < 110)
    dark = ink & ~red & ((r + g + b) < 450)
    return trace(name, [(red, RED), (dark, dark_fill)], red.shape)


# ── layout ───────────────────────────────────────────────────────────────

def place(c, drawing, cx, cy, width=None, height=None):
    s = (width / drawing.width) if width else (height / drawing.height)
    w, h = drawing.width * s, drawing.height * s
    c.saveState()
    c.translate(cx - w / 2, cy - h / 2)
    c.scale(s, s)
    renderPDF.draw(drawing, c, 0, 0)
    c.restoreState()


def build():
    marks = {
        "medlyfe": svg2rlg(trace_medlyfe()),
        "lyfe": svg2rlg(trace_lyfe_place()),
        "group": svg2rlg(trace_medbury(MEDBURY_GROUP, "medbury-healthcare-group", BLACK)),
        "medical": svg2rlg(trace_medbury(MEDBURY_MEDICAL, "medbury-medical-services", GREY)),
        "pharma": svg2rlg(trace_medbury(MEDBURY_PHARMA, "medbury-pharmaceuticals", BLACK)),
    }
    # Printed height of each mark. The hosts are about three times the
    # height of the Medbury marks and take four rows of seven.
    height = {
        "medlyfe": 235 * mm, "lyfe": 330 * mm,
        "group": 105 * mm, "medical": 100 * mm, "pharma": 85 * mm,
    }
    hosts, companies = ["medlyfe", "lyfe"], ["group", "pharma", "medical"]
    W, H = WIDTH_MM * mm, HEIGHT_MM * mm
    out = os.path.join(HERE, "ageless-backdrop.pdf")
    c = canvas.Canvas(out, pagesize=(W, H))
    c.setTitle("AGELESS backdrop, Medbury companies")
    c.setFillColorRGB(1, 1, 1)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    for i in range(7):
        y = H - (200 + i * 340) * mm
        host = i % 2 == 0
        seq = hosts if host else companies
        gap = (300 if host else 330) * mm
        j = i // 2                      # rotate the order row to row
        x = -(380 if (i // 2) % 2 else 80) * mm if host else -200 * mm * (i // 2 + 1)
        while x < W:
            key = seq[j % len(seq)]
            d = marks[key]
            w = d.width * height[key] / d.height
            place(c, d, x + w / 2, y, height=height[key])
            x += w + gap
            j += 1
    c.showPage()
    c.save()
    preview = os.path.join(HERE, "ageless-backdrop-preview.png")
    subprocess.run(["pdftoppm", "-r", "12", "-png", "-singlefile", out, preview[:-4]], check=True)
    print(out)
    print(preview)


if __name__ == "__main__":
    build()
