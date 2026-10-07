"""
Build the Lyfe Plastics and Dermatology creative set.

Outputs into docs/lyfe-creative/:

  Social, PNG, ready to post
    lyfe-feed-01..05.png     1080 x 1350, the 4:5 Instagram feed format
    lyfe-story-01..03.png    1080 x 1920, Story, Reel cover and WhatsApp Status

  Print, PDF, ready to send to a printer
    lyfe-flyer-a5.pdf        Salon and studio counters
    lyfe-invitation-a5.pdf   The evening, printed and hand delivered
    lyfe-card-a6.pdf         Handed over at clubs, dinners and events
    lyfe-referrer-a4.pdf     The one page scope sheet for referring doctors

WHY THE CREATIVE LOOKS LIKE THIS

The MDCN Code of Medical Ethics, Part F, Rules 54, 55 and 57, makes
self advertisement by a practitioner a disciplinary offence, forbids canvassing
and touting, and bans promotional gift items by name. What it expressly permits
is public health education. So none of this sells a surgeon. It teaches, and
the booking route sits with the clinic.

That is also, conveniently, the highest trust creative available for a
risk averse woman in her forties, which is who these are for.

Everything else here traces to something measured. One message dominates and
each level of hierarchy is at least 1.6 times the one below it. There is one
offer per asset. The QR codes carry a logo and a written call to action,
which is documented to lift scans by up to 80 per cent over a plain black
square, although passive print placements still only scan at 1 to 5 per cent,
so no funnel is built on them. Every asset terminates in a WhatsApp click to
chat, because WhatsApp reaches over 95 per cent of Nigerian internet users and
click to message converts several times better than click to form.

No before and after imagery anywhere, on any asset, in any format.

Run:
  python3 scripts/build-lyfe-creative.py
  python3 scripts/build-lyfe-creative.py --url https://lyfeplastics.com
"""

from __future__ import annotations

import argparse
from pathlib import Path
from urllib.parse import quote

import qrcode
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, A5, A6
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as canvaslib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "lyfe-creative"

# ---------------------------------------------------------------- the brand
# Matches lib/lyfe.ts exactly. If one moves the other has to move with it.
INK = "#15161A"
INK_SOFT = "#2A2C33"
BODY = "#4A4D56"
MUTED = "#83868F"
GROUND = "#FAF7F2"
GROUND_WARM = "#F3EDE4"
LINE = "#E4DCD0"
BRONZE = "#A87B4F"
BRONZE_DEEP = "#7C5833"
BRONZE_TINT = "#F2E8DA"
GREEN = "#2F5248"
PAPER = "#FFFFFF"

DISPLAY = "/System/Library/Fonts/Supplemental/Didot.ttc"
DISPLAY_I = 0
DISPLAY_B_I = 2
SANS = "/System/Library/Fonts/HelveticaNeue.ttc"
SANS_I = 0
SANS_B_I = 1

WHATSAPP_NUMBER = "2349138138553"
PHONE_DISPLAY = "+234 913 813 8553"
# No default. consultforafrica.com/lyfe is where the page happens to sit today,
# but printing a management consultancy's domain on a plastic surgery practice's
# card tells a referring doctor something nobody wants to explain. Until the
# brand has its own domain the assets carry the telephone number and the QR and
# nothing else, which is the honest answer and also the better one.
DEFAULT_URL = None
WA_MESSAGE = "Hello, I would like to ask about a consultation."

# Prices are not shown on any public asset. Kept here only because the
# education pieces talk about cost as a subject without naming a figure.
CONSULT_FEE = None

# The evening. Date and venue move, so they are arguments rather than copy.
EVENT_NAME = "Medlyfe Wellness and Longevity Centre"
EVENT_THEME = "Feel Good, Look Good, Live Better."
EVENT_DATE = "Wednesday 21 October"
EVENT_TIME = "Cocktails 6.30pm"
EVENT_DRESS = "RSVP by 16 October"
EVENT_VENUE = "Capital Club, Lagos"
RSVP_MESSAGE = "Hello, I would like to RSVP to the evening."
CALL_MESSAGE = "Hello, I would like to book a discovery call."


def wa_link(message: str = WA_MESSAGE) -> str:
    return "https://wa.me/%s?text=%s" % (WHATSAPP_NUMBER, quote(message))


# ---------------------------------------------------------------- the words
#
# Five education pieces. Each one is a real answer to a real question, which is
# what makes it permissible under the Council's rules and what makes it worth
# reading. The practice name and the booking route sit at the bottom, small.

FEED = [
    {
        "kicker": "BEFORE YOU BOOK",
        "head": "Five questions to ask\nbefore anybody\ntreats your face",
        "items": [
            "Who exactly will be holding the needle, and are they registered?",
            "What happens if something goes wrong, and who do I call at two in the morning?",
            "What are you not going to do, and why not?",
            "What does the price include, and what does it not include?",
            "What happens if I change my mind?",
        ],
        "foot": "A practice that answers all five without hesitating is the one to use.",
        "theme": "dark",
    },
    {
        "kicker": "BEFORE YOU BOOK",
        "head": "How to check that\na surgeon is\nactually certified",
        "items": [
            "Ask which board certified them, and in which country. Both halves matter.",
            "Ask to see the registration of whoever will treat you, not only the famous name.",
            "A surgeon trained abroad should be able to tell you their registration status here without pausing.",
            "Certification is a fact, not an opinion. Anyone reluctant to state it is telling you something.",
        ],
        "foot": "You are allowed to ask. Anyone offended by the question has answered it.",
        "theme": "light",
    },
    {
        "kicker": "BEFORE YOU BOOK",
        "head": "What a proper\nconsultation\nfeels like",
        "items": [
            "Somebody examines you, rather than looking at a photograph on a phone.",
            "Somebody asks about your health, not only about your goals.",
            "Somebody tells you plainly what will not work.",
            "You leave with a written plan and a written price.",
            "Nobody asks you to pay a deposit on the day to hold a discount.",
        ],
        "foot": "If it felt like being sold to, it was not a consultation.",
        "theme": "light",
    },
    {
        "kicker": "OUR RULES",
        "head": "Six things\nwe will\nnot do",
        "items": [
            "We will not tell you on the telephone that you are a good candidate.",
            "We will not promise you a result, a size, or a date you will be back at work.",
            "We will not quote you a price and then change it.",
            "We will not treat anybody who has not had a consultation.",
            "We will not let a coordinator answer a medical question.",
            "We will not pay anybody to send you to us.",
        ],
        "foot": "That last one is a rule of the profession. A great many people break it.",
        "theme": "dark",
    },
    {
        "kicker": "AFTER THE OPERATION",
        "head": "The surgery is\nnot the hard part.\nGetting better is.",
        "items": [
            "Recovery is where most of what goes wrong, goes wrong. Usually because somebody was alone and did not know who to call.",
            "Ask who is responsible for your recovery, by name, before you agree to anything.",
            "Ask for a number that is answered at night and at the weekend, and ask what happens if you need more than the clinic can give.",
            "Ask what is included and what arrives as a separate bill afterwards. Garments, dressings, medication, review appointments, somewhere to stay.",
        ],
        "foot": "A practice that has thought about your recovery will have answers ready. One that has not will improvise.",
        "theme": "light",
    },
    {
        "kicker": "AN INVITATION",
        "head": "You are\ninvited",
        "items": [
            "An introduction to what Medlyfe has built across wellness and aesthetics.",
            "A conversation about how wellbeing, longevity, confidence and appearance connect.",
            "Dr Chinwe Kpaduwa, MD FACS, on The Art of Looking Like Yourself.",
            "The services, what each is for, and what to expect when you visit.",
            EVENT_DATE + ". " + EVENT_TIME + ". " + EVENT_VENUE + ". " + EVENT_DRESS + ".",
        ],
        "foot": "\u201C" + EVENT_THEME + "\u201D. By invitation, and numbers are limited. Message us to RSVP and the address follows.",
        "theme": "dark",
    },
]

STORIES = [
    {
        "head": "You are\ninvited.",
        "sub": EVENT_THEME + ". " + EVENT_DATE + ", " + EVENT_TIME.lower() + ". " + EVENT_VENUE + ". " + EVENT_DRESS + ".",
        "cta": "Tap to RSVP",
        "theme": "dark",
        "wa": RSVP_MESSAGE,
    },
    {
        "head": "Fifteen minutes\non the phone.\nNo charge,\nno obligation.",
        "sub": "A coordinator listens, tells you honestly whether we are the right place, and explains what a consultation would involve.",
        "cta": "Tap to book a call",
        "theme": "light",
        "wa": CALL_MESSAGE,
    },
    {
        "head": "Look rested.\nNot rearranged.",
        "sub": "Aesthetic care in Lagos, by clinicians who will tell you when the honest answer is no.",
        "cta": "Tap to ask a question",
        "theme": "dark",
    },
    {
        "head": "Five questions\nto ask before\nanybody treats\nyour face.",
        "sub": "The list is on our page. It is useful even if you never come to us.",
        "cta": "Tap to read it",
        "theme": "light",
    },
    {
        "head": "A written plan.\nA written price.\nBefore anything\nis booked.",
        "sub": "You are examined, you are told what is realistic, and nothing changes afterwards without your written agreement.",
        "cta": "Tap to ask",
        "theme": "dark",
    },
]


# ------------------------------------------------------------------ helpers

def font(path: str, index: int, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size, index=index)


def text_w(draw: ImageDraw.ImageDraw, s: str, f: ImageFont.FreeTypeFont) -> int:
    return int(draw.textbbox((0, 0), s, font=f)[2])


def wrap(draw: ImageDraw.ImageDraw, s: str, f: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words, lines, cur = s.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_w(draw, trial, f) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def tracked(draw: ImageDraw.ImageDraw, xy, s: str, f, fill, track: int = 6):
    """Letterspaced caps. The small label at the top of every asset."""
    x, y = xy
    for ch in s:
        draw.text((x, y), ch, font=f, fill=fill)
        x += text_w(draw, ch, f) + track
    return x


def branded_qr(target: str, size: int, fg: str = INK, bg: str = PAPER) -> Image.Image:
    """
    A QR with the mark knocked into the middle. High error correction so the
    centre can be covered without breaking the code, which is the whole reason
    branded codes are allowed to exist.
    """
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=1)
    qr.add_data(target)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fg, back_color=bg).convert("RGB").resize((size, size), Image.LANCZOS)

    patch = int(size * 0.26)
    box = Image.new("RGB", (patch, patch), bg)
    d = ImageDraw.Draw(box)
    f = font(DISPLAY, DISPLAY_B_I, int(patch * 0.52))
    label = "L"
    w = text_w(d, label, f)
    bbox = d.textbbox((0, 0), label, font=f)
    d.text(((patch - w) / 2, (patch - (bbox[3] - bbox[1])) / 2 - bbox[1]), label, font=f, fill=BRONZE)
    img.paste(box, ((size - patch) // 2, (size - patch) // 2))
    return img


def wordmark(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1.0, on=INK, sub=BRONZE):
    f1 = font(DISPLAY, DISPLAY_I, int(54 * scale))
    draw.text((x, y), "Lyfe", font=f1, fill=on)
    f2 = font(SANS, SANS_B_I, int(15 * scale))
    tracked(draw, (x + 2, y + int(70 * scale)), "PLASTICS AND DERMATOLOGY", f2, sub, track=int(4 * scale))


# ------------------------------------------------------------- social, feed

def build_feed(url: str):
    """1080 x 1350. The 4:5 portrait format, which is the strongest feed unit."""
    W, H = 1080, 1350
    M = 84

    for n, spec in enumerate(FEED, start=1):
        dark = spec["theme"] == "dark"
        bg = INK if dark else GROUND
        head_c = PAPER if dark else INK
        body_c = "#C9C3B9" if dark else BODY
        rule_c = BRONZE
        foot_c = "#8B8780" if dark else MUTED

        img = Image.new("RGB", (W, H), bg)
        d = ImageDraw.Draw(img)

        # kicker
        f_k = font(SANS, SANS_B_I, 20)
        tracked(d, (M, M), spec["kicker"], f_k, BRONZE if dark else BRONZE_DEEP, track=7)

        # The one dominant message. Manual line breaks are honoured, but every
        # segment is wrapped to the column as well, because a headline that
        # runs off the right edge is the one mistake this format cannot
        # survive. Shrinks a step at a time until it fits the space it has.
        head_size = 82
        while True:
            f_h = font(DISPLAY, DISPLAY_I, head_size)
            head_lines = []
            for seg in spec["head"].split("\n"):
                head_lines.extend(wrap(d, seg, f_h, W - 2 * M))
            if len(head_lines) <= 4 or head_size <= 54:
                break
            head_size -= 6
        lead = int(head_size * 1.12)
        y = M + 74
        for line in head_lines:
            d.text((M, y), line, font=f_h, fill=head_c)
            y += lead

        y += 26
        d.rectangle([M, y, M + 76, y + 4], fill=rule_c)
        y += 48

        # the items, each one numbered so the eye has a path
        f_n = font(SANS, SANS_B_I, 24)
        f_b = font(SANS, SANS_I, 31)
        for i, item in enumerate(spec["items"], start=1):
            d.text((M, y + 3), str(i).zfill(2), font=f_n, fill=rule_c)
            lines = wrap(d, item, f_b, W - 2 * M - 62)
            ty = y
            for ln in lines:
                d.text((M + 62, ty), ln, font=f_b, fill=body_c)
                ty += 42
            y = ty + 24

        # The foot, then the rule, then the route in. Measured rather than
        # pinned, because a two line foot used to sit on top of the hairline.
        rule_y = H - M - 108
        f_f = font(DISPLAY, DISPLAY_I + 1, 30)
        foot_lines = wrap(d, spec["foot"], f_f, W - 2 * M)
        fy = rule_y - 34 - 40 * len(foot_lines)
        for ln in foot_lines:
            d.text((M, fy), ln, font=f_f, fill=foot_c)
            fy += 40

        d.rectangle([M, rule_y, W - M, rule_y + 1], fill=LINE if not dark else "#2E3038")
        wordmark(d, M, rule_y + 22, scale=0.72, on=head_c, sub=BRONZE)
        f_c = font(SANS, SANS_I, 23)
        cta = "WhatsApp " + PHONE_DISPLAY
        d.text((W - M - text_w(d, cta, f_c), rule_y + 56), cta, font=f_c, fill=body_c)

        img.save(OUT / f"lyfe-feed-{n:02d}.png", "PNG", optimize=True)
        print("  lyfe-feed-%02d.png" % n)


# ------------------------------------------------------------ social, story

def build_stories(url: str):
    """
    1080 x 1920, with everything held inside the safe zone. Instagram covers
    roughly the top and bottom 250 pixels with its own chrome, and WhatsApp
    Status does something similar, so the same master serves both only if
    nothing important goes near the edges.
    """
    W, H = 1080, 1920
    SAFE_TOP, SAFE_BOTTOM = 300, 330
    M = 90

    for n, spec in enumerate(STORIES, start=1):
        dark = spec["theme"] == "dark"
        bg = INK if dark else GROUND
        head_c = PAPER if dark else INK
        body_c = "#C9C3B9" if dark else BODY

        img = Image.new("RGB", (W, H), bg)
        d = ImageDraw.Draw(img)

        wordmark(d, M, SAFE_TOP - 130, scale=0.78, on=head_c, sub=BRONZE)

        # The block is optically centred in the safe area rather than pinned to
        # the top, which is what left a dead band through the middle before.
        f_s = font(SANS, SANS_I, 36)
        head_size = 96
        while True:
            f_h = font(DISPLAY, DISPLAY_I, head_size)
            head_lines = []
            for seg in spec["head"].split("\n"):
                head_lines.extend(wrap(d, seg, f_h, W - 2 * M))
            if len(head_lines) <= 5 or head_size <= 62:
                break
            head_size -= 6
        head_lead = int(head_size * 1.17)
        sub_lines = wrap(d, spec["sub"], f_s, W - 2 * M)
        block_h = head_lead * len(head_lines) + 30 + 5 + 56 + 50 * len(sub_lines)
        qr_px = 240
        cta_h = qr_px + 70
        avail = (H - SAFE_BOTTOM) - SAFE_TOP
        y = SAFE_TOP + max(40, (avail - block_h - cta_h) // 2)

        for line in head_lines:
            d.text((M, y), line, font=f_h, fill=head_c)
            y += head_lead

        y += 30
        d.rectangle([M, y, M + 84, y + 5], fill=BRONZE)
        y += 56

        for ln in sub_lines:
            d.text((M, y), ln, font=f_s, fill=body_c)
            y += 50

        # One call to action, low in the safe zone where a thumb already is.
        qr = branded_qr(wa_link(spec.get("wa", WA_MESSAGE)), qr_px, fg=INK, bg=PAPER)
        qy = H - SAFE_BOTTOM - qr_px
        img.paste(qr, (M, qy))

        f_c = font(SANS, SANS_B_I, 40)
        d.text((M + 290, qy + 54), spec["cta"], font=f_c, fill=head_c)
        f_p = font(SANS, SANS_I, 30)
        d.text((M + 290, qy + 112), "or scan, or message", font=f_p, fill=body_c)
        d.text((M + 290, qy + 152), PHONE_DISPLAY, font=f_p, fill=BRONZE)

        img.save(OUT / f"lyfe-story-{n:02d}.png", "PNG", optimize=True)
        print("  lyfe-story-%02d.png" % n)


# ------------------------------------------------------------------- print

def pdf_wrap(c, text, f, size, max_w):
    words, lines, cur = text.split(), [], ""
    c.setFont(f, size)
    for w in words:
        trial = (cur + " " + w).strip()
        if c.stringWidth(trial, f, size) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def pdf_para(c, text, x, y, f, size, colour, max_w, leading):
    c.setFillColor(colour)
    for ln in pdf_wrap(c, text, f, size, max_w):
        c.setFont(f, size)
        c.drawString(x, y, ln)
        y -= leading
    return y


def pdf_wordmark(c, x, y, scale=1.0, on=HexColor(INK), sub=HexColor(BRONZE)):
    c.setFillColor(on)
    c.setFont("Times-Roman", 26 * scale)
    c.drawString(x, y, "Lyfe")
    c.setFillColor(sub)
    c.setFont("Helvetica-Bold", 6.6 * scale)
    t = "PLASTICS AND DERMATOLOGY"
    cx = x + 1
    for ch in t:
        c.drawString(cx, y - 13 * scale, ch)
        cx += c.stringWidth(ch, "Helvetica-Bold", 6.6 * scale) + 1.5 * scale


def qr_reader(target: str, px: int = 600, fg=INK, bg=PAPER) -> ImageReader:
    tmp = OUT / ".qr-tmp.png"
    branded_qr(target, px, fg=fg, bg=bg).save(tmp)
    return ImageReader(str(tmp))


def build_flyer_a5(url: str):
    """A5, portrait. Sits on a salon or studio counter and gets picked up."""
    PW, PH = A5
    M = 34
    out = OUT / "lyfe-flyer-a5.pdf"
    c = canvaslib.Canvas(str(out), pagesize=A5)
    c.setTitle("Lyfe Plastics and Dermatology, flyer")

    c.setFillColor(HexColor(GROUND))
    c.rect(0, 0, PW, PH, fill=1, stroke=0)
    c.setFillColor(HexColor(INK))
    c.rect(0, PH - 128, PW, 128, fill=1, stroke=0)

    pdf_wordmark(c, M, PH - 52, scale=1.0, on=white, sub=HexColor(BRONZE))

    c.setFillColor(white)
    c.setFont("Times-Roman", 25)
    c.drawString(M, PH - 100, "Look rested. Not rearranged.")

    y = PH - 170
    y = pdf_para(
        c,
        "Aesthetic care in Lagos, delivered by registered clinicians, to a standard set and "
        "signed off by a board certified plastic surgeon. We will tell you what will work, what "
        "will not, and when the honest answer is to do nothing.",
        M, y, "Helvetica", 10, HexColor(BODY), PW - 2 * M, 14.5,
    )

    y -= 16
    c.setFillColor(HexColor(BRONZE))
    c.rect(M, y, 46, 2.5, fill=1, stroke=0)
    y -= 26

    c.setFillColor(HexColor(INK_SOFT))
    c.setFont("Helvetica-Bold", 8)
    cx = M
    for ch in "WHAT A PROPER CONSULTATION LOOKS LIKE":
        c.drawString(cx, y, ch)
        cx += c.stringWidth(ch, "Helvetica-Bold", 8) + 1.1
    y -= 20

    for i, line in enumerate(
        [
            "Somebody examines you, rather than looking at a photograph.",
            "Somebody asks about your health, not only about your goals.",
            "Somebody tells you plainly what will not work.",
            "You leave with a written plan and a written price.",
            "Nobody asks you to pay on the day to hold a discount.",
        ],
        start=1,
    ):
        c.setFillColor(HexColor(BRONZE))
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(M, y, str(i).zfill(2))
        y = pdf_para(c, line, M + 20, y, "Helvetica", 10, HexColor(BODY), PW - 2 * M - 20, 13.5) - 5

    # the single offer
    y -= 10
    box_h = 56
    c.setFillColor(HexColor(BRONZE_TINT))
    c.roundRect(M, y - box_h, PW - 2 * M, box_h, 7, fill=1, stroke=0)
    c.setFillColor(HexColor(BRONZE))
    c.rect(M, y - box_h, 3.5, box_h, fill=1, stroke=0)
    c.setFillColor(HexColor(INK))
    c.setFont("Times-Roman", 16)
    c.drawString(M + 16, y - 26, "Start with a free fifteen minute call")
    c.setFillColor(HexColor(BODY))
    c.setFont("Helvetica", 9)
    c.drawString(M + 16, y - 42, "No charge, no obligation, and nothing is booked on it.")
    y -= box_h + 24

    # the route in
    qr_px = 86
    c.drawImage(qr_reader(wa_link(CALL_MESSAGE), 600, bg=GROUND), M, y - qr_px, width=qr_px, height=qr_px, mask="auto")
    c.setFillColor(HexColor(INK))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(M + qr_px + 16, y - 24, "Scan to book your call")
    c.setFillColor(HexColor(BODY))
    c.setFont("Helvetica", 9.5)
    c.drawString(M + qr_px + 16, y - 40, "Or send a WhatsApp message to")
    c.setFillColor(HexColor(BRONZE_DEEP))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(M + qr_px + 16, y - 56, PHONE_DISPLAY)
    if url:
        c.setFillColor(HexColor(MUTED))
        c.setFont("Helvetica", 7.6)
        c.drawString(M + qr_px + 16, y - 72, url.replace("https://", ""))

    c.setFillColor(HexColor(MUTED))
    c.setFont("Helvetica", 6.4)
    c.drawString(
        M, 22,
        "All procedures carry risk. Whether any treatment suits you is a clinical decision taken at a consultation, after an examination.",
    )
    c.drawString(M, 13, "Treatment is provided by clinicians registered with the Medical and Dental Council of Nigeria.")

    c.showPage()
    c.save()
    print("  lyfe-flyer-a5.pdf")


def build_invitation_a5(url: str):
    """
    The invitation, A5 portrait, two sides.

    Printed and hand delivered against a telephone call already made, which is
    the only thing that reliably fills a room. The front is an invitation and
    nothing else, because the single offer rule bites hardest here.
    """
    PW, PH = A5
    M = 36
    out = OUT / "lyfe-invitation-a5.pdf"
    c = canvaslib.Canvas(str(out), pagesize=A5)
    c.setTitle("Medlyfe Introduces, invitation")

    # ---- front, dark
    c.setFillColor(HexColor(INK))
    c.rect(0, 0, PW, PH, fill=1, stroke=0)

    c.setFillColor(HexColor(BRONZE))
    c.setFont("Helvetica-Bold", 7.5)
    cx = M
    for ch in EVENT_NAME.upper():
        c.drawString(cx, PH - 52, ch)
        cx += c.stringWidth(ch, "Helvetica-Bold", 7.5) + 2.4

    c.setFillColor(white)
    c.setFont("Times-Roman", 27)
    # Sits lower than the top margin so the card reads as an invitation rather
    # than a poster, and so the lower half is not dead.
    y = PH - 150
    for ln in pdf_wrap(c, EVENT_THEME, "Times-Roman", 27, PW - 2 * M):
        c.drawString(M, y, ln)
        y -= 31

    c.setFillColor(HexColor(BRONZE))
    c.rect(M, y - 6, 48, 2.5, fill=1, stroke=0)
    y -= 34

    c.setFillColor(HexColor("#C9C3B9"))
    y = pdf_para(
        c,
        "An evening about how you feel and how you look, and why almost nobody in this city "
        "treats those as the same appointment.",
        M, y, "Helvetica", 10, HexColor("#C9C3B9"), PW - 2 * M, 14.5,
    )

    y -= 18
    for label, value in [
        ("WHEN", EVENT_DATE + ", " + EVENT_TIME.lower()),
        ("WHERE", EVENT_VENUE + ". The address follows your reply."),
        ("DRESS", EVENT_DRESS),
    ]:
        c.setFillColor(HexColor(BRONZE))
        c.setFont("Helvetica-Bold", 7.2)
        cx = M
        for ch in label:
            c.drawString(cx, y, ch)
            cx += c.stringWidth(ch, "Helvetica-Bold", 7.2) + 1.6
        c.setFillColor(white)
        c.setFont("Helvetica", 10.5)
        c.drawString(M + 58, y - 1, value)
        y -= 20

    pdf_wordmark(c, M, M + 56, scale=0.92, on=white, sub=HexColor(BRONZE))
    c.setFillColor(HexColor("#8B8780"))
    c.setFont("Helvetica", 7.6)
    c.drawString(M, M + 14, "By invitation. Numbers are limited.")
    c.drawString(M, M + 4, "Introducing Lyfe Plastics and Dermatology, promoted by Dr Chinwe Kpaduwa.")
    c.showPage()

    # ---- back, light. The programme and the single action.
    c.setFillColor(HexColor(GROUND))
    c.rect(0, 0, PW, PH, fill=1, stroke=0)

    pdf_wordmark(c, M, PH - 48, scale=1.0)

    c.setFillColor(HexColor(INK))
    c.setFont("Times-Roman", 17)
    c.drawString(M, PH - 92, "The evening")

    y = PH - 116
    for t, b in [
        ("The panel", "Why the woman who sleeps badly, carries weight she cannot shift and dislikes her skin has one problem rather than three."),
        ("In conversation with Dr Chinwe Kpaduwa", "Under her own title, The Art of Looking Like Yourself. How a surgeon decides who should have something done, and who should not."),
        ("The services, and what they cost", "Said out loud, with the prices, because a room that has to ask assumes the worst."),
        ("Questions from the room", "The ones people are too polite to ask in a consultation."),
    ]:
        c.setFillColor(HexColor(BRONZE))
        c.circle(M + 3, y + 3.2, 2, fill=1, stroke=0)
        c.setFillColor(HexColor(INK))
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(M + 14, y, t)
        y = pdf_para(c, b, M + 14, y - 13, "Helvetica", 9, HexColor(BODY), PW - 2 * M - 14, 12.5) - 8

    y -= 4
    qr_px = 80
    c.drawImage(
        qr_reader(wa_link(RSVP_MESSAGE), 600, bg=GROUND),
        M, y - qr_px, width=qr_px, height=qr_px, mask="auto",
    )
    c.setFillColor(HexColor(INK))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(M + qr_px + 16, y - 22, "Scan to reply")
    c.setFillColor(HexColor(BODY))
    c.setFont("Helvetica", 9)
    c.drawString(M + qr_px + 16, y - 37, "It opens a WhatsApp message. Or call")
    c.setFillColor(HexColor(BRONZE_DEEP))
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(M + qr_px + 16, y - 53, PHONE_DISPLAY)
    c.setFillColor(HexColor(MUTED))
    c.setFont("Helvetica", 8)
    c.drawString(M + qr_px + 16, y - 68, "Every guest goes home with a short printed piece.")

    c.setFillColor(HexColor(MUTED))
    c.setFont("Helvetica", 6.4)
    c.drawString(M, 22, "Treatment is provided by clinicians registered with the Medical and Dental Council of Nigeria.")
    c.showPage()
    c.save()
    print("  lyfe-invitation-a5.pdf")


def build_card_a6(url: str):
    """
    A6, two sides, on heavy stock. This is the one that gets handed over at a
    club or a dinner. The research on direct mail does not transfer to Nigeria
    because the postal channel does not work here, but the physical object
    effect does, and a card behaves like a letter where a leaflet behaves like
    litter.
    """
    PW, PH = A6
    M = 24
    out = OUT / "lyfe-card-a6.pdf"
    c = canvaslib.Canvas(str(out), pagesize=A6)
    c.setTitle("Lyfe Plastics and Dermatology, card")

    # front
    c.setFillColor(HexColor(INK))
    c.rect(0, 0, PW, PH, fill=1, stroke=0)
    pdf_wordmark(c, M, PH - 46, scale=1.15, on=white, sub=HexColor(BRONZE))
    c.setFillColor(white)
    c.setFont("Times-Roman", 21)
    c.drawString(M, PH - 108, "Look rested.")
    c.drawString(M, PH - 132, "Not rearranged.")
    c.setFillColor(HexColor(BRONZE))
    c.rect(M, PH - 152, 40, 2.5, fill=1, stroke=0)
    c.setFillColor(HexColor("#C9C3B9"))
    c.setFont("Helvetica", 8.4)
    y = PH - 172
    for ln in pdf_wrap(
        c,
        "Aesthetic care in Lagos, by clinicians who will tell you when the honest answer is no.",
        "Helvetica", 8.4, PW - 2 * M,
    ):
        c.drawString(M, y, ln)
        y -= 12
    c.setFillColor(HexColor("#8B8780"))
    c.setFont("Helvetica", 7)
    c.drawString(M, M, "Prices published. Written quote after examination.")
    c.showPage()

    # back
    c.setFillColor(HexColor(GROUND))
    c.rect(0, 0, PW, PH, fill=1, stroke=0)
    qr_px = 96
    c.drawImage(
        qr_reader(wa_link(), 600, bg=GROUND),
        (PW - qr_px) / 2, PH - 44 - qr_px, width=qr_px, height=qr_px, mask="auto",
    )
    c.setFillColor(HexColor(INK))
    c.setFont("Helvetica-Bold", 10.5)
    t = "Scan to ask a question"
    c.drawString((PW - c.stringWidth(t, "Helvetica-Bold", 10.5)) / 2, PH - 44 - qr_px - 22, t)
    c.setFillColor(HexColor(BODY))
    c.setFont("Helvetica", 8.4)
    t2 = "No form. It opens a WhatsApp message."
    c.drawString((PW - c.stringWidth(t2, "Helvetica", 8.4)) / 2, PH - 44 - qr_px - 37, t2)

    c.setFillColor(HexColor(BRONZE_DEEP))
    c.setFont("Helvetica-Bold", 12)
    c.drawString((PW - c.stringWidth(PHONE_DISPLAY, "Helvetica-Bold", 12)) / 2, M + 34, PHONE_DISPLAY)
    if url:
        c.setFillColor(HexColor(MUTED))
        c.setFont("Helvetica", 7.4)
        u = url.replace("https://", "")
        c.drawString((PW - c.stringWidth(u, "Helvetica", 7.4)) / 2, M + 20, u)
    c.showPage()
    c.save()
    print("  lyfe-card-a6.pdf")


def build_referrer_a4(url: str):
    """
    The one page scope sheet, for a thirty minute lunch and learn at a
    referring practice. The documented format: what you treat, what you do not,
    how the shared patient is communicated back, and a direct line rather than
    the main clinic number.

    The line about not paying for referrals is there because fee splitting is
    expressly forbidden by the MDCN code and a study found 78 per cent of
    Nigerian doctors either did not know that or believed the opposite. Saying
    it out loud costs nothing and separates us from most of the market.
    """
    PW, PH = A4
    M = 52
    out = OUT / "lyfe-referrer-a4.pdf"
    c = canvaslib.Canvas(str(out), pagesize=A4)
    c.setTitle("Lyfe Plastics and Dermatology, for referring clinicians")

    c.setFillColor(HexColor(INK))
    c.rect(0, PH - 136, PW, 136, fill=1, stroke=0)
    pdf_wordmark(c, M, PH - 56, scale=1.1, on=white, sub=HexColor(BRONZE))
    c.setFillColor(white)
    c.setFont("Times-Roman", 20)
    c.drawString(M, PH - 108, "For referring clinicians")

    y = PH - 176
    y = pdf_para(
        c,
        "A single page, so you know exactly what we do, what we do not do, and what happens to a "
        "patient you send us. Keep it by the desk.",
        M, y, "Helvetica", 10.5, HexColor(BODY), PW - 2 * M, 15,
    )
    y -= 18

    def head(t, yy):
        c.setFillColor(HexColor(BRONZE))
        c.rect(M, yy + 2, 26, 2.5, fill=1, stroke=0)
        c.setFillColor(HexColor(INK))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(M + 36, yy, t.upper())
        return yy - 20

    def bullets(items, yy, colour=BODY):
        for it in items:
            c.setFillColor(HexColor(BRONZE))
            c.circle(M + 4, yy + 3.4, 2, fill=1, stroke=0)
            yy = pdf_para(c, it, M + 16, yy, "Helvetica", 10, HexColor(colour), PW - 2 * M - 16, 14) - 5
        return yy - 10

    y = head("What we treat", y)
    y = bullets([
        "Medical dermatology and skin: acne and post inflammatory pigmentation, melasma, keloids and hypertrophic scarring, and the skin conditions that need a clinician rather than a facialist.",
        "Injectables and regenerative treatment: botulinum toxin, dermal filler, bio remodelling, skin boosters, PRP for skin and hair.",
        "Surgical opinion: body after children, breast, post weight loss contour, and revision of work done elsewhere.",
    ], y)

    y = head("What we do not do", y)
    y = bullets([
        "We do not treat anybody who has not had a consultation and an examination.",
        "We do not take a patient who is actively losing weight straight to a surgical date, and we say so at the first contact.",
        "We do not offer procedures that the evidence does not support, however often we are asked for them.",
        "We do not advertise outcomes, publish patient images, or make comparative claims about other practices.",
    ], y)

    y = head("What happens to a patient you send", y)
    y = bullets([
        "Seen inside five working days. If we cannot do that we tell you on the day you refer, not afterwards.",
        "A letter back to you after the consultation, with the assessment, the plan and the price, whether or not the patient proceeds.",
        "A second letter if anything changes, and a telephone call from the treating clinician if there is a complication.",
        "The patient comes back to you. We do not take over their general care and we do not keep them.",
    ], y)

    y = head("Money", y)
    y = bullets([
        "We do not pay for referrals. No rebate, no commission, no fee split, no gift. The Council forbids it and we will not be the practice that offers it to you.",
        "What you get instead is fast access for your patient, a letter you can file, and the same courtesy back when we have somebody who needs you.",
    ], y, colour=INK_SOFT)

    # the direct line, boxed, because the one thing a referrer needs is a
    # number that is not the main switchboard
    box_h = 74
    c.setFillColor(HexColor(GROUND_WARM))
    c.roundRect(M, y - box_h, PW - 2 * M, box_h, 8, fill=1, stroke=0)
    c.setFillColor(HexColor(GREEN))
    c.rect(M, y - box_h, 4, box_h, fill=1, stroke=0)
    c.setFillColor(HexColor(INK))
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(M + 18, y - 24, "The clinician line, not the clinic line")
    c.setFillColor(HexColor(BODY))
    c.setFont("Helvetica", 9.5)
    c.drawString(M + 18, y - 40, "Call or message this number and a clinician answers. Use it for an urgent patient.")
    c.setFillColor(HexColor(BRONZE_DEEP))
    c.setFont("Helvetica-Bold", 13)
    c.drawString(M + 18, y - 60, PHONE_DISPLAY)
    qr_px = 54
    c.drawImage(
        qr_reader(wa_link(), 500, bg=GROUND_WARM),
        PW - M - qr_px - 16, y - box_h + 10, width=qr_px, height=qr_px, mask="auto",
    )

    c.setFillColor(HexColor(MUTED))
    c.setFont("Helvetica", 7.2)
    c.drawString(M, 40, "Treatment is provided by clinicians registered with the Medical and Dental Council of Nigeria.")
    c.drawString(M, 30, "Clinical standards, protocols and sign off are set by Dr Chinwe Kpaduwa, a board certified plastic surgeon.")
    if url:
        c.drawString(M, 20, url.replace("https://", ""))

    c.showPage()
    c.save()
    print("  lyfe-referrer-a4.pdf")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--url",
        default=DEFAULT_URL,
        help="The brand's own domain, once it has one. Omitted from the artwork until then.",
    )
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    print("Building the Lyfe creative set into docs/lyfe-creative/")
    build_feed(args.url)
    build_stories(args.url)
    build_flyer_a5(args.url)
    build_invitation_a5(args.url)
    build_card_a6(args.url)
    build_referrer_a4(args.url)

    tmp = OUT / ".qr-tmp.png"
    if tmp.exists():
        tmp.unlink()
    print("Done.")


if __name__ == "__main__":
    main()
