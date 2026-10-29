"""
Word version of the Solace plan, for mark-up and editing.

Same content and the same model as scripts/build-solace-plan.py, which remains the
master for the PDF that gets sent.

    python3 scripts/build-solace-plan-docx.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

sys.path.insert(0, str(Path(__file__).resolve().parent))
import solace_model as S

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "solace-abuja" / "solace-plan-cfa.docx"
LOGO = ROOT / "docs" / "c4a-logo.png"

NAVY, GOLD, TEAL = RGBColor(0x0F, 0x3D, 0x2E), RGBColor(0x96, 0x79, 0x0F), RGBColor(0x2F, 0x6F, 0x5E)
INK, MUTED = RGBColor(0x1F, 0x29, 0x37), RGBColor(0x6B, 0x72, 0x80)
H_NAVY, H_CREAM, H_GREEN, H_RULE = "0F3D2E", "FBF7EC", "EAF3ED", "F7F9F7"

B = S.build()
MB = S.metrics(B)
DAY = [n for n, _o, _s, _h, _d, ph in S.LINES if ph == 1]
P1 = S.build(line_mult={n: (1.0 if n in DAY else 0.0) for n in [x for x, *_ in S.LINES]},
             intensify=False)
CAP1 = S.CAPEX_TOTAL[0] + S.CAPEX_TOTAL[1]
TOT24, CON24 = B["rev"][24], B["rev"][24] - B["direct"][24]
WHAT_DRIVES = {
    "Day surgery, endoscopy, interventions":
        "How many lists you run and how full they are, which is entirely a function of the panel",
    "Family medicine, clinics, corporate":
        "Your own practice, corporate and mission retainers, and the screening programmes",
    "Oncology day therapy": "Patients started on treatment, and the price you buy the drugs at",
    "Laboratory and pathology":
        "Test volume from your own clinics, and how much histopathology you keep in house",
    "Radiology and imaging":
        "Referrals from outside as well as inside, and whether advanced imaging stays off site",
    "Inpatient, day-of-surgery and HDU":
        "Occupancy and length of stay, both of which day case discipline keeps deliberately low",
    "Renal dialysis": "Stations, shifts a day, and how full the chairs are",
    "Rehabilitation and physiotherapy":
        "Sessions a day, and conversion from your own theatre and oncology lists",
    "Pharmacy and retail": "Footfall. It is a service to patients rather than a profit centre",
    "Palliative and home based care": "Households on an active package at any one time",
}
ROWS = sorted(
    [(n, _s * S.maturity(24, _o, _h) * (S.INTENSIFY if n in S.INTENSIFY_LINES else 1.0),
      _s * S.maturity(24, _o, _h) * (S.INTENSIFY if n in S.INTENSIFY_LINES else 1.0) * (1 - _d),
      S.metrics(S.build(line_mult={n: 1.2}))["npv"] - MB["npv"], ph)
     for n, _o, _s, _h, _d, ph in S.LINES], key=lambda r: -r[3])


def m(x, dp=1):
    return ("{:,.%df}" % dp).format(x)


doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
for a in ("left_margin", "right_margin"):
    setattr(sec, a, Cm(2.2))
sec.top_margin, sec.bottom_margin = Cm(2.0), Cm(1.8)

st = doc.styles["Normal"]
st.font.name = "Calibri"
st.font.size = Pt(10.5)
st.font.color.rgb = INK
st.paragraph_format.space_after = Pt(7)
st.paragraph_format.line_spacing = 1.12


def shade(cell, hexfill):
    el = OxmlElement("w:shd")
    el.set(qn("w:val"), "clear")
    el.set(qn("w:fill"), hexfill)
    cell._tc.get_or_add_tcPr().append(el)


def run(par, text, bold=False, size=10.5, colour=None, italic=False):
    r = par.add_run(text)
    r.bold, r.italic = bold, italic
    r.font.size = Pt(size)
    if colour is not None:
        r.font.color.rgb = colour
    return r


def para(text, size=10.5, colour=None, after=7, italic=False, bold_lead=None):
    par = doc.add_paragraph()
    par.paragraph_format.space_after = Pt(after)
    if bold_lead:
        run(par, bold_lead, bold=True, size=size)
        run(par, " " + text, size=size)
    else:
        run(par, text, size=size, colour=colour, italic=italic)
    return par


def heading(num, eyebrow, title, lede=""):
    doc.add_page_break()
    p1 = doc.add_paragraph()
    p1.paragraph_format.space_after = Pt(2)
    run(p1, "%s  /  %s" % (num, eyebrow.upper()), bold=True, size=8, colour=GOLD)
    p2 = doc.add_paragraph()
    p2.paragraph_format.space_after = Pt(4 if lede else 10)
    run(p2, title, bold=True, size=16, colour=NAVY)
    if lede:
        para(lede, size=11, colour=MUTED, after=10, italic=True)


def sub(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    run(p, text, bold=True, size=11, colour=TEAL)


def table(headers, rows, widths=None, tiny=False):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    t.autofit = False
    size = 8.5 if tiny else 9.5
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = ""
        shade(c, H_NAVY)
        run(c.paragraphs[0], h, bold=True, size=8, colour=RGBColor(0xFF, 0xFF, 0xFF))
        c.paragraphs[0].paragraph_format.space_after = Pt(2)
    for k, r in enumerate(rows):
        cells = t.add_row().cells
        for i, v in enumerate(r):
            cells[i].text = ""
            run(cells[i].paragraphs[0], str(v), size=size)
            cells[i].paragraphs[0].paragraph_format.space_after = Pt(2)
            if k % 2 == 1:
                shade(cells[i], H_RULE)
    if widths:
        for i, w in enumerate(widths):
            for row in t.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def card(text, fill=H_CREAM):
    t = doc.add_table(rows=1, cols=1)
    c = t.rows[0].cells[0]
    c.text = ""
    shade(c, fill)
    run(c.paragraphs[0], text, size=10)
    c.paragraphs[0].paragraph_format.space_after = Pt(2)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def note(text):
    para(text, size=8.5, colour=MUTED, after=10)


# ------------------------------------------------------------------- letter --
doc.add_picture(str(LOGO), width=Cm(3.6))
doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.LEFT
t = doc.add_paragraph()
t.paragraph_format.space_after = Pt(3)
run(t, "Solace Healthcare, Games Village", bold=True, size=22, colour=NAVY)
para("A day case ambulatory and surgical facility. What it is for, the principles it is built on, "
     "how it phases, and how to start.", size=12, colour=GOLD, after=12, italic=True)
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(8)
run(p, "Dr Oby Clems-Anunwa", bold=True, size=11, colour=NAVY)
for x in [
    "Dr Oby, thank you for the time, and for the context on what you are trying to build near "
    "Games Village. This is the short version of how I would go about it.",
    "What I think you are building is a day case ambulatory and surgical facility, running from "
    "family practice through to palliative care, with oncology and core surgery in the middle of "
    "it. Everything that can be done and gone the same day is. It sits inside the complex you "
    "already own, it is led by visiting consultants rather than by a salaried establishment, and "
    "it is deliberately priced below the flagship centre up the road rather than against it.",
    "Almost everything else follows from those choices, which is why the middle of this note is a "
    "set of principles rather than a plan. Plans change when the survey comes back. Principles are "
    "what stop a plan drifting into something more expensive and less useful than what you set out "
    "to build, and in my experience they are what actually gets argued about in year two.",
    "One thing about the site is worth saying early, because it shapes everything after it. Five "
    "six-bedroom units is thirty rooms before anybody moves a wall, and somewhere in the region of "
    "%s square metres. That is enough to do all three phases inside the complex without taking any "
    "new property: clinics and diagnostics in the first two units, the cancer day unit in the "
    "third, theatres and short stay in the fourth, and the ward, the high dependency beds and "
    "dialysis in the fifth. Section 04 sets out which unit does what. The other side of a building "
    "this size is that it costs more to light, staff and secure, so the cost of simply being open "
    "is higher than a small day case unit would carry." % m(S.GROSS_SQM, 0),
    "I have kept the numbers to a minimum. They are ranges and they will move. What matters at "
    "this stage is the shape, and whether you recognise your own intention in it.",
    "There is a service profile and a note on what actually moves the revenue in the middle, and "
    "the last page is how to proceed, which I suspect is the part you most want.",
]:
    para(x)
para("Warm regards,", after=14)
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(0)
run(p, "Dr Debo Odulana", bold=True, size=11, colour=NAVY)
para("Founding Partner, Consult for Africa", size=8.5, colour=MUTED, after=0)

# --------------------------------------------------------------- objectives --
heading("01", "Objectives", "What this business is for.")
table(["", "Objective"],
      [["1", "Build a day case ambulatory and surgical facility inside the existing complex, and "
        "add inpatient capacity in the second phase. No new property taken."],
       ["2", "Cover the whole journey, from family practice and screening at the front, through "
        "diagnosis, oncology and core surgery, to rehabilitation and palliative care at the back."],
       ["3", "Be the complete pathway that people in this part of Abuja can actually afford, "
        "sitting deliberately underneath the flagship rather than competing with it."],
       ["4", "Keep clinical capacity variable. Buy consultant time by the session, so cost arrives "
        "with the patient rather than ahead of them."],
       ["5", "Reach a run rate in the region of NGN %s to %s million a month within about two "
        "years, at a margin around %.0f per cent."
        % (m(TOT24 * 0.95, 0), m(TOT24 * 1.06, 0), 100 * B["ebitda"][24] / TOT24)],
       ["6", "Build it so that a centre of excellence is possible later without rebuilding "
        "anything."]], widths=[1.0, 15.5])
card("The objective that is easiest to lose sight of is the third one. There is a version of "
     "Solace that becomes another good private hospital in Abuja, and the city already has "
     "several. The version worth building is the place people in Apo, Gudu and Lokogoma go when "
     "somebody they love is told they have cancer, because it is close, because they can afford "
     "it, because one person there owns the whole journey rather than one appointment in it, and "
     "because it answers the phone.")

# --------------------------------------------------------------- principles --
heading("02", "Principles", "Eight rules the whole thing is built on.")
para("These are the decisions I would want settled before anybody draws anything, because each one "
     "removes a whole class of argument later.")
for n, title, body in [
    ("One", "Day case leads, and the beds exist to support it.",
     "Anything that can be done and gone the same day is. The twenty-eight beds in the second "
     "phase are there because oncology, surgery and palliative care need somewhere to keep people "
     "overnight, not because this is becoming a general hospital. Beds are also the hardest thing "
     "to put into a converted apartment, since a residential corridor will not pass a trolley and "
     "a residential staircase will not take a stretcher, which is why they need a lift and why "
     "they are a second phase item rather than a first."),
    ("Two", "Visiting consultant led, with a small salaried core.",
     "Buy clinical capacity by the session and by the case, not by the year. A wide credentialed "
     "panel costs you nothing on the days it does not work, which keeps your fixed cost roughly a "
     "quarter lower than a salaried establishment and, more importantly, means you are not funding "
     "a payroll ahead of the patients. The salaried core is your family physicians and medical "
     "officers, nursing, pharmacy, imaging, the laboratory, the care coordinators and the "
     "management. Everything else is sessional."),
    ("Three", "One journey, and one person who owns it.",
     "Family practice at the front, palliative care at the back, and a named care coordinator who "
     "holds the patient across everything in between. This is the whole differentiator and it is "
     "the cheapest one available. The promise is a diagnosis in days rather than weeks, and the "
     "only way to keep it is for somebody to be accountable for it by name."),
    ("Four", "Own the pathway. Rent the machine.",
     "Buy nothing a vendor will place. Imaging on managed service, laboratory on reagent rental, "
     "reporting and reference work outsourced, estate and support contracted. What you own is the "
     "patient relationship, the record, the consultant panel and the decisions. Everything else is "
     "somebody else's capital and somebody else's rota problem."),
    ("Five", "Priced underneath the flagship, and referring into it.",
     "AMCE is twenty minutes away, it does the full pathway including radiotherapy, and it is "
     "priced against Chennai and Istanbul. That is the correct position for them and it leaves a "
     "great many people standing outside it. Those people are the business. Send complexity, "
     "radiotherapy and advanced imaging up to them under a written service agreement, and take "
     "follow-up, rehabilitation and palliative care back."),
    ("Six", "Nothing starts until it is funded.",
     "Systemic cancer therapy is pre-authorised and pre-funded before the first cycle, without "
     "exception and without goodwill starts. Two thirds of the cost of treating a cancer patient "
     "is the medication, most private schemes cap or exclude it, and a service that begins "
     "treatment before it is funded is lending money at a scale it cannot carry. This single rule "
     "protects more cash than any financing you could raise."),
    ("Seven", "Ownership small and earned. The panel paid well and not with equity.",
     "The most common way a doctor-owned hospital in this country fails is that equity gets handed "
     "to colleagues as a thank you, twenty people end up holding five per cent each, and by year "
     "three nobody can take a hard decision. Keep the owner group small. Pay the panel properly on "
     "a published tariff. If there is to be a founding scheme, cap it, and allocate it each year "
     "against contribution that can be measured."),
    ("Eight", "Consents before concrete.",
     "Change of use is lodged before anything is designed and granted before anything is built. "
     "Radiation shielding is a design input, not a supplier's problem. The controlled drug licence "
     "for palliative care is applied for nine months before it is needed, because palliative care "
     "without morphine is not palliative care. Building ahead of consents is the cheapest mistake "
     "available and the most commonly made."),
]:
    sub("%s.  %s" % (n, title))
    para(body)

# --------------------------------------------------------------- the phases --
heading("03", "The plan", "Three phases, inside the same complex.")
table(["", "What it is", "What opens", "When", "Capital", "A month, at the close"],
      [["One", "Day case ambulatory and surgical",
        "Family practice and specialist clinics. Laboratory. Ultrasound, plain film and "
        "mammography. The oncology day unit. A theatre and endoscopy. Rehabilitation. Palliative "
        "day care and home based care.",
        "Months 1 to 9", "NGN %s bn" % m(CAP1 / 1000, 1), "NGN %s m" % m(P1["rev"][16], 0)],
       ["Two", "Inpatient capacity, at half",
        "Around twenty-eight beds including a small high dependency unit and beds ring-fenced for "
        "palliative admissions. A second theatre. The lift and the circulation that makes any of "
        "it possible. The bed number is set by what the circulation will carry, not by how many "
        "bedrooms there are.",
        "Months 10 to 17", "NGN %s bn" % m(S.CAPEX_TOTAL[2] / 1000, 1),
        "NGN %s m" % m(B["rev"][21], 0)],
       ["Three", "Centre of excellence, and the same walls worked harder",
        "Accreditation, an outcomes registry, a tumour board with outside faculty, and a training "
        "post application. Then dialysis in the last unit, more infusion chairs, and a six day "
        "week with evening sessions.",
        "Months 18 to 27", "NGN %s bn" % m(S.CAPEX_TOTAL[3] / 1000, 1),
        "NGN %s m" % m(TOT24, 0)]],
      widths=[1.3, 3.2, 6.3, 2.0, 1.7, 2.0], tiny=True)
note("Capital is indicative and will move once the building is measured. Revenue is what the "
     "facility would be earning at the close of each phase if the ramp went reasonably well.")
sub("The one number that is not on that table")
para("You will need more money available than the build costs, because a cancer service carries a "
     "great deal of working capital. The drugs are bought for cash and billed to payors who take "
     "between thirty and a hundred and thirty days, so by the second year there is something in "
     "the region of NGN %s million tied up in money owed to you. It is larger than the theatre. It "
     "is the number that catches people, because no equipment quotation mentions it, and it is the "
     "main reason principle six exists." % m(B["nwc"][24], 0))
card("Across all three phases the build is in the region of NGN %s billion, and the money you "
     "would want available is closer to NGN %s billion. The difference is working capital and the "
     "losses before the facility trades properly. Raise against the second number, not the first."
     % (m(sum(S.CAPEX_TOTAL.values()) / 1000, 1), m(MB["peak"] / 1000, 1)), H_GREEN)

# ----------------------------------------------------------- service profile -
heading("04", "The service profile", "What actually opens, phase by phase.")
table(["Phase", "Service", "What it covers"],
      [["One", "The front door",
        "Family practice and primary care. Corporate and mission retainers, occupational health. "
        "Screening: breast, cervical, prostate, colorectal and general health checks."],
       ["", "Specialist clinics",
        "Eight consulting rooms on the first floor of the front unit, worked in sessions by the "
        "visiting panel below. Eight rooms running two sessions a day is a great deal of clinic "
        "capacity, and a surprising amount of the profit sits in it."],
       ["", "Diagnostics",
        "Laboratory: routine, rapid and tumour markers. Ultrasound and Doppler, digital "
        "radiography, mammography. Histopathology, immunohistochemistry and molecular work sent "
        "out. Computed tomography and magnetic resonance referred to the flagship under agreement."],
       ["", "Oncology day unit",
        "Twenty chairs. Systemic therapy, targeted and supportive care, transfusion, and "
        "compounding on site."],
       ["", "Day surgery and procedures",
        "Breast, general and soft tissue, hernia, gynaecology, endoscopic urology, vascular access "
        "and port insertion."],
       ["", "Endoscopy", "Upper gastrointestinal and colonoscopy, with reprocessing."],
       ["", "Image-guided procedures", "Ultrasound-guided biopsy, ascitic and pleural drainage."],
       ["", "Rehabilitation",
        "Physiotherapy, oncology rehabilitation, lymphoedema, post-surgical and musculoskeletal."],
       ["", "Palliative", "Day care, pain and symptom control, and home based care."],
       ["Two", "Short stay and inpatient",
        "Day of surgery admission and twenty-three hour stay. Inpatient oncology for neutropenic "
        "sepsis and complex regimens. Six beds ring-fenced for palliative admissions. Four high "
        "dependency beds. A second theatre, which is what makes longer lists possible."],
       ["Three", "Centre of excellence",
        "Tumour board with external faculty, an outcomes registry, clinical trials capability and "
        "a postgraduate training post application."],
       ["", "Dialysis", "Fourteen stations, two shifts a day, six days a week, in the last unit."],
       ["", "Intensification",
        "A six day week and evening sessions across clinics, theatre, imaging and laboratory. No "
        "new building, more hours out of the same rooms."]],
      widths=[1.6, 3.6, 11.3], tiny=True)

sub("Which unit does what, and where the beds go")
table(["Unit", "Becomes", "What goes in it", "From phase"],
      [["A", "Front of house and clinics",
        "Reception, triage, phlebotomy, pharmacy and records on the ground floor. Eight consulting "
        "rooms above, worked in sessions.", "One"],
       ["B", "Diagnostics",
        "Laboratory, two ultrasound rooms, radiography and mammography with shielding, all on the "
        "ground floor. Reporting, offices and the tumour board room above.", "One"],
       ["C", "Cancer day unit",
        "Twenty infusion chairs in open bays formed from adjoining bedrooms, two private infusion "
        "rooms, and the compounding clean room. Oncology clinics, counselling and care "
        "coordination above.", "One"],
       ["D", "Theatres and short stay",
        "Theatre one, recovery, endoscopy and sterile services on the ground floor, with theatre "
        "two added in the second phase. Day of surgery and twenty-three hour beds above.",
        "One, then two"],
       ["E", "Inpatient, dialysis and rehabilitation",
        "Rehabilitation gymnasium on the ground floor, with the dialysis unit added in the third "
        "phase. Ward beds, four high dependency beds and six palliative rooms above.",
        "Two, then three"],
       ["Quarters", "Support",
        "Stores, laundry, clinical waste, staff changing, plant and the records archive.", "One"]],
      widths=[1.6, 3.4, 9.3, 2.2], tiny=True)
para("Twenty-eight beds in total, across the upper floors of units D and E. The number is set by "
     "what the circulation and a single lift will carry, not by how many bedrooms there are, which "
     "is why thirty rooms does not mean thirty beds.")

sub("The clinical team, and which part of it you actually employ")
table(["", "From phase", "Who"],
      [["Salaried core", "One",
        "Family physicians and medical officers. Nursing: oncology, theatre and recovery, clinic. "
        "Superintendent pharmacist and a compounding pharmacist. Medical laboratory scientists. "
        "Radiographers and sonographers. Physiotherapists. Care coordinators. Facility management, "
        "finance and revenue cycle."],
       ["", "Two", "Resident medical officers for night and weekend cover. Critical care trained "
        "nursing. Additional theatre and recovery nursing."],
       ["", "Three", "Dialysis nurses and technicians. A research nurse and data manager for the "
        "registry and the trials unit."],
       ["Visiting panel", "One",
        "Medical and clinical oncology. Haematology. General and breast surgery. Urology. "
        "Obstetrics, gynaecology and gynae-oncology. Gastroenterology for endoscopy. Anaesthesia. "
        "Radiology for reporting and image-guided work. Histopathology reporting. Palliative "
        "medicine. Internal medicine, cardiology and endocrinology. Clinical psychology and "
        "counselling. Dietetics."],
       ["", "Two", "Plastic and reconstructive surgery, for breast reconstruction. Additional "
        "anaesthesia and surgical cover as the lists lengthen."],
       ["", "Three", "Nephrology for the dialysis unit. External faculty for the tumour board."]],
      widths=[2.8, 2.0, 11.7], tiny=True)
para("Most of the clinical names on that list are sessional and cost you nothing on the days they "
     "do not work. That is principle two doing its job. The salaried core is deliberately the part "
     "that has to be there whether or not a consultant is in the building.")

# ------------------------------------------------------- what moves revenue --
heading("05", "What moves the revenue", "Ranked by what each is actually worth.")
para("Ten lines, ordered by how much value a twenty per cent improvement in each would create. "
     "That is a more useful ranking than revenue size, because the lines are not equally "
     "profitable and the largest one is the least so.")
table(["Line", "Share of revenue", "Share of profit", "Margin", "Phase",
       "What actually drives it"],
      [[n, "%.0f%%" % (100 * v / TOT24), "%.0f%%" % (100 * c / CON24), "%.0f%%" % (100 * c / v),
        "%d" % ph, WHAT_DRIVES[n]] for n, v, c, _l, ph in ROWS],
      widths=[4.2, 1.9, 1.8, 1.4, 1.2, 6.0], tiny=True)
note("Margin is after the direct cost of delivering that line, before any share of the fixed cost "
     "of running the building.")
sub("What that table is telling you")
para("It is the largest single source of profit and the largest source of value in the plan, at a "
     "margin above sixty per cent and the lowest running cost of anything in the building: eight "
     "rooms and the people to staff them. It is also the front door that fills everything else, so "
     "the table understates it: it gets no credit for the theatre lists, the scans and the cancer "
     "referrals it generates. You are a family physician. The most valuable thing in this business "
     "turns out to be the thing you personally do.", bold_lead="Family practice is the engine.")
para("Day surgery and endoscopy sits a fraction behind, at a margin around sixty per cent, and it "
     "is the line most directly in your control, because what drives it is how many lists you run "
     "and how full they are. That is a question about the consultant panel rather than about the "
     "market. Get the panel right and this business works.",
     bold_lead="The theatre is the other engine.")
para("It is a fifth of the revenue and an eighth of the profit, because two thirds of what you "
     "charge goes straight back out as drugs. Build the cancer service because it is the strategy "
     "and because it is what the place will be known for. Do not ask it to pay for the building.",
     bold_lead="Oncology brings the people, not the profit.")
para("At around two thirds it is still the most profitable naira in the building, and it is only "
     "nine per cent of revenue because advanced imaging is going off site. That is a settled "
     "decision and I have built on it. It is worth revisiting once you are open and have twelve "
     "months of referral volume to show a vendor, because a scanner placed on managed service "
     "costs no capital.", bold_lead="Imaging is the best margin and the smallest it could be.")
card("If you want one sentence to hold on to: the cancer service is what brings people through the "
     "door, and the clinics and the theatre are what pay for the building. Almost every difficult "
     "decision in the first two years gets easier once you accept that both halves of that "
     "sentence are true at the same time.", H_GREEN)

# ---------------------------------------------------------------- proceed ----
heading("06", "How to proceed", "The first ninety days, in order.")
para("Nothing here requires you to commit to the whole programme. It requires you to find out "
     "whether there is one.")
table(["", "Step", "What it involves and why it is in this order"],
      [["1", "Lodge the change of use",
        "Week one. Before anything is designed and long before anything is built. Everything else "
        "queues behind this one."],
       ["2", "Measure the building and test the structure",
        "A measured survey and a structural engineer. Three weeks. It tells you what the slabs "
        "will carry, whether a lift shaft is possible, and how much of the floor area is corridor. "
        "On the last conversion we ran in Abuja the survey came back a third larger than the brief "
        "and all of it was corridor, so the cost moved and the revenue did not. Until this is "
        "done, every number anybody gives you is an estimate."],
       ["3", "Agree the service model, room by room",
        "What happens in each unit, and therefore what has to be built into it. This is what stops "
        "equipment being bought before anyone knows where it goes, which is the second most "
        "expensive mistake in this sector."],
       ["4", "Settle the ownership and the consultant panel",
        "The shareholders' agreement, the panel tariff and terms, and the conflict of interest "
        "policy. Do this while it is still theoretical and before anybody has assumed anything. It "
        "is cheap now and very expensive later."],
       ["5", "Fix the tariff and open the payor conversations",
        "Price shop the flagship and the nearest private operators, set your position underneath "
        "them, then start on schemes, corporates and the manufacturer access programmes. The "
        "access programmes take months and cost nothing but paperwork."],
       ["6", "Write the agreement with AMCE",
        "Named slots, an agreed turnaround, a price. You are relying on them for advanced imaging "
        "and for anything that needs radiotherapy, and a pathway you do not control is not a "
        "pathway you can promise."],
       ["7", "Then design to tender, and only then build",
        "By this point the survey is in, the consent is granted, the model is agreed and the money "
        "is understood. That is the right moment to spend, and not before."]],
      widths=[0.9, 5.0, 10.6], tiny=True)
sub("What we would do")
para("Consult for Africa builds and runs health businesses in Nigeria. We have converted a "
     "residential building into a clinical one in this city, structured medical joint ventures and "
     "shareholder agreements, taken facilities through licensing, built tariff and payor "
     "strategies, and recruited consultants, including from the diaspora.")
para("We would run the seven steps above with you, over about three months, and hand you a "
     "measured building, a granted or well-advanced consent, an agreed service model, a tariff, a "
     "settled ownership structure and a financial model you own and can run yourself. At the end "
     "of it you either have a real plan built on measured facts, or an early and inexpensive "
     "reason not to proceed, and both of those are worth having.")

# ------------------------------------------------------------- how we bill ---
heading("07", "How we bill", "Two different pieces of work, billed two different ways.")
para("I would rather show you the method than quote you a figure today. The figure depends on a "
     "scope that depends on a survey that has not happened yet, and a number produced before any "
     "of that is a guess. What follows is how we would arrive at it, so that when the figure does "
     "come you can see exactly where it came from.")
sub("Setting it up")
para("Setup and delivery is billed as resourced time. Named grades, published day rates, and the "
     "number of days each workstream actually takes. You are buying effort rather than a "
     "percentage of what you are spending on your own building, and the practical effect is that "
     "if a workstream turns out not to be needed, it comes straight off the fee.")
table(["", "How it works"],
      [["What you are charged for", "Days worked, by named grade, at published rates. Nothing is "
        "priced as a share of your capital."],
       ["How it is invoiced", "Monthly, against timesheets, and capped at the agreed figure. You "
        "never pay for a day that was not worked."],
       ["Third party consultants", "Architect, structural and services engineers, quantity "
        "surveyor. Passed through at cost. We do not mark them up."],
       ["On signature", "A mobilisation payment, credited in full against the first invoices."],
       ["When the figure is agreed", "Once the scope is settled, which properly means after the "
        "survey. We would not ask you to approve a number before anybody has measured the "
        "building."]], widths=[4.6, 11.9], tiny=True)
sub("Running it afterwards, if you want that")
para("If, once the doors open, you would rather have an operator than an adviser, that is a "
     "different arrangement and it is billed differently. Running a business for years cannot "
     "sensibly be charged by the day, so it sits on a share of monthly revenue.")
table(["", "How it works"],
      [["The fee", "Ten per cent of monthly revenue."],
       ["A floor in the early months", "While revenue is still building, a minimum monthly fee "
        "applies. The work is heaviest in exactly the period the revenue is thinnest, and without "
        "a floor the fee would not staff the team you most need then."],
       ["What it covers", "The management team on the ground, the operating systems and reporting, "
        "the payor relationships, and the recruitment and credentialing of the clinical panel."]],
      widths=[4.6, 11.9], tiny=True)
para("None of that is a decision for now. It is here so that you can see the shape of the whole "
     "relationship before you commit to the first part of it, which I think matters more for a "
     "business being built properly from the start than a precise figure would.")
card("The natural first step is a conversation about the eight principles. If you and I agree on "
     "those eight, the rest of this is execution and I am confident about it. If we do not, that "
     "is much better to discover over coffee than in month fourteen.")
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(0)
run(p, "Dr Debo Odulana", bold=True, size=11, colour=NAVY)
para("Founding Partner, Consult for Africa   /   +234 913 813 8553   /   "
     "hello@consultforafrica.com", size=8.5, colour=MUTED, after=0)

# header and footer furniture on every page
hdr = sec.header.paragraphs[0]
hdr.paragraph_format.space_after = Pt(0)
run(hdr, "SOLACE HEALTHCARE", bold=True, size=8, colour=NAVY)
run(hdr, "   /   Games Village, Abuja   /   the plan", size=8, colour=MUTED)
ftr = sec.footer.paragraphs[0]
run(ftr, "Private   /   Prepared for Dr Oby Clems-Anunwa", size=7.5, colour=MUTED)

doc.save(str(OUT))
print("wrote %s" % OUT)
