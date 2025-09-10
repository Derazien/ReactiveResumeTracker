# Cover Letter System User Journey Documentation

## 🎯 **Complete User Journey Flow**

### **Phase 1: Job Application Creation & Company Analysis**

#### **1.1 Create Job Application**
```typescript
// User creates a new job application
POST /api/job-applications
{
  "title": "Senior Backend Developer",
  "companyName": "TechCorp Inc",
  "description": "We're looking for a senior backend developer...",
  "url": "https://techcorp.com/careers/backend-dev",
  "notes": "Great company culture, remote-friendly"
}
```

#### **1.2 Automatic Company Analysis**
```typescript
// System automatically analyzes company
POST /api/job-applications/{id}/analyze-company
// Returns:
{
  "culture": "Innovative and collaborative",
  "values": ["Innovation", "Diversity", "Excellence"],
  "mission": "To revolutionize technology...",
  "industry": "Technology",
  "reputation": "Well-respected in the industry",
  "growth": "Rapidly expanding",
  "technology": "Modern tech stack",
  "benefits": "Competitive salary, great benefits",
  "opportunities": "Career growth potential"
}
```

#### **1.3 Contact Discovery**
```typescript
// System discovers relevant contacts
GET /api/contacts/company/{companyId}
// Returns:
[
  {
    "id": "contact1",
    "name": "Sarah Johnson",
    "title": "Senior HR Manager",
    "email": "sarah.johnson@techcorp.com",
    "linkedin": "https://linkedin.com/in/sarahjohnson",
    "type": "HIRING_MANAGER"
  }
]
```

### **Phase 2: Cover Letter Content Preparation**

#### **2.1 Story Extraction via Interview**
```typescript
// User initiates interview flow
POST /api/job-applications/{id}/conduct-interview
{
  "interviewType": "cover_letter"
}

// LLM conducts interactive interview
{
  "interviewQuestions": [
    "Tell me about a time you led a team through a challenging project",
    "Describe a technical problem you solved that had significant impact",
    "How do you handle working with diverse teams?"
  ],
  "suggestedStoryTypes": ["LEADERSHIP", "TECHNICAL", "DIVERSITY"],
  "followUpQuestions": [
    "What was the outcome?",
    "What did you learn from this experience?"
  ]
}
```

#### **2.2 Story Creation & Storage**
```typescript
// User creates narrative stories
POST /api/cover-letter-content
{
  "contentType": "LEADERSHIP",
  "contentId": "experience123", // References existing experience
  "storyText": "I led a team of 8 developers through a critical migration project...",
  "skillTheme": "Leadership and project management",
  "tone": "professional",
  "tags": ["team leadership", "migration", "agile"]
}
```

#### **2.3 Content Library Integration**
```typescript
// Stories are linked to existing content
{
  "id": "story1",
  "contentType": "LEADERSHIP",
  "contentId": "experience123", // Links to existing experience
  "storyText": "3-5 sentence narrative...",
  "skillTheme": "Leadership",
  "tone": "professional",
  "tags": ["leadership", "team management"]
}
```

### **Phase 3: Cover Letter Builder Experience**

#### **3.1 Navigate to Cover Letter Builder**
```typescript
// User clicks "Cover Letter Builder" from job application
GET /cover-letter-builder/{jobApplicationId}

// System loads:
{
  "jobApplication": {
    "id": "job123",
    "title": "Senior Backend Developer",
    "companyName": "TechCorp Inc",
    "description": "...",
    "company": {
      "values": ["Innovation", "Diversity"],
      "culture": "Collaborative",
      "mission": "..."
    }
  },
  "coverLetterContent": [
    {
      "id": "story1",
      "contentType": "LEADERSHIP",
      "storyText": "...",
      "skillTheme": "Leadership"
    }
  ]
}
```

#### **3.2 Content Selection & Matching**
```typescript
// AI matches relevant content
POST /api/cover-letter-content/search
{
  "jobDescription": "We're looking for a senior backend developer...",
  "companyValues": ["Innovation", "Diversity"],
  "userId": "user123"
}

// Returns matched stories:
{
  "matchedStories": [
    {
      "id": "story1",
      "relevanceScore": 0.95,
      "reason": "Demonstrates leadership skills mentioned in job requirements",
      "storyText": "..."
    }
  ]
}
```

#### **3.3 Cover Letter Generation**
```typescript
// Generate tailored cover letter
POST /api/job-applications/{id}/generate-enhanced-cover-letter
{
  "templateName": "professional",
  "tone": "confident",
  "selectedStories": ["story1", "story2"],
  "customInstructions": "Emphasize my passion for innovation"
}

// Returns:
{
  "coverLetter": "Dear Hiring Manager,\n\nI am excited to apply...",
  "usedContent": [
    {
      "id": "story1",
      "contentType": "LEADERSHIP",
      "relevance": "Demonstrates required leadership skills"
    }
  ],
  "template": "professional",
  "tone": "confident"
}
```

### **Phase 4: Cover Letter Customization**

#### **4.1 Visual Template Rendering**
```typescript
// Cover letter renders in artboard
{
  "senderName": "John Doe",
  "senderEmail": "john.doe@email.com",
  "senderPhone": "+1 (555) 123-4567",
  "senderAddress": "123 Main St, City, State",
  "recipientName": "Sarah Johnson",
  "recipientTitle": "Senior HR Manager",
  "companyName": "TechCorp Inc",
  "companyAddress": "456 Tech Ave, Tech City",
  "content": "Dear Sarah Johnson,\n\nI am excited to apply...",
  "footer": "Thank you for considering my application."
}
```

#### **4.2 Real-time Editing**
```typescript
// User edits cover letter in real-time
{
  "content": "Dear Sarah Johnson,\n\nI am excited to apply for the Senior Backend Developer position...",
  "tone": "enthusiastic",
  "customInstructions": "Make it more enthusiastic about the company's innovation focus"
}
```

### **Phase 5: Contact Management & Messaging**

#### **5.1 Contact Management**
```typescript
// User manages contacts
GET /api/contacts/job-application/{jobApplicationId}

// Create new contact
POST /api/contacts
{
  "name": "Mike Chen",
  "title": "Engineering Manager",
  "email": "mike.chen@techcorp.com",
  "linkedin": "https://linkedin.com/in/mikechen",
  "type": "TECHNICAL_LEAD",
  "companyId": "company123",
  "jobApplicationId": "job123"
}
```

#### **5.2 Message Generation**
```typescript
// Generate personalized message
POST /api/contacts/{contactId}/generate-message
{
  "messageType": "linkedin",
  "customInstructions": "Mention my interest in their AI projects",
  "jobApplicationId": "job123"
}

// Returns:
{
  "message": "Hi Mike,\n\nI noticed your work on AI projects at TechCorp...",
  "type": "linkedin",
  "contactInfo": {
    "name": "Mike Chen",
    "title": "Engineering Manager",
    "linkedin": "https://linkedin.com/in/mikechen"
  }
}
```

### **Phase 6: Q&A System Integration**

#### **6.1 Question Management**
```typescript
// User adds job application questions
POST /api/job-application-questions
{
  "jobApplicationId": "job123",
  "question": "Describe your experience with microservices architecture",
  "answer": "I have extensive experience...",
  "category": "TECHNICAL"
}
```

#### **6.2 AI-Powered Answer Generation**
```typescript
// Generate answer from content
POST /api/job-application-questions/{id}/generate-answer
{
  "question": "Describe your experience with microservices architecture",
  "contentIds": ["experience123", "project456"]
}

// Returns:
{
  "answer": "Based on my experience leading the migration project...",
  "usedContent": [
    {
      "id": "experience123",
      "type": "experience",
      "relevance": "Demonstrates microservices experience"
    }
  ]
}
```

## 🔄 **Complete User Journey Map**

### **Entry Points:**
1. **Job Application Detail Page** → "Cover Letter Builder" button
2. **Content Library** → "Create Cover Letter Story" option
3. **Dashboard** → "New Job Application" → Automatic company analysis

### **User Flow Steps:**

#### **Step 1: Job Application Setup**
```
User creates job application
    ↓
System analyzes company automatically
    ↓
System discovers relevant contacts
    ↓
User reviews company information
```

#### **Step 2: Content Preparation**
```
User clicks "Conduct Interview"
    ↓
LLM conducts interactive interview
    ↓
User creates narrative stories
    ↓
Stories are linked to existing content
    ↓
User reviews and refines stories
```

#### **Step 3: Cover Letter Creation**
```
User opens Cover Letter Builder
    ↓
AI matches relevant stories to job
    ↓
User selects preferred stories
    ↓
System generates initial cover letter
    ↓
User customizes content and tone
```

#### **Step 4: Contact Engagement**
```
User reviews company contacts
    ↓
User generates personalized messages
    ↓
User sends messages to contacts
    ↓
User tracks message responses
```

#### **Step 5: Q&A Preparation**
```
User adds job application questions
    ↓
AI generates answers from content
    ↓
User reviews and refines answers
    ↓
User prepares for interviews
```

## 🎯 **Key User Experience Features**

### **1. Seamless Integration**
- Cover letter builder integrates with existing resume builder
- Content library stories link to existing experiences
- Job applications automatically trigger company analysis

### **2. AI-Powered Assistance**
- LLM conducts natural interview to extract stories
- AI matches relevant content to job requirements
- AI generates personalized messages to contacts

### **3. Visual Template System**
- Professional cover letter templates
- Real-time preview in artboard
- Consistent with resume builder experience

### **4. Comprehensive Content Management**
- Stories linked to existing content library
- Multiple story angles for single experiences
- Tag-based organization and search

### **5. Contact & Networking**
- Automatic contact discovery
- Personalized message generation
- LinkedIn and email integration

## 📊 **Success Metrics**

### **User Engagement:**
- Time spent in cover letter builder
- Number of stories created per user
- Cover letter completion rate
- Contact message response rate

### **Content Quality:**
- Story relevance scores
- Cover letter effectiveness (measured by user feedback)
- Content reuse across applications

### **System Performance:**
- LLM response times
- Content matching accuracy
- Company analysis completeness

---

**Last Updated:** January 2025
**Status:** Complete user journey documented
**Next:** Implement TypeScript fixes to enable testing 