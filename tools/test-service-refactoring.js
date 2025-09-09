/**
 * Test script to verify Phase 1 service refactoring
 * Run with: node tools/test-service-refactoring.js
 */

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:3000";
const TEST_USER_EMAIL = "test@example.com";
const TEST_USER_PASSWORD = "password123";

// Test results
const testResults = {
  passed: [],
  failed: [],
  errors: [],
};

// Helper function to make API calls
async function apiCall(endpoint, method = "GET", body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error.message);
    return { status: 500, error: error.message };
  }
}

// Test 1: Service Health Check
async function testServiceHealth() {
  console.log("\n🔍 Testing Service Health...");
  
  try {
    const health = await apiCall("/health");
    if (health.status === 200) {
      testResults.passed.push("Service health check");
      console.log("✅ Service is healthy");
    } else {
      testResults.failed.push("Service health check");
      console.log("❌ Service health check failed");
    }
  } catch (error) {
    testResults.errors.push({ test: "Service health", error: error.message });
  }
}

// Test 2: Authentication
async function testAuthentication() {
  console.log("\n🔍 Testing Authentication...");
  
  try {
    const loginResponse = await apiCall("/api/auth/login", "POST", {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      testResults.passed.push("Authentication");
      console.log("✅ Authentication successful");
      return loginResponse.data.token;
    } else {
      testResults.failed.push("Authentication");
      console.log("❌ Authentication failed");
      return null;
    }
  } catch (error) {
    testResults.errors.push({ test: "Authentication", error: error.message });
    return null;
  }
}

// Test 3: Job Analysis Service
async function testJobAnalysisService(token) {
  console.log("\n🔍 Testing Job Analysis Service...");
  
  const sampleJobPosting = `
    Senior Software Engineer at TechCorp
    
    We are looking for a Senior Software Engineer to join our team.
    
    Requirements:
    - 5+ years of experience with React and Node.js
    - Strong understanding of cloud technologies (AWS/Azure)
    - Experience with microservices architecture
    - Excellent communication skills
    
    Location: San Francisco, CA
    Salary: $150,000 - $200,000
  `;

  try {
    const response = await apiCall(
      "/api/job-applications/analyze",
      "POST",
      { jobText: sampleJobPosting },
      token
    );

    if (response.status === 200 && response.data.title && response.data.company) {
      testResults.passed.push("Job Analysis Service");
      console.log("✅ Job analysis successful");
      console.log(`   - Title: ${response.data.title}`);
      console.log(`   - Company: ${response.data.company}`);
      console.log(`   - Tags: ${response.data.extractedTags?.join(", ")}`);
      return response.data;
    } else {
      testResults.failed.push("Job Analysis Service");
      console.log("❌ Job analysis failed");
      return null;
    }
  } catch (error) {
    testResults.errors.push({ test: "Job Analysis", error: error.message });
    return null;
  }
}

// Test 4: Company Research Service
async function testCompanyResearchService(token, companyName = "TechCorp") {
  console.log("\n🔍 Testing Company Research Service...");
  
  try {
    // Test company search/match
    const searchResponse = await apiCall(
      `/api/companies/search?name=${companyName}`,
      "GET",
      null,
      token
    );

    if (searchResponse.status === 200) {
      testResults.passed.push("Company Search");
      console.log("✅ Company search successful");
      
      // If company doesn't exist, test creation
      if (!searchResponse.data || searchResponse.data.length === 0) {
        const createResponse = await apiCall(
          "/api/companies",
          "POST",
          {
            name: companyName,
            description: "A leading technology company",
            industry: "Technology",
          },
          token
        );

        if (createResponse.status === 201) {
          testResults.passed.push("Company Creation");
          console.log("✅ Company creation successful");
          return createResponse.data;
        } else {
          testResults.failed.push("Company Creation");
          console.log("❌ Company creation failed");
        }
      } else {
        console.log(`   - Found existing company: ${searchResponse.data[0].name}`);
        return searchResponse.data[0];
      }
    } else {
      testResults.failed.push("Company Search");
      console.log("❌ Company search failed");
    }
  } catch (error) {
    testResults.errors.push({ test: "Company Research", error: error.message });
  }
  
  return null;
}

// Test 5: Resume Generation Service
async function testResumeGenerationService(token, jobApplicationId) {
  console.log("\n🔍 Testing Resume Generation Service...");
  
  if (!jobApplicationId) {
    console.log("⚠️  Skipping resume generation test - no job application ID");
    return;
  }

  try {
    const response = await apiCall(
      `/api/job-applications/${jobApplicationId}/generate-resume`,
      "POST",
      {
        targetLength: "one-page",
        customInstructions: "Focus on technical skills",
      },
      token
    );

    if (response.status === 200 && response.data.resumeId) {
      testResults.passed.push("Resume Generation");
      console.log("✅ Resume generation successful");
      console.log(`   - Resume ID: ${response.data.resumeId}`);
      console.log(`   - Selected content items: ${response.data.selectedContent?.experience?.length || 0} experiences`);
      return response.data;
    } else {
      testResults.failed.push("Resume Generation");
      console.log("❌ Resume generation failed");
      return null;
    }
  } catch (error) {
    testResults.errors.push({ test: "Resume Generation", error: error.message });
    return null;
  }
}

// Test 6: Cover Letter Generation Service
async function testCoverLetterGenerationService(token, jobApplicationId) {
  console.log("\n🔍 Testing Cover Letter Generation Service...");
  
  if (!jobApplicationId) {
    console.log("⚠️  Skipping cover letter generation test - no job application ID");
    return;
  }

  try {
    const response = await apiCall(
      `/api/job-applications/${jobApplicationId}/generate-cover-letter`,
      "POST",
      {
        tone: "professional",
        customInstructions: "Emphasize leadership experience",
      },
      token
    );

    if (response.status === 200 && response.data.content) {
      testResults.passed.push("Cover Letter Generation");
      console.log("✅ Cover letter generation successful");
      console.log(`   - Used paragraphs: ${response.data.usedParagraphs?.length || 0}`);
      console.log(`   - Themes: ${response.data.themes?.join(", ")}`);
      console.log(`   - Fit score: ${response.data.fitScore}%`);
      return response.data;
    } else {
      testResults.failed.push("Cover Letter Generation");
      console.log("❌ Cover letter generation failed");
      return null;
    }
  } catch (error) {
    testResults.errors.push({ test: "Cover Letter Generation", error: error.message });
    return null;
  }
}

// Test 7: Integration Test - Full Job Application Flow
async function testFullJobApplicationFlow(token) {
  console.log("\n🔍 Testing Full Job Application Flow...");
  
  try {
    // Step 1: Create job application from job posting
    const jobPosting = `
      Product Manager at InnovateTech
      
      We're seeking a Product Manager to lead our mobile app development.
      
      Requirements:
      - 3+ years of product management experience
      - Experience with agile methodologies
      - Strong analytical skills
      - MBA preferred
    `;

    const createResponse = await apiCall(
      "/api/job-applications/analyze-and-create",
      "POST",
      { jobText: jobPosting, url: "https://example.com/job" },
      token
    );

    if (createResponse.status !== 201) {
      testResults.failed.push("Full Job Application Flow - Creation");
      console.log("❌ Job application creation failed");
      return;
    }

    const jobApplicationId = createResponse.data.id;
    console.log(`✅ Job application created: ${jobApplicationId}`);

    // Step 2: Generate tailored resume
    const resumeResponse = await apiCall(
      `/api/job-applications/${jobApplicationId}/generate-resume`,
      "POST",
      { targetLength: "one-page" },
      token
    );

    if (resumeResponse.status !== 200) {
      testResults.failed.push("Full Job Application Flow - Resume");
      console.log("❌ Resume generation in flow failed");
      return;
    }

    console.log(`✅ Resume generated: ${resumeResponse.data.resumeId}`);

    // Step 3: Generate cover letter
    const coverLetterResponse = await apiCall(
      `/api/job-applications/${jobApplicationId}/generate-cover-letter`,
      "POST",
      { tone: "enthusiastic" },
      token
    );

    if (coverLetterResponse.status !== 200) {
      testResults.failed.push("Full Job Application Flow - Cover Letter");
      console.log("❌ Cover letter generation in flow failed");
      return;
    }

    console.log(`✅ Cover letter generated`);
    
    testResults.passed.push("Full Job Application Flow");
    console.log("✅ Full job application flow completed successfully!");

    // Cleanup - delete test job application
    await apiCall(
      `/api/job-applications/${jobApplicationId}`,
      "DELETE",
      null,
      token
    );

  } catch (error) {
    testResults.errors.push({ test: "Full Job Application Flow", error: error.message });
    console.log("❌ Full job application flow failed");
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting Service Refactoring Tests");
  console.log("=" .repeat(50));

  // Run health check
  await testServiceHealth();

  // Authenticate
  const token = await testAuthentication();
  if (!token) {
    console.log("\n⚠️  Cannot proceed without authentication");
    printResults();
    return;
  }

  // Test individual services
  const jobAnalysis = await testJobAnalysisService(token);
  const company = await testCompanyResearchService(token);
  
  // Create a test job application for testing generation services
  let testJobApplicationId = null;
  if (jobAnalysis && company) {
    const createJobApp = await apiCall(
      "/api/job-applications",
      "POST",
      {
        title: jobAnalysis.title,
        companyName: company.name,
        companyId: company.id,
        description: jobAnalysis.description,
        requirements: JSON.stringify(jobAnalysis.requirements),
      },
      token
    );
    
    if (createJobApp.status === 201) {
      testJobApplicationId = createJobApp.data.id;
    }
  }

  // Test generation services
  await testResumeGenerationService(token, testJobApplicationId);
  await testCoverLetterGenerationService(token, testJobApplicationId);

  // Test full integration flow
  await testFullJobApplicationFlow(token);

  // Cleanup test job application
  if (testJobApplicationId) {
    await apiCall(`/api/job-applications/${testJobApplicationId}`, "DELETE", null, token);
  }

  // Print results
  printResults();
}

// Print test results
function printResults() {
  console.log("\n" + "=" .repeat(50));
  console.log("📊 Test Results Summary");
  console.log("=" .repeat(50));
  
  console.log(`\n✅ Passed: ${testResults.passed.length}`);
  testResults.passed.forEach(test => console.log(`   - ${test}`));
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ Failed: ${testResults.failed.length}`);
    testResults.failed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (testResults.errors.length > 0) {
    console.log(`\n⚠️  Errors: ${testResults.errors.length}`);
    testResults.errors.forEach(({ test, error }) => 
      console.log(`   - ${test}: ${error}`)
    );
  }
  
  const totalTests = testResults.passed.length + testResults.failed.length;
  const successRate = totalTests > 0 
    ? Math.round((testResults.passed.length / totalTests) * 100) 
    : 0;
  
  console.log("\n" + "=" .repeat(50));
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log("=" .repeat(50));
  
  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsFile = path.join(__dirname, `test-results-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  console.log(`\n💾 Results saved to: ${resultsFile}`);
}

// Run tests
runTests().catch(error => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});

