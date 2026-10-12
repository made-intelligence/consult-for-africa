#!/usr/bin/env python3
"""Build the consultation flyer, one copy per group, for /lyfe/consult.

    python3 docs/lyfe-consult/build.py

Each group gets its own ?src= tag on the QR and the printed link, so the
requests that come back can be traced to the group that sent them. Add a group
to GROUPS and rerun. Writes consult-flyer-<slug>.png (1080 x 1350, for
posting) and consult-flyer-print.pdf (A4), then MedLYFE's own copy in its
livery on ?src=medlyfe: consult-flyer-medlyfe.png and consult-flyer-medlyfe-print.pdf.

Copy rules: the page is the clinic's, and the flyer says what the page says.
No superlatives, no comparison with other surgeons, no before and after, no
procedure promised before a consultation.
"""
import base64
import io
import os
import subprocess
import urllib.parse

import qrcode
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

GROUPS = {
    "pbn": "PBN",
    "dhn": "Digital Health Nigeria",
    "healthhub": "Health Hub",
    "dfc": "DFC",
    "returnees": "Returnees",
    "print": "Print",
}

# Each theme is the whole palette. "medlyfe" matches MEDLYFE_BRAND in lib/lyfe.ts.
THEMES = {
    "cfa": dict(ink="#15161A", body="#4A4D56", ground="#FAF7F2", warm="#F3EDE4", accent="#A87B4F",
                fee_bg="#15161A", fee_fg="#FAF7F2", fee_sub="#D9C3A6",
                foot_bg="#15161A", foot_c="#C9C6BF", foot_r="#8C8A84", mark=False),
    "medlyfe": dict(ink="#FFFFFF", body="#D8E3D6", ground="#1F3A2E", warm="#15291F", accent="#C4D7A6",
                    fee_bg="#C4D7A6", fee_fg="#15291F", fee_sub="#1F3A2E",
                    foot_bg="#0F1E17", foot_c="#D8E3D6", foot_r="#7E9A88", mark=True),
}

PHONE = "+234 913 813 8553"
# The bookings line from Dr Akinware's flyer edit, 12 October. Not the
# centre switchboard: a coordinator picks this one up.
BOOKING = "0703 052 7269"
CLINIC = "MedLYFE Wellness and Longevity Centre"

# Matches LYFE_SURGEON_WORK in lib/lyfe.ts.
WORK = [
    ("Face", "Eyelids, face lift, neck lift and facial rejuvenation."),
    ("Breast", "Reduction, lift, enlargement, breast reconstruction, and correcting earlier surgery."),
    ("Body", "Tummy tuck, liposuction, body contouring and mommy makeover."),
    ("Skin &amp; Aesthetics", "Injectables, scar revision, skin rejuvenation, peels and regenerative aesthetics."),
    ("Reconstruction", "Scars, wound revision, deformities, breast reconstruction, and living with the result of an earlier operation."),
]


def data_uri(path, mime):
    with open(path, "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


def qr_uri(url):
    img = qrcode.make(url, box_size=10, border=1)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


MARK = data_uri(os.path.join(ROOT, "public/lyfe-icon.svg"), "image/svg+xml")
PORTRAIT_PATH = os.path.join(ROOT, "docs/lyfe-rounds/chinwe-smiling.png")


def portrait_uri(ground):
    """The portrait carries the cream ground it was cut on. Repaint that ground,
    filled in from the top corners, so it sits on whatever the theme's ground is."""
    img = Image.open(PORTRAIT_PATH).convert("RGB")
    fill = tuple(int(ground[i:i + 2], 16) for i in (1, 3, 5))
    for corner in ((0, 0), (img.width - 1, 0)):
        ImageDraw.floodfill(img, corner, fill, thresh=40)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def flyer(slug, w, h, scale, t):
    url = f"https://www.consultforafrica.com/lyfe/consult?src={slug}"
    shown = f"consultforafrica.com/lyfe/consult?src={slug}"
    s = lambda px: f"{px * scale:.2f}px"
    INK, BODY, GROUND, WARM, BRONZE = t["ink"], t["body"], t["ground"], t["warm"], t["accent"]
    eyebrow = (f'<div class="brand"><img src="{MARK}" alt=""><span>MedLYFE</span></div>' if t["mark"]
               else '<div class="eyebrow">MedLYFE &middot; Lagos</div>')
    work = "".join(f'<div class="w"><div class="w-t">{t}</div><div class="w-b">{b}</div></div>' for t, b in WORK)
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;600&display=block" rel="stylesheet">
<style>
  @page {{ size: {w}px {h}px; margin: 0; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  html, body {{ width: {w}px; height: {h}px; background: {GROUND}; color: {BODY};
    font-family: Inter, system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  .page {{ width: {w}px; height: {h}px; display: flex; flex-direction: column; overflow: hidden; }}
  .top {{ display: flex; gap: {s(44)}; padding: {s(60)} {s(72)} {s(34)}; }}
  .copy {{ flex: 1; }}
  .eyebrow {{ font-size: {s(17)}; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: {BRONZE}; }}
  h1 {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK}; font-size: {s(60)};
    line-height: 1.05; letter-spacing: -0.025em; margin-top: {s(24)}; }}
  .lede {{ font-size: {s(24)}; line-height: 1.45; margin-top: {s(24)}; }}
  .lede b {{ color: {INK}; font-weight: 600; }}
  .brand {{ display: flex; align-items: center; gap: {s(14)}; }}
  .brand img {{ width: {s(46)}; height: {s(46)}; }}
  .brand span {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK}; font-size: {s(30)}; letter-spacing: 0.01em; }}
  .fee {{ margin-top: {s(28)}; padding: {s(18)} {s(22)}; background: {t["fee_bg"]}; color: {t["fee_fg"]}; }}
  .fee .d {{ font-family: Fraunces, Georgia, serif; font-size: {s(30)}; font-weight: 600; }}
  .fee .a {{ font-size: {s(17.5)}; margin-top: {s(6)}; color: {t["fee_sub"]}; line-height: 1.4; }}
  .photo {{ width: {s(340)}; flex: none; padding-top: {s(36)}; }}
  .portrait {{ display: block; width: 100%; height: auto; }}
  .cred {{ margin-top: {s(16)}; font-size: {s(16.5)}; line-height: 1.5; }}
  .cred b {{ color: {INK}; font-weight: 600; display: block; font-size: {s(19)}; }}
  .work {{ background: {WARM}; padding: {s(30)} {s(72)}; }}
  .work h2 {{ font-size: {s(16)}; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: {BRONZE}; }}
  .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: {s(18)} {s(40)}; margin-top: {s(18)}; }}
  .w {{ border-top: {s(2)} solid {BRONZE}; padding-top: {s(12)}; }}
  .w-t {{ color: {INK}; font-weight: 600; font-size: {s(22)}; }}
  .w-b {{ font-size: {s(19)}; line-height: 1.4; margin-top: {s(4)}; }}
  .ask {{ flex: 1; min-height: 0; display: flex; align-items: center; gap: {s(40)}; padding: {s(26)} {s(72)}; }}
  .ask img {{ width: {s(190)}; height: {s(190)}; flex: none; background: #FFFFFF; padding: {s(8)}; }}
  .ask h2 {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK}; font-size: {s(38)};
    line-height: 1.1; letter-spacing: -0.02em; }}
  .ask p {{ font-size: {s(20)}; line-height: 1.45; margin-top: {s(12)}; }}
  .ask p.book {{ color: {BRONZE}; font-weight: 600; margin-top: {s(10)}; }}
  .ask .url {{ color: {INK}; font-weight: 600; margin-top: {s(14)}; font-size: {s(19)}; }}
  .foot {{ flex: none; background: {t["foot_bg"]}; padding: {s(22)} {s(72)}; }}
  .foot .c {{ color: {t["foot_c"]}; font-size: {s(17)}; }}
  .foot .r {{ color: {t["foot_r"]}; font-size: {s(14)}; margin-top: {s(6)}; line-height: 1.45; }}
</style></head><body><div class="page">
  <div class="top">
    <div class="copy">
      {eyebrow}
      <h1>Thirty minutes with a plastic surgeon.</h1>
      <p class="lede">A consultation with <b>Dr Chinwe Kpaduwa</b>, in person at MedLYFE or by
        video. You bring what you are thinking about; she tells you what is involved, what she would and would not do, and whether you
        should be doing anything at all.</p>
      <div class="fee"><div class="d">&#8358;150,000, in person or by video</div>
        <div class="a">Put towards the cost of a procedure if you require one and decide to proceed</div></div>
    </div>
    <div class="photo">
      <img class="portrait" src="{portrait_uri(GROUND)}" alt="">
      <div class="cred"><b>Dr Chinwe Kpaduwa, MD FACS</b>
        Plastic surgeon and aesthetics specialist<br>Harvard educated, California trained</div>
    </div>
  </div>
  <div class="work"><h2>What she does</h2><div class="grid">{work}</div></div>
  <div class="ask">
    <img src="{qr_uri(url)}" alt="">
    <div>
      <h2>Request a consultation.</h2>
      <p class="book">For bookings, call or WhatsApp {BOOKING}</p>
      <p>A coordinator calls you to arrange the time. Nothing is taken on the page.</p>
      <div class="url">{shown}</div>
    </div>
  </div>
  <div class="foot">
    <div class="c">{CLINIC} &middot; {PHONE}</div>
    <div class="r">Not clinical advice or a promise of a result. The clinical decision rests with the registered clinician who sees you.</div>
  </div>
</div></body></html>"""


def render(html, out, w, h, png):
    html_path = out + ".html"
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(html)
    url = "file://" + urllib.parse.quote(html_path)
    common = [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000"]
    if png:
        args = [f"--window-size={w},{h}", "--force-device-scale-factor=1", f"--screenshot={out}"]
    else:
        args = ["--no-pdf-header-footer", f"--print-to-pdf={out}"]
    subprocess.run(common + args + [url], check=True, capture_output=True)
    os.remove(html_path)
    print("  wrote", os.path.relpath(out, ROOT))


if __name__ == "__main__":
    t = THEMES["cfa"]
    for slug in GROUPS:
        if slug == "print":
            render(flyer(slug, 794, 1123, 794 / 1080, t), os.path.join(HERE, "consult-flyer-print.pdf"), 794, 1123, False)
        else:
            render(flyer(slug, 1080, 1350, 1.0, t), os.path.join(HERE, f"consult-flyer-{slug}.png"), 1080, 1350, True)
    # MedLYFE's own copy, for their team to send out. One tag, so their
    # requests are told apart from the groups' in the queue.
    t = THEMES["medlyfe"]
    render(flyer("medlyfe", 1080, 1350, 1.0, t), os.path.join(HERE, "consult-flyer-medlyfe.png"), 1080, 1350, True)
    render(flyer("medlyfe", 794, 1123, 794 / 1080, t), os.path.join(HERE, "consult-flyer-medlyfe-print.pdf"), 794, 1123, False)
