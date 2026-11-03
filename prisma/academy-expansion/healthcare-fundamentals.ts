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
  slug: "healthcare-fundamentals",
  topUp: [
    {
      moduleSlug: "health-systems-overview",
      questions: [
        mc(
          "A state government opens 20 new primary health centres, each fully equipped. A year later most see fewer than five patients a day and several are locked on weekdays because no midwife or nurse has been posted. Which building block has failed first?",
          [
            "Health workforce",
            "Service delivery",
            "Access to essential medicines",
            "Health information systems",
          ],
          "a",
          "The centres exist and are equipped, but nobody has been posted to run them, so the workforce block is the first failure. Service delivery is the tempting answer, but low service delivery is the symptom; the cause is the missing staff."
        ),
        mc(
          "A consultant moves from a Lagos private hospital engagement to one in Nairobi, where most of the client's patients are covered by the Social Health Authority. Which shift in focus does the archetype framework predict?",
          [
            "From commercial performance to efficiency within a fixed budget, because government funds and runs most facilities there",
            "From cash collection to donor reporting",
            "From self-pay pricing to claims processing, accreditation and provider payment terms",
            "No shift, because both are mixed private-public systems",
          ],
          "c",
          "Kenya's SHA is a social health insurance model, where hospital performance turns on claims, accreditation and payment terms. Efficiency within a fixed budget describes a tax-funded system, which is the most common confusion."
        ),
        mc(
          "A local government area with about 1,500 births a year reports that its maternal mortality ratio fell from 800 to 600 per 100,000 live births in one year. What is the most sensible first reading?",
          [
            "A fall of 200 per 100,000 is a 25% reduction in one year, which proves the new programme is working",
            "The ratio is now close to the national figure, so the LGA no longer needs support",
            "The ratio should be ignored because MMR is a national measure only",
            "The change is about three deaths, which may be chance, so look at several years and each death",
          ],
          "d",
          "With 1,500 births, 800 per 100,000 is 12 deaths and 600 is 9, so the whole change is three deaths and could be chance. Treating the headline fall as proof is the common mistake; asking 'compared to what?' means checking the trend and the cases."
        ),
        mc(
          "In a country where most health spending is paid out of pocket by households at the point of care, what does this mean for a private hospital client?",
          [
            "Demand is protected because patients have no alternative, so the hospital can raise prices without losing volume",
            "Patients are price-sensitive, cash and deposits drive revenue, and an economic downturn hits volumes quickly",
            "The hospital should stop offering self-pay services and wait for insurance",
            "Out-of-pocket spending only affects public facilities",
          ],
          "b",
          "When households pay directly, every price and deposit decision affects whether patients come, and a fall in incomes shows up in volumes fast. Assuming demand is protected ignores that patients delay or skip care when they cannot pay."
        ),
        mc(
          "An 80-bed hospital's board asks whether its beds are earning their keep compared with a competitor of a different size. Which single facility metric answers that most directly?",
          [
            "Total annual revenue",
            "Outpatient visits per day",
            "Revenue per bed per day",
            "Patient-to-nurse ratio",
          ],
          "c",
          "Revenue per bed per day adjusts for size, so it compares how hard each bed works across hospitals of different sizes. Total revenue is tempting but favours the bigger hospital regardless of how well it uses its beds."
        ),
      ],
    },
    {
      moduleSlug: "hospital-operations",
      questions: [
        mc(
          "A 100-bed hospital has on average 70 beds occupied and an ALOS of 5 days. Roughly how many inpatient admissions does it handle in a year?",
          ["About 5,100", "About 7,300", "About 25,500", "About 3,650"],
          "a",
          "Occupied bed-days are 70 x 365 = 25,550 a year; dividing by 5 days per stay gives about 5,100 admissions. 25,500 is the bed-day figure, not admissions, which is the usual slip."
        ),
        mc(
          "A hospital has 2 theatres staffed 8 hours a day for 22 days a month. Last month the theatres recorded 190 hours of actual operating time. What was theatre utilisation, and how does it compare with the target in the module?",
          [
            "About 86%, which is above target",
            "About 74%, which is on target",
            "About 54%, well below the 70-80% target",
            "About 27%, because each theatre must be counted separately",
          ],
          "c",
          "Available time is 2 x 8 x 22 = 352 hours, and 190 / 352 is about 54%, inside the 40-55% range the module says is common and well short of 70-80%. Counting only one theatre's hours inflates the figure."
        ),
        mc(
          "Patients in a hospital's emergency department wait up to six hours for a bed. At 4pm the wards are 92% full, but most discharges leave after 5pm because bills are only prepared once the discharge order is written. What is the best first fix?",
          [
            "Add ten beds to the medical ward so that ED patients no longer wait while the wards are full in the afternoon",
            "Add a second ED doctor on the afternoon shift",
            "Admit ED patients to corridor trolleys until beds free up",
            "Decide discharges on the morning ward round and start billing the day before expected discharge",
          ],
          "d",
          "The beds exist but are released late because billing starts too late, so moving the discharge decision and billing earlier frees beds when ED needs them. Adding beds is the tempting answer but treats a process delay as a capacity shortage."
        ),
        mc(
          "Over six months a hospital's bed occupancy rose from 75% to 88%. The number of beds and the number of admissions per month did not change. What is the most likely explanation?",
          [
            "The hospital has become more popular",
            "Average length of stay has risen",
            "Bed turnover has risen",
            "More patients are being admitted from the emergency department",
          ],
          "b",
          "With beds and admissions flat, occupancy can only rise if each patient stays longer, so ALOS has gone up. Rising turnover is the tempting answer, but turnover would rise only with more patients per bed, and admissions have not changed."
        ),
        mc(
          "A hospital with weak billing controls bills about N50m a month. If its leakage sits in the typical range found by revenue cycle audits, roughly how much is it losing each month?",
          ["N4m to N7.5m", "N0.5m to N1.5m", "N12.5m to N15m", "Under N0.5m"],
          "a",
          "The module puts typical leakage at 8-15%, which on N50m is N4m to N7.5m a month. The lower ranges assume controls are already strong, which this hospital does not have."
        ),
      ],
    },
    {
      moduleSlug: "healthcare-financing",
      questions: [
        mc(
          "A clinic receives capitation of N1,500 per enrollee per month for 4,000 HMO enrollees. Its monthly cost of serving them is N7.2m. What is its monthly position on the contract?",
          ["A surplus of N1.2m", "A loss of N1.2m", "Break-even", "A loss of N7.2m"],
          "b",
          "Capitation income is 4,000 x N1,500 = N6m, against N7.2m of cost, so the clinic loses N1.2m a month. A loss of N7.2m ignores the capitation income altogether."
        ),
        mc(
          "Under a DRG-style payment, an insurer pays a fixed N450,000 per caesarean section. The hospital's cost is about N200,000 for theatre plus N60,000 per inpatient day, and its average stay is 5 days. Which change improves its margin on these cases?",
          [
            "Ordering more laboratory tests per case so more can be billed",
            "Keeping patients an extra day to reduce readmissions",
            "Reducing the average stay safely to 3 or 4 days",
            "Coding more cases as complicated to move them to a higher group",
          ],
          "c",
          "Cost is N200,000 + 5 x N60,000 = N500,000, so each case loses N50,000; under a fixed payment the margin improves by lowering cost per case, which a safe shorter stay does. Extra tests add cost without adding payment, and coding cases as complicated when they are not is fraud, not a lever."
        ),
        mc(
          "An HMO that pays a hospital fee-for-service starts requiring pre-authorisation for every MRI. What problem is the HMO trying to control?",
          [
            "Late submission of claims",
            "Fraudulent patient identities used to obtain scans under another enrollee's policy",
            "The hospital's low tariffs",
            "The volume incentive of fee-for-service",
          ],
          "d",
          "Fee-for-service rewards volume, so payors use pre-authorisation to check that each high-cost service is needed before it is done. Late claims and identity fraud are real problems but are handled by other controls."
        ),
        mc(
          "A hospital earns N100m a month: 50% cash, 30% from HMOs paying on average 90 days after service, and 20% from a state scheme paying on average 180 days after service. Roughly how much revenue is waiting to be collected at any one time?",
          ["N50m", "N90m", "N150m", "N210m"],
          "d",
          "HMO revenue of N30m a month outstanding for three months is N90m, and scheme revenue of N20m a month outstanding for six months is N120m, so about N210m is tied up. N90m counts only the HMOs, and N50m counts only one month of insured revenue."
        ),
        mc(
          "Which of these hospitals is most exposed to a sharp fall in household incomes?",
          [
            "A hospital with 80% of revenue from cash-paying patients",
            "A hospital with 60% of revenue from NHIA and state scheme patients",
            "A hospital with revenue split evenly across cash, HMOs and corporates",
            "A hospital with 70% of revenue from large corporate retainers",
          ],
          "a",
          "When households pay most of the bill, a fall in incomes cuts volumes directly. The NHIA-heavy hospital is tempting, but its main exposure is to government payment delays, not household incomes."
        ),
      ],
    },
  ],
  modules: [
    {
      slug: "clinical-quality-intro",
      name: "Clinical Quality and Patient Safety: The Basics",
      description:
        "What quality of care means, how patients come to harm in hospitals, what you can see on a ward walk-round, and who sets and checks standards in Nigeria.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "What quality means in a hospital",
            body: p(
              "Quality of care has a working definition that most health systems use: care that is safe, effective, patient-centred, timely, efficient and equitable. These six dimensions come from the US Institute of Medicine's 2001 report and have been adopted, with small changes, by the WHO. They matter because a hospital can be strong on one and failing on another, and owners often see only one.",
              "Safe means patients are not harmed by the care meant to help them. Effective means treatment follows the evidence: the right drug, test or procedure for the condition, and not the wrong one. Patient-centred means care respects what the patient needs and is told. Timely means waits and delays do not cause harm. Efficient means resources are not wasted. Equitable means quality does not drop because of who the patient is, such as an NHIA enrollee being seen last.",
              "A second lens, from Avedis Donabedian, is structure, process and outcome. Structure is what the hospital has: staff, equipment, buildings, policies. Process is what is done: whether the doctor checked blood pressure, whether the antibiotic was given on time. Outcome is what happened to the patient: recovery, infection, death, satisfaction.",
              "Most hospital owners in Lagos and Abuja think about quality as structure. They buy a new CT scanner, renovate the ward and hire a consultant with a foreign fellowship. Structure is necessary but not sufficient. A hospital with an excellent theatre and no routine for counting swabs will still leave a swab in a patient.",
              "Outcomes are what patients care about, but they are slow and noisy to measure. A 60-bed hospital doing 30 caesarean sections a month might see one wound infection in a good month and four in a bad one, and that swing can be chance. Processes are faster to measure and easier to act on: if only 55% of caesarean patients received their antibiotic within an hour before incision, the hospital knows exactly what to fix. Good quality work uses all three, and links each process to the outcome it is meant to protect."
            ),
          },
          {
            title: "How patients come to harm",
            body: p(
              "Most harm in hospitals comes from predictable, repeated failures in ordinary processes, not from rare mistakes by bad clinicians. The WHO estimates that around one in ten patients is harmed in the course of health care, and that about half of that harm is preventable. In a hospital with 400 admissions a month, that points to dozens of patients a month.",
              "The common harms are well known:",
              "- Medication errors: wrong drug, wrong dose, wrong patient, missed dose, a known allergy ignored.\n- Infections acquired in hospital: wound infections after surgery, drip-site and catheter infections, infections spread between patients on a crowded ward.\n- Falls, especially among elderly and sedated patients.\n- Pressure sores in patients who are not turned.\n- Missed deterioration: a patient whose pulse and breathing worsen over a night shift with nobody acting on the chart.\n- Wrong patient or wrong site: a test, transfusion or operation done on the wrong person or the wrong side.\n- Maternal harm, above all postpartum haemorrhage that is not anticipated or treated quickly.",
              "James Reason's Swiss cheese model explains why these keep happening. Every process has several layers of defence: the prescriber, the pharmacist, the nurse, the label, the chart. Each layer has holes. Harm reaches the patient when the holes line up on one day. A tired junior doctor writes an unclear dose, the pharmacy is out of the usual strength and substitutes another, the nurse is covering two wards, and the patient gets ten times the intended dose.",
              "This view changes what you do about harm. If the response to every incident is to find and punish the person closest to it, staff stop reporting, the holes stay in place and the same harm recurs with a different nurse. If the response is to ask which layers failed and why, the hospital can close holes for everyone.",
              "For a consultant new to this, the practical point is to ask about processes before people. When a client says 'our nurses are careless', the useful questions are how drugs are stored, how orders are written, how many patients each nurse covers at night, and what happens when something goes wrong."
            ),
          },
          {
            title: "What you can see on a walk-round",
            body: p(
              "A one-hour walk through wards, theatre and pharmacy tells you a great deal about quality before any data is collected. You are not inspecting or judging individuals. You are looking for whether the basic defences exist and are used, and you should go with the matron or a senior nurse, not alone.",
              "On a ward, look for hand gel or a sink at the point of care, at the bed and not only at the nurses' station, and watch whether staff use it between patients. Check whether patients wear identity bands with at least two identifiers, and whether staff check them before giving drugs. Look at a few observation charts: are temperature, pulse, blood pressure and breathing rate recorded at the frequency ordered, and is there any rule for calling a doctor when they worsen? Look at the drug trolley and the controlled drugs register: are drugs labelled, in date and locked, and does the register balance?",
              "In theatre, ask to see the surgical safety checklist for the last few cases and whether every part is signed. Ask how swabs and instruments are counted and where the count is recorded. Ask how instruments are sterilised and how the hospital knows each cycle worked.",
              "In pharmacy and stores, look for expired stock, drugs stored in heat, and look-alike packs sitting side by side.",
              "Talk to staff. Ask a nurse what she would do if she gave a wrong dose. If the answer is 'hide it' or 'I would be sacked', the hospital has a reporting problem whatever its policy says. Ask the medical director when the last death was reviewed and what changed as a result.",
              "Write down what you saw, with counts where you can: 3 of 12 patients without identity bands, gel empty at 2 of 4 dispensers, 1 controlled drugs register not balanced since August. Counts turn impressions into findings the hospital can check and act on, and they protect you from being dismissed as having seen one bad moment."
            ),
          },
          {
            title: "Who sets and checks the standards in Nigeria",
            body: p(
              "Quality in Nigerian health care is checked at three levels: the individual professional, the facility, and voluntary accreditation. A consultant needs to know which body covers what, because a client's question about standards usually belongs to one of them.",
              "Professionals are regulated by their councils. The Medical and Dental Council of Nigeria (MDCN) registers doctors and dentists, issues practising licences and handles discipline. The Nursing and Midwifery Council of Nigeria (NMCN) does the same for nurses and midwives. The Pharmacists Council of Nigeria registers pharmacists and pharmacy premises, and the Medical Laboratory Science Council of Nigeria regulates laboratory scientists and laboratories. A hospital that employs an unlicensed professional carries the risk, not just the individual.",
              "Facilities are registered and monitored by the states. In Lagos, the Health Facility Monitoring and Accreditation Agency (HEFAMAA) registers private and public health facilities, inspects them and can close those that fall short. Other states run their own registration and monitoring, through the state ministry of health or an agency set up for it, and the rules differ. NAFDAC regulates medicines, medical devices and their importation. Registration is a floor: it says the facility may operate, not that its care is good.",
              "Payors add their own checks. The NHIA accredits providers before they can see its enrollees, state health insurance schemes do the same, and many HMOs inspect facilities before adding them to their networks.",
              "Above all of this sits voluntary accreditation. SafeCare, developed with the PharmAccess Foundation, grades facilities in steps against standards designed for resource-limited settings. Joint Commission International (JCI) is the international benchmark, held by a small number of hospitals in Nigeria. Both are chosen by the hospital, not required by law, and both demand far more than registration.",
              "When a client says 'we are fully accredited', ask which of these they mean. A HEFAMAA registration certificate and a SafeCare level are very different statements about quality."
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster covered what quality means, how harm happens, what a walk-round shows and who regulates what. That is enough to hold an informed conversation with a medical director and to spot obvious gaps. It is not enough to fix them.",
              "The paid track, Clinical Governance & Accreditation, picks up from here and assumes you have done this module. It teaches:",
              "- How to build clinical governance that works: the seven pillars, a governance committee with real authority, specialty quality leads, and how to score a hospital against each pillar.\n- How to prepare a hospital for SafeCare or JCI: the International Patient Safety Goals, the baseline mock survey, sequencing the gaps over 18 to 24 months, and tracer methodology.\n- How to prevent and investigate harm: failure mode and effects analysis before a process goes live, root cause analysis after an incident, and a just culture that gets staff reporting.\n- How to run clinical audits and measure outcomes fairly, and how to credential and privilege doctors, including visiting consultants, so that each one does only what they are qualified and supported to do.",
              "The track suits consultants who will run quality or accreditation work for hospital clients, and anyone who will sit on or advise a hospital's clinical governance committee. Each module ends with a practical exercise built on a hospital with real numbers, and the questions test whether you can apply the method, not whether you remember the terms.",
              "If your work is mainly commercial or operational, this taster may be all the clinical quality grounding you need. If you are often the one telling a client their care is unsafe, or helping them prove it is safe to an HMO, a regulator or an investor, take the track."
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Turning a walk-round into findings",
            instruction:
              "You walked a 40-bed medical ward at a private hospital in Port Harcourt. You saw: 7 of 31 patients without identity bands; gel dispensers at 3 of 8 bedside points, 2 of them empty; observation charts for 10 patients, of which 4 had no entry for over 8 hours although 4-hourly observations were ordered; a controlled drugs register last balanced 6 weeks ago; and a nurse who said a wrong dose 'would be handled quietly'. Write five findings, each with a count and the harm it could lead to, then rank them by risk and say which two you would raise with the medical director first and why.",
          },
          {
            title: "Practice: Structure, process or outcome",
            instruction:
              "A hospital owner tells you quality has improved because the hospital bought a new anaesthetic machine for N38m, wound infections after caesarean section fell from 5 to 3 last quarter out of about 90 operations, and staff completed a one-day customer service course. Classify each claim as structure, process or outcome, say what each does and does not prove, and propose one process measure that would show whether caesarean care is actually safer.",
          },
        ],
      },
      resources: { tools: ["Ward Walk-Round Checklist", "Quality Dimensions Worksheet"] },
      questions: [
        mc(
          "A hospital owner says quality has improved because the hospital has installed a new CT scanner and renovated two wards. In Donabedian's terms, what has the owner described?",
          [
            "An improvement in outcome",
            "An improvement in structure, which says nothing yet about process or outcome",
            "An improvement in process",
            "Proof of better patient-centred care, since patients will notice the new facilities",
          ],
          "b",
          "A scanner and renovated wards are things the hospital has, which is structure. Owners often treat structure as proof of better outcomes, but outcomes depend on what is done with the equipment."
        ),
        mc(
          "NHIA enrollees at a hospital wait on average three hours to see a doctor, while self-pay patients wait 40 minutes for the same clinic. Which quality dimensions does this most clearly fail?",
          [
            "Safety and effectiveness",
            "Efficiency only",
            "Equity and timeliness",
            "Effectiveness only",
          ],
          "c",
          "Quality differs by who is paying, which is an equity failure, and the long waits fail timeliness. Efficiency is tempting, but the hospital is not wasting resources here; it is rationing them unevenly."
        ),
        mc(
          "A 60-bed hospital performs about 30 caesarean sections a month. Wound infections were 1 in August and 4 in September. The owner wants to sack the theatre team. What is the most sensible response?",
          [
            "Agree, because infections quadrupled in a month and the theatre team is responsible for sterile technique",
            "Ignore the rise, because outcome numbers are always noise",
            "Wait for a full year of data before doing anything",
            "Treat the swing as possibly chance at this volume and check the processes behind it now",
          ],
          "d",
          "At 30 operations a month, a move from 1 to 4 can happen by chance, so it is a signal to check the processes, not proof that the team is at fault. Ignoring it is the opposite mistake: processes can be checked quickly and cheaply."
        ),
        mc(
          "A nurse gives a patient ten times the intended dose. The prescription was unclear, the pharmacy substituted a different strength, and the nurse was covering two wards. What does the Swiss cheese model suggest the hospital should do?",
          [
            "Find which layers of defence failed and close those gaps for every nurse and prescriber",
            "Dismiss the nurse, since she gave the drug and was the last check before it reached the patient",
            "Retrain the nurse and record a final warning",
            "Report the pharmacist to the Pharmacists Council",
          ],
          "a",
          "Harm got through because several defences failed on the same day, so fixing the prescribing, substitution and staffing gaps protects every patient. Punishing the person closest to the event leaves the gaps open and discourages reporting."
        ),
        mc(
          "Which of these questions to a ward nurse best tells you whether the hospital has a working incident reporting culture?",
          [
            "How many incident forms are in the file?",
            "Is there an incident reporting policy?",
            "What would you do if you gave a patient the wrong dose?",
            "Who is the hospital's quality officer?",
          ],
          "c",
          "The nurse's answer shows whether staff feel safe reporting, which no policy document can. A policy and a quality officer can exist while staff still hide errors."
        ),
        mc(
          "A client in Lagos shows you a HEFAMAA registration certificate and says the hospital is 'fully accredited'. What does the certificate actually show?",
          [
            "That the hospital meets international standards",
            "That it is registered with the state regulator and may operate, which is a minimum",
            "That the hospital has reached a SafeCare level",
            "That the NHIA has inspected and approved it to see enrollees under the national scheme",
          ],
          "b",
          "HEFAMAA registers and monitors facilities in Lagos; registration is the floor for operating. It is often confused with accreditation, but SafeCare, JCI and payor accreditation are separate, higher checks."
        ),
        mc(
          "A hospital wants to employ a nurse whose licence lapsed two years ago. Which body's register should be checked to confirm whether she can practise?",
          ["MDCN", "HEFAMAA", "NAFDAC", "NMCN"],
          "d",
          "The Nursing and Midwifery Council of Nigeria licenses nurses and midwives. HEFAMAA regulates facilities in Lagos, not the licences of individual nurses."
        ),
        ms(
          "On a walk-round of a surgical ward you record the following. Which are direct risks of patient harm that you should report as findings? Select all that apply.",
          [
            "5 of 20 patients have no identity band",
            "The ward has not been repainted in four years",
            "Observation charts for 3 patients have no entries for 10 hours although 4-hourly observations were ordered",
            "The nurses' station has no air conditioning",
            "Two look-alike drug packs are stored side by side in the trolley",
          ],
          "ace",
          "Missing identity bands risk wrong-patient errors, missed observations risk missed deterioration, and look-alike drugs stored together risk wrong-drug errors. Paint and air conditioning affect comfort and morale but are not direct safety defences."
        ),
        mc(
          "You are asked to write up a walk-round for the medical director. Which finding is written most usefully?",
          [
            "Gel was empty at 2 of 4 bedside dispensers on Ward B at 10am on Tuesday",
            "Hand hygiene on Ward B is poor",
            "Staff on Ward B do not care about infection control",
            "Ward B needs a hand hygiene campaign",
          ],
          "a",
          "A count with place and time is a finding the hospital can check and act on. The other statements are judgements or solutions without evidence, and the third blames staff for what may be a supply problem."
        ),
        mc(
          "Which statement correctly describes SafeCare and JCI in Nigeria?",
          [
            "Both are required by law for private hospitals",
            "SafeCare is run by the NHIA for insured patients and JCI is run by the Federal Ministry of Health",
            "Both are voluntary, chosen by the hospital, and demand much more than state registration",
            "JCI replaces HEFAMAA registration for hospitals in Lagos",
          ],
          "c",
          "SafeCare and JCI are voluntary accreditation schemes a hospital chooses to pursue, above the legal floor of state registration. Treating them as regulators is the common confusion; neither replaces registration."
        ),
      ],
    },
    {
      slug: "health-evidence-intro",
      name: "Evidence, Value and Measuring Results: The Basics",
      description:
        "How to judge a claim about what works, how to count results honestly with rates and baselines, and how to set cost against result when choosing between options.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Judging a claim about what works",
            body: p(
              "Every claim that something works rests on a comparison, stated or not, and the first job is to find it. When a vendor says its software cut waiting times by 40%, or a programme manager says a new protocol saved lives, ask: compared with what, measured how, and in whom?",
              "Evidence comes in grades of strength. At the weak end is the anecdote: one patient, one hospital, one good month. Next is a before-and-after comparison in one place: waiting times were 90 minutes in January and 55 minutes in June after the change. This is better, but many other things may have changed between January and June, including the season, the staff and the number of patients. Stronger still is a comparison with a similar group that did not get the change, measured over the same period. Strongest is a randomised trial, where chance decides who gets the change, or a systematic review that pools many good studies.",
              "Strength is not the only test. Ask whether the evidence fits your setting. A trial of a nurse-led clinic in a London hospital with full electronic records may not transfer to a 50-bed hospital in Kano on paper records and generator power. Local results, even weaker ones, sometimes tell you more about feasibility than a strong study from elsewhere.",
              "Ask who produced the evidence and who paid for it. A case study written by the vendor is marketing until someone independent checks it. Ask what was left out: a programme that reports the five facilities where it worked and not the fifteen where it did not is telling a selective story.",
              "Finally, ask what would have happened anyway. Malaria admissions fall every dry season. Outpatient numbers rise after a competitor closes. If a hospital launched a new triage system in October and admissions fell in December, the dry season may deserve most of the credit. Methods exist to separate the effect of a change from what would have happened without it, and they are taught in the paid track."
            ),
          },
          {
            title: "Counting well: rates, denominators and baselines",
            body: p(
              "A number without a denominator is rarely a result. 'We had 12 wound infections this quarter' means one thing in a hospital that did 40 operations and another in one that did 400. Turn counts into rates: 12 infections in 400 operations is 3%, and 12 in 40 is 30%.",
              "Choose the denominator that matches the risk. Infections after surgery are counted per operation. Falls on a ward are usually counted per 1,000 patient-days, because a ward with longer stays has more days on which a fall can happen. Maternal deaths are counted per 100,000 live births. Using total admissions as the denominator for everything hides real differences.",
              "Every result needs a baseline: the value before the change, measured the same way. A hospital that says its caesarean infection rate is now 4% has told you nothing about improvement unless you know it was 9% last year, measured with the same definition and the same follow-up period. If the definition changed, the comparison is not valid.",
              "Watch percentages and percentage points. If clinic attendance for antenatal care rises from 40% to 50% of booked women, that is a rise of 10 percentage points, or 25% in relative terms. Both are true; reporting only the larger-sounding one misleads.",
              "Small numbers swing. A clinic with 20 deliveries a month can see two complications one month and none the next without anything changing. Before declaring success or failure, look at several months, not one.",
              "A useful result has a clear definition, which you can write as a numerator over a denominator with a data source and a period. For example: women who attended four or more antenatal visits, divided by women who delivered at the facility, from the delivery register, each quarter. If you cannot write it this plainly, the number will be counted differently by different people, and the figures will not add up when someone checks."
            ),
          },
          {
            title: "Value: setting cost against result",
            body: p(
              "Value means what you get for what you spend, so a result is only half the picture until the cost sits beside it. A programme that saves ten lives for N5m and one that saves twelve for N40m are not ranked by the number of lives alone.",
              "The simplest tool is cost per result. Take two ways to reduce missed antenatal appointments at a group of clinics. Option A sends SMS reminders, costs N1.2m a year and adds about 300 attended visits. Option B pays community health workers to follow up women at home, costs N4.5m a year and adds about 900 visits. Cost per extra visit is N4,000 for A and N5,000 for B. A is cheaper per visit; B delivers three times as many.",
              "Which is better depends on the question. If the budget is N1.5m, A is the only option that fits. If the aim is to reach as many women as possible and the money is there, B may be right, and the extra N3.3m buys 600 more visits at N5,500 each. That last figure, the cost of the additional result when moving from one option to the next, is the one decision makers often need, and it is different from either average.",
              "Be clear about whose cost you are counting. A hospital counts what it pays. A government counts what the public purse pays. A household counts transport, lost wages and fees. A clinic that moves a test from the hospital to the patient's own expense may look cheaper to itself and cost the patient more.",
              "Keep the results comparable. Visits are not lives, and a programme that adds visits may or may not change outcomes. When options produce different kinds of result, a common measure is needed, and building one is a skill in its own right.",
              "In practice, a short table showing each option's cost, its result and its cost per result, with the main assumption behind each figure, already improves most decisions a client makes."
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster covered how to judge a claim, how to count results with rates and baselines, and how to set cost against result. With it you can challenge a weak claim in a meeting and lay out options sensibly. It does not give you the methods to produce evidence that a funder, ministry or board would rely on.",
              "The paid track, Health Economics & M&E, assumes you have done this module and goes further. It teaches:",
              "- Cost-effectiveness analysis: defining the comparator, the incremental cost-effectiveness ratio, DALYs, the thresholds used in sub-Saharan Africa, and sensitivity analysis on the uncertain inputs.\n- Costing health services properly for evaluation and tariff setting: activity-based costing, step-down allocation of overheads, and unit costs per visit, test or admission.\n- Impact evaluation: building a counterfactual, when a before-after comparison is honest and when it is not, and designs such as difference-in-differences.\n- Logframes, theories of change and M&E frameworks, with indicator definitions, data quality checks and reporting through DHIS2.",
              "The track suits consultants who will evaluate programmes for donors or government, build the business case for a new service, or set prices that must stand up to an HMO or the NHIA. It also suits anyone who has to defend numbers in front of people who will check them.",
              "If your work is mainly hospital operations or patient-facing services, the habits in this taster will cover most of what you need day to day. Take the track when you are asked to prove something works, to work out what a service really costs, or to design how a programme will be measured from the start."
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Testing a vendor's claim",
            instruction:
              "A software vendor tells a 120-bed hospital in Abuja that its queue system cut outpatient waiting time from 95 minutes to 50 minutes at a client hospital, based on one week in March before installation and one week in July after. Write six questions you would ask before advising the hospital to pay N14m for the system, and say for each what answer would make you trust the claim more.",
          },
          {
            title: "Practice: Cost per result",
            instruction:
              "A state primary health care board has N6m to raise childhood immunisation completion. Option A, a reminder and defaulter-tracing system, costs N2m and is expected to complete 400 more children. Option B, outreach sessions in hard-to-reach wards, costs N6m and is expected to complete 900 more. Calculate cost per extra child for each, the cost per extra child of moving from A to B, and write a three-line recommendation stating the main assumption that would change it.",
          },
        ],
      },
      resources: { tools: ["Evidence Strength Checklist", "Indicator Definition Template", "Cost per Result Worksheet"] },
      questions: [
        mc(
          "A hospital introduced a new triage system in October. Malaria admissions fell 30% by December. The medical director credits the triage system. What is the most important question to ask first?",
          [
            "Did admissions fall by a similar amount in the same months of previous years?",
            "How much did the triage system cost, and was the cost justified by the fall in admissions?",
            "Did staff like the new system?",
            "Was the system bought from a reputable vendor?",
          ],
          "a",
          "Malaria admissions fall with the dry season, so the first question is what would have happened anyway. Cost and staff views matter later but cannot tell you whether the system caused the fall."
        ),
        mc(
          "Two hospitals each report 12 surgical site infections last quarter. Hospital A did 400 operations; Hospital B did 80. What should you conclude?",
          [
            "The hospitals perform the same",
            "Hospital A is worse because it is bigger",
            "Hospital B's rate is 15% against A's 3%, so B has the more serious problem",
            "No comparison is possible without knowing their bed numbers",
          ],
          "c",
          "12 of 400 is 3% and 12 of 80 is 15%, so the same count hides a fivefold difference in rate. The right denominator for surgical infections is operations, not beds."
        ),
        mc(
          "Antenatal clinic attendance among booked women rises from 40% to 50%. Which statement is accurate?",
          [
            "Attendance rose by 10%, the difference between the two figures",
            "Attendance rose by 25 percentage points",
            "Attendance rose by 50%",
            "It rose 10 percentage points, a 25% relative rise",
          ],
          "d",
          "The difference between 40% and 50% is 10 percentage points, and 10 is a quarter of 40, so the relative rise is 25%. Saying 'rose by 10%' confuses the two."
        ),
        mc(
          "A ward manager wants to compare falls between a surgical ward with an average stay of 3 days and a care-of-the-elderly ward with an average stay of 12 days. Which denominator gives the fairest comparison?",
          [
            "Falls per admission",
            "Falls per 1,000 patient-days",
            "Falls per bed",
            "Falls per nurse",
          ],
          "b",
          "Each day in hospital is a day on which a fall can happen, so patient-days adjusts for the longer stays on the elderly ward. Falls per admission is tempting but makes the long-stay ward look worse simply because its patients stay longer."
        ),
        mc(
          "A hospital reports that its caesarean infection rate is 4% this year against 9% last year. You learn that last year counted infections up to 30 days after surgery, and this year counts only infections seen before discharge. What follows?",
          [
            "The comparison is invalid: the new definition misses infections after discharge",
            "The improvement is real but smaller than reported, so the hospital should restate it as about half",
            "The improvement is larger than reported",
            "The hospital should report 6.5%, the average of the two years",
          ],
          "a",
          "Changing the follow-up window changes what is counted, and many wound infections appear after discharge, so the fall may be an artefact of the definition. Assuming a smaller real improvement still trusts a comparison that is broken."
        ),
        mc(
          "Option A costs N1.2m and adds 300 attended visits. Option B costs N4.5m and adds 900 visits. What does each additional visit cost when moving from A to B?",
          ["N4,000", "N5,000", "N5,500", "N15,000"],
          "c",
          "B costs N3.3m more and adds 600 more visits, so each additional visit costs N5,500. N5,000 is B's average cost per visit, which is not what the extra money buys."
        ),
        mc(
          "A clinic stops providing a malaria test free and asks patients to buy it at a nearby laboratory. The clinic reports lower cost per patient. Whose cost has been left out?",
          [
            "The HMO's cost",
            "The patient's cost of the test, the trip and the time",
            "The government's cost",
            "No cost has been left out, since the clinic pays less",
          ],
          "b",
          "The cost has moved to the household rather than disappeared. Judging only by the clinic's own books misses who now pays."
        ),
        ms(
          "A programme report claims success. Which of these should make you less confident in the claim? Select all that apply.",
          [
            "The results were written up by the vendor that sold the programme",
            "The report covers the 5 facilities where it worked and does not mention the 15 others",
            "The baseline was measured with the same definition as the follow-up",
            "The comparison is one good month after launch against one poor month before",
            "The results were checked by an independent reviewer",
          ],
          "abd",
          "A vendor's own write-up, a selective set of facilities and a single month either side are all reasons for doubt. A matching definition and independent checking are signs of a stronger claim, not a weaker one."
        ),
        mc(
          "A published randomised trial shows a nurse-led hypertension clinic works well in a London teaching hospital with full electronic records. A 50-bed hospital in Kano on paper records asks if it should copy the model. What is the best advice?",
          [
            "Adopt it unchanged, since a randomised trial is the strongest evidence and local adaptation weakens it",
            "Reject it, since evidence from abroad never applies",
            "Ignore the trial and rely on staff opinion",
            "Treat it as strong evidence the idea can work, then pilot it locally to test feasibility",
          ],
          "d",
          "A strong study shows the idea can work, but fit with local staffing, records and power must be checked. Adopting it unchanged ignores that the conditions that made it work may be missing."
        ),
        mc(
          "Which is the most usable definition of an antenatal result?",
          [
            "Better antenatal care for all pregnant women in the catchment area, as reported by the clinic's midwives each month",
            "Women with four or more antenatal visits over women who delivered here, from the delivery register, quarterly",
            "Number of antenatal visits",
            "Percentage of women satisfied with antenatal care",
          ],
          "b",
          "It states the numerator, denominator, data source and period, so anyone counting it gets the same answer. A raw count of visits has no denominator and rises simply if more women book."
        ),
      ],
    },
    {
      slug: "government-health-intro",
      name: "Government as a Health Client: The Basics",
      description:
        "Who does what across federal, state and local government in Nigerian health, how the budget moves from appropriation to cash, how government buys and pays, and how donors fit in.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Who does what: federal, state and local",
            body: p(
              "Nigerian public health care is split across three tiers of government, and most mistakes in government work come from talking to the wrong one. Roughly, the federal level sets policy and runs tertiary hospitals, the states run secondary care and most regulation of facilities, and local governments have historically carried primary care, now largely coordinated through state boards.",
              "At the federal level, the Federal Ministry of Health and Social Welfare sets national policy and oversees the federal teaching hospitals and federal medical centres. Agencies under it carry specific mandates. The National Primary Health Care Development Agency (NPHCDA) leads primary care and immunisation. The National Health Insurance Authority (NHIA) regulates and runs national health insurance under the NHIA Act 2022. The Nigeria Centre for Disease Control and Prevention (NCDC) leads outbreak detection and response. NAFDAC regulates medicines, food and devices.",
              "Each state has a ministry of health headed by a Commissioner. Most states have a hospitals management board or service commission that runs general hospitals, a state primary health care board or agency that brings primary care staff and funds under one roof, and a state health insurance agency. Some states have their own facility regulator, such as HEFAMAA in Lagos.",
              "Local government areas employ much of the primary care workforce and own many primary health centres, though in most states day-to-day management now sits with the state board. Ward development committees link communities to their health centres.",
              "Inside each ministry, know the difference between political and career office holders. The Minister or Commissioner is a political appointee who sets direction and can change with an election or a reshuffle. The Permanent Secretary is the senior career civil servant and the accounting officer, responsible for how money is spent. Directors lead departments such as planning, public health or hospital services. In an agency, the Director General or Executive Secretary is the accounting officer.",
              "A project championed by a Commissioner but unknown to the Permanent Secretary and the Director of Planning is at risk the day the Commissioner moves."
            ),
          },
          {
            title: "How the money moves: the budget cycle",
            body: p(
              "Money written in a government budget is permission to spend, not cash, and a consultant who confuses the two will go unpaid. Federal and state budgets follow a January to December fiscal year, and the gap between what is approved and what is released is often large.",
              "The cycle starts mid-year. The finance ministry prepares a medium-term expenditure framework and fiscal strategy setting overall spending limits. A budget call circular asks each ministry, department and agency to submit proposals within its ceiling. The ministry of health ranks its priorities, often in negotiation with its agencies and hospitals. The executive then presents an appropriation bill to the legislature: the National Assembly federally, the State House of Assembly in each state. After hearings and amendments it is passed and signed into the appropriation act.",
              "Spending then depends on releases. The finance ministry and the accountant general release funds against the approved lines, with cash backing, through the year. Personnel costs are usually paid first and most reliably. Overheads come next. Capital releases, for buildings, equipment and projects, are the most likely to arrive late or fall short of the approved figure.",
              "Three words matter:",
              "- Appropriation: the amount the act approves for a line.\n- Release: the amount authorised to be spent in a period.\n- Cash: what reaches the account and can actually pay a supplier.",
              "A line of N200m appropriated for primary health centre renovation might see N80m released by September and N50m in cash by December. Any work planned against the full N200m will stall.",
              "For a consultant, this has direct consequences. Before agreeing work, ask which budget line will pay for it and how much of that line has been released this year. Expect slow payment in the first quarter, while a new budget is being passed and the first releases are made, and in the last months of the year, when releases are squeezed. Recurrent lines are safer than capital ones."
            ),
          },
          {
            title: "Buying and paying: procurement and contracts",
            body: p(
              "Government cannot simply choose a supplier and pay an invoice: it buys through a procurement process set by law, and the process shapes how long work takes and what it can be. At the federal level the Public Procurement Act 2007 governs procurement, with the Bureau of Public Procurement as regulator. Most states have their own procurement laws and agencies, such as the Lagos State Public Procurement Agency.",
              "A typical purchase moves through these stages. The need is identified and should appear in the ministry's procurement plan for the year. A method is chosen: open competitive bidding is the default, with selective tendering, requests for quotation or direct procurement allowed in defined circumstances that must be justified. Bids are evaluated against published criteria. The contract value decides who must approve the award: the accounting officer for smaller sums, a tenders board for larger ones, and the Federal Executive Council or the state executive council above the highest thresholds. Only then is the contract signed.",
              "Consulting services are bought in a similar way, often by asking for technical and financial proposals separately and scoring quality before price.",
              "Payment also has steps. The ministry certifies that the work was delivered, raises a payment voucher, checks it internally and sends it for payment from the treasury account. Federal funds sit in the Treasury Single Account, so the ministry cannot pay from a commercial bank account of its own. Withholding tax and VAT are deducted at source, so the amount received is less than the invoice. A clean process can still take weeks; a disputed or poorly documented one takes months.",
              "Practical habits help. Make sure the scope, deliverables and payment milestones are in the signed contract, not in a meeting. Keep evidence that each deliverable was received, such as a signed acceptance letter. Build in the time approvals take.",
              "Integrity rules are firm. Any request for a payment to speed approval or payment is a request for a bribe, whatever it is called, and must be refused and reported inside the firm."
            ),
          },
          {
            title: "Development partners and donors",
            body: p(
              "A large share of Nigeria's public health spending on immunisation, HIV, TB, malaria and maternal health has come from development partners, and a consultant on a government project is often paid by one of them. Knowing who they are and how their money moves avoids confusion about who the client is.",
              "The main groups are:",
              "- Multilateral funds and agencies: the Global Fund for HIV, TB and malaria; Gavi for vaccines; UNICEF and the WHO for technical support and supplies.\n- Development banks: the World Bank lends to the federal and state governments for health programmes, often with results-linked payments and conditions.\n- Bilateral donors: governments such as the UK and the US. US funding, historically channelled through USAID, was cut sharply in 2025, and many programmes have been closed or restructured.\n- Private foundations, which fund programmes, research and technical assistance.",
              "Money moves in two ways. On-budget funding passes through government systems and appears in the budget, as with most World Bank loans. Off-budget funding goes directly to implementing partners, such as NGOs or contractors, who run activities alongside government. Off-budget money is often faster but can leave the ministry with little control over it and few records.",
              "Many donors require counterpart funding: the government must put in its own share, such as Gavi's co-financing for vaccines. When counterpart funds are not released, the donor money can stall too.",
              "Who is the client? When a donor or implementing partner pays you to help a state ministry, the ministry still owns the policy and the decision. Your contract is with the payer, but the work must be agreed with, and owned by, the government officials who will carry it on after the project ends. Reports that please the donor but are unknown to the Director of Planning do not last.",
              "Donor projects also bring their own procurement rules, such as the World Bank's requirement for a no-objection before key contracts are signed."
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster covered the map of who does what, how money moves from appropriation to cash, how government buys and pays, and how donors fit in. That is enough to avoid the common early mistakes on a government engagement: the wrong counterpart, a contract with no released budget behind it, or a report that the ministry never owned.",
              "The paid track, Public Sector & Health Systems, assumes you have done this module and goes further. It teaches:",
              "- Health system design and governance: diagnosing a system with the building blocks, stewardship in a decentralised federation, and the financing functions of revenue collection, pooling and purchasing.\n- Public-private partnerships and government advisory: choosing between management contracts, leases and concessions, turning a policy into a costed implementation plan, and managing stakeholders in a ministry.\n- Primary health care strengthening and provider payment: capitation, DRGs and pay-for-performance as levers on how facilities behave.\n- Health insurance reform as policy, including the NHIA, state schemes, the Basic Health Care Provision Fund and covering the informal sector, and running donor-funded programmes and government delivery units.",
              "The track is a master-level programme. It suits consultants who will advise a ministry, agency or development partner, or who will design a reform rather than operate inside one.",
              "If your work is mainly with private hospitals, this taster gives you enough to understand the public system they sit beside and the government bodies they deal with. Take the track when government or a donor becomes your client, or when a private client needs to work with government on a partnership or an insurance scheme."
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Mapping the counterparts",
            instruction:
              "A development partner has hired you to help a northern state expand its state health insurance scheme to cover 50,000 more pregnant women. List the federal, state and local bodies you would need to engage, the office holder you would meet in each and why, and say which two must own the work for it to survive a change of Commissioner.",
          },
          {
            title: "Practice: Reading a budget line",
            instruction:
              "A state ministry of health wants your firm to start a N45m health facility assessment in February. The work would be paid from a capital line of N300m appropriated for primary health centre upgrades. By the end of last year, the same line had received 35% of its appropriation in releases and 22% in cash. Write a one-page note to your engagement lead stating the payment risk, the three questions you would ask the Director of Planning, and how you would phase the work and payment milestones to manage the risk.",
          },
        ],
      },
      resources: { tools: ["Government Counterpart Map", "Budget Line Check Sheet"] },
      questions: [
        mc(
          "A state Commissioner for Health strongly backs your project, but the Permanent Secretary and the Director of Planning have not been briefed. What is the main risk?",
          [
            "The Commissioner may ask for more work than agreed, and the officials will refuse to pay for the extra scope",
            "The donor may withdraw funding",
            "The project may stall when the Commissioner moves, as the career officials do not own it",
            "The state House of Assembly may reject the project",
          ],
          "c",
          "Commissioners are political appointees who can change at any time; the Permanent Secretary is the accounting officer and provides continuity. Scope creep is a real risk too, but it is not the one that kills projects after a reshuffle."
        ),
        mc(
          "A capital line of N200m is appropriated for PHC renovation. By September, N80m has been released and N50m has reached the account. How much can the ministry actually pay suppliers now?",
          ["N200m", "N80m", "N130m", "N50m"],
          "d",
          "Only cash in the account can pay suppliers, so N50m is the real limit. The appropriation is permission to spend and the release is authority for a period, but neither pays an invoice without cash."
        ),
        mc(
          "Which agency should a consultant approach about routine immunisation coverage and the management of primary health centres at national level?",
          ["NPHCDA", "NHIA", "NCDC", "NAFDAC"],
          "a",
          "The NPHCDA leads primary health care and routine immunisation nationally. NCDC is tempting because vaccines prevent disease, but its mandate is outbreak detection and response."
        ),
        mc(
          "Your firm is offered work by a state ministry, to be paid from a recurrent overhead line and starting in October. Another offer is paid from a capital line and starts in February. Which statement is most accurate about payment risk?",
          [
            "The capital line is safer because capital budgets are larger",
            "Both carry risk, but capital releases are least reliable and early-year payment is slow",
            "There is no difference, since both are in the appropriation act",
            "The recurrent line is risk-free, because recurrent costs such as salaries are always paid first and in full",
          ],
          "b",
          "Capital releases are most likely to fall short and early-year payments are slow, so the February capital job carries more risk; late-year recurrent overheads also get squeezed. Saying the recurrent line is risk-free confuses overheads with personnel costs, which are the most reliable."
        ),
        mc(
          "A procurement officer at a federal agency says your N60m consulting contract can be signed next week without competition 'to save time'. What is the correct response?",
          [
            "Agree, since the officer knows the rules",
            "Ask for the contract to be split into two smaller ones so each falls under the approval threshold for direct award",
            "Sign and seek approval afterwards",
            "Ask what justifies direct procurement and who must approve that value; wait until it is settled",
          ],
          "d",
          "Direct procurement is allowed only in defined circumstances and must be justified and approved at the level the value requires. Splitting a contract to stay under a threshold is itself a breach of procurement rules."
        ),
        mc(
          "A ministry pays your invoice of N10m for completed work, but N9.25m arrives. What is the most likely reason?",
          [
            "Withholding tax deducted at source",
            "A late payment penalty",
            "Bank charges on the Treasury Single Account",
            "An error that should be disputed",
          ],
          "a",
          "Government deducts withholding tax, and often VAT, at source, so the amount received is lower than the invoice. Disputing it as an error wastes time and goodwill; the deduction should be expected and reconciled."
        ),
        mc(
          "A donor-funded programme pays your firm to redesign a state's PHC referral system. The donor's programme manager wants the final report sent only to the donor. What should you do?",
          [
            "Comply, since the donor is paying and the contract is with the donor, then brief the ministry informally afterwards",
            "Send it to the state Governor instead",
            "Agree the work with the ministry throughout and make sure its officials receive and own the report",
            "Publish the report online so everyone can see it",
          ],
          "c",
          "The government owns the policy and must carry it on after the project, so the work has to be agreed with and owned by the ministry. Serving only the payer is the common mistake that leaves reports unused."
        ),
        mc(
          "A state has not released its counterpart funding for a Gavi-supported vaccine programme. What is the likely consequence?",
          [
            "None, because Gavi pays the full cost",
            "Gavi will lend the state the missing amount",
            "The NHIA will cover the shortfall",
            "Donor support can be delayed or reduced, because co-financing by government is a condition of the programme",
          ],
          "d",
          "Gavi expects co-financing from the government, so a missing counterpart share can stall the programme. Assuming the donor pays the full cost is the usual misunderstanding."
        ),
        ms(
          "Which of these are true of off-budget donor funding compared with on-budget funding? Select all that apply.",
          [
            "It goes directly to implementing partners such as NGOs or contractors",
            "It appears in the state appropriation act",
            "It can move faster because it does not pass through government release processes",
            "It can leave the ministry with limited control and records",
          ],
          "acd",
          "Off-budget money bypasses government systems, so it can move faster but leaves the ministry with less control and visibility. It does not appear in the appropriation act; that is the defining feature of on-budget money."
        ),
        mc(
          "A private hospital in Lagos wants to raise a concern about the way a competitor's facility is operating. Which body is responsible for registering and monitoring health facilities in Lagos?",
          ["Federal Ministry of Health and Social Welfare", "HEFAMAA", "NHIA", "MDCN"],
          "b",
          "HEFAMAA registers and monitors health facilities in Lagos State. MDCN regulates individual doctors and dentists, not the facility itself."
        ),
      ],
    },
  ],
};

export default expansion;
