import { createHash } from "crypto";

/**
 * Lyfe Plastics and Dermatology: shared constants for the public page, the
 * enquiry API and the coordinator's queue.
 *
 * The March 2026 campaign put 170 names into a spreadsheet and converted none
 * of them. The diagnosis was never reach. It was that nobody was told what
 * happens next, nothing qualified the names, and nobody called them inside the
 * hour. So the things that look like copy decisions in this file are mostly
 * conversion decisions: published prices, a named next step, two doors instead
 * of one, and a form that collects enough for a coordinator to act on the row
 * without calling back for basics.
 */

/**
 * Not the Consult for Africa navy and gold, and not ilé's green. Lyfe is a
 * consumer brand in a category where the client is deciding whether to trust
 * someone with her face, so the palette is quiet: warm paper, near black, one
 * bronze for action, and a deep green reserved for the places where the page
 * talks about safety.
 */
export const LYFE_BRAND = {
  ink: "#15161A",
  inkSoft: "#2A2C33",
  body: "#4A4D56",
  muted: "#83868F",
  ground: "#FAF7F2",
  groundWarm: "#F3EDE4",
  groundDeep: "#EBE3D7",
  line: "#E4DCD0",
  bronze: "#A87B4F",
  bronzeDeep: "#7C5833",
  bronzeTint: "#F2E8DA",
  green: "#2F5248",
  greenTint: "#E7EDEA",
} as const;

export const LYFE_NAME = "Lyfe Plastics and Dermatology";
export const LYFE_SHORT = "Lyfe";
export const LYFE_THEME = "The Art of Looking Like Yourself";
export const LYFE_PROMISE =
  "Aesthetic care for the woman who wants to look rested, not rearranged.";

/**
 * The scarcity on this page is quantity based, not time based, because that is
 * the form the evidence favours for luxury and experiential purchases, and
 * because a visiting surgeon's diary is genuinely finite.
 *
 * It is also the thing most likely to be faked, and faked scarcity reverses
 * the effect and is documented to produce anger and brand switching. So there
 * is no default here. If nobody sets a real number the page simply does not
 * make the claim. Set LYFE_CLINIC_WINDOW and LYFE_CLINIC_SLOTS only to numbers
 * the diary can actually honour.
 */
export const LYFE_WINDOW = process.env.NEXT_PUBLIC_LYFE_CLINIC_WINDOW?.trim() || null;
export const LYFE_SLOTS = (() => {
  const raw = process.env.NEXT_PUBLIC_LYFE_CLINIC_SLOTS?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
})();

export const LYFE_CONTACT_EMAIL = "hello@consultforafrica.com";

/**
 * WhatsApp is the working channel in this market, so the page offers it from
 * the first screen rather than burying it under a form. Set
 * NEXT_PUBLIC_LYFE_WHATSAPP to the clinic's own line when it exists; until
 * then it falls back to the CFA number already printed on every document.
 */
export const LYFE_WHATSAPP =
  process.env.NEXT_PUBLIC_LYFE_WHATSAPP?.replace(/[^0-9]/g, "") || "2349138138553";
export const LYFE_PHONE_DISPLAY = "+234 913 813 8553";

export function whatsappLink(message: string): string {
  return `https://wa.me/${LYFE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/**
 * Dr Kpaduwa is a promoter of this venture and the surgeon who sets its
 * clinical standard. Treatment is delivered by the clinic's own registered
 * clinicians. That distinction is a regulatory one, not a marketing one, and
 * every string on the page has to survive it, so the two doors below are
 * written out once here and used everywhere.
 */
/**
 * Medlyfe's own brand, sampled from their poster rather than guessed at.
 *
 * The evening is Medlyfe's, not Lyfe Plastics'. Medlyfe is the trading,
 * licensed, bookable entity and it hosts; Lyfe Plastics is introduced on the
 * night. So anything to do with the evening wears Medlyfe livery, and the two
 * palettes are deliberately kept apart.
 */
export const MEDLYFE_BRAND = {
  // Deep forest ground with the chartreuse accent from Medlyfe's own poster.
  // The blue that was here came off a photograph in that poster rather than
  // from the brand, which is the hazard of sampling a flattened composite.
  green: "#1F3A2E",
  greenDeep: "#15291F",
  greenDark: "#0F1E17",
  greenSoft: "#7E9A88",
  lime: "#C4D7A6",
  limeSoft: "#DCE8C8",
  white: "#FFFFFF",
  mist: "#D8E3D6",
} as const;

export const MEDLYFE_NAME = "Medlyfe Wellness and Longevity Centre";
export const MEDLYFE_TAGLINE = "Feel Good, Look Good, Live Better.";

/** The platform. One word, set large, and the whole of the idea. */
export const LYFE_EVENT_THEME = "Ageless";

/**
 * AGELESS, from the event brief.
 *
 * A recurring MedLYFE platform rather than a one-off launch, so the naming is
 * layered: AGELESS is the platform, "A New Era of Health, Beauty and
 * Longevity" is the proposition, "From Within, Outward" is the main panel,
 * and "The Art of Looking Like Yourself" is the featured fireside. Keeping
 * those four apart is what lets edition two reuse everything but the panel.
 *
 * Venue address and the RSVP contact are still blank in the brief, so both
 * are environment variables and the page degrades honestly rather than
 * inventing a line.
 */
export const LYFE_EVENT = {
  host: MEDLYFE_NAME,
  withWhom: "Dr Chinwe Kpaduwa, MD FACS",
  theme: LYFE_EVENT_THEME,
  proposition: "A New Era of Health, Beauty and Longevity",
  standfirst:
    "How modern science is changing the way we look, feel, perform and live as we age.",
  tagline: MEDLYFE_TAGLINE,
  panelTitle: "From Within, Outward",
  sessionTitle: "The Art of Looking Like Yourself",
  date: process.env.NEXT_PUBLIC_LYFE_EVENT_DATE || "Thursday, 15 October 2026",
  arrival: "6:00 PM",
  programme: "6:45 PM",
  close: "9:30 PM",
  venueName: process.env.NEXT_PUBLIC_LYFE_EVENT_VENUE || "Greenhouse, Lagos",
  venueAddress: process.env.NEXT_PUBLIC_LYFE_EVENT_ADDRESS || null,
  rsvpBy: process.env.NEXT_PUBLIC_LYFE_RSVP_BY || "Monday, 12 October",
  /// Curated rather than conference scale. The number is in the brief, so the
  /// scarcity line on the page is a fact rather than a device.
  places: 130,
  footerLine: "MedLYFE introduces Lyfe Plastics and Dermatology.",
} as const;

/** The run of show, with the times from the brief. */
export const LYFE_EVENT_PROGRAMME = [
  {
    time: "6:00",
    title: "Arrival and cocktails",
    body: "Cocktails, music, photographs and conversation. A social evening rather than a health seminar.",
  },
  {
    time: "6:45",
    title: "Welcome and opening film",
    body: "A short film asking how modern science is changing the way we look, feel, perform and live as we age.",
  },
  {
    time: "6:50",
    title: "The MedLYFE perspective",
    body: "The philosophy and the approach to longevity and health optimisation, connecting health and vitality with beauty and aesthetics.",
  },
  {
    time: "7:05",
    title: "The panel: From Within, Outward",
    body: "Thirty minutes on how metabolic health, hormones, energy, skin and aesthetics come together in the way we age.",
  },
  {
    time: "7:35",
    title: "Fireside: The Art of Looking Like Yourself",
    body: "An intimate hosted conversation with Dr Chinwe Kpaduwa on her philosophy of aesthetics and the vision behind Lyfe Plastics and Dermatology.",
  },
  {
    time: "8:00",
    title: "What can you actually do?",
    body: "A practical introduction to the ways people can take action across health, longevity, performance, skin and aesthetics.",
  },
  {
    time: "8:15",
    title: "Questions from the room",
    body: "A moderated conversation with the clinicians and speakers.",
  },
  {
    time: "8:30",
    title: "Ageless After Hours",
    body: "Cocktails, music and conversations with the clinicians. Close at 9:30.",
  },
] as const;

/** Section nine of the brief: what a guest should leave understanding. */
export const LYFE_EVENT_TAKEAWAYS = [
  {
    title: "Ageing is multidimensional",
    body: "How you age is shaped by metabolism, hormones, body composition, sleep, energy, physical function and skin, all of it connected.",
  },
  {
    title: "Longevity is more than lifespan",
    body: "The goal is not simply to live longer. It is to keep health, function, vitality and independence for as long as possible.",
  },
  {
    title: "Health, performance and appearance are one journey",
    body: "They are usually approached as three. There is a good argument that they should not be.",
  },
  {
    title: "Modern science lets you act earlier",
    body: "Better diagnostics, longevity medicine, personalised strategies and advances in regenerative and aesthetic medicine have changed what is possible.",
  },
  {
    title: "The goal is not to become someone else",
    body: "It is to feel well, function well, perform well, and go on looking recognisably like yourself.",
  },
] as const;

export const LYFE_EVENT_TAKEAWAY = "A thoughtfully designed Ageless takeaway";

/** Her portrait and credentials, for the page and the invitations. */
export const LYFE_SURGEON = {
  name: "Dr Chinwe Kpaduwa, MD FACS",
  shortName: "Dr Chinwe Kpaduwa",
  portrait: "/lyfe/chinwe-portrait.jpg",
  portraitWidth: 682,
  portraitHeight: 1024,
  // Verified against her own CV and three directories. "Harvard educated,
  // California trained" is her own formulation and is the safe phrasing: she
  // read biochemistry at Harvard, not medicine.
  credentials: [
    "Board certified by the American Board of Plastic Surgery",
    "Fellow of the American College of Surgeons",
    "Harvard educated, California trained",
    "Craniofacial fellowship, Nationwide Children's Hospital",
    "The Aesthetic Society, and the American Society of Plastic Surgeons",
  ],
  // Her own published position, in her own words, over two years of writing.
  // This is why the theme is what it is: we did not invent it.
  position:
    "Her argument, made publicly and consistently, is that the best work is the work nobody can point at, that ageing is not a problem to be solved, and that knowing when not to operate matters more than the menu.",
} as const;

export const LYFE_PATHWAY_COPY = {
  AESTHETIC: {
    label: "An aesthetic consultation",
    short: "Skin, injectables and regenerative treatment",
    blurb:
      "Held at the clinic by our own registered clinicians, to the protocols Dr Kpaduwa wrote and against the standard she signs off. Most people start here, and most of what changes how you look is on this side of the menu.",
    cta: "Book a consultation",
    wait: "Appointments this week",
  },
  SURGICAL: {
    label: "A surgical planning review",
    short: "An opinion on whether surgery is the right answer at all",
    // Deliberately worded as an opinion read alongside the clinic's own
    // registered clinician, with the clinical decision resting here. Holding a
    // surgeon out as available to treat Nigerian patients before her
    // registration is complete is the one representation that creates real
    // exposure, and it lands on the clinic rather than on her.
    blurb:
      "An application, not an appointment. You send your history, your goals and a set of photographs. One of the clinic's registered clinicians reviews it with Dr Kpaduwa, and you get back a written, honest view, including when the answer is that you should not have an operation. The clinical decision rests with the clinician who sees you. It is a plan, not a booking, and no date comes with it.",
    cta: "Apply for a review",
    wait: "A written answer inside five working days",
  },
} as const;

/**
 * The two calls to action, and nothing else competes with them.
 *
 * The evening is the higher commitment and the lower friction, which sounds
 * backwards until you remember that saying yes to a party costs nothing and
 * saying yes to a surgeon costs something. The discovery call is the one that
 * actually fills a diary, so it is the one that survives after the tenth.
 */
export const LYFE_DOORS = {
  EVENT_RSVP: {
    label: "Come to the evening",
    short: "An evening on how you feel and how you look, and why those are the same appointment",
    blurb:
      "An invitation to a conversation rather than a sales floor. A panel, a conversation with Dr Kpaduwa under her own title, the full menu said out loud, and questions from the room. You can book a consultation on the night if you want one, and nobody will mind if you do not.",
    cta: "RSVP to the evening",
    note: "By invitation. Numbers are limited and the address goes to confirmed guests.",
  },
  DISCOVERY_CALL: {
    label: "Book a discovery call",
    short: "Fifteen minutes on the telephone, with no obligation and no charge",
    blurb:
      "Not a consultation and not a sales call. A coordinator listens to what you are thinking about, tells you honestly whether we are the right place for it, explains what a consultation would involve and what it would cost, and answers the practical questions. If a clinician needs to answer something, we route it and come back to you.",
    cta: "Book a discovery call",
    note: "Free. Usually the same day, and you choose the time.",
  },
} as const;

/**
 * Published, because a room that has to ask assumes the worst, and because
 * price was the single most common question the March leads asked before they
 * went quiet.
 *
 * REPRICED October 2026 to sit at the TOP of the Lagos market, which is the
 * brand this practice is meant to be. Sources: the Lagos competitor sweep
 * (Hospital & Aesthetic Plastic Surgery Price Comparison, Oct 2026) and Dr
 * Kpaduwa's Beverly Hills recommended fee schedule in the KPPS pro forma.
 *
 * The rule is one line: we price above every Lagos comparator, because we are
 * the only one of them with a US board-certified plastic surgeon. The nearest
 * premium comparator is Skye Medical Aesthetics, a medical aesthetics centre
 * with no plastic surgeon, and an earlier version of this list sat BELOW them
 * on RF microneedling (NGN 200,000 against their 523,868) and on thread lifts.
 * A practice that undercuts a medispa is telling the room what it thinks it is
 * worth.
 *
 * The ceiling is the Lagos market, not the Los Angeles one. No line here
 * reaches a third of her Beverly Hills schedule, which
 * recommends roughly NGN 1.9m to 2.8m for RF microneedling and NGN 7m to 11.6m
 * for a thread lift. Highest in Lagos, nowhere near LA, deliberately.
 *
 * Skye reference points, Oct 2026: Botox NGN 10,735/unit, hyaluronic fillers
 * 338,153 to 570,000/syringe, Profhilo 299,936, RF microneedling full face
 * 523,868, PCL full face thread lift 2,870,839.
 */
export const LYFE_PRICING = [
  { service: "Aesthetic consultation", price: "₦100,000", note: "Redeemable against treatment" },
  { service: "Anti-wrinkle, per area", price: "₦250,000", note: "₦550,000 for the upper face" },
  { service: "Dermal filler, per syringe", price: "₦600,000", note: "" },
  { service: "Bio-remodelling, per session", price: "₦550,000", note: "A course is usually two" },
  { service: "Skin boosters and mesotherapy", price: "₦350,000", note: "" },
  { service: "PRP, skin or hair", price: "₦350,000", note: "Per session" },
  { service: "Medical facial", price: "₦150,000", note: "" },
  { service: "Chemical peel", price: "₦200,000", note: "" },
  { service: "Microneedling and RF microneedling", price: "₦600,000", note: "" },
  { service: "Non-surgical lift, PDO threads", price: "from ₦1,500,000", note: "Doctor only" },
] as const;

export const LYFE_SURGICAL_FEE_NOTE =
  "The surgical planning review is charged separately and is credited in full against surgery if you go ahead.";

/**
 * The reasons people in this market do not book, in the order they come up.
 * Each one is answered somewhere on the page, and the page is laid out in this
 * order on purpose.
 */
export const LYFE_OBJECTIONS = [
  {
    worry: "I do not want to look like I have had work done",
    answer:
      "Neither does Dr Kpaduwa. The whole of her position is that the best result is the one nobody can point at. If what you are asking for would be obvious, she will tell you, and she will tell you before you pay for anything.",
  },
  {
    worry: "I do not know who is actually treating me",
    answer:
      "You will, before you book. The clinicians who deliver treatment are registered, named, and trained and signed off by Dr Kpaduwa against a logged competency standard rather than a weekend course.",
  },
  {
    worry: "I have heard the stories",
    answer:
      "So have we, and most of them start the same way: no proper consultation, no screening, nobody accountable afterwards, and a plane home. Every one of those four is a policy here, written down, and you can read them below.",
  },
  {
    worry: "I do not know what it costs",
    answer:
      "Ask us and we will tell you, on the telephone or at the consultation. You get a written quote afterwards and the price does not move without you agreeing to it in writing.",
  },
  {
    worry: "I am not sure I need anything at all",
    answer:
      "Then the consultation is the right appointment and the answer may well be no. Being told you do not need something is a legitimate outcome here and it happens often.",
  },
] as const;

/**
 * The safety spine. Four of these are lifted straight from the practice's own
 * coordinator manual, which is unusual enough as a document that publishing
 * what it commits to is itself the differentiator.
 */
export const LYFE_STANDARDS = [
  {
    title: "A real consultation before anything",
    body: "Your history, your goals, your photographs and an examination. Candidacy is decided by a surgeon, in a consultation, and never by whoever answers the phone.",
  },
  {
    title: "Screening you may not enjoy",
    body: "Nicotine and whether your weight is still moving both change the safety and the timing of surgery, so we ask, we write down exactly what you tell us, and the clinical team reads it before anyone offers you a date.",
  },
  {
    title: "Nobody on the phone gives you a clinical answer",
    body: "If you ask the coordinator a medical question she will say she is not the right person, write it down word for word, and route it to a clinician. That is a rule, not a reflex.",
  },
  {
    title: "No promises anybody cannot keep",
    body: "No guaranteed result, no cup size, no date you will be back at work, and no claim that a procedure is risk free. All of it carries risk and the clinical team will go through yours with you.",
  },
  {
    title: "The price you are quoted is the price",
    body: "A written quote after your consultation, with what is included and what is not. Nothing changes without your written agreement.",
  },
  {
    title: "Somebody is here afterwards",
    body: "Aftercare runs out of a clinic in Lagos with a named clinician and an escalation route, which is the thing a flight home does not come with.",
  },
] as const;

/**
 * Aftercare, and why it has its own section on the page.
 *
 * The only published Lagos cost diary for a body procedure, a 42 year old who
 * documented every line, shows an eight million naira operation becoming a
 * sixteen million naira year. Her own summary was that aftercare cost twice
 * what the surgery did: thirty days of accommodation, twenty massages,
 * garments, medication, scar creams and a carer, none of it in the quote.
 *
 * Turkish clinics bundle all of it, plus a hotel and a WhatsApp line, into one
 * number. That, not price, is what they actually sell, and at the premium end
 * Turkey is not even cheaper. Nobody in the Lagos set publishes an all in
 * aftercare price at all.
 *
 * So this is the open ground. It is also the part that has to be true before
 * it is published: every line below is an operational commitment somebody has
 * to staff and fund. CONFIRM WITH THE CLINIC BEFORE THIS PAGE GOES LIVE.
 */
export const LYFE_AFTERCARE = [
  {
    title: "It is in the quote, not after it",
    body: "Garments, dressings, medication and your review appointments are priced into the number you are given, not added to it afterwards. If something is not included we tell you what it will cost before you decide.",
  },
  {
    title: "A named clinician, and a number that is answered",
    body: "You leave with the name of the clinician responsible for your recovery and a line that reaches a person at night and at the weekend. Not a switchboard, and not a form.",
  },
  {
    title: "A written escalation route",
    body: "Where you go, who is called and what happens if you need more than the clinic can give. Agreed before your procedure, written down, and given to you on paper.",
  },
  {
    title: "Recovery support, arranged rather than improvised",
    body: "Massage, nursing visits and somewhere to stay if you are travelling, organised by us and quoted up front. Most of what goes wrong in recovery goes wrong because somebody was alone and did not know who to call.",
  },
] as const;

export const LYFE_CONSENT_TEXT =
  "I agree that Lyfe Plastics and Dermatology and the clinic delivering my care may " +
  "hold the details I have given and contact me by phone, WhatsApp or email about my " +
  "enquiry. I understand I can ask for my details to be deleted at any time.";

// ─── Enum labels ──────────────────────────────────────────────────────────────
// One source of truth for the form, the confirmation email, the internal
// notification and the coordinator's queue, so the four never drift.

export const PATHWAY_LABELS = {
  AESTHETIC: "Skin, injectables or regenerative treatment",
  SURGICAL: "Surgery, or finding out whether surgery is the answer",
  UNSURE: "I am not sure yet",
} as const;

export const CONCERN_LABELS = {
  BODY_AFTER_CHILDREN: "My body after children",
  BREAST: "Breast",
  FACE_AND_AGEING: "Face and ageing",
  SKIN_AND_TONE: "Skin, tone and texture",
  SCARS_AND_KELOIDS: "Scars or keloids",
  BODY_CONTOUR: "Body shape and contour",
  HAIR: "Hair",
  WELLNESS_AND_WEIGHT: "Weight, energy and hormones",
  NOT_SURE_YET: "I would rather talk it through",
} as const;

export const TIMING_LABELS = {
  AS_SOON_AS_POSSIBLE: "As soon as there is an appointment",
  WITHIN_3_MONTHS: "In the next three months",
  WITHIN_12_MONTHS: "Sometime this year",
  RESEARCHING: "I am still reading about it",
} as const;

export const BASED_LABELS = {
  LAGOS: "Lagos",
  ABUJA: "Abuja",
  ELSEWHERE_NIGERIA: "Elsewhere in Nigeria",
  OUTSIDE_NIGERIA: "Outside Nigeria",
} as const;

export const FORMAT_LABELS = {
  IN_PERSON: "In person",
  VIRTUAL: "Virtual",
  EITHER: "Either is fine",
} as const;

export const NICOTINE_LABELS = {
  NEVER: "Never",
  STOPPED_OVER_A_YEAR_AGO: "I stopped more than a year ago",
  STOPPED_RECENTLY: "I stopped recently",
  CURRENT: "I smoke, vape or use nicotine now",
  PREFER_NOT_TO_SAY: "I would rather not say",
} as const;

export const WEIGHT_TREND_LABELS = {
  STABLE: "My weight is steady",
  LOSING_NOW: "I am losing weight at the moment",
  PLANNING_TO_LOSE: "I plan to lose more before anything",
  PREFER_NOT_TO_SAY: "I would rather not say",
} as const;

export const SOURCE_LABELS = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  GOOGLE: "A Google search",
  WHATSAPP_FORWARD: "Someone forwarded it on WhatsApp",
  FRIEND_OR_FAMILY: "A friend or family member",
  A_DOCTOR: "A doctor or another clinician",
  AN_EVENT: "An event",
  PRESS_OR_PODCAST: "Press, radio or a podcast",
  FLYER_OR_QR: "A flyer or a QR code",
  REACTIVATION: "We contacted them",
  OTHER: "Somewhere else",
} as const;

export const STATUS_LABELS = {
  NEW: "Not yet contacted",
  CONTACTED: "Contacted",
  BOOKED: "Consultation booked",
  ATTENDED: "Consultation held",
  CONVERTED: "Treatment booked or paid",
  FOLLOW_UP_LATER: "Following up later",
  UNREACHABLE: "Could not reach",
  NOT_PROCEEDING: "Not proceeding",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * Nigerian numbers arrive in at least four shapes: 0803..., 234803...,
 * +234 803..., and 803.... A coordinator who has to guess which one will dial
 * it wrong once and then not try again, so they are normalised on the way in.
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length >= 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return raw.trim();
}

/**
 * Speed to lead is the whole game here, so the queue is sorted by how long a
 * row has been sitting rather than by when it arrived, and anything past an
 * hour is shown as late.
 */
export function minutesWaiting(createdAt: Date, firstContactedAt: Date | null): number {
  const end = firstContactedAt ?? new Date();
  return Math.max(0, Math.round((end.getTime() - createdAt.getTime()) / 60000));
}

export function waitingLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)} hr`;
  return `${Math.floor(minutes / (60 * 24))} days`;
}
