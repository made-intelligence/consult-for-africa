"""
The opening film brief, as an editable Word document.

Dr Akinware asked for Word so she can mark it up and send it back, so this is
built to be edited: real Word headings so her navigation pane works, one idea
per paragraph so a tracked change lands on one line, nothing in a text box.

    python3 scripts/build-ageless-film-brief-docx.py docs/ageless/x.docx
"""

from __future__ import annotations

import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor, Inches

GREEN = RGBColor(0x1F, 0x3A, 0x2E)
MUTED = RGBColor(0x5F, 0x6B, 0x64)


def build(out: Path) -> None:
    d = Document()
    for name, size in (("Normal", 11),):
        st = d.styles[name]
        st.font.name = "Calibri"
        st.font.size = Pt(size)
    for s in d.sections:
        s.top_margin = s.bottom_margin = Inches(0.9)
        s.left_margin = s.right_margin = Inches(1.0)

    def h(text, level=1):
        p = d.add_heading(text, level=level)
        for r in p.runs:
            r.font.color.rgb = GREEN
        return p

    def para(text, italic=False, bold=False):
        p = d.add_paragraph()
        r = p.add_run(text)
        r.italic, r.bold = italic, bold
        return p

    def bullet(text):
        return d.add_paragraph(text, style="List Bullet")

    def muted(text):
        p = d.add_paragraph()
        r = p.add_run(text)
        r.font.color.rgb = MUTED
        r.font.size = Pt(9.5)
        return p

    title = d.add_heading("AGELESS: the opening film", level=0)
    for r in title.runs:
        r.font.color.rgb = GREEN
    para("A brief for review. Ten minutes, opening the evening at 6:30pm on "
         "Wednesday 21 October at the Capital Club, Lagos.")
    muted("For Dr Itunu Akinware. Prepared by Consult for Africa, 11 October 2026. "
          "Please mark it up and send it back.")

    h("In short")
    bullet("Ten minutes, not ninety seconds. This is a different film from the "
           "MedLYFE introduction film and it has a different job.")
    bullet("It opens the evening. Nobody has spoken yet when it plays, so it sets "
           "the frame that Dr Ajelabi then speaks into at 6:40.")
    bullet("It argues that ageing is something we now understand and can act on, "
           "rather than something that simply happens to us.")
    bullet("It is about the subject, not about MedLYFE. No sales message, no "
           "booking, no price. The evening itself does that work.")
    bullet("It has a life after the 22nd, so nothing in it may date: no event name, "
           "no date, no venue, no guest faces.")

    h("The two references, and what each is for")
    para("Dr Akinware sent two films. They are doing different jobs and the brief "
         "takes something different from each.")

    h("The argument", level=2)
    para("The greatest revolution in the history of medicine, Andrew Steele.")
    muted("https://youtu.be/hfQo8HYmmWQ")
    para("Steele is a biogerontologist and the author of Ageless, which is where "
         "this evening gets its name. Take the argument from here: that ageing is a "
         "process with mechanisms we can now name, measure and in some cases treat, "
         "and that treating it is different from treating the diseases it causes. "
         "That is the intellectual spine of the film.")

    h("The register", level=2)
    para("UN Decade of Healthy Ageing, Adding Life to Years.")
    muted("https://youtu.be/2Ka3a3X5RRw")
    para("Take the tone from here: human, warm, unhurried, about people rather than "
         "about science. It is institutional without being cold, and hopeful without "
         "being a sales pitch. Where Steele is the case, this is the feeling.")

    para("Together: the Steele argument delivered in the UN film's register. Rigorous "
         "underneath, warm on the surface. Neither a lecture nor an advertisement.",
         bold=True)

    h("What it has to do in ten minutes")
    bullet("Open on what the guest has already noticed in herself: energy, sleep, "
           "weight, skin, mood, recovery. Recognition before explanation.")
    bullet("Name the shift: that these are not simply the price of years, and that "
           "medicine has moved from treating the diseases of ageing to addressing "
           "ageing itself.")
    bullet("Show what that means in practice across the ground the panel covers: "
           "longevity medicine, preventive health, metabolic wellness, skin, fitness, "
           "nutrition, stress, recovery.")
    bullet("Land on agency. The guest should leave the ten minutes believing there "
           "are things within her control, and curious about which ones.")
    bullet("Hand over. The last beat should make the room want to hear a person speak.")

    h("What it is not")
    bullet("Not the MedLYFE introduction film. That is ninety seconds, built to sell, "
           "and it runs for months after this. Two films, one shoot window.")
    bullet("Not a lecture. No slides, no charts on screen, no citations read aloud.")
    bullet("Not a promise. Nothing in it may imply a treatment outcome.")

    h("The rules, which are not negotiable")
    para("These carry over from the production brief and apply to this film as well.")
    bullet("No patients, and no before and after images.")
    bullet("No drug or product brand names. NAFDAC and ARCON both bite here.")
    bullet("No clinician advertising herself. MDCN does not permit it. A clinician may "
           "explain; the centre invites.")
    bullet("No claim that cannot be stood behind in a room full of doctors on the night.")

    h("Production")
    para("This is where the brief needs a decision rather than a view.")
    bullet("Kalkulus were briefed for a half day, one location, three setups, one "
           "person to camera, delivering ninety seconds. That brief does not produce "
           "ten minutes.")
    bullet("A ten minute film at this standard is most likely archive or licensed "
           "footage, a written script, a voice, and an edit. It is an edit job more "
           "than a shoot job.")
    bullet("The task plan has the opening film due 17 October. That is six days from "
           "today for a ten minute piece that does not yet have a script.")

    h("What we need decided")
    bullet("Is ten minutes firm, or is the slot flexible? Six or seven minutes is a "
           "materially easier film to make well in the time.")
    bullet("Who writes the script, and by when?")
    bullet("Voice: a narrator, or one of the clinicians speaking to camera?")
    bullet("Is there budget for licensed footage, or does it have to be original?")
    bullet("Does Kalkulus take this as well, or does it go elsewhere while they keep "
           "the ninety second film?")

    h("Dates")
    table = d.add_table(rows=1, cols=2)
    table.style = "Light Grid Accent 1"
    hdr = table.rows[0].cells
    hdr[0].text, hdr[1].text = "What", "When"
    for what, when in [
        ("This brief agreed and the script commissioned", "Monday 13 October"),
        ("Script approved", "Wednesday 15 October"),
        ("First cut", "Friday 17 October"),
        ("Final file, tested on the room's AV", "Monday 20 October"),
        ("It plays", "Wednesday 21 October, 6:30pm"),
    ]:
        row = table.add_row().cells
        row[0].text, row[1].text = what, when

    d.add_paragraph()
    muted("Consult for Africa. The two reference films were identified by title only; "
          "nobody here has watched them end to end, so if either carries something "
          "specific you want taken from it, please say so in the margin.")

    out.parent.mkdir(parents=True, exist_ok=True)
    d.save(out)
    print(f"wrote {out}")


if __name__ == "__main__":
    build(Path(sys.argv[1] if len(sys.argv) > 1
               else "docs/ageless/AGELESS - The Opening Film, for Review.docx"))
