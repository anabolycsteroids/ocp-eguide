-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'APPROVED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visitorId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "placeId" TEXT,
    "qrCodeId" TEXT,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visit_qrCodeId_key" ON "Visit"("qrCodeId");

-- CreateIndex
CREATE INDEX "Visit_visitorId_idx" ON "Visit"("visitorId");

-- CreateIndex
CREATE INDEX "Visit_hostId_idx" ON "Visit"("hostId");

-- CreateIndex
CREATE INDEX "Visit_status_idx" ON "Visit"("status");

-- CreateIndex
CREATE INDEX "Visit_scheduledDate_idx" ON "Visit"("scheduledDate");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QrCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
