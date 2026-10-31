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
  slug: "health-economics-mne",
  topUp: [
    {
      moduleSlug: "cost-effectiveness-analysis",
      questions: [
        q(
          "A state is comparing a new community hypertension programme with current practice. The programme costs USD 90,000 a year more than current practice and averts 75 more DALYs a year. Using a threshold of one times GDP per capita, taken here as USD 1,500 per DALY, what is the right conclusion?",
          [
            "USD 1,200 per DALY averted: below the threshold, so cost-effective at that threshold",
            "USD 1,500 per DALY averted: exactly at the threshold, so the decision is finely balanced",
            "It cannot be calculated without the programme's total cost as well as its incremental cost",
            "USD 0.83 per DALY averted, so the programme is extremely cost-effective",
          ],
          "a",
          "The ICER is incremental cost divided by incremental effect: 90,000 / 75 = USD 1,200 per DALY, under the USD 1,500 threshold. The ICER uses incremental, not total, cost, and 0.83 comes from dividing the wrong way round.",
        ),
        q(
          "A team evaluating a new malaria test-and-treat model compares it with doing nothing at all, although every facility in the state already runs presumptive treatment. What is wrong with this analysis?",
          [
            "Nothing, since doing nothing is the standard comparator and makes results comparable across studies",
            "It should have used a high-income country comparator for rigour",
            "It should compare against the cheapest option on the market instead",
            "The comparator should be current practice, so the analysis overstates the gain the new model adds",
          ],
          "d",
          "The comparator is what would happen without the new option, which here is presumptive treatment. Comparing with doing nothing credits the new model with health gains the existing service already produces.",
        ),
        q(
          "Your CEA of a cervical screening programme shows USD 900 per DALY averted at the central estimate. When the effect size is set at the low end of the published range, the ICER rises to USD 5,200, above the threshold. What should you advise?",
          [
            "The decision hinges on effect size, so resolve it, for example through a costed pilot, before full scale-up",
            "Recommend full scale-up, because the central estimate is well under the threshold and that is what decisions use",
            "Drop the low effect size from the analysis since it is an outlier",
            "Reject the programme, because any scenario above the threshold makes it not cost-effective",
          ],
          "a",
          "When results flip across plausible ranges, the recommendation depends on resolving that input. Reporting only the central estimate hides the risk, while rejecting on a single pessimistic scenario ignores that the central case is favourable.",
        ),
        q(
          "A new point-of-care test for a state's TB programme costs less per patient than the current referral-to-laboratory pathway and detects more cases. How should the result be reported?",
          [
            "Report the ICER as a negative number and rank it against the threshold like any other result",
            "The analysis is invalid, because a new option cannot be both cheaper and better",
            "Report the ICER as zero, because the costs net out",
            "The new test dominates current practice, so it is preferred without a threshold test",
          ],
          "d",
          "An option that is cheaper and more effective dominates and is preferred on cost-effectiveness grounds. Negative ICERs are not meaningful to rank, because a negative ratio can also come from an option that is dearer and worse.",
        ),
        q(
          "A ministry is choosing between three mutually exclusive options. Option A costs USD 40,000 and averts 100 DALYs. Option B costs USD 100,000 and averts 130 DALYs. A consultant reports B at USD 769 per DALY (100,000 / 130). What is the error?",
          [
            "B should have been divided by A's DALYs",
            "The figure should be expressed per life-year, not per DALY",
            "B should be judged on its incremental cost per DALY over A, which is USD 2,000 per DALY, not its average ratio",
            "There is no error, since average cost-effectiveness ratios are the standard way to compare options in a ministry",
          ],
          "c",
          "Between mutually exclusive options, B is judged on what it adds over A: 60,000 / 30 = USD 2,000 per DALY. The average ratio of USD 769 makes B look far better value than the extra spending really is.",
        ),
      ],
    },
    {
      moduleSlug: "logframe-mne-design",
      questions: [
        q(
          "In the logframe for a community case management programme in three LGAs, where does the indicator 'proportion of children under five with fever who received treatment within 24 hours' belong?",
          [
            "Outcome, because it measures the change in service use that the outputs are meant to produce",
            "Output, because the programme itself delivers the treatment through the CHWs it trained and supplied",
            "Impact, because it concerns child health",
            "Input, because treatment requires drugs",
          ],
          "a",
          "Prompt treatment is the behaviour and service-use change the outputs (trained CHWs, stocked drugs) are meant to produce, so it sits at outcome level. Impact would be a change in child mortality or morbidity.",
        ),
        q(
          "A maternal health theory of change assumes that referral transport from PHCs to the general hospital works. Midway through, the state's ambulance contract lapses. What does a well-built M&E framework do with this?",
          [
            "Nothing until the final evaluation, because assumptions sit outside the programme's control and are tested at the end",
            "Replace the outcome indicator with one that is easier to hit",
            "Drop the referral link from the theory of change",
            "Track the assumption as a monitored condition, flag that outcome results are now at risk, and prompt a response",
          ],
          "d",
          "Assumptions are made explicit so that they can be monitored and acted on during implementation. Waiting for the final evaluation turns a fixable problem into an unexplained failure.",
        ),
        q(
          "A draft indicator reads 'improved immunisation services in target LGAs'. Which rewrite best passes the SMART test?",
          [
            "Better immunisation coverage across all target LGAs as soon as possible",
            "More children vaccinated in the target LGAs compared with other LGAs",
            "Penta3 coverage among children aged 12 to 23 months in the three target LGAs rises from 48% to 65% by December 2027, measured from DHIS2 and verified by survey",
            "Number of immunisation sessions held",
          ],
          "c",
          "Only option c names the population, measure, baseline, target, date and source. The session count is measurable but tracks an activity rather than the change the original wording was reaching for.",
        ),
        q(
          "A programme reports that 70% of women in its LGAs now deliver in a facility. The funder asks whether gains reached the poorest wards and adolescent mothers. The framework collected only LGA totals. Which design choice was missed?",
          [
            "The indicator should have been defined at impact level",
            "A theory of change should have replaced the logframe, since only a theory of change explains who benefits",
            "Reporting should have been quarterly instead of annual",
            "Disaggregation by age, ward and wealth should have been specified in the indicator plan from the start",
          ],
          "d",
          "Disaggregation must be designed in, because data not collected by sub-group cannot be split later. Reporting frequency does not help answer who benefited.",
        ),
        q(
          "A board asks why the programme needs both a theory of change and a logframe. Which answer is correct?",
          [
            "The logframe sets out the results chain and its indicators; the theory of change explains why that chain should work",
            "They are the same document under two names, kept to satisfy different donors",
            "The theory of change holds the indicators and targets, and the logframe holds the budget, workplan and activity schedule",
            "The logframe is for the final evaluation and the theory of change is for monthly monitoring",
          ],
          "a",
          "The logframe is the accountability structure; the theory of change states why and under what conditions it should work. Indicators sit in the logframe, not the theory of change.",
        ),
      ],
    },
  ],
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "service-costing-methods",
      name: "Costing Health Services for Evaluation and Tariffs",
      description:
        "How to build defensible unit costs for health services with step-down, bottom-up and activity-based methods, and how those costs feed an economic evaluation or a public tariff.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Fix the purpose before you collect a number",
            body: `A unit cost is only correct for a stated purpose. The same caesarean section in a state general hospital can honestly cost N180,000, N260,000 or N410,000, depending on what the figure is for, whose costs count and which year's prices are used. Settle three choices before any data collection starts.

Perspective decides whose costs are counted. A provider perspective counts what the facility spends. A payer perspective counts what the scheme or ministry pays. A societal perspective adds what households lose: transport, time off work, food while a relative is on the ward and informal payments. A cost-effectiveness study for a ministry usually takes a health system or societal view. A tariff study takes the provider's view, because the tariff exists to reimburse providers.

Financial cost is money actually spent. Economic cost is the value of every resource used, whether or not anyone paid for it: vaccines and antiretrovirals supplied free through vertical programmes, a building the state owns outright, corps members whose allowance is paid federally, volunteer community health workers. An evaluation asking whether a programme is worth copying needs economic cost, because the next state may have to pay for what this one received free. A tariff needs financial cost plus a fair allowance for capital, because that is what the provider must recover.

Price year and currency come last but cause the most trouble. Nigerian input prices move fast and imported consumables follow the exchange rate. State one price year, inflate or deflate everything to it with a named index, and record which items were bought in dollars and at what rate. A costing that mixes 2023 salaries with 2026 drug prices is not the cost of anything.

Write these choices at the top of the costing workbook, in plain words, before the first tab of data. When a ministry official or a provider association disputes your figure, the dispute is usually about one of these three choices and not about the arithmetic. Having them stated lets you settle it in one meeting.`,
          },
          {
            title: "Step-down costing: from the ledger to the department",
            body: `Step-down costing is the standard top-down method for a whole facility. It starts from total spending and pushes it down to the departments where patients are treated, then divides by output.

Begin with every source of spending for one year: the facility's own ledger, staff costs from the state payroll, budget releases for the facility, and donated inputs at economic value if the study needs them. In public hospitals the ledger often shows only a fraction of the real cost, because doctors and nurses are paid through the state payroll or the Hospitals Management Board. Get the payroll by name and grade and attach it to departments, or the costing will understate staff, usually the largest cost.

Group the departments into three kinds of cost centre. Overhead centres support everyone: administration, security, cleaning, power, maintenance, medical records. Intermediate centres provide services to other departments: laboratory, radiology, pharmacy, theatre. Final centres are where patients receive care: outpatients, maternity, the wards, the emergency unit.

Allocate overheads using bases that reflect how each one is consumed:
- Cleaning and security by floor area
- Administration and HR by staff headcount
- Power by estimated load hours or metered use
- Maintenance by number of work orders

Power deserves care in a generator-run hospital, where diesel is often the largest overhead. Floor area is easy but wrong: an administration block that closes at 4pm uses far less power per square metre than a maternity unit with incubators and theatre lights running all night. In a 120-bed hospital with N96m of power cost, maternity holding 15% of floor area but 22% of load hours receives N14.4m by area and N21.1m by load. Across 2,400 deliveries that is about N2,800 per delivery from one allocation choice, and there are a dozen such choices in every costing.

Order matters in step-down, because a centre that has been allocated receives nothing back. Allocate first the overhead that serves the most other centres. The direct method, which skips allocation between overheads, is usually close enough for a small facility. Intermediate centres then go to final centres by use: laboratory by weighted test counts, pharmacy by value dispensed, theatre by theatre minutes.

The output is an average. A cost per ward bed day hides the difference between a high-dependency bed and a general bed, which is why a specific service needs the methods that follow.`,
          },
          {
            title: "Bottom-up and activity-based costing for a specific service",
            body: `When a payer needs the cost of one service, such as a normal delivery or a caesarean section, build it from the bottom up. List every resource one episode consumes, multiply quantity by unit price, and add a share of overheads from a step-down. This is the ingredients approach, also called micro-costing.

For a normal delivery the list covers midwife and doctor time, the delivery kit, gloves, oxytocin and other drugs, the tests in the protocol, the bed days and the meals if the facility provides them. Quantities come from direct observation, treatment protocols, review of a sample of case notes and interviews with staff. The method is accurate for the service in question but costly to run and only as good as the sample. A protocol says one thing and the ward does another, so observe or review records rather than relying on the protocol alone.

Time-driven activity-based costing (TDABC) is the cleanest way to cost staff and equipment time. For each resource it needs two figures. The capacity cost rate is the cost of supplying the resource divided by its practical capacity in minutes. The time used is the minutes the activity takes. A theatre nurse costing N7.2m a year with practical capacity of 1,600 hours (96,000 minutes) costs N75 a minute, so a caesarean using 90 nurse-minutes carries N6,750 of nurse time.

Practical capacity is paid time less leave, training, handovers and breaks, commonly around four-fifths of paid hours. Dividing by paid hours understates the unit cost. Dividing by the minutes actually used does the opposite and loads every idle minute onto the patients who did come.

Idle capacity is the central judgement in any costing. Suppose a theatre runs at 40% of its practical capacity. The real cost per case at that facility is high, because the cost of the empty sessions is shared among few cases. For an evaluation you report the cost as it is and show utilisation beside it, since that is the cost the system bears. For a tariff you usually price at a normative utilisation, so the tariff does not reward a facility for keeping expensive capacity idle. State which you have done.

Many studies use a hybrid: bottom-up for the direct costs of the service being priced, step-down for the overheads it shares with everything else. This is acceptable as long as the overheads are not counted twice.`,
          },
          {
            title: "Capital, donated inputs and the Nigerian cost base",
            body: `Buildings, equipment and vehicles last longer than a year, so their cost must be spread across the years they serve. Do not book the purchase price in the year of purchase, and do not use the book depreciation from the accounts.

Annualise capital using an equivalent annual cost: the replacement value divided by an annuity factor for the item's useful life and a chosen discount rate. An ultrasound machine with a replacement value of N24m, a seven-year life and a 10% rate has an annuity factor of 4.868, giving an annual cost of N4.93m. Straight-line depreciation would give N3.43m and understate the cost, because it ignores the return the money could have earned elsewhere.

Use replacement value rather than historical cost. A machine bought for N6m in 2018 costs several times that to replace after the naira's devaluation, and the historical figure tells you nothing about what keeping the service running requires. The discount rate depends on purpose. Economic evaluations usually follow international guidance, which commonly uses a low social rate such as 3%. A tariff should reflect what capital actually costs a Nigerian provider, which is much higher. Report the rate and show the effect of changing it.

Donated inputs need a decision. Vaccines supplied through NPHCDA with Gavi support, antiretrovirals, TB drugs and malaria commodities from vertical programmes cost the facility nothing. An evaluation should include them at economic value. A tariff can exclude them only if the scheme is confident the supply will continue, and the costing should show what the tariff would need to be if it did not. The abrupt cut in some external funding in 2025 showed that this is not a theoretical risk.

Shared staff are the most common source of error. A medical officer who covers outpatients in the morning and the wards in the afternoon must be split by time, from time sheets, a short time-and-motion sample or structured interviews, not assigned wholly to the department on the staff list.

Use actual spending and releases, not appropriations. A state budget line that was appropriated but never released did not buy any care. In facilities where cash releases are irregular, take several years and look for the pattern, because a single year can be unrepresentative.`,
          },
          {
            title: "From unit cost to tariff",
            body: `A tariff is a price that a payer or regulator sets. A unit cost is evidence for that price, not the price itself. The work from costing to tariff is a series of explicit judgements that the costing team should set out for the decision-maker, not make silently.

Start with a sample that represents the providers the tariff will pay: primary and secondary, public, mission and private, urban and rural. Cost each with the same method and the same price year. Unit costs will spread widely. In a costing of caesarean sections across 12 facilities the results might run from N210,000 to N460,000 with a median of N285,000.

Then choose a reference point. The mean is pulled up by a few high-cost sites. The median is more stable. Some payers choose an efficient benchmark, such as the cost at a lower percentile or the cost recalculated at normative utilisation. Look at why the expensive sites are expensive. If the two dearest run theatre at a quarter of capacity, pricing at their cost would reward idle capacity across the whole network. A better design is to set the tariff near the efficient level and, if those facilities must stay open to serve remote communities, pay them a separate availability grant. This keeps the tariff honest and makes the subsidy visible.

Define the bundle precisely. A caesarean tariff must say what it includes: pre-operative tests, theatre, anaesthesia, drugs, a stated number of bed days, the post-operative review. Without a definition, providers unbundle and bill items separately, and the payer pays twice.

Check budget impact before the tariff is published. Multiply each tariff by expected volume and compare the total with the pool's revenue. If it does not fit, the payer must narrow the package, phase it, or raise revenue. Cutting the tariff below cost to make the arithmetic work only moves the deficit to providers, who respond by charging patients extra or turning them away.

Build in indexation and a review date. Nigerian scheme tariffs have historically gone years between reviews while input prices rose, and providers responded by rationing care or levying informal top-up charges. A tariff indexed to a named price measure, with a full costing review on a fixed cycle, keeps the network intact.

The method here serves the body setting the price. A hospital negotiating its own rates with an HMO uses some of the same evidence for a different purpose, covered in the finance domain.`,
          },
        ],
        exercises: [
          {
            title: "Step-down a cottage hospital",
            instruction: `A 60-bed state cottage hospital spent N420m last year. Overheads: administration N60m, power and generator N54m, cleaning and security N30m. Direct costs of the final centres: outpatients N96m, maternity N110m, inpatient ward N70m. Staff headcount: outpatients 40, maternity 55, ward 45. Share of estimated power load: outpatients 20%, maternity 50%, ward 30%. Floor area: outpatients 1,500 sqm, maternity 1,000 sqm, ward 1,500 sqm. Annual output: 36,000 outpatient visits, 1,800 deliveries, 14,000 bed days.

Using the direct method, allocate each overhead with the base given and compute the unit cost per outpatient visit, per delivery and per bed day. Then recompute maternity with power allocated by floor area and state the difference per delivery. Write three lines to a state official saying which base you used for power and why.`,
          },
          {
            title: "Set a delivery tariff for a state scheme",
            instruction: `A state health insurance agency wants a tariff for normal delivery in accredited PHCs. Your costing of 10 facilities, all in 2026 prices, gives unit costs of N18,000, N21,000, N22,500, N24,000, N25,000, N26,000, N27,500, N31,000, N48,000 and N52,000. The two highest facilities conduct fewer than 15 deliveries a month against a capacity of 60. The agency expects 40,000 deliveries a year and has N1.1bn for the benefit.

Recommend a tariff, the bundle it covers and how to treat the two high-cost facilities. Show whether the budget fits and what you would advise if it does not.`,
          },
        ],
      },
      resources: { tools: ["Microsoft Excel", "WHO-CHOICE costing guidance", "TDABC time-capture template"] },
      questions: [
        q(
          "A state ministry asks you to cost a free maternal care programme so that two neighbouring states can decide whether to copy it. Delivery kits are supplied free by a donor. How should the kits be treated?",
          [
            "Exclude them, because the costing should show only what the state itself spent from its own budget",
            "Include them at economic value, because a state copying the programme may have to buy them",
            "Include them at half value to reflect uncertainty about the donor",
            "Include them only in the financial cost, not the economic cost",
          ],
          "b",
          "An evaluation for replication needs economic cost, which values every resource used, paid for or not. Excluding the kits would understate what the neighbouring states would actually need to fund.",
        ),
        q(
          "A generator-run hospital allocates N96m of power cost by floor area. Maternity and theatre run all night with incubators and lights; the large administration block closes at 4pm. What does this do to the unit costs?",
          [
            "Maternity and theatre unit costs are understated and administration-heavy centres are overstated",
            "Nothing, because the total cost allocated is the same",
            "Maternity is overstated because it has more floor area than administration",
            "The error cancels out once the intermediate centres, theatre and laboratory included, are allocated to the final centres",
          ],
          "a",
          "Power use per square metre is far higher in round-the-clock units, so floor area shifts their cost onto low-use areas. The total being unchanged does not make the distribution right, and the error carries through to final centres.",
        ),
        q(
          "A theatre nurse costs N7.2m a year. Practical capacity is 96,000 minutes; paid hours are 2,080 a year. A caesarean uses 90 nurse-minutes. What nurse cost should be assigned to one caesarean?",
          ["N5,190", "N75", "N6,750", "N9,000"],
          "c",
          "The capacity cost rate is N7.2m / 96,000 = N75 a minute, times 90 minutes is N6,750. Using paid hours (124,800 minutes) gives about N5,190 and understates the cost by treating leave and breaks as available time.",
        ),
        q(
          "An ultrasound machine has a replacement value of N24m, a seven-year useful life, and the costing uses a 10% rate, for which the annuity factor is 4.868. What annual capital cost should go into the costing?",
          [
            "N3.43m, the straight-line depreciation",
            "N2.40m, a tenth of the value each year",
            "N24m in the year of purchase and nothing after",
            "N4.93m, the equivalent annual cost",
          ],
          "d",
          "N24m / 4.868 = N4.93m. Straight-line depreciation at N3.43m ignores the opportunity cost of capital, and booking the whole price in one year distorts every year's unit cost.",
        ),
        q(
          "A state scheme is setting a caesarean tariff. Costs across 12 facilities range from N210,000 to N460,000, median N285,000. The two dearest run theatre at 25% of capacity but serve riverine communities with no alternative. What is the soundest approach?",
          [
            "Pay every facility its own cost so that none makes a loss",
            "Price near the efficient level and fund the two remote sites through a separate availability payment",
            "Set the tariff at the mean of all 12 facilities, since the mean already reflects the higher cost of the remote sites",
            "Set the tariff at N210,000, the lowest cost observed, to push efficiency",
          ],
          "b",
          "Pricing at the cost of under-used sites would reward idle capacity across the network; a separate payment keeps access and makes the subsidy visible. The lowest observed cost may be below what most facilities can deliver at, and would push them out of the network.",
        ),
        q(
          "In step-down costing, which overhead centre should normally be allocated first?",
          [
            "The overhead that serves the largest number of other centres",
            "The overhead with the largest total cost, since it moves unit costs most",
            "The overhead the medical director considers most important",
            "The overhead with the most staff",
          ],
          "a",
          "Once a centre is allocated it receives nothing back, so the one serving the most others goes first to keep the cross-flows as accurate as possible. Size alone does not determine the order.",
        ),
        q(
          "You are building an economic cost for an evaluation of a community health worker programme. Which items belong in it? Select all that apply.",
          [
            "Time of volunteer community health workers, valued at a local wage",
            "Antiretrovirals supplied free by a vertical programme",
            "The programme building owned by the state, annualised at replacement value",
            "A budget line that was appropriated but never released",
            "The annualised cost and the book depreciation of the same vehicles, both included",
          ],
          "abc",
          "Economic cost values every resource actually used, including volunteer time, donated drugs and owned buildings. An unreleased appropriation bought nothing, and including both depreciation and annualised cost counts the vehicles twice.",
        ),
        q(
          "You are costing a state general hospital. The facility ledger shows N150m of spending in the year. Doctors and nurses are paid from the state payroll. What should you do?",
          [
            "Use N150m, because that is what the hospital itself controls",
            "Estimate staff costs using private sector salaries, since the payroll is hard to obtain",
            "Leave salaries out, because they are fixed and do not vary with output",
            "Obtain the payroll from the Hospitals Management Board or ministry and allocate staff to departments by time",
          ],
          "d",
          "Staff are usually the largest cost and must be included at what they actually cost the state. Private sector salaries are not what this hospital pays, and leaving fixed costs out produces a figure that reimburses nothing real.",
        ),
        q(
          "A ministry wants to know whether transport vouchers for pregnant women to reach PHCs are worth funding. Your provider-perspective costing shows no change in facility cost per delivery. Why might this miss the point?",
          [
            "The provider perspective double counts staff time that is already included in the facility's overheads",
            "The costing should have used financial instead of economic cost",
            "The voucher acts on household transport and time costs, which only a societal perspective captures",
            "The study used the wrong price year for the vouchers",
          ],
          "c",
          "The voucher's purpose is to cut what households spend to reach care, which a provider view never sees. Switching to financial cost would still leave household costs outside the analysis.",
        ),
        q(
          "A 2023 study costed a service at N95,000 per episode; your 2026 study finds N180,000. A commissioner concludes that the hospital has become inefficient. What should you check first?",
          [
            "Whether the hospital has changed its medical director",
            "Whether both studies are in the same price year and how imported consumables were converted",
            "Whether the 2023 study had more pages",
            "Whether the 2026 study used a larger sample of facilities, since bigger samples always give higher averages",
          ],
          "b",
          "Inflation and exchange rate movements between 2023 and 2026 could explain much of the rise. Only after converting to one price year can any remaining difference be attributed to efficiency.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "impact-evaluation-methods",
      name: "Impact Evaluation: Counterfactuals and Honest Designs",
      description:
        "How to estimate what a health programme caused, using before-after, comparison groups, randomised rollout and difference-in-differences, and how to tell when each design is honest.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Impact is a comparison with something you cannot see",
            body: `The impact of a programme is the difference between what happened with it and what would have happened without it. The second half, the counterfactual, can never be observed directly. Every evaluation design is a way of estimating it, and every design rests on an assumption about what the counterfactual would have looked like.

Monitoring tells you what happened: facility deliveries in the programme LGAs rose from 32% to 47%. Evaluation asks how much of that rise the programme caused. If deliveries were rising everywhere because of a new state free maternity policy, a good road, or the arrival of a new mission hospital, some or all of the 15 points would have happened anyway.

This matters because money follows impact claims. A state that scales a programme on an inflated estimate spends its budget on something that may add little, and a donor that funds a second phase on the same estimate compounds the error. A consultant who reports the monitoring change as impact has made the most common and most expensive mistake in the field.

Attribution and contribution are different claims. Attribution says the programme caused a measured change of a stated size, which needs a credible counterfactual. Contribution says the programme plausibly played a part, supported by a documented causal chain, evidence that each link happened, and evidence that the main alternative explanations do not account for the change. Contribution is weaker but honest when no comparison group exists. Claiming attribution without the design to support it is not.

Decide the design before the programme starts. Most evaluations in Nigerian health programmes are commissioned at the end, when the only data are routine figures from the programme areas. By then the strongest designs are unavailable. A short design note at inception, setting out how the programme will be rolled out, which areas will serve as comparison and which baseline data will be collected, costs little and decides what can later be claimed.

The sections that follow work through the main designs in order of the assumption each one needs. A design is honest when its assumption is plausible for this programme in this place and when the report says plainly what it cannot rule out.`,
          },
          {
            title: "Before-after designs and their traps",
            body: `A before-after comparison assumes that without the programme the outcome would have stayed where it was. That assumption fails more often than it holds, for reasons a reviewer will spot at once.

Secular trend is the commonest. Many health indicators in Nigeria drift over time because of urbanisation, rising female education, mobile phone access and other programmes. A 10-point rise over three years may be mostly trend.

Regression to the mean is less obvious and very common. Programmes are often placed where last year's figures were worst. Bad years are partly bad luck, and next year tends to be closer to normal with or without help. An LGA chosen because its measles cases spiked will usually show fewer cases the following year whatever is done.

Seasonality distorts short comparisons. Comparing malaria cases from January to March with July to September compares the dry season with the rains. Compare the same months across years.

Changes in data recording can create an effect from nothing. If a programme trains facility staff on registers and DHIS2 entry, reporting completeness may rise from 60% to 90% of facilities. Reported ANC visits will then rise sharply even if no extra woman attends. Always check reporting rates before reading a trend, and restrict the analysis to facilities that reported consistently across the whole period.

Concurrent programmes are the last trap. In a busy state, a Gavi-supported immunisation drive, a World Bank results-based programme and an NGO project may all be working in the same LGAs at once.

A before-after design can still be honest. It is reasonable when the outcome was stable for a long period before the programme, the effect is expected quickly, the change is large relative to normal variation, and there is no plausible other cause. Interrupted time series is the disciplined form. Take a long run of monthly data before the programme, at least 12 to 24 points, fit the existing trend and seasonality, and test whether the level or slope changed when the programme began. DHIS2 makes such monthly series available for many indicators, which makes this design more practical in Nigeria than it was a decade ago.

When none of these conditions holds, a before-after result should be reported as monitoring, not impact.`,
          },
          {
            title: "Comparison groups, randomisation and thresholds",
            body: `Adding a comparison group replaces the assumption that nothing would have changed with the assumption that the comparison areas show what would have happened. That is only as good as the reason the areas differ.

Selection bias is the threat. States often pilot programmes where they expect success: LGAs with strong PHC coordinators, good roads and cooperative traditional leaders. Comparing those LGAs with the rest attributes their existing advantages to the programme. The bias usually runs in the programme's favour, which is why reviewers distrust simple with-and-without comparisons.

Randomisation removes selection bias by letting chance decide who gets the programme first. In public health this rarely means withholding a service. Most programmes cannot reach every LGA at once because of budget or staff, so rollout happens in phases anyway. Randomising the order of the phases, in a stepped-wedge or phased design, is fair, since every area gets the programme, and it gives a clean comparison in each period between areas that have started and areas that have not. The units randomised are usually clusters such as wards, facilities or LGAs, and the analysis must account for that clustering. With only a handful of clusters, randomisation will not balance them reliably.

Where randomisation is not possible, matching selects comparison areas that resemble programme areas on baseline characteristics: population, facility density, baseline coverage, distance to a general hospital. Propensity score methods do this across many variables at once. Matching handles the differences you can measure. It cannot handle the ones you cannot, such as the energy of a particular PHC coordinator.

Regression discontinuity applies when eligibility is decided by a cut-off on a score. If households qualify for a premium subsidy below a poverty score of 40 on the social register, households just below and just above 40 are very similar, so comparing them estimates the effect of the subsidy near the threshold. The method is honest only if the cut-off was applied as written and nobody could manipulate their score, and its estimate applies near the threshold, not across the whole population.

Choose among these by looking at how the programme is actually being rolled out. The best design is usually the one the rollout already makes possible.`,
          },
          {
            title: "Difference-in-differences",
            body: `Difference-in-differences (DiD) compares the change over time in programme areas with the change over the same period in comparison areas. It allows the two groups to start at different levels; it assumes only that their trends would have moved in parallel without the programme.

The arithmetic is simple. In programme LGAs facility delivery rose from 32% to 47%, a change of 15 points. In comparison LGAs it rose from 30% to 38%, a change of 8 points. The DiD estimate of impact is 15 minus 8, or 7 points. The 8-point rise in comparison areas is taken as what would have happened in programme areas anyway.

The parallel trends assumption carries the whole estimate, so test it. With several years of pre-programme data from DHIS2 or repeated surveys, plot both groups. If they moved together before the programme, the assumption is plausible. If programme areas were already rising faster, DiD will credit the programme with a trend that was already under way. A single baseline point cannot test the assumption at all.

Watch for four threats.
- A different shock hits one group only. If the state upgrades the general hospital in a programme LGA during the same period, its effect is attributed to the programme.
- Spillover runs between groups. Women from a comparison LGA may cross into a programme LGA to deliver at an improved facility. Deliveries rise in programme facilities and fall in comparison ones, and DiD overstates impact by counting a shift as a gain.
- Composition changes. If the programme draws healthier or wealthier women into facilities, average outcomes per facility can change without anyone's care improving.
- Measurement changes in one group only. If programme facilities get better register training, recorded numbers rise there and not elsewhere.

A DiD estimate based on DHIS2 data should be checked against reporting rates in both groups, and against survey data where available. When the parallel trends picture is weak, say so, report the estimate as indicative, and give a range rather than a single number.

DiD is the workhorse design for Nigerian programme evaluations because it fits phased rollouts and uses routine data. That convenience is also why it is often run without checking its assumption.`,
          },
        ],
        exercises: [
          {
            title: "Estimate and defend an impact",
            instruction: `A state ran a PHC revitalisation programme in 8 LGAs from January 2025. Penta3 coverage from DHIS2: programme LGAs 52% in 2024 and 66% in 2025; comparison LGAs 50% in 2024 and 57% in 2025. In 2022 and 2023 programme LGAs recorded 44% and 48%; comparison LGAs recorded 46% and 48%. Reporting completeness in programme LGAs rose from 72% to 94% in 2025; in comparison LGAs it stayed at about 80%.

Compute the DiD estimate. Judge whether parallel trends is plausible from the pre-period data. Explain how the change in reporting completeness could bias the estimate and what analysis you would run to correct it. Write the one paragraph you would put in the report's findings.`,
          },
          {
            title: "Choose a design before rollout",
            instruction: `A state plans to introduce a premium subsidy for poor households in its health insurance scheme. It has budget to cover 10 of its 20 LGAs in year one and the rest in year two. Households qualify if they score below a set threshold on the social register. The commissioner wants to know in 18 months whether the subsidy raised facility use and cut out-of-pocket spending.

Propose an evaluation design, say what the rollout plan must look like for it to work, which data must be collected before launch, and what the design will not be able to rule out.`,
          },
        ],
      },
      resources: { tools: ["DHIS2 pivot tables", "Stata or R", "Microsoft Excel"] },
      questions: [
        q(
          "Facility delivery in programme LGAs rose from 32% to 47%. In comparison LGAs it rose from 30% to 38% over the same period. What is the difference-in-differences estimate of impact?",
          ["15 percentage points", "7 percentage points", "17 percentage points", "9 percentage points"],
          "b",
          "The programme change is 15 points and the comparison change is 8, so DiD is 7 points. Fifteen is the raw before-after change, which assumes nothing would have changed without the programme.",
        ),
        q(
          "A state chose 5 LGAs for a measles response programme because they had the highest case counts in 2025. Cases in those LGAs fell by 40% in 2026. Before attributing this to the programme, what is the main concern?",
          [
            "The programme was too small to be evaluated",
            "Measles case counts from routine data are too unreliable to show any change at all, so the fall means nothing",
            "Regression to the mean, because areas picked after an unusually bad year tend to improve anyway",
            "The programme should have covered every LGA",
          ],
          "c",
          "Selecting areas for an extreme year makes a fall likely whatever is done, because part of the spike was chance. A comparison with similarly high-burden areas or a longer time series is needed to separate the programme's effect.",
        ),
        q(
          "A malaria programme's report compares confirmed cases in January to March 2026 with July to September 2025 and claims a 35% fall. What is the flaw?",
          [
            "The comparison mixes dry-season and rainy-season months, so seasonality may explain the fall",
            "Confirmed cases should never be used as an outcome",
            "The two periods are of unequal length, because January to March has fewer days than July to September",
            "The programme should have reported deaths, not cases",
          ],
          "a",
          "Malaria transmission peaks in the rains, so comparing rainy-season months with dry-season months builds in a fall. Compare the same months across years or model seasonality in a time series.",
        ),
        q(
          "During a programme, DHIS2 reporting completeness in its LGAs rose from 60% to 90% of facilities, and reported ANC visits rose 40%. What should the analyst do first?",
          [
            "Report the 40% rise as programme impact, since DHIS2 is the official system",
            "Discard DHIS2 data and wait for the next national survey",
            "Divide the 40% rise by the 30-point change in reporting completeness and report the remainder as programme impact",
            "Restrict the comparison to facilities that reported consistently throughout, then re-estimate the change",
          ],
          "d",
          "Much of the rise may be facilities that were not reporting before. Using a consistent panel of facilities removes that artefact; a simple division is a crude adjustment that still mixes different facilities.",
        ),
        q(
          "You plan a DiD evaluation. In the three years before the programme, programme LGAs' skilled birth attendance rose 4 points a year while comparison LGAs rose 1 point a year. What does this mean for the design?",
          [
            "Nothing, because difference-in-differences already allows the two groups to differ at baseline and over time",
            "Parallel trends does not hold, so a simple DiD would credit the programme with a pre-existing faster trend",
            "The comparison group is ideal because it shows less change",
            "Switch to a before-after design, which avoids the problem",
          ],
          "b",
          "DiD tolerates different levels but needs parallel trends; diverging pre-period trends break it. Before-after would be worse, since it attributes the whole trend to the programme.",
        ),
        q(
          "A state can only launch a new PHC staffing model in 10 LGAs a year over three years, for budget reasons. It wants a credible estimate of impact. What should you recommend?",
          [
            "Launch first in the LGAs with the strongest coordinators, so early results build political support for the rest",
            "Launch everywhere at once with a smaller budget per LGA",
            "Randomise the order in which LGAs join, so later LGAs serve as a fair comparison for earlier ones",
            "Evaluate only after all 30 LGAs have the programme",
          ],
          "c",
          "A phased rollout with randomised order is fair, since every LGA gets the programme, and removes selection bias. Starting with the strongest LGAs makes early results look better than the programme will deliver elsewhere.",
        ),
        q(
          "Households qualify for a state premium subsidy if they score below 40 on the social register. An evaluator compares households scoring 36 to 39 with those scoring 40 to 43. What does this design estimate, and what must hold?",
          [
            "The effect near the threshold, provided the cut-off was applied as written and scores were not manipulated",
            "The subsidy's effect for all poor households in the state, provided the sample on each side of the cut-off is large",
            "The subsidy's effect for all households, since the two groups are similar",
            "Nothing useful, because the two groups differ in poverty",
          ],
          "a",
          "Regression discontinuity estimates a local effect at the cut-off and depends on a clean, unmanipulated threshold. It does not generalise automatically to the poorest households far below the line.",
        ),
        q(
          "A state compares its programme LGAs with all other LGAs and finds 12 points higher immunisation coverage. The programme LGAs were selected because their PHC coordinators were judged the most capable. What is the most likely direction of bias?",
          [
            "None, because comparing with every other LGA in the state averages out any differences between areas",
            "Downwards, because capable coordinators would resist the programme",
            "Unknown, so the bias can be ignored",
            "Upwards, because the programme LGAs' existing advantages are being counted as programme impact",
          ],
          "d",
          "Selection on capable leadership means those LGAs would likely have done better anyway, so a with-and-without comparison overstates impact. Including more comparison LGAs does not remove a selection difference.",
        ),
        q(
          "A DiD evaluation of an upgraded maternity service uses neighbouring LGAs as the comparison. Which of these would threaten the estimate? Select all that apply.",
          [
            "Women from comparison LGAs travelling to deliver in the upgraded facilities",
            "Programme LGAs starting with lower delivery rates than comparison LGAs",
            "The state opening a new general hospital in one programme LGA during the same period",
            "Register training given only to programme facilities, improving recording there",
            "Comparison LGAs being in the same state",
          ],
          "acd",
          "Spillover, a separate shock in one group and a measurement change in one group all bias DiD. A different starting level is exactly what DiD is built to handle, so it is not a threat on its own.",
        ),
        q(
          "A federal policy changes PHC drug supply in every state on the same date, so no comparison group exists. The ministry asks you whether it worked. What is the most honest approach?",
          [
            "Compare 2025 with 2026 and report the difference as the policy's impact",
            "Use an interrupted time series with a long monthly pre-period, and claim contribution unless the break is clear",
            "Decline to evaluate, since no counterfactual exists",
            "Use a neighbouring country that did not change its policy as the comparison group in a difference-in-differences",
          ],
          "b",
          "A long pre-period lets you model trend and seasonality and test for a break at launch; contribution framing is honest about the remaining uncertainty. A two-point before-after cannot separate the policy from trend.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "indicators-data-quality",
      name: "Indicators, Data Quality and DHIS2 Reporting",
      description:
        "How indicators are built from numerators and denominators, how Nigeria's routine data flow through DHIS2, and how to test data quality before any number reaches a report.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "An indicator is a numerator over a denominator",
            body: `Most health indicators are a ratio, and each half has its own source and its own errors. Knowing where each half comes from is the first test of whether a figure can be trusted.

Take Penta3 coverage in an LGA. The numerator is the number of children who received the third dose of pentavalent vaccine this year, counted from facility registers and reported through the routine system. The denominator is the number of surviving infants in the LGA, which nobody counts directly. It comes from population projections built on an old census, multiplied by an assumed birth rate and survival rate. Nigeria's last full census was in 2006, so LGA population figures are projections of projections.

This is why routine coverage above 100% is common and is a warning sign rather than an achievement. A figure of 118% usually means the denominator is too low, children are coming from a neighbouring LGA to a well-run facility, or the numerator is inflated. Investigate before reporting.

Choose denominators deliberately. For service-based indicators, an expected-pregnancies figure from projections is common. An alternative is to use a related service as the base: the proportion of ANC1 attendees who went on to have four visits uses ANC1 as its denominator, so it is internally consistent even when the population figure is wrong. It answers a different question, about retention rather than coverage.

Distinguish direct measures from proxies. The number of ANC visits is a proxy for antenatal care quality; the proportion of ANC1 attendees tested for HIV and syphilis is closer to it. A proxy is acceptable when the direct measure is impossible, but say which you are using.

Leading indicators move early and tell you whether the programme is on track: stock-out days, staff in post, sessions held. Lagging indicators move late and tell you whether it worked: coverage, mortality. A dashboard of only lagging indicators gives a programme manager nothing to act on this month.

Composite indices, such as a single facility readiness score, compress many items into one figure. They are useful for ranking but hide what drives the score. Always publish the components alongside the composite.`,
          },
          {
            title: "How routine data move in Nigeria",
            body: `Routine health data in Nigeria flow through the National Health Management Information System, with DHIS2 as the national software platform. Knowing the path a number takes shows where it can go wrong.

At the facility, a health worker records each contact in a paper register: the ANC register, the immunisation register, the delivery register. At month end, someone totals the registers into the NHMIS monthly summary form. In many places that form goes to the LGA, where the M&E officer enters it into DHIS2; in others facilities enter directly on a phone or tablet. State and federal teams then view and analyse the aggregated data.

Each step is a point of error. Registers go missing or are filled late. Totals are added up wrongly or copied from last month. The person entering the data may be keying in forms for dozens of facilities and may not notice an implausible figure. A facility that did not submit shows as missing, not zero, and an analyst who reads missing as zero sees a false collapse.

Coverage of the private sector is weak. Private hospitals and clinics deliver a large share of care in many states, especially in cities, but many do not report or report irregularly. A state's DHIS2 data can therefore show a fall in facility deliveries when women have simply moved to private facilities that do not report. Ask what share of the state's facilities report, by ownership, before interpreting a trend.

Vertical programmes sometimes run parallel reporting. HIV, TB and some donor-funded programmes have their own tools and platforms alongside or feeding into DHIS2. Figures for the same indicator can then differ between systems. Find out which is the reference for the decision at hand and reconcile the two before reporting.

Three routine metrics describe the reporting itself. Reporting rate is the share of expected reports received. Timeliness is the share received by the deadline. Completeness of data elements is the share of fields filled within the reports received. A trend means little when reporting rates are moving, so every analysis should show the reporting rate on the same chart as the indicator.

Household surveys sit alongside routine data. The Nigeria Demographic and Health Survey and the Multiple Indicator Cluster Survey measure coverage from the population side, including care received outside reporting facilities. They are less frequent but are the usual check on routine coverage figures.`,
          },
          {
            title: "Testing data quality",
            body: `Data quality has four dimensions that can each be tested: completeness and timeliness, accuracy, internal consistency, and external consistency. Run the tests before any figure appears in a report, and record what you found.

Completeness and timeliness come straight from DHIS2 reporting metrics. Low reporting rates do not make data useless, but they decide what you can say. Compare facilities that reported throughout, and report the rate beside the figure.

Accuracy is tested by recounting. Go back to the source register for a sample of facilities and months, count the events, and compare with what was reported. The verification factor is the recounted figure divided by the reported figure. If the register shows 380 ANC1 visits and DHIS2 shows 460, the verification factor is 0.83, so the facility over-reported by about 17%. A factor near 1 is good; values well below 1 suggest over-reporting and values above 1 suggest under-reporting. Take the sample across several facility types, because problems often cluster in one kind of facility.

Internal consistency compares related figures that should move together.
- Outliers: a month several times higher than the facility's own usual range.
- Related indicators: ANC4 cannot exceed ANC1 in the same cohort; Penta3 should not exceed Penta1.
- Dropout rates: Penta1 to Penta3 dropout of 4,000 to 2,800 is 30%. Programmes commonly treat dropout above about 10% as a sign of a utilisation or follow-up problem, and negative dropout as a data error.
- Consistency over time: a smooth series that suddenly jumps when a new incentive starts.

External consistency compares routine figures with surveys. If DHIS2 shows 80% facility delivery for a state but the latest NDHS shows 45%, the gap needs an explanation before either figure is used. Typical reasons are a wrong population denominator, women crossing from other states, or the survey's confidence interval. For population coverage, surveys are usually the better reference; for month-to-month programme management, routine data are the only option.

The WHO Data Quality Review toolkit and routine data quality assessment tools set out these checks in standard form, and DHIS2 has built-in validation rules and outlier analysis that a state team can run themselves.

Incentives degrade quality. When payment, promotion or a donor's next tranche depends on an indicator, that indicator becomes more likely to be inflated. Any indicator tied to money needs independent verification, by recount or by a sample of patient follow-up, built into the design.`,
          },
          {
            title: "Working with DHIS2 on a programme",
            body: `Use the national system rather than building a parallel one. A programme that sets up its own app and spreadsheets doubles the reporting burden on facility staff, lowers the quality of both systems, and leaves nothing behind when the funding ends.

When a programme needs an indicator the national forms do not collect, work through the state's M&E unit and the state's DHIS2 administrators to add the data element or a short supplementary form. Expect this to take time and to require agreement from the state and sometimes from federal level. Plan for it in the inception phase.

A sound analysis routine looks like this. Pull the data from DHIS2 by facility and month, not as pre-aggregated LGA totals, so you can see which facilities drive a change. Pull the reporting metrics at the same level. Check outliers and internal consistency. Decide the denominator and state it. Compare with the latest survey estimate. Only then chart the trend. Analysts who skip to the chart produce findings that collapse at the first review meeting with the state.

Feed the analysis back. The staff who fill the registers rarely see the data again, which tells them the work does not matter. Short monthly data review meetings at LGA level, using the facility's own figures, improve both quality and use. A one-page facility scorecard, with five or six indicators and the facility's position against its peers, is more useful than a 40-indicator dashboard.

Be careful with peer comparison in small units. Ranking facilities is reasonable, but a ranking of named individual health workers in a small PHC identifies people and can damage trust. Use facility or ward-level comparisons and look for the facilities doing unusually well to learn from them.

Handle personal data correctly. DHIS2 aggregate data carry no names, but tracker modules and line lists do. The Nigeria Data Protection Act 2023 applies to health data held by programmes and contractors as much as to hospitals. Access should be limited to those who need it, exported files should not travel on personal devices or messaging apps, and any line list shared with a consultant should be the minimum needed for the analysis.

Leave the state stronger than you found it. The test of an M&E consultant's work is whether the state team can produce the same analysis next quarter without you.`,
          },
        ],
        exercises: [
          {
            title: "Data quality review of an LGA",
            instruction: `You are reviewing 2026 routine data for an LGA with 22 public PHCs and 9 private facilities. DHIS2 shows Penta1 3,900, Penta3 2,650, ANC1 5,100, ANC4 2,300, facility deliveries 2,900. The LGA's projected surviving infants are 3,300 and expected pregnancies 4,200. Reporting rate is 91% for public facilities and 33% for private. A register recount at 6 facilities found 1,240 ANC1 visits against 1,480 reported. The latest NDHS estimate for facility delivery in the state is 41%.

Compute Penta1 coverage, Penta1 to Penta3 dropout, ANC1 to ANC4 retention, facility delivery coverage and the ANC1 verification factor. List each data quality problem you see and say which figures you would and would not put in a report to the state commissioner, with one line of reasoning for each.`,
          },
        ],
      },
      resources: { tools: ["DHIS2", "WHO Data Quality Review toolkit", "Microsoft Excel"] },
      questions: [
        q(
          "DHIS2 shows Penta1 coverage of 118% in an LGA. What is the most likely explanation to investigate first?",
          [
            "The LGA has exceeded its target and should be held up as a model",
            "The population denominator is too low or children are coming from neighbouring LGAs",
            "Penta1 doses were recorded twice for the same children when they returned for Penta2",
            "DHIS2 has a calculation error that the federal team should fix",
          ],
          "b",
          "Coverage above 100% usually points to a denominator built on outdated projections, or to cross-boundary attendance. Double dosing is possible but far less common than denominator error.",
        ),
        q(
          "A register recount at a PHC finds 380 ANC1 visits for the quarter; DHIS2 shows 460 for the same quarter. What is the verification factor and what does it indicate?",
          [
            "1.21, indicating under-reporting",
            "80, indicating a data entry backlog",
            "0.83, indicating over-reporting of about 17%",
            "0.17, indicating that 17% of data are missing",
          ],
          "c",
          "The verification factor is recounted divided by reported: 380 / 460 = 0.83, so reported figures are about 17% too high. Dividing the other way gives 1.21 and reverses the conclusion.",
        ),
        q(
          "An LGA recorded Penta1 4,000 and Penta3 2,800 for the year. What does this tell the programme manager?",
          [
            "Dropout is 30%, well above the level that signals a utilisation or follow-up problem",
            "Dropout is 70%, because only 2,800 of the 4,000 children went on to complete the series",
            "Coverage is 70%, which meets most targets",
            "Nothing, because dropout can only be measured by survey",
          ],
          "a",
          "Dropout is (4,000 minus 2,800) / 4,000 = 30%, far above the roughly 10% level programmes commonly use as a warning. The 70% figure is the retention ratio, not coverage, since coverage needs a population denominator.",
        ),
        q(
          "A facility's DHIS2 data for the year show ANC4 of 620 and ANC1 of 540. What should you conclude?",
          [
            "The facility is performing very well on antenatal retention",
            "The facility has received women transferring in from other facilities mid-pregnancy, so the figures are fine",
            "ANC4 should be reported as a share of deliveries instead",
            "The figures are internally inconsistent and need checking against the registers before use",
          ],
          "d",
          "Within one cohort ANC4 cannot exceed ANC1, so this is a consistency failure, most likely a recording or entry error. Transfers can explain small gaps but should be checked, not assumed.",
        ),
        q(
          "A state's DHIS2 facility delivery figure rose from 38% to 51% over two years. The reporting rate rose from 55% to 88% over the same period. What should you report?",
          [
            "A 13-point improvement in facility delivery",
            "The trend among facilities that reported consistently throughout, with the reporting rate shown alongside",
            "A 13-point improvement, adjusted down by the 33-point rise in reporting, giving a net fall in facility delivery",
            "Nothing, because the data are unusable",
          ],
          "b",
          "When reporting rates move, the trend partly reflects more facilities reporting. A consistent panel isolates real change; subtracting one percentage from another has no logical basis.",
        ),
        q(
          "DHIS2 shows 80% facility delivery for a state; the latest NDHS shows 45%. A commissioner wants to cite the higher figure in a speech. What do you advise?",
          [
            "Use the DHIS2 figure because it is more recent",
            "Use the average of the two, 62.5%, since each source has its own errors and averaging balances them",
            "Use the survey figure for population coverage, and explain why the routine figure runs higher",
            "Use neither and wait for the next census",
          ],
          "c",
          "Household surveys measure population coverage directly, including care outside reporting facilities, so they are the better reference here. Averaging two figures with different errors produces a number that is not true of anything.",
        ),
        q(
          "A results-based programme starts paying PHCs N2,000 per facility delivery. In the next quarter, reported deliveries at several facilities double while ANC1 and Penta1 stay flat. What is the right response?",
          [
            "Pay the bonuses, since the programme has worked",
            "Stop the programme in those facilities, since a doubling in one quarter can only mean the figures are fraudulent",
            "Ignore it until the annual evaluation",
            "Verify independently at those facilities, by register recount and patient follow-up, before paying",
          ],
          "d",
          "A jump in the paid indicator alone, with related indicators flat, is a classic sign of inflation under an incentive. Verification is the proportionate step; assuming fraud before checking is unfair to facilities that may have improved.",
        ),
        q(
          "A donor programme in three LGAs wants its own mobile app for facility staff to report programme indicators, alongside the NHMIS forms. What is the best advice?",
          [
            "Add the needed data elements to DHIS2 through the state M&E unit, so staff report once",
            "Build the app, since donor indicators differ from government ones and the donor needs them faster",
            "Ask facilities to choose which system they prefer to use",
            "Collect the data by quarterly survey instead of routine reporting",
          ],
          "a",
          "Parallel systems double the burden on facility staff and leave nothing behind when funding ends. Adding elements to DHIS2 takes longer to agree but strengthens the national system.",
        ),
        q(
          "You suspect a PHC is inflating its ANC1 figures. Which checks would help detect this? Select all that apply.",
          [
            "Recounting ANC1 visits in the register and computing a verification factor",
            "Checking whether the report was submitted on time",
            "Comparing ANC1 with related figures such as IPTp1 and HIV testing at first visit",
            "Comparing the month's ANC1 with the facility's own usual range",
            "Checking the LGA's overall reporting rate",
          ],
          "acd",
          "Recounts test accuracy, related indicators test internal consistency, and outlier checks show sudden jumps. Timeliness and the LGA reporting rate describe reporting behaviour, not whether the numbers are true.",
        ),
        q(
          "A programme wants one indicator for the quality of antenatal care in its PHCs. Which is the strongest choice?",
          [
            "Number of ANC visits recorded per month",
            "Number of midwives trained in focused antenatal care",
            "Number of ANC sessions held per month",
            "Proportion of ANC1 attendees tested for HIV and syphilis",
          ],
          "d",
          "Testing at first visit is a direct measure of whether recommended care was delivered. Visit counts measure volume, and training numbers are an output that may or may not change care.",
        ),
      ],
    },
  ],
};

export default expansion;
