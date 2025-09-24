#!/usr/bin/env node

// Enhanced Company Extraction Schema with LinkedIn URL and Logo
// Addresses user request for richer company data extraction

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

const ENHANCED_EXTRACTION_GOAL = `Extract comprehensive company information:

CURRENT COMPANY: {{extract_data_format_output.extracted_information.companyName}}

REQUIRED DATA:
1. Official company name (as displayed on LinkedIn)
2. Company description/about section
3. Industry/sector
4. Company website URL
5. Company headquarters location
6. LinkedIn company page URL (current page URL)
7. Company logo URL (from page header/about section)

PROCESS:
- Scroll through company page to find all information
- Click "Show more" to expand company description if needed
- Look for company website link
- Extract industry information
- Get location/headquarters info
- Capture the current LinkedIn company page URL
- Find and extract the company logo image URL

LINKEDIN SPECIFIC EXTRACTION:
- linkedinUrl: Use the current page URL (company's LinkedIn page)
- logoUrl: Look for company logo in header area, about section, or profile image
- Look for img tags with company logo, profile images, or brand assets

Schema matches our automation API for company creation with enhanced LinkedIn data.`;

console.log('🎯 ENHANCED COMPANY EXTRACTION SCHEMA');
console.log('=====================================');
console.log('');
console.log('📋 ADDED FIELDS:');
console.log('• linkedinUrl - Company LinkedIn profile URL');  
console.log('• logoUrl - Company logo image URL');
console.log('');
console.log('🔧 EXTRACTION GOAL:');
console.log(ENHANCED_EXTRACTION_GOAL);
console.log('');
console.log('📊 SCHEMA:');
console.log(JSON.stringify(ENHANCED_COMPANY_SCHEMA, null, 2));

module.exports = {
  schema: ENHANCED_COMPANY_SCHEMA,
  extractionGoal: ENHANCED_EXTRACTION_GOAL
};

