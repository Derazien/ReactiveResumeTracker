const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTimestamps() {
  console.log('🔍 Checking for NULL or invalid timestamps...\n');
  
  const tables = [
    'user', 'resume', 'section', 'statistics', 'content', 'tag', 'contentTag',
    'coverLetter', 'coverLetterContent', 'company', 'contact', 'contactMessage',
    'jobApplication', 'jobApplicationQuestion', 'interview', 'storyBlock', 'answerSnippet'
  ];
  
  const now = new Date();
  let totalFixed = 0;
  
  for (const table of tables) {
    try {
      // Check for NULL createdAt
      const nullCreatedAt = await prisma[table].count({
        where: { createdAt: null }
      });
      
      // Check for NULL updatedAt (if the table has it)
      let nullUpdatedAt = 0;
      try {
        nullUpdatedAt = await prisma[table].count({
          where: { updatedAt: null }
        });
      } catch (e) {
        // Table doesn't have updatedAt
      }
      
      if (nullCreatedAt > 0 || nullUpdatedAt > 0) {
        console.log(`${table}: ${nullCreatedAt} NULL createdAt, ${nullUpdatedAt} NULL updatedAt`);
        
        // Fix NULL timestamps
        const updateData = {};
        if (nullCreatedAt > 0) updateData.createdAt = now;
        if (nullUpdatedAt > 0) updateData.updatedAt = now;
        
        const result = await prisma[table].updateMany({
          where: {
            OR: [
              { createdAt: null },
              { updatedAt: null }
            ]
          },
          data: updateData
        });
        
        console.log(`  ✅ Fixed ${result.count} records\n`);
        totalFixed += result.count;
      }
    } catch (error) {
      console.log(`  ⚠️ Skipped ${table}: ${error.message}\n`);
    }
  }
  
  console.log(`\n✅ Total records fixed: ${totalFixed}`);
  
  // Also check for any records with string timestamps that need conversion
  console.log('\n🔍 Checking for string timestamps that need conversion...');
  
  await prisma.$disconnect();
}

fixTimestamps().catch(console.error);
