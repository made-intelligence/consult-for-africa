-- Hospital sales: one directory of hospitals, a stage per product, and
-- tracked outbound campaigns. Additive only.

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "importKey" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "HospitalContact" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalProductStage" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'TARGET',
    "leadId" TEXT,
    "note" TEXT,
    "stageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalProductStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesCampaign" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "dailyCap" INTEGER NOT NULL DEFAULT 100,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesCampaignSend" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "messageId" TEXT,
    "error" TEXT,
    "clickedAt" TIMESTAMP(3),
    "enquiredAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesCampaignSend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_importKey_key" ON "Hospital"("importKey");
CREATE INDEX "HospitalContact_email_idx" ON "HospitalContact"("email");
CREATE UNIQUE INDEX "HospitalContact_hospitalId_email_key" ON "HospitalContact"("hospitalId", "email");
CREATE INDEX "HospitalProductStage_product_stage_idx" ON "HospitalProductStage"("product", "stage");
CREATE UNIQUE INDEX "HospitalProductStage_hospitalId_product_key" ON "HospitalProductStage"("hospitalId", "product");
CREATE INDEX "SalesCampaign_product_status_idx" ON "SalesCampaign"("product", "status");
CREATE UNIQUE INDEX "SalesCampaignSend_token_key" ON "SalesCampaignSend"("token");
CREATE INDEX "SalesCampaignSend_campaignId_status_idx" ON "SalesCampaignSend"("campaignId", "status");
CREATE INDEX "SalesCampaignSend_hospitalId_idx" ON "SalesCampaignSend"("hospitalId");
CREATE UNIQUE INDEX "SalesCampaignSend_campaignId_contactId_key" ON "SalesCampaignSend"("campaignId", "contactId");

-- AddForeignKey
ALTER TABLE "HospitalContact" ADD CONSTRAINT "HospitalContact_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HospitalProductStage" ADD CONSTRAINT "HospitalProductStage_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesCampaignSend" ADD CONSTRAINT "SalesCampaignSend_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SalesCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesCampaignSend" ADD CONSTRAINT "SalesCampaignSend_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesCampaignSend" ADD CONSTRAINT "SalesCampaignSend_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "HospitalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
