#!/usr/bin/env node
/**
 * Ultra-Simple Migration: SQLite → PostgreSQL
 * Uses Prisma with explicit datasource URLs (no schema switching needed!)
 */

const { PrismaClient } = require('@prisma/client');

// SQLite client
const sqlite = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./apps/server/prisma/dev.db'
    }
  }
});

// PostgreSQL client
const postgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL || 'postgresql://reactive_resume:reactive_resume_2024@localhost:5432/reactive_resume?schema=public'
    }
  }
});

const MODELS = [
  'user', 'userLLMSettings', 'resume', 'company', 'contact',
  'jobApplication', 'jobApplicationQuestion', 'content', 'section',
  'coverLetter', 'coverLetterContent', 'tag', 'contactMessage'
];

async function migrate() {
  console.log('═══════════════════════════════════════');
  console.log('  SQLite → PostgreSQL Migration');
  console.log('═══════════════════════════════════════\n');

  const results = [];
  const start = Date.now();

  for (const model of MODELS) {
    try {
      console.log(`📦 ${model}:`);
      
      const data = await sqlite[model].findMany();
      
      if (data.length === 0) {
        console.log(`  ⏭️  0 rows\n`);
        results.push({ model, count: 0 });
        continue;
      }

      console.log(`  Found: ${data.length} rows`);
      
      let copied = 0;
      for (const record of data) {
        try {
          await postgres[model].create({ data: record });
          copied++;
        } catch (err) {
          // Skip duplicates silently
        }
      }

      console.log(`  ✅ ${copied} rows copied\n`);
      results.push({ model, count: copied });
    } catch (error) {
      console.log(`  ❌ Error: ${error.message.substring(0, 60)}\n`);
      results.push({ model, count: 0, error: true });
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  const total = results.reduce((sum, r) => sum + r.count, 0);

  console.log('═══════════════════════════════════════');
  console.log(`✅ Migrated ${total} rows in ${duration}s`);
  console.log('═══════════════════════════════════════\n');

  await sqlite.$disconnect();
  await postgres.$disconnect();
}

migrate().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});



