/**
 * 🔍 Fetch Current Workflow wpid_440789045004028228
 * 
 * This script fetches the existing workflow to understand the current structure
 * before enhancing it with HTTP automation blocks.
 */

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";
const SKYVERN_BASE_URL = "http://localhost:8000";
const WORKFLOW_ID = "wpid_440789045004028228";

/**
 * 🔍 Fetch and analyze current workflow
 */
async function fetchCurrentWorkflow() {
  console.log('🔍 FETCHING CURRENT WORKFLOW');
  console.log('============================');
  console.log(`📋 Workflow ID: ${WORKFLOW_ID}`);
  console.log(`🔑 API Key: ${SKYVERN_API_KEY.slice(0, 20)}...`);
  console.log(`🌐 Base URL: ${SKYVERN_BASE_URL}`);

  try {
    const response = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'x-api-key': SKYVERN_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to fetch workflow:', error);
      return null;
    }

    const workflow = await response.json();
    console.log('✅ Workflow fetched successfully!');
    
    // Analyze the workflow structure
    console.log('\n📊 WORKFLOW ANALYSIS');
    console.log('====================');
    console.log(`📝 Title: ${workflow.title || 'No title'}`);
    console.log(`📄 Description: ${workflow.description || 'No description'}`);
    console.log(`🔧 Proxy Location: ${workflow.proxy_location || 'Not set'}`);
    console.log(`🔗 Webhook: ${workflow.webhook_callback_url || 'Not set'}`);

    // Analyze parameters
    const parameters = workflow.workflow_definition?.parameters || [];
    console.log(`\n🎯 PARAMETERS (${parameters.length}):`);
    parameters.forEach((param, index) => {
      console.log(`   ${index + 1}. ${param.key} (${param.workflow_parameter_type}) - ${param.description}`);
      if (param.default_value) {
        console.log(`      Default: ${param.default_value}`);
      }
    });

    // Analyze blocks
    const blocks = workflow.workflow_definition?.blocks || [];
    console.log(`\n🧩 BLOCKS (${blocks.length}):`);
    blocks.forEach((block, index) => {
      console.log(`   ${index + 1}. ${block.label} (${block.block_type})`);
      if (block.title) {
        console.log(`      Title: ${block.title}`);
      }
      if (block.url) {
        console.log(`      URL: ${block.url}`);
      }
      if (block.loop_over) {
        console.log(`      Loops over: ${block.loop_over}`);
      }
      if (block.loop_blocks) {
        console.log(`      Loop blocks: ${block.loop_blocks.length} blocks`);
        block.loop_blocks.forEach((loopBlock, loopIndex) => {
          console.log(`         ${loopIndex + 1}. ${loopBlock.label} (${loopBlock.block_type})`);
        });
      }
    });

    // Save the workflow for analysis
    const fs = require('fs');
    fs.writeFileSync('current-workflow-backup.json', JSON.stringify(workflow, null, 2));
    console.log('\n💾 Workflow saved to: current-workflow-backup.json');

    return workflow;

  } catch (error) {
    console.error('💥 Error fetching workflow:', error.message);
    return null;
  }
}

/**
 * 🚀 Main function
 */
async function main() {
  const workflow = await fetchCurrentWorkflow();
  
  if (workflow) {
    console.log('\n🎯 READY FOR ENHANCEMENT');
    console.log('========================');
    console.log('✅ Current workflow structure analyzed');
    console.log('✅ Backup saved to current-workflow-backup.json');
    console.log('🔄 Next: Add HTTP automation blocks and conditional logic');
  } else {
    console.log('\n❌ Failed to fetch workflow');
    console.log('Please check:');
    console.log('• Skyvern is running (http://localhost:8000)');
    console.log('• API key is correct');
    console.log('• Workflow ID exists');
  }
}

// 🚀 Run the fetch
main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});








