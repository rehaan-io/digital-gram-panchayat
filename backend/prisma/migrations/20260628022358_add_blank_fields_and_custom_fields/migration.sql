-- AlterTable
ALTER TABLE "AboutGP" ADD COLUMN     "apiicEstate04" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "apiicEstate37" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "apiicTotalAcres" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "communityHallLocation" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "fposInGp" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "libraryLocation" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "misappropriationAmount" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "misappropriationCases" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "npa" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "pnpa" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "recoveryAmount" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "savingsAchievement" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "savingsPercentage" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "savingsTarget" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "sriNidhiAmount" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "sriNidhiLoansGranted" TEXT NOT NULL DEFAULT '-';

-- CreateTable
CREATE TABLE "CustomSectionField" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomSectionField_pkey" PRIMARY KEY ("id")
);
