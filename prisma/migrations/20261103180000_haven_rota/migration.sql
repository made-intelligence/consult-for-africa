-- CreateTable
CREATE TABLE "StaffRota" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "enteredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffRota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffShift" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffRota_clientId_department_month_key" ON "StaffRota"("clientId", "department", "month");

-- CreateIndex
CREATE UNIQUE INDEX "StaffShift_staffId_date_key" ON "StaffShift"("staffId", "date");

-- CreateIndex
CREATE INDEX "StaffShift_date_idx" ON "StaffShift"("date");

-- AddForeignKey
ALTER TABLE "StaffRota" ADD CONSTRAINT "StaffRota_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffRota" ADD CONSTRAINT "StaffRota_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffShift" ADD CONSTRAINT "StaffShift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
