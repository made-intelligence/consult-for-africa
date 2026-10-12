/**
 * Who counts, who gets written to, and who appears in the directory.
 *
 * One place, because the bug this fixes was the same filter written slightly
 * differently at five call sites. Founders received staff onboarding emails
 * twice a week, a test account sat in the directory a nurse sees, and the
 * sprint denominator counted both.
 *
 * Import these. Do not write `department: { not: "BOARD" }` again.
 */
/**
 * The denominator. The hospital's own employees and nobody else: we are not
 * measuring CFA's adoption of CFA's own tool, and a founder who never signs in
 * is not a programme failure.
 */
export type StaffKindName = "EMPLOYEE" | "FOUNDER" | "PARTNER" | "TEST";

export const COUNTED: StaffKindName[] = ["EMPLOYEE"];

/**
 * Who the system writes to and chases. Employees plus CFA on site, because
 * Dr Tanwa has a list of her own and should be held to it.
 *
 * Founders are excluded deliberately. They did not ask for a daily task list
 * and sending owners a nudge about a crash trolley check reads as confusion
 * about who they are.
 */
export const ONBOARDED: StaffKindName[] = ["EMPLOYEE", "PARTNER"];

/**
 * Who a nurse sees when she needs a number at three in the morning. Employees
 * and CFA on site. Not the non-working owners, whose mobiles are not ours to
 * hand round, and obviously not a test account.
 */
export const DIRECTORY: StaffKindName[] = ["EMPLOYEE", "PARTNER"];


/**
 * Spread into a where clause: `{ ...staffWhere(clientId, ONBOARDED) }`.
 *
 * Returns a plain object rather than Prisma.StaffMemberWhereInput on purpose.
 * Naming a generated type here couples this file to whatever the client was
 * last generated from, and the generated client in a worktree is routinely a
 * branch behind. Prisma accepts the shape either way.
 */
export function staffWhere(clientId: string, kinds: readonly StaffKindName[]) {
  return { clientId, isActive: true, kind: { in: [...kinds] } };
}
