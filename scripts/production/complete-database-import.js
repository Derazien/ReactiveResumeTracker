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


  // Import sections first (they're referenced by content)
  console.log('📁 Importing sections...');
  for (const section of data.data.sections || []) {
    console.log(`📁 Importing section: ${section.name}`);
    await prisma.section.create({
      data: {
        id: section.id,
        key: section.key,
        name: section.name,
        order: section.order,
        createdAt: section.createdAt ? new Date(section.createdAt) : NOW,
        updatedAt: section.updatedAt ? new Date(section.updatedAt) : NOW
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

  // Import all remaining tables from export
  console.log('📋 Importing content...');
  for (const content of data.data.content || []) {
    console.log(`📋 Importing content: ${content.title}`);
    await prisma.content.create({
      data: {
        id: content.id,
        title: content.title,
        description: content.description,
        sectionId: content.sectionId,
        userId: content.userId,
        sourceContentId: content.sourceContentId,
        data: content.data || '{}',
        embedding: content.embedding,
        embeddingHash: content.embeddingHash,
        transformationDate: content.transformationDate ? new Date(content.transformationDate) : null,
        transformationNotes: content.transformationNotes,
        createdAt: content.createdAt ? new Date(content.createdAt) : NOW,
        updatedAt: content.updatedAt ? new Date(content.updatedAt) : NOW
      }
    });
  }

  console.log('🏷️ Importing tags...');
  for (const tag of data.data.tags || []) {
    await prisma.tag.create({
      data: {
        id: tag.id,
        name: tag.name,
        userId: tag.userId,
        createdAt: tag.createdAt ? new Date(tag.createdAt) : NOW,
        updatedAt: tag.updatedAt ? new Date(tag.updatedAt) : NOW
      }
    });
  }

  console.log('🔗 Importing content tags...');
  for (const contentTag of data.data.contentTags || []) {
    await prisma.contentTag.create({
      data: {
        id: contentTag.id,
        contentId: contentTag.contentId,
        tagId: contentTag.tagId,
        createdAt: contentTag.createdAt ? new Date(contentTag.createdAt) : NOW,
        updatedAt: contentTag.updatedAt ? new Date(contentTag.updatedAt) : NOW
      }
    });
  }

  console.log('📄 Importing cover letters...');
  for (const coverLetter of data.data.coverLetters || []) {
    await prisma.coverLetter.create({
      data: {
        id: coverLetter.id,
        title: coverLetter.title,
        content: coverLetter.content,
        userId: coverLetter.userId,
        jobApplicationId: coverLetter.jobApplicationId,
        createdAt: coverLetter.createdAt ? new Date(coverLetter.createdAt) : NOW,
        updatedAt: coverLetter.updatedAt ? new Date(coverLetter.updatedAt) : NOW
      }
    });
  }

  console.log('📝 Importing cover letter content...');
  for (const coverLetterContent of data.data.coverLetterContent || []) {
    await prisma.coverLetterContent.create({
      data: {
        id: coverLetterContent.id,
        content: coverLetterContent.content,
        coverLetterId: coverLetterContent.coverLetterId,
        createdAt: coverLetterContent.createdAt ? new Date(coverLetterContent.createdAt) : NOW,
        updatedAt: coverLetterContent.updatedAt ? new Date(coverLetterContent.updatedAt) : NOW
      }
    });
  }

  console.log('🎤 Importing interviews...');
  for (const interview of data.data.interviews || []) {
    await prisma.interview.create({
      data: {
        id: interview.id,
        title: interview.title,
        description: interview.description,
        userId: interview.userId,
        createdAt: interview.createdAt ? new Date(interview.createdAt) : NOW,
        updatedAt: interview.updatedAt ? new Date(interview.updatedAt) : NOW
      }
    });
  }

  console.log('📊 Importing story blocks...');
  for (const storyBlock of data.data.storyBlocks || []) {
    await prisma.storyBlock.create({
      data: {
        id: storyBlock.id,
        title: storyBlock.title,
        content: storyBlock.content,
        interviewId: storyBlock.interviewId,
        order: storyBlock.order,
        createdAt: storyBlock.createdAt ? new Date(storyBlock.createdAt) : NOW,
        updatedAt: storyBlock.updatedAt ? new Date(storyBlock.updatedAt) : NOW
      }
    });
  }

  console.log('💡 Importing answer snippets...');
  for (const answerSnippet of data.data.answerSnippets || []) {
    await prisma.answerSnippet.create({
      data: {
        id: answerSnippet.id,
        content: answerSnippet.content,
        storyBlockId: answerSnippet.storyBlockId,
        createdAt: answerSnippet.createdAt ? new Date(answerSnippet.createdAt) : NOW,
        updatedAt: answerSnippet.updatedAt ? new Date(answerSnippet.updatedAt) : NOW
      }
    });
  }

  console.log('👥 Importing contacts...');
  for (const contact of data.data.contacts || []) {
    await prisma.contact.create({
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        companyId: contact.companyId,
        userId: contact.userId,
        createdAt: contact.createdAt ? new Date(contact.createdAt) : NOW,
        updatedAt: contact.updatedAt ? new Date(contact.updatedAt) : NOW
      }
    });
  }

  console.log('❓ Importing job application questions...');
  for (const question of data.data.jobApplicationQuestions || []) {
    await prisma.jobApplicationQuestion.create({
      data: {
        id: question.id,
        question: question.question,
        answer: question.answer,
        jobApplicationId: question.jobApplicationId,
        createdAt: question.createdAt ? new Date(question.createdAt) : NOW,
        updatedAt: question.updatedAt ? new Date(question.updatedAt) : NOW
      }
    });
  }

  console.log('💬 Importing contact messages...');
  for (const message of data.data.contactMessages || []) {
    await prisma.contactMessage.create({
      data: {
        id: message.id,
        content: message.content,
        contactId: message.contactId,
        userId: message.userId,
        createdAt: message.createdAt ? new Date(message.createdAt) : NOW,
        updatedAt: message.updatedAt ? new Date(message.updatedAt) : NOW
      }
    });
  }

  console.log('⚙️ Importing LLM settings...');
  for (const llmSetting of data.data.userLLMSettings || []) {
    await prisma.userLLMSettings.create({
      data: {
        id: llmSetting.id,
        provider: llmSetting.provider,
        userId: llmSetting.userId,
        openaiApiKey: llmSetting.openaiApiKey,
        anthropicApiKey: llmSetting.anthropicApiKey,
        googleApiKey: llmSetting.googleApiKey,
        ollamaBaseUrl: llmSetting.ollamaBaseUrl,
        ollamaModel: llmSetting.ollamaModel,
        maxTokens: llmSetting.maxTokens,
        temperature: llmSetting.temperature,
        createdAt: llmSetting.createdAt ? new Date(llmSetting.createdAt) : NOW,
        updatedAt: llmSetting.updatedAt ? new Date(llmSetting.updatedAt) : NOW
      }
    });
  }

  console.log('📈 Importing statistics...');
  for (const statistic of data.data.statistics || []) {
    await prisma.statistics.create({
      data: {
        id: statistic.id,
        views: statistic.views || 0,
        downloads: statistic.downloads || 0,
        resumeId: statistic.resumeId,
        createdAt: statistic.createdAt ? new Date(statistic.createdAt) : NOW,
        updatedAt: statistic.updatedAt ? new Date(statistic.updatedAt) : NOW
      }
    });
  }

  console.log('✅ Import completed!');
  
  // Count all imported tables
  const userCount = await prisma.user.count();
  const resumeCount = await prisma.resume.count();
  const jobAppCount = await prisma.jobApplication.count();
  const companyCount = await prisma.company.count();
  const sectionCount = await prisma.section.count();
  const contentCount = await prisma.content.count();
  const tagCount = await prisma.tag.count();
  const contentTagCount = await prisma.contentTag.count();
  const coverLetterCount = await prisma.coverLetter.count();
  const coverLetterContentCount = await prisma.coverLetterContent.count();
  const interviewCount = await prisma.interview.count();
  const storyBlockCount = await prisma.storyBlock.count();
  const answerSnippetCount = await prisma.answerSnippet.count();
  const contactCount = await prisma.contact.count();
  const questionCount = await prisma.jobApplicationQuestion.count();
  const messageCount = await prisma.contactMessage.count();
  const llmSettingCount = await prisma.userLLMSettings.count();
  const statisticCount = await prisma.statistics.count();
  
  console.log(`📊 COMPLETE IMPORT SUMMARY:`);
  console.log(`   👤 Users: ${userCount}`);
  console.log(`   📄 Resumes: ${resumeCount}`);
  console.log(`   💼 Job Applications: ${jobAppCount}`);
  console.log(`   🏢 Companies: ${companyCount}`);
  console.log(`   📁 Sections: ${sectionCount}`);
  console.log(`   📋 Content Items: ${contentCount}`);
  console.log(`   🏷️ Tags: ${tagCount}`);
  console.log(`   🔗 Content Tags: ${contentTagCount}`);
  console.log(`   📄 Cover Letters: ${coverLetterCount}`);
  console.log(`   📝 Cover Letter Content: ${coverLetterContentCount}`);
  console.log(`   🎤 Interviews: ${interviewCount}`);
  console.log(`   📊 Story Blocks: ${storyBlockCount}`);
  console.log(`   💡 Answer Snippets: ${answerSnippetCount}`);
  console.log(`   👥 Contacts: ${contactCount}`);
  console.log(`   ❓ Questions: ${questionCount}`);
  console.log(`   💬 Messages: ${messageCount}`);
  console.log(`   ⚙️ LLM Settings: ${llmSettingCount}`);
  console.log(`   📈 Statistics: ${statisticCount}`);
}

importData().catch(console.error).finally(() => prisma.$disconnect());
