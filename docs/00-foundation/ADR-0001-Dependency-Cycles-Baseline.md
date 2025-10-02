# ADR-0001: Circular Dependencies Baseline and Remediation Plan

**Date**: 2025-10-02  
**Status**: Accepted  
**Context**: Phase C dependency analysis

---

## Context

During Phase C implementation (dependency mapping and documentation generation), we ran `dependency-cruiser` on the codebase and discovered **40 circular dependency violations** across three main areas:

1. **libs/ui**: 24 cycles through barrel exports
2. **apps/server**: 3 cycles between service modules
3. **apps/client/services/auth**: 13 cycles through axios imports

These cycles existed before Phase C and represent technical debt that needs systematic remediation. However, they do not currently cause runtime failures, so we can address them incrementally without breaking existing functionality.

---

## Decision

### Baseline and Prevention Strategy

1. **Capture Baseline**: Record current state with 40 circular dependencies in `docs/maps/depcruise-baseline.json`

2. **No New Cycles**: Implement CI check that **prevents new cycles** from being introduced while allowing existing ones

3. **Gradual Remediation**: Fix cycles incrementally in priority order without requiring a "big bang" refactor

4. **CI Enforcement**: PRs that introduce new cycles will fail; PRs that reduce cycles will be prioritized

### Cycle Categories

#### Category 1: libs/ui Barrel Export Cycles (24 cycles) — HIGH PRIORITY

**Pattern**:
```typescript
libs/ui/src/components/index.ts →
  libs/ui/src/components/[component].tsx →
  libs/ui/src/index.ts →
  libs/ui/src/components/index.ts
```

**Affected Components**:
- Resume section forms (awards, certificates, contact, education, experience, interests, languages, profiles, projects, publications, references, skills, summary, volunteering)
- UI components (url-input, custom-field)

**Root Cause**: Barrel export pattern where:
- `libs/ui/src/index.ts` exports everything from `libs/ui/src/components/index.ts`
- Individual components import from `libs/ui/src/index.ts` or re-import other components

**Remediation Strategy**:
1. Option A: Remove barrel exports, use direct imports
2. Option B: Split barrel into sub-barrels (components, forms, hooks)
3. Option C: Refactor component dependencies to break cycles

**Estimated Effort**: 2-3 hours  
**Risk**: Medium (may require consumer updates)

---

#### Category 2: apps/server Module Cycles (3 cycles) — MEDIUM PRIORITY

**Cycles**:
```typescript
1. content-matching.module.ts ↔ content-library.module.ts ↔ llm.module.ts
2. content-library.module.ts ↔ llm.module.ts
3. auth.module.ts ↔ user.module.ts
```

**Root Cause**: Circular service dependencies in NestJS modules

**Remediation Strategy**:
1. Use `forwardRef()` for circular NestJS module dependencies (temporary)
2. Refactor to introduce intermediary service or shared module
3. Apply dependency inversion principle

**Estimated Effort**: 1-2 hours  
**Risk**: Low (NestJS has patterns for this)

---

#### Category 3: apps/client Auth Service Cycles (13 cycles) — LOW PRIORITY

**Pattern**:
```typescript
apps/client/src/services/auth/index.ts →
  apps/client/src/services/auth/[auth-method].ts →
  apps/client/src/libs/axios.ts →
  apps/client/src/services/auth/index.ts
```

**Affected Methods**: login, logout, register, forgot-password, reset-password, verify-email, resend-verify-email, 2FA methods, etc.

**Root Cause**: Barrel export of auth services creates cycle with axios instance that depends on auth

**Remediation Strategy**:
1. Move axios instance initialization outside auth barrel
2. Use direct imports instead of barrel
3. Break auth/index.ts into smaller barrels

**Estimated Effort**: 1-2 hours  
**Risk**: Low (frontend refactor)

---

## Implementation

### Phase C.1: Baseline and CI Guard (Immediate)

✅ **Baseline Captured**: `docs/maps/depcruise-baseline.json`  
- 541 modules analyzed
- 1,256 dependencies
- 40 circular dependency errors
- 10 orphan warnings

✅ **CI Guard Script**: `scripts/audit/depcruise-compare-baseline.js`  
- Compares current state with baseline
- Fails if new cycles introduced
- Passes if cycles ≤ baseline

✅ **Update check:deps**: Modified to run validation + baseline comparison

### Phase C.2: TypeScript Configuration Fix (Immediate)

To unblock TypeDoc generation:
1. Add `"jsx": "react-jsx"` to tsconfig.base.json
2. Ensure `"paths"` resolves `@reactive-resume/*`
3. Temporarily exclude problematic components from TypeDoc if needed

### Phase C.3: Orphan Remediation (Immediate)

10 orphaned modules identified - triage:
- Move truly unused files to `_scratch/legacy/`
- Add `@deprecated` JSDoc for intentionally unused but kept files
- Connect orphans if they should be used

### Phase C.4: Gradual Cycle Remediation (Future PRs)

**Priority Order**:
1. libs/ui cycles (highest impact, 24 cycles)
2. apps/server cycles (3 cycles, affects backend modules)
3. apps/client auth cycles (13 cycles, frontend only)

**Success Criteria**:
- Each PR reduces cycle count by ≥1
- No PR introduces new cycles (CI enforced)
- Target: 0 cycles within 3-4 PRs

---

## Consequences

### Positive
- ✅ Technical debt made visible and measured
- ✅ Prevents new cycles from being introduced
- ✅ Allows incremental remediation without breaking changes
- ✅ CI enforcement ensures no regression
- ✅ Clear remediation roadmap

### Negative
- ⚠️ TypeDoc generation may have limitations until cycles fixed
- ⚠️ Some manual documentation required in interim
- ⚠️ Developers need to be aware of cycle restrictions

### Neutral
- Existing functionality unaffected (cycles don't cause runtime errors currently)
- Code quality improvements deferred but planned

---

## Alternatives Considered

### Alternative 1: Fix All Cycles Immediately
**Rejected because**: Too risky; could break existing functionality; requires extensive testing; blocks Phase C delivery

### Alternative 2: Ignore Cycles
**Rejected because**: Violates repository stewardship rules; makes codebase harder to maintain; prevents proper dependency analysis

### Alternative 3: Disable Cycle Detection
**Rejected because**: Defeats purpose of dependency cruiser; allows technical debt to grow unchecked

---

## Orphaned Modules Remediation (2025-10-02)

During analysis, 10 modules were flagged as orphans. Remediation actions:

**Moved to _scratch/legacy/orphaned-2025-10-02/ (2 files)**:
- `apps/server/src/llm/company-research.service.ts` — Duplicate (exists in apps/server/src/company/)
- `apps/client/src/stores/job-application.ts` — Unused Zustand store

**Kept as False Positives (8 files)**:
- `libs/parser/src/interfaces/parser.ts` — Interface, used via type imports
- `apps/client/src/services/job-application/generate-interview-questions.ts` — Dynamic usage
- `apps/client/src/services/automation.ts` — Dynamic usage
- `apps/client/src/constants/llm.ts` — Constants, tree-shaken
- `apps/client/src/constants/colors.ts` — Constants, tree-shaken
- `apps/client/src/components/brand-icon.tsx` — Conditional rendering
- `apps/client/public/scripts/initialize-theme.js` — Loaded in HTML
- `apps/artboard/src/types/template.ts` — Type-only imports

---

## Success Metrics

### Immediate (Phase C)
- [x] Baseline captured with 40 cycles
- [ ] CI guard prevents new cycles
- [ ] TypeDoc generates (possibly with exclusions)
- [ ] OpenAPI specification exported
- [ ] Dependency graph visualized

### Short-term (Next 2 weeks)
- [ ] libs/ui cycles reduced to 0
- [ ] apps/server cycles reduced to 0
- [ ] apps/client auth cycles reduced to 0

### Long-term (Next Month)
- [ ] All 40 cycles resolved
- [ ] No exclusions needed for TypeDoc
- [ ] Full automated docs generation working
- [ ] CI enforcing zero cycles

---

## References

- Baseline: `docs/maps/depcruise-baseline.json`
- CI Guard: `scripts/audit/depcruise-compare-baseline.js`
- Dependency Cruiser Config: `.dependency-cruiser.js`
- Related: Phase C documentation generation tasks

---

**Next Steps**:
1. Implement CI baseline comparison
2. Fix TypeScript config for TypeDoc
3. Triage orphaned modules
4. Generate Phase C artifacts
5. Create remediation issues/PRs for each cycle category

