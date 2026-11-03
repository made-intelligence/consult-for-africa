import type { Question, TrackExpansion } from "./types";

const IDS = ["a", "b", "c", "d", "e"] as const;

function mc(question: string, options: string[], correct: number, explanation: string): Question {
  return {
    type: "MULTIPLE_CHOICE",
    question,
    options: options.map((text, i) => ({ id: IDS[i], text, isCorrect: i === correct })),
    explanation,
  };
}

function ms(question: string, options: string[], correct: number[], explanation: string): Question {
  return {
    type: "MULTI_SELECT",
    question,
    options: options.map((text, i) => ({ id: IDS[i], text, isCorrect: correct.includes(i) })),
    explanation,
  };
}

const p = (...paras: string[]) => paras.join("\n\n");

const expansion: TrackExpansion = {
  slug: "people-leadership-foundations",
  track: {
    name: "People & Leadership Foundations",
    description:
      "The basics of running the people side of a Nigerian hospital: planning how many staff each service needs, recruiting and keeping doctors and nurses in a market shaped by emigration, managing performance and difficult conversations, leading clinicians, and setting up a working HR function. Free, and written for consultants, analysts and new hospital managers.",
    level: "FOUNDATION",
    category: "people",
    iconName: "users",
    colorHex: "#0F766E",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "FREE",
  },
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "workforce-planning-basics",
      name: "Workforce Planning and Staffing Ratios",
      description:
        "Work out how many staff, of which skills, a hospital service needs: build a cover table from activity, convert it into whole-time equivalents with a measured shrinkage allowance, adjust ratios for occupancy, acuity and skill mix, and test the plan against payroll and overtime.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Start from the service, not the staff list",
            body: p(
              "A workforce plan answers one question: how many people, of which skills, does this hospital need on each shift to deliver the services it has promised? The honest starting point is the service, not last year's headcount. Managers who begin with the current staff list and add a few posts end up preserving whatever accidents of history produced that list.",
              "Demand comes from the activity the hospital runs. For an inpatient ward it is the number of beds actually occupied on an average day and on a busy day, and how sick those patients are. For outpatients it is clinic sessions per week and patients per session. For theatre it is lists per week and the team each list needs: surgeon, anaesthetist, scrub nurse, circulating nurse and someone to recover the patient. For the emergency room it is arrivals by hour of the day, because a room that sees most of its patients between 6pm and midnight needs a different rota from one that is busy in the morning.",
              "Write the demand down as cover: the number of people of each type who must be present in each period. A 30-bed ward might need five nurses on the morning shift, five in the afternoon and four at night. A laboratory open around the clock might need two scientists by day and one at night. This cover table is the core of the plan, and every later number is calculated from it.",
              "Two cautions apply in Nigerian private hospitals. Activity data is often thin, so you may have to reconstruct occupancy from admission and discharge registers or from billing records. Do it anyway: a rough count of occupied beds is better than an assumption. And the services the owner plans to open matter as much as those running today. A hospital adding a four-bed ICU next year needs to start recruiting critical care nurses months before the unit opens, because they are among the hardest staff in the country to find.",
            ),
          },
          {
            title: "Turning cover into whole-time equivalents",
            body: p(
              "Cover is not headcount. One nurse on duty around the clock, every day of the year, needs several people on the payroll, because each person works only their contracted hours and is also away on leave, off sick or at training. The unit that bridges the gap is the whole-time equivalent (WTE, also written FTE): one person working the full contracted hours.",
              "The calculation has three steps.\n- Convert the cover table into hours per week. Five nurses on an 8-hour morning shift, five in the afternoon and four at night is 14 nurse-shifts a day, 112 hours a day, or 784 hours a week.\n- Divide by contracted hours. At 40 hours a week, 784 hours needs 19.6 WTE who are always at work.\n- Add an allowance for time that is paid but not worked. This is called shrinkage or headroom: annual leave, public holidays, sickness, maternity leave and study leave.",
              "The last step is where people go wrong. If shrinkage is 20%, then 20% of paid time is lost and only 80% of each WTE turns up. The right uplift is to divide by 0.8, not to multiply by 1.2. Dividing 19.6 by 0.8 gives 24.5 WTE. Multiplying by 1.2 gives 23.5 and leaves the ward a nurse short for the whole year.",
              "Shrinkage should be measured, not guessed. Count the leave entitlement in the contracts, the public holidays the hospital observes (in Nigeria these include fixed dates and the Islamic holidays announced each year), and a year of sickness, maternity and study leave from the records. Wards with many young nurses often carry more maternity leave than managers expect.",
              "Then decide how part-time staff and locums count. A locum covering 16 hours a week against a 40-hour standard is 0.4 WTE of cover. That cover is real, but it costs more per hour and brings no continuity, so a plan that leans on locums for a large share of its WTE is fragile.",
            ),
          },
          {
            title: "Ratios, acuity and skill mix",
            body: p(
              "Staffing ratios, such as one nurse to six patients on a general ward by day, are useful shorthand, but they are planning norms rather than law. Nigeria does not set a single statutory nurse-to-patient ratio for private wards, and figures quoted in proposals usually come from international practice or professional guidance. Use them to sense-check a plan, then adjust them for the patients you actually have.",
              "Three adjustments matter most. Apply the ratio to occupied beds, not to the bed count on the licence: a 40-bed ward averaging 70% occupancy has 28 patients. Adjust for acuity, meaning how much care each patient needs. A surgical ward full of fresh post-operative patients needs more hands than a medical ward of stable patients awaiting discharge, and an intensive care bed commonly needs one nurse to one or two patients. Allow for peaks: if Monday admissions push occupancy to 95%, a rota built on the weekly average will fail every Monday.",
              "Skill mix is the second lever. Not every ward task needs a registered nurse. Feeding, turning, routine observations under supervision and errands can be done by healthcare assistants, freeing registered nurses for medication, assessment and care planning. The limit is scope of practice. Work that the Nursing and Midwifery Council of Nigeria (NMCN) reserves for registered nurses and midwives must stay with them, and a hospital that lets assistants give injections or manage deliveries is taking a clinical and regulatory risk to save salary.",
              "Doctors are planned differently. Most private hospitals run resident medical officers on shifts or on-call rotas, with consultants, some full-time and some visiting, covering the specialties. The test for doctors is less a ratio than whether every hour of the week has a named doctor who can be reached and a named senior behind them. A rota whose gaps are filled by whoever happens to be around is a patient safety problem and a burnout problem at the same time.",
            ),
          },
          {
            title: "Testing the plan against payroll and budget",
            body: p(
              "A plan becomes useful once it is set beside what the hospital pays for today. For each department, put three numbers side by side: the establishment (the posts the plan says are needed), staff in post, and vacancies. A department with 24.5 WTE planned, 19 in post and nobody recruiting is covering the gap somehow, usually with overtime, locums or staff working double shifts.",
              "Find the cost of that cover. Overtime and locum payments are often booked to different ledger lines from salaries, so the true staff cost of a department is hidden. Add them back. A ward that saves N1.2m a month by leaving three nurse posts empty but pays N1.5m in overtime and agency shifts is spending more for a less reliable service, and wearing out the staff who remain.",
              "Then test the plan against revenue. Staff cost as a share of revenue is the headline number owners watch, and it varies with the type of facility: a diagnostic centre with expensive equipment will run lower than a nursing-heavy inpatient hospital. Track it monthly and by department rather than comparing it with a figure from another country. When it rises, find out whether staff numbers grew or activity fell, because the two lead to opposite actions.",
              "Price new posts at loaded cost, not gross salary. Employer pension, statutory contributions and benefits add a meaningful amount on top of gross pay, and a budget built on gross salaries will be short from the first month.",
              "Finally, put the plan under establishment control. New posts are created only against the approved plan, and every vacancy is reviewed before it is filled: is the post still needed in this form, or could the work be organised differently? Without that discipline, headcount drifts upward one urgent request at a time.",
            ),
          },
        ],
        exercises: [
          {
            title: "Staff the medical ward",
            instruction:
              "Ridgeway Hospital, Ibadan, runs a 32-bed medical ward that averages 75% occupancy, rising to 94% on Mondays. It uses three 8-hour shifts, a 40-hour contracted week, one nurse to six patients by day (morning and afternoon) and one to eight at night. Measured shrinkage is 22%. The ward has 18 registered nurses in post and pays N1.4m a month in overtime and agency shifts. Build the cover table for an average day and for a Monday, convert each into WTE, and write three lines for the medical director: the size of the gap, what it costs to leave it open, and how you would cover the Monday peak without staffing every day to it.",
          },
        ],
      },
      resources: { tools: ["Cover table template", "WTE and shrinkage calculator", "Establishment control register"] },
      questions: [
        mc(
          "A 30-bed ward needs 784 nurse hours a week. Contracted hours are 40 a week and measured shrinkage is 20%. How many WTE should the plan show?",
          ["19.6 WTE", "23.5 WTE", "24.5 WTE", "26.1 WTE"],
          2,
          "784 / 40 = 19.6 WTE at work, and dividing by 0.8 (the share of paid time actually worked) gives 24.5. Multiplying 19.6 by 1.2 gives 23.5, which under-provides because a 20% loss needs a 25% uplift.",
        ),
        mc(
          "A hospital measures its nursing shrinkage at 25%. Which uplift should it apply to the WTE needed on duty?",
          [
            "Divide by 0.75, an uplift of about 33%",
            "Multiply by 1.25, an uplift of 25%",
            "Multiply by 1.2, the usual planning figure",
            "No uplift, and cover absences with overtime",
          ],
          0,
          "If a quarter of paid time is lost, each WTE delivers 0.75 of cover, so the requirement must be divided by 0.75. Multiplying by 1.25 looks equivalent but leaves the ward short every week.",
        ),
        mc(
          "A 50-bed ward has average occupancy of 60% and a day ratio of one nurse to six patients. How many nurses are needed on an average day shift?",
          ["9, rounding up 50 beds divided by 6", "8, a midpoint between beds and patients", "6, to allow one nurse spare", "5, from 30 occupied beds divided by 6"],
          3,
          "Ratios apply to patients, so 60% of 50 beds is 30 patients, and 30 / 6 = 5. Using the licensed bed count of 50 would staff empty beds every day.",
        ),
        mc(
          "An owner plans to open a four-bed ICU in nine months. What is the best first workforce step?",
          [
            "Wait until the building is finished, then advertise every post at once",
            "Start recruiting critical care nurses now, as they take longest to find",
            "Plan to staff the unit from the general ward rota on opening day",
            "Hire the intensivist first and leave nursing recruitment until the month before opening",
          ],
          1,
          "Critical care nurses are scarce and need time to recruit and orientate, so the lead time starts now. Borrowing from the general ward rota on opening day strips cover from another ward and leaves the ICU with staff who lack the skills.",
        ),
        mc(
          "Which task can properly be given to a healthcare assistant on a busy surgical ward?",
          [
            "Giving intramuscular injections when the registered nurses are stretched",
            "Turning and feeding patients under a nurse's supervision",
            "Managing a normal delivery while the midwife is on break",
            "Signing the controlled drugs register at the end of the shift",
          ],
          1,
          "Basic care under supervision is the right use of assistants. Injections, deliveries and controlled drug records sit within registered nurse and midwife scope, and handing them over to save salary is a clinical and regulatory risk.",
        ),
        mc(
          "A ward keeps three nurse posts vacant, saving N1.1m a month in salaries, but spends N1.4m a month on overtime and agency shifts. How should you read this?",
          [
            "The vacancies save the hospital N1.1m a month",
            "The position is roughly neutral, so the hospital needs no action on the posts",
            "The fix is to cut the overtime rate paid per hour",
            "The vacancies cost N300k a month more and the cover is less reliable",
          ],
          3,
          "Once the cover cost is added back, leaving posts empty costs more than filling them, and relies on tired staff and unfamiliar agency nurses. Looking only at the salary line shows a saving that does not exist.",
        ),
        mc(
          "Staff cost at a hospital has risen from 42% to 49% of revenue over six months. What should you ask first?",
          [
            "Did staff numbers and pay rise, or did activity and revenue fall?",
            "Which 7% of staff can be released this quarter?",
            "What share of revenue do UK and South African hospitals spend on staff?",
            "Can the next pay review be frozen for all grades?",
          ],
          0,
          "The ratio can rise because the numerator grew or the denominator shrank, and those call for opposite responses. Cutting staff when the real problem is falling activity can deepen the revenue fall.",
        ),
        mc(
          "A locum doctor covers 16 hours a week. The standard contracted week is 40 hours. How much WTE cover does the locum provide?",
          ["0.16 WTE", "0.25 WTE", "0.4 WTE", "1.0 WTE, as one person"],
          2,
          "16 / 40 = 0.4 WTE. Counting the locum as one person confuses headcount with cover and makes the rota look fuller than it is.",
        ),
        ms(
          "Which inputs should a hospital's cover table be built from? Select all that apply.",
          [
            "Occupied beds and the acuity of patients on each ward",
            "Last year's headcount for each department",
            "Emergency arrivals by hour of the day",
            "Theatre lists per week and the team each list needs",
            "The number of staff who would like extra shifts",
          ],
          [0, 2, 3],
          "Cover follows activity: occupied beds and acuity, arrival patterns and theatre lists. Last year's headcount preserves past accidents rather than measuring need, and staff appetite for shifts is a way of filling the plan, not an input to it.",
        ),
        mc(
          "Average occupancy on a ward is 72%, but every Monday it reaches 95%. The rota is built on the average. What follows, and what is the better approach?",
          [
            "The peaks and troughs cancel out over the week, so the rota is fine",
            "The rota fails every Monday, so plan flexible cover such as a bank shift for the peak",
            "The rota should be rebuilt so every day is staffed to the Monday level",
            "The ward should refuse elective admissions on Mondays",
          ],
          1,
          "Patients do not average out: on Mondays the ward is short. Staffing every day to the peak is the tempting answer but pays for idle staff six days a week, so targeted flexible cover is better.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "recruitment-retention-basics",
      name: "Recruitment and Retention in a Migrating Workforce",
      description:
        "Recruit doctors and nurses when the pool is shrinking, verify that they can practise, measure who leaves and why, and use the retention levers a Nigerian private hospital actually controls when it cannot match foreign pay.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "The market you are recruiting in",
            body: p(
              "The defining fact of the Nigerian health labour market is emigration. Doctors, nurses, midwives, pharmacists and laboratory scientists have left in large numbers for the United Kingdom, Ireland, the United States, Canada and the Gulf, a movement known everywhere as japa. Every hospital manager needs to plan on the basis that some of their best people will leave, and that the pool they recruit from is thinner each year.",
              "The pressure is uneven. It is sharpest for specialist and critical care nurses (ICU, theatre, neonatal), midwives, early-career doctors who have finished housemanship and passed foreign licensing exams, and some specialties such as anaesthesia and radiology. Administrative and support roles are much easier to fill. A plan that treats all posts the same will under-invest where it matters.",
              "The policies of destination countries change the flow but do not stop it. Nigeria is on the WHO health workforce support and safeguards list, which the UK has applied since 2023 to mean that UK employers and agencies should not actively recruit from Nigeria. Individuals can still apply directly, and most do. Pay in pounds, dollars or riyals is beyond what a Nigerian private hospital can match for most staff, so competing head-on on salary is rarely possible.",
              "Three practical consequences follow. Turnover is structural, not a sign that one manager has failed, so budget for continuous recruitment and induction. Knowledge must be held by the hospital, not in one person's head: protocols, handover notes and training records reduce the damage when someone leaves. And the hospital's offer has to rest on what it can control, such as how staff are treated, trained, scheduled and led, because that is where it can still win.",
            ),
          },
          {
            title: "Recruiting well when the pool is thin",
            body: p(
              "Good recruitment starts with a precise role: what the person will do, on which rota, reporting to whom, and the two or three things that matter most for success. A vague advert for a 'dedicated nurse' attracts volume and wastes interview time.",
              "Widen the sources beyond job boards. Referrals from current staff are often the best channel, because staff know who is good and who will fit. Schools of nursing and midwifery, house officers finishing their year, doctors completing national service, returnees from the diaspora and recently retired senior nurses are all pools that competitors overlook. A part-time or sessional role can bring back a skilled person who no longer wants full-time work.",
              "Select on evidence. Use a structured interview with the same questions for every candidate and a scoring sheet, plus a practical test where possible: a drug calculation for nurses, a case discussion for doctors, a claims exercise for billing staff. Unstructured chats favour confident talkers.",
              "Verify before anyone touches a patient. For doctors, confirm full registration and a current annual practising licence with the Medical and Dental Council of Nigeria (MDCN). For nurses and midwives, confirm current licence status with the NMCN. A registration certificate shows the person qualified, not that they may practise this year. Take up references from the last clinical employer, not a family friend.",
              "Move fast. A strong nurse in Lagos may hold three offers at once, and a three-week approval chain loses her. Decide within days and put the offer in writing with the rota, pay and start date.",
              "Then hold on to the people you hired. Many leavers go in their first year, often because induction was a single morning and they were alone on a night shift by week two. A planned first 90 days, a named buddy and check-ins at 30, 60 and 90 days cost little and protect the recruitment spend.",
            ),
          },
          {
            title: "Measuring who leaves and why",
            body: p(
              "You cannot manage turnover you have not measured. The basic figure is the annual turnover rate: leavers in the year divided by average headcount over the year, times 100. A nursing team that started the year with 56 and ended with 64 averaged 60; if 21 people left, turnover was 35%. Using the opening or closing headcount instead of the average gives a misleading figure.",
              "Break the number down. Turnover by department and grade shows where the problem sits. The share of leavers who went within 12 months of joining points to selection and induction. The share who went abroad, who moved to another Nigerian hospital, and who left the profession each need a different response. A stability index, the share of staff with more than a year's service, tells you whether the core team is holding even while new joiners churn.",
              "Ask why, carefully. Exit interviews are useful but biased: leaving staff give the reason that is easiest to say, and pay or travel abroad is always easy. Stay interviews, short conversations with current staff about what keeps them and what might make them go, are often more revealing. They surface fixable issues such as a chaotic rota, an abrasive senior or night allowances paid late.",
              "Cost it bottom-up. The cost of one nurse leaving includes the overtime or agency cover while the post is empty, the advertising and interview time, induction and supervision of the replacement, and lower output while the new person learns the ward. Estimate each line from the hospital's own figures rather than borrowing a multiple from a foreign study. A real naira figure is what persuades an owner to spend on retention.",
            ),
          },
          {
            title: "Retention levers you control",
            body: p(
              "A Nigerian private hospital cannot match foreign salaries, but staff do not leave for pay alone, and many who could leave choose to stay where they are treated well. The levers that work are mostly within management's reach.",
              "- Pay that is fair against the local market and paid on time, including allowances. Late night or call allowances do more damage than modest base pay.\n- A rota published weeks ahead, shared fairly, and changed only with notice.\n- Good immediate managers. Staff leave ward managers and heads of department as often as they leave hospitals.\n- Development: in-house training, sponsorship of postgraduate exams or specialist courses, and a visible ladder from staff nurse to ward manager.\n- Practical support such as transport for night shifts, help with accommodation, or a staff HMO plan that covers family members.\n- Recognition that is specific and public, and a voice in how the ward runs.",
              "Training bonds are reasonable when the hospital pays for training, but they must be fair to stand up and to keep goodwill. Agree the bond in writing before the training starts, make the service period proportionate to the cost, and reduce the repayment pro rata for time served. Do not hold original certificates to stop people leaving: it is widely seen as abusive and invites legal challenge and reputational damage.",
              "Treat leaving as a door that can open both ways. Some staff who go abroad come back, and many diaspora professionals want sessional work at home: a week of clinics each quarter, teaching, or remote case review. A hospital that parts with leavers well, keeps in touch and offers flexible return routes turns emigration from pure loss into a source of skills. Any returning clinician still needs a current Nigerian licence and the hospital's normal credentialing before seeing patients.",
            ),
          },
        ],
        exercises: [
          {
            title: "Diagnose nurse turnover",
            instruction:
              "Alafia Medical Centre, Abeokuta, began the year with 58 nurses and ended with 66. Twenty-two nurses left: 13 within 12 months of joining, 9 to jobs abroad, 8 to other Nigerian hospitals and 5 for other reasons. Night allowances were paid two months late twice in the year, and induction is a half-day. Overtime and agency cover for vacant posts cost N9.6m over the year. Calculate the turnover rate and the first-year share, say what each figure points to, and propose three retention actions with a rough cost for each that you would put to the owner against the N9.6m.",
          },
        ],
      },
      resources: { tools: ["Structured interview scoring sheet", "Licence verification checklist", "Stay interview guide", "Turnover tracker"] },
      questions: [
        mc(
          "A nursing team had 56 staff at the start of the year and 64 at the end. Twenty-one nurses left during the year. What is the annual turnover rate?",
          ["37.5%, using the opening headcount", "32.8%, using the closing headcount", "35%, using the average headcount", "21%, counting leavers as a share of 100"],
          2,
          "Average headcount is (56 + 64) / 2 = 60, and 21 / 60 = 35%. Using the opening or closing figure distorts the rate when the team has grown.",
        ),
        mc(
          "Most of a hospital's nurse leavers go within their first 12 months. What does this point to first?",
          [
            "Selection and induction: who is hired and how they start",
            "Pay that is too low across every grade",
            "Emigration, which no local action by the hospital can influence",
            "A need for more detailed exit interviews",
          ],
          0,
          "Early leavers usually reflect poor fit at selection or a thin induction. Blaming pay or emigration is tempting but does not explain why longer-serving staff on the same pay stay.",
        ),
        mc(
          "Your best ICU nurse has a UK job offer at several times her salary. The hospital cannot match it. What is the best response?",
          [
            "Offer to match the UK salary to keep her",
            "Tell her you will withhold her reference unless she stays",
            "Remind her of the training bond and say the hospital will enforce it in full if she goes",
            "A frank stay conversation on what is within reach, leaving the door open to return",
          ],
          3,
          "If staying is possible, it will be because of things the hospital controls, and if she goes, a good exit makes return or sessional work more likely. Withholding references or threats damage the hospital's name with every nurse who hears of it.",
        ),
        mc(
          "A strong nurse candidate was interviewed on Monday. The hospital's approval process for offers takes three weeks. What is the main risk?",
          [
            "None, because serious candidates will wait for a reputable hospital",
            "She takes another offer meanwhile, so decide within days",
            "The interview panel forgets its scoring",
            "Her licence may expire during the wait",
          ],
          1,
          "Scarce clinical staff often hold several offers and accept the first firm one. A slow process loses the best candidates and leaves those with fewer options.",
        ),
        mc(
          "Which check confirms that a nurse may practise in Nigeria this year?",
          [
            "Her original nursing school certificate",
            "A reference from her last employer",
            "Her current licence status verified with the NMCN",
            "A CV listing her registration number",
          ],
          2,
          "Current licence status with the regulator shows she may practise now. A certificate only proves she qualified once, and a CV or reference does not confirm licence status.",
        ),
        mc(
          "A hospital will pay N2.4m for a resident doctor's postgraduate exam course. Which bond arrangement is fair and defensible?",
          [
            "A written two-year bond agreed in advance, repayable pro rata for time unserved",
            "Holding the doctor's original certificates in the HR office until the two years are served",
            "Full repayment plus a penalty if the doctor leaves at any point",
            "A verbal understanding that the doctor will stay",
          ],
          0,
          "A written, proportionate, pro-rata bond agreed in advance protects the investment and stands up to scrutiny. Holding certificates is abusive and invites challenge, and a penalty on top of full repayment is unlikely to be seen as reasonable.",
        ),
        mc(
          "Exit interviews give pay as the reason for 80% of leavers. Stay interviews with current staff mostly mention the rota and one ward manager. How should you read this?",
          [
            "Pay is the problem, so a pay rise is the main fix",
            "The two sets of interviews cancel each other out",
            "The ward manager should be moved to another ward at once, without further discussion",
            "Pay is the easy exit answer; the rota and manager are fixable causes",
          ],
          3,
          "Exit interviews are biased towards socially easy answers. Stay interviews surface controllable issues; they still need checking, which is why moving the manager without discussion is wrong.",
        ),
        ms(
          "Which retention levers are within a Nigerian private hospital's control? Select all that apply.",
          [
            "A rota published weeks ahead and shared fairly",
            "Foreign visa and immigration policy",
            "Sponsorship of postgraduate exams with a fair bond",
            "The quality of ward managers and heads of department",
            "The naira exchange rate",
          ],
          [0, 2, 3],
          "Rotas, development and management quality are all things the hospital can change. Visa rules and exchange rates matter but sit outside its control, so a plan built on them does nothing.",
        ),
        mc(
          "A Nigerian consultant paediatrician working in Manchester offers one week of clinics every quarter. What is the best way to use this?",
          [
            "Decline, because the hospital only wants full-time consultants",
            "A sessional agreement for complex clinics and teaching, once licensed and credentialed",
            "Appoint her head of department on the strength of her UK post",
            "Let her see patients on her UK registration alone, since the UK standard is higher than Nigeria's",
          ],
          1,
          "Sessional diaspora input adds scarce skills if it is credentialed and backed by local follow-up. A UK registration does not authorise practice in Nigeria, so she still needs a current MDCN licence.",
        ),
        mc(
          "The owner asks what one nurse leaving really costs. Which approach gives a credible answer?",
          [
            "Apply a multiple of annual salary taken from an international study of nurse turnover costs",
            "Count only the advertising cost of replacing her",
            "Add up vacancy cover, recruitment, induction and lost output while the new nurse learns",
            "Assume no cost, because a replacement is paid the same salary",
          ],
          2,
          "A bottom-up figure from the hospital's own numbers is specific and believable. Borrowed multiples may not fit Nigerian costs, and counting advertising alone misses the largest items such as agency cover.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "performance-feedback-basics",
      name: "Performance, Feedback and Difficult Conversations",
      description:
        "Set clear expectations, give feedback that changes behaviour, prepare for and hold difficult conversations, and run a fair improvement plan before anything becomes a formal process.",
      estimatedMinutes: 55,
      content: {
        sections: [
          {
            title: "Performance starts with clear expectations",
            body: p(
              "Most performance problems in hospitals begin before anyone does anything wrong: the person was never told clearly what good looks like. A job description lists duties, but it rarely says what standard is expected or how it will be judged. Managers who skip this step end up arguing about opinions instead of facts.",
              "Good expectations are specific and checkable. 'Ensure excellent patient care' cannot be tested. 'Reduce handover-related incidents on the ward from six a month to two by March, with the handover checklist used on every shift' can be. Mix two kinds of expectation. Outputs are results, such as claims submitted within 48 hours of discharge, or theatre lists starting on time. Behaviours are how the work is done, such as handing over in person, escalating a deteriorating patient early, or treating patients' relatives with courtesy. Clinical staff are judged on both, and the behaviours often matter more to safety.",
              "Keep the list short. Three to five objectives a year for each person is enough; twelve means none get attention. For clinical roles, one objective should usually relate to safety or quality, one to the service's efficiency, and one to the person's own development.",
              "Use probation properly. A new hire's first three to six months are the time to check fit and capability against the expectations set at the start. Managers often let probation pass without a review and then discover problems a year later, when correcting them is much harder. Put a probation review in the diary on the day the person starts.",
              "Finally, agree expectations rather than issue them. A ward manager who sets objectives with the nurse, and listens to what gets in the way, learns about broken equipment, rota gaps and unclear protocols that no target will fix on its own.",
            ),
          },
          {
            title: "Giving feedback that changes behaviour",
            body: p(
              "Feedback works when it is specific, timely and about behaviour, not personality. 'You are unreliable' invites argument. 'On Tuesday's night shift you left the ward forty minutes before your relief arrived, and two patients missed their 10pm medication' describes something the person can recognise and change.",
              "A simple structure helps: situation, behaviour, impact (SBI). Name when and where it happened, describe exactly what the person did, and say what effect it had on patients, colleagues or the service. Then stop and listen. The person may have a reason you did not know, such as a relief nurse who told them she was on her way.",
              "Give it soon. Feedback a week later is weaker, and feedback saved for the annual appraisal is almost useless. Give criticism in private and praise in public when the person is comfortable with it. Criticising someone in front of patients or juniors humiliates them and teaches everyone else to hide mistakes.",
              "Use positive feedback as deliberately as negative. Telling a theatre nurse that her count discipline caught a missing swab last week reinforces exactly the behaviour you want, and makes later criticism easier to hear because it is clearly not the only thing you notice.",
              "Hierarchy shapes feedback in Nigerian hospitals. Juniors seldom correct seniors, nurses rarely challenge consultants openly, and staff may say yes to a manager while meaning no. Leaders who want to hear the truth have to work for it: ask specific questions ('what slowed the morning list today?'), hold skip-level conversations, provide an anonymous channel for concerns, and, above all, act visibly on what they hear. An open-door policy announced in a memo changes nothing on its own.",
            ),
          },
          {
            title: "Preparing for and holding a difficult conversation",
            body: p(
              "Difficult conversations go well when they are prepared. Before you speak, write down the facts (dates, incidents, numbers), the impact, what you want to happen next, and what you do not yet know. If you cannot state the issue in two sentences, you are not ready.",
              "Work out what kind of problem it is, because each needs a different response.\n- Capability: the person is trying but cannot yet do the job to standard. The answer is training, supervision and time.\n- Conduct: the person can do the job but chooses not to follow rules or expected behaviour. The answer is a clear warning and, if it continues, the formal process.\n- Circumstances: something outside work, such as illness, bereavement or a sick child, is affecting them. The answer is support and, where possible, temporary adjustment.",
              "A reliable nurse who has started arriving late may be dealing with a family crisis. Opening with a query letter before you know which kind of problem you face can turn a manageable situation into a grievance.",
              "Hold the conversation in private, at a time when neither of you is rushed, and never on the ward floor. Open with the issue directly: 'I want to talk about the medication errors on your last three night shifts.' Long warm-ups make people anxious and blur the message. Present the facts, ask for their view, and listen without interrupting. Then agree what will change, what support you will give, and when you will review it.",
              "Write it down the same day: the date, what was discussed, what was agreed, the support offered and the review date. Share the note with the person. Keep opinions about character and second-hand gossip out of it. A short factual record protects both of you and makes any later process fair.",
            ),
          },
          {
            title: "When improvement does not come",
            body: p(
              "If informal feedback has not worked, a performance improvement plan (PIP) gives the person a fair, structured last chance to reach the standard. It is not a dismissal in slow motion. Managers who treat it that way skip the support and the plan fails for reasons that are partly their own.",
              "A good plan has five parts: the specific gap, measured where possible ('your claims rejection rate is 14% against a team average of 4%'); the standard to reach ('below 6%'); the support the hospital will give, such as training, a mentor or more frequent checking; the timescale, commonly six to twelve weeks; and regular reviews, often weekly, each recorded briefly. Agree it in writing and give the person a copy.",
              "Keep patient safety in front. If the gap creates risk, such as repeated errors in paediatric drug calculations, adjust duties during the plan so the person works under supervision. That is a safety measure, not a punishment, and should be explained that way.",
              "At the end, one of three things happens. The person meets the standard and the plan closes, with praise. They are improving but not yet there, and a short extension is fair. Or there has been no real improvement despite fair support, and the matter moves into the hospital's formal capability or disciplinary procedure. That procedure must follow the hospital's written policy and Nigerian employment law, give the person written notice of the concern and a fair hearing, and record the decision.",
              "The annual appraisal should then contain no surprises. If someone first learns at appraisal that their work has been poor all year, the failure is the manager's. Appraisal is a summary of conversations that have already happened, a moment to agree next year's objectives, and a chance to talk about development.",
            ),
          },
        ],
        exercises: [
          {
            title: "Plan the conversation and the improvement plan",
            instruction:
              "At Crestfield Hospital, Port Harcourt, a billing officer with two years' service has a claims rejection rate of 14% over the last quarter, against a team average of 4%. Rejected claims are worth about N3.1m a month in delayed cash. She was trained on the new HMO portal for one afternoon, and she has mentioned that her mother is unwell. Write your preparation notes for the first conversation (facts, impact, likely type of problem, what you want), the opening two sentences you would use, and a six-week improvement plan with a target, support, review dates and what happens at the end.",
          },
        ],
      },
      resources: { tools: ["SBI feedback planner", "Difficult conversation preparation sheet", "Performance improvement plan template"] },
      questions: [
        mc(
          "Which objective gives a ward manager the clearest expectation?",
          [
            "Improve the quality of handovers on the ward",
            "Show stronger leadership with the nursing team",
            "Ensure excellent patient care at all times",
            "Cut handover-related incidents from six a month to two by March, with the checklist used on every shift",
          ],
          3,
          "Only this objective says what result, by when, and how it will be checked. The others are aims that cannot be tested, so any review becomes a matter of opinion.",
        ),
        mc(
          "Which piece of feedback follows the situation, behaviour, impact structure?",
          [
            "On Tuesday's night shift you left 40 minutes before your relief arrived, and two patients missed their 10pm medication",
            "You are unreliable on night shifts and need to take the job more seriously",
            "Several colleagues have told me they are unhappy with your attitude",
            "Please try harder to be a team player from now on",
          ],
          0,
          "It names the occasion, the exact behaviour and its effect on patients. The others are judgements about character or second-hand reports that the person cannot act on.",
        ),
        mc(
          "A nurse with four years of good attendance has been late eight times this month. What should the ward manager do first?",
          [
            "Issue a formal query letter immediately",
            "Raise it at the next ward meeting so everyone knows the standard",
            "Talk with her privately to find out what has changed",
            "Ignore it, given her good record",
          ],
          2,
          "A sudden change in a reliable person often signals personal circumstances, which call for support rather than discipline. A query letter before you know the cause can turn a solvable issue into a grievance.",
        ),
        mc(
          "A consultant regularly snaps at nurses in front of patients. The nursing manager plans to raise it at the monthly departmental meeting. What is the better approach?",
          [
            "Raise it at the meeting so other consultants see it handled",
            "Raise it privately and soon, with specific incidents",
            "Let the nurses handle it themselves as adults",
            "Wait for a formal complaint from a patient",
          ],
          1,
          "Criticism is given in private, soon, and with facts; the medical director gives weight with a senior doctor. A public airing humiliates and hardens positions, and waiting leaves nurses and patients exposed.",
        ),
        mc(
          "An administrator learns at her annual appraisal that her manager has thought her work poor all year. What went wrong?",
          [
            "The appraisal form had too few rating categories",
            "The appraisal should have been held every six months rather than once a year",
            "She should have asked for feedback herself",
            "Feedback was held back all year, so the appraisal was a surprise",
          ],
          3,
          "Appraisal should summarise conversations that have already happened. Changing the form or the frequency does not fix a manager who saves feedback for the review.",
        ),
        mc(
          "A billing officer's claims rejection rate is 14% against a team average of 4%. Which improvement plan is fair?",
          [
            "A written plan: below 6% in six weeks, with training and weekly reviews",
            "A warning that she will be dismissed if things do not improve",
            "An open-ended plan to improve, with a review whenever the manager finds time for one",
            "Moving her to the records office without discussion",
          ],
          0,
          "A fair plan names the gap, the target, the support and the timescale, with reviews. A bare threat gives no support, and an open-ended plan has no standard or end point.",
        ),
        mc(
          "A newly hired nurse keeps making errors in paediatric dose calculations despite clearly trying. How should this be treated?",
          [
            "As misconduct, with a query letter",
            "As a personality problem to be noted on file",
            "As a capability gap, with training and supervised drug rounds",
            "As a minor issue to note now and pick up properly at her next appraisal",
          ],
          2,
          "She is trying but cannot yet do it to standard, which is capability, and the safety risk means supervised practice meanwhile. Treating honest inability as misconduct is unfair and teaches staff to hide errors.",
        ),
        ms(
          "What belongs in the written note after a difficult conversation? Select all that apply.",
          [
            "The date and the issues discussed",
            "The actions agreed and the review date",
            "The manager's view of the person's character",
            "The support the hospital offered",
            "Comments passed on by colleagues",
          ],
          [0, 1, 3],
          "A fair record is factual: what was discussed, what was agreed, support offered and when it will be reviewed. Opinions of character and second-hand comments make the record unfair and weaken any later process.",
        ),
        mc(
          "Junior doctors at a hospital rarely raise concerns with the medical director. What is most likely to change this?",
          [
            "Announcing an open-door policy in a memo",
            "Specific questions in skip-level meetings, an anonymous channel, and visible action",
            "Waiting until juniors gain confidence with seniority",
            "Warning juniors that failing to report problems will be treated as a disciplinary matter",
          ],
          1,
          "Hierarchy keeps juniors quiet, so leaders must ask directly, make it safe and show that speaking up leads to action. An open door announced on paper changes nothing if nobody believes it is safe to walk through.",
        ),
        mc(
          "After eight weeks of a fair improvement plan with real support, a staff member has not improved. What is the right next step?",
          [
            "Move to the formal procedure, with written notice and a fair hearing",
            "Dismiss them verbally at the final review meeting",
            "Extend the plan indefinitely, to avoid a conflict with a long-serving member of staff",
            "Reduce their salary until performance improves",
          ],
          0,
          "Once informal routes are exhausted, the formal procedure gives a fair, documented decision. Verbal dismissal on the spot skips fair hearing and exposes the hospital, and a unilateral pay cut is a breach of contract.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "leading-clinicians-basics",
      name: "Leading Doctors and Nurses",
      description:
        "Lead clinical staff who answer to their professions as well as to the hospital: bring doctors into decisions, lead nursing teams, encourage speaking up, and handle collective concerns and strikes.",
      estimatedMinutes: 55,
      content: {
        sections: [
          {
            title: "Why clinicians are led differently",
            body: p(
              "Doctors and nurses are led differently from other staff because their first loyalty is often to their profession and their patients, not to the organisation. Each is personally accountable to a regulator, the MDCN for doctors and the NMCN for nurses and midwives, for what they do to a patient, whatever a manager instructs. They are trained to rely on their own judgement and on evidence, and they take their cue from respected peers more than from job titles.",
              "This has practical consequences for anyone running a hospital. A memo instructing consultants to change how they practise usually fails, not because they are difficult, but because it treats a clinical decision as an administrative one. Authority with clinicians comes from expertise, fairness and listening, and is earned slowly. A manager with no clinical background can still lead clinicians well, but only by being clear about what is a clinical decision and what is an operational one, and by involving clinicians in the first.",
              "The line between the two is not always neat. Which drug to give is clinical. How many theatre lists run on a Saturday is operational, but it affects clinical care. Most friction in hospitals happens in that overlap: theatre schedules, admission rules, consumables, protocols. Agree early who decides what, and make sure the decisions that touch clinical work include a clinician.",
              "Professional identity also shapes motivation. Clinicians care about doing good work for patients, about their standing with colleagues and about learning. Pay matters, but a consultant who cannot get theatre time, or a nurse who works without basic equipment, will leave even a well-paid post. Leaders who remove obstacles to good clinical work earn more loyalty than those who rely on rules.",
            ),
          },
          {
            title: "Bringing doctors into decisions",
            body: p(
              "Doctors support changes they help design and resist those handed to them. The practical tools are a clear medical leadership structure and the habit of using data about doctors' own practice.",
              "Most well-run private hospitals have a medical director, clinical leads for each department or specialty, and a medical advisory committee (sometimes called a medical board) where senior doctors review protocols, credentialing and serious incidents. The structure gives management a route to doctors and doctors a route to management. Without it, every issue goes to the owner.",
              "Lead with data on their own patients. A surgeon may dismiss a hospital-wide statistic, but will look closely at his own surgical site infection rate or his share of lists that started late. Present it privately first, accurately and without blame, and ask what explains it. Most doctors want to be good at what they do, and comparative data is a powerful lever when used fairly.",
              "Find a respected champion. When a hospital introduces the WHO surgical safety checklist and compliance sits at 45%, a memo from the chief operating officer achieves little. A senior surgeon who adapts the checklist with colleagues, uses it visibly and reviews compliance with them at the monthly meeting achieves far more.",
              "Visiting consultants need particular care. Many Nigerian specialists work in a teaching hospital and visit several private hospitals, and they decide where to admit their private patients. They go where theatre starts on time, nursing is competent, equipment works and billing is straightforward. A clear written agreement on sessions, admitting rights and expectations sets the base; a regular conversation about what would make your hospital their first choice keeps them. Banning them from working elsewhere usually just loses them.",
            ),
          },
          {
            title: "Leading nurses and the wider team",
            body: p(
              "Nurses provide the continuity of care in a hospital. Doctors visit; nurses stay with the patient through the shift and the night. A hospital's safety, patient experience and reputation rest heavily on its nursing, and nursing leadership deserves the same seniority and attention as medical leadership.",
              "The nursing structure usually runs from a director of nursing or chief nursing officer, through matrons or nursing officers, to ward managers and staff nurses. The ward manager is the most important leadership post in the hospital. She sets the rota, the standards and the tone on her ward, and staff stay or leave largely because of her. Invest in ward managers first: training in rota planning, feedback and basic budgeting pays back quickly.",
              "Respect professional scope. Nurses and midwives have duties the NMCN expects them to exercise independently, including refusing to give a drug they believe is unsafe until they have checked and escalated. A culture that punishes a nurse for querying a doctor's prescription is a dangerous one.",
              "That points to the hardest issue: the power gap between doctors and nurses. In many Nigerian hospitals, nurses hesitate to challenge doctors, and juniors of either profession hesitate to challenge seniors. Errors that someone noticed then go unreported. Leaders change this mainly by example: senior doctors thanking a nurse who questioned a dose, even when the dose was right, and acting on concerns raised. Posters about speaking up do little if the first nurse who does so is rebuked.",
              "Remember the rest of the team. Laboratory scientists, pharmacists, radiographers, physiotherapists and porters all affect patient care. Joint meetings, shared incident reviews and recognition across professions build a team; separate silos build blame.",
            ),
          },
          {
            title: "Unions, strikes and collective concerns",
            body: p(
              "Clinicians in Nigeria are well organised, and leaders must expect collective action. In the public sector, the Nigerian Association of Resident Doctors (NARD), the Nigerian Medical Association (NMA), the National Association of Nigeria Nurses and Midwives (NANNM) and the Joint Health Sector Unions (JOHESU) have all called strikes in recent years over allowances, arrears, staffing and pay structures.",
              "Public sector strikes affect private hospitals directly. Patients divert from closed public facilities, so emergency and inpatient demand can rise sharply for weeks. Striking resident doctors may seek locum shifts. A private hospital should have a surge plan ready: a pre-agreed rota for higher demand, a list of credentialed locums whose licences and references have already been checked, clear triage, and a decision on how far elective work will be deferred. Hiring doctors who walk in on the day without checks, because demand is high, is how a hospital ends up with an unlicensed practitioner on its floor.",
              "Private hospitals see collective concerns too, usually without a formal union. Staff organise through WhatsApp groups, and a grievance about late allowances or an unfair rota can spread through a whole staff group in an evening. The right response is fast and direct: acknowledge the concern in person, give the facts, commit to a date for action and keep to it. Trying to identify and punish whoever started the group turns a pay problem into a trust problem, and silence lets the rumour fill the gap.",
              "Behind most collective action is a simple failure: commitments to staff that were not kept, or not explained. Paying people correctly and on time, consulting before changing rotas or allowances, and telling staff the truth about the hospital's position prevent far more disputes than any negotiating skill.",
            ),
          },
        ],
        exercises: [
          {
            title: "Get the checklist used",
            instruction:
              "At Sunrise Women's and Children's Hospital, Enugu, the WHO surgical safety checklist was introduced by memo six months ago. An audit of 120 operations last month found it fully completed in 52. Two of the four consultant obstetricians say it 'slows the list down'; one senior theatre nurse supports it strongly. Last quarter there was one retained swab and one wrong-side local anaesthetic block. Write a two-month plan to raise full completion above 90%: who you would involve and in what order, what data you would show to whom, and how you would review progress.",
          },
        ],
      },
      resources: { tools: ["Clinical decision rights map", "Consultant engagement agreement checklist", "Surge staffing plan template"] },
      questions: [
        mc(
          "Surgical safety checklist compliance at a hospital is 45%. The COO plans a memo making it mandatory. What is more likely to work?",
          [
            "A stronger memo with penalties for non-compliance",
            "Removing the checklist, since surgeons clearly do not want it",
            "Showing surgeons their own compliance data, asking a respected surgeon to lead and adapt it with colleagues, then reviewing compliance together",
            "Asking the theatre manager to fill the checklist in after each case",
          ],
          2,
          "Clinicians adopt changes they help shape, led by a respected peer and backed by their own data. A memo treats a clinical practice change as an administrative one, and filling it in afterwards defeats its purpose.",
        ),
        mc(
          "A resident doctor prescribes a dose that the nurse believes is ten times too high. The resident insists it is correct. What should the nurse do?",
          [
            "Withhold it and escalate to the senior doctor",
            "Give the dose, because the prescriber carries the responsibility",
            "Give half the dose as a compromise",
            "Record her concern in the notes and give the dose",
          ],
          0,
          "A nurse is professionally accountable to the NMCN for what she administers, so she must not give a dose she believes is unsafe until it is resolved. Believing the prescriber alone is responsible is the common and dangerous mistake.",
        ),
        mc(
          "A visiting consultant brings fewer of his private patients to your hospital than to a competitor. What is the best lever?",
          [
            "Ban him from admitting patients elsewhere",
            "Offer him a higher professional fee per case",
            "Leave it, since visiting consultants are independent and cannot really be managed by the hospital",
            "A clear agreement on sessions, plus regular talks on what would make you his first choice",
          ],
          3,
          "Visiting consultants choose hospitals where theatre, nursing, equipment and billing work, so find out what the competitor does better. A ban usually loses him, and a higher fee does not fix a list that starts late.",
        ),
        mc(
          "A hospital wants consultants to reduce their caesarean section rates. Which case for change will most influence them?",
          [
            "The financial targets the owner has set for the maternity unit this year",
            "Each consultant's own rate and outcomes, shared privately",
            "An instruction from the board",
            "A poster campaign on natural birth",
          ],
          1,
          "Doctors respond to accurate data on their own patients, presented without blame. Financial targets and instructions treat a clinical decision as an administrative one and invite resistance.",
        ),
        mc(
          "During a national resident doctors' strike, emergency arrivals at a Lagos private hospital rise 30%. What is the best response?",
          [
            "Close the emergency room to new patients until the strike ends",
            "Ask existing staff to work double shifts for as long as the strike lasts",
            "Hire any doctor who presents that day, given the pressure",
            "A pre-agreed surge rota with credentialed locums and clear triage",
          ],
          3,
          "A prepared surge plan with checked locums meets demand safely. Hiring on the day without checks is the tempting shortcut that puts unlicensed or unsuitable practitioners on the floor.",
        ),
        mc(
          "Nurses are complaining in a WhatsApp group that night allowances are three months in arrears. The complaint is spreading. What should management do?",
          [
            "Find out who created the group and issue a query",
            "Acknowledge it in person, give the facts and a payment date, then keep it",
            "Say nothing until the money is available",
            "Post in the group telling staff to raise complaints through official channels only",
          ],
          1,
          "Fast, honest communication with a commitment that is kept rebuilds trust. Punishing the group's creator turns a pay grievance into a trust crisis, and silence lets rumour fill the gap.",
        ),
        mc(
          "What most increases the chance that nurses will raise concerns about doctors' decisions?",
          [
            "A poster campaign on speaking up",
            "A stricter chain of command so concerns go through the matron only",
            "Senior doctors visibly thanking nurses who raise concerns",
            "A suggestion box on each ward",
          ],
          2,
          "Staff watch what happens to the first person who speaks up. Posters and boxes are easy to set up but change little if challenge is still met with rebuke.",
        ),
        ms(
          "Which signs suggest a hospital's clinical leadership structure is working? Select all that apply.",
          [
            "Clinical leads present their department's data at a monthly meeting",
            "All protocol changes are issued by memo from administration",
            "Consultants raise problems before they reach the owner",
            "Nurses escalate concerns about doctors without fear",
            "The medical director takes every clinical decision alone",
          ],
          [0, 2, 3],
          "A working structure has clinicians owning their data, problems surfacing through the structure, and safe escalation across professions. Memo-driven change and one person deciding everything are signs it is not working.",
        ),
        mc(
          "Consultants say a new admission protocol 'was designed by people who don't see patients'. What does this most likely signal?",
          [
            "Clinicians were not involved in designing it, so it should be revised with their input",
            "The consultants are resistant and should be managed firmly",
            "The protocol should be enforced harder for a trial period",
            "The protocol should be dropped altogether",
          ],
          0,
          "The complaint is about process: a rule that touches clinical work was made without clinicians. Enforcing harder ignores the cause, and dropping it loses whatever was good in it.",
        ),
        mc(
          "A respected senior nurse is the informal leader of a ward that is resisting a new handover process. What should the manager do?",
          [
            "Transfer her to another ward to remove the resistance",
            "Involve her early in shaping and piloting the process",
            "Introduce the process through the junior nurses instead, who are more open",
            "Make her sign a commitment to the new process",
          ],
          1,
          "Informal leaders can carry a change or block it, so bringing her in turns her influence to the change's advantage. Going around or removing her signals that staff views do not matter and hardens the resistance.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "hr-function-intro",
      name: "Building an HR Function: A First Look",
      description:
        "What a hospital HR function is for, the order to build it in, and the first 90 days in a hospital that has no HR at all: staff register, files, licences, payroll accuracy, statutory remittances and core policies.",
      estimatedMinutes: 50,
      content: {
        sections: [
          {
            title: "What an HR function is for in a hospital",
            body: p(
              "An HR function exists to make sure the hospital has the right people, lawfully employed, correctly paid, properly licensed and fairly managed. In many Nigerian private hospitals, especially those that grew from a founder's clinic, HR is one administrator who keeps files and prepares the salary list. That works for fifteen staff. It breaks somewhere between fifty and a hundred.",
              "The core jobs are steady and unglamorous.\n- Keep an accurate record of who works here, in what role, on what terms.\n- Pay people correctly and on time, and remit what the law requires.\n- Make sure every clinician holds a current licence to practise.\n- Recruit and induct new staff.\n- Provide policies and fair processes for leave, conduct, grievance and discipline.\n- Support managers to manage their people.",
              "The last point matters. HR does not own the performance of the nurses on a ward; the ward manager does. HR provides the process, the forms, the advice and the record. A hospital where managers send every difficult conversation to HR has managers who are not managing, and an HR officer who becomes the hospital's disciplinarian.",
              "Hospitals have HR needs other businesses do not. Licence tracking is a patient safety and regulatory matter: in Lagos, HEFAMAA inspections look at whether staff are qualified and licensed, and other states have their own regulators. Rotas run around the clock, so leave, overtime and allowances are complicated. Staff files hold sensitive information such as pre-employment medicals and vaccination records, which must be protected under the Nigeria Data Protection Act 2023. And the workforce is under constant pressure from emigration, so recruitment never stops.",
              "For a hospital of 100 to 200 staff, a capable HR manager with an officer or two is usually enough to start, provided the basics are done well. A senior HR director is worth hiring when the hospital becomes a group, opens new sites, or faces significant restructuring.",
            ),
          },
          {
            title: "The order to build it in",
            body: p(
              "Build HR from the bottom up. Owners often want the visible parts first, such as appraisals, a values campaign or a training calendar. They fail when the foundations underneath are missing, because appraisals mean little in a hospital that cannot say who is on its payroll or whether its nurses are licensed.",
              "A workable order is:\n- A staff register: one list of everyone who works in the hospital, employed or contracted, with role, department, start date, pay and licence expiry.\n- Personnel files for each person: signed contract, ID, certificates, licence, references, next of kin, emergency contact.\n- Licence tracking: a simple schedule of every clinician's licence expiry date, checked monthly.\n- Payroll accuracy: reconcile the payroll with the register so everyone paid works here and everyone who works here is paid correctly.\n- Statutory remittances: confirm PAYE, pension, NSITF and, where it applies, ITF are calculated and paid on time.\n- Core policies: leave, attendance, conduct, grievance and discipline.\n- Recruitment and induction: a standard process and a planned first 90 days.\n- Performance and development: objectives, feedback, appraisal and training.",
              "Each layer depends on the one below. A disciplinary process cannot be fair without a policy. A policy cannot be enforced against someone whose contract was never signed. A training budget cannot be targeted without a register that shows who does what.",
              "Contracts deserve early attention. The Labour Act requires employers to give workers written terms of employment within three months of starting, and many hospitals have staff who have worked for years with only a letter of appointment, or nothing. When a dispute arises over notice, leave or allowances, unclear terms usually work against the employer. Issuing proper contracts, explained to staff rather than slipped under the door, is one of the most valuable things a new HR manager can do.",
            ),
          },
          {
            title: "The first 90 days in a hospital with no HR",
            body: p(
              "The first three months in a hospital without HR are about facts, not programmes. Find out who is there, on what terms, and what is wrong, before designing anything.",
              "Start with a headcount census. Walk each department and shift, and list every person working, including locums, visiting consultants, cleaners from an outsourced contractor and long-term volunteers. Compare the list with the payroll. Gaps go both ways. People on the payroll who are not working may be leavers not removed, staff on long-term leave, or names that should not be there. People working but not on the payroll may be paid in cash or through a department's petty cash, which creates legal and financial risk. Resolve every difference before the next payroll run.",
              "Audit the files. For each person, check for a signed contract, proof of qualifications and, for clinicians, a current licence. Do not be surprised if a sizeable share of nursing files lack proof of a current licence. Some nurses will have renewed and not handed in proof; others will have lapsed. Either way, fix it within weeks and set up monthly expiry tracking.",
              "Check the remittances. Confirm with finance that PAYE is deducted and paid to the right State Internal Revenue Service, that pension deductions and the employer's contribution reach each employee's pension fund administrator, and that NSITF and any ITF contributions are paid. Arrears here are a liability that grows quietly.",
              "Secure the records. Staff files often sit in an unlocked cabinet in an open office. Move them somewhere locked, limit who can see them, and keep medical information separate from the general file. Under the NDPA, health data is sensitive personal data and needs a lawful basis and proper protection.",
              "Then write the first short set of policies, agree a simple recruitment and induction process with managers, and only after that turn to performance.",
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster covers the foundations: what HR does, the order to build it in, and the first 90 days. The paid track, Healthcare HR & Leadership, assumes you have done this module and goes into the work that needs specialist knowledge.",
              "- Pay, benefits and employer on-costs in Nigeria: how pay is structured into basic, housing and transport, which elements are pensionable, the full employer cost stack (pension, NSITF, ITF, group life, HMO cover), why NHF is an employee deduction, and how to build a loaded cost for a budget.\n- Employment law, contracts and HR policy: the Labour Act and its limits for professional staff, contracts for employees, locums and visiting consultants, discipline and fair hearing, termination and redundancy, and writing policy people follow.\n- Organisation design and culture change: spans, layers and decision rights in a founder-led hospital, and how to change behaviour so that it lasts.\n- Leadership assessment and transition: using DISC behavioural profiles to diagnose team friction, and the CILTI framework to support a clinician promoted into management.",
              "If you are setting up or fixing HR in a hospital of more than about fifty staff, or advising an owner on pay, contracts or restructuring, those are the areas where errors are expensive. A pay structure that understates pension, a dismissal without a fair hearing, or a restructure announced before staff are consulted can each cost far more than getting it right the first time.",
              "Before moving on, make sure you can do the three things this module asks: list the HR basics a hospital needs in the right order, run a staff census against the payroll, and audit personnel files for contracts and current licences. The paid track builds directly on those skills.",
            ),
          },
        ],
        exercises: [
          {
            title: "Plan the first 90 days",
            instruction:
              "Kaduna Premier Hospital has 140 staff and no HR function; the accountant prepares payroll. The payroll lists 152 names. A quick file check of 60 nurses finds 14 with no record of a current licence and 22 with no signed contract. Pension deductions are made from staff pay, but the accountant is not sure the employer contribution has been remitted since March. The owner wants an appraisal system launched next month. Write a one-page 90-day plan in priority order, with what you would do in weeks 1 to 2, by day 30 and by day 90, and two lines you would say to the owner about the appraisal request.",
          },
        ],
      },
      resources: { tools: ["Staff register template", "Personnel file audit checklist", "Licence expiry tracker", "Statutory remittance checklist"] },
      questions: [
        mc(
          "A 120-staff hospital has no HR function. The owner wants a staff appraisal system launched next month. What should come first?",
          [
            "Launch the appraisal system as asked and fix the records alongside it over the year",
            "A complete staff register and files, and a payroll reconciled to them",
            "A values and culture campaign to build engagement",
            "A training calendar for all departments",
          ],
          1,
          "Every later HR process depends on knowing who works there, on what terms. Appraisals are the visible request, but they mean little without accurate records underneath.",
        ),
        mc(
          "A headcount census finds 140 people working, but the payroll lists 152 names. What should you do?",
          [
            "Assume a clerical error and adjust the payroll down to 140 names before the next run",
            "Remove 12 names from the next payroll at random",
            "Leave it for the external auditors at year end",
            "Check each of the 12 before the next payroll, holding unverified payments",
          ],
          3,
          "Each extra name may be a leaver not removed, someone on legitimate long-term leave or an improper entry, so each needs checking. Cutting names without checking risks stopping pay to someone entitled to it.",
        ),
        mc(
          "A file audit shows 14 of 60 nurses have no record of a current licence. What is the main issue?",
          [
            "Some may be practising unlicensed: a safety and regulatory risk to fix within weeks",
            "The files are incomplete, which matters only at the hospital's next registration renewal",
            "Licences are the nurses' own responsibility, so the hospital has no exposure",
            "The nurses should be dismissed for failing to keep their licences current",
          ],
          0,
          "Employing unlicensed clinicians exposes patients and the hospital at inspection, so status must be confirmed quickly and tracked monthly. Treating it as the nurses' problem alone is the common mistake; the hospital is responsible for who it lets practise.",
        ),
        mc(
          "Who should own the day-to-day performance of the nurses on a ward?",
          [
            "The HR manager, who holds the appraisal forms",
            "The medical director, as the senior clinician",
            "The ward manager, with HR's process and advice",
            "Each nurse individually, without a manager's involvement",
          ],
          2,
          "Managers manage performance; HR provides the process, advice and records. When HR owns it, managers stop managing and HR becomes the hospital's disciplinarian.",
        ),
        ms(
          "A new HR manager is checking statutory remittances. Which should she confirm are being paid correctly? Select all that apply.",
          [
            "PAYE to the relevant State Internal Revenue Service",
            "Pension contributions to each employee's pension fund administrator",
            "NSITF contributions",
            "Dues to the staff welfare association",
            "Contributions to the end-of-year staff party",
          ],
          [0, 1, 2],
          "PAYE, pension and NSITF are legal obligations, and arrears build a growing liability. Welfare dues and party contributions are internal arrangements, not statutory remittances.",
        ),
        mc(
          "Staff files, including pre-employment medical reports, are kept in an unlocked cabinet in the open admin office. What should change?",
          [
            "Nothing, since only staff use the office",
            "Scan everything into a shared folder so all managers can reach staff records easily",
            "Shred the medical reports to remove the risk",
            "Lock them, limit access, and keep medical records apart from the general file",
          ],
          3,
          "Health data is sensitive personal data under the NDPA and needs protection and restricted access. Sharing scans widely spreads the risk, and destroying records the hospital may need is not a fix.",
        ),
        mc(
          "The owner of a 110-staff hospital asks whether to hire an HR director. What is the sound advice?",
          [
            "A capable HR manager on the basics now, senior HR leadership as it grows",
            "Hire an HR director now, because a senior title will fix the problems faster",
            "Outsource all HR to the accountant to save cost",
            "Wait until there is a labour dispute before hiring anyone",
          ],
          0,
          "At this size the gaps are in records, payroll, licences and policy, which a strong HR manager can fix. A senior hire before the basics exist often spends their first year doing an officer's job at a director's salary.",
        ),
        mc(
          "Which first set of policies should a new HR function write?",
          [
            "A 100-page handbook adapted from a multinational company's employee policies",
            "Short policies on leave, attendance, conduct, grievance and discipline",
            "A detailed remote working policy",
            "A policy on executive bonuses",
          ],
          1,
          "These cover the issues that arise every week and underpin fair process. A long borrowed handbook will not match the hospital's contracts or practice and will not be read.",
        ),
        mc(
          "About 40% of a hospital's staff have never received a written contract. Why does this need early attention?",
          [
            "It only matters for staff who join a union",
            "Contracts are needed only for staff earning above a threshold",
            "The Labour Act requires written terms for workers within three months of starting, and unclear terms tend to go against the employer in disputes",
            "Without contracts staff cannot be paid through the bank",
          ],
          2,
          "Written terms are a legal requirement for workers and the basis of every later process. Without them, disputes over notice, leave or allowances are decided on vague evidence, usually to the employer's cost.",
        ),
        mc(
          "Several new nurses leave within three months of starting. Which HR fix is most within the new function's reach?",
          [
            "Raising all nursing salaries by 25%",
            "Requiring every new nurse to sign a three-year bond on the day they start",
            "Stopping recruitment of newly qualified nurses",
            "A planned induction with a buddy and 30, 60 and 90 day check-ins",
          ],
          3,
          "Early leaving often follows a thin induction, and a structured first 90 days is cheap and effective. A blanket bond without training investment is hard to defend and does not address why they leave.",
        ),
      ],
    },
  ],
};

export default expansion;
