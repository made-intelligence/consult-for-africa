/**
 * Career readiness scoring: domestic, UK, US, Canada and Gulf, 0-100 each.
 * Shared by the public /oncadre/readiness quiz (answers typed in) and the
 * in-portal career report (answers read from the member's profile), so a
 * member sees the same score whichever route they took.
 */

/* ─── types ────────────────────────────────────────────────────────────────── */

export interface ReadinessInputs {
  cadre: string;
  yearsOfExperience: number;
  hasFullRegistration: boolean;
  hasPracticingLicense: boolean;
  hasCOGS: boolean;
  postgraduateLevel: string;
  ieltsScore: string;
  oetPassed: boolean;
  plab1Passed: boolean;
  plab2Passed: boolean;
  usmlePassed: string;
  cpdPointsCurrent: number;
  cpdPointsRequired: number;
  additionalCerts: string[];
}

export interface ReadinessScores {
  domestic: number;
  uk: number;
  us: number;
  canada: number;
  gulf: number;
  gaps: { area: string; action: string; impact: string }[];
}

/* ─── scoring logic ─────────────────────────────────────────────────────── */

export function computeReadinessScores(data: ReadinessInputs): ReadinessScores {
  const gaps: { area: string; action: string; impact: string }[] = [];

  // ── Domestic score ──
  let domestic = 20; // base for being a healthcare professional
  if (data.hasFullRegistration) domestic += 20;
  else gaps.push({ area: "Registration", action: "Complete full registration with your regulatory body", impact: "+20 domestic" });
  if (data.hasPracticingLicense) domestic += 15;
  else gaps.push({ area: "Practicing License", action: "Obtain and renew your annual practicing license", impact: "+15 domestic" });
  if (data.yearsOfExperience >= 1) domestic += 5;
  if (data.yearsOfExperience >= 3) domestic += 5;
  if (data.yearsOfExperience >= 5) domestic += 5;
  if (data.yearsOfExperience >= 10) domestic += 5;
  if (data.postgraduateLevel === "MASTERS") domestic += 5;
  if (data.postgraduateLevel === "FELLOWSHIP") domestic += 10;
  if (data.postgraduateLevel === "DOCTORATE") domestic += 10;
  if (data.cpdPointsCurrent >= data.cpdPointsRequired && data.cpdPointsRequired > 0) domestic += 5;
  else if (data.cpdPointsRequired > 0) gaps.push({ area: "CPD Points", action: `You have ${data.cpdPointsCurrent} of ${data.cpdPointsRequired} required points`, impact: "+5 domestic" });
  if (data.additionalCerts.length >= 1) domestic += 5;
  if (data.additionalCerts.length >= 3) domestic += 5;
  domestic = Math.min(domestic, 100);

  // ── UK score ──
  let uk = 10;
  if (data.hasFullRegistration) uk += 10;
  if (data.hasPracticingLicense) uk += 5;
  if (data.hasCOGS) uk += 15;
  else gaps.push({ area: "Certificate of Good Standing", action: "Apply for COGS from your regulatory body (required for UK GMC/NMC)", impact: "+15 UK" });

  const ielts = parseFloat(data.ieltsScore);
  if (!isNaN(ielts)) {
    if (ielts >= 7.5) uk += 20;
    else if (ielts >= 7.0) uk += 15;
    else if (ielts >= 6.5) uk += 10;
    else uk += 5;
  } else if (!data.oetPassed) {
    gaps.push({ area: "English Language", action: "Take IELTS (target 7.5) or OET (target Grade B)", impact: "+20 UK" });
  }
  if (data.oetPassed) uk += 20;

  if (data.cadre === "MEDICINE" || data.cadre === "DENTISTRY") {
    if (data.plab1Passed) uk += 10;
    else gaps.push({ area: "PLAB 1", action: "Pass PLAB 1 exam (can be taken in Lagos/Abuja)", impact: "+10 UK" });
    if (data.plab2Passed) uk += 15;
    else if (data.plab1Passed) gaps.push({ area: "PLAB 2", action: "Pass PLAB 2 exam (must travel to Manchester)", impact: "+15 UK" });
  } else {
    // Non-doctor cadres: NMC/HCPC registration path
    if (data.yearsOfExperience >= 2) uk += 10;
    if (data.postgraduateLevel !== "NONE" && data.postgraduateLevel) uk += 10;
  }
  if (data.yearsOfExperience >= 3) uk += 5;
  uk = Math.min(uk, 100);

  // ── US score ──
  let us = 10;
  if (data.hasFullRegistration) us += 10;
  if (data.hasCOGS) us += 10;
  if (data.cadre === "MEDICINE") {
    if (data.usmlePassed === "STEP1") us += 15;
    else if (data.usmlePassed === "STEP2") us += 25;
    else if (data.usmlePassed === "STEP3") us += 35;
    else gaps.push({ area: "USMLE", action: "Begin USMLE Step 1 preparation", impact: "+15-35 US" });
  }
  if (!isNaN(ielts) && ielts >= 7.0) us += 10;
  if (data.yearsOfExperience >= 3) us += 5;
  if (data.postgraduateLevel === "FELLOWSHIP" || data.postgraduateLevel === "DOCTORATE") us += 10;
  if (data.additionalCerts.includes("ACLS")) us += 5;
  if (data.additionalCerts.includes("BLS")) us += 5;
  us = Math.min(us, 100);

  // ── Canada score ──
  let canada = 10;
  if (data.hasFullRegistration) canada += 10;
  if (data.hasCOGS) canada += 10;
  if (!isNaN(ielts) && ielts >= 7.0) canada += 15;
  if (data.yearsOfExperience >= 3) canada += 10;
  if (data.postgraduateLevel === "FELLOWSHIP" || data.postgraduateLevel === "DOCTORATE") canada += 10;
  if (data.cadre === "NURSING" && data.yearsOfExperience >= 2) canada += 10;
  canada = Math.min(canada, 100);

  // ── Gulf score ──
  let gulf = 15;
  if (data.hasFullRegistration) gulf += 15;
  if (data.hasPracticingLicense) gulf += 10;
  if (data.hasCOGS) gulf += 15;
  else if (!gaps.find(g => g.area === "Certificate of Good Standing"))
    gaps.push({ area: "Certificate of Good Standing", action: "Required for Gulf Dataflow verification", impact: "+15 Gulf" });
  if (data.yearsOfExperience >= 2) gulf += 10;
  if (data.yearsOfExperience >= 5) gulf += 5;
  if (data.postgraduateLevel !== "NONE" && data.postgraduateLevel) gulf += 10;
  if (!isNaN(ielts) && ielts >= 6.0) gulf += 10;
  if (data.additionalCerts.length >= 1) gulf += 5;
  gulf = Math.min(gulf, 100);

  return { domestic, uk, us, canada, gulf, gaps };
}

/* ─── from a member's profile ───────────────────────────────────────────── */

interface ProfileForReadiness {
  cadre: string;
  yearsOfExperience: number | null;
  credentials: { type: string; licenseNumber: string | null; verificationStatus: string; expiryDate: Date | null }[];
  qualifications: { type: string; name: string; score: string | null }[];
  cpdEntries: { points: unknown; dateCompleted: Date }[];
  /** The member's own answers from an earlier public quiz, if any. */
  lastAssessment?: {
    ieltsScore: unknown;
    oetPassed: boolean | null;
    plab1Passed: boolean | null;
    plab2Passed: boolean | null;
    usmlePassed: string | null;
    cpdPointsRequired: number | null;
    additionalCerts: string[];
  } | null;
}

const CERTS = ["BLS", "ACLS", "ATLS", "ALSO", "NRP", "PALS"];

/**
 * Builds quiz answers from what the member has recorded. Only facts on the
 * profile count; nothing is assumed.
 *
 * - Registration, licence, COGS: a credential of that type with a number that
 *   has not failed or expired (a licence past its expiry date does not count).
 * - Postgraduate level: FELLOWSHIP qualification -> FELLOWSHIP; a POSTGRADUATE
 *   one named PhD/doctorate -> DOCTORATE, named Masters/MSc/MPH/MBA -> MASTERS.
 * - Exams: INTERNATIONAL_EXAM qualifications by name (IELTS score, OET, PLAB 1,
 *   PLAB 2, USMLE Step n), falling back to the member's earlier quiz answers.
 * - CPD: points dated this calendar year; the requirement only comes from an
 *   earlier quiz answer, so without one CPD neither adds nor counts as a gap.
 * - Certificates: CERTIFICATION qualifications named BLS, ACLS etc., plus any
 *   from the earlier quiz.
 */
export function readinessInputsFromProfile(p: ProfileForReadiness): ReadinessInputs {
  const now = new Date();
  const holds = (type: string) =>
    p.credentials.some(
      (c) =>
        c.type === type &&
        !!c.licenseNumber &&
        c.verificationStatus !== "FAILED" &&
        c.verificationStatus !== "EXPIRED" &&
        (!c.expiryDate || c.expiryDate >= now)
    );

  const names = (type: string) => p.qualifications.filter((q) => q.type === type);
  const has = (type: string, re: RegExp) => names(type).some((q) => re.test(q.name));

  let postgraduateLevel = "NONE";
  if (has("POSTGRADUATE", /\b(masters?|m\.?sc|mph|mba|m\.?phil)\b/i)) postgraduateLevel = "MASTERS";
  if (p.qualifications.some((q) => q.type === "FELLOWSHIP")) postgraduateLevel = "FELLOWSHIP";
  if (has("POSTGRADUATE", /\b(ph\.?d|doctorate|dphil)\b/i)) postgraduateLevel = "DOCTORATE";

  const exams = names("INTERNATIONAL_EXAM");
  const ieltsQ = exams.find((q) => /ielts/i.test(q.name));
  const ielts = ieltsQ?.score && !isNaN(parseFloat(ieltsQ.score)) ? ieltsQ.score : p.lastAssessment?.ieltsScore != null ? String(p.lastAssessment.ieltsScore) : "";
  const examHas = (re: RegExp) => exams.some((q) => re.test(q.name));
  const usmleStep = Math.max(
    0,
    ...exams.map((q) => {
      const m = q.name.match(/usmle\s*step\s*([123])/i);
      return m ? Number(m[1]) : 0;
    })
  );
  const lastUsmle = p.lastAssessment?.usmlePassed;
  const usmlePassed = usmleStep ? `STEP${usmleStep}` : lastUsmle && lastUsmle !== "NONE" ? lastUsmle : "NONE";

  const year = now.getFullYear();
  const cpdPointsCurrent = p.cpdEntries
    .filter((e) => e.dateCompleted.getFullYear() === year)
    .reduce((sum, e) => sum + Number(e.points), 0);

  const certs = new Set<string>(p.lastAssessment?.additionalCerts ?? []);
  for (const q of names("CERTIFICATION")) {
    const hit = CERTS.find((c) => new RegExp(`\\b${c}\\b`, "i").test(q.name));
    if (hit) certs.add(hit);
  }

  return {
    cadre: p.cadre,
    yearsOfExperience: p.yearsOfExperience ?? 0,
    hasFullRegistration: holds("FULL_REGISTRATION"),
    hasPracticingLicense: holds("PRACTICING_LICENSE"),
    hasCOGS: holds("COGS"),
    postgraduateLevel,
    ieltsScore: ielts,
    oetPassed: examHas(/\boet\b/i) || !!p.lastAssessment?.oetPassed,
    plab1Passed: examHas(/plab\s*1/i) || examHas(/plab\s*2/i) || !!p.lastAssessment?.plab1Passed,
    plab2Passed: examHas(/plab\s*2/i) || !!p.lastAssessment?.plab2Passed,
    usmlePassed,
    cpdPointsCurrent,
    cpdPointsRequired: p.lastAssessment?.cpdPointsRequired ?? 0,
    additionalCerts: [...certs],
  };
}
