-- The project record is only as current as the last person who typed into it,
-- and nothing in the platform made anybody type. Three in-house engagements ran
-- a quarter past their end date with every milestone overdue while five live
-- client engagements had no milestones at all, so they could not even be
-- counted as late.
--
-- The freshness job chases the engagement manager and escalates to the partner.
-- These two actions are how it remembers who it has already chased this week,
-- so a slow week produces one email rather than five identical ones.

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'FRESHNESS_NUDGE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'FRESHNESS_ESCALATION';
