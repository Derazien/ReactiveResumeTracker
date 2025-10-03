# 📚 Complete Skyvern Block Types Reference

## 🎯 **All Available Block Types in Skyvern**

Based on analysis of the Skyvern codebase, here are **ALL 19 block types** available:

---

## 🤖 **Browser Automation Blocks**

### **1. NAVIGATION** 🌐
**Purpose**: Navigate to URLs and interact with web pages
```yaml
block_type: navigation
url: "https://example.com"
navigation_goal: "Navigate to page and perform actions"
engine: "skyvern-1.0"
```
**Use Cases**: Page navigation, form filling, button clicking, web interaction

### **2. ACTION** ⚡
**Purpose**: Perform specific browser actions
```yaml
block_type: action
action_goal: "Click the submit button and wait for confirmation"
```
**Use Cases**: Specific browser interactions, complex multi-step actions

### **3. EXTRACTION** 📊
**Purpose**: Extract structured data from web pages
```yaml
block_type: extraction
data_extraction_goal: "Extract job listings with title, company, salary"
data_schema: { type: "array", items: { ... } }
```
**Use Cases**: Data scraping, information gathering, structured data collection

### **4. LOGIN** 🔐
**Purpose**: Dedicated authentication handling
```yaml
block_type: login
url: "https://site.com/login"
login_goal: "Login using provided credentials"
```
**Use Cases**: Authentication, credential management, secure login flows

---

## 🧠 **AI & Intelligence Blocks**

### **5. TEXT_PROMPT** 💭 ⭐ **DYNAMIC USER PROMPTING**
**Purpose**: AI analyzes situation and provides guidance to user
```yaml
block_type: text_prompt
prompt: "Analyze current page. Am I logged in? What should I do next?"
llm_key: "ANTHROPIC_CLAUDE3.5_HAIKU"
json_schema: { ... } # Optional structured response
```
**Use Cases**: 
- **Dynamic guidance**: "I'm stuck at login, what should I do?"
- **Page analysis**: "What do you see on this page?"
- **User instruction**: AI asks user for specific input/decisions
- **Error recovery**: "Something went wrong, how should I proceed?"

### **6. TASK** 🎯
**Purpose**: Execute complete automation tasks
```yaml
block_type: task
url: "https://example.com"
navigation_goal: "Complete the entire workflow"
```
**Use Cases**: Complex multi-step automations, complete workflows

### **7. TaskV2** 🚀
**Purpose**: Enhanced task execution with advanced features
```yaml
block_type: task_v2
prompt: "Complete this automation task with AI guidance"
max_iterations: 10
```
**Use Cases**: AI-driven automation, complex decision making

---

## ⏸️ **Control Flow Blocks**

### **8. WAIT** ⏰ ⭐ **USER INTERACTION PAUSE**
**Purpose**: Pause execution for time or user action
```yaml
block_type: wait
wait_sec: 60
wait_goal: "Pause for user to complete manual login"
```
**Use Cases**:
- **Manual intervention**: Wait for user to login/complete actions
- **Page loading**: Wait for dynamic content to load
- **User decision**: Pause for user to provide input

### **9. VALIDATION** ✅ ⭐ **CONDITIONAL LOGIC**
**Purpose**: Conditional branching based on previous results
```yaml
block_type: validation
complete_criterion: "{{ previous_block.success }} == true"
terminate_criterion: "{{ error_count }} > 3"
```
**Use Cases**:
- **Conditional execution**: "If login failed, try alternative approach"
- **Error handling**: "If too many errors, stop workflow"
- **Success validation**: "If data extracted, continue to next step"

### **10. FOR_LOOP** 🔄
**Purpose**: Iterate over data sets
```yaml
block_type: for_loop
loop_over_parameter_key: "job_urls"
loop_variable_reference: "current_job"
```
**Use Cases**: Process multiple items, bulk operations, data iteration

---

## 📁 **File & Data Processing Blocks**

### **11. FILE_UPLOAD** 📤
**Purpose**: Upload files to cloud storage
```yaml
block_type: file_upload
storage_type: "S3"
s3_bucket: "my-bucket"
```
**Use Cases**: File uploads, document processing, data storage

### **12. FILE_DOWNLOAD** 📥
**Purpose**: Download files from web pages
```yaml
block_type: file_download
navigation_goal: "Download the PDF report"
```
**Use Cases**: File downloads, document collection, resource gathering

### **13. DOWNLOAD_TO_S3** ☁️
**Purpose**: Download and store files to AWS S3
```yaml
block_type: download_to_s3
url: "https://example.com/file.pdf"
```
**Use Cases**: Cloud storage, file archival, document management

### **14. UPLOAD_TO_S3** ⬆️
**Purpose**: Upload local files to AWS S3
```yaml
block_type: upload_to_s3
path: "/local/file.pdf"
```
**Use Cases**: Cloud backup, file sharing, data persistence

---

## 📄 **Document Processing Blocks**

### **15. PDF_PARSER** 📑
**Purpose**: Extract structured data from PDF files
```yaml
block_type: pdf_parser
file_url: "https://example.com/document.pdf"
json_schema: { ... }
```
**Use Cases**: PDF data extraction, document analysis, form processing

### **16. FILE_URL_PARSER** 🔗
**Purpose**: Parse and extract data from various file formats
```yaml
block_type: file_url_parser
file_url: "https://example.com/data.csv"
file_type: "csv"
```
**Use Cases**: CSV/Excel processing, data import, file analysis

---

## 🌐 **Communication & Integration Blocks**

### **17. SEND_EMAIL** 📧
**Purpose**: Send emails with automation results
```yaml
block_type: send_email
smtp_host_secret_parameter_key: "smtp_host"
recipients: ["user@example.com"]
```
**Use Cases**: Notifications, results delivery, communication

### **18. HTTP_REQUEST** 🌍
**Purpose**: Make HTTP API calls
```yaml
block_type: http_request
method: "POST"
url: "https://api.example.com/endpoint"
headers: { "Authorization": "Bearer token" }
```
**Use Cases**: API integration, webhook calls, external service communication

---

## 💻 **Programming Blocks**

### **19. CODE** 🔧
**Purpose**: Execute custom Python code
```yaml
block_type: code
code: |
  # Custom Python logic
  result = process_data(input_data)
  return result
```
**Use Cases**: Custom logic, data processing, complex calculations

### **20. GOTO_URL** 🎯
**Purpose**: Simple URL navigation
```yaml
block_type: goto_url
url: "https://example.com"
```
**Use Cases**: Simple page navigation, URL redirection

---

## ⭐ **Most Relevant for Dynamic User Prompting**

### **🥇 TEXT_PROMPT** - **AI-Powered User Guidance**
```yaml
# Example: Dynamic LinkedIn Analysis
block_type: text_prompt
prompt: "I'm on LinkedIn. Analyze the page and tell me: 1) Am I logged in? 2) What obstacles do you see? 3) What should I do next?"
llm_key: "ANTHROPIC_CLAUDE3.5_HAIKU"
```
**Result**: AI provides intelligent, contextual guidance

### **🥈 WAIT** - **User Action Pause**
```yaml
# Example: Manual Login Pause
block_type: wait
wait_sec: 120
wait_goal: "Pause for user to complete LinkedIn login manually"
```
**Result**: Automation pauses, user can intervene

### **🥉 VALIDATION** - **Conditional Logic**
```yaml
# Example: Login Success Check
block_type: validation
complete_criterion: "{{ user_completed_login }} == true"
```
**Result**: Branches workflow based on conditions

---

## 🎯 **Why Some Blocks Aren't in UI**

The **Skyvern UI workflow builder** shows **simplified blocks** to avoid overwhelming users. **Advanced blocks like TEXT_PROMPT, WAIT, VALIDATION are API-only** but **fully functional**.

## 💡 **Implementation Difficulty: EASY**

**Dynamic user prompting is EASY to implement** because:
- ✅ **TEXT_PROMPT blocks**: Already proven working
- ✅ **WAIT blocks**: Simple pause mechanism  
- ✅ **VALIDATION blocks**: Conditional branching
- ✅ **Integration**: Just add blocks to your workflow JSON

**Your automation system can easily become much more intelligent with these blocks!** 🚀


















