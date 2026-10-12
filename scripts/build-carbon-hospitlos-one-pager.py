"""
HospitlOS capture layer: one page for Carbon on how it feeds the receivables pilot.

A drawn mockup of the HMO claims screen (labels follow the real screens in
the hospitlos repo: HMO Claims, the Building / Ready / Submitted / Paid / Variation
pipeline, the claim score, the per-event trail of who recorded what and when),
beside what it changes for the pilot. The screen is marked illustrative: in the
repo, point-of-care capture and the claim pipeline are built, but captured items
are not yet rolled into claims and HMO acceptance is not yet recorded on them,
so nothing here says the link to the desk is live. Same light layout as the
pilot terms deck. No em dashes, and no "AI" in the copy.

    python3 scripts/build-carbon-hospitlos-one-pager.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_deck import PAGE_H, PAGE_W, wrap  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "scripts" / "fonts" / "ile"
OUT = ROOT / "docs" / "Carbon - HospitlOS Capture Layer (One Page).pdf"
LOGO = ROOT / "docs" / "c4a-logo.png"

for name, f in [("Serif", "Newsreader-Regular.ttf"), ("Serif-SB", "Newsreader-SemiBold.ttf"),
                ("Serif-I", "Newsreader-Italic.ttf"), ("Sans", "SourceSans3-Regular.ttf"),
                ("Sans-SB", "SourceSans3-SemiBold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / f)))

NAVY = HexColor("#0B3C5D")
GOLD = HexColor("#D4AF37")
TEAL = HexColor("#1F7A8C")
INK = HexColor("#1B2A38")
BODY = HexColor("#45505A")
MUTED = HexColor("#7B858E")
GROUND = HexColor("#FCFBF8")
GROUND2 = HexColor("#F7F3EA")
NTINT = HexColor("#E4ECF2")
GTINT = HexColor("#F6EDCF")
RULE = HexColor("#E5DFD3")
SCREEN = white
SLINE = HexColor("#E2E8F0")
SIDEBAR = HexColor("#F1F5F9")
GREEN = HexColor("#2F7D4F")
GREEN_T = HexColor("#E3F1E8")
AMBER = HexColor("#B7791F")
AMBER_T = HexColor("#FBF0DC")
BLUE_T = HexColor("#E0ECF7")

MX = 40


def para(c, text, x, y, size=11, color=BODY, max_w=300, leading=None, font="Sans"):
    leading = leading or size * 1.36
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(c, text, font, size, max_w):
        c.drawString(x, y, line)
        y -= leading
    return y


def tracked(c, text, x, y, size=8, color=TEAL, font="Sans-SB", track=1.5):
    c.setFont(font, size)
    c.setFillColor(color)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + track
    return x


def t(c, s, x, y, font="Sans", size=8, color=BODY, align="l"):
    c.setFont(font, size)
    c.setFillColor(color)
    {"l": c.drawString, "r": c.drawRightString, "c": c.drawCentredString}[align](x, y, s)


def chip(c, x, y, label, fill, fg, size=6.8, pad=5, h=11):
    w = c.stringWidth(label, "Sans-SB", size) + 2 * pad
    c.setFillColor(fill)
    c.roundRect(x, y - 2.5, w, h, h / 2, fill=1, stroke=0)
    t(c, label, x + pad, y + 0.5, "Sans-SB", size, fg)
    return w


def clear_logo():
    from PIL import Image
    im = Image.open(LOGO).convert("RGBA")
    im.putdata([(r, g, b, 0) if r > 245 and g > 245 and b > 245 else (r, g, b, a) for r, g, b, a in im.getdata()])
    return ImageReader(im)


# ---- the mockup ----------------------------------------------------------------
def mockup(c, x, y, w, h):
    """The HMO Claims screen, drawn: browser frame, sidebar, pipeline, claims, one claim's trail."""
    c.setFillColor(HexColor("#D9DEE5"))
    c.roundRect(x + 3, y - h - 3, w, h, 9, fill=1, stroke=0)
    c.setFillColor(SCREEN)
    c.setStrokeColor(SLINE)
    c.roundRect(x, y - h, w, h, 9, fill=1, stroke=1)
    # window bar
    c.setFillColor(SIDEBAR)
    c.roundRect(x, y - 20, w, 20, 9, fill=1, stroke=0)
    c.rect(x, y - 20, w, 10, fill=1, stroke=0)
    for i, col in enumerate(["#E5786D", "#E9B949", "#6DBE7B"]):
        c.setFillColor(HexColor(col))
        c.circle(x + 12 + i * 10, y - 10, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(x + 52, y - 15, 180, 10, 5, fill=1, stroke=0)
    t(c, "hospitlos  /  hmo  /  claims", x + 60, y - 12.5, "Sans", 6.5, MUTED)

    # sidebar
    sw = 92
    c.setFillColor(NAVY)
    c.rect(x, y - h + 9, sw, h - 29, fill=1, stroke=0)
    c.roundRect(x, y - h, sw, 18, 9, fill=1, stroke=0)
    t(c, "HospitlOS", x + 12, y - 40, "Serif-SB", 11, white)
    items = ["Admit Patient", "Patient Record", "Cashier", "HMO Revenue", "HMO Claims", "Variation Recovery", "Contracts"]
    for i, it in enumerate(items):
        yy = y - 66 - i * 19
        if it == "HMO Claims":
            c.setFillColor(HexColor("#16507A"))
            c.rect(x, yy - 6, sw, 17, fill=1, stroke=0)
            c.setFillColor(GOLD)
            c.rect(x, yy - 6, 3, 17, fill=1, stroke=0)
        t(c, it, x + 12, yy, "Sans-SB" if it == "HMO Claims" else "Sans", 7.4, white if it == "HMO Claims" else HexColor("#B9CBDA"))

    mx = x + sw + 14
    mw = w - sw - 28
    top = y - 40
    t(c, "HMO Claims", mx, top, "Serif-SB", 13, INK)
    t(c, "October 2026  ·  Inpatient and day case", mx + mw, top + 1, "Sans", 6.8, MUTED, "r")

    # tiles
    tiles = [("Clean claim rate", "92%", GREEN), ("Accepted, unpaid", "₦18.4m", NAVY), ("Fundable at 60%", "₦11.0m", TEAL), ("Queries open", "7", AMBER)]
    tw = (mw - 3 * 6) / 4
    for i, (lab, val, col) in enumerate(tiles):
        tx = mx + i * (tw + 6)
        c.setFillColor(HexColor("#F8FAFC"))
        c.setStrokeColor(SLINE)
        c.roundRect(tx, top - 46, tw, 34, 5, fill=1, stroke=1)
        t(c, lab, tx + 7, top - 22, "Sans", 6.4, MUTED)
        t(c, val, tx + 7, top - 39, "Serif-SB", 12, col)

    # pipeline chips
    cy = top - 62
    cx = mx
    for lab, n, on in [("All", "148", False), ("Building", "12", False), ("Ready", "9", False), ("Submitted", "31", False), ("Accepted", "64", True), ("Paid", "25", False), ("Query", "7", False)]:
        cx += chip(c, cx, cy, f"{lab}  {n}", NAVY if on else SIDEBAR, white if on else BODY, 6.6) + 4

    # table
    ty = cy - 18
    cols = [("Claim", 0), ("HMO", 52), ("Pre-auth", 118), ("Billed", 172), ("Accepted", 214), ("Check", 260), ("Status", 292)]
    scale = mw / 345
    c.setFillColor(HexColor("#F8FAFC"))
    c.rect(mx, ty - 4, mw, 13, fill=1, stroke=0)
    for lab, off in cols:
        t(c, lab.upper(), mx + 4 + off * scale, ty, "Sans-SB", 5.8, MUTED)
    rows = [
        ("CLM-20417", "Hygeia", "PA-4471", "₦450,000", "₦418,000", "96", ("Accepted", GREEN_T, GREEN), True),
        ("CLM-20409", "Reliance", "PA-4459", "₦212,500", "₦212,500", "94", ("Accepted", GREEN_T, GREEN), False),
        ("CLM-20398", "AXA Mansard", "PA-4430", "₦86,000", "-", "91", ("Submitted", BLUE_T, NAVY), False),
        ("CLM-20385", "Leadway", "missing", "₦640,000", "-", "58", ("Query", AMBER_T, AMBER), False),
    ]
    ry = ty - 15
    for ref, hmo, pa, billed, acc, score, (st, sf, sc), sel in rows:
        if sel:
            c.setFillColor(HexColor("#FBF7E8"))
            c.rect(mx, ry - 5, mw, 15, fill=1, stroke=0)
            c.setFillColor(GOLD)
            c.rect(mx, ry - 5, 2, 15, fill=1, stroke=0)
        vals = [ref, hmo, pa, billed, acc, score]
        for (lab, off), v in zip(cols, vals):
            col = AMBER if v == "missing" else INK
            t(c, v, mx + 4 + off * scale, ry, "Sans-SB" if lab == "Claim" else "Sans", 7, col)
        chip(c, mx + 4 + 292 * scale, ry, st, sf, sc, 6.2, 4, 10)
        c.setStrokeColor(SLINE)
        c.setLineWidth(0.5)
        c.line(mx, ry - 6, mx + mw, ry - 6)
        ry -= 16

    # the trail for the selected claim
    by = ry - 8
    bh = by - (y - h + 12)
    c.setFillColor(HexColor("#F8FAFC"))
    c.setStrokeColor(SLINE)
    c.roundRect(mx, by - bh, mw, bh, 5, fill=1, stroke=1)
    t(c, "CLM-20417  ·  Caesarean section, 3 nights  ·  trail", mx + 8, by - 13, "Sans-SB", 7.2, INK)
    t(c, "Ready to fund", mx + mw - 8, by - 13, "Sans-SB", 7, TEAL, "r")
    trail = [
        ("08:12", "Admitted, Hygeia policy verified", "Nurse Okafor"),
        ("08:40", "Pre-auth PA-4471 approved, ₦450,000", "Hygeia desk"),
        ("11:05", "Procedure recorded, theatre notes signed", "Dr Bello"),
        ("Day 3", "Discharge summary, drugs and labs reconciled", "Dr Bello"),
        ("16 Oct", "Submitted, check 96, no issues", "Claims officer"),
        ("2 Nov", "Accepted by Hygeia, ₦418,000", "HMO response"),
    ]
    ly = by - 28
    step = (bh - 34) / len(trail)
    for i, (when, what, who) in enumerate(trail):
        yy = ly - i * step
        last = i == len(trail) - 1
        c.setFillColor(GREEN if last else NAVY)
        c.circle(mx + 12, yy + 2.5, 2.6, fill=1, stroke=0)
        if not last:
            c.setStrokeColor(LIGHT_LINE)
            c.setLineWidth(0.8)
            c.line(mx + 12, yy - 1, mx + 12, yy - step + 5)
        t(c, when, mx + 20, yy, "Sans-SB", 6.6, MUTED)
        t(c, what, mx + 56, yy, "Sans-SB" if last else "Sans", 7, GREEN if last else INK)
        t(c, who, mx + mw - 8, yy, "Sans", 6.4, MUTED, "r")


LIGHT_LINE = HexColor("#C9D3DD")


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("HospitlOS: the capture layer, for Carbon")
    c.setAuthor("Consult for Africa")
    c.setFillColor(GROUND)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.drawImage(clear_logo(), MX, PAGE_H - 50, width=20 * 968 / 230, height=20, mask="auto")
    k = "PREPARED FOR CARBON"
    tracked(c, k, PAGE_W - MX - sum(c.stringWidth(ch, "Sans-SB", 8) + 1.5 for ch in k), PAGE_H - 40)

    c.setFont("Serif", 23)
    c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 86, "Claims captured at the bedside are the ones HMOs accept, and Carbon can fund.")
    para(c, "HospitlOS is our hospital operating system. Its capture layer records care as it happens and builds the HMO claim from it, so the claim leaves the hospital clean and carries its own evidence.",
         MX, PAGE_H - 106, 10.5, MUTED, PAGE_W - 2 * MX - 40, 14)

    mw = 470
    mockup(c, MX, PAGE_H - 138, mw, 380)
    t(c, "Illustrative screen. Claim data is invented.", MX, PAGE_H - 138 - 380 - 14, "Serif-I", 8.5, MUTED)

    rx = MX + mw + 26
    rw = PAGE_W - MX - rx
    y = PAGE_H - 138
    blocks = [
        ("At the bedside", "Every service, drug and test is recorded as it is given, with who did it and when. The claim is built from that record, not typed up weeks later from a folder."),
        ("Before it leaves", "Each claim is checked against the HMO's contract: pre-authorisation code, tariff, documents. A missing code shows as a query here, not as a rejection two months later."),
        ("For Carbon", "A funded claim carries its trail from admission to the HMO's acceptance, so Carbon can see what it is lending against and why the HMO will pay."),
    ]
    for lab, body in blocks:
        tracked(c, lab.upper(), rx, y - 4, 8, NAVY)
        y = para(c, body, rx, y - 22, 10.6, INK, rw, 14.4) - 14

    tracked(c, "WHAT IT CHANGES IN THE PILOT", rx, y - 4, 8, TEAL)
    y -= 16
    gap = 8
    fw = (rw - 2 * gap) / 3
    figs = [("More fundable", "fewer queries, so more claims reach acceptance"), ("Fewer days", "faster acceptance, so less interest for the hospital"), ("Priced on evidence", "each HMO's record, claim by claim")]
    for i, (v, l) in enumerate(figs):
        fx = rx + i * (fw + gap)
        c.setFillColor(GTINT if i == 1 else NTINT)
        c.roundRect(fx, y - 104, fw, 104, 7, fill=1, stroke=0)
        yy = y - 22
        for ln in wrap(c, v, "Serif", 13.5, fw - 20):
            t(c, ln, fx + 10, yy, "Serif", 13.5, NAVY)
            yy -= 16
        para(c, l, fx + 10, yy - 4, 8.6, BODY, fw - 18, 11)

    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(MX, 34, PAGE_W - MX, 34)
    t(c, "Consult for Africa  ·  HospitlOS capture layer  ·  12 October 2026  ·  Confidential", MX, 21, "Sans", 8, MUTED)
    t(c, "Offered to pilot facilities that want it, alongside the claims desk.", PAGE_W - MX, 21, "Sans", 8, MUTED, "r")
    c.save()
    print("wrote", OUT)


if __name__ == "__main__":
    build()
