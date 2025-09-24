/**
 * 🚀 Enhanced Workflow Creator for wpid_440789045004028228
 * 
 * This script takes the current solid workflow and enhances it with:
 * 1. HTTP requests to create job applications
 * 2. Conditional logic based on response assessment  
 * 3. Company page extraction when needed
 * 4. Employee/contact extraction logic
 */

const SKYVERN_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk";
const SKYVERN_BASE_URL = "http://localhost:8000";
const WORKFLOW_ID = "wpid_440789045004028228";
const USER_ID = "cmcfcpf8e0000u4lg7u0i3bsh";

/**
 * 🔧 Create enhanced workflow definition
 */
function createEnhancedWorkflow() {
  return {
    title: "LinkedIn Jobs - Full Automation with HTTP Integration",
    description: "Complete LinkedIn job automation with job application creation, company research, and contact extraction via HTTP APIs",
    proxy_location: "RESIDENTIAL", 
    webhook_callback_url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${USER_ID}`,
    persist_browser_session: true,
    browser_session_id: `linkedin-session-${USER_ID}`,
    workflow_definition: {
      parameters: [
        // Core workflow parameters
        {
          key: "job_keywords",
          description: "Job search keywords", 
          parameter_type: "workflow",
          workflow_parameter_type: "string",
          default_value: "Software Engineer"
        },
        {
          key: "location", 
          description: "Job location",
          parameter_type: "workflow",
          workflow_parameter_type: "string", 
          default_value: "Berlin"
        },
        {
          key: "max_jobs",
          description: "Maximum jobs to extract",
          parameter_type: "workflow", 
          workflow_parameter_type: "integer",
          default_value: 2
        },
        {
          key: "linkedin_username",
          description: "LinkedIn username/email",
          parameter_type: "workflow",
          workflow_parameter_type: "string",
          default_value: "raedzein.rz@gmail.com"
        },
        {
          key: "linkedin_password", 
          description: "LinkedIn password",
          parameter_type: "workflow",
          workflow_parameter_type: "string",
          default_value: "15900593314Loody!"
        },
        // 🎯 NEW: API automation parameters
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
      ],
      blocks: [
        // 1. LinkedIn Login (existing)
        {
          label: "linkedin_login",
          block_type: "login",
          url: "https://www.linkedin.com/login",
          title: "LinkedIn Authentication",
          engine: "skyvern-1.0",
          navigation_goal: `Complete LinkedIn login using provided credentials:
          
1. Navigate to LinkedIn login page
2. Fill username field with {{linkedin_username}}
3. Fill password field with {{linkedin_password}}
4. Click Sign In button
5. Handle any 2FA/security challenges
6. Wait for successful authentication

Goal: Successfully logged in and ready for job search.`,
          max_retries: 3,
          max_steps_per_run: 15,
          parameter_keys: ["linkedin_username", "linkedin_password"],
          cache_actions: false,
          complete_criterion: "Profile menu/avatar visible indicating successful login",
          terminate_criterion: "Multiple login failures or account locked",
          llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
        },

        // 2. Navigate to Jobs (existing)
        {
          label: "navigate_to_jobs",
          block_type: "navigation", 
          url: "https://www.linkedin.com/jobs/search/?keywords={{job_keywords}}&location={{location}}",
          title: "Navigate to LinkedIn Job Search",
          engine: "skyvern-1.0",
          continue_on_failure: true,
          max_retries: 3,
          navigation_goal: `Navigate to LinkedIn job search with pre-applied filters:

1. Load URL with search parameters pre-filled
2. Keywords: "{{job_keywords}}"
3. Location: "{{location}}"
4. Wait for search results to load completely
5. Verify job listings are visible

Goal: Job search results page loaded and ready for extraction.`,
          parameter_keys: [],
          cache_actions: false,
          llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
        },

        // 3. Extract Job URLs (existing - simplified)
        {
          label: "extract_job_hrefs",
          block_type: "extraction",
          url: "",
          title: "Extract Job URLs from Search Results",
          continue_on_failure: true,
          max_retries: 2,
          data_extraction_goal: `Extract job posting URLs from LinkedIn search results:

GOAL: Create array of job URLs for loop processing (up to {{max_jobs}} jobs).

PROCESS:
1. Identify all job cards/listings visible on search results page
2. Extract the direct LinkedIn job URL for each listing
3. Ensure URLs are clean and accessible
4. Return simple array of strings (job URLs)

IMPORTANT: Return clean URLs that can be navigated to directly.`,
          data_schema: {
            type: "array",
            items: {
              type: "string",
              description: "Direct LinkedIn job posting URL"
            }
          },
          parameter_keys: [],
          cache_actions: false,
          llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
        },

        // 4. Process Jobs (ENHANCED FOR_LOOP)
        {
          label: "process_jobs", 
          block_type: "for_loop",
          loop_over: "extract_job_hrefs",
          loop_variable_reference: "current_job_url",
          complete_if_empty: true,
          loop_blocks: [
            // 4a. Navigate to Job (existing)
            {
              label: "navigate_to_job",
              block_type: "goto_url", 
              url: "{{current_job_url}}",
              title: "Navigate to Job Details Page",
              engine: "skyvern-1.0",
              continue_on_failure: true,
              navigation_goal: `Navigate to the current job posting:

CURRENT JOB: {{current_job_url}}

1. Navigate to the job URL
2. Wait for job details page to fully load
3. Ensure job information is visible: title, company, description
4. Handle any popups or overlays

Goal: Job detail page loaded and ready for data extraction.`,
              parameter_keys: [],
              cache_actions: false,
              llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
            },

            // 4b. Extract Job Data (existing - enhanced schema)
            {
              label: "extract_data_format", 
              block_type: "extraction",
              url: "",
              title: "Extract Complete Job Information",
              continue_on_failure: true,
              max_retries: 2,
              data_extraction_goal: `Extract comprehensive job information for automation API:

CURRENT JOB URL: {{current_job_url}}

REQUIRED DATA:
1. Job title (exact as displayed)
2. Company name (official name)
3. Complete job description
4. Requirements/qualifications (as array of strings)
5. Technical skills mentioned (as array of strings)
6. Job location (city, state, remote status)
7. Salary information (if visible)
8. Industry/company sector
9. Clean job URL (canonical LinkedIn URL)

EXTRACTION PROCESS:
- Click "Show more" to expand full job description if needed
- Extract all visible text from job requirements section
- Identify technical skills, tools, and technologies mentioned
- Get complete company name as displayed on the page

Schema matches our automation API exactly.`,
              data_schema: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "Job title exactly as displayed" 
                  },
                  companyName: { 
                    type: "string",
                    description: "Official company name" 
                  },
                  description: { 
                    type: "string",
                    description: "Complete job description text" 
                  },
                  requirements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Job requirements and qualifications"
                  },
                  extractedTags: {
                    type: "array", 
                    items: { type: "string" },
                    description: "Technical skills and technologies mentioned"
                  },
                  url: { 
                    type: "string",
                    description: "Clean LinkedIn job URL" 
                  },
                  status: { 
                    type: "string",
                    description: "Job status",
                    default: "DRAFT"
                  },
                  location: { 
                    type: "string",
                    description: "Job location or Remote" 
                  },
                  salary: { 
                    type: "string",
                    description: "Salary range if available" 
                  },
                  industry: { 
                    type: "string",
                    description: "Company industry/sector" 
                  },
                  notes: { 
                    type: "string",
                    description: "Additional notes about the job" 
                  },
                  userId: {
                    type: "string", 
                    description: "User ID for API call"
                  }
                },
                required: ["title", "companyName", "userId"]
              },
              parameter_keys: ["user_id"],
              cache_actions: false,
              llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
            },

            // 🎯 4c. NEW: Create Job Application via HTTP
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
                notes: "{{extract_data_format.notes}}",
                userId: "{{user_id}}"
              },
              timeout: 30,
              follow_redirects: true,
              parameter_keys: ["user_api_token", "user_id"],
              cache_actions: false
            },

            // 🎯 4d. NEW: Conditional Company Research (text prompt to decide)
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

            // 🎯 4e. NEW: Navigate to Company Page (conditional)
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

            // 🎯 4f. NEW: Extract Company Details (conditional) 
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
7. Company specialties/focus areas

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

            // 🎯 4g. NEW: Navigate to Employees Section (conditional)
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

            // 🎯 4h. NEW: Extract Employee Contacts (conditional)
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

            // 🎯 4i. NEW: Create Company & Contacts via HTTP (conditional)
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
          ]
        }
      ]
    }
  };
}

/**
 * 🚀 Update workflow via API
 */
async function updateWorkflow() {
  console.log('🚀 UPDATING WORKFLOW WITH ENHANCED BLOCKS');
  console.log('==========================================');
  
  const enhancedWorkflow = createEnhancedWorkflow();
  
  try {
    // Log the enhanced structure
    console.log('📊 ENHANCED WORKFLOW STRUCTURE:');
    console.log(`📝 Title: ${enhancedWorkflow.title}`);
    console.log(`🎯 Parameters: ${enhancedWorkflow.workflow_definition.parameters.length}`);
    console.log(`🧩 Blocks: ${enhancedWorkflow.workflow_definition.blocks.length}`);
    
    const processJobsBlock = enhancedWorkflow.workflow_definition.blocks.find(b => b.label === 'process_jobs');
    if (processJobsBlock) {
      console.log(`🔄 Loop blocks: ${processJobsBlock.loop_blocks.length}`);
      processJobsBlock.loop_blocks.forEach((block, index) => {
        console.log(`   ${index + 1}. ${block.label} (${block.block_type})${block.condition ? ' [CONDITIONAL]' : ''}`);
      });
    }

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
      
      // Save the enhanced workflow for manual review
      const fs = require('fs');
      fs.writeFileSync('enhanced-workflow-failed.json', JSON.stringify(enhancedWorkflow, null, 2));
      console.log('💾 Enhanced workflow saved to: enhanced-workflow-failed.json');
      
      return false;
    }

    const result = await response.json();
    console.log('✅ Workflow updated successfully!');
    console.log(`📋 Workflow ID: ${result.workflow_permanent_id || result.workflow_id}`);
    
    // Save the successful update
    const fs = require('fs');
    fs.writeFileSync('enhanced-workflow-success.json', JSON.stringify(enhancedWorkflow, null, 2));
    console.log('💾 Enhanced workflow saved to: enhanced-workflow-success.json');

    return true;

  } catch (error) {
    console.error('💥 Error updating workflow:', error.message);
    return false;
  }
}

/**
 * 🚀 Main function
 */
async function main() {
  console.log('🎯 LINKEDIN WORKFLOW ENHANCEMENT');
  console.log('=================================');
  console.log('Adding HTTP automation blocks for:');
  console.log('• Job application creation via API');
  console.log('• Conditional company research');
  console.log('• Employee contact extraction');
  console.log('• Company/contacts creation via API\n');

  const success = await updateWorkflow();
  
  if (success) {
    console.log('\n🎉 WORKFLOW ENHANCEMENT COMPLETE!');
    console.log('================================');
    console.log('✅ Enhanced workflow updated successfully');
    console.log('✅ HTTP automation blocks added');
    console.log('✅ Conditional logic implemented');
    console.log('✅ Ready for full automation testing');
    console.log('\n🔗 Workflow URL: http://localhost:8081/workflows/wpid_440789045004028228');
  } else {
    console.log('\n❌ WORKFLOW UPDATE FAILED');
    console.log('========================');
    console.log('Please check the error details above');
    console.log('Enhanced workflow saved for manual review');
  }
}

// 🚀 Run the enhancement
main().catch(error => {
  console.error('💥 Enhancement failed:', error);
  process.exit(1);
});








