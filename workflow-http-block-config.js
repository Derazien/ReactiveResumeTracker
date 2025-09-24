// 🎯 HTTP BLOCK CONFIGURATION FOR WORKFLOW
// Add this as the 3rd block in your FOR_LOOP after extract_data_format

const WORKFLOW_HTTP_BLOCK = {
  label: "create_automated_job_application",
  block_type: "http_request",
  method: "POST",
  url: "http://host.docker.internal:3000/api/automation/create-single-job-application",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{user_api_token}}" // You'll need to add this parameter
  },
  body: {
    // Use exact data from extract_data_format block
    title: "{{extract_data_format.title}}",
    companyName: "{{extract_data_format.companyName}}", 
    description: "{{extract_data_format.description}}",
    requirements: "{{extract_data_format.requirements}}",
    extractedTags: "{{extract_data_format.extractedTags}}",
    url: "{{extract_data_format.url}}",
    location: "{{extract_data_format.location}}",
    salary: "{{extract_data_format.salary}}",
    industry: "{{extract_data_format.industry}}",
    status: "{{extract_data_format.status}}",
    notes: "Automatically created via LinkedIn automation workflow"
    // createdViaAutomation will be set to true automatically by the endpoint
  },
  timeout: 30,
  follow_redirects: true,
  continue_on_failure: false,
  parameter_keys: ["user_api_token"], // Add this parameter to workflow
  cache_actions: false
};

// Alternative: Batch processing at the end of workflow (outside FOR_LOOP)
const BATCH_HTTP_BLOCK = {
  label: "create_batch_job_applications", 
  block_type: "http_request",
  method: "POST",
  url: "http://host.docker.internal:3000/api/automation/batch-job-applications",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{user_api_token}}"
  },
  body: {
    jobs: "{{process_jobs.output}}", // All job data from FOR_LOOP
    metadata: {
      workflowId: "{{workflow_id}}",
      timestamp: "{{current_timestamp}}",
      searchKeywords: "{{job_keywords}}",
      searchLocation: "{{location}}"
    }
  },
  timeout: 60,
  follow_redirects: true,
  continue_on_failure: false,
  parameter_keys: ["user_api_token"],
  cache_actions: false
};

console.log('🎯 WORKFLOW HTTP BLOCK CONFIGURATIONS');
console.log('====================================');
console.log('');
console.log('📋 OPTION 1: SINGLE JOB CREATION (RECOMMENDED)');
console.log('===============================================');
console.log('Add this block INSIDE the FOR_LOOP after extract_data_format:');
console.log('');
console.log(JSON.stringify(WORKFLOW_HTTP_BLOCK, null, 2));
console.log('');
console.log('✅ BENEFITS:');
console.log('• Creates job application immediately after extraction');
console.log('• Gets company/contacts data for each job');
console.log('• Can make decisions based on actionableData response');
console.log('• Better error handling per job');
console.log('• Real-time progress tracking');
console.log('');
console.log('📊 RESPONSE STRUCTURE:');
console.log('• success: boolean');
console.log('• data.jobApplication: Created job application');
console.log('• data.company: Company data (with isNew flag)');
console.log('• data.contacts: Existing contacts array');
console.log('• data.actionableData: Decision data for workflow');
console.log('  - companyExists: boolean');
console.log('  - hasContacts: boolean');
console.log('  - suggestedActions: Next steps object');
console.log('');
console.log('📋 OPTION 2: BATCH PROCESSING (ALTERNATIVE)');
console.log('==========================================');
console.log('Add this block OUTSIDE FOR_LOOP at the end of workflow:');
console.log('');
console.log(JSON.stringify(BATCH_HTTP_BLOCK, null, 2));
console.log('');
console.log('🔧 WORKFLOW PARAMETERS TO ADD:');
console.log('===============================');
console.log('Add this parameter to your workflow:');
console.log('');
console.log(JSON.stringify({
  parameter_type: "workflow",
  key: "user_api_token", 
  description: "User API token for authentication",
  workflow_parameter_type: "string",
  default_value: "your-jwt-token-here"
}, null, 2));
console.log('');
console.log('🎯 IMPLEMENTATION STEPS:');
console.log('========================');
console.log('1. Apply database schema changes (npx prisma db push)');
console.log('2. Add automation endpoints to automation-integration.controller.ts');
console.log('3. Update DTO with createdViaAutomation field');
console.log('4. Add HTTP block to your working workflow');
console.log('5. Add user_api_token parameter');
console.log('6. Test with small batch first');
console.log('');
console.log('🚀 EXPECTED WORKFLOW FLOW:');
console.log('==========================');
console.log('1. LOGIN → Navigate → Extract URLs → Transform URLs');
console.log('2. FOR_LOOP over job URLs:');
console.log('   a. Navigate to job (GOTO_URL)');
console.log('   b. Extract job data (EXTRACTION)');
console.log('   c. Create job application (HTTP_REQUEST) 🆕');
console.log('3. Each job gets created with automation flag');
console.log('4. Company detection and contact relationships handled');
console.log('5. Actionable data returned for next steps');

module.exports = {
  WORKFLOW_HTTP_BLOCK,
  BATCH_HTTP_BLOCK
};











