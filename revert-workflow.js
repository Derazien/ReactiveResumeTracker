/**
 * 🚨 EMERGENCY REVERT - Restore Original Workflow
 * 
 * Revert the workflow back to its original working state
 */

const fs = require('fs');

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";
const SKYVERN_BASE_URL = "http://localhost:8000";
const WORKFLOW_ID = "wpid_440789045004028228";

async function revertWorkflow() {
  console.log('🚨 EMERGENCY REVERT - RESTORING ORIGINAL WORKFLOW');
  console.log('=================================================');
  
  try {
    // Read the original workflow backup
    const originalWorkflow = JSON.parse(fs.readFileSync('current-workflow-backup.json', 'utf8'));
    
    console.log('📋 Original workflow loaded from backup');
    console.log(`📝 Title: ${originalWorkflow.title}`);
    console.log(`🧩 Original blocks: ${originalWorkflow.workflow_definition.blocks.length}`);
    
    // Remove the computed output parameters that Skyvern adds
    const cleanWorkflow = {
      title: originalWorkflow.title,
      description: originalWorkflow.description,
      proxy_location: originalWorkflow.proxy_location,
      webhook_callback_url: originalWorkflow.webhook_callback_url,
      persist_browser_session: originalWorkflow.persist_browser_session,
      browser_session_id: originalWorkflow.browser_session_id,
      workflow_definition: {
        parameters: originalWorkflow.workflow_definition.parameters.filter(p => p.parameter_type === "workflow"),
        blocks: originalWorkflow.workflow_definition.blocks
      }
    };

    console.log('🔄 Reverting workflow via API...');
    const response = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: {
        'x-api-key': SKYVERN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanWorkflow)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to revert workflow:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ WORKFLOW REVERTED SUCCESSFULLY!');
    console.log(`📋 Workflow ID: ${result.workflow_permanent_id || result.workflow_id}`);
    
    return true;

  } catch (error) {
    console.error('💥 Error reverting workflow:', error.message);
    return false;
  }
}

// 🚨 Run the revert immediately
revertWorkflow().then(success => {
  if (success) {
    console.log('\n🎯 WORKFLOW RESTORED TO ORIGINAL STATE');
    console.log('=====================================');
    console.log('✅ Your rock solid workflow is back!');
    console.log('✅ All original blocks preserved');
    console.log('🔄 Ready to ADD new blocks properly');
  } else {
    console.log('\n❌ REVERT FAILED - CHECK ERRORS ABOVE');
  }
}).catch(error => {
  console.error('💥 Revert script failed:', error);
  process.exit(1);
});








