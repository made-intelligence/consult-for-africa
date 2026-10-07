# Hospital claims recovery and invoice discounting: how to execute

Research note for Consult for Africa. Prepared 5 October 2026.

Convention used throughout: **[V]** means verified against the cited source during this research. **[R]** means reported by a secondary source (news, vendor blog, aggregator) and not checked against a primary document. **[I]** means inference or recommendation by the author. **[U]** means looked for and could not verify.

---

## Executive summary: recommendations

1. **Lead with recovery, not the advance.** Sell "we recover what you are owed, on a success fee" first; offer the Carbon advance as the second step once a hospital's claims have been through the desk once. Recovery needs no credit decision, gives CFA the claims data that underwrites the advance, and is the cheaper promise to keep. [I]

2. **Use the regulator as the escalation path, and say so.** The NHIA Act 2022 makes it an offence for an HMO to fail to pay providers or settle fee-for-service claims within the period in the operational guidelines (s.48(1)(c) and (d)), and requires disputes between HMOs and providers to go first to NHIA for mediation and conciliation, then to arbitration (s.47). Build the desk's playbook as: reconcile at claims-officer level, then medical-director level, then a formal NHIA complaint. Most claims should clear at the first two steps; the third is the credible backstop. [V]

3. **Structure the money flow so the HMO does not need to know about Carbon.** Rather than serving notices of assignment on every HMO from day one, have each hospital open a collection account at Carbon (or move its HMO receipts to one it already has there) with a standing domiciliation and lien in Carbon's favour, and register Carbon's security interest at the National Collateral Registry. Serve formal notice of assignment only on default or where a payer is slow. This keeps the hospital-HMO relationship clean and removes the main retaliation risk. Carbon's counsel must confirm the exact structure. [I, grounded in STMA 2017 ss.4, 33 and 43, V]

4. **Register at the NCR every time.** Under the Secured Transactions in Movable Assets Act 2017, priority between competing claims to the same receivable goes by time of registration (s.33(3)), and an assignee takes subject to the HMO's set-off rights that accrue before it is notified (s.33(1)(b)). Registration is the main protection against double financing; the set-off point means the vetting must also check whether the HMO is clawing back old overpayments. [V]

5. **CFA must never buy a claim.** BOFIA 2020 treats factoring as a business that needs a CBN licence; CFA should originate, vet, service and collect under a services agreement, and Carbon should be the only party that lends or purchases. Ask Carbon's counsel to confirm that an MFB can do this as a secured loan to the hospital rather than as a purchase of receivables. The Factoring, Assignments and Receivables Financing Bill 2026 passed the National Assembly in June 2026; assent was not confirmed at the time of writing. [V for BOFIA via Mondaq; V for Bill passage; U for assent]

6. **Advance against expected collectible value, not billed value.** International medical factoring advances 70 to 90% of expected net collectible value. Opening at 60% of vetted value is conservative by that standard and right for a first cohort with no Nigerian loss history. Step up per payer after two or three clean cycles, as the Carbon deck already proposes. [R for the international range; I for the step-up]

7. **Price recovery at 10 to 15% of cash recovered on aged or disputed claims, and a lower servicing fee on advanced claims.** Nigerian commercial debt recovery runs at 10 to 25% contingency; US medical collections on aged or denied accounts run 15 to 40%; US RCM on routine billing runs 4 to 9% of collections. Hold 15% as the opening position for claims over 90 days old and 10% for younger ones; keep any lower number for the conversation. [R for benchmarks; I for the price points]

8. **Treat the 1,000-contact outbound as a legal question before it is a deliverability one.** The NDPC's GAID (in force 19 September 2025) says consent is required "for any direct marketing activity" (Article 18(1)(a)), and the Federal High Court held in June 2026 (Onimski v GTCO) that unsolicited marketing to someone who never gave their data breached NDPA s.25 and s.36. Contacts Debo knows personally, or who gave their details at events or in prior engagements, are the safe first wave. For the rest, get Nigerian data-protection counsel to sign off a legitimate-interest assessment for B2B outreach to hospital owners' professional addresses, keep every message one-click opt-out, and route the first touch through association or referral channels where possible. [V for GAID and the case; I for the approach]

9. **Run the outbound on a separate sending subdomain, warmed for four weeks, at no more than 25 to 30 cold emails per inbox per day.** With 1,000 contacts that is three or four inboxes and roughly two weeks of sending per touch. SPF, DKIM and DMARC aligned, plain text, a visible unsubscribe link. Send through ZeptoMail or a dedicated cold-email tool, never Zoho SMTP. [R for warm-up norms; V for Google's requirements; I for the plan]

10. **Make the lead magnet a free "20-claim receivables check".** Ask for a sample of 20 unpaid HMO claims (references, payer, amount, date, status only, no clinical notes) and return within five working days a one-page view: how much is recoverable, why each is stuck, and what an advance would release. This is the product in miniature, it qualifies the hospital and it tests CFA's vetting against real data. [I]

11. **Sequence each prospect across three channels over three weeks: email, then a WhatsApp message from a named person, then a phone call.** Expect a reply rate in the low single digits for cold email (the 2026 Instantly benchmark average is 3.43%), higher for warm contacts. On 1,000 contacts, a realistic first-quarter target is 30 to 60 conversations, 15 to 25 sample checks and 5 to 10 signed hospitals. [R for benchmark; I for the funnel]

12. **Get one association behind it early.** The Guild of Medical Directors and ANPMP have both campaigned on HMO tariffs and debts since at least 2022, and in 2022 GMD demanded interest on any HMO debt over 30 days. A talk at a GMD branch meeting or an endorsed member offer is worth more than the whole cold list. [V for the 2022 positions]

13. **Keep a written conflicts policy for any payer CFA advises.** Either keep that payer's claims out of recovery, or disclose the relationship to both sides in writing and have a different person run those disputes. Never use information from one side in the other's dispute. [I]

14. **Pilot small and measure four numbers.** Ten hospitals, N100m to N200m of vetted claims, 90 days, and a joint Carbon-CFA dashboard tracking first-pass acceptance (share of claims accepted by the HMO without query), days to cash, recovery rate on disputed claims and loss rate on advanced claims. Agree with Carbon before the pilot what loss rate would end it and what would trigger a higher advance rate. [I]

15. **Do not store claims documents on the public R2 bucket.** CFA's own upload bucket is publicly readable by anyone with an object key (see project memory). Claims work involves sensitive health data, for which the GAID makes a DPIA mandatory. Use a private bucket or a separate store, keep clinical notes inside the hospital's system wherever possible, and carry only claim references, enrollee IDs, dates, codes and amounts on CFA's side. [V for GAID; internal fact from CFA memory]

---

## 1. The size of the problem in Nigeria

### What the law and guidelines say about payment

- **NHIA Act 2022, s.48(1)**: a person or HMO who "(c) fails to remit payments to Health Care Providers within the specified period indicated in the operational guidelines" or "(d) fails to settle fee-for-service or other claims from the Health Care Providers within the stipulated time allowed in the operational guidelines" commits an offence. A specific fine (at least N1m first offence, N2m subsequent) is set out only for issuing a dud cheque (s.48(2)); for the other offences, s.48(3) says the offender "is liable to prosecution under the relevant laws guiding financial transactions". [V, gazette text]
- **s.47**: disputes among HMOs, providers, contributors and NHIA "shall first be referred to the Authority for mediation and conciliation"; if that fails, arbitration under the Arbitration and Conciliation Act. [V]
- **s.49**: NHIA keeps power to sanction HMOs and providers under its operational guidelines. **s.39**: NHIA can issue written directives and apply sanctions for non-compliance. [V]
- **s.34(1)(e)**: an HMO shall "pay for services rendered by health care providers accredited under the Authority, for private health insurance". [V]
- **Payment timelines in days.** The older NHIS Operational Guidelines (2012 era) said claims should reach the HMO within 14 days of month end and be settled within 14 days of receipt; capitation paid monthly in advance. [R, via the old guidelines PDF hosted at theiguides.org] The **NHIA Operational Guidelines 2023** are published on the NHIA site, but the downloadable file is a 22-page scanned extract with no machine-readable text; this research could not confirm the 2023 day count for HMO claim settlement. **[U] Get the full 2023 guidelines from NHIA or an HMO and quote the clause in sales material; it is the single most useful sentence for the desk.**
- **NHIA's CEmONC programme SOP** (the federal maternal and newborn emergency care programme) requires TPAs to pay facilities within 14 days of verified claims, with NHIA ruling on disputes within one month. This shows the timeline NHIA considers achievable when funds are pre-loaded. [V]
- **One-hour authorisation rule.** From 1 April 2025, HMOs must issue authorisation codes within one hour; providers may treat after an hour without response and NHIA will compel reimbursement. Emergency care does not need a prior code; the code can follow within 48 hours. [V, Daily Trust and Guardian reports of the directive] This matters for recovery: claims rejected for "no authorisation code" after April 2025, where the hospital asked and the HMO did not answer within the hour, should be recoverable.
- **NIIRA 2025 s.210** requires insurers to settle claims within the NAICOM service charter timelines and no later than 60 days of notification, with a N500,000 penalty and monthly compound interest for late payment. [R, Mondaq and law-firm summaries] Whether this applies to HMOs, which are accredited by NHIA rather than licensed by NAICOM, is not settled in the sources found. It clearly applies to insurance companies that sell indemnity health cover and to provider claims against them if they are "claims" in the Act's sense. **[U] Take a legal view before relying on it.**

### How long hospitals actually wait

- **Medismarts data**, the claims platform used by 20 to 25 HMOs and said to carry about 80% of online claims submissions: average time to process a claim fell from 80.9 days to 56.3 days between 2024 and 2025, across 8.4 million claims a year worth about N22bn. The article does not say whether this is submission to payment or submission to adjudication. [R, Streamlinefeed, July 2026, vendor-sourced]
- A 2017-18 Lagos study of facility managers found delayed and denied payment among the top barriers to joining insurance schemes; one private facility manager said an HMO had "not paid us in 3 months after treating more than 250 patients". [V, PLOS ONE 2021]
- In January 2022 the Guild of Medical Directors said payment timing "had been elongated despite protests" and resolved it would "no longer tolerate owing of providers in excess of 30 days", with cumulative interest on older debts. A Lagos practitioners' leader said "there is a backlog of debts that usually takes a very long time to pay". The HMO association (HMCAN, then led by Dr Leke Osunniyi) answered that it was "not our fault" and asked for time to renegotiate. [V, BusinessDay and Daily Trust, January 2022]
- A widely repeated figure that "over N15bn of providers' claims" was trapped with HMOs in 2022 appears in search summaries of TheCable's coverage; the page itself could not be opened and Daily Trust's report does not contain it. **[U]**
- Hospital-software vendor blogs say 25 to 40% of submitted HMO claims go unpaid in clinics that do not track them, and that HMO income is delayed 30 to 90 days or more. [R, vendor content, treat as indicative only]
- **No published Nigerian statistic on first-pass rejection or query rates was found.** [U] CFA's own pilot data will be the first credible number; that is itself a selling point.

### Regulatory and political signals 2024 to 2026

- NHIA handled 3,507 complaints in 2024 (1,232 against HMOs), resolved 2,929, and sanctioned 47 HMOs (35 warning letters, 12 refund orders) and 49 facilities. HMO infractions included "delays in settlement of agreed reconciled payments". [V, Premium Times]
- NHIA raised capitation by 93% and fee-for-service by 378% against 2023 rates (announced February 2025), the first actuarial review in about 12 years. [V, Vanguard and Premium Times] Higher tariffs mean larger claims and larger receivables per patient.
- The FCT Administration settled about N4bn of 2022-2024 capitation and fee-for-service arrears under the FCT scheme during 2024-25 and in July 2025 threatened to sanction HMOs that did not pass payments on promptly; HMOs had blamed "missing bank details". [V, Voice of Nigeria] Note the excuse: it is the kind of friction a recovery desk clears.
- An August 2026 social-media controversy about HMOs (a post with more than 1.9 million views) put HMO-hospital friction back in the press; coverage repeats that some hospitals put HMO patients in separate queues because of unpaid claims. [V, Premium Times, The Sun, August 2026]
- Coverage is growing: NHIA reported over 22 million enrollees in 2026, about 10% of the population, up 35% year on year. [R, NAN and others] More insured patients means more receivables sitting with payers.
- ANPMP said in July 2024 that 400 to 500 private hospitals had closed in six months out of about 13,000 private facilities, citing affordability, inadequate NHIS capitation, energy and staff costs. HMO payment delay was not named as a cause in that report. [V, Daily Trust]

### State schemes

No reliable 2025-26 figure for state-scheme arrears to private providers was found beyond the FCT figure above. CarePay runs registration and administration for LASHMA (Lagos) and the Kwara Health Insurance Fund, which makes it a potential data partner or channel for state-scheme claims. [R] **[U] state arrears by state.**

### Analogues that show the payer risk

- **Kenya**: the Social Health Authority owed hospitals about KES 43bn in August 2025 with KES 24bn more under review, paying KES 5.4 to 6bn a month against KES 8.8bn of monthly claims. The private hospitals' association RUPHA suspended SHA services at its 700 members on 22 September 2025. SHA also lost a reported KES 11bn to fake claims in six months, mostly from private hospitals. [V for RUPHA figures, Techweez; R for the fraud figure, Nation]
- **Ghana**: the NHIA paid GH¢1.64bn of claims in 2026, including arrears back to 2019, and private facilities said delays had forced them to borrow and ration supplies. [V, MyJoyOnline, 2 October 2026]

The lesson for CFA: public and quasi-public schemes can stop paying for reasons that have nothing to do with the claim. Advance against them only with a lower rate and a payer limit.

---

## 2. Competitors and analogues

### Nigeria

| Company | What it does | Relevance | Status |
|---|---|---|---|
| **Curacel** | AI claims processing and fraud detection for insurers and HMOs; links 800+ hospitals in Nigeria, Ghana and Uganda with insurers such as AXA Mansard, Liberty and Old Mutual. Announced "Curacel Capital" in 2021: cash advances of up to 3x a provider's average monthly billings, based on claims processed on its portal. Reported 2024 revenue of $6.3m. | Closest analogue to the advance. Sits on the payer side. | Capital product announced [V]; whether it is live and at what terms **[U]**. Revenue figure from Getlatka **[R]**. |
| **Medismarts** | Cloud claims automation and pre-authorisation for 20 to 25 HMOs; about 8.4 million claims a year, N22bn; 800,000 pre-authorisations a year. | Payer-side infrastructure. A data partner rather than a competitor; also a channel into HMOs. | [R] |
| **CarePay** | Health payments platform (M-TIBA in Kenya); runs registration and scheme administration for LASHMA and Kwara's scheme; partnered with Carbon on discounted care for Carbon cardholders. | Shows Carbon already has a health relationship; possible state-scheme data. | [R] |
| **Medical Credit Fund (PharmAccess)** | Non-profit lender to health SMEs in Kenya, Tanzania, Ghana, Nigeria and Uganda; over $138m to 1,800 SMEs; repayment reported at 94 to 96%. In Ghana with uniBank (2016) it built an NHIS claims pre-financing loan: eligible claims assigned to the bank, which pays a discounted amount. | The most direct precedent for claims pre-financing in West Africa, and evidence that health SME lending can perform. A potential co-funder or source of a first-loss tranche. | [R for portfolio; V for Ghana mechanics; terms **[U]**] |
| **Remedial Health** | B2B ordering and buy-now-pay-later for pharmacies and hospitals; $12m Series A (2023); 5,000+ pharmacies and hospitals. | Shows supplier credit to hospitals works at scale; also a substitute (hospitals may use supplier credit rather than an advance). | [R, TechCrunch] |
| **Lidya** | Digital SME lender, raised about $16.5m. **Shut down in October 2025** citing "severe financial distress"; reports cite loan-book losses and naira depreciation eroding equity. | The cautionary tale: unsecured SME credit in Nigeria fails on losses. Self-liquidating claims backed by an identified payer are a different risk, which is the argument to make. | [V, several outlets] |
| **Payhippo** | SME lender; pivoted to solar financing in 2023 and rebranded as Rivy (raised $4m, March 2025). | Another exit from generic SME lending. | [V] |
| **Izifin** | Lagos embedded-finance software firm founded 2021: credit decisioning, collection scoring, anomaly detection, KYC. About 20 staff, listed as unfunded. | Debo cites its decisioning engine. **No public evidence was found of any healthcare deployment or of default or loss results.** Ask Izifin for the data directly before quoting it to Carbon or hospitals. | Company facts [R]; performance **[U]** |
| Field, Lifebank, MDaaS, Afya, "Kwara", Hospyta | Hospyta is a patient app (telemedicine, ambulance, e-commerce), not a finance product. The others were not verified as offering hospital receivables finance in this research. | Not competitors on current evidence. | **[U]** |

There is no Nigerian provider found that combines claims vetting, payer reconciliation and a funded advance for private hospitals. That is the gap. The risk is that Curacel or Medismarts, which already sit on the claims rails, switch on a financing product with a bank partner.

### International

- **US medical factoring**: advances of 70 to 90% of expected net collectible value, fees of about 1 to 5% per 30 days (2 to 4% for clean electronic claims). Most factoring is with recourse, so a denied claim is charged back to the provider. [R, several US lender guides]
- **India**: DigiSparsh discounts hospitals' insurance receivables at discharge (hospitals otherwise wait about two months) through partner NBFCs at 8 to 20% interest; Gmoney offers similar working-capital loans against delayed claims, which "can take up to 120 days". PM-JAY rules require payment within 15 working days of approval, with interest on delays beyond 30 days; about 650 private hospitals in Haryana suspended PM-JAY services over ₹490 crore of pending reimbursements. [R]
- **Kenya**: Revena Health recovers rejected and underpaid insurance claims on a pay-per-recovery model and claims up to 97% recovery on eligible claims; no financing. [R, company site, illustrative] This is the closest analogue to CFA's recovery desk on its own.

---

## 3. Legal and regulatory

### Assignment of receivables

- **General law.** Legal assignment of a debt follows the received English rule (Judicature Act 1873 s.25(6), or the equivalent state property law): absolute, in writing, with written notice to the debtor. The debtor's consent is not needed. [R, law-firm and vLex summaries]
- **STMA 2017 s.4(2)**: a transfer of, or security interest in, an account receivable is effective between grantor and creditor and "against the account debtor... notwithstanding any agreement limiting the account debtor's right to create a security interest in or assign its account receivable". The drafting is awkward (it refers to the account debtor's right rather than the grantor's), but practitioners read it as overriding anti-assignment clauses. s.4(3) overrides contractual limits on creating security over any movable asset. [V, statute text; interpretation R]
- **s.33(1)**: the assignee's rights are subject to the underlying contract, to defences arising from it, and to any set-off the debtor acquires before receiving notice of the assignment. **s.33(3)**: priority between competing assignees goes by time of registration at the Registry, regardless of when the debtor got notice. [V]
- **s.43(2)**: a secured creditor may notify the account debtor and collect even before default. [V]
- **National Collateral Registry**: administered under the CBN; perfection is by filing a financing statement (s.8). [R]
- **HMO contracts.** No Nigerian HMO provider agreement was found online. Foreign provider agreements commonly forbid assignment without consent. **[U] Collect three or four Nigerian HMO provider agreements from client hospitals and read the assignment, set-off, claim-window and dispute clauses before the pilot.** STMA s.4 should neutralise an anti-assignment clause for a receivables transfer or security interest, but not the HMO's contractual defences or set-off.
- **Factoring Bill.** The Factoring, Assignments and Receivables Financing Bill 2026 passed the Senate on 25 June 2026 and, per later reports, both chambers; it was sent for presidential assent. Afreximbank says it makes receivables "easily assignable as effective security for financing". Assent was not confirmed. [V for passage; U for assent]

### Who needs a licence

- **Factoring as a business** falls under BOFIA 2020 and the CBN's finance company guidelines (minimum capital N100m). [R, Mondaq; CBN guidelines] **CFA should not purchase receivables or lend.** It should act under a written servicing and origination agreement with Carbon, paid a fee.
- **Carbon** operates as Carbon Microfinance Bank, licensed by the CBN. [R] Whether an MFB may purchase receivables outright, as opposed to lending against them, was not confirmed. **[U] Carbon's counsel to confirm.** The safer structure is a short-term loan to the hospital secured by an assignment of, or security over, the vetted claims, repaid from the collection account.
- **Debt collection agents**: no licensing regime for collectors in Nigeria was found; the conduct constraints come from the NDPA, criminal law (use of police for civil debts is unlawful) and the general law. [R, Adeola Oyinlade guide and others] Litigation itself must be run by a lawyer. [I]
- **FCCPC DEON Regulations 2025** (digital consumer lending; in force 21 July 2025, full enforcement from January 2026) ban harassment and abusive recovery. They govern consumer lending, not B2B receivables, but they set the tone the regulator expects and would bite if the desk ever chased patients directly. [V for scope and dates] **[I] Keep patient balances out of scope for now.**
- **Limitation**: simple contract debts are statute-barred after six years. [R] Old claims are limited more by the HMO's contractual claim window than by limitation.

### Tax and stamping

Mondaq's earlier analysis noted VAT on factoring services, CGT on disposal gains and stamp duty on the assignment instrument, and that unstamped documents are inadmissible in court. Nigeria's 2025 tax reform consolidated stamp duties into the Nigeria Tax Act from 2026. **[U] Get current tax advice on CFA's fee (VAT) and on stamping the hospital-Carbon security documents.**

### Data protection (NDPA 2023 and GAID 2025)

- **Claims data is sensitive personal data** (health). NDPA s.30 allows processing without consent where necessary for the establishment, exercise or defence of a legal claim, or for medical care, among other grounds. [R, NDPA summaries; Act text at cert.gov.ng] **[I]** The hospital is the controller; CFA acts as its processor for vetting and recovery under a written data processing agreement; Carbon receives only what it needs to lend (claim reference, payer, amount, dates, status, vetting outcome), not clinical content.
- **GAID Article 28(3)**: a DPIA is mandatory and must be filed with the NDPC for processing that involves sensitive data, "health care services", "financial services involving the processing of personal data through digital devices", and evaluation or scoring. A CFA claims desk ticks several of these. The DPIA must be vetted by an NDPC-accredited DPO. [V]
- **GAID Article 18(1)**: consent is required "(a) for any direct marketing activity" and "(b) for the processing of sensitive personal data", alongside the Act's own grounds. [V] The relationship between Article 18(1)(b) and the s.30 legal-claim ground is not explained in the GAID; take advice, but the legal-claim ground in the Act should prevail for recovery work. **[I]**
- **Penalties**: higher of N10m or 2% of prior-year gross revenue for data controllers or processors of major importance; N2m or 2% for others. [R] The NDPC fined MultiChoice N766m in 2025 and in August 2025 opened compliance investigations into 1,368 organisations including 35 insurers and 392 brokers. [R]
- **Minimising PHI exposure** [I]:
  - Work from a claims schedule containing claim reference, HMO, enrollee ID, date of service, authorisation code, tariff code, amount billed, amount paid, status. No names, diagnoses or notes in the schedule.
  - Review clinical documents on the hospital's premises or in its own system with read-only access; do not copy them to CFA storage unless a dispute needs them, and then only to a private, access-logged store.
  - Do not use the public `cfa-uploads` R2 bucket for anything claims-related.
  - Hash or tokenise enrollee IDs in anything shared with Carbon.
  - Delete working copies when the claim closes; keep the audit trail, not the records.

---

## 4. Pricing benchmarks

| Item | Benchmark | Source quality |
|---|---|---|
| Nigerian invoice discounting, bank | FirstBank: 32% a year, 1% one-off fee, 60-day tenor with 30-day rollover, up to N100m | [V] |
| Nigerian invoice financing, general | 1.5 to 4% a month plus 0.5 to 2.5% fees; advances 70 to 90%; fintechs disburse in about 48 hours, banks in 1 to 2 weeks | [R, Kudi Compass blog, September 2026] |
| Nigerian LPO finance | 2.5 to 6% a month | [R, NairaCompare blog] |
| Policy rate | CBN cut the MPR from 26.5% to 23% on 22 September 2026; LCCI warned this does not automatically lower the cost of credit | [V] |
| US medical factoring | 70 to 90% advance; 1 to 5% per 30 days | [R] |
| India claims financing | 8 to 20% a year via NBFCs | [R] |
| Nigerian commercial debt recovery | 10 to 25% contingency, lower for large debts | [R, law-firm content] |
| US medical collections (aged, denied) | 15 to 40% contingency | [R] |
| US RCM outsourcing | 4 to 9% of net collections; cost-to-collect benchmark 2 to 4% of net patient revenue | [R] |

**Implications** [I]:
- Carbon's discount on a 60% advance repaid in, say, 60 to 90 days will probably land between 3% and 4% a month on the amount advanced, which is about 2 to 2.5% of claim value a month. On a 75-day cycle that is around 5 to 6% of claim value. Hospitals will compare that with the interest on overdrafts they already have.
- CFA's income has two parts: a recovery fee on cash collected from disputed or aged claims (opening at 15% over 90 days old, 10% younger), and a servicing fee on advanced claims, either charged to the hospital (2 to 3% of claim value) or taken as a share of Carbon's discount. Settle this split with Carbon before quoting hospitals.
- Do not show the hospital the build-up of the price. State the fee and the advance, and hold concessions for the negotiation.

---

## 5. Go-to-market

### Who buys and how

- Most private hospitals in Nigeria are owner-run, often by the founding doctor; the Guild of Medical Directors' October 2026 Lagos conference focused on making hospitals "survive their founders", cash flow and systems. [V, Vanguard, 4 October 2026] The buyer is the medical director or owner, with the hospital administrator or accountant as the person who holds the claims data.
- **Associations**: Guild of Medical Directors (GMD), Association of Nigerian Private Medical Practitioners (ANPMP), Association of General and Private Medical Practitioners of Nigeria (AGPMPN), Healthcare Providers Association of Nigeria (HCPAN, led by Dr Adeyeye Arigbabuwo), Healthcare Federation of Nigeria (HFN). All have public positions on HMO tariffs and debts. [V for 2022 positions] HFN's own statements on payment delays were not found. **[U]**
- **HMO side**: some HMOs want cleaner claims and fewer disputes. Medismarts and Curacel already sit between HMOs and hospitals. A recovery desk that delivers clean, reconciled batches could be welcomed by better-run HMOs. [I]

### Channels in order of expected yield [I]

1. Debo's personal network and existing CFA clients (Haven, Osteon, Duchess, Arabella and others): highest conversion, and their claims make the first pilot cohort.
2. Association platforms: a short talk at a GMD branch AGM or an ANPMP state meeting, with a member-only sample check.
3. Referrals from hospital accountants, HMIS vendors (Hyella and similar) and pharma or consumables suppliers who are also waiting to be paid.
4. Cold outbound to the 1,000-contact list, after the legal check below.
5. WhatsApp follow-up from a named person, not a broadcast list.

### Lawful basis for the outbound

- GAID Article 18(1)(a) requires consent for direct marketing. The June 2026 Onimski v GTCO judgment treated unsolicited marketing to a non-customer who had never given his data as unlawful under NDPA s.25 and s.36. That case concerned an individual consumer. [V]
- Whether an email to a hospital owner at a professional address about a business service is "direct marketing" of personal data is arguable; the address of a named person is personal data. **Treat it as needing a lawful basis.** [I]
- Practical approach [I]: segment the list into (a) people with an existing relationship or who gave details for professional contact (send), (b) generic organisational addresses such as info@ or accounts@ (lower risk; send with opt-out), (c) named individuals with no prior contact (send only after counsel signs off a legitimate-interest assessment, or reach them through an association or referral). Every message carries an unsubscribe line and a reply "stop" works on WhatsApp. Keep a suppression list and honour it across all channels.

### Deliverability for 1,000 contacts

- **Google's rules**: all senders need SPF or DKIM, valid forward and reverse DNS, TLS, and a spam rate below 0.3%. Senders of 5,000 or more a day must have SPF and DKIM and DMARC, From-domain alignment, and one-click unsubscribe. [V, Gmail Help] CFA will be far below 5,000 a day, but meet the bulk standard anyway.
- **Warm-up**: start a new domain or inbox at 5 to 10 a day and build over 3 to 6 weeks; keep cold volume to 25 to 30 per inbox per day with warm-up running alongside; Microsoft inboxes tolerate fewer. [R, cold-email vendors]
- **Set-up** [I]: a subdomain such as `recovery.consultforafrica.com` or a sister domain, three or four inboxes in named people's names, SPF, DKIM and DMARC (start at p=none, move to quarantine), plain-text emails under 120 words, one link at most, no attachments on first touch, verify every address before sending (CFA has had an 11% hard-bounce problem on CadreHealth), and send via ZeptoMail's API or a cold-email tool, never via Zoho SMTP.

### Sequence (three weeks) [I]

| Day | Channel | Content |
|---|---|---|
| 1 | Email | From Debo or a named partner. One problem, one offer: "We will look at 20 of your unpaid HMO claims free and tell you what is recoverable." |
| 4 | WhatsApp | Short personal note from the same person, referring to the email; only to contacts with a prior relationship or opt-in. |
| 8 | Email | A specific example: the kinds of claim that are stuck and clear (missing authorisation code, old tariff, missing discharge summary). |
| 11 | Call | Desk lead calls the hospital administrator; aim to book the sample check. |
| 15 | Email | Advance angle: "60% of vetted claims within 48 hours, funded by a licensed bank." |
| 21 | Email | Close the loop politely; leave the door open. |

WhatsApp Business API marketing templates cost about $0.05 per message in Nigeria from 1 October 2026, utility templates under $0.01. [R] WhatsApp's own policy requires opt-in for business-initiated marketing. [R]

### Funnel expectations

- Cold email average reply rate 3.43% in 2026, top quartile 5.5%, top decile over 10%. [R, Instantly 2026] Professional services lead-to-customer conversion in B2B benchmarks runs 2 to 7%. [R]
- On 1,000 contacts with one-third warm [I]: 60 to 100 replies, 30 to 60 conversations, 15 to 25 sample checks, 5 to 10 hospitals signed in the first quarter. The sample check converts best when the result shows a specific naira figure that is recoverable.

### Lead magnet

The free 20-claim check (recommendation 10) is better than a generic "receivables health check" because it produces a hospital-specific number. Add the receivables calculator on the service page as the pre-step: it captures interest; the sample check captures data.

---

## 6. Operating model

### Vetting checklist [I, built from NHIA directives and standard adjudication practice]

1. **Eligibility**: enrollee active on date of service; plan and benefit covers the service; facility is in the plan's network at the right level.
2. **Authorisation**: code present where required; code matches the service, date and amount; for post-April 2025 claims, evidence of request time if the code came late (one-hour rule); emergency claims have the code obtained within 48 hours.
3. **Tariff**: billed at the agreed tariff and version (note the 2025 NHIA tariff uplift for NHIA-scheme claims); drugs priced at the agreed list; no unbundling.
4. **Documentation**: encounter note, investigation results, admission and discharge summary, referral letter, signed claim form; legible; consistent dates.
5. **Timeliness**: inside the HMO's submission window; if outside, record whether the window was ever communicated.
6. **Duplicates and fraud**: same enrollee, date and service not already billed or financed; check against the NCR and CFA's own register; flag outliers by volume and value per enrollee.
7. **Payer status**: HMO's payment history with this hospital; any set-off or clawback in progress (STMA s.33); any NHIA sanction.
8. **Outcome**: pass (fund), repair (send back with the fix), or recover only (disputed, not funded).

### How HMO disputes are resolved in practice [I, with V where noted]

- Most disputes clear in a reconciliation meeting between the hospital's billing officer and the HMO's claims officer, claim by claim, with a signed reconciliation schedule.
- Escalation to the HMO's medical director for clinical disputes (authorisation, medical necessity).
- A formal letter citing NHIA Act s.48 and the guideline timeline.
- A complaint to NHIA (s.47 mediation); NHIA reported resolving complaints in 10 to 25 days, averaging 15. [V, Premium Times]
- Arbitration as the last step. Litigation is rarely worth it at claim level.

### Staffing a desk for the pilot [I]

- Desk lead: ex-hospital billing or HMO claims manager, knows the claims officers by name.
- Two or three claims analysts: nurses or health-records officers trained in tariff and authorisation rules.
- A finance associate to reconcile cash received against claims and report to Carbon.
- A clinical reviewer (part-time doctor) for medical-necessity disputes.
- Debo or a partner for HMO medical-director escalations and association relationships.

At pilot scale (10 hospitals) this is four to five people. Each analyst can probably handle a few hundred claims a week once the schedule format is standard; measure it.

### KPIs

| KPI | Definition | Starting reference |
|---|---|---|
| Days to cash | Days from claim submission (or from desk intake for aged claims) to payment received | Medismarts reports 56 days average processing [R]; HFMA targets 30 to 40 days in A/R for US providers [R] |
| First-pass acceptance | Share of claims paid without query or reduction | HFMA clean-claim benchmark 95% [R]; US initial denial rate 11.8% in 2024 [R] |
| Recovery rate | Cash recovered divided by value of disputed claims taken on | Track by reason code and by HMO |
| Loss rate | Advanced value not repaid after 180 days, divided by total advanced | Agree a stop-loss with Carbon before launch |
| Dilution | Reduction between vetted value and paid value (tariff cuts, partial rejections) | Drives the advance rate |
| Concentration | Share of advanced value with the top HMO | Cap per payer |
| Desk productivity | Claims processed per analyst per week | Sets unit economics |

US industry figures often quoted: about 65% of denied claims are never resubmitted, and 60 to 65% of denials are eventually recoverable when worked. These are widely repeated but their primary source was not verified. [U] They are useful as a pitch line only if CFA's own pilot data confirms something similar.

### Pilot design with Carbon [I]

- **Cohort**: 8 to 12 hospitals with at least six months of HMO claims history and a willing owner; mix of Lagos and Abuja; include at least two existing CFA clients.
- **Eligible payers**: start with the five to eight HMOs with the best payment record across the cohort; exclude state schemes from the advance for the pilot, keep them in recovery.
- **Advance**: 60% of vetted value, 48 hours; per-hospital limit set by Carbon; per-payer cap.
- **Recourse**: hospital repays any advance on a claim rejected for a reason it controlled (documentation, eligibility, duplicate); Carbon bears payer insolvency risk only if it agrees to; CFA bears neither.
- **Flow**: HMO payments into a Carbon collection account; Carbon sweeps principal and discount; balance to the hospital within 24 hours.
- **Governance**: weekly claim-level report to Carbon; monthly review against stop-loss and step-up triggers; 90-day review to decide on scale.
- **Data**: every claim, reason code and outcome captured from day one; this becomes the underwriting model and, later, the case for a bank or DFI facility.

---

## 7. Product suite sequencing [I unless marked]

**Why recovery is the right wedge**
- The pain is acute, visible and costed: hospitals know they are owed money. GMD and ANPMP have campaigned on it publicly. [V]
- It pays on success, so the hospital takes no risk to try it.
- It gives CFA the hospital's claims data and the HMO relationships, which is exactly what is needed to underwrite the advance and to sell the next products.
- Generic SME lending in Nigeria has a poor record (Lidya's closure, Payhippo's pivot) [V]; financing that is tied to a specific identified payer and repaid from that payer's cash is a different and better risk.

**What comes next, in order**
1. **Claims submission outsourcing (front-end RCM).** Once the desk has fixed the back-log, take over monthly claims preparation and submission for a percentage of collections (US benchmark 4 to 9% [R]). Prevention is cheaper than recovery, and it raises first-pass acceptance, which raises the advance rate.
2. **Tariff and contract renegotiation with HMOs.** Armed with claims data showing where tariffs are below cost and which HMOs pay slowly, CFA can negotiate on behalf of a hospital or a group of hospitals. The 2025 NHIA uplift shows tariffs are movable. [V]
3. **HMO panel growth.** Help good hospitals get onto more HMO panels and drop bad payers; data from the desk shows which payers are worth having.
4. **Patient finance for elective surgery.** Carbon is a consumer lender already; a hospital that trusts the desk is a natural point of sale. This needs FCCPC DEON compliance and should come after the B2B book is proven.
5. **Supplier and equipment finance** with Carbon or MCF, underwritten on the hospital's now-visible cash flows.

The international pattern supports this order: India's DigiSparsh moved from receivables financing to supplier and patient finance; Curacel moved from claims processing toward provider advances. [R]

---

## 8. Risks and mitigations

| Risk | What could happen | Mitigation [I] |
|---|---|---|
| **Conflict of interest with a payer CFA advises** | CFA recovers money for hospitals from a payer it also advises, or uses knowledge from one side against the other. | Written conflicts policy; exclude that payer's claims from recovery while the advisory engagement runs, or disclose in writing to both and wall off staff; never share data across the wall; record decisions. |
| **HMO retaliation** | An HMO slows authorisations, reduces volume or drops a hospital that uses the desk or assigns claims. | Lead with reconciliation, not confrontation; avoid serving assignment notices unless needed (recommendation 3); use the NHIA route only after relationship routes fail; track volume and authorisation times by HMO to detect retaliation; s.48 makes non-payment, not dispute, the offence. |
| **Adverse selection** | Hospitals send the oldest, weakest claims for advance and keep good ones. | Fund only vetted claims; require whole-book submission (all claims to a given HMO for a period) to qualify for the advance; price aged claims into recovery only; advance rate set by payer and by claim age. |
| **Fraud and duplicates** | Fictitious or padded claims, ghost enrollees, the same claim financed twice. Kenya's SHA reported KES 11bn of fake claims in six months. [R] US case: TransCare sold the same invoices to several lenders. [R] | NCR registration and search before funding; duplicate checks on enrollee, date and service; sample clinical verification; HMO eligibility check; hospital warranty of validity with personal or corporate recourse for fraud; Carbon's own KYC on the hospital. |
| **Payer insolvency or freeze** | An HMO fails, loses accreditation, or a state scheme stops paying (Kenya SHA, Ghana NHIS history). [V] | Payer limits and concentration caps; lower advance rates or none for public schemes; watch NHIA sanction lists and HMO capital status; HMOs must hold a security deposit under NHIA rules [R]; shift exposure as payment records change. |
| **Set-off by the HMO** | An HMO deducts old overpayments from a financed claim's payment. | Vet for open clawbacks; STMA s.33 means set-off accruing before notice binds Carbon, so serve notice on a payer as soon as any set-off risk appears. |
| **Data breach** | Claims data leaked from CFA systems. | DPIA filed with NDPC; processor agreement with each hospital; minimised data; no public storage; access logs. |
| **Regulatory characterisation** | CFA is treated as doing factoring or lending without a licence. | CFA never buys, lends or guarantees; fee for services only; Carbon contracts directly with the hospital for the credit. |
| **Reputational** | A hospital feels chased or an HMO complains publicly. | No threats; professional reconciliation tone; escalation paths stated up front in the engagement letter. |
| **Concentration in CFA's own revenue** | One or two hospitals dominate early fees. | Pilot cohort of 8 to 12; cap any one hospital's share of advanced value. |

---

## What could not be verified

- The claim-settlement day count in the NHIA Operational Guidelines 2023 (the published file is a scanned extract).
- Whether NIIRA 2025 s.210's 60-day rule applies to HMOs.
- The "over N15bn trapped with HMOs" figure from 2022.
- Any published Nigerian first-pass rejection or query rate.
- State-scheme arrears to private providers, other than the FCT figure.
- Whether Curacel Capital is live, and its terms.
- Izifin's healthcare use or default performance.
- Whether Field, Lifebank, MDaaS, Afya or a firm called Kwara offer hospital receivables finance in Nigeria.
- Presidential assent to the Factoring Bill 2026.
- Whether a CBN-licensed MFB may purchase receivables outright.
- Assignment clauses in Nigerian HMO provider agreements.
- The origin of the US "65% of denials never resubmitted" statistic.

---

## Sources

Nigeria: law, regulation and regulator
- National Health Insurance Authority Act 2022 (Gazette No. 95, 24 May 2022): https://archive.gazettes.africa/archive/ng/2022/ng-government-gazette-dated-2022-05-24-no-95.pdf
- NHIA resources page (Operational Guidelines 2023; CEmONC claims SOP): https://www.nhia.gov.ng/3177-2/
- NHIA CEmONC Standard Operating Procedure for Claims Submission, Review and Payment: https://www.nhia.gov.ng/download/standard-operating-procedure-for-claims-submission-review-and-payment/
- Old NHIS Operational Guidelines (14-day submission and settlement): http://admin.theiguides.org/Media/Documents/NHIS_OPERATIONAL_GUIDELINES.pdf
- Daily Trust, new NHIA guidelines to HMOs (one-hour authorisation): https://dailytrust.com/how-new-nhia-guidelines-to-hmos-will-reduce-delay-in-access-to-healthcare-for-enrollees/
- Guardian, NHIA orders HMOs to issue codes within one hour: https://guardian.ng/features/health/nhia-orders-hmos-to-issue-codes-within-one-hour/
- Premium Times, over 90 providers sanctioned (2024 complaints data): https://www.premiumtimesng.com/news/top-news/804271-over-90-providers-sanctioned-as-nhia-cracks-down-on-poor-health-services.html
- Premium Times, HMO controversy explainer (August 2026): https://www.premiumtimesng.com/health/health-features/904100-hmo-controversy-what-nigerians-hospitals-need-to-know-about-health-insurance.html
- Vanguard, NHIA raises capitation by 93%: https://www.vanguardngr.com/2025/02/nhia-raises-capitation-fees-by-93/
- Voice of Nigeria, FCTA threatens sanctions for delayed HMO payments: https://von.gov.ng/fcta-threatens-sanctions-for-delayed-hmo-payments/
- The Sun, Endless controversies over HMO operations: https://thesun.ng/endless-controversies-over-hmo-operations/
- The Sun, When patients get caught between HMOs and hospitals: https://thesun.ng/health-insurance-when-patients-get-caught-between-hmos-hospitals/
- BusinessDay, Hospitals to drop HMOs over debts, poor tariffs (January 2022): https://businessday.ng/health/article/hospitals-to-drop-hmos-over-debts-poor-tariffs/
- Daily Trust, Hospitals to drop HMOs Jan 31: https://dailytrust.com/hospitals-to-drop-hmos-jan-31-over-poor-tariffs-debts/
- TheCable, private hospitals to drop HMOs (could not be opened): https://www.thecable.ng/its-exploitation-private-hospitals-to-drop-hmos-feb-1-over-poor-tariffs-debts/
- Daily Trust, 500 private hospitals shut down (ANPMP, July 2024): https://dailytrust.com/hardship-500-private-hospitals-shut-down-in-6-months-anpmp/
- PLOS ONE, provider participation in health insurance in Nigeria (2021): https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0255206
- NAN, Nigerians on health insurance hit 22m: https://nannews.ng/nigerians-on-health-insurance-hit-22m-nhia/
- BusinessDay, NHIA in driver's seat sets back HMO business model: https://businessday.ng/big-read/article/nhia-in-drivers-seat-sets-back-hmo-business-model/
- Mondaq, NIIRA 2025 deep dive: https://www.mondaq.com/nigeria/insurance-laws-and-products/1695476/nigerias-insurance-industry-reform-act-2025-a-deep-dive-into-reform-and-its-challenges
- Vanguard, Build hospitals that survive their founders (GMD, October 2026): https://www.vanguardngr.com/2026/10/build-hospitals-that-survive-their-founders-gmds/

Receivables law and licensing
- Secured Transactions in Movable Assets Act 2017 (text): https://github.com/mykeels/nigerian-laws/blob/master/2017/secured-transactions-in-movable-assets-act-2017-collateral-registry-act.md
- Mondaq, Debt factoring in Nigeria: structuring, legal and regulatory framework: https://www.mondaq.com/nigeria/financial-services/1202432/debt-factoring-in-nigeria-structuring-legal-and-regulatory-framework-and-key-considerations
- UUBO, Debt factoring in Nigeria: https://uubo.org/wp-content/uploads/2022/08/debt-factoring-in-nigeria-structuring-and-regulatory-implications.pdf
- CBN Revised Guidelines for Finance Companies: https://www.cbn.gov.ng/out/2014/ccd/revised%20guidelines%20for%20finance%20companies%20in%20nigeria.pdf
- Afreximbank, Senate passage of the factoring bill (June 2026): https://www.afreximbank.com/afreximbank-fci-welcome-nigeria-senates-passage-of-factoring-bill-to-support-smes-and-boost-intra-african-trade/
- TheCable, National Assembly passes factoring bill: https://www.thecable.ng/nassembly-passes-bill-allowing-businesses-to-convert-unpaid-invoices-to-cash/
- Adeola Oyinlade & Co, Debt collection in Nigeria guide (2026): https://www.adeolaoyinlade.com/en/debt-collection-in-nigeria-the-definitive-legal-and-operational-guide-2026/
- FCCPC, DEON Consumer Lending Regulations 2025: https://fccpc.gov.ng/wp-content/uploads/2025/11/Digital-Electronic-Online-or-Non-Traditional-Consumer-Lending-Regulations-2025.pdf
- Carbon FAQs (MFB licence): https://www.getcarbon.co/faqs

Data protection
- NDPC, NDP Act General Application and Implementation Directive 2025: https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf
- DLA Piper, NDPC issues GAID: https://privacymatters.dlapiper.com/2025/06/nigeria-ndpc-issues-gaid-key-compliance-insights/
- Nigeria Data Protection Act 2023: https://cert.gov.ng/ngcert/resources/Nigeria_Data_Protection_Act_2023.pdf
- OTL Law, unsolicited direct marketing (Onimski v GTCO, June 2026): https://otllaw.com/unsolicited-direct-marketing-as-violation-of-ndpa-and-constitution
- Nairametrics, NDPC probe into 1,369 companies: https://nairametrics.com/2025/08/25/ndpc-launches-probe-into-1369-nigerian-companies-over-data-privacy-violations/
- PR Nigeria, NDPC fines MultiChoice: https://prnigeria.com/2025/07/06/ndpc-fines-multichoice-data/

Competitors and analogues
- Curacel funding and Curacel Capital: https://nairametrics.com/2021/03/30/deal-curacel-raises-450000-pre-seed-funding-to-drive-insurance-inclusion-in-africa/
- Curacel revenue (Getlatka): https://getlatka.com/companies/curacel
- Medismarts claims volumes (Streamlinefeed, July 2026): https://streamlinefeed.co.ke/news/inside-medismarts-how-nigerian-healthtech-scaled-8-4-million-claims-despite-rejection
- Medismarts 10 years (Techpoint): https://techpoint.africa/brandpress/medismarts-marks-10-years-expands-healthtech-footprint-to-25-hmos-across-nigeria/
- CarePay expands into Nigeria: https://www.telecompaper.com/news/carepay-expands-into-nigerian-market--1300873
- BusinessDay, Carbon partners CarePay: https://businessday.ng/companies/article/carbon-finance-partners-carepay-on-affordable-healthcare/
- PharmAccess, uniBank NHIS claims pre-financing (Ghana): https://www.pharmaccess.org/update/11388/
- Medical Credit Fund overview: https://www.medicalcreditfund.org/update/cash-advance-energizing-mobile-lending-kenyan-health-sector/
- TechCrunch, Remedial Health $12m: https://techcrunch.com/2023/07/31/remedial-health/
- TechCabal, Lidya calls it a day: https://techcabal.com/2025/10/24/techcabal-daily-a-decade-later-lidya-calls-it-a-day/
- Technext, Lidya shuts down: https://technext24.com/2025/10/23/lidya-shuts-down-over-financial-distress/
- TechCabal, Payhippo rebrands as Rivy: https://techcabal.com/2025/03/26/payhippo-rebrands-as-rivy-raises-4-million/
- Izifin profile (TechBuild): https://techbuild.africa/izifin-embedded-intelligence-financial-inclusion/
- Izifin (Tracxn): https://tracxn.com/d/companies/izifin/__VGRLyd89BLTtUNPogZs-JqmyEuOeLtFeeByO1rOXw_A
- Hospyta: https://hospyta.com/
- Revena Health (Kenya): https://www.revenahealth.com/
- DigiSparsh (India): https://digisparsh.in/
- CXO Today, innovative healthcare financing in India (Gmoney, DigiSparsh): https://cxotoday.com/daily-news/6-innovative-financing-models-revolutionizing-healthcare-in-india/
- Techweez, RUPHA halts SHA services (Kenya): https://techweez.com/2025/09/22/rupha-halts-sha-in-private-hospitals/
- Nation, SHA fake claims: https://nation.africa/kenya/news/fake-claims-real-theft-sh11-billion-stolen-from-sha-in-six-months-5340278
- MyJoyOnline, Ghana NHIS claims paid 2026: https://www.myjoyonline.com/gh%C2%A21-64bn-nhis-claims-paid-in-2026-as-private-health-facilities-welcome-improved-reimbursements/
- IFA Commercial Factor, fraud in factoring: https://magazine.factoring.org/magazine-articles/the-hidden-risks-of-fraud-in-factoring-and-invoice-discounting

Pricing
- FirstBank invoice discounting: https://smeconnect.firstbanknigeria.com/index.php/offers/details/83/invoice-discounting-finance
- Kudi Compass, invoice financing in Nigeria (September 2026): https://kudicompass.com/invoice-financing-nigeria-sme-guide/
- NairaCompare, LPO financing: https://nairacompare.ng/blogs/loans/what-is-lpo-financing-a-complete-guide-for-nigerian-businesses
- LCCI statement on September 2026 MPC: https://www.lagoschamber.com/lcci-statement-on-mpc-decision-september-2026/
- United Capital Source, medical factoring guide: https://www.unitedcapitalsource.com/blog/medical-factoring-companies/
- Lawzana, corporate debt recovery in Nigeria: https://lawzana.com/articles/nigeria/corporate-debt-recovery-in-nigeria-2026-legal-options-979
- Sorso, medical billing contingency fees: https://www.thesorso.com/answers/medical-billing-contingency-fee
- Wisemonk, RCM outsourcing guide: https://www.wisemonk.io/blogs/outsourcing-revenue-cycle-management

Go-to-market and operations
- Gmail email sender guidelines: https://support.google.com/mail/answer/81126?hl=en
- Instantly, Cold Email Benchmark Report 2026: https://instantly.ai/cold-email-benchmark-report-2026
- How many cold emails per day (2026 data): https://howmanycoldemailsperday.com/blog/cold-email-sending-limits-data/
- WhatsApp API pricing, Nigeria: https://ominiflow.com/whatsapp-api-pricing/nigeria
- Martal, B2B conversion rate statistics: https://martal.ca/conversion-rate-statistics-lb/
- HFMA, KPIs providers should track: https://www.hfma.org/revenue-cycle/kpis/7-kpis-providers-should-be-tracking/
- Becker's, claims denial rates 2024 (Kodiak, 11.81%; page blocked, figure via search summary): https://www.beckerspayer.com/payer/claims-denial-rates-up-prior-auth-denials-down-in-2024-report/
- NairaCompare, why health insurance claims get rejected in Nigeria: https://nairacompare.ng/blogs/why-health-insurance-claims-get-rejected-in-nigeria
