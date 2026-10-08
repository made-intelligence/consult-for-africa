#!/usr/bin/env python3
"""Build the AGELESS print pack: place cards, name badges and the guest takeaway.

AGELESS, Capital Club Lagos, Wednesday 21 October 2026. Seventy guests.

    python3 docs/ageless/print/build.py

Renders with headless Chrome, the same approach as the other print builds in
this workspace. Three PDFs, all A4, all printable on an office printer:

    ageless-place-cards.pdf   tent cards for the programme, 2 per sheet
    ageless-badges.pdf        name badges, 8 per sheet, 90 x 54 mm
    ageless-takeaway.pdf      the guest takeaway, 2 per sheet, A5

Names come from the CSVs beside this script, so the guest list can be dropped
in when it is worked by phone in the week of 13 October without touching the
design. Running with an empty guests.csv prints a sheet of blank badges for
writing on at the door, which is what you want for walk-ins anyway.

Compliance, from the programme and the shoot rules: MDCN does not allow a
doctor to advertise herself, so nothing here promotes Dr Kpaduwa's practice.
Dr Kpaduwa explains; Medlyfe books. ARCON and NAFDAC rule out named
prescription products, so none appear.
"""
import csv
import os
import subprocess
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# AGELESS palette, taken from the event page.
INK = "#0E1C15"      # near-black green
SAGE = "#AFC2B4"
PAPER = "#FFFFFF"

BOOKING_URL = "https://consultforafrica.com/lyfe/consult?src=event"

EVENT_NAME = "AGELESS"
EVENT_LINE = "Capital Club, Lagos · Wednesday 21 October 2026"


# ---------------------------------------------------------------- data

def read_rows(filename):
    path = os.path.join(HERE, filename)
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as fh:
        return [r for r in csv.DictReader(fh) if (r.get("name") or "").strip()]


def qr_data_uri(url):
    """QR as an inline PNG so the HTML stays a single portable file."""
    import base64
    import io

    import qrcode

    img = qrcode.make(url, box_size=10, border=1)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


# ---------------------------------------------------------------- shared css

BASE_CSS = f"""
  @page {{ size: A4; margin: 0; }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    font-family: "Georgia", "Times New Roman", serif;
    color: {INK};
    background: {PAPER};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  .sheet {{
    width: 210mm; height: 297mm;
    page-break-after: always;
    display: flex; flex-direction: column;
  }}
  .sheet:last-child {{ page-break-after: auto; }}
  .cut {{ border: 0.3mm dashed #C9D2CB; }}
  .eyebrow {{
    font-family: "Helvetica Neue", Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }}
"""


def write_and_render(name, html):
    html_path = os.path.join(HERE, name + ".html")
    pdf_path = os.path.join(HERE, name + ".pdf")
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(html)
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={pdf_path}", "file://" + urllib.parse.quote(html_path)],
        check=True, capture_output=True,
    )
    size = os.path.getsize(pdf_path) / 1024
    print(f"  {os.path.basename(pdf_path):32s} {size:6.0f} KB")
    return pdf_path


# ---------------------------------------------------------------- place cards

def build_place_cards(people):
    """Tent cards, two per A4 sheet.

    Each card is folded across the middle. The upper half is rotated 180 so
    that, once folded over, the name reads correctly from the far side of the
    table as well as the near one.
    """
    def card(person):
        name = person["name"]
        line2 = person.get("line2", "")
        face = f"""
          <div class="face">
            <div class="name">{name}</div>
            <div class="org">{line2}</div>
          </div>"""
        return f"""
        <div class="tent cut">
          <div class="half flip">{face}</div>
          <div class="fold"></div>
          <div class="half">{face}</div>
        </div>"""

    cards = "".join(card(p) for p in people)
    sheets = ""
    for i in range(0, len(people), 2):
        sheets += f'<div class="sheet">{"".join(card(p) for p in people[i:i + 2])}</div>'

    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
      {BASE_CSS}
      .sheet {{ padding: 8mm; gap: 8mm; justify-content: flex-start; }}
      .tent {{ width: 194mm; height: 130mm; display: flex; flex-direction: column; }}
      .half {{ flex: 1; display: flex; align-items: center; justify-content: center; }}
      .flip {{ transform: rotate(180deg); }}
      .fold {{ border-top: 0.3mm dotted #C9D2CB; }}
      .face {{ text-align: center; padding: 0 14mm; }}
      .name {{ font-size: 30pt; line-height: 1.15; }}
      .org {{
        font-family: "Helvetica Neue", Arial, sans-serif;
        font-size: 12pt; letter-spacing: 0.04em;
        margin-top: 4mm; color: #4A5C50;
      }}
    </style></head><body>{sheets}</body></html>"""


# ---------------------------------------------------------------- badges

def build_badges(guests):
    """90 x 54 mm badges, eight to a sheet.

    First name large, because across a room at a cocktail evening that is the
    only thing anybody actually reads. Blank badges are produced when no guest
    list is present, for writing on at the door.
    """
    PER_SHEET = 8
    rows = guests or [{"name": "", "line2": ""} for _ in range(PER_SHEET)]

    def badge(g):
        full = (g.get("name") or "").strip()
        first = full.split(" ")[0] if full else ""
        # A title alone is not a name worth sizing at 26pt.
        if first.rstrip(".").lower() in {"dr", "prof", "mr", "mrs", "ms", "miss"} and len(full.split(" ")) > 1:
            first = full.split(" ")[1]
        line2 = (g.get("line2") or "").strip()
        return f"""
        <div class="badge cut">
          <div class="badge-top eyebrow">{EVENT_NAME}</div>
          <div class="badge-body">
            <div class="first">{first}</div>
            <div class="full">{full}</div>
            <div class="org">{line2}</div>
          </div>
        </div>"""

    sheets = ""
    for i in range(0, len(rows), PER_SHEET):
        chunk = rows[i:i + PER_SHEET]
        sheets += f'<div class="sheet"><div class="grid">{"".join(badge(g) for g in chunk)}</div></div>'

    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
      {BASE_CSS}
      .sheet {{ padding: 13mm 15mm; }}
      .grid {{ display: grid; grid-template-columns: 90mm 90mm; grid-auto-rows: 54mm; gap: 6mm 0mm; justify-content: space-between; }}
      .badge {{ display: flex; flex-direction: column; overflow: hidden; }}
      .badge-top {{
        background: {INK}; color: {SAGE};
        font-size: 7pt; padding: 2.2mm 0; text-align: center;
      }}
      .badge-body {{ flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 5mm; text-align: center; }}
      .first {{ font-size: 24pt; line-height: 1.05; }}
      .full {{ font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9.5pt; color: #4A5C50; margin-top: 1.5mm; }}
      .org {{ font-family: "Helvetica Neue", Arial, sans-serif; font-size: 8pt; color: #7A8980; margin-top: 0.8mm; }}
    </style></head><body>{sheets}</body></html>"""


# ---------------------------------------------------------------- takeaway

def build_takeaway(copies=70):
    """The card every guest leaves with. A5, two per A4 sheet.

    One job: turn a conversation in the room into a booking afterwards. The
    call to action is Medlyfe's, never the surgeon's, which is both the rule
    on set and what MDCN requires.
    """
    qr = qr_data_uri(BOOKING_URL)

    card = f"""
      <div class="card cut">
        <div class="card-head">
          <div class="eyebrow mark">MEDLYFE</div>
          <div class="eyebrow ev">{EVENT_NAME}</div>
        </div>
        <div class="card-body">
          <h1>A consultation, not a quote</h1>
          <p class="lede">
            Thirty minutes with a plastic surgeon, by video. You will be told
            plainly whether an operation is the right answer, and what happens
            afterwards if it is.
          </p>
          <ul>
            <li>Thirty minutes, ₦150,000</li>
            <li>Credited in full against treatment</li>
            <li>Aftercare planned before anything is booked</li>
          </ul>
        </div>
        <div class="card-foot">
          <img class="qr" src="{qr}" alt="Scan to book" />
          <div class="foot-text">
            <div class="book">Scan to book, or visit</div>
            <div class="url">consultforafrica.com/lyfe</div>
            <div class="small">Medlyfe Wellness and Longevity Centre · Lekki, Lagos</div>
          </div>
        </div>
      </div>"""

    sheets = ""
    for _ in range((copies + 1) // 2):
        sheets += f'<div class="sheet">{card}{card}</div>'

    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
      {BASE_CSS}
      .sheet {{ padding: 0; }}
      .card {{ width: 210mm; height: 148.5mm; padding: 14mm 16mm; display: flex; flex-direction: column; }}
      .card-head {{ display: flex; justify-content: space-between; align-items: baseline; }}
      .mark {{ font-size: 11pt; letter-spacing: 0.3em; }}
      .ev {{ font-size: 8pt; color: #7A8980; }}
      .card-body {{ flex: 1; padding-top: 9mm; }}
      h1 {{ font-size: 23pt; margin: 0 0 4mm; font-weight: normal; }}
      .lede {{ font-size: 11.5pt; line-height: 1.5; margin: 0 0 5mm; max-width: 120mm; }}
      ul {{ font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10.5pt; line-height: 1.8; margin: 0; padding-left: 5mm; color: #2E3C34; }}
      .card-foot {{ display: flex; align-items: center; gap: 7mm; border-top: 0.3mm solid {SAGE}; padding-top: 6mm; }}
      .qr {{ width: 26mm; height: 26mm; }}
      .foot-text {{ font-family: "Helvetica Neue", Arial, sans-serif; }}
      .book {{ font-size: 9pt; color: #4A5C50; }}
      .url {{ font-size: 13pt; letter-spacing: 0.01em; margin-top: 1mm; }}
      .small {{ font-size: 8pt; color: #7A8980; margin-top: 2mm; }}
    </style></head><body>{sheets}</body></html>"""


# ---------------------------------------------------------------- main

def main():
    if not os.path.exists(CHROME):
        raise SystemExit(f"Google Chrome not found at {CHROME}")

    people = read_rows("people.csv")
    guests = read_rows("guests.csv")

    print(f"\nAGELESS print pack")
    print(f"  {EVENT_LINE}")
    print(f"  place cards : {len(people)} named")
    print(f"  badges      : {len(guests) if guests else 'blank sheet (guests.csv is empty)'}")
    print()

    write_and_render("ageless-place-cards", build_place_cards(people))
    write_and_render("ageless-badges", build_badges(guests))
    write_and_render("ageless-takeaway", build_takeaway(70))

    print("\nDrop the worked guest list into guests.csv (name,line2) and re-run.")


if __name__ == "__main__":
    main()
