// ─── CadreHealth: Nurse internship assessment, question bank ───
//
// One assessment replaces the separate written exam each centre runs before it
// interviews. It tests what a centre needs from an intern on day one: safe
// fundamentals, drug calculation, recognising deterioration, maternal and
// child care, infection prevention and professional conduct.
//
// The bank is drafted from standard nursing curricula and must be reviewed by
// a nurse educator before an intake opens. Changing a question changes
// BANK_VERSION, so every attempt records the paper it was actually given.

export const BANK_VERSION = "2026-10-a";

// The shape of the paper lives in ./paper so pages that only quote it never
// bundle the answers.
import { PER_SECTION, SECTIONS, TIME_LIMIT_MINUTES, type SectionKey } from "./paper";
export { PER_SECTION, SECTIONS, TIME_LIMIT_MINUTES, type SectionKey };

export interface Question {
  id: string;
  section: SectionKey;
  stem: string;
  /** As written; the first is not necessarily the answer. Shown shuffled. */
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
}

export const QUESTIONS: Question[] = [
  // ── Fundamentals ──
  { id: "f1", section: "FUND", stem: "What is the first step of the nursing process?", options: ["Planning", "Assessment", "Nursing diagnosis", "Implementation"], answer: 1 },
  { id: "f2", section: "FUND", stem: "What is the normal resting respiratory rate for an adult?", options: ["6 to 10 breaths a minute", "12 to 20 breaths a minute", "22 to 30 breaths a minute", "30 to 40 breaths a minute"], answer: 1 },
  { id: "f3", section: "FUND", stem: "An immobile patient on bed rest is at high risk of pressure injury. Which measure prevents it most effectively?", options: ["Massaging reddened bony areas", "Repositioning at least every two hours", "Using a ring cushion under the sacrum", "Keeping the head of the bed above 45 degrees"], answer: 1 },
  { id: "f4", section: "FUND", stem: "Which of these is subjective data?", options: ["Blood pressure 150/90 mmHg", "Temperature 38.4°C", "The patient says she feels nauseated", "A wound 3 cm long"], answer: 2 },
  { id: "f5", section: "FUND", stem: "Before giving a medicine, how should you confirm the patient's identity?", options: ["Check the bed number", "Ask \"Are you Mr Okafor?\"", "Check two identifiers, such as full name and hospital number, against the chart", "Check the name card above the bed"], answer: 2 },
  { id: "f6", section: "FUND", stem: "A patient is breathless at rest. Which position helps breathing most?", options: ["Supine", "High Fowler's", "Trendelenburg", "Left lateral"], answer: 1 },
  { id: "f7", section: "FUND", stem: "How is a pulse deficit measured?", options: ["Radial pulse before and after exercise", "Apical and radial pulses counted at the same time by two nurses", "Carotid pulse compared with the blood pressure", "Pedal pulses on both feet compared"], answer: 1 },
  { id: "f8", section: "FUND", stem: "Which patient goal is correctly written?", options: ["Patient will feel better", "Nurse will encourage the patient to walk", "Patient will walk 20 metres with a frame, without help, by day 3 after surgery", "Patient will understand the diet"], answer: 2 },
  { id: "f9", section: "FUND", stem: "Below what hourly urine output should you report concern for an adult?", options: ["0.5 mL per kg per hour", "2 mL per kg per hour", "3 mL per kg per hour", "5 mL per kg per hour"], answer: 0 },

  // ── Medical and surgical ──
  { id: "m1", section: "MEDSURG", stem: "Which signs suggest hypoglycaemia?", options: ["Thirst, passing a lot of urine, dry skin", "Sweating, tremor and confusion", "Fruity breath and deep, rapid breathing", "Slow pulse and warm, flushed skin"], answer: 1 },
  { id: "m2", section: "MEDSURG", stem: "A conscious patient who can swallow has a blood glucose of 2.8 mmol/L. What do you do first?", options: ["Give their next dose of insulin", "Give 15 to 20 g of fast-acting carbohydrate by mouth and recheck in 15 minutes", "Wait one hour and recheck", "Give a high-protein meal"], answer: 1 },
  { id: "m3", section: "MEDSURG", stem: "In the first hours after a thyroidectomy, what is the priority observation?", options: ["Bowel sounds", "Airway, breathing and stridor", "Urine colour", "Pedal pulses"], answer: 1 },
  { id: "m4", section: "MEDSURG", stem: "Which blood test monitors a patient on warfarin?", options: ["INR", "Serum potassium", "Platelet count", "Blood urea"], answer: 0 },
  { id: "m5", section: "MEDSURG", stem: "An adult with sickle cell disease is admitted in a painful crisis. What comes first in care?", options: ["Restricting fluids", "Prompt, adequate pain relief and hydration", "Applying ice packs to painful joints", "Encouraging vigorous exercise"], answer: 1 },
  { id: "m6", section: "MEDSURG", stem: "Which finding points to left-sided heart failure?", options: ["Swollen ankles", "Raised jugular venous pressure", "Crackles in the lungs and breathlessness", "An enlarged liver"], answer: 2 },
  { id: "m7", section: "MEDSURG", stem: "Six hours after surgery a patient's pulse has risen from 84 to 118, blood pressure has fallen and the skin is cool and clammy. What do you do?", options: ["Record it and recheck at the next round", "Suspect bleeding, check the wound and drains, and escalate at once", "Give paracetamol and reassure the patient", "Encourage oral fluids"], answer: 1 },
  { id: "m8", section: "MEDSURG", stem: "Where must an underwater-seal chest drain bottle be kept?", options: ["Above the level of the chest", "Below the level of the chest", "Level with the shoulder", "On the bed beside the patient"], answer: 1 },
  { id: "m9", section: "MEDSURG", stem: "What dietary advice is most important for a patient with hypertension?", options: ["Increase salt intake", "Reduce salt intake", "Avoid all fruit", "Eat one large meal a day"], answer: 1 },

  // ── Pharmacology and calculations ──
  { id: "p1", section: "PHARM", stem: "Amoxicillin 500 mg is prescribed. The suspension is 250 mg in 5 mL. What volume do you give?", options: ["2.5 mL", "5 mL", "10 mL", "20 mL"], answer: 2 },
  { id: "p2", section: "PHARM", stem: "1,000 mL of normal saline is to run over 8 hours through a giving set of 20 drops per mL. What is the drip rate?", options: ["21 drops a minute", "42 drops a minute", "63 drops a minute", "125 drops a minute"], answer: 1 },
  { id: "p3", section: "PHARM", stem: "One litre of fluid is to run over 6 hours on an infusion pump. What rate do you set?", options: ["60 mL an hour", "100 mL an hour", "167 mL an hour", "250 mL an hour"], answer: 2 },
  { id: "p4", section: "PHARM", stem: "Paracetamol 15 mg/kg is prescribed for a 12 kg child. The syrup is 120 mg in 5 mL. What volume do you give?", options: ["5 mL", "6 mL", "7.5 mL", "10 mL"], answer: 2 },
  { id: "p5", section: "PHARM", stem: "Before giving digoxin to an adult, what do you check, and when do you withhold it?", options: ["Blood pressure; withhold if above 140 systolic", "Apical pulse for a full minute; withhold if below 60 and inform the doctor", "Temperature; withhold if above 38°C", "Respiratory rate; withhold if above 20"], answer: 1 },
  { id: "p6", section: "PHARM", stem: "Which drug reverses opioid overdose?", options: ["Flumazenil", "Naloxone", "Atropine", "Protamine sulphate"], answer: 1 },
  { id: "p7", section: "PHARM", stem: "Which drug reverses heparin?", options: ["Vitamin K", "Protamine sulphate", "Naloxone", "Calcium gluconate"], answer: 1 },
  { id: "p8", section: "PHARM", stem: "A woman on magnesium sulphate for severe pre-eclampsia has lost her patellar reflexes. What does this mean?", options: ["The dose is working well", "Possible magnesium toxicity: withhold the next dose and inform the doctor", "She needs a higher dose", "Nothing; reflexes are not relevant"], answer: 1 },
  { id: "p9", section: "PHARM", stem: "Which insulin can be given intravenously, for example in diabetic ketoacidosis?", options: ["Soluble (regular) insulin", "Isophane (NPH) insulin", "Insulin glargine", "Premixed 70/30 insulin"], answer: 0 },
  { id: "p10", section: "PHARM", stem: "Heparin 5,000 units is prescribed subcutaneously. The vial is 25,000 units per mL. What volume do you give?", options: ["0.02 mL", "0.2 mL", "2 mL", "5 mL"], answer: 1 },

  // ── Maternal, newborn and child ──
  { id: "c1", section: "MCH", stem: "What is the normal fetal heart rate?", options: ["60 to 100 beats a minute", "100 to 110 beats a minute", "110 to 160 beats a minute", "170 to 200 beats a minute"], answer: 2 },
  { id: "c2", section: "MCH", stem: "For how long is exclusive breastfeeding recommended?", options: ["6 weeks", "3 months", "6 months", "12 months"], answer: 2 },
  { id: "c3", section: "MCH", stem: "Soon after delivery a woman is bleeding heavily and the uterus feels soft. What do you do first?", options: ["Massage the fundus to rub up a contraction and call for help", "Give her a cup of tea and observe", "Put her in a sitting position", "Wait for the doctor's ward round"], answer: 0 },
  { id: "c4", section: "MCH", stem: "In active management of the third stage of labour, what uterotonic is given and when?", options: ["Oxytocin 10 IU IM within one minute of the baby's birth", "Oxytocin 10 IU IM one hour after the placenta delivers", "Paracetamol 1 g orally after birth", "Magnesium sulphate before the placenta delivers"], answer: 0 },
  { id: "c5", section: "MCH", stem: "When is the Apgar score assessed?", options: ["At birth only", "At 1 and 5 minutes after birth", "At 30 minutes and 1 hour", "At 24 hours"], answer: 1 },
  { id: "c6", section: "MCH", stem: "Which drug prevents and treats eclamptic fits?", options: ["Diazepam", "Phenytoin", "Magnesium sulphate", "Oxytocin"], answer: 2 },
  { id: "c7", section: "MCH", stem: "Which signs indicate severe dehydration in a child with diarrhoea?", options: ["Restless, drinks eagerly", "Lethargic, sunken eyes, unable to drink, skin pinch goes back very slowly", "Alert, moist mouth, normal skin pinch", "Mild thirst only"], answer: 1 },
  { id: "c8", section: "MCH", stem: "Under Nigeria's routine schedule, which vaccines are given at birth?", options: ["Measles and yellow fever", "BCG, oral polio (OPV 0) and hepatitis B birth dose", "Pentavalent and PCV", "Meningitis A only"], answer: 1 },
  { id: "c9", section: "MCH", stem: "Kangaroo mother care is used mainly for which babies?", options: ["Stable low birth weight and preterm babies", "Babies with neonatal jaundice needing exchange transfusion", "Babies over 4 kg", "Babies who need ventilation"], answer: 0 },

  // ── Infection prevention and safety ──
  { id: "i1", section: "IPC", stem: "What is the single most effective way to prevent healthcare-associated infection?", options: ["Prophylactic antibiotics", "Hand hygiene", "Wearing a mask at all times", "Daily bed changes"], answer: 1 },
  { id: "i2", section: "IPC", stem: "Which of these is NOT one of the WHO five moments for hand hygiene?", options: ["Before touching a patient", "Before a clean or aseptic procedure", "After touching the patient's surroundings", "Before leaving the hospital at the end of a shift"], answer: 3 },
  { id: "i3", section: "IPC", stem: "You get a needlestick injury from a used needle. What do you do first?", options: ["Suck the wound", "Apply bleach to the site", "Wash it with soap and running water, then report at once so post-exposure prophylaxis can be assessed", "Carry on and report at the end of the shift"], answer: 2 },
  { id: "i4", section: "IPC", stem: "What do you do with a used needle?", options: ["Recap it with two hands", "Put it straight into a sharps container without recapping", "Bend it and put it in the general bin", "Leave it on the tray for the cleaner"], answer: 1 },
  { id: "i5", section: "IPC", stem: "When should a sharps container be closed and replaced?", options: ["When it is three-quarters full", "When it is completely full", "Once a month", "When it starts to overflow"], answer: 0 },
  { id: "i6", section: "IPC", stem: "When putting on PPE, which item goes on last?", options: ["Gown", "Mask", "Eye protection", "Gloves"], answer: 3 },
  { id: "i7", section: "IPC", stem: "Which precautions apply to a patient with suspected pulmonary tuberculosis?", options: ["Contact precautions only", "Airborne precautions, with a respirator for staff", "Standard precautions only", "Droplet precautions for 24 hours"], answer: 1 },
  { id: "i8", section: "IPC", stem: "When is an acute haemolytic transfusion reaction most likely, so the patient must be watched most closely?", options: ["In the first 15 minutes", "After the second hour", "After the transfusion ends", "The next day"], answer: 0 },
  { id: "i9", section: "IPC", stem: "When is the \"sign in\" of the WHO surgical safety checklist done?", options: ["Before induction of anaesthesia", "Before the skin incision", "Before the patient leaves theatre", "On admission to the ward"], answer: 0 },

  // ── Professional practice and ethics ──
  { id: "r1", section: "PROF", stem: "A patient has signed the consent form but tells you she does not understand the operation. What do you do?", options: ["Explain the operation yourself and let it go ahead", "Inform the surgeon so it is explained again before anything proceeds", "Tell her the form is already signed", "Ask a relative to sign as well"], answer: 1 },
  { id: "r2", section: "PROF", stem: "A caller says he is the patient's brother and asks for her diagnosis. What do you do?", options: ["Tell him, since he is family", "Do not disclose without the patient's consent", "Tell him only if he sounds worried", "Ask him to come and read the notes"], answer: 1 },
  { id: "r3", section: "PROF", stem: "You realise you gave a medicine at the wrong dose. What do you do?", options: ["Say nothing if the patient seems fine", "Assess the patient, inform the doctor and nurse in charge at once, and report and document it", "Correct the chart to match what was given", "Wait to see if a problem develops"], answer: 1 },
  { id: "r4", section: "PROF", stem: "How do you correct an error in handwritten nursing notes?", options: ["Use correction fluid", "Tear out the page", "Draw a single line through it, write the correction, then sign and date it", "Scribble over it so it cannot be read"], answer: 2 },
  { id: "r5", section: "PROF", stem: "Which body registers and licenses nurses and midwives in Nigeria?", options: ["Medical and Dental Council of Nigeria", "Nursing and Midwifery Council of Nigeria", "Pharmacy Council of Nigeria", "Federal Ministry of Education"], answer: 1 },
  { id: "r6", section: "PROF", stem: "A patient refuses his medicine. What do you do?", options: ["Hide it in his food", "Respect the refusal, find out why, inform the doctor and document it", "Ask security to hold him", "Give it later without telling him"], answer: 1 },
  { id: "r7", section: "PROF", stem: "In SBAR handover, what does the B stand for?", options: ["Blood pressure", "Background", "Baseline", "Behaviour"], answer: 1 },
  { id: "r8", section: "PROF", stem: "Which task should not be delegated to an untrained care assistant?", options: ["Making an empty bed", "Helping a stable patient to eat", "Assessing a newly admitted patient", "Restocking linen"], answer: 2 },
  { id: "r9", section: "PROF", stem: "A competent adult refuses a blood transfusion on religious grounds. What do you do?", options: ["Transfuse anyway if the doctor agrees", "Respect the refusal, make sure the team knows, and document it", "Ask the family to override her", "Wait until she is asleep"], answer: 1 },

  // ── Emergency ──
  { id: "e1", section: "EMERG", stem: "What chest compression rate is recommended in adult CPR?", options: ["60 to 80 a minute", "80 to 100 a minute", "100 to 120 a minute", "140 to 160 a minute"], answer: 2 },
  { id: "e2", section: "EMERG", stem: "What compression depth is recommended in adult CPR?", options: ["1 to 2 cm", "3 to 4 cm", "5 to 6 cm", "8 to 10 cm"], answer: 2 },
  { id: "e3", section: "EMERG", stem: "What is the compression to ventilation ratio for adult CPR?", options: ["5 : 1", "15 : 1", "30 : 2", "50 : 2"], answer: 2 },
  { id: "e4", section: "EMERG", stem: "What is the first-line drug for anaphylaxis in an adult?", options: ["IV hydrocortisone", "Oral chlorphenamine", "IM adrenaline 0.5 mg (1 in 1,000) into the outer thigh", "Nebulised salbutamol"], answer: 2 },
  { id: "e5", section: "EMERG", stem: "You find a patient collapsed. What do you do first?", options: ["Start chest compressions immediately", "Make sure the area is safe, check for a response and shout for help", "Run to find the doctor", "Take a full set of observations"], answer: 1 },
  { id: "e6", section: "EMERG", stem: "Four patients arrive together. Who do you see first?", options: ["A man with a painful swollen ankle", "A child with noisy, high-pitched breathing (stridor)", "A woman with a two-day headache", "A man with a small cut on his hand"], answer: 1 },
  { id: "e7", section: "EMERG", stem: "What are the lowest and highest possible Glasgow Coma Scale scores?", options: ["0 and 10", "1 and 12", "3 and 15", "5 and 20"], answer: 2 },
  { id: "e8", section: "EMERG", stem: "By the rule of nines, what share of an adult's body surface is one whole arm?", options: ["1%", "9%", "18%", "27%"], answer: 1 },
  { id: "e9", section: "EMERG", stem: "A diabetic patient is unconscious with a blood glucose of 2.1 mmol/L and an IV line in place. What do you do?", options: ["Give sugary water by mouth", "Give IV dextrose as prescribed or per protocol, and call for help", "Give the next insulin dose", "Recheck in an hour"], answer: 1 },
];

/** Every section has enough questions to draw from. Checked at import. */
for (const key of Object.keys(SECTIONS) as SectionKey[]) {
  const n = QUESTIONS.filter((q) => q.section === key).length;
  if (n < PER_SECTION) throw new Error(`Internship bank: section ${key} has ${n} questions, needs ${PER_SECTION}`);
}

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
