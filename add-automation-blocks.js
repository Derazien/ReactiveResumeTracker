/**
 * ✅ ADD Automation Blocks to Existing Workflow
 * 
 * This script ADDS new HTTP automation blocks to the existing solid workflow
 * WITHOUT changing any of the existing working blocks.
 */

const fs = require('fs');

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";
const SKYVERN_BASE_URL = "http://localhost:8000";
const WORKFLOW_ID = "wpid_440789045004028228";
const USER_ID = "cmcfcpf8e0000u4lg7u0i3bsh";

/**
 * 📋 Create NEW automation blocks to ADD to existing workflow
 */
function createNewAutomationBlocks() {
  return [
    // 🎯 NEW BLOCK 1: Create Job Application via HTTP
    {
      label: "create_job_application",
      block_type: "http_request",
      method: "POST",
      url: "http://host.docker.internal:3000/api/automation/job-application",
      headers: {
        "Content-Type": "application/json",
        "x-skyvern-api-key": "{{user_api_token}}"
      },
      body: {
        title: "{{extract_data_format.title}}",
        companyName: "{{extract_data_format.companyName}}",
        description: "{{extract_data_format.description}}",
        requirements: "{{extract_data_format.requirements}}",
        extractedTags: "{{extract_data_format.extractedTags}}",
        url: "{{extract_data_format.url}}",
        status: "DRAFT",
        location: "{{extract_data_format.location}}",
        salary: "{{extract_data_format.salary}}",
        industry: "{{extract_data_format.industry}}",
        notes: "Created via LinkedIn automation",
        userId: "{{user_id}}"
      },
      timeout: 30,
      follow_redirects: true,
      parameter_keys: ["user_api_token", "user_id"],
      cache_actions: false
    },

    // 🎯 NEW BLOCK 2: Assess Company Needs (conditional decision)
    {
      label: "assess_company_needs",
      block_type: "text_prompt",
      prompt: `Based on the job application API response, should I extract company details and contacts?

API Response: {{create_job_application}}

Analysis:
- Check if 'needsCompanyCreation' is true
- Check if 'needsContactExtraction' is true  
- Check if 'suggestedNextActions.extractContacts' is true

If ANY of these are true, respond with: EXTRACT_COMPANY_DATA
If all are false, respond with: SKIP_COMPANY_DATA

Response format: Just the action code (EXTRACT_COMPANY_DATA or SKIP_COMPANY_DATA)`,
      llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
    },

    // 🎯 NEW BLOCK 3: Navigate to Company Page (conditional)
    {
      label: "navigate_to_company",
      block_type: "navigation",
      url: "",
      title: "Navigate to Company LinkedIn Page",
      engine: "skyvern-1.0", 
      continue_on_failure: true,
      max_retries: 3,
      navigation_goal: `Navigate to the company LinkedIn page for detailed research:

CURRENT COMPANY: {{extract_data_format.companyName}}

PROCESS:
1. Look for company name link/logo on the current job page
2. Click on the company name to go to company LinkedIn page
3. Wait for company page to fully load
4. Verify we're on the correct company's LinkedIn page
5. Ensure company information is visible

GOAL: Successfully loaded company LinkedIn page ready for data extraction.

CONDITION: Only execute if {{assess_company_needs}} contains "EXTRACT_COMPANY_DATA"`,
      parameter_keys: [],
      cache_actions: false,
      llm_key: "ANTHROPIC_CLAUDE3_HAIKU",
      condition: "{{assess_company_needs}} contains 'EXTRACT_COMPANY_DATA'"
    },

    // 🎯 NEW BLOCK 4: Extract Company Details (conditional) 
    {
      label: "extract_company_details",
      block_type: "extraction",
      url: "",
      title: "Extract Company Information",
      continue_on_failure: true,
      max_retries: 2,
      data_extraction_goal: `Extract comprehensive company information:

CURRENT COMPANY: {{extract_data_format.companyName}}

REQUIRED DATA:
1. Official company name (as displayed on LinkedIn)
2. Company description/about section
3. Industry/sector
4. Company website URL
5. Company headquarters location
6. Company size (if visible)

PROCESS:
- Scroll through company page to find all information
- Click "Show more" to expand company description if needed
- Look for company website link
- Extract industry information
- Get location/headquarters info

Schema matches our automation API for company creation.`,
      data_schema: {
        type: "object",
        properties: {
          companyName: { 
            type: "string",
            description: "Official company name" 
          },
          companyDescription: { 
            type: "string",
            description: "Company description from About section" 
          },
          industry: { 
            type: "string",
            description: "Company industry/sector" 
          },
          website: { 
            type: "string",
            description: "Company website URL" 
          },
          location: { 
            type: "string",
            description: "Company headquarters location" 
          },
          userId: {
            type: "string",
            description: "User ID for API call"
          }
        },
        required: ["companyName", "userId"]
      },
      parameter_keys: ["user_id"],
      cache_actions: false,
      llm_key: "ANTHROPIC_CLAUDE3_HAIKU",
      condition: "{{assess_company_needs}} contains 'EXTRACT_COMPANY_DATA'"
    },

    // 🎯 NEW BLOCK 5: Navigate to Employees Section (conditional)
    {
      label: "navigate_to_employees",
      block_type: "navigation",
      url: "",
      title: "Navigate to Company Employees Section",
      engine: "skyvern-1.0",
      continue_on_failure: true, 
      max_retries: 3,
      navigation_goal: `Navigate to the company's employees/people section:

CURRENT COMPANY: {{extract_data_format.companyName}}

PROCESS:
1. Look for "People" or "Employees" tab/link on company page
2. Click to access the employees directory 
3. Wait for employees list to load
4. Look for relevant contacts (recruiters, hiring managers, engineering leads)
5. Ensure employee profiles are visible and accessible

GOAL: Employees section loaded with visible contact profiles.

CONDITION: Only execute if we're extracting company data.`,
      parameter_keys: [],
      cache_actions: false,
      llm_key: "ANTHROPIC_CLAUDE3_HAIKU",
      condition: "{{assess_company_needs}} contains 'EXTRACT_COMPANY_DATA'"
    },

    // 🎯 NEW BLOCK 6: Extract Employee Contacts (conditional)
    {
      label: "extract_employee_contacts",
      block_type: "extraction",
      url: "",
      title: "Extract Employee Contact Information",
      continue_on_failure: true,
      max_retries: 2,
      data_extraction_goal: `Extract relevant employee contact information:

CURRENT COMPANY: {{extract_data_format.companyName}}
TARGET ROLES: Recruiters, Hiring Managers, Engineering Managers, Team Leads, HR

PROCESS:
1. Scan visible employee profiles on the page
2. Focus on employees with relevant titles for job applications
3. Extract contact information for 3-5 most relevant contacts
4. Click on profiles if needed to get additional contact info
5. Look for direct contact methods (email, LinkedIn messaging)

RELEVANT TITLES TO PRIORITIZE:
- Recruiter, Senior Recruiter, Talent Acquisition
- Hiring Manager, Engineering Manager, VP Engineering
- HR Manager, People Operations  
- Team Lead, Technical Lead, Director
- CTO, Head of Engineering

Extract contact details for automation API.`,
      data_schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { 
              type: "string",
              description: "Contact full name" 
            },
            title: { 
              type: "string",
              description: "Job title/position" 
            },
            linkedinUrl: { 
              type: "string",
              description: "LinkedIn profile URL" 
            },
            email: { 
              type: "string",
              description: "Email address if available" 
            },
            phone: { 
              type: "string",
              description: "Phone number if available" 
            }
          },
          required: ["name"]
        },
        description: "List of relevant employee contacts for job application"
      },
      parameter_keys: [],
      cache_actions: false,
      llm_key: "ANTHROPIC_CLAUDE3_HAIKU", 
      condition: "{{assess_company_needs}} contains 'EXTRACT_COMPANY_DATA'"
    },

    // 🎯 NEW BLOCK 7: Create Company & Contacts via HTTP (conditional)
    {
      label: "create_company_contacts",
      block_type: "http_request", 
      method: "POST",
      url: "http://host.docker.internal:3000/api/automation/company-contacts",
      headers: {
        "Content-Type": "application/json",
        "x-skyvern-api-key": "{{user_api_token}}"
      },
      body: {
        companyName: "{{extract_company_details.companyName}}",
        companyDescription: "{{extract_company_details.companyDescription}}",
        industry: "{{extract_company_details.industry}}",
        website: "{{extract_company_details.website}}",
        location: "{{extract_company_details.location}}",
        contacts: "{{extract_employee_contacts}}",
        userId: "{{user_id}}"
      },
      timeout: 60,
      follow_redirects: true,
      parameter_keys: ["user_api_token", "user_id"],
      cache_actions: false,
      condition: "{{assess_company_needs}} contains 'EXTRACT_COMPANY_DATA'"
    }
  ];
}

/**
 * ➕ ADD new parameters to existing workflow
 */
function createNewParameters() {
  return [
    {
      key: "user_api_token",
      description: "Skyvern API token for automation calls",
      parameter_type: "workflow", 
      workflow_parameter_type: "string",
      default_value: SKYVERN_API_KEY
    },
    {
      key: "user_id",
      description: "User ID for job application creation", 
      parameter_type: "workflow",
      workflow_parameter_type: "string",
      default_value: USER_ID
    }
  ];
}

/**
 * ✅ ADD automation blocks to existing workflow
 */
async function addAutomationBlocks() {
  console.log('➕ ADDING AUTOMATION BLOCKS TO EXISTING WORKFLOW');
  console.log('================================================');
  
  try {
    // Read the current (reverted) workflow
    const originalWorkflow = JSON.parse(fs.readFileSync('current-workflow-backup.json', 'utf8'));
    
    console.log('📋 Current workflow loaded');
    console.log(`🧩 Current blocks: ${originalWorkflow.workflow_definition.blocks.length}`);
    
    // Find the process_jobs FOR_LOOP block
    const processJobsBlock = originalWorkflow.workflow_definition.blocks.find(b => b.label === 'process_jobs');
    if (!processJobsBlock) {
      throw new Error('Could not find process_jobs FOR_LOOP block');
    }

    console.log(`🔄 Found process_jobs block with ${processJobsBlock.loop_blocks.length} existing loop blocks`);

    // ADD new blocks to the existing loop_blocks (don't replace!)
    const newAutomationBlocks = createNewAutomationBlocks();
    processJobsBlock.loop_blocks.push(...newAutomationBlocks);

    console.log(`➕ Added ${newAutomationBlocks.length} new automation blocks to loop`);
    console.log(`🔄 Total loop blocks now: ${processJobsBlock.loop_blocks.length}`);

    // ADD new parameters (don't replace existing ones!)
    const workflowParams = originalWorkflow.workflow_definition.parameters.filter(p => p.parameter_type === "workflow");
    const newParams = createNewParameters();
    workflowParams.push(...newParams);

    console.log(`➕ Added ${newParams.length} new parameters`);
    console.log(`🎯 Total workflow parameters: ${workflowParams.length}`);

    // Create the enhanced workflow (keeping everything else the same)
    const enhancedWorkflow = {
      title: originalWorkflow.title,
      description: originalWorkflow.description + " - Enhanced with HTTP automation",
      proxy_location: originalWorkflow.proxy_location,
      webhook_callback_url: originalWorkflow.webhook_callback_url,
      persist_browser_session: originalWorkflow.persist_browser_session,
      browser_session_id: originalWorkflow.browser_session_id,
      workflow_definition: {
        parameters: workflowParams,
        blocks: originalWorkflow.workflow_definition.blocks // All original blocks preserved!
      }
    };

    // Log the enhancement details
    console.log('\n📊 ENHANCEMENT SUMMARY:');
    console.log('✅ All original blocks preserved');
    console.log(`➕ Added ${newAutomationBlocks.length} new loop blocks:`);
    newAutomationBlocks.forEach((block, index) => {
      console.log(`   ${index + 1}. ${block.label} (${block.block_type})${block.condition ? ' [CONDITIONAL]' : ''}`);
    });

    // Update the workflow
    console.log('\n🔄 Updating workflow via API...');
    const response = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: {
        'x-api-key': SKYVERN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enhancedWorkflow)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to update workflow:', error);
      
      // Save the enhanced workflow for review
      fs.writeFileSync('enhanced-workflow-failed.json', JSON.stringify(enhancedWorkflow, null, 2));
      console.log('💾 Enhanced workflow saved to: enhanced-workflow-failed.json');
      
      return false;
    }

    const result = await response.json();
    console.log('✅ Workflow updated successfully!');
    console.log(`📋 Workflow ID: ${result.workflow_permanent_id || result.workflow_id}`);
    
    // Save the successful update
    fs.writeFileSync('enhanced-workflow-success.json', JSON.stringify(enhancedWorkflow, null, 2));
    console.log('💾 Enhanced workflow saved to: enhanced-workflow-success.json');

    return true;

  } catch (error) {
    console.error('💥 Error adding automation blocks:', error.message);
    return false;
  }
}

/**
 * 🚀 Main function
 */
async function main() {
  console.log('🎯 LINKEDIN WORKFLOW ENHANCEMENT - ADDITIVE APPROACH');
  console.log('====================================================');
  console.log('➕ Adding new automation blocks to existing workflow');
  console.log('✅ All original blocks will be preserved');
  console.log('🔄 Only adding HTTP automation logic\n');

  const success = await addAutomationBlocks();
  
  if (success) {
    console.log('\n🎉 AUTOMATION BLOCKS ADDED SUCCESSFULLY!');
    console.log('========================================');
    console.log('✅ All original blocks preserved');
    console.log('➕ New HTTP automation blocks added');
    console.log('🎯 Conditional logic implemented');
    console.log('✅ Ready for full automation testing');
    console.log('\n🔗 Workflow URL: http://localhost:8081/workflows/wpid_440789045004028228');
  } else {
    console.log('\n❌ FAILED TO ADD AUTOMATION BLOCKS');
    console.log('==================================');
    console.log('Please check the error details above');
    console.log('Enhanced workflow saved for manual review');
  }
}

// 🚀 Run the addition
main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});








