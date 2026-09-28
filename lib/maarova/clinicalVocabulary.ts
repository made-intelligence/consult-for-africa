/**
 * Does a piece of assessment text assume the reader practises clinically?
 *
 * Shared by the tagger, which decides which existing items need a twin, and by
 * the twin seeder, which uses it in reverse: a non-clinical twin that still
 * trips this check has not actually been rewritten.
 *
 * Word boundaries are not optional. Without them "icu" matches inside
 * "difficult", "ward" inside "rewarded" and "shift" inside "policy shifts".
 * Tagging a role neutral item as clinical is not cosmetic: a clinical tag
 * withholds the item from non-clinical takers entirely.
 */

/**
 * "shift" is deliberately absent. A night shift is clinical and a policy shift
 * is not, and the word cannot tell them apart. Scenarios that need it say
 * "on-call" or name the setting.
 */
export const CLINICAL_TOKENS = [
  "patient", "patients", "clinical", "clinically", "clinician", "clinicians",
  "ward", "wards", "nurse", "nurses", "nursing", "doctor", "doctors",
  "physician", "physicians", "consultant", "consultants", "registrar",
  "registrars", "theatre", "surgery", "surgical", "rounds", "bedside",
  "triage", "medication", "medications", "mortality", "morbidity", "scrub",
  "handover", "on-call", "A&E", "ICU", "NICU", "outpatient", "inpatient",
  "medicine", "medical", "resuscitation", "vital signs", "care team",
  "duty of care", "multi-disciplinary", "grand round", "grand rounds",
  "ambulance", "ward round", "ward rounds", "matron", "midwife", "midwives",
];

const ESCAPED = CLINICAL_TOKENS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

/** Also catches diagnose/diagnosis/diagnostic and prescribe/prescription. */
export const CLINICAL_PATTERN = new RegExp(
  `(?:^|[^A-Za-z])(?:${ESCAPED.join("|")}|diagnos[a-z]*|prescrib[a-z]*|prescription[s]?)(?![A-Za-z])`,
  "i"
);

export function readsClinically(text: string): boolean {
  return CLINICAL_PATTERN.test(text);
}

/** Every clinical token present, for reporting why something was flagged. */
export function clinicalTokensIn(text: string): string[] {
  const found = new Set<string>();
  for (const t of CLINICAL_TOKENS) {
    const rx = new RegExp(
      `(?:^|[^A-Za-z])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z])`,
      "i"
    );
    if (rx.test(text)) found.add(t.toLowerCase());
  }
  for (const rx of [/diagnos[a-z]*/i, /prescrib[a-z]*/i, /prescription[s]?/i]) {
    const m = text.match(rx);
    if (m) found.add(m[0].toLowerCase());
  }
  return [...found];
}

/**
 * An item whose stem or options read clinically. Options matter as much as the
 * stem: a DISC stem can be perfectly neutral while all four of its choices talk
 * about resuscitation protocols and vital signs.
 */
export function itemReadsClinically(text: string, options: unknown): boolean {
  if (readsClinically(text)) return true;
  if (Array.isArray(options)) {
    for (const o of options) {
      const label = (o as { label?: string })?.label;
      if (typeof label === "string" && readsClinically(label)) return true;
    }
  }
  return false;
}
