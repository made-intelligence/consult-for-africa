import type { Question, TrackExpansion } from "./types";

type L = "a" | "b" | "c" | "d" | "e";
const IDS: L[] = ["a", "b", "c", "d", "e"];

const p = (...paras: string[]) => paras.join("\n\n");

function mc(question: string, correct: L, opts: string[], explanation: string): Question {
  return {
    type: "MULTIPLE_CHOICE",
    question,
    options: opts.map((text, i) => ({ id: IDS[i], text, isCorrect: IDS[i] === correct })),
    explanation,
  };
}

function ms(question: string, correct: L[], opts: string[], explanation: string): Question {
  return {
    type: "MULTI_SELECT",
    question,
    options: opts.map((text, i) => ({ id: IDS[i], text, isCorrect: correct.includes(IDS[i]) })),
    explanation,
  };
}

const expansion: TrackExpansion = {
  slug: "lean-quality-improvement",

  topUp: [
    {
      moduleSlug: "lean-healthcare",
      questions: [
        mc(
          `At a 200-bed hospital in Kano, an outpatient carries her own folder from records to the consulting room, then to the laboratory, back to the doctor and on to pharmacy, walking about 400 metres in all. Which waste does this chiefly show?`,
          "c",
          [`Inventory`, `Over-production`, `Transport`, `Extra-processing`],
          `The patient is the item flowing through the process, and moving her between distant points is transport waste. Extra-processing is tempting because the visit feels laborious, but it refers to doing more work on the patient than she needs, not to moving her.`,
        ),
        mc(
          `A medical ward keeps six weeks of dressings and cannulas on its shelves, the central store holds another eight weeks, and about 12% of stock expires each year. Which waste is this?`,
          "a",
          [`Inventory`, `Waiting`, `Non-utilised talent`, `Transport`],
          `Stock held beyond what the ward needs is inventory waste: it ties up cash, takes space and expires. Waiting is wrong because no patient or task is held up by the surplus; the problem is the stock itself.`,
        ),
        mc(
          `Nurses on a surgical ward write the same set of vital signs into a paper chart, a ward register and the HIS for every patient, four times a day. What is the most accurate Lean label for this?`,
          "d",
          [`Defects`, `Over-production`, `Motion`, `Extra-processing`],
          `Recording the same data three times is work the patient does not need and will not pay for, which is extra-processing. Over-production is the closest wrong answer, but it means producing more output than the next step needs, such as preparing drugs for patients who are not yet admitted.`,
        ),
        mc(
          `Which of these steps in an outpatient visit adds value from the patient's point of view?`,
          "b",
          [
            `Waiting for the folder to arrive from records`,
            `The doctor examining her and explaining the diagnosis`,
            `Repeating her name, address and HMO number at the cashier`,
            `Walking from the consulting room to the laboratory`,
          ],
          `A value-adding step changes the patient's condition or knowledge in a way she would willingly pay for, which the examination and explanation do. Re-entering details at the cashier feels necessary to staff, but it is rework caused by a process that did not capture the data once.`,
        ),
        mc(
          `A current-state map at a 60-bed clinic in Abeokuta shows a 3-hour lead time with 25 minutes of value-adding time. The owner concludes he has too many nurses and wants to cut two. What is the Lean response?`,
          "c",
          [
            `Cut both nurses, since the waste on the map shows the clinic has surplus staff`,
            `Cut one nurse as a compromise and review in three months`,
            `Keep headcount, remove the waits first and put freed time back into care`,
            `Hire another doctor, since the doctor is the visible bottleneck`,
          ],
          `Most of the lost time on the map is waiting caused by process design, not idle nurses, so cutting staff removes capacity without removing the cause. Treating waste as surplus headcount is the commonest misreading of a VSM and destroys staff willingness to take part in the next one.`,
        ),
      ],
    },
    {
      moduleSlug: "six-sigma-qi-tools",
      questions: [
        mc(
          `Which is the strongest Define statement for a laboratory turnaround project at a 150-bed hospital?`,
          "b",
          [
            `The laboratory is slow and the doctors are unhappy with it`,
            `Median inpatient lab turnaround is 6.5 hours against a 3-hour target, delaying about a quarter of discharges`,
            `Laboratory staff must work faster so that results reach the wards sooner`,
            `Buy a second chemistry analyser by June to remove the turnaround problem the ward doctors keep reporting to management`,
          ],
          `A Define statement states the measure, the baseline, the target and the impact without assuming the cause. The analyser option is tempting because it sounds concrete, but it jumps to a solution before Measure and Analyse have shown what drives the delay.`,
        ),
        mc(
          `At a hospital in Enugu, 18% of HMO claims are returned for errors. Two earlier fixes, a retraining session and a new checklist, did not hold, and nobody agrees why the errors happen. Which approach fits best?`,
          "d",
          [
            `A quick value stream map and one kaizen burst on the billing desk next week`,
            `A third round of retraining for the billing officers`,
            `Replacing the hospital information system`,
            `A DMAIC project starting with a precise Define and a measured baseline`,
          ],
          `Unclear root causes and failed earlier fixes are the signal that a full DMAIC cycle is worth its cost. A quick VSM suits single, visible causes such as a misplaced step, which is not what this problem looks like.`,
        ),
        mc(
          `A pharmacy records weekly dispensing errors for 12 weeks and introduces a second-person check in week 6. What does a run chart of these data let the team see?`,
          "a",
          [
            `Whether the error count shifted after week 6 compared with its earlier pattern`,
            `The root cause behind each dispensing error`,
            `Which pharmacist made the most errors`,
            `The statistical upper and lower control limits`,
          ],
          `A run chart plots the measure over time so the team can see whether the pattern changed after the intervention. Control limits belong to a control chart, which adds that statistical layer; a run chart does not calculate them.`,
        ),
        mc(
          `A team's fishbone diagram for HMO claim rejections lists 14 possible causes across the six categories. What should happen next in the Analyse phase?`,
          "c",
          [
            `Fix all 14 causes at once to save time`,
            `Pick the cause the billing manager is most sure of and fix that one first`,
            `Collect data to test which causes account for most rejections`,
            `Move straight to Control so the gains are protected`,
          ],
          `A fishbone lists candidate causes; Analyse tests them against data, often by tallying rejection reasons, so effort goes on the few causes that drive most of the problem. Trusting the manager's favourite cause is the usual shortcut, and it is how the two earlier fixes in most hospitals fail.`,
        ),
        mc(
          `An Improve phase cuts claim errors from 18% to 6% over eight weeks. What does the Control phase require?`,
          "b",
          [
            `Close the project and report the 6% result to the board as the new baseline`,
            `A control chart, a named owner and an agreed response to signals`,
            `Repeating the Measure phase once a year`,
            `Keeping the project team on the billing desk indefinitely`,
          ],
          `Control embeds the change in routine: someone owns the measure, watches it on a control chart and acts on signals. Closing and reporting is what most teams do, and it is why improvements drift back once attention moves elsewhere.`,
        ),
      ],
    },
  ],

  modules: [
    // ─────────────────────────────────────────────────────────────────────
    {
      slug: "value-stream-mapping-practice",
      name: "Value Stream Mapping in Practice",
      description:
        "Scope a value stream, collect timed data on the floor, read the current state with takt time and rolled accuracy, and turn a future-state map into a 90-day plan.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "Pick one value stream and fix its edges",
            body: p(
              `A useful map covers one family of patients or items, between an agreed first step and an agreed last step, and nothing else. Mapping "the hospital" produces a wall of sticky notes and no decision. A family is a group that passes through broadly the same steps: HMO outpatients at the general clinic, elective day-case surgery, inpatient laboratory samples, or the discharge of insured inpatients.`,
              `Self-pay walk-ins and HMO enrollees often need separate maps. The HMO patient has an eligibility check and an authorisation loop that the self-pay patient does not, and that loop is frequently where the longest wait sits. Mixing the two hides it inside an average.`,
              `Write the start and end triggers as events anyone can observe. For an outpatient map: "patient passes the security gate" to "patient leaves pharmacy with medicines or leaves the building". For discharge: "consultant records the discharge decision" to "bed is clean and ready for the next patient". Agreeing these on day one stops the argument in week two about whether the cashier queue counts.`,
              `Choose the stream by pain and by ownership. Look for the stream where complaints, lost revenue or waits are worst, and where the sponsor controls most of the steps. A stream that runs into an HMO's call centre is still worth mapping, but be clear that the hospital can only change its own side.`,
              `The team should be the people who do the work: a records officer, a triage nurse, a doctor, a cashier, an HMO desk officer, a pharmacist. Five to eight is enough. The sponsor needs the authority to change rosters, desk locations and booking rules. Senior managers who map from the boardroom draw the process as the policy describes it, which is rarely how it runs.`,
              `Set the target before any data is collected, written as a measure with a date. For example: cut median gate-to-exit time for HMO outpatients at Ridgeway Specialist Hospital, Ikeja, from 3 hours 40 minutes to under 2 hours within 90 days, with no extra headcount. The target tells the team which data matter and gives the sponsor a test for every proposal.`,
            ),
          },
          {
            title: "Collect the data where the work happens",
            body: p(
              `The current state is built from direct observation and timed samples, not from what staff remember. Memory shortens long waits and lengthens busy tasks. Walk the process in the order the patient experiences it, then walk it again from the exit backwards, which makes it easier to see what each step needs from the one before.`,
              `Follow real patients, with their consent, using a stopwatch or a simple time-stamp sheet. For each step, fill a data box:`,
              `- Process time: the hands-on time the step needs for one patient\n- Wait before the step: how long the patient sits between the previous step ending and this one starting\n- Percent complete and accurate (%C&A): the share of work arriving from this step that the next step can use without correcting, clarifying or chasing\n- Staff at the step and the hours they are actually present\n- Batch size: whether folders, samples or prescriptions move one at a time or in bundles, and how often\n- Availability: hours the step is open, and uptime of any equipment it depends on`,
              `Sample 20 to 30 patients spread across busy and quiet hours and at least two days. Monday morning and Thursday afternoon are different processes in most Nigerian outpatient departments. HIS time stamps help, but they record when someone clicked, not when the work happened. Check a few against your own observations before you trust them.`,
              `Measure %C&A by asking the step downstream, not the step itself. The HMO desk believes its work is complete; the cashier knows that three patients in ten arrive without an authorisation code and are sent back. That return loop is invisible on a simple flowchart and is often the largest single cause of delay.`,
              `Draw the information flow along the top of the map: how each step learns that a patient is ready. A folder carried by the patient, a name shouted down a corridor, a phone call to the laboratory, a WhatsApp message to the HMO. Many waits are information waits. The patient is ready, but nobody told the next step.`,
            ),
          },
          {
            title: "Read the current state: timeline, takt and the constraint",
            body: p(
              `The map's job is to show where time is lost and which step limits the whole flow. Three calculations do most of the work.`,
              `The timeline adds process times and waits. If 31 minutes of process time sit inside a 220-minute lead time, the activity ratio is 14%. This tells the team that waiting, not slow work, is the main loss, and that squeezing process time is rarely the first move.`,
              `Rolled %C&A multiplies the accuracy of each step. Three steps at 70%, 90% and 80% give a rolled figure of about 50%: half of all patients hit at least one correction somewhere. A single step at 70% looks tolerable on its own; multiplied through the stream it is not.`,
              `Takt time is the pace demand sets: available time divided by the number of patients. A clinic open from 8:00 to 16:00 has 480 minutes; with 120 HMO patients a day, takt is 4 minutes, so on average one patient must leave every 4 minutes. Compare each step's effective cycle time, which is process time divided by the number of staff working in parallel. A 15-minute consultation with three doctors gives 5 minutes per patient. That is slower than takt, so a queue will build in front of the doctors all day, whatever happens elsewhere.`,
              `Demand is rarely flat. If 70 of the 120 patients arrive before 10:00, takt in those two hours is under 2 minutes. Calculate takt for each hour band, and compare it with the staff actually present in that band, not the roster.`,
              `The step whose cycle time most exceeds takt is the constraint. Speeding up any other step does not raise throughput; it moves the queue to the constraint's door. Two things help at once: protect the constraint from work that others could do, such as doctors filling HMO forms, and make sure it never waits for a patient, a folder or a result.`,
            ),
          },
          {
            title: "Design a future state you can reach in 90 days",
            body: p(
              `The future-state map answers a fixed set of design questions and becomes a dated plan with owners. It is not a picture of a perfect hospital. Work through these questions with the team:`,
              `- What is takt in each hour band, and how will staffed capacity match it?\n- Where can patients flow one at a time with no queue, for example registration and vital signs at one station?\n- Where a queue cannot be avoided, how will it be controlled: a first-in-first-out lane with a cap, a called-number system, or the next step pulling patients when it is free?\n- What work moves off the constraint, such as obtaining HMO authorisation at the front desk before the consultation?\n- How will the schedule be levelled, for instance booked follow-ups spread across the day and a protected stream for walk-ins?\n- Which steps can be removed, combined or run in parallel, such as pharmacy starting to dispense from the e-prescription while the patient pays?`,
              `Each change appears on the map as a kaizen burst. Convert every burst into a line on the plan with an owner, a start date, the measure it should move and a review date. Four to six changes in 90 days is realistic for a hospital team that is also running the service. Test each change on one clinic day before rolling it out.`,
              `Expect the gain to come from waiting time. If the plan's savings depend mostly on staff working faster, the team has misread the timeline. Re-map at 90 days with fresh timed data, not with the dates on the plan. A plan where most bursts are finished but median lead time has not moved usually means the changes landed on steps that were not the constraint.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Read the Ridgeway current state",
            instruction: `Ridgeway Specialist Hospital, Ikeja, sees 110 HMO outpatients a day between 8:00 and 16:00. Your timed sample gives these data per step (process time per patient, staff, wait before the step, %C&A): registration 4 min, 1 clerk, 25 min, 85%; HMO verification 6 min, 1 officer, 40 min, 70%; vital signs 5 min, 2 nurses, 15 min, 95%; consultation 14 min, 3 doctors, 75 min, 80%; cashier 3 min, 1 cashier, 20 min, 90%; pharmacy 6 min, 2 pharmacists, 35 min, 92%. Calculate total lead time, the activity ratio, rolled %C&A, takt time and each step's effective cycle time. Name the constraint or constraints, then propose four kaizen bursts with an owner, a measure and a 90-day target for each. No extra headcount is available.`,
          },
          {
            title: "Scope a specimen value stream",
            instruction: `A 120-bed hospital in Benin City reports that inpatient blood results reach the wards a median of 7 hours after the request, and consultants say discharges slip to the next day. Write the scope for a value stream map: the family, the start and end triggers as observable events, the sponsor, a mapping team of six by role, the data you will collect at each step, and a target with a date.`,
          },
        ],
      },
      resources: { tools: ["Value Stream Mapping Canvas", "Process Time Observation Sheet", "Takt Time Calculator"] },
      questions: [
        mc(
          `A medical outpatient clinic in Surulere runs from 8:00 to 14:00 (360 minutes) and sees 90 patients a day. Each consultation takes 16 minutes and four doctors consult in parallel. What does this tell you?`,
          "c",
          [
            `Takt is 16 minutes, so the doctors set the pace and the clinic is balanced`,
            `Takt is 4 minutes and the doctors give 4 minutes per patient, so there is spare capacity`,
            `Takt and effective cycle time are both 4 minutes, so any variation will build a queue`,
            `Takt is 90 patients a day, so the clinic needs a fifth doctor`,
          ],
          `Takt is 360 divided by 90, which is 4 minutes, and 16 minutes across four doctors is also 4 minutes, so the doctors run at full capacity with no slack. Reading equal numbers as spare capacity is the common error: real arrivals and consultation lengths vary, and with no slack every delay accumulates.`,
        ),
        mc(
          `Three consecutive steps in an HMO outpatient stream have %C&A of 80%, 75% and 90%. Roughly what share of patients pass through all three without any correction?`,
          "a",
          [`About 54%`, `75%, the lowest step`, `About 82%, the average`, `90%, the final step`],
          `Rolled %C&A multiplies the steps: 0.8 by 0.75 by 0.9 is about 0.54. Taking the lowest or the average step understates the problem, because a patient can be caught by an error at any of the three.`,
        ),
        mc(
          `A current-state map shows 34 minutes of process time inside a 255-minute lead time. The longest waits sit before HMO verification and the cashier, and the doctors' effective cycle time is below takt. A manager proposes a scripted consultation to cut doctor time from 14 to 10 minutes. Why is this a weak first move?`,
          "d",
          [
            `Doctors will refuse scripts, so the change cannot be made`,
            `Consultations are never the constraint in an outpatient clinic, so changing them cannot shorten any visit`,
            `Process time cannot be measured precisely enough to show a change`,
            `Most of the lead time is waiting at other steps, so faster consultations barely move it`,
          ],
          `With doctors already faster than takt and the queues sitting at verification and the cashier, cutting consultation time leaves the patient's wait almost unchanged. The claim that consultations are never the constraint is wrong; they often are, which is why the map has to be read rather than assumed.`,
        ),
        mc(
          `To measure percent complete and accurate for the HMO verification desk, whom should the mapping team ask?`,
          "b",
          [
            `The verification officers themselves, who see every case and know their own error rate best`,
            `The cashier and doctors downstream, who receive the desk's output`,
            `The HMO's call centre, which issues the authorisation codes`,
            `The medical director, who receives the complaints`,
          ],
          `%C&A is judged by the customer of the step, because only the next step knows how often it has to correct or chase the work. The desk's own staff usually believe their output is complete, which is why asking them overstates accuracy.`,
        ),
        mc(
          `The HIS at a 90-bed hospital shows a median wait of 9 minutes between vital signs and consultation, yet patients complain of hour-long waits there. What should the mapping team do next?`,
          "a",
          [
            `Time a sample of patients directly across busy and quiet hours and compare`,
            `Trust the HIS figure, since system time stamps are more objective than patient complaints`,
            `Run a satisfaction survey to put a number on the complaint`,
            `Ask the nurses to estimate the typical wait on a normal day`,
          ],
          `System time stamps record when someone clicked, which may be when the patient was called rather than when vitals finished, so they need checking against observation. Trusting the HIS because it looks objective is the tempting error; a survey or staff estimate adds opinion, not timing.`,
        ),
        mc(
          `The CEO of a 180-bed hospital asks you to "map the whole hospital" in two weeks. What do you propose?`,
          "c",
          [
            `Map every department at a high level in the two weeks, so that no part of the hospital is missed`,
            `Start with the department whose head is most enthusiastic`,
            `Map one patient family with agreed triggers, chosen by pain and ownership`,
            `Draw the ideal future state first so staff can see the goal`,
          ],
          `A map earns a decision only when it covers one family with clear edges and a sponsor who can change it. A high-level map of everything feels thorough but is too coarse to show where any patient waits, and an enthusiastic head is a poor substitute for choosing by pain.`,
        ),
        mc(
          `In an outpatient stream with a takt of 4 minutes, effective cycle times are: registration 3 minutes, vital signs 2.5, consultation 5.5, pharmacy 3. The pharmacy manager asks for a third pharmacist to speed up dispensing. What happens to daily throughput?`,
          "b",
          [
            `It rises, because every faster step adds to throughput`,
            `Little or no change, because consultation at 5.5 minutes is the constraint`,
            `It rises by about a third, in line with the extra staff`,
            `It falls, because the pharmacists will now wait for patients`,
          ],
          `Throughput is set by the slowest step relative to demand, and consultation is the only step slower than takt. A third pharmacist speeds up a step that already keeps pace, so patients still leave at the doctors' rate.`,
        ),
        mc(
          `At a Lekki clinic open 8 hours a day, 70 of the 120 daily patients arrive between 8:00 and 10:00. Why does a whole-day takt of 4 minutes mislead the team?`,
          "d",
          [
            `Takt should be calculated per doctor, not for the clinic`,
            `Takt is a manufacturing idea that does not apply to clinics`,
            `Arrival patterns do not matter as long as all 120 patients are seen by closing time, which the daily takt confirms`,
            `Takt in the first two hours is under 2 minutes, so capacity must match the morning peak`,
          ],
          `Seventy patients in 120 minutes gives a takt of about 1.7 minutes in the peak, less than half the daily figure, so a clinic staffed to the daily takt will queue all morning. Assuming the daily total is what matters is the error that leaves doctors idle at 15:00 and patients waiting at 9:00.`,
        ),
        ms(
          `In an HMO outpatient stream, doctors are the constraint. Which changes belong on the 90-day future-state map? Select all that apply.`,
          ["a", "b", "e"],
          [
            `Move HMO authorisation to the front desk before the consultation`,
            `Spread booked follow-up slots across the day to level demand`,
            `Add a second registration clerk, since registration has a long queue`,
            `Have the doctor complete the HMO claim form after each visit`,
            `Have nurses complete the vitals and history template before the patient enters`,
          ],
          `Moving authorisation and history-taking off the doctors, and levelling arrivals, all protect or feed the constraint. A second registration clerk speeds a step that is not the constraint, and putting claim forms on doctors loads more work onto the slowest step.`,
        ),
        mc(
          `Three months after the future-state workshop, a team has finished 11 of its 14 kaizen bursts but median gate-to-exit time has not moved. What most likely went wrong?`,
          "a",
          [
            `The changes landed on steps that were not the constraint, so the queue moved`,
            `The team planned too few changes for a hospital of that size, so the total effect was too small`,
            `Each change was tested on one clinic day before being rolled out`,
            `The sponsor was a manager with authority over the rosters`,
          ],
          `Finishing bursts is activity; lead time only falls when the constraint and the waits around it change. Testing on one day and having a sponsor who controls rosters are good practice, and planning more changes would not help if they also miss the constraint.`,
        ),
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      slug: "theatre-outpatient-flow",
      name: "Theatre and Outpatient Flow",
      description:
        "Use queueing basics, clinic templates and honest theatre measures to cut waits, late starts, overruns and on-the-day cancellations.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Flow breaks at high utilisation and high variability",
            body: p(
              `Queues form when demand in a given hour exceeds the capacity present in that hour, and they grow sharply as a resource runs close to full. A clinic whose doctors are busy 95% of the time will have long and unpredictable waits even if the daily numbers balance. Queueing theory gives a reliable rule of thumb: waits rise slowly until a resource is about 80 to 85% utilised, then climb steeply.`,
              `Variability makes this worse. Uneven arrivals, consultations that range from 5 to 30 minutes, and a doctor who starts 40 minutes late all eat the slack. Two clinics with the same daily demand and staffing can have very different waits because one has predictable arrivals and the other tells everyone to come at 8:00.`,
              `Little's Law gives a quick estimate from a headcount: the number of patients in the system equals the rate they are seen multiplied by the time they spend there. If 60 patients are waiting at 10:00 and the clinic sees 20 an hour, the newest arrival can expect about three hours. You can test a manager's claim of a "one-hour wait" in a minute by counting chairs.`,
              `That leaves two levers. Reduce variability, through appointments, on-time starts and standard visit types. Match capacity to demand hour by hour, because adding a doctor at 14:00 does nothing for the 9:00 peak.`,
              `Measure both for two weeks before changing anything. Count arrivals per hour from the gate or registration log. Record the doctor-hours actually present per hour, not the roster: a consultant rostered for 8:00 who arrives at 10:30 after ward rounds gives the clinic no capacity until 10:30. Plot the two lines on one chart. The gap between them is where the queue comes from, and usually where the complaints come from too.`,
            ),
          },
          {
            title: "Outpatient clinics: templates, arrivals and readiness",
            body: p(
              `Most outpatient waits are designed in by the booking rules and the start time. The commonest design in Nigerian private and public clinics is "first come, first served from 8:00", with the consultant arriving after ward rounds. Patients learn to come at 6:30 to get an early number, the hall fills, and the wait for the last patient is set before the doctor walks in.`,
              `A clinic template fixes this. Give each patient a slot time, in single slots or small blocks such as two patients every 20 minutes. A widely used pattern books two patients at the very start and then one per slot, so a late first patient does not leave the doctor idle. Build the template from the doctor's actual start time and the measured median consultation length for each visit type.`,
              `Separate the streams. New patients, follow-ups and walk-ins behave differently. Use last quarter's data to estimate walk-ins by day of the week and protect that many slots, released if unused by mid-morning. Book follow-ups into the quieter hours to level the load.`,
              `Make the patient ready before the doctor sees them. Check HMO eligibility and obtain any authorisation code the day before, by phone or WhatsApp. Make sure previous results are in the record and the folder or electronic chart is open. A visit that ends with "come back when the result is ready" uses a second slot and a second trip for one piece of care.`,
              `Measure the clinic weekly:\n- Wait from arrival to consultation, median and 90th percentile\n- Doctor start time against the template\n- Did-not-attend rate\n- Share of visits needing a return for a missing result, folder or code\n- Time from end of consultation to leaving the building`,
              `Report the 90th percentile alongside the median. A median of 50 minutes can hide a tail of patients who wait four hours, and those patients write the reviews.`,
            ),
          },
          {
            title: "Theatre: measure the session honestly",
            body: p(
              `Theatre time is the most expensive time in a private hospital, and most of the loss sits in late starts, long gaps between cases and cancellations, not in slow surgery. Measuring it needs precise definitions, because each measure can be flattered by redefining the event.`,
              `- First-case on-time start: the first patient enters theatre within an agreed window of the session start, often 10 to 15 minutes. Define the event and the window in writing.\n- Turnover time: from one patient leaving theatre to the next patient entering.\n- Session utilisation: minutes patients spend in theatre during the allocated session, divided by the session minutes. A 300-minute session with 190 minutes of patient time is 63% utilised.\n- Overrun: minutes past the session end, which cost overtime and push late cases off the list.\n- On-the-day cancellations, split by reason: hospital reasons (no bed, kit not sterile, surgeon unavailable, list overbooked) and patient reasons (not fasted, did not attend, unfit, deposit or authorisation not cleared).`,
              `Read the measures together. A list running at 95% utilisation with a 45-minute overrun every day is overbooked. A list at 60% with a fifth of cases cancelled on the day has a planning problem, not a capacity problem. A surgeon who says "we need another theatre" may be describing either.`,
              `Take times from the theatre register kept by the circulating nurse or from the HIS, and check a sample by direct observation in the first week. Surgeons' booked times are estimates, not data.`,
              `This module treats the theatre as a flow problem. The surgical safety checklist, counts and their audit belong to clinical governance, and a flow project must not shorten them to save minutes.`,
            ),
          },
          {
            title: "Theatre: fixing the list",
            body: p(
              `Most of the gain comes from work done before the day of surgery. A pre-operative assessment clinic one to two weeks ahead checks fitness, completes investigations, gives fasting instructions and confirms the money: the deposit for self-pay patients, the authorisation code for HMO patients. Cancellations for "unfit", "not fasted" and "deposit not paid" fall sharply once this exists, because the problems surface while there is still time to fill the slot.`,
              `Book lists from data. Take the median duration of each procedure for each surgeon from the last six months of the register, and book to about 85% of session time. The spare 15% absorbs normal variation without overrunning. Surgeons who book from memory tend to underestimate long cases and overbook.`,
              `Plan the first case the evening before: confirmed, consented, kit checked and the patient on the ward early enough to be in the holding bay before the session starts. Avoid placing a case first if its special kit or implants are uncertain.`,
              `Run turnover in parallel. Clean and set up while the anaesthetist reviews the next patient in the holding bay. Send for the next patient when the current case starts closing, not when it leaves. Pick kits for the whole list the evening before. Check sterile services cycle times against the list: if the hospital owns one set of a tray, two of those cases back to back will wait for a sterilisation cycle.`,
              `Protect elective lists from emergencies by giving emergencies their own session or ring-fenced time where volume justifies it. An unplanned caesarean dropped into an orthopaedic list cancels the last two cases and teaches surgeons to overbook.`,
              `Look downstream. If there is no recovery space or ward bed, the theatre stops. On many surgical wards most discharges happen after 15:00, so the beds the morning admissions need are still occupied. Earlier discharge decisions on the ward often do more for theatre starts than anything inside the theatre.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Four weeks of theatre data at Crestline Hospital",
            instruction: `Crestline Hospital, Port Harcourt, runs two theatres, each with one elective session of 8:00 to 13:00 on weekdays: 40 sessions in four weeks, 12,000 allocated minutes. Patients were in theatre for 7,200 minutes. The first case started within 15 minutes of 8:00 in 9 of 40 sessions; late starts averaged 42 minutes. There were 96 turnovers averaging 38 minutes. Fourteen sessions overran. Of 31 on-the-day cancellations, 12 were deposit or authorisation not cleared, 8 no bed, 6 not fasted and 5 surgeon unavailable. Calculate utilisation, estimate the minutes lost to late starts and to turnover above a 20-minute target, rank the losses, and propose four changes with an owner, a measure and an expected effect for each.`,
          },
          {
            title: "Redesign a first-come clinic",
            instruction: `A gynaecology clinic at a 100-bed hospital in Abuja tells all 60 patients to arrive at 8:00. The consultant arrives at 9:45 after ward rounds and consults until 14:30, a median of 12 minutes per patient for follow-ups and 20 for new patients. About a third are new and eight walk in on an average day. Design a slot template for the session, state the start time, the slot pattern, the walk-in rule and the pre-visit checks, and list the five measures you will report weekly.`,
          },
        ],
      },
      resources: { tools: ["Hourly Demand and Capacity Chart", "Theatre Session Log", "Clinic Template Builder"] },
      questions: [
        mc(
          `At 10:00, 72 patients are waiting at a medical outpatient clinic that sees 24 patients an hour. Roughly how long should a patient arriving at 10:00 expect to wait?`,
          "b",
          [`About 24 minutes`, `About 3 hours`, `About 72 minutes`, `It cannot be estimated without appointment data`],
          `Little's Law gives time in the system as the number waiting divided by the rate served: 72 divided by 24 is about three hours. Reading 72 patients as 72 minutes ignores the rate at which the clinic clears them.`,
        ),
        mc(
          `A Thursday orthopaedic session runs from 8:00 to 13:00. Patients were in theatre for 210 minutes and the list finished at 13:40. What is the best reading?`,
          "d",
          [
            `At 70% utilisation there is room to add another case to next Thursday's list`,
            `The list is overbooked and should lose two cases`,
            `Overruns do not matter while utilisation stays under 85%`,
            `Time is being lost before and between cases, not in having too few cases`,
          ],
          `Only 210 of 300 minutes had a patient in theatre, yet the session overran by 40 minutes, so roughly two hours went in late starts and gaps. Adding a case would deepen the overrun, and cutting cases treats the symptom without recovering the lost time.`,
        ),
        mc(
          `A 120-bed hospital had 30 on-the-day theatre cancellations last month: 11 deposit or authorisation not cleared, 7 no ward bed, 6 not fasted and 6 did not attend. Which single change would remove the most?`,
          "a",
          [
            `A pre-op clinic that clears payment, fitness and fasting days ahead`,
            `A fourth scrub nurse on each elective list`,
            `Starting every elective list at 7:30 instead of 8:00`,
            `A cancellation fee charged to every patient who does not attend on the day of surgery`,
          ],
          `Payment, fasting and many non-attendances are caught by contact and checks before the day, which covers more than half the cancellations. A cancellation fee targets only the six non-attenders and does nothing for the 11 payment cases, the largest group.`,
        ),
        mc(
          `A surgeon books his own Thursday list from his estimates of case length, and the list overruns by a median of 50 minutes. What is the best fix?`,
          "c",
          [
            `Ask him to operate faster on Thursdays`,
            `Extend the Thursday session by an hour permanently`,
            `Book from his median case times over six months, to about 85% of the session`,
            `Move his list to the emergency theatre`,
          ],
          `Booking from measured durations with a margin for variation removes the systematic underestimate behind the overrun. Extending the session rewards the overbooking and adds staff cost without fixing how the list is built.`,
        ),
        mc(
          `All 70 patients at a medical clinic are told to arrive at 8:00. The consultant starts at 9:45 after ward rounds. What is the best first change?`,
          "b",
          [
            `Ask patients to arrive at 7:00 so the queue clears earlier`,
            `Start the template at the consultant's real start time and give staggered slot times`,
            `Add a second consultant to cover the 8:00 start`,
            `Hand out numbered tickets at the gate so patients are seen strictly in order of arrival from 8:00`,
          ],
          `The wait is built in by telling everyone to arrive nearly two hours before capacity exists, so slot times from the real start remove it at no cost. Numbered tickets make the queue orderly but leave every patient waiting just as long.`,
        ),
        mc(
          `After a clinic redesign, median wait fell from 95 to 60 minutes, but complaints about waiting have not fallen. What should the team check first?`,
          "d",
          [
            `Whether the complaints survey is a valid instrument`,
            `Whether doctors are satisfied with the new template`,
            `Whether the mean wait has fallen by as much as the median has`,
            `The 90th percentile wait, which may still be several hours`,
          ],
          `Complaints come from the patients in the tail, and a median can fall while the slowest tenth still waits as long as before. The mean is tempting, but it blends the tail into one figure instead of showing how long the worst-served patients wait.`,
        ),
        mc(
          `Elective lists at a 110-bed hospital start late because patients wait on the ward for a bed, and most surgical ward discharges happen after 15:00. Where should the team focus?`,
          "a",
          [
            `Earlier discharge decisions and discharges on the surgical wards`,
            `Faster cleaning and set-up between cases inside the theatre suite itself`,
            `Building a third theatre`,
            `Hiring two more porters for the theatre suite`,
          ],
          `The constraint is downstream: the theatre waits for beds that are still occupied by patients ready to leave. Faster cleaning improves turnover but cannot start a list whose first patient has nowhere to come from.`,
        ),
        mc(
          `Two hospitals in the same group report first-case on-time rates of 80% and 35% for similar lists. What should you check first?`,
          "c",
          [
            `Which theatre manager has more years of experience`,
            `Whether the surgeons at the two sites are from different specialties`,
            `Whether both use the same start event and grace window`,
            `Whether one hospital has newer theatre equipment`,
          ],
          `On-time start is easy to flatter by counting from anaesthesia room entry or allowing a 30-minute window, so definitions must match before results are compared. Specialty and equipment can matter, but a gap this large most often comes from measuring different things.`,
        ),
        ms(
          `Which changes shorten theatre turnover without adding staff? Select all that apply.`,
          ["a", "b", "e"],
          [
            `Clean and set up while the anaesthetist reviews the next patient in the holding bay`,
            `Pick and check kits for the whole list the evening before`,
            `Schedule two cases that need the hospital's only tray of a type back to back`,
            `Send for the next patient only after the previous one leaves theatre`,
            `Send for the next patient when the current case starts closing`,
          ],
          `Parallel work, early kit checks and calling the next patient during closure all remove waiting from the gap. Back-to-back cases on a single tray force a wait for sterilisation, and calling the patient only after the previous one leaves adds the whole transfer time to every turnover.`,
        ),
        mc(
          `A clinic manager wants doctors booked to 100% of their session time so that no doctor time is wasted. What is the likely effect on patient waits?`,
          "b",
          [
            `Waits fall, because every doctor minute is used`,
            `Waits rise steeply and become unpredictable, as nothing absorbs variation`,
            `No change, because utilisation does not affect waiting`,
            `Waits fall, though doctor overtime rises a little at the end of each session`,
          ],
          `Close to full utilisation, every late patient or long consultation pushes all later patients back, so waits climb sharply. Treating idle minutes as waste is the intuitive mistake; a margin of roughly 15% is what keeps the clinic on time.`,
        ),
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      slug: "sustaining-improvement",
      name: "Sustaining Improvement",
      description:
        "Hold the gains after the project ends: control plans, standard work, visual management, tiered daily huddles and leader routines.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "Why gains fade, and what holds them",
            body: p(
              `Improvements fade when the new method lives in the project team's heads instead of in the unit's daily management. The pattern is familiar: an outpatient wait is halved during a project, the consultants leave, the champion is moved to another unit, and six months later the wait is back near where it started. Nobody decided to go back. The old way simply returned because nothing kept the new one in place.`,
              `The usual causes are a missing written standard, no named owner, no visible measure, no routine in which a slipping measure gets noticed, and new staff trained by colleagues in the old habits. Each one is easy to fix; together they need designing before the project closes, not after it.`,
              `Four parts work together. Standard work fixes the method. Visual management makes performance against target visible every day. Daily huddles turn what the board shows into action and escalation. Leader routines make managers check all three. Hospitals that run these well describe them as their daily management system rather than as quality tools.`,
              `Hand the process over formally with a control plan, a one-page document the process owner signs:`,
              `- The process and its named owner\n- Each measure, its target, how it is collected and how often\n- The current standard work documents and their version dates\n- The trigger level for each measure and who acts, within what time, when it is breached\n- The date of the first review with the sponsor`,
              `The handover meeting should include the owner's manager, so the measure appears in the owner's own performance review. A process owner who is not asked about the measure by their manager stops looking at it within a quarter.`,
            ),
          },
          {
            title: "Standard work: the current best way, written by those who do it",
            body: p(
              `Standard work records the best known way to do a task today, in the order and timing that delivers the result, so it can be taught, checked and improved. It is not a policy manual. A policy says what must happen and who is responsible; standard work says how, in what sequence and in how long.`,
              `A good standard fits on one page, often with photographs:\n- The steps in order\n- Key points: the details that make or break speed, accuracy or the patient's experience\n- The reason for each key point, so staff can apply it to unusual cases\n- The expected time per step\n- What to do when something is missing or a system is down`,
              `For front-desk HMO verification, a key point might be "confirm the enrollee's plan covers specialist consultation before booking", with the reason "uncovered visits become self-pay disputes at the cashier". The fallback might be "if the HMO portal is down, call the HMO desk line and record the reference".`,
              `Write the standard with the people who do the task. Draft it from what the best performers actually do, test it for a week, then fix it. A standard drafted in an office and circulated by memo is usually ignored within weeks, because it misses the details the work depends on.`,
              `Train against it in the workplace. Show the task while explaining the key points, have the trainee do it while explaining them back, then observe them on real work over the following days. This takes longer than a classroom session and sticks far better.`,
              `Let it change. Anyone can propose a better method; the owner tests it and issues a new version with a date. A standard that has not changed in two years is usually one that nobody reads. Managers have standard work too: the unit head who checks the board, attends the huddle and observes two tasks against the standard each day is following leader standard work.`,
            ),
          },
          {
            title: "Visual management: see the gap in thirty seconds",
            body: p(
              `A visual board shows anyone walking past whether the unit is on target today, and what is being done about the gap. If a visitor cannot tell within thirty seconds, the board is decoration.`,
              `Keep it small. Three to five measures tied to the improvement, each showing target against actual, updated by the team at a fixed time, usually by hand. Colour each red or green against target. Add an issues list with an owner and a due date for each item, and a space for staff improvement ideas. A pharmacy might track median wait, prescriptions waiting at 10:00 and items out of stock. A theatre suite might track first-case on-time start, cancellations and overruns.`,
              `Hand updating matters. When staff write the number themselves, they see it; when IT prints a monthly pack, nobody does. The commonest failure is a board with 18 measures printed from the HIS once a month and pinned in a corridor. It looks impressive and changes nothing.`,
              `Visual controls also work at the point of work, without a board. Kanban cards on consumable bins trigger reorders when a bin empties. Floor markings show where the queue forms and its maximum length. Coloured folder sleeves flag HMO patients still awaiting authorisation before they reach the cashier. A bed status board shows which beds are empty, awaiting cleaning or due for discharge.`,
              `Keep patient identities off anything in a public area. A corridor board showing names, diagnoses and HMO details breaches the hospital's duty of confidentiality and its obligations under the NDPA. Use bed numbers or status codes where visitors can see, and keep identifiable detail at the nurses' station or in the HIS.`,
              `A measure is visual only if a gap prompts someone to act. Test each board by asking a team member what the red item means and who is dealing with it.`,
            ),
          },
          {
            title: "Daily huddles and escalation",
            body: p(
              `Tiered huddles turn the board into action and move problems up the hospital within hours, instead of at next month's management meeting.`,
              `- Tier 1: the unit team at the start of the shift, standing at the board, 10 minutes. Yesterday's performance, today's risks (short staff, missing kit, a heavy list) and anything that needs help from outside the unit.\n- Tier 2: unit heads with the department or nursing manager, for example at 9:00 for 15 minutes. Escalated items and problems that cross units.\n- Tier 3: the executive team, such as the medical director, director of nursing, operations and finance, for example at 9:30. Items that need money, a policy decision or another department.`,
              `In a smaller private hospital the owner-doctor may be tier 3 alone. That works, as long as the slot is fixed and items reach it the same morning.`,
              `Some rules keep huddles alive. Same time, same place, every day, starting on time even if the leader is absent. Every item gets an owner and a date. Closed items are reported back to the team that raised them, so staff see that raising a problem gets it fixed. Track three measures of the huddle itself: the share of days held, issues raised per week and the share closed within seven days.`,
              `Huddles fail in predictable ways. They become a lecture from the manager. They discuss only bad news. Nothing is escalated, or escalated items vanish. When issues raised fall sharply while few are closed, staff have usually concluded that raising them is pointless, not that the problems have gone.`,
              `Review the trend monthly, not daily. A single bad day calls for a note at the huddle, not a retraining programme. Plot each measure on a run or control chart and act on signals, such as a point outside the limits or a sustained shift, rather than on every movement.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Design the sustain system for a pharmacy",
            instruction: `A project at a 150-bed hospital in Ibadan cut median outpatient pharmacy wait from 52 to 18 minutes by dispensing from the e-prescription while patients pay. The consultants leave in three weeks and the project champion moves to the new wing. Write the control plan, a one-page standard work for dispensing from the e-prescription with at least three key points and their reasons, the design of a board with no more than four measures, and the huddle tiers with times and attendees.`,
          },
          {
            title: "Diagnose a fading huddle",
            instruction: `A theatre team's tier 1 huddle has run for eight weeks. It raised 64 issues, of which 22 are closed. Issues raised fell from 12 a week in the first fortnight to 3 a week now, and the huddle was held on 31 of 40 working days. The theatre manager says the problems are being solved. Write a short note to the director of nursing stating what the data most likely show, three changes to the huddle and the measures you will watch for the next eight weeks.`,
          },
        ],
      },
      resources: { tools: ["Control Plan Template", "Standard Work Sheet", "Huddle Board Layout"] },
      questions: [
        mc(
          `A project cut outpatient waits at a 160-bed hospital from 140 to 70 minutes. Six months after the consultants left, waits are back at 130 minutes. What is the most likely cause?`,
          "d",
          [
            `The baseline data collected during the project was wrong`,
            `Staff lost interest once the consultants were no longer on site each day`,
            `The target was too ambitious for a hospital of that size`,
            `No owner, standard or daily routine kept the new method in place`,
          ],
          `Gains decay when nothing in daily management holds the new method once the project team leaves. Blaming staff interest misses the point: interest fades in every hospital, which is why the sustain system has to be built before handover.`,
        ),
        mc(
          `Which content most belongs in standard work for the front-desk HMO verification task?`,
          "a",
          [
            `Steps in order, key points and reasons, time per step, a portal-down fallback`,
            `The HMO contract terms and tariff schedule for each plan`,
            `The organisational chart of the front office team`,
            `The hospital's customer service charter and values`,
          ],
          `Standard work describes how to do the task, in sequence and time, with the details that make it succeed. Contract terms are reference material the officer may need, but they do not tell anyone how to perform the verification.`,
        ),
        mc(
          `The quality manager writes a new discharge standard in her office and circulates it by memo. Two months later, ward nurses are not following it. What is the better approach?`,
          "c",
          [
            `Discipline the nurses who do not follow the standard`,
            `Expand the standard so it covers every possible case`,
            `Write and test it with the nurses who do discharges, then train on the ward`,
            `Reissue it as a memo signed by the medical director, with a deadline for compliance`,
          ],
          `A standard drafted with the people who do the work captures the details that make it workable, and training in the workplace makes it stick. Reissuing it with more authority treats a design problem as a compliance problem.`,
        ),
        mc(
          `A ward board shows 18 KPIs, printed monthly from the HIS by the IT unit. What would you change first?`,
          "b",
          [
            `Have IT print the same 18 measures weekly instead of monthly, so the data is fresher`,
            `Cut to 3 to 5 measures the team updates daily against target, with an issues list`,
            `Move it to the management corridor where directors will see it`,
            `Add a trend chart under each of the 18 measures`,
          ],
          `A board drives action when the team owns a few measures, sees them daily and records what is being done about gaps. Printing more often keeps the same problem: too many numbers that nobody on the ward wrote or acts on.`,
        ),
        mc(
          `Over eight weeks a theatre team's tier 1 huddle raised 64 issues and closed 22. Issues raised fell from 12 a week to 3. What most likely explains the fall?`,
          "d",
          [
            `Most of the theatre's problems have now been solved, so there is less left to raise`,
            `The huddle is too short for staff to raise issues`,
            `Staff are too busy at the start of the shift`,
            `Issues are not being closed and reported back, so raising them feels pointless`,
          ],
          `With two-thirds of issues still open, the fall in new issues signals lost confidence, not fewer problems. Assuming problems are solved is the manager's natural reading, but the closure rate contradicts it.`,
        ),
        mc(
          `At the 7:45 tier 1 huddle, a theatre nurse reports that the only large orthopaedic set failed its sterilisation check, and the first case at 8:30 needs it. What should happen?`,
          "a",
          [
            `Escalate to tier 2 now, with a named owner to resolve it before the case`,
            `Record it for discussion at the monthly quality meeting`,
            `Leave the surgeon to decide what to do on arrival`,
            `Add it to the board's issues list with an owner and a due date for next week`,
          ],
          `The point of tiered huddles is to move problems that a unit cannot solve to someone who can, within the hour. Logging it with a later due date is correct for a slow-burning issue but wrong for one that will cancel a case in 45 minutes.`,
        ),
        mc(
          `A pharmacy's median wait target is 20 minutes. On Tuesday it was 31 minutes; the control chart's upper limit is 34. The pharmacy head wants to retrain all staff. What do you advise?`,
          "c",
          [
            `Retrain all pharmacy staff this week, because the 20-minute target was missed`,
            `Raise the target to 31 minutes to make it realistic`,
            `Treat it as normal variation, note causes at the huddle, act on a signal`,
            `Remove Tuesday from the data as an outlier`,
          ],
          `A point inside the control limits is consistent with normal variation, so a system-wide response is not justified by one day. Missing the target feels like a reason to act, but reacting to every movement wastes effort and teaches staff that the chart is a stick.`,
        ),
        mc(
          `A bed board in a ward corridor lists each patient's full name, diagnosis and HMO. What is the best change?`,
          "b",
          [
            `Remove the board so no patient data is displayed`,
            `Show bed numbers and status codes, keeping identities off public view`,
            `Add a notice beside the board asking visitors and other patients not to read it`,
            `Laminate it so the information cannot be altered`,
          ],
          `The board's flow value comes from bed status, which does not need identities, while names and diagnoses in a public corridor breach confidentiality and the hospital's NDPA duties. Removing the board solves the privacy problem by losing the visual control.`,
        ),
        ms(
          `Which items belong in the control plan handed to the process owner at project close? Select all that apply.`,
          ["a", "b", "d"],
          [
            `Each measure, its target and how often it is collected`,
            `The trigger level and who acts, within what time, when it is breached`,
            `The names of the consultants who worked on the project`,
            `The current standard work documents and their version dates`,
            `The project's original budget and fee`,
          ],
          `The control plan holds what the owner needs to keep the process on target: measures, triggers and responses, and the current standards. Project history such as team names or budget is useful in a close-out report but does nothing to sustain the process.`,
        ),
        mc(
          `The COO of a 200-bed hospital wants to sustain gains across six units but has 30 minutes a day for it. What is the best use of that time?`,
          "a",
          [
            `A fixed route to two units' boards each day, asking about the gap and open issues`,
            `Reviewing a monthly KPI pack for all six units in her office`,
            `Attending each unit's tier 1 huddle in turn and running the huddle herself each day`,
            `Sending unit heads a WhatsApp reminder about targets each morning`,
          ],
          `A short, fixed walk to the boards is leader standard work: it shows that the measures matter and surfaces problems while they are fresh. Running the huddles herself is tempting but takes ownership away from the unit heads who must sustain them.`,
        ),
      ],
    },
  ],
};

export default expansion;
