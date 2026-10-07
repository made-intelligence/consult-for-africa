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
 * A recurring Medlyfe platform rather than a one-off launch, so the naming is
 * layered: AGELESS is the platform, "A New Era of Health, Beauty and
 * Longevity" is the proposition, "The New Science of Ageing Well" is the panel,
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
  panelTitle: "The New Science of Ageing Well",
  panelStandfirst:
    "What changes in your body, brain and skin after 40, and what you can actually do about it.",
  sessionTitle: "The Art of Looking Like Yourself",
  date: process.env.NEXT_PUBLIC_LYFE_EVENT_DATE || "Wednesday, 21 October 2026",
  arrival: "5:30 PM",
  programme: "6:30 PM",
  close: "9:30 PM",
  venueName: process.env.NEXT_PUBLIC_LYFE_EVENT_VENUE || "Capital Club, Lagos",
  venueAddress: process.env.NEXT_PUBLIC_LYFE_EVENT_ADDRESS || null,
  // Moved with the date. Five clear working days before, which is what a
  // curated 70-person room needs to be chased properly. Confirm it.
  rsvpBy: process.env.NEXT_PUBLIC_LYFE_RSVP_BY || "Friday, 16 October",
  /// Curated rather than conference scale, and cut from 130 to 70 on 6 October.
  /// A real number, so the scarcity line on the page is a fact not a device.
  places: 70,
  footerLine: "Medlyfe introduces Lyfe Plastics and Dermatology.",
} as const;

/** The run of show, with the times from the brief. */
export const LYFE_EVENT_PROGRAMME = [
  {
    time: "5:30",
    title: "Arrival and cocktails",
    body: "Cocktails, music, photographs and conversation. A social evening rather than a health seminar.",
  },
  {
    time: "6:30",
    title: "Welcome and opening film",
    body: "Dr Adedotun Ajelabi opens the evening, followed by a short film asking how modern science is changing the way we look, feel, perform and live as we age.",
  },
  {
    time: "6:35",
    title: "The range",
    body: "Dr Adedotun Ajelabi on what modern medicine can now do about how we age, and where each of it sits on the spectrum from everyday to surgical.",
  },
  {
    time: "6:50",
    title: "The panel: The New Science of Ageing Well",
    body: "Forty five minutes on the inner, chaired by Dr Itunu Akinware. Metabolism, hormones, weight and energy, how they change as we age and what can be done about them.",
  },
  {
    time: "7:35",
    title: "Fireside: The Art of Looking Like Yourself",
    body: "Dr Debo Odulana in conversation with Dr Chinwe Kpaduwa on her philosophy of aesthetics and the vision behind Lyfe Plastics and Dermatology.",
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

/**
 * The panel, The New Science of Ageing Well.
 *
 * This is the running order, not a cast list, and the page renders it in
 * sequence: the opening address on the range, four seats on the inner, the
 * fireside on the outward, then the chair. Unfilled seats show as placeholders
 * with the subject named, which is honest and also quietly useful: a guest
 * reading "sleep, movement and physical function, to be announced" knows the
 * subject is covered.
 *
 * Fill a seat by giving it a name, a title and optionally a portrait in
 * /public/lyfe. Anything without a name renders as a placeholder.
 */
/**
 * The guest funnel.
 *
 * Seventy places and an open form are not compatible, because the form cannot
 * tell the difference between the person you built the evening for and the
 * person who saw a link. So interest is open and cheap, the team chooses who
 * is invited, and the invitation carries a link that only its recipient can
 * use. A place is filled by a confirmation and by nothing else.
 */
export const LYFE_STAGE_LABELS: Record<string, string> = {
  INTERESTED: "Interested",
  INVITED: "Invited, awaiting reply",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  WAITLIST: "Waiting list",
  ATTENDED: "Attended",
  NO_SHOW: "Did not come",
};

/** Stages that occupy a place in the room. */
export const LYFE_STAGES_HOLDING_A_PLACE = ["CONFIRMED", "ATTENDED"] as const;

/**
 * Heads in the room, counting the guests people bring. An invitation that has
 * been sent and not answered is deliberately not counted here: holding places
 * for silence is how a room ends up half empty with a closed list.
 */
export function lyfeHeadcount(
  rows: { eventStage: string | null; guestCount: number | null }[],
): { confirmed: number; invitedAwaiting: number; places: number; remaining: number } {
  const heads = (r: { guestCount: number | null }) => 1 + (r.guestCount ?? 0);
  const confirmed = rows
    .filter((r) => r.eventStage && (LYFE_STAGES_HOLDING_A_PLACE as readonly string[]).includes(r.eventStage))
    .reduce((n, r) => n + heads(r), 0);
  const invitedAwaiting = rows
    .filter((r) => r.eventStage === "INVITED")
    .reduce((n, r) => n + heads(r), 0);
  return {
    confirmed,
    invitedAwaiting,
    places: LYFE_EVENT.places,
    remaining: Math.max(0, LYFE_EVENT.places - confirmed),
  };
}

export function lyfeConfirmUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? "https://www.consultforafrica.com";
  return `${base.replace(/\/$/, "")}/lyfe/confirm/${token}`;
}

export interface LyfePanelSeat {
  seat: string;
  subject: string;
  name: string | null;
  title: string | null;
  portrait: string | null;
  /** Intrinsic size, so a seat's photograph is not declared at somebody else's. */
  portraitWidth?: number;
  portraitHeight?: number;
}

export const LYFE_PANEL: LyfePanelSeat[] = [
  {
    seat: "The opening address",
    subject:
      "The range. What modern medicine can now do about how we age, and where each of it sits on the spectrum from everyday to surgical",
    name: "Dr Adedotun Ajelabi",
    title: "Clinical Lead, Medlyfe",
    portrait: null,
  },
  {
    seat: "In the chair",
    subject: "Moderating the panel and the questions from the room",
    name: "Dr Itunu Akinware",
    title: "Chief Executive, Medbury Healthcare Group",
    portrait: null,
  },
  {
    seat: "The panel, on the inner",
    subject: "Metabolism, weight, body composition, and the questions the room has about the new drugs",
    name: "Dr Timi Adenuga",
    title: "Lead Bariatric and Laparoscopic Surgeon, GetSlim",
    portrait: null,
  },
  {
    seat: "The panel, on the inner",
    subject: "Eating the food we actually eat and still changing body composition. A decade of it, with the training to match",
    name: "Gbemi Giwa",
    title: "Founder of the African Fat Loss Method. Fitness and nutrition coach",
    portrait: "/lyfe/gbemi-portrait.jpg",
    portraitWidth: 800,
    portraitHeight: 1000,
  },
  {
    seat: "The panel, on the inner",
    subject: "Vitality and energy. What ten years of building a wellness business says about what works and what only sells",
    name: "Joycee Awosika",
    title: "Founder and Chief Executive, the ORÍKÌ Group",
    portrait: null,
  },
  {
    seat: "The panel, on the inner",
    // Taken from her own DFC Catalyst billing in this repo, where she spoke in
    // September. She is the hormones seat the panel was missing.
    subject:
      "Menopause, hormone optimisation and preventative women's medicine. What changes after 40, and what is worth measuring",
    name: "Dr Folake Kofo-Idowu",
    title: "Founder and Medical Director of Nelia. Double board certified physician",
    portrait: null,
  },
  {
    seat: "The panel, on the inner",
    subject: "Andropause and men's health at midlife. The half of this conversation men never get invited to",
    name: null,
    title: null,
    portrait: null,
  },
  {
    seat: "The featured fireside, on the outward",
    subject:
      "Aesthetics, plastic surgery and looking like yourself. In conversation with Dr Debo Odulana",
    name: "Dr Chinwe Kpaduwa, MD FACS",
    title: "Plastic surgeon, board certified by the American Board of Plastic Surgery",
    portrait: "/lyfe/chinwe-portrait-centred.jpg",
  },
];

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
  // Cropped so she sits in the middle of the frame. The original has her right
  // of centre; the crop also stops above the KD mark on her scrubs, which would
  // otherwise be cut in half at the left edge.
  portrait: "/lyfe/chinwe-portrait-centred.jpg",
  portraitWidth: 532,
  portraitHeight: 810,
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
/**
 * THE CONSULTATION WITH DR KPADUWA.
 *
 * The page used to end at a free fifteen minute discovery call. A free call is
 * the easiest thing on a page to say yes to and the easiest to forget, and it
 * put a coordinator between the person and the only thing they actually wanted,
 * which was to talk to the surgeon. It also meant that a page carrying her name
 * sold nothing.
 *
 * This is the paid step in its place: her own clinic, her own diary, booked and
 * paid for in one sitting. It is a teleconsultation, which is what makes it
 * deliverable while she is abroad and what makes the two hours on a Tuesday
 * real rather than aspirational.
 *
 * It sits ABOVE the clinic's own aesthetic consultation on purpose. The
 * clinic's is NGN 100,000 with a registered clinician; this is the surgeon who
 * wrote the protocols. A practice whose founder costs the same as everybody
 * else is telling the room what it thinks she is worth.
 */
export const LYFE_CONSULT = {
  /** Naira. One number, read by the page, the form, the invoice and Paystack. */
  fee: 150_000,
  feeDisplay: "₦150,000",
  minutes: 30,
  /** 2 (Tuesday) and 3 (Wednesday), matching JavaScript's getDay. */
  days: [2, 3] as const,
  dayNames: "Tuesdays and Wednesdays",
  startHour: 11,
  endHour: 13,
  hoursDisplay: "11am to 1pm",
  timezone: "WAT",
  /** Four half hours across the two hours, so eight in a working week. */
  perDay: 4,
  perWeek: 8,
  label: "A consultation with Dr Kpaduwa",
  /**
   * Said in her own words rather than the clinic's, because the thing being
   * bought is her judgement and nothing else on the page sells that.
   */
  blurb:
    "Half an hour with Dr Kpaduwa herself, by video, from wherever you are. You bring what you are thinking about; she tells you what is actually involved, what she would and would not do, and whether you should be doing anything at all. If the answer is that you should leave it alone, that is the answer you will get. Costings come afterwards, in writing, from the team.",
  /**
   * Dr Kpaduwa's own wording. Note the narrowing: it goes towards surgery, not
   * towards any treatment. A non-surgical course does not carry the credit,
   * and saying "treatment" would quietly promise that it does.
   */
  feeNote: "Put towards the total cost of your surgery if you go ahead.",
  note: "Her diary is two hours a week, so the dates below are the ones that are genuinely open.",
} as const;

/** The days spelled out, for copy that needs them inline. */
export const LYFE_CONSULT_SCHEDULE = `${LYFE_CONSULT.dayNames}, ${LYFE_CONSULT.hoursDisplay} ${LYFE_CONSULT.timezone}`;

export interface ConsultSlot {
  /** ISO instant the consultation starts. */
  iso: string;
  /** "Tuesday 14 October" */
  day: string;
  /** "11:00" */
  time: string;
  /** "Tuesday 14 October, 11:00 WAT" */
  full: string;
}

/**
 * The next bookable half hours in her diary.
 *
 * Real dates, not "Tuesdays and Wednesdays". A named date is a thing a person
 * can picture themselves at and a thing they can see running out; a recurring
 * rule is an abstraction they put off. The list is generated rather than typed
 * so it cannot go stale, and `taken` removes what is already sold rather than
 * decorating the page with scarcity that is not real.
 *
 * Lagos keeps a fixed +01:00 offset with no daylight saving, so the slot can be
 * built as an instant directly without a timezone library.
 */
export function consultSlots({
  from = new Date(),
  weeks = 3,
  taken = [],
  leadHours = 24,
}: {
  from?: Date;
  weeks?: number;
  taken?: string[];
  leadHours?: number;
} = {}): ConsultSlot[] {
  const out: ConsultSlot[] = [];
  const sold = new Set(taken);
  // Nobody should be able to book a slot that starts in ninety minutes.
  const earliest = new Date(from.getTime() + leadHours * 3600_000);

  for (let d = 0; d < weeks * 7 + 1; d++) {
    const day = new Date(from.getTime() + d * 86400_000);
    // Lagos is +01:00 all year, so the Lagos calendar day is the UTC day
    // shifted by an hour.
    const lagos = new Date(day.getTime() + 3600_000);
    const weekday = lagos.getUTCDay();
    if (!(LYFE_CONSULT.days as readonly number[]).includes(weekday)) continue;

    for (let i = 0; i < LYFE_CONSULT.perDay; i++) {
      const minutes = LYFE_CONSULT.startHour * 60 + i * LYFE_CONSULT.minutes;
      if (minutes >= LYFE_CONSULT.endHour * 60) break;
      const start = new Date(
        Date.UTC(
          lagos.getUTCFullYear(),
          lagos.getUTCMonth(),
          lagos.getUTCDate(),
          Math.floor(minutes / 60) - 1, // back to UTC from WAT
          minutes % 60,
        ),
      );
      if (start < earliest) continue;
      const iso = start.toISOString();
      if (sold.has(iso)) continue;

      const label = new Date(start.getTime() + 3600_000);
      const dayLabel = label.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      });
      const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      out.push({ iso, day: dayLabel, time, full: `${dayLabel}, ${time} ${LYFE_CONSULT.timezone}` });
    }
  }
  return out;
}

/** True if this instant is a real slot in her diary, so the API can trust it. */
export function isConsultSlot(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const lagos = new Date(d.getTime() + 3600_000);
  if (!(LYFE_CONSULT.days as readonly number[]).includes(lagos.getUTCDay())) return false;
  const minutes = lagos.getUTCHours() * 60 + lagos.getUTCMinutes();
  if (minutes < LYFE_CONSULT.startHour * 60) return false;
  if (minutes >= LYFE_CONSULT.endHour * 60) return false;
  return minutes % LYFE_CONSULT.minutes === 0 && lagos.getUTCSeconds() === 0;
}

export const LYFE_DOORS = {
  EVENT_RSVP: {
    label: "Come to the evening",
    short: "An evening on how you feel and how you look, and why those are the same appointment",
    blurb:
      "An invitation to a conversation rather than a sales floor. A panel, a conversation with Dr Kpaduwa under her own title, the full menu said out loud, and questions from the room. You can book a consultation on the night if you want one, and nobody will mind if you do not.",
    cta: "Register your interest",
    note: "By invitation. The room holds seventy, invitations are sent from this list, and the address goes to confirmed guests.",
  },
  CONSULTATION: {
    label: "Consult Dr Kpaduwa",
    short: `Half an hour with the surgeon herself, by video, ${LYFE_CONSULT.feeDisplay}`,
    blurb: LYFE_CONSULT.blurb,
    cta: `Book a consultation, ${LYFE_CONSULT.feeDisplay}`,
    note: `${LYFE_CONSULT_SCHEDULE}. ${LYFE_CONSULT.feeNote}`,
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
      "Neither does Dr Kpaduwa. The whole of her position is that the best result is the one nobody can point at. If what you are asking for would be obvious, she will tell you, and she will tell you at the consultation rather than once you are committed.",
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
      "Ask the team and we will tell you, on the telephone or by message, before or after you see her. Dr Kpaduwa does not discuss fees with patients. You get a written quote and the price does not move without you agreeing to it in writing.",
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
  MEZO: "Mezo",
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

/**
 * Social proof.
 *
 * Left empty rather than guessed at. Putting a handle on a page that turns out
 * to belong to somebody else is worse than having no handle, and a dead link
 * under a surgeon's name reads as carelessness to exactly the buyer who is
 * checking whether she is real. Each entry renders only when it is filled.
 */
export const LYFE_SOCIAL: { label: string; handle: string; url: string }[] = [
  // { label: "Instagram", handle: "@...", url: "https://instagram.com/..." },
  // { label: "TikTok", handle: "@...", url: "https://tiktok.com/@..." },
  // { label: "LinkedIn", handle: "Dr Chinwe Kpaduwa", url: "https://..." },
];

/**
 * The consultation page.
 *
 * Bottom of funnel only. Nobody arriving here is asking what a procedure is;
 * they are choosing a surgeon and looking for a reason to stop looking. So
 * every question below is one a Lagos buyer asks last, not first, and the
 * answers are the ones that lose the sale if they are evasive.
 */
export const LYFE_CONSULT_FAQ: { q: string; a: string }[] = [
  {
    q: "Who actually holds the instrument?",
    a: "Dr Kpaduwa operates. For non-surgical treatment the clinician who treats you is named before you book, is registered, and is trained and signed off by her against a logged competency standard rather than a weekend course. If you want to know who will be in the room, ask, and you will be told a name.",
  },
  {
    q: "Who answers at two in the morning?",
    a: "You are given a named contact and a number that is answered, not a general clinic line that opens at nine. Aftercare is the part of this that most people never ask about until they need it, and it is the part that decides how the whole thing feels.",
  },
  {
    q: "Will I look obviously done?",
    a: "Her published position, over two years of writing, is that the point is to look like yourself. If what you are asking for would read as work from across a room, she will say so in the consultation rather than after it.",
  },
  {
    q: "Should I just fly abroad for this?",
    a: "Plenty of people do, and for some procedures the arithmetic genuinely favours it. What travels badly is the complication. If something needs attention in week three you are either on a plane again or in front of a surgeon who did not do the operation and has no notes. That is the trade, said plainly, and you should weigh it rather than be sold past it.",
  },
  {
    q: "What does the consultation cost, and is it wasted if I do not proceed?",
    a: `${LYFE_CONSULT.feeDisplay} for ${LYFE_CONSULT.minutes} minutes with Dr Kpaduwa herself, by video. If you go on to have surgery, it is put towards the total. If you do not, you have bought half an hour of a board certified plastic surgeon's judgement, including the version where she tells you not to have an operation.`,
  },
  {
    q: "Is she really board certified?",
    a: "Board certified by the American Board of Plastic Surgery and a Fellow of the American College of Surgeons. Both are verifiable publicly and you are encouraged to check, because in this market the claim is made more often than it is true.",
  },
  {
    q: "Why the hurry?",
    a: `Her diary here is ${LYFE_CONSULT.hoursDisplay} on ${LYFE_CONSULT.dayNames.toLowerCase()}, which is ${LYFE_CONSULT.perWeek} half hours a week and no more. She is in Nigeria for a limited period. The dates on this page are the real ones.`,
  },
];

/** The four things a buyer weighs at the point of choosing. */
export const LYFE_CONSULT_PROOF: { stat: string; line: string }[] = [
  { stat: "ABPS", line: "Board certified by the American Board of Plastic Surgery" },
  { stat: "FACS", line: "Fellow of the American College of Surgeons" },
  { stat: `${LYFE_CONSULT.perWeek} a week`, line: "Half hours in her diary, and no more than that" },
  { stat: "Towards surgery", line: "The fee goes to the total if you go ahead with an operation" },
];

/**
 * Who stands behind this.
 *
 * A buyer deciding on surgery is deciding who to trust, and a surgeon with no
 * visible institution behind her is a harder yes than one with a licensed
 * centre and a group. Every claim below is drawn from Medbury's own documents
 * or from publicly verifiable credentials. Nothing asserts a site count, a
 * founding year or a patient number, because none of those is on file here.
 */
export const LYFE_ABOUT: { name: string; role: string; body: string }[] = [
  {
    name: "Lyfe Plastics & Dermatology",
    role: "The practice",
    body: "The plastic surgery and dermatology practice led by Dr Chinwe Kpaduwa, board certified by the American Board of Plastic Surgery and a Fellow of the American College of Surgeons. She operates. The clinicians who deliver non-surgical treatment are registered, named before you book, and work to protocols she wrote and signs off.",
  },
  {
    name: "Medlyfe",
    role: "The licensed centre",
    body: "Medlyfe Wellness and Longevity Centre is the licensed, trading entity that hosts the practice and takes the bookings. Longevity, infusion and health optimisation sit alongside the aesthetic side, which is the argument the whole evening is built on: how you feel and how you look are one appointment, not two.",
  },
  {
    name: "Medbury Healthcare",
    role: "The group",
    body: "Medlyfe is a Medbury Healthcare brand. The group runs specialist care, preventive health and wellness businesses in Nigeria, among them LifeCheck Preventive Health Centre, and is led by its chief executive Dr Itunu Akinware.",
  },
];

/**
 * The facility tour.
 *
 * Dr Kpaduwa goes to the doctors rather than waiting for their patients. A
 * referral from a colleague is the highest trust route into a surgical
 * practice and the shortest, because the patient has already decided to trust
 * the person who suggested it.
 *
 * The form is five fields. A consultant filling this in between clinics will
 * not finish eight.
 */
export const LYFE_VISIT = {
  /** Named in the register doctors already use. A round is a thing they do. */
  name: "Facility Rounds",
  areas: ["Lekki Phase 1", "Lekki, elsewhere", "Victoria Island", "Ikoyi", "Somewhere else in Lagos"],
  roles: [
    "Medical Director or Owner",
    "Consultant",
    "General Practitioner",
    "Practice or Facility Manager",
    "Other",
  ],
  minutes: 30,
  /** What she actually does on a visit, so nobody expects a sales call. */
  whatHappens: [
    {
      t: "She comes to you",
      b: "At your facility, at a time that suits your list. Thirty minutes, or longer if you want to walk her round.",
    },
    {
      t: "A real clinical conversation",
      b: "What she does, what she will not do, how she assesses, and where the line sits between what you can manage and what needs an operation.",
    },
    {
      t: "A referral route that works both ways",
      b: "A named contact, a number that is answered, and your patient comes back to you with a letter. If she thinks surgery is wrong for them, you hear that too.",
    },
  ],
} as const;
