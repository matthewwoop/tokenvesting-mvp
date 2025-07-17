-- CreateTable
CREATE TABLE "VestingSchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "purchasePrice" DOUBLE PRECISION,
    "purchaseDate" TIMESTAMP(3),

    CONSTRAINT "VestingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlockEvent" (
    "id" TEXT NOT NULL,
    "vestingScheduleId" TEXT NOT NULL,
    "unlockDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,

    CONSTRAINT "UnlockEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DLOMCalculation" (
    "id" TEXT NOT NULL,
    "vestingScheduleId" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalUnlocked" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalLocked" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discountPercent" DOUBLE PRECISION,
    "discountedValue" DOUBLE PRECISION,
    "resultsJson" JSONB NOT NULL,

    CONSTRAINT "DLOMCalculation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnlockEvent" ADD CONSTRAINT "UnlockEvent_vestingScheduleId_fkey" FOREIGN KEY ("vestingScheduleId") REFERENCES "VestingSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DLOMCalculation" ADD CONSTRAINT "DLOMCalculation_vestingScheduleId_fkey" FOREIGN KEY ("vestingScheduleId") REFERENCES "VestingSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
