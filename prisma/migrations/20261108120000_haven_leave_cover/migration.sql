-- AlterTable
ALTER TABLE "StaffLeaveRequest" ADD COLUMN     "coverId" TEXT;

-- AddForeignKey
ALTER TABLE "StaffLeaveRequest" ADD CONSTRAINT "StaffLeaveRequest_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

