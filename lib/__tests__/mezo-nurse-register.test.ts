import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  NurseRegistrationSchema,
  allowedSubSpecialty,
  planNurseRegistration,
  type ExistingProfessional,
} from "@/lib/mezo/nurse-register";
import { verifyMezoSignature } from "@/lib/mezo/improvement-lead";

const input = NurseRegistrationSchema.parse({
  mezoRef: "doc_1",
  email: "Ada.Nurse@Example.com",
  firstName: "Ada",
  lastName: "Okafor",
  phone: "08031234567",
  cadre: "NURSING",
  subSpecialty: "ICU / Critical Care Nursing",
  state: "Enugu",
  city: "Enugu",
  openTo: ["PERMANENT", "LOCUM"],
  source: "east-plug",
});

const blank: ExistingProfessional = {
  id: "cp_1",
  passwordHash: null,
  passwordResetToken: null,
  passwordResetExpiry: null,
  phone: null,
  state: null,
  city: null,
  subSpecialty: null,
  openTo: [],
};

const NOW = new Date("2026-11-13T10:00:00Z");
const token = () => "new-token";

describe("Mezo nurse registration", () => {
  it("normalises the email so one person is one profile", () => {
    expect(input.email).toBe("ada.nurse@example.com");
  });

  it("creates a profile when the email is new", () => {
    expect(planNurseRegistration(null, input, NOW, token)).toEqual({ kind: "CREATE", token: "new-token" });
  });

  it("never touches a profile that already has a password", () => {
    expect(planNurseRegistration({ ...blank, passwordHash: "salt:hash" }, input, NOW, token)).toEqual({ kind: "EXISTING" });
  });

  it("invites a passwordless profile, filling only blanks", () => {
    const plan = planNurseRegistration({ ...blank, state: "Lagos", openTo: ["CONSULTING"] }, input, NOW, token);
    expect(plan).toEqual({
      kind: "INVITE",
      token: "new-token",
      fill: { phone: "08031234567", city: "Enugu", subSpecialty: "ICU / Critical Care Nursing" },
    });
  });

  it("keeps an unexpired link so an earlier email still works", () => {
    const live = { ...blank, passwordResetToken: "old", passwordResetExpiry: new Date("2026-11-20T00:00:00Z") };
    expect(planNurseRegistration(live, input, NOW, token)).toMatchObject({ kind: "INVITE", token: "old" });
  });

  it("replaces an expired link", () => {
    const stale = { ...blank, passwordResetToken: "old", passwordResetExpiry: new Date("2026-11-01T00:00:00Z") };
    expect(planNurseRegistration(stale, input, NOW, token)).toMatchObject({ kind: "INVITE", token: "new-token" });
  });

  it("accepts only sub-specialties from the cadre's own catalogue", () => {
    expect(allowedSubSpecialty("NURSING", "ICU / Critical Care Nursing")).toBe("ICU / Critical Care Nursing");
    expect(allowedSubSpecialty("NURSING", "Community Midwifery")).toBeNull();
    expect(allowedSubSpecialty("MIDWIFERY", "Community Midwifery")).toBe("Community Midwifery");
    expect(allowedSubSpecialty("NURSING", undefined)).toBeNull();
  });

  it("rejects a cadre other than nursing or midwifery", () => {
    expect(NurseRegistrationSchema.safeParse({ ...input, cadre: "MEDICINE" }).success).toBe(false);
  });

  // Mezo signs in server/services/nurse-join.ts. If either side changes the
  // algorithm, this is where it shows.
  it("verifies the signature the way Mezo signs it", () => {
    const secret = "shared";
    const body = JSON.stringify(input);
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyMezoSignature(body, signature, secret)).toBe(true);
    expect(verifyMezoSignature(body + " ", signature, secret)).toBe(false);
  });
});
