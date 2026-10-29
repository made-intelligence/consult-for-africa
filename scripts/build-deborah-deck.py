"""
Consult for Africa: the management proposal deck for Deborah Multi-Specialist
Hospital and Diagnostics, Akure.

Profile and proposal in one document, because the request came straight from
the family (Tobi Koyejo) and asked for a hospital management company, not for
a capabilities brochure. Consult for Africa is the parent and the signatory
voice; Mezo appears as its operating platform. We have not visited the
hospital, so every fact about Deborah is one it has published itself, and the
terms match the Ethereal and Dennis Ashley engagements.

Copy is written plainly: factual headings, no slogans, no rhetorical turns.

Run:
  python3 scripts/build-deborah-deck.py
"""
from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cfa_deck import (BODY, CREAM, DEEP_NAVY, DOCS, FOOTER, GOLD, IND, IND2, IND3, INK,
                      IVORY, MX, NAVY, PAGE_H, PAGE_W, RULE, SAGE_D, SERIF, SERIF_B,
                      SERIF_I, SKY, SURFACE, TEAL, TOTAL, box, bullet_block, callout,
                      chevron_stack, chrome, hairline, heading, para, simple_table, tracked)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "deborah" / "cfa-deborah-management-proposal.pdf"
REF = "MZ-ENG-DEB-2026"
LINK = "consultforafrica.com/DeborahProject"

FOOTER[0] = "Consult for Africa   /   Management proposal for Deborah Hospital, Akure   /   Private and Confidential"
TOTAL[0] = "12"

GOLD_D = HexColor("#9A7B18")
SLATE = HexColor("#5A6478")
PALE = HexColor("#AEBBD4")
MEZO_TEAL = HexColor("#00C2A0")


def _logo(c, name, x, y, w=None, h=None):
    """Draw a logo from docs/ by width or height, keeping its aspect. Returns the drawn size."""
    try:
        img = ImageReader(str(DOCS / name))
    except Exception:
        return 0, 0
    iw, ih = img.getSize()
    if w is None:
        w = h * iw / ih
    if h is None:
        h = w * ih / iw
    c.drawImage(img, x, y, width=w, height=h, mask="auto", preserveAspectRatio=True)
    return w, h


def _mezo_lockup(c, x, y, h=18, text_color=INK):
    """The Mezo mark with the name set beside it."""
    w, _ = _logo(c, "mezo-mark.png", x, y, h=h)
    c.setFont(SERIF_B, h * 0.95)
    c.setFillColor(text_color)
    c.drawString(x + w + 7, y + h * 0.18, "Mezo")
    return w + 7 + c.stringWidth("Mezo", SERIF_B, h * 0.95)


def _proof(c, label, big, cap, note, top=400, h=250):
    """The right-hand panel: one number, what it was, and a line of context."""
    px = PAGE_W - MX - 268
    box(c, px, top - h, 268, h, CREAM, GOLD, 5)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(GOLD_D)
    c.drawString(px + 22, top - 28, label)
    c.setFont(SERIF_B, 36 if len(big) < 8 else 30)
    c.setFillColor(INK)
    c.drawString(px + 22, top - 80, big)
    ny = para(c, cap, px + 22, top - 98, "Helvetica", 10.2, BODY, 226, 13.8)
    if note:
        hairline(c, px + 22, ny - 8, 224, HexColor("#E3D6AE"), 0.8)
        para(c, note, px + 22, ny - 26, SERIF_I, 10, SLATE, 226, 13.6)


def _left(c, kicker, head, frame, bullets, size=10.6):
    chrome(c, kicker)
    hy = heading(c, head, max_w=PAGE_W - 2 * MX - 290)
    y = para(c, frame, MX, hy - 14, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 320, 15.8)
    bullet_block(c, bullets, MX, y - 20, PAGE_W - 2 * MX - 320, size=size, leading=14.2, gap=9)


# ------------------------------------------------------------------ 01 -------
def slide_cover(c):
    c.setFillColor(IVORY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    chevron_stack(c, PAGE_W - 286, 236, 400, 236, 32,
                  colours=[(HexColor("#EEF2F7"), 16.0), (HexColor("#E7EDF4"), 13.0),
                           (HexColor("#E0E8F1"), 10.0), (HexColor("#D9E3EE"), 7.5)])
    w, _ = _logo(c, "c4a-logo.png", MX, PAGE_H - 78, w=180)
    if not w:
        c.setFillColor(INK)
        c.setFont(SERIF_B, 15)
        c.drawString(MX, PAGE_H - 56, "CONSULT FOR AFRICA")

    tracked(c, "PREPARED FOR", PAGE_W - MX - 196, PAGE_H - 44, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    c.setFont(SERIF_B, 14)
    c.setFillColor(INK)
    c.drawRightString(PAGE_W - MX, PAGE_H - 66, "Chief (Mrs) Remilekun Ibidapo")
    c.setFont(SERIF_I, 9.6)
    c.setFillColor(SAGE_D)
    c.drawRightString(PAGE_W - MX, PAGE_H - 83, "Founder and Chief Executive, and the Board")
    c.drawRightString(PAGE_W - MX, PAGE_H - 97, "Deborah Multi-Specialist Hospital and Diagnostics, Akure")

    tracked(c, "MANAGEMENT PROPOSAL  /  OCTOBER 2026  /  REF " + REF, MX, PAGE_H - 152,
            "Helvetica-Bold", 7.6, GOLD, 2.4)
    c.setFont(SERIF, 34)
    c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 208, "Management proposal for")
    c.setFont(SERIF_B, 34)
    c.drawString(MX, PAGE_H - 250, "Deborah Hospital, Akure")
    hairline(c, MX, PAGE_H - 278, 300, GOLD, 1.4)
    py = para(c, "Consult for Africa proposes to manage Deborah through Mezo, our hospital management "
                 "platform. Ownership, the Deborah name and clinical governance remain with the family.",
              MX, PAGE_H - 308, SERIF_I, 12.6, IND2, 470, 18)
    c.setFont("Helvetica", 8.4)
    c.setFillColor(SAGE_D)
    c.drawString(MX, py - 22, "Delivered through")
    _mezo_lockup(c, MX + 78, py - 28, h=16)

    tiles = [("N1.0bn", "monthly revenue at a 75-bed tertiary hospital in Abuja under our "
                        "management, its best year in sixteen years"),
             ("USD 1.1m", "annual cost savings at a 165-bed tertiary hospital, with patient "
                          "volumes maintained"),
             ("10,000+", "verified Nigerian clinicians on the registry we maintain")]
    tw = (PAGE_W - 2 * MX - 2 * 18) / 3.0
    for i, (big, cap) in enumerate(tiles):
        tx = MX + i * (tw + 18)
        c.setFillColor(SURFACE)
        c.roundRect(tx, 104, tw, 96, 7, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(tx, 196, 46, 3, fill=1, stroke=0)
        c.setFont(SERIF_B, 25)
        c.setFillColor(INK)
        c.drawString(tx + 18, 160, big)
        para(c, cap, tx + 18, 146, "Helvetica", 9, BODY, tw - 36, 12.4)

    c.setFont(SERIF_B, 10.4)
    c.setFillColor(INK)
    c.drawString(MX, 70, "Dr Debo Odulana")
    c.setFont("Helvetica", 9)
    c.setFillColor(SAGE_D)
    c.drawString(MX, 55, "Founding Partner, Consult for Africa")
    c.drawRightString(PAGE_W - MX, 70, "hello@consultforafrica.com   /   +234 913 813 8553")
    c.drawRightString(PAGE_W - MX, 55, "consultforafrica.com   /   Lagos and Abuja")


# ------------------------------------------------------------------ 02 -------
def slide_who(c):
    chrome(c, "About us")
    hy = heading(c, "Our experience running hospitals")
    para(c, "Consult for Africa is the parent company of Mezo. Our team has run hospitals as founders "
            "and chief executives, and we take on full management mandates as well as advisory work.",
         MX, hy - 14, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 20, 16)

    y = hy - 68
    steps = [("2019", "Doctoora", "Built a private healthcare network across 21 states, later "
                                  "acquired by Evercare"),
             ("2020", "Eti-Osa", "Set up and ran the Eti-Osa COVID isolation centre: 90 beds, a "
                                 "10-bed ICU and the state reporting dashboard, in six weeks"),
             ("2021", "Evercare", "Chief Innovation and Strategy Officer. Reduced annual costs by "
                                  "USD 1.1m and introduced pay for performance"),
             ("2024", "Cedarcrest", "Chief Executive. N1.0bn monthly revenue and N1bn EBITDA in "
                                    "the first half, the hospital's best year"),
             ("Now", "Mezo", "Our hospital management platform: the management team, hospital "
                             "systems and patient referral network")]
    cols = [IND, IND2, IND3, SKY, GOLD]
    bw = (PAGE_W - 2 * MX - 4 * 12) / 5.0
    for i, (yr, lab, txt) in enumerate(steps):
        bx = MX + i * (bw + 12)
        box(c, bx, y - 124, bw, 124, SURFACE if i < 4 else CREAM, cols[i], 4)
        c.setFont("Helvetica-Bold", 7.4)
        c.setFillColor(cols[i] if i < 4 else GOLD_D)
        c.drawString(bx + 14, y - 22, yr.upper())
        if lab == "Mezo":
            _mezo_lockup(c, bx + 14, y - 46, h=14)
        else:
            c.setFont(SERIF_B, 12.6)
            c.setFillColor(INK)
            c.drawString(bx + 14, y - 42, lab)
        para(c, txt, bx + 14, y - 62, "Helvetica", 8.9, BODY, bw - 28, 12.2)

    callout(c, MX, y - 150, PAGE_W - 2 * MX,
            "Your contract would be with Consult for Africa. Mezo provides the management team on site, "
            "the hospital systems they work on, and the referral network that brings in patients.",
            bg=CREAM, spine=GOLD, fg=INK, size=12.4, leading=17)


# ------------------------------------------------------------------ 03 -------
def slide_partners(c):
    chrome(c, "Partners")
    hy = heading(c, "Our platform and partners")
    para(c, "The organisations Deborah would be working alongside.",
         MX, hy - 14, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 20, 16)

    cards = [
        ("mezo", "Mezo",
         "Consult for Africa's hospital management platform. It supplies the management team, "
         "billing and clinical systems, the payer desk, and patient bookings through mezohealth.com."),
        ("medbury-logo.png", "Medbury Healthcare Group",
         "Consult for Africa manages Medbury's healthcare division across Lagos and Abuja, covering "
         "finance, procurement, clinical governance, technology, and sales and marketing."),
        (None, "Doctors Foundation for Care",
         "A network of more than 1,000 diaspora-trained Nigerian physicians. It arranges three to six "
         "month specialist placements in Nigerian hospitals."),
    ]
    cw = (PAGE_W - 2 * MX - 2 * 18) / 3.0
    top = hy - 60
    ch = 250
    for i, (logo, name, body) in enumerate(cards):
        bx = MX + i * (cw + 18)
        box(c, bx, top - ch, cw, ch, SURFACE, [TEAL, GOLD, IND2][i], 5)
        ly = top - 76
        if logo == "mezo":
            _mezo_lockup(c, bx + 22, ly + 10, h=30)
        elif logo:
            _logo(c, logo, bx + 22, ly, h=46)
        else:
            c.setFont(SERIF_B, 15)
            c.setFillColor(INK)
            c.drawString(bx + 22, ly + 22, "Doctors Foundation")
            c.drawString(bx + 22, ly + 4, "for Care")
        hairline(c, bx + 22, top - 96, cw - 44, RULE, 0.8)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(SAGE_D)
        c.drawString(bx + 22, top - 116, name.upper())
        para(c, body, bx + 22, top - 136, "Helvetica", 10, BODY, cw - 44, 14)


# ------------------------------------------------------------------ 04 -------
def slide_deborah(c):
    chrome(c, "Deborah today")
    hy = heading(c, "What Deborah already has")
    para(c, "Deborah was founded so that families in Ondo State could get good care at home instead of "
            "travelling to Lagos or abroad. The hospital already has the facilities to do this.",
         MX, hy - 14, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 20, 16)

    cards = [("50 beds, tertiary services", "Paediatrics, obstetrics and gynaecology, surgery, internal "
                                            "medicine, cardiology and family health, open 24 hours."),
             ("Advanced diagnostics", "MRI, a 64-slice CT, digital mammography, endoscopy, X-ray, "
                                      "ultrasound and a full laboratory on one site."),
             ("Dialysis", "Patients attend two or three times a week, which supports a long-term "
                          "nephrology practice."),
             ("Founder and international partners", "Founded by a US-trained nurse to reduce medical "
                                                    "travel, with partner hospitals in the US and "
                                                    "Europe.")]
    cw = (PAGE_W - 2 * MX - 16) / 2.0
    top = hy - 52
    for i, (h, b) in enumerate(cards):
        bx = MX + (i % 2) * (cw + 16)
        by = top - (i // 2) * 92
        box(c, bx, by - 80, cw, 80, SURFACE, TEAL, 4)
        c.setFont(SERIF_B, 12.4)
        c.setFillColor(INK)
        c.drawString(bx + 18, by - 24, h)
        para(c, b, bx + 18, by - 42, "Helvetica", 9.6, BODY, cw - 36, 12.8)

    callout(c, MX, top - 196, PAGE_W - 2 * MX,
            "The building and equipment are in place. Returns now depend on how well the beds, scanners "
            "and dialysis unit are used, which is the work a management team is accountable for.",
            bg=CREAM, spine=GOLD, fg=INK, size=12.2, leading=16.6)
    para(c, "We have not yet visited the hospital. This page is based on Deborah's published information, "
            "and the diagnostic audit will confirm the details.",
         MX, 52, SERIF_I, 9.6, SLATE, PAGE_W - 2 * MX, 13)


# ------------------------------------------------------------------ 05 -------
def slide_why(c):
    chrome(c, "The case for management")
    hy = heading(c, "Why a management partner")
    rows = [("01", "The equipment is in place. Returns depend on utilisation.",
             "An MRI, CT scanner or dialysis unit costs roughly the same to run at four hours a day as "
             "at sixteen, so most of the margin comes from additional volume. That volume comes from "
             "management and referrals rather than further investment."),
            ("02", "Patients in the region still travel for care Deborah provides.",
             "Patients from Ondo, Ekiti and neighbouring states still go to Ibadan or Lagos for imaging, "
             "dialysis and specialist care. Keeping them requires a referral desk, payer contracts and "
             "prompt reports back to referring doctors."),
            ("03", "Specialist cover is difficult to staff outside Lagos and Abuja.",
             "A single hospital in Akure cannot carry a full consultant team on its own payroll. A "
             "network can provide cover through visiting clinics, teleconsultation and rotating "
             "specialists.")]
    y = hy - 40
    for i, (n, h, b) in enumerate(rows):
        c.setFont(SERIF_B, 26)
        c.setFillColor(GOLD)
        c.drawString(MX, y - 4, n)
        c.setFont(SERIF_B, 14)
        c.setFillColor(INK)
        c.drawString(MX + 62, y, h)
        ny = para(c, b, MX + 62, y - 20, "Helvetica", 10.6, BODY, PAGE_W - 2 * MX - 70, 14.6)
        if i < 2:
            hairline(c, MX, ny - 6, PAGE_W - 2 * MX, RULE, 0.7)
        y = ny - 30


# ------------------------------------------------------------------ 06 -------
def slide_run(c):
    _left(c, "How we would run it", "Scope of management",
          "We would manage the whole hospital day to day, clinical support and non-clinical, against "
          "targets agreed with the board and a baseline set during the audit.",
          [("Management team.", "We appoint a hospital administrator and operating team, assessed "
                                "before appointment, so the hospital does not depend on one or two "
                                "individuals."),
           ("Referrals.", "A referral desk working with doctors and hospitals in Ondo, Ekiti and Osun, "
                          "with reports and discharge summaries returned to each referrer."),
           ("Payer contracts.", "HMOs, NHIA, the Ondo State contributory scheme, and the universities, "
                                "government institutions and employers in Akure."),
           ("Billing and collections.", "Every encounter billed through our platform, collections "
                                        "reconciled daily and claims followed through to payment."),
           ("Procurement.", "Pharmacy, consumables and service contracts bought on network terms."),
           ("Reporting.", "Live dashboards for the family and the board, and a weekly performance "
                          "review.")])
    _proof(c, "TRACK RECORD", "N1bn",
           "EBITDA in the first half of the year at a 75-bed tertiary hospital in Abuja, more than the "
           "whole of the previous year, without adding capacity.",
           "Achieved through tariff review, service mix and revenue controls, the same approach we "
           "would take at Deborah.")


# ------------------------------------------------------------------ 07 -------
def slide_specialists(c):
    _left(c, "Specialist cover", "Specialist cover in Akure",
          "Deborah keeps a resident core team, and our network provides specialist cover around it, so "
          "patients can see a specialist in Akure instead of being referred elsewhere.",
          [("Resident team.", "Medical officers, nurses and the administrator are based in Akure, so "
                              "routine care does not depend on visiting staff."),
           ("Visiting consultant clinics.", "Network specialists run scheduled clinics and theatre "
                                            "lists at Deborah, booked in advance."),
           ("Teleconsultation.", "Specialist video consultations on our platform for follow-ups and "
                                 "second opinions. This is already running."),
           ("Diaspora specialists.", "Three to six month placements by physicians trained in the UK, "
                                     "US, Canada and Europe, through the Doctors Foundation for Care."),
           ("Locum cover.", "Short-term clinical cover arranged within days to cover leave and staff "
                            "turnover.")])
    _proof(c, "OUR CLINICIAN NETWORK", "10,000+",
           "verified Nigerian clinicians across sixteen cadres on our registry, with salary and "
           "availability data by cadre and by state.",
           "In addition, more than 1,000 diaspora-trained Nigerian physicians through the Doctors "
           "Foundation for Care.")


# ------------------------------------------------------------------ 08 -------
def slide_demand(c):
    _left(c, "Patient demand", "Where patients will come from",
          "We would develop five sources of patients, listed roughly in the order we expect them to "
          "contribute.",
          [("Referring doctors.", "GPs and smaller hospitals in the region that need imaging, dialysis "
                                  "or a specialist opinion for their patients, with reports sent back "
                                  "to them."),
           ("Insured patients.", "HMO, NHIA and state scheme members, attracted by quick "
                                 "authorisations and clean claims."),
           ("Employers and institutions.", "Annual health checks, staff health programmes and "
                                           "retainers with organisations in Akure."),
           ("Diaspora families.", "Nigerians abroad paying for their parents' care at home, often in "
                                  "foreign currency."),
           ("Online bookings.", "Deborah's doctors, services and packages listed on mezohealth.com "
                                "and bookable by patients looking for care in Ondo.")])
    _proof(c, "TRACK RECORD", "21 states",
           "covered by the private healthcare network we built, later acquired by Evercare.",
           "The same referral and booking systems now run on mezohealth.com.")


# ------------------------------------------------------------------ 09 -------
def slide_terms(c):
    chrome(c, "What we propose")
    hy = heading(c, "Proposed structure and fees")
    rows = [["", "What it is", "What it costs"],
            ["1. Management agreement\n(recommended)",
             "We manage the hospital day to day, appoint the administrator and team, and report "
             "weekly to the board against agreed targets.",
             "7.5% of monthly collected revenue, plus 3% of audited EBITDA. Both are based on actual "
             "collections and audited results."],
            ["2. Placed administrator\nand network membership",
             "The family continues to run the business. We recruit and supervise the administrator and "
             "connect Deborah to our platform, referrals, payer desk and purchasing.",
             "A placement and network membership fee, agreed at scoping. Can move to option 1 at any "
             "time."],
            ["Diagnostic audit",
             "Two to three weeks on site in Akure, before anything is signed.",
             "At our cost, with no obligation. You keep the findings."]]
    y = simple_table(c, rows, MX, hy - 18, [180, 330, PAGE_W - 2 * MX - 510], size=9.8, leading=13.4)
    bullet_block(c, [
        ("Costs.", "We provide the management team, platform, network and audit. Deborah continues to "
                   "meet its running costs, including staff salaries, plus a marketing budget agreed "
                   "with the board and managed by us."),
        ("Ownership.", "Deborah remains wholly owned by the family, under its own name."),
        ("Term.", "Agreed at signing, with notice provisions for both sides. Data, standards and system "
                  "improvements remain with Deborah."),
    ], MX, y - 22, PAGE_W - 2 * MX, size=10, leading=13.6, gap=6)


# ------------------------------------------------------------------ 10 -------
def slide_governance(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 5, PAGE_W, 5, fill=1, stroke=0)
    from cfa_deck import _N
    _N[0] += 1
    tracked(c, "GOVERNANCE", MX, PAGE_H - 62, "Helvetica-Bold", 7.6, GOLD, 2.4)
    c.setFont(SERIF_B, 25)
    c.setFillColor(white)
    c.drawString(MX, PAGE_H - 104, "How decisions would be made")
    bullet_block(c, [
        ("The family and the board.", "Set direction and approve the plan and budget. We report to "
                                      "you on performance."),
        ("Clinical governance.", "Remains with your medical director, including protocols, standards "
                                 "and consultant appointments. Clinical decisions take priority over "
                                 "commercial ones."),
        ("Day-to-day operations.", "Within the approved plan and budget, operational decisions rest "
                                   "with our team, as we are accountable for the results."),
        ("Staff.", "Existing staff are assessed and, where suitable, retained and developed."),
        ("Transparency.", "Directors have access to the same live dashboards our team uses."),
    ], MX, PAGE_H - 150, PAGE_W - 2 * MX - 60, size=11.4, leading=15.4, gap=13,
        body_color=PALE, lead_color=white)
    c.setFont(SERIF_I, 12.4)
    c.setFillColor(GOLD)
    c.drawString(MX, 62, "We expect to be measured on Deborah's performance and its standing in the region.")
    c.setFillColor(HexColor("#8C97AE"))
    c.setFont("Helvetica", 8)
    c.drawString(MX, 19, FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, "%s / %s" % (str(_N[0]).zfill(2), TOTAL[0]))


# ------------------------------------------------------------------ 11 -------
def slide_start(c):
    chrome(c, "How it starts")
    hy = heading(c, "Next steps", max_w=PAGE_W - 2 * MX - 290)
    bullet_block(c, [
        ("1. Share information.", "A private page for Deborah lists the documents we need and accepts "
                                  "uploads from a phone or laptop. If a record does not exist, please "
                                  "let us know."),
        ("2. Meeting with the family.", "In Akure or by video, with the decision makers."),
        ("3. Diagnostic audit.", "Two to three weeks on site, at our cost, without disrupting "
                                 "operations. It sets the baseline for all later targets."),
        ("4. Findings and agreement.", "We present the findings, the plan and the first 100 days to the "
                                       "board before any agreement is signed."),
    ], MX, hy - 22, PAGE_W - 2 * MX - 320, size=10.8, leading=14.6, gap=12)

    px = PAGE_W - MX - 268
    box(c, px, 150, 268, 250, SURFACE, TEAL, 5)
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(TEAL)
    c.drawString(px + 22, 372, "DEBORAH'S PRIVATE PAGE")
    c.setFont(SERIF_B, 11.2)
    c.setFillColor(INK)
    c.drawString(px + 22, 344, LINK)
    para(c, "The nine priority items: twelve months of accounts, six months of bank statements, "
            "activity and occupancy, scanner and dialysis volumes, payer panels, consultants, the price "
            "list, collections, and licences.",
         px + 22, 320, "Helvetica", 9.8, BODY, 226, 13.4)
    hairline(c, px + 22, 216, 224, RULE, 0.8)
    para(c, "Confidential to Consult for Africa, used only for this assessment, and returned or "
            "destroyed if we do not proceed. We are happy to sign a mutual NDA first.",
         px + 22, 198, SERIF_I, 9.8, SLATE, 226, 13.4)


# ------------------------------------------------------------------ 12 -------
def slide_close(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 5, PAGE_W, 5, fill=1, stroke=0)
    _logo(c, "c4a-logo-reversed.png", MX, PAGE_H - 70, w=150)
    _mezo_lockup(c, PAGE_W - MX - 92, PAGE_H - 58, h=20, text_color=white)

    tracked(c, "NEXT STEP", MX, PAGE_H - 132, "Helvetica-Bold", 7.6, GOLD, 2.4)
    c.setFont(SERIF, 27)
    c.setFillColor(white)
    c.drawString(MX, PAGE_H - 182, "We would welcome a meeting")
    c.setFont(SERIF_B, 27)
    c.drawString(MX, PAGE_H - 218, "with the family.")
    hairline(c, MX, PAGE_H - 244, 420, GOLD, 1.2)
    para(c, "Deborah has the facilities and equipment to serve the region well. We believe experienced "
            "management, a stronger referral base and specialist cover would help it reach its full "
            "potential, and we would be glad to discuss how.",
         MX, PAGE_H - 274, SERIF_I, 12.6, PALE, 460, 18)

    chevron_stack(c, PAGE_W - MX - 230, 196, 200, 120, 21,
                  colours=[(HexColor("#1B2A4A"), 9.0), (HexColor("#2C3C66"), 7.2),
                           (HexColor("#3F5180"), 5.6), (SKY, 4.2)])

    c.setFillColor(GOLD)
    c.rect(MX, 112, 52, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 11)
    c.setFillColor(white)
    c.drawString(MX, 90, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 9.4)
    c.setFillColor(PALE)
    c.drawString(MX, 74, "Consult for Africa Management Services Limited, parent company of Mezo")
    c.drawString(MX, 58, "hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com")
    c.setFont("Helvetica", 7.4)
    c.setFillColor(HexColor("#7D89A3"))
    c.drawString(MX, 36, "Private and Confidential. Ref %s. Indicative until a definitive agreement is "
                         "signed; the audit baseline governs every performance measure. Past results do "
                         "not guarantee future performance." % REF)


SLIDES = [slide_cover, slide_who, slide_partners, slide_deborah, slide_why, slide_run,
          slide_specialists, slide_demand, slide_terms, slide_governance, slide_start, slide_close]


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Consult for Africa - Management proposal for Deborah Hospital")
    c.setAuthor("Consult for Africa")
    for fn in SLIDES:
        fn(c)
        c.showPage()
    c.save()
    print("wrote %s" % OUT)
