/*
  Warnings:

  - You are about to drop the column `photo` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AgricultureStats" ADD COLUMN     "cropInsuranceFarmers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "heavyRainAffectedFarmers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "heavyRainDamageAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "heavyRainDamageArea" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "photo";
