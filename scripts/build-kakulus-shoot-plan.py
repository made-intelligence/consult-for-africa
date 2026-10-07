"""
Kakulus Media: the production plan for Thursday 8 October 2026.

Written in Kakulus Media's voice and dressed like their invoice IVN07100601
(black bands, plain sans), because it goes to the crew and to Dr Kpaduwa as
the production company's plan for the day. It carries ten storyboard
summaries for her to choose from: the quote covers three long films and six
shorts, and the tenth is offered as an extra short at the invoice's rate.

Every piece is bottom of funnel: each answers one specific hesitation, so a
coordinator can send it to one person who enquired and went quiet. Content
rules from the CFA production brief and shoot brief apply throughout: no
patients, no treatment on camera, no brand names, no prices, and every call
to action belongs to MedLYFE.

Run:
  python3 scripts/build-kakulus-shoot-plan.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageBreak, PageTemplate, Paragraph,
    Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ageless" / "kakulus-shoot-plan-8-october.pdf"

INK = HexColor("#111111")
BODY = HexColor("#2B2B2B")
MUTED = HexColor("#6B6B6B")
RULE = HexColor("#D9D9D9")
BAND = HexColor("#F4F4F4")

PAGE_W, PAGE_H = A4
M = 18 * mm

ss = {
    "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=INK, spaceBefore=4, spaceAfter=6),
    "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=INK, spaceBefore=10, spaceAfter=4),
    "kick": ParagraphStyle("kick", fontName="Helvetica-Bold", fontSize=7.6, leading=10, textColor=MUTED, spaceAfter=2),
    "p": ParagraphStyle("p", fontName="Helvetica", fontSize=9.4, leading=13.4, textColor=BODY, spaceAfter=5, alignment=TA_LEFT),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=8.2, leading=11.2, textColor=MUTED),
    "cell": ParagraphStyle("cell", fontName="Helvetica", fontSize=8.6, leading=11.4, textColor=BODY),
    "cellb": ParagraphStyle("cellb", fontName="Helvetica-Bold", fontSize=8.6, leading=11.4, textColor=INK),
    "head": ParagraphStyle("head", fontName="Helvetica-Bold", fontSize=8.2, leading=10.5, textColor=white),
    "story": ParagraphStyle("story", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=INK, spaceAfter=2),
}


def P(t, s="p"):
    return Paragraph(t, ss[s])


def table(rows, widths, head=True, zebra=True, pad=5):
    data = []
    for i, r in enumerate(rows):
        style = "head" if (head and i == 0) else None
        data.append([P(c, style or ("cellb" if j == 0 else "cell")) if isinstance(c, str) else c for j, c in enumerate(r)])
    t = Table(data, colWidths=widths, repeatRows=1 if head else 0)
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, RULE),
    ]
    if head:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), black)]
    if zebra:
        for i in range(1 if head else 0, len(rows)):
            if i % 2 == 0:
                cmds.append(("BACKGROUND", (0, i), (-1, i), BAND))
    t.setStyle(TableStyle(cmds))
    return t


def on_page(c, doc):
    c.saveState()
    c.setFillColor(black)
    c.rect(0, PAGE_H - 22 * mm, PAGE_W, 22 * mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(M, PAGE_H - 13.5 * mm, "KAKULUS MEDIA LTD")
    c.setFont("Helvetica-Bold", 15)
    c.drawRightString(PAGE_W - M, PAGE_H - 13.5 * mm, "PRODUCTION PLAN")
    c.setStrokeColor(RULE)
    c.setLineWidth(0.6)
    c.line(M, 14 * mm, PAGE_W - M, 14 * mm)
    c.setFont("Helvetica", 7.4)
    c.setFillColor(MUTED)
    c.drawString(M, 9.5 * mm, "Kakulus Media Ltd  ·  RC 6926968  ·  kakulusmedia@gmail.com  ·  08061530073")
    c.drawRightString(PAGE_W - M, 9.5 * mm, f"MedLYFE shoot, Thursday 8 October 2026  ·  Page {doc.page}")
    c.restoreState()


W = PAGE_W - 2 * M

# ---------------------------------------------------------------- content ---
STORIES = [
    {
        "n": 1, "title": "Aftercare: the part nobody quotes for", "fmt": "Long film, 3 to 5 minutes", "site": "Tom Ogboi, warm interior",
        "mode": "Interviewed, not prompted", "who": "Dr Kpaduwa",
        "objection": "\"Who looks after me when everyone has gone home?\"",
        "send": "Anyone who has asked about recovery, time off work, or what happens after the operation.",
        "frames": [
            ("Open", "Close, seated low in daylight. She names the question nobody asks at the consultation: what happens in week two."),
            ("Turn", "Mid shot. The first fortnight, day by day, in plain terms: what is normal, what is not, who checks."),
            ("Heart", "Two-shot over the interviewer's shoulder. Who is responsible for your recovery, by name and by role, and why that has to be settled before surgery is booked."),
            ("Detail", "Cutaways: hands, a notebook, the window. She explains when to call somebody and when not to worry."),
            ("Close", "Back to the close. Bring a mother or a sister into the plan, and ask for the aftercare in writing."),
        ],
        "card": "MedLYFE. Aftercare is planned before the consultation ends.",
    },
    {
        "n": 2, "title": "Why not just fly to Istanbul?", "fmt": "Short, 45 seconds", "site": "Tom Ogboi, entrance or terrace in shade",
        "mode": "Prompter", "who": "Dr Kpaduwa",
        "objection": "\"Istanbul does the whole thing for one price.\"",
        "send": "Anyone who mentions a quote from abroad, or goes quiet after hearing the cost.",
        "frames": [
            ("Open", "Walking into frame at the entrance, then turning to camera. She says the honest thing first: some clinics abroad are very good."),
            ("Turn", "Medium close. What the flight home does not come with: the review at day ten, the person you call at two in the morning, the scar check at six weeks."),
            ("Close", "She is building here so that you do not have to choose between good and nearby."),
        ],
        "card": "MedLYFE, Lekki. Ask what aftercare is included.",
    },
    {
        "n": 3, "title": "What happens at two in the morning", "fmt": "Short, 45 seconds", "site": "Tom Ogboi, warm interior",
        "mode": "Prompter", "who": "Dr Kpaduwa",
        "objection": "\"I have read the stories, and some of them are recent.\"",
        "send": "Anyone who has asked whether it is safe, or mentioned a complication they read about.",
        "frames": [
            ("Open", "Close, low light from a lamp. She names the fear without dramatising it."),
            ("Turn", "Medium. Before any operation there is a named person to call, a number that answers, and a plan for getting you back to the clinic."),
            ("Close", "If a clinic cannot tell you who answers at two in the morning, that is your answer."),
        ],
        "card": "MedLYFE. Ask who answers the phone after surgery.",
    },
    {
        "n": 4, "title": "The work nobody can point at", "fmt": "Short, 45 seconds", "site": "Studio, dark portrait set",
        "mode": "Prompter", "who": "Dr Kpaduwa",
        "objection": "\"Will I look done?\"",
        "send": "Anyone who has said they want to look natural, or rested, or like themselves.",
        "frames": [
            ("Open", "Her portrait look: near black, single source. Silence for a beat, then the line: looking rested is not the same as looking younger."),
            ("Turn", "Tighter. Why obvious work is a failure, and why everybody claims to be natural."),
            ("Close", "The best result is the one your friends notice and cannot name."),
        ],
        "card": "MedLYFE. A consultation starts with what you want to keep.",
    },
    {
        "n": 5, "title": "What I will not do", "fmt": "Short, 45 seconds", "site": "Studio, dark portrait set",
        "mode": "Prompter", "who": "Dr Kpaduwa",
        "objection": "\"Will she just sell me whatever I ask for?\"",
        "send": "Anyone comparing clinics, or anyone who arrived asking for one specific procedure.",
        "frames": [
            ("Open", "Profile, then she turns to camera. The refusal list matters more than the menu."),
            ("Turn", "Medium close. Three things she will not do, in categories rather than brand names, and the reason for each."),
            ("Close", "Sometimes the right answer is to leave it alone, and you should hear that from a surgeon."),
        ],
        "card": "MedLYFE. Book a consultation, not a procedure.",
    },
    {
        "n": 6, "title": "Darker skin is not lighter skin with more pigment", "fmt": "Short, 45 seconds", "site": "Studio, dark portrait set",
        "mode": "Prompter", "who": "Dr Kpaduwa",
        "objection": "\"Will it scar? Will it leave marks on my skin?\"",
        "send": "Anyone who has mentioned keloids, dark marks, or a bad experience with scarring.",
        "frames": [
            ("Open", "Close. The line in full, as the title."),
            ("Turn", "What changes in a plan for darker skin: keloid history, pigment, where an incision goes and how it is closed."),
            ("Close", "Tell your surgeon about every scar you have. It changes the plan."),
        ],
        "card": "MedLYFE. Bring your scar history to the consultation.",
    },
    {
        "n": 7, "title": "What actually happens at your consultation", "fmt": "Long film, 3 to 5 minutes", "site": "MedLYFE clinic, consultation room",
        "mode": "Interviewed, with walk-through", "who": "Dr Kpaduwa",
        "objection": "\"I do not know what I am walking into.\"",
        "send": "Everyone who enquired and has not booked. The single most useful film in the set.",
        "frames": [
            ("Open", "She opens the consultation room door to camera. Daylight, a real room, two chairs."),
            ("Turn", "Seated across the desk from an empty chair. The form you fill in beforehand, and why it is done before you arrive."),
            ("Heart", "What she is looking at while you talk, and why she starts with what you would like to change rather than a menu."),
            ("Detail", "Insert: a blank written plan on the desk. What it contains, and what it deliberately leaves out."),
            ("Close", "What happens if she thinks you should not have it done, and what happens if you change your mind."),
        ],
        "card": "MedLYFE, 25 Admiralty Way. Book a consultation.",
    },
    {
        "n": 8, "title": "Who looks after you when I am not in the country", "fmt": "Long film, 3 to 5 minutes", "site": "MedLYFE clinic, consultation room",
        "mode": "Two-hander conversation", "who": "Dr Kpaduwa and MedLYFE's physician",
        "objection": "\"Is it you, or somebody I have not met?\"",
        "send": "Anyone who has asked who will actually treat them, or how often Dr Kpaduwa is in Lagos.",
        "frames": [
            ("Open", "Wide two-shot, seated at an angle. She introduces the physician as the person who is in the room when she is not."),
            ("Turn", "Singles. How they work together: what she signs off, what he does, how a case is handed between them."),
            ("Heart", "Two-shot. A real example, without a patient: the call at the weekend and what happens next."),
            ("Close", "He says what a patient should ask him. She says why she trusts him with her patients."),
        ],
        "card": "MedLYFE. The team who treats you, by name.",
    },
    {
        "n": 9, "title": "The questions I ask before anything else", "fmt": "Short, 45 seconds", "site": "MedLYFE clinic, consultation room",
        "mode": "Prompter", "who": "Dr Kpaduwa",
        "objection": "\"Why are they asking me all this?\"",
        "send": "Anyone who has received the intake form and not returned it.",
        "frames": [
            ("Open", "Medium, at the desk. Before any procedure is discussed, she asks two things."),
            ("Turn", "Nicotine, and why the answer changes healing. Whether your weight is still moving, and why that changes timing."),
            ("Close", "These questions are how a good result is protected. Answer them honestly."),
        ],
        "card": "MedLYFE. Complete your form before your consultation.",
    },
    {
        "n": 10, "title": "What is in the room if something goes wrong", "fmt": "Short, 45 seconds (the optional extra)", "site": "MedLYFE clinic, treatment room",
        "mode": "Voice over, hands and equipment only", "who": "Dr Kpaduwa (voice), a colleague's hands",
        "objection": "\"Is this clinic actually equipped?\"",
        "send": "Anyone who has asked about safety or where the procedure is done.",
        "frames": [
            ("Open", "Slow push across the treatment room, lights on, nobody on the bed."),
            ("Turn", "Inserts of equipment on the trolley, a colleague's gloved hands checking it. Her voice: who is in the room and what each person does."),
            ("Close", "The plan for when something goes wrong exists before anything goes right."),
        ],
        "card": "MedLYFE. Ask to see where you will be treated.",
    },
]

SCHEDULE = [
    ["Time", "Where", "What"],
    ["08:30", "2-4 Tom Ogboi Avenue, Lekki Phase 1", "Crew call. Load in, light the warm interior, prompter set up"],
    ["08:45", "Tom Ogboi", "Makeup by Dr Kpaduwa's own artist, to her direction. Look one"],
    ["09:45", "Tom Ogboi", "Mic, prompter check, walk the lines"],
    ["10:00", "Tom Ogboi, warm interior", "<b>Roll. Story 1, Aftercare (long).</b> Shot first so it is safe if the day slips"],
    ["11:00", "Tom Ogboi, warm interior", "Story 3, Two in the morning (short)"],
    ["11:20", "Tom Ogboi, entrance in shade", "Story 2, Why not fly (short). Arrival b-roll"],
    ["11:45", "Tom Ogboi", "Stills: 5 environmental portraits"],
    ["12:00", "On the road", "Wrap location one. Change to look two. Lunch on the move"],
    ["12:45", "Kakulus Studio, Treasure Gardens", "Crew in, light the dark portrait set to the reference look"],
    ["13:15", "Studio", "<b>Stories 4, 5 and 6 (shorts),</b> back to back, one setup"],
    ["14:15", "Studio", "Stills: 7 portraits, colour and black and white"],
    ["14:30", "On the road", "Wrap studio. Change to look three. Travel to the clinic"],
    ["15:00", "MedLYFE, 25 Admiralty Way, Lekki Phase 1", "Crew in, light the consultation room. Physician arrives for briefing; her artist checks his shine"],
    ["15:30", "Clinic, consultation room", "<b>Story 7, Your consultation (long).</b> Dr Kpaduwa alone"],
    ["16:15", "Clinic, consultation room", "<b>Story 8, Who looks after you (long),</b> with MedLYFE's physician"],
    ["17:00", "Clinic, consultation room", "Physician released. Story 9, The questions I ask (short)"],
    ["17:20", "Clinic, treatment room", "Relight. Story 10 if confirmed, hands and equipment only"],
    ["17:50", "Clinic", "Stills: 8 images, consultation room, two-shot, detail"],
    ["18:15", "Clinic", "Wrap. Rushes checked and backed up before the crew leaves"],
]


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=M, rightMargin=M, topMargin=30 * mm, bottomMargin=20 * mm,
                          title="Kakulus Media: Production plan, 8 October 2026", author="Kakulus Media Ltd")
    doc.addPageTemplates([PageTemplate(id="p", frames=[Frame(M, 20 * mm, W, PAGE_H - 50 * mm, id="f")], onPage=on_page)])
    s = []

    meta = table([
        ["CLIENT", "PRODUCTION", "DATE"],
        ["Consult for Africa, for MedLYFE Wellness and Longevity Centre",
         "One shoot day, three locations, five setups. Against invoice IVN07100601",
         "Thursday 8 October 2026. First roll 10:00"],
    ], [W * 0.4, W * 0.34, W * 0.26], zebra=False)
    s += [meta, Spacer(1, 8)]

    s.append(P("The day in one paragraph", "h1"))
    s.append(P("Six hours on camera across three locations, in this order: Tom Ogboi Avenue from ten, our studio at Treasure Gardens after lunch, and the MedLYFE clinic from three o'clock. "
               "The quote covers three long films of three to five minutes, six short films of forty five seconds and twenty retouched stills. "
               "We have written ten storyboards so there is a choice to make rather than a list to film: pick three long and six short, "
               "and the tenth can be added on the day as an extra short at N14,000 plus VAT. Everything here is built to be sent one to one, "
               "by a coordinator, to a person who enquired and has not yet booked."))

    s.append(P("Locations", "h2"))
    s.append(table([
        ["", "Address", "Setups", "Stories"],
        ["1", "2-4 Tom Ogboi Avenue, Lekki Phase 1", "Warm interior, seated low. Entrance or terrace in shade", "1, 2, 3"],
        ["2", "Kakulus Studio, Treasure Gardens", "Dark portrait set: near black, single source, matched to Dr Kpaduwa's existing portrait", "4, 5, 6"],
        ["3", "MedLYFE clinic, inside i-Fitness, 25 Admiralty Way, Lekki Phase 1", "Consultation room in daylight. Treatment room, equipment visible", "7, 8, 9, 10"],
    ], [10 * mm, W * 0.33, W * 0.42, None]))

    s.append(P("On camera", "h2"))
    s.append(table([
        ["", "Who", "When"],
        ["Principal", "Dr Chinwe Kpaduwa, MD FACS", "The full day. One look per setting, from the options below"],
        ["Second contributor", "MedLYFE's physician (Dr Adedotun Ajelabi, Clinical Lead, to be confirmed by Dr Akinware)", "15:00 to 17:00 at the clinic, for Story 8"],
        ["Hands", "A MedLYFE colleague, gloved", "Story 10 only. Hands and equipment, no face"],
        ["Nobody else", "No patients, no models, no extras", ""],
    ], [W * 0.2, W * 0.45, None]))

    s.append(P("Schedule", "h2"))
    s.append(table(SCHEDULE, [16 * mm, W * 0.33, None], pad=4))
    s.append(Spacer(1, 4))
    s.append(P("If the day slips, Stories 1 and 7 must survive. Story 1 is shot first for that reason. At the clinic, Story 7 goes before the two-hander "
               "so it is not squeezed by the physician's window. Story 10 and the last stills are the first things to drop.", "small"))

    s.append(P("Crew and kit", "h2"))
    s.append(table([
        ["Crew", "Kit"],
        ["Director, photographer, sound recordist, camera and prompter operator. Makeup is Dr Kpaduwa's own artist, not ours",
         "Cameras and lenses, lighting and grip, sound kit, teleprompter. Physical drive for all rushes"],
    ], [W * 0.5, W * 0.5], zebra=False))

    s.append(P("Makeup", "h2"))
    s.append(P("Dr Kpaduwa brings her own makeup and her own artist, who is on set all day and directs her look. Our director will ask for touch-ups between "
               "stories and before every still, and will flag shine under the studio light, but the artist has the final word on her face. "
               "MedLYFE's physician needs powder only. We will ask her artist to check him before Story 8, and we carry blotting papers if not."))

    s.append(P("Wardrobe: four options, one per setting", "h2"))
    s.append(P("Dr Kpaduwa's own clothes, chosen by her. These are the brief for each look, not a styling decision. Please bring all four; "
               "the fourth is the spare and the alternative for the two-hander."))
    s.append(table([
        ["Look", "For", "The brief", "Avoid"],
        ["1. Warm and relaxed", "Tom Ogboi, Stories 1 to 3, and the morning stills",
         "Soft tailoring or a relaxed dress in warm neutrals: sand, camel, cream, bronze. Something she can sit low in for an hour",
         "Pure white, which burns out by the window"],
        ["2. The portrait", "Studio, Stories 4 to 6, and the portrait stills",
         "Black or very deep tones, close to her existing portrait. A clean neckline, minimal gold jewellery",
         "Shine and sequins, which flare under a single source"],
        ["3. Clinical", "Clinic, Stories 7, 9 and 10",
         "Plain scrubs, or a tailored dress with a clinic jacket, in black or deep green. If she wears her own branded scrubs, the mark should sit out of the main shot",
         "Any logo other than MedLYFE's in frame"],
        ["4. The conversation", "Clinic, Story 8 with the physician. Spare for any look",
         "A step warmer than look three, so the two-hander reads as a conversation rather than a ward round",
         "Matching the physician's colour"],
    ], [W * 0.16, W * 0.22, W * 0.38, None], pad=4))
    s.append(Spacer(1, 3))
    s.append(P("For every look: no fine stripes, checks or small patterns, which strobe on camera. Nothing that rustles against the lapel mic, and "
               "jewellery that does not clink. Each look pressed and on a hanger, with a second top in case of a mark.", "small"))

    s.append(P("Rules on set", "h2"))
    for r in [
        "<b>No patients, and no patient images of any kind.</b> Nobody in frame who could be read as a patient. No before and after.",
        "<b>No treatment on camera, on anybody.</b> The treatment room is equipment, environment and a colleague's hands.",
        "<b>No brand names and no prices spoken.</b> Generic names only. If one slips, tell the producer and we retake the line.",
        "<b>Dr Kpaduwa explains; MedLYFE books.</b> Every end card and call to action is MedLYFE's, never hers.",
    ]:
        s.append(P("·  " + r))

    s.append(Spacer(1, 10))
    s.append(P("Ten storyboards to choose from", "h1"))
    s.append(P("Each one answers a single hesitation that stops a booking, and says who a coordinator would send it to. Mark three long and six short to shoot. "
               "The tenth, if it is wanted, is the extra short. Frames are summaries of what she says, not scripts: the prompter text comes from the approved scripts."))
    s.append(table([
        ["#", "Story", "Format", "Location", "Shoot?"],
        *[[str(x["n"]), x["title"], x["fmt"], x["site"], "Yes  /  No"] for x in STORIES],
    ], [8 * mm, W * 0.36, W * 0.22, W * 0.24, None], pad=4))
    s.append(Spacer(1, 6))
    s.append(P("Our recommendation is all ten: Stories 1, 7 and 8 as the long films, Stories 2, 3, 4, 5, 6 and 9 as the six shorts, and Story 10 as the extra. "
               "The day above is planned to fit all of them.", "small"))

    for x in STORIES:
        block = [Spacer(1, 10), P(f"STORY {x['n']}  ·  {x['fmt'].upper()}  ·  {x['site'].upper()}", "kick"), P(x["title"], "story")]
        block.append(table([
            ["The hesitation", x["objection"]],
            ["Sent to", x["send"]],
            ["On camera", f"{x['who']}. {x['mode']}"],
        ], [W * 0.2, None], head=False, zebra=False, pad=3.5))
        block.append(Spacer(1, 4))
        block.append(table([["Beat", "Picture and what she says"], *[[b, t] for b, t in x["frames"]]], [W * 0.13, None], pad=4))
        block.append(Spacer(1, 3))
        block.append(P(f"<b>End card.</b> {x['card']}", "small"))
        s.append(KeepTogether(block))

    s.append(PageBreak())
    s.append(P("Stills, twenty in all", "h2"))
    s.append(table([
        ["Location", "Count", "What"],
        ["Tom Ogboi", "5", "Environmental portraits, seated and at the entrance, daylight"],
        ["Studio", "7", "The dark portrait look, colour and black and white"],
        ["Clinic", "8", "Consultation room, the two-shot with the physician, equipment and hands detail"],
    ], [W * 0.2, 16 * mm, None]))

    s.append(P("Delivery", "h2"))
    s.append(table([
        ["", ""],
        ["First cuts", "Ten working days from the shoot"],
        ["Final delivery", "Twenty working days from the shoot. Files named to the client's convention, every rush on one drive"],
        ["Revisions", "One round on each long and short film"],
        ["Extra shorts", "N14,000 plus VAT each, beyond the six quoted"],
        ["Rights", "All rights assign to the client on final payment, as set out in the brief"],
    ], [W * 0.22, None], head=False))

    s.append(P("Contacts on the day", "h2"))
    s.append(table([
        ["Kakulus Media", "08061530073  ·  kakulusmedia@gmail.com"],
        ["Consult for Africa, producer on set", "+234 913 813 8553  ·  hello@consultforafrica.com"],
    ], [W * 0.38, None], head=False))

    doc.build(s)
    print("wrote", OUT)


if __name__ == "__main__":
    build()
