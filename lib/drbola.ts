/**
 * Dr Bolarinwa Akinola: content and constants for the rebuilt site.
 *
 * The site is the flagship of the primary brand, Dr Bola Akinola, with Osteon
 * Clinics as the endorsed place of care and never the other way round. It is
 * built here so he can test it and give feedback before it moves to
 * bolarinwaakinola.com, and it carries the inbound referral portal.
 *
 * Two jobs drive every page: rank for the searches patients and their
 * families abroad actually type, and turn that traffic into a consultation or
 * a referral. The voice sells the surgeon people describe after they have met
 * him: patient, kind, and honest about when not to operate, who fixes what
 * others could not. Copy is short on purpose. The X-rays carry the authority.
 *
 * Every fact below was taken from his current site in October 2026. Anything
 * not yet confirmed by him is wrapped in <Confirm> on the page, which shows as
 * a marked note in preview and as plain text once live.
 */

/** Preview until he signs it off and the domain is pointed. */
export const DRBOLA_LIVE = process.env.NEXT_PUBLIC_DRBOLA_LIVE === "1";

export const DRBOLA_BASE = "/drbola";
export const DRBOLA_SITE_URL = "https://bolarinwaakinola.com";

export const DRBOLA = {
  name: "Dr Bolarinwa Akinola",
  short: "Dr Bola Akinola",
  postnominals: "FRCS (Tr. & Orth.), MPH, MBBS",
  role: "Consultant Orthopaedic and Reconstructive Surgeon",
  email: "bolarinwa.akinola@osteonclinics.com",
  whatsapp: "2347018967012",
  phoneDisplay: "+234 701 896 7012",
  linkedin: "https://www.linkedin.com/in/bolarinwa-akinola-48586061/",
} as const;

/**
 * His own monogram is navy and gold, so the site keeps it, quietened down. The
 * ground is the colour of clean bone rather than pure white, which keeps a
 * clinical page from feeling like a hospital corridor.
 */
export const DB = {
  ink: "#14233A",
  inkSoft: "#2B3A52",
  body: "#4A5465",
  muted: "#7B8494",
  ground: "#FBFAF7",
  bone: "#F4F1EA",
  boneDeep: "#E9E4D9",
  line: "#E6E1D6",
  gold: "#A9864A",
  goldDeep: "#86683A",
  goldTint: "#F3ECDF",
  teal: "#2F5D62",
} as const;

export function wa(message: string): string {
  return `https://wa.me/${DRBOLA.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function href(path = ""): string {
  return `${DRBOLA_BASE}${path}`;
}

export const NAV = [
  { label: "Revision", path: "/complex-revision-surgery" },
  { label: "Hip and knee", path: "/hip-knee-replacement" },
  { label: "From abroad", path: "/from-abroad" },
  { label: "About", path: "/about" },
  { label: "Insights", path: "/insights" },
  { label: "Refer", path: "/refer" },
] as const;

export const CREDENTIALS = [
  { title: "President", detail: "Arthroplasty Society of Nigeria" },
  { title: "FRCS (Tr. & Orth.)", detail: "Royal College of Surgeons of Edinburgh" },
  { title: "Fellowships", detail: "Groote Schuur, Cape Town and James Cook, Middlesbrough" },
  { title: "MPH", detail: "London School of Hygiene and Tropical Medicine" },
  { title: "15+ papers", detail: "Injury, JBJS (Br), Hip International" },
] as const;

/**
 * What stops a doctor referring is rarely the surgeon's CV. It is the fear of
 * losing the patient, of being judged for a complication, and of a referral
 * that disappears. These answer those three, colleague to colleague.
 */
export const DOCTOR_HEADLINE = "Let's solve your difficult cases together.";
export const DOCTOR_PROMISES = [
  { title: "Yours, returned.", detail: "I treat what you send and hand the patient back, with a letter." },
  { title: "No judgement.", detail: "Complications happen to all of us. Send them early." },
  { title: "No black hole.", detail: "A reply within two working days. Track every referral online." },
] as const;

export const TESTIMONIAL = {
  quote:
    "Dr. Akinola is an outstanding surgeon. He performed knee replacement surgery on me for which many had recommended amputation. He performed the surgery with the highest professional etiquette.",
  name: "Alex Erons",
  place: "Abuja",
  procedure: "Salvage knee replacement",
};

export const OUTCOME_NOTE =
  "One patient's experience. Outcomes vary between patients, and no result is typical or guaranteed.";

export const XRAYS = [
  {
    src: "/drbola/xray-knee-revision-before-after.webp",
    w: 1100,
    h: 833,
    title: "Revision knee replacement",
    caption: "A failed knee replacement taken out and rebuilt with revision components.",
  },
  {
    src: "/drbola/xray-hip-before-after.webp",
    w: 1100,
    h: 825,
    title: "Hip replacement",
    caption: "A hip destroyed by arthritis, replaced.",
  },
  {
    src: "/drbola/xray-pelvis-before-after.webp",
    w: 1100,
    h: 825,
    title: "Pelvic fracture fixation",
    caption: "A displaced pelvic fracture put back together and held.",
  },
] as const;

export type Location = {
  name: string;
  area: string;
  address: string;
  note?: string;
  hq?: boolean;
};

export const LOCATIONS: Location[] = [
  {
    name: "Osteon Clinics",
    area: "Amuwo Odofin, Festac, Lagos",
    address: "4 Ausbeth Ajagu Street, Amuwo Odofin, Lagos",
    hq: true,
  },
  {
    name: "Duchess International Hospital",
    area: "GRA Ikeja, Lagos",
    address: "Harold Shodipo Crescent, off Joel Ogunnaike Street, GRA, Ikeja, Lagos",
  },
  {
    name: "Diamed Multispeciality Hospital",
    area: "Lekki Phase 1, Lagos",
    address: "7/8 T. F. Kuboye Road, Marwa, Lekki Phase 1, Lagos",
  },
  {
    name: "Q-Life Family Clinic",
    area: "Victoria Island, Lagos",
    address: "155A Prince Ade Odedina Street, Victoria Island, Lagos",
    note: "Outpatient clinics only",
  },
  {
    name: "Dover Hospital",
    area: "Wuse Zone 6, Abuja",
    address: "8 Bouake Street, off Sudan Street, Wuse Zone 6, Abuja",
  },
];

export function mapsLink(l: Location): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.name}, ${l.address}`)}`;
}

// ---------------------------------------------------------------------------
// Service pages. Each one targets a cluster of searches with real content, and
// carries its own FAQ because those questions are what people type.

export type Service = {
  slug: string;
  nav: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  lead: string;
  image?: { src: string; w: number; h: number; alt: string };
  intro: string[];
  treats: { name: string; detail: string }[];
  procedures: string[];
  approach: string[];
  faqs: { q: string; a: string }[];
  cta: string;
};

export const SERVICES: Service[] = [
  {
    slug: "complex-revision-surgery",
    nav: "Revision surgery",
    title: "Revision surgery",
    seoTitle: "Revision Hip and Knee Replacement Surgeon in Lagos and Abuja",
    seoDescription:
      "Failed, loose, painful or infected hip and knee replacements redone by Dr Bola Akinola, FRCS (Tr. & Orth.), fellowship trained in revision surgery. Free second opinion on your X-rays.",
    lead: "Failed replacements. Surgery that went wrong elsewhere. Cases you were told could not be fixed.",
    image: {
      src: "/drbola/xray-hip-revision.webp",
      w: 700,
      h: 1217,
      alt: "X-ray of a revision hip replacement with a long stem",
    },
    intro: [
      "This is the centre of my practice. Most revision patients are sent by another surgeon. Many arrive told nothing more can be done. Usually something can.",
    ],
    treats: [
      { name: "Failed hip or knee replacement", detail: "Loose, worn, unstable or painful." },
      { name: "Fracture around an implant", detail: "Periprosthetic fractures." },
      { name: "Surgery done abroad", detail: "Operations that came home with a problem." },
      { name: "Severe bone loss", detail: "Grafting, megaprostheses, custom 3D-printed implants." },
    ],
    procedures: [
      "Revision hip and knee arthroplasty",
      "Impaction bone grafting",
      "Megaprosthesis and custom 3D-printed implants",
      "Salvage reconstruction",
    ],
    approach: [
      "First I find out why it failed. Repeat the same operation for the same reason and it fails again.",
      "You get a written plan and an itemised cost before anything is booked.",
    ],
    faqs: [
      {
        q: "How do I know my replacement has failed?",
        a: "New or worsening pain, a joint that feels loose or gives way, grinding, swelling that will not settle. An X-ray usually tells us a lot.",
      },
      {
        q: "Can a replacement done abroad be revised in Nigeria?",
        a: "Yes. Bring whatever records you have. If you have none, the X-rays usually show what is there.",
      },
      {
        q: "I was told amputation is the only option. Is a second opinion worth it?",
        a: "Almost always. Many limbs expected to be lost can be reconstructed.",
      },
      {
        q: "How long is recovery after revision?",
        a: "Longer than a first replacement. Most patients walk with support within days. You get an honest timeline for your case.",
      },
    ],
    cta: "Get a free second opinion",
  },
  {
    slug: "hip-knee-replacement",
    nav: "Hip and knee replacement",
    title: "Hip and knee replacement",
    seoTitle: "Hip and Knee Replacement Surgeon in Lagos and Abuja",
    seoDescription:
      "Total and partial knee replacement, hip replacement and robotic-assisted knee surgery in Lagos and Abuja with UK-trained surgeon Dr Bola Akinola. Honest advice on whether you need it.",
    lead: "Done once, done right. And only when it is time.",
    image: {
      src: "/drbola/xray-knee.webp",
      w: 700,
      h: 1432,
      alt: "X-ray of a total knee replacement",
    },
    intro: [
      "Plenty of people I see leave with physiotherapy, not a theatre date. When surgery is right, I plan it to last, because I see what happens when it is not.",
    ],
    treats: [
      { name: "Osteoarthritis", detail: "The most common reason." },
      { name: "Avascular necrosis", detail: "Loss of blood supply to the hip." },
      { name: "Inflammatory arthritis", detail: "Rheumatoid and related conditions." },
    ],
    procedures: [
      "Total hip replacement",
      "Total and partial knee replacement",
      "Robotic-assisted knee replacement",
      "Shoulder replacement, total and reverse",
      "Total ankle replacement",
    ],
    approach: [
      "Non-surgical options first. We decide together.",
      "Rehabilitation and follow-up are part of the plan, not an afterthought.",
    ],
    faqs: [
      {
        q: "How much does a knee replacement cost in Nigeria?",
        a: "It depends on the hospital, the implant and your case. You get an itemised estimate in writing after assessment, before anything is booked.",
      },
      {
        q: "Is it safe to have a joint replacement in Nigeria?",
        a: "With a properly trained surgeon and a well-run theatre, yes. And you recover near the people who will look after you.",
      },
      {
        q: "What is robotic-assisted knee replacement?",
        a: "A robotic system guides the bone cuts to your anatomy. The surgeon still operates. I will tell you honestly if it would make a difference for you.",
      },
      {
        q: "How soon will I walk?",
        a: "Most people take their first steps with help within a day.",
      },
    ],
    cta: "Book a consultation",
  },
  {
    slug: "bone-joint-infection",
    nav: "Bone and joint infection",
    title: "Bone and joint infection",
    seoTitle: "Infected Joint Replacement and Osteomyelitis Treatment in Nigeria",
    seoDescription:
      "Infected hip and knee replacements and chronic osteomyelitis treated in Lagos and Abuja. Biofilm-aware surgery, antibiotic spacers and limb preservation with Dr Bola Akinola.",
    lead: "The hardest problem in orthopaedics. Treatable, if it is treated properly.",
    intro: [
      "Antibiotics alone rarely clear infection on an implant. It takes surgery to remove the infected tissue and antibiotics placed exactly where they are needed.",
    ],
    treats: [
      { name: "Infected replacement", detail: "Early or late." },
      { name: "Chronic osteomyelitis", detail: "Bone infection that keeps coming back." },
      { name: "Infected fixation", detail: "Around plates, nails or screws." },
    ],
    procedures: [
      "Surgical debridement",
      "Sequestrectomy",
      "Antibiotic beads and spacers",
      "One and two-stage revision",
    ],
    approach: ["Control the infection. Keep the limb. Stop the flare-ups."],
    faqs: [
      {
        q: "What are the signs of an infected joint replacement?",
        a: "Worsening pain, warmth, redness, swelling, a leaking wound, fevers. Get seen promptly.",
      },
      {
        q: "Can an infected implant be saved?",
        a: "Sometimes, if caught early. Often it is replaced in one or two stages.",
      },
    ],
    cta: "Get a free second opinion",
  },
  {
    slug: "trauma-limb-reconstruction",
    nav: "Trauma and reconstruction",
    title: "Trauma and limb reconstruction",
    seoTitle: "Complex Fracture, Non-union and Limb Reconstruction Surgeon in Lagos",
    seoDescription:
      "Complex fractures, pelvic injuries, non-unions, mal-unions and deformity correction in Lagos and Abuja with Dr Bola Akinola, trauma fellowship trained at Groote Schuur, Cape Town.",
    lead: "Bones that will not heal. Limbs that healed wrong. Rebuilt.",
    image: {
      src: "/drbola/frames-deformity.webp",
      w: 700,
      h: 963,
      alt: "Both legs held in circular external fixation frames during deformity correction",
    },
    intro: [
      "Trained at Groote Schuur, Cape Town, one of Africa's busiest trauma and reconstruction centres.",
    ],
    treats: [
      { name: "Complex fractures", detail: "Including pelvis and around joints." },
      { name: "Non-union", detail: "Fractures that have not healed." },
      { name: "Mal-union and deformity", detail: "Bow legs, knock knees, bones out of line." },
    ],
    procedures: [
      "Internal fixation, plating and nailing",
      "External and circular frames",
      "Realignment osteotomy",
      "Limb correction",
    ],
    approach: ["Heal it straight. Get you moving early."],
    faqs: [
      {
        q: "My fracture has not healed after months. What now?",
        a: "Non-unions have a reason: movement, blood supply, infection or the fixation used. Find it and most can be fixed.",
      },
      {
        q: "Can bow legs or knock knees be corrected in adults?",
        a: "Yes, with a realignment osteotomy.",
      },
    ],
    cta: "Get a free second opinion",
  },
];

export function serviceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

// ---------------------------------------------------------------------------
// Insights. Written around the questions patients and families type, in his
// voice, so they earn search traffic and carry the honest-counsel tone.

export type Article = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  body: { h?: string; p: string[] }[];
};

export const ARTICLES: Article[] = [
  {
    slug: "do-i-really-need-a-knee-replacement",
    title: "Do I really need a knee replacement?",
    description:
      "An orthopaedic surgeon on when a knee replacement is the right answer, what to try first, and the questions to ask before you agree to surgery.",
    minutes: 4,
    body: [
      {
        p: [
          "I am asked this most weeks, often by someone who has already been told they need surgery and wants to be sure. It is a good question to ask. A knee replacement is a big operation and it cannot be undone.",
        ],
      },
      {
        h: "When it is probably time",
        p: [
          "The X-ray matters less than people think. What matters is how the knee affects your life. If pain wakes you at night, if you have stopped walking distances you used to manage, if stairs have become a negotiation, and if the simpler treatments have stopped working, a replacement is worth discussing.",
        ],
      },
      {
        h: "What to try first",
        p: [
          "Strengthening the muscles around the knee with a good physiotherapist helps more people than you would expect. So does losing even a modest amount of weight, because every kilogram is felt several times over by the knee. Painkillers used properly, a walking stick in the opposite hand, and in some cases an injection can buy years.",
          "If you have done these properly and are still struggling, you are not giving up by having surgery. You have earned it.",
        ],
      },
      {
        h: "Questions worth asking any surgeon",
        p: [
          "How many of these operations do you do? What happens if something goes wrong, and who will I call? What will my recovery look like in practice, week by week? What does it cost, all in, in writing? A surgeon who is comfortable with those questions is usually one you can trust with the operation.",
        ],
      },
    ],
  },
  {
    slug: "what-to-do-when-a-joint-replacement-fails",
    title: "What to do when a joint replacement fails",
    description:
      "Signs a hip or knee replacement has failed, why it happens, and what revision surgery involves. Advice for patients in Nigeria and their families abroad.",
    minutes: 4,
    body: [
      {
        p: [
          "Most hip and knee replacements last many years. Some do not, and the people who come to me with a failed one are often frightened, sometimes angry, and usually tired of being in pain. The first thing to say is that a failed replacement can very often be put right.",
        ],
      },
      {
        h: "Why replacements fail",
        p: [
          "The common reasons are loosening, where the implant comes away from the bone; wear of the plastic bearing; instability, where the joint dislocates or gives way; infection; and fractures around the implant. Sometimes the original implant was simply placed in a position that was never going to last.",
        ],
      },
      {
        h: "Why the reason matters",
        p: [
          "Before any revision I want to understand exactly why the first operation failed. Infection in particular has to be ruled out, because revising an infected joint as though it were a mechanical failure tends to end badly. That means blood tests, good imaging and sometimes a sample from the joint.",
        ],
      },
      {
        h: "What to bring",
        p: [
          "Whatever you have: the operation note, the implant stickers or details, old and new X-rays, and a list of what has happened since. If the operation was done abroad and the records are hard to get, do not let that stop you. We can work a great deal out from the images.",
        ],
      },
    ],
  },
  {
    slug: "arranging-joint-surgery-for-a-parent-in-nigeria",
    title: "Arranging joint surgery for a parent in Nigeria from abroad",
    description:
      "A practical guide for Nigerians in the UK, US and elsewhere arranging a hip or knee replacement for a parent at home: remote review, costs, updates and recovery.",
    minutes: 5,
    body: [
      {
        p: [
          "A lot of my patients are looked after on behalf of a son or daughter in London, Houston or Toronto. The calls usually start the same way: Mum's knee has got much worse, she will not come over, and we do not know who to trust at home. If that is you, this is how I would go about it.",
        ],
      },
      {
        h: "Start with the imaging, not a flight",
        p: [
          "Get a recent X-ray of the joint done locally and send it, with a short summary of the problem. I can usually tell from that, and a video call with your parent and you on the line, whether this is a case for surgery, for something simpler, or for a closer look in clinic.",
        ],
      },
      {
        h: "Ask for the plan and the cost in writing",
        p: [
          "Before anything is booked you should have a written recommendation and an itemised estimate covering the surgeon, the hospital, the implant and the stay. Surprises are what make families lose trust in care at home, and they are avoidable.",
        ],
      },
      {
        h: "Agree how you will be kept informed",
        p: [
          "Decide who in the family is the point of contact, and agree how and when you will hear from us: after the operation, at discharge and at each review. You should not have to chase.",
        ],
      },
      {
        h: "Plan the recovery before the surgery",
        p: [
          "The first few weeks at home matter as much as the operation. Someone needs to be around, the house may need a few changes, and physiotherapy needs to be arranged. If you are planning to fly home for it, time your visit for the first two weeks after surgery, not the day of the operation.",
        ],
      },
    ],
  },
  {
    slug: "signs-your-hip-or-knee-replacement-may-be-infected",
    title: "Signs your hip or knee replacement may be infected",
    description:
      "The early and late warning signs of an infected joint replacement, why speed matters, and what treatment involves. From a revision and infection surgeon in Lagos.",
    minutes: 3,
    body: [
      {
        p: [
          "Infection after a joint replacement is uncommon, but it is the complication I would most like people to recognise early, because early treatment keeps more options open.",
        ],
      },
      {
        h: "Early signs, in the weeks after surgery",
        p: [
          "A wound that keeps leaking after the first few days, redness spreading around the wound, increasing rather than settling pain, and fevers or feeling unwell. Some swelling and warmth is normal after a replacement. Things getting worse instead of better is not.",
        ],
      },
      {
        h: "Late signs, months or years later",
        p: [
          "A replacement that was comfortable becoming painful for no obvious reason, especially pain at rest and at night. A late infection can follow an infection elsewhere in the body, such as a bad tooth or a urine infection.",
        ],
      },
      {
        h: "What to do",
        p: [
          "Do not start antibiotics on your own before you have been seen, because they can hide the infection and make it harder to identify the bacteria. Get seen promptly by an orthopaedic surgeon who treats these problems, and bring your operation records.",
        ],
      },
    ],
  },
];

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

// ---------------------------------------------------------------------------
// Forms. Option lists live here so the forms, the API and the admin view agree.

export const CONCERNS = [
  "Hip pain or arthritis",
  "Knee pain or arthritis",
  "A replacement that has failed or is painful",
  "Possible infection",
  "A fracture or injury",
  "A fracture that has not healed",
  "Leg deformity",
  "Spine or back",
  "A second opinion",
  "Something else",
] as const;

export const BASED = [
  "Lagos",
  "Abuja",
  "Elsewhere in Nigeria",
  "United Kingdom",
  "United States or Canada",
  "Elsewhere",
] as const;

export const FOR_WHOM = ["Myself", "A parent or relative", "Someone else"] as const;

export const CONTACT_BY = ["WhatsApp", "Phone call", "Email"] as const;

export const HEARD = [
  "Google search",
  "A doctor referred me",
  "Family or friend",
  "Instagram or Facebook",
  "LinkedIn",
  "WhatsApp forward",
  "Another hospital",
  "Other",
] as const;

export const URGENCY = ["Routine", "Soon (within 2 weeks)", "Urgent"] as const;

export const REFERRAL_STATUSES = ["Received", "Reviewed", "Patient contacted", "Seen", "Letter sent"] as const;
export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const SURVEY_IDS = {
  consultation: "drbola-consultation",
  secondOpinion: "drbola-second-opinion",
  referral: "drbola-referral",
  feedback: "drbola-feedback",
} as const;

export const UPLOAD_ENGAGEMENT = "drbola";
export const UPLOAD_KEY_PREFIX = "documents/drbola/";

export const CONSENT_TEXT =
  "I agree that Dr Akinola's team may hold these details and contact me about my enquiry. They are used for nothing else and never shared without my permission, in line with the Nigeria Data Protection Act 2023.";

export const REFERRAL_CONSENT_TEXT =
  "The patient has agreed to this referral and to their information and images being shared with Dr Akinola's team for their care.";

/** A reference a doctor can read down a phone line: no 0/O or 1/I. */
export function newReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `BA-${out}`;
}
