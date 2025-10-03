#!/usr/bin/env node
/**
 * SQLite → PostgreSQL Local Migration
 * 
 * Reads SQLite using Node's built-in sqlite3 binding,
 * writes to Postgres using Prisma.
 */

const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3');
const { promisify } = require('util');
const path = require('path');

// Open SQLite database
const sqlitePath = path.resolve(__dirname, '../../apps/server/prisma/dev.db');
const sqliteDb = new sqlite3.Database(sqlitePath, sqlite3.OPEN_READONLY);
const sqliteAll = promisify(sqliteDb.all.bind(sqliteDb));

// PostgreSQL Prisma client
const postgres = new PrismaClient({
  datasourceUrl: process.env.POSTGRES_URL,
});

// FK-safe table order
const TABLES = [
  { name: 'User', prismaModel: 'user' },
  { name: 'UserLLMSettings', prismaModel: 'userLLMSettings' },
  { name: 'Resume', prismaModel: 'resume' },
  { name: 'Company', prismaModel: 'company' },
  { name: 'Contact', prismaModel: 'contact' },
  { name: 'JobApplication', prismaModel: 'jobApplication' },
  { name: 'JobApplicationQuestion', prismaModel: 'jobApplicationQuestion' },
  { name: 'Content', prismaModel: 'content' },
  { name: 'Section', prismaModel: 'section' },
  { name: 'CoverLetter', prismaModel: 'coverLetter' },
  { name: 'CoverLetterContent', prismaModel: 'coverLetterContent' },
  { name: 'Tag', prismaModel: 'tag' },
  { name: 'ContactMessage', prismaModel: 'contactMessage' },
];

async function copyTable({ name, prismaModel }) {
  try {
    console.log(`\n📦 ${name}:`);
    
    // Read from SQLite
    const rows = await sqliteAll(`SELECT * FROM "${name}"`);
    
    if (rows.length === 0) {
      console.log(`  ⏭️  0 rows (skipping)`);
      return { table: name, count: 0, success: true };
    }

    console.log(`  Found: ${rows.length} rows`);
    
    // Copy to PostgreSQL
    let copied = 0;
    let errors = 0;
    
    for (const row of rows) {
      try {
        await postgres[prismaModel].create({ data: row });
        copied++;
        if (copied % 50 === 0) {
          process.stdout.write(`  Progress: ${copied}/${rows.length}\r`);
        }
      } catch (error) {
        errors++;
        if (errors <= 2) {
          console.error(`  ⚠️  Row error: ${error.message.substring(0, 80)}`);
        }
      }
    }

    console.log(`  ✅ Copied: ${copied}/${rows.length}${errors > 0 ? ` (${errors} errors)` : ''}`);
    return { table: name, count: copied, errors, success: true };
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return { table: name, count: 0, success: false, error: error.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  SQLite → PostgreSQL Local Migration');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log(`Source: ${sqlitePath}`);
  console.log(`Target: ${(process.env.POSTGRES_URL || '').replace(/:[^:@]+@/, ':***@')}`);
  console.log('');

  const startTime = Date.now();
  const results = [];

  for (const table of TABLES) {
    const result = await copyTable(table);
    results.push(result);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log(`✅ Tables: ${results.filter(r => r.success).length}/${results.length}`);
  console.log(`📊 Rows copied: ${results.reduce((sum, r) => sum + r.count, 0)}`);
  console.log(`⚠️  Total errors: ${results.reduce((sum, r) => sum + (r.errors || 0), 0)}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('');

  if (results.some(r => r.count > 0)) {
    console.log('Table Breakdown:');
    results
      .filter(r => r.count > 0)
      .forEach(r => {
        console.log(`  • ${r.table}: ${r.count} rows${r.errors ? ` (${r.errors} errors)` : ''}`);
      });
  }

  sqliteDb.close();
  await postgres.$disconnect();
}

main().catch(error => {
  console.error('');
  console.error('❌ Migration failed:', error);
  sqliteDb.close();
  process.exit(1);
});



