"""
The cost base in detail: capital, establishment, variable and fixed.

Every schedule here reconciles to medbury_alameda_centre.py. Assertions at the
bottom of the data block fail the build if a sub-schedule stops adding up to the
line it sits under.

    python3 scripts/build-alameda-costs.py
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
from cfa_deck import SERIF_B, wrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "lyfeplace-abuja" / "alameda-cost-base.pdf"
LOGO = DOCS / "medbury-logo.png"

RED, RED_D = HexColor("#ED1C24"), HexColor("#B7141B")
DARK, INK, BODY = HexColor("#111114"), HexColor("#1A1A1E"), HexColor("#2B2B31")
MUTED, SURFACE, BLUSH = HexColor("#6E6E76"), HexColor("#F4F4F6"), HexColor("#FDF1F1")
PAGE_W, PAGE_H = landscape(A4)
MX = 44
_N = [0]
TOTAL = "07"

B = U.build()
UN = B["unit"]
M = C.build()
CAPEX = {n: v for n, v, _d in C.CAPEX}
f = lambda v, d=0: ("{:,.%df}" % d).format(v)

# ---- sub-schedules. Indicative at this stage, firmed at BOQ.
LAB = [
    ("Chemistry analyser, random access, with ISE", 45.0),
    ("Immunoassay, chemiluminescence", 42.0),
    ("Haematology, 5 part differential", 28.0),
    ("PCR: thermocycler, extraction, biosafety cabinet", 25.0),
    ("Coagulation analyser", 15.0),
    ("Microbiology: incubator, autoclave, microscopy", 12.0),
    ("Centrifuges, cold chain, water system, benching", 13.0),
]
IMG = [
    ("Digital radiography, flat panel detector", 62.0),
    ("Ultrasound, multi probe with Doppler", 45.0),
    ("Echocardiography system", 35.0),
    ("X-ray room shielding, lead lining, warning systems", 18.0),
    ("Cardiology: ECG, Holter, ambulatory BP, spirometry", 12.0),
    ("Radiology console, reporting workstation, DICOM", 10.0),
]
PROC = [
    ("Two procedure tables, lights, diathermy", 22.0),
    ("Monitoring, suction, crash trolley", 18.0),
    ("CSSD: autoclave", 14.0),
    ("CSSD: washer disinfector", 7.0),
    ("CSSD: sterile packing and storage", 4.0),
]
OBS = [
    ("Nine beds, lockers and bed side fit", 14.0),
    ("Patient monitors and central station", 15.0),
    ("Infusion pumps, trolleys and resuscitation", 6.0),
]
SYS = [
    ("HIS, LIS and PACS, with implementation", 28.0),
    ("Network, servers, archive and cabling", 17.0),
    ("Category B furniture and consulting fit", 30.0),
    ("Pharmacy fit, shelving and cold chain", 15.0),
    ("Biomedical workshop", 8.0),
]
assert abs(sum(v for _n, v in LAB) - CAPEX["Laboratory: chemistry, haematology, coagulation, immunoassay, PCR"]) < 0.01
assert abs(sum(v for _n, v in IMG) - (CAPEX["Digital X-ray, shielding and console"]
           + CAPEX["Ultrasound with Doppler"] + CAPEX["Echocardiography"]
           + CAPEX["Cardiology: ECG, Holter, ambulatory BP, spirometry"])) < 0.01
assert abs(sum(v for _n, v in PROC) - (CAPEX["Two procedure suites"]
           + CAPEX["CSSD: autoclave, washer, sterile storage"])) < 0.01
assert abs(sum(v for _n, v in OBS) - CAPEX["Observation unit, 9 beds and monitoring"]) < 0.01
assert abs(sum(v for _n, v in SYS) - (CAPEX["IT: HIS, LIS, PACS, network, archive"]
           + CAPEX["Category B furniture and consulting fit"]
           + CAPEX["Pharmacy fit, shelving and cold chain"]
           + CAPEX["Biomedical workshop"])) < 0.01

GROUPS = [
    ("Diagnostics", ["Digital X-ray, shielding and console",
                     "Laboratory: chemistry, haematology, coagulation, immunoassay, PCR",
                     "Ultrasound with Doppler", "Echocardiography",
                     "Cardiology: ECG, Holter, ambulatory BP, spirometry"],
     "the part that earns on every patient"),
    ("Clinical", ["Two procedure suites", "CSSD: autoclave, washer, sterile storage",
                  "Observation unit, 9 beds and monitoring"],
     "procedures, sterile services, 9 beds"),
    ("Systems and fit", ["IT: HIS, LIS, PACS, network, archive",
                         "Category B furniture and consulting fit",
                         "Pharmacy fit, shelving and cold chain", "Biomedical workshop"],
     "what the building needs to run"),
    ("Launch and stock", ["Launch campaign", "Registration, licence and regulatory",
                          "Working capital"],
     "cash out before the first bill"),
]
assert sum(CAPEX[k] for _l, ks, _n in GROUPS for k in ks) == sum(v for _n, v, _d in C.CAPEX)

DRIVERS = [
    ("Doctor fee", "%.0f%% of a local consultation, %.0f%% of an As-Salam one"
     % (100 * C.DOCTOR_FEE_LOCAL, 100 * C.DOCTOR_FEE_FOREIGN), "Doctor fee"),
    ("Laboratory reagents", "%.0f%% of laboratory revenue" % (100 * C.LAB_CONSUMABLES),
     "Laboratory reagents"),
    ("Imaging and cardiology consumables", "%.0f%% of imaging revenue"
     % (100 * C.IMAGING_CONSUMABLES), "Imaging and cardiology consumables"),
    ("Pharmacy cost of goods", "%.0f%% of dispensary revenue" % (100 * C.PHARMACY_COGS),
     "Pharmacy cost of goods"),
    ("Procedure consumables", "%.0f%% of procedure revenue" % (100 * C.PROCEDURE_CONSUMABLES),
     "Procedure consumables"),
    ("Observation consumables", "%.0f%% of observation revenue"
     % (100 * C.OBSERVATION_CONSUMABLES), "Observation consumables"),
    ("Consultant share of the referral", "%.0f%% of the As-Salam commission"
     % (100 * C.CONSULTANT_ON_IP), "Consultant share of the referral"),
]


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
    c.drawString(MX, 16, "Medbury Alameda SPV   /   the cost base in detail   /   Private and confidential")
    c.drawRightString(PAGE_W - MX, 16, "%s / %s" % (str(_N[0]).zfill(2), TOTAL))


def head(c, t, size=20, y=None):
    y = y if y is not None else PAGE_H - 96
    c.setFont(SERIF_B, size); c.setFillColor(INK)
    for ln in wrap(c, t, SERIF_B, size, PAGE_W - 2 * MX):
        c.drawString(MX, y, ln); y -= size + 6
    return y


def table(c, hdr, rows, cols, x, y, rh=17.4, size=8.8, strong=(), align=None):
    """rows: list of tuples. strong: set of row indices to emphasise."""
    align = align or ["l"] + ["r"] * (len(hdr) - 1)
    w = sum(cols)
    c.setFillColor(DARK); c.rect(x, y - 21, w, 21, fill=1, stroke=0)
    cx = x
    c.setFont("Helvetica-Bold", 8.4); c.setFillColor(white)
    for j, h in enumerate(hdr):
        if align[j] == "l":
            c.drawString(cx + 7, y - 15, h)
        else:
            c.drawRightString(cx + cols[j] - 7, y - 15, h)
        cx += cols[j]
    y -= 21
    for i, r in enumerate(rows):
        st = i in strong
        if st:
            c.setFillColor(BLUSH); c.rect(x, y - rh, w, rh, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, y - rh, 3, rh, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(SURFACE); c.rect(x, y - rh, w, rh, fill=1, stroke=0)
        cx = x
        for j, v in enumerate(r):
            c.setFont("Helvetica-Bold" if (st or align[j] == "r") else "Helvetica", size)
            c.setFillColor(INK if st else (BODY if j == 0 else INK))
            if j == len(r) - 1 and st:
                c.setFillColor(RED_D)
            s = str(v)
            if align[j] == "l":
                fs, avail = size, cols[j] - 14
                while fs > 6.4 and c.stringWidth(s, c._fontname, fs) > avail:
                    fs -= 0.3
                if c.stringWidth(s, c._fontname, fs) > avail:
                    raise ValueError("cell will not fit at 6.4pt: %r" % s)
                c.setFont(c._fontname, fs)
                c.drawString(cx + 7, y - rh + 5.4, s)
            else:
                c.drawRightString(cx + cols[j] - 7, y - rh + 5.4, s)
            cx += cols[j]
        y -= rh
    return y


def note(c, text, y, size=9.4):
    w = PAGE_W - 2 * MX
    lines = wrap(c, text, "Helvetica", size, w - 30)
    h = len(lines) * 12.8 + 18
    c.setFillColor(BLUSH); c.rect(MX, y - h, w, h, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, y - h, 4, h, fill=1, stroke=0)
    c.setFont("Helvetica", size); c.setFillColor(INK)
    ty = y - 17
    for ln in lines:
        c.drawString(MX + 17, ty, ln); ty -= 12.8
    return y - h


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Medbury Alameda SPV: the cost base in detail")
    total = sum(v for _n, v, _d in C.CAPEX)

    # 01 capital at a glance
    chrome(c, "capital")
    y = head(c, "NGN %s M of capital, and where every naira of it sits." % f(total))
    rows = [(n, d or "Whole building", f(v, 1), "%.0f%%" % (100 * v / total))
            for n, v, d in C.CAPEX]
    rows.append(("TOTAL CAPITAL REQUIREMENT", "", f(total, 1), "100%"))
    yy = table(c, ["Line", "Where it sits", "NGN M", "Share"], rows,
               [330, 260, 72, 62], MX, y - 8, rh=18.4, size=8.6,
               strong={len(rows) - 1}, align=["l", "l", "r", "r"])
    cw = (PAGE_W - 2 * MX - 3 * 16) / 4
    for i, (lbl, keys, nt) in enumerate(GROUPS):
        v = sum(CAPEX[k] for k in keys)
        cx = MX + i * (cw + 16)
        c.setFillColor(SURFACE); c.rect(cx, yy - 90, cw, 74, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(cx, yy - 19, cw, 3, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8.6); c.setFillColor(RED_D)
        c.drawString(cx + 12, yy - 36, lbl.upper())
        c.setFont(SERIF_B, 21); c.setFillColor(INK)
        c.drawString(cx + 12, yy - 60, "NGN %s M" % f(v, 0))
        c.setFont("Helvetica", 8); c.setFillColor(MUTED)
        c.drawString(cx + 12, yy - 74, "%.0f per cent of capital" % (100 * v / total))
        c.setFont("Helvetica", 7.8)
        c.drawString(cx + 12, yy - 85, nt)
    c.showPage()

    # 02 diagnostics schedule
    chrome(c, "equipment schedule")
    y = head(c, "The diagnostic hub is NGN %s M of it, and it is the part that earns."
             % f(sum(v for _n, v in LAB + IMG), 0))
    colw = (PAGE_W - 2 * MX - 30) / 2
    c.setFont("Helvetica-Bold", 9.4); c.setFillColor(RED_D)
    c.drawString(MX, y - 14, "LABORATORY, THE CHALET")
    c.drawString(MX + colw + 30, y - 14, "IMAGING AND CARDIOLOGY, GROUND FLOOR")
    lab = LAB + [("Laboratory total", sum(v for _n, v in LAB))]
    img = IMG + [("Imaging and cardiology total", sum(v for _n, v in IMG))]
    y1 = table(c, ["Item", "NGN M"], [(n, f(v, 1)) for n, v in lab],
               [colw - 66, 66], MX, y - 22, rh=19, size=8.8, strong={len(lab) - 1})
    y2 = table(c, ["Item", "NGN M"], [(n, f(v, 1)) for n, v in img],
               [colw - 66, 66], MX + colw + 30, y - 22, rh=19, size=8.8, strong={len(img) - 1})
    note(c, "Indicative at supplier list level, not yet quoted. Firmed at the bill of quantities "
            "with the site design in two weeks. The laboratory is the single largest line in the "
            "project and the one with the most room to move: a refurbished chemistry and "
            "immunoassay pair, or a reagent rental arrangement, moves NGN 87 M of day one capital "
            "into cost of sales.", min(y1, y2) - 14)
    c.showPage()

    # 03 clinical and systems schedule
    chrome(c, "equipment schedule")
    y = head(c, "Procedures, observation, dispensary and systems.")
    lst = [("Procedure suites and CSSD, first floor", PROC),
           ("Observation unit, 9 beds", OBS),
           ("Systems, furniture and dispensary", SYS)]
    x = MX
    cw = (PAGE_W - 2 * MX - 2 * 22) / 3
    bottoms = []
    for title, data in lst:
        c.setFont("Helvetica-Bold", 9); c.setFillColor(RED_D)
        c.drawString(x, y - 14, title.upper()[:44])
        d = data + [("Total", sum(v for _n, v in data))]
        bottoms.append(table(c, ["Item", "NGN M"], [(n, f(v, 1)) for n, v in d],
                             [cw - 58, 58], x, y - 22, rh=21, size=8.2,
                             strong={len(d) - 1}))
        x += cw + 22
    rows = [("Launch campaign", CAPEX["Launch campaign"]),
            ("Registration, licence and regulatory", CAPEX["Registration, licence and regulatory"]),
            ("Working capital: reagent, drug and consumable stock",
             CAPEX["Working capital"])]
    yy = min(bottoms) - 16
    c.setFont("Helvetica-Bold", 9); c.setFillColor(RED_D)
    c.drawString(MX, yy, "NOT EQUIPMENT, BUT STILL DAY ONE CASH")
    yb = table(c, ["Line", "NGN M", "Note"],
               [(n, f(v, 1), nt) for (n, v), nt in zip(rows, [
                   "Eight weeks either side of opening",
                   "FCT, MDCN, MLSCN, PCN, NAFDAC",
                   "A laboratory and a pharmacy carry stock before they bill"])],
               [330, 72, 300], MX, yy - 8, rh=19, size=8.6,
               align=["l", "r", "l"])
    note(c, "The procedure suites and the observation unit are the two lines that can be phased. "
            "Deferring the second suite and three of the nine beds holds back about NGN 25 M of "
            "day one capital, at the cost of turning work away in year two. The dispensary and "
            "the systems cannot be phased: the centre cannot open without a pharmacy or a "
            "laboratory information system.", yb - 16)
    c.showPage()

    # 04 establishment
    chrome(c, "establishment")
    y = head(c, "%d posts, NGN %s M a month loaded."
             % (sum(q for _n, q, _s in C.STAFF), f(B["fixed"] and
                sum(q * s for _n, q, s in C.STAFF) * (1 + C.ON_COSTS) / 1e6, 1)))
    gross = sum(q * s for _n, q, s in C.STAFF)
    rows = [(n, str(q), f(s), f(q * s), f(q * s * (1 + C.ON_COSTS)))
            for n, q, s in C.STAFF]
    rows.append(("TOTAL ESTABLISHMENT", str(sum(q for _n, q, _s in C.STAFF)), "",
                 f(gross), f(gross * (1 + C.ON_COSTS))))
    yy = table(c, ["Role", "Posts", "Gross each", "Gross a month", "Loaded a month"],
               rows, [300, 58, 96, 110, 118], MX, y - 8, rh=19, size=8.8,
               strong={len(rows) - 1})
    note(c, "Gross salary is grossed up %.0f per cent for the employer stack: pension at 10 per "
            "cent, the thirteenth month at 8.3, NSITF, ITF, group life and staff health cover. "
            "That is NGN %s M a month of on-costs on top of the NGN %s M payroll, and NGN %s M a "
            "year. No clinicians sit in this table. Consultants are paid %.0f per cent of the "
            "consultation fee they generate and carry no establishment cost, which is what keeps "
            "the fixed base survivable in a slow ramp."
         % (100 * C.ON_COSTS, f(gross * C.ON_COSTS / 1e6, 1), f(gross / 1e6, 1),
            f(gross * C.ON_COSTS * 12 / 1e6, 0), 100 * C.DOCTOR_FEE_LOCAL), yy - 14)
    note(c, "Not all of it starts on day one. The model carries %.0f per cent of the fixed base "
            "through the %d fit-out months, NGN %s M in total, for the management, laboratory and "
            "concierge posts that have to be in place before the doors open. That pre-opening "
            "burn sits inside the NGN %s M funding requirement, not outside it."
         % (100 * U.PRE_OPEN_SHARE, U.OPEN_M - 1,
            f((U.OPEN_M - 1) * B["fixed"] * U.PRE_OPEN_SHARE / 1e6, 0), f(B["trough"])),
         yy - 14 - 66)
    c.showPage()

    # 05 the variable stack
    chrome(c, "variable cost")
    y = head(c, "What one patient costs, and the rate behind each line.")
    rows = []
    for lbl, driver, key in DRIVERS:
        v = UN["cost"][key]
        rows.append((lbl, driver, f(v), "%.1f%%" % (100 * v / UN["revenue"])))
    rows.append(("DIRECT COST PER PATIENT", "", f(UN["direct"]),
                 "%.1f%%" % (100 * UN["direct"] / UN["revenue"])))
    rows.append(("CONTRIBUTION PER PATIENT", "", f(UN["contribution"]),
                 "%.0f%%" % UN["margin"]))
    yy = table(c, ["Cost line", "The rate it is struck at", "NGN", "Of revenue"],
               rows, [250, 292, 96, 90], MX, y - 8, rh=20, size=9,
               strong={len(rows) - 2, len(rows) - 1},
               align=["l", "l", "r", "r"])
    note(c, "Nothing in this table is a fixed cost. If nobody comes through the door, none of it "
            "is incurred. The executive health package carries one variable line only, the workup "
            "inside it at %.0f per cent of the NGN %s ticket, which is why it contributes NGN %s "
            "and is worth chasing harder than walk-in volume."
         % (100 * C.EXEC_CONSUMABLES, f(C.EXEC_TICKET), f(B["exec_unit"]["contribution"])),
         yy - 16)
    c.showPage()

    # 06 the fixed base over five years
    chrome(c, "fixed cost")
    y = head(c, "The fixed base: NGN %s M a month at opening, NGN %s M a year by year five."
             % (f(B["fixed"] / 1e6, 1), f(M["opex"][4], 0)), size=18)
    lines = [("Occupancy, %s sqm at NGN %s a sqm" % (f(C.SQM, 1), f(C.OCC_RATE)),
              [C.SQM * C.OCC_RATE / 1e6 * (1 + C.OCC_ESC) ** i for i in range(5)]),
             ("Personnel, %d posts loaded" % sum(q for _n, q, _s in C.STAFF),
              M["personnel"]),
             ("Marketing and demand generation", C.MARKETING),
             ("As-Salam consultant travel", C.TRAVEL_DOCTORS),
             ("Accommodation", C.ACCOMMODATION),
             ("Biomedical maintenance contracts", C.MAINTENANCE),
             ("Business travel", C.TRAVEL_BUSINESS),
             ("Office and administration", C.OFFICE),
             ("Contingency and miscellaneous", C.MISC),
             ("Licences and annual returns", C.LICENCES)]
    rows = [(n, f(v[0], 1), f(v[0] / 12, 1)) + tuple(f(v[i], 1) for i in range(1, 5))
            for n, v in lines]
    rows.append(("TOTAL OPERATING COST", f(M["opex"][0], 1), f(M["opex"][0] / 12, 1))
                + tuple(f(M["opex"][i], 1) for i in range(1, 5)))
    yy = table(c, ["Line", "Year 1", "Monthly", "Year 2", "Year 3", "Year 4", "Year 5"],
               rows, [300, 74, 74, 74, 74, 74, 74], MX, y - 8, rh=21, size=8.8,
               strong={len(rows) - 1})
    note(c, "Occupancy escalates %.0f per cent a year on the Lyfe Place all in rate, which covers "
            "rent, service charge, power and the common parts. Payroll is held flat in naira "
            "terms and will not be: assume a review in year two. Marketing steps up %.0f per cent "
            "a year, which is the minimum for a destination that has to be told about rather than "
            "walked past."
         % (100 * C.OCC_ESC, 100 * (C.MARKETING[4] / C.MARKETING[3] - 1)), yy - 14)
    c.showPage()

    # 07 accuracy
    chrome(c, "accuracy")
    y = head(c, "What this estimate is, and what it is not.")
    for i, (t, b) in enumerate([
        ("It is an AACE Class 4 estimate: minus 15 to plus 30 per cent.",
         "Built from supplier list levels and Nigerian cost benchmarks, not from quotations. On "
         "NGN %s M of capital that is a range of NGN %s M to NGN %s M. Take the top of the range "
         "into the funding conversation and be pleased if it comes in lower."
         % (f(total), f(total * 0.85), f(total * 1.30))),
        ("Three lines carry most of the estimating risk.",
         "The laboratory at NGN %s M, imaging and cardiology at NGN %s M and working capital at "
         "NGN %s M. The first two are import priced and move with the naira. The third is the one "
         "most often underestimated, because a laboratory buys reagents before it bills for a "
         "single test."
         % (f(sum(v for _n, v in LAB)), f(sum(v for _n, v in IMG)),
            f(CAPEX["Working capital"]))),
        ("It excludes the building works, which sit with the landlord.",
         "Partitions, power, cooling, medical gas, fire detection and the general fit are inside "
         "the Lyfe Place fit-out budget and are recovered through the NGN %s a sqm occupancy rate, "
         "not through this capital table. What is here is what the SPV owns and depreciates over "
         "%d years." % (f(C.OCC_RATE), C.DEP_YEARS)),
        ("It excludes the operating losses.",
         "Capital of NGN %s M is not the funding requirement. The SPV loses NGN %s M before it "
         "turns, and total funding to the deepest point is NGN %s M. That number, not this one, "
         "is what goes in the shareholder agreement."
         % (f(total), f(B["trough"] - B["capex"]), f(B["trough"]))),
    ]):
        yy = y - 10 - i * 88
        c.setFillColor(RED); c.rect(MX, yy - 4, 3, 28, fill=1, stroke=0)
        c.setFont(SERIF_B, 12.6); c.setFillColor(INK)
        c.drawString(MX + 15, yy + 11, t)
        ty = yy - 6
        c.setFont("Helvetica", 9.8); c.setFillColor(BODY)
        for ln in wrap(c, b, "Helvetica", 9.8, PAGE_W - 2 * MX - 20):
            c.drawString(MX + 15, ty, ln); ty -= 13
    c.showPage()
    c.save()
    print("wrote %s" % OUT.name)


if __name__ == "__main__":
    build()
