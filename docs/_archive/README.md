# Archived Documentation

> **⚠️ ARCHIVED (2025-10-03)** — Phase E Cleanup

This directory contains documentation that served its purpose during development/migration phases but is no longer actively maintained. Keep for historical reference only.

---

## Structure

| Directory | Contents | Purpose |
|-----------|----------|---------|
| `migration/` | Database and deployment migration docs | SQLite → PostgreSQL migration, deployment guides |
| `automation/` | Skyvern workflow development docs | LinkedIn automation, workflow fixes |
| `llm/` | LLM configuration research and old guides | Ollama setup, provider research |
| `planning/` | Project planning and analysis docs | Cost analysis, architecture decisions |
| `phase-b/` | Phase B script organization docs | Script cleanup, canonicalization |

---

## Canonical Documentation

For current, authoritative documentation, see:

- **[Project Overview](../00-foundation/Project-Overview.md)** — Complete system architecture
- **[Phase E Server Deployment Guide](../50-ops/Phase-E-Server-Deployment-Guide.md)** — Current deployment procedures
- **[Run Paths Catalog](../50-ops/Run-Paths-Catalog.md)** — All executable commands
- **[Docker Services](../50-ops/Docker-Services.md)** — Service configurations
- **[Module Architecture](../10-architecture/Modules.md)** — Code organization

---

## Why These Were Archived

These documents were created during:
- **Phase A**: Initial setup and planning
- **Phase B**: Script organization and canonicalization
- **Phase C/D**: Migration and refactoring
- **Phase E**: Server deployment preparation

They contain:
- ✅ Valuable historical context
- ✅ Migration procedures used once
- ✅ Analysis that led to current architecture
- ❌ Outdated configuration instructions
- ❌ Temporary fixes that have been superseded
- ❌ Incomplete or draft documentation

---

## When to Reference

**Use archived docs when:**
- Understanding historical decision-making
- Debugging migration-related issues
- Researching alternative approaches that were considered
- Tracing the evolution of the codebase

**Do not use archived docs for:**
- Current deployment procedures
- Active development guidance
- User-facing documentation
- API contracts or specifications

---

**Questions?** Refer to canonical docs listed above or check `git log` for context.

