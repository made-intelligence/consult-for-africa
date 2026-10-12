"""
MEDLYFE INTRODUCES. Model for the launch evening and the campaign around it.

A cocktail evening on the theme "Feel Good Within and Look Better Outward", hosted
by Medlyfe, with Dr Chinwe Kpaduwa on the agenda as the promoter of Lyfe Plastics
and Dermatology. That last part stays in the fine print.

Single source of truth for the plan, the deck and any short form. Nothing numeric is
typed in a builder.

Every string here renders through reportlab, so ampersands arrive pre-escaped.
No em dashes anywhere in this file.
"""

from __future__ import annotations

M = 1_000_000
K = 1_000

TODAY = "28 September 2026"
BUILD_START = "Monday 28 September"
EVENT_DATE = "Thursday 15 October 2026"
FALLBACK_DATE = "Thursday 22 October"
END_DATE = "Friday 20 November 2026"
BUILD_WEEKS = 1.5
TOTAL_WEEKS = 7

DOCTORS = 25
PRESS = 8

# --------------------------------------------------------------------- the idea
PLATFORM = "MEDLYFE INTRODUCES"
THEME = "Feel Good Within and Look Better Outward"
THEME_LINE = ("How you feel and how you look are the same appointment, and almost "
              "nobody in this city treats them that way.")
THEME_CREDIT = ("The theme came from Medlyfe's lead clinician, not from us, which is "
                "the best possible provenance for it. It is what the clinic already "
                "believes, said out loud for the first time.")

# Two themes, one per segment. The evening runs under the Medlyfe one; Dr Kpaduwa's
# segment has its own title inside it.
CHINWE_THEME = "The Art of Looking Like Yourself"
CHINWE_THEME_LINE = ("Aesthetic care for the woman who wants to look rested, not "
                     "rearranged.")

THEMES = [
    ("The evening and the panel", THEME,
     "From Medlyfe's lead clinician. The proposition the clinic already holds, argued "
     "in public for the first time, across the wellness side and the aesthetic side."),
    ("The conversation and Dr Kpaduwa's introduction", CHINWE_THEME,
     "Her own clinical position, which is that the skill is judgement and the best "
     "result is the one nobody can point at. It is the outward half of the evening "
     "theme, taken to its sharpest point."),
]
EDITION = "Edition one: " + THEME
TAKEAWAY = "What to ask before anybody treats your face, your skin or your hormones"

HOUSE_BRAND = "Lyfe Plastics &amp; Dermatology"
HOUSE_BRAND_PLAIN = "Lyfe Plastics and Dermatology"

FINE_PRINT = ("Medlyfe introduces " + HOUSE_BRAND + ", promoted by Dr Chinwe Kpaduwa.")

BILLING = [
    ("The headline", "Medlyfe, and the theme",
     "Medlyfe is trading, licensed and bookable, so it is the brand that carries the "
     "evening and takes the booking on the night."),
    ("The agenda", "Dr Chinwe Kpaduwa, prominently",
     "She opens the conversation, sits on the panel and is in the room afterwards. "
     "Without her name the October diary does not clear."),
    ("The fine print", FINE_PRINT,
     "Set small, in three places only, and never said from the stage. Enough to plant "
     "the venture, not enough to look like the opening of a clinic that is still being "
     "built."),
]

# ------------------------------------------------------------------ the evening
RUN_OF_SHOW = [
    ("18:30", "Arrival", "Cocktails, DJ under the conversation, the portrait wall. The "
     "consultation desk open from the door, staffed, diary live"),
    ("19:15", "Welcome and the film", "Five minutes. A short welcome, then ninety "
     "seconds cut from the shoot the week before"),
    ("19:20", "Medlyfe, presented", "Fifteen minutes, and the longest single item on "
     "the platform after the panel, because it is Medlyfe's evening. The clinic, the "
     "two halves, what has been built this year and who the clinicians are"),
    ("19:35", "The panel", "Thirty minutes on " + THEME + ", across the wellness side "
     "and the aesthetic side. The proposition gets argued before anybody is "
     "introduced"),
    ("20:05", "In conversation with Dr Chinwe Kpaduwa",
     "Twenty minutes, hosted, under its own title, " + CHINWE_THEME + ". The peak of "
     "the evening. The promoter of " + HOUSE_BRAND + " on what she is building, what "
     "good work looks like, and what she will not have done"),
    ("20:25", "The services, and what they cost", "Fifteen minutes. What Medlyfe offers "
     "on each side, what each thing is for, who it suits, and the price"),
    ("20:40", "Questions from the room", "Fifteen minutes, chaired"),
    ("20:55", "The room", "The desk taking bookings, Dr Kpaduwa and the clinic team "
     "available, press interviews in the side room"),
    ("21:30", "Close", "The takeaway handed to every guest on the way out"),
]

PANEL = [
    ("Dr Chinwe Kpaduwa", "Plastic surgeon, board certified in the United States",
     "The promoter of " + HOUSE_BRAND + ", and the outward half of the theme"),
    ("Medlyfe's wellness physician", "The inside half",
     "Metabolic health, hormones, longevity and the diagnostics underneath them, which "
     "is the part of the proposition that can be sold from the following Monday"),
    ("The Medlyfe clinician who delivers", "Aesthetic lead",
     "The room meets the person who will actually treat them, which answers the "
     "question everyone is too polite to ask"),
    ("A chair the room respects", "A founder, a lawyer or a broadcaster, not an "
     "influencer",
     "Keeps it a conversation rather than a presentation"),
]

FIRESIDE = [
    "What she is building in Lagos and why she wanted it built inside Medlyfe rather "
    "than on her own",
    "How a surgeon decides who should have something done, and who should not",
    "Why the best work is the work nobody can point at, which is the whole of " +
    CHINWE_THEME,
    "What she will not have done in this clinic, and why that list matters more than "
    "the menu",
    "How the team is trained and signed off, which is what makes the standard hers even "
    "when she is not in the building",
]

PANEL_TOPICS = [
    "Why the woman who sleeps badly, carries visceral fat and hates her skin has one "
    "problem, not three",
    "What actually changes how a woman looks at forty five, in order of effect",
    "Where aesthetic medicine helps and where it is being sold to people who do not "
    "need it",
    "What a proper consultation should feel like, so the room knows what to expect "
    "anywhere",
]

# The order matters. The panel establishes the proposition while the room is still
# settling, the conversation with the promoter is the peak, and it runs straight into
# the menu while the room is warmest.
ORDER_NOTE = (
    "Medlyfe gets a proper fifteen minutes of its own before anything else, because it "
    "is Medlyfe's evening and a two minute welcome would have said the opposite. The "
    "panel then argues the theme while the room is still settling into it, with "
    "Medlyfe's own clinicians on the platform before anybody is introduced. Dr Kpaduwa "
    "closes the platform rather than opening it, which makes her the peak, and her "
    "conversation runs straight into the menu while the room is at its warmest."
)

SERVICE_TALK = [
    ("Within", "Each programme named, what it is for, who it suits, how long it runs, "
     "and the fact that it can start the following week"),
    ("Outward", "Skin, injectables and the regenerative treatments, said honestly, "
     "including what the evidence does and does not support"),
    ("What is coming", HOUSE_BRAND + ", and what it will add. Described as being built, "
     "with no dates offered"),
    ("What it costs", "Published on the night, because a room that has to ask assumes "
     "the worst"),
]

ROOM = [
    ("Medlyfe's own patients and members", 45,
     "The warmest list in the building and the most likely to book on the night"),
    ("The corporate channel", 25,
     "Senior women inside the group's corporate clients, through the executive wellness "
     "lists"),
    ("Invited guests of the hosts", 30,
     "Three hosts who are professional women with real networks, invited as peers and "
     "not paid"),
    ("Referring doctors", DOCTORS,
     "Dermatology, obstetrics and gynaecology, bariatric and metabolic medicine, family "
     "medicine and dentistry, invited as guests"),
    ("Press", PRESS,
     "Health, business and lifestyle desks, plus two interview slots in the side room"),
]
ROOM_TOTAL = sum(r[1] for r in ROOM)
GUESTS = ROOM_TOTAL - DOCTORS - PRESS

ART_DIRECTION = [
    ("Medlyfe hosts it, and the series is built to travel",
     "Edition one carries Medlyfe's marks. Underneath them the series has its own quiet "
     "format, a typographic system and a portrait treatment rather than a second logo, "
     "so it continues as " + HOUSE_BRAND + " Introduces without being designed again."),
    ("Two halves, one room",
     "The theme has an inside and an outside, so the room does too. Warm low light and "
     "soft materials on one side, clean light and clear glass on the other, meeting in "
     "the middle where the panel sits."),
    ("Portraits, not stock",
     "The only images in the room are the portraits made that week. No stock, no generic "
     "clinic imagery, and no patient photographs of any kind."),
    ("Music that lets people talk",
     "A DJ, briefed rather than left to play a set. Under the conversation on arrival, "
     "silent through the chat and the panel, lifted once the room opens up again."),
    ("One object people take home",
     "A short printed piece, “" + TAKEAWAY + "”. Useful, on theme, and it is "
     "what the campaign publishes afterwards."),
]

# --------------------------------------------------------- how she is described
# Her licence arrangements are still in train. Promoter is a business role, not a
# clinical one, which is why the positioning below works.
POSITIONING = [
    ("Promoter of " + HOUSE_BRAND, True,
     "A business role, not a clinical one. She is building a company, which is true, "
     "sayable and does not depend on anything being finalised."),
    ("Clinical lead behind the Medlyfe aesthetic service", True,
     "She designed it, wrote the protocols and trains the clinicians who deliver it."),
    ("Treatment delivered by Medlyfe's own registered clinicians", True,
     "Named, present on the night, on the panel."),
    ("Not here to start seeing patients", False,
     "No copy, caption, invitation or interview says she is taking patients, "
     "consulting, treating or operating in Lagos."),
    ("No appointments with her", False,
     "The desk books consultations with the clinic. No version of the booking flow "
     "offers her name as the clinician."),
    ("No surgical dates and no surgical promises", False,
     HOUSE_BRAND + " is spoken about as being built, and the list is interest "
     "registered against an opening."),
]

# ------------------------------------------------------------------ the campaign
CAMPAIGN = [
    ("Before", "Weeks 1 to 3",
     "The announcement of what Medlyfe now offers across both halves of the theme, "
     "issued with the portrait set to health, business and lifestyle desks. Two preview "
     "interviews recorded under embargo. Invitations by hand and then by telephone, "
     "because a printed invitation followed by a call fills a room and an email does "
     "not."),
    ("On the night", "Week 3",
     "Press in the room with two interview slots in the side room, and the crew "
     "covering the evening."),
    ("After", "Weeks 4 to 8",
     "The preview interviews land. One broadcast or podcast appearance. The education "
     "series publishes weekly, eight short films and four written pieces cut from the "
     "masters, split across the two halves of the theme. The takeaway goes behind the "
     "enquiry form, which is what turns a reader into a name."),
]

CAMPAIGN_RULES = [
    ("Nobody is paid to bring us a patient",
     "No commission to a doctor, a salon, a concierge or a host, and no influencer "
     "arrangement, paid or gifted. Paying a moderator to chair a panel is a different "
     "thing and is perfectly proper."),
    ("No claim that anyone is better than anyone else",
     "Training, board certification and what a clinician does are statements of fact "
     "and are properly said. No best, no first, no only."),
    ("Clinical images only on explicit written consent",
     "Required by the Council's guidance on online conduct of 14 October 2025. None of "
     "it in this window in any case."),
    ("No branded giveaways",
     "Part F names the category down to calendars and wall clocks. The takeaway is a "
     "piece of writing, not merchandise."),
]

# ---------------------------------------------------------------- the build
BUILD = [
    (1, "28 Sep to 2 Oct", "Lock it and start calling",
     "Venue contracted by Wednesday. Theme and identity signed off. Both guest lists "
     "built from Medlyfe's book, the corporate channel, the three hosts and the doctor "
     "list. Panel and chair approached. Enquiry form and booking page live. Invitation "
     "designed and at the printer by Thursday. The telephone calls start Wednesday, "
     "ahead of the card rather than after it."),
    (2, "5 to 9 Oct", "Make it",
     "Shoot on Monday: portraits, interview masters and the ninety second film, one day "
     "on a controlled set. The Medlyfe presentation, the panel brief and the "
     "conversation built Monday and Tuesday. Announcement issued Monday. Preview "
     "interviews recorded under embargo. Cards delivered against calls already made, "
     "and the telephone chase runs all week."),
    (3, "12 to 16 Oct", "Hold it, then deliver it",
     "Final numbers Monday and the room re-called Tuesday, because a list built ten days "
     "out decays. Supplier confirmations and the set in on Wednesday. Run through "
     "Wednesday afternoon. " + EVENT_DATE + ", with the crew and the press in the room. "
     "Follow up begins inside 48 hours, which means Friday."),
]

AFTER = [
    (4, "19 to 23 Oct", "Convert",
     "Consultation clinics open on both sides of the menu, at capacity. Preview "
     "interviews publish. Every doctor who came is called."),
    (5, "26 to 30 Oct", "Publish",
     "The education series starts, one piece a week. The takeaway goes live behind the "
     "enquiry form. Second round of referrer follow up."),
    (6, "2 to 6 Nov", "Hand over",
     "The Medlyfe team takes the list, the booking discipline and the publishing "
     "calendar. Broadcast appearance."),
    (7, "9 to 13 Nov", "Build the bench",
     "Training and credentialing weeks with the clinic team, signed off by her. The "
     "surgical interest list confirmed and consented."),
    (8, "16 to 20 Nov", "Close",
     "The report: what the evening produced, what is in the pipeline, and the brief for "
     "edition two."),
]

# ---------------------------------------------------------------------- next year
NEXT_YEAR = [
    ("Edition two", "First visit, 2027",
     "The first edition as " + HOUSE_BRAND + " Introduces. The surgical service and the "
     "partner theatre, with the first operating list running in the same week."),
    ("Edition three", "Second visit, 2027",
     "The team she has trained, presenting their own work, which is the evening the "
     "practice stops being one person."),
    ("Edition four", "Third visit, 2027",
     "Whatever is next. By then people come because the series is worth attending."),
]

REUSED = [
    ("The format and the run of show", "Refined each time rather than reinvented"),
    ("The series identity", "Built as a format rather than as Medlyfe livery, so the "
     "invitation, the print, the stage and the film carry whichever name is hosting. "
     "Both names share the Lyfe root, so the audience reads edition two as the same "
     "series"),
    ("The set, the crew and the portrait library", "Shot once, added to on each visit"),
    ("The guest list and the doctor list", "They grow rather than restart"),
    ("The press relationships", "Worth more on the second approach than the first"),
    ("The website, the enquiry form and the consent record",
     "Built once, rebadged for each edition"),
]

# --------------------------------------------------------------------- the money
CFA_DAYS = 19

WORKSTREAMS = [
    ("creative", "Concept and creative direction",
     "The series, the theme, the run of show, the art direction, the takeaway, and the "
     "conversation and service talks built with Dr Kpaduwa and the Medlyfe clinicians."),
    ("event", "The evening",
     "Venue and suppliers, the panel and the chair, both guest lists, invitations and "
     "the telephone chase, the run through, front of house, the consultation desk, and "
     "the follow up loop after it."),
    ("campaign", "The campaign",
     "Announcement, press relations, the shoot, the interview programme and the seven "
     "week publishing calendar."),
    ("engine", "The website, the list and the bookings",
     "The event and campaign site, the enquiry form, the consent record, the clinic "
     "diary, the follow up discipline, and the one dashboard everybody reads on a "
     "Friday."),
    ("handover", "Handover to Medlyfe",
     "Four named Medlyfe people paired from week one, each taking their piece on a "
     "dated week, so the campaign runs without us after 13 November."),
]

CFA_COSTS = [
    ("Programme lead", "Part time across the eight weeks", 500 * K),
    ("Event and campaign executive", "Through the build and the night", 300 * K),
    ("Coordination and data support",
     "Guest lists, the enquiry record and the Friday dashboard", 100 * K),
    ("Travel and logistics",
     "Venue recces, supplier visits, invitation delivery runs and the event day", 80 * K),
    ("Communications, courier and print", "Calls, dispatch and working documents", 20 * K),
]

FEE = sum(c[2] for c in CFA_COSTS)

CANAPE_PER_HEAD = 15 * K
DRINKS_PER_HEAD = 6.5 * K

COSTS = [
    ("The evening", "Venue hire",
     "Four to five hours for a three hour event, in a space that takes outside catering",
     800 * K, None),
    ("The evening", "Setup and technical",
     "Chairs, staging, styling, florals, sound, lighting and the screen. Capped",
     1_000 * K, None),
    ("The evening", "Canapes",
     "Three piece set at {:,.0f} per head inclusive of service charge, {} in the "
     "room".format(CANAPE_PER_HEAD, ROOM_TOTAL),
     round(CANAPE_PER_HEAD * ROOM_TOTAL), None),
    ("The evening", "Drinks",
     "Three hour bar at {:,.0f} per head".format(DRINKS_PER_HEAD),
     round(DRINKS_PER_HEAD * ROOM_TOTAL), None),
    ("The evening", "Music", "DJ, briefed. Under the conversation, silent through the "
     "chat and the panel", 300 * K, None),
    ("The evening", "Chair and panel",
     "Honorarium for the chair, transport and hospitality for the panel", 700 * K, None),
    ("The evening", "Film and photography",
     "One crew across two days. Portraits, interview masters and the ninety second film "
     "on a controlled set, then the evening itself", 1_400 * K, "film"),
    ("The evening", "Invitations, programme and the takeaway",
     "Design, print and hand delivery", 950 * K, None),
    ("The evening", "Guest management and front of house",
     "Registration, ushers and the consultation desk", 350 * K, None),
    ("The evening", "Contingency",
     "Held against the event lines only, released or returned", 500 * K, None),

    ("The campaign", "Paid media placement",
     "The agreed plan of 28 September: BellaNaija before and after, Guardian Life as the "
     "anchor partner on the night, and news placements in The Guardian and BusinessDay. "
     "Itemised outlet by outlet under The Campaign. VAT is added only if the outlets "
     "charge it", 2_629_375, "press"),
    ("The campaign", "The education series",
     "Editing, grade, captions and design for the twelve pieces", 1_800 * K, "series"),
    ("The campaign", "Media logistics and licensing",
     "Transport, stills licensing, transcription and the coverage report", 400 * K,
     "press"),

    ("Website and print", "The event and campaign website",
     "One site carrying the invitation, the programme, the enquiry form, consent "
     "capture and the takeaway. Built once and reused by every edition", 500 * K, None),
    ("Website and print", "Hosting and messaging", "Three months at 100k", 300 * K, None),
    ("Website and print", "Patient information and clinic collateral",
     "In premises leaflets and consent forms", 400 * K, None),
]

# ---------------------------------------------------------------- the media plan
# Agreed 28 September 2026. Owner Opeoluwa. Figures are the outlets' rate card.
# (window, outlet, what, angle, cost excluding VAT)
MEDIA_PLAN = [
    ("10 to 14 Oct", "BellaNaija", "Editorial feature, web and social",
     "Rethinking ageing", 188_125),
    ("15 Oct", "Guardian Life", "Live coverage, Instagram post and website story",
     "Beyond beauty, body confidence", 1_500_000),
    ("16 to 29 Oct", "The Guardian", "News story placement",
     "Reconstructive surgery", 150_000),
    ("16 to 29 Oct", "BusinessDay", "News story placement",
     "Longevity as a health and economic shift", 200_000),
    ("16 to 29 Oct", "BellaNaija", "Carousel post, fifteen images",
     "Event highlights", 215_000),
    ("16 to 29 Oct", "BellaNaija", "Standalone video",
     "Event recap and guest voices", 376_250),
]
MEDIA_NET = sum(m[4] for m in MEDIA_PLAN)
VAT = 0.075
MEDIA_GROSS = round(MEDIA_NET * (1 + VAT))
MEDIA_ANCHOR_SHARE = 1_500_000 / MEDIA_NET

COST_TOTAL = sum(c[3] for c in COSTS)
PROGRAMME_TOTAL = FEE + COST_TOTAL
COST_GROUPS = ["The evening", "The campaign", "Website and print"]


def cost_group(group):
    return sum(c[3] for c in COSTS if c[0] == group)


MODULES = [
    ("series", "The education series", 1_800 * K),
    ("press", "Paid media placement and media logistics", 2_629_375 + 400 * K),
    ("film", "The portrait and interview shoot", 1_400 * K),
]

TRANCHES = [
    ("On approval", 0.80, "The venue, the crew, the printer and the anchor outlet are all "
     "settled before the night"),
    ("After the evening", 0.20, "The campaign weeks, and the account reconciled against what "
     "was spent"),
]

SCOPE_NOTE = (
    "We direct rather than staff. We hold the concept, the suppliers, the guest lists, "
    "the run of show and the campaign calendar, and we are in the room on the night. "
    "What nineteen days does not stretch to is sitting inside Medlyfe doing the daily "
    "execution, so the four named people below are not a courtesy, they are how the "
    "work gets done."
)

COST_BASIS = (
    "CFA is a shareholder in this venture, so for the launch edition we are charging "
    "what it costs us to run and nothing else. No rate card, no margin and no "
    "management fee. That is " + "NGN {:,.1f}m".format(FEE / M) + " of operational cost "
    "against " + str(CFA_DAYS) + " days of our own time across the eight weeks, which "
    "we are not billing. It is specific to this edition. It is not the basis for the "
    "services agreement, which is separate and already documented."
)

# ------------------------------------------------------------------- her time
HER_DAYS = [
    ("The shoot", 1.0, "Week 2. Portraits, interview masters and the film"),
    ("Building the conversation", 0.5, "Week 2, with us"),
    ("Press", 1.0, "Two preview interviews, and one broadcast appearance"),
    ("The evening", 1.0, EVENT_DATE + ", from the afternoon run through"),
    ("Protocols and the clinical standard", 2.5,
     "Written down, so the service has a standard that does not depend on who is in the "
     "country"),
    ("Training and credentialing the team", 2.5,
     "Weeks 4 to 8. The clinicians who deliver the service, signed off by her"),
    ("Case review with the treating clinicians", 1.0,
     "Weekly, with the clinic team rather than with patients"),
    ("The Friday call", 0.5, "One hour a week"),
]
HER_TOTAL = sum(h[1] for h in HER_DAYS)

# -------------------------------------------------------------------- the funnel
SOURCES = [
    ("The room on the night", GUESTS, 1.00, 1.50,
     "Every guest is a qualified name, and each brings half of another afterwards"),
    ("Doctors in the room", DOCTORS, 0.60, 0.80,
     "60 per cent agree to refer, 0.8 referrals each inside the window"),
    ("Medlyfe's existing book", 900, 0.13, 1.00,
     "Consented patients contacted directly, plus leaflets in the clinic"),
    ("Press and the series", 900, 0.06, 1.00,
     "Reach is unreliable, so this is deliberately the most conservative rate here"),
    ("The corporate channel", 500, 0.08, 1.00,
     "Executive wellness lists inside the group's corporate clients"),
]


def qualified(source) -> int:
    _, reach, rate, mult, _ = source
    return round(reach * rate * mult)


QUALIFIED = sum(qualified(s) for s in SOURCES)

CONSULT_RATE = 0.27
CONSULT_DAYS_PER_WEEK = 2
CONSULT_WEEKS = 5
CONSULT_SLOTS_PER_DAY = 8
CONSULT_CAPACITY = CONSULT_DAYS_PER_WEEK * CONSULT_WEEKS * CONSULT_SLOTS_PER_DAY
CONSULTS = min(round(QUALIFIED * CONSULT_RATE), CONSULT_CAPACITY)

# The outward half: an aesthetic treatment, and a quarter come back once.
TREAT_RATE = 0.40
TREAT_VALUE = 300 * K
REPEAT_RATE = 0.25
REPEAT_VALUE = 280 * K
TREATED = round(CONSULTS * TREAT_RATE)

# The inside half: a wellness or metabolic programme. Programme priced, sellable from
# the Monday after, and the reason a Medlyfe led evening earns more than a surgeon led
# one would.
WELLNESS_RATE = 0.20
WELLNESS_VALUE = 450 * K
WELLNESS = round(CONSULTS * WELLNESS_RATE)

AESTHETIC_REVENUE = round(TREATED * TREAT_VALUE + TREATED * REPEAT_RATE * REPEAT_VALUE)
WELLNESS_REVENUE = round(WELLNESS * WELLNESS_VALUE)
IN_WINDOW_REVENUE = AESTHETIC_REVENUE + WELLNESS_REVENUE

SURGICAL_RATE = 0.25
CASE_VALUE = 5 * M
WAITING_LIST = round(CONSULTS * SURGICAL_RATE)
PIPELINE = WAITING_LIST * CASE_VALUE
REFERRERS = round(DOCTORS * 0.60)

RECOVERY = IN_WINDOW_REVENUE / PROGRAMME_TOTAL
SURPLUS = IN_WINDOW_REVENUE - PROGRAMME_TOTAL
if SURPLUS >= 0:
    RECOVERY_LINE = (
        "The evening and the campaign return NGN {:,.1f}m of revenue inside the window "
        "against NGN {:,.1f}m of cost, so the whole programme is paid for before Dr "
        "Kpaduwa travels, with NGN {:,.1f}m over.".format(
            IN_WINDOW_REVENUE / M, PROGRAMME_TOTAL / M, SURPLUS / M))
else:
    RECOVERY_LINE = (
        "The evening and the campaign return NGN {:,.1f}m inside the window against NGN "
        "{:,.1f}m of cost, which is {:.0f} per cent of it recovered before Dr Kpaduwa "
        "travels.".format(IN_WINDOW_REVENUE / M, PROGRAMME_TOTAL / M, RECOVERY * 100))
CASES_TO_PAY_BACK = PROGRAMME_TOTAL / CASE_VALUE
PAYBACK_CASES = int(-(-PROGRAMME_TOTAL // CASE_VALUE))

TARGETS = [
    ("Qualified names, with consent", QUALIFIED,
     "Named, reachable, interest recorded, consent captured under the Nigeria Data "
     "Protection Act"),
    ("Consultations held", CONSULTS,
     "In the clinic, by Medlyfe's own registered clinicians, across both halves of the "
     "menu"),
    ("Doctors who have agreed to refer", REFERRERS,
     "Met the team, hold the direct line, and have had a first referral answered "
     "properly"),
    ("Registered interest in the surgical service", WAITING_LIST,
     "Consented and recorded against the service opening rather than against any date "
     "or any person"),
]

TEAM = [
    ("The list, bookings and follow up", "CFA consultant", "Patient coordinator",
     "Week 4"),
    ("Content, channel and press liaison", "CFA senior consultant",
     "Medlyfe marketing lead", "Week 5"),
    ("Event and supplier management", "CFA principal", "Medlyfe operations",
     "After the evening"),
    ("Clinical standard and protocols", "Dr Kpaduwa", "Clinic lead clinician",
     "From week 1"),
]

MEDBURY_PROVIDES = [
    "The clinic, its diary, and the registered clinicians who hold the consultations "
    "and deliver treatment on both sides of the menu",
    "Medlyfe's patient book and the corporate channel, with consent",
    "Four named people from week one doing the daily execution alongside us",
    "The telephone chase on both guest lists, which is the single thing that decides "
    "whether the room is full",
    "Decisions inside 48 hours",
]

ASSUMPTIONS = [
    "The evening is " + EVENT_DATE + ", which needs the budget approved and the venue "
    "contracted within days rather than weeks. The fallback is " + FALLBACK_DATE + ".",
    "Dr Kpaduwa is in Nigeria to at least " + END_DATE + ".",
    "Venue and catering are budgeted at Island rates as at September 2026 and confirm "
    "against written quotes in week one.",
    "Medlyfe can hold two consultation days a week across the four weeks after the "
    "evening. That ceiling, not demand, is what caps the numbers.",
]
