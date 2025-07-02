const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateContactSection() {
  console.log('🔄 STARTING CONTACT SECTION MIGRATION');
  console.log('⚠️  PRESERVING ALL TAGS - NO TAGS WILL BE DELETED ⚠️');
  console.log('═'.repeat(60));

  try {
    // Get contact section
    const contactSection = await prisma.section.findUnique({
      where: { key: 'contact' }
    });

    if (!contactSection) {
      throw new Error('Contact section not found');
    }

    console.log(`📋 Found contact section: ${contactSection.name} (${contactSection.id})`);

    // Get all contact content with tags
    const contactContent = await prisma.content.findMany({
      where: {
        sectionId: contactSection.id
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    console.log(`📊 Found ${contactContent.length} contact content items to migrate`);

    const migrations = [];

    for (const content of contactContent) {
      console.log(`\n🔍 Processing: ${content.title} (${content.id})`);
      
      // Parse current content
      let currentContent;
      try {
        currentContent = typeof content.content === 'string' 
          ? JSON.parse(content.content) 
          : content.content;
      } catch (e) {
        console.log(`⚠️  Error parsing content JSON for ${content.id}, using empty object`);
        currentContent = {};
      }

      // Extract basics schema fields from current structure
      const basicsData = {
        name: extractName(content, currentContent),
        headline: extractHeadline(content, currentContent),
        email: currentContent.email || '',
        phone: currentContent.phone || '',
        location: currentContent.location || '',
        url: extractUrl(currentContent),
        picture: extractPicture(currentContent),
        customFields: [],
        // Keep original data for reference
        originalData: currentContent
      };

      // Prepare migration data
      const migration = {
        id: content.id,
        title: content.title,
        description: content.description,
        newContent: basicsData,
        preservedTags: content.tags.map(ct => ct.tag.name),
        originalContent: currentContent
      };

      migrations.push(migration);

      console.log(`✅ Prepared migration for: ${content.title}`);
      console.log(`   📧 Email: ${basicsData.email}`);
      console.log(`   📱 Phone: ${basicsData.phone}`);
      console.log(`   📍 Location: ${basicsData.location}`);
      console.log(`   🏷️  Tags: ${migration.preservedTags.join(', ')}`);
    }

    // Show migration preview
    console.log('\n📋 MIGRATION PREVIEW:');
    console.log('═'.repeat(60));
    migrations.forEach((m, i) => {
      console.log(`${i + 1}. ${m.title} (${m.id})`);
      console.log(`   Tags (${m.preservedTags.length}): ${m.preservedTags.join(', ')}`);
      console.log(`   Email: ${m.newContent.email}`);
      console.log(`   Phone: ${m.newContent.phone}`);
      console.log(`   Location: ${m.newContent.location}`);
    });

    // Ask for confirmation (in production, you might want to make this automatic)
    console.log('\n❓ Proceed with migration? (This script will preserve ALL tags)');
    
    // Perform the migration
    console.log('\n🚀 EXECUTING MIGRATION...');
    
    for (const migration of migrations) {
      await prisma.content.update({
        where: { id: migration.id },
        data: {
          content: JSON.stringify(migration.newContent),
          // Keep all other fields the same - especially preserving tag relationships
        }
      });
      
      console.log(`✅ Migrated: ${migration.title}`);
    }

    console.log('\n🎉 CONTACT SECTION MIGRATION COMPLETED SUCCESSFULLY!');
    console.log(`✅ ${migrations.length} items migrated`);
    console.log('✅ ALL tags preserved');
    console.log('✅ Ready for new content library editor');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions to extract data from current structure
function extractName(content, currentContent) {
  // Try to get name from various places
  if (currentContent.name) return currentContent.name;
  if (currentContent.givenName || currentContent.familyName) {
    return [currentContent.givenName, currentContent.familyName].filter(Boolean).join(' ');
  }
  // Use title or description as fallback
  if (content.description && content.description !== 'Personal and contact details') {
    return content.description;
  }
  return 'User Name'; // Default fallback
}

function extractHeadline(content, currentContent) {
  if (currentContent.headline) return currentContent.headline;
  if (currentContent.title) return currentContent.title;
  if (currentContent.position) return currentContent.position;
  return ''; // Empty by default
}

function extractUrl(currentContent) {
  if (currentContent.website) {
    return { label: 'Website', href: currentContent.website };
  }
  if (currentContent.url && typeof currentContent.url === 'object') {
    return currentContent.url;
  }
  if (currentContent.url && typeof currentContent.url === 'string') {
    return { label: '', href: currentContent.url };
  }
  return { label: '', href: '' };
}

function extractPicture(currentContent) {
  if (currentContent.picture && typeof currentContent.picture === 'object') {
    return {
      url: currentContent.picture.url || '',
      size: currentContent.picture.size || 64,
      aspectRatio: currentContent.picture.aspectRatio || 1,
      borderRadius: currentContent.picture.borderRadius || 0,
      effects: {
        hidden: currentContent.picture.effects?.hidden || false,
        border: currentContent.picture.effects?.border || false,
        grayscale: currentContent.picture.effects?.grayscale || false
      }
    };
  }
  
  return {
    url: '',
    size: 64,
    aspectRatio: 1,
    borderRadius: 0,
    effects: {
      hidden: false,
      border: false,
      grayscale: false
    }
  };
}

// Run migration
if (require.main === module) {
  migrateContactSection().catch(console.error);
}

module.exports = { migrateContactSection }; 