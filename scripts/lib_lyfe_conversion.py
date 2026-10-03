"""
LYFE PLASTICS AND DERMATOLOGY. The conversion plan, as a model.

Single source of truth for the deck. Every figure that appears on a slide is
here, with where it came from, so a number can be argued with rather than
believed.

Sources are labelled in the strings themselves where a client will reasonably
ask. Three kinds appear:

  MEASURED   independent, disclosed sample, traceable to a primary
  INDUSTRY   agency or vendor data, directionally useful, not citable
  OURS       Medbury's or CFA's own numbers, or an assumption we are making

No em dashes anywhere in this file.
"""

from __future__ import annotations

M = 1_000_000
K = 1_000

TODAY = "3 October 2026"
EVENT_DATE = "Saturday 10 October 2026"
WINDOW_END = "Friday 13 November 2026"
WEEKS = 6

BRAND = "Lyfe Plastics and Dermatology"
SURGEON = "Dr Chinwe Kpaduwa"
CLINIC = "Medlyfe"

# ---------------------------------------------------------------- what happened
MARCH_LEADS = 170
MARCH_WARM = 11
MARCH_CONVERTED = 0
MARCH_WARM_RATE = MARCH_WARM / MARCH_LEADS

# The credible band for a cold paid social lead reaching a booked consultation.
# Agency data, clustered tightly across three independent books, which is the
# best that exists: nobody publishes an independent aesthetics funnel benchmark.
BENCH_LEAD_TO_CONSULT = (0.20, 0.35)

# MEASURED. BSM Consulting and Allergan procedure conversion study: 220
# practices, 22,985 consultations, 10,530 converted.
BSM_PRACTICES = 220
BSM_CONSULTS = 22_985
BSM_CONVERT_MEDIAN = 0.458
BSM_CONVERT_TOP = 0.667
BSM_NOSHOW_MEDIAN = 0.089

# MEASURED, and Nigerian. A single private Nigerian cosmetic practice, 392
# consultations producing 245 operations. Nigerian Journal of Clinical
# Practice, June 2023.
NG_CONSULTS = 392
NG_SURGERIES = 245
NG_CONVERT = NG_SURGERIES / NG_CONSULTS

DIAGNOSIS = [
    ("The number is a quarter of normal, not a bit under",
     "Benchmarks put lead to booked consultation at 20 to 35 per cent for cold paid "
     "social. March ran at {:.1f} per cent. Nothing about creative or offer explains a "
     "gap that size on its own.".format(MARCH_WARM_RATE * 100)),
    ("Nigerian consultations close at {:.0f} per cent".format(NG_CONVERT * 100),
     "A Nigerian practice published 392 consultations producing 245 operations. The "
     "closing is not the problem in this market. The leads never became consultations."),
    ("So it is one of two things, and they have different fixes",
     "Either nobody rang them fast enough and often enough, or the campaign bought the "
     "wrong people. Both are cheap to test and one of them is free to fix."),
    ("Three questions settle it inside a day",
     "What was the actual time from form to first call. How many times was each lead "
     "called before it was abandoned. What did the page the ads pointed at weigh on a "
     "Lagos 4G connection."),
]

# MEASURED. Velocify sales optimisation study: roughly 3.5 million leads from
# 400+ clients. This grid is the single most actionable artefact in the whole
# research pass.
VELOCIFY_LEADS = "3.5 million"
SPEED = [
    ("1 minute", "+391%"),
    ("2 minutes", "+160%"),
    ("30 minutes", "+62%"),
    ("1 hour", "+36%"),
    ("5 hours", "+24%"),
    ("24 hours", "+17%"),
]

PERSISTENCE = [
    ("One call reaches 39 per cent of leads. Two reaches 72 per cent."),
    ("93 per cent of every lead that ever converts is reached inside six attempts."),
    ("Half of all leads are never called a second time."),
    ("A lead that takes seven or more calls to reach is 45 per cent less likely to convert."),
]

# The grid itself. Day, channel, and the conversion lift attributable to that
# slot in the study.
CADENCE = [
    ("Day 1", "0 to 1 minute", "Call", "+156%"),
    ("Day 1", "About 20 minutes", "Email", "+49%"),
    ("Day 1", "30 to 60 minutes", "Call", "+58%"),
    ("Day 1", "1 to 2 hours", "Call", "+25%"),
    ("Day 4", "Morning", "Email", "+85%"),
    ("Day 5", "Morning", "Call", "+22%"),
    ("Day 8", "Morning", "Email", "+52%"),
    ("Day 14", "Morning", "Call", "+23%"),
    ("Day 15", "Morning", "Call and email", "+9% and +37%"),
    ("Day 22", "Morning", "Email", "+44%"),
]
CADENCE_NOTE = (
    "Six calls, five emails, twenty two days. Not more than five emails in the first "
    "month, because the study found that a sixth drops conversion by 36 per cent. "
    "Correct call timing is worth 49 per cent on its own, correct email timing 53 per "
    "cent, and the two together 128 per cent."
)

# MEASURED. Oldroyd at MIT Sloan with InsideSales: 15,000+ leads, 100,000+
# dials. And the Harvard Business Review audit of what firms actually do.
SPEED_HEADLINE = (
    "Calling at five minutes rather than thirty multiplies the odds of qualifying a "
    "lead by twenty one. The median company takes forty two hours and 23 per cent "
    "never respond at all."
)

# ------------------------------------------------------------- the 170, honestly
# MEASURED. Validity win-back study. The numbers that matter are the read rate
# and the time to re-engage, and the second one is the one nobody expects.
WINBACK_READ = 0.12
WINBACK_MEDIAN_DAYS = 57
WINBACK_75_DAYS = 89

COLD_MODEL = [
    ("The 11 who went warm", 11, "Worked individually, by telephone, on the grid above. "
     "Worth more per head than the other 159 put together."),
    ("The 159 who did not", 159, "One honest message, not a campaign. A visiting surgeon "
     "with a finite diary is a reason to be writing that is not a discount."),
]
COLD_REACHABLE = (20, 65)
COLD_CONVERSATIONS = (8, 25)
COLD_CONSULTS = (5, 17)
COLD_CASES = (2, 7)
COLD_WARNING = (
    "Median time to re-engage a dormant contact is 57 days, and 75 per cent of "
    "reactivations land inside 89 days. Most of this list will answer after she has "
    "flown home. Plan it as January pipeline, not as a six week harvest."
)

# ------------------------------------------------------------------ the gates
# Five regulators, not one. The order here is by how likely each is to actually
# bite, which is not the order anybody expects.
GATES = [
    ("ARCON", "Every paid item", "MINIMUM NGN 500,000 PER UNAPPROVED AD",
     "The 2022 Act defines an advertisement to include an event or a person, on any "
     "medium. Everything needs pre exposure approval, only a licensed agency may submit "
     "it, and the liability sits on the advertiser. Influencer posts are covered.",
     "Budget the accelerated tier at 4, 8 or 16 working hours. This is a critical path "
     "line item, not an afterthought."),
    ("NAFDAC", "Naming any product", "Cannot say the brand names at all",
     "Toxin and fillers are prescription only medicines, advertisable only in medical "
     "journals. Cosmetics need separate approval. No consumer promotions at all on "
     "anything medicinal.",
     "No brand names anywhere in public copy, and no book in October offer on "
     "injectables. The published list already uses generic names only."),
    ("MDCN, Part F", "Who may be promoted", "A disciplinary offence for the doctor",
     "Self advertisement by a practitioner is misconduct, as is canvassing and as is "
     "being associated with those who sanction it. Permitted: public health education, a "
     "facility describing its own services, leaflets inside the premises.",
     "The clinic advertises. She educates. That single configuration satisfies all of "
     "it, and it is what the page and the creative already do."),
    ("MDCN, October 2025", "Social media conduct", "New, and directly on point",
     "Issued 14 October 2025. No identifiable patient image without explicit written "
     "consent. Personal social accounts are not to be used for consultations, which "
     "kills any message me to book mechanic.",
     "One clinic WhatsApp line, never a personal account. No patient images in this "
     "window at all."),
    ("MDCN registration", "Whether she can see anyone", "The one that decides the rest",
     "No practice without registration. Temporary registration needs a letter of good "
     "standing and a firm offer of employment from a Nigerian hospital, so the clinic "
     "acts, not her. Jurisdiction reaches only registered practitioners, so the exposure "
     "lands on the clinic and its medical director.",
     "Start it now and say so. Registration in progress is a credibility asset."),
]

# The language table, lifted from what the rules actually permit. This is the
# most useful single page in the deck for anybody writing copy.
LANGUAGE = [
    ("Founder, or co-founder, of the practice", "Our plastic surgeon"),
    ("Promoter, programme director, clinical adviser", "Now accepting patients in Lagos"),
    ("United States board certified plastic surgeon", "Book your surgery with her in Lagos"),
    ("An educational series with Dr Chinwe Kpaduwa", "Message her to book a consultation"),
    ("The clinic describes its services", "She describes her skill, experience or results"),
    ("In person clinics planned, subject to clearance", "Any date certain promise of surgery"),
]

# The precedent that should govern the image policy. A Beverly Hills Black
# plastic surgeon, the same channel, the same content type.
IMAGE_PRECEDENT = (
    "In 2020 a Beverly Hills plastic surgeon was sued for posting patient photographs "
    "without consent. A judgment of six hundred thousand dollars against him was upheld "
    "on appeal in May 2023. Her existing before and after images were taken under United "
    "States consents that will not cover Nigerian marketing. Re papering them is a "
    "lawyer's job, not a designer's, and in this window we simply do not use them."
)

# ----------------------------------------------------------------- the market
SUPPLY = [
    ("Consultant plastic surgeons in Nigeria", "about 124", "One per 1.5 million people"),
    ("What the British association recommends", "one per 100,000", "We are at a fifteenth of it"),
    ("Dermatologists in Nigeria", "about 90", "For 235 million people"),
]
SUPPLY_NOTE = (
    "This is the strongest structural argument in the business and nobody is using it. "
    "The constraint in Lagos aesthetics is not demand and it is not capital. It is that "
    "there are almost no qualified people."
)

# The one Lagos competitor publishing a surgical price list, accessed 3 October
# 2026. Useful because it tells us the market accepts a paid consultation and
# tells us where the premium sits.
COMPETITOR_PRICES = [
    ("Consultation, in person or online", "NGN 50,000"),
    ("Abdomen and back liposuction", "NGN 4,336,300"),
    ("Abdomen, back and buttock augmentation", "NGN 5,083,050"),
    ("Full body combinations, up to", "NGN 11,072,500"),
]

# MEASURED, and the single most useful number in the market research. One
# Lagos patient published every line she spent.
AFTERCARE_CASE = [
    ("The operation", 8.0, "Deposit, theatre, room, pre operative tests, flights"),
    ("Everything after it", 3.86, "Twenty massages, thirty nights of accommodation, "
     "garments, medication, scar creams, a carer for six weeks"),
    ("What she actually spent", 16.0, "Including the complications nobody budgets for"),
]
AFTERCARE_LINE = "Aftercare cost her more than the surgery did, and none of it was in the quote."

TURKEY = [
    ("Turkey, tummy tuck and buttock augmentation, everything in",
     "NGN 10.8m to 14.9m", "Surgeon, hospital, hotel, transfers, garments, a coordinator "
     "and a WhatsApp line, in one number"),
    ("Lagos, the published equivalent", "NGN 5.1m", "Surgery only. The rest arrives later "
     "and separately"),
]
TURKEY_FINDING = (
    "Turkey is not cheaper. It is twice the price and it wins anyway, because it sells "
    "one number, a cover story and aftercare that is already arranged. We should copy "
    "the packaging, not the price."
)

# ------------------------------------------------------------------- the asset
# What she actually brings, measured rather than assumed. The audience numbers
# are the uncomfortable half and they change where the campaign gets its reach.
HER_AUDIENCE = [
    ("YouTube", "2,250 subscribers, 303 videos, 360,088 lifetime views",
     "Recent videos run in the tens and low hundreds. It is a library, not a channel."),
    ("Instagram, personal", "about 898 followers", "Lagos is already in her bio."),
    ("Instagram, the practice", "about 398 followers", "Near dormant."),
    ("LinkedIn", "about 1,000 followers", "Professional, not patient facing."),
    ("Nigerian press", "Nothing", "No coverage of any kind, which means a Nigerian launch "
     "is genuinely first run rather than a correction."),
]
AUDIENCE_FINDING = (
    "Her total reachable audience is somewhere under four thousand people and almost all "
    "of it is American. This campaign cannot run on her following and should stop "
    "pretending it might. It runs on borrowed audience: the clinic's own book, partners' "
    "rooms, the press and referring doctors. She is a credentials asset, not a "
    "distribution asset."
)

HER_ASSETS = [
    ("Three hundred and three videos, already shot",
     "In her own voice, on her own thesis, already edited. The single biggest asset in "
     "the business and it needs re cutting for a Nigerian audience, not re shooting. "
     "This is weeks of publishing available at the cost of an editor."),
    ("A thesis that is already the right one",
     "Her own titles: the best plastic surgery is not obvious, the business of "
     "insecurity, doctors should not be influencers, why I will never break ribs for "
     "beauty, the biggest skincare mistake women of colour make. We did not invent the "
     "art of looking like yourself. She has been arguing it for two years."),
    ("A monthly live format that already exists",
     "Her own recurring programme, already branded, already running. It can be run once "
     "in the window at a Lagos friendly hour. It is testimonial based, so it runs with "
     "her existing patients and no Nigerian clinical claim."),
    ("Booking infrastructure that already works",
     "A live calendar with five configured appointment types, including virtual."),
]

# Verified from her own CV. These are the lines that answer the only objection
# the Nigerian profession will actually raise.
HER_NIGERIA = [
    ("2004", "Founded and led the Nigerian Student Association at Harvard, and ran a "
     "conference for a hundred and fifty young Nigerian Americans on their role in "
     "Nigeria."),
    ("2011", "Taught free flap reconstruction at Korle Bu teaching hospital in Accra, as "
     "an instructional course lecturer."),
    ("2014", "Co founded a partnership dedicated to improving healthcare delivery, "
     "medical education and hospital quality in Nigeria. Still running."),
    ("2016", "Gave Grand Rounds at Boston Medical Center titled Why Tunde Can't Operate, "
     "on surgical training in developing Africa. Her title, her position, a decade old."),
    ("Always", "Speaks Igbo."),
]
SAFARI_ANSWER = (
    "The profession's own word for a visiting team that operates and leaves is a "
    "surgical safari, and it is a live pejorative here. It is also the only serious "
    "objection the referrers will raise. She has a twelve year documented record of "
    "teaching and building in West Africa, and none of it has ever been used. Put it in "
    "the first paragraph of every approach to a doctor."
)

# Verified against her CV and three directories. The traps are errors that are
# already circulating in aggregator copy.
CREDENTIALS = [
    ("Board certification", "American Board of Plastic Surgery"),
    ("Fellowship", "Fellow of the American College of Surgeons"),
    ("Medical school", "Georgetown"),
    ("Undergraduate", "Harvard, biochemistry"),
    ("General surgery", "Johns Hopkins, then Boston Medical Center, five years"),
    ("Plastic surgery", "University of California, San Diego, three years"),
    ("Subspecialty", "Craniofacial fellowship, Nationwide Children's Hospital, one year"),
    ("Societies", "The Aesthetic Society, American Society of Plastic Surgeons, American "
     "Cleft Palate Craniofacial Association"),
]
CREDENTIAL_TRAPS = [
    "Harvard educated and California trained, which is her own phrase. Not Harvard "
    "trained, because she did not read medicine there.",
    "The craniofacial fellowship was one year. The nine years that circulates is her "
    "whole post qualification training and several aggregators have garbled it.",
    "Beverly Hills and Southern California. Not a Los Angeles hospital attending.",
    "Get her society membership grades confirmed in writing before any of it is printed. "
    "Her own CV is out of date in two places and understates her.",
]

# The comparator who already owns the obvious position.
COMPARATOR = [
    ("What he owns", "A Nigerian American, double board certified, on Victoria Island "
     "since well before us. His line is world class care, now close to home, and American "
     "standard plastic surgery in Africa. He has had a decade to own it."),
    ("What he does not do", "No before and after gallery, no testimonials, no published "
     "prices. The whole proposition is credential arbitrage and a safety contrast against "
     "untrained operators. That restraint is itself the lesson."),
    ("Where we do not fight", "American standard, close to home. It is taken, and arguing "
     "about whose board is better is a losing conversation."),
    ("Where we win", "A woman operating on women. Darker skin as a stated competence "
     "rather than an afterthought. Restraint instead of transformation. Craniofacial "
     "depth. And a publicly argued position against the excess that this market is "
     "frightened of."),
]

# The thing that happens the moment a Lagos prospect does the obvious thing.
SEARCH_RISK = (
    "Anybody who hears her name and searches it finds a one star review on one American "
    "directory and two out of five on another, both from tiny samples, both American, "
    "and both above anything we publish. There is no Nigerian page about her at all. "
    "Either we publish enough high authority Nigerian facing material to outrank them "
    "inside the window, or the campaign runs as a closed loop with no search her name "
    "moment in it. Decide which, in week one."
)

# Two live offers that contradict each other.
OFFER_CLASH = (
    "Her own practice site already offers Nigerians a free consultation and already says "
    "she sees Lagos patients virtually, from an address on Banana Island. The plan here "
    "prices a consultation at fifty thousand naira, which is what the market leader "
    "charges and what qualifies a lead. Both are live today. One of them has to go, and "
    "the free one is the one costing us the qualification."
)

# -------------------------------------------------------------- the positioning
TRUST = [
    ("October 2005", "Stella Obasanjo dies two days after liposuction in Spain. The "
     "surgeon is later convicted of negligent homicide. It is still the first thing a "
     "Nigerian search returns."),
    ("May 2024", "A Lagos cosmetic surgeon is convicted over a patient's death. The "
     "sentence is one year, with the option of a fine of one hundred thousand naira."),
    ("January 2026", "A Lekki operator who studied nursing, not medicine, is exposed "
     "after one death and more than thirty botched procedures. He recruited through an "
     "Instagram giveaway and a WhatsApp group."),
    ("March 2026", "A patient dies after a revision procedure at a registered Lagos "
     "clinic, following five hours in an ambulance with no intensive care bed available."),
]
TRUST_FINDING = (
    "This market does not need persuading that surgery is desirable. It needs "
    "persuading that it is survivable. Safety is not a brand value here, it is the "
    "entire proposition, and it has to be made of facts rather than adjectives."
)

POSITION = [
    ("What everyone else sells", "Results, aspiration, a celebrity at the launch, and a "
     "price on request"),
    ("What the market is frightened of", "Not the cost. Who is holding the needle, and "
     "who answers the telephone at two in the morning"),
    ("What we sell", "Judgement. A consultation that will tell you not to. A published "
     "price. A named clinician. An aftercare programme that is in the quote."),
    ("Why it is also the only legal option", "The Council permits education and forbids "
     "self promotion, so the compliant creative and the high trust creative are the "
     "same creative. That is lucky, and we should take the luck."),
]

# ----------------------------------------------------------------- the channels
CHANNELS = [
    ("WhatsApp", "54m users, on 95 per cent of Nigerian smartphones",
     "96.5 per cent of Nigerian internet users. Click to message converts several times "
     "better than click to form, and Meta waives message fees for 72 hours after a click "
     "to WhatsApp ad. This is the channel, not a channel."),
    ("Facebook", "38.0m addressable",
     "Four times Instagram's reach here and nobody in this category is using it properly."),
    ("Instagram", "10.0m addressable, and shrinking 6 per cent a year",
     "54 per cent male. The assumption that Instagram is where affluent Lagos women are "
     "is half right and a quarter the size people think."),
    ("TikTok", "47.8m addressable, growing 43 per cent",
     "68 per cent male. Large, cheap and demographically wrong for this. Spill, not "
     "spend."),
]
CHANNEL_NOTE = (
    "Nigeria has the lowest Meta cost per thousand in the world, about a dollar fifty "
    "against a global average of six fifty nine, and a twelve cent click. The same "
    "source warns that bot and junk traffic runs 20 to 30 per cent above tier one "
    "markets. Cheap clicks and dirty traffic is exactly the profile that produces 170 "
    "leads and 11 warm."
)

# ------------------------------------------------------------------- the rooms
ROOMS = [
    ("GAIA Africa", "A private members club for senior African women, clubhouse on "
     "Victoria Island, membership by application and recommendation",
     "A private evening for 25. Highest concentration available, and partner sessions "
     "are a normal part of their programme."),
    ("WIMBIZ", "3,757 associates. The 25th annual conference is 5 and 6 November at Eko "
     "Hotel, 2,600 or more women expected",
     "The single densest room of the exact demographic in the whole window. It also "
     "sits right at the end of it, which is a timing problem worth solving now."),
    ("Medical Women's Association of Nigeria, Lagos", "The Lagos branch reaches female "
     "general practitioners, obstetricians and dermatologists",
     "A session for doctors. Continuing professional development is compulsory for "
     "licence renewal at 36 points every two years, so attendance is self motivated and "
     "education is the one promotion the Council permits."),
    ("The reformer pilates and barre studios", "Lo Studio on Victoria Island, MOV Lab in "
     "Ikoyi, Spot Pilates",
     "The best matched fitness segment there is. A consultation morning in the studio, "
     "hosted by the studio."),
    ("The salons", "Bloom Hair Atelier, Tasala, The Nail Boutique across three sites",
     "Where this audience already sits still for two hours and already discusses this "
     "subject. Cards on the counter and a consultation day."),
    ("Padel and the clubs", "Four Ikoyi padel clubs, Ikoyi Club 1938 ladies sections, "
     "Lagos Country Club on the mainland",
     "Category already takes brand sponsorship. Ladies sections, not the club at large."),
    ("Exquisite and Wellness and Style Live", "An affluent female audience, a proven live "
     "format and a founder who sells partnerships",
     "The best matched media partner in the market."),
    ("The podcast with the right room", "Beyond with Ezinne, whose audience is explicitly "
     "Lagos style",
     "Hyper niche shows convert faster than large general ones. Guest selection is "
     "reckoned to be half the return."),
]
ROOMS_FINDING = (
    "A well run forty person open house produces fifteen to twenty five booked "
    "consultations. Six small formats of twenty five will out yield one evening of "
    "eighty, cost less in total, and spread the risk across venues and partners. The "
    "evening on the tenth should be the first of seven things, not the only one."
)

# --------------------------------------------------------------- the six weeks
PLAN = [
    (1, "6 to 10 Oct", "Clear the gate and stop the leak",
     "MDCN called and the registration position written down. The page live. The "
     "coordinator named, with the grid on the wall and a stopwatch on the queue. The 11 "
     "warm leads called personally. The evening on the tenth."),
    (2, "13 to 17 Oct", "Open the doors",
     "Consultation days running at capacity. Every guest from the evening called inside "
     "48 hours. The 159 contacted once, honestly. Referrer visits begin, eight to twelve "
     "practices booked."),
    (3, "20 to 24 Oct", "Take the rooms",
     "First private evening at a members club. First studio or salon consultation "
     "morning. The doctors' session confirmed with a date. Education series publishing "
     "weekly."),
    (4, "27 to 31 Oct", "Repeat what worked",
     "Second and third small formats. Podcast and press land. The surgical review queue "
     "is read and answered. Second referrer round."),
    (5, "3 to 7 Nov", "Convert and hand over",
     "Fourth and fifth formats. WIMBIZ on the fifth and sixth. Training and sign off of "
     "the clinic team so the standard survives her leaving."),
    (6, "10 to 13 Nov", "Close the window and open the next one",
     "Final consultations. The December and January clinic block opened for booking "
     "while the diaspora is arriving. The report, and the brief for the next visit."),
]

# MEASURED. Detty December 2025: 3.6 million participants and 396.54 billion
# naira of consumer spending, 55 per cent of it from diaspora visitors, with US
# arrivals overtaking UK for the first time.
DECEMBER = (
    "The window ends exactly where Detty December begins. Last year it brought 3.6 "
    "million people and 396 billion naira of spending, 55 per cent of it from the "
    "diaspora, with American arrivals overtaking British for the first time. A Nigerian "
    "American surgeon is precisely the profile that audience already trusts. These six "
    "weeks are the planting. December and January are the harvest, and the plan should "
    "be measured that way."
)

# ------------------------------------------------------------------ the engine
ENGINE = [
    ("Two doors, not one", "An aesthetic consultation with the clinic's registered "
     "clinicians, and a surgical planning review that she reads herself. Different "
     "appointments, different forms, different promises."),
    ("No navigation on the page", "Removing navigation from a mid funnel page measured 16 "
     "to 28 per cent in a controlled test. Every link goes to the form, WhatsApp or the "
     "telephone."),
    ("A three step form, contact details last", "Three fields converts best and the "
     "sharpest drop is the fourth. A form this long has to be stepped, and the "
     "commitment escalates rather than arriving all at once."),
    ("Prices published", "A room that has to ask assumes the worst, and the one Lagos "
     "competitor who publishes is winning the comparison by default."),
    ("Her own screening questions, on the surgical door", "Height, weight, nicotine and "
     "whether weight is still moving. Taken straight from her practice's own coordinator "
     "manual, which makes the lead actionable the moment it lands."),
    ("Weight is a conversion decision", "86 per cent of Nigerian traffic is mobile at "
     "about 15 megabits, and data costs 575 naira a gigabyte. No hero video. A tenth of a "
     "second measured 8.4 per cent in conversions across thirty million sessions."),
]

# -------------------------------------------------------------------- the ask
# OURS. What the six weeks needs that does not exist today.
NEEDS = [
    ("A named coordinator, on the queue, inside the hour",
     "Not a shared inbox and not a marketing person. One person whose job is the "
     "telephone, working the grid, measured on time to first contact. This single hire "
     "is worth more than the entire media budget."),
    ("The MDCN position in writing",
     "What she can do, from when, and under which registration. Everything else is "
     "contingent on it."),
    ("WhatsApp Business Platform, not the free app",
     "The free app caps broadcasts at 256 and only delivers to people who already saved "
     "the number, which means it cannot reach the 170 at all. The paid platform costs "
     "about five cents a message, so reaching the whole list costs under ten dollars."),
    ("A domain",
     "The page cannot carry a management consultancy's web address on a plastic surgery "
     "flyer. This is a one day job and it is blocking the print."),
    ("Aftercare priced and staffed",
     "The differentiator only works if it is real. Somebody has to cost the massages, "
     "the garments, the accommodation and the night line, and commit to them."),
    ("Decisions inside 48 hours",
     "Six weeks does not survive a weekly approval cycle."),
]

# ----------------------------------------------------------------- the numbers
# OURS, built from the rates above. Ranges, because anybody quoting a point
# estimate on a six week window is guessing.
CAPACITY_DAYS_PER_WEEK = 2
CAPACITY_SLOTS_PER_DAY = 8
CAPACITY_WEEKS = 5
CONSULT_CAPACITY = CAPACITY_DAYS_PER_WEEK * CAPACITY_SLOTS_PER_DAY * CAPACITY_WEEKS

FORECAST = [
    ("The 11 warm", 11, 0.45, 0.70, "Called personally, on the grid"),
    ("The 159 cold", 159, 0.03, 0.11, "One honest message. Most will answer in January"),
    ("The evening on the tenth", 80, 0.19, 0.31, "A forty person open house books fifteen "
     "to twenty five. Scaled to eighty"),
    ("Six small formats", 150, 0.18, 0.30, "Twenty five a time, hosted by somebody whose "
     "room it is"),
    ("Referring doctors", 12, 0.40, 0.90, "Test referrals inside the window, not flow. "
     "Flow takes months"),
    ("The clinic's own book", 900, 0.02, 0.05, "Consented patients, contacted directly"),
    ("Digital, earned and paid", 400, 0.06, 0.14, "Click to WhatsApp, not click to form"),
]


def forecast_low() -> int:
    return round(sum(reach * lo for _, reach, lo, _hi, _ in FORECAST))


def forecast_high() -> int:
    return round(sum(reach * hi for _, reach, _lo, hi, _ in FORECAST))


# Demand, before the diary gets in the way.
DEMAND_LOW = forecast_low()
DEMAND_HIGH = forecast_high()

BOOKED_LOW = min(DEMAND_LOW, CONSULT_CAPACITY)
BOOKED_HIGH = min(DEMAND_HIGH, CONSULT_CAPACITY)

# Both ends of the range clear the ceiling, which is the whole point of this
# section. On these rates the plan runs out of chairs well before it runs out
# of people, so the number that needs deciding is how many consultation days
# the clinic will give, not how much media to buy.
CAPACITY_BINDS = DEMAND_LOW >= CONSULT_CAPACITY
THIRD_DAY_CAPACITY = 3 * CAPACITY_SLOTS_PER_DAY * CAPACITY_WEEKS

# Consultations held, after the median no show.
HELD_LOW = round(BOOKED_LOW * (1 - BSM_NOSHOW_MEDIAN))
HELD_HIGH = round(BOOKED_HIGH * (1 - BSM_NOSHOW_MEDIAN))
HELD_THIRD_DAY = round(min(DEMAND_HIGH, THIRD_DAY_CAPACITY) * (1 - BSM_NOSHOW_MEDIAN))

# Surgical interest is the asset that outlives the visit. Conservative against
# the Nigerian 62.5 per cent, because that figure is consultations at a
# surgical practice and most of ours are aesthetic.
SURGICAL_SHARE = 0.22
SURGICAL_LOW = round(HELD_LOW * SURGICAL_SHARE)
SURGICAL_HIGH = round(HELD_THIRD_DAY * SURGICAL_SHARE)

TARGETS = [
    ("People worth calling, across all seven sources", "{} to {}".format(DEMAND_LOW, DEMAND_HIGH),
     "On the rates in the previous slides, applied source by source"),
    ("What the diary can actually hold", str(CONSULT_CAPACITY),
     "{} consultation days a week, {} slots a day, {} weeks. This is the binding "
     "constraint, not demand".format(CAPACITY_DAYS_PER_WEEK, CAPACITY_SLOTS_PER_DAY, CAPACITY_WEEKS)),
    ("Consultations held", str(HELD_LOW),
     "At capacity, after the 8.9 per cent median no show a competently run practice sees"),
    ("With a third consultation day", str(HELD_THIRD_DAY),
     "The same demand against {} slots. This is the decision worth taking in week "
     "two".format(THIRD_DAY_CAPACITY)),
    ("Surgical files she has read and answered", "{} to {}".format(SURGICAL_LOW, SURGICAL_HIGH),
     "Written opinions, consented, with no date promised to anybody"),
    ("Time from enquiry to first human contact", "Under 1 hour, every time",
     "The one number that decides whether any of the rest happens"),
    ("Doctors who have met the team and hold the direct line", "8 to 12",
     "A first referral answered properly is the test. Flow comes next year"),
]

RISKS = [
    ("The registration does not come through in time",
     "Then the surgical door closes and the aesthetic door carries the window. The page "
     "is already built so that she is the standard rather than the attending clinician, "
     "so nothing has to be unsaid."),
    ("We are pitching the direct competitor",
     "The leading Lagos plastic surgery group, the only one publishing a surgical price "
     "list, is a live CFA marketing prospect. That is a conflict and it needs deciding "
     "before either piece of work goes further. It is also why none of this plan names "
     "a competitor."),
    ("The visiting surgeon reads as a safari",
     "The profession's own term for a foreign team that operates and leaves. It is a "
     "live pejorative in Nigerian medical circles and it will cost us the referrers. The "
     "answer is a named local clinician, a named host facility, aftercare continuity in "
     "writing and a training component, all of which we are doing anyway."),
    ("Aftercare is promised and not delivered",
     "This is the biggest reputational risk in the plan, because it is the one claim "
     "that is load bearing. If it cannot be staffed and costed in week one, take it off "
     "the page."),
    ("Scarcity gets invented",
     "Quantity scarcity works and fabricated scarcity reverses, with documented anger "
     "and brand switching. If the diary is not actually finite, the page says nothing "
     "about slots. It is wired that way on purpose."),
]
