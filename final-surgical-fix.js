// 🎯 FINAL SURGICAL FIX - Include required fields for API validation
const { getRealUserSettings } = require('./get-real-settings.js');
const WORKFLOW_ID = 'wpid_440789045004028228';

async function finalSurgicalFix() {
  console.log('🎯 FINAL SURGICAL FIX ATTEMPT');
  console.log('=============================');
  
  const settings = await getRealUserSettings();
  if (!settings) return;

  try {
    // Get complete current workflow
    const response = await fetch(`${settings.baseUrl}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const workflow = await response.json();
    
    // Make ONLY the essential fix
    const fixedWorkflow = JSON.parse(JSON.stringify(workflow));
    const blocks = fixedWorkflow.workflow_definition.blocks;
    
    const forLoopIndex = blocks.findIndex(b => b.block_type === 'for_loop');
    if (forLoopIndex !== -1) {
      const forLoop = blocks[forLoopIndex];
      
      console.log('🔧 APPLYING SURGICAL FIX:');
      console.log(`   Current loop_over: "${forLoop.loop_over}"`);
      console.log(`   Current loop_variable_reference: "${forLoop.loop_variable_reference || 'none'}"`);
      
      // CRITICAL FIX: Connect FOR_LOOP to extraction block
      forLoop.loop_over = "extract_job_urls";
      
      // OPTIONAL FIX: Remove problematic custom reference
      delete forLoop.loop_variable_reference;
      
      console.log('✅ Fixed loop_over = "extract_job_urls"');
      console.log('✅ Removed custom loop_variable_reference');
    }

    // Include ALL required fields for API validation
    const completeUpdatePayload = {
      title: workflow.title,
      description: workflow.description,
      proxy_location: workflow.proxy_location,
      webhook_callback_url: workflow.webhook_callback_url,
      persist_browser_session: workflow.persist_browser_session,
      browser_session_id: workflow.browser_session_id,
      workflow_definition: fixedWorkflow.workflow_definition
    };

    console.log('');
    console.log('💾 ATTEMPTING COMPLETE UPDATE WITH ALL FIELDS:');
    
    const updateResponse = await fetch(`${settings.baseUrl}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey },
      body: JSON.stringify(completeUpdatePayload)
    });

    if (updateResponse.ok) {
      console.log('✅ SUCCESS! WORKFLOW FIXED PROGRAMMATICALLY!');
      console.log('============================================');
      console.log('🎯 Applied fix:');
      console.log('   • FOR_LOOP now connects to "extract_job_urls"');
      console.log('   • Removed problematic loop_variable_reference');
      console.log('');
      console.log('🧪 The workflow should now work! Test with:');
      console.log(`   node test-workflow-wpid440789045004028228.js ${WORKFLOW_ID}`);
      
      return true;
    } else {
      const errorText = await updateResponse.text();
      console.log(`❌ Still failed: HTTP ${updateResponse.status}`);
      console.log(`Error: ${errorText}`);
      
      console.log('');
      console.log('📋 MANUAL FIX (VERY SIMPLE):');
      console.log('============================');
      console.log('1. Open: http://localhost:8081/workflows/wpid_440789045004028228');
      console.log('2. Click: "Edit Workflow"');
      console.log('3. Find: FOR_LOOP block "process_jobs"');
      console.log('4. Change: loop_over from "null" to "extract_job_urls"');
      console.log('5. Delete: loop_variable_reference field (leave empty)');
      console.log('6. Save workflow');
      console.log('');
      console.log('That\'s it! Just one field change: null → "extract_job_urls"');
      
      return false;
    }

  } catch (error) {
    console.error('❌ Final fix failed:', error.message);
    return false;
  }
}

finalSurgicalFix();











