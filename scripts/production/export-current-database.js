const { PrismaClient } = require('../../apps/server/node_modules/@prisma/client');
const fs = require('fs');

// Set correct SQLite path using absolute path
process.env.DATABASE_URL = "file:C:/rzpl-android/ReactiveResumeTracker/apps/server/prisma/dev.db";

const prisma = new PrismaClient();

async function exportCurrentDatabase() {
  console.log('🔄 Exporting current database with latest changes...');
  
  try {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        databaseType: 'sqlite',
        version: '1.0',
        source: 'Local dev.db with latest changes'
      },
      data: {}
    };

    // Export users with all relationships
    console.log('👤 Exporting users...');
    exportData.data.users = await prisma.user.findMany({
      include: {
        resumes: {
          include: {
            statistics: true,
            jobApplication: {
              include: {
                company: {
                  include: {
                    contacts: true
                  }
                }
              }
            }
          }
        },
        jobApplications: {
          include: {
            company: {
              include: {
                contacts: true
              }
            }
          }
        },
        content: true,
        llmSettings: true,
        tags: true,
        contacts: true,
        secrets: true
      }
    });

    // Export companies separately
    console.log('🏢 Exporting companies...');
    exportData.data.companies = await prisma.company.findMany({
      include: {
        contacts: true,
        jobApplications: true
      }
    });

    // Export ALL individual tables (complete database)
    console.log('📁 Exporting sections...');
    exportData.data.sections = await prisma.section.findMany();

    console.log('📋 Exporting content...');
    exportData.data.content = await prisma.content.findMany();

    console.log('🏷️ Exporting tags...');
    exportData.data.tags = await prisma.tag.findMany();

    console.log('🔗 Exporting content tags...');
    exportData.data.contentTags = await prisma.contentTag.findMany();

    console.log('📄 Exporting cover letters...');
    exportData.data.coverLetters = await prisma.coverLetter.findMany();

    console.log('📝 Exporting cover letter content...');
    exportData.data.coverLetterContent = await prisma.coverLetterContent.findMany();

    console.log('🎤 Exporting interviews...');
    exportData.data.interviews = await prisma.interview.findMany();

    console.log('📊 Exporting story blocks...');
    exportData.data.storyBlocks = await prisma.storyBlock.findMany();

    console.log('💡 Exporting answer snippets...');
    exportData.data.answerSnippets = await prisma.answerSnippet.findMany();

    console.log('👥 Exporting contacts...');
    exportData.data.contacts = await prisma.contact.findMany();

    console.log('❓ Exporting job application questions...');
    exportData.data.jobApplicationQuestions = await prisma.jobApplicationQuestion.findMany();

    console.log('💬 Exporting contact messages...');
    exportData.data.contactMessages = await prisma.contactMessage.findMany();

    console.log('⚙️ Exporting LLM settings...');
    exportData.data.userLLMSettings = await prisma.userLLMSettings.findMany();

    // Write updated export
    fs.writeFileSync('database-export.json', JSON.stringify(exportData, null, 2));
    
    // Summary of ALL 19 tables
    const summary = {
      users: exportData.data.users?.length || 0,
      resumes: exportData.data.users?.reduce((sum, user) => sum + (user.resumes?.length || 0), 0) || 0,
      jobApplications: exportData.data.users?.reduce((sum, user) => sum + (user.jobApplications?.length || 0), 0) || 0,
      companies: exportData.data.companies?.length || 0,
      contacts: exportData.data.contacts?.length || 0,
      content: exportData.data.content?.length || 0,
      tags: exportData.data.tags?.length || 0,
      sections: exportData.data.sections?.length || 0,
      contentTags: exportData.data.contentTags?.length || 0,
      coverLetters: exportData.data.coverLetters?.length || 0,
      coverLetterContent: exportData.data.coverLetterContent?.length || 0,
      interviews: exportData.data.interviews?.length || 0,
      storyBlocks: exportData.data.storyBlocks?.length || 0,
      answerSnippets: exportData.data.answerSnippets?.length || 0,
      jobApplicationQuestions: exportData.data.jobApplicationQuestions?.length || 0,
      contactMessages: exportData.data.contactMessages?.length || 0,
      userLLMSettings: exportData.data.userLLMSettings?.length || 0
    };

    console.log('\n✅ Database export completed!');
    console.log('📊 Export Summary:');
    console.log(`   Users: ${summary.users}`);
    console.log(`   Resumes: ${summary.resumes}`);
    console.log(`   Job Applications: ${summary.jobApplications}`);
    console.log(`   Companies: ${summary.companies}`);
    console.log(`   Contacts: ${summary.contacts}`);
    console.log(`   Content Items: ${summary.content}`);
    console.log(`   LLM Settings: ${summary.userLLMSettings}`);
    console.log(`   Tags: ${summary.tags}`);
    
    const fileSize = (fs.statSync('database-export.json').size / 1024).toFixed(2);
    console.log(`\n📁 Updated export: database-export.json (${fileSize} KB)`);

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportCurrentDatabase();
