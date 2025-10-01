const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Use current date for everything - no more date parsing issues
const NOW = new Date();

async function importData() {
  console.log('🚀 Starting database import...');
  
  if (!fs.existsSync('database-export.json')) {
    console.error('❌ database-export.json not found!');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));
  console.log('📊 Importing data...');
  
  // Clear existing data (in correct order to avoid foreign key issues)
  await prisma.jobApplication.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.content.deleteMany();  // Content first (references sections)
  await prisma.section.deleteMany();  // Then sections
  await prisma.tag.deleteMany();
  await prisma.userLLMSettings.deleteMany();
  await prisma.statistics.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.secrets.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Create required sections first
  console.log('📁 Creating sections...');
  const sections = [
    { id: 'sect_technical_skills', key: 'technical_skills', name: 'Technical Skills', order: 1 },
    { id: 'sect_education', key: 'education', name: 'Education', order: 2 },
    { id: 'sect_languages', key: 'languages', name: 'Languages', order: 3 },
    { id: 'sect_interests', key: 'interests', name: 'Interests', order: 4 },
    { id: 'sect_contact', key: 'contact', name: 'Contact', order: 5 },
    { id: 'sect_summary', key: 'summary', name: 'Summary', order: 6 },
    { id: 'sect_experience', key: 'experience', name: 'Experience', order: 7 }
  ];

  for (const section of sections) {
    await prisma.section.create({
      data: {
        id: section.id,
        key: section.key,
        name: section.name,
        order: section.order,
        createdAt: NOW,
        updatedAt: NOW
      }
    });
  }

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
        createdAt: NOW,
        updatedAt: NOW
      }
    });

        // Import basic secrets only
        if (user.secrets) {
          await prisma.secrets.create({
            data: {
              id: user.secrets.id,
              password: user.secrets.password,
              lastSignedIn: NOW,
              userId: user.id
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
          jobApplicationId: null,  // Skip foreign keys for now
          createdAt: NOW,
          updatedAt: NOW
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

    // Import content (with section relationships)
    for (const content of user.content || []) {
      console.log(`📚 Importing content: ${content.title}`);
      await prisma.content.create({
        data: {
          id: content.id,
          title: content.title,
          description: content.description,
          sectionId: content.sectionId || 'sect_technical_skills',  // Use actual sectionId from export
          userId: user.id,
          sourceContentId: content.sourceContentId,
          data: content.data || '{}',
          embedding: content.embedding,
          embeddingHash: content.embeddingHash,
          transformationDate: content.transformationDate ? NOW : null,
          transformationNotes: content.transformationNotes,
          createdAt: NOW,
          updatedAt: NOW
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
          createdAt: NOW,
          updatedAt: NOW
        }
      });
    }

    // Import LLM settings
    if (user.llmSettings) {
      await prisma.userLLMSettings.create({
        data: {
          id: user.llmSettings.id,
          provider: 'OLLAMA',
          userId: user.id,
          ollamaBaseUrl: 'http://localhost:11434/v1',
          ollamaModel: 'qwen2.5:7b',
          maxTokens: user.llmSettings.maxTokens || 4000,
          temperature: user.llmSettings.temperature || 0.1,
          createdAt: NOW,
          updatedAt: NOW
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
        createdAt: NOW,
        updatedAt: NOW
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
          createdAt: NOW,
          updatedAt: NOW
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
