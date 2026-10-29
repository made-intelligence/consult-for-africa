"""
Medbury: the management fee, second round.

What changed in Itunu's feedback of 19 September:
  - CFA now manages TWO divisions, not one. The group structure puts Medbury
    Aesthetics and Medlyfe Wellness and Regenerative under "CFA Managed Special
    Units", so the mandate doubled on the management side.
  - She accepts two COOs and a shared CFA management layer, and offers 4.2 a month
    for all of it.
  - Setup stays at 25 but she has added Abuja to the same five months.
  - Variable: 3.5 per cent of net revenue gated on BOTH benchmark revenue and
    EBITDA, plus 3 per cent above Board-approved EBITDA, both paid annually.

This prices the base from the bottom up, because the only way to answer 4.2 is to
show what the posts cost.
"""

M = 1_000_000

# ---------------------------------------------------------------- the posts
# Employer contributions, stated explicitly because 2.5 + 2.5 is 5.0 and the loaded
# figure is 6.1. NHF is deliberately NOT here: it is a 2.5 per cent deduction from
# the employee's basic, not an employer cost.
EMPLOYER_COSTS = [
    ("Pension, employer share", 0.100, "Pension Reform Act 2014, minimum 10 per cent of "
     "monthly emoluments"),
    ("Thirteenth month, accrued monthly", 0.083, "One month's salary a year, accrued at "
     "one twelfth"),
    ("NSITF", 0.010, "Employee Compensation Act, 1 per cent of payroll"),
    ("ITF", 0.010, "Industrial Training Fund, 1 per cent of annual payroll"),
    ("Group life assurance", 0.010, "Required under the Pension Reform Act"),
    ("HMO cover", 0.007, "Health cover for the post and dependants"),
]
LOADING_PCT = sum(r for _n, r, _d in EMPLOYER_COSTS)
LOADING = 1 + LOADING_PCT

# 2.5 gross is where Medbury caps CHIEF OPERATING OFFICER salaries, not manager
# salaries. So there is no grade argument to make and none should be made: the COOs
# are priced at her own cap. The argument is simpler and stronger for it, because
# every input then belongs to her.
COO_CAP = 2.50
COOS = [
    ("COO, Medbury Aesthetics", COO_CAP),
    ("COO, Medlyfe Wellness and Regenerative", COO_CAP),
]
COO_GROSS = sum(c for _n, c in COOS) * M
COO_LOADED = COO_GROSS * LOADING

# Shared services: what each function would cost Medbury to employ directly,
# against what it costs through CFA, where the same bench serves several clients.
# (name, standalone monthly, shared monthly)
SHARED = [
    ("Finance for a cash-paying business that sells treatment in programmes: deferred "
     "revenue on a course of treatment paid for before it is delivered, instalment and "
     "refund control, collections, payables, payroll and the board pack", 1.55, 0.50),
    ("Marketing and sales into a discretionary category: the aesthetics and longevity funnel, "
     "conversion on considered purchases, and content that survives a regulator reading it",
     1.45, 0.45),
    ("HR for clinical staff: credentialing files, scope of practice, rotas across the five "
     "businesses, contracts and performance", 1.00, 0.30),
    ("Clinical governance in a category with real medico-legal exposure: protocols per "
     "modality, complications and escalation, consent and image consent, audit and incidents",
     1.55, 0.35),
    ("Technology: one configured multi-entity clinical platform, administered, supported and "
     "reporting into the board pack", 0.90, 0.25),
    ("Commercial and pricing for discretionary spend: the rate card kept live against "
     "elasticity and mix, programme and bundle design", 1.25, 0.20),
    ("Procurement of devices, injectables and cold chain, with second sourcing and service "
     "levels that keep a list running", 0.80, 0.15),
    ("Executive oversight on anything that reaches your Board", 1.40, 0.20),
]
SHARED_STANDALONE = sum(a for _n, a, _b in SHARED) * M
SHARED_CHARGED = sum(b for _n, _a, b in SHARED) * M

BASE_ASK = COO_LOADED + SHARED_CHARGED          # at cost, no margin on the base
STANDALONE = COO_LOADED + SHARED_STANDALONE     # what hiring the same thing costs
HER_OFFER = 4.2 * M

# ---------------------------------------------------------------- the variable
NET_FACTOR = 0.85              # collected net revenue as a share of gross billings
REV_RATE = 0.035               # her number, accepted
HER_EBITDA_RATE = 0.03         # her number, also on TOTAL EBITDA once the budget is met
EBITDA_RATE = 0.05             # what CFA is asking, on TOTAL EBITDA once the budget is met
GATE_FULL, GATE_ZERO = 1.00, 0.80

# ---------------------------------------------------------------- the setup fee
FEE = 25 * M
HER_TRANCHES = [7.5, 7.5, 5, 5]
CFA_TRANCHES = [12.5, 5, 4, 3.5]        # 50 per cent on mobilisation, her four steps
assert sum(CFA_TRANCHES) == FEE / M


def gate(achieved):
    if achieved >= GATE_FULL: return 1.0
    if achieved <= GATE_ZERO: return 0.0
    return (achieved - GATE_ZERO) / (GATE_FULL - GATE_ZERO)


def variable(gross, rev_achieved=1.0, ebitda_over=0.0):
    return gross * NET_FACTOR * REV_RATE * gate(rev_achieved) + ebitda_over * EBITDA_RATE


def total_year(gross, rev_achieved=1.0, ebitda_over=0.0, base=None):
    return (base or BASE_ASK) * 12 + variable(gross, rev_achieved, ebitda_over)


# ---------------------------------------------------------------- function vs spend
# CFA runs the function. The company bears the cost of doing it. This is the
# distinction that otherwise gets argued about in month three.
FUNCTION_VS_SPEND = [
    ("Marketing and sales",
     "Strategy, campaigns, content, the enquiry funnel, conversion and the CRM",
     "Media spend, production, events, influencer and agency pass-through, sales commissions"),
    ("HR",
     "Recruitment, contracts, onboarding, credentialing files, performance and the rota model",
     "Every salary in the division, advertising, agency fees, assessments and relocation"),
    ("Finance",
     "The controller and management accountant, the revenue cycle and its controls, payables, payroll processing and the board pack",
     "Statutory audit, tax filings, bank and gateway charges, software licences, and the collections and cashier staff at the sites"),
    ("Clinical governance and quality",
     "The protocol set, audit programme, incident and complaints process",
     "Accreditation and licence fees, indemnity and clinical insurance, external audit"),
    ("Technology",
     "Platform configuration, administration, support and the reporting behind the board pack",
     "Platform licences, hardware, terminals, connectivity and payment gateway charges"),
    ("Procurement and supply",
     "Specification, negotiation, second sourcing and the service level agreements",
     "The goods themselves: stock, consumables, implants, drugs and equipment"),
    ("Facilities and biomedical",
     "Offered by CFA and not inside this fee. It is a separate retainer of a different nature "
     "and it is set out in Appendix B rather than assumed either way here",
     "The building and its running costs under any arrangement: power, water, gases, waste, "
     "security, cleaning and the service contracts behind them"),
]

# ---------------------------------------------------------------- the appendix
FM_SCOPE = [
    ("Planned preventive maintenance and the asset register",
     "Every asset listed, with its service interval, warranty position and end of life, so "
     "replacement is budgeted rather than discovered"),
    ("Biomedical engineering",
     "Calibration, electrical safety testing, fault response and uptime against an agreed service "
     "level. On a division this equipment-heavy, uptime is revenue and a dead laser is a closed "
     "list"),
    ("Engineering services",
     "Power and its backup, water, medical gases, HVAC in clinical areas, and the resilience "
     "testing that proves they work before a list depends on them"),
    ("Soft services and vendor management",
     "Security, cleaning, waste including clinical waste, pest control, and the service contracts "
     "behind all of it held to their terms rather than renewed by habit"),
]
FM_OPEN = [
    ("Which estate",
     "The whole of Lyfe Place, or only the spaces the division occupies. These are different "
     "contracts, not different sizes of the same one. A whole campus retainer carries common "
     "areas, plant, lifts, car park and the landlord side obligations. A division only retainer "
     "covers the clinical suites and the equipment inside them"),
    ("Lagos and Abuja are priced apart",
     "Different buildings, different plant, different vendor markets and different state "
     "regulators. One number covering both would be a guess, and a facilities number that is a "
     "guess becomes an argument the first time a generator fails"),
    ("How it is charged",
     "A retainer for the management and the labour, with a separate and agreed pass-through for "
     "parts, consumables and third party contracts. I would not mark up a compressor"),
]


# ---------------------------------------------------------------- the role test
# Two tests settle almost every "who pays for this person" question.
#   1. Capability or volume? A post whose number does not change as revenue grows is
#      capability and sits with CFA. A post you need more of at 1bn than at 400m is
#      volume and sits on the division's payroll.
#   2. Does it have to be at a site to do the job? If yes, it is the division's.
# CFA specifies, recruits, trains and supervises every division post either way.
ROLE_TEST = [
    ("Financial controller or finance manager", "CFA",
     "One for the group whatever the revenue does. Capability, not volume"),
    ("Management accountant", "CFA",
     "Produces the accounts and the board pack from the platform"),
    ("Payroll processing", "CFA",
     "Runs off the same system whether there are forty staff or two hundred"),
    ("Accounts payable officer", "CFA",
     "Supplier invoices and payment runs process centrally, off site, for more than one client"),
    ("Receivables and collections officers", "Division",
     "The number scales directly with patient volume and with the programme book, and they work "
     "the accounts of patients your clinics are treating"),
    ("Unit leads, one per clinic or service line", "Division",
     "The operational layer under the two COOs: rota, stock at the unit, patient flow, front "
     "desk supervision and local compliance. They run a unit, they do not own a profit and "
     "loss, and they sit on your payroll because the number scales with the estate and the "
     "job is at the site. I recruit them and set the standard they work to"),
    ("Patient care coordinators", "Division",
     "At the site and in front of the patient, and the number scales with volume. This is the "
     "conversion and cross-sell engine rather than a scheduling role, so I write the pathway, "
     "train them and am measured on what they convert. They are your employees"),
    ("Cashiers and front desk billing", "Division",
     "Front line. They take money from a patient standing in front of them"),
    ("Storekeeper and stock control", "Division",
     "Has to be where the stock is. CFA writes the control and audits it"),
    ("Procurement lead", "CFA",
     "Specification, negotiation and second sourcing across all five businesses"),

    ("Medical records and front desk", "Division",
     "At the site, in front of the patient"),
    ("Site quality or infection control lead", "Division",
     "Needed on the floor once a site is at volume. CFA sets the standard and audits against it"),

]

# ---------------------------------------------------------------- the counter
# Her 4.2 was offered for a COO plus the shared bench. Two things follow.
#
#  (1) Take it apart. Less the bench, it leaves 1.80 all in for the chief operating
#      officer, which is about 1.48 gross. That is a senior practice manager, not a
#      person you hand a division's profit and loss to. The gap is a GRADE question,
#      not a percentage, and it is much easier to win on grade.
#  (2) Build back up. If 4.2 is her price for one division, the second division needs
#      its own COO and nothing else new, because the bench is shared. One loaded COO
#      is 4.27, so two divisions is 8.47 on her own starting point. We ask 8.2.
HER_UNIT = 4.2 * M                       # her price, taken as one division
MGMT_CHARGE = 2.40 * M                   # the shared bench, unchanged by a second division
HER_IMPLIED_COO = HER_UNIT - MGMT_CHARGE # what she has left for a COO, fully loaded
HER_IMPLIED_GROSS = HER_IMPLIED_COO / LOADING
COO_ONE = COO_LOADED / 2                 # one COO, fully loaded
DERIVED = HER_UNIT + COO_ONE             # two divisions on her own arithmetic
ASK = 8.2 * M
CONCESSION = DERIVED - ASK
ABSORBED = BASE_ASK - ASK                # what CFA carries against the costed establishment

OPTION_B = 3.60 * M             # Medbury employs the COOs, CFA charges the bench only

# ---------------------------------------------------------------- what is sold
# The number to sell is 6.8 for TWO chief operating officers plus the bench. The
# grade is NOT degraded to make it fit: two COOs at 2.2 gross would be practice
# managers and would lose the argument we just won. Instead the establishment is
# shown at what it costs and the gap is shown as CFA absorbing it, which is true,
# visible, and makes the price a concession rather than a cheaper hire.
PRICE = 7.8 * M
ABSORBED = BASE_ASK - PRICE            # BASE_ASK is 2 COOs loaded + bench
ABSORB_PCT = ABSORBED / BASE_ASK

# The COO cost is her own cap, loaded, so it is not arguable. Everything left in the
# price is therefore what she is paying for the bench, and it is a very small number.
BENCH_IMPLIED = PRICE - COO_LOADED          # what 6.8 leaves for the whole back office
BENCH_PER_FUNCTION = BENCH_IMPLIED / len(SHARED)

# Protections that make absorbing it survivable. These are not decoration. A base
# "reviewed at twelve months" is too loose for Nigerian payroll: salaries move, the
# statutory stack moves, and a fixed naira fee erodes fast.
REVIEW_MONTHS = 12
OFF_CYCLE_TRIGGER = 0.15        # establishment cost moving this far calls a review early
STEP_TRIGGER = ("Combined annualised revenue above NGN 600M, or the fourth aesthetics entity "
                "trading, whichever comes first")



# ---------------------------------------------------------------- the variable, modelled
BUDGET_MARGIN = 0.20            # illustrative Board-approved EBITDA margin
SCENARIOS = [400, 600, 800, 1200, 2000]


def rev_fee(gross):
    return gross * NET_FACTOR * REV_RATE


def profit_share(gross, margin=None, budget_margin=None, rate=None):
    """A share of TOTAL EBITDA, payable only once EBITDA is at or above the
    Board-approved budget. Her structure: a hurdle, not a deductible."""
    margin = BUDGET_MARGIN if margin is None else margin
    budget_margin = BUDGET_MARGIN if budget_margin is None else budget_margin
    ebitda = gross * margin
    if ebitda < gross * budget_margin:
        return 0.0
    return ebitda * (EBITDA_RATE if rate is None else rate)


def cfa_year(gross, base, margin=None):
    return base * 12 + rev_fee(gross) + profit_share(gross, margin)


# ---------------------------------------------------------------- salary scenarios
# The COO element is a pass-through at actual cost, so the base moves with whatever
# salary lands the candidate. Showing the sensitivity now stops it being an argument
# at offer stage, when there is a person waiting for an answer.
SALARY_SCENARIOS = [2.00, 2.50, 3.00, 3.50]


def establishment(coo_gross):
    return 2 * coo_gross * M * LOADING + MGMT_CHARGE


def absorbed_at(coo_gross, price=None):
    return establishment(coo_gross) - (price or PRICE)


SCENARIO_NOTE = {
    2.00: "Below your cap. A smaller field, and realistically an operations manager "
          "being asked to do a COO's job",
    2.50: "Your cap, and the basis of everything in this paper",
    3.00: "Above your cap. Opens the field to people already running a division "
          "somewhere else",
    3.50: "Well above. Only worth it for a specific person you have decided you want",
}

# ---------------------------------------------------------------- the escalator
CPI_INDEX = "National Bureau of Statistics headline CPI, year on year, for the month preceding the anniversary"
CPI_FLOOR, CPI_CAP = 0.00, 0.15
ESCALATOR = [
    ("The two COO salaries",
     "Actual cost of the two agreed posts, evidenced on the payroll, open book",
     "On the anniversary, by the naira movement in what they actually cost. Not indexed, "
     "because a salary is a fact rather than a forecast. If you approve an increase to keep "
     "or replace someone, the base moves by that amount and by nothing else"),
    ("The statutory stack",
     "Pension, NSITF, ITF, group life, HMO and anything a new Act adds",
     "Passed through when it takes effect. Neither of us chooses it and neither of us can "
     "absorb it"),
    ("The shared bench charge",
     f"The fixed element, currently {MGMT_CHARGE/M:.2f}",
     f"Escalates annually by the {CPI_INDEX}, collared at a floor of {CPI_FLOOR:.0%} and a "
     f"cap of {CPI_CAP:.0%}. The cap protects you in a bad year, the floor means it never falls "
     f"below where it started"),
    ("If inflation runs past the cap",
     f"Headline CPI above {CPI_CAP:.0%} in two consecutive years",
     "Either of us may call a review rather than one side quietly carrying it"),
    ("What CFA absorbs",
     "The monthly difference between the establishment and what you pay",
     "Reviewed at the same anniversary. It is a first-year position while the division is "
     "being built, not a permanent feature of the contract, and I am saying so now rather than "
     "surprising you with it later"),
    ("Off cycle",
     "Either of us may call a review early",
     "If the actual cost of the agreed establishment moves more than 15 per cent between "
     "anniversaries. Thirty days to conclude it"),
]


# ---------------------------------------------------------------- bench schedule
# The working behind the 2.40, so it is auditable rather than asserted. Each function
# is provided by a named post on CFA's payroll, and Medbury is charged for the share
# of that post it actually consumes. (function, post, loaded monthly cost, charged)
WORKING_DAYS = 21
BENCH_SCHEDULE = [
    ("Finance", "Financial controller", 1.55, 0.50),
    ("Marketing and sales", "Marketing and growth lead", 1.45, 0.45),
    ("HR", "HR business partner, healthcare", 1.00, 0.30),
    ("Clinical governance and quality", "Clinical governance lead, nurse or medic by background", 1.55, 0.35),
    ("Technology", "Platform administrator and reporting analyst", 0.90, 0.25),
    ("Commercial and pricing", "Pricing lead", 1.25, 0.20),
    ("Procurement and supply", "Procurement officer", 0.80, 0.15),
    ("Executive oversight", "Partner", 1.40, 0.20),
]
BENCH_STANDALONE = sum(c for _f, _p, c, _ch in BENCH_SCHEDULE)
BENCH_CHARGED = sum(ch for _f, _p, _c, ch in BENCH_SCHEDULE)
BENCH_DAYS = sum(ch / c * WORKING_DAYS for _f, _p, c, ch in BENCH_SCHEDULE)
BENCH_FTE = BENCH_DAYS / WORKING_DAYS
assert abs(BENCH_CHARGED * M - MGMT_CHARGE) < 1, "schedule disagrees with the bench charge"
assert abs(BENCH_STANDALONE * M - SHARED_STANDALONE) < 1, "schedule disagrees with SHARED"


# ---------------------------------------------------------------- the organogram
# The headcount argument. Same front line either way; the difference is the
# management layer and who carries it on payroll.
ORG_WITH = [
    ("COO, Medbury Aesthetics, owns that P&amp;L", "CFA", True),
    ("COO, Medlyfe Wellness and Regenerative, owns that P&amp;L", "CFA", True),
    ("The CFA bench: eight functions", "CFA, off your payroll", True),
    ("Unit leads, care coordinators and front line teams, all five businesses", "Medbury", False),
]
ORG_WITHOUT = [
    ("COO, Medbury Aesthetics, owns that P&amp;L", "Medbury", True),
    ("COO, Medlyfe Wellness and Regenerative, owns that P&amp;L", "Medbury", True),
    ("Financial controller", "Medbury", True),
    ("Marketing and growth lead", "Medbury", True),
    ("HR business partner", "Medbury", True),
    ("Clinical governance lead", "Medbury", True),
    ("Platform administrator", "Medbury", True),
    ("Pricing lead", "Medbury", True),
    ("Procurement officer", "Medbury", True),
    ("Group executive time, drawn off other divisions", "Medbury", True),
    ("Unit leads, care coordinators and front line teams, all five businesses", "Medbury", False),
]
MGMT_POSTS_WITH = 0                      # management posts on Medbury's payroll
MGMT_POSTS_WITHOUT = len([1 for _n, _w, mgmt in ORG_WITHOUT if mgmt])
