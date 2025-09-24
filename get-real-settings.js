// 🔑 GET REAL USER SETTINGS FOR TESTING
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getRealUserSettings() {
  console.log('🔍 Fetching real user settings from database...');
  
  try {
    // Get the first user with Skyvern settings enabled
    const userWithSettings = await prisma.userLLMSettings.findFirst({
      where: {
        skyvernEnabled: true,
        skyvernApiKey: {
          not: null
        }
      },
      include: {
        user: true
      }
    });
    
    if (!userWithSettings) {
      console.log('❌ No user found with Skyvern settings enabled');
      console.log('💡 Please enable Skyvern in your user settings first');
      return null;
    }
    
    console.log('✅ Found user with Skyvern settings:');
    console.log(`   User: ${userWithSettings.user.name} (${userWithSettings.user.email})`);
    console.log(`   API Key: ${userWithSettings.skyvernApiKey?.substring(0, 20)}...`);
    console.log(`   Base URL: ${userWithSettings.skyvernBaseUrl}`);
    console.log(`   Enabled: ${userWithSettings.skyvernEnabled}`);
    
    return {
      userId: userWithSettings.userId,
      apiKey: userWithSettings.skyvernApiKey,
      baseUrl: userWithSettings.skyvernBaseUrl || 'http://localhost:8000',
      userName: userWithSettings.user.name,
      userEmail: userWithSettings.user.email
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch user settings:', error.message);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line execution
if (require.main === module) {
  getRealUserSettings().then(settings => {
    if (settings) {
      console.log('\n🚀 Ready for testing with real settings!');
      console.log('💡 Use these settings in your test scripts');
    } else {
      console.log('\n❌ No settings available for testing');
    }
  });
}

module.exports = { getRealUserSettings };
















