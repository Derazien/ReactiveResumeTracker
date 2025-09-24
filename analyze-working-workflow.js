// 🔍 ANALYZE THE WORKING WORKFLOW STRUCTURE
// Capture exact configuration that's now working

const { getRealUserSettings } = require('./get-real-settings.js');
const WORKING_WORKFLOW_ID = 'wpid_440789045004028228';

async function analyzeWorkingWorkflow() {
  console.log('🔍 ANALYZING WORKING WORKFLOW STRUCTURE');
  console.log('======================================');
  
  const settings = await getRealUserSettings();
  if (!settings) return;

  try {
    const response = await fetch(`${settings.baseUrl}/api/v1/workflows/${WORKING_WORKFLOW_ID}`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const workflow = await response.json();
    
    console.log(`📋 Working Workflow: ${workflow.title}`);
    console.log(`📝 Description: ${workflow.description}`);
    console.log('');

    // Detailed analysis of each block
    console.log('🧱 DETAILED BLOCK STRUCTURE:');
    console.log('============================');
    
    const blocks = workflow.workflow_definition.blocks;
    
    blocks.forEach((block, index) => {
      console.log(`\n${index + 1}. ${block.label} (${block.block_type.toUpperCase()})`);
      
      // Show key properties for each block type
      if (block.url) console.log(`   URL: ${block.url}`);
      if (block.navigation_goal) console.log(`   Navigation Goal: ${block.navigation_goal.substring(0, 100)}...`);
      if (block.data_extraction_goal) console.log(`   Extraction Goal: ${block.data_extraction_goal.substring(0, 100)}...`);
      if (block.data_schema) console.log(`   Schema Type: ${block.data_schema.type}`);
      if (block.llm_key) console.log(`   LLM: ${block.llm_key}`);
      if (block.max_retries) console.log(`   Max Retries: ${block.max_retries}`);
      if (block.cache_actions !== undefined) console.log(`   Cache Actions: ${block.cache_actions}`);
      
      // FOR_LOOP specific details
      if (block.block_type === 'for_loop') {
        console.log(`   Loop Over: "${block.loop_over}"`);
        console.log(`   Loop Variable Reference: "${block.loop_variable_reference || 'NOT SET'}"`);
        console.log(`   Complete If Empty: ${block.complete_if_empty}`);
        console.log(`   Nested Blocks: ${block.loop_blocks?.length || 0}`);
        
        if (block.loop_blocks) {
          block.loop_blocks.forEach((nestedBlock, i) => {
            console.log(`\n   └─ ${i + 1}. ${nestedBlock.label} (${nestedBlock.block_type.toUpperCase()})`);
            if (nestedBlock.url) console.log(`      URL: ${nestedBlock.url}`);
            if (nestedBlock.navigation_goal) console.log(`      Navigation: ${nestedBlock.navigation_goal.substring(0, 80)}...`);
            if (nestedBlock.data_extraction_goal) console.log(`      Extraction: ${nestedBlock.data_extraction_goal.substring(0, 80)}...`);
            if (nestedBlock.data_schema) {
              console.log(`      Schema: ${nestedBlock.data_schema.type}`);
              if (nestedBlock.data_schema.properties) {
                const props = Object.keys(nestedBlock.data_schema.properties);
                console.log(`      Properties: ${props.length} fields (${props.slice(0, 5).join(', ')}${props.length > 5 ? '...' : ''})`);
              }
            }
            if (nestedBlock.llm_key) console.log(`      LLM: ${nestedBlock.llm_key}`);
            if (nestedBlock.max_steps_per_run) console.log(`      Max Steps: ${nestedBlock.max_steps_per_run}`);
          });
        }
      }
      
      // HTTP_REQUEST specific details  
      if (block.block_type === 'http_request') {
        console.log(`   Method: ${block.method}`);
        console.log(`   URL: ${block.url}`);
        if (block.headers) console.log(`   Headers: ${Object.keys(block.headers).join(', ')}`);
        if (block.body) console.log(`   Body Keys: ${Object.keys(block.body).join(', ')}`);
      }
    });

    // Parameters
    console.log('\n📋 WORKFLOW PARAMETERS:');
    console.log('=======================');
    if (workflow.workflow_definition.parameters && workflow.workflow_definition.parameters.length > 0) {
      workflow.workflow_definition.parameters.forEach(param => {
        console.log(`   ${param.key}: ${param.description || 'No description'}`);
      });
    } else {
      console.log('   No parameters defined');
    }

    // Save the complete structure for replication
    console.log('\n💾 SAVING WORKING STRUCTURE FOR REPLICATION...');
    const fs = require('fs');
    const workingStructure = {
      title: workflow.title,
      description: workflow.description,
      proxy_location: workflow.proxy_location,
      webhook_callback_url: workflow.webhook_callback_url,
      persist_browser_session: workflow.persist_browser_session,
      browser_session_id: workflow.browser_session_id,
      workflow_definition: workflow.workflow_definition
    };
    
    fs.writeFileSync('working-workflow-structure.json', JSON.stringify(workingStructure, null, 2));
    console.log('✅ Saved to: working-workflow-structure.json');

    return workingStructure;

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return null;
  }
}

analyzeWorkingWorkflow();











