const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Embedding service configuration (ported from embedding.service.ts)
const COHERE_API_KEY = process.env.COHERE_API_KEY || process.env.CO_API_KEY;
const COHERE_MODEL = process.env.COHERE_MODEL || "embed-english-v3.0";

// Color generation for tags
const TAG_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", 
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1",
  "#14B8A6", "#F43F5E", "#8B5A2B", "#64748B", "#A855F7"
];

function getRandomColor() {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

function generateHash(text) {
  return crypto.createHash("sha256")
    .update(text.toLowerCase().trim())
    .digest("hex");
}

async function generateEmbedding(text) {
  if (!COHERE_API_KEY) {
    throw new Error("Cohere API key not configured");
  }

  if (!text || text.trim().length === 0) {
    throw new Error("Input text cannot be empty");
  }

  const inputText = text.trim();
  console.log(`  🔄 Generating embedding for text: ${inputText.slice(0, 100)}...`);

  const response = await fetch("https://api.cohere.ai/v1/embed", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts: [inputText],
      model: COHERE_MODEL,
      input_type: "search_document",
      truncate: "END",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Cohere API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  
  if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
    throw new Error("Invalid response from Cohere API: missing embeddings");
  }

  const embedding = data.embeddings[0];
  
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Invalid embedding format from Cohere API");
  }

  console.log(`  ✅ Generated embedding with ${embedding.length} dimensions`);
  return {
    embedding: JSON.stringify(embedding),
    hash: generateHash(inputText),
    model: COHERE_MODEL,
  };
}

async function findOrCreateTag(tagName, userId) {
  // Try to find existing tag
  let tag = await prisma.tag.findFirst({
    where: {
      name: tagName,
      userId: userId
    }
  });

  if (!tag) {
    // Create new tag with random color
    tag = await prisma.tag.create({
      data: {
        name: tagName,
        color: getRandomColor(),
        userId: userId
      }
    });
    console.log(`  🏷️  Created new tag: ${tagName} (${tag.color})`);
  } else {
    console.log(`  🏷️  Found existing tag: ${tagName}`);
  }

  return tag;
}

async function importExperienceContent() {
  try {
    console.log('🚀 Starting experience content import/update process...');
    
    // Check if embedding service is available
    if (!COHERE_API_KEY) {
      console.error('❌ Cohere API key not found. Please set COHERE_API_KEY or CO_API_KEY environment variable.');
      return;
    }

    // Find the user
    console.log('👤 Finding user...');
    const user = await prisma.user.findUnique({
      where: { email: 'raedzein.rz@gmail.com' }
    });

    if (!user) {
      console.error('❌ User not found: raedzein.rz@gmail.com');
      return;
    }
    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Find the experience section
    console.log('📋 Finding experience section...');
    const experienceSection = await prisma.section.findFirst({
      where: { key: 'experience' }
    });

    if (!experienceSection) {
      console.error('❌ Experience section not found');
      return;
    }
    console.log(`✅ Found experience section: ${experienceSection.key} (${experienceSection.name})`);

    // Load the JSON data
    console.log('📄 Loading content data...');
    const contentDataPath = path.join(__dirname, 'exports', 'new_adjusted_primary_content.json');
    
    if (!fs.existsSync(contentDataPath)) {
      console.error(`❌ Content file not found: ${contentDataPath}`);
      return;
    }

    const contentItems = JSON.parse(fs.readFileSync(contentDataPath, 'utf8'));
    console.log(`✅ Loaded ${contentItems.length} content items`);

    // Track variants for later deletion
    const variantsToDelete = [];
    const processedIds = [];

    // Process each content item
    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      const isNew = !item.id;
      
      console.log(`\n📝 Processing item ${i + 1}/${contentItems.length}: ${item.title} (${isNew ? 'NEW' : 'UPDATE'})`);

      try {
        // Prepare data for database
        const dbData = {
          title: item.title,
          description: item.description,
          data: JSON.stringify(item.data),
          sectionId: experienceSection.id,
          userId: user.id,
        };

        let contentId;
        let content;

        if (isNew) {
          // Create new content
          console.log('  ➕ Creating new content...');
          content = await prisma.content.create({
            data: dbData
          });
          contentId = content.id;
          console.log(`  ✅ Created content with ID: ${contentId}`);
        } else {
          // Update existing content
          console.log(`  🔄 Updating existing content: ${item.id}`);
          content = await prisma.content.update({
            where: { id: item.id },
            data: dbData
          });
          contentId = item.id;
          console.log(`  ✅ Updated content: ${contentId}`);
        }

        processedIds.push(contentId);

        // Find variants to delete (but don't delete yet)
        const variants = await prisma.content.findMany({
          where: { sourceContentId: contentId },
          select: { id: true, title: true }
        });

        if (variants.length > 0) {
          console.log(`  ⚠️  Found ${variants.length} variants to delete later:`);
          variants.forEach(variant => {
            console.log(`    - ${variant.id}: ${variant.title}`);
            variantsToDelete.push(variant.id);
          });
        }

        // Process tags
        console.log('  🏷️  Processing tags...');
        const tagIds = [];
        
        if (item.data.tags && Array.isArray(item.data.tags)) {
          for (const tagName of item.data.tags) {
            const tag = await findOrCreateTag(tagName, user.id);
            tagIds.push(tag.id);
          }
        }

        // Create content-tag relationships
        if (tagIds.length > 0) {
          // Remove existing tags
          await prisma.contentTag.deleteMany({
            where: { contentId: contentId }
          });

          // Add new tags
          await prisma.contentTag.createMany({
            data: tagIds.map(tagId => ({
              contentId: contentId,
              tagId: tagId
            }))
          });
          console.log(`  ✅ Associated ${tagIds.length} tags with content`);
        }

        // Generate embedding from data field only
        console.log('  🧠 Generating embedding...');
        const embeddingResult = await generateEmbedding(JSON.stringify(item.data));
        
        // Update content with embedding
        await prisma.content.update({
          where: { id: contentId },
          data: {
            embedding: embeddingResult.embedding,
            embeddingHash: embeddingResult.hash,
            transformationDate: new Date(),
            transformationNotes: `Generated using ${embeddingResult.model}`
          }
        });
        console.log(`  ✅ Updated content with embedding`);

        console.log(`  ✅ Successfully processed: ${item.title}`);

      } catch (error) {
        console.error(`  ❌ Error processing item ${item.title}:`, error.message);
        throw error; // Stop the entire process as requested
      }
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`  - Total items processed: ${contentItems.length}`);
    console.log(`  - New items created: ${contentItems.filter(item => !item.id).length}`);
    console.log(`  - Items updated: ${contentItems.filter(item => item.id).length}`);
    console.log(`  - Variants found for deletion: ${variantsToDelete.length}`);

    if (variantsToDelete.length > 0) {
      console.log('\n⚠️  Variants to delete (run separate script if needed):');
      variantsToDelete.forEach(variantId => {
        console.log(`  - ${variantId}`);
      });
      
      // Save variants list to file for later deletion
      const variantsFile = path.join(__dirname, 'exports', 'variants-to-delete.json');
      fs.writeFileSync(variantsFile, JSON.stringify(variantsToDelete, null, 2));
      console.log(`  📄 Variants list saved to: ${variantsFile}`);
    }

    console.log('\n✅ Import process completed successfully!');

  } catch (error) {
    console.error('❌ Import process failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importExperienceContent(); 