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
  slug: "healthcare-marketing-patients",
  track: {
    name: "Healthcare Marketing & Patient Acquisition",
    description:
      "How Nigerian hospitals and clinics win patients without breaking the rules that govern medical advertising. The track covers ARCON pre-vetting and the MDCN limits on doctors' self-promotion, building and keeping a referral network of doctors, search, social media and WhatsApp as patient channels, corporate and community outreach judged as a channel, and the patient funnel from first enquiry to return visit with the numbers that show where patients are lost.",
    level: "SPECIALIST",
    category: "growth",
    iconName: "megaphone",
    colorHex: "#C2410C",
    prerequisites: [],
    sortOrder: 0,
    pricingType: "PAID",
  },
  modules: [
    // ------------------------------------------------------------------
    {
      slug: "marketing-rules-ethics",
      name: "Healthcare Marketing Rules and Ethics",
      description:
        "The rules that govern a Nigerian hospital's advertising: ARCON pre-exposure vetting, the MDCN limits on doctors' self-promotion and testimonials, NAFDAC on product claims, HEFAMAA registration, and the data protection law that covers patient images.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Four regulators touch one advert",
            body: body(
              "A hospital advert in Nigeria can fall under four regulators at once, and the marketing team needs to know which one each claim answers to before anything is published.",
              "The Advertising Regulatory Council of Nigeria (ARCON), under the ARCON Act 2022, requires adverts to be vetted before they are exposed to the public. Vetting runs through ARCON's Advertising Standards Panel. The requirement is not limited to billboards and radio: sponsored social media posts, influencer content and digital display adverts are treated as advertising too. An advert exposed without approval can be ordered down and the advertiser, and sometimes the agency and the media owner, can be sanctioned. ARCON has shown it is willing to enforce, so 'we only posted it on Instagram' is not a defence.",
              "The Medical and Dental Council of Nigeria (MDCN) regulates the doctor rather than the advert. Its Code of Medical Ethics restricts doctors from advertising themselves or canvassing for patients, and it is cautious about testimonials and claims of superiority. A hospital may publish factual information about its services, but a campaign built around one surgeon's face and a promise of results puts that surgeon's registration at risk, whatever ARCON says about the advert.",
              "The National Agency for Food and Drug Administration and Control (NAFDAC) regulates claims about drugs, medical devices, cosmetics and similar products. If an advert names a product, a brand of filler, a supplement or a device and says what it does, that claim needs to be one NAFDAC has approved for that product, and advertising of regulated products generally needs NAFDAC clearance.",
              "In Lagos, the Health Facility Monitoring and Accreditation Agency (HEFAMAA) registers private facilities for defined categories of service. Advertising a service the facility is not registered to provide, such as IVF from a facility registered as a general clinic, is a regulatory problem in its own right and gives any complainant an easy case.",
              "Over all of this sits the Nigeria Data Protection Act 2023 (NDPA). Health information is sensitive personal data, so a patient's photograph, story or even name in an advert needs a lawful basis, which in practice means explicit, recorded consent."
            ),
          },
          {
            title: "What a hospital may say, and what a doctor may not",
            body: body(
              "The safe ground is factual, verifiable information. A hospital can state its services, opening hours, location, the specialties it offers, the qualifications of its doctors as registered, the equipment it holds and its prices. A patient trying to decide needs exactly this information, and publishing it well is good marketing.",
              "The ground becomes unsafe in predictable places:",
              "- Superlatives and comparisons: 'the best fertility centre in Lagos', 'better than going abroad'. These are hard to substantiate and invite both ARCON and MDCN objections.\n- Guarantees: 'guaranteed results', 'painless', 'no side effects'. No clinical service can honestly promise these.\n- Success rates without method: '70% success' with no statement of what was counted, over what period and for which patients.\n- Individual doctors as the product: a named consultant fronting a campaign with a call to book them personally.\n- Fear: messages that frighten people into screening or treatment.",
              "The distinction that matters most for a consultant advising a client is between the institution and the individual doctor. The hospital, as a business, advertises under ARCON's rules. The doctor, as a registered practitioner, is bound by the MDCN Code wherever the content appears. A doctor's personal Instagram account that posts patient results and a 'DM to book' line is the doctor advertising, even if the hospital never paid for a post.",
              "Educational content is the usual way through. A consultant explaining what endometriosis is, how it is diagnosed and when to see someone is public health information. The same consultant saying 'I have treated 500 women, book me now' is canvassing. When in doubt, the test is whether the content would still be useful if the doctor's name and the hospital's booking link were removed."
            ),
          },
          {
            title: "Testimonials and before-and-after images",
            body: body(
              "Testimonials and before-and-after images are the most effective and the most dangerous material a healthcare marketer can use. They persuade because they are personal, and that is why regulators restrict them: one patient's good outcome implies a result the next patient may not get.",
              "The MDCN Code is restrictive about doctors using patient testimonials to promote themselves. A sensible house position for a client is to avoid testimonials that praise a named doctor or promise an outcome, and to prefer evidence that describes the whole service: a satisfaction survey result with its sample size and period, the number of procedures done, or a patient describing the experience of care (the welcome, the explanation, the follow-up) rather than the clinical result.",
              "Where before-and-after images are used, typically in aesthetics or dental work, the standard to hold a client to is:",
              "- Explicit written consent that names the specific images, the channels they will appear on and the period, and that tells the patient they can withdraw it.\n- No retouching, filters or changes of lighting, angle, make-up or pose between the two images.\n- Images that represent a typical result, with the time since treatment stated.\n- No images of minors for elective treatment.\n- The image stored and handled as health data under the NDPA, with access limited.",
              "Consent for clinical photography and consent for marketing use are separate. Many clinics photograph every patient for the record, which is good practice, and then treat that file as a marketing library, which it is not. A patient who agreed to be photographed for their notes has not agreed to appear on a billboard.",
              "Withdrawal needs a working process. If a patient withdraws consent, the clinic must be able to find every place the image was used, including boosted posts, a printed brochure and an agency's drive."
            ),
          },
          {
            title: "Making compliance routine",
            body: body(
              "Most breaches happen because nobody owned the check, not because anyone set out to break the rules. The fix is a short, written routine that sits inside the marketing calendar.",
              "Build lead time into the plan. ARCON vetting takes time, and a campaign planned for a date such as World Breast Cancer Awareness Month should go for vetting weeks before it is due to run, not on the Friday before. Agencies usually handle submission, but the hospital should hold a copy of the approval for every advert and know which executions it covers. An approval for a billboard design does not cover a reworded radio script.",
              "Keep a claims register. Every factual claim the hospital makes ('first in the state to offer', '2,400 deliveries last year', 'results in 24 hours') is listed with its evidence and the date it was last checked. When the number changes, the adverts using it change.",
              "Set a sign-off chain with three roles: the marketing lead for the message, the medical director for clinical accuracy and MDCN exposure, and whoever holds the compliance brief for regulatory clearance and consent records. Small clinics can combine roles, but the medical director's review should never be skipped for anything that makes a clinical claim.",
              "Write the rules into agency and influencer contracts. The agency warrants that it will submit for vetting, the influencer agrees to post only approved copy, and either can be required to remove content within a set number of hours.",
              "Finally, have a takedown process ready: who can pull a post, a boosted advert or a printed piece the same day, and who tells the patient or the regulator if something has gone wrong. A complaint answered within a day with the content already removed is a far smaller problem than one left for a week."
            ),
          },
        ],
        exercises: [
          {
            title: "Rewrite a launch campaign",
            instruction:
              "Palmgrove Women's Hospital, a 40-bed facility in Lekki registered with HEFAMAA for obstetrics and gynaecology, plans to launch IVF in three weeks. The draft campaign: a billboard reading 'Lagos's best IVF results: 70% success, guaranteed baby or your money back', six Instagram posts showing named mothers holding their babies with quotes thanking the lead consultant, and a paid partnership with an influencer who had treatment there. List every compliance problem and the regulator it answers to, propose a compliant version of each element, and write a three-week timetable that gets the campaign live, including the vetting step and the registration question.",
          },
        ],
      },
      resources: { tools: ["Claims register template", "Marketing consent form", "Campaign sign-off checklist"] },
      questions: [
        mc(
          "A Lagos clinic boosted an Instagram post advertising a new weight-loss programme without submitting it for vetting. The marketing manager argues ARCON rules only cover billboards, radio and TV. What is the correct position?",
          [
            "Sponsored social media content counts as advertising, so the post needed vetting before exposure and can be sanctioned",
            "Social media is outside ARCON's remit because the platforms are based abroad",
            "Only the agency is liable, because it designed the post, chose the audience and placed it on the clinic's behalf without the clinic's sign-off",
            "The post is fine provided it carries the words 'sponsored content'",
          ],
          0,
          "ARCON treats paid digital and social content as advertising requiring pre-exposure vetting. Labelling a post as sponsored discloses that it is an advert; it does not replace vetting."
        ),
        mc(
          "A surgeon at a hospital posts on her own Instagram account: photos of patients' results, her success numbers and 'DM me to book your slot'. The hospital did not pay for or approve the posts. Whose rules does this principally engage?",
          [
            "None, because personal accounts are private speech",
            "The MDCN Code, because the doctor is advertising herself and canvassing for patients",
            "Only NAFDAC, because surgical results are product claims",
            "Only the hospital's internal social media policy, because she is employed there and the posts mention the hospital by name",
          ],
          1,
          "The MDCN Code binds the practitioner wherever the content appears, and this is self-promotion with a call to book. The hospital's policy matters too, but it does not remove the doctor's own professional exposure."
        ),
        mc(
          "An aesthetics clinic wants to advertise 'Brand X filler: lasts 18 months, no side effects'. Which regulator's position on the product claim must be checked before anything else?",
          ["HEFAMAA", "MDCN", "NAFDAC", "The Nigeria Data Protection Commission"],
          2,
          "Claims about what a named drug, device or cosmetic product does fall to NAFDAC and must match what is approved for that product. 'No side effects' is also not a claim any injectable can honestly carry."
        ),
        mc(
          "A clinic photographed every aesthetics patient before and after treatment for the clinical record, with standard clinical consent. The marketing team wants to use 20 of these in a brochure. What should happen?",
          [
            "Use them, because the clinic already holds consent for photography",
            "Use them with faces and tattoos cropped out, because anonymised images no longer count as personal data under the NDPA",
            "Use only images older than two years, when the original consent has lapsed",
            "Seek separate, explicit marketing consent from each patient for the specific use before any image appears",
          ],
          3,
          "Consent to clinical photography for the record is not consent to marketing use. Cropping faces does not make health images anonymous when tattoos, skin or context can identify a person, and the NDPA requires a lawful basis for the new use."
        ),
        mc(
          "A hospital registered with HEFAMAA as a general hospital wants to advertise a new IVF service starting next month. What is the first thing a consultant should check?",
          [
            "Whether the facility's registration covers assisted reproduction, before any advert is placed",
            "Whether the advert's design meets the hospital's brand guidelines",
            "Whether competitors advertise their IVF success rates",
            "Whether the lead embryologist has a social media following",
          ],
          0,
          "Advertising a service the facility is not registered to provide is a regulatory breach independent of the advert's wording. The registration question has to be settled before vetting the creative is worth doing."
        ),
        ms(
          "A fertility centre's draft advert reads: 'The best IVF centre in Nigeria. 65% success rate. Pain-free egg collection. Ask for Dr Ibe.' Which elements need to be removed or changed? Select all that apply.",
          [
            "'The best IVF centre in Nigeria', an unsubstantiated superlative",
            "'65% success rate' without stating what was counted, for which patients and over what period",
            "'Pain-free egg collection', a guarantee no clinician can give",
            "The centre's address and opening hours",
            "'Ask for Dr Ibe', which makes an individual doctor the product",
          ],
          [0, 1, 2, 4],
          "Superlatives, unqualified success rates, guarantees and fronting a named doctor all invite ARCON or MDCN objections. The address and opening hours are factual information a patient needs and are safe."
        ),
        mc(
          "Which piece of evidence is the safest substitute for patient testimonials in a hospital's maternity campaign?",
          [
            "A video of a mother thanking the named obstetrician for saving her baby",
            "A quote from a celebrity who delivered there",
            "'94% of 412 mothers surveyed from January to June rated their care good or excellent', with the survey method available on request",
            "'Zero complications in the last year', taken directly from the theatre register and confirmed by the medical director before publication",
          ],
          2,
          "An aggregate survey result with its sample and period describes the service without implying an individual outcome. A zero-complications claim is hard to substantiate and invites challenge the moment one complication is found."
        ),
        mc(
          "A hospital's campaign for Breast Cancer Awareness Month must be live on 1 October. When should the creative go for ARCON vetting?",
          [
            "On 30 September, so the latest version is vetted",
            "After it runs, if a complaint is received",
            "Only if the campaign includes television",
            "Several weeks before 1 October, with time allowed for revisions the panel may request",
          ],
          3,
          "Vetting is pre-exposure and can come back with changes, so lead time belongs in the campaign plan. Submitting the day before risks either running unapproved or missing the date."
        ),
        mc(
          "A patient who appeared in a dental clinic's before-and-after campaign writes to withdraw her consent. The images have been used in boosted posts, a printed leaflet and a video held by the agency. What does a sound process do?",
          [
            "Stop new uses at once but leave existing posts and printed leaflets in circulation until they expire, since they were made while consent was valid",
            "Locate every use from the consent and asset records, remove or stop each one, and confirm to the patient in writing",
            "Ask the patient to sign a release in exchange for a free treatment",
            "Explain that withdrawal cannot apply once content is published",
          ],
          1,
          "Consent under the NDPA can be withdrawn, so the clinic needs records that let it find and stop every use. Offering free treatment to keep her images live is pressure, not consent."
        ),
        ms(
          "Which of the following should be written into a hospital's contract with its marketing agency and influencers? Select all that apply.",
          [
            "The agency submits every advert for ARCON vetting and gives the hospital a copy of each approval",
            "Influencers post only copy the hospital has approved",
            "Content must be removed within a fixed number of hours on the hospital's request",
            "The agency may reuse patient images in its own portfolio",
          ],
          [0, 1, 2],
          "Vetting, approved copy and a takedown clock put the compliance routine into the contract. Letting the agency reuse patient images would be a new use of health data without the patient's consent."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "referral-networks",
      name: "Referral Networks and Doctor Relations",
      description:
        "How to win and keep the doctors who send patients: what referrers actually value, the ethical line on inducements, and running a doctor relations programme with the data to steer it.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "Read the network from the record",
            body: body(
              "A referral programme starts with knowing, by name, who sends the hospital its patients and what those patients are worth. Most hospitals believe they know this and are wrong, because the registration form either has no referral field or front desk staff fill it with 'self' or 'walk-in' to save time.",
              "The fix is a mandatory referral source field at registration with a short, controlled list (named referring doctor, named facility, HMO, employer, self, online, other) and a free text box for the doctor's name. Where a referral letter exists, it is scanned to the record. Within three months the hospital can see its network.",
              "When the data comes in, three patterns usually appear. Referrals are concentrated: a small group of doctors, often fewer than 20, accounts for most referred admissions and almost all referred surgery. Referrals are unevenly valuable: a GP who sends ten antenatal bookings a year may be worth more than one who sends fifty outpatient reviews. And referrals decay quietly: a doctor who sent eight patients last quarter and two this quarter rarely complains first, they simply start sending elsewhere.",
              "For each significant referrer, the hospital should be able to say: patients referred per month, the split by service, the share who actually arrived, the revenue those patients produced, and the trend. This turns 'we should visit the doctors' into a list ranked by value and risk.",
              "Look at outbound referrals as well. Patients the hospital sends elsewhere for services it could provide, such as a CT scan when its own scanner is idle or a paediatric admission sent to a competitor at night because no paediatrician was on call, are lost revenue and teach referring doctors that the hospital cannot be relied on for the full pathway."
            ),
          },
          {
            title: "What referring doctors want",
            body: body(
              "Referring doctors are protecting their own practice and their own reputation with the patient. A hospital wins referrals by making the referring doctor look good, not by giving them gifts.",
              "When asked, referrers in Nigerian cities name a short list of concerns. They want their patient seen quickly and treated with respect, because the patient will blame them for a bad experience. They want to hear what happened: a discharge summary or clinic letter that reaches them within a day or two, not one the patient carries back weeks later or never. They want the patient returned for ongoing care they can provide, such as blood pressure follow-up or antenatal visits after a scan. They want a phone number that reaches the consultant, not a switchboard. And they want to avoid embarrassment: being told the patient was charged more than the estimate they gave, or that the hospital told the patient their GP had missed something.",
              "The hospital's offer to referrers should answer these directly:",
              "- A named liaison who takes the referrer's call and books the patient.\n- A fast-track appointment slot held each week for referred patients.\n- A clinical letter to the referrer within 48 hours of each encounter, sent by email or a secure channel.\n- A price list the referrer can quote from, so the patient is not surprised.\n- An explicit return-to-referrer policy for follow-up the referrer can handle.",
              "None of this is expensive. It is mostly discipline in the outpatient clinic and the medical records office, and it costs far less than a sales team. The commonest reason a referrer stops sending patients is that a single patient came back unhappy, uninformed or overcharged."
            ),
          },
          {
            title: "Inducements and the ethical line",
            body: body(
              "Paying doctors per referral is common in parts of the Nigerian market and is an ethical breach. The MDCN Code of Medical Ethics treats fee-splitting and payment for referral as professional misconduct, because a patient sent for a payment rather than for their need has been sold, not referred. A consultant should never design, endorse or quietly tolerate a referral commission scheme, however it is described.",
              "The schemes are rarely labelled honestly. Common forms include a 'consultation fee' paid back to the referring doctor for each patient, a share of the diagnostic bill paid in cash, 'transport allowances' that rise with volume, or a referrer listed as a visiting consultant who never attends. Laboratories and imaging centres are the most frequent offenders, and a hospital that competes with them on commission will lose both money and standing.",
              "There are legitimate ways to build loyalty. Continuing medical education sessions open to local GPs, with the hospital's consultants teaching, give referrers something of real value and let them meet the specialists. Admitting or sessional privileges allow a referring doctor to follow their patient into the hospital and bill for their own work, which is transparent because the patient sees who treated them. Shared care agreements for chronic conditions set out who does what and who is paid for what. Access to the hospital's diagnostics at a published professional rate, available to every doctor on the same terms, is a price, not a bribe.",
              "The test is whether the arrangement would survive being explained to the patient. 'Your doctor can follow you into our hospital and will bill you for his visits' passes. 'Your doctor receives N5,000 from us for sending you' does not.",
              "When a client asks for a commission scheme, the conversation is about risk to the doctors' registrations, the hospital's reputation and the referrer relationships themselves, since a referrer bought with cash is bought by the next highest bidder."
            ),
          },
          {
            title: "Running the doctor relations programme",
            body: body(
              "A doctor relations programme is a small, steady operation run by one accountable person against a target list, with a monthly report that shows whether it is working.",
              "The target list comes from the referral data. Tier one is the 15 to 25 doctors and facilities who already send the most value; the aim is to keep them and grow their share. Tier two is doctors in the catchment who send some patients and could send more. Tier three is doctors who send nothing but practise in the right place and specialty. Most effort goes to tier one, because losing one large referrer costs more than winning three small ones.",
              "The liaison officer, often a nurse or a commercially minded medical officer, visits tier one referrers monthly and tier two quarterly. A visit has a purpose: closing the loop on a recent patient, introducing a new consultant or service, or hearing a complaint. Every visit and every complaint is logged, and complaints are routed to the clinical lead with a date for a reply.",
              "The monthly report covers:",
              "- Referrals received, by referrer and by service, against the same month last year.\n- Arrival rate: referred patients who registered, divided by referrals notified.\n- Letters sent to referrers within 48 hours, as a share of encounters.\n- Referrers whose volume fell by more than a third over two quarters.\n- Complaints from referrers and whether each has been answered.",
              "The falling-referrer list is the most useful line on the page. A drop is a question to ask in person within a fortnight, and the answer is usually specific: a patient was kept waiting, a letter never came, a consultant was rude, a competitor opened nearer. Each answer either has a fix or tells the hospital something about its market it needed to know."
            ),
          },
        ],
        exercises: [
          {
            title: "Build the referral plan",
            instruction:
              "Ferncourt Hospital, Ikeja, registers about 1,200 new patients a quarter. A new referral field shows 38% came from named doctors, from 64 doctors in total. Twelve doctors account for 70% of referred surgical admissions. Four of those twelve sent at least 40% fewer patients this quarter than last. Only 22% of referred encounters produced a letter to the referrer. The CEO proposes paying N10,000 per surgical referral to reverse the decline. Write a one-page memo to the CEO: your answer on the payment proposal, a tiered target list, what you would do about the four declining referrers in the next 30 days, and the four numbers you would report monthly.",
          },
        ],
      },
      resources: { tools: ["Referral source field specification", "Referrer tiering sheet", "Doctor relations monthly report"] },
      questions: [
        mc(
          "Ferncourt's registration data shows 61% of new patients as 'self-referred'. Interviews with front desk staff reveal they choose 'self' whenever the patient hesitates. What should the consultant do before drawing any conclusion about referral sources?",
          [
            "Accept the 61% because patients know best how they came",
            "Make the referral field mandatory with a controlled list and a named-doctor box, then re-measure over a quarter",
            "Survey the referring doctors in the catchment and ask each how many patients they believe they sent last quarter, then use their totals",
            "Assume the true referral share is double the recorded figure",
          ],
          1,
          "The data is unreliable because of how it is captured, so the fix is in the capture. Asking doctors gives their impression, not a count, and doubling the figure is a guess."
        ),
        mc(
          "Dr Okafor, a GP, sent nine patients last quarter and three this quarter. He has not complained. What is the best next step?",
          [
            "Visit him within a fortnight to ask directly what changed, with his recent patients' records in hand",
            "Wait another quarter to confirm the trend before acting",
            "Send him a gift hamper to remind him of the hospital",
            "Remove him from the target list, as he has chosen another hospital",
          ],
          0,
          "A falling referrer seldom complains first, and the cause is usually specific and fixable if found early. Waiting a quarter lets the habit of referring elsewhere settle."
        ),
        mc(
          "A diagnostic centre offers referring GPs 20% of each scan fee in cash. The hospital's CEO wants to match it for its own imaging. What should the consultant advise?",
          [
            "Match it, but call it a professional service fee in the accounts",
            "Offer 15% instead of 20%, so the hospital's imaging stays cheaper for patients overall while still keeping the GPs' goodwill and their referrals",
            "Decline: payment per referral is fee-splitting under the MDCN Code, and the hospital should compete on access, turnaround and reporting instead",
            "Offer it only to tier one referrers to limit the cost",
          ],
          2,
          "Paying for referrals is professional misconduct regardless of the label or how widely it is restricted. A transparent professional rate offered to all doctors on the same terms is a price, which is different."
        ),
        ms(
          "Which of these are legitimate ways for a hospital to build loyalty among referring doctors? Select all that apply.",
          [
            "Monthly CME sessions taught by the hospital's consultants, open to local GPs",
            "Sessional privileges so a GP can follow and bill for their own patient's inpatient visits",
            "A 'transport allowance' to each GP that rises with the number of patients sent",
            "A clinical letter to the referrer within 48 hours of each encounter",
          ],
          [0, 1, 3],
          "CME, transparent privileges and prompt clinical letters give real value without paying for the referral. A volume-linked allowance is a referral payment by another name."
        ),
        mc(
          "Of these four changes, which would most likely raise referrals from GPs who already know the hospital?",
          [
            "A new logo and brochure distributed to their clinics",
            "Sending each GP a monthly newsletter about hospital events",
            "Sponsoring a GP association dinner",
            "A held weekly fast-track slot, a named liaison and a letter back within 48 hours",
          ],
          3,
          "Referrers value speed, a person to call and hearing what happened to their patient. Branding, newsletters and dinners raise awareness but do not change the experience that decides where the next patient goes."
        ),
        mc(
          "A hospital has 80 doctors who referred at least once last year. Twenty of them account for 75% of referred revenue. The liaison officer has eight visit days a month. How should time be allocated?",
          [
            "Most visits to the 20 high-value referrers, monthly, with the remainder spread quarterly across the next tier",
            "Equal visits to all 80 so nobody feels neglected",
            "Mainly to the 60 doctors who refer least or have never referred, because that is where the untapped growth in the catchment lies",
            "Only to doctors who have complained",
          ],
          0,
          "Losing one large referrer costs more than winning several small ones, so effort follows value. New doctors matter, but they come after protecting the base."
        ),
        mc(
          "A referring GP quoted a patient N350,000 for a myomectomy using the hospital's last price list. The patient was charged N480,000 and blamed the GP. What is the most important fix?",
          [
            "Tell GPs never to quote prices",
            "Give referrers a current price list with clear inclusions, and explain any variation to the patient and the referrer before treatment",
            "Discount the patient's bill to N350,000 so the GP's quote stands, and ask the GP to call the hospital for a fresh quote the next time he refers",
            "Train the GP on the hospital's billing process",
          ],
          1,
          "Referrers lose face when their estimates are wrong, so the hospital owes them current prices and early warning of variations. A one-off discount repairs this case but not the cause."
        ),
        mc(
          "Which arrival-rate calculation is correct? The hospital was notified of 140 referrals in a month by phone and letter; 98 of those patients registered; 30 further patients registered saying a doctor had sent them without notification.",
          [
            "128 / 140 = 91%",
            "98 / 128 = 77%",
            "98 / 140 = 70%",
            "140 / 168 = 83%",
          ],
          2,
          "Arrival rate is notified referrals who registered divided by referrals notified, so 98 of 140. The 30 unannounced patients are worth recording, but adding them to the numerator inflates the rate of a different group."
        ),
        mc(
          "A hospital's referrals from obstetricians fell after it stopped offering a paediatrician on call at night, so babies needing admission were transferred out. What does this illustrate?",
          [
            "Obstetricians prefer competitors' branding",
            "Doctor relations visits to the obstetricians were too infrequent to keep the relationship warm",
            "The liaison officer needs a bigger budget",
            "Gaps in the clinical pathway drive referrers away whatever the relationship programme does",
          ],
          3,
          "Referrers judge the whole pathway their patient will go through. If the hospital cannot complete it, no visit or event will hold the referral."
        ),
        mc(
          "A senior surgeon proposes listing three busy GPs as 'visiting consultants' on a monthly retainer, though they will rarely attend. How should this be seen?",
          [
            "A good way to formalise the relationship",
            "Acceptable if the retainer is below N100,000 a month",
            "A disguised referral payment that exposes the GPs and the hospital",
            "Fine as long as each GP attends at least once a quarter and signs the attendance register",
          ],
          2,
          "Paying for a role that is not performed is a common disguise for referral payments. Genuine sessional arrangements pay for work actually done, which the patient can see."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "digital-marketing-health",
      name: "Digital Marketing for Healthcare",
      description:
        "Search, social media, WhatsApp and content as patient channels for a Nigerian hospital: what each does, how to run it within the rules, and how to measure it in bookings rather than likes.",
      estimatedMinutes: 80,
      content: {
        sections: [
          {
            title: "Search is where intent lives",
            body: body(
              "A person typing 'paediatrician near me Ikeja' or 'fibroid surgery cost Lagos' has a need and is choosing now. Search therefore converts better than any other digital channel, and it is the one most Nigerian hospitals neglect.",
              "The Google Business Profile is the most valuable free asset a facility has. It decides whether the hospital appears on the map when someone searches nearby. It needs the exact registered name, a correct pin, phone numbers that are answered, opening hours that include the emergency service if there is one, the services offered, real photographs of the building and reception, and regular posts. Many Lagos hospitals have two or three duplicate profiles, a wrong pin or a dead phone number, and each one sends patients elsewhere.",
              "Reviews sit on that profile and drive both ranking and choice. The hospital should ask satisfied patients to leave one, using a link or QR code at discharge, and reply to every review, good or bad, within a few days. A reply must never confirm that the reviewer was a patient or mention any clinical detail, since that discloses health information. 'Thank you for your feedback. Please call our patient relations lead on this number so we can look into it' is enough.",
              "The website should have one page per service that answers what patients search for: what the service is, who it is for, what happens at the appointment, the doctors' registered qualifications, a price or a price range, and how to book. Pages must load quickly on a phone on mobile data, because that is how most patients will see them.",
              "Paid search, buying adverts against search terms, is useful for high-value elective services where one booking is worth a lot. It needs a budget cap, specific keywords, a landing page for each service and tracking to the booking. Paid search adverts are adverts, so they fall under ARCON vetting like any other."
            ),
          },
          {
            title: "Social media builds trust before it builds reach",
            body: body(
              "Social media rarely produces a booking on the day a patient sees a post. Its job is to make the hospital familiar and trusted, so that when the need arises the patient already knows where to go. Judge it on that basis and on the enquiries it eventually produces, not on follower counts.",
              "Choose channels by audience. Instagram and Facebook reach most adult patients in Nigerian cities, and Facebook still reaches older adults and their children who book for them. TikTok reaches younger audiences and suits short explanations. LinkedIn reaches HR managers and is the channel for corporate wellness. Doing two channels well beats five done badly.",
              "Plan content around a few pillars tied to services the hospital wants to grow: for a maternity unit, perhaps antenatal education, the birth experience, newborn care and the team. Doctor-led education works well and stays within MDCN limits when it explains a condition and when to seek care, rather than selling an individual doctor. Behind-the-scenes content about the hospital, such as how the theatre is cleaned or what happens at triage, builds trust cheaply.",
              "Things to keep out of a hospital's feed:",
              "- Images of identifiable patients without specific marketing consent, including in the background of a ward photograph.\n- Graphic clinical images.\n- Claims about outcomes or comparisons with other hospitals.\n- Replies to comments that discuss someone's treatment.",
              "Sponsored posts and influencer content are advertising, so they go through ARCON vetting. An influencer paid in free treatment is still paid, and their post needs approval and disclosure.",
              "Comments and direct messages are an enquiry channel. If they are not answered within hours during working days, the channel loses patients it already won."
            ),
          },
          {
            title: "WhatsApp is the front desk",
            body: body(
              "For most Nigerian patients, WhatsApp is the preferred way to ask a question or book. A hospital that treats WhatsApp as a side channel run from a receptionist's personal phone is losing enquiries it cannot even count.",
              "Run it on a WhatsApp Business account in the hospital's name, on a dedicated device or through the WhatsApp Business Platform, which allows several staff to answer from one number and connects to booking systems. The Platform charges per message for some message types, especially those the business starts, so outbound campaigns have a direct cost that should be budgeted.",
              "Set a response standard, such as a first human reply within 15 minutes during opening hours, with an automatic greeting out of hours that says when the patient will hear back and gives the emergency number. Saved quick replies handle common questions: prices, directions, opening hours, what to bring. The aim of every conversation is to reach a booking, so staff should offer a time slot rather than end with 'you can come any time'.",
              "WhatsApp also carries health information, which brings duties under the NDPA. Staff should confirm identity before discussing results or appointments, should not send results to a number that is not on the patient's record, and should not ask for more clinical detail in chat than they need to book. Chats on staff personal phones are a data breach waiting to happen when the phone is lost or the staff member leaves.",
              "Broadcast lists and promotional messages need the patient's opt-in to marketing. A patient who gave a number to book an appointment has not agreed to receive monthly offers. Keep a record of opt-ins and honour 'stop' at once.",
              "Count WhatsApp enquiries in the same log as phone and walk-in enquiries, with the source recorded, so the hospital can see what share of bookings start there."
            ),
          },
          {
            title: "Content and measurement that tie to bookings",
            body: body(
              "Digital marketing is worth its cost only if it produces patients, so every activity needs a line of sight from the channel to the booking.",
              "Track the source of every enquiry. Use a distinct phone number or WhatsApp link for each major channel, UTM tags on links from social posts and adverts so the website records where visitors came from, and a 'how did you hear about us' question on the booking form and at registration. None of these is perfect alone; together they give a usable picture.",
              "Measure in this order:",
              "- Enquiries by channel per month.\n- Bookings from those enquiries, and the conversion rate.\n- Attended appointments.\n- Revenue from attended patients in their first 90 days.\n- Cost per attended new patient, by channel.",
              "A worked example: a clinic spends N600,000 a month on Instagram adverts and gets 300 enquiries, 75 bookings and 50 attended patients. The cost per attended patient is N12,000. It spends N150,000 on paid search for its fibroid service and gets 40 enquiries, 18 bookings and 14 attended patients, of whom 4 have surgery. Cost per attended patient is about N10,700, and each surgical patient is worth far more than an outpatient visit. The search money is the better buy, even though Instagram produced more enquiries.",
              "Vanity numbers, such as followers, impressions and likes, are inputs. Report them if the client wants them, but never let them stand in for bookings.",
              "Content should answer the questions patients actually ask on the phone. Front desk and WhatsApp staff know them: how much, how long, does it hurt, can I bring my child, do you take my HMO. A page or short video answering each of these does more than a polished campaign."
            ),
          },
        ],
        exercises: [
          {
            title: "Allocate a digital budget",
            instruction:
              "Marigold Fertility Centre, Victoria Island, has N1.2m a month for digital marketing. Last quarter: Instagram adverts cost N700,000 a month and produced 420 enquiries, 60 consultations and 6 IVF cycles started. Paid search cost N300,000 a month and produced 90 enquiries, 30 consultations and 7 cycles started. Influencer posts cost N200,000 a month and produced 150 enquiries, 8 consultations and 1 cycle. WhatsApp replies average 3 hours. An IVF cycle earns about N2.8m in revenue. Calculate cost per consultation and per cycle started for each channel, propose next quarter's allocation, and name the one operational fix that would lift results across every channel.",
          },
        ],
      },
      resources: { tools: ["Google Business Profile checklist", "UTM link builder", "Enquiry log template"] },
      questions: [
        mc(
          "A Surulere hospital has two Google Business Profiles, one with a wrong map pin and an old phone number. Which action should come first?",
          [
            "Launch a paid search campaign so the hospital appears above competitors whatever the state of its listings",
            "Post more often on Instagram",
            "Merge or remove the duplicate and correct the pin, phone number and hours on the remaining profile",
            "Redesign the website homepage",
          ],
          2,
          "The profile decides whether patients searching nearby find the hospital and can reach it. Paying for search traffic while the free listing sends patients to a dead number wastes money."
        ),
        mc(
          "A patient leaves a one-star Google review: 'Waited 4 hours and the doctor misdiagnosed my malaria.' Which reply is appropriate?",
          [
            "'Our records show your malaria test was negative, so the diagnosis was correct and the wait was due to volume.'",
            "'We are sorry to hear this. Please call our patient relations lead on 0803 000 0000 so we can look into it.'",
            "No reply, as responding draws attention to the review",
            "'This reviewer was never our patient.'",
          ],
          1,
          "A short, non-clinical reply that offers a route to resolve it shows other readers the hospital listens. Mentioning test results or confirming or denying the person was a patient discloses health information."
        ),
        mc(
          "Clinic A spends N500,000 on Instagram and gets 250 enquiries, 50 attended patients and 2 surgical cases. Clinic B spends N200,000 on paid search and gets 60 enquiries, 20 attended patients and 5 surgical cases. Which statement is correct?",
          [
            "Paid search matches Instagram on cost per attended patient but produces more surgery for less spend, so it is the better buy",
            "Instagram is the better buy because it produced more enquiries",
            "The two are equal because both produced attended patients",
            "Neither can be judged without follower counts",
          ],
          0,
          "Both cost N10,000 per attended patient, but search produced over twice the surgical cases for less than half the spend. Enquiry volume is not the measure of value."
        ),
        mc(
          "A hospital collected phone numbers when patients booked appointments. Marketing wants to send a monthly WhatsApp broadcast with health tips and offers to all 8,000 numbers. What must be in place?",
          [
            "Nothing, because the patients gave their numbers voluntarily",
            "A WhatsApp Business account only, since consent to contact is implied when someone registers as a patient",
            "Approval from the hospital's HMO partners",
            "Each patient's opt-in to marketing messages, recorded, with a working way to stop",
          ],
          3,
          "A number given to book an appointment is not consent to marketing under the NDPA. The broadcast needs a recorded opt-in and must honour opt-outs at once."
        ),
        ms(
          "A hospital runs WhatsApp enquiries from a receptionist's personal phone. Which problems does this create? Select all that apply.",
          [
            "Health information sits on a device the hospital does not control",
            "Enquiries cannot be counted or attributed to a source",
            "Only one person can answer, so responses slow when she is busy or off",
            "WhatsApp Business accounts cannot send images",
          ],
          [0, 1, 2],
          "A personal phone creates a data protection risk, hides the channel's volume and makes response depend on one person. Business accounts can send images, so that option is false."
        ),
        mc(
          "A dermatology clinic's Instagram has 40,000 followers, but bookings from Instagram are low. Front desk staff say most Instagram enquiries ask 'how much?' and never hear back for a day. What is the most likely fix?",
          [
            "Buy more followers to increase reach",
            "Post more before-and-after images",
            "Answer messages within the hour with prices and an offered slot",
            "Switch to TikTok",
          ],
          2,
          "The channel already generates enquiries; they are lost in the response. More reach or a new platform feeds the same leak."
        ),
        mc(
          "What is the main purpose of tagging links in social posts with UTM parameters?",
          [
            "To let the website analytics record which post or advert sent each visitor",
            "To make links shorter",
            "To pass ARCON vetting",
            "To protect patient data in transit",
          ],
          0,
          "UTM tags tell analytics where a visit came from, which lets the hospital trace bookings back to channels. They have nothing to do with vetting or security."
        ),
        mc(
          "A consultant obstetrician wants to post weekly short videos. Which topic best fits both patient need and MDCN limits?",
          [
            "'Why I am the safest pair of hands for your caesarean'",
            "Videos of her recent deliveries with mothers' names",
            "'My caesarean success rate compared with other Lagos obstetricians, with the figures'",
            "'Warning signs in pregnancy that mean you should go to hospital today'",
          ],
          3,
          "Education about when to seek care is useful public information and does not sell the individual. Self-praise, comparisons and identifiable patients run into the MDCN Code and consent rules."
        ),
        mc(
          "A clinic pays a lifestyle influencer in free treatment to post about her experience. What applies?",
          [
            "Nothing, because no money changed hands",
            "The post is advertising, so it needs ARCON vetting and should be disclosed as a paid partnership",
            "It only needs the clinic's internal approval",
            "It is allowed without vetting as long as she describes her own experience and does not name the doctor",
          ],
          1,
          "Payment in kind is still payment, so the post is an advert and needs vetting and disclosure. Leaving the doctor's name out does not change its status."
        ),
        ms(
          "Which of these should a hospital's service page for knee arthroscopy include? Select all that apply.",
          [
            "What the procedure is and who it is for",
            "What happens on the day and the expected recovery time",
            "A price or price range with what it includes",
            "Photographs of named patients' knees",
          ],
          [0, 1, 2],
          "A service page should answer the questions patients ask before booking. Patient images need specific consent and add little that the other content does not."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "outreach-corporate-community",
      name: "Corporate and Community Outreach",
      description:
        "Health talks, community screenings and employer wellness as patient channels: how to choose and run them with a follow-up pathway, and how to judge them by the patients they produce.",
      estimatedMinutes: 65,
      content: {
        sections: [
          {
            title: "Outreach is a channel and is judged like one",
            body: body(
              "Health talks, screenings and wellness days are often run as goodwill or corporate social responsibility and never measured. They cost staff time, consumables, transport and sometimes venue and refreshments, so they should be judged by the same test as any other channel: what did each new patient cost, and what did those patients go on to need.",
              "Outreach has real strengths. It reaches people who would not search online, such as traders, artisans, older adults and religious congregations. It lets people meet the hospital's staff in person, which builds trust that adverts cannot. And for some conditions, such as hypertension, diabetes and some cancers, it finds disease early, which is good for the person and creates a long-term relationship with the hospital.",
              "It also has typical failures. Screenings are run without a plan for people with abnormal results, so those people are told to 'see a doctor' and never come. Talks are given to audiences who cannot afford the hospital's services and have no cover. Results are written on scraps of paper and nobody can trace who later became a patient. Each of these turns a useful channel into a cost.",
              "Before agreeing to an outreach event, the hospital should answer five questions in writing: who the audience is and whether they can use our services, what condition or need we are addressing, what we will do for each person with an abnormal finding, how we will capture contact details lawfully, and what we expect the event to produce in new patients. If the answers are weak, the event may still be worth doing as community service, but it should be booked as that and not as marketing.",
              "Corporate outreach to employers is a separate line with a separate buyer, and is covered next. It is not payor contracting: an employer buying wellness services is buying a service, while the terms on which an employer or HMO pays for its staff's treatment belong to payor management."
            ),
          },
          {
            title: "Employer wellness programmes",
            body: body(
              "Employers buy health services for their staff for reasons of productivity, retention and duty of care, and the buyer is usually an HR manager with a budget and a calendar. A hospital that understands what that buyer needs can win steady volume and a pipeline of employees who become private patients.",
              "The products employers buy are fairly standard:",
              "- Pre-employment medicals, often required before an offer is confirmed, with a fast turnaround.\n- Annual medicals for staff or for executives, with a written report.\n- Wellness days on site: blood pressure, blood sugar, BMI, eye checks, sometimes cervical and breast screening, with talks.\n- Health talks on topics the employer chooses, such as stress, sleep, hypertension, or women's health.\n- Occupational health for specific risks, such as fitness to work at height or with chemicals.",
              "What wins the business is reliability and paperwork. HR managers need a fixed price per head, a date that does not move, staff who arrive on time, results returned to employees privately within a set number of days, and a summary report for the employer that shows trends without identifying individuals. Employee results are health data and belong to the employee; the employer receives only aggregate figures and fitness certificates where the law and the employee's consent allow.",
              "The commercial value is mostly downstream. A wellness day at a company of 300 staff may find 40 people with raised blood pressure, several needing a specialist referral and a few needing urgent care. If the hospital has a clear follow-up offer, a named contact and a booking slot for those employees, the event produces patients. If it hands out a printed sheet and leaves, the employees go to whichever clinic their HMO card points to.",
              "Find employers through the hospital's own corporate patients, through HR associations and through LinkedIn. Price wellness services as a service with a clear scope per head; do not bundle them into discounts on treatment, which is a payor arrangement and needs its own contract."
            ),
          },
          {
            title: "Community screening done properly",
            body: body(
              "A community screening is worth doing only when every abnormal result has somewhere to go. Screening without a pathway frightens people, wastes their time and does the hospital's name no good.",
              "Choose the condition first. Good candidates are common, have a simple and reliable test and have treatment the hospital can provide: hypertension, diabetes, visual problems, and, with suitable staff and privacy, breast examination and cervical screening. Some screening tests are debated or have high false-positive rates, so involve the clinical lead in deciding what to offer and how to explain results.",
              "Set the pathway before the event. Decide the thresholds that trigger referral, what the person will be told, what written information they leave with, and the slot they are offered: a named clinic, a date and a price, which may be a reduced first visit. Book the follow-up clinic capacity in advance. A screening that finds 60 people with high blood pressure needs a clinic that can see 60 people in the following fortnight.",
              "Capture data properly. Record name, phone number, the results and whether the person consents to be contacted by the hospital, on a form or tablet, not on loose paper. Explain how the information will be used. This is health data under the NDPA; it must be stored securely and used only for the purpose given.",
              "Work with partners who have the trust of the audience. Churches, mosques, market associations, residents' associations, local government health departments and primary health centres can bring people and lend credibility. A partnership with a nearby PHC also gives people an option close to home for routine follow-up, with the hospital taking those who need specialist care.",
              "Be careful with free and discounted offers. A free screening is fine. A free surgery offered on the day, or pressure to book there and then, is not, and it reflects badly on the clinicians involved."
            ),
          },
          {
            title: "Measuring outreach and deciding what to repeat",
            body: body(
              "Outreach should be measured as a funnel from attendance to the patient's first months of care, and each event compared with the others so the hospital repeats what works.",
              "For each event record: people reached, people screened, abnormal results, people referred, people who attended the follow-up within 30 days, people who became regular patients, and the revenue from those patients in 90 days. Then set that against the full cost, including staff time at its real value, consumables, transport, refreshments and any venue or partner fee.",
              "A worked example: a market screening in Mushin screens 500 people at a full cost of N900,000. It finds 90 with raised blood pressure or blood sugar, of whom 70 are referred and 21 attend follow-up within 30 days. Fifteen continue care and spend about N60,000 each in 90 days, so N900,000 in revenue. The cost per new patient is N60,000 and the event roughly breaks even in 90 days, before any longer-term value. The weak point is plain: only 30% of referred people attended. A follow-up phone call within 48 hours and a booked slot, rather than an open invitation, could double that.",
              "Compare events on cost per new patient and 90-day revenue per new patient. Corporate wellness days often look better because the audience has cover or income. Community events in low-income areas often look worse commercially but may still be the right thing to do. Report them honestly as community service if that is what they are.",
              "Review the programme each quarter: drop events that produce nobody, fix the follow-up step where attendance is low, and give more dates to the partners and employers whose audiences become patients."
            ),
          },
        ],
        exercises: [
          {
            title: "Plan and cost a screening",
            instruction:
              "Amberly Specialist Hospital, Surulere, has been invited by a market association to screen traders at a 600-person market. The hospital has a cardiologist and an endocrinologist, an outpatient clinic that can absorb 25 extra patients a week, and a nurse team of six for the day. Estimated full cost of the event is N1.1m. Choose what to screen for and why, write the referral pathway and the follow-up offer, design the consent and data capture, estimate the funnel with your assumptions, and state the result that would justify repeating the event.",
          },
        ],
      },
      resources: { tools: ["Outreach event checklist", "Screening consent form", "Outreach funnel tracker"] },
      questions: [
        mc(
          "A hospital ran six health talks at churches last year and cannot say whether any attendee became a patient. What is the most useful change for this year?",
          [
            "Stop all talks because they cannot be measured",
            "Capture contact details with consent at each talk and track who books within 90 days",
            "Double the number of talks, since awareness builds over time and results will show next year",
            "Hire a celebrity speaker to raise attendance",
          ],
          1,
          "Without capture there is no way to judge the channel, so the first step is to measure. Stopping or expanding blind are both guesses."
        ),
        mc(
          "A screening finds 60 people with high blood pressure. The hospital's follow-up offer is a printed sheet saying 'please see a doctor'. What is the likely result?",
          [
            "Few of the 60 will seek care, and the hospital will gain few patients",
            "Most will come to the hospital because they now know it",
            "The screening will count as a commercial success",
            "The patients' HMOs will refer them back",
          ],
          0,
          "Without a named clinic, a date and a price, most people with an abnormal result do nothing. An open invitation is the commonest reason screening produces no patients."
        ),
        mc(
          "A 300-staff company asks for a wellness day. The HR manager wants every employee's results sent to her. What should the hospital do?",
          [
            "Send all results, since the employer is paying",
            "Send results only for staff with abnormal findings, so HR can arrange time off for follow-up",
            "Give each employee their own results privately and give the employer an anonymised summary",
            "Refuse the work",
          ],
          2,
          "Employee results are health data belonging to the employee. The employer gets aggregate trends and only what the law and the employee's consent allow, such as a fitness certificate."
        ),
        mc(
          "An employer asks a hospital to bundle its wellness day with a 20% discount on all treatment for staff. How should this be handled?",
          [
            "Agree, because it secures the wellness contract",
            "Agree verbally and decide case by case",
            "Include the discount in the wellness invoice as a line item, so the employer sees the full value of the package in one document",
            "Price the wellness day as a service, and treat any treatment discount as a separate payor arrangement with its own contract",
          ],
          3,
          "Discounts on treatment are terms of payment for care, which belong in a payor contract with its own vetting and controls. Mixing them into a wellness deal hides their cost."
        ),
        mc(
          "A screening of 500 people costs N900,000 and produces 15 continuing patients who spend N60,000 each in 90 days. What is the cost per new patient?",
          ["N1,800", "N15,000", "N60,000", "N900,000"],
          2,
          "N900,000 divided by 15 is N60,000. Dividing by the 500 screened gives cost per person screened, which is a different and less useful number."
        ),
        ms(
          "Which conditions are generally good choices for a community screening run by a hospital with physicians and a general outpatient clinic? Select all that apply.",
          [
            "Hypertension",
            "Diabetes",
            "Rare genetic disorders requiring specialist laboratory tests abroad",
            "Visual impairment",
          ],
          [0, 1, 3],
          "Good candidates are common, have simple tests and are treatable by the hospital. Rare disorders needing tests abroad have no practical pathway from a market screening."
        ),
        mc(
          "At a screening, a surgeon offers attendees a 'today only' 50% discount on hernia repair if they pay a deposit on the spot. What is wrong with this?",
          [
            "Nothing, as long as the discount is honoured",
            "The discount is too small to attract interest",
            "It pressures people into surgery without a proper consultation",
            "Deposits should only be taken by bank transfer",
          ],
          2,
          "On-the-spot surgical offers create pressure and bypass proper assessment and consent. Screening should lead to a booked consultation, not a sale."
        ),
        mc(
          "Two events cost the same. A corporate wellness day produces 12 new patients with N150,000 average 90-day spend. A community screening produces 20 new patients with N25,000 average spend. Which conclusion is sound?",
          [
            "The community screening is better because it produced more new patients, and patient numbers drive long-term growth",
            "The corporate day earned more per event; keep the screening only if it is reported as community service",
            "Both should be stopped because neither is profitable",
            "The corporate day is better only if the employer pays more next year",
          ],
          1,
          "N1.8m against N500,000 in 90-day revenue for the same cost favours the corporate day commercially. Community work can still be justified, but it should be labelled as what it is."
        ),
        mc(
          "A screening referred 70 people, and 21 attended follow-up within 30 days. Which change is most likely to raise attendance?",
          [
            "A phone call within 48 hours and a booked appointment slot for each referred person",
            "A larger banner at the next event",
            "Screening more people next time",
            "Offering free refreshments at the event",
          ],
          0,
          "The leak is between referral and attendance, so the fix belongs there. More people screened or a bigger banner fills the top of a funnel that is losing 70% at that step."
        ),
        mc(
          "Before agreeing to an outreach event, which question matters most for whether it is marketing or community service?",
          [
            "Whether the venue is free and close enough for staff to reach it without transport costs",
            "Whether local media will attend",
            "How many staff volunteer",
            "Whether the audience can use our services and what happens to abnormal results",
          ],
          3,
          "An event produces patients only if the audience can use the services and there is a pathway for findings. Venue cost and media attention do not change that."
        ),
      ],
    },

    // ------------------------------------------------------------------
    {
      slug: "patient-funnel-measurement",
      name: "The Patient Funnel and What to Measure",
      description:
        "Following patients from first enquiry to booking, attendance, treatment and return: defining each stage, capturing enquiries in one log, reading conversion and leakage, and judging acquisition cost against what a patient is worth.",
      estimatedMinutes: 75,
      content: {
        sections: [
          {
            title: "Define the stages before counting them",
            body: body(
              "A patient funnel is only useful if every stage has a definition everyone uses the same way. Without that, marketing counts likes, the front desk counts calls and finance counts invoices, and nobody can say where patients are lost.",
              "A workable set of stages for a hospital or clinic:",
              "- Enquiry: a person contacts the hospital about a service, by phone, WhatsApp, web form, social message or walk-in, and is identifiable.\n- Booked: an appointment with a date and time is made.\n- Attended: the person arrives and is seen.\n- Treatment accepted: for services with a quote or plan, such as surgery, IVF or dental work, the patient agrees and pays a deposit or books the procedure.\n- Treatment completed: the episode is delivered.\n- Returned: the patient comes back for another episode, follow-up or a different service within a set period, or refers someone.",
              "The definitions need edges. Is a missed call an enquiry? It should be counted separately as a missed enquiry, because each one is a potential patient lost before any conversation. Is a patient who reschedules twice still 'booked'? Count bookings and attendances by appointment date, so reschedules are visible. For return, choose a window that fits the service: 12 months for general outpatients, the next pregnancy or child's immunisations for maternity, a fixed follow-up for chronic disease.",
              "Different services have different funnels. Emergency care has almost no enquiry stage. A general outpatient clinic runs from booking to attendance and return. Elective surgery and fertility have long funnels with a consultation, a quote and a decision, and that is where most money is won or lost.",
              "Write the definitions down, agree them with the medical director, the front desk lead and finance, and do not change them mid-year without restating past figures."
            ),
          },
          {
            title: "One enquiry log for every channel",
            body: body(
              "Most hospitals lose track of patients at the very top of the funnel because enquiries arrive through five channels and are recorded in none. The fix is one enquiry log that every channel feeds.",
              "The log can be a module in the hospital's system, a simple customer relationship tool or, to start, a shared spreadsheet. Each row is an enquiry with: date and time, channel, source (how they heard), service asked about, name and number, staff member who handled it, outcome (booked, not booked, needs call back) and, if not booked, the reason. Reasons should come from a short list: price, date unavailable, service not offered, wanted a specific doctor, HMO not accepted, no response from patient, other.",
              "Measure response time. On WhatsApp and web forms, record when the enquiry arrived and when it was first answered. On phones, the call system or the network provider can usually report calls answered, missed and abandoned. A clinic that misses 25% of its calls at lunchtime has found its cheapest growth.",
              "The 'not booked' reasons are the most valuable data in the log. If 40% of fertility enquiries that did not book cite price, the hospital has a pricing or payment-plan question to answer. If many cite 'HMO not accepted', marketing is reaching people the hospital cannot serve, or the hospital is missing a contract its catchment needs. If 'wanted a specific doctor' is common, the hospital depends on individuals and that is a risk.",
              "Link the log to registration. When an enquirer books and attends, their enquiry row should show their hospital number, so that later stages can be traced to the original channel. Without this link, marketing can count enquiries and finance can count revenue, but nobody can connect them.",
              "Keep the log under data protection rules: access limited to the staff who need it, and old enquiries that never became patients deleted after a set period."
            ),
          },
          {
            title: "Reading conversion and finding the leak",
            body: body(
              "Once stages are defined and counted, divide each stage by the one before. The result shows where the funnel leaks, and the biggest leak is usually where the most improvement can be bought cheaply.",
              "A worked example for a hospital's elective surgery service in one quarter: 600 enquiries, 270 consultations booked, 190 attended, 95 quoted for surgery, 38 operated on. The conversion rates are 45% enquiry to booking, 70% booked to attended, 50% attended to quote, and 40% quote to surgery. Overall, 6.3% of enquiries became operations.",
              "Each rate points to a different cause and a different owner:",
              "- Enquiry to booking (45%) belongs to the front desk and contact centre: response time, call handling, whether staff offer a slot.\n- Booked to attended (70%) is about no-shows: reminders, deposits for consultations, waiting time to the appointment.\n- Attended to quote (50%) is clinical and partly appropriate, since not every patient needs surgery.\n- Quote to surgery (40%) is about price, payment options, trust in the surgeon and the follow-up call after the quote.",
              "Benchmarks are rarely published for Nigerian hospitals, so the best comparison is the hospital against itself over time, and service against service. If gynaecology converts quotes to surgery at 55% and orthopaedics at 25%, the question is what differs: price, the way quotes are explained, whether a nurse calls the patient after the consultation.",
              "Model the effect before choosing where to act. In the example, lifting quote-to-surgery from 40% to 50% adds about 10 operations a quarter. Lifting enquiry-to-booking from 45% to 55% adds 60 bookings, which flow down to roughly 8 more operations. Both are worth doing; the quote follow-up is usually cheaper and faster."
            ),
          },
          {
            title: "Return, lifetime value and acquisition cost",
            body: body(
              "The cost of winning a patient only makes sense set against what the patient is worth over time. A hospital that measures only the first visit will underinvest in channels that bring loyal patients and overinvest in those that bring one-off visits.",
              "Measure return in cohorts. Take all new patients registered in a quarter and track what share came back within 12 months and what they spent. Compare cohorts by acquisition channel: patients from referring doctors, from corporate wellness, from Instagram, from walk-in. In many hospitals, referred patients and patients from employer programmes return more often than those from promotional campaigns.",
              "A simple lifetime value for planning is the average contribution per patient in the first 12 months, meaning revenue less the direct costs of their care, not revenue alone. Revenue overstates value, especially for services where consumables and professional fees take most of the bill.",
              "Set cost per acquired patient against that contribution. If a channel costs N25,000 per attended new patient and the average 12-month contribution from those patients is N40,000, the channel pays. If another costs N15,000 per patient but those patients contribute N10,000, it loses money even though it looks cheaper.",
              "Satisfaction scores and net promoter scores are useful as signals but need care. Small samples swing wildly, and a score collected by the same staff who treated the patient is rarely candid. Use them alongside behaviour, such as return rates and referrals from patients, which are harder to flatter.",
              "Report the funnel monthly on one page: volume at each stage, conversion rates against last quarter, the top 'not booked' reasons, cost per attended new patient by channel and the latest return rate by cohort. Keep the definitions printed at the foot of the page so nobody argues about what a number means."
            ),
          },
        ],
        exercises: [
          {
            title: "Find the leak and price the fix",
            instruction:
              "Kestrel Eye Hospital, Yaba, offers cataract surgery at N650,000 per eye with a contribution of about N280,000 per operation. Last quarter: 900 enquiries (of which 210 were missed calls never returned), 380 consultations booked, 250 attended, 160 recommended for surgery, 48 operated on. The 'not booked' reasons in the log are mostly blank. Calculate each conversion rate, identify the two biggest leaks, propose a fix for each with its cost, and estimate the additional operations and contribution per quarter if each fix works as you expect. State your assumptions.",
          },
        ],
      },
      resources: { tools: ["Funnel stage definitions sheet", "Enquiry log template", "Monthly funnel report"] },
      questions: [
        mc(
          "An elective service had 600 enquiries, 270 bookings, 190 attended, 95 quoted and 38 operations. What is the quote-to-surgery conversion?",
          ["6.3%", "20%", "40%", "50%"],
          2,
          "38 divided by 95 is 40%. 6.3% is the overall enquiry-to-operation rate, and 20% is operations as a share of attended patients."
        ),
        mc(
          "A clinic misses 25% of incoming calls between 12 and 2pm. What is this, in funnel terms?",
          [
            "Missed enquiries at the very top of the funnel, likely the cheapest leak to fix",
            "A no-show problem",
            "A clinical conversion problem",
            "Unimportant, because patients will call back",
          ],
          0,
          "Each missed call is a potential patient lost before any conversation, and staffing the lunch hour or adding a call-back costs little. Many callers do not try again."
        ),
        mc(
          "Fertility enquiries that did not book mostly cite 'price'. What should the hospital look at first?",
          [
            "Spending more on advertising to reach more people who can afford the price",
            "Its pricing, payment options and how price is explained at enquiry",
            "Hiring a better-known consultant",
            "Removing the price question from the log",
          ],
          1,
          "The log has told the hospital why people leave. More advertising fills a funnel that is losing people on price at the same rate."
        ),
        mc(
          "Channel A costs N15,000 per attended new patient, whose 12-month contribution averages N10,000. Channel B costs N25,000, with contribution averaging N40,000. Which is correct?",
          [
            "Channel A is better because it is cheaper per patient",
            "Both lose money",
            "They are equivalent",
            "Channel B pays for itself and Channel A does not",
          ],
          3,
          "B returns N40,000 for N25,000 spent, while A returns N10,000 for N15,000. Cost per patient alone misleads without the value of the patient."
        ),
        ms(
          "Which fields belong in a hospital's enquiry log? Select all that apply.",
          [
            "Channel and source of the enquiry",
            "Service asked about",
            "Outcome and, if not booked, the reason",
            "The patient's full medical history",
          ],
          [0, 1, 2],
          "The log needs what is required to manage and learn from enquiries. A full medical history is excessive for an enquiry record and breaches the NDPA principle of collecting only what is needed."
        ),
        mc(
          "Marketing reports 2,000 enquiries a month and finance reports revenue from new patients, but nobody can say which channel produced which revenue. What is missing?",
          [
            "A bigger marketing budget",
            "A new website",
            "A link between each enquiry and the patient's hospital number when they register",
            "A monthly satisfaction survey asking each new patient which channel brought them in",
          ],
          2,
          "Without linking the enquiry to registration, later stages cannot be traced to the original channel. The other options do not join the two data sets."
        ),
        mc(
          "A consultant wants to judge whether a hospital's 40% quote-to-surgery rate is good. No published Nigerian benchmark exists. What is the best comparison?",
          [
            "The same hospital's other service lines and its own trend over time",
            "A US hospital's published rate",
            "A guess based on the consultant's last engagement",
            "Whatever the client feels is reasonable",
          ],
          0,
          "Comparing service against service and quarter against quarter in the same hospital controls for market and data definitions. Foreign rates reflect different payment systems and patients."
        ),
        mc(
          "A hospital's satisfaction score jumped from 72 to 91 in a month, measured from 14 responses collected by ward nurses at discharge. How should this be treated?",
          [
            "As proof the service has improved",
            "As a weak signal, given the small sample and who collected it",
            "As grounds to cut the patient experience budget",
            "As a reason to publish the score in adverts",
          ],
          1,
          "Small samples swing widely, and patients rarely criticise the staff asking them. Behaviour such as return rates is harder to flatter."
        ),
        ms(
          "A clinic's booked-to-attended rate is 60%. Which actions would directly target this stage? Select all that apply.",
          [
            "Reminder messages two days and two hours before the appointment",
            "A small deposit for first consultations, credited against the bill",
            "Shorter waiting time from booking to appointment",
            "A new Instagram campaign",
          ],
          [0, 1, 2],
          "Reminders, deposits and shorter waits reduce no-shows. A new campaign adds enquiries at the top but does not change attendance."
        ),
        mc(
          "A hospital redefined 'enquiry' in June to exclude walk-ins, and enquiry-to-booking conversion jumped. What should the monthly report do?",
          [
            "Report the improvement as achieved",
            "Ignore the change, because walk-ins are a small and unpredictable group in most clinics",
            "Delete the earlier months",
            "Restate past months on the new definition, or show both, so the trend is real",
          ],
          3,
          "A definition change can create an apparent improvement that is only arithmetic. Restating history keeps the trend honest."
        ),
      ],
    },
  ],
};

export default expansion;
