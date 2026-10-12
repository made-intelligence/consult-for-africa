-- AlterTable
ALTER TABLE "RecoveryPayer" ADD COLUMN     "dueDays" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "expectedDaysToPay" INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE "RecoveryClaim" ADD COLUMN     "acceptanceRef" TEXT,
ADD COLUMN     "acceptedAmount" DECIMAL(14,2),
ADD COLUMN     "payerAcceptedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RecoveryAcknowledgment" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "signedOn" TIMESTAMP(3) NOT NULL,
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryAdvance" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "funder" TEXT NOT NULL DEFAULT 'Carbon',
    "principal" DECIMAL(14,2) NOT NULL,
    "monthlyRate" DECIMAL(6,5) NOT NULL,
    "minDays" INTEGER NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL,
    "feeRate" DECIMAL(6,5) NOT NULL,
    "fee" DECIMAL(14,2) NOT NULL,
    "netDisbursed" DECIMAL(14,2) NOT NULL,
    "disbursedAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "principalRepaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "extraInterest" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "extraInterestPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "interestAccruedTo" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "repaidAt" TIMESTAMP(3),
    "feeStatus" TEXT NOT NULL DEFAULT 'WITHHELD',
    "feeReleasedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryReceipt" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "payerId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'HMO',
    "amount" DECIMAL(14,2) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "toFunder" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "feesReleased" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "toHospital" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hospitalDueBy" TIMESTAMP(3),
    "hospitalPaidAt" TIMESTAMP(3),
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryAllocation" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "claimId" TEXT,
    "advanceId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'CLAIM',
    "amount" DECIMAL(14,2) NOT NULL,
    "toInterest" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "toPrincipal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryAcknowledgment_accountId_payerId_key" ON "RecoveryAcknowledgment"("accountId", "payerId");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryAdvance_claimId_key" ON "RecoveryAdvance"("claimId");

-- CreateIndex
CREATE INDEX "RecoveryAdvance_accountId_status_idx" ON "RecoveryAdvance"("accountId", "status");

-- CreateIndex
CREATE INDEX "RecoveryAdvance_dueAt_idx" ON "RecoveryAdvance"("dueAt");

-- CreateIndex
CREATE INDEX "RecoveryReceipt_accountId_receivedAt_idx" ON "RecoveryReceipt"("accountId", "receivedAt");

-- CreateIndex
CREATE INDEX "RecoveryAllocation_receiptId_idx" ON "RecoveryAllocation"("receiptId");

-- CreateIndex
CREATE INDEX "RecoveryAllocation_claimId_idx" ON "RecoveryAllocation"("claimId");

-- CreateIndex
CREATE INDEX "RecoveryAllocation_advanceId_idx" ON "RecoveryAllocation"("advanceId");

-- AddForeignKey
ALTER TABLE "RecoveryAcknowledgment" ADD CONSTRAINT "RecoveryAcknowledgment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RecoveryAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAcknowledgment" ADD CONSTRAINT "RecoveryAcknowledgment_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "RecoveryPayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAdvance" ADD CONSTRAINT "RecoveryAdvance_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "RecoveryClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAdvance" ADD CONSTRAINT "RecoveryAdvance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RecoveryAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAdvance" ADD CONSTRAINT "RecoveryAdvance_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "RecoveryPayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryReceipt" ADD CONSTRAINT "RecoveryReceipt_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RecoveryAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryReceipt" ADD CONSTRAINT "RecoveryReceipt_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "RecoveryPayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAllocation" ADD CONSTRAINT "RecoveryAllocation_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "RecoveryReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAllocation" ADD CONSTRAINT "RecoveryAllocation_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "RecoveryClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryAllocation" ADD CONSTRAINT "RecoveryAllocation_advanceId_fkey" FOREIGN KEY ("advanceId") REFERENCES "RecoveryAdvance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

