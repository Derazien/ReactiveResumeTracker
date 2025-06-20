const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Use the actual RaedZein user
const RAED_USER_ID = 'cmc56vsoc0000u4dkf8t82ymv';

async function ensureRaedUser() {
  const user = await prisma.user.findUnique({ where: { id: RAED_USER_ID } });
  if (!user) {
    throw new Error('RaedZein user not found in database. Please ensure the user exists.');
  }
  console.log(`✅ Found user: ${user.name} (${user.username}) - ${user.email}`);
  return user;
}

// Database is already empty, no need to clear

async function importContent() {
  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'extracted_fullstack.json');
    const contentData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log('Starting content import...');

    // Process each content item
    for (const item of contentData) {
      // Create the content item
      const content = await prisma.contentLibrary.create({
        data: {
          title: item.title,
          description: item.description,
          content: JSON.stringify(item.content),
          type: item.type,
          company: item.company,
          position: item.position,
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
          location: item.location,
          skills: JSON.stringify(item.skills),
          achievements: JSON.stringify(item.achievements),
          userId: RAED_USER_ID,
        },
      });

      // Create tags if they exist
      if (item.tagIds && item.tagIds.length > 0) {
        for (const tagName of item.tagIds) {
          // Find or create the tag
          const tag = await prisma.tag.findFirst({
            where: { userId: RAED_USER_ID, name: tagName },
          }) || await prisma.tag.create({
            data: {
              name: tagName,
              color: '#3B82F6', // Default blue color
              userId: RAED_USER_ID,
            },
          });

          // Create the content-tag relationship
          await prisma.contentTag.create({
            data: {
              contentId: content.id,
              tagId: tag.id,
            },
          });
        }
      }

      console.log(`Imported: ${item.title}`);
    }

    console.log('Content import completed successfully');
  } catch (error) {
    console.error('Error importing content:', error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    throw error;
  }
}

async function main() {
  try {
    await ensureRaedUser();
    await importContent();
  } catch (error) {
    console.error('Error in main process:', error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 