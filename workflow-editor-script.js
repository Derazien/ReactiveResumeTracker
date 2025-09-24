/**
 * 🚀 DEDICATED WORKFLOW EDITOR SCRIPT
 * 
 * Purpose: Edit existing Skyvern workflow via API to perfect LinkedIn automation
 * Target Workflow: http://localhost:8081/workflows/wpid_440696153483676908
 * 
 * Approach:
 * 1. Fetch existing workflow details
 * 2. Modify blocks to use proper structure:
 *    - TASK_V2 blocks for robust execution
 *    - LOGIN blocks with credentials specified
 *    - Proper FOR_LOOP over job links
 *    - Data extraction → loop → extract details → submit all
 * 3. Update workflow via API
 * 4. Test until perfect
 * 5. Migrate working logic to controller
 */

const SKYVERN_BASE_URL = 'http://localhost:8000';
const WORKFLOW_ID = 'wpid_440696153483676908';
const API_KEY = 'your-api-key-here'; // TODO: Get from user settings

/**
 * 🔍 STEP 1: Fetch existing workflow details
 */
async function fetchWorkflowDetails() {
  console.log('🔍 Fetching existing workflow details...');
  
  try {
    const response = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const workflow = await response.json();
    console.log('✅ Workflow fetched successfully:');
    console.log(JSON.stringify(workflow, null, 2));
    
    return workflow;
  } catch (error) {
    console.error('❌ Failed to fetch workflow:', error);
    return null;
  }
}

/**
 * 🎯 STEP 2: Create proper LinkedIn workflow structure
 */
function createOptimizedLinkedInWorkflow() {
  console.log('🎯 Creating optimized LinkedIn workflow structure...');
  
  return {
    title: "LinkedIn Job Automation - Optimized",
    description: "Proper workflow with TASK_V2, FOR_LOOP over job links, and batch submission",
    proxy_location: "RESIDENTIAL",
    webhook_callback_url: "http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=PLACEHOLDER",
    persist_browser_session: true,
    browser_session_id: "linkedin-session-optimized",
    workflow_definition: {
      parameters: [
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
          default_value: "Remote"
        },
        {
          key: "max_jobs",
          description: "Maximum jobs to process",
          parameter_type: "workflow",
          workflow_parameter_type: "integer", 
          default_value: 5
        },
        {
          key: "linkedin_username",
          description: "LinkedIn username/email",
          parameter_type: "workflow",
          workflow_parameter_type: "string",
          default_value: ""
        },
        {
          key: "linkedin_password",
          description: "LinkedIn password", 
          parameter_type: "workflow",
          workflow_parameter_type: "string",
          default_value: ""
        }
      ],
      blocks: [
        // 🎯 BLOCK 1: Navigate to LinkedIn homepage first  
        {
          label: "navigate_to_linkedin_homepage",
          block_type: "navigation",
          url: "https://www.linkedin.com",
          title: "Navigate to LinkedIn Homepage",
          engine: "skyvern-1.0",
          continue_on_failure: true,
          max_retries: 3,
          navigation_goal: `Navigate to LinkedIn homepage for login:
1. Load LinkedIn homepage
2. Wait for page to load completely
3. Prepare for login process

Goal: Ready for LinkedIn authentication.`,
          parameter_keys: [],
          cache_actions: false
        },

        // 🔐 BLOCK 2: LOGIN block with credentials specified
        {
          label: "linkedin_login",
          block_type: "login",
          url: "https://www.linkedin.com/login",
          title: "LinkedIn Authentication with Credentials",
          navigation_goal: `Complete LinkedIn login with provided credentials:

CREDENTIALS:
- Username: {{linkedin_username}}
- Password: {{linkedin_password}}

PROCESS:
1. Navigate to login page if needed
2. Fill username field with provided credentials
3. Fill password field with provided credentials  
4. Click Sign In button
5. Handle any 2FA or security challenges
6. Wait for successful authentication

COMPLETION: Successfully logged in with profile menu visible.`,
          max_retries: 3,
          max_steps_per_run: 15,
          parameter_keys: ["linkedin_username", "linkedin_password"],
          complete_criterion: "Profile menu/avatar visible indicating successful login",
          terminate_criterion: "Multiple login failures or account locked",
          engine: "skyvern-1.0",
          cache_actions: false
        },

        // 🎯 BLOCK 3: Navigate to job search page AFTER login
        {
          label: "navigate_to_job_search",
          block_type: "navigation",
          url: "https://www.linkedin.com/jobs/search/?keywords={{job_keywords}}&location={{location}}",
          title: "Navigate to Job Search After Login",
          engine: "skyvern-1.0",
          continue_on_failure: true,
          max_retries: 3,
          navigation_goal: `Navigate to LinkedIn job search page after successful login:
1. Load job search URL with filters
2. Keywords: "{{job_keywords}}"
3. Location: "{{location}}"
4. Wait for search results to load
5. Ensure job listings are visible

Goal: Job search page loaded with results ready for extraction.`,
          parameter_keys: [],
          cache_actions: false
        },

        // 📊 BLOCK 4: SIMPLIFIED job URL extraction - ROBUST APPROACH
        {
          label: "extract_job_links",
          block_type: "extraction", 
          url: "",
          title: "Extract LinkedIn Job URLs (Simplified)",
          continue_on_failure: true,
          max_retries: 3,
          data_extraction_goal: `SIMPLIFIED LINKEDIN JOB URL EXTRACTION:

SIMPLE AND ROBUST APPROACH:
1. Look at the current LinkedIn job search results page
2. Find ALL links (href attributes) that contain "/jobs/view/"
3. Extract these job URLs as simple strings
4. Return up to {{max_jobs}} job URLs
5. Do NOT try to extract job titles or company names here

WHAT TO LOOK FOR:
- Any <a> tag with href containing "linkedin.com/jobs/view/"
- Example: "https://www.linkedin.com/jobs/view/1234567890"
- Just get the URL strings, nothing else

CRITICAL: Keep it simple! Just URLs, no complex data.
The detailed job information will be extracted later in the loop.

EXAMPLE OUTPUT: ["https://www.linkedin.com/jobs/view/1234", "https://www.linkedin.com/jobs/view/5678"]`,
          data_schema: {
            type: "array",
            items: { 
              type: "string",
              description: "LinkedIn job URL (https://www.linkedin.com/jobs/view/XXXXXXX)"
            }
          },
          parameter_keys: [],
          cache_actions: false
        },

        // 🔄 BLOCK 5: FOR_LOOP over job links with TASK_V2
        {
          label: "process_job_links",
          block_type: "for_loop",
          loop_over: "extract_job_links",
          loop_variable_reference: "job_url", 
          complete_if_empty: true,
          loop_blocks: [
            {
              label: "extract_job_details_task",
              block_type: "task_v2", // ⭐ USING TASK_V2 FOR ROBUST PROCESSING
              url: "{{job_url}}", 
              title: "Extract Detailed Job Information",
              llm_key: "ANTHROPIC_CLAUDE3_HAIKU", // 💰 COST OPTIMIZATION: 60x cheaper than Sonnet
              prompt: `Extract comprehensive job data from this LinkedIn job posting:

CURRENT JOB URL: {{job_url}}

EXTRACTION TASKS:
1. Navigate to the job URL
2. Wait for page to fully load
3. Extract complete job information:
   - Full job title and description
   - Company details and website
   - Job requirements and qualifications  
   - Technical skills mentioned
   - Location and work type (remote/hybrid/on-site)
   - Salary information if visible
   - Employment type (full-time/part-time/contract)
   - Contact information if available

4. Return structured data for this job

GOAL: Extract comprehensive job details for database storage.`,
              max_iterations: 10,
              engine: "skyvern-1.0", 
              continue_on_failure: true,
              parameter_keys: [],
              cache_actions: false,
              data_schema: {
                type: "object",
                properties: {
                  job_title: { type: "string" },
                  job_description: { type: "string" },
                  job_url: { type: "string", description: "Canonical LinkedIn job URL from Share button" },
                  job_location: { type: "string" },
                  job_requirements: { 
                    type: "array", 
                    items: { type: "string" }
                  },
                  job_skills: {
                    type: "array",
                    items: { type: "string" }
                  },
                  company_name: { type: "string" },
                  company_description: { type: "string" },
                  company_website: { type: "string" },
                  job_salary: { type: "string" },
                  work_type: { type: "string" },
                  contacts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        title: { type: "string" },
                        linkedin_url: { type: "string" }
                      }
                    }
                  }
                },
                required: ["job_title", "company_name", "job_url"]
              }
            }
          ]
        },

        // 🚀 BLOCK 6: Submit all extracted data at once
        {
          label: "submit_all_jobs",
          block_type: "http_request",
          method: "POST",
          url: "http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=PLACEHOLDER",
          headers: {
            "Content-Type": "application/json",
            "X-User-Api-Key": "PLACEHOLDER_API_KEY",
            "X-User-Id": "PLACEHOLDER_USER_ID"
          },
          body: {
            extracted_information: "{{process_job_links.output}}",
            workflow_run_id: "{{workflow_run_id}}",
            organization_id: "{{organization_id}}",
            timestamp: "{{current_timestamp}}",
            total_jobs_processed: "{{extract_job_links.length}}",
            workflow_metadata: {
              search_keywords: "{{job_keywords}}",
              search_location: "{{location}}",
              approach: "optimized_task_v2_with_job_links"
            }
          },
          timeout: 60,
          follow_redirects: true,
          parameter_keys: [],
          cache_actions: false
        }
      ]
    }
  };
}

/**
 * 🔄 STEP 3: Update workflow via API
 */
async function updateWorkflow(workflowData) {
  console.log('🔄 Updating workflow via API...');
  
  try {
    const response = await fetch(`${SKYVERN_BASE_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT', // or PATCH depending on Skyvern's API
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Workflow updated successfully:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Failed to update workflow:', error);
    return null;
  }
}

/**
 * 🎯 MAIN EXECUTION FUNCTION
 */
async function main() {
  console.log('🚀 STARTING WORKFLOW OPTIMIZATION PROCESS...');
  console.log('');
  
  // Step 1: Fetch existing workflow
  const existingWorkflow = await fetchWorkflowDetails();
  if (!existingWorkflow) {
    console.log('❌ Cannot proceed without existing workflow details');
    return;
  }
  
  console.log('');
  console.log('📋 EXISTING WORKFLOW ANALYSIS:');
  console.log(`Title: ${existingWorkflow.title || 'N/A'}`);
  console.log(`Blocks: ${existingWorkflow.workflow_definition?.blocks?.length || 0}`);
  console.log('');
  
  // Step 2: Create optimized workflow structure
  const optimizedWorkflow = createOptimizedLinkedInWorkflow();
  console.log('✅ Optimized workflow structure created');
  console.log('');
  
  // Step 3: Update workflow
  const updateResult = await updateWorkflow(optimizedWorkflow);
  if (updateResult) {
    console.log('🎉 WORKFLOW OPTIMIZATION COMPLETE!');
    console.log('');
    console.log('🔄 NEXT STEPS:');
    console.log('1. Test the workflow: http://localhost:8081/workflows/wpid_440696153483676908');
    console.log('2. Run workflow and check results');
    console.log('3. Iterate on any issues found');
    console.log('4. Once perfect, migrate to automation-integration.controller.ts');
  } else {
    console.log('❌ Workflow optimization failed');
  }
}

// 🎯 USAGE INSTRUCTIONS
console.log('📋 WORKFLOW EDITOR SCRIPT');
console.log('');
console.log('🔧 SETUP:');
console.log('1. Update API_KEY variable with your Skyvern API key');
console.log('2. Verify SKYVERN_BASE_URL and WORKFLOW_ID are correct');
console.log('3. Run: node workflow-editor-script.js');
console.log('');
console.log('🎯 KEY IMPROVEMENTS IN THIS WORKFLOW:');
console.log('• LOGIN block with credentials specified directly');
console.log('• TASK_V2 blocks for robust execution');  
console.log('• FOR_LOOP over actual job URLs (not generic arrays)');
console.log('• Data extraction → loop → extract details → submit all');
console.log('• Proper webhook authentication with headers');
console.log('');

// Uncomment to run:
// main().catch(console.error);

module.exports = {
  fetchWorkflowDetails,
  createOptimizedLinkedInWorkflow,
  updateWorkflow,
  main
};
