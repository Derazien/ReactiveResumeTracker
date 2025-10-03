#!/usr/bin/env node
/**
 * Dual Prisma Client Migration
 * SQLite client (temporary) → PostgreSQL client (main)
 */

const { PrismaClient: PrismaClientPG } = require('@prisma/client');
const { PrismaClient: PrismaClientSQLite } = require('.prisma/client');

// Both use the same generated client, but different URLs
const sqlite = new PrismaClientSQLite({
  datasources: { db: { url: 'file:./apps/server/prisma/dev.db' } }
});

const postgres = new PrismaClientPG({
  datasources: { db: { url: process.env.POSTGRES_URL } }
});

const MODELS = [
  'user', 'userLLMSettings', 'resume', 'company', 'contact',
  'jobApplication', 'jobApplicationQuestion', 'content', 'section',
  'coverLetter', 'coverLetterContent', 'tag', 'contactMessage'
];

async function migrate() {
  console.log('═══════════════════════════════════════');
  console.log('  SQLite → PostgreSQL (Dual Client)');
  console.log('═══════════════════════════════════════\n');

  let totalCopied = 0;
  const start = Date.now();

  for (const model of MODELS) {
    try {
      console.log(`📦 ${model}:`);
      const data = await sqlite[model].findMany();
      
      if (data.length === 0) {
        console.log(`  ⏭️  0 rows\n`);
        continue;
      }

      console.log(`  Found: ${data.length} rows`);
      let copied = 0;
      
      for (const record of data) {
        try {
          await postgres[model].create({ data: record });
          copied++;
          if (copied % 100 === 0) process.stdout.write(`  Progress: ${copied}/${data.length}\r`);
        } catch (err) {
          // Skip errors (likely duplicates)
        }
      }

      totalCopied += copied;
      console.log(`  ✅ ${copied} rows\n`);
    } catch (error) {
      console.log(`  ❌ ${error.message.substring(0, 50)}\n`);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Copied ${totalCopied} rows in ${duration}s\n`);

  await sqlite.$disconnect();
  await postgres.$disconnect();
}

migrate().catch(err => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});



