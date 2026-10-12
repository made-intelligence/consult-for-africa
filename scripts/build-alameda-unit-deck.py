"""
Unit economics to breakeven, for the investor in the SPV.

    python3 scripts/build-alameda-unit-deck.py
"""
from __future__ import annotations
import sys
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
import alameda_unit as U
import medbury_alameda_centre as C
from cfa_deck import SERIF, SERIF_B, wrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "lyfeplace-abuja" / "alameda-unit-economics.pdf"
LOGO, LOGO_REV = DOCS / "medbury-logo.png", DOCS / "medbury-logo-reversed.png"

RED, RED_D = HexColor("#ED1C24"), HexColor("#B7141B")
DARK, INK, BODY = HexColor("#111114"), HexColor("#1A1A1E"), HexColor("#2B2B31")
MUTED, SURFACE, BLUSH = HexColor("#6E6E76"), HexColor("#F4F4F6"), HexColor("#FDF1F1")
GREENF = HexColor("#EAF3ED")
PAGE_W, PAGE_H = landscape(A4)
MX = 48
_N = [0]
TOTAL = "05"

B = U.build()
UN, EX = B["unit"], B["exec_unit"]
A = C.build(); AM = C.metrics(A)
S = C.MEDBURY_SHARE
f = lambda v, d=0: ("{:,.%df}" % d).format(v)


def logo(c, x, y, h, rev=False):
    try:
        img = ImageReader(str(LOGO_REV if rev else LOGO)); iw, ih = img.getSize()
        c.drawImage(img, x, y, width=h * iw / ih, height=h, mask="auto")
    except Exception:
        pass


def chrome(c, kicker):
    _N[0] += 1
    c.setFillColor(DARK); c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, PAGE_H - 54, 24, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10); c.setFillColor(RED_D)
    c.drawString(MX + 32, PAGE_H - 57, kicker.upper())
    logo(c, PAGE_W - MX - 84, PAGE_H - 66, 20)
    c.setFillColor(RED); c.rect(MX, 28, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7.6)
    c.drawString(MX, 18, "Medbury Alameda SPV   /   unit economics to breakeven   /   Private and confidential")
    c.drawRightString(PAGE_W - MX, 18, "%s / %s" % (str(_N[0]).zfill(2), TOTAL))


def head(c, t, y=PAGE_H - 100, size=22):
    c.setFont(SERIF_B, size); c.setFillColor(INK)
    for ln in wrap(c, t, SERIF_B, size, PAGE_W - 2 * MX):
        c.drawString(MX, y, ln); y -= size + 7
    return y


def rowtable(c, rows, x, y, w, lw=None, size=9.6, lead=12.4, pad=6):
    lw = lw or w * 0.62
    for i, r in enumerate(rows):
        strong = len(r) > 2 and r[2] == "b"
        h = lead + pad * 1.5
        if strong:
            c.setFillColor(BLUSH); c.rect(x, y - h, w, h, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, y - h, 3, h, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(SURFACE); c.rect(x, y - h, w, h, fill=1, stroke=0)
        c.setFont("Helvetica-Bold" if strong else "Helvetica", size)
        c.setFillColor(INK if strong else BODY)
        c.drawString(x + pad + 4, y - h + pad + 1, str(r[0]))
        c.setFont("Helvetica-Bold", size)
        c.setFillColor(RED_D if strong else INK)
        c.drawRightString(x + w - pad - 4, y - h + pad + 1, str(r[1]))
        y -= h
    return y


def note(c, text, y, bg=BLUSH, bar=RED, size=10):
    w = PAGE_W - 2 * MX
    lines = wrap(c, text, "Helvetica", size, w - 32)
    h = len(lines) * 13.4 + 20
    c.setFillColor(bg); c.rect(MX, y - h, w, h, fill=1, stroke=0)
    c.setFillColor(bar); c.rect(MX, y - h, 4, h, fill=1, stroke=0)
    c.setFont("Helvetica", size); c.setFillColor(INK)
    ty = y - 18
    for ln in lines:
        c.drawString(MX + 18, ty, ln); ty -= 13.4
    return y - h


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Medbury Alameda SPV: unit economics to breakeven")

    # 01 the unit
    chrome(c, "the unit")
    y = head(c, "What one patient is worth, and what one costs.")
    colw = (PAGE_W - 2 * MX - 26) / 2
    rows = [(k, f(v)) for k, v in UN["rev"].items()] + [("REVENUE PER PATIENT", f(UN["revenue"]), "b")]
    rowtable(c, rows, MX, y - 10, colw)
    rows = [(k, "(%s)" % f(v)) for k, v in UN["cost"].items()] + \
           [("DIRECT COST", "(%s)" % f(UN["direct"]), "b"),
            ("CONTRIBUTION PER PATIENT", f(UN["contribution"]), "b")]
    yy = rowtable(c, rows, MX + colw + 26, y - 10, colw)
    note(c, "Every patient through the pathway contributes NGN %s, a %.0f per cent margin, because "
            "the diagnostics are owned rather than referred. An executive health package "
            "contributes NGN %s on a NGN %s ticket. Those two numbers are the whole engine."
         % (f(UN["contribution"]), UN["margin"], f(EX["contribution"]), f(EX["ticket"])), yy - 16)
    c.showPage()

    # 02 fixed and breakeven
    chrome(c, "breakeven")
    y = head(c, "It covers itself at %.0f patients a month. Sixteen a day."
             % B["breakeven_patients"])
    rows = [(k, f(v)) for k, v in U.fixed_monthly()] + [("FIXED, A MONTH", f(B["fixed"]), "b")]
    yy = rowtable(c, rows, MX, y - 10, PAGE_W - 2 * MX - 300)
    x2 = PAGE_W - MX - 280
    for i, (big, lab, nt) in enumerate([
            ("%.0f" % B["breakeven_patients"], "patients a month",
             "against a run rate of %.0f" % U.PAT_RUN),
            ("%.0f" % (B["breakeven_patients"] / 21), "a working day",
             "about 2 of the 5 consulting rooms"),
            ("%.0f%%" % (100 * B["breakeven_patients"] / U.PAT_RUN), "of a full building",
             "the other %.0f per cent is margin"
             % (100 - 100 * B["breakeven_patients"] / U.PAT_RUN))]):
        yy2 = y - 10 - i * 84
        c.setFillColor(SURFACE); c.rect(x2, yy2 - 76, 280, 76, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x2, yy2 - 3, 280, 3, fill=1, stroke=0)
        c.setFont(SERIF_B, 24); c.setFillColor(INK); c.drawString(x2 + 14, yy2 - 34, big)
        c.setFont("Helvetica-Bold", 9); c.setFillColor(RED_D)
        c.drawString(x2 + 14, yy2 - 50, lab.upper())
        c.setFont("Helvetica", 8.4); c.setFillColor(MUTED)
        c.drawString(x2 + 14, yy2 - 64, nt)
    note(c, "The fixed base is dominated by two lines: NGN %s M a month of occupancy for the whole "
            "building, and NGN %s M for %d posts. Neither flexes with volume, which is why the "
            "first year is the whole risk and the fifth year is comfortable."
         % (f(U.fixed_monthly()[0][1] / 1e6, 1), f(U.fixed_monthly()[1][1] / 1e6, 1),
            sum(q for _n, q, _s in C.STAFF)), min(yy, y - 10 - 3 * 84) - 16)
    c.showPage()

    # 03 the path
    chrome(c, "the path")
    y = head(c, "Twelve months of losses before it turns.", size=21)
    hdr = ["Month", "Patients", "Exec", "EBITDA", "Cash flow", "Cumulative"]
    picks = [1, 3, 4, 6, 8, 10, 12, 13, 15, 18, 21, 24, 27, 28, 30, 36]
    c.setFillColor(DARK); c.rect(MX, y - 26, PAGE_W - 2 * MX, 22, fill=1, stroke=0)
    cw = [70, 95, 70, 95, 105, 120]
    cx = MX
    c.setFont("Helvetica-Bold", 9); c.setFillColor(white)
    for j, hh in enumerate(hdr):
        (c.drawString if j == 0 else c.drawRightString)(
            cx + (8 if j == 0 else cw[j] - 8), y - 20, hh)
        cx += cw[j]
    yy = y - 26
    for mth in picks:
        r = B["rows"][mth - 1]
        mark = ""
        if mth == B["ebitda_month"]: mark = "EBITDA positive"
        if mth == B["cash_month"]: mark = "capital back"
        h = 15.4
        if mark:
            c.setFillColor(GREENF if mark == "capital back" else BLUSH)
            c.rect(MX, yy - h, PAGE_W - 2 * MX, h, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(MX, yy - h, 3, h, fill=1, stroke=0)
        vals = [str(mth), f(r["patients"]), f(r["exec"]), f(r["ebitda"], 1),
                f(r["cash"], 1), f(r["cum"], 0)]
        cx = MX
        for j, v in enumerate(vals):
            c.setFont("Helvetica-Bold" if mark else "Helvetica", 8.8)
            c.setFillColor(INK if mark else BODY)
            (c.drawString if j == 0 else c.drawRightString)(
                cx + (8 if j == 0 else cw[j] - 8), yy - h + 5, v)
            cx += cw[j]
        if mark:
            c.setFont("Helvetica-Bold", 8.4); c.setFillColor(RED_D)
            c.drawString(cx + 12, yy - h + 5, mark.upper())
        yy -= h
    note(c, "Opens month %d on a three month fit-out. EBITDA turns positive in month %d, which is "
            "%d months after the doors open. The deepest point is month %d. Capital is back in "
            "month %d."
         % (U.OPEN_M, B["ebitda_month"], B["ebitda_month"] - U.OPEN_M + 1,
            B["trough_month"], B["cash_month"]), yy - 14)
    c.showPage()

    # 04 the investor view
    chrome(c, "your side of it")
    y = head(c, "The cheque is not NGN %s M. It is NGN %s M." % (f(B["capex"]), f(B["trough"])))
    yy = rowtable(c, [
        ("Equipment, fit and launch capital", f(B["capex"]) + " M"),
        ("Operating losses until it turns", f(B["trough"] - B["capex"]) + " M"),
        ("TOTAL THE SPV HAS TO BE FUNDED", f(B["trough"]) + " M", "b"),
        ("Medbury at %.0f per cent" % (100 * S), f(B["trough"] * S) + " M", "b"),
    ], MX, y - 10, PAGE_W - 2 * MX - 300, size=10.6, lead=14)
    x2 = PAGE_W - MX - 280
    for i, (big, lab, nt) in enumerate([
            ("NGN %s M" % f(B["trough"] * S), "your funding", "49% of what the SPV needs"),
            ("month %d" % B["cash_month"], "capital back", "%d months after opening"
             % (B["cash_month"] - U.OPEN_M + 1)),
            ("NGN %s M" % f(AM["medbury"][4]), "your net income", "a year at run rate")]):
        yy2 = y - 10 - i * 84
        c.setFillColor(SURFACE); c.rect(x2, yy2 - 76, 280, 76, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x2, yy2 - 3, 280, 3, fill=1, stroke=0)
        c.setFont(SERIF_B, 21); c.setFillColor(INK); c.drawString(x2 + 14, yy2 - 34, big)
        c.setFont("Helvetica-Bold", 9); c.setFillColor(RED_D)
        c.drawString(x2 + 14, yy2 - 50, lab.upper())
        c.setFont("Helvetica", 8.4); c.setFillColor(MUTED)
        c.drawString(x2 + 14, yy2 - 64, nt)
    note(c, "The capital expenditure is NGN %s M but the SPV loses NGN %s M before it turns, and "
            "someone funds that too. Your %.0f per cent is NGN %s M, not the NGN %s M that a "
            "capex table would suggest. Agree the funding schedule and who bridges the losses "
            "before the shareholder agreement is signed, because that is where minority "
            "shareholders get diluted."
         % (f(B["capex"]), f(B["trough"] - B["capex"]), 100 * S, f(B["trough"] * S),
            f(B["capex"] * S)), min(yy, y - 10 - 3 * 84) - 16, bg=BLUSH)
    c.showPage()

    # 05 what would change it
    chrome(c, "what moves breakeven")
    y = head(c, "Three levers, and only one is yours.")
    for i, (t, b) in enumerate([
        ("Volume is the lever you control.",
         "Breakeven is %.0f patients a month against a run rate of %.0f. Every 50 patients a "
         "month is NGN %s M of contribution. Getting to breakeven two months earlier is worth "
         "about NGN %s M of funding you never have to put in."
         % (B["breakeven_patients"], U.PAT_RUN, f(50 * UN["contribution"] / 1e6, 1),
            f(2 * B["fixed"] / 1e6, 0))),
        ("The fixed base is set on day one and barely moves.",
         "NGN %s M a month, of which occupancy and payroll are NGN %s M. You cannot flex your "
         "way out of a slow ramp. The only real decision is whether to open the whole building "
         "at once or phase the observation unit and the second procedure room."
         % (f(B["fixed"] / 1e6, 1),
            f((U.fixed_monthly()[0][1] + U.fixed_monthly()[1][1]) / 1e6, 1))),
        ("The referral is the one you do not control.",
         "NGN %s of the NGN %s contribution per patient is the As-Salam commission and the "
         "concierge fee attached to it. Strip those out and breakeven moves from %.0f patients a "
         "month to %.0f, which is more than the building can see in year one."
         % (f(UN["rev"]["As-Salam referral at 15%"] * 0.95 + UN["rev"]["Concierge and case management"]),
            f(UN["contribution"]),
            B["breakeven_patients"],
            B["fixed"] / (UN["contribution"] - UN["rev"]["As-Salam referral at 15%"] * 0.95
                          - UN["rev"]["Concierge and case management"]))),
    ]):
        yy = y - 12 - i * 92
        c.setFillColor(RED); c.rect(MX, yy - 4, 3, 30, fill=1, stroke=0)
        c.setFont(SERIF_B, 13.4); c.setFillColor(INK)
        c.drawString(MX + 16, yy + 12, t)
        ty = yy - 6
        c.setFont("Helvetica", 10.2); c.setFillColor(BODY)
        for ln in wrap(c, b, "Helvetica", 10.2, PAGE_W - 2 * MX - 20):
            c.drawString(MX + 16, ty, ln); ty -= 13.4
    c.showPage()
    c.save()
    print("wrote %s" % OUT.name)


if __name__ == "__main__":
    build()
