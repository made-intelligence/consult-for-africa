"""
Nurse internship placement: the deck and the one-pager for approved centres.

    python3 scripts/build-nurse-internship-pitch.py

Written for the medical director, head of nursing or HR lead of an
NMCN-approved internship centre in Lagos, and carried into those meetings by
Esther, Ejiro and Abigail. Framed as health systems strengthening: a fair,
verified entry route into the nursing workforce that sits alongside NMCN's
approved central posting scheme, not a recruitment product.

House rules: no em dash, no contractions, no platform names in body copy, and
every figure traceable to the research brief of 26 Oct 2026 (sources on the
evidence slide).

Outputs
    docs/cadrehealth/nurse-internship-deck-cfa.pdf
    docs/cadrehealth/nurse-internship-one-pager-cfa.pdf
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cfa_deck as D  # noqa: E402
from cfa_deck import (  # noqa: E402
    PAGE_W, PAGE_H, MX, DOCS, SERIF, SERIF_B, SERIF_I,
    INK, NAVY, TEAL, GOLD, BODY, MUTED, SURFACE, CREAM, RULE, SAGE_D, IND2, white,
    HexColor, ImageReader, canvas, landscape, A4,
    chrome, heading, para, wrap, bullet_block, callout, box, simple_table, tracked, hairline,
)

OUT_DIR = DOCS / "cadrehealth"
DECK = OUT_DIR / "nurse-internship-deck-cfa.pdf"
ONE_PAGER = OUT_DIR / "nurse-internship-one-pager-cfa.pdf"
D.FOOTER[0] = "Consult for Africa   /   Health Systems Strengthening   /   Nurse Internship Placement, Lagos"

CONTACT = "hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com"
APPLY_URL = "consultforafrica.com/oncadre/internships"

# The assessment, as built (lib/cadreHealth/internship/questionBank.ts).
QUESTIONS, MINUTES, SECTIONS = 42, 50, 7

STEPS = [
    ("1", "The graduate applies once", "BNSc graduates apply in one place and rank up to five approved centres."),
    ("2", "One assessment", f"{QUESTIONS} questions in {MINUTES} minutes, drawn evenly from {SECTIONS} areas of practice, timed and marked by us."),
    ("3", "Your ranked list", "You see only the graduates who chose you, at or above your minimum score, best first."),
    ("4", "You interview and decide", "Invite, offer or pass with one click. A graduate who accepts a place is released from every other list."),
]


# ================================================================ deck ===
def slide_cover(c):
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    try:
        img = ImageReader(str(DOCS / "c4a-logo.png"))
        iw, ih = img.getSize()
        c.drawImage(img, MX, PAGE_H - 72, width=166, height=166 * ih / iw, mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFont(SERIF_B, 15); c.setFillColor(INK); c.drawString(MX, PAGE_H - 56, "CONSULT FOR AFRICA")
    hairline(c, MX, PAGE_H - 95, PAGE_W - 2 * MX, RULE, 0.7)

    tracked(c, "HEALTH SYSTEMS STRENGTHENING  /  NURSING WORKFORCE", MX, PAGE_H - 132, "Helvetica-Bold", 7.6, GOLD, 2.4)
    c.setFont(SERIF, 28); c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 180, "One assessment and one ranked list")
    c.setFont(SERIF_B, 28)
    c.drawString(MX, PAGE_H - 214, "for every nurse internship")
    c.drawString(MX, PAGE_H - 248, "place in Lagos")
    hairline(c, MX, PAGE_H - 266, 430, GOLD, 1.2)
    para(c, "A fair, verified route from graduation into the nursing workforce. Graduates apply once and sit one "
            "assessment. Each approved centre receives a ranked list of the people who chose it, and keeps the "
            "interview and the decision.",
         MX, PAGE_H - 292, SERIF_I, 12.4, IND2, 430, 17.5)

    # The headline figure, in a box.
    bx, bw, bh = PAGE_W - MX - 236, 236, 176
    box(c, bx, PAGE_H - 300, bw, bh, CREAM, spine=GOLD)
    c.setFont(SERIF_B, 50); c.setFillColor(INK)
    c.drawString(bx + 26, PAGE_H - 186, "31 to 1")
    para(c, "Thirty-one approved centres in Lagos, thirty-one separate applications and exams today. One of each "
            "through this programme.",
         bx + 26, PAGE_H - 214, "Helvetica", 10, BODY, bw - 50, 14)

    hairline(c, MX, 104, PAGE_W - 2 * MX, RULE, 0.7)
    c.setFont(SERIF_B, 10.4); c.setFillColor(INK)
    c.drawString(MX, 84, "For medical directors, heads of nursing and HR leads of approved internship centres")
    c.setFont("Helvetica", 9); c.setFillColor(SAGE_D)
    c.drawString(MX, 69, "Consult for Africa   /   October 2026")
    c.drawRightString(PAGE_W - MX, 84, "hello@consultforafrica.com   /   +234 913 813 8553")
    c.drawRightString(PAGE_W - MX, 69, "consultforafrica.com")


def stat_row(c, stats, y_top, h=96):
    sw = (PAGE_W - 2 * MX - 3 * 14) / 4
    for i, (big, lab) in enumerate(stats):
        sx = MX + i * (sw + 14)
        c.setFillColor(HexColor("#F4F6FA"))
        c.roundRect(sx, y_top - h, sw, h, 6, fill=1, stroke=0)
        c.setFillColor(GOLD); c.rect(sx, y_top - h, sw, 2.5, fill=1, stroke=0)
        c.setFont(SERIF_B, 23); c.setFillColor(INK)
        c.drawString(sx + 16, y_top - 36, big)
        para(c, lab, sx + 16, y_top - 54, "Helvetica", 8.6, MUTED, sw - 32, 11.4)


def slide_problem(c):
    chrome(c, "The bottleneck")
    heading(c, "Every BNSc graduate needs an internship year, and the places are far fewer than the graduates")
    stat_row(c, [
        ("12 months", "at an NMCN-approved centre before full registration, mandatory for BNSc graduates since January 2017"),
        ("1,000+", "graduates reported applying for fewer than 50 places at a single institution"),
        ("Up to 2 yrs", "spent searching by some graduates, with temporary intern licences expiring before a place is found"),
        ("2", "accredited university nursing departments in Lagos, so most applicants to Lagos centres trained elsewhere"),
    ], PAGE_H - 178)
    bullet_block(c, [
        ("For the graduate,", "the search is one hospital at a time, each with its own advert, its own documents and its own exam, and most never reply."),
        ("For the centre,", "every intake means an advert, a pile of CVs, an exam to set and mark, and no easy way to check a licence or a degree."),
        ("For the system,", "the year a new nurse spends waiting is a year of skill decay in a workforce that is losing nurses abroad faster than it trains them."),
    ], MX, PAGE_H - 316, PAGE_W - 2 * MX - 20, size=12, leading=16, gap=12)


def slide_proposal(c):
    chrome(c, "What we propose")
    heading(c, "Graduates apply once and sit one assessment; each centre receives its own ranked list")
    y0 = PAGE_H - 200
    sw = (PAGE_W - 2 * MX - 3 * 18) / 4
    for i, (n, title, body) in enumerate(STEPS):
        sx = MX + i * (sw + 18)
        box(c, sx, y0 - 170, sw, 170, SURFACE, spine=TEAL if i < 3 else GOLD)
        c.setFont(SERIF_B, 26); c.setFillColor(GOLD)
        c.drawString(sx + 20, y0 - 38, n)
        c.setFont("Helvetica-Bold", 12); c.setFillColor(NAVY)
        ty = y0 - 62
        for ln in wrap(c, title, "Helvetica-Bold", 12, sw - 36):
            c.drawString(sx + 20, ty, ln); ty -= 15
        para(c, body, sx + 20, ty - 6, "Helvetica", 10, BODY, sw - 36, 13.5)
        if i < 3:
            ax = sx + sw + 4
            c.setFillColor(GOLD)
            p = c.beginPath(); p.moveTo(ax, y0 - 80); p.lineTo(ax + 10, y0 - 85); p.lineTo(ax, y0 - 90); p.close()
            c.drawPath(p, fill=1, stroke=0)
    callout(c, MX, y0 - 196, PAGE_W - 2 * MX,
            "The graduate pays nothing and no one may ask them for money for a place. The centre gives up the advert, "
            "the exam and the sorting, and keeps the interview, the decision and the number of places.",
            bg=CREAM, spine=GOLD, size=12.2)


def slide_keeps(c):
    chrome(c, "Your control")
    heading(c, "You keep every decision that matters and hand over the work that does not")
    simple_table(c, [
        ("", "The centre keeps", "We take on"),
        ("Places", "How many interns you take and when your intake starts", "Telling every applicant where they stand"),
        ("Standard", "The minimum score a graduate needs to reach your list", "Setting, timing and marking the assessment"),
        ("Selection", "Who you interview and who you offer", "Ranking, and releasing a graduate from other lists once they accept"),
        ("Checks", "Your own interview and onboarding checks", "Collecting the intern licence number and degree details at application"),
        ("Contact", "The graduate's details once you invite them", "All correspondence before that point"),
    ], MX, PAGE_H - 160, [130, 300, PAGE_W - 2 * MX - 430], size=11, leading=15)


def slide_assessment(c):
    chrome(c, "The assessment")
    heading(c, f"{QUESTIONS} questions in {MINUTES} minutes, testing what an intern needs on day one")
    simple_table(c, [
        ("Area", "What it tests"),
        ("Fundamentals and the nursing process", "Assessment, observations, safe identification, pressure care, goal setting"),
        ("Medical and surgical nursing", "Recognising deterioration, diabetes, post-operative care, chronic disease"),
        ("Pharmacology and drug calculations", "Doses, infusion and drip rates, paediatric dosing, antidotes"),
        ("Maternal, newborn and child health", "Fetal monitoring, third stage, haemorrhage, immunisation, dehydration"),
        ("Infection prevention and patient safety", "Hand hygiene, sharps, PPE, transfusion, the surgical checklist"),
        ("Professional practice and ethics", "Consent, confidentiality, errors, documentation, delegation, handover"),
        ("Emergency care", "Basic life support, anaphylaxis, triage, the Glasgow Coma Scale"),
    ], MX, PAGE_H - 160, [290, PAGE_W - 2 * MX - 290], size=10.6, leading=14)
    para(c, "Six questions are drawn from each area, so every graduate is tested on the same balance of material while "
            "seeing different questions in a different order. The clock and the marking are on our side, not the "
            "applicant's. A nurse educator reviews the bank before the first intake, and centres may propose questions.",
         MX, 132, "Helvetica", 10.4, BODY, PAGE_W - 2 * MX, 14.5)


def slide_hss(c):
    chrome(c, "Why this is health systems strengthening")
    heading(c, "A fair entry route, a common standard and better data for the people who plan the workforce")
    bullet_block(c, [
        ("Fair entry.", "A score-based list, visible to the graduate, replaces a process that graduate nurses have complained to the "
                       "Minister of Health is opaque and open to payment for places. A transparent list also protects the centre's name."),
        ("A common entry standard.", "Every intern in Lagos can be measured against the same baseline in the same areas of practice, "
                                     "which no single centre's exam can give the state."),
        ("Planning data.", "Which centres are oversubscribed, where graduates trained, and how each area of practice scores by "
                           "university. That is evidence for the state, the regulator and the nursing schools, shared in aggregate only."),
        ("Retention.", "Under NMCN's published 2024 verification guidelines, a nurse needs two years after full registration before "
                       "verification for practice abroad. An intern chosen well is up to three years of service, which is why the "
                       "choice deserves better than a pile of CVs."),
    ], MX, PAGE_H - 170, PAGE_W - 2 * MX - 20, size=11.8, leading=15.6, gap=13)


def slide_alongside(c):
    chrome(c, "The national picture")
    y = heading(c, "It works alongside NMCN's central posting scheme, not in front of it")
    y = para(c, "In April 2026 the NMCN Registrar said a Centralised Nursing Internship Scheme had been approved by the Minister "
            "and was awaiting funding, and told graduates to keep applying to accredited hospitals themselves in the "
            "meantime. The scheme as described posts the first batch centrally and later lets interns choose service "
            "points, starting with federal and teaching hospitals.",
         MX, y - 8, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 40, 16)
    simple_table(c, [
        ("", "National scheme, as announced", "This programme"),
        ("Who it covers", "Federal medical centres and teaching hospitals first", "Every approved centre that joins, private, mission, state and federal"),
        ("Selection", "Central posting, then a choice portal", "An assessment, then the centre's own interview"),
        ("Status", "Approved, awaiting a supplementary budget", "Ready for the 2027 intake"),
        ("Relationship", "", "Shares aggregate data with NMCN and the state, and steps aside wherever central posting applies"),
    ], MX, y - 18, [140, 290, PAGE_W - 2 * MX - 430], size=10.8, leading=14.6)


def slide_ask(c):
    chrome(c, "What we ask of a centre")
    heading(c, "Four things from you, and no fee for the 2027 intake")
    bullet_block(c, [
        ("Your places.", "How many interns you will take this intake, and when they start."),
        ("Your minimum score.", "The lowest score you would interview. You can change it once you see the list."),
        ("A named contact.", "One person, usually the head of nursing or HR, with a login to see and act on the list."),
        ("A prompt response.", "Invite or pass within three weeks of receiving your list, so graduates are not left waiting."),
    ], MX, PAGE_H - 170, 430, size=12.2, leading=16.4, gap=14)
    bx, bw = PAGE_W - MX - 250, 250
    box(c, bx, PAGE_H - 420, bw, 240, SURFACE, spine=TEAL)
    tracked(c, "ALREADY CHOSEN YOU", bx + 24, PAGE_H - 214, "Helvetica-Bold", 7.4, TEAL, 2.2)
    para(c, "Graduates may rank any approved centre from the day applications open, whether or not it has joined. "
            "When a centre joins, the graduates who chose it are already waiting, ranked.",
         bx + 24, PAGE_H - 240, "Helvetica", 10.6, BODY, bw - 48, 15)
    para(c, "We will tell you how many have chosen you before you decide.",
         bx + 24, PAGE_H - 340, "Helvetica-Bold", 10.6, NAVY, bw - 48, 15)


def slide_timeline(c):
    chrome(c, "The 2027 intake")
    heading(c, "From your yes to interns on your wards")
    rows = [
        ("November to December 2026", "Centres join: places, minimum score and a named contact agreed. Nurse educator review of the assessment."),
        ("January 2027", "Applications open to BNSc graduates nationally. Graduates rank up to five centres."),
        ("Rolling from January", "Graduates sit the assessment. Lists build as they finish, and centres see them live."),
        ("Within three weeks of a list", "Centres invite, interview and offer. Graduates accept one place and are released from the rest."),
        ("Your intake date", "Interns start on your own timetable, with their NMCN logbook and intern licence."),
    ]
    y = PAGE_H - 170
    for i, (when, what) in enumerate(rows):
        c.setFillColor(GOLD if i == 0 else TEAL)
        c.circle(MX + 6, y + 4, 5, fill=1, stroke=0)
        if i < len(rows) - 1:
            c.setStrokeColor(RULE); c.setLineWidth(1.2); c.line(MX + 6, y - 2, MX + 6, y - 52)
        c.setFont("Helvetica-Bold", 12); c.setFillColor(NAVY)
        c.drawString(MX + 24, y, when)
        para(c, what, MX + 260, y, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 260, 15)
        y -= 58


def slide_evidence(c):
    chrome(c, "Sources")
    heading(c, "Where the figures come from", size=20)
    items = [
        "NMCN circular N&MCN/EDU/INT/034/VOL.2/4, 9 January 2017: one-year internship for BNSc graduates.",
        "NMCN list of approved nursing training institutions, December 2025: accredited university departments in Lagos.",
        "UGONSA letter to the Minister of Health, May 2025 (reported by Realnews, August 2025): waiting times, expiring intern licences, concerns about payment for places.",
        "Nursing graduate guide, 2022 (reported): over 1,000 applicants for fewer than 50 places at one institution.",
        "FYNI communique of the webinar with the NMCN Registrar, 16 April 2026: status of the Centralised Nursing Internship Scheme.",
        "NMCN verification guidelines, circular of 7 February 2024: two years after full registration before verification abroad.",
        "Lagos internship centres: list held by Consult for Africa, October 2026.",
    ]
    bullet_block(c, [("", t) for t in items], MX, PAGE_H - 150, PAGE_W - 2 * MX - 20, size=10.4, leading=14, gap=9)


def slide_back(c):
    c.setFillColor(INK); c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(HexColor("#0E1830"))
    c.rect(0, 0, PAGE_W, 10, fill=1, stroke=0); c.rect(0, PAGE_H - 10, PAGE_W, 10, fill=1, stroke=0)
    try:
        img = ImageReader(str(DOCS / "c4a-logo-reversed.png"))
        iw, ih = img.getSize()
        c.drawImage(img, MX, PAGE_H - 78, width=156, height=156 * ih / iw, mask="auto", preserveAspectRatio=True)
    except Exception:
        pass
    c.setFillColor(GOLD); c.rect(MX, PAGE_H - 178, 46, 3, fill=1, stroke=0)
    c.setFont(SERIF, 25); c.setFillColor(white)
    c.drawString(MX, PAGE_H - 232, "Tell us your places and your minimum score.")
    c.setFont(SERIF_B, 25)
    c.drawString(MX, PAGE_H - 266, "We will send you a ranked list.")
    para(c, "No fee to the centre for the 2027 intake. Graduates apply at " + APPLY_URL + ".",
         MX, PAGE_H - 308, SERIF, 12, HexColor("#AEBBD4"), 520, 17)
    c.setFillColor(GOLD); c.rect(MX, 112, 52, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 11); c.setFillColor(white)
    c.drawString(MX, 90, "Consult for Africa Management Services Limited")
    c.setFont("Helvetica", 9.4); c.setFillColor(HexColor("#AEBBD4"))
    c.drawString(MX, 74, CONTACT)
    c.drawString(MX, 58, "Lagos and Abuja, Nigeria")


SLIDES = [slide_cover, slide_problem, slide_proposal, slide_keeps, slide_assessment, slide_hss,
          slide_alongside, slide_ask, slide_timeline, slide_evidence, slide_back]


def build_deck():
    D.TOTAL[0] = str(len(SLIDES))
    c = canvas.Canvas(str(DECK), pagesize=landscape(A4))
    c.setTitle("Nurse Internship Placement, Lagos - Consult for Africa")
    c.setAuthor("Consult for Africa")
    for fn in SLIDES:
        fn(c)
        c.showPage()
    c.save()


# =========================================================== one-pager ===
def build_one_pager():
    PW, PH = A4
    M = 46
    W = PW - 2 * M
    c = canvas.Canvas(str(ONE_PAGER), pagesize=A4)
    c.setTitle("Nurse Internship Placement, Lagos - One Page")
    c.setAuthor("Consult for Africa")

    c.setFillColor(NAVY); c.rect(0, PH - 6, PW, 6, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PH - 9, PW, 3, fill=1, stroke=0)
    try:
        img = ImageReader(str(DOCS / "c4a-logo.png"))
        iw, ih = img.getSize()
        c.drawImage(img, M, PH - 62, width=130, height=130 * ih / iw, mask="auto", preserveAspectRatio=True)
    except Exception:
        pass
    tracked(c, "HEALTH SYSTEMS STRENGTHENING", PW - M - 186, PH - 44, "Helvetica-Bold", 6.8, GOLD, 2.0)

    y = PH - 104
    c.setFont(SERIF_B, 20); c.setFillColor(INK)
    for ln in wrap(c, "One assessment and one ranked list for every nurse internship place in Lagos", SERIF_B, 20, W):
        c.drawString(M, y, ln); y -= 25
    y = para(c, "Every BNSc graduate needs twelve months at an NMCN-approved centre before full registration, and the "
                "places are far fewer than the graduates. Today each centre advertises, sorts CVs and sets its own exam, "
                "and each graduate applies one hospital at a time. We propose one application, one assessment and a "
                "ranked list for each centre. The centre keeps the interview and the decision.",
             M, y - 6, SERIF_I, 10.6, IND2, W, 14.6)

    # How it works, four boxes.
    y -= 14
    sw = (W - 3 * 10) / 4
    for i, (n, title, body) in enumerate(STEPS):
        sx = M + i * (sw + 10)
        box(c, sx, y - 128, sw, 128, SURFACE, spine=TEAL if i < 3 else GOLD, spine_w=4)
        c.setFont(SERIF_B, 17); c.setFillColor(GOLD); c.drawString(sx + 14, y - 24, n)
        c.setFont("Helvetica-Bold", 9.2); c.setFillColor(NAVY)
        ty = y - 40
        for ln in wrap(c, title, "Helvetica-Bold", 9.2, sw - 24):
            c.drawString(sx + 14, ty, ln); ty -= 11.5
        para(c, body, sx + 14, ty - 3, "Helvetica", 8.6, BODY, sw - 24, 11.2)
    y -= 152

    c.setFont(SERIF_B, 13); c.setFillColor(INK); c.drawString(M, y, "Why it matters beyond one hospital"); y -= 20
    y = bullet_block(c, [
        ("Fair entry.", "A score-based list the graduate can see, in place of a process graduate nurses have told the Minister is opaque."),
        ("A common standard.", f"{QUESTIONS} questions in {MINUTES} minutes across {SECTIONS} areas of practice, the same baseline for every intern."),
        ("Planning data.", "Oversubscribed centres and scores by area and university, shared in aggregate with the state and the regulator."),
        ("Alongside NMCN.", "The central posting scheme is approved and awaiting funding, starting with federal hospitals. This covers every centre now."),
    ], M, y, W - 14, gap=9, size=10, leading=13.6)

    y -= 10
    c.setFont(SERIF_B, 13); c.setFillColor(INK); c.drawString(M, y, "What we ask of your centre"); y -= 20
    y = bullet_block(c, [
        ("", "The number of places you will take in 2027, and when they start."),
        ("", "The minimum score you would interview, which you can change once you see the list."),
        ("", "A named contact with a login, and a decision within three weeks of receiving your list."),
    ], M, y, W - 14, gap=7, size=10, leading=13.6)

    callout(c, M, y - 6, W,
            "No fee to the centre for the 2027 intake, and nothing to the graduate. Graduates who have already "
            "chosen your centre will be waiting, ranked, when you join.",
            bg=CREAM, spine=GOLD, size=10.6, leading=14.4, pad=16)

    hairline(c, M, 54, W, RULE, 0.7)
    c.setFont("Helvetica-Bold", 8.6); c.setFillColor(INK)
    c.drawString(M, 38, "Consult for Africa Management Services Limited")
    c.setFont("Helvetica", 8.2); c.setFillColor(MUTED)
    c.drawRightString(PW - M, 38, CONTACT)
    c.drawString(M, 26, "Graduates apply at " + APPLY_URL)
    c.save()


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    build_deck()
    build_one_pager()
    for p in (DECK, ONE_PAGER):
        print(p.relative_to(DOCS.parent))
