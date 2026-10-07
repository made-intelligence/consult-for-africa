-- Claims recovery desk: payers, accounts, batches, claims, an append-only
-- activity log and payments. Additive only.

CREATE TABLE "RecoveryPayer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'HMO',
    "conflict" BOOLEAN NOT NULL DEFAULT false,
    "conflictNote" TEXT,
    "advanceEligible" BOOLEAN NOT NULL DEFAULT true,
    "claimsContact" TEXT,
    "claimsEmail" TEXT,
    "claimsPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryPayer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecoveryAccount" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SAMPLE',
    "advanceRate" DECIMAL(5,4) NOT NULL DEFAULT 0.6,
    "recoveryFeeRate" DECIMAL(5,4),
    "facilityLimit" DECIMAL(14,2),
    "maxClaimAgeDays" INTEGER NOT NULL DEFAULT 180,
    "payerCap" DECIMAL(5,4) NOT NULL DEFAULT 0.4,
    "intakeToken" TEXT NOT NULL,
    "agreementSignedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecoveryBatch" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'LIVE',
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vettedAt" TIMESTAMP(3),
    "funder" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecoveryClaim" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "claimRef" TEXT NOT NULL,
    "enrolleeRef" TEXT,
    "serviceDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "serviceSummary" TEXT,
    "authCode" TEXT,
    "documentsHeld" TEXT[],
    "billedAmount" DECIMAL(14,2) NOT NULL,
    "tariffAmount" DECIMAL(14,2),
    "payerResponse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "vetVerdict" TEXT,
    "vetLikelihood" INTEGER,
    "vetPayable" DECIMAL(14,2),
    "vetIssues" JSONB,
    "vetRepairs" JSONB,
    "vetRationale" TEXT,
    "vetModel" TEXT,
    "vettedAt" TIMESTAMP(3),
    "vetConfirmedById" TEXT,
    "vetConfirmedAt" TIMESTAMP(3),
    "decision" TEXT,
    "decisionAmount" DECIMAL(14,2),
    "decisionReasons" JSONB,
    "decidedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "advanceAmount" DECIMAL(14,2),
    "advancedAt" TIMESTAMP(3),
    "recoveredAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3),
    "priority" INTEGER,
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryClaim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecoveryActivity" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "claimId" TEXT,
    "payerId" TEXT,
    "kind" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detail" JSONB,
    "amount" DECIMAL(14,2),
    "promisedFor" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecoveryPayment" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecoveryPayer_name_key" ON "RecoveryPayer"("name");

CREATE UNIQUE INDEX "RecoveryAccount_hospitalId_key" ON "RecoveryAccount"("hospitalId");

CREATE UNIQUE INDEX "RecoveryAccount_intakeToken_key" ON "RecoveryAccount"("intakeToken");

CREATE INDEX "RecoveryBatch_accountId_status_idx" ON "RecoveryBatch"("accountId", "status");

CREATE INDEX "RecoveryClaim_accountId_status_idx" ON "RecoveryClaim"("accountId", "status");

CREATE INDEX "RecoveryClaim_payerId_status_idx" ON "RecoveryClaim"("payerId", "status");

CREATE INDEX "RecoveryClaim_nextActionAt_idx" ON "RecoveryClaim"("nextActionAt");

CREATE UNIQUE INDEX "RecoveryClaim_accountId_payerId_claimRef_key" ON "RecoveryClaim"("accountId", "payerId", "claimRef");

CREATE INDEX "RecoveryActivity_accountId_createdAt_idx" ON "RecoveryActivity"("accountId", "createdAt");

CREATE INDEX "RecoveryActivity_claimId_idx" ON "RecoveryActivity"("claimId");

CREATE INDEX "RecoveryActivity_payerId_kind_idx" ON "RecoveryActivity"("payerId", "kind");

CREATE INDEX "RecoveryPayment_claimId_idx" ON "RecoveryPayment"("claimId");

ALTER TABLE "RecoveryAccount" ADD CONSTRAINT "RecoveryAccount_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecoveryBatch" ADD CONSTRAINT "RecoveryBatch_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RecoveryAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecoveryClaim" ADD CONSTRAINT "RecoveryClaim_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "RecoveryBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecoveryClaim" ADD CONSTRAINT "RecoveryClaim_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RecoveryAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecoveryClaim" ADD CONSTRAINT "RecoveryClaim_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "RecoveryPayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RecoveryActivity" ADD CONSTRAINT "RecoveryActivity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RecoveryAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecoveryActivity" ADD CONSTRAINT "RecoveryActivity_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "RecoveryClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecoveryActivity" ADD CONSTRAINT "RecoveryActivity_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "RecoveryPayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecoveryPayment" ADD CONSTRAINT "RecoveryPayment_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "RecoveryClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
