#!/usr/bin/env python3
"""Build the consultation flyer, one copy per group, for /lyfe/consult.

    python3 docs/lyfe-consult/build.py

Each group gets its own ?src= tag on the QR and the printed link, so the
requests that come back can be traced to the group that sent them. Add a group
to GROUPS and rerun. Writes consult-flyer-<slug>.png (1080 x 1350, for
posting) and consult-flyer-print.pdf (A4).

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

INK = "#15161A"
BODY = "#4A4D56"
GROUND = "#FAF7F2"
WARM = "#F3EDE4"
BRONZE = "#A87B4F"

PHONE = "+234 913 813 8553"
CLINIC = "Medlyfe Wellness and Longevity Centre"

# Matches LYFE_SURGEON_WORK in lib/lyfe.ts.
WORK = [
    ("Face", "Facial ageing, eyelids and facial balance."),
    ("Breast", "Reduction, lift, enlargement, and correcting earlier surgery."),
    ("Body", "Tummy tuck, contouring, and the body after children."),
    ("Reconstruction", "Scars, and living with the result of an earlier operation."),
]


def data_uri(path, mime):
    with open(path, "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


def qr_uri(url):
    img = qrcode.make(url, box_size=10, border=1)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


PORTRAIT = data_uri(os.path.join(ROOT, "docs/lyfe-rounds/chinwe-smiling.png"), "image/png")


def flyer(slug, w, h, scale):
    url = f"https://www.consultforafrica.com/lyfe/consult?src={slug}"
    shown = f"consultforafrica.com/lyfe/consult?src={slug}"
    s = lambda px: f"{px * scale:.2f}px"
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
  .fee {{ margin-top: {s(28)}; padding: {s(18)} {s(22)}; background: {INK}; color: {GROUND}; }}
  .fee .d {{ font-family: Fraunces, Georgia, serif; font-size: {s(30)}; font-weight: 600; }}
  .fee .a {{ font-size: {s(17.5)}; margin-top: {s(6)}; color: #D9C3A6; line-height: 1.4; }}
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
  .ask img {{ width: {s(190)}; height: {s(190)}; flex: none; }}
  .ask h2 {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK}; font-size: {s(38)};
    line-height: 1.1; letter-spacing: -0.02em; }}
  .ask p {{ font-size: {s(20)}; line-height: 1.45; margin-top: {s(12)}; }}
  .ask .url {{ color: {INK}; font-weight: 600; margin-top: {s(14)}; font-size: {s(19)}; }}
  .foot {{ flex: none; background: {INK}; padding: {s(22)} {s(72)}; }}
  .foot .c {{ color: #C9C6BF; font-size: {s(17)}; }}
  .foot .r {{ color: #8C8A84; font-size: {s(14)}; margin-top: {s(6)}; line-height: 1.45; }}
</style></head><body><div class="page">
  <div class="top">
    <div class="copy">
      <div class="eyebrow">Medlyfe &middot; Lagos</div>
      <h1>Thirty minutes with a plastic surgeon.</h1>
      <p class="lede">A consultation with <b>Dr Chinwe Kpaduwa</b>. You bring what you are thinking
        about; she tells you what is involved, what she would and would not do, and whether you
        should be doing anything at all.</p>
      <div class="fee"><div class="d">&#8358;150,000, by video</div>
        <div class="a">Put towards the cost of your surgery if you go ahead</div></div>
    </div>
    <div class="photo">
      <img class="portrait" src="{PORTRAIT}" alt="">
      <div class="cred"><b>Dr Chinwe Kpaduwa, MD FACS</b>
        Board certified plastic surgeon (ABPS)<br>Harvard educated, California trained</div>
    </div>
  </div>
  <div class="work"><h2>What she does</h2><div class="grid">{work}</div></div>
  <div class="ask">
    <img src="{qr_uri(url)}" alt="">
    <div>
      <h2>Request a consultation.</h2>
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
    for slug in GROUPS:
        if slug == "print":
            render(flyer(slug, 794, 1123, 794 / 1080), os.path.join(HERE, "consult-flyer-print.pdf"), 794, 1123, False)
        else:
            render(flyer(slug, 1080, 1350, 1.0), os.path.join(HERE, f"consult-flyer-{slug}.png"), 1080, 1350, True)
