const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

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

    // Export individual tables for completeness
    console.log('📋 Exporting content...');
    exportData.data.content = await prisma.content.findMany();

    console.log('🏷️ Exporting tags...');
    exportData.data.tags = await prisma.tag.findMany();

    console.log('⚙️ Exporting LLM settings...');
    exportData.data.userLLMSettings = await prisma.userLLMSettings.findMany();

    // Write updated export
    fs.writeFileSync('database-export.json', JSON.stringify(exportData, null, 2));
    
    // Summary
    const summary = {
      users: exportData.data.users?.length || 0,
      resumes: exportData.data.users?.reduce((sum, user) => sum + (user.resumes?.length || 0), 0) || 0,
      jobApplications: exportData.data.users?.reduce((sum, user) => sum + (user.jobApplications?.length || 0), 0) || 0,
      companies: exportData.data.companies?.length || 0,
      contacts: exportData.data.companies?.reduce((sum, company) => sum + (company.contacts?.length || 0), 0) || 0,
      content: exportData.data.content?.length || 0,
      tags: exportData.data.tags?.length || 0,
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
