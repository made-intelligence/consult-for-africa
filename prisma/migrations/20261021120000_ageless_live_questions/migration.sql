-- CreateTable
CREATE TABLE "AgelessQuestion" (
    "id" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "askerName" TEXT,
    "forWhom" TEXT,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgelessQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgelessQuestion_edition_hidden_votes_idx" ON "AgelessQuestion"("edition", "hidden", "votes");
