# 🚀 WORKFLOW EDITOR TEST SCRIPT
# Purpose: Quick testing of the workflow editor script

Write-Output "🚀 WORKFLOW EDITOR - QUICK SETUP & TEST"
Write-Output ""

# Configuration
$SKYVERN_URL = "http://localhost:8000"
$WORKFLOW_ID = "wpid_440696153483676908"
$API_KEY_PLACEHOLDER = "your-skyvern-api-key-here"

Write-Output "📋 CONFIGURATION:"
Write-Output "   Skyvern URL: $SKYVERN_URL"
Write-Output "   Workflow ID: $WORKFLOW_ID"
Write-Output "   Script File: workflow-editor-script.js"
Write-Output ""

# Check if Node.js is available
Write-Output "🔍 CHECKING REQUIREMENTS..."
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Output "   ✅ Node.js: $nodeVersion"
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Output "   ❌ Node.js: Not installed or not in PATH"
    Write-Output "   Please install Node.js to run the workflow editor script"
    exit 1
}

# Check if the workflow editor script exists
if (Test-Path "workflow-editor-script.js") {
    Write-Output "   ✅ Workflow Editor Script: Found"
} else {
    Write-Output "   ❌ Workflow Editor Script: Not found"
    exit 1
}

Write-Output ""

# Instructions
Write-Output "🔧 SETUP STEPS:"
Write-Output "1. Get your Skyvern API key from settings"
Write-Output "2. Edit workflow-editor-script.js and update API_KEY variable"
Write-Output "3. Verify the WORKFLOW_ID is correct: $WORKFLOW_ID"
Write-Output ""

Write-Output "🎯 WORKFLOW IMPROVEMENTS INCLUDED:"
Write-Output "   • LOGIN block with credentials specified directly"
Write-Output "   • TASK_V2 blocks for robust execution"
Write-Output "   • FOR_LOOP over actual job URLs"
Write-Output "   • Extract job links → loop → extract details → submit all"
Write-Output "   • Proper webhook authentication"
Write-Output ""

Write-Output "🚀 TO RUN THE WORKFLOW EDITOR:"
Write-Output "   1. Update the API key in workflow-editor-script.js"
Write-Output "   2. Run: node workflow-editor-script.js"
Write-Output "   3. Check the console output for results"
Write-Output "   4. Test the updated workflow at: http://localhost:8081/workflows/$WORKFLOW_ID"
Write-Output ""

Write-Output "📊 EXPECTED WORKFLOW STRUCTURE:"
Write-Output "   1. navigate_to_linkedin_jobs (NAVIGATION)"
Write-Output "   2. linkedin_login (LOGIN with credentials)"  
Write-Output "   3. extract_job_links (EXTRACTION of URLs)"
Write-Output "   4. process_job_links (FOR_LOOP with TASK_V2)"
Write-Output "   5. submit_all_jobs (HTTP_REQUEST batch submission)"
Write-Output ""

# Option to run with placeholder values for testing structure
Write-Output "❓ QUICK STRUCTURE TEST (without real API key):"
Write-Output "   Testing workflow structure generation automatically..."
Write-Output ""
Write-Output "🔍 TESTING WORKFLOW STRUCTURE GENERATION..."

# Run just the structure creation without API calls
$testScript = @"
const { createOptimizedLinkedInWorkflow } = require('./workflow-editor-script.js');

console.log('🎯 GENERATING OPTIMIZED WORKFLOW STRUCTURE...');
console.log('');

const workflow = createOptimizedLinkedInWorkflow();
console.log('✅ WORKFLOW STRUCTURE:');
console.log('   Title:', workflow.title);
console.log('   Blocks:', workflow.workflow_definition.blocks.length);
console.log('   Parameters:', workflow.workflow_definition.parameters.length);
console.log('');

workflow.workflow_definition.blocks.forEach((block, index) => {
    console.log(`   ${index + 1}. ${block.label} (${block.block_type.toUpperCase()})`);
});

console.log('');
console.log('📋 FIRST 3 BLOCKS PREVIEW:');
console.log(JSON.stringify(workflow.workflow_definition.blocks.slice(0, 3), null, 2));
"@

$testScript | Out-File -FilePath "test-structure.js" -Encoding UTF8
node test-structure.js
Remove-Item "test-structure.js"

Write-Output ""
Write-Output "✅ Structure test complete!"

Write-Output ""
Write-Output "🎯 NEXT STEPS:"
Write-Output "1. Update API key in workflow-editor-script.js"
Write-Output "2. Run the full workflow editor script"
Write-Output "3. Test the updated workflow"
Write-Output "4. Iterate until perfect"
Write-Output "5. Migrate working logic back to controller"
