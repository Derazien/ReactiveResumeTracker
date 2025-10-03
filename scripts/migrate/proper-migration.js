#!/usr/bin/env node
/**
 * Proper SQLite → PostgreSQL Migration
 * Reads from SQLite, converts timestamps, writes to PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function migrate() {
  console.log('🚀 SQLite → PostgreSQL Migration\n');
  
  // Step 1: Read from SQLite
  console.log('📖 Reading from SQLite...');
  process.env.DATABASE_URL = `file:${path.resolve(__dirname, '../../apps/server/prisma/dev.db')}`;
  const sqlite = new PrismaClient();
  
  const sqliteData = {
    users: await sqlite.user.findMany({ include: { secrets: true } }),
    companies: await sqlite.company.findMany(),
    resumes: await sqlite.resume.findMany(),
    sections: await sqlite.section.findMany(),
    content: await sqlite.content.findMany(),
    tags: await sqlite.tag.findMany(),
    contentTags: await sqlite.contentTag.findMany(),
    coverLetters: await sqlite.coverLetter.findMany(),
    coverLetterContents: await sqlite.coverLetterContent.findMany(),
    jobApplications: await sqlite.jobApplication.findMany(),
    userLLMSettings: await sqlite.userLLMSettings.findMany(),
  };
  
  await sqlite.$disconnect();
  
  console.log('✅ SQLite data loaded');
  console.log(`   Users: ${sqliteData.users.length}`);
  console.log(`   Companies: ${sqliteData.companies.length}`);
  console.log(`   Resumes: ${sqliteData.resumes.length}`);
  console.log(`   Content: ${sqliteData.content.length}`);
  console.log(`   Tags: ${sqliteData.tags.length}\n`);
  
  // Step 2: Write to PostgreSQL
  console.log('📝 Writing to PostgreSQL...');
  process.env.DATABASE_URL = 'postgresql://reactive_resume:reactive_resume_2024@127.0.0.1:55432/reactive_resume?schema=public&sslmode=disable';
  const postgres = new PrismaClient();
  
  // Wipe PostgreSQL first
  console.log('   Clearing existing data...');
  await postgres.userLLMSettings.deleteMany();
  await postgres.coverLetterContent.deleteMany();
  await postgres.coverLetter.deleteMany();
  await postgres.contentTag.deleteMany();
  await postgres.jobApplication.deleteMany();
  await postgres.content.deleteMany();
  await postgres.tag.deleteMany();
  await postgres.section.deleteMany();
  await postgres.resume.deleteMany();
  await postgres.contact.deleteMany();
  await postgres.company.deleteMany();
  await postgres.secrets.deleteMany();
  await postgres.user.deleteMany();
  
  // Import Users with Secrets
  console.log('   Importing Users...');
  for (const user of sqliteData.users) {
    const { secrets, ...userData } = user;
    await postgres.user.create({
      data: {
        ...userData,
        secrets: secrets ? { create: secrets } : undefined
      }
    });
  }
  
  // Import Companies
  console.log('   Importing Companies...');
  for (const company of sqliteData.companies) {
    await postgres.company.create({ data: company });
  }
  
  // Import Resumes
  console.log('   Importing Resumes...');
  for (const resume of sqliteData.resumes) {
    await postgres.resume.create({ data: resume });
  }
  
  // Import Sections
  console.log('   Importing Sections...');
  for (const section of sqliteData.sections) {
    await postgres.section.create({ data: section });
  }
  
  // Import Tags
  console.log('   Importing Tags...');
  for (const tag of sqliteData.tags) {
    await postgres.tag.create({ data: tag });
  }
  
  // Import Content
  console.log('   Importing Content...');
  for (const content of sqliteData.content) {
    await postgres.content.create({ data: content });
  }
  
  // Import Content Tags
  console.log('   Importing ContentTags...');
  for (const contentTag of sqliteData.contentTags) {
    await postgres.contentTag.create({ data: contentTag });
  }
  
  // Import Cover Letters
  console.log('   Importing CoverLetters...');
  for (const coverLetter of sqliteData.coverLetters) {
    await postgres.coverLetter.create({ data: coverLetter });
  }
  
  // Import Cover Letter Contents
  console.log('   Importing CoverLetterContents...');
  for (const content of sqliteData.coverLetterContents) {
    await postgres.coverLetterContent.create({ data: content });
  }
  
  // Import Job Applications
  console.log('   Importing JobApplications...');
  for (const job of sqliteData.jobApplications) {
    await postgres.jobApplication.create({ data: job });
  }
  
  // Import User LLM Settings
  console.log('   Importing UserLLMSettings...');
  for (const settings of sqliteData.userLLMSettings) {
    await postgres.userLLMSettings.create({ data: settings });
  }
  
  await postgres.$disconnect();
  
  console.log('\n✅✅✅ MIGRATION COMPLETE! ✅✅✅');
  console.log('\nAll timestamps automatically converted by Prisma!');
}

migrate().catch(console.error);




