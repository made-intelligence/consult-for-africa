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
  slug: "digital-health-technology",

  topUp: [
    {
      moduleSlug: "his-emr-implementation",
      questions: [
        mc(
          `A 150-bed hospital in Ibadan has grid power for about 9 hours a day and a single 20 Mbps internet link. A vendor proposes a cloud-only EMR. What should happen before any procurement decision?`,
          "b",
          [
            `Accept it, since cloud hosting removes server costs`,
            `Assess power, connectivity and offline needs, and price backup power and internet`,
            `Insist on an on-premise system, since cloud systems cannot work reliably on Nigerian connectivity`,
            `Let the vendor confirm whether its system will work on site`,
          ],
          `Requirements assessment covers the power and connectivity a system depends on, and the cost of making them reliable belongs in the comparison. Ruling cloud out entirely is the opposite mistake: many Nigerian hospitals run cloud systems well once backup links and power are in place.`,
        ),
        mc(
          `To meet a board deadline, the CEO of a 140-bed hospital wants all nine departments to go live on the new EMR on one day, with no pilot. What is the main risk?`,
          "d",
          [
            `None, provided every member of staff has been trained`,
            `Higher licence costs because more users go live at once`,
            `Data migration errors, since pilots are mainly for testing migration`,
            `Problems surface everywhere at once, often taking months to fix and pushing staff back to paper`,
          ],
          `A pilot finds workflow and configuration problems in one area where they can be fixed quickly; skipping it exposes the whole hospital at once. Training is necessary but cannot reveal the configuration gaps that only real patients and real shifts expose.`,
        ),
        mc(
          `Three months after go-live, nurses on two wards chart on paper and a clerk types the notes into the EMR each night. What does this indicate?`,
          "a",
          [
            `An adoption failure that doubles work and breaks real-time records`,
            `A sensible hybrid arrangement worth keeping for the long term`,
            `A technical fault in the EMR's nursing module`,
            `A staffing gap that hiring a second night clerk for the two wards would close`,
          ],
          `Parallel paper means clinicians do not trust or cannot use the system at the bedside, so the record is hours late and the work is done twice. Calling it a workable hybrid is tempting because the data does reach the EMR, but decisions made during the shift are made without it.`,
        ),
        mc(
          `Who are the best super-users for an EMR rollout on the wards?`,
          "c",
          [
            `IT officers from the vendor and the hospital, who understand the system best and can fix faults`,
            `The most senior consultants, who carry the most authority`,
            `Respected frontline nurses and doctors on each shift, given extra training and time`,
            `Newly qualified staff, who have no paper habits to unlearn`,
          ],
          `Super-users must be on the ward on every shift and trusted by colleagues, which is why respected frontline clinicians work best. IT officers know the software but are not present at the bedside when a nurse is stuck at 2:00.`,
        ),
        mc(
          `A pilot ward has run on the new EMR for six weeks. Which evidence best supports the go decision to extend to the next three wards?`,
          "b",
          [
            `The vendor's project manager confirms in writing that the software is ready for wider use`,
            `The ward does its key tasks in the system, issues are under control, staff trained`,
            `The CEO wants the rollout to stay on the original timetable`,
            `The full licence fee has already been paid to the vendor`,
          ],
          `Go and no-go criteria should be met by evidence from the pilot itself: real use, a controlled issues log and trained users. Vendor readiness matters, but the vendor is not the party that has to work with the system on the ward.`,
        ),
      ],
    },
    {
      moduleSlug: "digital-health-strategy",
      questions: [
        mc(
          `A five-hospital group in South-West Nigeria runs separate billing, laboratory and EMR systems at each site, with no shared patient identifier. What is the first architecture priority?`,
          "c",
          [
            `A group analytics dashboard for the board`,
            `Replacing every system at all five hospitals with a single vendor's integrated suite`,
            `A shared patient identifier and integration on open standards such as HL7 FHIR`,
            `A patient-facing mobile app for appointment booking`,
          ],
          `Without a shared identifier and an integration approach, no data can be joined across sites, so dashboards and apps sit on fragments. Replacing everything with one suite is the expensive shortcut, and it still leaves the group exposed when it acquires a hospital on another system.`,
        ),
        mc(
          `A group CEO's list holds 14 digital projects for next year, with budget and management capacity for about three. What is the right roadmap step?`,
          "a",
          [
            `Rank the use cases by impact and readiness and fund the top two or three`,
            `Start all 14 projects on a small scale so that every sponsor stays engaged`,
            `Choose the three cheapest projects to stretch the budget`,
            `Let each hospital pick its own priority project`,
          ],
          `Priority use-case definition concentrates money and attention where impact and readiness are highest. Starting all 14 small is the political temptation, and it usually leaves 14 half-finished systems.`,
        ),
        mc(
          `A state ministry of health is building a state health information exchange. A private hospital network in that state is planning its integration layer. What should you advise?`,
          "d",
          [
            `Ignore government standards, which change too often to follow`,
            `Pause all digital investment until the exchange is complete`,
            `Build a proprietary data format that suits the network's own systems and vendors best`,
            `Design to the national and state standards so it can connect later without rework`,
          ],
          `Aligning with national and state standards avoids interoperability debt and makes later connection cheap. Waiting for the exchange is the cautious-sounding error: it delays benefits for years when building to the standard already secures compatibility.`,
        ),
        mc(
          `Each hospital in a group buys its own software, and the group now runs three different pharmacy systems. What should the roadmap put in place?`,
          "b",
          [
            `A ban on any new software purchases for two years`,
            `A group digital governance body that sets standards, approves purchases and manages vendors`,
            `A rule that the cheapest quote always wins`,
            `Outsourcing all IT to a single managed service provider`,
          ],
          `The governance model defines who decides on systems and vendors, which is what was missing. Outsourcing IT changes who runs the systems but not who decides what is bought, so the fragmentation would continue.`,
        ),
        mc(
          `A newly appointed group IT director cannot say which systems run at which sites or how data moves between them. What is the first step of the roadmap?`,
          "c",
          [
            `Issue a request for proposals to EMR vendors`,
            `Design the target architecture`,
            `Inventory systems, data flows, connectivity and governance gaps across sites`,
            `Prepare the five-year investment plan so the board can approve a budget early`,
          ],
          `The current-state assessment comes first because every later step depends on knowing what exists. Designing the target architecture first is tempting for a technical lead, but it risks designing around systems and constraints nobody has checked.`,
        ),
      ],
    },
  ],

  modules: [
    // ─────────────────────────────────────────────────────────────────────
    {
      slug: "his-selection-contracting",
      name: "Selecting and Contracting a Hospital System",
      description:
        "Run a hospital information system selection that tests vendors against the hospital's own needs, compares five-year cost, and signs a contract that ties payment to working software and keeps the hospital in control of its data.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Turn requirements into a scored evaluation",
            body: p(
              `Fix the scoring before you see any vendor, so the decision is judged against the hospital's needs and not against the most impressive demonstration. Once a panel has seen a polished patient app, it tends to weight patient apps heavily, whatever the requirements said.`,
              `Split the requirements in two. Must-haves are pass or fail: a vendor that misses one is out, however good the rest. For a typical Nigerian private hospital these include:`,
              `- Keeps working through power or internet interruptions, and synchronises afterwards\n- Produces claims in the formats the hospital's main HMOs accept, and supports NHIA reporting\n- Role-based access and an audit trail showing who viewed or changed each record\n- Full data export in a documented, standard format\n- Support staff in Nigeria during the hours the hospital runs`,
              `Everything else is weighted. One reasonable split is functional fit 35%, usability 15%, integration 15%, vendor strength and support 15%, and five-year cost 20%. Functional fit is scored module by module: registration, billing and claims, pharmacy and stores, laboratory, inpatient and nursing, theatre, reporting. Integration covers laboratory analysers, imaging, accounting software and payment gateways.`,
              `Run the process in stages. A long list of six to eight vendors gets a short request for information. Three are shortlisted on the must-haves and a rough cost. The shortlist receives the full requirements and scripted scenarios, demonstrates, and is visited at reference sites.`,
              `Score with a panel of five to seven people who will use the system: a records officer, a billing officer, a nurse, a doctor, a pharmacist, the finance manager and an IT lead. Each scores alone, then the panel compares and discusses large differences before averaging. Independent scoring stops the most senior voice in the room from setting everyone's marks. Record the scores and the reasons; if the decision is challenged later, or a vendor complains, the record shows how it was made.`,
            ),
          },
          {
            title: "Demonstrations and reference checks that show the truth",
            body: p(
              `A vendor's standard demonstration shows what the system does best. A scripted demonstration shows whether it does what the hospital needs. Write five to eight scenarios from your own busiest and most error-prone work and send them two weeks ahead. For example: an HMO enrollee arrives for a consultation with an authorisation code; the doctor orders a laboratory test and an MRI that needs a second authorisation; the patient pays a co-payment; the claim is generated and exported in the HMO's format.`,
              `Run each scenario live, on the vendor's system, not on slides. Better still, ask for a sandbox and have your own staff drive the keyboard after a short orientation. Time the high-volume tasks. If registering a returning patient takes four minutes and the front desk registers 200 a day, the system has added more than 13 staff-hours of work a day.`,
              `Reference sites tell you what the contract will not. Visit at least two Nigerian sites of similar size running the same version of the product. Speak to users without the vendor in the room. Ask:\n- How often is the system down, and how long do faults take to fix?\n- What do you still do on paper, and why?\n- What did go-live cost you beyond the contract?\n- Would you choose this vendor again?`,
              `Ask the vendor for its full client list, including clients who have left, and call one who left. Vendors choose their happiest client as the reference; the client who left tells you how the vendor behaves when things go wrong.`,
              `Check the company as well as the product. How long has it traded in Nigeria? How many support and implementation staff does it employ here? Is it the developer or a reseller? A reseller can be a good partner, but confirm its rights to support and configure the product, and what happens to your support if its agreement with the developer ends.`,
            ),
          },
          {
            title: "Total cost of ownership over five years",
            body: p(
              `Compare vendors on the five-year cost of owning and running the system, not on the licence price. The licence is often less than half the total, and the cheapest licence is frequently the most expensive system to run.`,
              `List every cost line for each vendor:\n- Licence or subscription: a perpetual licence plus annual support, or a subscription charged per bed, per user or per facility\n- Implementation: configuration, data migration, training and go-live support\n- Hardware: servers if on-premise, workstations, printers, barcode scanners, tablets, network cabling and wifi\n- Power: UPS, inverters or solar for the server room and network cabinets, and the diesel hours to run them\n- Connectivity: a primary and a backup internet link, essential for cloud systems\n- Integration: interfaces to analysers, imaging and accounting\n- Internal staff: IT officers, and backfill for super-users while they train\n- Changes: customisation and later change requests at the vendor's day rate`,
              `Consider a 120-bed hospital comparing two options. Vendor A is on-premise: a perpetual licence, servers and power upgrades and implementation together cost N75m up front, then annual support and two IT officers cost about N18.6m a year. Vendor B is cloud: N8m up front for implementation, then the subscription, two internet links and one IT officer cost about N22.8m a year. Over five years, A costs about N168m and B about N122m, although B's yearly cost is higher.`,
              `Then test the comparison. Does the subscription rise each year, and by how much? Is the price set in US dollars, and at what exchange rate will it be converted? What happens to cost if the hospital adds 40 beds or opens a second site? Run the five-year totals again under a weaker naira and with growth. The ranking sometimes changes, and a board should know that before it signs.`,
            ),
          },
          {
            title: "Contract terms that protect the hospital",
            body: p(
              `The contract should make payment depend on working software and keep the hospital in control of its data. Vendors offer their standard terms first; most will negotiate.`,
              `Start with a statement of work that names the modules, interfaces, data to be migrated, training days and deliverables. Anything not written there will later arrive as a change request.`,
              `Tie payment to milestones the hospital accepts. A common shape is a modest payment on signing, a larger one when the configured system passes user acceptance testing, another at go-live, and the last after an agreed stable period. Write acceptance criteria in advance: the scripted scenarios run without error, screens respond within agreed times, and migrated data reconciles to the old system's totals.`,
              `Service levels need definitions. For a cloud system, set a monthly uptime target, because an annual figure can hide one disastrous week. Define severity levels, with response and resolution times for each, and service credits when they are missed. Hospitals run every night and weekend, so support hours must cover them, at least for faults that stop clinical work.`,
              `The data clauses matter most at the end of the relationship:\n- The hospital owns all its data\n- The vendor will export the complete data in a documented, standard format on request and on exit, at no cost or a capped cost\n- The vendor gives transition help to a successor and certifies deletion afterwards\n- A data processing agreement sets out the vendor's duties as a processor under the NDPA: acting only on the hospital's instructions, security, confidentiality, approved sub-processors, prompt breach notice and where data is hosted`,
              `For an on-premise system from a small vendor, consider source code escrow, so the hospital can keep the system running if the vendor fails. Cap annual price increases, define the exchange-rate rule for any dollar pricing, fix the day rate for change requests, and name the key people the vendor will assign to the implementation.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Compare two bids on five-year cost",
            instruction: `A 120-bed hospital in Port Harcourt, 55% of whose patients are HMO enrollees, has two bids. Vendor A (on-premise): licence N45m, servers and power N18m, implementation N12m, annual support N9m, two IT officers at N4.8m each a year. Vendor B (cloud): implementation N8m, subscription N1.1m a month rising 10% a year, primary and backup internet N4.8m a year, one IT officer at N4.8m a year. Build a five-year cost table for each, then rerun it assuming the hospital opens a 40-bed annexe in year 3 (A needs N6m more hardware; B's subscription rises by a third). State which bid you would recommend, the two assumptions that most affect the answer, and three contract terms you would insist on whichever vendor wins.`,
          },
          {
            title: "Write the demonstration scripts",
            instruction: `For the same hospital, write five scripted scenarios to send to the shortlisted vendors. Cover at least: an HMO patient needing a second authorisation during the visit, a self-pay inpatient with a deposit and a final bill, a theatre case with consumables charged to the bill, a pharmacy stock-out and transfer between stores, and the monthly claims export. For each, list the steps the vendor must show live and the two things your panel will score.`,
          },
        ],
      },
      resources: { tools: ["HIS Requirements Template", "Vendor Scoring Matrix", "Five-Year TCO Model", "Contract Clause Checklist"] },
      questions: [
        mc(
          `A hospital's IT head proposes to watch three vendor demonstrations first and then agree the scoring criteria. What is the problem?`,
          "c",
          [
            `Demonstrations take too long to schedule before scoring`,
            `Scoring criteria should come from the vendors' own materials, since they know the product`,
            `Criteria set after demos tend to reward what impressed, not what the hospital needs`,
            `Formal scoring is unnecessary if the CEO attends the demonstrations`,
          ],
          `Fixing criteria first anchors the evaluation to the hospital's requirements before any vendor has shaped the panel's view. Taking criteria from vendor materials is the same error in another form: the vendor will define success around its own strengths.`,
        ),
        mc(
          `Vendor A costs N60m up front and then N15m a year. Vendor B costs N10m up front and then N22m a year. Over five years, which is cheaper?`,
          "a",
          [`Vendor B, by about N15m`, `Vendor A, because its yearly cost is lower`, `They cost the same`, `Vendor A, by about N15m`],
          `Five years of A is N135m and of B is N120m, so B is cheaper despite the higher yearly charge. Judging on the yearly figure alone ignores A's large up-front cost.`,
        ),
        mc(
          `What is the best way to test a vendor's HMO claims handling during selection?`,
          "d",
          [
            `Ask the vendor to present its claims module on slides`,
            `Ask how many HMOs its existing clients bill through the system each month`,
            `Accept the vendor's standard demonstration script`,
            `Have your billing officer run your own HMO scenario live in a sandbox`,
          ],
          `A live run of the hospital's own scenario by its own staff shows how the system handles real cases and how usable it is. The vendor's standard script is built to show strengths and will avoid the awkward second-authorisation case.`,
        ),
        mc(
          `A vendor offers as its reference a 400-bed hospital in Abuja, with a call to that hospital's head of IT that the vendor will join. How should you improve this?`,
          "b",
          [
            `Ask the reference hospital for a written testimonial instead`,
            `Visit a site of similar size on the same version and speak to users without the vendor`,
            `Accept it, since a larger hospital is stronger proof`,
            `Ask the vendor for its overall customer satisfaction score`,
          ],
          `A comparable site on the same version, with frontline users speaking freely, shows how the system will behave for you. A larger hospital seems stronger proof, but it may run a different version with a dedicated IT team your client does not have.`,
        ),
        mc(
          `A vendor asks for 70% of the contract value on signing. What is the best counter?`,
          "c",
          [
            `Agree, in return for a 10% discount on the total`,
            `Offer to pay the full contract amount in one sum only after the system has gone live`,
            `Tie most payment to acceptance: tested configuration, go-live and a stable period`,
            `Pay equal monthly instalments regardless of progress`,
          ],
          `Milestone payments tied to acceptance keep the vendor motivated until the system works. Paying everything after go-live is rarely accepted by vendors and leaves no reward for the earlier phases, so it tends to stall the negotiation rather than protect the hospital.`,
        ),
        mc(
          `Which clause matters most if the hospital wants to change vendor in five years' time?`,
          "a",
          [
            `Full export of all data in a documented format, with transition help`,
            `A 10% discount on renewal of the subscription`,
            `Free training for all new clinical and admin staff throughout the contract`,
            `Priority access to the vendor's new product releases`,
          ],
          `Without a usable export of the complete data, switching vendors means losing or re-entering years of patient records, which locks the hospital in. Renewal discounts are attractive but make it cheaper to stay, not possible to leave.`,
        ),
        mc(
          `A cloud contract promises 99% uptime measured over a year. Why should the hospital push for monthly measurement and severity-based response times?`,
          "d",
          [
            `Monthly measurement is cheaper for the vendor to report`,
            `Annual uptime measures are not enforceable under Nigerian contract law, so only a monthly one can support a claim`,
            `Uptime matters little for a cloud system with good backups`,
            `A yearly 99% allows over 80 hours down, possibly in one bad week, and says nothing about fix times`,
          ],
          `One per cent of a year is about 87 hours, which could fall in a single week of clinical disruption while the annual target is still met. The claim about enforceability is invented; the real issue is that an annual average hides concentrated outages.`,
        ),
        mc(
          `A licence is priced in US dollars and payable in naira. What should the contract settle?`,
          "b",
          [
            `Nothing, because exchange-rate risk always falls on the vendor that quoted in dollars`,
            `Which exchange rate applies, on what date, and a cap on annual increases`,
            `That every payment is made in cash at the vendor's office`,
            `That the hospital pays in dollars from a domiciliary account`,
          ],
          `An undefined conversion rule leaves the hospital exposed to whatever rate the vendor chooses at each invoice. Assuming the vendor carries the risk is the common mistake; unless the contract says so, the price simply moves with the naira.`,
        ),
        ms(
          `Which are pass or fail must-haves for a 100-bed Lagos hospital with 55% HMO patients and unreliable grid power? Select all that apply.`,
          ["a", "b", "d"],
          [
            `Claims output in the formats its main HMOs accept`,
            `Keeps working through power or internet interruptions and synchronises afterwards`,
            `A patient-facing mobile app built into the system`,
            `Role-based access with an audit trail of who viewed each record`,
            `A vendor head office in Lagos`,
          ],
          `Claims output, resilience to interruptions and access control are conditions the hospital cannot operate or comply without. A patient app is a weighted nice-to-have, and a Lagos head office matters less than local support capacity, which is assessed separately.`,
        ),
        mc(
          `A shortlisted vendor is a Lagos reseller of software developed abroad. What extra check matters most?`,
          "c",
          [
            `Whether its office is in a prime business district`,
            `How large its social media following is`,
            `Its rights to support the product, and your support if the reseller agreement ends`,
            `Whether it has won national industry awards for hospital software in the last three years`,
          ],
          `A reseller depends on its agreement with the developer, so the hospital needs to know who supports and updates the system if that agreement lapses. Awards and offices say something about marketing, not about continuity of support.`,
        ),
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      slug: "health-data-governance",
      name: "Health Data Governance under the NDPA",
      description:
        "What a hospital must do as a data controller under the Nigeria Data Protection Act 2023: lawful bases, records of processing, security and processors, patients' rights and breach response.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "What the NDPA asks of a hospital",
            body: p(
              `A hospital is a data controller for its patients' and staff's personal data, health data is sensitive personal data, and the Nigeria Data Protection Act 2023 makes the institution accountable for how that data is handled. When a records officer leaks a file, the officer may face discipline, but the hospital answers to the regulator and to the patient.`,
              `The NDPA replaced the earlier NDPR as the main law and created the Nigeria Data Protection Commission (NDPC) to enforce it. It sets principles every controller must follow:\n- Process lawfully, fairly and transparently\n- Collect for specified purposes and not reuse data for incompatible ones\n- Collect only what is adequate and necessary\n- Keep data accurate\n- Keep it no longer than needed\n- Keep it secure, confidential and available\n- Be able to demonstrate compliance`,
              `The last principle, accountability, is the one hospitals miss. Good intentions are not evidence. The hospital needs records, policies, contracts and logs that show compliance when the Commission asks.`,
              `Health, genetic and biometric data fall in the sensitive category. The Act allows sensitive data to be processed only on narrower grounds than ordinary data, such as explicit consent or where processing is needed for medical care by or under a professional bound by confidentiality. The National Health Act 2014 and the professional codes of the MDCN and NMCN add their own duties of confidentiality on top.`,
              `The Act also creates a class of data controllers of major importance, designated by the Commission according to the volume and kind of data processed. A hospital holding records for tens of thousands of patients should assume it may qualify and check the Commission's current thresholds and directives. Such controllers must register with the Commission, designate a data protection officer and file periodic compliance returns, usually prepared with a licensed data protection compliance organisation.`,
              `The Commission can investigate, order a controller to put things right and impose fines scaled to annual gross revenue, with a higher ceiling for controllers of major importance. For a hospital, the loss of patient trust after a leaked record is often the larger cost.`,
            ),
          },
          {
            title: "Know what data you hold and why",
            body: p(
              `Governance starts with a record of processing: every set of personal data the hospital holds, why, on what lawful basis, who receives it, where it is stored and how long it is kept. Without it, nobody can answer the Commission, a patient or the board.`,
              `A typical private hospital's list runs to 15 or 20 entries: registration details, clinical records on paper and in the EMR, laboratory and imaging results, billing and HMO claims, NHIA returns, staff HR and payroll files, CCTV footage, biometric clock-in, marketing contact lists, WhatsApp groups, telemedicine recordings and research data sets.`,
              `Match each to a lawful basis. Delivering care relies on the medical-purposes ground. Sending claims to an HMO rests on the contract and the patient's enrolment. Reporting notifiable diseases to public health authorities is a legal obligation. Marketing, publicity photographs and most research need consent. Consent is not the answer to everything: if the hospital rests clinical records on consent, a patient who withdraws it leaves the hospital unable to keep notes it must keep. For marketing, by contrast, consent is required, must be specific and separate from consent to treatment, and must be as easy to withdraw as to give.`,
              `Minimise what leaves the building. An HMO needs enough to adjudicate a claim, which is usually the encounter summary, codes and the authorisation reference, not the whole folder. Full notes go only for a specific case under review, where the contract provides for it.`,
              `Set a retention schedule per record type, with the clinical and legal reasons for each period. Professional guidance and legal limitation periods set long minimums for clinical records; check the current requirements for each record type rather than relying on custom. Many other data sets, such as CCTV and marketing lists, should be kept for a short, defined time and then deleted.`,
              `Before any new processing likely to carry high risk, carry out a data protection impact assessment: a new EMR, video consultations, CCTV in clinical areas, biometric attendance or a data-sharing partnership. It records the risks and the safeguards before launch, when changes are still cheap.`,
            ),
          },
          {
            title: "Security, access and processors",
            body: p(
              `Most hospital data incidents come from ordinary access failures, not skilled attackers. Shared logins at the nurses' station. Accounts of staff who left months ago still active. Wound photographs and results sitting on personal phones in WhatsApp groups. Folders left on corridor trolleys. An unencrypted laptop stolen from a car. Ransomware arriving through an email attachment.`,
              `The controls that address these are organisational as much as technical:\n- Unique logins and role-based access, so a cashier sees billing data, not clinical notes\n- A joiners, movers and leavers process tied to HR, with access removed within a day of exit and a monthly reconciliation of accounts against the staff list\n- Regular review of the audit trail, especially for records of staff, public figures and other sensitive patients\n- Encryption on laptops and portable media\n- Backups that are tested by actually restoring them, with one copy offline\n- A clinical messaging policy naming the approved channels, and covering consent for images, storage and deletion\n- Physical security for records rooms, with a sign-out register for paper files`,
              `Much of the hospital's data is handled by processors: the HIS vendor, the cloud host, an outsourced laboratory, IT support contractors, a transcription service, a marketing agency. The NDPA requires a written contract with each processor that binds it to act only on the hospital's instructions, keep the data confidential and secure, use sub-processors only with the hospital's authorisation, help with patients' requests and breaches, and return or delete data at the end. An HMO receiving claims is usually a controller in its own right, with its own duties, rather than the hospital's processor.`,
              `Data hosted outside Nigeria is a cross-border transfer. The Act permits it where the destination offers adequate protection or another basis in the Act applies, such as appropriate contractual safeguards. The hospital should know where each system's data sits, document the basis for each transfer, and check the Commission's current guidance, because this area is still being filled in by directives.`,
            ),
          },
          {
            title: "Patients' rights and breaches",
            body: p(
              `The hospital needs a working process, with named owners and time limits, for requests from patients and for data breaches. A policy document without a process behind it fails on the first real request.`,
              `Patients have the right to be informed, through a privacy notice at registration and on the website, and rights to access a copy of their data, to have it corrected, to object to processing such as marketing, to restrict processing in some cases, to data portability, to erasure in limited cases, and not to be subject to decisions made solely by automated means with significant effect on them.`,
              `Run requests through one intake, normally the data protection officer. Verify identity, log the request, involve the clinician where clinical records are concerned, and respond in writing within the time the Act and the Commission's guidance allow. A request from a relative needs evidence of authority. An erasure request for clinical notes usually ends with an explanation that the records must be kept for care and legal reasons, plus erasure or restriction of anything not needed, such as marketing data.`,
              `A personal data breach is a security incident leading to accidental or unlawful destruction, loss, alteration, disclosure of or access to personal data. A photograph of an admissions list posted to a staff WhatsApp group is a breach, as is ransomware on the laboratory server.`,
              `Where a breach is likely to result in a risk to individuals' rights and freedoms, the NDPA requires the controller to notify the Commission within 72 hours of becoming aware of it, and to inform affected patients without undue delay where the risk is high. Processors must tell the hospital without undue delay. The clock starts at awareness, not at the end of the investigation, so notify with what is known and update later.`,
              `A breach plan names who triages, the containment steps, how evidence is preserved, how risk is assessed, and who approves the notice to the Commission and the letters to patients. Keep a register of every breach, including those judged not reportable, with the reasoning. Rehearse the plan once a year with a realistic scenario; the first time the team uses it should not be a Friday evening with a real leak.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Build the record of processing",
            instruction: `Meridian Specialist Hospital, Abuja, has 140 beds and about 38,000 registered patients. It runs a cloud EMR hosted in Europe, bills four HMOs and NHIA enrollees, has CCTV in public areas and one ward corridor, uses biometric clock-in for 260 staff, and keeps a WhatsApp broadcast list of 9,000 patient numbers collected at registration. Build a record of processing for six data sets: for each give the purpose, lawful basis, recipients, processors, storage location, any cross-border transfer and its basis, and retention period with the reason. Then list the five largest gaps you would raise with the medical director, in order of risk.`,
          },
          {
            title: "Run a breach response",
            instruction: `At 18:00 on a Friday, the director of nursing at the same hospital learns that a photograph of the day's admissions list, showing 31 patients' names, ages, wards and diagnoses, was posted to a staff WhatsApp group with 240 members. Write the response timeline from that moment to 72 hours: containment, who is told and when, the risk assessment, the decision on notifying the NDPC and the patients, and the record kept. Then name two changes to policy or systems that would make a repeat less likely.`,
          },
        ],
      },
      resources: { tools: ["Record of Processing Template", "DPIA Template", "Breach Response Checklist", "Processor Contract Checklist"] },
      questions: [
        mc(
          `A records officer at a private hospital in Lagos shares a well-known patient's file with a journalist. Who is accountable to the NDPC for the breach?`,
          "b",
          [
            `Only the records officer, who acted alone and against the hospital's written policy`,
            `The hospital as data controller, though the officer may also face discipline`,
            `The HIS vendor whose system held the file`,
            `The patient's HMO, which also holds her data`,
          ],
          `The NDPA places accountability on the controller, which must show it had adequate controls; individual staff may face separate consequences. Blaming only the officer is the instinctive response, but the regulator will ask what the hospital did to prevent and detect the leak.`,
        ),
        mc(
          `At 09:00 on Monday, IT confirms that ransomware has encrypted the laboratory server holding 12,000 patients' results, and data may have been copied out. By when should the hospital notify the NDPC?`,
          "d",
          [
            `Once the forensic report is complete, however long it takes`,
            `Within 30 days, after patients have been contacted`,
            `Only if affected patients complain`,
            `By 09:00 on Thursday, within 72 hours of becoming aware`,
          ],
          `The Act requires notification within 72 hours of becoming aware of a breach likely to put individuals at risk, and possible exfiltration of health data clearly qualifies. Waiting for the forensic report is the tempting error: the hospital should notify with what it knows and update as the investigation proceeds.`,
        ),
        mc(
          `An HMO asks a hospital for the complete case folders of all 300 outpatient claims it submitted last month. What is the right response?`,
          "a",
          [
            `Send what each claim needs, and full notes only for specific cases under review`,
            `Send all 300 folders, since the HMO is paying for the care`,
            `Refuse to send anything, since health data cannot be shared`,
            `Ask each of the 300 patients for fresh written consent before sending any claim data`,
          ],
          `Data minimisation means sharing what the purpose requires, which for adjudication is usually the encounter summary and codes, with full notes only where a specific case is disputed under the contract. Seeking fresh consent sounds careful, but claims already rest on the contract and enrolment, and consent would not justify sending more than is needed.`,
        ),
        mc(
          `A hospital wants to send promotional messages about a new wellness package to 9,000 patient phone numbers collected at registration. What does it need?`,
          "c",
          [
            `Nothing more, since patients gave their numbers voluntarily`,
            `A notice on the hospital website and in reception saying that patients may receive offers`,
            `Specific consent for marketing, separate from treatment, with an easy opt-out`,
            `Approval from each patient's HMO`,
          ],
          `Numbers collected for care were collected for that purpose; marketing is a new purpose that needs its own specific consent. A website notice informs but does not obtain consent, so it does not make the messages lawful.`,
        ),
        mc(
          `Which new initiative most clearly calls for a data protection impact assessment before launch?`,
          "b",
          [
            `Updating the internal staff phone directory`,
            `Recorded video consultations hosted with a cloud provider abroad`,
            `Moving paper records to a locked room in the same building`,
            `Adding a fifth HMO to the hospital's claims list and sending it monthly claims`,
          ],
          `Recording health consultations and transferring them abroad combines sensitive data, new technology and cross-border transfer, which is the high-risk profile a DPIA exists for. Adding an HMO is a routine extension of an existing, assessed flow.`,
        ),
        mc(
          `An access audit finds 46 active HIS accounts belonging to staff who left in the past year. What is the root fix?`,
          "d",
          [
            `Force all users to change their passwords monthly`,
            `Switch off the audit trail to reduce system load`,
            `Send all line managers a memo reminding them to report leavers to IT on their last day`,
            `Tie deactivation to the HR exit process within a day, with a monthly reconciliation`,
          ],
          `Linking account removal to the HR exit, and checking accounts against the staff list each month, closes the gap the audit found. A reminder memo relies on the same manual step that already failed 46 times.`,
        ),
        mc(
          `A hospital's EMR vendor hosts all patient data in a data centre in Ireland. What must the hospital be able to show?`,
          "a",
          [
            `A lawful basis under the Act for the transfer, such as adequacy or contractual safeguards`,
            `Nothing, since cloud storage is not a form of processing`,
            `That every patient consented in writing to cloud storage`,
            `That the vendor has an office registered in Lagos`,
          ],
          `Hosting data abroad is a cross-border transfer, and the controller must document the basis the Act allows for it. Collecting every patient's consent is the tempting overcorrection; it is impractical and not the only or usual basis.`,
        ),
        mc(
          `A former patient asks the hospital to delete all her records, including clinical notes from a delivery two years ago. What is the correct approach?`,
          "c",
          [
            `Delete all her records, clinical and otherwise, within a week to honour the request in full`,
            `Refuse in one line and close the request`,
            `Explain what must be kept and why, erase or restrict the rest, reply in writing`,
            `Refer her to her HMO to decide`,
          ],
          `The right to erasure is limited where records must be kept for care and legal reasons, but the hospital must still handle the request properly and remove what it does not need, such as marketing data. Deleting everything complies with the request but breaches the hospital's duty to keep clinical records.`,
        ),
        ms(
          `A large hospital has been designated a data controller of major importance. Which are its duties? Select all that apply.`,
          ["a", "b", "e"],
          [
            `Register with the NDPC`,
            `Designate a data protection officer`,
            `Obtain each patient's consent before any treatment record is made`,
            `Obtain NAFDAC approval for its EMR`,
            `Keep evidence of compliance, such as records of processing and compliance returns`,
          ],
          `Registration, a DPO and demonstrable compliance are duties attached to major-importance controllers. Treatment records rest on the medical-purposes ground, not consent, and NAFDAC regulates medicines and medical products rather than approving hospital record systems.`,
        ),
        mc(
          `Doctors in a 60-member department WhatsApp group share patient wound photographs to get advice from colleagues. What is the right institutional response?`,
          "b",
          [
            `Ban personal phones from all clinical areas and discipline any doctor found sharing images`,
            `Provide an approved channel, a policy on consent, storage and deletion, and training`,
            `Leave it to each doctor's professional judgement`,
            `Ask the group administrator to remove inactive members`,
          ],
          `The clinical need for quick advice is real, so the hospital should provide a governed way to meet it and set the rules. A phone ban sounds decisive but is unenforceable and drives the sharing further out of sight.`,
        ),
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      slug: "telemedicine-digital-front-door",
      name: "Telemedicine and the Digital Front Door",
      description:
        "Run enquiry, booking and virtual care as a service: response standards, which visits to deliver virtually, the clinical, regulatory and payment rules, and how to judge whether it works.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "The digital front door is a service, not a website",
            body: p(
              `The digital front door is every way a patient reaches the hospital before and between visits: the phone line, WhatsApp, the website, booking, payment, results and reminders. In most Nigerian private hospitals the phone and WhatsApp carry the bulk of enquiries, and patients are lost there. Calls ring out, WhatsApp replies arrive three hours later, and chats end without a booking.`,
              `Treat it as a service with a team, opening hours, standards and measures, not as a technology project. Map the journey: enquiry, answer, booking, pre-visit preparation (HMO eligibility, deposit, instructions), the visit, results and follow-up, and the return visit. Each handover in that chain is a point where a patient can drop out.`,
              `Consider a 90-bed hospital in Lekki receiving 1,400 WhatsApp enquiries a month. Before any change, 38% received a reply within an hour and 22% ended in a booking. The hospital moved WhatsApp to a shared business inbox, staffed it on a rota from 7:00 to 21:00, set a 15-minute first-response standard, and trained agents to close each chat with a booking or a clear next step. Within three months, 85% of enquiries were answered within 15 minutes and 41% ended in a booking. No new software beyond the shared inbox was involved.`,
              `The core measures are:\n- Median first response time, by channel and hour\n- Share of calls answered\n- Share of enquiries that end in a booking\n- Did-not-attend rate after reminders\n- Time from result ready to result delivered\n- Share of patients who rebook a follow-up`,
              `Staff it properly. A team of two to four agents can handle 100 to 200 enquiries a day with good scripts. Non-clinical agents must not answer clinical questions; give them a route to a nurse for those, with a response standard of its own. Connect bookings to the HIS so that a WhatsApp booking lands in the clinic template, not on a paper list at the front desk.`,
            ),
          },
          {
            title: "Choosing what to deliver virtually",
            body: p(
              `Telemedicine pays off where a virtual visit does the clinical job as well as an in-person one and saves the patient a trip. Pick the use cases before the platform.`,
              `There are four broad models:\n- Synchronous visits, by video or phone, between clinician and patient\n- Store-and-forward, where images or tracings are sent and reviewed later, such as teleradiology reporting or dermatology photographs\n- Remote monitoring, where patients send home readings, such as blood pressure or glucose, for review\n- Clinician-to-clinician support, where a specialist advises a doctor at a partner clinic or outreach site`,
              `Good fits include follow-up reviews of stable chronic conditions with home readings, explaining results, medication reviews, post-operative wound checks with photographs, mental health follow-ups, and second opinions for patients or relatives abroad. Poor fits are new problems that need an examination, anything that sounds urgent, and conditions where the decision depends on what the clinician can feel or hear.`,
              `Write inclusion and exclusion rules for each clinic and apply them at booking, so the agent or nurse routes the patient correctly. A diabetes clinic might offer virtual review to patients whose last two in-person results were within target and who can send glucose readings, and require an in-person visit every third review.`,
              `Every virtual service needs an escalation route that is set up before the first call. If a patient on a video follow-up describes a new symptom that needs examination or emergency care, the clinician must be able to book a same-day slot or direct the patient to the emergency unit, and stay with them until the handover is made. Hold a small number of same-day in-person slots for these conversions.`,
              `Track unplanned re-presentation within seven days of a virtual visit as a service signal. A rising rate means the inclusion rules are too loose. The deeper clinical review of such cases belongs to the hospital's clinical governance process.`,
            ),
          },
          {
            title: "Running it: clinicians, rules and money",
            body: p(
              `Telemedicine most often fails because it is bolted onto clinicians' days without protected time, a clear price or a payer.`,
              `Schedule virtual visits as blocks in the clinic template, for example a two-hour virtual session on Tuesday afternoons. Squeezing video calls between in-person patients produces late calls, frustrated patients waiting online and doctors who resent the service.`,
              `Clinicians must hold current registration with their regulator, MDCN for doctors and NMCN for nurses and midwives. The position of clinicians practising outside Nigeria who consult patients in Nigeria is not settled by a single clear rule. Before using diaspora consultants, check MDCN's current requirements and take legal advice, and keep a Nigeria-registered clinician responsible for the patient's care.`,
              `Decide the prescribing rules. Virtual prescriptions should go electronically to the hospital pharmacy or a partner pharmacy, with delivery arranged within the rules the Pharmacists Council of Nigeria sets for pharmacies. Many hospitals bar first prescriptions of controlled medicines at a virtual visit as a matter of policy.`,
              `Settle payment before the call. Self-pay patients pay when booking. HMO coverage of virtual visits varies by HMO and by plan, so confirm cover and obtain an authorisation code as for any other visit. Corporate retainers can include virtual reviews. Price below the in-person fee but not so low that patients who need examination choose video to save money.`,
              `Document every virtual visit in the EMR like any other encounter. Record calls only with consent and a clear reason. The platform must meet the hospital's NDPA duties, covered in the health data governance module: a processor contract, known hosting location and access controls.`,
              `Choose technology for the patients you have. Many are on mobile data with a weak signal. The patient should join from a link in the browser without downloading an app, the video should work at low bandwidth, and the call should fall back to a phone call without being rebooked.`,
            ),
          },
          {
            title: "Measuring whether it works",
            body: p(
              `Judge a virtual service on access, completion, resolution, safety signals and economics, not on downloads or sign-ups. App downloads tell the board how many people were curious, not how many were cared for.`,
              `- Access: days to the next available virtual slot; first response time on WhatsApp\n- Completion: share of booked virtual visits that take place; share disrupted by technical failure\n- Resolution: share of virtual visits not followed by an in-person visit for the same problem within 14 days\n- Appropriate conversion: share converted to in-person care, imaging or procedures where clinically indicated\n- Safety signal: unplanned re-presentation within seven days\n- Experience: patient rating and complaints\n- Economics: revenue per clinician hour, and the cost of the platform and contact team`,
              `Read resolution and conversion together. A service that resolves everything may be keeping patients online who need examination; one that converts most visits to in-person care is adding a step rather than saving one.`,
              `Do the economics honestly. Suppose a two-hour virtual block sees 12 patients at N15,000, and the same block in person sees 10 at N25,000. On fees alone, the virtual block earns N180,000 against N250,000. If 3 of the 12 virtual patients are converted to imaging averaging N40,000, the virtual block earns N300,000. The in-person block also generates downstream work, so count both sides before declaring a winner.`,
              `Start with a 12-week pilot in one clinic, with targets agreed in advance for completion, resolution, re-presentation and revenue per hour, and a decision date. Expand if the targets are met, change the rules if the safety or completion figures are weak, and stop if patients do not use it. A pilot without a stop rule tends to run for years at a small loss.`,
            ),
          },
        ],
        exercises: [
          {
            title: "Fix the front door",
            instruction: `A 110-bed hospital in Victoria Island receives about 1,600 calls and 1,100 WhatsApp messages a month. 31% of calls go unanswered, the median first WhatsApp reply is 2 hours 40 minutes, 18% of enquiries end in a booking and the did-not-attend rate is 24%. Enquiries peak between 8:00 and 11:00. Design the target service: team size and rota, opening hours, response standards by channel, the booking and reminder process, the route for clinical questions, and six measures with 90-day targets. Estimate the extra bookings a month if the booking rate reaches 35%.`,
          },
          {
            title: "Design a diabetes virtual clinic pilot",
            instruction: `The same hospital's diabetes clinic has 600 registered patients, of whom about 350 were within target at their last two reviews. Consultants see them every three months in person. Design a 12-week virtual review pilot: inclusion and exclusion rules, the schedule block, price for self-pay and the HMO process, escalation route, documentation, and the targets and stop rule you would agree with the medical director before launch.`,
          },
        ],
      },
      resources: { tools: ["Front Door Journey Map", "Virtual Visit Eligibility Rules Template", "Telemedicine Pilot Scorecard"] },
      questions: [
        mc(
          `A hospital's WhatsApp line receives 1,200 enquiries a month, the median first reply is 3 hours and 20% end in a booking. The CEO wants a new website. What is the better first move?`,
          "a",
          [
            `Staff a shared WhatsApp inbox on a rota with a response standard and booking close`,
            `Build the new website first, then review WhatsApp performance`,
            `Run paid social media advertising across Lagos to raise the number of monthly enquiries`,
            `Print the WhatsApp number on more billboards across the city`,
          ],
          `The hospital is losing patients who have already enquired, so faster replies and a booking at the end of each chat convert demand it already has. More advertising pours extra enquiries into a channel that is failing to answer the ones it gets.`,
        ),
        mc(
          `Which clinic is the best first candidate for video consultations?`,
          "c",
          [
            `Emergency triage for patients reporting chest pain`,
            `First visits to a new orthopaedic clinic`,
            `Follow-up reviews of stable hypertensive patients with home readings`,
            `Antenatal booking visits, which need an examination and blood tests on the day`,
          ],
          `Stable follow-ups with home readings can be handled well remotely, saving the patient a trip without losing clinical information. First orthopaedic visits look routine but depend on physical examination, which video cannot provide.`,
        ),
        mc(
          `A UK-based Nigerian cardiologist who is not currently registered with the MDCN offers to run video consultations for a Lagos hospital's patients. What should the hospital do?`,
          "b",
          [
            `Go ahead, since each patient's consent is enough`,
            `Check MDCN's current rules and take advice, keeping a Nigeria-registered clinician responsible`,
            `Go ahead, since his UK registration is held to a stricter standard than MDCN registration requires`,
            `Allow it as long as the consultations are free of charge`,
          ],
          `The rules for clinicians abroad consulting patients in Nigeria are not settled in one clear rule, so the hospital must check the regulator's position and keep a registered clinician accountable. Relying on the strength of UK registration is the common assumption, but registration with one regulator does not license practice under another.`,
        ),
        mc(
          `A board pack reports 4,000 app downloads as the measure of telemedicine success. What is a better headline measure?`,
          "d",
          [
            `Number of push notifications sent each month`,
            `Monthly visits to the hospital website`,
            `Followers gained on the hospital's social media`,
            `Share of virtual visits resolved without an in-person visit, with re-presentation`,
          ],
          `Resolution shows whether virtual care did the clinical job, and pairing it with re-presentation shows whether it did so safely. Downloads and followers measure interest, not care delivered.`,
        ),
        mc(
          `Doctors at a specialist clinic were told to take video calls between in-person patients. Six weeks in, 40% of booked video calls start more than 30 minutes late. What is the fix?`,
          "a",
          [
            `Schedule virtual visits in protected blocks in the clinic template`,
            `Ask virtual patients to stay online and wait longer`,
            `Move to a different video platform with better scheduling and reminder features`,
            `Shorten each video slot to five minutes`,
          ],
          `The lateness comes from competing with in-person patients for the same minutes, so protected virtual blocks remove the conflict. Changing platform is the tempting technology answer, but the problem is scheduling, not software.`,
        ),
        mc(
          `An HMO enrollee books a video follow-up at a hospital in Ikeja. What should happen before the call?`,
          "c",
          [
            `Bill the HMO as usual after the call, since virtual visits are covered like clinic visits`,
            `Charge the patient self-pay rates by default`,
            `Check whether the patient's plan covers virtual visits and obtain authorisation`,
            `Provide the visit free as a goodwill gesture`,
          ],
          `HMO cover for virtual visits varies by HMO and plan, so it must be confirmed and authorised like any other encounter. Assuming cover leads to rejected claims, and defaulting to self-pay charges patients for care their plan may include.`,
        ),
        mc(
          `A two-hour virtual block sees 12 patients at N15,000 each, and 3 of them are converted to imaging averaging N40,000. What revenue does the block generate including these conversions?`,
          "b",
          [`N180,000`, `N300,000`, `N360,000`, `N220,000`],
          `Fees of N180,000 plus N120,000 of imaging give N300,000. Stopping at N180,000 understates the block, though a fair comparison with in-person care must count the downstream work from that block too.`,
        ),
        mc(
          `During a video follow-up, a patient describes new weakness on one side of his body. What must the service already have in place?`,
          "d",
          [
            `A patient satisfaction survey sent after each call`,
            `A refund policy for virtual visits that are cut short`,
            `A way to send the call recording and a written summary to the patient and his GP afterwards`,
            `An escalation route to emergency care, with the clinician staying on until handover`,
          ],
          `New neurological symptoms need emergency assessment, and the route for converting a virtual visit to emergency care has to exist before it is needed. The other items are service features that do nothing for a patient who needs urgent care now.`,
        ),
        ms(
          `Which belong in a digital front door's service standards? Select all that apply.`,
          ["a", "b", "d"],
          [
            `Median first response time on WhatsApp during opening hours`,
            `Share of enquiries that end in a booking`,
            `Non-clinical agents answering clinical questions to save nurse time`,
            `A route for clinical questions to a nurse, with its own response time`,
            `Number of followers on the hospital's Instagram account`,
          ],
          `Response time, booking conversion and a clinical route are standards the team can be held to and that affect patients directly. Letting non-clinical agents give clinical answers saves time at the cost of safety, and follower counts measure marketing reach, not the service.`,
        ),
        mc(
          `Most of a hospital's patients join calls on mobile data with a weak signal. What should the telemedicine platform do?`,
          "a",
          [
            `Open from a browser link at low bandwidth, falling back to a phone call`,
            `Require high-definition video for every consultation`,
            `Require an app download and account set-up before the first visit, for security`,
            `Run only on desktop computers for the best picture quality`,
          ],
          `Browser access at low bandwidth with a phone fallback lets patients join on the connections they actually have. Requiring an app looks more professional but loses patients at the download step, before any care is given.`,
        ),
      ],
    },
  ],
};

export default expansion;
