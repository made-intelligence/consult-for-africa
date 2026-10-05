import { notifyInternal } from "@/lib/email";
import {
  BASED_LABELS,
  CONCERN_LABELS,
  FORMAT_LABELS,
  LYFE_BRAND,
  LYFE_CONTACT_EMAIL,
  LYFE_EVENT,
  LYFE_EVENT_TAKEAWAY,
  LYFE_NAME,
  MEDLYFE_BRAND,
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

function layout(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(LYFE_NAME)}</title></head>
<body style="margin:0;padding:0;background:${LYFE_BRAND.groundWarm};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;border:1px solid ${LYFE_BRAND.line};overflow:hidden;">
        <tr><td style="background:${LYFE_BRAND.ink};padding:26px 32px;">
          <div style="color:#ffffff;font-weight:600;font-size:23px;line-height:1.1;letter-spacing:-0.01em;">Lyfe</div>
          <div style="color:${LYFE_BRAND.bronze};font-weight:700;font-size:9px;letter-spacing:0.16em;margin-top:8px;">PLASTICS AND DERMATOLOGY</div>
        </td></tr>
        <tr><td style="height:3px;background:${LYFE_BRAND.bronze};"></td></tr>
        <tr><td style="padding:32px;color:${LYFE_BRAND.ink};font-size:15px;line-height:1.65;">${content}</td></tr>
        <tr><td style="padding:18px 32px;background:${LYFE_BRAND.ground};border-top:1px solid ${LYFE_BRAND.line};color:${LYFE_BRAND.muted};font-size:11px;line-height:1.6;">
          ${esc(LYFE_NAME)} &middot; Lagos, Nigeria &middot; ${esc(LYFE_PHONE_DISPLAY)}<br>
          You are receiving this because you made an enquiry. Reply at any time and we will remove your details.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

type PathwayKey = keyof typeof PATHWAY_LABELS;

type Intent = "EVENT_RSVP" | "DISCOVERY_CALL";

export interface LyfeConfirmationInput {
  to: string;
  firstName: string;
  intent: Intent;
  surgical: boolean;
  guestCount: number | null;
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
}: LyfeConfirmationInput): Promise<void> {
  if (intent === "EVENT_RSVP") {
    const plusOne = guestCount && guestCount > 0
      ? `<p style="margin:0 0 14px;">We have you down for ${guestCount === 1 ? "one guest" : `${guestCount} guests`} as well. If that changes, reply and tell us.</p>`
      : "";

    const html = layout(
      `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
       <p style="margin:0 0 14px;">Thank you. You are on the list for the evening at ${esc(LYFE_EVENT.host)}, with ${esc(LYFE_EVENT.withWhom)}, and we are glad you are coming.</p>
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
       <p style="margin:0 0 14px;">A member of the team will call you to confirm personally. The evening opens with an introduction to what Medlyfe has built across wellness and aesthetics, then a conversation about how wellbeing, longevity, confidence and appearance connect, and then Dr Kpaduwa leads a conversation titled &ldquo;${esc(LYFE_EVENT.sessionTitle)}&rdquo;.</p>
       <p style="margin:0 0 14px;">There will be plenty of time for questions, conversation and cocktails, and the clinical team is in the room throughout if you would like to speak to somebody personally.</p>
       <p style="margin:0 0 14px;">Every guest goes home with a short printed piece, &ldquo;${esc(LYFE_EVENT_TAKEAWAY)}&rdquo;. It is useful whether or not you ever come to us.</p>
       <p style="margin:0 0 14px;">If you would rather speak to somebody before the evening, reply to this note and we will arrange a call.</p>
       <p style="margin:0 0 6px;">With kind regards,</p>
       <p style="margin:0;font-weight:600;">The team at ${esc(LYFE_NAME)}</p>`,
      `You are on the list for ${LYFE_EVENT.date}.`,
    );
    await notifyInternal(to, `You are on the list, ${esc(firstName)}`, html);
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
  const waMessage = `Hello ${firstName}, this is the team at ${LYFE_NAME}. Thank you for your enquiry. Is now a good time for a short call?`;
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
    `${rsvp ? "RSVP: " : urgent ? "Call today: " : "Discovery call: "}${input.fullName}`,
    html,
  );
}

export { LYFE_CONTACT_EMAIL };
