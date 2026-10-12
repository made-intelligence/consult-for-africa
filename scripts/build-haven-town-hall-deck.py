"""
Haven Paediatric Centre: the staff town hall deck.

Audience is all nineteen staff, and the deck is emailed to them afterwards, so
every word in it is a permanent record sitting in nineteen personal inboxes.
That governs the content:

  - the May 2026 matter is not referred to, in any form
  - no money anywhere: not the fee, not the revenue, not the receivables, not
    the targets. Staff hear figures as a conversation about their salary
  - no promises about jobs or pay. Routine lab work is going to a reference
    partner and the hospital has one lab scientist, so "nobody is losing their
    job" is a sentence we cannot write
  - Dr Gbadebo is not named and the words head of operations are not used.
    Benedict Ijehon already holds admin, operations and business development
  - the findings are about systems and forms, never about people

Run:
  python3 scripts/build-haven-town-hall-deck.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from reportlab.lib.colors import white             # noqa: E402
from reportlab.lib.pagesizes import A4, landscape  # noqa: E402
from reportlab.pdfgen import canvas                # noqa: E402
from reportlab.lib.utils import ImageReader        # noqa: E402

import cfa_deck as D                               # noqa: E402
from cfa_deck import (                             # noqa: E402
    BODY, CREAM, DOCS, GOLD, INK, MX, NAVY, PAGE_H, PAGE_W, SURFACE,
    SERIF_B, SERIF_I, TEAL,
    bullet_block, callout, chrome, heading, para,
    simple_table, tracked, wrap,
)

OUT = ROOT / "docs" / "haven-town-hall-deck-cfa.pdf"

D.FOOTER[0] = "Consult for Africa   /   Haven Paediatric Centre   /   Staff town hall"
D.TOTAL[0] = "10"

W = PAGE_W - 2 * MX
PANEL_W = 240


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
    # No chevron stack. Debo's call: the V lines are off the cover. The gold
    # dash that used to anchor them went with them, since on its own it reads
    # as a stray mark rather than as the foot of anything.

    try:
        _lg = ImageReader(str(DOCS / "c4a-logo.png"))
        _lw, _lh = _lg.getSize()
        _h = 32.0
        c.drawImage(_lg, MX, PAGE_H - 94, width=_h * _lw / _lh, height=_h, mask="auto")
    except Exception:
        pass

    c.setFillColor(GOLD)
    c.rect(MX, 424, 44, 3, fill=1, stroke=0)
    tracked(c, "HAVEN PAEDIATRIC CENTRE", MX, 398, "Helvetica-Bold", 10.5, TEAL, 2.6)

    c.setFont(SERIF_B, 34)
    c.setFillColor(INK)
    y = 344
    for line in wrap(c, "Building the systems under a hospital that already works",
                     SERIF_B, 34, 520):
        c.drawString(MX, y, line)
        y -= 42

    c.setFont(SERIF_I, 15)
    c.setFillColor(D.MUTED)
    y -= 2
    for line in wrap(c, "A conversation with the whole team about what changes, and "
                        "what it means on your shift.", SERIF_I, 15, 500):
        c.drawString(MX, y, line)
        y -= 21

    c.setStrokeColor(D.RULE)
    c.setLineWidth(0.9)
    c.line(MX, 182, px - 26, 182)
    for dx, label, value in [(0, "FOR", "Everyone at Haven"),
                             (190, "FROM", "Dr Debo Odulana, Consult for Africa"),
                             (430, "DATE", "October 2026")]:
        tracked(c, label, MX + dx, 160, "Helvetica-Bold", 8.0, TEAL, 1.9)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(NAVY)
        c.drawString(MX + dx, 138, value)
    c.showPage()


def s_you_said(c):
    chrome(c, "You said it, not us")
    y = heading(c, "Sixteen of seventeen of you rated the safety of care here very good or excellent.")
    y = para(c, "That came from the anonymous survey, where you could have said anything "
                "at all and nobody would have known who said it. Seventeen of you "
                "answered, out of a team of nineteen, which is a response rate most "
                "hospitals never see.",
             MX, y - 20, "Helvetica", 12.5, BODY, W - 300, 18)
    y = para(c, "We have worked with a lot of hospitals. A result like that is rare, and "
                "it is not luck. The hardest part of building a hospital, a team that "
                "genuinely cares, is already done here, and it was done by the people in "
                "this room before any of us arrived.",
             MX, y - 12, "Helvetica", 12.5, BODY, W - 300, 18)
    callout(c, PAGE_W - MX - 270, PAGE_H - 160, 270,
            "This is the thing we most want to protect. Everything else in a hospital can "
            "be rebuilt. That cannot, not quickly.",
            bg=CREAM, spine=GOLD, size=12, leading=16.5)
    c.showPage()


def s_why(c):
    chrome(c, "Why we are here")
    y = heading(c, "A good young hospital, growing faster than its systems were built for.")
    y = para(c, "Haven is a little over a year old. It has a real reputation and it is "
                "getting busier. What we are here to do is put proper systems underneath a "
                "hospital that has so far been held together by people caring enough to "
                "make it work anyway.",
             MX, y - 20, "Helvetica", 12.5, BODY, W, 18)
    y = bullet_block(c, [
        ("", "This is not a criticism of anyone. It is what happens in every young "
             "hospital that is any good."),
        ("", "The hospitals that skip this part are the ones that stop being good the "
             "moment they get busy."),
        ("", "Culture is the multiplier. Everything we build works better because of "
             "what you already have."),
    ], MX, y - 24, W - 40)
    callout(c, MX, y - 24, W,
            "We diagnose a system. We never diagnose a person. Nothing we have found is "
            "about anybody's performance, and nothing we do will be.",
            bg=SURFACE, spine=TEAL, size=12, leading=16.5)
    c.showPage()


def s_found(c):
    chrome(c, "What we found")
    y = heading(c, "Three things, and all three are about forms and systems.")
    rows = [
        ["What we found", "What it looks like to you", "What we are doing"],
        ["Work gets done and not written down properly, and the records do not always "
         "agree with each other",
         "Writing the same thing in three places, and still being asked for it again",
         "Rebuilding how work is recorded, so it is captured once"],
        ["Stock runs out because there is no system telling anyone to reorder",
         "Reaching for something and the shelf is empty",
         "Proper reorder levels, and a supplier arrangement that keeps the shelf full"],
        ["The procedures exist and are good, but almost nobody has been trained on them "
         "and nobody checks",
         "Being told off for doing it the way you were taught",
         "Training them out properly, with you, and then checking"],
    ]
    y = simple_table(c, rows, MX, y - 22, [250, 250, W - 500], size=10.8, leading=14, pad=8)
    callout(c, MX, y - 16, W,
            "If you were never shown it, you cannot be held to it. That is the finding, "
            "and it points at the people running the place rather than at anybody here.",
            bg=CREAM, spine=GOLD, size=11.8, leading=16)
    c.showPage()


def s_shift(c):
    chrome(c, "What changes on your shift")
    y = heading(c, "The test of all of this is whether your Tuesday gets easier.")
    rows = [
        ["What changes", "What it means for you"],
        ["Standards of work, written with the people who do the work",
         "You stop being blamed for doing it the way you were taught"],
        ["Stock and reordering fixed", "The drug is on the shelf when you reach for it"],
        ["The rota published four weeks ahead", "You can plan your life"],
        ["A proper handover and a short daily huddle",
         "You find out what happened before you walk into it"],
        ["Recording and billing rebuilt", "Less paperwork chasing, not more"],
        ["Job descriptions and targets reworked",
         "What good looks like is written down, and it rewards care rather than activity"],
    ]
    y = simple_table(c, rows, MX, y - 22, [330, W - 330], size=11.2, leading=14.5, pad=9)
    c.showPage()


def s_people(c):
    chrome(c, "The people work")
    y = heading(c, "Most of what we are doing is about how this place works as a team.")
    y = para(c, "The strongest thing Haven has is its people, so the biggest part of this "
                "work is about keeping that true as the hospital grows.",
             MX, y - 18, "Helvetica", 12.5, BODY, W, 18)
    cols = [
        ("Standards", "Written down with you, one page each, kept where the work happens. "
                      "We will start by asking you to show us how you do it now."),
        ("Development", "Structured induction for new people, training that is planned "
                        "rather than improvised, and colleagues teaching colleagues."),
        ("Recognition", "The person who catches a near miss, or holds a difficult shift "
                        "together, gets named for it. That costs nothing and it matters."),
    ]
    gap = 18
    bw = (W - 2 * gap) / 3.0
    top = y - 26
    for i, (t, bodytxt) in enumerate(cols):
        x = MX + i * (bw + gap)
        c.setFillColor(SURFACE)
        c.rect(x, top - 168, bw, 168, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(x, top - 4, bw, 4, fill=1, stroke=0)
        tracked(c, t.upper(), x + 16, top - 32, "Helvetica-Bold", 10, TEAL, 2.2)
        para(c, bodytxt, x + 16, top - 56, "Helvetica", 11.2, BODY, bw - 32, 15.5)
    c.showPage()


def s_season(c):
    chrome(c, "The season")
    y = heading(c, "November to February is the busiest time of your year.")
    y = para(c, "Everything we are doing now is so that you go into that season with the "
                "stock, the rota and the standards already in place, rather than finding "
                "out in December that they are not.",
             MX, y - 20, "Helvetica", 12.5, BODY, W - 300, 18)
    y = para(c, "The pace over the next few weeks is not pressure on you. It is the work "
                "we have to finish before the hospital gets busy, so that when it does, "
                "the system carries some of the weight you have been carrying yourselves.",
             MX, y - 12, "Helvetica", 12.5, BODY, W - 300, 18)
    callout(c, PAGE_W - MX - 270, PAGE_H - 160, 270,
            "Tired people are short with each other. The season is exactly when the thing "
            "we are protecting is most at risk.",
            bg=CREAM, spine=GOLD, size=12, leading=16.5)
    c.showPage()


def s_wont(c):
    chrome(c, "What we will not do")
    y = heading(c, "Worth saying plainly, because people always wonder.")
    y = bullet_block(c, [
        ("", "We are not here to find someone to blame. We diagnose systems, never "
             "people, and nothing we have found is about anybody's performance."),
        ("", "We are not going to make you reconstruct records to make us comfortable. "
             "Partial or messy records are themselves a finding. Give us what exists."),
        ("", "We will not change how you work without asking you first how you work "
             "now. That is the order, every time."),
        ("", "Anything you tell us in confidence stays that way. Where we assess anyone "
             "individually, the result belongs to that person and goes to nobody else."),
    ], MX, y - 24, W - 40)
    c.showPage()


def s_ask(c):
    chrome(c, "What we ask of you")
    y = heading(c, "One thing. Tell us when something nearly went wrong.")
    y = para(c, "Not so that anybody gets into trouble. A near miss is the cheapest lesson "
                "a hospital ever gets, and the hospitals that learn from them are the ones "
                "that stay safe when they get busy.",
             MX, y - 20, "Helvetica", 12.5, BODY, W, 18)
    y = para(c, "If reporting one ever costs somebody here anything, that is a failure of "
                "ours and we want to hear about it directly.",
             MX, y - 12, "Helvetica", 12.5, BODY, W, 18)
    callout(c, MX, y - 24, W,
            "The second thing, if you will give us it: tell us what is broken. You know "
            "where this hospital leaks time and effort better than anybody who arrives "
            "with a clipboard.",
            bg=SURFACE, spine=TEAL, size=12, leading=16.5)
    c.showPage()


def s_close(c):
    c.setFillColor(D.DEEP_NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 6, PAGE_W, 6, fill=1, stroke=0)

    c.setFont(SERIF_B, 30)
    c.setFillColor(white)
    y = PAGE_H - 190
    for line in wrap(c, "You built the part that cannot be bought.", SERIF_B, 30, W - 200):
        c.drawString(MX, y, line)
        y -= 38

    c.setFont(SERIF_I, 15.5)
    c.setFillColor(D.LIGHT)
    y -= 10
    for line in wrap(c, "We are here to build the part that can, so that the thing you "
                        "built survives this hospital getting bigger.", SERIF_I, 15.5, W - 240):
        c.drawString(MX, y, line)
        y -= 23

    c.setFillColor(GOLD)
    c.rect(MX, y - 26, 44, 3, fill=1, stroke=0)

    c.setFont("Helvetica", 11)
    c.setFillColor(D.LIGHT)
    c.drawString(MX, y - 72, "Tell us what is broken. We will be in the building.")

    c.setFont("Helvetica", 9.5)
    c.setFillColor(D.LIGHT)
    c.drawString(MX, 96, "Dr Debo Odulana, Founding Partner, Consult for Africa")
    c.drawString(MX, 80, "hello@consultforafrica.com   /   +234 913 813 8553")

    c.setFont("Helvetica", 8)
    c.drawRightString(PAGE_W - MX, 19, "10 / 10")
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("Haven Paediatric Centre: Staff Town Hall")
    c.setAuthor("Consult for Africa")
    cover(c)
    for fn in (s_you_said, s_why, s_found, s_shift, s_people, s_season, s_wont, s_ask):
        fn(c)
    s_close(c)
    c.save()
    print("wrote", OUT)


if __name__ == "__main__":
    build()
