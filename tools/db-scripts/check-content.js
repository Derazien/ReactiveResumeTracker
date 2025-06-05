const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkContent() {
  try {
    const totalCount = await prisma.contentLibrary.count();
    console.log(`✅ Total content items: ${totalCount}`);
    
    const contentByType = await prisma.contentLibrary.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 Content breakdown:');
    contentByType.forEach(item => {
      console.log(`   ${item.type}: ${item._count.id} items`);
    });
    
    const recentItems = await prisma.contentLibrary.findMany({
      select: {
        title: true,
        type: true,
        company: true
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n🎯 Recent content:');
    recentItems.forEach(item => {
      const company = item.company ? ` (${item.company})` : '';
      console.log(`   • ${item.title}${company}`);
    });
    
    const tagCount = await prisma.tag.count();
    console.log(`\n🏷️  Total tags: ${tagCount}`);
    
  } catch (error) {
    console.error('❌ Error checking content:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkContent(); 