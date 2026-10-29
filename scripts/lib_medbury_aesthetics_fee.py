"""
Medbury Aesthetics, Lagos: the resourced cost of the setup mandate.

Same published rate card and same 10 per cent programme rate as the Lyfe Place
fee schedule (scripts/build-lyfeplace-cfa-fees.py), so the two are comparable and
Itunu cannot be shown two different rate cards by the same firm.

PRIVATE working. The grid is the honest resourcing estimate, not a negotiating
position. What is done with the gap is a separate decision.
"""

M = 1_000_000

# published rate card, naira per day
RATES = [
    ("Partner, engagement lead",     750_000),
    ("Principal, workstream lead",   450_000),
    ("Senior consultant",            300_000),
    ("Consultant",                   190_000),
    ("Analyst",                      120_000),
]
GRADES = [n for n, _ in RATES]
RATE = [r for _, r in RATES]
PROG_RATE = 0.10          # the published programme rate on a multi-workstream mandate

SPRINT_MONTHS, HANDOVER_MONTHS = 3, 2
WORKING_DAYS_PER_MONTH = 21

# days by grade: partner, principal, senior, consultant, analyst
GRID = {
    "Programme leadership, Board reporting and the governance rhythm": [10, 14,  0,   0,  0],
    "The pricing architecture: research, cost to serve, sensitivities": [2,  6, 10,  10, 14],
    "The technology platform: configuration, migration, integration, training": [0, 5, 8, 18, 6],
    "The operating model, front office and revenue cycle":            [ 0,  4,  6,   6,  0],
    "Clinical governance, protocols and consent architecture":        [ 0,  3,  8,   5,  0],
    "Incorporation, regulatory and permissions, five entities":       [ 0,  0,  3,  14,  6],
    "Service partners: sourcing, negotiation and signed SLAs":        [ 3,  4,  6,   6,  0],
    "Per entity: scope, staffing, equipment spec, clinical brief":    [ 0,  5, 10,  14,  6],
    "Recruitment of the division team":                               [ 0,  2,  5,  10,  0],
    "The funnel and the pre-opening revenue programme":               [ 0,  3,  6,  10,  5],
    "Commissioning and go-live, five entities":                       [ 0,  3,  6,  10,  0],
    "Handover, two months":                                           [ 3,  6,  6,   5,  0],
}

def ws_days(v):   return sum(v)
def ws_value(v):  return sum(v[i] * RATE[i] for i in range(len(RATE)))

DAYS_BY_GRADE = [sum(v[i] for v in GRID.values()) for i in range(len(RATE))]
TOTAL_DAYS    = sum(DAYS_BY_GRADE)
GROSS         = sum(ws_value(v) for v in GRID.values())
AT_RATE_CARD  = GROSS * (1 - PROG_RATE)     # what CFA would quote on its own schedule

ASK           = 25 * M                       # the counter on the table
OFFER         = 15 * M                       # Itunu's opening offer
REG_ABSORBED  = 3.1 * M                      # government fees CFA absorbs inside the fee

BLENDED       = GROSS / TOTAL_DAYS
FTE           = TOTAL_DAYS / ((SPRINT_MONTHS + HANDOVER_MONTHS) * WORKING_DAYS_PER_MONTH)

def days_bought(fee):
    """Chargeable days a given fee buys at the same grade mix, after the programme rate."""
    return fee / (1 - PROG_RATE) / BLENDED

DISCOUNT_ON_ASK   = 1 - ASK / AT_RATE_CARD
DISCOUNT_ON_OFFER = 1 - OFFER / AT_RATE_CARD

# Lyfe Place, for comparison, from scripts/build-lyfeplace-cfa-fees.py
LP = [("Partner", 750_000, 10), ("Principal", 450_000, 35), ("Senior", 300_000, 37),
      ("Consultant", 190_000, 67), ("Analyst", 120_000, 29)]
LP_DAYS  = sum(d for _, _, d in LP)
LP_GROSS = sum(r * d for _, r, d in LP)
LP_NET   = LP_GROSS * (1 - PROG_RATE)
LP_FITOUT_DAYS = 2 + 10 + 8 + 30 + 6
