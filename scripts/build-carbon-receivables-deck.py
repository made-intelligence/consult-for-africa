"""
Carbon: the hospital receivables partnership deck.

Follow-up to Debo's meeting with Chijioke Dozie on 4 October 2026. Carbon is
the funder, CFA vets, reconciles and recovers, and the hospital gets 60% of a
vetted claim within 48 hours. Scope is hospital debt recovery only; patient
surgery finance and the Mezo claims advance are a later conversation and get
one line on the last page.

Carbon is a partner, not a client, so no CFA client is named. CFA's share of
the discount and its recovery fee are not stated anywhere in the deck.

Run:
  python3 scripts/build-carbon-receivables-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib.colors import white           # noqa: E402
from reportlab.lib.pagesizes import A4, landscape  # noqa: E402
from reportlab.pdfgen import canvas              # noqa: E402
from reportlab.lib.utils import ImageReader      # noqa: E402

import cfa_deck as D                             # noqa: E402
from cfa_deck import (                           # noqa: E402
    BODY, CREAM, DOCS, GOLD, INK, MX, NAVY, PAGE_H, PAGE_W, SAGE, SKY, SURFACE,
    SERIF_B, SERIF_I, TEAL, DEEP_NAVY,
    box, bullet_block, callout, chevron_stack, chrome, heading, para,
    simple_table, tracked, wrap,
)

OUT = ROOT / "docs" / "carbon" / "carbon-hospital-receivables-deck-cfa.pdf"
SHARE = ROOT / "docs" / "Carbon - Hospital Receivables Partnership (Deck).pdf"

D.FOOTER[0] = "Consult for Africa   /   Private and confidential   /   Prepared for Carbon"
D.TOTAL[0] = "10"

W = PAGE_W - 2 * MX
PANEL_W = 240


# ----------------------------------------------------------------- cover -----
def cover(c):
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)

    px = PAGE_W - PANEL_W
    c.setFillColor(SURFACE)
    c.rect(px, 0, PANEL_W, PAGE_H - 10, fill=1, stroke=0)
    # A quiet colour field: no chevrons on covers.

    try:
        _lg = ImageReader(str(DOCS / "c4a-logo.png"))
        _lw, _lh = _lg.getSize()
        _h = 32.0
        c.drawImage(_lg, MX, PAGE_H - 94, width=_h * _lw / _lh, height=_h,
                    mask="auto")
    except Exception:
        pass

    c.setFillColor(GOLD)
    c.rect(MX, 424, 44, 3, fill=1, stroke=0)
    tracked(c, "PREPARED FOR CARBON", MX, 398, "Helvetica-Bold", 10.5, TEAL, 2.6)

    c.setFont(SERIF_B, 34)
    c.setFillColor(INK)
    y = 344
    for line in wrap(c, "Hospital receivables, recovered and advanced",
                     SERIF_B, 34, 520):
        c.drawString(MX, y, line)
        y -= 42

    c.setFont(SERIF_I, 15)
    c.setFillColor(D.MUTED)
    y -= 2
    for line in wrap(c, "A partnership in which Carbon funds and we vet, reconcile "
                        "and collect.", SERIF_I, 15, 500):
        c.drawString(MX, y, line)
        y -= 21

    c.setStrokeColor(D.RULE)
    c.setLineWidth(0.9)
    c.line(MX, 182, px - 26, 182)
    band = [
        (0, "PREPARED FOR", "Chijioke Dozie, Carbon"),
        (170, "PREPARED BY", "Consult for Africa"),
        (310, "DATE", "October 2026"),
    ]
    for dx, label, value in band:
        tracked(c, label, MX + dx, 160, "Helvetica-Bold", 8.0, TEAL, 1.9)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(NAVY)
        c.drawString(MX + dx, 138, value)

    c.setFont("Helvetica", 9)
    c.setFillColor(D.MUTED)
    c.drawString(MX, 86, "Private and confidential. A basis for discussion, not an "
                         "offer of terms.")
    c.showPage()


# ------------------------------------------------------------ 02 problem -----
def s_problem(c):
    chrome(c, "The problem")
    y = heading(c, "Private hospitals in Nigeria are owed money they have already earned.")
    y = para(c, "Most of a private hospital's receivables are owed by health plans, with "
                "corporate accounts and the national scheme behind them. Payment commonly "
                "takes three to six months, and some claims are never settled at all "
                "because nobody on either side has the time to work through the "
                "dispute. Meanwhile salaries, consumables and the pharmacy are paid "
                "this month.",
             MX, y - 20, "Helvetica", 12.5, BODY, W - 300, 18)
    y = para(c, "We see this from inside. In one hospital we audited this year, about a "
                "month of revenue was sitting outside the business, split between unpaid "
                "claims and stock. Its owners thought it had a profit problem. It was "
                "short of cash, which needs a different fix.",
             MX, y - 12, "Helvetica", 12.5, BODY, W - 300, 18)
    callout(c, PAGE_W - MX - 270, PAGE_H - 150, 270,
            "A hospital that is trading at a profit can still run out of cash, and "
            "unpaid claims are usually the reason.",
            bg=CREAM, spine=GOLD, size=12, leading=16.5)
    c.showPage()


# ------------------------------------------------------------- 03 stuck ------
def s_stuck(c):
    chrome(c, "Why the money is stuck")
    y = heading(c, "Most of it is disputed. Very little of it is refused.")
    rows = [
        ["Why the claim is unpaid", "What clears it", "Recoverable"],
        ["No pre-authorisation code, or the code does not match the service billed",
         "Retrospective authorisation, agreed with the plan's medical team", "Usually"],
        ["Billed above the agreed tariff, or on an old tariff",
         "Rebill at the agreed rate; the gap is written off, not the claim", "Mostly"],
        ["Missing documents: notes, results, discharge summary",
         "Pull the record and resubmit inside the plan's window", "Usually"],
        ["Submitted late, or never submitted", "Depends on the plan's window and goodwill",
         "Sometimes"],
        ["The plan is slow to pay across the board", "Escalation and a payment schedule",
         "Slowly"],
        ["The enrollee was not covered, or the plan has failed",
         "Bill the patient or employer, or write it off", "Rarely"],
    ]
    y = simple_table(c, rows, MX, y - 22, [330, W - 330 - 110, 110],
                     size=10.8, leading=14, pad=8)
    callout(c, MX, y - 16, W,
            "Recovery here is mostly reconciliation. We know the people in the claims "
            "and medical teams at the plans, and a dispute settled at that level gets "
            "paid without anyone being threatened.",
            bg=SURFACE, spine=TEAL, size=11.8, leading=16)
    c.showPage()


# ----------------------------------------------------------- 04 service ------
def s_service(c):
    chrome(c, "What we do")
    y = heading(c, "Vet, reconcile, recover")
    y = para(c, "One desk, run by people who have run hospitals and sat across the table "
                "from health plans.",
             MX, y - 14, "Helvetica", 12.5, BODY, W, 18)
    cols = [
        ("Vet", "Every claim is checked against the plan's tariff, the authorisation "
                "record and the clinical notes before it is funded. Claims that will "
                "not pay are kept out of the advance and sent to repair instead."),
        ("Reconcile", "We match what the hospital billed against what each plan says it "
                      "owes, and clear the gap claim by claim, with the plan, at the "
                      "level where the decision is actually made."),
        ("Recover", "We chase, escalate and settle, and payment goes to an account Carbon "
                    "controls. Every claim is tracked from submission to cash, and the "
                    "hospital sees the same status we do."),
    ]
    gap = 18
    bw = (W - 2 * gap) / 3.0
    top = y - 24
    bh = 230
    for i, (t, body) in enumerate(cols):
        x = MX + i * (bw + gap)
        box(c, x, top - bh, bw, bh, SURFACE, spine=GOLD if i == 1 else TEAL)
        c.setFont(SERIF_B, 18)
        c.setFillColor(INK)
        c.drawString(x + 22, top - 38, t)
        para(c, body, x + 22, top - 66, "Helvetica", 11.5, BODY, bw - 40, 16)
    c.showPage()


# ----------------------------------------------------------- 05 advance ------
def s_advance(c):
    chrome(c, "The advance")
    y = heading(c, "60% of a vetted claim, paid within 48 hours.")
    steps = [
        ("1", "Hospital submits", "a batch of claims and the records behind them"),
        ("2", "We vet", "and pass the claims that will pay"),
        ("3", "Carbon advances", "60% of the vetted value, within 48 hours"),
        ("4", "We recover", "and the plan pays into the controlled account"),
        ("5", "Settlement", "Carbon is repaid with its discount; the hospital gets the rest"),
    ]
    gap = 12
    bw = (W - 4 * gap) / 5.0
    top = y - 30
    bh = 150
    for i, (n, t, body) in enumerate(steps):
        x = MX + i * (bw + gap)
        fill = NAVY if i == 2 else SURFACE
        box(c, x, top - bh, bw, bh, fill)
        c.setFont(SERIF_B, 26)
        c.setFillColor(GOLD)
        c.drawString(x + 16, top - 40, n)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(white if i == 2 else NAVY)
        c.drawString(x + 16, top - 64, t)
        para(c, body, x + 16, top - 84, "Helvetica", 10.5,
             D.LIGHT if i == 2 else BODY, bw - 28, 14)
        if i < 4:
            c.setFillColor(GOLD)
            ax = x + bw + 2
            ay = top - bh / 2.0
            p = c.beginPath()
            p.moveTo(ax, ay + 5)
            p.lineTo(ax + 8, ay)
            p.lineTo(ax, ay - 5)
            p.close()
            c.drawPath(p, fill=1, stroke=0)
    y = top - bh - 26
    y = para(c, "Sixty per cent is where we would open. The remaining 40% covers the "
                "rebilling at tariff, the odd claim that still fails after vetting, and "
                "Carbon's discount. Once a plan has paid on time for two or three "
                "cycles, its claims can earn a higher rate.",
             MX, y, "Helvetica", 12, BODY, W, 17)
    c.showPage()


# ------------------------------------------------------------- 06 roles ------
def s_roles(c):
    chrome(c, "Who does what")
    y = heading(c, "Carbon lends. We never hold the money or the credit risk.")
    rows = [
        ["Carbon", "Consult for Africa", "The hospital"],
        ["Sets the credit policy and the facility limit for each hospital",
         "Brings the hospitals, vets every claim before it is funded",
         "Assigns the funded claims and tells the plans where to pay"],
        ["Advances 60% of vetted value within 48 hours",
         "Reconciles and recovers with the plans",
         "Provides records, and repairs claims we send back"],
        ["Holds the controlled account the plans pay into",
         "Reports every claim's status to Carbon and the hospital",
         "Repays any advance on a claim rejected for a reason it controlled"],
        ["Prices the discount", "Keeps the claims data clean enough to lend on",
         "Keeps submitting through the desk, not around it"],
    ]
    simple_table(c, rows, MX, y - 22, [W / 3.0] * 3, size=11, leading=14.5, pad=9)
    c.showPage()


# -------------------------------------------------------------- 07 risk ------
def s_risk(c):
    chrome(c, "Keeping losses low")
    y = heading(c, "The vetting is the underwriting.")
    y = para(c, "A claim is better collateral than most unsecured loans, because before "
                "funding it we can see who owes it, what was authorised and whether the "
                "paperwork will survive the plan's review. Losses come from funding "
                "claims that were never going to pay, and vetting is how those are "
                "kept out.",
             MX, y - 18, "Helvetica", 12.5, BODY, W, 18)
    rows = [
        ["Control", "How it works"],
        ["Fund only what passes vetting", "Authorisation, tariff and records checked before any advance"],
        ["Cap the age of claims", "Nothing older than an agreed age at submission is funded"],
        ["Limit concentration", "No single plan above an agreed share of any hospital's book"],
        ["Control where the money lands", "Plans told of the assignment and pay into Carbon's account"],
        ["Recourse where the hospital caused the loss", "Rejections for documentation or authorisation come back to the hospital"],
        ["Start with hospitals we know", "The first book comes from hospitals whose accounts we have already audited"],
    ]
    simple_table(c, rows, MX, y - 16, [260, W - 260], size=11, leading=14, pad=8)
    c.showPage()


# ------------------------------------------------------------- 08 terms ------
def s_terms(c):
    chrome(c, "To agree between us")
    y = heading(c, "Terms to settle before the first advance")
    rows = [
        ["Term", "Our opening view"],
        ["Advance rate", "60% of vetted value, rising by payer once a plan pays reliably"],
        ["Disbursement", "Within 48 hours of a batch passing vetting"],
        ["Discount", "Carbon's to price, by days outstanding"],
        ["Recourse", "To the hospital for rejections within its control. Losses from a "
                     "plan failing are a question for the pilot"],
        ["Long stop", "An unpaid advance falls due from the hospital at an agreed date"],
        ["Collections", "A controlled account at Carbon, with notice of assignment to each plan"],
        ["Data", "Claim-level performance shared with Carbon monthly, under a data "
                 "sharing agreement that complies with the NDPA"],
        ["Scope", "Health plans and corporate accounts only. No collection from patients"],
    ]
    simple_table(c, rows, MX, y - 20, [170, W - 170], size=11, leading=14, pad=8)
    c.showPage()


# ------------------------------------------------------------- 09 pilot ------
def s_pilot(c):
    chrome(c, "Starting small")
    y = heading(c, "A ninety day pilot with hospitals we have audited")
    y = bullet_block(c, [
        ("", "Three to five private hospitals in Lagos and Abuja, chosen from those we "
             "have already audited, so the first book is not a guess."),
        ("", "A pilot facility sized by Carbon, with a limit per hospital and per plan."),
        ("", "Measured on days from submission to cash, the share of disputes cleared, "
             "advances repaid on time, and losses."),
        ("", "At day ninety, both sides decide on the advance rate, the recourse terms and "
             "whether to widen the facility, using the pilot's own numbers."),
    ], MX, y - 24, W - 300, size=12.5, leading=17, gap=13)
    callout(c, PAGE_W - MX - 266, PAGE_H - 150, 266,
            "A small pilot should still produce Carbon's first claim-level default "
            "data on Nigerian health plans. There is very little of that anywhere.",
            bg=CREAM, spine=GOLD, size=11.5, leading=15.5)
    c.showPage()


# -------------------------------------------------------------- 10 next ------
def s_next(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    chevron_stack(c, PAGE_W - 228, 96, 160, 112, 13)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 62, 26, 3, fill=1, stroke=0)
    tracked(c, "WHAT HAPPENS NEXT", MX + 36, PAGE_H - 63, "Helvetica-Bold", 10.5,
            GOLD, 2.2)

    c.setFont(SERIF_B, 26)
    c.setFillColor(white)
    y = PAGE_H - 132
    for line in wrap(c, "From here to a first advance", SERIF_B, 26, 560):
        c.drawString(MX, y, line)
        y -= 33

    y = bullet_block(c, [
        ("This week.", "A working session on the terms page, with whoever sets "
                       "Carbon's credit policy."),
        ("Within a fortnight.", "A shortlist of pilot hospitals, a sample of their "
                                "claims for Carbon to test against its own model, and "
                                "the data sharing agreement."),
        ("Within a month.", "Signed pilot terms, and a first vetted batch."),
    ], MX, y - 18, 530, size=12.5, leading=17.0, gap=13,
        body_color=D.LIGHT, tick=GOLD, lead_color=GOLD)

    box(c, MX, 92, 530, 62, D.IND, spine=GOLD)
    c.setFont(SERIF_I, 12.5)
    c.setFillColor(SAGE)
    c.drawString(MX + 22, 92 + 37,
                 "Later, and separately: financing surgery for patients through")
    c.drawString(MX + 22, 92 + 19, "the doctors in our network.")

    c.setFont("Helvetica", 10.5)
    c.setFillColor(SKY)
    c.drawString(MX, 62, "hello@consultforafrica.com   /   +234 913 813 8553   /   "
                         "consultforafrica.com   /   Lagos and Abuja")

    c.setFillColor(GOLD)
    c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFont("Helvetica", 8)
    c.setFillColor(D.LIGHT)
    c.drawString(MX, 19, D.FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, "10 / 10")
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Carbon: Hospital Receivables Partnership")
    c.setAuthor("Consult for Africa")
    cover(c)
    for fn in (s_problem, s_stuck, s_service, s_advance, s_roles, s_risk,
               s_terms, s_pilot):
        fn(c)
    s_next(c)
    c.save()
    print("wrote", OUT)
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
