# ReactiveResumeTracker Documentation

## Overview

ReactiveResumeTracker is an enhanced fork of the open-source [Reactive Resume](https://docs.rxresu.me/engineering/tech-stack) project with advanced LLM-powered job application tracking and smart resume generation capabilities.

## Project Structure

Based on the original Reactive Resume architecture with significant enhancements:

### Original Reactive Resume Tech Stack
- **Frontend**: React + Vite
- **Backend**: NestJS  
- **Database**: PostgreSQL + Prisma ORM
- **PDF Generation**: Browserless (Headless Chrome)
- **Storage**: MinIO (S3-compatible)
- **Templates**: React-based resume templates

### ReactiveResumeTracker Enhancements

## 🚀 New Features Added

### 1. **Job Application Tracking System**
**Location**: `apps/server/src/job-application/` & `apps/client/src/pages/dashboard/job-applications/`

**Features**:
- Track job applications with detailed metadata
- Link job applications to specific resumes
- Application status management
- Notes and follow-up tracking

**Key Files**:
- `job-application.controller.ts` - REST API endpoints
- `job-application.service.ts` - Business logic
- `job-application.module.ts` - Module configuration
- Frontend pages for job application management

### 2. **LLM Integration System** 
**Location**: `apps/server/src/llm/`

**Features**:
- Multi-provider LLM support (Anthropic Claude, OpenAI, Local models)
- Job posting analysis from URLs
- Smart content extraction and matching
- Resume content generation

**Key Files**:
- `llm.controller.ts` - LLM API endpoints  
- `llm.service.ts` - LLM provider abstraction
- `providers/` - Individual LLM provider implementations

### 3. **Smart Content Library**
**Location**: `apps/server/src/content-library/` & `apps/client/src/pages/dashboard/content-library/`

**Features**:
- Reusable resume content blocks
- Categorized content (experiences, skills, projects)
- AI-powered content suggestions
- Content matching for job applications

### 4. **Tagging System**
**Location**: `apps/server/src/tag/`

**Features**:
- Tag content and job applications
- Smart categorization
- Filter and search by tags

## 📁 Directory Structure

```
ReactiveResumeTracker/
├── apps/
│   ├── client/                    # React frontend
│   │   ├── src/
│   │   │   ├── pages/dashboard/
│   │   │   │   ├── job-applications/     # NEW: Job tracking UI
│   │   │   │   ├── content-library/      # NEW: Content management UI
│   │   │   │   └── resumes/              # Original: Resume management
│   │   │   ├── services/                 # API service layer
│   │   │   └── components/               # Reusable components
│   │   └── public/
│   │       └── templates/                # Template assets (JPG, PDF, JSON)
│   ├── server/                    # NestJS backend  
│   │   ├── src/
│   │   │   ├── job-application/          # NEW: Job tracking API
│   │   │   ├── llm/                      # NEW: LLM integration
│   │   │   ├── content-library/          # NEW: Content management API
│   │   │   ├── tag/                      # NEW: Tagging system
│   │   │   ├── resume/                   # Original: Resume API (enhanced)
│   │   │   └── auth/                     # Authentication (disabled for development)
│   └── artboard/                  # PDF generation service
│       └── src/templates/                # Resume template React components
├── libs/                          # Shared libraries
│   ├── dto/                              # Data transfer objects
│   ├── schema/                           # Zod schemas
│   └── utils/                            # Utility functions
└── tools/                         # Development tools
    └── db-scripts/                       # Database utilities
```

## 🎯 Key Enhancements Over Original

### Job Application Workflow
1. **URL Analysis**: Paste job posting URL → AI extracts requirements
2. **Content Matching**: System matches your content library to job requirements  
3. **Smart Resume Generation**: Creates tailored resume for specific job
4. **Application Tracking**: Track status, notes, follow-ups

### LLM-Powered Features
- **Job Analysis**: Extract skills, requirements, company info from job postings
- **Content Generation**: AI helps write job-specific resume content
- **Smart Matching**: Algorithm matches your experience to job requirements
- **Interview Prep**: Generate potential interview questions

### Content Management
- **Reusable Blocks**: Save experience descriptions, skill sets, project details
- **Version Control**: Track content changes over time
- **Smart Search**: Find relevant content for specific jobs
- **AI Enhancement**: Improve existing content with AI suggestions

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- pnpm package manager
- PostgreSQL database

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
OPENAI_API_KEY=your_openai_key

# Database
DATABASE_URL="file:./dev.db"  # SQLite for development

# Development Mode (Auth disabled)
DISABLE_EMAIL_AUTH=true
```

## 🎨 Template System

Templates are React components in `apps/artboard/src/templates/`:
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

## 🔧 API Endpoints

### New Job Application Endpoints
```
POST   /job-application                    # Create job application
GET    /job-application                    # List applications  
GET    /job-application/:id               # Get application details
PATCH  /job-application/:id               # Update application
DELETE /job-application/:id               # Delete application
POST   /job-application/analyze           # Analyze job posting URL
POST   /job-application/create-from-analysis # Create from analysis
POST   /job-application/generate-resume   # Generate tailored resume
```

### LLM Endpoints
```
POST   /llm/analyze                       # Analyze job posting text
POST   /llm/generate-content              # Generate resume content
POST   /llm/enhance-content               # Enhance existing content
```

### Content Library Endpoints  
```
POST   /content-library                   # Save content block
GET    /content-library                   # List content blocks
GET    /content-library/search            # Search content
```

## 🚧 Current Development Status

### Working Features ✅
- Job application CRUD operations
- LLM integration for job analysis
- Content library management
- Template system (original + enhancements)
- Smart resume generation
- Two-step job application creation flow

### In Development 🔄
- Advanced content matching algorithms
- Interview question generation
- Application status automation
- Enhanced analytics and reporting

### Authentication Status ⚠️
**Currently Disabled for Development**
- All API endpoints use `MOCK_USER_ID`
- TODO comments added for re-enabling auth
- Guards and decorators preserved for future activation

## 📈 Usage Metrics & Analytics

The system tracks:
- Resume views and downloads
- Job application success rates  
- Content library usage patterns
- Template popularity
- LLM API usage and costs

---

*Built on top of [Reactive Resume](https://docs.rxresu.me/) - An open-source resume builder with modern features* 