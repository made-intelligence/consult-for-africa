/**
 * After AGELESS: the films, the feedback questions and The Lyfe Place waiting
 * list. One definition read by the page, the forms, the API route, the admin
 * view and the thank-you mail, so none of them can drift.
 *
 * Responses land in AuditSurveyResponse (survey is a free string, payload is
 * Json), so neither form needs a migration. A guest who asks to book is
 * written onto their own LyfeEnquiry row as the next action, so the request
 * lands in the coordinator's existing queue rather than a new inbox.
 */

const FILMS_BASE = "https://pub-8a22dea573ee4a5dae362925fc14c5f1.r2.dev/marketing/ageless";

export const AGELESS_FILMS = {
  medlyfe: {
    title: "Inside MedLYFE",
    line: "A visit to the centre in Lekki, from the front desk to the treatment room.",
    src: `${FILMS_BASE}/medlyfe-film.mp4`,
    poster: "/lyfe/medlyfe-poster.jpg",
    seconds: 73,
  },
  lyfeplace: {
    title: "The Lyfe Place",
    line: "The wellness park the group is building, where longevity medicine, fitness, nutrition, aesthetics and recovery sit side by side.",
    src: `${FILMS_BASE}/lyfeplace-film.mp4`,
    poster: "/lyfe/lyfeplace-poster.jpg",
    seconds: 100,
  },
} as const;

/**
 * The voucher every guest took home in their pack. Its terms are MedLYFE's,
 * so nothing here states a value or a date until they are confirmed: the
 * wording below is true of any voucher.
 */
export const AGELESS_VOUCHER = {
  /** Set these once MedLYFE confirms them; the page and mail pick them up. */
  offer: null as string | null, // e.g. "a complimentary longevity assessment"
  validUntil: null as string | null, // e.g. "30 November 2026"
  line: "Your AGELESS souvenir pack holds a MedLYFE voucher. Book through the link below and mention it, and the team will apply it.",
};

/** Where to find MedLYFE. Taken from its own brochure and site. */
export const MEDLYFE_FIND_US = {
  address: "25 Admiralty Way, Lekki Phase 1, Lagos",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=MedLYFE+25+Admiralty+Way+Lekki+Phase+1+Lagos",
  phoneDisplay: "+234 911 981 9727",
  phoneTel: "+2349119819727",
  whatsapp: "2349119819727",
  email: "info@medlyfewellness.com",
  website: "https://medlyfewellness.com",
  websiteDisplay: "medlyfewellness.com",
  instagram: "https://www.instagram.com/medlyfe_wellness/",
  instagramHandle: "@medlyfe_wellness",
};

/** What people can ask to book. Mirrors the six areas of care on the banner. */
export const AGELESS_CARE_AREAS = [
  { key: "PREVENTIVE", label: "Preventive and precision medicine", service: "LONGEVITY" },
  { key: "LONGEVITY", label: "Longevity and healthy ageing", service: "LONGEVITY" },
  { key: "METABOLIC", label: "Metabolic health and weight", service: "METABOLIC" },
  { key: "HORMONAL", label: "Hormonal and functional health", service: "METABOLIC" },
  { key: "AESTHETICS", label: "Skin and regenerative aesthetics", service: "SKIN" },
  { key: "SURGERY", label: "Plastic surgery, with Dr Chinwe Kpaduwa", service: "SURGERY" },
] as const;
export type AgelessCareArea = (typeof AGELESS_CARE_AREAS)[number]["key"];

export const AGELESS_MOMENTS = [
  "The opening film",
  "Dr Ajelabi's opening address",
  "The panel",
  "Questions from the room",
  "Dr Akinware's vote of thanks",
  "After Hours and meeting the speakers",
  "The takeaway pack",
] as const;

export const AGELESS_SPEAKERS = [
  "Dr Adedotun Ajelabi",
  "Dr Timi Adenuga",
  "Gbemi Giwa",
  "Joycee Awosika",
  "Dr Chinwe Kpaduwa",
  "Dr Debo Odulana",
] as const;

export const AGELESS_NEXT_TOPICS = [
  "Sleep and recovery",
  "Menopause and andropause",
  "Heart health and blood pressure",
  "Gut health and nutrition",
  "Strength and mobility after 40",
  "Skin and aesthetics in depth",
  "Fertility and hormones",
  "Mental health and stress",
] as const;

export const LYFEPLACE_INTERESTS = [
  "Longevity medicine and health assessments",
  "Fitness and strength training",
  "Nutrition",
  "Aesthetics and skin",
  "Spa, recovery and relaxation",
  "Membership for my family",
  "Corporate membership for my team",
] as const;

export const AGELESS_CONTACT_PREF = ["WhatsApp", "A phone call", "Email"] as const;

/** Stored on every response so the lawful basis is on the row (NDPA 2023). */
export const AGELESS_CONSENT_TEXT =
  "I agree that MedLYFE Wellness and Longevity Centre, with Consult for Africa, may hold what I have shared to improve future events and, where I have asked, to contact me. I can ask for my details to be removed at any time.";

/** Medbury copies on every booking alert and on one example of each guest mail. */
export const AGELESS_MEDBURY_CC = ["opeoluwa.duntoye@medburyhealthcare.com"];

export const AGELESS_SURVEYS = ["ageless-feedback", "lyfeplace-waitlist"] as const;
export type AgelessSurvey = (typeof AGELESS_SURVEYS)[number];

/** A personal link: the guest's own invitation token, if they have one. */
export function agelessLink(path: "" | "/feedback", token?: string | null, extra = ""): string {
  const base = `https://www.consultforafrica.com/ageless${path}`;
  const q = new URLSearchParams();
  if (token) q.set("g", token);
  q.set("src", "thankyou");
  return `${base}?${q.toString()}${extra}`;
}

export function agelessBookLink(): string {
  return "https://www.consultforafrica.com/lyfe/consult?src=ageless#book";
}
