const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./apps/server/prisma/dev.db'
    }
  }
});

async function checkDatabase() {
  console.log('🔍 CHECKING DATABASE CONTENTS\n');
  
  try {
    // Count entries in each table
    const userCount = await prisma.user.count();
    const resumeCount = await prisma.resume.count();
    const contentCount = await prisma.content.count();
    const sectionCount = await prisma.section.count();
    const tagCount = await prisma.tag.count();
    
    console.log('📊 Table Counts:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Resumes: ${resumeCount}`);
    console.log(`   Content Items: ${contentCount}`);
    console.log(`   Sections: ${sectionCount}`);
    console.log(`   Tags: ${tagCount}\n`);
    
    // Show some sample data if available
    if (contentCount > 0) {
      console.log('📋 Sample Content Items:');
      const contents = await prisma.content.findMany({
        take: 3,
        include: {
          section: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
      
      contents.forEach((content, i) => {
        console.log(`   ${i+1}. ${content.title} (${content.section.name})`);
        console.log(`      Description: ${content.description || 'None'}`);
        console.log(`      Content: ${content.content.substring(0, 100)}...`);
        console.log(`      Company: ${content.company || 'None'}`);
        console.log(`      Position: ${content.position || 'None'}`);
      });
    }
    
    if (resumeCount > 0) {
      console.log('\n📄 Sample Resume:');
      const resume = await prisma.resume.findFirst();
      console.log(`   Title: ${resume.title}`);
      console.log(`   Data Sample: ${resume.data.substring(0, 200)}...`);
    }
    
    if (sectionCount > 0) {
      console.log('\n📚 Available Sections:');
      const sections = await prisma.section.findMany({
        orderBy: { order: 'asc' }
      });
      
      sections.forEach(section => {
        console.log(`   - ${section.name} (${section.key}) - Order: ${section.order}, Active: ${section.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 