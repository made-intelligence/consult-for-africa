/**
 * What a mention can be about. The healthcare set follows the Press Ganey
 * outpatient scales (access, moving through the visit, the clinician, the
 * facility) because that is the language a hospital board already reads,
 * then each sector adds the things its own customers talk about.
 */

const HEALTHCARE = {
  booking_access: "Booking and access",
  wait_time: "Waiting time",
  staff_attitude: "Front desk and staff attitude",
  clinician: "Doctor or clinician",
  outcome: "Outcome and results",
  price_billing: "Price and billing",
  facility: "Facility and cleanliness",
  aftercare: "Follow-up and aftercare",
  privacy: "Privacy",
} as const;

const SECTORS: Record<string, Record<string, string>> = {
  healthcare: HEALTHCARE,
  aesthetics: {
    ...HEALTHCARE,
    natural_look: "Natural look",
    safety: "Safety and complications",
    recovery: "Recovery",
  },
  nutrition: {
    booking_access: HEALTHCARE.booking_access,
    staff_attitude: "Customer service",
    price_billing: HEALTHCARE.price_billing,
    taste: "Taste and quality of food",
    delivery: "Delivery and timeliness",
    dietitian: "Dietitian",
    health_results: "Health results",
    packaging: "Packaging",
  },
  network: {
    ...HEALTHCARE,
    earnings: "Earnings and payment",
    platform: "App and platform",
    onboarding: "Joining and onboarding",
  },
};

export const SECTOR_NAMES = Object.keys(SECTORS);

export function aspectsFor(sector: string): Record<string, string> {
  return SECTORS[sector] ?? HEALTHCARE;
}

export function aspectLabel(sector: string, key: string): string {
  return aspectsFor(sector)[key] ?? key.replace(/_/g, " ");
}
