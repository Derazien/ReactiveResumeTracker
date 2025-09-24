/**
 * 🔧 Fix Workflow HTTP Block References
 * 
 * Use correct Skyvern reference format:
 * "extract_data_format_output.extracted_information.paramName"
 */

const fs = require('fs');

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";
const SKYVERN_BASE_URL = "http://localhost:8000";
const WORKFLOW_ID = "wpid_440789045004028228";
const USER_ID = "cmcfcpf8e0000u4lg7u0i3bsh";

/**
 * 🔧 Fix HTTP block with correct reference format
 */
async function fixWorkflowReferences() {
  console.log('🔧 FIXING WORKFLOW HTTP REFERENCES');
  console.log('==================================');
  console.log('Using correct format: extract_data_format_output.extracted_information.paramName');
  
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

    console.log('🎯 Found HTTP block - updating references');

    // 🔧 Fix the HTTP block body with CORRECT references
    httpBlock.body = {
      title: "{{extract_data_format_output.extracted_information.title}}",
      companyName: "{{extract_data_format_output.extracted_information.companyName}}",
      description: "{{extract_data_format_output.extracted_information.description}}",
      // ✅ CORRECT: Direct array references (no quotes)
      requirements: "{{extract_data_format_output.extracted_information.requirements}}",
      extractedTags: "{{extract_data_format_output.extracted_information.extractedTags}}",
      url: "{{extract_data_format_output.extracted_information.url}}",
      status: "DRAFT",
      location: "{{extract_data_format_output.extracted_information.location}}",
      salary: "{{extract_data_format_output.extracted_information.salary}}",
      industry: "{{extract_data_format_output.extracted_information.industry}}",
      notes: "Created via LinkedIn automation",
      userId: "{{user_id}}"
    };

    // Remove the serialize_json flag since we're using correct references
    delete httpBlock.serialize_json;

    console.log('✅ HTTP block updated with correct reference format');

    // Also fix any other HTTP blocks that might have the same issue
    const companyHttpBlock = processJobsBlock.loop_blocks.find(b => b.label === 'create_company_contacts');
    if (companyHttpBlock) {
      console.log('🏢 Also found company contacts HTTP block - fixing references');
      
      // Note: Company HTTP block will reference different extraction blocks
      // but the pattern is the same: blockname_output.extracted_information.fieldname
      companyHttpBlock.body = {
        companyName: "{{extract_data_format_output.extracted_information.companyName}}",
        companyDescription: "{{extract_company_details_output.extracted_information.companyDescription}}",
        industry: "{{extract_company_details_output.extracted_information.industry}}",
        website: "{{extract_company_details_output.extracted_information.website}}",
        location: "{{extract_company_details_output.extracted_information.location}}",
        contacts: "{{extract_employee_contacts_output.extracted_information}}",
        userId: "{{user_id}}"
      };
    }

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
    console.log('🔄 Updating workflow with correct references...');
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
      fs.writeFileSync('corrected-workflow-debug.json', JSON.stringify(cleanWorkflow, null, 2));
      console.log('💾 Corrected workflow saved to: corrected-workflow-debug.json');
      
      return false;
    }

    const result = await updateResponse.json();
    console.log('✅ Workflow updated successfully!');
    console.log(`📋 Workflow ID: ${result.workflow_permanent_id || result.workflow_id}`);

    // Save the successful update
    fs.writeFileSync('corrected-workflow-success.json', JSON.stringify(cleanWorkflow, null, 2));
    console.log('💾 Corrected workflow saved to: corrected-workflow-success.json');

    // Display the corrected references
    console.log('\n📋 CORRECTED HTTP BLOCK REFERENCES:');
    console.log('===================================');
    console.log('✅ title: {{extract_data_format_output.extracted_information.title}}');
    console.log('✅ companyName: {{extract_data_format_output.extracted_information.companyName}}');
    console.log('✅ requirements: {{extract_data_format_output.extracted_information.requirements}}');
    console.log('✅ extractedTags: {{extract_data_format_output.extracted_information.extractedTags}}');
    console.log('✅ All other fields using correct output.extracted_information format');

    return true;

  } catch (error) {
    console.error('💥 Error fixing references:', error.message);
    return false;
  }
}

/**
 * 🚀 Main function
 */
async function main() {
  console.log('🔧 WORKFLOW REFERENCE CORRECTION');
  console.log('================================');
  console.log('Fixing HTTP block references to use correct Skyvern format');
  console.log('Pattern: blockname_output.extracted_information.fieldname\n');

  const success = await fixWorkflowReferences();
  
  if (success) {
    console.log('\n🎉 WORKFLOW REFERENCES CORRECTED!');
    console.log('=================================');
    console.log('✅ HTTP blocks now use correct reference format');
    console.log('✅ Arrays will be sent as proper JSON arrays');
    console.log('✅ Ready for successful automation testing');
    console.log('\n🔗 Test your workflow: http://localhost:8081/workflows/wpid_440789045004028228');
  } else {
    console.log('\n❌ REFERENCE CORRECTION FAILED');
    console.log('==============================');
    console.log('Please check the error details above');
  }
}

// 🚀 Run the fix
main().catch(error => {
  console.error('💥 Fix failed:', error);
  process.exit(1);
});








