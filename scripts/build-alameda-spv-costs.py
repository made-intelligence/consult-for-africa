"""
The SPV cost base on 113 sqm, at a size you can read across a meeting room.

    01  What it costs to open          capital
    02  What it costs to run           fixed cost
    03  What a patient is worth        unit economics and breakeven

Three pages, nothing smaller than 11pt, no more than a dozen lines on a page.
The component level schedules stay in alameda_cost_data.py and are not printed.

    python3 scripts/build-alameda-spv-costs.py
"""
from __future__ import annotations
import sys
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
import alameda_clinic as T
import alameda_cost_data as D
from cfa_deck import SERIF_B, wrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "lyfeplace-abuja" / "alameda-spv-costs.pdf"
LOGO = DOCS / "medbury-logo.png"

RED, RED_D = HexColor("#ED1C24"), HexColor("#B7141B")
DARK, INK, BODY = HexColor("#111114"), HexColor("#1A1A1E"), HexColor("#2B2B31")
MUTED, SURFACE, BLUSH = HexColor("#6E6E76"), HexColor("#F4F4F6"), HexColor("#FDF1F1")
PAGE_W, PAGE_H = landscape(A4)
MX = 48
_N = [0]
TOTAL = "03"

M = T.build()
ME = T.metrics(M)
U1, U5 = D.t_unit(M, 0), D.t_unit(M, 4)
BE1 = M["opex"][0] * 1e6 / U1["contribution"] / 12
BE5 = M["opex"][4] * 1e6 / U5["contribution"] / 12
f = lambda v, d=0: ("{:,.%df}" % d).format(v)

ROW, SIZE, HSIZE = 25.0, 12.0, 10.4


def logo(c, x, y, h):
    try:
        img = ImageReader(str(LOGO)); iw, ih = img.getSize()
        c.drawImage(img, x, y, width=h * iw / ih, height=h, mask="auto")
    except Exception:
        pass


def chrome(c, kicker):
    _N[0] += 1
    c.setFillColor(DARK); c.rect(0, PAGE_H - 8, PAGE_W, 8, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 11, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, PAGE_H - 52, 26, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 11); c.setFillColor(RED_D)
    c.drawString(MX + 34, PAGE_H - 56, kicker.upper())
    logo(c, PAGE_W - MX - 96, PAGE_H - 66, 23)
    c.setFillColor(RED); c.rect(MX, 28, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 8.6)
    c.drawString(MX, 17, "Medbury Alameda SPV   /   113 sqm, the ground floor at Lyfe Place Abuja")
    c.drawRightString(PAGE_W - MX, 17, "%s / %s" % (str(_N[0]).zfill(2), TOTAL))


def head(c, t, sub=None):
    y = PAGE_H - 96
    c.setFont(SERIF_B, 25); c.setFillColor(INK)
    for ln in wrap(c, t, SERIF_B, 25, PAGE_W - 2 * MX):
        c.drawString(MX, y, ln); y -= 30
    if sub:
        c.setFont("Helvetica", 11.6); c.setFillColor(MUTED)
        for ln in wrap(c, sub, "Helvetica", 11.6, PAGE_W - 2 * MX):
            c.drawString(MX, y - 2, ln); y -= 15
    return y - 16


def note(c, text, y, size=11.4):
    w = PAGE_W - 2 * MX
    lines = wrap(c, text, "Helvetica", size, w - 36)
    h = len(lines) * 15.4 + 21
    c.setFillColor(BLUSH); c.rect(MX, y - h, w, h, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, y - h, 5, h, fill=1, stroke=0)
    c.setFont("Helvetica", size); c.setFillColor(INK)
    ty = y - 20
    for ln in lines:
        c.drawString(MX + 21, ty, ln); ty -= 15.4
    return y - h


def table(c, x, y, cols, hdr, rows, rh=ROW, size=SIZE, align=None):
    """rows: (kind, label, [values]). kind is line | sub | total."""
    align = align or ["l"] + ["r"] * (len(cols) - 1)
    w = sum(cols)
    c.setFillColor(DARK); c.rect(x, y - 26, w, 26, fill=1, stroke=0)
    cx = x
    c.setFont("Helvetica-Bold", HSIZE); c.setFillColor(white)
    for j, h in enumerate(hdr):
        (c.drawString if align[j] == "l" else c.drawRightString)(
            cx + (12 if align[j] == "l" else cols[j] - 12), y - 17.4, h)
        cx += cols[j]
    y -= 26
    for i, (kind, label, vals) in enumerate(rows):
        if kind == "total":
            c.setFillColor(BLUSH); c.rect(x, y - rh, w, rh, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, y - rh, 4, rh, fill=1, stroke=0)
        elif kind == "sub":
            c.setFillColor(HexColor("#E8E8ED")); c.rect(x, y - rh, w, rh, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(SURFACE); c.rect(x, y - rh, w, rh, fill=1, stroke=0)
        bold = kind != "line"
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.setFillColor(INK if bold else BODY)
        c.drawString(x + 12, y - rh + 8, label)
        cx = x + cols[0]
        for j, v in enumerate(vals):
            left = align[j + 1] == "l"
            c.setFont("Helvetica" if left else "Helvetica-Bold", size)
            c.setFillColor(BODY if left else (RED_D if kind == "total" else INK))
            (c.drawString if left else c.drawRightString)(
                cx + (12 if left else cols[j + 1] - 12), y - rh + 8, v)
            cx += cols[j + 1]
        y -= rh
    return y


def cards(c, y, items, h=78):
    n = len(items)
    gap = 18
    w = (PAGE_W - 2 * MX - (n - 1) * gap) / n
    for i, (big, lab) in enumerate(items):
        x = MX + i * (w + gap)
        c.setFillColor(SURFACE); c.rect(x, y - h, w, h, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x, y - 4, w, 4, fill=1, stroke=0)
        c.setFont(SERIF_B, 27); c.setFillColor(INK)
        c.drawString(x + 16, y - 42, big)
        c.setFont("Helvetica-Bold", 9.6); c.setFillColor(RED_D)
        ty = y - 58
        for ln in wrap(c, lab.upper(), "Helvetica-Bold", 9.6, w - 32)[:2]:
            c.drawString(x + 16, ty, ln); ty -= 12
    return y - h


# =============================================================================
def p01(c):
    chrome(c, "what it costs to open")
    y = head(c, "N%s million to open the clinic." % f(D.T_TOTAL_CAPEX),
             "Paid once, before the doors open. The building itself is the landlord's: "
             "partitions, power, cooling and the general fit come back through the rent.")
    K = D.T_CAPEX
    rows = [("line", "Clinical equipment for 5 rooms", "Couches, monitors, ECG, instruments",
             K["Clinical equipment, 5 rooms"]),
            ("line", "Furniture and fit", "Desks, seating, casework, finishes",
             K["Category B fit and furniture"]),
            ("line", "IT and practice management", "Booking, records, billing, workstations",
             K["IT, workstations and practice management"]),
            ("line", "Branding and signage", "Alameda identity inside a Lyfe Place building",
             K["Branding and signage within the demise"]),
            ("line", "Launch campaign", "Medical tourism is a considered purchase",
             K["Launch campaign"]),
            ("line", "Licences and registration", "FCT, MDCN, corporate",
             K["Registration, licence and regulatory"]),
            ("line", "Working capital", "Payroll and payables to first collections",
             K["Working capital"])]
    yy = table(c, MX, y, [262, 352, 132],
               ["", "What it is", "N million"],
               [(k, a, [b, f(v, 1)]) for k, a, b, v in rows]
               + [("total", "TOTAL TO OPEN", ["", f(D.T_TOTAL_CAPEX, 1)])],
               align=["l", "l", "r"])
    note(c, "Only N%s million of it is the clinic. N%s million is the launch campaign and N%s "
            "million is working capital, because a new destination has to be marketed and has to "
            "pay its people before the first patient settles a bill."
         % (f(K["Clinical equipment, 5 rooms"] + K["Category B fit and furniture"]
              + K["IT, workstations and practice management"]
              + K["Branding and signage within the demise"]),
            f(K["Launch campaign"]), f(K["Working capital"])), yy - 22)


def p02(c):
    chrome(c, "what it costs to run")
    y = head(c, "N%s million a month to keep it open." % f(M["opex"][0] / 12, 1),
             "Falls due whether or not a patient comes through the door. This is year one; "
             "it grows to N%s million a month by year five." % f(M["opex"][4] / 12, 1))
    lines = D.t_fixed_split(M)
    keep = [(n, v) for n, v in lines if v[0] > 0]
    rows = [("line", n.split(",")[0] if n.startswith("Occupancy") else n.split(",")[0],
             [f(v[0] / 12, 1), f(v[0], 1), f(v[4], 1)]) for n, v in keep]
    rows = []
    for n, v in keep:
        lbl = {"Occupancy": "Rent, service charge and the fitted space",
               "Personnel": "Five staff, fully loaded",
               "Marketing": "Marketing and demand generation",
               "As-Salam consultant travel": "Flying the As-Salam consultants in",
               "As-Salam consultant accommodation": "Their accommodation",
               "Business travel": "Business travel",
               "Office and administration": "Office and administration",
               "Contingency and miscellaneous": "Contingency and miscellaneous",
               }.get(n.split(",")[0], n.split(",")[0])
        rows.append(("line", lbl, [f(v[0] / 12, 1), f(v[0], 1), f(v[4], 1)]))
    rows.append(("total", "TOTAL", [f(M["opex"][0] / 12, 1), f(M["opex"][0], 1),
                                    f(M["opex"][4], 1)]))
    yy = table(c, MX, y, [370, 124, 126, 126],
               ["", "A month", "Year 1", "Year 5"], rows)
    occ = [T.SQM * v / 1e6 for _n, v, _d in D.T_OCC_SPLIT]
    note(c, "Rent is not a line of its own because Lyfe Place charges one all in figure. Inside "
            "the N%s million are three things: rent of N%s million, recovery of the fit-out the "
            "landlord paid for at N%s million, and a service charge of N%s million for power, "
            "security, cleaning, facilities and reception. Rent is %.0f per cent of it."
         % (f(M["occupancy"][0], 1), f(occ[0], 1), f(occ[1], 1), f(occ[2], 1),
            100 * D.T_OCC_SPLIT[0][1] / T.OCC_RATE), yy - 22)


def p03(c):
    chrome(c, "what a patient is worth")
    y = head(c, "Every patient pays N%s. You keep N%s." % (f(U1["revenue"]), f(U1["contribution"])),
             "Year one. Nothing on this page is spent unless a patient is actually seen.")
    rows = []
    for n, v in U1["rev"]:
        rows.append(("line", n, [f(v)]))
    rows.append(("sub", "What the patient pays", [f(U1["revenue"])]))
    for n, v in U1["cost"]:
        rows.append(("line", n, ["(%s)" % f(v)]))
    rows.append(("sub", "What it costs to serve them", ["(%s)" % f(U1["direct"])]))
    rows.append(("total", "WHAT YOU KEEP", [f(U1["contribution"])]))
    yy = table(c, MX, y, [560, 186], ["", "Naira"], rows, rh=23.0)
    yy = cards(c, yy - 16, [
        ("%.0f" % BE1, "patients a month to break even"),
        ("%.0f" % (M["vol"][0] / 12), "patients a month in year one"),
        ("%.0f" % (M["vol"][4] / 12), "a month once the rooms fill"),
        ("%.0f%%" % U1["margin"], "of every naira billed is kept"),
    ], h=74)
    note(c, "The As-Salam referral is what makes this work. Take it away and what you keep falls "
            "to N%s a patient, and breakeven rises from %.0f patients a month to %.0f against the "
            "%.0f you would see."
         % (f(U1["contribution"] - U1["rev"][2][1] + U1["cost"][1][1]), BE1,
            M["opex"][0] * 1e6 / (U1["contribution"] - U1["rev"][2][1]
                                  + U1["cost"][1][1]) / 12,
            M["vol"][0] / 12), yy - 16)


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Medbury Alameda SPV: the cost base on 113 sqm")
    for page in (p01, p02, p03):
        page(c); c.showPage()
    c.save()
    print("wrote %s" % OUT.name)


if __name__ == "__main__":
    build()
