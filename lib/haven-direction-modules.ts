/**
 * Phase 1 of the Haven education system: the Direction and Teamwork strands.
 *
 * Direction is how objectives work at Haven, cut by tier: everyone (DIR-01),
 * the people who lead a team (DIR-02), the board (DIR-03). Teamwork is the
 * daily huddle for everyone (TEAM-01), handover and closed-loop talk for
 * clinical staff (TEAM-02), and running the team for leads (TEAM-03).
 *
 * Grounded in docs/haven-education-research.md, findings 6, 7 and 9: few
 * objectives, set with the team through catchball, never tied to pay, every
 * revenue or volume result paired with a safety or quality guard, and the
 * huddle and handover tools adopted without a programme brand.
 *
 * Written by CFA, not drawn from a Haven SOP, so the source line says so.
 * Seeded unapproved with the SOP modules by scripts/seed-haven-sop-modules.ts.
 *
 * Role needles follow lib/havenToday.ts matching against "position
 * department" from docs/data/haven-staff-roster.json. "Admin" is deliberately
 * not a lead needle: it would also match the Admin and Billing Officer.
 */
import type { SopModule } from "@/lib/haven-sop-modules";

const M = "QUESTIONS" as const;
const F = "ON_INDUCTION_THEN_ANNUAL" as const;
const SOURCE = "CFA module, Haven education system phase 1, from the research memo";

const LEADS = ["Head", "Chief Medical Director", "Senior", "Supervisor", "Lead", "Matron"];
const BOARD = ["Founder", "Board", "Director"];
const CLINICAL = ["Nursing", "Medical Officer", "Attendant"];

export const DIRECTION_MODULES: SopModule[] = [
  {
    code: "DIR-01",
    domain: "Direction",
    title: "How objectives work at Haven",
    summary: "What an objective, a key result and a safety guard are, how your team sets them with you, and how to read your team board.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: SOURCE,
    body: `Why we have objectives

Every hospital is busy. Busy is not the same as getting better. Objectives are how Haven decides, every three months, the few things that matter most, so that everybody pulls the same way.

The three words

1. An objective is where we want to be. It is a sentence, not a number. Example: "Every sick newborn referred to us is admitted safely and quickly."
2. A key result is how we will know we got there. It is a number with a starting point and a target. Example: "Referral to admission in under 30 minutes, from 1 in 2 referrals today to 9 in 10."
3. A safety guard is the line we will not cross to hit the key result. Example: "No rise in missed observations on the NICU." Every key result about money or volume has one.

Why the safety guard matters

A target on its own can be hit the wrong way. A team pushed only to admit faster can start skipping checks. The guard is there so that nobody is ever asked to choose between the target and a child's safety. If the two pull against each other, safety wins and you say so.

Set with you, not handed to you

The board sets three to five objectives for the hospital. Your team then proposes its own key results, the board and your lead talk them through, and they are agreed. This back and forth is called catchball. You will be asked what is realistic and what gets in the way. Say it. A target nobody believes in does not get hit.

Reading your team board

Your team's two or three key results are on the scoreboard on the staff page. Each one shows where we started, where we are this week and where we are going. Green means on track, amber means at risk, red means off track. Red is not a telling off. Red is the signal to ask for help early.

Never tied to pay

Objectives at Haven are never linked to your salary or a bonus. When pay rides on a target, people protect the number instead of fixing the work, and the bad news stops travelling up. We want the truth on the board, especially when it is red.

What is asked of you

1. Know your team's key results and their guards.
2. Bring what gets in the way to the daily huddle.
3. If you ever think a key result is being hit the wrong way, report it on the staff page. That is speaking up, and nobody is in trouble for it.`,
    questions: [
      {
        question: "Which of these is a key result rather than an objective?",
        options: [
          "Every sick newborn referred to us is admitted safely and quickly",
          "Referral to admission in under 30 minutes for 9 in 10 referrals",
          "Be the best NICU in Lagos",
          "Work harder on admissions",
        ],
        correct: 1,
        because: "A key result is a number with a starting point and a target. The objective is the sentence about where we want to be.",
      },
      {
        question: "What is a safety guard?",
        options: [
          "A security officer at the entrance",
          "A bonus paid when a target is hit",
          "The line we will not cross to hit a key result",
          "A second target for the same team",
        ],
        correct: 2,
        because: "Every key result about money or volume has a guard, so nobody is asked to choose between the target and a child's safety.",
      },
      {
        question: "Your team's key result is going red. What should you do?",
        options: [
          "Keep quiet until it turns green",
          "Raise it at the huddle and ask for help early",
          "Change the number on the board",
          "Wait for the board to notice",
        ],
        correct: 1,
        because: "Red is a signal to ask for help early, not a telling off.",
      },
      {
        question: "How are your team's key results set?",
        options: [
          "The board writes them and hands them down",
          "Each person picks their own",
          "The team proposes them, talks them through with the lead and the board, and they are agreed",
          "They are copied from another hospital",
        ],
        correct: 2,
        because: "This back and forth is catchball. A target nobody believes in does not get hit.",
      },
      {
        question: "Why are objectives at Haven never tied to pay?",
        options: [
          "Because the hospital cannot afford bonuses",
          "Because when pay rides on a target, people protect the number instead of fixing the work",
          "Because objectives are not important",
          "Because only the board is paid for results",
        ],
        correct: 1,
        because: "Pay on targets makes bad news stop travelling up. We want the truth on the board, especially when it is red.",
      },
    ],
  },
  {
    code: "DIR-02",
    domain: "Direction",
    title: "Leading your team's objectives",
    summary: "Writing a good key result, pairing it with a guard, agreeing it through catchball, and the weekly check-in.",
    roles: LEADS,
    departments: [],
    method: M,
    frequency: F,
    source: SOURCE,
    body: `Your job in the objectives

The board sets three to five objectives for the hospital. You turn them into two or three key results your team owns, agree them, and keep them honest every week.

What a good key result has

1. A measure. Something you can count, not a feeling. "Discharges billed before the family leaves", not "better billing".
2. A baseline. Where it is today, counted, not guessed. If nobody has counted it yet, the first week's job is to count it.
3. A target. Where it will be at the end of the quarter. Hard enough to stretch, not so hard the team stops believing in it.
4. An owner. One named person who watches it. The team does the work; the owner makes sure it is looked at.

Pair every revenue or volume result with a guard

If a key result is about money, speed or numbers of patients, write its safety or quality guard next to it. Examples:
1. Key result: more NICU admissions. Guard: no rise in missed observations or late escalations.
2. Key result: every service billed. Guard: no rise in family complaints about bills.
3. Key result: faster discharge. Guard: no rise in readmissions within 7 days.
The guard is checked every week alongside the result. If the guard slips, that comes first.

Catchball: propose, negotiate, agree

1. Propose. Bring your team's draft to the board's objective: what you think you can move and by how much.
2. Negotiate. Say what is in the way: staff, stock, a system, a process. The board may push the target up or take something off your plate.
3. Agree. Write it down. Both sides now own it.
It takes more than one conversation. That is the point. A target handed down in one meeting is a target nobody owns.

The weekly check-in

Once a week, ten minutes, with your team:
1. Where is each key result this week, and its guard?
2. Confidence, from 1 to 10, that we hit it by the end of the quarter. Ask the team, not just yourself.
3. What is in the way, and who can clear it?
Write the confidence score on the board. A score falling from 7 to 4 tells the board more than any report.

When a result is red

1. Say so early. Red in week 4 can be fixed. Red in week 12 is a post mortem.
2. Look for what in the work is causing it, not who.
3. Ask for what you need: a decision, a person, a fix.
4. Never change the baseline or the measure quietly to make it look better.

Never tied to pay

Do not promise money for hitting a key result, and do not tell anyone their pay depends on it. Recognise good work out loud instead.`,
    questions: [
      {
        question: "Which key result is written well?",
        options: [
          "Improve billing",
          "Discharges billed before the family leaves, from 6 in 10 today to 9 in 10 by end of quarter, owned by the billing lead",
          "Everyone tries harder on billing",
          "Billing should be excellent",
        ],
        correct: 1,
        because: "It has a measure, a baseline, a target and one named owner.",
      },
      {
        question: "Your key result is more NICU admissions. What should sit next to it?",
        options: [
          "A bonus for each admission",
          "A safety guard, such as no rise in missed observations",
          "Nothing, admissions are the only thing that matters",
          "A second admissions target",
        ],
        correct: 1,
        because: "Every revenue or volume result is paired with a safety or quality guard, checked every week.",
      },
      {
        question: "What happens in catchball?",
        options: [
          "The board hands the target down in one meeting",
          "The team proposes, the team and the board negotiate, and they agree",
          "Each person sets their own target in private",
          "The lead decides alone",
        ],
        correct: 1,
        because: "Propose, negotiate, agree. It takes more than one conversation, and that is the point.",
      },
      {
        question: "In the weekly check-in, the team's confidence drops from 7 to 4. What does that tell you?",
        options: [
          "Nothing, confidence is just a feeling",
          "That something is in the way and needs raising now",
          "That the target should be quietly lowered",
          "That the team is not working hard enough",
        ],
        correct: 1,
        because: "A falling confidence score is the early warning. Ask what is in the way and who can clear it.",
      },
      {
        question: "A key result has been red for three weeks. Which is wrong?",
        options: [
          "Raising it with the board",
          "Looking for what in the work causes it",
          "Changing the baseline quietly so it looks better",
          "Asking for the decision or person you need",
        ],
        correct: 2,
        because: "Never change the baseline or the measure quietly. Say so early and fix the work.",
      },
    ],
  },
  {
    code: "DIR-03",
    domain: "Direction",
    title: "Setting direction from the board",
    summary: "Three to five objectives a quarter, set with the teams, read through behaviour and results, cascaded to each job description.",
    roles: BOARD,
    departments: [],
    method: M,
    frequency: F,
    source: SOURCE,
    body: `The board's part

The board decides where Haven is going this quarter. It does that with three to five objectives, not twenty. Every extra objective takes attention from the others, and a hospital of twenty people has no attention to spare.

Let the teams propose

Write the objectives. Then let each team propose the key results it will own, and agree them through catchball: the team proposes, the board and the lead negotiate, both agree. Your job in that conversation is to ask two questions: is this enough to get us there, and what do you need from us to do it? Dictated targets get compliance at best. Agreed ones get effort.

Never link objectives to pay

Do not tie salaries, bonuses or promotion to key results. When pay rides on a number, people protect the number, bad news stops reaching the board, and the board ends up governing a picture rather than the hospital. Recognise progress openly instead.

Every revenue result has a guard

Haven's growth plan is NICU-led. Every key result about revenue, admissions or speed must sit next to a safety or quality guard, and the board reads the guard first. A month that hits revenue and slips the guard is a bad month.

Read behaviour and results, not completion

The founders' view on the staff page shows who did what, day by day. Use it to see whether the new way of working is happening on shift, and whether the key results are moving. A training completion rate on its own tells you people clicked. It does not tell you the ward changed.

The cascade

1. The board sets three to five objectives for the quarter.
2. Each team agrees two or three key results with its guards.
3. Each person's job description and three to five KPIs show their part in their team's results.
The frontline sees their team's key results on the scoreboard they already use. Objectives stop at team level: individual nurses are not given personal OKRs.

The lesson from ThedaCare

ThedaCare, a US health system that became a reference for running hospitals by a few agreed priorities, said afterwards that it should have started with strategy deployment, the agreeing and cascading of priorities, before anything else. Improvement work without agreed direction scattered effort. That is why Haven's objectives are set in the first quarter, not later.`,
    questions: [
      {
        question: "How many objectives should the board set for a quarter?",
        options: ["One", "Three to five", "Ten to fifteen", "One for every member of staff"],
        correct: 1,
        because: "Every extra objective takes attention from the others, and a small hospital has none to spare.",
      },
      {
        question: "What is the board's role in catchball?",
        options: [
          "Write every key result for every team",
          "Ask whether the team's proposal is enough and what they need from the board",
          "Stay out of it entirely",
          "Set the targets and check them at year end",
        ],
        correct: 1,
        because: "Dictated targets get compliance at best. Agreed ones get effort.",
      },
      {
        question: "Why should key results never be tied to pay?",
        options: [
          "It is too expensive",
          "People protect the number, bad news stops reaching the board, and the board governs a picture",
          "Staff do not care about pay",
          "It is against the law",
        ],
        correct: 1,
        because: "Pay on targets hides the truth from the people who most need it.",
      },
      {
        question: "Revenue is up this month but the NICU safety guard slipped. How should the board read the month?",
        options: ["A good month", "A bad month", "No change", "A month to celebrate the revenue"],
        correct: 1,
        because: "The board reads the guard first. Hitting revenue while the guard slips is a bad month.",
      },
      {
        question: "Where do objectives stop in the cascade?",
        options: [
          "At the board",
          "At team level, with each person's part shown in their job description and KPIs",
          "With a personal OKR for every nurse",
          "At the Chief Medical Director",
        ],
        correct: 1,
        because: "The frontline sees team key results on the scoreboard; individuals are not given personal OKRs.",
      },
      {
        question: "What did ThedaCare say it should have done first?",
        options: [
          "Bought a new computer system",
          "Started strategy deployment, agreeing and cascading priorities",
          "Hired more managers",
          "Linked bonuses to targets",
        ],
        correct: 1,
        because: "Improvement without agreed direction scatters effort, which is why Haven sets objectives in the first quarter.",
      },
    ],
  },
  {
    code: "TEAM-01",
    domain: "Teamwork",
    title: "The daily huddle",
    summary: "Ten minutes, standing, same time every day: one safety concern, today's focus, one blocker.",
    roles: [],
    departments: [],
    method: M,
    frequency: F,
    source: SOURCE,
    body: `What a huddle is

A huddle is a short meeting of the team on shift. Ten minutes, standing, at the same time every day. It is not a lecture and it is not a place to tell anyone off. It is how a team starts the day knowing the same things.

Why standing, why the same time

Standing keeps it short. The same time every day means nobody has to be found or reminded. If the huddle moves around, it stops happening.

The three things, in this order

1. Safety first. One safety concern for today. A child who worries someone, equipment that is not working, a medicine running low, a near miss from yesterday. If there is none, say "no safety concerns".
2. Today's focus. The one thing the team is working on today, often linked to the team's key result on the scoreboard.
3. One blocker. Something in the way that the team cannot fix on its own. Name it and agree who will take it up.

What you bring

Come ready to say one thing if you have it. You do not need to be senior to raise a safety concern. The newest attendant who noticed a broken suction machine is the most important person in that huddle.

What happens after

1. Safety concerns are acted on today, by a named person.
2. A blocker the team cannot clear goes to the team lead. If the lead cannot clear it, it goes to the Chief Medical Director for clinical matters, or the Head of Admin for everything else.
3. Anything that nearly went wrong is also reported on the staff page as a near miss, so it is looked into properly.

What the huddle is not

It is not where problems are solved in detail. If something needs more than a minute, agree who will talk after the huddle, and move on.`,
    questions: [
      {
        question: "How long should the daily huddle take?",
        options: ["About ten minutes", "An hour", "As long as it takes", "Two minutes, sitting down"],
        correct: 0,
        because: "Ten minutes, standing, at the same time every day. Standing keeps it short.",
      },
      {
        question: "What comes first in the huddle?",
        options: ["Today's focus", "One safety concern", "Announcements from management", "The week's numbers"],
        correct: 1,
        because: "Safety first, then today's focus, then one blocker.",
      },
      {
        question: "The newest attendant noticed the suction machine is not working. What should they do at the huddle?",
        options: [
          "Wait for a senior to raise it",
          "Say nothing in case they are wrong",
          "Raise it as the safety concern",
          "Write it down for next week",
        ],
        correct: 2,
        because: "You do not need to be senior to raise a safety concern.",
      },
      {
        question: "A blocker cannot be cleared by the team lead and it is clinical. Who does it go to?",
        options: ["The Chief Medical Director", "The billing office", "Nobody, it waits", "The family"],
        correct: 0,
        because: "Clinical blockers go to the Chief Medical Director; everything else goes to the Head of Admin.",
      },
      {
        question: "A problem raised at the huddle needs a long discussion. What happens?",
        options: [
          "The huddle runs on until it is solved",
          "Agree who will talk after the huddle, and move on",
          "Drop it",
          "Hold a second huddle",
        ],
        correct: 1,
        because: "The huddle is not where problems are solved in detail. Keep it to ten minutes.",
      },
    ],
  },
  {
    code: "TEAM-02",
    domain: "Teamwork",
    title: "Handover with SBAR, and closing the loop",
    summary: "How to hand over a child clearly with SBAR, and how to make sure an instruction was heard and done.",
    roles: CLINICAL,
    departments: [],
    method: M,
    frequency: F,
    source: SOURCE,
    body: `Why handover matters

Many of the things that go wrong for children in hospital go wrong at a handover: between shifts, between a nurse and a doctor, between the ward and the NICU. Information gets lost because it was said in the wrong order, or not said at all. SBAR puts it in the same order every time.

SBAR

1. Situation. What is happening now, in one sentence. "Baby A, day 3 in the NICU, is breathing faster than an hour ago."
2. Background. What the listener needs to know. "Born at 34 weeks, on 2 litres of oxygen, feeds by tube."
3. Assessment. What you think is going on, and the observations that show it. "Breathing 72 a minute, up from 55. Saturation 89% on the same oxygen. I am worried she is getting worse."
4. Recommendation. What you want. "Please come and review her in the next 15 minutes."

Say the Recommendation out loud. A worried nurse who describes the baby but never says "please come now" often does not get the doctor in time.

SBAR at shift handover

At the change of shift, hand over each child in SBAR order, at the cot side where you can, with the chart open. The incoming nurse asks questions before the outgoing nurse leaves.

Closing the loop

When an instruction is given, the person who receives it says it back, and says when it is done.
1. The doctor says: "Give 5 ml of paracetamol syrup now."
2. The nurse says back: "5 ml of paracetamol syrup now."
3. The doctor confirms: "Yes."
4. The nurse says when it is given: "5 ml paracetamol given at 10:40."
Saying it back catches the wrong drug, the wrong dose and the wrong child before they reach the child.

If you are not sure, ask

If an instruction does not make sense, or the dose looks wrong for the child's weight, say so before acting. Asking is never rude. It is the job.`,
    questions: [
      {
        question: "What do the letters SBAR stand for?",
        options: [
          "Situation, Background, Assessment, Recommendation",
          "Safety, Billing, Admission, Release",
          "Symptoms, Blood, Antibiotics, Rest",
          "Start, Brief, Act, Report",
        ],
        correct: 0,
        because: "Situation, Background, Assessment, Recommendation, in the same order every time.",
      },
      {
        question: "Which part is \"Please come and review her in the next 15 minutes\"?",
        options: ["Situation", "Background", "Assessment", "Recommendation"],
        correct: 3,
        because: "The Recommendation is what you want. Say it out loud.",
      },
      {
        question: "\"Breathing 72 a minute, up from 55, saturation 89%. I am worried she is getting worse.\" Which part is this?",
        options: ["Situation", "Background", "Assessment", "Recommendation"],
        correct: 2,
        because: "The Assessment is what you think is going on, with the observations that show it.",
      },
      {
        question: "A doctor says \"Give 5 ml of paracetamol syrup now\". What does closing the loop look like?",
        options: [
          "Nod and give it",
          "Say it back, get a yes, and report when it is given",
          "Write it down and give it later",
          "Ask another nurse to give it",
        ],
        correct: 1,
        because: "Saying it back catches the wrong drug, dose or child before it reaches the child.",
      },
      {
        question: "A dose looks wrong for the child's weight. What should you do?",
        options: [
          "Give it, the doctor knows best",
          "Say so before acting",
          "Give half",
          "Wait until the next shift",
        ],
        correct: 1,
        because: "Asking is never rude. It is the job.",
      },
    ],
  },
  {
    code: "TEAM-03",
    domain: "Teamwork",
    title: "Running your team day to day",
    summary: "Leading the huddle, keeping the huddle log, standard work for a shift, and being a system champion who goes to people.",
    roles: LEADS,
    departments: [],
    method: M,
    frequency: F,
    source: SOURCE,
    body: `Running the huddle

1. Start on time, every day, at the same place. If you are late, the huddle starts without you and the next most senior person leads it.
2. Go round: safety concern, today's focus, one blocker. Keep each to a sentence or two.
3. Name an owner for every safety concern and every blocker before you finish.
4. Ten minutes. If something needs longer, agree who talks after.
5. Thank the person who raised the most awkward thing. That is how you get more of them.

The huddle log

After the huddle, record on the staff page: the date, how many were there, the safety concern and who owns it, the blocker and who owns it. Two minutes. The log is how the next shift, the Chief Medical Director and the board know what was raised and whether it was closed. A concern raised and never closed teaches the team not to raise the next one.

Standard work for a shift

Standard work is the agreed way a routine job is done on your unit, written down: the shift start checks, the crash trolley check, the handover, the drug round, the end of shift. It is not a rule for its own sake. It is the current best way, so that a new nurse on a night shift does it the same way as the most experienced one.
1. Keep it short and on the unit, where people can see it.
2. When someone finds a better way, try it, and if it works, change the standard. The standard belongs to the team.
3. Check it on shift. Walk the unit and watch one routine done against the standard each day. Say what you saw, privately and kindly.

Being a system champion

Each team has a champion for each system it uses: the staff page, billing, HMO approvals, stock. A champion is not the person people come to. A champion is the person who goes to people.
1. In the first weeks of anything new, sit with each person once and watch them use it.
2. Fix the small things on the spot. Report the bigger ones.
3. Ask, every week, "what is annoying about this?" and pass it on.

What the research says about all of this

Training sticks when a lead checks the new way on shift. A course on its own fades. Your checking is the difference between the team knowing something and the team doing it.`,
    questions: [
      {
        question: "You are running late for the huddle. What should happen?",
        options: [
          "Everyone waits for you",
          "It starts without you, led by the next most senior person",
          "It is cancelled for the day",
          "It is moved to the afternoon",
        ],
        correct: 1,
        because: "The huddle happens at the same time every day. If it moves around, it stops happening.",
      },
      {
        question: "Why keep a huddle log?",
        options: [
          "To check who was late",
          "So the next shift and leadership know what was raised and whether it was closed",
          "Because the board asked for paperwork",
          "To score each nurse",
        ],
        correct: 1,
        because: "A concern raised and never closed teaches the team not to raise the next one.",
      },
      {
        question: "Someone finds a better way to do the crash trolley check. What happens to the standard?",
        options: [
          "Nothing, the standard never changes",
          "Try it, and if it works, change the standard",
          "Report them for not following it",
          "Let each nurse choose their own way",
        ],
        correct: 1,
        because: "Standard work is the current best way, and the standard belongs to the team.",
      },
      {
        question: "What does a good system champion do?",
        options: [
          "Waits for people to come with problems",
          "Goes to each person, sits with them and watches them use it",
          "Writes a long manual",
          "Does the work for everyone",
        ],
        correct: 1,
        because: "A champion is the person who goes to people, not the person people come to.",
      },
      {
        question: "What most decides whether training is used on shift?",
        options: [
          "How long the course was",
          "Whether a lead checks the new way on shift",
          "How hard the test was",
          "Whether there was a certificate",
        ],
        correct: 1,
        because: "Training sticks when a lead checks it on shift. A course on its own fades.",
      },
    ],
  },
];
