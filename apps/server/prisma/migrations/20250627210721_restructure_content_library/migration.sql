/*
  Warnings:

  - You are about to drop the `ContentLibrary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "ContentLibrary_userId_createdAt_idx";

-- DropIndex
DROP INDEX "ContentLibrary_userId_type_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ContentLibrary";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "fieldRequirements" TEXT NOT NULL DEFAULT '{}',
    "validation" TEXT NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isCustomizable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL DEFAULT '{}',
    "sectionId" TEXT NOT NULL,
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
    "proficiencyLevel" INTEGER,
    "category" TEXT,
    "issuer" TEXT,
    "url" TEXT,
    "contactPerson" TEXT,
    "contactInfo" TEXT,
    "isPresent" BOOLEAN,
    "courses" TEXT NOT NULL DEFAULT '[]',
    "score" TEXT,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Content_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContentTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ContentTag_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ContentTag" ("contentId", "id", "tagId") SELECT "contentId", "id", "tagId" FROM "ContentTag";
DROP TABLE "ContentTag";
ALTER TABLE "new_ContentTag" RENAME TO "ContentTag";
CREATE UNIQUE INDEX "ContentTag_contentId_tagId_key" ON "ContentTag"("contentId", "tagId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Section_key_key" ON "Section"("key");

-- CreateIndex
CREATE INDEX "Section_key_idx" ON "Section"("key");

-- CreateIndex
CREATE INDEX "Section_order_idx" ON "Section"("order");

-- CreateIndex
CREATE INDEX "Content_userId_sectionId_idx" ON "Content"("userId", "sectionId");

-- CreateIndex
CREATE INDEX "Content_userId_createdAt_idx" ON "Content"("userId", "createdAt");
