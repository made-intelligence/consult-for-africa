import type { Option, Question, TrackExpansion } from "./types";

/** Paragraphs joined with a blank line (the body renders with pre-line). */
const p = (...paras: string[]) => paras.join("\n\n");

const ids = ["a", "b", "c", "d", "e"] as const;

/** Multiple choice: one correct option, given by its letter. */
function mc(question: string, texts: string[], correct: string, explanation: string): Question {
  const options: Option[] = texts.map((text, i) => ({ id: ids[i], text, isCorrect: ids[i] === correct }));
  return { type: "MULTIPLE_CHOICE", question, options, explanation };
}

/** Multi select: two or three correct options, given as letters. */
function ms(question: string, texts: string[], correct: string[], explanation: string): Question {
  const options: Option[] = texts.map((text, i) => ({ id: ids[i], text, isCorrect: correct.includes(ids[i]) }));
  return { type: "MULTI_SELECT", question, options, explanation };
}

const expansion: TrackExpansion = {
  slug: "growth-foundations",
  track: {
    name: "Growth Foundations",
    description:
      "The free starting point for growth and strategy work in Nigerian healthcare. Size a market and draw a catchment, understand what patients experience and how they choose a hospital, read the economics of self-pay and elective services, and frame a hospital strategy as a set of choices. Each taster names what the paid tracks in this domain go on to teach.",
    level: "FOUNDATION",
    category: "growth",
    iconName: "trending-up",
    colorHex: "#2D6A4F",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "FREE",
  },
  modules: [
    // ────────────────────────────────────────────────────────────────────────
    {
      slug: "market-sizing-catchment",
      name: "Market Sizing and Catchment Analysis",
      description:
        "Draw a realistic catchment, turn population into patients who can pay, and estimate the share a new or existing service can expect to win.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Why size the market before anything is built",
            body: p(
              "A market estimate tells the owner whether a new service can fill its capacity, and how fast. Most failed expansions in Nigerian private healthcare did not fail on clinical quality. They failed because the volume in the business plan was never there: a 20-bed maternity wing that delivers eight babies a month, a CT scanner bought for a referral stream that went to the hospital down the road, a dialysis unit running two sessions a day against a plan of six.",
              "Sponsors overestimate for understandable reasons. They count everyone in the area as a potential patient, they assume competitors will stand still, and they take their own current patients as proof that strangers will come. A consultant's job is to replace that optimism with a number that can be defended line by line.",
              "The method is the same whatever the service. Define the area the patients will realistically come from. Count the people in it who could need the service in a year. Remove those who cannot or will not pay at the price you plan to charge. Estimate the share you can win against the providers already there. Each step is a multiplication, and each multiplier is an assumption you should be able to source or test.",
              "You will rarely have perfect data. Census figures are old, state population projections differ, and no one publishes private hospital volumes. That is acceptable. What matters is that the estimate is built in visible steps, that each assumption is labelled with where it came from, and that the final figure is checked against at least one independent view. A transparent estimate that is 20% wrong is far more useful to a board than a confident figure no one can trace."
            ),
          },
          {
            title: "Drawing the catchment",
            body: p(
              "A catchment is the area that produces most of a facility's patients, and in Nigerian cities it is defined by travel time, not distance. Ten kilometres across Lagos can be twenty minutes on a Sunday and two hours on a weekday evening. A bridge, a toll gate or a stretch of road that floods in the rains can cut a catchment in half. For planned care, people will travel further than for emergencies; for maternity and paediatrics, families want to be close.",
              "Start with evidence of where patients already come from. Most hospitals record an address or area at registration. Pull a year of new registrations, group them by local government area or neighbourhood, and count. In a typical urban private hospital, a small number of nearby areas produce well over half of patients. Those form the primary catchment. A wider ring producing the next portion forms the secondary catchment. Patients from further away are usually referrals or loyalty to a named doctor and should be treated separately.",
              "Where there is no history, for a new site, use travel time. Map the realistic journey time at peak hours from the site in each direction, and draw the primary catchment at around 20 to 30 minutes for general and maternity care and wider for specialist services. Then walk or drive it. Competitors, markets, estates, churches and mosques, and the state of the roads become obvious on the ground in a way they never are on a map.",
              "Write the catchment down as a list of named areas with an estimated population for each. A list can be checked and argued with. A circle drawn on a map hides the assumptions inside it."
            ),
          },
          {
            title: "From people to paying patients",
            body: p(
              "Population becomes demand through a chain of rates. Take a maternity example. A primary catchment of 500,000 people, with a planning birth rate of about 35 per 1,000 people a year (check the latest national survey for your state), produces roughly 17,500 births a year. That is the total need, not your market.",
              "Next, remove those who will not use the kind of provider you are. Some births happen at home, at a mission facility, a public general hospital or a primary health centre. Then apply ability to pay. A private maternity package at N450,000 is affordable to a minority of households, plus women whose employer HMO plan covers the hospital. Suppose local evidence suggests 20% of births in this catchment go to private facilities at roughly that price level. The addressable market is about 3,500 births a year.",
              "Insured and self-pay patients behave differently, so split them. An insured patient can only choose among providers on her HMO's list for her plan, and the tariff is negotiated, not set by you. A self-pay patient compares prices and reputation directly. If the hospital is not on the main HMO lists in the area, a large part of the addressable market is closed to it however good it is.",
              "Use rates you can source: national survey figures for births and disease prevalence, HMO enrolment estimates, the hospital's own conversion data, and interviews with doctors who practise locally. Where a rate is a judgement, say so and test the result with a higher and lower value. If the plan only works at the optimistic end of every range, it does not work."
            ),
          },
          {
            title: "Share, competitors and the sanity check",
            body: p(
              "Market share is where most estimates go wrong, because sponsors assume they will win far more than their capacity or reputation justifies. A simple starting point is fair share: your proportion of the comparable capacity in the catchment. If there are nine other private maternity units of a similar standard with similar bed numbers, a new entrant's fair share is about one tenth of the addressable market. In the example above that is 350 births a year, around 29 a month.",
              "Adjust fair share for things you can name: a well-known obstetrician who will move across with her patients, a site on the main road with parking, an HMO contract a competitor lacks, or the opposite. Adjust slowly. A new unit rarely reaches fair share in its first year; a ramp from a third of fair share to full fair share over two to three years is a reasonable default.",
              "Then cross-check. A bottom-up estimate built from the catchment should be compared with a top-down view, such as how many deliveries the comparable competitors actually do. Visit them, count beds, ask their nurses how busy they are, and look at the queues. If your estimate of 350 a year implies that you will be busier than the best established unit in the area, something is wrong.",
              "Present the answer as a range with the assumptions beside it. A board that sees 'between 250 and 420 births a year by year three, depending on HMO listing and whether Dr X joins' can make a decision. A board that sees '1,200 births' can only make a mistake."
            ),
          },
        ],
        exercises: [
          {
            title: "Size a dialysis unit in Ibadan",
            instruction:
              "A 60-bed private hospital in Ibadan proposes a six-station dialysis unit, each station able to run three sessions a day, six days a week. Its primary catchment holds an estimated 900,000 people. A nephrologist tells you that, locally, about 150 people per million are on or need regular haemodialysis, most needing two to three sessions a week, and that two other private units and one public unit already operate within 30 minutes. Build the estimate step by step: patients needing dialysis, the share likely to use private care, a fair share for the new unit, and sessions per week against capacity. State every assumption and give a low and high case.",
          },
        ],
      },
      resources: { tools: ["Spreadsheet", "Google Maps (travel time at peak hours)", "Hospital registration data"] },
      questions: [
        mc(
          "A sponsor in Lekki says the catchment for a new paediatric clinic is 'everyone within 15 km', about 1.4 million people. What is the strongest objection to that definition?",
          [
            "15 km is too small, because specialist paediatric care draws families from at least 30 km across the city",
            "Travel time at peak hours, not radius, determines where families will realistically come from",
            "Catchments should be based on local government boundaries, never on distance",
            "Population figures for Lagos are unreliable, so no catchment can be drawn",
          ],
          "b",
          "In Lagos, a radius hides bridges, tolls and traffic that make some areas inside 15 km effectively distant. Using LGA boundaries can help list areas, but the boundary choice still has to follow travel time.",
        ),
        mc(
          "An existing hospital wants to know its catchment. Which data source should you go to first?",
          [
            "The latest state population projection",
            "A survey of residents in surrounding estates",
            "The addresses recorded for a year of new patient registrations",
            "The marketing team's view of where patients come from",
          ],
          "c",
          "Registration addresses show where patients actually come from. Population projections tell you how many people live in an area, not whether they use this hospital.",
        ),
        mc(
          "A catchment of 400,000 people has a planning birth rate of 35 per 1,000 a year. Local evidence suggests 15% of births go to private units at the price you plan. There are seven comparable private units including yours, of similar size. What is your fair share in births per year?",
          ["300", "2,100", "1,400", "600"],
          "a",
          "400,000 x 35/1,000 = 14,000 births; 15% private = 2,100; one of seven comparable units gives 300. The 2,100 figure is the addressable market, a common mistake to present as the hospital's own volume.",
        ),
        mc(
          "The same plan assumes the new unit reaches full fair share in month three. What would you recommend?",
          [
            "Accept it, since fair share already assumes an average competitor",
            "Double it, because a new unit attracts curiosity in its first months",
            "Replace it with fair share less 10% from month one, to allow for the time a new unit needs to become known",
            "Model a ramp, starting well below fair share and reaching it over two to three years",
          ],
          "d",
          "New units take time to build reputation, referrals and HMO listings, so a ramp is the realistic default. Shaving 10% off fair share from month one still assumes an established unit's reputation.",
        ),
        mc(
          "A hospital in Port Harcourt is not on the provider lists of the two HMOs that cover most employers in its catchment. How does this affect a market estimate for its new antenatal service?",
          [
            "It has no effect, since antenatal care is chosen by the patient",
            "It closes most of the insured segment, so the addressable market is mainly self-pay",
            "It increases the market, because insured patients will pay cash to avoid HMO delays",
            "It only matters for inpatient care, not antenatal visits",
          ],
          "b",
          "Insured patients choose among the providers their plan lists, so being off the main lists removes most of that segment. Some insured patients do pay cash, but planning on it is optimism, not evidence.",
        ),
        mc(
          "Your bottom-up estimate says a new day-surgery centre will do 140 cases a month in year two. The busiest established competitor in the same catchment does about 90. What should you do?",
          [
            "Re-examine the share and conversion assumptions, because the estimate implies beating the market leader quickly",
            "Keep the estimate, because a bottom-up build from catchment data is more rigorous than an informal look at one competitor",
            "Average the two figures and report 115",
            "Drop the competitor figure because it came from an informal conversation",
          ],
          "a",
          "A top-down check that contradicts the bottom-up estimate is a signal that an assumption is too generous. Averaging hides the problem rather than finding which assumption is wrong.",
        ),
        ms(
          "Which of these belong in a defensible market estimate for a board? Select all that apply.",
          [
            "Each assumption labelled with its source or marked as a judgement",
            "A single precise figure, so the board is not confused",
            "A low and high case showing which assumptions move the answer",
            "A cross-check against observed competitor volumes",
            "The sponsor's target volume used as the base case",
          ],
          ["a", "c", "d"],
          "Boards decide better with visible assumptions, a range and an independent check. A single precise figure looks confident but hides the uncertainty, and the sponsor's target is the thing being tested, not the evidence.",
        ),
        mc(
          "In a primary catchment estimate, which of these is a fair reason to raise a new clinic's share above fair share?",
          [
            "The owner is confident in the brand",
            "The clinic will be newer than its competitors",
            "A well-regarded paediatrician with an established local following has signed to join",
            "The owners plan to spend more on launch marketing than any competitor has spent in the catchment",
          ],
          "c",
          "A named clinician with a following is a specific, checkable reason patients will come. A newer building or confidence in the brand are reasons sponsors give, but patients rarely move for them alone.",
        ),
        mc(
          "Which statement best describes the difference between total need and the addressable market?",
          [
            "Total need is for one year; the addressable market is for five years",
            "Total need counts the insured patients in the catchment, while the addressable market counts the self-pay patients who can choose freely between providers",
            "They are the same figure measured from different data sources",
            "Total need is everyone who could need the service; the addressable market is those who would use your kind of provider at your price",
          ],
          "d",
          "The addressable market removes people who will use another type of provider or cannot pay at your price. Treating total need as the market is the most common reason volume forecasts fail.",
        ),
        ms(
          "A new site has no patient history. Which steps are sound for drawing its catchment? Select all that apply.",
          [
            "Map realistic peak-hour travel times from the site in each direction",
            "Drive or walk the area to see competitors, roads and estates",
            "Use the catchment of the owner's other hospital in another city",
            "List the named areas inside the catchment with a population for each",
          ],
          ["a", "b", "d"],
          "Travel time, a site visit and a written list of areas produce a catchment others can check. Another city's catchment reflects different roads, competitors and incomes, so it says little about this site.",
        ),
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    {
      slug: "patient-experience-basics",
      name: "Patient Experience and Reputation",
      description:
        "What patients judge a hospital on, how to map and measure their experience honestly, and how complaints and online reputation are handled.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "Experience is what patients can judge",
            body: p(
              "Most patients cannot assess the clinical quality of their care, so they judge the hospital on what they can see: how long they waited, whether anyone explained what was happening, whether the bill matched what they were told, how clean the toilets were, and how the nurse spoke to their mother. Those judgements decide whether they come back and, more importantly in Nigeria, what they tell family, colleagues and church members.",
              "This matters commercially. Private hospitals in Nigerian cities grow mostly through word of mouth and doctor referral. A hospital that loses a patient to a bad experience usually loses that patient's household as well, and the story travels in WhatsApp groups faster than any advertisement. For an insured patient, a poor experience leads to a request to the HMO to change provider at the next opportunity.",
              "Experience and clinical quality are linked but not the same. A hospital can give excellent surgery and a terrible discharge, where the family waits six hours for the bill and leaves angry. It can also give a warm, quick service with a missed diagnosis. Good experience work never tries to substitute for clinical safety. It looks at the parts of the visit the patient lives through and removes the friction, confusion and disrespect that the hospital has stopped noticing.",
              "A useful first question for any hospital is simple: what do patients complain about most, and what do they praise? The answers usually point to a short list of moments. Waiting, communication and money explain the majority of complaints in most facilities, and staff attitude runs through all three."
            ),
          },
          {
            title: "Mapping the journey and its moments that matter",
            body: p(
              "A patient journey map lists every step a patient goes through, from deciding to come to the first follow-up, and records what the patient experiences at each one. For an outpatient visit the steps typically are: finding the number or booking, arriving and parking, registration and payment or HMO verification, waiting, vital signs, the consultation, tests and results, pharmacy, paying, and leaving with a clear next step.",
              "Build the map by walking the journey yourself, at peak time, as a patient would. Time each step with a watch. Note every time a patient has to ask what to do next, queue twice, pay at more than one point, or wait without being told why. Then sit in the waiting area and listen. Patients will tell each other things they will never put on a feedback form.",
              "Some moments matter far more than others. In Nigerian private hospitals, three stand out. The first is money: the deposit conversation at admission and the final bill at discharge. A bill that is much larger than the estimate, or arrives hours after the patient was told they could go, destroys goodwill earned over days of good care. The second is waiting without information. Patients tolerate a wait they understand; they resent one that nobody explains. The third is the family. Relatives often make the decisions, bring the money and sit at the bedside, and how staff treat them shapes the story the family tells.",
              "The output of mapping is not a pretty diagram. It is a short list of specific problems, each with the step it occurs at, how often, and how much it matters to patients. That list is what the hospital fixes first."
            ),
          },
          {
            title: "Measuring experience honestly",
            body: p(
              "Measurement should combine what patients say with what you can observe, because each alone misleads. Exit surveys, complaint logs and online reviews tell you how patients feel. Time stamps, mystery shopping and direct observation tell you what actually happened.",
              "Keep surveys short. Three to five questions on a card or a WhatsApp link, asked at the end of the visit or within a day, get far more responses than a long form. Ask about specific things: how long did you wait to see the doctor, did someone explain your treatment, was the bill what you expected. Add one open question about what to improve. Watch for bias. Surveys handed out by the receptionist who served the patient will be kinder than the truth, and the angriest patients often leave before anyone asks.",
              "Net Promoter Score, the share of patients who would recommend you minus those who would not, is popular but fragile with small samples. A clinic with 40 responses a month can see the score swing widely from chance alone. Use it as a trend over several months, alongside the specific questions, not as a monthly target that staff are punished for.",
              "Waiting time is the easiest hard measure. Record the time of arrival, the time seen by the doctor and the time the patient leaves, for a sample of patients every week. Mystery shopping, where someone books and attends as a patient, shows how the phone is answered and how enquiries are handled.",
              "Feedback is personal data. Under the Nigeria Data Protection Act 2023, patients should know how their contact details will be used, and survey results should not be shared in a way that identifies them outside the team that needs them."
            ),
          },
          {
            title: "Complaints, recovery and reputation",
            body: p(
              "A complaint handled well can leave a patient more loyal than one who had no problem at all, and a complaint ignored becomes a reputation problem. Every hospital needs a simple, visible way to complain, a named owner for each complaint, and a promise of a response within a set time, such as an acknowledgement the same day and a resolution within a week.",
              "Log every complaint with the date, the step in the journey, the category (waiting, communication, billing, attitude, clinical) and what was done. Review the log monthly. A single complaint about a rude cashier is an individual issue. Twelve complaints about the billing queue in a month is a process problem, and the fix is in the process, not in a warning letter. Clinical complaints follow a different route: they go to the medical director and the clinical governance process, not only to customer service.",
              "Service recovery has a recognisable shape. Listen without arguing. Apologise for the experience, even while the facts are being checked. Fix what can be fixed now. Tell the patient what will change. Follow up. Staff on the front line need authority to resolve small issues on the spot, such as waiving a registration fee after a long wait, within a limit set by management.",
              "Online reviews on Google and social media are now part of how new patients choose. Reply to them, politely and promptly, but never confirm that someone is a patient or discuss their care in public. A response such as 'We are sorry to read this. Please contact our patient relations team on this number so we can look into it' protects confidentiality and shows other readers the hospital takes complaints seriously."
            ),
          },
        ],
        exercises: [
          {
            title: "Find the three moments that matter",
            instruction:
              "A 45-bed hospital in Abuja receives 64 logged complaints in a quarter: 22 about waiting in outpatients, 15 about final bills being higher than the estimate, 9 about how long discharge takes, 8 about staff attitude at the front desk, 6 clinical and 4 about parking. Its average outpatient wait from arrival to doctor is 95 minutes on weekdays. Group the complaints into journey steps, decide which three problems to fix first and why, propose one measure for each, and say what you would do with the 6 clinical complaints.",
          },
        ],
      },
      resources: { tools: ["Patient journey map template", "Complaints log", "Short exit survey"] },
      questions: [
        mc(
          "A hospital's exit survey shows 92% satisfaction, but complaints about billing have tripled in six months. The surveys are handed out by the cashier after payment. What is the most likely explanation?",
          [
            "Billing complaints come from a small group of difficult patients",
            "The survey method is biased and is missing dissatisfied patients",
            "Satisfaction is genuinely high and complaints should be ignored",
            "Patients are satisfied with clinical care but not with prices, which cannot be changed",
          ],
          "b",
          "A survey handed out by the person who just took the patient's money invites polite answers and misses those who leave angry. The complaint trend is the stronger signal that something has changed.",
        ),
        mc(
          "Which pair of moments most often destroys goodwill in an otherwise good inpatient stay in a Nigerian private hospital?",
          [
            "The meal service and the television in the room",
            "The first consultation and the ward round",
            "The deposit conversation at admission and the final bill at discharge",
            "The parking and the lift",
          ],
          "c",
          "Money moments are where families feel most exposed, and a final bill far above the estimate, or delayed for hours, undoes days of good care. Ward rounds matter too, but they are usually where the hospital is strongest.",
        ),
        mc(
          "A clinic gets about 35 survey responses a month. Its Net Promoter Score falls from +42 to +28 in one month and the owner wants to discipline the front desk. What should you advise?",
          [
            "Treat it as a trend measure over several months and look at the specific questions before acting on one month",
            "Discipline the front desk, since they are the first and last contact and NPS mostly reflects how patients were treated there",
            "Stop using NPS entirely as it is meaningless",
            "Raise the response target to 35 per day immediately",
          ],
          "a",
          "With around 35 responses, a 14-point swing can come from chance alone, so one month is not evidence of a real fall. NPS is still useful as a trend alongside specific questions, so abandoning it goes too far.",
        ),
        mc(
          "A patient posts a one-star Google review naming her surgeon and saying her wound became infected. What is the right public reply?",
          [
            "Reply with a short, factual account of the clinical care so that other readers can see the infection was not the hospital's fault",
            "Delete or ignore the review to avoid drawing attention",
            "Confirm the dates of her admission to show you take it seriously",
            "Apologise for her experience and invite her to contact patient relations privately, without confirming she was a patient",
          ],
          "d",
          "Confirming she was a patient or discussing her care publicly breaches confidentiality, however tempting a factual rebuttal is. A courteous invitation to a private channel protects her and shows others that complaints are handled.",
        ),
        mc(
          "The complaints log shows 14 complaints in a month about the queue at the pharmacy, each naming a different staff member. What kind of problem is this?",
          [
            "A training problem for each named staff member",
            "A process problem in how the pharmacy step is organised",
            "A clinical problem for the medical director",
            "A data problem, because complaints are unreliable",
          ],
          "b",
          "When many complaints point at one step with different staff involved, the cause is the process, not individuals. Warning letters to each person would leave the queue exactly as it is.",
        ),
        mc(
          "Which complaint should go to the medical director and the clinical governance process rather than being resolved by customer service alone?",
          [
            "A family says their father was given the wrong dose of an antibiotic",
            "A patient waited 2 hours to see the doctor",
            "The final bill included a registration fee the patient was not told about",
            "The receptionist was rude on the phone",
          ],
          "a",
          "A possible medication error is a clinical safety matter that needs clinical review. The other complaints are real but are service problems that customer service and operations can resolve.",
        ),
        ms(
          "You are building a journey map for outpatients at a busy Lagos hospital. Which methods will give you an accurate picture? Select all that apply.",
          [
            "Walking the journey yourself at peak time and timing each step",
            "Sitting in the waiting area and listening to patients",
            "Asking the head of outpatients to describe the process",
            "Recording arrival, seen-by-doctor and departure times for a weekly sample",
            "Relying on the hospital's written standard operating procedure",
          ],
          ["a", "b", "d"],
          "Walking, listening and time stamps show what really happens. Managers and written procedures describe how the process is meant to work, which is often not what patients experience.",
        ),
        mc(
          "A patient waited 3 hours for a scan because the machine was down and nobody told her. Which recovery response follows good practice?",
          [
            "Explain that equipment failure is outside the hospital's control",
            "Offer a discount on her next visit without discussing what happened",
            "Listen, apologise for the wait, rebook her promptly, and explain what will change in how delays are communicated",
            "Give her the formal complaints form, explain that the matter will be investigated, and let the complaints process run its full course",
          ],
          "c",
          "Good recovery listens, apologises, fixes what can be fixed now and explains what will change. A form alone is slow and impersonal, and a discount without acknowledgement treats the symptom, not the grievance.",
        ),
        mc(
          "A hospital wants to send a WhatsApp satisfaction survey to every patient after their visit. What must it make sure of under the Nigeria Data Protection Act 2023?",
          [
            "That the survey is fully anonymous, since the Act does not allow patient contact details to be used for any purpose other than treatment",
            "That it registers each survey with NAFDAC",
            "That responses are published so patients can see them",
            "That patients know their contact details may be used this way and results are not shared in ways that identify them",
          ],
          "d",
          "The NDPA requires a lawful basis and transparency about how personal data is used, and appropriate confidentiality. It does not ban using contact details for feedback, and NAFDAC regulates products, not surveys.",
        ),
        mc(
          "An outpatient department's average wait from arrival to doctor is 95 minutes. Patients rate the wait as their top complaint. Which first step is most likely to reduce complaints quickly while the flow problem is being fixed?",
          [
            "Telling patients at registration how long the wait is likely to be and updating them if it changes",
            "Installing a television in the waiting area",
            "Asking doctors to shorten consultations to about five minutes each so that the queue moves faster during the morning peak",
            "Removing the question about waiting from the survey",
          ],
          "a",
          "Patients tolerate waits they understand far better than unexplained ones, so information reduces complaints quickly while the flow is fixed. Cutting consultation time moves the problem into clinical quality.",
        ),
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    {
      slug: "marketing-intro",
      name: "How Patients Choose a Hospital: Marketing Basics",
      description:
        "A first look at healthcare marketing in Nigeria: how insured, self-pay and emergency patients choose, the levers a hospital controls, a one-sentence position, and the rules to know before publishing anything.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "How patients actually choose",
            body: p(
              "Patients choose a hospital in different ways depending on how urgent the need is and who is paying, so marketing has to start by separating them. In an emergency, the choice is the nearest place that is open, known to be competent and likely to accept the patient without a long argument about a deposit. Planned care is different. There is time to ask around, compare and decide.",
              "Insured patients choose within limits. An employee on an HMO plan, or an enrollee under the NHIA or a state health insurance scheme, can generally use only providers listed for their plan, and often must register with one primary provider who refers onward. For this patient, the first choice is made by the HR manager who picked the HMO and the HMO that built the provider list. A hospital that is not on the list barely exists for them.",
              "Self-pay patients choose more freely and pay more attention to price, but price is rarely the deciding factor alone. The strongest influence in Nigeria is personal recommendation: a family member, a colleague, a pastor or imam, and above all a doctor. A GP or specialist who says 'go to this hospital, ask for Dr Okafor' delivers a patient who has already decided. Proximity, reputation for a particular service, and how easy the first contact is all come next.",
              "The person choosing is often not the patient. Adult children choose for elderly parents, husbands and mothers-in-law influence maternity decisions, and relatives abroad frequently research and pay for care for family at home. Marketing that speaks only to the patient misses the person holding the decision and the money.",
              "So the basic question for any hospital is: for this service, who decides, on what basis, and where do they get their information?"
            ),
          },
          {
            title: "The levers a hospital controls",
            body: p(
              "Marketing in a hospital rests on three things: people must know the hospital exists for their need, trust it enough to try it, and find it easy to get in. Most hospitals spend on the first and neglect the other two.",
              "Being known means the right people associate the hospital with the right service. A general hospital that is known for nothing in particular competes on location and price. One known for safe caesarean sections, or for being the place that sees children quickly at night, has a reason to be chosen. Awareness comes from referrers, existing patients, the hospital's signage and directions, an accurate Google listing, and a modest amount of well-placed content.",
              "Being trusted is built mostly by clinicians and by experience. Named doctors with visible qualifications, consistent outcomes, a clean and orderly facility and honest pricing do more than any slogan. Patient experience work is marketing in this sense.",
              "Being easy is where hospitals lose the most patients cheaply. Call five private hospitals at 7pm and count how many answer, how many can give an appointment, and how many can say what a consultation costs. Enquiries that go unanswered, WhatsApp messages left on read and booking lines that ring out are lost patients the hospital already paid to attract. Fixing the phone and the WhatsApp line is often the highest-return marketing a hospital can do.",
              "Measure where new patients come from. Add 'how did you hear about us?' to registration, with a short list of answers, and review it monthly. Without it, the hospital cannot tell which effort works."
            ),
          },
          {
            title: "A position in one sentence, and a simple plan",
            body: p(
              "Before spending on marketing, a hospital should be able to finish one sentence: for these patients, with this need, we are the best choice because of this reason. 'For working families in Surulere, we are the paediatric clinic that sees your child within an hour, day or night, with a consultant on call' is a position. 'Quality healthcare with a human touch' is not, because every competitor could say it.",
              "The reason must be true and provable. If the clinic claims children are seen within an hour, it must measure and publish its own waiting times, and it must actually achieve them. A position that the experience contradicts is worse than having none.",
              "A basic marketing plan for a single hospital fits on one page. It names two or three priority services where the hospital has capacity and a real advantage. For each, it says who decides, what they need to hear, and which two or three channels reach them: referring doctors, employer HR teams, the Google listing, a WhatsApp business line, community health talks, or a small amount of targeted social media. It sets a monthly budget, a named owner and a measure, such as new patients for that service by source.",
              "Concentrate. A hospital with a limited budget that spreads it across eight services and six channels learns nothing and changes nothing. One that pushes two services hard for six months, measures new patients by source and adjusts, will know what works by the end of the year."
            ),
          },
          {
            title: "Rules to know before you publish anything",
            body: p(
              "Healthcare advertising in Nigeria is regulated, and getting it wrong can mean fines, withdrawn adverts or professional discipline for the doctors involved. You need a basic awareness of the rules even before you design a flyer.",
              "The Advertising Regulatory Council of Nigeria (ARCON), under the Advertising Act 2022, requires advertisements to be vetted and approved before they are exposed to the public. This covers digital and social media as well as billboards, radio and print. Health-related claims attract particular attention. Run an advert without approval and the hospital and its agency are exposed to sanctions.",
              "The Medical and Dental Council of Nigeria regulates how doctors present themselves. Its code of ethics restricts doctors from self-promotion that claims superiority over colleagues or solicits patients in ways the profession considers improper. A hospital promoting a named consultant needs to keep within those limits.",
              "Some practices are risky whoever regulates them: promising outcomes ('guaranteed results'), using patient photographs or stories without clear written consent, publishing before-and-after images, and quoting prices that later turn out not to include the things patients assume. Patient contact lists used for marketing are personal data under the Nigeria Data Protection Act 2023, so patients must know and, where required, agree to how they will be contacted.",
              "Agencies and freelancers do not carry this responsibility for you. The hospital is the advertiser, and its name is on the advert, so it should ask to see the approval before anything is published or boosted.",
              "The safe working rule at this level: make claims you can prove, never use a patient's image or story without written consent, and have any advert checked for ARCON approval before it runs."
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster gives you the basic picture: who chooses and how, the three levers of known, trusted and easy, a one-sentence position, a one-page plan, and an awareness of the rules. That is enough to diagnose the obvious problems in a hospital's marketing and to avoid the worst mistakes.",
              "The paid track, Healthcare Marketing & Patient Acquisition, goes into how to do the work properly. It covers, among other things:",
              "- The marketing rules in working detail: the ARCON pre-vetting process, MDCN advertising rules, testimonials and before-and-after images, and how to keep an aesthetics or fertility campaign within them.\n- Building and managing a referral network: identifying which doctors send patients, how to keep them, and doctor relations that stay ethical.\n- Digital marketing for healthcare: search, social media, WhatsApp and content, with what each costs and returns.\n- Corporate and community outreach, such as health talks, screenings and employer wellness programmes, and the patient funnel from enquiry to booking to return, with the measures that show where patients are lost.",
              "The paid modules assume you have done this taster and do not repeat it. If you can already finish the positioning sentence for a real hospital, explain why an insured patient may never consider a hospital that is off her HMO's list, and name two things that need ARCON approval, you are ready for them.",
              "If you work in a clinical or operations role rather than marketing, this taster may be all you need. It explains why the front desk, the phone line and the final bill matter so much to whether a hospital grows."
            ),
          },
        ],
        exercises: [
          {
            title: "Test the easy lever",
            instruction:
              "Choose four private hospitals or clinics in your city. On a weekday evening between 6pm and 8pm, call each one and send each a WhatsApp enquiry asking for a paediatric appointment the next day and the consultation fee. Record whether they answered, how long it took, whether they gave a time and a price, and how they treated you. Write a half-page note to a hospital owner on what this tells you, and estimate how many new patients a month a hospital with 300 enquiries a month might be losing if a third go unanswered and half of those would have booked.",
          },
        ],
      },
      questions: [
        mc(
          "A 50-bed hospital in Ikeja is not on the provider list of the HMO used by the three largest employers in the area. The owner wants to spend N2m on billboards aimed at their staff. What should you advise first?",
          [
            "Approve the billboards, since awareness always comes first",
            "Redirect the N2m to targeted social media aimed at the same employees, which reaches more of them for the money",
            "Pursue a listing with that HMO, since most of those staff can only use listed providers",
            "Offer those employees a cash discount instead",
          ],
          "c",
          "Insured staff generally choose among listed providers, so awareness will not turn into patients while the hospital is off the list. A cash discount asks insured people to pay twice, which few will do.",
        ),
        mc(
          "For planned self-pay care in Nigeria, which influence is usually strongest in a patient's choice of hospital?",
          [
            "The hospital's social media following",
            "A recommendation from a doctor or a trusted person",
            "The lowest advertised price",
            "The size of the hospital building",
          ],
          "b",
          "Personal recommendation, especially from a doctor, delivers patients who have already decided. Price matters to self-pay patients but rarely decides alone.",
        ),
        mc(
          "A hospital receives about 400 enquiries a month by phone and WhatsApp. A test shows 30% go unanswered, and about half of answered enquiries book. Roughly how many bookings a month is it losing to unanswered enquiries?",
          ["120", "200", "30", "60"],
          "d",
          "30% of 400 is 120 unanswered enquiries; if half would have booked, about 60 bookings are lost. 120 is the number of missed enquiries, not of lost bookings.",
        ),
        mc(
          "Which of these is a usable positioning statement for a clinic?",
          [
            "For Gwarinpa families: the children's clinic that sees your child within an hour, day or night",
            "Excellence in healthcare delivery, with compassion, integrity and modern equipment for every member of the family",
            "The best hospital in Abuja",
            "Your health is our priority",
          ],
          "a",
          "It names who it is for, what need, and a reason that can be proved and measured. The others could be claimed by any competitor, and 'the best hospital' also raises professional advertising concerns.",
        ),
        mc(
          "An elderly woman in Enugu needs a hip assessment. Her son, who lives in London, is researching options and will pay. Whom should the hospital's marketing for this service mainly be designed to reach?",
          [
            "The woman herself, since she is the patient",
            "Her local church",
            "The adult child who is researching and paying",
            "The NHIA, as the regulator of elderly care",
          ],
          "c",
          "The decision and the money often sit with relatives, including those abroad, so marketing must reach them with the information they look for. Speaking only to the patient misses the decision maker.",
        ),
        mc(
          "A hospital's new Instagram campaign for its maternity service was designed and posted by an agency without approval from ARCON. What is the main problem?",
          [
            "Instagram is outside ARCON's remit, so there is no problem",
            "Only outdoor and broadcast adverts need approval; organic posts on a hospital's own social media pages fall outside the rules",
            "Only the MDCN regulates hospital adverts",
            "Adverts, including digital ones, need ARCON approval before they are exposed, so the hospital and agency face sanctions",
          ],
          "d",
          "The Advertising Act 2022 requires pre-exposure approval and covers digital channels. The MDCN regulates doctors' professional conduct, which is a separate set of rules, not a replacement for ARCON vetting.",
        ),
        ms(
          "A hospital with a small budget wants to grow. Which elements belong in its one-page marketing plan? Select all that apply.",
          [
            "Two or three priority services with capacity and a real advantage",
            "For each, who decides and the two or three channels that reach them",
            "Promotion of all eight services equally to be fair to departments",
            "A named owner, a monthly budget and new patients by source as the measure",
          ],
          ["a", "b", "d"],
          "Concentrating on a few services with clear channels, an owner and a measure lets the hospital learn what works. Spreading a small budget across every service and channel produces no learning and no change.",
        ),
        mc(
          "A hospital wants to know which of its marketing activities brings in new patients. What is the simplest reliable first step?",
          [
            "Commission a market research study",
            "Add a 'how did you hear about us?' question with fixed answers at registration and review it monthly",
            "Count social media likes each week",
            "Ask each consultant at the monthly meeting where they believe their new patients have been coming from",
          ],
          "b",
          "Asking every new patient at registration gives direct, cheap and continuous data on source. Likes measure attention, not patients, and doctors' impressions are not a count.",
        ),
        ms(
          "A cosmetic clinic wants to post photographs of a patient's results with her story. Which conditions are needed at a minimum? Select all that apply.",
          [
            "Clear written consent from the patient for that use",
            "An advert cleared through ARCON before it runs",
            "A promise in the advert that results are guaranteed",
            "A larger photograph of the surgeon than of the patient",
          ],
          ["a", "b"],
          "Using a patient's images needs her written consent, and the advert needs ARCON approval before exposure. Guaranteeing results is exactly the kind of claim that creates regulatory and ethical risk.",
        ),
        mc(
          "A clinic positions itself as 'seen within 30 minutes', but its measured average wait is 80 minutes. What is the right action?",
          [
            "Keep the claim, since aspirational messaging motivates staff",
            "Remove the waiting-time question from patient surveys",
            "Stop the claim until the clinic achieves and measures it, and fix the flow first",
            "Change the claim to 'seen within an hour', which is closer to the measured figure and still sounds competitive",
          ],
          "c",
          "A position the patient experience contradicts damages trust faster than having no position, so fix the flow before making the claim. Moving the claim to an hour is still untrue at 80 minutes.",
        ),
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    {
      slug: "elective-intro",
      name: "Self-Pay and Elective Services: The Basics",
      description:
        "What makes elective and self-pay care different, the one-page economics of a service line, the patient's expectation of the bill, and the capacity and clinical fit an elective service needs.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "What makes elective and self-pay care different",
            body: p(
              "Elective care is treatment a patient can plan: a hernia repair, a knee replacement, fertility treatment, a full health check, cosmetic surgery, a planned caesarean section. Self-pay means the patient, their family or someone acting for them pays directly rather than an insurer. The two overlap heavily in Nigeria, where out-of-pocket spending is the main way health care is paid for and most HMO plans exclude or cap the procedures people most often plan.",
              "Three features follow. The patient chooses the timing and the provider, so the hospital competes for each case. The patient compares, often on price, but more on trust in a named doctor and on whether the price quoted is the price paid. And the money usually has to be found in advance: savings, family contributions, a loan, or relatives abroad. A delay of weeks between consultation and procedure is normal while the family raises funds.",
              "This makes elective work attractive to hospitals. Cash arrives before or at the time of treatment rather than months later through claims. Prices are set by the hospital rather than by a tariff. Cases can be scheduled into quiet theatre time. A well-run elective line can carry the overheads of a hospital whose insured work pays slowly.",
              "It also brings risks the hospital must manage. Demand is sensitive to price, to the economy and to the exchange rate, since many consumables and implants are imported. A single complication or a viral complaint can empty a service. And because patients pay a lot at once, they expect a level of explanation, comfort and certainty that many hospitals have never been asked to provide for insured or emergency patients."
            ),
          },
          {
            title: "The economics of a service line on one page",
            body: p(
              "Before launching or pricing an elective service, work out what each case contributes and how many cases the service needs to cover its own fixed costs. That one page answers most of the questions an owner should ask.",
              "Take a day-case hernia repair priced at N650,000. The costs that rise with each case are: consumables and mesh N120,000, drugs N40,000, surgeon fee N150,000, anaesthetist N60,000 and laboratory tests N20,000, a total of N390,000. Each case therefore contributes N260,000 towards the hospital's fixed costs and profit.",
              "Next, list the fixed costs the service adds each month whether or not cases happen: the share of theatre staff time, a patient coordinator, some marketing, equipment maintenance. Suppose they come to N3.9m a month. The service breaks even at 15 cases a month. At 25 cases it adds N2.6m a month to the hospital; at 8 cases it loses N1.82m.",
              "Two lessons come out of this kind of page. The first is that volume matters far more than most owners expect, because fixed costs are high and contributions per case are limited. The second is that discounts are expensive. A 10% discount on the N650,000 price removes N65,000 from a contribution of N260,000, a quarter of what the case earns. To make the same money, the hospital needs about a third more cases.",
              "Use the hospital's own costs, not a competitor's price, as the starting point. Then compare with the market to see whether the price is realistic. If the price the market will bear does not cover the cost per case plus a fair share of fixed costs at a realistic volume, the service should not be launched in that form."
            ),
          },
          {
            title: "The quote, the deposit and the bill the patient expects",
            body: p(
              "For a self-pay patient, the most important number is not the price but the difference between the quote and the final bill. A family that raised N1.2m for a procedure quoted at N1.2m and is then billed N1.65m feels deceived, even when every extra item was clinically justified. That story will be told many times.",
              "Most hospitals quote loosely: a surgeon's fee here, a theatre fee there, with drugs, tests and extra nights 'as required'. The patient hears a total that does not exist. The basic fix is to quote everything that normally happens in a straightforward case, in writing, as a single figure, with a clear list of what it includes (the number of nights, tests, drugs, the surgeon and anaesthetist, one follow-up visit) and what it does not.",
              "Then decide what happens when the case is not straightforward. A sensible quote says which events would add cost, such as an extra night or a complication needing return to theatre, and roughly how much. The family can then decide, before admission, whether to proceed and how much to hold in reserve.",
              "Deposits protect the hospital from unpaid bills, but how they are handled shapes the patient's experience. Ask for the deposit at a set point before admission, explain what it covers, give a receipt, and give a running statement during a longer stay so the final bill is not a shock. At discharge, the bill should be ready when the patient is clinically ready to go.",
              "A quote is also a commitment. If the hospital regularly bills well above its quotes, the problem is in how it costs and quotes, and that is where it must be fixed."
            ),
          },
          {
            title: "Capacity and clinical fit",
            body: p(
              "An elective service needs reliable capacity and the right clinical team before it needs marketing. A hospital that advertises knee replacements and then cancels a third of its lists because theatre is taken by emergencies, the implant has not arrived or the visiting surgeon is abroad will lose patients faster than marketing can find them.",
              "Check the theatre first. How many sessions a week are free after emergencies and existing lists? Can elective sessions be protected, for example by reserving a theatre on set days? Elective patients who have taken leave from work, arranged family support and paid a deposit should not be cancelled on the morning of surgery except for clinical reasons.",
              "Check the people. Many elective services in Nigeria depend on a visiting consultant who operates on certain days. That can work well, but the hospital must know the consultant's availability months ahead, have the nursing and anaesthetic support in place, and have a plan for post-operative problems when the consultant is not on site. Every doctor operating must be properly registered with the MDCN and credentialed by the hospital for the procedure.",
              "Check the beds and supplies. A day-case service needs a recovery area and a discharge process that works by evening. Procedures using imported implants or devices need reliable supply and a plan for exchange-rate movements, or the cost per case can rise sharply between quote and surgery.",
              "Finally, fit with the rest of the hospital. A cosmetic service in a hospital known for emergency care may confuse both groups of patients. Some services are better run as a distinct unit with its own entrance, team and identity."
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster covers the basics: why elective and self-pay care behaves differently, how to work out what a case contributes and where a service breaks even, why the gap between quote and bill matters so much, and the capacity and clinical checks that come before marketing. With it you can test whether a proposed elective service makes sense and spot the most common ways such services lose money and patients.",
              "The paid track, Elective & Self-Pay Service Lines, goes into designing and running these services. It covers, among other things:",
              "- Pricing self-pay services properly: building packages, setting deposits, benchmarking against the market, and a discount policy that does not quietly destroy the margin.\n- Setting up an aesthetics service: the clinical lead, regulation, rooms, devices and consent.\n- Packaged procedures such as fertility, joint replacement and surgery packages, and exactly what goes into the price, including how to handle complications and implant cost changes.\n- Inbound medical tourism and diaspora patients, and the clinical risk, consent and complaints issues that are specific to elective and self-pay care.",
              "The paid modules assume you can already do the one-page contribution and break-even calculation in this taster, and will not repeat it. If you can work out how many extra cases a 10% discount requires to keep the same contribution, and explain why a written all-inclusive quote matters, you are ready for them.",
              "If your role is on the finance or operations side, this taster may be enough to support an elective service without running one."
            ),
          },
        ],
        exercises: [
          {
            title: "Break-even for a fertility consultation clinic",
            instruction:
              "A Lagos hospital plans a fertility assessment package at N280,000, covering a consultant review, hormone tests, a pelvic scan and semen analysis. Direct costs per package are: consultant fee N70,000, laboratory N65,000, scan N25,000, consumables N10,000. The clinic adds fixed costs of N2.4m a month (a nurse coordinator, a share of the scan room, marketing). Work out the contribution per package, the break-even volume, the monthly result at 12 and at 30 packages, and how many packages are needed to keep the same contribution if the price is discounted to N250,000. Then write three lines on what the hospital should check before launch.",
          },
        ],
      },
      resources: { tools: ["Spreadsheet", "Service line contribution template"] },
      questions: [
        mc(
          "A cataract surgery package is priced at N500,000. Costs that vary per case total N300,000. The service adds fixed costs of N4m a month. How many cases a month does it need to break even?",
          ["8", "13", "20", "40"],
          "c",
          "Contribution per case is N200,000, and N4m divided by N200,000 is 20 cases. Dividing fixed costs by the full price, giving 8, ignores the costs each case carries.",
        ),
        mc(
          "Using the same cataract package, the owner proposes a 10% discount to win more patients. By how much does each case's contribution fall?",
          ["By 25%, from N200,000 to N150,000", "By 10%, from N200,000 to N180,000", "By 5%, because the discount is shared with suppliers", "By 50%, from N200,000 to N100,000"],
          "a",
          "A 10% price discount is N50,000, all of which comes off the N200,000 contribution, a 25% fall. Assuming the contribution falls by the same 10% as the price is the usual mistake.",
        ),
        mc(
          "A family was quoted N1.2m for a myomectomy and billed N1.65m after an extra night and additional drugs. Each item was clinically justified. What is the root problem to fix?",
          [
            "The family's misunderstanding of medical costs",
            "The clinical team's decision to keep the patient an extra night and add drugs without first agreeing the cost with the family",
            "The pharmacy's drug prices",
            "How the hospital quotes: it did not give an inclusive figure or explain what could add cost",
          ],
          "d",
          "The extra items were justified, so the failure is a quote that left out normal costs and did not warn of likely additions. Blaming the family or the clinicians leaves the quoting practice unchanged.",
        ),
        mc(
          "Why do many Nigerian private hospitals find elective self-pay work financially attractive compared with HMO-paid care?",
          [
            "Elective patients never have complications",
            "Cash usually arrives at or before treatment, and the hospital sets the price",
            "Elective work needs no theatre time",
            "The NHIA and most HMOs reimburse planned procedures at a higher tariff than emergency care to reduce waiting lists",
          ],
          "b",
          "Self-pay cash arrives early and at the hospital's price, unlike claims that pay slowly at negotiated tariffs. Elective work still carries clinical risk and uses theatre time.",
        ),
        mc(
          "A hospital advertises knee replacements by a visiting surgeon. In three months, 5 of 14 booked cases were cancelled on the day because emergencies took the theatre. What should it do before spending more on marketing?",
          [
            "Protect elective theatre sessions on set days and confirm the surgeon's schedule months ahead",
            "Increase marketing so that the list is overbooked and cancelled patients are replaced by others waiting for a slot",
            "Offer cancelled patients a discount on rebooking",
            "Switch to a cheaper implant to reduce cost",
          ],
          "a",
          "Unreliable capacity loses patients faster than marketing can replace them, so protecting sessions comes first. A rebooking discount is a reasonable gesture, but it does not stop the next cancellation.",
        ),
        mc(
          "A hip replacement package uses an imported implant. The quote was given in February and surgery is in May. What risk most needs a plan?",
          [
            "The patient may change their mind",
            "The MDCN may change the surgeon's registration",
            "The naira cost of the implant may rise between quote and surgery",
            "The theatre lights may need replacing",
          ],
          "c",
          "Imported implants are priced in foreign currency, so exchange-rate movements can raise the cost per case after the price is fixed. A patient changing their mind is a booking risk, not a cost risk.",
        ),
        ms(
          "Which items should a clear written quote for a straightforward day-case procedure include? Select all that apply.",
          [
            "A single total figure",
            "A list of what is included, such as tests, drugs, fees and one follow-up",
            "The events that would add cost, with an approximate amount",
            "A line stating that all extras are 'as required' with no estimate",
            "The surgeon's personal phone number",
          ],
          ["a", "b", "c"],
          "An inclusive figure, a list of inclusions and a warning of what could add cost let the family plan. 'As required' with no estimate is the loose quoting that produces surprise bills.",
        ),
        mc(
          "A health check package contributes N40,000 per patient and adds fixed costs of N1.2m a month. The clinic currently sells 18 a month. What is its monthly result from the package?",
          ["A profit of N480,000", "A loss of N480,000", "A profit of N720,000", "A loss of N1.2m"],
          "b",
          "18 x N40,000 = N720,000 of contribution against N1.2m of fixed costs, a loss of N480,000; break-even is 30 a month. The N720,000 figure is contribution, not profit.",
        ),
        mc(
          "A hospital known mainly for its emergency and trauma service wants to add cosmetic surgery. Which concern is most specific to this choice?",
          [
            "Cosmetic surgery cannot be done in a hospital",
            "Cosmetic patients cannot pay in advance",
            "Cosmetic surgery is not a recognised specialty, so the surgeons do not need to be registered with the MDCN to operate",
            "The two patient groups may not sit well together, so a distinct unit and identity may work better",
          ],
          "d",
          "Elective cosmetic patients expect a different setting from a busy emergency hospital, so fit and identity matter. Cosmetic surgeons must be MDCN registered like any other doctor.",
        ),
        ms(
          "Before launching an elective service that relies on a visiting consultant, which checks should the hospital make? Select all that apply.",
          [
            "The consultant is registered with the MDCN and credentialed by the hospital for the procedure",
            "There is a plan for post-operative problems when the consultant is not on site",
            "The consultant's availability is known months ahead",
            "The consultant agrees to charge less than local surgeons",
          ],
          ["a", "b", "c"],
          "Registration, credentialing, cover for complications and a known schedule are basic conditions for a safe, reliable service. The consultant's fee is a commercial question, not a condition of safety.",
        ),
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    {
      slug: "strategy-intro",
      name: "Strategy for a Hospital: The Basics",
      description:
        "What a hospital strategy is and is not, how to build the fact base, how to generate and choose between real options, and how to make the choice stick.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Strategy is a set of choices",
            body: p(
              "A hospital strategy is a small number of choices about where it will compete, how it will win there, and what it will stop doing, backed by where the money and management time will go. Most documents called a strategy in Nigerian hospitals are something else: a vision statement, a budget, or a list of projects that each department wants.",
              "The test is whether the document rules anything out. 'To be the leading provider of quality healthcare in the South-West' rules nothing out and could be written by any hospital. 'We will become the first choice for maternity and paediatrics in Ibadan North and Akinyele, win the three largest HMO contracts in those areas, and stop investing in general surgery beyond emergencies' is a strategy. It tells the board what to fund, the medical director what to recruit for, and the marketing team what to talk about. It also tells the general surgeons something uncomfortable, which is a sign it is real.",
              "Strategy is not the same as planning. A plan sets out how to deliver something already decided. Strategy decides what is worth delivering. Hospitals often skip the decision and go straight to plans, which is why they end up with a new wing, a CT scanner and a dialysis unit, each sensible on its own and together far more than the cash flow can carry.",
              "A useful way to frame the work is to ask four questions. Where are we now, in facts? Where could we go, in two to four real options? Which option should we choose, and why? What will we do and measure in the next year to get there? The rest of this module follows that order."
            ),
          },
          {
            title: "Start from the facts",
            body: p(
              "A good strategy rests on a short fact base built before anyone holds a workshop. Without it, the discussion is driven by whoever speaks loudest or most senior, often the founder with a favourite project.",
              "The fact base for a hospital usually covers five things. Where money is made and lost, by service line, using contribution after direct costs rather than revenue alone; many hospitals discover that a busy department loses money and a quiet one carries the place. Who the patients are and where they come from, using registration data. How the hospital is paid: the mix of HMO, NHIA or state scheme, corporate retainers and self-pay, and how long each takes to pay. Who the competitors are, what they do well, and what they charge. And what capacity is actually used: bed occupancy, theatre utilisation, clinic sessions.",
              "Keep it to what changes decisions. Ten well-chosen charts are more useful than a hundred pages. Each chart should make one point that the leadership did not fully know or had not faced, such as 'self-pay maternity has fallen by a third in two years while HMO maternity has grown' or 'theatre runs at 40% utilisation, so we do not need a second theatre'.",
              "Be careful with SWOT lists. Strengths, weaknesses, opportunities and threats are a reasonable way to organise a conversation, but a SWOT built from opinions in a workshop is not evidence. Every item on it should be traceable to a fact. 'Strong brand' means nothing unless the hospital can show, for example, that new patients come from outside the immediate catchment or that patients pay more to be seen there."
            ),
          },
          {
            title: "Generate real options and choose",
            body: p(
              "A strategic choice is only meaningful if there were real alternatives. Present the board with two to four options that are each coherent and achievable, not one preferred plan and two straw men.",
              "For a 70-bed hospital with flat revenue, the options might be: deepen the existing position by filling the current beds with more maternity and paediatric work and better HMO contracts; add a focused elective service such as day surgery using spare theatre time; open a small satellite clinic in a growing area to feed the main hospital; or seek a partner or buyer for the business. Each has a different capital need, risk, and time to show results.",
              "Compare options on the same short list of criteria agreed in advance. Typical criteria are: financial return and how soon cash comes back, capital required and whether it can be funded, fit with the hospital's existing strengths and clinicians, risk and what could go wrong, and how hard it will be to carry out with the people the hospital has. Score them honestly and write down the reasoning.",
              "Watch for the founder's favourite. In owner-led hospitals, one option often arrives already decided: a new building, a particular piece of equipment, a specialty the founder trained in. The consultant's job is not to oppose it, but to put it on the same footing as the alternatives, with the same criteria and the same scrutiny. Sometimes it wins on the facts. When it does not, the fact base and the agreed criteria let the board reach a different decision without anyone losing face.",
              "The choice should end with a clear statement of what is in and what is out."
            ),
          },
          {
            title: "Make it stick",
            body: p(
              "A strategy that changes nothing in the budget, the recruitment plan or the meeting agenda is not being carried out. The real test of a strategy is whether money, people and management attention move towards the choices.",
              "Put the strategy on one page. It should state the few choices, three to five priorities for the next twelve to eighteen months, each with a named owner, and a small number of measures with targets. For example: 'Grow self-pay maternity deliveries from 40 to 65 a month; owner, head of obstetrics; measured monthly.' Department heads should be able to see how their own work connects to it.",
              "Then link it to money. The capital budget and the operating budget for the coming year should visibly favour the priorities. If the strategy says maternity and paediatrics but the largest capital item is a new orthopaedic theatre, staff will believe the budget, not the strategy.",
              "Review it at a set rhythm. A monthly management meeting that looks at the strategy measures, and a quarterly board review that asks whether the choices still hold, keep it alive. Strategies should change when the facts change, such as a competitor opening next door or a major HMO cutting tariffs, but not every time someone has a new idea.",
              "Expect resistance from the areas the strategy deprioritises. That is normal and does not mean the strategy is wrong. Explain the reasoning, show the facts, and where possible give those teams a clear role, such as keeping emergency general surgery safe and efficient while elective investment goes elsewhere."
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster gives you the basic shape of strategy work for a single hospital: strategy as choices that rule things out, a short fact base, a few real options compared on agreed criteria, and a one-page strategy linked to the budget and reviewed regularly. That is enough to recognise a weak strategy document and to support a strategy exercise as an analyst.",
              "The paid track, Strategic Advisory & Growth, is a master-level track for consultants who lead this work with boards and owners. It covers, among other things:",
              "- Translating strategy into a Balanced Scorecard and strategy map for a hospital, with KPIs that the hospital can actually collect.\n- Competitive strategy: Five Forces in Nigerian healthcare, the ERRC grid and service-line portfolio analysis.\n- Commercial performance and growth: referral concentration, revenue diversification and OKRs for a commercial team.\n- Expansion decisions, including new sites and build or buy, and group strategy across a portfolio of hospitals and businesses, including what a group centre is for and how capital is allocated.",
              "The paid modules assume you have done this taster. They will not explain what strategy is or how to frame options; they go straight to the harder questions of evidence, capital and governance that a board will test you on.",
              "If you are an analyst supporting strategy work, the most useful thing you can practise now is building a fact base. Take a hospital you know, and try to produce five charts that each make one point its leadership would find uncomfortable but true."
            ),
          },
        ],
        exercises: [
          {
            title: "Three options for a flat hospital",
            instruction:
              "A 70-bed hospital in Benin City has had revenue flat at about N85m a month for two years. Bed occupancy is 58%, theatre utilisation 45%. Revenue is 55% HMO, 10% NHIA and state scheme, 35% self-pay. Maternity and paediatrics contribute most of the margin; general medicine inpatient work loses money after direct costs. The founder wants to build a 30-bed extension at an estimated N1.1bn. Write three coherent options, including the founder's, and compare them on return, capital, fit, risk and ease of execution. State which you would recommend and what the hospital would stop doing.",
          },
        ],
      },
      questions: [
        mc(
          "Which of these statements is a strategy rather than a vision statement?",
          [
            "To be the leading provider of quality, affordable and patient-centred healthcare in the South-West, trusted by every family, employer and HMO in the region by 2030",
            "To deliver world-class care with compassion and integrity",
            "To become first choice for maternity and paediatrics in two named LGAs, win the three largest HMO contracts there, and stop investing in elective general surgery",
            "To grow revenue every year and keep patients happy",
          ],
          "c",
          "It names where to compete, how to win and what to stop, so it rules things out and guides spending. The others could be written by any hospital and decide nothing.",
        ),
        mc(
          "A hospital's 40-page 'strategy' lists 23 projects, one from each department, all to start this year. What is the main problem?",
          [
            "It is a list of plans with no choices, so it is unlikely to be funded or delivered",
            "It is too short to be a proper strategy",
            "It should have been written and owned by the board rather than by management, since strategy is a board responsibility",
            "It lacks a SWOT analysis",
          ],
          "a",
          "A strategy makes choices about what is worth doing; a list of every department's projects avoids choosing and usually exceeds the cash flow. Adding a SWOT would not fix the absence of choices.",
        ),
        mc(
          "A fact base shows that general medicine has the most admissions but loses money after direct costs, while maternity has fewer admissions but the highest contribution. Which measure revealed this?",
          [
            "Revenue by department",
            "Admissions by department",
            "Patient satisfaction by department",
            "Contribution by service line after direct costs",
          ],
          "d",
          "Contribution after direct costs shows which services make and lose money. Revenue and admissions show activity, which is how a busy loss-making department hides.",
        ),
        mc(
          "A workshop SWOT lists 'strong brand' as the hospital's top strength. What should the consultant do with it?",
          [
            "Accept it, since the senior staff in the workshop have worked at the hospital for years and know its reputation better than any outsider",
            "Test it against evidence, such as new patients from outside the catchment or patients paying a premium",
            "Remove it, because brand cannot be measured",
            "Move it to the opportunities column",
          ],
          "b",
          "A SWOT item from opinion needs a fact behind it before it shapes decisions. Brand can be evidenced indirectly, so removing it as unmeasurable goes too far.",
        ),
        mc(
          "The founder of a 70-bed hospital wants a N1.1bn extension. Occupancy is 58% and theatre utilisation is 45%. How should the consultant handle the proposal?",
          [
            "Oppose it openly in the first board meeting",
            "Support it and focus on delivery, as the founder carries the financial risk and knows the local market better than the consultant",
            "Put it alongside other real options and compare all on the same agreed criteria",
            "Recommend delaying any decision for two years",
          ],
          "c",
          "Putting the founder's option on the same footing lets the facts decide without anyone losing face; with 58% occupancy, filling existing beds is likely to compare well. Open opposition tends to entrench the favourite.",
        ),
        ms(
          "Which criteria are appropriate for comparing strategic options for a single hospital? Select all that apply.",
          [
            "Financial return and how soon cash comes back",
            "Capital required and whether it can be funded",
            "Which option the most senior consultant prefers",
            "Risk and what could go wrong",
            "Which option can be announced soonest to staff",
          ],
          ["a", "b", "d"],
          "Return, capital and risk let options be compared on evidence. A senior person's preference is an input to discuss, not a criterion, and how quickly an option can be announced says nothing about whether it is right.",
        ),
        mc(
          "A hospital's strategy prioritises maternity and paediatrics, but next year's largest capital item is a new orthopaedic theatre. What does this tell staff?",
          [
            "That the budget, not the strategy, shows the real priorities",
            "That orthopaedics supports maternity",
            "That the strategy is being carried out in phases",
            "That capital spending is separate from strategy",
          ],
          "a",
          "Staff judge priorities by where money goes, so a budget that contradicts the strategy undermines it. Calling it phasing only works if the plan says so and the money follows later.",
        ),
        mc(
          "Which item belongs on a one-page hospital strategy?",
          [
            "A full list of every department's KPIs, so that each head of department can see their own targets on the page",
            "The hospital's history since founding",
            "The detailed staff rota for the coming quarter",
            "'Grow self-pay deliveries from 40 to 65 a month; owner, head of obstetrics; reviewed monthly'",
          ],
          "d",
          "A priority with a measure, a target, an owner and a review rhythm is what a one-page strategy needs. A full KPI list belongs in management reporting, not the strategy page.",
        ),
        mc(
          "Six months into a strategy, a major HMO cuts maternity tariffs by 20%. What is the right response?",
          [
            "Ignore it until the annual strategy refresh",
            "Review whether the maternity choice still holds at the next quarterly board review, with updated numbers",
            "Abandon the strategy and start again",
            "Ask each department head to propose new projects that would replace the lost maternity revenue within the year",
          ],
          "b",
          "A material change in the facts is a reason to test the choices at the set review, not to wait a year or to discard everything. Strategy should change with the facts, but in a disciplined way.",
        ),
        mc(
          "After a strategy moves investment away from elective general surgery, the general surgeons object. What does this most likely mean?",
          [
            "The strategy is wrong and should be reversed",
            "The surgeons should be asked to leave",
            "The strategy is making a real choice; explain the facts and give the team a clear role, such as safe emergency surgery",
            "The strategy should be kept confidential from clinicians until it is fully implemented, to avoid this kind of disruption",
          ],
          "c",
          "Resistance from deprioritised areas is a sign that a strategy rules things out; explaining the facts and giving the team a role keeps them engaged. Reversing because of objection alone returns the hospital to no strategy.",
        ),
      ],
    },
  ],
};

export default expansion;
