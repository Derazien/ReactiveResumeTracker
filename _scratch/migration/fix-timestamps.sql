-- Fix User table
UPDATE "User" 
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Resume table
UPDATE "Resume"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Company table
UPDATE "Company"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Content table
UPDATE "Content"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix CoverLetter table
UPDATE "CoverLetter"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix CoverLetterContent table
UPDATE "CoverLetterContent"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix JobApplication table
UPDATE "JobApplication"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Section table
UPDATE "Section"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Tag table (only has createdAt)
UPDATE "Tag"
SET "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Contact table
UPDATE "Contact"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix ContactMessage table
UPDATE "ContactMessage"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Interview table
UPDATE "Interview"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix JobApplicationQuestion table (only has createdAt)
UPDATE "JobApplicationQuestion"
SET "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix StoryBlock table
UPDATE "StoryBlock"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix AnswerSnippet table
UPDATE "AnswerSnippet"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Secrets.lastSignedIn (special case)
UPDATE "Secrets"
SET "lastSignedIn" = to_timestamp(EXTRACT(EPOCH FROM "lastSignedIn") / 1000000)
WHERE "lastSignedIn" IS NOT NULL AND EXTRACT(YEAR FROM "lastSignedIn") > 2100;

-- Fix any remaining NULL timestamps
UPDATE "User" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
