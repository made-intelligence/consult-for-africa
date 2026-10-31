import type { Option, Question, TrackExpansion } from "./types";

const ids = ["a", "b", "c", "d", "e"] as const;
const p = (...paras: string[]) => paras.join("\n\n");

/** Multiple choice: `correct` is the letter of the one right option. */
const mc = (question: string, options: string[], correct: string, explanation: string): Question => ({
  type: "MULTIPLE_CHOICE",
  question,
  options: options.map((text, i): Option => ({ id: ids[i], text, isCorrect: ids[i] === correct })),
  explanation,
});

/** Multi select: `correct` lists the right letters, e.g. "ac". */
const ms = (question: string, options: string[], correct: string, explanation: string): Question => ({
  type: "MULTI_SELECT",
  question,
  options: options.map((text, i): Option => ({ id: ids[i], text, isCorrect: correct.includes(ids[i]) })),
  explanation,
});

const expansion: TrackExpansion = {
  slug: "clinical-governance-accreditation",
  topUp: [
    {
      moduleSlug: "clinical-governance-foundations",
      questions: [
        mc(
          "An audit found that only 62% of surgical patients received prophylactic antibiotics within 60 minutes before incision, against a standard of 95%. The hospital wrote a new antibiotic policy, circulated it and filed the audit report. What is missing from the audit cycle?",
          [
            "A larger sample in the first audit",
            "A change in the standard to a more realistic 70%, so the next audit can show the ward is able to achieve it",
            "Practical changes in how antibiotics are given, followed by a re-audit to confirm the gap has closed",
            "A root cause analysis of each late dose",
          ],
          "c",
          "A circulated policy is not a change in practice, and without re-audit nobody knows whether compliance moved. Lowering the standard to match current performance defeats the purpose of the audit."
        ),
        mc(
          "A hospital starting its audit programme can choose one first topic. It performs about 150 caesarean sections a month and about 3 neurosurgical operations a year. Which topic best fits the module's guidance for a first audit?",
          [
            "Prophylactic antibiotic timing in caesarean sections",
            "Complication rates after neurosurgery",
            "Patient satisfaction with the hospital canteen",
            "A full review of every clinical policy",
          ],
          "a",
          "Caesarean antibiotic timing is high volume, high risk, measurable and simple to act on. Neurosurgery is high risk, but three cases a year give too little data to audit meaningfully."
        ),
        mc(
          "Three incidents in one month were traced to verbal handovers between night and day nurses with no written record. Which governance pillar is most directly failing?",
          [
            "Risk management",
            "Resource effectiveness",
            "Learning effectiveness",
            "Communication effectiveness",
          ],
          "d",
          "The failures happened at handover, which the communication pillar covers. Risk management is tempting because incidents occurred, but the specific weakness is how information passes between shifts."
        ),
        mc(
          "A hospital's Clinical Governance Committee is chaired by the CEO, meets when there is time and can only make recommendations. Which change would most strengthen it?",
          [
            "Adding more members from every department so that all services are represented at each meeting",
            "A senior clinician chairing monthly, with a standing agenda and power to mandate actions",
            "Replacing it with a quarterly report to the board",
            "Asking the quality officer to write more policies",
          ],
          "b",
          "The committee needs clinical leadership, a regular cadence and power to require action. Adding members makes it larger but no more able to change practice."
        ),
        mc(
          "Which of these is written as a measurable audit standard?",
          [
            "Antibiotics should be given appropriately before surgery",
            "Surgeons should follow best practice on antibiotics",
            "95% of patients having surgery receive prophylactic antibiotics within 60 minutes before incision",
            "The hospital aims for excellent infection control in all surgical patients, measured at every audit",
          ],
          "c",
          "It names the population, the action, the time window and the target, so compliance can be counted. The others express intent but give an auditor nothing to measure."
        ),
      ],
    },
    {
      moduleSlug: "jci-safecare-accreditation",
      questions: [
        ms(
          "A doctor phones a ward at night and orders intravenous concentrated potassium chloride for a patient. Which International Patient Safety Goals are most directly at stake in this order? Select all that apply.",
          [
            "IPSG 2: effective communication",
            "IPSG 3: safety of high-alert medications",
            "IPSG 4: safe surgery",
            "IPSG 6: reducing harm from falls",
          ],
          "ab",
          "A telephone order needs read-back under IPSG 2, and concentrated potassium is a high-alert medication under IPSG 3. Safe surgery and falls are not engaged by this order."
        ),
        mc(
          "A 60-bed hospital in Ibadan wants accreditation mainly to strengthen its standing with HMOs. Its budget is limited and an informal check suggests it is far from international standards. Which route fits best?",
          [
            "Apply for JCI immediately to signal ambition to HMOs, since they recognise JCI more than any other scheme",
            "Wait until it can afford JCI",
            "Seek only state registration, which HMOs treat as accreditation",
            "Work through SafeCare's levels, which are designed for stepwise progress in resource-limited settings",
          ],
          "d",
          "SafeCare's tiered levels let the hospital show measurable progress from where it is, within its budget. Going straight to JCI is tempting but means 18-24 months and large fees with little to show along the way."
        ),
        mc(
          "After a baseline of 35% against JCI standards, the weakest areas are medication management (20%), infection control (25%) and facility management (30%). The team proposes starting with a new staff uniform policy because it is quick. What should come first?",
          [
            "The IPSGs and the high-risk areas, starting with medication management and infection control",
            "Facility management, because it scored highest and is closest to passing",
            "The uniform policy, to build momentum",
            "Waiting for the next mock survey before acting",
          ],
          "a",
          "The roadmap starts with the IPSGs and high-risk areas because they cause the most preventable harm and carry the most weight in surveys. Quick wins that do not touch patient risk feel productive but leave the biggest gaps open."
        ),
        mc(
          "During a mock survey, the surveyor picks a surgical patient discharged yesterday and follows her record from admission through theatre, the ward, pharmacy and discharge, asking staff at each point to show how they met the standards. What is this method called?",
          [
            "Root cause analysis",
            "Clinical audit",
            "Tracer methodology",
            "FMEA",
          ],
          "c",
          "Following one patient's journey and testing compliance at each touchpoint is the tracer method used in surveys. A clinical audit is tempting but measures one criterion across a sample, not one patient across the whole hospital."
        ),
        mc(
          "A hospital board scored 40% at baseline against JCI standards and wants accreditation within 9 months, with a fixed budget. What is the best advice?",
          [
            "Accept the target and hire more consultants, so that the workload is shared and the timeline compressed to nine months",
            "Explain that 18-24 months is realistic from this baseline and agree phased milestones",
            "Decline the work, since the hospital is not ready",
            "Suggest reducing the scope to the IPSGs only and applying for full accreditation on that basis",
          ],
          "b",
          "From a 30-50% baseline, preparation typically takes 18-24 months, and success depends more on leadership commitment than on money. Adding consultants does not compress the time staff need to change and embed practice."
        ),
      ],
    },
    {
      moduleSlug: "patient-safety-systems",
      questions: [
        mc(
          "An FMEA on medication administration scores two failure modes. Wrong patient: severity 9, occurrence 3, detectability 2. Missed dose at shift change: severity 6, occurrence 5, detectability 6. Which should the team address first by RPN?",
          [
            "Wrong patient, because its severity is highest",
            "Both equally, because each has one score above 5",
            "Neither, until an incident occurs",
            "Missed dose at shift change, with an RPN of 180 against 54",
          ],
          "d",
          "RPN is 9 x 3 x 2 = 54 for wrong patient and 6 x 5 x 6 = 180 for missed doses, so missed doses rank higher. Choosing by severity alone ignores how often a failure happens and how hard it is to catch."
        ),
        mc(
          "A nurse skipped the independent double-check on an insulin dose. She says nobody does it on night shift because there is only one nurse per ward. Under a just culture framework, how should this be classified and handled?",
          [
            "At-risk behaviour: coach the nurse and redesign the night process so a double-check is possible",
            "Reckless behaviour: start disciplinary action, since she knowingly skipped a required safety check",
            "Human error: no action needed",
            "Gross misconduct: report her to the NMCN",
          ],
          "a",
          "Taking a shortcut that has become normal because of staffing is at-risk behaviour, which calls for coaching and system redesign. It is not reckless, because she did not consciously disregard a substantial risk that others would have avoided in her position."
        ),
        mc(
          "Six months after introducing just culture, incident reports rose from 4 to 30 a month. The board is alarmed that safety has worsened. What is the best response?",
          [
            "Agree and pause the programme until the number of incidents returns to the level before it was introduced",
            "Explain that more reports usually mean better visibility, and show the severity mix",
            "Tell staff to report only serious incidents",
            "Stop sharing the numbers with the board",
          ],
          "b",
          "A rise in reporting after just culture usually reflects staff feeling safe to report; the useful view is whether serious harm is falling and reports lead to action. Asking staff to report less would recreate the hidden errors the programme set out to surface."
        ),
        mc(
          "An RCA finds a patient received the wrong drug because two look-alike vials were stored side by side. Which corrective action best addresses the root cause?",
          [
            "A written warning to the nurse involved",
            "A memo reminding staff to read labels carefully",
            "Separating the vials in storage and adding distinct labelling, with a check at the point of administration",
            "Extra training for the nurse involved and her ward colleagues, covering drug identification and medication policy",
          ],
          "c",
          "Changing storage and labelling removes the condition that made the error likely for anyone. Reminders and training rely on people being more careful, which is the weakest kind of action."
        ),
        mc(
          "A hospital will open a new chemotherapy service next month. No incidents have happened yet. Which tool fits best now?",
          [
            "FMEA on the chemotherapy process before it goes live",
            "Root cause analysis",
            "Waiting for incident reports",
            "A patient satisfaction survey",
          ],
          "a",
          "FMEA is proactive and suits a high-risk process before it starts. RCA is for investigating an adverse event that has already happened."
        ),
      ],
    },
  ],
  modules: [
    {
      slug: "clinical-audit-outcomes",
      name: "Clinical Audit and Outcome Measurement",
      description:
        "Turn guidelines into audit criteria, sample and collect data that will stand up, measure outcomes fairly with small numbers and case mix, run mortality and morbidity review, and show change over time.",
      estimatedMinutes: 90,
      content: {
        sections: [
          {
            title: "From guideline to audit criteria",
            body: p(
              "An audit is only as good as its criteria, and most weak audits fail here rather than in the data. A criterion is a precise statement of what should happen to a defined group of patients, taken from an accepted guideline. A standard is the level of compliance the hospital commits to. Exceptions are the cases where the criterion does not apply, written down in advance.",
              "Take postpartum haemorrhage, a leading cause of maternal death in Nigeria. WHO guidance recommends a uterotonic, usually oxytocin, for every woman in the third stage of labour. A usable criterion is: every woman who has a vaginal birth receives oxytocin 10 IU within one minute of the birth of the baby, recorded on the delivery chart. The standard is 100%. Exceptions: none, except a documented clinical reason or a written refusal. Each word does work. 'Vaginal birth' defines the group. 'Within one minute' sets the time. 'Recorded on the delivery chart' tells the auditor where to look.",
              "Draw criteria from the strongest available source, in order: national guidelines from the Federal Ministry of Health and Social Welfare or a specialty college, WHO guidance, then respected international guidelines such as those from NICE. Where a hospital has its own protocol, check that it agrees with the source; an audit against an outdated local protocol measures the wrong thing.",
              "Keep the number of criteria small. Three to six criteria on one topic produce an audit people can act on. Twenty criteria produce a report nobody reads. Choose criteria that link to outcomes: for PPH, oxytocin timing, measurement of blood loss, and time from diagnosis to senior review all matter.",
              "Set standards honestly. Where an action should always happen, the standard is 100% with defined exceptions, even if current practice is far below it. Lowering the standard to 70% because the hospital is at 50% hides the problem. Targets for improvement are a separate matter: the hospital can aim to move from 50% to 80% in six months while keeping 100% as the standard."
            ),
          },
          {
            title: "Sampling and collecting the data",
            body: p(
              "Data for an audit must come from a fair sample and be collected the same way by everyone, or the result can be argued away. Start with the sample frame: the list of all eligible cases in the period, such as the delivery register or the theatre register. Never let ward staff choose which notes to pull; they will, without meaning to, pick the tidy ones.",
              "For most criterion audits, 30 to 50 cases are enough to show whether practice is far from the standard. If a ward had 180 vaginal births last quarter, take every fourth birth from the register to get 45, or use a random number list. Formal sample size calculations matter when the aim is to detect a small change or compare units; for a first audit showing 50% against a 100% standard, they rarely change the conclusion.",
              "Decide between retrospective and prospective collection. Retrospective audit reviews notes after the event; it is quick but relies on what was written. Prospective audit observes or records care as it happens; it captures what was done but staff may behave better while watched. Hand hygiene is usually observed prospectively. Drug timing is usually audited from charts.",
              "Use a short data collection form with one line per criterion and fixed answers: met, not met, not applicable, not documented. Agree in advance how 'not documented' will be counted. The usual convention is that undocumented care counts as not met, because a later clinician cannot rely on it. Pilot the form on five sets of notes and fix any question two people read differently.",
              "Check reliability. Have two collectors audit the same 10 sets of notes independently and compare. If they disagree on more than one or two items, tighten the definitions before going on.",
              "Protect the patients. Health information is sensitive personal data under the Nigeria Data Protection Act 2023. Record the hospital number, not the name, keep the key in a locked file, and destroy working sheets once the data is entered. Audit for quality improvement is part of running the hospital, but publishing results outside it may need ethical approval."
            ),
          },
          {
            title: "Measuring outcomes fairly",
            body: p(
              "Outcome figures are the ones boards and patients care about, and they are the easiest to misread. Three problems come up in almost every hospital: small numbers, case mix, and incomplete follow-up.",
              "Small numbers first. A surgeon with 2 wound infections in 40 operations has a rate of 5%; a colleague with 1 in 45 has 2.2%. The difference is one infection. With numbers this small, the plausible range around each rate is wide and the two overlap heavily. Report the counts with the rates, combine several quarters before comparing individuals, and treat a single quarter's ranking as a prompt to look at process, not as a verdict.",
              "Case mix second. A unit that takes emergency and high-risk cases will have worse crude outcomes than one that takes healthy elective patients. Compare like with like by grouping cases: elective against emergency, ASA grade for anaesthetic risk, age bands, or a recognised classification. For caesarean section, the WHO recommends the Robson Ten-Group Classification, which groups women by parity, previous caesarean, number of fetuses, presentation, gestation and onset of labour. A hospital with a 45% caesarean rate may find that most of it sits in women with a previous caesarean, which points to a different conversation from a high rate among first-time mothers in spontaneous labour.",
              "Follow-up third. Many complications appear after discharge. Surgical site infection is conventionally counted up to 30 days after surgery, or up to 90 days for some operations involving implants. If the hospital counts only infections seen before discharge, it will undercount, and a unit that discharges early will look best. In Nigeria many patients do not return for review, so build in a follow-up call at day 30 and record who could not be reached. A rate based on half the patients is not a rate for all of them.",
              "Choose outcome measures that match the service: wound infection and return to theatre for surgery, readmission within 30 days for medicine, PPH and neonatal admission for maternity. Pair each with the processes most likely to drive it, so a bad outcome leads straight to a question someone can answer."
            ),
          },
          {
            title: "Mortality and morbidity review",
            body: p(
              "Every death and every serious unexpected complication should be reviewed in a structured way, and the review should produce actions, not just discussion. Mortality and morbidity (M&M) review is the oldest form of clinical audit and, in many hospitals, the most poorly run: a monthly meeting where the case is presented, opinions are shared and nothing changes.",
              "A working process starts with a rule: every inpatient death is screened within a set period, often a week. A trained reviewer, not the treating doctor, reads the notes and uses a structured template that covers the phases of care: admission and initial assessment, ongoing care, any procedure, end of life. The reviewer judges the quality of each phase and records whether there were problems in care and whether the death was potentially avoidable, using a defined scale. Structured judgement review, developed in the UK, is one widely used method.",
              "Cases with problems in care go to the departmental M&M meeting. The presentation is factual and anonymised for staff. The discussion focuses on what in the system allowed the problem: delayed lab results, no senior review at night, unclear escalation rules. Each meeting ends with a short action log: action, owner, date. The next meeting starts by checking it.",
              "Maternal and perinatal deaths have their own national framework. Nigeria's Maternal and Perinatal Death Surveillance and Response (MPDSR) guidelines require facilities to notify and review maternal deaths and to act on the findings. A private hospital is part of this system and should have a named MPDSR lead and a review committee.",
              "Morbidity matters as much as death. Unplanned return to theatre, unplanned ICU admission and serious drug reactions are earlier, more frequent signals than death and give more chances to learn.",
              "Report the pattern upward. The clinical governance committee should see, each quarter, the number of deaths reviewed, the share with problems in care, the main themes and the status of actions. Ten reviews that all mention delayed senior review at weekends are a finding the board must hear."
            ),
          },
          {
            title: "Showing change and closing the loop",
            body: p(
              "A before-and-after pair of numbers is weak evidence of improvement; a run chart of monthly data over time is much stronger and easy to read. Plot the measure each month, mark the median of the baseline months, and annotate when changes were made. A clinical team can see at a glance whether the line moved after the change and stayed moved.",
              "Simple rules separate real change from noise on a run chart. A shift is six or more consecutive points all above or all below the median. A trend is five or more consecutive points all going up or all going down. Points exactly on the median are ignored for these counts. If oxytocin timing compliance sat around a median of 52% for six months and then ran at 70%, 74%, 78%, 81%, 79% and 83% after a delivery-room checklist was introduced, that is a shift, and the change is very likely real.",
              "Use the chart to prevent false conclusions as well. A single good month after a change is not a result, and a single bad month is not a failure.",
              "Close the loop with an action plan for each criterion that is not met: what will change, who owns it, and by when. Good actions change the system: oxytocin drawn up before each birth, a checklist on the delivery trolley, a pharmacy stock level that guarantees supply. Weak actions rely on reminders and memos.",
              "Re-audit with the same criteria, sample method and form, after enough time for the change to take effect, often three to six months. If compliance has improved, decide how it will be held: periodic spot checks, the measure on the department's monthly dashboard, or a lighter re-audit each year. If it has not, find out why before repeating the same action.",
              "Report results to the clinical governance committee in a standard format: topic, criteria, sample, result against standard, actions, re-audit date. A one-page summary per audit lets the committee see the whole programme and spot topics that keep failing, which usually point to a deeper problem of staffing, supply or leadership."
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Designing a PPH audit",
            instruction:
              "A 90-bed private hospital in Abeokuta had 210 vaginal births and 140 caesarean sections last quarter, and two women needed transfusion for postpartum haemorrhage. Write four audit criteria for prevention and management of PPH with standards and exceptions, describe how you would draw a sample of 45 vaginal births from the register, design the data collection form, and state how you will treat undocumented care and check agreement between two collectors.",
          },
          {
            title: "Practice: Comparing surgeons fairly",
            instruction:
              "The medical director wants to rank three general surgeons by wound infection. Surgeon A: 4 infections in 60 operations, 50% emergency. Surgeon B: 1 in 42, all elective. Surgeon C: 3 in 75, 30% emergency. Infections were counted only before discharge, and 35% of patients were not reviewed after discharge. Write a one-page note explaining what can and cannot be concluded, what you would change in measurement for the next two quarters, and which processes you would audit now.",
          },
        ],
      },
      resources: { tools: ["Audit Criteria Template", "Data Collection Form Template", "Run Chart Builder", "Structured Mortality Review Template"] },
      questions: [
        mc(
          "Which of these is the best-written audit criterion for prevention of postpartum haemorrhage?",
          [
            "Midwives should give oxytocin promptly after delivery",
            "Every woman with a vaginal birth gets oxytocin 10 IU within one minute of the birth, recorded on the delivery chart",
            "Oxytocin should be in stock on the labour ward at all times, checked and signed for daily by the midwife in charge of each shift",
            "The hospital follows WHO guidance on PPH",
          ],
          "b",
          "It defines the group, the drug and dose, the time and where to find the record, so two auditors will score a case the same way. Availability of oxytocin is a structure check and says nothing about whether each woman received it."
        ),
        mc(
          "Current compliance with a criterion that should always be met is 48%. A ward manager proposes setting the standard at 60% so the ward can pass. What is the right approach?",
          [
            "Accept 60%, since a standard staff believe is achievable is more likely to be met and can be raised later",
            "Set the standard at 50% to reflect current reality",
            "Keep 100% with defined exceptions, and set a separate target such as 80% in six months",
            "Drop the criterion from the audit",
          ],
          "c",
          "The standard states what should happen to every patient; improvement targets mark the path towards it. Setting the standard at what the ward can already nearly do hides the gap the audit exists to expose."
        ),
        mc(
          "A ward had 180 vaginal births last quarter. The matron offers to pull 45 sets of notes for the audit. What is the best way to select the sample?",
          [
            "Take every fourth birth listed in the delivery register, or select 45 using random numbers",
            "Let the matron choose 45 notes that are complete, so that the auditors are not slowed by missing pages",
            "Take the 45 most recent births",
            "Take the notes of the women who had complications",
          ],
          "a",
          "Systematic or random selection from the register gives every birth a fair chance of selection. Notes chosen by ward staff tend to be the tidiest, which flatters the result."
        ),
        mc(
          "In an audit of antibiotic timing, 12 of 45 charts have no time recorded for the antibiotic dose. Following the usual convention, how should these be counted?",
          [
            "Excluded from the denominator",
            "Counted as met, since the antibiotic was probably given",
            "Counted as half met",
            "Counted as not met, because undocumented care cannot be relied on",
          ],
          "d",
          "The usual convention counts undocumented care as not met, which keeps the denominator honest and also exposes a documentation problem. Excluding these charts would hide a quarter of the sample and inflate compliance."
        ),
        mc(
          "Two data collectors audit the same 10 sets of notes independently. They disagree on 4 of the 10 for one criterion. What should happen next?",
          [
            "Average their results",
            "Tighten the definition of that criterion and retest agreement before collecting the full sample",
            "Use the more senior collector's results",
            "Continue with the full sample, since some disagreement between collectors is normal and evens out",
          ],
          "b",
          "Disagreement on 4 of 10 means the criterion is being read differently, so the full data would be unreliable. Using the senior collector's view keeps the ambiguous definition in place."
        ),
        mc(
          "Surgeon A has 2 wound infections in 40 operations and Surgeon B has 1 in 45. The medical director wants to name Surgeon A as the poorer performer. What is the soundest response?",
          [
            "Agree, since A's rate of 5% is more than double B's rate of 2.2%, and the board needs a clear ranking of surgeons",
            "Disagree, since infection rates are never comparable between surgeons",
            "Note the gap is one infection; pool several quarters, compare case mix, and review prevention processes now",
            "Ask Surgeon A to stop operating until the next quarter",
          ],
          "c",
          "With counts this small the plausible ranges overlap heavily, so more data and case mix are needed before judging an individual. Saying rates are never comparable is the opposite error; fair comparison is possible with enough data and adjustment."
        ),
        mc(
          "A hospital's caesarean rate is 45%. Using the Robson classification, the team finds most caesareans are in women with a previous caesarean. What does this most usefully point to?",
          [
            "A review of care for women with a previous caesarean, including support for trial of labour where safe",
            "Proof that the obstetricians are operating unnecessarily, since the rate is far above what WHO considers usual",
            "A need to stop all elective caesareans",
            "Nothing, because Robson groups are only for national statistics",
          ],
          "a",
          "Robson groups show where the caesareans come from, so the improvement conversation can target that group. Concluding that surgeons operate unnecessarily ignores that women with a previous caesarean have different risks and choices."
        ),
        mc(
          "A hospital counts surgical site infections only while patients are in hospital. Its average stay after surgery is 2 days, and its rate is 1.5%. What is the main problem?",
          [
            "The rate is too low to be useful",
            "Infections should be counted per bed rather than per operation, because beds are what the hospital manages",
            "The rate should be adjusted for the season",
            "Most wound infections appear after discharge, so the rate undercounts and favours early discharge",
          ],
          "d",
          "Wound infections typically show after a few days, so counting only inpatient infections misses most of them. The denominator is correct as operations; the follow-up window is what is wrong."
        ),
        ms(
          "A hospital wants a working mortality review process. Which of these belong in it? Select all that apply.",
          [
            "Every inpatient death is screened within a set period by a trained reviewer who was not the treating doctor",
            "Only deaths that families complain about are reviewed",
            "Each M&M meeting ends with an action log of action, owner and date, checked at the next meeting",
            "Maternal deaths are notified and reviewed under the MPDSR framework",
            "The treating consultant presents and judges the case alone",
          ],
          "acd",
          "Independent screening of every death, logged actions and MPDSR review of maternal deaths are what make review produce learning. Reviewing only complaints misses most problems, and self-judgement by the treating consultant removes the independence that makes review credible."
        ),
        mc(
          "Oxytocin timing compliance had a baseline median of 52%. After a delivery-room checklist was introduced, the next six monthly values were 70%, 74%, 78%, 81%, 79% and 83%. What can you conclude from the run chart rules?",
          [
            "Nothing, because there is no trend of five rising points",
            "There is a shift of six consecutive points above the median, so the improvement is very likely real",
            "The improvement is chance unless compliance reaches 100%",
            "A re-audit is unnecessary now, since the change is proven",
          ],
          "b",
          "Six consecutive points above the median meets the shift rule, so a real change is likely. The dip from 81% to 79% breaks the trend rule, but the shift rule is met regardless; and a re-audit or ongoing monitoring is still needed to hold the gain."
        ),
      ],
    },
    {
      slug: "credentialing-privileging",
      name: "Credentialing, Privileging and Medical Staff Governance",
      description:
        "Verify that every doctor is who their papers say, grant specific privileges based on evidence, run medical staff governance with fair process, and manage visiting consultants and visiting surgical teams safely.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Credentialing: verifying the doctor",
            body: p(
              "Credentialing is the process of confirming that a practitioner's qualifications, registration and history are genuine and current, before they treat a patient. It protects patients and the hospital, which carries liability for the people it allows to practise in its name. Fake certificates and lapsed licences are not rare in Nigeria, and a hospital that relies on photocopies has not credentialed anyone.",
              "The core principle is primary source verification: confirm each credential with the body that issued it, not with the applicant's copy. For a doctor in Nigeria the file should hold:",
              "- Full registration with the MDCN, checked against the council's register.\n- A current annual practising licence. It is renewed every year, so a licence that was valid last year proves nothing now.\n- Specialist qualifications, such as a fellowship of the National Postgraduate Medical College or the West African College of Surgeons or Physicians, confirmed with the college, and specialist registration where the hospital's rules require it.\n- For foreign-trained or diaspora doctors, evidence of the registration route MDCN has granted and a certificate of good standing from each regulator they have worked under recently.\n- A CV with any gaps longer than a few months explained.\n- At least two references from people who have seen the doctor's clinical work recently, ideally heads of department.\n- Professional indemnity cover, with the amount and expiry date.\n- Basic and advanced life support certificates where the role requires them, and occupational health clearance, including hepatitis B immunity for anyone doing procedures.",
              "Nurses and midwives need an equivalent file with NMCN registration and a current licence. Pharmacists and laboratory scientists need theirs from the Pharmacists Council and the Medical Laboratory Science Council.",
              "Credentialing does not end at appointment. Keep a register of every practitioner with the expiry date of each licence, indemnity policy and certificate, and check it monthly. A practitioner whose annual practising licence has expired should not be on the theatre list until it is renewed. In a 100-bed hospital with 60 doctors on the books, including sessional staff, a spreadsheet with expiry dates and a named owner is enough; what matters is that someone checks it."
            ),
          },
          {
            title: "Privileging: what each doctor may do here",
            body: p(
              "Privileging decides which procedures and kinds of care each practitioner may provide in this hospital, based on evidence of competence and on what the hospital can support. A fellowship in obstetrics and gynaecology does not by itself entitle a doctor to perform laparoscopic hysterectomy or IVF egg retrieval. Credentialing says who the doctor is; privileging says what they may do here.",
              "Most hospitals use two layers. Core privileges cover what any fully trained specialist in the field is expected to do, such as caesarean section and management of labour for an obstetrician. Additional privileges cover procedures that need extra training or volume, such as advanced laparoscopy, joint replacement or endoscopic procedures, and are requested one by one.",
              "Each request for an additional privilege needs evidence: training received, a logbook with case numbers, recent experience, and outcomes where available. A surgeon asking to perform total knee replacement might show 80 cases logged in the last three years with complication data from the previous hospital. The hospital sets a minimum it will accept for each additional privilege and applies it to everyone.",
              "Privileges must match the hospital's capability. A surgeon may be fully competent in major spinal surgery, but if the hospital has no ICU, no image intensifier and no blood bank on site, the privilege should not be granted here. This protects patients and spares the surgeon from operating without the support the procedure needs.",
              "New privileges start with focused review. The first several cases, often five to ten depending on the procedure, are proctored by an experienced colleague or reviewed in detail afterwards. Only when the review is satisfactory does the privilege become full.",
              "Privileges are useless unless they are enforced where care happens. The theatre list should be checked against each surgeon's privileges before it is confirmed, and the theatre manager must have the authority, and the backing, to stop a case that is outside a surgeon's privileges. In many hospitals the gap is not the policy but the moment a senior consultant arrives with a patient and the nurse does not feel able to say no."
            ),
          },
          {
            title: "Medical staff governance",
            body: p(
              "The rules for appointing, reviewing and if necessary restricting doctors must be written down and applied the same way to everyone, or the hospital will be unable to act when it needs to. Private hospitals often run on personal relationships with senior doctors; that works until a concern arises about one of them.",
              "The usual structure is a Medical Advisory Committee, or a credentials committee reporting to it, made up of senior clinicians and chaired by the medical director or an elected senior doctor. It reviews applications, recommends appointments and privileges to the board or chief executive, and oversees reappointment. Medical staff rules or bylaws set out the categories of staff, such as employed, sessional and visiting, the duties of each, and the processes for appointment, review and concerns.",
              "Reappointment every two or three years should use real performance data, not just a renewed licence: audit results, M&M findings, complaints, incidents, and the activity under each privilege. A surgeon who has not done a privileged procedure for two years should be asked whether it is still needed.",
              "When a concern arises, the process should move in steps that fit the seriousness:",
              "- An informal conversation, recorded, for a minor issue.\n- A focused review of the doctor's recent cases by a colleague from outside the department.\n- Agreed conditions, such as supervision for certain procedures.\n- Restriction or suspension of privileges where patient safety requires it, at once if necessary.",
              "At every step the doctor must be told the concern, see the evidence, and have a chance to respond, with decisions recorded and an appeal route. This is fair to the doctor and protects the hospital if the decision is challenged.",
              "Where a concern amounts to possible serious professional misconduct, the hospital may need to report it to the MDCN, whose disciplinary processes cover all registered doctors. Keep privileges separate from employment: removing a privilege for safety reasons is a clinical governance decision and should not wait for an employment process to finish."
            ),
          },
          {
            title: "Visiting consultants and visiting teams",
            body: p(
              "Visiting consultants deliver a large share of specialist care in Nigerian private hospitals, and they are where credentialing and accountability most often break down. Many hold posts in teaching hospitals and do sessions at one or more private hospitals; others are diaspora specialists who visit for a week to operate. Each arrangement needs the same checks as an employed doctor, plus clear answers on who is responsible for the patient when the consultant is not there.",
              "A sessional or visiting agreement should state:",
              "- The privileges granted, from the same process as any other doctor.\n- Who covers the patient after the procedure and overnight, by name or by rota, and how fast that doctor must respond.\n- How often the consultant will review inpatients, and how they can be reached.\n- Documentation standards: operation notes and post-operative instructions completed before leaving the hospital.\n- Indemnity: whose policy covers the work, and evidence it is in force.\n- How the consultant takes part in audit, M&M review and complaints.",
              "Fees and payment terms belong in a separate commercial schedule, so that clinical duties are not traded off against money.",
              "A common failure: a visiting surgeon operates at 6pm and leaves; at 2am the patient deteriorates, the resident cannot reach the surgeon, and no other doctor is privileged or willing to take over. The agreement and the on-call rota must close this gap before the first case.",
              "Visiting diaspora or foreign teams raise further issues. Each practitioner needs MDCN registration through the appropriate route before treating patients; a team arriving with only foreign licences cannot operate. The hospital should name a local consultant responsible for every patient before, during and after the visit, plan follow-up after the team leaves, and agree how complications will be handled weeks later. A ten-day programme of 25 joint replacements is also 25 patients needing review at two weeks, six weeks and three months.",
              "Temporary privileges, for emergencies or a short defined period, should be rare, time-limited, sponsored by a named head of department, and granted only after registration and licence have been verified."
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: A visiting surgeon's file",
            instruction:
              "A UK-based orthopaedic surgeon plans to operate at a 70-bed hospital in Abuja for one week every quarter, doing about 8 joint replacements per visit. He has sent a CV, a copy of his UK registration, a logbook showing 210 joint replacements in four years, and a letter from his employer. List every document missing from his credentials file, the source you would verify each one with, the privileges you would recommend and on what conditions, and the clauses his visiting agreement needs on post-operative cover and follow-up after he flies out.",
          },
          {
            title: "Practice: Handling a concern",
            instruction:
              "Over six months, a sessional gynaecologist at a 120-bed Lagos hospital has had 3 unplanned returns to theatre in 48 laparoscopic procedures, against 1 in 110 across the department's other surgeons. Two nurses have reported that she declines to complete the surgical safety checklist. Set out the steps the Medical Advisory Committee should take, what she must be told and when, what interim measures, if any, you would recommend, and what evidence would lead to restriction of her laparoscopic privileges.",
          },
        ],
      },
      resources: { tools: ["Credentials File Checklist", "Privileges Request Form", "Licence and Indemnity Expiry Register", "Visiting Consultant Agreement Template"] },
      questions: [
        mc(
          "A newly appointed obstetrician gives HR a photocopy of her MDCN registration, a fellowship certificate and a practising licence dated last year. What should the hospital do before she treats patients?",
          [
            "Accept the copies, since they look genuine",
            "Ask the head of department to vouch for her",
            "Verify registration and fellowship with the MDCN and the college, and get a current licence",
            "Let her practise while the checks are done, since the copies show she was registered and licensed last year",
          ],
          "c",
          "Primary source verification confirms each credential with the issuer, and the practising licence is annual, so last year's licence does not cover her now. A colleague's word does not replace verification, however senior."
        ),
        mc(
          "A surgeon credentialed as a general surgeon books a laparoscopic bowel resection, which is an additional privilege he does not hold. The theatre manager notices on the morning of surgery. What should happen?",
          [
            "Postpone it or give it to a privileged surgeon, report the gap, and back the theatre manager",
            "The case goes ahead, since he is a qualified surgeon",
            "The case goes ahead if the patient gives written consent after being told the surgeon lacks the privilege",
            "The theatre manager asks the surgeon to sign a waiver",
          ],
          "a",
          "Privileges must be enforced at the point of care, and a case outside them should not go ahead. Patient consent does not create a competence the hospital has not verified."
        ),
        mc(
          "A spinal surgeon with a strong record applies for major spinal surgery privileges at a hospital with no ICU and no blood bank on site. What should the credentials committee recommend?",
          [
            "Grant the privilege, since the surgeon is competent",
            "Grant it on a trial basis for five cases",
            "Grant it if the surgeon brings his own anaesthetist",
            "Decline that privilege at this hospital until the support the procedure needs is in place",
          ],
          "d",
          "Privileges must match what the hospital can support as well as what the doctor can do. Granting it because the surgeon is competent ignores that the patient's safety depends on ICU and blood availability too."
        ),
        mc(
          "A hospital grants a gynaecologist a new privilege for laparoscopic myomectomy. What is the appropriate next step?",
          [
            "Nothing further until reappointment in three years, when her outcomes for the procedure will be reviewed",
            "A focused review, with her first several cases proctored or reviewed in detail",
            "A requirement that she repeat her fellowship",
            "Restricting her to daytime cases permanently",
          ],
          "b",
          "New privileges start with focused review to confirm competence in this setting. Waiting until reappointment means any problem surfaces only after years of cases."
        ),
        mc(
          "At reappointment, a surgeon's file shows a current licence and indemnity, but he has not performed a privileged procedure, thyroidectomy, in two years. What should the committee do?",
          [
            "Renew all privileges, since his licence and indemnity are current and no complaint has been made against him",
            "Remove all of his privileges",
            "Ask if the thyroidectomy privilege is still needed and, if so, for evidence of current competence",
            "Refer him to the MDCN",
          ],
          "c",
          "Reappointment should rest on activity and performance, not only on a current licence, so an unused privilege needs review. Removing all privileges goes far beyond what the evidence supports."
        ),
        mc(
          "A visiting surgeon operates at 6pm and leaves. At 2am the patient deteriorates and the resident cannot reach him. No one else is privileged to take over. Which change addresses the root of the problem?",
          [
            "Requiring the agreement and rota to name overnight cover and response times before any case is booked",
            "Asking visiting surgeons to keep their phones on overnight and to return calls from residents within an hour",
            "Banning evening operations",
            "Disciplining the resident for not escalating",
          ],
          "a",
          "The failure was that no responsible cover existed, which the agreement and rota must settle before operating. Asking surgeons to keep their phones on relies on one person being reachable at 2am, which is exactly what failed."
        ),
        mc(
          "A diaspora surgical team arrives for a ten-day programme of 25 joint replacements. Two members hold only foreign licences and have not applied to the MDCN. What should the hospital do?",
          [
            "Allow them to operate under the supervision of a local surgeon",
            "Allow them to assist only, without operating",
            "Grant temporary privileges for the ten days",
            "Not allow them to treat patients until they hold MDCN registration through the appropriate route",
          ],
          "d",
          "Practitioners need MDCN registration to practise in Nigeria; a hospital cannot grant privileges to someone who is not registered. Temporary privileges are tempting, but they can be granted only after registration and licence are verified."
        ),
        ms(
          "Which of these belong in a visiting consultant's agreement? Select all that apply.",
          [
            "The privileges granted, from the same process as other doctors",
            "Named post-operative and overnight cover with response times",
            "A clause that the consultant's fees fall if complications rise",
            "Whose indemnity covers the work, with evidence it is in force",
            "A waiver of the consultant's duty to take part in M&M review",
          ],
          "abd",
          "Privileges, cover and indemnity are core clinical terms. Fees belong in a separate commercial schedule so clinical duties are not traded against money, and visiting consultants must take part in M&M review, not be excused from it."
        ),
        mc(
          "Over six months, a sessional surgeon has had 3 unplanned returns to theatre in 48 procedures against 1 in 110 for colleagues, and nurses report she declines the safety checklist. What should the Medical Advisory Committee do first?",
          [
            "Terminate her sessional contract, since her return-to-theatre rate is several times the department's and nurses have complained",
            "Tell her the concern and evidence, start an outside focused review of her cases, and require the checklist now",
            "Wait for another six months of data",
            "Report her to the MDCN immediately",
          ],
          "b",
          "The pattern warrants a structured, fair review with interim safeguards, and the checklist is a requirement she can be held to at once. Terminating or reporting before the review skips the fair process that makes any later decision defensible."
        ),
        mc(
          "A hospital's employment process for a doctor will take three months, but credible evidence shows his practice in one procedure is putting patients at risk. What should happen to that privilege?",
          [
            "It should continue until the employment process ends, so that the doctor's right to a fair hearing is protected",
            "It should be suspended only if the doctor agrees",
            "It should be left to the HR department to decide",
            "Restrict or suspend it now through clinical governance, with the doctor heard",
          ],
          "d",
          "Privileges are a clinical governance matter and patient safety cannot wait for an employment timetable, though fair process still applies. Leaving it to HR mixes the two processes and delays protection for patients."
        ),
      ],
    },
  ],
};

export default expansion;
