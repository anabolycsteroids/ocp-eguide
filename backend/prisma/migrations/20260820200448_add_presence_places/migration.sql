-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('ACTIVE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('AVAILABLE', 'BUSY', 'FULL', 'CLOSED');

-- CreateTable
CREATE TABLE "Presence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PresenceStatus" NOT NULL DEFAULT 'OFFLINE',
    "statusNote" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'FACILITY',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "status" "PlaceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceOccupancy" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "status" "PlaceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceOccupancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Presence_userId_key" ON "Presence"("userId");

-- CreateIndex
CREATE INDEX "Presence_userId_idx" ON "Presence"("userId");

-- CreateIndex
CREATE INDEX "Presence_status_idx" ON "Presence"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Place_code_key" ON "Place"("code");

-- CreateIndex
CREATE INDEX "Place_code_idx" ON "Place"("code");

-- CreateIndex
CREATE INDEX "Place_status_idx" ON "Place"("status");

-- CreateIndex
CREATE INDEX "PlaceOccupancy_placeId_idx" ON "PlaceOccupancy"("placeId");

-- CreateIndex
CREATE INDEX "PlaceOccupancy_recordedAt_idx" ON "PlaceOccupancy"("recordedAt");

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceOccupancy" ADD CONSTRAINT "PlaceOccupancy_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
