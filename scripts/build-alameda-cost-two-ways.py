"""
The full cost breakdown, two ways.

Slide 1  the SPV occupies the whole building, per the medical plan   664.3 sqm
Slide 2  the SPV occupies its own rooms on the ground floor only     113.0 sqm

Same structure on both: capital, direct cost, fixed cost, total cash out, from
the fit-out period to year five. Every subtotal is asserted against its model.

    python3 scripts/build-alameda-cost-two-ways.py
"""
from __future__ import annotations
import sys
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
import alameda_clinic as T          # the tenancy: 113 sqm
import alameda_cost_data as D
import medbury_alameda_centre as C  # the whole building: 664.3 sqm
from cfa_deck import SERIF_B, wrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "lyfeplace-abuja" / "alameda-cost-two-ways.pdf"
LOGO = DOCS / "medbury-logo.png"

RED, RED_D = HexColor("#ED1C24"), HexColor("#B7141B")
DARK, INK, BODY = HexColor("#111114"), HexColor("#1A1A1E"), HexColor("#2B2B31")
MUTED, SURFACE, BLUSH = HexColor("#6E6E76"), HexColor("#F4F4F6"), HexColor("#FDF1F1")
BAND = HexColor("#E4E4E9")
PAGE_W, PAGE_H = landscape(A4)
MX = 44
_N = [0]
TOTAL = "02"

FIT_MONTHS = 3
PRE_OPEN_SHARE = 0.45
YRS = C.YEARS
f = lambda v, d=1: ("{:,.%df}" % d).format(v)


def _eq(a, b, what):
    if abs(a - b) > 0.05:
        raise AssertionError("%s: %.2f vs %.2f" % (what, a, b))


def logo(c, x, y, h):
    try:
        img = ImageReader(str(LOGO)); iw, ih = img.getSize()
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
    c.setFillColor(RED); c.rect(MX, 26, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7.4)
    c.drawString(MX, 16, "Medbury Alameda SPV   /   the full cost breakdown   /   Private and confidential")
    c.drawRightString(PAGE_W - MX, 16, "%s / %s" % (str(_N[0]).zfill(2), TOTAL))


def head(c, t, sub, size=20):
    y = PAGE_H - 94
    c.setFont(SERIF_B, size); c.setFillColor(INK)
    for ln in wrap(c, t, SERIF_B, size, PAGE_W - 2 * MX):
        c.drawString(MX, y, ln); y -= size + 5
    c.setFont("Helvetica", 9.4); c.setFillColor(MUTED)
    for ln in wrap(c, sub, "Helvetica", 9.4, PAGE_W - 2 * MX):
        c.drawString(MX, y - 4, ln); y -= 12
    return y - 12


def note(c, text, y, size=9.2):
    w = PAGE_W - 2 * MX
    lines = wrap(c, text, "Helvetica", size, w - 30)
    h = len(lines) * 12.6 + 17
    c.setFillColor(BLUSH); c.rect(MX, y - h, w, h, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, y - h, 4, h, fill=1, stroke=0)
    c.setFont("Helvetica", size); c.setFillColor(INK)
    ty = y - 16
    for ln in lines:
        c.drawString(MX + 17, ty, ln); ty -= 12.6
    return y - h


COLS = [250] + [72] * 7


def grand(blocks):
    fit = sum(l[1] for _b, ls, _s in blocks for l in ls)
    yrs = [sum(l[2][i] for _b, ls, _s in blocks for l in ls) for i in range(YRS)]
    return fit, yrs, fit + sum(yrs)


def statement(c, y, blocks, rh=17.0):
    hdr = ["", "Fit-out", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Five years"]
    w = sum(COLS)
    c.setFillColor(DARK); c.rect(MX, y - 21, w, 21, fill=1, stroke=0)
    cx = MX
    c.setFont("Helvetica-Bold", 8.4); c.setFillColor(white)
    for j, h in enumerate(hdr):
        (c.drawString if j == 0 else c.drawRightString)(
            cx + (8 if j == 0 else COLS[j] - 8), y - 14.6, h)
        cx += COLS[j]
    y -= 21

    def row(label, fit, yrs, kind):
        nonlocal y
        bg = {"band": BAND, "sub": SURFACE, "total": BLUSH}.get(kind)
        if bg:
            c.setFillColor(bg); c.rect(MX, y - rh, w, rh, fill=1, stroke=0)
        if kind == "total":
            c.setFillColor(RED); c.rect(MX, y - rh, 3, rh, fill=1, stroke=0)
        bold = kind != "line"
        c.setFont("Helvetica-Bold" if bold else "Helvetica", 8.5)
        c.setFillColor(INK if bold else BODY)
        c.drawString(MX + (16 if kind == "line" else 8), y - rh + 5.2, label)
        if kind == "band":
            y -= rh
            return
        vals = [fit] + list(yrs) + [fit + sum(yrs)]
        cx = MX + COLS[0]
        for j, v in enumerate(vals):
            c.setFont("Helvetica-Bold", 8.5)
            c.setFillColor(RED_D if kind == "total" else INK)
            txt = "" if (v == 0 and kind != "total") else (f(v, 1) if abs(v) < 1000 else f(v, 0))
            c.drawRightString(cx + COLS[j + 1] - 8, y - rh + 5.2, txt)
            cx += COLS[j + 1]
        y -= rh

    for band, lines, sub in blocks:
        row(band, 0.0, [0.0] * YRS, "band")
        for lbl, fit, yrs in lines:
            row(lbl, fit, yrs, "line")
        sf = sum(l[1] for l in lines)
        sy = [sum(l[2][i] for l in lines) for i in range(YRS)]
        row(sub, sf, sy, "sub")
    gf, gy, gt = grand(blocks)
    row("TOTAL CASH OUT", gf, gy, "total")
    return y


def blocks_building():
    M = C.build()
    pre = M["opex"][0] / 12 * PRE_OPEN_SHARE * FIT_MONTHS
    cap = [(lbl, sum(D.CAPEX[k] for k in ks), [0.0] * YRS) for lbl, ks, _n in D.GROUPS]
    _eq(sum(x[1] for x in cap), D.TOTAL_CAPEX, "building capital")
    direct = [(lbl, 0.0, v) for lbl, v in D.direct_split(M)]
    fixed = [(lbl, pre * v[0] / M["opex"][0], v) for lbl, v in D.fixed_split(M)]
    _eq(sum(x[1] for x in fixed), pre, "building pre-opening")
    return [("CAPITAL, spent once", cap, "Capital subtotal"),
            ("DIRECT COST, moves with volume", direct, "Direct cost subtotal"),
            ("FIXED COST, falls due whether or not a patient comes", fixed,
             "Fixed cost subtotal")], M, pre


def blocks_rooms():
    M = T.build()
    pre = M["opex"][0] / 12 * PRE_OPEN_SHARE * FIT_MONTHS
    K = {n: v for n, v, _d in T.CAPEX}
    cap = [("Clinical equipment, 5 rooms", K["Clinical equipment, 5 rooms"], [0.0] * YRS),
           ("Fit, furniture, IT and branding",
            K["Category B fit and furniture"] + K["IT, workstations and practice management"]
            + K["Branding and signage within the demise"], [0.0] * YRS),
           ("Launch campaign, licence and registration",
            K["Launch campaign"] + K["Registration, licence and regulatory"], [0.0] * YRS),
           ("Working capital", K["Working capital"], [0.0] * YRS)]
    _eq(sum(x[1] for x in cap), M["capex_total"], "rooms capital")
    direct = [("Clinician fees", 0.0, M["doctor_fee"]),
              ("Consultant share of the referral", 0.0, M["ip_share"]),
              ("Consumables", 0.0, M["consumables"])]
    for i in range(YRS):
        _eq(sum(x[2][i] for x in direct), M["revenue"][i] - M["gross"][i],
            "rooms direct year %d" % (i + 1))
    r = lambda v: [v[i] if i < len(v) else v[-1] for i in range(YRS)]
    fx = [("Occupancy, %s sqm at NGN %s a sqm" % (f(T.SQM, 1), f(T.OCC_RATE, 0)), M["occupancy"]),
          ("Personnel, %d posts loaded" % sum(q for _n, q, _s in T.PERSONNEL), M["personnel"]),
          ("Marketing and demand generation", r(T.MARKETING)),
          ("As-Salam consultant travel and accommodation",
           [a + b for a, b in zip(r(T.TRAVEL_DOCTORS), r(T.ACCOMMODATION))]),
          ("Office, business travel, misc and licences",
           [a + b + cc + d for a, b, cc, d in zip(r(T.TRAVEL_BUSINESS), r(T.OFFICE),
                                                  r(T.MISC), r(T.LICENCES))])]
    for i in range(YRS):
        _eq(sum(x[1][i] for x in fx), M["opex"][i], "rooms fixed year %d" % (i + 1))
    fixed = [(lbl, pre * v[0] / M["opex"][0], v) for lbl, v in fx]
    return [("CAPITAL, spent once", cap, "Capital subtotal"),
            ("DIRECT COST, moves with volume", direct, "Direct cost subtotal"),
            ("FIXED COST, falls due whether or not a patient comes", fixed,
             "Fixed cost subtotal")], M, pre


def build():
    BB, MB, PB = blocks_building()
    BR, MR, PR = blocks_rooms()
    _, _, TB = grand(BB)
    _, _, TR = grand(BR)

    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Medbury Alameda SPV: the full cost breakdown, two ways")

    chrome(c, "the whole building")
    y = head(c, "The whole building: NGN %s M of cost over five years." % f(TB, 0),
             "%s sqm, per the medical plan. Ground floor public and diagnostic, first floor "
             "clinics, procedures and 9 observation beds, the chalet a full laboratory, the "
             "boys' quarters engineering, store and IT." % f(C.SQM, 1))
    yy = statement(c, y, BB)
    note(c, "Capital of NGN %s M is spent once. Running it costs NGN %s M over five years, of "
            "which NGN %s M is fixed and falls due whether or not a patient comes. Direct cost is "
            "only NGN %s M, %.0f per cent of the total, which is what a diagnostic hub looks like: "
            "you buy the analyser once and the marginal test is cheap. Revenue over the same five "
            "years is NGN %s M."
         % (f(D.TOTAL_CAPEX, 0), f(TB - D.TOTAL_CAPEX, 0), f(sum(MB["opex"]) + PB, 0),
            f(sum(MB["direct"]), 0), 100 * sum(MB["direct"]) / TB, f(sum(MB["revenue"]), 0)),
         yy - 14)
    c.showPage()

    chrome(c, "the spv's own rooms")
    y = head(c, "Its own rooms only: NGN %s M of cost over five years." % f(TR, 0),
             "%s sqm of the ground floor, a fitted demise inside Lyfe Place. The laboratory, the "
             "imaging suite, the dispensary and the building itself belong to other Medbury "
             "businesses, and so does the revenue they earn." % f(T.SQM, 1))
    yy = statement(c, y, BR)
    note(c, "A seventh of the capital, NGN %s M against NGN %s M, and the rooms arrive fitted "
            "because the partitions, power and cooling are the landlord's and come back through "
            "the occupancy rate. But it owns no laboratory, no X-ray room and no dispensary, so "
            "five year revenue is NGN %s M against NGN %s M. The question is not which is cheaper. "
            "It is whether Medbury would rather own the diagnostics inside this SPV at %.0f per "
            "cent, or outside it at 100."
         % (f(MR["capex_total"], 0), f(D.TOTAL_CAPEX, 0), f(sum(MR["revenue"]), 0),
            f(sum(MB["revenue"]), 0), 100 * C.MEDBURY_SHARE), yy - 14)
    c.showPage()
    c.save()
    print("wrote %s   whole building %s M over 5 yrs   own rooms %s M"
          % (OUT.name, f(TB, 0), f(TR, 0)))


if __name__ == "__main__":
    build()
