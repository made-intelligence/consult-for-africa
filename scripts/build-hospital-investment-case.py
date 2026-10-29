"""
The case for the hospital business. Built for a principal deciding whether to
commit capital, not for someone learning how a hospital works.

The argument in one line: at Nigerian rates a hospital only beats a treasury
bill on one strategy and at one scale, and the whole question is whether you
can execute that strategy.

Every figure derives from the anatomy model in build-hospital-revenue-drivers.py,
so the two documents cannot disagree.

    python3 scripts/build-hospital-investment-case.py
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from reportlab.lib.colors import white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from cfa_deck import SERIF_B, SERIF_I, wrap
from medbury_deck import (BLUSH, BODY, DARK, FOOTER, INK, LIGHT, MUTED, MX, PAGE_H, PAGE_W,
                          RED, RED_D, SURFACE, TOTAL, bullets, bump, callout, chrome, heading,
                          logo, para, rule, table)

_s = importlib.util.spec_from_file_location("anat", HERE / "build-hospital-revenue-drivers.py")
A = importlib.util.module_from_spec(_s)
_s.loader.exec_module(A)

ROOT = HERE.parent
OUT = ROOT / "docs" / "hospital-investment-case.pdf"
FOOTER[0] = "The case for the hospital business   /   Private and confidential"

# ------------------------------------------------------------------ the market
TBILL, BOND_LO, BOND_HI, INFL = 15.89, 17.0, 19.0, 15.91
GROWTH, TAX, DA, MAINT, EXIT_X = 0.16, 0.30, 0.05, 0.03, 8.0
RAMP = [0.0, 0.0, 0.50, 0.80, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
MARG = [0, 0, 0.40, 0.78, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
DEBT, DRATE = 0.55, 0.14


def irr(cf, lo=-0.9, hi=3.0):
    for _ in range(300):
        mid = (lo + hi) / 2
        if sum(c / (1 + mid) ** i for i, c in enumerate(cf)) > 0:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def flows(beds, strat, debt=0.0):
    cap = A.CAPEX[beds]["total"]
    g = A.GRID[(beds, strat)]
    rev0, mar = g["rev"], g["pc"]
    out, op, ex = [], 0.0, 0.0
    for yr in range(11):
        c = 0.0
        if yr in (0, 1):
            c -= cap * 0.5 * (1 - debt)
        if yr >= 2:
            rv = rev0 * RAMP[yr] * (1 + GROWTH) ** (yr - 4 if yr > 4 else 0)
            eb = rv * mar * MARG[yr]
            c += eb - max(0.0, eb - rv * DA) * TAX - rv * MAINT
            if debt:
                c -= cap * debt * DRATE
            op += c if yr < 10 else 0
        if yr == 10:
            rv = rev0 * (1 + GROWTH) ** 6
            ex = rv * mar * EXIT_X - cap * debt
            op += c
            c += ex
        out.append(c)
    return out, op, ex


IRR_U = {(b, s): irr(flows(b, s)[0]) for b in A.SIZES for s in A.STRATS}
IRR_L = {(b, s): irr(flows(b, s, DEBT)[0]) for b in A.SIZES for s in A.STRATS}
CF, OPCASH, EXITV = flows(150, "High margin")
HEAD = A.GRID[(150, "High margin")]
CAP150 = A.CAPEX[150]["total"]
f = lambda v: "{:,.0f}".format(v)


def s01(c):
    bump()
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 110, 46, rev=True)
    c.setFillColor(white); c.setFont(SERIF_B, 38)
    c.drawString(MX, PAGE_H - 214, "The case for the")
    c.drawString(MX, PAGE_H - 258, "hospital business")
    c.setFillColor(RED); c.setFont(SERIF_I, 16)
    c.drawString(MX, PAGE_H - 288, "Whether it beats leaving the money in treasury bills.")
    rule(c, MX, PAGE_H - 308, 330, RED, 1.0)
    para(c, "A hospital is worth building on one strategy and at one scale. On every other "
            "combination the capital does better in a government bond. This is the case for the "
            "one that works, and the evidence that the others do not.",
         MX, PAGE_H - 336, 13, LIGHT, 540, 19)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.5)
    c.drawString(MX, 54, "October 2026   /   Prepared for Dr Itunu Akinware")


def s02(c):
    chrome(c, "The bar")
    y = heading(c, "The money already has somewhere safe to be.")
    table(c, [["What the capital can earn today", "Return", "Real return after inflation"],
              ["364-day treasury bill", "%.2f%%" % TBILL, "about 3%"],
              ["FGN bonds", "%.0f to %.0f%%" % (BOND_LO, BOND_HI), "2 to 2.5%"],
              ["Inflation", "%.2f%%" % INFL, ""]],
          MX, y - 24, [300, 150, PAGE_W - 2 * MX - 450], size=11.5, leading=15.5, pad=8)
    callout(c, MX, 176, PAGE_W - 2 * MX,
            "This is not the Nigeria of two years ago. Fixed income now pays a positive real "
            "return, with no construction, no regulator, no clinical risk and no management. Any "
            "hospital has to beat %.0f per cent before it has earned the right to exist."
            % BOND_HI, size=12, leading=16)


def s03(c):
    chrome(c, "The answer")
    y = heading(c, "A hospital clears it, but only one way.")
    bw = (PAGE_W - 2 * MX - 20) / 2
    for i, (big, lbl, bg) in enumerate([
            ("%.1f%%" % (IRR_U[(150, "High margin")] * 100),
             "unlevered ten year return, 150 beds on the top strategy", SURFACE),
            ("%.1f%%" % (IRR_L[(150, "High margin")] * 100),
             "with 55 per cent debt at 14 per cent", BLUSH)]):
        x = MX + i * (bw + 20)
        c.setFillColor(bg); c.roundRect(x, y - 150, bw, 122, 8, fill=1, stroke=0)
        c.setFillColor(RED); c.rect(x, y - 150, 4, 122, fill=1, stroke=0)
        c.setFillColor(INK); c.setFont(SERIF_B, 44)
        c.drawString(x + 26, y - 92, big)
        para(c, lbl, x + 26, y - 118, 11.5, MUTED, bw - 52, 15)
    table(c, [["", "This hospital", "The alternative"],
              ["Ten year return", "%.1f%% unlevered, %.1f%% levered"
               % (IRR_U[(150, "High margin")] * 100, IRR_L[(150, "High margin")] * 100),
               "%.0f to %.0f%% in an FGN bond" % (BOND_LO, BOND_HI)],
              ["What you own at the end", "An asset worth NGN %s M" % f(EXITV),
               "Your money back"],
              ["Pricing power", "Tariffs reprice with inflation", "Fixed coupon"]],
          MX, y - 176, [190, 280, PAGE_W - 2 * MX - 470], size=11, leading=14.6, pad=7,
          accent_last=False)


def s04(c):
    chrome(c, "The condition")
    WORD = {1: "One", 2: "Two", 3: "Three", 9: "Nine", 10: "Ten", 11: "Eleven", 12: "Twelve"}
    n_lose = sum(1 for k in IRR_U if IRR_U[k] * 100 < BOND_HI)
    y = heading(c, "%s of twelve ways to build it lose to a bond." % WORD[n_lose])
    rows = [["Unlevered ten year return"] + A.STRATS]
    for b in A.SIZES:
        rows.append(["%d beds" % b] + ["%.1f%%" % (IRR_U[(b, s)] * 100) for s in A.STRATS])
    end = table(c, rows, MX, y - 22, [206, 172, 172, PAGE_W - 2 * MX - 550],
                size=11, leading=14.6, pad=7, hi={4})
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.4)
    c.drawString(MX, end - 18, "Ten year hold, exit at %.0f times EBITDA. The bar is %.0f to %.0f "
                 "per cent." % (EXIT_X, BOND_LO, BOND_HI))
    callout(c, MX, end - 42, PAGE_W - 2 * MX,
            "Only %d of the twelve clear %.0f per cent, and both are the top strategy at a "
            "hundred beds or more. This is not an argument that hospitals are good businesses. It "
            "is an argument that one kind of hospital is, and that the difference between them is "
            "entirely in the operating." % (12 - n_lose, BOND_HI), size=11.5, leading=15.5)


def s05(c):
    chrome(c, "What the top strategy is")
    y = heading(c, "Four decisions, none of them capital.")
    lo, hi = A.SC[0], A.SC[2]
    table(c, [["The decision", "Loses to a bond", "Beats it", "Why it moves the number"],
              ["Length of stay", "%.1f days" % lo["alos"], "%.1f days" % hi["alos"],
               "The same beds carry %s more admissions" % f(hi["adm"] - lo["adm"])],
              ["Theatre throughput", f(lo["theatre"]), f(hi["theatre"]),
               "The largest line, and the one the capital was spent on"],
              ["Treating without admitting", "%s day cases" % f(lo["daycase"]),
               "%s day cases" % f(hi["daycase"]), "Volume that never needs a bed"],
              ["Diagnostics beyond your own patients", "%s tests" % f(lo["lab"]),
               "%s tests" % f(hi["lab"]), "The highest margin line in the building"]],
          MX, y - 24, [214, 130, 130, PAGE_W - 2 * MX - 474], size=10.6, leading=13.8, pad=6)
    callout(c, MX, 150, PAGE_W - 2 * MX,
            "Revenue per occupied bed-day moves from NGN %s to NGN %s on identical bricks. Netcare, "
            "listed and at scale, runs about NGN 948,000. The top strategy is not heroic. It is "
            "ordinary competence measured against a real operator."
            % (f(lo["perbd"]), f(hi["perbd"])), size=11.5, leading=15.5)


def s06(c):
    chrome(c, "Why now")
    y = heading(c, "The demand is already leaving the country.")
    bullets(c, [
        ("Nigerians spent about USD 685 million abroad on treatment last year.",
         "Up from 643 million the year before. Oncology, cardiology, nephrology and orthopaedics "
         "drive roughly sixty per cent of it, and oncology alone is about forty per cent of cases."),
        ("That spend is addressable and it is dollar priced.",
         "A patient who flies to India for a procedure is not price sensitive in naira. Capturing "
         "even a fraction of that at home is the single largest revenue pool in Nigerian "
         "healthcare."),
        ("The competition for it has just arrived.",
         "The African Medical Centre of Excellence opened in Abuja with Afreximbank and King's "
         "College, 170 beds moving to 500, five theatres, three cath labs. Three of the four "
         "specialties driving outbound spend are now answered in Abuja. Lagos is not."),
        ("Fixed income will not stay here.",
         "Today's positive real return is a function of a tight cycle. A hospital built now is "
         "priced against a bar that is unusually high, and it earns for thirty years.")],
        MX, y - 30, PAGE_W - 2 * MX - 60, size=11.6, leading=15.4)


def s07(c):
    chrome(c, "The cheque")
    y = heading(c, "What it costs, and how much of it you can avoid.")
    base = A.CAPEX[150]
    rows = [["Route", "Capex, NGN M", "Rent a year", "What it costs you"]]
    for nm, bm, em, lm, rent, note in A.ROUTES:
        tot = base["build"] * bm + base["equip"] * em + base["land"] * lm + base["wc"]
        rows.append([nm, f(tot), f(rent) if rent else "none", note])
    end = table(c, rows, MX, y - 22, [214, 110, 94, PAGE_W - 2 * MX - 418],
                size=10.4, leading=13.6, pad=6)
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.4)
    c.drawString(MX, end - 18, "150 beds. Building at NGN %s a square metre, equipment at published "
                 "list converted at NGN %s to the dollar." % (f(A.BUILD_RATE), f(A.FX)))
    callout(c, MX, end - 42, PAGE_W - 2 * MX,
            "The equipment is %.0f per cent of the cheque and it is priced in dollars. That is the "
            "real exposure in a Nigerian hospital build, and it is the one the refurbished and "
            "partnered routes exist to manage."
            % (base["equip"] / base["total"] * 100), size=11.5, leading=15.5)


def s08(c):
    chrome(c, "The shape")
    y = heading(c, "Two years of nothing, then it compounds.")
    bw = (PAGE_W - 2 * MX) / 11
    mx_v = max(abs(x) for x in CF[:10])
    zero = y - 150
    for i, v in enumerate(CF):
        x = MX + i * bw
        h = abs(v) / mx_v * 86 if i < 10 else 110
        c.setFillColor(RED if v > 0 else DARK)
        c.rect(x + 6, zero if v > 0 else zero - h, bw - 12, h, fill=1, stroke=0)
        c.setFillColor(MUTED); c.setFont("Helvetica", 8.4)
        c.drawCentredString(x + bw / 2, zero - h - 14 if v < 0 else zero - 14, "Y%d" % i)
    c.setFillColor(LIGHT); c.rect(MX, zero - 0.5, PAGE_W - 2 * MX, 1, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 9.4)
    c.drawCentredString(MX + 10 * bw + bw / 2, zero + 118, "exit")
    table(c, [["", "NGN M", "Share of everything the project returns"],
              ["Operating cash, years 2 to 10", f(OPCASH), "%.0f%%" % (OPCASH / (OPCASH + EXITV) * 100)],
              ["The asset at the end", f(EXITV), "%.0f%%" % (EXITV / (OPCASH + EXITV) * 100)]],
          MX, zero - 150, [264, 120, PAGE_W - 2 * MX - 384], size=11, leading=14.6, pad=7)


def s09(c):
    chrome(c, "What you are actually buying")
    y = heading(c, "Not a yield. An asset that reprices with inflation.")
    bullets(c, [
        ("%.0f per cent of the return is the asset, not the cash."
         % (EXITV / (OPCASH + EXITV) * 100),
         "A bond hands back the principal. A hospital at the end of ten years is worth NGN %s "
         "million on an eight times multiple, and that multiple is itself a function of how well "
         "it was run." % f(EXITV)),
        ("The revenue reprices and the coupon does not.",
         "Hospital tariffs move with inflation because the input costs do. A seventeen per cent "
         "bond bought today pays seventeen per cent in 2036 as well."),
        ("Leverage works here and nowhere else on the page.",
         "Debt lifts the top strategy from %.1f to %.1f per cent. On the middle strategy it adds "
         "nothing, and on the low one it is ruinous. Borrow against competence, not against a "
         "building." % (IRR_U[(150, "High margin")] * 100, IRR_L[(150, "High margin")] * 100)),
        ("It is the platform the rest of the group sits on.",
         "The theatre, the sterilising unit, the laboratory and the medical licence are what let "
         "an aesthetics, longevity and hair restoration business exist at all. That cluster earns "
         "NGN %s million a year at %.0f per cent and collects in cash on the day."
         % (f(A.CL_REV), A.CL_EBITDA / A.CL_REV * 100))],
        MX, y - 30, PAGE_W - 2 * MX - 60, size=11.6, leading=15.4)


def s10(c):
    chrome(c, "What has to be true")
    y = heading(c, "The case rests on four things, and they are checkable.")
    hi = A.SC[2]
    table(c, [["What must hold", "The number", "How exposed it is"],
              ["The top strategy is achievable",
               "NGN %s revenue per occupied bed-day" % f(hi["perbd"]),
               "Low. Netcare runs about NGN 948,000 while listed and regulated"],
              ["The margin is achievable", "%.1f%% EBITDA" % (hi["ebitda_pc"] * 100),
               "High. Netcare 18.6%, Life Healthcare 15.3%. This is the number to argue with"],
              ["The build cost holds", "NGN %s a square metre" % f(A.BUILD_RATE),
               "High. Judgement, not a quotation. Get it tendered before committing"],
              ["The exit multiple holds", "%.0f times EBITDA" % EXIT_X,
               "Moderate. Transactions at this EBITDA size print 8 to 10 times"]],
          MX, y - 24, [214, 190, PAGE_W - 2 * MX - 404], size=10.6, leading=13.8, pad=6)
    callout(c, MX, 150, PAGE_W - 2 * MX,
            "Two of the four are judgement rather than evidence. Tendering the build and stress "
            "testing the margin are a few weeks of work, and they are worth doing before the "
            "cheque rather than after it.", size=11.5, leading=15.5)


def s11(c):
    chrome(c, "What kills it")
    y = heading(c, "The risks, and what answers each one.")
    fx = A.MATERIALS * 0.6 * 0.20
    table(c, [["Risk", "What it costs", "What answers it"],
              ["The naira moves against equipment and reagents",
               "NGN %s M of EBITDA on a 20 per cent move" % f(fx),
               "Refurbished platform, partnered imaging, dollar-linked tariffs"],
              ["The operating strategy is not delivered", "The whole case. %.1f%% becomes %.1f%%"
               % (IRR_U[(150, "High margin")] * 100, IRR_U[(150, "Mid margin")] * 100),
               "This is the only risk that matters. Hire for it and measure it weekly"],
              ["Key clinicians leave", "NGN %s M of lines sit on a handful of people"
               % f(sum(A.rev(l) for l in A.LINES
                       if l[1] in ("Cardiac catheterisation", "Oncology day unit"))),
               "Equity, not salary. Build two deep in every anchored line"],
              ["Payers slow down", "Every 2 points of write-off is NGN %s M" % f(A.TOT * 0.02),
               "Cash and corporate mix, and the adjacent lines that collect same day"],
              ["Construction overruns", "Every month of delay is a month of the ramp",
               "Fixed price contract, and a conversion route if greenfield slips"]],
          MX, y - 24, [214, 230, PAGE_W - 2 * MX - 444], size=10.4, leading=13.6, pad=6)


def s12(c):
    bump()
    c.setFillColor(DARK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(RED); c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    logo(c, MX, PAGE_H - 104, 40, rev=True)
    c.setFillColor(white); c.setFont(SERIF_B, 29)
    c.drawString(MX, PAGE_H - 178, "What we are recommending")
    items = [("Build it, at a hundred beds or more",
              "Below that the capital cost per bed rises and the margin falls at the same time."),
             ("Commit to the top strategy before the first brick",
              "Short stay, heavy theatre, day case led, diagnostics sold beyond your own patients. "
              "The building does not create this. Management does."),
             ("Tender the build and stress the margin first",
              "The two numbers carrying the case are judgement. Two weeks of work converts them "
              "into evidence."),
             ("Fund it with debt, but only once the strategy is signed",
              "Leverage takes the top strategy to %.1f per cent and the low one to minus twenty."
              % (IRR_L[(150, "High margin")] * 100)),
             ("Build the adjacent lines into the plan from day one",
              "They need the hospital to exist, they earn %.0f per cent, and they collect in cash "
              "while the hospital waits ninety days." % (A.CL_EBITDA / A.CL_REV * 100))]
    yy = PAGE_H - 226
    for i, (lead, rest) in enumerate(items):
        c.setFillColor(RED); c.setFont("Helvetica-Bold", 12)
        c.drawString(MX, yy, "%d" % (i + 1))
        c.setFillColor(white); c.setFont("Helvetica-Bold", 12.5)
        c.drawString(MX + 20, yy, lead)
        yy -= 16
        for ln in wrap(c, rest, "Helvetica", 11, PAGE_W - 2 * MX - 80):
            c.setFillColor(LIGHT); c.setFont("Helvetica", 11)
            c.drawString(MX + 20, yy, ln)
            yy -= 14
        yy -= 11
    rule(c, MX, 92, 300, RED, 1.0)
    c.setFillColor(white); c.setFont(SERIF_B, 12)
    c.drawString(MX, 70, "Medbury Healthcare Group")
    c.setFillColor(MUTED); c.setFont("Helvetica", 9.2)
    c.drawString(MX, 54, "Full line by line model in the anatomy document.")


def build():
    seq = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12]
    TOTAL[0] = "%02d" % len(seq)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    for s in seq:
        s(c); c.showPage()
    c.setTitle("The case for the hospital business")
    c.setAuthor("Medbury Healthcare Group")
    c.save()
    print("wrote %s  (%d slides)" % (OUT, len(seq)))
    print("  unlevered %.1f%%  levered %.1f%%  vs bond %.0f-%.0f%%"
          % (IRR_U[(150, "High margin")] * 100, IRR_L[(150, "High margin")] * 100,
             BOND_LO, BOND_HI))


if __name__ == "__main__":
    build()
