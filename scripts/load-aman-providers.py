"""Load Aman's 400-provider list (established relationships) into the signing tracker.

Reads ~/Downloads/400_providers_with_contact_and_email.xlsx and writes a filled copy of
docs/aman/aman-signing-tracker.xlsx to docs/aman/aman-signing-tracker-loaded.xlsx.
The template is left untouched so build-aman-sprint.py can still regenerate it.

Split: three geographic clusters, one per caller, hospitals and clinics first.
Rows with no usable LGA are dealt out to even the three lists.
"""
import re
import sys
from collections import Counter
from pathlib import Path

import openpyxl

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else Path.home() / "Downloads/400_providers_with_contact_and_email.xlsx")
ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "docs/aman/aman-signing-tracker.xlsx"
OUT = ROOT / "docs/aman/aman-signing-tracker-loaded.xlsx"

LGA_FIX = {"Ibeju/Lekki": "Ibeju-Lekki"}
CLUSTERS = {
    "Island and Lekki": ["Eti-Osa", "Ibeju-Lekki", "Lagos Island", "Epe", "Apapa", "Ajeromi-Ifelodun"],
    "Mainland north": ["Ikeja", "Kosofe", "Ikorodu", "Ifako-Ijaye", "Agege", "Shomolu"],
    "Mainland west": ["Alimosho", "Oshodi-Isolo", "Surulere", "Amuwo-Odofin", "Ojo", "Lagos Mainland", "Mushin", "Badagry"],
}
OWNER = {"Island and Lekki": "Ruth", "Mainland north": "Favour", "Mainland west": "Gidado"}
LGA_TO_CLUSTER = {lga: c for c, lgas in CLUSTERS.items() for lga in lgas}
# Checked 11 Nov 2026 against Favour's signed list (AMAN HMO PROVIDER UPDATE.xlsx, 120 rows).
# Same provider, already signed: left out of the tracker.
ALREADY_SIGNED = {66: "BMH Medical Services", 67: "BMH Medical Services", 68: "BMM Hospital and Dialysis",
                  175: "Just Vision Eye Centre (same email and phone)", 249: "Haven Opticals Ltd",
                  250: "Havilah Eyecare and Optical Services", 251: "Havilah Eyecare and Optical Services",
                  296: "Jefis Specialist Hospital and Maternity"}
# Kept, but tied to a signed provider: the caller checks before pitching.
RELATED_TO_SIGNED = {148: "DrugstoreNG Pharmacy has signed: confirm with Matthew whether that SLA covers this branch.",
                     149: "DrugstoreNG Pharmacy has signed: confirm with Matthew whether that SLA covers this branch.",
                     365: "Mecure Healthcare Lekki has signed: confirm with Matthew whether that SLA covers Oshodi.",
                     10: "Smiley Optical, Surulere, has signed: check whether it is the same owner.",
                     136: "Shares an email with Neurocept Eye Clinic, which has signed: check whether it is the same owner.",
                     359: "Maxi Specialist Hospital, Eti-Osa, has signed: check whether it is the same owner."}
TYPE_ORDER = ["Hospital", "Clinic", "Specialist clinic", "Dental", "Optical", "Diagnostic centre", "Laboratory", "Pharmacy", "Other"]


def clean_lga(v):
    v = LGA_FIX.get(str(v or "").strip(), str(v or "").strip())
    return v if v in LGA_TO_CLUSTER else ""


def map_type(cat, name):
    cat = str(cat or "").split(";")[0].strip().upper()
    n = name.upper()
    if "HOSPITAL" in cat or cat in ("", "NONE"):
        if "HOSPITAL" in n:
            return "Hospital"
        if "CLINIC" in n or "MEDICAL" in n or "MEDICARE" in n or "HEALTH" in n:
            return "Clinic"
        return "Hospital" if "HOSPITAL" in cat else "Other"
    if "EYE" in cat or "OPTIC" in cat:
        return "Optical"
    if "DENTAL" in cat:
        return "Dental"
    if "PHARM" in cat:
        return "Pharmacy"
    if "DIAG" in cat or "LAB" in cat:
        return "Laboratory" if "LAB" in n and "DIAGNOS" not in n else "Diagnostic centre"
    return "Other"


def clean_phones(v):
    out = []
    for p in re.split(r"[,|/;]|\bor\b", str(v or "")):
        d = re.sub(r"\D", "", p)
        if d.startswith("234"):
            d = "0" + d[3:]
        if len(d) == 10 and d[0] in "789":
            d = "0" + d
        if len(d) == 11 and d[0] in "789" and d.endswith("0"):  # source quirk: leading 0 shifted to the end
            d = "0" + d[:10]
        if (len(d) == 11 or (len(d) == 9 and d.startswith("01"))) and d.startswith("0") and d not in out:
            out.append(d)  # 9 digits starting 01 = Lagos landline
    return ", ".join(f"{d[:4]} {d[4:7]} {d[7:]}" if len(d) == 11 else f"{d[:2]} {d[2:5]} {d[5:]}" for d in out)


def clean_emails(v):
    out = []
    for e in re.split(r"[,|;\s]+", str(v or "")):
        e = e.strip().lower()
        if "@" in e and e not in out:
            out.append(e)
    return ", ".join(out)


rows = []
for r in list(openpyxl.load_workbook(SRC, read_only=True, data_only=True)["400 Providers"].iter_rows(values_only=True))[1:]:
    r = list(r) + [None] * 8
    if not r[2]:
        continue
    if int(r[0]) in ALREADY_SIGNED:
        continue
    name = re.sub(r"\s+", " ", str(r[2])).strip()
    lga = clean_lga(r[1])
    branches = str(r[6] or "").strip()
    # Favour, 11 Nov 2026: none has signed; earlier contact reached front desks only.
    notes = f"Aman provider list no. {int(r[0])}. Not signed. Any earlier Aman contact was front desk only: ask for the MD and the MD's own email."
    if int(r[0]) in RELATED_TO_SIGNED:
        notes += " " + RELATED_TO_SIGNED[int(r[0])]
    if branches and branches not in ("0", "1"):
        notes += f" {branches} branches: confirm whether one SLA covers all."
    if not clean_phones(r[4]):
        notes += f" Phone in source is incomplete ({r[4]}): use email first."
    if not lga:
        notes += f" LGA not in source ({str(r[1] or 'blank').strip()}): confirm address on first call."
    rows.append(dict(no=int(r[0]), raw_name=str(r[2]).strip(), raw_lga=(str(r[1]).strip() if r[1] is not None and str(r[1]).strip() else None),
                     name=name, type=map_type(r[3], name), lga=lga, cluster=LGA_TO_CLUSTER.get(lga, ""),
                     phone=clean_phones(r[4]), email=clean_emails(r[5]), notes=notes))

# Deal rows with no LGA to whichever list is shortest.
counts = Counter(OWNER[x["cluster"]] for x in rows if x["cluster"])
for x in rows:
    if x["cluster"]:
        x["owner"] = OWNER[x["cluster"]]
    else:
        x["owner"] = min(counts, key=counts.get)
        counts[x["owner"]] += 1

owner_order = ["Ruth", "Favour", "Gidado"]
rows.sort(key=lambda x: (owner_order.index(x["owner"]), TYPE_ORDER.index(x["type"]), x["lga"] or "~", x["name"]))

wb = openpyxl.load_workbook(TEMPLATE)
ws = wb["Tracker"]
if len(rows) > ws.max_row - 1:
    sys.exit(f"{len(rows)} rows will not fit the tracker's {ws.max_row - 1}")
for i, x in enumerate(rows, start=2):
    vals = {1: x["name"], 3: x["type"], 4: x["lga"], 5: x["cluster"], 8: x["phone"], 9: x["email"],
            10: "Aman BD pipeline", 11: x["owner"], 12: "Target", 22: x["notes"]}
    for col, v in vals.items():
        ws.cell(row=i, column=col, value=v)
wb.save(OUT)

# For scripts/seed-aman-sprint.ts: who owns what, keyed so the seed can find
# each provider in the CFA directory. Names and assignments only, no contacts.
if len(sys.argv) > 2:
    import json
    Path(sys.argv[2]).write_text(json.dumps([
        {k: x[k] for k in ("no", "raw_name", "raw_lga", "type", "cluster", "owner", "notes")} for x in rows
    ], indent=1))
    print("assignments ->", sys.argv[2])

print(f"{len(rows)} rows -> {OUT.relative_to(ROOT)}")
for o in owner_order:
    mine = [x for x in rows if x["owner"] == o]
    print(o, len(mine), dict(Counter(x["type"] for x in mine)))
print("no phone:", sum(1 for x in rows if not x["phone"]), " no email:", sum(1 for x in rows if not x["email"]))
