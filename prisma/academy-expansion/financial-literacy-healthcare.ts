import type { TrackExpansion, Question, Option } from "./types";

const p = (...paras: string[]) => paras.join("\n\n");
const IDS = ["a", "b", "c", "d", "e"] as const;

function mc(question: string, options: string[], correct: number, explanation: string): Question {
  return {
    type: "MULTIPLE_CHOICE",
    question,
    options: options.map((text, i): Option => ({ id: IDS[i], text, isCorrect: i === correct })),
    explanation,
  };
}

function ms(question: string, options: string[], correct: number[], explanation: string): Question {
  return {
    type: "MULTI_SELECT",
    question,
    options: options.map((text, i): Option => ({ id: IDS[i], text, isCorrect: correct.includes(i) })),
    explanation,
  };
}

const expansion: TrackExpansion = {
  slug: "financial-literacy-healthcare",

  topUp: [
    {
      moduleSlug: "hospital-pl-structure",
      questions: [
        mc(
          "A 60-bed hospital in Surulere reports annual revenue of N1.44bn. What is its revenue per bed per month?",
          ["N2m", "N2.4m", "N24m", "N1.2m"],
          0,
          "N1.44bn divided by 12 months is N120m a month, and N120m across 60 beds is N2m per bed per month. N24m is the annual figure per bed, a common slip when the months are forgotten.",
        ),
        mc(
          "A hospital pharmacy booked N40m of revenue last quarter and the drugs it dispensed cost N32m. What does this drug cost ratio suggest?",
          [
            "The pharmacy is well run, because the ratio shows it is busy",
            "Nothing, because drug cost ratios only matter for public hospitals",
            "The pharmacy is overstocked, because purchases exceed sales",
            "At 80% it sits well above the 55-65% range, so prices, discounts or unbilled dispensing need checking",
          ],
          3,
          "N32m over N40m is 80%, far above the 55-65% expected of a well-managed pharmacy, which points to under-pricing or leakage. A high ratio is about cost against revenue, not stock levels, so overstocking is a different question.",
        ),
        mc(
          "Marula Hospital earns N100m a month at a 10% operating margin. Of its N90m costs, N60m are fixed and the rest vary in line with revenue. If revenue falls 10%, what happens to operating profit?",
          [
            "It falls to about N3m",
            "It falls 10%, to N9m",
            "It stays at N10m, because costs fall with revenue",
            "It falls to about N7m",
          ],
          0,
          "Variable costs are 30% of revenue, so at N90m revenue they are N27m; add N60m fixed and costs are N87m, leaving N3m. Assuming profit falls in proportion to revenue ignores the fixed cost base, which is exactly what operational leverage means.",
        ),
        mc(
          "A Lagos private hospital earns 60% of revenue from HMO claims and 35% from out-of-pocket patients. Early in a financial diagnostic, what should the consultant map first about this mix?",
          [
            "Which HMO brand has the strongest marketing",
            "The split of revenue by ward",
            "The number of HMOs the hospital has signed with and how long each contract has left to run before renewal",
            "How quickly and how fully each source actually turns into cash, given claim cycles and rejections",
          ],
          3,
          "The revenue mix matters because each source collects differently: HMO revenue can take 60-120 days and suffer rejections, while out-of-pocket is collected at the point of service. A count of HMO contracts says nothing about how the money arrives.",
        ),
        mc(
          "A hospital's staff costs are 52% of revenue and its drug cost ratio is 60%, both within the expected ranges, but its operating margin is 4%. Which reading is right?",
          [
            "It is healthy, because both cost ratios are in range",
            "It is overstaffed, because staff costs are above half of revenue",
            "It is thin: below 5% operating margin the hospital is one bad quarter away from a cash crisis, so look at overheads and revenue per bed",
            "It needs no action until margin turns negative",
          ],
          2,
          "Ratios in range do not make a 4% margin safe; below 5% one bad quarter can push the hospital into a cash crisis, so the remaining overheads and throughput need examining. Staff costs only signal overstaffing above about 60% of revenue.",
        ),
      ],
    },
    {
      moduleSlug: "budgeting-financial-planning",
      questions: [
        mc(
          "An 80-bed hospital is building next year's inpatient budget at a 75% occupancy assumption. How many bed-days should it budget for?",
          ["21,900", "29,200", "18,250", "24,000"],
          0,
          "80 beds times 365 days is 29,200 available bed-days, and 75% of that is 21,900. Budgeting all 29,200 is the top-down mistake the module warns against: no hospital runs full all year.",
        ),
        mc(
          "Pharmacy costs came in 20% over budget. Patient numbers were also 20% above budget, and supplier prices and prescribing patterns did not change. How should the variance be reported?",
          [
            "As an overspend the pharmacy manager must cut back",
            "As a price variance, because the bill went up",
            "As an efficiency variance, because more drugs were used",
            "As a volume variance: more patients needed more drugs, and cost per patient held steady",
          ],
          3,
          "Cost rose in line with activity while price and usage per patient were flat, so this is volume. Calling it an efficiency variance confuses more drugs in total with more drugs per patient.",
        ),
        mc(
          "Diesel spend was N6m over budget last month. Generator running hours were exactly as budgeted. What kind of variance is this mainly?",
          ["Price", "Volume", "Efficiency", "Favourable"],
          0,
          "Hours were on budget, so the same quantity of fuel cost more per litre: a price variance. An efficiency variance would show up as more litres per running hour, which is not the case here.",
        ),
        mc(
          "At the monthly budget review, which department must explain its variance under the 10% materiality rule?",
          [
            "Laboratory: budget N20m, actual N21.5m",
            "Outpatients: budget N35m, actual N32.5m",
            "Theatre: budget N50m, actual N54m",
            "Radiology: budget N15m, actual N17.1m",
          ],
          3,
          "Radiology is 14% over budget (N2.1m on N15m). The others are 7.5%, 7.1% and 8%. Theatre has the largest naira gap, which tempts people to pick it, but the rule is set on the percentage.",
        ),
        mc(
          "The head of surgery skips budget reviews, saying budgets are for accountants. Theatre is running at 55% utilisation. What is the most effective response?",
          [
            "Escalate his absence to the medical director as a disciplinary matter and record it formally in the minutes of each review",
            "Send him the full monthly management accounts so he has all the detail",
            "Show him what the idle theatre time costs in lost revenue each month and tie it to a theatre KPI he owns",
            "Remove theatre from the budget review to keep the meeting short",
          ],
          2,
          "Turning underutilisation into lost revenue that a clinical leader can see and own makes the budget an operational conversation. Sending the full accounts repeats the problem, because it keeps the budget as an accounting document.",
        ),
      ],
    },
  ],

  modules: [
    // ------------------------------------------------------------------
    {
      slug: "cash-working-capital",
      name: "Cash Flow and Working Capital in a Hospital",
      description:
        "Why a profitable hospital can run out of money, how to measure the cash tied up in receivables, stock and payables, and how to forecast and release cash week by week.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Profit is not cash",
            body: p(
              `A hospital can report a profit every month and still fail to pay salaries. The income statement records revenue when the service is delivered and costs when they are incurred. The bank account records money when it actually moves. In Nigerian private hospitals the gap between the two is often months wide, because a large share of revenue is billed to HMOs, corporates and NHIA programmes that pay well after the patient has gone home.`,
              `Take Kestrel Specialist Hospital in Ikeja. In March it billed N100m, spent N90m, and reported a N10m operating profit. But only N55m of March's billing was collected in March: self-pay patients paid on the day, while HMO and corporate bills joined the queue of receivables. Salaries, diesel, drugs and rent went out on time. The bank balance fell by N20m in the same month the accounts showed a profit.`,
              `Three things move cash without moving profit, and you will see all of them in hospital work:`,
              `- Changes in receivables: money billed but not yet received.\n- Changes in stock: drugs, consumables and reagents bought but not yet used.\n- Changes in payables: supplies received but not yet paid for.`,
              `Capital spending is a fourth. A new ultrasound machine bought for cash drains the bank immediately, while the income statement only carries a slice of it each year as depreciation. Loan repayments also leave the bank without touching operating profit.`,
              `When a hospital owner says "we are profitable but always broke", the answer is almost always in these lines. Your job is to find which one is absorbing the cash, by how much, and whether it is a timing problem that will reverse or a structural one that will keep growing as the hospital grows.`,
            ),
          },
          {
            title: "Measuring the working capital cycle",
            body: p(
              `Working capital is the money a hospital has tied up in running its day-to-day business. It is measured in days, so that hospitals of different sizes can be compared and trends can be tracked.`,
              `- Days sales outstanding (DSO) = receivables / annual revenue x 365. How long, on average, it takes to collect what you bill.\n- Days inventory outstanding (DIO) = stock at cost / annual cost of drugs and consumables x 365. How long stock sits before it is used.\n- Days payables outstanding (DPO) = trade payables / annual cost of drugs and consumables x 365. How long you take to pay suppliers.`,
              `The cash conversion cycle is DSO plus DIO minus DPO. It is the number of days between paying for an input and collecting the cash for the service that used it. Every day in that cycle has to be funded by someone: the owner, the bank overdraft, or unpaid suppliers.`,
              `Kestrel has annual revenue of N1.2bn and receivables of N250m, so its DSO is about 76 days. It holds N45m of stock against N360m of annual drug and consumable spend, a DIO of about 46 days. It owes suppliers N30m, a DPO of about 30 days. Its cash conversion cycle is therefore about 92 days. In plain terms, Kestrel funds three months of its own activity before the money comes back.`,
              `Two features of hospitals make the cycle longer than in most service businesses. Insured revenue is usually the largest stream, and insurers set the payment timetable. Hospitals also hold a wide range of stock, because a pharmacy, a laboratory and a theatre each need dozens of lines that cannot run out. On the other side, suppliers of drugs in Nigeria often give short credit or demand cash on delivery, especially to smaller hospitals, which keeps DPO short.`,
              `The numbers matter most as a trend. A DSO that has crept from 55 to 76 days over a year, while revenue grew, tells you growth is being funded by the hospital's own cash, and that the problem will get worse the more the hospital succeeds.`,
            ),
          },
          {
            title: "Where hospital cash gets stuck",
            body: p(
              `Cash gets trapped in a small number of predictable places. Look at each one before recommending anything.`,
              `Receivables are usually the biggest. HMO and NHIA programme claims take weeks or months to pay, some are queried or reduced, and corporate clients on monthly billing pay when their own finance team gets round to it. Self-pay patients who were discharged without settling their bill are another receivable, and the least likely to be collected. Unbilled work is worse than a receivable: if a discharged patient's bill has not been finalised, the clock has not even started.`,
              `Stock is the second. Pharmacies buy in bulk for discounts, keep slow-moving lines nobody has reviewed, and carry items close to expiry. A N45m stock holding where N8m is slow-moving or near-expiry is N8m of cash sitting on shelves. Laboratory reagents have short shelf lives and are easy to overbuy.`,
              `Deposits not taken are the third. When a self-pay patient is admitted without a deposit that reflects the likely bill, the hospital is lending to the patient. Deposits received in advance work the other way: they are cash in the bank before the service is delivered, recorded as a liability until the work is done.`,
              `Spending is the fourth. Capital purchases paid from operating cash, such as a new generator or a CT scanner bought from the overdraft, take long-term value out of short-term money. Diesel is a large and lumpy cost in a hospital that runs on generators, and prices move. Payroll falls on one date each month regardless of when insurers pay.`,
              `Payables are the one place where cash can be legitimately held for longer. Agreeing 30 or 45 day terms with a reliable supplier, and then paying on the due date rather than early, is good practice. Stretching suppliers beyond agreed terms is not: it damages supply when the hospital can least afford it, and drug suppliers will quietly move you to cash on delivery.`,
              `The useful output from this review is a short list of named amounts: N60m of HMO claims over 90 days, N12m of discharged but unbilled patients, N8m of slow-moving stock, N80m of scanner paid from the overdraft. Each has a different owner and a different fix.`,
            ),
          },
          {
            title: "The 13-week cash forecast and the levers that release cash",
            body: p(
              `The basic tool for managing hospital cash is a 13-week cash forecast. It lists expected receipts and payments week by week for the next quarter, starting from the actual bank balance today. It is built on the direct method: cash in and cash out, not revenue and costs. Each week it is rolled forward, last week's actuals replace the forecast, and the differences are explained.`,
              `Receipts are forecast by source. Self-pay collections follow patient volumes closely. HMO and corporate receipts follow the remittance pattern of each payor, which you learn from the bank statements of the last six months, not from the payment terms in the contract. Payments are forecast by date: payroll on the 25th, rent on the quarter day, a diesel delivery every ten days, loan instalments on their schedule, supplier payments on agreed terms.`,
              `A monthly forecast hides the problem. Kestrel's monthly totals may balance, but if two large HMO remittances arrive in the last week and payroll falls in the fourth week, the overdraft limit is breached for six days. The weekly view shows the trough and gives management time to act.`,
              `Once you can see the gap, the levers to release cash are mostly operational:`,
              `- Bill faster: finalise discharge bills within a day and submit claims weekly, not at month end.\n- Collect at the point of service: deposits on self-pay admissions, co-payments at registration.\n- Chase receivables by age and by payor, starting with the largest and oldest.\n- Reduce stock: set reorder levels, clear slow movers, stop bulk buys whose discount does not cover the cost of holding the stock.\n- Use agreed supplier terms fully, and negotiate longer terms with the largest suppliers.\n- Fund long-term assets with long-term money: lease or term loan for equipment, not the overdraft.`,
              `A bulk-buy discount is worth taking only when it beats the cost of the cash it ties up. If the hospital's overdraft costs around 30% a year, an 8% discount for buying six months of stock at once may still pay, but only if the items will not expire and the hospital can fund the purchase without squeezing payroll.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Kestrel's cash conversion cycle",
            instruction:
              "Kestrel Specialist Hospital has annual revenue of N1.2bn, receivables of N250m (of which N70m is more than 90 days old), stock at cost of N45m (N8m slow-moving), annual drug and consumable spend of N360m, and trade payables of N30m. Calculate DSO, DIO, DPO and the cash conversion cycle. Then estimate how much cash would be released if DSO fell to 60 days and stock fell by the slow-moving N8m, and list who in the hospital would own each action.",
          },
          {
            title: "Build a 13-week forecast",
            instruction:
              "Kestrel starts the quarter with N18m in the bank and a N40m overdraft limit. Self-pay receipts average N11m a week. HMO receipts arrive irregularly: N60m in week 2, N25m in week 6, N70m in week 10. Corporate receipts are N15m in weeks 4, 8 and 12. Payroll of N38m falls in weeks 4, 8 and 13. Diesel is N4m every week, supplier payments N12m a week, and rent of N30m is due in week 9. Build the week-by-week forecast, identify the weeks where the overdraft is used or breached, and propose two actions that would close the worst gap.",
          },
        ],
      },
      resources: { tools: ["13-week cash forecast template", "Working capital days calculator"] },
      questions: [
        mc(
          "Kestrel reported a N10m operating profit for March, yet its bank balance fell by N20m. No equipment was bought and no loans were repaid. What is the most likely explanation?",
          [
            "The accounts must contain an error, because a profitable month should always add to the bank balance",
            "HMO and corporate receivables grew, so much of March's billing has not yet been collected",
            "Depreciation was higher than expected",
            "The hospital paid too much tax in March",
          ],
          1,
          "With no capital spending or loan repayments, the usual cause is that revenue was booked but not collected, so receivables rose. Depreciation reduces profit without touching cash, so it cannot explain cash falling faster than profit.",
        ),
        mc(
          "A hospital has annual revenue of N900m and receivables of N150m. What is its DSO, to the nearest day?",
          ["61 days", "45 days", "73 days", "167 days"],
          0,
          "N150m divided by N900m, times 365, is about 61 days. 167 days comes from inverting the ratio, a common slip.",
        ),
        mc(
          "A hospital has a DSO of 70 days, a DIO of 40 days and a DPO of 35 days. What is its cash conversion cycle?",
          ["145 days", "105 days", "65 days", "75 days"],
          3,
          "The cycle is DSO plus DIO minus DPO: 70 + 40 - 35 = 75 days. Adding all three, 145 days, treats supplier credit as a use of cash when it is a source.",
        ),
        mc(
          "Over a year a hospital's revenue grew 30% and its DSO rose from 55 to 76 days. What does this most likely mean for the owner?",
          [
            "Growth is self-funding, because revenue is up",
            "Nothing, because DSO is a ratio and adjusts for growth",
            "Growth is consuming the hospital's own cash, and the strain will rise as it grows",
            "The hospital should offer HMOs a discount for early payment, which will solve the problem on its own",
          ],
          2,
          "A rising DSO on rising revenue means a larger share of a larger number is stuck in receivables, so cash demand grows faster than the business. DSO does adjust for size, but here it has risen, which is the point.",
        ),
        ms(
          "Which of these increase the cash a hospital has tied up in working capital? Select all that apply.",
          [
            "Agreeing 90-day payment terms with a new corporate client instead of 30",
            "Buying six months of a common antibiotic at once to secure a discount",
            "Paying drug suppliers ten days before their invoices fall due",
            "Taking a deposit from self-pay patients on admission",
          ],
          [0, 1, 2],
          "Longer client terms raise receivables, bulk buying raises stock, and paying early shortens payables: all three tie up more cash. A deposit brings cash in before the service, so it reduces working capital rather than increasing it.",
        ),
        mc(
          "Why is a 13-week cash forecast built week by week rather than month by month?",
          [
            "Banks require weekly figures for overdraft renewals",
            "Weekly figures are easier to reconcile to the income statement, which is what the board reviews each month",
            "Monthly forecasts cannot include HMO receipts",
            "Payments and receipts fall on set dates, and a month can balance while one week breaches the overdraft",
          ],
          3,
          "The aim is to see the low point before it happens; a month can balance overall while a single week goes over the limit. The forecast is a cash tool, so matching it to the income statement is not its purpose.",
        ),
        mc(
          "A supplier offers an 8% discount if the pharmacy buys six months of a fast-moving drug in one order. What should decide whether to accept?",
          [
            "Whether the discount is above 5%, the usual threshold",
            "Whether the discount beats the cost of funding the extra stock, allowing for expiry and other payments due",
            "Whether the supplier is the hospital's largest",
            "Whether the pharmacy manager has the storage space and staff to receive and shelve a six-month delivery safely",
          ],
          1,
          "A discount is only worth taking if it beats the financing cost of the cash tied up, and the stock must be used before it expires without starving other payments. Storage matters, but it is one constraint, not the decision rule.",
        ),
        mc(
          "Marula Hospital admits self-pay surgical patients and collects the full bill on discharge. About one patient in ten leaves owing money. Which change releases the most cash with the least harm to patients?",
          [
            "Refuse admission to self-pay patients",
            "Add a monthly late payment charge to unpaid discharge bills and send reminders by text message and email",
            "Give a written estimate before admission and take a deposit, topped up during long stays",
            "Hold patients on the ward until the bill is paid",
          ],
          2,
          "A deposit against a written estimate brings cash in early and cuts bad debt, while the patient knows the cost in advance. Holding patients over unpaid bills breaches their rights and is unsafe, and late charges are rarely collected from patients who have already left.",
        ),
        mc(
          "A hospital bought an N80m CT scanner using its overdraft. Six weeks later it struggles to meet payroll. What was the underlying mistake?",
          [
            "Funding a long-term asset with short-term money",
            "Buying a CT scanner before having a radiologist",
            "Depreciating the scanner too quickly",
            "Not negotiating a discount on the scanner",
          ],
          0,
          "An asset that pays back over years should be funded by a lease or term loan, not the overdraft that carries day-to-day running costs. Depreciation is an accounting entry and has no effect on the cash squeeze.",
        ),
        mc(
          "Kestrel's last six months of bank statements show one large HMO consistently paying 75 days after claim submission, although its contract says 30 days. What should the 13-week forecast assume?",
          [
            "30 days, because that is the term the HMO signed and the hospital is entitled to rely on it",
            "That the HMO will not pay at all within the quarter",
            "45 days, splitting the difference",
            "75 days, the pattern actually seen in the bank, while the overdue amounts are chased",
          ],
          3,
          "A cash forecast is built on how payors actually pay, which the bank statements show. Using the contract term makes the forecast optimistic and hides the trough it is supposed to reveal.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "revenue-cycle-intro",
      name: "From Patient to Payment: Revenue Cycle Basics",
      description:
        "The path every naira takes from the moment a patient books to the moment cash is posted, who owns each step, and where hospitals usually lose money along the way.",
      estimatedMinutes: 50,
      content: {
        sections: [
          {
            title: "What the revenue cycle is",
            body: p(
              `The revenue cycle is every step between a patient arriving and the hospital's cash being posted against that patient's bill. It is not a department. Pieces of it are done by front desk staff, nurses, doctors, pharmacists, laboratory scientists, billers and the accounts team, and no single person sees all of it. That is why so much money falls through the gaps.`,
              `The main stages, in order:`,
              `- Booking and registration: the patient's identity, contact details and who will pay.\n- Eligibility and authorisation: for insured patients, confirming the policy is active, what it covers and whether the planned service needs an authorisation code.\n- Service and documentation: the clinical work, recorded in the patient's notes.\n- Charge capture: turning each service, drug and consumable into a line on the bill.\n- Coding: describing diagnoses and procedures in the codes payors expect.\n- Billing: producing the final bill or claim for the right payor at the right tariff.\n- Payment and posting: receiving the money and recording it against the right bill.`,
              `A hospital earns revenue in the clinical stages, but it only gets paid if every administrative stage is done correctly. A perfect operation is worth nothing if the drugs used in theatre never reach the bill. A full bill is worth little if it goes to an HMO without the authorisation code the HMO requires.`,
              `The cycle also has a time dimension. Each stage has a lag, and the lags add up. If notes are completed two days after discharge, the bill is finalised three days later, and claims are batched at month end, a service delivered on the 2nd of the month may not be claimed until the 31st. Every one of those days is cash the hospital has earned but is still funding itself.`,
            ),
          },
          {
            title: "Following one patient through the cycle",
            body: p(
              `The quickest way to understand a hospital's revenue cycle is to follow a single patient. Here is a typical case at Kestrel Specialist Hospital in Ikeja.`,
              `Mr Okafor, an HMO enrollee, arrives at the emergency department on a Saturday night with abdominal pain. The registration clerk takes his name and HMO card but does not call the HMO, because the HMO desk is closed at weekends. The surgeon diagnoses appendicitis and operates that night. The HMO's rules require an authorisation code for the surgery, which nobody requests until Monday.`,
              `In theatre, the scrub nurse uses two packs of sutures and a drain. The drain is written in the theatre register but not on the charge sheet. On the ward, Mr Okafor receives intravenous antibiotics for three days. Two doses given at night are recorded in the nursing notes but not sent to billing. He is discharged on Wednesday. His bill is finalised the following Tuesday because the biller is waiting for the theatre charge sheet.`,
              `The claim goes to the HMO at the end of the month with the operation listed but without the drain or the two night doses. The authorisation code obtained on Monday covers the procedure but the claim is filed under a different enrollee number, copied wrongly from the card at registration. The HMO queries it.`,
              `Count the failure points: no eligibility check at registration, a late authorisation, a missed consumable, missed drug doses, a week's delay in finalising the bill, a batched submission and a wrong ID. None of them involved bad clinical care. Each was a small administrative miss, and together they turn a straightforward case into a reduced, delayed claim.`,
              `This is why patient-level tracing is such a useful diagnostic. Pick ten recently discharged patients across self-pay and insured, follow each one from registration to posted cash, and write down every place the record and the bill disagree. The pattern across ten cases usually tells you where the hospital's cycle is weakest.`,
            ),
          },
          {
            title: "Self-pay and insured paths",
            body: p(
              `The same stages apply to every patient, but the risk sits in different places depending on who pays.`,
              `For self-pay patients, the risk is that the patient leaves without paying in full. The controls are at the front of the cycle: a clear price or estimate before the service, a deposit for admissions and procedures, top-ups during a long stay, and a final bill ready at the point of discharge. Most self-pay outpatient services are paid before or at the time of service, which is simple. Self-pay admissions are where hospitals lose money, because the bill grows daily and the conversation about paying it is postponed until the patient is ready to go home.`,
              `For insured patients, whether through an HMO, a state scheme, an NHIA programme or a corporate retainer, the risk is that the payor does not pay all of what was billed. The controls are about getting the paperwork right: confirming eligibility, obtaining authorisation codes before planned services, billing at the agreed tariff, attaching the documents the payor asks for, and submitting within the payor's deadline. The patient may still owe a co-payment or the cost of services the plan excludes, and that part should be collected like a self-pay bill.`,
              `Many patients are both. An enrollee whose plan covers a consultation but not a particular drug, or who chooses a private room above their plan's entitlement, has an insured portion and a self-pay portion. Hospitals that treat the whole bill as insured end up chasing the HMO for money the HMO never owed, then trying to find the patient weeks later.`,
              `Two numbers give you a first sense of how well a hospital runs each path. For self-pay, the share of admitted patients who leave owing money. For insured, how long it takes from discharge to a submitted claim. A hospital that takes three weeks to submit claims has a problem inside its own walls, before any HMO is involved.`,
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              `This taster gives you the map of the cycle and the habit of tracing a patient through it. The paid track Revenue Cycle Excellence takes each stage further and gives you the tools to fix it. It assumes you have done this taster and does not repeat the map.`,
              `What Revenue Cycle Excellence teaches that this taster does not:`,
              `- Running patient access as a revenue function: a verification desk, pre-authorisation routines, financial counselling scripts and point-of-service collection, with the numbers that justify the staff.\n- Clinical coding and charge capture: ICD-10 basics, how documentation drives coding, case-based payment, and a structured audit comparing what was done with what was billed.\n- Billing to each payor type, denial prevention and a tiered collections approach for patient balances and claims.\n- A full revenue leakage audit across unbilled services, discounts, waivers, write-offs, pharmacy and laboratory, with methods for sizing each hole.\n- A short set of revenue cycle KPIs, how to define them so they cannot be argued with, and how to run a weekly review that turns them into actions.`,
              `The track stops at the point the claim is submitted and the cash is posted. What happens between the hospital and the payor after that, such as contracts, tariffs, vetting, disputes and ageing receivables, belongs to the Payor & Claims Management track.`,
              `If you are an analyst supporting a revenue cycle engagement, the patient trace in this taster is the most useful thing you can do in your first week. It gives the engagement lead real cases to discuss with the client instead of opinions, and it shows you which modules of the paid track you will need first.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Trace three patients",
            instruction:
              "You are given three discharged patients at a 70-bed hospital: a self-pay caesarean section with a N650k final bill and a N300k deposit; an HMO enrollee admitted for malaria for four days; a corporate client's staff member seen in outpatients for a consultation, full blood count and malaria test. For each, list the revenue cycle stages they pass through, the staff role responsible for each stage, and the two places you would expect money to be most at risk. Then say which single control would have protected the most money across the three.",
          },
        ],
      },
      resources: { tools: ["Patient trace worksheet"] },
      questions: [
        mc(
          "An HMO patient is treated well and discharged, but the claim is reduced because a drain used in theatre never reached the bill. At which stage did the loss occur?",
          ["Coding", "Charge capture", "Eligibility", "Payment posting"],
          1,
          "The drain was used and recorded in the theatre register but never turned into a bill line, which is charge capture. Coding describes diagnoses and procedures; it cannot add a consumable that was never charged.",
        ),
        mc(
          "A hospital delivers a service on the 2nd of the month. Notes are completed two days after discharge, the bill is finalised three days later, and claims are sent in a batch on the last day of the month. What is the main cost of this pattern?",
          [
            "Higher clinical risk",
            "Higher tariffs being refused",
            "The hospital funds weeks of earned revenue from its own cash before even submitting a claim",
            "The HMO will treat every claim as late and deny it, since the service was delivered weeks earlier",
          ],
          2,
          "Each lag adds days between earning the revenue and asking for the money, and the hospital carries that gap. A claim sent within the payor's deadline is not automatically denied, so the cost here is cash, not a denial.",
        ),
        mc(
          "Which stage of the revenue cycle protects a hospital most against a self-pay inpatient leaving without paying?",
          [
            "An estimate and deposit before admission, with top-ups during the stay",
            "Coding the diagnosis accurately",
            "Sending a detailed itemised bill by email and text message within a day of discharge",
            "Posting the payment quickly",
          ],
          0,
          "For self-pay admissions the risk sits at the front, so a deposit against a written estimate is the main control. Billing after discharge is exactly the moment when collection probability is already falling.",
        ),
        mc(
          "An HMO enrollee chooses a private room above her plan's entitlement. How should the extra room charge be handled?",
          [
            "Add it to the HMO claim, because she is an HMO patient",
            "Waive it, because she is insured",
            "Bill it to the HMO with the rest of the admission and let the HMO recover it from her later",
            "Tell her the cost up front and collect it from her as a self-pay portion",
          ],
          3,
          "The plan does not cover the upgrade, so it is the patient's to pay, and it should be agreed and collected like any self-pay item. Claiming it from the HMO invites a deduction and leaves the hospital chasing the patient weeks later.",
        ),
        mc(
          "You have one week to understand where a hospital's revenue cycle is weakest. Which approach gives the most useful evidence?",
          [
            "Interview the finance director about the main problems",
            "Read the hospital's billing policy",
            "Trace ten recently discharged patients from registration to posted cash and note every mismatch between record and bill",
            "Review the audited and management accounts for the last three years and compare revenue by department against peers",
          ],
          2,
          "Tracing real patients shows what actually happens at each stage, and the pattern across cases points to the weak stages. Policies and interviews describe how things should work, which is often not how they do.",
        ),
        mc(
          "A patient's HMO card is copied wrongly at registration. Which later step is most likely to fail because of it?",
          [
            "The claim is queried or rejected because the enrollee number does not match",
            "The clinical diagnosis is wrong",
            "The pharmacy dispenses the wrong drug",
            "The cash is posted to the wrong bank account",
          ],
          0,
          "Registration data flows through to the claim, so a wrong enrollee number causes a query or rejection weeks later. The error has no effect on the clinical care itself.",
        ),
        mc(
          "Two hospitals have similar HMO patient volumes. Hospital A takes three days from discharge to a submitted claim, Hospital B takes 21 days. What does B's figure tell you?",
          [
            "B's HMOs are slower payers",
            "B has a problem inside its own walls, before any HMO is involved",
            "B is checking each claim more carefully, so it will have fewer rejections and get paid faster overall",
            "Nothing, because submission speed does not affect cash",
          ],
          1,
          "The time from discharge to submission is entirely within the hospital's control, so a long lag points to internal process. A slow claim is not necessarily a more accurate one; delay usually comes from waiting for missing documents.",
        ),
        ms(
          "A patient is admitted at the weekend for emergency surgery under an HMO plan that requires authorisation for surgery. Which actions protect the claim? Select all that apply.",
          [
            "Check the patient's eligibility with the HMO's out-of-hours line at registration",
            "Request the authorisation code as soon as the decision to operate is made, using the HMO's emergency procedure",
            "Delay the surgery until the HMO office opens on Monday",
            "Record the authorisation code on the patient's billing record so it appears on the claim",
          ],
          [0, 1, 3],
          "Checking eligibility, requesting the code promptly and carrying it onto the claim all protect payment without affecting care. Delaying emergency surgery for paperwork is clinically unsafe and is never the right trade.",
        ),
        mc(
          "Which statement best describes who owns the revenue cycle in a hospital?",
          [
            "The billing department, because it produces the bills and sees every claim that goes out",
            "The finance director alone",
            "The HMO desk",
            "It runs across many departments, so it needs one person accountable for the whole",
          ],
          3,
          "The steps are spread across many departments, which is why money falls through the gaps unless someone owns the end-to-end result. Billing only sees what reaches it, so it cannot fix losses that happen earlier.",
        ),
        mc(
          "A hospital's self-pay outpatients pay at the cash point before seeing the doctor, and self-pay inpatients settle at discharge. Where is self-pay money most at risk?",
          [
            "Outpatient consultations",
            "Laboratory walk-ins, because many patients collect results days later and never return to pay",
            "Self-pay admissions, where the bill grows daily and payment is postponed to discharge",
            "Pharmacy over-the-counter sales",
          ],
          2,
          "Outpatient services are paid before or at the time of service, while an admission builds a growing bill with no payment until the end. That is where deposits and top-ups matter most.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "payor-intro",
      name: "How HMOs, NHIA and Corporates Pay Hospitals",
      description:
        "Who pays a Nigerian hospital, the payment methods they use, what capitation and fee-for-service mean for the hospital's finances, and the basic journey of an insured bill.",
      estimatedMinutes: 55,
      content: {
        sections: [
          {
            title: "Who pays a Nigerian hospital",
            body: p(
              `Most Nigerian private hospitals are paid by four or five different kinds of payor at once, each with its own rules. Knowing which is which is the starting point for any financial conversation with a hospital.`,
              `Self-pay patients pay from their own pocket, in cash, by transfer or by card. Out-of-pocket payment remains the largest source of health spending in Nigeria overall, although in many urban private hospitals insured patients now make up a large share of revenue.`,
              `The National Health Insurance Authority (NHIA) regulates health insurance nationally. The NHIA Act 2022 replaced the old NHIS Act and made health insurance mandatory in law for all residents, although coverage in practice remains low. NHIA runs programmes for federal employees and others, and accredits the HMOs and healthcare facilities that take part.`,
              `State health insurance schemes run in most states, under state laws. They cover state civil servants and, increasingly, informal sector residents and vulnerable groups. Lagos, for example, has its own scheme under the Lagos State Health Management Agency. Each scheme has its own provider list, tariffs and claims process.`,
              `HMOs are private companies that manage health plans. They sell plans to employers and individuals, and also administer some NHIA and state programmes. To the hospital, an HMO is the party that verifies the patient, issues authorisation codes and pays the claim.`,
              `Corporates sometimes deal with hospitals directly, without an HMO. A bank or oil services company may agree a retainership: the hospital treats its staff and either bills the company monthly or receives a fixed monthly retainer.`,
              `A hospital's payor mix is the share of revenue from each of these. It shapes everything from cash flow to pricing. A hospital with 70% HMO revenue lives on the HMOs' payment timetable; a hospital with 70% self-pay lives on its own pricing and its ability to collect at the point of service.`,
            ),
          },
          {
            title: "Capitation and fee-for-service",
            body: p(
              `Payors pay hospitals in two main ways, and the difference changes who carries the financial risk.`,
              `Under capitation, the payor pays a fixed amount per enrolled person per month, whether or not that person visits. Capitation is normally used for primary care. A hospital registered as the primary provider for 2,000 enrollees receives 2,000 times the monthly rate every month. If few enrollees visit, the hospital does well. If many visit often, the same money has to cover far more consultations, tests and drugs. The hospital carries the utilisation risk.`,
              `Under fee-for-service, the payor pays for each service delivered at an agreed tariff. Secondary and specialist care, admissions, surgery and many investigations are usually paid this way, often only with an authorisation code obtained before the service. Here the payor carries the utilisation risk, and the hospital's risk shifts to getting the claim accepted and paid in full.`,
              `Some arrangements sit in between. A payor may pay a fixed package price for a defined procedure, such as a caesarean section, covering the theatre, stay and drugs. The hospital gains if it delivers the package efficiently and loses if the patient stays longer than planned. Case-based payment of this kind is growing.`,
              `To judge a capitation contract, a hospital needs two numbers: how much it receives per enrollee per month, and what the average enrollee actually costs it per month in services. Suppose, for illustration only, a hospital receives N1,000 per enrollee per month for 2,000 enrollees, N2m in total. If 300 enrollees visit in a month and each visit costs N8,000 to deliver, the cost is N2.4m and the contract loses N400k that month. The rate was not the problem on its own. The problem was not knowing the visit rate and cost per visit before signing.`,
              `For fee-for-service, the question is whether the agreed tariff covers the cost of the service, and how much of what is billed is actually paid after queries and deductions.`,
            ),
          },
          {
            title: "The journey of an insured bill",
            body: p(
              `An insured patient's bill follows a predictable journey, and most of the money is lost at the hand-offs.`,
              `Before the service, the hospital confirms the patient is an active enrollee and that the planned service is covered. For services that need it, the hospital requests an authorisation code from the HMO or scheme. The code is the payor's advance agreement to pay for that service, and a claim without one is usually rejected.`,
              `After the service, the hospital prepares the claim at the payor's agreed tariff, attaches the documents the payor requires, such as a discharge summary or investigation results, and submits it, increasingly through the payor's online portal. Payors set deadlines for submission.`,
              `The payor then vets the claim: its medical and claims staff check that the patient was eligible, that the service matched the authorisation, that the tariff is correct and that the clinical documents support what was billed. Items can be accepted, reduced or rejected. The hospital receives a remittance, often in a batch covering many claims, with an advice listing what was paid and what was deducted.`,
              `Payment timelines vary widely between payors and in practice often run well beyond the terms written in the contract. Claims under some public programmes can take many months. That is why a hospital's receivables are usually dominated by insured revenue, and why the cash forecast is built from what each payor actually does.`,
              `A hospital also needs to recognise what it is owed by whom. The remittance has to be matched to individual claims, deductions have to be reviewed, and anything wrongly deducted has to be followed up. Hospitals that bank remittances without reconciling them never find out which claims were underpaid, and so never recover the money or fix the cause.`,
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              `This taster explains who pays and how. The paid track Payor & Claims Management deals with the hospital's relationship with each payor, from contract to cash, after the claim has left the building. It assumes you know the material here and starts from it.`,
              `What Payor & Claims Management teaches that this taster does not:`,
              `- The payor landscape in detail: how NHIA programmes, state schemes, HMOs, corporates and retainerships differ in contracts, tariffs, reliability of payment and leverage.\n- Contracting and tariff negotiation: costing your services before you negotiate, what to ask for, and how to handle a payor who will not move on price.\n- Vetting, denials, authorisation codes and disputes: why claims are reduced or rejected after submission, how to contest them, and how to work with a payor's medical team.\n- Ageing receivables and claims financing: managing the queue of unpaid claims by payor and age, and when it makes sense to borrow against accepted claims.\n- Payor mix strategy: how many payors to sign, when to drop one, and how to keep a healthy self-pay balance.`,
              `The hospital's own internal process up to a submitted claim, such as registration, charge capture, coding and billing, sits in Revenue Cycle Excellence. If a payor's rejections keep pointing to the same internal error, that is where the fix is taught.`,
              `For an analyst, the most useful starting work on a payor engagement is a table of every payor the hospital deals with, showing the payment method, the revenue in the last twelve months, the amount currently owed and the actual average days to payment from the bank records.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Is this capitation contract worth it?",
            instruction:
              "Palmgrove Hospital, Ibadan, has been offered a primary care capitation contract for 3,000 enrollees by an HMO, at an illustrative N900 per enrollee per month. From its existing HMO data, about 12% of enrollees visit in a typical month, and the average primary care visit (consultation, basic tests and drugs) costs the hospital N6,500 to deliver. Calculate the monthly income, the expected monthly cost and the margin. Then say what would happen if the visit rate rose to 18%, and list two things Palmgrove should ask for or check before signing.",
          },
        ],
      },
      resources: { tools: ["Payor register template"] },
      questions: [
        mc(
          "A hospital is primary provider for 2,000 enrollees under capitation. In a bad malaria season, visits from these enrollees double. What happens to the hospital's capitation income?",
          [
            "It doubles, because the hospital can bill the HMO for each additional visit in the season",
            "It falls, because the HMO pays less in busy months",
            "It stays the same, while the cost of serving the enrollees rises",
            "It is replaced by fee-for-service until visits fall",
          ],
          2,
          "Capitation is fixed per enrollee per month regardless of use, so the hospital carries the cost of higher utilisation. Billing per visit is fee-for-service, which is a different method.",
        ),
        mc(
          "Which party carries the utilisation risk under fee-for-service payment?",
          [
            "The payor, because it pays for each service delivered",
            "The hospital, because it has to staff and supply every service that patients use",
            "The patient, because they choose how often to visit",
            "The NHIA, in every case",
          ],
          0,
          "Under fee-for-service the payor pays more when more services are used, so it carries utilisation risk; the hospital's risk becomes getting each claim accepted and paid in full. The hospital carries utilisation risk under capitation, not here.",
        ),
        mc(
          "A hospital receives N1,200 per enrollee per month for 1,500 enrollees. In a typical month 250 enrollees visit, and each visit costs N8,000 to deliver. What is the monthly result?",
          [
            "A surplus of N200k",
            "A loss of N2m",
            "A surplus of N1.8m",
            "A loss of N200k",
          ],
          3,
          "Income is N1.8m (1,500 x N1,200) and cost is N2m (250 x N8,000), a loss of N200k. A surplus of N1.8m comes from forgetting to subtract the cost of the visits.",
        ),
        mc(
          "A planned MRI for an HMO enrollee is carried out without an authorisation code, although the plan requires one. What is the most likely outcome?",
          [
            "The claim is paid at a lower tariff",
            "The claim is rejected or held until a code is obtained, which may not be granted after the fact",
            "The HMO pays the claim in full and then recovers the cost of the scan from the patient's employer or the patient directly",
            "The NHIA pays instead",
          ],
          1,
          "The code is the payor's advance agreement to pay; without it the claim is usually rejected, and a retrospective code is not guaranteed. Assuming a reduced payment underestimates the risk.",
        ),
        mc(
          "Which statement about the NHIA Act 2022 is accurate?",
          [
            "It abolished HMOs",
            "It replaced the NHIS Act and made health insurance mandatory in law, though actual coverage is low",
            "It set a single national tariff that every private hospital in Nigeria must now charge all insured patients",
            "It applies only to federal civil servants",
          ],
          1,
          "The Act replaced the NHIS Act and created a mandatory framework, but actual enrolment remains limited. HMOs continue to operate and are accredited under NHIA, so they were not abolished.",
        ),
        mc(
          "A hospital earns 70% of its revenue from HMOs and 25% from self-pay patients. Which consequence follows most directly?",
          [
            "Its cash flow depends mainly on the HMOs' payment timetables and claim acceptance",
            "Its prices are set entirely by the hospital",
            "It has little need for a cash forecast, because HMO contracts fix the payment dates in advance",
            "It can ignore point-of-service collection",
          ],
          0,
          "With most revenue billed to HMOs, the hospital is paid when and as the HMOs decide, so their behaviour drives its cash. Self-pay still matters, but 25% of revenue does not set the hospital's cash rhythm.",
        ),
        mc(
          "A remittance of N14m arrives from an HMO covering 120 claims worth N17m. The accounts team banks it and closes the claims. What is the main problem?",
          [
            "The money should have been rejected until paid in full",
            "The remittance should have been split across bank accounts",
            "Nothing, because the HMO's vetting team has already checked each claim and the advice lists the total paid",
            "It cannot see which claims lost the N3m, why, or whether the money can be recovered",
          ],
          3,
          "Reconciling the remittance to individual claims shows which items were reduced and why, which is the basis for any follow-up and for fixing the cause. Trusting the vetting means accepting every deduction, including wrong ones.",
        ),
        mc(
          "A logistics company asks a hospital to treat its 400 staff directly, paying a fixed monthly sum regardless of how many staff attend. What kind of arrangement is this?",
          [
            "An NHIA formal sector programme for the company's employees",
            "A state scheme enrolment",
            "A corporate retainership on a capitation-like basis",
            "Fee-for-service through an HMO",
          ],
          2,
          "A company paying the hospital directly is a retainership, and a fixed monthly sum regardless of use works like capitation. No HMO or public scheme is involved.",
        ),
        ms(
          "A hospital is preparing a claim for an HMO patient's admission. Which steps help it get paid in full? Select all that apply.",
          [
            "Billing at the HMO's agreed tariff rather than the hospital's self-pay price list",
            "Attaching the discharge summary and results the HMO requires",
            "Submitting within the HMO's deadline",
            "Adding services the plan excludes, so the HMO can decide whether to pay",
          ],
          [0, 1, 2],
          "The right tariff, the required documents and timely submission all reduce queries and deductions. Excluded services belong to the patient's self-pay portion; claiming them invites deductions and delays.",
        ),
        mc(
          "An HMO's contract says it pays within 30 days, but the bank shows it paying on average 90 days after submission. What should the hospital's cash forecast assume?",
          [
            "30 days, because the contract is binding and the hospital can hold the HMO to it",
            "60 days, as a compromise",
            "That the HMO will not pay",
            "90 days, what the bank shows, while the overdue claims are chased",
          ],
          3,
          "Forecasts should follow observed payment behaviour, not contract terms that the payor does not keep. The 30-day term still matters for follow-up, but planning on it would hide a real cash gap.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "capital-intro",
      name: "How Health Businesses Raise Money",
      description:
        "The main sources of money for hospitals, clinics and health ventures in Nigeria, how to match the source to the need, and what lenders and investors look for before they say yes.",
      estimatedMinutes: 55,
      content: {
        sections: [
          {
            title: "Start with the need, not the funder",
            body: p(
              `The first question in any fundraising conversation is what the money is for. Different needs call for different kinds of capital, and most of the damage in health business finance comes from using the wrong kind.`,
              `There are four broad needs.`,
              `- Working capital: funding the gap between paying for drugs, staff and diesel and collecting from patients and payors. This need goes up and down and never fully disappears.\n- Capital expenditure: buying or building long-lived assets such as a building, theatre equipment, a CT scanner or a generator. The asset pays back over several years.\n- Growth: opening a new site, adding a service line, or buying another practice. The return is uncertain and comes later.\n- Losses: covering a business that spends more than it earns. Money for this is the hardest to raise, because the funder is paying for time to fix the problem.`,
              `The rule is to match the length of the money to the length of the need. Short-term money, such as an overdraft, should fund short-term needs like working capital. Long-term needs should be funded with long-term money: a term loan, a lease or equity. A hospital that buys a scanner with its overdraft has a payback period of several years funded by money the bank can call in at short notice.`,
              `The second question is how much. Owners often ask for a round number. A funder will want to see it built up: the cost of the equipment with installation and training, the working capital needed while the new service ramps up, and a contingency. A request for N150m that turns out on inspection to be N90m of equipment and an unexplained N60m will not be taken seriously.`,
              `The third question is when the money comes back, and from what. A lender wants to see the cash flows that will repay the loan. An equity investor wants to see how the business will grow in value and how they will eventually sell their stake.`,
            ),
          },
          {
            title: "The main sources of capital",
            body: p(
              `Health businesses in Nigeria draw on a handful of sources. Each has a cost, a set of conditions and a typical use.`,
              `Owner's money and retained profit is the cheapest in appearance and the most common. Many Nigerian hospitals were built entirely by their founders, often doctors, from savings and reinvested profits. It is flexible, but it limits how fast the business can grow, and the owner bears all the risk.`,
              `Bank debt comes as overdrafts for working capital and term loans for assets or expansion. Naira interest rates are high, banks usually want collateral such as property, and loan tenors are often shorter than a hospital project needs. Debt must be repaid whether or not the business does well, so it suits businesses with steady, predictable cash flows. Development finance institutions and government-backed schemes have at times offered cheaper or longer health sector lending; their terms change, so check what is currently available rather than assuming.`,
              `Asset finance and leasing fund specific equipment. The lessor buys the machine and the hospital pays monthly; the equipment itself is the security. Some equipment suppliers offer vendor finance or reagent-rental arrangements, where the machine is placed in the hospital and paid for through the price of consumables. These avoid large upfront payments but need careful reading: the effective cost can be high and the hospital may be tied to one supplier.`,
              `Equity means selling part of the business. It can come from angel investors, family offices, private equity funds and impact or development investors. Equity does not have to be repaid on a schedule, but the investor shares in the profits and the eventual sale, and usually wants a board seat and information rights.`,
              `Grants are rare for private hospitals. They are more common for programmes with a public health purpose, research, or innovation, and come with reporting conditions. Building a business plan around an expected grant is risky.`,
            ),
          },
          {
            title: "What lenders and investors look for",
            body: p(
              `Lenders and investors ask similar questions in different orders. Knowing them in advance is most of the preparation.`,
              `A lender's main question is whether it will be repaid. It looks at the cash flow available to service the debt, how much existing debt the business carries, the collateral, and the owners' personal guarantees. It wants clean, ideally audited, accounts for at least two or three years, bank statements that match the accounts, and evidence that the hospital's licences and registrations are current.`,
              `An equity investor's main question is how much the business can grow and what their share will be worth. It looks at the market, the management team, the track record, the quality of the numbers and the governance. It will ask how decisions are made, whether the founder's personal and business money is separated, whether related-party transactions are disclosed, and who would run the business if the founder stepped back.`,
              `Both will examine regulatory standing. For a hospital this includes facility registration with the relevant state body (HEFAMAA in Lagos, for example), the professional registration of its doctors with the MDCN and nurses with the NMCN, the pharmacy's registration with the Pharmacists Council, and compliance with the Nigeria Data Protection Act 2023 for patient records.`,
              `Common reasons Nigerian health businesses fail to raise money:`,
              `- Accounts that are late, unaudited, or do not match the bank statements.\n- Business and personal finances mixed, with no clear record of what the founder has taken out.\n- A business plan built on revenue projections with no link to beds, clinicians and volumes.\n- No clear answer on what the money is for and how it will be repaid.\n- A founder unwilling to accept any outside oversight.`,
              `Much of the consultant's value in an early fundraising is fixing these before a funder sees them. A hospital that spends three months getting its accounts audited, separating related-party transactions and building a credible plan will raise money on better terms than one that approaches funders straight away.`,
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              `This taster covers the kinds of money available and what funders check. The paid track Health Deals & Fundraising takes a client through an actual raise, from choosing the capital to closing the deal. It assumes you know what is here.`,
              `What Health Deals & Fundraising teaches that this taster does not:`,
              `- Choosing between debt, equity, grants and asset finance for a specific project, including how to compare their real costs and the control each one gives away.\n- Valuing a healthcare business: the methods investors use, what drives the value of a hospital or clinic, and how to defend a valuation in negotiation.\n- Building the investor-grade business plan and financial model that lenders and investors expect, linked to capacity, volumes and staffing.\n- Joint ventures, special purpose vehicles and partnership structures, such as a hospital and a specialist building a new service together.\n- Due diligence and closing: preparing a data room, handling the investor's questions, and the documents and conditions that complete the deal.`,
              `Cash management inside the business, such as working capital and the 13-week forecast, stays in this free track under Cash Flow and Working Capital in a Hospital. A good cash forecast is often the first thing a funder asks to see, so it is worth doing that module before the paid track.`,
              `For an analyst, a useful first contribution to any fundraising is a readiness checklist: three years of accounts and whether they are audited, a schedule of existing debts, a list of licences and their expiry dates, and a one-page statement of what the money is for. It usually shows what needs fixing before anyone approaches a funder.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Match the money to the need",
            instruction:
              "Tamarind Women's Clinic in Abuja wants to raise N220m. The founder's list: N95m for a new ultrasound suite and a delivery theatre fit-out, N40m to cover a working capital gap from slow HMO payments, N60m to open a second outpatient site, and N25m to cover losses at the existing site over the past year. For each item, recommend the most suitable type of capital and explain why. Then list five documents a lender would ask for before considering the equipment loan, and say which you expect the clinic is most likely to be missing.",
          },
        ],
      },
      resources: { tools: ["Fundraising readiness checklist"] },
      questions: [
        mc(
          "A hospital wants N70m for a new X-ray and ultrasound suite that will pay back over about five years. Which source fits best?",
          [
            "The existing overdraft, increased for the purpose, since the bank already knows the hospital",
            "An equipment lease or term loan matched to the payback period",
            "Delaying supplier payments for six months",
            "A grant for general hospital operations",
          ],
          1,
          "Long-lived assets should be funded with long-term money, and a lease or term loan spreads the cost over the asset's working life. An overdraft can be called in at short notice, which leaves a five-year payback funded by short-term money.",
        ),
        mc(
          "A founder asks for N150m. On inspection, N90m is costed equipment and N60m has no breakdown. How will a funder most likely react?",
          [
            "Approve the full amount, because most of it is costed and a contingency is normal on any hospital project of this size",
            "Approve N150m with a higher interest rate",
            "Treat the unexplained N60m as a weakness and ask for it to be built up from specific costs, or offer only the N90m",
            "Ignore the breakdown and focus only on collateral",
          ],
          2,
          "Funders expect the amount built up from specific uses, and an unexplained third of the request undermines confidence in the whole plan. Collateral matters to lenders but does not replace knowing what the money is for.",
        ),
        mc(
          "A hospital needs money to cover a working capital gap caused by HMOs paying in 90 days. Which source is usually the most suitable?",
          [
            "A working capital facility such as an overdraft, sized to the receivables",
            "A 10-year term loan",
            "Selling 40% of the business to a private equity fund, so there are no repayments to worry about",
            "A grant",
          ],
          0,
          "Working capital rises and falls with receivables, so short-term, flexible facilities suit it. Selling equity to fund a timing gap gives away permanent ownership for a temporary need.",
        ),
        mc(
          "A diagnostics supplier offers to place a chemistry analyser in a lab at no upfront cost, recovering it through a higher price per reagent kit for five years. What should the lab check most carefully?",
          [
            "Whether the analyser is new",
            "Whether the supplier is the market leader with a service engineer close enough to fix breakdowns quickly",
            "Whether the analyser fits in the lab",
            "The total five-year cost against buying or leasing, and how tied the lab becomes to one supplier",
          ],
          3,
          "Reagent-rental deals avoid an upfront payment but can carry a high effective cost and lock the lab into one supplier's consumables. Whether the machine is new matters less than what it costs in total.",
        ),
        mc(
          "A founder is considering equity rather than debt to fund a new site. Which statement about equity is accurate?",
          [
            "Equity is the cheapest option because nothing is ever repaid and no interest is charged on the money",
            "No repayment schedule, but the investor shares in profits and value and usually wants a board seat",
            "Equity investors take no interest in governance",
            "Equity must be repaid within five years",
          ],
          1,
          "Equity avoids scheduled repayments but costs the founder a share of future profits and value, plus some control. Calling it free ignores that this share is often the most expensive capital over time.",
        ),
        mc(
          "A Lagos hospital approaches a bank for a loan. Its management accounts show N40m profit but its bank statements show far less money moving through the business. What will the bank most likely conclude?",
          [
            "That the numbers may be unreliable, and it will want audited accounts and an explanation first",
            "That the hospital is profitable and simply keeps a lot of its cash in other accounts, so the loan is safe",
            "That the bank statements can be ignored",
            "That it should lend more because profit is high",
          ],
          0,
          "A mismatch between accounts and bank statements is one of the commonest reasons health businesses fail to raise money, because it suggests the numbers cannot be trusted. Funders give more weight to bank evidence than to management figures.",
        ),
        ms(
          "Which items would an investor in a Lagos private hospital typically check as part of regulatory standing? Select all that apply.",
          [
            "Facility registration with HEFAMAA",
            "Current MDCN registration of the doctors",
            "Compliance with the Nigeria Data Protection Act 2023 for patient records",
            "ARCON registration of the hospital's accountants",
          ],
          [0, 1, 2],
          "Facility registration, professional registration and data protection are all core regulatory checks for a hospital. ARCON regulates advertising, not accountants, so it does not belong on this list.",
        ),
        mc(
          "A founder-owned clinic pays the founder's personal school fees and car costs from the business account without recording them. What should a consultant do before the clinic approaches investors?",
          [
            "Nothing, since this is normal for family businesses",
            "Reclassify the payments into general overheads so the accounts look cleaner before the investor sees them",
            "Wait for the investor to raise it in due diligence",
            "Separate business and personal spending now, and record past payments as drawings or related-party items",
          ],
          3,
          "Investors look for clean separation and full disclosure, and fixing it before they look avoids a loss of trust later. Leaving it for due diligence lets the investor discover it, which damages confidence far more.",
        ),
        mc(
          "A hospital that has made losses for two years asks for N80m to keep running while it fixes its problems. Why is this the hardest kind of money to raise?",
          [
            "Because banks are not allowed to lend to hospitals",
            "Because N80m is below the minimum ticket size that most Nigerian lenders and investors will consider",
            "Because the funder is paying for time to fix a business with no clear repayment source yet",
            "Because losses are tax deductible",
          ],
          2,
          "Money to cover losses has no obvious repayment source until the business improves, so funders want strong evidence the fix will work. The size of the amount is not the issue.",
        ),
        mc(
          "A clinic's business plan assumes revenue will triple in two years, with no link to beds, clinicians or patient volumes. How will a funder most likely read it?",
          [
            "As unsupported, because revenue should be built from capacity, staffing and volumes",
            "As ambitious and therefore attractive",
            "As acceptable as long as the founder signs a personal guarantee covering the full amount requested",
            "As irrelevant, because funders only look at past accounts",
          ],
          0,
          "Funders expect projections to rest on what the clinic can physically deliver, so a growth number with no operating basis is not credible. A guarantee may help secure a loan but does not make the plan believable.",
        ),
      ],
    },
  ],
};

export default expansion;
