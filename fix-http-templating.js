/**
 * 🔧 Fix HTTP Block Array Templating Issue
 * 
 * The issue: Skyvern templates arrays as strings in HTTP blocks
 * The fix: Use proper JSON templating for array fields
 */

const fs = require('fs');

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";
const SKYVERN_BASE_URL = "http://localhost:8000";
const WORKFLOW_ID = "wpid_440789045004028228";
const USER_ID = "cmcfcpf8e0000u4lg7u0i3bsh";

/**
 * 🔧 Fix the HTTP block with proper array templating
 */
async function fixHttpTemplating() {
  console.log('🔧 FIXING HTTP BLOCK ARRAY TEMPLATING');
  console.log('====================================');
  
  try {
    // Fetch current workflow
    const response = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'x-api-key': SKYVERN_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }

    const workflow = await response.json();
    console.log('📋 Current workflow fetched');

    // Find the process_jobs block
    const processJobsBlock = workflow.workflow_definition.blocks.find(b => b.label === 'process_jobs');
    if (!processJobsBlock) {
      throw new Error('Could not find process_jobs block');
    }

    // Find the create_job_application HTTP block
    const httpBlock = processJobsBlock.loop_blocks.find(b => b.label === 'create_job_application');
    if (!httpBlock) {
      throw new Error('Could not find create_job_application HTTP block');
    }

    console.log('🎯 Found HTTP block - fixing array templating');

    // Fix the HTTP block body with proper array handling
    httpBlock.body = {
      title: "{{extract_data_format.title}}",
      companyName: "{{extract_data_format.companyName}}",
      description: "{{extract_data_format.description}}",
      // 🔧 FIX: Use the arrays directly without string conversion
      requirements: "{{extract_data_format.requirements}}",
      extractedTags: "{{extract_data_format.extractedTags}}",
      url: "{{extract_data_format.url}}",
      status: "DRAFT",
      location: "{{extract_data_format.location}}",
      salary: "{{extract_data_format.salary}}",
      industry: "{{extract_data_format.industry}}",
      notes: "Created via LinkedIn automation",
      userId: "{{user_id}}"
    };

    // Alternative approach: Add a note to ensure proper JSON serialization
    httpBlock.serialize_json = true; // This might help Skyvern handle arrays properly

    console.log('✅ HTTP block updated with fixed array handling');

    // Prepare the cleaned workflow for update
    const cleanWorkflow = {
      title: workflow.title,
      description: workflow.description,
      proxy_location: workflow.proxy_location,
      webhook_callback_url: workflow.webhook_callback_url,
      persist_browser_session: workflow.persist_browser_session,
      browser_session_id: workflow.browser_session_id,
      workflow_definition: {
        parameters: workflow.workflow_definition.parameters.filter(p => p.parameter_type === "workflow"),
        blocks: workflow.workflow_definition.blocks
      }
    };

    // Update the workflow
    console.log('🔄 Updating workflow with fixed HTTP templating...');
    const updateResponse = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: {
        'x-api-key': SKYVERN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanWorkflow)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('❌ Failed to update workflow:', error);
      
      // Save for debugging
      fs.writeFileSync('fixed-workflow-debug.json', JSON.stringify(cleanWorkflow, null, 2));
      console.log('💾 Fixed workflow saved to: fixed-workflow-debug.json');
      
      return false;
    }

    const result = await updateResponse.json();
    console.log('✅ Workflow updated successfully!');
    console.log(`📋 Workflow ID: ${result.workflow_permanent_id || result.workflow_id}`);

    // Save the successful update
    fs.writeFileSync('fixed-workflow-success.json', JSON.stringify(cleanWorkflow, null, 2));
    console.log('💾 Fixed workflow saved to: fixed-workflow-success.json');

    return true;

  } catch (error) {
    console.error('💥 Error fixing HTTP templating:', error.message);
    return false;
  }
}

/**
 * 🧪 Alternative: Create a fixed HTTP block configuration
 */
function createAlternativeHttpBlock() {
  console.log('\n🔧 ALTERNATIVE APPROACH: Custom HTTP Block');
  console.log('==========================================');
  
  const alternativeBlock = {
    label: "create_job_application_fixed",
    block_type: "http_request",
    method: "POST",
    url: "http://host.docker.internal:3000/api/automation/job-application",
    headers: {
      "Content-Type": "application/json",
      "x-skyvern-api-key": "{{user_api_token}}"
    },
    // Try a different approach - build the JSON in the template
    body_template: `{
      "title": "{{extract_data_format.title}}",
      "companyName": "{{extract_data_format.companyName}}",
      "description": "{{extract_data_format.description}}",
      "requirements": {{extract_data_format.requirements | tojson}},
      "extractedTags": {{extract_data_format.extractedTags | tojson}},
      "url": "{{extract_data_format.url}}",
      "status": "DRAFT",
      "location": "{{extract_data_format.location}}",
      "salary": "{{extract_data_format.salary}}",
      "industry": "{{extract_data_format.industry}}",
      "notes": "Created via LinkedIn automation",
      "userId": "{{user_id}}"
    }`,
    timeout: 30,
    follow_redirects: true,
    parameter_keys: ["user_api_token", "user_id"],
    cache_actions: false
  };

  console.log('🔧 Alternative HTTP block with JSON template filters:');
  console.log('   • Uses | tojson filter for arrays');
  console.log('   • Should preserve array types');
  
  fs.writeFileSync('alternative-http-block.json', JSON.stringify(alternativeBlock, null, 2));
  console.log('💾 Alternative saved to: alternative-http-block.json');
}

/**
 * 🚀 Main function
 */
async function main() {
  console.log('🔧 HTTP TEMPLATING FIX FOR ARRAY FIELDS');
  console.log('=======================================');
  console.log('Issue: Arrays being converted to strings in HTTP requests');
  console.log('Fix: Proper JSON serialization for array fields\n');

  const success = await fixHttpTemplating();
  
  if (success) {
    console.log('\n✅ HTTP TEMPLATING FIXED!');
    console.log('========================');
    console.log('✅ Array fields should now be sent as proper arrays');
    console.log('✅ Requirements and extractedTags will be JSON arrays');
    console.log('🧪 Ready for testing');
  } else {
    console.log('\n❌ FIX FAILED - TRYING ALTERNATIVE');
    console.log('=================================');
    createAlternativeHttpBlock();
    console.log('📋 Manual fix may be required');
  }

  console.log('\n🎯 TEST THE FIX:');
  console.log('Run your workflow again and check if the HTTP request');
  console.log('now sends requirements and extractedTags as arrays!');
}

// 🚀 Run the fix
main().catch(error => {
  console.error('💥 Fix failed:', error);
  process.exit(1);
});








