import type { Option, Question, TrackExpansion } from "./types";

/**
 * Builds a question. `correct` lists the correct option letters, e.g. "c" or "abd".
 * More than one letter makes it MULTI_SELECT.
 */
function q(question: string, texts: string[], correct: string, explanation: string): Question {
  const ids = ["a", "b", "c", "d", "e"] as const;
  const options: Option[] = texts.map((text, i) => ({ id: ids[i], text, isCorrect: correct.includes(ids[i]) }));
  return { type: correct.length > 1 ? "MULTI_SELECT" : "MULTIPLE_CHOICE", question, options, explanation };
}

const expansion: TrackExpansion = {
  slug: "public-sector-health-systems",
  topUp: [
    {
      moduleSlug: "health-system-design",
      questions: [
        q(
          "A state launches a contributory health insurance scheme with a well-designed benefit package. A year in, enrolment records are on paper at each LGA office, claims take five months to process and the agency cannot say how many people are covered. Which building block is failing the financing reform?",
          [
            "Health information systems, because enrolment, claims and payment all depend on reliable data",
            "Health workforce, because the scheme needs more doctors",
            "Access to essential medicines, because enrolees cannot get drugs",
            "Service delivery, because the facilities in the network cannot provide the package the scheme promised",
          ],
          "a",
          "Building blocks interact, and a financing function cannot pool or purchase without data on who is covered and what was delivered. The symptoms described are all information failures, not shortages of staff or drugs.",
        ),
        q(
          "A state health insurance agency collects premiums from civil servants, combines them with an equity fund into one account, and pays accredited PHCs a fixed amount per enrolee each month. Which financing function is the monthly payment to PHCs?",
          ["Revenue collection", "Pooling", "Stewardship", "Purchasing"],
          "d",
          "Paying providers, including the choice of payment method, is purchasing. Combining the contributions and the equity fund in one account is pooling.",
        ),
        q(
          "A ministry finds that a large share of registered private facilities have not been inspected in years and it has only 12 inspectors for the state. What reform best fits the governance problem?",
          [
            "Hire enough inspectors to visit every registered facility at least once a year, then build the inspection protocol",
            "Suspend all uninspected facilities until they can be visited",
            "Build a digital facility registry and inspect on a risk basis, by service type and complaint signals",
            "Transfer inspection to the facilities themselves through self-assessment only",
          ],
          "c",
          "A risk-based protocol uses scarce inspectors where harm is most likely, and a registry tells the regulator what exists. Mass suspension would cut access overnight, and self-assessment alone removes oversight.",
        ),
        q(
          "In a Nigerian state, PHC staff are paid by the LGA, drugs come through the state, and the facilities are supervised by three different bodies. The state wants to fix accountability for PHC performance. Which reform addresses the governance problem directly?",
          [
            "Raise the PHC budget line by 30% so that every facility can meet its running costs",
            "Build more PHC facilities in underserved wards",
            "Introduce pay-for-performance at every PHC, so that staff are rewarded for results whoever employs them",
            "Bring PHC management, staff and funds under one body, such as a State Primary Health Care Board",
          ],
          "d",
          "The problem is fragmented authority, so the remedy is to consolidate responsibility in one accountable body. More money or incentives paid into a fragmented structure leave no one answerable for results.",
        ),
        q(
          "A country's out-of-pocket spending is 70% of total health expenditure and its formal sector employs 15% of workers. A minister proposes making UHC depend on a payroll-based social health insurance scheme. What is the core weakness of that plan?",
          [
            "Payroll contributions reach only the small formal sector, so most people need tax-funded or subsidised cover",
            "Payroll schemes cannot be combined with capitation, so primary care would have to stay on fee-for-service",
            "Payroll contributions raise too much money for the health system to absorb",
            "Social health insurance cannot pay providers by capitation",
          ],
          "a",
          "With 85% of workers outside formal employment, payroll contributions cannot widen risk pooling enough to cut out-of-pocket spending. UHC paths in such settings rely on tax financing or subsidised premiums for the informal sector.",
        ),
      ],
    },
    {
      moduleSlug: "ppp-government-advisory",
      questions: [
        q(
          "A state wants private management expertise at a run-down general hospital but intends to keep ownership, has no budget for new capital works and wants to be able to exit within five years. Which PPP model fits best?",
          ["Build-operate-transfer", "Joint venture", "Long-term lease with operating risk", "Management contract"],
          "d",
          "A management contract brings in operating expertise while the state keeps ownership, with a short term and no private capital requirement. BOT needs private capital and a long concession to recover it.",
        ),
        q(
          "A ministry is excited by a proposed hospital PPP with annual availability payments fixed in the contract for 20 years. Based on the experience of Lesotho's Queen Mamohato hospital, what should the advisory team test first?",
          [
            "Whether the private partner has built and run hospitals of this size before, in Africa or elsewhere",
            "Whether the facility design is modern enough",
            "Whether the fixed payments are affordable within the health budget over the full term",
            "Whether the contract allows the hospital to be named after the governor",
          ],
          "c",
          "The Lesotho case showed that a good facility can strain the whole health budget when fixed payments outrun fiscal capacity. Affordability over the full term comes before design quality.",
        ),
        q(
          "A managed equipment service places CT scanners and digital X-ray in 15 state hospitals. Six months later, most machines are used a few times a week. What does the Kenyan MES experience suggest went wrong?",
          [
            "Equipment was placed without the trained staff, referral demand and running budget needed to use it",
            "The machines were too advanced for district hospitals, which need simpler equipment that local staff can repair",
            "The private partner overcharged for maintenance",
            "The hospitals should have bought the equipment outright",
          ],
          "a",
          "MES delivered machines but utilisation lagged where facilities lacked trained radiographers and operating support. Ownership model was not the binding constraint; the surrounding system was.",
        ),
        q(
          "Six months into a state engagement, the Commissioner for Health is redeployed and a new one arrives with different priorities. Which earlier choice best protects the work?",
          [
            "Having escalated every key decision to the Governor's office, so that it carries authority above any Commissioner",
            "Having kept the work confidential to the previous Commissioner",
            "Having built relationships with the Permanent Secretary and directors, and recorded decisions in writing",
            "Having avoided written records to stay flexible",
          ],
          "c",
          "Political appointees rotate while career civil servants remain, and written records carry decisions across a change of principal. Work held privately with one Commissioner tends to lapse when that Commissioner leaves.",
        ),
        q(
          "A state has adopted an 80-page PHC policy with ambitious targets. There is no implementation plan, no budget line and no unit responsible. What should the first deliverable be?",
          [
            "A revised, shorter version of the policy document",
            "A public launch event to build awareness",
            "A costed, sequenced implementation plan with named owners, quarterly milestones and a review routine",
            "A funding request to development partners covering the full cost of the policy, so the state is not constrained",
          ],
          "c",
          "The gap is implementation, not policy content, so the first product converts the policy into costed activities, owners and a review routine. Rewriting the policy or seeking funding before a plan exists leaves the gap in place.",
        ),
      ],
    },
    {
      moduleSlug: "phc-strengthening-provider-payment",
      questions: [
        q(
          "A state scheme pays accredited PHCs a capitation of N350 per enrolee per month. Facilities report that this does not cover their cost of care, and enrolees say they are told drugs are out of stock and sent to buy them outside. What is happening?",
          [
            "Enrolees are over-using services because care is free at the point of use, so they should face co-payments",
            "The rate is set below the cost of the package, so facilities are under-providing to protect themselves",
            "The facilities are being paid too much and are hoarding drugs",
            "Capitation always causes stock-outs and should be replaced by fee-for-service",
          ],
          "b",
          "A capitation rate below the cost of the package pushes providers to ration, often through sending patients to buy drugs. The fix is a costed rate with quality monitoring, not abandoning capitation.",
        ),
        q(
          "After a scheme moved its secondary hospitals to fee-for-service, the number of lab tests per outpatient visit rose by 60% in a year with no change in case mix. What is the most likely driver?",
          [
            "Doctors became more thorough after clinical guideline training and now order the tests the guidelines recommend",
            "Enrolees became sicker",
            "The payment method rewards volume, so providers order more billable services",
            "The labs became more efficient",
          ],
          "c",
          "Fee-for-service pays per item, which rewards volume. With case mix unchanged, a rise of that size points to the incentive, which calls for utilisation review or a bundled payment.",
        ),
        q(
          "Six months after a pilot DRG payment began, the share of admissions coded as 'with major complications' rose from 12% to 31% at participating hospitals. What should the scheme do?",
          [
            "Audit a sample of records for upcoding and tighten coding rules and verification",
            "Raise the DRG rates, since the hospitals are clearly treating sicker patients than the pilot expected",
            "End the pilot immediately and return to per diem payment",
            "Accept the coding, because hospitals know their patients best",
          ],
          "a",
          "DRGs pay more for higher severity codes, so a sudden severity shift is a classic sign of upcoding. Audit and verification are the proportionate response; ending the pilot discards the gains in cost control.",
        ),
        q(
          "A pay-for-performance scheme rewards PHCs for immunisation and facility deliveries. Two years later, outpatient care for adults with hypertension has fallen at participating facilities. What explains this?",
          [
            "Hypertension prevalence fell because of the scheme",
            "Adults with hypertension moved to private pharmacies, which now sell the drugs more cheaply than PHCs",
            "Facilities have shifted effort to incentivised services at the expense of unmeasured ones",
            "Immunisation crowded out the cold chain space needed for hypertension drugs",
          ],
          "c",
          "Neglect of non-incentivised services is a known P4P pitfall. Fixes include a broader indicator set with a quality score, or a base payment that protects the rest of the package.",
        ),
        q(
          "A scheme pays the same capitation to an urban PHC whose enrolees are mainly young civil servants and to a rural PHC whose enrolees are mainly elderly farmers and children. What design feature is missing?",
          [
            "A co-payment for rural enrolees",
            "A higher rate for urban facilities, to reflect the higher rents and salaries they pay in the city",
            "Fee-for-service payment at rural facilities",
            "Risk adjustment, so each rate reflects the age, sex and expected need of the enrolees",
          ],
          "d",
          "Without risk adjustment, facilities with higher-need populations are underpaid and have a reason to avoid such enrolees. Co-payments would fall on the people least able to pay.",
        ),
      ],
    },
  ],
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "insurance-reform-policy",
      name: "Health Insurance Reform as Policy",
      description:
        "Designing health insurance reform from the government side: the NHIA Act 2022, state schemes, the Basic Health Care Provision Fund and covering the informal sector, with the design choices and trade-offs a ministry must make.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "What the NHIA Act 2022 changed and what it did not",
            body: `The National Health Insurance Authority Act 2022 repealed the old NHIS Act and set the legal frame for health insurance reform in Nigeria. Its most important change is that health insurance became mandatory for every Nigerian and legal resident. Under the old law, coverage was effectively voluntary outside the federal civil service, and after nearly two decades the scheme covered a small minority of the population, in single-digit percentages for most of its history.

The Act also changed the architecture. NHIA is now a regulator and coordinator as well as a scheme operator: it accredits facilities, licenses and regulates HMOs and other third-party administrators, and sets standards for state schemes. Every state is required to establish or maintain a State Health Insurance Scheme, and states that had already created agencies under the earlier push are expected to align with the national framework. The Act created a Vulnerable Group Fund to pay premiums for people who cannot pay, financed from a share of the Basic Health Care Provision Fund and other sources the Act names.

What the Act did not do matters as much. A mandate is a legal duty, not an enrolment mechanism. Most Nigerians work outside formal employment, with no employer to deduct a premium and no payslip to deduct it from, and enforcement against an individual farmer or trader is neither practical nor politically attractive. The mandate therefore works mainly through employers in the formal sector, through state civil service schemes, and through subsidised enrolment paid for by government.

The Act also left the money question largely to the states and to the federal budget. A mandate without public funding for those who cannot pay produces a law that covers everyone on paper and a scheme that covers few in practice.

A consultant advising a state on reform should start from this reading. The law gives the state the authority and the obligation to run a scheme. It does not give the state the revenue, the administrative capacity or the provider network. Those are the design problems, and they are mostly fiscal and institutional, not legal. Reading the Act as if the mandate solves enrolment is the error that has stalled several state schemes.`,
          },
          {
            title: "The money: BHCPF, state counterpart and fiscal space",
            body: `The Basic Health Care Provision Fund (BHCPF) is the main federal transfer for primary care and for the poorest people's insurance. It was created by the National Health Act 2014, which requires that it receive not less than one per cent of the Consolidated Revenue Fund, with contributions from donors and other sources allowed on top.

The Act divides the fund through gateways. Half goes through the insurance gateway, now NHIA, to pay for a Basic Minimum Package of Health Services for enrolled people, usually through capitation to accredited PHCs and fee-for-service for referrals. Forty-five per cent goes through the NPHCDA gateway for essential drugs, vaccines, equipment, facility maintenance and human resources at PHCs. A small remainder is reserved for emergency medical treatment, and revised operational guidelines have since added a window for public health emergencies.

Access is conditional. States must meet eligibility conditions, which include a functioning State Primary Health Care Board and a state health insurance agency, and must contribute counterpart funds. A state that has not met its counterpart obligation or has not set up the required institutions leaves federal money unclaimed. Several states have done exactly that in some years, and the first piece of advisory work in a state is often a simple audit of what it is eligible for and what is standing in the way.

Fiscal space decides how far reform can go. In practice the state's equity fund, BHCPF flows through the insurance gateway, and any earmarked levies together set how many vulnerable people can be enrolled. If the state has N3bn a year for subsidised premiums and the costed premium for the package is N12,000 per person, it can cover 250,000 people. If it has identified 1.5 million people as poor and vulnerable, it must choose whom to cover first, or shrink the package, or find more money. There is no fourth option that works.

Funds flow matters as much as the total. Capitation from the BHCPF reaches facilities only after funds pass through federal and state accounts, and delays of months have been common. A PHC that is paid late stops seeing scheme enrolees as a priority. Reform design must include the payment calendar, who signs at each step, and a published record of when each facility was paid. Delayed and unpredictable flows undermine provider trust faster than low rates do.`,
          },
          {
            title: "Designing a state scheme",
            body: `A state scheme is a set of linked design choices. Each one constrains the others, and a scheme that sets them separately ends up promising more than it can pay for.

Who is covered first. Most state schemes start with the state civil service, because a payroll deduction is easy to collect and civil servants are a large, stable group. Formal private employers come next. Then the vulnerable groups, paid for by the equity fund and the BHCPF. The informal sector is last and hardest. Starting with civil servants is sensible, but it creates a risk: a scheme that is in practice a payroll deduction for government workers, with little to show the rest of the population.

What is covered. The benefit package must be costed by an actuary against the expected population, using local utilisation and the tariffs the scheme will pay. The commonest failure is a political package that promises secondary and some tertiary care for a premium that can fund primary care and basic referrals. When the premium cannot fund the package, the shortfall shows up as unpaid claims, providers leaving the network and enrolees told to pay out of pocket for covered services.

How providers are paid. Capitation for primary care and fee-for-service or bundled payments for referrals is the usual mix, with the trade-offs covered in the provider payment module. The scheme must also decide whether to purchase through HMOs or third-party administrators or to manage enrolment, claims and provider relations in-house. Using HMOs buys administrative capacity quickly, at the cost of an administrative margin and a further party between the scheme and the providers. Building in-house capacity is cheaper in the long run if the agency can recruit and keep the staff. Many states use a mix, with HMOs for the formal sector and the agency managing the equity programme directly.

How big the pool is. Small pools are unstable: a scheme with 150,000 enrolees can be pushed into deficit by a handful of expensive cases. Pooling across programmes within the state, reinsurance for high-cost cases, and keeping catastrophic conditions in a separate nationally pooled fund all reduce that risk.

Who governs. The agency needs a board with clear authority, published accounts, and a separation between the body that sets tariffs and accredits providers and the bodies that are paid. Where the agency both runs public facilities and pays them, accreditation tends to be lenient and tariffs politicised.`,
          },
          {
            title: "Covering the informal sector",
            body: `Voluntary contributory enrolment of informal workers has failed almost everywhere it has been tried as the main route, in Nigeria and elsewhere. Understanding why is the start of a design that works.

Adverse selection is the core problem. People who expect to need care enrol; healthy people do not. A voluntary scheme open to individuals at any time attracts the pregnant, the chronically ill and the elderly, its claims exceed premiums, it raises premiums, and the healthiest remaining members leave. A state scheme that finds its informal-sector enrolees claiming 140% of what they pay is watching this happen.

Affordability and income timing come next. A trader's income arrives daily and varies by season; an annual premium of N15,000 due in one sum is out of reach even when the annual total is affordable. Trust is the third. People who have been turned away from a facility, or told to buy drugs that should be covered, do not renew.

Design responses fall into a few groups.
- Enrol households, not individuals, so the healthy are pooled with the sick.
- Enrol through groups: market associations, transport unions, cooperatives, faith groups, farmer organisations. Group enrolment brings in members regardless of health status and gives the scheme a collection channel.
- Use waiting periods for non-emergency care, so people cannot join only when ill.
- Collect in small, frequent amounts through mobile money or agents, matched to income patterns.
- Subsidise fully those identified as poor, using a targeting tool such as the National Social Register, and partly for the near-poor.

International experience points the same way. Ghana's scheme exempts large groups from premiums and funds them from an earmarked tax. Rwanda's community-based insurance uses tiered premiums by household category, with the poorest subsidised, and strong local mobilisation. Indonesia covers its poor and near-poor through a fully subsidised membership category. The common thread is that wide coverage of the informal sector comes from public subsidy plus group or household enrolment, not from individual voluntary purchase.

Retention matters more than first enrolment. Many schemes announce large enrolment drives and quietly lose half their members at renewal. Measure renewal rates by cohort, find out why people leave, and fix the service experience that drives them out. A scheme with 200,000 members renewing at 85% is in a stronger position than one with 400,000 renewing at 45%.`,
          },
          {
            title: "Sequencing reform and judging whether it worked",
            body: `Reform is a sequence, and the order matters more than the ambition of any single step. A state that launches a full package before the basics are in place spends its political capital on a scheme that providers distrust within a year.

A workable sequence starts with institutions and money. Establish the agency with its legal basis and board, meet BHCPF eligibility conditions, and secure the counterpart funds and equity fund in the budget with a release schedule. Then cost the package actuarially and set tariffs from a costing study. Then accredit providers, beginning where the network is strongest, and set up enrolment, claims and payment systems. Only then launch, with the civil service and vulnerable groups first, and extend to the informal sector through group enrolment once the scheme has shown it pays providers on time.

The political economy shapes the timetable. A governor's term is four years. A scheme that is launched in the third year has little time to prove itself before an election, and successor administrations often rebrand or defund their predecessor's programme. Building the scheme into law, a multi-year budget line and an independent board makes it harder to dismantle. Engaging the state assembly, the civil service unions, the medical and nursing associations and the HMOs early reduces the number of groups with a reason to oppose it.

Judge success by what the reform was for. Enrolment is the headline number, but it is a means. Three measures matter more.
- Effective coverage: the share of enrolees who actually received covered care when they needed it, from claims data and household follow-up.
- Financial protection: the share of total health spending paid out of pocket, and the share of households facing catastrophic health expenditure, measured through household surveys such as the Nigeria Living Standards Survey.
- Equity: whether coverage and use rose most among the poorest, which the targeting design was meant to achieve.

Provider-side indicators complete the picture: days from claim to payment, share of facilities paid within the agreed period, and the number of accredited facilities leaving the network.

A reform that enrols a million people while out-of-pocket spending stays flat has registered people, not protected them. The evaluation design should be agreed at the start, using the methods in the health economics track, so that the state can tell the difference and adjust.`,
          },
        ],
        exercises: [
          {
            title: "Price the equity programme",
            instruction: `A state of 6.2 million people has a health insurance agency covering 140,000 civil servants and dependants. The social register identifies 1.4 million people as poor. The actuarially costed premium for the basic package is N12,500 per person a year. Available for subsidised premiums next year: N1.5bn from the state equity fund and an expected N1.1bn through the BHCPF insurance gateway, conditional on the state paying its counterpart contribution.

Calculate how many people the state can cover. Propose who should be enrolled first and why (for example pregnant women, children under five, the elderly, people with disabilities, households in the poorest LGAs). Set out what the state must do to secure the BHCPF share, and what you would say to the governor, who wants to announce coverage of all 1.4 million people this year.`,
          },
          {
            title: "Fix an informal-sector scheme",
            instruction: `A state opened voluntary individual enrolment for informal workers two years ago at N1,250 a month. 38,000 people enrolled; 52% did not renew after the first year; enrolees are on average 11 years older than the state population; the claims ratio for this group is 145%. Market association leaders say traders find monthly payments hard in the rainy season.

Diagnose the problem and redesign the informal-sector product. Cover the enrolment unit, the channel, waiting periods, the payment schedule, subsidy for the near-poor, and the three indicators you would report to the agency board each quarter.`,
          },
        ],
      },
      resources: { tools: ["NHIA Act 2022", "National Health Act 2014", "BHCPF operational guidelines", "Microsoft Excel"] },
      questions: [
        q(
          "A governor argues that because the NHIA Act 2022 made health insurance mandatory, the state does not need to budget for premiums: residents are now legally obliged to enrol. What is the strongest response?",
          [
            "The governor is right, and the scheme should now focus on enforcing the mandate through fines and penalties on those who do not enrol",
            "The mandate applies only to federal civil servants",
            "Most residents work informally with no employer to deduct premiums, so covering the poor needs public subsidy",
            "The mandate was removed by later amendment, so the point is moot",
          ],
          "c",
          "A mandate creates a duty but no collection channel for informal workers, and fining poor households is neither practical nor fair. The Vulnerable Group Fund and state equity funding exist because the mandate alone cannot enrol those who cannot pay.",
        ),
        q(
          "Under the National Health Act 2014, how is the Basic Health Care Provision Fund financed at minimum?",
          [
            "From not less than 1% of the Consolidated Revenue Fund, plus donor and other contributions",
            "From a levy on HMO premiums and employer contributions, collected by NHIA and passed to the states",
            "From state counterpart funds, which every state pays into a federal account before it can draw on the fund",
            "From premiums paid by federal civil servants",
          ],
          "a",
          "The Act sets the floor at not less than 1% of the Consolidated Revenue Fund. State counterpart funds are a condition for drawing on it, not its source.",
        ),
        q(
          "A state has an equity fund of N3bn for subsidised premiums. The costed premium is N12,000 per person. It has identified 1.5 million poor and vulnerable residents. The commissioner proposes enrolling all 1.5 million at a premium of N2,000. What is the problem?",
          [
            "None, because enrolling more people at a lower premium is how schemes widen coverage and build the risk pool",
            "The premium would fund a sixth of the package's cost, so providers would be underpaid and ration care",
            "The state cannot legally enrol more than 250,000 people",
            "Premiums must be set by NHIA, not by the state",
          ],
          "b",
          "N3bn at N12,000 covers 250,000 people; spreading it across 1.5 million cuts the payment per person to a sixth of cost. The shortfall moves to providers, who ration care, so enrolment rises while effective coverage does not.",
        ),
        q(
          "A state has not met its BHCPF counterpart obligation for two years and has no functioning State Primary Health Care Board. What is the immediate consequence and the first advisory task?",
          [
            "The federal government will pay the counterpart on the state's behalf; the task is to draft a thank-you letter",
            "The state receives its full BHCPF share regardless of conditions; the task is to help it spend the money faster",
            "The fund is redistributed to LGAs directly; the task is to train LGA staff",
            "It is leaving federal money unclaimed; first audit eligibility and plan to meet the conditions",
          ],
          "d",
          "Access to the BHCPF is conditional on institutions and counterpart funds, so unmet conditions mean unclaimed money. An eligibility audit shows exactly what is blocking the flow.",
        ),
        q(
          "A state scheme opened voluntary individual enrolment for informal workers. After two years the claims ratio for this group is 140% and enrolees are older and sicker than the population. Which redesign addresses the cause most directly?",
          [
            "Raise the informal-sector premium by about 40%, so that premium income matches the claims this group generates",
            "Switch to household and group enrolment through associations, with waiting periods for non-emergency care",
            "Close the informal-sector product and cover only civil servants",
            "Reduce the benefit package to emergency care only",
          ],
          "b",
          "The pattern is adverse selection, and household and group enrolment bring in healthy members alongside the sick. Raising premiums drives out the healthiest remaining members and deepens the spiral.",
        ),
        q(
          "A state's benefit package was costed by an actuary at N18,000 per person a year. For political reasons, the governor wants the premium set at N9,000 with the package unchanged. What should the adviser recommend?",
          [
            "Accept the plan and ask providers to absorb the difference as a public service",
            "Accept the plan, since growing enrolment will spread fixed costs and close the gap between premium and cost",
            "Set out the trade-off: narrow or phase the package, raise the subsidy, or both, so premium matches package",
            "Set the premium at N9,000 and the tariffs at half of cost",
          ],
          "c",
          "A premium at half the cost of the package guarantees unpaid claims or rationing. Volume does not close a per-person deficit, and halving tariffs moves the deficit to providers.",
        ),
        q(
          "A state scheme announces 400,000 informal-sector enrolees after a year-long drive. At renewal, 55% leave. Exit interviews mention being told covered drugs were out of stock. What should the agency treat as its main problem?",
          [
            "Retention, driven by poor service at facilities, since members who leave were never effectively covered",
            "The enrolment drive was too small",
            "Members do not yet understand how insurance works, so the agency needs a larger awareness campaign before renewal",
            "The premium is too low to fund marketing",
          ],
          "a",
          "A 55% loss at renewal and complaints about covered drugs point to a failure of delivery, which no enrolment drive can fix. Awareness campaigns treat leavers as uninformed when they are responding to what happened at the facility.",
        ),
        q(
          "Three years after a state insurance reform, enrolment has tripled. The governor wants to declare success. Which evidence would best show whether the reform achieved its purpose?",
          [
            "The number of accredited facilities",
            "Household survey data on out-of-pocket spending and catastrophic expenditure, plus effective coverage",
            "The number of HMOs licensed in the state",
            "The value of premiums collected, since rising revenue shows that residents trust the scheme enough to pay",
          ],
          "b",
          "The purpose of insurance reform is financial protection and access to needed care, which household surveys and claims data measure. Enrolment, accreditation and premium totals are inputs and outputs, not outcomes.",
        ),
        q(
          "A small state scheme has 150,000 enrolees and two years of deficits caused by a few high-cost cases such as dialysis and cancer treatment. Which measures reduce this risk? Select all that apply.",
          [
            "Reinsurance or a stop-loss arrangement for high-cost cases",
            "Pooling catastrophic conditions in a larger, separately funded pool",
            "Combining the scheme's programmes within the state into one risk pool",
            "Excluding anyone with a chronic condition from enrolment",
            "Paying all providers fee-for-service to improve cost tracking",
          ],
          "abc",
          "Small pools are unstable, and reinsurance, a separate pool for catastrophic care and consolidation all spread the risk wider. Excluding the chronically ill defeats the purpose of insurance, and fee-for-service tends to raise costs.",
        ),
        q(
          "A new state agency with 14 staff must decide whether to manage claims and provider relations in-house or through HMOs acting as third-party administrators. Which is the most accurate statement of the trade-off?",
          [
            "HMOs are always cheaper because of their scale",
            "In-house management is always better because it removes the middleman",
            "The choice is irrelevant to the scheme's cost",
            "Using HMOs buys administrative capacity quickly at the cost of a margin and an extra party; in-house is cheaper in the long run only if the agency can build and keep the capacity",
          ],
          "d",
          "The decision turns on the agency's capacity and the price of buying it in. Neither option is better by default; many states mix the two by population group.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "donor-programmes-delivery",
      name: "Donor Programmes and Government Delivery Units",
      description:
        "How donor-funded health programmes work in Nigeria, how government delivery units drive priorities, and how to design programmes that government can absorb when external money ends.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "The donor landscape in Nigerian health",
            body: `External funding in Nigerian health comes through a small number of large channels, each with its own governance, rules and incentives. An adviser who does not know which channel a programme sits in will misread what the programme can and cannot change.

The Global Fund finances HIV, TB and malaria through grants governed in-country by a Country Coordinating Mechanism, a multi-stakeholder body that proposes grants and oversees them. Grants are implemented by principal recipients, which may be government bodies or NGOs, and sub-recipients beneath them. The Fund disburses against performance and requires co-financing commitments from government.

Gavi supports vaccines and immunisation systems, working with NPHCDA. Its model requires the country to co-finance a growing share of vaccine costs as national income rises, and eventually to transition to full self-financing. A state that relies on Gavi-supported supply without planning for rising co-financing is building a future budget gap.

The World Bank lends rather than grants. Its health operations in Nigeria include results-based programmes in which money is released when agreed results are verified. Loans add to public debt, so the programme design should be judged as an investment the state will repay.

Bilateral donors, such as the UK's FCDO and, historically, the United States through USAID and PEPFAR, have funded large programmes through implementing partners, usually international NGOs and contractors. The abrupt US funding cuts of 2025 halted or shrank many such programmes almost overnight, and showed how much of the HIV response, supply chains, data systems and staff positions had depended on a single external source. Foundations, such as the Gates Foundation, fund both programmes and technical assistance, often embedded in ministries and agencies.

Two distinctions shape every engagement. On-budget money passes through government systems and appears in the budget; off-budget money is spent directly by partners. Off-budget funding is easier for donors to control but harder for government to plan around, because the ministry often does not know what is being spent in its own sector. The second distinction is between vertical programmes, focused on a disease or service, and system support. Vertical programmes deliver measurable results quickly but can build parallel supply chains, data systems and staffing that weaken the general system.

Nigeria's federal ministry and its partners signed a sector-wide approach compact in late 2023, committing to align funding behind one national plan, budget and reporting framework. The commitment is the right direction; the test is whether funding and reporting actually move.`,
          },
          {
            title: "How results-based and donor programmes actually work",
            body: `Donor programmes run on results frameworks, fiduciary rules and conditions. Understanding the mechanics lets an adviser help government meet them without distorting its own priorities.

Results-based financing links disbursement to verified results. In a World Bank programme-for-results operation, money is released against disbursement-linked indicators (DLIs). A DLI might be the number of PHCs meeting a readiness standard, or the publication of a state's health budget performance report. An independent verification agent confirms each result before money flows. If a state misses a DLI, that tranche is not released, or is released in proportion to partial achievement where the agreement allows it. The design consequence is that DLIs must be within the state's control, measurable through a verification process the state trusts, and spread across the programme period so that cash flows are not concentrated at the end.

Fiduciary rules govern how money is spent: procurement under the donor's rules or the national procurement law, financial management standards, and audit. Programmes stall more often on procurement than on any technical question. A state that has never run a procurement under donor rules will take months to complete its first one. Plan for this.

Counterpart and co-financing commitments are part of almost every programme. The state promises to fund staff, running costs or a rising share of commodities. These commitments are often made by one administration and fall due under the next. Track them as liabilities in the state's medium-term plan, not as footnotes in the grant agreement.

Implementing partners carry out much of the work on bilateral programmes. They bring capacity and speed, but they also tend to hire the best ministry staff on better terms, run their own data systems, and pay allowances to government staff for attending trainings and meetings. These practices raise output during the programme and leave gaps afterwards.

An adviser's job inside this machinery is to keep the government's own priorities in front. That means mapping every programme in the state against the state's operational plan, identifying overlaps and gaps, reconciling the reporting requirements into as few streams as possible, and making sure that commitments made to donors appear in the budget. A ministry that can show partners a single, costed plan, with what is funded and by whom, negotiates from strength. One that cannot ends up with its priorities set by whichever partner has money that year.`,
          },
          {
            title: "Government delivery units",
            body: `A delivery unit is a small team close to the head of government or a minister, set up to make sure a few priorities are delivered. It does not run programmes. It tracks progress, solves problems and keeps the principal's attention on what was promised.

The model is usually traced to the UK Prime Minister's Delivery Unit set up in 2001, and was adapted in Malaysia, several African governments and Nigerian federal and state administrations. Nigeria's recent federal approach of ministerial mandates with a central coordination unit tracking them is one version.

The method has a few core parts.
- A short list of priorities, each with a measurable target and a date. Three to five per sector is workable; twenty-seven is not.
- A trajectory for each target: the expected path month by month, so that progress can be judged against where the programme should be now, not only against the final target.
- A delivery chain for each priority: the sequence of people and organisations through which a decision becomes a result. For childhood immunisation that runs from the commissioner through the State Primary Health Care Board, LGA health authorities, PHC officers in charge, vaccinators and cold chain officers, to the caregiver.
- A routine: regular stocktakes, chaired by the principal, where the data are reviewed and problems are assigned to named people with dates.
- Data that arrive in time for the routine and that the principal trusts.

Delivery units fail in recognisable ways. They take on too many priorities and become a reporting office. They lose access to the principal, so their stocktakes carry no authority. They are seen by line ministries as inspectors rather than helpers, and information dries up. They build a parallel structure that bypasses the civil service, which resents it and outlasts it. They are tied to one principal and disappear when that person leaves.

The ones that work keep their list short, protect the principal's time for stocktakes, staff the unit with a mix of strong civil servants and outside analysts, report problems early rather than celebrating good news, and hand routines over to the line ministry so that the discipline survives the unit.

In health, a delivery unit is most useful where results depend on several agencies working together: immunisation coverage, maternal deaths, drug availability at PHCs, enrolment in the state scheme. It adds least where one agency already controls the result.`,
          },
          {
            title: "Designing for transition when donor money ends",
            body: `Every donor programme ends. The question is whether the results survive. Transition planning should start at design, because most of the decisions that determine sustainability are made then.

Start with a funding map. For each programme in the state, list what it pays for under four heads: commodities, staff, running costs and systems. Commodities include drugs, test kits, vaccines and nets. Staff include positions paid entirely by the partner, top-up allowances to government staff, and contracted community workers. Running costs include fuel, transport, data bundles and meeting costs. Systems include software, data platforms and supply chain contracts. Then record who pays for each item now and who will pay after the programme.

The 2025 US funding cuts showed what happens without such a map. States found that HIV testing kits, the logistics contracts that moved them, the data clerks who entered results and the community workers who traced patients lost to follow-up were all funded from one source that disappeared within weeks. The first priority in that situation is continuity of treatment for people already on it, so a state should know in advance which commodities and which positions are essential to keep patients on therapy and what they cost.

Absorption is the core design question. A programme that pays community health workers N60,000 a month in a state where the government equivalent earns N35,000 has built a cadre the state cannot absorb on its own scale. Set rates and staffing models that the state could take over, and agree a schedule in which the state's share rises year by year. Gavi's co-financing model is an example of a gradual transfer with a defined path.

Systems should be national from the start. A programme data platform separate from DHIS2, or a supply chain separate from the state's logistics management system, leaves nothing the state can run. Building on national systems is slower at first and pays back at transition.

Costed transition plans belong in the budget. A plan that says the state will take over N450m of costs in year four is meaningful only if that sum appears in the medium-term expenditure framework and the commissioner has defended it to the finance ministry.

Finally, plan for the political calendar. A transition that falls in an election year is at high risk. Lock commitments into law, budget lines and signed compacts before the cycle turns, and brief the opposition as well as the government, since either may be in office when the bill arrives.`,
          },
        ],
        exercises: [
          {
            title: "Map a state's donor exposure",
            instruction: `A state's health sector receives, in the current year: a Global Fund malaria grant through an NGO principal recipient (N2.4bn, of which 70% commodities, 15% staff and allowances, 15% running costs); Gavi-supported vaccines valued at N1.1bn, with state co-financing currently 8% and scheduled to rise; a World Bank results-based programme with N1.8bn available against four DLIs; and a bilateral programme that funded 420 HIV data clerks and community tracers until it ended suddenly last quarter. The state's own health capital and overhead budget is N9bn, of which 60% was released last year.

Build a one-page funding map by programme and cost head. Identify the three largest risks to service continuity over 24 months, the immediate actions for the HIV gap, and what the commissioner should ask the finance ministry to put in next year's budget.`,
          },
          {
            title: "Set up a health delivery routine",
            instruction: `A new governor has announced 14 health priorities. Penta3 coverage is 51% against a target of 75% in 24 months; maternal deaths reported in general hospitals were 186 last year; only 38% of PHCs have the tracer drugs in stock on a given day. A delivery unit of five people has been created in the governor's office.

Choose no more than four priorities and justify the choice. For one of them, draw the delivery chain, set a monthly trajectory to the target, name the data source, and design the stocktake: who attends, how often, what they see and how problems are assigned. Say how you would avoid the common failure modes.`,
          },
        ],
      },
      resources: { tools: ["Funding map template", "Delivery trajectory template", "DHIS2"] },
      questions: [
        q(
          "A state's Global Fund malaria grant is implemented by an NGO as principal recipient. The commissioner wants the grant to fund a different set of LGAs from next year. Through which body should the proposal go?",
          [
            "Directly to the principal recipient, since it implements the grant and decides where the money is spent",
            "The Country Coordinating Mechanism, which proposes and oversees Global Fund grants in-country",
            "The World Bank country office",
            "The state House of Assembly",
          ],
          "b",
          "Changes to Global Fund grant priorities go through the CCM, which governs grants in-country. The principal recipient implements under the approved grant and cannot reallocate it unilaterally.",
        ),
        q(
          "A World Bank results-based programme has a DLI requiring 300 PHCs to meet a readiness standard by year two, verified by an independent agent. At the deadline, verification confirms 210. The agreement allows proportional disbursement. What follows, and what is the design lesson?",
          [
            "The full tranche is released because substantial progress was shown; DLIs are targets to aim at, not strict conditions",
            "The programme is cancelled; DLIs should be set lower",
            "The state can self-certify the remaining 90 PHCs to unlock the full tranche",
            "70% of the tranche is released; DLIs should be within the state's control and spread over time",
          ],
          "d",
          "Under proportional disbursement, 210 of 300 releases 70%. The lesson is to design DLIs the state can actually drive and to spread them over time; self-certification would defeat independent verification.",
        ),
        q(
          "A state relies on Gavi-supported vaccines and currently co-finances a small share of their cost. Its health budget planning assumes the same share for the next five years. What is the risk?",
          [
            "Gavi will stop supplying vaccines to Nigeria altogether next year, leaving the state to buy everything at once",
            "There is no risk, since vaccines are always supplied free",
            "Co-financing obligations rise over time as part of transition, so the budget will fall short of what is owed",
            "The state will have more vaccines than it can store",
          ],
          "c",
          "Gavi's model requires co-financing to rise toward full self-financing. Planning on a flat share builds a growing budget gap that can interrupt supply.",
        ),
        q(
          "A new governor's health delivery unit has been asked to track 27 priorities, with monthly reports to the governor on each. After four months the reports are long and nothing changes. What is the most important fix?",
          [
            "Hire more analysts so the unit can track all 27 priorities properly and produce sharper monthly reports",
            "Cut the list to a few priorities with trajectories, and use stocktakes to solve problems on them",
            "Move the unit into the ministry of health",
            "Report quarterly instead of monthly to reduce the burden",
          ],
          "b",
          "A delivery unit works by focus, and 27 priorities turn it into a reporting office. More staff only produce more reports; fewer priorities with active problem-solving is what changes results.",
        ),
        q(
          "A delivery unit's stocktakes on maternal deaths are chaired by a junior adviser because the commissioner has stopped attending. Agencies have begun sending junior staff without data. What is the core failure?",
          [
            "The stocktakes have lost the principal's authority, so they no longer compel action from the agencies",
            "The unit has too few priorities",
            "The maternal death data are inaccurate",
            "The agencies are hostile to reform and are deliberately undermining the delivery unit by sending junior staff",
          ],
          "a",
          "Stocktakes work because the principal's attention makes agencies prepare and act; without it they become optional. The agencies' behaviour is a response to that loss, not its cause.",
        ),
        q(
          "A ministry discovers that partners spent roughly as much in its sector last year as its own budget, but it has no record of what was spent where. What should the adviser recommend first?",
          [
            "Ask partners to stop all off-budget spending immediately and route every naira through the state treasury",
            "Commission a full audit of every partner's accounts before any further partner money is accepted",
            "Map all partner programmes against the state's operational plan so overlaps and gaps are visible",
            "Reduce the state's own budget to avoid duplication",
          ],
          "c",
          "The ministry cannot plan or negotiate until it knows what is being funded and where. Demanding that all money move on-budget at once is unlikely to succeed and skips the analysis that makes alignment possible.",
        ),
        q(
          "A donor programme pays community health workers N60,000 a month in a state where the government equivalent earns N35,000. The programme ends in 18 months, and the state has said it will absorb the workers. What should the adviser flag?",
          [
            "Nothing, since the state has already committed in writing to absorb all the workers on their current terms when the programme closes",
            "The donor should raise pay further to retain the workers",
            "The workers should be dismissed now to avoid a later shock",
            "The state cannot absorb a cadre paid above its own scale; agree a rate and phased takeover now, in the budget",
          ],
          "d",
          "Absorption at a higher rate than the government scale is unaffordable and creates conflict with existing staff. A transition plan agreed early, with the cost in the medium-term budget, is what makes the commitment real.",
        ),
        q(
          "A delivery unit targets Penta3 coverage rising from 51% to 75% over 24 months on a straight-line trajectory. At month 6, coverage is 55%. What does the trajectory say?",
          [
            "The programme is on track, because coverage has risen by 4 points in six months and is moving toward the target",
            "About 2 points behind: the trajectory expected 57% at month 6, so the stocktake should find out why",
            "The programme has failed and the target should be lowered",
            "No judgement is possible until month 24",
          ],
          "b",
          "A straight line from 51% to 75% over 24 months adds 1 point a month, so month 6 should be at 57%. A trajectory lets the unit spot a gap early instead of waiting for the final date.",
        ),
        q(
          "A state wants a donor-funded immunisation programme to survive the end of external funding. Which design choices make that more likely? Select all that apply.",
          [
            "Running programme data through DHIS2 rather than a separate platform",
            "Paying government staff attendance allowances for every training to boost participation",
            "Agreeing a rising state co-financing share with a defined schedule",
            "Putting the state's future share in the medium-term expenditure framework",
            "Hiring the strongest ministry staff into the implementing partner on better terms",
          ],
          "acd",
          "National systems, a defined co-financing path and budgeted commitments all leave something the state can run. Allowances and poaching ministry staff raise output during the programme but weaken the system it leaves behind.",
        ),
        q(
          "A bilateral HIV programme ends abruptly. It funded test kits, the logistics contract, data clerks and community tracers. The commissioner asks what to protect first with limited emergency funds. What should the adviser say?",
          [
            "Continuity of treatment for people already on antiretrovirals, and the supply needed to sustain it",
            "The data clerks, because without reporting the state cannot show partners the gap or attract replacement funding",
            "New testing campaigns, to show the state is still active",
            "The community tracers, because they are the most visible staff",
          ],
          "a",
          "Interrupting treatment for people already on therapy causes the greatest and most immediate harm. Data reporting matters but can be restored later; patients who stop treatment may not be.",
        ),
      ],
    },
  ],
};

export default expansion;
