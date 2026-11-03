import type { Option, Question, TrackExpansion } from "./types";

/** Paragraphs joined with a blank line (the body renders with pre-line). */
const p = (...paras: string[]) => paras.join("\n\n");

const ids = ["a", "b", "c", "d", "e"] as const;

/** Multiple choice: one correct option, given by its letter. */
function mc(question: string, texts: string[], correct: string, explanation: string): Question {
  const options: Option[] = texts.map((text, i) => ({ id: ids[i], text, isCorrect: ids[i] === correct }));
  return { type: "MULTIPLE_CHOICE", question, options, explanation };
}

/** Multi select: two or three correct options, given as letters. */
function ms(question: string, texts: string[], correct: string[], explanation: string): Question {
  const options: Option[] = texts.map((text, i) => ({ id: ids[i], text, isCorrect: correct.includes(ids[i]) }));
  return { type: "MULTI_SELECT", question, options, explanation };
}

const expansion: TrackExpansion = {
  slug: "strategic-advisory-growth",
  topUp: [
    // ── balanced-scorecard-hospitals ────────────────────────────────────────
    {
      moduleSlug: "balanced-scorecard-hospitals",
      questions: [
        mc(
          "A 180-bed hospital in Kano asks you to review its new scorecard. It has 46 KPIs, several with no owner and no stated data source. What is the most important change?",
          [
            "Cut to around 15 to 20 KPIs and give each an owner, a target, a data source and a review cadence",
            "Keep all 46, since a large hospital needs broad coverage, but review them quarterly rather than monthly to reduce the burden",
            "Add a fifth perspective to spread the KPIs more evenly",
            "Replace the KPIs with OKRs so they can be stretch goals",
          ],
          "a",
          "Too many KPIs fragment leadership attention, and a KPI without an owner and data source will not be acted on. Reviewing 46 less often keeps both problems and only hides them for longer.",
        ),
        mc(
          "Which chain is a correctly built strategy map link for a hospital, running from the foundation up to the result?",
          [
            "Lower cost per case, then fewer readmissions, then better protocol adherence, then nurse training",
            "Better reputation for referrals, then nurse training, then lower cost per case, then protocol adherence",
            "Fewer readmissions, then nurse training, then higher revenue, then protocol adherence",
            "Nurse training, then better protocol adherence, then fewer readmissions, then lower cost per case and more referrals",
          ],
          "d",
          "A strategy map runs from Learning and Growth through Internal Process and Patient to Financial, each a cause of the next. The first option has the right items in reverse, which turns causes into effects.",
        ),
        mc(
          "A 90-bed hospital in Abeokuta has no EMR but wants a Patient perspective KPI on time from arrival to first clinical contact. What is the soundest approach?",
          [
            "Drop the KPI until an EMR is installed",
            "Ask the triage nurses to estimate the average wait at the end of each week and record it on the scorecard as the KPI value",
            "Record arrival and first-contact times by hand for a defined weekly sample and report the median",
            "Use the national average from published studies as the hospital's figure",
          ],
          "c",
          "A manual time-stamped sample is a reliable proxy that the hospital can actually collect. A nurse's end-of-week estimate is easy but is recollection, not measurement.",
        ),
        mc(
          "A mid-sized private hospital in Owerri sets its bed turnover target to match a leading US academic centre. Staff morale falls after the first quarter. What should the targets be based on?",
          [
            "The best international performer, since stretch targets drive improvement",
            "Comparable regional peers and the hospital's own prior-year performance",
            "Whatever the department heads propose, to restore morale",
            "The average of all Nigerian hospitals, public and private",
          ],
          "b",
          "Context-relevant benchmarks from regional peers and prior-year performance give targets staff can reach and improve on. Letting department heads set their own targets restores morale but loses the link to strategy.",
        ),
        ms(
          "You are classifying a Lagos hospital's draft KPIs by perspective. Which of these belong in the Internal Process perspective? Select all that apply.",
          [
            "Theatre utilisation",
            "Claims processing turnaround",
            "Nurse retention rate",
            "Cash reserves for equipment replacement",
            "Clinical protocol adherence",
          ],
          ["a", "b", "e"],
          "Theatre utilisation, claims turnaround and protocol adherence are operational capabilities the hospital must excel at. Nurse retention is Learning and Growth, and cash reserves sit in the Financial perspective.",
        ),
      ],
    },

    // ── competitive-strategy-healthcare ─────────────────────────────────────
    {
      moduleSlug: "competitive-strategy-healthcare",
      questions: [
        mc(
          "Three HMOs that together cover 60% of a hospital group's insured patients merge, and the merged HMO demands a 12% tariff cut. Which of the Five Forces has intensified?",
          [
            "Bargaining power of suppliers",
            "Threat of new entrants",
            "Bargaining power of buyers",
            "Rivalry among existing competitors",
          ],
          "c",
          "HMOs buy care on behalf of patients, so consolidation raises buyer power. It can feel like rivalry, but the pressure comes from the purchaser, not from competing hospitals.",
        ),
        mc(
          "A cardiac centre in Abuja finds that a growing number of its potential self-pay patients travel to India for bypass surgery. In Five Forces terms this is best treated as:",
          [
            "The threat of substitutes",
            "Bargaining power of suppliers",
            "Threat of new entrants",
            "A weakness in the Learning and Growth perspective",
          ],
          "a",
          "Outbound medical tourism meets the same need through a different route, which the framework treats as a substitute. It would be a new entrant only if the Indian provider opened in Abuja.",
        ),
        mc(
          "A group designs an ERRC grid for affordable day-surgery centres in secondary Nigerian cities. Which item belongs under Create?",
          [
            "Fewer single-room inpatient beds",
            "Removing marble-finish reception areas",
            "Higher clinical quality through standard care pathways and outcome measurement across every centre in the group",
            "A single published all-inclusive price for each procedure, with outcomes reported",
          ],
          "d",
          "Create means offering something the industry does not, and published all-inclusive prices with outcome reporting are rare in Nigerian private care. Standard pathways raise quality on an existing dimension, so they belong under Raise.",
        ),
        mc(
          "A 250-bed hospital's service-line map shows that its ENT clinic has low strategic importance and has lost money for three years with no recovery plan. What does the portfolio approach recommend?",
          [
            "Invest aggressively to turn it into a star",
            "Rationalise or close it and redeploy the capacity",
            "Use its margin to fund growth elsewhere",
            "Seek a PPP partner because demand is high",
          ],
          "b",
          "Low strategic value with poor finances is the quadrant to rationalise or close. Funding growth elsewhere describes a cash cow, which needs strong margins this line does not have.",
        ),
        mc(
          "A hospital in Kaduna sees strong demand for cancer care, but its analysis shows a standalone oncology unit would lose money for years. Following the service-line logic, what is the best next step?",
          [
            "Build the unit anyway, since demand is high",
            "Close the service line as a dog",
            "Explore a partnership with a regional cancer centre rather than building alone",
            "Raise prices on the hospital's other services to cross-subsidise a standalone oncology unit until it breaks even",
          ],
          "c",
          "High strategic value with weak economics is a question mark, which calls for a turnaround plan or a partnership model. Closing it ignores the strategic importance that the demand shows.",
        ),
      ],
    },

    // ── commercial-performance-growth ───────────────────────────────────────
    {
      moduleSlug: "commercial-performance-growth",
      questions: [
        mc(
          "A hospital refers out 120 patients a month. Clinical review finds 48 of them could have been treated in-house with existing staff and equipment. What is its referral leakage rate?",
          ["40%", "48%", "60%", "28%"],
          "a",
          "Leakage is the share of patients referred out who could be treated in-house: 48 of 120 is 40%. 48% treats the count as a percentage, which only works if 100 patients were referred out.",
        ),
        mc(
          "Over a quarter, GPs referred 300 patients to a hospital's orthopaedic clinic and 165 arrived. The commercial director wants to recruit more referring GPs. What should she look at first?",
          [
            "Increasing the fee paid to GPs for each referral, so that existing referrers send more patients and new ones join",
            "Opening a second orthopaedic clinic",
            "Running an awareness campaign aimed at patients",
            "Why 45% of referred patients never arrived, since conversion is the cheaper gain",
          ],
          "d",
          "A 55% conversion rate means many patients who were already referred are being lost, which is cheaper to fix than finding new referrers. Referral fees to doctors also raise serious ethical problems.",
        ),
        mc(
          "Which of these is a well-formed Key Result for the objective 'Become the preferred referral destination for maternity in our region'?",
          [
            "Build stronger relationships with referring GPs",
            "Reduce average time from referral to first antenatal appointment from 6 days to under 48 hours",
            "Be recognised as the best maternity unit in the region",
            "Continue monitoring patient satisfaction in maternity",
          ],
          "b",
          "A Key Result must be quantitative and verifiable. 'Build stronger relationships' is qualitative and reads like a second objective, not a measure of one.",
        ),
        mc(
          "A hospital's commercial team scored 1.0 on every Key Result for four quarters in a row. What does this most likely indicate?",
          [
            "The team is performing exceptionally and should be rewarded",
            "The scoring scale should be changed to 0 to 100",
            "The Key Results are not stretching enough",
            "OKRs should be replaced with KPIs",
          ],
          "c",
          "OKRs are meant to be stretch goals, with 0.7 treated as strong, so a perfect score every quarter suggests targets were set too low. The team may well be good, but the scores cannot show it.",
        ),
        ms(
          "A 200-bed hospital earns 80% of revenue from inpatient care, and 60% of that from one HMO that has just cut tariffs. Which moves reduce this concentration risk? Select all that apply.",
          [
            "Corporate wellness contracts with large employers that also feed admissions",
            "Building outpatient and day-surgery volume",
            "Offering the same HMO a further discount in exchange for more volume",
            "Running the laboratory and imaging as profit centres serving outside referrals",
          ],
          ["a", "b", "d"],
          "Wellness contracts, outpatient growth and ancillary services all add revenue that does not depend on inpatient admissions from one payor. A further discount to the same HMO deepens the dependence it is meant to reduce.",
        ),
      ],
    },
  ],

  modules: [
    // ────────────────────────────────────────────────────────────────────────
    {
      slug: "new-sites-build-or-buy",
      name: "New Sites, Expansion and Build or Buy",
      description:
        "Whether to expand at all, how to choose a site, the true economics of building, what an acquisition really buys, and how to compare build, buy, lease and partner on the same footing for a board.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "Expansion is a capital decision before it is a growth decision",
            body: p(
              "The first question in any expansion brief is whether the existing site has been used up, and the honest answer is usually no. Owners in Nigerian private healthcare reach for a new building when their real constraint is a process, a payor contract or a shortage of clinicians. A second site multiplies whatever is wrong with the first.",
              "Test the claim of being full with data. A hospital at 88% average bed occupancy may be genuinely constrained, or it may have an average length of stay two days above its peers because discharges wait for bills and consultants round once a day. Shortening stay by a day on a 4.5-day average releases about a fifth of bed capacity at almost no capital cost. Theatre is similar: a theatre that starts lists at 10am, turns over slowly and runs four days a week is rarely full in any sense a lender would accept.",
              "Lay out the full ladder of expansion moves before discussing sites. In rough order of capital and risk: extend hours and days on existing capacity; convert under-used space, such as an administrative floor into consulting rooms; open a small satellite clinic or diagnostic point that feeds the main hospital; lease and fit out an existing building; build a new facility; acquire an operating hospital; or enter a partnership, management contract or joint venture with an existing owner. Each step up commits more capital for longer and is harder to reverse.",
              "The board should see why the lower rungs are not enough before it sees a site plan. When a consultant skips this, the board is asked to approve N2bn or more on a constraint nobody proved, and the next three years are spent filling beds that a better-run existing site could have supplied."
            ),
          },
          {
            title: "Choosing a site",
            body: p(
              "Site selection is market sizing applied to real plots, with the added weight of land, utilities and regulation, and most of the risk sits in things a brochure does not show. Start from demand: the catchment around each candidate site, its addressable market at the planned price and payor mix, and a fair share against the competitors already there. A site is attractive when it sits in an under-served catchment that the group's existing brand can reach, not simply because land is available or cheap.",
              "Then test the physical and legal basics, each of which has stopped projects in Nigeria. Title: confirm a valid Certificate of Occupancy or other recognised title, search the land registry, and remember that under the Land Use Act a transfer needs the Governor's consent, which takes time and costs money. Permits: in Lagos, development needs planning approval from the state physical planning authority, and other states have equivalents. Health facility registration with the state regulator, such as HEFAMAA in Lagos, depends on meeting standards for the building and staffing, so design must follow those standards from the start. Utilities: grid supply, the space and fuel logistics for generators, water and sewage, and flood risk. Access: peak-hour traffic, ambulance approach, parking.",
              "Clinicians are part of the site. A new hospital in Abuja that depends on consultants who live and practise in Lagos will struggle. Before committing, identify which senior doctors and nurses will work there and confirm their interest.",
              "Score candidate sites against the same weighted criteria, agreed with the board before the scores are seen. That protects the decision from attachment to the plot the chairman already owns."
            ),
          },
          {
            title: "Building: the costs people underestimate",
            body: p(
              "The true cost of a new hospital is not the construction budget but the peak funding: everything spent before the facility generates more cash than it consumes. Boards see the capex figure and approve it. They are rarely shown the rest until the money runs out.",
              "Take a 50-bed hospital in Lekki. Construction and equipment are budgeted at N2.4bn over 24 months. Pre-opening costs, staff recruited and paid before opening, training, licensing, initial stock and launch marketing, add N180m. In the first year of operation, occupancy ramps from about 25% to 55%, and the hospital loses N300m after its direct and fixed costs. In year two it loses N120m before reaching monthly break-even in month 20. Peak funding is about N3.0bn, a quarter more than the capex. Add a 15% construction overrun, which is common, and the figure passes N3.3bn.",
              "Timing compounds the cost. The capital is committed two to three years before revenue, and in a high-inflation economy the naira cost of imported equipment and finishes can rise sharply between budget and purchase. A loan at commercial naira rates accrues interest throughout construction and the ramp-up.",
              "Present payback honestly. Payback from opening day flatters a project. Payback from the first naira spent is the figure the owner's money experiences. In the example, if the hospital generates N350m a year in operating cash once mature, payback from first spend is likely to exceed eight years.",
              "None of this means building is wrong. A purpose-built facility can be designed for efficient flow, meet accreditation standards from the start and carry a brand for decades. It means the board must approve the peak funding, the ramp and the timeline, not just the construction budget."
            ),
          },
          {
            title: "Buying: what an acquisition really buys",
            body: p(
              "Acquiring an operating hospital buys time, an existing patient base and staff, and it also buys whatever is wrong with the business, much of which the seller will not volunteer. The case for buying is that it avoids the ramp-up and the construction risk. The case against is that the patients, staff and reputation may be weaker than they look, and that integration costs time and money.",
              "Structure decides what comes with the deal. A share purchase acquires the company, its registrations and contracts, and all its liabilities: unpaid taxes, unremitted PAYE and pension contributions, staff claims, supplier disputes and medico-legal cases. An asset purchase leaves most liabilities with the seller but means the buyer must secure its own facility registration, renegotiate HMO and corporate contracts, and re-hire staff. Many HMO and corporate contracts are with the provider entity and may need consent or renegotiation on a change of control.",
              "Diligence must go beyond the accounts. Reconcile reported revenue with bank statements and HMO remittance advice. Test whether revenue depends on one or two consultants who may leave after the sale. Check the facility's registration status, any regulatory sanctions, the title to the land and building, the state of the generators and medical equipment, and the age and terms of HMO contracts. Talk to staff and look at the complaints log.",
              "Price the acquisition against the alternative. A fair test is the cost and time of building an equivalent facility, plus the value of the ramp-up you avoid, less the refurbishment, integration and risk you take on. If a 40-bed hospital costs N1.6bn plus N250m of refurbishment, and building an equivalent would cost N2.2bn with three years of ramp, buying looks attractive, unless diligence shows its patient book is declining or its title is unclear.",
              "Integration is where acquisitions fail. Plan the first hundred days: leadership, clinical governance, systems, pricing and the message to staff and patients."
            ),
          },
          {
            title: "Comparing options on the same footing",
            body: p(
              "Build, buy, lease and partner should be compared over the same time horizon, on the same assumptions about demand, with risks valued rather than listed. Boards often see a build case over ten years and a buy case over five, or a build case at fair share and a buy case at the seller's figures, and choose the one that looks best for reasons that have nothing to do with the options.",
              "Use a common model. Project cash flows for each option from the first naira committed, using the same catchment demand and share assumptions, the same tariffs and payor mix, and the same cost inflation. Calculate net present value at a naira discount rate that reflects the group's real cost of capital, and show peak funding and the month cash turns positive. Then run the scenarios that matter: demand 20% lower, a one-year delay, a construction overrun, the loss of a key consultant.",
              "Value flexibility. A lease-and-convert option or a satellite clinic often has a lower NPV on paper than a new hospital but keeps the next decision open. If demand proves strong in two years, the group can then build with evidence; if it does not, the loss is small. Staged commitment, with clear gates such as 'proceed to land purchase when the satellite clinic sees 1,200 new patients a month', turns a single large bet into a sequence of smaller ones.",
              "Recommend, do not just compare. The board needs to know which option the consultant would choose and why, what would change that view, and what it should decide now versus later. A recommendation that says 'lease and fit out a 20-bed unit now, set a gate for a land purchase at month 18, and do not pursue the acquisition unless the title defect is cured' gives the board a decision it can take."
            ),
          },
        ],
        exercises: [
          {
            title: "Build, buy or lease in Lagos",
            instruction:
              "A group runs an 80-bed hospital in Ikeja at 88% occupancy with an average length of stay of 5.2 days against a peer figure of about 4. It is considering three options for growth in Lekki and Ajah: build a 50-bed hospital (capex N2.4bn over 24 months, pre-opening N180m, ramp losses of N300m in year one and N120m in year two); buy an existing 40-bed hospital in Ajah for N1.6bn plus N250m refurbishment, whose revenue has fallen 15% in two years and whose main surgeon is 64; or lease and fit out a building for a 20-bed unit and outpatients at N450m with a ten-year lease. Set out, for the board, what you would test first at the Ikeja site, the peak funding of each option, the three biggest risks of each, and your recommendation with stage gates.",
          },
          {
            title: "Diligence list for an acquisition",
            instruction:
              "The seller of a 35-bed hospital in Port Harcourt offers a share sale at N1.1bn and shares three years of management accounts showing revenue of N48m a month. Write the diligence plan you would run in four weeks: the ten checks you would make, what document or evidence each relies on, and which three findings would make you advise the client to switch to an asset purchase or walk away.",
          },
        ],
      },
      resources: { tools: ["Spreadsheet (common NPV and peak-funding model)", "Site scoring matrix", "Diligence checklist"] },
      questions: [
        mc(
          "A hospital at 88% occupancy has an average length of stay of 5.0 days. Peers run at 4.0 days for a similar case mix. Before recommending a new site, what does this suggest?",
          [
            "The hospital is full and needs a new site urgently",
            "Bringing stay down to peer level could release roughly a fifth of bed capacity without new capital",
            "Occupancy above 85% is the accepted threshold for a new building, so the board should move straight to site selection",
            "Length of stay is a clinical matter and outside a strategy brief",
          ],
          "b",
          "Cutting stay from 5.0 to 4.0 days frees about 20% of bed-days, which can absorb growth without building. High occupancy alone does not prove the site is used up if the beds are held by slow discharge.",
        ),
        mc(
          "A 50-bed build has capex of N2.4bn, pre-opening costs of N180m, and operating losses of N300m in year one and N120m in year two before break-even. What is the approximate peak funding before any overrun?",
          ["N2.4bn", "N2.58bn", "N3.0bn", "N2.7bn"],
          "c",
          "Peak funding is capex plus pre-opening costs plus cumulative operating losses until cash turns positive: 2.4 + 0.18 + 0.3 + 0.12 = N3.0bn. N2.58bn stops at opening day and leaves out the ramp losses that the owner still has to fund.",
        ),
        mc(
          "A board asks why your payback figure for a new hospital is eight years when the developer's brochure says five. What is the most likely reason?",
          [
            "Your figure is measured from the first naira spent, the developer's from opening day",
            "Your figure uses a lower occupancy at maturity",
            "The developer's figure is in nominal naira and includes inflation, which shortens payback when revenue rises with prices",
            "Payback cannot be calculated for hospitals",
          ],
          "a",
          "Measuring from opening ignores two to three years of construction and pre-opening spend, which flatters payback. A lower occupancy assumption could also lengthen payback, but it would show up in the assumptions, not as a definitional difference.",
        ),
        mc(
          "A group plans a share purchase of a 40-bed hospital. Which liability is it most exposed to that an asset purchase would usually leave with the seller?",
          [
            "The cost of renegotiating HMO contracts",
            "The need to apply for its own facility registration",
            "The cost of re-hiring staff",
            "Unremitted PAYE and pension contributions from prior years",
          ],
          "d",
          "A share purchase acquires the company with all its historic liabilities, including unremitted taxes and pensions. Renegotiating contracts and re-registering are the burdens of an asset purchase, not of a share deal.",
        ),
        mc(
          "In diligence, a seller's accounts show revenue of N48m a month, but HMO remittance advice and bank statements reconcile to about N39m. What should you advise?",
          [
            "Accept the management accounts, since bank statements and HMO remittances miss the cash payments self-pay patients make",
            "Average the two and use N43.5m in the valuation",
            "Treat N39m as the evidenced figure, investigate the gap, and reprice or restructure the offer",
            "Walk away immediately, since the seller is dishonest",
          ],
          "c",
          "The reconciled figure is what the evidence supports, and the gap must be explained before any price is agreed. There may be innocent causes such as cash or timing, so walking away at once is premature, and averaging simply prices in an unexplained number.",
        ),
        mc(
          "Two candidate sites score similarly on demand. Site A has a Certificate of Occupancy in the seller's name; Site B is cheaper but the seller holds only a deed of assignment from a previous owner and no Governor's consent was obtained. What is the right treatment?",
          [
            "Prefer Site B on price and obtain consent after purchase",
            "Treat Site B's title gap as a material risk to cost and time, and require it cured or priced before proceeding",
            "Treat both titles as equivalent, since possession is what matters",
            "Choose Site A only if it also scores higher on traffic",
          ],
          "b",
          "Under the Land Use Act, a transfer without the Governor's consent leaves the title incomplete, which can delay financing, permits and registration. Planning to cure it after purchase moves the risk onto the buyer at the worst moment.",
        ),
        ms(
          "A board is comparing build, buy and lease options for a new market. Which practices make the comparison fair? Select all that apply.",
          [
            "The same time horizon and demand assumptions for every option",
            "Cash flows from the first naira committed, with peak funding shown",
            "The buy option modelled on the seller's own projections",
            "Discounting at a naira rate reflecting the group's real cost of capital",
            "A ten-year horizon for build and five years for buy, to match asset lives",
          ],
          ["a", "b", "d"],
          "Comparable horizons, assumptions and discount rates, with peak funding visible, put options on the same footing. Seller projections and mismatched horizons build a bias into the comparison before any judgement is made.",
        ),
        mc(
          "A lease-and-convert satellite has a lower NPV than building a full hospital, but you recommend it. Which reason best justifies the recommendation?",
          [
            "It keeps the build decision open until demand is proved, limiting the loss if demand is weak",
            "A lease carries no capital cost and is always cheaper than ownership over the life of the facility, whatever the rent",
            "Lower NPV options are less risky by definition",
            "Lenders prefer to fund leases",
          ],
          "a",
          "The value of staged commitment is the option to build later with evidence, which the static NPV does not capture. Leases are not always cheaper over a long horizon, so price alone is a weak argument.",
        ),
        mc(
          "An acquisition target's revenue has fallen 15% in two years and 40% of surgical revenue comes from one surgeon aged 64 with no succession plan. How should this affect the buy-versus-build comparison?",
          [
            "It matters little, since a surgeon can be replaced after completion and the patients are loyal to the hospital's name rather than to one doctor",
            "It makes the acquisition more attractive because the price will be lower",
            "It only affects the integration plan, not the price",
            "It reduces the value of the ramp-up that buying is meant to avoid, so the price and retention terms must reflect it",
          ],
          "d",
          "Buying is worth more than building only if the patient book transfers and holds, and a declining book tied to one surgeon may not. A lower price helps only if it fully reflects that risk, which is the point of the adjustment.",
        ),
        ms(
          "Before presenting any site plan for a group that says its flagship is 'full', which lower rungs of the expansion ladder should you have tested? Select all that apply.",
          [
            "Extending hours and days on existing theatre and clinic capacity",
            "Converting under-used space in the existing building",
            "A satellite clinic or diagnostic point that feeds the main hospital",
            "Acquiring a competitor in the same catchment",
          ],
          ["a", "b", "c"],
          "Extending hours, converting space and adding a feeder site all add capacity with far less capital and risk than a new site. An acquisition is a higher rung, not an alternative to proving the existing site is full.",
        ),
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    {
      slug: "group-portfolio-strategy",
      name: "Group Strategy Across a Portfolio",
      description:
        "What a group centre must add to justify itself, the roles units play in a healthcare portfolio, allocating capital across them, what to centralise, and governing units with different owners.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "What a group centre is for",
            body: p(
              "A group of hospitals and health businesses only makes sense if the centre adds more value to each unit than the unit would have on its own, after counting the cost of the centre. This is the idea of parenting advantage, developed by Goold, Campbell and Alexander: the question is not whether a business is attractive, but whether this particular parent makes it better than another owner, or no owner, would.",
              "The centre has costs that are easy to miss. There is the visible overhead: group finance, HR, procurement, legal, a chief executive's office. There are also slower decisions, because a unit head who once could approve a new consultant now waits for a group committee, and distraction, because unit leaders spend time reporting upward instead of running their units. In Nigerian groups that grew from a founder's single hospital, the centre is often the founder's office with a few added functions, and its value and cost have never been examined.",
              "Value comes from a short list of sources. Capital: access to funding on better terms than a single unit could get, and disciplined allocation between units. Purchasing power: consumables, drugs, implants and HMO negotiations at group scale. Talent: the ability to recruit, develop and move senior clinicians and managers. Standards: clinical governance, quality systems and accreditation that a small unit cannot build alone. Brand and referral: one name patients trust, and patient flows between units.",
              "For each claimed source of value, ask whether it is real today and what it is worth in naira. A group that negotiates drugs centrally but lets every unit buy its own consumables, and has no internal referral pathway, is claiming advantages it does not deliver. Writing these down, with evidence, is the starting point of any group strategy."
            ),
          },
          {
            title: "Roles in a healthcare portfolio",
            body: p(
              "Units in a healthcare group do different jobs, and each should be judged against its role rather than against one yardstick. Measuring a feeder clinic by its own profit, for example, leads a group to close the very clinics that fill its main hospital.",
              "Common roles in Nigerian groups include: the flagship or referral hospital, with specialists, theatres and intensive care, which carries the brand and takes complex cases; feeder clinics and primary care sites, which register families, handle routine care and refer onward; specialist centres, such as fertility, cardiac or orthopaedic units, which may draw patients from across the country and the diaspora; diagnostics and laboratories, which serve the group and outside referrers; pharmacy and retail; and non-clinical businesses such as training schools, medical equipment or facility services.",
              "For each role, define the measures that show whether it is working. A feeder clinic's measures include registered patients, referrals into the flagship and the downstream revenue those referrals produce, as well as its own operating result. A diagnostic centre should be measured on its external revenue and turnaround times, and on what the group would pay an outside provider for the same tests. A flagship's measures include case mix and specialist utilisation.",
              "Map the flows between units, not just the units. A group may find that its three clinics refer most of their surgical patients to a competitor because the flagship's booking process is slow. Or that its laboratory serves the group at prices above what an independent lab would charge. These flows are where much of the value or loss of a portfolio sits, and they appear in no single unit's accounts.",
              "Units with no clear role, or whose role another unit or an outside provider performs better, are candidates for change: merger into another unit, sale, partnership or closure."
            ),
          },
          {
            title: "Allocating capital across the portfolio",
            body: p(
              "Capital allocation is the most important decision a group centre makes and the one most often made badly. In many groups, capital follows history, the loudest unit head or the founder's interest, and every unit gets a share whether or not it can earn a return on it.",
              "Start from return on capital, measured consistently. For each unit, compare operating profit with the capital tied up in it, including buildings, equipment and working capital. A hospital that earns N300m a year on N3bn of capital returns 10%; a diagnostic centre that earns N120m on N500m returns 24%. Before reading too much into this, adjust for role: a feeder clinic with a low standalone return may be generating a high return through the referrals it sends to the flagship.",
              "Set a hurdle rate in naira that reflects the group's real cost of capital. With high inflation and commercial lending rates, a naira hurdle rate needs to be far higher than the figures in textbooks from low-inflation economies, or the group will approve projects that destroy value in real terms. Projects with foreign-currency costs, such as imported equipment, should be tested against exchange-rate scenarios.",
              "Allocate from the top down as well as the bottom up. Each budget cycle, decide how much capital the group can commit, which units are priorities given the group strategy, and then compare projects across units on the same basis. Avoid spreading capital evenly so that every unit can do something, which leaves no unit able to do anything that matters.",
              "Be willing to stop. Capital already spent is gone, and the decision is always about the next naira. A unit that has absorbed N800m and still loses money is not owed another N200m because of what it has already had."
            ),
          },
          {
            title: "What to centralise and what to leave",
            body: p(
              "Centralise functions where scale or consistency clearly adds value and where the unit loses little by giving up control; leave decisions close to the patient and the referrer with the unit. Groups that centralise everything lose the responsiveness that made each unit succeed, and groups that centralise nothing are not really groups.",
              "Functions that usually benefit from central control include: treasury and funding, financial reporting and controls, procurement of high-value drugs, consumables and implants, payor contracting with the large HMOs, IT systems and data, HR policy and senior appointments, and clinical governance standards. Functions that usually work better locally include day-to-day operations, local referral relationships with GPs and community leaders, rosters, and much of patient experience. Clinical leadership sits between: standards should be group-wide, but each unit needs a medical director with real authority.",
              "Charge central services to units in a way that reflects use. A group that allocates its entire head office cost by revenue makes its largest unit pay for services used mostly by smaller ones, and every unit learns to resent the centre. Agree a service catalogue, a cost basis and a review each year, and allow a unit to challenge a charge that is clearly above what an outside provider would cost.",
              "Transfer pricing between units deserves the same care. When the group laboratory serves the group hospitals, set prices at or near what an independent laboratory would charge. Prices above that move profit from hospitals to the lab and disguise how each is really performing. Prices well below may lead to over-ordering. Where units have different owners, transfer prices also become a fairness and governance question, covered next."
            ),
          },
          {
            title: "Governing units with different owners",
            body: p(
              "Many Nigerian healthcare groups include units that are not wholly owned: joint ventures with partner doctors, SPVs with investors, units held with a landlord or a family partner. Each partial owner changes what the group can decide alone, and governance has to be designed for that from the start.",
              "The shareholders' agreement should set out the reserved matters that need the consent of both parties, such as new capital, borrowing, the business plan, appointments of the chief executive and medical director, related-party transactions and the sale of shares. It should give each party information rights, a board composition that reflects ownership and expertise, a mechanism for resolving deadlock, and clear exit terms. Without these, disputes are resolved by whoever holds the bank mandate.",
              "Conflicts of interest are the main risk. If the group owns 100% of its flagship hospital and 51% of a fertility joint venture, it has an incentive to direct patients, staff or profits towards the wholly owned unit. Central charges and transfer prices that favour the group over the joint venture are, in substance, a transfer from the minority partner. A partner who discovers this will lose trust quickly, and the joint venture will fail regardless of its clinical success.",
              "Good practice is to state openly where the group and the joint venture might compete, and agree the rules: which services each provides, how referrals between them work, and how central charges and transfer prices are set and reviewed. Related-party transactions should be approved by the joint venture board with the group's conflicted directors stepping out.",
              "A minority partner is often a senior clinician whose reputation is the reason patients come. Treating that person as a junior to be managed, rather than a partner to be supported, is the fastest way to lose the value the joint venture was created for."
            ),
          },
        ],
        exercises: [
          {
            title: "Capital allocation for a five-unit group",
            instruction:
              "A group has five units: a 120-bed flagship hospital in Abuja (operating profit N420m, capital employed N4.2bn), two primary care clinics (each losing N25m a year on N150m of capital, together referring patients who generate N600m of flagship revenue a year at a 35% contribution), a diagnostic centre (profit N140m on N550m), and a 51% fertility joint venture with a consultant partner (profit N90m on N400m). It has N900m of capital for next year. Requests are: N600m for a flagship cardiac theatre, N150m for a third clinic, N250m for an MRI at the diagnostic centre, and N200m for a second fertility laboratory. Calculate each unit's standalone and role-adjusted return, propose an allocation within N900m with reasons, and state the hurdle rate you used and why.",
          },
        ],
      },
      resources: { tools: ["Spreadsheet (return on capital by unit)", "Service catalogue template", "Shareholders' agreement checklist"] },
      questions: [
        mc(
          "A group centre costs N180m a year. It negotiates drug prices centrally, saving about N60m a year, but each unit buys its own consumables, recruits its own staff and runs its own systems. Units report that approvals now take twice as long. What is the most accurate assessment?",
          [
            "The centre clearly adds value through purchasing",
            "The centre should be closed immediately and each unit should run itself, since a centre that costs more than it saves cannot be redesigned",
            "The centre's evidenced value is well below its cost, so its role needs redefining around real sources of value",
            "The centre's value cannot be judged in naira",
          ],
          "c",
          "Parenting advantage requires the value added to exceed the centre's full cost, including slower decisions; N60m against N180m and slower approvals fails that test. Closing it immediately ignores value that a redesigned centre could deliver.",
        ),
        mc(
          "A group's primary care clinic loses N30m a year on its own accounts, but its referrals generate N500m of flagship revenue at a 30% contribution. The CFO proposes closing it. What should you advise?",
          [
            "Keep it: its referrals contribute about N120m a year net of its loss, if they would not arrive otherwise",
            "Close it, because each unit in a group must cover its own costs, and a clinic that loses N30m a year is being subsidised by the flagship",
            "Keep it, because clinics are always strategic",
            "Close it and spend the savings on flagship marketing",
          ],
          "a",
          "The referrals contribute N150m, which leaves about N120m after the clinic's loss, so the feeder role justifies it if the referrals depend on the clinic. Saying clinics are always strategic reaches the same answer without the evidence that makes it defensible.",
        ),
        mc(
          "A hospital earns N360m operating profit on N3.6bn capital employed. A diagnostic centre in the same group earns N110m on N500m. What are their returns on capital?",
          ["36% and 11%", "22% and 10%", "10% and 22%", "10% and 11%"],
          "c",
          "N360m divided by N3.6bn is 10%, and N110m divided by N500m is 22%. Reading the hospital's larger profit as the better return is the common mistake.",
        ),
        mc(
          "A group's investment committee approves projects that clear a 12% naira hurdle rate, taken from a textbook. Naira inflation and commercial lending rates are both well above that. What is the main risk?",
          [
            "Too few projects will be approved",
            "Projects will be approved that destroy value in real terms",
            "The hurdle rate is too high for healthcare",
            "The rate only matters for foreign-currency projects",
          ],
          "b",
          "A hurdle below the real naira cost of capital approves projects whose returns do not cover inflation and funding costs. The opposite risk, approving too few, arises only when the hurdle is set too high.",
        ),
        mc(
          "Last year a group gave each of its six units roughly equal capital so that every unit head could do 'something'. What is the main weakness of this approach?",
          [
            "It is unfair to the larger units, which generate most of the group's cash and should receive capital in proportion to their revenue",
            "It breaches the group's governance rules",
            "It creates too much paperwork",
            "It funds projects by unit rather than by return and strategic priority, so no unit can do anything that matters",
          ],
          "d",
          "Spreading capital evenly ignores which projects earn returns and fit the group strategy, and leaves each unit with too little. Unfairness to large units is a side effect, not the core problem.",
        ),
        ms(
          "Which functions usually benefit most from central control in a healthcare group? Select all that apply.",
          [
            "Treasury and funding",
            "Procurement of high-value drugs, consumables and implants",
            "Local referral relationships with GPs",
            "Contracting with the large HMOs",
            "Daily nursing rosters",
          ],
          ["a", "b", "d"],
          "Treasury, high-value procurement and large payor contracts gain from scale and consistency. Referral relationships and rosters depend on local knowledge and relationships, which central control weakens.",
        ),
        mc(
          "A group laboratory charges the group's hospitals 30% above what an independent laboratory would charge for the same tests. What is the main consequence?",
          [
            "The group's consolidated profit falls by the amount of the overcharge, because the hospitals pay more than they should",
            "Profit is moved from the hospitals to the laboratory, distorting how each unit appears to perform",
            "The hospitals receive better service",
            "Tax is automatically reduced",
          ],
          "b",
          "Above-market transfer prices shift reported profit between units, making the lab look better and the hospitals worse than they are. The consolidated profit does not fall, because the charge is internal.",
        ),
        mc(
          "A group owns 100% of its flagship and 51% of a fertility joint venture with a consultant. The group allocates head office costs to the joint venture by revenue, so it pays 25% of costs for services it barely uses. What is the substance of this?",
          [
            "A standard and fair allocation method",
            "A tax planning device",
            "A routine accounting matter for the joint venture's auditors to review at year end, not a question of fairness between owners",
            "A transfer of value from the minority partner to the group",
          ],
          "d",
          "Charging the joint venture for services it does not use moves profit from a 51% unit to wholly owned units, so the partner bears 49% of a cost that benefits the group. Revenue allocation is common, which is why it is the tempting answer, but it is not fair where use differs.",
        ),
        mc(
          "Which of these should be a reserved matter in a shareholders' agreement for a hospital joint venture between a group and partner doctors?",
          [
            "Approval of related-party transactions with the group",
            "Approval of daily theatre lists",
            "The choice of cleaning supplier",
            "Setting nursing shift times",
          ],
          "a",
          "Related-party transactions are where the majority owner's conflict sits, so they need both parties' consent. Theatre lists, cleaning and shifts are operational matters that would paralyse the board if reserved.",
        ),
        ms(
          "A group plans a 51% joint venture with a well-known orthopaedic surgeon, close to its own flagship, which also does some orthopaedics. Which steps reduce the conflict-of-interest risk? Select all that apply.",
          [
            "Agree in writing which services each provides and how referrals between them work",
            "Set central charges and transfer prices on a stated basis reviewed each year",
            "Have related-party transactions approved by the joint venture board with the group's conflicted directors stepping out",
            "Give the group chairman a casting vote on all matters to speed decisions",
          ],
          ["a", "b", "c"],
          "Clear service boundaries, transparent charging and conflicted directors stepping aside make the conflict visible and governed. A group casting vote on everything removes the protection the partner relies on and invites the dispute it is meant to avoid.",
        ),
      ],
    },
  ],
};

export default expansion;
