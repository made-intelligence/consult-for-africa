-- CreateEnum
CREATE TYPE "EstateArea" AS ENUM ('BANANA_ISLAND', 'OSBORNE_FORESHORE');

-- CreateEnum
CREATE TYPE "EstateUnitStatus" AS ENUM ('OCCUPIED', 'VACANT', 'OWNER_OCCUPIED', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "EstateDieselPricingMode" AS ENUM ('MANUAL_RATE', 'WEIGHTED_AVERAGE');

-- CreateEnum
CREATE TYPE "EstateServiceChargeCadence" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "EstateStaffRole" AS ENUM ('SECURITY', 'TECHNICIAN', 'SUPERVISOR', 'CLEANER', 'GARDENER', 'POOL', 'SERVICE_ENGINEER');

-- CreateEnum
CREATE TYPE "EstateRunStatus" AS ENUM ('RUNNING', 'STOPPED', 'ALLOCATED', 'VOID');

-- CreateEnum
CREATE TYPE "EstateLedgerAccount" AS ENUM ('DIESEL', 'SERVICE_CHARGE');

-- CreateEnum
CREATE TYPE "EstateLedgerKind" AS ENUM ('DIESEL_TOPUP', 'DIESEL_USAGE', 'SERVICE_CHARGE_PAYMENT', 'SERVICE_CHARGE_LEVY', 'ADJUSTMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "EstateIssueCategory" AS ENUM ('POWER', 'WATER', 'SECURITY', 'PLUMBING', 'ELECTRICAL', 'AIR_CONDITIONING', 'APPLIANCE', 'STRUCTURAL', 'CLEANING', 'WASTE', 'LIFT', 'PEST', 'POOL', 'INTERNET', 'OTHER');

-- CreateEnum
CREATE TYPE "EstateIssuePriority" AS ENUM ('EMERGENCY', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "EstateIssueStatus" AS ENUM ('SUBMITTED', 'ACKNOWLEDGED', 'SCHEDULED', 'IN_PROGRESS', 'AWAITING_PARTS', 'RESOLVED', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "EstateAuthorType" AS ENUM ('TENANT', 'STAFF', 'OFFICE');

-- CreateEnum
CREATE TYPE "EstateExpenseCategory" AS ENUM ('SECURITY', 'DIESEL', 'WATER', 'REPAIRS', 'MAINTENANCE', 'CLEANING', 'WASTE', 'INSURANCE', 'LEVY', 'RESERVE', 'ADMIN', 'OTHER');

-- CreateTable
CREATE TABLE "EstateBuilding" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "area" "EstateArea" NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "litresPerHour" DECIMAL(6,2) NOT NULL DEFAULT 10,
    "dieselPricePerLitre" DECIMAL(10,2) NOT NULL,
    "dieselPricingMode" "EstateDieselPricingMode" NOT NULL DEFAULT 'MANUAL_RATE',
    "allocationNote" TEXT,
    "dieselLowBalanceNaira" DECIMAL(14,2) NOT NULL DEFAULT 50000,
    "dieselLowCoverDays" INTEGER NOT NULL DEFAULT 7,
    "generatorLabel" TEXT,
    "generatorKva" INTEGER,
    "tankCapacityL" INTEGER,
    "serviceIntervalHours" INTEGER NOT NULL DEFAULT 200,
    "serviceWarnNotifiedAt" TIMESTAMP(3),
    "serviceDueNotifiedAt" TIMESTAMP(3),
    "hasPool" BOOLEAN NOT NULL DEFAULT false,
    "serviceChargeNaira" DECIMAL(14,2),
    "serviceChargeCadence" "EstateServiceChargeCadence" NOT NULL DEFAULT 'ANNUAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateBuilding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateUnit" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "dieselShare" DECIMAL(6,2) NOT NULL DEFAULT 1,
    "serviceChargeNaira" DECIMAL(14,2),
    "status" "EstateUnitStatus" NOT NULL DEFAULT 'OCCUPIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateTenant" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "movedInAt" TIMESTAMP(3),
    "movedOutAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "accessToken" TEXT NOT NULL,
    "tokenIssuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateStaff" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT,
    "area" "EstateArea",
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "EstateStaffRole" NOT NULL DEFAULT 'SECURITY',
    "accessToken" TEXT NOT NULL,
    "tokenIssuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinHash" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateGeneratorRun" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "startMeterHours" DECIMAL(10,1),
    "endMeterHours" DECIMAL(10,1),
    "startPhotoKey" TEXT,
    "endPhotoKey" TEXT,
    "runMinutes" INTEGER,
    "litresPerHour" DECIMAL(6,2),
    "pricePerLitre" DECIMAL(10,2),
    "litresUsed" DECIMAL(10,2),
    "costNaira" DECIMAL(14,2),
    "status" "EstateRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedByStaffId" TEXT,
    "endedByStaffId" TEXT,
    "recordedById" TEXT,
    "note" TEXT,
    "allocatedAt" TIMESTAMP(3),
    "ownerCostNaira" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateGeneratorRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateDieselDelivery" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL,
    "litres" DECIMAL(10,2) NOT NULL,
    "pricePerLitre" DECIMAL(10,2) NOT NULL,
    "totalNaira" DECIMAL(14,2) NOT NULL,
    "supplier" TEXT,
    "waybillRef" TEXT,
    "receiptKey" TEXT,
    "tankBeforeL" DECIMAL(10,2),
    "tankAfterL" DECIMAL(10,2),
    "recordedByStaffId" TEXT,
    "recordedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateDieselDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateTankReading" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL,
    "litres" DECIMAL(10,2) NOT NULL,
    "photoKey" TEXT,
    "recordedByStaffId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateTankReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateLedgerEntry" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "account" "EstateLedgerAccount" NOT NULL,
    "kind" "EstateLedgerKind" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "litres" DECIMAL(10,2),
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "generatorRunId" TEXT,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "receiptKey" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateIssue" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT,
    "tenantId" TEXT,
    "category" "EstateIssueCategory" NOT NULL,
    "priority" "EstateIssuePriority" NOT NULL DEFAULT 'NORMAL',
    "status" "EstateIssueStatus" NOT NULL DEFAULT 'SUBMITTED',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoKeys" TEXT[],
    "assignedToId" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "respondBy" TIMESTAMP(3),
    "resolveBy" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "costNaira" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateIssueUpdate" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "authorType" "EstateAuthorType" NOT NULL,
    "authorName" TEXT NOT NULL,
    "tenantId" TEXT,
    "staffId" TEXT,
    "userId" TEXT,
    "body" TEXT,
    "photoKeys" TEXT[],
    "statusTo" "EstateIssueStatus",
    "visibleToTenant" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateIssueUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateExpense" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT,
    "category" "EstateExpenseCategory" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "payee" TEXT NOT NULL,
    "description" TEXT,
    "receiptKey" TEXT,
    "issueId" TEXT,
    "deliveryId" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateNotice" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstateNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateGeneratorService" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "servicedAt" TIMESTAMP(3) NOT NULL,
    "hoursAtService" DECIMAL(10,2) NOT NULL,
    "meterHoursAtService" DECIMAL(10,1),
    "performedBy" TEXT NOT NULL,
    "performedById" TEXT,
    "costNaira" DECIMAL(14,2),
    "workDone" TEXT,
    "receiptKey" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateGeneratorService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateRateChange" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" DECIMAL(12,2) NOT NULL,
    "newValue" DECIMAL(12,2) NOT NULL,
    "reason" TEXT,
    "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateRateChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EstateBuilding_slug_key" ON "EstateBuilding"("slug");

-- CreateIndex
CREATE INDEX "EstateBuilding_area_idx" ON "EstateBuilding"("area");

-- CreateIndex
CREATE INDEX "EstateUnit_status_idx" ON "EstateUnit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EstateUnit_buildingId_label_key" ON "EstateUnit"("buildingId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "EstateTenant_accessToken_key" ON "EstateTenant"("accessToken");

-- CreateIndex
CREATE INDEX "EstateTenant_unitId_active_idx" ON "EstateTenant"("unitId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "EstateStaff_accessToken_key" ON "EstateStaff"("accessToken");

-- CreateIndex
CREATE INDEX "EstateStaff_buildingId_active_idx" ON "EstateStaff"("buildingId", "active");

-- CreateIndex
CREATE INDEX "EstateStaff_area_active_idx" ON "EstateStaff"("area", "active");

-- CreateIndex
CREATE INDEX "EstateGeneratorRun_buildingId_startedAt_idx" ON "EstateGeneratorRun"("buildingId", "startedAt");

-- CreateIndex
CREATE INDEX "EstateGeneratorRun_status_idx" ON "EstateGeneratorRun"("status");

-- CreateIndex
CREATE INDEX "EstateDieselDelivery_buildingId_deliveredAt_idx" ON "EstateDieselDelivery"("buildingId", "deliveredAt");

-- CreateIndex
CREATE INDEX "EstateTankReading_buildingId_readAt_idx" ON "EstateTankReading"("buildingId", "readAt");

-- CreateIndex
CREATE INDEX "EstateLedgerEntry_unitId_account_occurredAt_idx" ON "EstateLedgerEntry"("unitId", "account", "occurredAt");

-- CreateIndex
CREATE INDEX "EstateLedgerEntry_generatorRunId_idx" ON "EstateLedgerEntry"("generatorRunId");

-- CreateIndex
CREATE INDEX "EstateLedgerEntry_kind_idx" ON "EstateLedgerEntry"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "EstateIssue_reference_key" ON "EstateIssue"("reference");

-- CreateIndex
CREATE INDEX "EstateIssue_buildingId_status_idx" ON "EstateIssue"("buildingId", "status");

-- CreateIndex
CREATE INDEX "EstateIssue_status_priority_idx" ON "EstateIssue"("status", "priority");

-- CreateIndex
CREATE INDEX "EstateIssue_unitId_idx" ON "EstateIssue"("unitId");

-- CreateIndex
CREATE INDEX "EstateIssue_createdAt_idx" ON "EstateIssue"("createdAt");

-- CreateIndex
CREATE INDEX "EstateIssueUpdate_issueId_createdAt_idx" ON "EstateIssueUpdate"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "EstateExpense_buildingId_paidAt_idx" ON "EstateExpense"("buildingId", "paidAt");

-- CreateIndex
CREATE INDEX "EstateExpense_category_idx" ON "EstateExpense"("category");

-- CreateIndex
CREATE INDEX "EstateNotice_buildingId_publishedAt_idx" ON "EstateNotice"("buildingId", "publishedAt");

-- CreateIndex
CREATE INDEX "EstateGeneratorService_buildingId_servicedAt_idx" ON "EstateGeneratorService"("buildingId", "servicedAt");

-- CreateIndex
CREATE INDEX "EstateRateChange_buildingId_effectiveAt_idx" ON "EstateRateChange"("buildingId", "effectiveAt");

-- AddForeignKey
ALTER TABLE "EstateUnit" ADD CONSTRAINT "EstateUnit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateTenant" ADD CONSTRAINT "EstateTenant_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "EstateUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateStaff" ADD CONSTRAINT "EstateStaff_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateGeneratorRun" ADD CONSTRAINT "EstateGeneratorRun_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateGeneratorRun" ADD CONSTRAINT "EstateGeneratorRun_startedByStaffId_fkey" FOREIGN KEY ("startedByStaffId") REFERENCES "EstateStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateGeneratorRun" ADD CONSTRAINT "EstateGeneratorRun_endedByStaffId_fkey" FOREIGN KEY ("endedByStaffId") REFERENCES "EstateStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateGeneratorRun" ADD CONSTRAINT "EstateGeneratorRun_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateDieselDelivery" ADD CONSTRAINT "EstateDieselDelivery_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateDieselDelivery" ADD CONSTRAINT "EstateDieselDelivery_recordedByStaffId_fkey" FOREIGN KEY ("recordedByStaffId") REFERENCES "EstateStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateDieselDelivery" ADD CONSTRAINT "EstateDieselDelivery_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateTankReading" ADD CONSTRAINT "EstateTankReading_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateTankReading" ADD CONSTRAINT "EstateTankReading_recordedByStaffId_fkey" FOREIGN KEY ("recordedByStaffId") REFERENCES "EstateStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLedgerEntry" ADD CONSTRAINT "EstateLedgerEntry_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "EstateUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLedgerEntry" ADD CONSTRAINT "EstateLedgerEntry_generatorRunId_fkey" FOREIGN KEY ("generatorRunId") REFERENCES "EstateGeneratorRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateLedgerEntry" ADD CONSTRAINT "EstateLedgerEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssue" ADD CONSTRAINT "EstateIssue_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssue" ADD CONSTRAINT "EstateIssue_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "EstateUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssue" ADD CONSTRAINT "EstateIssue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "EstateTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssue" ADD CONSTRAINT "EstateIssue_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "EstateStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssueUpdate" ADD CONSTRAINT "EstateIssueUpdate_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "EstateIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssueUpdate" ADD CONSTRAINT "EstateIssueUpdate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "EstateTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssueUpdate" ADD CONSTRAINT "EstateIssueUpdate_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "EstateStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateIssueUpdate" ADD CONSTRAINT "EstateIssueUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateExpense" ADD CONSTRAINT "EstateExpense_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateExpense" ADD CONSTRAINT "EstateExpense_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "EstateIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateExpense" ADD CONSTRAINT "EstateExpense_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "EstateDieselDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateExpense" ADD CONSTRAINT "EstateExpense_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateNotice" ADD CONSTRAINT "EstateNotice_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateNotice" ADD CONSTRAINT "EstateNotice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateGeneratorService" ADD CONSTRAINT "EstateGeneratorService_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateGeneratorService" ADD CONSTRAINT "EstateGeneratorService_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "EstateStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateGeneratorService" ADD CONSTRAINT "EstateGeneratorService_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateRateChange" ADD CONSTRAINT "EstateRateChange_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "EstateBuilding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateRateChange" ADD CONSTRAINT "EstateRateChange_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

