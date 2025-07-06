#!/usr/bin/env node

/**
 * Test Script for Enhanced Content Matching
 * Tests the new RAG system with structured content selection
 * 
 * Database: 1 job application + 95 content items
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Initialize Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(__dirname, '../apps/server/prisma/dev.db')}`,
    },
  },
});

async function testContentMatching() {
  console.log('🧪 Testing Enhanced Content Matching System\n');

  try {
    // 1. Get all users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Testing with user: ${testUser.name} (${testUser.email})`);

    // 2. Get job applications
    const jobApplications = await prisma.jobApplication.findMany({
      where: { userId: testUser.id },
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        requirements: true,
        extractedTags: true,
        embedding: true,
        embeddingHash: true,
      }
    });

    console.log(`📋 Found ${jobApplications.length} job applications`);

    if (jobApplications.length === 0) {
      console.log('❌ No job applications found for testing');
      return;
    }

    const testJob = jobApplications[0];
    console.log(`🎯 Testing with job: ${testJob.title} at ${testJob.company}`);
    console.log(`   Has embedding: ${testJob.embedding ? '✅' : '❌'}`);
    console.log(`   Embedding hash: ${testJob.embeddingHash || 'None'}`);

    // 3. Get all content
    const allContent = await prisma.content.findMany({
      where: { userId: testUser.id },
      include: {
        section: true,
        tags: {
          include: { tag: true }
        }
      }
    });

    console.log(`📚 Found ${allContent.length} total content items`);

    // 4. Analyze content structure
    const contentBySection = {};
    const contentWithEmbeddings = allContent.filter(c => c.embedding);
    const contentVariants = allContent.filter(c => c.sourceContentId);
    const masterContent = allContent.filter(c => !c.sourceContentId);

    allContent.forEach(content => {
      const sectionKey = content.section?.key || 'unknown';
      if (!contentBySection[sectionKey]) {
        contentBySection[sectionKey] = [];
      }
      contentBySection[sectionKey].push(content);
    });

    console.log('\n📊 Content Analysis:');
    console.log(`   Content with embeddings: ${contentWithEmbeddings.length}`);
    console.log(`   Content variants: ${contentVariants.length}`);
    console.log(`   Master content: ${masterContent.length}`);
    
    console.log('\n📂 Content by Section:');
    Object.entries(contentBySection).forEach(([section, items]) => {
      console.log(`   ${section}: ${items.length} items`);
    });

    // 5. Test variant filtering logic
    console.log('\n🔄 Testing Variant Filtering:');
    const variantGroups = new Map();
    
    allContent.forEach(content => {
      const sourceId = content.sourceContentId || content.id;
      if (!variantGroups.has(sourceId)) {
        variantGroups.set(sourceId, []);
      }
      variantGroups.get(sourceId).push(content);
    });

    let totalVariants = 0;
    let bestVariants = 0;
    
    for (const [sourceId, variants] of variantGroups) {
      if (variants.length > 1) {
        totalVariants += variants.length;
        bestVariants += 1;
        console.log(`   Source ${sourceId}: ${variants.length} variants`);
        variants.forEach(v => {
          console.log(`     - ${v.title} (ID: ${v.id}, has embedding: ${v.embedding ? 'Yes' : 'No'})`);
        });
      }
    }

    console.log(`   Total variants: ${totalVariants}`);
    console.log(`   Best variants selected: ${bestVariants}`);

    // 6. Test embedding quality
    console.log('\n🔍 Testing Embedding Quality:');
    const embeddingQuality = contentWithEmbeddings.map(content => ({
      id: content.id,
      title: content.title,
      section: content.section?.key,
      embeddingLength: content.embedding ? JSON.parse(content.embedding).length : 0,
      hasHash: !!content.embeddingHash,
      transformationDate: content.transformationDate,
    }));

    console.log(`   Content with valid embeddings: ${embeddingQuality.length}`);
    embeddingQuality.slice(0, 5).forEach(item => {
      console.log(`   - ${item.title} (${item.section}): ${item.embeddingLength} dimensions, hash: ${item.hasHash ? 'Yes' : 'No'}`);
    });

    // 7. Test job embedding
    if (testJob.embedding) {
      const jobEmbedding = JSON.parse(testJob.embedding);
      console.log(`\n🎯 Job Embedding Analysis:`);
      console.log(`   Dimensions: ${jobEmbedding.length}`);
      console.log(`   Hash: ${testJob.embeddingHash}`);
      
      // Test similarity with a few content items
      if (contentWithEmbeddings.length > 0) {
        console.log(`\n🔗 Testing Similarity with Job:`);
        const testContent = contentWithEmbeddings.slice(0, 3);
        
        for (const content of testContent) {
          const contentEmbedding = JSON.parse(content.embedding);
          const similarity = calculateCosineSimilarity(jobEmbedding, contentEmbedding);
          console.log(`   ${content.title}: ${(similarity * 100).toFixed(1)}% similarity`);
        }
      }
    }

    // 8. Summary
    console.log('\n📈 Test Summary:');
    console.log(`   ✅ Database connection: Working`);
    console.log(`   ✅ User found: ${testUser.name}`);
    console.log(`   ✅ Job applications: ${jobApplications.length}`);
    console.log(`   ✅ Content items: ${allContent.length}`);
    console.log(`   ✅ Content with embeddings: ${contentWithEmbeddings.length}`);
    console.log(`   ✅ Content variants: ${contentVariants.length}`);
    console.log(`   ✅ Sections available: ${Object.keys(contentBySection).length}`);

    if (testJob.embedding) {
      console.log(`   ✅ Job has embedding: Ready for RAG`);
    } else {
      console.log(`   ⚠️  Job missing embedding: Will be generated on next update`);
    }

    console.log('\n🎉 Content matching system is ready for testing!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function calculateCosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return Math.max(0, Math.min(1, similarity)); // Clamp between 0 and 1
}

// Run the test
if (require.main === module) {
  testContentMatching();
}

module.exports = { testContentMatching }; 