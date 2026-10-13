/**
 * The speaker cards' content, out of the panel seats, so a card cannot
 * disagree with the stage.
 */
import { LYFE_EVENT, LYFE_PANEL } from "@/lib/lyfe";

const slug = (n: string) =>
  n.toLowerCase().replace(/,.*$/, "").replace(/^(dr|prof)\s+/, "")
    .trim().split(/\s+/).pop()!.replace(/[^a-z]/g, "");

/** Third person, because they are sharing it rather than saying it. */
const ROLE: Record<string, string> = {
  "The opening address": "Opening address",
  "In the chair": "In the chair",
  "The panel": "On the panel",
};

process.stdout.write(
  JSON.stringify(
    {
      event: {
        theme: LYFE_EVENT.theme,
        proposition: LYFE_EVENT.proposition,
        date: LYFE_EVENT.date.replace(/^\w+, /, (m) => m),
        venue: LYFE_EVENT.venueName,
        shown: "consultforafrica.com/ageless",
        host: LYFE_EVENT.host,
      },
      speakers: LYFE_PANEL.filter((s) => s.name && s.portrait).map((s) => ({
        slug: slug(s.name!),
        name: s.name!.replace(/, MD FACS$/, ""),
        org: s.title!,
        role: ROLE[s.seat] ?? s.seat,
        subject: s.subject,
        portrait: s.portrait!,
      })),
    },
    null,
    2,
  ),
);
