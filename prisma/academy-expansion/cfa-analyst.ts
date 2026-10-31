import type { TrackExpansion } from "./types";

const expansion: TrackExpansion = {
  slug: "cfa-analyst",
  track: {
    name: "The C4A Analyst",
    description:
      "The working skills of an analyst at C4A: finding and citing sources on Nigerian healthcare, building a spreadsheet model someone else can check, writing a memo in the house style, making exhibits and landscape decks, and collecting clean field data from surveys, interviews and site visits.",
    level: "FOUNDATION",
    category: "firm",
    iconName: "clipboard-list",
    colorHex: "#1F4E79",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "FREE",
  },
  modules: [
    // ------------------------------------------------------------------
    // 1. Desk research
    // ------------------------------------------------------------------
    {
      slug: "analyst-desk-research",
      name: "Desk Research and Sourcing",
      description:
        "Finding, judging and citing sources on Nigerian healthcare: where the data lives, how far to trust it, and how to record it so a partner can defend every number.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Start from the question you are answering",
            body: `Desk research starts with a written question, not a search box. Before you open a browser, write down the decision the number will feed, the number itself, the unit, the geography, the year and the precision the decision needs.

"Research the Lagos fertility market" is not a question. "How many women aged 25 to 44 live within 30 minutes' drive of a proposed clinic in Ikeja, to the nearest 50,000, as of 2026" is. The second version tells you which sources can answer it and when to stop.

Precision matters because it sets the time you should spend. A hospital deciding whether a second site is worth a feasibility study needs an order of magnitude. A bank lending against a projection needs a figure it can trace. Ask the engagement lead which one this is before you spend a day chasing a decimal place.

Set a time box. Most analyst research requests should take two to four hours. If you are at the limit and have no credible source, stop and report what you found, what you could not find and the two or three ways the gap could be closed (a field survey, a request to the client, a proxy figure). A partner would rather know at hour three than at hour twelve.

Write a short search plan:
- The question, in one sentence
- The sources likely to hold it, in order of reliability
- The proxy you will use if the direct figure does not exist
- The time box

Proxies are normal in Nigerian healthcare, where many figures are not published. If no one publishes the number of privately insured lives in a state, you may build it from the national NHIA enrolment figures, a state scheme's published enrolment and HMO disclosures. The proxy must be named as a proxy in your output. The mistake to avoid is presenting a derived figure as if someone had measured it.`,
          },
          {
            title: "Where Nigerian health data lives",
            body: `Know the main sources and what each is good for, so you go to the right one first.

Household and population data:
- National Population Commission and National Bureau of Statistics. The last census was in 2006, so every current population figure is a projection. Say so when you use one.
- The Nigeria Demographic and Health Survey (NDHS), run by NPC with the DHS Program. The best source for fertility, maternal and child health, insurance coverage and care-seeking by state and wealth quintile. It is a sample survey with a survey year; quote both.
- The Multiple Indicator Cluster Survey (MICS), run by NBS with UNICEF, which covers similar ground in other years.

Health system data:
- The national health management information system on DHIS2, which holds facility-reported service data. Coverage is better for public facilities than private ones, and reporting completeness varies by state and month.
- NHIA for national insurance enrolment and accreditation; state health insurance agencies for their own schemes.
- FMoH, NPHCDA and NCDC for policy documents, programme data and outbreak reports.
- Regulator registers: MDCN for doctors, NMCN for nurses and midwives, the Pharmacists Council for pharmacists and premises, HEFAMAA for registered private facilities in Lagos.

Money:
- Federal and state budget documents, published by the Budget Office and state ministries of finance, for public health spending.
- Annual reports of listed companies on the Nigerian Exchange for any health business that publishes accounts.

International:
- WHO Global Health Observatory and the World Bank World Development Indicators for country comparisons. These often repackage Nigerian survey data, so trace them back to the original survey before you treat them as a second source.

Then there are trade reports, consultancy publications, news articles and company websites. These can point you to a primary source but are rarely one. A news story that says "over 5,000 doctors left last year" should send you to the MDCN or the UK GMC register, not into your memo.`,
          },
          {
            title: "Judging how far to trust a source",
            body: `Every source gets the same five questions before a figure goes into C4A work.

- Who produced it, and do they gain from the number being high or low?
- How was it measured: a census, a sample survey, administrative records, an estimate or a guess?
- When was it measured, as opposed to when it was published?
- What exactly does it count? "Hospitals" in one register can include clinics and maternity homes; in another, only facilities with in-patient beds.
- Can you trace it to the original data?

A vendor report on the size of the Nigerian telemedicine market fails the first question: the vendor sells telemedicine. That does not make it wrong, but it cannot carry a recommendation alone. A press release quoting a percentage with no denominator fails the fourth question.

When two credible sources disagree, do not average them. Find out why they differ. The usual reasons are different years, different definitions, different geographies (Lagos State against the Lagos metropolitan area) or one being a projection of the other. Once you know the reason you can pick the source that matches your question and footnote the other.

Triangulate figures that matter. If a client's revenue depends on the number of births in a local government area, check the NDHS birth rate against facility delivery data in DHIS2 and against the client's own delivery numbers. If three methods land within a reasonable band of each other, report the band. If one is far off, say which and why you set it aside.

Grade what you report. A simple three-level grade works: measured (from a census, register or audited account), estimated (from a credible survey or model with a stated method) and indicative (from a secondary source or a single interview). The grade goes into your source log and, for important figures, into the deliverable. A client who later finds that a key number was indicative will forgive the uncertainty if it was stated, and will not forgive it if it was hidden.`,
          },
          {
            title: "Recording and citing so someone else can check",
            body: `A figure without a source is an opinion. Keep a source log for every piece of research, from the first search, in a shared sheet on the engagement folder.

Each row of the log holds:
- The figure, with unit and year
- The source: publisher, title, year, table or page number
- The date you accessed it, and where the file is saved if you downloaded it
- The grade (measured, estimated, indicative)
- Any adjustment you made, in words

The page or table number is the part most people skip, and it is the part that saves the next person an hour. "NDHS 2018" is not a citation. "NDHS 2018, Table [number], p. [page]", with the real numbers filled in, is.

When you derive a figure, show the inputs and the method in the log, not in the memo. The memo says "Women aged 25 to 44 in the catchment: about 410,000 (C4A estimate from NPC projections and NDHS age structure)". The log holds the calculation.

In deliverables, cite in a source line under each exhibit and in footnotes in prose documents. Use the same format throughout: publisher, title, year, location in the document.

Two rules on confidentiality apply to research. Client data is never pasted into public websites or tools to "check" it. And one client's figures are never a source for another client's work, even anonymised, unless the engagement lead has confirmed that the firm is allowed to use them as a benchmark. If you need a benchmark from past work, ask the engagement lead which ones are cleared.

Save copies of anything that could disappear. Government websites in Nigeria move and break often. A PDF saved to the engagement folder on the day you used it is the only proof that the number existed.`,
          },
        ],
        exercises: [
          {
            title: "Two population figures for one catchment",
            instruction:
              "Adunni Women's Clinic in Ibadan wants to know how many women aged 15 to 49 live within its catchment of three local government areas. You find two figures: 1.2 million in a state ministry planning document dated 2024, and 0.9 million derived from NPC projections for 2026 using the NDHS age structure. Write the source log rows for both, state the most likely reasons they differ, choose the figure you would report to the clinic and give its grade. Then write the one line that would appear in the memo, with its citation.",
          },
          {
            title: "A search plan under a time box",
            instruction:
              "The engagement lead asks at 10am for the number of HMOs currently accredited by NHIA and the share of the market held by the five largest, for a meeting at 3pm. Write the search plan (question, sources in order, proxy, time box). Then list what you would report at 2pm if you found the accredited count but no market share data, and how you would word the gap.",
          },
        ],
      },
      resources: { tools: ["Source log template", "NDHS state tables", "DHIS2", "MDCN register", "HEFAMAA facility register"] },
      questions: [
        {
          question:
            "A partner asks for 'the size of the dialysis market in Abuja' for a client deciding whether to commission a feasibility study. What should you do before searching?",
          options: [
            { id: "a", text: "Search widely for any dialysis figures in Nigeria and summarise everything you find for the partner", isCorrect: false },
            { id: "b", text: "Agree the exact measure, geography, year and the precision the decision needs", isCorrect: true },
            { id: "c", text: "Build a bottom-up model of dialysis sessions using national prevalence data", isCorrect: false },
            { id: "d", text: "Ask the client for their own estimate and use it as the base figure", isCorrect: false },
          ],
          explanation:
            "Defining the measure and precision first tells you which sources can answer and when to stop; a decision on whether to commission a study only needs an order of magnitude. Building a model before agreeing the question risks a precise answer to the wrong question.",
        },
        {
          question:
            "You need the share of women in Kano State who gave birth in a health facility. Which source should you go to first?",
          options: [
            { id: "a", text: "The Nigeria Demographic and Health Survey state tables", isCorrect: true },
            { id: "b", text: "A news article quoting a state commissioner on maternal health", isCorrect: false },
            { id: "c", text: "The World Bank World Development Indicators for Nigeria", isCorrect: false },
            { id: "d", text: "HEFAMAA's register of private facilities", isCorrect: false },
          ],
          explanation:
            "The NDHS reports facility delivery by state from a household sample, which is what the question asks. The World Bank figure is national and usually repackages the same survey, and HEFAMAA covers Lagos facilities, not Kano births.",
        },
        {
          question:
            "A state ministry document says the state has 640 private hospitals. HEFAMAA-style register data for a comparable state you checked last month showed a much lower count. What is the most likely explanation to investigate first?",
          options: [
            { id: "a", text: "One of the two sources is fabricated", isCorrect: false },
            { id: "b", text: "Private hospitals have closed rapidly in the past year", isCorrect: false },
            { id: "c", text: "The ministry figure is more recent so it should replace the register", isCorrect: false },
            { id: "d", text: "They define 'hospital' differently, such as by counting clinics", isCorrect: true },
          ],
          explanation:
            "Definition differences are the most common reason two credible counts disagree, so check what each one counts before anything else. Assuming the more recent figure is right skips the question of whether both are measuring the same thing.",
        },
        {
          question:
            "A telemedicine vendor's report estimates the Nigerian telemedicine market at N180bn. How should it be used in a client memo?",
          options: [
            { id: "a", text: "As the headline market size, cited to the vendor", isCorrect: false },
            { id: "b", text: "Not at all, because a vendor report is never reliable enough to cite in client work", isCorrect: false },
            { id: "c", text: "Graded indicative, beside an independent estimate", isCorrect: true },
            { id: "d", text: "Averaged with a lower figure from another source to balance the bias", isCorrect: false },
          ],
          explanation:
            "A source with an interest in a high number can still be used, but only graded as indicative and tested against an independent estimate. Averaging hides the reason the figures differ instead of resolving it.",
        },
        {
          question: "Which of these is a citation another analyst could check in under a minute?",
          options: [
            { id: "a", text: "NBS and ICF, NDHS 2018, the table number and page cited, accessed 3 Oct 2026", isCorrect: true },
            { id: "b", text: "Nigeria Demographic and Health Survey, latest edition, national report, health insurance chapter", isCorrect: false },
            { id: "c", text: "Government data, 2018", isCorrect: false },
            { id: "d", text: "Desk research by C4A, October 2026", isCorrect: false },
          ],
          explanation:
            "Publisher, title, year and the table or page let anyone find the figure directly. 'Latest edition' changes over time and gives no location in a long document.",
        },
        {
          question:
            "You have spent your three-hour time box looking for the number of cardiologists practising in Port Harcourt and have found nothing published. What is the best next step?",
          options: [
            { id: "a", text: "Keep searching until the end of the day, since the figure must exist somewhere", isCorrect: false },
            { id: "b", text: "Use the national cardiologist count divided by the number of states", isCorrect: false },
            { id: "c", text: "Report what you found, the gap and the options to close it", isCorrect: true },
            { id: "d", text: "Estimate a figure from your own knowledge and mark it as provisional", isCorrect: false },
          ],
          explanation:
            "At the time box you report the gap and the ways to close it so the lead can choose. Dividing a national count by 36 states ignores the heavy concentration of specialists in a few cities and would mislead.",
        },
        {
          question:
            "You derive the number of insured lives in a catchment from three published figures. How should this appear in the memo?",
          options: [
            { id: "a", text: "As the figure, with the full calculation written out in the memo body", isCorrect: false },
            { id: "b", text: "As a C4A estimate naming its inputs, with the method in the log", isCorrect: true },
            { id: "c", text: "Cited to the largest of the three sources, since it drove the result", isCorrect: false },
            { id: "d", text: "As a range only, with no central figure, because it is derived", isCorrect: false },
          ],
          explanation:
            "A derived figure is labelled as a C4A estimate and its method lives in the log, keeping the memo short while the number stays checkable. Citing it to one source misrepresents it as measured by someone else.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Two credible sources give different figures for under-five mortality in a state. Which of these are legitimate reasons to investigate? Select all that apply.",
          options: [
            { id: "a", text: "They refer to different survey years", isCorrect: true },
            { id: "b", text: "One covers the state and the other a single metropolitan area", isCorrect: true },
            { id: "c", text: "One was published by a more senior official", isCorrect: false },
            { id: "d", text: "One is a projection based on the other", isCorrect: true },
          ],
          explanation:
            "Year, geography and whether one figure is derived from the other are the usual causes of disagreement between credible sources. The seniority of the person publishing a figure says nothing about how it was measured.",
        },
        {
          question:
            "On a previous engagement you saw another hospital's pharmacy margin. It would make a useful benchmark for your current client. What should you do?",
          options: [
            { id: "a", text: "Use it anonymised, since no hospital is named", isCorrect: false },
            { id: "b", text: "Use it only in internal working papers, not the deliverable", isCorrect: false },
            { id: "c", text: "Round it so it cannot be traced back to the other client", isCorrect: false },
            { id: "d", text: "Ask the engagement lead if it is cleared as a benchmark", isCorrect: true },
          ],
          explanation:
            "One client's data is not a source for another's work unless the firm has confirmed it may be used as a benchmark. Anonymising does not make the use permitted, and in a small market a single figure can still identify the hospital.",
        },
        {
          question:
            "A key population figure on a state government website will support a client's investment case. What should you do with the source?",
          options: [
            { id: "a", text: "Bookmark the page so it can be found again", isCorrect: false },
            { id: "b", text: "Save a copy to the engagement folder and log where it is", isCorrect: true },
            { id: "c", text: "Email the link to the client so they hold the reference", isCorrect: false },
            { id: "d", text: "Quote the full URL in the footnote, which is enough for a public government source", isCorrect: false },
          ],
          explanation:
            "Government pages move and break, so a saved copy is the only proof the figure existed as cited. A URL or bookmark fails as soon as the page changes.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 2. Spreadsheet modelling
    // ------------------------------------------------------------------
    {
      slug: "analyst-spreadsheet-modelling",
      name: "Spreadsheet Modelling",
      description:
        "Building a spreadsheet model that a reviewer can follow and trust: layout, inputs and assumptions, built-in checks, and scenarios that change the answer in one place.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Structure the workbook so a stranger can follow it",
            body: `A model is good when someone who did not build it can find any number's origin in under a minute. Structure does most of that work.

Separate the workbook into three kinds of sheet:
- Inputs: every number that is typed in, with its unit and source
- Calculations: formulas only, no typed numbers
- Outputs: the summary tables and charts that go into the deliverable

Add a cover sheet with the model's purpose, the version, the author, the date and a list of sheets. Add a checks sheet (covered below).

Within a calculation sheet, time runs across the columns and line items run down the rows. Each row holds one item with one formula copied across every period. If month 7 needs a different formula from month 6, the logic belongs in a flag row (for example, "Ward B open: 0 or 1") rather than in a different formula in that cell. Inconsistent formulas across a row are the most common hidden error in hospital models.

Put the unit in its own column next to the label: "N'000", "patients", "%", "days". Mixing naira and thousands of naira in one sheet produces errors a thousand times too large, and they are easy to miss in a total.

Use a colour convention and keep to it. The usual one is blue font for typed inputs, black for formulas and green for links to other sheets. A reviewer can then scan a sheet and see at once whether a number is an assumption or a result.

Calculations flow one way: inputs feed calculations, calculations feed outputs. A formula on the inputs sheet that reads from the outputs sheet creates a loop that is hard to follow and may become circular.

Keep formulas short. A formula that runs to three lines is a formula no reviewer will check. Break it into helper rows with clear labels. The workbook gets longer and the error rate falls.`,
          },
          {
            title: "Inputs and assumptions: one place, one label, one source",
            body: `Every number the model depends on is typed once, on the inputs sheet, and referenced everywhere else. A hard-coded number inside a formula, such as =B12*0.65, is the single most frequent fault found in review. When occupancy changes from 65% to 70%, the person updating the model changes the input cell and misses the 0.65 buried in row 140.

For each input, record:
- The label and unit
- The value
- The source or basis (client data, benchmark, C4A assumption, client decision)
- The date it was last updated

Distinguish three kinds of input, because the client treats them differently:
- Data: what happened, from the client's records or a published source. Last year's outpatient visits.
- Assumptions: what we expect, with a basis. Visits grow 8% a year because the catchment population and insured enrolment are both growing.
- Decisions: what the client chooses. The consultation fee, the number of beds to open, the date the new ward opens.

Clients challenge assumptions, approve decisions and correct data. Labelling them separately tells the partner which conversation each number needs.

Healthcare models usually turn on a small set of drivers. For a hospital, these are beds, occupancy, average length of stay, revenue per patient day, outpatient volume, revenue per visit, payor mix and the days it takes each payor to pay. For costs, staffing by cadre and grade, consumables as a share of revenue, diesel and rent. Find the drivers early, source them carefully and spend less time on items that move the answer by under 1%.

Assumptions need a basis even when the basis is thin. "Occupancy of 70% in year two, based on the client's current 58% on 30 beds and the HMO contracts signed in September" can be challenged and improved. "Occupancy: 70%" with no note cannot.`,
          },
          {
            title: "Build the checks in, not on at the end",
            body: `A model that has not been checked is a draft. The checks are part of the build, and they live on a checks sheet that reports one overall result at the top of the cover sheet: OK or ERROR.

Checks that belong in most hospital models:
- Totals cross-foot: the sum of departmental revenue equals total revenue, and the sum of months equals the year.
- Shares add up: payor mix percentages total 100%, and staff allocated to departments equal total headcount.
- Balance: if there is a balance sheet, assets equal liabilities plus equity in every period; cash on the balance sheet equals closing cash in the cash flow.
- Signs: costs are negative or positive throughout according to the model's convention, never mixed.
- Bounds: occupancy never exceeds 100%, staff numbers are never negative, a ward does not generate revenue before it opens.

Each check is a formula that returns zero when things are right. The checks sheet sums their absolute values. Anything above a small tolerance flags an error.

Then do a sense check, which formulas cannot do. Compare the model's outputs against something independent:
- Revenue per bed against similar Nigerian private hospitals the firm has cleared as benchmarks
- Staff cost as a share of revenue against the client's last audited accounts
- The number of patient days the model implies against the beds available

A 40-bed hospital at 65% occupancy delivers about 9,500 patient days a year. If the model shows 14,000, something is wrong regardless of what the checks sheet says.

Test with extreme inputs. Set occupancy to zero and confirm that variable costs fall and revenue goes to zero. Set a payor's payment days to 365 and confirm that cash, not revenue, collapses. A model that behaves strangely at the edges usually has a logic error in the middle.

Before handing a model to a reviewer, trace the precedents of the three largest output numbers back to the inputs. You will find most of your own errors this way, and the reviewer's time goes on judgement rather than arithmetic.`,
          },
          {
            title: "Scenarios, sensitivities and versions",
            body: `Clients decide on ranges, not single points. A model should show how the answer moves when the main drivers move, and it should do that from one switch.

Build scenarios as columns of inputs on the inputs sheet: base, downside and upside. A selector cell (1, 2 or 3) picks which column feeds the live input. The calculations never change; only the selected input column does. Never build scenarios by copying the whole model into three files. They drift apart within a week.

Each scenario should change a few drivers for stated reasons, not every input by 10%. A sensible downside for a new diagnostic centre might be: volumes ramp up six months slower, one HMO pays in 120 days instead of 60, and the naira cost of imported reagents rises. Each change has a cause someone can argue with.

Sensitivity analysis asks which drivers matter most. Change one input at a time by a fixed step and record the effect on the output the client cares about, such as EBITDA in year three or the month cash turns positive. Ranked from largest effect to smallest, this becomes a tornado chart, and it tells the partner where to spend diligence. In most hospital models, occupancy and payor payment days sit at the top.

Break-even is the other question clients ask. How many deliveries a month cover the maternity unit's fixed costs? Use goal seek or a direct formula, and report the result with the scenario it assumes.

Version control prevents the most embarrassing errors. Name files with the client, model, version and date: "Adunni_Expansion_Model_v07_2026-10-14.xlsx". Keep a change log sheet listing what changed in each version and who changed it. Only one person edits the master at a time. When a number in the deck does not match the model, the version log is how you find out which file the deck came from.`,
          },
        ],
        exercises: [
          {
            title: "Build the revenue block for a 40-bed hospital",
            instruction:
              "Kelechi Specialist Hospital in Owerri has 40 beds, current occupancy of 62%, average length of stay of 3.8 days and average in-patient revenue of N92,000 per patient day. Outpatients run at 1,900 visits a month at N14,500 average revenue. The client plans to open a 10-bed ward in month 9. Build inputs, calculations and outputs sheets for a 24-month revenue forecast with a flag row for the new ward. Add four checks to a checks sheet and one sense check against patient days available.",
          },
          {
            title: "Three scenarios from one switch",
            instruction:
              "Using the model above, add base, downside and upside input columns and a selector. The downside assumes occupancy grows 3 points a year instead of 6 and the new ward opens in month 12. The upside assumes 8 points a year. Report year-two revenue under each scenario in a three-line output table, and write one sentence on which driver moves the answer most.",
          },
        ],
      },
      resources: { tools: ["Excel or Google Sheets", "Model template with checks sheet", "Change log template"] },
      questions: [
        {
          question:
            "Reviewing a colleague's model, you find the formula =C14*0.65 in the in-patient revenue row. What is the problem?",
          options: [
            { id: "a", text: "It should use a percentage format rather than a decimal", isCorrect: false },
            { id: "b", text: "The occupancy assumption is too low for a private hospital", isCorrect: false },
            { id: "c", text: "The assumption is hard-coded instead of referenced from an input", isCorrect: true },
            { id: "d", text: "Multiplication should be done on the outputs sheet instead", isCorrect: false },
          ],
          explanation:
            "A number typed into a formula will be missed when the assumption is updated, so every input lives once on the inputs sheet. The value itself may be reasonable; the fault is where it sits.",
        },
        {
          question:
            "A new theatre opens in month 7 of a 36-month model. How should the theatre revenue row handle this?",
          options: [
            { id: "a", text: "Multiply by a 0 or 1 flag row, with one formula across", isCorrect: true },
            { id: "b", text: "Leave months 1 to 6 blank and start the formula in month 7", isCorrect: false },
            { id: "c", text: "Type zeros into months 1 to 6 and use the formula from month 7", isCorrect: false },
            { id: "d", text: "Build a separate sheet for the theatre that starts in month 7 and link its total back in", isCorrect: false },
          ],
          explanation:
            "A flag row keeps one consistent formula across the row and lets the opening date change from a single input. Typed zeros or blanks break the row's consistency and must be edited by hand if the date moves.",
        },
        {
          question:
            "The client's finance director says next year's consultation fee will be N25,000. How should you label this input?",
          options: [
            { id: "a", text: "Data, because it comes from the client", isCorrect: false },
            { id: "b", text: "Assumption, because it is about the future", isCorrect: false },
            { id: "c", text: "Benchmark, because it will be compared with competitors", isCorrect: false },
            { id: "d", text: "Decision, because the client sets it and can change it", isCorrect: true },
          ],
          explanation:
            "A price the client chooses is a decision; it needs their approval, not a basis. Calling it an assumption invites the wrong conversation, since it is not an expectation C4A has to defend.",
        },
        {
          question:
            "A 30-bed hospital model shows 13,500 in-patient days in a year. All checks on the checks sheet return OK. What should you conclude?",
          options: [
            { id: "a", text: "The model is sound because the checks pass", isCorrect: false },
            { id: "b", text: "The model is wrong: 30 beds cannot deliver that many days", isCorrect: true },
            { id: "c", text: "Occupancy is high but plausible for a busy Lagos hospital with short stays and strong HMO volumes", isCorrect: false },
            { id: "d", text: "The length of stay assumption should be shortened", isCorrect: false },
          ],
          explanation:
            "Thirty beds offer at most about 10,950 patient days a year, so 13,500 is impossible whatever the checks say. Formula checks catch internal inconsistency; only a sense check against capacity catches a figure that is consistent and wrong.",
        },
        {
          question: "Which check should return zero in a correctly built hospital model?",
          options: [
            { id: "a", text: "Total revenue minus the sum of departmental revenue", isCorrect: true },
            { id: "b", text: "Revenue minus total costs in each month of the forecast period", isCorrect: false },
            { id: "c", text: "Opening cash minus closing cash in each month", isCorrect: false },
            { id: "d", text: "Occupancy minus the benchmark occupancy", isCorrect: false },
          ],
          explanation:
            "Totals must cross-foot, so the difference is zero when the model is right. Revenue minus costs is profit, which has no reason to be zero, and cash moves every month.",
        },
        {
          question:
            "The partner wants base, downside and upside versions of a diagnostic centre model by tomorrow. What is the right build?",
          options: [
            { id: "a", text: "Save three copies of the file and change inputs in each", isCorrect: false },
            { id: "b", text: "Reduce every input by 10% for the downside and raise it by 10% for the upside", isCorrect: false },
            { id: "c", text: "Three input columns and a selector, each changing a few named drivers", isCorrect: true },
            { id: "d", text: "Add downside and upside output rows calculated as 80% and 120% of base", isCorrect: false },
          ],
          explanation:
            "One model with a scenario selector keeps the logic in one place, and each scenario changes named drivers for stated causes. Separate files drift apart, and a flat 10% change on everything describes no situation that could actually happen.",
        },
        {
          question:
            "A sensitivity run on a new hospital's year-three EBITDA shows these swings for the same step change: occupancy N210m, HMO payment days N35m on EBITDA but N160m on cash, diesel price N40m, consultant fee rates N95m. Where should diligence go first?",
          options: [
            { id: "a", text: "Diesel price, because it is the most volatile in Nigeria", isCorrect: false },
            { id: "b", text: "Consultant fee rates, because they are hardest to negotiate", isCorrect: false },
            { id: "c", text: "HMO payment days, because they hit cash hardest", isCorrect: false },
            { id: "d", text: "Occupancy, because it moves the chosen output most", isCorrect: true },
          ],
          explanation:
            "For the output asked about, year-three EBITDA, occupancy has the largest effect, so it earns the most diligence. Payment days matter for a cash question, but they move EBITDA least, and the sensitivity was run on EBITDA.",
        },
        {
          question:
            "A reviewer opens your model and sees blue numbers on the calculations sheet. What does this tell them under the usual convention?",
          options: [
            { id: "a", text: "Typed inputs have crept into a formulas sheet", isCorrect: true },
            { id: "b", text: "These cells link to another sheet", isCorrect: false },
            { id: "c", text: "These are the key outputs for the deck", isCorrect: false },
            { id: "d", text: "These cells have been checked and approved by the reviewer and are locked for editing", isCorrect: false },
          ],
          explanation:
            "Blue font marks typed inputs, which belong on the inputs sheet, so blue on a calculations sheet signals a hidden hard-code. Links to other sheets are usually green.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which tests would expose a logic error in a hospital cash flow model? Select all that apply.",
          options: [
            { id: "a", text: "Set occupancy to zero and confirm revenue and variable costs fall to zero", isCorrect: true },
            { id: "b", text: "Set one HMO's payment days to 365 and confirm cash falls while revenue does not", isCorrect: true },
            { id: "c", text: "Change the font colour of all inputs to blue", isCorrect: false },
            { id: "d", text: "Confirm closing cash in the cash flow equals cash on the balance sheet", isCorrect: true },
          ],
          explanation:
            "Extreme inputs and a balance check both test whether the logic behaves as it should. Formatting inputs helps a reviewer read the model but tests nothing.",
        },
        {
          question:
            "The figure in the deck for year-two revenue is N1.42bn. The model on the shared drive shows N1.37bn. What is the fastest way to resolve it?",
          options: [
            { id: "a", text: "Change the deck to the model's figure, since the model is the authority", isCorrect: false },
            { id: "b", text: "Check the change log for the version the deck came from", isCorrect: true },
            { id: "c", text: "Average the two and footnote the difference", isCorrect: false },
            { id: "d", text: "Rebuild the year-two revenue calculation from the inputs", isCorrect: false },
          ],
          explanation:
            "The change log shows what changed between versions, which tells you whether the deck is stale or the model has an unintended change. Overwriting the deck without knowing why the figures differ could carry a new error into the deliverable.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 3. Writing the memo
    // ------------------------------------------------------------------
    {
      slug: "analyst-writing-memo",
      name: "Writing the Analytical Memo",
      description:
        "The C4A house style in practice: answer first, the memo header, Label: fact bullets, numbers stated as results, the fewest words that carry the information, and which format each kind of work takes.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "The answer goes in the first line",
            body: `A C4A memo states its answer before anything else. The reader is a partner or a hospital owner with ten minutes between meetings. If they stop after the first two lines, they should already know what you found and what you recommend.

The order is fixed: answer, then the grouped reasons that support it, then the evidence behind each reason. You met this as the pyramid principle in Core Consulting Skills. In a memo it becomes concrete.

Weak opening:
"Following our visit to the pharmacy on 9 October, we reviewed stock records for the past six months, interviewed the pharmacist and two nurses and examined the procurement process. Several issues emerged."

Strong opening:
"Pharmacy stock-outs at Bayo Clinic come from ordering once a month against last month's usage. Weekly ordering against a reorder level would end most of them within a month, at no extra cost."

The weak version describes the work. The strong version gives the cause, the fix, the time and the cost. The visit, the records and the interviews move to the evidence section, where they support the claim.

Write the answer before you write anything else. If you cannot write it in two sentences, the analysis is not finished, and more prose will not finish it. Go back to the issue tree or ask the engagement lead.

Some memos report a question that has no answer yet. The answer line then states what is known, what is not and when it will be: "Revenue leakage in the laboratory is between N2m and N4m a month. The figure will be confirmed by 24 October, when the September reconciliation is done." That is still an answer. "We are still analysing the laboratory" is not.

Recommendations come with an owner and a date. "Pharmacy to move to weekly ordering from 1 November, owned by the chief pharmacist" can be acted on. "Ordering should be improved" cannot.`,
          },
          {
            title: "The memo header and Label: fact bullets",
            body: `Every C4A memo, internal or to a client, opens with the same four-line header:

To: Dr Folake Adeyemi, Medical Director
From: Office of the Founding Partner
Date: 14 October 2026
Subject: Pharmacy stock-outs: cause and fix

The subject line states the topic and, where it fits, the conclusion. "Pharmacy" alone is too vague to find in an inbox six weeks later.

Below the answer, the body is written as Label: fact bullets rather than persuasive paragraphs. The label is a short noun that names what the line is about. The fact is a plain statement, with a number wherever one exists.

- Cause: orders placed monthly against last month's usage, so any rise in demand runs out before the next order.
- Scale: 23 of the 140 fast-moving lines ran out at least once between April and September.
- Cost: about N1.8m of prescriptions a month were sent to outside pharmacies.
- Fix: weekly orders against a reorder level for the 140 lines, set from the last 90 days of usage.
- Owner: chief pharmacist, from 1 November.
- Risk: supplier minimum order values; two suppliers need a call this week.

The format lets a reader scan, find the line they care about and check it. It also removes the temptation to argue. A memo states the facts and the recommendation; it does not try to win the reader over with adjectives. If the case is strong, the facts make it. If it is weak, persuasive prose will not hide that from a partner, and it should not hide it from a client.

Plain labels are not the same as the bolded slogan headings that make text read as machine-written. A Label: fact line uses an ordinary word ("Cost", "Owner", "Risk") with no bold and no flourish, and the fact after the colon does the work.

Prose still has its place in reports and letters, where an argument needs connected reasoning. Even there, the answer leads and each paragraph opens with its point.`,
          },
          {
            title: "Fewest words: every sentence carries information",
            body: `Cut every sentence that adds rhythm but no information. A test for each sentence: if you delete it, does the reader lose a fact, a reason or an instruction? If not, delete it.

Sentences that usually fail the test:
- Throat-clearing: "It is worth noting that", "It is important to highlight".
- Restatement: a closing line that repeats the paragraph's point in different words.
- Lines about the document: "This memo sets out our findings", "Below we summarise". The header already says what the memo is.
- Lyricism: "The pharmacy is the beating heart of the hospital's revenue." Write "Pharmacy is 31% of revenue."
- Innuendo: "Certain practices in procurement may merit attention." Say what the practice is, or leave it out until you can.

Use plain words. "Use" not "utilise", "start" not "commence", "about" not "approximately", "because" not "due to the fact that".

Numbers are stated as results. Do not narrate simple arithmetic. "Lost revenue: N1.8m a month" is the line. "If we take the 23 lines that ran out and multiply the average days out of stock by the average daily sales, we arrive at a figure of N1.8m" puts the working where the result should be. The working, if anyone needs it, goes in the model or an appendix.

Write numbers consistently:
- Naira as N with m or bn: N1.8m, N2.4bn
- Percentages with the base when it matters: "23 of 140 lines (16%)"
- Dates as 14 October 2026, not 14/10/26, which a UK-trained reader may read differently from a US-trained one
- Ranges with "to" or a hyphen: "N2m to N4m"
- Round to what the evidence supports. N1,834,226 claims a precision the stock records do not have. N1.8m does not.

Vary sentence and paragraph length naturally. Do not force every paragraph to three sentences or every bullet to the same length; the content sets the length.`,
          },
          {
            title: "House rules, the tells to avoid, and choosing the format",
            body: `C4A copy never uses the long dash that sits between clauses. Use a comma, a colon or a full stop instead. An en dash is not an acceptable substitute. Check before you send: search the document for the character.

Partners reject drafts that read as machine-written. The six tells:
- Bolded parallel lead-ins, where every paragraph opens with a bold slogan of the same shape
- Short-sentence pivots: a statement, then a three-word sentence that turns it ("But not here.")
- An epigram closing each paragraph, a quotable line that adds nothing
- Meta lines about the document itself
- Uniform paragraphs, all the same length and shape
- "First, second, third" enumeration in prose where a list or a plain sequence would do

None of these is wrong once. Together they make a document sound generated, and a client who thinks a document is generated discounts its content.

Choose the format by reader and purpose:
- A proposal or pitch for a busy principal is a landscape deck, built on the firm's deck template. The prose version, if there is one, is the leave-behind.
- Reports and letters are prose, with the answer first.
- Every client deliverable goes to the client as a PDF built by the firm's scripts and saved in the engagement's documents folder, not as a web page or an editable file.
- An internal update to a partner is a memo with the header and Label: fact bullets.

Budgets follow one rule: either cost them bottom-up, line by line with quantities and unit costs you can defend, or give three high-level lines (marketing, operations, capital expenditure). Never half-specify. A budget with four precise lines and a large "other" invites questions about all of it, and a partner cannot defend it to a client.

Before sending, read the memo once as its recipient. Delete what they already know, add what they will ask, and confirm that the first two lines would be enough if they read nothing else.`,
          },
        ],
        exercises: [
          {
            title: "Rewrite a findings paragraph as a memo",
            instruction:
              "Rewrite this draft as a C4A memo to the Medical Director of Bayo Clinic, with header, a two-sentence answer and Label: fact bullets: 'Over the course of our review, which took place across three weeks in September, we looked closely at the outpatient department. It is worth noting that waiting times are a significant concern for patients. On average, patients waited 2 hours 40 minutes from registration to consultation, compared with the 60 minutes the clinic targets. When we looked at why, it became clear that the main driver is that all 180 daily patients are told to arrive at 8am, while doctors begin consultations at 9:30am. First, this creates a queue. Second, it fills the waiting area. Third, it drives complaints, which rose from 14 to 41 a month. Staggered appointment slots could transform the patient experience.' Keep under 150 words.",
          },
          {
            title: "Fix a half-specified budget",
            instruction:
              "A draft proposal for a clinic launch shows: digital advertising N1,250,000; printed flyers N180,000; launch event N2,400,000; other costs N6,000,000. Rewrite it twice: once as a three-line budget (marketing, operations, capital expenditure) with totals you would put to the client, and once as a list of the questions you would need answered to cost the 'other' line bottom-up. Say which version you would send if the meeting is tomorrow.",
          },
        ],
      },
      resources: { tools: ["C4A memo template", "Firm deck template", "Document find for the long dash character"] },
      questions: [
        {
          question:
            "You have finished a review of laboratory revenue at a 60-bed hospital. Which opening line best follows the house style?",
          options: [
            { id: "a", text: "This memo summarises our review of the laboratory, carried out between 2 and 13 October.", isCorrect: false },
            { id: "b", text: "Unbilled tests cost the laboratory about N3m a month; billing at sample collection would recover most of it.", isCorrect: true },
            { id: "c", text: "The laboratory is a vital revenue engine for the hospital that is not yet performing to its full potential across all of its test lines.", isCorrect: false },
            { id: "d", text: "We reviewed 4,200 test requests, interviewed six staff and reconciled billing records.", isCorrect: false },
          ],
          explanation:
            "The house style puts the answer first: the finding, its size and the fix. The work done is evidence that belongs lower down, and a line about the memo itself tells the reader nothing the header has not.",
        },
        {
          question: "Which memo header follows the C4A format?",
          options: [
            { id: "a", text: "Dear Dr Okafor, I hope this finds you well. Please see below our thoughts on theatre scheduling.", isCorrect: false },
            { id: "b", text: "THEATRE REVIEW: KEY INSIGHTS AND STRATEGIC OPPORTUNITIES", isCorrect: false },
            { id: "c", text: "To: Dr Okafor / From: C4A / Date: 3 November 2026 / Subject: Theatre scheduling: two fixes", isCorrect: true },
            { id: "d", text: "Re: Theatre (draft for discussion, confidential)", isCorrect: false },
          ],
          explanation:
            "The house header is To, From, Date and Subject, with a subject that names the topic and, where it fits, the conclusion. A letter opening and a capitalised slogan are neither format.",
        },
        {
          question: "Which line is a correct Label: fact bullet?",
          options: [
            { id: "a", text: "Cost: about N1.8m a month of prescriptions go to outside pharmacies.", isCorrect: true },
            { id: "b", text: "A Costly Problem: the pharmacy is quietly bleeding money every single month.", isCorrect: false },
            { id: "c", text: "Cost: significant.", isCorrect: false },
            { id: "d", text: "Cost: we believe it is likely that there may be some loss to outside pharmacies.", isCorrect: false },
          ],
          explanation:
            "A plain noun label followed by a fact with a number is the format. The second option is a persuasive slogan with lyrical prose, and 'significant' gives the reader nothing to check.",
        },
        {
          question:
            "Your analysis shows 40 beds at 70% occupancy and N90,000 per patient day. How should the revenue appear in the memo?",
          options: [
            { id: "a", text: "Taking 40 beds and multiplying by 365 days and 70% occupancy gives 10,220 days, which at N90,000 a day gives N919.8m.", isCorrect: false },
            { id: "b", text: "In-patient revenue: about N920m a year (40 beds, 70% occupancy, N90,000 per patient day).", isCorrect: true },
            { id: "c", text: "In-patient revenue: N919,800,000 per annum.", isCorrect: false },
            { id: "d", text: "In-patient revenue is substantial and should approach a billion naira.", isCorrect: false },
          ],
          explanation:
            "State the result, rounded to what the inputs support, with its basis in brackets; do not narrate the arithmetic. The full naira figure claims a precision the occupancy assumption does not have.",
        },
        {
          question:
            "A colleague's draft contains: 'Staff turnover is high. But not in theatres. Theatres retain nurses for an average of six years.' What is the problem?",
          options: [
            { id: "a", text: "The figure of six years needs a source", isCorrect: false },
            { id: "b", text: "Theatres should be discussed in a separate memo", isCorrect: false },
            { id: "c", text: "It should use 'firstly' and 'secondly' to introduce the contrast between theatres and the wards", isCorrect: false },
            { id: "d", text: "'But not in theatres.' is a pivot that adds nothing", isCorrect: true },
          ],
          explanation:
            "The three-word pivot is one of the tells that makes text read as generated; the next sentence carries the fact, so the pivot can go. A source is good practice but is not what makes this passage fail.",
        },
        {
          question:
            "You are drafting a clause and want to set off an aside. Which punctuation is acceptable in C4A copy?",
          options: [
            { id: "a", text: "A long dash, as long as it is used sparingly", isCorrect: false },
            { id: "b", text: "An en dash with spaces either side", isCorrect: false },
            { id: "c", text: "A comma, colon or full stop", isCorrect: true },
            { id: "d", text: "A double hyphen, which renders as a dash", isCorrect: false },
          ],
          explanation:
            "The house rule bans the long dash in all copy, and an en dash or double hyphen used the same way is treated as the same fault. Commas, colons and full stops do the job.",
        },
        {
          question:
            "A hospital owner has asked to see C4A's proposal for a 12-week turnaround. She runs three businesses and will give the meeting 30 minutes. What format should the proposal take?",
          options: [
            { id: "a", text: "A 20-page prose proposal sent the day before", isCorrect: false },
            { id: "b", text: "A landscape deck, with the prose document as the leave-behind", isCorrect: true },
            { id: "c", text: "A memo with Label: fact bullets and the fee in the subject line", isCorrect: false },
            { id: "d", text: "A web page she can browse on her phone", isCorrect: false },
          ],
          explanation:
            "Proposals for busy principals are landscape decks, and any prose version is the leave-behind. A long prose document is unlikely to be read before the meeting, and client deliverables are never web pages.",
        },
        {
          question:
            "A draft launch budget reads: digital ads N1,250,000; flyers N180,000; launch event N2,400,000; other N6,000,000. What is the best fix if the client meeting is tomorrow?",
          options: [
            { id: "a", text: "Split 'other' into four lines of N1,500,000 each", isCorrect: false },
            { id: "b", text: "Keep it as drafted, since the precise lines show care", isCorrect: false },
            { id: "c", text: "Remove the 'other' line so the budget looks tighter and the total falls to a figure the client will accept", isCorrect: false },
            { id: "d", text: "Give three lines: marketing, operations, capex", isCorrect: true },
          ],
          explanation:
            "A budget is either costed bottom-up or kept to three high-level lines; precise small lines next to a large unexplained 'other' is the half-specified version the rule forbids. Splitting 'other' evenly invents precision that does not exist.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which sentences in a draft memo should be cut because they carry no information? Select all that apply.",
          options: [
            { id: "a", text: "This memo sets out our findings and recommendations.", isCorrect: true },
            { id: "b", text: "Pharmacy accounts for 31% of revenue.", isCorrect: false },
            { id: "c", text: "It is worth noting that the issue is important.", isCorrect: true },
            { id: "d", text: "In short, the pharmacy is where the money is won or lost.", isCorrect: true },
            { id: "e", text: "The chief pharmacist will own the change from 1 November.", isCorrect: false },
          ],
          explanation:
            "A meta line about the document, throat-clearing and an epigram restating the point all fail the deletion test. The revenue share and the owner and date are facts the reader would lose.",
        },
        {
          question:
            "Analysis of a hospital's laboratory is half done. The partner asks for a memo today. What should the answer line say?",
          options: [
            { id: "a", text: "Leakage is N2m to N4m a month; confirmed by 24 October.", isCorrect: true },
            { id: "b", text: "We are still analysing the laboratory and will report when complete.", isCorrect: false },
            { id: "c", text: "Laboratory leakage is N3m a month.", isCorrect: false },
            { id: "d", text: "Preliminary work suggests the laboratory may have some issues worth exploring.", isCorrect: false },
          ],
          explanation:
            "An interim answer states what is known, the range, and when it will be firm. A single figure overstates certainty, and 'still analysing' gives the partner nothing to use.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 4. Exhibits and slides
    // ------------------------------------------------------------------
    {
      slug: "analyst-exhibits-slides",
      name: "Exhibits and Slides",
      description:
        "Making exhibits that carry one message each: action titles, choosing the right chart, building a landscape deck for a principal, and checking every exhibit before it leaves the firm.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "One exhibit, one message, one action title",
            body: `Each exhibit exists to prove one point, and its title states that point as a full sentence. Before making a chart, write the sentence it has to support. If you cannot, you do not yet know what the chart is for.

A topic title names the data: "Outpatient visits by month, 2025 to 2026". An action title states what the data shows: "Outpatient visits fell 18% after the March fee rise and have not recovered". The reader gets the finding from the title and uses the chart to check it.

Good action titles:
- State the finding, with a number where one exists
- Fit on two lines at most
- Are true of the chart beneath them, with nothing the chart does not show
- Use the client's terms, such as their department names and their financial year

Read only the titles of a deck in order. They should tell the whole argument. If they do not, either a slide is missing or a slide is carrying two messages. When a slide has two messages, split it. When two slides have the same message, merge them or cut one.

This is why storylines are drafted as titles first. Before building any slide, write the deck as a list of action titles on one page: the ghost deck. The engagement lead can then fix the argument in ten minutes, before you spend two days on charts that make the wrong case.

The body of the exhibit then supports the title and nothing else. Data that is interesting but does not bear on the title goes to the appendix or nowhere. A chart showing twelve departments when the point is about two should highlight those two in colour and grey out the rest, or show only the two with a note that the others were stable.

Every exhibit carries a source line at the bottom, in the same format as your research citations, and states its units: "N'm", "patients per month", "% of admissions".`,
          },
          {
            title: "Choosing the chart",
            body: `The chart type follows from the kind of comparison the title makes. Pick the comparison, then the chart.

- Comparing categories (departments, HMOs, branches): a bar chart, horizontal when the labels are long. Sort the bars largest to smallest unless the categories have a natural order.
- Change over time: a line chart for many periods or a continuous trend; columns for a few periods, such as four quarters.
- Parts of a whole: a 100% stacked bar, or a simple bar of shares. Avoid pie charts beyond two or three slices; people cannot compare angles accurately.
- How a figure changed from one value to another: a waterfall (bridge) chart, such as EBITDA moving from last year to this year through price, volume, staff cost and diesel.
- Distribution: a histogram, such as how long patients waited across 600 outpatient visits.
- Relationship between two measures: a scatter plot, such as length of stay against cost per admission for each consultant.
- Exact values the reader needs to look up: a table, not a chart.

Then strip the chart to what carries the message:
- Start bar and column axes at zero. A bar axis that starts at 60% makes a three-point difference look like a doubling.
- Label data directly on or next to the bars and lines, and remove the legend where possible.
- Remove gridlines, borders, 3D effects and shadows.
- Use one highlight colour for the element the title is about and grey for the rest.
- Keep colours consistent across the deck: if self-pay is dark blue on slide 4, it is dark blue on slide 11.

Check that the exhibit reads in grayscale. Clients print decks on office printers, and a chart that relies on red against green is unreadable in black and white and for colour-blind readers.

Resist adding a second axis. A chart with revenue on the left axis and margin on the right almost always reads better as two charts side by side.`,
          },
          {
            title: "The landscape deck for a busy principal",
            body: `Proposals and pitches to hospital owners, medical directors and group chief executives are landscape decks built on the firm's deck template. These readers give a meeting 30 minutes, often less, and many read on a phone or a printed copy. A deck lets them see the argument at a glance and jump to the slide that matters to them.

The standard structure:
- Cover: client name, subject, date. No decoration.
- Executive summary: the answer and the three to five points that support it, on one slide.
- Body sections, each opening with a slide that states the section's message, then supporting exhibits.
- Next steps: what happens, who does it and by when.
- Appendix: method, detailed tables, sources and anything the reader may need but not every reader will.

Each slide makes one point in its title, and the body proves it. Text on a slide is short: a line or two per point, at a size that is legible when printed. If a slide needs a paragraph to be understood, either the point belongs in the leave-behind document or the slide is trying to do two jobs.

Keep slide count to what the argument needs. A proposal for a 12-week engagement is typically 12 to 20 slides plus appendix. A deck of 50 slides for a 30-minute meeting tells the client you did not decide what mattered.

The prose document, where there is one, is the leave-behind. It carries the reasoning the deck compresses and is what the client's finance director reads after the meeting.

Client deliverables leave the firm as PDFs. A PDF fixes the layout, prints the same way on every machine and cannot be edited by accident. An editable deck sent to a client tends to come back with its numbers changed and the firm's name still on it.

House style applies to slides as much as memos: no long dash, plain words, numbers stated as results, and no slogans in place of findings.`,
          },
          {
            title: "Checking an exhibit before it leaves the firm",
            body: `An exhibit with a wrong number damages the credibility of every correct one in the deck. Check every exhibit against a short list before the deck goes to review.

Numbers:
- Every figure ties to the current version of the model or the source log. Note the model version on your working copy.
- Totals add up. If a stacked bar shows shares, they total 100%. If a table shows departments, they sum to the total line.
- The same figure is the same everywhere. Year-two revenue on the executive summary matches year-two revenue on slide 14.
- Rounding is consistent: one decimal place in N'm throughout, or none.

Labels and sources:
- Units on every axis or in the title.
- Source line on every exhibit.
- Dates and periods stated, with the client's financial year if it differs from the calendar year.

Message:
- The title is true of the chart. If the title says "fell 18%", the chart shows the fall and the 18% can be read from it.
- The highlighted element is the one the title discusses.
- The exhibit makes sense printed in black and white.

Confidentiality:
- No data from another client appears, even in a benchmark, unless the engagement lead has cleared it.
- No patient names, record numbers or photographs that could identify a patient.
- Staff data for small teams is shown at unit level. A chart of satisfaction scores for a five-person pharmacy team identifies individuals.

Then do the read-through test: read the action titles in order without the charts. Then look at each chart without its title and say what it shows. If your version differs from the title, one of them needs to change.

Keep a checked copy. When the engagement lead edits a slide, the checks apply again to that slide.`,
          },
        ],
        exercises: [
          {
            title: "Title and chart for receivables data",
            instruction:
              "Amara Hospital, Enugu, is owed N148m by five HMOs. Balances over 90 days: HMO A N41m of N52m owed, HMO B N6m of N31m, HMO C N22m of N28m, HMO D N3m of N21m, HMO E N4m of N16m. Write an action title for the exhibit, choose the chart type and justify it in one line, say what you would highlight and draw a rough sketch. Then write the source line.",
          },
          {
            title: "Ghost deck for a proposal",
            instruction:
              "Draft the ghost deck, as action titles only, for a 15-slide landscape proposal to the owner of a 50-bed hospital in Abuja whose occupancy has fallen from 72% to 51% in 18 months while two competitors opened nearby. Include the executive summary title, section titles and next steps. Then mark which slides need an exhibit and which chart type each would use.",
          },
        ],
      },
      resources: { tools: ["Firm deck template", "Excel or Google Sheets charts", "Exhibit checklist"] },
      questions: [
        {
          question: "Which is the best title for a chart of monthly outpatient visits over 18 months?",
          options: [
            { id: "a", text: "Outpatient visits by month across all clinics, April 2025 to September 2026", isCorrect: false },
            { id: "b", text: "Outpatient trends: a story of decline and opportunity", isCorrect: false },
            { id: "c", text: "Outpatient visits fell 18% after the March fee rise and have not recovered", isCorrect: true },
            { id: "d", text: "Outpatient visits", isCorrect: false },
          ],
          explanation:
            "An action title states the finding with its number, so the reader gets the point from the title and checks it on the chart. The first option is a topic title and the second is a slogan that states no finding.",
        },
        {
          question:
            "You want to show how a hospital's EBITDA moved from N84m last year to N51m this year through changes in price, volume, staff cost and diesel. Which chart fits?",
          options: [
            { id: "a", text: "A waterfall from N84m to N51m, one step per driver", isCorrect: true },
            { id: "b", text: "A pie chart of this year's costs", isCorrect: false },
            { id: "c", text: "A line chart of monthly EBITDA", isCorrect: false },
            { id: "d", text: "Two columns side by side, one for last year's EBITDA and one for this year's", isCorrect: false },
          ],
          explanation:
            "A waterfall shows how a figure moves from one value to another through named drivers. Two columns show the size of the fall but not its causes, which is what the title has to explain.",
        },
        {
          question:
            "A bar chart compares bed occupancy across four wards: 71%, 74%, 69% and 76%. The axis starts at 65%. What is wrong?",
          options: [
            { id: "a", text: "Occupancy should be shown as a line chart", isCorrect: false },
            { id: "b", text: "The bars should be sorted alphabetically by ward name so the client can find each ward quickly", isCorrect: false },
            { id: "c", text: "The chart needs a legend for the four wards", isCorrect: false },
            { id: "d", text: "The axis does not start at zero, exaggerating gaps", isCorrect: true },
          ],
          explanation:
            "Bars encode values by length, so a truncated axis makes a seven-point spread look several times larger. Sorting by value, not alphabet, would also help, but the axis is what misleads.",
        },
        {
          question:
            "A deck for a hospital owner has 48 slides for a 30-minute meeting. What is the most useful advice to the analyst who built it?",
          options: [
            { id: "a", text: "Reduce font size so more fits on each slide", isCorrect: false },
            { id: "b", text: "Keep the argument's slides; move the rest to the appendix", isCorrect: true },
            { id: "c", text: "Send the full deck the night before so she can read every slide at her own pace", isCorrect: false },
            { id: "d", text: "Convert the deck into a prose report instead", isCorrect: false },
          ],
          explanation:
            "A principal's deck holds only the slides the argument needs, with detail in the appendix. Smaller fonts make the slides harder to read without making the argument any clearer.",
        },
        {
          question:
            "Reading the action titles of a draft deck in order, you notice that slides 6 and 9 make the same point and slide 7 makes two. What should you do?",
          options: [
            { id: "a", text: "Merge or cut one of slides 6 and 9, and split slide 7 into two slides", isCorrect: true },
            { id: "b", text: "Keep them all; repetition helps the client remember", isCorrect: false },
            { id: "c", text: "Shorten slide 7's title so it fits on one line", isCorrect: false },
            { id: "d", text: "Move slides 6, 7 and 9 to the appendix", isCorrect: false },
          ],
          explanation:
            "Each slide carries exactly one message, so duplicates merge and a two-message slide splits. Shortening a title does not change the number of points the slide makes.",
        },
        {
          question:
            "The engagement lead asks you to send the final diagnostic deck to the client's medical director. In what form should it go?",
          options: [
            { id: "a", text: "As the editable presentation file so she can adapt it for her board", isCorrect: false },
            { id: "b", text: "As a link to a web page with the slides", isCorrect: false },
            { id: "c", text: "As a PDF built and saved in the engagement's documents folder", isCorrect: true },
            { id: "d", text: "As screenshots pasted into the body of an email", isCorrect: false },
          ],
          explanation:
            "Client deliverables leave the firm as PDFs, which fix the layout and cannot be edited by accident. An editable file tends to come back with changed numbers still carrying the firm's name.",
        },
        {
          question:
            "You are charting staff satisfaction scores by unit. The pharmacy has five staff, the wards 62. How should the pharmacy appear?",
          options: [
            { id: "a", text: "As individual scores, so the pharmacist-in-charge can act on them", isCorrect: false },
            { id: "b", text: "Combined into a larger group or shown only as a trend", isCorrect: true },
            { id: "c", text: "Removed from the survey results entirely", isCorrect: false },
            { id: "d", text: "Shown with names removed but each person's score as a separate bar", isCorrect: false },
          ],
          explanation:
            "In a team of five, unit-level comparisons can identify individuals, so the data is grouped or shown as a trend. Removing names does not help when there are only five people to choose from.",
        },
        {
          question:
            "A chart shows revenue for eight departments. The title is about the fall in two of them, laboratory and radiology. How should the chart be formatted?",
          options: [
            { id: "a", text: "Eight different colours with a legend", isCorrect: false },
            { id: "b", text: "Laboratory and radiology in red and green to show the contrast", isCorrect: false },
            { id: "c", text: "Show only laboratory and radiology and drop the others without note", isCorrect: false },
            { id: "d", text: "The two in one highlight colour, the other six in grey", isCorrect: true },
          ],
          explanation:
            "One highlight colour for the elements the title discusses directs the eye while keeping the context. Red against green fails in grayscale printing and for colour-blind readers.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which checks belong on every exhibit before the deck goes to review? Select all that apply.",
          options: [
            { id: "a", text: "Figures tie to the current model version or source log", isCorrect: true },
            { id: "b", text: "A source line and units are shown", isCorrect: true },
            { id: "c", text: "The chart uses at least three colours", isCorrect: false },
            { id: "d", text: "The title is true of what the chart shows", isCorrect: true },
          ],
          explanation:
            "Numbers that tie, a source with units, and a title the chart supports are the core checks. The number of colours is not a quality test; one highlight and grey is often best.",
        },
        {
          question:
            "Before building any slides for a proposal, what should you share with the engagement lead?",
          options: [
            { id: "a", text: "A ghost deck of action titles on one page", isCorrect: true },
            { id: "b", text: "The cover slide and executive summary, fully formatted on the firm template with charts in place", isCorrect: false },
            { id: "c", text: "All the charts you plan to use, without titles", isCorrect: false },
            { id: "d", text: "A list of data sources you will need", isCorrect: false },
          ],
          explanation:
            "The ghost deck lets the lead fix the argument in minutes before charts are built. Formatted slides or untitled charts invest effort before anyone has agreed what the deck should say.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // 5. Field data
    // ------------------------------------------------------------------
    {
      slug: "analyst-field-data",
      name: "Surveys, Interviews and Site Visits",
      description:
        "Collecting data in the field: designing questions that measure what you mean, choosing who to ask, running interviews and site visits, getting consent under the NDPA, and cleaning the data before analysis.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "Designing questions that measure what you mean",
            body: `Every question in a survey or interview guide must trace back to something the engagement needs to decide. Start from the decision, list the facts that would inform it, and write a question for each fact. Questions that do not map to a decision come out, however interesting they are. Long surveys get abandoned halfway, and the half that is answered is the easy half.

Closed questions (choose an option, rate on a scale) produce data you can count. Open questions ("What would you change about the waiting area?") produce reasons and language you could not have predicted. Most C4A surveys are mainly closed, with two or three open questions at the end.

Common faults, each of which produces data that looks fine and means nothing:
- Leading: "How satisfied were you with our friendly nurses?" assumes the answer.
- Double-barrelled: "Were the doctors and nurses helpful?" cannot be answered if one was and the other was not.
- Vague time frame: "How often do you visit?" Ask "How many times have you visited in the last three months?"
- Unbalanced scale: "Excellent, very good, good, fair" has three positive options and no clearly negative one.
- Jargon: "Was your triage timely?" Patients do not know the word. Ask how long they waited before a nurse first saw them.

Keep scales consistent across a survey. If question 3 runs from 1 (very dissatisfied) to 5 (very satisfied), every rating question runs the same way.

Language matters in Nigerian facilities. A patient exit survey in a Kano clinic may need Hausa; in Lagos, Yoruba or Pidgin may get better answers than formal English. Translate, then have a second person translate back into English and compare. Words like "satisfied" do not always have a direct equivalent.

Pilot every instrument with five people from the target group before launch. Watch them answer, ask what they understood each question to mean, and fix the ones they hesitate over. A pilot takes an afternoon and saves a survey.`,
          },
          {
            title: "Sampling: who you ask and how many",
            body: `Who answers determines what the results can tell you. Decide the population you want to describe, then the sample, then the size.

For staff surveys in a hospital, the population is usually small enough to ask everyone: a census. A 120-staff hospital should be surveyed in full, across all shifts and cadres, including night staff, cleaners and security, who are easy to miss. Report the response rate by cadre. If 80% of nurses responded but only 20% of doctors, the doctors' results are weak and the memo says so.

For patients, you sample. The rules that matter most:
- Spread across days and times. Monday morning outpatients differ from Saturday afternoon outpatients. Cover the week and both clinic sessions.
- Cover each payor group. HMO, NHIA, corporate and self-pay patients have different experiences and different complaints.
- Avoid letting staff choose who gets the form. They will choose the patients who seem happiest.
- Record how many people were approached and how many declined.

Size depends on how precise the answer must be. As a rule of thumb for a yes or no question, about 100 responses gives a result within roughly 10 percentage points either way; about 400 narrows it to roughly 5 points. If you need to compare two groups, such as HMO against self-pay patients, each group needs its own adequate sample.

Small numbers create a second problem: identification. Peer comparisons and breakdowns work in large groups, but in a unit of fewer than about 30 people, a breakdown by cadre and shift can point to one person. A staff survey that promised anonymity must not then report "night-shift pharmacy staff" when there are two of them. Report small units at a higher level, or report trends without ranking units against each other.

Convenience samples, such as whoever was in the waiting room on the day of the site visit, are acceptable for a quick read. Label them as such and do not present them as representative.`,
          },
          {
            title: "Interviews and site visits",
            body: `Interviews explain why the numbers look the way they do; site visits show what actually happens. Plan both, and keep the record so someone who was not there can rely on it.

For interviews:
- Use a guide of eight to twelve questions that maps to the issue tree, with the most important asked early in case time runs out.
- Two people where possible: one asks, one takes notes. The note-taker writes what was said, using quotation marks only for exact words.
- Interview people separately from their managers. A nurse will not describe a staffing problem with the matron in the room.
- Ask for examples and numbers. "Discharge is slow" becomes useful when followed by "How long did the last discharge take, and where did it wait?"
- Type the notes within 24 hours, while you can still read your handwriting and remember what the abbreviations meant.

In the notes, keep three things separate: what was said, what you observed, and what you think it means. Interpretation mixed into the record cannot later be checked against it.

For site visits, walk the patient's path from the gate to the exit and time it. Count things rather than describing them: the number of patients waiting at 10am, the number of working blood pressure machines, the minutes from arrival to registration for five patients. Check what people told you against what you see and what the records show. If the store manager says stock is counted weekly, ask to see the last three count sheets.

Use a checklist so two analysts visiting two branches record the same things the same way.

Photographs need permission from the facility, and they must never show a patient's face, a patient record or a screen with patient details. Photograph the empty waiting area, the expired stock on the shelf, the broken generator panel. If in doubt, describe it in writing instead.

Be a considerate visitor. Staff are working; agree timings with the department head in advance, keep interviews to the agreed length, and thank people.`,
          },
          {
            title: "Consent and data protection in the field",
            body: `Every person who gives C4A data in the field does so with informed consent, and the data is handled under the Nigeria Data Protection Act 2023. The NDPA replaced the earlier NDPR and treats health data as sensitive personal data, which carries stricter duties.

Informed consent means the person knows, before they answer:
- Who is collecting the data and for which organisation
- What it is for
- That taking part is voluntary and they can stop at any point
- Whether their answers are anonymous, confidential or attributed
- Who will see the results and in what form

Put this at the top of every survey and say it at the start of every interview. For staff, make clear that declining has no effect on their job, and make sure that is true.

Anonymous and confidential are different promises. Anonymous means no one, including C4A, can link an answer to a person: no names, no staff numbers, and no combination of unit, cadre and shift that points to one individual. Confidential means C4A knows who said what but will not reveal it. Do not promise anonymity in a staff survey that asks for name and department.

Do not record an interview without explicit permission, and do not record at all where people would speak less freely.

Collect the minimum. If the analysis does not need a patient's name, phone number or hospital number, do not collect them. An exit survey on waiting times needs the time of arrival and the payor group, not the patient's identity.

Store field data on the firm's systems, in the engagement folder, with access limited to the team. Field data does not live on personal phones, personal email or WhatsApp groups. Paper forms are scanned and stored securely, and the originals are kept or destroyed according to the engagement's agreement with the client.

When reporting, quotes are unattributed unless the person agreed otherwise, and a quote that only one person could have said is treated as identifying.`,
          },
          {
            title: "Cleaning field data before analysis",
            body: `Raw field data always contains errors, and analysis on uncleaned data produces confident wrong answers. Clean it in a fixed order and keep a record of every change.

Keep the raw file untouched. Save it, lock it and do all cleaning in a copy. Every change goes in a cleaning log: the record, the field, the original value, the new value and the reason. If a partner later asks why the sample fell from 412 to 386, the log answers it.

Work through these steps:
- Remove duplicates. Online forms are often submitted twice; paper forms are sometimes entered twice.
- Check ranges. A waiting time of 900 minutes or an age of 3 for a staff member is an entry error. Correct it from the paper form if you can; otherwise set it to missing.
- Check consistency. A respondent who says they have never been admitted and then rates the ward food has an inconsistent record. Decide a rule and apply it to every record the same way.
- Handle incomplete forms with a stated rule, such as keeping any form with at least 80% of questions answered.
- Code the "other" responses. If 40 people wrote "the queue" under "other", that is a category.
- Code open text into themes, with a short codebook so two analysts would code the same comment the same way.

Report the number of responses behind every figure. "62% of patients rated waiting times as poor (n = 214)" lets the reader judge the result. When a question was answered by fewer people than the survey as a whole, say so.

Check the cleaned data against what you know. If the survey says 70% of patients are self-pay and the hospital's billing data says 35%, either the sample is skewed or something went wrong in collection. Find out which before writing the memo.

Finally, store the cleaned file, the cleaning log and the codebook together in the engagement folder, named and versioned like the model.`,
          },
        ],
        exercises: [
          {
            title: "Fix a patient exit survey",
            instruction:
              "Zainab Specialist Clinic in Kaduna has drafted an exit survey: 'Q1 How satisfied were you with our excellent service? Q2 Were the doctor and the nurse respectful? Q3 How often do you come here? Q4 Was your triage timely? Q5 Rate us: excellent / very good / good / fair. Q6 Name and phone number.' The clinic sees about 220 outpatients a day across two sessions and wants to compare HMO and self-pay patients. Rewrite each question, write the consent paragraph, and set out a sampling plan for two weeks that would let the HMO and self-pay groups be compared.",
          },
          {
            title: "Clean and report a staff survey",
            instruction:
              "A staff survey at a 140-staff hospital returned 131 forms. Nine are duplicates, five have under half the questions answered, and three report more than 40 years' service at a hospital founded in 2004. The pharmacy has four staff and two responded. Write the cleaning log entries, state the final n, and explain how you would report the pharmacy results without identifying anyone.",
          },
        ],
      },
      resources: { tools: ["Survey form builder", "Interview guide template", "Site visit checklist", "Cleaning log template"] },
      questions: [
        {
          question: "Which survey question is double-barrelled?",
          options: [
            { id: "a", text: "How many times have you visited this clinic in the last three months?", isCorrect: false },
            { id: "b", text: "How long did you wait between registration and seeing a doctor?", isCorrect: false },
            { id: "c", text: "Were the doctor and the nurse respectful to you?", isCorrect: true },
            { id: "d", text: "Which HMO, if any, paid for today's visit?", isCorrect: false },
          ],
          explanation:
            "Asking about two people in one question leaves the respondent unable to answer if only one was respectful. The other questions each ask about one thing with a clear frame.",
        },
        {
          question:
            "A 150-staff hospital wants to understand staff morale. How should the survey be sampled?",
          options: [
            { id: "a", text: "Survey a random sample of 50 staff to save time", isCorrect: false },
            { id: "b", text: "Survey everyone, all shifts and cadres, with response rates by cadre", isCorrect: true },
            { id: "c", text: "Ask each head of department to nominate five staff", isCorrect: false },
            { id: "d", text: "Survey day-shift staff only, since they are easier to reach and make up most of the workforce", isCorrect: false },
          ],
          explanation:
            "A population of 150 is small enough for a census, which avoids sampling error and lets you see which cadres responded. Nominated staff are chosen by their managers and will not represent the rest.",
        },
        {
          question:
            "You need to compare waiting-time ratings between HMO and self-pay patients, each to within about 10 percentage points. Roughly how many responses do you need?",
          options: [
            { id: "a", text: "About 100 in total", isCorrect: false },
            { id: "b", text: "About 30 in each group", isCorrect: false },
            { id: "c", text: "About 400 in total, regardless of the split", isCorrect: false },
            { id: "d", text: "About 100 in each group", isCorrect: true },
          ],
          explanation:
            "Each group being compared needs its own adequate sample, and about 100 gives roughly 10 points of precision. A total of 100 split between two groups leaves each one too small.",
        },
        {
          question:
            "During an interview, a ward nurse says discharges are 'always slow'. What is the most useful follow-up?",
          options: [
            { id: "a", text: "Ask how long her last discharge took and where it waited", isCorrect: true },
            { id: "b", text: "Ask whether she thinks the matron is responsible", isCorrect: false },
            { id: "c", text: "Note that discharges are slow and move on to the next question on the guide to save time", isCorrect: false },
            { id: "d", text: "Ask her to rate discharge speed from 1 to 5", isCorrect: false },
          ],
          explanation:
            "Asking for a specific recent example turns an impression into a time and a location you can check. Asking about the matron leads the answer and invites blame rather than facts.",
        },
        {
          question:
            "A staff survey promises anonymity. Results show low scores for 'night shift, pharmacy', where two people work. How should this be reported?",
          options: [
            { id: "a", text: "Report it as found, since no names are shown", isCorrect: false },
            { id: "b", text: "Report it to the pharmacist-in-charge only", isCorrect: false },
            { id: "c", text: "Report pharmacy as a whole, without the shift breakdown", isCorrect: true },
            { id: "d", text: "Drop the pharmacy results from the report entirely", isCorrect: false },
          ],
          explanation:
            "With two people, the breakdown identifies them and breaks the anonymity promise, so it is reported at a level where no one can be singled out. Dropping the results loses the information when grouping keeps it.",
        },
        {
          question:
            "The store manager says stock is counted every Friday. What should you do on the site visit?",
          options: [
            { id: "a", text: "Record the statement as the stock count process", isCorrect: false },
            { id: "b", text: "Ask to see the last three count sheets", isCorrect: true },
            { id: "c", text: "Ask a pharmacist whether the statement is true", isCorrect: false },
            { id: "d", text: "Note it as doubtful in your interview record", isCorrect: false },
          ],
          explanation:
            "Site visits test what people say against records and observation, so you ask for the count sheets. Writing doubt into the record mixes interpretation with what was said.",
        },
        {
          question:
            "An exit survey on waiting times currently asks for name, phone number and hospital number. What should you change?",
          options: [
            { id: "a", text: "Keep all three but store them in a separate file", isCorrect: false },
            { id: "b", text: "Keep the phone number only, for follow-up calls", isCorrect: false },
            { id: "c", text: "Keep them, as long as the consent paragraph mentions them and patients can leave them blank", isCorrect: false },
            { id: "d", text: "Remove them; the analysis does not need identity", isCorrect: true },
          ],
          explanation:
            "The NDPA requires collecting only what the purpose needs, and waiting-time analysis needs arrival time and payor group, not identity. Consent does not justify collecting data the analysis will not use.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which practices meet the firm's standard for handling field data? Select all that apply.",
          options: [
            { id: "a", text: "Storing scanned survey forms in the engagement folder with access limited to the team", isCorrect: true },
            { id: "b", text: "Sharing interview notes in a team WhatsApp group for speed", isCorrect: false },
            { id: "c", text: "Recording an interview only after explicit permission", isCorrect: true },
            { id: "d", text: "Photographing the waiting area when no patients are visible, with the facility's permission", isCorrect: true },
            { id: "e", text: "Keeping survey responses on your personal phone until you return to the office", isCorrect: false },
          ],
          explanation:
            "Firm systems with limited access, recording with permission and photographs that show no patients meet the standard. WhatsApp groups and personal phones put health data outside the firm's control.",
        },
        {
          question:
            "While cleaning a patient survey you find 14 waiting times entered as over 600 minutes. The paper forms show most should be under 60. What do you do?",
          options: [
            { id: "a", text: "Correct each from the paper form and log every change", isCorrect: true },
            { id: "b", text: "Delete the 14 records, since they are unreliable", isCorrect: false },
            { id: "c", text: "Divide all 14 values by ten, since it looks like a typing error", isCorrect: false },
            { id: "d", text: "Fix the values directly in the raw file so that everyone on the team uses the corrected version", isCorrect: false },
          ],
          explanation:
            "Where the source form exists, you correct from it and log each change. Editing the raw file destroys the record you would need if anyone questions the cleaning, and a blanket fix assumes every error has the same cause.",
        },
        {
          question:
            "A cleaned patient survey says 70% of respondents were self-pay. The hospital's billing data says 35% of outpatients are self-pay. What should you do before writing the memo?",
          options: [
            { id: "a", text: "Report the survey figure, since it came directly from patients", isCorrect: false },
            { id: "b", text: "Report the average of the two figures", isCorrect: false },
            { id: "c", text: "Weight the results by billing data without investigating", isCorrect: false },
            { id: "d", text: "Find out if the sample was skewed or collection failed", isCorrect: true },
          ],
          explanation:
            "A gap that large means the sample may not represent outpatients, for example if surveys were handed out only at the self-pay till, and the cause decides how the results can be used. Reweighting without knowing the cause can hide a deeper collection fault.",
        },
      ],
    },
  ],
};

export default expansion;
