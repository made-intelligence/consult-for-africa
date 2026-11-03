import type { TrackExpansion } from "./types";

const expansion: TrackExpansion = {
  slug: "cfa-platform-engagement",
  topUp: [
    {
      moduleSlug: "cfa-engagement-lifecycle",
      questions: [
        {
          question:
            "A 120-bed hospital in Enugu tells you its problem is weak marketing. In the first fortnight your team finds that 40% of phone enquiries are never called back and the switchboard is unstaffed after 4pm. Which DDDS principle does this finding illustrate?",
          options: [
            { id: "a", text: "Diagnose separates the presenting complaint from the real problem before anything is designed", isCorrect: true },
            { id: "b", text: "Design should start at once with a marketing campaign and a new website, since the client named marketing and owns the brief for the work", isCorrect: false },
            { id: "c", text: "Deliver should run in parallel with Diagnose to save time on a short engagement", isCorrect: false },
            { id: "d", text: "Sustain begins as soon as the first finding is shared with the client", isCorrect: false },
          ],
          explanation:
            "Diagnose exists to find the real problem behind the presenting complaint; here demand is being lost at the front door, not failing to arrive. Starting a campaign because the client asked for one would pour more enquiries into a process that drops them.",
        },
        {
          question:
            "At the Gate 1 review the team presents root causes for low inpatient occupancy, but every dataset it used covers outpatients only. What should the gate decide?",
          options: [
            { id: "a", text: "Pass the gate and collect inpatient data during Design", isCorrect: false },
            { id: "b", text: "Pass the gate, because outpatient data is a reasonable proxy for inpatient demand", isCorrect: false },
            { id: "c", text: "Cancel the engagement, because the scope was set wrongly", isCorrect: false },
            { id: "d", text: "Send the team back to gather inpatient data or re-scope before moving to Design", isCorrect: true },
          ],
          explanation:
            "Gate 1 confirms that root causes are correctly identified and the scope is right, and evidence that does not cover the problem cannot confirm either. Going back is the normal, healthy outcome; passing and fixing it later is how a flawed roadmap gets built.",
        },
        {
          question:
            "A draft Transformation Roadmap lists 14 initiatives with owners but no costs and no sequence. Which gate will it fail, and why?",
          options: [
            { id: "a", text: "Gate 1, because root causes must be confirmed again whenever a roadmap is drafted, before any costing work starts", isCorrect: false },
            { id: "b", text: "Gate 2, because interventions must be shown to be feasible, costed and sequenced", isCorrect: true },
            { id: "c", text: "Gate 3, because implementation targets have not yet been met", isCorrect: false },
            { id: "d", text: "No gate, because owners are the only requirement for a roadmap", isCorrect: false },
          ],
          explanation:
            "Gate 2 sits after Design and checks that the plan is feasible, costed and sequenced. Owners alone do not tell the client what it will spend or what comes first.",
        },
        {
          question:
            "Near the end of Deliver, the client's COO asks C4A to keep updating the bed management dashboard every week indefinitely, because her team finds it hard. What does the Sustain phase point you towards?",
          options: [
            { id: "a", text: "Agree, since a continuing request is good for the relationship and for revenue", isCorrect: false },
            { id: "b", text: "Hand over the dashboard file and end support on the last day of the engagement", isCorrect: false },
            { id: "c", text: "Transfer the capability: train her team to run it, document it in the Handover Pack and check it in the 90-day follow-up", isCorrect: true },
            { id: "d", text: "Simplify the dashboard to one number so no training is needed", isCorrect: false },
          ],
          explanation:
            "Sustain is about the client operating independently after C4A leaves, through capability transfer, the Handover Pack and the 90-day follow-up. Quietly becoming the permanent operator leaves the change dependent on the firm, and dropping the file without training is what makes it fail.",
        },
        {
          question:
            "A junior consultant finishes a Current State Assessment on Friday afternoon and the client meeting is Monday. The engagement lead is travelling. What does the deliverable standard require?",
          options: [
            { id: "a", text: "A senior consultant reviews it and the engagement lead approves it before it reaches the client, even if that means moving the meeting", isCorrect: true },
            { id: "b", text: "Send it to the client on Friday marked draft, so they can read it over the weekend", isCorrect: false },
            { id: "c", text: "The junior consultant reviews it twice, which counts as two sets of eyes", isCorrect: false },
            { id: "d", text: "Present it on Monday as planned, then send the reviewed version afterwards with a note listing any changes the reviewers made", isCorrect: false },
          ],
          explanation:
            "No deliverable leaves C4A without at least two sets of eyes, and the engagement lead approves. A draft sent early still reaches the client and carries every unchecked error with it.",
        },
      ],
    },
    {
      moduleSlug: "using-cfa-platform",
      questions: [
        {
          question:
            "In a 40-hour available week you logged 26 billable hours, and the last three weeks were similar. What should you do?",
          options: [
            { id: "a", text: "Speak to your engagement manager about reallocation, because 65% is below the 70% floor", isCorrect: true },
            { id: "b", text: "Nothing, because anything under 85% is healthy", isCorrect: false },
            { id: "c", text: "Log your internal reading and Academy time as billable so the weekly figure reaches the 70% floor", isCorrect: false },
            { id: "d", text: "Wait until the end of the quarter to see if it averages out", isCorrect: false },
          ],
          explanation:
            "Utilisation is billable hours divided by available hours, so 26 of 40 is 65%, below the 70 to 80% target, and the remedy is reallocation. Reclassifying non-billable time misstates what the client is charged.",
        },
        {
          question:
            "A consultant has logged 36 billable hours of 40 available for six weeks running and says she is coping. What does the utilisation guidance say?",
          options: [
            { id: "a", text: "It is ideal, since higher utilisation always means better performance", isCorrect: false },
            { id: "b", text: "It only becomes a concern if she starts missing deadlines or the client complains about the quality of her work", isCorrect: false },
            { id: "c", text: "She should log fewer hours so the figure looks normal", isCorrect: false },
            { id: "d", text: "At 90% for a sustained period it signals burnout risk, so flag it early and redistribute work", isCorrect: true },
          ],
          explanation:
            "Consistently above 85% is a warning sign, and the guidance is to flag it before quality suffers. Logging fewer hours than worked would hide the problem and misstate the record.",
        },
        {
          question:
            "Project code NGA-ABJ-004 is in Design and you are uploading the third version of the Transformation Roadmap. Which file name follows the convention?",
          options: [
            { id: "a", text: "Roadmap-final-v3-Abuja", isCorrect: false },
            { id: "b", text: "NGA-ABJ-004-DESIGN-ROADMAP-v3", isCorrect: true },
            { id: "c", text: "DESIGN-NGA-ABJ-004-v3-Roadmap", isCorrect: false },
            { id: "d", text: "NGA-ABJ-004-Transformation-Roadmap-31Oct-final", isCorrect: false },
          ],
          explanation:
            "The convention is Project Code, Phase, Document Type, Version, in that order. Dates and words like final do not tell the next person which version is current.",
        },
        {
          question:
            "Your engagement manager is on a site visit and asks you to WhatsApp her the revised patient flow analysis so she can review it in the car. What is the right response?",
          options: [
            { id: "a", text: "Send it on WhatsApp, since she asked for it", isCorrect: false },
            { id: "b", text: "Email it to her instead, because email is more formal than WhatsApp and keeps a copy in both inboxes", isCorrect: false },
            { id: "c", text: "Submit it through the platform for review and send her a short message that it is waiting there", isCorrect: true },
            { id: "d", text: "Hold it until she is back in the office", isCorrect: false },
          ],
          explanation:
            "Submission goes through the platform so there is an audit trail and nothing is lost; a message pointing to it is fine. Email is no better than WhatsApp on this point, because neither leaves the review on the record.",
        },
        {
          question:
            "You are working from home on a client's staff roster spreadsheet. Where should the working file be stored?",
          options: [
            { id: "a", text: "In the platform's document library under the engagement and phase", isCorrect: true },
            { id: "b", text: "On your laptop's desktop, then uploaded when finished", isCorrect: false },
            { id: "c", text: "In a personal Google Drive folder shared with the team", isCorrect: false },
            { id: "d", text: "In your email drafts so it is backed up", isCorrect: false },
          ],
          explanation:
            "All project documents live in the platform's document library, organised by engagement and phase, with version history. A personal drive or laptop puts client data outside the firm's control.",
        },
      ],
    },
  ],
  modules: [
    {
      slug: "platform-tasks-time-deliverables",
      name: "Tasks, Time and Deliverables",
      description:
        "The daily record on the C4A platform: raising and taking tasks, the note each move needs, logging time against your assignment, and taking a deliverable from draft to delivered.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Three records, three questions",
            body:
              "The platform keeps three daily records, and each answers a different question. The task board answers who is carrying a piece of delegated work and whose move it is now. Time & Payments answers how much time you spent on which assignment, which is what the client is billed and what you are paid from. Deliverables answers what the engagement owes the client and where each piece sits in review. Most early mistakes come from putting work in the wrong one.\n\nTake a consultant who is asked to produce a revenue leakage summary that the client's board will receive. If she records it as a task, her engagement manager can sign it off, but it never gets the deliverable quality rubric, it never appears in the client's portal, and nobody can deliver it to the client from there. If she records it only on her time entry, there is no record of the work product at all. The summary is a deliverable; the hours she spends on it go on her time record; the request to pull the pharmacy sales data for it, made by her manager to an office analyst, is a task.\n\nA rule of thumb that holds in most cases:\n- If the client will receive it, it is a deliverable on the engagement.\n- If a colleague asked you to do it and will check it, it is a task.\n- If you spent engagement time on it, it goes on your time record, whatever else it is.\n\nWhat you see depends on your role. A consultant's sidebar carries Client work: Dashboard, Projects, Deliverables, Opportunities, Time & Payments and Tools, with Knowledge, the Asset Library and the Academy alongside. Engagement managers and above, and the Office of the Founding Partner, also see My desk, Tasks, Commitments, Decisions and Rhythm. Analysts in the office see both sets, because everybody at C4A carries client work. My desk lists everything waiting on you, ordered by whose move it is, and it is the first page to open each morning.",
          },
          {
            title: "Raising and taking a task",
            body:
              "A task is only as good as the brief it was raised with. The form asks for a title, a brief that says why the work matters and what it feeds into, a definition of done, an optional worked example, a due date, a check-in date and an estimate in minutes. The person who assigns the task is also its reviewer, so the work comes back up the same line it went down.\n\nThe definition of done carries most of the weight. \"Do the pharmacy stock count\" invites a ten-minute answer to a three-hour job. \"Every line in the Ward B pharmacy counted against its bin card, variances above 10% listed with a likely reason, and the count sheet attached\" can be checked by anyone. Where the assignee has never done this kind of work before, attach a worked example under \"One that is already right\", even if it is just a link to last month's count. Without one, a definition of done describes something the assignee has never seen.\n\nThe check-in date is a deliberate midpoint. A five-day task with a check-in on day two gets a conversation while there is still time to change course, rather than a surprise on day five. The estimate is visible to the assignee, and the actual time is recorded at the end. If an estimate of four hours comes in at twelve, the estimate was wrong, and both people learn something about the work.\n\nIf you are taking a task, read the brief and the definition of done before you start. If anything is unclear, ask on the task itself. The question panel keeps the question and the answer on the record, so the next person given the same task finds them there instead of in a WhatsApp thread. A large task can be broken into sub-tasks, and the parent shows the roll-up so the original assigner sees progress without opening every piece. When a task genuinely changes hands, use Hand it over, so the trail shows who carried it and when.",
          },
          {
            title: "Moving a task, and the note each move needs",
            body:
              "A task is always in one of seven states: Assigned, In progress, Blocked, Submitted, Changes requested, Done or Cancelled. What matters day to day is whose move each state makes it. Assigned, In progress and Changes requested are the doer's move. Submitted and Blocked are the reviewer's move. Done and Cancelled are nobody's.\n\nThis is why marking a task Blocked is not an admission of failure. It moves the task onto your assigner's desk with a reason, so you can stop without interrupting anyone. The platform will not let you block a task without saying what is in the way, and that note goes to your assigner rather than the whole firm. \"Waiting on data\" is weak. \"The March theatre register is missing from the records room; the theatre manager is on leave until Monday; I can finish with February and January if you approve a two-month baseline\" lets the reviewer act in one step.\n\nEach move carries one note, and some are required:\n- Blocked needs what is in the way.\n- Changes requested needs what must change, written so the correction can be reused.\n- Cancelled needs why, because work that disappears without a reason reads as a judgement on the person carrying it.\n- Submitted needs something to look at: an attached file, a pasted link, or a line saying where the work lives. The platform refuses a submission with none of these, because a reviewer cannot sign off work they cannot see.\n- Done carries an optional sign-off note. Use it to say what was good or what you would do differently; one line the assignee can take into the next task.\n\nTwo moves are easy to miss. You can pull a submitted task back to In progress before the reviewer has acted on it, if you spot a mistake. And a reviewer can reopen a Done task into Changes requested if it turns out not to be done. Every move appears under How it got here, so a task that bounced back three times looks different from one that landed first time.",
          },
          {
            title: "Logging time against your assignment",
            body:
              "Time is logged in Time & Payments against an assignment, which is your role on a specific engagement at an agreed rate. The log form changes with the rate type of that assignment. On an hourly assignment you enter the hours worked. On a daily assignment each entry is one day at the daily rate. On a monthly assignment you pick the month and year. On a fixed-project or per-deliverable assignment, hours are optional and kept for tracking only.\n\nEvery entry asks \"What did you work on?\" Write the answer for a reader who was not there, because that reader may be the client's finance director querying an invoice. \"Fieldwork\" tells nobody anything. \"Interviewed four ward managers on discharge delays, Wards A to D; notes filed on the engagement\" tells the engagement manager what was done, and lets her defend the day if the client asks.\n\nAn entry starts as Pending. Your engagement manager approves it or returns it, and a return always carries a reason. A returned entry shows as Rejected with that reason; correct what it asks and log it again. Approved entries go into the payment queue and are marked Paid when settled. Entries are submitted weekly, by close of business on Friday, as the Using the CFA Platform module sets out.\n\nThere is one case where you should not log anything. On a per-deliverable assignment, approving a deliverable that carries a fee creates the time entry for that fee automatically. Logging it yourself as well would bill and pay the same work twice.\n\nAccuracy matters more than neatness. Log the day you actually worked, not the day you remembered to log it. If you spent two hours on a different engagement in the middle of a day, split the entry. If you are unsure which assignment some work belongs to, ask your engagement manager before you log it, because moving an approved entry between engagements is far harder than getting it right first time.",
          },
          {
            title: "Taking a deliverable from draft to delivered",
            body:
              "A deliverable moves through six states: Draft, Submitted, In review, Needs revision, Approved and Delivered to client. You submit from the deliverable's page with a summary of what you have delivered, the key findings and any context the reviewer needs, plus either an uploaded file or a link to where it lives. The summary is required; it is what the reviewer reads first.\n\nThe review is done by the engagement manager on their own engagement, or by an associate director or above. The reviewer scores four criteria from 1 to 5: Technical quality (is the analysis rigorous and evidence-based?), Actionability (are the recommendations specific and implementable?), Nigerian context (does it account for local healthcare realities?) and Client-ready (is the presentation professional?). These combine into a score out of 10. To send work back, the reviewer must write notes; to approve, they can add a short tag such as \"Well structured\".\n\nWhen you resubmit after a revision request, the version number goes up by one, and the version history and comments stay attached, so anyone can see what changed between version 2 and version 3. Only an approved deliverable can be delivered to the client, and only an engagement manager or above can do it. Delivering it posts an update the client can see on their project.\n\nTwo facts about the client portal should shape how you work here. The client's project overview lists every deliverable on the engagement by name and status, including drafts and those with a revision requested; the download only appears once a deliverable is approved or delivered. And the comment thread on a deliverable is visible to the client. So name a deliverable as you would title it for the client's board, never \"Tolu draft analysis messy\", and write every comment on it as if the client's managing director will read it, because she can.",
          },
        ],
        exercises: [
          {
            title: "Block it, then hand it over",
            instruction:
              "You are given a task on Monday: \"Theatre utilisation baseline, Ikeja Crest Hospital\", estimate 240 minutes, check-in Tuesday 2pm, due Thursday. The definition of done is a table of sessions booked, sessions used and minutes of late start for each of the four theatres over January to March. On Tuesday morning you find the March theatre register is missing and the theatre manager is on leave until the following Monday. Write the note you would put on the task when you mark it Blocked. Then assume your assigner approves a January to February baseline; write the handover note you would submit with, and list what you would attach. Finally, your actual time was 410 minutes. Write one line explaining the gap against the estimate.",
          },
          {
            title: "Fix a returned week",
            instruction:
              "You are on a daily-rate assignment for a 90-bed hospital in Ibadan. Last week you logged four days with these descriptions: \"site visit\", \"analysis\", \"analysis\" and \"meeting\". Your engagement manager returned two entries with the reason \"Description does not say what was done.\" Rewrite all four descriptions so a client finance director could read them, inventing realistic detail (wards visited, data sources, who attended the meeting). Then say which, if any, of the four should have been split across two entries, and why.",
          },
        ],
      },
      resources: { tools: ["Task board", "Time & Payments", "Deliverables", "My desk"] },
      questions: [
        {
          question:
            "Your engagement manager asks you to produce the Current State Assessment that the client's board will receive at the end of Diagnose. Where should this work be recorded on the platform?",
          options: [
            { id: "a", text: "As a task on the task board, assigned to you by your engagement manager", isCorrect: false },
            { id: "b", text: "As a deliverable on the engagement, submitted for review when ready", isCorrect: true },
            { id: "c", text: "As a knowledge base asset linked to the project", isCorrect: false },
            { id: "d", text: "As a project update marked visible to the client", isCorrect: false },
          ],
          explanation:
            "Anything the client will receive is a deliverable, which gets the quality rubric, version history and the route to delivery. A task can be signed off but never reaches the client's portal or the delivery step.",
        },
        {
          question:
            "You are three days into a five-day task and cannot get the HMO claims file from the client's finance office. You have chased twice. What is the right move on the platform?",
          options: [
            { id: "a", text: "Leave it In progress and keep chasing the finance office every day, so the task does not look as if it is failing and nobody else has to be involved", isCorrect: false },
            { id: "b", text: "Submit what you have so the reviewer can see progress", isCorrect: false },
            { id: "c", text: "Mark it Blocked with a note saying what is missing, who holds it, what you have tried and what you could do without it", isCorrect: true },
            { id: "d", text: "Cancel the task and raise a new one once the file arrives", isCorrect: false },
          ],
          explanation:
            "Blocked moves the task to the reviewer's desk with a reason, which is how you stop without interrupting anyone; the platform requires the note. Leaving it In progress hides the problem until the due date, which is the surprise the check-in is meant to prevent.",
        },
        {
          question:
            "You finished a stock reconciliation on paper at the hospital and try to submit the task with no attachment and no note. The platform refuses. What will let you submit?",
          options: [
            { id: "a", text: "Message the reviewer to say it is finished and ask them to mark it Done from their side of the task", isCorrect: false },
            { id: "b", text: "Mark it In progress, then Done", isCorrect: false },
            { id: "c", text: "Add a comment on the task saying it is finished", isCorrect: false },
            { id: "d", text: "Attach a photo or scan, paste a link to where it lives, or write a line saying where the reviewer can find it", isCorrect: true },
          ],
          explanation:
            "A submission must hand over something the reviewer can see: a file, a link, or a line saying where the work is. Only the reviewer can mark a task Done, and doing so on work they cannot see turns sign-off into a courtesy.",
        },
        {
          question:
            "Which task states put the next move with the reviewer rather than the doer?",
          options: [
            { id: "a", text: "Submitted and Blocked", isCorrect: true },
            { id: "b", text: "Submitted and Changes requested", isCorrect: false },
            { id: "c", text: "Blocked and In progress", isCorrect: false },
            { id: "d", text: "Assigned and Submitted", isCorrect: false },
          ],
          explanation:
            "Submitted waits to be judged and Blocked waits to be unstuck, and both are the reviewer's move. Changes requested is the doer's move, because the work has come back with a note for them to act on.",
        },
        {
          question:
            "You are raising a task for an office analyst who has never done a patient-flow tally. Which brief is most likely to come back right first time?",
          options: [
            { id: "a", text: "Title \"OPD tally\", due Friday, no estimate, so the analyst is not pressured", isCorrect: false },
            { id: "b", text: "A definition of done that says what a finished tally contains, a worked example from a previous tally, a check-in on day two and an estimate", isCorrect: true },
            { id: "c", text: "A long brief explaining the whole engagement and the client relationship in detail, with the definition of done left for the analyst to propose once they have read it", isCorrect: false },
            { id: "d", text: "A short brief, with a call booked for the analyst to explain it back to you", isCorrect: false },
          ],
          explanation:
            "A checkable definition of done plus a worked example lets someone produce a thing they have never seen, and the check-in catches drift early. A long background without a definition of done leaves the analyst guessing what finished looks like.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A reviewer is about to move a task. For which moves does the platform require a written note? Select all that apply.",
          options: [
            { id: "a", text: "Sending the work back as Changes requested", isCorrect: true },
            { id: "b", text: "Signing it off as Done", isCorrect: false },
            { id: "c", text: "Cancelling the task", isCorrect: true },
            { id: "d", text: "Clearing a block so the task goes back to In progress", isCorrect: false },
          ],
          explanation:
            "Changes requested needs what to change and Cancelled needs why, because both are meaningless without the reason. The sign-off note is offered rather than required, though a good reviewer writes one.",
        },
        {
          question:
            "On a per-deliverable assignment carrying a fee, your engagement manager approves your deliverable on Wednesday. What should you log in Time & Payments for that fee?",
          options: [
            { id: "a", text: "A time entry for the full fee, dated Wednesday", isCorrect: false },
            { id: "b", text: "A time entry for the hours spent, so the fee can be calculated", isCorrect: false },
            { id: "c", text: "Nothing, because approving the deliverable creates the entry for its fee automatically", isCorrect: true },
            { id: "d", text: "A pending entry, to be confirmed after the client pays", isCorrect: false },
          ],
          explanation:
            "On a per-deliverable assignment, approval of a deliverable with a fee generates the time entry itself. Logging it again would bill and pay the same work twice.",
        },
        {
          question:
            "Your engagement manager returns a time entry with the reason \"Does not say what was done.\" Your description was \"Analysis, 1 day.\" Which rewrite best meets the standard?",
          options: [
            { id: "a", text: "\"Analysis of hospital data for the engagement, full day\"", isCorrect: false },
            { id: "b", text: "\"Worked on the project as agreed with the EM\"", isCorrect: false },
            { id: "c", text: "\"Analysis for the engagement, 8 hours in total, see the deliverable submitted this week for the detail of what was done\"", isCorrect: false },
            { id: "d", text: "\"Built the Q1 HMO claims ageing table from the finance office extract; reconciled totals to the ledger; flagged three payors over 120 days\"", isCorrect: true },
          ],
          explanation:
            "The description should let a reader who was not there, possibly the client's finance director, see what was done. Adding hours or a pointer does not say what the work was.",
        },
        {
          question:
            "You resubmit a deliverable after the reviewer asked for changes. What happens on the platform?",
          options: [
            { id: "a", text: "The version number goes up by one, and earlier versions and comments stay attached", isCorrect: true },
            { id: "b", text: "The earlier version and its comments are replaced by the new file", isCorrect: false },
            { id: "c", text: "The deliverable goes straight to Approved because it has already been reviewed once", isCorrect: false },
            { id: "d", text: "It returns to Draft and must be reassigned before review", isCorrect: false },
          ],
          explanation:
            "Resubmitting after a revision request raises the version and keeps the history, so anyone can see what changed. Nothing is approved without a fresh review.",
        },
        {
          question:
            "You are naming a new deliverable on a client engagement while it is still rough. Why does the name matter even before it is approved?",
          options: [
            { id: "a", text: "It does not matter, because clients only see deliverables after they are delivered", isCorrect: false },
            { id: "b", text: "The client's project overview lists every deliverable by name and status, including drafts, and its comment thread is visible to the client", isCorrect: true },
            { id: "c", text: "The name becomes the file name the client downloads", isCorrect: false },
            { id: "d", text: "Reviewers score the name under the Client-ready criterion", isCorrect: false },
          ],
          explanation:
            "The portal shows all deliverables on the engagement with their status, and the download appears only once approved. Assuming clients see nothing until delivery is how an internal joke ends up on the client's screen.",
        },
      ],
    },
    {
      slug: "platform-client-records-meetings",
      name: "Client Records and Meetings",
      description:
        "Keeping the client record complete, writing meeting notes that drive action, running the commitments and decisions registers, and knowing exactly what the client sees in their portal.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "The project page is the client record",
            body:
              "The client record is the project page, and it should let a colleague pick up the engagement tomorrow without phoning you. Each project opens on tabs: Overview, Tracks, Team, Deliverables, Timeline, Calls, Playbook and Debrief. The Overview carries the engagement manager, the client, the phases and a feed of project updates. Engagement managers and above also see Clients, which holds the organisation and its contacts.\n\nProject updates are the running log. Each one has a type (General, Milestone completed, Issue, Client feedback, Team change or Work stream update) and a switch that makes it visible to the client. Most updates should stay internal. A short, factual update visible to the client is useful when a milestone is met or a document is handed over; delivering an approved deliverable posts one automatically.\n\nWhat belongs on the record is anything that would change what a colleague or the client would do next. Examples:\n- The medical director withdrew support for the new theatre list after Tuesday's meeting.\n- The finance office says the HMO claims extract will come on the 14th, not the 7th.\n- The client asked to add the Lekki outpatient clinic to scope; the engagement manager is pricing it.\n- Payment of the second milestone arrived on 3 October.\n\nWhat does not belong is opinion about people, gossip from the canteen and anything you would be embarrassed to see read aloud in a meeting with the client. Write updates as facts with dates and sources. \"Matron says nights are short of four nurses on Ward C, per the September roster\" is a record. \"Matron is difficult\" is not.\n\nThe test is simple. If you were off sick from tomorrow for two weeks, could your engagement manager brief a replacement from the project page alone? If the answer depends on your WhatsApp history, your notebook or your memory, the record is incomplete, and the gap should be closed the same day.",
          },
          {
            title: "Meetings and the notes that come out of them",
            body:
              "A meeting on the platform is scheduled with a type (Discovery call, Project check-in, Internal, Client review or Coaching), a time, a description and its participants, and it is linked to the engagement it belongs to. People outside the firm can be added by name and email, and they receive the invitation. Times show in Lagos time.\n\nWhen the call is held in the platform's own meeting room, transcription starts once a C4A host joins. Within about fifteen minutes of everyone leaving, Nuru, the platform's note-taker, drafts a summary, a list of actions and the commitments it heard people make. The meeting page then shows \"Notes drafted, waiting for confirmation\". Nothing in the draft is treated as fact until a person confirms it. The person confirming goes through each drafted commitment and corrects the owner or date, removes it if it was not really a promise, or keeps it. Confirming records the kept commitments in the register and sends the notes to everyone.\n\nThat review step matters more than it looks. A misheard owner becomes a wrong chase: if the draft says the hospital administrator will send the staff list when it was actually the HR officer, someone will chase the wrong person for a week. Check every name and every date against what you heard.\n\nMany meetings will not be transcribed: a walk-round with the matron, a meeting in the managing director's office, a call on someone else's line. For these, write the minutes yourself in the description field, which is labelled for exactly this: what the meeting is for, and the minutes afterwards. Good minutes are short and contain three things:\n- Decisions taken, with who took them.\n- Actions, each with one owner and a date.\n- Open questions, with who will answer them.\n\nThey are not a transcript and not a narrative of who said what. A one-hour client review usually produces half a page.",
          },
          {
            title: "The commitments register",
            body:
              "A commitment is a promise somebody made, and it is not a task. A task is work the firm holds and can assign. A commitment is often owed by someone the firm cannot assign anything to: the client's finance director promising the payroll file, an HMO's provider relations officer promising a tariff reply. That is exactly why such promises get forgotten, and why the register exists.\n\nEach commitment records what was promised, who owes it (one of ours, or a name and email for someone outside), who it is owed to, the date, where it was made (a meeting, a call, a message), and the chase record: how many times it has been chased and when last. Commitments confirmed from meeting notes arrive already linked to the meeting. Others are recorded by hand with Record a promise.\n\nStatuses are Open, Chased, Honoured, Missed and Dropped. Use them precisely:\n- Chased today records a chase and moves the count on. Press it when you have actually chased, not when you meant to.\n- Honoured means the thing arrived. A second promise to send it is not honouring the first.\n- Missed means the date passed and it did not come.\n- Dropped means it is no longer needed, by agreement. Dropping something because chasing is awkward hides a problem the engagement manager needs to see.\n\nThe chase record tells you which problem you have. A commitment never chased is our problem. A commitment chased four times over three weeks is the debtor's problem, and probably a sign that something else is going on, such as a finance director who does not want the data seen. That is a conversation for your engagement manager, not a fifth reminder.\n\nItems past their date sit at the top of the register under their own heading. Work them before anything else, and record the promise the same day it is made. A commitment recorded a week late has already lost a week.",
          },
          {
            title: "The decisions register",
            body:
              "The decisions register exists so a principal can clear several decisions in one sitting without asking a single question. Raise a decision with Raise a decision, and the form asks for what has to be decided, whose decision it is, the background, the options, your recommendation, the cost of delay and the date it is needed by.\n\nThe background should contain everything the person needs to decide without coming back to you. The form says so in as many words. Options should be real alternatives, normally two to four, not one good option and two straw men. The recommendation says which you would pick and why, in two or three sentences. The cost of delay is optional on the form, but it is the field that gets things decided, because it makes the price of deferring visible at the moment of deferring.\n\nA worked example. A 150-bed hospital in Port Harcourt must choose whether to renew its laboratory reagent contract for 12 months at the current price, renew for 6 months, or tender.\n- Background: the contract expires on 30 November; the supplier has offered a 12-month renewal at today's prices; two other suppliers quoted 8% and 11% lower last year but neither has served a hospital of this size in the state.\n- Recommendation: renew for 6 months and run a tender in January, which keeps supply safe and tests the cheaper quotes.\n- Cost of delay: if nothing is signed by 20 November the supplier has said it will move the hospital to list price, about N2.1m a month more.\n\nThe person deciding has three outcomes. Decided requires the outcome to be written down, so the record says what was chosen, not just that something was. Deferred keeps it on the register. Declined closes it without action. The person who raised it can see their decisions under their own view; the principal sees Waiting on me.\n\nDo not raise a decision that you could take yourself within your own authority. The register is for decisions that are genuinely someone else's to make.",
          },
          {
            title: "What the client sees in the portal",
            body:
              "The client has its own portal, and you need to know exactly what is on it, because anything there is being read by the people who pay the firm. Client contacts sign in to a portal with Home, Projects, Invoices, Knowledge and Team. Inside a project they see Overview, Dashboard, Impact & Results, Documents and Executive Summary.\n\nWhat the client can see:\n- Project updates that were marked visible to the client, newest first.\n- Milestones with their due and completion dates, and payment milestones with what is paid and pending.\n- Every deliverable on the engagement by name and status, including Draft and Revision requested. Files can be downloaded once a deliverable is approved or delivered.\n- On a deliverable's page, its description, its versions and change notes, and its comment thread. Clients can comment and reply there, and they see comments written by C4A staff too.\n- Dashboards, but only once a draft has been published.\n- Knowledge assets the firm has marked visible to clients.\n- Invoices, which they can view and pay.\n\nWhat the client does not see: internal project updates, the task board, the commitments and decisions registers, meeting transcripts and drafts, timesheets, rates and the reviewer's scores.\n\nThree habits follow. Write every deliverable name and description as the client's board would read it. Treat a deliverable's comment thread as a conversation with the client, not a place to argue with your reviewer; keep internal back-and-forth on the review itself. And before you switch an update to visible, read it as the client's managing director: is it factual, does it name a junior member of their staff in a failure, would you be content to have it quoted back to you?\n\nThe portal is also a reason to keep the record current. A client who logs in to find the last update was six weeks ago, while the team has been on site every day, will draw their own conclusion about how the engagement is going.",
          },
        ],
        exercises: [
          {
            title: "From a meeting to the registers",
            instruction:
              "You attended a one-hour client review at a 110-bed hospital in Abuja. It was held in the managing director's office, so nothing was transcribed. Your notes say: the MD agreed to extend the outpatient pilot to Saturdays from 1 November; the finance manager, Mrs Okafor, will send the September HMO remittances by Friday; the head of nursing asked whether night staffing is in scope, and nobody answered; your engagement manager will send a revised timeline by Wednesday; the MD wants a recommendation on whether to close the loss-making physiotherapy unit or move it to a smaller room, and needs it before the board on the 20th. Write the minutes for the description field (decisions, actions with owner and date, open questions). Then list which items go on the commitments register (with who owes them), which goes on the decisions register (draft its background, options, recommendation and cost of delay, inventing plausible numbers), and which should become a project update, saying whether it should be visible to the client.",
          },
        ],
      },
      resources: { tools: ["Projects", "Meetings", "Commitments", "Decisions", "Client portal"] },
      questions: [
        {
          question:
            "Your engagement manager is suddenly off for two weeks. Which state of the project page best shows the record has been kept properly?",
          options: [
            { id: "a", text: "Every WhatsApp message with the client has been forwarded to the replacement", isCorrect: false },
            { id: "b", text: "The replacement can be briefed from the project page alone: dated updates, current deliverable states, open commitments and recent meeting minutes", isCorrect: true },
            { id: "c", text: "All updates have been switched to visible so the client's own team can brief the replacement on where the engagement has got to and what is outstanding", isCorrect: false },
            { id: "d", text: "You have written a long handover email to the replacement covering everything that has happened on the engagement since kick-off, with attachments", isCorrect: false },
          ],
          explanation:
            "The test of the record is whether someone can pick up from it without phoning you. A handover email is a patch for a record that was not kept, and it is lost the moment it is sent.",
        },
        {
          question:
            "Nuru's draft for a client call lists: \"Hospital administrator to send staff list by Friday.\" You clearly heard the HR officer, Mr Bello, take it on. What should you do when confirming the notes?",
          options: [
            { id: "a", text: "Confirm the notes as drafted, since the transcript is the authoritative record", isCorrect: false },
            { id: "b", text: "Remove the commitment, because a wrong draft cannot be trusted", isCorrect: false },
            { id: "c", text: "Correct the owner to Mr Bello and keep the date, then confirm", isCorrect: true },
            { id: "d", text: "Leave it unconfirmed and message Mr Bello directly", isCorrect: false },
          ],
          explanation:
            "Drafted commitments are only recorded once a person confirms them, and each line can be corrected, kept or removed. A misheard owner left in place becomes a week of chasing the wrong person.",
        },
        {
          question:
            "A client's finance director promised the payroll extract for the 7th. It is the 22nd, and the register shows it has been chased four times. What is the most useful next step?",
          options: [
            { id: "a", text: "Raise it with your engagement manager, because repeated chasing suggests a problem that another reminder will not solve", isCorrect: true },
            { id: "b", text: "Chase a fifth time, copying his managing director and the head of finance, and press Chased today so the count stays accurate", isCorrect: false },
            { id: "c", text: "Mark it Dropped so it stops showing as overdue", isCorrect: false },
            { id: "d", text: "Mark it Honoured, since he has confirmed again that it is coming", isCorrect: false },
          ],
          explanation:
            "A commitment chased four times is the debtor's problem and often a sign of something else, which needs a different conversation. Dropping it to clear the list hides exactly the signal the register exists to show.",
        },
        {
          question:
            "An HMO officer promised a revised tariff schedule by 30 September. On 2 October she emails to say it will come \"next week\". How should the commitment be recorded?",
          options: [
            { id: "a", text: "Honoured, because she has responded", isCorrect: false },
            { id: "b", text: "Dropped, because the date has moved", isCorrect: false },
            { id: "c", text: "Deleted and recorded again with the new date, so the register stays clean and only shows what is currently expected", isCorrect: false },
            { id: "d", text: "Missed against the original date, with a new commitment or note for the revised date", isCorrect: true },
          ],
          explanation:
            "Honoured means the thing arrived, and a fresh promise is not delivery; the original date passed undelivered, which is Missed. Deleting and re-recording erases the history that shows how often this payor slips.",
        },
        {
          question:
            "You are raising a decision for the managing partner about whether to accept a client's request to add a second site to scope. Which background meets the register's standard?",
          options: [
            { id: "a", text: "\"Client wants the second site added. Can we discuss?\"", isCorrect: false },
            { id: "b", text: "The full email chain with the client pasted in, so the principal has every detail of what was said and can read the context for themselves", isCorrect: false },
            { id: "c", text: "The request, the extra days it needs, the effect on the current timeline, what the client said about budget, and the date they need an answer", isCorrect: true },
            { id: "d", text: "A note that the engagement manager supports it", isCorrect: false },
          ],
          explanation:
            "The background should let the principal decide without asking you a question. An email chain makes them do the synthesis that raising the decision was meant to do.",
        },
        {
          question:
            "Why is the cost of delay field worth filling in, even though the form marks it optional?",
          options: [
            { id: "a", text: "It makes the price of deferring visible at the moment someone is tempted to defer", isCorrect: true },
            { id: "b", text: "The decision cannot be marked Decided without it", isCorrect: false },
            { id: "c", text: "It is shown to the client in the portal", isCorrect: false },
            { id: "d", text: "It sets the due date automatically", isCorrect: false },
          ],
          explanation:
            "Cost of delay turns \"let's look at it next week\" into a visible trade-off, which is why it gets things decided. What the Decided outcome requires is a written outcome, not this field.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A client's managing director logs in to the portal. Which of these can she see? Select all that apply.",
          options: [
            { id: "a", text: "A deliverable in Draft status, by name and status", isCorrect: true },
            { id: "b", text: "The commitments register entry recording that her finance director missed a date", isCorrect: false },
            { id: "c", text: "A comment a C4A consultant left on a deliverable's thread", isCorrect: true },
            { id: "d", text: "The reviewer's quality score out of 10 for a deliverable", isCorrect: false },
            { id: "e", text: "Payment milestones and what is pending", isCorrect: true },
          ],
          explanation:
            "The portal lists every deliverable with its status, shows deliverable comment threads including staff comments, and shows payment milestones. The registers and review scores stay internal.",
        },
        {
          question:
            "You are writing a project update after a difficult week. Which version is fit to switch to visible for the client?",
          options: [
            { id: "a", text: "\"Ward C night roster is short again this month because the new nursing supervisor did not plan it properly and ignored our advice.\"", isCorrect: false },
            { id: "b", text: "\"Discharge pilot milestone met on 14 October: average discharge time on Wards A and B down from 6.5 to 4 hours over two weeks.\"", isCorrect: true },
            { id: "c", text: "\"Frustrating week, data still not received from finance despite repeated requests.\"", isCorrect: false },
            { id: "d", text: "\"Internal: EM to discuss scope creep with partner before telling client.\"", isCorrect: false },
          ],
          explanation:
            "Client-visible updates should be factual, dated and safe to have quoted back. Naming a junior member of the client's staff in a failure, or venting about the client, belongs nowhere near the portal.",
        },
        {
          question:
            "A site walk-round with the matron was not transcribed. What should the minutes you write into the meeting's description field contain?",
          options: [
            { id: "a", text: "A full narrative of who said what, in order", isCorrect: false },
            { id: "b", text: "Your impressions of the staff you met", isCorrect: false },
            { id: "c", text: "Nothing, because untranscribed meetings are not part of the record", isCorrect: false },
            { id: "d", text: "Decisions taken, actions each with one owner and a date, and open questions with who will answer them", isCorrect: true },
          ],
          explanation:
            "Good minutes are short and drive action through decisions, owned actions and open questions. A narrative transcript buries the three things anyone will look for.",
        },
        {
          question:
            "Your reviewer disagrees with your conclusion on a deliverable and you want to argue the point. Where should that discussion happen?",
          options: [
            { id: "a", text: "In the deliverable's comment thread, so there is a full written record of the disagreement next to the work itself", isCorrect: false },
            { id: "b", text: "In the review notes and in direct conversation, not on the deliverable's comment thread, which the client can read", isCorrect: true },
            { id: "c", text: "In a project update marked visible, so the client can weigh in", isCorrect: false },
            { id: "d", text: "In the commitments register, as a promise to resolve it", isCorrect: false },
          ],
          explanation:
            "The deliverable's comment thread is visible to the client, so internal disagreement there is a disagreement in front of the client. The review step carries the reviewer's notes for exactly this.",
        },
      ],
    },
    {
      slug: "platform-knowledge-reuse",
      name: "Finding and Reusing Firm Knowledge",
      description:
        "Where C4A's knowledge lives on the platform (the knowledge base, the asset library, methodology pages, playbooks and debriefs), how to find what already exists, and how to file what you made so the next person finds it.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Where firm knowledge lives",
            body:
              "Firm knowledge sits in four places on the platform, and each holds a different kind of thing. Knowing which to search saves an afternoon.\n\nThe Knowledge base, under Knowledge, holds what consultants learn on engagements: insights, frameworks, templates, case studies, lessons learned, tools and guides. Any member of staff can add to it. Each item has a title, a type, a body, tags, an optional link to the engagement it came from and an optional file link. It can be marked as reusable, and it can be marked visible to clients, in which case it appears in the client portal's Knowledge section.\n\nThe Asset library is the curated shelf. It holds frameworks, templates, models, checklists, datasets, case studies and playbooks that the firm stands behind. Each asset carries a maturity (Draft, Validated, Battle-tested or Retired), tags for the practice stream it belongs to, the problem it solves and the geography it fits, a file type, a version number, and counts of views, downloads and engagements that have used it. Associate directors and above add assets to the library, which is what keeps it curated.\n\nMethodology, reached from Knowledge, holds the firm's engagement methods. Each methodology template sets out its phases with typical weeks, key activities, key deliverables and the gates between phases, with the criteria for each gate. Alongside sit framework templates with their dimensions and a guide to using them.\n\nThe fourth place is inside each engagement: its Playbook and Debrief tabs. The playbook records how this engagement will be run and which library assets it uses in each phase. The debrief records what happened, and is where new knowledge starts its way into the library.\n\nA rough guide to where to look:\n- How should this kind of engagement run? Methodology.\n- Is there a tested tool for this problem? Asset library.\n- Has anyone seen this situation before? Knowledge base, then debriefs.",
          },
          {
            title: "Search before you build",
            body:
              "Before you build any analysis, model or template, spend fifteen minutes searching for one that exists. A similar piece has very likely been done before, and adapting it is faster and usually better, because it has already been through review.\n\nSearch by the problem, not by the client. A revenue leakage review at a 120-bed hospital in Abuja is a search for \"revenue leakage\", \"charge capture\" or \"pharmacy reconciliation\", filtered to the hospital operations stream. Searching for the name of a past client will find little and may take you somewhere you should not be.\n\nThen judge what you find. Three signals matter in the asset library:\n- Maturity. Battle-tested means used successfully on several engagements. Validated means reviewed and approved but less used. Draft means work in progress; use it with care. Retired means do not use it, even if it looks right.\n- Use. An asset with 9 engagement associations and frequent downloads has been tested against real hospitals. One with none has not.\n- Fit. Check the geography and problem tags. A staffing model built for a 400-bed teaching hospital with resident doctors will mislead a 60-bed private hospital run on locum consultants.\n\nAdapting is not copying. When you take a template from a past engagement, remove everything specific to that client: names, logos, figures, staff titles, the hospital's own jargon. Re-check every number and assumption against your client's own data, because an occupancy target or HMO tariff carried over from another state is a quiet error. Check the local context: payor mix, state regulator, power supply, which cadres are actually available.\n\nIf what you need does not exist, say so. Tell your engagement manager that you are building it, so that it can be filed properly afterwards, and look at the nearest thing in the library anyway, because its structure may still save you time.",
          },
          {
            title: "Filing what you made",
            body:
              "Work that is not filed is lost when the engagement ends, so filing is part of finishing, not an extra. A knowledge base entry should let a stranger use your work without phoning you.\n\nGive it a title that says what it is and where it applies. \"Discharge delay root causes, private hospitals of 80 to 150 beds, Lagos\" is findable. \"Ward analysis v2\" is not. Choose the type honestly: an insight is something learned; a framework is a way of structuring a problem; a template is something to fill in; a lesson learned is what to do differently next time. Add tags that match how people search: the problem, the department, the type of facility, the state or region.\n\nThe body should cover four things in a few short paragraphs: the problem it addresses, how it was used, what to watch out for, and who to ask. Link it to the engagement it came from, so anyone with access can see the context. Attach or link the file.\n\nTwo switches need care.\n- Mark as reusable only if someone else could use it without the original engagement in front of them. A model full of one client's hard-coded figures is not reusable until those are inputs.\n- Mark as visible to clients only if the item is genuinely meant for clients and contains nothing from any other client. An entry not linked to an engagement appears in the Knowledge section of every client's portal; one linked to an engagement appears for that engagement's client.\n\nAnonymise before you file. Remove client names, people's names and any figure that would identify the hospital: a 212-bed hospital in Owerri with a named HMO mix is identifiable to anyone in the market. Never file patient data of any kind; the Nigeria Data Protection Act 2023 treats health data as sensitive, and the knowledge base has no lawful reason to hold it.\n\nFile documents with the naming convention set out in Using the CFA Platform, so the version a colleague opens is the right one.",
          },
          {
            title: "Playbooks and debriefs close the loop",
            body:
              "The playbook at the start of an engagement and the debrief at the end are how knowledge moves from one engagement to the next. Skipping either breaks the chain.\n\nThe playbook records which methodology template the engagement follows, and for each phase the activities, the library assets to be used, the owner and the expected outputs. Linking assets to phases does two things: the team knows exactly which checklist or model to use in week three, and the library's count of engagements using each asset stays honest, which is how other consultants judge what is tested.\n\nThe debrief is written when the engagement closes. It has structured sections:\n- A summary of the problem, the approach and the outcome.\n- What worked: each technique, a description and how reusable it is.\n- What failed: each issue, its root cause and what to do next time.\n- The client context that shaped the work.\n- New assets created during the engagement, waiting to be submitted to the library.\n- Sector insights, each with its geography, practice stream and how confident the team is in it.\n\nThe debrief also records, for each library asset, whether the engagement used it, created it or improved it. It moves from Pending to Submitted to Reviewed, and finally to Insights extracted, once the useful parts have gone into the knowledge base and library.\n\nThe section people write worst is what failed. \"Data collection was slow\" helps nobody. \"Finance would not release HMO remittances until the MD signed a data request; we asked in week four; ask in the kick-off meeting and get the MD's signature on day one\" will save the next team three weeks. Write failures about the method and the brief, not about named individuals, and remember that the debrief may be read by people who know the client.",
          },
        ],
        exercises: [
          {
            title: "Search, judge, adapt, file",
            instruction:
              "You have been asked to build a charge capture checklist for a 95-bed hospital in Kaduna whose pharmacy and laboratory revenue looks low against patient volumes. In the asset library you find three candidates: a Battle-tested \"Revenue leakage checklist\" used on 7 engagements and tagged hospital operations, Nigeria; a Validated \"Charge capture audit tool\" built for a 350-bed teaching hospital in Ghana; and a Draft \"Pharmacy reconciliation sheet\" with no engagement associations. Say which you would start from and why, and list five things you would change or re-check before using it. Then, assuming you improved it materially, write the knowledge base entry you would file afterwards: title, type, tags, a body of no more than 150 words, and whether you would mark it reusable and client visible.",
          },
        ],
      },
      resources: { tools: ["Knowledge base", "Asset library", "Methodology", "Engagement playbook", "Engagement debrief"] },
      questions: [
        {
          question:
            "You are about to start a revenue leakage review at a 120-bed hospital in Abuja. What should you search for first?",
          options: [
            { id: "a", text: "The name of the last hospital the firm did a similar review for, so you can open that engagement's files and follow what was done there step by step", isCorrect: false },
            { id: "b", text: "A general internet search for revenue leakage reports", isCorrect: false },
            { id: "c", text: "The problem itself, such as revenue leakage or charge capture, filtered to the hospital operations stream", isCorrect: true },
            { id: "d", text: "Nothing yet; build the analysis first and compare it with the library later", isCorrect: false },
          ],
          explanation:
            "Assets are tagged by problem and stream, so searching by problem finds the tested tools. Searching by a past client's name finds little and can lead into another client's confidential work.",
        },
        {
          question:
            "Two assets fit your problem: a Battle-tested checklist used on 8 engagements, and a newer Draft version of the same checklist uploaded last month with no engagement associations. Which should you use on a client engagement?",
          options: [
            { id: "a", text: "The Battle-tested checklist, adapted to the client, and ask the author about the draft", isCorrect: true },
            { id: "b", text: "The Draft, because newer is always more up to date", isCorrect: false },
            { id: "c", text: "Both, running them side by side and letting the client choose whichever gives the clearer picture of the problem", isCorrect: false },
            { id: "d", text: "Neither; build your own so the client gets original work", isCorrect: false },
          ],
          explanation:
            "Maturity and use are the signals of what has been tested against real hospitals. A Draft may be better, but you find that out by asking its author, not by testing it on a client.",
        },
        {
          question:
            "An asset in the library looks exactly right for your engagement, but its maturity is Retired. What should you do?",
          options: [
            { id: "a", text: "Use it, since retirement only means it is old", isCorrect: false },
            { id: "b", text: "Use it but remove the Retired label from your copy", isCorrect: false },
            { id: "c", text: "Use it only for internal working analysis, never in client deliverables, since nobody outside the firm will know it was retired", isCorrect: false },
            { id: "d", text: "Do not use it, and look for what replaced it or ask why it was retired", isCorrect: true },
          ],
          explanation:
            "Retired means the firm no longer stands behind it, often because a method or regulation changed. Using it internally still lets its errors into your analysis.",
        },
        {
          question:
            "You want to reuse a staffing model built for a 400-bed teaching hospital with resident doctors on a 60-bed private hospital that runs on visiting consultants. What is the main risk?",
          options: [
            { id: "a", text: "The model will be too long for the client to read", isCorrect: false },
            { id: "b", text: "Its structure and assumptions fit a different kind of facility, so the outputs could mislead even if the formulas work", isCorrect: true },
            { id: "c", text: "The file type may not open on the client's computers", isCorrect: false },
            { id: "d", text: "There is no real risk, because a Battle-tested model has already been proven on several engagements and its formulas have been reviewed", isCorrect: false },
          ],
          explanation:
            "Fit is the third test after maturity and use; a tested tool can still be wrong for a different facility. Battle-tested describes how often it has worked in its own setting, not yours.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "You are adapting a tariff template from a past engagement for a new client in Kano. Which steps are necessary? Select all that apply.",
          options: [
            { id: "a", text: "Remove the previous client's name, logo and staff titles", isCorrect: true },
            { id: "b", text: "Re-check every tariff and assumption against the new client's own data", isCorrect: true },
            { id: "c", text: "Keep the previous client's figures as a benchmark in a hidden tab", isCorrect: false },
            { id: "d", text: "Check the local context, such as payor mix and state scheme arrangements", isCorrect: true },
          ],
          explanation:
            "Adapting means removing the old client, re-checking the numbers and fitting local context. A hidden tab of another client's figures is still that client's confidential data, and hidden tabs are easy to send by mistake.",
        },
        {
          question:
            "Which knowledge base title will the next consultant most easily find and trust?",
          options: [
            { id: "a", text: "\"Ward analysis v2 FINAL\"", isCorrect: false },
            { id: "b", text: "\"Great insight from our recent work\"", isCorrect: false },
            { id: "c", text: "\"Discharge delay root causes, private hospitals of 80 to 150 beds, Lagos\"", isCorrect: true },
            { id: "d", text: "The name of the client and the month", isCorrect: false },
          ],
          explanation:
            "A title should say what the item is and where it applies, which is how people search. A client's name in the title makes it neither findable by problem nor safe to share.",
        },
        {
          question:
            "You built a cash-flow model for one client with that client's figures typed directly into the formulas. Should you mark the knowledge base entry as reusable?",
          options: [
            { id: "a", text: "Yes, because any model is reusable once it is filed", isCorrect: false },
            { id: "b", text: "Yes, as long as you also mark it visible to clients so they can check the figures for themselves", isCorrect: false },
            { id: "c", text: "No, and do not file it at all", isCorrect: false },
            { id: "d", text: "Not yet: turn the hard-coded figures into labelled inputs and remove the client's data first", isCorrect: true },
          ],
          explanation:
            "Reusable means someone else can use it without the original engagement in front of them, which a model full of one client's figures does not allow. Filing it is still worth doing once it is cleaned.",
        },
        {
          question:
            "A consultant marks a knowledge entry visible to clients. Where will it appear?",
          options: [
            { id: "a", text: "In the Knowledge section of every client's portal, subject to any engagement link", isCorrect: true },
            { id: "b", text: "Only in the portal of the client it came from", isCorrect: false },
            { id: "c", text: "Nowhere until a partner approves it", isCorrect: false },
            { id: "d", text: "On the firm's public website", isCorrect: false },
          ],
          explanation:
            "Client-visible knowledge appears in the portal's Knowledge section for clients, which is why it must contain nothing from any other client. Assuming only the source client sees it is the mistake that leaks one client's work to another.",
        },
        {
          question:
            "Which \"what failed\" entry in a debrief is most useful to the next team?",
          options: [
            { id: "a", text: "\"Data collection was slow.\"", isCorrect: false },
            { id: "b", text: "\"Finance would not release HMO remittances without the MD's signed data request; we asked in week four; get the signature at kick-off.\"", isCorrect: true },
            { id: "c", text: "\"The finance manager was uncooperative throughout.\"", isCorrect: false },
            { id: "d", text: "\"Everything went well apart from some minor delays in getting data, which are normal on any hospital engagement.\"", isCorrect: false },
          ],
          explanation:
            "A useful failure entry states the issue, its root cause and what to do next time. Blaming a named person teaches nothing about the method and may reach the person it describes.",
        },
        {
          question:
            "Why does linking library assets to phases in the engagement playbook matter beyond your own engagement?",
          options: [
            { id: "a", text: "It sends the assets to the client automatically", isCorrect: false },
            { id: "b", text: "It is required before timesheets can be approved", isCorrect: false },
            { id: "c", text: "It keeps the library's count of engagements using each asset honest, which is how others judge what is tested", isCorrect: true },
            { id: "d", text: "It changes the asset's maturity to Battle-tested", isCorrect: false },
          ],
          explanation:
            "The engagement association count is one of the signals other consultants use to judge an asset. Maturity is set by review, not by linking.",
        },
      ],
    },
  ],
};

export default expansion;
