"""
Medbury Aesthetics: the management agreement, three structures compared.

CFA opened at 10 per cent of division revenue. Medbury's adviser countered with a
fixed base plus a small share of collected net revenue plus a slice of EBITDA over
budget. Itunu's own position, in her words, is narrower than her adviser's: revenue
share is acceptable if it is gated on hitting EBITDA.

This models all three so the conversation is about a curve, not an adjective.
"""

M = 1_000_000

# collected net revenue as a share of gross billings: VAT, refunds and pass-through
# drugs and implants come out. Their definition, accepted.
NET_FACTOR = 0.85

# ---- 1. CFA's opening position
OPEN_RATE = 0.10                     # of gross revenue

# ---- 2. Medbury's adviser
ADV_BASE_MONTH = 2.5 * M
ADV_BASE_YEAR = ADV_BASE_MONTH * 12
ADV_REV_RATE = 0.03                  # of collected net revenue
ADV_EBITDA_RATE = 0.05               # of EBITDA above the Board-approved budget

# ---- 3. CFA's counter: her adviser's architecture, three numbers moved
# The base is not a team of five at one salary. It is the engagement lead, and Debo is
# above the grade Medbury pays 2.5 for, not at it.
CFA_BASE_MONTH = 3.8 * M
CFA_BASE_YEAR = CFA_BASE_MONTH * 12
CFA_REV_RATE = 0.035                 # her adviser's 3 per cent, plus a half
CFA_EBITDA_RATE = 0.055              # her adviser's 5 per cent, plus a half

# Itunu's condition, in her words, was "the only way we do revenue is if you hit set
# performance goals". The three part structure answers it without a hard gate: the
# performance fee is on cash COLLECTED rather than billed, and the profit incentive
# pays only above the Board-approved budget. The gate is kept here as a fallback if
# she presses for it, but it is off in the terms as issued.
GATE_ON = False
GATE_FULL, GATE_ZERO = 1.00, 0.80

TERM_MONTHS, REVIEW_MONTHS = 24, 12


def banded_share(gross):
    return gross * NET_FACTOR * CFA_REV_RATE


def gate_factor(ebitda_achieved):
    if ebitda_achieved >= GATE_FULL:
        return 1.0
    if ebitda_achieved <= GATE_ZERO:
        return 0.0
    return (ebitda_achieved - GATE_ZERO) / (GATE_FULL - GATE_ZERO)


def counter(gross, ebitda_achieved=1.0, ebitda=0.0, budget=0.0):
    over = max(0.0, ebitda - budget)
    g = gate_factor(ebitda_achieved) if GATE_ON else 1.0
    return CFA_BASE_YEAR + banded_share(gross) * g + over * CFA_EBITDA_RATE


def crossover():
    """Gross revenue at which the counter equals CFA's original 10 per cent ask."""
    return CFA_BASE_YEAR / (OPEN_RATE - NET_FACTOR * CFA_REV_RATE)


def opening(gross):
    """CFA's original ask: 10 per cent of gross division revenue."""
    return gross * OPEN_RATE


def adviser(gross, ebitda=0.0, budget=0.0):
    """Medbury's adviser: fixed base, 3 per cent of collected net, 5 per cent of EBITDA over budget."""
    over = max(0.0, ebitda - budget)
    return ADV_BASE_YEAR + gross * NET_FACTOR * ADV_REV_RATE + over * ADV_EBITDA_RATE
