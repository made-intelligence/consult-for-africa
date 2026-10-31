import type { TrackExpansion } from "./types";

const expansion: TrackExpansion = {
  slug: "payor-claims-management",
  track: {
    name: "Payor & Claims Management",
    description:
      "The hospital's relationship with whoever pays, from contract to cash, after the claim leaves the building. Covers the Nigerian payor landscape, contracting and tariff negotiation, vetting and denials, ageing receivables and claims financing, and how to set a payor mix that keeps the hospital solvent.",
    level: "SPECIALIST",
    category: "finance",
    iconName: "handshake",
    colorHex: "#0F766E",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "PAID",
  },
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "payor-landscape-nigeria",
      name: "The Payor Landscape: NHIA, State Schemes, HMOs, Corporates and Retainerships",
      description:
        "Who actually pays a Nigerian hospital, how each payor's money moves, and what each one does to the hospital's cash, risk and workload.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Every payor is a different business, not a different form",
            body: `A hospital with six payors is running six commercial relationships, each with its own price, its own paperwork, its own speed of payment and its own risk. Treating them as one "insurance" line is the most common reason a hospital looks busy and stays short of cash.

The taster set out who the payors are. The working question for a consultant is narrower: for each payor, where does the money start, how many hands does it pass through before it reaches the hospital, and who carries the risk if a patient costs more than expected. The answers sort Nigerian payors into a few families.

- Social health insurance: the NHIA formal sector programme and the state schemes, funded from payroll contributions or state budgets and usually routed through accredited HMOs.
- Private HMO plans bought by employers or individuals, where the HMO is both insurer and administrator.
- Corporates paying the hospital directly, either fee-for-service against monthly invoices or a fixed retainer.
- Self-pay patients, including those whose cover has run out.

Each step between the source of money and the hospital adds delay and a chance for deduction. An NHIA enrollee's care may be funded by a federal payroll deduction that passes to the Authority, then to an HMO, then to the facility. A corporate retainer client pays the hospital's account directly. The first relationship has three places where money can stall. The second has one.

Risk sits in different places too. Under capitation the hospital is paid a fixed sum per enrollee per month and carries the cost if those enrollees use more care than the price assumed. Under fee-for-service the payor carries utilisation risk but pushes back through vetting and tariff caps. Under a fixed corporate retainer the hospital carries the risk that a small company's staff turn out to be heavy users. A consultant who can name, for each payor, who holds the money and who holds the risk has already understood most of what will follow in contracting and claims.`,
          },
          {
            title: "NHIA and the state schemes after the 2022 Act",
            body: `The National Health Insurance Authority Act 2022 replaced the old National Health Insurance Scheme with an Authority and made health insurance mandatory for Nigerians and legal residents. In practice coverage is still far from universal, and the Act matters to a hospital less for its headline than for how it changed the plumbing.

The Act gives the Authority a regulatory role over the whole market, including accreditation and regulation of HMOs and of healthcare facilities. It also anchors the Vulnerable Group Fund, which pays for cover for people who cannot contribute, and it works alongside the Basic Health Care Provision Fund, which channels federal money to primary care through NHIA and state gateways. State schemes, such as those run by state health insurance agencies, enrol state civil servants and, increasingly, informal sector residents with subsidy.

For a private secondary hospital the practical consequences are these. NHIA and state scheme enrollees typically reach the hospital through referral from a primary facility, which means a referral and an authorisation code are needed before the hospital is paid fee-for-service. Primary facilities are commonly paid by capitation. Tariffs are set centrally or by the state scheme and are hard to negotiate individually, so the hospital's lever is volume, case mix and its own cost of delivering the service, not price.

Payment speed depends on the full chain. A delay in a state's release of premium, or in the Authority's release to an HMO, arrives at the hospital as an HMO that has not paid. The hospital's contract is usually with the HMO, so its legal claim is against the HMO, but its commercial reality is that the HMO may be waiting on a government transfer.

When advising a hospital considering a state scheme, ask four things: the tariff against the hospital's cost per service, the expected referral volume, the scheme's actual payment record with similar facilities, and whether the hospital has spare capacity that would otherwise sit idle. A low tariff can be worth taking for fixed-cost recovery if the beds and theatre would be empty. It is a loss if it displaces better-paying patients.`,
          },
          {
            title: "HMOs: insurer, administrator and gatekeeper at once",
            body: `A private HMO in Nigeria plays three roles at the same time, and a hospital that only sees one of them negotiates badly. The HMO sells cover to employers, administers the scheme on their behalf, and decides through authorisation and vetting what the hospital is paid.

As insurer, the HMO collects premium in advance and profits when medical costs come in below premium. Its incentive is to keep utilisation and unit price down. As administrator, it carries the cost of call centres, authorisation desks and vetting officers, and it competes for corporate clients on price, which keeps premiums low and pressure on provider tariffs high. As gatekeeper, it issues pre-authorisation codes for secondary care and decides which claims, or which lines within a claim, it accepts.

HMOs differ more than hospitals assume. A large HMO with many corporate clients brings volume and a reasonably predictable payment run, but holds most of the bargaining power. A small HMO may pay a better tariff to win access to a well-regarded hospital, then pay late because its own premium income is thin. The hospital should know, for each HMO, its approximate enrollee base in the catchment, its payment record over the last twelve months, and how much of the hospital's revenue depends on it.

Plan tiers matter as much as the HMO itself. One HMO may sell a basic plan that covers only general outpatient care and a premium plan with private rooms and specialist access. If the hospital's tariff is the same across tiers, it is underpricing its best-funded patients.

Concentration is the risk to watch. A hospital where one HMO accounts for 40% of insured revenue cannot walk away from a bad tariff review, and the HMO knows it. Spreading insured volume across several payors is a commercial decision, handled later in this track under payor mix, but it starts with simply measuring the dependency.`,
          },
          {
            title: "Corporates and retainerships: the direct relationship",
            body: `Corporate clients that pay the hospital directly often produce the best margin in the payor book, and also the worst bad debts. The difference lies in how the arrangement is written and policed.

There are two common forms. In a fee-for-service corporate account, the company's staff are treated against an agreed tariff, often at a discount to the hospital's self-pay list, and the hospital invoices monthly. In a retainership, the company pays a fixed monthly sum for a defined population and set of services, which is effectively capitation negotiated without an HMO in the middle.

The direct relationship removes the HMO's margin and vetting layer, which is why the tariff can be better for both sides. It also removes the HMO's credit control. If the company's finance team is slow, or the company is in difficulty, there is no intermediary chasing the money, and the hospital's own credit control has to do it.

A sound corporate account has:
- a signed agreement naming the eligible staff and dependants, the services covered and excluded, the tariff, the invoice cycle and the payment term;
- a way to confirm eligibility at the front desk, such as a staff list updated monthly or a letter of introduction;
- a credit limit, with treatment for non-emergencies moving to deposit if the account goes past it;
- a named contact in the company's HR and finance functions.

Retainerships need one more thing: a utilisation review. Every quarter, compare the cost of care actually delivered to the retainer income. A retainer for 50 staff at N150,000 a month brings N1.8m a year. If those staff consumed N2.6m of care at the hospital's own cost, the account is losing money however loyal the client feels. The answer may be a higher retainer, a cap on certain services, or a move to fee-for-service. The answer is never to keep renewing on the old terms because the relationship is pleasant.`,
          },
        ],
        exercises: [
          {
            title: "Map the payor book of Ikorodu Specialist Hospital",
            instruction:
              "Ikorodu Specialist Hospital earned N310m last year: self-pay N96m, HMO A N78m, HMO B N41m, four smaller HMOs N33m combined, a state scheme N22m, three corporate fee-for-service accounts N25m, and one corporate retainer N15m. Build a one-page table that shows, for each payor, the share of revenue, the payment mechanism (capitation, fee-for-service, retainer or cash), who carries utilisation risk, and how many hands the money passes through. Then write three label-fact bullets on the hospital's main dependency risk, the payor that most needs a utilisation review, and the one question you would ask the finance manager first.",
          },
        ],
      },
      resources: { tools: ["Payor register template", "Payor dependency calculator"] },
      questions: [
        {
          question:
            "A Lagos hospital's largest HMO tells the hospital it cannot pay March claims because the state scheme has not released premium for the quarter. The hospital's contract is with the HMO. What is the correct way to read the hospital's position?",
          options: [
            { id: "a", text: "The hospital's legal claim is against the HMO, but its commercial reality is that payment depends on the state's release, so it should chase both the HMO and visibility of the release date", isCorrect: true },
            { id: "b", text: "The hospital should invoice the state scheme directly, since the state is the true source of the money", isCorrect: false },
            { id: "c", text: "The HMO is in breach and the hospital should stop seeing all of that HMO's enrollees immediately", isCorrect: false },
            { id: "d", text: "The delay is the state's problem, so the hospital can treat the receivable as fully current", isCorrect: false },
          ],
          explanation:
            "The contract sits with the HMO, so that is where the claim lies, but the delay originates upstream and the hospital needs to understand the release timetable to plan cash. Invoicing the state directly ignores the contract chain, and treating the debt as current hides real risk.",
        },
        {
          question:
            "Under which payment arrangement does the hospital carry the risk that patients use more care than expected?",
          options: [
            { id: "a", text: "Fee-for-service HMO billing with pre-authorisation", isCorrect: false },
            { id: "b", text: "A corporate fee-for-service account invoiced monthly", isCorrect: false },
            { id: "c", text: "Capitation or a fixed corporate retainer", isCorrect: true },
            { id: "d", text: "Self-pay with a deposit at admission", isCorrect: false },
          ],
          explanation:
            "Capitation and retainers pay a fixed sum regardless of use, so heavy utilisation is the hospital's cost. Under fee-for-service, each additional service is billed, so the payor carries utilisation risk even if it pushes back through vetting.",
        },
        {
          question:
            "A corporate retainer for 40 staff pays N120,000 a month. Over the last year the hospital delivered care to those staff that cost it N2.1m to provide. What should the consultant recommend?",
          options: [
            { id: "a", text: "Renew on the same terms because the client pays on time every month", isCorrect: false },
            { id: "b", text: "Reduce the retainer to win goodwill, since the client is loyal, pays promptly and refers other companies to the hospital's corporate desk", isCorrect: false },
            { id: "c", text: "End the relationship immediately, since any retainer that loses money should be terminated", isCorrect: false },
            { id: "d", text: "Reprice the retainer, cap high-cost services, or move to fee-for-service, because income of N1.44m does not cover N2.1m of cost", isCorrect: true },
          ],
          explanation:
            "Twelve months at N120,000 is N1.44m against N2.1m of cost, a loss of N660,000, so the terms must change. Paying on time is the tempting reason to renew, but prompt payment of too little still loses money; ending the account outright skips the chance to fix it.",
        },
        {
          question:
            "A hospital is offered a state scheme contract at tariffs about 20% below its average cost per admission. It runs at 55% bed occupancy and its fixed costs are largely committed. When is accepting most defensible?",
          options: [
            { id: "a", text: "Never, because any tariff below average cost destroys value", isCorrect: false },
            { id: "b", text: "When the tariff covers the variable cost of each admission and the extra patients fill beds that would otherwise sit empty", isCorrect: true },
            { id: "c", text: "Only if the scheme agrees to raise the tariff within six months", isCorrect: false },
            { id: "d", text: "When the scheme promises a large enrollee population across the state, because volume will in time make up for any shortfall in the tariff", isCorrect: false },
          ],
          explanation:
            "With spare capacity and committed fixed costs, revenue above variable cost contributes to overheads. Rejecting any price below average cost is the tempting error because average cost includes fixed costs the hospital pays either way, provided the new patients do not displace better-paying ones.",
        },
        {
          question:
            "Which statement about the NHIA Act 2022 is accurate?",
          options: [
            { id: "a", text: "It abolished HMOs and made NHIA the sole payer to all private hospitals", isCorrect: false },
            { id: "b", text: "It applies only to federal civil servants, as the old scheme did", isCorrect: false },
            { id: "c", text: "It set a single national tariff that all HMOs must pay all facilities", isCorrect: false },
            { id: "d", text: "It replaced the NHIS with an Authority, made health insurance mandatory, and anchors a Vulnerable Group Fund", isCorrect: true },
          ],
          explanation:
            "The 2022 Act created the Authority, made cover mandatory and provides for the Vulnerable Group Fund. HMOs continue to operate under NHIA regulation, so the claim that they were abolished is the common misreading.",
        },
        {
          question:
            "One HMO accounts for 42% of a hospital's insured revenue and has just proposed a tariff freeze for two years. What is the main reason the hospital's negotiating position is weak?",
          options: [
            { id: "a", text: "HMOs are legally entitled to freeze tariffs", isCorrect: false },
            { id: "b", text: "The hospital's dependence means it cannot credibly walk away, and the HMO knows it", isCorrect: true },
            { id: "c", text: "The hospital has not yet coded its claims to ICD-10", isCorrect: false },
            { id: "d", text: "Large HMOs always pay the lowest tariffs in the market, so the hospital would lose money with them whatever it negotiated", isCorrect: false },
          ],
          explanation:
            "Negotiating power comes from the ability to say no; a 42% dependency removes it. Large HMOs often pay lower tariffs, but that is a consequence of their power, not the reason this hospital is weak.",
        },
        {
          question:
            "A hospital charges the same tariff to an HMO's basic and premium plans for a private room admission. What is the commercial problem?",
          options: [
            { id: "a", text: "The hospital is underpricing patients on the better-funded premium plan", isCorrect: true },
            { id: "b", text: "Basic plan patients will refuse admission", isCorrect: false },
            { id: "c", text: "It breaches NHIA rules, which require providers to charge a different tariff for each tier of an HMO plan", isCorrect: false },
            { id: "d", text: "There is no problem, since the HMO decides what each plan covers", isCorrect: false },
          ],
          explanation:
            "Premium plans are priced to fund richer benefits, so a single tariff leaves money with the HMO that the plan was designed to pay. There is no NHIA rule requiring or forbidding tiered tariffs; the issue is commercial.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A hospital is setting up a direct fee-for-service account for a 300-staff logistics company. Which elements belong in a sound account? Select all that apply.",
          options: [
            { id: "a", text: "A signed agreement naming eligible staff and dependants, services covered and excluded, tariff and payment term", isCorrect: true },
            { id: "b", text: "A monthly eligibility list or other way to confirm cover at the front desk", isCorrect: true },
            { id: "c", text: "An open-ended credit line so staff are never turned away", isCorrect: false },
            { id: "d", text: "A credit limit beyond which non-emergency care moves to deposit", isCorrect: true },
          ],
          explanation:
            "Agreement, eligibility check and credit limit are what protect a direct account, because there is no HMO doing credit control. An open-ended credit line feels client-friendly but is how corporate accounts become bad debts.",
        },
        {
          question:
            "A small HMO offers a tariff 15% above the market rate for access to a hospital's specialist clinics. What should the hospital check before accepting?",
          options: [
            { id: "a", text: "Only whether the tariff is above the hospital's cost", isCorrect: false },
            { id: "b", text: "Whether the HMO is NHIA-accredited, since accreditation by the Authority guarantees that the HMO's claims will be paid on time", isCorrect: false },
            { id: "c", text: "The HMO's payment record with comparable facilities and the strength of its premium income", isCorrect: true },
            { id: "d", text: "Whether the HMO will also send NHIA enrollees", isCorrect: false },
          ],
          explanation:
            "A high tariff from a thin HMO can turn into late or partial payment, so payment record and financial strength decide whether the price is real. Accreditation is necessary but does not guarantee prompt payment.",
        },
        {
          question:
            "An NHIA enrollee arrives at a private secondary hospital without a referral from a primary facility for a non-emergency specialist review. What usually follows if the hospital treats the patient as an NHIA case?",
          options: [
            { id: "a", text: "The HMO pays at the self-pay rate instead", isCorrect: false },
            { id: "b", text: "The claim is paid but at a reduced capitation rate", isCorrect: false },
            { id: "c", text: "NHIA pays the hospital directly at the scheme tariff so that the patient's care is not delayed by missing paperwork", isCorrect: false },
            { id: "d", text: "The claim is at risk of rejection, because secondary care normally needs referral and an authorisation code", isCorrect: true },
          ],
          explanation:
            "Secondary care under social insurance is normally paid fee-for-service against a referral and authorisation. Without them the HMO can reject the claim; nothing in the arrangement converts it to a self-pay rate or direct payment.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "payor-contracting-tariffs",
      name: "Contracting and Tariff Negotiation",
      description:
        "Building the evidence for a tariff review, structuring the provider agreement, and negotiating with HMOs and corporates from a position the hospital can hold.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "The provider agreement decides the cash before any patient is seen",
            body: `Most of the problems a hospital later calls "claims problems" were written into the provider agreement. Payment terms, vetting rights, dispute windows and tariff review dates are set when the contract is signed, often by someone who only looked at the tariff schedule.

A provider agreement with an HMO should be read clause by clause for these points:
- Tariff schedule and what it covers: whether a quoted price is inclusive of drugs, consumables, professional fees and nursing, or only the room.
- Payment term: the number of days from claim submission to payment, and what counts as a complete submission.
- Authorisation rules: which services need a code, how quickly the HMO must respond, and what happens to care delivered in an emergency before a code is issued.
- Vetting and adjustment: the HMO's right to reduce a claim, the grounds, and whether it must give line-by-line reasons.
- Dispute process: the window to contest, the escalation route, and whether disputed sums block the undisputed part of the payment.
- Tariff review: when the tariff can be reopened and on what basis.
- Termination and run-off: what happens to claims for patients already admitted when the contract ends.

Many Nigerian hospitals operate on HMO agreements signed years ago, with tariff schedules that have not moved through several rounds of inflation and naira depreciation. Some have no signed agreement at all for smaller HMOs, only a tariff list exchanged by email. In that position the hospital has nothing to point to when a claim is cut.

The consultant's first task is an inventory: for each payor, is there a signed agreement, when was the tariff last reviewed, and do the payment and dispute terms match what actually happens. That inventory usually shows two or three payors that account for most of the revenue and most of the contractual gaps. Those are where negotiation starts.`,
          },
          {
            title: "Building the tariff case from the hospital's own cost",
            body: `An HMO will not raise a tariff because a hospital says costs have gone up. It will move when shown a specific, credible gap between the tariff and the cost of delivering a defined service, for services the HMO's members actually need.

Start with the hospital's top 20 to 30 services by insured volume. For a typical secondary hospital this means general outpatient consultation, specialist consultation, the main laboratory panels, normal delivery, caesarean section, a few common surgical procedures, and the ward day. For each, compare three numbers: the current tariff from each major HMO, the hospital's direct cost to deliver it, and the hospital's self-pay price.

Direct cost is built bottom-up. A caesarean section, for example, includes theatre time, the surgeon's and anaesthetist's fees, consumables and drugs used in theatre, the ward stay at the expected length, and post-operative drugs. Pharmacy and consumable costs are where the gap is usually largest, because many tariff schedules were set when imported items cost a fraction of today's price.

Present the result as a short table and a ranked list. If an HMO pays N380,000 for a caesarean section that costs the hospital N445,000 to deliver, the hospital loses N65,000 on every one. Multiply by the HMO's annual volume of that procedure and the loss becomes a figure the HMO's medical director can take to their own management.

Two cautions. A cost case only works if the costs are honest. An HMO that discovers a padded figure will discount every future submission from that hospital. And the case should separate items whose cost the hospital controls from items driven by the market. HMOs are more willing to move on drugs and consumables, where they can see the price change, than on professional fees, where they suspect the hospital of paying its doctors too much.

Market comparison helps but is secondary. HMOs know what they pay other hospitals; the hospital usually does not. A consultant can sometimes reconstruct market rates from doctors who work across several facilities or from published state scheme tariffs.`,
          },
          {
            title: "Structuring the price: fee-for-service, bundles and drug pricing",
            body: `How the price is structured can matter as much as its level. A well-chosen structure reduces vetting disputes, protects the hospital from inflation and gives the HMO the predictability it values.

Itemised fee-for-service gives the hospital the most protection against unexpected cost, but invites line-by-line vetting. Every consumable and every extra day is a chance for the HMO to cut. Bundled pricing for common procedures, sometimes called package pricing, sets one price for a defined episode: for example, a normal delivery including two nights, routine drugs and newborn checks. The HMO gets certainty and is less inclined to vet line by line; the hospital takes the risk of complications inside the bundle and must define clearly what triggers a move outside it, such as a stay beyond a set number of days or admission to a special care baby unit.

Bundles suit high-volume, low-variance procedures where the hospital knows its cost distribution. They suit poorly anything with a long tail of complications.

Drugs and consumables are best not priced as fixed numbers in a tariff schedule that will last two years. Two alternatives work better: a pricing formula, such as acquisition cost plus an agreed percentage, with invoices available for audit; or a reference price list reviewed every quarter. Either keeps the hospital whole when the naira moves.

Finally, build in a review clause with a trigger. An annual review date is useful only if both sides honour it. A clause that reopens drug and consumable pricing when a published inflation measure or the exchange rate moves by more than an agreed amount gives the hospital a contractual basis to return to the table without having to plead.`,
          },
          {
            title: "Running the negotiation",
            body: `A tariff negotiation is won mainly in preparation and lost mainly in the room by conceding too early. The hospital's position should be set before the first meeting, including what it will accept and what it will do if the HMO says no.

Prepare a position for each of the main terms, not only price: tariff, drug pricing method, payment term, dispute process and review trigger. Each one has value to the HMO, and trading them is how agreement is reached without the hospital giving away its price. An HMO that cannot move its consultation tariff this year may accept a shorter payment term or a cost-plus drug formula, which can be worth more in cash.

Know the walk-away. For a hospital where the HMO is 8% of revenue and loses money on several procedures, the credible alternative is to stop accepting that HMO's members for elective care, or to require their patients to top up. That alternative must be real and agreed internally, including with the medical director, because doctors who refer HMO patients will feel it.

Open with the evidence, not a demand. Share the cost table for the procedures where the gap is largest. Ask the HMO what it would need to see to move. Propose a phased increase if the HMO's own corporate contracts are priced for the year, for instance half from the next quarter and the remainder at the start of the following plan year.

Record everything. The outcome should be a signed addendum with the new schedule, the effective date and the review trigger, not a friendly email. Hospitals frequently agree increases verbally and then find the HMO's claims system still pays the old tariff months later, because nobody updated it. The consultant should check the first batch of claims under the new tariff to confirm the change has reached the payment run.`,
          },
        ],
        exercises: [
          {
            title: "Tariff case for Ogba Women and Children Hospital",
            instruction:
              "Ogba Women and Children Hospital's largest HMO pays N350,000 for caesarean section, N160,000 for normal delivery and N12,000 for specialist consultation. Your costing shows direct costs of N420,000, N148,000 and N9,500 respectively. The HMO sent 180 caesarean sections, 240 normal deliveries and 3,100 specialist consultations last year. Calculate the annual gain or loss on each line, propose a negotiating position across tariff, drug pricing method and payment term, and state the hospital's walk-away. Then list what you would trade if the HMO refuses any tariff increase this year.",
          },
        ],
      },
      resources: { tools: ["Tariff gap analysis template", "Provider agreement checklist"] },
      questions: [
        {
          question:
            "A hospital's HMO agreement quotes N25,000 per ward day. The HMO later refuses to pay separately for nursing care and routine drugs on admitted patients, saying they are included. What should the consultant have checked first?",
          options: [
            { id: "a", text: "Whether the ward-day tariff was defined as inclusive or exclusive of drugs, consumables and nursing", isCorrect: true },
            { id: "b", text: "Whether the HMO is NHIA-accredited", isCorrect: false },
            { id: "c", text: "Whether nursing notes were attached to the claims", isCorrect: false },
            { id: "d", text: "Whether the ward-day tariff is above the market average paid by other HMOs to comparable hospitals in Lagos", isCorrect: false },
          ],
          explanation:
            "What a tariff includes is a contract question, and an undefined ward-day rate invites exactly this dispute. Documentation matters for vetting, but the dispute here is about scope, which notes cannot resolve.",
        },
        {
          question:
            "An HMO pays N380,000 for a procedure that costs the hospital N445,000 to deliver. The HMO sends 120 of these a year. How should the hospital frame the case in negotiation?",
          options: [
            { id: "a", text: "Ask for a 25% increase across the whole tariff schedule", isCorrect: false },
            { id: "b", text: "Show the N65,000 loss per case and the annual loss of N7.8m on that HMO's volume", isCorrect: true },
            { id: "c", text: "Say that costs have risen with inflation and request a review", isCorrect: false },
            { id: "d", text: "Threaten to stop accepting the HMO's members unless the price doubles", isCorrect: false },
          ],
          explanation:
            "A specific gap tied to the HMO's own volume gives its medical director a number to take internally. A general inflation plea is the tempting approach, but HMOs rarely move on it.",
        },
        {
          question:
            "In a tariff schedule, which items most need a pricing formula rather than a fixed figure for two years?",
          options: [
            { id: "a", text: "Consultation fees, because doctors' pay rises every year and specialists keep leaving the country", isCorrect: false },
            { id: "b", text: "Registration cards", isCorrect: false },
            { id: "c", text: "Drugs and consumables, especially imported items", isCorrect: true },
            { id: "d", text: "The ward day", isCorrect: false },
          ],
          explanation:
            "Drug and consumable prices move with inflation and the exchange rate, so a cost-plus formula or quarterly reference list keeps the hospital whole. Consultation fees and ward days change too, but far less violently.",
        },
        {
          question:
            "A hospital proposes a bundled price for normal delivery to an HMO. Which feature is essential to protect the hospital?",
          options: [
            { id: "a", text: "A low price to win volume quickly", isCorrect: false },
            { id: "b", text: "Inclusion of every possible complication in the bundle, so that the HMO has nothing to vet line by line and pays quickly", isCorrect: false },
            { id: "c", text: "Removing the need for authorisation codes", isCorrect: false },
            { id: "d", text: "Clear triggers that move a case outside the bundle, such as a longer stay or special care baby unit admission", isCorrect: true },
          ],
          explanation:
            "A bundle shifts complication risk to the hospital, so defined exit triggers cap that risk. Folding all complications into the bundle is the mistake that turns a sound package into a loss-maker.",
        },
        {
          question:
            "An HMO says it cannot change its consultation tariff this year because its corporate contracts are already priced. What is the best next move for the hospital?",
          options: [
            { id: "a", text: "Trade on other terms of value, such as a shorter payment term or a cost-plus drug formula", isCorrect: true },
            { id: "b", text: "Accept the existing terms this year and revisit the tariff at the next annual review, to protect the relationship", isCorrect: false },
            { id: "c", text: "Raise the self-pay price to compensate", isCorrect: false },
            { id: "d", text: "End the contract immediately", isCorrect: false },
          ],
          explanation:
            "Payment term and drug pricing can be worth more in cash than a consultation tariff and leave the HMO's headline price intact. Accepting without trading gives away the preparation; ending the contract is premature without a tested walk-away.",
        },
        {
          question:
            "A hospital's cost case to an HMO includes a surgeon's fee well above market. The HMO's medical director spots it. What is the most likely consequence?",
          options: [
            { id: "a", text: "The HMO pays the higher fee because it is documented", isCorrect: false },
            { id: "b", text: "The HMO discounts the credibility of the hospital's whole case and future submissions", isCorrect: true },
            { id: "c", text: "The HMO refers the hospital to MDCN", isCorrect: false },
            { id: "d", text: "Nothing, because professional fees are agreed between the hospital and its doctors and fall outside the HMO's review", isCorrect: false },
          ],
          explanation:
            "A cost case only works if it is honest; one padded line undermines every figure. HMOs do scrutinise professional fees, which is why they are the hardest line to move.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which clauses in an HMO provider agreement most directly affect how fast and how fully the hospital is paid? Select all that apply.",
          options: [
            { id: "a", text: "The payment term and what counts as a complete submission", isCorrect: true },
            { id: "b", text: "The HMO's vetting rights and whether it must give line-by-line reasons", isCorrect: true },
            { id: "c", text: "The hospital's branding guidelines for HMO materials", isCorrect: false },
            { id: "d", text: "Whether disputed sums block payment of the undisputed part", isCorrect: true },
            { id: "e", text: "The HMO's head office address for correspondence", isCorrect: false },
          ],
          explanation:
            "Payment term, vetting rights and the treatment of disputed sums decide timing and amount. Branding and addresses are administrative and do not affect cash.",
        },
        {
          question:
            "A hospital and HMO agreed new tariffs in a meeting in March. In June the hospital's claims are still being paid at the old rates. What was most likely missed?",
          options: [
            { id: "a", text: "The hospital should have raised its self-pay prices first", isCorrect: false },
            { id: "b", text: "The new tariffs needed NHIA approval before they could take effect, and the hospital did not apply for it after the meeting", isCorrect: false },
            { id: "c", text: "No signed addendum with an effective date, and no check that the HMO's claims system was updated", isCorrect: true },
            { id: "d", text: "The hospital submitted claims too early", isCorrect: false },
          ],
          explanation:
            "Verbal agreements often never reach the HMO's payment system; a signed addendum and a check of the first claims under the new tariff close the gap. NHIA does not approve individual private tariffs.",
        },
        {
          question:
            "A hospital wants a review clause that lets it reopen drug pricing without having to plead. Which wording best does this?",
          options: [
            { id: "a", text: "Tariffs may be reviewed by mutual agreement", isCorrect: false },
            { id: "b", text: "The hospital may increase prices at any time with notice", isCorrect: false },
            { id: "c", text: "Tariffs will be reviewed every five years", isCorrect: false },
            { id: "d", text: "Drug and consumable pricing reopens when a named inflation measure or the exchange rate moves beyond an agreed threshold", isCorrect: true },
          ],
          explanation:
            "A defined trigger gives a contractual right to return to the table. Review by mutual agreement sounds reasonable but lets the HMO simply decline, and a unilateral right to raise prices will not be signed.",
        },
        {
          question:
            "An HMO is 8% of a hospital's revenue and loses money on four of its top five procedures. Before the hospital threatens to stop accepting that HMO's elective patients, what must be in place?",
          options: [
            { id: "a", text: "Internal agreement, including with the medical director and referring doctors, that the walk-away is real", isCorrect: true },
            { id: "b", text: "A letter from NHIA approving the withdrawal", isCorrect: false },
            { id: "c", text: "Confirmation that the HMO's other providers are full", isCorrect: false },
            { id: "d", text: "A replacement HMO already signed at a higher tariff, so that the hospital's revenue is not affected by the change at all", isCorrect: false },
          ],
          explanation:
            "A walk-away the hospital will not carry out weakens it further once called; doctors who see those patients must be behind it. A replacement HMO helps, but it is not required for the threat to be credible.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "claims-vetting-denials",
      name: "Vetting, Denials, Authorisation Codes and Disputes",
      description:
        "What happens to a claim inside the payor, why lines are cut, how to contest them, and how to turn denial data into changes that stop the cuts recurring.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "What happens to a claim once the HMO receives it",
            body: `Inside the HMO, a claim passes through a sequence of checks, and each one can reduce or reject it. Knowing the sequence lets the hospital predict where its claims will fail and prepare for each check rather than react after payment.

The usual sequence runs as follows. A claims officer checks completeness: enrollee details match the HMO's records, the authorisation code is valid for the service and dates, and required attachments are present. A medical vetting officer, usually a doctor or nurse, then reviews clinical appropriateness: whether the diagnosis supports the services billed, whether the length of stay is reasonable, and whether drugs and investigations are in line with the HMO's guidelines. A tariff check compares each line to the agreed schedule and adjusts any line priced above it. The claim is then approved, partially approved or rejected, and joins a payment batch.

Each step has a typical failure. Completeness failures come from front-desk and billing errors, which the revenue cycle track covers. Tariff failures come from the hospital billing at self-pay or outdated rates. Medical vetting is where the money is contested, because it involves judgement, and where the hospital is most often at a disadvantage: its claim arrives as a bill, while the HMO's officer has guidelines and an incentive to cut.

The outcome is usually communicated as a remittance or a vetted claim summary, sometimes weeks after submission, showing the amount paid against each claim. Many hospitals post the payment and never compare it to what was billed line by line. The difference, often called the vetting deduction, then disappears into a general write-off.

A hospital that wants to control vetting needs, for each payor, a monthly figure for billed value, approved value and the deduction split by reason. Without it, the hospital cannot tell whether its problem is documentation, tariff or genuine clinical disagreement, and it will try to fix all three with the same tool.`,
          },
          {
            title: "Authorisation codes: the claim that is lost before treatment",
            body: `For HMO and social insurance patients, the authorisation code is the payor's agreement in advance to pay for a defined service. A service delivered without a valid code is, in most contracts, a service the hospital has chosen to give away.

The taster and the revenue cycle track deal with requesting the code. The payor-side problems are different. Codes are issued for a specific service, on specific dates, sometimes with a ceiling. A patient admitted for two nights on a code, who stays five because of a complication, needs an extension before day three, not a claim explaining the extra days afterwards. A patient authorised for an ultrasound who then needs a CT scan needs a new code. A procedure authorised at one tariff and performed with additional consumables needs the additional items authorised too.

Emergencies create the hardest cases. Most agreements allow treatment before authorisation in a genuine emergency, provided the HMO is notified within a set time. Hospitals lose money when the notification is late, when the HMO later argues the case was not an emergency, or when the emergency rule is unclear in the contract. The fix is a written emergency notification step owned by a named person on each shift, with the time recorded, and a contract clause defining what counts as an emergency and the notification window.

Response time is the other lever. If an HMO takes hours to issue codes, clinicians will treat first and hope, and the hospital carries the risk. Measure the HMO's response time from request to code and raise it in the quarterly payor review. Some agreements set a deemed-approval rule, under which a request not answered within a set time counts as approved. Where a hospital can negotiate such a clause, it shifts the cost of the HMO's slowness back to the HMO.

Track authorisation-related denials separately from all others. They are almost entirely within the hospital's control once the process is clear.`,
          },
          {
            title: "Contesting a vetted claim",
            body: `A cut that is not contested is accepted. Hospitals often believe disputing claims damages the relationship, so they let cuts stand. In practice HMOs expect disputes on a proportion of claims, and a hospital that never contests is telling the HMO that cutting its claims costs nothing.

Disputes should be selective and evidence-led. Contest a cut when the amount justifies the effort, when the hospital has the documentation to support the service, and when the reason given is wrong or unclear. Do not contest cuts the hospital deserved, such as billing above tariff, because that wastes credibility.

A good dispute has four parts: the claim reference and the amount in dispute, the HMO's stated reason, the hospital's response with the specific clinical or contractual basis, and the supporting documents such as the authorisation code, the clinical note justifying the extra day, or the tariff schedule page. A one-line email saying "kindly review" rarely recovers anything.

Clinical disputes should be signed by a clinician. When an HMO's medical officer questions why a patient stayed four days after a caesarean section, a note from the consultant obstetrician citing a post-operative complication carries weight that a billing clerk's letter does not. Hospitals that set up a short weekly session where a doctor reviews disputed clinical cuts typically recover more than the doctor's time costs.

Batch the disputes. Rather than sending each one separately, compile a monthly dispute schedule per payor, ranked by value, and take it to a reconciliation meeting with the HMO's claims and medical teams. This creates a regular forum, forces both sides to agree a number, and builds a record. Where the contract has an escalation route beyond the claims team, use it for disputes that remain unresolved after two reconciliation cycles, and keep in mind that NHIA, as regulator of HMOs, is the last resort for systematic problems rather than a first call.

Keep an eye on the window. Most agreements limit how long after payment a claim can be reopened. A dispute raised after that window is lost however strong the evidence.`,
          },
          {
            title: "Turning denial data into prevention",
            body: `Every vetting deduction is a piece of data about where the hospital's claims are weak. Recovering it one dispute at a time is necessary; preventing the next one is where the larger money sits.

Build a deduction log for each payor with, for each cut line: the claim, the service, the amount, the HMO's reason, the department and the clinician. Group reasons into a small, fixed set so trends are visible. A working set for a Nigerian secondary hospital might be: no or expired authorisation; billed above tariff; service not covered by plan; clinical necessity questioned; length of stay; documentation missing; duplicate or late submission.

Review the log monthly with the people who can change the cause. A rise in length-of-stay cuts on the surgical ward goes to the head of surgery with the case list. Above-tariff cuts go to billing to update the charge master for that payor. Not-covered cuts go to the front desk, which should have told the patient that the service needed a top-up.

Look for payor patterns as well as hospital ones. If one HMO cuts 18% of billed value and the others cut 6%, the difference may be the hospital's documentation for that HMO's particular rules, or it may be the HMO's practice. The answer changes the response: retrain staff, or raise it in the next contract review with the evidence.

Report the deduction rate, defined as billed value less approved value, divided by billed value, as one of the hospital's standing payor figures. Track it by payor and by month. A reduction from 14% to 7% on N40m of monthly insured billing recovers N2.8m a month, which is often the single largest cash improvement available to a hospital that already submits its claims on time.`,
          },
        ],
        exercises: [
          {
            title: "Deduction analysis for Festac Royal Hospital",
            instruction:
              "Festac Royal Hospital billed N52m to HMOs in Q3 and received approvals of N43.2m. The deduction log shows: no or expired authorisation N3.1m, above tariff N1.6m, length of stay N2.0m, not covered by plan N0.9m, documentation missing N1.2m. Calculate the deduction rate. For each reason, name the owner inside the hospital and one change that would prevent it. Identify which N-value of cuts you would dispute this month and what evidence you would attach. Then estimate the monthly cash gain if the deduction rate fell to 7%.",
          },
        ],
      },
      resources: { tools: ["Deduction log template", "Dispute schedule template"] },
      questions: [
        {
          question:
            "A hospital billed an HMO N30m last quarter and was paid N25.5m. Finance posted the payment and wrote off the rest as 'HMO adjustment'. What is the most important information the hospital has lost?",
          options: [
            { id: "a", text: "The HMO's bank details for future payments", isCorrect: false },
            { id: "b", text: "The split of the N4.5m deduction by reason, which shows whether the cause is documentation, tariff or clinical disagreement", isCorrect: true },
            { id: "c", text: "The patient names for the quarter", isCorrect: false },
            { id: "d", text: "The total number of claims submitted and paid, which the HMO needs from the hospital before it will process the next quarter's batch", isCorrect: false },
          ],
          explanation:
            "Without the reason split, the hospital cannot target the cause or decide what to dispute. The claim count is useful but tells nothing about why 15% was cut.",
        },
        {
          question:
            "A patient authorised for a two-night admission develops a complication and stays five nights. The hospital submits a claim for five nights with a note explaining the complication. The HMO pays two. What was the preventable failure?",
          options: [
            { id: "a", text: "The claim should have been split into two claims, one for the authorised nights and one for the additional nights with the note", isCorrect: false },
            { id: "b", text: "The note should have been signed by the matron", isCorrect: false },
            { id: "c", text: "The hospital should have requested an extension to the authorisation before the third night", isCorrect: true },
            { id: "d", text: "The complication should have been billed to the patient", isCorrect: false },
          ],
          explanation:
            "Codes cover specific services and dates, so extra days need an extension before they are delivered. An explanatory note after the event is the common habit, and it leaves the HMO free to refuse.",
        },
        {
          question:
            "Which dispute is most worth raising?",
          options: [
            { id: "a", text: "A N12,000 cut for billing above the agreed tariff", isCorrect: false },
            { id: "b", text: "A N3,500 cut for a duplicate submission the hospital made", isCorrect: false },
            { id: "c", text: "A N180,000 cut labelled 'not covered' where the hospital has no authorisation code but the patient clearly needed the service", isCorrect: false },
            { id: "d", text: "A N240,000 length-of-stay cut where the consultant's notes document a post-operative infection", isCorrect: true },
          ],
          explanation:
            "Disputes should be high-value, evidence-backed and against a wrong reason. Option c is large, but with no authorisation code the hospital has no basis, and disputing it spends credibility.",
        },
        {
          question:
            "An HMO takes an average of four hours to issue authorisation codes for emergency admissions. What contract change most directly shifts the cost of this delay back to the HMO?",
          options: [
            { id: "a", text: "A deemed-approval clause, under which a request unanswered within a set time counts as approved", isCorrect: true },
            { id: "b", text: "A higher tariff for emergency admissions, to compensate the hospital for the hours its staff spend waiting for the HMO's codes", isCorrect: false },
            { id: "c", text: "Moving all emergencies to self-pay", isCorrect: false },
            { id: "d", text: "Requiring patients to obtain their own codes", isCorrect: false },
          ],
          explanation:
            "Deemed approval makes the HMO's slowness its own cost. A higher tariff does not address the risk that the case is never paid at all.",
        },
        {
          question:
            "A hospital's deduction rate on N40m of monthly insured billing falls from 14% to 7%. What is the monthly cash gain?",
          options: [
            { id: "a", text: "N5.6m", isCorrect: false },
            { id: "b", text: "N2.8m", isCorrect: true },
            { id: "c", text: "N7.0m", isCorrect: false },
            { id: "d", text: "N0.28m", isCorrect: false },
          ],
          explanation:
            "A seven-point fall on N40m is N2.8m a month. N5.6m is the original deduction, the figure people reach for when they forget the remaining 7% is still cut.",
        },
        {
          question:
            "The hospital disputes a length-of-stay cut after a caesarean section. Who should sign the clinical justification?",
          options: [
            { id: "a", text: "The billing officer who prepared the claim, since they know the HMO's vetting rules and the tariff schedule best", isCorrect: false },
            { id: "b", text: "The hospital administrator", isCorrect: false },
            { id: "c", text: "The patient", isCorrect: false },
            { id: "d", text: "The consultant obstetrician responsible for the patient", isCorrect: true },
          ],
          explanation:
            "A clinical cut is a clinical argument, and the HMO's medical officer gives weight to the treating doctor. A billing officer can assemble the file but cannot argue necessity.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A hospital wants to make its monthly disputes with an HMO more effective. Which practices help? Select all that apply.",
          options: [
            { id: "a", text: "Compile a monthly dispute schedule ranked by value and take it to a reconciliation meeting", isCorrect: true },
            { id: "b", text: "Send a 'kindly review' email for every cut, however small", isCorrect: false },
            { id: "c", text: "Attach the authorisation code, relevant clinical note and tariff page to each dispute", isCorrect: true },
            { id: "d", text: "Track the contract's window for reopening paid claims", isCorrect: true },
          ],
          explanation:
            "Batched, evidenced disputes inside the contract window recover money and build a record. Disputing every cut without evidence teaches the HMO to ignore the hospital's disputes.",
        },
        {
          question:
            "One HMO cuts 18% of a hospital's billed value; three others cut about 6%. What should the consultant do first?",
          options: [
            { id: "a", text: "Terminate the HMO with the highest cut rate", isCorrect: false },
            { id: "b", text: "Compare the deduction reasons for that HMO against the others to see whether the cause is the hospital's documentation for its rules or the HMO's practice", isCorrect: true },
            { id: "c", text: "Raise all tariffs for that HMO by 12% to compensate for the extra deductions, and explain the reason at the next contract review meeting with its medical director", isCorrect: false },
            { id: "d", text: "Report the HMO to NHIA", isCorrect: false },
          ],
          explanation:
            "The reasons decide the response: retrain staff if it is documentation, raise it at contract review if it is the HMO. Termination or a complaint before diagnosis risks acting on a problem the hospital itself created.",
        },
        {
          question:
            "Deduction logs show 'service not covered by plan' cuts rising in outpatients. Who is the right owner for prevention?",
          options: [
            { id: "a", text: "The front desk and benefit-check process, which should tell patients before service that a top-up is needed", isCorrect: true },
            { id: "b", text: "The pharmacy, which dispenses the drugs", isCorrect: false },
            { id: "c", text: "The claims officer, who should resubmit the claim with a fuller description of the service so that it falls within the plan's benefits", isCorrect: false },
            { id: "d", text: "The HMO's call centre", isCorrect: false },
          ],
          explanation:
            "An uncovered service is collectable from the patient only if they are told before care. Resubmitting with a different description is the tempting fix and amounts to misrepresenting the claim.",
        },
        {
          question:
            "A hospital submits clean, coded claims on time, yet its insured cash is poor. Its deduction rate is 16%. Where is the largest cash improvement likely to be?",
          options: [
            { id: "a", text: "Faster claim submission, since cash arrives sooner when claims reach the HMO earlier, even if they are already on time today", isCorrect: false },
            { id: "b", text: "Raising self-pay prices", isCorrect: false },
            { id: "c", text: "Switching to a different claims submission platform", isCorrect: false },
            { id: "d", text: "Reducing vetting deductions, since submission is already sound and 16% of billed value is being lost after submission", isCorrect: true },
          ],
          explanation:
            "Submission is already sound, so the constraint is the 16% lost after submission, which prevention and selective disputes recover. Faster submission is the tempting fix, but it cannot recover money the HMO is cutting.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "receivables-claims-financing",
      name: "Ageing Receivables and Claims Financing",
      description:
        "Reading a payor receivables book, provisioning honestly, running payor collections, and judging when advancing cash against accepted claims helps and when it hides a deeper problem.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "Reading the receivables book by payor",
            body: `A hospital's receivables figure on the balance sheet is a single number that hides several different debts. The useful view breaks it down by payor and by age, and separates what has been accepted by the payor from what is still under vetting or in dispute.

Start with an ageing table: one row per payor, columns for 0 to 30, 31 to 60, 61 to 90, 91 to 180 and over 180 days, measured from submission. Add a column for status: accepted and awaiting payment, under vetting, disputed. These three are different assets. An accepted claim is a near-certain receivable whose only question is timing. A claim under vetting will lose some value. A disputed claim may lose most of it.

Then compute days sales outstanding (DSO) by payor: receivables divided by average daily billing to that payor. A hospital with an overall DSO of 75 days might find its large HMO at 50, a small HMO at 140 and a corporate retainer client at 20. The overall figure says nothing useful; the payor figures say where to act.

Watch for two distortions. Unbilled work, services delivered but not yet submitted, belongs in the revenue cycle's problem set, not in payor receivables, but hospitals often mix them. And payments received without a remittance, posted to a suspense account, make receivables look larger than they are. Both need cleaning before any analysis is trusted.

The consultant should reconcile the hospital's receivables for each major payor with the payor's own statement at least once. Differences are common and informative: claims the HMO says it never received, claims the HMO paid that the hospital never matched, and claims the HMO rejected that the hospital still carries at full value. A reconciliation for a mid-size hospital often moves the receivables figure by 10% or more, and the movement is almost always downward.`,
          },
          {
            title: "Provisioning and write-off: telling the owners the truth",
            body: `A receivable that will not be collected is not an asset, and carrying it at full value overstates the hospital's profit and its cash prospects. Provisioning is how the accounts reflect the expected loss before it is final.

A practical method for a Nigerian hospital is a provision matrix by payor type and age. For example, accepted HMO claims under 90 days might carry a small provision; claims under vetting carry a provision equal to the hospital's recent deduction rate for that payor; disputed claims carry a higher provision; anything over 180 days from a payor with a poor record carries most or all of its value as provision. The percentages should come from the hospital's own collection history, not from a textbook, and should be reviewed each year.

Provisioning is a judgement, and owners resist it because it reduces reported profit. The consultant's job is to show that the provision is evidence-based and that the alternative, a sudden large write-off when the debt is finally abandoned, is worse. A hospital that carries N90m of receivables, N25m of them over 180 days from two HMOs that have stopped paying regularly, is not N90m richer than it looks: it is perhaps N70m richer, and its owners need to know that before they borrow against the book.

Write-off is the final step and should need authority. Set a policy: who may write off how much, after what collection steps, and with what record. Without it, write-offs happen quietly at year end and nobody learns from them.

There is also a payor relationship question. A large balance over 180 days with a single HMO is a credit decision the hospital has been making by default, month after month, by continuing to treat that HMO's members on credit. The provision should prompt a decision: a payment plan with the HMO, a move to deposit or top-up for its members, or, at the limit, suspension of new non-emergency admissions until the balance falls.`,
          },
          {
            title: "Running payor collections",
            body: `Collecting from payors is relationship management backed by data. The person chasing must know exactly what is owed, what has been accepted, and who at the payor can release it.

Assign each major payor to a named owner in the hospital's finance team. That person holds the reconciled statement, attends the monthly reconciliation meeting, and knows the HMO's claims manager and finance contact by name. Smaller payors can be grouped under one owner.

Use a fixed monthly rhythm with each large payor:
- send the reconciled statement of accepted, vetting and disputed claims by an agreed date;
- hold a reconciliation meeting to agree the accepted balance and clear disputes;
- confirm the payment date and amount for the agreed balance in writing;
- escalate to the HMO's senior management if a confirmed payment is missed.

The aim is a written, agreed accepted balance each month. That number matters beyond collections: it is what a lender or claims financier will advance against, and what the hospital can plan its cash around.

When a payor falls into persistent arrears, the hospital has a few tools, in rising order of cost to the relationship. Ask for a payment plan to clear the old balance alongside current claims. Offer a small settlement discount for fast payment of a large old balance, priced against the cost of waiting. Require top-up or deposits from that payor's members for elective care. Suspend new elective admissions under that payor until the plan is honoured. Each step should be decided by management, communicated in writing, and coordinated with the medical director, because clinicians will face the patients affected.

Do not neglect the corporates. Direct accounts are often chased least, because the relationship feels friendly, and fall furthest behind.`,
          },
          {
            title: "Claims financing: what it is and when it fits",
            body: `Claims financing lets a hospital receive cash now against claims a payor has accepted but not yet paid. It solves a timing problem. It does not solve a vetting, tariff or bad-debt problem, and a hospital that uses it for those will pay a monthly fee to postpone a loss.

The typical structure in the Nigerian market works like this. A financier, which may be a fintech lender, a bank or a specialist fund, advances a share of the value of claims the payor has accepted, often well below 100% so that the financier has a cushion against payor deductions. The hospital pays a fee, usually expressed per month for as long as the advance is outstanding, sometimes with a minimum period. When the payor pays, the advance and fee are deducted and the balance goes to the hospital. The facility is usually with recourse: if the payor does not pay, the hospital owes the financier the advance and fee regardless.

Recourse is the term to explain most carefully to owners. With recourse, the hospital still carries the payor's credit risk. The financier is lending to the hospital, using the claims as evidence and partial security, not buying the payor's risk.

Work out the true cost before signing. Suppose a financier advances 70% of N20m accepted claims, N14m, at 3% a month, and the HMO pays in 75 days. The fee is about N14m times 3% times 2.5 months, roughly N1.05m, or about 5% of the claims' face value. That is affordable if it lets the hospital buy drugs at a cash discount, avoid a far more expensive overdraft or keep a theatre running. It is costly if the money simply sits in the account.

Claims financing fits a hospital whose claims are clean, whose payors accept and pay reliably but slowly, and whose cash need is for operations that generate a return. It fits poorly a hospital with high deduction rates, because the accepted base is small and uncertain, or one whose payors are in real arrears, because recourse brings the loss back to the hospital with fees added. The reconciled monthly accepted balance from the previous section is what makes financing possible at all: no financier will advance against a book the hospital cannot reconcile.`,
          },
        ],
        exercises: [
          {
            title: "Should Abeokuta Grace Hospital finance its claims?",
            instruction:
              "Abeokuta Grace Hospital has N64m of HMO receivables: N28m accepted and under 60 days, N14m under vetting, N9m disputed, N13m over 180 days from two HMOs. Its average deduction rate is 11%. A financier offers to advance 65% of accepted claims at 3.5% a month with full recourse. The hospital's main HMO pays accepted claims in about 70 days. The hospital needs N12m to buy a quarter's stock of drugs at a 6% discount for cash. Build a provision estimate for the book, calculate the cost of financing N12m for 70 days, compare it with the drug discount, and write a recommendation in label-fact bullets, including the conditions under which you would advise against the facility.",
          },
        ],
      },
      resources: { tools: ["Payor ageing template", "Claims financing cost calculator", "Payor reconciliation template"] },
      questions: [
        {
          question:
            "A hospital has an overall DSO of 80 days. Its largest HMO is at 55 days, a small HMO at 150 days and a corporate account at 25 days. Where should the collections effort focus first?",
          options: [
            { id: "a", text: "On reducing the overall DSO by sending reminders to all payors equally", isCorrect: false },
            { id: "b", text: "On the large HMO, because it holds the most money and a small improvement in its payment speed moves the most cash", isCorrect: false },
            { id: "c", text: "On the small HMO at 150 days, after checking how much of that balance is accepted versus disputed", isCorrect: true },
            { id: "d", text: "On the corporate account, because it should be paying immediately", isCorrect: false },
          ],
          explanation:
            "Payor-level DSO shows the small HMO as the outlier, and the status split shows whether the problem is collection or dispute. Focusing on the largest balance is tempting, but at 55 days it is the best-behaved large debt.",
        },
        {
          question:
            "The hospital reconciles its receivables with a major HMO's statement for the first time. Which outcome is most typical?",
          options: [
            { id: "a", text: "The balances match exactly", isCorrect: false },
            { id: "b", text: "The hospital's balance falls, as claims the HMO never received, already paid or rejected are identified", isCorrect: true },
            { id: "c", text: "The hospital's balance rises, because HMOs routinely under-record the claims they receive and owe more than the hospital has on file", isCorrect: false },
            { id: "d", text: "The HMO agrees to pay the hospital's figure without review", isCorrect: false },
          ],
          explanation:
            "First reconciliations usually find unmatched payments and rejected claims still carried at full value, so the balance falls. Occasionally unrecorded receivables appear, but the movement is mostly downward.",
        },
        {
          question:
            "A hospital carries N90m of receivables, of which N25m is over 180 days from two HMOs that have stopped paying regularly. The owners plan to borrow against 'N90m of receivables'. What should the consultant say?",
          options: [
            { id: "a", text: "Lenders will value the book at N90m because receivables are assets", isCorrect: false },
            { id: "b", text: "The book should be written down to N65m immediately and the two HMOs cut off, because debt over 180 days will not be collected", isCorrect: false },
            { id: "c", text: "Borrowing against receivables is never appropriate for a hospital", isCorrect: false },
            { id: "d", text: "The aged balance needs an evidence-based provision, so the realistic book is materially below N90m and lenders will see that too", isCorrect: true },
          ],
          explanation:
            "Provisioning from the hospital's own history gives owners and lenders a truthful figure. An immediate full write-down overshoots, since some of the aged debt may still be recovered through a payment plan.",
        },
        {
          question:
            "In a with-recourse claims financing facility, what happens if the HMO never pays a financed claim?",
          options: [
            { id: "a", text: "The hospital must repay the advance and the fee to the financier", isCorrect: true },
            { id: "b", text: "The financier absorbs the loss, since it bought the claim from the hospital when it made the advance", isCorrect: false },
            { id: "c", text: "NHIA reimburses the financier", isCorrect: false },
            { id: "d", text: "The advance converts automatically into equity in the hospital", isCorrect: false },
          ],
          explanation:
            "With recourse, the hospital keeps the payor's credit risk; the financier is lending, not buying. Owners often assume the financier has bought the claim, which is the definition of a without-recourse sale.",
        },
        {
          question:
            "A financier advances N14m against accepted claims at 3% a month, and the HMO pays in about 75 days. Approximately what is the fee?",
          options: [
            { id: "a", text: "N420,000", isCorrect: false },
            { id: "b", text: "N3.15m", isCorrect: false },
            { id: "c", text: "N1.05m", isCorrect: true },
            { id: "d", text: "N2.1m", isCorrect: false },
          ],
          explanation:
            "75 days is about 2.5 months, so the fee is N14m times 3% times 2.5, about N1.05m. N420,000 is one month only, the error of ignoring how long the advance is outstanding.",
        },
        {
          question:
            "Which hospital is the best fit for claims financing?",
          options: [
            { id: "a", text: "One with a 25% deduction rate that needs cash to cover the gap between what it bills and what its HMOs approve", isCorrect: false },
            { id: "b", text: "One with clean claims, reliable but slow payors, and a cash need for operations that earn a return", isCorrect: true },
            { id: "c", text: "One whose two main HMOs are in arrears over 180 days", isCorrect: false },
            { id: "d", text: "One that cannot reconcile its receivables with any payor", isCorrect: false },
          ],
          explanation:
            "Financing solves timing, so it suits accepted, reliably paid claims. A hospital with large arrears is tempted most, but recourse returns the loss with fees added.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "An HMO's balance with a hospital is N38m, of which N22m is over 120 days. Which responses are appropriate escalation steps for management to consider? Select all that apply.",
          options: [
            { id: "a", text: "Agree a written payment plan for the old balance alongside current claims", isCorrect: true },
            { id: "b", text: "Require top-up or deposits from the HMO's members for elective care", isCorrect: true },
            { id: "c", text: "Quietly stop recording new claims for that HMO", isCorrect: false },
            { id: "d", text: "Offer a priced settlement discount for fast payment of the old balance", isCorrect: true },
          ],
          explanation:
            "Payment plans, priced settlement discounts and deposit requirements are standard, escalating tools decided by management. Not recording claims destroys the hospital's own evidence of what it is owed.",
        },
        {
          question:
            "A hospital's receivables include N6m of payments received from HMOs without remittances, held in a suspense account and not matched to claims. What effect does this have?",
          options: [
            { id: "a", text: "Receivables are understated by N6m", isCorrect: false },
            { id: "b", text: "Revenue is overstated by N6m, because the hospital recorded income for claims that the HMOs paid without sending any remittance", isCorrect: false },
            { id: "c", text: "There is no effect, since cash has been received", isCorrect: false },
            { id: "d", text: "Receivables look up to N6m larger than they are, because the paid claims are still shown as outstanding", isCorrect: true },
          ],
          explanation:
            "Until matched, the paid claims remain in receivables, overstating them. Revenue was recorded when billed and is not changed by the suspense posting.",
        },
        {
          question:
            "Why should a hospital agree a written accepted balance with each major HMO every month?",
          options: [
            { id: "a", text: "It is the figure collections, cash planning and any claims financier work from", isCorrect: true },
            { id: "b", text: "NHIA requires a monthly balance confirmation from all accredited providers and their HMOs, signed by both parties", isCorrect: false },
            { id: "c", text: "It removes the HMO's right to vet claims", isCorrect: false },
            { id: "d", text: "It allows the hospital to bill interest on late payments", isCorrect: false },
          ],
          explanation:
            "An agreed accepted balance is the basis for chasing, planning and borrowing. It does not remove vetting rights, which apply before acceptance.",
        },
        {
          question:
            "Financing N12m for 70 days at 3.5% a month would cost about N980,000. The hospital would use the cash to buy drugs at a 6% discount for cash. Is the facility worth it for this purpose alone?",
          options: [
            { id: "a", text: "No, because any financing fee is a loss", isCorrect: false },
            { id: "b", text: "Yes, because the 6% discount on N12m is N720,000 and the facility also gives the hospital extra cash to hold in reserve", isCorrect: false },
            { id: "c", text: "No, because the N720,000 discount is less than the roughly N980,000 fee", isCorrect: true },
            { id: "d", text: "Yes, because claims financing always improves cash flow", isCorrect: false },
          ],
          explanation:
            "6% of N12m is N720,000, below the N980,000 fee, so this use alone does not pay for the facility. Option b gets the discount right but reverses the comparison.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "payor-mix-strategy",
      name: "Payor Mix Strategy and the Self-Pay Balance",
      description:
        "Measuring what each payor really contributes, setting a target mix the hospital can reach, and managing the balance between insured volume and self-pay margin.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "Contribution per payor, not revenue per payor",
            body: `Revenue tells a hospital who sends the most patients. It does not tell the hospital who pays for its overheads. Payor mix strategy starts with measuring the contribution each payor makes after the costs that vary with its patients and after the cost of collecting its money.

For each payor, build a simple payor P&L for the last twelve months:
- billed revenue;
- less vetting deductions and bad debt, giving net revenue;
- less direct variable costs of the care delivered (drugs, consumables, sessional doctor fees paid per case, lab reagents);
- less the cost of financing the payor's receivables, using the hospital's cost of borrowing applied to the average balance;
- less a share of administrative cost where one payor is clearly more expensive to service, such as a dedicated authorisation clerk.

The result is the payor's contribution to fixed costs and profit. Expressed as a percentage of billed revenue, it is often surprising. A hospital may find self-pay contributing 45%, its large HMO 22%, a smaller HMO 9% once its 140-day DSO and 17% deduction rate are counted, and a state scheme 12% because its tariff is low but its patients use spare capacity at little extra cost.

Two points need care. Use variable cost, not fully loaded average cost, because fixed costs are paid regardless of which payor fills the bed; this is the same logic as accepting a low tariff when capacity is idle. And watch for case mix. If one HMO sends mostly simple outpatient visits and another sends complex surgery, their contribution rates are not directly comparable without looking at service lines.

This analysis is the foundation for every later decision. Without it, payor strategy becomes a debate about which HMO is most annoying to deal with, which is a poor proxy for which one is worth having.`,
          },
          {
            title: "Capacity decides what mix is right",
            body: `The right payor mix depends on whether the hospital's beds, theatres and clinics are full. A payor worth courting when a hospital runs at 50% occupancy may be one to limit when it runs at 90%.

When capacity is idle, any payor whose net tariff covers variable cost and pays reliably adds contribution. This is the stage at which state schemes, NHIA-linked HMO enrollees and large corporate accounts can be the right growth route, because they bring volume and the hospital's fixed costs are already committed.

When capacity is tight, every bed-day and theatre slot has an alternative use. The question changes from "does this payor cover variable cost?" to "does this payor contribute more per bed-day or per theatre hour than the patient it displaces?" A hospital with a full surgical ward should compare contribution per bed-day across payors, and steer elective scheduling towards the higher-contributing ones.

Steering does not mean refusing emergencies or discriminating at the point of care. It means commercial decisions upstream: which HMOs to sign for which services, how many elective slots to offer each payor, which corporate accounts to pursue, and whether to open a new self-pay service line. Emergency care is given on clinical need; the payor mix is shaped by contracts and scheduling.

Capacity also differs by department. A hospital may have a full maternity ward and idle outpatient clinics. Its mix strategy might then limit low-tariff maternity contracts while actively seeking HMO outpatient volume. A single hospital-wide target hides this.

A consultant should map capacity utilisation by department alongside the payor P&L. The combination shows where the hospital should grow insured volume, where it should protect self-pay, and where it should renegotiate.`,
          },
          {
            title: "The self-pay balance",
            body: `Self-pay patients usually contribute the most per case and carry the least collection risk when deposits are taken. They are also the most sensitive to price and to experience, and the first to leave when the economy tightens. Treating self-pay as the hospital's margin reserve, without investing in it, wastes the strongest part of the book.

Several features of the Nigerian market shape the self-pay segment. A large share of health spending is out of pocket, so self-pay is not a niche. Many insured patients become self-pay at the edge of their cover: for excluded services, for upgrades such as private rooms, or once an annual limit is reached. Diaspora relatives often fund care for parents at home, which creates a segment that pays well and values communication. And inflation and exchange-rate movement have pushed some previously insured patients onto self-pay as employers cut cover.

A hospital that over-relies on insured volume tends to let its self-pay offer drift. The same clinic slots, waiting times and billing process are used for everyone, and self-pay patients find they pay a premium for no visible difference. They then choose a competitor. A balanced strategy defines what self-pay patients get that is worth paying for: shorter waits, named consultants, clear package prices, and a billing conversation that respects them.

Top-ups are where insured and self-pay meet. A top-up policy sets out, for each payor and service, what the patient pays above what the HMO covers. Done well, it is transparent and agreed before service. Done badly, it surprises patients at discharge, generates complaints to the HMO and damages the relationship. Some HMO agreements restrict top-ups; the contract review should check.

Self-pay pricing itself belongs to the elective and self-pay track. The payor question here is the share: how much of the hospital's contribution comes from self-pay, whether that share is rising or falling, and whether the hospital is unintentionally pushing self-pay patients away by serving them like insured ones.`,
          },
          {
            title: "Setting and moving towards a target mix",
            body: `A target payor mix is a set of commercial choices with numbers attached, reviewed quarterly. It is reached by changing contracts, capacity allocation and the self-pay offer over twelve to twenty-four months, not by announcing a percentage.

Set the target from the payor P&L and capacity map. A typical statement might read: grow self-pay from 30% to 36% of revenue, mostly through specialist outpatients and two procedure packages; hold the largest HMO at no more than 30% of insured revenue; exit or reprice two small HMOs whose contribution after deductions and financing is below 8%; add one state scheme contract for outpatient services where clinics are under-used.

Each element needs an owner and actions. The finance lead owns the HMO repricing and exits. The medical director and operations lead own capacity allocation in theatre and wards. Marketing and the front desk own the self-pay experience. The CEO owns the decision to accept lower volume in exchange for higher contribution, which is the hardest one, because revenue may fall before profit rises.

Exits need handling. Ending an HMO relationship affects patients mid-treatment, clinicians who see those patients, and the hospital's reputation with the HMO's corporate clients. Give notice as the contract requires, honour run-off for admitted patients, tell clinicians early, and consider offering affected patients a self-pay or top-up route.

Report progress with a short dashboard each quarter: revenue and contribution share by payor, DSO and deduction rate by payor, self-pay share and self-pay patient volumes, and capacity utilisation by department. The measure of success is total contribution and cash, not the mix percentages themselves. A mix that hits its target while total contribution falls has been badly designed.`,
          },
        ],
        exercises: [
          {
            title: "Payor P&L and target mix for Lekki Palmview Medical Centre",
            instruction:
              "Lekki Palmview Medical Centre runs at 88% bed occupancy and 60% outpatient clinic utilisation. Last year: self-pay revenue N180m with 38% variable cost and 2% bad debt; HMO A N140m, 46% variable cost, 9% deductions, DSO 60 days; HMO B N60m, 50% variable cost, 17% deductions, DSO 140 days; corporate accounts N40m, 42% variable cost, 5% bad debt, DSO 45 days. The hospital's cost of borrowing is 30% a year. Build the payor P&L to contribution, ranking payors by contribution percentage. Then propose a target mix for the next eighteen months, stating what changes for wards versus outpatients, and name the owner of each action.",
          },
        ],
      },
      resources: { tools: ["Payor P&L template", "Capacity utilisation map"] },
      questions: [
        {
          question:
            "An HMO brings N60m a year with 50% variable cost, 17% deductions and a 140-day DSO. Another brings N40m with 45% variable cost, 6% deductions and a 50-day DSO. Which statement is most accurate?",
          options: [
            { id: "a", text: "The N60m HMO is more valuable, because it brings 50% more revenue and the hospital's fixed costs are spread over more patients", isCorrect: false },
            { id: "b", text: "Both are equally valuable because their variable costs are similar", isCorrect: false },
            { id: "c", text: "The smaller HMO is likely to contribute more per naira billed once deductions and financing cost are counted", isCorrect: true },
            { id: "d", text: "Neither can be compared without NHIA tariff data", isCorrect: false },
          ],
          explanation:
            "Deductions and the cost of carrying a 140-day balance erode the larger HMO's contribution heavily. Revenue size is the tempting measure, but it says nothing about what is left to cover overheads.",
        },
        {
          question:
            "Why should the payor P&L use variable cost rather than fully loaded average cost per case?",
          options: [
            { id: "a", text: "Fixed costs are paid whichever payor fills the bed, so they do not distinguish between payors", isCorrect: true },
            { id: "b", text: "Variable cost is always lower than average cost, which makes every payor look more profitable and helps the hospital keep its contracts", isCorrect: false },
            { id: "c", text: "Fully loaded cost is not allowed under Nigerian accounting rules", isCorrect: false },
            { id: "d", text: "HMOs only reimburse variable cost", isCorrect: false },
          ],
          explanation:
            "Contribution analysis isolates what each payor adds beyond costs that would be incurred anyway. Making payors look profitable is not the purpose; fully loaded cost is used for other purposes such as tariff setting.",
        },
        {
          question:
            "A hospital runs its surgical ward at 92% occupancy. A new HMO offers a tariff that covers variable cost with a small margin. What is the right test?",
          options: [
            { id: "a", text: "Accept, because any tariff above variable cost adds contribution to fixed costs, whatever the occupancy of the ward", isCorrect: false },
            { id: "b", text: "Compare its contribution per bed-day with that of the patients it would displace", isCorrect: true },
            { id: "c", text: "Reject, because the ward is nearly full", isCorrect: false },
            { id: "d", text: "Accept only for emergency cases", isCorrect: false },
          ],
          explanation:
            "When capacity is tight, the cost of a bed-day includes the contribution of the patient displaced. The variable-cost test is correct only when capacity is idle, which is why it is the tempting wrong answer here.",
        },
        {
          question:
            "A hospital's maternity ward is full, while its outpatient clinics run at 55% utilisation. How should its payor mix strategy differ by department?",
          options: [
            { id: "a", text: "Apply a single hospital-wide target to keep things simple", isCorrect: false },
            { id: "b", text: "Seek more maternity contracts so that the ward stays full, since a full ward always earns more than an empty clinic", isCorrect: false },
            { id: "c", text: "Reduce outpatient staffing to match demand", isCorrect: false },
            { id: "d", text: "Limit low-tariff maternity contracts while actively seeking insured outpatient volume", isCorrect: true },
          ],
          explanation:
            "Department capacity decides where insured volume adds contribution and where it displaces better-paying patients. A hospital-wide target hides this difference.",
        },
        {
          question:
            "Which practice is consistent with shaping payor mix ethically?",
          options: [
            { id: "a", text: "Allocating elective theatre slots between payors based on contracts and contribution", isCorrect: true },
            { id: "b", text: "Asking emergency patients for their payor before deciding whether to treat", isCorrect: false },
            { id: "c", text: "Scheduling low-tariff patients' elective and emergency care later in the week to free beds for better-paying patients", isCorrect: false },
            { id: "d", text: "Telling HMO patients that services are unavailable when they are not", isCorrect: false },
          ],
          explanation:
            "Mix is shaped upstream through contracts and elective scheduling; emergency care follows clinical need. The other options discriminate at the point of care or mislead patients.",
        },
        {
          question:
            "Several insured patients complain to their HMO about unexpected charges at discharge for private room upgrades. What has most likely gone wrong?",
          options: [
            { id: "a", text: "The hospital's self-pay prices for private rooms are too high compared with other hospitals in the same catchment", isCorrect: false },
            { id: "b", text: "The HMO should cover private rooms for all plans", isCorrect: false },
            { id: "c", text: "The top-up was not explained and agreed with the patient before service", isCorrect: true },
            { id: "d", text: "The hospital should stop offering upgrades", isCorrect: false },
          ],
          explanation:
            "A transparent top-up policy agreed before service avoids surprise bills and complaints. The price level may be fine; the failure is in when and how it was communicated.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A hospital plans to exit a small HMO whose contribution is very low. What should it do to manage the exit? Select all that apply.",
          options: [
            { id: "a", text: "Give the notice the contract requires", isCorrect: true },
            { id: "b", text: "Honour run-off for patients already admitted", isCorrect: true },
            { id: "c", text: "Stop treating the HMO's members the day the decision is made", isCorrect: false },
            { id: "d", text: "Tell clinicians early and offer affected patients a self-pay or top-up route", isCorrect: true },
          ],
          explanation:
            "Notice, run-off and early communication protect patients, clinicians and reputation. Stopping treatment immediately breaches the contract and harms patients mid-care.",
        },
        {
          question:
            "A hospital hits its target of 36% self-pay share, but total contribution falls by N20m over the year. What does this indicate?",
          options: [
            { id: "a", text: "The strategy succeeded, since the target was met", isCorrect: false },
            { id: "b", text: "The mix was badly designed or executed, because success is measured by total contribution and cash", isCorrect: true },
            { id: "c", text: "Self-pay patients are less profitable than the payor P&L showed, so the hospital should rebalance back towards its largest HMOs and corporates", isCorrect: false },
            { id: "d", text: "The hospital should now aim for 45% self-pay", isCorrect: false },
          ],
          explanation:
            "Mix percentages are means, not ends; a falling contribution means the change displaced more value than it created. Concluding that self-pay is unprofitable skips the diagnosis.",
        },
        {
          question:
            "Which decision in a target-mix plan most clearly belongs to the CEO rather than the finance lead?",
          options: [
            { id: "a", text: "Updating the tariff schedule in the billing system", isCorrect: false },
            { id: "b", text: "Running the monthly reconciliation meeting with each HMO and confirming the agreed accepted balance in writing", isCorrect: false },
            { id: "c", text: "Calculating DSO by payor", isCorrect: false },
            { id: "d", text: "Accepting lower revenue in the short term in exchange for higher contribution", isCorrect: true },
          ],
          explanation:
            "Trading revenue for contribution is a strategic decision that owners and staff will feel, so it sits with the CEO. The other tasks are operational finance work.",
        },
        {
          question:
            "An employer cuts its staff HMO cover, and a group of regular patients move to self-pay. What should the hospital's self-pay offer do to keep them?",
          options: [
            { id: "a", text: "Offer them something visibly worth paying for, such as shorter waits, a named consultant and clear package prices", isCorrect: true },
            { id: "b", text: "Keep the same experience but add a 15% discount for their first year as self-pay patients, so that the change in cost feels smaller", isCorrect: false },
            { id: "c", text: "Ask the employer to restore cover", isCorrect: false },
            { id: "d", text: "Treat them exactly as before, since they already know the hospital", isCorrect: false },
          ],
          explanation:
            "Self-pay patients compare value; paying more for the same experience drives them to competitors. A temporary discount delays the decision without giving a reason to stay.",
        },
      ],
    },
  ],
};

export default expansion;
