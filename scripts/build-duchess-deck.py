"""
Build the Duchess International Hospital pitch deck.

Presentation against the hospital's Healthcare Risk Management terms of
reference, following our proposal of 30 March 2026. Landscape, slide per page,
house style. Primitives lifted from scripts/build-hsh-board-deck.py.

Run:
  python3 scripts/build-duchess-deck.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

_SUPP = "/System/Library/Fonts/Supplemental/"
SERIF, SERIF_B, SERIF_I = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"
try:
    pdfmetrics.registerFont(TTFont("Georgia", _SUPP + "Georgia.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", _SUPP + "Georgia Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Italic", _SUPP + "Georgia Italic.ttf"))
    SERIF, SERIF_B, SERIF_I = "Georgia", "Georgia-Bold", "Georgia-Italic"
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "duchess" / "duchess-pitch-deck-cfa.pdf"
LOGO = DOCS / "c4a-logo-reversed.png"

# ---- brand palette (source: docs/brand-guide-cfa.pdf) ----------------------
NAVY = HexColor("#0B3C5D")
DEEP_NAVY = HexColor("#081521")
GOLD = HexColor("#D4AF37")
TEAL = HexColor("#1F7A8C")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
SURFACE = HexColor("#F1F5F9")
LIGHT = HexColor("#C9D6E0")
CREAM = HexColor("#FBF6E6")

# ---- palette sampled from docs/c4a-icon.png -------------------------------
INK = HexColor("#182448")      # deepest chevron
IND = HexColor("#243060")      # chevron 1
IND2 = HexColor("#3C4878")     # chevron 2
IND3 = HexColor("#485484")     # chevron 3
SKY = HexColor("#6090C0")      # chevron 4, the light face
SAGE = HexColor("#CCD8C0")     # the dotted continent
SAGE_D = HexColor("#8FA383")
IVORY = HexColor("#FFFFFF")
RULE = HexColor("#DED9CE")

CHEVRONS = [(INK, 9.0), (IND2, 7.2), (IND3, 5.6), (SKY, 4.2)]


def chevron_stack(c, x, y, w, h, gap, colours=CHEVRONS, cap=1):
    """The mark's nested chevron, drawn as open strokes."""
    c.saveState()
    c.setLineCap(cap)
    c.setLineJoin(1)
    for i, (col, lw) in enumerate(colours):
        off = i * gap
        c.setStrokeColor(col)
        c.setLineWidth(lw)
        pth = c.beginPath()
        pth.moveTo(x, y - off)
        pth.lineTo(x + w / 2.0, y + h - off)
        pth.lineTo(x + w, y - off)
        c.drawPath(pth, stroke=1, fill=0)
    c.restoreState()


def hairline(c, x, y, w, col=RULE, lw=0.7):
    c.setStrokeColor(col)
    c.setLineWidth(lw)
    c.line(x, y, x + w, y)


def tracked(c, text, x, y, font, size, colour, track=2.2):
    """Letterspaced small caps label."""
    c.setFont(font, size)
    c.setFillColor(colour)
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + track
    return x


PAGE_W, PAGE_H = landscape(A4)   # 842 x 595
MX = 54
TOTAL = "28"


# ----------------------------------------------------------- helpers ---------
def wrap(c, text, font, size, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def para(c, text, x, y, font, size, color, max_w, leading):
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(c, text, font, size, max_w):
        c.drawString(x, y, line)
        y -= leading
    return y


_N = [1]


def chrome(c, kicker):
    _N[0] += 1
    n = _N[0]
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 9, PAGE_W, 3, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 60, 26, 3, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(TEAL)
    c.drawString(MX + 36, PAGE_H - 63, kicker.upper())
    c.setFillColor(GOLD)
    c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(MX, 19, "Consult for Africa   /   Confidential   /   Duchess International Hospital  /  Healthcare Risk Management")
    c.drawRightString(PAGE_W - MX, 19, "%s / %s" % (str(n).zfill(2), TOTAL))
    try:
        _ic = ImageReader(str(DOCS / "c4a-icon.png"))
        _iw, _ih = _ic.getSize()
        _h = 30.0
        _w = _h * _iw / _ih
        c.drawImage(_ic, PAGE_W - MX - _w, PAGE_H - 78, width=_w, height=_h, mask="auto")
    except Exception:
        pass


def heading(c, text, y=PAGE_H - 110, size=23, color=INK, max_w=None):
    max_w = max_w or (PAGE_W - 2 * MX)
    c.setFont(SERIF_B, size)
    c.setFillColor(color)
    leading = size + 8
    for line in wrap(c, text, SERIF_B, size, max_w):
        c.drawString(MX, y, line)
        y -= leading
    return y


def bullet_block(c, items, x, y, max_w, gap=14, size=12.5, leading=16.5,
                 lead_font="Helvetica-Bold", body_color=BODY, tick=GOLD):
    for lead, rest in items:
        c.setFillColor(tick)
        c.rect(x, y - 1, 7, 3, fill=1, stroke=0)
        tx = x + 18
        if lead:
            c.setFont(lead_font, size)
            c.setFillColor(NAVY)
            c.drawString(tx, y, lead)
            offset = c.stringWidth(lead + "  ", lead_font, size)
        else:
            offset = 0
        words = rest.split()
        cur, cy = "", y
        line_x = tx + offset
        avail = max_w - offset
        out_lines = []
        for w in words:
            trial = (cur + " " + w).strip()
            if c.stringWidth(trial, "Helvetica", size) <= avail:
                cur = trial
            else:
                out_lines.append((line_x, cur))
                cur = w
                line_x = tx
                avail = max_w
        if cur:
            out_lines.append((line_x, cur))
        for lx, ln in out_lines:
            c.setFont("Helvetica", size)
            c.setFillColor(body_color)
            c.drawString(lx, cy, ln)
            cy -= leading
        y = cy - gap
    return y


def callout(c, x, y, w, text, bg=SURFACE, spine=TEAL, fg=NAVY, pad=22,
            size=12.5, leading=17, font="Helvetica-Bold"):
    lines = wrap(c, text, font, size, w - 2 * pad)
    h = pad * 2 + leading * len(lines) - (leading - size)
    c.setFillColor(bg)
    c.roundRect(x, y - h, w, h, 8, fill=1, stroke=0)
    c.setFillColor(spine)
    c.rect(x, y - h, 5, h, fill=1, stroke=0)
    ty = y - pad - size + 3
    c.setFont(font, size)
    c.setFillColor(fg)
    for ln in lines:
        c.drawString(x + pad, ty, ln)
        ty -= leading
    return y - h


def box(c, x, y, w, h, fill, spine=None, spine_w=5):
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
    if spine:
        c.setFillColor(spine)
        c.rect(x, y, spine_w, h, fill=1, stroke=0)


# ----------------------------------------------------------- extras ---------
def simple_table(c, rows, x, y, col_w, size=11, leading=15, pad=9, head=True):
    """Two or three column table with a navy header and banded rows."""
    n = len(col_w)
    cy = y
    for i, r in enumerate(rows):
        cells = []
        for j in range(n):
            fnt = "Helvetica-Bold" if ((i == 0 and head) or (j == 0 and not (i == 0 and head))) else "Helvetica"
            out = []
            for seg in str(r[j]).split("\n"):
                out.extend(wrap(c, seg, fnt, size, col_w[j] - 2 * pad))
            cells.append(out)
        h = max(len(cl) for cl in cells) * leading + pad * 1.6
        if i == 0 and head:
            c.setFillColor(NAVY)
            c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
            c.setFillColor(GOLD)
            c.rect(x, cy - h - 2, sum(col_w), 2, fill=1, stroke=0)
        elif i % 2 == 0:
            c.setFillColor(SURFACE)
            c.rect(x, cy - h, sum(col_w), h, fill=1, stroke=0)
        cx = x
        for j in range(n):
            ty = cy - pad
            for ln in cells[j]:
                if i == 0 and head:
                    c.setFont("Helvetica-Bold", size)
                    c.setFillColor(white)
                else:
                    c.setFont("Helvetica-Bold" if j == 0 else "Helvetica", size)
                    c.setFillColor(NAVY if j == 0 else BODY)
                c.drawString(cx + pad, ty - size + 2, ln)
                ty -= leading
            cx += col_w[j]
        cy -= h
    return cy


# ----------------------------------------------------------- slides ----------
def risk_matrix(c, x, y, cell, gap=5):
    """A five by five risk matrix. Their own named methodology, used as artwork."""
    grade = [
        [SAGE, SAGE, SKY, SKY, IND3],
        [SAGE, SKY, SKY, IND3, IND2],
        [SKY, SKY, IND3, IND2, GOLD],
        [SKY, IND3, IND2, GOLD, GOLD],
        [IND3, IND2, GOLD, GOLD, INK],
    ]
    for r in range(5):
        for col in range(5):
            c.setFillColor(grade[r][col])
            c.roundRect(x + col * (cell + gap), y + r * (cell + gap), cell, cell, 2, fill=1, stroke=0)
    span = 5 * cell + 4 * gap
    tracked(c, "LIKELIHOOD", x, y - 17, "Helvetica-Bold", 6.4, SAGE_D, 2.0)
    c.saveState()
    c.translate(x - 15, y)
    c.rotate(90)
    tracked(c, "IMPACT", 0, 0, "Helvetica-Bold", 6.4, SAGE_D, 2.0)
    c.restoreState()
    return span


def slide_cover(c):
    c.setFillColor(IVORY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    try:
        img = ImageReader(str(DOCS / "c4a-logo.png"))
        iw, ih = img.getSize()
        dw = 166
        c.drawImage(img, MX, PAGE_H - 72, width=dw, height=dw * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFillColor(IND)
        c.setFont(SERIF_B, 15)
        c.drawString(MX, PAGE_H - 56, "CONSULT FOR AFRICA")

    # the client, in their own mark
    tracked(c, "PREPARED FOR", PAGE_W - MX - 214, PAGE_H - 42, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    try:
        dl = ImageReader(str(DOCS / "duchess" / "duchess-logo.png"))
        dw2 = 206
        diw, dih = dl.getSize()
        c.drawImage(dl, PAGE_W - MX - dw2, PAGE_H - 74, width=dw2, height=dw2 * dih / diw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFont(SERIF_B, 13)
        c.setFillColor(INK)
        c.drawRightString(PAGE_W - MX, PAGE_H - 62, "Duchess International Hospital")
    c.setFont(SERIF_I, 9.4)
    c.setFillColor(SAGE_D)
    c.drawRightString(PAGE_W - MX, PAGE_H - 84, "Ikeja GRA, Lagos")
    hairline(c, PAGE_W - MX - 214, PAGE_H - 95, 214, RULE, 0.7)

    hairline(c, MX, PAGE_H - 95, 300, RULE, 0.7)

    tracked(c, "TECHNICAL PRESENTATION  /  23 SEPTEMBER 2026", MX, PAGE_H - 132,
            "Helvetica-Bold", 7.6, GOLD, 2.4)

    c.setFont(SERIF, 29)
    c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 184, "Healthcare Risk Management")
    c.setFont(SERIF_B, 29)
    c.drawString(MX, PAGE_H - 220, "Framework and Implementation")

    hairline(c, MX, PAGE_H - 244, 404, GOLD, 1.2)

    para(c,
         "To develop, implement and embed a robust, proactive and integrated healthcare risk management "
         "system across the clinical, operational, financial and strategic domains of the Hospital.",
         MX, PAGE_H - 270, SERIF_I, 12.2, IND2, 404, 17.5)

    para(c,
         "In response to the Terms of Reference for the Engagement of a Healthcare Risk Management "
         "Consultant, and following our proposal of 30 March 2026.",
         MX, PAGE_H - 322, SERIF, 10.6, SAGE_D, 404, 15)

    # artwork: a five by five risk matrix, quiet, to the right
    risk_matrix(c, PAGE_W - MX - 190, 176, 34, 5)

    # the five stages, previewed, so the base of the page carries an idea
    sy = 168
    tracked(c, "THE ENGAGEMENT, IN FIVE STAGES", MX, sy + 26, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    stages = [("01", "Diagnose"), ("02", "Design"), ("03", "Deploy"), ("04", "Deliver"), ("05", "Transfer")]
    cols = [IND, IND2, IND3, SKY, SAGE_D]
    for i, (num, lab) in enumerate(stages):
        sx = MX + i * 88
        c.setStrokeColor(cols[i])
        c.setLineWidth(2.6)
        c.line(sx, sy + 14, sx + 68, sy + 14)
        c.setFont("Helvetica-Bold", 6.6)
        c.setFillColor(cols[i])
        c.drawString(sx, sy, num)
        c.setFont(SERIF_B, 10.4)
        c.setFillColor(INK)
        c.drawString(sx + 16, sy, lab)

    hairline(c, MX, 104, PAGE_W - 2 * MX, RULE, 0.7)
    c.setFont(SERIF_B, 10.4)
    c.setFillColor(INK)
    c.drawString(MX, 84, "Presented by Dr Debo Odulana")
    c.setFont("Helvetica", 9)
    c.setFillColor(SAGE_D)
    c.drawString(MX, 69, "Founding Partner, Consult for Africa")
    c.drawRightString(PAGE_W - MX, 84, "hello@consultforafrica.com   /   +234 913 813 8553")
    c.drawRightString(PAGE_W - MX, 69, "consultforafrica.com   /   Confidential")


def slide_roadmap(c):
    chrome(c, "How this is organised")
    heading(c, "What we will take you through")
    para(c, "Twenty eight slides, built to be read without us as well as presented. If time is short, the six marked "
            "in gold carry the argument.",
         MX, PAGE_H - 150, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 30, 15.5)
    secs = [
        ("01", "What you asked for, your risk surface, and why systems go quiet", "03 to 06", True),
        ("02", "Our philosophy: total quality management", "07", True),
        ("03", "Method: how risk is found, scored and kept alive", "08 to 15", True),
        ("04", "The plan, the work schedule, and coverage of your terms of reference", "16 to 18", False),
        ("05", "Delivery risk, track record, clients and key personnel", "19 to 24", True),
        ("06", "Investment", "25", True),
        ("07", "Your evaluation criteria, and what happens next", "26 to 27", True),
    ]
    y = PAGE_H - 206
    for num, lab, pages, core in secs:
        col = GOLD if core else RULE
        c.setFillColor(col)
        c.rect(MX, y - 4, 4, 30, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(SAGE_D)
        c.drawString(MX + 18, y + 14, num)
        c.setFont(SERIF_B, 13)
        c.setFillColor(INK)
        c.drawString(MX + 44, y + 12, lab)
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawString(MX + 44, y, "slides " + pages)
        hairline(c, MX, y - 12, PAGE_W - 2 * MX, RULE, 0.6)
        y -= 46


def slide_gantt(c):
    chrome(c, "Work plan")
    heading(c, "The work plan, week by week")
    para(c, "Twelve weeks to build and activate, then three months of embedding and independent assurance, inside the "
            "six months your terms of reference set.",
         MX, PAGE_H - 150, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 30, 15.5)

    lx, rx = MX + 196, PAGE_W - MX
    units = 15
    uw = (rx - lx) / units
    top = PAGE_H - 200

    c.setFont("Helvetica-Bold", 6.6)
    for i in range(12):
        c.setFillColor(MUTED)
        c.drawCentredString(lx + uw * (i + 0.5), top + 8, "W%d" % (i + 1))
    for i, m in enumerate(["M4", "M5", "M6"]):
        c.setFillColor(SAGE_D)
        c.drawCentredString(lx + uw * (12 + i + 0.5), top + 8, m)
    c.setStrokeColor(RULE); c.setLineWidth(0.6)
    c.line(lx, top + 2, rx, top + 2)
    c.setStrokeColor(SAGE_D); c.setLineWidth(0.8); c.setDash(2, 2)
    c.line(lx + uw * 12, top + 14, lx + uw * 12, 150)
    c.setDash()

    bars = [
        ("Inception and mobilisation", 0, 1, IND),
        ("Diagnostic: interviews, surveys, documents", 0, 2, IND2),
        ("The ten case trace", 1, 1, IND2),
        ("Risk register build", 1, 3, IND3),
        ("Framework and policy development", 2, 4, IND3),
        ("Key risk indicators and dashboard", 4, 5, SKY),
        ("Training delivery and competency checks", 6, 4, SKY),
        ("Incident reporting go live", 7, 2, GOLD),
        ("Committee cycle support", 8, 7, SAGE_D),
        ("Review, handover and roadmap", 10, 2, IND),
        ("Embedding and independent assurance", 12, 3, SAGE_D),
    ]
    by = top - 16
    for lab, start, span, col in bars:
        c.setFont("Helvetica", 8)
        c.setFillColor(BODY)
        c.drawRightString(lx - 12, by + 2, lab)
        c.setFillColor(HexColor("#EFF2F7"))
        c.rect(lx, by - 2, rx - lx, 11, fill=1, stroke=0)
        c.setFillColor(col)
        c.roundRect(lx + start * uw + 1, by - 2, span * uw - 2, 11, 2.5, fill=1, stroke=0)
        by -= 19

    miles = [(2, "Inception and diagnostic report"), (6, "Framework approved"),
             (9, "Dashboard live"), (10, "First committee meeting"),
             (12, "Handover"), (15, "Final assurance")]
    my = by - 4
    c.setFillColor(GOLD)
    for u, lab in miles:
        x = lx + u * uw
        c.saveState(); c.translate(x, my + 6); c.rotate(45)
        c.setFillColor(GOLD); c.rect(-3.4, -3.4, 6.8, 6.8, fill=1, stroke=0)
        c.restoreState()
    c.setFont("Helvetica-Bold", 6.4)
    c.setFillColor(SAGE_D)
    c.drawRightString(lx - 12, my + 3, "MILESTONES")
    labelled = [(2, "Reports"), (6, "Framework"), (9, "Dashboard"), (12, "Handover"), (15, "Assurance")]
    c.setFont("Helvetica", 6.2)
    for u, lab in labelled:
        c.setFillColor(MUTED)
        c.drawCentredString(lx + u * uw, my - 10, lab)


def slide_criteria(c):
    chrome(c, "Your evaluation criteria")
    heading(c, "How this response answers each of your four criteria")
    para(c, "Set out plainly, because your terms of reference publish the weighting and we would rather be measured "
            "against it than leave you to find the answers.",
         MX, PAGE_H - 150, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 30, 15.5)
    rows = [
        ["Your criterion", "Weight", "Where we answer it"],
        ["Technical competence and methodology", "40%", "Five method pillars, the evidence design, the ten case trace, how risk is identified and scored against ISO 31000, and the artefacts themselves. Slides 7 to 15, and our own delivery risk at 19."],
        ["Relevant experience and track record", "30%", "All three standards implemented rather than described: more than four JCI chapters at Evercare Lekki, COHSASA accreditation at St Nicholas, and SafeCare at Cedarcrest Abuja. Two of the three are the standards your own terms of reference name. Plus board and committee instruments at a Lagos specialist hospital. Slide 20."],
        ["Qualifications of key personnel", "20%", "An engagement lead who chairs an Audit and Risk Committee, a named quality and accreditation lead who implemented SafeCare, and a named regulatory lead who is Head of Risk at a major international private hospital in Lagos. Full curricula vitae within twenty four hours. Slides 22 to 24."],
        ["Financial competitiveness and value", "10%", "Re-scoped after our meeting, priced by phase against defined deliverables, capped, and billed against the milestone schedule, with third party costs at cost. Slide 25."],
    ]
    simple_table(c, rows, MX, PAGE_H - 202, [232, 56, PAGE_W - 2 * MX - 288], size=10.2, leading=13.4, pad=8)


def slide_heard(c):
    chrome(c, "What you asked for")
    heading(c, "What you have asked for, and what each objective turns on")
    y = PAGE_H - 172
    items = [
        ("A comprehensive risk assessment.", "Listing risks is straightforward. The value is in finding what your incident log does not already contain, which is why the method in the next few slides works the way it does."),
        ("A framework and policy.", "Most hospitals already hold a policy binder, so the work is in making the escalation pathways in it the ones your people actually use at three in the morning."),
        ("Key risk indicators and a dashboard.", "Indicators are easy to design and hard to choose well, because the wrong set will make genuinely good work look like failure. We deal with this directly a few slides on."),
        ("Integration with quality and accreditation.", "Surveyable from the start, mapped to the standard you choose, rather than retrofitted in the month before a survey."),
    ]
    y = bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=12.5, leading=16.5, gap=13)
    callout(c, MX, y - 6, PAGE_W - 2 * MX,
            "Your terms of reference set this work against your mission to achieve clinical excellence and reverse medical tourism. That is the right frame. A patient who can afford to fly out is buying assurance, and accreditation is how assurance becomes visible to them and to the insurers who pay for them.")


def slide_surface(c):
    chrome(c, "Your risk surface")
    heading(c, "The surface, once clinical is already covered")
    para(c, "At our meeting you were clear that the majority of clinical risk management is in place, and that what "
            "the Hospital wants is an enterprise framework across operational, financial, cultural and reputational "
            "risk. So we do not rebuild clinical. We integrate it, and spend the engagement where the cover is thinner.",
         MX, PAGE_H - 152, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 30, 15.5)
    rows = [
        ["Domain", "Where risk concentrates, and what the framework has to reach"],
        ["Operational", "Utilities and generator failover, medical gas, biomedical maintenance and calibration, stockouts of critical consumables, business continuity and IT, fire and evacuation, and establishment against the rota."],
        ["Financial", "Claims denial and payer concentration, receivables ageing, billing capture at the point of care, procurement and stock leakage, foreign exchange on imported consumables and parts, and capital commitments."],
        ["Cultural and people", "Whether people actually report. Key person dependency in scarce specialties, attrition and succession, conduct, training compliance, and the distance between the policy and the practice."],
        ["Reputational", "The exposure of a single event in a premium market, complaints and social channels, standing with payers and regulators, and the assurance gap that sends patients abroad."],
        ["Regulatory and compliance", "HEFAMAA standing and renewals, professional licensing, data protection under the Nigeria Data Protection Act 2023, and a renewal calendar nobody has to remember."],
        ["Clinical, already covered", "Not rebuilt. We test that it reports into the enterprise register on the same scale as everything else, so your board sees one picture rather than two."],
    ]
    simple_table(c, rows, MX, PAGE_H - 206, [176, PAGE_W - 2 * MX - 176], size=9.6, leading=12.6, pad=7)


def slide_scoring(c):
    chrome(c, "Method  /  how risk is identified and scored")
    heading(c, "How a risk gets onto the register, and what happens to it")
    y = PAGE_H - 156
    items = [
        ("Identify.", "Failure mode and effects analysis on the high risk processes, alongside incident and complaint review, the ten case trace, the staff and patient instruments, and the document set. Five sources, deliberately."),
        ("Score, in a facilitated workshop.", "Likelihood against impact on a five by five matrix, scored in workshops with the process owners in the room rather than by us alone, because a score the owner did not set is a score the owner will not act on. Your terms of reference ask for facilitated risk identification and analysis workshops, and this is where they sit."),
        ("Assign, at four levels.", "Board, management, departmental and individual, as your terms of reference specify. Every risk carries an owner at the level that can actually act on it."),
        ("Set tolerance.", "Your board agrees the line above which a risk must be escalated and below which it is accepted with a named owner. Without that line a register is a list, and every entry looks equally urgent."),
        ("Treat.", "Each risk is treated, tolerated, transferred or terminated, with an owner, a date and a control. Anything above tolerance carries a dated action and appears on the exception report."),
        ("Review.", "Cadence set by score band. High risks monthly at executive level, moderate quarterly at committee, low annually. The register moves or it is not working."),
    ]
    bullet_block(c, items, MX, y, 430, size=11, leading=14.4, gap=9)

    risk_matrix(c, PAGE_W - MX - 198, 248, 34, 6)
    c.setFont("Helvetica-Bold", 7.6)
    c.setFillColor(GOLD)
    c.drawString(PAGE_W - MX - 198, 224, "ABOVE TOLERANCE")
    c.setFont("Helvetica", 7.6)
    c.setFillColor(MUTED)
    c.drawString(PAGE_W - MX - 198, 212, "escalates to the Audit and Risk Sub-committee")
    c.setFont("Helvetica-Bold", 7.6)
    c.setFillColor(IND3)
    c.drawString(PAGE_W - MX - 198, 196, "WITHIN TOLERANCE")
    c.setFont("Helvetica", 7.6)
    c.setFillColor(MUTED)
    c.drawString(PAGE_W - MX - 198, 184, "accepted, owned, and dated for review")

    callout(c, MX, 150, 430,
            "Built on ISO 31000, which is a guideline rather than a certifiable standard, so nobody can sell you accreditation to it. What it gives you is a defensible structure: principles, a framework the board owns, and a process that runs. We map it to your accreditation standard and to HEFAMAA so the register you end up with is surveyable.",
            bg=CREAM, spine=GOLD, size=10.6, font="Helvetica", pad=15)


def slide_problem(c):
    chrome(c, "The problem as we see it")
    heading(c, "Why risk systems go quiet once the consultant leaves")
    y = PAGE_H - 170
    para(c,
         "Any competent firm in this process can write a policy suite that reads well, and we could hand you one inside "
         "three weeks. In our experience risk management fails in hospitals for reasons that have very little to do with "
         "the quality of the document, which is why we have built this engagement around what happens after it is written.",
         MX, y, "Helvetica", 13, BODY, PAGE_W - 2 * MX - 30, 18)
    y -= 58
    c.setFont("Helvetica-Bold", 14.5)
    c.setFillColor(TEAL)
    c.drawString(MX, y, "Three things decide whether the system is alive in twelve months")
    y -= 30
    w = (PAGE_W - 2 * MX - 36) / 3
    cards = [
        ("Evidence your own\npeople produced", "A register assembled from a consultant checklist belongs to the consultant, whereas one assembled from what your own staff and patients told us is something your board will defend."),
        ("A board line that\nactually functions", "Your terms of reference send progress to the Audit and Risk Sub-committee, so the report has to be written for the way that committee actually works, otherwise it gets filed."),
        ("An owner inside\nthe hospital", "Someone assessed, trained and certified, holding a written role brief, so that the function continues when that individual eventually moves on."),
    ]
    for i, (t, b) in enumerate(cards):
        x = MX + i * (w + 18)
        box(c, x, y - 150, w, 150, SURFACE, GOLD if i == 2 else TEAL)
        ty = y - 26
        c.setFont("Helvetica-Bold", 13.5)
        c.setFillColor(NAVY)
        for ln in t.split("\n"):
            c.drawString(x + 20, ty, ln)
            ty -= 17
        para(c, b, x + 20, ty - 10, "Helvetica", 10.8, BODY, w - 40, 14.5)


def slide_truth(c):
    chrome(c, "A word of caution")
    heading(c, "If this works, your incident reports will go up in year one")
    y = PAGE_H - 168
    para(c,
         "This matters because it determines how you judge us, and it is where most risk management engagements are "
         "quietly misjudged. A hospital that reports more incidents is a hospital where people have stopped being "
         "afraid to report. In a tertiary hospital, a low incident count is not reassurance. It is a finding.",
         MX, y, "Helvetica", 13, BODY, PAGE_W - 2 * MX - 30, 18.5)
    y -= 76
    callout(c, MX, y, PAGE_W - 2 * MX,
            "Any consultant who promises you fewer incident reports in year one is promising you a quieter system, not a safer one.",
            bg=CREAM, spine=GOLD, size=13.5)
    y -= 92
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(TEAL)
    c.drawString(MX, y, "So these are the indicators we would build into your dashboard instead")
    y -= 28
    rows = [
        ["Indicator", "Type", "Direction we would expect in year one"],
        ["Reporting rate against activity", "Leading", "Up. More events captured, including near misses."],
        ["Time from event to report", "Leading", "Down. Sharply, and it is the easiest early win."],
        ["Events with a completed root cause analysis", "Leading", "Up, then steady. Volume of analysis is a capacity question."],
        ["Repeat events of the same type", "Lagging", "Down. This is the one that proves the system is learning."],
        ["Severity profile of reported harm", "Lagging", "Down. The number that actually matters."],
        ["Register entries whose score has moved", "Lagging", "Up. A register that never moves is a document, not a control."],
    ]
    simple_table(c, rows, MX, y, [300, 62, PAGE_W - 2 * MX - 362], size=10.6, leading=14)


def slide_tqm(c):
    chrome(c, "Our philosophy")
    heading(c, "Risk management is one half of total quality management")
    y = PAGE_H - 152
    para(c,
         "We should be open about the tradition this firm works in, because it shapes every recommendation we will "
         "make to you. Consult for Africa practises total quality management, which holds that quality is produced by "
         "systems rather than by individual effort, that the people doing the work are the ones who improve it, and "
         "that improvement is continuous and evidenced rather than periodic and asserted.",
         MX, y, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 30, 16)
    y -= 74
    para(c,
         "This matters here because a hospital that runs risk and quality as two separate systems ends up with a "
         "register nobody moves and an improvement programme with no evidence behind it. Run as one loop, the register "
         "tells you what to improve, the improvement cycle closes it, and the board sees both. That is why the "
         "indicators we proposed measure repeat events and register movement, because those are the two places where "
         "the loop either closes or does not.",
         MX, y, "Helvetica", 11.6, BODY, 396, 16)

    # the loop, drawn
    ccx, ccy, r = PAGE_W - MX - 168, 232, 92
    quads = [("PLAN", IND, "Identify and score"), ("DO", IND3, "Change the process"),
             ("STUDY", SKY, "Measure the effect"), ("ACT", GOLD, "Standardise it")]
    import math
    c.setLineCap(0)
    centres = [135, 45, 315, 225]          # clockwise: plan, do, study, act
    for (lab, col, sub), ang in zip(quads, centres):
        c.setStrokeColor(col)
        c.setLineWidth(13)
        c.arc(ccx - r, ccy - r, ccx + r, ccy + r, ang + 39, -78)
    c.setFont(SERIF_B, 12)
    c.setFillColor(INK)
    c.drawCentredString(ccx, ccy + 6, "CONTINUOUS")
    c.setFont("Helvetica", 7.6)
    c.setFillColor(MUTED)
    c.drawCentredString(ccx, ccy - 8, "IMPROVEMENT")
    for (lab, col, sub), ang in zip(quads, centres):
        a = math.radians(ang)
        px2 = ccx + (r + 26) * math.cos(a)
        py2 = ccy + (r + 26) * math.sin(a)
        right = math.cos(a) > 0
        put = c.drawString if right else c.drawRightString
        c.setFont("Helvetica-Bold", 8.4)
        c.setFillColor(col if col != GOLD else HexColor("#9A7B18"))
        put(px2, py2 + 2, lab)
        c.setFont("Helvetica", 6.8)
        c.setFillColor(MUTED)
        put(px2, py2 - 8, sub)

    callout(c, MX, 138, 396,
            "It is also why your incident reports should rise before your harm falls. A system that is learning reports more, and a board that understands that will fund the work rather than question it.",
            bg=CREAM, spine=GOLD, size=10.6, font="Helvetica", pad=15)


def slide_evidence(c):
    chrome(c, "Method  /  one of five")
    heading(c, "Four evidence streams, so no single source decides a finding")
    y = PAGE_H - 166
    w = (PAGE_W - 2 * MX - 42) / 4
    cards = [
        ("Interviews", "Structured, across every department, board and C suite to frontline. Captures what people believe is happening."),
        ("Staff safety culture", "Anonymous, adapted from a validated international hospital instrument with items written for your context. Captures what nobody will say in an interview."),
        ("Patient experience", "Patients and caregivers, anonymous. On most Nigerian engagements this is the first time the patient voice has ever been measured."),
        ("Documents and observation", "What the hospital already produces: incident logs, minutes, rotas, audit reports, policies. Captures what actually happened."),
    ]
    for i, (t, b) in enumerate(cards):
        x = MX + i * (w + 14)
        box(c, x, y - 158, w, 158, SURFACE, TEAL)
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(NAVY)
        c.drawString(x + 16, y - 28, t)
        para(c, b, x + 16, y - 50, "Helvetica", 10.3, BODY, w - 32, 13.6)
    y -= 178
    callout(c, MX, y, PAGE_W - 2 * MX,
            "When two streams disagree, the disagreement is the finding. On a recent hospital diagnostic the interviews alone would have led us to upgrade the revenue cycle. The documents forced it back down. We would have been wrong with three streams.",
            bg=SURFACE, spine=GOLD, size=12, font="Helvetica")


def slide_trace(c):
    chrome(c, "Method  /  two of five")
    heading(c, "Tracing the flows where control actually leaks")
    y = PAGE_H - 158
    para(c,
         "A register built from a workshop lists the risks people already talk about. The ones that cost money sit in "
         "the handoffs, so we follow a small number of real transactions end to end, chosen on the morning with your "
         "team present, and record where each one stalls, leaks or goes unrecorded.",
         MX, y, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 30, 16)
    y -= 68
    flows = [
        ("A claim", "service delivered, to cash in the bank", IND),
        ("A requisition", "raised, to goods received and paid", IND2),
        ("An incident", "occurrence, to closed with the action evidenced", IND3),
        ("A complaint", "received, to resolved and fed back", SKY),
        ("A new clinician", "offer, to credentialed and competent", SAGE_D),
    ]
    fw = (PAGE_W - 2 * MX - 4 * 12) / 5
    for i, (nm, sub, col) in enumerate(flows):
        fx = MX + i * (fw + 12)
        box(c, fx, y - 78, fw, 78, SURFACE, col, 4)
        c.setFont(SERIF_B, 11.2)
        c.setFillColor(INK)
        c.drawString(fx + 14, y - 26, nm)
        para(c, sub, fx + 14, y - 44, "Helvetica", 8.6, MUTED, fw - 28, 11.5)
    y -= 100
    callout(c, MX, y, PAGE_W - 2 * MX,
            "Tracing a handful completely tells you more than sampling a hundred partially, because the findings arrive specific. Not a general observation that reconciliation is weak, but that this claim, raised on this date, was billed at the wrong tariff, denied for a reason nobody recorded, and never resubmitted.",
            bg=CREAM, spine=GOLD, size=11.2, font="Helvetica", pad=15)
    para(c, "Twelve numbers are captured on each trace, which gives the first honest view of where time, cost and "
            "control actually sit. Every gap is dated and attributable to a process rather than a person, which is "
            "what makes it safe to put in front of a board.",
         MX, 148, "Helvetica", 10.8, BODY, PAGE_W - 2 * MX - 30, 15)


def slide_board(c):
    chrome(c, "Method  /  three of five")
    heading(c, "Reporting into a board committee, from the chair of one")
    y = PAGE_H - 170
    items = [
        ("Your terms of reference send progress to the Board Audit and Risk Sub-committee.", "That is the right design. It only works if what arrives there is short, exception based, and decision shaped."),
        ("We chair committees of this kind.", "Dr Debo Odulana is an independent non-executive director of Havana Specialist Hospital, Lagos, where he chairs the Audit and Risk Committee and the Nomination, Remuneration and Governance Committee. Consult for Africa built that board its instruments: the risk summary, the exception report, escalation thresholds, the registers, the action log and the board dashboard."),
        ("So we design the report around the decision, not the data.", "A risk report that lists forty risks gets filed. One that names the three that moved, the two that breached threshold, and the one decision required, gets acted on."),
        ("And we sit in the committee while it beds in.", "Attendance at the Audit and Risk Sub-committee for the duration is included in the fee, not billed as an extra."),
    ]
    bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=12.3, leading=16.5, gap=15)


def slide_tech(c):
    chrome(c, "Method  /  four of five")
    heading(c, "The dashboard we will build you, and the systems behind it")
    y = PAGE_H - 166
    para(c,
         "Your terms of reference ask for a dashboard prototype and a set of monitoring indicators. Most firms will "
         "hand you a slide of what one could look like. We build software, and we will build yours.",
         MX, y, "Helvetica", 12.2, BODY, 392, 17)
    y -= 56
    items = [
        ("Live survey instruments.", "Your staff safety culture and patient experience surveys deploy as anonymous mobile forms with printed QR codes, and responses land in a working results view. We generate the paper and the web version from one definition, so the two cannot drift apart."),
        ("A private project portal for your team.", "One link carries the information requests, secure document upload, the surveys and the timetable, which spares your team six attachments and gives you an audit trail of what was supplied and when."),
        ("The risk dashboard in Power BI.", "Built on your own data and connected to your source systems, with board, executive and departmental views. It refreshes. It is not rebuilt by hand every quarter."),
        ("Incident reporting your staff will use.", "Short, mobile, with an anonymous route, running on the devices your people already carry, because reporting rate is a design problem well before it becomes a culture problem."),
        ("Interfaces that collect the data for you.", "Wherever your systems allow it we read from them directly rather than asking somebody to retype a figure into a spreadsheet, since manual collection is where risk data goes stale, and it is the first thing we automate."),
    ]
    bullet_block(c, items, MX, y, 392, size=10.2, leading=13.0, gap=7)

    # a drawn dashboard, so the claim is visible rather than asserted
    px, py, pw, ph = PAGE_W - MX - 300, 196, 300, 252
    c.setFillColor(HexColor("#F4F6FA"))
    c.roundRect(px, py, pw, ph, 9, fill=1, stroke=0)
    c.setFillColor(INK)
    c.roundRect(px, py + ph - 30, pw, 30, 9, fill=1, stroke=0)
    c.setFillColor(INK)
    c.rect(px, py + ph - 40, pw, 12, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 8.6)
    c.setFillColor(white)
    c.drawString(px + 14, py + ph - 20, "BOARD RISK DASHBOARD")
    c.setFillColor(SKY)
    c.drawRightString(px + pw - 14, py + ph - 20, "LIVE")

    tiles = [("Open risks", "42", IND2), ("Above threshold", "3", GOLD), ("Overdue actions", "7", SKY)]
    tw = (pw - 42) / 3.0
    for i, (lab, val, col) in enumerate(tiles):
        tx = px + 14 + i * (tw + 7)
        c.setFillColor(white)
        c.roundRect(tx, py + ph - 104, tw, 58, 5, fill=1, stroke=0)
        c.setFillColor(col)
        c.rect(tx, py + ph - 104, tw, 2.5, fill=1, stroke=0)
        c.setFont(SERIF_B, 19)
        c.setFillColor(INK)
        c.drawString(tx + 9, py + ph - 78, val)
        c.setFont("Helvetica", 6.8)
        c.setFillColor(MUTED)
        c.drawString(tx + 9, py + ph - 94, lab.upper())

    c.setFillColor(white)
    c.roundRect(px + 14, py + 24, pw - 28, 112, 5, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 6.8)
    c.setFillColor(MUTED)
    c.drawString(px + 24, py + 122, "REPORTING RATE AGAINST SEVERITY")
    bars = [26, 34, 30, 44, 52, 49, 61, 58, 70, 76, 72, 84]
    sev = [58, 55, 57, 49, 46, 44, 38, 36, 31, 28, 26, 22]
    bw = (pw - 60) / 12.0
    for i, v in enumerate(bars):
        bx = px + 26 + i * bw
        c.setFillColor(SKY)
        c.rect(bx, py + 44, bw - 3.5, v * 0.72, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.6)
    pth = c.beginPath()
    for i, v in enumerate(sev):
        X, Y = px + 26 + i * bw + (bw - 3.5) / 2, py + 44 + v * 0.72
        pth.moveTo(X, Y) if i == 0 else pth.lineTo(X, Y)
    c.drawPath(pth, stroke=1, fill=0)
    c.setFont("Helvetica", 6.6)
    c.setFillColor(SKY)
    c.drawString(px + 24, py + 33, "Reports")
    c.setFillColor(GOLD)
    c.drawString(px + 66, py + 33, "Severity")

    c.setFont("Helvetica-Oblique", 7.6)
    c.setFillColor(MUTED)
    c.drawCentredString(px + pw / 2, py - 14, "Indicative. Yours is built on your own data, in your own tenancy.")

    callout(c, MX, 146, 392,
            "We build it in your environment and hand it over with your licence and your data, so nothing switches off when we leave.",
            bg=CREAM, spine=GOLD, size=11.2, font="Helvetica", pad=16)


def slide_ai(c):
    chrome(c, "Method  /  the tooling, documented")
    heading(c, "The intelligent compliance system we proposed")
    y = PAGE_H - 158
    para(c,
         "You told us most of the work is already digitised and that there is room for more. This is what we put on "
         "the table: trained models and agents doing the checking that nobody has time to do between board meetings.",
         MX, y, "Helvetica", 11.2, BODY, 400, 15.4)
    y -= 46
    items = [
        ("Continuous control monitoring.", "An agent checks whether each control actually operated. Was the log filled, the checklist completed, the licence renewed, the action closed inside its date. What reaches a human is the exception, not the population."),
        ("Policy mapped to standard, continuously.", "Your policies and procedures parsed and mapped against ISO 31000, your accreditation standard and HEFAMAA, so a gap surfaces as it opens rather than in a workshop a year later."),
        ("Incident and complaint triage.", "Free text classified, severity scored, clustered for repeat themes, and routed to the owner who can actually act on it."),
        ("The register maintains itself.", "Overdue actions chased, risks whose score has not moved flagged, and the board exception report drafted from live data before the committee sits."),
    ]
    y = bullet_block(c, items, MX, y, 400, size=10.2, leading=13.0, gap=7)

    bx, by, bw2, bh = MX + 430, 196, PAGE_W - MX - (MX + 430), 250
    c.setFillColor(HexColor("#F4F6FA"))
    c.roundRect(bx, by, bw2, bh, 8, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(bx, by, 4, bh, fill=1, stroke=0)
    tracked(c, "THE CONTROLS", bx + 20, by + bh - 26, "Helvetica-Bold", 7.0, SAGE_D, 2.0)
    ctrl = [
        "Trained on your data, held in your tenancy. Nothing identifiable leaves it.",
        "Every output is reviewed and signed by a named person before it reaches the board.",
        "Nothing is decided by a model. It checks, sorts and drafts. People decide and people sign.",
        "A log of what was asked and what came back, so the audit trail exists if your auditors ask.",
        "The report states which analysis was machine assisted.",
    ]
    cy = by + bh - 48
    for line in ctrl:
        c.setFillColor(GOLD)
        c.rect(bx + 20, cy + 3, 5, 5, fill=1, stroke=0)
        cy = para(c, line, bx + 34, cy, "Helvetica", 9.4, BODY, bw2 - 56, 12.6) - 7

    callout(c, MX, 150, 400,
            "Framework first, then this. We would scope and price the build separately once the register exists, because the system should be shaped by what your register actually shows rather than by what we assume today. HospitlOS, our hospital operating layer, is the option if you would rather not build inside your own stack.",
            bg=CREAM, spine=GOLD, size=10.2, font="Helvetica", pad=14)


def _panel(c, x, y, w, h, title, sub=None):
    c.setFillColor(HexColor("#F4F6FA"))
    c.roundRect(x, y, w, h, 7, fill=1, stroke=0)
    c.setFillColor(INK)
    c.roundRect(x, y + h - 26, w, 26, 7, fill=1, stroke=0)
    c.rect(x, y + h - 34, w, 10, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(white)
    c.drawString(x + 12, y + h - 18, title)
    if sub:
        c.setFont("Helvetica", 7.0)
        c.setFillColor(SKY)
        c.drawRightString(x + w - 12, y + h - 18, sub)


def slide_artefacts(c):
    chrome(c, "What you receive")
    heading(c, "What you receive, shown as it will look")
    para(c, "Illustrative here. On the engagement each of these is built on your data, inside your environment.",
         MX, PAGE_H - 150, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 40, 15.5)

    y, h = 120, 300
    x, w = MX, 340
    _panel(c, x, y, w, h, "ENTERPRISE RISK REGISTER", "42 OPEN")
    cols = [x + 12, x + 38, x + 134, x + 212, x + 240, x + 288]
    c.setFont("Helvetica-Bold", 6.2)
    c.setFillColor(MUTED)
    for cx, lab in zip(cols, ["ID", "RISK", "EXISTING CONTROL", "SCORE", "OWNER", "ACTION"]):
        c.drawString(cx, y + h - 48, lab)
    hairline(c, x + 12, y + h - 54, w - 24, HexColor("#D5DCE8"), 0.6)
    rows = [
        ("OP-04", "Generator failover untested", "Monthly check, last signed March", 20, GOLD, "Facilities", "Treat"),
        ("FN-11", "Claims denial, two payers", "Denial report, no root cause", 16, GOLD, "Finance", "Treat"),
        ("FN-02", "Receivables beyond ninety days", "Weekly payer call", 12, IND2, "Finance", "Treat"),
        ("PE-07", "Key person dependency, cardiac", "No named deputy", 12, IND2, "People", "Treat"),
        ("RG-19", "HEFAMAA renewal window", "Calendar reminder only", 9, SKY, "Compliance", "Tolerate"),
        ("RP-03", "Complaint response time", "Monthly complaints log", 6, SAGE_D, "Quality", "Tolerate"),
    ]
    ry = y + h - 74
    for i, (rid, risk, ctrl, score, col, own, act) in enumerate(rows):
        if i % 2 == 0:
            c.setFillColor(white)
            c.roundRect(x + 10, ry - 8, w - 20, 26, 3, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 6.4)
        c.setFillColor(IND2)
        c.drawString(cols[0], ry + 4, rid)
        c.setFont("Helvetica", 6.3)
        c.setFillColor(BODY)
        for j, txt, wd in ((1, risk, 92), (2, ctrl, 74)):
            ln = wrap(c, txt, "Helvetica", 6.3, wd)
            c.drawString(cols[j], ry + 4, ln[0])
            if len(ln) > 1:
                c.drawString(cols[j], ry - 3, ln[1])
        c.setFillColor(col)
        c.roundRect(cols[3], ry + 1, 20, 11, 2.5, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 6.4)
        c.setFillColor(white if col in (GOLD, IND2) else INK)
        c.drawCentredString(cols[3] + 10, ry + 4.5, str(score))
        c.setFont("Helvetica", 6.3)
        c.setFillColor(MUTED)
        c.drawString(cols[4], ry + 4, own)
        c.drawString(cols[5], ry + 4, act)
        ry -= 30

    x2, w2 = MX + 364, 226
    _panel(c, x2, y, w2, h, "BOARD EXCEPTION REPORT", "SEPTEMBER")
    c.setFont(SERIF_B, 28)
    c.setFillColor(INK)
    c.drawString(x2 + 14, y + h - 76, "3")
    c.setFont("Helvetica", 7.4)
    c.setFillColor(MUTED)
    c.drawString(x2 + 42, y + h - 68, "risks above tolerance")
    c.drawString(x2 + 42, y + h - 79, "since the last meeting")
    hairline(c, x2 + 14, y + h - 96, w2 - 28, HexColor("#D5DCE8"), 0.6)
    exc = [("OP-04", "Generator failover", "Escalated", GOLD),
           ("FN-11", "Payer denial trend", "Escalated", GOLD),
           ("PE-07", "Key person dependency", "New this month", IND2)]
    ey = y + h - 118
    for rid, lab, state, col in exc:
        c.setFillColor(col)
        c.rect(x2 + 14, ey - 2, 3, 22, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 7.2)
        c.setFillColor(INK)
        c.drawString(x2 + 24, ey + 11, lab)
        c.setFont("Helvetica", 6.6)
        c.setFillColor(MUTED)
        c.drawString(x2 + 24, ey + 2, rid + "   /   " + state)
        ey -= 30
    c.setFillColor(CREAM)
    c.roundRect(x2 + 14, y + 42, w2 - 28, 58, 5, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(x2 + 14, y + 42, 3.5, 58, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7.0)
    c.setFillColor(INK)
    c.drawString(x2 + 26, y + 86, "ONE DECISION REQUIRED")
    para(c, "Approve capital release for the generator overhaul, or accept the risk on the register with a named owner.",
         x2 + 26, y + 74, "Helvetica", 6.8, BODY, w2 - 52, 9.5)
    c.setFont("Helvetica-Oblique", 6.4)
    c.setFillColor(MUTED)
    c.drawString(x2 + 14, y + 24, "One page. Exceptions only. Everything else")
    c.drawString(x2 + 14, y + 15, "sits in the register behind it.")

    x3, w3, ph2 = PAGE_W - MX - 124, 124, 272
    c.setFillColor(INK)
    c.roundRect(x3, y + 14, w3, ph2, 12, fill=1, stroke=0)
    c.setFillColor(white)
    c.roundRect(x3 + 6, y + 26, w3 - 12, ph2 - 26, 8, fill=1, stroke=0)
    c.setFillColor(INK)
    c.roundRect(x3 + 6, y + ph2 - 14, w3 - 12, 26, 8, fill=1, stroke=0)
    c.rect(x3 + 6, y + ph2 - 14, w3 - 12, 12, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 6.8)
    c.setFillColor(white)
    c.drawString(x3 + 16, y + ph2 - 6, "Report an incident")
    fy = y + ph2 - 66
    for lab, hgt in [("What happened", 30), ("Where", 15), ("When", 15), ("Anyone harmed", 15)]:
        c.setFont("Helvetica", 5.8)
        c.setFillColor(MUTED)
        c.drawString(x3 + 16, fy + hgt + 4, lab.upper())
        c.setFillColor(HexColor("#EFF2F7"))
        c.roundRect(x3 + 16, fy, w3 - 32, hgt, 3, fill=1, stroke=0)
        fy -= hgt + 17
    c.setFillColor(SAGE)
    c.roundRect(x3 + 16, fy + 6, 16, 9, 4.5, fill=1, stroke=0)
    c.setFillColor(white)
    c.circle(x3 + 27, fy + 10.5, 3.4, fill=1, stroke=0)
    c.setFont("Helvetica", 5.8)
    c.setFillColor(BODY)
    c.drawString(x3 + 38, fy + 8, "Report anonymously")
    c.setFillColor(GOLD)
    c.roundRect(x3 + 16, y + 40, w3 - 32, 20, 4, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7.0)
    c.setFillColor(INK)
    c.drawCentredString(x3 + w3 / 2, y + 46, "Submit")
    c.setFont("Helvetica-Oblique", 6.2)
    c.setFillColor(MUTED)
    c.drawCentredString(x3 + w3 / 2, y + 2, "Under forty seconds")


def slide_team_structure(c):
    chrome(c, "The team")
    heading(c, "How the team is structured, and who answers to whom")
    para(c, "A small senior team, with one person accountable to you for the whole engagement and a specialist bench "
            "drawn in where the work calls for it.",
         MX, PAGE_H - 152, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 40, 15.5)

    cw, chh = 196, 54
    cx = MX + 252

    def node(x, y, w, h, title, sub, fill=SURFACE, spine=TEAL, tcol=INK):
        box(c, x, y, w, h, fill, spine, 4)
        c.setFont(SERIF_B, 10)
        c.setFillColor(tcol)
        for i, ln in enumerate(wrap(c, title, SERIF_B, 10, w - 28)[:2]):
            c.drawString(x + 16, y + h - 19 - i * 12, ln)
        c.setFont("Helvetica", 7.4)
        c.setFillColor(MUTED if fill != INK else SKY)
        for i, ln in enumerate(wrap(c, sub, "Helvetica", 7.4, w - 28)[:2]):
            c.drawString(x + 16, y + 15 - i * 9, ln)

    node(MX, 338, 212, 58, "Duchess International Hospital",
         "Chief Compliance Officer, reporting to the Board Audit and Risk Sub-committee", INK, GOLD, white)
    c.setStrokeColor(SAGE_D); c.setLineWidth(1); c.setDash(3, 3)
    c.line(MX + 212, 366, cx, 366)
    c.setDash()

    node(cx, 340, cw, chh, "Dr Debo Odulana", "Engagement lead. Accountable to you for all six months.")
    c.setStrokeColor(RULE); c.setLineWidth(1)
    c.line(cx + cw / 2, 340, cx + cw / 2, 316)
    node(cx, 262, cw, chh, "Matthew Aloba", "Principal consultant and programme lead. Day to day with your Chief Compliance Officer.")

    nw, ngap = 205, 18
    span = 3 * nw + 2 * ngap
    x0 = cx + cw / 2 - span / 2
    c.line(cx + cw / 2, 262, cx + cw / 2, 240)
    c.line(x0 + nw / 2, 240, x0 + span - nw / 2, 240)
    ws = [
        ("Dr Adediwura Okeleye", "Risk, controls and assurance"),
        ("Barr. Osahon Omoruyi", "Regulatory, legal and reputational"),
        ("Your project coordinator", "Provided by the Hospital, two days a week"),
    ]
    for i, (a, b) in enumerate(ws):
        wx = x0 + i * (nw + ngap)
        c.line(wx + nw / 2, 240, wx + nw / 2, 220)
        node(wx, 162, nw, 58, a, b)

    # the bench
    bx = PAGE_W - MX - 150
    c.setFillColor(HexColor("#F4F6FA"))
    c.roundRect(bx, 264, 150, 134, 7, fill=1, stroke=0)
    c.setFillColor(SAGE_D)
    c.rect(bx, 264, 3.5, 134, fill=1, stroke=0)
    tracked(c, "SPECIALIST BENCH", bx + 14, 380, "Helvetica-Bold", 6.4, SAGE_D, 1.8)
    bench = ["Clinical governance and quality", "Hospital operations leaders",
             "Finance and revenue cycle", "Digital, data and analytics", "Diaspora clinical advisors"]
    byy = 364
    for line in bench:
        c.setFillColor(SKY)
        c.rect(bx + 14, byy + 2, 4, 4, fill=1, stroke=0)
        byy = para(c, line, bx + 24, byy, "Helvetica", 7.6, BODY, 112, 10) - 5

    callout(c, MX, 146, PAGE_W - 2 * MX,
            "These four are the four who turn up. No rotating cast and no junior substitution once the engagement starts, and one of them is accountable to you throughout.",
            bg=CREAM, spine=GOLD, size=10.6, font="Helvetica", pad=15)


def slide_owner(c):
    chrome(c, "Method  /  five of five")
    heading(c, "Your internal risk lead, and how we build one")
    y = PAGE_H - 168
    para(c,
         "Your terms of reference ask for training materials, session reports and competency assessments. Most firms "
         "deliver slides and an attendance sheet. We treat the internal risk lead as the central "
         "deliverable of the engagement, because that person is what remains.",
         MX, y, "Helvetica", 12.5, BODY, PAGE_W - 2 * MX - 30, 17.5)
    y -= 62
    rows = [
        ["Step", "What we do"],
        ["Identify", "With you, from the diagnostic. The right person is usually visible in the interview data before anyone nominates them."],
        ["Assess", "A structured leadership and readiness assessment, so the role is filled on evidence rather than on availability."],
        ["Train", "Cohort based across all four accountability levels, board, management, departmental and individual, with the curriculum built for your hospital."],
        ["Test", "A simulated committee meeting containing a planted conflict, a planted threshold breach and a planted variance, with a chairing rubric. We have run precisely this format for a Lagos hospital board."],
        ["Certify", "A per person competency check, documented, so the board has assurance and not an assertion."],
        ["Brief the role", "A written role brief and handover pack, so the function survives the individual moving on."],
    ]
    simple_table(c, rows, MX, y, [120, PAGE_W - 2 * MX - 120], size=11, leading=14.5)


def slide_engagement_risk(c):
    chrome(c, "Delivery risk")
    heading(c, "The four things that would put this engagement at risk")
    para(c, "You are buying a risk framework, so it would be odd if we had not run the method over our own delivery. "
            "These are the four that actually decide whether this lands.",
         MX, PAGE_H - 152, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 30, 15.5)
    rows = [
        ["The risk", "What it looks like", "What we do about it"],
        ["Evidence arrives late", "Weeks one and two compress, the diagnostic thins, and everything downstream is built on less.", "The information request goes out on signature, not on arrival. A named counterpart, and a private upload portal so documents are not chased through email."],
        ["Staff read the survey as an audit of them", "Response rates collapse and the culture data is worthless, which is the one thing you cannot buy back later.", "Anonymous by design, reported only in aggregate, and your chief executive says so in writing before the first form goes out."],
        ["Ownership does not transfer", "The commonest failure in this work. The framework is sound and nobody inside owns it by month nine.", "The champion is assessed, trained and certified, holds a written role brief, and we stay for three months of assurance after the build."],
        ["The board has no room for it", "A register with no tolerance line and no standing agenda slot goes stale between meetings.", "Tolerance agreed at week six, a standing item on the Audit and Risk Sub-committee, and an exception report short enough to be read."],
    ]
    simple_table(c, rows, MX, PAGE_H - 206, [150, 218, PAGE_W - 2 * MX - 368], size=9.8, leading=12.8, pad=7)


def slide_timeline(c):
    chrome(c, "The six months")
    heading(c, "Built and running in twelve weeks, assured for three months after")
    y = PAGE_H - 162
    para(c,
         "Your terms of reference set six months. We use the first twelve weeks to build and activate the system so the "
         "benefit starts early, then the remaining months to embed it and test it independently against the baseline we "
         "set in week two. A framework delivered in month six has never been tested by the time the engagement closes. "
         "These five phases are the five stages of the execution model in the company profile you have held since March: "
         "diagnose, design, deploy, deliver, transfer. This is that model applied to risk.",
         MX, y, "Helvetica", 12.3, BODY, PAGE_W - 2 * MX - 30, 17)
    y -= 80
    rows = [
        ["Phase", "When", "What lands"],
        ["1. Discovery and diagnostic", "Weeks 1 to 2", "Inception report. Diagnostic report with risk heat map and compliance gap register."],
        ["2. Framework and policy", "Weeks 3 to 6", "Risk management framework and policy. Clinical governance structure. Compliance accountability matrix."],
        ["3. Implementation and training", "Weeks 7 to 10", "Populated risk register. Key risk indicator framework. Dashboard. Training delivered. Incident reporting live. First committee meeting held."],
        ["4. Review and handover", "Weeks 11 to 12", "Post implementation review against the week two baseline. Final policy suite. Twelve month roadmap. Certified champion. Executive presentation."],
        ["5. Embedding and assurance", "Months 4 to 6", "Three further committee cycles supported. Independent check on whether the system is being used. No further fee."],
    ]
    simple_table(c, rows, MX, y, [190, 110, PAGE_W - 2 * MX - 300], size=10.6, leading=14)


def slide_coverage(c):
    chrome(c, "Coverage")
    heading(c, "Every deliverable in your terms of reference, and where it lands")
    para(c, "Clinical governance and accreditation is capability three of seven in the company profile submitted with our "
            "proposal, covering Joint Commission, COHSASA and SafeCare readiness, governance frameworks, patient safety "
            "systems and clinical audit. This mandate sits inside what we already do, not alongside it.",
         MX, PAGE_H - 182, "Helvetica", 11.6, MUTED, PAGE_W - 2 * MX - 30, 15.5)
    y = PAGE_H - 234
    rows = [
        ["Your requirement", "Phase", "How we go beyond the minimum"],
        ["Inception report", "1", "Inside two weeks, as you specify."],
        ["Comprehensive risk register", "3", "Dynamic and prioritised, carrying existing controls, assessed scores, mitigation actions, owners and review dates. Populated from your evidence, not a template."],
        ["Risk management framework document, with policy, strategy and implementation plan", "2", "All three named artefacts, mapped to ISO 31000 and the WHO patient safety frameworks, and benchmarked against the accreditation standard you choose."],
        ["Training materials and session reports", "3", "Plus a simulated committee meeting and a documented per person competency check."],
        ["Dashboard prototype and reporting templates", "3", "A working dashboard, not a mock up, hosted at no charge for the first twelve months."],
        ["Final report and handover", "4", "Plus a twelve month roadmap, a certified internal champion, and an accreditation readiness scorecard."],
    ]
    simple_table(c, rows, MX, y, [235, 55, PAGE_W - 2 * MX - 290], size=10.6, leading=14)


def slide_record(c):
    chrome(c, "Track record")
    heading(c, "Where we have done this work before")
    y = PAGE_H - 168
    items = [
        ("Accreditation we have implemented.", "At Evercare Hospital Lekki our founding partner led quality improvement and championed more than four JCI chapters. He took St Nicholas Hospital through COHSASA accreditation, and more recently, with Dr Adediwura Okeleye leading on quality, implemented SafeCare at Cedarcrest Abuja. Three standards, three Nigerian institutions, and two of the three are the ones your terms of reference name."),
        ("A Lagos specialist hospital board, this year.", "Independent non-executive director and adviser. Eleven board and committee instruments built with the company secretary, and a governance capability programme delivered across three cohorts with competency checks."),
        ("A paediatric and neonatal facility in Lagos.", "Four stream diagnostic across ten domains with a formal maturity assessment. The finding that mattered was a single line in a nursing standard operating procedure that explained every data discrepancy the board had been treating separately."),
        ("A specialist surgical clinic in Lagos.", "The ten case trace run end to end, on sterilisation and load traceability, device traceability and recall, the safety checklist, antibiotic timing, perioperative escalation and the written transfer agreement."),
    ]
    y = bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.8, leading=15.5, gap=12)
    callout(c, MX, y - 2, PAGE_W - 2 * MX,
            "Every engagement starts under a non-disclosure agreement, as our company profile sets out, so what we say about a client's internals stays inside it. The client list is on the next slide, and references follow on request.",
            bg=SURFACE, spine=TEAL, size=11.5, font="Helvetica")


def slide_clients(c):
    chrome(c, "Partners and clients")
    heading(c, "Who we work with")

    stats = [("15", "clients across Lagos and Abuja"),
             ("7", "platforms we built and still run"),
             ("68", "consultants on our bench"),
             ("21", "beds we manage rather than advise")]
    sw = (PAGE_W - 2 * MX - 3 * 14) / 4
    for i, (big, lab) in enumerate(stats):
        sx = MX + i * (sw + 14)
        c.setFillColor(HexColor("#F4F6FA"))
        c.roundRect(sx, PAGE_H - 196, sw, 52, 6, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(sx, PAGE_H - 196, sw, 2.5, fill=1, stroke=0)
        c.setFont(SERIF_B, 21)
        c.setFillColor(INK)
        c.drawString(sx + 14, PAGE_H - 172, big)
        c.setFont("Helvetica", 8)
        c.setFillColor(MUTED)
        for j, ln in enumerate(wrap(c, lab, "Helvetica", 8, sw - 28 - c.stringWidth(big, SERIF_B, 21))[:2]):
            c.drawString(sx + 24 + c.stringWidth(big, SERIF_B, 21), PAGE_H - 168 - j * 10, ln)

    lw = 452
    tracked(c, "CLIENTS", MX, PAGE_H - 212, "Helvetica-Bold", 6.8, SAGE_D, 2.0)
    clients = [
        ("Havana Specialist Hospital", "Lagos", "Board governance framework. Eleven instruments, and training across three cohorts."),
        ("Haven Paediatric Centre", "Lagos", "Organisational audit across ten domains, then turnaround and culture build."),
        ("Medbury Healthcare Group", "Lagos and Abuja", "Group strategy office, venture structuring, and the Lyfe Place Abuja campus."),
        ("Osteon Clinics", "Lagos", "Audit of a specialist orthopaedic practice. Sterilisation, device traceability and escalation."),
        ("Dennis Ashley Medical Clinic and Endoscopy Suites", "Victoria Island", "Diagnostic audit, fourteen domains. Endoscope reprocessing validation, payer yield, suite utilisation."),
        ("Aman HMO", "Lagos", "Provider network growth and network adequacy for the Lagos expansion."),
        ("House of Refuge, Freedom Foundation", "Lekki", "Management partner for a twenty one bed facility. We run it rather than advise it."),
        ("Belfiore Medical", "Ikoyi", "Client systems and the front of house experience programme."),
    ]
    y = PAGE_H - 238
    for name, where, work in clients:
        c.setFillColor(GOLD)
        c.rect(MX, y - 2, 3, 21, fill=1, stroke=0)
        c.setFont(SERIF_B, 9.6)
        c.setFillColor(INK)
        c.drawString(MX + 14, y + 11, name)
        c.setFont("Helvetica", 7.0)
        c.setFillColor(SAGE_D)
        c.drawString(MX + 17 + c.stringWidth(name, SERIF_B, 9.6), y + 11, where)
        c.setFont("Helvetica", 7.9)
        c.setFillColor(MUTED)
        c.drawString(MX + 14, y + 1, wrap(c, work, "Helvetica", 7.9, lw - 18)[0])
        hairline(c, MX, y - 7, lw, RULE, 0.55)
        y -= 28

    bx = MX + lw + 30
    bw2 = PAGE_W - MX - bx
    c.setFillColor(HexColor("#F4F6FA"))
    c.roundRect(bx, 128, bw2, 262, 7, fill=1, stroke=0)
    c.setFillColor(SAGE_D)
    c.rect(bx, 128, 3.5, 262, fill=1, stroke=0)
    tracked(c, "BUILT AND RUN BY US", bx + 16, 370, "Helvetica-Bold", 6.6, SAGE_D, 1.8)
    ours = [("Mezo Health", "private practice network, live"),
            ("Cooked Indoors", "medical nutrition, live"),
            ("Maarova", "leadership assessment"),
            ("CadreHealth", "workforce platform"),
            ("Cureva Health", "patient pathways"),
            ("Connexxum", "procurement"),
            ("Covally", "healthcare cooperative")]
    py2 = 348
    for nm, what in ours:
        c.setFont(SERIF_B, 9.4)
        c.setFillColor(INK)
        c.drawString(bx + 16, py2, nm)
        c.setFont("Helvetica", 7.4)
        c.setFillColor(MUTED)
        c.drawString(bx + 16, py2 - 9, what)
        py2 -= 24
    hairline(c, bx + 16, py2 + 9, bw2 - 32, RULE, 0.6)
    tracked(c, "PARTNER NETWORK", bx + 16, py2 - 6, "Helvetica-Bold", 6.6, SAGE_D, 1.8)
    c.setFont(SERIF_B, 9.4)
    c.setFillColor(INK)
    c.drawString(bx + 16, py2 - 28, "Doctors Foundation for Care")
    c.setFont("Helvetica", 7.4)
    c.setFillColor(MUTED)
    c.drawString(bx + 16, py2 - 37, "over five hundred diaspora physicians")

    callout(c, MX, 106, lw,
            "References on request. Tell us which of these you would like to speak to and we will make the introduction the same day, with their consent.",
            bg=CREAM, spine=GOLD, size=10.4, font="Helvetica", pad=14)


def slide_principal(c):
    chrome(c, "Key personnel")
    heading(c, "Dr Debo Odulana, Founding Partner")
    y = PAGE_H - 168

    c.setFillColor(GOLD)
    c.rect(MX, y - 128, 3, 140, fill=1, stroke=0)
    c.setFont(SERIF_I, 11.6)
    c.setFillColor(IND2)
    c.drawString(MX + 16, y, "MBBS, University of Sharjah")
    c.drawString(MX + 16, y - 18, "MSc International Health Management,")
    c.drawString(MX + 16, y - 34, "Imperial College Business School, London")
    para(c,
         "Former Chief Executive of Cedarcrest Hospitals, Abuja. Former Chief Innovation and Strategy Officer at "
         "Evercare Hospital, Lekki, where he led quality improvement and championed more than four JCI chapters. "
         "Founder of Doctoora, built across twenty one states and sold to Evercare. He took St Nicholas Hospital "
         "through COHSASA accreditation, and implemented SafeCare at Cedarcrest Abuja.",
         MX + 16, y - 62, "Helvetica", 10.4, BODY, 330, 14.6)
    c.setFillColor(INK)
    c.setFont(SERIF_B, 10.8)
    c.drawString(MX + 16, y - 148, "Havana Specialist Hospital, Lagos")
    para(c, "Independent non-executive director. Chairs the Audit and Risk Committee, and chairs the Nomination, "
            "Remuneration and Governance Committee.",
         MX + 16, y - 164, "Helvetica", 10.2, IND2, 330, 13.6)

    x0 = MX + 386
    tracked(c, "WHAT THAT RECORD LOOKS LIKE IN NUMBERS", x0, y + 14, "Helvetica-Bold", 6.8, SAGE_D, 2.0)
    stats = [
        ("N1bn+", "monthly revenue run rate carried as chief executive of a hospital group"),
        ("N1bn+", "half year EBITDA delivered in that role"),
        ("4+", "JCI chapters championed at Evercare Hospital Lekki"),
        ("3", "accreditation standards implemented: JCI, COHSASA, SafeCare"),
    ]
    sy = y - 24
    for i, (big, lab) in enumerate(stats):
        col = x0 + (i % 2) * 190
        row = sy - (i // 2) * 84
        c.setFont(SERIF_B, 25)
        c.setFillColor(INK if i % 2 == 0 else IND2)
        c.drawString(col, row, big)
        para(c, lab, col, row - 16, "Helvetica", 8.8, MUTED, 172, 11.6)
        c.setFillColor(GOLD)
        c.rect(col, row + 32, 22, 2, fill=1, stroke=0)

    callout(c, MX, 142, PAGE_W - 2 * MX,
            "He has been the executive accountable for the risks this engagement is about, and he currently chairs an Audit and Risk Committee of the kind yours reports into. He knows what makes that committee act, because he sits in the chair. Eleven days across the six months.",
            bg=CREAM, spine=GOLD, size=11.6, font="Helvetica", pad=16)


def slide_team(c):
    chrome(c, "The team")
    heading(c, "Who is on the ground")
    y = PAGE_H - 160
    rows = [
        ["Role", "Credential profile, against your stated requirement"],
        ["Dr Debo Odulana\nFounding Partner, engagement lead", "MBBS, MSc Imperial. Former hospital group chief executive. Chairs an Audit and Risk Committee and a Governance Committee. Led JCI chapter work at Evercare."],
        ["Dr Adediwura Okeleye\nRisk, controls and assurance lead", "Led quality for the SafeCare implementation at Cedarcrest Abuja. Owns patient safety systems, incident reporting and root cause analysis, the case trace and training delivery."],
        ["Matthew Aloba\nPrincipal Consultant, programme lead", "A Director of Consult for Africa, staffed on this engagement at principal consultant grade. Carries programme delivery end to end, the framework and policy suite, and the weekly rhythm with your Chief Compliance Officer."],
        ["Barrister Osahon Omoruyi\nRegulatory, legal and reputational risk", "Senior Legal Counsel and Head of Risk at Evercare Hospital Lekki. Owns the compliance gap analysis, the accountability matrix, regulatory standing and accreditation mapping."],
        ["Project coordination", "Provided by your own team, as agreed. A named counterpart released two days a week, which is what takes the coordination line out of the fee entirely."],
    ]
    y = simple_table(c, rows, MX, y, [250, PAGE_W - 2 * MX - 250], size=10.5, leading=13.8)
    callout(c, MX, y - 16, PAGE_W - 2 * MX,
            "Three of your four personnel requirements already sit in this team: the masters degree, more than ten years in healthcare risk management, and a tertiary hospital record that includes JCI chapter work at Evercare, COHSASA at St Nicholas and SafeCare at Cedarcrest. On CPHRM we would rather be straight. We hold the implementation record rather than the certificate, and if you want a certified holder named we will appoint one. Curricula vitae accompany the written submission.",
            bg=CREAM, spine=GOLD, size=10.6, font="Helvetica", pad=15)


def slide_investment(c):
    chrome(c, "Investment")
    heading(c, "Re-scoped after our meeting, and priced as resourced time")
    y = PAGE_H - 162
    rows = [
        ["", "Fee"],
        ["Standard fee", "N23,400,000"],
        ["Programme rate, because this is one continuous mandate", "(N2,340,000)"],
        ["Total fee payable across the six months", "N21,060,000"],
    ]
    y = simple_table(c, rows, MX, y, [500, PAGE_W - 2 * MX - 500], size=11.5, leading=15)
    y -= 26
    c.setFont("Helvetica-Bold", 13.5)
    c.setFillColor(TEAL)
    c.drawString(MX, y, "Payment against delivery")
    y -= 24
    rows2 = [
        ["Milestone", "Share", "Amount"],
        ["Engagement confirmation and mobilisation", "60%", "N12,636,000"],
        ["Approval of the framework and policy suite", "20%", "N4,212,000"],
        ["Completion of implementation, training and handover", "20%", "N4,212,000"],
    ]
    y = simple_table(c, rows2, MX, y, [430, 70, PAGE_W - 2 * MX - 500], size=11, leading=14.5)
    para(c, "Fees exclusive of value added tax, and capped at the total stated. Third party costs and travel outside Lagos "
            "pass through at cost with no mark up. The full schedule is provided separately.",
         MX, y - 20, "Helvetica", 10.3, MUTED, PAGE_W - 2 * MX - 20, 14)


def slide_close(c):
    chrome(c, "What happens next")
    heading(c, "What happens next")
    para(c, "Not a decision today. Three things, so that we can hold this team together and start well if you choose us.",
         MX, PAGE_H - 152, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 40, 16)

    asks = [("01", "A decision date, and who signs it",
             "Not the decision. The date, and the name. Our people are committed elsewhere and we would rather hold them than promise you a team we cannot field."),
            ("02", "Thirty minutes with your Chief Compliance Officer",
             "Your terms of reference make them the client. If they are not in this room, we would like that half hour before you decide rather than after."),
            ("03", "A name for your internal risk lead",
             "Whoever you have in mind as the internal risk lead, plus the coordinator whose two days a week took the coordination line out of our fee.")]
    y = PAGE_H - 214
    for num, lab, body in asks:
        c.setFillColor(GOLD)
        c.rect(MX, y - 6, 3.5, 40, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(SAGE_D)
        c.drawString(MX + 16, y + 22, num)
        c.setFont(SERIF_B, 14)
        c.setFillColor(INK)
        c.drawString(MX + 40, y + 21, lab)
        para(c, body, MX + 40, y + 6, "Helvetica", 10.6, MUTED, PAGE_W - 2 * MX - 80, 14)
        y -= 68

    callout(c, MX, y + 6, PAGE_W - 2 * MX,
            "You set this work against reversing medical tourism. A patient who can afford to fly abroad is buying assurance before they buy treatment, and this is how a hospital earns it. That is the work, and we would like to do it with you.",
            bg=CREAM, spine=GOLD, size=12.6, pad=18)


def _mini_matrix(c, x, y, grade, cell=18, gap=2.5):
    for r in range(5):
        for col in range(5):
            c.setFillColor(grade[r][col])
            c.roundRect(x + col * (cell + gap), y + r * (cell + gap), cell, cell, 1.6, fill=1, stroke=0)
    return 5 * cell + 4 * gap


def slide_back(c):
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor("#0E1830"))
    c.rect(0, 0, PAGE_W, 10, fill=1, stroke=0)
    c.rect(0, PAGE_H - 10, PAGE_W, 10, fill=1, stroke=0)

    try:
        img = ImageReader(str(DOCS / "c4a-logo-reversed.png"))
        iw, ih = img.getSize()
        dw = 156
        c.drawImage(img, MX, PAGE_H - 78, width=dw, height=dw * ih / iw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFillColor(GOLD)
        c.setFont(SERIF_B, 14)
        c.drawString(MX, PAGE_H - 62, "CONSULT FOR AFRICA")

    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 168, 46, 3, fill=1, stroke=0)

    c.setFont(SERIF, 23)
    c.setFillColor(white)
    c.drawString(MX, PAGE_H - 206, "A risk register your board")
    c.drawString(MX, PAGE_H - 236, "has reviewed twice, and")
    c.setFont(SERIF_B, 23)
    c.drawString(MX, PAGE_H - 266, "that has visibly moved.")

    para(c,
         "That is what six months buys. Reports up, because people have stopped being afraid to make them. Severity "
         "down. Repeat events falling. A certified champion inside the hospital, and a committee that met every time "
         "it was scheduled to. Then we hand it over and it keeps running.",
         MX, PAGE_H - 304, SERIF, 11.4, HexColor("#AEBBD4"), 372, 16.5)

    # the same matrix from the cover, before and after. the closing argument, drawn.
    px, py, pw, ph = PAGE_W - MX - 322, 176, 322, 214
    c.setFillColor(HexColor("#FBFAF6"))
    c.roundRect(px, py, pw, ph, 8, fill=1, stroke=0)

    hot = [[SAGE, SAGE, SKY, SKY, IND3],
           [SAGE, SKY, SKY, IND3, IND2],
           [SKY, SKY, IND3, IND2, GOLD],
           [SKY, IND3, IND2, GOLD, GOLD],
           [IND3, IND2, GOLD, GOLD, INK]]
    cool = [[SAGE, SAGE, SAGE, SAGE, SKY],
            [SAGE, SAGE, SAGE, SKY, SKY],
            [SAGE, SAGE, SKY, SKY, IND3],
            [SAGE, SKY, SKY, IND3, IND2],
            [SKY, SKY, IND3, IND2, GOLD]]

    span = _mini_matrix(c, px + 26, py + 74, hot)
    _mini_matrix(c, px + pw - 26 - span, py + 74, cool)

    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(SAGE_D)
    c.drawCentredString(px + 26 + span / 2, py + 56, "MONTH ONE")
    c.drawCentredString(px + pw - 26 - span / 2, py + 56, "MONTH SIX")

    c.setFillColor(GOLD)
    c.rect(px + pw / 2 - 9, py + 74 + span / 2 - 1, 18, 2, fill=1, stroke=0)

    c.setFont(SERIF_I, 9.4)
    c.setFillColor(HexColor("#5A6478"))
    for i, ln in enumerate(["The same matrix, six months apart. Risk does not",
                            "disappear. It moves, and the board can see it move."]):
        c.drawCentredString(px + pw / 2, py + 34 - i * 13, ln)

    c.setFillColor(GOLD)
    c.rect(MX, 112, 52, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 11)
    c.setFillColor(white)
    c.drawString(MX, 90, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 9.4)
    c.setFillColor(HexColor("#AEBBD4"))
    c.drawString(MX, 74, "Consult for Africa Management Services Limited")
    c.drawString(MX, 58, "hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com")
    c.drawString(MX, 42, "Lagos and Abuja, Nigeria")


SLIDES = [slide_cover, slide_roadmap, slide_heard, slide_surface, slide_problem, slide_truth, slide_tqm, slide_scoring, slide_evidence,
          slide_trace, slide_board, slide_tech, slide_ai, slide_artefacts, slide_owner, slide_timeline, slide_gantt, slide_coverage,
          slide_engagement_risk, slide_record, slide_clients, slide_principal, slide_team_structure, slide_team,
          slide_investment, slide_criteria, slide_close, slide_back]


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Duchess International Hospital - Healthcare Risk Management - Consult for Africa")
    c.setAuthor("Consult for Africa")
    for fn in SLIDES:
        fn(c)
        c.showPage()
    c.save()
    print("wrote %s" % OUT)
