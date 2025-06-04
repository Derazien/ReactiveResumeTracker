const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedMockUser() {
  try {
    // Check if mock user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 'mock-user-123' }
    });

    if (existingUser) {
      console.log('Mock user already exists:', existingUser);
      return existingUser;
    }

    // Create mock user
    const mockUser = await prisma.user.create({
      data: {
        id: 'mock-user-123',
        name: 'Mock Test User',
        username: 'mockuser123',
        email: 'mockuser@test.com',
        provider: 'email',
        emailVerified: true,
        locale: 'en-US',
        secrets: {
          create: {
            id: 'mock-secrets-123',
            password: null, // No password for testing
            lastSignedIn: new Date(),
          }
        }
      },
      include: {
        secrets: true
      }
    });

    console.log('Mock user created successfully:', mockUser);
    return mockUser;
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Mock user already exists (unique constraint)');
      return await prisma.user.findUnique({
        where: { id: 'mock-user-123' }
      });
    }
    console.error('Error creating mock user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedMockUser().catch(console.error);
}

module.exports = { seedMockUser }; 