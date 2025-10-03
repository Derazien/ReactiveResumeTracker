-- CORRECT timestamp conversion for SQLite milliseconds → PostgreSQL
-- SQLite stores as BIGINT milliseconds since epoch
-- PostgreSQL needs seconds since epoch

-- First, we need to treat the timestamps as text, convert to bigint, then to timestamp

-- User table
UPDATE "User" 
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Resume table
UPDATE "Resume"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Company table
UPDATE "Company"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Content table
UPDATE "Content"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- CoverLetter table
UPDATE "CoverLetter"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- CoverLetterContent table
UPDATE "CoverLetterContent"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- JobApplication table
UPDATE "JobApplication"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Section table
UPDATE "Section"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Tag table (only has createdAt)
UPDATE "Tag"
SET "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Contact table
UPDATE "Contact"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- ContactMessage table
UPDATE "ContactMessage"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Interview table
UPDATE "Interview"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- JobApplicationQuestion table (only has createdAt)
UPDATE "JobApplicationQuestion"
SET "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- StoryBlock table
UPDATE "StoryBlock"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- AnswerSnippet table
UPDATE "AnswerSnippet"
SET 
  "createdAt" = to_timestamp(CAST("createdAt" AS TEXT)::BIGINT / 1000.0),
  "updatedAt" = to_timestamp(CAST("updatedAt" AS TEXT)::BIGINT / 1000.0)
WHERE EXTRACT(YEAR FROM "createdAt") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

-- Fix Secrets.lastSignedIn (special case)
UPDATE "Secrets"
SET "lastSignedIn" = to_timestamp(CAST("lastSignedIn" AS TEXT)::BIGINT / 1000.0)
WHERE "lastSignedIn" IS NOT NULL AND EXTRACT(YEAR FROM "lastSignedIn") != EXTRACT(YEAR FROM CURRENT_TIMESTAMP);

SELECT 'Timestamp conversion complete!' as status;




