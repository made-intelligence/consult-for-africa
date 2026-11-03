import type { TrackExpansion } from "./types";

const expansion: TrackExpansion = {
  slug: "health-deals-fundraising",
  track: {
    name: "Health Deals & Fundraising",
    description:
      "How Nigerian health businesses choose, price and close their capital. Covers matching debt, equity, grants and asset finance to the need, valuing a healthcare business, building an investor-grade plan and model, structuring joint ventures and SPVs, and running due diligence through to completion.",
    level: "SPECIALIST",
    category: "finance",
    iconName: "landmark",
    colorHex: "#7C3AED",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "PAID",
  },
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "capital-options-health",
      name: "Debt, Equity, Grants and Asset Finance: Choosing the Capital",
      description:
        "Matching each kind of capital to what it will pay for, what it costs a Nigerian health business in practice, and what each one asks of the owners in return.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "Match the money to the asset and the cash it produces",
            body: `The first question in any raise is not where to find money but what the money is for, because each use has a natural kind of capital. A hospital that funds a ten-year building with a one-year overdraft, or a drug stock with expensive equity, has made the most common and most expensive financing mistake.

Sort the need into four buckets before approaching anyone:
- long-life assets such as land, buildings and major fit-out, which pay back over many years;
- equipment with a working life of five to ten years, such as imaging, theatre and laboratory analysers;
- working capital, the cash tied up in drugs, consumables and receivables while the hospital waits to be paid;
- losses during ramp-up, the months between opening and break-even, plus anything genuinely uncertain such as a new service line.

The matching rule follows. Long-life assets suit long-tenor debt or equity. Equipment suits asset finance, because the equipment itself is the security and the payments can be timed to the revenue it earns. Working capital suits short-term facilities that rise and fall with activity, including the claims financing covered in the payor track. Ramp-up losses and uncertain ventures suit equity, because no lender wants to fund a loss, and debt repayments that start before revenue arrives can sink an otherwise sound project.

In Nigeria the matching rule bends under two pressures. Long-tenor naira debt is scarce and expensive, so owners often fund buildings with short loans and roll them over, carrying refinancing risk. And many health businesses are owned by founder-doctors who are reluctant to give up equity, so they push debt further than the cash flow can carry.

A consultant's contribution is to lay out the need in these buckets with numbers, show the cash flow each part will generate and when, and then match. A plan that says "we need N800m" is unanswerable. A plan that says "N450m for the building over fifteen years, N180m of equipment, N70m of working capital and N100m to cover twelve months of ramp-up" can be financed piece by piece.`,
          },
          {
            title: "Debt in the Nigerian market",
            body: `Debt is the cheapest capital when the business can service it and the most dangerous when it cannot. The test is cash, not profit: will operating cash flow cover interest and principal, with room to spare, in a bad year?

Commercial bank lending to health businesses in Nigeria usually comes with high naira interest rates that move with the monetary policy rate, short tenors, and heavy collateral. Banks typically ask for a legal mortgage over property with a perfected title, a debenture over the company's assets, and personal guarantees from the owners. Perfecting security over land involves the state's consent process and can take months, which delays drawdown.

Lenders measure capacity with a debt service cover ratio: cash available for debt service divided by interest and principal due in the period. A ratio comfortably above one in the base case, with a covenant set below that, is the usual expectation. A hospital that generates N120m of operating cash a year and faces N100m of annual debt service has a ratio of 1.2. One bad quarter of HMO payments could breach a covenant.

Development finance institutions, including the Bank of Industry and international lenders that work through Nigerian banks, can offer longer tenors and lower rates than commercial banks for qualifying projects. Their processes are slower and documentation is heavier, including environmental and social requirements. Government intervention schemes for healthcare lending have come and gone, so check what is open at the time rather than relying on a programme that existed last year.

Foreign currency loans look cheaper on the headline rate but carry currency risk for a business that earns in naira. A loan of USD 1m taken when the naira was at one rate must be repaid at whatever rate applies later. Nigerian borrowers who took dollar debt before recent devaluations saw the naira value of their debt multiply. Unless revenue is in hard currency, as with some medical tourism or diaspora-funded services, a dollar loan is a currency bet.`,
          },
          {
            title: "Asset finance, vendor finance and property structures",
            body: `For equipment and buildings, there are ways to pay that do not need a bank loan or new shareholders, and they are underused by Nigerian hospitals.

Equipment leasing lets a hospital use an asset in exchange for regular payments. Under a finance lease the hospital effectively buys the asset over the lease term and carries it on the balance sheet; under an operating lease it rents the asset for part of its life and may return or upgrade it. Leasing companies and some banks offer both. The lessor's security is the equipment itself, so personal guarantees and property collateral can be lighter.

Vendor finance comes from the equipment supplier. A manufacturer or distributor may accept a deposit and spread the balance over two or three years, sometimes bundled with a maintenance contract. For laboratories, reagent rental is common: the supplier places an analyser at no upfront cost and recovers its value through a higher price per test kit, with a minimum monthly volume. This turns capital cost into variable cost, which suits a lab whose volumes are uncertain, but can become expensive if volumes grow and the hospital is locked into the reagent price.

Managed equipment services go further: a provider supplies, maintains and replaces equipment for a fixed fee per year or per procedure. They work for imaging and dialysis, where uptime matters and in-house biomedical engineering is thin.

Property is the largest single asset in most hospital deals. Sale and leaseback lets an owner sell the building to an investor and lease it back on a long lease, releasing capital tied up in bricks to fund operations or expansion. It also separates the property company from the operating company, which some equity investors prefer, since they want to invest in the hospital business, not in Lagos real estate. The cost is a permanent rent obligation that must be affordable from operating cash, with review clauses that do not outrun the hospital's own price increases.`,
          },
          {
            title: "Equity and grants: what the money asks in return",
            body: `Equity costs nothing in interest and can be the most expensive capital the owners ever raise. It buys a share of all future value and usually a say in how the business is run. Grants cost nothing to repay but buy specific outcomes and come with restrictions.

The sources of equity for a Nigerian health business run from family and friends, through angel investors and high-net-worth individuals, to private equity and impact funds, and to strategic investors such as a larger hospital group, a pharmaceutical distributor or an insurer. Each wants something different. Family money wants trust and modest information. A private equity fund wants a defined return over a holding period of perhaps five to seven years, a board seat, information rights, a say over major decisions and a credible route to exit by sale or by bringing in a larger investor. A strategic investor may want access to patients, referrals or supply, and may later want control.

Founder-doctors often resist equity because it dilutes control. The useful reframe is the price of the alternative. If the business can only grow by taking debt it cannot service, the founder may keep 100% of a business that fails. Selling 30% to fund growth that the business could not otherwise afford may leave the founder with a larger and safer 70%.

Grants come from foundations, development partners and some government programmes. They suit public health outcomes, research, training, digital pilots, and services for underserved populations. They rarely fund the core capital of a private hospital and should not be planned as if they will. They are also restricted: money given for a maternal health programme must be spent on that programme and reported against, which needs its own accounting.

Blended structures combine these. An impact fund might take a minority equity stake while a development lender provides long-tenor debt and a foundation funds a community outreach component. The structure is more complex to negotiate, but each piece of money is doing what it is suited for.`,
          },
        ],
        exercises: [
          {
            title: "Finance plan for Ibadan Heritage Specialist Hospital",
            instruction:
              "Ibadan Heritage Specialist Hospital plans a new 40-bed wing. The owners estimate: building and fit-out N520m, imaging and theatre equipment N210m, laboratory analysers N45m, working capital N80m, and ramp-up losses of N95m over the first fourteen months. The hospital already generates N140m of operating cash a year and services N60m of existing debt annually. The founder owns 100% and does not want to sell more than 25%. Sort the need into the four buckets, propose a source for each piece with reasons, estimate the debt service cover ratio if N400m of new bank debt over seven years were added at your assumed rate, and state where equity is unavoidable.",
          },
        ],
      },
      resources: { tools: ["Capital needs bucketing template", "Debt service cover calculator"] },
      questions: [
        {
          question:
            "A hospital plans to fund a new building expected to pay back over twelve years with a one-year bank facility, rolled over annually. What is the main risk?",
          options: [
            { id: "a", text: "The interest rate on a one-year facility is always higher than on a twelve-year loan", isCorrect: false },
            { id: "b", text: "Refinancing risk: each year the bank may decline to roll over, or reprice, while the building is still years from paying back", isCorrect: true },
            { id: "c", text: "The building cannot be used as collateral for a short facility under Nigerian law", isCorrect: false },
            { id: "d", text: "The hospital will not be able to claim tax relief on the interest paid on a short-term facility for a long-term asset", isCorrect: false },
          ],
          explanation:
            "Funding a long asset with short money means the lender can withdraw or reprice before the asset pays back. Short rates are not always higher; the danger is the mismatch, not the price.",
        },
        {
          question:
            "Which use of funds most clearly suits equity rather than debt?",
          options: [
            { id: "a", text: "Twelve months of operating losses while a new service line ramps up", isCorrect: true },
            { id: "b", text: "A CT scanner with a working life of eight years and a reliable referral base", isCorrect: false },
            { id: "c", text: "Drug stock that turns over every six weeks and is mostly sold to self-pay patients at the pharmacy counter", isCorrect: false },
            { id: "d", text: "A building that the hospital will occupy for twenty years and that can be mortgaged to the lender", isCorrect: false },
          ],
          explanation:
            "Lenders do not want to fund losses, and repayments starting before revenue arrives can sink the project. The scanner suits asset finance, the stock suits working capital lines and the building suits long-tenor debt.",
        },
        {
          question:
            "A hospital generates N120m of operating cash a year and would face N100m of annual interest and principal on a proposed loan. What does its debt service cover ratio suggest?",
          options: [
            { id: "a", text: "At 0.83, the loan cannot be serviced at all", isCorrect: false },
            { id: "b", text: "At 1.2, the loan is comfortably affordable and the hospital could borrow more", isCorrect: false },
            { id: "c", text: "At 1.2, there is thin headroom, and one bad quarter of HMO payments could breach a covenant", isCorrect: true },
            { id: "d", text: "The ratio cannot be calculated without the hospital's profit after tax and its depreciation charge for the same year", isCorrect: false },
          ],
          explanation:
            "N120m over N100m is 1.2, which leaves little room for a weak quarter. Reading 1.2 as comfortable is the tempting error; profit after tax is not the measure, cash available for debt service is.",
        },
        {
          question:
            "A diagnostics centre earning all its revenue in naira is offered a US dollar loan at a much lower headline rate than naira bank debt. What is the consultant's main concern?",
          options: [
            { id: "a", text: "Dollar loans are not permitted for health businesses in Nigeria", isCorrect: false },
            { id: "b", text: "The loan will need approval from the Federal Ministry of Health before drawdown can take place, which can delay the project by months", isCorrect: false },
            { id: "c", text: "The lender will require the centre to bill patients in dollars", isCorrect: false },
            { id: "d", text: "Currency risk: if the naira weakens, the naira cost of repaying the loan rises, while revenue does not", isCorrect: true },
          ],
          explanation:
            "Borrowing in a currency the business does not earn is a currency bet, and recent devaluations multiplied many such debts. Dollar loans are not prohibited; the issue is the mismatch.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A laboratory with uncertain test volumes is offered an analyser on reagent rental: no upfront cost, a higher price per test kit and a minimum monthly volume. In which situations does this become expensive? Select all that apply.",
          options: [
            { id: "a", text: "Volumes fall below the minimum and the lab pays for kits it does not use", isCorrect: true },
            { id: "b", text: "Volumes grow strongly and the lab stays locked into the higher reagent price on every test", isCorrect: true },
            { id: "c", text: "Volumes stay close to the forecast level the supplier priced the agreement on", isCorrect: false },
            { id: "d", text: "The supplier's service engineer visits for routine maintenance included in the agreement", isCorrect: false },
          ],
          explanation:
            "The minimum volume bites when activity is low and the reagent premium bites when activity is high, so both ends need modelling. Near the forecast volume the arrangement works as priced, and included maintenance is part of its value.",
        },
        {
          question:
            "A private equity fund is interested in a hospital but says it does not want to own Lagos real estate. The owner holds the building in the operating company. Which structure answers the fund's concern?",
          options: [
            { id: "a", text: "Separate the property into its own company that leases the building to the operating company, so the fund invests only in the hospital business", isCorrect: true },
            { id: "b", text: "Sell the whole company, building included, to the fund at a discount to reflect the property", isCorrect: false },
            { id: "c", text: "Ask the fund to take a mortgage over the building as security for its equity investment", isCorrect: false },
            { id: "d", text: "Revalue the building upwards so that the fund's stake looks better value and the owner keeps more shares", isCorrect: false },
          ],
          explanation:
            "A property company and operating company split lets the fund buy the business it wants while the owner keeps the property. Selling at a discount gives away value, and equity is not secured by mortgages.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A founder-doctor owns 100% of a clinic and refuses any equity investor. Growth would need N300m the clinic cannot borrow without breaching a 1.3 cover ratio. Which points belong in the consultant's advice? Select all that apply.",
          options: [
            { id: "a", text: "Keeping 100% of a business that cannot fund its growth may be worth less than 70% of one that can", isCorrect: true },
            { id: "b", text: "Equity investors will usually expect a board seat, information rights and a route to exit", isCorrect: true },
            { id: "c", text: "Debt is always cheaper, so the founder should borrow regardless of the cover ratio", isCorrect: false },
            { id: "d", text: "Phasing the growth so that part of it is funded by debt within the cover limit is an alternative to consider", isCorrect: true },
          ],
          explanation:
            "Dilution has to be weighed against what the capital makes possible, investors' terms should be explained honestly, and phasing is a real alternative. Debt is cheap only while it can be serviced.",
        },
        {
          question:
            "A hospital's business plan counts on a N150m foundation grant to fund its new theatre complex. What is the problem?",
          options: [
            { id: "a", text: "Foundation grants must be repaid with interest after five years", isCorrect: false },
            { id: "b", text: "Grants rarely fund the core capital of a private hospital, so the plan rests on money that is unlikely to come", isCorrect: true },
            { id: "c", text: "Grants can only be received by government-owned hospitals and their agencies", isCorrect: false },
            { id: "d", text: "A grant would dilute the founder's shareholding in the same way as equity does, and the foundation would expect a seat on the board", isCorrect: false },
          ],
          explanation:
            "Grants suit public health outcomes, research, training and underserved services, not private theatre capex. Private organisations can receive grants, so eligibility is not the barrier; fit is.",
        },
        {
          question:
            "Why does perfecting a legal mortgage over land often delay drawdown of a Nigerian bank loan?",
          options: [
            { id: "a", text: "The state consent process for creating the mortgage can take months", isCorrect: true },
            { id: "b", text: "The Corporate Affairs Commission must value the land before any loan is made against it", isCorrect: false },
            { id: "c", text: "Banks cannot lend against land until the hospital has operated on it for three years", isCorrect: false },
            { id: "d", text: "The NHIA must approve any charge over hospital property used for insured patients", isCorrect: false },
          ],
          explanation:
            "Creating a mortgage over land generally needs the state's consent, which is slow. Registration of charges at the Corporate Affairs Commission is also needed, but CAC does not value land.",
        },
        {
          question:
            "A dialysis unit with thin in-house biomedical engineering needs four new machines and cannot afford downtime. Which option best fits?",
          options: [
            { id: "a", text: "A five-year bank loan to buy the machines outright, with the unit's own staff doing maintenance", isCorrect: false },
            { id: "b", text: "An equity investor to fund the machines in exchange for a share of the unit", isCorrect: false },
            { id: "c", text: "A managed equipment service in which the provider supplies, maintains and replaces the machines for a fee", isCorrect: true },
            { id: "d", text: "Buying refurbished machines with cash from the overdraft to save on interest and leasing fees, and training a nurse to maintain them", isCorrect: false },
          ],
          explanation:
            "Where uptime matters and maintenance capacity is thin, a managed service shifts both to the provider. Buying outright leaves the maintenance gap, which is the real risk here.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "valuing-health-businesses",
      name: "Valuing a Healthcare Business",
      description:
        "Normalising earnings, using multiples and discounted cash flow honestly in naira, bridging to equity value, and pricing the risks particular to Nigerian health businesses.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "Value starts with normalised earnings",
            body: `A valuation is only as good as the earnings it is built on, and in an owner-run health business the reported earnings are rarely the earnings a new owner would get. Normalising means adjusting the accounts to show what the business would earn under arm's-length, sustainable operation.

The usual measure is EBITDA, earnings before interest, tax, depreciation and amortisation, because it approximates operating cash generation before financing choices. Start from the audited or management accounts and adjust for:
- the founder-doctor's pay: if the founder takes no salary but works full time as medical director and lead surgeon, deduct the market cost of replacing that work; if the founder takes an unusually large salary, add back the excess;
- related-party rent: if the hospital occupies the owner's building rent-free or at a token rent, deduct a market rent;
- personal expenses run through the company, such as family cars or travel;
- one-off items, such as a large legal settlement or a year of exceptional COVID-era testing revenue;
- under-provisioned receivables, which make past revenue look better than the cash collected.

Each adjustment should be documented and defensible. Buyers and investors adjust in their own favour; sellers adjust in theirs. A consultant advising either side builds the bridge from reported to normalised EBITDA line by line, so the negotiation is about specific items, not a vague sense that the numbers are wrong.

Normalisation often moves the figure a long way. A clinic reporting N180m of EBITDA may normalise to N110m once a N40m market salary for the founder's clinical work, N20m of market rent and N10m of personal expenses are adjusted. A valuation on the higher figure would overstate the business by more than half at any multiple.

Use a trailing twelve months figure, and look at three years to see the trend. A business whose EBITDA has risen strongly for two years and fallen in the last six months tells a different story from one with steady growth, even if the annual figures look similar.`,
          },
          {
            title: "Multiples and the bridge to equity value",
            body: `An EBITDA multiple values a business by reference to what similar businesses have sold or been priced for. It is quick and widely used, but the hard part in Nigeria is finding genuinely similar transactions.

Enterprise value, the value of the whole operating business regardless of how it is funded, equals normalised EBITDA multiplied by a multiple. Listed healthcare companies abroad trade at multiples that reflect large, diversified, liquid businesses in stable currencies. A single Nigerian hospital is smaller, less liquid, more dependent on a few people, and earns in a currency that has lost much of its value against the dollar. It deserves a meaningfully lower multiple, and the evidence for what that multiple should be comes mainly from local private transactions, which are seldom published.

When local evidence is thin, triangulate. Ask what multiple a likely buyer, such as a regional hospital group or a fund, has paid in recent deals it will discuss. Cross-check against a discounted cash flow. Test what return a buyer would make at the implied price.

Enterprise value is not what the shareholders receive. The bridge to equity value deducts net debt, meaning borrowings less surplus cash, and adjusts for working capital against a normal level. Other debt-like items should come off too: unpaid tax, deferred staff entitlements, unpaid supplier arrears beyond normal terms, and, often in Nigerian health businesses, overdue pension remittances.

Suppose a hospital has normalised EBITDA of N150m and the parties agree a multiple of 5. Enterprise value is N750m. If bank loans are N220m, cash is N30m and there are N25m of unremitted pension contributions, net debt and debt-like items total N215m and equity value is N535m. A seller who quotes the N750m as "what the business is worth to me" is confusing the two, and a buyer who pays it would be paying off the seller's debts as well.`,
          },
          {
            title: "Discounted cash flow in naira",
            body: `A discounted cash flow (DCF) values a business as the present value of the cash it will generate. It forces explicit assumptions about growth, margins and investment, which is its strength, and it is extremely sensitive to the discount rate and terminal value, which is its weakness.

Forecast free cash flow for five to ten years: EBITDA less tax, less capital expenditure, less increases in working capital. In a hospital, working capital matters more than people expect, because growth in HMO revenue ties up cash in receivables before any is collected.

The discount rate should reflect what an investor in this business could earn elsewhere for similar risk. In naira terms that starts from a high risk-free rate, set by government bond yields, and adds a premium for equity risk, size and the particular risks of the business. The resulting rate is high by international standards. Discounting naira cash flows at a dollar rate, or dollar cash flows at a naira rate, is a common error that produces nonsense. Keep currency and rate consistent: if the forecast is in nominal naira with inflation built in, use a nominal naira discount rate.

Terminal value, the value of cash flows beyond the forecast period, often makes up most of a DCF's result. If it accounts for 75% of the value, the valuation is mainly an assumption about the long-term growth rate and the discount rate. Show the sensitivity: a table of values across a range of discount rates and terminal growth rates makes clear how wide the honest range is.

Tax enters through the cash flow. The 2025 tax reform changed company taxes in Nigeria, including the treatment of smaller companies and the consolidation of several levies. Use the rules in force for the forecast period, take tax advice on the specific business, and do not carry over rates from older models without checking them.

A DCF is most useful as a discipline and a cross-check on the multiple, not as a single number that settles the price.`,
          },
          {
            title: "What drives value up or down in health",
            body: `Two hospitals with the same EBITDA can be worth very different amounts. The difference lies in how durable those earnings are, and in health businesses a few risks recur.

Key-person dependence is the most common. If most of the revenue follows one founder-surgeon, a buyer is paying for that person's continued work, which no share purchase guarantees. Value rises when the business has several consultants with their own followings, documented referral relationships, and a founder who will stay for a defined period under contract.

Payor concentration matters next. A hospital where one HMO pays 40% of revenue on an old tariff carries a risk that a buyer will price. A diversified payor book with clean receivables and reliable payment is worth more per naira of EBITDA.

Licences and registrations are often tied to people or premises. A facility licence from a state regulator such as HEFAMAA in Lagos is issued for a particular facility and operator. A change of ownership or premises may require notification or a new application, and some registrations depend on a named medical director. A buyer will want to know what transfers, what needs consent, and what could be lost.

Property and title affect value directly. A hospital on land with a clear Certificate of Occupancy and registered interests is easier to finance and sell than one on land with an unperfected or disputed title.

Quality and reputation are harder to price but real. Clinical incidents, litigation, poor accreditation status or a record of regulatory sanction lower value. Accreditation by SafeCare or JCI, a well-run clinical governance system and good patient reviews raise it, mainly by making earnings more durable.

These factors move the multiple or the cash flow forecast. A consultant should list them explicitly, give a view on each, and show how they explain the gap between a seller's expectation and a buyer's offer. That list is often the agenda for the negotiation.`,
          },
        ],
        exercises: [
          {
            title: "Valuation range for Port Harcourt Riverside Clinic",
            instruction:
              "Port Harcourt Riverside Clinic reports EBITDA of N210m. The founder-surgeon draws no salary but performs half the clinic's procedures; a market replacement would cost N48m a year. The clinic occupies the founder's building rent-free; market rent is N30m. N12m of the founder's family expenses run through the company. Bank debt is N180m, cash N45m, unremitted pension N18m. A regional group has indicated it would pay 4 to 6 times normalised EBITDA. Build the normalisation bridge, calculate enterprise value and equity value at 4, 5 and 6 times, and list the three value drivers you would put on the negotiation agenda, with a view on whether each argues for the bottom or the top of the range.",
          },
        ],
      },
      resources: { tools: ["EBITDA normalisation bridge template", "EV to equity bridge template", "DCF sensitivity table"] },
      questions: [
        {
          question:
            "A clinic reports EBITDA of N180m. The founder works full time as lead surgeon but draws no salary; a replacement would cost N40m. The clinic pays no rent for the founder's building; market rent is N20m. What is normalised EBITDA before any other adjustment?",
          options: [
            { id: "a", text: "N240m, adding back the founder salary and rent the clinic should have been paying", isCorrect: false },
            { id: "b", text: "N160m, deducting only the rent, since the founder's salary is a matter for the shareholders", isCorrect: false },
            { id: "c", text: "N120m", isCorrect: true },
            { id: "d", text: "N180m, since neither the salary nor the rent appears in the accounts as an actual cost", isCorrect: false },
          ],
          explanation:
            "A new owner would have to pay for the surgeon's work and the building, so both costs are deducted: N180m less N40m less N20m is N120m. Adding them back reverses the logic, which is the error in option a.",
        },
        {
          question:
            "A hospital with normalised EBITDA of N150m is valued at 5 times. It has bank loans of N220m, cash of N30m and N25m of unremitted pension contributions. What is the equity value?",
          options: [
            { id: "a", text: "N750m, because enterprise value is what the shareholders receive", isCorrect: false },
            { id: "b", text: "N505m, deducting loans and pension but adding nothing for cash", isCorrect: false },
            { id: "c", text: "N560m, deducting net debt of N190m but leaving the pension arrears out", isCorrect: false },
            { id: "d", text: "N535m", isCorrect: true },
          ],
          explanation:
            "Enterprise value of N750m less net debt of N190m and N25m of debt-like pension arrears gives N535m. Leaving out the pension arrears is the tempting slip, because they are not labelled as debt.",
        },
        {
          question:
            "A seller argues that a Lagos hospital should be valued at the same EBITDA multiple as large listed healthcare groups abroad. What is the strongest counter-argument?",
          options: [
            { id: "a", text: "Listed multiples reflect larger, more diversified and liquid businesses in stable currencies, so a single Nigerian hospital deserves a lower multiple", isCorrect: true },
            { id: "b", text: "Multiples cannot be used for healthcare businesses, because their earnings are regulated", isCorrect: false },
            { id: "c", text: "Foreign multiples are expressed in dollars and must be converted into naira at the current rate", isCorrect: false },
            { id: "d", text: "Nigerian law requires private companies to be valued using discounted cash flow only", isCorrect: false },
          ],
          explanation:
            "Size, liquidity, concentration and currency risk all lower the multiple for a single Nigerian hospital. A multiple is a ratio and needs no currency conversion, which is why option c is wrong despite sounding technical.",
        },
        {
          question:
            "An analyst builds a DCF with cash flows in nominal naira but discounts them at a dollar-based rate taken from an international report. What is wrong?",
          options: [
            { id: "a", text: "Nothing, as long as the dollar rate comes from a reputable source", isCorrect: false },
            { id: "b", text: "Currency and rate are inconsistent: nominal naira cash flows need a nominal naira discount rate", isCorrect: true },
            { id: "c", text: "DCF should only ever be done in dollars for Nigerian businesses, so the cash flows must be converted first", isCorrect: false },
            { id: "d", text: "The discount rate should be the hospital's overdraft rate, whatever currency the cash flows are in", isCorrect: false },
          ],
          explanation:
            "Mixing a low dollar rate with inflating naira cash flows overstates value badly. The overdraft rate is a borrowing cost, not the return an equity investor requires.",
        },
        {
          question:
            "In a DCF, terminal value makes up 78% of the total. What should the consultant do?",
          options: [
            { id: "a", text: "Extend the forecast to twenty years so that the terminal value falls below half of the total and the result looks less speculative", isCorrect: false },
            { id: "b", text: "Remove the terminal value, since it is speculative and makes the valuation look too high", isCorrect: false },
            { id: "c", text: "Show a sensitivity table across discount rates and terminal growth rates and use the DCF as a cross-check", isCorrect: true },
            { id: "d", text: "Report the single DCF figure, since terminal values are normally large", isCorrect: false },
          ],
          explanation:
            "When most of the value sits in the terminal value, the honest result is a range driven by two assumptions. Removing it would value the business as if it closed after the forecast period.",
        },
        {
          question:
            "Two hospitals each have normalised EBITDA of N200m. In the first, one founder-surgeon generates 70% of revenue. In the second, revenue is spread across eight consultants with their own followings. How should their valuations differ?",
          options: [
            { id: "a", text: "They should be equal, because EBITDA is the same and the multiple applies to EBITDA", isCorrect: false },
            { id: "b", text: "The first should be higher, because a famous founder attracts more patients over time", isCorrect: false },
            { id: "c", text: "The second should be lower, because paying eight consultants is more costly than paying one", isCorrect: false },
            { id: "d", text: "The second should command a higher multiple, because its earnings depend less on one person", isCorrect: true },
          ],
          explanation:
            "Key-person dependence makes earnings less durable, and buyers price that. Treating equal EBITDA as equal value is the tempting error, since it ignores how long those earnings will last.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which items should normally be deducted as debt-like in the bridge from enterprise value to equity value of a Nigerian hospital? Select all that apply.",
          options: [
            { id: "a", text: "Unremitted staff pension contributions", isCorrect: true },
            { id: "b", text: "Tax that is due and unpaid", isCorrect: true },
            { id: "c", text: "Normal trade payables within agreed supplier terms", isCorrect: false },
            { id: "d", text: "Supplier arrears well beyond normal terms", isCorrect: true },
          ],
          explanation:
            "Overdue obligations are effectively borrowing and reduce what shareholders receive. Normal trade payables are part of working capital and are dealt with in the working capital adjustment, not deducted as debt.",
        },
        {
          question:
            "A buyer learns that the target hospital's Lagos facility licence is issued for the current operator and premises, and the deal involves moving to a new building within a year. What is the valuation implication?",
          options: [
            { id: "a", text: "The risk of licensing delay or loss at the new premises should be priced or covered by a condition", isCorrect: true },
            { id: "b", text: "None, because licences transfer automatically with the shares of the operating company", isCorrect: false },
            { id: "c", text: "The hospital's value falls to zero until a new licence is issued by the state regulator for the new building and the new owner", isCorrect: false },
            { id: "d", text: "The buyer should obtain the licence from NHIA instead of the state regulator", isCorrect: false },
          ],
          explanation:
            "Facility licences relate to a facility and operator, so a move creates regulatory risk that must be priced or conditioned. Licensing sits with the state regulator, such as HEFAMAA in Lagos, not NHIA.",
        },
        {
          question:
            "A clinic's EBITDA rose sharply for two years and fell 30% in the last six months. The seller wants the price based on the last full financial year. What should the buyer's adviser propose?",
          options: [
            { id: "a", text: "Use the highest of the last three years, as is customary for growing businesses", isCorrect: false },
            { id: "b", text: "Use trailing twelve months EBITDA and examine the cause of the recent fall before agreeing a figure", isCorrect: true },
            { id: "c", text: "Use the average of the last three financial years without looking at recent months, as that smooths out short-term movements", isCorrect: false },
            { id: "d", text: "Ignore the last six months, since short-term movements are not relevant to valuation", isCorrect: false },
          ],
          explanation:
            "Trailing twelve months reflects the recent fall, and the cause decides whether it is temporary. A three-year average sounds balanced but can hide a business in decline.",
        },
        {
          question:
            "A hospital's revenue has grown quickly, almost all from HMO patients on 120-day payment cycles. Where should a DCF capture the cost of this growth?",
          options: [
            { id: "a", text: "In a higher discount rate only", isCorrect: false },
            { id: "b", text: "In the terminal growth rate, by reducing it to reflect the slower payment habits of the HMOs that send most of the patients", isCorrect: false },
            { id: "c", text: "Nowhere, because receivables are an asset that will eventually be collected in full", isCorrect: false },
            { id: "d", text: "In the increase in working capital, which reduces free cash flow as receivables build", isCorrect: true },
          ],
          explanation:
            "Growth in HMO revenue ties up cash in receivables, which the working capital line deducts from free cash flow. Adjusting the discount rate alone is the tempting shortcut, but it does not model the cash actually tied up.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "investor-business-plan-model",
      name: "The Investor-Grade Business Plan and Financial Model",
      description:
        "What investors and lenders read first, how to build a capacity-driven hospital model that links revenue to cash, how to find the true funding need, and how to make assumptions credible.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "What an investor reads first",
            body: `An investor or credit committee reads a business plan to answer four questions: how much is being asked for, what will it be spent on, what return will it earn, and what could go wrong. A plan that makes them search for those answers has already lost attention.

Put the answers at the front, in a page or two:
- the ask: the amount, the instrument (equity, debt or a mix) and, for equity, the share offered or the valuation implied;
- use of funds: a short table of what the money buys, by bucket and by timing;
- the return: for an equity investor, the expected multiple of money or internal rate of return over a stated holding period and the route to exit; for a lender, the debt service cover in base and downside cases and the security offered;
- the main risks and what mitigates each.

The rest of the plan supports those answers. A typical investor-grade plan for a health business covers the market and catchment, the service model and capacity, the team and governance, the regulatory position, the financial projections and the assumptions behind them. It does not need fifty pages. It needs every claim to be traceable to evidence or to a stated assumption.

The team section deserves more weight than many founders give it. In health businesses investors are backing the people who will run the clinical and commercial operation. Name the medical director, the head of nursing, the finance lead and the operations lead, say what each has done before, and be honest about gaps and how they will be filled.

Write for the reader's decision. A bank's credit officer cares most about cash cover and security. A private equity fund cares about growth, margin and exit. A development finance institution cares about impact alongside return. The facts stay the same; the order and emphasis change. Prepare the core plan once and adapt the front pages for each audience, rather than writing three different stories that an investor comparing notes would find inconsistent.`,
          },
          {
            title: "Building a capacity-driven model",
            body: `A hospital model should be built from capacity and activity, not from a revenue growth percentage. Investors who see "revenue grows 25% a year" with no link to beds, clinics and staff assume the number was chosen to make the return work.

Start with capacity by service: beds by ward, theatres and their operating hours, outpatient clinic sessions, imaging and lab capacity. Then model activity against that capacity:
- inpatient revenue from beds times occupancy times days, divided by average length of stay to give admissions, times revenue per admission by payor;
- surgical revenue from theatre sessions times utilisation times cases per session times revenue per case;
- outpatient revenue from clinic sessions times patients per session times revenue per visit;
- diagnostics and pharmacy as attached revenue per patient, checked against capacity.

Occupancy and utilisation should ramp, not start at target. A new 40-bed wing might reach 35% occupancy in its first quarter, 55% by the end of year one and 75% in year three. Use evidence from the hospital's own history or comparable openings, and show the ramp explicitly.

Revenue by payor feeds cash through collection assumptions: self-pay largely at the point of service, HMO revenue after a lag that reflects their actual DSO, less expected deductions. This is where many models overstate cash, by treating billed revenue as collected the same month.

Costs follow activity and capacity. Drugs and consumables vary with activity. Staffing is stepped: a ward needs a minimum nursing establishment whether it has six patients or twenty, and new staff must be hired before patients arrive. Utilities, especially diesel for power, should be modelled on realistic generator hours, not the grid supply on paper.

Link the three statements. The income statement, cash flow statement and balance sheet should reconcile, with a balance check on every period. An investor's analyst will look for that check first; a model that does not balance is not trusted, whatever its conclusions.`,
          },
          {
            title: "Finding the true funding requirement",
            body: `The amount to raise is not the capital cost of the project. It is the deepest point of the cumulative cash curve, plus a contingency, and it is almost always larger than the capex budget.

Build monthly cash flow from the start of construction or setup through to the point where the business is generating cash consistently. Include:
- capital expenditure, phased as it will actually be paid, including deposits on imported equipment that fall due months before delivery;
- pre-opening costs: recruitment, training, licensing, initial stock, marketing before launch, and staff salaries for the weeks before the first patient;
- operating losses during ramp-up, month by month;
- working capital build as receivables and stock grow with activity;
- debt service if borrowing is used, from the month it begins.

Plot cumulative cash. The lowest point, the trough, is the peak funding requirement. For a new specialist service, the trough often comes twelve to eighteen months after opening, not on opening day, because ramp-up losses and growing receivables keep consuming cash after the capex is spent.

Suppose a project's capex is N600m, pre-opening costs N60m, and ramp-up losses plus working capital build reach N140m before the business turns cash positive in month fifteen. The trough is about N800m before contingency. A plan that raises N600m will run out of money around opening, when it is hardest to raise more.

Contingency should reflect real risk. Imported equipment priced in foreign currency carries exchange-rate risk between order and payment. Construction overruns are common. Licensing and registration can delay opening by months, during which costs continue and revenue does not start. A contingency of 10% to 20% of the trough, depending on how much is still uncertain, is a reasonable starting range, and the plan should say what it covers.

Timing of each tranche matters for equity investors and lenders. Raising all the money on day one is simpler but more dilutive or more costly in interest. Raising in stages, tied to milestones, can reduce cost but adds the risk that a later tranche is not available.`,
          },
          {
            title: "Assumptions, scenarios and credibility",
            body: `A model is only as credible as its assumptions, and the reader will test the five or six that drive most of the result. Make those easy to find, evidenced, and stress-tested.

Keep all inputs on one assumptions sheet, separate from calculations, each with a source or a note on how it was set. A line reading "occupancy 75% (year 3)" is weak. A line reading "occupancy 75% in year 3, based on the hospital's existing wards averaging 78% over the last two years and two comparable Lagos openings reaching 70% to 80% by year 3" is credible.

Identify the drivers. In a hospital model they are usually occupancy or utilisation, revenue per case by payor, payor mix and collection lag, staffing cost, and the timing of opening. Run a sensitivity on each: change it by a plausible amount and show the effect on peak funding, break-even month and return. A short sensitivity table is often the most read page of a plan after the summary.

Build at least three scenarios: base, downside and upside. The downside should be a real downside, combining a slower ramp, a weaker payor mix and a three-month delay to opening, not the base case with 5% less revenue. Lenders will size their lending on the downside. Equity investors will ask what happens to their return if it occurs.

Be honest about tax and regulation. The 2025 tax reform changed Nigerian company taxation, including thresholds and some levies. Model tax on the rules in force, note any incentives the business relies on, and have a tax adviser check them. Regulatory steps such as state facility licensing, registration of the medical director with MDCN and NAFDAC requirements for any pharmacy should appear in the timeline with realistic durations.

Finally, check that the story and the numbers agree. If the plan says the hospital will lead on quality, the staffing costs should show it. If it says the model is conservative, the assumptions should be visibly below comparable evidence. Investors are quick to notice when they are not.`,
          },
        ],
        exercises: [
          {
            title: "Peak funding for Enugu Crest Cardiac Centre",
            instruction:
              "Enugu Crest Cardiac Centre plans a cardiac catheterisation laboratory and 12-bed cardiac unit. Capex is N720m, with a 40% deposit on imported equipment due eight months before opening and the balance on delivery two months before opening. Pre-opening costs are N75m spread over the six months before opening. After opening, the centre loses N18m in month one, with the loss falling by N2m a month until break-even, and HMO receivables build by N4m a month for the first twelve months. Build a monthly cumulative cash table from month minus eight to month eighteen, find the trough and the month it occurs, add a contingency you can justify, and write the ask and use-of-funds summary an investor would read first.",
          },
        ],
      },
      resources: { tools: ["Capacity-driven hospital model template", "Cumulative cash curve chart", "Assumptions register"] },
      questions: [
        {
          question:
            "A hospital's plan to an equity investor opens with ten pages on Nigeria's healthcare market before stating the amount sought. What is the main fault?",
          options: [
            { id: "a", text: "The market section is too short for a serious investor and should be expanded", isCorrect: false },
            { id: "b", text: "The investor has to search for the ask, use of funds, return and risks, which belong at the front", isCorrect: true },
            { id: "c", text: "Equity investors do not read market analysis, so it should be removed altogether", isCorrect: false },
            { id: "d", text: "The plan should open with the team instead, since investors in health businesses back the people before they look at any numbers", isCorrect: false },
          ],
          explanation:
            "Investors decide on the ask, the use of funds, the return and the risks, so those come first. The team matters a great deal, but leading with it still hides the ask.",
        },
        {
          question:
            "A model shows revenue growing 25% a year with no link to beds or clinics. What should replace it?",
          options: [
            { id: "a", text: "A lower growth rate of 15% a year to look conservative to investors", isCorrect: false },
            { id: "b", text: "Revenue taken from the founder's targets for each year, since the founder knows the market best", isCorrect: false },
            { id: "c", text: "Revenue built from capacity and activity, such as beds, occupancy, length of stay and revenue per admission by payor", isCorrect: true },
            { id: "d", text: "The average growth rate of listed hospital groups over the last five years", isCorrect: false },
          ],
          explanation:
            "A capacity-driven build ties revenue to what the hospital can physically deliver, which investors can test. A lower arbitrary rate is still arbitrary.",
        },
        {
          question:
            "A 30-bed ward runs at 70% occupancy with an average length of stay of 3.5 days. Roughly how many admissions does it handle in a 30-day month?",
          options: [
            { id: "a", text: "About 180", isCorrect: true },
            { id: "b", text: "About 630, which is the number of occupied bed-days in the month", isCorrect: false },
            { id: "c", text: "About 257, which is the number of beds times days divided by the length of stay", isCorrect: false },
            { id: "d", text: "About 21, which is the number of occupied beds on an average day", isCorrect: false },
          ],
          explanation:
            "30 beds at 70% for 30 days is 630 occupied bed-days, divided by 3.5 gives 180 admissions. Option c forgets occupancy, and option b stops at bed-days.",
        },
        {
          question:
            "A model records HMO revenue as cash in the month the service is delivered. The hospital's HMOs pay on average after 90 days with 10% deductions. What is the effect?",
          options: [
            { id: "a", text: "Cash is understated, because deductions are counted twice", isCorrect: false },
            { id: "b", text: "Revenue is overstated, but cash is correct because it will be collected later", isCorrect: false },
            { id: "c", text: "There is no effect on the funding requirement, only on the balance sheet", isCorrect: false },
            { id: "d", text: "Cash is overstated in the early months, so peak funding is understated", isCorrect: true },
          ],
          explanation:
            "A 90-day lag and deductions mean cash arrives later and smaller, deepening the trough. Thinking the effect is only on the balance sheet is the common error, because the trough is a cash measure.",
        },
        {
          question:
            "Capex is N600m, pre-opening costs N60m, and ramp-up losses plus working capital build reach N140m before the business turns cash positive in month fifteen. What is the funding requirement before contingency?",
          options: [
            { id: "a", text: "N600m, the capital cost of the project", isCorrect: false },
            { id: "b", text: "N660m, capex plus pre-opening costs, since operating losses are funded from revenue", isCorrect: false },
            { id: "c", text: "About N800m, the trough of the cumulative cash curve", isCorrect: true },
            { id: "d", text: "N740m, capex plus ramp-up losses, since pre-opening costs can be expensed", isCorrect: false },
          ],
          explanation:
            "The funding need is the deepest point of cumulative cash: N600m plus N60m plus N140m is about N800m. Raising only capex is the classic error that leaves a project out of cash around opening.",
        },
        {
          question:
            "When does the cash trough of a new specialist service most often occur?",
          options: [
            { id: "a", text: "On the day construction starts", isCorrect: false },
            { id: "b", text: "Some months after opening, because ramp-up losses and growing receivables keep consuming cash after capex is spent", isCorrect: true },
            { id: "c", text: "On opening day, when all the capital expenditure has been paid, the staff are on payroll and the first patients are only starting to arrive", isCorrect: false },
            { id: "d", text: "In year five, when equipment needs replacing and the first major maintenance falls due", isCorrect: false },
          ],
          explanation:
            "Losses and working capital build continue after opening, so cumulative cash keeps falling. Opening day feels like the peak spend, which is why it is the tempting answer.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which belong in a credible downside scenario for a new hospital wing? Select all that apply.",
          options: [
            { id: "a", text: "A slower occupancy ramp than the base case", isCorrect: true },
            { id: "b", text: "A weaker payor mix with longer collection lags", isCorrect: true },
            { id: "c", text: "Base case revenue reduced by 5% with everything else unchanged", isCorrect: false },
            { id: "d", text: "A delay to opening from licensing or construction", isCorrect: true },
          ],
          explanation:
            "A real downside combines the risks that commonly occur together. A flat 5% cut is the token downside that lenders see through, since it leaves timing and cash lags untouched.",
        },
        {
          question:
            "An assumptions sheet reads 'occupancy 75% (year 3)'. What would make it credible?",
          options: [
            { id: "a", text: "Raising it to 85% to show ambition", isCorrect: false },
            { id: "b", text: "Moving it into the calculation sheet next to the formula that uses it", isCorrect: false },
            { id: "c", text: "Adding a note that the founder is confident of reaching it", isCorrect: false },
            { id: "d", text: "Citing the hospital's existing wards' occupancy and comparable openings that support it", isCorrect: true },
          ],
          explanation:
            "Assumptions are credible when sourced to evidence the reader can check. Moving inputs into calculations makes them harder to find, the opposite of what an analyst wants.",
        },
        {
          question:
            "A new 20-bed ward needs a minimum nursing establishment regardless of occupancy. How should staffing cost be modelled during ramp-up?",
          options: [
            { id: "a", text: "As a stepped cost, with the minimum establishment hired before opening even at low occupancy", isCorrect: true },
            { id: "b", text: "As a fixed percentage of revenue, rising and falling with patient numbers", isCorrect: false },
            { id: "c", text: "As zero until the ward reaches 50% occupancy, when recruitment would start", isCorrect: false },
            { id: "d", text: "As a variable cost per patient-day, using the hospital's current average nursing cost per occupied bed across all its wards", isCorrect: false },
          ],
          explanation:
            "Safe staffing needs a minimum team whether the ward has six patients or twenty, so cost steps up before revenue. Modelling it as a percentage of revenue understates early losses.",
        },
        {
          question:
            "A model applies a company tax rate copied from a model built five years ago. What should the consultant do?",
          options: [
            { id: "a", text: "Keep it, since tax is a small item in a hospital model and rarely changes the investment decision", isCorrect: false },
            { id: "b", text: "Remove tax from the model, since investors look only at EBITDA", isCorrect: false },
            { id: "c", text: "Model tax on the rules in force after the 2025 reform and have a tax adviser check them", isCorrect: true },
            { id: "d", text: "Use the highest rate the consultant can find, to be conservative", isCorrect: false },
          ],
          explanation:
            "The 2025 reform changed Nigerian company taxation, so old rates may be wrong in either direction. Investors look at cash after tax for returns, so removing tax distorts the result.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "jv-spv-structures",
      name: "Joint Ventures, SPVs and Partnership Structures",
      description:
        "When to put a venture into its own company, how to value what each partner brings, what the shareholders' agreement must settle, and the Nigerian company, foreign investment and licensing rules that shape the structure.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "Why put a venture in its own company",
            body: `A special purpose vehicle (SPV) is a company set up to hold one venture. In health it is the usual answer when partners want to build something together without merging everything they already own, and it is often the right structure even when a single owner is involved.

The reasons are practical. An SPV ring-fences the venture's risks: a dispute, a debt or a clinical claim in the new diagnostics centre stays in that company and does not reach the parent hospital's assets, subject to any guarantees given. It lets partners invest at the level of the venture: a radiologist can own part of an imaging centre without owning part of the hospital. It gives lenders and investors a clean entity to fund, with its own accounts and security. And it makes exit simpler, because a single company can be sold or brought into a group without unpicking a larger business.

A joint venture (JV) is a commercial arrangement in which two or more parties pursue a venture together. It can be contractual, with no new company, or incorporated, usually through an SPV. Contractual JVs are quicker to set up and suit simple, time-limited projects such as a joint outreach programme. Incorporated JVs suit anything that will hold assets, employ staff, hold a licence or take outside money.

An SPV adds cost: incorporation, its own accounts and audit, tax filings, and the time of a board. It also adds transactions between the SPV and its shareholders, such as rent, shared services and staff secondment, each of which needs to be priced at arm's length and documented, both for fairness between partners and because tax authorities look at related-party pricing.

The decision is a judgement on scale and risk. A small new clinic room inside a hospital, run by the hospital's own staff, rarely needs its own company. A new imaging centre with outside partners, its own lender and a licence of its own almost always does.`,
          },
          {
            title: "Contributions, valuation and shareholding",
            body: `Partners rarely all bring cash. The hardest part of setting up a health JV is agreeing what non-cash contributions are worth, because that decides who owns what.

Typical contributions include:
- cash for capex and working capital;
- premises, either transferred or leased to the SPV;
- equipment already owned;
- a licence, brand or trading name;
- clinical expertise and patient following, usually from one or more doctors;
- management capability, systems and referral networks from an existing hospital or group.

Cash is easy to value. Premises and equipment can be valued by independent valuers. Brand, expertise and patient following are judgement, and partners tend to rate their own contribution highly.

Two principles help. Separate what is contributed once from what is provided continuously. A building leased to the SPV should earn rent, not shares; a doctor's ongoing clinical work should earn fees under a service agreement, not equity alone. Equity should reward capital at risk and contributions that cannot be paid for in another way. Mixing them leads to partners who feel underpaid for work or overpaid for property, and to disputes when one partner stops contributing but keeps the shares.

Where equity is given for future contributions, such as a founder-doctor's commitment to lead the service for five years, use vesting. The shares are earned over time and can be bought back at a set price if the commitment ends early. Without vesting, a partner who leaves after a year keeps a stake earned for five.

Write down the valuation and the logic for every contribution. Suppose a hospital contributes a leased floor, a brand and management worth an agreed N120m, an investor contributes N200m cash and a consultant cardiologist contributes expertise valued at N40m, vesting over four years. The resulting split is about 33%, 56% and 11%. Each figure is open to argument, but writing them down makes the argument specific and resolvable.`,
          },
          {
            title: "The shareholders' agreement",
            body: `The shareholders' agreement is where partners settle in advance the disputes they will otherwise have later. A health JV that relies only on the company's articles of association and goodwill will meet its first deadlock without a way out.

The agreement should cover at least these matters:
- board composition: how many directors each shareholder appoints, who chairs, and what quorum requires;
- reserved matters: decisions that need the consent of all shareholders, or of a defined majority, such as changing the business, issuing new shares, borrowing above a limit, approving the annual budget, appointing the medical director, related-party contracts and selling major assets;
- funding: whether shareholders must contribute further capital, what happens if one cannot, and the dilution mechanism;
- pre-emption rights: existing shareholders' right to buy new shares or shares a partner wishes to sell before outsiders;
- tag-along and drag-along: a minority's right to join a sale on the same terms, and a majority's right to require minorities to sell when an agreed threshold accepts an offer;
- deadlock: escalation to senior principals, then mediation, and in the last resort a mechanism such as one party offering to buy or sell at a stated price;
- leaver provisions: what happens to the shares of a partner who leaves, dies, is incapacitated or loses their professional registration;
- exit: the expected route and timing, and how a sale or listing would be decided.

Health ventures need a few clauses particular to them. Clinical governance should be protected: the appointment and removal of the medical director, and decisions on clinical standards, should sit with a properly qualified person and not be traded away in a commercial deadlock. A doctor shareholder who loses MDCN registration should trigger a leaver provision. Patient data held by the SPV must be governed under the Nigeria Data Protection Act 2023, with clarity over which entity is the data controller when systems are shared with a parent hospital.

Keep management separate from ownership. If one partner will run the SPV, put that in a management agreement with its own fee, performance terms and termination rights, so the SPV can replace a poor manager without a shareholder fight.`,
          },
          {
            title: "Nigerian company, investment and licensing rules",
            body: `The structure has to work under Nigerian company law, foreign investment rules and health regulation at the same time. Problems usually come from treating them separately.

Companies are incorporated and regulated under the Companies and Allied Matters Act 2020 (CAMA 2020) through the Corporate Affairs Commission. CAMA 2020 allows private companies with a single shareholder, simplifies some filings for small companies, and requires disclosure of persons with significant control. Share issues, allotments and charges must be filed, and the register of members should match what the shareholders' agreement says.

Foreign shareholding changes several things. A company with foreign participation must meet a minimum issued share capital requirement set for such companies, which is much higher than the minimum for a wholly Nigerian private company; check the current figure at the time of structuring. It must register with the Nigerian Investment Promotion Commission. Foreign investors who bring capital in through the official market should obtain a Certificate of Capital Importation from the receiving bank, because it supports the later repatriation of dividends and sale proceeds. Without it, getting money back out can be very difficult.

Health licensing attaches to the facility and operator. A state facility licence, such as one from HEFAMAA in Lagos, will need to be in the name of the entity that runs the service. If the SPV runs the service, the SPV needs the licence; if a parent hospital holds it, the structure needs to reflect that. The medical director must be registered with MDCN, and a pharmacy needs a superintendent pharmacist and registration with the Pharmacists Council. Brand names that suggest a regulated status should be checked, and any trading name should be registered.

Tax affects the choice of structure, including how profits are taxed in the SPV, how dividends are treated when paid to shareholders, and how related-party charges are scrutinised. The 2025 tax reform changed company taxation and some levies, so take current tax advice before fixing the structure rather than relying on how a previous deal was set up.

A consultant does not replace the lawyers, but should be able to map these requirements on one page so that the legal work is scoped and sequenced properly.`,
          },
        ],
        exercises: [
          {
            title: "Structure an imaging JV for Kaduna Unity Hospital",
            instruction:
              "Kaduna Unity Hospital wants to open an MRI and CT centre with a consultant radiologist, Dr Halima Bello, and an investor based in London. The hospital offers a ground-floor space (market rent N24m a year), its brand and its referral base. The investor will put in the naira equivalent of USD 400,000. Dr Bello will be clinical lead and expects equity. Propose whether to use an SPV, how to treat each contribution (shares, rent or fees), a vesting arrangement for Dr Bello, five reserved matters, a deadlock mechanism, and the regulatory and foreign investment steps the structure must satisfy. Present it as a one-page term summary.",
          },
        ],
      },
      resources: { tools: ["Shareholders' agreement term sheet template", "Contribution valuation worksheet"] },
      questions: [
        {
          question:
            "A hospital and a radiologist plan a new imaging centre with outside debt and its own licence. Why is an SPV usually the right structure?",
          options: [
            { id: "a", text: "SPVs are exempt from Nigerian company tax for their first five years", isCorrect: false },
            { id: "b", text: "It ring-fences the venture's risks, lets the radiologist own part of the centre without owning the hospital, and gives the lender a clean entity", isCorrect: true },
            { id: "c", text: "Imaging centres can only be licensed if they are separate companies from any hospital", isCorrect: false },
            { id: "d", text: "An SPV removes the need for a shareholders' agreement, because the articles cover everything", isCorrect: false },
          ],
          explanation:
            "Ring-fencing, venture-level ownership and a clean borrower are the core reasons. There is no blanket tax holiday for SPVs, and an SPV with several owners needs a shareholders' agreement more, not less.",
        },
        {
          question:
            "A hospital contributes a building to a JV and asks for shares in return. The building will be used by the JV for twenty years. What is usually the better treatment?",
          options: [
            { id: "a", text: "Lease the building to the SPV at market rent, so the hospital is paid for it continuously", isCorrect: true },
            { id: "b", text: "Give the hospital shares equal to twice the building's value to reflect its long use", isCorrect: false },
            { id: "c", text: "Transfer the building to the SPV for free, because the hospital will benefit from the JV's profits", isCorrect: false },
            { id: "d", text: "Give the hospital shares equal to the building's value and have the SPV pay rent as well", isCorrect: false },
          ],
          explanation:
            "A continuing contribution such as premises is best paid as rent, keeping equity for capital at risk. Shares plus rent pays twice for the same contribution.",
        },
        {
          question:
            "A consultant cardiologist receives 15% of a JV for committing to lead the service for five years, with no vesting. She leaves after one year. What is the consequence?",
          options: [
            { id: "a", text: "Her shares automatically return to the company under CAMA 2020", isCorrect: false },
            { id: "b", text: "The other shareholders can cancel her shares by a resolution at the next board meeting, since she has not kept her commitment", isCorrect: false },
            { id: "c", text: "She keeps the full 15% earned for five years' commitment after one year's work", isCorrect: true },
            { id: "d", text: "Her shares convert to preference shares without voting rights", isCorrect: false },
          ],
          explanation:
            "Without vesting and leaver terms, nothing takes the shares back. CAMA does not cancel shares because a commitment was not kept, which is why vesting has to be written into the agreement.",
        },
        {
          question:
            "A hospital contributes assets and management valued at N120m, an investor N200m cash, and a cardiologist expertise valued at N40m. Approximately what share does each hold?",
          options: [
            { id: "a", text: "Hospital 40%, investor 50%, cardiologist 10%", isCorrect: false },
            { id: "b", text: "One third each, since all three are essential to the venture", isCorrect: false },
            { id: "c", text: "Hospital 33%, investor 50%, cardiologist 17%", isCorrect: false },
            { id: "d", text: "Hospital 33%, investor 56%, cardiologist 11%", isCorrect: true },
          ],
          explanation:
            "Total contributions are N360m, so the shares are about 33%, 56% and 11%. Equal thirds is the tempting answer for partners who all feel essential, but it ignores the agreed values.",
        },
        {
          question:
            "In a health JV, which decision should be protected from being traded away in a commercial deadlock?",
          options: [
            { id: "a", text: "The choice of the SPV's bank", isCorrect: false },
            { id: "b", text: "The appointment and removal of the medical director and decisions on clinical standards", isCorrect: true },
            { id: "c", text: "The colour scheme and branding of the reception area", isCorrect: false },
            { id: "d", text: "The annual marketing budget and the choice of advertising agency for the launch of the service", isCorrect: false },
          ],
          explanation:
            "Clinical leadership and standards protect patients and the licence, so they should rest with a qualified person. Budgets and banking are ordinary commercial matters that can go through normal deadlock routes.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which matters typically belong on the list of reserved matters in a health JV's shareholders' agreement? Select all that apply.",
          options: [
            { id: "a", text: "Issuing new shares", isCorrect: true },
            { id: "b", text: "Borrowing above an agreed limit", isCorrect: true },
            { id: "c", text: "Ordering routine consumables within the approved budget", isCorrect: false },
            { id: "d", text: "Entering contracts with a shareholder or its affiliates", isCorrect: true },
          ],
          explanation:
            "New shares, major borrowing and related-party contracts change the partners' positions and need their consent. Routine purchasing within budget is management's job; reserving it would paralyse the business.",
        },
        {
          question:
            "A London-based investor will put cash into a Nigerian SPV and expects dividends in future. Which step most protects the ability to repatriate those dividends?",
          options: [
            { id: "a", text: "Paying the cash to the founder's personal account to save time, then transferring it to the SPV", isCorrect: false },
            { id: "b", text: "Registering the SPV with the Federal Ministry of Health as a foreign-owned health facility before the money is transferred", isCorrect: false },
            { id: "c", text: "Including a dividend clause in the shareholders' agreement", isCorrect: false },
            { id: "d", text: "Bringing the capital in through the official market and obtaining a Certificate of Capital Importation", isCorrect: true },
          ],
          explanation:
            "The Certificate of Capital Importation supports later repatriation of dividends and proceeds. A dividend clause decides what is paid but does not make conversion and transfer possible.",
        },
        {
          question:
            "A foreign partner will hold 30% of a new Lagos clinic company. Which consequence must the structure plan for?",
          options: [
            { id: "a", text: "A minimum issued share capital requirement for companies with foreign participation, well above that for a wholly Nigerian private company", isCorrect: true },
            { id: "b", text: "The clinic must be licensed by NHIA instead of the state regulator", isCorrect: false },
            { id: "c", text: "The foreign partner must hold at least 51% for the company to be registered", isCorrect: false },
            { id: "d", text: "The company cannot employ Nigerian doctors without a waiver", isCorrect: false },
          ],
          explanation:
            "Foreign participation brings a higher minimum share capital and NIPC registration. Licensing still sits with the state regulator, and there is no majority requirement for the foreign partner.",
        },
        {
          question:
            "A hospital sets up an SPV for a dialysis service but keeps the state facility licence in the hospital's own name, while the SPV employs the staff and bills patients. What is the problem?",
          options: [
            { id: "a", text: "The SPV will pay more tax than the hospital would have paid", isCorrect: false },
            { id: "b", text: "The entity running the service does not hold the licence, so the structure and the regulatory position do not match", isCorrect: true },
            { id: "c", text: "Dialysis services must be run by government hospitals", isCorrect: false },
            { id: "d", text: "None, because the hospital is a shareholder in the SPV and the hospital's licence also covers the services of its subsidiaries", isCorrect: false },
          ],
          explanation:
            "A facility licence attaches to the operator of the service, so either the SPV needs the licence or the operating arrangement must change. Assuming a licence extends to subsidiaries is the tempting but unsafe reading.",
        },
        {
          question:
            "One shareholder in a JV will also run the business day to day. How should this be documented?",
          options: [
            { id: "a", text: "In the shareholders' agreement only, since the manager is already a shareholder", isCorrect: false },
            { id: "b", text: "By giving the managing shareholder extra shares instead of a fee, so that management and ownership interests stay aligned", isCorrect: false },
            { id: "c", text: "In a separate management agreement with its own fee, performance terms and termination rights", isCorrect: true },
            { id: "d", text: "Informally, to keep goodwill between partners", isCorrect: false },
          ],
          explanation:
            "A separate management agreement lets the SPV replace a poor manager without a shareholder dispute. Paying management in shares mixes ownership with a service and is hard to undo.",
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "due-diligence-closing",
      name: "Due Diligence and Closing a Deal",
      description:
        "Running the deal process from term sheet to completion, testing earnings, legal title and clinical risk, and using price mechanisms, warranties and conditions to allocate what diligence finds.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "The deal process from term sheet to completion",
            body: `A deal moves through a sequence of documents and decisions, and most failed deals fail because a step was skipped or rushed. Knowing the sequence lets the consultant plan the work and spot when a party is trying to jump ahead.

The usual steps for an investment or acquisition in a Nigerian health business are:
- initial discussions under a non-disclosure agreement;
- a term sheet or letter of intent setting out price or valuation, structure, key conditions and an exclusivity period, mostly non-binding apart from confidentiality and exclusivity;
- due diligence by the buyer or investor and their advisers, using a data room;
- negotiation of the definitive agreements: a share purchase agreement for a purchase, or a subscription and shareholders' agreement for new equity;
- signing, at which point the parties are bound subject to conditions;
- satisfaction of conditions precedent, such as regulatory approvals, third-party consents or completion of a restructuring;
- completion, when money moves and shares transfer;
- post-completion integration.

The term sheet deserves more care than it usually gets. Although mostly non-binding, it sets expectations that are hard to move later. A seller who agrees a headline price without settling how debt, cash and working capital will be treated may find the equity value falls sharply in negotiation. A buyer who agrees long exclusivity without a clear diligence timetable loses leverage if the seller drags.

Run diligence against a timetable with named owners for each workstream: financial, tax, legal, regulatory, clinical, commercial and, where relevant, property and technology. Agree a question list and a data request list at the start. Hold a weekly call to clear issues. Keep a running issues list that classifies each finding: price adjustment, specific indemnity, condition precedent, warranty, or no action.

Deals in Nigeria often run longer than planned because of document gaps, title issues and regulatory steps. Build that into the timetable rather than promising a closing date the process cannot meet.`,
          },
          {
            title: "Financial and tax diligence",
            body: `Financial diligence tests whether the earnings and cash the price is based on are real and sustainable. It goes beyond the audited accounts, which may be late, qualified or prepared mainly for tax.

A quality of earnings review is the core. It rebuilds normalised EBITDA from the general ledger and management accounts, checks revenue against bank receipts and patient volumes, and tests the normalisation adjustments claimed by the seller. In health businesses look closely at:
- revenue recognition: whether HMO revenue is recorded at billed value or at the expected approved value after vetting, and whether old claims are still carried;
- receivables: ageing by payor, reconciliation to payor statements, and the adequacy of provisions;
- cash leakage: discounts and waivers, unrecorded cash takings and pharmacy stock losses;
- payroll: whether all staff are on payroll, whether pension, PAYE and other statutory remittances are up to date, and whether clinicians paid as contractors are in fact employees;
- related-party transactions: rent, supplies and services from companies connected to the owners;
- capex: deferred maintenance and equipment near the end of its life, which a new owner must fund.

Tax diligence looks for exposures that would fall on the buyer. Common issues in Nigerian private health businesses include incomplete filings, unremitted withholding tax and PAYE, VAT treatment of non-exempt services and goods, and transfer pricing on related-party transactions. The 2025 tax reform changed several rules, so check which regime applies to each past period and to the forecast.

Each financial finding should be translated into money. Under-provisioned receivables of N30m reduce normalised EBITDA if they reflect revenue that should not have been recognised, and reduce equity value if they are a balance sheet issue. Unpaid pension of N18m is a debt-like item. A potential tax exposure of uncertain size may be better handled through a specific indemnity or an escrow than a price cut.

A finding that changes the earnings base changes the price at the multiple; a finding that changes the balance sheet changes it naira for naira. Keeping this distinction clear is where much of the negotiation happens.`,
          },
          {
            title: "Legal, regulatory, property and clinical diligence",
            body: `In health deals, the risks that end a deal after signing are more often legal, regulatory or clinical than financial. A licence that does not transfer, a title that cannot be perfected or a pattern of serious clinical incidents can make a sound business unbuyable.

Legal diligence confirms who owns the company and its assets. Check the share register against filings at the Corporate Affairs Commission, the existence of any charges over assets, material contracts and whether they contain change-of-control clauses, employment contracts for key staff, and litigation, including medical negligence claims.

Regulatory diligence checks every licence and registration the business needs: the state facility licence, such as HEFAMAA in Lagos; MDCN registration of the medical director and all practising doctors; NMCN registration of nurses; Pharmacists Council registration of the pharmacy and superintendent pharmacist; NAFDAC requirements for any products handled; radiation safety authorisations for imaging; and NHIA and HMO accreditations. For each, confirm it is current, in the right entity's name, and whether the transaction requires notification or consent.

Property diligence matters because many health businesses sit on land with uncertain title. Confirm the Certificate of Occupancy or other root of title, whether past transfers received governor's consent, any encumbrances, and whether the building has the planning and building approvals for its use as a health facility.

Clinical diligence is often skipped by financial buyers and should not be. Review incident and complaint logs, mortality and readmission data where they exist, infection control practice, consent processes, accreditation status such as SafeCare or JCI, and the strength of clinical governance. Talk to senior clinicians. A hospital with a hidden pattern of serious incidents carries both legal liability and a reputational risk that can erase value quickly.

Handle patient data correctly in the data room. Diligence rarely needs identifiable patient records. Provide anonymised or aggregated data, restrict access, and record the legal basis under the Nigeria Data Protection Act 2023 for any personal data shared. A buyer that receives identifiable patient files without proper basis has created a compliance problem for both parties.`,
          },
          {
            title: "Price mechanisms, protections and completion",
            body: `Diligence findings are allocated between buyer and seller through the price mechanism, warranties, indemnities, conditions and post-completion terms. Each tool suits a different kind of risk.

Price mechanisms come in two main forms. In a locked box, the price is fixed by reference to a recent balance sheet date, and the seller promises that no value has leaked to them since, such as through dividends or unusual payments. It gives certainty and suits businesses with reliable accounts. In completion accounts, the price is adjusted after completion for actual net debt and working capital at the completion date. It protects the buyer where accounts are less reliable, which is common in owner-run Nigerian health businesses, but leads to post-completion argument over the numbers.

Warranties are statements by the seller about the business, such as that the accounts are accurate, licences are valid and there is no undisclosed litigation. If a warranty proves false, the buyer can claim for its loss, subject to limits on amount and time. The seller qualifies warranties through a disclosure letter listing known exceptions.

Indemnities are promises to reimburse a specific identified loss naira for naira, such as a known tax exposure or a pending negligence claim. They are used when diligence has found a risk but its size is uncertain.

Escrow and deferred consideration hold part of the price back for a period to back the warranties and indemnities, which matters when recovering money from an individual seller after completion would be difficult. An earn-out ties part of the price to future performance, useful when buyer and seller disagree on the forecast, but it needs precise definitions and can create conflict if the buyer runs the business in a way that affects the result.

Conditions precedent must be satisfied before completion. They can include regulatory consents, lender consents, a new lease, transfer of a licence, and key staff signing new contracts. Where a transaction meets the thresholds under the Federal Competition and Consumer Protection Act 2018, notification to the competition regulator and its approval will also be needed.

Plan the first hundred days before completion: who signs payments, how staff and doctors are told, what changes immediately and what does not, and how patients see continuity of care.`,
          },
        ],
        exercises: [
          {
            title: "Issues list for the acquisition of Benin Hope Hospital",
            instruction:
              "A regional group has agreed a term sheet to buy 70% of Benin Hope Hospital at 5 times normalised EBITDA of N160m. Diligence finds: HMO receivables of N95m of which N28m is over 180 days and unprovided; N22m of unremitted pension; PAYE filings missing for two years with an exposure the tax adviser cannot yet size; the facility licence is current but the medical director's MDCN annual licence has lapsed; the building's title passed to the current owner without governor's consent; and incident logs show three serious surgical incidents in the past year, one now a negligence claim. Build an issues list that classifies each finding as price adjustment, specific indemnity, condition precedent, warranty or escrow, recommend locked box or completion accounts with reasons, and estimate the revised equity value for the 70% stake if bank debt is N140m and cash N25m.",
          },
        ],
      },
      resources: { tools: ["Due diligence request list", "Issues list template", "Completion checklist"] },
      questions: [
        {
          question:
            "A seller agrees a headline price in a term sheet without settling how debt, cash and working capital will be treated. What is the risk to the seller?",
          options: [
            { id: "a", text: "The term sheet becomes legally binding on price once signed", isCorrect: false },
            { id: "b", text: "The buyer can walk away at any time without paying a break fee", isCorrect: false },
            { id: "c", text: "The equity value the seller receives may fall sharply once those items are negotiated", isCorrect: true },
            { id: "d", text: "The buyer must pay the headline price in cash at completion regardless of how much debt the hospital carries", isCorrect: false },
          ],
          explanation:
            "The headline price is usually enterprise value, and the bridge to equity is where much of the value moves. Term sheets are mostly non-binding on price, so option a is the common misunderstanding.",
        },
        {
          question:
            "Diligence finds the target records HMO revenue at billed value and carries N30m of claims over 180 days with no provision. How does this affect the deal?",
          options: [
            { id: "a", text: "It may reduce normalised EBITDA if revenue was overstated, and reduce equity value as a balance sheet issue", isCorrect: true },
            { id: "b", text: "It has no effect, since receivables will eventually be collected", isCorrect: false },
            { id: "c", text: "It should be handled only by a warranty that the accounts are accurate", isCorrect: false },
            { id: "d", text: "It increases the price because the buyer acquires N30m of receivables", isCorrect: false },
          ],
          explanation:
            "Overstated revenue affects earnings at the multiple, and an unprovided balance reduces equity value. A warranty alone is the tempting answer, but a known issue should be priced, not left to a later claim.",
        },
        {
          question:
            "A finding reduces normalised EBITDA by N10m. The deal is priced at 5 times EBITDA. A separate finding reveals N10m of unpaid pension. Which statement is correct?",
          options: [
            { id: "a", text: "Both reduce the price by N10m, since each finding is worth N10m to the buyer whichever way it arises", isCorrect: false },
            { id: "b", text: "Both reduce the price by N50m", isCorrect: false },
            { id: "c", text: "The EBITDA finding reduces the price by N10m; the pension reduces it by N50m", isCorrect: false },
            { id: "d", text: "The EBITDA finding reduces the price by about N50m; the pension reduces it by N10m", isCorrect: true },
          ],
          explanation:
            "An earnings finding moves the price at the multiple, while a debt-like item moves it naira for naira. Option c reverses the two, a common slip under pressure.",
        },
        {
          question:
            "Diligence finds a pending medical negligence claim whose outcome and size are uncertain. Which tool best allocates this risk?",
          options: [
            { id: "a", text: "A general warranty that there is no undisclosed litigation", isCorrect: false },
            { id: "b", text: "A specific indemnity from the seller, backed by escrow", isCorrect: true },
            { id: "c", text: "A permanent price reduction equal to the maximum possible claim", isCorrect: false },
            { id: "d", text: "An earn-out based on the hospital's next three years of revenue", isCorrect: false },
          ],
          explanation:
            "A known risk of uncertain size suits a specific indemnity, with escrow to make it recoverable. A warranty does not help because the claim has been disclosed, which removes it from warranty cover.",
        },
        {
          question:
            "The target's accounts are prepared mainly for tax and are often late. Which price mechanism better protects the buyer?",
          options: [
            { id: "a", text: "Locked box, because it gives the buyer certainty from a recent balance sheet date and avoids arguments after completion", isCorrect: false },
            { id: "b", text: "A fixed price with no adjustment, to avoid arguments after completion", isCorrect: false },
            { id: "c", text: "Completion accounts, which adjust the price for actual net debt and working capital at completion", isCorrect: true },
            { id: "d", text: "An earn-out for the whole price, paid over five years", isCorrect: false },
          ],
          explanation:
            "Where accounts are unreliable, completion accounts adjust to the real position at completion. A locked box depends on trusting the reference balance sheet, which is exactly what is in doubt here.",
        },
        {
          question:
            "In a data room for a hospital acquisition, the seller uploads full identifiable patient files for the last three years. What should the adviser do?",
          options: [
            { id: "a", text: "Leave them, since more data makes diligence more thorough", isCorrect: false },
            { id: "b", text: "Ask the buyer to sign a stronger NDA covering patient confidentiality and keep the files available to all the buyer's advisers", isCorrect: false },
            { id: "c", text: "Move them to a folder that only the buyer's clinical adviser can open", isCorrect: false },
            { id: "d", text: "Remove them and provide anonymised or aggregated data, recording the legal basis for any personal data shared", isCorrect: true },
          ],
          explanation:
            "Diligence rarely needs identifiable records, and sharing them without proper basis breaches the Nigeria Data Protection Act 2023 for both parties. An NDA does not create a lawful basis for the disclosure.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which findings would normally be made conditions precedent to completion rather than simple price adjustments? Select all that apply.",
          options: [
            { id: "a", text: "The facility licence must be transferred or reissued in the buying entity's name", isCorrect: true },
            { id: "b", text: "A lender's consent to the change of control is required under an existing loan", isCorrect: true },
            { id: "c", text: "Pharmacy stock is valued N2m lower than the seller's figure", isCorrect: false },
            { id: "d", text: "Key consultants must sign new contracts with the business", isCorrect: true },
          ],
          explanation:
            "Licence transfer, lender consent and key staff contracts must be in place for the business to operate as bought. A stock valuation difference is a price or completion accounts matter.",
        },
        {
          question:
            "Property diligence finds the hospital's land passed to the seller without governor's consent. Why does this matter?",
          options: [
            { id: "a", text: "It affects the hospital's NHIA accreditation", isCorrect: false },
            { id: "b", text: "The seller's title is imperfect, which affects financing, security and the buyer's protection", isCorrect: true },
            { id: "c", text: "The Corporate Affairs Commission will refuse to register the share transfer", isCorrect: false },
            { id: "d", text: "It means the building cannot be used as a health facility under any circumstances until the title has been fully regularised", isCorrect: false },
          ],
          explanation:
            "Under the Land Use Act framework, transfers of interests in land need the governor's consent, so an imperfect title weakens financing and security. It does not stop the share transfer, which is a CAC matter.",
        },
        {
          question:
            "A private equity buyer plans to skip clinical diligence because its financial and legal advisers have found nothing serious. What is the strongest argument against?",
          options: [
            { id: "a", text: "Clinical incidents and weak governance can create legal liability and reputational loss that financial review will not show", isCorrect: true },
            { id: "b", text: "NHIA requires clinical diligence for every hospital transaction", isCorrect: false },
            { id: "c", text: "Clinical diligence is cheaper than financial diligence and should always be done first", isCorrect: false },
            { id: "d", text: "Clinical findings always lead to a lower price at the multiple", isCorrect: false },
          ],
          explanation:
            "Patterns of serious incidents carry liability and can erase value, and they rarely show in the accounts. There is no general NHIA requirement for diligence; the reason is risk, not rule.",
        },
        {
          question:
            "Buyer and seller disagree sharply on a new service line's revenue over the next two years. Which mechanism can bridge the gap, and what must it include?",
          options: [
            { id: "a", text: "A locked box, with the reference date set two years after completion", isCorrect: false },
            { id: "b", text: "A larger warranty cap and a longer claims period, so the buyer can claim against the seller if the revenue disappoints", isCorrect: false },
            { id: "c", text: "An earn-out tied to future performance, with precise definitions and rules on how the buyer runs the business", isCorrect: true },
            { id: "d", text: "A specific indemnity against the service line failing", isCorrect: false },
          ],
          explanation:
            "An earn-out pays more if the seller's forecast is met, but disputes follow unless the measure and the buyer's conduct are defined. Warranties cover statements of fact, not forecasts, so a larger cap does not help.",
        },
      ],
    },
  ],
};

export default expansion;
