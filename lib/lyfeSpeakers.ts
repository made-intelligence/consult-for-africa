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
    need: ["photo"],
    bio: "Gbemi Giwa is an award winning fitness and nutrition coach with over a decade of experience helping women build strong, lean bodies and sustainable lifestyles without disconnecting from their culture or real life. She is the founder of the African Fat Loss Method, a coaching system that blends structured strength training, culturally relevant nutrition and mindset work. Her audience runs to more than ninety five thousand across Instagram and TikTok, her work has been covered by Women's Health Middle East, Cosmopolitan Middle East, Entrepreneur, The National and Emirates Woman, and she has worked with Nike and Apple.",
    notes: "Bio received 7 Oct. Photographs are in a Google Drive folder that needs downloading; the Drive connector here is not authorised.",
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
    org: "Doctors for Change",
    slot: "the panel",
    need: ["bio", "photo", "subject"],
    notes:
      "Vice President of Doctors for Change. Her DFC record carries no bio, photograph, institution or specialty, so her panel subject cannot be written until she sends one.",
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
