# Estate management

Facility management for the family estate: three buildings, twelve units — five
at H18 and three at 502 Close on Banana Island, four at Osborne Foreshore. Tenants pay a
service charge and a diesel deposit; the office spends those funds on security,
water, repairs and fuel, and owes the tenants an account of it.

## The two ideas it rests on

**A generator run is the billable event.** Somebody starts the machine, somebody
stops it, and the minutes between the two are the only honest basis for
splitting a fuel bill. The rates are frozen onto the run at the moment it is
costed, so moving the rate card in October cannot restate what a tenant was
charged in June.

**A unit keeps a ledger, not a balance.** There is no cached balance column
anywhere: a balance is `SUM(amount)` over the rows and nothing else, and rows
are never edited or deleted. A mistake is corrected by an ADJUSTMENT that says
what it reverses. A balance you cannot explain line by line is exactly what a
tenant disputes.

## Turning it on

```bash
npm run migrate:deploy                       # applies 20260923100000_estate_management
npx tsx --env-file=.env scripts/seed-estate.ts
```

That creates five units at H18, three at 502 Close and four at Osborne
Foreshore, labelled APT 1 upwards within each building.

Environment:

| Variable | Required | What it does |
|---|---|---|
| `ESTATE_PORTAL_SECRET` | falls back to `NEXTAUTH_SECRET` | Signs the ground team's PIN session |
| `ESTATE_MANAGER_EMAIL` | optional | Emailed when a tenant files an emergency. Unset means no email is sent |

Then go to `/founder/estate/people`, add the tenants and the ground team, and
copy each person their link.

## The three surfaces

**`/founder/estate`** — the office. Overview, per-building rate card and
reconciliation, the jobs board, tenants and team, recording payments.

**`/estate/home/<token>`** — the tenant. Deposit balance and days of cover, what
each generator run cost them and why, reporting a problem with photographs, and
the status of everything they have reported.

**`/estate/crew/<token>`** — the ground team. The generator switch, the tank dip,
the delivery log, and their jobs. PIN in front, twelve-hour session.

## Access

There are no passwords. Each person has one link containing 256 bits of
randomness, and the link is the credential — the same arrangement as the client
project pages and the Maarova rater links. Rotating a link from
`/founder/estate/people` is the revocation mechanism: there is no session to
kill, so issuing a new token is what makes the old link stop working. Do it the
day a tenancy ends.

The ground team gets a four-digit PIN on top, because the gatehouse handset is
shared and the generator log is the one record that has to survive somebody else
picking the phone up. The PIN is shown once, at creation, and stored as a bcrypt
hash.

### Who covers what

Scope is stored narrowest-first and resolved on every request, never read from
the session — a supervisor moved between patches takes effect at once rather
than at the end of their shift.

| Scope | Covers | Who it is for |
|---|---|---|
| A building | That one | A guard on a gate |
| An area | Every building in it | The two supervisors: Banana Island is H18 and 502 Close together, Osborne is its own |
| Neither | All three | Anyone roving |

The area tier exists because Banana Island is two houses. Without it a
supervisor running both would have to be given all three buildings, which hands
them Osborne as well — and a mis-tap on a small screen there puts a fuel charge
on twelve strangers' bills.

The ground team as it stands:

| Role | Count | Scope |
|---|---|---|
| Supervisor | 2 | One per area |
| Security | 6 | Two per building — they hand over, so a run is often started on one shift and stopped on the next |
| Cleaner | 3 | One per building |
| Gardener | 3 | One per building |
| Pool service | 1 | Banana Island area — only H18 and 502 Close have pools |
| Service engineer | 1 | Engr Nurudeen, all three — receives the 200-hour reminder |

Two guards to a building is why the generator banner names whoever left the set
running. The incoming guard needs to know the meter is going without ringing
anybody, because the bill runs until somebody stops it.

Both public pages are `noindex, nofollow` with the referrer header turned off,
since the token is in the path. They are deliberately **not** listed in
`app/robots.ts`: a `Disallow` line would stop Google crawling the page and
therefore stop it ever seeing the `noindex`.

## Logging hours three ways

Hours are logged once and answer two questions: how the fuel bill splits, and
how close each set is to its service. So it matters that every hour gets in,
whether or not anybody was standing there.

1. **The live switch.** A guard presses START and STOP. Costed and charged the
   moment it stops.
2. **Writing up a past run.** Anyone on the ground, one date and two times. Open
   to guards, not just supervisors — the commonest reason a run is missing is
   that the guard was dealing with whatever made the power go out, and making
   him wait for a supervisor is how it never gets entered at all.
3. **Uploading a log sheet.** Supervisors only. A spreadsheet with a date column
   and an on and off column, whatever they are called. It always previews
   first — what it read, what it could not, and what clashes with runs already
   in the book — and writes nothing until the same file comes back confirmed.

All three go through identical costing and allocation. A backdated hour spends a
tenant's deposit no differently from a live one.

**Nothing can be billed twice.** Every path checks for a run whose window
overlaps, including one still open, and a run still RUNNING counts as running up
to now. A supervisor re-uploading last week's sheet with two days added to the
bottom is the normal case, so clashing rows are skipped and reported rather than
failing the batch.

An off time earlier than the on time means the set ran through the night. That
is read as crossing midnight, not as a negative duration — it is the busiest
shape of run here, and reading it wrong would silently drop the heaviest hours
of the week.

## The 200-hour service

Counted in running hours, not on a calendar: a set that ran four hundred hours
in a month is due before one that ran forty, and a date-based schedule cannot
see the difference.

| Status | When |
|---|---|
| OK | More than 20 hours to go |
| Due soon | Within 20 hours — book it |
| Due | At or past the interval |
| Overdue | 25% past it |

Two emails, each sent once: one at *due soon*, one at *due*. Both stamps clear
the moment a service is logged, which re-arms them for the next cycle. Without
those stamps every generator stop past 200 hours would send another email until
everybody filtered the sender, which is the failure mode that makes a reminder
system worse than none.

The notice goes to whoever holds the **service engineer** role for that
building, with `ESTATE_MANAGER_EMAIL` copied. If nobody holds the role, or the
person holding it has no email address, the building page says so plainly rather
than failing quietly — a reminder nobody is sent is a reminder nobody acts on.

**Logging the service is what resets the clock.** A service that happened and was
never entered leaves the set reading as permanently overdue, and everybody
learns to ignore the banner. The cost posts to the service charge as a
maintenance expense at the same time.

## Facilities

`hasPool` on the building drives what a tenant is offered to complain about.
Only H18 and 502 Close have pools, so "Swimming pool" does not appear for an
Osborne tenant — a category list containing things the building does not have is
how a report about something else ends up under Other, which is the one category
nobody can route.

## Photographs

The `cfa-uploads` bucket serves any object over its public r2.dev domain to
anyone holding the key, so the key is the only access control there is — and
these are pictures of the inside of people's homes. Keys are 256 bits with the
filename stripped out, and reads go back out as five-minute presigned GETs.
A durable public URL is never returned to a browser.

## One generator per building

Each building has its own generator, its own tank and its own rate card, so
throughout this section a building and a machine are the same thing. That is why
only one run can be open per building at a time, why reconciliation is per
building, and why a run only ever splits across the units of its own building.
It is also the assumption that would break first if a building gained a second
set — runs would then need to hang off a generator record rather than off the
building.

## Diesel: the numbers, and which of them mean anything

Three measurements, and it matters a great deal which question each answers.

| Check | What it compares | Tolerance | What a gap means |
|---|---|---|---|
| **Delivery** | Waybill litres against the dip rise across the discharge | 1% | Short delivery. Both sides are measured, so this is tight and worth an argument with the supplier |
| **Consumption** | What left the tank against run-hours × the agreed l/hr | 10% watch, 20% investigate | Usually the tariff needs retuning. Only a persistent one-directional gap is fuel walking off |
| **Meter drift** | The generator's own hour meter against the logged hours | any | The meter cannot be talked to. A log consistently longer than the meter is padded hours |

Wetstock practice puts a measured reconciliation under 1%. That belongs on the
delivery check and nowhere near the consumption check, where one side is an
assumed 10 l/hr against a set whose load swings between an empty Tuesday
afternoon and a full Saturday night. Applying 1% there would raise an alarm
every week and teach everyone to ignore alarms.

**Litres per hour is a tariff, not a measurement.** A 100 kVA set burns about
11 l/h at half load and about 21 l/h flat out, so "10 litres an hour" describes
anything from a 50 kVA to a 100 kVA set. Once there are two dips bracketing a
window, the building page shows what the tank implies and offers to adopt it.

**Price per litre is set by hand**, which is what the tenancies are written
against. The weighted average of what the fuel actually cost is computed
alongside and shown next to it, because the manual rate is the one number here
that can be wrong for months with no symptom other than the family quietly
subsidising its tenants. Switch a building to `WEIGHTED_AVERAGE` and runs cost
at that average instead.

## The split

`dieselShare` is a weight, not a percentage: every unit on 1 is an equal split,
a four-bedroom on 1.5 against a two-bedroom's 1 follows size. Percentages were
rejected because somebody has to keep them summing to 100 by hand.

- **Out-of-service** units leave the denominator entirely.
- **Vacant** and **family-occupied** units stay in it, and their share goes to
  the owner bucket. A vacancy is the landlord's cost, not a surcharge spread
  over whoever is still paying.
- The remainder is apportioned by largest fractional part with ties broken on
  unit id, so the same run always splits the same way and the lines plus the
  owner bucket sum to the run exactly, to the kobo.

## Jobs

Two clocks, reported separately, both starting at acknowledgement rather than at
submission — nobody is accountable for a message that arrived at 03:00.

| Priority | Respond | Resolve |
|---|---|---|
| Emergency | 1h | 8h |
| Urgent | 4h | 48h |
| Normal | 24h | 5 days |
| Whenever | 48h | 10 days |

**Marking a job fixed requires a photograph of the finished work and a
sentence.** The tenant's own photograph of the problem does not satisfy it. The
loudest complaint residents of Lagos estates make is not that the service charge
is high, it is that they cannot see anything happening for it — so the closed
ticket with a photograph on it is the accountability product, and the rule is
enforced in the API rather than in the form because it is exactly the rule that
gets skipped at eight in the evening.

## Not built yet

- **The statutory six-monthly account.** Under the Tenancy Law of Lagos State
  2011 a tenant paying a service charge is entitled to a separate receipt and a
  written account of how the money was disbursed at least every six months. The
  ledger holds everything needed; nothing generates the document.
- **Expenses.** `EstateExpense` exists and repairs post to it automatically from
  a job's cost, but there is no screen for entering security, water or waste
  spend, so the "what did the service charge buy" side of the account is thin.
- **Sub-metering.** Lagos prime is moving towards dual-tariff prepaid meters that
  bill grid and generator power separately. The allocation engine takes weights,
  so a per-unit reading table could feed it later without a rewrite.
- **Reserve fund.** There is a `RESERVE` expense category and nothing that uses
  it.
