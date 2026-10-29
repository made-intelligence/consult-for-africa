import { describe, it, expect } from "vitest";
import { LAGOS_CENTRES } from "../cadreHealth/internship/programme";
import {
  PRESETS,
  greetingFor,
  matchCentre,
  parseContacts,
  renderText,
  toHtml,
  unknownFields,
  type OutreachVars,
} from "../cadreHealth/internship/outreach";

const centres = LAGOS_CENTRES.map((c, i) => ({ id: String(i), name: c.name }));
const byName = (typed: string) => matchCentre(typed, centres)?.name ?? null;

const vars: OutreachVars = {
  greeting: "Dear Matron Adeyemi",
  centreName: "Reddington Hospital",
  choices: "14",
  applicants: "212",
  centres: "31",
  intake: "2027 intake",
  centresPage: "https://consultforafrica.com/oncadre/internships/centres",
  senderName: "Favour Aina",
  senderRole: "Programme lead",
};

describe("renderText", () => {
  it("fills every merge field in every preset", () => {
    for (const p of PRESETS) {
      expect(renderText(p.subject, vars)).not.toMatch(/\{\{/);
      expect(renderText(p.body, vars)).not.toMatch(/\{\{/);
      expect(unknownFields(p.subject + p.body)).toEqual([]);
    }
  });

  it("leaves a mistyped field visible rather than blanking it", () => {
    expect(renderText("Hello {{centrename}}", vars)).toBe("Hello {{centrename}}");
    expect(unknownFields("{{centrename}} {{greeting}} {{centrename}}")).toEqual(["centrename"]);
  });

  it("puts the number in the demand subject", () => {
    const demand = PRESETS.find((p) => p.key === "demand")!;
    expect(renderText(demand.subject, vars)).toBe("14 BNSc graduates have chosen Reddington Hospital for their internship");
    expect(demand.needsChoices).toBe(true);
  });

  it("uses no em dash in any preset", () => {
    for (const p of PRESETS) expect(p.subject + p.body).not.toContain("—");
  });
});

describe("greetingFor", () => {
  it("falls back to the role when there is no name", () => {
    expect(greetingFor("Matron Adeyemi")).toBe("Dear Matron Adeyemi");
    expect(greetingFor("  ")).toBe("Dear Head of Nursing");
    expect(greetingFor(null)).toBe("Dear Head of Nursing");
  });
});

describe("toHtml", () => {
  it("escapes, keeps paragraphs and line breaks, and links URLs", () => {
    const html = toHtml("Dear <b>you</b>,\n\nLine one\nLine two https://x.com/a");
    expect(html).toContain("&lt;b&gt;you&lt;/b&gt;");
    expect(html.match(/<p /g)).toHaveLength(2);
    expect(html).toContain("Line one<br/>Line two");
    expect(html).toContain('<a href="https://x.com/a"');
  });
});

describe("parseContacts", () => {
  it("reads a tab paste with a header in any column order", () => {
    const rows = parseContacts("Email\tHospital\tName\tRole\tPhone\nMATRON@EKO.NG\tThe Eko Hospital\tMrs Bello\tCNO\t0803");
    expect(rows).toEqual([{ centre: "The Eko Hospital", contactName: "Mrs Bello", contactRole: "CNO", contactEmail: "matron@eko.ng", contactPhone: "0803" }]);
  });

  it("reads comma rows without a header, with quoted commas", () => {
    const rows = parseContacts('"St Nicholas Hospital, Lagos Island",Dr Ade,Head of Nursing,ade@stnicholas.ng,');
    expect(rows[0].centre).toBe("St Nicholas Hospital, Lagos Island");
    expect(rows[0].contactEmail).toBe("ade@stnicholas.ng");
  });

  it("finds an email typed in the wrong column and drops rows with no centre", () => {
    const rows = parseContacts("Motayo,nurse@motayo.ng\n,orphan@x.ng");
    expect(rows).toHaveLength(1);
    expect(rows[0].contactEmail).toBe("nurse@motayo.ng");
  });
});

describe("matchCentre", () => {
  it("matches short and differently-cased names", () => {
    expect(byName("Eko Hospital")).toBe("The Eko Hospital");
    expect(byName("REDDINGTON")).toBe("Reddington Hospital");
    expect(byName("LUTH Lagos University Teaching Hospital")).toBe("Lagos University Teaching Hospital");
    expect(byName("Igbobi National Orthopaedic")).toBe("National Orthopaedic Hospital, Igbobi");
    expect(byName("Ave Maria")).toBe("Ave Maria Hospital (Headquarters)");
  });

  it("refuses a guess when the name is unclear", () => {
    expect(byName("General Hospital")).toBeNull();
    expect(byName("General Hospital Ikeja")).toBeNull(); // not Odan
    expect(byName("Maria")).toBeNull(); // Ave Maria or Anna Maria
    expect(byName("Somewhere Clinic")).toBeNull();
  });
});
