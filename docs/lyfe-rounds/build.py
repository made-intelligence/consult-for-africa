#!/usr/bin/env python3
"""Build the Facility Rounds flyer for the DFC primary care group.

    python3 docs/lyfe-rounds/build.py

Two files beside this script, one design:

    facility-rounds-flyer.png   1080 x 1350, for posting in WhatsApp
    facility-rounds-flyer.pdf   A4, for printing

The QR and the printed link both carry ?src=dfc so the sign ups from the group
can be counted. Change SRC for another group.

Compliance: this is doctor to doctor. No inducement, no fee for referral, no
surgical dates in her name. Referrals go to the clinic.
"""
import base64
import io
import os
import subprocess
import urllib.parse

import qrcode

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

SRC = "dfc"
URL = f"https://www.consultforafrica.com/lyfe/visit?src={SRC}"
URL_SHOWN = f"consultforafrica.com/lyfe/visit?src={SRC}"

# From LYFE_BRAND in lib/lyfe.ts.
INK = "#15161A"
BODY = "#4A4D56"
MUTED = "#83868F"
GROUND = "#FAF7F2"
WARM = "#F3EDE4"
DEEP = "#EBE3D7"
BRONZE = "#A87B4F"

PHONE = "+234 913 813 8553"
CLINIC = "Medlyfe Wellness and Longevity Centre"


def data_uri(path, mime):
    with open(path, "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


def qr_uri(url):
    img = qrcode.make(url, box_size=10, border=1)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


PORTRAIT = data_uri(os.path.join(HERE, "chinwe-tile.png"), "image/png")
QR = qr_uri(URL)

POINTS = [
    ("She comes to you", "Thirty minutes at your facility, at a time that suits your list."),
    ("A real clinical conversation", "What she does, what she will not do, and where the line sits "
     "between what you can manage and what needs surgery."),
    ("A route that works both ways", "A named contact and a number that is answered. Your patient "
     "comes back to you with a letter."),
]


def flyer(w, h, scale):
    """One layout, sized by `scale` so the PNG and the A4 share a design."""
    s = lambda px: f"{px * scale:.2f}px"
    points = "".join(
        f'<div class="pt"><div class="n">0{i + 1}</div><div><div class="pt-t">{t}</div>'
        f'<div class="pt-b">{b}</div></div></div>'
        for i, (t, b) in enumerate(POINTS)
    )
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;600&display=block" rel="stylesheet">
<style>
  @page {{ size: {w}px {h}px; margin: 0; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  html, body {{ width: {w}px; height: {h}px; background: {GROUND}; color: {BODY};
    font-family: Inter, system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  .page {{ width: {w}px; height: {h}px; display: flex; flex-direction: column; overflow: hidden; }}
  .top {{ display: flex; gap: {s(48)}; padding: {s(60)} {s(72)} {s(32)}; }}
  .copy {{ flex: 1; }}
  .eyebrow {{ font-size: {s(17)}; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: {BRONZE}; }}
  h1 {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK}; font-size: {s(66)};
    line-height: 1.04; letter-spacing: -0.025em; margin-top: {s(26)}; }}
  .lede {{ font-size: {s(25)}; line-height: 1.45; margin-top: {s(26)}; }}
  .lede b {{ color: {INK}; font-weight: 600; }}
  .when {{ margin-top: {s(30)}; padding: {s(18)} {s(22)}; background: {INK}; color: {GROUND}; }}
  .when .d {{ font-family: Fraunces, Georgia, serif; font-size: {s(31)}; font-weight: 600; }}
  .when .a {{ font-size: {s(18)}; letter-spacing: 0.14em; text-transform: uppercase; margin-top: {s(6)}; color: #D9C3A6; }}
  .photo {{ width: {s(340)}; flex: none; padding-top: {s(40)}; }}
  .portrait {{ display: block; width: 100%; height: auto; }}
  .cred {{ margin-top: {s(16)}; font-size: {s(16.5)}; line-height: 1.5; color: {BODY}; }}
  .cred b {{ color: {INK}; font-weight: 600; display: block; font-size: {s(19)}; }}
  .points {{ background: {WARM}; padding: {s(30)} {s(72)}; display: grid; gap: {s(16)}; }}
  .pt {{ display: flex; gap: {s(22)}; }}
  .n {{ width: {s(34)}; flex: none; color: {BRONZE}; font-weight: 600; font-size: {s(18)}; letter-spacing: 0.1em; padding-top: {s(3)}; }}
  .pt-t {{ color: {INK}; font-weight: 600; font-size: {s(23)}; }}
  .pt-b {{ font-size: {s(20)}; line-height: 1.45; margin-top: {s(3)}; }}
  .ask {{ flex: 1; min-height: 0; display: flex; align-items: center; gap: {s(40)}; padding: {s(26)} {s(72)}; }}
  .ask img {{ width: {s(190)}; height: {s(190)}; flex: none; }}
  .ask h2 {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK}; font-size: {s(40)};
    line-height: 1.1; letter-spacing: -0.02em; }}
  .ask p {{ font-size: {s(20.5)}; line-height: 1.45; margin-top: {s(12)}; }}
  .ask .url {{ color: {INK}; font-weight: 600; margin-top: {s(14)}; font-size: {s(20)}; }}
  .foot {{ flex: none; background: {INK}; padding: {s(24)} {s(72)}; }}
  .foot .c {{ color: #C9C6BF; font-size: {s(17)}; }}
  .foot .r {{ color: #8C8A84; font-size: {s(14.5)}; margin-top: {s(6)}; line-height: 1.45; }}
</style></head><body><div class="page">
  <div class="top">
    <div class="copy">
      <div class="eyebrow">Facility Rounds &middot; For clinicians</div>
      <h1>She is doing rounds.</h1>
      <p class="lede"><b>Dr Chinwe Kpaduwa</b> is visiting primary care practices to meet the
        doctors she would work with, and to say in person what she does and where the line sits.</p>
      <div class="when"><div class="d">Tuesday 13 to Friday 16 October</div>
        <div class="a">Ikoyi &middot; Victoria Island &middot; Lekki</div></div>
    </div>
    <div class="photo">
      <img class="portrait" src="{PORTRAIT}" alt="">
      <div class="cred"><b>Dr Chinwe Kpaduwa, MD FACS</b>
        Board certified plastic surgeon (ABPS)<br>Harvard educated, California trained</div>
    </div>
  </div>
  <div class="points">{points}</div>
  <div class="ask">
    <img src="{QR}" alt="">
    <div>
      <h2>Put your practice on the round.</h2>
      <p>Tick the times that suit you and we will call to confirm. No presentation and nothing to sign.</p>
      <div class="url">{URL_SHOWN}</div>
    </div>
  </div>
  <div class="foot">
    <div class="c">{CLINIC} &middot; {PHONE}</div>
    <div class="r">For clinicians. No fee is paid for a referral in either direction.</div>
  </div>
</div></body></html>"""


def render(html, name, w, h, png):
    html_path = os.path.join(HERE, f"{name}.html")
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(html)
    url = "file://" + urllib.parse.quote(html_path)
    common = [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000"]
    if png:
        out = os.path.join(HERE, f"{name}.png")
        subprocess.run(common + [f"--window-size={w},{h}", "--force-device-scale-factor=1",
                                 f"--screenshot={out}", url], check=True, capture_output=True)
    else:
        out = os.path.join(HERE, f"{name}.pdf")
        subprocess.run(common + ["--no-pdf-header-footer", f"--print-to-pdf={out}", url],
                       check=True, capture_output=True)
    os.remove(html_path)
    print("  wrote", os.path.relpath(out, ROOT))


if __name__ == "__main__":
    render(flyer(1080, 1350, 1.0), "facility-rounds-flyer", 1080, 1350, png=True)
    # A4 at 96dpi is 794 x 1123; 1123/1350 keeps the PNG's proportions within a hair.
    render(flyer(794, 1123, 794 / 1080), "facility-rounds-flyer", 794, 1123, png=False)
