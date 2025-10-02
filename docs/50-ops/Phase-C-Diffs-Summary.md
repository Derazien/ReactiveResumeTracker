# Phase C: Key Diffs for Approval

**Date**: 2025-10-02

---

## 1. ADR-0001: Dependency Cycles Baseline

**File**: `docs/00-foundation/ADR-0001-Dependency-Cycles-Baseline.md`  
**Status**: NEW (227 lines)

**Content**:
- Documents 40 circular dependencies across 3 areas
- Establishes baseline and "no new cycles" rule
- Defines remediation strategy and priority
- Documents 10 orphans (2 moved, 8 kept as false positives)

**Key Sections**:
```markdown
## Cycle Categories

### libs/ui (24 cycles) — HIGH PRIORITY
Barrel export patterns in resume section forms

### apps/server (3 cycles) — MEDIUM PRIORITY  
Module circular dependencies (content-matching ↔ content-library ↔ llm)

### apps/client/auth (13 cycles) — LOW PRIORITY
Auth service imports through axios barrel

## CI Enforcement
- Baseline: docs/maps/depcruise-baseline.json
- Guard: scripts/audit/depcruise-compare-baseline.js
- No new cycles allowed; existing cycles fixed incrementally
```

---

## 2. Baseline JSON

**File**: `docs/maps/depcruise-baseline.json`  
**Status**: NEW (2MB, ~45,000 lines)

**Summary**:
```
Modules analyzed:      541
Dependencies cruised:  1,256
Circular violations:   40
Orphan warnings:       10
Error violations:      40
Warn violations:       10
```

**Purpose**: CI baseline for preventing new circular dependencies

---

## 3. CI Guard Script

**File**: `scripts/audit/depcruise-compare-baseline.js`  
**Status**: NEW (156 lines)

**Logic**:
```javascript
1. Load baseline JSON
2. Run depcruise on current codebase
3. Extract circular violations from both
4. Compare cycle IDs (normalized paths)
5. If new cycles found → EXIT 1 (fail)
6. If cycles same or reduced → EXIT 0 (pass)
```

**Output Example**:
```
📊 Baseline State:
   Modules: 541
   Dependencies: 1,256
   Circular violations: 40

📊 Current State:
   Modules: 541
   Dependencies: 1,256
   Circular violations: 40

✅ BASELINE MAINTAINED: No new circular dependencies
💡 Baseline: 40 cycles remaining
```

---

## 4. TypeScript Config

**File**: `tsconfig.base.json`  
**Diff**:
```diff
+ "jsx": "react-jsx",
+ "esModuleInterop": true,
+ "allowSyntheticDefaultImports": true,
+ "downlevelIteration": true,
```

**Purpose**: Enable TypeDoc generation and fix third-party library imports

---

## 5. TypeDoc Configuration

**File**: `typedoc.json`  
**Status**: NEW (41 lines)

**Key Settings**:
```json
{
  "entryPoints": [
    "apps/server/src/index.ts",  // Note: Excluded due to cycles
    "libs/dto/src/index.ts",
    "libs/schema/src/index.ts",
    "libs/utils/src/index.ts",
    "libs/hooks/src/index.ts",
    "libs/parser/src/index.ts"
  ],
  "entryPointStrategy": "resolve",
  "out": "docs/api",
  "skipErrorChecking": true,
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**Generated Output**: `docs/api/` (5 libraries, successfully generated)

---

## 6. Package.json Scripts

**Diff**:
```diff
+ "docs:maps": "node scripts/docs/generate-deps-graph.ps1 || bash scripts/docs/generate-deps-graph.sh",
+ "docs:api": "typedoc --options typedoc.json",
+ "docs:openapi": "node scripts/docs/export-openapi.js",
+ "docs:all": "pnpm docs:maps && pnpm docs:api && pnpm docs:openapi",
+ "check:deps": "node scripts/audit/depcruise-compare-baseline.js"
```

**Impact**: 5 new scripts for documentation generation and dependency validation

---

## 7. Dependency Cruiser Config

**File**: `.dependency-cruiser.js`  
**Status**: NEW (127 lines)

**Rules**:
- ❌ **no-circular** (severity: error) — Fails on circular dependencies
- ⚠️ **no-orphans** (severity: warn) — Warns on orphaned modules
- ❌ **no-non-package-json** — Fails on undeclared dependencies
- ❌ **not-to-unresolvable** — Fails on unresolvable imports

**Exclusions**:
- `node_modules`, `_scratch`, `dist`, `build`, `.next`, `coverage`
- `*.test.*`, `*.spec.*`, `__tests__`, `__mocks__`

---

## 8. Modules.md

**File**: `docs/10-architecture/Modules.md`  
**Status**: NEW (461 lines)

**Structure**:
- Applications (client, server, artboard)
- Libraries (schema, dto, ui, utils, hooks, parser)
- Backend modules (25+ services with purpose, exports, dependencies)
- Module dependency rules
- Known circular dependencies documented

**Sample Entry**:
```markdown
### llm
**Purpose**: Multi-provider LLM integration

**Exports**:
- LLMController, LLMService, LLMOptimizationService
- Providers (Anthropic, OpenAI, Google, Ollama)

**Inbound**: job-application, content-matching, content-library, cover-letter
**Outbound**: content-library, content-matching (⚠️ circular)

**Known Issues**: Circular dependencies with content-library and content-matching
```

---

## 9. Docker-Services.md

**File**: `docs/50-ops/Docker-Services.md`  
**Status**: NEW (442 lines)

**Content**:
- 9 services from unified-docker-compose.yml (detailed)
- 7 additional services from self-hosted-infrastructure.yml
- Ports, env vars, volumes, healthchecks for each
- Quick reference commands
- Port summary table
- Troubleshooting section

**Sample Entry**:
```markdown
### skyvern
**Image**: `public.ecr.aws/skyvern/skyvern:latest`
**Container**: `skyvern-api`
**Context**: Skyvern automation engine API

**Ports**:
- 8000:8000 — API server
- 9222:9222 — Chrome DevTools
- 5900:5900 — VNC access

**Environment**: DATABASE_STRING, REDIS_URL, BROWSER_TYPE, etc.
**Healthcheck**: wget --spider http://localhost:8000/docs
```

---

## 10. Project Overview Updates

**File**: `docs/00-foundation/Project-Overview.md`  
**Changes**:

### Added Technical Debt Section (50 lines)
```markdown
## Technical Debt

### Circular Dependencies (ADR-0001)
**Status**: 40 circular dependencies exist
**Breakdown**: libs/ui (24), apps/server (3), apps/client/auth (13)
**CI Enforcement**: Baseline prevents new cycles
**Remediation**: See ADR-0001 for strategy

### TypeDoc Limitations
**Current**: Libraries only (dto, hooks, parser, schema, utils)
**Excluded**: apps (due to circular dependencies)
**Future**: Full generation after cycles resolved

### OpenAPI Generation
**Current**: Placeholder (requires running server for full spec)
**Instructions**: pnpm dev + curl http://localhost:3000/docs-json
```

### Updated ADRs Section
```diff
+ **Existing ADRs**:
+ - **ADR-0001**: Dependency Cycles Baseline (2025-10-02)
```

### Updated OpenAPI Section
```diff
- **Location**: Currently not generated; planned for Phase C
+ **Location**: `docs/20-backend/openapi.json` (placeholder)
+ **To generate full spec**: pnpm dev + curl ...
```

---

## 11. Documentation Updates (Canonical Commands)

**Files Updated** (4):
- `docs/automation/SETUP_AND_TROUBLESHOOTING.md`
- `docs/automation/LINKEDIN_AUTOMATION.md`
- `docs/automation/SYSTEM_ARCHITECTURE_ANALYSIS.md`
- `docs/50-ops/Docker-Services.md`

**Change**:
```diff
- docker-compose -f docker-compose.skyvern.yml up -d
+ docker compose -f unified-docker-compose.yml up -d
```

**Impact**: All documentation now references canonical compose file only

---

## 12. Files Moved

### Deprecated Compose Files → _scratch/compose/
- `docker-compose.skyvern.yml`
- `scripts/docker/docker-compose-complete-stack.yml`
- `scripts/docker/docker-compose-reactiveresume-only.yml`

### Orphaned Modules → _scratch/legacy/orphaned-2025-10-02/
- `apps/server/src/llm/company-research.service.ts` (duplicate)
- `apps/client/src/stores/job-application.ts` (unused)

---

## Summary Statistics

### Files Created: 16
- 1 ADR
- 2 architecture docs (Modules.md, Docker-Services.md)
- 3 Phase C summary docs
- 3 config files (.dependency-cruiser.js, typedoc.json, modified tsconfig)
- 4 scripts (CI guard, docs generators)
- 3 generated artifact directories (docs/api/, docs/20-backend/, docs/maps/)

### Files Modified: 8
- package.json (5 new scripts)
- tsconfig.base.json (4 compiler options)
- Project-Overview.md (Technical Debt section)
- 4 automation docs (canonical command updates)

### Files Moved: 5
- 3 deprecated compose files
- 2 orphaned modules

### Lines Changed:
- Package.json: +5 lines (scripts)
- tsconfig.base.json: +4 lines (compiler options)
- Documentation: +1,600 lines (new docs)
- Moved files: -5 files from repo root/scripts

---

## Verification

### All Scripts Work ✅
```bash
$ pnpm check:deps
✅ BASELINE MAINTAINED: No new circular dependencies

$ pnpm docs:api
✅ markdown generated at ./docs/api

$ pnpm docs:openapi
✅ Placeholder OpenAPI specification created

$ pnpm docs:maps
✅ Dependency graph (DOT) saved
```

### All Artifacts Generated ✅
- `docs/api/` (TypeDoc markdown)
- `docs/20-backend/openapi.json` (placeholder)
- `docs/maps/depcruise-baseline.json` (2MB baseline)
- `docs/maps/deps.dot` (dependency graph)

### All Documentation Complete ✅
- `docs/00-foundation/ADR-0001-Dependency-Cycles-Baseline.md`
- `docs/10-architecture/Modules.md`
- `docs/50-ops/Docker-Services.md`
- Technical Debt section in Project-Overview.md

---

## Ready for Approval

✅ **ADR created** documenting technical debt  
✅ **Baseline captured** (40 cycles, 10 orphans)  
✅ **CI guard implemented** prevents new cycles  
✅ **TypeScript config fixed** enables TypeDoc  
✅ **Orphans triaged** (2 moved, 8 kept)  
✅ **All artifacts generated** (docs/api/, docs/20-backend/, docs/maps/)  
✅ **Modules.md created** (461 lines, complete catalog)  
✅ **Docker-Services.md created** (442 lines, all services)  
✅ **Deprecated files moved** to _scratch/  
✅ **Docs updated** to canonical commands only  
✅ **Project-Overview.md updated** with Technical Debt section  

**Awaiting your approval to commit Phase C**

