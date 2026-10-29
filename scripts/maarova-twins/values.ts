import type { Twin } from "./types";

/**
 * Non-clinical twins for Values and Drivers.
 *
 * This is the module the diagnosis turned on. All twelve items are clinical,
 * and none of them look it from the stem. The tell is in the options: in every
 * single item the *theoretical* choice is the clinician's, "evidence-based
 * medicine updates", "the latest journals or an online clinical seminar",
 * "research that advances clinical understanding".
 *
 * A ranking item forces a choice between the six values. If one of the six is
 * expressed in a language the respondent does not speak, they do not rank it
 * lower because they value it less. They rank it lower because it is not theirs
 * to claim. A finance director holds theoretical values every bit as much as a
 * surgeon; she simply has no way to say so. That is measurement error, not a
 * fit complaint, and it would have run through every non-clinical profile the
 * instrument ever produced.
 *
 * Each twin keeps the six dimensions in the same order. Where an option was
 * already role neutral it is left untouched, because changing it would move the
 * item for no reason.
 */
export const VALUES_TWINS: Twin[] = [
  {
    module: "VALUES_DRIVERS",
    of: "When choosing which hospital improvement project to champion next, I prioritise:",
    text: "When choosing which hospital improvement project to champion next, I prioritise:",
    options: [
      { dimension: "theoretical", label: "Implementing the latest evidence-based management practice" },
      { dimension: "economic", label: "Projects that will improve revenue and reduce waste" },
      { dimension: "aesthetic", label: "Redesigning the staff and visitor experience for comfort and dignity" },
      { dimension: "social", label: "Expanding access for underserved populations in my catchment area" },
      { dimension: "political", label: "Initiatives that raise the hospital's national profile and my department's standing" },
      { dimension: "regulatory", label: "Strengthening compliance with labour, data protection and accreditation standards" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "When I have a free weekend, I am most drawn to:",
    text: "When I have a free weekend, I am most drawn to:",
    options: [
      { dimension: "theoretical", label: "Reading the latest professional journals or attending an online seminar" },
      { dimension: "economic", label: "Reviewing my department's financial dashboards and planning efficiencies" },
      { dimension: "aesthetic", label: "Visiting other institutions to observe their environment and design choices" },
      { dimension: "social", label: "Volunteering at a community outreach programme or local charity" },
      { dimension: "political", label: "Attending a networking event or professional association meeting" },
      { dimension: "regulatory", label: "Reviewing policies, SOPs, or accreditation documentation" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "What I find most rewarding about my role in healthcare leadership is:",
    text: "What I find most rewarding about my role in healthcare leadership is:",
    options: [
      { dimension: "theoretical", label: "Contributing to work that advances how our profession is practised" },
      { dimension: "economic", label: "Delivering a financially viable health service against all odds" },
      { dimension: "aesthetic", label: "Seeing a well-designed building that promotes calm and wellbeing" },
      { dimension: "social", label: "Knowing my work directly improves outcomes for vulnerable communities" },
      { dimension: "political", label: "Influencing health policy and shaping the direction of the institution" },
      { dimension: "regulatory", label: "Maintaining the highest possible corporate governance standards" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "In a leadership retreat, the session I would find most valuable is:",
    text: "In a leadership retreat, the session I would find most valuable is:",
    options: [
      { dimension: "theoretical", label: "Evidence-based practice updates and research methodology" },
      { dimension: "economic", label: "Hospital financial management and revenue diversification" },
      { dimension: "aesthetic", label: "Design thinking for service innovation and user experience" },
      { dimension: "social", label: "Community impact measurement and social determinants of health" },
      { dimension: "political", label: "Strategic influence, board dynamics, and health policy advocacy" },
      { dimension: "regulatory", label: "Risk management frameworks and regulatory compliance masterclass" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "When mentoring the next generation of healthcare leaders, I emphasise:",
    text: "When mentoring the next generation of healthcare leaders, I emphasise:",
    options: [
      { dimension: "theoretical", label: "The importance of staying current with global professional literature" },
      { dimension: "economic", label: "Understanding hospital finance, billing systems, and cost management" },
      { dimension: "aesthetic", label: "Designing services that respect people's dignity and cultural context" },
      { dimension: "social", label: "Commitment to health equity and serving those most in need" },
      { dimension: "political", label: "Building networks, influence, and strategic career positioning" },
      { dimension: "regulatory", label: "Mastering corporate governance, risk management, and regulatory compliance" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "When a crisis hits my hospital, the first thing I focus on is:",
    text: "When a crisis hits my hospital, the first thing I focus on is:",
    options: [
      { dimension: "theoretical", label: "What does the evidence say about the best response?" },
      { dimension: "economic", label: "What are the financial implications and how do we protect the bottom line?" },
      { dimension: "aesthetic", label: "How do we maintain a calm, reassuring environment for everyone on site?" },
      { dimension: "social", label: "How do we protect the most vulnerable people affected by this?" },
      { dimension: "political", label: "How do we manage the messaging and maintain institutional reputation?" },
      { dimension: "regulatory", label: "What do the incident response protocols and regulations require?" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "If I had unrestricted funding for one hospital initiative, I would invest in:",
    text: "If I had unrestricted funding for one hospital initiative, I would invest in:",
    options: [
      { dimension: "theoretical", label: "A state-of-the-art training and simulation centre" },
      { dimension: "economic", label: "Revenue cycle optimisation and operational efficiency technology" },
      { dimension: "aesthetic", label: "A complete facility redesign focused on the experience of everyone who uses it" },
      { dimension: "social", label: "Community outreach programmes reaching remote areas" },
      { dimension: "political", label: "A leadership development academy to grow institutional influence" },
      { dimension: "regulatory", label: "An integrated quality management and accreditation readiness system" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "The healthcare leader I most admire is someone who:",
    text: "The healthcare leader I most admire is someone who:",
    options: [
      { dimension: "theoretical", label: "Made groundbreaking contributions to how health systems are run" },
      { dimension: "economic", label: "Built a financially sustainable healthcare institution from nothing" },
      { dimension: "aesthetic", label: "Transformed how it feels to work in and walk into a health institution" },
      { dimension: "social", label: "Dedicated their career to serving underserved communities" },
      { dimension: "political", label: "Rose to national influence and shaped health policy for millions" },
      { dimension: "regulatory", label: "Set the gold standard for governance and safety culture" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "The achievement I would be most proud of at the end of my career is:",
    text: "The achievement I would be most proud of at the end of my career is:",
    options: [
      { dimension: "theoretical", label: "Publishing landmark work that changed how institutions are run in Africa" },
      { dimension: "economic", label: "Turning around a financially distressed hospital into a sustainable institution" },
      { dimension: "aesthetic", label: "Building a hospital environment recognised for how it treats the people in it" },
      { dimension: "social", label: "Measurably widening access to health services across my region" },
      { dimension: "political", label: "Serving on national health policy committees and shaping health legislation" },
      { dimension: "regulatory", label: "Achieving international accreditation for a Nigerian or African hospital" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "When recruiting a new senior clinician, I value most:",
    text: "When recruiting a new senior manager, I value most:",
    options: [
      { dimension: "theoretical", label: "Their academic credentials, publications, and commitment to evidence" },
      { dimension: "economic", label: "Their ability to generate revenue and manage resources efficiently" },
      { dimension: "aesthetic", label: "Their manner with people and commitment to considerate, humane service" },
      { dimension: "social", label: "Their track record of community service and pro-bono work" },
      { dimension: "political", label: "Their professional networks, reputation, and ability to open doors" },
      { dimension: "regulatory", label: "Their attention to protocols, documentation, and regulatory compliance" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "When evaluating a potential partnership with an international health organisation, I weigh most heavily:",
    text: "When evaluating a potential partnership with an international health organisation, I weigh most heavily:",
    options: [
      { dimension: "theoretical", label: "Access to the latest research, training, and knowledge exchange" },
      { dimension: "economic", label: "Financial sustainability and fair economic terms of the partnership" },
      { dimension: "aesthetic", label: "Alignment with our values around person-centred, culturally appropriate service" },
      { dimension: "social", label: "Impact on health outcomes for the communities we serve" },
      { dimension: "political", label: "The strategic positioning and prestige the partnership brings" },
      { dimension: "regulatory", label: "Compliance requirements and alignment with local regulatory frameworks" },
    ],
  },
  {
    module: "VALUES_DRIVERS",
    of: "When measuring my department's success at year-end, I give most weight to:",
    text: "When measuring my department's success at year-end, I give most weight to:",
    options: [
      { dimension: "theoretical", label: "Research outputs, audit completions, and standard adherence rates" },
      { dimension: "economic", label: "Revenue targets met, cost savings achieved, and budget discipline" },
      { dimension: "aesthetic", label: "Service satisfaction scores and complaints reduction" },
      { dimension: "social", label: "Community impact indicators and outreach coverage" },
      { dimension: "political", label: "National rankings, media coverage, and stakeholder relationships strengthened" },
      { dimension: "regulatory", label: "Compliance scores, incident rates, and accreditation readiness" },
    ],
  },
];
