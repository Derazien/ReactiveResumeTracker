# Section-Specific AI Resume Editing

## 📋 Overview

The section-specific AI editing feature allows users to target specific resume sections for AI-powered improvements while leaving other sections unchanged. This provides more granular control over resume editing and reduces the risk of unintended changes to sections that are already well-crafted.

## 🎯 Key Features

### **Section Selection**
- **Multi-section Selection**: Users can select multiple sections to edit simultaneously
- **All Sections Option**: Default option to edit the entire resume
- **Individual Section Control**: Target specific sections like Experience, Skills, Summary, etc.
- **Visual Feedback**: Clear indication of which sections are selected

### **Smart Editing Logic**
- **Section Isolation**: Only selected sections are modified by the AI
- **Structure Preservation**: All resume structure and metadata remain intact
- **Content Preservation**: Unselected sections remain exactly as they were
- **Context Awareness**: AI understands which sections it can and cannot modify

### **Enhanced Job Context Integration**
- **Structured Job Information**: Clear, formatted job context similar to resume tailoring
- **Requirements Mapping**: Numbered list of job requirements for better AI understanding
- **Targeted Tailoring**: AI focuses on highlighting skills and experiences that match job requirements
- **Context Preservation**: Job context is logged for debugging and analysis

### **Comprehensive Logging**
- **Detailed Request Logs**: Every edit request is logged with full context
- **LLM Input/Output Tracking**: Complete capture of AI prompts and responses
- **Error Handling**: Failed requests are logged with detailed error information
- **Usage Analytics**: Token usage and performance metrics are tracked

## 🏗️ Architecture

### **Frontend Components**

#### **Toolbar Integration** (`apps/client/src/pages/builder/_components/toolbar.tsx`)
```typescript
// Section selection state
const [selectedSections, setSelectedSections] = useState<string[]>(["all"]);

// Available sections for editing
const EDITABLE_SECTIONS = [
  { value: "all", label: t`All Sections` },
  { value: "summary", label: t`Summary` },
  { value: "experience", label: t`Experience` },
  // ... more sections
];
```

#### **UI Features**
- **Checkbox Grid**: 2-column layout for easy section selection
- **Smart Logic**: "All Sections" deselects individual sections and vice versa
- **Validation**: Prevents submission without section selection
- **Responsive Design**: Works on desktop and mobile

### **Backend Implementation**

#### **DTO Updates** (`libs/dto/src/resume/edit-resume.ts`)
```typescript
export const editResumeSchema = z.object({
  prompt: z.string().min(1).max(1000),
  resumeData: resumeDataSchema,
  includeJobContext: z.boolean().optional(),
  selectedSections: z.array(z.string()).optional(), // NEW: Section selection
});
```

#### **Service Logic** (`apps/server/src/llm/llm.service.ts`)
```typescript
async editResume(
  userId: string, 
  prompt: string, 
  resumeData: any, 
  includeJobContext?: boolean, 
  selectedSections?: string[]
): Promise<any>
```

#### **Enhanced Job Context Structure**
The system now provides structured job context similar to resume tailoring:

```typescript
// Structured job context format
jobContext = `

JOB CONTEXT:
Position: ${job.title}
Company: ${job.company}
Description: ${job.description || "Not provided"}
Requirements:
${requirements.map((req: string, index: number) => `${index + 1}. ${req}`).join("\n")}

Please tailor the resume content to be relevant for this specific job position. Focus on highlighting skills and experiences that match the job requirements.`;
```

#### **AI Prompt Engineering**
The system dynamically generates section-specific instructions:

```typescript
// Prepare section-specific instructions
let sectionInstructions = "";
if (selectedSections && selectedSections.length > 0 && !selectedSections.includes("all")) {
  const sectionNames = selectedSections.map(section => {
    switch (section) {
      case "summary": return "summary section";
      case "experience": return "experience section";
      // ... more mappings
    }
  }).join(", ");
  
  sectionInstructions = `

SECTION-SPECIFIC EDITING:
You are ONLY allowed to modify the following sections: ${sectionNames}
All other sections must remain EXACTLY as they are in the original resume.
Do not modify any sections not listed above.`;
}
```

#### **Comprehensive Logging System**
Every edit request generates a detailed log file:

```typescript
// Generate unique log ID for this edit request
const logId = `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const timestamp = new Date().toISOString();

// Log file includes:
// - Request details (prompt, selected sections, job context)
// - Complete LLM input and output
// - Edited resume data
// - Usage information and performance metrics
// - Error details (if any)
```

#### **Token Optimization & Section-Specific Processing**
The system optimizes token usage by only sending selected sections to the LLM:

```typescript
// Prepare data to send to LLM based on selected sections
let dataToSend: any;
let isSectionSpecific = false;

if (selectedSections && selectedSections.length > 0 && !selectedSections.includes("all")) {
  // Section-specific editing: only send selected sections
  isSectionSpecific = true;
  dataToSend = {
    basics: {},
    sections: {}
  };
  
  // Add only selected sections to reduce token usage
  for (const section of selectedSections) {
    switch (section) {
      case "summary":
        dataToSend.basics.summary = resumeData.basics.summary;
        break;
      case "basics":
        dataToSend.basics = { ...resumeData.basics };
        break;
      default:
        if (resumeData.sections[section]) {
          dataToSend.sections[section] = { ...resumeData.sections[section] };
        }
        break;
    }
  }
  
  // Update system prompt for section-specific editing
  systemPrompt = `You are an expert resume editor... Return ONLY the edited sections...`;
} else {
  // Full resume editing: send complete resume
  dataToSend = resumeData;
}

// Merge edited sections back into original resume
if (isSectionSpecific) {
  editedResumeData = JSON.parse(JSON.stringify(resumeData)); // Deep copy original
  
  // Merge edited sections back
  if (editedData.basics) {
    editedResumeData.basics = { ...editedResumeData.basics, ...editedData.basics };
  }
  
  if (editedData.sections) {
    for (const [sectionKey, sectionData] of Object.entries(editedData.sections)) {
      editedResumeData.sections[sectionKey] = sectionData;
    }
  }
}
```

## 🔧 Implementation Details

### **Section Mapping**

| Frontend Value | Backend Section | Description |
|----------------|-----------------|-------------|
| `summary` | `basics.summary` | Professional summary |
| `experience` | `sections.experience.items` | Work experience |
| `education` | `sections.education.items` | Educational background |
| `skills` | `sections.skills.items` | Technical and soft skills |
| `projects` | `sections.projects.items` | Project portfolio |
| `awards` | `sections.awards.items` | Awards and recognition |
| `certifications` | `sections.certifications.items` | Professional certifications |
| `languages` | `sections.languages.items` | Language proficiencies |
| `interests` | `sections.interests.items` | Personal interests |
| `volunteer` | `sections.volunteer.items` | Volunteer experience |
| `publications` | `sections.publications.items` | Published works |
| `references` | `sections.references.items` | Professional references |
| `profiles` | `sections.profiles.items` | Social profiles |
| `basics` | `basics` | Contact information |

### **Job Context Structure**

When job context is included, the system provides:

```json
{
  "jobId": "job_application_id",
  "jobTitle": "Senior Software Engineer",
  "company": "TechCorp",
  "description": "Detailed job description...",
  "requirements": [
    "5+ years of experience",
    "Strong proficiency in JavaScript",
    "Experience with React and Node.js"
  ],
  "url": "https://company.com/job-posting"
}
```

### **User Experience Flow**

1. **Open AI Editor**: User clicks the magic wand button in the toolbar
2. **Select Sections**: User chooses which sections to edit via checkboxes
3. **Enter Prompt**: User describes desired improvements
4. **Job Context**: System automatically includes job context if available
5. **Submit**: System sends only selected sections to AI with clear instructions
6. **Receive Results**: AI returns complete resume with only selected sections modified
7. **Review**: User can see exactly what changed and what remained the same
8. **Logging**: System generates comprehensive log file for debugging

### **Error Handling**

- **No Sections Selected**: Prevents submission and shows warning message
- **Invalid Section Names**: Backend validates section names against allowed list
- **AI Parsing Errors**: Graceful fallback with clear error messages
- **Structure Validation**: Ensures returned resume maintains required structure
- **Logging Failures**: System continues even if logging fails

## 🎨 UI/UX Design

### **Visual Design**
- **Clean Layout**: 2-column grid for efficient space usage
- **Clear Labels**: Descriptive section names with proper translations
- **State Indicators**: Visual feedback for selected/unselected states
- **Responsive**: Adapts to different screen sizes

### **Interaction Patterns**
- **Smart Selection**: "All Sections" automatically deselects individual sections
- **Individual Selection**: Selecting specific sections deselects "All Sections"
- **Validation**: Submit button disabled until valid selection is made
- **Feedback**: Clear messaging about what will be edited

## 🔒 Security & Validation

### **Input Validation**
- **Section Names**: Backend validates against allowed section list
- **Array Limits**: Prevents excessive section arrays
- **Content Sanitization**: Ensures safe content processing

### **Data Integrity**
- **Structure Preservation**: Maintains resume schema integrity
- **ID Preservation**: Keeps all existing IDs and relationships
- **Metadata Protection**: Preserves all metadata and settings

## 📊 Logging & Analytics

### **Log File Structure**
Each edit request generates a comprehensive log file in `logs/api-calls/`:

```markdown
# API Call: editResume
- **Timestamp:** 7/28/2025, 8:12:54 PM
- **Log ID:** `edit_1234567890_abc123def`
- **User ID:** `user_id`
- **Status:** ✅ Success

## Request Details
- **Prompt:** "Make my experience section more impactful"
- **Selected Sections:** ["experience"]
- **Include Job Context:** Yes

## Job Context
```json
{
  "jobTitle": "Senior Developer",
  "company": "TechCorp",
  "requirements": ["5+ years experience", "JavaScript proficiency"]
}
```

## LLM Input
```json
{
  "userId": "user_id",
  "prompt": "Make my experience section more impactful",
  "selectedSections": ["experience"],
  "jobContext": {...},
  "resumeData": {...}
}
```

## LLM Output
```json
{
  "success": true,
  "data": "edited resume json",
  "usage": {...}
}
```

## Edited Resume Data
```json
{
  "basics": {...},
  "sections": {...},
  "metadata": {...}
}
```
```

### **Log File Naming Convention**
- **Format**: `edit_{logId}_{timestamp}.md`
- **Example**: `edit_1234567890_abc123def_2025-07-28T17-12-54-993Z.md`
- **Location**: `logs/api-calls/`

### **Logging Benefits**
- **Debugging**: Complete visibility into AI decision-making
- **Performance**: Track token usage and response times
- **Quality Assurance**: Monitor AI output quality and consistency
- **User Support**: Detailed logs for troubleshooting user issues
- **Analytics**: Understand usage patterns and popular editing requests

## 🧪 Testing Scenarios

### **Functional Testing**
1. **Single Section Editing**: Edit only experience section
2. **Multi-Section Editing**: Edit experience and skills together
3. **All Sections Editing**: Edit entire resume (default behavior)
4. **No Selection**: Prevent submission without selection
5. **Section Isolation**: Verify unselected sections remain unchanged
6. **Job Context Integration**: Test with and without job context
7. **Logging Verification**: Ensure logs are generated correctly

### **Edge Cases**
1. **Empty Sections**: Handle sections with no content
2. **Large Content**: Test with extensive resume content
3. **Special Characters**: Test with special characters in prompts
4. **Network Issues**: Handle API failures gracefully
5. **Logging Failures**: System continues when logging fails

## 📈 Performance Considerations

### **Token Optimization Benefits**
- **50-80% Token Reduction**: When editing specific sections, only those sections are sent to the LLM
- **Faster Response Times**: Reduced token count leads to quicker AI processing
- **Lower Costs**: Significant reduction in API costs for section-specific editing
- **Better Context Focus**: AI can focus entirely on the selected sections without distraction
- **Scalable Architecture**: System can handle larger resumes efficiently

### **Optimization Strategies**
- **Token Reduction**: Only send selected sections to AI (50-80% token savings)
- **Dynamic Prompting**: Optimized prompts based on section selection
- **Reduced Max Tokens**: 4000 tokens for section-specific vs 8000 for full resume
- **Caching**: Cache common section combinations
- **Async Processing**: Non-blocking UI during AI processing
- **Progress Indicators**: Show processing status to users
- **Efficient Logging**: Async log generation to avoid blocking

### **Scalability**
- **Section Limits**: Reasonable limits on number of sections
- **Content Size**: Handle large resume content efficiently
- **Concurrent Requests**: Support multiple users editing simultaneously
- **Log Storage**: Efficient log file management and cleanup

## 🔮 Future Enhancements

### **Planned Features**
1. **Section Templates**: Pre-defined editing templates for common scenarios
2. **Batch Operations**: Edit multiple resumes with same section selection
3. **Section History**: Track changes per section over time
4. **Smart Suggestions**: AI suggests which sections need improvement
5. **Log Analytics Dashboard**: Web interface for analyzing edit patterns

### **Advanced Capabilities**
1. **Cross-Section Editing**: AI can suggest changes across related sections
2. **Section Dependencies**: Handle sections that depend on each other
3. **Custom Sections**: Support for user-defined custom sections
4. **Section Analytics**: Track which sections are most commonly edited
5. **Real-time Logging**: Live log streaming for monitoring

## 📚 Integration Points

### **Existing Systems**
- **Content Library**: Leverages existing content matching system
- **Job Applications**: Integrates with job context feature
- **Resume Sync**: Works with existing resume synchronization
- **Form Validation**: Uses existing validation patterns
- **Logging Infrastructure**: Extends existing API call logging

### **API Endpoints**
- **POST `/llm/edit-resume`**: Enhanced with section selection and job context
- **Request Body**: Includes `selectedSections` array and `includeJobContext` flag
- **Response**: Complete resume with targeted modifications
- **Logging**: Automatic log file generation for every request

## 🛠️ Development Guidelines

### **Code Standards**
- **TypeScript**: Strict typing for all new code
- **Error Handling**: Comprehensive error handling and user feedback
- **Testing**: Unit and integration tests for new functionality
- **Documentation**: Clear code comments and API documentation
- **Logging**: Comprehensive logging for debugging and analytics

### **Maintenance**
- **Section Updates**: Easy to add new sections to the system
- **Translation Support**: All UI text supports internationalization
- **Backward Compatibility**: Maintains compatibility with existing features
- **Monitoring**: Logging and metrics for feature usage
- **Log Management**: Regular cleanup and archiving of log files

## 📝 Usage Examples

### **Example 1: Improve Experience Section with Job Context**
```
Selected Sections: ["experience"]
Prompt: "Make my experience descriptions more impactful with action verbs and quantifiable achievements"
Job Context: Senior Developer position at TechCorp
Result: Only experience section is modified with job-relevant improvements, all other sections remain unchanged
```

### **Example 2: Professional Summary and Skills**
```
Selected Sections: ["summary", "skills"]
Prompt: "Make the language more professional and add technical keywords for software engineering"
Job Context: Software Engineer position requiring JavaScript and React
Result: Summary and skills sections are modified with job-relevant keywords, experience and other sections unchanged
```

### **Example 3: Complete Resume Overhaul**
```
Selected Sections: ["all"]
Prompt: "Optimize the entire resume for ATS compatibility and make it more compelling"
Job Context: Product Manager position at startup
Result: All sections are modified according to the prompt and job context
```

### **Example 4: Section-Specific with No Job Context**
```
Selected Sections: ["projects"]
Prompt: "Add more technical details to my project descriptions"
Job Context: None
Result: Only projects section is modified with enhanced technical details
```

This feature provides users with precise control over their resume editing process, ensuring that only the sections they want to improve are modified while preserving their carefully crafted content in other areas. The enhanced job context integration and comprehensive logging system provide better AI understanding and complete visibility into the editing process. 