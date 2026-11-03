import type { Option, Question, TrackExpansion } from "./types";

/** Paragraphs joined by a blank line, as the module page renders them. */
const p = (...paras: string[]) => paras.join("\n\n");

const IDS = ["a", "b", "c", "d", "e"] as const;

/** One question. `correct` is the letter(s) of the right option(s); two or more makes it MULTI_SELECT. */
function q(question: string, correct: string, options: string[], explanation: string): Question {
  const right = correct.split("");
  const opts: Option[] = options.map((text, i) => ({ id: IDS[i], text, isCorrect: right.includes(IDS[i]) }));
  return { type: right.length > 1 ? "MULTI_SELECT" : "MULTIPLE_CHOICE", question, options: opts, explanation };
}

const expansion: TrackExpansion = {
  slug: "core-consulting-skills",

  topUp: [
    {
      moduleSlug: "structured-problem-solving",
      questions: [
        q(
          "Kestrel Specialist Hospital, a 150-bed hospital in Abuja, has seen revenue fall 22% over 18 months while outpatient visits and admissions have stayed flat. Which branch of the issue tree should you test first?",
          "c",
          [
            "Volume: new competitors drawing patients away from the hospital",
            "Cost: rising personnel and consumables spend over the period",
            "Yield: tariffs, case mix and how much of what is billed is collected",
            "Marketing: falling awareness of the hospital in its catchment",
          ],
          "Revenue is volume times yield, and volume is flat, so the fall must sit in yield: price, case mix or collections. Competitors and marketing are volume explanations the data has already ruled out, and costs do not explain a revenue fall at all."
        ),
        q(
          "A colleague splits a hospital's lost revenue into three buckets: 'HMO claim denials', 'unbilled services' and 'NHIA patients'. What is wrong with this structure?",
          "a",
          [
            "The buckets overlap, because an NHIA patient's claim can also be denied or go unbilled",
            "It has only three buckets, and a MECE tree needs at least four at the first level",
            "It mixes clinical and financial causes, which belong in separate trees",
            "Nothing is wrong, because each of the three buckets is a recognised and well-documented source of revenue leakage",
          ],
          "'NHIA patients' is a payor group while the other two are failure types, so one lost naira can sit in two buckets and be counted twice. MECE says nothing about the number of buckets; the test is no overlap and no gap."
        ),
        q(
          "Which statement is a usable hypothesis to put at the leaf of an issue tree for a hospital whose operating margin is falling?",
          "d",
          [
            "Staffing is probably part of the problem and should be looked at closely across every department",
            "The hospital needs a full review of all its costs before anything else",
            "Margins are falling across the private sector, so this hospital is typical",
            "Locum spend has passed 40% of the personnel budget since a consultant left",
          ],
          "A hypothesis is specific enough to be proved or disproved with data you can name, here payroll and locum invoices. 'Staffing is part of the problem' is the tempting answer because it is probably true, but no piece of data could show it to be false."
        ),
        q(
          "You decompose a hospital's operating costs into personnel, drugs and consumables, and utilities. Which test does this decomposition fail?",
          "b",
          [
            "Mutually exclusive, because drugs and consumables overlap with utilities",
            "Collectively exhaustive: rent, maintenance and depreciation have no home",
            "Neither, because these three are the largest cost lines in most hospitals",
            "Both tests, because personnel costs also include the drugs and consumables that nurses administer on the wards",
          ],
          "The three buckets do not overlap, but together they leave out real cost lines, so the tree has a gap. Picking the three largest lines is the common mistake: it feels complete because it covers most of the money, yet the driver may sit in a line you left out."
        ),
        q(
          "In the first week of a margin engagement, the payroll data shows locum spend has been flat at 12% of personnel cost for two years, disproving your lead hypothesis. What should you do?",
          "b",
          [
            "Ask for another year of payroll data in case the earlier period tells a different story",
            "Record the hypothesis as disproved, tell your manager, and move effort to the next branch",
            "Keep the hypothesis in the storyline, since locums are a known problem in Nigerian hospitals",
            "Restart the issue tree from the top, because the structure has been shown to be wrong",
          ],
          "Disproving a hypothesis quickly is the method working: you have closed a branch cheaply and can spend the time on the next one. Hunting for more data to rescue a disproved hypothesis is the most common waste of a first week, and one dead leaf does not invalidate the tree."
        ),
      ],
    },
    {
      moduleSlug: "client-communication",
      questions: [
        q(
          "The CFO of a 200-bed hospital asked what you found on revenue leakage. Which opening line of your email follows the Pyramid Principle?",
          "c",
          [
            "Over the last three weeks we reviewed 14 months of billing data, interviewed all six cashiers and walked the patient journey.",
            "Thank you for your patience while we completed the first phase of the leakage review.",
            "The hospital is losing about N38m a year to unbilled services, and three changes would recover most of it.",
            "There are several areas of concern, which we have grouped for ease of reading below.",
          ],
          "Pyramid communication opens with the answer: what is happening, how big it is and what to do. The first option is the tempting one because it shows effort, but it is the bottom-up order that makes a busy CFO read to the end to find the point."
        ),
        q(
          "The medical director of a 180-bed hospital can give you 15 minutes between ward rounds to discuss your discharge findings. What should you bring?",
          "a",
          [
            "One message, three supporting points and one decision you need from him, with detail in an appendix",
            "The full 30-slide findings deck, so that he can see the analysis and the evidence behind every number you quote",
            "A list of every issue found, ranked by how many staff mentioned it in interviews",
            "Nothing written, so the conversation stays informal and he does not feel audited",
          ],
          "The 1-3-1 format fits a 15-minute slot: one key message, three supporting points, one clear ask. The full deck is the tempting choice because it looks thorough, but he will not reach the point in 15 minutes and the decision you need will not be taken."
        ),
        q(
          "A slide shows HMO claim denials by reason for the last six months. Which is the best title for it?",
          "d",
          [
            "HMO Claim Denials by Reason, January to June",
            "Analysis of denied claims across the hospital's main HMOs",
            "Claim denials remain a significant concern for the hospital",
            "Missing authorisation codes cause 58% of denials, so front-desk checks would recover most of the loss",
          ],
          "An action title states the finding and its consequence in a full sentence, so the deck reads as a story from titles alone. 'Claim denials remain a significant concern' is a sentence but carries no finding, which is why it is the most tempting wrong answer."
        ),
        q(
          "An executive summary reads: 'The hospital has grown outpatient volumes 15% a year since 2022. Since March, two HMOs have cut tariffs by 20% and delayed payments to 120 days. We recommend renegotiating both contracts and reducing HMO exposure below 50% of revenue.' Which sentence is the complication?",
          "b",
          [
            "The first sentence, about outpatient growth since 2022",
            "The second sentence, about tariff cuts and 120-day payments",
            "The third sentence, about renegotiation and HMO exposure",
            "There is no complication, because the summary is already resolved",
          ],
          "The situation is the agreed context (growth), the complication is the change that creates tension (tariff cuts and slow payment) and the resolution is the recommendation. Readers often mistake the situation for the complication because it contains numbers."
        ),
        q(
          "Your analysis shows that the chief executive's target of 90% bed occupancy is unrealistic: the hospital has never exceeded 64% and discharge delays cap it near 75%. Which way of saying this keeps the message clear and respects the relationship?",
          "a",
          [
            "'The discharge data suggests 75% is achievable this year, and reaching 90% would first need the discharge process fixed.'",
            "'Your 90% target is wrong, and the data proves it.'",
            "'There may be some room to revisit the hospital's occupancy targets at some point in the future, once more data is available.'",
            "'We would rather not comment on targets, which are a matter for management.'",
          ],
          "The first option is diplomatic in framing but still states the number and the reason, so the chief executive knows exactly what the data says. The third option is the tempting mistake: it is so softened that the message disappears, which is a failure of clarity rather than an act of respect."
        ),
      ],
    },
    {
      moduleSlug: "data-analysis-synthesis",
      questions: [
        q(
          "Your hypothesis is that late starts cut theatre throughput, but the hospital has no digital theatre schedule and the paper register records only the operation, not the times. What should you do?",
          "d",
          [
            "Drop the hypothesis, because there is no data to test it",
            "Ask the hospital to buy a theatre scheduling module before the analysis",
            "Use the anaesthetists' and theatre nurses' recollection of typical start times, gathered in the interviews you have booked",
            "Design a simple tally sheet and ask theatre nurses to record start and finish times for two weeks",
          ],
          "When the data you need does not exist, collect a disciplined proxy for a short period; two weeks of recorded times will test the hypothesis. Interview recollection is tempting because it is quick, but people consistently misremember start times and it cannot be checked."
        ),
        q(
          "The chief medical officer asks whether some consultants' patients stay much longer than others for the same procedures. Which technique answers that question directly?",
          "c",
          [
            "Variance analysis against the budgeted length of stay",
            "Trend analysis of the hospital's average length of stay month by month over the last 24 months",
            "Cohort analysis comparing length of stay by consultant for matched procedures",
            "Pareto analysis of the procedures with the most bed-days",
          ],
          "Comparing groups to find outliers is cohort analysis, and matching on procedure stops case mix from distorting the comparison. Trend analysis is tempting because length of stay is a time series, but a hospital-wide trend hides the differences between consultants."
        ),
        q(
          "In six months a hospital had 412 HMO claims denied. Three reasons (missing authorisation code, expired enrolee, unlisted service) account for 71% of them; nine other reasons share the rest. What should the next step be?",
          "a",
          [
            "Trace how the three main reasons arise in the process and target those first",
            "Design fixes for all twelve reasons so nothing is left out of the plan",
            "Collect another six months of data before drawing any conclusion",
            "Report to the board that denials are spread across twelve different causes with no single clear driver",
          ],
          "This is the Pareto pattern: a few causes drive most of the impact, so effort on those three recovers most of the money. Fixing all twelve feels thorough but spreads a small team thin and delays the large gains."
        ),
        q(
          "Plotting initiatives on impact against ease of implementation, which should a hospital normally start in the first month?",
          "b",
          [
            "Low impact, easy to implement, because they build momentum at no risk",
            "High impact, easy to implement, while planning the high impact, hard ones",
            "High impact, hard to implement, because those are the initiatives that matter most to the chief executive",
            "Low impact, hard to implement, so the difficult work is out of the way",
          ],
          "High-impact, easy initiatives deliver results early and buy credibility for the harder work, which still needs planning from the start. Starting with the hard, high-impact items is tempting because they matter most, but they rarely show results in month one and the engagement loses momentum."
        ),
        q(
          "Which statement is analysis rather than observation?",
          "c",
          [
            "Outpatient revenue fell 18% between January and June.",
            "Outpatient revenue is below budget and below the same period last year.",
            "Outpatient revenue fell 18% after a competitor clinic opened 2km away in March, so the hospital should target the patients it lost.",
            "Outpatient revenue has been falling, which is a concern for the board.",
          ],
          "Analysis links the data to a cause and a recommended action. The second option is tempting because it compares against two benchmarks, but it still only describes what happened without explaining why or what to do."
        ),
      ],
    },
  ],

  modules: [
    {
      slug: "workplanning-workstreams",
      name: "Workplans and Running a Workstream",
      description:
        "Scope a workstream, turn your issue tree into a dated workplan, run a weekly cadence and keep your engagement manager informed without being chased.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Scope the workstream before you plan it",
            body: p(
              `A workstream is a part of an engagement with one owner, one question and a defined output. Before you plan any activity, write its scope on half a page, so that your engagement manager, your client counterpart and you would all describe it the same way.`,
              `The scope statement has five parts:
- The question the workstream answers, in one sentence. For example: "Can Ridgeway Specialist Hospital cut on-the-day theatre cancellations from 18% to under 8% within six months, and what would it take?"
- The deliverables, named and dated: a baseline pack in week 3, an options paper in week 6, an implementation plan in week 8.
- What is out of scope, written down. If anaesthetist staffing belongs to the workforce workstream, say so here.
- The client inputs you depend on: the theatre register, the booking diary, two hours a week of the theatre manager's time.
- The definition of done: who signs each deliverable off, and against what.`,
              `The out-of-scope line and the client-inputs line do the most work. Most workstreams that slip do so for one of two reasons. A client dependency was never written down, so nobody owned chasing it. Or adjacent work drifted in without anybody deciding to take it on. In a Nigerian private hospital the theatre register may be a paper book kept by one nurse on the morning shift. If your baseline depends on it, the scope should name her role and the date you need the book photographed.`,
              `Test the scope by reading it to someone outside the engagement. If they cannot tell you what you will hand over in week 6, it is not yet a scope. Agree it with your engagement manager by the third day. A workstream whose scope is still being argued in week two loses the time that was meant for analysis, and the client starts to judge the team on what it has not yet produced.`
            ),
          },
          {
            title: "From issue tree to workplan",
            body: p(
              `The workplan is your issue tree turned into dated work. Each leaf hypothesis becomes one or more analyses, and each analysis needs data, an owner, a start and finish date, and the deliverable it feeds.`,
              `A usable workplan row reads: hypothesis, analysis, data source, owner, start, finish, deliverable fed, status. Keep it in one shared sheet that the engagement manager can open at any time. Twenty to forty rows is normal for an eight-week workstream. If you have a hundred and twenty, you have planned activities rather than analyses, and nobody will keep the plan up to date.`,
              `Sequence by dependency, not by what is interesting. Data requests go out in the first three days because they take longest to return. A billing export can take a fortnight when the system vendor has to run it, and HMO remittance advice often sits in one accounts officer's inbox. Put the slow items on the critical path, the chain of tasks where any delay moves the deadline, and work on analyses that use data you already hold while you wait.`,
              `Build buffer where you know you will need it. Allow a week before any deliverable that depends on client data, and assume one in three booked interviews will move. Keep the buffer as a visible line before the deadline rather than padding every task by a fifth, so you can see when you are spending it.`,
              `Then plan the deliverable backwards. If the options paper goes to the steering committee on 14 March, the draft reaches your engagement manager by 7 March, the analyses feeding it close by 4 March, and the storyline (a ghost deck of action titles only) is reviewed by 28 February. First-time workstream leads usually plan forwards from today and discover the review step a day before the meeting.`
            ),
          },
          {
            title: "The weekly cadence",
            body: p(
              `A workstream runs on a weekly rhythm that everybody can predict. The rhythm matters more than the format: your engagement manager should never need to ask where you are.`,
              `A cadence that works on most C4A engagements:
- Monday: update the workplan, set the week's three priorities, and send your client counterpart the list of what you need from them this week.
- Midweek: twenty minutes with your engagement manager on emerging findings and anything stuck.
- Friday: a short written status note, sent before the end of the working day.`,
              `The Friday note keeps a fixed shape: overall status as green, amber or red with one line of reason; what finished this week; what is planned next week; risks and issues, each with an owner; and any decision or help you need. Amber means a deadline is at risk but you have a recovery plan. Red means you cannot recover without someone else acting. Reporting amber as red to look careful, or red as amber to look capable, destroys the signal for everyone who reads it.`,
              `Meet your client counterpart on a fixed day as well, and use the meeting to show emerging numbers early. A theatre manager who sees the cancellation analysis in week 2 will correct your misunderstanding of the booking rules. One who first sees it at the steering committee will defend the department instead of helping you.`,
              `Keep a short decisions log: what was decided, by whom, on what date. Decisions taken in a corridor with a busy medical director are forgotten within a fortnight unless someone writes them down and sends them back for confirmation the same day. The log also protects the team when a decision is later disputed, because the confirmation email exists.`
            ),
          },
          {
            title: "Managing your own manager",
            body: p(
              `Your engagement manager answers for the whole engagement and has less time than you think. Managing upwards means making their job easier, not asking permission for every step.`,
              `Agree the working terms at the start: how often they want to see work, in what form, and which decisions you can take alone. Most managers will leave your analytical approach to you and want to hear before you contact a board member, change a deliverable date or share numbers with the client for the first time.`,
              `Bring problems early and with options. "The billing export will be ten days late. I can build the baseline from six months of paper invoices, which costs me three days, or move the baseline to week 4 and compress the options work. I recommend the first." That takes your manager thirty seconds to decide. "The data is late" takes twenty minutes and a phone call, and leaves the decision with the person who knows least about the detail.`,
              `Show work early and rough. A ghost deck reviewed in week 2 costs your manager ten minutes and can save you a week of analysis in the wrong direction. New consultants often hold work back until it is polished because they fear looking unfinished; it is the most expensive habit in the job.`,
              `Never let your manager be surprised in front of the client. If a finding will upset the medical director, your manager hears it from you first, with the evidence. The same applies to a slipped date or a complaint about the team.`,
              `When the client asks for something outside your scope, do not refuse and do not quietly do it. Note the request, tell the client you will come back to them, and raise it with your manager that day. Whether the extra work is absorbed, traded or priced is their decision, and the engagement terms may already say how such requests are handled.`
            ),
          },
        ],
        exercises: [
          {
            title: "Workplan for a theatre workstream",
            instruction:
              "You lead the theatre workstream at Ridgeway Specialist Hospital, a 120-bed private hospital in Port Harcourt with four theatres. On-the-day cancellations are 18% of about 640 scheduled cases a month. Your deliverables are a baseline pack at the end of week 3 and an options paper to the steering committee on the Thursday of week 7. Write the half-page scope statement, then a workplan of 15 to 25 rows with data sources, owners and dates, planned backwards from the steering committee. Mark the critical path and show where your buffer sits.",
          },
          {
            title: "Friday status note",
            instruction:
              "It is Friday of week 4 on the same engagement. The billing export has still not arrived, two of six surgeon interviews have taken place, and your early analysis of 210 cancelled cases suggests about 40% were cancelled because pre-operative tests were incomplete. Write the Friday note to your engagement manager in the fixed shape: status with a one-line reason, done this week, planned next week, risks and issues with owners, and one decision you need from them.",
          },
        ],
      },
      resources: { tools: ["Workplan template", "Weekly status note template", "Decisions log"] },
      questions: [
        q(
          "You are drafting the scope for a theatre workstream at a 120-bed hospital. Which line of the scope statement does most to stop the workstream slipping?",
          "b",
          [
            "A list of the hypotheses you expect to test in the first fortnight",
            "The client inputs you depend on, with an owner and a date for each",
            "A description of the analytical methods and tools you plan to use for each analysis",
            "The names of the C4A team members assigned to the workstream",
          ],
          "Most slippage comes from client dependencies that nobody owned, so naming each input with an owner and date makes the risk visible and chaseable. Hypotheses matter, but they belong in the workplan and do not on their own protect the timeline."
        ),
        q(
          "Your workplan for an eight-week workstream has grown to 130 rows, including 'book meeting', 'send email' and 'print register'. What does this tell you?",
          "d",
          [
            "The plan is thorough and detailed, so it will be easy for the engagement manager to review, track and report on",
            "The workstream is under-resourced and needs another consultant",
            "The engagement is too large and the scope should be cut",
            "You have planned activities rather than analyses, and the plan should be rebuilt around the hypotheses",
          ],
          "A workplan row should be an analysis that tests a hypothesis and feeds a deliverable; 20 to 40 rows is normal for eight weeks. A long list of tasks feels thorough but nobody maintains it, and it hides the critical path."
        ),
        q(
          "On day 2 you learn that the hospital's billing export must be run by the system vendor and usually takes about two weeks. What should you do?",
          "a",
          [
            "Send the request today, put the export on the critical path and start analyses that use data you already hold",
            "Wait to send the request until you know exactly which fields and date ranges the baseline analysis will need from it",
            "Plan the baseline to start in week 3, when the export should arrive",
            "Ask the finance team to build the extract by hand from paper invoices instead",
          ],
          "Slow data requests go out first and sit on the critical path, while other work proceeds. Waiting to perfect the field list is tempting but costs days you cannot recover; you can request a broad export and filter it later."
        ),
        q(
          "The options paper goes to the steering committee on Thursday 14 March. When should the storyline (the ghost deck of action titles) be reviewed by your engagement manager?",
          "c",
          [
            "On 13 March, the day before the meeting, once the analysis is complete",
            "On 7 March, together with the full draft",
            "About two weeks earlier, before the feeding analyses close",
            "There is no need, because the action titles come from the finished analysis",
          ],
          "Planning backwards, the storyline is agreed well before the analyses close, so the manager can redirect work while it is still cheap to change. Reviewing it with the full draft is the common mistake: by then any change of direction means redoing analysis in days."
        ),
        q(
          "It is Friday of week 4. Your baseline is three days late because of missing data, but you have a plan to recover the time by week 6 without help. What status should your note report?",
          "b",
          [
            "Green, because you expect to recover",
            "Amber, with the recovery plan stated",
            "Red, because a deliverable is late",
            "No status, because the data delay is the client's fault",
          ],
          "Amber means a deadline is at risk but you have a recovery plan; red means you cannot recover without someone else acting. Calling it red to look careful is tempting, but it pulls your manager into a problem you can solve and weakens the signal next time."
        ),
        q(
          "A medical director tells you in a corridor that the hospital will stop booking elective cases on Saturdays. What should you do next?",
          "a",
          [
            "Enter it in the decisions log and email him the same day to confirm what was decided",
            "Note it in your notebook and raise it formally at the next steering committee meeting for the record",
            "Assume it is informal until it appears in board minutes",
            "Update the workplan immediately to remove Saturday analysis",
          ],
          "Corridor decisions are forgotten or disputed unless recorded and confirmed in writing promptly. Waiting for the steering committee is tempting because it is the formal forum, but weeks may pass and the decision may quietly change."
        ),
        q(
          "The billing export will be ten days late. Which message to your engagement manager is the most useful?",
          "d",
          [
            "'The billing export is going to be late again. Can we discuss?'",
            "'The finance team have not delivered the export, despite three reminders from me.'",
            "'The export is late. Please call the CFO to escalate.'",
            "'The export is ten days late. I can build the baseline from paper invoices (three extra days) or move it a week. I recommend the invoices.'",
          ],
          "Bringing the problem with costed options and a recommendation lets your manager decide in seconds. Asking the manager to escalate is tempting because it feels decisive, but it skips your own options and spends the manager's credit with the client on something you may be able to solve."
        ),
        q(
          "You have a rough ghost deck in week 2 but it has gaps and some numbers you are unsure of. What should you do with it?",
          "c",
          [
            "Hold it until the numbers are confirmed so you do not mislead your manager",
            "Send it straight to the client counterpart to check the numbers",
            "Show it to your engagement manager now, marking which numbers are provisional",
            "Rebuild it as a complete, polished deck first so that the review is worth your manager's limited time",
          ],
          "Early, rough review is cheap and catches a wrong direction before a week of analysis is spent on it; flagging provisional numbers keeps it honest. Holding work back to polish it is the tempting habit and the most expensive one."
        ),
        q(
          "Select all that apply. The client's head of nursing asks your workstream to also review night-shift staffing, which is outside your scope. Which responses are right?",
          "ad",
          [
            "Note the request and tell her you will come back to her",
            "Agree to do it, since it will build goodwill with a key stakeholder",
            "Tell her it is out of scope and cannot be done",
            "Raise it with your engagement manager the same day",
            "Fit it in quietly in the evenings so the workplan is not affected",
          ],
          "Scope requests are noted and passed to the engagement manager, who decides whether to absorb, trade or price them. Agreeing to do it feels helpful but commits the firm without a decision, and quietly doing it hides the cost until the workstream slips."
        ),
        q(
          "Your preliminary finding will embarrass the medical director: his own lists account for half of all late theatre starts. The steering committee is in four days. What should you do?",
          "b",
          [
            "Present it at the steering committee, since the data speaks for itself",
            "Tell your engagement manager first, with the evidence, and agree how and when the medical director hears it",
            "Leave it out of the steering committee paper for now, to protect your working relationship with the medical director",
            "Share it with the theatre manager so the news reaches him informally",
          ],
          "Your manager must never be surprised in front of the client, and a finding that implicates a senior person needs a planned first conversation. Leaving it out is tempting but withholds a material finding; presenting it cold invites defensiveness rather than action."
        ),
      ],
    },
    {
      slug: "engagement-leadership-intro",
      name: "Leading an Engagement: A First Look",
      description:
        "What changes when you lead an engagement rather than a workstream: knowing who the client is, writing the engagement charter, running the steering committee and keeping a risks and issues log.",
      estimatedMinutes: 50,
      content: {
        sections: [
          {
            title: "What changes when you lead",
            body: p(
              `Leading an engagement means owning the client's question, the team and the relationship, not only your share of the analysis. A workstream lead answers one question well. An engagement lead makes sure the answers add up to something the client can act on, delivered on time, by a team that is still standing at the end.`,
              `The lead owns four things:
- The answer: one recommendation the client can act on, not a stack of workstream reports.
- The client relationship: the sponsor hears from you before they need to ask.
- The team: who does what, to what standard, and whether the work is checked before the client sees it.
- Delivery against the agreed scope, time and budget.`,
              `The shift catches most new leads out. Your hours move away from building analysis and towards the client, reviewing your team's work and taking decisions. A useful rough guide for a small engagement is a third of your time with the client, a third reviewing and directing the team, and a third on your own thinking and writing. Leads who are still building the model at midnight while the sponsor has not heard from them in ten days have usually confused working hard with leading.`,
              `You will also review more than you write. Read every piece that goes to the client before it goes, because the client will hold the lead responsible for any wrong number, whoever typed it. Reviewing well means checking the logic and the headline numbers first, not the formatting. When you find a problem, send it back with the reason so the analyst learns to catch it next time; rewriting it yourself fixes one slide and teaches nothing.`
            ),
          },
          {
            title: "Knowing who the client is",
            body: p(
              `The person who signs the engagement letter is not always the person who decides. Before the first week ends, the lead should know who commissioned the work, who must approve its recommendations, who will carry them out, and who might stop them.`,
              `A simple map covers four roles:
- The sponsor: commissioned the work, receives the deliverables, signs them off.
- The decision-maker: approves the spend or the change. In a private hospital this is often the owner or the board, not the chief executive.
- The counterparts: client staff who work with your team day to day and hold the data.
- The people affected: those whose work changes, who will make the recommendation succeed or fail.`,
              `Take Bellwood Hospital, a 90-bed private hospital in Ibadan. The chief executive engaged C4A and is the sponsor. The board chair approves any spend above N20m, and the recommended theatre upgrade will cost more than that. The head of nursing will run the new admissions process. A lead who briefs only the chief executive will reach the board in week 8 with a recommendation the chair has never heard of and the nurses have never seen.`,
              `Two habits follow from the map. Meet the decision-maker in the first fortnight, even briefly, so they know the work exists and what it is for. And agree with the sponsor in writing what success looks like, in numbers where possible: "reduce average length of stay from 6.1 to 4.5 days" can be checked at the end; "improve efficiency" cannot. Write the measures down while everyone still agrees on them, because at the end of an engagement memories differ.`
            ),
          },
          {
            title: "The charter, the steering committee and the risks log",
            body: p(
              `Three simple tools keep an engagement on track: a one-page charter, a steering committee that takes decisions, and a risks and issues log that someone reads every week.`,
              `The charter is agreed with the sponsor in the first week and fits on a page: the objective, the scope and what is excluded, the deliverables and dates, the success measures, who sits on the steering committee and how often it meets, the client team, and the risks known at the start. When a disagreement arises in week 6, the charter is what both sides go back to.`,
              `The steering committee is where decisions are taken, not where progress is reported. Send its paper at least 48 hours ahead. State on the first page the decisions you are asking for. Circulate the minutes, with decisions and owners, within a day. A meeting that asks for no decision is a briefing, and a steering committee that only receives briefings soon stops attending.`,
              `The risks and issues log is a short shared list. A risk might happen: the billing vendor may not deliver the export. An issue has happened: the export is late. Each entry has an owner, an action and a date for review. Go through it with the team every week and with the sponsor at every steering committee. The value lies in raising problems while they are still small; a risk first mentioned when it has already become an issue usually costs the client time and costs the firm trust.`,
              `When something needs to go above you, take it to your own partner or the sponsor with what happened, what it affects and what you suggest. Do it early. Bad news gets more expensive every day it waits.`
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              `This taster covers what a first-time lead needs on a small, single-team engagement. CFA Master Consultant, the paid master-level track in this domain, goes on to the engagements where one sponsor, one team and one charter are not enough. It assumes you have done this module and does not repeat it.`,
              `What the track teaches that this module does not:
- Running engagements with several workstreams: designing the engagement structure, reconciling workstreams whose recommendations conflict, leading and protecting a larger team, and a tiered method for escalation and difficult conversations with senior clients.
- Boards, owners and stakeholder politics: how decisions are really made in family-owned hospitals and in hospitals led by their founder-doctors, how to work with a board split between two families, and how to run a fair process so people accept outcomes they did not want.
- Scoping, pricing and protecting the engagement: building a fee from resourced days, phasing work behind a diagnostic, change control when the client asks for more, and payment terms that protect the firm.
- Delivering C4A's proprietary programmes through the Diagnose, Design, Deliver and Sustain phases, and winning work through proposals, a disciplined pipeline and thought leadership.`,
              `The track is written for consultants who already lead work or expect to soon. Its modules are longer than the foundation modules and its assessments are scenario-heavy, because at master level the hard part is judgement in a messy situation rather than knowing the definitions. If you have led a workstream on a C4A engagement and found yourself managing the client as much as the analysis, you are the reader it was written for.`
            ),
          },
        ],
        exercises: [
          {
            title: "Charter for a small engagement",
            instruction:
              "Bellwood Hospital, a 90-bed private hospital in Ibadan, has engaged C4A for ten weeks to reduce average length of stay from 6.1 days to 4.5 days and to recommend whether to upgrade its two theatres. The chief executive is the sponsor; the board chair approves any spend above N20m; the head of nursing and the theatre manager are the counterparts. Write the one-page charter, including success measures in numbers, steering committee membership and frequency, and five risks with owners.",
          },
        ],
      },
      resources: { tools: ["Engagement charter template", "Stakeholder map", "Risks and issues log"] },
      questions: [
        q(
          "In week 5 of a small engagement, the lead is building the financial model herself late every night, and the sponsor has not heard from her for ten days. What is the main problem?",
          "c",
          [
            "The model is too complex for the engagement and should be simplified",
            "The team is too small for the work, and the firm should add an analyst to build the model",
            "She is doing workstream work at the cost of owning the client relationship",
            "She should delegate the model to the client's finance team",
          ],
          "The lead owns the relationship and the answer; ten days of silence with the sponsor is the failure, whatever happens to the model. Adding an analyst may help, but the tempting fix leaves the lead's time allocation unchanged."
        ),
        q(
          "At Bellwood Hospital the chief executive engaged C4A, but the board chair approves any spend above N20m and the recommended theatre upgrade will cost N45m. When should the lead first meet the chair?",
          "a",
          [
            "In the first fortnight, briefly, so the chair knows what the work is for",
            "At the final presentation, once the recommendation is firm",
            "Only if the chief executive asks the lead to",
            "After the theatre business case has been drafted, so you can test it with him properly",
          ],
          "The decision-maker should know the work exists early, so the recommendation does not arrive cold in week 8. Waiting for a firm recommendation feels cleaner, but a chair who first hears of a N45m proposal at the end is far more likely to defer or reject it."
        ),
        q(
          "Which success measure should go in the engagement charter for a length-of-stay engagement?",
          "d",
          [
            "Improve the efficiency of inpatient care",
            "Deliver a high-quality report on length of stay",
            "Ensure the client's leadership team is satisfied with the engagement at the end",
            "Reduce average length of stay from 6.1 to 4.5 days by month 6",
          ],
          "A success measure has to be checkable at the end, so it needs a baseline, a target and a date. 'Improve efficiency' is the tempting choice because everyone agrees with it, which is exactly why it cannot settle a disagreement later."
        ),
        q(
          "In a private hospital, which person on the stakeholder map is the decision-maker?",
          "b",
          [
            "Whoever signed the engagement letter",
            "Whoever approves the spend or the change the work recommends",
            "Whoever holds the data the team needs",
            "Whoever is most affected by the recommendations and must carry them out",
          ],
          "The decision-maker approves the spend or change, which in a private hospital is often the owner or board rather than the sponsor. The signatory is the tempting answer because they commissioned the work, but signing the letter does not give them authority over a large investment."
        ),
        q(
          "Your steering committee paper reports progress on four workstreams and ends with 'next steps'. What is missing?",
          "a",
          [
            "The decisions you are asking the committee to take, stated on the first page",
            "A full appendix setting out the analysis behind each of the four workstreams in detail",
            "A list of everyone interviewed so far",
            "A comparison with other hospitals C4A has worked with",
          ],
          "A steering committee exists to take decisions; a paper with none asked for turns it into a briefing and attendance falls. More appendix is the tempting addition, but detail does not give the committee anything to decide."
        ),
        q(
          "The billing vendor has said it may not deliver the export on time. Later, the export date passes and nothing arrives. How should the log treat these two events?",
          "c",
          [
            "Both are issues, because both concern the export",
            "Both are risks until the engagement deadline is missed",
            "The first is a risk; once the date passes it becomes an issue",
            "Neither belongs in the log, because the vendor is not the client",
          ],
          "A risk might happen; an issue has happened. Logging third-party dependencies matters because they often drive delay, so leaving the vendor out because it is not the client is a common mistake."
        ),
        q(
          "When should the steering committee paper reach members?",
          "d",
          [
            "On the morning of the meeting, so the numbers are as current as possible",
            "Only after the meeting, so members discuss without preconceptions",
            "A week ahead, with the minutes of the previous meeting attached",
            "At least 48 hours ahead, with the decisions sought on the first page",
          ],
          "Members need time to read and form a view, or decisions get deferred. Sending on the morning is tempting because the numbers are fresher, but unread papers produce discussion, not decisions."
        ),
        q(
          "A junior analyst's slide has a wrong headline number and weak logic. You have an hour before it goes to the sponsor. What is the better approach for the lead?",
          "b",
          [
            "Rewrite the slide yourself so the number and the logic are right, and move on to the next one",
            "Send it back with the reason, and check the corrected version before it goes",
            "Send it as it is, with a note that it is a draft",
            "Remove the slide from the pack",
          ],
          "The lead must stop wrong numbers reaching the client and help the analyst learn to catch them, so returning it with the reason does both. Rewriting it yourself is tempting under time pressure but fixes one slide and leaves the same error to recur."
        ),
        q(
          "Select all that apply. Which belong in a one-page engagement charter?",
          "acd",
          [
            "Success measures with baselines and targets",
            "The full workplan with every analysis",
            "Steering committee membership and frequency",
            "What is excluded from scope",
            "Interview notes from the first week",
          ],
          "The charter sets the objective, scope and exclusions, deliverables, measures, governance and known risks on one page. The workplan is tempting to include because it shows detail, but it belongs in its own document and would make the charter unreadable."
        ),
        q(
          "In week 3 you realise the client team cannot release the head of nursing as agreed, which will delay the admissions redesign by about three weeks. When and how should you raise it with the sponsor?",
          "a",
          [
            "Now, with what has happened, what it affects and what you suggest",
            "At the next steering committee in four weeks, in the progress section",
            "Once you have tried for two more weeks to work around it",
            "Only if the delay grows beyond the three weeks you expect",
          ],
          "Problems are cheaper to solve early, and the sponsor can only help if told what it affects and what you suggest. Trying to work around it first is tempting because it seems self-reliant, but it spends weeks of the delay you are trying to avoid."
        ),
      ],
    },
  ],
};

export default expansion;
