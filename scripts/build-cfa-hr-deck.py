"""
Build the Consult for Africa healthcare HR and workforce deck.

    python3 scripts/build-cfa-hr-deck.py

A prospectus for the HR service stream, prepared for Duchess International
Hospital after their HR Manager asked what support we can offer. Landscape,
built on the shared system in scripts/cfa_deck.py.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cfa_deck as D  # noqa: E402
from cfa_deck import (  # noqa: E402
    PAGE_W, PAGE_H, MX, DOCS, SERIF, SERIF_B, SERIF_I,
    INK, IND, IND2, IND3, SKY, SAGE, SAGE_D, GOLD, BODY, MUTED, SURFACE, CREAM, RULE, white,
    HexColor, ImageReader, canvas, landscape, A4,
    chrome, heading, para, wrap, bullet_block, callout, box, simple_table, tracked, hairline,
)

OUT = DOCS / "duchess" / "cfa-hr-services-duchess.pdf"
D.FOOTER[0] = "Consult for Africa   /   Confidential   /   Healthcare HR and Workforce   /   Duchess International Hospital"


def workforce_grid(c, x, y, cols=12, rows=5, cell=15, gap=4):
    """Many people, a few you actually need to find."""
    picked = {(0, 3), (2, 1), (4, 4), (6, 0), (8, 2), (10, 3)}
    for r in range(rows):
        for col in range(cols):
            if (col, r) in picked:
                c.setFillColor(GOLD if (col + r) % 2 else INK)
            else:
                c.setFillColor(SAGE if (col + r) % 3 else SKY)
            c.roundRect(x + col * (cell + gap), y + r * (cell + gap), cell, cell, 2, fill=1, stroke=0)


def slide_cover(c):
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    try:
        img = ImageReader(str(DOCS / "c4a-logo.png"))
        iw, ih = img.getSize()
        c.drawImage(img, MX, PAGE_H - 72, width=166, height=166 * ih / iw, mask="auto", preserveAspectRatio=True)
    except Exception:
        c.setFont(SERIF_B, 15); c.setFillColor(INK); c.drawString(MX, PAGE_H - 56, "CONSULT FOR AFRICA")

    tracked(c, "PREPARED FOR", PAGE_W - MX - 214, PAGE_H - 42, "Helvetica-Bold", 6.6, SAGE_D, 2.0)
    try:
        dl = ImageReader(str(DOCS / "duchess" / "duchess-logo.png"))
        diw, dih = dl.getSize()
        c.drawImage(dl, PAGE_W - MX - 206, PAGE_H - 74, width=206, height=206 * dih / diw,
                    mask="auto", preserveAspectRatio=True)
    except Exception:
        pass
    c.setFont(SERIF_I, 9.4); c.setFillColor(SAGE_D)
    c.drawRightString(PAGE_W - MX, PAGE_H - 84, "For the attention of Mrs Bukola Ladipo")
    hairline(c, PAGE_W - MX - 214, PAGE_H - 95, 214, RULE, 0.7)
    hairline(c, MX, PAGE_H - 95, 300, RULE, 0.7)

    tracked(c, "HR AND WORKFORCE SERVICES  /  23 SEPTEMBER 2026", MX, PAGE_H - 132, "Helvetica-Bold", 7.6, GOLD, 2.4)
    c.setFont(SERIF, 29); c.setFillColor(INK)
    c.drawString(MX, PAGE_H - 184, "Finding, assessing and keeping")
    c.setFont(SERIF_B, 29)
    c.drawString(MX, PAGE_H - 220, "the people a hospital runs on")
    hairline(c, MX, PAGE_H - 244, 404, GOLD, 1.2)
    para(c, "The healthcare HR and workforce practice at Consult for Africa. Recruitment and executive search, "
            "leadership assessment and coaching, culture measurement, workforce planning, and interim leadership.",
         MX, PAGE_H - 268, SERIF_I, 12.2, IND2, 404, 17.5)
    para(c, "Prepared after our meeting, in answer to your question about what HR support we can offer the Hospital.",
         MX, PAGE_H - 318, SERIF, 10.6, SAGE_D, 404, 15)

    workforce_grid(c, PAGE_W - MX - 214, 178)

    hairline(c, MX, 104, PAGE_W - 2 * MX, RULE, 0.7)
    c.setFont(SERIF_B, 10.4); c.setFillColor(INK)
    c.drawString(MX, 84, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 9); c.setFillColor(SAGE_D)
    c.drawString(MX, 69, "Consult for Africa")
    c.drawRightString(PAGE_W - MX, 84, "hello@consultforafrica.com   /   +234 913 813 8553")
    c.drawRightString(PAGE_W - MX, 69, "consultforafrica.com   /   Confidential")


def slide_why(c):
    chrome(c, "Why we are writing")
    heading(c, "You asked what we can do on the people side")
    y = PAGE_H - 166
    items = [
        ("You raised it, so this answers it directly.", "A short prospectus of the HR and workforce practice, what each service is, how it runs, and what it costs."),
        ("It is not a new subject between us.", "When we first wrote to you in March, difficulty with hiring was one of the four challenges set out at the top of our proposal. It has been in the frame from the beginning."),
        ("And it connects to the risk work.", "Establishment against the rota, key person dependency in scarce specialties, and whether people feel able to speak up are all workforce questions that land on an enterprise risk register."),
    ]
    y = bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=12.4, leading=16.4, gap=15)
    callout(c, MX, y - 4, PAGE_W - 2 * MX,
            "A complimentary place on the leadership assessment is yours if you would like to see it from the inside before you decide anything. We will send you a personal link.",
            bg=CREAM, spine=GOLD, size=12.6)


def slide_context(c):
    chrome(c, "The context")
    heading(c, "Everyone is hiring from the same shrinking pool")
    para(c, "None of this is news to an HR manager in Lagos. It is here because it explains why the answer is rarely "
            "another advert, and why the practice is built the way it is.",
         MX, PAGE_H - 152, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 30, 15.5)
    stats = [("80%", "of Nigerian healthcare workers say they intend to emigrate"),
             ("16,000", "doctors left in five years, against roughly 55,000 licensed"),
             ("8,560", "registered with the UK regulator between 2021 and 2024"),
             ("16", "professional cadres, not one. Nursing and allied staff decide as much as doctors do")]
    sw = (PAGE_W - 2 * MX - 3 * 14) / 4
    for i, (big, lab) in enumerate(stats):
        sx = MX + i * (sw + 14)
        c.setFillColor(HexColor("#F4F6FA"))
        c.roundRect(sx, PAGE_H - 296, sw, 92, 6, fill=1, stroke=0)
        c.setFillColor(GOLD); c.rect(sx, PAGE_H - 296, sw, 2.5, fill=1, stroke=0)
        c.setFont(SERIF_B, 25); c.setFillColor(INK)
        c.drawString(sx + 16, PAGE_H - 244, big)
        para(c, lab, sx + 16, PAGE_H - 262, "Helvetica", 8.6, MUTED, sw - 32, 11.4)
    callout(c, MX, PAGE_H - 326, PAGE_W - 2 * MX,
            "The consequence for a hundred bed hospital is not abstract. It is that the consultant you need has three offers, the nurse you trained is being recruited from abroad, and the cost of a senior hire who does not work out is measured in years rather than months.",
            bg=SURFACE, spine=GOLD, size=11.8, font="Helvetica")


def slide_culture_thesis(c):
    chrome(c, "Our thesis")
    heading(c, "Culture is the multiplier, not the add-on")
    y = PAGE_H - 154
    para(c,
         "When something goes wrong in a hospital, the presenting cause is almost always a thing. A missing drug, a "
         "generator nobody tested, a form that was not completed. The thing is real and it should be fixed. But the "
         "reason it happened is almost never the thing, and fixing it does not stop the next one.",
         MX, y, "Helvetica", 11.8, BODY, PAGE_W - 2 * MX - 30, 16.4)
    y -= 66
    c.setFont(SERIF_B, 14.5); c.setFillColor(IND2)
    c.drawString(MX, y, "Three things make a culture, and none of them is a poster")
    y -= 30
    w = (PAGE_W - 2 * MX - 36) / 3
    cards = [("The routines\npeople follow", "Not the procedure in the binder, the habit at three in the morning when nobody senior is on the floor. Routines are established deliberately or they are not established at all."),
             ("The incentives\nyou actually pay", "Job descriptions, targets and commission structures tell people what you value far more loudly than a values statement does. Where the two disagree, the incentive wins."),
             ("Whether it is safe\nto say something", "People report when they believe nothing happens to them for reporting. Everything you can measure about safety follows from that one belief.")]
    for i, (ttl, b) in enumerate(cards):
        x = MX + i * (w + 18)
        box(c, x, y - 152, w, 152, SURFACE, [IND, IND2, GOLD][i])
        ty = y - 28
        c.setFont(SERIF_B, 13.5); c.setFillColor(INK)
        for ln in ttl.split("\n"):
            c.drawString(x + 20, ty, ln); ty -= 17
        para(c, b, x + 20, ty - 10, "Helvetica", 10.4, BODY, w - 40, 14)
    y -= 168
    callout(c, MX, y, PAGE_W - 2 * MX,
            "The missing item is the symptom. The absent routine and the unaligned incentive are the disease. We have said that to a board before, and it is why recruitment, assessment, coaching and pay are sold here as one practice rather than four products.",
            bg=CREAM, spine=GOLD, size=12.4, pad=17)


def slide_services(c):
    chrome(c, "What we do")
    heading(c, "Six services, and they are usually bought in this order")
    y = PAGE_H - 160
    rows = [
        ["Service", "What it is", "When a hospital reaches for it"],
        ["Recruitment and executive search", "Market mapping and direct approach for clinical and executive roles, including senior Nigerians abroad where the role suits a returner.", "A vacancy that has been open too long, or a role too senior to advertise."],
        ["Leadership assessment", "A structured six dimension assessment of how somebody leads, used at hire or to develop the people already here.", "Before promoting a clinician into management, or after a senior hire has not worked."],
        ["Coaching and development", "One to one and group coaching with certified African coaches, built on what the assessment surfaced.", "A capable clinician struggling in a leadership role, which is the most common and most fixable problem we see."],
        ["Culture and engagement measurement", "Anonymous staff instruments, reported in aggregate, that tell you what people will not say in a meeting.", "Attrition you cannot explain, or a board that wants evidence rather than impression."],
        ["Salary benchmarking and workforce planning", "What roles actually clear at, banded by cadre and seniority and loaded with employer on costs. Establishment against actual service, and rota analysis.", "Budgeting, a counter offer, a new service line, or a suspicion that the establishment on paper is not the one on the floor."],
        ["Interim and fractional leadership", "A senior operator in post part time, or a full time interim while you search.", "A gap you cannot leave open and cannot fill quickly."],
    ]
    simple_table(c, rows, MX, y, [178, 300, PAGE_W - 2 * MX - 478], size=9.5, leading=12.4, pad=7)


def slide_recruitment(c):
    chrome(c, "One of six")
    heading(c, "Recruitment and executive search")
    y = PAGE_H - 166
    items = [
        ("We map the market rather than advertise into it.", "For scarce clinical roles the person you want is employed, not looking. The work is identifying them and making the approach, which is why we do not run this as a job board."),
        ("A bank of more than ten thousand professional records.", "Across all sixteen cadres, built from the professional registers, with specialty, location and experience held against each. It is a starting point for a search rather than a shortlist."),
        ("Senior Nigerians abroad, where the role suits a returner.", "Through the Doctors Foundation for Care, a network of more than five hundred diaspora physicians. Most will not relocate, and the ones who might are worth knowing."),
        ("Assessed before you meet them, if you want that.", "Any shortlisted candidate can carry a structured leadership assessment, so you are choosing on evidence rather than on interview performance."),
    ]
    y = bullet_block(c, items, MX, y, 452, size=11.4, leading=15, gap=11)

    bx, by, bw, bh = MX + 486, 176, PAGE_W - MX - (MX + 486), 250
    c.setFillColor(HexColor("#F4F6FA")); c.roundRect(bx, by, bw, bh, 8, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(bx, by, 4, bh, fill=1, stroke=0)
    tracked(c, "HOW IT IS STRUCTURED", bx + 18, by + bh - 26, "Helvetica-Bold", 6.8, SAGE_D, 2.0)
    terms = [("Fee", "8 to 15 per cent of first year gross salary. The lower end for nursing and allied batches, the upper for a scarce senior specialist"),
             ("Delivery", "six to ten weeks to shortlist"),
             ("Guarantee", "three to six month free replacement"),
             ("Payment", "staged, not all on offer"),
             ("Exclusivity", "not required, though it changes what we can commit to")]
    ty = by + bh - 52
    for k, v in terms:
        c.setFont(SERIF_B, 9.6); c.setFillColor(INK); c.drawString(bx + 18, ty, k)
        ty = para(c, v, bx + 18, ty - 12, "Helvetica", 8.4, MUTED, bw - 36, 11) - 8


def slide_assessment(c):
    chrome(c, "Two of six")
    heading(c, "Leadership assessment")
    para(c, "Maarova is our own assessment platform, built for healthcare and calibrated to the African context "
            "rather than translated into it. It measures how somebody leads, not whether they are clever.",
         MX, PAGE_H - 152, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 30, 15.5)
    dims = [("Behavioural style", "how they work, and how that reads to a team"),
            ("Values and drivers", "what they optimise for when it is difficult"),
            ("Emotional intelligence", "self awareness, regulation, empathy"),
            ("Clinical to leadership", "the transition that breaks good clinicians"),
            ("Team and culture", "how they shape the unit around them"),
            ("360 feedback", "how the people around them actually experience it")]
    cw = (PAGE_W - 2 * MX - 5 * 10) / 6
    y = PAGE_H - 208
    for i, (t, s) in enumerate(dims):
        x = MX + i * (cw + 10)
        box(c, x, y - 86, cw, 86, SURFACE, [IND, IND2, IND3, SKY, SAGE_D, GOLD][i], 4)
        c.setFont(SERIF_B, 10); c.setFillColor(INK)
        for j, ln in enumerate(wrap(c, t, SERIF_B, 10, cw - 26)[:2]):
            c.drawString(x + 13, y - 24 - j * 12, ln)
        para(c, s, x + 13, y - 52, "Helvetica", 8.2, MUTED, cw - 26, 10.8)
    y -= 106
    items = [
        ("Three streams, and you pick one per cohort.", "Recruitment, to decide on a hire. Development, to build the people you have. Organisational intelligence, to see the whole leadership landscape at once."),
        ("The report lands within minutes, and points to a person.", "Every output routes to a coach rather than to a score. The platform supports the relationship, it does not replace it."),
    ]
    y = bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.4, leading=15, gap=11)
    callout(c, MX, y - 2, PAGE_W - 2 * MX,
            "Take it yourself, at no charge. It is about twenty minutes, the report is yours to keep, and it is the fastest way to judge whether it is worth putting in front of your leadership team.",
            bg=CREAM, spine=GOLD, size=12)


def slide_coaching(c):
    chrome(c, "Three of six")
    heading(c, "Coaching and leadership development")
    y = PAGE_H - 160
    para(c, "The most common workforce problem in a private hospital is not a bad hire. It is a very good clinician "
            "who has been promoted into management and given no support, and who is now quietly struggling while "
            "everyone assumes competence in one thing transfers to the other.",
         MX, y, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 30, 16)
    y -= 66
    rows = [
        ["Format", "Shape", "Best for"],
        ["One to one coaching", "Twelve sessions over six months, biweekly, video with messaging between.", "A named individual in a role that matters, usually after an assessment."],
        ["Group coaching", "Four to six peer leaders, monthly, over three to six months.", "A layer of middle managers who are all hitting the same wall."],
        ["On site workshop", "Half or full day, ten to thirty leaders.", "Setting a shared language quickly, often as a programme opener."],
        ["Leadership retreat", "Two to three days offsite, ten to twenty leaders.", "A leadership team that needs to work on itself rather than on the business."],
    ]
    y = simple_table(c, rows, MX, y, [150, 300, PAGE_W - 2 * MX - 450], size=10, leading=13, pad=7)
    callout(c, MX, y - 16, PAGE_W - 2 * MX,
            "Coaches are certified and matched rather than allocated, with a chemistry call before anything starts and one free switch inside the first two sessions. The evidence is consistent that the quality of that relationship predicts the outcome more than the credentials or the method do, so we treat the match as the intervention.",
            bg=SURFACE, spine=GOLD, size=11.4, font="Helvetica")


def slide_culture(c):
    chrome(c, "Four of six")
    heading(c, "Culture and engagement measurement")
    y = PAGE_H - 160
    items = [
        ("Anonymous, and reported only in aggregate.", "Staff answer honestly when they believe that, and not before. Your chief executive says so in writing before the first form goes out, and we never report a unit small enough to identify anyone."),
        ("Adapted from a validated hospital instrument, with local items added.", "Not a generic engagement survey. It asks about speaking up, about whether mistakes are treated as learning, about handover and about whether people feel able to stop the line."),
        ("Deployed as a mobile form with printed codes, so response rates hold.", "Paper and web generated from one definition so the two cannot drift, and results land in a live view rather than a spreadsheet months later."),
        ("It gives the board evidence rather than impression.", "Attrition is explained after the fact by whoever is asked. A measured culture baseline lets you see it building, and see whether an intervention moved it."),
    ]
    bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.6, leading=15.4, gap=13)


def slide_salary(c):
    chrome(c, "Salary benchmarking")
    heading(c, "What a role actually clears at, not what it was advertised at")
    para(c, "Pay decisions in this market are too often made off last year's budget and a rumour about what a "
            "competitor pays. That is how a hospital loses a nurse it trained and overpays for one it did not need.",
         MX, PAGE_H - 152, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 30, 15.5)
    y = PAGE_H - 196
    items = [
        ("Three sources, not one.", "Salary reported by professionals themselves on our workforce platform, cadre by cadre and city by city. The public sector scales, which anchor the floor for much of the clinical workforce. And our own search data, which is what roles actually closed at rather than what was posted."),
        ("Banded by cadre and seniority, not averaged.", "An average is useless when the spread is the whole point. You get a floor, a midpoint and a ceiling for each role, and where your current post sits inside it."),
        ("Loaded properly, so the number is the real one.", "In Nigeria employer on costs add roughly a fifth to a gross salary once pension, the thirteenth month, statutory contributions, group life and medical cover are counted. Budgets routinely miss it, which is why a post that looked affordable is not."),
    ]
    bullet_block(c, items, MX, y, 418, size=10.8, leading=14, gap=10)

    px, py, pw, ph = PAGE_W - MX - 300, 168, 300, 258
    c.setFillColor(HexColor("#F4F6FA")); c.roundRect(px, py, pw, ph, 8, fill=1, stroke=0)
    tracked(c, "ILLUSTRATIVE SHAPE OF AN OUTPUT", px + 18, py + ph - 26, "Helvetica-Bold", 6.6, SAGE_D, 1.9)
    bands = [("Consultant, specialty", 0.30, 0.95, 0.62, IND),
             ("Medical officer", 0.18, 0.58, 0.31, IND2),
             ("Senior nurse", 0.12, 0.46, 0.34, IND3),
             ("Staff nurse", 0.08, 0.34, 0.14, SKY),
             ("Pharmacist", 0.14, 0.50, 0.40, SAGE_D)]
    bx0, bw0 = px + 18, pw - 36
    by = py + ph - 62
    for lab, lo, hi, mark, col in bands:
        c.setFont("Helvetica", 7.4); c.setFillColor(BODY)
        c.drawString(bx0, by + 11, lab)
        c.setFillColor(HexColor("#E3E8F0"))
        c.roundRect(bx0, by - 2, bw0, 8, 4, fill=1, stroke=0)
        c.setFillColor(col)
        c.roundRect(bx0 + bw0 * lo, by - 2, bw0 * (hi - lo), 8, 4, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.circle(bx0 + bw0 * mark, by + 2, 4.2, fill=1, stroke=0)
        by -= 38
    c.setFillColor(GOLD); c.circle(bx0 + 4, py + 30, 4.2, fill=1, stroke=0)
    c.setFont("Helvetica", 7.2); c.setFillColor(MUTED)
    c.drawString(bx0 + 14, py + 27, "where your current post sits in the band")
    c.setFont("Helvetica-Oblique", 6.8)
    c.drawString(bx0, py + 13, "Shape only. Your bands are built on your roles and your market.")

    callout(c, MX, 148, 418,
            "Most often used at budget, when a service line opens, when a counter offer is on the table, or when a board asks why attrition is what it is and nobody can answer with a number.",
            bg=CREAM, spine=GOLD, size=10.8, font="Helvetica", pad=14)


def slide_planning(c):
    chrome(c, "Five and six of six")
    heading(c, "Workforce planning, pay, and interim leadership")
    y = PAGE_H - 162
    para(c, "The least glamorous of the six and often the one that finds the most money.",
         MX, y, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 30, 15.5)
    y -= 40
    items = [
        ("Establishment against actual service.", "We count from the rota rather than the organisation chart. On a recent hospital engagement the reports showed six registered nurses covering a period when the rota showed four, and nobody had reconciled the two."),
        ("Grading, pay and the true cost of a post.", "Benchmarked against real market data rather than last year's budget, and loaded properly. In Nigeria the employer on costs add roughly a fifth to a gross salary once pension, the thirteenth month, statutory contributions, group life and medical cover are counted, and budgets routinely miss it."),
        ("Interim and fractional leadership.", "A senior operator in post part time, or full time while you search. We have placed and we have taken the seat ourselves, which is a different level of accountability from recommending someone."),
    ]
    bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.6, leading=15.4, gap=14)


def _phone(c, x, y, w, h, title):
    c.setFillColor(HexColor("#0A0E1A"))
    c.roundRect(x, y, w, h, 13, fill=1, stroke=0)
    c.setFillColor(HexColor("#121A2B"))
    c.roundRect(x + 5, y + 5, w - 10, h - 34, 9, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 7.2)
    c.setFillColor(white)
    c.drawString(x + 15, y + h - 22, title)
    c.setFillColor(GOLD)
    c.rect(x + 15, y + h - 30, 16, 2, fill=1, stroke=0)
    return y + h - 44


def slide_staffapp(c):
    chrome(c, "The staff app")
    heading(c, "Pay, recognition and belonging, in their pocket")
    para(c, "HospitlOS is our hospital operating layer. The worker app is the half your staff hold. It is where the "
            "rota, what they have been paid, whether anyone noticed their shift, and how their first weeks are going "
            "stop being HR processes and become something a nurse can check on a Sunday night.",
         MX, PAGE_H - 152, "Helvetica", 11.2, BODY, PAGE_W - 2 * MX - 30, 15.4)

    pw, ph, gap = 138, 228, 26
    py = 176

    # 1. payslips
    iy = _phone(c, MX, py, pw, ph, "Pay")
    c.setFont("Helvetica", 5.8); c.setFillColor(HexColor("#8FA0BF"))
    c.drawString(MX + 15, iy - 4, "NET PAY THIS YEAR")
    c.setFont(SERIF_B, 17); c.setFillColor(white)
    c.drawString(MX + 15, iy - 24, "N4,120,000")
    iy -= 40
    for per, amt, st in [("September", "N412,500", "PAID"), ("August", "N398,000", "PAID"), ("July", "N404,250", "PAID")]:
        c.setFillColor(HexColor("#1B2438"))
        c.roundRect(MX + 12, iy - 30, pw - 24, 28, 4, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 6.6); c.setFillColor(white)
        c.drawString(MX + 20, iy - 13, per)
        c.setFont("Helvetica", 6.4); c.setFillColor(white)
        c.drawRightString(MX + pw - 20, iy - 13, amt)
        c.setFont("Helvetica-Bold", 5); c.setFillColor(HexColor("#10B981"))
        c.drawString(MX + 20, iy - 23, st)
        iy -= 36

    # 2. recognition and the anonymous pulse
    x2 = MX + pw + gap
    iy = _phone(c, x2, py, pw, ph, "Team")
    c.setFillColor(HexColor("#1B2438"))
    c.roundRect(x2 + 12, iy - 30, (pw - 30) / 2, 28, 4, fill=1, stroke=0)
    c.roundRect(x2 + 18 + (pw - 30) / 2, iy - 30, (pw - 30) / 2, 28, 4, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 11); c.setFillColor(white)
    c.drawString(x2 + 20, iy - 18, "120")
    c.drawString(x2 + 26 + (pw - 30) / 2, iy - 18, "7")
    c.setFont("Helvetica", 4.8); c.setFillColor(HexColor("#8FA0BF"))
    c.drawString(x2 + 20, iy - 26, "POINTS")
    c.drawString(x2 + 26 + (pw - 30) / 2, iy - 26, "GIVEN")
    iy -= 44
    c.setFillColor(HexColor("#1B2438"))
    c.roundRect(x2 + 12, iy - 62, pw - 24, 60, 4, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(x2 + 12, iy - 62, 2.5, 60, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 4.8); c.setFillColor(GOLD)
    c.drawString(x2 + 20, iy - 12, "THIS WEEK, ANONYMOUS")
    c.setFont("Helvetica-Bold", 6.2); c.setFillColor(white)
    c.drawString(x2 + 20, iy - 24, "Could you raise a concern")
    c.drawString(x2 + 20, iy - 32, "here without worrying?")
    bw2 = (pw - 40) / 5
    for n in range(5):
        c.setFillColor(HexColor("#2A3852"))
        c.roundRect(x2 + 20 + n * (bw2 + 1.5), iy - 52, bw2, 13, 2, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 5.6); c.setFillColor(white)
        c.drawCentredString(x2 + 20 + n * (bw2 + 1.5) + bw2 / 2, iy - 48, str(n + 1))
    iy -= 74
    c.setFillColor(HexColor("#1B2438"))
    c.roundRect(x2 + 12, iy - 34, pw - 24, 32, 4, fill=1, stroke=0)
    c.setFillColor(HexColor("#2B4A7E"))
    c.roundRect(x2 + 20, iy - 12, 34, 8, 2, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 4.4); c.setFillColor(HexColor("#7FB0F0"))
    c.drawString(x2 + 23, iy - 9.5, "KINDNESS")
    c.setFont("Helvetica", 5.6); c.setFillColor(white)
    c.drawString(x2 + 20, iy - 22, "Stayed back to settle a")
    c.drawString(x2 + 20, iy - 29, "frightened parent.")

    # 3. onboarding
    x3 = x2 + pw + gap
    iy = _phone(c, x3, py, pw, ph, "Your first weeks")
    c.setFont(SERIF_B, 20); c.setFillColor(white)
    c.drawString(x3 + 15, iy - 22, "62%")
    c.setFont("Helvetica", 5.6); c.setFillColor(HexColor("#8FA0BF"))
    c.drawString(x3 + 52, iy - 16, "8 of 13 done")
    c.setFillColor(HexColor("#1B2438")); c.roundRect(x3 + 15, iy - 34, pw - 30, 5, 2.5, fill=1, stroke=0)
    c.setFillColor(SKY); c.roundRect(x3 + 15, iy - 34, (pw - 30) * 0.62, 5, 2.5, fill=1, stroke=0)
    iy -= 48
    for ttl, cat, done, col in [("Meet your buddy", "CULTURE", True, "#F59E0B"),
                                ("Ward orientation", "ORIENTATION", True, "#3B82F6"),
                                ("Escalation protocol", "CLINICAL", False, "#10B981"),
                                ("Values conversation", "CULTURE", False, "#F59E0B")]:
        c.setFillColor(HexColor("#1B2438"))
        c.roundRect(x3 + 12, iy - 28, pw - 24, 26, 4, fill=1, stroke=0)
        if done:
            c.setFillColor(HexColor("#10B981")); c.circle(x3 + 24, iy - 11, 5, fill=1, stroke=0)
            c.setFont("Helvetica-Bold", 5.4); c.setFillColor(white)
            c.drawCentredString(x3 + 24, iy - 13, "v")
        else:
            c.setStrokeColor(HexColor("#44506B")); c.setLineWidth(1)
            c.circle(x3 + 24, iy - 11, 5, fill=0, stroke=1)
        c.setFont("Helvetica-Bold", 6); c.setFillColor(HexColor("#8FA0BF") if done else white)
        c.drawString(x3 + 34, iy - 10, ttl)
        c.setFont("Helvetica-Bold", 4.4); c.setFillColor(HexColor(col))
        c.drawString(x3 + 34, iy - 20, cat)
        iy -= 33

    bx = x3 + pw + 34
    bw = PAGE_W - MX - bx
    c.setFillColor(HexColor("#F4F6FA")); c.roundRect(bx, py, bw, ph, 8, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(bx, py, 4, ph, fill=1, stroke=0)
    tracked(c, "WHAT IT COVERS", bx + 18, py + ph - 24, "Helvetica-Bold", 6.6, SAGE_D, 1.9)
    caps = ["Payroll and payslips, issued only, never drafts",
            "Recognition against your stated values, visible to the team",
            "Weekly pulse, anonymous by design",
            "Onboarding and cultural integration, day by day",
            "Shift posting, claiming and assignment",
            "Availability set by the person, not the roster clerk",
            "Handover captured at the shift, not after it",
            "Leave, training records and appraisals"]
    ly = py + ph - 42
    for line in caps:
        c.setFillColor(SKY); c.rect(bx + 18, ly + 2, 4, 4, fill=1, stroke=0)
        ly = para(c, line, bx + 28, ly, "Helvetica", 8.2, BODY, bw - 48, 10.6) - 4

    callout(c, MX, 150, PAGE_W - 2 * MX,
            "The pulse carries no staff identifier at all. A one way hash stops a second response without making the first one attributable, because people answer honestly when that is true and not before. That is the culture thesis on slide four, written into the data model rather than into a policy.",
            bg=CREAM, spine=GOLD, size=11, font="Helvetica", pad=15)


def slide_investment(c):
    chrome(c, "Investment")
    heading(c, "What each of these costs, indicatively")
    para(c, "Ranges rather than quotes, because the number turns on cohort size, seniority and site. Anything here "
            "is scoped properly before it is priced.",
         MX, PAGE_H - 152, "Helvetica", 11.4, BODY, PAGE_W - 2 * MX - 30, 15.5)
    rows = [
        ["Service", "Basis", "Indicative"],
        ["Recruitment and executive search", "Percentage of first year gross salary, tiered by seniority and volume", "8 to 15 per cent, with a three to six month replacement guarantee"],
        ["Leadership assessment", "Per leader assessed", "N460,000 to N690,000"],
        ["Assessment with group coaching", "Per leader, six monthly sessions", "N920,000 to N1,380,000"],
        ["Assessment with one to one coaching", "Per leader, twelve sessions over six months", "N2,300,000 to N4,025,000"],
        ["Leadership retreat", "Per participant, two to three days", "N1,725,000 to N2,875,000"],
        ["Culture and engagement measurement", "Per site, per cycle", "Scoped on the size of the staff body"],
        ["Interim and fractional leadership", "Monthly retainer against agreed days", "Scoped on the role"],
    ]
    simple_table(c, rows, MX, PAGE_H - 206, [230, 250, PAGE_W - 2 * MX - 480], size=9.8, leading=12.8, pad=7)


def slide_proof(c):
    chrome(c, "Where we have done this")
    heading(c, "The people work, not the slideware")
    y = PAGE_H - 166
    items = [
        ("Havana Specialist Hospital, Lagos.", "A governance capability programme delivered across three cohorts, closing with a simulated board meeting and a per person competency check. Our founding partner chairs its Audit and Risk Committee."),
        ("Haven Paediatric Centre, Lagos.", "An establishment and culture engagement. Anonymous staff safety culture instrument, a patient experience instrument, and a rota level review that found the staffing on paper was not the staffing on the floor."),
        ("Medbury Healthcare Group.", "Senior recruitment mandates at business unit lead and chief operating officer level, run as search rather than advertising."),
        ("House of Refuge, Lekki.", "Leadership assessment across a staff body, with the coach trained on what it surfaced rather than on a standard curriculum."),
    ]
    y = bullet_block(c, items, MX, y, PAGE_W - 2 * MX - 20, size=11.6, leading=15.4, gap=13)
    callout(c, MX, y - 2, PAGE_W - 2 * MX,
            "References are available on request. Tell us which of these you would like to speak to and we will make the introduction, with their consent.",
            bg=CREAM, spine=GOLD, size=11.8)


def slide_lead(c):
    chrome(c, "Who leads the practice")
    heading(c, "Oludayo Olugbamigbe, HR Practice Lead")
    y = PAGE_H - 168

    c.setFillColor(GOLD); c.rect(MX, y - 132, 3, 144, fill=1, stroke=0)
    c.setFont(SERIF_I, 11.4); c.setFillColor(IND2)
    c.drawString(MX + 16, y, "SPHRi, HR Certification Institute")
    c.drawString(MX + 16, y - 17, "Associate, Chartered Institute of Personnel Management")
    c.drawString(MX + 16, y - 34, "MSc Industrial Relations and Personnel Management,")
    c.drawString(MX + 16, y - 50, "Distinction, University of Lagos")
    para(c,
         "Oludayo joins the practice from the Nigerian Exchange Group, where she is Group Talent Management "
         "Specialist and HR Business Partner across the group's entities. Her work there is the unglamorous end of "
         "people strategy done properly: a talent identification and assessment framework, a two line succession "
         "framework for critical roles, and an employee value proposition rebuilt around why people were leaving.",
         MX + 16, y - 78, "Helvetica", 10.6, BODY, 356, 14.6)
    c.setFont(SERIF_B, 10.6); c.setFillColor(INK)
    c.drawString(MX + 16, y - 168, "A psychologist before she was an HR practitioner")
    para(c, "Which is why assessment, coaching and culture measurement sit naturally in this practice rather than "
            "being bought in.",
         MX + 16, y - 184, "Helvetica", 10.2, IND2, 356, 13.6)

    x0 = MX + 412
    tracked(c, "WHAT THAT LOOKS LIKE IN NUMBERS, AT NGX", x0, y + 14, "Helvetica-Bold", 6.8, SAGE_D, 2.0)
    stats = [("+25%", "leadership pipeline readiness, through a structured succession framework"),
             ("95%", "of the workforce classified by her talent identification and assessment framework"),
             ("5%", "organisational attrition, down through a rebuilt employee value proposition"),
             ("+65%", "application completion, after she reworked the group careers portal")]
    sy = y - 24
    for i, (big, lab) in enumerate(stats):
        col = x0 + (i % 2) * 196
        row = sy - (i // 2) * 88
        c.setFillColor(GOLD); c.rect(col, row + 32, 22, 2, fill=1, stroke=0)
        c.setFont(SERIF_B, 24); c.setFillColor(INK if i % 2 == 0 else IND2)
        c.drawString(col, row, big)
        para(c, lab, col, row - 16, "Helvetica", 8.6, MUTED, 178, 11.4)

    callout(c, MX, 146, PAGE_W - 2 * MX,
            "She leads the practice day to day. Dr Debo Odulana holds partner oversight, and the assessment and coaching network sits behind both of them. For a hospital that means one person accountable for the people work, rather than a rotating cast of specialists.",
            bg=CREAM, spine=GOLD, size=11.6, font="Helvetica", pad=16)


def slide_next(c):
    chrome(c, "What we suggest")
    heading(c, "Two small things, neither of which commits you")
    para(c, "You asked what we could offer. The honest answer is that it depends on which of the six is actually "
            "your problem, and we would rather find that out than sell you a programme.",
         MX, PAGE_H - 152, "Helvetica", 11.6, BODY, PAGE_W - 2 * MX - 40, 16)
    asks = [("01", "Take the assessment yourself",
             "At no charge. About twenty minutes, the report is yours, and you will know within a day whether it is something you would put in front of your consultants and unit managers."),
            ("02", "Half an hour on the two roles that are hardest to fill",
             "Tell us which posts have been open longest and we will tell you plainly whether it is a search problem, a pay problem or a proposition problem. That conversation costs nothing and is usually the most useful thing we do first.")]
    y = PAGE_H - 232
    for num, lab, body in asks:
        c.setFillColor(GOLD); c.rect(MX, y - 6, 3.5, 44, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 8); c.setFillColor(SAGE_D); c.drawString(MX + 16, y + 26, num)
        c.setFont(SERIF_B, 14); c.setFillColor(INK); c.drawString(MX + 40, y + 25, lab)
        para(c, body, MX + 40, y + 9, "Helvetica", 10.8, MUTED, PAGE_W - 2 * MX - 80, 14)
        y -= 86
    callout(c, MX, y + 12, PAGE_W - 2 * MX,
            "A personal link for the assessment follows this document. If it is easier, reply to this email and we will set it up for you and for anyone else on your team you would like included.",
            bg=CREAM, spine=GOLD, size=12.4, pad=17)


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
    c.setFont(SERIF, 24); c.setFillColor(white)
    c.drawString(MX, PAGE_H - 232, "The building is the easy part.")
    c.setFont(SERIF_B, 24)
    c.drawString(MX, PAGE_H - 264, "It is the people who decide.")
    para(c, "Every hospital we are called into has the same three problems underneath the presenting one: the right "
            "people are hard to find, the ones who are promoted are rarely supported, and nobody is measuring "
            "whether the culture can carry the ambition. That is the practice, and that is what we would like to "
            "talk to you about.",
         MX, PAGE_H - 306, SERIF, 11.6, HexColor("#AEBBD4"), 430, 17)
    workforce_grid(c, PAGE_W - MX - 230, 214, cols=10, rows=6, cell=16, gap=5)
    c.setFillColor(GOLD); c.rect(MX, 112, 52, 3, fill=1, stroke=0)
    c.setFont(SERIF_B, 11); c.setFillColor(white)
    c.drawString(MX, 90, "Dr Debo Odulana, Founding Partner")
    c.setFont("Helvetica", 9.4); c.setFillColor(HexColor("#AEBBD4"))
    c.drawString(MX, 74, "Consult for Africa Management Services Limited")
    c.drawString(MX, 58, "hello@consultforafrica.com   /   +234 913 813 8553   /   consultforafrica.com")
    c.drawString(MX, 42, "Lagos and Abuja, Nigeria")


SLIDES = [slide_cover, slide_why, slide_context, slide_culture_thesis, slide_services, slide_recruitment,
          slide_assessment, slide_coaching, slide_culture, slide_salary, slide_planning, slide_staffapp,
          slide_investment, slide_proof, slide_lead, slide_next, slide_back]

if __name__ == "__main__":
    D.TOTAL[0] = str(len(SLIDES))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Consult for Africa - Healthcare HR and Workforce - Duchess International Hospital")
    c.setAuthor("Consult for Africa")
    for fn in SLIDES:
        fn(c); c.showPage()
    c.save()
    print("wrote %s" % OUT)
