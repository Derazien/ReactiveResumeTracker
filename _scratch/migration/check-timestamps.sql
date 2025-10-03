-- Check timestamps in User table
SELECT id, email, "createdAt", "updatedAt" FROM "User" LIMIT 1;

-- Check timestamps in Company table
SELECT id, name, "createdAt", "updatedAt" FROM "Company" LIMIT 2;

-- Check timestamps in Resume table
SELECT id, title, "createdAt", "updatedAt" FROM "Resume" LIMIT 2;

-- Check for NULL timestamps across all tables
SELECT 
  'User' as table_name,
  COUNT(CASE WHEN "createdAt" IS NULL THEN 1 END) as null_created,
  COUNT(CASE WHEN "updatedAt" IS NULL THEN 1 END) as null_updated
FROM "User"
UNION ALL
SELECT 'Company', 
  COUNT(CASE WHEN "createdAt" IS NULL THEN 1 END),
  COUNT(CASE WHEN "updatedAt" IS NULL THEN 1 END)
FROM "Company"
UNION ALL
SELECT 'Resume',
  COUNT(CASE WHEN "createdAt" IS NULL THEN 1 END),
  COUNT(CASE WHEN "updatedAt" IS NULL THEN 1 END)
FROM "Resume";




