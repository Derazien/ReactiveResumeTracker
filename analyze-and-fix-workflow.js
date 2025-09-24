// 🔍 ANALYZE CURRENT WORKFLOW AND MAKE SURGICAL EDITS
// Fetch actual format, analyze structure, then apply minimal targeted fixes

const { getRealUserSettings } = require('./get-real-settings.js');
const WORKFLOW_ID = 'wpid_440789045004028228';

async function analyzeAndFixWorkflow() {
  console.log('🔍 ANALYZING CURRENT WORKFLOW STRUCTURE');
  console.log('======================================');
  
  const settings = await getRealUserSettings();
  if (!settings) return;

  try {
    // 1. FETCH CURRENT WORKFLOW
    const response = await fetch(`${settings.baseUrl}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const workflow = await response.json();
    console.log(`📋 Workflow: ${workflow.title}`);
    console.log('');

    // 2. ANALYZE CURRENT STRUCTURE
    console.log('🔍 CURRENT WORKFLOW STRUCTURE:');
    console.log('==============================');
    
    const blocks = workflow.workflow_definition.blocks;
    let forLoopBlock = null;
    let forLoopIndex = -1;

    blocks.forEach((block, index) => {
      console.log(`${index + 1}. ${block.label} (${block.block_type.toUpperCase()})`);
      
      if (block.block_type === 'for_loop') {
        forLoopBlock = block;
        forLoopIndex = index;
        console.log('   📊 FOR_LOOP DETAILS:');
        console.log(`      loop_over: "${block.loop_over}"`);
        console.log(`      loop_variable_reference: "${block.loop_variable_reference || 'NOT SET'}"`);
        console.log(`      nested blocks: ${block.loop_blocks?.length || 0}`);
        
        if (block.loop_blocks) {
          block.loop_blocks.forEach((nestedBlock, i) => {
            console.log(`      ${i + 1}. ${nestedBlock.label} (${nestedBlock.block_type.toUpperCase()})`);
            if (nestedBlock.url) {
              console.log(`         url: "${nestedBlock.url}"`);
            }
            if (nestedBlock.data_extraction_goal) {
              console.log(`         extraction: ${nestedBlock.data_extraction_goal.substring(0, 50)}...`);
            }
          });
        }
      }
    });

    if (!forLoopBlock) {
      throw new Error('No FOR_LOOP block found');
    }

    // 3. IDENTIFY ISSUES
    console.log('');
    console.log('🚨 ISSUES IDENTIFIED:');
    console.log('=====================');
    
    const issues = [];
    if (forLoopBlock.loop_over === null || forLoopBlock.loop_over === "null") {
      issues.push(`❌ loop_over is null - should be "extract_job_urls"`);
    }
    
    if (forLoopBlock.loop_blocks) {
      forLoopBlock.loop_blocks.forEach((block, i) => {
        if (block.url && block.url.includes('{{job_url}}')) {
          issues.push(`❌ Block ${i + 1} uses {{job_url}} - should use {{current_value}}`);
        }
        if (block.prompt && block.prompt.includes('{{job_url}}')) {
          issues.push(`❌ Block ${i + 1} prompt uses {{job_url}} - should use {{current_value}}`);
        }
      });
    }

    issues.forEach(issue => console.log(`   ${issue}`));

    if (issues.length === 0) {
      console.log('   ✅ No issues found - workflow structure looks good!');
      return workflow;
    }

    // 4. CREATE FIXED VERSION (MINIMAL EDITS)
    console.log('');
    console.log('🔧 CREATING MINIMAL FIXES:');
    console.log('==========================');
    
    const fixedWorkflow = JSON.parse(JSON.stringify(workflow)); // Deep copy
    const fixedBlocks = fixedWorkflow.workflow_definition.blocks;
    const fixedForLoop = fixedBlocks[forLoopIndex];

    // Fix 1: Set loop_over correctly
    if (fixedForLoop.loop_over === null || fixedForLoop.loop_over === "null") {
      fixedForLoop.loop_over = "extract_job_urls";
      console.log('✅ Fixed: loop_over = "extract_job_urls"');
    }

    // Fix 2: Remove custom loop_variable_reference (let Skyvern handle it)
    if (fixedForLoop.loop_variable_reference) {
      delete fixedForLoop.loop_variable_reference;
      console.log('✅ Fixed: Removed custom loop_variable_reference');
    }

    // Fix 3: Update nested blocks to use {{current_value}}
    if (fixedForLoop.loop_blocks) {
      fixedForLoop.loop_blocks.forEach((block, i) => {
        let blockChanged = false;
        
        if (block.url && block.url.includes('{{job_url}}')) {
          block.url = block.url.replace(/\{\{job_url\}\}/g, '{{current_value}}');
          console.log(`✅ Fixed: Block ${i + 1} URL uses {{current_value}}`);
          blockChanged = true;
        }
        
        if (block.prompt && block.prompt.includes('{{job_url}}')) {
          block.prompt = block.prompt.replace(/\{\{job_url\}\}/g, '{{current_value}}');
          console.log(`✅ Fixed: Block ${i + 1} prompt uses {{current_value}}`);
          blockChanged = true;
        }

        if (block.data_extraction_goal && block.data_extraction_goal.includes('{{job_url}}')) {
          block.data_extraction_goal = block.data_extraction_goal.replace(/\{\{job_url\}\}/g, '{{current_value}}');
          console.log(`✅ Fixed: Block ${i + 1} extraction goal uses {{current_value}}`);
          blockChanged = true;
        }

        if (block.navigation_goal && block.navigation_goal.includes('{{job_url}}')) {
          block.navigation_goal = block.navigation_goal.replace(/\{\{job_url\}\}/g, '{{current_value}}');
          console.log(`✅ Fixed: Block ${i + 1} navigation goal uses {{current_value}}`);
          blockChanged = true;
        }

        if (!blockChanged) {
          console.log(`   Block ${i + 1}: No changes needed`);
        }
      });
    }

    // 5. ATTEMPT UPDATE WITH MINIMAL PAYLOAD
    console.log('');
    console.log('💾 ATTEMPTING MINIMAL UPDATE:');
    console.log('=============================');
    
    // Try updating just the workflow definition (no metadata changes)
    const updatePayload = {
      workflow_definition: fixedWorkflow.workflow_definition
    };

    console.log('📤 Sending minimal update payload...');
    
    const updateResponse = await fetch(`${settings.baseUrl}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey },
      body: JSON.stringify(updatePayload)
    });

    if (updateResponse.ok) {
      console.log('✅ WORKFLOW UPDATED SUCCESSFULLY!');
      console.log('🎯 Changes applied:');
      console.log('   • FOR_LOOP now connects to extract_job_urls');
      console.log('   • All variables use {{current_value}}');
      console.log('   • Removed problematic custom references');
      console.log('');
      console.log('🧪 Ready to test with:');
      console.log(`   node test-workflow-wpid440789045004028228.js ${WORKFLOW_ID}`);
      
      return fixedWorkflow;
    } else {
      const errorText = await updateResponse.text();
      console.log(`❌ Update failed: HTTP ${updateResponse.status}`);
      console.log(`Error details: ${errorText}`);
      
      console.log('');
      console.log('📋 MANUAL FIX REQUIRED:');
      console.log('=======================');
      console.log('Apply these changes manually in Skyvern UI:');
      issues.forEach(issue => {
        const fix = issue.replace('❌', '🔧').replace('should be', '→ change to');
        console.log(`   ${fix}`);
      });
      
      return null;
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return null;
  }
}

// Export and run
module.exports = { analyzeAndFixWorkflow };

if (require.main === module) {
  analyzeAndFixWorkflow();
}











