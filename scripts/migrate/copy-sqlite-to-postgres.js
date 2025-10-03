#!/usr/bin/env node
/**
 * SQLite → PostgreSQL Data Migration
 * 
 * Copies data from SQLite (dev.db) to PostgreSQL using Prisma.
 * Runs in FK-safe order to prevent constraint violations.
 */

const { PrismaClient } = require('@prisma/client');

// SQLite URL (needs to be absolute path)
const sqliteUrl = process.env.SQLITE_URL || 'file:./apps/server/prisma/dev.db';

// PostgreSQL URL (from container network)
const postgresUrl = process.env.POSTGRES_URL || 'postgresql://reactive_resume:reactive_resume_2024@localhost:5432/reactive_resume?schema=public';

console.log(`SQLite URL: ${sqliteUrl}`);
console.log(`Postgres URL: ${postgresUrl.replace(/:[^:@]+@/, ':***@')}`);
console.log('');

// Since schema.prisma is set to postgresql, we can't use it for SQLite
// We'll read SQLite data directly using better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');

const sqlitePath = path.resolve(__dirname, '../../apps/server/prisma/dev.db');
const sqliteDb = new Database(sqlitePath, { readonly: true });

// PostgreSQL client
const postgres = new PrismaClient({
  datasourceUrl: postgresUrl,
});

// Table copy order (FK-safe: parents before children)
const COPY_ORDER = [
  { name: 'User', model: 'user' },
  { name: 'UserLLMSettings', model: 'userLLMSettings' },
  { name: 'Resume', model: 'resume' },
  { name: 'Company', model: 'company' },
  { name: 'Contact', model: 'contact' },
  { name: 'JobApplication', model: 'jobApplication' },
  { name: 'JobApplicationQuestion', model: 'jobApplicationQuestion' },
  { name: 'Content', model: 'content' },
  { name: 'Section', model: 'section' },
  { name: 'CoverLetter', model: 'coverLetter' },
  { name: 'CoverLetterContent', model: 'coverLetterContent' },
  { name: 'Tag', model: 'tag' },
  { name: 'ContactMessage', model: 'contactMessage' },
];

async function copyTable({ name, model }) {
  try {
    console.log(`\n📦 ${name}:`);
    
    // Get source data from SQLite using better-sqlite3
    const sourceData = sqliteDb.prepare(`SELECT * FROM "${name}"`).all();
    
    if (sourceData.length === 0) {
      console.log(`  ⏭️  0 rows (skipping)`);
      return { table: name, count: 0, success: true };
    }

    console.log(`  Found: ${sourceData.length} rows`);
    
    // Copy each record to PostgreSQL using Prisma
    let copied = 0;
    let errors = 0;
    
    for (const record of sourceData) {
      try {
        await postgres[model].create({ data: record });
        copied++;
        if (copied % 50 === 0) {
          process.stdout.write(`  Progress: ${copied}/${sourceData.length}\r`);
        }
      } catch (error) {
        errors++;
        if (errors < 5) {
          console.error(`  ⚠️  Error copying record: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log(`  ✅ Copied: ${copied} rows${errors > 0 ? ` (${errors} errors)` : ''}`);
    return { table: name, count: copied, errors, success: true };
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return { table: name, count: 0, success: false, error: error.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  SQLite → PostgreSQL Data Migration');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Source: SQLite (apps/server/prisma/dev.db)');
  console.log('Target: PostgreSQL (reactive-resume-postgres:5432)');
  console.log('');
  console.log(`📋 Copying ${COPY_ORDER.length} tables in FK-safe order...`);

  const startTime = Date.now();
  const results = [];

  for (const table of COPY_ORDER) {
    const result = await copyTable(table);
    results.push(result);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════');
  console.log('');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalRows = results.reduce((sum, r) => sum + r.count, 0);
  const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);

  console.log(`✅ Tables processed: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total rows copied: ${totalRows}`);
  console.log(`⚠️  Total errors: ${totalErrors}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('');

  // Show non-empty tables
  console.log('Table Breakdown:');
  results
    .filter(r => r.count > 0)
    .forEach(r => {
      console.log(`  • ${r.table}: ${r.count} rows${r.errors ? ` (${r.errors} errors)` : ''}`);
    });

  sqliteDb.close();
  await postgres.$disconnect();
}

main()
  .catch(error => {
    console.error('');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

