-- Quick fix: Set all timestamps to reasonable values
-- Since this is test/dev data, we'll set everything to NOW

UPDATE "User" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "Resume" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "Company" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "Content" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "CoverLetter" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "CoverLetterContent" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "JobApplication" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "Section" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "Tag" SET "createdAt" = CURRENT_TIMESTAMP;
UPDATE "Contact" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "ContactMessage" SET "createdAt" = CURRENT_TIMESTAMP;
UPDATE "Interview" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "JobApplicationQuestion" SET "createdAt" = CURRENT_TIMESTAMP;
UPDATE "StoryBlock" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "AnswerSnippet" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;
UPDATE "Secrets" SET "lastSignedIn" = CURRENT_TIMESTAMP WHERE "lastSignedIn" IS NOT NULL;

SELECT 'Quick fix complete - all timestamps set to CURRENT_TIMESTAMP' as status;




