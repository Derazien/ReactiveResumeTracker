# Project Overview

**Last generated:** 2025-10-02

---

## Project Summary

**ReactiveResumeTracker** is an enhanced fork of the open-source [Reactive Resume](https://rxresu.me/) project, transforming it into a comprehensive AI-powered career management platform. Built as an **Nx monorepo** (v19.8.4), it extends the original resume builder with intelligent job application tracking, multi-provider LLM integration, smart content library management, RAG-based content matching, and automated cover letter generation. The platform enables users to create tailored resumes for specific job applications using AI-powered content suggestions and semantic matching, while maintaining a reusable content library that tracks modifications and relationships.

The primary goal is to streamline the job application process by combining resume building, job tracking, and intelligent content management in a single platform. Users can extract professional content from existing CVs, match it to job requirements using multi-layer AI analysis, generate tailored resumes and cover letters, and track applications through the entire hiring pipeline—all while maintaining privacy through optional self-hosting and local LLM support.

---

## Workspace Layout (Nx)

### Applications (`apps/`)

| App | Type | Purpose | Tech Stack |
|-----|------|---------|------------|
| **client** | React SPA | Main frontend UI with resume builder, job tracking, content library, and cover letter generator | Vite, React 18, Zustand, TanStack Query, Radix UI, Tailwind CSS |
| **server** | NestJS API | Backend API with LLM integration, content matching, job management, embeddings | NestJS, Prisma, PostgreSQL/SQLite, Multiple LLM providers |
| **artboard** | React Microfrontend | Resume template renderer in iframe for PDF generation and preview | React, iframe-based, template components |

### Libraries (`libs/`)

| Library | Purpose | Key Exports |
|---------|---------|-------------|
| **schema** | Zod schemas for resume data validation | Resume schema, section schemas, validation utilities |
| **dto** | Data Transfer Objects for API contracts | Request/response DTOs, type definitions |
| **ui** | Shared UI components (Radix UI based) | Form components, dialogs, section forms, buttons |
| **utils** | Utility functions and helpers | Date formatting, string manipulation, validators |
| **hooks** | Shared React hooks | Custom hooks for common patterns |
| **parser** | Resume parsing utilities | PDF/DOCX parsing, content extraction |

### External Services

| Service | Purpose | Location |
|---------|---------|----------|
| **Skyvern** | Web automation for LinkedIn job scraping | `services/skyvern/` (submodule) |

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript, Vite bundler
- **State Management**: Zustand (global state), TanStack Query (server state)
- **UI Components**: Radix UI, Tailwind CSS, Framer Motion (animations)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v7
- **i18n**: LinguiJS with Crowdin integration

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL (production), SQLite (development)
- **ORM**: Prisma v6
- **Authentication**: Passport.js (email, GitHub, Google OAuth, OpenID Connect, 2FA)
- **Session**: Redis cache
- **Storage**: MinIO (S3-compatible object storage)
- **PDF Generation**: Browserless (Headless Chrome)

### AI & LLM
- **Primary LLM**: Anthropic Claude 3.5 Sonnet (recommended)
- **Alternative LLMs**: OpenAI GPT-4, Google Gemini, Ollama (local models)
- **Embeddings**: Cohere API (embed-english-v3.0)
- **Vector Search**: Semantic similarity with cosine distance

### Infrastructure
- **Build System**: Nx 19.8.4 monorepo
- **Package Manager**: pnpm
- **Testing**: Vitest (unit), Jest (backend)
- **Linting**: ESLint with TypeScript
- **Formatting**: Prettier

---

## Core Features & Modules

### 1. Resume Builder (Original + Enhanced)
**Path**: `apps/client/src/pages/builder/`, `apps/server/src/resume/`
- Real-time WYSIWYG resume editing with live preview
- 12+ professional templates (Azurill, Bronzor, Chikorita, etc.)
- Drag-and-drop section reordering and customization
- Multi-page resume support (A4/Letter formats)
- Custom sections and fields
- PDF export with browserless Chrome
- Public resume sharing with view/download tracking
- Version locking for master templates

### 2. Job Application Tracking System (Enhanced)
**Path**: `apps/server/src/job-application/`, `apps/client/src/pages/dashboard/job-applications/`
- Track applications with metadata (company, position, status, salary, location)
- Link applications to specific tailored resumes
- Status workflow (Draft → Applied → Interview → Offer/Rejected → Accepted/Withdrawn)
- Notes, follow-ups, and timeline tracking
- Job description analysis and requirement extraction
- URL-based job posting scraping and parsing
- Two-step application creation with AI-powered analysis

### 3. Smart Content Library
**Path**: `apps/server/src/content-library/`, `apps/client/src/pages/dashboard/content-library/`
- Reusable professional content blocks (experience, education, skills, projects, etc.)
- CV upload and AI-powered content extraction
- Content categorization with smart tagging
- Content ID tracking (`contentId`, `sourceContentId`) for modification lineage
- Version control and relationship tracking
- Bulk content operations

### 4. RAG (Retrieval-Augmented Generation) System
**Path**: `apps/server/src/embedding/`, `apps/server/src/content-matching/`
- Multi-layer content matching optimization:
  - **Layer 1**: Keyword pre-filtering (60-80% reduction)
  - **Layer 2**: Lightweight LLM scoring (minimal tokens)
  - **Layer 3**: Detailed LLM analysis (high-scoring content only)
- Vector embeddings with Cohere API
- Semantic similarity search with cosine distance
- Current job priority weighting (recency bonus)
- Company and role context analysis
- Technology domain matching

### 5. Cover Letter Generation System
**Path**: `apps/server/src/cover-letter-content/`, `apps/client/src/pages/cover-letter-builder/`
- Token-based master templates with replaceable sections
- Company theme extraction (analytics, leadership, tech, collaboration, etc.)
- Smart paragraph selection using semantic similarity
- Content scoring (0-100) for company value alignment
- Lexical tuning to echo company language
- Mass-production workflow for multiple applications
- Story-based content library with paragraph types

### 6. Multi-Provider LLM Integration
**Path**: `apps/server/src/llm/`
- Unified LLM interface with provider abstraction
- Supported providers: Anthropic Claude, OpenAI GPT, Google Gemini, Ollama (local)
- Job description analysis and requirement extraction
- Resume section tailoring and content enhancement
- Interview question generation
- Content similarity detection
- Streaming responses for real-time updates

### 7. Tagging System
**Path**: `apps/server/src/tag/`
- Tag content library items and job applications
- Auto-tagging with LLM assistance
- Filter and search by tags
- Tag-based content organization

### 8. Automation Integration (Skyvern)
**Path**: `apps/server/src/automation-integration.controller.ts`
- LinkedIn job search automation with filters
- Company research and contact extraction
- Webhook-based data flow
- Real-time status monitoring

---

## Run Workflows (One-Command)

### Local (no Docker) — Development

```bash
# Prerequisites: Node.js 22+, pnpm installed
pnpm install
pnpm prisma:migrate:dev
pnpm dev
```

**Access**:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

### Local (Docker full stack) — All Services

```bash
docker compose -f unified-docker-compose.yml up -d
```

**Services started**:
- PostgreSQL (ReactiveResume + Skyvern)
- Redis cache
- MinIO object storage
- Browserless Chrome
- Skyvern API + UI
- Ollama LLM service

**Access**:
- ReactiveResume: `http://localhost:5173` (start with `pnpm dev`)
- Skyvern UI: `http://localhost:8081`
- Ollama: `http://localhost:11434`

### Production/Server — Self-Hosted Infrastructure

```bash
docker compose -f self-hosted-infrastructure.yml up -d
```

**Includes**:
- All development services
- n8n workflow automation
- Prometheus + Grafana monitoring
- Traefik reverse proxy
- Automated backup service

### Testing

```bash
pnpm test              # Run all tests (Vitest + Jest)
pnpm lint              # Lint all projects
pnpm format            # Format code
```

---

## Services & Ports

**For detailed service configurations and health checks**, see:
- **📋 [Docker-Services.md](../50-ops/Docker-Services.md)** — Complete service catalog
- **🏥 [Service-Health.md](../50-ops/Service-Health.md)** — Health check commands and CI integration

| Service | Port(s) | Purpose | Health Check |
|---------|---------|---------|--------------|
| **client** (dev) | 5173 | React frontend | `http://localhost:5173` |
| **server** (dev) | 3000 | NestJS API | `http://localhost:3000/api/health` |
| **postgres-main** | 5432 | ReactiveResume database | `pg_isready` |
| **redis** | 6379 | Cache & sessions | `redis-cli ping` |
| **minio** | 9000, 9001 | Object storage (S3) | `http://localhost:9000/minio/health/live` |
| **chrome** | 3001 | PDF generation | `http://localhost:3001/json/version` |
| **skyvern-postgres** | 5433 | Skyvern database | `pg_isready` |
| **skyvern-redis** | 6380 | Skyvern cache | `redis-cli ping` |
| **skyvern** | 8000 | Skyvern automation API | `http://localhost:8000` |
| **skyvern-ui** | 8081 | Skyvern web UI | `http://localhost:8081` |
| **ollama** | 11434 | Local LLM service | `http://localhost:11434/api/version` |
| **n8n** (prod) | 5678 | Workflow automation | `http://localhost:5678` |
| **prometheus** (prod) | 9090 | Metrics collection | `http://localhost:9090` |
| **grafana** (prod) | 3001 | Metrics visualization | `http://localhost:3001` |
| **traefik** (prod) | 80, 443, 8080 | Reverse proxy | `http://localhost:8080` |

---

## APIs & Contracts

### OpenAPI Specification
**Location**: `docs/20-backend/openapi.json` (placeholder)

**To generate full spec**:
```bash
# Start server in one terminal
pnpm dev

# In another terminal, export live spec
curl http://localhost:3000/docs-json > docs/20-backend/openapi.json

# OR visit Swagger UI
open http://localhost:3000/docs
```

**Script**: `pnpm docs:openapi` (generates placeholder)

### API Endpoints (Selection)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check (database, storage, browser) |
| `/api/resume` | POST | Create resume |
| `/api/resume/:id` | GET, PATCH, DELETE | Manage resume |
| `/api/job-application` | POST | Create job application |
| `/api/job-application/:id/tailor` | POST | Generate tailored resume |
| `/api/content-library` | GET, POST | Manage content library |
| `/api/content-matching/match` | POST | Match content to job |
| `/api/llm/analyze-job` | POST | Analyze job description |
| `/api/llm/tailor-section` | POST | Tailor resume section |
| `/api/cover-letter/generate` | POST | Generate cover letter |
| `/api/cover-letter-content` | POST | Save cover letter story |
| `/api/automation/linkedin/search` | POST | LinkedIn job automation |
| `/api/auth/login` | POST | User authentication |

### Type Definitions
**Location**: `libs/dto/src/`, `libs/schema/src/`

### API Client (Frontend)
**Location**: `apps/client/src/services/`
- Axios-based HTTP client with auth interceptors
- TanStack Query for caching and state management

---

## Data & Storage

### Databases

| Database | Type | Purpose | Connection |
|----------|------|---------|------------|
| **reactive_resume** | PostgreSQL 16 | Primary application data | `DATABASE_URL` env var |
| **skyvern** | PostgreSQL 15 | Skyvern automation data | Separate connection string |
| **n8n** (prod) | PostgreSQL 15 | Workflow automation | Separate connection string |

**Development**: SQLite for faster local iteration (switch via `DATABASE_URL`)

### Prisma Schema
**Location**: `apps/server/prisma/schema.prisma`

**Key Models**:
- `User` — User accounts with provider (email, GitHub, Google, OpenID)
- `Resume` — Resume documents with JSON data payload
- `JobApplication` — Job applications with status and metadata
- `Content` — Content library items with section type
- `CoverLetterContent` — Cover letter story paragraphs with embeddings
- `Tag` — Tags for content and applications
- `UserLLMSettings` — Per-user LLM provider configuration
- `StoryBlock`, `AnswerSnippet` — Interview preparation content
- `Contact` — Company contacts from automation

### Object Storage (MinIO)
**Location**: Port 9000 (API), 9001 (Console)
- Avatar images
- Resume PDFs and previews
- Uploaded CV files
- Template assets

**Buckets**: Configured via environment variables

### Cache (Redis)
**Location**: Port 6379
- Session storage
- Rate limiting
- Temporary data caching

### Volumes (Docker)
- `postgres_main_data` — ReactiveResume database
- `redis_data` — Redis persistence
- `minio_data` — Object storage files
- `skyvern_postgres_data` — Skyvern database
- `skyvern_data` — Skyvern application data
- `ollama_data` — Ollama models

---

## Environments & Secrets

### Environment Files
**Primary**: `.env` (root, copy from `.env.example`)
**Pattern**: Load from root; services read via Docker Compose or process.env

### Key Environment Variables

#### Database
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
```

#### Authentication
```bash
JWT_SECRET=<secret>
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
GITHUB_CLIENT_ID=<id>
GITHUB_CLIENT_SECRET=<secret>
```

#### Storage
```bash
STORAGE_ENDPOINT=localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin123
STORAGE_BUCKET=reactive-resume
```

#### LLM Providers
```bash
ANTHROPIC_API_KEY=<key>
OPENAI_API_KEY=<key>
COHERE_API_KEY=<key>  # For embeddings
OLLAMA_URL=http://localhost:11434
```

#### Browser
```bash
CHROME_URL=http://localhost:3001
CHROME_TOKEN=chrome-token-12345
```

#### Skyvern
```bash
SKYVERN_API_KEY=<key>
ANTHROPIC_API_KEY=<key>  # Skyvern uses Claude
```

### Loading Secrets
1. Copy `.env.example` → `.env`
2. Fill in required secrets (LLM keys, database credentials)
3. Docker Compose reads `.env` automatically
4. NestJS loads via `@nestjs/config`

---

## Implementation Rules

### Service Architecture
- **DO NOT** create duplicate services; extend existing ones (`ContentMatchingService`, `JobApplicationService`, `LLMService`)
- **ALWAYS** use dependency injection (NestJS patterns)
- **CHECK** existing services first before adding new functionality
- **USE** provider pattern for LLM integrations

### Content Management
- **ALWAYS** maintain `contentId`/`sourceContentId` tracking for modification lineage
- **PRIORITIZE** current job positions in experience matching (recency bonus)
- **TRACK** all content modifications and relationships
- **NEVER** lose content lineage data

### Frontend Patterns
- **USE** existing UI components from `@reactive-resume/ui` (Radix-based)
- **FOLLOW** Zustand state management patterns (no Redux)
- **MAINTAIN** mobile responsiveness (Tailwind breakpoints)
- **USE** Framer Motion for animations
- **IMPLEMENT** proper loading and error states with TanStack Query

### Database & Prisma
- **FOLLOW** existing Prisma schema patterns
- **USE** SQLite-compatible syntax for development
- **MAINTAIN** proper relationships and constraints
- **RUN** `pnpm prisma:migrate:dev` after schema changes
- **GENERATE** client with `pnpm prisma:generate`

### Inter-frame Communication (Artboard)
- **USE** `window.postMessage` for client ↔ artboard communication
- **VALIDATE** message origins
- **TYPE** message payloads with TypeScript interfaces

### Error Handling
- **CATCH** all async errors with try/catch
- **LOG** errors with context (NestJS Logger)
- **RETURN** user-friendly error messages
- **USE** HTTP exception filters in NestJS

### Performance
- **OPTIMIZE** for large content libraries (pagination, lazy loading)
- **CACHE** LLM responses when appropriate
- **DEBOUNCE** user input in forms
- **USE** TanStack Query for efficient server state management

### Testing
- **MAINTAIN** test coverage for critical paths
- **MOCK** external services (LLMs, embeddings) in tests
- **USE** Vitest for frontend, Jest for backend

---

## Contribution Workflow

### Before Implementing
1. **READ** existing documentation:
   - `/docs/COMPREHENSIVE_PROJECT_DOCUMENTATION.md`
   - `/docs/PROJECT_CONTEXT.md`
   - `/docs/FUTURE_RESUME_TAILORING_ENHANCEMENTS.md`
   - This overview and `/docs/50-ops/Run-Paths-Catalog.md`
2. **SEARCH** for existing similar functionality
3. **REVIEW** relevant service files before creating new ones
4. **PLAN** integration with existing systems

### Development Process
1. **Fork and clone** repository
2. **Install dependencies**: `pnpm install`
3. **Copy environment**: `cp .env.example .env` and fill in secrets
4. **Start services**: `docker compose -f unified-docker-compose.yml up -d`
5. **Run migrations**: `pnpm prisma:migrate:dev`
6. **Start dev servers**: `pnpm dev`
7. **Implement changes** following patterns above
8. **Test locally** before committing

### Documentation Requirements
- **NEW FEATURES**: Create comprehensive documentation in `docs/`
- **ARCHITECTURE CHANGES**: Update this overview and architectural docs
- **API CHANGES**: Update endpoint documentation; regenerate OpenAPI
- **USER FLOW CHANGES**: Document in user guides

### Code Quality Checklist
- [ ] TypeScript strict typing with no `any`
- [ ] ESLint passes (`pnpm lint`)
- [ ] Prettier formatted (`pnpm format`)
- [ ] Tests pass (`pnpm test`)
- [ ] Mobile responsive (if frontend)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Documentation updated

### Commit Convention
Use **Conventional Commits**:
```bash
git commit -m "feat(job-application): add bulk status update"
git commit -m "fix(resume): resolve PDF generation timeout"
git commit -m "docs(api): update endpoint documentation"
```

### Pull Request Process
1. **Create issue** first (or reference existing one)
2. **Branch** from main: `feature/your-feature` or `fix/your-fix`
3. **Commit** with conventional commit messages
4. **Test** thoroughly
5. **Open PR** with:
   - Clear description
   - Screenshots (if UI changes)
   - Related issue number
   - Documentation updates

### Docs-First Principle (Phase C+)
Once Phase C is complete:
1. **Before code changes**: Update relevant docs
2. **After implementation**: Run `pnpm docs:all` to regenerate
3. **Verify**: Modules.md, OpenAPI, TypeDoc are updated
4. **Commit**: Include docs changes in same PR

---

## LLM Answering Pointers

### Where to Look First (Golden Order of Truth)

1. **Architecture & Maps** (highest authority)
   - `/docs/10-architecture/*` (future: C4 diagrams, module maps)
   - `/docs/maps/*` (future: dependency graphs)
   - This file (`/docs/00-foundation/Project-Overview.md`)

2. **API Contracts**
   - `/docs/20-backend/openapi.json` (future: Phase C)
   - API endpoints in this overview

3. **Code Documentation**
   - `/docs/api/*` (future: TypeDoc output)
   - Inline TSDoc comments in source files

4. **Operational Docs**
   - `/docs/50-ops/Run-Paths-Catalog.md`
   - `/docs/50-ops/Docker-Services.md` (future: Phase C)

5. **Source Code** (last resort)
   - Implementation files in `apps/` and `libs/`

### Key Documentation Files

| Topic | File | Description |
|-------|------|-------------|
| **Overview** | `/docs/COMPREHENSIVE_PROJECT_DOCUMENTATION.md` | Complete feature overview |
| **Context** | `/docs/PROJECT_CONTEXT.md` | Current implementation status |
| **Services** | `/docs/final/services/*` | Service architecture details |
| **Cover Letters** | `/docs/COVER_LETTER_SYSTEM_IMPLEMENTATION_COMPLETE.md` | Cover letter generation |
| **Content Matching** | `/docs/EXPERIENCE_MATCHING_IMPROVEMENTS.md` | Current job priority logic |
| **RAG System** | `/docs/RAG_SYSTEM_DOCUMENTATION.md` | Content retrieval system |
| **LLM Setup** | `/docs/LLM_SETUP.md` | LLM provider configuration |
| **Automation** | `/docs/automation/*` | Skyvern integration guides |
| **Run Paths** | `/docs/50-ops/Run-Paths-Catalog.md` | All executable paths |

### Non-Authoritative (Use as Reference Only)
- `/_scratch/*` — Experimental scripts and legacy code
- Root-level `.js`/`.ps1` scripts — Many are deprecated shims (see Run Paths Catalog)

### Answering Strategy
1. **Start broad**: Read architectural docs to understand system design
2. **Narrow down**: Use OpenAPI/TypeDoc to find specific endpoints/functions
3. **Verify in code**: Check implementation matches documentation
4. **Multiple searches**: Use different wording if first search misses details
5. **Trace dependencies**: Follow imports to understand relationships

---

## Technical Debt

### Circular Dependencies (ADR-0001)

**Status**: 40 circular dependencies exist in current codebase  
**ADR**: See `docs/00-foundation/ADR-0001-Dependency-Cycles-Baseline.md`

**Breakdown**:
- **libs/ui** (24 cycles) — Barrel export patterns creating circular imports
- **apps/server** (3 cycles) — NestJS module circular dependencies
- **apps/client/auth** (13 cycles) — Auth service circular imports through axios

**CI Enforcement**: 
- ✅ Baseline captured in `docs/maps/depcruise-baseline.json`
- ✅ CI check prevents NEW cycles: `pnpm check:deps`
- ⏳ Existing cycles must be fixed incrementally (see ADR-0001 for strategy)

**Remediation Priority**:
1. libs/ui cycles (highest impact)
2. apps/server cycles (module architecture)
3. apps/client auth cycles (frontend refactor)

**Impact**: 
- Does not cause runtime errors currently
- Prevents optimal tree-shaking
- Makes dependency analysis harder
- TypeDoc generation limited (libs only, apps excluded due to cycles)

### TypeDoc Limitations

**Current State**: Successfully generates docs for libraries only  
**Excluded**: apps/client, apps/server (due to circular dependencies)  
**Output**: `docs/api/` (dto, hooks, parser, schema, utils)

**Future**: Once circular dependencies are resolved, full TypeDoc generation will include all apps

### OpenAPI Generation

**Current State**: Placeholder generated; full spec requires running server  
**Location**: `docs/20-backend/openapi.json`

**To Generate Full Spec**:
1. Start server: `pnpm dev`
2. Export: `curl http://localhost:3000/docs-json > docs/20-backend/openapi.json`
3. Or visit: `http://localhost:3000/docs`

---

## Changelog & ADRs

### Architecture Decision Records (ADRs)
**Location**: `/docs/00-foundation/ADR-*.md`

**Existing ADRs**:
- **ADR-0001**: Dependency Cycles Baseline (2025-10-02) — Documents 40 circular dependencies and remediation strategy

**Format**:
```markdown
# ADR-XXXX: Title

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded

## Context
[Describe the issue requiring a decision]

## Decision
[Describe the decision and rationale]

## Consequences
[Describe the results of the decision]

## Alternatives Considered
[Describe alternatives and why they were rejected]
```

### Creating a New ADR
1. Choose next sequential number
2. Create `/docs/00-foundation/ADR-XXXX-title.md`
3. Fill in template above
4. Reference in relevant documentation
5. Update this overview if architectural impact

### Changelog
**Location**: `/CHANGELOG.md` (root)
**Format**: Keep a Changelog standard (https://keepachangelog.com/)

**Categories**:
- `Added` — New features
- `Changed` — Changes in existing functionality
- `Deprecated` — Soon-to-be-removed features
- `Removed` — Removed features
- `Fixed` — Bug fixes
- `Security` — Security fixes

### Recent Significant Changes
- **Phase A** (2025-10-02): Created Run Paths Catalog with 138 entries
- **Phase B** (2025-10-02): Canon icalized run paths; 6 shims created; zero breaking changes
- Cover Letter Generation System implemented
- Content ID tracking system established
- Current job priority in experience matching
- Multi-provider LLM integration
- RAG system with Cohere embeddings

---

## Next Steps (Planned)

### Phase C: Mapping & Docs Generation
- [ ] Add dep-cruiser for dependency cycle detection
- [ ] Configure TypeDoc for API documentation
- [ ] Implement OpenAPI generation
- [ ] Generate dependency graphs
- [ ] Create/update `Modules.md` with module documentation
- [ ] Create `C4.md` with architectural diagrams

### Phase D: CI & Smoke Tests
- [ ] Add GitHub Actions for docs validation
- [ ] Add smoke tests for canonical run paths
- [ ] Add dependency cycle detection in CI
- [ ] Verify docs/code alignment in PRs

### Phase E: Cleanup (After Grace Period)
- [ ] Move deprecated compose files to `_scratch/compose/`
- [ ] Remove shims after one release cycle
- [ ] Create ADR summarizing canonicalization decisions
- [ ] Archive legacy scripts

### Feature Roadmap
- [ ] Interactive content selection with live scoring (job applications)
- [ ] Custom instructions system for resume tailoring
- [ ] Asynchronous tailoring with streaming updates
- [ ] Real-time content relationship indicators
- [ ] Mobile-responsive content management
- [ ] Interview preparation module expansion
- [ ] Advanced analytics and insights dashboard

---

**End of Project Overview**

For specific implementation details, see the docs referenced above. Always start with architectural docs → API contracts → code documentation → source code when seeking answers.


