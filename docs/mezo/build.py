#!/usr/bin/env python3
"""Render the Mezo contracts in docs/mezo to PDF.

    python3 docs/mezo/build.py

Plain contract styling rather than the CFA house deck look: these are signed by
surgeons, so they read as legal documents. Headless Chrome, A4.
"""
import os
import re
import subprocess
import urllib.parse

import markdown

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

DOCS = [
    "mezo-surgery-engagement-contract",
    "mezo-surgery-facility-agreement",
    "mezo-facility-assessment-criteria",
]

CSS = """
@page { size: A4; margin: 22mm 20mm 20mm; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 10.6pt; line-height: 1.5; color: #1d2321; }
h1 { font-family: Helvetica, Arial, sans-serif; font-size: 16pt; color: #0A7B6E; letter-spacing: 0.02em; margin: 0 0 18px; }
h2 { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #0A7B6E; margin: 20px 0 6px; page-break-after: avoid; }
p { margin: 0 0 8px; text-align: justify; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; page-break-inside: avoid; }
td, th { border: 1px solid #cfd8d6; padding: 6px 8px; vertical-align: top; font-size: 10pt; }
th { background: #eef5f4; text-align: left; font-family: Helvetica, Arial, sans-serif; }
td:first-child { width: 42%; }
.blank { display: inline-block; border-bottom: 1px solid #1d2321; height: 1em; vertical-align: bottom; }
"""


def build(stem):
    with open(os.path.join(HERE, f"{stem}.md"), encoding="utf-8") as fh:
        text = fh.read()
    # Signature blanks: a run of underscores is emphasis to Markdown, so draw it as a rule.
    text = re.sub(r"_{3,}", lambda m: f'<span class="blank" style="min-width:{len(m.group(0)) * 6}px"></span>', text)
    body = markdown.markdown(text, extensions=["tables"])
    html_path = os.path.join(HERE, f"{stem}.html")
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}</body></html>")
    out = os.path.join(HERE, f"{stem}.pdf")
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={out}", "file://" + urllib.parse.quote(html_path)],
                   check=True, capture_output=True)
    os.remove(html_path)
    print("  wrote", os.path.relpath(out, os.path.dirname(os.path.dirname(HERE))))


if __name__ == "__main__":
    for d in DOCS:
        build(d)
