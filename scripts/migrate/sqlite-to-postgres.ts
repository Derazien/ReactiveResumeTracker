/**
 * SQLite to PostgreSQL Migration Script
 * 
 * Migrates data from SQLite (dev.db) to PostgreSQL using two Prisma clients.
 * Copies tables in FK-safe order to prevent constraint violations.
 */

import { PrismaClient as PrismaSQLite } from '@prisma/client';
import { PrismaClient as PrismaPostgres } from '@prisma/client';

// SQLite source
const sqliteUrl = 'file:./apps/server/prisma/dev.db';
const sqlite = new PrismaSQLite({
  datasourceUrl: sqliteUrl,
});

// PostgreSQL target
const postgresUrl = 'postgresql://reactive_resume:reactive_resume_2024@reactive-resume-postgres:5432/reactive_resume?schema=public';
const postgres = new PrismaPostgres({
  datasourceUrl: postgresUrl,
});

// Table copy order (FK-safe)
const COPY_ORDER = [
  'User',
  'UserLLMSettings',
  'Resume',
  'Company',
  'Contact',
  'JobApplication',
  'JobApplicationQuestion',
  'Content',
  'Section',
  'CoverLetter',
  'CoverLetterContent',
  'Tag',
  'ContactMessage',
  // Add other tables as needed
];

async function copyTable(tableName: string) {
  try {
    const sourceData = await (sqlite as any)[tableName.charAt(0).toLowerCase() + tableName.slice(1)].findMany();
    
    if (sourceData.length === 0) {
      console.log(`⏭️  ${tableName}: 0 rows (skipping)`);
      return { table: tableName, count: 0, success: true };
    }

    // Clear target table first
    await (postgres as any)[tableName.charAt(0).toLowerCase() + tableName.slice(1)].deleteMany();
    
    // Copy data
    for (const record of sourceData) {
      await (postgres as any)[tableName.charAt(0).toLowerCase() + tableName.slice(1)].create({ data: record });
    }

    console.log(`✅ ${tableName}: ${sourceData.length} rows copied`);
    return { table: tableName, count: sourceData.length, success: true };
  } catch (error) {
    console.error(`❌ ${tableName}: ${error.message}`);
    return { table: tableName, count: 0, success: false, error: error.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  SQLite → PostgreSQL Migration');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  console.log('Source: SQLite (dev.db)');
  console.log('Target: PostgreSQL (reactive-resume-postgres)');
  console.log('');

  const results = [];

  for (const tableName of COPY_ORDER) {
    const result = await copyTable(tableName);
    results.push(result);
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  Migration Complete');
  console.log('═══════════════════════════════════════');
  console.log('');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalRows = results.reduce((sum, r) => sum + r.count, 0);

  console.log(`✅ Tables copied: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total rows: ${totalRows}`);

  await sqlite.$disconnect();
  await postgres.$disconnect();
}

main().catch(console.error);



