/**
 * Tasks arrive in trickles. A task with a startsOn in the future exists but has
 * not reached anybody yet: it is not on a to-do list, not chased, not flagged.
 * Null startsOn means live now, which is every Haven task.
 *
 * Spread into a StaffTask where clause: `{ ...released(), clientId, ... }`.
 */
export function released(now: Date = new Date()) {
  return { OR: [{ startsOn: null }, { startsOn: { lte: now } }] };
}
