import { describe, it, expect } from "vitest";
import type { WatchEntity } from "@prisma/client";
import { matchEntity, termsFor, orQuery } from "@/lib/market-watch/match";
import { pageDiff } from "@/lib/market-watch/sources/website";
import { netSentiment } from "@/lib/market-watch/compose";
import { aspectsFor } from "@/lib/market-watch/taxonomy";

function entity(p: Partial<WatchEntity> & { id: string; name: string }): WatchEntity {
  return {
    watchId: "w", role: "COMPETITOR", keywords: [], excludes: [], googlePlaceId: null, googleCid: null,
    instagramHandle: null, tiktokHandle: null, xHandle: null, facebookPage: null, youtubeChannel: null,
    website: null, awarioAlertId: null, trackedUrls: [], active: true, createdAt: new Date(), updatedAt: new Date(),
    ...p,
  };
}

describe("matchEntity", () => {
  const haven = entity({ id: "h", name: "Haven", keywords: ["Haven Paediatric"], excludes: ["safe haven"] });
  const medlyfe = entity({ id: "m", name: "Medlyfe", instagramHandle: "medlyfe.ng" });

  it("matches whole words only", () => {
    expect(matchEntity("Havens of rest", [haven])).toBeNull();
    expect(matchEntity("Took my son to Haven yesterday", [haven])?.id).toBe("h");
  });

  it("lets an exclude veto the brand", () => {
    expect(matchEntity("Lagos is a safe haven for investors", [haven])).toBeNull();
  });

  it("matches handles with the @", () => {
    expect(matchEntity("shoutout @medlyfe.ng for the glow", [medlyfe])?.id).toBe("m");
  });

  it("is case-insensitive and picks the brand named first", () => {
    expect(matchEntity("MEDLYFE or haven? medlyfe for me", [haven, medlyfe])?.id).toBe("m");
  });

  it("skips inactive brands", () => {
    expect(matchEntity("Haven", [{ ...haven, active: false }])).toBeNull();
  });
});

describe("termsFor and orQuery", () => {
  it("dedupes and quotes multi-word terms", () => {
    const e = entity({ id: "x", name: "Cooked Indoors", keywords: ["Cooked Indoors", "cookedindoors"], xHandle: "@cookedindoors" });
    expect(termsFor(e)).toEqual(["Cooked Indoors", "cookedindoors", "@cookedindoors"]);
    expect(orQuery(["Cooked Indoors", "cookedindoors"])).toBe('"Cooked Indoors" OR cookedindoors');
  });
});

describe("pageDiff", () => {
  it("reports added and removed sentences", () => {
    const d = pageDiff("Botox from N150,000. Fillers from N250,000.", "Botox from N180,000. Fillers from N250,000. Body contouring from N1,200,000.");
    expect(d.added).toEqual(["Botox from N180,000.", "Body contouring from N1,200,000."]);
    expect(d.removed).toEqual(["Botox from N150,000."]);
  });
});

describe("netSentiment", () => {
  it("is positive minus negative over both, neutrals ignored", () => {
    const rows = [{ sentiment: "POSITIVE" }, { sentiment: "POSITIVE" }, { sentiment: "POSITIVE" }, { sentiment: "NEGATIVE" }, { sentiment: "NEUTRAL" }];
    expect(netSentiment(rows)).toBe(50);
  });
  it("is null with nothing to go on", () => {
    expect(netSentiment([{ sentiment: "NEUTRAL" }])).toBeNull();
  });
});

describe("taxonomy", () => {
  it("adds sector aspects to the healthcare base", () => {
    expect(Object.keys(aspectsFor("aesthetics"))).toContain("natural_look");
    expect(Object.keys(aspectsFor("aesthetics"))).toContain("wait_time");
    expect(Object.keys(aspectsFor("nutrition"))).toContain("delivery");
    expect(aspectsFor("unknown")).toBe(aspectsFor("healthcare"));
  });
});
