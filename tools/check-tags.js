const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTags() {
  try {
    console.log('🏷️  Checking current tags in database...\n');

    // Get all tags
    const tags = await prisma.tag.findMany({
      include: {
        user: {
          select: {
            name: true,
            username: true
          }
        },
        content: {
          include: {
            content: {
              select: {
                id: true,
                title: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${tags.length} tags total\n`);

    tags.forEach(tag => {
      console.log(`🏷️  "${tag.name}" (${tag.color})`);
      console.log(`   User: ${tag.user.name} (@${tag.user.username})`);
      console.log(`   Content: ${tag.content.length} items`);
      
      if (tag.content.length > 0) {
        const contentByType = tag.content.reduce((acc, ct) => {
          const type = ct.content.type;
          if (!acc[type]) acc[type] = 0;
          acc[type]++;
          return acc;
        }, {});
        
        console.log(`   Types: ${Object.entries(contentByType).map(([type, count]) => `${type}:${count}`).join(', ')}`);
      }
      console.log('');
    });

    // Check content items without tags
    const contentWithoutTags = await prisma.contentLibrary.findMany({
      where: {
        tags: {
          none: {}
        }
      },
      select: {
        id: true,
        title: true,
        type: true
      }
    });

    console.log(`📭 Content items without tags: ${contentWithoutTags.length}`);
    if (contentWithoutTags.length > 0) {
      contentWithoutTags.forEach(content => {
        console.log(`   - ${content.title} (${content.type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTags(); 