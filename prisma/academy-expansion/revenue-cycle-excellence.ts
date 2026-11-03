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
  slug: "revenue-cycle-excellence",

  topUp: [
    {
      moduleSlug: "patient-access-registration",
      questions: [
        mc(
          "An HMO enrollee arrives for a planned MRI. The verification desk confirms her policy is active, but the plan requires pre-authorisation for MRI and none has been obtained. What should happen?",
          [
            "Request the code before the scan; if it is refused, offer to reschedule or proceed as self-pay with her agreement",
            "Do the scan as booked and request the authorisation code afterwards, attaching it to the claim when it is submitted at month end",
            "Do the scan and bill it at the self-pay rate to the HMO",
            "Send her home without explanation and ask her to call the HMO herself",
          ],
          0,
          "Pre-authorisation is one of the four checks before insured care, and the patient should know her options before the service. Requesting the code afterwards is how unverified services end up never reimbursed.",
        ),
        mc(
          "A hospital bills N30m a month to insured patients and 18% is rejected at the point of billing because of verification failures. A verification desk brings this down to 3%. By how much does the monthly value rejected fall?",
          ["N5.4m", "N0.9m", "N2.7m", "N4.5m"],
          3,
          "Rejections fall from N5.4m (18% of N30m) to N0.9m (3%), a reduction of N4.5m a month. N5.4m is the starting rejection, not the improvement.",
        ),
        mc(
          "A hospital's patient-owed balances total N12m a month. It moves from billing after discharge, recovering about 20%, to point-of-service collection, recovering about 65%. Roughly how much more does it collect each month?",
          ["N5.4m", "N7.8m", "N2.4m", "N9.6m"],
          0,
          "Collections rise from N2.4m to N7.8m, an increase of N5.4m. N7.8m is the new total collected, not the gain.",
        ),
        mc(
          "A denial analysis finds that 35% of a hospital's rejected claims carry a wrong enrollee ID. Where should the fix be made?",
          [
            "In the billing team, by checking every claim twice against the patient file before it is submitted",
            "In the appeals process, by appealing every ID rejection",
            "With the HMOs, by asking them to accept near-matches",
            "At registration, with ID capture and verification against the HMO record",
          ],
          3,
          "The error starts at registration, so fixing it there stops it reaching every later stage. Appealing each rejection recovers some money but leaves the cause in place, which is why registration is the highest-leverage point.",
        ),
        mc(
          "A self-pay patient is booked for a hysterectomy. What does good financial counselling look like?",
          [
            "Quoting the surgeon's fee only, since the rest depends on the stay",
            "A written estimate of theatre, stay, drugs and main exclusions, a deposit before admission, and payment options",
            "Telling her the bill will be explained at discharge",
            "Asking her to sign an open-ended undertaking to pay whatever is billed, so the hospital is protected whatever happens",
          ],
          1,
          "Patients who know their obligation in advance pay more reliably and feel less ambushed, so a full written estimate with a deposit and payment options is the standard. Quoting the surgeon's fee alone leaves most of the bill as a surprise.",
        ),
      ],
    },
    {
      moduleSlug: "clinical-coding-charge-capture",
      questions: [
        mc(
          "A coder reviewing a file sees that the patient was treated with sepsis protocols, but the doctor documented only 'fever and infection'. What should the coder do?",
          [
            "Query the doctor to clarify and complete the documentation before coding",
            "Code sepsis, since the drugs and protocols in the file show that sepsis was what was treated",
            "Code fever and infection and close the file",
            "Leave the file uncoded until month end",
          ],
          0,
          "Coders can only code what is documented, so the right step is a documentation query. Coding sepsis from the treatment alone would be assigning a diagnosis the record does not support.",
        ),
        mc(
          "A charge capture audit of 80 files finds documented services worth N24m, of which N21.6m was billed. What is the leakage rate?",
          ["2.4%", "11.1%", "8%", "10%"],
          3,
          "The gap is N2.4m on N24m of services delivered, which is 10%. 11.1% divides the gap by the amount billed instead of the amount documented.",
        ),
        mc(
          "Under a case-based payment of N600k for a procedure, a hospital reduces average length of stay from five days to three without harming outcomes. What happens?",
          [
            "Revenue per case stays at N600k while cost per case falls, so the margin improves",
            "Revenue per case falls, because fewer bed-days are billed",
            "The payor reduces the case payment to match",
            "Nothing changes, because case payments are set nationally and ignore what happens to length of stay",
          ],
          0,
          "The payment is fixed per case, so fewer days lower cost without lowering revenue. Under fee-for-service fewer bed-days would reduce revenue, which is the instinct the transition reverses.",
        ),
        mc(
          "An audit shows that wound dressings and catheterisations done by nurses on the wards are rarely billed. Which fix addresses the cause?",
          [
            "Raise the bed fee to cover nursing procedures",
            "Ask billers to estimate ward procedures at month end",
            "Remind nurses at the monthly meeting that every procedure they perform must be written on the charge sheet",
            "Add a billing trigger to the nursing workflow and reconcile ward procedures with billing daily",
          ],
          3,
          "The procedures go unbilled because nothing in the nurses' workflow sends them to billing, so the fix is a trigger plus daily reconciliation. A reminder without a changed process rarely lasts beyond a few weeks.",
        ),
        mc(
          "Which of these is upcoding rather than accurate coding?",
          [
            "Coding a documented post-operative wound infection as a complication, which raises the payment for the case",
            "Coding a complication that does not appear anywhere in the clinical notes",
            "Coding laterality on a documented right knee procedure",
            "Querying the clinician about an unclear diagnosis",
          ],
          1,
          "Upcoding assigns a code the record does not support. Coding a documented complication is accurate coding, because it reflects the care actually delivered.",
        ),
      ],
    },
    {
      moduleSlug: "billing-claims-collections",
      questions: [
        mc(
          "An HMO rejects a claim because it was submitted after the HMO's deadline. Which denial category does this fall into?",
          ["Preventable", "Clinical", "Technical", "Contractual"],
          0,
          "Late submission is under the hospital's control, which makes it preventable along with registration errors and missing authorisation. Technical denials are about coding, duplicates or formatting, not timing.",
        ),
        mc(
          "A hospital's receivables are N40m at 0-30 days, N20m at 31-60, N10m at 61-90 and N10m at 91-120. Using the module's collection probabilities, what is the expected collection?",
          ["N80m", "N60m", "N72m", "N67m"],
          3,
          "At 95%, 85%, 70% and 50% the expected amounts are N38m, N17m, N7m and N5m, a total of N67m. N80m is the face value, which assumes every naira will be collected.",
        ),
        mc(
          "A denial dashboard shows that 25% of all denials last quarter were for missing pre-authorisation. What is the best response?",
          [
            "Hire an extra appeals officer to work these denials quickly within each payor's appeal window",
            "Write off pre-authorisation denials as a cost of doing business",
            "Ask the HMOs to drop the pre-authorisation requirement",
            "Fix the pre-authorisation step at the front end so the denials stop recurring",
          ],
          3,
          "Feeding the root cause back to the front end is the third step of the closed loop, and prevention is cheaper than correction. Extra appeals work recovers some money each time but pays repeatedly for the same failure.",
        ),
        mc(
          "Claims denied 45 days ago sit unworked; the payor's appeal window is 60 days. The billing team usually writes such claims off. What should happen?",
          [
            "Work and appeal them now, before the window closes",
            "Write them off, since they are already past 30 days",
            "Wait for the payor to reconsider them on its own",
            "Resubmit them as new claims with a new submission date so that they enter the payor's normal queue",
          ],
          0,
          "The appeal window is still open, and writing off appealable denials leaves money on the table. Resubmitting as new claims is likely to be flagged as a duplicate, which creates a further technical denial.",
        ),
        mc(
          "A patient covered under an NHIA programme is referred from her primary provider to the hospital for specialist care. What must the billing team have before the claim will be accepted?",
          [
            "A letter from the patient's employer confirming her NHIA enrolment and grade",
            "The referral authorisation for the secondary service",
            "A copy of the hospital's licence",
            "A self-pay deposit",
          ],
          1,
          "Secondary and tertiary services under NHIA programmes require referral authorisation, and claims without it are denied. A deposit has nothing to do with the claim's validity.",
        ),
      ],
    },
  ],

  modules: [
    // ------------------------------------------------------------------
    {
      slug: "revenue-leakage-audit",
      name: "Finding Revenue Leakage",
      description:
        "A structured audit of the places a hospital loses revenue it has earned: unbilled services, discounts, waivers, write-offs, pharmacy and laboratory, with methods for sizing each hole and controls that close it.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Leakage is several holes, not one",
            body: p(
              `Revenue leakage is money a hospital has earned but never collects, and it comes from several distinct holes that need different methods to find. Treating it as one problem produces one vague number and no fix.`,
              `The holes worth testing in a Nigerian private hospital:`,
              `- Unbilled services: care delivered that never reaches the bill, including missed charges on the ward and in theatre, and patients discharged before their bill is finalised.\n- Wrong tariff: services billed at a lower rate than the price list or the payor's agreed tariff, often because the billing system carries an old price.\n- Discounts and waivers: price reductions given at the point of billing, with or without authority.\n- Write-offs: balances removed from the books after the event, for patients or payors.\n- Pharmacy: drugs and consumables dispensed but not billed, or billed below the intended price.\n- Laboratory and imaging: tests run but not billed, especially walk-in and repeat tests.\n- Cash handling: money received but not banked or not posted.`,
              `The charge capture file audit covered earlier in this track compares documented services with billed services for a sample of patients. It finds the first hole well. It does not find the others, because a waived bill, a stock shortfall or an unposted cash receipt can sit behind a file where the bill matches the notes perfectly.`,
              `Size every hole on the same basis: the annualised naira value and its share of gross revenue. Kestrel Specialist Hospital bills N1.2bn a year. A pharmacy gap of N3m a month is N36m a year, 3% of gross revenue. A waiver pattern of N800k a month is under 1%. Ranking holes by annual value tells management where the first month of effort should go.`,
              `Be honest about confidence. Some holes are measured directly from records; others are estimates built from samples and ratios. Report the method beside each number. A board will act on a N36m pharmacy figure it believes and argue for weeks about a N60m total it does not.`,
            ),
          },
          {
            title: "Discounts, waivers and write-offs",
            body: p(
              `Discounts, waivers and write-offs are legitimate tools that become leakage when nobody controls who gives them, how much, and why. The audit question is not whether they exist but whether each one was authorised and recorded.`,
              `A discount reduces the price before the bill is settled, for example a corporate rate or a staff family rate. A waiver cancels part or all of a bill, often on compassionate grounds or at a consultant's request. A write-off removes a balance already on the books because the hospital no longer expects to collect it. All three reduce revenue that was earned.`,
              `The control that matters is an authority matrix: who may approve what, up to what value, and with what record. A typical matrix lets a cashier apply only published discounts, lets the billing supervisor approve waivers up to a modest limit, and sends anything larger, and every write-off, to the finance manager or medical director with a written reason. Every reduction is logged with the bill number, amount, reason and approver.`,
              `To test it, pull the full list of discounts, waivers and write-offs for three to six months from the billing system, or reconstruct it by comparing gross bills with amounts settled. Then look for patterns:`,
              `- Reductions given by staff who have no authority to give them.\n- One cashier, shift or consultant accounting for a share of waivers far above their share of patients.\n- Waivers clustered just under the approval limit.\n- Staff and family discounts applied to patients who are neither.\n- Write-offs of HMO balances that were never appealed, or of patient balances never chased.`,
              `Handle what you find procedurally. A pattern is a question about the control, not a finding about a person, and most patterns have an ordinary cause such as an unclear policy or a consultant's habit. Report the gap in the control, recommend the matrix and log, and let management follow up any individual case through its own process. That approach gets the controls fixed and keeps the staff working with you.`,
            ),
          },
          {
            title: "Pharmacy and laboratory leakage",
            body: p(
              `Pharmacy and laboratory leakage is found by reconciling what was consumed with what was billed. You do not need to trace individual patients: the stock and the reagents tell you how much activity there was.`,
              `For the pharmacy, start with the stock equation at cost for a month or a quarter: opening stock plus purchases minus closing stock equals consumption. Then work out what that consumption should have produced in revenue at the hospital's pricing policy, and compare it with pharmacy revenue actually billed.`,
              `At Kestrel, opening stock was N18m, purchases N42m and closing stock N20m, so consumption at cost was N40m. The hospital prices drugs at cost plus 40%, so N40m of consumption should have produced about N56m of revenue. Billed pharmacy revenue was N52m, a gap of N4m. Recorded expiries and damages were N1m at cost, worth about N1.4m at selling price. That leaves around N2.6m of unexplained gap for the period.`,
              `The unexplained gap then has to be broken down. The usual causes are ward stock issued to nurses and used without being charged, items given to staff, theatre consumables not billed, prices in the billing system below the policy, and stock counts that are wrong. Each needs its own test: a sample of ward issues against ward charges, a check of system prices against the price list, a supervised recount of high-value lines.`,
              `For the laboratory, compare reagent use with tests billed. A reagent kit yields a known number of tests. If the lab used 30 kits of a test that yields 100 per kit, it had capacity for 3,000 tests. Allow for controls, calibration and repeats, say 10%, and roughly 2,700 patient tests should have been run. If 2,100 were billed, around 600 tests are unaccounted for. Then check the lab register against billing for a sample of days, and look at walk-in patients who pay cash at the lab bench.`,
              `Imaging can be tested the same way, using the machine's own exam log against billed scans.`,
            ),
          },
          {
            title: "Running the audit and closing the holes",
            body: p(
              `A leakage audit is only worth doing if each hole ends up with an owner, a control and a re-test date. The work has a simple shape: request data, test each hole, size it, agree causes with the people who run the process, and fix.`,
              `The data request should go in on day one, because hospitals take time to produce it. For three to six months you need the billing system's transaction list, the discount, waiver and write-off records, pharmacy stock reports and purchase invoices, the lab register and reagent issues, the imaging log, daily cash summaries and bank statements, and the current price list and payor tariffs. Where systems are weak, you will rebuild some of this from paper registers.`,
              `Triangulate wherever you can. A theatre register, a consumables issue log and a bill all describe the same operation. When two of three agree and the bill does not, you have found leakage. When all three disagree, you have found a record-keeping problem, which needs fixing before leakage can be measured at all.`,
              `Agree each finding with the department before it goes to leadership. The pharmacist may know that N1m of the gap is a stock count error from the move to a new store. The lab manager may know that a batch of reagents was spoiled by a power cut. Testing these explanations with evidence, and correcting your numbers where they hold, makes the final report much harder to dismiss.`,
              `The report sets out each hole with its annual value, method, likely causes, control and owner. Controls should be specific: an authority matrix with values, a daily reconciliation of ward issues against charges, a monthly reagent-to-test reconciliation signed by the lab manager, a weekly report of discharged patients with unfinalised bills. Then set a re-test about 60 to 90 days later, repeating the same tests. The re-test is the evidence that the money is being recovered, and it is what turns an audit into a result.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Size the holes at Palmgrove Hospital",
            instruction:
              "Palmgrove Hospital, Ibadan, bills N720m a year. For the last quarter: pharmacy opening stock N9m, purchases N27m, closing stock N8m, pricing policy cost plus 35%, billed pharmacy revenue N33m, recorded expiries N0.6m at cost. The lab used 24 kits of a malaria antigen test yielding 50 tests per kit (allow 8% for controls and repeats) and billed 950 such tests. Waivers totalled N2.1m, of which N1.4m was approved by a single consultant above the N50k limit he holds. Calculate the pharmacy gap, the unbilled malaria tests and their value at N3,500 each, and annualise all three findings as a share of gross revenue. Rank them and propose one control and one owner for each.",
          },
          {
            title: "Write the waiver finding",
            instruction:
              "Using the Palmgrove waiver pattern above, write the finding as it would appear in the report to the medical director: the control gap, the annual value, the evidence, and the recommended control, in no more than 150 words. Do not name or imply wrongdoing by any individual.",
          },
        ],
      },
      resources: { tools: ["Leakage audit data request list", "Pharmacy stock reconciliation template", "Reagent-to-test reconciliation template"] },
      questions: [
        mc(
          "A charge capture file audit at a hospital finds that bills match clinical notes in almost every sampled file. The finance director concludes there is no leakage. Why is that conclusion unsafe?",
          [
            "File audits always understate leakage by about half",
            "The sample was probably too small to detect leakage, so the audit should be repeated with several hundred files",
            "Waivers, stock gaps, unbilled lab tests and unposted cash can all sit behind files whose bills match the notes",
            "Matching files prove only that the coders are accurate",
          ],
          2,
          "A file audit tests one hole, unbilled services in the record; the other holes need their own tests. Sample size could matter, but even a large file sample cannot see a waiver or a stock gap.",
        ),
        mc(
          "Kestrel bills N1.2bn a year. The audit finds a N3m monthly pharmacy gap and a N800k monthly waiver problem. How should these be presented to leadership?",
          [
            "As a combined N3.8m a month, so leadership sees one clear total and does not get lost in the detail",
            "Pharmacy at N36m a year (3% of revenue) ahead of waivers at about N9.6m, with the method for each",
            "Waivers first, because they involve staff behaviour and so carry the greatest reputational risk for the hospital",
            "As percentages of pharmacy revenue and waiver revenue only",
          ],
          1,
          "Sizing each hole on the same annual basis and as a share of gross revenue lets management rank them, and stating the method builds confidence. Combining them hides which fix comes first.",
        ),
        mc(
          "Opening pharmacy stock is N18m, purchases N42m and closing stock N20m, all at cost. The pricing policy is cost plus 40%. What revenue should the period's consumption have produced?",
          ["N84m", "N56m", "N42m", "N40m"],
          1,
          "Consumption is N18m + N42m - N20m = N40m at cost, and at cost plus 40% that should produce N56m. N40m is consumption at cost, a common stopping point before the markup is applied.",
        ),
        mc(
          "A lab used 30 kits of a test that yields 100 tests per kit. Allowing 10% for controls and repeats, how many patient tests would you expect to see billed?",
          ["3,000", "2,700", "3,300", "2,100"],
          1,
          "30 kits give capacity for 3,000 tests, and removing 10% for controls and repeats leaves about 2,700. Using 3,000 ignores tests that are run but never billable.",
        ),
        mc(
          "One consultant accounts for 40% of all waivers, though his patients are 10% of admissions, and most of his waivers fall just under the N50k approval limit. How should the audit report this?",
          [
            "As a control gap in waiver tracking, with the pattern as evidence and individual cases left to management",
            "As probable misconduct by the consultant, naming him",
            "Not at all, since consultants are entitled to waive fees for their patients",
            "By recommending that the consultant's waiver authority be withdrawn immediately and his past waivers reviewed one by one",
          ],
          0,
          "A pattern is a question about the control, and reporting it procedurally gets the matrix fixed while leaving individual cases to management. Naming someone as probable misconduct goes beyond what a pattern can prove.",
        ),
        ms(
          "Pharmacy consumption should have produced N56m but N52m was billed. Which are plausible causes worth testing? Select all that apply.",
          [
            "Ward stock issued to nurses and used without being charged",
            "Drug prices in the billing system set below the pricing policy",
            "A closing stock count that overstated or understated what was on the shelves",
            "Patients choosing generic rather than branded drugs",
          ],
          [0, 1, 2],
          "Uncharged ward stock, wrong system prices and count errors are the usual causes of a stock-to-revenue gap. Generic substitution changes what is bought and sold but is already reflected in both consumption at cost and its markup, so it does not create a gap.",
        ),
        mc(
          "For a sample of operations, the theatre register and the consumables issue log agree, but the patient bill shows fewer items. What have you found?",
          [
            "A record-keeping problem, which must be fixed before any leakage in theatre can be measured reliably",
            "Evidence of theft from theatre",
            "A coding error",
            "Likely leakage: two independent records agree the items were used, and the bill does not",
          ],
          3,
          "When two independent records agree and the bill differs, the bill is the likely failure point. A record-keeping problem is when all three disagree, so there is no reliable basis for any conclusion.",
        ),
        mc(
          "Your draft shows a N4m lab gap. The lab manager says a batch of reagents was spoiled during a three-day power outage. What should you do?",
          [
            "Keep the N4m as it stands, because department managers will always have an explanation for any gap found",
            "Remove the lab finding from the report",
            "Ask for evidence such as the disposal record and generator log, and adjust the figure if it holds",
            "Halve the figure as a compromise",
          ],
          2,
          "Testing explanations with evidence and correcting numbers where they hold makes the report harder to dismiss. Ignoring the explanation risks a wrong number that undermines every other finding.",
        ),
        mc(
          "Which control is most likely to stop discharged patients leaving with unfinalised bills?",
          [
            "A weekly report of discharged patients with unfinalised bills, owned by the billing supervisor",
            "A general reminder to ward staff and doctors that every discharge must be billed before the patient leaves",
            "A higher deposit for every patient",
            "An annual audit of discharge bills",
          ],
          0,
          "A specific report with an owner and a frequency exposes the cases while they can still be fixed. An annual audit finds the problem months after the money is lost.",
        ),
        mc(
          "Three months after a leakage audit, the hospital wants to know whether the controls worked. What gives the best evidence?",
          [
            "A staff survey on awareness of the new controls",
            "Comparing total revenue before and after",
            "A meeting at which each department head confirms in writing that the agreed controls are now in place",
            "Re-running the same tests on recent data and comparing the gaps with the original findings",
          ],
          3,
          "Repeating the tests measures whether each hole has narrowed. Total revenue moves for many reasons, such as volume and prices, so it cannot isolate the effect of the controls.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "rcm-kpis-weekly-review",
      name: "Revenue Cycle KPIs and the Weekly Review",
      description:
        "A short set of revenue cycle KPIs that follow the patient from registration to posted cash, how to define each so it cannot be argued with, and how to run the weekly review that turns them into action.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "A short set of KPIs that follows the cycle",
            body: p(
              `A hospital needs about ten revenue cycle KPIs, chosen so that each stage of the cycle has at least one and each KPI has a single owner. A list of forty measures produces a monthly report nobody reads; a list of ten can be reviewed every week.`,
              `At the front of the cycle:`,
              `- Eligibility verification rate: share of insured patients verified before service.\n- Registration error rate: share of sampled registrations with a wrong or missing payor detail.\n- Point-of-service collection rate: patient-owed amounts collected at or before service, as a share of the total due.\n- Deposit coverage: deposits held against the running bills of self-pay inpatients.`,
              `In the middle:`,
              `- Charge lag: average days between a service and its charge being posted.\n- Discharged not final billed (DNFB): the number and value of discharged patients whose bill is not yet final, and how many days old they are.`,
              `At the back, up to the point the claim leaves and the cash arrives:`,
              `- Claim submission lag: days from discharge or service to claim submission, by payor.\n- Clean claim rate: share of claims that pass the hospital's own pre-submission check without correction.\n- Cash posting lag: days between money reaching the bank and being posted against bills.\n- Unapplied cash: money received but not yet matched to a bill or claim.`,
              `Two headline measures sit above these: gross days in receivables, and the payor rejection rate as a signal fed back from outside. Managing the payor relationship itself belongs to the Payor & Claims Management track, but a rising rejection rate for a reason like wrong enrollee ID is a front-end KPI failing, and belongs in this review.`,
              `Pick measures you can actually produce. If the hospital system cannot calculate charge lag, start with DNFB counted manually from the discharge register each Monday. A rough measure reviewed every week does more good than a precise one that arrives once a quarter.`,
            ),
          },
          {
            title: "Defining each KPI so it cannot be argued with",
            body: p(
              `A KPI only works if everyone calculates it the same way, so each one needs a written definition covering the numerator, the denominator, the source, the frequency, the owner and the target. Without that, the first bad week turns into a debate about the number instead of a discussion of the cause.`,
              `Take the clean claim rate. A loose definition says "claims without errors". A usable one says: number of claims submitted in the week that passed the pre-submission checklist with no correction, divided by the number of claims prepared in the week; source, the billing team's checklist log; owner, the billing supervisor; target, 90% or better. Now nobody can count claims corrected on the last day as clean, or leave out the batch prepared but not yet sent.`,
              `DNFB needs similar care. Is it counted from discharge or from the last service? Does a bill waiting for an HMO authorisation count, or a bill held because the doctor has not completed the discharge summary? Write the rule down: every discharged patient whose final bill is not approved, counted from the discharge date, with a reason code for the hold. The reason codes are often more useful than the total, because they show which department is holding the bills.`,
              `Targets should start from the hospital's own baseline. If the current submission lag is 18 days, a target of 3 days next month will be ignored. Set a target that the owner believes is reachable in a quarter, such as 10 days, and tighten it once it is met.`,
              `Segment where the average hides the problem. A claim submission lag of 9 days across all payors may be 4 days for the two largest HMOs and 30 days for a state scheme whose portal the team finds difficult. Show the KPI by payor, by ward or by shift where the cause is likely to sit there.`,
              `Keep one sheet, the KPI dictionary, that holds every definition. Give it to anyone who joins the review, and change a definition only by agreement, with a note of the date.`,
            ),
          },
          {
            title: "Running the weekly review",
            body: p(
              `The weekly review is a 45 to 60 minute meeting where KPI owners report their numbers, explain any that are off target, and commit to specific actions with dates. Its value comes from being held every week, at the same time, with the same agenda.`,
              `The people in the room are the owners of the KPIs: front desk and patient access lead, nursing representative for charge capture, pharmacy and laboratory leads, billing supervisor, accounts officer for cash posting, and the finance manager or revenue cycle lead in the chair. The medical director or chief operating officer should attend at least monthly so that clinical departments take it seriously.`,
              `A workable agenda:`,
              `- Last week's actions: done, not done, and why (10 minutes).\n- The KPI sheet, red and amber items only, each explained by its owner (25 minutes).\n- One deep dive: a single problem looked at in detail, rotated weekly (15 minutes).\n- New actions read back, each with an owner and a date (5 minutes).`,
              `Use simple thresholds so the meeting does not spend time on what is going well. Green is on target, amber is within an agreed band, red is outside it. Only amber and red are discussed.`,
              `The actions register is the most important document the meeting produces. Each action names one person, a specific step and a date: "Billing supervisor to clear the 14 DNFB cases older than 7 days by Friday" rather than "improve billing turnaround". An action that is carried forward three weeks in a row is escalated to the chair, who either removes the obstacle or changes the action.`,
              `Prepare the sheet before the meeting. Whoever produces it, often an analyst, should circulate it the afternoon before so owners arrive knowing their numbers. A meeting that starts by waiting for the report to print has already lost its purpose.`,
              `Over a quarter, the review should show a small number of KPIs moving steadily to target. If every number is red every week, the targets or the definitions are wrong, or the review has become a reporting ritual without consequences.`,
            ),
          },
          {
            title: "Reading the numbers without being fooled",
            body: p(
              `KPIs can mislead in a few predictable ways, and the person preparing the sheet should check for each before the meeting rather than discover it in front of the chair.`,
              `Averages hide tails. An average charge lag of 1.5 days can contain a handful of theatre cases at 12 days, which are the expensive ones. Show the share of items over a threshold, such as the number of DNFB cases older than 7 days, alongside the average.`,
              `Measures can be gamed. If the clean claim rate is rewarded, claims that need correction may simply be held back and not counted. If DNFB is the focus, bills may be finalised with charges missing just to clear the list. Pair measures that pull against each other: DNFB with a sample check of finalised bills for missing charges, submission lag with the payor rejection rate.`,
              `Volume changes distort ratios. A fall in the point-of-service collection rate during a busy week may reflect more emergency admissions, where collection at the front is not appropriate, rather than worse performance at the desk. Look at the mix before blaming the team.`,
              `Revenue and cash are different. A week of strong billing and a week of strong cash receipts rarely coincide, because insured payments arrive on the payors' timetable. Track the measures the hospital controls, such as submission lag and posting lag, rather than judging the revenue cycle team on cash received in the week.`,
              `Unapplied cash grows quietly. Remittances that arrive as one lump sum with a separate advice, or transfers from patients with no reference, sit unapplied until someone matches them. While they sit there, receivables look larger than they are and the hospital may chase payors or patients who have already paid. A rising unapplied cash balance is a reason to look at posting before anything else.`,
              `Finally, check that the numbers agree with each other. If the DNFB count falls sharply but the number of claims submitted does not rise, the bills went somewhere other than to a payor. Find out where before reporting the improvement.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Write the KPI dictionary",
            instruction:
              "Marula Hospital, Lekki, has 90 beds, six HMOs, one state scheme and a self-pay share of about 35%. Its billing system can export bills, claims and payments with dates, but cannot produce charge lag. Choose eight KPIs for its weekly review. For each, write the numerator, denominator, source, frequency, owner and a starting target, given these baselines: claim submission lag 16 days, DNFB 42 cases (19 older than 7 days), point-of-service collection rate 48%, unapplied cash N22m.",
          },
          {
            title: "Read this week's sheet",
            instruction:
              "This week at Marula: DNFB fell from 42 to 18 cases, claims submitted rose from 210 to 214, clean claim rate rose from 82% to 95%, payor rejections on last month's claims rose from 9% to 14%, and unapplied cash rose to N31m. Write the three questions you would raise before the meeting, explain what each could reveal, and draft two actions for the actions register in the correct form.",
          },
        ],
      },
      resources: { tools: ["KPI dictionary template", "Weekly revenue cycle review sheet", "Actions register template"] },
      questions: [
        mc(
          "A hospital's billing system cannot calculate charge lag. The revenue cycle lead wants to delay the weekly review until a new system is installed. What is the better course?",
          [
            "Delay the review, because rough measures cause arguments that undermine confidence in the whole programme",
            "Start now with measures the hospital can produce, such as DNFB counted from the discharge register",
            "Ask the HMOs for their data instead",
            "Report charge lag monthly from estimates",
          ],
          1,
          "A rough measure reviewed weekly drives more improvement than a precise one months away. Using HMO data would measure the payor's view, not the hospital's internal process.",
        ),
        mc(
          "Which definition of the clean claim rate leaves the least room for argument?",
          [
            "Claims without errors, as judged by the billing team",
            "Claims the HMO accepted on first submission, taken from the remittance advices received each week",
            "Claims passing the pre-submission checklist uncorrected, over all claims prepared that week",
            "Claims submitted within 7 days of discharge",
          ],
          2,
          "It states the numerator, denominator and source, so nobody can count corrected claims as clean or leave out unsent batches. First-time HMO acceptance is a payor outcome, which belongs with rejection rate, not the hospital's own check.",
        ),
        mc(
          "The current claim submission lag is 18 days. The finance director wants a target of 3 days next month. What is the better approach?",
          [
            "Accept 3 days, because an ambitious target signals seriousness and pushes the team to rethink the whole process",
            "Set no target until the process has been redesigned",
            "Set the target at 18 days and hold it there",
            "Set a target the owner believes is reachable in a quarter, such as 10 days, and tighten it once met",
          ],
          3,
          "Targets far from the baseline tend to be ignored; a reachable step that is then tightened keeps the owner engaged. Holding the target at the baseline gives no pressure to improve.",
        ),
        mc(
          "The average claim submission lag is 9 days across all payors. What should the analyst check before the review?",
          [
            "The lag by payor, since one difficult portal could be hiding behind a good average",
            "Whether 9 days is better than last year",
            "The lag for self-pay patients",
            "The HMOs' average payment time, since slow payers usually explain a long submission lag",
          ],
          0,
          "Segmenting by payor shows whether one payor is far worse, which an average hides. Self-pay patients do not have claims submitted, so a submission lag for them is meaningless.",
        ),
        mc(
          "Which entry belongs in the actions register as written?",
          [
            "Improve billing turnaround across all wards so that DNFB falls steadily over the quarter",
            "Billing team to work harder on DNFB",
            "Billing supervisor to clear the 14 DNFB cases older than 7 days by Friday",
            "Review DNFB at next meeting",
          ],
          2,
          "An action names one person, a specific step and a date, so next week's review can check it. A general aim like improving turnaround cannot be done or not done.",
        ),
        mc(
          "An action has been carried forward unfinished for three weekly reviews. What should happen?",
          [
            "Carry it forward again until it is done",
            "Drop it from the register",
            "Give it to a different department with more capacity, so that the original owner can focus on the rest",
            "Escalate it to the chair, who removes the obstacle or changes the action",
          ],
          3,
          "Repeated carry-forward signals an obstacle the owner cannot clear alone, so the chair intervenes. Simply carrying it again turns the register into a list nobody acts on.",
        ),
        mc(
          "DNFB fell from 42 cases to 18 in a week, but the number of claims submitted barely changed. What is the right reading?",
          [
            "A clear improvement to report to the board, since DNFB is the measure the hospital most needed to move",
            "A sign that HMOs are paying faster",
            "A question first: where did the bills go, and were some finalised with charges missing?",
            "Evidence that the definition of DNFB is wrong",
          ],
          2,
          "Bills leaving DNFB should appear as submitted claims or settled self-pay bills, so a mismatch needs explaining before the improvement is reported. HMO payment speed has no bearing on DNFB.",
        ),
        ms(
          "Which pairings help stop a KPI being gamed? Select all that apply.",
          [
            "DNFB with a sample check of finalised bills for missing charges",
            "Claim submission lag with the payor rejection rate",
            "Clean claim rate with a count of claims prepared but held back",
            "Point-of-service collection rate with the number of HMOs signed",
          ],
          [0, 1, 2],
          "Each pair pulls against a likely shortcut: rushed bills, rushed claims and held-back claims. The number of HMOs signed has no link to how well the desk collects patient-owed amounts.",
        ),
        mc(
          "Unapplied cash rose from N22m to N31m in a week. Why should this be looked at before anything else?",
          [
            "Receivables look overstated, and staff may chase payors and patients who have already paid",
            "It means the bank has credited the wrong account and the transfers need to be traced with the bank",
            "It shows patients are paying more than they owe",
            "It means revenue fell",
          ],
          0,
          "Unmatched receipts make receivables look larger than they are and send collectors after money already received. A bank error is possible but rare, and the usual cause is lump-sum remittances or unreferenced transfers waiting to be matched.",
        ),
        mc(
          "In a busy week with many emergency admissions, the point-of-service collection rate fell from 60% to 51%. The chair wants to retrain the front desk. What should be checked first?",
          [
            "Whether the front desk staff were on leave",
            "Whether the patient mix changed, since emergency patients are not asked to pay before care",
            "Whether the HMOs paid on time that week, since late remittances drag every collection measure down",
            "Whether the target should be raised",
          ],
          1,
          "A shift towards emergency cases lowers the rate without any change in desk performance, so the mix needs checking before blaming the team. HMO payments do not affect patient-owed collections at the desk.",
        ),
      ],
    },
  ],
};

export default expansion;
