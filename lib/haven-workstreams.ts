/**
 * The two workstreams the founders follow on their dashboard. Status lines are
 * written by CFA and updated as each piece moves; the live counts on the page
 * come from the database.
 */
export interface WorkItem { title: string; owner: string; status: string; state: "done" | "review" | "open"; href?: string }

export const WORKSTREAMS: { key: string; title: string; summary: string; items: WorkItem[] }[] = [
  {
    key: "people",
    title: "People and education",
    summary: "Who does what, how it is measured, and how staff are trained to do it.",
    items: [
      { title: "Hospital and department OKRs, November to February", owner: "Dr Tanwa", status: "First version 2 Nov. Reviewed 4 Nov; next version separates OKRs from KPIs, one owner per key result.", state: "review", href: "/HavenStaff/objectives" },
      { title: "Job descriptions for all 12 roles", owner: "Dr Tanwa", status: "First version 2 Nov. Reporting lines to be confirmed by the founders before issue.", state: "review" },
      { title: "Appraisal template", owner: "Mrs Alli with Dr Tanwa", status: "Head Nurse template shared. Being joined with the job description KPIs into one Haven template.", state: "review" },
      { title: "Nursing structure: Head Nurse or rotating nurse in charge", owner: "Founders", status: "Decision needed before nursing job descriptions are issued.", state: "open" },
      { title: "Performance management: personal objectives, monthly conversations, appraisal", owner: "Line managers, with Dr Tanwa", status: "Live on the staff page. Every person starts from their role's five KPIs, agreed with their line manager.", state: "open", href: "/HavenStaff/people" },
      { title: "Teams, leads and daily huddles", owner: "CFA", status: "Four teams set up with leads; huddles recorded on the staff page.", state: "done", href: "/HavenStaff/teams" },
      { title: "Training from Haven's own procedures", owner: "Dr Odedina to approve", status: "Haven's procedures, the core set, objectives and teamwork: every module waits for clinical approval before staff see it.", state: "open", href: "/HavenStaff/learn" },
    ],
  },
  {
    key: "tariff",
    title: "Tariff",
    summary: "Every service priced, defensibly, against Evercare and the Lagos market.",
    items: [
      { title: "Service list against the tariff and Evercare", owner: "CFA", status: "Report sent 3 Nov. Ben's list is the current tariff on 36 of its 59 lines.", state: "done", href: "/HavenStaff/tariff" },
      { title: "Nine fixes before the list is used", owner: "Leadership and finance", status: "Tracked on the tariff page; open fixes appear in the morning list.", state: "open", href: "/HavenStaff/tariff" },
      { title: "NICU day rate", owner: "Founders", status: "About N670k a day on CPAP at Haven against N285k at Evercare. Decide whether it moves.", state: "open" },
      { title: "The 1,952 zero-priced lines", owner: "Head of Admin and Head of Finance", status: "Drugs by rule from cost first, then the rest.", state: "open" },
    ],
  },
];
