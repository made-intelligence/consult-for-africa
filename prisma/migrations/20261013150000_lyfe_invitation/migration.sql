-- CreateTable
CREATE TABLE "LyfeInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "onBehalfOf" TEXT,
    "source" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LyfeInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LyfeInvitation_email_key" ON "LyfeInvitation"("email");

-- CreateIndex
CREATE INDEX "LyfeInvitation_sentAt_idx" ON "LyfeInvitation"("sentAt");
