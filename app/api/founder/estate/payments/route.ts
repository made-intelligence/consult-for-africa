import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Money in, and corrections.
 *
 * Nothing in this section ever edits or deletes a ledger row. A mistake is
 * fixed by posting an ADJUSTMENT that says what it reverses, so a tenant reading
 * their statement sees a history rather than whatever the office last decided —
 * which is the difference between an account somebody trusts and one they start
 * shadowing in a notebook.
 */

const schema = z.object({
  unitId: z.string().min(1).max(40),
  account: z.enum(["DIESEL", "SERVICE_CHARGE"]),
  kind: z.enum([
    "DIESEL_TOPUP",
    "SERVICE_CHARGE_PAYMENT",
    "SERVICE_CHARGE_LEVY",
    "ADJUSTMENT",
    "REFUND",
  ]),
  /** Naira. Positive credits the tenant, negative draws down. */
  amount: z.number().refine((n) => n !== 0, "An entry of zero changes nothing."),
  occurredAt: z.string().nullable().optional(),
  description: z.string().min(3).max(300),
  paymentMethod: z.string().max(60).nullable().optional(),
  paymentReference: z.string().max(120).nullable().optional(),
});

export const POST = handler(async function POST(req: Request) {
  const { error, session } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "An amount and a description are required." }, { status: 400 });
  }
  const d = parsed.data;

  // A levy is a charge, a payment is a credit. Getting the sign from the kind
  // rather than trusting the caller means a mistyped minus cannot silently
  // invert somebody's balance.
  const signed =
    d.kind === "SERVICE_CHARGE_LEVY" || d.kind === "REFUND"
      ? -Math.abs(d.amount)
      : d.kind === "ADJUSTMENT"
        ? d.amount
        : Math.abs(d.amount);

  const unit = await prisma.estateUnit.findUnique({ where: { id: d.unitId }, select: { id: true } });
  if (!unit) return Response.json({ error: "That unit does not exist." }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  const entry = await prisma.estateLedgerEntry.create({
    data: {
      unitId: d.unitId,
      account: d.account,
      kind: d.kind,
      amount: signed,
      occurredAt: d.occurredAt ? new Date(d.occurredAt) : new Date(),
      description: d.description.trim(),
      paymentMethod: d.paymentMethod?.trim() || null,
      paymentReference: d.paymentReference?.trim() || null,
      recordedById: user?.id ?? null,
    },
    select: { id: true, amount: true },
  });

  return Response.json({ ok: true, id: entry.id, amount: Number(entry.amount) }, { status: 201 });
});
