-- The handover: what the assignee is actually submitting, and the trail of
-- every move made on a task.

CREATE TYPE "TaskEventKind" AS ENUM ('RAISED', 'STATUS', 'REASSIGNED');

ALTER TABLE "Task" ADD COLUMN "handoverNote" TEXT;

CREATE TABLE "TaskAttachment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileKey" TEXT,
    "url" TEXT,
    "contentType" TEXT,
    "sizeBytes" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TaskAttachment_taskId_idx" ON "TaskAttachment"("taskId");

ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TaskEvent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "kind" "TaskEventKind" NOT NULL DEFAULT 'STATUS',
    "fromStatus" "TaskStatus",
    "toStatus" "TaskStatus",
    "note" TEXT,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TaskEvent_taskId_createdAt_idx" ON "TaskEvent"("taskId", "createdAt");

ALTER TABLE "TaskEvent" ADD CONSTRAINT "TaskEvent_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskEvent" ADD CONSTRAINT "TaskEvent_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Every task that already exists gets the one event we can state with
-- certainty: who raised it and when. A trail that starts empty reads as though
-- nothing ever happened, which is worse than a short one.
INSERT INTO "TaskEvent" ("id", "taskId", "kind", "fromStatus", "toStatus", "note", "actorId", "createdAt")
SELECT
    'seed_' || "id",
    "id",
    'RAISED',
    NULL,
    'ASSIGNED',
    NULL,
    "assignerId",
    "createdAt"
FROM "Task";
