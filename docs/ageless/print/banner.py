#!/usr/bin/env python3
"""medLYFE wide banner, 10 x 7 ft, four options.

    python3 docs/ageless/print/banner.py

medLYFE owns the banner; The Lyfe Place features as the co-brand. The
copy is Medlyfe's own brief, kept as given except the em dash in the
sign-off. Photography is from Medlyfe's About Us brochure; the logos are
the traced SVGs that backdrop.py writes to logos/ (run that first).

Renders each option with headless Chrome to medlyfe-banner-<x>.pdf at full
size, plus a contact sheet of all four.
"""

import base64
import io
import os
import subprocess
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTS = os.path.abspath(os.path.join(HERE, "..", "speakers", "fonts"))
SERIF = os.path.abspath(os.path.join(HERE, "..", "..", "..", "scripts", "fonts", "ile"))

W, H = 3048, 2134  # mm, 10 x 7 ft

FOREST = "#1F3A2E"
FOREST_DEEP = "#15291F"
OLIVE = "#4A6131"
LIME = "#94B064"
LIME_SOFT = "#C4D7A6"
CREAM = "#F6F3EA"
INK = "#1E2B22"

WEB = "medlyfewellness.com"
HANDLE = "@medlyfe_wellness"

HEADLINE = "Redefining Health.<br>Rethinking Ageing."
BODY = ("We bring together preventive medicine, functional medicine and personalized "
        "health strategies to help you optimize your health, preserve vitality and age well.")
AREAS = [
    "Preventive &amp; Precision Medicine",
    "Longevity &amp; Healthy Ageing",
    "Metabolic &amp; Weight Management",
    "Hormonal &amp; Functional Health",
    "Regenerative Aesthetics",
    "Personalized Wellness Solutions",
]
JOURNEY = "Your health journey deserves more than a one-size-fits-all approach."
SIGNOFF = "Your body will thank you."


def logo(name, width_mm, recolour=None):
    svg = open(os.path.join(HERE, "logos", f"{name}.svg")).read()
    for old, new in (recolour or {}).items():
        svg = svg.replace(f'fill="{old}"', f'fill="{new}"')
    return svg.replace("<svg ", f'<svg style="width:{width_mm}mm;height:auto;display:block" ', 1)


def medlyfe(width, reversed_=False):
    return logo("medlyfe", width, {"#4A6131": "#FFFFFF", "#94B064": LIME_SOFT} if reversed_ else None)


def lyfe(width, reversed_=False):
    return logo("lyfe-place", width, {"#5F7046": "#FFFFFF"} if reversed_ else None)


def qr(dark=INK, light="#FFFFFF"):
    import qrcode
    q = qrcode.QRCode(border=1, box_size=20)
    q.add_data("https://" + WEB)
    img = q.make_image(fill_color=dark, back_color=light)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def asset(name):
    return "file://" + urllib.parse.quote(os.path.join(HERE, "assets", name))


def font(path):
    return "file://" + urllib.parse.quote(path)


CSS = f"""
@font-face {{ font-family: Poppins; font-weight: 400; src: url('{font(FONTS + "/Poppins-Regular.ttf")}'); }}
@font-face {{ font-family: Poppins; font-weight: 500; src: url('{font(FONTS + "/Poppins-Medium.ttf")}'); }}
@font-face {{ font-family: Poppins; font-weight: 700; src: url('{font(FONTS + "/Poppins-Bold.ttf")}'); }}
@font-face {{ font-family: Newsreader; font-weight: 400; src: url('{font(SERIF + "/Newsreader-Regular.ttf")}'); }}
@font-face {{ font-family: Newsreader; font-weight: 400; font-style: italic; src: url('{font(SERIF + "/Newsreader-Italic.ttf")}'); }}
@font-face {{ font-family: Newsreader; font-weight: 600; src: url('{font(SERIF + "/Newsreader-SemiBold.ttf")}'); }}
@page {{ size: {W}mm {H}mm; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: {W}mm; height: {H}mm; }}
body {{ font-family: Poppins, sans-serif; color: {INK}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.page {{ position: relative; width: {W}mm; height: {H}mm; overflow: hidden; }}
.serif {{ font-family: Newsreader, Georgia, serif; }}
.eyebrow {{ font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; }}
.qr {{ display: block; }}
"""


def contacts(colour, qr_src, qr_mm=190, size=44):
    return f"""
    <div style="display:flex;align-items:center;gap:60mm">
      <div style="font-size:{size}mm;line-height:1.35;color:{colour}">
        <div style="font-weight:600">{WEB}</div>
        <div style="font-weight:400;opacity:.85">{HANDLE}</div>
      </div>
      <img class="qr" src="{qr_src}" style="width:{qr_mm}mm;height:{qr_mm}mm;border-radius:6mm">
    </div>"""


def areas_list(colour, bullet, size=52, cols=1, gap=26):
    items = "".join(
        f'<li style="display:flex;align-items:center;gap:26mm;font-size:{size}mm;line-height:1.15">'
        f'<span style="width:{size*0.42}mm;height:{size*0.42}mm;border-radius:50%;background:{bullet};flex:none"></span>{a}</li>'
        for a in AREAS)
    return (f'<ul style="list-style:none;display:grid;grid-template-columns:repeat({cols},auto);'
            f'column-gap:110mm;row-gap:{gap}mm;color:{colour}">{items}</ul>')


# ── A: forest split, portrait right ─────────────────────────────────────

def option_a():
    return f"""
<div class="page" style="background:{FOREST}">
  <div style="position:absolute;right:0;top:0;width:1230mm;height:100%;
       background:url('{asset("medlyfe-portrait.jpg")}') 55% 45%/128% auto no-repeat {FOREST}"></div>
  <div style="position:absolute;right:930mm;top:0;width:300mm;height:100%;
       background:linear-gradient(90deg,{FOREST},rgba(31,58,46,0))"></div>
  <div style="position:absolute;left:170mm;top:150mm;width:1700mm">
    {medlyfe(1050, True)}
    <div class="serif" style="margin-top:130mm;font-size:168mm;line-height:1.02;color:#fff">{HEADLINE}</div>
    <div style="margin-top:70mm;font-size:46mm;line-height:1.45;color:{LIME_SOFT};width:1480mm">{BODY}</div>
    <div class="eyebrow" style="margin-top:100mm;font-size:38mm;color:{LIME}">Our areas of care</div>
    <div style="margin-top:44mm">{areas_list("#fff", LIME, size=42, cols=2, gap=30)}</div>
  </div>
  <div style="position:absolute;left:0;bottom:0;width:100%;height:330mm;background:{FOREST_DEEP};
       display:flex;align-items:center;justify-content:space-between;padding:0 170mm">
    <div>
      <div class="serif" style="font-size:72mm;font-style:italic;color:#fff">{SIGNOFF}</div>
      <div style="font-size:34mm;color:{LIME_SOFT};margin-top:12mm">{JOURNEY}</div>
    </div>
    <div style="display:flex;align-items:center;gap:110mm">
      {contacts("#fff", qr(FOREST_DEEP), qr_mm=220, size=40)}
      <div style="width:2mm;height:220mm;background:rgba(255,255,255,.35)"></div>
      {lyfe(300, True)}
    </div>
  </div>
</div>"""


# ── B: light editorial, the direction Medlyfe chose, widened ────────────

def option_b():
    return f"""
<div class="page" style="background:{CREAM}">
  <div style="position:absolute;left:0;top:0;width:100%;height:400mm;background:{FOREST};
       display:flex;align-items:center;justify-content:space-between;padding:0 170mm">
    {medlyfe(1000, True)}
    {lyfe(330, True)}
  </div>
  <div style="position:absolute;left:170mm;top:520mm;width:1060mm;height:1300mm;border-radius:40mm;
       background:url('{asset("medlyfe-portrait.jpg")}') 55% 34%/122% auto no-repeat"></div>
  <div style="position:absolute;left:1380mm;top:540mm;width:1500mm">
    <div class="serif" style="font-size:150mm;line-height:1.04;color:{FOREST}">{HEADLINE}</div>
    <div style="margin-top:56mm;font-size:42mm;line-height:1.5;color:#3C4A40">{BODY}</div>
    <div style="margin-top:70mm;height:2mm;background:{LIME};width:100%"></div>
    <div class="eyebrow" style="margin-top:60mm;font-size:36mm;color:{FOREST};font-weight:700">Our areas of care</div>
    <div style="margin-top:40mm">{areas_list(INK, OLIVE, size=40, cols=2, gap=26)}</div>
    <div style="margin-top:70mm;font-size:36mm;color:#3C4A40">{JOURNEY}</div>
  </div>
  <div style="position:absolute;left:1380mm;right:170mm;bottom:110mm;display:flex;
       align-items:flex-end;justify-content:space-between">
    <div class="serif" style="font-size:80mm;font-style:italic;color:{FOREST}">{SIGNOFF}</div>
    {contacts(FOREST, qr(FOREST, CREAM), qr_mm=200, size=36)}
  </div>
</div>"""


# ── C: the brochure's green light, type only over it ────────────────────

def option_c():
    pills = "".join(
        f'<span style="display:inline-block;border:3mm solid {LIME_SOFT};border-radius:200mm;'
        f'padding:22mm 54mm;font-size:42mm;color:#fff;margin:0 26mm 30mm 0">{a}</span>' for a in AREAS)
    return f"""
<div class="page" style="background:{FOREST_DEEP}">
  <div style="position:absolute;inset:0;background:url('{asset("medlyfe-green.jpg")}') center 40%/cover"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(100deg,rgba(15,30,23,.94) 0%,rgba(15,30,23,.86) 48%,rgba(15,30,23,.35) 100%)"></div>
  <div style="position:absolute;left:170mm;top:160mm;right:170mm;display:flex;justify-content:space-between;align-items:center">
    {medlyfe(1150, True)}
    {lyfe(330, True)}
  </div>
  <div style="position:absolute;left:170mm;top:650mm;width:2100mm">
    <div style="font-size:190mm;line-height:1;font-weight:300;color:#fff;letter-spacing:-0.01em">
      Redefining Health.<br><span style="font-weight:700;color:{LIME_SOFT}">Rethinking Ageing.</span></div>
    <div style="margin-top:70mm;font-size:46mm;line-height:1.45;color:rgba(255,255,255,.9);width:1700mm">{BODY}</div>
    <div style="margin-top:90mm;width:2500mm">{pills}</div>
  </div>
  <div style="position:absolute;left:170mm;right:170mm;bottom:120mm;display:flex;justify-content:space-between;align-items:flex-end">
    <div>
      <div style="font-size:34mm;color:{LIME_SOFT}">{JOURNEY}</div>
      <div style="font-size:82mm;font-weight:700;color:#fff;margin-top:14mm">{SIGNOFF}</div>
    </div>
    {contacts("#fff", qr(FOREST_DEEP), qr_mm=220, size=40)}
  </div>
</div>"""


# ── D: typographic, no photograph; reads from across the room ───────────

def option_d():
    cells = "".join(
        f'<div style="border-top:4mm solid {LIME};padding-top:40mm">'
        f'<div class="serif" style="font-size:70mm;color:{LIME};line-height:1">0{i+1}</div>'
        f'<div style="font-size:52mm;font-weight:500;line-height:1.2;margin-top:24mm;color:{FOREST}">{a}</div></div>'
        for i, a in enumerate(AREAS))
    return f"""
<div class="page" style="background:#fff">
  <div style="position:absolute;left:170mm;top:150mm;right:170mm;display:flex;justify-content:space-between;align-items:center">
    {medlyfe(1250)}
    {lyfe(360)}
  </div>
  <div style="position:absolute;left:170mm;top:640mm;right:170mm;display:grid;grid-template-columns:1300mm 1fr;column-gap:140mm">
    <div>
      <div class="serif" style="font-size:136mm;line-height:1.04;color:{FOREST}">{HEADLINE}</div>
      <div style="margin-top:60mm;font-size:42mm;line-height:1.5;color:#3C4A40">{BODY}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);column-gap:70mm;row-gap:90mm">{cells}</div>
  </div>
  <div style="position:absolute;left:0;bottom:0;width:100%;height:330mm;background:{FOREST};
       display:flex;align-items:center;justify-content:space-between;padding:0 170mm">
    <div>
      <div class="serif" style="font-size:76mm;font-style:italic;color:#fff">{SIGNOFF}</div>
      <div style="font-size:34mm;color:{LIME_SOFT};margin-top:12mm">{JOURNEY}</div>
    </div>
    {contacts("#fff", qr(FOREST), qr_mm=220, size=40)}
  </div>
</div>"""


OPTIONS = {"a": option_a, "b": option_b, "c": option_c, "d": option_d}


def render(key, body):
    html = os.path.join(HERE, f"medlyfe-banner-{key}.html")
    pdf = os.path.join(HERE, f"medlyfe-banner-{key}.pdf")
    open(html, "w").write(f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}</body></html>")
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files",
                    f"--print-to-pdf={pdf}", "file://" + urllib.parse.quote(html)], check=True, capture_output=True)
    return pdf


def main():
    from PIL import Image
    pngs = []
    for key, fn in OPTIONS.items():
        pdf = render(key, fn())
        png = pdf[:-4] + "-preview"
        subprocess.run(["pdftoppm", "-r", "14", "-png", "-singlefile", "-f", "1", "-l", "1", pdf, png], check=True)
        pngs.append(png + ".png")
        print(pdf)
    ims = [Image.open(p) for p in pngs]
    w, h = ims[0].size
    sheet = Image.new("RGB", (w * 2 + 60, h * 2 + 60), "#DDDDDD")
    for i, im in enumerate(ims):
        sheet.paste(im, (20 + (i % 2) * (w + 20), 20 + (i // 2) * (h + 20)))
    sheet.save(os.path.join(HERE, "medlyfe-banner-options.png"))
    print(os.path.join(HERE, "medlyfe-banner-options.png"))


if __name__ == "__main__":
    main()
