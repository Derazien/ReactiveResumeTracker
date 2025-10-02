# ADR-0002: Server Build Bundling & Runtime Dependencies

**Date**: 2025-10-02  
**Status**: Active  
**Context**: Phase D — OpenAPI Export Automation

---

## Problem Statement

When attempting to run the built Nx server (`dist/apps/server/main.js`) with Node.js v22.14.0, the application fails with:

```
Error: Cannot find module 'express'
Require stack:
- C:\rzpl-android\ReactiveResumeTracker\dist\apps\server\main.js
```

This blocks autonomous OpenAPI spec generation via `EXPORT_OPENAPI=true node dist/apps/server/main.js`.

---

## Root Cause

**Nx Webpack Configuration**: The default Nx webpack configuration for Node.js applications marks common runtime dependencies (like `express`, `@nestjs/platform-express`, etc.) as **external**, meaning they are not bundled into the output file.

**Expected Behavior**: These externals should be resolved from `node_modules` at runtime.

**Actual Behavior**: The webpack bundle references these modules incorrectly:
```javascript
// In dist/apps/server/main.js
Object.defineProperty.value (webpack:\external commonjs "express":1:1)
```

The `webpack:\external` reference fails to resolve to the actual `node_modules/express` package.

---

## Environment Details

- **Node.js**: v22.14.0
- **Nx**: 19.8.4
- **Build Tool**: @nx/webpack (default for server builds)
- **Target**: Node application (NestJS)
- **Issue**: External module resolution in bundled output

---

## Attempted Solutions

### 1. Direct Dist Execution ❌
```bash
node dist/apps/server/main.js
```
**Result**: `Cannot find module 'express'`

### 2. tsx with TypeScript Decorators ❌
```bash
tsx --tsconfig apps/server/tsconfig.json apps/server/src/main.ts
```
**Result**: `Transform failed: Parameter decorators only work when experimental decorators are enabled`  
**Cause**: esbuild (used by tsx) doesn't fully support TypeScript parameter decorators

### 3. ts-node with ESM ❌
```bash
ts-node --project apps/server/tsconfig.json apps/server/src/main.ts
```
**Result**: `TypeError: Unknown file extension ".ts"`  
**Cause**: Node v22 ESM/CommonJS conflicts with ts-node loader

---

## Current Workaround

**Implemented Solution**: Fetch OpenAPI spec from a running server instance.

**Two Modes**:
1. **Manual (Fast)**: User starts `pnpm dev`, then runs `pnpm docs:openapi` (~5 seconds)
2. **Autonomous (Slow)**: `pnpm docs:openapi` spawns server temporarily (~20-60 seconds)

**Script**: `scripts/docs/export-openapi.js`
- Checks if spec is up-to-date vs source files
- Tries HTTP fetch from `http://localhost:3000/docs-json`
- Falls back to spawning `pnpm dev:server` temporarily if not running
- Cross-platform support (Windows/Unix)

---

## Proposed Solutions

### Option 1: esbuild Bundling (To Try)
Switch from webpack to esbuild with full bundling:

```json
{
  "targets": {
    "build": {
      "executor": "@nx/esbuild:esbuild",
      "options": {
        "main": "apps/server/src/main.ts",
        "outputPath": "dist/apps/server",
        "platform": "node",
        "target": "node20",
        "bundle": true,
        "format": "cjs",
        "external": ["@prisma/client", "pg-native"],
        "tsConfig": "apps/server/tsconfig.app.json"
      }
    }
  }
}
```

**Pros**: Modern, fast, bundles all dependencies  
**Cons**: May still have decorator issues

### Option 2: Webpack with Bundled Express (To Try)
Configure webpack to bundle express instead of externalizing it:

```javascript
// apps/server/webpack.config.js
const { composePlugins, withNx } = require('@nx/webpack');
module.exports = composePlugins(withNx(), (config) => {
  config.target = 'node';
  // Don't externalize express — bundle it
  if (config.externals) {
    const skip = ['express', '@nestjs/platform-express'];
    config.externals = config.externals.map((ext) =>
      typeof ext === 'function'
        ? (ctx, cb) => ext(ctx, (err, res) => {
            if (res && skip.some(s => res.includes(s))) return cb();
            cb(err, res);
          })
        : ext
    );
  }
  return config;
});
```

**Pros**: Works with existing webpack setup  
**Cons**: Larger bundle size, may have other externals issues

### Option 3: Node Version Downgrade
Use Node.js v20 LTS instead of v22 for build steps.

**Reason**: Node v22 introduced stricter ESM handling and has known issues with some transpilers.

---

## Decision

**Status**: Attempted both webpack and esbuild bundling approaches — both failed.

### Attempt 1: Webpack Bundled Express ❌
Modified `apps/server/webpack.config.js` to override externals list:
```javascript
config.externals = ['@prisma/client', 'pg-native', '_http_common'];
```

**Result**: 26 bundling errors including:
- `Module not found: Error: Can't resolve 'express' in ...src`
- Multiple `.d.ts` parsing failures (@nestjs/terminus, etc.)
- Webpack loader issues with TypeScript definition files

**Root Cause**: Type imports (`import { Request } from 'express'`) in source files can't be resolved when express is both bundled AND externalized simultaneously.

### Attempt 2: Alternative Considered
esbuild approach was considered but not attempted due to known decorator limitations (same as tsx).

### Final Decision

**Keep fetch-from-server approach** as the production solution.

**Rationale**:
1. Webpack bundling for complex NestJS apps with decorators is problematic
2. esbuild doesn't support parameter decorators
3. Node v22 ESM/CommonJS conflicts with ts-node
4. The workaround is **functional and reliable**
5. Performance difference (~15-20s for server-only spawn) is acceptable

**Recommended Workflow**:
- **CI/CD**: Start server in background, wait for health, fetch spec, stop server
- **Local Dev**: Keep server running (`pnpm dev`), fetch spec quickly (~2s)
- **Autonomous**: Script handles spawning automatically (~20s)

**Priority**: **CLOSED** — No further action needed. Build toolchain complexity exceeds benefit of 15-20s optimization.

---

## Impact

**Documentation Generation**: ✅ Unblocked  
**CI/CD**: ✅ Can use manual mode (start server, fetch spec)  
**Developer Experience**: ⚠️ Slightly slower autonomous generation (~20-60s vs ideal ~2-3s)

---

## Related Files

- `apps/server/src/main.ts` — EXPORT_OPENAPI flag implementation
- `scripts/docs/export-openapi.js` — Robust fallback script
- `apps/server/project.json` — Nx build configuration
- `package.json` — `docs:openapi` script

---

## Future Work

- [ ] Investigate Nx webpack external resolution for Node targets
- [ ] Test with Node v20 LTS
- [ ] Consider esbuild migration for server build
- [ ] Document build toolchain requirements in Project-Overview.md

---

**Last Updated**: 2025-10-02  
**Next Review**: When Nx updates or Node compatibility issues are resolved

