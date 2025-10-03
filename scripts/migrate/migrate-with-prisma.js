#!/usr/bin/env node
/**
 * SQLite → PostgreSQL Migration with Proper Timestamp Handling
 * 
 * This script:
 * 1. Reads from SQLite (apps/server/prisma/dev.db)
 * 2. Converts timestamps from milliseconds to Date objects
 * 3. Writes to PostgreSQL with proper types
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// SQLite connection
const sqlitePath = path.resolve(__dirname, '../../apps/server/prisma/dev.db');
const prismaS

qlite = new PrismaClient({
  datasources: {
    db: {
      url: `file:${sqlitePath}`
    }
  }
});

// PostgreSQL connection
const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrate() {
  console.log('🚀 Starting SQLite → PostgreSQL migration with proper timestamps...\n');
  
  try {
    // Migrate Users
    console.log('📋 Migrating Users...');
    const users = await prismaS

qlite.user.findMany({
      include: { secrets: true }
    });
    
    for (const user of users) {
      const { secrets, ...userData } = user;
      await prismaPostgres.user.create({
        data: {
          ...userData,
          secrets: secrets ? {
            create: {
              ...secrets,
              lastSignedIn: secrets.lastSignedIn ? new Date(secrets.lastSignedIn) : null
            }
          } : undefined
        }
      });
    }
    console.log(`   ✅ Migrated ${users.length} users\n`);
    
    // Migrate Companies
    console.log('📋 Migrating Companies...');
    const companies = await prismaS

qlite.company.findMany();
    for (const company of companies) {
      await prismaPostgres.company.create({ data: company });
    }
    console.log(`   ✅ Migrated ${companies.length} companies\n`);
    
    // Migrate Resumes
    console.log('📋 Migrating Resumes...');
    const resumes = await prismaSqlite.resume.findMany();
    for (const resume of resumes) {
      await prismaPostgres.resume.create({ data: resume });
    }
    console.log(`   ✅ Migrated ${resumes.length} resumes\n`);
    
    console.log('✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prismaSqlite.$disconnect();
    await prismaPostgres.$disconnect();
  }
}

migrate().catch(console.error);




