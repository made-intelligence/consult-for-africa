import { z } from "zod";

// One brand's settings, shared by create and update. Handles are stored without the @.

const list = z.array(z.string().trim().min(1).max(200)).max(30);
const handle = z.string().trim().max(100).nullable().optional().transform((h) => (h ? h.replace(/^@/, "").replace(/^https?:\/\/(www\.)?[^/]+\//, "").replace(/\/$/, "") : null));
const text = z.string().trim().max(300).nullable().optional().transform((v) => v || null);

export const entityBody = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(["OWN", "COMPETITOR"]).optional(),
  keywords: list.optional(),
  excludes: list.optional(),
  googlePlaceId: text,
  googleCid: text,
  instagramHandle: handle,
  tiktokHandle: handle,
  xHandle: handle,
  facebookPage: text,
  youtubeChannel: text,
  website: text,
  awarioAlertId: text,
  trackedUrls: z.array(z.string().trim().url().max(500)).max(10).optional(),
  active: z.boolean().optional(),
});

export type EntityBody = z.infer<typeof entityBody>;

/** Only the fields that were sent, so a partial update leaves the rest alone. */
export function entityData(d: EntityBody) {
  return Object.fromEntries(Object.entries(d).filter(([k, v]) => k !== "name" && v !== undefined)) as Omit<EntityBody, "name">;
}
