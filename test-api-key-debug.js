/**
 * 🔍 Debug Skyvern API Key Validation
 */

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";

/**
 * 🔍 Debug JWT Decoding
 */
function debugJWTDecoding() {
  console.log('🔍 DEBUGGING JWT DECODING');
  console.log('=========================');
  
  try {
    const parts = SKYVERN_API_KEY.split('.');
    console.log(`📊 JWT Parts Count: ${parts.length}`);
    
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format');
      return null;
    }

    const payload = parts[1];
    console.log(`📋 Raw Payload: ${payload}`);
    
    const padding = 4 - (payload.length % 4);
    const paddedPayload = padding !== 4 ? payload + '='.repeat(padding) : payload;
    console.log(`📋 Padded Payload: ${paddedPayload}`);
    
    const decoded = Buffer.from(paddedPayload, 'base64').toString('utf-8');
    console.log(`📋 Decoded String: ${decoded}`);
    
    const parsedPayload = JSON.parse(decoded);
    console.log('📋 Parsed Payload:', parsedPayload);
    
    const organizationId = parsedPayload.sub;
    console.log(`🎯 Organization ID: ${organizationId}`);
    
    return organizationId;

  } catch (error) {
    console.error('💥 JWT Decoding Error:', error.message);
    return null;
  }
}

/**
 * 🗄️ Test Database Query
 */
async function testDatabaseQuery() {
  console.log('\n🗄️ TESTING DATABASE QUERY');
  console.log('==========================');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Find all users with Skyvern settings
    const allUsers = await prisma.userLLMSettings.findMany({
      where: {
        skyvernEnabled: true
      },
      select: {
        userId: true,
        skyvernApiKey: true,
        skyvernEnabled: true
      }
    });

    console.log(`📊 Found ${allUsers.length} users with Skyvern enabled:`);
    allUsers.forEach((user, index) => {
      const keyPreview = user.skyvernApiKey ? user.skyvernApiKey.slice(0, 20) + '...' : 'No key';
      console.log(`   ${index + 1}. User: ${user.userId}, Key: ${keyPreview}`);
    });

    // Check for exact match
    const exactMatch = await prisma.userLLMSettings.findFirst({
      where: {
        skyvernApiKey: SKYVERN_API_KEY,
        skyvernEnabled: true
      },
      select: {
        userId: true,
        skyvernApiKey: true
      }
    });

    if (exactMatch) {
      console.log(`✅ EXACT MATCH FOUND: User ${exactMatch.userId}`);
    } else {
      console.log('❌ NO EXACT MATCH FOUND');
      console.log('\n🔍 Checking if key exists in any user settings...');
      
      const anyMatch = await prisma.userLLMSettings.findFirst({
        where: {
          skyvernApiKey: SKYVERN_API_KEY
        },
        select: {
          userId: true,
          skyvernEnabled: true
        }
      });

      if (anyMatch) {
        console.log(`⚠️  KEY FOUND but Skyvern not enabled: User ${anyMatch.userId}, Enabled: ${anyMatch.skyvernEnabled}`);
      } else {
        console.log('❌ KEY NOT FOUND in any user settings');
      }
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('💥 Database Query Error:', error.message);
  }
}

/**
 * 🚀 Main Debug Function
 */
async function runDebug() {
  console.log('🔍 SKYVERN API KEY DEBUG TOOL');
  console.log('==============================');
  console.log(`🔑 Testing Key: ${SKYVERN_API_KEY.slice(0, 30)}...`);
  
  // Step 1: Debug JWT decoding
  const orgId = debugJWTDecoding();
  
  // Step 2: Test database query
  await testDatabaseQuery();
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (!orgId) {
    console.log('❌ JWT decoding failed - check if API key format is correct');
  } else {
    console.log('✅ JWT decoding successful');
    console.log('💡 If no database match found, you need to:');
    console.log('   1. Log into your app');
    console.log('   2. Go to Settings > Skyvern');
    console.log('   3. Save this API key in your user settings');
    console.log('   4. Ensure "Enable Skyvern" is checked');
  }
}

// 🚀 Run the debug
runDebug().catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});








