"""
Build two short Haven documents the founders asked for, 18 Sep 2026.

  1. docs/haven-medical-director-role-cfa.pdf
     Dr Odedina asked what is needed from him through the programme.
     His answer: where the Medical Director is the only person who can act.

  2. docs/haven-programme-expectations-cfa.pdf
     The two-pager for all five founders: the mandate, the milestones, who
     does what, and what we need from the board.

Run:
  python3 scripts/build-haven-founder-notes.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

NAVY = HexColor("#0B3C5D")
DEEP = HexColor("#081521")
GOLD = HexColor("#D4AF37")
TEAL = HexColor("#1F7A8C")
BODY = HexColor("#1F2937")
MUTED = HexColor("#6B7280")
SURFACE = HexColor("#F1F5F9")
CREAM = HexColor("#FBF6E6")
LIGHT = HexColor("#C9D6E0")
LINE = HexColor("#E2E8F0")

PAGE_W, PAGE_H = A4
MARGIN = 48
CONTENT_W = PAGE_W - 2 * MARGIN


def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10, leading=15, textColor=BODY,
                alignment=TA_LEFT, spaceAfter=8)
    base.update(kw)
    return ParagraphStyle(name, **base)


H1 = st("h1", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=NAVY,
        spaceBefore=14, spaceAfter=7)
H2 = st("h2", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=TEAL,
        spaceBefore=11, spaceAfter=4)
P = st("p")
LEDE = st("lede", fontSize=10.8, leading=16.5, textColor=HexColor("#374151"))
SMALL = st("small", fontSize=8.3, leading=11.5, textColor=MUTED)
EYE = st("eye", fontName="Helvetica-Bold", fontSize=7.6, leading=11, textColor=GOLD)
CELL = st("cell", fontSize=8.8, leading=12.2, spaceAfter=0)
CELL_B = st("cellb", fontSize=8.8, leading=12.2, fontName="Helvetica-Bold", spaceAfter=0)
CELL_W = st("cellw", fontSize=8.8, leading=12.2, fontName="Helvetica-Bold",
            textColor=white, spaceAfter=0)
SIG = st("sig", fontSize=10, leading=14.5, fontName="Helvetica-Bold")


def make_furniture(strapline):
    def furniture(c, doc):
        c.saveState()
        c.setFillColor(NAVY)
        c.rect(0, PAGE_H - 34, PAGE_W, 34, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(0, PAGE_H - 37, PAGE_W, 3, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(MARGIN, PAGE_H - 23, "CONSULT FOR AFRICA")
        c.setFillColor(LIGHT)
        c.setFont("Helvetica", 8.5)
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - 23, strapline)
        c.setFillColor(GOLD)
        c.rect(MARGIN, 30, 24, 2, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7.8)
        c.drawString(MARGIN, 18, "Confidential  /  Haven Paediatrics")
        c.drawRightString(PAGE_W - MARGIN, 18, "Page %d" % doc.page)
        try:
            ic = ImageReader(str(DOCS / "c4a-icon.png"))
            iw, ih = ic.getSize()
            h = 20.0
            c.drawImage(ic, PAGE_W - MARGIN - h * iw / ih, PAGE_H - 58,
                        width=h * iw / ih, height=h, mask="auto")
        except Exception:
            pass
        c.restoreState()
    return furniture


def card(text, bg=SURFACE, fg=BODY, rule=GOLD, bold=False):
    s = ParagraphStyle("c", parent=P, textColor=fg, spaceBefore=2, spaceAfter=2,
                       fontName="Helvetica-Bold" if bold else "Helvetica")
    t = Table([[Paragraph(text, s)]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 3, rule),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 13),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13),
    ]))
    return t


def table(rows, widths, centre=(), zebra=True):
    out = []
    for i, r in enumerate(rows):
        cells = []
        for j, cv in enumerate(r):
            stl = CELL_W if i == 0 else (CELL_B if j == 0 else CELL)
            if j in centre and i > 0:
                stl = ParagraphStyle("x", parent=stl, alignment=TA_CENTER)
            cells.append(Paragraph(str(cv), stl))
        out.append(cells)
    t = Table(out, colWidths=widths, repeatRows=1)
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("LINEBELOW", (0, 0), (-1, 0), 1.6, GOLD),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]
    if zebra:
        cmds.append(("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, SURFACE]))
    for i in range(1, len(rows)):
        cmds.append(("LINEBELOW", (0, i), (-1, i), 0.4, LINE))
    t.setStyle(TableStyle(cmds))
    return t


def doc_for(path, strapline, title, tight=False):
    # `tight` buys back about twelve lines of vertical space, which is what keeps
    # the two-pager an actual two-pager rather than spilling its sign-off.
    top, bot = (44, 34) if tight else (52, 40)
    d = BaseDocTemplate(
        str(path), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=top, bottomMargin=bot, title=title, author="Consult for Africa")
    d.addPageTemplates([PageTemplate(
        id="c", frames=[Frame(MARGIN, bot, CONTENT_W, PAGE_H - top - bot, id="f")],
        onPage=make_furniture(strapline))])
    return d


def masthead(el, eyebrow, title, sub, meta):
    el.append(Paragraph(eyebrow.upper(), EYE))
    el.append(Spacer(1, 3))
    el.append(Paragraph(title, st("t", fontName="Helvetica-Bold", fontSize=19,
                                  leading=23, textColor=NAVY, spaceAfter=5)))
    el.append(Paragraph(sub, st("s", fontSize=11, leading=16, textColor=TEAL,
                                fontName="Helvetica-Bold", spaceAfter=10)))
    rows = [[Paragraph(k, ParagraphStyle("k", parent=SMALL, fontName="Helvetica-Bold",
                                          textColor=MUTED)),
             Paragraph(v, SMALL)] for k, v in meta]
    t = Table(rows, colWidths=[74, CONTENT_W - 74])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("TOPPADDING", (0, 0), (-1, -1), 1.5),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
                           ("LINEABOVE", (0, 0), (-1, 0), 0.6, LINE),
                           ("TOPPADDING", (0, 0), (-1, 0), 8)]))
    el.append(t)
    el.append(Spacer(1, 12))


# ══════════════════════════════════════════════ 1. MEDICAL DIRECTOR ══════════
def build_md():
    out = DOCS / "haven-medical-director-role-cfa.pdf"
    d = doc_for(out, "Haven Paediatrics  /  The Medical Director's role",
                "Haven Paediatrics - The Medical Director through the programme")
    el = []
    masthead(
        el, "For Dr Odedina, Medical Director",
        "What we need from you through this programme",
        "The places where the Medical Director is the only person who can act",
        [("Date", "18 September 2026"),
         ("From", "Dr Debo Odulana, Founding Partner, Consult for Africa"),
         ("Purpose", "Answering the question you asked: how you participate, "
                     "what we need, and how much of your time it takes")])

    el.append(Paragraph(
        "Dear Dr Odedina,", P))
    el.append(Paragraph(
        "Thank you for asking the question, and thank you for the way you asked it, because "
        "the honest answer is that this programme needs more from you than from anyone else "
        "on the board and I would rather set that out plainly now than have it arrive as a "
        "series of requests over the next six months.", LEDE))
    el.append(Paragraph(
        "The reason is straightforward. The audit rated clinical governance at 1.5 out of 5, "
        "which is the lowest rating anywhere in the report, and clinical governance is the "
        "one area that cannot be delegated to operations, to a general manager, or to us, "
        "because it requires a doctor to sign it and a Medical Director to own it. Separately, "
        "the growth plan is led by the neonatal unit, and neonatal referral is a clinical "
        "conversation between consultants rather than a marketing exercise, so the commercial "
        "plan also runs through you. Those two facts between them define everything below.", P))
    el.append(Paragraph(
        "There are five things I want to say plainly up front.", P))

    el.append(Paragraph("The first is clinical governance, and it is the priority", H2))
    el.append(Paragraph(
        "Haven has no clinical incident register, no clinical audit programme, and no "
        "clinical governance committee, so when something goes wrong it is handled verbally "
        "and well by the people present, and then it leaves no record, which means the "
        "hospital cannot learn from it, cannot show a regulator or an insurer how it manages "
        "clinical risk, and cannot defend itself if it is ever challenged. Your team is "
        "already willing to report, which is the hard part and the part most hospitals never "
        "achieve, so what is missing is only the instrument and the person who owns it.", P))
    el.append(Paragraph(
        "What we need from you is to chair a clinical governance committee once a month, to "
        "own the incident register and review it weekly for fifteen minutes with nursing and "
        "pharmacy present, and to approve a rolling clinical audit plan that we will draft "
        "for you. We can build all of it, and we will, but it has to carry your signature "
        "and your chairmanship or it is not clinical governance at all.", P))

    el.append(Paragraph("The second is the clinical standards that are waiting for a signature", H2))
    el.append(Paragraph(
        "Several documents need a Medical Director to approve them and currently do not have "
        "one. The transfusion pathway is the most pressing, because the laboratory procedure "
        "is titled to include crossmatch and requires a crossmatch release form on every unit "
        "issued, yet it contains no crossmatch method, and the nursing procedure sets out a "
        "full transfusion procedure and then instructs nurses not to perform transfusions, "
        "and it directs consent to be taken from the doctor or the laboratory scientist "
        "rather than from the parent. Transfusions are being performed, so this needs "
        "rewriting as one document with the compatibility method stated, consent assigned to "
        "the parent, and the person who administers named.", P))
    el.append(Paragraph(
        "Alongside it sit the critical value reporting pathway, which does not exist, the "
        "paediatric age-banded reference ranges, which the laboratory issues results without, "
        "and the resuscitation currency register, since recent resuscitation training scored "
        "2.80 out of 5 and is the weakest single item in the staff survey. Both nursing "
        "procedures are past their review date and the pharmacy procedure carries no named "
        "approver at all. We will draft each of these. You review, amend and sign.", P))

    el.append(Paragraph("The third is the neonatal referral conversation, which only you can hold", H2))
    el.append(Paragraph(
        "The neonatal unit is the highest-yield service Haven operates at roughly three "
        "million naira per admission across three cots, and it is materially under-used, so "
        "filling it is the single largest commercial lever in the plan. Our business "
        "development team works genuinely hard and is not the constraint, but neonatal "
        "referral is won with obstetricians, paediatricians and maternity centre operators "
        "who want to know cot capability, admission criteria, what Haven will and will not "
        "accept, how transfer works, how escalation works, and what happens to their "
        "relationship with the family afterwards, and that is a consultant-to-consultant "
        "conversation.", P))
    el.append(Paragraph(
        "What we need is for you to attend the referral meetings that matter, to host "
        "obstetricians on a tour of the unit so they can see the capability for themselves, "
        "and to design an antenatal pathway with them so that high-risk pregnancies are "
        "co-planned and the babies who will need a cot are effectively pre-booked. We are "
        "not asking you to sell. We are asking you to be the clinical authority in the room "
        "while somebody else sells.", P))

    el.append(Paragraph("The fourth is the time this actually takes", H2))
    el.append(Paragraph(
        "I would rather give you a real number than an encouraging one. The governance work "
        "is roughly one half-day a month for the committee plus fifteen minutes a week on the "
        "incident register. The standards work is front-loaded and heavier, at perhaps two "
        "half-days over the first six weeks to review and sign what we draft, and then very "
        "little. The referral work is the largest and the most valuable, at around two "
        "clinician visits or tours a month through the high season from November to February. "
        "Taken together that is close to two days a month, weighted towards the first six "
        "weeks and towards the referral programme thereafter.", P))

    el.append(Paragraph("The fifth is the survey, which is still outstanding", H2))
    el.append(Paragraph(
        "Four of the five founders have completed the direction survey and you are the one "
        "outstanding, which matters more than it might appear, because the four answers so "
        "far split two against two on how ambitious Haven should be over the next two to "
        "three years and split two against two again on whether to build functions in-house "
        "or outsource them. You are the casting vote on both, so the synthesis we bring to "
        "the strategy session is materially weaker without you. It takes about twenty "
        "minutes and the link is in the email this note came with.", P))

    el.append(Spacer(1, 6))
    el.append(card(
        "In one line: we need you to own clinical governance, sign the clinical standards, "
        "and be the clinical face of the neonatal referral programme. Everything else we can "
        "carry.", bg=CREAM, bold=True))

    el.append(Paragraph("A summary you can work from", H1))
    el.append(table([
        ["What", "Your part", "Our part", "When"],
        ["Clinical governance committee",
         "Chair it monthly",
         "Draft the terms of reference, the agenda and the papers",
         "First meeting in October"],
        ["Clinical incident register",
         "Own it, review weekly for fifteen minutes",
         "Build the form, the register and the corrective action log",
         "Live within two weeks"],
        ["Transfusion pathway",
         "Review, amend and sign",
         "Rewrite it as a single document across laboratory and nursing",
         "Draft to you in two weeks"],
        ["Critical values, paediatric ranges, resuscitation currency",
         "Approve and set the standard",
         "Draft each one and build the currency register",
         "Through October"],
        ["Clinical audit programme",
         "Approve the annual plan, chair the findings review",
         "Draft the plan and run the first cycle with your team",
         "Plan in October, first audit in November"],
        ["Neonatal referral programme",
         "Attend the meetings that matter, host unit tours",
         "Build the target list, the clinical referral pack and the tracking",
         "From October, heaviest November to February"],
        ["Antenatal pathway with obstetricians",
         "Design it clinically with them",
         "Set up the relationships and document the pathway",
         "November onward"],
        ["Founders' direction survey",
         "Twenty minutes, on your own",
         "Synthesise all five and bring the pattern to the session",
         "Before the strategy session"],
    ], [104, 104, 152, CONTENT_W - 360]))

    el.append(Spacer(1, 12))
    el.append(Paragraph(
        "None of this asks you to run the hospital day to day, and in fact the whole board "
        "answered unanimously in the survey that daily management should pass to "
        "professionals, which is the recommendation we have made and which the senior "
        "operations appointment is meant to deliver. What it does ask is that the clinical "
        "standard of the institution has a named owner who is a doctor, because at the "
        "moment it does not, and that is the gap the audit found.", P))
    el.append(Paragraph(
        "The natural first step is a conversation between the two of us before the strategy "
        "session, so that you can push back on any of this while it is still a draft. I am "
        "happy to come to you.", P))
    el.append(Spacer(1, 12))
    el.append(Paragraph("Warm regards,", P))
    el.append(Paragraph("Dr Debo Odulana", SIG))
    el.append(Paragraph("Founding Partner, Consult for Africa", SMALL))

    d.build(el)
    print(f"wrote {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB)")


# ══════════════════════════════════════════ 2. PROGRAMME EXPECTATIONS ════════
def build_expectations():
    out = DOCS / "haven-programme-expectations-cfa.pdf"
    d = doc_for(out, "Haven Paediatrics  /  What to expect",
                "Haven Paediatrics - What to expect from the programme", tight=True)
    el = []
    masthead(
        el, "For the Haven Paediatrics board",
        "What to expect over the next six months",
        "The mandate, the milestones, who does what, and what we need from you",
        [("Date", "18 September 2026"),
         ("From", "Dr Debo Odulana, Founding Partner, Consult for Africa"),
         ("Covers", "October 2026 to March 2027")])

    el.append(Paragraph(
        "The audit is finished and the strategy is agreed, so this note sets out what "
        "happens now, what you should expect each month, and what the programme needs from "
        "the board in order to land.", LEDE))

    el.append(Paragraph("The mandate", H1))
    el.append(Paragraph(
        "Haven turns over between fifteen and twenty million naira a month today. The "
        "target the board set is forty-five to fifty million a month at an earnings margin "
        "of eighteen to twenty per cent within six months, led by the neonatal unit and "
        "timed into the paediatric high season which runs from November to February.", P))
    el.append(Paragraph(
        "I want to be honest about what that number means, because six months reaches it at "
        "the February peak rather than holding it every month, and holding it year round is "
        "a longer build that runs past this programme. If neonatal referrals come through as "
        "planned, February lands in the target range. If referrals lag, February lands "
        "closer to thirty-eight to forty-two million, which would still be roughly double "
        "where Haven is today.", P))

    el.append(Paragraph("The five jobs", H1))
    el.append(table([
        ["Job", "What it means", "The levers"],
        ["Fill the beds",
         "Occupancy is the fastest money, and the neonatal cot is the highest-yield bed",
         "Referral portal and a dedicated analyst calling hospitals, a hyperlocal neonatal "
         "growth plan, more insurer and corporate clients"],
        ["Lift value per patient",
         "The priced lines in your tariff average thirty-four per cent below competitors",
         "Reprice the tariff in two tranches, expand services including surgery, the Haven "
         "Club, and add-on services"],
        ["Free cash and margin",
         "Cash is tied up in stock and in amounts owed by payers rather than missing",
         "Vendor-managed inventory, and a decision on laboratory outsourcing"],
        ["Build the engine",
         "Nothing above holds if the workforce keeps turning over",
         "Cultural transformation, the people systems the audit found missing, and a staff "
         "application to run them"],
        ["Make Haven known",
         "Reputation is already strong with families and weak with referrers",
         "Events, patient-centred design, podcasts, and the existing digital agency held to "
         "leads rather than impressions"],
    ], [86, 150, CONTENT_W - 236]))

    el.append(Paragraph("What you should expect to see, month by month", H1))
    el.append(table([
        ["Month", "What lands", "How you will know"],
        ["October",
         "Governance instruments live. Incident register open. Departmental objectives "
         "published. Tariff tranche one. Referral portal and analyst in post. Operations "
         "recruitment under way",
         "First monthly pack, new format"],
        ["November",
         "Referral programme running into the high season. Haven Club launched. Insurer and "
         "corporate pipeline building. Staff application in use. First clinical audit",
         "Referral volumes by source, weekly"],
        ["December",
         "Peak begins. Working capital released through vendor-managed inventory. "
         "Laboratory outsourcing decision taken",
         "Cash conversion in the monthly pack"],
        ["January",
         "Tariff tranche two. Service expansion including surgery. Add-ons live",
         "Revenue per encounter against baseline"],
        ["February",
         "Peak month. The target is measured here",
         "The number, against forty-five to fifty million"],
        ["March",
         "Hold the gain. Systems handed to the senior operations leader",
         "Second maturity assessment, against 2.5 today"],
    ], [58, CONTENT_W - 58 - 132, 132]))

    el.append(Paragraph("Who does what", H1))
    el.append(Paragraph(
        "We build the instruments, the registers, the pathways, the reporting and the "
        "referral programme, and we draft every document that needs approving, so that the "
        "work arrives at your door already done. You approve it, sign it, and use it, "
        "because a document we build that nobody adopts is worth nothing. Two things sit "
        "only with you: the Medical Director attends the referral meetings that matter and "
        "hosts the unit tours, which cannot be delegated to anyone without a clinical "
        "licence, and the board makes the senior operations appointment and gives it a real "
        "mandate.", P))

    el.append(Paragraph("What we need from the board", H1))
    el.append(Paragraph(
        "Four things, and three of them cost nothing. The first is the operating principles "
        "that settle how far Haven invests in its workforce before it presses for margin, "
        "because today the answer depends on which owner is asked. The second is the senior "
        "operations appointment, which the whole board already supports and which most of "
        "this programme depends on. The third is the pricing decision, taken once and held, "
        "because a tariff rise reversed under pressure is worse than one never attempted. "
        "The fourth is your time at the strategy session and the fortnightly review, which "
        "is the only way this stays yours rather than becoming ours.", P))

    el.append(Spacer(1, 4))
    el.append(card(
        "One thing worth saying plainly. Your families rate you 4.60 out of 5 and your staff "
        "rate the safety of the care they give as very good or excellent in twenty-two cases "
        "out of twenty-three, so the hard part is done and none of this is about fixing your "
        "clinical care. It is about building the machinery underneath it so the standard "
        "survives growth.", bg=CREAM, bold=True))

    el.append(Spacer(1, 7))
    el.append(KeepTogether([
        Paragraph(
            "The natural first step is the strategy session, which should hold before the "
            "November season opens, and I would like all five founders in the room for it.",
            P),
        Spacer(1, 7),
        Paragraph("Warm regards,", P),
        Paragraph("Dr Debo Odulana", SIG),
        Paragraph("Founding Partner, Consult for Africa", SMALL),
    ]))

    d.build(el)
    print(f"wrote {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build_md()
    build_expectations()
