const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./apps/server/prisma/dev.db'
    }
  }
});

async function fetchSampleData() {
  console.log('📊 FETCHING SAMPLE DATA FROM DATABASE\n');
  
  try {
    // Fetch one Content item from each section type
    console.log('🗂️ CONTENT LIBRARY DATA:\n');
    
    const sections = await prisma.section.findMany({
      include: {
        content: {
          take: 1,
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        }
      }
    });
    
    sections.forEach(section => {
      if (section.content.length > 0) {
        const content = section.content[0];
        console.log(`🔸 Section: ${section.name} (${section.key})`);
        console.log(`   Content ID: ${content.id}`);
        console.log(`   Title: ${content.title}`);
        console.log(`   Description: ${content.description}`);
        console.log(`   Content JSON: ${content.content}`);
        console.log(`   Company: ${content.company}`);
        console.log(`   Position: ${content.position}`);
        console.log(`   StartDate: ${content.startDate}`);
        console.log(`   EndDate: ${content.endDate}`);
        console.log(`   Location: ${content.location}`);
        console.log(`   Skills: ${content.skills}`);
        console.log(`   Achievements: ${content.achievements}`);
        console.log(`   Proficiency Level: ${content.proficiencyLevel}`);
        console.log(`   Category: ${content.category}`);
        console.log(`   Issuer: ${content.issuer}`);
        console.log(`   URL: ${content.url}`);
        console.log(`   Keywords: ${content.keywords}`);
        console.log(`   Tags: ${content.tags.map(ct => ct.tag.name).join(', ')}\n`);
      }
    });
    
    // Fetch one Resume to see its data structure
    console.log('\n📋 RESUME DATA:\n');
    
    const resume = await prisma.resume.findFirst({
      include: {
        user: true,
        jobApplication: true
      }
    });
    
    if (resume) {
      console.log(`🔸 Resume: ${resume.title} (${resume.slug})`);
      console.log(`   ID: ${resume.id}`);
      console.log(`   User: ${resume.user.name}`);
      console.log(`   Job Application: ${resume.jobApplication?.title || 'None'}`);
      console.log(`   Data Structure (first 500 chars):`);
      console.log(`   ${resume.data.substring(0, 500)}...`);
      
      // Try to parse the data JSON to show structure
      try {
        const resumeData = JSON.parse(resume.data);
        console.log('\n   📊 Resume Data Structure:');
        console.log(`   - Basics: ${resumeData.basics ? 'Present' : 'Missing'}`);
        console.log(`   - Sections: ${resumeData.sections ? Object.keys(resumeData.sections).join(', ') : 'Missing'}`);
        
        if (resumeData.sections) {
          Object.entries(resumeData.sections).forEach(([sectionKey, sectionData]) => {
            if (sectionData.items && Array.isArray(sectionData.items) && sectionData.items.length > 0) {
              console.log(`\n   🔹 ${sectionKey} Section (${sectionData.items.length} items):`);
              console.log(`      First Item Keys: ${Object.keys(sectionData.items[0]).join(', ')}`);
              console.log(`      Sample Item:`, JSON.stringify(sectionData.items[0], null, 4));
            }
          });
        }
      } catch (e) {
        console.log('   ❌ Failed to parse resume data JSON:', e.message);
      }
    } else {
      console.log('   ⚠️ No resumes found in database');
    }
    
  } catch (error) {
    console.error('❌ Database query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchSampleData(); 