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
  slug: "cfa-master-consultant",

  topUp: [
    {
      moduleSlug: "complex-engagement-leadership",
      questions: [
        q(
          "Month 3 of a four-workstream transformation at a 250-bed hospital. Clinical operations recommends outsourcing the outpatient pharmacy; the finance workstream has found it is the highest-margin service line. The steering committee meets in ten days. What should the Master Consultant do?",
          "c",
          [
            "Present both recommendations to the steering committee with the evidence for each, and let the chief executive choose between them",
            "Back the finance workstream, because a measured margin is firmer evidence than an operational view",
            "Bring both leads together on a joint analysis of what outsourcing would change, and take one integrated recommendation",
            "Ask the clinical operations lead to drop the recommendation so the engagement speaks with one voice",
          ],
          "Integration is the Master Consultant's job: the conflict is resolved inside the team on shared evidence, so the client receives one coherent answer. Handing both views to the chief executive is tempting because it looks transparent, but it exports the firm's unfinished thinking to the client."
        ),
        q(
          "Your finance workstream lead has twice discussed data access with the hospital's head of finance, who still will not release the payroll file. The baseline is due in three weeks. What is the right next step under the tiered escalation approach?",
          "a",
          [
            "Raise it at the steering committee with a clear problem statement and options for resolving it",
            "Ask C4A's senior partner to call the hospital's board chair today, since the matter is now urgent",
            "Have the workstream lead try a third time with a more detailed justification",
            "Rebuild the payroll baseline from bank statements and say nothing further",
          ],
          "Level 1 has been tried and failed, so the issue goes to Level 2, the steering committee, with options. Jumping to Level 3 is tempting because it feels decisive, but firm-to-firm escalation over a routine data request spends senior credit and bypasses the forum built for this."
        ),
        q(
          "You must tell a chief executive that his management style is the main driver of nursing turnover. In the 'prepare' step, what should you do?",
          "d",
          [
            "Draft a full script so that the conversation cannot drift away from the message the team has agreed in advance",
            "Ask the head of nursing to attend so that she can confirm what staff have said",
            "Send him the exit interview summaries in advance so he is not surprised in the room",
            "Assemble evidence he cannot reasonably dispute and test the message with a trusted adviser",
          ],
          "Preparation means facts that hold up and a message that has been tested on someone you trust. Sending the exit interviews ahead is tempting as a courtesy, but it lets him react alone to raw material before you can frame it around shared objectives."
        ),
        q(
          "A senior paediatrician joins your team as subject expert on her first consulting engagement. Her slides are clinically excellent but have topic titles and no clear message. The pack goes to the client in three days. What does active development look like here?",
          "b",
          [
            "Rewrite her slides yourself tonight, since a three-day deadline does not leave enough room for teaching her the method",
            "Review one slide with her in detail, show what an action title does, and have her redo the rest",
            "Ask a junior consultant to reformat her slides so that she can stay on clinical content",
            "Leave the slides as they are, because her clinical authority will carry them with the client",
          ],
          "Active development uses the live deliverable as the teaching moment, and three days is enough for her to fix her own slides once shown how. Rewriting them yourself is tempting under pressure, but you will be rewriting them again on the next engagement."
        ),
        q(
          "Two consultants have worked every weekend for six weeks on a six-month engagement and one has started missing internal deadlines. It is month 3. What is the right response?",
          "a",
          [
            "Re-sequence the work now and, if needed, agree a revised date or scope with the client",
            "Promise both of them extra leave at the end of the engagement in recognition of the effort",
            "Ask them to keep going until the next milestone and review the position then",
            "Replace the consultant who is missing deadlines with someone from another engagement",
          ],
          "Team protection means changing the workload while the engagement still has three months to run. Promising leave at the end is the tempting answer because it rewards effort, but it leaves the cause in place and risks losing a team member mid-engagement."
        ),
      ],
    },
    {
      moduleSlug: "cfa-proprietary-programmes",
      questions: [
        q(
          "A 120-bed private hospital is four months behind on salaries, its two main suppliers have stopped credit and its bank has called a meeting. The owners want help. Which programme fits first?",
          "b",
          [
            "The Hospital Excellence Programme, because the hospital needs a comprehensive improvement across every function",
            "The Turnaround Programme, with its 90-day diagnostic-to-action cycle",
            "Clinical Governance Transformation, to stabilise care while finances recover",
            "Health Systems Advisory, because the bank and suppliers are external stakeholders",
          ],
          "A hospital in acute financial distress needs the intensive Turnaround Programme and its 90-day cycle. Hospital Excellence is tempting because the problems are broad, but a 12 to 18 month improvement programme is too slow for a hospital that may not make payroll next month."
        ),
        q(
          "You are delivering the Turnaround Programme at a state-owned hospital whose management accounts have not been produced for two years. What comes first in the financial restructuring work?",
          "d",
          [
            "Benchmarking the hospital's costs against comparable state hospitals",
            "Agreeing a recovery budget with the state ministry of health",
            "Asking the hospital to commission a full external audit of the last two years before any restructuring work starts",
            "Reconstructing the financial picture from bank statements, procurement records and payroll",
          ],
          "The restructuring module assumes financial data that does not exist here, so the first step is to rebuild it from primary records. Commissioning an audit first is tempting because it sounds rigorous, but it would take months and stall the 90-day cycle."
        ),
        q(
          "A hospital's medical director has resigned, mortality and morbidity meetings have stopped, and consultants report to nobody. The board will take nine months to recruit a replacement. Which programme fits?",
          "c",
          [
            "Clinical Governance Transformation, to rebuild the governance structures from the ground up",
            "The Hospital Excellence Programme, starting with its clinical quality workstream",
            "Embedded Medical Director, placing a C4A clinician-consultant as interim medical director",
            "The Turnaround Programme, because the hospital is failing operationally",
          ],
          "The gap is clinical leadership itself, which is what the Embedded Medical Director programme fills. Clinical Governance Transformation is tempting because governance has lapsed, but structures need a leader to run them, and that leader is what is missing."
        ),
        q(
          "Near the end of the Deliver phase, a hospital's chief executive asks to drop the Sustain phase to save money. What should the Master Consultant say?",
          "a",
          [
            "Explain that Sustain embeds the monitoring and champions that make changes last, and propose a lighter, tapering version",
            "Agree, since the improvements are already in place and the client has the right to stop",
            "Refuse, because Sustain is a fixed part of every C4A programme and cannot be removed",
            "Agree, and offer to return for a fresh diagnostic in a year if results slip",
          ],
          "Sustain is what keeps improvements in place after the firm leaves, and its intensity already decreases over time, so a lighter version keeps the essentials. Simply agreeing is tempting because it respects the client's budget, but improvements without monitoring and trained champions tend to fade."
        ),
        q(
          "A hospital in financial distress also has weak clinical governance: no incident reporting and no clinical audit. How should the engagement be designed?",
          "c",
          [
            "Run the Turnaround Programme first and start Clinical Governance Transformation once finances are stable",
            "Run both programmes in parallel, each with its own team and its own steering committee",
            "Design one integrated engagement that draws on both methodologies and removes duplication",
            "Run Clinical Governance Transformation first, since patient safety comes before finance",
          ],
          "A hospital needing turnaround almost always needs governance work too, and an integrated design avoids two teams interviewing the same people and producing competing plans. Running them in sequence is tempting because it looks orderly, but it leaves safety risks unaddressed through the turnaround."
        ),
      ],
    },
    {
      moduleSlug: "business-development-thought-leadership",
      questions: [
        q(
          "Your revenue target for next year is N400m. Your qualified pipeline stands at N600m. What does this tell you?",
          "b",
          [
            "The pipeline is healthy, because it is half as large again as the target and every opportunity in it has been qualified",
            "The pipeline is too thin; at normal win rates it should be about three to four times the target",
            "The pipeline is too large and should be cut to focus on the best opportunities",
            "Nothing yet, because pipeline value only matters once proposals are submitted",
          ],
          "With typical win rates, a pipeline of 3 to 4 times target is needed, here roughly N1.2bn to N1.6bn. 1.5 times feels comfortable because it exceeds the target, but at a 30% win rate it would deliver well under half of it."
        ),
        q(
          "A state hospital's tender asks for help selecting an EMR. In pre-bid meetings you learn that its revenue losses come from a billing process that no system would fix on its own. How should the proposal handle this?",
          "d",
          [
            "Answer the tender strictly as written, since departing from it risks disqualification",
            "Decline to bid, because the tender asks for the wrong thing and the client will be disappointed",
            "Propose a billing process engagement instead, and explain why the EMR is not needed",
            "Answer the EMR request and show how a short billing process review makes the selection pay off",
          ],
          "A strong proposal meets the stated requirement and addresses the real need behind it. Bidding strictly to the letter is tempting because it is safe on compliance, but it competes on price against firms offering the same thing and misses the reason the client is losing money."
        ),
        q(
          "You have a 20-minute slot at a hospital leaders' conference in Abuja. How should you open?",
          "a",
          [
            "With a specific, surprising finding from anonymised engagement data and what it means for the room",
            "With a short overview of C4A, its six programmes and the hospitals and governments it has served across the region",
            "With the agenda and the three topics you will cover, so the audience can follow",
            "With the national health statistics that frame the problem for policymakers",
          ],
          "Lead with a provocative insight the audience can use; that is what earns follow-up conversations. The company overview is the tempting opener because it introduces the firm, but it loses the room in the first two minutes."
        ),
        q(
          "You exchanged cards with nine hospital chief executives and directors at a conference on Thursday. What should happen next?",
          "c",
          [
            "Add them all to the newsletter list so they receive C4A's publications",
            "Wait two weeks so the follow-up does not look over-eager, then email each of them with C4A's capability statement",
            "Follow up personally with each meaningful contact by Saturday, referring to what you discussed",
            "Send each of them a proposal for a diagnostic within the week",
          ],
          "Follow up within 48 hours while the conversation is fresh; the value of speaking is the relationships it creates. Waiting to avoid seeming eager is tempting, but by then most contacts no longer remember the conversation."
        ),
        q(
          "Select all that apply. Most of C4A's engagements come from repeat clients and referrals. Which activities follow most directly from that?",
          "bd",
          [
            "Registering on every public tender portal and bidding widely",
            "A quarterly check-in call with each former client",
            "Buying contact lists of hospital chief executives for cold email",
            "Serving on advisory boards and in professional associations",
            "Cutting fees on repeat work to keep former clients loyal",
          ],
          "If repeat and referral work drives the pipeline, time goes into keeping relationships warm and being present where leaders meet. Wide tender bidding is tempting because it adds volume, but competitive bids win far less often than relationship work."
        ),
      ],
    },
  ],

  modules: [
    {
      slug: "boards-owners-stakeholders",
      name: "Boards, Owners and Stakeholder Politics",
      description:
        "How decisions are really made in family-owned and founder-led hospitals, how to work with a board split between two families, and how to run a fair process so people accept outcomes they did not want.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Formal authority and real authority",
            body: p(
              `In most Nigerian private hospitals the organisation chart and the way decisions are actually made are two different documents. A Master Consultant needs both, and needs them in the first fortnight.`,
              `Formal authority runs from the shareholders in general meeting, to the board, whose directors owe their duties to the company under the Companies and Allied Matters Act 2020, to management: the managing director or chief executive and the medical director. Real authority often sits elsewhere. The founder's spouse may hold the bank mandate. The senior surgeon whose patients fill two of three theatres can make any scheduling rule fail. A son or daughter back from training abroad may have the founder's ear on every capital decision without holding any formal role.`,
              `Map each person on four things: formal authority, informal influence, what they gain or lose from the likely recommendations, and where they stand today. Then look for the signals that reveal real power:
- Who signs cheques and holds the bank mandate.
- Who can hire and dismiss senior staff in practice.
- Whose patients generate the revenue.
- Who staff go to when they want something done.`,
              `The fastest test is to trace the last large decision. Ask how the hospital came to buy its CT scanner, open its second site or replace its last administrator. Who raised it, who was consulted, who said yes, how long it took and who could have stopped it. The answer is usually more honest than any description of governance you will be given, and it shows you the route your own recommendations must travel.`,
              `Then ask one question of every major recommendation: if the chief executive approved this and that person objected, would it happen? If the answer is no, that person is a decision-maker whatever the chart says, and must be engaged before the recommendation is put, not after.`
            ),
          },
          {
            title: "The founder-doctor",
            body: p(
              `Many private hospitals in Nigeria were built by a clinician who is still the managing director, the majority shareholder, the busiest consultant and the personal guarantor of the bank loan. The hospital is part of his or her identity, and that shapes every conversation about change.`,
              `The pattern is familiar. Decisions run through one desk: every purchase above a modest threshold, every senior hire, every price change. Management roles are filled by family members or long-serving loyalists. Succession has not been discussed because discussing it means discussing mortality and the end of a career. Growth is capped by the founder's hours, and the hospital's systems are built around one person's memory.`,
              `Working well with a founder starts with separating two roles that have merged: the clinician, whose authority is real and should be respected, and the manager, whose methods may be the constraint. Findings that implicate the founder go to the founder first, privately, with evidence, and before anyone else in the hospital sees them. Frame them around what the founder wants: a hospital that outlives its founder, a legacy, the next phase of growth. "Consumables approvals take three weeks because they all need your signature" lands better as "the hospital has outgrown a system where you approve everything, and it is costing you theatre time."`,
              `Offer roles that keep status while moving management: chair of the board, clinical director, head of a centre of excellence. Give the founder authorship of the solution; a plan the founder has shaped is a plan the founder will defend.`,
              `Two mistakes are common. One is going around the founder to the children or senior staff to build pressure; it is usually discovered and ends the engagement. The other is expecting speed. Moving a founder from running everything to governing takes one to three years in stages, and the engagement design should say so.`
            ),
          },
          {
            title: "Two-family and multi-owner boards",
            body: p(
              `Hospitals founded by two doctors, or merged between two families, often end up with near-equal shareholdings and directors appointed by each side. These boards can work for decades and then deadlock over a single decision, usually succession, a large investment or money taken out in the past.`,
              `The risks for a consultant are specific. Each family may treat you as its agent. One family often runs operations day to day while the other sees only board papers, so the two sides hold different information. Old disputes about related-party contracts, drawings or salaries sit beneath every new discussion. Whatever you recommend, one side will read it as taking the other's part.`,
              `A few rules hold up in practice:
- The client is the company, acting through its board, not either family. Write that into the engagement letter and repeat it at the first board meeting.
- Report through one line: the full board, or a committee with members from both families. Do not run separate briefings.
- Give everyone the same paper at the same time. A preview for one side is a gift the other will discover.
- If you speak to a director one-to-one, disclose that the conversation took place and its substance to the chair.
- A request to investigate one family's conduct is a different engagement, needing a board resolution and probably a different team. Do not slip it into the current scope.`,
              `Where the board is deadlocked, the consultant can recommend changes to governance but must never become the casting vote. Useful options include an independent chair acceptable to both families, one or two independent non-executive directors, a clear deadlock clause in the shareholders' agreement, or a defined referral to mediation. The Nigerian Code of Corporate Governance issued by the Financial Reporting Council is written for larger companies, but it is a sound reference for what a balanced board looks like and helps take the proposal out of the families' quarrel.`,
              `Your own independence is the asset that makes you useful to both sides. Guard it in small things: where you sit, who you travel with, which family's driver collects you.`
            ),
          },
          {
            title: "Fair process",
            body: p(
              `People accept decisions they dislike when they believe the process that produced them was fair. On a divided board or in a founder transition, a fair process is often worth more than the right answer, because an answer reached unfairly will be resisted until it fails.`,
              `W. Chan Kim and Renée Mauborgne described fair process in three parts:
- Engagement: involve the people affected, ask for their views and let them challenge the thinking.
- Explanation: explain the reasoning behind the final decision, including why some views were not adopted.
- Expectation clarity: state plainly what happens next, the new rules, targets and consequences.`,
              `Consensus is not one of the three. The aim is that everybody was heard and understands why, not that everybody agrees.`,
              `In practice, fair process on a board decision means a short list of disciplines. Agree the decision criteria and their weights before any options or names are on the table. Once two family candidates for chief executive are named, each side will judge every criterion by whether it favours its candidate. Give each party a structured hearing with the same questions and the same time. Use an evaluator both sides accept. Write down dissent and the reasons it was not followed. Explain the final decision in writing to everyone at once.`,
              `Consider a 110-bed hospital whose board is split 2 to 2 over appointing a chief executive. One family proposes the founder's son, a qualified accountant who has worked in UK finance; the other wants an external hire. A fair process agrees criteria first: hospital leadership experience, financial turnaround record, acceptability to the medical staff, commitment to stay five years. Both the internal and external candidates are then assessed against them by an independent panel, with the same interview for each. The son may well win. If he does, the other family can accept it because they set the test. If he loses, his family can accept it for the same reason.`,
              `Fair process takes longer at the start and much less time at the end, because people stop relitigating decisions they helped to frame.`
            ),
          },
        ],
        exercises: [
          {
            title: "A deadlocked two-family board",
            instruction:
              "Marina Crest Hospital in Lekki has 110 beds and revenue of about N2.4bn. It was founded in 2004 by Dr Femi Adebayo and Dr Ngozi Eze, whose family holding companies own 50% each. The board has four directors, two from each family, and no independent members. EBITDA margin has fallen from 18% to 7% in three years. Dr Adebayo, now 68, wants his son, a UK-trained accountant, as chief executive; the Eze family wants an external appointment. The board has been deadlocked for five months. Write a two-page plan: who the client is and how that is written into the engagement letter, the single reporting line, the decision criteria and how they will be agreed, the assessment process and timetable, and the governance changes you would recommend to prevent the next deadlock.",
          },
          {
            title: "The founder's first conversation",
            instruction:
              "At a 70-bed hospital in Enugu, your diagnostic shows that every purchase above N500,000 needs the founder's signature, and consumables orders wait an average of 19 days for it. In the last quarter 41 elective cases were postponed for missing consumables. The founder is 72, the busiest surgeon and has refused to discuss succession. Plan a private one-hour conversation with him: what evidence you bring, how you frame it, the role you propose he keeps, and the first change you ask him to authorise.",
          },
        ],
      },
      resources: { tools: ["Stakeholder power map", "Decision trace template", "Fair process checklist"] },
      questions: [
        q(
          "On a new engagement at a family-owned hospital, you want to know who really takes capital decisions. Which approach is most reliable?",
          "b",
          [
            "Ask the chief executive to describe the hospital's governance and delegation limits in detail",
            "Trace how the last large purchase was raised, approved and paid for",
            "Read the board minutes for the last three years",
            "Review the organisation chart and the directors' register",
          ],
          "Tracing a real decision shows who raised it, who could have stopped it and who signed, which is often different from the stated governance. Asking the chief executive is tempting because he should know, but he will describe how decisions are meant to be taken."
        ),
        q(
          "Your diagnostic shows the founder-doctor's personal approval of every purchase over N500,000 delays consumables by three weeks and has cost 41 elective cases in a quarter. How should the finding reach him?",
          "d",
          [
            "In the steering committee paper, so that the management team sees the evidence alongside him",
            "Through his daughter, the finance director, who is better placed to persuade him",
            "In the final report, so that it is part of the complete picture rather than singled out",
            "Privately and first, with the evidence, framed around what the hospital needs to grow",
          ],
          "Findings that implicate a founder go to the founder first, privately, with data and in terms of his own goals. Going through his daughter is tempting because she has influence, but going around the founder is usually discovered and can end the engagement."
        ),
        q(
          "On a board split equally between two families, one family's director calls and asks for a preview of your findings before the board meeting. What should you do?",
          "a",
          [
            "Decline, explain that all directors receive the paper at the same time, and tell the chair about the call",
            "Give him a short verbal outline only, since nothing in writing will pass between you and the paper itself stays confidential",
            "Agree, provided you offer the other family the same preview afterwards",
            "Agree, since he is a director and entitled to information about the company",
          ],
          "Equal information at the same time is what keeps you useful to both sides, and disclosing the call protects you. A verbal outline is tempting because it feels harmless, but the other family will learn of it and treat every later finding as partisan."
        ),
        q(
          "Who should the engagement letter name as the client for an engagement at a hospital owned 50/50 by two families?",
          "c",
          [
            "Both families jointly, with each family's holding company signing",
            "The family whose holding company is paying the fee",
            "The hospital company, acting through its board of directors",
            "The managing director, who will receive the deliverables",
          ],
          "Naming the company acting through its board keeps the consultant independent of either family and matches where directors' duties lie. Naming both families jointly is tempting because it seems balanced, but it makes you answerable to two principals who may disagree."
        ),
        q(
          "Select all that apply. Which are parts of fair process as described by Kim and Mauborgne?",
          "ace",
          [
            "Engagement: involving the people affected and letting them challenge the thinking",
            "Consensus: making sure every party agrees before a decision is final",
            "Explanation: setting out the reasoning behind the final decision",
            "Confidentiality: keeping the reasoning private to avoid reopening disputes",
            "Expectation clarity: stating the new rules, targets and consequences",
          ],
          "Fair process is engagement, explanation and expectation clarity. Consensus is the tempting addition, but fair process aims for people to be heard and understand the reasoning, not for everyone to agree."
        ),
        q(
          "A deadlocked board must choose between the founder's son and an external candidate for chief executive. Why agree the selection criteria before either candidate is assessed?",
          "b",
          [
            "So the consultant can design criteria that favour the stronger candidate",
            "Because once candidates are named, each side judges every criterion by whom it favours",
            "Because the Companies and Allied Matters Act requires criteria for executive appointments",
            "So the selection can be completed without involving the board",
          ],
          "Criteria set before names are on the table are judged on their merits, so both families can accept the outcome. The legal option is tempting because it sounds authoritative, but the reason is about how people judge fairness, not a statutory requirement."
        ),
        q(
          "A 72-year-old founder refuses to discuss succession, but the hospital's bank wants a management plan before renewing its facility. What approach is most likely to work?",
          "a",
          [
            "Frame it as protecting what he built, propose a role that keeps his status, and move management over in stages",
            "Ask his children to raise it with him at home, where he may be more open to it than with outsiders, and support them with a briefing",
            "Tell him the bank requires it, so the decision is taken out of his hands",
            "Draft the succession plan without him and present it to the board for approval",
          ],
          "Founders engage with succession when it serves their own goals and preserves their standing, and a staged move is realistic. Using the bank as the lever is tempting because it is true, but it makes the change something done to him, and he will resist it."
        ),
        q(
          "The chief executive has approved a new theatre scheduling rule. A senior surgeon whose patients make up 35% of theatre revenue opposes it. What should you do before it is rolled out?",
          "d",
          [
            "Proceed on the chief executive's authority, since the decision has been properly made",
            "Delay the rule until the surgeon retires or reduces his sessions",
            "Ask the board to instruct the surgeon to comply",
            "Meet the surgeon, hear his objections and give him a part in shaping the rule",
          ],
          "A surgeon with that share of revenue can make a rule fail in practice, so he is a decision-maker whatever the chart says. Relying on the chief executive's approval is tempting because it is formally sufficient, but formal approval does not survive informal resistance."
        ),
        q(
          "Midway through a strategy engagement, one family's directors ask you to look into contracts the other family's companies hold with the hospital. What should you do?",
          "c",
          [
            "Review the contracts quietly within the current scope, since they affect the strategy",
            "Refuse outright, because related-party matters are outside a consultant's competence",
            "Explain that this is a separate engagement needing a board resolution, and raise it with the chair",
            "Agree, provided the requesting family pays for the extra work separately and the findings go to the whole board",
          ],
          "An investigation into one family's conduct needs the board's authority and probably a different team; slipping it into scope would compromise your independence. Having the requesting family pay is tempting because it seems to settle the cost, but it makes you that family's agent."
        ),
        q(
          "A board split 2 to 2 between two families has been unable to appoint a chief executive for five months. What governance change is most appropriate to recommend?",
          "a",
          [
            "An independent chair acceptable to both families, with a clear deadlock clause",
            "Giving the consultant a casting vote until the appointment is made",
            "Letting the family whose members have served the hospital longer take this decision, with the other deciding the next one",
            "Adding a director from each family so that the board is larger",
          ],
          "An independent chair and a deadlock clause give the board a way to decide without either family winning by default. A consultant's casting vote is tempting as a quick fix, but it destroys the independence that makes the consultant useful and gives no lasting mechanism."
        ),
      ],
    },
    {
      slug: "scoping-pricing-engagements",
      name: "Scoping, Pricing and Protecting the Engagement",
      description:
        "Write a scope a third party could check, build a fee from resourced days, phase work behind a diagnostic, control changes, and set payment terms and a negotiating position that protect the firm.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "A scope a third party could check",
            body: p(
              `A good scope is written so that someone outside the engagement could read it at the end and say whether it was delivered. Most fee disputes begin with a scope that could not pass that test.`,
              `Write the scope as deliverables, not activities. "Support the hospital's revenue cycle improvement" describes effort and can never be finished. "A revenue leakage diagnostic covering inpatient, outpatient and pharmacy billing at the Surulere site for January to June, delivered as a written report and a board presentation in week 6" can be checked. For each deliverable, state its content, its form and how it is accepted.`,
              `Then write down what the work assumes. Typical assumptions on a hospital engagement:
- The number of sites, departments, interviews and workshops included.
- The data the client will provide, in what form and by when.
- The time of named client staff, for example four hours a week from the finance manager.
- Access to wards, theatres and systems.
- The number of review rounds on each deliverable, usually two.`,
              `List the exclusions just as clearly: implementation, recruitment, system configuration, other sites. An exclusion costs nothing to write and saves a difficult conversation later.`,
              `Remove the words that make a scope elastic: "support", "assist", "as required", "including but not limited to", "and related matters". Each one is an open door that a client under pressure will walk through, often in good faith.`,
              `Finally, say what happens if an assumption fails. If the client's data arrives three weeks late, does the timeline move, are extra days charged, or both? Writing the consequence into the engagement letter turns a future argument into an agreed mechanism. It also makes the client's own team take its commitments seriously, because the cost of missing them is visible from day one.`
            ),
          },
          {
            title: "Building the fee from resourced days",
            body: p(
              `Build the fee from the bottom up: for each phase, the days each role will spend, multiplied by the firm's published day rate for that role, plus a programme management charge, plus expenses, plus VAT. The build-up gives you a number you can defend line by line and shows you the true cost of delivery.`,
              `Take a ten-week diagnostic and plan at a 150-bed hospital, using illustrative rates. A partner for 8 days at N650,000, an engagement manager for 35 days at N420,000, two consultants for 40 days each at N280,000 and an analyst for 45 days at N140,000 come to about N48.6m of resourced time. With a programme management charge of 10% the professional fee is about N53.5m, before expenses and VAT at 7.5%.`,
              `Estimate days from the workplan, not from instinct, and add the time that never appears in an analysis list: client meetings, steering committees, internal review, travel between sites, and rework after client comments. On most hospital engagements this is a quarter to a third of the total. Teams that price only the analysis days deliver at a loss and blame the client.`,
              `Bottom-up pricing and value pricing answer different questions. The build-up tells you what the work costs and what it should be billed at. Value tells you whether the client ought to pay it. If the diagnostic is expected to find N150m a year of recoverable leakage, a fee of about N53.5m pays back within a year, and that is the argument to make. If the value is lower than the build-up, change the scope, not the rate.`,
              `Show the client resourced days by role and the published rates. Do not show internal costs, salaries or margin, and do not explain what the firm is absorbing. A client who sees your margin will negotiate against it, and a firm that explains its discounts teaches clients to ask for them.`
            ),
          },
          {
            title: "Phasing and the diagnostic gate",
            body: p(
              `Phase large engagements behind a diagnostic. A fixed-fee diagnostic of four to eight weeks establishes the facts, and the larger implementation phase is priced afterwards, against what the diagnostic found. Both sides carry less risk.`,
              `For the client, a diagnostic is a smaller first commitment and a test of the firm. For the firm, it avoids fixing a price for work whose size is still unknown. A hospital that says it has "a revenue problem" may have a tariff problem fixable in a month or a billing system that needs a year of work, and nobody can price the second phase honestly until the first is done.`,
              `End the diagnostic with a gate: a meeting at which the client decides whether to proceed, on the basis of priced options. Present two or three implementation shapes, for example a full programme with an embedded team, a lighter advisory model with monthly visits, or a handover to the hospital's own team with a short coaching period. Each has days, a fee and the results it should deliver. The client chooses; the firm has priced every option in advance.`,
              `Price the diagnostic at the full rate. It is tempting to discount it as a way in, but a cheap diagnostic sets the client's expectation for every day that follows. When the implementation proposal arrives at the full rate, it looks like a price rise, and the conversation starts from the wrong number.`,
              `For ongoing work after implementation, such as management support or a monthly operating review, a retainer is clearer than a day count. Define what the retainer buys (meetings, reports, hours of access), what lies outside it, and how often it is reviewed. An undefined retainer becomes unlimited support at a fixed price within a few months.`
            ),
          },
          {
            title: "Change control and scope creep",
            body: p(
              `Scope creep is rarely a single large request. It arrives as a series of reasonable asks, each too small to argue about, which together add a third to the work. Change control makes each one visible and decided.`,
              `The common patterns on hospital engagements:
- "While you are here": a second site, an extra department, one more board paper.
- A new stakeholder, often a director or a family member, who joins midway with new questions.
- Client delays that stretch six weeks of work into ten while the fee stays the same.
- Rounds of comments on a deliverable well beyond the two agreed.
- A change of question: the brief was leakage, and now the chief executive wants a pricing strategy.`,
              `For anything material, use a written change request before work starts. It states what is being added or changed, why, the effect on days and fee, the effect on the timeline, and the client signature that approves it. A change request is not a confrontation; presented promptly and neutrally, it is simply how the engagement records a decision. Clients who run hospitals understand that adding a service changes the bill.`,
              `For small items, keep a change log and a small pool of days agreed in advance for minor requests. Log each item against the pool and show the log at steering committee. Goodwill given this way is recorded and noticed; goodwill absorbed silently is forgotten and becomes the new baseline.`,
              `Client delays should trigger the assumption clause in the engagement letter. When the data is three weeks late, raise it in writing the week it happens, state the effect on the timeline and days, and agree the consequence. Waiting until the end to raise accumulated delay turns a contractual mechanism into a complaint.`,
              `The rule for everyone on the team is the same: nobody absorbs scope silently. A consultant who quietly takes on extra work commits the firm without a decision, and the cost appears only when the engagement overruns.`
            ),
          },
          {
            title: "Payment terms and holding your price",
            body: p(
              `Payment terms protect the firm's cash and its position. Agree them in the engagement letter and print them on every invoice, because a term the client has not seen in writing will be disputed.`,
              `Terms that work for hospital engagements:
- A mobilisation payment before work starts, usually a substantial share of the fee, stated as non-refundable once the team has mobilised.
- Milestone payments tied to named deliverables, due on acceptance, with acceptance deemed after a set number of working days if the client raises no written objection.
- A right to pause work if an invoice is unpaid beyond an agreed period.
- Fees stated in naira, exclusive of VAT and expenses, with expenses billed at cost or as an agreed fixed sum.
- One free reschedule of a workshop or site visit and free substitution of attendees, so a client who changes plans has an option short of a refund.`,
              `Expect the client to deduct withholding tax from consultancy fees and remit it to the tax authority. Ask for the receipt or credit note each time, because the firm can set it against its own tax, and plan cash on the net amount actually received.`,
              `When a client says the fee is too high, the first move is a question, not a discount. Ask what they are comparing it with and what budget they hold. Then offer to change the scope to meet the budget, for example one site instead of two or a diagnostic without the implementation plan, rather than cutting the rate for the same work.`,
              `Prepare a private concession ladder before the meeting: the things you could give, in order, and what you want in return for each. Typical rungs are a different phasing, a change in payment timing, a reduced scope, or a modest adjustment in exchange for a case study or a reference. Open at the built-up figure, never volunteer a cap or your floor, and trade every concession for something. A discount given for nothing tells the client the first price was not real.`
            ),
          },
        ],
        exercises: [
          {
            title: "Price, then defend it",
            instruction:
              "Harbourview Hospital in Surulere, Lagos (150 beds, about N3.1bn revenue) wants a revenue leakage diagnostic across inpatient, outpatient and pharmacy billing at two sites, followed by an implementation plan. Using illustrative rates (partner N650,000, engagement manager N420,000, consultant N280,000, analyst N140,000 a day) and a 10% programme management charge, build the fee for a ten-week diagnostic phase. Write the scope statement with deliverables, assumptions and exclusions. The chief executive then tells you her budget is N30m. Write your private concession ladder of four rungs, each with what you would ask in return, and two scope options that meet her budget without cutting the rate.",
          },
          {
            title: "Three requests in one week",
            instruction:
              "In week 4 of the Harbourview diagnostic: the finance director's data arrives 15 days late against the date in the engagement letter; the chief executive asks you to add the hospital's new diagnostic centre to the review; and the chair's son, newly appointed as a director, asks for a separate paper on pricing strategy. For each, decide whether it goes through a change request, the change log or neither, and draft the change request for the one you judge most material, showing the effect on days, fee and timeline.",
          },
        ],
      },
      resources: { tools: ["Fee build-up sheet", "Engagement letter template", "Change request form", "Concession ladder worksheet"] },
      questions: [
        q(
          "Which line in a scope statement could a third party check at the end of the engagement?",
          "c",
          [
            "Support the hospital's leadership in improving revenue cycle performance as required",
            "Assist with billing, claims and related matters, including but not limited to HMO claims",
            "A leakage diagnostic of inpatient and pharmacy billing at one site for January to June, as a report in week 6",
            "Provide expert advice on revenue matters throughout the engagement period",
          ],
          "A checkable scope names the deliverable, its coverage, its form and its date. The first option is tempting because it sounds client-focused, but 'support' and 'as required' describe effort that can never be shown to be complete."
        ),
        q(
          "Your team has priced a diagnostic at 140 days, all of them analysis days from the workplan. What has most likely been left out?",
          "a",
          [
            "Client meetings, steering committees, internal review, travel and rework after comments",
            "A blanket contingency of 50% on every phase to cover the risk that the client's data turns out to be poor",
            "The partner's time on business development for the next phase",
            "Days for the client's own staff who will work alongside the team",
          ],
          "Meetings, review, travel and rework typically add a quarter to a third on hospital engagements and never appear in an analysis list. A large blanket contingency is tempting, but it hides the real items and is hard to defend line by line."
        ),
        q(
          "A hospital's chief executive asks to see your internal cost per consultant day 'to understand your margin'. What should you share?",
          "d",
          [
            "The internal cost and margin, since full transparency builds trust with a client who is paying this much",
            "A blended single day rate for the whole team, to keep the discussion simple",
            "Nothing at all about how the fee was built",
            "Resourced days by role at the published rates, without internal costs or margin",
          ],
          "Days by role at published rates let the client see what they are buying without exposing cost or margin. Sharing the margin is tempting as a show of openness, but a client who sees it will negotiate against it."
        ),
        q(
          "To win a new client, a colleague proposes pricing the diagnostic at half the usual rate and recovering it in the implementation phase. What is the main risk?",
          "b",
          [
            "The diagnostic will be done less thoroughly, because the discount means the team will be under-resourced from the start",
            "The client anchors on the discounted rate, so the full-rate implementation looks like a price rise",
            "Regulators may view the discount as an inducement to the hospital's management",
            "The client may refuse to pay VAT on the discounted fee",
          ],
          "A cheap diagnostic sets the client's expectation for every day after it, so the implementation proposal starts from the wrong number. Under-resourcing is a real concern but is a choice about staffing, not an inevitable effect of the price."
        ),
        q(
          "The engagement letter says the client will provide billing data by week 1 and that late data moves the timeline and adds days. The data arrives in week 4. When and how should you raise it?",
          "a",
          [
            "In writing in the week it happens, stating the effect on timeline and days under the clause",
            "At the end of the engagement, together with any other client delays, in a single reconciliation of days and fee",
            "Only if the delay causes the team to miss the final deadline",
            "Verbally with the finance manager, to avoid formalising a minor problem",
          ],
          "The assumption clause works when it is used promptly and in writing, so the consequence is agreed while the facts are fresh. Waiting for an end-of-engagement reconciliation is tempting because it avoids friction now, but by then it reads as a complaint rather than an agreed mechanism."
        ),
        q(
          "In week 3 of a one-site diagnostic, the chief executive asks you to 'also look at the new diagnostic centre while you are here'. It would add about 12 days. What should you do?",
          "c",
          [
            "Agree and absorb the twelve days, because the goodwill it earns will help the firm win the implementation phase later",
            "Decline, because the engagement letter covers one site only",
            "Raise a change request showing the effect on days, fee and timeline, for signature before work starts",
            "Add it to the change log against the pool of days for minor requests",
          ],
          "Twelve days is material, so it goes through a written change request before work starts. Absorbing it for goodwill is tempting, but goodwill absorbed silently is forgotten and becomes the baseline for the next request."
        ),
        q(
          "Your built-up fee is N53.5m. The chief executive says her budget is N30m and asks for a discount. What is the best first response?",
          "b",
          [
            "Offer 15% off immediately, to show flexibility and keep the conversation going",
            "Ask what the budget is based on, then offer scope options that fit it at the same rates",
            "Explain the firm's margin on the work and why, as a result, the fee cannot go any lower",
            "Tell her the lowest figure you could accept, so that time is not wasted",
          ],
          "Start with a question, then change the scope rather than the rate. Explaining the margin is tempting because it seems to justify the price, but it invites negotiation against it, and naming your floor gives away your position."
        ),
        q(
          "Which set of payment terms best protects the firm on a hospital engagement?",
          "d",
          [
            "Full payment on delivery of the final report, to show confidence in the work",
            "Equal monthly instalments over the engagement, invoiced at the end of each month",
            "Payment on acceptance of each deliverable, with acceptance at the client's discretion",
            "Non-refundable mobilisation before work, milestones on deemed acceptance, and a right to pause for late payment",
          ],
          "Mobilisation, deemed acceptance and a pause right protect cash at each stage and stop acceptance being withheld indefinitely. Acceptance at the client's discretion is tempting because it seems fair, but it lets payment be delayed without any stated reason."
        ),
        q(
          "Select all that apply. What should a change request contain?",
          "abd",
          [
            "The effect on days and fee",
            "Client signature approving it before work starts",
            "An account of whose fault the change was",
            "The revised delivery date",
            "A goodwill discount to keep the relationship smooth",
          ],
          "A change request records what changes, its effect on days, fee and timeline, and the client's approval before work starts. Assigning fault is the tempting addition, but it turns a routine record of a decision into a dispute."
        ),
        q(
          "A hospital pays a N10m invoice but deducts withholding tax before paying. What should the firm do?",
          "c",
          [
            "Chase the deducted amount as an underpayment of the invoice",
            "Ignore it, since the amount has been lost to the firm",
            "Obtain the withholding tax receipt to set against its own tax, and plan cash on net receipts",
            "Add the deducted amount to the next invoice as a recoverable expense, so that the firm is paid the full fee",
          ],
          "Withholding tax is remitted on the firm's behalf, so the receipt has value against the firm's own tax liability and cash planning should assume net receipts. Chasing it as an underpayment is the tempting reaction, but the client has done what the law requires."
        ),
      ],
    },
  ],
};

export default expansion;
