// 🧪 TEST SCRIPT FOR WORKFLOW wpid_440789045004028228
// Prepare test but don't run - user will fill parameters

const { getRealUserSettings } = require('./get-real-settings.js');

// 🎯 TEST CONFIGURATION (User will modify these parameters)
const TEST_PARAMETERS = {
  // LinkedIn credentials (user will fill)
  linkedin_username: "raedzein.rz@gmail.com",
  linkedin_password: "15900593314Loody!",
  
  // Job search parameters (user will modify)
  job_keywords: "Software Engineer",
  location: "Berlin",
  
  // Test settings
  max_jobs: 3  // Start with 1 job for testing
};

class WorkflowTester {
  constructor(workflowId) {
    this.workflowId = workflowId;
    this.settings = null;
  }

  async init() {
    console.log('🧪 WORKFLOW TESTER');
    console.log('==================');
    console.log(`Target Workflow: ${this.workflowId}`);
    console.log('');
    
    this.settings = await getRealUserSettings();
    if (!this.settings) throw new Error('Cannot get user settings');
    
    console.log(`✅ Connected to Skyvern: ${this.settings.baseUrl}`);
    console.log(`👤 User: ${this.settings.userId}`);
    console.log('');
    
    return true;
  }

  validateParameters() {
    console.log('🔍 VALIDATING TEST PARAMETERS');
    console.log('=============================');
    
    const issues = [];
    
    if (TEST_PARAMETERS.linkedin_username === "YOUR_LINKEDIN_EMAIL") {
      issues.push("❌ LinkedIn username not set");
    }
    
    if (TEST_PARAMETERS.linkedin_password === "YOUR_LINKEDIN_PASSWORD") {
      issues.push("❌ LinkedIn password not set");
    }
    
    if (!TEST_PARAMETERS.job_keywords || TEST_PARAMETERS.job_keywords.length < 2) {
      issues.push("❌ Job keywords too short");
    }
    
    if (!TEST_PARAMETERS.location || TEST_PARAMETERS.location.length < 2) {
      issues.push("❌ Location not specified");
    }

    console.log('📊 PARAMETER VALIDATION:');
    console.log(`   LinkedIn Username: ${TEST_PARAMETERS.linkedin_username === "YOUR_LINKEDIN_EMAIL" ? "❌ NOT SET" : "✅ SET"}`);
    console.log(`   LinkedIn Password: ${TEST_PARAMETERS.linkedin_password === "YOUR_LINKEDIN_PASSWORD" ? "❌ NOT SET" : "✅ SET"}`);
    console.log(`   Job Keywords: "${TEST_PARAMETERS.job_keywords}"`);
    console.log(`   Location: "${TEST_PARAMETERS.location}"`);
    console.log(`   Max Jobs: ${TEST_PARAMETERS.max_jobs}`);
    console.log('');
    
    if (issues.length > 0) {
      console.log('⚠️  ISSUES FOUND:');
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log('');
      console.log('🔧 TO FIX: Edit TEST_PARAMETERS in this file');
      return false;
    }
    
    console.log('✅ All parameters valid for testing');
    return true;
  }

  async runTest() {
    console.log('🚀 STARTING WORKFLOW TEST');
    console.log('=========================');
    
    try {
      const response = await fetch(`${this.settings.baseUrl}/api/v1/workflows/${this.workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': this.settings.apiKey },
        body: JSON.stringify({
          workflow_run_data: TEST_PARAMETERS
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ WORKFLOW TEST STARTED!');
      console.log(`🔗 Run ID: ${result.workflow_run_id}`);
      console.log(`📊 Monitor URL: http://localhost:8081/workflows/${this.workflowId}/${result.workflow_run_id}`);
      console.log(`🔍 Debug URL: http://localhost:8081/workflows/${this.workflowId}/debug`);
      console.log('');
      
      console.log('🎯 WHAT TO WATCH FOR:');
      console.log('=====================');
      console.log('✅ extract_job_urls: Should find LinkedIn job URLs');
      console.log('✅ process_jobs FOR_LOOP: Should iterate over job URLs');  
      console.log('✅ current_value: Should contain actual job URL in loop');
      console.log('✅ Job data extraction: Should match exact schema format');
      console.log('✅ Required fields: title and companyName must be present');
      console.log('✅ Data types: Arrays for requirements/extractedTags');
      console.log('');
      
      console.log('📊 SUCCESS CRITERIA:');
      console.log('====================');
      console.log('□ FOR_LOOP receives job URLs from extraction');
      console.log('□ {{current_value}} resolves to actual LinkedIn job URL'); 
      console.log('□ Extracted data matches job application schema exactly');
      console.log('□ No "null" loop_over or undefined variables');
      console.log('□ Job data ready for single job application API');
      console.log('');
      
      return {
        workflowId: this.workflowId,
        runId: result.workflow_run_id,
        monitorUrl: `http://localhost:8081/workflows/${this.workflowId}/${result.workflow_run_id}`,
        debugUrl: `http://localhost:8081/workflows/${this.workflowId}/debug`
      };

    } catch (error) {
      console.error('❌ Test failed to start:', error.message);
      throw error;
    }
  }

  async monitorTest(runId, maxChecks = 10) {
    console.log('👁️  MONITORING TEST EXECUTION');
    console.log('============================');
    console.log('Checking every 30 seconds...');
    console.log('');

    for (let i = 1; i <= maxChecks; i++) {
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      try {
        const response = await fetch(`${this.settings.baseUrl}/api/v1/workflows/${this.workflowId}/runs/${runId}`, {
          headers: { 'Content-Type': 'application/json', 'x-api-key': this.settings.apiKey }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const timestamp = new Date().toISOString().substring(11, 19);
        
        console.log(`[${timestamp}] Check ${i}/${maxChecks}: ${data.status.toUpperCase()} | $${data.total_cost || 0}`);

        // Check specific blocks
        if (data.outputs) {
          const extractionBlock = data.outputs.extract_job_urls_output;
          if (extractionBlock?.status === 'completed') {
            if (extractionBlock.output?.length > 0) {
              console.log(`[${timestamp}]    ✅ EXTRACTION: ${extractionBlock.output.length} job URLs found`);
            } else {
              console.log(`[${timestamp}]    ❌ EXTRACTION: No job URLs found`);
            }
          }

          const forLoopBlock = data.outputs.process_jobs_output;
          if (forLoopBlock?.status === 'completed') {
            console.log(`[${timestamp}]    ✅ FOR_LOOP: Job processing completed`);
          } else if (forLoopBlock?.status === 'failed') {
            console.log(`[${timestamp}]    ❌ FOR_LOOP: ${forLoopBlock.failure_reason || 'Unknown error'}`);
          }
        }

        // Check for completion
        if (['completed', 'failed', 'terminated', 'cancelled'].includes(data.status)) {
          console.log('');
          console.log('🏁 TEST COMPLETED');
          console.log('=================');
          console.log(`Status: ${data.status.toUpperCase()}`);
          console.log(`Cost: $${data.total_cost || 0}`);
          
          if (data.status === 'completed') {
            console.log('');
            console.log('🎉 SUCCESS! Analyze the extracted data:');
            console.log('1. Check if job application schema is followed exactly');
            console.log('2. Verify required fields (title, companyName) are present');
            console.log('3. Confirm data types match your system schema');
            console.log('4. Ready to add single job application API call');
          }
          
          break;
        }
      } catch (error) {
        console.log(`[${new Date().toISOString().substring(11, 19)}] Check ${i}: Error - ${error.message}`);
      }
    }
  }

  async fullTest() {
    try {
      await this.init();
      
      if (!this.validateParameters()) {
        console.log('');
        console.log('⚠️  TEST CANNOT RUN - Parameters need to be set');
        console.log('Edit TEST_PARAMETERS in this file and try again');
        return false;
      }

      const testResult = await this.runTest();
      console.log('🎯 Test started successfully!');
      console.log('Monitor the URLs above to see results');
      console.log('');
      console.log('💡 TIP: Watch the debug URL to see variable mapping in real-time');
      
      // Optionally monitor (user can comment this out for manual monitoring)
      // await this.monitorTest(testResult.runId);
      
      return testResult;

    } catch (error) {
      console.error('❌ Full test failed:', error.message);
      process.exit(1);
    }
  }
}

// 🎯 USAGE INSTRUCTIONS
console.log('🧪 WORKFLOW TEST SCRIPT');
console.log('=======================');
console.log('');
console.log('📝 TO RUN THIS TEST:');
console.log('1. Set your LinkedIn credentials in TEST_PARAMETERS');
console.log('2. Adjust job_keywords and location as needed');
console.log('3. Run: node test-workflow-wpid440789045004028228.js <workflow_id>');
console.log('');
console.log('🎯 EXAMPLE:');
console.log('node test-workflow-wpid440789045004028228.js w_123456789');
console.log('');

// Export for use
module.exports = { WorkflowTester, TEST_PARAMETERS };

// Run if called directly with workflow ID
if (require.main === module) {
  const workflowId = process.argv[2];
  
  if (!workflowId) {
    console.error('❌ Usage: node test-workflow-wpid440789045004028228.js <workflow_id>');
    process.exit(1);
  }
  
//   console.log('⚠️  READY TO TEST BUT PARAMETERS NOT SET');
//   console.log('========================================');
//   console.log('Please edit TEST_PARAMETERS in this file first:');
//   console.log('- linkedin_username: Your LinkedIn email');
//   console.log('- linkedin_password: Your LinkedIn password');
//   console.log('- job_keywords: What type of jobs to search');
//   console.log('- location: Where to search for jobs');
//   console.log('');
//   console.log('Then run the test again.');
  
//   Uncomment this line once parameters are set:
  const tester = new WorkflowTester(workflowId);
  tester.fullTest();
}











