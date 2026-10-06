-- The process library, and the record of who has acknowledged, studied and
-- been tested on each protocol.
--
-- The audit found what this exists for: procedures exist and are accessible,
-- almost nobody has been trained on them, supervision is informal and nobody
-- checks. A protocol nobody has been tested on is a document, not a control.
--
-- Protocol.body and the questions are authored by the hospital's clinical lead,
-- never generated and never written by us. A protocol with an empty body is not
-- a defect in this table. It is the gap, made visible.
--
-- Additive only.

-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "roles" TEXT[],
    "departments" TEXT[],
    "method" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtocolQuestion" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correct" INTEGER NOT NULL,
    "because" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProtocolQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- The three steps are separate columns rather than one status enum, because
-- somebody can study without being tested and knowing which of the three
-- stalled is the whole management question.
CREATE TABLE "ProtocolProgress" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "studiedAt" TIMESTAMP(3),
    "testedAt" TIMESTAMP(3),
    "score" INTEGER,
    "outOf" INTEGER,
    "passed" BOOLEAN,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "observedById" TEXT,
    "observedAt" TIMESTAMP(3),
    "againstVersion" INTEGER NOT NULL DEFAULT 1,
    "nextDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtocolProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Protocol_clientId_code_key" ON "Protocol"("clientId", "code");
CREATE INDEX "Protocol_clientId_isActive_idx" ON "Protocol"("clientId", "isActive");
CREATE INDEX "ProtocolQuestion_protocolId_idx" ON "ProtocolQuestion"("protocolId");
CREATE UNIQUE INDEX "ProtocolProgress_protocolId_staffId_key" ON "ProtocolProgress"("protocolId", "staffId");
CREATE INDEX "ProtocolProgress_staffId_idx" ON "ProtocolProgress"("staffId");

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProtocolQuestion" ADD CONSTRAINT "ProtocolQuestion_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProtocolProgress" ADD CONSTRAINT "ProtocolProgress_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProtocolProgress" ADD CONSTRAINT "ProtocolProgress_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SET NULL rather than CASCADE: if the person who signed somebody off later
-- leaves, the sign-off must not vanish with them.
ALTER TABLE "ProtocolProgress" ADD CONSTRAINT "ProtocolProgress_observedById_fkey" FOREIGN KEY ("observedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
