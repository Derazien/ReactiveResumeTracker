-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "provider" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Secrets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT,
    "lastSignedIn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationToken" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT NOT NULL DEFAULT '[]',
    "refreshToken" TEXT,
    "resetToken" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Secrets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "jobApplicationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Resume_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Statistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "resumeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Statistics_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentLibrary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL DEFAULT '{}',
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "company" TEXT,
    "position" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "location" TEXT,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "achievements" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "ContentLibrary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ContentTag_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentLibrary" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT NOT NULL DEFAULT '[]',
    "extractedTags" TEXT NOT NULL DEFAULT '[]',
    "url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "appliedDate" DATETIME,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoverLetter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoverLetter_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "audioUrl" TEXT,
    "insights" TEXT,
    "jobApplicationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Interview_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "llmProvider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "contentIds" TEXT NOT NULL DEFAULT '[]',
    "jobApplicationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedContent_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Secrets_resetToken_key" ON "Secrets"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Secrets_userId_key" ON "Secrets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Secrets_userId_id_key" ON "Secrets"("userId", "id");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_id_key" ON "Resume"("userId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_slug_key" ON "Resume"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Statistics_resumeId_key" ON "Statistics"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Statistics_resumeId_id_key" ON "Statistics"("resumeId", "id");

-- CreateIndex
CREATE INDEX "ContentLibrary_userId_type_idx" ON "ContentLibrary"("userId", "type");

-- CreateIndex
CREATE INDEX "ContentLibrary_userId_createdAt_idx" ON "ContentLibrary"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ContentTag_contentId_tagId_key" ON "ContentTag"("contentId", "tagId");

-- CreateIndex
CREATE INDEX "JobApplication_userId_status_idx" ON "JobApplication"("userId", "status");

-- CreateIndex
CREATE INDEX "JobApplication_userId_createdAt_idx" ON "JobApplication"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CoverLetter_jobApplicationId_idx" ON "CoverLetter"("jobApplicationId");

-- CreateIndex
CREATE INDEX "Interview_jobApplicationId_idx" ON "Interview"("jobApplicationId");

-- CreateIndex
CREATE INDEX "GeneratedContent_jobApplicationId_idx" ON "GeneratedContent"("jobApplicationId");
