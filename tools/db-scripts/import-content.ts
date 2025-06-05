import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Temporary mock user ID for testing
const MOCK_USER_ID = 'mock-user-123';

async function clearDatabase() {
  console.log('Clearing existing content...');
  
  // Delete all content in reverse order of dependencies
  await prisma.contentTag.deleteMany({});
  await prisma.contentLibrary.deleteMany({});
  await prisma.tag.deleteMany({});
  
  console.log('Database cleared successfully');
}

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
          userId: MOCK_USER_ID,
        },
      });

      // Create tags if they exist
      if (item.tagIds && item.tagIds.length > 0) {
        for (const tagName of item.tagIds) {
          // Find or create the tag
          const tag = await prisma.tag.findFirst({
            where: { userId: MOCK_USER_ID, name: tagName },
          }) || await prisma.tag.create({
            data: {
              name: tagName,
              color: '#3B82F6', // Default blue color
              userId: MOCK_USER_ID,
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
    throw error;
  }
}

async function main() {
  try {
    await clearDatabase();
    await importContent();
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 