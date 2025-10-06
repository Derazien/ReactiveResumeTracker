# Module Architecture

**Last Updated**: 2025-01-27  
**Purpose**: Comprehensive catalog of all modules, their purpose, exports, and dependencies

## Dependency Map

Visual dependency graphs are available for the full repository and individual apps/libs.

**📍 [View all graphs →](../maps/README.md)**

**Quick Links:**
- [Full Repository Graph](../maps/deps.dot) — Complete dependency map (1155 modules)
- [Artboard App](../maps/apps-artboard.svg) — Template renderer dependencies
- [Client App](../maps/apps-client.svg) — Frontend UI dependencies  
- [Server App](../maps/apps-server.svg) — Backend API dependencies
- [UI Library](../maps/libs-ui.svg) — Shared component dependencies

**Regenerate:** Run `pnpm docs:maps` (takes ~2-4 minutes)

---

## Applications

### apps/client
**Type**: React SPA  
**Purpose**: Main frontend UI with resume builder, job tracking, content library, cover letter generator

**Key Exports**:
- React components (pages, layouts, dialogs)
- Service layer (API clients)
- Stores (Zustand state management)
- Routing configuration

**📋 [Frontend Components Map →](./Frontend-Components.md)** — Complete catalog of all frontend components with localization status

**Inbound Dependencies**: None (top-level app)

**Outbound Dependencies**:
- `@reactive-resume/dto` — Data transfer objects
- `@reactive-resume/schema` — Validation schemas
- `@reactive-resume/ui` — Shared UI components
- `@reactive-resume/utils` — Utility functions
- `@reactive-resume/hooks` — Custom React hooks

---

### apps/server
**Type**: NestJS API  
**Purpose**: Backend API with LLM integration, content matching, job management, embeddings

**Key Modules** (see Backend Modules section below)

**Inbound Dependencies**: None (top-level app)

**Outbound Dependencies**:
- `@reactive-resume/dto` — Data transfer objects
- `@reactive-resume/schema` — Validation schemas
- `@reactive-resume/utils` — Utility functions
- `@reactive-resume/parser` — Resume parsing

---

### apps/artboard
**Type**: React Microfrontend  
**Purpose**: Resume template renderer in iframe for PDF generation and preview

**Key Exports**:
- Template components (Resume templates: Azurill, Bronzor, Chikorita, etc.)
- PDF rendering logic

**Inbound Dependencies**: Embedded via iframe in apps/client

**Outbound Dependencies**:
- `@reactive-resume/schema` — Resume data schemas
- `@reactive-resume/utils` — Utility functions

---

## Libraries (Shared)

### libs/schema
**Purpose**: Zod schemas for resume data validation and type definitions

**Key Exports**:
- `resumeDataSchema` — Complete resume validation schema
- Section schemas (basics, work, education, skills, etc.)
- `defaultResumeData` — Default resume structure
- Type definitions derived from schemas

**Inbound**: apps/client, apps/server, apps/artboard, libs/dto, libs/parser  
**Outbound**: Zod library only

---

### libs/dto
**Purpose**: Data Transfer Objects for API contracts between client and server

**Key Exports**:
- Resume DTOs (create, update, delete, import)
- Job application DTOs
- Content library DTOs
- User DTOs
- Auth DTOs
- Tag DTOs

**Inbound**: apps/client, apps/server  
**Outbound**: libs/schema, libs/utils

---

### libs/ui
**Purpose**: Shared UI component library (Radix UI based)

**Key Exports**:
- Form components (Input, Select, Checkbox, etc.)
- Dialog components
- Resume section forms (Experience, Education, Skills, etc.)
- Layout components

**Inbound**: apps/client  
**Outbound**: None (⚠️ Has circular dependencies - see ADR-0001)

**Known Issues**:
- 24 circular dependencies through barrel exports
- Remediation in progress (see ADR-0001)

---

### libs/utils
**Purpose**: Utility functions and helpers

**Key Exports**:
- Date formatting (`dayjs` wrapper)
- String manipulation
- Array utilities
- CSV parsing
- URL extraction
- Validators

**Inbound**: apps/client, apps/server, apps/artboard, libs/dto, libs/hooks  
**Outbound**: dayjs, papaparse, sanitize-html

---

### libs/hooks
**Purpose**: Shared React hooks

**Key Exports**:
- `useBreakpoint` — Responsive breakpoint detection
- Custom hooks for common UI patterns

**Inbound**: apps/client  
**Outbound**: libs/utils

---

### libs/parser
**Purpose**: Resume parsing utilities for various formats

**Key Exports**:
- JSON Resume parser
- LinkedIn CSV parser
- Reactive Resume v3 parser
- PDF/DOCX parsing utilities

**Inbound**: apps/server  
**Outbound**: libs/schema, libs/utils

---

## Backend Modules (apps/server/src)

### Core Services

#### auth
**Purpose**: Authentication and authorization

**Exports**:
- `AuthController` — Login, register, OAuth endpoints
- `AuthService` — Authentication logic
- Guards (JWT, Local, GitHub, Google, OpenID, 2FA)
- Strategies (Passport.js implementations)

**Inbound**: user, resume, job-application (via guards)  
**Outbound**: user (⚠️ circular with user module)

**Known Issues**: Circular dependency with `user` module

---

#### user
**Purpose**: User management and profile

**Exports**:
- `UserController` — User CRUD endpoints
- `UserService` — User business logic
- `UserLLMSettingsService` — LLM provider preferences

**Inbound**: auth, resume, job-application, content-library  
**Outbound**: auth (⚠️ circular)

**Known Issues**: Circular dependency with `auth` module

---

#### llm
**Purpose**: Multi-provider LLM integration

**Exports**:
- `LLMController` — LLM API endpoints
- `LLMService` — Provider orchestration
- `LLMOptimizationService` — Token optimization
- `TagExtractionService` — Auto-tagging
- Providers (Anthropic, OpenAI, Google, Ollama)

**Inbound**: job-application, content-matching, content-library, cover-letter  
**Outbound**: content-library, content-matching (⚠️ circular)

**Known Issues**: Circular dependencies with content-library and content-matching

---

#### content-library
**Purpose**: User's professional content repository

**Exports**:
- `ContentLibraryController` — Content CRUD endpoints
- `ContentLibraryService` — Content management logic

**Inbound**: job-application, content-matching, resume  
**Outbound**: llm, content-matching (⚠️ circular)

**Known Issues**: Circular dependencies with llm and content-matching

---

#### content-matching
**Purpose**: Intelligent content matching to job requirements

**Exports**:
- `ContentMatchingService` — Multi-layer content matching
  - `calculateExperienceScore()` — Scoring with current job priority
  - `selectStructuredContent()` — Section-specific content selection
  - `selectExperienceContentWithCurrentJobPriority()` — Experience prioritization

**Inbound**: job-application  
**Outbound**: content-library, llm (⚠️ circular)

**Known Issues**: Circular dependencies with content-library and llm

---

#### embedding
**Purpose**: Vector embedding generation for semantic search

**Exports**:
- `EmbeddingService` — Cohere API integration
  - `generateEmbedding()` — Create embeddings
  - `calculateSimilarity()` — Cosine similarity

**Inbound**: cover-letter-content, job-application  
**Outbound**: None

---

#### job-application
**Purpose**: Job application tracking and tailored resume generation

**Exports**:
- `JobApplicationController` — Job tracking endpoints
- `JobApplicationService` — Application management
- `JobAnalysisService` — Job description analysis
- `ResumeGenerationService` — Tailored resume creation

**Inbound**: None (top-level feature)  
**Outbound**: content-matching, content-library, llm, resume

---

#### resume
**Purpose**: Resume document management

**Exports**:
- `ResumeController` — Resume CRUD endpoints
- `ResumeService` — Resume business logic
- Guards and decorators

**Inbound**: job-application  
**Outbound**: user, storage, printer

---

#### cover-letter
**Purpose**: Cover letter generation orchestration

**Exports**:
- `CoverLetterController` — Cover letter endpoints
- `CoverLetterService` — Generation logic

**Inbound**: None (top-level feature)  
**Outbound**: cover-letter-content, llm, job-application

---

#### cover-letter-content
**Purpose**: Cover letter story/paragraph content management

**Exports**:
- `CoverLetterContentController` — Story CRUD endpoints
- `CoverLetterContentService` — Story management with embeddings

**Inbound**: cover-letter  
**Outbound**: embedding

---

### Supporting Services

#### company
**Purpose**: Company research and information

**Exports**:
- `CompanyController` — Company endpoints
- `CompanyService` — Company data management
- `CompanyResearchService` — Research tools

**Inbound**: job-application  
**Outbound**: llm

---

#### contact
**Purpose**: Company contact management

**Exports**:
- `ContactController` — Contact CRUD
- `ContactService` — Contact management

**Inbound**: automation-integration  
**Outbound**: user

---

#### tag
**Purpose**: Tagging system for content and applications

**Exports**:
- `TagController` — Tag endpoints
- `TagService` — Tag management

**Inbound**: content-library, job-application  
**Outbound**: user

---

#### interview
**Purpose**: Interview preparation utilities

**Exports**:
- `InterviewService` — Interview question generation

**Inbound**: job-application  
**Outbound**: llm

---

#### voice
**Purpose**: Voice/audio transcription and answer snippet management

**Exports**:
- `VoiceController` — Voice endpoints
- `VoiceService` — Transcription and snippet management

**Inbound**: None  
**Outbound**: embedding

---

### Infrastructure Services

#### config
**Purpose**: Application configuration management

**Exports**:
- `ConfigModule` — Environment variable management
- Configuration schema and validation

**Inbound**: All modules (via injection)  
**Outbound**: None

---

#### database
**Purpose**: Database connection and Prisma client

**Exports**:
- `DatabaseModule` — Prisma configuration

**Inbound**: All modules needing DB access  
**Outbound**: Prisma client

---

#### storage
**Purpose**: MinIO object storage for files

**Exports**:
- `StorageController` — File upload/download endpoints
- `StorageService` — S3-compatible storage operations

**Inbound**: resume, user  
**Outbound**: MinIO client

---

#### printer
**Purpose**: PDF generation via headless Chrome

**Exports**:
- `PrinterService` — PDF rendering
  - `printResume()` — Generate PDF from resume data

**Inbound**: resume  
**Outbound**: Puppeteer/Browserless

---

#### mail
**Purpose**: Email sending for notifications

**Exports**:
- `MailService` — SMTP email sending

**Inbound**: auth (password reset, verification)  
**Outbound**: Nodemailer

---

#### health
**Purpose**: Health checks for monitoring

**Exports**:
- `HealthController` — `/api/health` endpoint
- Health indicators (database, storage, browser)

**Inbound**: None (monitoring endpoint)  
**Outbound**: database, storage, printer

---

#### transcription
**Purpose**: Audio transcription utilities

**Exports**:
- `TranscriptionController` — Transcription endpoints
- `TranscriptionService` — Audio processing

**Inbound**: interview, voice  
**Outbound**: OpenAI Whisper API

---

#### translation
**Purpose**: Resume translation between languages

**Exports**:
- `TranslationController` — Translation endpoints
- `TranslationService` — LLM-powered translation

**Inbound**: resume  
**Outbound**: llm

---

#### feature
**Purpose**: Feature flags and toggles

**Exports**:
- `FeatureController` — Feature flag endpoints
- `FeatureService` — Feature management

**Inbound**: All modules (feature checks)  
**Outbound**: config

---

#### debug
**Purpose**: Debug logging and diagnostics

**Exports**:
- `DebugLoggerService` — Enhanced logging

**Inbound**: All modules (logging)  
**Outbound**: NestJS Logger

---

## External Integrations

### integrations/skyvern
**Path**: `apps/server/src/integrations/skyvern/`  
**Purpose**: External service integration for Skyvern browser automation  
**Status**: Optional external service (disabled by default)

**Configuration** (from `.env`):
- `SKYVERN_ENABLED` — Enable/disable globally (default: `false`)
- `SKYVERN_BASE_URL` — Skyvern instance URL (default: `http://localhost:8000`)
- `SKYVERN_TIMEOUT_MS` — HTTP timeout (default: `30000`)

**Module Structure**:
```
integrations/skyvern/
├── skyvern.client.ts             # HTTP client with config-based URLs
├── skyvern.module.ts              # NestJS module
├── guards/
│   └── skyvern-enabled.guard.ts  # Feature guard (returns 501 when disabled)
└── index.ts                       # Clean exports
```

**Key Exports**:
- **`SkyvernClient`** — Centralized HTTP client
  - `get(endpoint, apiKey)` — GET request to Skyvern API
  - `post(endpoint, apiKey, body)` — POST request
  - `delete(endpoint, apiKey)` — DELETE request
  - `checkHealth()` — Verify Skyvern is reachable
  - `getWebhookCallbackUrl(userId)` — Build webhook URL
  - `isEnabled()`, `getBaseUrl()`, `getTimeout()` — Config accessors

- **`SkyvernEnabledGuard`** — Returns `501 Not Implemented` when disabled

**Consumed By**: `AutomationIntegrationController`

**Behavior**:
- When `SKYVERN_ENABLED=false`: Guard returns 501
- When enabled: Proxies to `SKYVERN_BASE_URL`
- User API keys in database (`UserLLMSettings.skyvernApiKey`)

**Deployment**:
- Skyvern runs **independently** (not in `unified-docker-compose.yml` by default)
- Optional: `docker compose --profile skyvern up -d`
- Or remote: `SKYVERN_BASE_URL=https://skyvern.yourcompany.com`

**Inbound**: ConfigService  
**Outbound**: None (HTTP only)

---

## Special Controllers

### automation-integration.controller.ts
**Purpose**: Automation endpoints using Skyvern integration  
**Path**: `apps/server/src/automation-integration.controller.ts`

**Standalone Controller** (no module):
- `executeLinkedInWorkflow()` — LinkedIn job search automation
- `handleLinkedInJobSearchCallback()` — Webhook handler
- `handleCompanyResearchCallback()` — Company data webhook

**Dependencies**: job-application, company, contact, **SkyvernClient**

**Note**: All Skyvern HTTP calls go through `SkyvernClient` (no hardcoded URLs)

---

## Dependency Graph

**Visualizations**:
- DOT format: `docs/maps/deps.dot`
- SVG format: `docs/maps/deps.svg` (requires Graphviz)

**Analysis Tools**:
- Run: `pnpm check:deps` to validate no new cycles
- Baseline: `docs/maps/depcruise-baseline.json`

---

## Known Technical Debt

See **ADR-0001** (`docs/00-foundation/ADR-0001-Dependency-Cycles-Baseline.md`) for:
- 40 circular dependencies documented
- Remediation strategy
- CI baseline enforcement

**Circular Dependency Areas**:
1. **libs/ui** (24 cycles) — Barrel export patterns
2. **apps/server** (3 cycles) — Module circular dependencies
3. **apps/client/auth** (13 cycles) — Auth service barrel exports

**CI Enforcement**: `pnpm check:deps` prevents new cycles; existing cycles must be fixed incrementally

---

## Module Conventions

### NestJS Modules
- Each feature has `.module.ts`, `.controller.ts`, `.service.ts`
- Controllers handle HTTP endpoints (decorated with `@Controller()`)
- Services contain business logic (decorated with `@Injectable()`)
- Modules wire dependencies (decorated with `@Module()`)

### Library Modules
- Each lib has `src/index.ts` as entry point
- Barrel exports for public API
- Internal files not exported remain private

### Import Paths
- Apps use path aliases: `@/server/*`, `@/client/*`, `@/artboard/*`
- Libs use scoped packages: `@reactive-resume/{dto,schema,ui,utils,hooks,parser}`

---

## Adding a New Module

1. **Backend Module**:
   ```bash
   nx g @nx/nest:module my-feature --project=server
   nx g @nx/nest:service my-feature --project=server
   nx g @nx/nest:controller my-feature --project=server
   ```

2. **Frontend Module**:
   ```bash
   # Create in apps/client/src/services/my-feature/
   mkdir apps/client/src/services/my-feature
   # Add service files
   ```

3. **Shared Library**:
   ```bash
   nx g @nx/js:library my-lib
   # Update libs/my-lib/src/index.ts with exports
   # Add to tsconfig.base.json paths
   ```

4. **Documentation**:
   - Update this file (Modules.md)
   - Run `pnpm docs:all` to regenerate
   - Run `pnpm check:deps` to ensure no cycles

---

## Module Dependency Rules

✅ **DO**:
- Use dependency injection
- Keep modules focused (single responsibility)
- Document exports with TSDoc
- Check for existing modules before creating new ones

❌ **DON'T**:
- Create circular dependencies (CI will fail)
- Import across app boundaries (client → server)
- Create orphan modules (not imported anywhere)
- Skip documentation for public exports

---

**For detailed dependency analysis**, run:
```bash
pnpm check:deps              # Validate against baseline
pnpm docs:maps               # Generate dependency graph
```

