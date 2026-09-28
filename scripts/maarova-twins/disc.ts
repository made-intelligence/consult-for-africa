import type { Twin } from "./types";

/**
 * Non-clinical twins for the DISC Behavioural Style module.
 *
 * Each twin keeps the D, I, S, C mapping of the item it parallels, in the same
 * order, and changes only the world the scenario happens in. The respondent is
 * still a senior leader in a health organisation: they run human resources,
 * finance, compliance, operations or facilities rather than a clinical service.
 * That is what keeps the instrument a healthcare one for both tracks instead of
 * handing non-clinicians a generic corporate form.
 *
 * The stakes and seniority of each scenario are matched to the original. A
 * deteriorating patient is a crisis with no time to consult, so its twin is a
 * failing critical system, not a difficult email.
 */
export const DISC_TWINS: Twin[] = [
  {
    module: "DISC",
    of: "During a ward-round crisis where a patient's condition deteriorates rapidly, I am most likely to:",
    text: "During an unfolding operational crisis where a critical system fails without warning, I am most likely to:",
    options: [
      { dimension: "D", label: "Take immediate command and direct the team on next steps" },
      { dimension: "I", label: "Rally the team with encouragement and maintain morale" },
      { dimension: "S", label: "Calmly follow the established escalation procedure step by step" },
      { dimension: "C", label: "Analyse the incident logs and system data before deciding on a response" },
    ],
  },
  {
    module: "DISC",
    of: "When a major donor organisation requests changes to a health programme's design, I tend to:",
    text: "When a major donor organisation requests changes to a programme's design, I tend to:",
    options: [
      { dimension: "D", label: "Negotiate firmly for what I believe serves the programme best" },
      { dimension: "I", label: "Find creative compromises that keep the donor excited and engaged" },
      { dimension: "S", label: "Accommodate their requests where reasonable, maintaining a good relationship" },
      { dimension: "C", label: "Evaluate the proposed changes against programme objectives and outcome data" },
    ],
  },
  {
    module: "DISC",
    of: "When two consultants have a public disagreement about treatment protocol during a grand round, I would:",
    text: "When two department heads have a public disagreement about policy during a management forum, I would:",
    options: [
      { dimension: "D", label: "Intervene firmly and redirect focus to the evidence and the organisation's purpose" },
      { dimension: "I", label: "Use humour and diplomacy to defuse the tension and restore collegial spirit" },
      { dimension: "S", label: "Speak privately with each party afterwards to mediate a resolution" },
      { dimension: "C", label: "Review the evidence for both positions and present an objective comparison" },
    ],
  },
  {
    module: "DISC",
    of: "When planning the annual clinical audit programme for my department, I prefer to:",
    text: "When planning the annual internal audit programme for my department, I prefer to:",
    options: [
      { dimension: "D", label: "Set ambitious targets and challenge the team to exceed last year's results" },
      { dimension: "I", label: "Make the process engaging with interactive workshops and peer recognition" },
      { dimension: "S", label: "Follow a proven methodology and maintain consistency with previous years" },
      { dimension: "C", label: "Design a systematic framework with detailed timelines and measurement criteria" },
    ],
  },
  {
    module: "DISC",
    of: "When presenting the quarterly clinical governance report to hospital leadership, I tend to:",
    text: "When presenting the quarterly performance report to hospital leadership, I tend to:",
    options: [
      { dimension: "D", label: "Focus on outcomes and bold recommendations for immediate action" },
      { dimension: "I", label: "Use stories of real impact to inspire and energise the audience" },
      { dimension: "S", label: "Present a balanced view, acknowledging contributions from every department" },
      { dimension: "C", label: "Rely on charts, data tables, and statistical comparisons" },
    ],
  },
  {
    module: "DISC",
    of: "When my schedule is overloaded with clinical duties, administrative tasks, and teaching commitments, I tend to:",
    text: "When my schedule is overloaded with operational duties, committee work, and reporting deadlines, I tend to:",
    options: [
      { dimension: "D", label: "Prioritise ruthlessly and delegate everything that others can handle" },
      { dimension: "I", label: "Stay flexible, energised, and find ways to make each commitment enjoyable" },
      { dimension: "S", label: "Maintain my routine, working steadily through each task without complaint" },
      { dimension: "C", label: "Create a detailed priority matrix to optimise my time allocation" },
    ],
  },
  {
    module: "DISC",
    of: "When a hospital board requests an urgent decision on capital expenditure for new theatre equipment, I tend to:",
    text: "When a hospital board requests an urgent decision on capital expenditure for a major new system, I tend to:",
    options: [
      { dimension: "D", label: "Present a firm recommendation and push for swift approval" },
      { dimension: "I", label: "Facilitate a lively discussion to build consensus among board members" },
      { dimension: "S", label: "Consult widely with department heads to ensure everyone is comfortable" },
      { dimension: "C", label: "Prepare a detailed cost-benefit analysis with risk projections" },
    ],
  },
  {
    module: "DISC",
    of: "When a junior doctor approaches me with a concern about workload, I am most likely to:",
    text: "When a junior colleague approaches me with a concern about workload, I am most likely to:",
    options: [
      { dimension: "D", label: "Give direct advice and clear actions they should take right away" },
      { dimension: "I", label: "Listen enthusiastically and help them see the bigger career opportunity" },
      { dimension: "S", label: "Offer calm, supportive listening and reassure them of my availability" },
      { dimension: "C", label: "Help them map out a structured plan with timelines and milestones" },
    ],
  },
  {
    module: "DISC",
    of: "When a nursing team falls behind on their patient documentation targets, I would:",
    text: "When an administrative team falls behind on their record-keeping targets, I would:",
    options: [
      { dimension: "D", label: "Set a non-negotiable deadline and hold individuals accountable" },
      { dimension: "I", label: "Motivate the team with recognition for improvements and celebrate quick wins" },
      { dimension: "S", label: "Work alongside the team to understand barriers and offer hands-on support" },
      { dimension: "C", label: "Review the record-keeping workflow and identify process bottlenecks" },
    ],
  },
  {
    module: "DISC",
    of: "When a senior nurse challenges my clinical decision in front of the care team, I would:",
    text: "When a long-serving team member challenges my decision in front of the wider team, I would:",
    options: [
      { dimension: "D", label: "Stand firm on my decision while acknowledging their experience" },
      { dimension: "I", label: "Openly welcome the challenge and turn it into a learning moment for all" },
      { dimension: "S", label: "Acknowledge their viewpoint calmly and suggest a private follow-up discussion" },
      { dimension: "C", label: "Ask them to present the data that supports their alternative approach" },
    ],
  },
  {
    module: "DISC",
    of: "When staff resist a new infection prevention and control protocol, my first response is to:",
    text: "When staff resist a new information governance procedure, my first response is to:",
    options: [
      { dimension: "D", label: "Enforce compliance and make clear the consequences of non-adherence" },
      { dimension: "I", label: "Share compelling examples that illustrate why the procedure matters" },
      { dimension: "S", label: "Listen to their concerns and adjust the implementation timeline if needed" },
      { dimension: "C", label: "Present the evidence base and audit data that justify the change" },
    ],
  },
  {
    module: "DISC",
    of: "When there is tension between clinical and administrative departments over resource allocation, I prefer to:",
    text: "When there is tension between two support departments over resource allocation, I prefer to:",
    options: [
      { dimension: "D", label: "Make a definitive resource allocation decision and communicate it clearly" },
      { dimension: "I", label: "Bring both sides together for a creative brainstorm on shared solutions" },
      { dimension: "S", label: "Facilitate a structured dialogue ensuring both departments feel heard" },
      { dimension: "C", label: "Present utilisation data and service performance metrics to guide the decision" },
    ],
  },
  {
    module: "DISC",
    of: "My approach to mentoring clinical officers in a district hospital is to:",
    text: "My approach to mentoring junior managers in a district health office is to:",
    options: [
      { dimension: "D", label: "Set stretch goals and challenge them to take on responsibilities beyond their level" },
      { dimension: "I", label: "Build strong personal relationships and connect them with influential networks" },
      { dimension: "S", label: "Provide consistent, reliable guidance at a pace that suits each individual" },
      { dimension: "C", label: "Create structured learning plans with measurable competency milestones" },
    ],
  },
  {
    module: "DISC",
    of: "When faced with conflicting diagnostic opinions between consultants, I prefer to:",
    text: "When faced with conflicting expert opinions between senior advisers, I prefer to:",
    options: [
      { dimension: "D", label: "Make the final call quickly to avoid delays in the work" },
      { dimension: "I", label: "Bring the advisers together and mediate a collaborative review" },
      { dimension: "S", label: "Allow the more senior adviser to guide the decision" },
      { dimension: "C", label: "Request additional analysis to resolve the disagreement with evidence" },
    ],
  },
  {
    module: "DISC",
    of: "In a multi-disciplinary team meeting discussing patient discharge planning, I usually:",
    text: "In a cross-functional meeting discussing a service redesign, I usually:",
    options: [
      { dimension: "D", label: "Drive the agenda and keep discussion focused on delivery targets" },
      { dimension: "I", label: "Encourage open sharing of ideas and celebrate the team's progress" },
      { dimension: "S", label: "Ensure every function has an opportunity to voice concerns" },
      { dimension: "C", label: "Focus on readiness criteria checklists and compliance documentation" },
    ],
  },
  {
    module: "DISC",
    of: "When a patient advocacy group publicly criticises the hospital's waiting times, I would:",
    text: "When a community group publicly criticises the organisation's service standards, I would:",
    options: [
      { dimension: "D", label: "Issue a direct public response outlining immediate corrective actions" },
      { dimension: "I", label: "Invite the group for a collaborative town hall meeting" },
      { dimension: "S", label: "Reach out privately to the group's leaders to understand their concerns" },
      { dimension: "C", label: "Compile service data, identify root causes, and share a detailed improvement plan" },
    ],
  },
  {
    module: "DISC",
    of: "When deciding whether to adopt a new clinical guideline from the WHO Africa Regional Office, I would:",
    text: "When deciding whether to adopt a new operational standard from the WHO Africa Regional Office, I would:",
    options: [
      { dimension: "D", label: "Champion the change and set a firm implementation deadline" },
      { dimension: "I", label: "Organise a launch event to generate excitement among staff" },
      { dimension: "S", label: "Pilot the standard in one department first and gather feedback before scaling" },
      { dimension: "C", label: "Benchmark the standard against local operating data before committing" },
    ],
  },
  {
    module: "DISC",
    of: "When building partnerships with pharmaceutical companies for a clinical trial in sub-Saharan Africa, I focus on:",
    text: "When building partnerships with commercial suppliers for a major programme in sub-Saharan Africa, I focus on:",
    options: [
      { dimension: "D", label: "Negotiating the best terms and ensuring the institution's interests are protected" },
      { dimension: "I", label: "Building enthusiasm around the programme's potential and networking opportunities" },
      { dimension: "S", label: "Ensuring all parties feel valued and building long-term trust" },
      { dimension: "C", label: "Reviewing every clause of the agreement and ensuring regulatory compliance" },
    ],
  },
];
