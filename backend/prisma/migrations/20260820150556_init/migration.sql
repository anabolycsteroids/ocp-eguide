-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE', 'INTERN', 'VISITOR', 'COLLABORATOR', 'PARTNER', 'SUPPLIER', 'SERVICE_PROVIDER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('DOCUMENT_REQUEST', 'ACCESS_REQUEST', 'MEETING_REQUEST', 'SUPERVISOR_REQUEST', 'GENERAL_REQUEST');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TASK_ASSIGNED', 'TASK_UPDATED', 'REQUEST_CREATED', 'REQUEST_UPDATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'SUPERVISOR_MESSAGE', 'GENERAL', 'ANNOUNCEMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LocationCategory" AS ENUM ('OFFICE', 'DEPARTMENT', 'FACILITY', 'MOSQUE', 'RECEPTION', 'PARKING', 'SAFETY', 'OTHER');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('MANAGEMENT', 'HUMAN_RESOURCES', 'IT', 'SECURITY', 'FINANCE', 'ENGINEERING', 'RECEPTION', 'MAINTENANCE', 'LOGISTICS', 'LEGAL', 'COMMUNICATION', 'RESEARCH', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "department" "Department" NOT NULL DEFAULT 'OTHER',
    "position" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE',
    "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" TEXT NOT NULL DEFAULT 'local',
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supervisorId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "university" TEXT,
    "major" TEXT,
    "educationLevel" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "mentorId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxInterns" INTEGER NOT NULL DEFAULT 5,
    "specializations" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupervisorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "InternshipStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "department" "Department" NOT NULL,
    "objectives" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "internId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternshipProgress" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentModule" TEXT,
    "totalModules" INTEGER NOT NULL DEFAULT 0,
    "completedModules" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "internshipId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "creatorId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "handlerId" TEXT,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "internshipId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "LocationCategory" NOT NULL DEFAULT 'OTHER',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "building" TEXT,
    "floor" TEXT,
    "roomNumber" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "locationId" TEXT,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_department_idx" ON "User"("department");

-- CreateIndex
CREATE INDEX "User_supervisorId_idx" ON "User"("supervisorId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InternProfile_userId_key" ON "InternProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SupervisorProfile_userId_key" ON "SupervisorProfile"("userId");

-- CreateIndex
CREATE INDEX "Internship_internId_idx" ON "Internship"("internId");

-- CreateIndex
CREATE INDEX "Internship_supervisorId_idx" ON "Internship"("supervisorId");

-- CreateIndex
CREATE INDEX "Internship_status_idx" ON "Internship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipProgress_internshipId_key" ON "InternshipProgress"("internshipId");

-- CreateIndex
CREATE INDEX "Task_internshipId_idx" ON "Task"("internshipId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Request_creatorId_idx" ON "Request"("creatorId");

-- CreateIndex
CREATE INDEX "Request_handlerId_idx" ON "Request"("handlerId");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_type_idx" ON "Request"("type");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Location_category_idx" ON "Location"("category");

-- CreateIndex
CREATE INDEX "Location_building_idx" ON "Location"("building");

-- CreateIndex
CREATE UNIQUE INDEX "QrCode_token_key" ON "QrCode"("token");

-- CreateIndex
CREATE INDEX "QrCode_token_idx" ON "QrCode"("token");

-- CreateIndex
CREATE INDEX "QrCode_active_idx" ON "QrCode"("active");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternProfile" ADD CONSTRAINT "InternProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorProfile" ADD CONSTRAINT "SupervisorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_internId_fkey" FOREIGN KEY ("internId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipProgress" ADD CONSTRAINT "InternshipProgress_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
