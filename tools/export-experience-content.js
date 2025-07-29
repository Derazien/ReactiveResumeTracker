const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportExperienceContent() {
  try {
    console.log('🔍 Finding experience section...');
    
    // First, find the experience section
    const experienceSection = await prisma.section.findFirst({
      where: {
        OR: [
          { key: 'experience' },
          { key: 'sect_experience' },
          { key: { contains: 'experience' } }
        ]
      }
    });

    if (!experienceSection) {
      console.log('❌ No experience section found. Available sections:');
      const allSections = await prisma.section.findMany({
        select: { id: true, key: true, name: true }
      });
      allSections.forEach(section => {
        console.log(`   - ${section.key} (${section.name})`);
      });
      return;
    }

    console.log(`✅ Found experience section: ${experienceSection.key} (${experienceSection.name})`);

    // Find all content items with no sourceContentId for the experience section
    console.log('📊 Querying content items...');
    const contentItems = await prisma.content.findMany({
      where: {
        sectionId: experienceSection.id,
        sourceContentId: null
      },
      include: {
        section: {
          select: { key: true, name: true }
        },
        tags: {
          include: {
            tag: {
              select: { name: true, color: true }
            }
          }
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${contentItems.length} unique experience content items`);

    // Prepare data for export
    const exportData = contentItems.map(item => {
      // Parse the data field if it's JSON
      let parsedData = {};
      try {
        parsedData = JSON.parse(item.data);
      } catch (e) {
        console.warn(`⚠️  Could not parse data for item ${item.id}:`, e.message);
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        section: {
          key: item.section.key,
          name: item.section.name
        },
        data: parsedData,
        tags: item.tags.map(t => ({
          name: t.tag.name,
          color: t.tag.color
        })),
        user: {
          name: item.user.name,
          email: item.user.email
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Export to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `experience-content-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    console.log(`💾 Exported to: ${filepath}`);

    // Also export as CSV for easier analysis
    const csvFilename = `experience-content-${timestamp}.csv`;
    const csvFilepath = path.join(exportDir, csvFilename);
    
    const csvHeaders = [
      'ID',
      'Title', 
      'Description',
      'Section Key',
      'Company',
      'Position',
      'Location',
      'Date',
      'Summary',
      'Tags',
      'User Name',
      'User Email',
      'Created At',
      'Updated At'
    ];

    const csvRows = [csvHeaders.join(',')];
    
    exportData.forEach(item => {
      const row = [
        `"${item.id}"`,
        `"${item.title || ''}"`,
        `"${item.description || ''}"`,
        `"${item.section.key}"`,
        `"${item.data.company || ''}"`,
        `"${item.data.position || ''}"`,
        `"${item.data.location || ''}"`,
        `"${item.data.date || ''}"`,
        `"${(item.data.summary || '').replace(/"/g, '""')}"`, // Escape quotes in summary
        `"${item.tags.map(t => t.name).join('; ')}"`,
        `"${item.user.name}"`,
        `"${item.user.email}"`,
        `"${item.createdAt}"`,
        `"${item.updatedAt}"`
      ];
      csvRows.push(row.join(','));
    });

    fs.writeFileSync(csvFilepath, csvRows.join('\n'));
    console.log(`📊 Exported CSV to: ${csvFilepath}`);

    // Print summary
    console.log('\n📈 Export Summary:');
    console.log(`   Total items: ${exportData.length}`);
    console.log(`   Section: ${experienceSection.key} (${experienceSection.name})`);
    console.log(`   Date range: ${exportData[exportData.length - 1]?.createdAt} to ${exportData[0]?.createdAt}`);
    
    // Show some sample data
    if (exportData.length > 0) {
      console.log('\n🎯 Sample items:');
      exportData.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.data.company || 'No company'})`);
        console.log(`      Tags: ${item.tags.map(t => t.name).join(', ') || 'None'}`);
        console.log(`      User: ${item.user.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error exporting experience content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
exportExperienceContent(); 