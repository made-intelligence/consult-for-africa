"""
Carbon: the hospital receivables partnership deck.

For Debo's meeting with Chijioke Dozie of Carbon on 8 October 2026, following
their first conversation on 4 October. Carbon funds, Consult for Africa
originates, verifies, reconciles and collects, and the hospital gets 60% of a
vetted claim within 48 hours.

Carbon is a lender, so the deck carries the things a lender reads: the legal
route to the cash, the decision rules exactly as the platform applies them,
the risk controls, market pricing for Carbon's own side, and a pilot with
stop-loss terms. CFA's own recovery fee and its share of any discount are not
stated anywhere. No other client engagement is named.

Every external fact is from docs/claims-recovery/research-how-to-execute.md,
and vendor-reported figures are labelled as such on the page.

Run:
  python3 scripts/build-carbon-receivables-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib.colors import HexColor, white  # noqa: E402
from reportlab.lib.pagesizes import A4, landscape  # noqa: E402
from reportlab.lib.utils import ImageReader        # noqa: E402
from reportlab.pdfgen import canvas                # noqa: E402

import cfa_deck as D                               # noqa: E402
from cfa_deck import (                             # noqa: E402
    BODY, CREAM, DEEP_NAVY, DOCS, GOLD, INK, LIGHT, MUTED, MX, NAVY, PAGE_H,
    PAGE_W, SAGE, SERIF_B, SERIF_I, SKY, SURFACE, TEAL,
    box, bullet_block, callout, chevron_stack, chrome, heading, para,
    simple_table, tracked, wrap,
)

OUT = ROOT / "docs" / "carbon" / "carbon-hospital-receivables-deck-cfa.pdf"
SHARE = ROOT / "docs" / "Carbon - Hospital Receivables Partnership (Deck).pdf"
ASSETS = ROOT / "docs" / "carbon" / "assets"

TOTAL = 20
D.FOOTER[0] = "Consult for Africa   /   Private and confidential   /   Prepared for Carbon"
D.TOTAL[0] = str(TOTAL)

W = PAGE_W - 2 * MX
PANEL_W = 240
TOP = PAGE_H - 110
GREEN = HexColor("#2F7D4F")
AMBER = HexColor("#B7791F")
RED = HexColor("#B83A3A")


# ---------------------------------------------------------------- helpers ---
def kicker_line(c, text, x, y, colour=TEAL, size=8.5):
    tracked(c, text.upper(), x, y, "Helvetica-Bold", size, colour, 1.6)


def stat(c, x, y, w, h, value, label, fill=SURFACE, vcol=NAVY, lcol=BODY, spine=GOLD, vsize=24):
    box(c, x, y - h, w, h, fill, spine=spine)
    c.setFont(SERIF_B, vsize)
    c.setFillColor(vcol)
    c.drawString(x + 18, y - 22 - vsize * 0.72, value)
    para(c, label, x + 18, y - 34 - vsize, "Helvetica", 10, lcol, w - 32, 13)


def source(c, text, y=44):
    c.setFont("Helvetica-Oblique", 7.6)
    c.setFillColor(MUTED)
    for i, line in enumerate(wrap(c, text, "Helvetica-Oblique", 7.6, W)):
        c.drawString(MX, y - i * 9.5, line)


def arrow(c, x1, y1, x2, y2, col=GOLD, lw=1.6, head=6):
    import math
    c.setStrokeColor(col)
    c.setFillColor(col)
    c.setLineWidth(lw)
    c.line(x1, y1, x2, y2)
    a = math.atan2(y2 - y1, x2 - x1)
    p = c.beginPath()
    p.moveTo(x2, y2)
    p.lineTo(x2 - head * math.cos(a - 0.45), y2 - head * math.sin(a - 0.45))
    p.lineTo(x2 - head * math.cos(a + 0.45), y2 - head * math.sin(a + 0.45))
    p.close()
    c.drawPath(p, fill=1, stroke=0)


def image(c, path, x, y_top, w, border=True):
    img = ImageReader(str(path))
    iw, ih = img.getSize()
    h = w * ih / iw
    if border:
        c.setFillColor(HexColor("#E5E7EB"))
        c.roundRect(x - 1.5, y_top - h - 1.5, w + 3, h + 3, 6, fill=1, stroke=0)
    c.drawImage(img, x, y_top - h, width=w, height=h, mask="auto")
    return y_top - h


def node(c, x, y, w, h, title, sub, fill=NAVY, tcol=white, scol=None):
    box(c, x, y, w, h, fill)
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(tcol)
    c.drawCentredString(x + w / 2, y + h - 24, title)
    yy = y + h - 40
    for line in wrap(c, sub, "Helvetica", 9.2, w - 20):
        c.setFont("Helvetica", 9.2)
        c.setFillColor(scol or LIGHT)
        c.drawCentredString(x + w / 2, yy, line)
        yy -= 12


# ------------------------------------------------------------------ 01 ------
def cover(c):
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)
    # A quiet colour field: no chevrons on covers.
    c.setFillColor(SURFACE)
    c.rect(PAGE_W - PANEL_W, 0, PANEL_W, PAGE_H - 10, fill=1, stroke=0)
    try:
        lg = ImageReader(str(DOCS / "c4a-logo.png"))
        lw, lh = lg.getSize()
        c.drawImage(lg, MX, PAGE_H - 94, width=32 * lw / lh, height=32, mask="auto")
    except Exception:
        pass
    c.setFillColor(GOLD)
    c.rect(MX, 424, 44, 3, fill=1, stroke=0)
    tracked(c, "PREPARED FOR CARBON", MX, 398, "Helvetica-Bold", 10.5, TEAL, 2.6)
    c.setFont(SERIF_B, 34)
    c.setFillColor(INK)
    y = 344
    for line in wrap(c, "Hospital receivables, verified, recovered and funded", SERIF_B, 34, 520):
        c.drawString(MX, y, line)
        y -= 42
    c.setFont(SERIF_I, 15)
    c.setFillColor(MUTED)
    for line in wrap(c, "A partnership in which Carbon lends against claims the health plans owe, and we make sure they pay.", SERIF_I, 15, 500):
        y -= 4
        c.drawString(MX, y, line)
        y -= 17
    c.setStrokeColor(D.RULE)
    c.setLineWidth(0.9)
    c.line(MX, 182, PAGE_W - PANEL_W - 26, 182)
    for dx, label, value in [(0, "PREPARED FOR", "Chijioke Dozie, Carbon"), (170, "PREPARED BY", "Dr Debo Odulana"), (310, "MEETING", "8 October 2026")]:
        tracked(c, label, MX + dx, 160, "Helvetica-Bold", 8.0, TEAL, 1.9)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(NAVY)
        c.drawString(MX + dx, 138, value)
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(MX, 86, "Private and confidential. A basis for discussion, not an offer of terms.")
    c.showPage()


# ------------------------------------------------------------------ 02 ------
def s_summary(c):
    chrome(c, "The proposal on one page")
    y = heading(c, "Carbon lends against claims the plans owe. We make sure the plans pay.")
    tiles = [
        ("60%", "of a verified claim's value paid to the hospital within 48 hours"),
        ("8", "checks every claim passes before any money moves, and a person signs each one"),
        ("799", "Lagos providers already in our directory, with a direct line to 702 of them"),
        ("Live", "public page, claims desk and decision rules are running in production today"),
    ]
    gap = 12
    tw = (W - 3 * gap) / 4
    for i, (v, l) in enumerate(tiles):
        stat(c, MX + i * (tw + gap), y - 18, tw, 104, v, l, vsize=26)
    y -= 140
    col = (W - 24) / 2
    kicker_line(c, "What Carbon does", MX, y)
    bullet_block(c, [
        ("", "Lends to the hospital against its verified claims, through a collection account the plans pay into."),
        ("", "Sets the credit policy, the facility per hospital and the discount."),
        ("", "Receives claim-level performance data, monthly or live."),
    ], MX, y - 20, col, size=11.2, leading=15, gap=8)
    kicker_line(c, "What we do", MX + col + 24, y)
    bullet_block(c, [
        ("", "Find the hospitals, verify every claim and keep the bad ones out of the book."),
        ("", "Settle disputes with the plans, chase, escalate and collect."),
        ("", "Never lend, never buy a claim, never guarantee. Factoring needs a licence we do not hold and do not want."),
    ], MX + col + 24, y - 20, col, size=11.2, leading=15, gap=8)
    callout(c, MX, 118, W,
            "For tomorrow: agree the lending route, the pilot size, how the discount is set and what data Carbon needs to underwrite.",
            bg=CREAM, spine=GOLD, size=11.5, leading=15)
    c.showPage()


# ------------------------------------------------------------------ 03 ------
def s_problem(c):
    chrome(c, "The problem")
    y = heading(c, "Private hospitals are financing the health plans.")
    y = para(c, "Most of what a private hospital earns from insured patients is owed by HMOs, with corporate accounts and state schemes behind them. The work is done and the cost is paid this month. The cash arrives months later, if the claim survives the plan's review at all.",
             MX, y - 16, "Helvetica", 12.2, BODY, W - 20, 17.5)
    y -= 18
    gap = 14
    tw = (W - 2 * gap) / 3
    stat(c, MX, y, tw, 112, "56 days", "average time to process a claim on the largest Nigerian HMO claims platform in 2025, down from 81 days in 2024")
    stat(c, MX + tw + gap, y, tw, 112, "8.4m", "claims a year through that one platform, worth about N22bn, across 20 to 25 HMOs")
    stat(c, MX + 2 * (tw + gap), y, tw, 112, "30 days", "the most the Guild of Medical Directors said in 2022 its members would tolerate being owed, with interest after")
    y -= 140
    box(c, MX, y - 74, W, 74, SURFACE, spine=TEAL)
    c.setFont(SERIF_I, 13.5)
    c.setFillColor(NAVY)
    c.drawString(MX + 24, y - 30, "\"They have not paid us in three months after treating more than 250 patients.\"")
    c.setFont("Helvetica", 9.5)
    c.setFillColor(MUTED)
    c.drawString(MX + 24, y - 52, "A Lagos private facility manager, in a study of why facilities hesitate to join insurance schemes")
    source(c, "Sources: Medismarts figures as reported by Streamlinefeed, July 2026 (vendor-reported; the article does not say whether this is submission to payment or to adjudication). "
              "Guild of Medical Directors, BusinessDay and Daily Trust, January 2022. Facility manager: PLOS ONE, 2021, fieldwork in Lagos 2017 to 2018. "
              "We found no published Nigerian rejection rate. The pilot will produce the first one.", y=56)
    c.showPage()


# ------------------------------------------------------------------ 04 ------
def s_stuck(c):
    chrome(c, "Why the money is stuck")
    y = heading(c, "Most of it is disputed. Very little of it is refused.")
    rows = [
        ["Why the claim is unpaid", "What clears it", "Recoverable"],
        ["No pre-authorisation code, or the code does not match the service billed", "Retrospective authorisation, agreed with the plan's medical team", "Usually"],
        ["Billed above the agreed tariff, or on an old tariff", "Rebilled at the agreed rate; the gap is written off, not the claim", "Mostly"],
        ["Missing documents: notes, results, discharge summary", "Pull the record and resubmit inside the plan's window", "Usually"],
        ["Submitted late, or never submitted", "Depends on the plan's window and goodwill", "Sometimes"],
        ["The plan is slow to pay across the board", "Escalation, a payment schedule, then the regulator", "Slowly"],
        ["The enrollee was not covered, or the plan has failed", "Bill the patient or employer, or write it off", "Rarely"],
    ]
    y = simple_table(c, rows, MX, y - 20, [330, W - 330 - 110, 110], size=10.8, leading=14, pad=8)
    callout(c, MX, y - 16, W,
            "This is why the risk is better than it looks from outside. A claim that has been verified is a debt from a regulated payer for work already done, and most of what blocks payment is paperwork that can be fixed before Carbon lends a naira.",
            bg=SURFACE, spine=TEAL, size=11.5, leading=15.5)
    c.showPage()


# ------------------------------------------------------------------ 05 ------
def s_why_now(c):
    chrome(c, "Why now")
    y = heading(c, "The law, the rate cycle and the failures all point the same way.")
    cards = [
        ("Late payment is an offence", "The NHIA Act 2022 makes it an offence for an HMO to fail to pay providers or settle claims within the period in the operational guidelines (s.48), and sends disputes to NHIA mediation first (s.47). Recovery has a regulator behind it."),
        ("Receivables are assignable", "The Secured Transactions in Movable Assets Act 2017 makes an assignment of a receivable effective against the debtor even where the contract limits assignment (s.4(2)), with priority by registration at the National Collateral Registry (s.33)."),
        ("A Factoring Act is close", "The Factoring, Assignments and Receivables Financing Bill 2026 passed the National Assembly in June 2026 and went for assent. We could not confirm it has been signed."),
        ("Unsecured SME credit has failed", "Lidya closed in October 2025 on loan losses and naira depreciation. Lending repaid from a named, regulated payer's cash is a different risk, which is the case for this book."),
    ]
    gap = 14
    cw = (W - gap) / 2
    ch = 132
    for i, (t, b) in enumerate(cards):
        x = MX + (i % 2) * (cw + gap)
        top = y - 18 - (i // 2) * (ch + gap)
        box(c, x, top - ch, cw, ch, SURFACE, spine=GOLD if i % 3 == 0 else TEAL)
        c.setFont(SERIF_B, 14.5)
        c.setFillColor(INK)
        c.drawString(x + 22, top - 28, t)
        para(c, b, x + 22, top - 48, "Helvetica", 10.4, BODY, cw - 40, 14)
    source(c, "Sources: NHIA Act 2022 (Gazette No. 95, May 2022); STMA 2017; Senate proceedings and Afreximbank on the Factoring Bill, June 2026; TechNext, October 2025. "
              "The CBN also cut the policy rate from 26.5% to 23% on 22 September 2026, though lenders warn the cost of credit will lag.", y=52)
    c.showPage()


# ------------------------------------------------------------------ 06 ------
def s_service(c):
    chrome(c, "What we do")
    y = heading(c, "Verify, reconcile, recover")
    y = para(c, "One desk, run by people who have run hospitals and sat across the table from health plans, on a platform we built for the job.",
             MX, y - 12, "Helvetica", 12.2, BODY, W, 17)
    cols = [
        ("Verify", "Every claim is read against the plan's tariff, the authorisation record, the documents held and its age. The platform drafts the verdict, the likelihood of payment and the exact repairs; a person confirms it. Claims that will not pay are kept out of the funded book and sent to repair."),
        ("Reconcile", "We match what the hospital billed against what each plan says it owes, then clear the gap claim by claim with the plan's claims team. For each plan the platform ranks the claims by naira recovered per hour of effort and drafts the reconciliation letter and the call script."),
        ("Recover", "We chase, escalate and settle. Every call is logged and the platform turns the notes into dated promises, disputes and next actions, so a promise made on a Tuesday is chased on the Friday. Payment lands in the account Carbon controls."),
    ]
    gap = 16
    bw = (W - 2 * gap) / 3
    top = y - 22
    bh = 206
    for i, (t, body) in enumerate(cols):
        x = MX + i * (bw + gap)
        box(c, x, top - bh, bw, bh, SURFACE, spine=GOLD if i == 1 else TEAL)
        c.setFont(SERIF_B, 19)
        c.setFillColor(INK)
        c.drawString(x + 22, top - 38, t)
        para(c, body, x + 22, top - 64, "Helvetica", 10.6, BODY, bw - 40, 14.6)
    c.showPage()


# ------------------------------------------------------------------ 07 ------
def s_flow(c):
    chrome(c, "How the money moves")
    y = heading(c, "Sixty per cent within 48 hours, the balance when the plan pays.")
    steps = [
        ("1", "Hospital submits", "a batch of claims: references, plan, dates, amounts. No patient names."),
        ("2", "We verify", "against tariff, authorisation, documents and age, and a person confirms."),
        ("3", "Carbon advances", "60% of the verified value to the hospital within 48 hours."),
        ("4", "We recover", "and the plan pays into the collection account at Carbon."),
        ("5", "Settlement", "Carbon is repaid with its discount; the hospital receives the balance."),
    ]
    gap = 12
    bw = (W - 4 * gap) / 5
    top = y - 24
    bh = 138
    for i, (n, t, body) in enumerate(steps):
        x = MX + i * (bw + gap)
        fill = NAVY if i == 2 else SURFACE
        box(c, x, top - bh, bw, bh, fill)
        c.setFont(SERIF_B, 24)
        c.setFillColor(GOLD)
        c.drawString(x + 14, top - 36, n)
        c.setFont("Helvetica-Bold", 11.5)
        c.setFillColor(white if i == 2 else NAVY)
        c.drawString(x + 14, top - 58, t)
        para(c, body, x + 14, top - 76, "Helvetica", 9.8, LIGHT if i == 2 else BODY, bw - 26, 13)
        if i < 4:
            arrow(c, x + bw + 1, top - bh / 2, x + bw + gap - 1, top - bh / 2)
    y = top - bh - 26
    kicker_line(c, "One claim, end to end (illustrative)", MX, y)
    rows = [
        ["", "Naira", "When"],
        ["Billed to the plan", "1,000,000", "Day 0"],
        ["Verified payable (after tariff correction)", "950,000", "Day 1"],
        ["Advance to the hospital, 60% of verified", "570,000", "By day 3"],
        ["Plan pays into the collection account", "950,000", "Day 30 to 90"],
        ["Carbon: advance returned, plus its discount", "570,000 + discount", "On receipt"],
        ["Hospital: the balance, less the recovery fee", "the rest", "On receipt"],
    ]
    simple_table(c, rows, MX, y - 12, [W - 300, 160, 140], size=10.2, leading=13, pad=6.5)
    c.showPage()


# ------------------------------------------------------------------ 08 ------
def s_rules(c):
    chrome(c, "Decisioning")
    y = heading(c, "Every advance passes the same eight checks, in this order.")
    rows = [
        ["#", "Check", "If it fails"],
        ["1", "Funding is live with a signed funder, and the hospital's agreement is signed and active", "Hold"],
        ["2", "The claim has been verified, and a person has confirmed the verification", "Hold"],
        ["3", "Verdict is PASS. A claim that needs repair is repaired first; one that will not pay is declined", "Hold or decline"],
        ["4", "Likelihood the plan pays is at least 75%", "Hold"],
        ["5", "The payer is eligible, and is not one CFA advises", "Decline"],
        ["6", "Claim age is within the limit (180 days by default, set per hospital)", "Decline"],
        ["7", "The advance keeps the hospital inside its facility limit", "Hold"],
        ["8", "No single plan above 40% of the hospital's advanced book, once the book is past a quarter of its limit", "Hold"],
    ]
    y = simple_table(c, rows, MX, y - 18, [34, W - 34 - 120, 120], size=10.4, leading=13.4, pad=7)
    y -= 16
    col = (W - 16) / 2
    box(c, MX, y - 86, col, 86, CREAM, spine=GOLD)
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(NAVY)
    c.drawString(MX + 20, y - 24, "The amount")
    para(c, "60% of the lowest of what was billed, the agreed tariff and the verified payable. Rounded down to the kobo.", MX + 20, y - 42, "Helvetica", 10.2, BODY, col - 36, 13.5)
    box(c, MX + col + 16, y - 86, col, 86, SURFACE, spine=TEAL)
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(NAVY)
    c.drawString(MX + col + 36, y - 24, "Who decides")
    para(c, "The rules decide. The model's view can stop an advance but never authorise one. A person approves every advance, and Carbon's own credit decision comes after that.",
         MX + col + 36, y - 42, "Helvetica", 10.2, BODY, col - 36, 13.5)
    c.showPage()


# ------------------------------------------------------------------ 09 ------
def s_verification(c):
    chrome(c, "Verification, in practice")
    y = heading(c, "What the desk sees before anyone lends.")
    y = para(c, "Two test claims run through the platform this week. The output below is what it returned, lightly shortened.",
             MX, y - 10, "Helvetica", 11.5, BODY, W, 16)
    gap = 16
    cw = (W - gap) / 2
    top = y - 16
    ch = 262
    cards = [
        ("Caesarean section, 3 nights", "Billed N450,000   Tariff N420,000   Authorised   117 days", "Payable after rebill", GREEN,
         ["Authorisation, documents and timing are in order", "Only query: N30,000 billed above the agreed tariff"],
         ["Confirm N420,000 is the current tariff", "Reissue at N420,000 under the same authorisation code", "Include the operation note with the clinical notes", "Reply to the tariff query in writing and ask for a payment date"],
         "Expected payable N420,000"),
        ("Appendicectomy", "Billed N600,000   No tariff on file   No authorisation   232 days", "FAIL, 12%", RED,
         ["Never submitted, 232 days after service", "No authorisation for a procedure that normally needs one", "No documents held, cover not confirmed"],
         ["Establish whether it was an emergency and whether the plan was told", "Check the submission window and tariff in the provider agreement", "Only then decide whether to pursue retrospective authorisation"],
         "Kept out of the funded book"),
    ]
    for i, (title, facts, verdict, vcol, issues, repairs, foot) in enumerate(cards):
        x = MX + i * (cw + gap)
        box(c, x, top - ch, cw, ch, SURFACE)
        c.setFont("Helvetica-Bold", 12.5)
        c.setFillColor(INK)
        c.drawString(x + 20, top - 26, title)
        c.setFont("Helvetica", 9.4)
        c.setFillColor(MUTED)
        c.drawString(x + 20, top - 48, facts)
        c.setFillColor(vcol)
        c.roundRect(x + cw - 140, top - 34, 120, 20, 10, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 9.5)
        c.setFillColor(white)
        c.drawCentredString(x + cw - 80, top - 27.5, verdict)
        yy = top - 72
        kicker_line(c, "Found", x + 20, yy, size=7.8)
        yy = bullet_block(c, [("", t) for t in issues], x + 20, yy - 16, cw - 40, size=10, leading=13, gap=4)
        kicker_line(c, "Repairs, in order", x + 20, yy - 4, size=7.8)
        bullet_block(c, [("", t) for t in repairs], x + 20, yy - 20, cw - 40, size=10, leading=13, gap=4)
        c.setFont("Helvetica-Bold", 10.5)
        c.setFillColor(NAVY)
        c.drawString(x + 20, top - ch + 18, foot)
    c.showPage()


# ------------------------------------------------------------------ 10 ------
def s_recovery(c):
    chrome(c, "Recovery")
    y = heading(c, "Reconciliation first, the regulator last.")
    steps = [
        ("Claims officer", "Reconciliation letter listing each claim, what was fixed and a request for a payment date"),
        ("Medical director or head of claims", "When the claims officer has stopped responding, or the dispute is clinical"),
        ("NHIA complaint", "Mediation under s.47. NHIA has reported resolving complaints in 10 to 25 days, 15 on average"),
    ]
    sx = MX
    sw = (W - 40) / 3
    top = y - 24
    for i, (t, b) in enumerate(steps):
        x = sx + i * (sw + 20)
        node(c, x, top - 120, sw, 120, t, b, fill=NAVY if i < 2 else DEEP_NAVY)
        if i < 2:
            arrow(c, x + sw + 2, top - 60, x + sw + 18, top - 60)
    y = top - 150
    col = (W - 24) / 2
    kicker_line(c, "What the platform does on every call", MX, y)
    bullet_block(c, [
        ("", "Reads the call notes and records each promise with its amount, its claims and its date"),
        ("", "Logs each dispute against the claim it concerns"),
        ("", "Sets the next action and its due date, so nothing promised is left unchased"),
    ], MX, y - 20, col, size=10.8, leading=14.5, gap=6)
    kicker_line(c, "From a test call this week", MX + col + 24, y)
    box(c, MX + col + 24, y - 132, col, 116, SURFACE, spine=GOLD)
    para(c, "\"She accepts CL-001 at the tariff of 420k, in the next payment run, end of October. CL-002 has no PA code, so they will not pay unless the medical director approves a retrospective authorisation.\"",
         MX + col + 44, y - 36, SERIF_I, 10.5, NAVY, col - 40, 14)
    para(c, "Recorded as: a promise of N420,000 on CL-001 by 31 October; a dispute on CL-002; six follow ups, the first due tomorrow.",
         MX + col + 44, y - 100, "Helvetica", 9.4, BODY, col - 40, 12.5)
    c.showPage()


# ------------------------------------------------------------------ 11 ------
def s_live(c):
    chrome(c, "Built and running")
    y = heading(c, "Running in production since 7 October")
    gap = 18
    lw = W * 0.58
    ib = image(c, ASSETS / "live-check.png", MX, y - 16, lw)
    c.setFont("Helvetica-Oblique", 8.5)
    c.setFillColor(MUTED)
    c.drawString(MX, ib - 16, "consultforafrica.com/services/claims-recovery, live since 7 October 2026: the receivables check and the free review offer")
    x = MX + lw + gap
    rw = W - lw - gap
    items = [
        ("Public page", "A hospital enters its billing, days to payment and query rate, sees what is sitting outside the business, and asks for a free review of 20 claims."),
        ("Directory and funnel", "Every hospital, every contact and every stage from target to signed, with call and WhatsApp logging."),
        ("The desk", "Claims received from a spreadsheet, verified, decided, approved, advanced, chased and settled, with an append-only record of every step."),
        ("Data for Carbon", "Claim-level status, promises and payments, ready to share as a feed or a monthly file."),
    ]
    yy = y - 16
    for t, b in items:
        c.setFont("Helvetica-Bold", 11.5)
        c.setFillColor(NAVY)
        c.drawString(x, yy - 10, t)
        yy = para(c, b, x, yy - 26, "Helvetica", 9.8, BODY, rw, 13) - 12
    c.showPage()


# ------------------------------------------------------------------ 12 ------
def s_origination(c):
    chrome(c, "Origination")
    y = heading(c, "Where the first book comes from")
    data = [("Hospitals and clinics", 464), ("Eye and optical", 139), ("Dental", 100), ("Diagnostics and labs", 18), ("Physiotherapy", 4), ("Not yet classified", 74)]
    maxv = max(v for _, v in data)
    lx = MX
    bx = MX + 150
    bwid = W * 0.5 - 160
    top = y - 34
    kicker_line(c, "799 Lagos providers in our directory, by type", lx, y - 14)
    for i, (label, v) in enumerate(data):
        yy = top - i * 30
        c.setFont("Helvetica", 10.2)
        c.setFillColor(BODY)
        c.drawString(lx, yy - 12, label)
        c.setFillColor(NAVY if i == 0 else SKY)
        c.rect(bx, yy - 17, bwid * v / maxv, 16, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(NAVY)
        c.drawString(bx + bwid * v / maxv + 6, yy - 12, str(v))
    gx = MX + W * 0.55
    gw = W * 0.45
    stat(c, gx, y - 10, (gw - 12) / 2, 96, "702", "with a working email on file")
    stat(c, gx + (gw - 12) / 2 + 12, y - 10, (gw - 12) / 2, 96, "698", "with a direct phone number")
    stat(c, gx, y - 118, (gw - 12) / 2, 96, "21", "local government areas covered")
    stat(c, gx + (gw - 12) / 2 + 12, y - 118, (gw - 12) / 2, 96, "190", "in Eti-Osa alone, the densest private market")
    yb = top - len(data) * 30 - 24
    kicker_line(c, "How we reach them", MX, yb)
    bullet_block(c, [
        ("", "Direct: a call and a WhatsApp from a named person, then the free review of 20 claims. The review is the conversion step, and it costs the hospital nothing."),
        ("", "Through the profession: the Guild of Medical Directors and the private practitioners' associations have campaigned on HMO debts since at least 2022. One endorsed member offer is worth more than the whole cold list."),
        ("", "Through our own work: hospitals whose operations and accounts we already run or have audited."),
    ], MX, yb - 18, W, size=10.6, leading=14, gap=6)
    c.showPage()


# ------------------------------------------------------------------ 13 ------
def s_structure(c):
    chrome(c, "Structure")
    y = heading(c, "How Carbon gets to the cash")
    top = y - 20
    nw, nh = 190, 84
    cx = MX + (W - nw) / 2
    hx, hy = MX + 20, top - 250
    px, py = MX + W - nw - 20, top - 250
    kx, ky = cx, top - nh
    node(c, kx, ky, nw, nh, "Carbon", "lends to the hospital; holds the collection account; registers at the NCR")
    node(c, hx, hy, nw, nh, "Hospital", "borrower; assigns or charges the funded claims")
    node(c, px, py, nw, nh, "Health plan", "pays the claim into the collection account")
    node(c, cx, top - 250, nw, nh, "Consult for Africa", "originates, verifies, services, collects. Never lends.", fill=GOLD, tcol=INK, scol=INK)
    arrow(c, kx + 30, ky, hx + nw - 30, hy + nh, col=NAVY)
    c.setFont("Helvetica", 8.8)
    c.setFillColor(NAVY)
    c.drawString(MX + 150, top - 120, "advance, within 48 hours")
    arrow(c, px + 30, py + nh, kx + nw - 30, ky, col=TEAL)
    c.setFillColor(TEAL)
    c.drawString(px - 30, top - 120, "claim payment, to the account")
    arrow(c, hx + nw, hy + nh / 2, cx, hy + nh / 2, col=GOLD)
    arrow(c, cx + nw, hy + nh / 2, px, py + nh / 2, col=GOLD)
    c.setFillColor(MUTED)
    c.drawCentredString(hx + nw + (cx - hx - nw) / 2, hy + nh / 2 + 8, "claims")
    c.drawCentredString(cx + nw + (px - cx - nw) / 2, hy + nh / 2 + 8, "reconciliation")
    yb = hy - 20
    col = (W - 24) / 2
    bullet_block(c, [
        ("", "Collection account at Carbon with a domiciliation and lien; the plan is told to pay there."),
        ("", "Register every funded claim at the National Collateral Registry. Priority goes by time of registration (STMA s.33(3))."),
    ], MX, yb, col, size=10.2, leading=13.4, gap=5)
    bullet_block(c, [
        ("", "Serve notice of assignment on a plan only on default, slow payment or a set-off risk, so Carbon stays out of the hospital's relationship with the plan."),
        ("", "Vet for open clawbacks: set-off the plan acquires before notice binds the lender (s.33(1)(b))."),
    ], MX + col + 24, yb, col, size=10.2, leading=13.4, gap=5)
    source(c, "For Carbon's counsel to confirm: whether Carbon lends against the claims or buys them outright, and the notice and registration mechanics above.", y=44)
    c.showPage()


# ------------------------------------------------------------------ 14 ------
def s_roles(c):
    chrome(c, "Who does what")
    y = heading(c, "The division of labour, line by line")
    rows = [
        ["Carbon", "Consult for Africa", "The hospital"],
        ["Sets the credit policy and the facility limit for each hospital", "Brings the hospitals, verifies every claim before it is funded", "Assigns or charges the funded claims, and tells the plans where to pay"],
        ["Advances 60% of verified value within 48 hours", "Reconciles and recovers with the plans", "Provides records, and repairs claims we send back"],
        ["Holds the collection account the plans pay into", "Reports every claim's status to Carbon and the hospital", "Repays any advance on a claim rejected for a reason it controlled"],
        ["Prices the discount", "Keeps the claims data clean enough to lend on", "Submits its whole book with each plan, not only its worst claims"],
        ["Registers at the NCR and holds the security", "Runs the conflicts policy for any payer it advises", "Keeps submitting through the desk, not around it"],
    ]
    simple_table(c, rows, MX, y - 22, [W / 3.0] * 3, size=10.8, leading=14, pad=9)
    c.showPage()


# ------------------------------------------------------------------ 15 ------
def s_economics(c):
    chrome(c, "Carbon's side of the numbers")
    y = heading(c, "What the market pays for money like this")
    rows = [
        ["Reference point", "Price", "Source"],
        ["Bank invoice discounting (FirstBank)", "32% a year plus a 1% fee, 60-day tenor", "Published product terms"],
        ["Nigerian invoice finance, general", "1.5% to 4% a month, plus 0.5% to 2.5% fees", "Market survey, September 2026"],
        ["US medical receivables factoring", "70% to 90% advanced; 1% to 5% per 30 days", "Industry reports"],
        ["CBN monetary policy rate", "23%, cut from 26.5% on 22 September 2026", "CBN"],
    ]
    y = simple_table(c, rows, MX, y - 18, [250, 300, W - 550], size=10.4, leading=13.4, pad=7)
    y -= 22
    kicker_line(c, "Illustration: N100m of verified claims, 60% advanced, one 60-day cycle", MX, y)
    rows2 = [
        ["Monthly discount Carbon sets", "1.5%", "2.5%", "3.5%"],
        ["Deployed", "N60.0m", "N60.0m", "N60.0m"],
        ["Discount income per cycle", "N1.8m", "N3.0m", "N4.2m"],
        ["Over six cycles a year", "N10.8m", "N18.0m", "N25.2m"],
    ]
    cw0 = 260
    cwi = (W - cw0) / 3
    y = simple_table(c, rows2, MX, y - 12, [cw0, cwi, cwi, cwi], size=10.6, leading=13.6, pad=7)
    callout(c, MX, y - 14, W,
            "The discount is Carbon's to price. Opening at 60% leaves a cushion of 40% of verified value against tariff cuts, late claims and the discount itself, and the rate can rise for a plan once it has paid on time for two or three cycles.",
            bg=CREAM, spine=GOLD, size=10.8, leading=14.5)
    c.showPage()


# ------------------------------------------------------------------ 16 ------
def s_landscape(c):
    chrome(c, "Landscape")
    y = heading(c, "Nobody in Nigeria joins verification, recovery and funding.")
    rows = [
        ["Who", "What they do", "What it tells us"],
        ["Curacel", "Claims processing and fraud detection for insurers and HMOs, linking 800+ hospitals. Announced provider cash advances in 2021", "The rails exist; we could not confirm the advance product is live"],
        ["Medismarts", "Claims platform used by 20 to 25 HMOs, about 8.4m claims a year", "Sits on the HMO side, not the hospital's"],
        ["Medical Credit Fund and uniBank (Ghana, 2016)", "NHIS claims pre-financing: eligible claims assigned to the bank, a discounted amount paid out", "The closest precedent in West Africa. MCF reports 94% to 96% repayment across its health SME book"],
        ["Generic SME lenders", "Unsecured working capital", "Lidya's closure in 2025 is the cautionary tale"],
    ]
    y = simple_table(c, rows, MX, y - 18, [190, W - 190 - 260, 260], size=10.2, leading=13.4, pad=7.5)
    callout(c, MX, y - 16, W,
            "The gap is a lender that can trust what it is funding. That trust comes from verifying the claim and owning the recovery, which is the part we do.",
            bg=SURFACE, spine=TEAL, size=11.5, leading=15)
    c.showPage()


# ------------------------------------------------------------------ 17 ------
def s_risks(c):
    chrome(c, "Risks")
    y = heading(c, "What could go wrong, and what stops it")
    rows = [
        ["Risk", "What it looks like", "Control"],
        ["Adverse selection", "Hospitals send their weakest claims for funding", "Whole-book submission per plan to qualify; only verified PASS claims funded"],
        ["Fraud and duplicates", "Padded or invented claims; the same claim funded twice", "Duplicate checks on payer, amount and date; NCR search before funding; hospital warranty with recourse"],
        ["Payer failure", "A plan stops paying or loses accreditation", "Per-payer limits and the 40% concentration cap; lower or no advance on weak payers"],
        ["Set-off", "A plan deducts an old overpayment from a funded claim", "Vet for open clawbacks; serve notice as soon as a set-off risk appears"],
        ["Plan pushback", "A plan slows authorisations for hospitals that use the desk", "Reconciliation first; notices only when needed; the regulator only after the relationship route"],
        ["Conflict of interest", "We recover from a payer CFA also advises", "Written policy: that payer is never advanced against, and both sides are told in writing"],
        ["Data protection", "Health data leaves the hospital", "No patient names held or processed; claim references only; a data protection impact assessment before the pilot"],
    ]
    simple_table(c, rows, MX, y - 18, [150, 280, W - 430], size=9.8, leading=12.6, pad=6.5)
    c.showPage()


# ------------------------------------------------------------------ 18 ------
def s_pilot(c):
    chrome(c, "The pilot")
    y = heading(c, "Ninety days, eight to twelve hospitals, four numbers.")
    gap = 12
    tw = (W - 3 * gap) / 4
    tiles = [("8 to 12", "private hospitals in Lagos"), ("N100m to 200m", "of verified claims"), ("90 days", "from first batch to review"), ("4", "numbers that decide what happens next")]
    for i, (v, l) in enumerate(tiles):
        stat(c, MX + i * (tw + gap), y - 14, tw, 88, v, l, vsize=19)
    y -= 122
    rows = [
        ["Measure", "What it tells Carbon"],
        ["First-pass acceptance", "Share of verified claims the plan pays without query. The quality of our verification"],
        ["Days to cash", "Submission to payment into the collection account. How long Carbon's money is out"],
        ["Recovery rate", "Share of disputed value recovered. The quality of our recovery"],
        ["Loss rate", "Advances not repaid by the plan or the hospital. The number that sets the price"],
    ]
    y = simple_table(c, rows, MX, y - 6, [200, W - 200], size=10.4, leading=13.4, pad=7)
    y -= 16
    phases = [("Weeks 0 to 2", "Terms, counsel, collection accounts, data agreement"), ("Weeks 2 to 4", "Free reviews; first hospitals signed; first batches verified"), ("Weeks 4 to 12", "Funding cycles; weekly shared dashboard"), ("Day 90", "Decide rate, recourse and facility size on our own numbers")]
    pw = (W - 3 * 10) / 4
    for i, (t, b) in enumerate(phases):
        x = MX + i * (pw + 10)
        box(c, x, y - 64, pw, 64, NAVY if i == 3 else SURFACE)
        c.setFont("Helvetica-Bold", 10.5)
        c.setFillColor(GOLD if i == 3 else NAVY)
        c.drawString(x + 14, y - 20, t)
        para(c, b, x + 14, y - 36, "Helvetica", 9.2, LIGHT if i == 3 else BODY, pw - 24, 12)
    source(c, "Stop-loss and step-up triggers are agreed before the first advance: the loss rate that ends the pilot, and the payment record that lifts a plan's advance rate.", y=46)
    c.showPage()


# ------------------------------------------------------------------ 19 ------
def s_next_products(c):
    chrome(c, "What the same rails carry next")
    y = heading(c, "Three lines that follow once the claims history exists")
    cards = [
        ("Surgery finance for patients", "Our doctor network sees patients at the point where surgery is recommended and priced. The money goes straight to the facility, the surgeon confirms the procedure and the price is a fixed package, which is how this kind of lending keeps defaults low. Carbon's interest, and a natural second line."),
        ("Doctors' pending claims", "Specialists in private practice wait on the same plans as the hospitals do. The same verification and the same advance, sized for an individual practice."),
        ("Claims submission, done right first time", "Once a hospital's backlog is cleared, we take over its monthly claims preparation, so fewer claims are queried in the first place and the funded book gets cleaner every month."),
    ]
    gap = 16
    cw = (W - 2 * gap) / 3
    top = y - 20
    ch = 196
    for i, (t, b) in enumerate(cards):
        x = MX + i * (cw + gap)
        box(c, x, top - ch, cw, ch, CREAM if i == 0 else SURFACE, spine=GOLD if i == 0 else TEAL)
        yy = top - 30
        for line in wrap(c, t, SERIF_B, 15, cw - 40):
            c.setFont(SERIF_B, 15)
            c.setFillColor(INK)
            c.drawString(x + 22, yy, line)
            yy -= 19
        para(c, b, x + 22, yy - 8, "Helvetica", 10.4, BODY, cw - 40, 14.2)
    callout(c, MX, top - ch - 20, W,
            "The order matters. Recovery builds a claim-level payment history for every hospital and every plan, and that history is what lets Carbon price each of the next three lines with evidence rather than hope.",
            bg=SURFACE, spine=TEAL, size=11.5, leading=15.5)
    c.showPage()


# ------------------------------------------------------------------ 20 ------
def s_next(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    chevron_stack(c, PAGE_W - 228, 96, 160, 112, 13)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 62, 26, 3, fill=1, stroke=0)
    tracked(c, "FOR TOMORROW", MX + 36, PAGE_H - 63, "Helvetica-Bold", 10.5, GOLD, 2.2)
    c.setFont(SERIF_B, 26)
    c.setFillColor(white)
    c.drawString(MX, PAGE_H - 132, "Four things to settle, and then a first batch")
    bullet_block(c, [
        ("The route.", "Carbon lends against the claims, or buys them. Counsel on both sides to confirm."),
        ("The pilot.", "Facility size, the hospitals, and the stop-loss and step-up triggers."),
        ("The price.", "How Carbon sets the discount, and what moves it."),
        ("The data.", "What Carbon needs to underwrite, in what form, and how often."),
    ], MX, PAGE_H - 178, 540, size=12.3, leading=16.5, gap=12, body_color=LIGHT, tick=GOLD, lead_color=GOLD)
    box(c, MX, 104, 540, 58, D.IND, spine=GOLD)
    c.setFont(SERIF_I, 12.5)
    c.setFillColor(SAGE)
    c.drawString(MX + 22, 104 + 34, "Then, within a month: signed pilot terms, the first hospitals")
    c.drawString(MX + 22, 104 + 16, "reviewed, and a first verified batch ready to fund.")
    c.setFont("Helvetica", 10.5)
    c.setFillColor(SKY)
    c.drawString(MX, 70, "Dr Debo Odulana   /   hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com")
    c.setFillColor(GOLD)
    c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFont("Helvetica", 8)
    c.setFillColor(LIGHT)
    c.drawString(MX, 19, D.FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, f"{TOTAL} / {TOTAL}")
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Carbon: Hospital Receivables Partnership")
    c.setAuthor("Consult for Africa")
    cover(c)
    for fn in (s_summary, s_problem, s_stuck, s_why_now, s_service, s_flow, s_rules, s_verification,
               s_recovery, s_live, s_origination, s_structure, s_roles, s_economics, s_landscape,
               s_risks, s_pilot, s_next_products):
        fn(c)
    s_next(c)
    c.save()
    print("wrote", OUT)
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
