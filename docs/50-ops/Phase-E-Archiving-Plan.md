# Phase E: Archiving & Cleanup Plan

**Status**: Implementation Ready  
**Date**: 2025-10-03  
**Purpose**: Archive temporary/obsolete documentation and scripts before final server deployment

---

## Overview

Phase E represents the transition from development/migration to production deployment. Many temporary documents, scripts, and artifacts accumulated during development and migration phases should be archived to keep the repository clean and maintainable.

---

## Files to Archive

### Root-Level Documentation (Move to `docs/_archive/migration/`)

These are temporary migration/analysis documents that served their purpose:

| File | Reason | Archive Location |
|------|--------|------------------|
| `AUTOMATION_SETUP.md` | Migration doc - covered in canonical docs | `docs/_archive/migration/` |
| `AUTOMATION_SYSTEM_COMPLETE.md` | Completion summary - merge into changelog | `docs/_archive/migration/` |
| `BLOCK_TYPES_ANALYSIS.md` | Skyvern analysis - reference only | `docs/_archive/automation/` |
| `CLEAN_SCRIPT_ORGANIZATION.md` | Phase B planning - completed | `docs/_archive/phase-b/` |
| `COMMIT_ORGANIZATION_PLAN.md` | Planning doc - completed | `docs/_archive/phase-b/` |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | Superseded by Run Paths Catalog | `docs/_archive/phase-b/` |
| `COMPLETE_SERVER_HOSTING_ANALYSIS.md` | Analysis - completed | `docs/_archive/planning/` |
| `COMPLETE_SOLUTION_TIMELINE_AND_COSTS.md` | Planning - completed | `docs/_archive/planning/` |
| `COST_EFFICIENCY_ANALYSIS.md` | Analysis - completed | `docs/_archive/planning/` |
| `DEPLOYMENT_GUIDE.md` | Replaced by `docs/50-ops/Phase-E-Server-Deployment-Guide.md` | `docs/_archive/migration/` |
| `DEPLOYMENT_INSTRUCTIONS.md` | Duplicate - use canonical | `docs/_archive/migration/` |
| `FINAL_MIGRATION_SUMMARY.md` | Migration summary - keep as reference | `docs/_archive/migration/` |
| `FINAL_WORKFLOW_SOLUTION.md` | Skyvern workflow - reference | `docs/_archive/automation/` |
| `FOR_LOOP_REFERENCE_FIX.md` | Bug fix doc - reference only | `docs/_archive/automation/` |
| `FRESH_IMPORT_SUMMARY.md` | Migration doc - reference | `docs/_archive/migration/` |
| `HAIKU_CONFIGURATION_SUCCESS_SUMMARY.md` | LLM config - superseded | `docs/_archive/llm/` |
| `HYBRID_ARCHITECTURE_ANALYSIS.md` | Planning - completed | `docs/_archive/planning/` |
| `IMMEDIATE_OLLAMA_SETUP.md` | Superseded by deployment guide | `docs/_archive/llm/` |
| `MANUAL_WORKFLOW_UPDATE.md` | Skyvern workflow - reference | `docs/_archive/automation/` |
| `MIGRATION_SUCCESS.md` | Migration summary - keep as reference | `docs/_archive/migration/` |
| `OLLAMA_CONFIGURATION_GUIDE.md` | Merged into deployment guide | `docs/_archive/llm/` |
| `ONE_WEEK_SPRINT_PLAN.md` | Planning - completed | `docs/_archive/planning/` |
| `OPEN_SOURCE_LLM_HOSTING_RESEARCH.md` | Research - completed | `docs/_archive/llm/` |
| `REALISTIC_SYSTEM_ANALYSIS.md` | Planning - completed | `docs/_archive/planning/` |
| `SCRIPT_CLEANUP_PLAN.md` | Phase B planning - completed | `docs/_archive/phase-b/` |
| `SCRIPT_ORGANIZATION_ANALYSIS.md` | Phase B analysis - completed | `docs/_archive/phase-b/` |
| `SERVER_DEPLOYMENT_GUIDE.md` | Replaced by canonical version | `docs/_archive/migration/` |
| `SERVER_DEPLOYMENT_STEPS.md` | Replaced by canonical version | `docs/_archive/migration/` |
| `SKYVERN_BLOCK_TYPES_REFERENCE.md` | Skyvern reference - keep in docs/automation/ | Keep (move to `docs/automation/`) |
| `WORKFLOW_LOGIC_FIXES.md` | Skyvern fixes - reference | `docs/_archive/automation/` |

### Root-Level Scripts (Move to `_scratch/temp-scripts/`)

Temporary scripts created during migration/testing:

| File | Reason | Archive Location |
|------|--------|------------------|
| `add-automation-blocks.js` | Skyvern workflow script - one-time use | `_scratch/temp-scripts/` |
| `analyze-and-fix-workflow.js` | Analysis script - one-time use | `_scratch/temp-scripts/` |
| `analyze-working-workflow.js` | Analysis script - one-time use | `_scratch/temp-scripts/` |
| `automation-endpoints-implementation.ts` | Implementation draft - merged | `_scratch/temp-scripts/` |
| `enhanced-company-extraction-schema.js` | Schema draft - merged | `_scratch/temp-scripts/` |
| `enhanced-workflow-creator.js` | Workflow script - one-time use | `_scratch/temp-scripts/` |
| `fetch-current-workflow.js` | Skyvern fetch - one-time use | `_scratch/temp-scripts/` |
| `final-surgical-fix.js` | Bug fix script - one-time use | `_scratch/temp-scripts/` |
| `fix-for-loop-references.js` | Bug fix script - one-time use | `_scratch/temp-scripts/` |
| `fix-http-templating.js` | Bug fix script - one-time use | `_scratch/temp-scripts/` |
| `fix-timestamps-correct.sql` | Migration fix - one-time use | `_scratch/migration/` |
| `fix-timestamps.js` | Migration fix - one-time use | `_scratch/migration/` |
| `fix-timestamps.sql` | Migration fix - one-time use | `_scratch/migration/` |
| `fix-workflow-references.js` | Workflow fix - one-time use | `_scratch/temp-scripts/` |
| `fix-workflow-sequencing.js` | Workflow fix - one-time use | `_scratch/temp-scripts/` |
| `get-real-settings.js` | Debug script - one-time use | `_scratch/temp-scripts/` |
| `optimize-webhook-payload.js` | Optimization script - one-time use | `_scratch/temp-scripts/` |
| `revert-workflow.js` | Revert script - one-time use | `_scratch/temp-scripts/` |
| `sqlite-dump.sql` | SQLite dump - no longer needed | `_scratch/migration/` |
| `update-company-extraction.js` | Update script - one-time use | `_scratch/temp-scripts/` |
| `workflow-wpid440789045004028228-editor.js` | Workflow editor - one-time use | `_scratch/temp-scripts/` |

### Root-Level Data Files (Move to `_scratch/data/`)

Temporary data files:

| File | Reason | Archive Location |
|------|--------|------------------|
| `check-schema.sql` | Debug SQL - temporary | `_scratch/migration/` |
| `check-timestamps.sql` | Debug SQL - temporary | `_scratch/migration/` |
| `corrected-workflow-success.json` | Workflow snapshot - reference | `_scratch/data/` |
| `current-workflow-backup.json` | Workflow backup - reference | `_scratch/data/` |
| `database-export.json` | Old export format - superseded | `_scratch/migration/` |
| `enhanced-workflow-success.json` | Workflow snapshot - reference | `_scratch/data/` |
| `env.txt` | Old env reference - delete | DELETE (sensitive) |
| `fixed-workflow-success.json` | Workflow snapshot - reference | `_scratch/data/` |
| `job-extraction-schema.json` | Schema draft - merged | `_scratch/data/` |
| `old_method_content.txt` | Legacy content - no longer needed | `_scratch/data/` |
| `quick-fix-timestamps.sql` | Debug SQL - temporary | `_scratch/migration/` |
| `test-endpoints-manual.http` | Manual tests - keep in tools/ | Keep (move to `tools/manual-tests/`) |
| `test-pg-direct.js` | Debug script - temporary | `_scratch/migration/` |
| `test-prisma-connection.js` | Debug script - temporary | `_scratch/migration/` |
| `workflow-company-contacts-schema.json` | Schema draft - merged | `_scratch/data/` |
| `workflow-http-block-config.js` | Config draft - merged | `_scratch/data/` |
| `workflow-http-block-config.json` | Config draft - merged | `_scratch/data/` |
| `workflow-http-blocks-config.json` | Config draft - merged | `_scratch/data/` |
| `workflow-implementation-guide.md` | Guide - superseded | `docs/_archive/automation/` |
| `workflow-implementation-steps.md` | Steps - superseded | `docs/_archive/automation/` |
| `workflow-integration-final.md` | Integration doc - superseded | `docs/_archive/automation/` |
| `workflow-job-application-schema.json` | Schema draft - merged | `_scratch/data/` |
| `working-workflow-structure.json` | Workflow snapshot - reference | `_scratch/data/` |

### Root-Level Shim Scripts (Keep)

These redirect to canonical paths and should remain:

| File | Status | Purpose |
|------|--------|---------|
| `start-local.ps1` | Shim | Redirects to `scripts/win/start-local.ps1` |
| `deploy-server.sh` | Shim | Redirects to `scripts/production/deploy-server.sh` |

### Root-Level Test Scripts (Move to `tools/`)

| File | Reason | Archive Location |
|------|--------|------------------|
| `test-import.ps1` | DB import test - keep in tools | `tools/database/` |
| `test-local-postgres.ps1` | DB test - keep in tools | `tools/database/` |
| `copy-arc-to-docker.ps1` | Docker utility - keep in tools | `tools/docker/` |

---

## Archive Structure

```
docs/
├── _archive/                    # All archived documentation
│   ├── migration/              # Database/deployment migration docs
│   ├── automation/             # Skyvern workflow development docs
│   ├── llm/                    # LLM configuration research/old guides
│   ├── planning/               # Project planning and analysis docs
│   ├── phase-b/                # Phase B script organization docs
│   └── README.md               # Index of archived docs

_scratch/
├── temp-scripts/               # One-time scripts
├── migration/                  # Migration SQL/debug scripts
├── data/                       # JSON snapshots and test data
└── README.md                   # Warning about non-canonical content
```

---

## Archive Banner Template

Add this to the top of each archived document:

```markdown
> **⚠️ ARCHIVED (2025-10-03)**
> 
> This document has been archived as part of Phase E cleanup.
> 
> **Canonical Documentation:**
> - [Phase E Server Deployment Guide](../50-ops/Phase-E-Server-Deployment-Guide.md)
> - [Project Overview](../00-foundation/Project-Overview.md)
> - [Run Paths Catalog](../50-ops/Run-Paths-Catalog.md)
```

---

## Implementation Steps

### 1. Create Archive Directories

```bash
# Documentation archive
mkdir -p docs/_archive/{migration,automation,llm,planning,phase-b}

# Scratch archive
mkdir -p _scratch/{temp-scripts,migration,data}

# Tools organization
mkdir -p tools/{database,docker,manual-tests}
```

### 2. Move Documentation

```bash
# Migration docs
mv AUTOMATION_SETUP.md AUTOMATION_SYSTEM_COMPLETE.md DEPLOYMENT_GUIDE.md \
   DEPLOYMENT_INSTRUCTIONS.md FINAL_MIGRATION_SUMMARY.md FRESH_IMPORT_SUMMARY.md \
   MIGRATION_SUCCESS.md SERVER_DEPLOYMENT_GUIDE.md SERVER_DEPLOYMENT_STEPS.md \
   docs/_archive/migration/

# Automation docs
mv BLOCK_TYPES_ANALYSIS.md FINAL_WORKFLOW_SOLUTION.md FOR_LOOP_REFERENCE_FIX.md \
   MANUAL_WORKFLOW_UPDATE.md WORKFLOW_LOGIC_FIXES.md \
   workflow-implementation-guide.md workflow-implementation-steps.md workflow-integration-final.md \
   docs/_archive/automation/

# LLM docs
mv HAIKU_CONFIGURATION_SUCCESS_SUMMARY.md IMMEDIATE_OLLAMA_SETUP.md \
   OLLAMA_CONFIGURATION_GUIDE.md OPEN_SOURCE_LLM_HOSTING_RESEARCH.md \
   docs/_archive/llm/

# Planning docs
mv COMPLETE_SERVER_HOSTING_ANALYSIS.md COMPLETE_SOLUTION_TIMELINE_AND_COSTS.md \
   COST_EFFICIENCY_ANALYSIS.md HYBRID_ARCHITECTURE_ANALYSIS.md \
   ONE_WEEK_SPRINT_PLAN.md REALISTIC_SYSTEM_ANALYSIS.md \
   docs/_archive/planning/

# Phase B docs
mv CLEAN_SCRIPT_ORGANIZATION.md COMMIT_ORGANIZATION_PLAN.md \
   COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md SCRIPT_CLEANUP_PLAN.md \
   SCRIPT_ORGANIZATION_ANALYSIS.md \
   docs/_archive/phase-b/

# Special: Keep Skyvern reference in docs
mv SKYVERN_BLOCK_TYPES_REFERENCE.md docs/automation/
```

### 3. Move Scripts

```bash
# Temporary scripts
mv add-automation-blocks.js analyze-and-fix-workflow.js analyze-working-workflow.js \
   automation-endpoints-implementation.ts enhanced-company-extraction-schema.js \
   enhanced-workflow-creator.js fetch-current-workflow.js final-surgical-fix.js \
   fix-for-loop-references.js fix-http-templating.js fix-workflow-references.js \
   fix-workflow-sequencing.js get-real-settings.js optimize-webhook-payload.js \
   revert-workflow.js update-company-extraction.js workflow-wpid440789045004028228-editor.js \
   _scratch/temp-scripts/

# Migration scripts
mv fix-timestamps-correct.sql fix-timestamps.js fix-timestamps.sql \
   sqlite-dump.sql check-schema.sql check-timestamps.sql quick-fix-timestamps.sql \
   test-pg-direct.js test-prisma-connection.js \
   _scratch/migration/

# Data files
mv corrected-workflow-success.json current-workflow-backup.json database-export.json \
   enhanced-workflow-success.json fixed-workflow-success.json job-extraction-schema.json \
   old_method_content.txt workflow-company-contacts-schema.json workflow-http-block-config.js \
   workflow-http-block-config.json workflow-http-blocks-config.json \
   workflow-job-application-schema.json working-workflow-structure.json \
   _scratch/data/

# Tools organization
mv test-import.ps1 test-local-postgres.ps1 tools/database/
mv copy-arc-to-docker.ps1 tools/docker/
mv test-endpoints-manual.http tools/manual-tests/
```

### 4. Delete Sensitive Files

```bash
# Remove sensitive environment template (use .env.example instead)
rm env.txt
```

### 5. Add Archive READMEs

Create `docs/_archive/README.md`:

```markdown
# Archived Documentation

This directory contains documentation that served its purpose during development/migration phases but is no longer actively maintained. Keep for historical reference only.

## Structure

- `migration/` - Database and deployment migration docs
- `automation/` - Skyvern workflow development docs
- `llm/` - LLM configuration research and old guides
- `planning/` - Project planning and analysis docs
- `phase-b/` - Phase B script organization docs

## Canonical Documentation

For current, authoritative documentation, see:
- [Project Overview](../00-foundation/Project-Overview.md)
- [Phase E Server Deployment Guide](../50-ops/Phase-E-Server-Deployment-Guide.md)
- [Run Paths Catalog](../50-ops/Run-Paths-Catalog.md)
```

Create `_scratch/README.md`:

```markdown
# Scratch Directory

> **⚠️ NON-AUTHORITATIVE CONTENT**

This directory contains temporary scripts, debug files, and experimental code. **Do not** rely on anything in here for production use or as documentation.

## Purpose

- Temporary one-time-use scripts
- Debug/test SQL files
- JSON snapshots from workflow development
- Migration artifacts

## Structure

- `temp-scripts/` - One-time automation and debug scripts
- `migration/` - Database migration SQL and debug files
- `data/` - JSON snapshots and test data

## Canonical Paths

For production scripts and documentation, see:
- `scripts/` - Canonical scripts
- `docs/` - Canonical documentation
- `tools/` - Utility scripts
```

### 6. Update `.gitignore`

Add patterns to prevent committing scratch content accidentally:

```bash
echo "" >> .gitignore
echo "# Scratch/temp files (archived during Phase E)" >> .gitignore
echo "_scratch/temp-scripts/*" >> .gitignore
echo "_scratch/data/*" >> .gitignore
echo "!_scratch/README.md" >> .gitignore
```

---

## Verification

### Before Archiving

```bash
# Count root-level files
ls -1 *.md *.js *.ps1 *.sh *.json *.sql 2>/dev/null | wc -l
```

### After Archiving

```bash
# Should only have canonical/necessary files in root
ls -1 *.md *.js *.ps1 *.sh *.json *.sql 2>/dev/null

# Expected root files:
# - package.json, pnpm-lock.yaml
# - README.md, CHANGELOG.md, LICENSE.md
# - CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md
# - start-local.ps1 (shim)
# - deploy-server.sh (shim)
# - crowdin.yml, lingui.config.ts, tailwind.config.js
# - tsconfig.base.json, jest.config.ts, nx.json
# - *.yml (Docker compose files)
# - postgres-backup.dump (temporary - will be on server)

# Verify archives
ls docs/_archive/
ls _scratch/
```

---

## Post-Archiving Actions

### 1. Update Documentation References

Check and update any references to archived files in:
- `docs/00-foundation/Project-Overview.md`
- `docs/50-ops/Run-Paths-Catalog.md`
- Any other canonical documentation

### 2. Regenerate Documentation

```bash
# Regenerate all documentation
pnpm docs:all

# Verify no broken links
# (manual check or use markdown link checker)
```

### 3. Git Commit

```bash
git add -A
git status  # Verify changes

# Use conventional commit format
git commit -m "chore(docs): Phase E cleanup - archive temporary docs and scripts

- Move 50+ temporary docs to docs/_archive/
- Move one-time scripts to _scratch/
- Organize tools/ directory
- Add archive READMEs with canonical refs
- Update .gitignore for scratch content

Refs: Phase E cleanup plan
"
```

### 4. Update Run Paths Catalog

Re-run the catalog script to reflect moved/archived files:

```bash
node scripts/audit/runpaths.js
```

---

## Rollback Plan

If anything breaks after archiving:

```bash
# Restore from Git
git log --oneline -10  # Find the commit before archiving
git checkout <commit-hash> -- <file-path>

# Or restore entire directory
git checkout <commit-hash> -- docs/_archive/

# Verify
git status
```

---

## See Also

- [Phase E Server Deployment Guide](./Phase-E-Server-Deployment-Guide.md)
- [Run Paths Catalog](./Run-Paths-Catalog.md)
- [Project Overview](../00-foundation/Project-Overview.md)

---

**Status**: Ready to implement after final server deployment testing

