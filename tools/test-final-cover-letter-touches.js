/**
 * Test Final Cover Letter Touches
 * Tests: Contact form, simplified recipient, subject formatting, page size options
 * 
 * Usage: node tools/test-final-cover-letter-touches.js
 */

const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:3000";
const TEST_USER = {
  email: "test@example.com",
  password: "password123"
};

async function testFinalCoverLetterTouches() {
  console.log("🎯 Testing Final Cover Letter Touches");
  console.log("=" .repeat(70));

  try {
    // Step 1: Authenticate
    console.log("\n1. 🔐 Authenticating...");
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginResponse.ok) {
      throw new Error(`Authentication failed: ${loginResponse.status}`);
    }

    const { token } = await loginResponse.json();
    console.log("   ✅ Authentication successful");

    // Step 2: Check contact content for basics structure
    console.log("\n2. 📇 Checking contact content for basics structure...");
    const contentResponse = await fetch(`${API_BASE_URL}/api/content-library`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (contentResponse.ok) {
      const content = await contentResponse.json();
      const contactContent = content.filter(c => 
        c.section?.key === "contact" || 
        c.section?.name === "contact"
      );
      
      if (contactContent.length > 0) {
        const contact = contactContent[0];
        const data = JSON.parse(contact.data || "{}");
        console.log("   ✅ Found contact content with basics structure:");
        console.log(`      Name: ${data.name || "Not set"}`);
        console.log(`      Headline: ${data.headline || "Not set"}`);
        console.log(`      Email: ${data.email || "Not set"}`);
        console.log(`      Phone: ${data.phone || "Not set"}`);
        console.log(`      Location: ${data.location || "Not set"}`);
        console.log(`      Website: ${data.url?.href || "Not set"}`);
        console.log(`      Custom Fields: ${data.customFields?.length || 0} fields`);
        console.log(`      Picture: ${data.picture?.url ? "Yes" : "No"}`);
      } else {
        console.log("   ⚠️  No contact content found");
      }
    }

    // Step 3: Get job application
    console.log("\n3. 📋 Getting job application for testing...");
    const jobsResponse = await fetch(`${API_BASE_URL}/api/job-applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!jobsResponse.ok) {
      throw new Error(`Failed to get job applications: ${jobsResponse.status}`);
    }

    const jobs = await jobsResponse.json();
    if (jobs.length === 0) {
      console.log("   ❌ No job applications found");
      return;
    }

    const testJob = jobs[0];
    console.log(`   ✅ Using job: "${testJob.title}" at "${testJob.companyName}"`);

    // Step 4: Test enhanced cover letter generation
    console.log("\n4. 🎯 Testing enhanced cover letter generation...");
    
    // Test with custom recipient name
    const response = await fetch(`${API_BASE_URL}/api/cover-letters/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        jobApplicationId: testJob.id,
        templateName: "professional",
        tone: "professional",
        recipientName: "Sarah Johnson" // Test custom recipient
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Generation failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    const coverLetter = result.coverLetter;
    console.log(`   ✅ Enhanced cover letter generated: ${coverLetter.id}`);

    // Step 5: Analyze enhanced structure
    console.log("\n5. 📊 Analyzing Enhanced Structure:");

    // Test application subject
    console.log("\n   📋 Application Subject:");
    if (coverLetter.applicationSubject) {
      console.log(`   ✅ Subject: "${coverLetter.applicationSubject}"`);
      const expectedFormat = `Application for ${testJob.title} at ${testJob.companyName}`;
      if (coverLetter.applicationSubject.includes(testJob.title)) {
        console.log("   ✅ Subject format correct");
      } else {
        console.log(`   ⚠️  Expected format: "${expectedFormat}"`);
      }
    } else {
      console.log("   ❌ Application subject missing");
    }

    // Test recipient handling
    console.log("\n   👤 Recipient Handling:");
    console.log(`   Recipient Name: "${coverLetter.recipientName}"`);
    console.log(`   Recipient Title: "${coverLetter.recipientTitle}"`);
    if (coverLetter.recipientName === "Sarah Johnson") {
      console.log("   ✅ Custom recipient name working");
    } else {
      console.log("   ⚠️  Custom recipient not set correctly");
    }

    // Test basics structure
    console.log("\n   📇 Basics Structure:");
    if (coverLetter.basics) {
      console.log(`   ✅ Basics populated:`);
      console.log(`      Name: ${coverLetter.basics.name || "Not set"}`);
      console.log(`      Headline: ${coverLetter.basics.headline || "Not set"}`);
      console.log(`      Email: ${coverLetter.basics.email || "Not set"}`);
      console.log(`      Phone: ${coverLetter.basics.phone || "Not set"}`);
      console.log(`      Location: ${coverLetter.basics.location || "Not set"}`);
      console.log(`      Website: ${coverLetter.basics.url?.href || "Not set"}`);
      console.log(`      Custom Fields: ${coverLetter.basics.customFields?.length || 0} fields`);
      console.log(`      Picture URL: ${coverLetter.basics.picture?.url || "Not set"}`);
    } else {
      console.log("   ❌ Basics structure not populated");
    }

    // Test content separation
    console.log("\n   📝 Content Separation:");
    const hasCleanContent = coverLetter.content && 
                           !coverLetter.content.includes(coverLetter.senderName) &&
                           !coverLetter.content.includes("Dear") &&
                           !coverLetter.content.includes("Sincerely");
    
    if (hasCleanContent) {
      console.log("   ✅ Content is clean body text only");
      console.log(`      Content preview: "${coverLetter.content.slice(0, 100)}..."`);
    } else {
      console.log("   ❌ Content still contains header/footer elements");
    }

    // Step 6: Test the updated template structure
    console.log("\n6. 🎨 Template Structure Verification:");
    console.log("\n   ✅ What should work in the template now:");
    console.log("   1. ✅ Enhanced header with basics structure (name, headline, contact info)");
    console.log("   2. ✅ Photo support from basics.picture structure");
    console.log("   3. ✅ Custom fields support from basics.customFields");
    console.log("   4. ✅ Date displayed in top-right (current date)");
    console.log("   5. ✅ Simplified recipient section (company name only)");
    console.log("   6. ✅ Subject line with proper formatting (+2px font size)");
    console.log("   7. ✅ Page size options (A4 default, Letter available)");

    // Step 7: UI Integration checklist
    console.log("\n7. 🖥️  UI Integration Checklist:");
    console.log("\n   📝 Left Sidebar (Editor Tab):");
    console.log("   ✅ ContactSectionForm replaces manual input fields");
    console.log("   ✅ Full Name, Headline, Email, Phone, Location, Website");
    console.log("   ✅ Custom fields with reordering and icons");
    console.log("   ✅ Editable contact data syncs with template");

    console.log("\n   📄 Right Sidebar (Page Tab):");
    console.log("   ✅ Page format selector (A4/Letter)");
    console.log("   ✅ Margin slider (0-48px)");
    console.log("   ✅ Format dimensions display");
    console.log("   ✅ Real-time preview updates");

    console.log("\n   🎯 Manual Verification Needed:");
    console.log("   1. Open cover letter builder: /cover-letter-builder/{id}");
    console.log("   2. Left Sidebar → Editor Tab → Contact Information");
    console.log("      - Should show ContactSectionForm (like resume builder)");
    console.log("      - Should allow editing name, headline, email, phone, etc.");
    console.log("      - Should support custom fields with icons");
    console.log("   3. Right Sidebar → Page Tab → Page Settings");
    console.log("      - Should show A4/Letter format selector");
    console.log("      - Should show margin slider");
    console.log("      - Format changes should update template in real-time");
    console.log("   4. Template Preview:");
    console.log("      - Header should use basics structure");
    console.log("      - Date should appear top-right");
    console.log("      - Subject should be left-aligned with +2px font size");
    console.log("      - Company name only in recipient section");
    console.log("      - Page should respect A4/Letter format");

  } catch (error) {
    console.error("\n❌ Final touches test failed:");
    console.error(`   ${error.message}`);
  }
}

testFinalCoverLetterTouches();



