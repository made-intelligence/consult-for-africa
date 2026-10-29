import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { OpportunitySchema, hooksFor, messageFor, scoreFor, sizeFor, verifyMezoSignature, type Opportunity } from "../mezo/improvement-lead";

const base: Opportunity = {
  externalRef: "MZF-AB12CD",
  organizationName: "Harbour Day Surgery",
  organizationType: "DAY_SURGERY",
  city: "Lagos",
  state: "Lagos",
  zone: "Lekki to Ajah and Ibeju",
  contact: { name: "Ngozi Adeyemi", role: "Medical Director", email: "ngozi@example.ng", phone: "2348031234567" },
  size: { beds: 4, theatres: 1, consultingRooms: 3 },
  assessment: { qualityLevel: 2, percent: 58, pathway: "PARTLY_READY", readyNow: ["Level 1: Consultations"], blocked: ["Level 3: Day-case surgery"], zoneEnquiries90d: 14 },
  request: { requestedAt: null, support: null, areas: [], note: null },
  workstreams: [
    { id: "IPC", title: "Infection prevention and sterile services", serviceLine: "HOSPITAL_OPERATIONS", criticalGaps: ["Every autoclave cycle is logged"], gapCount: 3, unlocks: ["Level 3: Day-case surgery"], days: { PRINCIPAL: 0.5, SENIOR: 2, CONSULTANT: 7.5 } },
  ],
  totalDays: 10,
  serviceLines: ["HOSPITAL_OPERATIONS"],
  managed: { candidate: true, priority: "HIGH", reason: "1 theatre in an area with high need once its gaps are closed." },
  mezoUrl: "https://mezohealth.com/admin/network/intake/x/survey",
};

describe("the signature Mezo sends", () => {
  it("accepts the body Mezo signed and nothing else", () => {
    const body = JSON.stringify(base);
    const sig = createHmac("sha256", "s3cret").update(body).digest("hex");
    expect(verifyMezoSignature(body, sig, "s3cret")).toBe(true);
    expect(verifyMezoSignature(body + " ", sig, "s3cret")).toBe(false);
    expect(verifyMezoSignature(body, sig, "other")).toBe(false);
    expect(verifyMezoSignature(body, null, "s3cret")).toBe(false);
    expect(verifyMezoSignature(body, "zz", "s3cret")).toBe(false);
  });

  it("parses the shape Mezo sends", () => {
    expect(OpportunitySchema.safeParse(JSON.parse(JSON.stringify(base))).success).toBe(true);
  });
});

describe("the lead it becomes", () => {
  it("opens with the reference, so a resend finds the same lead", () => {
    expect(messageFor(base).startsWith("Mezo ref MZF-AB12CD\n")).toBe(true);
    expect(messageFor(base)).toContain("14 patient enquiries");
  });

  it("a managed prospect hooks to managed operations first", () => {
    expect(hooksFor(base)[0]).toBe("Managed Hospital Operations");
    expect(hooksFor({ ...base, managed: { ...base.managed, candidate: false } })).toEqual(["Hospital Operations"]);
  });

  it("an owner asking for help is hot; a managed prospect who has not answered is warm", () => {
    expect(scoreFor({ ...base, request: { ...base.request, support: "MANAGED" } })).toBe("HOT");
    expect(scoreFor({ ...base, request: { ...base.request, support: "SUPPORTED" } })).toBe("HOT");
    expect(scoreFor(base)).toBe("WARM");
    expect(scoreFor({ ...base, managed: { ...base.managed, candidate: false } })).toBe("COLD");
  });

  it("sizes by beds and theatres", () => {
    expect(sizeFor(base)).toBe("SMALL");
    expect(sizeFor({ ...base, size: { beds: 50, theatres: 3, consultingRooms: 10 } })).toBe("LARGE");
  });
});
