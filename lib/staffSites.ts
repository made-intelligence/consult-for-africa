/**
 * One staff system, several practices.
 *
 * Haven was built first and its name was written into the sign-in, the emails
 * and the pages. Everything a second practice needs to differ on lives here, so
 * the code underneath stays one copy: the client it belongs to, what it is
 * called, where its pages live, its own sign-in cookie and its colours.
 *
 * Each site has its own cookie. A person signed in at one practice is signed
 * out at the other, and a session minted for one client can never be read as
 * the other's, whatever the URL.
 */

import type { CSSProperties } from "react";

export type SiteSlug = "haven" | "arabella";

export interface SitePalette {
  /** Headings, primary buttons. */
  ink: string;
  /** Header band. */
  deep: string;
  /** The small rule and eyebrows. */
  accent: string;
  /** Links and secondary marks. */
  second: string;
  /** Small label text on the header band. */
  headLabel: string;
  /** Body text on the header band. */
  headBody: string;
  /** Your own row in a table. */
  highlight: string;
}

export interface StaffSite {
  slug: SiteSlug;
  /** Fixed where we know it. Haven is still found by name, as it always was. */
  clientId: string | null;
  clientName: string;
  /** What staff call the place in a sentence: "the Haven staff page". */
  shortName: string;
  /** "hospital" or "practice", for copy such as "the email you gave the practice". */
  placeWord: string;
  pathPrefix: string;
  apiPrefix: string;
  cookie: string;
  palette: SitePalette;
}

export const HAVEN: StaffSite = {
  slug: "haven",
  clientId: null,
  clientName: "Haven Paediatric Centre",
  shortName: "Haven",
  placeWord: "hospital",
  pathPrefix: "/HavenStaff",
  apiPrefix: "/api/haven-staff",
  cookie: "haven_staff_session",
  palette: {
    ink: "#0B3C5D",
    deep: "#081521",
    accent: "#D4AF37",
    second: "#1F7A8C",
    headLabel: "#9FC6D1",
    headBody: "#B9CBD8",
    highlight: "#FFF8E1",
  },
};

/**
 * Arabella Women's Health, Asokoro. No brand colours were on file, so a calm
 * plum and sage, deliberately unlike Haven's navy and gold so nobody who works
 * across both mistakes one for the other.
 */
export const ARABELLA: StaffSite = {
  slug: "arabella",
  clientId: "cmumq56xd0000spxkzhxg6xcp",
  clientName: "Arabella Women's Health",
  shortName: "Arabella",
  placeWord: "practice",
  pathPrefix: "/ArabellaStaff",
  apiPrefix: "/api/arabella-staff",
  cookie: "arabella_staff_session",
  palette: {
    ink: "#4A2C4F",
    deep: "#2A1830",
    accent: "#D9A6A0",
    second: "#4F7F73",
    headLabel: "#D8C3DC",
    headBody: "#CDBBD0",
    highlight: "#F6EEF3",
  },
};

export const STAFF_SITES: Record<SiteSlug, StaffSite> = { haven: HAVEN, arabella: ARABELLA };

/**
 * The palette as CSS variables, for the shared staff components. They read
 * var(--staff-ink, <Haven navy>) and so on, which means a Haven page that sets
 * nothing renders exactly as before.
 */
export function paletteVars(site: StaffSite): CSSProperties {
  const p = site.palette;
  return {
    ["--staff-ink" as string]: p.ink,
    ["--staff-deep" as string]: p.deep,
    ["--staff-accent" as string]: p.accent,
    ["--staff-second" as string]: p.second,
    ["--staff-head-label" as string]: p.headLabel,
    ["--staff-head-body" as string]: p.headBody,
    ["--staff-highlight" as string]: p.highlight,
  } as CSSProperties;
}

/** The serialisable part, for client components. */
export interface SiteBrand {
  slug: SiteSlug;
  clientName: string;
  shortName: string;
  placeWord: string;
  pathPrefix: string;
  apiPrefix: string;
  palette: SitePalette;
}

export function brandOf(site: StaffSite): SiteBrand {
  const { slug, clientName, shortName, placeWord, pathPrefix, apiPrefix, palette } = site;
  return { slug, clientName, shortName, placeWord, pathPrefix, apiPrefix, palette };
}
