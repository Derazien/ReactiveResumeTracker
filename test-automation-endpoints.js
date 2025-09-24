/**
 * 🧪 Test Automation Endpoints with Real Skyvern API Key
 */

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";
const API_BASE_URL = "http://localhost:3000/api/automation";
const USER_ID = "cmcfcpf8e0000u4lg7u0i3bsh";
// 📝 Test Data
const testJobData = {
  title: "🧪 TEST: Senior Frontend Developer",
  companyName: "🧪 TEST: Acme Corporation",
  description: "We are looking for a senior frontend developer to join our growing team. You'll work with React, TypeScript, and modern web technologies.",
  requirements: [
    "5+ years React experience",
    "TypeScript proficiency", 
    "REST API integration",
    "Git/GitHub workflow"
  ],
  extractedTags: ["React", "TypeScript", "JavaScript", "Frontend", "REST API"],
  url: "https://example.com/jobs/senior-frontend-developer",
  status: "DRAFT",
  location: "San Francisco, CA (Remote friendly)",
  salary: "$120k - $160k",
  industry: "Software Technology",
  notes: "This is a test job application created via automation endpoints",
  userId: USER_ID
};

const testCompanyContactsData = {
  companyName: "🧪 TEST: Acme Corporation", // Must match job application
  companyDescription: "Leading software technology company specializing in innovative web solutions and enterprise applications.",
  industry: "Software Technology",
  website: "https://acme-corp.example.com",
  location: "San Francisco, CA",
  contacts: [
    {
      name: "🧪 TEST: Sarah Johnson",
      title: "Engineering Manager",
      email: "sarah.johnson@acme-corp.example.com",
      linkedinUrl: "https://linkedin.com/in/sarah-johnson-test",
      phone: "+1-555-0123"
    },
    {
      name: "🧪 TEST: Mike Chen",
      title: "Senior Tech Recruiter", 
      linkedinUrl: "https://linkedin.com/in/mike-chen-recruiter-test"
    },
    {
      name: "🧪 TEST: Alex Rivera",
      title: "VP of Engineering",
      email: "alex.rivera@acme-corp.example.com",
      linkedinUrl: "https://linkedin.com/in/alex-rivera-vp-test"
    }
  ],
  userId: USER_ID
};

/**
 * 🎯 Test Job Application Endpoint
 */
async function testJobApplicationEndpoint() {
  console.log('\n🎯 TESTING JOB APPLICATION ENDPOINT');
  console.log('=====================================');

  try {
    const response = await fetch(`${API_BASE_URL}/job-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-skyvern-api-key': SKYVERN_API_KEY
      },
      body: JSON.stringify(testJobData)
    });

    const result = await response.json();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Body:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ Job Application Test PASSED');
      
      // Store job application ID for cleanup
      global.testJobApplicationId = result.data?.jobApplication?.id;
      global.testCompanyAssessment = result.data?.companyAssessment;
      
      console.log(`📝 Job Application ID: ${global.testJobApplicationId}`);
      console.log(`🏢 Company Assessment:`, global.testCompanyAssessment);
      
      return result;
    } else {
      console.log('\n❌ Job Application Test FAILED');
      return null;
    }

  } catch (error) {
    console.error('\n💥 Job Application Test ERROR:', error.message);
    return null;
  }
}

/**
 * 🏢 Test Company Contacts Endpoint
 */
async function testCompanyContactsEndpoint() {
  console.log('\n🏢 TESTING COMPANY CONTACTS ENDPOINT');
  console.log('====================================');

  try {
    const response = await fetch(`${API_BASE_URL}/company-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-skyvern-api-key': SKYVERN_API_KEY
      },
      body: JSON.stringify(testCompanyContactsData)
    });

    const result = await response.json();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Body:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ Company Contacts Test PASSED');
      
      // Store company and contact IDs for cleanup
      global.testCompanyId = result.data?.company?.id;
      global.testContactIds = result.data?.contacts?.map(c => c.id) || [];
      
      console.log(`🏢 Company ID: ${global.testCompanyId}`);
      console.log(`👥 Contact IDs: [${global.testContactIds.join(', ')}]`);
      
      return result;
    } else {
      console.log('\n❌ Company Contacts Test FAILED');
      return null;
    }

  } catch (error) {
    console.error('\n💥 Company Contacts Test ERROR:', error.message);
    return null;
  }
}

/**
 * 🧹 Display Cleanup Information
 */
function displayCleanupInfo() {
  console.log('\n🧹 CLEANUP INFORMATION');
  console.log('======================');
  
  if (global.testJobApplicationId) {
    console.log(`📝 Job Application to delete: ${global.testJobApplicationId}`);
  }
  
  if (global.testCompanyId) {
    console.log(`🏢 Company to delete: ${global.testCompanyId}`);
  }
  
  if (global.testContactIds && global.testContactIds.length > 0) {
    console.log(`👥 Contacts to delete: [${global.testContactIds.join(', ')}]`);
  }
  
  console.log('\n💡 Run cleanup script: node cleanup-test-data.js');
}

/**
 * 🚀 Main Test Runner
 */
async function runTests() {
  console.log('🧪 AUTOMATION ENDPOINTS TEST SUITE');
  console.log('==================================');
  console.log(`🔑 Using Skyvern API Key: ${SKYVERN_API_KEY.slice(0, 20)}...`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  
  // Test 1: Job Application Endpoint
  const jobResult = await testJobApplicationEndpoint();
  
  if (!jobResult) {
    console.log('\n❌ Job application test failed - stopping tests');
    process.exit(1);
  }
  
  // Test 2: Company Contacts Endpoint (only if job application suggests it's needed)
  if (global.testCompanyAssessment?.needsCompanyCreation || global.testCompanyAssessment?.needsContactExtraction) {
    console.log('\n🎯 Company assessment suggests creating company/contacts...');
    await testCompanyContactsEndpoint();
  } else {
    console.log('\n🎯 Company assessment suggests company/contacts NOT needed');
    console.log('    (Testing anyway for endpoint validation)');
    await testCompanyContactsEndpoint();
  }
  
  // Display cleanup info
  displayCleanupInfo();
  
  console.log('\n🎉 ALL TESTS COMPLETED!');
  console.log('\n⚠️  IMPORTANT: Remember to run cleanup script to remove test data');
}

// 🚀 Run the tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});