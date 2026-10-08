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
    need: [],
    bio: "Dr Adedotun Ajelabi is a Consultant Family Physician and Fellow of the West African College of Physicians, with more than ten years of clinical experience across private and public healthcare. She is Head of Medicals at the Medlyfe Wellness and Longevity Centre, where she leads clinical delivery of precision health, functional medicine, longevity, preventive health and wellness programmes. She has specialised training in longevity medicine through the American Board of Longevity Medicine and in regenerative medicine through the American Board of Regenerative Medicine. Her work is about moving healthcare from treating disease towards proactive, personalised and preventive medicine, using evidence-informed approaches to extend healthspan, reduce disease risk and support healthy ageing. She received the WONCA Atai Omoruto Scholarship in 2025 for her commitment to primary and family healthcare. She is a member of the Society of Family Physicians of Nigeria, the Society of Lifestyle Medicine of Nigeria, the Society of Occupational and Environmental Health Physicians and the Nigerian Society of Travel Medicine.",
    notes: "Head of Medicals, Medlyfe (was listed as Clinical Lead). Bio and portrait received 8 Oct; portrait cropped from her studio shoot.",
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
    email: "timiadenuga@getslim.ng",
    org: "GetSlim",
    slot: "the panel, on metabolism, weight and the questions about the new drugs",
    need: [],
    bio: "Dr Timi Adenuga, MBBS, ChM, FWACS, FMCS, MRCSEd, is the Lead Bariatric and Laparoscopic Surgeon at GetSlim Nigeria, and one of a small group of surgeons in the region with extensive international training in bariatric and metabolic surgery. He has performed more than 1,000 bariatric procedures and supported more than 5,000 patients to sustained, clinically meaningful weight loss. He specialises in minimally invasive bariatric surgery, including gastric sleeve, gastric bypass and gastric balloon, treating obesity and the conditions that come with it, among them diabetes, hypertension and sleep apnoea. He holds a Master's in General Surgery (ChM) from the University of Edinburgh and a Diploma in Clinical Research from the Harvard T.H. Chan School of Public Health, and trained in the United Kingdom, France, Rwanda and Egypt. He is Secretary of the Bariatric and Metabolic Surgeons Society of Nigeria and a member of the International Federation for the Surgery of Obesity and Metabolic Disorders and the Royal College of Surgeons of Edinburgh. He consults at GetSlim clinics in Lagos and Abuja.",
    notes: "Bio, email and portrait received 8 Oct.",
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
    slot: "the panel, on maintaining beauty and managing stress",
    need: ["confirmation", "bio", "photo"],
    notes: "Spelling is Joycee with two e's on her own properties. Sally and Dr Akinware own confirming her and getting the bio and photograph.",
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
];

/** Everyone we can actually write to today. */
export function speakersWeCanEmail(): LyfeSpeaker[] {
  return LYFE_SPEAKERS.filter((s) => s.email && s.need.length > 0);
}
