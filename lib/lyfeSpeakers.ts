/**
 * The speaker roster, with contacts.
 *
 * Deliberately not in lib/lyfe.ts. That file is imported by the enquiry form,
 * which is a client component, so anything living there ends up in the browser
 * bundle, and panellists' personal addresses are not ours to hand to every
 * visitor who opens devtools.
 *
 * There is no `server-only` guard because that package throws when a plain
 * node script imports it, and the send script needs this list. So the rule is
 * held by hand: never import this file from a "use client" module.
 *
 * `need` is what is outstanding from each of them. It drives the chase, and it
 * is the reason this list exists rather than a thread in somebody's phone.
 */
export interface LyfeSpeaker {
  name: string;
  /** How they are addressed in an email. */
  firstName: string;
  email: string | null;
  org: string;
  /** Their place in the running order. */
  slot: string;
  /** Outstanding items. Empty means they are ready. */
  need: ("bio" | "photo" | "subject" | "confirmation")[];
  /** As supplied by them, for the programme, the press pack and the stage. */
  bio?: string;
  notes?: string;
}

export const LYFE_SPEAKERS: LyfeSpeaker[] = [
  {
    name: "Dr Adedotun Ajelabi",
    firstName: "Dr Ajelabi",
    email: null,
    org: "Medlyfe",
    slot: "the welcome, and the opening address on the range",
    need: ["bio", "photo"],
    notes: "Clinical Lead, Medlyfe. Confirmed by Debo.",
  },
  {
    name: "Dr Itunu Akinware",
    firstName: "Dr Akinware",
    email: null,
    org: "Medbury Healthcare Group",
    slot: "the chair",
    need: ["bio", "photo"],
    notes: "Host. Chairs the panel.",
  },
  {
    name: "Dr Timi Adenuga",
    firstName: "Dr Adenuga",
    email: null,
    org: "GetSlim",
    slot: "the panel, on metabolism, weight and the questions about the new drugs",
    need: ["confirmation", "bio", "photo"],
    notes: "Debo is getting the contact.",
  },
  {
    name: "Gbemi Giwa",
    firstName: "Gbemi",
    email: "hello@gbemigiwa.com",
    org: "The African Fat Loss Method",
    slot: "the panel, on food and body composition",
    need: [],
    bio: "Gbemi Giwa is an award winning fitness and nutrition coach with over a decade of experience helping women build strong, lean bodies and sustainable lifestyles without disconnecting from their culture or real life. She is the founder of the African Fat Loss Method, a coaching system that blends structured strength training, culturally relevant nutrition and mindset work. Her audience runs to more than ninety five thousand across Instagram and TikTok, her work has been covered by Women's Health Middle East, Cosmopolitan Middle East, Entrepreneur, The National and Emirates Woman, and she has worked with Nike and Apple.",
    notes: "Bio received 7 Oct. Bio and portrait both on file. Portrait cropped from her own shoot, 7 Oct.",
  },
  {
    name: "Joycee Awosika",
    firstName: "Joycee",
    email: null,
    org: "The ORÍKÌ Group",
    slot: "the panel, on vitality and energy",
    need: ["confirmation", "bio", "photo"],
    notes: "Spelling is Joycee with two e's on her own properties.",
  },
  {
    name: "Dr Folake Kofo-Idowu",
    firstName: "Dr Kofo-Idowu",
    email: "folake@iyewo.com",
    org: "Nelia, and Doctors for Change",
    slot: "the panel",
    need: ["photo"],
    bio: "Dr Folake Kofo-Idowu is a double board certified physician, founder and Medical Director of Nelia and its women's health service line Nelia Oasi. She practises across internal medicine, metabolic health and infectious diseases, and her work is in evidence-based menopause care, hormone optimisation and preventative women's medicine.",
    notes:
      "Bio taken from her own DFC Catalyst billing in this repo, where she spoke in September. Vice President of Doctors for Change. She is the hormones seat the panel was missing, so the ask to her is now only for a photograph.",
  },
  {
    name: "Dr Chinwe Kpaduwa, MD FACS",
    firstName: "Dr Kpaduwa",
    email: null,
    org: "Lyfe Plastics & Dermatology",
    slot: "the fireside, in conversation with Dr Debo Odulana",
    need: [],
    notes: "Bio and portrait already on file.",
  },
];

/** Everyone we can actually write to today. */
export function speakersWeCanEmail(): LyfeSpeaker[] {
  return LYFE_SPEAKERS.filter((s) => s.email && s.need.length > 0);
}
