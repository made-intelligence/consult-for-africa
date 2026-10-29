"""
Grandville Medical Group: the marketing and growth capability deck.

Built for a cold first discovery call where the room is the group's managing
director and its marketing lead. Those two buyers have opposite fears, so the
deck has to do two jobs at once: give the commercial buyer an argument about
admissions, referrals and service line margin, and give the in-house marketer
an outside firm that arrives as reinforcement rather than as a replacement.

Everything said about Grandville here comes from public sources only, which is
stated on the second slide so it cannot be mistaken for a diagnosis.

No price appears in this deck. The firm prices from resourced days and does not
volunteer a number nobody has asked for. The anchoring ladder for the call lives
in docs/grandville/grandville-call-prep-PRIVATE.md.

Run:
  python3 scripts/build-grandville-deck.py
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

OUT = ROOT / "docs" / "grandville" / "grandville-marketing-capability-deck-cfa.pdf"
SHARE = ROOT / "docs" / "Grandville Medical Group - Marketing and Growth (Deck).pdf"

D.FOOTER[0] = "Consult for Africa   /   Private and confidential   /   Grandville Medical Group"
D.TOTAL[0] = "18"

W = PAGE_W - 2 * MX


# ----------------------------------------------------------------- cover -----
PANEL_W = 240  # the pale field on the right, which the chevron sits inside


def cover(c):
    """White ground. The mark top left, the chevron held whole inside a pale
    field on the right rather than floating or cropped, and a fact band on the
    baseline so the housekeeping stops competing with the title."""
    c.setFillColor(white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # The same navy and gold pair the inside pages carry at the top edge.
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 7, PAGE_W, 7, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 10, PAGE_W, 3, fill=1, stroke=0)

    px = PAGE_W - PANEL_W
    c.setFillColor(SURFACE)
    c.rect(px, 0, PANEL_W, PAGE_H - 10, fill=1, stroke=0)

    # The chevron whole, optically centred in the field, with a gold seat under
    # it. No tagline here: the mark top left already carries one.
    cw, ch = 188, 148
    chevron_stack(c, px + (PANEL_W - cw) / 2.0, 252, cw, ch, 13)
    c.setFillColor(GOLD)
    c.rect(px + (PANEL_W - 52) / 2.0, 186, 52, 3, fill=1, stroke=0)

    # The firm's mark. The flat file carries no alpha, which is correct on white.
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
    tracked(c, "PREPARED FOR GRANDVILLE MEDICAL GROUP", MX, 398,
            "Helvetica-Bold", 10.5, TEAL, 2.6)

    c.setFont(SERIF_B, 34)
    c.setFillColor(INK)
    y = 344
    for line in wrap(c, "Marketing built around how a hospital actually earns",
                     SERIF_B, 34, 540):
        c.drawString(MX, y, line)
        y -= 42

    c.setFont(SERIF_I, 15)
    c.setFillColor(D.MUTED)
    y -= 2
    for line in wrap(c, "Most agencies sell hospitals impressions. We have run "
                        "hospitals.", SERIF_I, 15, 520):
        c.drawString(MX, y, line)
        y -= 21

    # The baseline fact band, held clear of the pale field.
    c.setStrokeColor(D.RULE)
    c.setLineWidth(0.9)
    c.line(MX, 182, px - 26, 182)

    band = [
        (0, "PREPARED FOR", "Grandville Medical Group"),
        (150, "PREPARED BY", "Consult for Africa"),
        (290, "OFFICES", "Lagos and Abuja"),
        (400, "DATE", "October 2026"),
    ]
    for dx, label, value in band:
        tracked(c, label, MX + dx, 160, "Helvetica-Bold", 8.0, TEAL, 1.9)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(NAVY)
        c.drawString(MX + dx, 138, value)

    c.setFont("Helvetica", 9)
    c.setFillColor(D.MUTED)
    c.drawString(MX, 86, "Private and confidential. Prepared for a first conversation "
                         "and not for onward circulation.")
    c.showPage()


# ------------------------------------------------------- 02 what we can see --
def s_outside(c):
    chrome(c, "Before we present anything")
    y = heading(c, "What we can see from outside, and what we cannot.")
    y = para(c, "Thirteen years from a single plastic surgery practice to three centres, "
                "a trauma and critical care investment, and a service list that now runs "
                "from rhinoplasty to resuscitation. That is an operating story before it "
                "is a marketing story, and it is why we asked for the hour.",
             MX, y - 20, "Helvetica", 12.5, BODY, W - 290, 18)
    y = bullet_block(c, [
        ("What is public.", "Lekki, Surulere and Maitama. Aesthetic and reconstructive "
                            "surgery alongside trauma and intensive care, laser, imaging, "
                            "laboratory, dermatology and obstetrics. A med spa sub brand. "
                            "Airport pickup and an aftercare home. A stated intention to "
                            "reach all six geopolitical zones."),
        ("What is not.", "Your margin by service line. Theatre, chair and bed utilisation "
                         "by site. How many enquiries arrive in a month and how many become "
                         "appointments. Where your patients travel from. Which centre is "
                         "carrying which."),
        ("Why that matters.", "Every recommendation worth making depends on those five "
                              "things. A firm that has not asked for them is not selling "
                              "you advice, it is selling you activity."),
    ], MX, y - 18, W - 300, size=12.0, leading=16.0, gap=12)
    callout(c, PAGE_W - MX - 262, PAGE_H - 150, 262,
            "We would rather spend this hour asking than presenting. These slides exist "
            "so you know who is asking.",
            bg=CREAM, spine=GOLD, size=11.5, leading=15.5)
    c.showPage()


# ------------------------------------------------------------- 03 the firm ---
def s_firm(c):
    chrome(c, "Who is asking")
    y = heading(c, "A healthcare management consulting firm that also runs a "
                   "marketing practice.")
    y = para(c, "Consult for Africa works from Lagos and Abuja across seven service "
                "lines: clinical governance, strategy and growth, fractional leadership, "
                "digital health, health systems strengthening, diaspora expertise and "
                "healthcare marketing. The work arrives as organisational audits, "
                "turnaround and growth mandates, board governance, venture structuring, "
                "and build and operate mandates where we stand a facility up and then "
                "manage it.",
             MX, y - 20, "Helvetica", 12.5, BODY, W, 18)
    y = callout(c, MX, y - 18, W,
                "Most agencies sell hospitals impressions. We have run hospitals, so we "
                "sell admissions, referrals and the service lines that carry margin.",
                bg=SURFACE, spine=TEAL, size=13.5, leading=18)
    y = bullet_block(c, [
        ("We read a profit and loss.", "The conversation starts with your service mix, "
                                       "your tariff and your utilisation, not with a "
                                       "follower count."),
        ("We will say when marketing is not the answer.", "Sometimes the constraint is a "
                                                          "clinic timetable, an unanswered "
                                                          "telephone, or a referring doctor "
                                                          "nobody has called in a year."),
        ("Strategy, creative, technology and analytics sit in one place.", "Coordinating "
            "four vendors is a management job you should not have to hold."),
    ], MX, y - 24, W, size=12.0, leading=16.0, gap=11)
    c.showPage()


# ----------------------------------------------------------- 04 the people ---
def s_people(c):
    chrome(c, "Who is asking")
    y = heading(c, "Who would be on this, and what each of them owns.")
    rows = [
        ["Who", "What they own on an engagement like this"],
        ["Dr Debo Odulana",
         "Founding Partner. Owns the diagnosis and stays on the engagement. Physician, "
         "with a masters in international health management from Imperial College "
         "Business School. Former Chief Executive of Cedarcrest Hospitals, Abuja. Former "
         "Chief Innovation and Strategy Officer at Evercare Hospital Lekki. Founded "
         "Doctoora, built it to twenty one states and sold it to Evercare."],
        ["Toluwanimi Olayeni",
         "Marketing and communications lead. Owns the account day to day: the brief, the "
         "calendar, the clearance gate and the monthly report."],
        ["Tito Ipinmoye",
         "Director of Product and Strategy. Owns execution wherever the work touches "
         "operations, data or the digital estate. Clinician and healthcare executive."],
    ]
    y = simple_table(c, rows, MX, y - 22, [168, W - 168], size=11, leading=14.5, pad=9)
    callout(c, MX, y - 20, W,
            "Nothing published in your name leaves this firm without a clinician checking "
            "the clinical claim and a named person clearing it. That gate is the most "
            "important thing we own.",
            bg=CREAM, spine=GOLD, size=12, leading=16)
    c.showPage()


# ------------------------------------------------------ 05 two businesses ----
def s_two(c):
    chrome(c, "What we would want to test")
    y = heading(c, "You are running two marketing businesses, and they need "
                   "opposite strategies.")
    y = para(c, "An elective aesthetic procedure and an emergency admission are not the "
                "same product, sold to the same person, in the same way. They differ in "
                "who chooses, how long the decision takes, how far the patient will "
                "travel and what evidence closes it. A group that spans both usually "
                "markets one of them well and the other by accident.",
             MX, y - 20, "Helvetica", 12.5, BODY, W, 18)
    rows = [
        ["The elective side", "The acute and diagnostic side"],
        ["The patient chooses, deliberately, over weeks or months",
         "A family, a referring doctor or a payer chooses, in minutes"],
        ["Won on authority, outcomes and visible proof",
         "Won on proximity, an answered telephone and ambulance time"],
        ["Catchment is national, and then diaspora",
         "Catchment is the drive to the door"],
        ["Price is researched and compared before contact",
         "Price is discovered after the decision is made"],
        ["Demand can be created", "Demand is captured, or lost to whoever is nearer"],
    ]
    y = simple_table(c, rows, MX, y - 20, [W / 2, W / 2], size=11, leading=14, pad=8)
    callout(c, MX, y - 18, W,
            "A med spa sub brand suggests you have already felt this. The open question "
            "is whether the rest of the architecture follows it.",
            bg=SURFACE, spine=TEAL, size=12, leading=16)
    c.showPage()


# -------------------------------------------------------- 06 founder brand ---
def s_founder(c):
    chrome(c, "What we would want to test")
    y = heading(c, "The founder's name is your most valuable asset and your largest "
                   "concentration risk.")
    y = para(c, "In aesthetics, the surgeon is the product. Nobody buys a rhinoplasty "
                "from an institution, and a reputation built over thirteen years is worth "
                "more than any campaign could buy. In trauma, intensive care, imaging and "
                "obstetrics that same name does very little work, and it cannot be in six "
                "zones at once.",
             MX, y - 20, "Helvetica", 12.5, BODY, W - 282, 18)
    y = bullet_block(c, [
        ("Where the person stays primary.", "Aesthetic and reconstructive surgery, the "
            "national and diaspora elective demand, and anything where a patient is "
            "choosing a pair of hands."),
        ("Where an institution has to carry it.", "Emergency and critical care, "
            "diagnostics, obstetrics, the employer and payer relationships, and every "
            "site that will open without him standing in it."),
        ("Why this is urgent rather than interesting.", "You cannot franchise a surgeon. "
            "If the six zone plan is real, the institutional brand has to be built before "
            "the expansion, not explained after it."),
    ], MX, y - 18, W - 292, size=12.0, leading=16.0, gap=12)
    callout(c, PAGE_W - MX - 254, PAGE_H - 150, 254,
            "We have argued this both ways. For a surgeon whose craft is the product, we "
            "made the person primary. For a group that had to work without its founder, "
            "the institution. Which you are is a question about your plan, not your brand.",
            bg=CREAM, spine=GOLD, size=11, leading=14.8)
    c.showPage()


# ------------------------------------------------------------ 07 capacity ----
def s_capacity(c):
    chrome(c, "The rule we bring with us")
    y = heading(c, "We will not run a campaign into a service you cannot deliver.")
    y = para(c, "The most common way a healthcare campaign fails is that it works. "
                "Enquiries arrive, the second call goes unanswered, the next appointment "
                "is three weeks out, and the budget has bought a worse reputation than you "
                "started with. So we ask about chairs, lists, beds and the telephone "
                "before we ask about reach.",
             MX, y - 20, "Helvetica", 12.5, BODY, W, 18)
    y = bullet_block(c, [
        ("What we ask for first.", "Theatre and consulting room utilisation by site, bed "
            "occupancy, the share of enquiries answered on the first attempt, and the wait "
            "to the next available appointment."),
        ("What happens if the answer is uncomfortable.", "We say so in writing, and we fix "
            "the front door before a naira goes to media."),
        ("What the rule is worth to you.", "It is the difference between a campaign that "
            "fills a quiet list and one that lengthens a queue your competitor is happy "
            "to shorten."),
    ], MX, y - 20, W, size=12.0, leading=16.0, gap=12)
    callout(c, MX, y - 10, W,
            "Your capacity to serve demand is not our responsibility. Raising it before "
            "launch is.",
            bg=SURFACE, spine=TEAL, size=12.5, leading=17)
    c.showPage()


# ------------------------------------------------------------- 08 movable ----
def s_movable(c):
    chrome(c, "The rule we bring with us")
    y = heading(c, "What marketing can move in a hospital group, and what it cannot.")
    rows = [
        ["Marketing can move this", "Marketing cannot move this"],
        ["Which service lines grow, and therefore your mix", "Your clinical outcomes"],
        ["Elective volume, and the self pay share of it", "What a payer will agree to pay you"],
        ["Referring doctor flow, by name and by volume", "A consultant's availability on a Tuesday"],
        ["The share of enquiries that become appointments", "How a patient is treated at reception"],
        ["Where your patients travel from", "A theatre that is already full"],
        ["Whether an employer or a payer knows you exist", "A service you have not staffed"],
    ]
    y = simple_table(c, rows, MX, y - 24, [W / 2, W / 2], size=11.5, leading=14.5, pad=9)
    callout(c, MX, y - 20, W,
            "The left column is what we take accountability for. We will tell you plainly "
            "when a growth problem lives in the right column, because paying an agency to "
            "solve one of those is money burned.",
            bg=CREAM, spine=GOLD, size=12, leading=16)
    c.showPage()


# --------------------------------------------------------- 09 destination ----
def s_destination(c):
    chrome(c, "An opportunity we can see from here")
    y = heading(c, "You have half built a destination product and you are not "
                   "selling it as one.")
    y = para(c, "Airport pickup, an aftercare home and a recovery programme are the hard "
                "parts of inbound surgical care, and you already have them. What we cannot "
                "find is the packaged product: one price, one pathway, a named "
                "coordinator, and a written answer to the question every travelling "
                "patient actually asks, which is what happens if something goes wrong "
                "after I fly home.",
             MX, y - 20, "Helvetica", 12.5, BODY, W, 18)
    y = bullet_block(c, [
        ("The distinction most pitches miss.", "For a patient in the United States the "
            "case is price. For a patient in the United Kingdom it is rarely price, it is "
            "rationing, age limits and waiting. Selling to the diaspora as one audience is "
            "the standard mistake."),
        ("What the group has that a clinic cannot claim.", "Intensive care behind the "
            "theatre. The travelling patient's real fear is the complication that declares "
            "itself after the flight, and a credible answer to it is worth more than any "
            "discount."),
        ("What it still needs.", "A pathway, a price, a coordinator, a complications "
            "promise, and relationships with the clinics abroad that see these patients "
            "first."),
    ], MX, y - 20, W, size=12.0, leading=16.0, gap=11)
    c.showPage()


# ---------------------------------------------------------- 10 capability ----
def s_capability(c):
    chrome(c, "What the practice does")
    y = heading(c, "Eight capability areas, three ways to buy them.")
    rows = [
        ["Capability", "What sits under it"],
        ["Brand strategy and positioning",
         "Architecture, value proposition, patient segmentation, naming, identity, "
         "guidelines and the governance that keeps them applied"],
        ["Market research and insight",
         "Epidemiological and competitive analysis, patient journey mapping, focus groups, "
         "digital listening"],
        ["Campaign planning and management",
         "Multichannel media planning, patient recruitment campaigns, advocacy programmes"],
        ["Creative and content",
         "Medical and consumer copywriting, design, video, and patient stories that have "
         "been medically vetted and consented"],
        ["Digital and technology",
         "Website and application build, search, social, email and messaging, booking and "
         "enquiry capture"],
        ["Referrer and community engagement",
         "Clinician referrer programmes, patient advocate networks, community management"],
        ["Public relations and advertising",
         "Press and health journalism, media training for spokespeople, print, outdoor "
         "and broadcast"],
        ["Analytics and optimisation",
         "Campaign dashboards, enquiry tracking, lead nurturing, testing and return on "
         "investment analysis"],
    ]
    y = simple_table(c, rows, MX, y - 22, [196, W - 196], size=10.5, leading=13.2, pad=7)
    callout(c, MX, y - 16, W,
            "Retainer, project, or a retained strategic core with project work layered on "
            "top. The shape follows the work, and the next slides say which we would "
            "recommend here.",
            bg=SURFACE, spine=TEAL, size=11.5, leading=15.5)
    c.showPage()


# ------------------------------------------------------------ 11 with you ----
def s_withyou(c):
    chrome(c, "How we would work")
    y = heading(c, "With your marketing team, not around it.")
    y = para(c, "You have a marketing lead. The fastest way for an outside firm to become "
                "useless is to arrive as a replacement, because the person who knows your "
                "clinicians, your calendar and your consent rules is already on your "
                "payroll. Our default is to make that person better resourced and better "
                "armed.",
             MX, y - 20, "Helvetica", 12.5, BODY, W, 18)
    rows = [
        ["Mode", "What it means in practice"],
        ["Augment, our default",
         "Your lead keeps the brief, the relationships and the accountability. We bring "
         "capacity, specialist skills you do not need full time, and the instrumentation "
         "that makes their reporting defensible in front of your board."],
        ["Embed a fractional lead",
         "A senior marketer inside your leadership rhythm for a set number of days a "
         "month, for when the gap is seniority rather than hands."],
        ["Take a defined scope end to end",
         "One build, one service line launch or one campaign, with a start, a finish and a "
         "named deliverable."],
    ]
    y = simple_table(c, rows, MX, y - 20, [186, W - 186], size=11, leading=14, pad=8)
    callout(c, MX, y - 18, W,
            "The first two things we build on any account are the asset library and the "
            "measurement. Both of them make your own team faster after we have gone.",
            bg=CREAM, spine=GOLD, size=12, leading=16)
    c.showPage()


# -------------------------------------------------------------- 12 shapes ----
def s_shapes(c):
    chrome(c, "How we would work")
    y = heading(c, "Seven standard shapes, because bespoke is slow and expensive "
                   "for both of us.")
    y = para(c, "We sell known shapes with known deliverables and known effort. Bespoke "
                "is available, by exception and at a premium, and anything outside a shape "
                "is quoted as a change in writing before it starts.",
             MX, y - 18, "Helvetica", 12, BODY, W, 17)
    rows = [
        ["Shape", "What you get", "Duration"],
        ["Brand foundation",
         "Positioning, architecture, identity, guidelines and core messaging, applied to "
         "three surfaces", "4 to 6 weeks"],
        ["Digital front door",
         "Website or landing estate, search foundations, enquiry and booking capture, "
         "analytics, and the how did you hear about us instrumentation", "6 to 8 weeks"],
        ["Service line launch",
         "One service line positioned, creative, a campaign, referrer communications and a "
         "measurement frame", "8 weeks"],
        ["Referral engine",
         "Referrer mapping, communications, a portal or maintained list, and the rhythm "
         "that keeps it alive", "8 to 12 weeks"],
        ["Always on marketing",
         "Content calendar, social, email, community management and monthly reporting",
         "Monthly"],
        ["Growth retainer",
         "Always on, plus paid media management, landing pages, testing and optimisation",
         "Monthly"],
        ["Fractional marketing lead",
         "A senior marketer in your leadership rhythm for a set number of days a month",
         "Monthly"],
    ]
    y = simple_table(c, rows, MX, y - 18, [148, W - 148 - 96, 96],
                     size=10.5, leading=13.2, pad=7)
    c.showPage()


# ------------------------------------------------------- 13 service levels ---
def s_service(c):
    chrome(c, "What we commit to")
    y = heading(c, "Service levels, in writing, in the contract.")
    y = para(c, "An agency that will not commit to response times in a contract is "
                "telling you something about its capacity. These are ours.",
             MX, y - 20, "Helvetica", 12.5, BODY, W - 272, 18)
    rows = [
        ["Commitment", "Standard"],
        ["Acknowledge a request", "Same working day"],
        ["Substantive response to a brief", "Two working days"],
        ["First draft of a standard deliverable", "Five working days from an approved brief"],
        ["Rounds of revision included", "Two, after which it is a change of scope"],
        ["Monthly report delivered", "By the fifth working day of the following month"],
        ["Campaign live after final approval", "Three working days"],
        ["A reputational issue", "Four hours, in hours"],
    ]
    y = simple_table(c, rows, MX, y - 20, [262, W - 262 - 272], size=11.5, leading=14.5, pad=9)
    callout(c, PAGE_W - MX - 254, PAGE_H - 150, 254,
            "We plan the team to seventy per cent of capacity. The slack is not waste, it "
            "is what makes the table on the left keepable in a month when something goes "
            "wrong.",
            bg=CREAM, spine=GOLD, size=11.5, leading=15.5)
    c.showPage()


# ------------------------------------------------------------- 14 will not ---
def s_notdo(c):
    chrome(c, "What we commit to")
    y = heading(c, "What we will not do.")
    y = bullet_block(c, [
        ("Take a commission on your media spend.", "Media and third party production pass "
            "through at cost and you see the invoices. This is unusual in this market and "
            "it is the reason we can argue about a channel honestly."),
        ("Fund your media.", "Campaign budget is yours and is in place before a campaign "
            "starts. An agency carrying a client's media money is an agency that one day "
            "stops working."),
        ("Claim an outcome we cannot evidence.", "We report what is attributable, say "
            "plainly what is not, and will not put a number in front of you that we would "
            "not defend to your board."),
        ("Name you without written clearance.", "Not in a case study, not in a pitch, not "
            "on a slide. Our proof is the method, and the method publishes without the "
            "client."),
        ("Market a service you cannot deliver.", "The capacity rule, again, because it is "
            "the one most often broken."),
    ], MX, y - 24, W, size=12.5, leading=17.0, gap=14)
    c.showPage()


# ---------------------------------------------------------------- 15 proof ---
def s_proof(c):
    chrome(c, "Our proof is the method")
    y = heading(c, "What we actually do, shown without naming anybody.")
    y = para(c, "We clear every named reference in writing, and most clients would rather "
                "we did not ask. So we will not show you logos. We will show you method, "
                "which is the thing you are buying.",
             MX, y - 18, "Helvetica", 12, BODY, W, 17)
    rows = [
        ["The engagement", "What the method found"],
        ["A specialist facility whose growth plan rested on its revenue record",
         "The revenue record was a nursing handover sheet. We rebuilt it from source before "
         "anybody was allowed to discuss growth."],
        ["A surgeon convinced his problem was his location",
         "His problem was that the complex work he was best in the country at was not what "
         "any of his marketing described."],
        ["A campus whose business case rested on its floor area",
         "The measured drawings were more than two hundred square metres away from the "
         "brief. Every figure downstream of it changed."],
        ["A health plan that wanted to count its providers",
         "The number that mattered was coverage, not count. Counting harder would have "
         "answered the wrong question very precisely."],
        ["A ten case trace through a private surgical practice",
         "Where the money left the building, case by case, before a naira was spent on "
         "attracting more of it."],
    ]
    y = simple_table(c, rows, MX, y - 18, [258, W - 258], size=10.5, leading=13.2, pad=7)
    callout(c, MX, y - 16, W,
            "Every one of those is a growth conversation that started with arithmetic. "
            "That is the difference between this practice and an agency.",
            bg=SURFACE, spine=TEAL, size=12, leading=16)
    c.showPage()


# ------------------------------------------------------------ 16 questions ---
def s_questions(c):
    chrome(c, "What we would ask today")
    y = heading(c, "The six questions that would decide the brief.")
    y = bullet_block(c, [
        ("Which service lines carry your margin.", "Not which are busiest. Which ones you "
            "would want more of if you could choose."),
        ("Where is the spare capacity, by site.", "Lekki, Surulere and Maitama will not "
            "have the same answer, and the answer decides where a campaign points."),
        ("What do you want to be true in twelve months.", "More elective volume, a fuller "
            "theatre list, a referral base, a payer contract, or a site in a fourth city. "
            "These need different work."),
        ("Who refers to you, and who has stopped.", "The second half of that question is "
            "usually the more valuable one and almost nobody tracks it."),
        ("What happens to an enquiry.", "Who answers, how fast, on which channel, and how "
            "many of them you could name a month later."),
        ("Is the six zone plan a capital plan or an ambition.", "Both are legitimate "
            "answers. They imply completely different brand decisions now."),
    ], MX, y - 22, W - 268, size=12.0, leading=16.0, gap=11)
    callout(c, PAGE_W - MX - 246, PAGE_H - 150, 246,
            "There is a longer written version of this, structured so most of it can be "
            "answered from memory. We will send it after the call if it is useful.",
            bg=CREAM, spine=GOLD, size=11.5, leading=15.5)
    c.showPage()


# -------------------------------------------------------------- 17 options ---
def s_options(c):
    chrome(c, "Where this could go")
    y = heading(c, "If this is what you need, this is what it looks like.")
    y = para(c, "Shapes, not a quotation. A quotation needs the answers to the previous "
                "slide, and we would rather show you a build up than a round number.",
             MX, y - 18, "Helvetica", 12, BODY, W, 17)
    rows = [
        ["If what you need is", "Then expect", "Shape"],
        ["To know what is actually wrong before you spend anything",
         "A marketing and growth diagnostic across the three centres, ending in a written "
         "read and a priority order", "3 to 4 weeks"],
        ["To settle who the group is, and who the sub brands are",
         "A brand foundation engagement, with the architecture decision taken at the end of "
         "week two rather than the end of the project", "4 to 6 weeks"],
        ["To stop losing the enquiries you already generate",
         "A digital front door build across the three centres, with the measurement "
         "installed and tested", "6 to 8 weeks"],
        ["To grow one service line that has capacity today",
         "A service line launch: positioning, creative, campaign, referrer communications "
         "and a measurement frame", "8 weeks"],
        ["To package and sell the inbound surgical product",
         "A destination product build: pathway, pricing, coordinator, complications promise "
         "and referrer relationships abroad", "10 to 12 weeks"],
        ["Ongoing delivery once a direction is set",
         "A retainer, always on or growth, with a tightly defined scope and a change "
         "mechanism in the contract", "Monthly"],
    ]
    y = simple_table(c, rows, MX, y - 18, [214, W - 214 - 96, 96],
                     size=10.5, leading=13.2, pad=7)
    callout(c, MX, y - 14, W,
            "We price from resourced days at published grades. Media and third party "
            "production sit outside the fee and pass through at cost.",
            bg=SURFACE, spine=TEAL, size=11.5, leading=15.5)
    c.showPage()


# ----------------------------------------------------------------- 18 next ---
def s_next(c):
    # No chrome here. The page furniture paints the flat icon, which carries no
    # alpha and would drop a white box on the dark ground.
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
    for line in wrap(c, "What we would like to happen next.", SERIF_B, 26, 560):
        c.drawString(MX, y, line)
        y -= 33

    y = bullet_block(c, [
        ("Today.", "You talk and we ask. We will not pitch for the rest of the hour."),
        ("This week.", "We send the written discovery set, and a two page note of what we "
                       "heard, so you can check that we understood it."),
        ("Within a fortnight.", "A working session with whoever owns the numbers, and a "
                                "proposal against one shape rather than six."),
    ], MX, y - 18, 530, size=12.5, leading=17.0, gap=13,
        body_color=D.LIGHT, tick=GOLD)

    box(c, MX, 92, 530, 62, D.IND, spine=GOLD)
    c.setFont(SERIF_I, 13)
    c.setFillColor(SAGE)
    c.drawString(MX + 22, 92 + 37,
                 "We have run hospitals, so we build marketing around how a")
    c.drawString(MX + 22, 92 + 19, "hospital actually earns.")

    c.setFont("Helvetica", 10.5)
    c.setFillColor(SKY)
    c.drawString(MX, 62, "hello@consultforafrica.com   /   +234 913 813 8553   /   "
                         "consultforafrica.com   /   Lagos and Abuja")

    c.setFillColor(GOLD)
    c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFont("Helvetica", 8)
    c.setFillColor(D.LIGHT)
    c.drawString(MX, 19, D.FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, "18 / 18")
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Grandville Medical Group: Marketing and Growth")
    c.setAuthor("Consult for Africa")
    cover(c)
    for fn in (s_outside, s_firm, s_people, s_two, s_founder, s_capacity,
               s_movable, s_destination, s_capability, s_withyou, s_shapes,
               s_service, s_notdo, s_proof, s_questions, s_options):
        fn(c)
    s_next(c)
    c.save()
    print("wrote", OUT)
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
