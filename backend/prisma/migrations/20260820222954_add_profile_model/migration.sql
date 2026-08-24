-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileId" TEXT;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "emailSlug" TEXT,
    "category" TEXT NOT NULL,
    "department" TEXT,
    "dashboardRoute" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_emailSlug_key" ON "Profile"("emailSlug");

-- CreateIndex
CREATE INDEX "Profile_slug_idx" ON "Profile"("slug");

-- CreateIndex
CREATE INDEX "Profile_category_idx" ON "Profile"("category");

-- CreateIndex
CREATE INDEX "User_profileId_idx" ON "User"("profileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
