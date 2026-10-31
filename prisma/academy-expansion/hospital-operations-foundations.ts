import type { TrackExpansion, Question, Option } from "./types";

const p = (...paras: string[]) => paras.join("\n\n");
const IDS = ["a", "b", "c", "d", "e"] as const;
const opts = (texts: string[], correct: number[]): Option[] =>
  texts.map((text, i) => ({ id: IDS[i], text, isCorrect: correct.includes(i) }));
const mc = (question: string, texts: string[], correct: number, explanation: string): Question => ({
  type: "MULTIPLE_CHOICE",
  question,
  options: opts(texts, [correct]),
  explanation,
});
const ms = (question: string, texts: string[], correct: number[], explanation: string): Question => ({
  type: "MULTI_SELECT",
  question,
  options: opts(texts, correct),
  explanation,
});
const A = 0, B = 1, C = 2, D = 3, E = 4;

const expansion: TrackExpansion = {
  slug: "hospital-operations-foundations",
  track: {
    name: "Hospital Operations Foundations",
    description:
      "How to measure and run a hospital day to day. Patient flow and capacity, pharmacy and procurement, power and equipment, with a first look at fixing a process, hospital systems and data, and spotting a hospital in trouble. Free, and the starting point for the Lean, Digital Health and Turnaround tracks.",
    level: "FOUNDATION",
    category: "operations",
    iconName: "activity",
    colorHex: "#2A6F97",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "FREE",
  },
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "patient-flow-capacity-basics",
      name: "Patient Flow and Capacity",
      description:
        "Calculate occupancy, length of stay, waiting times and theatre use correctly from the hospital's own registers, and see where capacity is really lost.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Count the right things from the registers",
            body: p(
              "Most wrong statements about a hospital's capacity come from the wrong denominator, not from bad arithmetic. Before you calculate anything, agree how many beds the hospital can actually use. Licensed beds are what the regulator approved. Physical beds are what is in the building. Staffed beds are the ones with nurses rostered against them this month. Occupancy should be measured against staffed, open beds, and you should say which figure you used.",
              "The raw material is the midnight census: the number of inpatients in each ward at midnight, recorded every night in the ward register or the hospital system. Add up the nightly counts for the month and you have occupied bed-days. Then:",
              "- Occupancy = occupied bed-days / (staffed beds x days in the period)\n- Average length of stay (ALOS) = occupied bed-days / discharges, where discharges include deaths and transfers out\n- Bed turnover = discharges / staffed beds",
              "Take a 60-bed hospital in Ibadan with all 60 beds staffed. In a 30-day month the nightly census adds up to 1,404 bed-days and there are 270 discharges. Occupancy is 1,404 / 1,800, or 78%. ALOS is 1,404 / 270, or 5.2 days. Each bed turned over 4.5 times. If someone had used the 80 licensed beds as the denominator, occupancy would have read 58.5% and the management team would have concluded, wrongly, that the hospital had room to spare.",
              "Watch for three other traps. Day cases who arrive and leave on the same day do not appear in a midnight census, so a busy day-surgery unit can look empty; report day cases as a separate count. Beds closed for repairs should come out of the denominator for the days they were closed. And a ward register that is filled in from memory the next morning is not a census; check a few nights against the nurses' handover notes before you trust a year of figures.",
            ),
          },
          {
            title: "Demand arrives by the hour, not by the month",
            body: p(
              "A monthly average tells you how full the hospital was on a typical night. It does not tell you whether there was a bed at 2pm on a Monday, which is when the emergency room needed one. To see real capacity you need demand and supply by hour of day and day of week.",
              "The method is simple. Take four to six weeks of admission times and discharge times from the register or the system. Count admissions in each hour of the day, then count discharges in each hour. Plot both on one chart. In many Nigerian private hospitals the pattern is the same: admissions peak between 10am and 2pm as outpatient clinics and the emergency room send patients up, while discharges cluster between 3pm and 7pm because ward rounds finish late, the final bill takes hours and families arrive after work. For four or five hours every day the wards are full while patients wait on trolleys downstairs, even in a month when occupancy averaged 72%.",
              "A second tool is Little's Law, which links three numbers in any stable queue: the number of people in a system equals the rate they arrive multiplied by the time each spends there. If an outpatient department receives 40 patients an hour through the morning and each spends three hours on site, about 120 patients are in the building at the peak. That number explains the crowded waiting hall, the shortage of chairs and the pressure on toilets better than any complaint log. It also shows the two levers: reduce arrivals in the peak hour through booked appointments, or cut the time each patient spends on site.",
              "Day of week matters as much as hour. Mondays carry the weekend's deferred demand, Fridays see elective admissions pushed forward to avoid weekend stays, and Sunday discharges are rare because senior doctors are not on the ward to sign them.",
            ),
          },
          {
            title: "Measuring waiting times honestly",
            body: p(
              "A waiting time is only meaningful once you have fixed where the clock starts and where it stops. 'Waiting to see the doctor' can mean from arrival at the gate, from registration, from the end of vital signs or from the time on the appointment card. Each gives a different number. Pick the definition that matches the patient's experience, usually arrival to the start of the consultation and arrival to leaving the hospital, and write it down.",
              "Then measure every stage separately. In a Nigerian private outpatient department the stages are usually registration or card retrieval, payment or HMO verification, vital signs, consultation, then a second round of payment, laboratory and pharmacy. Patients often wait longest at the payment points, not the doctor, and a single 'total wait' hides that.",
              "The practical method is a time card. For two weeks, every patient (or every third patient on a very busy day) carries a card that staff stamp with the clock time at each step. Run it on every clinic day, including Monday, because a study done on a quiet Wednesday will flatter the hospital. Appointment times in the system are not a substitute: they record when the patient was booked to come, not when they arrived or were seen.",
              "Report the median and the 90th percentile, not the average. Waiting times are skewed: most patients wait a moderate time and a few wait a very long time. If the average is 95 minutes, the median may be 60 and the 90th percentile four hours. The median tells you what a typical patient experiences. The 90th percentile tells you how bad it gets for the one patient in ten who will tell their friends. The average sits between the two and describes nobody.",
              "Finally, link the waits to the hourly arrival profile. Long waits that appear only between 9am and 11am point to a booking problem; long waits all day point to a capacity problem at one stage.",
            ),
          },
          {
            title: "Theatre time: where the hours go",
            body: p(
              "Theatre utilisation is the share of scheduled theatre time actually used for patients. The useful version is in-session utilisation: total patient-in-room time during booked sessions divided by total booked session time. A hospital with two theatres running eight-hour sessions five days a week has 80 hours a week of booked time. If the theatre register shows 48 hours of patient-in-room time, utilisation is 60%.",
              "The headline number matters less than the breakdown of the lost 32 hours. Lost theatre time falls into four buckets, and each has a different cause and owner:",
              "- Late starts: the first patient enters the room after the session start time\n- Long turnovers: the gap between one patient leaving and the next entering\n- Early finishes: the list ends before the session does because it was under-booked\n- On-the-day cancellations: a booked case does not happen",
              "Rebuild a month from the register. For each session record the scheduled start, the time the first patient entered, each patient in and out time, and the session end. Late starts of 45 minutes on most days are common and usually trace to the surgeon's outpatient clinic running over, the patient not yet consented or the anaesthetist covering two theatres.",
              "Cancellations deserve their own reason log. In Nigerian private hospitals a large share of day-of-surgery cancellations are administrative, not clinical: the deposit has not been paid, the HMO authorisation code has not arrived, blood has not been cross-matched, or the patient was not told to fast. Each one is preventable with a pre-operative check two days before the list, which confirms payment or authorisation, investigations and fasting instructions.",
              "Express the lost time in money where you can. If an average case brings N650,000 in theatre and surgical fees and each lost hour could have held one more case, recovering ten hours a week is worth far more than the cost of a theatre coordinator who chases the next day's list.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Capacity from the ward register",
            instruction:
              "A 45-bed hospital in Port Harcourt is licensed for 64 beds. In October (31 days) the midnight census adds up to 1,116 bed-days. There were 196 live discharges, 9 deaths and 3 transfers out, plus 85 day cases. Six beds on the surgical ward were closed for 10 days for repainting. Calculate occupancy, ALOS and bed turnover on the correct basis, show what the figures would have been on licensed beds, and write two sentences for the medical director explaining which figure to use and why.",
          },
          {
            title: "Practice: Where the theatre hours went",
            instruction:
              "Three theatres run 8am to 4pm, Monday to Friday. In four weeks the register shows 252 hours of patient-in-room time. Average first-patient entry is 8:50am, average turnover is 55 minutes on lists of four cases, and 31 of 260 booked cases were cancelled on the day (deposit not paid 11, HMO authorisation missing 8, not fasted 5, no blood 4, surgeon unavailable 3). Calculate in-session utilisation, estimate the hours lost to late starts and to cancellations, and propose the two changes you would make first, with the measure you would track for each.",
          },
        ],
      },
      resources: { tools: ["Midnight census template", "Outpatient time card", "Theatre session log"] },
      questions: [
        mc(
          "A 50-bed hospital in Abuja (all beds staffed) is licensed for 64 beds. In a 31-day month the midnight census adds up to 1,240 bed-days. What occupancy should you report?",
          ["62.5%, using the 64 licensed beds as the denominator", "80%, using the 50 staffed beds", "85%, the recommended optimum for a hospital this size", "40 patients a night, since occupancy is best expressed as a count"],
          B,
          "Occupancy is occupied bed-days divided by staffed beds times days: 1,240 / 1,550 = 80%. Using licensed beds gives 62.5% and makes the hospital look emptier than it is.",
        ),
        mc(
          "Over a quarter a ward records 1,240 occupied bed-days, 230 live discharges and 18 deaths. What is the ALOS?",
          ["5.4 days, counting live discharges only", "4.1 days, dividing by admissions plus discharges", "6.2 days, adding a day for each death", "5.0 days, counting deaths as discharges"],
          D,
          "ALOS divides bed-days by all discharges, including deaths and transfers out: 1,240 / 248 = 5.0 days. Leaving out deaths shrinks the denominator and overstates length of stay at 5.4 days.",
        ),
        mc(
          "An outpatient time-card study finds an average wait of 95 minutes, a median of 60 minutes and a few patients who waited six hours. What should you report to the medical director?",
          ["The median and the 90th percentile, since a few very long waits pull the average up", "The average, because it uses every patient's wait and is the standard figure hospitals publish", "The longest wait, because it is the figure most likely to appear in a complaint", "The shortest stage time, to show what the clinic achieves when it runs well"],
          A,
          "Waits are skewed, so the median shows the typical experience and the 90th percentile shows how bad it gets for the worst-served tenth. The average looks complete but blends the two and hides both.",
        ),
        mc(
          "An outpatient department receives about 45 patients an hour between 9am and noon, and each patient spends about 2.5 hours on site. Roughly how many patients are in the building at the late-morning peak?",
          ["About 18, which is 45 divided by 2.5", "About 45, since that is the hourly arrival rate", "About 112, which is 45 multiplied by 2.5", "About 270, which is every patient seen in the three-hour morning"],
          C,
          "Little's Law: people in the system equal the arrival rate times the time each spends there, so 45 x 2.5 is about 112. Counting all morning arrivals ignores that the earliest patients have already left.",
        ),
        mc(
          "Monthly occupancy at a Lagos hospital is 72%, yet emergency patients wait on trolleys for a ward bed most afternoons. What is the most likely explanation?",
          ["Discharges cluster late in the afternoon while admissions peak in the late morning", "The hospital needs more beds, since any regular trolley wait proves that bed capacity is short at peak times", "Occupancy has been calculated wrongly, because 72% cannot coexist with trolley waits", "Emergency staff are slow to request beds, which a training session would fix"],
          A,
          "A monthly average hides the hourly mismatch between admission and discharge times; 72% is perfectly compatible with full wards for four hours a day. Adding beds before moving discharges earlier would spend capital on a timing problem.",
        ),
        mc(
          "Two theatres run eight-hour sessions, five days a week. The register shows 48 hours of patient-in-room time last week. What was in-session utilisation?",
          ["48%, reading the hours used as a percentage", "75%, counting the turnover time between cases as used", "60%, which is 48 used hours out of 80 booked hours", "40%, which is the share of booked time that was lost"],
          C,
          "In-session utilisation is patient-in-room time over booked session time: 48 / 80 = 60%. The 40% is the lost time that you then break down into late starts, turnovers, early finishes and cancellations.",
        ),
        mc(
          "Last month 22 of 140 elective cases at a private hospital were cancelled on the day: deposit not paid 9, HMO authorisation missing 6, patient not fasted 3, surgeon unavailable 2, no blood 2. What should the hospital do first?",
          ["Add a Saturday operating list to catch up the cancelled cases and protect surgeons' income while the backlog clears", "Ask surgeons to confirm their availability a week ahead", "Penalise patients who arrive unfasted with a rebooking fee", "Check payment, HMO authorisation, blood and fasting two days before each list"],
          D,
          "Twenty of the 22 cancellations were administrative and preventable with a check before the day. Extra lists add capacity but leave the same cases failing for the same reasons.",
        ),
        mc(
          "You have two weeks to measure outpatient waiting times at a 120-bed hospital. Which approach will give figures you can defend?",
          ["Ask patients in an exit survey how long they waited at each stage", "Stamp a time card at each step for every patient (every third when busy) on all clinic days, Monday included", "Time patients carefully on one quiet day so the study does not disrupt the clinic", "Use the appointment times already recorded in the hospital system as the start of each patient's wait, which avoids extra work for staff"],
          B,
          "Stamped times at each stage across all clinic days give real, stage-level data. Appointment times look precise but record when patients were booked, not when they arrived, and patients' recall of waits is unreliable.",
        ),
        ms(
          "Which of these would make a reported occupancy rate misleading? Select all that apply.",
          ["Using licensed beds rather than staffed beds as the denominator", "Adding same-day day cases into inpatient bed-days without saying so", "Showing the hourly admission and discharge profile alongside the monthly rate", "Keeping beds closed for renovation in the denominator for the days they were closed", "Using the nightly midnight census as the source of bed-days"],
          [A, B, D],
          "Licensed beds, closed beds and mixed-in day cases all distort the ratio. The midnight census is the correct source, and showing the hourly profile adds information rather than distorting it.",
        ),
        mc(
          "Hospital X and Hospital Y each have 40 staffed beds and 80% occupancy in a 30-day month. X discharged 160 patients and Y discharged 100. What does this tell you?",
          ["Y is more efficient, because it admitted fewer patients for the same occupancy", "The two hospitals perform the same, since occupancy is equal", "X has a capacity problem and needs more beds, because its beds turn over faster", "Y's patients stay about 9.6 days against X's 6, so Y should look at case mix and discharge delays before adding beds"],
          D,
          "Both have 960 bed-days; dividing by discharges gives ALOS of 6 days for X and 9.6 for Y. Equal occupancy hides very different throughput, and Y's longer stays are the thing to investigate.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "supply-chain-procurement-basics",
      name: "Pharmacy, Consumables and Procurement",
      description:
        "Control what the hospital stocks and buys: formulary, ABC and VEN analysis, reorder points, stock counts, and the purchase-to-pay controls that stop money leaking.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Know what you stock and why",
            body: p(
              "A hospital pharmacy and store that tries to control every item equally ends up controlling none of them. The first job is to sort the item list so attention goes where the money and the clinical risk sit.",
              "Start with the formulary: the approved list of medicines the hospital will stock, decided by a Drugs and Therapeutics Committee of doctors, pharmacists and nurses. A short formulary with one or two brands per molecule means fewer items to order, count and expire, and better prices because volume is concentrated. Many private hospitals in Nigeria have no working formulary; each consultant asks for a favourite brand and the store carries five versions of the same antibiotic.",
              "ABC analysis sorts items by annual spend. List every item with its yearly quantity and unit cost, multiply, and rank from highest to lowest. Typically a small share of items, often around a tenth to a fifth, accounts for most of the spend. These are A items. They deserve negotiated prices, tight reorder levels and frequent counts. C items are the long tail of cheap items, where simple rules are enough.",
              "VEN analysis sorts the same items by clinical importance: Vital (life-saving, no substitute, such as adrenaline, oxytocin or IV fluids), Essential (important but a short gap can be managed) and Non-essential. Put the two together and the policy follows. A Vital item that is cheap, such as adrenaline, should be held with generous safety stock because a stock-out could cost a life and holding extra costs little. An expensive Non-essential item should be held lean or ordered only against a confirmed patient.",
              "Consumables follow the same logic. Theatre packs, sutures, cannulas, gloves and lab reagents often add up to as much as the drugs, and they are usually less well controlled because no pharmacist owns them.",
              "The output of this work is a single item master: one record per item with a code, a description, the unit of issue, the ABC and VEN class and the reorder parameters. Everything else in this module depends on it.",
            ),
          },
          {
            title: "Stock levels: reorder point, safety stock and days of stock",
            body: p(
              "Stock-outs and overstock are two faces of the same missing rule: nobody has set when to order and how much. The basic rule is the reorder point.",
              "- Reorder point = average daily use x (supplier lead time in days + safety stock in days)",
              "Take ceftriaxone 1g vials at a 100-bed hospital. Average use is 40 vials a day, the wholesaler in Lagos delivers five days after the order, and the pharmacist wants three days of safety stock to cover late deliveries and busy weeks. The reorder point is 40 x (5 + 3) = 320 vials. When the balance falls to 320, an order goes out. Order quantity is a separate decision, usually two to four weeks of use, balanced against cash and shelf life.",
              "Average daily use should come from issues over the last two or three months, not from what was ordered. Lead time should be what actually happens, not what the supplier promises. Safety stock should be larger for Vital items and for suppliers who are often late.",
              "Days of stock tells you whether the overall level is sensible. Divide the value of stock on hand at cost by the average daily cost of what was issued. A pharmacy holding N38m of stock that dispenses N19m a month at cost holds about 60 days. Whether that is right depends on lead times and supplier reliability, but very high figures mean cash sitting on shelves and a growing expiry risk, while very low figures mean frequent stock-outs.",
              "Stock-outs have costs that do not appear in the store's records. Patients are sent out with prescriptions to buy at a community pharmacy, which is lost revenue and a poorer service. Doctors switch to second-line alternatives. Theatre lists stop for a missing pack. Track these as signals: count prescriptions not dispensed and cases delayed for missing items each week.",
              "Expiry is the cost of the opposite error. Issue stock first-expiry-first-out (FEFO), label shelves with expiry dates, and review short-dated stock every month so it can be used, transferred or returned before it becomes a write-off.",
            ),
          },
          {
            title: "Stock counts and where stock goes missing",
            body: p(
              "The stock balance in the system is a claim; the physical count is the evidence. A store that never counts has no idea whether its records are true.",
              "Count A items monthly and the rest at least quarterly, with a full count at year end. The person who counts should not be the person who keeps the records. Compare each count with the system balance and investigate every variance above a set value. The arithmetic is simple: opening stock plus receipts minus recorded issues should equal closing stock. If it does not, something left without being recorded.",
              "Take theatre gauze packs. Opening stock was 500, 2,000 were received, and 1,700 were issued against patient bills. Closing stock should be 800. The count finds 300. Five hundred packs are missing. Theft is possible, but the more common cause in hospitals is consumption that was never recorded or charged: packs opened in theatre and not entered on the patient's bill, ward top-ups taken without a requisition, or items borrowed by another unit in an emergency. Before you assume theft, trace a sample of theatre cases from the theatre register to the bills and see what was used and what was charged.",
              "Ward imprest stocks deserve attention. Wards hold a small fixed stock of common items, topped up regularly. If top-ups are not matched to what was used on named patients, the ward becomes a hole the store pours stock into.",
              "Write-offs for expiry, damage and breakage should be approved by someone senior, recorded with reasons and reported monthly. A rising write-off line usually means over-ordering, poor rotation or items no clinician uses any more.",
              "Keep the count simple enough that it actually happens. A count sheet listing items in shelf order, two people per section, blind counts that do not show the system balance in advance, and a deadline for investigating variances will do more than an elaborate system that nobody runs.",
            ),
          },
          {
            title: "Buying: from requisition to payment",
            body: p(
              "Procurement controls exist so that the hospital pays the right price, for goods it ordered, that actually arrived. The standard chain is:",
              "- Requisition: a user department asks for an item\n- Approval: a budget holder authorises it\n- Quotation: for anything above a set value, competing quotes are obtained\n- Purchase order (PO): a numbered order states item, quantity, price and terms\n- Goods received note (GRN): the store records what arrived and in what condition\n- Invoice: the supplier bills\n- Three-way match: accounts pays only where PO, GRN and invoice agree",
              "If the PO says 80 cartons at N42,000, the GRN shows 80 received and the invoice says 100 cartons at N45,000, accounts pays for 80 cartons at N42,000 and sends the invoice back for correction. Paying invoices without a matched GRN is how hospitals pay for goods that never came.",
              "Segregation of duties is the control behind the chain. The person who raises the order should not receive the goods, and the person who receives them should not keep the stock record or approve the payment. Where one storekeeper does all three, they can record deliveries that never arrived or hide losses, and nobody else can see the mismatch. In a small hospital you may not have enough staff for full separation; then a senior person must review and sign the records regularly.",
              "Medicines bring regulatory checks. Every medicine and many medical devices sold in Nigeria must be registered with NAFDAC, and the registration number on the pack should match the product and manufacturer in NAFDAC's records. A pharmacy must be licensed by the Pharmacists Council of Nigeria and run under a superintendent pharmacist. Falsified and substandard medicines circulate in the market, so a new supplier offering a well-known product far below the usual price is a reason for checks, not celebration.",
              "Some items need a cold chain from manufacturer to patient: vaccines, insulin, oxytocin and some biologicals. Check that the supplier can show how the item was kept cold, and that the hospital's fridges are on protected power with temperature logs.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Reorder points and ABC",
            instruction:
              "A 90-bed hospital in Enugu gives you twelve months of issues for 20 pharmacy items with unit costs. Rank them by annual spend and mark the A items. For the top five A items and for adrenaline 1mg, calculate the reorder point using average daily use from the last three months, a lead time of 6 days (10 days for two imported items) and safety stock of 3 days (7 days for Vital items). State which items you would count monthly and why.",
          },
          {
            title: "Practice: Purchase-to-pay check",
            instruction:
              "Pick 15 payments to suppliers from last quarter at a 70-bed hospital, totalling N31m. For each, find the PO, the GRN and the invoice. In your sample, three payments have no GRN, two invoices exceed the PO price by 6 to 9%, and one PO was raised after the invoice date. Set out what each finding means, what the risk is, and the control you would recommend, in a one-page note to the finance manager.",
          },
        ],
      },
      resources: { tools: ["Item master template", "ABC-VEN matrix", "Stock count sheet", "Three-way match checklist"] },
      questions: [
        mc(
          "A hospital uses about 30 bags of metronidazole infusion a day. The supplier delivers four days after ordering, and the pharmacist holds two days of safety stock. What is the reorder point?",
          ["120 bags, enough to cover the supplier's four-day lead time", "60 bags, covering the safety stock twice over", "180 bags, covering lead time plus safety stock", "240 bags, covering eight days of use"],
          C,
          "Reorder point is daily use times lead time plus safety stock: 30 x (4 + 2) = 180. Ordering at 120 leaves no buffer, so any late delivery means a stock-out.",
        ),
        mc(
          "A store carries 400 items. ABC analysis shows 52 of them account for 74% of annual spend. Where should the pharmacist put negotiated prices, tight reorder levels and monthly counts?",
          ["The 52 high-spend items", "All 400 items equally, so nothing is neglected", "The cheapest fast-moving items, since they are issued most often", "Whichever items ran out most often last year, whatever their value"],
          A,
          "ABC exists to concentrate control where the money is, and 52 items carry three quarters of it. Stock-out history matters for safety stock, but it is not what decides where price negotiation and counting effort go.",
        ),
        mc(
          "Adrenaline 1mg ampoules are a C item by spend but Vital in VEN terms. What stocking policy fits?",
          ["Hold the minimum, since C items should tie up as little cash and shelf space as possible under ABC rules", "Remove it from the formulary and buy it when needed", "Order it only when a doctor requests it for a named patient", "Hold a generous safety stock, because it costs little to hold and a stock-out could cost a life"],
          D,
          "A cheap Vital item should be held generously: the holding cost is trivial and the cost of running out is a death. Treating it by spend alone, as a C item, gets the risk backwards.",
        ),
        mc(
          "A pharmacy holds N38m of stock at cost. The cost of drugs dispensed last month was N19m. About how many days of stock is it holding?",
          ["About 15 days", "About 60 days", "About 30 days", "About 120 days"],
          B,
          "Daily issue cost is about N19m / 30, roughly N633,000, and N38m / N633,000 is about 60 days. Reading the ratio of 2 as 'two weeks' or 'one month' is the common slip.",
        ),
        mc(
          "Theatre gauze packs: opening stock 500, received 2,000, issued against patient bills 1,700, physical count 300. What is the right first step?",
          ["Report a theft of 500 packs to the medical director and ask security to search the theatre staff lockers", "Trace a sample of theatre cases from register to bill to see if packs were used but not charged", "Adjust the system balance to 300 so the records are correct", "Increase the reorder point, since the theatre clearly uses more than planned"],
          B,
          "Expected closing stock is 800, so 500 are unaccounted for, and unrecorded use in theatre is the commonest cause. Adjusting the balance hides the loss without finding it, and calling it theft before tracing usage may be wrong and damages trust.",
        ),
        mc(
          "The purchase order is for 80 cartons at N42,000, the goods received note shows 80 cartons, and the invoice is for 100 cartons at N45,000. What should accounts pay?",
          ["100 cartons at N45,000, since the invoice is the supplier's legal claim", "80 cartons at N45,000, since quantity is what the GRN controls", "Nothing until the supplier delivers the other 20 cartons", "80 cartons at N42,000, and return the invoice for correction"],
          D,
          "Three-way match means paying only what was ordered, at the ordered price, and received. Paying the invoice price for the received quantity accepts a price increase nobody approved.",
        ),
        mc(
          "A new supplier offers a well-known antimalarial at 30% below the hospital's usual price. What should the pharmacist do before buying?",
          ["Check the NAFDAC registration matches the product and maker, and confirm the supplier's licence", "Ask two other suppliers to match the price, since the hospital's policy requires three quotes for any new supplier", "Buy a small trial quantity and watch for patient complaints", "Accept, since the Drugs and Therapeutics Committee already approved the molecule"],
          A,
          "A price far below market is a warning sign for falsified or substandard product, so registration and supplier licence come first. Competing quotes test price, not authenticity, and a trial on patients is not a safety check.",
        ),
        mc(
          "At a 60-bed hospital the same storekeeper raises orders, receives deliveries and updates the stock records. What is the main risk?",
          ["Orders will be raised too slowly because one person is overloaded", "Suppliers will refuse to deal with a single contact", "One person can record goods that never arrived, or hide losses, and nobody else can see the mismatch", "The hospital will breach Pharmacists Council rules on how many staff a store must have for a hospital of its size"],
          C,
          "Combining ordering, receiving and record-keeping removes the independent check that exposes fraud or error. Workload is a real issue, but it is not the control failure.",
        ),
        ms(
          "Which of these are signs that stock-outs are costing the hospital money? Select all that apply.",
          ["Patients are sent out with prescriptions to buy at community pharmacies", "Expired stock is written off every quarter", "Doctors switch to second-line alternatives because the first choice is unavailable", "Theatre lists start late while staff look for missing packs", "The average value of stock on hand is rising"],
          [A, C, D],
          "Prescriptions sent out, forced substitutions and delayed theatre lists are all lost revenue or care caused by missing stock. Expiry write-offs and rising stock value point to overstock, the opposite problem.",
        ),
        mc(
          "The store issues the newest delivery first because it sits at the front of the shelf. Expiry write-offs run at about N1.2m a quarter. What fixes this?",
          ["Issue first-expiry-first-out, label shelves by expiry date, and review short-dated stock monthly", "Order smaller quantities more often, which keeps stock fresh and removes the need to rotate it on the shelf", "Ask suppliers to take back all expired stock at full credit", "Move the write-off to the pharmacy's budget so the pharmacist feels the cost"],
          A,
          "The cause is rotation, so FEFO with a monthly short-dated review addresses it directly. Smaller orders help a little but stock will still expire if new deliveries are issued first.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "facilities-power-equipment-basics",
      name: "Facilities, Power and Equipment",
      description:
        "Understand and measure power and diesel, planned maintenance, and biomedical equipment, which together decide whether a Nigerian hospital can stay open and safe.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "Power is a cost line and a clinical risk",
            body: p(
              "In most Nigerian hospitals power is one of the largest non-staff costs and one of the largest safety risks, and both come from the same place: an unreliable grid backed by diesel generators.",
              "A typical private hospital runs on three sources. Grid supply comes from the local distribution company and is cheapest when it is available, but hours of supply vary by feeder and tariff band. Diesel generators fill the gaps and, in many hospitals, run most of the day. A growing number now add solar panels with battery storage to cut generator hours, particularly for daytime loads.",
              "Not every load is equal. Separate the hospital's electrical load into critical circuits that must never drop (theatres, ICU, neonatal unit, oxygen concentrators, blood bank and lab fridges, the server and network), essential circuits that can tolerate a short break (ward lighting, lifts, pharmacy fridges with their own temperature margin) and non-essential circuits that can be shed when running on generator (office air conditioning, laundry, staff quarters, car park lighting).",
              "The changeover gap is a clinical risk that managers often miss. When the grid fails, an automatic changeover switch starts the generator and transfers the load, but that can take anywhere from several seconds to a minute or more, and a manual changeover takes longer. During that gap, anaesthesia machines, ventilators, infusion pumps and incubators need battery backup or an uninterruptible power supply (UPS). Ask the theatre and ICU teams what happened during the last outage; the answer tells you more than the electrical drawings.",
              "Power also shapes the money. A hospital spending N12m a month on diesel against revenue of N90m is spending more than 13 kobo of every naira on fuel. Diesel prices move with exchange rates and are hard to pass on to patients quickly, so a sudden rise squeezes margins at once. That is why power deserves the same monthly reporting as staff costs: litres bought, litres used, hours run, cost per hour and, where meters exist, cost per kilowatt-hour from each source.",
            ),
          },
          {
            title: "Measuring and reconciling diesel",
            body: p(
              "Diesel is a cash commodity that is easy to measure and easy to lose. A hospital that cannot say how many litres it used last month, and why, is almost certainly paying for some it never burned.",
              "Keep a fuel log for each generator: litres delivered with the delivery note, tank dip readings at a fixed time each day, generator run hours from the hour meter, and kilowatt-hours generated if the set has an energy meter. From these come three useful ratios.",
              "- Litres per run hour, which should be broadly stable for a given load\n- Litres per kilowatt-hour, which shows efficiency; a well-loaded diesel set typically uses roughly 0.25 to 0.35 litres per kWh, and an underloaded or poorly maintained one uses noticeably more\n- Cost per day and per month at the current diesel price",
              "Take a generator that burns 28 litres an hour and runs 12 hours a day, with diesel at N1,200 a litre. It uses 336 litres a day, which costs N403,200, or about N12.1m over a 30-day month.",
              "The reconciliation is simple. Opening tank stock plus deliveries minus closing tank stock is what left the tank. Compare that with what the run hours say the generator should have used. If the opening dip was 2,000 litres, deliveries were 12,000 and the closing dip is 3,500, then 10,500 litres left the tank. If the run-hour log implies 7,000 litres of use, 3,500 litres are unexplained. The causes are usually short deliveries, siphoning, fuel taken for vehicles, a leaking tank or a run-hour log that is not being kept honestly.",
              "Generator sizing matters too. A large set running at night to carry a light load burns far more per kWh than a smaller set matched to that load. Many hospitals cut fuel use simply by installing a smaller set for nights and weekends, shedding non-essential circuits when on generator, and moving daytime loads onto solar and batteries.",
            ),
          },
          {
            title: "Maintenance: planned beats reactive",
            body: p(
              "Most Nigerian hospitals maintain by breakdown: the air conditioner stops, the generator fails, the borehole pump burns out, and somebody calls a technician. Breakdown maintenance looks cheaper because nothing is spent until something fails. It is usually more expensive, because emergency repairs cost more, failures damage other parts, and clinical services stop while the repair is arranged.",
              "Planned preventive maintenance (PPM) replaces this with a schedule. The steps are straightforward:",
              "- Build an asset register: every generator, air conditioner, pump, lift, autoclave, fridge and major building system, with location, age, condition and who services it\n- Set a maintenance task and interval for each, from the manufacturer's guidance or the technician's experience: generators by run hours, air conditioners by months\n- Issue work orders for each planned job and each breakdown, and record when it was done, by whom, the parts used and the cost\n- Review each month: planned jobs done on time, breakdowns, repeat failures and spend",
              "Start with the assets whose failure stops clinical work or costs the most. Generators and changeover switches, theatre air handling, the autoclave in the central sterile services department, medical gas supply, and the water supply come first.",
              "Water is easy to overlook. Most hospitals rely on boreholes, with treatment and storage tanks. Check that water is tested, tanks are cleaned on a schedule and there is enough storage to ride out a pump failure.",
              "Healthcare waste needs a written process. Waste should be segregated at the point it is produced into colour-coded containers, sharps go into puncture-resistant boxes, and infectious waste is collected by a contractor approved by the state authorities, with records of every collection. Open burning behind the hospital is unsafe and unlawful in most states.",
              "Fire safety completes the basics: extinguishers in date, alarms tested, exits clear and a drill that staff have actually practised.",
            ),
          },
          {
            title: "Biomedical equipment: registers, uptime and the true cost",
            body: p(
              "A hospital's clinical equipment earns money only when it works, and in many Nigerian hospitals a meaningful share of it does not. The tools for managing it are an equipment register, uptime measurement and an honest view of total cost.",
              "The equipment register lists every item of medical equipment with make, model, serial number, location, date installed, warranty or service contract status and current condition. Tag each item. Without a register you cannot plan maintenance, check that service contracts cover what they should, or notice that the hospital owns four ultrasound machines and only two work.",
              "Uptime is the share of scheduled hours an item was available. If a CT scanner is scheduled for 300 hours a month and was down for 75, uptime was 75%. Service contracts for high-value equipment often promise a minimum uptime, and they mean something only if the hospital logs every failure with the time it was reported and the time it was fixed. Without that log, the vendor's word stands.",
              "Choose between an in-house biomedical engineer and vendor service contracts by asset. An in-house engineer can handle routine checks, user errors, electrical safety tests and simple repairs across many devices. Imaging equipment, analysers and anaesthesia machines usually need the manufacturer's or agent's engineers and parts, which can take weeks to import.",
              "Total cost of ownership is the price that matters. A laboratory analyser that costs N18m but only runs on the vendor's reagents at a high price can cost more over five years than one at N26m that uses open reagents. Add purchase price, installation, consumables and reagents, service and spare parts over the expected life, then compare.",
              "Donated and second-hand equipment needs the same questions: can it be serviced locally, do parts and consumables exist in Nigeria, does it match the local voltage and frequency, and who will maintain it? Oxygen supply deserves the same discipline, whether from cylinders or an on-site plant: peak demand, purity, power and backup.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Diesel reconciliation",
            instruction:
              "A 110-bed hospital in Kano runs a 250 kVA and a 100 kVA generator. In September deliveries were 18,000 litres at N1,150 a litre. Opening dip was 3,200 litres and closing dip 2,700. Run hours were 290 on the large set (log shows 34 litres an hour) and 260 on the small set (14 litres an hour). The grid supplied about 9 hours a day. Reconcile the fuel, calculate the unexplained litres and their value, and propose three controls and two load changes, each with its expected monthly saving.",
          },
          {
            title: "Practice: Equipment register triage",
            instruction:
              "A 150-bed hospital has no equipment register. A walk-round finds 212 items of medical equipment. Of these, 31 are not working, 14 have no identifiable service arrangement, and the CT scanner, two anaesthesia machines and the chemistry analyser are on vendor contracts with no downtime log. Design the register fields, list the first ten items you would prioritise for repair or replacement with your reasons, and draft the downtime log you would require for the four contracted items.",
          },
        ],
      },
      resources: { tools: ["Generator fuel log", "Asset register template", "PPM schedule", "Equipment downtime log"] },
      questions: [
        mc(
          "A generator burns 28 litres an hour and runs 12 hours a day. Diesel costs N1,200 a litre. What does it cost to run for a 30-day month?",
          ["About N12.1m", "About N4.0m", "About N10.08m", "About N14.5m"],
          A,
          "336 litres a day at N1,200 is N403,200 a day, about N12.1m a month. Lower figures usually come from forgetting either the hours per day or the days in the month.",
        ),
        mc(
          "A generator's meter shows 3,000 kWh produced last week while it used 1,500 litres of diesel. What does this suggest?",
          ["The set is efficient, since about half a litre per kWh is the normal figure for diesel generators in hospitals", "The meter is broken, because a generator cannot produce more kWh than litres", "Use per kWh is well above a well-loaded set's, so check loading, maintenance and whether fuel reaches the set", "The grid is supplying less power, which raises generator fuel use per kWh"],
          C,
          "0.5 litres per kWh is well above the roughly 0.25 to 0.35 a well-loaded set uses, so something is wasting or diverting fuel. Grid hours change how long the set runs, not how much fuel it burns per unit produced.",
        ),
        mc(
          "Opening tank dip 2,000 litres, deliveries 12,000 litres, closing dip 3,500 litres. The run-hour log implies 7,000 litres of use. How many litres are unexplained?",
          ["1,500 litres", "3,500 litres", "5,000 litres", "10,500 litres"],
          B,
          "10,500 litres left the tank (2,000 + 12,000 - 3,500) against 7,000 logged, leaving 3,500 unexplained. 10,500 is what left the tank, not the gap.",
        ),
        mc(
          "Changeover from grid to generator at a hospital takes 30 to 60 seconds. Which of these has the strongest case for battery or UPS backup?",
          ["Air conditioning in the administration block", "The laundry's washing machines", "Car park and perimeter lighting, which security needs at night", "Anaesthesia machines and patient monitors in theatre"],
          D,
          "A patient under anaesthesia cannot wait a minute for power, so theatre equipment needs an uninterrupted supply. The other loads can ride out the gap or be shed while on generator.",
        ),
        mc(
          "A hospital spent N9m last year on emergency repairs to air conditioners and generators. It has no maintenance schedule. What should it do first?",
          ["Replace all air conditioners older than five years", "Sign an annual call-out contract with a cheaper technician", "Build an asset register, schedule planned maintenance for the highest-risk assets, and log jobs on work orders", "Ask department heads to report faults faster so that repairs start sooner and clinical services stop for less time each"],
          C,
          "Without a register and a schedule the hospital cannot move from breakdown to planned maintenance, and work orders give the evidence to track it. A cheaper call-out contract only makes breakdown maintenance cheaper; it does not reduce breakdowns.",
        ),
        mc(
          "A CT scanner is scheduled for 300 hours a month and was down for 75 hours last month. The service contract promises 95% uptime. What follows?",
          ["Uptime was 75%, so log every failure with reported and fixed times and hold the vendor to the uptime clause", "Uptime was 25%, so the scanner should be replaced", "Uptime was 95% of working days, so the contract has been met", "Uptime cannot be judged until the vendor submits its own service report for the month, which is the contract record"],
          A,
          "225 of 300 hours is 75%, well below the promised 95%, and the hospital's own downtime log is what makes the clause enforceable. Relying on the vendor's report leaves the vendor marking its own work.",
        ),
        mc(
          "Analyser A costs N18m and uses only the vendor's reagents at about N9m a year. Analyser B costs N26m and uses open reagents at about N5m a year. Service costs are similar. Over five years, which is cheaper?",
          ["A, because it costs N8m less to buy", "They cost about the same once service is included", "A, because vendor reagents guarantee quality", "B, which costs about N12m less over five years"],
          D,
          "A totals N18m + N45m = N63m and B totals N26m + N25m = N51m. The purchase price is the tempting comparison but reagents dominate the five-year cost.",
        ),
        mc(
          "A foreign charity offers a used ultrasound machine free of charge. What should the hospital establish before accepting?",
          ["Whether the charity will also fund a launch event", "Whether it can be serviced and supplied in Nigeria, suits local voltage, and who will maintain it", "Whether the machine is newer and has more features than the ultrasound machines the hospital already owns", "Whether accepting it creates any tax liability"],
          B,
          "Free equipment that cannot be powered, serviced or supplied locally becomes a broken machine in a corridor. Being newer does not help if nobody can fix it.",
        ),
        ms(
          "Which of these are sound practice for healthcare waste? Select all that apply.",
          ["Segregate waste where it is produced into colour-coded containers", "Put sharps into puncture-resistant boxes", "Mix general and infectious waste to save on containers", "Use a contractor approved by the state authorities and keep records of each collection", "Burn infectious waste in an open pit on site"],
          [A, B, D],
          "Segregation at source, sharps boxes and a licensed, recorded collection are the basics. Mixing waste makes all of it infectious, and open burning is unsafe and unlawful in most states.",
        ),
        mc(
          "A hospital buys about 90 oxygen cylinders a month and is considering an on-site oxygen plant. What matters most before deciding?",
          ["Whether the plant's supplier can deliver within a month", "Whether the plant's price is lower than a year of cylinder purchases", "Whether staff prefer piped oxygen to cylinders", "Whether the plant's output and purity meet peak demand, how it is powered, the cylinder backup for outages, and who services it"],
          D,
          "Oxygen is Vital, so capacity at peak, purity, power and backup decide whether the plant is safe. A one-year price comparison ignores running costs and the risk of a plant that cannot meet peak demand.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "lean-intro",
      name: "Fixing a Process: Lean Basics",
      description:
        "A first, usable method for improving a hospital process: define it, go and see it, time it, find the step that holds it up, and test a change small.",
      estimatedMinutes: 50,
      content: {
        sections: [
          {
            title: "A process has a start, an end and a customer",
            body: p(
              "Improvement starts when a vague complaint becomes a defined process. 'The lab is slow' cannot be fixed. 'For inpatients, the time from a full blood count sample being taken to the result appearing on the ward is a median of six hours' can be.",
              "Every process has a trigger that starts it, an output that ends it and a customer who receives the output. For a discharge the trigger is the doctor's decision that the patient can go home and the output is the patient leaving the ward with medicines, instructions and a settled bill. The customer is the patient, but there are internal customers too: the emergency room waiting for the bed, and the next patient on the waiting list.",
              "Write these down before doing anything else, with one measure that tells you whether the process is getting better. Good measures are time-based (decision to departure, arrival to consultation, request to result), easy to collect from records that already exist, and meaningful to the people who work in the process. Pick one process at a time, and choose one that staff and patients already complain about, so that people want it fixed.",
              "Agree the scope with whoever asked for help. A medical director who says 'fix outpatients' may mean the morning wait for the cardiology clinic. A five-minute conversation that turns a department into one process with one measure saves weeks of unfocused work.",
              "Find out who does the work at each step, because they need to be part of it. In a hospital that usually includes people outside the obvious department: porters, cashiers, HMO desk officers, records clerks and pharmacy technicians often hold the key to a delay that clinicians cannot see. A mapping session with only senior doctors will produce a picture of how the process is supposed to run, not how it does. Include at least one person with the authority to approve changes so that good ideas are not left waiting for permission.",
            ),
          },
          {
            title: "Go and see, then time it",
            body: p(
              "The standard operating procedure tells you how a process should run. The only way to know how it does run is to go to where the work happens and follow it. Lean practitioners call this going to the gemba, the real place.",
              "Follow one patient, one specimen or one file from trigger to output. Write down each step, where it happens, who does it, and the clock time it starts and ends. Note every wait, every walk between buildings, every time a form goes back for a missing signature, and every workaround: the nurse's private notebook, the phone call to chase a result, the porter who knows which cashier is quicker. Workarounds show you where the official process fails.",
              "Then separate two kinds of time. Lead time is the total elapsed time from trigger to output. Work time, sometimes called touch time, is the time somebody is actually doing something for the patient or the item. The gap between them is waiting.",
              "Take a discharge on a surgical ward in Benin City. The consultant decides at 10:00am that the patient can go. The patient leaves at 4:00pm. Following the process step by step shows the actual work: writing the discharge summary, the pharmacist dispensing take-home medicines, the cashier preparing the final bill, the nurse giving instructions. Together these take about 45 minutes. The lead time is six hours and the work time is about 12% of it. The rest is the summary waiting for a junior doctor, the prescription waiting for a porter, and the family waiting for the bill.",
              "One followed patient is a story; ten are evidence. Follow at least ten cases across different days and shifts before you draw conclusions, and record the times as they happen rather than reconstructing them later. Show the timings to the staff who do the work. They will usually recognise them at once and explain the causes faster than any analysis.",
            ),
          },
          {
            title: "Find the step that holds everything up",
            body: p(
              "In any process the slowest step sets the pace for the whole. That step is the bottleneck, or constraint, and improving any other step does little until the bottleneck moves.",
              "To find it, estimate the capacity of each step: how many patients or items it can handle in an hour when it is working. Take an outpatient clinic in Kaduna where about 20 patients arrive an hour. Registration can handle 60 an hour, vital signs 40, pharmacy 30. Three doctors each see about four patients an hour, so consultation can handle 12. Consultation is the bottleneck. Patients will queue in front of the doctors whatever happens elsewhere, and the clinic can never discharge more than 12 an hour however fast registration becomes.",
              "The queue is the clue. Work piles up in front of the bottleneck and the steps after it are often idle, waiting. If the pharmacy is quiet all morning and then overwhelmed at 1pm, the constraint is earlier in the flow.",
              "A common mistake is to improve the step that is easiest to change or most visible. Adding a second registration clerk in the Kaduna clinic would move patients faster into the doctors' queue and leave total throughput exactly where it was. It might even make the waiting hall more crowded.",
              "Once you know the constraint, there are two kinds of move. Make the bottleneck's time count: make sure the doctors never wait for a file, a result or the next patient, and that tasks which do not need a doctor (filling forms, explaining routine instructions) go to someone else. Then, if that is not enough, add capacity at the bottleneck: another doctor in the peak hours, or appointment slots that spread arrivals so demand matches what the doctors can see.",
              "Fixing one bottleneck often reveals the next. That is normal, and it is why improvement is a series of small cycles rather than a single redesign.",
            ),
          },
          {
            title: "Test a change small: Plan, Do, Study, Act",
            body: p(
              "A good idea becomes a reliable improvement by being tested on a small scale, measured, and adjusted. The Plan, Do, Study, Act (PDSA) cycle is the simplest structure for doing that.",
              "Plan: state the change, who will try it, where and for how long, and what you predict will happen, in numbers. 'On Ward 3 for one week, the cashier will prepare an interim bill the evening before an expected discharge. We predict median decision-to-departure time will fall from five and a half hours to under four.'",
              "Do: run the test as planned, and record what actually happened, including problems nobody expected.",
              "Study: compare the results with the prediction, using the same measure collected the same way as the baseline. Did the median move? Did anything else get worse?",
              "Act: decide to adopt the change, adapt it and run another cycle, or abandon it. Most changes are adapted. Suppose the interim bill cut median discharge time from 5.5 to 4.8 hours, but the next delay turned out to be take-home medicines waiting at pharmacy. The right move is to keep the billing change and run the next cycle on pharmacy, not to declare the project a failure or roll the billing change out to every ward before the pharmacy delay is understood.",
              "Small tests have three advantages in a hospital. They are safe, because a change that goes wrong affects a few patients for a few days. They are fast, so staff see results while they still remember why they started. And they win sceptics, because a ward manager who sees her own numbers improve is more convincing than any consultant.",
              "Keep a short log of each cycle: change, prediction, result, decision. After four or five cycles the log becomes the story of the improvement and the evidence the board will ask for.",
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster gives you a method you can use on a real process this week: define it, go and see, time it, find the bottleneck and test changes small. The paid track, Lean & Quality Improvement, takes the same work further and assumes you have done this module. It covers four things this taster does not.",
              "- The eight wastes and full value stream mapping. You learn to classify every non-value step by waste type and to draw a current-state and future-state value stream map with staff, including how to run the mapping session and turn the future state into an action plan.\n- Structured problem-solving for harder problems. DMAIC (Define, Measure, Analyse, Improve, Control) for problems whose cause is not obvious, with fishbone diagrams for root causes, run charts to see whether a change worked, and control charts to separate real change from normal variation.\n- Theatre and outpatient flow redesign. Applying these methods to the two flows that matter most to a private hospital's revenue: theatre scheduling, start times, turnovers and cancellations, and outpatient booking, clinic templates and queue design.\n- Making improvement stick. Standard work, visual management boards and daily huddles, so that gains survive after the project team leaves and the next problem is found by the ward rather than by an outside reviewer.",
              "The track stays on operational process and flow. Clinical safety problems such as medication errors or infection rates are covered in Clinical Governance & Accreditation, which uses some of the same tools for a different purpose.",
              "If you want to practise before you go further, pick one process in a hospital you know, define its start, end and measure, and follow ten cases. The timings you collect are exactly what the first module of the paid track starts from.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Time a discharge",
            instruction:
              "On a 30-bed medical ward, follow ten discharges from the doctor's decision to the patient leaving. For each, record the clock time of every step and whether it was work or waiting. Calculate median lead time and the share that is work time, identify the step with the longest waits, and write one PDSA cycle (change, scope, duration, prediction in numbers) to test on that step. If you cannot access a ward, use this data: decisions at 9:30 to 11:00am, departures 2:45 to 6:10pm, work time 35 to 60 minutes, the longest waits being the discharge summary (median 95 minutes) and the final bill (median 110 minutes).",
          },
        ],
      },
      resources: { tools: ["Process walk sheet", "PDSA log"] },
      questions: [
        mc(
          "A doctor decides at 10:00am that a patient can go home. The patient leaves the ward at 4:00pm. Adding up every step where someone actually did something gives 45 minutes. What are the lead time and the share of it that is work?",
          ["Lead time 45 minutes, of which 100% is work", "Lead time 6 hours, of which about 88% is work", "Lead time 5 hours 15 minutes, of which about 12% is work", "Lead time 6 hours, of which about 12% is work"],
          D,
          "Lead time is the full elapsed time from trigger to output, six hours, and 45 minutes is about 12% of it. Subtracting the work time from lead time gives the waiting, not the lead time.",
        ),
        mc(
          "In an outpatient clinic about 20 patients arrive an hour. Hourly capacity is: registration 60, vital signs 40, consultation 12 (three doctors), pharmacy 30. Where is the bottleneck?",
          ["Registration, because it is the first step every patient passes", "Consultation, which can handle only 12 an hour", "Pharmacy, because it is where patients complain most", "Vital signs, since nurses are shared with the wards"],
          B,
          "The slowest step sets the pace, and consultation can handle 12 an hour against 20 arriving. Pharmacy may attract complaints, but it has capacity of 30 and is waiting on the doctors.",
        ),
        mc(
          "In the same clinic, the manager proposes adding a second registration clerk to cut waiting. What effect will it have on the number of patients seen per hour?",
          ["Little or none, because patients will simply reach the doctors' queue faster", "A large gain, since registration is the first queue every patient meets on arrival", "A gain of about a third, matching the extra clerk's capacity", "A fall, since two clerks will need more supervision"],
          A,
          "Throughput is limited by the bottleneck, consultation, so speeding registration only moves the queue. It feels helpful because the first queue patients see gets shorter.",
        ),
        mc(
          "A medical director asks you to 'fix the lab'. What should you do first?",
          ["Benchmark the lab's turnaround against international standards", "Order a new laboratory information system, since most lab delays come from slow manual reporting of results to the wards", "Agree one process, its start and end points and one measure, such as sample taken to result on the ward", "Interview the lab manager about staff attitudes"],
          C,
          "A complaint becomes fixable once it is a defined process with a measure. Benchmarking or buying a system before you know which process and which delay is the problem is guessing.",
        ),
        mc(
          "Why walk the process yourself rather than rely on the hospital's written procedure?",
          ["Because written procedures in Nigerian hospitals are usually years out of date and rarely match current staffing", "Because the procedure shows how work should run; the waits and workarounds only show in real cases", "Because staff will work faster when they see someone observing them", "Because regulators require an observed process walk"],
          B,
          "The value of going to see is the gap between the official process and the real one. Procedures may well be out of date, but even a current one does not show where the work actually waits.",
        ),
        mc(
          "A ward wants to try preparing an interim bill the evening before each expected discharge. What is the best first test?",
          ["Roll it out to every ward at once, so the effect is large enough to show clearly against last quarter's baseline", "Run it on one ward for three months before measuring anything", "Ask the finance team whether they think it will work", "Run it on one ward for one week with a numerical prediction for median discharge time, then measure and decide"],
          D,
          "A small, short test with a prediction is safe, fast and gives evidence. A hospital-wide rollout risks a large failure and makes it hard to see what caused any change.",
        ),
        mc(
          "After a one-week test, median discharge time fell from 5.5 to 4.8 hours, and the next delay turned out to be take-home medicines waiting at pharmacy. What is the right next step?",
          ["Abandon the change, since it missed the target of under four hours", "Roll the billing change out to all wards and close the project", "Keep the billing change and run the next cycle on the pharmacy delay", "Repeat the same test for another month to confirm the result is not chance"],
          C,
          "The change worked and revealed the next constraint, so adapt and test again where the delay now sits. Rolling out and closing the project ignores the pharmacy wait that will cap any further gain.",
        ),
        mc(
          "You are setting up a session to map the discharge process. Who should be in the room?",
          ["Those who do each step, including porters, cashiers and pharmacy staff, plus someone who can approve changes", "The consultants and the matron, since they are accountable for discharge and know the clinical constraints best", "The finance director alone, because billing is the main delay", "Only the consultant team, to keep the session short and focused"],
          A,
          "The people who do each step know where it waits, and someone with authority keeps good ideas from stalling. Senior clinicians alone will describe how discharge is supposed to work.",
        ),
        ms(
          "Which of these suggest a delay is a process problem rather than one person's performance? Select all that apply.",
          ["The same delay happens on every shift with different staff", "One named nurse arrives late most mornings", "Staff keep private notebooks and phone around the system to get things done", "Delays cluster at handoffs between departments", "A patient complained once about a rude receptionist"],
          [A, C, D],
          "A delay that survives changes of staff, workarounds and handoff delays all point to how the work is designed. One person's lateness or one complaint may be real but are individual matters.",
        ),
        mc(
          "Patients wait about 70 minutes for medicines after their consultation. The pharmacy manager wants a new N15m dispensing system. What should happen first?",
          ["Buy the system, since faster dispensing is clearly needed and the cost is recovered within a year", "Follow and time ten patients from prescription to medicines in hand to find where the wait sits", "Add a second pharmacist and review in three months", "Survey patients about what they would like the pharmacy to change"],
          B,
          "The wait may be at the payment queue or with a porter, not in dispensing, and only timing the real process shows that. Buying the system first risks spending N15m on a step that is not the bottleneck.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "digital-systems-intro",
      name: "Hospital Systems and Data: The Basics",
      description:
        "What systems a hospital runs, why master data decides whether its numbers mean anything, and how to get data out of a hospital system and check it before you use it.",
      estimatedMinutes: 50,
      content: {
        sections: [
          {
            title: "The systems a hospital runs",
            body: p(
              "Even a hospital that says it is 'on a system' is usually running several systems plus paper. Before you use any number from a hospital, find out which system produced it and what else holds the same fact.",
              "The common pieces are these:",
              "- A hospital management information system (HMIS) or electronic medical record (EMR): registration, appointments, clinical notes, orders and admissions\n- Billing and cashiering: charges, deposits, receipts, HMO claims; sometimes part of the HMIS, sometimes separate\n- Laboratory information system (LIS): test requests, results, often linked to analysers\n- Radiology: a radiology information system for requests and reports, and a picture archive (PACS) for images\n- Pharmacy and inventory: stock, dispensing, purchase orders\n- Accounting: the general ledger, payables and receivables, used for the financial statements\n- Human resources and payroll",
              "Around these sit spreadsheets, paper registers and WhatsApp groups. In many Nigerian private hospitals the midnight census lives in a ward book, theatre lists are on a whiteboard and HMO authorisation codes arrive by text message.",
              "Draw a simple map: one box per system, what it records, who enters the data, and how data moves between systems, whether by an interface, a nightly export, or someone retyping it. Mark the source of truth for each important fact. Revenue may be in billing, the accounting ledger and a daily cash report, and the three will not agree exactly. Knowing which one finance treats as final, and why the others differ, is half the battle.",
              "Ask who supports each system and what happens when it fails. A locally hosted system depends on the hospital's server, power and network. A cloud system depends on internet access. Either way, a hospital that loses its system for three hours every week because of power or network failure has a data problem as well as an IT problem, because those three hours are recorded somewhere else or not at all.",
            ),
          },
          {
            title: "Master data decides whether the numbers mean anything",
            body: p(
              "Transactions are only as good as the reference data they point to. Master data is that reference data: the patient list, the price list, the item list, the list of doctors and departments, and the user accounts. When master data is wrong, every report built on it is wrong in the same way.",
              "The patient master is the most common problem. A patient who registers again because the old card is lost, or whose name is spelt differently, gets a second hospital number. Duplicate records split a patient's history across files, so a doctor misses an allergy or a previous result, and they inflate the count of new patients. If a quarterly report shows 2,400 new patients and a check of 200 of them finds 36 who were already registered, about 18% of the 'new' patients are duplicates and the true figure is nearer 1,970.",
              "The price list, or tariff file, is the next. A hospital may have a self-pay price list, a separate tariff for each HMO, NHIA rates and corporate rates. If an HMO tariff is renegotiated and nobody updates the system, every claim goes out at the wrong price, and the error may run for months before a payor queries it. Someone must own each price list, and a change to a contract must trigger a change to the system on a known date.",
              "The item master in pharmacy and stores needs one code per item and a clear unit of issue. If paracetamol is set up both as 'tablet' and as 'packet of 10', stock balances and charges will be wrong.",
              "User accounts are master data too. Every person who uses the system should have their own login with access matched to their role. Shared logins, such as one account for all the nurses on a ward, mean the record cannot show who entered or changed anything.",
              "Data-quality problems are rarely fixed by better software. They are fixed by giving a named person ownership of each master list and checking it regularly.",
            ),
          },
          {
            title: "Getting data out and checking it",
            body: p(
              "Before you ask for an export, write down the question you are answering and the exact fields, period and definitions you need. 'Send me the lab data' produces a large file nobody can use. 'Every inpatient lab request from 1 July to 30 September with request time, sample time, result time, test name and ward' produces an answer.",
              "Ask who owns the data and request it through them. Most systems have standard reports, and a hospital's own IT officer or the vendor can usually run custom extracts. Check what the export actually contains before you start: number of rows, date range, and whether any fields are blank.",
              "Then test the data against a second source before you trust it. Three checks catch most problems.",
              "- Completeness: what share of records have the field filled in? If 40% of registrations have no phone number, the hospital cannot send reminders, chase payments or ask for feedback for those patients.\n- Consistency with another source: lab tests performed in the LIS against lab charges in billing; cash receipts in billing against bank lodgements; admissions in the HMIS against the ward register. If the lab system shows 3,100 tests in a month at an average price of N5,500 (about N17m) and billing shows N14m of lab revenue, about N3m of tests may have been done without being charged. Trace a sample from test to bill to find out.\n- Timeliness and integrity: does the audit log show records entered long after the event, or bills edited after payment? Systems keep an audit log of who changed what and when, and it is the place to look.",
              "Keep a note of every adjustment you make to the data and why. When your figure differs from the hospital's own report, you will need to explain the difference line by line, and the people who run the hospital deserve to see how you got there.",
            ),
          },
          {
            title: "Paper, downtime and the people who enter data",
            body: p(
              "A system is only as complete as the habits of the people using it. In many hospitals the system was installed but adopted only in part, and the data reflects that.",
              "A common pattern is the EMR that holds registration and billing well but clinical notes badly. Doctors still write on paper, and a records clerk later types a summary into the system. The clinical data in the system is then a late, partial copy of the paper notes. Reports on diagnoses, procedures or outcomes from that system need checking against charts before anyone acts on them.",
              "Downtime is another source of gaps. When the system goes down for power or network failure, staff fall back to paper, and those records may never be entered. A hospital should have a written downtime procedure: a paper form for each key process, a rule that downtime records are entered within a set time after the system returns, and a named person who checks that it happens. When you analyse data, look for days or hours with unusually low activity; they are often outages, not quiet periods.",
              "Talk to the people who enter the data. A cashier will tell you which discounts the system cannot record, a nurse will show you the fields she skips because they slow her down, and a records officer will explain why some patients have three numbers. These conversations explain the data faster than any query.",
              "Health data is also sensitive personal data under the Nigeria Data Protection Act 2023, so treat it carefully even at this level. Ask only for the fields you need. Where you do not need to know who the patient is, ask for an extract with a study number in place of names and phone numbers. Keep files on approved, password-protected devices, not personal email or WhatsApp, and delete working copies when the analysis is done. The hospital's wider duties under the Act are a subject of their own.",
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster gives you enough to find your way around a hospital's systems, get data out, check it and handle it responsibly. The paid track, Digital Health & Technology, is for when the question is not 'what does the data say' but 'what system should this hospital have, and how does it run it'. It assumes you have done this module and covers four things this taster does not.",
              "- Implementing a hospital system. Requirements assessment before any purchase, matching the system to clinical complexity, power, connectivity and IT capacity, the phases of implementation from pilot to stabilisation, and the change management that decides whether staff adopt it or go back to paper.\n- Selecting and contracting a system. Writing the requirements, running a fair selection, comparing total cost of ownership rather than licence price, and the contract terms that protect the hospital: service levels, data ownership and export, support and exit.\n- Health data governance under the NDPA. The hospital's own duties as a data controller: lawful basis, consent, access controls, retention, breach handling and dealing with vendors who process patient data on its behalf.\n- Telemedicine and the digital front door. Online booking, virtual consultations, WhatsApp and patient apps designed as part of how care is delivered, with the workflows, staffing and safeguards that make them work.",
              "The track also covers building a digital health roadmap that fits national frameworks and plans for systems to share data from the start.",
              "To prepare, draw the system map for a hospital you know: each system, what it records, who enters data, and how data moves between them. That map is the starting point for the requirements work in the paid track.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Reconcile lab activity to billing",
            instruction:
              "A 100-bed hospital in Owerri gives you two exports for August: the LIS shows 3,480 tests (FBC 1,120, malaria parasite 860, electrolytes 540, LFT 410, others 550), and billing shows lab revenue of N15.2m. The price list gives FBC N4,500, MP N2,500, electrolytes N8,000, LFT N9,500 and an average of N7,000 for others. Estimate expected lab revenue, size the gap, list four possible causes, and design a sample test of 30 records that would tell you which cause dominates.",
          },
          {
            title: "Practice: Duplicate patient check",
            instruction:
              "The registration report shows 3,150 new patients in the last quarter. Design a check to estimate the duplicate rate: what fields you would match on (allowing for spelling variants), how many records you would sample, and how you would confirm a duplicate. If your sample of 250 finds 40 duplicates, estimate the true number of new patients and write three recommendations for the records manager.",
          },
        ],
      },
      resources: { tools: ["System map template", "Data request template", "Data quality checklist"] },
      questions: [
        mc(
          "The system reports 2,400 new patients last quarter. A check of 200 of them finds 36 who were already registered under another number. What is the best estimate of genuinely new patients?",
          ["About 1,970, removing 18% as duplicates", "2,364, removing the 36 duplicates found", "2,400, since duplicates are still patients who attended", "About 2,036, removing 36 per hundred"],
          A,
          "36 of 200 is 18%, so about 18% of all 2,400 are likely duplicates, leaving roughly 1,970. Subtracting only the 36 found treats the sample as if it were the whole list.",
        ),
        mc(
          "The lab system shows 3,100 tests last month at an average price of about N5,500. Billing shows N14m of lab revenue. What does the gap suggest?",
          ["The lab system is overcounting tests and should be ignored", "Prices in the lab system are wrong, so the revenue is right", "About N3m of tests may have been done without being charged; trace a sample from test to bill", "Revenue is fine, since a 20% difference between a clinical system and billing is normal in most hospitals"],
          C,
          "3,100 x N5,500 is about N17m against N14m billed, so roughly N3m is unaccounted for, and tracing a sample shows whether it is unbilled work, discounts or price errors. Assuming the lab system is wrong skips the check that could find lost revenue.",
        ),
        mc(
          "The nurses on Ward 3 all use one login, 'ward3', to enter observations and charges. What is the main problem?",
          ["The licence for extra user accounts would be cheaper", "The system will run slowly with many people working on the same account at once", "The nurses will forget the password more often", "Nobody can tell from the audit log who entered or changed a record"],
          D,
          "Individual logins make records traceable and allow role-based access, which shared accounts destroy. Speed and licence cost are minor next to losing accountability for clinical and billing entries.",
        ),
        mc(
          "An HMO's tariff was renegotiated in March, but claims went out at the old rates until a query in July. What is the root cause?",
          ["The claims officer failed to check each outgoing claim against the signed contract", "Nobody owned the tariff file, so the contract change never reached the system", "The HMO did not send the new tariff in a format the system could import", "The billing software cannot hold more than one tariff per payor"],
          B,
          "This is a master data failure: a price list without an owner and a change process. Blaming the claims officer treats a missing control as one person's slip, and it will happen again with the next contract.",
        ),
        mc(
          "You need data to analyse inpatient lab turnaround times. What should you do before asking the IT officer for an export?",
          ["Write the question, specify the fields, period and definitions, and confirm who owns the data", "Ask for a full export of the lab database so that nothing is missed and you can explore it freely", "Ask the vendor for remote access so you can query the database yourself", "Download whatever standard report the system offers and work from that"],
          A,
          "A precise request gets usable data and respects the data owner. A full database export is hard to use and gives you far more patient data than the question needs.",
        ),
        mc(
          "A hospital's system goes down for about three hours every week because of power and network failures. What is the most important control to have in place?",
          ["A rule that no patient is seen while the system is down", "A second internet provider, which keeps the system running and removes the need for any paper records", "A request to the vendor to refund the hours of downtime", "Paper downtime forms, a deadline for back-entry after recovery, and a named person who checks"],
          D,
          "Outages will happen, so the data risk is records made on paper that never reach the system. A backup connection helps with network failure but not power cuts or server faults, so a downtime procedure is still needed.",
        ),
        mc(
          "An EMR was installed two years ago, but doctors still write notes on paper and a records clerk types summaries into the system later. What does this mean for clinical reports from the EMR?",
          ["They are reliable, since the clerk enters every note", "They are a late, partial copy of the paper notes, so check them against charts before acting on them", "They are unusable and should never be referred to", "They are more accurate than paper, since typed entries are legible"],
          B,
          "Retyped summaries lose detail and lag the real record, so they need checking against the charts. Discarding them entirely throws away data that may be good enough for some uses once checked.",
        ),
        mc(
          "A completeness check finds that 40% of patient registrations have no phone number. What is the most direct business consequence?",
          ["The hospital will fail its next accreditation survey, since contact details are a standard requirement", "The system's reports will run more slowly", "Appointment reminders, payment follow-up and feedback requests cannot reach those patients", "The hospital cannot submit HMO claims for those patients"],
          C,
          "Missing contact details cut off every outbound contact with those patients. HMO claims rely on enrolee numbers and authorisation, not the patient's phone number.",
        ),
        ms(
          "Which checks would help reveal entries that were backdated or altered after the event? Select all that apply.",
          ["Compare the entry time in the audit log with the date of the event recorded", "Count the total number of records in the export", "Review bills edited after payment, by user", "Check whether the dashboard shows green or red for the month", "Look for discounts approved after the patient had left"],
          [A, C, E],
          "The audit log's timestamps, post-payment edits and late discount approvals all expose changes made after the event. A record count or dashboard colour says nothing about when or by whom an entry was made.",
        ),
        mc(
          "To study readmissions, an analyst wants the hospital to email a full list of last year's inpatients with names, phone numbers and diagnoses. What is the better request?",
          ["Ask for the full list but on an encrypted USB stick rather than email, so it cannot be intercepted", "Ask for the list with names but without phone numbers", "Ask for a de-identified extract with a study number, holding only the fields needed", "Ask for the full list and delete it once the project ends"],
          C,
          "Health data is sensitive under the NDPA, so the request should take only what the question needs, and a study number lets readmissions be linked without names. Changing the transfer method still moves identifiable data the analysis does not require.",
        ),
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "turnaround-intro",
      name: "Spotting a Hospital in Trouble",
      description:
        "Read the early signs that a hospital is heading into distress, calculate the few numbers that confirm it, and tell a bad month from a trend.",
      estimatedMinutes: 50,
      content: {
        sections: [
          {
            title: "Trouble shows in cash before it shows in profit",
            body: p(
              "A hospital can report a profit every month and still run out of money. Profit counts revenue when the service is delivered; cash counts it when the money arrives. In a hospital with a large share of HMO, NHIA or corporate patients, the gap between the two can be months.",
              "Picture a 90-bed hospital in Lagos whose management accounts show a profit of N6m a month. Over four months its bank balance has fallen by N20m, and HMO receivables have risen from N40m to N75m. The profit is real on paper, but it is sitting in unpaid claims. Meanwhile salaries, diesel and suppliers must be paid in cash. If you only read the income statement, you will miss the problem until salaries are late.",
              "So look at cash first. The useful measure is days of cash on hand: how many days the hospital could keep paying its normal running costs from the cash it holds today.",
              "- Days cash on hand = cash and bank balances / (monthly operating cash costs / 30)",
              "If the hospital holds N18m and its running costs, mainly salaries, drugs, diesel and rent, are about N54m a month, or N1.8m a day, it has about 10 days of cash. That is a hospital that has to collect money every week to pay its bills. One delayed HMO payment and something does not get paid.",
              "Watch three other cash signals alongside it. Overdraft use that used to be occasional and is now constant. Salary payment dates that slip from the 25th to the 30th to the 5th of the next month. And payments made in part, to suppliers or staff, without anyone announcing it. Each tells you that management is choosing who to pay, which means there is not enough for everyone.",
              "None of this needs access to the hospital's books. Staff, suppliers and doctors who work there will often tell you about late salaries and stretched payments before the board hears about them.",
            ),
          },
          {
            title: "The signs you can see",
            body: p(
              "Financial distress leaves marks all over a hospital, many of them visible on a walk-round or in conversation. On their own, each may have an innocent explanation. Several together, or one getting steadily worse, is a pattern.",
              "- Suppliers move to cash on delivery or stop supplying. Wholesalers extend credit to hospitals that pay; when they demand cash up front, past invoices have usually gone unpaid. Look for stock-outs of routine items and patients sent out to buy drugs.\n- Salaries are late or partial, and senior staff leave. Experienced nurses and doctors have choices, including jobs abroad, and they are the first to go when pay becomes unreliable. A rise in resignations among senior nurses is an early warning.\n- Statutory remittances are not paid. Pension contributions and PAYE deducted from staff pay but not passed on to the pension fund administrator or the tax authority mean the hospital is using staff money to fund operations. It is a legal risk and a sign the cash is gone.\n- Equipment stays broken. An ultrasound machine out of service for months, or air conditioners not repaired, usually means maintenance has been cut to save cash.\n- The generator is switched off to save diesel, or rationed by hours.\n- Patient volumes fall and visiting consultants take their patients elsewhere. Doctors move cases to hospitals where theatre runs on time and fees are paid.\n- Deferred decisions and silence. Board meetings are postponed, management accounts arrive late or not at all, and the same problem appears in the minutes month after month.",
              "The order in which these appear varies, but the pattern is similar. Cash tightens, management delays payments, the people and suppliers who are paid late respond, service quality falls, patients leave and revenue falls further. Recognising the early signs gives the owners a chance to act while there are still options.",
            ),
          },
          {
            title: "Three numbers to work out in an afternoon",
            body: p(
              "Once you suspect a problem, three ratios from the management accounts and the balance sheet will usually confirm or dismiss it. Calculate each for the last twelve months, because the direction of travel matters more than any single figure.",
              "Staff cost ratio is total staff costs, including salaries, allowances, locum and consultant fees, divided by revenue. A hospital with revenue of N80m a month and staff costs of N52m has a staff cost ratio of 65%. If it was 50% a year ago, either revenue has fallen while headcount stayed the same, or pay and headcount have grown faster than income. Either way, there is less left each month for drugs, diesel, maintenance and debt.",
              "Creditor days measures how long the hospital takes to pay its suppliers. Divide trade payables by annual purchases on credit and multiply by 365. With payables of N36m and annual purchases of N146m, creditor days are about 90. If they were 45 a year ago, the hospital is paying suppliers twice as slowly and using them as an unplanned lender. Suppliers notice, and that is when the cash-on-delivery demands begin.",
              "Debtor days does the same for money owed to the hospital. Divide receivables from HMOs and corporates by annual credit revenue from them and multiply by 365. HMO receivables of N60m against annual HMO revenue of N240m give about 91 days. If the contracts say payors should pay within 30 days, the hospital is waiting three times longer than agreed, and that wait has to be funded from somewhere.",
              "Put the three together with days of cash on hand and you have a quick picture. Rising staff cost ratio, rising creditor days, rising debtor days and falling cash is a hospital being squeezed from both sides: costs growing faster than income, and cash arriving later while bills are paid later still.",
              "Use the hospital's own figures, note where each came from, and keep the calculation simple enough that the finance manager can check it.",
            ),
          },
          {
            title: "A bad month or a trend",
            body: p(
              "Every hospital has bad months. Before you call distress, separate a one-off from a trend, because the response to each is different and a false alarm costs credibility.",
              "Compare each figure with the same month last year, not only with the month before. Hospitals have seasons: December and the long holidays reduce elective work, the rainy season brings malaria admissions, and the start of the year sees slow HMO payments while contracts and enrolee lists are renewed. An 18% fall in August revenue may be normal for that hospital or may be new, and only the previous year tells you which.",
              "Then look for one-off causes and test them. A strike, a major HMO holding back a payment pending a dispute, a theatre closed for two weeks for repairs, a key consultant on leave. If the explanation is real, the figures should recover when the cause ends. If management gives a new one-off explanation every month, you are looking at a trend.",
              "The strongest evidence of a trend is several measures moving the wrong way at once over several quarters: staff cost ratio up four quarters running, creditor days rising while revenue is flat, resignations among senior nurses increasing each quarter. One bad indicator can be noise; three moving together rarely are.",
              "What you do with the finding matters as much as the finding. If you are an analyst on an engagement, write a one-page note for your engagement manager before you discuss it with anyone at the hospital: the numbers, their sources, the trend over twelve months and the one-off explanations you have tested. Keep it factual. Distress is sensitive: staff fear for their jobs, suppliers may tighten terms, and a rumour can do real damage. The decision about who at the hospital hears it, and how, belongs to the engagement lead and the client's leadership.",
            ),
          },
          {
            title: "Where this goes next",
            body: p(
              "This taster helps you recognise a hospital in trouble and confirm it with a handful of numbers. Hospital Turnaround & Recovery, the paid track, is about what happens next: assessing the hospital properly, stabilising it, and leading it back to health. It assumes you have done this module and covers four things this taster does not.",
              "- A structured rapid assessment. The CFA Distress Scorecard across liquidity, operations, revenue integrity, cost structure and leadership, and the 10-day assessment that produces a severity rating, quick wins and a stabilisation roadmap the board can authorise.\n- Financial stabilisation. Building and running a 13-week cash flow forecast, the levers that release cash quickly, cutting cost without harming care using a three-tier framework, and recovering revenue already earned.\n- The 24-week turnaround programme. Its four phases, the Turnaround Management Office with delegated authority, and the anchor metrics that show week by week whether the hospital is recovering.\n- People, owners and lenders. Leading staff through salary arrears and headcount reduction lawfully and fairly while keeping the clinicians the hospital cannot lose, and negotiating with owners, banks, lessors and suppliers when the hospital cannot pay everyone.",
              "The paid track works from the signs and ratios in this module. Its first exercise asks you to score a distressed hospital on the Distress Scorecard, using the kind of figures you have learnt to calculate here.",
              "To practise now, take the published or management accounts of any hospital you can access, calculate days of cash on hand, staff cost ratio, creditor days and debtor days for two years, and write five lines on what they tell you. That is the habit every turnaround starts from.",
            ),
          },
        ],
        exercises: [
          {
            title: "Practice: Four numbers, two years",
            instruction:
              "A 70-bed hospital in Abeokuta gives you its figures. Last year: revenue N720m, staff costs N378m, cash at year end N64m, monthly operating cash costs N55m, trade payables N41m on purchases of N250m, HMO receivables N58m on HMO revenue of N310m. This year: revenue N690m, staff costs N448m, cash N14m, monthly operating cash costs N60m, payables N82m on purchases of N245m, HMO receivables N96m on HMO revenue of N320m. Calculate days of cash on hand, staff cost ratio, creditor days and debtor days for both years, and write a one-page note to your engagement manager stating whether this is a trend and why.",
          },
        ],
      },
      resources: { tools: ["Distress early-warning checklist", "Ratio calculator"] },
      questions: [
        mc(
          "A hospital's management accounts show a profit of N6m a month. Over four months its bank balance fell by N20m while HMO receivables rose from N40m to N75m. What is the best reading?",
          ["The accounts are wrong, since a profitable hospital cannot lose cash", "The hospital is healthy, because profit is what matters over a full year and cash timing evens out", "Profit is sitting in HMO receivables that are not turning into cash", "The bank balance has fallen because of seasonal patient volumes"],
          C,
          "Revenue booked but not collected shows as profit while cash drains, and the N35m rise in receivables explains the fall. Trusting the profit line alone is exactly how distress is missed until salaries are late.",
        ),
        mc(
          "A hospital holds N18m in cash and bank. Its operating cash costs are about N54m a month. About how many days of cash does it have?",
          ["About 10 days", "Roughly 30 days", "About 3 days", "Roughly 33 days"],
          A,
          "Daily costs are N54m / 30 = N1.8m, and N18m / N1.8m is 10 days. Dividing N54m by N18m gives 3, a ratio of cost to cash rather than a number of days.",
        ),
        mc(
          "A hospital's monthly revenue is N80m and staff costs are N52m. A year ago the ratio was 50%. What is the staff cost ratio now and what has happened?",
          ["54%, a small rise within normal variation", "65%, up 15 percentage points in a year", "154%, so staff costs exceed revenue", "65%, which is healthy for a hospital with a large nursing staff"],
          B,
          "52 / 80 is 65%, fifteen points above last year, leaving far less for every other cost. Calling it healthy ignores the direction of travel, which is the point of the measure.",
        ),
        mc(
          "Trade payables are N36m and annual purchases on credit are N146m. A year ago creditor days were 45. What do the numbers say?",
          ["About 25 days, so suppliers are now being paid faster than before and relations with them should improve", "About 45 days, unchanged from last year", "About 4 days, a sign of very strong supplier terms", "About 90 days, so suppliers are being paid twice as slowly and are acting as unplanned lenders"],
          D,
          "36 / 146 x 365 is about 90 days, double last year's 45. Dividing purchases by payables and getting about 4 is the common slip.",
        ),
        mc(
          "Which of these findings is the most urgent sign of distress?",
          ["Occupancy dipped in December", "The marketing budget was cut by 20%", "One visiting consultant moved to another hospital", "Pension contributions and PAYE deducted from staff pay have not been remitted for three months"],
          D,
          "Unremitted deductions mean the hospital is spending staff money to stay open, which carries legal exposure and shows the cash has run out. A December dip is seasonal and a budget cut can be a sensible decision.",
        ),
        mc(
          "Revenue fell 18% in August against July. What should you do before raising concern?",
          ["Escalate it to the managing director immediately, since an 18% fall in one month is serious whatever the cause", "Compare it with August last year and the 12-month trend, and test one-offs such as a held-back HMO payment", "Wait three more months to see whether it recovers", "Ask the finance manager to restate July so the comparison is fairer"],
          B,
          "Seasonality and one-offs explain many single bad months, so the year-on-year comparison and tested explanations tell you whether this is a trend. Escalating without that risks a false alarm and lost credibility.",
        ),
        mc(
          "You are an analyst on an engagement and your figures show a steady 12-month decline at the client hospital. What should you do?",
          ["Write a one-page note of numbers, sources, trend and tested explanations for your engagement manager first", "Tell the hospital's finance manager first, since they will know the explanation and can correct any errors in your data", "Raise it at the next staff meeting so everyone can help", "Email the hospital's board chair so the owners hear early"],
          A,
          "Distress findings are sensitive, and who hears them and how is a decision for the engagement lead and client leadership. Going straight to the finance manager may feel collaborative but bypasses that decision and risks the finding spreading before it is handled.",
        ),
        mc(
          "A doctor tells you that suppliers to a hospital now insist on cash on delivery. What does this most likely mean?",
          ["The suppliers are short of cash themselves and are asking all their customers to pay up front", "The hospital has negotiated better prices for cash payment", "Suppliers have stopped extending credit, usually because past invoices went unpaid", "The hospital has switched to a new procurement policy"],
          C,
          "Suppliers withdraw credit from customers who pay late, so cash on delivery usually follows rising creditor days. A supplier's own cash position is possible but would affect all its customers, not one hospital.",
        ),
        ms(
          "Which of these point to a trend rather than a one-off? Select all that apply.",
          ["The staff cost ratio has risen for four quarters in a row", "Deliveries fell for one month after a public holiday", "Creditor days are rising while revenue is flat", "Resignations among senior nurses have increased every quarter this year", "A single large repair bill for the CT scanner"],
          [A, C, D],
          "Sustained movement over several quarters and several measures moving together are the marks of a trend. A holiday dip or one large bill are classic one-offs.",
        ),
        mc(
          "HMO receivables are N60m against annual HMO revenue of N240m. HMO contracts say claims should be paid within 30 days. What follows?",
          ["Debtor days are about 25, so HMOs are paying within terms", "Debtor days are about 4, so collections are excellent", "Debtor days cannot be calculated without the claim-by-claim ageing report from the billing system", "Debtor days are about 91, so HMOs are taking three times as long to pay as the contracts allow"],
          D,
          "60 / 240 x 365 is about 91 days against 30 agreed, a gap the hospital must fund. An ageing report adds detail, but the ratio is enough to show the problem.",
        ),
      ],
    },
  ],
};

export default expansion;
