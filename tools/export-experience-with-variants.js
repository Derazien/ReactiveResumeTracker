const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportExperienceWithVariants() {
  try {
    console.log('🔍 Finding experience section...');
    
    // Find the experience section
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
      console.log('❌ No experience section found.');
      return;
    }

    console.log(`✅ Found experience section: ${experienceSection.key} (${experienceSection.name})`);

    // Find all unique experience content items (those with no sourceContentId)
    console.log('📊 Querying unique experience content items...');
    const uniqueContentItems = await prisma.content.findMany({
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
        },
        variants: {
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${uniqueContentItems.length} unique experience content items`);

    // Create export directory
    const exportDir = path.join(__dirname, 'exports', 'experience-variants');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Process each unique content item
    for (let i = 0; i < uniqueContentItems.length; i++) {
      const uniqueItem = uniqueContentItems[i];
      const variants = uniqueItem.variants;
      
      console.log(`\n📝 Processing item ${i + 1}/${uniqueContentItems.length}: ${uniqueItem.title}`);
      console.log(`   Variants found: ${variants.length}`);

      // Parse data for unique item
      let uniqueData = {};
      try {
        uniqueData = JSON.parse(uniqueItem.data);
      } catch (e) {
        console.warn(`⚠️  Could not parse data for unique item ${uniqueItem.id}:`, e.message);
      }

      // Create content for the file
      let fileContent = `# Experience: ${uniqueItem.title}\n`;
      fileContent += `## Unique Content (Master)\n\n`;
      fileContent += `**ID:** ${uniqueItem.id}\n`;
      fileContent += `**Title:** ${uniqueItem.title}\n`;
      fileContent += `**Description:** ${uniqueItem.description || 'N/A'}\n`;
      fileContent += `**Company:** ${uniqueData.company || 'N/A'}\n`;
      fileContent += `**Position:** ${uniqueData.position || 'N/A'}\n`;
      fileContent += `**Location:** ${uniqueData.location || 'N/A'}\n`;
      fileContent += `**Date:** ${uniqueData.date || 'N/A'}\n`;
      fileContent += `**URL:** ${uniqueData.url?.href || 'N/A'}\n`;
      fileContent += `**Tags:** ${uniqueItem.tags.map(t => t.tag.name).join(', ') || 'None'}\n`;
      fileContent += `**User:** ${uniqueItem.user.name} (${uniqueItem.user.email})\n`;
      fileContent += `**Created:** ${uniqueItem.createdAt}\n`;
      fileContent += `**Updated:** ${uniqueItem.updatedAt}\n\n`;

      // Summary section
      fileContent += `### Summary (Master)\n`;
      fileContent += `${uniqueData.summary || 'No summary provided'}\n\n`;

      // Variants section
      if (variants.length > 0) {
        fileContent += `## Variants (${variants.length} total)\n\n`;
        
        variants.forEach((variant, index) => {
          let variantData = {};
          try {
            variantData = JSON.parse(variant.data);
          } catch (e) {
            console.warn(`⚠️  Could not parse data for variant ${variant.id}:`, e.message);
          }

          fileContent += `### Variant ${index + 1}\n\n`;
          fileContent += `**ID:** ${variant.id}\n`;
          fileContent += `**Title:** ${variant.title}\n`;
          fileContent += `**Description:** ${variant.description || 'N/A'}\n`;
          fileContent += `**Company:** ${variantData.company || 'N/A'}\n`;
          fileContent += `**Position:** ${variantData.position || 'N/A'}\n`;
          fileContent += `**Location:** ${variantData.location || 'N/A'}\n`;
          fileContent += `**Date:** ${variantData.date || 'N/A'}\n`;
          fileContent += `**URL:** ${variantData.url?.href || 'N/A'}\n`;
          fileContent += `**Tags:** ${variant.tags.map(t => t.tag.name).join(', ') || 'None'}\n`;
          fileContent += `**User:** ${variant.user.name} (${variant.user.email})\n`;
          fileContent += `**Created:** ${variant.createdAt}\n`;
          fileContent += `**Updated:** ${variant.updatedAt}\n\n`;

          // Summary section for variant
          fileContent += `#### Summary (Variant ${index + 1})\n`;
          fileContent += `${variantData.summary || 'No summary provided'}\n\n`;
        });

        // Comparison section
        fileContent += `## Key Differences Analysis\n\n`;
        
        // Position comparison
        const positions = [uniqueData.position, ...variants.map(v => {
          try {
            return JSON.parse(v.data).position;
          } catch (e) {
            return null;
          }
        })].filter(Boolean);
        
        if (positions.length > 1) {
          fileContent += `### Position Variations:\n`;
          positions.forEach((pos, idx) => {
            const prefix = idx === 0 ? 'Master' : `Variant ${idx}`;
            fileContent += `- **${prefix}:** ${pos}\n`;
          });
          fileContent += `\n`;
        }

        // Summary comparison
        const summaries = [uniqueData.summary, ...variants.map(v => {
          try {
            return JSON.parse(v.data).summary;
          } catch (e) {
            return null;
          }
        })].filter(Boolean);
        
        if (summaries.length > 1) {
          fileContent += `### Summary Variations:\n`;
          summaries.forEach((summary, idx) => {
            const prefix = idx === 0 ? 'Master' : `Variant ${idx}`;
            fileContent += `#### ${prefix} Summary:\n`;
            fileContent += `${summary}\n\n`;
          });
        }

        // Tags comparison
        const allTags = new Set();
        uniqueItem.tags.forEach(t => allTags.add(t.tag.name));
        variants.forEach(v => v.tags.forEach(t => allTags.add(t.tag.name)));
        
        if (allTags.size > 0) {
          fileContent += `### All Tags Used:\n`;
          Array.from(allTags).sort().forEach(tag => {
            fileContent += `- ${tag}\n`;
          });
          fileContent += `\n`;
        }

      } else {
        fileContent += `## No Variants Found\n\n`;
        fileContent += `This experience has no variants.\n\n`;
      }

      // Consolidation suggestions
      fileContent += `## Consolidation Suggestions\n\n`;
      fileContent += `### Recommended Actions:\n`;
      if (variants.length > 0) {
        fileContent += `1. **Review position variations** - Choose the most comprehensive/accurate title\n`;
        fileContent += `2. **Merge summary content** - Combine the best elements from all versions\n`;
        fileContent += `3. **Consolidate tags** - Merge all relevant tags into the master content\n`;
        fileContent += `4. **Update master content** - Apply the consolidated changes\n`;
        fileContent += `5. **Delete variants** - Remove variant entries after consolidation\n\n`;
        
        fileContent += `### Key Questions for Consolidation:\n`;
        fileContent += `- Which position title is most accurate and comprehensive?\n`;
        fileContent += `- Which summary version has the most relevant achievements?\n`;
        fileContent += `- Are there any unique details in variants that should be preserved?\n`;
        fileContent += `- Which tags are most relevant for this experience?\n`;
      } else {
        fileContent += `- No consolidation needed - this is a standalone experience\n`;
      }

      // Create filename (sanitize for filesystem)
      const sanitizedTitle = uniqueItem.title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const filename = `${i + 1}-${sanitizedTitle}-${uniqueItem.id.substring(0, 8)}.md`;
      const filepath = path.join(exportDir, filename);

      fs.writeFileSync(filepath, fileContent);
      console.log(`   💾 Exported to: ${filename}`);
    }

    console.log(`\n✅ Export complete! Files saved to: ${exportDir}`);
    console.log(`📊 Summary:`);
    console.log(`   - Total unique experiences: ${uniqueContentItems.length}`);
    console.log(`   - Total variants across all experiences: ${uniqueContentItems.reduce((sum, item) => sum + item.variants.length, 0)}`);
    
    // Show some stats
    const experiencesWithVariants = uniqueContentItems.filter(item => item.variants.length > 0);
    if (experiencesWithVariants.length > 0) {
      console.log(`   - Experiences with variants: ${experiencesWithVariants.length}`);
      console.log(`   - Average variants per experience: ${(uniqueContentItems.reduce((sum, item) => sum + item.variants.length, 0) / uniqueContentItems.length).toFixed(1)}`);
    }

  } catch (error) {
    console.error('❌ Error exporting experience with variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
exportExperienceWithVariants(); 