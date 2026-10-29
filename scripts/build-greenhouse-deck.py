"""
The produce box software proposal, as a landscape deck.

A greenhouse operator with its own sites around Lagos wants to sell organic
produce direct to households in pre packaged boxes. They asked for a mobile
app. The recommendation in this deck is a progressive web app that installs
like one, carries a Google Play listing, and leaves the native build as a
later decision rather than a first one.

Two things the deck has to do that an ordinary software proposal does not.

It has to win a disagreement the client has already stated, which means the
case for the recommendation has to be sourced, and the places where the client
is right have to appear on the page rather than be argued away. The slide on
what an app genuinely does better is there on purpose, and so is the line
telling them Apple's commission does not apply to their business, which is an
argument in their favour that a vendor would normally keep quiet about.

It has to show screens. A software proposal with no screens asks a client to
buy a paragraph. The mocks are drawn from scripts/cfa_mocks.py in the client's
own green rather than CFA navy and gold, because a mock in the firm's colours
reads as the firm's product.

Figures: the fee is a resourced build on the practice day rates, 42 days at
6.92m standard, one named concession, net 6.228m, plus 1.8m a year of care.
Debo asked on 5 October for the number to sit close to 6m, and it was moved
there by cutting days rather than by cutting the rate, because a discount on
unchanged scope teaches a client the card is soft. The ladder below the page
price, and the floor, live in docs/greenhouse/greenhouse-pricing-guide-PRIVATE.md
and are never sent.

Set CLIENT and CLIENT_SHORT below before sending. Everything else follows.

Run:
  python3 scripts/build-greenhouse-deck.py
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
    BODY, DOCS, GOLD, INK, MX, NAVY, PAGE_H, PAGE_W, SAGE, SKY, SURFACE,
    SERIF_B, SERIF_I, TEAL, DEEP_NAVY,
    box, bullet_block, callout, chrome, heading, para,
    simple_table, tracked, wrap,
)

import cfa_mocks as M                            # noqa: E402
from cfa_mocks import GREENHOUSE as P            # noqa: E402
from reportlab.lib.colors import HexColor        # noqa: E402

# two tints the mocks need that are not in the client palette
HEX_WARN_TINT = HexColor("#FBF1E4")
HEX_WA_OUT = HexColor("#DCF4C6")

# --------------------------------------------------------------- the client --
PRINCIPAL = "Segun Oyewole"          # the person the deck is addressed to
CLIENT = PRINCIPAL                   # the cover, the footer and the share file name
CLIENT_SHORT = "The Greenhouse"      # the BRAND, as it appears on the WhatsApp
                                     # business account in the mock. Swap this for
                                     # the trading name once Debo gives it.

OUT = ROOT / "docs" / "greenhouse" / "greenhouse-produce-platform-deck-cfa.pdf"
SHARE = ROOT / "docs" / ("%s - Direct to Customer Platform (Proposal).pdf" % CLIENT)

D.FOOTER[0] = "Consult for Africa   /   Private and confidential   /   %s" % CLIENT
D.TOTAL[0] = "22"

W = PAGE_W - 2 * MX
PANEL_W = 240

# Debo asked for circles rather than the nested chevron on this deck, 5 October.
# Kept local to this file on purpose: cfa_deck.chevron_stack is the house mark
# and every other deck still carries it.
RINGS_LIGHT = [(INK, 9.0), (D.IND2, 7.2), (D.IND3, 5.6), (SKY, 4.2)]
RINGS_DARK = [(SKY, 9.0), (D.IND3, 7.2), (SAGE, 5.6), (GOLD, 3.2)]

# Body text on the one dark page. D.LIGHT is too close to the ground to carry a
# paragraph, so the closing page uses this instead.
PAGE_LIGHT = HexColor("#E4EDF5")


def ring_stack(c, cx, cy, r_outer, step, colours=RINGS_LIGHT):
    """Concentric open rings. Same nested idea as the mark's chevron, drawn as
    circles, which is what the cover asks for."""
    c.saveState()
    for i, (col, lw) in enumerate(colours):
        c.setStrokeColor(col)
        c.setLineWidth(lw)
        c.circle(cx, cy, r_outer - i * step, stroke=1, fill=0)
    c.restoreState()


def note(c, text, y=56, size=8.2, leading=10.4):
    """A source or terms line at the foot of a slide, wrapped to the text block.
    Drawn upward from y so the last line sits clear of the page furniture."""
    lines = wrap(c, text, "Helvetica", size, W)
    ty = y + (len(lines) - 1) * leading
    c.setFont("Helvetica", size)
    c.setFillColor(D.MUTED)
    for ln in lines:
        c.drawString(MX, ty, ln)
        ty -= leading


# ------------------------------------------------------------------ cover ----
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
    ring_stack(c, px + PANEL_W / 2.0, 322, 86, 19)
    c.setFillColor(GOLD)
    c.rect(px + (PANEL_W - 52) / 2.0, 186, 52, 3, fill=1, stroke=0)

    try:
        _lg = ImageReader(str(DOCS / "c4a-logo.png"))
        _lw, _lh = _lg.getSize()
        c.drawImage(_lg, MX, PAGE_H - 94, width=32.0 * _lw / _lh, height=32.0,
                    mask="auto")
    except Exception:
        pass

    c.setFillColor(GOLD)
    c.rect(MX, 424, 44, 3, fill=1, stroke=0)
    tracked(c, "PREPARED FOR %s" % PRINCIPAL.upper(), MX, 398, "Helvetica-Bold",
            10.5, TEAL, 2.6)

    c.setFont(SERIF_B, 34)
    c.setFillColor(INK)
    y = 344
    for line in wrap(c, "Selling a harvest you have not cut yet", SERIF_B, 34, 540):
        c.drawString(MX, y, line)
        y -= 42

    c.setFont(SERIF_I, 15)
    c.setFillColor(D.MUTED)
    y -= 2
    for line in wrap(c, "The software for a direct to customer produce box, and "
                        "the one constraint that makes it unlike ordinary retail.",
                     SERIF_I, 15, 520):
        c.drawString(MX, y, line)
        y -= 21

    c.setStrokeColor(D.RULE)
    c.setLineWidth(0.9)
    c.line(MX, 182, px - 26, 182)
    for dx, label, value in ((0, "PREPARED FOR", PRINCIPAL),
                             (170, "PREPARED BY", "Consult for Africa"),
                             (320, "SCOPE", "Phase one, build and launch"),
                             (470, "DATE", "October 2026")):
        tracked(c, label, MX + dx, 160, "Helvetica-Bold", 8.0, TEAL, 1.9)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(NAVY)
        c.drawString(MX + dx, 138, value)

    c.setFont("Helvetica", 9)
    c.setFillColor(D.MUTED)
    c.drawString(MX, 86, "Private and confidential. Prepared for %s and not for "
                         "onward circulation." % PRINCIPAL)
    c.showPage()


# ------------------------------------------------------- 02 the short answer --
def s_answer(c):
    chrome(c, "The short answer")
    y = heading(c, "You asked for a mobile app. We would build the thing that "
                   "installs like one.")
    y = para(c, "A progressive web app is a website that a phone treats as an "
                "application. It takes an icon on the home screen, opens without "
                "a browser bar, works on a weak signal, sends notifications, and "
                "can be listed on Google Play under your own name. It is one "
                "codebase rather than three, which is most of why it costs what "
                "it costs.", MX, y - 10, "Helvetica", 12.5, BODY, 540, 17.5)

    y = bullet_block(c, [
        ("Your buyers are on Android.", "Between 83 and 88 per cent of Nigerian "
         "phones, depending on whether you count handsets owned or pages browsed. "
         "Android is where a progressive web app is strongest and where every "
         "gap in it disappears."),
        ("You will change this weekly.", "Box contents, prices, delivery zones "
         "and cut off times move with the harvest. A web release is live when you "
         "deploy it. A native release waits for review."),
        ("It is not a dead end.", "The backend, the payment integration and the "
         "design system are the same assets a native app would use. Going native "
         "later is an addition, not a rebuild, if the first build is made for it."),
    ], MX, y - 20, 540, size=12.5, leading=17.0, gap=13)

    box(c, 630, 150, 158, 300, SURFACE, spine=TEAL)
    tracked(c, "WHAT YOU GET", 648, 424, "Helvetica-Bold", 8.0, TEAL, 1.9)
    items = [("Home screen icon", "no browser bar"),
             ("Google Play listing", "your name, your logo"),
             ("Push notifications", "harvest day, order ready"),
             ("Face ID sign in", "passkeys, not passwords"),
             ("Works offline", "order queues, sends on signal"),
             ("One codebase", "phone, tablet, desktop")]
    yy = 396
    for t, s in items:
        c.setFont("Helvetica-Bold", 9.2)
        c.setFillColor(NAVY)
        c.drawString(648, yy, t)
        c.setFont("Helvetica", 8.2)
        c.setFillColor(D.MUTED)
        c.drawString(648, yy - 11, s)
        yy -= 30

    # Page seven is s_nativewins. If the running order in build() changes, this
    # number changes with it.
    callout(c, MX, 128, 540, "We have put the case against this recommendation on "
                             "page seven, with the numbers, because you should buy "
                             "it knowing what it costs you.")
    c.showPage()


# -------------------------------------------------------- 03 where they are --
def s_market(c):
    chrome(c, "The evidence")
    y = heading(c, "Where your customers actually are, and what they pay to "
                   "reach you.")
    y = para(c, "The figures below are the reason the recommendation goes the way "
                "it does. They are current, sourced and dated, and they are the "
                "part of this argument that is not a matter of taste.",
             MX, y - 10, "Helvetica", 12.5, BODY, 560, 17.5)

    rows = [
        ["What it is", "The number", "Why it decides this"],
        ["Android share of Nigerian phones",
         "88 per cent owned\n83 per cent of browsing",
         "KPMG and Orange, 13,251 respondents in 12 cities, September 2026, against "
         "StatCounter traffic, June 2026. Every durable weakness in a web app is an "
         "iPhone weakness, and iPhones are 12 to 17 per cent of this market."],
        ["Smartphone ownership in Lagos", "81 per cent",
         "Up from 78 in 2023, and among the highest in the country. The customer you "
         "want is already carrying the thing you would ship to."],
        ["Cost of a gigabyte", "Up 65 per cent since January 2025",
         "The NCC approved the first tariff rise in a decade. The regulated floor "
         "moved from N287.50 to N431.25, and retail sits between N350 and N750."],
        ["Install conversion against app size",
         "About 1 per cent lost per 6MB",
         "Google's own Play Store analysis, and the effect runs roughly two and a "
         "half times stronger in emerging markets. Jumia's own Android app is under "
         "25MB and it still ships a separate lighter build."],
    ]
    simple_table(c, rows, MX, y - 18, [196, 136, 402], size=9.6, leading=12.4, pad=8)
    note(c, "Sources: KPMG and Orange Group via Technext, September 2026. StatCounter, "
            "June 2026. NCC tariff determination, January 2025. Google Play developer "
            "research on package size and install conversion.")
    c.showPage()


# ------------------------------------------------------- 04 you get an app ----
def s_isanapp(c):
    chrome(c, "The evidence")
    y = heading(c, "What you lose by not building a native app, on Android, is "
                   "nothing you have asked for.")
    y = para(c, "The worry behind wanting an app is usually that a website will "
                "not feel like one and will not be anywhere a customer can find it. "
                "Neither is true on the platform your customers are on.",
             MX, y - 10, "Helvetica", 12.5, BODY, 560, 17.5)

    rows = [
        ["What you want", "How it is delivered", "Caveat"],
        ["An icon on the home screen",
         "Chrome and Samsung Internet generate a real Android package on install. "
         "It appears in the app drawer, the app switcher and in Settings.",
         "None on Android."],
        ["A listing on Google Play",
         "Published as a Trusted Web Activity. One off developer fee of twenty five "
         "dollars, a Lighthouse score of 80 or better, and a domain verification file.",
         "Google sanctioned and current. Apple has no equivalent route."],
        ["Notifications",
         "Supported on Android, and on iPhone since Safari 16.4 once the customer has "
         "added the site to their home screen.",
         "On iPhone the home screen step comes first, and many people never take it."],
        ["Sign in with Face ID or a fingerprint",
         "Passkeys reach Face ID, Touch ID and Android biometrics from a web app. "
         "Apple supports this fully.",
         "Not a native advantage any more."],
        ["Working on a weak signal",
         "The order queues on the handset and sends itself when the signal returns.",
         "Reliable on Android. iPhone does not support background sync."],
    ]
    simple_table(c, rows, MX, y - 18, [168, 356, 210], size=9.5, leading=12.2, pad=8)
    c.showPage()


# ------------------------------------------------- 05 where native does win ---
def s_nativewins(c):
    chrome(c, "The case against our own recommendation")
    y = heading(c, "Where you are right, and a native app genuinely wins.")
    y = para(c, "Three of these are real and one is not, and the one that is not "
                "is the argument most often used to sell against native. We would "
                "rather tell you now than have you find it later.",
             MX, y - 10, "Helvetica", 12.5, BODY, 560, 17.5)

    y = bullet_block(c, [
        ("Live driver tracking.", "Watching a van move across a map while the "
         "customer's phone is in their pocket needs background location, and no "
         "web app on either platform can do it. If that feature matters on day one, "
         "it is the one honest reason to go native."),
        ("Notifications on iPhone.", "They work, but only after the customer has "
         "added you to their home screen, and most people never do. On the 12 to 17 "
         "per cent of your market using iPhones, assume you will reach them by "
         "WhatsApp and email rather than by push."),
        ("The App Store itself.", "Apple rejects wrapped websites under its minimum "
         "functionality rule. There is no route onto the App Store for this that "
         "does not involve writing native code. If being on the App Store matters to "
         "a partner, a franchisee or an investor rather than to a customer, that is "
         "a legitimate reason and it has nothing to do with conversion."),
    ], MX, y - 18, 560, size=12.3, leading=16.8, gap=12)

    callout(c, MX, y - 6, 734,
            "The argument we are not going to make: Apple's 30 per cent commission does "
            "not apply to you. It covers digital goods, and produce is a physical good, "
            "so Apple would take nothing from a box sold through an app.",
            bg=D.CREAM, spine=GOLD, fg=INK, size=12.0)
    c.showPage()


# --------------------------------------------------------- 06 native later ----
def s_later(c):
    chrome(c, "The case against our own recommendation")
    y = heading(c, "If you want a native app in a year, this is what today's "
                   "decision costs you.")
    y = para(c, "Most of what gets built in phase one is not web specific. The "
                "answer to the question is a number, and it is smaller than the "
                "cost of guessing wrong now.", MX, y - 10, "Helvetica", 12.5,
             BODY, 620, 17.5)

    # Everything below hangs off the baseline the text actually ended on. The
    # heading wraps to two lines at this width, and a fixed y put the cards over
    # the second line of the lede.
    top = y - 2
    base = 186
    bh = top - base
    cw = (W - 24) / 2.0

    box(c, MX, base, cw, bh, SURFACE, spine=TEAL)
    tracked(c, "CARRIES OVER UNTOUCHED", MX + 22, top - 26, "Helvetica-Bold", 8.4,
            TEAL, 2.0)
    yy = top - 52
    for t in ("The database and every order, customer and harvest record",
              "The whole backend and the interfaces the app talks to",
              "Payment integration and the server side verification",
              "The box rules, the substitution logic, the pricing engine",
              "The design system and the component library",
              "All of your content and photography"):
        c.setFillColor(GOLD)
        c.rect(MX + 22, yy + 3, 6, 2.6, fill=1, stroke=0)
        c.setFont("Helvetica", 10.4)
        c.setFillColor(BODY)
        for ln in wrap(c, t, "Helvetica", 10.4, cw - 62):
            c.drawString(MX + 36, yy, ln)
            yy -= 14
        yy -= 11

    x2 = MX + cw + 24
    box(c, x2, base, cw, bh, D.CREAM, spine=GOLD)
    tracked(c, "WHAT IS ACTUALLY LEFT TO DO", x2 + 22, top - 26, "Helvetica-Bold",
            8.4, D.MUTED, 2.0)
    yy = top - 52
    for t in ("Wrap the existing build in a native shell and add the native parts, "
              "which is two to four months of work rather than a rebuild",
              "Or rewrite the interface layer properly, which is around three "
              "months and gives a cleaner result",
              "Apple charges ninety nine dollars a year to stay listed, and a "
              "release waits for review every time"):
        c.setFillColor(TEAL)
        c.rect(x2 + 22, yy + 3, 6, 2.6, fill=1, stroke=0)
        c.setFont("Helvetica", 10.4)
        c.setFillColor(BODY)
        for ln in wrap(c, t, "Helvetica", 10.4, cw - 62):
            c.drawString(x2 + 36, yy, ln)
            yy -= 14
        yy -= 11

    callout(c, MX, base - 22, W, "We would build phase one so that this stays a two "
                                 "month job rather than a rebuild. That is an "
                                 "architectural choice made in week one and it costs "
                                 "nothing extra to make it now.")
    c.showPage()


# ----------------------------------------------------- 07 not ordinary shop ---
def s_constraint(c):
    chrome(c, "What makes this different")
    y = heading(c, "This is not a shop. You are selling stock that does not exist "
                   "when the customer pays for it.")
    y = para(c, "An ordinary e commerce build assumes a warehouse: a known number "
                "of a known thing, sitting on a shelf, reserved the moment somebody "
                "buys it. Nothing about a greenhouse works that way, and this is "
                "where a general developer will build you something that breaks in "
                "week three.", MX, y - 10, "Helvetica", 12.5, BODY, 560, 17.5)

    rows = [
        ["An ordinary shop assumes", "You actually have", "So the software must"],
        ["A unit of stock on a shelf", "A forecast yield from a bed, which lands "
         "within a window and comes in over or under",
         "Hold capacity rather than inventory, and sell against a forecast that "
         "tightens as the week runs"],
        ["Anything can be bought at any time",
         "A cut off, after which the pick list is fixed and the harvest is planned",
         "Run ordering in weekly cycles with a hard cut off and a visible countdown"],
        ["The customer chose exactly this item",
         "A box whose contents change every week with what is ready",
         "Publish the week's box, carry a substitution rule per line, and tell the "
         "customer before they are surprised"],
        ["Unsold stock waits",
         "Produce that is worthless in four days",
         "Route surplus somewhere automatically, into a discounted box, a standing "
         "wholesale buyer or a donation, without anybody remembering to"],
        ["Demand is the thing you grow",
         "Demand and supply have to meet in the same week",
         "Show both on one screen, so a sales push is never run into a week you "
         "cannot fill"],
    ]
    simple_table(c, rows, MX, y - 18, [196, 254, 284], size=9.5, leading=12.2, pad=8)
    c.showPage()


# --------------------------------------------------------- 08 five parts ------
def s_parts(c):
    chrome(c, "What we would build")
    y = heading(c, "Five parts, built in one go, because they only work together.")

    cards = [
        ("01", "The customer app", "Browse the week's boxes, order once or "
         "subscribe, pay, pick a delivery window, track the order, reorder in two taps."),
        ("02", "Subscription and payments", "Card on file, wallet top up and bank "
         "transfer, pause and skip a week, automatic retry when a card fails, and a "
         "fallback that does not lose the customer."),
        ("03", "Harvest and box console", "Capacity by site and bed, the week's box "
         "built against forecast yield, cut off control, substitution rules, pick "
         "lists and surplus routing."),
        ("04", "Delivery and WhatsApp", "Routes and manifests for the weekly drop, "
         "proof of delivery, and ordering, reminders and receipts over WhatsApp for "
         "the customers who will never open an app."),
        ("05", "The admin portal", "Where you set all of it up without calling us: "
         "boxes, prices, zones, cut offs, delivery windows, users, discounts and "
         "the reports that say whether this is working."),
    ]
    cw = (W - 4 * 14) / 5.0
    x = MX
    for num, title, blurb in cards:
        box(c, x, 150, cw, 268, SURFACE, spine=TEAL)
        c.setFont(SERIF_B, 25)
        c.setFillColor(D.LIGHT)
        c.drawString(x + 18, 384, num)
        c.setFont("Helvetica-Bold", 11.4)
        c.setFillColor(NAVY)
        ty = 358
        for ln in wrap(c, title, "Helvetica-Bold", 11.4, cw - 36):
            c.drawString(x + 18, ty, ln)
            ty -= 14
        c.setFont("Helvetica", 9.6)
        c.setFillColor(BODY)
        ty -= 8
        for ln in wrap(c, blurb, "Helvetica", 9.6, cw - 36):
            c.drawString(x + 18, ty, ln)
            ty -= 13
        x += cw + 14

    callout(c, MX, 128, W, "The console is the part a cheaper quote leaves out, and it "
                           "is the part that decides whether you can run this at two "
                           "hundred boxes a week without three people on WhatsApp.")
    c.showPage()


# ----------------------------------------------------------- mock geometry ---
# One band for every mock slide, so the frames line up page to page and the
# deck does not look like five different documents.
MY = 76          # baseline of every frame
MH = 360         # height of every frame
PW = 152         # phone width
PITCH = 178      # phone width plus the gutter


def mock_head(c, title, sub):
    chrome(c, "Draft screens")
    heading(c, title, size=21)
    c.setFont("Helvetica", 10.6)
    c.setFillColor(D.MUTED)
    c.drawString(MX, PAGE_H - 134, sub)


def side_panel(c, x, w, kicker, items):
    """The explainer column that sits beside a mock and says why it matters."""
    box(c, x, MY, w, MH, SURFACE, spine=TEAL)
    tracked(c, kicker, x + 22, MY + MH - 28, "Helvetica-Bold", 8.4, TEAL, 2.0)
    yy = MY + MH - 54
    for lead, rest in items:
        c.setFont("Helvetica-Bold", 10.4)
        c.setFillColor(NAVY)
        c.drawString(x + 22, yy, lead)
        yy -= 13.5
        c.setFont("Helvetica", 9.8)
        c.setFillColor(BODY)
        for ln in wrap(c, rest, "Helvetica", 9.8, w - 46):
            c.drawString(x + 22, yy, ln)
            yy -= 12.3
        yy -= 10
    return yy


# ------------------------------------------------------- 11 mock, customer ----
def s_mock_customer(c):
    mock_head(c, "The customer app.",
              "Indicative layout and order of information, not a finished design. "
              "Colour and photography follow your brand.")
    x0 = MX + 24
    NAV = ["Shop", "My box", "Orders", "Account"]

    # --- 1. the week on offer
    sx, sy, sw, sh = M.phone(c, x0, MY, w=PW, h=MH, label="this week")
    y = M.app_bar(c, sx, sy, sw, sh, "This week's harvest", P,
                  sub="Week 42  /  order by Thu 18:00")
    M.box_tile(c, sx + 7, y - 84, sw - 14, 84, P, "The Family Box", "N18,500",
               "Serves 4 to 5  /  8 items", badge="12 LEFT")
    M.box_tile(c, sx + 7, y - 176, sw - 14, 84, P, "The Salad Box", "N11,000",
               "Serves 2  /  6 items", kind=1)
    M.box_tile(c, sx + 7, y - 268, sw - 14, 84, P, "The Herb Box", "N6,500",
               "Add to any box", kind=2)
    M.nav_bar(c, sx, sy, sw, NAV, P)

    # --- 2. what is actually in it
    sx, sy, sw, sh = M.phone(c, x0 + PITCH, MY, w=PW, h=MH, label="what is in it")
    y = M.app_bar(c, sx, sy, sw, sh, "The Family Box", P, sub="N18,500  /  week 42")
    M.text(c, "PICKED THIS WEEK", sx + 8, y - 4, 5.6, P.muted, "Helvetica-Bold")
    yy = y - 16
    for nm, qty, swap in (("Cherry tomato", "500g", False),
                          ("Butterhead lettuce", "2 heads", False),
                          ("Cucumber", "4", False), ("Sweet pepper", "6", True),
                          ("Spring onion", "1 bunch", False), ("Basil", "1 bunch", False),
                          ("Rocket", "200g", False), ("Fluted pumpkin", "1 bunch", True)):
        M.text(c, nm, sx + 8, yy - 8, 6.6, P.ink, "Helvetica-Bold")
        M.rtext(c, qty, sx + sw - 8, yy - 8, 6.4, P.muted)
        if swap:
            M.text(c, "may be swapped, we will tell you", sx + 8, yy - 16, 5.2, P.warn)
            yy -= 8
        yy -= 18
    M.card(c, sx + 7, yy - 32, sw - 14, 32, P, fill=P.tint, border=False)
    M.text(c, "Not eating peppers?", sx + 13, yy - 12, 6.2, P.ink, "Helvetica-Bold")
    M.text(c, "Set them as a never, for every box", sx + 13, yy - 22, 5.6, P.body)
    M.button(c, sx + 7, sy + 34, sw - 14, "Add to my week", P)
    M.nav_bar(c, sx, sy, sw, NAV, P, active=1)

    # --- 3. checkout
    sx, sy, sw, sh = M.phone(c, x0 + 2 * PITCH, MY, w=PW, h=MH, label="checkout")
    y = M.app_bar(c, sx, sy, sw, sh, "Checkout", P, sub="Delivery Saturday 11 Oct")
    M.text(c, "WHEN", sx + 8, y - 4, 5.6, P.muted, "Helvetica-Bold")
    xx = sx + 8
    for lab, on in (("Sat am", True), ("Sat pm", False), ("Sun am", False)):
        xx += M.pill(c, xx, y - 25, lab, P, bg=P.accent if on else P.tint_d,
                     fg=white if on else P.body, h=15, size=6.2) + 5
    M.text(c, "WHERE", sx + 8, y - 44, 5.6, P.muted, "Helvetica-Bold")
    M.card(c, sx + 7, y - 96, sw - 14, 44, P)
    M.text(c, "12 Oduduwa Crescent", sx + 13, y - 63, 6.6, P.ink, "Helvetica-Bold")
    M.text(c, "GRA Ikeja  /  gate code 4417", sx + 13, y - 73, 5.8, P.muted)
    M.text(c, "Pinned on the map  /  change", sx + 13, y - 86, 5.8, P.accent,
           "Helvetica-Bold")
    M.text(c, "HOW YOU PAY", sx + 8, y - 112, 5.6, P.muted, "Helvetica-Bold")
    for i, (lab, sub, on) in enumerate((("Box wallet", "balance N22,400", True),
                                        ("Bank transfer", "your own account number", False),
                                        ("Card ending 4412", "charged Thursday", False))):
        yy = y - 152 - i * 34
        M.card(c, sx + 7, yy, sw - 14, 30, P, fill=P.tint if on else None,
               border=not on)
        c.setFillColor(P.accent if on else P.rule)
        c.circle(sx + 17, yy + 15, 3.6, fill=1, stroke=0)
        M.text(c, lab, sx + 26, yy + 17, 6.4, P.ink, "Helvetica-Bold")
        M.text(c, sub, sx + 26, yy + 7, 5.6, P.muted)
    M.card(c, sx + 7, sy + 50, sw - 14, 30, P, fill=P.tint_d, border=False)
    M.text(c, "Total", sx + 13, sy + 67, 6.4, P.body)
    M.rtext(c, "N18,500", sx + sw - 13, sy + 66, 8.4, P.ink, "Helvetica-Bold")
    M.text(c, "Delivery included inside Ikeja", sx + 13, sy + 57, 5.4, P.muted)
    M.button(c, sx + 7, sy + 22, sw - 14, "Confirm this week", P)

    # --- 4. after the order
    sx, sy, sw, sh = M.phone(c, x0 + 3 * PITCH, MY, w=PW, h=MH, label="after the order")
    y = M.app_bar(c, sx, sy, sw, sh, "Your deliveries", P, sub="Next: Saturday morning")
    M.card(c, sx + 7, y - 76, sw - 14, 72, P, fill=P.tint, border=False)
    M.text(c, "SATURDAY 11 OCTOBER", sx + 13, y - 18, 5.4, P.accent, "Helvetica-Bold")
    M.text(c, "The Family Box", sx + 13, y - 32, 7.6, P.ink, "Helvetica-Bold")
    M.text(c, "Picked and packed  /  out for delivery 9:40", sx + 13, y - 44, 5.8, P.body)
    xx = sx + 13
    for lab in ("Skip next week", "Change address"):
        xx += M.pill(c, xx, y - 66, lab, P, bg=white, h=13, size=5.6) + 5
    yy = y - 94
    for dt, bx, st in (("4 Oct", "The Family Box", "Delivered"),
                       ("27 Sep", "The Family Box", "Delivered"),
                       ("20 Sep", "The Salad Box", "Delivered"),
                       ("13 Sep", "The Family Box", "Skipped"),
                       ("6 Sep", "The Family Box", "Delivered")):
        yy = M.row(c, sx + 8, yy, sw - 16, P, bx, sub=dt, chip=st,
                   chip_bg=P.rule if st == "Skipped" else P.tint_d)
    M.card(c, sx + 7, sy + 34, sw - 14, 52, P, fill=P.tint_d, border=False)
    M.text(c, "Your subscription", sx + 13, sy + 72, 6.4, P.ink, "Helvetica-Bold")
    M.text(c, "Family Box, weekly, Saturdays", sx + 13, sy + 61, 5.8, P.body)
    M.text(c, "Pause  /  change box  /  change day", sx + 13, sy + 44, 5.8, P.accent,
           "Helvetica-Bold")
    M.nav_bar(c, sx, sy, sw, NAV, P, active=2)
    c.showPage()


# --------------------------------------------------- 12 mock, subscription ----
def s_mock_subs(c):
    mock_head(c, "The subscription, and what happens when a card fails.",
              "Recurring billing on Nigerian consumer cards fails often enough that "
              "the recovery path is a product decision rather than an edge case.")
    x0 = MX + 6

    sx, sy, sw, sh = M.phone(c, x0, MY, w=PW, h=MH, label="setting it up")
    y = M.app_bar(c, sx, sy, sw, sh, "Make it weekly", P, sub="Change or stop any time")
    M.text(c, "HOW OFTEN", sx + 8, y - 4, 5.6, P.muted, "Helvetica-Bold")
    xx = sx + 8
    for lab, on in (("Weekly", True), ("Fortnightly", False), ("Monthly", False)):
        xx += M.pill(c, xx, y - 25, lab, P, bg=P.accent if on else P.tint_d,
                     fg=white if on else P.body, h=15, size=6.0) + 4
    M.text(c, "WHICH DAY", sx + 8, y - 44, 5.6, P.muted, "Helvetica-Bold")
    xx = sx + 8
    for lab, on in (("Thu", False), ("Sat", True), ("Sun", False)):
        xx += M.pill(c, xx, y - 65, lab, P, bg=P.accent if on else P.tint_d,
                     fg=white if on else P.body, h=15, size=6.0) + 4
    M.card(c, sx + 7, y - 150, sw - 14, 70, P, fill=P.tint, border=False)
    M.text(c, "WHAT YOU NEVER WANT", sx + 13, y - 92, 5.4, P.muted, "Helvetica-Bold")
    xx = sx + 13
    for lab in ("Peppers", "Okra"):
        xx += M.pill(c, xx, y - 112, lab + "  x", P, bg=white, h=13, size=5.6) + 5
    M.text(c, "We substitute these every week and", sx + 13, y - 128, 5.6, P.body)
    M.text(c, "tell you what we swapped in.", sx + 13, y - 138, 5.6, P.body)
    M.card(c, sx + 7, y - 216, sw - 14, 52, P)
    M.text(c, "Charged every Thursday", sx + 13, y - 178, 6.4, P.ink, "Helvetica-Bold")
    M.text(c, "After the cut off, for that week's box.", sx + 13, y - 190, 5.6, P.body)
    M.text(c, "Skip by Wednesday and pay nothing.", sx + 13, y - 201, 5.6, P.body)
    M.button(c, sx + 7, sy + 26, sw - 14, "Start my subscription", P)

    sx, sy, sw, sh = M.phone(c, x0 + PITCH, MY, w=PW, h=MH, label="the card failed")
    y = M.app_bar(c, sx, sy, sw, sh, "We could not charge you", P,
                  sub="Your Saturday box is still held")
    M.card(c, sx + 7, y - 68, sw - 14, 64, P, fill=HEX_WARN_TINT, border=False)
    c.setFillColor(P.warn)
    c.rect(sx + 7, y - 68, 2.6, 64, fill=1, stroke=0)
    M.text(c, "Card ending 4412 was declined", sx + 15, y - 20, 6.6, P.ink, "Helvetica-Bold")
    M.text(c, "Your bank, not us. It happens.", sx + 15, y - 31, 5.8, P.body)
    M.text(c, "We will try again tomorrow at 9am.", sx + 15, y - 42, 5.8, P.body)
    M.text(c, "Your box is held until Friday 18:00.", sx + 15, y - 56, 5.8, P.warn,
           "Helvetica-Bold")
    M.text(c, "PAY ANOTHER WAY, IN ONE TAP", sx + 8, y - 88, 5.4, P.muted, "Helvetica-Bold")
    M.button(c, sx + 7, y - 114, sw - 14, "Transfer to your account", P)
    M.text(c, "Wema  /  7041 2290 18  /  yours alone", sx + 7, y - 125, 5.4, P.muted)
    M.button(c, sx + 7, y - 156, sw - 14, "Pay from wallet, N4,200", P, outline=True)
    M.button(c, sx + 7, y - 184, sw - 14, "Use a different card", P, outline=True)
    M.card(c, sx + 7, sy + 30, sw - 14, 52, P, fill=P.tint, border=False)
    M.text(c, "Or skip this week", sx + 13, sy + 68, 6.2, P.ink, "Helvetica-Bold")
    M.text(c, "No charge and no penalty. Your", sx + 13, sy + 56, 5.6, P.body)
    M.text(c, "subscription carries on next week.", sx + 13, sy + 45, 5.6, P.body)

    px = x0 + 2 * PITCH
    side_panel(c, px, PAGE_W - MX - px, "WHY THIS SCREEN EARNS ITS PLACE", [
        ("Paystack does not retry.",
         "A failed subscription charge is not attempted again. It moves to an "
         "attention state and waits for somebody to do something, which is why the "
         "retry ladder has to be ours rather than theirs."),
        ("A Verve card cannot auto renew at all.",
         "Paystack says so plainly. A meaningful share of Nigerian debit cards "
         "therefore cannot carry an automatic subscription, and a build that assumes "
         "they can will quietly lose those customers."),
        ("So the box is held, not cancelled.",
         "A retry schedule, a bank account that belongs to that customer alone, a "
         "wallet they can pre fund, and a skip that costs nothing. Four ways out of "
         "one problem, with the box reserved while they choose."),
        ("Pre funded wallets do the heavy lifting.",
         "A customer who tops up once a month never sees this screen again. That is "
         "why the wallet leads at checkout rather than the card."),
    ])
    c.showPage()


# ------------------------------------------------------- 13 mock, console -----
def s_mock_console(c):
    mock_head(c, "The harvest and box console.",
              "One screen where demand and supply meet, so nobody sells a hundred "
              "boxes of something that is not ready.")

    cw_ = 470
    cx, cy, cw, ch = M.console(c, MX, MY, cw_, MH)
    y = M.app_bar(c, cx, cy, cw, ch, "Week 42  /  planning", P,
                  sub="Cut off Thursday 18:00, in 2 days 4 hours", radius=0)
    M.kpi(c, cx + 10, y - 50, 108, 48, P, "committed", "312", "boxes paid for")
    M.kpi(c, cx + 124, y - 50, 108, 48, P, "can be filled", "287", "on forecast yield",
          accent=P.warn)
    M.kpi(c, cx + 238, y - 50, 108, 48, P, "short", "25", "boxes to resolve",
          accent=P.warn)
    M.bars(c, cx + 356, y - 44, 100, 38, [188, 212, 240, 266, 291, 312], P,
           labels=["37", "38", "39", "40", "41", "42"])
    M.text(c, "boxes per week", cx + 356, y - 58, 5.4, P.muted)

    M.text(c, "THIS WEEK'S LINES, AGAINST WHAT THE SITES WILL GIVE YOU",
           cx + 10, y - 72, 5.8, P.muted, "Helvetica-Bold")
    yy = y - 82
    for nm, sub, chip, short in (
            ("Cherry tomato, 500g", "Site A beds 3 to 7  /  need 312, forecast 268",
             "SHORT 44", True),
            ("Butterhead lettuce, 2 heads", "Site B tunnel 2  /  need 624, forecast 700",
             "OK", False),
            ("Cucumber, 4", "Site A bed 11  /  need 1,248, forecast 1,900",
             "OVER 652", False),
            ("Sweet pepper, 6", "Site C  /  need 1,872, forecast 1,410", "SHORT 462", True),
            ("Spring onion, 1 bunch", "Site B tunnel 1  /  need 312, forecast 318",
             "OK", False),
            ("Basil, 1 bunch", "Site B tunnel 4  /  need 312, forecast 340", "OK", False),
            ("Rocket, 200g", "Site A bed 2  /  need 312, forecast 290", "SHORT 22", True)):
        yy = M.row(c, cx + 10, yy, cw - 20, P, nm, sub=sub, chip=chip,
                   chip_bg=P.warn if short else P.tint_d)
    M.button(c, cx + 10, cy + 14, 124, "Resolve the 25 short", P)
    M.button(c, cx + 142, cy + 14, 106, "Publish week 42", P, outline=True)
    M.button(c, cx + 256, cy + 14, 106, "Print pick lists", P, outline=True)

    px = MX + cw_ + 22
    side_panel(c, px, PAGE_W - MX - px, "WHAT THE BUTTONS ACTUALLY DO", [
        ("Resolve the short.",
         "Applies the substitution rules you set once, respects every customer's "
         "never list, and shows you the handful it cannot solve before you commit."),
        ("Publish the week.",
         "Locks the box, opens ordering, starts the countdown and schedules the "
         "reminder that goes out on Wednesday evening."),
        ("Print the pick lists.",
         "By site, by bed and by picker, in harvest order rather than customer order, "
         "which is the difference between a morning and a day."),
        ("Route the surplus.",
         "The 652 spare cucumbers become a discounted box, a wholesale line or a "
         "donation on a rule, rather than on somebody noticing in time."),
    ])
    c.showPage()


# ------------------------------------------------- 14 mock, delivery and wa ---
def s_mock_delivery(c):
    mock_head(c, "Delivery day, and the customers who will never open an app.",
              "Lagos addresses do not find a house, so the manifest carries a dropped "
              "pin, a landmark and a gate instruction rather than a street line.")

    cx, cy, cw, ch = M.console(c, MX, MY, 556, MH)
    y = M.app_bar(c, cx, cy, cw, ch, "Saturday 11 October  /  run sheet", P,
                  sub="312 drops  /  4 vans  /  Ikeja, Lekki, VI and Ikoyi", radius=0)
    M.kpi(c, cx + 10, y - 48, 128, 46, P, "delivered", "214", "of 312")
    M.kpi(c, cx + 144, y - 48, 128, 46, P, "on the van", "87", "in progress")
    M.kpi(c, cx + 278, y - 48, 128, 46, P, "failed", "11", "nobody home", accent=P.warn)
    M.kpi(c, cx + 412, y - 48, 128, 46, P, "cost per drop", "N1,180", "against N18,500 sold")
    M.text(c, "VAN 2  /  LEKKI PHASE 1  /  DRIVER: TUNDE", cx + 10, y - 64, 5.8,
           P.muted, "Helvetica-Bold")
    yy = y - 74
    for nm, sub, chip, bad in (
            ("Mrs A. Bello  /  Family Box",
             "Pin dropped  /  Admiralty Way, by the Total  /  gate 2B", "DELIVERED", False),
            ("T. Okonkwo  /  Salad Box x2",
             "Pin dropped  /  Fola Osibo  /  call on arrival", "DELIVERED", False),
            ("Dr N. Adeyemi  /  Family Box",
             "Pin dropped  /  Chevron estate  /  leave with security", "ON VAN", False),
            ("K. Ibrahim  /  Herb Box",
             "Pin dropped  /  Agungi  /  no answer, 2 attempts", "FAILED", True),
            ("Mrs S. Eze  /  Family Box",
             "Pin dropped  /  Ikate  /  gate code 7781", "ON VAN", False),
            ("O. Lawal  /  Family Box",
             "Pin dropped  /  Lekki Phase 1, 2nd roundabout  /  call gateman",
             "ON VAN", False),
            ("Mrs R. Daramola  /  Salad Box",
             "Pin dropped  /  Victoria Bay  /  flat 4C, lift to 4", "ON VAN", False)):
        yy = M.row(c, cx + 10, yy, cw - 20, P, nm, sub=sub, chip=chip,
                   chip_bg=P.warn if bad else P.tint_d)
    M.button(c, cx + 10, cy + 14, 126, "Re route the 11 failed", P)
    M.button(c, cx + 144, cy + 14, 110, "Message this van", P, outline=True)

    sx, sy, sw, sh = M.phone(c, PAGE_W - MX - PW, MY, w=PW, h=MH,
                             label="the whatsapp thread")
    y = M.app_bar(c, sx, sy, sw, sh, CLIENT_SHORT, P, sub="Business account")
    yy = y - 4
    for side, msg in ((0, "Week 42 is live. The Family Box has cherry tomato, "
                          "butterhead, cucumber and basil. N18,500. Order by Thursday 6pm."),
                      (1, "Same as last week please"),
                      (0, "Done. Family Box, Saturday morning, 12 Oduduwa Crescent. "
                          "N18,500. Pay here or by transfer."),
                      (1, "Transferred"),
                      (0, "Received, thank you. Your box is confirmed for Saturday "
                          "between 9 and 12."),
                      (1, "Can you skip me next week"),
                      (0, "Skipped. Nothing will be charged. You are back on for "
                          "the 25th.")):
        lines = wrap(c, msg, "Helvetica", 5.8, sw - 46)
        bh = len(lines) * 7.6 + 10
        bwid = sw - 24 if side == 0 else sw - 44
        bx = sx + 8 if side == 0 else sx + sw - 8 - bwid
        c.setFillColor(P.tint if side == 0 else HEX_WA_OUT)
        c.roundRect(bx, yy - bh, bwid, bh, 5, fill=1, stroke=0)
        ty = yy - 11
        c.setFont("Helvetica", 5.8)
        c.setFillColor(P.ink)
        for ln in lines:
            c.drawString(bx + 7, ty, ln)
            ty -= 7.6
        yy -= bh + 7
    M.card(c, sx + 7, sy + 26, sw - 14, 44, P, fill=P.tint_d, border=False)
    M.text(c, "No app, no password, no download.", sx + 13, sy + 56, 5.8, P.ink,
           "Helvetica-Bold")
    M.text(c, "The same order, the same box, and the", sx + 13, sy + 45, 5.6, P.body)
    M.text(c, "same record in the console.", sx + 13, sy + 35, 5.6, P.body)
    c.showPage()


# --------------------------------------------------------- 15 mock, admin -----
def s_mock_admin(c):
    mock_head(c, "The admin portal, so you are not calling us to change a price.",
              "Everything that will change in your first year is a setting rather "
              "than a change request.")

    cw_ = 470
    cx, cy, cw, ch = M.console(c, MX, MY, cw_, MH)
    y = M.app_bar(c, cx, cy, cw, ch, "Setup", P, sub="Signed in as operations manager",
                  radius=0)
    y = M.tabs(c, cx, y + 9, cw, ["Boxes", "Pricing", "Zones", "Cut offs", "People",
                                  "Reports"], P, active=0)
    M.text(c, "BOXES YOU SELL", cx + 10, y, 5.8, P.muted, "Helvetica-Bold")
    yy = y - 10
    for nm, sub, chip in (("The Family Box", "8 lines  /  serves 4 to 5  /  N18,500", "LIVE"),
                          ("The Salad Box", "6 lines  /  serves 2  /  N11,000", "LIVE"),
                          ("The Herb Box", "4 lines  /  add on  /  N6,500", "LIVE"),
                          ("The Office Box", "12 lines  /  draft, not published", "DRAFT"),
                          ("Surplus Box", "variable  /  filled from the overs  /  N7,500",
                           "RULE")):
        yy = M.row(c, cx + 10, yy, cw - 20, P, nm, sub=sub, chip=chip,
                   chip_bg=P.tint_d if chip == "LIVE" else P.rule)
    M.text(c, "SUBSTITUTION RULES, APPLIED IN ORDER", cx + 10, yy - 12, 5.8,
           P.muted, "Helvetica-Bold")
    yy -= 22
    for nm, sub in (("1. Never send a customer's never list", "always, no exception"),
                    ("2. Swap inside the same family first", "leaf for leaf, fruit for fruit"),
                    ("3. Top up by weight rather than by count", "so the value holds"),
                    ("4. Tell the customer before the van leaves", "WhatsApp and push"),
                    ("5. Send what is left to the surplus box", "then wholesale, then donation")):
        yy = M.row(c, cx + 10, yy, cw - 20, P, nm, sub=sub, h=21)
    M.button(c, cx + 10, cy + 14, 100, "New box", P)
    M.button(c, cx + 118, cy + 14, 112, "Change a price", P, outline=True)
    M.button(c, cx + 238, cy + 14, 120, "Add a delivery zone", P, outline=True)

    px = MX + cw_ + 22
    bw = PAGE_W - MX - px
    box(c, px, MY, bw, MH, SURFACE, spine=TEAL)
    tracked(c, "WHAT YOU CONTROL WITHOUT US", px + 22, MY + MH - 28, "Helvetica-Bold",
            8.4, TEAL, 2.0)
    yy = MY + MH - 54
    for t in ("Create a box, set its lines, price it, publish it or hold it as a draft",
              "Change any price, with the change logged and dated",
              "Draw a delivery zone on a map and set what delivery costs inside it",
              "Move the cut off, the delivery days and the delivery windows",
              "Add a staff member and decide what they can see and do",
              "Set the substitution rules and where the surplus goes",
              "Issue a credit, a refund or a discount code",
              "Read the reports: boxes a week, value per box, churn, waste and cost "
              "to serve"):
        c.setFillColor(GOLD)
        c.rect(px + 22, yy + 3, 6, 2.6, fill=1, stroke=0)
        c.setFont("Helvetica", 10.0)
        c.setFillColor(BODY)
        for ln in wrap(c, t, "Helvetica", 10.0, bw - 56):
            c.drawString(px + 36, yy, ln)
            yy -= 12.4
        yy -= 9
    c.showPage()


# ------------------------------------------------- 14 what gets built wrong ---
def s_wrong(c):
    chrome(c, "Why us rather than a cheaper quote")
    y = heading(c, "Seven decisions that a general developer will get wrong, and "
                   "you will pay for later.")

    rows = [
        ["The decision", "The cheap answer", "What it costs you"],
        ["Inventory", "A stock count per product, decremented when somebody buys",
         "You do not know the count until the morning you cut. The correct shape is "
         "a commitment before a cut off, real yield entered at harvest, then an "
         "allocation across everyone who committed"],
        ["Recurring payment", "Attach a Paystack plan and let it run",
         "Paystack does not retry a failed subscription charge, and a Verve card "
         "cannot auto renew at all. Without your own retry ladder, a transfer "
         "account and a wallet, a declined card becomes a cancelled customer"],
        ["Addresses", "A street address field on every order",
         "Lagos addresses do not find a house. Capture a dropped pin, a landmark and "
         "a gate instruction once per customer, confirm it on the first delivery, "
         "then reuse it every week"],
        ["The box", "A product with a fixed description",
         "Contents change weekly. Substitution needs a rule and a hierarchy, every "
         "customer needs a list of what never to send them, and they need telling "
         "before the van leaves rather than after"],
        ["WhatsApp", "Send messages when you want to",
         "Since July 2025 Meta bills every template message by category. Tagging a "
         "delivery reminder as marketing rather than utility multiplies the bill, so "
         "the category belongs in the data model"],
        ["Packing and the law", "One compliance posture for everything",
         "Whole produce and prepared produce are regulated completely differently. "
         "That is a flag per line, set once, not a conversation every time you add "
         "a product"],
        ["Surplus", "Nothing, because a shop has no surplus",
         "Produce is worthless in four days. Routing the overs on a rule into a "
         "discounted box, a wholesale buyer or a donation is margin, and leaving it "
         "to somebody noticing is waste"],
    ]
    simple_table(c, rows, MX, y - 16, [128, 250, 356], size=9.1, leading=11.6, pad=6.4)
    c.setFont(SERIF_I, 11.6)
    c.setFillColor(NAVY)
    c.drawString(MX, 62, "None of this is exotic. It is the difference between somebody who has "
                         "built a shop and somebody who has looked at how you run a Thursday.")
    c.showPage()


# ------------------------------------------------------------ 15 the plan -----
def s_plan(c):
    chrome(c, "How it runs")
    y = heading(c, "Ten weeks, and what we need from you in each of them.")

    rows = [
        ["Weeks", "What we do", "What you do"],
        ["1 to 2", "Discovery. We sit with your harvest plan, your sites and whoever "
         "currently takes the orders, and we write down the box rules, the cut off, "
         "the zones and the substitution logic",
         "Two days of your operations lead, your harvest records, and a decision on "
         "the first three boxes"],
        ["2 to 3", "Design. Every screen in this deck, drawn properly in your brand, "
         "signed off before anybody writes code",
         "One sign off meeting. After this, changes cost time"],
        ["3 to 7", "Build. The customer app, the payments, the console and the admin "
         "portal, shown to you working at the end of every fortnight",
         "An hour a fortnight to look at it and say what is wrong"],
        ["7 to 8", "The real data. Your boxes, your prices, your zones, your staff, "
         "your photography, loaded and checked",
         "Product photography, and someone to sit with us while we load it"],
        ["8 to 9", "Testing with real customers. Twenty households order a real box "
         "and we watch where they stop",
         "Twenty willing customers, and one real delivery Saturday"],
        ["9 to 10", "Launch and handover. Google Play listing, training for your "
         "team, written documentation, and we stay close for the first two weeks",
         "Two half days of training for whoever runs it"],
    ]
    simple_table(c, rows, MX, y - 18, [66, 390, 278], size=9.5, leading=12.2, pad=8)
    c.showPage()


# ---------------------------------------------------------- 16 what you own ---
def s_own(c):
    chrome(c, "How it runs")
    y = heading(c, "What you own at the end, which is all of it.")
    y = para(c, "This matters more than it sounds. A good deal of software sold to "
                "Nigerian businesses leaves the client renting their own customer "
                "list. Everything below is yours on the day we hand over, and none "
                "of it depends on us staying.", MX, y - 10, "Helvetica", 12.5,
             BODY, 700, 17.5)

    top = y - 2
    base = 110
    bh = top - base
    cw = (W - 24) / 2.0

    box(c, MX, base, cw, bh, SURFACE, spine=TEAL)
    tracked(c, "YOURS, IN YOUR NAME", MX + 22, top - 26, "Helvetica-Bold", 8.4,
            TEAL, 2.0)
    yy = top - 52
    for t in ("The source code, in a repository you own",
              "The domain, the hosting account and the database",
              "The Paystack account, the WhatsApp Business account, the Play listing",
              "Every customer record, order and harvest record, exportable",
              "The design files and the component library",
              "Written documentation and recorded training"):
        c.setFillColor(GOLD)
        c.rect(MX + 22, yy + 3, 6, 2.6, fill=1, stroke=0)
        c.setFont("Helvetica", 10.4)
        c.setFillColor(BODY)
        for ln in wrap(c, t, "Helvetica", 10.4, cw - 62):
            c.drawString(MX + 36, yy, ln)
            yy -= 13.6
        yy -= 11

    x2 = MX + cw + 24
    box(c, x2, base, cw, bh, D.CREAM, spine=GOLD)
    tracked(c, "AND WHAT WE COMMIT TO", x2 + 22, top - 26, "Helvetica-Bold", 8.4,
            D.MUTED, 2.0)
    yy = top - 52
    for t in ("No lock in. If you move to another firm, we hand over and help them",
              "No commission on your sales, ever",
              "Your data is never used for anything but running your business",
              "Registered as a data controller under the Nigeria Data Protection "
              "Act, with the consent and deletion flows built in rather than "
              "added later",
              "If a defect from the build appears in the first ninety days, we fix "
              "it and do not bill it"):
        c.setFillColor(TEAL)
        c.rect(x2 + 22, yy + 3, 6, 2.6, fill=1, stroke=0)
        c.setFont("Helvetica", 10.4)
        c.setFillColor(BODY)
        for ln in wrap(c, t, "Helvetica", 10.4, cw - 62):
            c.drawString(x2 + 36, yy, ln)
            yy -= 13.6
        yy -= 11
    c.showPage()


# -------------------------------------------------------------- 17 the fee ---
def s_fee(c):
    chrome(c, "The fee")
    y = heading(c, "The build, priced as the days it takes.")
    y = para(c, "We price from named grades against the days each part actually "
                "needs, published, so a change in scope is a change in days rather "
                "than an argument about a number.", MX, y - 10, "Helvetica", 12.3,
             BODY, 620, 17.0)

    rows = [
        ["What", "Days", "Fee"],
        ["Discovery, the box model and the harvest rules", "3", "N850,000"],
        ["Experience design and the screens", "5", "N950,000"],
        ["The customer ordering app", "10", "N1,550,000"],
        ["Subscription and payments", "6", "N975,000"],
        ["Harvest, box and admin console", "10", "N1,550,000"],
        ["Delivery, manifest and WhatsApp", "4", "N650,000"],
        ["Testing, launch and handover", "4", "N395,000"],
        ["Standard, at the rate card", "42", "N6,920,000"],
        ["Programme rate, one continuous mandate rather than seven engagements", "", "(N692,000)"],
        ["Net build fee", "42", "N6,228,000"],
    ]
    yy = simple_table(c, rows, MX, y - 16, [446, 60, 128], size=10.0, leading=12.8, pad=7)

    box(c, MX + 648, 150, W - 648, 258, SURFACE, spine=TEAL)
    tracked(c, "GRADES", MX + 666, 386, "Helvetica-Bold", 8.0, TEAL, 1.9)
    yy2 = 362
    for g, r in (("Principal", "350k"), ("Senior engineer", "200k"),
                 ("Designer", "150k"), ("Engineer", "125k"), ("Test and data", "90k")):
        c.setFont("Helvetica-Bold", 9.0)
        c.setFillColor(NAVY)
        c.drawString(MX + 666, yy2, g)
        c.setFont("Helvetica", 8.4)
        c.setFillColor(D.MUTED)
        c.drawString(MX + 666, yy2 - 10, r + " per day")
        yy2 -= 27
    c.setStrokeColor(D.RULE)
    c.line(MX + 666, yy2 + 8, PAGE_W - MX - 18, yy2 + 8)
    c.setFont("Helvetica-Bold", 9.0)
    c.setFillColor(NAVY)
    c.drawString(MX + 666, yy2 - 10, "Billed")
    c.setFont("Helvetica", 8.4)
    c.setFillColor(D.MUTED)
    c.drawString(MX + 666, yy2 - 21, "40 on signature")
    c.drawString(MX + 666, yy2 - 32, "30 at design sign off")
    c.drawString(MX + 666, yy2 - 43, "30 on go live")

    note(c, "Fees are non refundable. Substitution of any named person is free. One "
            "reschedule of the programme is included. Third party costs, being the Google "
            "Play registration, hosting, WhatsApp message fees and the domain, are passed "
            "through at cost with no mark up.", y=74, size=8.6, leading=11.0)
    c.showPage()


# ------------------------------------------------------------- 18 the care ---
def s_care(c):
    chrome(c, "The fee")
    y = heading(c, "Keeping it running, after it is running.")
    y = para(c, "Software that takes money and holds customer records is not "
                "finished when it launches. Payment providers change their rules, "
                "browsers update, and the first three months of real customers will "
                "tell you things no amount of planning does.",
             MX, y - 10, "Helvetica", 12.5, BODY, 600, 17.5)

    # The headline figure as a band rather than a one row table, which would
    # paint a header stripe the full width and clip the caption behind it.
    box(c, MX, 332, W, 50, NAVY)
    c.setFillColor(GOLD)
    c.rect(MX, 332, 5, 50, fill=1, stroke=0)
    tracked(c, "PLATFORM CARE", MX + 22, 366, "Helvetica-Bold", 8.4, GOLD, 2.0)
    c.setFont(SERIF_B, 17)
    c.setFillColor(white)
    c.drawString(MX + 22, 344, "N1,800,000 a year")
    c.setFont("Helvetica", 11.0)
    c.setFillColor(D.LIGHT)
    c.drawRightString(PAGE_W - MX - 22, 350,
                      "N150,000 a month, billed monthly from go live")

    cw = (W - 24) / 2.0
    box(c, MX, 104, cw, 206, SURFACE, spine=TEAL)
    tracked(c, "WHAT IT COVERS", MX + 22, 286, "Helvetica-Bold", 8.4, TEAL, 2.0)
    yy = 262
    for t in ("Hosting, monitoring and backups, with the bill shown at cost",
              "Security patching and dependency updates",
              "Keeping the payment and WhatsApp integrations working when the "
              "provider changes something",
              "Fixing anything broken, inside one working day",
              "Two days a quarter of small changes, which is where most of the "
              "requests actually land"):
        c.setFillColor(GOLD)
        c.rect(MX + 22, yy + 3, 6, 2.6, fill=1, stroke=0)
        c.setFont("Helvetica", 10.2)
        c.setFillColor(BODY)
        for ln in wrap(c, t, "Helvetica", 10.2, cw - 62):
            c.drawString(MX + 36, yy, ln)
            yy -= 13.2
        yy -= 10

    box(c, MX + cw + 24, 104, cw, 206, D.CREAM, spine=GOLD)
    tracked(c, "WHAT IT DOES NOT", MX + cw + 46, 286, "Helvetica-Bold", 8.4, D.MUTED, 2.0)
    yy = 262
    for t in ("New features beyond the two days a quarter, which are quoted as days "
              "at the same rate card",
              "A native app, which is a separate decision and a separate fee",
              "Your own third party costs, being hosting beyond the included tier, "
              "WhatsApp message fees and payment processing",
              "Running the business. We keep the software working, you sell the boxes"):
        c.setFillColor(TEAL)
        c.rect(MX + cw + 46, yy + 3, 6, 2.6, fill=1, stroke=0)
        c.setFont("Helvetica", 10.2)
        c.setFillColor(BODY)
        for ln in wrap(c, t, "Helvetica", 10.2, cw - 62):
            c.drawString(MX + cw + 60, yy, ln)
            yy -= 13.2
        yy -= 10

    c.setFont(SERIF_B, 13)
    c.setFillColor(NAVY)
    c.drawString(MX, 74, "Year one, all in: N8,028,000. The build at N6,228,000 and the "
                         "first year of care at N1,800,000.")
    c.showPage()


# ------------------------------------------------------------- 19 what next ---
def s_next(c):
    c.setFillColor(DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    ring_stack(c, PAGE_W - 142, 202, 84, 18, RINGS_DARK)
    c.setFillColor(GOLD)
    c.rect(MX, PAGE_H - 62, 26, 3, fill=1, stroke=0)
    tracked(c, "WHAT HAPPENS NEXT", MX + 36, PAGE_H - 63, "Helvetica-Bold", 10.5,
            GOLD, 2.2)

    c.setFont(SERIF_B, 26)
    c.setFillColor(white)
    y = PAGE_H - 132
    for line in wrap(c, "Three things, and the first one is free.", SERIF_B, 26, 560):
        c.drawString(MX, y, line)
        y -= 33

    y = bullet_block(c, [
        ("Tell us the app question is settled.", "If you still want a native app "
         "first, say so and we will price that instead rather than talk you out "
         "of it."),
        ("Give us a morning on a site.", "We want to see a harvest planned and a "
         "box packed before we design anything. No charge, and nothing is owed "
         "after it."),
        ("Then we start.", "Signature and the first instalment, and week one begins "
         "on the Monday after."),
    ], MX, y - 18, 560, size=12.5, leading=17.4, gap=14,
        body_color=PAGE_LIGHT, tick=GOLD, lead_color=GOLD)

    box(c, MX, 92, 520, 62, D.IND2, spine=GOLD)
    c.setFont(SERIF_I, 13.5)
    c.setFillColor(white)
    c.drawString(MX + 22, 92 + 37, "You are not buying a website. You are buying the")
    c.drawString(MX + 22, 92 + 19, "ability to sell a harvest before you cut it.")

    c.setFont("Helvetica", 10.5)
    c.setFillColor(PAGE_LIGHT)
    c.drawString(MX, 62, "hello@consultforafrica.com   /   +234 913 813 8553   /   "
                         "consultforafrica.com   /   Lagos and Abuja")
    c.setFillColor(GOLD)
    c.rect(MX, 30, 20, 2, fill=1, stroke=0)
    c.setFont("Helvetica", 8)
    c.setFillColor(D.LIGHT)
    c.drawString(MX, 19, D.FOOTER[0])
    c.drawRightString(PAGE_W - MX, 19, "22 / 22")
    c.showPage()


# ------------------------------------------------------- 03 the graveyard ----
def s_graveyard(c):
    chrome(c, "Before anything else")
    y = heading(c, "Everybody who has tried this in Lagos with their own "
                   "warehouse and their own fleet has closed.")
    y = para(c, "This is not a reason to stop. It is the reason the software has "
                "to be scoped the way it is below, and the reason we will argue "
                "against building you half of Chowdeck.",
             MX, y - 10, "Helvetica", 12.3, BODY, 620, 17.0)

    rows = [
        ["Who", "What they built", "What happened"],
        ["GoLemon", "Founded by people from Paystack. Direct farmer sourcing, their "
         "own warehouse, their own technology, their own riders.",
         "Stopped taking orders on 29 July 2026, after about 28 months. They had "
         "done N2bn of sales across 57,000 orders to 40,000 registered customers, "
         "at an average basket of N43,700. The orders made money. Eighty a day "
         "never covered the warehouse, the engineers and the fleet underneath them."],
        ["Jumia Food", "Restaurant and grocery delivery at national scale, inside "
         "the largest e commerce business on the continent.",
         "Closed in December 2023 across Nigeria and six other markets. Reported to "
         "have lost about one dollar ninety on every ten dollars ordered."],
        ["Fresh Direct Nigeria", "Container farm hydroponics in Abuja and Lagos, "
         "sold on an organic premium. The closest thing to your model anybody has run.",
         "Closed. It is the comparator a sceptical investor will raise, so it is "
         "better that you raise it first."],
        ["Bolt Food", "A funded international operator with a rider network already "
         "in place.", "Exited Nigeria in December 2023."],
        ["FoodCourt", "Cloud kitchens in Lekki, Obanikoro and Abuja, backed by Y "
         "Combinator.", "Paused operations in 2026 after unpaid salaries."],
    ]
    simple_table(c, rows, MX, y - 16, [104, 268, 362], size=9.3, leading=11.9, pad=7)

    callout(c, MX, 104, W, "None of them died of weak demand. They died carrying a "
                           "fixed cost the order book could not reach. You already own "
                           "the farm, the produce and the margin. The software must not "
                           "put a second fixed cost business on top of it.",
            bg=D.CREAM, spine=GOLD, fg=INK, size=12.0)
    c.showPage()


# --------------------------------------------------------- 04 your advantage --
def s_edge(c):
    chrome(c, "Why you are different from all of them")
    y = heading(c, "You are the only one in that list who was not buying from "
                   "Mile 12.", max_w=700)
    y = para(c, "Everybody on the previous page bought produce somebody else grew, "
                "through a chain that loses about half of it on the way. You grow it, "
                "you cut it, and it can be in a box the same morning.",
             MX, y - 10, "Helvetica", 12.3, BODY, 700, 17.0)

    stats = [
        ("About half", "of Nigeria's fresh produce is lost between harvest and "
         "plate, on USAID's estimate. Tomatoes run 45 to 60 per cent, leafy "
         "vegetables 40 to 50."),
        ("46 per cent", "the average premium Nigerian consumers said they would pay "
         "for organic leafy vegetables in a published survey, with 84.5 per cent "
         "willing to pay something above the market price."),
        ("N120k to N300k", "what an upper middle or expatriate Lagos household "
         "budgets for groceries in a month. Fifty two boxes a year at your price "
         "is a share of that, not a stretch beyond it."),
        ("N8,000 a week", "what SwanCape Farms currently charges for a weekly veg "
         "box in Lagos, ordered over WhatsApp. That is the live price in the market, "
         "and it is the number your pricing argues against."),
    ]
    cw = (W - 3 * 16) / 4.0
    x = MX
    for big, small in stats:
        box(c, x, 192, cw, 190, SURFACE, spine=TEAL)
        c.setFont(SERIF_B, 20)
        c.setFillColor(INK)
        ty = 352
        for ln in wrap(c, big, SERIF_B, 20, cw - 36):
            c.drawString(x + 18, ty, ln)
            ty -= 24
        c.setFont("Helvetica", 9.8)
        c.setFillColor(BODY)
        ty -= 6
        for ln in wrap(c, small, "Helvetica", 9.8, cw - 36):
            c.drawString(x + 18, ty, ln)
            ty -= 13
        x += cw + 16

    callout(c, MX, 172, W, "The ceiling is worth saying out loud. Around seven in ten "
                           "naira of Nigerian food retail still goes through open air "
                           "markets and roughly three per cent through supermarkets. "
                           "This is a narrow premium segment that can be won, and it is "
                           "not a mass market.")
    note(c, "Sources: USAID via Nairametrics, April 2024. Published Nigerian survey on "
            "organic leafy vegetables. USDA Foreign Agricultural Service, Lagos 2024. "
            "SwanCape Farms published price, October 2026.", y=46)
    c.showPage()


# ------------------------------------------------------- 20 claims and law ---
def s_claims(c):
    chrome(c, "Two things a developer will not tell you")
    y = heading(c, "What you may call it, and what you must register.")

    rows = [
        ["The question", "The answer", "What we build or do about it"],
        ["Can we call it organic?",
         "Nigeria has no statutory organic regime, so nobody can stop you and "
         "nobody is standing behind you either. The voluntary route is the Nigeria "
         "Organic Agriculture Standard, run by NOAN out of Ibadan on a participatory "
         "guarantee system, and NOAN is an IFOAM affiliate.",
         "We would put the certification mark and the method on the product pages "
         "and on the box, because the claim is worth more when it is backed. Worth "
         "pursuing as a trust asset, not as compliance."],
        ["Does NAFDAC regulate our box?",
         "It depends on how you pack it rather than on what you are. Whole, "
         "unwashed produce sits with agricultural quarantine and outside NAFDAC "
         "registration. The moment a line is cut, washed and bagged, or composed "
         "with anything else, NAFDAC's 2019 pre packaged food labelling rules apply.",
         "A flag on every line in the data model for whether it is raw and whole or "
         "prepared, driving the label the packhouse prints. One field, set once, "
         "and you never have to think about it again."],
        ["What does holding customer data commit us to?",
         "Past 200 customers in six months you are a data controller of major "
         "importance under the Nigeria Data Protection Act and its 2025 directive. "
         "That means registering with the NDPC, naming a data protection officer, "
         "running an impact assessment, and reporting a breach inside 72 hours. The "
         "NDPC issued compliance notices to 1,368 organisations in August 2025.",
         "Consent capture, an export and delete path for a customer who asks, and "
         "the audit log, built in rather than retrofitted. Registration at your tier "
         "costs ten thousand naira and we would do it during the build."],
        ["Are we liable for card data?",
         "Only if you hold it, and you should not. The CBN makes PCI DSS mandatory "
         "for anyone storing cardholder information.",
         "We store the payment provider's token and never a card number, which "
         "keeps you outside that regime entirely."],
    ]
    simple_table(c, rows, MX, y - 16, [152, 328, 254], size=9.1, leading=11.6, pad=7)
    callout(c, MX, 128, W, "One more that is about to matter. NIPOST launched a digital "
                           "postcode system on 1 October 2026, aimed at the fifty to eighty "
                           "billion naira a year the country loses to deliveries that never "
                           "arrive. We would build the address capture to accept it when it "
                           "becomes usable, and to work perfectly well without it.")
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("%s: direct to customer platform" % CLIENT)
    c.setAuthor("Consult for Africa")
    cover(c)
    for fn in (s_answer, s_graveyard, s_edge, s_market, s_isanapp, s_nativewins,
               s_later, s_constraint, s_parts, s_mock_customer, s_mock_subs,
               s_mock_console, s_mock_delivery, s_mock_admin, s_wrong, s_claims,
               s_plan, s_own, s_fee, s_care):
        fn(c)
    s_next(c)
    c.save()
    print("wrote", OUT)
    SHARE.write_bytes(OUT.read_bytes())
    print("wrote", SHARE)


if __name__ == "__main__":
    build()
