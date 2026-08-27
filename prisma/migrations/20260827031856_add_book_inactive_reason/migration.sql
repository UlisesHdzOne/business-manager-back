-- CreateEnum
CREATE TYPE "BookInactiveReason" AS ENUM ('AUTHOR_INACTIVE', 'MANUAL');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "inactiveReason" "BookInactiveReason";
