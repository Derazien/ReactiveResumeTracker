# 🤖 Workflow Implementation Guide - Updated Automation Endpoints

## ✅ Changes Made

### 1. **Removed Endpoints**
- ❌ `POST /automation/create-single-job-application` (deleted)

### 2. **New Clean Automation Endpoints**
- ✅ `POST /automation/job-application` - Creates job application + assesses company/contacts needs
- ✅ `POST /automation/company-contacts` - Creates company and contacts when needed

### 3. **API Key Authentication**
- 🔑 All endpoints now require `x-automation-api-key` header
- 🔧 Simple validation (any non-empty key accepted for now)

### 4. **Clear DTOs**
- 📝 `CreateAutomationJobApplicationDto` - Exact schema for job applications
- 📝 `CreateAutomationCompanyContactsDto` - Exact schema for company/contacts

---

## 🔄 Workflow Logic Flow

### Step 1: Create Job Application
```
POST /automation/job-application
Headers: x-automation-api-key: {{user_api_token}}
Body: Job application data (see workflow-job-application-schema.json)

Response includes:
- jobApplication: Created job application
- companyAssessment: 
  - companyExists: boolean
  - needsCompanyCreation: boolean
  - needsContactExtraction: boolean
  - suggestedNextActions: {...}
```

### Step 2: Conditional Company/Contacts Creation
```
IF companyAssessment.needsCompanyCreation OR companyAssessment.needsContactExtraction:
  POST /automation/company-contacts  
  Headers: x-automation-api-key: {{user_api_token}}
  Body: Company and contacts data (see workflow-company-contacts-schema.json)
```

---

## 🛠 Integration Steps for Workflow

### 1. **Add Workflow Parameters**
Add these parameters to your Skyvern workflow:
```json
{
  "key": "user_api_token",
  "description": "API token for automation access",
  "parameter_type": "workflow",
  "workflow_parameter_type": "string",
  "default_value": ""
},
{
  "key": "user_id", 
  "description": "User ID for job application",
  "parameter_type": "workflow",
  "workflow_parameter_type": "string",
  "default_value": ""
}
```

### 2. **Replace HTTP Blocks**
In your FOR_LOOP, replace the existing HTTP blocks with:

**Job Application Block:**
```json
{
  "label": "create_job_application",
  "block_type": "http_request",
  "method": "POST",
  "url": "http://host.docker.internal:3000/api/automation/job-application",
  "headers": {
    "Content-Type": "application/json",
    "x-automation-api-key": "{{user_api_token}}"
  },
  "body": {
    "title": "{{extract_job_data.title}}",
    "companyName": "{{extract_job_data.companyName}}", 
    "description": "{{extract_job_data.description}}",
    "requirements": "{{extract_job_data.requirements}}",
    "extractedTags": "{{extract_job_data.extractedTags}}",
    "url": "{{extract_job_data.url}}",
    "status": "DRAFT",
    "location": "{{extract_job_data.location}}",
    "salary": "{{extract_job_data.salary}}", 
    "industry": "{{extract_job_data.industry}}",
    "notes": "Created via automation",
    "userId": "{{user_id}}"
  },
  "timeout": 30,
  "follow_redirects": true
}
```

**Conditional Company/Contacts Block:**
```json
{
  "label": "create_company_contacts_if_needed",
  "block_type": "http_request",
  "method": "POST",
  "url": "http://host.docker.internal:3000/api/automation/company-contacts",
  "headers": {
    "Content-Type": "application/json",
    "x-automation-api-key": "{{user_api_token}}"
  },
  "body": {
    "companyName": "{{extract_job_data.companyName}}",
    "companyDescription": "{{extract_company_data.description}}",
    "industry": "{{extract_company_data.industry}}",
    "website": "{{extract_company_data.website}}",
    "location": "{{extract_company_data.location}}",
    "contacts": "{{extract_contacts_data}}",
    "userId": "{{user_id}}"
  },
  "timeout": 30,
  "follow_redirects": true,
  "condition": "{{create_job_application.data.companyAssessment.needsCompanyCreation}} OR {{create_job_application.data.companyAssessment.needsContactExtraction}}"
}
```

### 3. **Update Data Extraction Schemas**
Use the schemas from:
- `workflow-job-application-schema.json` 
- `workflow-company-contacts-schema.json`

---

## 🎯 Benefits of New Architecture

### ✅ **Clear Separation of Concerns**
- Job Application creation is separate from company/contacts
- Each endpoint has a single responsibility

### ✅ **Workflow Decision Logic**
- Job application endpoint returns assessment data
- Workflow can conditionally call company/contacts endpoint

### ✅ **Type Safety**
- Clear DTOs that match exact database schemas
- No type mismatches or data transformation errors

### ✅ **API Security**
- All automation endpoints require API key
- Separate from user authentication

### ✅ **Scalability**
- Easy to extend with additional automation endpoints
- Clear patterns for future automation features

---

## 🧪 Testing

### Manual API Testing
```bash
# Test job application creation
curl -X POST http://localhost:3000/api/automation/job-application \
  -H "Content-Type: application/json" \
  -H "x-automation-api-key: test-key" \
  -d '{
    "title": "Software Engineer",
    "companyName": "Test Company",
    "description": "Great job",
    "requirements": ["JavaScript", "React"],
    "extractedTags": ["frontend", "web"],
    "url": "https://example.com/job",
    "location": "Remote",
    "userId": "your-user-id"
  }'

# Test company/contacts creation  
curl -X POST http://localhost:3000/api/automation/company-contacts \
  -H "Content-Type: application/json" \
  -H "x-automation-api-key: test-key" \
  -d '{
    "companyName": "Test Company",
    "companyDescription": "Tech company",
    "industry": "Software",
    "website": "https://testcompany.com",
    "location": "San Francisco", 
    "contacts": [{
      "name": "John Doe",
      "title": "Engineering Manager",
      "linkedinUrl": "https://linkedin.com/in/johndoe"
    }],
    "userId": "your-user-id"
  }'
```

---

## ❓ Questions?

The endpoints are ready to use! Update your workflow with:
1. Add `user_api_token` and `user_id` parameters
2. Replace HTTP blocks with the new endpoint calls  
3. Use the provided JSON schemas for data extraction
4. Test the workflow end-to-end

Let me know if you need help with any specific workflow integration steps!








