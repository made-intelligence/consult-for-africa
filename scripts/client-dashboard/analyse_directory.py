"""
Profile a patient directory export and write aggregate facts as JSON.

    python3 scripts/client-dashboard/analyse_directory.py <directory.csv> <facts.json>

Answers the questions a reactivation case rests on: how many records, how old,
how many can actually be reached and through which channel, and which payer
each was registered under. Column names are matched loosely (tel/phone/mobile,
email, reg_date/registered, retainer/payer/scheme) so another system's export
reads without edits.

No contact detail, address or name is ever written out. Only counts.
"""
from __future__ import annotations

import collections, csv, datetime, json, re, sys


def col(headers, *words):
    """First header matching the earliest word, so "retainer_name" beats "retainer_id"."""
    for w in words:
        for h in headers:
            if w in h.lower(): return h
    return None


def parse_date(s: str):
    for f in ("%d-%b-%Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d %b %Y"):
        try: return datetime.datetime.strptime(s.strip(), f)
        except ValueError: pass
    return None


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    rows = list(csv.DictReader(open(src, encoding="utf-8-sig", errors="replace")))
    h = list(rows[0].keys()) if rows else []
    tel, email, reg = col(h, "tel", "phone", "mobile"), col(h, "email"), col(h, "reg", "date")
    payer = col(h, "retainer_name", "payer", "scheme", "hmo", "retainer")
    get = lambda r, c: (r.get(c) or "").strip() if c else ""

    years, same_day = collections.Counter(), collections.Counter()
    for r in rows:
        d = parse_date(get(r, reg))
        years[d.year if d else "unknown"] += 1
        same_day[get(r, reg)] += 1
    biggest_day, biggest_n = same_day.most_common(1)[0] if same_day else ("", 0)

    emails = [get(r, email).lower() for r in rows if get(r, email)]
    valid = [e for e in emails if re.fullmatch(r"[^@\s]+@[^@\s]+\.[a-z]{2,}", e)]
    shared = collections.Counter(valid)
    phones = [re.sub(r"\D", "", get(r, tel)) for r in rows if get(r, tel)]
    mobile = [p for p in phones if re.fullmatch(r"(234|0)?[789][01]\d{8}", p)]

    payers = collections.Counter(get(r, payer).upper() or "NOT RECORDED" for r in rows)
    facts = dict(
        records=len(rows),
        by_year={str(k): v for k, v in sorted(years.items(), key=lambda x: str(x[0]))},
        largest_single_day=dict(date=biggest_day, records=biggest_n),
        with_email=len(emails), valid_email=len(valid), distinct_email=len(shared),
        records_on_shared_email=sum(v for v in shared.values() if v >= 2),
        with_phone=len(phones), plausible_mobile=len(mobile),
        both=sum(1 for r in rows if get(r, tel) and get(r, email)),
        neither=sum(1 for r in rows if not get(r, tel) and not get(r, email)),
        with_address=sum(1 for r in rows if get(r, col(h, "address"))),
        payer=dict(payers.most_common()),
        has_name_column=any(re.search(r"(^|_| )(patient|full|first|last)?_?name$", x.strip().lower()) and x != payer for x in h),
    )
    json.dump(facts, open(out, "w"), indent=1)
    print(f"{len(rows)} records -> {out}")


if __name__ == "__main__":
    main()
