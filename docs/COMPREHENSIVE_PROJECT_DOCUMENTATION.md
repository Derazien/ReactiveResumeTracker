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