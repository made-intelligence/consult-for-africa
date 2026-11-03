import type { TrackExpansion, Question, Option } from "./types";

const body = (...paras: string[]) => paras.join("\n\n");
const IDS = ["a", "b", "c", "d", "e"] as const;

/** One-correct question. `correct` is the index of the right option. */
function mc(question: string, options: string[], correct: number, explanation: string): Question {
  return {
    type: "MULTIPLE_CHOICE",
    question,
    options: options.map((text, i): Option => ({ id: IDS[i], text, isCorrect: i === correct })),
    explanation,
  };
}

/** Select-all question. `correct` lists the indices of the right options. */
function ms(question: string, options: string[], correct: number[], explanation: string): Question {
  return {
    type: "MULTI_SELECT",
    question,
    options: options.map((text, i): Option => ({ id: IDS[i], text, isCorrect: correct.includes(i) })),
    explanation,
  };
}

const expansion: TrackExpansion = {
  slug: "elective-service-lines",
  track: {
    name: "Elective & Self-Pay Service Lines",
    description:
      "How to build and run the services Nigerian patients choose and pay for themselves. The track covers pricing self-pay care from cost and market, setting up an aesthetics service that satisfies its regulators, building packaged procedures such as IVF and joint replacement that do not lose money on the hard cases, serving inbound and diaspora patients, and handling the consent, complications and complaints that come with elective care.",
    level: "SPECIALIST",
    category: "growth",
    iconName: "badge-percent",
    colorHex: "#0F766E",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "PAID",
  },
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "self-pay-pricing",
      name: "Pricing Self-Pay Services",
      description:
        "Setting self-pay prices from a cost floor and a market view, defining packages, deposits and refunds, and controlling discounts so they do not quietly erase the margin.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "Start from the cost floor",
            body: body(
              "A self-pay price should never be set below the cost of delivering the service, and most Nigerian hospitals do not know that cost for their elective procedures. Building it is the first job.",
              "For a procedure, the cost floor has four parts:",
              "- Direct consumables and implants: drugs, sutures, disposables, the implant or device, laboratory tests, imaging. Take these from actual issue records for recent cases, not the theatre list.\n- Theatre and bed time: minutes in theatre multiplied by a cost per theatre minute, plus nights on the ward multiplied by a cost per bed night. Both rates come from the hospital's annual costs for those areas, including staff, power and diesel, maintenance and depreciation, divided by the hours or nights actually used.\n- Professional fees: what the surgeon, anaesthetist and assistants are paid for the case, whether salaried time or sessional fees.\n- A share of overheads: administration, records, security, marketing, usually as a percentage on top.",
              "Exchange rates matter more than most clients admit. Implants, many consumables and some drugs are imported and priced in dollars or euros. A price list set when the naira was at one rate can become loss-making within months. The cost model should show which lines are dollar-linked, and the price policy should state how often prices are reviewed and what movement triggers an early review.",
              "Use real cases. Pull the last 10 to 20 cases of the procedure and cost them from records. The spread is informative: if most cases cost N900,000 but three cost over N1.5m because of long stays or complications, the price has to cover that risk somewhere, either in the base price or in stated exclusions.",
              "The cost floor is not the price. It is the line below which the hospital loses money on every case, and it tells the client how much room it has when the market view comes in."
            ),
          },
          {
            title: "Read the market, including the one abroad",
            body: body(
              "Self-pay patients compare, but in Lagos they compare with poor information, because most private facilities do not publish prices. That makes market data harder to get and more valuable once you have it.",
              "Gather local prices by structured mystery shopping: calls or WhatsApp enquiries to comparable facilities asking for a quote for a defined case, recorded with the date, what the quote includes and what it excludes. Quotes are often for different things, one including the surgeon's fee and three nights, another excluding both, so normalise them before comparing. Speak to referring doctors and to patients who chose elsewhere; they know what they were quoted.",
              "For services that patients can travel for, the relevant market includes other countries. Nigerian patients and diaspora patients compare Lagos with the UK, the US, India, Turkey, the UAE and sometimes Ghana. For many elective services, Lagos self-pay prices sit well below US and UK prices. In aesthetics, the gap is wide: Lagos clinics often charge a fraction of what a comparable procedure costs in a US or UK private clinic, though they rarely say so publicly. The comparison abroad should be all-in for the patient, including flights, accommodation and time off, which widens the Lagos advantage for a patient already in Nigeria and narrows it for one travelling from India.",
              "Position the price deliberately. A hospital can price at the top of the local range if it can show why: named specialists, accreditation such as SafeCare or JCI, published outcome data, a better facility. It can price in the middle and compete on reliability. Pricing at the bottom is rarely wise for elective services, because patients read a low price as a warning about quality, and because it leaves no margin for the hard cases.",
              "Write the result as a range: cost floor, local market range, the price abroad, and the proposed price with its rationale. That one line per service is what a client's leadership can actually decide on."
            ),
          },
          {
            title: "Packages, deposits and refunds",
            body: body(
              "A self-pay patient needs to know before treatment what they will pay and what happens if things change. Written terms are what turn a price into a promise the hospital can keep.",
              "State inclusions and exclusions on the quote. For a surgical package, that means which consultations, tests, theatre time, anaesthesia, implants, nights on the ward, drugs to take home and follow-up visits are covered, and what is not: additional nights beyond a cap, ICU care, blood products, treatment of unrelated conditions found on the way. Vague phrases such as 'all-inclusive' lead to disputes the hospital will lose in public.",
              "Deposits do two jobs. They confirm the patient's commitment, which protects scarce theatre and specialist time, and they fund dollar-linked items such as implants that must be ordered in advance. A common structure is a booking deposit when the date is fixed, with the balance due before admission. Instalment plans and patient finance through third-party lenders can open the service to more patients, but the hospital should not carry the credit risk of a patient who has already been treated.",
              "Refund and cancellation terms must be written and given before any money is paid. They should say what portion is non-refundable and why (an implant ordered for this patient, a booked theatre session), what happens if the patient reschedules once, and what happens if the hospital cancels. Patients who are told nothing assume everything is refundable and feel cheated when it is not.",
              "Price advertising is advertising. A clinic that publishes 'Tummy tuck from N1.8m' in a sponsored post must have that advert vetted by ARCON, must be able to deliver the service for that price to a real patient, and must state what 'from' depends on.",
              "Payment by card, transfer and payment gateways is routine; for diaspora patients the hospital needs a way to take foreign currency or international cards, and a clear rule on which exchange rate applies."
            ),
          },
          {
            title: "Discounts without destroying the price",
            body: body(
              "Discounts are where self-pay margins disappear. They are given by many people, for many reasons, and rarely recorded, so the hospital's real price drifts well below its list price without anyone deciding it should.",
              "The arithmetic is unforgiving. If a procedure is priced at N1.2m and costs N900,000, the margin is N300,000. A 15% discount, N180,000, takes away 60% of that margin. To make up the lost margin, the hospital would need about two and a half more discounted cases for every one it discounted. Clients usually see a discount as a small concession on the price; it is a large cut in the profit.",
              "A discount policy needs four parts:",
              "- An authority matrix: who may give what. Front desk staff none, a service manager up to a stated percentage, the medical director or CEO above that.\n- Defined categories: staff and their families, clergy or community partners, hardship cases assessed against criteria, launch promotions with a fixed end date.\n- A discount log: every discount recorded with the patient, the amount, the reason and who approved it.\n- A monthly review: total discounts as a share of gross self-pay revenue, by service and by approver.",
              "Watch for discounts that are really pricing problems. If almost every patient for a given procedure receives a discount, the list price is wrong for the market and should be changed openly, not undercut case by case.",
              "Promotions can be useful to launch a service or fill quiet periods, but they train patients to wait. A short, dated launch offer, clearly advertised and vetted, is better than a standing 'call us for a special price'.",
              "Doctors who negotiate their own fee down with a patient should do so within the policy, so the hospital's portion is not discounted by someone with no authority over it."
            ),
          },
        ],
        exercises: [
          {
            title: "Price a laparoscopic cholecystectomy",
            instruction:
              "Oakridge Specialist Hospital, Gbagada, wants a self-pay price for laparoscopic cholecystectomy. From 15 recent cases: consumables average N310,000 (of which N180,000 is dollar-linked), theatre time averages 95 minutes at N2,400 per minute, stay averages 1.8 nights at N65,000 per night, professional fees total N250,000, overheads are charged at 15% of direct cost. Three cases stayed 5 nights. Mystery shopping shows four competitors quoting N1.1m to N1.9m with different inclusions. Build the cost floor, propose a package price with inclusions, exclusions and a night cap, set deposit and refund terms, and state how a 20% naira depreciation would change your recommendation.",
          },
        ],
      },
      resources: { tools: ["Procedure costing sheet", "Mystery shopping log", "Discount authority matrix"] },
      questions: [
        mc(
          "A hospital sets its knee arthroscopy price by adding 10% to the average competitor quote. What is the main risk?",
          [
            "The price may sit below the hospital's own cost of delivering the procedure",
            "The price will be too high for the market, since patients choose the cheapest quote",
            "ARCON will object to the price",
            "Competitors will match it",
          ],
          0,
          "Without a cost floor, a market-based price can lose money on every case. Being 10% above competitors is a positioning choice, not a guarantee of margin."
        ),
        mc(
          "A procedure costs N900,000 and is priced at N1.2m. A 15% discount is given. What share of the margin is lost?",
          ["15%", "20%", "60%", "80%"],
          2,
          "The discount is N180,000 out of a N300,000 margin, so 60%. The 15% figure is the cut in price, which understates the cut in profit."
        ),
        mc(
          "Implants make up half of a hip replacement's direct cost and are priced in dollars. The naira falls 25% over four months. The price list was last reviewed a year ago. What should the price policy have provided for?",
          [
            "Annual price reviews only, to keep prices stable for patients",
            "Pricing all procedures in dollars so the exchange rate risk sits with the patient",
            "Absorbing the change as a cost of doing business",
            "A review trigger tied to exchange rate movement on dollar-linked lines",
          ],
          3,
          "A trigger lets the hospital reprice dollar-linked services when costs move, without changing everything. Pricing in dollars for local patients raises its own legal and commercial problems."
        ),
        mc(
          "Mystery shopping returns four quotes for a hysterectomy: N1.2m, N1.5m, N1.9m and N2.4m. What must happen before these are compared?",
          [
            "Average them to find the market price",
            "Normalise them to the same inclusions, such as surgeon's fee, nights and tests",
            "Drop the highest and lowest",
            "Ask each competitor for a written confirmation of the quote on headed paper before using it",
          ],
          1,
          "Quotes often cover different things, so the spread may reflect inclusions rather than price. Averaging unlike quotes gives a meaningless figure."
        ),
        mc(
          "A clinic wants to price its new rhinoplasty service at the bottom of the Lagos range to win volume. What is the strongest objection?",
          [
            "ARCON forbids low prices",
            "Patients will travel abroad instead",
            "It leaves no margin for the hard cases, and patients often read a low elective price as a sign of low quality",
            "Competitors will report the clinic to the MDCN for undercutting, which is professional misconduct",
          ],
          2,
          "Low elective prices carry a quality signal and remove the buffer for complex cases. There is no rule against low prices as such."
        ),
        ms(
          "Which elements belong in a self-pay discount policy? Select all that apply.",
          [
            "An authority matrix setting who may approve what",
            "Defined categories of discount",
            "A log of every discount with reason and approver",
            "Permission for front desk staff to discount up to 30% to close a sale",
          ],
          [0, 1, 2],
          "Authority limits, categories and a log make discounts visible and controlled. Letting front desk staff give large discounts is the leak the policy exists to close."
        ),
        mc(
          "Almost every patient for a hospital's laser hair removal course receives a 20% discount on request. What does this suggest?",
          [
            "Staff are generous and should be retrained",
            "The list price is wrong for the market and should be changed openly",
            "The discount log is working well",
            "The service should be stopped",
          ],
          1,
          "When nearly everyone is discounted, the real price is the discounted one. Setting it openly removes case-by-case erosion and makes the margin visible."
        ),
        mc(
          "A patient paid a N500,000 booking deposit for a breast reduction. She cancels a week before surgery. No refund terms were given. What is the most likely outcome?",
          [
            "The hospital can keep the full deposit, because it had already booked theatre time and the surgeon",
            "The patient has no claim as she cancelled",
            "MDCN will decide the refund",
            "A dispute the hospital is likely to lose in public, because the terms were never set out",
          ],
          3,
          "Without written terms given before payment, the patient reasonably assumes the deposit is refundable. Terms stated at quote stage prevent the dispute."
        ),
        mc(
          "A sponsored Instagram post reads 'Liposuction from N1.5m'. Which statement is correct?",
          [
            "It needs ARCON vetting, and the clinic must be able to deliver at that price",
            "Prices in adverts are exempt from vetting",
            "'From' prices are not allowed in Nigeria",
            "Only the MDCN needs to approve it, because price adverts by clinics are a matter of medical ethics",
          ],
          0,
          "Price claims in adverts are subject to vetting like any other content, and a 'from' price must be real for some patients. The rule is about truthful and vetted advertising, not a ban on prices."
        ),
        mc(
          "A hospital wants to offer instalment payments for IVF. Which structure best protects the hospital?",
          [
            "Treatment first, then instalments over 12 months, secured by post-dated cheques from the patient",
            "No deposits, so more patients start",
            "A third-party patient finance provider pays the hospital, and the patient repays the lender",
            "Instalments collected by the consultant personally",
          ],
          2,
          "Using a lender keeps the credit risk off the hospital. Treating first and collecting later leaves the hospital as an unsecured creditor of a patient whose treatment is already done."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "aesthetics-service-setup",
      name: "Setting Up an Aesthetics Service",
      description:
        "Building an aesthetics service a regulator would pass: the clinical lead and scope, facility registration and product regulation, rooms and devices, and consent, photography and complications.",
      estimatedMinutes: 85,
      content: {
        sections: [
          {
            title: "Scope and the clinical lead",
            body: body(
              "An aesthetics service is a medical service, and it should be set up around a qualified clinical lead and a written scope, not around a list of treatments someone saw on social media.",
              "Decide the scope in tiers, because each tier has different staff, room and risk requirements:",
              "- Skin and non-invasive treatments: medical-grade facials, chemical peels, skin analysis.\n- Injectables: botulinum toxin, dermal fillers, skin boosters.\n- Energy-based devices: lasers, intense pulsed light, radiofrequency and similar.\n- Minor procedures: thread lifts, mole and lesion removal, small liposuction under local anaesthesia.\n- Surgical aesthetics: breast, abdominal, facial and body contouring surgery under general or sedation anaesthesia.",
              "The clinical lead should be a doctor registered with the MDCN whose training fits the highest tier offered. A plastic surgeon leads a service that includes surgery. A dermatologist suits a skin, laser and injectables service. A general practitioner with recognised aesthetic training may lead injectables in some services, but should not be the lead for surgery or complex laser work.",
              "Write down who may do what. Botulinum toxin is a prescription medicine, so it must be prescribed by a doctor after an assessment of the patient, even if a trained nurse administers it under a protocol. Fillers carry a risk of vascular occlusion, which can cause skin death or, rarely, blindness, so injectors need training in recognising and treating it and a doctor available. Nurses working in the service should be registered with the NMCN and trained in the specific treatments they perform.",
              "Avoid the commonest setup error: hiring a charismatic injector who brings followers but has no clear qualification, and building the service around them. When something goes wrong, the hospital carries the liability, and the regulators will ask who was qualified to do what."
            ),
          },
          {
            title: "Registration and regulation",
            body: body(
              "An aesthetics service sits under several regulators at once, and setting it up means checking each before the first patient is booked.",
              "Facility registration comes first. In Lagos, private facilities are registered with HEFAMAA for defined categories of service. A hospital adding aesthetic surgery, or a standalone clinic offering injectables and lasers, needs to confirm that its registration covers what it will do, and to apply for any change before it starts. Other states have their own regulators or ministry processes.",
              "Professional registration covers the people. Doctors must hold current MDCN registration and practising licences, and nurses current NMCN licences. A visiting surgeon from abroad needs the appropriate MDCN registration route for foreign-trained or visiting practitioners before operating in Nigeria; a social media following is not a licence.",
              "Products are regulated by NAFDAC. Botulinum toxin products, fillers, skin boosters, topical medicines and many devices need NAFDAC registration for sale and use in Nigeria. Grey imports, products bought abroad or online and carried in by hand, are a real problem in the Lagos aesthetics market: their origin, storage and authenticity are unknown and using them exposes the clinic. Buy only from licensed distributors and keep the invoices and batch numbers.",
              "Prescription medicines must be stored and dispensed under pharmacy rules. If the clinic keeps botulinum toxin and other prescription products on site, it needs appropriate pharmaceutical oversight and storage, and the Pharmacists Council of Nigeria's requirements for premises and personnel apply where the clinic dispenses medicines.",
              "Advertising is under ARCON, and doctors' self-promotion under the MDCN Code, as covered elsewhere in this track. Before-and-after images are the aesthetics marketer's favourite tool and the one most likely to breach consent or advertising rules.",
              "Patient records and photographs are health data under the NDPA. Photographs taken on a staff member's personal phone are the most common breach."
            ),
          },
          {
            title: "Rooms, devices and the numbers",
            body: body(
              "The physical setup should match the scope, and every expensive device should be bought against a utilisation plan, because idle lasers are where aesthetics businesses lose their capital.",
              "Rooms by tier. A consultation room with good lighting and a standard photography point. Treatment rooms for injectables and skin with a clinical couch, handwashing and storage. A laser room with controlled access, warning signage, eye protection for patient and operator matched to the laser's wavelength, no reflective surfaces, and a named laser protection lead. A procedure room for minor procedures with resuscitation equipment. Surgery belongs in a proper theatre with anaesthetic support, recovery and access to higher-level care.",
              "Every room where injectables are given needs a stocked emergency kit: for fillers, hyaluronidase to dissolve hyaluronic acid filler in case of vascular occlusion; for all injectables, drugs and equipment to manage anaphylaxis. Staff should rehearse using them.",
              "Cold chain matters. Botulinum toxin must be stored within the manufacturer's temperature range, which needs a pharmaceutical refrigerator with temperature logging and power backup. In a facility running on generators, the fridge should be on a circuit that does not go off at night.",
              "Devices are bought, leased or rented per session. Check that the device is registered for use in Nigeria, that the supplier provides local servicing and parts, and what consumables each treatment uses. Then work the numbers. A laser costing N45m with service and consumables of N6m a year, earning N60,000 net per session after consumables and operator cost, needs 750 sessions to repay its purchase price, or about 15 a week for a year. If the realistic demand is six a week, the payback stretches to about two and a half years, before servicing. Renting per session, or buying a cheaper device first, is often the better start.",
              "Staff the service for demand, not for the brochure. A single trained injector working three days a week, with a doctor available, may be the right start."
            ),
          },
          {
            title: "Consent, photography and complications",
            body: body(
              "Aesthetic treatment is chosen, not needed, so consent has to be fuller than for most medicine, and the service must be ready for the complications it will eventually see.",
              "Consent is a conversation recorded on paper, not a signature. The patient should hear what the treatment will and will not achieve, how long results last, the common and serious risks, the alternatives including no treatment, the full cost including touch-ups and what happens if a complication needs treatment. For surgical aesthetics, a cooling-off period between consultation and the operation gives the patient time to reconsider; for injectables, at least the consultation should happen before treatment, not five minutes before.",
              "Screen for patients who should not be treated. Pregnancy, certain medical conditions and medicines, unrealistic expectations and signs of body dysmorphic disorder, where a patient is preoccupied with a defect others cannot see, are reasons to decline or refer. Turning a patient away is a clinical judgement the service must support, even when the patient is ready to pay.",
              "Standardise clinical photography. Same room, lighting, background, distance, angles and expression for every before and after image, taken on a clinic device and stored in the patient record. Good photographs protect the clinic when a patient later says nothing changed.",
              "Plan for complications. Write protocols for vascular occlusion, infection, allergic reaction, burns from lasers and poor results. Each protocol names who is called, what is given, and when to transfer. A surgical aesthetics service needs a written transfer arrangement with a hospital that has ICU care.",
              "Record batch numbers of every product injected, so a recall can be traced to patients. Keep an adverse events log, review it monthly with the clinical lead, and act on patterns: three bruising complaints in a week from one injector is a training question, not bad luck."
            ),
          },
        ],
        exercises: [
          {
            title: "Plan an aesthetics launch",
            instruction:
              "Cedarline Hospital, Ikoyi, a 60-bed general hospital registered with HEFAMAA, wants to open an aesthetics suite in six months: injectables, lasers and, later, surgical aesthetics. It has one plastic surgeon who operates elsewhere two days a week and no dermatologist. A supplier offers a N52m laser on a five-year lease at N1.3m a month including servicing; the hospital estimates 8 laser sessions a week at N85,000 each with N20,000 consumables per session. Set out the scope in phases, the clinical lead and staffing, the regulatory checklist with owners, the room plan, and whether to lease the laser. Show the laser numbers.",
          },
        ],
      },
      resources: { tools: ["Aesthetics scope and staffing matrix", "Device business case template", "Complications protocol template"] },
      questions: [
        mc(
          "A hospital plans an aesthetics service offering injectables, lasers and breast and abdominal surgery. Who is the most appropriate clinical lead?",
          [
            "A popular injector with a large social media following",
            "A general practitioner who completed a weekend filler course and has run the hospital's skin clinic",
            "The hospital's nurse manager",
            "An MDCN-registered plastic surgeon, since the highest tier offered is surgery",
          ],
          3,
          "The lead's training should match the highest tier offered. A GP with short aesthetic training may suit an injectables-only service but not one including surgery."
        ),
        mc(
          "A trained nurse is to give botulinum toxin in a new clinic. What must be in place?",
          [
            "Nothing beyond the nurse's training certificate",
            "A doctor's assessment and prescription for each patient, with the nurse working under a written protocol",
            "Approval from ARCON",
            "The patient's signature on a waiver accepting the risks, which transfers responsibility from the clinic to the patient",
          ],
          1,
          "Botulinum toxin is a prescription medicine, so a doctor must assess and prescribe even when a nurse administers. A waiver does not substitute for prescribing rules."
        ),
        mc(
          "A clinic is offered filler at 40% below the distributor's price by a contact who brings it from Dubai in hand luggage. What should the consultant advise?",
          [
            "Decline: buy only NAFDAC-registered products through licensed distributors and keep batch records",
            "Accept, provided the packaging looks genuine",
            "Accept, but use it only in low-risk areas such as lips and keep the receipt from the Dubai seller",
            "Accept, and keep it in the pharmacy fridge",
          ],
          0,
          "Grey imports have unknown origin, storage and authenticity and expose the clinic to regulatory and clinical risk. Packaging is easily copied."
        ),
        ms(
          "Which must be in place before a clinic starts dermal filler treatments? Select all that apply.",
          [
            "Hyaluronidase on site and staff trained to recognise and treat vascular occlusion",
            "Drugs and equipment to manage anaphylaxis",
            "A record of the batch number for each product used",
            "An influencer launch event",
          ],
          [0, 1, 2],
          "Emergency readiness and traceability are basic requirements for injectables. A launch event is marketing and has nothing to do with readiness to treat."
        ),
        mc(
          "A laser costs N45m. Each session earns N60,000 net. Realistic demand is 6 sessions a week. Roughly how long will it take to earn back the purchase price, before servicing?",
          ["About 6 months", "About 1 year", "About two and a half years", "About 10 years"],
          2,
          "750 sessions are needed (N45m divided by N60,000), and at about 310 sessions a year that is roughly two and a half years. One year would need about 15 sessions a week."
        ),
        mc(
          "A Lagos hospital registered with HEFAMAA as a general hospital wants to add liposuction under sedation. What should it check first?",
          [
            "That its HEFAMAA registration covers the service, and apply for any change before starting",
            "That its website has a page for the service",
            "That competitors nearby offer the same procedure, so there is proven demand before investing",
            "That the surgeon has a social media following",
          ],
          0,
          "Facility registration defines what services the hospital may provide. Starting a service outside it is a breach whatever the clinical quality."
        ),
        mc(
          "During consultation, a patient fixates on a small nose asymmetry that the doctor can barely see, has had two previous procedures and says she cannot leave home because of it. What is the right response?",
          [
            "Proceed, as she is an adult paying for her choice",
            "Proceed but do a more conservative procedure than she asked for, which reduces the risk of a poor result",
            "Book her for next week to keep her as a patient",
            "Decline to treat for now and refer for assessment, as these are possible signs of body dysmorphic disorder",
          ],
          3,
          "Preoccupation with a barely visible defect, repeated procedures and distress are warning signs. Treating is unlikely to satisfy her and exposes the service to complaint and harm."
        ),
        mc(
          "A clinic's botulinum toxin is stored in a fridge on a generator circuit that is switched off from midnight to 6am. What is the problem?",
          [
            "None, as the fridge stays closed overnight",
            "The cold chain is broken nightly, so the product may fall outside the manufacturer's storage range",
            "The fridge restarts each morning, so the main issue is the extra diesel and wear on the fridge's compressor",
            "Toxin does not need refrigeration",
          ],
          1,
          "Toxin must be kept within the manufacturer's temperature range, and a fridge without power for six hours will not hold it. The fix is a protected circuit and temperature logging."
        ),
        mc(
          "Before-and-after photographs in a clinic are taken by staff on their own phones in whatever room is free. Which risk is most serious?",
          [
            "The photographs may look unprofessional on social media",
            "Staff will spend too long on their phones",
            "Health data held on personal devices is a data protection breach, and inconsistent images cannot be relied on in a dispute",
            "The phones' storage will fill up",
          ],
          2,
          "Patient photographs are health data under the NDPA and belong on clinic systems. Standardised images also protect the clinic when a patient disputes the result."
        ),
        ms(
          "A clinic is choosing whether to buy, lease or rent per session a new laser. Which checks matter? Select all that apply.",
          [
            "Whether the device is registered for use in Nigeria",
            "Whether the supplier offers local servicing and parts",
            "Expected sessions per week against the break-even number",
            "The device's colour and branding",
          ],
          [0, 1, 2],
          "Registration, local support and utilisation decide whether a device is legal, usable and affordable. Appearance does not change any of these."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "packaged-procedures",
      name: "Packaged Procedures",
      description:
        "Building fixed-price packages for fertility, joint replacement and common surgery: defining the episode, costing it from real cases, protecting against outliers and complications, and selling the package honestly.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "What a package promises",
            body: body(
              "A package is a fixed price for a defined episode of care. It moves the risk of cost variation from the patient to the hospital, and the hospital must decide how much of that risk it is willing to carry and price it accordingly.",
              "Patients like packages because they can plan and borrow against a known number. Hospitals like them because a clear price sells better than an open estimate and because packages force the hospital to standardise care. Both benefits depend on the package being well defined.",
              "Every package needs a stated start and end. Does it start at the first consultation, at the decision to operate, or on admission? Does it end at discharge, at the two-week wound check, or at six weeks? The longer the episode, the more the hospital carries, and the more the price must include.",
              "It also needs a stated patient. A knee replacement package priced on a healthy 62-year-old who goes home on day three will lose money on a 78-year-old with diabetes and heart disease who needs high-dependency care. Packages normally state eligibility, such as age range, body mass index limits or the absence of specified conditions, and either price higher-risk patients separately or exclude them from the package.",
              "Packages work best for procedures that are common, reasonably predictable and done often enough for the hospital to know its costs: caesarean section, laparoscopic cholecystectomy, hernia repair, myomectomy, hysterectomy, cataract surgery, joint replacement, IVF cycles. They work badly for complex cancer surgery, major trauma or anything where the course is unknown at the start.",
              "The test of a package is whether the hospital can tell a patient, on one page, exactly what they will pay, what it covers, and what would cost extra and why. If that page cannot be written, the procedure is not ready to be packaged."
            ),
          },
          {
            title: "Building the price from the episode",
            body: body(
              "Cost the package from the episode map, item by item, using real case data. The general cost-floor method applies; what is specific to packages is listing every encounter in the episode so nothing is left out.",
              "A fresh IVF cycle shows the method. The episode usually runs from the planning consultation to the pregnancy test. It includes consultations and scans during stimulation, stimulation drugs, the egg collection under sedation, laboratory and embryology work, the embryo transfer, and the pregnancy test. Common exclusions, each needing its own price, are ICSI where it is not routine, embryo freezing and storage, frozen embryo transfers, genetic testing of embryos, and donor eggs or sperm. Stimulation drug cost varies a lot with dose, which depends on the patient's age and ovarian reserve; many clinics price drugs separately or in bands for this reason.",
              "A total knee replacement is different. The episode runs from pre-operative assessment to a follow-up visit at around six weeks. It includes pre-operative tests and anaesthetic review, the implant, theatre time, anaesthesia, the surgeon's and assistants' fees, a capped number of nights, physiotherapy in hospital, drugs to take home, and follow-up visits. Exclusions normally include blood transfusion, ICU or high-dependency care, extra nights beyond the cap, and treatment of complications not caused by the hospital. The implant is often the single largest cost and is dollar-linked.",
              "For common general surgery, such as a laparoscopic cholecystectomy or hernia repair, the episode is shorter and the main variables are theatre time and length of stay, so a night cap and a stated conversion clause (what happens if a laparoscopic procedure must convert to open surgery) do most of the work.",
              "Build the episode map with the surgeon or fertility lead, the theatre manager, pharmacy and finance together. Clinicians know what actually happens; finance knows what it costs. A package priced by either alone is usually wrong."
            ),
          },
          {
            title: "Outliers, complications and who pays",
            body: body(
              "A package makes money on the typical case and loses it on the outliers, so its terms must say in advance what happens when a case is not typical.",
              "Look at the spread in the last 20 cases. If most knee replacements cost N4.2m but three cost over N6m because of long stays, return to theatre or a transfusion, the hospital has three choices. It can price the package high enough to absorb those cases, which makes it uncompetitive. It can exclude the drivers, such as nights beyond four and blood products, and charge them separately at published rates. Or it can include a contingency for a limited set of events and exclude the rest. Most hospitals combine the second and third.",
              "Write the outlier rules clearly:",
              "- A night cap, with the daily rate for extra nights.\n- Named exclusions with their prices: ICU per day, transfusion per unit, additional imaging.\n- A complications clause: complications that arise from the hospital's own care, such as a wound infection, are usually treated within the package, while unrelated conditions or complications from the patient not following instructions are charged.\n- A conversion clause for procedures that can change course in theatre.",
              "Patients must see these terms before they pay. A family told at discharge that the 'package' did not cover ICU will feel misled, and in elective care that feeling becomes a public complaint quickly.",
              "Track actual cost per case against the package price every quarter. Record length of stay, theatre time, returns to theatre, transfusions and readmissions for each package. If the average cost creeps up, find out whether it is case mix, exchange rate, a change in practice or one surgeon. A package that has not been reviewed for a year in an economy with moving exchange rates is probably losing money.",
              "Surgeon behaviour matters. If one surgeon's cases cost 30% more than another's for the same package, the hospital has a variation question for the clinical lead to discuss, not only a pricing problem."
            ),
          },
          {
            title: "Selling a package honestly",
            body: body(
              "Packages are sold on price and on confidence in the result, and the result claims are where packages most often mislead.",
              "Fertility is the clearest example. A clinic can quote success rates in many ways: clinical pregnancy per cycle started, per egg collection or per embryo transfer, or live birth per cycle. Each gives a different number for the same clinic, and pregnancy per transfer can be far higher than live birth per cycle started. Success also falls sharply with the woman's age. An honest quote states the measure, the age band, the period and the number of cycles behind it. A clinic quoting '65% success' without these is either confused or misleading its patients.",
              "For surgery, the equivalent is stating what the patient can expect: how long in hospital, how long until they can work or drive, typical recovery milestones, and the main risks with a sense of how common they are. Outcome data the hospital collects, such as infection rates or readmissions for its own cases, is more persuasive than generic figures and keeps the team honest.",
              "Present the package on one written page. It should show the price, inclusions, exclusions with their prices, eligibility, the deposit and payment terms, refund and cancellation terms, and who to call with questions. The surgeon or fertility specialist should go through it with the patient, and the patient should take it home.",
              "Avoid 'money-back guarantee' offers on results, such as 'baby or your money back', unless the hospital has costed the refund properly, defined eligibility tightly and taken advice on how such an offer can be advertised. These schemes exist abroad but require careful design, and a loosely worded one invites dispute and regulatory attention.",
              "Multi-cycle IVF bundles, where the patient pays for several cycles up front at a lower price per cycle, can be fair if the terms are clear about what happens if the patient becomes pregnant early or stops."
            ),
          },
        ],
        exercises: [
          {
            title: "Package a total knee replacement",
            instruction:
              "Northgate Orthopaedic Hospital, Abuja, did 22 total knee replacements last year. Median cost per case was N4.1m: implant N1.9m (dollar-linked), theatre N650,000, professional fees N700,000, 4 nights at N120,000, other consumables and drugs N370,000. Four cases cost over N5.8m: two stayed 9 nights, one needed 2 days of high-dependency care at N450,000 a day, one needed 3 units of blood at N60,000 each. Competitors quote N4.8m to N6.5m with unclear inclusions. Design the package: eligibility, inclusions, exclusions with prices, night cap, complications clause and price. Then write the one-page patient summary.",
          },
        ],
      },
      resources: { tools: ["Episode map template", "Package cost tracker", "Patient package summary template"] },
      questions: [
        mc(
          "A hospital priced its knee replacement package on a healthy 62-year-old. A 79-year-old with heart failure asks for the same package. What should the package terms already provide for?",
          [
            "Eligibility criteria, with higher-risk patients priced separately or assessed outside the package",
            "Accepting all patients at the same price to avoid discrimination",
            "Refusing all patients over 70",
            "A surcharge decided by the surgeon on the day of admission, depending on how unwell the patient looks then",
          ],
          0,
          "Packages are priced on a defined patient, so eligibility protects both the hospital and the patient from surprises. A blanket age refusal ignores clinical judgement."
        ),
        mc(
          "An IVF clinic advertises '65% success'. On inspection, this is clinical pregnancy per embryo transfer for women under 35. What should it state instead?",
          [
            "The same figure, since it is accurate",
            "The higher pregnancy-per-transfer figure for all age groups combined, since that is the common industry norm abroad",
            "The measure used, the age band, the period and the number of cycles, ideally alongside live birth per cycle started",
            "No success rates at all",
          ],
          2,
          "Pregnancy per transfer in young women is the most flattering measure and can mislead older patients. Stating the measure and denominators lets patients compare honestly."
        ),
        mc(
          "Last year's laparoscopic cholecystectomy cases mostly cost N950,000, but four were converted to open surgery and cost over N1.6m. What should the package include?",
          [
            "A price high enough that converted cases are covered within it, so patients never face an extra bill",
            "Nothing, since conversions are rare",
            "A clause stating what happens and what is charged if the procedure converts to open surgery",
            "A promise that conversions will not happen",
          ],
          2,
          "A conversion clause handles a known course change transparently. Pricing everyone for the worst case makes the package uncompetitive."
        ),
        ms(
          "Which items are typically excluded from a fresh IVF cycle package and priced separately? Select all that apply.",
          [
            "Embryo freezing and storage",
            "Genetic testing of embryos",
            "The egg collection procedure",
            "Frozen embryo transfers",
          ],
          [0, 1, 3],
          "Freezing, genetic testing and frozen transfers are add-ons that not every patient needs. Egg collection is a core step of every fresh cycle and belongs in the package."
        ),
        mc(
          "A family is told at discharge that two days of ICU care after a hysterectomy were not covered by the 'all-inclusive' package. What went wrong?",
          [
            "The family should have read the hospital's website",
            "The ICU charge should be written off",
            "The package should have been priced higher so ICU could be included for every patient",
            "The exclusions and their prices were not set out in writing before the patient paid",
          ],
          3,
          "Patients must see exclusions before committing. 'All-inclusive' without stated exclusions invites exactly this dispute."
        ),
        mc(
          "A wound infection develops after a packaged hernia repair at the hospital. Under a typical complications clause, who pays for its treatment?",
          [
            "The hospital, because it arises from the hospital's own care",
            "The patient, because complications are always excluded",
            "The patient's HMO",
            "The surgeon personally",
          ],
          0,
          "Complications arising from the hospital's care are usually treated within the package. Unrelated conditions or complications from not following instructions are typically charged."
        ),
        mc(
          "Quarterly tracking shows one surgeon's knee replacements cost 30% more than his colleague's for the same package. What is the right first step?",
          [
            "Raise the package price for all patients",
            "Stop offering the package",
            "Ask the clinical lead to review the variation with both surgeons, looking at stay, theatre time and complications",
            "Charge that surgeon's patients a higher package price, since his cases are known to cost the hospital more to treat and nurse",
          ],
          2,
          "Unexplained variation between surgeons is a clinical and operational question before it is a pricing one. Repricing hides the cause."
        ),
        mc(
          "Who should build the episode map for a new package?",
          [
            "Finance alone, from the general ledger",
            "The surgeon alone, from clinical experience",
            "Marketing, based on competitors' brochures",
            "The clinical lead, theatre manager, pharmacy and finance together",
          ],
          3,
          "Clinicians know what actually happens in the episode and finance knows what it costs. Either working alone misses items or misprices them."
        ),
        mc(
          "A clinic offers a three-cycle IVF bundle at a lower price per cycle. A patient becomes pregnant on the first cycle. What should the terms say?",
          [
            "Nothing; the patient has bought three cycles",
            "What happens to the unused cycles, such as a partial refund or a defined credit, stated before payment",
            "That the remaining cycles expire on pregnancy, since the bundle was priced on the risk of several cycles",
            "That the patient must use the cycles for a second child",
          ],
          1,
          "Bundles are fair only if early success or stopping is dealt with clearly in advance. Leaving it silent creates a dispute at a moment of great sensitivity."
        ),
        mc(
          "A package for hip replacement has not been reviewed in 14 months. The implant is dollar-linked and the naira has fallen 30%. What is most likely?",
          [
            "The package is still profitable because volumes rose",
            "The package is now probably losing money on each case",
            "The implant supplier will hold the old price",
            "Patients will notice and complain",
          ],
          1,
          "When the largest cost is dollar-linked and the currency falls, an unreviewed naira price erodes margin quickly. Volume growth makes the loss larger, not smaller."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "inbound-medical-tourism",
      name: "Inbound Medical Tourism and Diaspora Patients",
      description:
        "Serving patients who travel to Nigeria for care: who they are, why the hospital rather than the clinic decides whether a destination works, the cross-border patient journey, and pricing, payment and trust.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Who travels in, and why",
            body: body(
              "Inbound medical travel to Nigeria is driven mainly by Nigerians abroad and by patients from nearby countries, and each group is choosing for different reasons.",
              "Diaspora Nigerians in the UK, the US, Canada and elsewhere travel home for care for a mix of reasons. In the UK, waiting times for elective surgery and fertility treatment on the NHS can be long, and private care is expensive. In the US, self-pay prices are very high and insurance may not cover what they want. Many also want to be treated near family who can care for them during recovery, and some prefer doctors who share their language and culture. Aesthetics, fertility, dental work, orthopaedics and health checks are typical.",
              "Patients from nearby West and Central African countries come for services their own country lacks or offers poorly, such as complex cardiac care, some cancer treatments or advanced imaging. ECOWAS citizens can enter Nigeria without a visa; patients from further afield need a visa, which adds time and paperwork to the journey.",
              "Nigeria also has a long history of outbound medical travel, to India, the UK, the US, Turkey, Egypt, the UAE and Ghana. Every inbound strategy is also an argument for keeping Nigerian patients at home, and the same factors win both: a credible hospital, clear prices and reliable aftercare.",
              "Lagos and Abuja have real advantages for these patients. Prices for many elective services are well below those in the US or UK, often by a wide margin for aesthetics and dental work. Specialists trained in the UK and US practise locally. Family and language make recovery easier. The disadvantages are real too: patchy outcome data, concerns about power, blood supply and ICU backup, and the reputational shadow of outbound travel.",
              "A hospital should choose which patients it is targeting before building anything. The services, marketing, partners and patient journey for a London-based Nigerian woman seeking IVF are different from those for a family from a neighbouring country bringing a child for heart surgery."
            ),
          },
          {
            title: "The hospital decides, not the clinic",
            body: body(
              "A clinic can attract a travelling patient, but whether the destination works depends on the hospital behind the clinic. Patients who travel are far from their own doctors and support, so they need the whole system around their procedure to be reliable.",
              "Before marketing to travelling patients, test the hospital against what the procedure needs:",
              "- Theatre: a theatre with the equipment, sterile services and anaesthetic cover for the procedure, available on the planned date. A travelling patient cannot be rebooked for next week.\n- ICU or high-dependency backup: on site, or with a written transfer agreement to a named facility and a tested route there, for when a complication occurs.\n- Blood supply: a blood bank or reliable arrangement, since many elective procedures occasionally need transfusion.\n- Power and water: uninterrupted supply to theatre, ICU, laboratory and cold storage, with backup that has been tested.\n- Specialists: named, registered consultants, with cover if the lead is unavailable.",
              "Accommodation and aftercare matter as much as the operation. Many patients cannot or should not fly home soon after surgery, and some procedures carry a risk of blood clots on long flights, so they need somewhere to stay for days or weeks, near the hospital, clean and secure, with transport. Aftercare includes wound checks, physiotherapy, drain removal, medicine supply and an agreed point of contact.",
              "This is why a fertility clinic or aesthetics practice that wants to be a destination usually needs a partnership with a hospital, or to be inside one. A standalone clinic with a procedure room and no ICU can serve local patients who can be transferred by their family; it is a harder sell to a woman flying in from Houston who will be alone if something goes wrong.",
              "The hospital's own accreditation, such as SafeCare or JCI, and its willingness to share outcome data, are among the strongest signals a travelling patient can use. A hospital without them must work harder to show the same reliability."
            ),
          },
          {
            title: "The patient journey across borders",
            body: body(
              "A travelling patient's journey begins weeks before they land and ends weeks after they leave, and every step needs a named owner at the hospital.",
              "Before travel: the patient enquires, usually by WhatsApp or email. A coordinator collects their medical history and recent reports and arranges a remote consultation with the specialist. The specialist decides whether the patient is suitable and what tests are needed on arrival. The hospital issues a written quote, a treatment plan and dates, with the inclusions, exclusions and terms. The patient pays a deposit and books flights. Where needed, the hospital provides a letter for the visa application. The remote consultation is itself regulated care: the specialist should be registered and should document it.",
              "On arrival: airport pickup, accommodation check-in, pre-operative tests and a face-to-face consultation before any procedure. Build in time for tests to come back and for the specialist to change the plan if needed. A patient who arrives on Monday for surgery on Tuesday has no margin.",
              "After the procedure: a stated minimum stay in the country before flying, set by the specialist for each procedure; discharge with a written summary, medicines and a clear plan; a named contact for questions at any hour in the first weeks.",
              "Handover home: a discharge letter the patient's doctor at home can use, sent with the patient's consent, and follow-up by video at agreed points. If a complication arises after the patient has gone home, the patient needs to know who to contact and what the hospital will do, including whether it will pay for treatment abroad of a complication from its care. Patients will ask about this before they book.",
              "Throughout: records shared across borders are health data under the NDPA, and transfers outside Nigeria have their own requirements under the Act. Use secure channels and collect consent for each transfer."
            ),
          },
          {
            title: "Pricing, payment and trust",
            body: body(
              "Travelling patients compare the total cost and the risk, so the hospital must make its price easy to understand and its reliability easy to check.",
              "Quote the full journey or make clear what is excluded. A diaspora patient compares the hospital's package with the all-in cost at home or in a competing destination. A quote that shows the procedure price, the expected accommodation cost, the minimum stay, local transport and what happens if extra nights are needed lets them do that comparison fairly.",
              "Decide the currency rule. Many diaspora patients prefer to pay in pounds or dollars, and the hospital may prefer that for dollar-linked items. Foreign exchange rules and banking practice in Nigeria change, so get advice on how to receive foreign currency lawfully, which rate applies to naira quotes, and how refunds will be made if a deposit was paid in foreign currency.",
              "Facilitators and agents bring many travelling patients, for a commission from the hospital. This is a commercial arrangement and can be legitimate if it is disclosed to the patient, the agent is not giving medical advice, and the commission is not shared with any doctor. A doctor who receives a share of an agent's commission is in a fee-splitting arrangement under the MDCN Code. The hospital should contract agents in writing, set standards for what they promise, and stop working with those who mislead patients.",
              "Build trust with evidence. Named specialists with their registered qualifications, accreditation status, procedure volumes, outcome data the hospital collects, and the experience of past patients described with their consent. Diaspora patients often check with relatives and friends, so the hospital's reputation in Lagos travels to London quickly.",
              "Track this line separately: enquiries by country, conversion to booking, procedures, complications, stays extended, complaints and revenue. A small number of serious complications in travelling patients can shut a service down by reputation, so complications in this group deserve review by the clinical lead every time."
            ),
          },
        ],
        exercises: [
          {
            title: "Make the destination case",
            instruction:
              "A fertility clinic in Victoria Island, Bluestone Fertility, wants to attract UK-based Nigerian women for IVF. It has a procedure room and an embryology lab but no ICU, and refers complications to a 120-bed hospital 4km away with which it has no written agreement. UK private IVF quotes its target patients see are several times its own fee. Its proposed plan is a London marketing campaign. Write a memo to the clinic's founder: whether the clinic is ready, what must be in place before the campaign (hospital, accommodation, aftercare, journey, payment), what to put in the patient's quote, and how agents should be handled.",
          },
        ],
      },
      resources: { tools: ["Destination readiness checklist", "Travelling patient journey map", "Agent agreement template"] },
      questions: [
        mc(
          "A standalone aesthetics clinic in Lekki, with a procedure room and no hospital partner, wants to market tummy tucks to Nigerians in Houston. What is the most important gap?",
          [
            "The clinic's website is not in American English",
            "It has no hospital backing for theatre, ICU, blood and transfer if a travelling patient has a complication",
            "Houston is too far for marketing",
            "The clinic's prices are too low for Houston patients, who tend to read a cheap tummy tuck as a risky operation",
          ],
          1,
          "A travelling patient has no family doctor or support nearby, so the hospital behind the procedure decides whether the destination is safe. Language and marketing reach come later."
        ),
        mc(
          "A diaspora patient is booked to land on Monday and have joint surgery on Tuesday morning. What is the main risk?",
          [
            "No margin for tests, the face-to-face consultation or a change of plan",
            "The patient will be jet-lagged during surgery",
            "The theatre may be too busy on Tuesday",
            "Monday arrivals cost more",
          ],
          0,
          "Pre-operative tests and a specialist review need time, and the plan may change. A tight schedule pushes the team to proceed when it should pause."
        ),
        ms(
          "Which must a hospital have in place before marketing joint replacement to travelling patients? Select all that apply.",
          [
            "ICU or a written transfer agreement with a named facility",
            "Accommodation near the hospital for the post-operative stay",
            "A named contact for questions in the weeks after discharge",
            "A celebrity endorsement",
          ],
          [0, 1, 2],
          "Backup care, a place to recover and aftercare contact are what make the trip safe. An endorsement is marketing and may breach the rules on testimonials."
        ),
        mc(
          "An agent who brings patients from a neighbouring country asks the hospital to pay part of his commission to the referring cardiologist. What is the right response?",
          [
            "Agree if the total commission does not change",
            "Agree if the cardiologist is registered in his own country, where the rule does not apply",
            "Agree but record it as a consulting fee",
            "Refuse, because a doctor sharing in referral commission is fee-splitting",
          ],
          3,
          "A share of commission paid to a doctor is payment for referral whatever it is called. Agent commission itself can be legitimate if disclosed and not shared with clinicians."
        ),
        mc(
          "Which statement about patients from ECOWAS countries is correct?",
          [
            "They need a medical visa issued by a Nigerian embassy before they can be admitted to hospital",
            "They can enter Nigeria without a visa, which simplifies the journey",
            "They cannot pay in naira",
            "They are covered by NHIA",
          ],
          1,
          "ECOWAS citizens have visa-free entry, unlike most patients from outside the region. NHIA covers enrolees in Nigeria, not visiting foreign patients."
        ),
        mc(
          "A UK-based patient asks what happens if her wound becomes infected after she flies home. What should the hospital have already decided?",
          [
            "That once she leaves Nigeria, she is no longer its responsibility",
            "That she must fly back for any treatment",
            "A written policy on complications after she returns home, given before she books",
            "That her UK GP will treat it on the NHS at no cost, so the hospital need not plan for it",
          ],
          2,
          "Travelling patients ask this before booking, and an unclear answer loses them. The policy must be written and given with the quote."
        ),
        mc(
          "A hospital sends a travelling patient's records to her doctor in London by personal email at her request. Which law most directly governs this?",
          [
            "The ARCON Act 2022",
            "The NHIA Act 2022",
            "The Nigeria Data Protection Act 2023, including its rules on transfers outside Nigeria",
            "The Pharmacists Council rules",
          ],
          2,
          "Health data sent abroad falls under the NDPA, which has specific provisions for cross-border transfers. Consent and a secure channel matter."
        ),
        mc(
          "A diaspora patient compares the hospital's N3.5m fibroid package with a UK private quote of several times that. What should the hospital's quote include so the comparison is fair?",
          [
            "Only the procedure price, which looks best",
            "The procedure price plus a 'from' price for any extras, leaving the patient to arrange flights, stay and transport",
            "A comparison table with named UK hospitals",
            "The procedure price, expected accommodation, minimum stay, local transport and the cost of extra nights",
          ],
          3,
          "Travelling patients compare the total cost, so a quote that shows the full journey is both honest and persuasive. Naming other hospitals in a comparison invites advertising objections."
        ),
        mc(
          "A fertility clinic has strong outcomes but no accreditation. What is the most persuasive evidence it can offer travelling patients?",
          [
            "Patient testimonials praising the lead doctor",
            "Its own outcome data with the measure, age bands and number of cycles stated",
            "A claim to be 'the best in West Africa'",
            "Photographs of its waiting room",
          ],
          1,
          "Transparent outcome data is the strongest signal short of accreditation. Testimonials praising a doctor and superlatives run into MDCN and ARCON limits."
        ),
        mc(
          "Two travelling patients had serious complications in a quarter, out of 30 procedures. What should happen?",
          [
            "Clinical lead review of each case, with the findings used to decide whether the service should continue as is",
            "Nothing, as complications happen in every service",
            "Increase marketing to dilute the rate",
            "Stop reporting travelling patients separately, so two cases do not distort the hospital's overall complication rate",
          ],
          0,
          "Complications in travelling patients carry outsized reputational risk and need individual review. Diluting or hiding the figure leaves the cause in place."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "elective-risk-consent-complaints",
      name: "Risk, Consent and Complaints in Elective Care",
      description:
        "Why elective and self-pay care carries its own risk, how to take consent that holds up, what to do when an elective case goes wrong, and how to handle complaints and public reviews without breaching confidentiality.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "Why elective risk is different",
            body: body(
              "Elective and self-pay care carries a different kind of risk from emergency or necessary care. The patient chose the procedure, paid for it and expected a particular result, so a complication or a disappointing outcome feels like a broken promise, not bad luck.",
              "Three features drive this. The patient was well, or felt well, before treatment, so any harm is measured against a healthy starting point. The patient paid directly, often a large sum saved or borrowed, so they expect the service of a purchase as well as the care of a hospital. And the patient usually chose the provider from marketing, social media or recommendations, so the hospital's own words become the standard it is judged by.",
              "This changes the legal and reputational picture. A dissatisfied elective patient may complain to the hospital, to HEFAMAA or the relevant state regulator, to the MDCN about a doctor, to the Federal Competition and Consumer Protection Commission (FCCPC) as a consumer under the Federal Competition and Consumer Protection Act 2018, or to the courts. Most will also post about it. In aesthetics in particular, a single post with images can reach more people in a day than the clinic's marketing reaches in a month.",
              "The risks cluster in predictable places:",
              "- Promises in marketing or consultation that the result does not meet.\n- Thin consent: a signature without a real discussion of risks and limits.\n- Unclear package terms that leave the patient facing unexpected charges.\n- Complications handled slowly or defensively.\n- Patients who should not have been treated: unrealistic expectations, medical risk, psychological red flags.",
              "Each of these is preventable at the start of the journey, which is why elective risk management is mostly about what happens before the procedure. The clinical safety systems that protect any patient still apply; this module covers what elective care adds."
            ),
          },
          {
            title: "Consent that holds up",
            body: body(
              "Consent for elective care has to show that the patient understood what they were choosing, including the chance that it would not turn out as they hoped. A signed form shows only that a form was signed.",
              "A consent process that holds up has these features. The discussion is with the doctor who will perform the procedure, or one fully able to explain it, not a sales coordinator. It covers what the procedure aims to achieve and what it cannot, how long results last, the common risks and the serious ones with a sense of how often they happen, the recovery, the alternatives including doing nothing, and the full cost including what happens financially if there is a complication. It is recorded in the notes in the doctor's own words, with any leaflets given, and the form is signed after that discussion, not instead of it.",
              "Time to think matters. For surgery, consent should be taken at a consultation on an earlier day, with the patient confirming on the day of the procedure. Same-day consultation and operation for cosmetic surgery is poor practice. For injectables, the patient should at least have time to read the information before treatment.",
              "Language and understanding matter. If the patient is more comfortable in Yoruba, Igbo, Hausa, Pidgin or French, the explanation should be in that language, with an interpreter if needed, and the notes should say so. Asking the patient to say back what they understood is a quick check that catches misunderstandings.",
              "Some patients should be declined. Unrealistic expectations, pressure from a partner, a medical condition that raises risk, or signs of body dysmorphic disorder are reasons to defer or refer. The service should back doctors who decline, and record the reason.",
              "Photographs before treatment, taken in a standard way and stored in the record, are part of good consent. They are often the most useful evidence when a patient later says nothing changed."
            ),
          },
          {
            title: "When an elective case goes wrong",
            body: body(
              "When something goes wrong in elective care, the speed, honesty and fairness of the response decide whether the patient becomes a complainant, an adversary or, sometimes, an advocate.",
              "Treat the complication first and well. Follow the written protocol, involve the clinical lead early and transfer the patient if the case needs care the facility cannot give. Delays caused by uncertainty about who pays are indefensible; settle the money afterwards.",
              "Be open with the patient. Tell them what happened, what is being done, and what happens next, in plain words and soon. Many health systems now expect a formal duty of candour; even where it is not written into Nigerian rules, it is good practice and the MDCN Code expects doctors to act honestly with patients. Apologising for what the patient has experienced is not the same as admitting negligence, and patients who feel they were told the truth are much less likely to escalate.",
              "Apply the package terms fairly. If the package says complications from the hospital's care are treated within the price, honour it without argument. If the complication falls outside, explain the charge before the treatment where possible, and consider whether insisting on it is worth the reputational cost. Write down the decision and who made it.",
              "Report and review. Log the event in the hospital's incident system, notify the professional indemnity insurer as the policy requires, and hold a case review led by the clinical lead within a set period. The review asks what happened, whether the patient was right for the procedure, whether consent was adequate and what should change.",
              "Look for patterns across cases. A run of similar complications with one practitioner, one product batch or one device is a signal to act before the next patient is harmed: pause, investigate, retrain or withdraw the product."
            ),
          },
          {
            title: "Complaints and public reviews",
            body: body(
              "Elective complaints are often public before they are formal, so the hospital needs a complaints process that is quick and fair, and a rule for online replies that never breaches confidentiality.",
              "Set a process with clear times. Acknowledge every complaint within a short fixed period, such as two working days, with a named person handling it. Investigate, including the notes, the consent record, the photographs and the staff involved. Reply in writing within a set period, such as 20 working days, saying what was found, what the hospital will do, and how the patient can take it further. Offer a meeting with the clinician and a senior manager for serious complaints.",
              "Separate dissatisfaction with the result from harm. A patient who is unhappy with a good technical result may need a further explanation, a review by a second clinician or, sometimes, a goodwill touch-up. A patient who was harmed may need treatment, a refund or compensation, and the insurer may need to be involved. Mixing the two leads to either overpaying or under-responding.",
              "Online replies follow one rule: never confirm the person is a patient or discuss any detail of care in public. Patient information is confidential under professional rules and the NDPA, and a defensive reply such as 'she did not follow her aftercare instructions' breaches both and makes the hospital look worse. The public reply says the hospital takes the concern seriously and gives a direct contact; the conversation moves offline.",
              "Know the routes patients can take: the facility regulator, such as HEFAMAA in Lagos; the MDCN or NMCN for professional conduct; the FCCPC for consumer matters; and the courts. A hospital's own process that is fair and fast resolves most complaints before they reach any of these.",
              "Report complaints monthly by service, type and outcome, and feed them back to marketing as well as to clinicians. A cluster of 'not what I was told' complaints is a marketing and consultation problem, not only a clinical one."
            ),
          },
        ],
        exercises: [
          {
            title: "Handle a public aesthetics complaint",
            instruction:
              "A patient of Brightwater Aesthetics, Lekki, had abdominal liposuction for N2.2m two weeks ago. She posts photos on Instagram of uneven contour and a small wound breakdown, tagging the clinic and writing that she was 'promised a flat stomach'. The post has 40,000 views. The notes show a short consultation on the day of surgery, a signed consent form with no recorded discussion, and no standard pre-operative photographs. The package says complications from the clinic's care are treated free. Write the clinic's public reply (under 60 words), the plan for the next 72 hours, the internal review questions, and three changes to the clinic's consent process.",
          },
        ],
      },
      resources: { tools: ["Elective consent checklist", "Complaints log template", "Online review reply guide"] },
      questions: [
        mc(
          "A clinic's consent for cosmetic surgery is a signed form handed to the patient by a coordinator on the morning of surgery. What is the main weakness?",
          [
            "The form should be printed in colour",
            "The coordinator should have signed it as witness so the signature can be proven in court",
            "There is no recorded discussion with the operating doctor and no time to reflect",
            "It should have been emailed instead",
          ],
          2,
          "Consent is the discussion, recorded, with time to think, not the signature. A same-day form from a non-clinician shows neither understanding nor reflection."
        ),
        mc(
          "A patient posts a complaint about her rhinoplasty on Instagram. The clinic's draft reply says she missed two follow-up visits. What is wrong with it?",
          [
            "It confirms she is a patient and discloses details of her care in public",
            "It is too short",
            "It should mention the surgeon's qualifications",
            "It should have been posted faster",
          ],
          0,
          "Any public reply that confirms the relationship or discusses care breaches confidentiality and the NDPA. The reply should give a contact and move the conversation offline."
        ),
        mc(
          "After a packaged hysterectomy, a patient develops a wound infection. The package covers complications from the hospital's care. Finance wants to charge her because 'infection may be her fault'. What should happen?",
          [
            "Charge her and let her dispute it",
            "Charge half as a compromise, since the cause of the infection cannot be proven",
            "Delay treatment until payment is agreed",
            "Treat it within the package as the terms say, and review the case",
          ],
          3,
          "Honouring the stated terms without argument is both fair and protects the hospital's reputation. Delaying treatment over payment is indefensible."
        ),
        ms(
          "Which are routes a dissatisfied elective patient in Lagos might use outside the hospital? Select all that apply.",
          [
            "HEFAMAA, about the facility",
            "The MDCN, about a doctor's conduct",
            "The FCCPC, as a consumer",
            "ARCON, about their surgical result",
          ],
          [0, 1, 2],
          "HEFAMAA, MDCN and FCCPC each deal with an aspect of a complaint. ARCON regulates advertising, so it is relevant only if the complaint is about an advert, not the result."
        ),
        mc(
          "Three filler patients in one week develop the same unusual reaction. All were treated by different injectors from the same product batch. What is the right first step?",
          [
            "Retrain all three injectors in filler technique before any of them treats another patient",
            "Quarantine the batch, report to the supplier and NAFDAC, and review the cases",
            "Wait to see if a fourth case occurs",
            "Offer the patients a discount on their next treatment",
          ],
          1,
          "A common batch across different injectors points to the product. Quarantining it and reporting protects the next patient; retraining addresses a cause the pattern does not suggest."
        ),
        mc(
          "A patient is unhappy with a technically good breast augmentation result because she wanted a larger size. What is the most appropriate response?",
          [
            "Offer a full refund",
            "Tell her the result is good and close the complaint",
            "Explain again using the consent record and photographs, and offer a second opinion",
            "Book her for revision surgery to a larger size at no charge, since keeping her goodwill is worth the cost",
          ],
          2,
          "Dissatisfaction with a good result is different from harm and needs explanation and, if useful, a second opinion. Immediate refunds or free revisions treat it as harm and set a costly precedent."
        ),
        mc(
          "During consultation, a woman says her husband insists she has a tummy tuck before their anniversary and she is not sure she wants it. What should the surgeon do?",
          [
            "Defer the procedure, record the concern, and offer time to decide without pressure",
            "Proceed, since she has agreed to pay",
            "Ask the husband to sign the consent",
            "Offer a smaller procedure as a compromise",
          ],
          0,
          "Consent must be the patient's own choice. Pressure from a partner is a reason to defer and record, and a spouse cannot consent for an adult."
        ),
        mc(
          "A complaints report shows most complaints about a clinic's laser service say 'results not what I was told'. Who most needs to see this?",
          [
            "Only the laser operators",
            "Only the finance team",
            "The insurer",
            "Marketing and the consulting clinicians, as well as the clinical lead",
          ],
          3,
          "A pattern of expectation complaints points to what marketing and consultations promise. Sending it only to operators treats a messaging problem as a technique problem."
        ),
        mc(
          "A patient had a serious complication after cosmetic surgery. The surgeon apologises to her for what she went through. The hospital's manager worries this admits negligence. What is the better view?",
          [
            "The surgeon should withdraw the apology in writing",
            "An apology for what she went through is not an admission of negligence",
            "The hospital should stop all communication until lawyers advise",
            "The apology should be repeated publicly on social media",
          ],
          1,
          "Saying sorry for what happened is honest and expected; it is different from admitting fault. Going silent pushes patients towards regulators and the courts."
        ),
        mc(
          "A clinic's standard is to acknowledge complaints within two working days and reply in full within 20. A serious complaint is 15 working days old with no investigation started. What should happen now?",
          [
            "Start the investigation, tell the patient the new date and why, and offer a meeting",
            "Close the complaint as out of time",
            "Wait for the patient to chase",
            "Send a standard letter saying the matter is under review",
          ],
          0,
          "The patient should hear honestly where things stand, and serious complaints merit a meeting. A holding letter with no action is what turns complaints into regulator cases."
        ),
      ],
    },
  ],
};

export default expansion;
