import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientPortalSession } from "@/lib/clientPortalAuth";
import { emailClientPortalInvite, notifyInternal } from "@/lib/email";

// The client's primary contact giving colleagues access to the portal, and
// taking it away. Only the primary contact can do either, because whoever is
// let in sees everything on the client, invoices included.

const inviteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  title: z.string().trim().max(120).optional(),
});
const accessSchema = z.object({ contactId: z.string().min(1), action: z.enum(["revoke", "restore"]) });

async function primaryContact() {
  const session = await getClientPortalSession();
  if (!session) return null;
  const me = await prisma.clientContact.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, clientId: true, isPrimary: true, isPortalEnabled: true, client: { select: { name: true } } },
  });
  if (!me || me.clientId !== session.clientId || !me.isPortalEnabled || !me.isPrimary) return null;
  return me;
}

function tempPassword(): string {
  const U = "ABCDEFGHJKLMNPQRSTUVWXYZ", L = "abcdefghjkmnpqrstuvwxyz", D = "23456789", S = "!@#$%*?";
  const pick = (s: string) => s[randomInt(s.length)];
  const chars = [pick(U), pick(L), pick(D), pick(S), ...Array.from({ length: 10 }, () => pick(U + L + D))];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const tellCfa = (subject: string, body: string) =>
  notifyInternal("debo.odulana@consultforafrica.com", subject, `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">${body}</div>`).catch(
    (err) => console.error("[client-portal/team] notification failed", err)
  );

/** POST: invite a colleague, or re-invite one who already exists on this client. */
export async function POST(req: NextRequest) {
  const me = await primaryContact();
  if (!me) return Response.json({ error: "Only the main contact can invite colleagues." }, { status: 403 });

  const parsed = inviteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please give a name and a valid email address." }, { status: 400 });
  const { name, email, title } = parsed.data;

  const existing = await prisma.clientContact.findUnique({ where: { email }, select: { id: true, clientId: true } });
  if (existing && existing.clientId !== me.clientId) {
    return Response.json({ error: "That email is already in use. Please contact us and we will sort it out." }, { status: 409 });
  }
  if (existing?.id === me.id) return Response.json({ error: "That is your own address." }, { status: 400 });

  const password = tempPassword();
  const passwordHash = await bcrypt.hash(password, 12);
  const contact = existing
    ? await prisma.clientContact.update({
        where: { id: existing.id },
        data: { name, title: title || undefined, passwordHash, isPortalEnabled: true },
        select: { id: true },
      })
    : await prisma.clientContact.create({
        data: { clientId: me.clientId, name, email, title: title || null, passwordHash, isPortalEnabled: true },
        select: { id: true },
      });

  await emailClientPortalInvite({ contactEmail: email, contactName: name, clientName: me.client.name, password });
  await tellCfa(`${me.client.name}: ${me.name} gave ${name} portal access`, `<p><b>${esc(me.name)}</b> invited <b>${esc(name)}</b> (${esc(email)}) to the ${esc(me.client.name)} client portal. They can now see everything on the client, including invoices.</p>`);

  return Response.json({ ok: true, id: contact.id });
}

/** PATCH: take a colleague's access away, or give it back without a new invite. */
export async function PATCH(req: NextRequest) {
  const me = await primaryContact();
  if (!me) return Response.json({ error: "Only the main contact can change access." }, { status: 403 });

  const parsed = accessSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { contactId, action } = parsed.data;
  if (contactId === me.id) return Response.json({ error: "You cannot remove your own access." }, { status: 400 });

  const target = await prisma.clientContact.findUnique({ where: { id: contactId }, select: { clientId: true, name: true, passwordHash: true } });
  if (!target || target.clientId !== me.clientId) return Response.json({ error: "Not found" }, { status: 404 });
  if (action === "restore" && !target.passwordHash) {
    return Response.json({ error: "They have never been invited. Use the invite form instead." }, { status: 400 });
  }

  await prisma.clientContact.update({ where: { id: contactId }, data: { isPortalEnabled: action === "restore" } });
  await tellCfa(
    `${me.client.name}: ${me.name} ${action === "revoke" ? "removed" : "restored"} ${target.name}'s portal access`,
    `<p><b>${esc(me.name)}</b> ${action === "revoke" ? "removed" : "restored"} <b>${esc(target.name)}</b>'s access to the ${esc(me.client.name)} client portal.</p>`
  );
  return Response.json({ ok: true });
}
