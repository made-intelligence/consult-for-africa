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
  /**
   * Added by Dr Akinware on her review, 8 October 2026: what each speaker
   * should prepare to open with in two to three minutes. The questions tell
   * them where the conversation goes; this tells them where to start.
   */
  focus?: string;
  /** The line that appears under their name in the programme. */
  subject?: string;
  notes?: string;
}

export const LYFE_SPEAKERS: LyfeSpeaker[] = [
  {
    name: "Dr Adedotun Ajelabi",
    firstName: "Dr Ajelabi",
    email: "adedotun.ajelabi@medlyfewellness.com",
    org: "MedLYFE",
    slot: "the welcome and opening address on longevity medicine and healthspan",
    subject: "Can We Live to 100 and Still Live Well?",
    focus:
      "Dr Ajelabi should set the tone for the evening by explaining longevity medicine in clear terms: the difference between lifespan and healthspan, what changes in the body through the 30s, 40s and 50s, and how preventive medicine, advanced diagnostics, AI and personalised optimisation can help people reduce risk, preserve vitality and avoid simply repeating the disease patterns they have seen in older generations.",
    questions: [
      "What is longevity medicine, and how is it different from waiting until someone becomes ill?",
      "What is the difference between lifespan and healthspan, and why should guests care about both now?",
      "What changes in the body from the 30s through the 50s that people often ignore until disease appears?",
      "How can advanced diagnostics, AI and preventive care help people see risk earlier and act sooner?",
      "How can people avoid repeating the health patterns they have seen in their parents or older relatives?",
      "What does MedLYFE do in practice to help a person understand and optimise their body for prevention, vitality and long life?",
    ],
    need: ["bio"],
    bio: "Dr Adedotun Ajelabi is a Consultant Family Physician and Fellow of the West African College of Physicians, with more than ten years of clinical experience across private and public healthcare. She is Head of Medicals at the MedLYFE Wellness and Longevity Centre, where she leads clinical delivery of precision health, functional medicine, longevity, preventive health and wellness programmes. She has specialised training in longevity medicine through the American Board of Longevity Medicine and in regenerative medicine through the American Board of Regenerative Medicine. Her work is about moving healthcare from treating disease towards proactive, personalised and preventive medicine, using evidence-informed approaches to extend healthspan, reduce disease risk and support healthy ageing. She received the WONCA Atai Omoruto Scholarship in 2025 for her commitment to primary and family healthcare. She is a member of the Society of Family Physicians of Nigeria, the Society of Lifestyle Medicine of Nigeria, the Society of Occupational and Environmental Health Physicians and the Nigerian Society of Travel Medicine.",
    notes: "Clinical Lead, MedLYFE. Portrait on file. Bio drafted here from public sources and needs her sign off.",
  },
  {
    name: "Dr Itunu Akinware",
    firstName: "Dr Akinware",
    email: "itunu.akinware@medburyhealthcare.com",
    org: "Medbury Healthcare Group",
    slot: "the host",
    subject: "Host",
    need: [],
    bio: "Dr Itunu Akinware is a medical doctor with an MBA from Lagos Business School specialising in healthcare management. She began as a Medical Officer before moving into business development, shaped by research and collaborations in the UAE, UK, USA and India. She has consulted for the International Finance Corporation of the World Bank Group and served as Executive Secretary of the Healthcare Federation of Nigeria. Under her leadership Medbury Healthcare has expanded into Medbury Services, Diagnostics, Aesthetics, Pharmaceuticals and Wellness. She also invests in Nigerian healthcare startups.",
    notes: "Host. Reviewed and returned the whole pack 8 October 2026 and this is her wording throughout, including the chairing direction now carried by Dr Odulana, whom she asked to chair in her place.",
  },
  {
    name: "Dr Debo Odulana",
    firstName: "Debo",
    email: "dodulana@gmail.com",
    org: "Consult for Africa",
    slot: "the chair",
    subject: "Panel chair and practical takeaways",
    focus:
      "Keep the discussion practical and mixed. Push each speaker to explain what changes with age, what can be done naturally, where medical support helps, what is being oversold, and what one action a guest can take this week.",
    need: [],
    bio: "Dr Debo Odulana is a physician and healthcare operator with sixteen years in hospital leadership, health system strategy and venture building across Africa, the Middle East and the UK. He is Founding Partner of Consult for Africa, a healthcare advisory and venture firm that takes build and operate mandates rather than reports. He took a 75-bed Abuja surgical hospital to the strongest financial year in its sixteen-year history, reset the clinical workforce economics of a fund-owned tertiary network without losing volume, and built a 21-state private healthcare network that was acquired by the market leader. MBBS, MSc, and fully registered with the Medical and Dental Council of Nigeria.",
    notes: "Chairing at Dr Akinware's request, 8 October 2026. Her chairing direction carried across unchanged.",
  },
  {
    name: "Dr Timi Adenuga",
    firstName: "Dr Adenuga",
    email: "timiadenuga@getslim.ng",
    org: "GetSlim",
    slot: "the panel, on weight, metabolism, body composition and medical weight management",
    subject: "Weight Metabolism and Longevity",
    focus:
      "Dr Adenuga should connect metabolic health to longevity and healthspan. He should explain why weight is not only about appearance, how visceral fat, muscle mass, hormones and body composition affect risk, why men and women often gain or hold weight differently as they age, and what a serious medical approach can include: nutrition, supplementation, GLP-1 medicines, other metabolic support and bariatric surgery when clinically appropriate.",
    questions: [
      "Why does metabolic health matter for longevity and healthspan, not just size or appearance?",
      "What should people know about visceral fat, muscle and body composition as they age?",
      "Why do men and women often gain weight or hold fat differently in midlife?",
      "How should someone think about their ideal weight, waist size or body composition target?",
      "When should someone consider supplements, structured nutrition, GLP-1 medicines or other medical weight support? And are these new drugs safe?",
      "Who is bariatric surgery or a sleeve really for, and when is it not the right answer?",
      "What happens after treatment, and how do people maintain results once the first weight loss phase is over?",
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
    slot: "the panel, on nutrition, training, lifestyle and behaviour change",
    subject: "Lifestyle and Behaviour Change for Longevity",
    focus:
      "Gbemi should speak to the lifestyle and behaviour-change part of longevity. The emphasis is not only that people should eat more protein, lift weights or do cardio, but why those habits matter for ageing well and how busy adults can actually stay consistent. Her angle should cover Nigerian food, strength training, cardio fitness, recovery, habit formation and realistic systems that make change sustainable.",
    questions: [
      "Everyone knows they should eat better and train. Why is consistency the hard part?",
      "How should people eat for fat loss, muscle and longevity without abandoning Nigerian food?",
      "What changes for men and women in the 30s, 40s and 50s around muscle, hormones, appetite and recovery?",
      "Why do strength training, cardio fitness, VO2 max and mobility matter for ageing well?",
      "How do you help people build habits that survive work, travel, children and Lagos life?",
      "What does a realistic twelve week reset look like for someone who is busy and starting again?",
      "What works, costs nothing and can start this week?",
    ],
    need: [],
    bio: "Gbemi Giwa is an award winning fitness and nutrition coach with over a decade of experience helping clients, especially women, build strong, lean bodies and sustainable lifestyles without disconnecting from their culture or real life. She is the founder of the African Fat Loss Method, a coaching system that blends structured strength training, culturally relevant nutrition and mindset work. Her audience runs to more than ninety five thousand across Instagram and TikTok, her work has been covered by Women's Health Middle East, Cosmopolitan Middle East, Entrepreneur, The National and Emirates Woman, and she has worked with Nike and Apple.",
    notes: "Bio and portrait on file. Bio amended on the chair's review to read clients, especially women.",
  },
  {
    name: "Joycee Awosika",
    firstName: "Joycee",
    email: "Soar@joyceeawosika.com",
    org: "The ORÍKÌ Group",
    slot: "the panel, on stress management, self-care and recovery",
    subject: "Stress Management & Self Care and Longevity",
    focus:
      "Joycee should focus on self-care as a serious part of longevity. Her contribution should cover stress, burnout, recovery, mental wellbeing, nervous-system regulation and the practical ways high-performing adults can build care into their lives before exhaustion becomes their normal state. This should be about sustainable self-care, emotional regulation and recovery.",
    questions: [
      "Why should self-care be seen as part of longevity, not as an indulgence?",
      "How do stress and burnout affect energy, mood, sleep, decisions and the way people age?",
      "What are the warning signs that a high-performing person is no longer recovering properly?",
      "What practical self-care routines can busy men and women build into a real Lagos week?",
      "How can people use spa, recovery, quiet time, therapy, community or personal rituals without turning self-care into another stressful task?",
      "What works when someone already feels overwhelmed?",
    ],
    need: ["confirmation"],
    bio: "Joycee Awosika is an award winning entrepreneur, energy economist and global speaker, and Founder and Managing Director of the ORÍKÌ Group. Since founding ORÍKÌ in 2015 she has built a vertically integrated wellness and beauty business spanning more than sixteen wellness destinations across Nigeria, Kenya, Uganda and the UAE, FSC Manufacturing serving over a hundred brands, Anoint Hair Restoration, the UNWIND technology platform, the ORÍKÌ Training Institute and the ORÍKÌ Foundation. She chairs the Nigeria Wellness Spa Technical Committee.",
    notes: "Portrait and bio on file. Spelling is Joycee with two e's. Sally and Dr Akinware own confirming her.",
  },
  {
    name: "Dr Chinwe Kpaduwa, MD FACS",
    firstName: "Dr Kpaduwa",
    email: null,
    // Her review still carried the old working name here. There is no such
    // practice, so the centre stands in its place.
    org: "MedLYFE Wellness and Longevity Centre",
    slot: "the panel, on skin ageing, aesthetics, body changes, hair loss and responsible procedure choices",
    subject:
      "Maintaining Beauty Aesthetics and Skin for Men and Women as they age",
    focus:
      "Dr Chinwe should give guests a grounded medical view of aesthetics for men and women. She should explain how the face, skin, fat pads, fascia and facial structure change with age; what happens to skin quality, lines, sagging, pigmentation and hair; how women may experience body changes after pregnancy such as diastasis recti or loose skin; and how to think responsibly about skincare, beauty supplements, nutrition, Botox, fillers, regenerative treatments, lasers and surgery. Black skin safety, scarring, pigmentation and natural-looking outcomes should remain central.",
    questions: [
      "What actually happens to the face as we age: skin, collagen, fat pads, fascia, bone and facial structure?",
      "How do ageing patterns and aesthetic concerns differ for women and men?",
      "For women after pregnancy, what are the common body changes such as diastasis recti, loose skin or breast changes, and what can be done?",
      "Where do skincare, sun protection, nutrition and supplements help, and where do they stop?",
      "What do Botox, fillers, biostimulators, lasers or regenerative treatments actually do, and how should people approach them safely?",
      "Hair loss affects many men and women. What are the common causes and medical or procedural options?",
      "When does surgery become the right option, and how should people decide without chasing trends?",
      "What is different about treating Black skin, including pigmentation, scarring and procedure risk?",
      "What does looking like yourself mean in practice, and what would you refuse to do?",
    ],
    need: [],
    bio: "Dr Chinwe Kpaduwa is a plastic surgeon, board certified by the American Board of Plastic Surgery and a Fellow of the American College of Surgeons. Harvard educated, California trained, with a craniofacial fellowship at Nationwide Children's Hospital.",
    notes: "Reached directly by Debo. Bio and portrait on file.",
  },
];

/** Everyone we can actually write to today. */
export function speakersWeCanEmail(): LyfeSpeaker[] {
  return LYFE_SPEAKERS.filter((s) => s.email && s.need.length > 0);
}
