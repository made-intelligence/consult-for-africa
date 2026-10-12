"""
One page. The building, two ways, and what each returns to Medbury.

    python3 scripts/build-alameda-snapshot.py
"""
from __future__ import annotations
import sys
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lyfeplace_campus as LC
import medbury_alameda_centre as AC
from cfa_deck import SERIF, SERIF_B, SERIF_I, wrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "lyfeplace-abuja" / "alameda-snapshot.pdf"
LOGO = DOCS / "medbury-logo.png"

RED, RED_D = HexColor("#ED1C24"), HexColor("#B7141B")
DARK, INK, BODY = HexColor("#111114"), HexColor("#1A1A1E"), HexColor("#2B2B31")
MUTED, SURFACE, BLUSH = HexColor("#6E6E76"), HexColor("#F4F4F6"), HexColor("#FDF1F1")
NAVY = HexColor("#16304A")
PAGE_W, PAGE_H = landscape(A4)
MX = 42
m = lambda x, d=0: ("{:,.%df}" % d).format(x)

L = LC.build(); LMET = LC.metrics(L["cash"]); lrr = lambda k: L[k][-1] * 12
A = AC.build(); AMET = AC.metrics(A)
RENT = A["occupancy"][4]
CAMPUS_EB_MP = RENT - LC.HEAD_RENT - 120.0
TO_MED_CM = lrr("attr_eb")
TO_MED_MP = CAMPUS_EB_MP + AMET["medbury"][4]
CAP_CM, CAP_MP = 523.0, 237.2 + AMET["capex"] * AC.MEDBURY_SHARE


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Lyfe Place Abuja: the building, two ways")
    c.setFillColor(DARK); c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)
    try:
        img = ImageReader(str(LOGO)); iw, ih = img.getSize()
        c.drawImage(img, PAGE_W - MX - 22 * iw / ih, PAGE_H - 52, width=22 * iw / ih, height=22, mask="auto")
    except Exception:
        pass
    c.setFillColor(RED); c.rect(MX, PAGE_H - 40, 24, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 9.6); c.setFillColor(RED_D)
    c.drawString(MX + 32, PAGE_H - 43, "SNAPSHOT")
    c.setFont(SERIF_B, 25); c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 78, "The building, two ways. They are mutually exclusive.")
    c.setFont("Helvetica", 10.4); c.setFillColor(BODY)
    c.drawString(MX, PAGE_H - 96,
                 "The campus plan lets Alameda 113 sqm and keeps the rest. The medical plan "
                 "gives Medbury Alameda the whole building. Both cannot happen.")

    colw = (PAGE_W - 2 * MX - 20) / 2
    for k, (title, sub, rows, tone) in enumerate([
        ("THE CAMPUS MODEL", "Alameda is a tenant on 113 sqm. Medbury keeps the rest.",
         [("What occupies it", "Six businesses. Sessional rooms upstairs for 45 visiting\nconsultants, four clinical OpCos, diagnostics in the\nchalet, pharmacy in the boys' quarters"),
          ("Revenue in the building", "NGN %s M" % m(lrr("group_rev"))),
          ("Campus company EBITDA", "NGN %s M" % m(lrr("campus_eb"))),
          ("Clinics, Medbury share", "NGN %s M" % m(TO_MED_CM - lrr("campus_eb"))),
          ("TO MEDBURY, YEAR 5", "NGN %s M" % m(TO_MED_CM)),
          ("Medbury capital", "NGN %s M" % m(CAP_CM)),
          ("Return on that capital", "%.1f times a year" % (TO_MED_CM / CAP_CM)),
          ("Control", "100% of the campus company, 51 to 100% of\nthe four clinical companies")], NAVY),
        ("THE MEDICAL PLAN", "Medbury Alameda occupies all 664.3 sqm. Medbury owns 49%.",
         [("What occupies it", "One centre. Ground floor public and diagnostic, first\nfloor clinics, procedures and 9 observation beds,\nchalet a full laboratory, boys' quarters engineering"),
          ("Revenue in the building", "NGN %s M" % m(A["revenue"][4])),
          ("Campus company EBITDA", "NGN %s M, rent only" % m(CAMPUS_EB_MP)),
          ("Centre, Medbury 49% share", "NGN %s M" % m(AMET["medbury"][4])),
          ("TO MEDBURY, YEAR 5", "NGN %s M" % m(TO_MED_MP)),
          ("Medbury capital", "NGN %s M" % m(CAP_MP)),
          ("Return on that capital", "%.1f times a year" % (TO_MED_MP / CAP_MP)),
          ("Control", "100% of the landlord, 49% of the operating\nbusiness. A minority of the thing that earns")], RED_D),
    ]):
        x = MX + k * (colw + 20)
        y = PAGE_H - 122
        c.setFillColor(tone); c.rect(x, y - 30, colw, 30, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 11); c.setFillColor(white)
        c.drawString(x + 12, y - 13, title)
        c.setFont("Helvetica", 8.4); c.setFillColor(HexColor("#D8D8E0"))
        c.drawString(x + 12, y - 25, sub)
        yy = y - 30
        for i, (lab, val) in enumerate(rows):
            hi = lab.startswith("TO MEDBURY")
            lines = val.split("\n")
            h = max(len(lines) * 11.6 + 10, 24)
            if hi:
                c.setFillColor(BLUSH); c.rect(x, yy - h, colw, h, fill=1, stroke=0)
                c.setFillColor(RED); c.rect(x, yy - h, 3, h, fill=1, stroke=0)
            elif i % 2 == 0:
                c.setFillColor(SURFACE); c.rect(x, yy - h, colw, h, fill=1, stroke=0)
            c.setFont("Helvetica-Bold" if hi else "Helvetica", 8.6)
            c.setFillColor(INK if hi else MUTED)
            c.drawString(x + 12, yy - 15, lab)
            ty = yy - 15
            for ln in lines:
                c.setFont("Helvetica-Bold" if hi or len(lines) == 1 else "Helvetica",
                          10.6 if hi else 8.8)
                c.setFillColor(RED_D if hi else BODY)
                c.drawRightString(x + colw - 12, ty, ln)
                ty -= 11.6
            yy -= h
        bottom = yy

    y = bottom - 18
    c.setFillColor(DARK); c.rect(MX, y - 74, PAGE_W - 2 * MX, 74, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, y - 74, 4, 74, fill=1, stroke=0)
    c.setFont(SERIF_B, 13); c.setFillColor(white)
    c.drawString(MX + 18, y - 22, "The medical plan returns more and controls less.")
    c.setFont("Helvetica", 9.4); c.setFillColor(HexColor("#C9C9D2"))
    txt = ("It is NGN %s M a year to Medbury against NGN %s M, on NGN %s M of capital against "
           "NGN %s M. But it is a minority stake in the business that earns it, and it deletes "
           "the sessional business, the four clinical companies, and diagnostics and pharmacy as "
           "companies Medbury owns outright. Decide which building you are financing before the "
           "fit-out is tendered, because the two need different rooms."
           % (m(TO_MED_MP), m(TO_MED_CM), m(CAP_MP), m(CAP_CM)))
    ty = y - 40
    for ln in wrap(c, txt, "Helvetica", 9.4, PAGE_W - 2 * MX - 36):
        c.drawString(MX + 18, ty, ln); ty -= 12.4

    c.setFillColor(RED); c.rect(MX, 24, 18, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7.4)
    c.drawString(MX, 14, "Lyfe Place Abuja   /   Medbury Healthcare Group   /   Private and confidential   "
                         "/   Year 5 run rate, NGN millions   /   Centre IRR %.0f%%, payback %.1f years on "
                         "NGN %s M of capital" % (100 * AMET["irr"], AMET["payback"], m(AMET["capex"])))
    c.showPage(); c.save()
    print("wrote %s" % OUT.name)


if __name__ == "__main__":
    build()
