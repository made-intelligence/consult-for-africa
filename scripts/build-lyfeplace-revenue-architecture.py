"""
The revenue architecture of Lyfe Place Abuja, for Dr Itunu Akinware.

Not a forecast. The shape of the thing: where money comes from, which business
it belongs to, and what Medbury actually keeps once the minority stakes are off.

The finding: the campus is 37% of group revenue but 46% of what Medbury keeps,
because the platform earns a higher margin than the clinical operations and
Medbury owns all of it rather than part of it.

Figures are the stabilised twelve months from scripts/lyfeplace_campus.py.

    python3 scripts/build-lyfeplace-revenue-architecture.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))

import lyfeplace_campus as C
from cfa_deck import SERIF, SERIF_B, SERIF_I, wrap
from medbury_deck import (BLUSH, BODY, DARK, FOOTER, INK, IVORY, LIGHT, MUTED, MX,
                          PAGE_H, PAGE_W, RED, RED_D, SURFACE, TOTAL, bullets, bump,
                          callout, chrome, heading, logo, m, para, rule, table)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "lyfeplace-abuja" / "lyfeplace-revenue-architecture.pdf"

FOOTER[0] = "Lyfe Place Abuja   /   Private and confidential   /   For Dr Itunu Akinware"
TOTAL[0] = "07"

M = C.build()
ann = lambda v: sum(v[-12:])
RENT, SESS, THEA = ann(M["rent"]), ann(M["sessional_rev"]), ann(M["theatre_rev"])
CAMP_R, CAMP_E = ann(M["campus_rev"]), ann(M["campus_eb"])
OWN_R, OWN_E = ann(M["own_rev_tot"]), ann(M["own_eb_tot"])
GRP_R, GRP_E = CAMP_R + OWN_R, CAMP_E + OWN_E
KEEP = CAMP_E + sum(r[2] * r[6] for r in C.OWN_CLINICS)


def s01(c):
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, 0, 9, PAGE_H, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 108, 42, rev=True)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 40)
    c.drawString(MX, PAGE_H - 196, "The revenue architecture")
    c.setFillColor(RED); c.setFont(SERIF_I, 19)
    c.drawString(MX, PAGE_H - 232, "Where the money comes from, and what we keep.")
    rule(c, MX, PAGE_H - 258, 360, RED, 1.2)
    para(c, "Four engines, two businesses, one building. Stabilised figures, which the campus "
            "reaches in year three.", MX, PAGE_H - 288, 13, LIGHT, 470, 19)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    c.drawString(MX, 54, "Lyfe Place Abuja   /   October 2026   /   Private and confidential")


def s02(c):
    chrome(c, "The architecture")
    heading(c, "Four engines, two businesses.", size=22)
    ex, ey, ew, eh, gap = MX, PAGE_H - 268, 128, 54, 14
    engines = [("Rent", RENT, "Three tenants"), ("Sessional", SESS, "Rooms and membership"),
               ("Theatre", THEA, "Own and external lists"), ("Own clinics", OWN_R, "Four companies")]
    for i, (n, v, sub) in enumerate(engines):
        x = ex + i * (ew + gap)
        plat = i < 3
        c.setFillColor(SURFACE if plat else BLUSH)
        c.roundRect(x, ey, ew, eh, 6, fill=1, stroke=0)
        c.setFillColor(RED if not plat else RED_D); c.rect(x, ey, 4, eh, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont("Helvetica-Bold", 11.5)
        c.drawString(x + 14, ey + eh - 20, n)
        c.setFillColor(RED_D); c.setFont(SERIF_B, 15)
        c.drawString(x + 14, ey + eh - 40, m(v, 0))
        c.setFillColor(MUTED); c.setFont("Helvetica", 7.8)
        c.drawString(x + 14, ey + 8, sub)
    # the two businesses
    by = ey - 86
    total_w = ew * 4 + gap * 3
    camp_w = total_w * 0.6 - gap / 2
    clin_w = total_w - camp_w - gap
    for x0, w, lbl, rev, eb, note in [
            (ex, camp_w, "THE CAMPUS, a platform business", CAMP_R, CAMP_E,
             "Rent, rooms and theatre. Medbury owns all of it"),
            (ex + camp_w + gap, clin_w, "THE CLINICS, operating", OWN_R, OWN_E,
             "Four companies, two of them shared")]:
        c.setFillColor(DARK); c.roundRect(x0, by, w, 58, 6, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x0, by, 4, 58, fill=1, stroke=0)
        c.setFillColor(IVORY); c.setFont("Helvetica-Bold", 10.5)
        c.drawString(x0 + 14, by + 38, lbl)
        c.setFillColor(RED); c.setFont(SERIF_B, 13.5)
        c.drawString(x0 + 14, by + 18, "%s M revenue   /   %s M EBITDA"
                     % (m(rev, 0), m(eb, 0)))
        c.setFillColor(LIGHT); c.setFont("Helvetica", 7.6)
        c.drawString(x0 + 14, by + 6, note)
    c.setFillColor(INK); c.setFont(SERIF_B, 16)
    c.drawString(MX, by - 42, "Group  %s M revenue,  %s M EBITDA,  %.0f%% margin"
                 % (m(GRP_R, 0), m(GRP_E, 0), GRP_E / GRP_R * 100))
    c.setFillColor(MUTED); c.setFont("Helvetica", 9)
    c.drawString(MX, by - 60, "All figures NGN M a year, stabilised")


def s03(c):
    chrome(c, "The engines")
    y = heading(c, "What each one is, and how it behaves.")
    table(c, [["Engine", "NGN M", "What it is", "How it behaves"],
              ["Rent", m(RENT, 0), "Three tenants: the conversion clinic, diagnostics and the "
               "pharmacy", "Contracted. The floor under everything else"],
              ["Sessional", m(SESS, 0), "Room fees and membership from visiting consultants",
               "Recurring, and scales with the panel rather than with capital"],
              ["Theatre", m(THEA, 0), "Own lists, plus external surgeons paying by the list",
               "The highest value hour in the building, and the fastest to pay back"],
              ["Own clinics", m(OWN_R, 0), "Aesthetics, hair restoration, bariatric and metabolic, "
               "longevity and infusion", "Clinical revenue. Carries the staffing and the "
               "clinical risk"]],
          MX, y - 24, [110, 70, 240, PAGE_W - 2 * MX - 420], size=11.2, leading=14.6)
    callout(c, MX, 128, PAGE_W - 2 * MX,
            "The first three need no clinicians on our payroll. They are paid for space, time and "
            "equipment. The fourth is a different kind of business sitting in the same building.")


def s04(c):
    chrome(c, "Two businesses")
    y = heading(c, "They look alike and they are not.")
    table(c, [["", "The campus", "The clinics"],
              ["Revenue", "%s M" % m(CAMP_R, 0), "%s M" % m(OWN_R, 0)],
              ["EBITDA", "%s M" % m(CAMP_E, 0), "%s M" % m(OWN_E, 0)],
              ["Margin", "%.1f%%" % (CAMP_E / CAMP_R * 100), "%.1f%%" % (OWN_E / OWN_R * 100)],
              ["What it sells", "Space, time and equipment", "Clinical care"],
              ["Who it employs", "Reception, facilities, a booking team",
               "Doctors, nurses, clinical staff"],
              ["What can go wrong", "Rooms sit empty", "A clinical outcome, a key clinician leaving, "
               "a regulator"],
              ["Medbury's share", "All of it", "All of two, part of the other two"],
              ["Does it travel", "Yes. It is the template for the second site",
               "Each one has to be rebuilt"]],
          MX, y - 22, [150, 230, PAGE_W - 2 * MX - 380], size=11.5, leading=15, hi={2})
    callout(c, MX, 112, PAGE_W - 2 * MX,
            "<b>The platform earns a higher margin than the clinical operations, on less risk and "
            "with no clinicians on the payroll.</b> That is unusual and it is worth protecting.")


def s05(c):
    chrome(c, "What we keep")
    y = heading(c, "After the minority stakes, the picture changes.")
    rows = [["The campus", m(CAMP_E, 1), "100%", m(CAMP_E, 1)]]
    for r in C.OWN_CLINICS:
        rows.append([r[0], m(r[2], 1), "%.0f%%" % (r[6] * 100), m(r[2] * r[6], 1)])
    rows.append(["Attributable to Medbury", "", "", m(KEEP, 1)])
    table(c, rows, MX, y - 24, [250, 90, 80, PAGE_W - 2 * MX - 420],
          size=11.5, leading=15, accent_last=True,
          )
    callout(c, MX, 128, PAGE_W - 2 * MX,
            "<b>The campus is %.0f%% of group revenue but %.0f%% of what Medbury keeps.</b> It earns "
            "a better margin and we own every naira of it, while two of the four clinics are shared. "
            "The property business is quietly the better business."
            % (CAMP_R / GRP_R * 100, CAMP_E / KEEP * 100))


def s06(c):
    chrome(c, "Where the risk sits")
    y = heading(c, "The two halves fail in different ways.")
    table(c, [["", "What would hurt it", "What protects it"],
              ["Rent", "A tenant leaving or paying late",
               "Five year terms, six month deposits, and two of the three tenants are our own "
               "businesses"],
              ["Sessional", "The panel not filling. This is the single largest assumption in the "
               "plan", "Price to fill rather than to maximise. Founding rates held for three years"],
              ["Theatre", "Lists not booked, or the surgical anchor not signing",
               "Hold the capital until an anchor is signed, then it pays back inside a year"],
              ["Own clinics", "Clinical outcome, a key clinician leaving, regulatory action",
               "Each in its own company, so a problem in one does not reach the others"]],
          MX, y - 22, [110, 230, PAGE_W - 2 * MX - 340], size=11.2, leading=14.6)
    callout(c, MX, 118, PAGE_W - 2 * MX,
            "Putting each clinic in its own company is not tidiness. It is what stops a clinical "
            "problem in one business reaching the building, the tenants and the other three.",
            bg=SURFACE)


def s07(c):
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, 0, 9, PAGE_H, fill=1, stroke=0)
    bump()
    logo(c, MX, PAGE_H - 96, 32, rev=True)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 30)
    c.drawString(MX, PAGE_H - 168, "What follows from the shape")
    bullets(c, [("Protect the platform margin",
                 "Related party rents set at arm's length, and the clinics not allowed to crowd "
                 "sessional capacity out of the rooms they do not pay for."),
                ("Grow the platform before the clinics",
                 "A naira of platform EBITDA is worth more to Medbury than a naira in a clinic we "
                 "share, and it carries less risk to earn."),
                ("Gate the theatre on a signed anchor",
                 "It is the fastest payback in the building and the easiest to strand."),
                ("Build the first site to be copied",
                 "The rate card, the service model and the protocols are the asset. The second site "
                 "inherits them rather than inventing them.")],
            MX, PAGE_H - 218, PAGE_W - 2 * MX - 120, dark=True, size=13, leading=17)
    rule(c, MX, 118, 300, RED, 1.2)
    c.setFillColor(IVORY); c.setFont(SERIF_B, 13)
    c.drawString(MX, 96, "Medbury Healthcare Group")
    c.setFillColor(MUTED); c.setFont("Helvetica", 10.5)
    c.drawString(MX, 76, "Lyfe Place Abuja   /   Private and confidential")


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for s in (s01, s02, s03, s04, s05, s06, s07):
        s(c); c.showPage()
    c.setTitle("Lyfe Place Abuja: the revenue architecture")
    c.setAuthor("Medbury Healthcare Group")
    c.save()
    print("wrote %s" % OUT)


if __name__ == "__main__":
    build()
