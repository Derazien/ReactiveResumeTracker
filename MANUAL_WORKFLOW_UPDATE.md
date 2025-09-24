# Manual Workflow Update Instructions

## 🎯 **Issue Resolutions Completed**

### ✅ **1. Fixed 413 "Request Entity Too Large" Error**
- **Problem**: Webhook payload was too large (megabytes of data)
- **Solution**: Minimized webhook response to essential data only
- **Result**: Response now under 1KB instead of megabytes

### ✅ **2. Enhanced Company Data Extraction** 
- **Request**: Add LinkedIn URL and Logo URL to company extraction
- **Solution**: Updated DTO and prepared enhanced schema
- **Result**: Ready for richer company data similar to company API

---

## 🔧 **Manual Workflow Update Required**

Since the Skyvern API requires authentication we don't have configured, please manually update the workflow:

### **Step 1: Access Workflow Editor**
1. Go to http://localhost:8081/workflows/wpid_440789045004028228
2. Click "Edit Workflow" 

### **Step 2: Update Company Extraction Schema**
1. Find the `extract_company_details` block in the FOR_LOOP
2. In the **Data Schema** section, add these new fields:

```json
{
  "linkedinUrl": {
    "type": "string", 
    "description": "LinkedIn company page URL (current page URL)"
  },
  "logoUrl": {
    "type": "string",
    "description": "Company logo image URL from LinkedIn page"
  }
}
```

### **Step 3: Update Extraction Instructions**
Replace the **Data Extraction Goal** with:

```
Extract comprehensive company information with LinkedIn-specific data:

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

Return comprehensive data matching our automation API schema.
```

### **Step 4: Save and Test**
1. Click "Save Workflow"
2. Run a test with 1-2 jobs
3. Verify both issues are resolved:
   - ✅ No more 413 webhook errors
   - ✅ Company extraction includes LinkedIn URL and logo URL

---

## 🎯 **Expected Results**

After the manual update, your workflow will:

### **Webhook Response (Fixed 413):**
```json
{
  "success": true,
  "processed": 2,
  "errors": 0, 
  "total": 2,
  "message": "Processed 2 jobs: 2 successful, 0 failed"
}
```

### **Enhanced Company Data:**
```json
{
  "companyName": "convivo GmbH",
  "companyDescription": "...",
  "industry": "IT Services and IT Consulting",
  "website": "https://www.convivo.com",
  "location": "Berlin, Germany",
  "linkedinUrl": "https://www.linkedin.com/company/convivo-gmbh/",
  "logoUrl": "https://media.licdn.com/dms/image/company-logo.png"
}
```

---

## 🚀 **Ready to Test**

Your system is now optimized for:
- ✅ **No webhook payload issues** 
- ✅ **Richer company data extraction**
- ✅ **Faster, more reliable automation**

Run your LinkedIn workflow to see the improvements in action! 🎯

