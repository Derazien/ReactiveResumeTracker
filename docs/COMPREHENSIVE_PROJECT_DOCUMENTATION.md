# ReactiveResumeTracker - Comprehensive Project Documentation

## 🎯 Project Overview

**ReactiveResumeTracker** is an enhanced fork of the open-source [Reactive Resume](https://docs.rxresu.me/) project with advanced LLM-powered job application tracking and smart resume generation capabilities. It transforms the original resume builder into a comprehensive career management platform.

### Key Enhancements Over Original Reactive Resume
- **Job Application Tracking System** with detailed metadata and status management
- **Multi-Provider LLM Integration** (Anthropic Claude, OpenAI, Local models)
- **Smart Content Library** with AI-powered content suggestions and matching
- **RAG (Retrieval-Augmented Generation) System** for intelligent content retrieval
- **Advanced Content Matching** with multi-layer optimization
- **Embedding-based Similarity Search** using Cohere API
- **Tagging System** for smart categorization and filtering
- **✨ Tailored Cover Letter Generation** with mass-production workflow and company theme analysis

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM (SQLite for development)
- **PDF Generation**: Browserless (Headless Chrome)
- **Storage**: MinIO (S3-compatible object storage)
- **Build System**: Nx 19.8.14 (Monorepo)
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: TanStack Query + Zustand
- **Internationalization**: LinguiJS + Crowdin

### LLM & AI Technologies
- **Primary LLM**: Anthropic Claude 3.5 Sonnet (recommended)
- **Alternative LLMs**: OpenAI GPT-4, Local models (Ollama/LM Studio)
- **Embeddings**: Cohere API (embed-english-v3.0)
- **Content Matching**: Multi-layer optimization with keyword pre-filtering
- **RAG System**: Vector similarity search with semantic matching

## 📁 Project Structure

```
ReactiveResumeTracker/
├── apps/
│   ├── client/                    # React frontend application
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── job-applications/     # Job tracking UI
│   │   │   │   │   ├── content-library/      # Content management UI
│   │   │   │   │   └── resumes/              # Resume management
│   │   │   │   ├── builder/                  # Resume builder interface
│   │   │   │   └── auth/                     # Authentication pages
│   │   │   ├── components/                   # Reusable UI components
│   │   │   ├── services/                     # API service layer
│   │   │   ├── stores/                       # State management
│   │   │   └── providers/                    # Context providers
│   │   └── public/
│   │       └── templates/                    # Template assets (JPG, PDF, JSON)
│   ├── server/                    # NestJS backend API
│   │   ├── src/
│   │   │   ├── job-application/          # Job tracking API
│   │   │   ├── llm/                      # LLM integration service
│   │   │   │   ├── providers/            # LLM provider implementations
│   │   │   │   └── interfaces/           # LLM provider interfaces
│   │   │   ├── content-library/          # Content management API
│   │   │   ├── cover-letter-content/     # Cover letter content management
│   │   │   ├── content-matching/         # Content matching service
│   │   │   ├── embedding/                # Embedding generation service
│   │   │   ├── tag/                      # Tagging system
│   │   │   ├── resume/                   # Resume API (enhanced)
│   │   │   ├── user/                     # User management
│   │   │   └── auth/                     # Authentication (disabled for dev)
│   │   └── prisma/                       # Database schema and migrations
│   └── artboard/                  # PDF generation service
│       └── src/templates/                # Resume template React components
├── libs/                          # Shared libraries
│   ├── dto/                              # Data transfer objects
│   ├── schema/                           # Zod validation schemas
│   ├── ui/                               # Shared UI components
│   ├── utils/                            # Utility functions
│   ├── hooks/                            # Shared React hooks
│   └── parser/                           # Resume parsing utilities
├── tools/                         # Development tools
│   ├── db-scripts/                       # Database utilities
│   └── compose/                          # Docker compose configurations
└── docs/                         # Project documentation
```

## 🚀 Core Features

### 1. Job Application Tracking System
**Location**: `apps/server/src/job-application/` & `apps/client/src/pages/dashboard/job-applications/`

**Features**:
- Track job applications with detailed metadata (company, position, status, notes)
- Link applications to specific resumes
- Application status management (Applied, Interview, Offer, Rejected, etc.)
- Notes and follow-up tracking
- URL-based job posting analysis
- Two-step application creation flow

**Key Components**:
- `JobApplicationController` - REST API endpoints
- `JobApplicationService` - Business logic
- `JobApplicationModule` - Module configuration
- Frontend pages for comprehensive job application management

### 2. LLM Integration System
**Location**: `apps/server/src/llm/`

**Features**:
- Multi-provider LLM support with easy switching
- Job posting analysis from URLs and text
- Smart content extraction and matching
- Resume content generation and enhancement
- Cover letter generation
- Interview question generation
- Content similarity detection

**Supported Providers**:
- **Anthropic Claude** (recommended): Best reasoning and analysis
- **OpenAI GPT-4**: Widely compatible, good performance
- **Local Models**: Privacy-focused via Ollama/LM Studio

**Key Components**:
- `LLMService` - Main LLM orchestration service
- `AnthropicProvider`, `OpenAIProvider`, `LocalLLMProvider` - Provider implementations
- `LLMProvider` interface - Standardized provider contract

### 3. Smart Content Library
**Location**: `apps/server/src/content-library/` & `apps/client/src/pages/dashboard/content-library/`

**Features**:
- Reusable resume content blocks (experiences, skills, projects, education)
- Categorized content with smart tagging
- AI-powered content suggestions
- Content matching for job applications
- Version control and content history
- Bulk content operations

**Content Types**:
- Work Experience
- Education
- Skills (with proficiency levels)
- Projects
- Certifications
- Languages
- Awards
- Publications
- Volunteer Work
- Interests
- Custom Sections

### 4. RAG (Retrieval-Augmented Generation) System
**Location**: `apps/server/src/embedding/` & `apps/server/src/content-matching/`

**Features**:
- Vector embeddings using Cohere API
- Semantic similarity search
- Multi-layer content matching optimization
- Keyword-based pre-filtering
- Lightweight and detailed LLM scoring
- Intelligent content retrieval for job applications

**Optimization Layers**:
1. **Layer 1**: Keyword-based pre-filtering (reduces content by 60-80%)
2. **Layer 2**: Lightweight LLM scoring (minimal tokens)
3. **Layer 3**: Detailed LLM analysis (only for high-scoring content)

### 5. Advanced Content Matching
**Location**: `apps/server/src/content-matching/`

**Features**:
- Multi-dimensional similarity analysis
- Temporal overlap detection
- Company and role context analysis
- Technology domain matching
- Seniority level extraction
- Fuzzy text similarity
- Comprehensive scoring algorithms

### 6. Tagging System
**Location**: `apps/server/src/tag/`

**Features**:
- Tag content and job applications
- Smart categorization
- Filter and search by tags
- Auto-tagging with LLM assistance
- Tag-based content organization

### 7. ✨ Tailored Cover Letter Generation System
**Location**: `apps/server/src/cover-letter-content/` & `apps/client/src/pages/cover-letter-builder/`

**Features**:
- **Mass-Production Workflow**: Automated cover letter generation following industry best practices
- **Company Theme Analysis**: Extracts key themes (analytics, leadership, tech, etc.) from job descriptions
- **Smart Content Selection**: Maps company themes to paragraph types using semantic similarity
- **Token-Based Templates**: Master template with replaceable tokens (`[FIRST NAME]`, `[Company]`, `[Paragraph A]`)
- **Content Scoring**: Company value alignment and overall fit scoring (0-100)
- **Lexical Tuning**: Echoes company language and incorporates company-specific terminology

**Content Types**:
- `PARAGRAPH_ANALYTICS`: Quantitative + qualitative analytical skills
- `PARAGRAPH_DIVERSITY`: Diversity & curiosity stories  
- `PARAGRAPH_LEADERSHIP`: Leadership + client management
- `PARAGRAPH_TECH`: Technical depth (software/AI)
- `PARAGRAPH_COLLABORATION`: Teamwork and communication
- `PARAGRAPH_INNOVATION`: Creative problem-solving
- `PARAGRAPH_IMPACT`: Results-oriented achievements
- `PARAGRAPH_GROWTH`: Learning ability and adaptability
- `PARAGRAPH_CHALLENGE`: Problem-solving and resilience
- `PARAGRAPH_VALUES`: Company culture and values alignment

**Generation Workflow**:
1. **Theme Extraction**: Analyze job description and company info to identify 3-5 key themes
2. **Content Selection**: Map themes to content types and select best matching paragraph blocks
3. **Template Generation**: Use token-based template with selected content and user data
4. **Quality Scoring**: Calculate company alignment, content diversity, and overall fit scores

**API**: `POST /api/job-applications/:id/generate-tailored-cover-letter`

**Documentation**: `docs/TAILORED_COVER_LETTER_GENERATION.md`

## 🎨 Template System

### Template Architecture
**Location**: `apps/artboard/src/templates/`

Templates are React components that define how resumes are rendered to PDF:
- Each template is a self-contained React component
- Supports dynamic layouts with sidebar/main content areas
- Uses Tailwind CSS for styling
- Template previews stored in `apps/client/public/templates/`

### Available Templates
- `azurill` - Two-column with colored sidebar
- `bronzor` - Professional timeline layout
- `chikorita` - Dark sidebar with light content
- `ditto` - Minimalist single column
- `gengar` - Bold headers with clean sections
- `glalie` - Balanced two-column design
- `kakuna` - Centered layout with emphasis
- `leafish` - Creative with color accents
- `nosepass` - Compact professional
- `onyx` - Clean and modern (default)
- `pikachu` - Colorful and dynamic
- `rhyhorn` - Simple and elegant

### Template Creation
**Guide**: `TEMPLATE_CREATION_GUIDE.md`
- Template components use Tailwind CSS
- Support for dynamic layouts and responsive design
- Integration with content library system
- Preview generation and PDF export

## 📊 Data Structures

### Resume Section Schemas
**Location**: `libs/schema/src/sections/`

All resume sections follow a consistent pattern with:
- Base item schema with content library integration
- Content reference states (unmodified, modified, manual)
- Zod validation schemas
- TypeScript type definitions

**Key Sections**:
- Experience (company, position, location, date, summary)
- Education (institution, studyType, area, score, date)
- Skills (name, description, level, keywords)
- Projects (name, description, date, summary, keywords)
- Languages (name, description, level)
- Certifications (name, issuer, date, summary)
- Awards (title, awarder, date, summary)
- Volunteer (organization, position, location, date)
- Interests (name, keywords)
- Publications (name, publisher, date, summary)
- References (name, description, summary)
- Profiles (network, username, icon, url)
- Custom Sections (dynamic user-defined sections)

### Content Library Integration
- Direct content references via `contentId`
- Source tracking via `sourceContentId`
- Modification detection and version control
- Seamless integration between editor and library

## 🔧 API Architecture

### REST Endpoints

#### Job Application Endpoints

**⚠️ IMPORTANT**: Job application creation has been significantly enhanced. The basic `POST /job-applications` endpoint now includes:

- ✅ **Company Relationships**: Proper `companyId` linking for clean data relationships
- ✅ **Embedding Generation**: Automatic RAG system embeddings for content matching consistency  
- ✅ **Smart Content Detection**: Only generates embeddings when sufficient content exists
- ✅ **Error Resilience**: Creation succeeds even if embedding generation fails

The analyze → create-from-analysis pattern remains the primary workflow for LLM-powered job processing, but basic creation is now fully featured.

```
# ENHANCED BASIC CREATE (now production-ready)
POST   /job-applications                   # Enhanced create with embeddings + company linking

# ACTUAL WORKFLOW (primary usage)  
POST   /job-applications/analyze           # 1. Analyze job posting text/URL
POST   /job-applications/create-from-analysis # 2. Create from analysis result

# STANDARD CRUD
GET    /job-applications                   # List applications
GET    /job-applications/:id               # Get application details  
PATCH  /job-applications/:id               # Update application (proper DTO structure)
DELETE /job-applications/:id               # Delete application

# ENHANCEMENT OPERATIONS
POST   /job-applications/:id/generate-resume           # Generate tailored resume
POST   /job-applications/:id/generate-enhanced-cover-letter    # Generate enhanced cover letter
POST   /job-applications/:id/generate-tailored-cover-letter    # Generate tailored cover letter
POST   /job-applications/:id/conduct-interview                 # Conduct story extraction interview
```

**Data Structure Notes:**
- `requirements`: Stored as JSON string in database, parsed as `string[]` in frontend
- `extractedTags`: Stored as JSON string in database, parsed as `string[]` in frontend  
- `companyId`: **✨ NEW**: Proper company relationships - links to Company record when available
- `companyName`: **LEGACY**: Maintained for backward compatibility, will be phased out
- `embedding`/`embeddingHash`: RAG system fields for content matching

**UI Enhancement:**
- ✅ Manual job form now uses `CompanyAutocomplete` component
- ✅ Search existing companies or create new ones
- ✅ Automatic company research triggered on creation
- ✅ Proper company linking with `companyId` relationship

#### LLM Endpoints
```
POST   /llm/analyze                       # Analyze job posting text
POST   /llm/generate-content              # Generate resume content
POST   /llm/enhance-content               # Enhance existing content
POST   /llm/chat                          # General chat interface
POST   /llm/extract-cv-content            # Extract content from CV text
POST   /llm/detect-similar-content        # Find similar content
GET    /llm/provider                      # Get current provider info
```

#### Content Library Endpoints
```
POST   /content-library                   # Save content block
GET    /content-library                   # List content blocks
GET    /content-library/search            # Search content
PATCH  /content-library/:id               # Update content
DELETE /content-library/:id               # Delete content
POST   /content-library/batch             # Bulk operations
```

#### Company Endpoints
```
POST   /company                           # Create company
GET    /company                           # List companies
GET    /company/search?name=X             # Search by name
GET    /company/:id                       # Get company details
PUT    /company/:id                       # Update company
DELETE /company/:id                       # Delete company
POST   /company/:id/research              # Enhanced company research
```

#### Contact Endpoints
```
POST   /contacts                          # Create contact  
GET    /contacts                          # List contacts
GET    /contacts/:id                      # Get contact details
GET    /contacts/company/:companyId       # Get company contacts
GET    /contacts/job-application/:jobId   # Get job application contacts
PATCH  /contacts/:id                      # Update contact
DELETE /contacts/:id                      # Delete contact
```

#### 🤖 Automation Integration Endpoints

**Current Implementation**: Uses existing webhook approach via AutomationIntegrationController

```
GET    /automation/status                 # Check Skyvern engine status
POST   /automation/execute-linkedin-workflow # LinkedIn automation workflow
POST   /automation/linkedin-job-search-callback # Job data webhook
POST   /automation/company-research-callback    # Company data webhook
```

**Optimal Automation Workflow** (based on current API structure):

```
1. Company Research First:
   Skyvern → POST /company (create company record)
   
2. Job Creation:  
   Skyvern → POST /job-applications/create-from-analysis
   {
     analysisData: {
       title: "Senior React Developer",
       company: "TechCorp Inc", 
       description: "Full job description...",
       requirements: ["React", "TypeScript", "5+ years"],
       extractedTags: ["frontend", "react", "senior"],
       location: "San Francisco, CA",
       salaryRange: "$120k-150k"
     },
     url: "https://linkedin.com/jobs/123"
   }

3. Contact Creation:
   Skyvern → POST /contacts (create contact records)
   {
     name: "Sarah Johnson",
     title: "Engineering Manager", 
     linkedinUrl: "https://linkedin.com/in/sarah",
     companyId: "company_id_from_step_1",
     jobApplicationId: "job_id_from_step_2"
   }
```

**Error Handling Strategy**: 
- Log failed jobs, continue processing remaining jobs
- Each job processed independently
- Failed items logged for manual review

**Authentication**: 
- Uses existing Skyvern API key system
- Webhooks called with proper user context

**✅ Phase 2 Complete: Combined Automation Endpoint**

New endpoint: `POST /api/automation/create-job-application`

**Request Structure:**
```typescript
{
  userId: string,
  company: CreateCompanyDto,
  jobApplication: Omit<CreateJobApplicationDto, 'companyName' | 'companyId'>,
  contacts: Array<Omit<CreateContactDto, 'companyId' | 'jobApplicationId'>>
}
```

**Key Features:**
- ✅ **Atomic Transaction**: All-or-nothing creation using Prisma transactions
- ✅ **Company-First Workflow**: Creates company first, then job, then contacts
- ✅ **Automatic Linking**: Handles all relationship IDs automatically
- ✅ **Embedding Generation**: Jobs include RAG embeddings (Phase 1 enhancement)
- ✅ **Comprehensive Response**: Returns all created records with summary
- ✅ **Error Resilience**: Proper error handling with rollback on failures

**Response Structure:**
```typescript
{
  success: boolean,
  message: string,
  data: {
    company: Company,
    jobApplication: JobApplication,
    contacts: Contact[],
    summary: {
      companyId: string,
      jobApplicationId: string, 
      contactIds: string[],
      totalContacts: number
    }
  }
}
```

This endpoint is optimized for Skyvern automation and follows all the architectural principles established.

## 🔄 **Complete LinkedIn Automation Workflow**

### **Step 1: User Initiates Automation**
**Location**: `http://localhost:5173/dashboard/job-applications`
**Frontend**: `apps/client/src/pages/dashboard/job-applications/_components/automation-toolbar.tsx`

```typescript
// User configures automation
const workflowConfig = {
  jobKeywords: "React Developer",        // User input
  location: "San Francisco, CA",         // User input
  remoteStatus: "remote",               // User dropdown selection
  timePeriod: "pastWeek",               // User dropdown selection
  maxJobs: 5,                           // User input (1-20)
  waitForUserLogin: true                // User checkbox
};

// Frontend calls backend
await fetch("/api/automation/execute-linkedin-workflow", {
  method: "POST",
  body: JSON.stringify(workflowConfig)
});
```

### **Step 2: Backend Creates Skyvern Task**
**Backend**: `apps/server/src/automation-integration.controller.ts:134`

```typescript
async executeLinkedInWorkflow(body: WorkflowConfig) {
  const userId = "cmcfcpf8e0000u4lg7u0i3bsh"; // Current user
  
  // Build LinkedIn search URL with user's filters
  const linkedinSearchUrl = `https://www.linkedin.com/jobs/search/?keywords=${body.jobKeywords}&location=${body.location}&f_WT=${remoteFilter}`;
  
  // Create comprehensive Skyvern task
  const automationTask = {
    url: linkedinSearchUrl,
    navigation_goal: `Search LinkedIn for jobs and extract comprehensive data`,
    data_extraction_goal: `
      For each job posting:
      1. Extract job details (title, description, requirements, skills, salary)
      2. Navigate to company LinkedIn page
      3. Extract company information (name, description, industry, size)
      4. Visit company website if available for additional details
      5. Find 3-5 relevant contacts (hiring managers, recruiters, team leads)
    `,
    extracted_information_schema: { /* Matches our API DTOs exactly */ },
    webhook_callback_url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${userId}`
  };
  
  // Send to Skyvern
  const response = await fetch('http://localhost:8000/api/v1/tasks', {
    method: 'POST',
    headers: { 'X-API-Key': apiKey },
    body: JSON.stringify(automationTask)
  });
}
```

### **Step 3: Skyvern Performs Automation**
**What Skyvern Does:**
1. **Opens browser** (visible in Skyvern UI at `http://localhost:8081`)
2. **Navigates to LinkedIn** job search with user's filters
3. **Waits for user login** (if `waitForUserLogin: true`)
4. **Searches and extracts** job data from each posting
5. **For each job**:
   - Visits company LinkedIn page
   - Extracts company details
   - Visits company website (if exists)
   - Finds relevant contacts
6. **Formats data** in exact structure needed for our APIs

### **Step 4: Skyvern Sends Results via Webhook**
**Webhook**: `POST http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=xxx`

**Data Format** (matches our API DTOs):
```json
{
  "extracted_information": [
    {
      "job_title": "Senior React Developer",
      "job_description": "Full description...",
      "job_requirements": ["React", "TypeScript", "5+ years"],
      "job_skills": ["react", "typescript", "frontend"],
      "company_name": "TechCorp Inc",
      "company_description": "Leading tech company...",
      "company_website": "https://techcorp.com",
      "contacts": [
        {
          "name": "Sarah Johnson",
          "title": "Engineering Manager",
          "linkedin_url": "https://linkedin.com/in/sarah",
          "email": "sarah@techcorp.com"
        }
      ]
    }
  ]
}
```

### **Step 5: Webhook Processes Each Job**
**Backend**: `automation-integration.controller.ts:362`

```typescript
async processLinkedInJobs(data: any, userId: string) {
  for (const jobData of data.extracted_information) {
    // Transform Skyvern data to our API format
    const automatedJobData = {
      userId,
      company: { /* Company data from Skyvern */ },
      jobApplication: { /* Job data from Skyvern */ },
      contacts: [ /* Contact data from Skyvern */ ]
    };
    
    // Call our combined automation API
    const result = await this.createAutomatedJobApplication(automatedJobData);
  }
}
```

### **Step 6: Combined API Creates Records Atomically**
**Backend**: `automation-integration.controller.ts:29`

```typescript
async createAutomatedJobApplication(data: CreateAutomatedJobDto) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Create company (with name deduplication)
    const company = await this.companyService.create(userId, data.company);
    
    // 2. Create job application (linked to company, skip embeddings for speed)
    const job = await this.jobApplicationService.create(userId, {
      ...data.jobApplication,
      companyId: company.id
    }, { skipEmbeddings: true });
    
    // 3. Create contacts (linked to both company and job)
    const contacts = await Promise.all(
      data.contacts.map(contact => this.contactService.create(userId, {
        ...contact,
        companyId: company.id,
        jobApplicationId: job.id
      }))
    );
    
    return { company, job, contacts };
  });
}
```

### **Step 7: User Sees Results**
**Location**: `http://localhost:5173/dashboard/job-applications`

User sees complete job applications with:
- ✅ Job details from LinkedIn
- ✅ Company profiles (with deduplication)  
- ✅ Contact information for networking
- ✅ Ready for resume tailoring and application

#### Cover Letter Content Endpoints
```
POST   /cover-letter-content              # Create cover letter story
GET    /cover-letter-content              # List cover letter stories  
GET    /cover-letter-content/:id          # Get story details
PATCH  /cover-letter-content/:id          # Update story
DELETE /cover-letter-content/:id          # Delete story
POST   /cover-letter-content/search       # Search stories by content
```

### 🔧 **Create API Services Analysis** 

**Status**: All create endpoints are production-ready for automation integration.

#### **Job Application Create Service**
**Enhanced in Phase 1** with embedding generation for RAG consistency:

```typescript
async create(userId: string, createJobApplicationDto: CreateJobApplicationDto): Promise<JobApplication>
```

**✅ Key Features:**
- Automatic embedding generation when sufficient content exists (description > 10 chars OR requirements OR tags)
- Proper company linking via `companyId` 
- JSON serialization of `requirements[]` and `extractedTags[]`
- Error-resilient (creation succeeds even if embedding generation fails)
- Smart content detection to avoid unnecessary processing

**DTO-Schema Alignment**: ✅ Perfect - all fields match Prisma schema exactly

#### **Company Create Service**
**Production Ready** with comprehensive field support:

```typescript
async create(userId: string, createDto: CreateCompanyDto): Promise<Company>
```

**✅ Key Features:**  
- All social media URLs supported (LinkedIn, Twitter, Facebook, Instagram, YouTube, GitHub)
- JSON values field with proper defaults
- Comprehensive error handling and logging
- Clean, reliable creation logic

**DTO-Schema Alignment**: ✅ Perfect - all 16 fields match Prisma schema exactly

#### **Contact Create Service**
**Production Ready** with relationship support:

```typescript
async create(userId: string, createContactDto: CreateContactDto)
```

**✅ Key Features:**
- Support for both `companyId` and `jobApplicationId` relationships
- Email validation and URL validation built-in
- Auto-includes related company and jobApplication data
- Simple, efficient spread-operator implementation

**DTO-Schema Alignment**: ✅ Perfect - all 11 fields match Prisma schema exactly

#### **Ready for Automation**
All three services can be combined in atomic transactions for automation:

```typescript
const company = await this.companyService.create(userId, companyData);
const jobApp = await this.jobApplicationService.create(userId, {
  ...jobData,
  companyId: company.id
});
const contacts = await Promise.all(
  contactsData.map(contact => 
    this.contactService.create(userId, {
      ...contact,
      companyId: company.id,
      jobApplicationId: jobApp.id
    })
  )
);
```

#### Embedding Endpoints
```
POST   /embedding/generate                # Generate single embedding
POST   /embedding/batch                   # Generate batch embeddings
POST   /embedding/similarity              # Calculate similarity
GET    /embedding/status                  # Get service status
```

### Authentication Status
**Currently Disabled for Development**
- All API endpoints use `MOCK_USER_ID`
- TODO comments added for re-enabling auth
- Guards and decorators preserved for future activation
- User-specific LLM settings supported

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- pnpm package manager
- PostgreSQL database (SQLite for development)

### Quick Start
```bash
# Run the comprehensive setup script
./setup.ps1

# Or for setup only (no server start)
./setup.ps1 -OnlySetup

# Manual development start
pnpm dev
```

### Environment Configuration
Key environment variables in `.env`:
```env
# LLM Configuration
LLM_PROVIDER=anthropic|openai|local
ANTHROPIC_API_KEY=your_claude_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo-preview

# Embedding Configuration
COHERE_API_KEY=your_cohere_key
COHERE_MODEL=embed-english-v3.0

# Database
DATABASE_URL="file:./dev.db"  # SQLite for development

# Development Mode (Auth disabled)
DISABLE_EMAIL_AUTH=true
```

### Nx Commands
```bash
# Development
pnpm dev                    # Start all applications
pnpm build                  # Build all applications
pnpm test                   # Run tests
pnpm lint                   # Lint code
pnpm format                 # Format code

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # Open Prisma Studio

# Internationalization
pnpm messages:extract       # Extract translation messages
pnpm crowdin:sync           # Sync with Crowdin
```

## 🔄 Workflow Integration

### Job Application Workflow
1. **URL Analysis**: Paste job posting URL → AI extracts requirements
2. **Content Matching**: System matches your content library to job requirements
3. **Smart Resume Generation**: Creates tailored resume for specific job
4. **Application Tracking**: Track status, notes, follow-ups

### Content Management Workflow
1. **Content Creation**: Add experiences, skills, projects to library
2. **AI Enhancement**: Use LLM to improve content quality
3. **Smart Tagging**: Auto-tag content for easy retrieval
4. **Similarity Detection**: Find and merge duplicate content

### Resume Generation Workflow
1. **Template Selection**: Choose from 13+ professional templates
2. **Content Selection**: Pick relevant content from library
3. **AI Optimization**: Tailor content for specific job
4. **PDF Generation**: Export professional resume

## 📈 Performance Optimizations

### LLM Cost Optimization
- Multi-layer content matching reduces LLM calls by 60-80%
- Keyword pre-filtering eliminates irrelevant content
- Lightweight scoring for initial filtering
- Detailed analysis only for high-scoring content
- Caching of embeddings and analysis results

### Database Optimization
- Efficient content indexing
- Batch operations for bulk content
- Optimized similarity queries
- Connection pooling and query optimization

### Frontend Performance
- Lazy loading of components
- Optimized bundle splitting
- Efficient state management
- Responsive design with Tailwind CSS

## 🔒 Security & Privacy

### Data Protection
- No user tracking or telemetry
- Local data storage option
- API keys never logged or stored in database
- User data not shared with LLM providers beyond request context

### Authentication
- GitHub/Google OAuth support
- Two-factor authentication
- JWT-based session management
- Role-based access control (prepared for future)

### Privacy Features
- Self-hosting capability
- Local LLM support for sensitive data
- Encrypted data transmission
- GDPR compliance ready

## 🚧 Current Development Status

### Working Features ✅
- Job application CRUD operations
- Multi-provider LLM integration
- Content library management
- Template system (13+ templates)
- Smart resume generation
- RAG-based content matching
- Embedding similarity search
- Tagging system
- Two-step job application creation flow

### In Development 🔄
- Advanced content matching algorithms
- Interview question generation
- Application status automation
- Enhanced analytics and reporting
- User-specific LLM settings
- Content version control

### Planned Features 📋
- Collaborative resume editing
- Advanced analytics dashboard
- Integration with job boards
- Automated follow-up reminders
- Resume ATS scoring
- Career path planning

## 📚 Documentation References

### Core Documentation
- `README.md` - Project overview and setup
- `REACTIVE_RESUME_TRACKER_DOCS.md` - Enhanced features documentation
- `LLM_SETUP.md` - LLM integration guide
- `RESUME_SECTIONS_DATA_STRUCTURE_REFERENCE.md` - Data structure reference
- `TEMPLATE_CREATION_GUIDE.md` - Template development guide

### Technical Documentation
- `docs/RAG_SYSTEM_DOCUMENTATION.md` - RAG system details
- `docs/RAG_SYSTEM_SUMMARY.md` - RAG system overview
- API documentation available at `/api/docs` when server is running

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Use Zod schemas for validation
- Implement proper error handling
- Add comprehensive tests
- Follow Nx monorepo patterns
- Use conventional commits

### Code Quality
- ESLint configuration for code quality
- Prettier for code formatting
- Husky for pre-commit hooks
- Comprehensive test coverage
- TypeScript strict mode enabled

---

**Built on top of [Reactive Resume](https://docs.rxresu.me/) - An open-source resume builder with modern features**

*This documentation provides a comprehensive overview of the ReactiveResumeTracker project for Claude AI to understand the codebase structure, features, and development patterns.* 