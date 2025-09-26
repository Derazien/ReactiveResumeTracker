const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Helper function to safely create Date objects
function safeDate(dateString) {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

async function importData() {
  console.log('🚀 Starting database import...');
  
  if (!fs.existsSync('database-export.json')) {
    console.error('❌ database-export.json not found!');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));
  console.log('📊 Importing data...');
  
  // Clear existing data
  await prisma.jobApplication.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.content.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.userLLMSettings.deleteMany();
  await prisma.statistics.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.secrets.deleteMany();
  await prisma.user.deleteMany();

  // Import users
  for (const user of data.data.users || []) {
    console.log(`👤 Importing user: ${user.email}`);
    
    const createdUser = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        picture: user.picture,
        username: user.username,
        email: user.email,
        locale: user.locale || 'en-US',
        emailVerified: user.emailVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        userType: user.userType || 'GENERAL_CONSUMER',
        provider: user.provider,
        createdAt: safeDate(user.createdAt),
        updatedAt: safeDate(user.updatedAt)
      }
    });

        // Import secrets (with date validation)
        if (user.secrets) {
          const now = new Date();
          await prisma.secrets.create({
            data: {
              id: user.secrets.id,
              password: user.secrets.password,
              lastSignedIn: safeDate(user.secrets.lastSignedIn),
              verificationToken: user.secrets.verificationToken,
              twoFactorSecret: user.secrets.twoFactorSecret,
              twoFactorBackupCodes: user.secrets.twoFactorBackupCodes || [],
              refreshTokens: user.secrets.refreshTokens || [],
              userId: user.id,
              createdAt: safeDate(user.secrets.createdAt),
              updatedAt: safeDate(user.secrets.updatedAt)
            }
          });
        }

    // Import resumes
    for (const resume of user.resumes || []) {
      console.log(`📄 Importing resume: ${resume.title}`);
      const createdResume = await prisma.resume.create({
        data: {
          id: resume.id,
          title: resume.title,
          slug: resume.slug,
          data: resume.data || '{}',
          visibility: resume.visibility || 'private',
          locked: resume.locked || false,
          userId: user.id,
          jobApplicationId: resume.jobApplicationId,
          createdAt: safeDate(resume.createdAt),
          updatedAt: safeDate(resume.updatedAt)
        }
      });

      if (resume.statistics) {
        await prisma.statistics.create({
          data: {
            id: resume.statistics.id,
            views: resume.statistics.views || 0,
            downloads: resume.statistics.downloads || 0,
            resumeId: resume.id
          }
        });
      }
    }

    // Import content
    for (const content of user.content || []) {
      await prisma.content.create({
        data: {
          id: content.id,
          title: content.title,
          type: content.type,
          content: content.content,
          tags: content.tags || [],
          userId: user.id,
          createdAt: safeDate(content.createdAt),
          updatedAt: safeDate(content.updatedAt)
        }
      });
    }

    // Import tags
    for (const tag of user.tags || []) {
      await prisma.tag.create({
        data: {
          id: tag.id,
          name: tag.name,
          userId: user.id,
          createdAt: safeDate(tag.createdAt),
          updatedAt: safeDate(tag.updatedAt)
        }
      });
    }

    // Import LLM settings
    if (user.llmSettings) {
      await prisma.userLLMSettings.create({
        data: {
          id: user.llmSettings.id,
          provider: 'LOCAL',
          userId: user.id,
          ollamaBaseUrl: 'http://localhost:11434/v1',
          ollamaModel: 'qwen2.5:7b',
          maxTokens: user.llmSettings.maxTokens || 4000,
          temperature: user.llmSettings.temperature || 0.1,
          createdAt: safeDate(user.llmSettings.createdAt),
          updatedAt: safeDate(user.llmSettings.updatedAt)
        }
      });
    }
  }

  // Import companies
  for (const company of data.data.companies || []) {
    console.log(`🏢 Importing company: ${company.name}`);
    await prisma.company.create({
      data: {
        id: company.id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        website: company.website,
        location: company.location,
        values: company.values || '[]',
        createdAt: safeDate(company.createdAt),
        updatedAt: safeDate(company.updatedAt)
      }
    });
  }

  // Import job applications
  for (const user of data.data.users || []) {
    for (const jobApp of user.jobApplications || []) {
      console.log(`💼 Importing job: ${jobApp.title}`);
      await prisma.jobApplication.create({
        data: {
          id: jobApp.id,
          title: jobApp.title,
          url: jobApp.url,
          description: jobApp.description,
          location: jobApp.location,
          salary: jobApp.salary,
          industry: jobApp.industry,
          requirements: jobApp.requirements || [],
          extractedTags: jobApp.extractedTags || [],
          companyName: jobApp.companyName,
          companyId: jobApp.companyId,
          status: jobApp.status || 'active',
          userId: user.id,
          createdViaAutomation: jobApp.createdViaAutomation || false,
          createdAt: safeDate(jobApp.createdAt),
          updatedAt: safeDate(jobApp.updatedAt)
        }
      });
    }
  }

  console.log('✅ Import completed!');
  const userCount = await prisma.user.count();
  const resumeCount = await prisma.resume.count();
  const jobAppCount = await prisma.jobApplication.count();
  const companyCount = await prisma.company.count();
  
  console.log(`📊 Imported: ${userCount} users, ${resumeCount} resumes, ${jobAppCount} jobs, ${companyCount} companies`);
}

importData().catch(console.error).finally(() => prisma.$disconnect());
