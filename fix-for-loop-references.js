#!/usr/bin/env node

// Fix FOR_LOOP Template References Issue
// Root cause: HTTP blocks use global references instead of loop-scoped references

const SKYVERN_BASE_URL = 'http://localhost:8000';
const WORKFLOW_ID = 'wpid_440789045004028228';
const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";

/**
 * 🎯 Fix FOR_LOOP scoping issue
 * 
 * PROBLEM: Blocks inside FOR_LOOP reference global data instead of current iteration
 * SOLUTION: Use proper loop-scoped references
 */
async function fixForLoopReferences() {
  console.log('🎯 FIXING FOR_LOOP TEMPLATE REFERENCES');
  console.log('=====================================');
  console.log('');
  console.log('🔍 ROOT CAUSE ANALYSIS:');
  console.log('• HTTP blocks use {{extract_data_format.field}} (global)');
  console.log('• Should use loop-scoped references for current iteration');
  console.log('• This causes Job 2 to use Job 1\'s data!');
  console.log('');
  
  try {
    // Fetch current workflow
    console.log('📖 Fetching workflow...');
    const response = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'x-skyvern-api-key': SKYVERN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.status} ${response.statusText}`);
    }
    
    const workflow = await response.json();
    const blocks = workflow.workflow_definition.blocks;
    console.log('✅ Workflow fetched');
    
    // Find FOR_LOOP block
    let forLoopBlock = null;
    for (const block of blocks) {
      if (block.block_type === 'for_loop' && block.label === 'process_jobs') {
        forLoopBlock = block;
        break;
      }
    }
    
    if (!forLoopBlock) {
      throw new Error('process_jobs FOR_LOOP block not found');
    }
    
    console.log('🔍 Found FOR_LOOP block with', forLoopBlock.loop_blocks?.length || 0, 'nested blocks');
    
    // 🎯 CRITICAL FIX: Update ALL template references in loop blocks
    let fixedCount = 0;
    
    forLoopBlock.loop_blocks?.forEach((block, index) => {
      console.log(`\n📋 Block ${index + 1}: ${block.label} (${block.block_type})`);
      
      // Fix HTTP request blocks
      if (block.block_type === 'http_request') {
        console.log('   🔧 Fixing HTTP block references...');
        
        if (block.body) {
          // Replace all extract_data_format references with proper loop scope
          const originalBody = JSON.stringify(block.body);
          
          // 🎯 KEY FIX: Use the output format that works in loop context
          // The blocks inside the loop should reference their own outputs within the loop
          const updatedBodyStr = originalBody
            .replace(/\{\{extract_data_format\.([^}]+)\}\}/g, '{{extract_data_format_output.extracted_information.$1}}')
            .replace(/\{\{extract_company_details\.([^}]+)\}\}/g, '{{extract_company_details_output.extracted_information.$1}}')
            .replace(/\{\{extract_employee_contacts\.([^}]+)\}\}/g, '{{extract_employee_contacts_output.extracted_information.$1}}');
          
          block.body = JSON.parse(updatedBodyStr);
          
          if (originalBody !== JSON.stringify(block.body)) {
            fixedCount++;
            console.log('   ✅ Fixed template references in HTTP body');
          }
        }
        
        // Fix URL if it has templates
        if (block.url && typeof block.url === 'string') {
          const originalUrl = block.url;
          block.url = block.url
            .replace(/\{\{extract_data_format\.([^}]+)\}\}/g, '{{extract_data_format_output.extracted_information.$1}}')
            .replace(/\{\{extract_company_details\.([^}]+)\}\}/g, '{{extract_company_details_output.extracted_information.$1}}');
            
          if (originalUrl !== block.url) {
            console.log('   ✅ Fixed template references in URL');
            fixedCount++;
          }
        }
      }
      
      // Fix extraction and navigation blocks
      if (block.data_extraction_goal) {
        const original = block.data_extraction_goal;
        block.data_extraction_goal = block.data_extraction_goal
          .replace(/\{\{extract_data_format\.([^}]+)\}\}/g, '{{extract_data_format_output.extracted_information.$1}}')
          .replace(/\{\{extract_company_details\.([^}]+)\}\}/g, '{{extract_company_details_output.extracted_information.$1}}');
          
        if (original !== block.data_extraction_goal) {
          console.log('   ✅ Fixed template references in extraction goal');
          fixedCount++;
        }
      }
      
      if (block.navigation_goal) {
        const original = block.navigation_goal;
        block.navigation_goal = block.navigation_goal
          .replace(/\{\{extract_data_format\.([^}]+)\}\}/g, '{{extract_data_format_output.extracted_information.$1}}')
          .replace(/\{\{extract_company_details\.([^}]+)\}\}/g, '{{extract_company_details_output.extracted_information.$1}}');
          
        if (original !== block.navigation_goal) {
          console.log('   ✅ Fixed template references in navigation goal');
          fixedCount++;
        }
      }
      
      // Fix text_prompt blocks
      if (block.prompt) {
        const original = block.prompt;
        block.prompt = block.prompt
          .replace(/\{\{create_job_application\}\}/g, '{{create_job_application_output}}')
          .replace(/\{\{extract_data_format\.([^}]+)\}\}/g, '{{extract_data_format_output.extracted_information.$1}}');
          
        if (original !== block.prompt) {
          console.log('   ✅ Fixed template references in prompt');
          fixedCount++;
        }
      }
    });
    
    console.log('');
    console.log(`🔧 FIXES APPLIED: ${fixedCount} template references updated`);
    
    if (fixedCount === 0) {
      console.log('⚠️  No fixes needed - references might already be correct');
      console.log('   Check if workflow is using different reference format');
      return true;
    }
    
    // Save corrected workflow
    console.log('💾 Updating workflow...');
    const updateResponse = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: {
        'x-skyvern-api-key': SKYVERN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update workflow: ${updateResponse.status} - ${errorText}`);
    }
    
    console.log('✅ Workflow updated successfully!');
    console.log('');
    console.log('🎯 TEMPLATE REFERENCE FIXES:');
    console.log('=============================');
    console.log('BEFORE (global scope):');
    console.log('  {{extract_data_format.title}}           ❌');
    console.log('  {{extract_data_format.companyName}}     ❌');
    console.log('');
    console.log('AFTER (loop scope):');
    console.log('  {{extract_data_format_output.extracted_information.title}}        ✅');
    console.log('  {{extract_data_format_output.extracted_information.companyName}}  ✅');
    console.log('');
    console.log('🚀 EXPECTED RESULTS:');
    console.log('• Each job iteration uses its own extracted data');
    console.log('• No more data mixing between jobs');
    console.log('• Contacts properly associated with correct companies');
    console.log('• Both job applications created with correct data');
    console.log('');
    console.log('🧪 READY FOR TESTING!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to fix FOR_LOOP references:', error.message);
    return false;
  }
}

if (require.main === module) {
  fixForLoopReferences()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(console.error);
}

module.exports = { fixForLoopReferences };

