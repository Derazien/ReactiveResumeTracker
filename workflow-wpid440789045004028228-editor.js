// 🎯 WORKFLOW wpid_440789045004028228 EDITOR 
// Streamlined single workflow editor using EXACT job application schema

const { getRealUserSettings } = require('./get-real-settings.js');

const WORKFLOW_ID = 'wpid_440789045004028228';

// 📋 EXACT JOB APPLICATION SCHEMA FROM YOUR SYSTEM
// Matches libs/dto/src/job-application/create.ts exactly
const JOB_APPLICATION_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Job title - REQUIRED, minimum 1 character"
    },
    companyName: {
      type: "string", 
      description: "Company name - REQUIRED, minimum 1 character"
    },
    companyId: {
      type: "string",
      description: "Company ID if available - OPTIONAL"
    },
    description: {
      type: "string",
      description: "Full job description - OPTIONAL"
    },
    url: {
      type: "string",
      format: "uri",
      description: "Job posting URL - OPTIONAL, must be valid URL if provided"
    },
    status: {
      type: "string",
      enum: [
        "DRAFT",
        "APPLIED", 
        "INTERVIEW_SCHEDULED",
        "INTERVIEWED",
        "OFFER_RECEIVED",
        "REJECTED",
        "ACCEPTED",
        "WITHDRAWN"
      ],
      default: "DRAFT",
      description: "Application status - defaults to DRAFT"
    },
    appliedDate: {
      type: "string",
      format: "date-time",
      description: "Applied date in ISO format - OPTIONAL"
    },
    notes: {
      type: "string", 
      description: "Additional notes - OPTIONAL"
    },
    requirements: {
      type: "array",
      items: {
        type: "string"
      },
      default: [],
      description: "Array of job requirements - defaults to empty array"
    },
    extractedTags: {
      type: "array",
      items: {
        type: "string"
      },
      default: [],
      description: "Array of extracted tags/skills - defaults to empty array"
    },
    // Additional fields from your DTO
    location: {
      type: "string",
      description: "Job location - OPTIONAL"
    },
    salary: {
      type: "string",
      description: "Salary information - OPTIONAL"
    },
    industry: {
      type: "string",
      description: "Industry category - OPTIONAL"
    }
  },
  required: ["title", "companyName"]
};

class WorkflowEditor {
  constructor() {
    this.settings = null;
    this.workflow = null;
  }

  async init() {
    console.log('🎯 WORKFLOW EDITOR FOR wpid_440789045004028228');
    console.log('=================================================');
    
    this.settings = await getRealUserSettings();
    if (!this.settings) throw new Error('Cannot get user settings');
    
    console.log(`✅ Connected to Skyvern: ${this.settings.baseUrl}`);
    console.log(`👤 User: ${this.settings.userId}`);
    console.log('');
  }

  async fetchWorkflow() {
    console.log('📥 FETCHING CURRENT WORKFLOW');
    console.log('============================');
    
    const response = await fetch(`${this.settings.baseUrl}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.settings.apiKey }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: HTTP ${response.status}`);
    }

    this.workflow = await response.json();
    console.log(`📋 Workflow: ${this.workflow.title}`);
    console.log(`📝 Description: ${this.workflow.description}`);
    
    // Show current block structure
    const blocks = this.workflow.workflow_definition.blocks;
    console.log('');
    console.log('🧱 CURRENT BLOCKS:');
    blocks.forEach((block, i) => {
      console.log(`  ${i + 1}. ${block.label} (${block.block_type.toUpperCase()})`);
      
      if (block.block_type === 'for_loop') {
        console.log(`     → loop_over: "${block.loop_over}"`);
        console.log(`     → loop_variable_reference: "${block.loop_variable_reference || 'NOT SET'}"`);
        console.log(`     → nested blocks: ${block.loop_blocks?.length || 0}`);
      }
    });
    
    return this.workflow;
  }

  createOptimizedWorkflow() {
    console.log('');
    console.log('🔧 CREATING OPTIMIZED WORKFLOW STRUCTURE');
    console.log('========================================');
    console.log('✅ Using EXACT job application schema from your system');
    console.log('✅ Removing batch processing - single job app creation');
    console.log('✅ Fixed FOR_LOOP data flow connection');
    console.log('');

    const optimizedBlocks = [
      // Block 1: Navigate to LinkedIn
      {
        label: "navigate_to_linkedin",
        block_type: "navigation",
        url: "https://www.linkedin.com/jobs/search/?keywords={{job_keywords}}&location={{location}}&f_TPR=r86400&sortBy=DD",
        navigation_goal: "Navigate to LinkedIn job search with specified keywords and location",
        parameter_keys: ["job_keywords", "location"],
        cache_actions: false
      },

      // Block 2: Login 
      {
        label: "linkedin_login",
        block_type: "login",
        url: "https://www.linkedin.com/login",
        navigation_goal: "Complete LinkedIn authentication process",
        parameter_keys: ["linkedin_username", "linkedin_password"],
        max_retries: 3,
        max_steps_per_run: 15
      },

      // Block 3: Navigate to job search after login
      {
        label: "navigate_to_jobs",
        block_type: "navigation", 
        url: "https://www.linkedin.com/jobs/search/?keywords={{job_keywords}}&location={{location}}&f_TPR=r86400&sortBy=DD",
        navigation_goal: "Navigate back to job search results after successful login",
        parameter_keys: ["job_keywords", "location"]
      },

      // Block 4: Extract job URLs (simple extraction)
      {
        label: "extract_job_urls",
        block_type: "extraction",
        data_extraction_goal: `Extract LinkedIn job URLs from the search results page.
        
        Find ALL job listing links on the current page.
        Look for href attributes containing "/jobs/view/"
        Extract ONLY the complete URLs as simple strings.
        
        Return an array of job URLs - nothing else.`,
        data_schema: {
          type: "array",
          items: {
            type: "string",
            format: "uri",
            description: "Complete LinkedIn job URL"
          }
        },
        llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
      },

      // Block 5: FOR_LOOP - Process each job with EXACT schema
      {
        label: "process_jobs",
        block_type: "for_loop",
        loop_over: "extract_job_urls", // 🎯 FIXED: Connect to extraction block
        // Don't set loop_variable_reference - let Skyvern handle it
        complete_if_empty: true,
        loop_blocks: [
          // Block 1: Navigate to job URL (NAVIGATION ONLY)
          {
            label: "navigate_to_job",
            block_type: "navigation",
            url: "{{current_value}}", // 🎯 Navigate to the job URL from loop
            navigation_goal: `Navigate to the LinkedIn job posting and prepare it for data extraction.
            
CURRENT JOB URL: {{current_value}}

NAVIGATION REQUIREMENTS:
1. Navigate to the specific job URL
2. Wait for the job posting page to completely load
3. Ensure all job details are visible on the page
4. Handle any pop-ups or overlays that might appear
5. Click on the "Share" button to reveal sharing options
6. Wait for share modal/dropdown to appear

Goal is complete when:
- Job posting page is fully loaded
- Share button has been clicked
- Share options are visible
- Page is ready for URL extraction`,
            parameter_keys: [],
            cache_actions: false,
            max_retries: 3
          },
          
          // Block 2: Extract canonical job URL (EXTRACTION ONLY)
          {
            label: "extract_canonical_url",
            block_type: "extraction",
            data_extraction_goal: `Extract the canonical LinkedIn job URL from the share functionality that is now visible.

EXTRACTION REQUIREMENTS:
1. Look at the share modal/dropdown that should be open
2. Find the canonical job URL (usually displayed in share options)
3. Extract the complete, clean LinkedIn job URL
4. Ensure URL format is: https://www.linkedin.com/jobs/view/[ID]/

CRITICAL: Extract only the clean canonical URL without tracking parameters.
Return the URL as a simple string value.`,
            data_schema: {
              type: "string",
              format: "uri", 
              description: "The canonical LinkedIn job URL extracted from share functionality"
            },
            llm_key: "ANTHROPIC_CLAUDE3_HAIKU",
            parameter_keys: [],
            cache_actions: false
          },
          
          // Block 3: Extract job data with exact schema
          {
            label: "extract_job_data",
            block_type: "extraction",
            data_extraction_goal: `Extract comprehensive job application data from the current LinkedIn job posting page.

CANONICAL JOB URL: {{extract_canonical_url}} (from URL extraction block)
ORIGINAL URL: {{current_value}}

EXTRACTION REQUIREMENTS:
Extract ALL available job information using the EXACT schema provided below.

CRITICAL FIELD REQUIREMENTS:
- title: Extract the exact job title (REQUIRED - cannot be empty)
- companyName: Extract the company name (REQUIRED - cannot be empty)  
- description: Full job description text (extract complete description)
- requirements: Parse job requirements into array of strings
- extractedTags: Extract skills/technologies mentioned as array of strings  
- location: Job location (city, state, country if specified)
- salary: Salary range or compensation info if visible
- url: Use the canonical job URL from extraction block ({{extract_canonical_url}})
- status: Default to "DRAFT"
- industry: Industry category if mentioned
- All other optional fields as available on the page

EXTRACTION STRATEGY:
1. Look for job title in main heading or title area
2. Find company name (usually prominent near title)
3. Extract full job description from main content area
4. Parse requirements section for skills/qualifications
5. Look for location information
6. Check for salary/compensation details
7. Extract any industry or category information

Return valid JSON matching the exact schema structure. Ensure required fields are never empty.`,

            // 🎯 EXACT SCHEMA FROM YOUR SYSTEM
            data_schema: JOB_APPLICATION_EXTRACTION_SCHEMA,
            
            llm_key: "ANTHROPIC_CLAUDE3_HAIKU",
            parameter_keys: [],
            cache_actions: false
          }
        ]
      }

      // NOTE: Removed HTTP_REQUEST block as requested
      // Will add single job application creation API call later
    ];

    return {
      title: this.workflow.title + " - Streamlined",
      description: "Streamlined workflow using exact job application schema for single job creation",
      proxy_location: this.workflow.proxy_location,
      webhook_callback_url: null, // Removed webhook
      persist_browser_session: this.workflow.persist_browser_session,
      browser_session_id: this.workflow.browser_session_id,
      workflow_definition: {
        parameters: this.workflow.workflow_definition.parameters,
        blocks: optimizedBlocks
      }
    };
  }

  async updateWorkflow() {
    console.log('💾 UPDATING WORKFLOW');
    console.log('====================');
    
    const optimizedWorkflow = this.createOptimizedWorkflow();
    
    // Show the changes being made
    console.log('🔧 CHANGES BEING APPLIED:');
    console.log('✅ Fixed FOR_LOOP: loop_over = "extract_job_urls"');
    console.log('✅ Fixed loop variable: using {{current_value}}');
    console.log('✅ Exact job application schema applied');
    console.log('✅ Removed batch processing webhook');
    console.log('✅ Using Haiku LLM for cost optimization');
    console.log('');

    try {
      // Create new workflow (to avoid update validation issues)
      const response = await fetch(`${this.settings.baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': this.settings.apiKey },
        body: JSON.stringify(optimizedWorkflow)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const newWorkflow = await response.json();
      console.log('✅ WORKFLOW UPDATED SUCCESSFULLY!');
      console.log(`🆔 New Workflow ID: ${newWorkflow.workflow_id}`);
      console.log(`🔗 Debug URL: http://localhost:8081/workflows/${newWorkflow.workflow_id}/debug`);
      console.log('');
      
      console.log('📊 VALIDATION CHECKLIST:');
      console.log('□ FOR_LOOP connected to extraction block');
      console.log('□ Job application schema matches system exactly');
      console.log('□ Loop variables use {{current_value}}');
      console.log('□ Haiku LLM configured for cost optimization');
      console.log('□ No batch processing - single job focus');
      console.log('');
      
      console.log('🎯 NEXT STEPS:');
      console.log('1. Test the workflow with small parameters');
      console.log('2. Verify extraction output matches your schema');
      console.log('3. Add single job application API call');
      console.log('4. Scale up for production use');

      return newWorkflow;

    } catch (error) {
      console.error('❌ Update failed:', error.message);
      throw error;
    }
  }

  async run() {
    try {
      await this.init();
      await this.fetchWorkflow();
      const newWorkflow = await this.updateWorkflow();
      
      console.log('');
      console.log('🎉 STREAMLINED WORKFLOW READY!');
      console.log('==============================');
      console.log(`Workflow ID: ${newWorkflow.workflow_id}`);
      console.log('✅ Exact job application schema implemented');
      console.log('✅ FOR_LOOP data flow fixed');
      console.log('✅ Ready for single job application testing');
      
      return newWorkflow.workflow_id;

    } catch (error) {
      console.error('❌ Editor failed:', error.message);
      process.exit(1);
    }
  }
}

// Export for use
module.exports = { WorkflowEditor, JOB_APPLICATION_EXTRACTION_SCHEMA };

// Run if called directly
if (require.main === module) {
  const editor = new WorkflowEditor();
  editor.run();
}
