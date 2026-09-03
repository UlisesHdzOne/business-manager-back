/*
  Warnings:

  - The values [AUTHOR_INACTIVE] on the enum `BookInactiveReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookInactiveReason_new" AS ENUM ('MANUAL');
ALTER TABLE "Book" ALTER COLUMN "inactiveReason" TYPE "BookInactiveReason_new" USING ("inactiveReason"::text::"BookInactiveReason_new");
ALTER TYPE "BookInactiveReason" RENAME TO "BookInactiveReason_old";
ALTER TYPE "BookInactiveReason_new" RENAME TO "BookInactiveReason";
DROP TYPE "public"."BookInactiveReason_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_userId_fkey";

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
