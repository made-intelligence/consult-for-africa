import type { Twin } from "./types";

/**
 * Non-clinical twins for Emotional Intelligence.
 *
 * These are the hardest to twin well. A DISC item asks what you would do; an
 * EQ item puts you under emotional load and then asks. Swapping the nouns is
 * not enough, because the load is the item. A patient dying on the ward while
 * the family shouts in a public corridor carries grief, blame, an audience and
 * no time to think. Its twin has to carry all four or it is measuring
 * something easier.
 *
 * So the twins keep the emotional register rather than the setting. Bereaved
 * families still appear, because families do meet the administration of a
 * hospital at the worst moment of their lives. What changes is that the
 * respondent is answering as the person who runs records, finance or
 * operations rather than as the person who was treating the patient.
 *
 * Only the wording is supplied. The seeder copies each option's weight and
 * eqDimension from the item it parallels, so a five point response cannot
 * quietly become a one point response.
 */
export const EMOTIONAL_TWINS: Twin[] = [
  {
    module: "EMOTIONAL_INTEL",
    of: "You receive feedback from a 360-degree review that your team finds you unapproachable during peak clinical hours. You are surprised, as you consider yourself open. What do you do?",
    text: "You receive feedback from a 360-degree review that your team finds you unapproachable during peak reporting periods. You are surprised, as you consider yourself open. What do you do?",
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "You need to convince a group of specialist consultants to adopt a new theatre scheduling system that will reduce their personal flexibility but improve patient access. What approach do you take?",
    text: "You need to convince a group of department heads to adopt a new rostering system that will reduce their personal flexibility but improve service coverage. What approach do you take?",
    options: [
      "Meet influential department heads individually first to understand their concerns, co-design solutions, then present the system as a shared initiative",
      "Present the service coverage data at a management meeting and invite the heads to propose their own improvements",
      "Announce the change with a clear rationale and a fixed implementation date",
      "Implement the system without consulting anyone, knowing resistance will fade once they see the benefits",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "A registrar who recently lost a parent to cancer becomes visibly emotional when a terminally ill patient's family asks about prognosis. The registrar excuses themselves from the consultation. What do you do?",
    text: "A team member who recently lost a parent becomes visibly emotional while helping a bereaved family settle an outstanding account. They excuse themselves and leave the room. What do you do?",
    options: [
      "Follow them, acknowledge what you observed, and gently explore how they are coping with their grief alongside their duties",
      "Ask a senior colleague to check on them and ensure they have access to the staff counselling service",
      "Take over the conversation yourself and speak to them later about professionalism",
      "Make a note to discuss it at the next supervision meeting without addressing it now",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "A patient dies unexpectedly on your ward. The family is distraught and begins shouting accusations of negligence at nursing staff in the corridor. Other patients and visitors are watching. What do you do?",
    text: "A family arrives to collect the belongings of a relative who died overnight and finds the paperwork has not been prepared. They are distraught and begin shouting accusations of incompetence at your staff in the corridor. Other visitors are watching. What do you do?",
    options: [
      "Calmly approach the family, express sincere condolences, guide them to a private space, and listen fully before discussing next steps",
      "Ask a senior officer to support the family while you quickly review the file to understand what happened",
      "Address the family firmly, explaining that a proper investigation will be conducted",
      "Avoid the family and ask the hospital's public relations officer to handle the situation",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "A nurse from a rural background is consistently quiet in multi-disciplinary team meetings, even though she has excellent clinical instincts. Other team members sometimes talk over her. What do you do?",
    text: "A finance officer from a rural background is consistently quiet in cross-functional meetings, even though her judgement is excellent. Other team members sometimes talk over her. What do you do?",
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "A prominent community leader publicly accuses your hospital of neglecting patients from his ethnic group. The accusation is unfounded but gaining traction on social media. What do you do?",
    text: "A prominent community leader publicly accuses your hospital of neglecting people from his ethnic group. The accusation is unfounded but gaining traction on social media. What do you do?",
    options: [
      "Request a private meeting with the leader to listen, share disaggregated service data, and jointly develop a community engagement plan",
      "Issue a factual public statement with data, and invite the community leader for a tour of the institution",
      "Ignore the social media noise, knowing the truth will emerge",
      "Publicly challenge the accusation with a strong rebuttal",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "During a morbidity and mortality conference, a case you managed is reviewed and a colleague suggests your decision may have contributed to a poor outcome. You feel your face flush with defensiveness. What do you do?",
    text: "During a serious incident review, a decision you took is examined and a colleague suggests it may have contributed to the failure. You feel your face flush with defensiveness. What do you do?",
    options: [
      "Acknowledge to yourself that you are feeling defensive, take a breath, and ask the colleague to elaborate on their reasoning",
      "Recognise the emotion but stay quiet during the meeting, then reflect on the feedback privately",
      "Immediately counter with a detailed justification of your decision",
      "Shut down the discussion by pointing out that the colleague was not involved at the time",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "During a multi-stakeholder meeting on maternal health, the NGO partner and the county health director disagree sharply on programme priorities. Both look to you to mediate. What do you do?",
    text: "During a multi-stakeholder meeting on a community programme, the NGO partner and the county health director disagree sharply on priorities. Both look to you to mediate. What do you do?",
    options: [
      "Acknowledge both perspectives, reframe the discussion around shared community outcomes, and propose a working group to align priorities",
      "Summarise both positions fairly and suggest a data-driven process to resolve the disagreement",
      "Support the county health director's position since they represent the government",
      "Stay neutral and suggest they resolve it between themselves",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "During a heated board meeting, the hospital chairman publicly blames your department for the institution's declining patient satisfaction scores. You believe the criticism is unfair and politically motivated. What do you do?",
    text: "During a heated board meeting, the hospital chairman publicly blames your department for the institution's declining service satisfaction scores. You believe the criticism is unfair and politically motivated. What do you do?",
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "A patient's family from a rural community insists on consulting a traditional healer before consenting to surgery. Your surgical team is frustrated by the delay. What do you do?",
    text: "A family from a rural community insists on consulting an elder before signing the paperwork that will let a procedure go ahead. Your admissions team is frustrated by the delay. What do you do?",
    options: [
      "Take time to understand the family's cultural beliefs, explain the urgency compassionately, and explore whether both can be accommodated",
      "Arrange for the hospital chaplain or social worker to mediate between the family's beliefs and what the process requires",
      "Explain the risks of delay firmly but politely and ask them to decide quickly",
      "Tell the family that traditional custom has no place in a formal process",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "You notice that you have been snapping at nursing staff all morning. On reflection, you realise you are anxious about a pending hospital board meeting where budget cuts will be discussed. What do you do?",
    text: "You notice that you have been snapping at your team all morning. On reflection, you realise you are anxious about a pending hospital board meeting where budget cuts will be discussed. What do you do?",
    options: [
      "Apologise to your team, name the source of your anxiety, and take steps to prepare for the board meeting",
      "Recognise the connection between your anxiety and your behaviour and make a conscious effort to be kinder",
      "Push through the morning hoping the mood will pass on its own",
      "Blame your team for being oversensitive during a stressful period",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "You have been working 14-hour days for three weeks due to a disease outbreak. You realise you are becoming irritable and making uncharacteristic clinical errors. What do you do?",
    text: "You have been working 14-hour days for three weeks through an emergency response. You realise you are becoming irritable and making uncharacteristic errors. What do you do?",
    options: [
      "Acknowledge that you have reached your limit, delegate responsibilities to capable colleagues, and take a structured break to recover",
      "Reduce your hours slightly and implement personal strategies like mindfulness or exercise",
      "Push through because the institution needs you and no one else can fill your role",
      "Carry on but take out your frustration by criticising slower-performing team members",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "A junior doctor confides that they are struggling financially and considering leaving medicine for a better-paying career. They seem ashamed. What do you do?",
    text: "A junior colleague confides that they are struggling financially and considering leaving the sector for a better-paying career. They seem ashamed. What do you do?",
    options: [
      "Listen without judgement, validate the difficulty of their situation, and help them explore options including overtime policies or hardship funds",
      "Share your own experiences of financial hardship early in your career to normalise their feelings",
      "Encourage them to stay because the work is a noble calling",
      "Suggest they should have planned their finances better before taking the role",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "You want to introduce a nurse-led triage system in the emergency department but know the senior doctors will perceive it as a threat to their authority. What do you do?",
    text: "You want to introduce a self-service staff records portal but know the senior managers will perceive it as a threat to their authority. What do you do?",
    options: [
      "Pilot the system as a joint initiative with a respected senior manager as co-lead, sharing evidence from similar African institutions",
      "Present the evidence at a governance meeting and invite open discussion",
      "Implement it as a trial and review outcomes after three months",
      "Avoid the initiative for now, waiting for a more receptive moment",
    ],
  },
  {
    module: "EMOTIONAL_INTEL",
    of: "You are passed over for appointment as Chief Medical Director in favour of a less experienced colleague. You feel a mix of anger and self-doubt. What do you do?",
    text: "You are passed over for appointment as Chief Operating Officer in favour of a less experienced colleague. You feel a mix of anger and self-doubt. What do you do?",
  },
];
