#!/usr/bin/env node

// Fix Workflow Sequencing and Assessment Logic
// Addresses timing issues and improper company extraction logic

const IMPROVED_ASSESSMENT_PROMPT = `Based on the job application API response, determine if company extraction is needed.

API Response: {{create_job_application_output}}

ANALYSIS RULES:
1. Check companyAssessment.companyExists
   - If false: Company doesn't exist → EXTRACT_COMPANY_DATA
   - If true: Company exists, check contacts...

2. Check companyAssessment.hasContacts  
   - If false: No contacts exist → EXTRACT_COMPANY_DATA
   - If true: Company exists with contacts → SKIP_COMPANY_DATA

3. Check companyAssessment.needsCompanyCreation
   - If true: Need to create company → EXTRACT_COMPANY_DATA

4. Check companyAssessment.needsContactExtraction
   - If true: Need contacts → EXTRACT_COMPANY_DATA

DECISION LOGIC:
- Extract ONLY if company doesn't exist OR has no contacts
- Skip if company exists with contacts
- Be conservative: when in doubt, skip to avoid duplicate work

RESPONSE: Only output the action code:
- EXTRACT_COMPANY_DATA (if extraction needed)
- SKIP_COMPANY_DATA (if company exists with contacts)

Current Assessment Data:
- Company Exists: {{create_job_application_output.data.companyAssessment.companyExists}}
- Has Contacts: {{create_job_application_output.data.companyAssessment.hasContacts}}
- Contact Count: {{create_job_application_output.data.companyAssessment.contactCount}}
- Needs Creation: {{create_job_application_output.data.companyAssessment.needsCompanyCreation}}
- Needs Contact Extraction: {{create_job_application_output.data.companyAssessment.needsContactExtraction}}`;

console.log('🎯 WORKFLOW SEQUENCING & ASSESSMENT FIXES');
console.log('==========================================');
console.log('');

console.log('✅ ISSUE 1 FIXED: extractContacts Logic');
console.log('• Changed from: extractContacts: true (always)');
console.log('• Changed to: extractContacts: !existingCompany || no contacts');
console.log('• Now conditional based on actual need');
console.log('');

console.log('🔧 ISSUE 2: Improved Assessment Logic');
console.log('• More explicit decision rules');
console.log('• Clear company existence checks');
console.log('• Better contact count validation');
console.log('• Conservative approach to avoid duplicate work');
console.log('');

console.log('⚠️  SEQUENCING ISSUE ANALYSIS:');
console.log('The timing issue (company 1 data after company 2 research) suggests:');
console.log('1. FOR_LOOP may be running blocks in parallel');
console.log('2. HTTP requests completing out of order');
console.log('3. Workflow execution not fully sequential');
console.log('');

console.log('🔍 RECOMMENDED CHECKS:');
console.log('1. Verify FOR_LOOP execution mode in Skyvern UI');
console.log('2. Check if blocks have proper dependencies');
console.log('3. Ensure HTTP requests are sequential per job');
console.log('4. Monitor workflow execution order');
console.log('');

console.log('📋 UPDATED ASSESSMENT PROMPT:');
console.log('=================================');
console.log(IMPROVED_ASSESSMENT_PROMPT);
console.log('');

console.log('🎯 EXPECTED RESULTS AFTER FIXES:');
console.log('• Companies with existing contacts: SKIP extraction');
console.log('• New companies: EXTRACT company data');  
console.log('• Companies without contacts: EXTRACT contacts');
console.log('• No more unnecessary research for existing companies');

module.exports = {
  improvedPrompt: IMPROVED_ASSESSMENT_PROMPT
};

