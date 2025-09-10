/**
 * Quick API Test for Cover Letter Tailoring
 * Tests the main consolidated endpoint with existing data
 * 
 * Usage: node tools/quick-api-test.js
 */

const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:3000";
const TEST_USER = {
  email: "test@example.com", // Update with your test user
  password: "password123"     // Update with your password
};

async function quickTest() {
  console.log("🚀 Quick Cover Letter API Test\n");

  try {
    // Step 1: Login
    console.log("1. Authenticating...");
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const { token } = await loginResponse.json();
    console.log("   ✅ Authenticated successfully\n");

    // Step 2: Get job applications
    console.log("2. Fetching job applications...");
    const jobsResponse = await fetch(`${API_BASE_URL}/api/job-applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!jobsResponse.ok) {
      throw new Error(`Failed to get jobs: ${jobsResponse.status}`);
    }

    const jobs = await jobsResponse.json();
    console.log(`   ✅ Found ${jobs.length} job applications\n`);

    if (jobs.length === 0) {
      console.log("❌ No job applications found. Create some first!");
      return;
    }

    // Step 3: Test cover letter generation
    console.log("3. Testing cover letter generation...");
    const testJob = jobs[0];
    console.log(`   Using: ${testJob.title} at ${testJob.companyName}`);

    const startTime = Date.now();
    const coverLetterResponse = await fetch(
      `${API_BASE_URL}/api/job-applications/${testJob.id}/generate-cover-letter`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          templateName: "professional",
          tone: "professional",
          maxParagraphs: 3
        })
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!coverLetterResponse.ok) {
      const errorData = await coverLetterResponse.json().catch(() => ({}));
      throw new Error(`Cover letter generation failed: ${coverLetterResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await coverLetterResponse.json();
    console.log(`   ✅ Generated in ${duration}ms\n`);

    // Step 4: Analyze results
    console.log("4. Analyzing generated cover letter...");
    
    if (result.companyThemes) {
      console.log(`   📊 Company Themes: ${result.companyThemes.join(", ")}`);
    }
    
    if (result.selectedParagraphs) {
      console.log(`   📝 Selected Stories: ${result.selectedParagraphs.length}`);
      result.selectedParagraphs.forEach((story, i) => {
        console.log(`      ${i+1}. ${story.contentType} - ${story.skillTheme}`);
      });
    }
    
    if (result.metadata) {
      console.log(`   📈 Fit Score: ${result.metadata.overallFitScore}%`);
      console.log(`   🎯 Company Alignment: ${result.metadata.companyValueAlignment}%`);
    }

    // Step 5: Quick blueprint check
    console.log("\n5. Quick blueprint compliance check...");
    const letterText = result.coverLetter?.content || result.coverLetter;
    
    if (typeof letterText === 'string') {
      const hasName = /\w+\s+\w+/.test(letterText.split('\n')[0]);
      const hasGreeting = /Dear \w+/i.test(letterText);
      const hasClosing = /Sincerely[,:]?\s*\n*.+/i.test(letterText);
      const hasUnfilledTokens = /\[([^\]]+)\]/.test(letterText);
      
      console.log(`   ${hasName ? '✅' : '❌'} Has proper name header`);
      console.log(`   ${hasGreeting ? '✅' : '❌'} Has Dear greeting`);
      console.log(`   ${hasClosing ? '✅' : '❌'} Has Sincerely closing`);
      console.log(`   ${!hasUnfilledTokens ? '✅' : '❌'} All tokens replaced`);
      
      const wordCount = letterText.split(/\s+/).length;
      console.log(`   ${wordCount <= 400 ? '✅' : '⚠️'} Word count: ${wordCount} ${wordCount > 400 ? '(long)' : '(good)'}`);
    }

    console.log("\n🎉 Quick test completed successfully!");
    console.log("\n📋 Manual verification needed:");
    console.log("   1. Does the cover letter sound authentic and personal?");
    console.log("   2. Are the selected stories relevant to the job/company?"); 
    console.log("   3. Does it follow the exact blueprint template?");
    console.log("   4. Would you be comfortable sending this letter?");

  } catch (error) {
    console.error("\n❌ Quick test failed:");
    console.error(`   ${error.message}`);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Ensure backend is running (.\setup.ps1)");
    console.log("   2. Check .env has proper LLM API keys");
    console.log("   3. Update TEST_USER credentials in this script");
    console.log("   4. Ensure you have job applications and stories in database");
  }
}

quickTest();



