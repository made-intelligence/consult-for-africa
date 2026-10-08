import { notifyInternal } from "@/lib/email";
import {
  BASED_LABELS,
  CONCERN_LABELS,
  FORMAT_LABELS,
  LYFE_BRAND,
  LYFE_CONSULT,
  LYFE_CONTACT_EMAIL,
  LYFE_EVENT,
  LYFE_EVENT_TAKEAWAY,
  LYFE_EVENT_THEME,
  lyfeConfirmUrl,
  LYFE_NAME,
  LYFE_SURGEON,
  MEDLYFE_BRAND,
  MEDLYFE_NAME,
  LYFE_PHONE_DISPLAY,
  NICOTINE_LABELS,
  PATHWAY_LABELS,
  SOURCE_LABELS,
  TIMING_LABELS,
  WEIGHT_TREND_LABELS,
} from "@/lib/lyfe";

/**
 * Lyfe email. Its own letterhead rather than the Consult for Africa shell,
 * because the person receiving it is enquiring about her own face and has no
 * reason to have heard of her clinic's management consultant.
 *
 * Transport is the shared one in lib/email.ts, which inherits the
 * ZeptoMail-first path and SMTP_FROM as the sender of record.
 */

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The evening is purely Medlyfe's from 8 October 2026, so everything about it
 * goes out on Medlyfe's letterhead. Consultation mail stays on Lyfe's.
 */
type Letterhead = "lyfe" | "medlyfe";

/** Why an Ageless mail arrived. The clinic default is wrong for both. */
const INVITED_FOOTER =
  "You are receiving this because you were invited to Ageless, hosted by Medlyfe. Reply at any time and we will remove your details.";
const SPEAKER_FOOTER =
  "You are receiving this because you are speaking at Ageless, hosted by Medlyfe.";

function masthead(brand: Letterhead): string {
  if (brand === "medlyfe") {
    return `<tr><td style="background:${MEDLYFE_BRAND.green};padding:26px 32px;">
          <div style="color:#ffffff;font-size:23px;line-height:1.1;"><span style="font-family:Georgia,serif;">med</span><span style="font-weight:800;letter-spacing:-0.02em;">LYFE</span></div>
          <div style="color:${MEDLYFE_BRAND.lime};font-weight:700;font-size:9px;letter-spacing:0.16em;margin-top:8px;">WELLNESS AND LONGEVITY CENTRE</div>
        </td></tr>
        <tr><td style="height:3px;background:${MEDLYFE_BRAND.lime};"></td></tr>`;
  }
  // Clinic correspondence. Same name as the evening, because there is only one
  // entity, carrying the bronze rule so it matches the consultation page a
  // reader has just come from.
  return `<tr><td style="background:${LYFE_BRAND.ink};padding:26px 32px;">
          <div style="color:#ffffff;font-size:23px;line-height:1.1;"><span style="font-family:Georgia,serif;">med</span><span style="font-weight:800;letter-spacing:-0.02em;">LYFE</span></div>
          <div style="color:${LYFE_BRAND.bronze};font-weight:700;font-size:9px;letter-spacing:0.16em;margin-top:8px;">WELLNESS AND LONGEVITY CENTRE</div>
        </td></tr>
        <tr><td style="height:3px;background:${LYFE_BRAND.bronze};"></td></tr>`;
}

/**
 * AGELESS is Medlyfe's evening, so everything about it goes out on Medlyfe's
 * letterhead. The default here is the clinic, because most of what this file
 * sends is clinic correspondence, and an event mail that forgets to say
 * otherwise reaches a panellist branded as a plastic surgery practice.
 */
function layout(
  content: string,
  preheader: string,
  brand: Letterhead = "lyfe",
  footerNote = "You are receiving this because you made an enquiry. Reply at any time and we will remove your details.",
): string {
  const name = brand === "medlyfe" ? MEDLYFE_NAME : LYFE_NAME;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)}</title></head>
<body style="margin:0;padding:0;background:${LYFE_BRAND.groundWarm};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;border:1px solid ${LYFE_BRAND.line};overflow:hidden;">
        ${masthead(brand)}
        <tr><td style="padding:32px;color:${LYFE_BRAND.ink};font-size:15px;line-height:1.65;">${content}</td></tr>
        <tr><td style="padding:18px 32px;background:${LYFE_BRAND.ground};border-top:1px solid ${LYFE_BRAND.line};color:${LYFE_BRAND.muted};font-size:11px;line-height:1.6;">
          ${esc(name)} &middot; Lagos, Nigeria &middot; ${esc(LYFE_PHONE_DISPLAY)}<br>
          ${esc(footerNote)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

type PathwayKey = keyof typeof PATHWAY_LABELS;

type Intent = "EVENT_RSVP" | "CONSULTATION" | "DISCOVERY_CALL" | "FACILITY_VISIT";

export interface LyfeConfirmationInput {
  to: string;
  firstName: string;
  intent: Intent;
  surgical: boolean;
  guestCount: number | null;
  slotAt?: Date | null;
}

/** "Tuesday 13 October, 11:00 WAT", from an instant, in Lagos time. */
export function slotLabel(slotAt: Date): string {
  const lagos = new Date(slotAt.getTime() + 3600_000);
  const day = lagos.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  });
  const hh = String(lagos.getUTCHours()).padStart(2, "0");
  const mm = String(lagos.getUTCMinutes()).padStart(2, "0");
  return `${day}, ${hh}:${mm} WAT`;
}

/**
 * The confirmation does one job: tell her exactly what happens next and when,
 * because the single most common thing the March leads said afterwards was
 * that they never heard anything. It promises a call today, which is a promise
 * the coordinator's queue has to be staffed to keep.
 */
export async function emailLyfeConfirmation({
  to,
  firstName,
  intent,
  surgical,
  guestCount,
  slotAt,
}: LyfeConfirmationInput): Promise<void> {
  // A request, not a booking. The page stopped taking money at the door, so
  // saying "booked" or "paid" here would both be wrong. What is true is that
  // somebody will ring, and the one number that killed the March campaign was
  // how long that took, so this commits to a day and the queue has to keep it.
  if (intent === "CONSULTATION") {
    const when = slotAt ? slotLabel(slotAt) : null;
    const html = layout(
      `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
       <p style="margin:0 0 14px;">Thank you. We have your request for a consultation at ${esc(MEDLYFE_NAME)}${when ? `, for <strong>${esc(when)}</strong>` : ""}.</p>
       <table cellpadding="0" cellspacing="0" style="margin:22px 0;width:100%;">
         <tr><td style="background:${LYFE_BRAND.greenTint};border-left:3px solid ${LYFE_BRAND.green};padding:16px 18px;font-size:14px;line-height:1.7;color:${LYFE_BRAND.ink};">
           <strong>A coordinator will call you within one working day.</strong>
           They will confirm which consultation is the right one, arrange the
           time, and tell you what it costs before anything is booked.
           <br><br>
           Nothing has been charged.
         </td></tr>
       </table>
       <p style="margin:0 0 14px;">If you asked for half an hour with ${esc(LYFE_SURGEON.name)}, that one is ${esc(LYFE_CONSULT.feeDisplay)} and her diary is ${esc(LYFE_CONSULT.dayNames.toLowerCase())}, ${esc(LYFE_CONSULT.hoursDisplay)}, so there are only ${LYFE_CONSULT.perWeek} of them in a week. ${esc(LYFE_CONSULT.feeNote)}</p>
       <p style="margin:0 0 14px;">Before the call, it helps to have thought about one thing: what it is you would like to be different. You do not need photographs and you do not need to have decided anything.</p>
       <p style="margin:0 0 6px;">With kind regards,</p>
       <p style="margin:0;font-weight:600;">The team at ${esc(LYFE_NAME)}</p>`,
      `We have your request. A coordinator will call you within one working day.`,
    );
    await notifyInternal(to, `We have your request, ${esc(firstName)}`, html);
    return;
  }

  // Interest, not a place. Seventy seats and an open form means most of the
  // people who fill it in cannot be told yes, and the kind thing is to be
  // straight about that in the first sentence rather than in the third email.
  if (intent === "EVENT_RSVP") {
    const plusOne = guestCount && guestCount > 0
      ? `<p style="margin:0 0 14px;">You have asked to bring ${guestCount === 1 ? "one guest" : `${guestCount} guests`}, and that is noted against your name.</p>`
      : "";

    const html = layout(
      `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
       <p style="margin:0 0 14px;">Thank you for your interest in ${esc(LYFE_EVENT_THEME)}, the evening hosted by ${esc(LYFE_EVENT.host)}.</p>
       ${plusOne}
       <table cellpadding="0" cellspacing="0" style="margin:22px 0;width:100%;">
         <tr><td style="background:${MEDLYFE_BRAND.green};padding:20px 22px;font-size:14px;line-height:1.8;color:#FFFFFF;">
           <strong style="font-size:17px;">${esc(LYFE_EVENT.tagline)}</strong><br>
           <span style="color:${MEDLYFE_BRAND.limeSoft};">${esc(LYFE_EVENT.standfirst)}</span>
           <br><br>
           <strong>${esc(LYFE_EVENT.date)}</strong><br>
           Arrival ${esc(LYFE_EVENT.arrival)} &middot; Programme ${esc(LYFE_EVENT.programme)} &middot; Close ${esc(LYFE_EVENT.close)}<br>
           ${esc(LYFE_EVENT.venueAddress ? LYFE_EVENT.venueName + ", " + LYFE_EVENT.venueAddress : LYFE_EVENT.venueName)}
         </td></tr>
       </table>
       <p style="margin:0 0 14px;">The room holds ${LYFE_EVENT.places}, which is fewer than the number of people who would like to be in it. Invitations go out from this list, and you will hear from us either way. If you are invited, the note will carry a link of your own to confirm your place.</p>
       <p style="margin:0 0 14px;">If you would rather not wait, you can ask for a conversation with the clinical team at any time. Reply to this note and we will arrange it.</p>
       <p style="margin:0 0 6px;">With kind regards,</p>
       <p style="margin:0;font-weight:600;">The team at ${esc(MEDLYFE_NAME)}</p>`,
      `Your interest in ${LYFE_EVENT_THEME} is registered.`,
      "medlyfe",
      INVITED_FOOTER,
    );
    await notifyInternal(to, `Thank you for your interest, ${esc(firstName)}`, html);
    return;
  }

  const next = surgical
    ? `<p style="margin:0 0 14px;">A coordinator will call you to understand what you are considering and to explain how a surgical planning review works. If you go ahead with one, you send your history, your goals and a set of photographs, one of the clinic&rsquo;s registered clinicians reviews it with Dr Kpaduwa, and you get a written view inside five working days.</p>
       <p style="margin:0 0 14px;">That view is an honest one. It sometimes says that surgery is not the right answer, or not the right answer yet. We would rather tell you that now than after you have paid for it.</p>`
    : `<p style="margin:0 0 14px;">A coordinator will call you to listen to what you are thinking about, tell you honestly whether we are the right place for it, and explain what a consultation would involve and what it would cost. It is fifteen minutes, it is free, and nothing is booked on it.</p>
       <p style="margin:0 0 14px;">If you ask something clinical we will not guess at it. We write it down and put it to a clinician.</p>`;

  const html = layout(
    `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
     <p style="margin:0 0 14px;">Thank you for getting in touch. This is a note to confirm we have your details, and to tell you what happens next, so you are not left wondering.</p>
     ${next}
     <table cellpadding="0" cellspacing="0" style="margin:22px 0;width:100%;">
       <tr><td style="background:${LYFE_BRAND.greenTint};border-left:3px solid ${LYFE_BRAND.green};padding:16px 18px;font-size:14px;line-height:1.6;color:${LYFE_BRAND.ink};">
         Nobody on the telephone here gives clinical advice, decides whether a procedure suits you, or promises you a result. That is a rule, and it is the reason to trust the rest of what we say.
       </td></tr>
     </table>
     <p style="margin:0 0 6px;">With kind regards,</p>
     <p style="margin:0;font-weight:600;">The team at ${esc(LYFE_NAME)}</p>`,
    "We have your details. A coordinator calls you shortly.",
  );

  await notifyInternal(to, `Your discovery call, ${esc(firstName)}`, html);
}

export interface LyfeInternalInput {
  to: string | string[];
  slotAt?: Date | null;
  id: string;
  fullName: string;
  email: string;
  phone: string;
  intent: Intent;
  guestCount: number | null;
  isClinician: boolean | null;
  pathway: PathwayKey;
  concerns: (keyof typeof CONCERN_LABELS)[];
  timing: keyof typeof TIMING_LABELS | null;
  based: keyof typeof BASED_LABELS;
  travelFrom: string | null;
  format: keyof typeof FORMAT_LABELS;
  heightReported: string | null;
  weightReported: string | null;
  nicotine: keyof typeof NICOTINE_LABELS | null;
  weightTrend: keyof typeof WEIGHT_TREND_LABELS | null;
  priorSurgery: boolean | null;
  goal: string | null;
  notes: string | null;
  source: keyof typeof SOURCE_LABELS;
  sourceDetail: string | null;
  utmCampaign: string | null;
}

/**
 * The internal notification is the handover to whoever is on the phone, so it
 * leads with the number to dial and a WhatsApp link that opens with the
 * message already written. Everything a coordinator would otherwise call back
 * to ask is in the body.
 */
export async function emailLyfeInternal(input: LyfeInternalInput): Promise<void> {
  const rsvp = input.intent === "EVENT_RSVP";
  const urgent = !rsvp && input.timing === "AS_SOON_AS_POSSIBLE";
  const firstName = input.fullName.trim().split(/\s+/)[0] ?? input.fullName;
  const waMessage = `Hello ${firstName}, this is the team at ${rsvp ? MEDLYFE_NAME : LYFE_NAME}. Thank you for your enquiry. Is now a good time for a short call?`;
  const waLink = `https://wa.me/${input.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMessage)}`;

  const row = (k: string, v: string | null | undefined) =>
    v
      ? `<tr><td style="padding:6px 12px 6px 0;color:${LYFE_BRAND.muted};font-size:12px;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;font-size:13px;color:${LYFE_BRAND.ink};">${esc(v)}</td></tr>`
      : "";

  const screening = !rsvp && input.pathway === "SURGICAL"
    ? `<p style="margin:22px 0 6px;font-weight:700;font-size:12px;letter-spacing:0.1em;color:${LYFE_BRAND.bronzeDeep};">PATIENT REPORTED, FOR THE CLINICAL TEAM</p>
       <table cellpadding="0" cellspacing="0" style="width:100%;">
         ${row("Height", input.heightReported)}
         ${row("Weight", input.weightReported)}
         ${row("Nicotine", input.nicotine ? NICOTINE_LABELS[input.nicotine] : null)}
         ${row("Weight trend", input.weightTrend ? WEIGHT_TREND_LABELS[input.weightTrend] : null)}
         ${row("Surgery in this area before", input.priorSurgery === null ? null : input.priorSurgery ? "Yes" : "No")}
       </table>
       <p style="margin:10px 0 0;font-size:12px;color:${LYFE_BRAND.muted};line-height:1.55;">Recorded as given. Do not interpret these, do not calculate from them, and do not offer a date or an opinion on candidacy. Route to the clinical team.</p>`
    : "";

  const html = layout(
    `<p style="margin:0 0 4px;font-weight:700;font-size:12px;letter-spacing:0.1em;color:${urgent ? "#B42318" : LYFE_BRAND.bronzeDeep};">
       ${urgent ? "CALL TODAY / WANTS THE FIRST APPOINTMENT" : "NEW ENQUIRY"}
     </p>
     <p style="margin:0 0 4px;font-size:21px;font-weight:600;">${esc(input.fullName)}</p>
     <p style="margin:0 0 18px;font-size:14px;color:${LYFE_BRAND.body};">${esc(PATHWAY_LABELS[input.pathway])}</p>

     <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
       <tr>
         <td style="padding-right:10px;"><a href="tel:${esc(input.phone)}" style="display:inline-block;background:${LYFE_BRAND.ink};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600;">Call ${esc(input.phone)}</a></td>
         <td><a href="${waLink}" style="display:inline-block;background:${LYFE_BRAND.green};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600;">WhatsApp</a></td>
       </tr>
     </table>

     <table cellpadding="0" cellspacing="0" style="width:100%;">
       ${row("Email", input.email)}
       ${row("Wants", input.concerns.map((c) => CONCERN_LABELS[c]).join(", ") || null)}
       ${row("Timing", input.timing ? TIMING_LABELS[input.timing] : null)}
       ${row("Based", BASED_LABELS[input.based])}
       ${row("Travelling from", input.travelFrom)}
       ${row("Consultation", rsvp ? null : FORMAT_LABELS[input.format])}
       ${row("Found us via", SOURCE_LABELS[input.source])}
       ${row("Specifically", input.sourceDetail)}
       ${row("Campaign", input.utmCampaign)}
     </table>

     ${input.goal ? `<p style="margin:20px 0 4px;font-weight:700;font-size:12px;letter-spacing:0.1em;color:${LYFE_BRAND.bronzeDeep};">IN HER OWN WORDS</p><p style="margin:0;font-size:14px;line-height:1.6;font-style:italic;">${esc(input.goal)}</p>` : ""}
     ${input.notes ? `<p style="margin:18px 0 4px;font-weight:700;font-size:12px;letter-spacing:0.1em;color:${LYFE_BRAND.bronzeDeep};">ANYTHING ELSE SHE SAID</p><p style="margin:0;font-size:14px;line-height:1.6;">${esc(input.notes)}</p>` : ""}
     ${screening}

     <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${LYFE_BRAND.line};font-size:12px;color:${LYFE_BRAND.muted};">
       Reference ${esc(input.id)}. Mark her contacted in the queue the moment you speak to her, because the clock on this row is running until you do.
     </p>`,
    rsvp ? `${input.fullName} is coming to the evening` : `${input.fullName}, ${PATHWAY_LABELS[input.pathway]}`,
  );

  await notifyInternal(
    input.to,
    `${rsvp ? "RSVP: " : input.intent === "CONSULTATION" ? "CONSULTATION: " : urgent ? "Call today: " : "Discovery call: "}${input.fullName}`,
    html,
  );
}

export { LYFE_CONTACT_EMAIL };


/**
 * Sent when Paystack says the money arrived, and only then.
 *
 * The earlier note said the time was held while she paid. This is the one that
 * says it is hers, so it has to carry the three things a person actually needs
 * on the day: when, how to join, and what to have thought about.
 */
export async function emailLyfeConsultationConfirmed({
  to,
  firstName,
  slotAt,
}: {
  to: string;
  firstName: string;
  slotAt: Date | null;
}): Promise<void> {
  const when = slotAt ? slotLabel(slotAt) : null;
  const html = layout(
    `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
     <p style="margin:0 0 14px;">That is paid and your consultation with ${esc(LYFE_SURGEON.name)} is booked.</p>
     ${
       when
         ? `<table cellpadding="0" cellspacing="0" style="margin:22px 0;width:100%;">
         <tr><td style="background:${MEDLYFE_BRAND.green};padding:20px 22px;font-size:15px;line-height:1.8;color:#FFFFFF;">
           <strong style="font-size:18px;">${esc(when)}</strong><br>
           <span style="color:${MEDLYFE_BRAND.limeSoft};">Thirty minutes, by video. We send the link the day before.</span>
         </td></tr>
       </table>`
         : `<p style="margin:0 0 14px;">The half hour you chose had just gone when your payment landed, so a coordinator will call you today to find another time that works. Nothing is lost and nothing more is owed.</p>`
     }
     <p style="margin:0 0 14px;">Come with one thing in mind: what you would like to be different. You do not need photographs, you do not need to have decided anything, and you will not be sold to on the call.</p>
     <p style="margin:0 0 14px;">${esc(LYFE_CONSULT.feeNote)}</p>
     <p style="margin:0 0 14px;">If you need to move it, reply to this note or call ${esc(LYFE_PHONE_DISPLAY)}. Please give us a day's notice if you can, because the diary is only ${LYFE_CONSULT.perWeek} of these a week.</p>
     <p style="margin:0 0 6px;">With kind regards,</p>
     <p style="margin:0;font-weight:600;">The team at ${esc(LYFE_NAME)}</p>`,
    when ? `Booked: ${when} with ${LYFE_SURGEON.name}.` : "Your consultation is paid for.",
  );
  await notifyInternal(to, when ? `Booked, ${esc(firstName)}: ${esc(when)}` : `Your consultation, ${esc(firstName)}`, html);
}

/**
 * The invitation. This is the note that offers a place, so it is the only one
 * that carries a link, and the link is the person. Nothing here says "click to
 * RSVP" generically, because a forwarded generic link is exactly how a room
 * built for seventy ends up with ninety people at the door.
 */
export async function emailLyfeInvitation({
  to,
  firstName,
  token,
  from,
}: {
  to: string;
  firstName: string;
  token: string;
  from?: string | null;
}): Promise<void> {
  const url = lyfeConfirmUrl(token);
  const signature = from?.trim() || `The team at ${MEDLYFE_NAME}`;

  const html = layout(
    `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
     <p style="margin:0 0 14px;">We would like you to join us for ${esc(LYFE_EVENT_THEME)}, an evening hosted by ${esc(LYFE_EVENT.host)}.</p>
     <table cellpadding="0" cellspacing="0" style="margin:22px 0;width:100%;">
       <tr><td style="background:${MEDLYFE_BRAND.green};padding:22px 24px;font-size:14px;line-height:1.8;color:#FFFFFF;">
         <strong style="font-size:18px;">${esc(LYFE_EVENT.proposition)}</strong><br>
         <span style="color:${MEDLYFE_BRAND.limeSoft};">${esc(LYFE_EVENT.standfirst)}</span>
         <br><br>
         <strong>${esc(LYFE_EVENT.date)}</strong><br>
         Arrival ${esc(LYFE_EVENT.arrival)} &middot; Programme ${esc(LYFE_EVENT.programme)} &middot; Close ${esc(LYFE_EVENT.close)}<br>
         ${esc(LYFE_EVENT.venueAddress ? LYFE_EVENT.venueName + ", " + LYFE_EVENT.venueAddress : LYFE_EVENT.venueName)}
       </td></tr>
     </table>
     <p style="margin:0 0 20px;">This invitation is yours and the link below belongs to it. Please confirm so we know to keep your place, and tell us there if you are bringing anybody.</p>
     <table cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
       <tr><td style="background:${MEDLYFE_BRAND.green};">
         <a href="${url}" style="display:inline-block;padding:14px 30px;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;">Confirm your place</a>
       </td></tr>
     </table>
     <p style="margin:0 0 14px;font-size:13px;color:#6B7280;">If the button does not work, this is the address: <a href="${url}" style="color:${MEDLYFE_BRAND.green};">${esc(url)}</a></p>
     <p style="margin:0 0 14px;">The room holds ${LYFE_EVENT.places}, so if the evening turns out not to suit you, saying so lets us offer the place to somebody else. There is no awkwardness in it.</p>
     <p style="margin:0 0 6px;">With kind regards,</p>
     <p style="margin:0;font-weight:600;">${esc(signature)}</p>`,
    `An invitation to ${LYFE_EVENT_THEME}, ${LYFE_EVENT.date}.`,
    "medlyfe",
    INVITED_FOOTER,
  );

  await notifyInternal(to, `An invitation to ${LYFE_EVENT_THEME}`, html);
}

/** Sent the moment somebody confirms, so they have the details in writing. */
export async function emailLyfeAttendanceConfirmed({
  to,
  firstName,
  guestCount,
}: {
  to: string;
  firstName: string;
  guestCount: number | null;
}): Promise<void> {
  const plusOne = guestCount && guestCount > 0
    ? `<p style="margin:0 0 14px;">We have you down for ${guestCount === 1 ? "one guest" : `${guestCount} guests`} as well. If that changes, reply and tell us.</p>`
    : "";

  const html = layout(
    `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
     <p style="margin:0 0 14px;">Your place is held. Thank you, and we look forward to seeing you.</p>
     ${plusOne}
     <table cellpadding="0" cellspacing="0" style="margin:22px 0;width:100%;">
       <tr><td style="background:${MEDLYFE_BRAND.green};padding:20px 22px;font-size:14px;line-height:1.8;color:#FFFFFF;">
         <strong style="font-size:17px;">${esc(LYFE_EVENT_THEME)}</strong><br>
         <span style="color:${MEDLYFE_BRAND.limeSoft};">${esc(LYFE_EVENT.standfirst)}</span>
         <br><br>
         <strong>${esc(LYFE_EVENT.date)}</strong><br>
         Arrival ${esc(LYFE_EVENT.arrival)} &middot; Programme ${esc(LYFE_EVENT.programme)} &middot; Close ${esc(LYFE_EVENT.close)}<br>
         ${esc(LYFE_EVENT.venueAddress ? LYFE_EVENT.venueName + ", " + LYFE_EVENT.venueAddress : LYFE_EVENT.venueName)}
       </td></tr>
     </table>
     <p style="margin:0 0 14px;">The evening opens with an address on what modern medicine can now do about the way we age, then a panel on the new science of ageing well, then the practical part: what you can actually do about it, and where to start. The clinical team is in the room throughout if you would like to speak to somebody personally.</p>
     <p style="margin:0 0 14px;">Every guest goes home with a short printed piece, &ldquo;${esc(LYFE_EVENT_TAKEAWAY)}&rdquo;.</p>
     <p style="margin:0 0 14px;">If your plans change, reply to this note. Releasing a place is genuinely helpful rather than a nuisance.</p>
     <p style="margin:0 0 6px;">With kind regards,</p>
     <p style="margin:0;font-weight:600;">The team at ${esc(MEDLYFE_NAME)}</p>`,
    `Your place at ${LYFE_EVENT_THEME} is held.`,
    "medlyfe",
    INVITED_FOOTER,
  );

  await notifyInternal(to, `Your place is held, ${esc(firstName)}`, html);
}

/**
 * The ask to a confirmed speaker for their bio and a photograph.
 *
 * Short on purpose. These are busy people doing us a favour, and the commonest
 * reason this request goes unanswered is that it arrives as a form with eight
 * fields. Two things, a deadline, and a reply-all address.
 */
export async function emailLyfeSpeakerAsk({
  to,
  firstName,
  slot,
  needSubject,
  deadline,
  fromName,
}: {
  to: string;
  firstName: string;
  slot: string;
  needSubject: boolean;
  deadline: string;
  fromName: string;
}): Promise<void> {
  const subjectAsk = needSubject
    ? `<li style="margin:0 0 10px;"><strong>A line on what you would like to speak to.</strong> One sentence is plenty. It goes under your name in the programme and tells the chair where to come to you.</li>`
    : "";

  const html = layout(
    `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
     <p style="margin:0 0 14px;">Thank you for joining us for ${esc(LYFE_EVENT_THEME)} on <strong>${esc(LYFE_EVENT.date)}</strong> at ${esc(LYFE_EVENT.venueName)}. Arrival is ${esc(LYFE_EVENT.arrival)} and we are done by ${esc(LYFE_EVENT.close)}.</p>
     <p style="margin:0 0 14px;">You are down for <strong>${esc(slot)}</strong>.</p>
     <p style="margin:0 0 10px;">Two things from you, and a third if it is easy:</p>
     <ul style="margin:0 0 18px;padding-left:20px;font-size:14px;line-height:1.7;color:${LYFE_BRAND.body};">
       <li style="margin:0 0 10px;"><strong>A short bio.</strong> Eighty to a hundred words, written the way you would want to be introduced from a stage rather than the way a conference programme would do it.</li>
       <li style="margin:0 0 10px;"><strong>A photograph.</strong> Any good headshot you already have. It does not need to be new and it does not need to be formal, it only needs to be high resolution.</li>
       ${subjectAsk}
     </ul>
     <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;">
       <tr><td style="background:${MEDLYFE_BRAND.green};padding:16px 18px;font-size:14px;line-height:1.7;color:#FFFFFF;">
         We are printing and briefing the press from <strong>${esc(deadline)}</strong>, so anything that reaches us by then makes the programme. Simply reply to this note with both attached.
       </td></tr>
     </table>
     <p style="margin:0 0 14px;">If anything about the slot or the timing does not work, say so now rather than later and we will move it. The running order is still ours to change.</p>
     <p style="margin:0 0 6px;">With thanks,</p>
     <p style="margin:0;font-weight:600;">${esc(fromName)}</p>
     <p style="margin:2px 0 0;font-size:13px;color:#83868F;">${esc(LYFE_EVENT.host)}</p>`,
    `Your bio and a photograph for ${LYFE_EVENT_THEME}, ${LYFE_EVENT.date}.`,
    "medlyfe",
    SPEAKER_FOOTER,
  );

  await notifyInternal(to, `${LYFE_EVENT_THEME}: your bio and a photograph`, html);
}

/**
 * Everything one speaker needs, and one thing to do.
 *
 * Sent per person so nobody sees anyone else's address, and carrying only
 * their own slot, bio and questions. A seven person pack asks a busy
 * clinician to find themselves in it; this does the finding for them.
 */
export async function emailLyfeSpeakerConfirm({
  to,
  firstName,
  slot,
  subject,
  bio,
  questions,
  chairSet,
  deadline,
  fromName,
}: {
  to: string;
  firstName: string;
  slot: string;
  subject?: string;
  bio?: string;
  questions?: string[];
  /** The chair is asking, not answering, so she gets the whole set by seat. */
  chairSet?: { name: string; subject?: string; questions?: string[] }[];
  deadline: string;
  fromName: string;
}): Promise<void> {
  const bioBlock = bio
    ? `<p style="margin:0 0 6px;font-weight:700;">Your bio, as we will print it</p>
       <table cellpadding="0" cellspacing="0" style="margin:0 0 18px;width:100%;">
         <tr><td style="background:${LYFE_BRAND.groundWarm};border-left:3px solid ${LYFE_BRAND.bronze};padding:14px 16px;font-size:14px;line-height:1.65;color:${LYFE_BRAND.body};">${esc(bio)}</td></tr>
       </table>`
    : `<p style="margin:0 0 18px;"><strong>We do not have a bio for you.</strong> Eighty to a hundred words, written the way you would want to be introduced from a stage.</p>`;

  const chairBlock = chairSet?.length
    ? `<p style="margin:0 0 6px;font-weight:700;">The questions you will put</p>
       <p style="margin:0 0 14px;font-size:13.5px;color:${LYFE_BRAND.muted};">A brief, not a script. Cut in when an answer finishes on a generality, and make sure every answer ends in something a guest can do this week.</p>
       ${chairSet
         .map(
           (p) => `<p style="margin:0 0 4px;font-weight:600;font-size:14px;color:${LYFE_BRAND.ink};">${esc(p.name)}${p.subject ? `, on ${esc(p.subject.toLowerCase())}` : ""}</p>
             <ul style="margin:0 0 14px;padding-left:20px;font-size:14px;line-height:1.65;color:${LYFE_BRAND.body};">
               ${(p.questions ?? []).map((q) => `<li style="margin:0 0 4px;">${esc(q)}</li>`).join("")}
             </ul>`,
         )
         .join("")}`
    : "";

  const qBlock = questions?.length
    ? `<p style="margin:0 0 6px;font-weight:700;">What you will be asked</p>
       <ul style="margin:0 0 18px;padding-left:20px;font-size:14px;line-height:1.7;color:${LYFE_BRAND.body};">
         ${questions.map((q) => `<li style="margin:0 0 6px;">${esc(q)}</li>`).join("")}
       </ul>
       <p style="margin:0 0 18px;font-size:13.5px;color:${LYFE_BRAND.muted};">A brief, not a script. Tell us what you would rather be asked.</p>`
    : "";

  const html = layout(
    `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
     <p style="margin:0 0 14px;">Everything for ${esc(LYFE_EVENT_THEME)} on <strong>${esc(LYFE_EVENT.date)}</strong>, ${esc(LYFE_EVENT.venueName)}. Please be in the room by 6:15pm. The programme runs ${esc(LYFE_EVENT.programme)} to 8:15pm, then drinks until ${esc(LYFE_EVENT.close)}.</p>

     <p style="margin:0 0 6px;font-weight:700;">Your part</p>
     <p style="margin:0 0 18px;">You are on <strong>${esc(slot)}</strong>${subject ? `, speaking to <strong>${esc(subject)}</strong>` : ""}. The panel is 7:00 to 7:45, chaired by Dr Debo Odulana, four seats, about eleven minutes each.</p>

     ${bioBlock}
     ${chairBlock}
     ${qBlock}

     <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;">
       <tr><td style="background:${MEDLYFE_BRAND.green};padding:16px 18px;font-size:14px;line-height:1.7;color:#FFFFFF;">
         <strong>One thing to do.</strong> Reply by <strong>${esc(deadline)}</strong> confirming the bio and your subject are right, or send the corrections. After that it goes live on the site, into the printed programme and to the press.
       </td></tr>
     </table>

     <p style="margin:0 0 14px;">No slides and no lectern. Dress is cocktail. Please stay for the hour after the programme, which is when guests actually talk to you.</p>
     <p style="margin:0 0 6px;">With thanks,</p>
     <p style="margin:0;font-weight:600;">${esc(fromName)}</p>
     <p style="margin:2px 0 0;font-size:13px;color:#83868F;">${esc(LYFE_EVENT.host)}</p>`,
    `Your part in ${LYFE_EVENT_THEME}. Please confirm by ${deadline}.`,
    "medlyfe",
    SPEAKER_FOOTER,
  );

  await notifyInternal(to, `${LYFE_EVENT_THEME}: please confirm your details`, html);
}
