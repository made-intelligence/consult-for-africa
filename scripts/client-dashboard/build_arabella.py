"""
Compose Arabella's client dashboard from the analysed facts.

    python3 scripts/client-dashboard/build_arabella.py <ledger.json> <directory.json> <surveys.json> <out.json>

The figures come from analyse_ledger.py, analyse_directory.py and
export-surveys.ts. What this file adds is the reading: which figures matter,
what they are measured against, and what to do next. It is written to Dr Chito
and Tolu, because the portal shows it to them, so it describes the business and
never a person, and every finding says where it came from.

The next client copies this file, not the page: the analysers and the renderer
stay as they are.
"""
from __future__ import annotations

import json, statistics, sys
from pathlib import Path

ledger, directory, surveys_path, out = sys.argv[1:5]
L = json.load(open(ledger))
D = json.load(open(directory))
S = json.load(open(surveys_path))

M = lambda n: f"₦{n / 1_000_000:.1f}m"
K = lambda n: f"₦{round(n / 1000)}k"

# ---- the money ---------------------------------------------------------------

monthly = L["monthly"]
total = L["total"]
avg = total / len(monthly)
biggest = L["largest"][0]
avg_without_biggest = (total - biggest["amount"]) / len(monthly)
patients_avg = statistics.mean(m["patients"] for m in monthly)
payments_avg = statistics.mean(m["payments"] for m in monthly)

LABEL = {
    "Labs": "Laboratory", "Obgyn Consultation": "O&G consultations", "Fertility": "Fertility",
    "Pharmacy": "Pharmacy", "Procedure": "Procedures", "Packages": "Maternity packages",
    "Gp Consultation": "GP consultations", "Wellness": "Wellness", "Admission": "Admissions",
    "Imaging": "Imaging", "Registration": "Registration fees", "Insurance": "HMO payments",
    "Consultant": "Visiting consultants",
}
svc = {}
for k, v in L["service_total"].items():
    lab = LABEL.get(k, "Other")
    svc[lab] = svc.get(lab, 0) + v
svc_items = sorted(svc.items(), key=lambda x: -x[1])
labs_share = svc.get("Laboratory", 0) / total
packages = svc.get("Maternity packages", 0)
hmo = svc.get("HMO payments", 0)
registrations_paid = round(svc.get("Registration fees", 0) / 10_000)

notes = {3: f"one payment of {M(biggest['amount'])}, mostly fertility", 9: "one procedure payment of ₦2.0m, and the first admissions recorded"}
revenue_series = [dict(label=m["label"], value=m["revenue"], note=notes.get(m["month"])) for m in monthly]
for p in revenue_series:
    if not p["note"]: p.pop("note")

# ---- the patients ------------------------------------------------------------

one_visit_share = L["one_visit"] / L["patients"]
weekend = sum(L["weekday"].get(d, 0) for d in ("Fri", "Sat", "Sun"))
new_by_month = L["new_by_month"]

# ---- the list ----------------------------------------------------------------

yrs = D["by_year"]
recent = sum(v for k, v in yrs.items() if k.isdigit() and int(k) >= 2023)
before_2019 = sum(v for k, v in yrs.items() if k.isdigit() and int(k) < 2019)
hmo_registered = sum(v for k, v in D["payer"].items() if k not in ("PRIVATE", "STAFF", "NOT RECORDED", "OUTREACH/CHARITY"))
reg_2026 = yrs.get("2026", 0)

# ---- the surveys -------------------------------------------------------------

src = (Path(__file__).resolve().parents[1] / "build-arabella-surveys.py").read_text().split("if __name__")[0]
g: dict = {"__file__": "build-arabella-surveys.py"}
exec(compile(src, "build-arabella-surveys.py", "exec"), g)


def qmap(spec):
    n, out = 0, {}
    for sec in spec["sections"]:
        qs = next(x for x in sec if isinstance(x, list))
        for q in qs:
            n += 1
            text = q if isinstance(q, str) else str(q)
            # Some statements only make sense with their heading, e.g. "The list starts on time".
            out[f"q{n}"] = f"{sec[0].split(' and ')[0]}: {text}" if sec[0].startswith(("Theatre", "The delivery room", "The fertility")) else text
    return out


staff_q = qmap(g["STAFF"])
staff = [r["payload"] for r in S if r["survey"] == "arabella-staff-culture"]
# Statements where agreeing is the bad answer. Shown as written, flagged, never flipped.
NEGATIVE = ("feels unsafe", "afraid to ask", "held against them", "run short")
scores = []
for k, text in staff_q.items():
    v = [float(p[k]) for p in staff if str(p.get(k, "")).strip() in ("1", "2", "3", "4", "5")]
    if len(v) >= 5:  # fewer than five answers could point at one person in a team this size
        neg = any(w in text for w in NEGATIVE)
        scores.append(dict(text=text, mean=statistics.mean(v), n=len(v), neg=neg,
                           good=(6 - statistics.mean(v)) if neg else statistics.mean(v)))
scores.sort(key=lambda s: s["good"])
weakest = scores[:6]
strongest = sorted(scores, key=lambda s: -s["good"])[:5]


def row(s):
    label = s["text"] + (" (agreeing is the bad answer)" if s["neg"] else "")
    return dict(label=label, values=[f"{s['mean']:.1f}", s["n"]])


lead_q = qmap(g["LEADERSHIP"])
lead = {}
for r in S:
    if r["survey"] == "arabella-leadership-direction":
        who = str(r["payload"].get("respondent", "")).lower()
        lead["chito" if "chito" in who else "tolu" if "tolu" in who else who] = r["payload"]
lc, lt = lead.get("chito", {}), lead.get("tolu", {})


def both(k):
    a, b = lc.get(k), lt.get(k)
    return a, b


differ, agree = [], []
for k, text in lead_q.items():
    a, b = both(k)
    if str(a).isdigit() and str(b).isdigit():
        (differ if abs(int(a) - int(b)) >= 2 else agree).append(dict(label=text, values=[int(a), int(b)]))
agree_low = [r for r in agree if max(r["values"]) <= 3]

# ---- compose -----------------------------------------------------------------

data = dict(
    headline=(
        f"Arabella took {M(total)} from January to September 2026, about {M(avg)} a month, "
        f"from an average of {round(patients_avg)} paying patients a month."
    ),
    period="January to September 2026",
    sections=[
        dict(
            title="What Arabella earns",
            lead="Every payment in the sales record, added up by month and by service. These are receipts, money that came in, not what was billed.",
            blocks=[
                dict(kind="kpis", items=[
                    dict(label="Taken, Jan to Sep", value=total, unit="NGN", note=f"{L['rows']} payments in the sales record"),
                    dict(label="Average month", value=avg, unit="NGN",
                         note=f"{M(avg_without_biggest)} without the single largest payment. You both put it at ₦5m to ₦8m"),
                    dict(label="Paying patients a month", value=round(patients_avg), unit="count", note=f"about {round(payments_avg)} payments a month"),
                    dict(label="Typical payment", value=L["ticket"]["median"], unit="NGN",
                         note=f"half fall between {K(L['ticket']['p25'])} and {K(L['ticket']['p75'])}"),
                ]),
                dict(kind="series", title="Money in, by month", unit="NGN", points=revenue_series,
                     reference=dict(label="Average", value=avg)),
                dict(kind="breakdown", title="Where it came from", unit="NGN",
                     note="January to September, by the service line it was recorded against",
                     items=[dict(label=k, value=v) for k, v in svc_items if v >= 50_000]),
                dict(kind="findings", title="What stands out", items=[
                    dict(tone="concern", headline="The strong months are made by one or two payments",
                         detail=(f"March's {M(monthly[2]['revenue'])} includes a single payment of {M(biggest['amount'])}, almost all of it fertility, and September includes "
                                 f"one procedure payment of ₦2.0m. Without them, months run between {M(min(m['revenue'] for m in monthly))} and "
                                 f"{M(sorted(m['revenue'] for m in monthly)[-3])}. A business that depends on occasional large cases is hard to plan, staff and stock around."),
                         source="Sales record"),
                    dict(tone="watch", headline=f"The laboratory is the biggest line, at {round(labs_share * 100)}% of everything taken",
                         detail="That is more than consultations. What it is worth depends on what each test costs Arabella, and the records do not show that yet. If many samples go out to another laboratory, the margin may be thin.",
                         source="Sales record, staff list"),
                    dict(tone="concern", headline="Maternity is not yet where the money comes from",
                         detail=(f"Maternity packages brought in {M(packages)} in nine months. At list prices of ₦700,000 to ₦1.5m, that is between two and four packages. "
                                 "Admissions appear for the first time in September. Maternity is where the brand is pointed, so this is the gap that matters most."),
                         source="Sales record, price list"),
                    dict(tone="watch", headline=f"Insurers paid {M(hmo)}, under 2% of the total",
                         detail=(f"Yet {hmo_registered:,} records in the patient list were registered under an HMO or a company, {D['payer'].get('AXA MANSARD', 0)} of them with AXA Mansard. "
                                 "Either those patients have stopped coming, or claims are owed and have not been paid. The receivables list will tell us which."),
                         source="Sales record, patient list"),
                ]),
            ],
        ),
        dict(
            title="Who comes, and whether they come back",
            lead="Patients are matched by the name written in the sales record, so a name spelt two ways counts twice. Treat these as close, not exact.",
            blocks=[
                dict(kind="kpis", items=[
                    dict(label="Patients who paid", value=L["patients"], unit="count", note="January to September"),
                    dict(label="Paid only once", value=round(one_visit_share * 100), unit="percent", tone="concern",
                         note=f"{L['one_visit']} of {L['patients']} patients"),
                    dict(label="Three visits or more", value=L["three_plus"], unit="count"),
                    dict(label="New patients a month", value=round(statistics.mean(new_by_month.values())), unit="count", note="first payment this year"),
                ]),
                dict(kind="series", title="New patients, by month", unit="count",
                     points=[dict(label=m["label"], value=new_by_month[str(m["month"])] if str(m["month"]) in new_by_month else new_by_month.get(m["month"], 0)) for m in monthly]),
                dict(kind="breakdown", title="Payments by day of the week", unit="count",
                     note=f"From the {L['dated_rows']} payments with a date that can be read",
                     items=[dict(label=d, value=L["weekday"].get(d, 0)) for d in ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")]),
                dict(kind="findings", title="What stands out", items=[
                    dict(tone="concern", headline="Most patients are seen once",
                         detail="Antenatal care, fertility and gynaecology follow-up are relationships that run over months. Seven in ten patients paying once suggests that follow-up is not being booked before the patient leaves, or that she goes elsewhere for the next step.",
                         source="Sales record"),
                    dict(tone="watch", headline="Friday to Sunday are quiet",
                         detail=f"{weekend} of {L['dated_rows']} dated payments fall on a Friday, Saturday or Sunday. Working women often can only come at the weekend, so the question is whether that is demand or opening hours.",
                         source="Sales record"),
                ]),
            ],
        ),
        dict(
            title="The patient list",
            lead="The directory export from the records system. Counted only: no name, number or address leaves the file.",
            blocks=[
                dict(kind="kpis", items=[
                    dict(label="Records", value=D["records"], unit="count", tone="good", note="more than the 3,000 previously quoted"),
                    dict(label="Distinct email addresses", value=D["distinct_email"], unit="count", note=f"on {D['valid_email']:,} records; families often share one"),
                    dict(label="Usable mobile numbers", value=D["plausible_mobile"], unit="count", tone="concern", note=f"{round(D['with_phone'] / D['records'] * 100)}% of records have any phone number"),
                    dict(label="Registered since 2023", value=recent, unit="count"),
                ]),
                dict(kind="series", title="New registrations, by year", unit="count",
                     points=[dict(label=k, value=v, **({"note": f"{D['largest_single_day']['records']:,} entered on one day, {D['largest_single_day']['date']}, likely when the list moved into this system"} if k == "2018" else {}))
                             for k, v in yrs.items() if k.isdigit()]),
                dict(kind="findings", title="What stands out", items=[
                    dict(tone="good", headline="The list is real, and most of it can be reached by email",
                         detail=f"{D['valid_email']:,} records carry a valid email. That is an asset most practices would pay to build.",
                         source="Patient list"),
                    dict(tone="watch", headline="It is old, and it has been growing more slowly",
                         detail=f"{round(before_2019 / D['records'] * 100)}% of records date from before 2019. New registrations fell from {yrs.get('2021', 0)} in 2021 to {yrs.get('2024', 0)} in 2024, and stand at {reg_2026} so far this year.",
                         source="Patient list"),
                    dict(tone="concern", headline="Phone numbers are missing for most patients",
                         detail="In a city that books by WhatsApp, a list without numbers can only be reached one way. Capturing a mobile number at every visit costs nothing and is the single easiest fix in this dashboard.",
                         source="Patient list"),
                    dict(tone="watch", headline="Registrations and registration fees do not match",
                         detail=f"The list shows {reg_2026} new registrations this year. The sales record shows {registrations_paid} registration fees. Some will be package patients whose fee is included, and the rest is worth checking at the front desk.",
                         source="Patient list, sales record"),
                    dict(tone="neutral", headline="Before anyone on the list is contacted",
                         detail="Most of these records were created under Tabitha. Contacting them as Arabella needs a lawful basis under the Nigeria Data Protection Act, which is one of the questions in section H of the request.",
                         source="Information request"),
                ]),
            ],
        ),
        dict(
            title="How the team sees it",
            lead=f"{len(staff)} anonymous staff responses, scored 1 (disagree) to 5 (agree). Statements with fewer than five answers are left out, so no answer can be traced to one person.",
            blocks=[
                dict(kind="compare", title="Where the team is most confident", columns=["Average", "Answers"], rows=[row(s) for s in strongest]),
                dict(kind="compare", title="Where the team is least sure", columns=["Average", "Answers"], rows=[row(s) for s in weakest],
                     note="Some statements are worded negatively, so a high score is the worrying one. Those are marked."),
                dict(kind="findings", title="What the team wrote, in their own words, grouped", items=[
                    dict(tone="good", headline="Respect and a family feeling", detail="The most common thing people value is how they treat each other, and how patients are treated. Kindness to patients is the highest-scoring statement in the survey.", source="Staff survey"),
                    dict(tone="watch", headline="Speaking up is harder than it should be", detail="Questioning a senior decision, and being afraid to ask when something seems wrong, both sit around the middle of the scale. In a maternity unit, that is the measure that matters most in an emergency.", source="Staff survey"),
                    dict(tone="watch", headline="Too much runs through too few people", detail="Several people wrote that decisions wait for the Head of Nursing or for Dr Chito. Staff want to be trusted to decide more for themselves.", source="Staff survey"),
                    dict(tone="watch", headline="The day starts late", detail="The working day is meant to begin at 8am and usually begins nearer 9am, so an early patient meets a team that is not yet ready.", source="Staff survey"),
                    dict(tone="concern", headline="Patient details are sometimes discussed where others can hear", detail="Raised about the front desk. A quick fix, and an important one for a women's health practice.", source="Staff survey"),
                ]),
            ],
        ),
        dict(
            title="Where the two of you agree, and where you differ",
            lead="Dr Chito's and Tolu's answers to the leadership survey, side by side. A difference is not a problem. It is usually the most useful conversation to have first.",
            blocks=[
                dict(kind="compare", title="Where your answers differ", columns=["Dr Chito", "Tolu"], rows=differ,
                     note="1 is strongly disagree, 5 is strongly agree"),
                dict(kind="compare", title="Where you agree, and both score it 3 or lower", columns=["Dr Chito", "Tolu"], rows=agree_low),
                dict(kind="text", title="In your own words",
                     body=(f"What Arabella earns in an average month today: you both said {str(lc.get('baseline', '?')).lower()}, and the sales record says {M(avg)}.\n"
                           f"What it could earn in twelve months if this goes well: Dr Chito said {str(lc.get('target', 'not given')).lower()}, Tolu said {str(lt.get('target', 'not given')).lower()}.\n"
                           f"What stands in the way: Dr Chito said {str(lc.get('constraint', '')).lower()}, Tolu said {str(lt.get('constraint', '')).lower()}.\n"
                           "You agree on one thing above all: the business depends too heavily on Dr Chito, clinically and in decisions, and that is the first thing to change.")),
            ],
        ),
        dict(
            title="What the records can and cannot tell us yet",
            blocks=[
                dict(kind="checks", title="What has come in", note="Against the information request", items=[
                    dict(label="Sales record", status="partial", detail=(
                        f"Every payment logged with its service and how it was paid, and it agrees with its own summary sheet in every month but April, where the two are ₦20,000 apart. But it is still headed Tabitha Medical Centre, "
                        f"the summary stops at July, {L['issues'].get('date with day and month swapped', 0) + L['issues'].get('date typed as text', 0)} of {L['rows']} dates are typed as text or have the day and month swapped, and there is no patient number.")),
                    dict(label="Price list", status="partial", detail="More than 300 items priced. The laparoscopic procedures are still marked TBD, there are no fertility or IVF prices although fertility brought in ₦6m, and the Platinum package price is mistyped."),
                    dict(label="HMO panels", status="partial", detail="Seven named: Henner, Allianz, AXA Mansard, Leadway, Reliance, ECOWAS on retainer, and Clearline. Tariffs are to follow."),
                    dict(label="Staff list", status="ok", detail="Roles, employment type, days and reporting lines for everyone, plus ten visiting consultants. No embryologist is named for the fertility service."),
                    dict(label="Pharmacy stock", status="partial", detail="A handwritten register with quantities and expiry dates, counted on 22 September and 5 October. Without unit costs, the stock's value and the pharmacy's margin cannot be worked out."),
                    dict(label="Company registration", status="ok", detail="RC 1802696, Arabella Women's Health & Wellness Ltd, incorporated 7 June 2021 and renamed on 9 September 2024. The registered name differs from the one on the door."),
                    dict(label="Patient list", status="ok", detail="Received, and used only for the counts on this page."),
                    dict(label="Bank statements", status="missing", detail="Needed to confirm the sales record against what reached the bank."),
                    dict(label="Monthly costs", status="missing", detail="Without them nobody can say which services make money. This is the most important gap."),
                    dict(label="HMO receivables", status="missing", detail="What each insurer owes and for how long."),
                ]),
            ],
        ),
    ],
    sources=[
        dict(name="Sales record", detail=f"Tabitha Medical Centre sales report, January to September 2026, {L['rows']} payments. Months are taken from the sheet each payment sits on."),
        dict(name="Patient list", detail=f"Client directory export, {D['records']:,} records. Counted only."),
        dict(name="Price list", detail="Arabella price list 2026."),
        dict(name="Staff and HMO lists, pharmacy stock, company certificate", detail="As uploaded on 8 and 9 October 2026."),
        dict(name="Staff survey", detail=f"{len(staff)} anonymous responses."),
        dict(name="Leadership survey", detail="Dr Chito Nwana and Tolu Williams, answered in their own names."),
    ],
)

json.dump(data, open(out, "w"), indent=1, ensure_ascii=False)
print(f"dashboard -> {out}")
