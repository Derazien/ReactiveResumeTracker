#!/usr/bin/env node
/**
 * SQLite → PostgreSQL Migration via SQL Dump
 * 
 * Uses Prisma to read SQLite and generate SQL INSERT statements for Postgres.
 * No native modules required!
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// SQLite Prisma client (reads from file:./dev.db in .env)
const sqliteClient = new PrismaClient();

// PostgreSQL Prisma client (reads from POSTGRES_URL env var)
const postgresClient = new PrismaClient({
  datasourceUrl: process.env.POSTGRES_URL,
});

// FK-safe order
const MODELS = [
  'user',
  'userLLMSettings',
  'resume',
  'company',
  'contact',
  'jobApplication',
  'jobApplicationQuestion',
  'content',
  'section',
  'coverLetter',
  'coverLetterContent',
  'tag',
  'contactMessage',
];

async function migrate() {
  console.log('═══════════════════════════════════════');
  console.log('  SQLite → PostgreSQL Migration');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log(`Source: SQLite (${process.env.DATABASE_URL || 'file:./dev.db'})`);
  console.log(`Target: PostgreSQL (${(process.env.POSTGRES_URL || '').replace(/:[^:@]+@/, ':***@')})`);
  console.log('');

  const stats = [];
  const startTime = Date.now();

  for (const model of MODELS) {
    try {
      console.log(`\n📦 ${model}:`);
      
      // Read from SQLite
      const sourceData = await sqliteClient[model].findMany();
      
      if (sourceData.length === 0) {
        console.log(`  ⏭️  0 rows (skipping)`);
        stats.push({ table: model, count: 0, success: true });
        continue;
      }

      console.log(`  Found: ${sourceData.length} rows`);
      
      // Write to PostgreSQL
      let copied = 0;
      let errors = 0;
      
      for (const record of sourceData) {
        try {
          await postgresClient[model].create({ data: record });
          copied++;
          if (copied % 50 === 0) {
            process.stdout.write(`  Progress: ${copied}/${sourceData.length}\r`);
          }
        } catch (error) {
          errors++;
          if (errors < 3) {
            console.error(`  ⚠️  Error: ${error.message.substring(0, 100)}`);
          }
        }
      }

      console.log(`  ✅ Copied: ${copied} rows${errors > 0 ? ` (${errors} errors)` : ''}`);
      stats.push({ table: model, count: copied, errors, success: true });
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      stats.push({ table: model, count: 0, success: false, error: error.message });
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log(`✅ Tables processed: ${stats.filter(s => s.success).length}/${stats.length}`);
  console.log(`📊 Total rows copied: ${stats.reduce((sum, s) => sum + s.count, 0)}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('');

  if (stats.some(s => s.count > 0)) {
    console.log('Table Breakdown:');
    stats
      .filter(s => s.count > 0)
      .forEach(s => {
        console.log(`  • ${s.table}: ${s.count} rows${s.errors ? ` (${s.errors} errors)` : ''}`);
      });
    console.log('');
  }

  await sqliteClient.$disconnect();
  await postgresClient.$disconnect();
}

migrate()
  .catch(error => {
    console.error('');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });



