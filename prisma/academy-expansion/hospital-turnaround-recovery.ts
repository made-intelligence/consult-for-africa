import type { TrackExpansion, Question, Option } from "./types";

const p = (...paras: string[]) => paras.join("\n\n");
const IDS = ["a", "b", "c", "d", "e"] as const;
const opts = (texts: string[], correct: number[]): Option[] =>
  texts.map((text, i) => ({ id: IDS[i], text, isCorrect: correct.includes(i) }));
const mc = (question: string, texts: string[], correct: number, explanation: string): Question => ({
  type: "MULTIPLE_CHOICE",
  question,
  options: opts(texts, [correct]),
  explanation,
});
const ms = (question: string, texts: string[], correct: number[], explanation: string): Question => ({
  type: "MULTI_SELECT",
  question,
  options: opts(texts, correct),
  explanation,
});
const A = 0, B = 1, C = 2, D = 3;

const expansion: TrackExpansion = {
  slug: "hospital-turnaround-recovery",
  topUp: [
    {
      moduleSlug: "turnaround-diagnostics",
      questions: [
        mc(
          "A 120-bed hospital has 78% occupancy, a low claims denial rate and a capable, committed CEO, but cash covers only three weeks of payroll. Which Distress Scorecard dimension should set the urgency of your recommendation?",
          ["Liquidity, because three weeks' payroll cover puts cash before everything else", "Operational performance, because strong occupancy shows the hospital can trade its way out of the problem", "Leadership capacity, because a capable CEO means the hospital needs little outside help", "Revenue integrity, because low denials show the problem is not in collections"],
          A,
          "Liquidity asks whether the hospital can meet payroll next month, and three weeks of cover answers no. Good occupancy is reassuring about the business but does not pay salaries due in four weeks.",
        ),
        mc(
          "On Day 2 of a 10-day Rapid Assessment, the medical director asks you to start with ward-level interviews about morale and culture. How should you respond?",
          ["Agree, since culture is usually the root cause of hospital distress and should be understood before anyone looks at the numbers", "Postpone all interviews until Day 8, when findings are synthesised", "Replace the financial triage with a staff survey, which covers more people faster", "Keep Days 1 to 3 on financial triage with the leadership interviews alongside, and widen to staff once cash is known"],
          D,
          "The first three days establish runway, because that sets the urgency of everything else, while the CEO, CFO, clinical, nursing and procurement interviews run in the same window. Starting with culture may be well meant but leaves you not knowing whether payroll can be met.",
        ),
        mc(
          "Board minutes over the past year report occupancy of about 75%, but the ward registers you reviewed show 52%. What does this point to, and how should you handle it?",
          ["A governance failure: the board's picture does not match operations; brief the CEO and chair privately first", "A data entry error in the ward registers, which should be corrected before the report", "A difference in definitions that is normal and need not be reported", "Deliberate fraud by management, which should be reported to the full board at once so that no director is exposed"],
          A,
          "A gap between board narrative and operational reality is the governance signal the module describes, and the no-surprises rule means private briefings first. Calling it fraud before the facts are established turns a diagnostic into an indictment.",
        ),
        mc(
          "Which of these belongs in the Turnaround Readiness Report's list of quick wins deliverable within 30 days?",
          ["Opening a cardiac catheterisation laboratory to attract high-value self-pay patients from Abuja", "Rebuilding the maternity wing to raise the hospital's profile", "Replacing the hospital information system with a fully integrated EMR", "Resubmitting N22m of claims denied in the last 90 days for missing authorisation codes"],
          D,
          "Quick wins fix what is already broken and pay back within weeks, and corrected claims are revenue already earned. The other options need capital and months, so they belong, if anywhere, in later phases.",
        ),
        mc(
          "Your scorecard for a hospital gives liquidity 2, operations 2, revenue integrity 3, cost structure 2 and leadership capacity 1, because the CEO denies there is a problem and has blocked two earlier reviews. What does the leadership score mean for your recommendation?",
          ["The plan must address leadership directly, because nobody with the skill and will to execute means no delivery", "It can be noted and set aside, since the financial dimensions are what drive the overall severity rating", "It means the hospital should go straight to managed wind-down, since no turnaround can work without the CEO", "It should be left out of the report to keep the CEO engaged"],
          A,
          "Leadership capacity is scored because execution depends on it, so a 1 has to shape the recommendation, whether through new leadership or strong board-backed support. Leaving it out to keep the CEO onside hides the main risk to the plan.",
        ),
      ],
    },
    {
      moduleSlug: "financial-stabilisation",
      questions: [
        mc(
          "A 13-week cash forecast opens with N25m. Weekly receipts are steady at N30m and weekly payments at N36m. In which week does the hospital run out of cash if nothing changes?",
          ["Week 5", "Week 4", "Week 13", "Week 1"],
          A,
          "The hospital loses N6m a week, so cash is N1m at the end of Week 4 and goes negative during Week 5. Week 4 is the tempting answer, but the balance is still just positive at its close.",
        ),
        mc(
          "Under the three-tier cost framework, which of these belongs in Tier 2, restructure within 60 days?",
          ["ICU nurse staffing on night shifts", "Software subscriptions that nobody in the hospital has used for a year", "Essential antibiotics on the formulary", "Diesel costs from running two generators on unmanaged load"],
          D,
          "Energy costs are a Tier 2 item: real savings, but they need restructuring work such as load management and sizing. Unused subscriptions are Tier 1, cut immediately, and ICU nurses and essential drugs are Tier 3, protected.",
        ),
        mc(
          "A hospital spends about N40m a month on drugs through many small suppliers, with no formulary. If consolidation, a formulary and group purchasing deliver the savings the module describes, what monthly saving is a reasonable target within 90 days?",
          ["About N8m to N12m a month", "About N6m to N16m a month", "About N2m to N4m a month", "About N20m to N28m a month"],
          A,
          "The module puts achievable savings at 20 to 30% of drug spend within 90 days, which is N8m to N12m on N40m. The 15 to 40% range describes how much hospitals overpay, not what can be recovered in 90 days.",
        ),
        mc(
          "A claims audit of the last 90 days finds N36m denied or pending: N20m denied for missing documentation and N16m pending for more than 60 days. What should the stabilisation team do first?",
          ["Write off the denied claims, since HMOs rarely reverse a denial, and put the team's effort into preventing future denials", "Raise tariffs to compensate for the revenue lost to denials", "Wait for HMOs to process the pending claims in their normal cycle", "Set up a claims team to fix and resubmit the documentation denials and chase HMOs on the old pending claims"],
          D,
          "Both groups are revenue already earned, and documentation denials are often recoverable by fixing and resubmitting. Writing them off gives away cash the hospital badly needs; prevention matters, but it does not recover the N36m.",
        ),
        mc(
          "During stabilisation all non-essential capital spending is suspended. The CSSD autoclave fails, and the theatre manager asks for N4m to repair it because surgery cannot go ahead without sterile instruments. What should happen?",
          ["Approve it as an exception: it protects essential, revenue-earning care, and the freeze on other capex stays", "Refuse it, because any exception to the freeze will be used to justify others and undermine the stabilisation", "Defer it to Phase 3, when deferred maintenance is addressed", "Ask surgeons to reuse instruments with chemical disinfection until cash improves"],
          A,
          "The freeze is on non-essential spend, and an autoclave that stops theatres is essential both clinically and financially. Refusing on principle would cut off one of the hospital's main revenue streams and put patients at risk.",
        ),
      ],
    },
    {
      moduleSlug: "cfa-turnaround-programme",
      questions: [
        mc(
          "At the Week 12 review: days of cash moved from 12 to 35, staff cost ratio from 74% to 66%, occupancy from 45% to 58%, claims denial rate from 22% to 21%, and supplier payment cycle from 140 to 150 days. What should happen?",
          ["Proceed to Rebuild, because three of five anchor metrics are trending the right way; the TMO acts on the other two", "Extend Restructure, because no anchor metric has yet reached its final Week 24 target and the board needs more certainty", "Extend Restructure, because the supplier payment cycle has worsened", "Move straight to Sustain, because cash has nearly tripled"],
          A,
          "The mid-point test is three or more anchor metrics trending in the right direction, and cash, staff cost ratio and occupancy all are. Requiring final targets at Week 12 applies the Week 24 test too early.",
        ),
        mc(
          "In Week 3 the CEO insists that every purchase above N200,000 must carry his signature, overriding the threshold the board delegated to the TMO. How should the engagement manager respond?",
          ["Accept it, since the CEO is accountable for spending", "Route urgent purchases around the CEO through the TMO, so the programme keeps moving while the disagreement settles down", "Ask the TMO to meet less often so fewer decisions need his signature", "Raise it with the board chair, because the TMO's delegated authority is what lets the turnaround decide fast"],
          D,
          "Delegated authority exists because slow decisions paralyse distressed hospitals, and the board granted it, so the board chair is the right route. Going around the CEO quietly breaks trust and governance at the same time.",
        ),
        mc(
          "At Week 24, four of the five anchor metrics have hit target; claims denial rate is at 13% against a target of under 10%. Has the programme met CFA's benchmark?",
          ["Yes: four of five is 80%, which meets the benchmark", "No: every anchor metric must hit target", "No: the benchmark also requires days of cash on hand above 90", "Yes: three of five is enough at Week 24"],
          A,
          "The benchmark is 80% of anchor metrics at target, which four of five meets. Three of five is the Week 12 trending test, not the Week 24 benchmark.",
        ),
        mc(
          "In Week 6 the owners want to launch a fertility service to grow revenue. Where does this belong in the 24-week programme?",
          ["In Stabilise, because new revenue is the fastest way to stop the cash bleeding and reassure lenders", "In Restructure, because it changes the operating model", "In Sustain, as part of the 12-month sustainability plan", "In Rebuild, Weeks 13 to 20, when growth initiatives launch; Restructure stays on fixing the core"],
          D,
          "Growth initiatives sit in Rebuild, after the operating model and revenue cycle are fixed. Launching a new service in Week 6 draws cash and management attention away from restructuring when the hospital can least afford it.",
        ),
        mc(
          "The board asks for a 25-page monthly turnaround pack. What does the programme provide instead?",
          ["A full monthly management accounts pack with commentary from each head of department", "A weekly one-page dashboard showing cash position, key milestones and a traffic-light summary of each workstream", "A quarterly report timed to the Week 12 and Week 24 reviews", "Access to the TMO's daily minutes"],
          B,
          "The board gets a weekly one-page dashboard so it can see cash and progress quickly enough to act. A monthly pack is too slow for a hospital whose position changes week to week.",
        ),
      ],
    },
  ],
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "turnaround-people-culture",
      name: "People and Culture in a Turnaround",
      description:
        "Lead staff through a turnaround: communicate under uncertainty, sequence salary arrears, reduce headcount lawfully and safely, keep the clinicians the hospital cannot lose, and change how the place works.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Staff read the cash before management says a word",
            body: p(
              "By the time a turnaround starts, staff already know something is wrong. Salaries have been late, suppliers have been turning up at the accounts office, and the generator has been rationed. What they do not know is how bad it is or what will happen to them, and in that gap the worst rumour wins.",
              "Silence is the most common mistake. Owners and managers often want to say nothing until the refinancing is agreed or the plan is final, fearing that honesty will trigger resignations. In practice the resignations come anyway, led by the people with the most options, and the silence makes those who stay assume the worst.",
              "Communicate early and on a fixed rhythm. A useful structure for every update is: what we know, what we do not yet know, what we are doing, and when you will next hear from us. Give a date for the next update and keep it, even if there is little new to say. Reliability of communication rebuilds trust faster than good news.",
              "Use one voice and several channels. The chief executive, or the turnaround lead with the chief executive beside them, should give the main message at an all-staff meeting, and heads of department should repeat it in their own units within a day, with the same facts and the same dates. Supervisors need a short brief on what to say when asked questions they cannot answer: 'I don't know yet, and here is when we will know' is better than a guess.",
              "Never promise what the 13-week cash forecast cannot fund. If the forecast shows September salaries can be paid in full on the 10th of October, say that, not 'soon'. A missed promise on pay does more damage than the original delay.",
              "Listen as well as tell. Short, structured sessions with ward managers, senior nurses and the visiting consultants will surface operational fixes and early warnings of who is about to leave. In a distressed hospital, the people closest to patients often know exactly where money is being lost and have been waiting for someone to ask.",
            ),
          },
          {
            title: "Salary arrears and the order of payment",
            body: p(
              "Salary arrears are the single biggest threat to a turnaround's people plan. Once staff stop believing they will be paid, they stop investing effort, take second jobs, and leave as soon as they can. The plan for clearing arrears is therefore part of the turnaround plan, built into the 13-week cash forecast with dates, not left to whatever cash is available.",
              "When there is not enough to pay everyone in full, the hospital is choosing who waits. Make that choice deliberately, explain it, and apply it consistently. The defensible principle in most hospitals is to protect those least able to absorb a delay. Junior staff, cleaners, porters and junior nurses typically live month to month; a late salary means rent unpaid and children sent home from school. Senior staff usually have more cushion.",
              "Take a hospital with one month's arrears of N48m and N30m available. Its 120 junior staff are owed N18m and its 40 senior staff N30m. Paying the junior staff in full and 40% of senior salaries, N12m, uses the N30m, with a dated plan for the senior balance. The managing director and directors should defer first and most visibly. Few things damage a turnaround faster than staff discovering that the executives were paid in full while the wards waited.",
              "Watch for keystone staff, covered later in this module. A small, explicit list of roles that must be paid on time to keep the hospital safe and open can sit alongside the junior-first principle, as long as the list is short, justified and known to the leadership team.",
              "Statutory deductions are not a source of cash. Pension contributions deducted from staff pay belong to the staff and must be remitted to their pension fund administrators; failure to remit is an offence under the Pension Reform Act 2014, with penalties that grow the longer it continues. The same logic applies to PAYE deducted for the tax authorities. A finance team that proposes using these deductions to fund salaries is proposing to solve a cash problem by creating a legal one, and the people at risk include the directors.",
            ),
          },
          {
            title: "Reducing headcount lawfully and safely",
            body: p(
              "Many distressed hospitals carry more staff than their activity can support, and a turnaround often needs fewer people. How the reduction is done decides whether the hospital comes out stronger or simply smaller and frightened.",
              "Exhaust the alternatives first, and size them. Overtime and locum spend can often be cut sharply once rosters match demand. Vacancies can be frozen, and natural attrition, which is high in Nigerian hospitals, will remove some posts within months. Staff can be redeployed from over-staffed units to those that need cover. Work out how much of the gap between today's staff cost ratio and the target these levers close; reduce headcount only for what remains.",
              "Size the reduction once, from the plan, and do it in one round. Repeated rounds of cuts are worse than one larger, well-planned round, because each round sends the best people looking for jobs and leaves the rest waiting for the next. Once the reduction is done, say so plainly.",
              "Follow the law and the contracts. The Labour Act's redundancy provision, section 20, requires an employer to inform the trade union or workers' representative of the reasons for and extent of the redundancy, to apply the principle of last in, first out within each category of workers, subject to factors of relative merit such as skill and ability, and to negotiate redundancy payments. The Act defines 'worker' narrowly and excludes many people in administrative, executive, technical or professional roles, whose terms come from their contracts and the hospital's handbook. Take employment-law advice before announcing anything, check every affected contract, and settle final entitlements promptly and in full.",
              "Protect safe staffing. Every proposed cut to clinical roles must be tested against the minimum staffing a unit needs to be safe, shift by shift. This is the same logic as Tier 3 in the three-tier cost framework: frontline clinical staffing is protected. A plan that leaves one nurse on a 28-bed ward at night saves money until the first serious incident.",
              "Treat people who leave with dignity: tell them privately, in person, with their entitlements in writing and a named person to answer questions. Those who stay watch closely.",
            ),
          },
          {
            title: "Keeping the people you cannot lose",
            body: p(
              "Every hospital has a small number of people whose departure would stop a service or a large share of revenue. In a turnaround, losing them can end the recovery, and in a market where nurses and doctors are recruited abroad every month, they will have offers.",
              "Identify them early and by name. Typical keystone roles include anaesthetists (without whom theatres stop), ICU and theatre nurses, the neonatal nursing lead, the laboratory scientist who keeps the analysers running, the billing or claims lead who knows each HMO's rules, and the visiting consultants who bring their patients. Ask a simple question for each candidate: if this person resigned tomorrow, what would stop, and how quickly could we replace them?",
              "Then act for each one. Pay them on time and in full; for a short list this is affordable and justified. Talk to them individually about the plan and their part in it, since keystone people are often the ones who see the problems most clearly. Where someone has a specific offer, find out what would keep them: sometimes pay, often schedule, equipment, a clear role or simply confidence that the hospital will survive. Retention terms such as a deferred bonus payable after a set period can help, but only where the cash forecast can fund them.",
              "Visiting consultants deserve special attention. Many private hospitals owe them professional fees, and a consultant who is not paid moves cases to another hospital, taking revenue with them. Agree a fee payment plan with each major consultant as early as with major suppliers.",
              "Be honest with yourself about the tension between protecting keystone staff and paying junior staff first. Both principles are defensible. The way to hold them together is to keep the keystone list short, explain the reason to the leadership team, and make sure everyone else can see that the executives are carrying the heaviest deferral.",
              "Keep a monthly watch on resignations, sickness absence and requests for references among keystone groups. A cluster in one unit is an early warning to act on, not a statistic to report.",
            ),
          },
          {
            title: "Changing how the place works",
            body: p(
              "A hospital rarely falls into distress through bad luck alone. Usually the culture allowed it: bad news travelled slowly, problems were hidden or blamed on others, decisions were deferred, and nobody felt they owned the numbers. A turnaround that fixes the finances but leaves that culture in place will be back in trouble within two or three years.",
              "Culture changes through what leaders do, repeatedly, not through statements of values. Three habits matter most in a turnaround.",
              "Make the numbers visible. Share the anchor metrics with heads of department every week and, in simple form, with staff. When ward managers can say what this week's occupancy and cash position are, they start to manage towards them.",
              "Reward early bad news. When a head of department raises a problem at the TMO before being asked, with a proposed fix, thank them in public and act on it. When someone hides a problem, deal with it firmly. Staff learn very quickly which of the two the leadership really values.",
              "Push decisions down. Distressed hospitals often have a managing director who approves every purchase and every leave request. That creates a bottleneck and teaches everyone else not to think. Delegate clear limits to heads of department, with a weekly review, and hold them to account for results.",
              "Some leaders will not make the change. A finance head who has concealed creditor figures from the board, or a department head who blocks every change, may need to go. Do it quickly, fairly and lawfully, explain the change to the team in neutral terms, and put interim cover in place the same day. A turnaround that keeps a leader everyone knows is failing tells staff that nothing has really changed.",
              "Look for early, visible wins that staff can feel: salaries paid on the promised date, a broken autoclave repaired, a ward's air conditioning fixed. Each one is evidence that this time the plan is real.",
              "Expect setbacks and say so. Staff trust a leadership that admits a missed target and explains the response more than one that only reports good news.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Arrears and the first all-staff meeting",
            instruction:
              "A 160-staff hospital in Ilorin owes two months of salaries: N36m to 110 junior staff and N54m to 50 senior staff, including N9m to the six-person executive team. The 13-week forecast shows N25m available for salaries in the next fortnight and N20m a fortnight after that from Week 5. Pension deductions of N7m have not been remitted. Design the payment sequence for the next eight weeks, including the pension position, identify up to six keystone roles you would protect and why, and write the five-minute script for the first all-staff meeting using what we know, what we do not know, what we are doing and when you will next hear from us.",
          },
          {
            title: "Practice: Sizing a headcount reduction",
            instruction:
              "A 100-bed hospital has monthly revenue of N95m and staff costs of N66m (69%); the turnaround target is 55%. Monthly locum and overtime spend is N7m, there are 14 unfilled posts budgeted at N4.2m, and annual staff turnover is about 18%. Calculate how much of the gap the alternatives to redundancy can close in six months, what headcount reduction would remain, and set out the steps, consultations and safe-staffing checks you would require before any notice is issued.",
          },
        ],
      },
      resources: { tools: ["Turnaround communication plan", "Arrears payment schedule", "Keystone staff register", "Redundancy checklist"] },
      questions: [
        mc(
          "In Week 1, staff have not been paid for September. The managing director wants to say nothing until refinancing is agreed in about three weeks. What should you advise?",
          ["Agree, because announcing a problem before the solution will cause resignations", "Brief staff now: what is known and not, the pay date the cash forecast supports, and the next update date", "Send a short memo saying salaries will be paid soon, which calms nerves without committing the hospital to a date it may miss", "Tell only heads of department and ask them to keep it confidential"],
          B,
          "Staff already know salaries are late, so silence only lets rumour fill the gap, and a dated update backed by the forecast rebuilds trust. A vague 'soon' feels safer but becomes a broken promise if it slips.",
        ),
        mc(
          "One month's salary arrears total N48m and N30m is available. The 120 junior staff are owed N18m and the 40 senior staff N30m. What payment approach is most defensible?",
          ["Pay everyone 62.5% of salary so the cut is shared equally", "Pay senior staff in full first, because they are hardest to replace", "Hold all payments until the full N48m is available, so that no group of staff is treated any differently from any other group", "Pay junior staff in full and senior staff 40%, with a dated plan for the balance and the executives deferring first"],
          D,
          "Junior staff are least able to absorb a delay, and N18m plus 40% of N30m uses exactly the N30m available, with executives visibly carrying the deferral. An equal percentage looks fair but falls hardest on those living month to month.",
        ),
        mc(
          "The finance manager proposes using N7m of pension contributions deducted from staff pay to fund next month's salaries, remitting them later. What is your response?",
          ["Refuse: the deductions are staff money, and failing to remit them is an offence under the Pension Reform Act 2014", "Agree for one month only, provided the board approves it in writing and the arrears are remitted with the next payroll", "Agree, provided staff are told and consent in writing", "Agree if the pension fund administrators are told in advance"],
          A,
          "Deducted contributions are staff money held for remittance, and using them creates legal exposure for the hospital and its directors. Board approval or staff consent does not change the legal duty to remit.",
        ),
        mc(
          "For workers covered by the Labour Act, what does section 20 require when a redundancy is planned?",
          ["One month's notice for each completed year of service, paid in cash, plus a fixed statutory severance sum for every affected worker", "Approval from the Federal Ministry of Labour before any notice is issued", "Notify the union or representative of reasons and extent, last in first out subject to merit, and negotiated redundancy pay", "Offering every affected worker a post elsewhere in the hospital first"],
          C,
          "Section 20 sets out notice to the union or representative, last in first out subject to merit, and negotiated redundancy pay. A fixed notice formula is a common assumption but is not what the section says; contracts and the handbook set notice terms.",
        ),
        mc(
          "A hospital's staff cost ratio is 72% against a target of 55%. Before planning redundancies, what should the turnaround team do?",
          ["Size what cutting overtime and locums, freezing vacancies, redeployment and attrition can close, then cut posts only for the rest", "Cut 17% of headcount evenly across every department, so that the burden is shared and no unit feels singled out by the turnaround team", "Wait for revenue growth in Rebuild to bring the ratio down without cuts", "Reduce all salaries by 17% instead of cutting posts"],
          A,
          "Alternatives often close a large part of the gap with less damage, and only the remainder should drive redundancies. An across-the-board cut looks even-handed but ignores where the excess actually sits and can breach safe staffing.",
        ),
        mc(
          "Two of the hospital's three anaesthetists have job offers in the UK. Theatre generates about 40% of revenue. What should the turnaround lead prioritise?",
          ["Recruit replacements now, since the anaesthetists will probably leave anyway", "Treat them as no different from other senior staff, so that the payment sequence stays consistent and nobody can claim favouritism", "Treat anaesthesia as keystone: pay them on time, involve them in the theatre plan, and ask each what would keep them", "Reduce the theatre schedule so the hospital is less dependent on them"],
          C,
          "Without anaesthetists theatres stop and 40% of revenue goes, so they belong on the short keystone list. Replacing them in this market is slow and uncertain, so giving up on retention before trying is costly.",
        ),
        mc(
          "The board wants to cut 10% of staff now and 'see later whether more is needed'. What should you advise?",
          ["Agree, because a smaller first cut is easier for staff to accept", "Cut 5% now and another 5% in three months, to spread the impact on morale and on the hospital's clinical services", "Avoid any cuts until the Week 12 review", "Size the reduction once from the plan, carry it out in one round, and then tell staff clearly it is done"],
          D,
          "Repeated rounds drive out the best people and leave the rest waiting for the next cut. Phasing feels gentler but multiplies the uncertainty.",
        ),
        mc(
          "To cut costs, a proposal reduces night nurses on a 28-bed medical ward from three to one. How should the turnaround team respond?",
          ["Accept it for a trial month and review incident reports", "Reject it: frontline clinical staffing is protected, and this breaches safe staffing", "Accept it if the ward manager agrees", "Accept it, since night shifts are quieter, patients are mostly asleep and a doctor is on call for emergencies"],
          B,
          "Safe staffing is tested shift by shift and frontline clinical staff are Tier 3, protected. A trial month measured by incidents means waiting for harm to prove the point.",
        ),
        ms(
          "Which of these suggest the hospital's culture is genuinely changing? Select all that apply.",
          ["Heads of department raise worsening numbers at the TMO before being asked", "Incident reports have fallen because staff have stopped logging them", "Ward managers can say this week's occupancy and cash position", "Problems are escalated with a proposed fix attached", "The managing director now personally approves every purchase"],
          [A, C, D],
          "Early bad news, visible numbers and escalation with fixes are the habits a turnaround is trying to build. Fewer reports from under-reporting is concealment, and central approval of every purchase is the bottleneck the turnaround should remove.",
        ),
        mc(
          "During the diagnostic you find that the head of finance kept the true creditor position from the board for a year. What should the turnaround do?",
          ["Replace the head of finance quickly, fairly and lawfully, explain the change to the team in neutral terms, and put interim cover in place the same day", "Keep the head of finance, because they know the systems and changing now would add risk", "Move the head of finance to another role and say nothing about why", "Ask the head of finance to report to the TMO daily until trust is restored"],
          A,
          "Keeping a leader who concealed critical figures tells staff nothing has changed, and a fair, quick, well-covered replacement limits the disruption. Knowledge of the systems is real but can be covered by an interim and a proper handover.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "turnaround-owners-lenders",
      name: "Owners, Lenders and Creditors in a Turnaround",
      description:
        "Map who is owed what, negotiate standstills and payment plans with banks, lessors and suppliers, deal with owners' money and conflicts, and know when the formal routes under CAMA 2020 come into play.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Map who is owed what, and what each can do",
            body: p(
              "A distressed hospital usually owes money to many parties, and each has different rights and a different ability to hurt the business. The starting point is a creditor map: a single table that lists every significant creditor and four facts about each.",
              "- Amount owed and how long overdue\n- Security: whether the debt is secured on property, equipment or receivables, or guaranteed by an owner\n- Operational impact: what happens to patient services if this creditor stops supplying or enforces\n- Relationship: who at the hospital deals with them, and their stance so far",
              "The usual groups in a Nigerian private hospital are banks (term loans often secured on the building, overdrafts, sometimes invoice discounting against HMO receivables); equipment lessors and asset financiers, who can repossess a CT scanner or an analyser; suppliers of drugs, consumables, oxygen, diesel and laboratory reagents, who are mostly unsecured but can stop supplying; landlords; staff, for salary arrears and professional fees owed to visiting consultants; and government, for unremitted PAYE, VAT where it applies, and pension contributions.",
              "Rank creditors by operational impact, not by size. A bank owed N400m may be patient and constrained by its own processes, while an oxygen supplier owed N18m can stop deliveries in a week and close the ICU. The conversations with critical suppliers often need to happen first, even though the bank is the larger exposure.",
              "Check what the hospital has actually signed. Loan agreements carry covenants, such as minimum debt service cover or maximum leverage, and events of default. Leases set out repossession rights. Owners may have given personal guarantees that make them very sensitive to what the bank does. Read the documents rather than relying on management's summary; it is common to find that a covenant has already been breached and the bank simply has not acted yet.",
              "The creditor map, together with the 13-week cash forecast, becomes the basis of every negotiation that follows. It shows what the hospital can offer each party, in what order, and what it cannot.",
            ),
          },
          {
            title: "Talking to lenders: early, with one set of numbers",
            body: p(
              "Banks deal with distressed borrowers all the time. What they react badly to is surprise. A borrower who comes early with clear numbers and a credible plan is treated very differently from one whose problem the bank discovers from a missed payment.",
              "Go to the bank before a breach, not after. If the forecast shows a covenant will be breached next quarter, meet the relationship manager now. Bring the 13-week cash forecast, the turnaround plan with its milestones, and a specific request. Ask for something the bank can say yes to inside its own credit process.",
              "The most common request is a standstill: the lenders agree not to demand repayment or enforce their security for a fixed period, often three to six months, while the hospital stabilises and prepares a restructuring proposal. A standstill may include a waiver of the covenant breach, a move to interest-only payments, or deferral of principal. In return the hospital gives undertakings: regular information, no new borrowing or asset sales without consent, and progress against agreed milestones.",
              "The information undertaking matters. Lenders under a standstill typically expect an updated 13-week cash forecast with actuals against forecast every week or two, monthly management accounts, and a report on turnaround milestones. Deliver it on time and in the agreed form. A missed report signals loss of control faster than a bad number.",
              "Use one set of numbers with every creditor. Banks, lessors and major suppliers often talk to each other, and a hospital that gives different pictures to different parties loses all of them when the discrepancy surfaces.",
              "Treat creditors of the same kind consistently. Paying one supplier in full because the managing director knows them personally, while others receive a fraction, breaks the promise of fair treatment that makes a standstill possible. If the hospital later goes into a formal insolvency process, payments that favoured one creditor over others shortly beforehand can be challenged and reversed. Beyond the legal risk, a preference discovered by other creditors usually ends their willingness to wait.",
            ),
          },
          {
            title: "Suppliers and critical vendors",
            body: p(
              "Unsecured suppliers have little legal power individually, but collectively they decide whether the hospital can keep operating. If the drug wholesaler, the oxygen supplier and the reagent supplier all move to cash on delivery at once, the hospital needs a large amount of cash immediately, exactly when it has least.",
              "Separate critical vendors from the rest. Critical vendors supply items the hospital cannot do without and cannot quickly replace: medical oxygen, key drugs and IV fluids, laboratory reagents locked to an analyser, diesel, blood products, and sometimes the hospital information system's support. For each, agree a written payment plan early.",
              "The standard structure has two parts. New deliveries are paid on short, agreed terms that the hospital can reliably meet, so the supplier stops adding to its exposure. The old debt is paid in fixed instalments over an agreed period. Take a drug wholesaler owed N60m, 150 days overdue, which supplies about N15m a month. If the cash forecast can fund new supplies on 30-day terms and an extra N5m a month, the plan is current deliveries paid within 30 days plus N5m a month against the arrears, clearing them in 12 months. A supplier usually accepts that, because it keeps a customer and gets its money back, as long as the first instalments arrive on the dates promised.",
              "For non-critical suppliers, the approach can be firmer: a standard letter setting out the hospital's position and a common payment proposal, applied consistently.",
              "Consolidation helps. A hospital buying from 40 suppliers has 40 creditors to manage; one that has moved to a short list of reliable suppliers, as part of the procurement work in financial stabilisation, has fewer conversations and more volume to offer each.",
              "Run regular supplier meetings for the largest critical vendors during the first months, led by someone senior. Suppliers who hear directly how the turnaround is going, and see payments arrive as promised, become supporters rather than threats.",
            ),
          },
          {
            title: "Owners: fresh money, related parties and control",
            body: p(
              "Owners are both a source of help and a source of problems in a turnaround. In Nigerian private healthcare many hospitals are owned by a founder-doctor or a family, the owners often have personal guarantees on the bank debt, and the line between the hospital's money and the owners' money is not always clear.",
              "Start with related-party arrangements, because they are often the quickest source of relief. Check whether the hospital pays rent to an owner's company, buys from suppliers the owners control, pays owners' family members on the payroll, or carries owners' personal costs. Compare each with a market rate. If the hospital pays N10m a month to rent a building from the owner's company when the market rate is about N6m, the excess is N48m a year. Asking the owners to bring the rent to market, or to treat the excess as a contribution to the hospital, is a fair first request before anyone asks outsiders for money.",
              "Fresh money from owners needs the right form. An owner who offers N100m as a loan repayable in six months has moved the crisis six months down the road and added a creditor who will expect to be paid first. Better forms are new equity, or a loan that is subordinated, meaning it ranks behind the bank and suppliers and is not repaid until the hospital meets agreed milestones. Banks and suppliers will be more willing to wait if they can see the owners have put money at risk on the same side as them.",
              "Where owners cannot fund the gap, the options are new investors, the sale of non-core assets, or a sale and leaseback of property. Each changes control or cost: a new investor will want board seats and a share of the upside, and a leaseback turns a one-off cash injection into a permanent rent. Set the choices out plainly with their consequences.",
              "Disputes between owners, such as two founding families or siblings who disagree, can stall a turnaround more surely than any lender. The plan must have a clear decision-maker, normally the board, with the authority it has delegated to the TMO respected by all owners.",
            ),
          },
          {
            title: "When informal talks fail: formal routes under CAMA 2020",
            body: p(
              "Most hospital turnarounds are achieved by agreement: standstills, payment plans and fresh money negotiated outside any court. Sometimes agreement fails, a secured lender moves to enforce, or the hospital is simply insolvent. The consultant then needs to know the formal routes well enough to recognise the moment and bring in the right advisers. Formal insolvency advice must come from lawyers and licensed insolvency practitioners.",
              "The Companies and Allied Matters Act 2020 added two business rescue procedures to Nigerian law alongside the older routes of receivership and winding up.",
              "- A company voluntary arrangement (CVA) lets a company propose a binding compromise to its creditors, such as paying a proportion of debts over time, supervised by an insolvency practitioner. Once approved by the required majority of creditors, it binds them.\n- Administration places the company under an administrator, an insolvency practitioner whose purpose is to rescue the company as a going concern where possible, or to achieve a better result for creditors than winding up. A moratorium protects the company from most creditor action while the administrator works.",
              "Receivership, where a secured lender appoints a receiver to realise its security, protects that lender's interest rather than the business as a whole. For a hospital, receivership of the building can be the end of the service, so the threat of it is often the point at which a rescue procedure should be considered.",
              "Directors of a company in serious financial difficulty need to take care. Continuing to take on credit with no reasonable prospect of paying, or moving assets out of reach of creditors, can create personal liability. The board should take legal advice early, minute its decisions, and be able to show it acted in the interests of creditors as a whole once insolvency was likely.",
              "The consultant's role in this phase is to keep the numbers reliable, support management in dealing with creditors and the insolvency practitioner, and protect patient safety during any transition. A hospital is not an ordinary business to close. Patients on wards, in the neonatal unit and on dialysis need a plan whatever happens to the company.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Creditor map and standstill proposal",
            instruction:
              "A 120-bed hospital in Lagos owes: bank term loan N450m secured on the building (covenant breached last quarter, not yet acted on), overdraft N80m, CT scanner lease N60m (two months in arrears), drug wholesaler N110m, oxygen supplier N25m, reagent supplier N18m, diesel supplier N14m, visiting consultants' fees N22m, unremitted PAYE and pension N38m. Days of cash on hand are 9. Build the creditor map, rank creditors by operational impact, and draft a one-page standstill request to the bank stating the period, the payment terms you are asking for, the information you will provide and how often.",
          },
          {
            title: "Practice: The owners' contribution",
            instruction:
              "The same hospital pays N12m a month rent to a company owned by the founder's family (market rate about N7m), employs three family members in roles costing N4.5m a month with unclear duties, and the founder has offered N150m as a 9-month loan. Set out the related-party adjustments you would propose, the form you would recommend for the founder's money and why, and the governance conditions you would attach, in a note to the board chair.",
          },
        ],
      },
      resources: { tools: ["Creditor map template", "Standstill term sheet checklist", "Critical vendor payment plan", "Related-party review"] },
      questions: [
        mc(
          "An oxygen supplier owed N18m says it will stop deliveries in seven days. The bank, owed N400m, expects a covenant breach next quarter. A furniture supplier is owed N5m. Which conversation comes first?",
          ["The bank, because it is owed by far the most and could call in the whole loan if it hears of the problem elsewhere", "The furniture supplier, because it is the easiest to settle quickly", "The oxygen supplier, since losing oxygen closes the ICU and theatres within days; brief the bank in parallel", "None until the full creditor map and restructuring plan are finished"],
          C,
          "Creditors are ranked by operational impact, and oxygen is a critical supply with a seven-day deadline. The bank's exposure is larger but its action is slower; size alone is the tempting but wrong ranking.",
        ),
        mc(
          "In August the cash forecast shows the hospital will breach its debt service cover covenant at the end of the fourth quarter. When should it approach the bank?",
          ["Now, with the forecast, the plan and a specific request such as a covenant waiver or standstill", "After the breach, when the bank will be obliged to negotiate", "Only if the bank raises it at the annual review", "Once the turnaround has delivered results to show, so the hospital negotiates from a position of strength"],
          A,
          "Lenders react far better to early warning with a plan than to surprise. Waiting for results feels stronger but means the bank discovers the breach first, which is the worst position to negotiate from.",
        ),
        mc(
          "What does a standstill agreement with lenders typically provide?",
          ["A write-off of part of the debt in exchange for equity", "A new loan to cover the hospital's working capital gap", "A court order protecting the hospital from action by all of its creditors while it prepares a restructuring plan", "A fixed period in which lenders do not demand repayment or enforce, in return for regular information"],
          D,
          "A standstill buys time by agreement, in exchange for information and milestones. Court-backed protection from all creditors is what a formal procedure such as administration provides, not a private standstill.",
        ),
        mc(
          "Under a creditor payment plan, most suppliers are receiving 20% of arrears. The managing director wants to pay in full a supplier owed N12m who is his cousin. What should you advise?",
          ["Agree, since the amount is small relative to total debts", "Advise against: it breaks the equal treatment others were promised and could be challenged as a preference later", "Agree, as long as the payment is properly recorded in the ledger and disclosed to the auditors at year end", "Agree, if the cousin's company supplies an item the hospital cannot do without and could not quickly replace"],
          B,
          "Consistent treatment is what keeps creditors in the standstill, and preferences can be reversed in a formal insolvency. Recording it properly makes it visible, which does not make it fair.",
        ),
        mc(
          "A drug wholesaler is owed N60m, 150 days overdue, and supplies about N15m a month. The forecast can fund new supplies on 30-day terms plus an extra N5m a month. What plan should the hospital offer?",
          ["Pay the N60m arrears first, then resume normal terms on new supplies", "Pay new deliveries within 30 days and N5m a month against the old N60m over 12 months, agreed in writing", "Ask the wholesaler to write off half the arrears in return for prompt payment on all new orders from now on", "Switch to a new wholesaler and pay the old one when cash allows"],
          B,
          "Paying current supplies on time stops the exposure growing, and fixed instalments clear the arrears on a plan the cash forecast can fund. Switching suppliers simply moves the problem and leaves a large unpaid creditor with every reason to act.",
        ),
        mc(
          "The hospital pays N10m a month to rent its building from a company owned by the founder's family. The market rate is about N6m. The founder says the family cannot put in more money. What should you propose first?",
          ["Ask the bank for a larger overdraft to cover the rent", "Accept the rent as a fixed cost under the lease and look for the savings elsewhere in the hospital", "Move the hospital to cheaper premises", "Ask the family to cut the rent to market, or count the N48m annual excess as their contribution"],
          D,
          "The rent above market is a related-party transfer worth N48m a year, and adjusting it is a fair first contribution. Moving premises would be far more disruptive, and more debt deepens the problem the turnaround is solving.",
        ),
        mc(
          "The founder offers N100m as a loan repayable in six months. What form should you recommend instead?",
          ["New equity, or a subordinated loan ranking behind the bank and suppliers, repaid only after agreed milestones", "Accept the six-month loan, since any money helps now", "A loan repayable in three months, to limit the founder's risk", "A loan secured on the hospital's HMO receivables, so the founder's money is protected and ranks ahead of the other creditors"],
          A,
          "A short loan that will expect early repayment just moves the crisis six months on. Securing it on receivables would put the founder ahead of the lenders whose patience the turnaround depends on.",
        ),
        mc(
          "A CT scanner lease is two months in arrears and the lessor threatens repossession. The scanner contributes about N9m a month after direct costs; the lease costs N3m a month. What should the hospital do?",
          ["Let the scanner go, since the lease is one of the hospital's largest monthly payments and cash must be preserved", "Stop all lease payments until the bank restructuring is complete", "Bring the lease current or agree a short catch-up, since the scanner earns three times its lease cost", "Offer the lessor a share of scan revenue instead of the lease payments"],
          C,
          "The scanner earns far more than its lease, so protecting it protects cash flow. Stopping payments invites repossession, which loses the N9m contribution for a N3m saving.",
        ),
        ms(
          "Under a standstill, which of these would lenders usually expect to receive? Select all that apply.",
          ["An updated 13-week cash forecast with actuals against forecast every week or two", "Monthly management accounts", "Copies of every staff member's personnel file", "Progress against the agreed turnaround milestones", "The owners' personal bank statements"],
          [A, B, D],
          "Cash forecast, management accounts and milestone reports let lenders see the hospital is under control. Staff files are irrelevant and private, and owners' personal finances come into play only through guarantees, not standstill reporting.",
        ),
        mc(
          "Informal talks have failed and the bank has signalled it will appoint a receiver over the hospital building. What should the consultant advise the board?",
          ["Move cash and equipment into a new company to keep them away from the bank", "Ignore the signal, since banks rarely enforce against hospitals", "Advise the board directly on which CAMA 2020 procedure to use, since the consultant knows the hospital's figures better than any outside lawyer", "Take legal and insolvency advice now on CAMA 2020 rescue routes such as administration or a CVA, and plan for patients"],
          D,
          "CAMA 2020's rescue procedures may preserve the hospital as a going concern, but the advice must come from lawyers and insolvency practitioners, not the consultant. Moving assets away from creditors can create personal liability for directors.",
        ),
      ],
    },
  ],
};

export default expansion;
