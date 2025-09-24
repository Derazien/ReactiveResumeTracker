#!/usr/bin/env node

// Update Company Extraction with LinkedIn URL and Logo URL
// Addresses user request for richer company data similar to company API

const SKYVERN_API_URL = 'http://localhost:8000';
const WORKFLOW_ID = 'wpid_440789045004028228';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk';

const ENHANCED_COMPANY_SCHEMA = {
  type: "object",
  properties: {
    companyName: { 
      type: "string",
      description: "Official company name as displayed on LinkedIn" 
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
    // 🆕 NEW FIELDS - Enhanced LinkedIn data
    linkedinUrl: {
      type: "string",
      description: "LinkedIn company page URL (current page URL)"
    },
    logoUrl: {
      type: "string", 
      description: "Company logo image URL from LinkedIn page"
    },
    userId: {
      type: "string",
      description: "User ID for API call"
    }
  },
  required: ["companyName", "userId"]
};

const ENHANCED_EXTRACTION_GOAL = `Extract comprehensive company information with LinkedIn-specific data:

CURRENT COMPANY: {{extract_data_format_output.extracted_information.companyName}}

REQUIRED DATA:
1. Official company name (as displayed on LinkedIn)
2. Company description/about section  
3. Industry/sector
4. Company website URL
5. Company headquarters location
6. LinkedIn company page URL (current page URL)
7. Company logo URL (from page header/about section)

LINKEDIN SPECIFIC EXTRACTION:
- linkedinUrl: Capture the current LinkedIn company page URL
- logoUrl: Look for company logo in:
  * Page header area
  * Company profile section
  * About section images
  * Look for <img> tags with company logo or brand assets

PROCESS:
- Scroll through company page to find all information
- Click "Show more" to expand company description if needed
- Look for company website link
- Extract industry information
- Get location/headquarters info
- Capture current page URL as linkedinUrl
- Find and extract company logo image URL

Return comprehensive data matching our automation API schema.`;

async function updateCompanyExtraction() {
  try {
    console.log('🎯 UPDATING COMPANY EXTRACTION SCHEMA');
    console.log('====================================');
    console.log('');
    
    // Fetch current workflow
    console.log('📖 Fetching current workflow...');
    const response = await fetch(`${SKYVERN_API_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: {
        'x-skyvern-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow: ${response.status}`);
    }
    
    const workflow = await response.json();
    console.log('✅ Workflow fetched successfully');
    
    // Find and update the extract_company_details block
    const blocks = workflow.workflow_definition.blocks;
    let companyBlock = null;
    
    for (let block of blocks) {
      if (block.label === 'extract_company_details') {
        companyBlock = block;
        break;
      }
      
      // Check nested blocks in FOR_LOOP
      if (block.block_type === 'for_loop' && block.loop_blocks) {
        for (let loopBlock of block.loop_blocks) {
          if (loopBlock.label === 'extract_company_details') {
            companyBlock = loopBlock;
            break;
          }
        }
      }
    }
    
    if (!companyBlock) {
      throw new Error('extract_company_details block not found in workflow');
    }
    
    console.log('📋 Found extract_company_details block');
    console.log('');
    
    console.log('🔧 ENHANCEMENTS BEING APPLIED:');
    console.log('• Adding linkedinUrl field (company LinkedIn URL)');
    console.log('• Adding logoUrl field (company logo image)');
    console.log('• Enhanced extraction instructions');
    console.log('');
    
    // Update the block with enhanced schema and goal
    companyBlock.data_schema = ENHANCED_COMPANY_SCHEMA;
    companyBlock.data_extraction_goal = ENHANCED_EXTRACTION_GOAL;
    
    // Update the workflow
    console.log('💾 Updating workflow...');
    const updateResponse = await fetch(`${SKYVERN_API_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: {
        'x-skyvern-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update workflow: ${updateResponse.status}`);
    }
    
    console.log('✅ Company extraction updated successfully!');
    console.log('');
    console.log('📊 NEW EXTRACTION CAPABILITIES:');
    console.log('• linkedinUrl: Company LinkedIn profile URL');
    console.log('• logoUrl: Company logo image URL');  
    console.log('• Enhanced instructions for LinkedIn-specific data');
    console.log('');
    console.log('🎯 Your workflow will now extract richer company data!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to update company extraction:', error.message);
    return false;
  }
}

if (require.main === module) {
  updateCompanyExtraction()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(console.error);
}

module.exports = { updateCompanyExtraction };

