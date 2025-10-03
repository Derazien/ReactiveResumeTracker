# ReactiveResumeTracker - Project Context

## 🎯 Project Overview

ReactiveResumeTracker is an AI-powered resume builder with content library management and intelligent job matching capabilities. Built as an Nx monorepo with React frontend and NestJS backend.

## 📁 Architecture Overview

```
ReactiveResumeTracker/
├── apps/
│   ├── client/          # React frontend (Vite + Zustand)
│   ├── server/          # NestJS backend (Prisma + LLM)
│   └── artboard/        # Resume template renderer (iframe)
├── libs/
│   ├── schema/          # Resume data schemas
│   ├── ui/              # Shared UI components
│   ├── utils/           # Utility functions
│   ├── dto/             # Data transfer objects
│   ├── parser/          # Resume parsing logic
│   └── hooks/           # Shared React hooks
└── docs/                # Project documentation
```

## 🔧 Core Services Architecture

### 1. Content Matching Service (`apps/server/src/content-matching/`)
**Purpose**: Matches user content to job requirements
**Key Methods**:
- `calculateExperienceScore()` - Scores experience items with current job priority
- `selectStructuredContent()` - Selects content for different resume sections
- `selectExperienceContentWithCurrentJobPriority()` - Ensures current jobs are included

**Content ID Tracking**:
- `contentId`: Direct reference to content library (unmodified)
- `sourceContentId`: Original content reference (modified from library)
- `null/null`: Manually created content

### 1.1. Automation Integration Service (`apps/server/src/automation-integration.controller.ts`)
**Purpose**: Integrates Skyvern AI automation engine for job application automation
**Key Methods**:
- `getAutomationStatus()` - Checks Skyvern engine health and availability
- `executeLinkedInWorkflow()` - Initiates LinkedIn job search automation
- `handleLinkedInJobSearchCallback()` - Processes job data from automation webhooks
- `handleCompanyResearchCallback()` - Processes company data from automation webhooks

**Integration Features**:
- LinkedIn job search automation with filters (remote, location, time period)
- Company research and contact extraction
- Webhook-based data flow to existing ReactiveResumeTracker APIs
- Real-time status monitoring and progress tracking

### 2. Job Application Service (`apps/server/src/job-application/`)
**Purpose**: Manages job applications and resume generation
**Key Methods**:
- `generateTailoredResume()` - Creates tailored resumes from selected content
- `buildResumeFromContent()` - Builds resume data from content library items
- `handleContentModification()` - Tracks content modifications

### 3. LLM Service (`apps/server/src/llm/`)
**Purpose**: AI-powered content processing and tailoring
**Key Methods**:
- `tailorSection()` - Tailors resume sections using LLM
- `editResume()` - AI-powered resume editing
- `extractCompanyThemes()` - ✨ NEW: Extracts themes from job descriptions
- `selectBestCoverLetterParagraphs()` - ✨ NEW: Smart content selection for cover letters
- `generateTailoredCoverLetterFromTemplate()` - ✨ NEW: Token-based cover letter generation
- `extractCV()` - Extracts content from uploaded CVs

### 4. Content Library Service (`apps/server/src/content-library/`)
**Purpose**: Manages user's professional content repository
**Key Methods**:
- `saveExtractedContent()` - Saves extracted content to library
- `getUserContent()` - Retrieves user's content library

### 5. ✨ Cover Letter Content Service (`apps/server/src/cover-letter-content/`)
**Purpose**: Manages cover letter stories and paragraph blocks
**Key Methods**:
- `create()` - Creates new cover letter story with embedding
- `findByType()` - Retrieves content by paragraph type
- `selectBestStoriesForJob()` - Selects best stories for job application
- `findSimilarStories()` - Semantic search for similar stories

## 📊 Database Schema

### Core Tables
```sql
-- Content Library
Content {
  id, title, description, data, sectionId, userId
  sourceContentId, // For variants
  tags[], // For matching
}

-- Cover Letter Content
CoverLetterContent {
  id, contentType, contentId, storyText, skillTheme
  tone, tags, embedding, embeddingHash, userId
}

-- Job Applications
JobApplication {
  id, title, company, description, requirements
  extractedTags, embedding, status
}

-- Resume Items (in resume.data JSON)
{
  id, visible, contentId, sourceContentId
  // + section-specific fields
}
```

## 🎨 Frontend Architecture

### State Management (Zustand)
- `useResumeStore` - Resume data and editing state
- `useJobApplicationStore` - Job application management
- `useContentLibraryStore` - Content library state
- `useCoverLetterBuilderStore` - ✨ NEW: Cover letter builder state and panels

### Key Components
- `Builder` - Main resume editing interface
- `Toolbar` - AI editing and content controls
- `Artboard` - Template rendering (iframe)
- `ContentSelectionPanel` - Content selection interface

### Inter-frame Communication
```typescript
// Client to Artboard
window.postMessage({ type: "SET_RESUME", payload: resumeData }, "*");

// Artboard to Client
window.parent.postMessage({ type: "RESUME_UPDATED", payload: data }, "*");
```

## 🔄 Content Flow

### 1. Content Creation
```
CV Upload → LLM Extraction → Content Library → Tagged & Categorized
```

### 2. Job Application
```
Job Description → Content Matching → Score & Rank → User Selection
```

### 3. Resume Generation
```
Selected Content → Resume Builder → LLM Tailoring → Final Resume
```

### 4. ✨ Cover Letter Generation
```
Job Description → Company Theme Analysis → Content Selection → Token Template → Final Cover Letter
```

### 5. Content Tracking
```
Library Item → Resume Item (contentId) → Modified (sourceContentId) → New Library Item
```

## 🎯 Current Implementation Status

### ✅ Completed
- Content library with extraction and tagging
- Experience matching with current job priority
- Content ID tracking system
- LLM-powered resume editing
- **Content Selection Integration** - Direct content selection in resume editor
- **Form Field Editing Fix** - Proper form synchronization for section dialogs

### 🔄 In Progress
- Resume tailoring enhancements
- Real-time content relationship indicators
- Job application content selection integration

### 📋 Planned
- Interactive content selection with scores (job applications)
- Custom instructions system
- Asynchronous tailoring with streaming
- Mobile-responsive content management

## 🚨 Critical Implementation Rules

### 1. Service Architecture
- **NEVER** create duplicate services - extend existing ones
- **ALWAYS** check `ContentMatchingService` before creating content logic
- **USE** dependency injection and proper NestJS patterns

### 2. Content Management
- **ALWAYS** maintain `contentId`/`sourceContentId` tracking
- **PRIORITIZE** current job positions in experience matching
- **TRACK** all content modifications and relationships

### 3. Frontend Patterns
- **USE** existing UI components from `@reactive-resume/ui`
- **FOLLOW** Zustand state management patterns
- **MAINTAIN** mobile responsiveness
- **USE** Framer Motion for animations

### 4. Data Flow
- **VALIDATE** all data transformations
- **HANDLE** errors gracefully with user feedback
- **MAINTAIN** data consistency across services

## 📖 Key Documentation Files

### Core Documentation
1. **`docs/COMPREHENSIVE_PROJECT_DOCUMENTATION.md`** - Complete project overview and architecture
2. **`docs/PROJECT_CONTEXT.md`** - Current implementation status and key patterns
3. **`docs/LLM_SETUP.md`** - LLM configuration and setup guide

### Feature Documentation
4. **`docs/FUTURE_RESUME_TAILORING_ENHANCEMENTS.md`** - Future roadmap and features
5. **`docs/EXPERIENCE_MATCHING_IMPROVEMENTS.md`** - Current job priority implementation
6. **`docs/RAG_SYSTEM_DOCUMENTATION.md`** - Content matching and retrieval system
7. **`docs/RAG_SYSTEM_SUMMARY.md`** - RAG system overview
8. **`docs/FORM_FIELD_EDITING_FIX.md`** - Form synchronization solution

### Technical Reference
9. **`docs/RESUME_SECTIONS_DATA_STRUCTURE_REFERENCE.md`** - Resume data structure reference
10. **`docs/TEMPLATE_CREATION_GUIDE.md`** - Template creation guidelines
11. **`docs/REACTIVE_RESUME_TRACKER_DOCS.md`** - Additional technical documentation

## 🔍 Before Implementation Checklist

1. **SEARCH** for existing similar functionality
2. **READ** relevant service files and documentation
3. **PLAN** integration with existing systems
4. **CONSIDER** impact on content tracking
5. **VERIFY** TypeScript types and interfaces
6. **TEST** mobile responsiveness
7. **UPDATE** documentation for new features

## 🛠 Development Workflow

1. **Understand Requirements** - Read documentation and existing code
2. **Check Existing Services** - Look for similar functionality
3. **Plan Integration** - How does this fit with current architecture?
4. **Implement** - Follow established patterns
5. **Test** - Verify functionality and performance
6. **Document** - Update relevant documentation

## 📞 Key Files to Review

### Backend Services
- `apps/server/src/content-matching/content-matching.service.ts`
- `apps/server/src/job-application/job-application.service.ts`
- `apps/server/src/llm/llm.service.ts`
- `apps/server/src/content-library/content-library.service.ts`

### Frontend Components
- `apps/client/src/pages/builder/page.tsx`
- `apps/client/src/pages/builder/_components/toolbar.tsx`
- `apps/client/src/stores/resume.ts`
- `apps/artboard/src/pages/builder.tsx`

### Schema & Types
- `libs/schema/src/sections/`
- `libs/dto/src/`
- `apps/server/prisma/schema.prisma` 