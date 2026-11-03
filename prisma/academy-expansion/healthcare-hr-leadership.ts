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
  slug: "healthcare-hr-leadership",
  topUp: [
    {
      moduleSlug: "disc-behavioral-assessment",
      questions: [
        mc(
          "A hospital owner wants to use staff DISC results to decide which of three nurses to promote to ward manager. What is the right advice?",
          [
            "Promote the nurse with the highest D score, since ward managers must drive decisions quickly",
            "Use evidence of competence for the promotion, and use DISC afterwards to guide coaching",
            "Promote the nurse with the highest S score, since nursing teams value steadiness",
            "Retest all three with DISC and promote whoever scores most evenly across styles",
          ],
          1,
          "DISC describes how people prefer to communicate and respond to pressure, not what they can do, so it is a lens for coaching rather than a selection test. Choosing by D score treats a style as a capability, which the module warns against.",
        ),
        mc(
          "A hospital's five-person executive team are all high-D. Which problem is the consultant most likely to find?",
          [
            "Endless consultation that delays every decision",
            "Avoidance of accountability conversations with staff",
            "Over-checking of data before anything is approved",
            "Fast decisions that under-consult nursing and clinical staff",
          ],
          3,
          "A leadership team dominated by one style, often all-D, tends to decide quickly and consult too little. Avoiding accountability conversations is the typical risk of I-style champions, not D-style executives.",
        ),
        mc(
          "A medical advisory committee has several C-style consultants who stall decisions in meetings. How should the forum be redesigned?",
          [
            "Circulate data and options in advance, with time to review before deciding",
            "Ask the chair to call a vote earlier so that discussion cannot run on past the agenda",
            "Move the decisions to a smaller group without the C-style consultants",
            "Replace the papers with a short verbal briefing to save time",
          ],
          0,
          "C-style clinicians commit once they have the data they need, so giving it to them in advance speeds decisions. Forcing an early vote or excluding them treats the style as obstruction and loses their scrutiny.",
        ),
        mc(
          "S-style nurses and C-style finance managers at a hospital are in open conflict over new documentation for HMO claims. What should the consultant do first?",
          [
            "Tell the nurses that finance's documentation requirements are not negotiable",
            "Drop the new documentation to restore calm on the wards",
            "Map the team profile and surface the specific friction first",
            "Run a team-building away day for both departments",
          ],
          2,
          "The module's approach is to map the profile, surface the friction points and then design structures that work across styles. Siding with one group or dropping the requirement avoids the diagnosis and leaves the cause in place.",
        ),
        ms(
          "Which are among the common problems a DISC team audit reveals in healthcare engagements? Select all that apply.",
          [
            "A leadership team dominated by a single style",
            "A clinical-administrative divide between S-style nurses and C-style finance managers",
            "I-style clinical champions who motivate teams but avoid accountability conversations",
            "Nurses who lack the clinical competence for their grade",
            "Pay grades that are out of line with the market",
          ],
          [0, 1, 2],
          "These are the three patterns a DISC audit typically surfaces. Clinical competence and pay are real issues, but DISC is a behavioural lens and does not measure either.",
        ),
      ],
    },
    {
      moduleSlug: "cilti-leadership-transition",
      questions: [
        mc(
          "A newly appointed director of nursing is technically strong, but heads of department bypass her and take issues straight to the CEO. Which CILTI dimension is the main gap?",
          ["Capability", "Identity", "Trust", "Learning"],
          2,
          "Being bypassed shows the relationships the role depends on have not been rebuilt, which is the Trust dimension. Capability is tempting, but her technical strength is not in question.",
        ),
        mc(
          "A surgeon promoted to CMO has never managed a budget, has no mentor and has enrolled in no course. Which two CILTI dimensions are weakest?",
          [
            "Capability and Learning",
            "Identity and Trust",
            "Integration and Trust",
            "Identity and Integration",
          ],
          0,
          "Missing budget skills is a Capability gap, and having no route to acquire them, formal or informal, is a Learning gap. Identity may also be at risk, but nothing in the facts given shows how he sees his role.",
        ),
        mc(
          "A consultant has completed the structured CILTI interview with a newly promoted operations manager. What should the main output be?",
          [
            "A report scoring the manager against each dimension for the board",
            "A recommendation on whether to confirm the appointment",
            "A DISC profile to sit alongside the interview notes",
            "A 90-day transition plan aimed at the gaps the interview found",
          ],
          3,
          "CILTI is used to identify gaps and then build a 90-day transition plan to close them. Turning it into a confirm-or-remove judgement misreads its purpose, which is support through the transition.",
        ),
        mc(
          "A head of pharmacy has been promoted to operations manager. Which intervention works mainly on the Learning dimension?",
          [
            "Giving her a budget template and a procurement policy",
            "A management course, a peer network and coaching",
            "Weekly one-to-one meetings with the CEO",
            "Blocking her calendar so pharmacy work takes no more than a fifth of her week",
          ],
          1,
          "Learning is about how the leader acquires new knowledge: formal training, peers and coaching. The template is a Capability tool, CEO meetings build Trust, and calendar blocking addresses Integration.",
        ),
        mc(
          "A hospital promotes a popular senior registrar to clinical lead. When should CILTI support begin?",
          [
            "Six months in, once problems have had time to show",
            "After the first annual appraisal in the new role",
            "Only if the leader asks for help",
            "At appointment, with a transition plan for the first 90 days",
          ],
          3,
          "Transitions often fail within the first year as leaders regress to old tasks or burn out, so support has to start at appointment. Waiting for problems to appear means the habits the support should prevent are already set.",
        ),
      ],
    },
  ],
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "pay-benefits-oncosts",
      name: "Pay, Benefits and Employer On-costs in Nigeria",
      description:
        "Structure pay the way Nigerian payrolls do, know which elements are pensionable, build the full employer on-cost stack (pension, NSITF, ITF, group life, 13th month, HMO cover), keep employee deductions such as NHF out of it, and benchmark pay in a market shaped by emigration.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "How Nigerian pay is structured",
            body: p(
              "Nigerian salaries are rarely a single number. Gross monthly pay is normally split into a basic salary plus allowances, most commonly housing and transport, and then other allowances such as meal, utility, call, shift, hazard or specialty allowances. The split matters because several legal obligations are calculated on parts of pay, not on the whole.",
              "The most important is pension. Under the Pension Reform Act 2014, contributions are calculated on monthly emoluments defined as basic salary, housing allowance and transport allowance. These three are the pensionable pay. Other allowances fall outside the pension base. A nurse on N400,000 gross whose basic, housing and transport add up to N300,000 has a pension base of N300,000, not N400,000.",
              "This creates a temptation. An employer can shrink pension contributions by keeping basic, housing and transport low and loading the rest into a 'special allowance'. The saving is real but small, staff see the effect in their retirement savings account statements, and a structure built to minimise statutory contributions invites challenge from the National Pension Commission (PenCom) and erodes trust. A consultant should advise a defensible structure, not an aggressive one.",
              "Hospitals add clinical allowances: call duty for doctors, night shift for nurses, and sometimes specialty or scarce-skill allowances for areas such as ICU or theatre. Write down the rules for each in the policy (who qualifies, the rate, when it is paid), because inconsistent allowances cause more complaints than base pay.",
              "Many private hospitals benchmark against the public sector scales. Doctors in federal service are paid on CONMESS (the Consolidated Medical Salary Structure) and most other health workers on CONHESS (the Consolidated Health Salary Structure). These give a reference point, though public pay also carries arrears, allowances and job security that private employers do not mirror exactly. The National Minimum Wage (Amendment) Act 2024 set the national floor at N70,000 a month, which matters for cleaners, porters and some support staff.",
            ),
          },
          {
            title: "The employer on-cost stack",
            body: p(
              "Gross salary is not what an employee costs. On top of it sit statutory contributions and customary benefits that the employer pays. Planners who leave these out underbudget every new post.",
              "The statutory items are:\n- Employer pension: at least 10% of pensionable pay (basic, housing, transport) under the Pension Reform Act 2014, paid to the employee's pension fund administrator. The employee contributes at least 8%, deducted from their pay.\n- NSITF: 1% of the total monthly payroll under the Employee's Compensation Act 2010, which funds compensation for workplace injury and disease. For a hospital, with needle-stick injuries and infection exposure, this is not a formality.\n- ITF: 1% of annual payroll under the Industrial Training Fund Act, for employers that meet the Act's thresholds on headcount or turnover.\n- Group life assurance: the Pension Reform Act requires employers to maintain group life cover for each employee, at a minimum of three times annual total emoluments.",
              "Then come items that are customary or contractual rather than statutory:\n- A 13th month payment, widely paid in December. It is not required by law, but once written into contracts or paid consistently it becomes an expectation, and in some cases an entitlement.\n- HMO cover for staff, often extended to a spouse and children. Cost varies with the plan.\n- Others such as uniforms, staff meals, training and professional licence fees where the hospital pays them.",
              "Some deductions look like costs but are not. The National Housing Fund contribution, 2.5% of basic salary, is an employee deduction that the employer collects and remits. The employee's 8% pension share is also deducted from pay. PAYE income tax is withheld from the employee and remitted to the State Internal Revenue Service. All three must be deducted and paid on time, and failing to remit them creates a liability, but none adds to the employer's cost of the post. Mixing them into the on-cost stack overstates the cost and confuses the budget.",
            ),
          },
          {
            title: "Building a loaded cost: a worked example",
            body: p(
              "A loaded cost is gross pay plus every employer on-cost, expressed per month or per year. It is the right figure for budgets, business cases and pricing a service.",
              "Take a staff nurse on N350,000 gross a month, made up of basic N150,000, housing N70,000, transport N40,000 and other allowances N90,000. Pensionable pay is N260,000.",
              "- Employer pension at 10% of N260,000: N26,000\n- NSITF at 1% of N350,000: N3,500\n- ITF at 1% of N350,000: N3,500\n- 13th month of one month's gross, spread over twelve months: N29,167\n- Group life premium, say: N1,750\n- HMO plan at N180,000 a year: N15,000",
              "The on-costs total N78,917 a month, so the loaded cost is about N428,917, or 22.5% above gross. Across Nigerian private hospitals, 20 to 25% over gross is a reasonable planning figure, with the result moving mainly on three things: whether a 13th month is paid and on what base (basic or gross), the level of HMO plan, and how much of gross pay sits in pensionable elements.",
              "Build the stack from the hospital's actual contracts and plans before relying on the planning figure. A hospital paying a 13th month on basic only, with a basic HMO plan, may sit near 17%. One paying a full 13th month, a family HMO plan and generous training will be above 25%.",
              "Two errors are common. Finance teams often budget new posts at gross, so a plan for 20 nurses at N300,000 is costed at N6m a month instead of roughly N7.2m to N7.5m. Others add NHF and the employee pension share to the stack, which inflates the figure by more than 10 points and makes good business cases look unaffordable.",
              "Use the loaded figure everywhere a staff cost is priced: workforce plans, new service business cases, and the staff cost line in a tariff or package price.",
            ),
          },
          {
            title: "Benchmarking and setting pay in a migrating market",
            body: p(
              "Pay decisions in a Nigerian hospital start from two questions: what does the local market pay for this role, and is our pay fair inside the hospital? Getting the first wrong loses recruits. Getting the second wrong loses the staff you already have.",
              "Benchmark with several sources: salary surveys where they exist, offers made to candidates who declined, pay data from peer hospitals shared through networks, current job adverts, and the public CONMESS and CONHESS scales as a reference. Decide where the hospital wants to sit, for example at the market median for most roles and above it for scarce skills. Review at least once a year, because naira inflation can erode a fair salary within twelve months.",
              "Pay compression is the most common internal problem. When the market for ICU nurses rises, the hospital hires a new nurse at N420,000 while colleagues with five years' service earn N350,000. Word spreads within days. The answer is not secrecy. Review the incumbents against the same benchmark and plan an adjustment, or use a scarce-skill allowance that is paid to everyone who meets clear criteria and reviewed each year.",
              "Retention allowances should be targeted and time-limited. A blanket increase for all staff in response to emigration is expensive and does not focus money on the roles most at risk. Criteria might include skill area, licence status, years of service and a commitment to a service period.",
              "Remember total reward. Staff weigh pay against the HMO plan, the 13th month, pension that is actually remitted, paid study leave, transport for night shifts and a fair rota. A hospital that pays slightly below the market but remits pension on time, pays allowances promptly and funds training can retain better than one that pays more and pays late. Explain the full package in writing, because staff often undervalue benefits they cannot see on their payslip.",
            ),
          },
        ],
        exercises: [
          {
            title: "Cost a new ward",
            instruction:
              "Harbourside Specialist Hospital, Lagos, is opening a 20-bed surgical ward needing 16 staff nurses at N320,000 gross a month (basic 45%, housing 20%, transport 10%, other allowances 25%), 2 nursing officers at N480,000 on the same split, and 4 healthcare assistants at N120,000 (basic 60%, housing 20%, transport 10%, other 10%). The hospital pays a 13th month of one month's basic, a staff HMO plan at N150,000 a year per person, and group life at about 0.5% of gross. It meets the ITF thresholds. Build the monthly loaded cost for the ward, state the on-cost as a percentage of gross, and list which deductions you have deliberately left out and why.",
          },
          {
            title: "Resolve a pay compression complaint",
            instruction:
              "The same hospital hired three ICU nurses last month at N420,000 to fill urgent vacancies. Its seven existing ICU nurses earn between N330,000 and N370,000 and have written jointly to the medical director. The annual budget allows about N2m a month of extra ICU pay. Propose a response: a benchmark position, whether to adjust base pay or use a scarce-skill allowance, the criteria, the cost, and the message to staff.",
          },
        ],
      },
      resources: { tools: ["Loaded cost calculator", "Pay structure template", "Salary benchmark log", "Allowance policy template"] },
      questions: [
        mc(
          "A nurse earns basic N180,000, housing N80,000, transport N40,000 and other allowances N100,000 a month. What is the minimum employer pension contribution?",
          ["N40,000, 10% of the full gross pay", "N24,000, 8% of pensionable pay", "N30,000, 10% of pensionable pay", "N18,000, 10% of basic salary"],
          2,
          "Pensionable pay is basic plus housing plus transport, N300,000, and the employer pays at least 10% of it. N40,000 wrongly includes other allowances, and 8% is the employee's minimum share, not the employer's.",
        ),
        mc(
          "Which of these is not a cost to the employer?",
          ["NHF at 2.5% of basic salary", "The NSITF contribution of 1% of payroll", "The group life assurance premium", "The employer pension contribution of 10%"],
          0,
          "NHF is deducted from the employee's pay and remitted by the employer, so it is not an employer cost. The other three are paid by the employer on top of gross pay.",
        ),
        mc(
          "Finance has budgeted 20 new nurses at N300,000 gross each as N6m a month. What is a more realistic monthly budget for the posts?",
          ["N6m, as gross pay is the full cost", "N6.6m, adding 10% for pension", "N9m, adding 50% for all costs", "About N7.2m to N7.5m"],
          3,
          "Pension, NSITF, ITF, group life, a 13th month and HMO cover typically add 20 to 25% to gross. Adding only pension misses the rest of the stack, and 50% would mean wrongly counting employee deductions.",
        ),
        mc(
          "An owner proposes cutting basic, housing and transport to 40% of gross and moving the rest into a 'special allowance' to reduce pension costs. What should you advise?",
          [
            "Go ahead, since only basic, housing and transport count as pensionable under the Act",
            "Avoid it: staff pensions shrink visibly and it invites PenCom scrutiny",
            "Go ahead, provided staff are told in the next newsletter",
            "Avoid it, because pension is calculated on total gross pay anyway",
          ],
          1,
          "It is technically possible but shrinks retirement savings staff can see, invites regulatory challenge and costs trust worth more than the saving. The last option is wrong on the law: the pension base is basic, housing and transport.",
        ),
        mc(
          "What does the Pension Reform Act 2014 require on group life assurance?",
          [
            "Nothing, because group life is an optional benefit",
            "Employees must buy their own cover through their pension fund administrator",
            "Cover for every employee of at least three times annual total emoluments",
            "Employers must insure senior staff only",
          ],
          2,
          "Group life cover for every employee, at a minimum of three times annual total emoluments, is a statutory employer duty under the Act. Treating it as optional is a common gap in smaller hospitals.",
        ),
        mc(
          "A loss-making hospital proposes to stop paying the 13th month this December. Every contract mentions it. What is the position?",
          [
            "Not statutory, but contractual here, so it must be changed properly, with consultation",
            "It can be stopped at any time, because no law in Nigeria requires employers to pay a 13th month",
            "It is a statutory payment, so it can never be removed",
            "It can be stopped if the hospital announces it before December",
          ],
          0,
          "No law requires a 13th month, but a contractual promise binds the employer until the terms are properly changed. Treating 'not statutory' as 'not binding' is the tempting error.",
        ),
        mc(
          "Which statement about the Industrial Training Fund contribution is correct?",
          [
            "It is 1% of salary deducted from each employee",
            "It is 2.5% of basic salary, paid by the employer on top of gross pay",
            "It applies only to government hospitals",
            "1% of annual payroll, for employers that meet the Act's thresholds",
          ],
          3,
          "ITF is an employer contribution of 1% of annual payroll for employers above the thresholds in the ITF Act. The 2.5% figure belongs to NHF, which is an employee deduction.",
        ),
        ms(
          "Which elements make up pensionable pay under the Pension Reform Act 2014? Select all that apply.",
          ["Basic salary", "Housing allowance", "Transport allowance", "Call duty allowance", "The HMO premium paid for the employee"],
          [0, 1, 2],
          "The Act calculates contributions on basic, housing and transport. Call allowances and benefits such as HMO cover sit outside the pension base.",
        ),
        mc(
          "A hospital hires ICU nurses at N420,000 while existing ICU nurses with five years' service earn N350,000. What is the best response?",
          [
            "Keep new hires' pay confidential and refuse to discuss it",
            "Benchmark the incumbents too, then adjust pay or add a scarce-skill allowance",
            "Reduce the new nurses' pay to N350,000 at their first review to restore internal fairness",
            "Give every nurse in the hospital a 20% increase",
          ],
          1,
          "Compression is fixed by applying the same market test to everyone in the role, through base pay or a clear allowance. A hospital-wide rise spends heavily on roles not at risk, and secrecy fails within days.",
        ),
        mc(
          "A staff nurse earns N350,000 gross. Monthly employer on-costs are pension N26,000, NSITF N3,500, ITF N3,500, 13th month N29,167, group life N1,750 and HMO N15,000. What is the on-cost as a share of gross?",
          ["About 9.4%", "About 18.3%", "About 22.5%", "About 31.5%"],
          2,
          "The on-costs total N78,917, which is 22.5% of N350,000. 9.4% counts only the statutory contributions and 18.3% leaves out the HMO plan; 31.5% would come from wrongly adding employee deductions such as NHF.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "employment-law-hr-policy",
      name: "Employment Law, Contracts and HR Policy",
      description:
        "Apply the main Nigerian employment laws to a hospital, write contracts for employees, locums and visiting consultants, run discipline, termination and redundancy fairly, and write HR policy that staff and managers actually follow.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "The legal frame for hospital employment",
            body: p(
              "Hospital employment in Nigeria is governed by a handful of statutes, the contract itself, and an increasingly active labour court. A consultant does not need to be a lawyer, but must know where the main obligations come from and when to call one.",
              "The Labour Act is the base statute, but its protections apply to 'workers' as it defines them, which broadly means people in manual or clerical roles. It excludes people in administrative, executive, technical or professional functions. So the Act directly protects cleaners, porters, clerks and many support staff, while doctors, pharmacists, senior nurses and managers rely mainly on their contracts. Many hospitals still apply Labour Act standards to everyone, which is sensible practice.",
              "Other statutes apply to all staff:\n- The Pension Reform Act 2014: contributions, remittance and group life cover.\n- The Employee's Compensation Act 2010: NSITF contributions and compensation for workplace injury and disease, including needle-stick and infection exposure.\n- The National Minimum Wage Act, as amended in 2024.\n- The Trade Unions Act and related law on recognition and collective bargaining.\n- The Nigeria Data Protection Act 2023, which governs staff personal data as well as patient data.",
              "Disputes go to the National Industrial Court of Nigeria (NICN), which since the 2010 constitutional amendment has exclusive jurisdiction over labour and employment matters. The court can apply international labour standards and good practice, and it has increasingly looked beyond the strict wording of contracts: for example, expecting a valid reason and a fair process for termination, and treating retaliation against an employee who raised a concern as unfair. Advice based on old common law, that an employer may dismiss for any reason or none if notice is given, is now risky.",
              "Professional regulation sits alongside employment law. A doctor or nurse whose MDCN or NMCN licence lapses cannot lawfully practise, whatever their contract says, and state regulators such as HEFAMAA in Lagos inspect facilities on staffing and licensing. Contracts should make maintaining a current licence a condition of employment.",
            ),
          },
          {
            title: "Contracts: employees, locums and visiting consultants",
            body: p(
              "A hospital uses three kinds of working relationship, and each needs the right document. Mixing them up creates legal risk and arguments about pay, leave and liability.",
              "Employees need a written contract. The Labour Act requires workers to receive written terms within three months of starting, and best practice is to issue the contract before the first day. It should cover job title and reporting line, place of work, pay and each allowance, hours and rota expectations, leave, probation, notice, confidentiality including patient data, conduct and the disciplinary policy, and the condition to keep a professional licence current.",
              "Locums cover shifts. They may be engaged as independent contractors, paid per shift on invoice, without employee benefits. The risk is misclassification. A 'locum' who works five fixed days a week for two years, on the hospital's rota, under its supervision, with no other practice, looks much more like an employee, and a court may treat them as one with claims to the rights that come with it. Review long-running locum arrangements each year, and either keep them genuinely flexible or convert them to employment.",
              "Visiting consultants need an engagement agreement, not an employment contract. It should set out the sessions or availability expected, the fee basis, admitting and clinical privileges (granted through the hospital's credentialing process), the requirement to hold a current MDCN licence and appropriate indemnity, adherence to hospital protocols and incident reporting, patient data obligations, and notice to end the arrangement. Pension, leave and the employee disciplinary policy do not belong in it.",
              "Restraint clauses need care. Nigerian courts will usually enforce a post-employment restraint only if it protects a legitimate interest and is reasonable in scope, area and time. A clause barring a consultant from practising anywhere in Lagos State for three years is likely to fail. Narrower clauses, such as not soliciting the hospital's patients or staff for twelve months and keeping its information confidential, are far more defensible and protect what actually matters.",
            ),
          },
          {
            title: "Discipline, termination and redundancy",
            body: p(
              "Discipline must be fair in substance and in process. Nigerian practice usually runs through a written query, and the steps that make it fair are well established.",
              "- Investigate the facts before acting.\n- Issue a written query stating the allegation clearly, with the evidence, and give reasonable time to respond.\n- If the response does not resolve it, hold a disciplinary hearing where the employee can answer and, where the policy allows, bring a colleague.\n- Decide in writing, with the reason and the sanction: advice, warning, final warning, suspension or dismissal.\n- Allow an appeal to someone not involved in the decision.",
              "Gross misconduct, such as theft, violence, serious breach of patient confidentiality or working under the influence, can justify summary dismissal without notice, but the hearing still matters. Dismissal decided before the employee is heard is the most common reason hospitals lose cases. Suspension during an investigation should be on full pay unless the contract clearly says otherwise.",
              "Termination with notice follows the contract. Where the Labour Act applies and the contract is silent, the minimum notice rises with service: one day within the first three months, one week up to two years, two weeks from two to five years, and one month after five years. Given the NICN's approach, have a documented valid reason even when giving notice.",
              "Redundancy has its own rules under section 20 of the Labour Act for workers. The employer must inform the trade union or workers' representatives of the reasons and the extent of the redundancy, apply last in, first out within each category of workers, subject to skill, ability and reliability, and use its best endeavours to negotiate redundancy payments. Good practice extends the same fairness to all staff: consult before deciding, look for alternatives such as redeployment, select on objective criteria, and pay what is owed promptly with a certificate of service.",
              "Final entitlements matter in every exit: outstanding pay, accrued leave where policy provides, a pro rata 13th month if contractual, and confirmation that pension contributions are fully remitted.",
            ),
          },
          {
            title: "Writing HR policy people follow",
            body: p(
              "A policy is only useful if managers apply it and staff know it. Many Nigerian hospitals own a thick handbook copied from another organisation that nobody has read and that contradicts the contracts. When the two conflict, the conflict is usually read against the employer.",
              "Keep the handbook short, plain and consistent. Start with the policies used every week: leave, attendance and lateness, conduct, grievance, discipline, overtime and on-call, and probation. Check each against the contracts and the law, give it a version number and date, and have staff sign that they have received it. Review it every year.",
              "Hospitals need policies other employers do not:\n- Licence maintenance: who checks, how often, and what happens on expiry.\n- Occupational exposure: needle-stick and splash injuries, post-exposure treatment and reporting.\n- Chaperones for intimate examinations.\n- Social media and patient confidentiality, including photographs on wards.\n- Use of locums and agency staff, and who may approve them.\n- Staff health, vaccination and fitness to work.",
              "The social media policy deserves attention. Staff photographing patients or posting about cases is a growing source of complaints and regulatory action, and it is a breach of both professional codes and the NDPA. The policy should say plainly that no patient image or identifiable detail may be shared, and that a breach is treated as serious misconduct.",
              "Staff data is personal data. Under the Nigeria Data Protection Act 2023, the hospital needs a lawful basis for what it holds about staff, should keep it no longer than needed, must secure it, and must handle access requests and breaches properly. Health information about staff, such as pre-employment medicals, HIV or hepatitis B status and sickness records, is sensitive personal data. Keep it in a separate occupational health record with restricted access, not in the general personnel file, and never use it for an employment decision without a clear lawful basis.",
            ),
          },
        ],
        exercises: [
          {
            title: "Run the disciplinary process",
            instruction:
              "At Greenfield Hospital, Ibadan, a staff nurse with three years' service posted a video on TikTok from the children's ward that shows a sedated patient's face. A relative complained to the hospital and threatened to report it. The nurse's contract refers to a disciplinary policy that has not been updated since 2019 and says nothing about social media. Set out the steps from today to a decision, with dates, what goes in the query letter, who sits on the panel, the sanctions open to the hospital, and the two policy changes you would make afterwards.",
          },
          {
            title: "Plan a fair redundancy",
            instruction:
              "The same hospital is outsourcing its histology work and will close the section, affecting 14 staff: 2 scientists, 5 technicians, 4 assistants and 3 clerks. The clerks and assistants are covered by the Labour Act; two technicians could be redeployed to the main laboratory. Write the sequence of steps from announcement to final payment, the selection approach for the two redeployment places, and a list of each person's final entitlements to be checked.",
          },
        ],
      },
      resources: { tools: ["Employee contract template", "Visiting consultant agreement template", "Disciplinary process checklist", "Redundancy planner", "HR policy register"] },
      questions: [
        mc(
          "A nurse has posted a photograph of a patient on social media. How should the hospital handle it?",
          [
            "Dismiss her the same day, since the breach is obvious from the post and needs no hearing",
            "A written query, time to respond, a hearing, then a written decision with appeal",
            "Give her an informal word, since the post has now been removed",
            "Report her to the police before taking any internal action",
          ],
          1,
          "Even a serious breach that may justify dismissal must go through a fair process, or the decision is exposed at the NICN. An informal word under-reacts to a breach of confidentiality and the NDPA.",
        ),
        mc(
          "A 'locum' doctor has worked five fixed days a week for two years on the hospital's rota, paid by invoice. What is the main risk?",
          [
            "None, because the invoices and the consultancy label show it is not employment",
            "The doctor may refuse to cover weekend shifts",
            "The hospital may have to pay VAT on the invoices",
            "A court may treat him as an employee, with claims to employee rights",
          ],
          3,
          "Courts look at the reality of the relationship, and fixed hours, control and long service point to employment. Relying on the invoice label is the common mistake.",
        ),
        mc(
          "A consultant's contract bars him from practising anywhere in Lagos State for three years after he leaves. How is a court likely to view it?",
          [
            "Probably unenforceable as too wide; a narrow non-solicitation clause is safer",
            "Fully enforceable, because he signed the contract freely",
            "Enforceable only if the hospital pays him during the three years",
            "Enforceable, because professionals fall outside the Labour Act and contract freely",
          ],
          0,
          "Restraints must be reasonable in scope, area and time to protect a legitimate interest, and a state-wide ban for three years usually fails. That he signed it does not make an unreasonable restraint enforceable.",
        ),
        mc(
          "A hospital is closing a section and making 14 workers redundant. What does section 20 of the Labour Act require?",
          [
            "Selecting the lowest performers, so long as recent appraisal records support each choice",
            "Paying each worker one month's salary for each year of service",
            "Inform the union, apply last in, first out within categories, and negotiate pay",
            "Giving notice only, since redundancy is a business decision",
          ],
          2,
          "These are the Act's requirements for workers. A fixed formula of one month per year is a common assumption, but the Act requires the employer to negotiate redundancy pay rather than setting a figure.",
        ),
        mc(
          "A worker covered by the Labour Act has three years' service. The contract is silent on notice. What is the minimum notice?",
          ["One week", "Two weeks", "One month", "One day"],
          1,
          "For service of two to five years the Act sets two weeks. One week applies to service from three months to two years, which is the figure people often remember.",
        ),
        mc(
          "The staff handbook gives 21 days' annual leave, but contracts say 15. Which statement is right?",
          [
            "The contract always wins, so staff get 15 days",
            "The handbook always wins, because it is the more recent document and applies to everyone",
            "Managers can choose which document to apply case by case",
            "It will likely be read against the employer; align the documents and reissue",
          ],
          3,
          "Ambiguity in documents the employer wrote usually favours the employee, so staff may well be entitled to the more generous figure. Assuming the contract always wins ignores how the conflict is likely to be resolved.",
        ),
        ms(
          "Which clauses belong in a visiting consultant's engagement agreement? Select all that apply.",
          [
            "Sessions or availability expected",
            "Indemnity cover requirements",
            "Employee pension deductions",
            "Holding a current MDCN licence throughout",
            "Annual leave entitlement",
          ],
          [0, 1, 3],
          "A visiting consultant is engaged, not employed, so the agreement covers availability, indemnity and licence conditions. Pension and leave are employee terms, and including them blurs the relationship.",
        ),
        mc(
          "A hospital wants to end a senior nurse's employment with notice, without a reason, two weeks after she reported a safety concern. What is the advice?",
          [
            "High risk: it may be seen as retaliation without a valid reason; stop and review",
            "Safe, because notice is all the contract requires",
            "Safe, provided she is paid in lieu of notice",
            "Safe, because senior nurses are outside the Labour Act and notice is all the contract needs",
          ],
          0,
          "The court has moved away from the old view that notice alone is enough, and the timing points to retaliation. Paying in lieu settles notice but not the reason for the dismissal.",
        ),
        mc(
          "Where should a staff member's hepatitis B status from a pre-employment medical be kept?",
          [
            "In the general personnel file, so that managers can plan duties around it",
            "With the payroll records, which are already confidential",
            "A separate, restricted occupational health record with a lawful basis",
            "Nowhere, because hospitals may not hold staff health data",
          ],
          2,
          "Staff health data is sensitive personal data under the NDPA and needs separate, restricted handling. Putting it in the general file exposes it to people with no need to see it.",
        ),
        mc(
          "A receptionist is performing poorly at three months. Her contract has a six-month probation with one week's notice during probation. What should the manager do?",
          [
            "End her employment today without a meeting",
            "Review against probation objectives, give feedback, then decide and record it",
            "Confirm her early to keep morale up",
            "Wait until the six months end and then decide, since probation exists for exactly that",
          ],
          1,
          "Probation is for an active review against agreed objectives, with feedback and a recorded decision. Waiting wastes the period that exists to fix or decide, and ending without a meeting is unfair even within probation.",
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "org-design-culture-change",
      name: "Organisation Design and Culture Change",
      description:
        "Design a hospital structure around the decisions it must make, fix spans, layers and decision rights in a founder-led organisation, diagnose culture from behaviour, and lead a change that staff adopt and keep.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Start with what the structure must do",
            body: p(
              "An organisation chart is a set of answers to practical questions: who decides what, who is accountable for which results, and how work flows between people. Design it around those questions, not around current job titles or the people the owner wants to keep happy.",
              "Hospitals have three common structures.\n- Functional: departments organised by profession, with medicine under the medical director, nursing under the director of nursing, and finance, HR and facilities under an administrator. Simple and familiar, but nobody below the chief executive owns a whole service, so problems that cross departments, such as discharge or theatre delays, sit with no one.\n- Clinical directorates or service lines: units such as surgery, maternity or diagnostics, each led by a clinical lead paired with a business or operations manager, jointly accountable for quality, activity and budget. Better at owning a service end to end, but needs capable managers and clear rules for shared resources such as theatres.\n- Group and shared services: for groups with several sites, central functions (finance, HR, procurement, IT) serve each hospital, which keeps its own clinical and operational leadership.",
              "Most growing Nigerian private hospitals start as founder-led functional organisations. The founder, often a consultant, sees patients, runs the hospital, approves spending and settles disputes. That works with thirty staff. With two hundred it produces a bottleneck: decisions queue at one desk, managers do not develop because they are never allowed to decide, and the hospital stops when the founder travels.",
              "Before drawing anything, list the design criteria. Which decisions must be made faster? Which results does nobody own today? Where do handoffs fail? What growth is planned: a new site, a new service line, a group structure? A structure that answers those questions will look different from one that simply adds boxes to the current chart.",
              "Keep the clinical line clear. Whatever the structure, there must be an unbroken line of clinical accountability, from each clinician to a clinical lead to the medical director and the director of nursing, so that safety and professional standards never depend on an administrator's judgement alone.",
            ),
          },
          {
            title: "Spans, layers and decision rights",
            body: p(
              "Once the shape is chosen, three details decide whether it works: how many people each manager leads, how many levels sit between the top and the front line, and who is allowed to decide what.",
              "Span of control is the number of direct reports. Too wide, and the manager cannot know or support each person: a founder with 23 direct reports is in practice managing none of them. Too narrow, and layers multiply and cost rises. There is no single right number. A ward manager of twenty nurses doing similar work can cope with a wide span, supported by shift leaders. A chief operating officer leading very different functions needs fewer reports.",
              "Layers are the levels from the chief executive to the front line. Each layer slows information and adds cost. In a single hospital of 150 to 300 staff, four or five layers is usually enough. When a staff nurse's concern must pass through a shift leader, ward manager, nursing officer, deputy director and director of nursing before reaching anyone who can act, the structure is filtering out bad news.",
              "Decision rights are where most hospitals' real problems hide. Write down the decisions that matter and, for each, who proposes, who decides, who must be consulted and who must be informed (a RACI or similar matrix). Typical examples:\n- Patient discounts and waivers, with naira thresholds for each level of approval.\n- Engaging locums and approving overtime.\n- Purchasing consumables and equipment above set limits.\n- Changing a clinical protocol.\n- Hiring against an approved vacancy.",
              "A hospital where any duty manager can grant discounts of any size, with no record, has a leakage problem that no amount of training fixes. One where every purchase above N50,000 needs the founder's signature has a speed problem. A clear matrix with thresholds solves both, and is often the most valuable single page in an organisation design project.",
              "Signs that the structure itself is the problem rather than the person: the same failure recurs whoever holds the job, two departments both believe they own a process, or decisions wait for one person's approval.",
            ),
          },
          {
            title: "Culture is what people do when nobody is checking",
            body: p(
              "A hospital's culture is the pattern of behaviour that staff treat as normal. The values on the reception wall describe what the owner hopes for. The real culture shows in what happens without supervision: whether theatre starts at 8am or 9:30am, whether a nurse reports a drug error or hides it, whether a junior doctor calls the consultant at 2am about a deteriorating patient or waits until the ward round.",
              "A useful way to diagnose culture is to look at three levels. Visible artefacts are what you can see and hear: the state of the wards, how staff speak to patients, how meetings run. Stated values are what leaders say matters. Underlying assumptions are the beliefs nobody states but everyone acts on, such as 'nothing happens without oga's approval', 'whoever reports a mistake gets blamed' or 'the consultant is never questioned'. Change efforts that work on the first two and ignore the third rarely last.",
              "Gather evidence from several sources:\n- Observation: attend handovers, theatre starts, the emergency room at night and management meetings.\n- Stories: ask staff to describe a time something went wrong and what happened next.\n- Data: incident reporting rates (a hospital that reports almost no incidents is usually not safe, but afraid), sickness absence, turnover by unit, complaint themes.\n- A staff survey, interpreted carefully.",
              "Be careful with survey results in small teams. Ranking managers publicly by their team's scores sounds rigorous, but in units of six or eight staff it can identify individuals, and people stop answering honestly. Use unit-level trends over time and look for positive deviance: the ward that does well under the same conditions as the others, and what it does differently.",
              "Behaviour that leaders tolerate becomes the culture. If theatre starts ninety minutes late every day and nobody is challenged, the hospital's real value is that lateness is acceptable, whatever the poster says.",
            ),
          },
          {
            title: "Leading a change people will adopt",
            body: p(
              "Culture changes when the daily system around people changes and leaders model the new behaviour. Launch events, value statements and workshops help only if the system changes too.",
              "Effective change programmes in hospitals tend to share a sequence.\n- Make the case in staff's own terms: patient harm, wasted effort, lost income that pays salaries. A slide about strategic positioning moves nobody on a night shift.\n- Pick a few specific behaviours, such as handover at the bedside, theatre time-out completed every case, escalation using an early warning score. 'Be more patient-centred' is not a behaviour.\n- Change the system so the right behaviour is the easy one: rota times that allow handover overlap, a checklist built into the theatre record, a call list that makes escalation simple.\n- Have senior leaders model it visibly, and challenge lapses consistently.\n- Measure and show progress unit by unit, and recognise the people and teams who lead.",
              "Restructuring is a tool, not a cure. Owners often reach for a new structure when the real problem is one person's performance. If the head of nursing is underperforming, redrawing the chart around her avoids a difficult conversation and creates new problems. Deal with performance directly, and restructure only when the design is the cause.",
              "When a restructure does remove or change posts, handle it properly. Talk to the people affected before any announcement, follow the hospital's employment law obligations (redundancy rules, consultation, fair selection), and brief line managers so they can answer questions on the day. A structure announced at a staff meeting before the affected people knew destroys trust that the new structure will need.",
              "Mergers and acquisitions bring culture clashes into sharp focus. When a fast, informal hospital joins a protocol-heavy one, do not try to merge everything. Agree a common standard for the few behaviours that matter most, such as handover, escalation, consent and approvals, and leave the rest alone until trust is built.",
              "Expect change to take months, not weeks. Measure the chosen behaviours monthly for at least a year, because improvements that are not tracked tend to fade once attention moves on.",
            ),
          },
        ],
        exercises: [
          {
            title: "Redesign a founder-led hospital",
            instruction:
              "Dr Okonjo founded Riverside Hospital, Asaba, fifteen years ago. It now has 90 beds, 260 staff and a new diagnostic centre opening next year. Twenty-three people report directly to him, including every head of department, the accountant, the HR officer and the facilities supervisor. Purchases above N50,000 need his signature, and duty managers grant patient discounts with no limit or record. Last year discounts and waivers came to N61m. Propose a structure with no more than six direct reports to the founder, a decision rights table for five key decisions with naira thresholds, and a sequence for introducing the change over six months.",
          },
        ],
      },
      resources: { tools: ["Organisation design criteria checklist", "Span and layer analysis template", "Decision rights (RACI) matrix", "Culture diagnostic interview guide"] },
      questions: [
        mc(
          "A founder-medical director has 23 direct reports and decisions queue at his desk. What is the best structural fix?",
          [
            "Hire a personal assistant to manage his diary and filter which requests reach him",
            "Make every head of department report to the accountant instead",
            "Group functions under a few accountable heads with clear decision rights",
            "Hold a weekly meeting with all 23 to clear decisions faster",
          ],
          2,
          "Reducing the span and delegating defined decisions removes the bottleneck. An assistant or a bigger meeting only manages the queue, and putting clinical heads under the accountant breaks the clinical line.",
        ),
        mc(
          "In a clinical directorate model, who is typically accountable for a directorate's quality, activity and budget?",
          [
            "A clinical lead paired with a business or operations manager",
            "The chief executive alone",
            "The finance director, who owns the budget",
            "The most senior consultant, acting without a manager",
          ],
          0,
          "Directorates pair clinical and managerial leadership so one unit owns its service end to end. Leaving it to finance or one consultant reintroduces the gap the model exists to close.",
        ),
        mc(
          "Any duty manager at a hospital can grant patient discounts of any size, with no record. Discounts reached N61m last year. What is the core fix?",
          [
            "Retrain duty managers on the importance of revenue",
            "Ban all discounts and waivers",
            "Ask the founder to approve every discount personally, whatever its size or reason",
            "Decision rights with naira thresholds, and a record of every discount",
          ],
          3,
          "Clear decision rights with thresholds and a record control leakage without creating a bottleneck. Sending every discount to the founder swaps a leakage problem for a speed problem.",
        ),
        mc(
          "A hospital's values poster says 'patients first', but theatre lists start 90 minutes late every day and nobody is challenged. What is the hospital's culture on this point?",
          [
            "Patient-centred, as stated, with an operational problem in theatre",
            "That lateness is acceptable, because tolerated behaviour is the real culture",
            "Unclear until a staff survey has been run",
            "Patient-centred, but with weak theatre scheduling software",
          ],
          1,
          "Culture is what people do and what leaders tolerate, not what the poster says. Treating it as a scheduling problem misses the unstated assumption that being late carries no consequence.",
        ),
        mc(
          "A hospital wants nurses to hand over at the bedside. Which approach is most likely to make the change stick?",
          [
            "A launch event with the owner speaking about patient safety",
            "A memo from the director of nursing making it mandatory on every ward",
            "Rota overlap, seniors modelling it, and measuring it unit by unit",
            "A values workshop for all nursing staff",
          ],
          2,
          "Behaviour lasts when the system makes it easy, leaders model it and progress is visible. A launch event or memo signals intent but leaves the rota that prevents overlap unchanged.",
        ),
        mc(
          "A restructure will remove six supervisor posts. What should happen before it is announced to all staff?",
          [
            "Tell those affected first, follow the legal process and brief line managers",
            "Announce it at a staff meeting first so everyone hears the same message at once",
            "Issue termination letters the same day to avoid rumours",
            "Keep it confidential until the new chart is printed",
          ],
          0,
          "The affected people should hear first, and the legal process must be followed. A single all-staff announcement feels fair but means people learn of their own job loss in public.",
        ),
        mc(
          "A hospital's staff survey covers units of six to eight people. The CEO wants to rank ward managers publicly by their team's scores. What is the risk?",
          [
            "None, provided the survey is anonymous",
            "The rankings will be too close together to tell managers apart",
            "Managers may ask for larger teams",
            "In small units answers can be traced, so honesty falls",
          ],
          3,
          "In small teams, ranked results can point to individuals and staff stop answering truthfully. Anonymity of the form does not help when the group is so small that answers can be traced.",
        ),
        ms(
          "Which signs suggest that the structure, rather than one person, is the problem? Select all that apply.",
          [
            "The same delays recur whoever holds the job",
            "One manager misses deadlines that peers in similar roles meet",
            "Decisions wait for one person's approval",
            "Two departments each believe they own patient discharge",
            "A new hire lacks a skill the role needs",
          ],
          [0, 2, 3],
          "Recurring failure regardless of the post holder, approval bottlenecks and unclear ownership point to design. A single manager falling short of peers, or a skills gap in one hire, are individual issues.",
        ),
        mc(
          "An owner wants to restructure the nursing department because the head of nursing is underperforming. What should you advise?",
          [
            "Go ahead, since a new structure gives her a fresh start",
            "Address her performance directly; restructure only if design is a cause",
            "Restructure, and make her deputy report directly to the owner instead of to her",
            "Create a second head of nursing post to share the role",
          ],
          1,
          "Restructuring to avoid a performance conversation creates new problems and leaves the original one in place. Adding a second head or a new reporting line builds the structure around one person.",
        ),
        mc(
          "Two hospitals have merged. One is fast and informal; the other is protocol-heavy. What is the best first step on culture?",
          [
            "A shared standard for the few behaviours that matter most, such as handover",
            "Impose the protocol-heavy hospital's full manual on both sites from the first day",
            "Leave both cultures alone, since they will merge naturally over time",
            "Run joint social events so staff get to know each other",
          ],
          0,
          "Focusing on a few safety-critical behaviours sets a shared floor without forcing everything at once. Imposing one site's full manual is the tempting choice but provokes resistance and loses what the informal site did well.",
        ),
      ],
    },
  ],
};

export default expansion;
