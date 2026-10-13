#!/usr/bin/env python3
"""One card per speaker, for them to post themselves.

    npx tsx scripts/dump-ageless-speakers.ts > /tmp/speakers.json
    python3 docs/ageless/speakers/build.py /tmp/speakers.json

A speaker given a card with their own face on it posts it. A speaker given
the event poster does not, because it is somebody else's. That is the whole
reason these exist.

The design is the consultation flyer's, unchanged: MedLYFE livery, the mark
and wordmark at the top, copy left and portrait right, a band for the one
thing that matters, a dark footer. Only the content differs, so the set reads
as one campaign rather than six.

Each card carries the one subject that person is there for, so six cards
cover the evening between them rather than six copies of the same claim.
Written in the third person, because they are sharing it, not saying it.

Writes speaker-<slug>.png at 1080x1350 for the feed, and -story at 1080x1920.

No clinical claim and no procedure is named. These go out on personal
accounts, where ARCON still applies and the practitioner carries the MDCN
exposure rather than the centre.
"""
import base64
import io
import json
import os
import subprocess
import sys
import urllib.parse

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# The same palette as THEMES["medlyfe"] in docs/lyfe-consult/build.py.
INK, BODY = "#FFFFFF", "#D8E3D6"
GROUND, WARM = "#1F3A2E", "#15291F"
ACCENT = "#C4D7A6"
FOOT_BG, FOOT_C, FOOT_R = "#0F1E17", "#D8E3D6", "#7E9A88"


def data_uri(path, mime):
    with open(path, "rb") as fh:
        return f"data:{mime};base64," + base64.b64encode(fh.read()).decode()


def portrait_uri(rel):
    img = Image.open(os.path.join(ROOT, "public", rel.lstrip("/"))).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


MARK = data_uri(os.path.join(ROOT, "public/lyfe-icon.svg"), "image/svg+xml")


def card(p, ev, w, h, scale):
    s = lambda px: f"{px * scale:.2f}px"
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;600&display=block" rel="stylesheet">
<style>
  @page {{ size: {w}px {h}px; margin: 0; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  html, body {{ width: {w}px; height: {h}px; background: {GROUND}; color: {BODY};
    font-family: Inter, system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  .page {{ width: {w}px; height: {h}px; display: flex; flex-direction: column; overflow: hidden; }}

  .top {{ flex: 1; min-height: 0; display: flex; gap: {s(44)};
    padding: {s(60)} {s(72)} {s(34)}; align-items: stretch; }}
  .copy {{ flex: 1; min-width: 0; }}
  .brand {{ display: flex; align-items: center; gap: {s(14)}; }}
  .brand img {{ width: {s(46)}; height: {s(46)}; }}
  .brand span {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK};
    font-size: {s(30)}; letter-spacing: 0.01em; }}
  .eyebrow {{ font-size: {s(17)}; font-weight: 600; letter-spacing: 0.2em;
    text-transform: uppercase; color: {ACCENT}; margin-top: {s(30)}; }}
  h1 {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK}; font-size: {s(58)};
    line-height: 1.04; letter-spacing: -0.025em; margin-top: {s(20)}; }}
  .lede {{ font-size: {s(23)}; line-height: 1.45; margin-top: {s(18)}; }}

  .photo {{ width: {s(400)}; flex: none; padding-top: {s(40)}; padding-bottom: {s(10)}; }}
  .portrait {{ display: block; width: 100%; height: 100%; object-fit: cover;
    object-position: center 18%; border-radius: {s(14)}; }}

  .subj {{ background: {WARM}; padding: {s(30)} {s(72)}; }}
  .subj h2 {{ font-size: {s(16)}; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: {ACCENT}; }}
  .subj .t {{ border-top: {s(2)} solid {ACCENT}; margin-top: {s(16)}; padding-top: {s(14)};
    color: {INK}; font-size: {s(27)}; line-height: 1.35; }}

  .when {{ flex: none; padding: {s(34)} {s(72)} {s(30)}; }}
  .when h2 {{ font-family: Fraunces, Georgia, serif; font-weight: 600; color: {INK};
    font-size: {s(38)}; line-height: 1.1; letter-spacing: -0.02em; }}
  .when p {{ font-size: {s(21)}; line-height: 1.45; margin-top: {s(12)}; }}
  .when .url {{ color: {ACCENT}; font-weight: 600; margin-top: {s(14)}; font-size: {s(20)}; }}

  .foot {{ flex: none; background: {FOOT_BG}; padding: {s(22)} {s(72)}; }}
  .foot .c {{ color: {FOOT_C}; font-size: {s(17)}; }}
  .foot .r {{ color: {FOOT_R}; font-size: {s(14)}; margin-top: {s(6)}; line-height: 1.45; }}
</style></head><body><div class="page">
  <div class="top">
    <div class="copy">
      <div class="brand"><img src="{MARK}" alt=""><span>MedLYFE</span></div>
      <div class="eyebrow">{p['role']} &middot; {ev['theme'].upper()}</div>
      <h1>{p['name']}</h1>
      <p class="lede">{p['org']}</p>
    </div>
    <div class="photo">
      <img class="portrait" src="{portrait_uri(p['portrait'])}" alt="">
    </div>
  </div>
  <div class="subj"><h2>Speaking to</h2><div class="t">{p['subject']}</div></div>
  <div class="when">
    <h2>{ev['theme'].upper()}: {ev['proposition']}</h2>
    <p>{ev['date']} &middot; {ev['venue']} &middot; by invitation</p>
    <div class="url">{ev['shown']}</div>
  </div>
  <div class="foot">
    <div class="c">{ev['host']}</div>
    <div class="r">An evening of conversation. Nothing here is clinical advice or a promise of a result.</div>
  </div>
</div></body></html>"""


def render(html, out, w, h):
    html_path = out + ".html"
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(html)
    url = "file://" + urllib.parse.quote(html_path)
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
         "--virtual-time-budget=8000", f"--window-size={w},{h}",
         "--force-device-scale-factor=1", f"--screenshot={out}", url],
        check=True, capture_output=True,
    )
    os.remove(html_path)
    print("  wrote", os.path.relpath(out, ROOT))


if __name__ == "__main__":
    data = json.load(open(sys.argv[1]))
    ev = data["event"]
    for p in data["speakers"]:
        render(card(p, ev, 1080, 1350, 1.0), os.path.join(HERE, f"speaker-{p['slug']}.png"), 1080, 1350)
        render(card(p, ev, 1080, 1920, 1.0), os.path.join(HERE, f"speaker-{p['slug']}-story.png"), 1080, 1920)
