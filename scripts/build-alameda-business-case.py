"""
The Alameda conversion clinic: the business case, for Medbury.

Alameda's own Kenya clinic plan, rebuilt for Abuja on Nigerian costs. Medbury
branded because Medbury is the 49 per cent shareholder deciding whether to put
money in, not the landlord making an offer.

Numbers come from scripts/alameda_clinic.py.

    python3 scripts/build-alameda-business-case.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
import alameda_clinic as A
from cfa_deck import SERIF, SERIF_B, SERIF_I, wrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "lyfeplace-abuja" / "alameda-conversion-clinic-business-case.pdf"
LOGO, LOGO_REV = DOCS / "medbury-logo.png", DOCS / "medbury-logo-reversed.png"

RED, RED_D = HexColor("#ED1C24"), HexColor("#B7141B")
DARK, INK, BODY = HexColor("#111114"), HexColor("#1A1A1E"), HexColor("#2B2B31")
MUTED, LIGHT = HexColor("#6E6E76"), HexColor("#C7C7CE")
SURFACE, BLUSH, IVORY = HexColor("#F4F4F6"), HexColor("#FDF1F1"), white
PAGE_W, PAGE_H = landscape(A4)
MX = 54
_N = [0]
TOTAL = "11"

M = A.build()
ME = A.metrics(M)
SCEN = A.scenario_table()
_SC = {r['label']: r for r in SCEN}
K = A.KENYA
m = lambda x, d=1: ("{:,.%df}" % d).format(x)
YR = ["Y1", "Y2", "Y3", "Y4", "Y5"]


def logo(c, x, y, h, rev=False):
    try:
        img = ImageReader(str(LOGO_REV if rev else LOGO))
        iw, ih = img.getSize()
        c.drawImage(img, x, y, width=h * iw / ih, height=h, mask="auto")
    except Exception:
        c.setFillColor(IVORY if rev else INK)
        c.setFont(SERIF_B, h * 0.6)
        c.drawString(x, y + h * 0.2, "MEDBURY")


def chrome(c, kicker):
    _N[0] += 1
    c.setFillColor(DARK); c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(MX, PAGE_H - 60, 26, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10.5); c.setFillColor(RED_D)
    c.drawString(MX + 36, PAGE_H - 63, kicker.upper())
    logo(c, PAGE_W - MX - 92, PAGE_H - 74, 22)
    c.setFillColor(RED); c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED); c.setFont("Helvetica", 8)
    c.drawString(MX, 19, "Alameda conversion clinic   /   Medbury Healthcare Group   /   Private and confidential")
    c.drawRightString(PAGE_W - MX, 19, "%s / %s" % (str(_N[0]).zfill(2), TOTAL))


def heading(c, text, y=PAGE_H - 112, size=23, color=INK, max_w=None):
    max_w = max_w or (PAGE_W - 2 * MX)
    c.setFont(SERIF_B, size); c.setFillColor(color)
    for line in wrap(c, text, SERIF_B, size, max_w):
        c.drawString(MX, y, line); y -= size + 8
    return y


def para(c, text, x, y, size, color, max_w, leading, font="Helvetica"):
    c.setFont(font, size); c.setFillColor(color)
    for ln in wrap(c, text, font, size, max_w):
        c.drawString(x, y, ln); y -= leading
    return y


def table(c, rows, x, y, col_w, size=10.6, leading=13.6, pad=8, accent_last=False):
    n = len(col_w); cy = y
    for i, r in enumerate(rows):
        cells = []
        for j in range(n):
            fnt = "Helvetica-Bold" if (i == 0 or j == 0) else "Helvetica"
            out = []
            for seg in str(r[j]).split("\n"):
                out.extend(wrap(c, seg, fnt, size, col_w[j] - 2 * pad))
            cells.append(out)
        h = max(len(cl) for cl in cells) * leading + pad * 1.6
        last = accent_last and i == len(rows) - 1
        if i == 0:
            c.setFillColor(DARK); c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, cy - h - 2, sum(col_w), 2, fill=1, stroke=0)
        elif last:
            c.setFillColor(BLUSH); c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
            c.setFillColor(RED); c.rect(x, cy - h, 4, h, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(SURFACE); c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
        cx = x
        for j in range(n):
            ty = cy - pad - leading + 4
            for ln in cells[j]:
                if i == 0:
                    c.setFont("Helvetica-Bold", size); c.setFillColor(IVORY)
                elif last:
                    c.setFont("Helvetica-Bold", size); c.setFillColor(INK if j == 0 else RED_D)
                else:
                    c.setFont("Helvetica-Bold" if j == 0 else "Helvetica", size)
                    c.setFillColor(INK if j == 0 else BODY)
                if j == 0:
                    c.drawString(cx + pad, ty, ln)
                else:
                    c.drawRightString(cx + col_w[j] - pad, ty, ln)
                ty -= leading
            cx += col_w[j]
        cy -= h
    return cy


def stat(c, x, y, w, big, label, note=""):
    c.setFillColor(SURFACE); c.rect(x, y - 92, w, 92, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(x, y - 92, w, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 26); c.setFillColor(INK)
    c.drawString(x + 14, y - 42, big)
    c.setFont("Helvetica-Bold", 9.4); c.setFillColor(RED_D)
    c.drawString(x + 14, y - 60, label.upper())
    if note:
        c.setFont("Helvetica", 8.6); c.setFillColor(MUTED)
        yy = y - 74
        for ln in wrap(c, note, "Helvetica", 8.6, w - 28):
            c.drawString(x + 14, yy, ln); yy -= 10.4


def note(c, text, y, bg=BLUSH, bar=RED):
    w = PAGE_W - 2 * MX
    lines = wrap(c, text, "Helvetica", 10.4, w - 34)
    h = len(lines) * 14 + 22
    c.setFillColor(bg); c.rect(MX, y - h, w, h, fill=1, stroke=0)
    c.setFillColor(bar); c.rect(MX, y - h, 4, h, fill=1, stroke=0)
    c.setFont("Helvetica", 10.4); c.setFillColor(INK)
    ty = y - 20
    for ln in lines:
        c.drawString(MX + 20, ty, ln); ty -= 14
    return y - h


def build():
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Alameda conversion clinic: the business case")
    c.setAuthor("Medbury Healthcare Group")

    # ---------------------------------------------------------------- cover
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 10, PAGE_W, 10, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 132, 34, rev=True)
    c.setFillColor(RED); c.rect(MX, 300, 44, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 40); c.setFillColor(IVORY)
    c.drawString(MX, 248, "The conversion clinic")
    c.setFont(SERIF_I, 19); c.setFillColor(HexColor("#C9C9D2"))
    c.drawString(MX, 216, "Alameda's Kenya plan, rebuilt for Abuja on Nigerian costs")
    c.setFont("Helvetica", 11); c.setFillColor(HexColor("#9A9AA6"))
    c.drawString(MX, 150, "Medbury Healthcare Group   /   49 per cent shareholder   /   Private and confidential")
    c.drawString(MX, 132, "Ground floor, Lyfe Place Abuja   /   %s sqm, five consulting rooms" % m(A.SQM))
    c.showPage()

    # ---------------------------------------------------------------- 01 what it is
    chrome(c, "what the business is")
    y = heading(c, "Not a clinic that refers. A clinic whose product is the referral.")
    y = para(c, "Alameda runs this model in Kenya already, and the deck they gave us is the same "
                "product in a different market. The consultation is not the business. The "
                "consultation is how you find the patient who needs an admission at Al Salam, and "
                "the admission is where the money is. Three revenue streams, and the third is "
                "four times the first.",
             MX, y - 6, 11.6, BODY, PAGE_W - 2 * MX - 220, 16)
    rows = [["Revenue stream", "Y1", "Y5", "What it actually is"],
            ["OP consultation", m(M["op_rev"][0], 0), m(M["op_rev"][4], 0),
             "A fee for seeing the patient. Local consultants at NGN %s, Al Salam consultants "
             "flying in at NGN %s" % (m(A.OP_LOCAL, 0), m(A.OP_FOREIGN, 0))],
            ["Diagnostic referral", m(M["diag_rev"][0], 0), m(M["diag_rev"][4], 0),
             "%.0f%% commission on the pre travel workup, ordered from Medbury Diagnostics in "
             "the chalet. Money that already stays inside the group" % (100 * A.DIAG_COMMISSION)],
            ["Inpatient referral", m(M["ip_rev"][0], 0), m(M["ip_rev"][4], 0),
             "%.0f%% of what the patient spends at Al Salam. This is the business"
             % (100 * A.IP_COMMISSION)],
            ["Total revenue, NGN M", m(M["revenue"][0], 0), m(M["revenue"][4], 0), ""]]
    table(c, rows, MX, y - 24, [138, 62, 62, PAGE_W - 2 * MX - 262], accent_last=True)
    c.showPage()

    # ---------------------------------------------------------------- 02 the one number
    chrome(c, "the one number")
    y = heading(c, "Everything turns on how many consultations become an admission.")
    y = para(c, "Alameda's Kenya plan books referral revenue of USD 204,120 in year one. At a %.0f "
                "per cent commission on a USD %s discharge, that is %.0f admissions against %s "
                "consultations. <b>A conversion of %.2f per cent.</b> It is the only number in "
                "their deck that is an observation rather than an assumption, and it is the "
                "number this whole case rests on."
             .replace("<b>", "").replace("</b>", "")
             % (100 * A.IP_COMMISSION, m(A.ARPD_USD, 0),
                204120.0 / (A.IP_COMMISSION * A.ARPD_USD), "{:,}".format(K["vol"][0]),
                100 * A.KENYA_CONVERSION),
             MX, y - 6, 11.6, BODY, PAGE_W - 2 * MX, 16)
    w = (PAGE_W - 2 * MX - 3 * 16) / 4
    for i, (big, lab, nt) in enumerate([
            ("%.2f%%" % (100 * A.KENYA_CONVERSION), "Kenya, observed",
             "What Alameda's own plan implies"),
            ("%.1f%%" % (100 * A.CONVERSION[0]), "Abuja year one",
             "We open below them and earn our way up"),
            ("%.1f%%" % (100 * A.CONVERSION[-1]), "Abuja year five",
             "Still inside what they have already done"),
            ("%.0f" % M["admissions"][4], "Admissions a year",
             "About %.0f a month travelling to Al Salam" % (M["admissions"][4] / 12))]):
        stat(c, MX + i * (w + 16), y - 30, w, big, lab, nt)
    note(c, "At half Kenya's conversion this is still a business: %.0f per cent IRR and capital "
            "back in %.1f years. With no commission at all it is not a business, it is a loss. "
            "The consultation and diagnostic lines do not cover the cost base, so the referral "
            "is not the upside on this clinic. It is the clinic. Ask Alameda for the cohort "
            "behind the 4.09 per cent before anyone signs: referred, travelled, paid."
         % (100 * _SC["Conversion half of Kenya"]["irr"],
            _SC["Conversion half of Kenya"]["payback"]), y - 150)
    c.showPage()

    # ---------------------------------------------------------------- 03 volume
    chrome(c, "volume")
    y = heading(c, "Five rooms, but a conversion clinic is not a polyclinic.")
    rows = [["", "Y1", "Y2", "Y3", "Y4", "Y5"],
            ["Consulting rooms in use", "1.5", "2.0", "2.5", "2.5", "2.5"],
            ["Consultations a room day", "8", "9", "9", "10", "10"],
            ["Local consultations", m(M["vol_local"][0], 0), m(M["vol_local"][1], 0),
             m(M["vol_local"][2], 0), m(M["vol_local"][3], 0), m(M["vol_local"][4], 0)],
            ["Al Salam consultants, 3 days a month", m(M["vol_foreign"][0], 0),
             m(M["vol_foreign"][1], 0), m(M["vol_foreign"][2], 0), m(M["vol_foreign"][3], 0),
             m(M["vol_foreign"][4], 0)],
            ["Total consultations", m(M["vol"][0], 0), m(M["vol"][1], 0), m(M["vol"][2], 0),
             m(M["vol"][3], 0), m(M["vol"][4], 0)],
            ["Admissions converted", m(M["admissions"][0], 0), m(M["admissions"][1], 0),
             m(M["admissions"][2], 0), m(M["admissions"][3], 0), m(M["admissions"][4], 0)]]
    y = table(c, rows, MX, y - 26, [250] + [(PAGE_W - 2 * MX - 250) / 5] * 5, accent_last=True)
    note(c, "Kenya runs two clinics to reach %s consultations. We reach %s from one, using half "
            "the rooms we are renting. The other two and a half rooms are headroom, not a "
            "forecast: if the conversion holds, they are the cheapest growth available, and if "
            "it does not, we have not built a cost base around them."
         % ("{:,}".format(K["vol"][0]), m(M["vol"][4], 0)), y - 24)
    c.showPage()

    # ---------------------------------------------------------------- 04 kenya vs abuja
    chrome(c, "why abuja is not kenya")
    y = heading(c, "Same product, two thirds of the cost base.")
    kn = lambda v: v * A.FX / 1e6
    rows = [["Year one", "Kenya, NGN M", "Abuja, NGN M", "Why it differs"],
            ["Revenue", m(kn(K["revenue"][0]), 0), m(M["revenue"][0], 0),
             "Kenya is two clinics. We are one, at Nigerian consultation prices"],
            ["Occupancy", m(kn(15280 + 2170 + 4463 + 6960), 0), m(M["occupancy"][0], 0),
             "One all in charge from the landlord. No separate rent, parking, service charge "
             "or utilities, because Lyfe Place already includes them"],
            ["Personnel", m(kn(36000), 0), m(M["personnel"][0], 0),
             "The same four posts. Nigerian salaries plus the %.0f per cent employer stack"
             % (100 * A.ON_COSTS)],
            ["Capital", m(kn(K["capex"]), 0), m(ME["capex"], 0),
             "Kenya buys its own fit-out. Ours is the landlord's and comes back through the rent, "
             "so we fund category B only"],
            ["EBITDA margin, Y1", "%.0f%%" % (100 * K["ebitda"][0] / K["revenue"][0]),
             "%.0f%%" % (100 * M["ebitda"][0] / M["revenue"][0]),
             "We open thinner because we ramp the conversion. By Y3 we are ahead"]]
    y = table(c, rows, MX, y - 26, [110, 96, 96, PAGE_W - 2 * MX - 302])
    note(c, "The whole difference is cost, not cleverness. Nigerian salaries are a third of the "
            "dollar cost Kenya carries, and the landlord funds the fit-out. That is why this "
            "returns more than Alameda's own plan on the same conversion rate, and it is the "
            "honest answer if they ask why our numbers look better than theirs.", y - 22)
    c.showPage()

    # ---------------------------------------------------------------- 05 P&L
    chrome(c, "the numbers")
    y = heading(c, "Five years, NGN millions.", size=21)
    rows = [[""] + YR]
    for lbl, k in [("OP consultation", "op_rev"), ("Diagnostic referral", "diag_rev"),
                   ("Inpatient referral", "ip_rev"), ("Total revenue", "revenue"),
                   ("Doctor fees and referral share", "doctor_fee"),
                   ("Gross margin", "gross"), ("Occupancy", "occupancy"),
                   ("Personnel", "personnel"), ("Operating cost, all in", "opex"),
                   ("EBITDA", "ebitda"), ("Depreciation", "dep"),
                   ("Net income", "net"), ("Free cash flow", "fcf")]:
        rows.append([lbl] + [m(M[k][i], 0) for i in range(5)])
    rows.append(["EBITDA margin"] + ["%.0f%%" % (100 * M["ebitda"][i] / M["revenue"][i])
                                     for i in range(5)])
    table(c, rows, MX, y - 18, [210] + [(PAGE_W - 2 * MX - 210) / 5] * 5,
          size=9.8, leading=12.2, pad=6, accent_last=True)
    c.showPage()

    # ---------------------------------------------------------------- 06 scenarios
    chrome(c, "scenarios")
    y = heading(c, "Ten ways this could go.", size=21)
    rows = [["Scenario", "Y1 EBITDA", "Y5 EBITDA", "Y5 margin", "IRR", "NPV", "Payback"]]
    for r in SCEN:
        rows.append([r["label"], m(r["y1"], 0), m(r["y5"], 0), "%.0f%%" % r["margin5"],
                     ("%.0f%%" % (100 * r["irr"])) if r["irr"] else "n/a",
                     m(r["npv"], 0), ("%.1f yr" % r["payback"]) if r["payback"] else "never"])
    table(c, rows, MX, y - 18, [232, 72, 72, 70, 60, 68, PAGE_W - 2 * MX - 574],
          size=9.4, leading=11.8, pad=5.4)
    c.showPage()

    # ---------------------------------------------------------------- 07 what it says
    chrome(c, "what the scenarios say")
    y = heading(c, "The commission is not the upside. It is the business.")
    half, none_ = _SC["Conversion half of Kenya"], _SC["No referral line at all"]
    up, sev = _SC["Upside: 3 rooms, 5% conversion"], _SC["Severe: half conversion and 25% less volume"]
    fxd, fxu = _SC["Naira strengthens to 1,240"], _SC["Naira weakens to 2,015"]
    for i, (t, b) in enumerate([
        ("It survives being wrong about the conversion.",
         "At 2.0 per cent, half what Kenya has already done, it still returns %.0f per cent and "
         "returns the capital in %.1f years. Cutting the commission to 10 per cent returns %.0f "
         "per cent. Neither of those is a reason not to do it."
         % (100 * half["irr"], half["payback"], 100 * _SC["Commission cut to 10 per cent"]["irr"])),
        ("It does not survive losing the referral.",
         "With no commission the clinic loses NGN %.0f M a year by year five on NGN %.0f M of "
         "revenue. The consultation gives %.0f per cent away to the consultant and the cost base "
         "is NGN %.0f M. There is no version of this that works as an outpatient clinic."
         % (-none_["y5"], none_["rev5"], 100 * A.DOCTOR_FEE_LOCAL, M["opex"][4])),
        ("Two things wrong at once is the real risk.",
         "Half the conversion on its own is survivable. Half the conversion with 25 per cent less "
         "volume is a %.0f per cent IRR and the capital never comes back. The downsides are not "
         "independent: thin volume and weak conversion arrive together, because both mean the "
         "proposition is not landing." % (100 * sev["irr"])),
        ("The naira cuts both ways and nobody controls it.",
         "The referral line is dollar linked and every cost is naira. At 1,240 the IRR is %.0f per "
         "cent, at 2,015 it is %.0f per cent. That spread is wider than most of the operating "
         "assumptions in this deck and none of it is management skill."
         % (100 * fxd["irr"], 100 * fxu["irr"])),
    ]):
        yy = y - 18 - i * 88
        c.setFillColor(RED); c.rect(MX, yy - 4, 3, 30, fill=1, stroke=0)
        c.setFont(SERIF_B, 13.4); c.setFillColor(INK)
        c.drawString(MX + 16, yy + 12, t)
        para(c, b, MX + 16, yy - 6, 10.4, BODY, PAGE_W - 2 * MX - 20, 13.6)
    c.showPage()

    # ---------------------------------------------------------------- 08 returns
    chrome(c, "returns")
    y = heading(c, "Capital back inside two years.")
    w = (PAGE_W - 2 * MX - 3 * 16) / 4
    for i, (big, lab, nt) in enumerate([
            ("NGN %s M" % m(ME["capex"], 0), "Capital", "Category B only. The landlord funds the fit-out"),
            ("%.0f%%" % (100 * ME["irr"]), "IRR", "Five years, no terminal value"),
            ("NGN %s M" % m(ME["npv"], 0), "NPV at %.0f%%" % (100 * A.DISCOUNT), "Naira nominal hurdle"),
            ("%.1f yrs" % ME["payback"], "Payback", "From opening, not from instruction")]):
        stat(c, MX + i * (w + 16), y - 16, w, big, lab, nt)
    rows = [["", "Y1", "Y2", "Y3", "Y4", "Y5"],
            ["Free cash flow"] + [m(M["fcf"][i], 0) for i in range(5)],
            ["Net income"] + [m(M["net"][i], 0) for i in range(5)],
            ["To Medbury at %.0f%%" % (100 * A.MEDBURY_SHARE)] + [m(v, 0) for v in ME["medbury"]]]
    y = table(c, rows, MX, y - 132, [210] + [(PAGE_W - 2 * MX - 210) / 5] * 5, accent_last=True)
    note(c, "Medbury's %.0f per cent of net income is NGN %s M over five years, against a %.0f "
            "per cent share of the NGN %s M capital, which is NGN %s M in. The clinic also pays "
            "us NGN %s M of rent in year one as its landlord, rising with the lease. Both sides "
            "of that are ours and they should be read together."
         % (100 * A.MEDBURY_SHARE, m(sum(ME["medbury"]), 0), 100 * A.MEDBURY_SHARE,
            m(ME["capex"], 0), m(ME["capex"] * A.MEDBURY_SHARE, 0), m(M["occupancy"][0], 0)),
         y - 22)
    c.showPage()

    # ---------------------------------------------------------------- 09 assumptions
    chrome(c, "assumptions")
    y = heading(c, "Every driver, and where it came from.", size=21)
    rows = [["Driver", "Value", "Source"],
            ["Commission from Al Salam", "%.0f%%" % (100 * A.IP_COMMISSION),
             "Confirmed with Alameda. The single largest line in the model"],
            ["Average revenue per discharge", "USD %s" % m(A.ARPD_USD, 0), "Alameda Kenya plan"],
            ["Conversion to admission", "%.1f%% to %.1f%%" % (100 * A.CONVERSION[0], 100 * A.CONVERSION[-1]),
             "Kenya implies %.2f%%. We open below it. UNVERIFIED, and the one to test"
             % (100 * A.KENYA_CONVERSION)],
            ["Local consultation", "NGN %s" % m(A.OP_LOCAL, 0),
             "Medipark consultant survey, n=20: 26%% charge 25 to 50k"],
            ["Al Salam consultation", "NGN %s" % m(A.OP_FOREIGN, 0), "Premium for a visiting international consultant"],
            ["Pre travel workup", "%.0f%% of patients, NGN %s" % (100 * A.DIAG_SHARE, m(A.DIAG_SPEND, 0)),
             "Bloods, imaging, cardiac. Commission %.0f%% from Medbury Diagnostics" % (100 * A.DIAG_COMMISSION)],
            ["Doctor fee", "%.0f%% local, %.0f%% foreign" % (100 * A.DOCTOR_FEE_LOCAL, 100 * A.DOCTOR_FEE_FOREIGN),
             "Alameda Kenya plan, unchanged"],
            ["Occupancy", "NGN %s M, +%.0f%% a year" % (m(M["occupancy"][0], 1), 100 * A.OCCUPANCY_ESC),
             "%s sqm at NGN %s all in, from the Lyfe Place rate card" % (m(A.SQM), m(A.OCC_RATE, 0))],
            ["Employer on-costs", "%.0f%%" % (100 * A.ON_COSTS),
             "Pension, 13th month, NSITF, ITF, group life, HMO"],
            ["FX", "USD/NGN %s" % m(A.FX, 0), "Reference rate across the pack"]]
    table(c, rows, MX, y - 18, [178, 128, PAGE_W - 2 * MX - 306], size=9.8, leading=12.4, pad=6)
    c.showPage()

    # ---------------------------------------------------------------- 10 risk
    chrome(c, "what would break it")
    y = heading(c, "One assumption carries the case, and it is not ours.")
    rows = [["Risk", "Impact", "What to do about it"],
            ["The conversion rate is lower than Kenya's", "Severe",
             "Ask for the Kenya cohort now: referred, travelled, paid. Structure the first year "
             "so the clinic covers its costs on consultation and diagnostics alone"],
            ["Patients are referred but do not travel", "Severe",
             "Visa, cost and family friction all sit between the referral and the admission. "
             "Commission is earned on arrival, so this is pure leakage"],
            ["Al Salam does not pay on time", "High",
             "The commission is a receivable on a foreign hospital. Net 30 in the agreement, "
             "with a reconciliation the clinic can audit"],
            ["Naira strengthens", "Medium",
             "The referral line is dollar linked and the cost base is naira. A stronger naira "
             "cuts revenue and not costs. A weaker one is a tailwind"],
            ["Medical tourism attracts scrutiny", "Medium",
             "Referring patients abroad for money is a reputational question in a market that "
             "wants capacity built at home. The diagnostics and consultation lines are the "
             "defensible part of the story"]]
    table(c, rows, MX, y - 26, [230, 78, PAGE_W - 2 * MX - 308], size=10, leading=13, pad=7)
    c.showPage()

    # ---------------------------------------------------------------- 11 ask
    chrome(c, "what we need")
    y = heading(c, "Three things before anyone signs.")
    rows = [["", "What", "Why"],
            ["1", "The Kenya conversion cohort",
             "How many of the %s consultations were referred, how many travelled, how many paid. "
             "The %.2f per cent is the case and we are taking it on trust"
             % ("{:,}".format(K["vol"][0]), 100 * A.KENYA_CONVERSION)],
            ["2", "The commission agreement with Al Salam, in writing",
             "%.0f per cent of what, measured how, paid when, audited by whom. A commission on a "
             "foreign hospital's billing is only as good as the reconciliation behind it"
             % (100 * A.IP_COMMISSION)],
            ["3", "Who funds the NGN %s M of category B" % m(ME["capex"], 0),
             "Medbury at %.0f per cent is NGN %s M. The lease and the shareholding are two "
             "different conversations and they should not be settled in one meeting"
             % (100 * A.MEDBURY_SHARE, m(ME["capex"] * A.MEDBURY_SHARE, 0))]]
    y = table(c, rows, MX, y - 26, [40, 250, PAGE_W - 2 * MX - 290], size=10.4, leading=13.4)
    note(c, "On the numbers as they stand this is a good business: NGN %s M of capital, %.0f per "
            "cent IRR, capital back in %.1f years, and NGN %s M of net income to Medbury over "
            "five years on top of the NGN %s M a year it pays us in rent. But it is one "
            "assumption deep, and that assumption is Alameda's, not ours."
         % (m(ME["capex"], 0), 100 * ME["irr"], ME["payback"], m(sum(ME["medbury"]), 0),
            m(M["occupancy"][0], 0)), y - 24)
    c.showPage()
    c.save()
    print("wrote %s" % OUT.name)


if __name__ == "__main__":
    build()
