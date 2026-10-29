/**
 * The AGELESS speaker content as JSON, for the Word document the chair edits.
 *
 * Deliberately drops every email address. The .docx goes out of our hands and
 * comes back by forward, which is exactly where speakers' personal addresses
 * should not be.
 *
 *   npx tsx scripts/dump-ageless-content.ts > /tmp/ageless.json
 */
import {
  LYFE_EVENT,
  LYFE_EVENT_PROGRAMME,
  LYFE_EVENT_ALLOCATION,
  LYFE_EVENT_ROOM,
  LYFE_EVENT_TONE,
} from "@/lib/lyfe";
import { LYFE_SPEAKERS } from "@/lib/lyfeSpeakers";

const out = {
  event: {
    theme: LYFE_EVENT.theme,
    proposition: LYFE_EVENT.proposition,
    standfirst: LYFE_EVENT.standfirst,
    panelTitle: LYFE_EVENT.panelTitle,
    panelStandfirst: LYFE_EVENT.panelStandfirst,
    date: LYFE_EVENT.date,
    arrival: LYFE_EVENT.arrival,
    programme: LYFE_EVENT.programme,
    close: LYFE_EVENT.close,
    venueName: LYFE_EVENT.venueName,
    rsvpBy: LYFE_EVENT.rsvpBy,
    places: LYFE_EVENT.places,
    host: LYFE_EVENT.host,
  },
  allocation: LYFE_EVENT_ALLOCATION,
  room: LYFE_EVENT_ROOM,
  tone: LYFE_EVENT_TONE,
  programme: LYFE_EVENT_PROGRAMME,
  speakers: LYFE_SPEAKERS.map((s) => ({
    name: s.name,
    org: s.org,
    slot: s.slot,
    subject: s.subject ?? null,
    focus: s.focus ?? null,
    bio: s.bio ?? null,
    questions: s.questions ?? [],
    outstanding: s.need,
  })),
};

process.stdout.write(JSON.stringify(out, null, 2));
