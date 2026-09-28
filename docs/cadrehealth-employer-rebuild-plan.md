# CadreHealth: rebuilding the employer side

Plan for review. Nothing built yet.
18 September 2026

---

## 1. Where it stands

Live figures, queried today.

| | |
|---|---|
| Professionals on the register | 10,229 |
| Visible to an employer searching | **30** |
| Employer accounts | 4 |
| Verified employers | 0 |
| Employer accounts linked to a facility | 0 |
| Roles posted, ever | 2 |
| Applications received, ever | **0** |

### Why search returns 30 of 10,229

`app/api/cadre/employer/search/route.ts` opens every query with

```ts
const where: any = { availability: { in: ["ACTIVELY_LOOKING", "OPEN_TO_OFFERS"] } };
```

No member can set `availability`. It is absent from the profile PATCH endpoint, the
claim flow, the registration flow and the import. The only code that writes it is
express-apply, on records it creates from scratch. So the field is set on 30 rows
and null on 10,199, and an employer who signs up today searches a database of
10,229 people and is shown thirty.

Two of the remaining five filters are close to useless on top of that: state is
known for 559 records (5.5%), years of experience for 233 (2.3%). A hospital that
filters Medicine plus Lagos plus five years gets nothing, twice over.

### Why the structure is not MECE

Navigation today is Dashboard, Post Role, Applications, Search.

- **Post Role** is an action sitting in a list of places.
- **Applications** is not applications. It is the list of roles, and the applicant
  list is one level down.
- **Search** and **Applications** both show candidates, with different cards,
  different fields and no shared shortlist between them.
- There is no account section at all. No team, no facility, no route to
  verification beyond a panel that says "contact us" and names no one.
- Roles cannot be edited, paused, closed or marked filled. Once posted, a role is
  live forever.

The deepest overlap is that `CadreMandateMatch` holds two different things in one
table: people who applied to you, and people the matcher swept in. They are owed
opposite behaviour. Merging them means the applicant count cannot be trusted and
the one person who actually applied is buried among fifty who did not.

### Defects found on the way

| Where | What |
|---|---|
| `api/cadre/mandates/[id]/match/route.ts` | No authentication of any kind. Anyone with a mandate id can write 50 match rows and flip the role's status. |
| `api/cadre/jobs/[id]/apply/route.ts` | Writes `status: "APPLIED"`, which is not a valid status in the employer PATCH allow-list, the UI status list, or the schema comment. The employer UI silently renders it as "Matched". |
| `employer/applications/page.tsx` | `STATUS_STYLES` covers OPEN, PAUSED, CLOSED, FILLED. The enum is OPEN, SOURCING, SHORTLISTED, INTERVIEWING, OFFER_EXTENDED, PLACED, CLOSED, CANCELLED. PAUSED and FILLED do not exist; six real values fall through to the green "open" style. |
| `employer/search/page.tsx` | "View Profile Summary" records a view and never navigates. The profile page exists and is unreachable from search. |
| `api/cadre/profile/route.ts` | `recomputeCompleteness` awards 5 points for `openTo`, a field with no input anywhere in the product. Every member is capped below 100%. |
| `lib/cadreEmployerAuth.ts` | The session JWT caches `companyName` and `isVerified` for 30 days. Verifying an employer does not take effect until they log out. |
| tenancy | Roles are scoped by `facilityName === session.companyName`, a string comparison. Two accounts typing the same hospital name see each other's roles and applicants. All 4 live accounts are scoped this way, because none has a facility. |
| `CadreEmployerAccount.facilityId` | `@unique`. One login per facility, ever. A hospital cannot give its HR manager and its CMD separate accounts. |
| employer applicant actions | Status is changed through a dropdown, against the house rule that review interfaces use explicit action buttons. |
| employer applicant and search cards | Render `{firstName} {lastName}` directly. Per `lib/cadreSalutation.ts`, the import put titles in `firstName` and middle names in `lastName`; 28% of these render the wrong name. |

---

## 2. What the employer side should be

**Search-first, not post-first.** A hospital can already post a job free on LinkedIn
and in NMA groups. What it cannot do is find the eleven paediatric cardiologists in
Lagos and know which are real. The register is the asset, so the register is what we
lead with. A hospital should see the people before it signs up.

**The unit of work is a shortlist.** The real task is "I need a consultant
paediatrician, build me a list of ten". Search, add, compare, decide who to
approach. A posted role is a shortlist that also takes inbound.

**Every candidate carries an honesty label.** `specialtyConfirmedAt` is set on 80 of
10,183 records, so 99% of displayed specialties are what a register said, not what
the doctor says. We show that difference rather than hide it: confirmed by them or
taken from the register, licence verified or claimed, last seen or never logged in.
A hospital that learns we never overstate will believe us when we say verified.

**Contact is the gate.** Search is generous and free. Contact is held by two
consents: the member's, and the employer's verification. That is the privacy
mechanism and the commercial mechanism in one place.

**Applied and sourced never share a list.** An applicant is owed a reply. A sourced
candidate is owed an approach.

**No empty screens.** Today search returns zero, applications says "no roles
posted", and the dashboard shows 0 and 0. Three dead ends in the first minute.
Every empty state carries a live number from the register and one next action.

**Emigration scores come off.** The applicant card shows UK, US, Canada and Gulf
readiness, and search ranks by readiness. We are telling a Lagos hospital how ready
its candidate is to leave, and sorting the most ready to leave to the top. Domestic
readiness stays. The rest is for the member's own eyes.

---

## 3. The MECE cut

Four sections, one question each, no overlap.

| Section | The question it answers | Pages |
|---|---|---|
| **Roles** | What am I hiring for? | list, new, edit, detail with status control |
| **Candidates** | Who is out there? | search, shortlists, shortlist detail, profile |
| **Pipeline** | Who is in play, and what do I owe them? | per-role board, applied and sourced kept apart |
| **Account** | Who are we, who can log in, are we verified? | organisation, team, verification |

Dashboard sits above the four and answers only "what needs me today": applicants
waiting on a reply, contact requests answered since you last looked, roles open
with no candidates.

```
TODAY                          AFTER
  Dashboard                      Dashboard      what needs me today
  Post Role      ─┐              Roles          what I am hiring for
  Applications   ─┴──→           Candidates     who is out there
  Search                         Pipeline       who is in play
  (none)                         Account        who we are
```

---

## 4. Schema changes

One migration, `20260918_cadre_employer_rebuild`. Backfill is small: 4 employer
accounts, 2 roles, 0 matches.

1. **`CadreEmployerOrg`** (new). The tenancy boundary and the verification subject.
   `id, name, facilityId?, isVerified, verifiedAt, verifiedBy, createdAt`.
   Backfill one org per existing account.
2. **`CadreEmployerAccount.orgId`** plus `role` (`OWNER | RECRUITER | VIEWER`) and
   `invitedAt / acceptedAt`. Drop `@unique` on `facilityId`, which now lives on the
   org. This is what gives a hospital more than one login.
3. **`CadreMandate.employerOrgId`**, indexed. Replaces string-matched tenancy
   everywhere. `facilityName` stays for display and for roles we run ourselves.
4. **`CadreMandateMatch.source`**: `APPLIED | SOURCED | INVITED`. This is the split
   that makes the pipeline honest.
5. **`CadreMandateMatch.status`** normalised to an enum so the `"APPLIED"` written
   by the apply route cannot diverge from what the UI knows.
6. **`CadreShortlist`** and **`CadreShortlistEntry`**, owned by the org, with a note
   per entry.
7. **`CadreContactRequest`**: org, professional, optional role, message, status
   (`PENDING | ACCEPTED | DECLINED | EXPIRED`), `respondedAt`. The consent record.
8. **`CadreProfessional.availabilityUpdatedAt`**, so a stated availability can go
   stale honestly rather than stand forever.

Per the house rule, the migration is not run by the Vercel build. `npm run
migrate:deploy` is a manual step and I will flag it.

---

## 5. Search, rebuilt

The availability filter stops being a gate and becomes a ranking. Three tiers,
labelled in the result:

1. **Open to approach.** Has stated availability. ~30 today, and growing as the
   member side ships.
2. **Active member.** Has logged in, has not stated availability. ~900.
3. **On the register.** Imported, never claimed. ~9,300.

Contact details are never in the search payload for any tier. Tier 1 gets a direct
approach, tiers 2 and 3 get "register interest", which raises a
`CadreContactRequest`. The member is asked. Contact is revealed on yes, and the
answer is recorded either way, so we stop asking people who have said no.

Also in this pass: facet counts on every filter so no combination returns a silent
zero, pagination with a true total, names rendered through `cadreSalutation`, the
profile link actually wired, and the emigration badges removed.

---

## 6. Acquisition, and the dedicated link

`oncadre.com/hire` and `oncadre.com/employers`, both redirecting to
`/oncadre/hire`. Today the only way in is a footer strip on the CadreHealth
homepage.

The page leads with live counts from the register, not claims: doctors by state, by
specialty, how many hold a verified licence. Below that, a search a visitor can run
before signing up, returning real counts and partial cards. Enough to prove the
people exist, not enough to work around us. The account comes after the proof.

---

## 7. Sequence

| | Step | Why here |
|---|---|---|
| 1 | Migration and backfill | Everything else depends on it |
| 2 | Member side: state availability, notice period, what you are open to | Supply unlock. Without it search has nothing to rank |
| 3 | Search rebuild and the contact gate | The moment an employer sees value |
| 4 | Nav restructure, Roles, Pipeline | Makes it MECE, makes roles manageable |
| 5 | Shortlists | The missing verb between search and pipeline |
| 6 | Account, team seats, verification route | Retention, and a real answer to "get verified" |
| 7 | `/hire` landing page | Acquisition, once there is something to arrive at |
| 8 | Defect sweep from section 1 | Several are one-line fixes best done with their page |

Steps 1 to 3 are what move the uptake number. Steps 4 to 6 are what make it hold.

---

## 8. Open questions

- **Verification.** What actually makes an employer verified, and who presses the
  button? It gates contact, so it needs a named owner and a standard. Right now the
  panel says "contact us" and 0 of 4 employers are verified.
- **Price.** Search free and contact paid is the natural line, but nothing is
  charged today and the plan does not assume a number.
- **The register cohort.** 9,300 people who have never logged in will start
  receiving contact requests. That traffic is a re-engagement channel as much as a
  hiring one, and it should be sequenced against the existing outreach so the same
  person is not approached from two directions in a week.
