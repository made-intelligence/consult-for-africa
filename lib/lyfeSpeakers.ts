/**
 * Never let this reach a browser.
 *
 * These are speakers' personal and work addresses, given to us for
 * communications and nothing else. `server-only` is not usable here because it
 * throws when a plain node script imports it and the send script needs this
 * list, so the guard is explicit instead: importing this from a "use client"
 * module fails loudly at runtime rather than quietly shipping the addresses to
 * anyone who opens devtools.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "lib/lyfeSpeakers.ts is server only. It holds speakers' email addresses.",
  );
}

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
  /** What the chair will actually put to them. A brief, not a script. */
  questions?: string[];
  /** The line that appears under their name in the programme. */
  subject?: string;
  notes?: string;
}

export const LYFE_SPEAKERS: LyfeSpeaker[] = [
  {
    name: "Dr Adedotun Ajelabi",
    firstName: "Dr Ajelabi",
    email: "adedotun.ajelabi@medlyfewellness.com",
    org: "Medlyfe",
    slot: "the welcome, and the opening address on the range",
    subject: "Opening address, the range",
    questions: [
      "What can medicine do about how we age now that it could not ten years ago?",
      "Where does the everyday end and the medical begin?",
      "What is established, and what is being oversold right now?",
      "What does Medlyfe do with that range in practice?",
    ],
    need: ["bio"],
    bio: "Dr Adedotun Ajelabi is a Consultant Family Physician and Fellow of the West African College of Physicians, with more than ten years of clinical experience across private and public healthcare. She is Head of Medicals at the Medlyfe Wellness and Longevity Centre, where she leads clinical delivery of precision health, functional medicine, longevity, preventive health and wellness programmes. She has specialised training in longevity medicine through the American Board of Longevity Medicine and in regenerative medicine through the American Board of Regenerative Medicine. Her work is about moving healthcare from treating disease towards proactive, personalised and preventive medicine, using evidence-informed approaches to extend healthspan, reduce disease risk and support healthy ageing. She received the WONCA Atai Omoruto Scholarship in 2025 for her commitment to primary and family healthcare. She is a member of the Society of Family Physicians of Nigeria, the Society of Lifestyle Medicine of Nigeria, the Society of Occupational and Environmental Health Physicians and the Nigerian Society of Travel Medicine.",
    notes: "Clinical Lead, Medlyfe. Portrait on file. Bio drafted here from public sources and needs her sign off.",
  },
  {
    name: "Dr Itunu Akinware",
    firstName: "Dr Akinware",
    email: "itunu.akinware@medburyhealthcare.com",
    org: "Medbury Healthcare Group",
    slot: "the chair",
    subject: "In the chair",
    questions: [
      "You are chairing rather than speaking to a subject. The questions you will put are below.",
    ],
    need: [],
    bio: "Dr Itunu Akinware is a medical doctor with an MBA from Lagos Business School specialising in healthcare management. She began as a Medical Officer before moving into business development, shaped by research and collaborations in the UAE, UK, USA and India. She has consulted for the International Finance Corporation of the World Bank Group and served as Executive Secretary of the Healthcare Federation of Nigeria. Under her leadership Medbury Healthcare has expanded into Medbury Services, Diagnostics, Aesthetics, Pharmaceuticals and Wellness. She also invests in Nigerian healthcare startups.",
    notes: "Host and chair. Portrait and bio on file 8 Oct, from her own profile.",
  },
  {
    name: "Dr Timi Adenuga",
    firstName: "Dr Adenuga",
    email: "timiadenuga@getslim.ng",
    org: "GetSlim",
    slot: "the panel, on metabolism, weight, hormones and the questions about the new drugs",
    subject: "Metabolism, weight, hormones and the body, and the new drugs",
    questions: [
      "Why does the same diet stop working at 45?",
      "The weight loss drugs. Who are they for, who should not take them, what is the honest result?",
      "What happens when someone stops?",
      "Hormones and the body as we age. What do you see that people misread as diet?",
      "Is surgery ever the right first answer?",
    ],
    need: ["confirmation", "bio"],
    bio: "Dr Timi Adenuga, MBBS, ChM, FWACS, FMCS, MRCSEd, is the Lead Bariatric and Laparoscopic Surgeon at GetSlim Nigeria, and one of a small group of surgeons in the region with extensive international training in bariatric and metabolic surgery. He has performed more than 1,000 bariatric procedures and supported more than 5,000 patients to sustained, clinically meaningful weight loss. He specialises in minimally invasive bariatric surgery, including gastric sleeve, gastric bypass and gastric balloon, treating obesity and the conditions that come with it, among them diabetes, hypertension and sleep apnoea. He holds a Master's in General Surgery (ChM) from the University of Edinburgh and a Diploma in Clinical Research from the Harvard T.H. Chan School of Public Health, and trained in the United Kingdom, France, Rwanda and Egypt. He is Secretary of the Bariatric and Metabolic Surgeons Society of Nigeria and a member of the International Federation for the Surgery of Obesity and Metabolic Disorders and the Royal College of Surgeons of Edinburgh. He consults at GetSlim clinics in Lagos and Abuja.",
    notes: "Portrait on file. Bio drafted here from public sources and needs his sign off.",
  },
  {
    name: "Gbemi Giwa",
    firstName: "Gbemi",
    email: "hello@gbemigiwa.com",
    org: "The African Fat Loss Method",
    slot: "the panel, on food and body composition",
    subject: "Food and body composition",
    questions: [
      "Can you eat Nigerian food and change your body? What does that look like on a real plate?",
      "What do people get wrong in the first month?",
      "A woman of 45 who has never lifted. Where does she start?",
      "What does a realistic twelve weeks look like?",
      "What works and costs nothing?",
    ],
    need: [],
    bio: "Gbemi Giwa is an award winning fitness and nutrition coach with over a decade of experience helping women build strong, lean bodies and sustainable lifestyles without disconnecting from their culture or real life. She is the founder of the African Fat Loss Method, a coaching system that blends structured strength training, culturally relevant nutrition and mindset work. Her audience runs to more than ninety five thousand across Instagram and TikTok, her work has been covered by Women's Health Middle East, Cosmopolitan Middle East, Entrepreneur, The National and Emirates Woman, and she has worked with Nike and Apple.",
    notes: "Bio received 7 Oct. Bio and portrait both on file. Portrait cropped from her own shoot, 7 Oct.",
  },
  {
    name: "Joycee Awosika",
    firstName: "Joycee",
    email: "Soar@joyceeawosika.com",
    org: "The ORÍKÌ Group",
    slot: "the panel, on maintaining beauty and managing stress",
    subject: "Maintaining beauty, and managing stress",
    questions: [
      "What does maintaining beauty actually take, week to week, for a working woman in Lagos?",
      "Ten years in this market. What do Nigerian women buy, and what do they say they want?",
      "What is sold in Lagos that does not work?",
      "Stress. What does it do to how people look, and what do you see in your clients?",
      "What is the cheapest thing that works?",
    ],
    need: ["confirmation"],
    bio: "Joycee Awosika is an award winning entrepreneur, energy economist and global speaker, and Founder and Managing Director of the ORÍKÌ Group. Since founding ORÍKÌ in 2015 she has built a vertically integrated wellness and beauty business spanning more than sixteen wellness destinations across Nigeria, Kenya, Uganda and the UAE, FSC Manufacturing serving over a hundred brands, Anoint Hair Restoration, the UNWIND technology platform, the ORÍKÌ Training Institute and the ORÍKÌ Foundation. She chairs the Nigeria Wellness Spa Technical Committee.",
    notes: "Portrait on file 8 Oct. Spelling is Joycee with two e's. Sally and Dr Akinware own confirming her. Bio on file 8 Oct, from her own profile.",
  },
  {
    name: "Dr Chinwe Kpaduwa, MD FACS",
    firstName: "Dr Kpaduwa",
    email: null,
    org: "Medlyfe Wellness and Longevity Centre",
    slot: "the panel, on ageing in Black skin, aesthetics and plastic surgery",
    subject:
      "Ageing as a Black woman. Skin, aesthetics, and what anti-ageing marketing is worth in a Black population",
    questions: [
      "Ageing as a Black woman. What actually happens to Black skin over time, and how is it different?",
      "Most anti-ageing marketing is built on white skin. What of it applies here, and what does not?",
      "Which procedures are worth doing in a Black population, and which carry more risk on our skin?",
      "Hormonal change shows up in skin. What do you see, and what helps?",
      "What does looking like yourself mean in practice, and what do you refuse to do?",
      "Travelling abroad for surgery. What goes wrong, and when?",
    ],
    need: [],
    bio: "Dr Chinwe Kpaduwa is a plastic surgeon, board certified by the American Board of Plastic Surgery and a Fellow of the American College of Surgeons. Harvard educated, California trained, with a craniofacial fellowship at Nationwide Children's Hospital.",
    notes: "Reached directly by Debo. Bio and portrait on file. Her ground is ageing in Black skin, aesthetic medicine and plastic surgery, and what the anti-ageing market is actually worth to a Black population. Metabolism and hormones sit with Dr Adenuga.",
  },
];

/** Everyone we can actually write to today. */
export function speakersWeCanEmail(): LyfeSpeaker[] {
  return LYFE_SPEAKERS.filter((s) => s.email && s.need.length > 0);
}
