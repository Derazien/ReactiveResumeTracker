# ReactiveResumeTracker Documentation

Welcome to the official documentation for **ReactiveResumeTracker** - an AI-powered resume builder with intelligent job application tracking and smart content management.

---

## 📚 Canonical Documentation Structure

> **Golden Order of Truth**: Foundation → Architecture → Backend → Operations → Guides

### 🏛️ Foundation (`00-foundation/`)

**Core project documentation** - Start here for understanding the system

- **[Project-Overview.md](00-foundation/Project-Overview.md)** ⭐ — Complete system architecture, tech stack, and features
- **[Glossary.md](00-foundation/Glossary.md)** — Term definitions and naming conventions
- **[ADR-*.md](00-foundation/)** — Architecture Decision Records

### 🏗️ Architecture (`10-architecture/`)

**System design and patterns** - How components work together

- **[Modules.md](10-architecture/Modules.md)** — Module organization and dependencies
- **[Frontend-Components.md](10-architecture/Frontend-Components.md)** — Complete frontend component catalog with localization status
- **[RAG-System.md](10-architecture/RAG-System.md)** — Content matching and retrieval architecture
- **[Content-Matching.md](10-architecture/Content-Matching.md)** — Experience matching algorithms
- **[Enhanced-RAG.md](10-architecture/Enhanced-RAG.md)** — Advanced RAG enhancements

### 🔌 Backend (`20-backend/`)

**API contracts and schemas** - Technical specifications

- **[openapi.json](20-backend/openapi.json)** — Complete API specification
- **[Schema-Reference.md](20-backend/Schema-Reference.md)** — Database schemas and data structures

### ⚙️ Operations (`50-ops/`)

**Deployment and execution** - How to run and maintain the system

- **[Phase-E-Server-Deployment-Guide.md](50-ops/Phase-E-Server-Deployment-Guide.md)** ⭐ — Complete deployment procedures
- **[OLLAMA_DEPLOYMENT.md](50-ops/OLLAMA_DEPLOYMENT.md)** — Multi-model local LLM setup with Ollama
- **[Phase-E-Archiving-Plan.md](50-ops/Phase-E-Archiving-Plan.md)** — Documentation organization strategy
- **[Run-Paths-Catalog.md](50-ops/Run-Paths-Catalog.md)** — All executable commands and scripts
- **[Docker-Services.md](50-ops/Docker-Services.md)** — Service configurations
- **[Service-Health.md](50-ops/Service-Health.md)** — Health check commands
- **[SQLITE_TO_POSTGRES_MIGRATION.md](50-ops/SQLITE_TO_POSTGRES_MIGRATION.md)** — Database migration reference

### 📖 User Guides (`guides/`)

**How-to guides** - Practical instructions for specific tasks

- **[TEMPLATE-CREATION.md](guides/TEMPLATE-CREATION.md)** — Create custom resume templates
- **[PDF-SIZE-OPTIMIZATION.md](guides/PDF-SIZE-OPTIMIZATION.md)** — Optimize PDF generation
- **[COVER-LETTER-QUICK-START.md](guides/COVER-LETTER-QUICK-START.md)** — Cover letter generator quick start
- **[OPENAI-WHISPER-TRANSCRIPTION.md](guides/OPENAI-WHISPER-TRANSCRIPTION.md)** — Voice-to-text integration

### ✉️ Cover Letter System (`cover-letters/`)

**Cover letter implementation** - How the cover letter generation system works

- **[COVER_LETTER_SYSTEM_IMPLEMENTATION_COMPLETE.md](cover-letters/COVER_LETTER_SYSTEM_IMPLEMENTATION_COMPLETE.md)** — Complete implementation details
- **[COVER_LETTER_SYSTEM_CONSOLIDATION.md](cover-letters/COVER_LETTER_SYSTEM_CONSOLIDATION.md)** — System consolidation notes
- **[COVER_LETTER_MANUAL_TESTING_GUIDE.md](cover-letters/COVER_LETTER_MANUAL_TESTING_GUIDE.md)** — Testing procedures

### 🗺️ Roadmap (`roadmap/`)

**Future plans** - Planned features and enhancements

- **[FUTURE_RESUME_TAILORING_ENHANCEMENTS.md](roadmap/FUTURE_RESUME_TAILORING_ENHANCEMENTS.md)** — Resume tailoring roadmap
- **[RAG_ENHANCEMENT_ROADMAP.md](roadmap/RAG_ENHANCEMENT_ROADMAP.md)** — RAG system improvements

### 🤖 Automation (`automation/`)

**LinkedIn automation** - Skyvern integration guides

- **[QUICKSTART.md](automation/QUICKSTART.md)** — Quick start guide
- **[LINKEDIN_AUTOMATION.md](automation/LINKEDIN_AUTOMATION.md)** — LinkedIn workflow guide
- **[SETUP_AND_TROUBLESHOOTING.md](automation/SETUP_AND_TROUBLESHOOTING.md)** — Technical setup
- **[SYSTEM_ARCHITECTURE_ANALYSIS.md](automation/SYSTEM_ARCHITECTURE_ANALYSIS.md)** — Architecture analysis
- **[SKYVERN_BLOCK_TYPES_REFERENCE.md](automation/SKYVERN_BLOCK_TYPES_REFERENCE.md)** — Block types reference

### 📁 Generated Documentation

- **[api/](api/)** — TypeDoc API documentation (auto-generated)
- **[maps/](maps/)** — Dependency graphs (auto-generated)

### 📦 Archive (`_archive/`)

**Historical reference** - Old documentation and completed work

See [_archive/README.md](_archive/README.md) for details. Do not use for current development.

---

## 🚀 Quick Start

### For New Developers

1. **Read** [Project-Overview.md](00-foundation/Project-Overview.md) — Understand the system
2. **Follow** [Phase-E-Server-Deployment-Guide.md](50-ops/Phase-E-Server-Deployment-Guide.md) — Set up environment
3. **Configure** [USER_LLM_CONFIGURATION_GUIDE.md](USER_LLM_CONFIGURATION_GUIDE.md) — Configure AI providers
4. **Review** [Modules.md](10-architecture/Modules.md) — Understand code organization

### For Feature Development

1. **Check** [roadmap/](roadmap/) — See planned features
2. **Review** [10-architecture/](10-architecture/) — Understand current architecture
3. **Consult** [20-backend/openapi.json](20-backend/openapi.json) — API contracts
4. **Follow** [00-foundation/Project-Overview.md](00-foundation/Project-Overview.md) — Implementation rules

### For Operations/Deployment

1. **Follow** [Phase-E-Server-Deployment-Guide.md](50-ops/Phase-E-Server-Deployment-Guide.md) — Complete deployment
2. **Reference** [Run-Paths-Catalog.md](50-ops/Run-Paths-Catalog.md) — All commands
3. **Check** [Docker-Services.md](50-ops/Docker-Services.md) — Service configurations
4. **Use** [Service-Health.md](50-ops/Service-Health.md) — Health checks

### For Bug Fixes

1. **Check** [50-ops/Run-Paths-Catalog.md](50-ops/Run-Paths-Catalog.md) — Find canonical scripts
2. **Review** [10-architecture/Modules.md](10-architecture/Modules.md) — Module boundaries
3. **Consult** [20-backend/openapi.json](20-backend/openapi.json) — API contracts
4. **Search** codebase using Golden Order of Truth (see below)

---

## 🔍 Golden Order of Truth

When searching for answers, use this priority order:

1. **Foundation & Architecture** (`00-foundation/`, `10-architecture/`) — System design
2. **API Contracts** (`20-backend/openapi.json`) — API specifications
3. **Generated Docs** (`api/`, `maps/`) — TypeDoc and dependency graphs
4. **Operations** (`50-ops/`) — Deployment and execution
5. **Source Code** (`apps/`, `libs/`) — Implementation details

---

## 📝 Documentation Standards

All documentation follows these principles:

- ✅ **Clear hierarchy** — Foundation → Architecture → Backend → Operations → Guides
- ✅ **Single source of truth** — No redundant documentation
- ✅ **Cross-references** — Link to related docs
- ✅ **Code examples** — Show don't tell
- ✅ **Up-to-date** — Run `pnpm docs:all` after changes

---

## 🔄 Keeping Documentation Updated

### When Making Code Changes

1. **Update relevant docs** in canonical locations
2. **Run** `pnpm docs:all` to regenerate API docs and graphs
3. **Update** this README if adding new files
4. **Create ADR** for significant architectural changes

### Documentation Commands

```bash
# Regenerate all documentation
pnpm docs:all

# Individual commands
pnpm docs:maps        # Dependency graphs
pnpm docs:api         # TypeDoc API docs
pnpm docs:openapi     # OpenAPI specification

# Validation
pnpm check:deps       # Check for circular dependencies
pnpm check:docs       # Validate documentation integrity
```

---

## 📞 Need Help?

### Can't Find What You're Looking For?

1. **Check** [Project-Overview.md](00-foundation/Project-Overview.md) — Overview of everything
2. **Search** [Run-Paths-Catalog.md](50-ops/Run-Paths-Catalog.md) — All commands
3. **Review** [Modules.md](10-architecture/Modules.md) — Code organization
4. **Consult** [openapi.json](20-backend/openapi.json) — API reference

### Documentation Issues?

- Found outdated info? Update it and run `pnpm docs:all`
- Missing documentation? Add it in the appropriate canonical location
- Unclear documentation? Improve it and submit a PR

---

**Last Updated**: Phase E (2025-10-03)  
**Maintained By**: ReactiveResumeTracker Team
