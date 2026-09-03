/*
  Warnings:

  - You are about to drop the column `active` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `available` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Author" DROP COLUMN "active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "active",
DROP COLUMN "available",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isAvailableForLoan" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "active",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
