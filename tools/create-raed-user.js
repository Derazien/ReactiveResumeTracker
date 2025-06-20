const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function createRaedUser() {
  try {
    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: 'raedzein.rz@gmail.com' },
      include: { secrets: true }
    });

    if (existingUser) {
      console.log('User Raed Zein already exists:', {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
        emailVerified: existingUser.emailVerified
      });
      return existingUser;
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash('1234', 10);

    // Create the user
    const raedUser = await prisma.user.create({
      data: {
        name: 'Raed Zein',
        username: 'raedzein',
        email: 'raedzein.rz@gmail.com',
        provider: 'email',
        emailVerified: true, // Set to true to skip email verification
        locale: 'en-US',
        secrets: {
          create: {
            password: hashedPassword,
            lastSignedIn: new Date(),
          }
        }
      },
      include: {
        secrets: true
      }
    });

    console.log('User Raed Zein created successfully:');
    console.log({
      id: raedUser.id,
      name: raedUser.name,
      email: raedUser.email,
      username: raedUser.username,
      emailVerified: raedUser.emailVerified,
      provider: raedUser.provider,
      secretsId: raedUser.secrets?.id
    });
    console.log('Password: 1234');
    
    return raedUser;
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('User already exists (unique constraint violation)');
      // Try to find the existing user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: 'raedzein.rz@gmail.com' },
            { username: 'raedzein' }
          ]
        },
        include: { secrets: true }
      });
      return existingUser;
    }
    console.error('Error creating user Raed Zein:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Function to delete the user (for cleanup if needed)
async function deleteRaedUser() {
  try {
    const deletedUser = await prisma.user.delete({
      where: { email: 'raedzein.rz@gmail.com' }
    });
    console.log('User Raed Zein deleted successfully:', deletedUser);
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--delete')) {
    deleteRaedUser().catch(console.error);
  } else {
    createRaedUser().catch(console.error);
  }
}

module.exports = { createRaedUser, deleteRaedUser }; 