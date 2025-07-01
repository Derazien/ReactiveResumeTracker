-- CreateTable
CREATE TABLE "UserLLMSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'OPENAI',
    "useSystemDefaultAsBackup" BOOLEAN NOT NULL DEFAULT false,
    "openaiApiKey" TEXT,
    "openaiModel" TEXT DEFAULT 'gpt-4-turbo-preview',
    "openaiBaseUrl" TEXT,
    "anthropicApiKey" TEXT,
    "anthropicModel" TEXT DEFAULT 'claude-3-5-sonnet-20241022',
    "ollamaApiKey" TEXT DEFAULT 'sk-1234567890abcdef',
    "ollamaBaseUrl" TEXT DEFAULT 'http://localhost:11434/v1',
    "ollamaModel" TEXT DEFAULT 'llama3:8b',
    "maxTokens" INTEGER NOT NULL DEFAULT 4000,
    "temperature" REAL NOT NULL DEFAULT 0.1,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserLLMSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContentLibrary" (
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
    CONSTRAINT "ContentLibrary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ContentLibrary" ("achievements", "company", "content", "createdAt", "description", "endDate", "id", "location", "position", "skills", "startDate", "title", "type", "updatedAt", "userId") SELECT "achievements", "company", "content", "createdAt", "description", "endDate", "id", "location", "position", "skills", "startDate", "title", "type", "updatedAt", "userId" FROM "ContentLibrary";
DROP TABLE "ContentLibrary";
ALTER TABLE "new_ContentLibrary" RENAME TO "ContentLibrary";
CREATE INDEX "ContentLibrary_userId_type_idx" ON "ContentLibrary"("userId", "type");
CREATE INDEX "ContentLibrary_userId_createdAt_idx" ON "ContentLibrary"("userId", "createdAt");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "userType" TEXT NOT NULL DEFAULT 'GENERAL_CONSUMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "provider" TEXT NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "locale", "name", "picture", "provider", "twoFactorEnabled", "updatedAt", "username") SELECT "createdAt", "email", "emailVerified", "id", "locale", "name", "picture", "provider", "twoFactorEnabled", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserLLMSettings_userId_key" ON "UserLLMSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLLMSettings_userId_id_key" ON "UserLLMSettings"("userId", "id");
