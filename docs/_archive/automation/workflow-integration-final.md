# Final Workflow HTTP Integration Guide

## 🎯 Objective
Add an HTTP request block to workflow `wpid_440789045004028228` to send extracted job data to our automation endpoint.

## 📋 Current Workflow Structure
Based on our manual fixes, the workflow should have:
1. `extract_job_urls` - Extract job URLs for looping
2. `FOR_LOOP` with `loop_over: "extract_job_urls"`
3. Inside loop: 3 blocks for each job
   - `navigate_to_job` - Navigate to job URL
   - `extract_canonical_url` - Get clean LinkedIn URL
   - `extract_job_data` - Extract comprehensive job data

## 🚀 HTTP Block to Add
Add this as the **4th block inside the FOR_LOOP**:

```json
{
  "label": "send_job_to_api",
  "block_type": "http_request",
  "method": "POST",
  "url": "http://host.docker.internal:3000/api/automation/create-single-job-application",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{user_api_key}}"
  },
  "body": {
    "title": "{{extract_job_data.title}}",
    "companyName": "{{extract_job_data.companyName}}",
    "description": "{{extract_job_data.description}}",
    "requirements": "{{extract_job_data.requirements}}",
    "extractedTags": "{{extract_job_data.extractedTags}}",
    "url": "{{extract_canonical_url}}",
    "status": "DRAFT",
    "location": "{{extract_job_data.location}}",
    "salary": "{{extract_job_data.salary}}",
    "industry": "{{extract_job_data.industry}}",
    "notes": "Automated LinkedIn job extraction",
    "createdViaAutomation": true
  },
  "timeout": 30,
  "follow_redirects": true,
  "parameter_keys": [],
  "cache_actions": false,
  "continue_on_failure": true,
  "max_retries": 2
}
```

## 🏗️ Complete Job Application Schema
The `extract_job_data` block must return exactly this schema to match our API:

```json
{
  "type": "object",
  "properties": {
    "title": { 
      "type": "string", 
      "description": "Job title (REQUIRED)" 
    },
    "companyName": { 
      "type": "string", 
      "description": "Company name (REQUIRED)" 
    },
    "description": { 
      "type": "string", 
      "description": "Full job description text" 
    },
    "requirements": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of job requirements"
    },
    "extractedTags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Skills and technologies mentioned"
    },
    "location": { 
      "type": "string", 
      "description": "Job location or work arrangement" 
    },
    "salary": { 
      "type": "string", 
      "description": "Salary information if visible" 
    },
    "industry": { 
      "type": "string", 
      "description": "Industry or job category" 
    }
  },
  "required": ["title", "companyName"]
}
```

## 🔧 Manual Implementation Steps
Since programmatic updates fail, apply these changes manually in Skyvern UI:

### Step 1: Access Workflow
1. Go to http://localhost:8081/workflows/wpid_440789045004028228
2. Click "Edit Workflow"

### Step 2: Locate FOR_LOOP Block
1. Find the `FOR_LOOP` block with `loop_over: "extract_job_urls"`
2. Open the loop_blocks array (should have 3 blocks)

### Step 3: Add HTTP Block
1. Add the HTTP request block as the 4th block in `loop_blocks`
2. Set all required fields as shown above
3. Ensure proper Jinja templating: `{{extract_job_data.fieldName}}`

### Step 4: Verify Schema
1. Check that `extract_job_data` block uses the exact schema above
2. Ensure all field names match our API expectations
3. Set `llm_key: "ANTHROPIC_CLAUDE3_HAIKU"` for cost optimization

### Step 5: Test Parameters
Add these workflow parameters if missing:
- `user_api_key`: User's API token for authentication
- `user_id`: User identifier for the API endpoint

## 🎯 Expected Flow
1. Extract job URLs → Create loop array
2. For each job URL:
   - Navigate to job posting
   - Extract canonical LinkedIn URL
   - Extract comprehensive job data
   - **Send data to our API** ← NEW STEP
3. API creates job application with company detection
4. Returns actionable data for further automation

## 🚨 Critical Points
- Use `ANTHROPIC_CLAUDE3_HAIKU` for all LLM calls (60x cheaper)
- Set `continue_on_failure: true` to prevent single job failures from stopping workflow
- Use exact field names matching our DTO schema
- Template variables must match block labels exactly
- Test with 1-2 jobs before running full automation

## 🔍 Debugging
- Monitor workflow at: http://localhost:8081/workflows/wpid_440789045004028228/runs
- Check API logs for successful job application creation
- Verify company detection and contact relationships in database
- Test HTTP block independently if needed

---
**Ready for implementation! The workflow will now create job applications directly in our system with full company and contact relationship management.**