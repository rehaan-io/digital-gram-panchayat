-- CreateTable
CREATE TABLE "AboutGP" (
    "id" TEXT NOT NULL,
    "gpName" TEXT NOT NULL,
    "mandal" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "formationDetails" TEXT NOT NULL,
    "proceedingsNumber" TEXT NOT NULL,
    "gpExtent" TEXT NOT NULL,
    "panchayatSecretary" TEXT NOT NULL,
    "executiveOfficer" TEXT NOT NULL,
    "malePopulation" INTEGER NOT NULL,
    "femalePopulation" INTEGER NOT NULL,
    "population" INTEGER NOT NULL,
    "scPopulation" INTEGER NOT NULL,
    "stPopulation" INTEGER NOT NULL,
    "totalAssessments" INTEGER NOT NULL,
    "auditStatus" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutGP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Official" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "photo" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Official_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterDetails" (
    "id" TEXT NOT NULL,
    "totalWaterSchemes" INTEGER NOT NULL,
    "privateConnections" INTEGER NOT NULL,
    "publicConnections" INTEGER NOT NULL,
    "handPumps" INTEGER NOT NULL,
    "privateTapFeeDemand" DOUBLE PRECISION NOT NULL,
    "totalOHSRs" INTEGER NOT NULL,
    "totalGLSRs" INTEGER NOT NULL,
    "totalDirectPumping" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OHSR" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "pumpingCapacity" DOUBLE PRECISION,
    "location" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OHSR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GLSR" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "pumpingCapacity" DOUBLE PRECISION,
    "location" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GLSR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectPumping" (
    "id" TEXT NOT NULL,
    "pumpName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectPumping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreetLightDetails" (
    "id" TEXT NOT NULL,
    "totalPoles" INTEGER NOT NULL,
    "totalLEDs" INTEGER NOT NULL,
    "lightingStaff" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreetLightDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreetLightAsset" (
    "id" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "poleCount" INTEGER NOT NULL,
    "ledCount" INTEGER NOT NULL,
    "workingStatus" TEXT NOT NULL,
    "lastMaintenance" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreetLightAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRevenue" (
    "id" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "houseTax" DOUBLE PRECISION NOT NULL,
    "libraryCess" DOUBLE PRECISION NOT NULL,
    "waterTax" DOUBLE PRECISION NOT NULL,
    "lightingTax" DOUBLE PRECISION NOT NULL,
    "drainageTax" DOUBLE PRECISION NOT NULL,
    "sportsTax" DOUBLE PRECISION NOT NULL,
    "fireCess" DOUBLE PRECISION NOT NULL,
    "totalDemand" DOUBLE PRECISION NOT NULL,
    "houseTaxCollection" DOUBLE PRECISION NOT NULL,
    "collectionPercentage" DOUBLE PRECISION NOT NULL,
    "nonTaxDemand" DOUBLE PRECISION NOT NULL,
    "nonTaxCollection" DOUBLE PRECISION NOT NULL,
    "pendingAmount" DOUBLE PRECISION NOT NULL,
    "generalFund" DOUBLE PRECISION NOT NULL,
    "tfc" DOUBLE PRECISION NOT NULL,
    "sfc" DOUBLE PRECISION NOT NULL,
    "ffc" DOUBLE PRECISION NOT NULL,
    "fifteenthFC" DOUBLE PRECISION NOT NULL,
    "otherGrants" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthDetails" (
    "id" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "healthCentre" TEXT NOT NULL,
    "ashaWorkers" INTEGER NOT NULL,
    "anms" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthStaff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "boys" INTEGER NOT NULL,
    "girls" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnganwadiCentre" (
    "id" TEXT NOT NULL,
    "centreName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "boys" INTEGER NOT NULL,
    "girls" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnganwadiCentre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnganwadiStats" (
    "id" TEXT NOT NULL,
    "samChildren" INTEGER NOT NULL,
    "mamChildren" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnganwadiStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MgnregsDetails" (
    "id" TEXT NOT NULL,
    "jobCards" INTEGER NOT NULL,
    "activeJobCards" INTEGER NOT NULL,
    "works" INTEGER NOT NULL,
    "estimateCost" DOUBLE PRECISION NOT NULL,
    "gokulamSheds" INTEGER NOT NULL,
    "sramikaSanghalu" INTEGER NOT NULL,
    "completedGokulam" INTEGER NOT NULL,
    "inProgressGokulam" INTEGER NOT NULL,
    "notStartedGokulam" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MgnregsDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MgnregsWork" (
    "id" TEXT NOT NULL,
    "workName" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MgnregsWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PensionCategory" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "beneficiaries" INTEGER NOT NULL,
    "monthlyAmount" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PensionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgricultureStats" (
    "id" TEXT NOT NULL,
    "cultivableLand" DOUBLE PRECISION NOT NULL,
    "rabiArea" DOUBLE PRECISION NOT NULL,
    "landSown" DOUBLE PRECISION NOT NULL,
    "groundnutQuintals" DOUBLE PRECISION NOT NULL,
    "polamBadies" INTEGER NOT NULL,
    "samplesCollected" INTEGER NOT NULL,
    "samplesAnalysed" INTEGER NOT NULL,
    "soilCards" INTEGER NOT NULL,
    "pmKisan" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgricultureStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorticultureStats" (
    "id" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "production" DOUBLE PRECISION NOT NULL,
    "midhPhysical" INTEGER NOT NULL,
    "midhTotal" DOUBLE PRECISION NOT NULL,
    "rkvmPhysical" INTEGER NOT NULL,
    "rkvmTotal" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorticultureStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalHusbandryStats" (
    "id" TEXT NOT NULL,
    "cattle" INTEGER NOT NULL,
    "buffaloes" INTEGER NOT NULL,
    "sheep" INTEGER NOT NULL,
    "goats" INTEGER NOT NULL,
    "vaccination" DOUBLE PRECISION NOT NULL,
    "insurance" DOUBLE PRECISION NOT NULL,
    "projects" DOUBLE PRECISION NOT NULL,
    "subsidy" DOUBLE PRECISION NOT NULL,
    "fodderDev" DOUBLE PRECISION NOT NULL,
    "targetFodder" DOUBLE PRECISION NOT NULL,
    "pashubheemaInsured" INTEGER NOT NULL,
    "treatedSanchara" INTEGER NOT NULL,
    "gokulamInaugurated" INTEGER NOT NULL,
    "gokulamSanctioned" INTEGER NOT NULL,
    "nlmSanctioned" INTEGER NOT NULL,
    "nlmCompleted" INTEGER NOT NULL,
    "nlmInProgress" INTEGER NOT NULL,
    "nlmSubsidy" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimalHusbandryStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoGroup" (
    "id" TEXT NOT NULL,
    "voName" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "members" INTEGER NOT NULL,
    "president" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShgStats" (
    "id" TEXT NOT NULL,
    "totalSHGs" INTEGER NOT NULL,
    "activeSHGs" INTEGER NOT NULL,
    "loans" DOUBLE PRECISION NOT NULL,
    "savings" DOUBLE PRECISION NOT NULL,
    "recovery" DOUBLE PRECISION NOT NULL,
    "pmjby" INTEGER NOT NULL,
    "pmsby" INTEGER NOT NULL,
    "unnati" INTEGER NOT NULL,
    "nutriGardens" INTEGER NOT NULL,
    "sriNidhi" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShgStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityAssetItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityAssetItem_pkey" PRIMARY KEY ("id")
);
