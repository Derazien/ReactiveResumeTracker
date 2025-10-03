# Documentation Merge Sweep Report

**Generated**: 2025-10-02T16:05:52.633Z  
**Purpose**: Identify deprecated references and missing canonical command cross-references

---

## Summary

- **Files Scanned**: 371
- **Deprecated References**: 223
- **Missing Cross-References**: 65
- **Total Issues**: 288

---

## ⚠️ Deprecated File References

The following documentation still references deprecated files that have been moved to `_scratch/`:

| File | Line | Deprecated Reference | Context |
|------|------|---------------------|---------|
| `CLEAN_SCRIPT_ORGANIZATION.md` | 71 | `docker-compose.skyvern.yml` | #### **`docker-compose.skyvern.yml`** (Existing) |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 66 | `docker-compose-complete-stack.yml` | #### **`docker-compose-complete-stack.yml`** |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 183 | `docker-compose-complete-stack.yml` | git add docker-compose-complete-stack.yml       # Full Do... |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 61 | `docker-compose-reactiveresume-only.yml` | #### **`docker-compose-reactiveresume-only.yml`** |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 182 | `docker-compose-reactiveresume-only.yml` | git add docker-compose-reactiveresume-only.yml  # Lightwe... |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 36 | `local-setup-complete-stack.ps1` | #### **`local-setup-complete-stack.ps1`** 🚀 |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 171 | `local-setup-complete-stack.ps1` | 2. **Automation testing**: `local-setup-complete-stack.ps... |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 185 | `local-setup-complete-stack.ps1` | git add local-setup-complete-stack.ps1          # Windows... |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 29 | `local-setup-reactiveresume-only.ps1` | #### **`local-setup-reactiveresume-only.ps1`** ⭐ |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 118 | `local-setup-reactiveresume-only.ps1` | .\local-setup-reactiveresume-only.ps1 |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 127 | `local-setup-reactiveresume-only.ps1` | .\local-setup-reactiveresume-only.ps1 -Status |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 130 | `local-setup-reactiveresume-only.ps1` | .\local-setup-reactiveresume-only.ps1 -Stop |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 170 | `local-setup-reactiveresume-only.ps1` | 1. **Daily development**: `local-setup-reactiveresume-onl... |
| `CLEAN_SCRIPT_ORGANIZATION.md` | 184 | `local-setup-reactiveresume-only.ps1` | git add local-setup-reactiveresume-only.ps1     # Windows... |
| `COMMIT_ORGANIZATION_PLAN.md` | 116 | `docker-compose.skyvern.yml` | M docker-compose.skyvern.yml        # Skyvern service con... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 115 | `docker-compose.skyvern.yml` | ### **`docker-compose.skyvern.yml`** 🤖 (Existing) |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 204 | `docker-compose.skyvern.yml` | └── docker-compose.skyvern.yml (existing, works standalone) |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 207 | `docker-compose.skyvern.yml` | └── Use docker-compose.skyvern.yml to add to existing Rea... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 235 | `docker-compose.skyvern.yml` | | **Add Automation** | `docker-compose.skyvern.yml` | Sky... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 266 | `docker-compose.skyvern.yml` | - ✅ **docker-compose.skyvern.yml** (useful for adding aut... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 275 | `docker-compose.skyvern.yml` | - **Automation only**: Use `docker-compose.skyvern.yml` |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 103 | `docker-compose-complete-stack.yml` | ### **`docker-compose-complete-stack.yml`** 🤖 |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 126 | `docker-compose-complete-stack.yml` | - **Note**: Similar to scripts/docker/docker-compose-comp... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 219 | `docker-compose-complete-stack.yml` | └── scripts/docker/docker-compose-complete-stack.yml |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 95 | `docker-compose-reactiveresume-only.yml` | ### **`docker-compose-reactiveresume-only.yml`** ⚡ |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 195 | `docker-compose-reactiveresume-only.yml` | └── scripts/docker/docker-compose-reactiveresume-only.yml |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 198 | `docker-compose-reactiveresume-only.yml` | └── scripts/docker/docker-compose-reactiveresume-only.yml |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 9 | `start-local.ps1` | ### **`start-local.ps1`** 🚀 |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 16 | `start-local.ps1` | .\start-local.ps1                # ReactiveResume only |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 17 | `start-local.ps1` | .\start-local.ps1 -Full          # Complete automation stack |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 18 | `start-local.ps1` | .\start-local.ps1 -Status        # Check status |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 19 | `start-local.ps1` | .\start-local.ps1 -Stop          # Stop all |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 189 | `start-local.ps1` | ├── start-local.ps1 (default mode) |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 213 | `start-local.ps1` | ├── start-local.ps1 -Full |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 231 | `start-local.ps1` | | **Quick Development** | `start-local.ps1` | ReactiveRes... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 232 | `start-local.ps1` | | **Full Local Testing** | `start-local.ps1 -Full` | Ever... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 251 | `start-local.ps1` | .\start-local.ps1 -Status   # Local Windows services |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 256 | `start-local.ps1` | .\start-local.ps1 -Restart  # Local restart |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 264 | `start-local.ps1` | - ✅ **Root launchers** (start-local.ps1, deploy-server.sh) |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 273 | `start-local.ps1` | - **Development**: Use `start-local.ps1` (replaces your c... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 22 | `deploy-server.sh` | ### **`deploy-server.sh`** 🌐 |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 29 | `deploy-server.sh` | ./deploy-server.sh               # Complete automation em... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 30 | `deploy-server.sh` | ./deploy-server.sh --lite        # ReactiveResume only |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 193 | `deploy-server.sh` | ├── deploy-server.sh --lite |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 217 | `deploy-server.sh` | ├── deploy-server.sh (default mode) |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 233 | `deploy-server.sh` | | **Simple Server** | `deploy-server.sh --lite` | Reactiv... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 234 | `deploy-server.sh` | | **Production Server** | `deploy-server.sh` | Complete a... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 264 | `deploy-server.sh` | - ✅ **Root launchers** (start-local.ps1, deploy-server.sh) |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 274 | `deploy-server.sh` | - **Server**: Use `deploy-server.sh` (complete automation... |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 47 | `local-setup-complete-stack.ps1` | ### **`local-setup-complete-stack.ps1`** 💪 |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 214 | `local-setup-complete-stack.ps1` | └── scripts/development/local-setup-complete-stack.ps1 |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 37 | `local-setup-reactiveresume-only.ps1` | ### **`local-setup-reactiveresume-only.ps1`** ⚡ |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | 190 | `local-setup-reactiveresume-only.ps1` | └── scripts/development/local-setup-reactiveresume-only.ps1 |
| `DEPLOYMENT_GUIDE.md` | 7 | `deploy-server.sh` | ./deploy-server.sh |
| `DEPLOYMENT_GUIDE.md` | 16 | `deploy-server.sh` | ./deploy-server.sh |
| `DEPLOYMENT_GUIDE.md` | 19 | `deploy-server.sh` | ./deploy-server.sh --lite |
| `DEPLOYMENT_GUIDE.md` | 25 | `deploy-server.sh` | ./deploy-server.sh --hard-reset |
| `DEPLOYMENT_GUIDE.md` | 28 | `deploy-server.sh` | ./deploy-server.sh --update |
| `DEPLOYMENT_GUIDE.md` | 31 | `deploy-server.sh` | ./deploy-server.sh --lite --hard-reset |
| `DEPLOYMENT_GUIDE.md` | 34 | `deploy-server.sh` | ./deploy-server.sh --lite --update |
| `DEPLOYMENT_GUIDE.md` | 39 | `deploy-server.sh` | ./deploy-server.sh --help |
| `DEPLOYMENT_GUIDE.md` | 54 | `deploy-server.sh` | deploy-server.sh (MAIN LAUNCHER) |
| `DEPLOYMENT_GUIDE.md` | 63 | `deploy-server.sh` | | **Normal deployment** | `./deploy-server.sh` | |
| `DEPLOYMENT_GUIDE.md` | 64 | `deploy-server.sh` | | **Lightweight deployment** | `./deploy-server.sh --lite` | |
| `DEPLOYMENT_GUIDE.md` | 65 | `deploy-server.sh` | | **Fix Docker conflicts** | `./deploy-server.sh --hard-r... |
| `DEPLOYMENT_GUIDE.md` | 66 | `deploy-server.sh` | | **Update to latest images** | `./deploy-server.sh --upd... |
| `DEPLOYMENT_GUIDE.md` | 67 | `deploy-server.sh` | | **Complete reset + update** | `./deploy-server.sh --har... |
| `DEPLOYMENT_GUIDE.md` | 71 | `deploy-server.sh` | 1. **Always use `deploy-server.sh`** - it's the main entr... |
| `DEPLOYMENT_GUIDE.md` | 81 | `deploy-server.sh` | ./deploy-server.sh --hard-reset |
| `DEPLOYMENT_GUIDE.md` | 87 | `deploy-server.sh` | ./deploy-server.sh --update |
| `DEPLOYMENT_GUIDE.md` | 92 | `deploy-server.sh` | - Check script help: `./deploy-server.sh --help` |
| `DEPLOYMENT_INSTRUCTIONS.md` | 164 | `start-local.ps1` | .\start-local.ps1 |
| `DEPLOYMENT_INSTRUCTIONS.md` | 167 | `start-local.ps1` | .\start-local.ps1 -Full |
| `DEPLOYMENT_INSTRUCTIONS.md` | 46 | `deploy-server.sh` | chmod +x deploy-server.sh |
| `DEPLOYMENT_INSTRUCTIONS.md` | 47 | `deploy-server.sh` | ./deploy-server.sh |
| `docs\50-ops\Canonicalization-Actions.md` | 14 | `start-local.ps1` | ### `start-local.ps1` |
| `docs\50-ops\Canonicalization-Actions.md` | 19 | `deploy-server.sh` | ### `deploy-server.sh` |
| `docs\50-ops\Canonicalization-Actions.md` | 24 | `local-setup-complete-stack.ps1` | ### `scripts\development\local-setup-complete-stack.ps1` |
| `docs\50-ops\Canonicalization-Actions.md` | 29 | `local-setup-reactiveresume-only.ps1` | ### `scripts\development\local-setup-reactiveresume-only.... |
| `docs\50-ops\Docker-Services.md` | 552 | `docker-compose.skyvern.yml` | ❌ `docker-compose.skyvern.yml` → Use `unified-docker-comp... |
| `docs\50-ops\Docker-Services.md` | 553 | `docker-compose-complete-stack.yml` | ❌ `scripts/docker/docker-compose-complete-stack.yml` → Us... |
| `docs\50-ops\Docker-Services.md` | 554 | `docker-compose-reactiveresume-only.yml` | ❌ `scripts/docker/docker-compose-reactiveresume-only.yml`... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 211 | `docker-compose.skyvern.yml` | - `docker-compose.skyvern.yml` (5 services) |
| `docs\50-ops\Phase-B-Approval-Package.md` | 212 | `docker-compose-complete-stack.yml` | - `scripts/docker/docker-compose-complete-stack.yml` (10 ... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 213 | `docker-compose-reactiveresume-only.yml` | - `scripts/docker/docker-compose-reactiveresume-only.yml`... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 113 | `start-local.ps1` | | `start-local.ps1` | 60 lines | 5 lines | -55 | `pnpm de... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 132 | `start-local.ps1` | ### Example: start-local.ps1 |
| `docs\50-ops\Phase-B-Approval-Package.md` | 143 | `start-local.ps1` | PS> .\start-local.ps1 |
| `docs\50-ops\Phase-B-Approval-Package.md` | 146 | `start-local.ps1` | Script: C:\...\start-local.ps1 |
| `docs\50-ops\Phase-B-Approval-Package.md` | 229 | `start-local.ps1` | - RP0124: `start-local.ps1` |
| `docs\50-ops\Phase-B-Approval-Package.md` | 249 | `start-local.ps1` | - [ ] Test `start-local.ps1` on Windows |
| `docs\50-ops\Phase-B-Approval-Package.md` | 274 | `start-local.ps1` | start-local.ps1                                    |  63 +-- |
| `docs\50-ops\Phase-B-Approval-Package.md` | 337 | `start-local.ps1` | - Shimmed 6 convenience scripts (start-local.ps1, deploy-... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 114 | `deploy-server.sh` | | `deploy-server.sh` | 147 lines | 6 lines | -141 | `dock... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 230 | `deploy-server.sh` | - RP0125: `deploy-server.sh` |
| `docs\50-ops\Phase-B-Approval-Package.md` | 250 | `deploy-server.sh` | - [ ] Test `deploy-server.sh` on Linux |
| `docs\50-ops\Phase-B-Approval-Package.md` | 267 | `deploy-server.sh` | deploy-server.sh                                   | 142 ... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 337 | `deploy-server.sh` | - Shimmed 6 convenience scripts (start-local.ps1, deploy-... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 115 | `local-setup-complete-stack.ps1` | | `scripts/development/local-setup-complete-stack.ps1` | ... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 231 | `local-setup-complete-stack.ps1` | - RP0113: `local-setup-complete-stack.ps1` |
| `docs\50-ops\Phase-B-Approval-Package.md` | 270 | `local-setup-complete-stack.ps1` | scripts/development/local-setup-complete-stack.ps1 | 218 ... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 116 | `local-setup-reactiveresume-only.ps1` | | `scripts/development/local-setup-reactiveresume-only.ps... |
| `docs\50-ops\Phase-B-Approval-Package.md` | 232 | `local-setup-reactiveresume-only.ps1` | - RP0114: `local-setup-reactiveresume-only.ps1` |
| `docs\50-ops\Phase-B-Approval-Package.md` | 271 | `local-setup-reactiveresume-only.ps1` | scripts/development/local-setup-reactiveresume-only.ps1 |... |
| `docs\50-ops\Phase-B-Final-Summary.md` | 125 | `docker-compose.skyvern.yml` | | `docker-compose.skyvern.yml` | ✅ Parity OK | 0 | 0 | |
| `docs\50-ops\Phase-B-Final-Summary.md` | 126 | `docker-compose-complete-stack.yml` | | `scripts/docker/docker-compose-complete-stack.yml` | ✅ ... |
| `docs\50-ops\Phase-B-Final-Summary.md` | 127 | `docker-compose-reactiveresume-only.yml` | | `scripts/docker/docker-compose-reactiveresume-only.yml`... |
| `docs\50-ops\Phase-B-Final-Summary.md` | 181 | `start-local.ps1` | - ✅ 6 shimmed scripts (start-local.ps1, deploy-server.sh,... |
| `docs\50-ops\Phase-B-Final-Summary.md` | 286 | `start-local.ps1` | - start-local.ps1 |
| `docs\50-ops\Phase-B-Final-Summary.md` | 360 | `start-local.ps1` | start-local.ps1, deploy-server.sh |
| `docs\50-ops\Phase-B-Final-Summary.md` | 181 | `deploy-server.sh` | - ✅ 6 shimmed scripts (start-local.ps1, deploy-server.sh,... |
| `docs\50-ops\Phase-B-Final-Summary.md` | 287 | `deploy-server.sh` | - deploy-server.sh |
| `docs\50-ops\Phase-B-Final-Summary.md` | 360 | `deploy-server.sh` | start-local.ps1, deploy-server.sh |
| `docs\50-ops\Phase-B-Final-Summary.md` | 288 | `local-setup-complete-stack.ps1` | - scripts/development/local-setup-complete-stack.ps1 |
| `docs\50-ops\Phase-B-Final-Summary.md` | 289 | `local-setup-reactiveresume-only.ps1` | - scripts/development/local-setup-reactiveresume-only.ps1 |
| `docs\50-ops\Phase-B-Summary.md` | 44 | `docker-compose.skyvern.yml` | - **Deprecated (20)**: Services from old compose files (d... |
| `docs\50-ops\Phase-B-Summary.md` | 117 | `docker-compose.skyvern.yml` | - ❌ `docker-compose.skyvern.yml` → Use `unified-docker-co... |
| `docs\50-ops\Phase-B-Summary.md` | 118 | `docker-compose-complete-stack.yml` | - ❌ `scripts/docker/docker-compose-complete-stack.yml` → ... |
| `docs\50-ops\Phase-B-Summary.md` | 119 | `docker-compose-reactiveresume-only.yml` | - ❌ `scripts/docker/docker-compose-reactiveresume-only.ym... |
| `docs\50-ops\Phase-B-Summary.md` | 53 | `start-local.ps1` | - **Shim (2)**: start-local.ps1, deploy-server.sh |
| `docs\50-ops\Phase-B-Summary.md` | 70 | `start-local.ps1` | | `start-local.ps1` | `pnpm dev` | Start local developmen... |
| `docs\50-ops\Phase-B-Summary.md` | 99 | `start-local.ps1` | - ✅ `start-local.ps1` → Shim to `pnpm dev` |
| `docs\50-ops\Phase-B-Summary.md` | 187 | `start-local.ps1` | - [ ] Test `start-local.ps1` shim on Windows |
| `docs\50-ops\Phase-B-Summary.md` | 53 | `deploy-server.sh` | - **Shim (2)**: start-local.ps1, deploy-server.sh |
| `docs\50-ops\Phase-B-Summary.md` | 71 | `deploy-server.sh` | | `deploy-server.sh` | `docker compose -f self-hosted-inf... |
| `docs\50-ops\Phase-B-Summary.md` | 100 | `deploy-server.sh` | - ✅ `deploy-server.sh` → Shim to `docker compose -f self-... |
| `docs\50-ops\Phase-B-Summary.md` | 188 | `deploy-server.sh` | - [ ] Test `deploy-server.sh` shim on Linux |
| `docs\50-ops\Phase-B-Summary.md` | 72 | `local-setup-complete-stack.ps1` | | `scripts/development/local-setup-complete-stack.ps1` | ... |
| `docs\50-ops\Phase-B-Summary.md` | 101 | `local-setup-complete-stack.ps1` | - ✅ `scripts/development/local-setup-complete-stack.ps1` ... |
| `docs\50-ops\Phase-B-Summary.md` | 73 | `local-setup-reactiveresume-only.ps1` | | `scripts/development/local-setup-reactiveresume-only.ps... |
| `docs\50-ops\Phase-B-Summary.md` | 102 | `local-setup-reactiveresume-only.ps1` | - ✅ `scripts/development/local-setup-reactiveresume-only.... |
| `docs\50-ops\Phase-C-Complete-Summary.md` | 83 | `docker-compose.skyvern.yml` | - ✅ `docker-compose.skyvern.yml` → `_scratch/compose/` |
| `docs\50-ops\Phase-C-Complete-Summary.md` | 229 | `docker-compose.skyvern.yml` | - `docker-compose.skyvern.yml` → `_scratch/compose/` |
| `docs\50-ops\Phase-C-Complete-Summary.md` | 84 | `docker-compose-complete-stack.yml` | - ✅ `scripts/docker/docker-compose-complete-stack.yml` → ... |
| `docs\50-ops\Phase-C-Complete-Summary.md` | 230 | `docker-compose-complete-stack.yml` | - `scripts/docker/docker-compose-complete-stack.yml` → `_... |
| `docs\50-ops\Phase-C-Complete-Summary.md` | 85 | `docker-compose-reactiveresume-only.yml` | - ✅ `scripts/docker/docker-compose-reactiveresume-only.ym... |
| `docs\50-ops\Phase-C-Complete-Summary.md` | 231 | `docker-compose-reactiveresume-only.yml` | - `scripts/docker/docker-compose-reactiveresume-only.yml`... |
| `docs\50-ops\Phase-C-Diffs-Summary.md` | 277 | `docker-compose.skyvern.yml` | - docker-compose -f docker-compose.skyvern.yml up -d |
| `docs\50-ops\Phase-C-Diffs-Summary.md` | 288 | `docker-compose.skyvern.yml` | - `docker-compose.skyvern.yml` |
| `docs\50-ops\Phase-C-Diffs-Summary.md` | 289 | `docker-compose-complete-stack.yml` | - `scripts/docker/docker-compose-complete-stack.yml` |
| `docs\50-ops\Phase-C-Diffs-Summary.md` | 290 | `docker-compose-reactiveresume-only.yml` | - `scripts/docker/docker-compose-reactiveresume-only.yml` |
| `docs\50-ops\READY_FOR_COMMIT.md` | 38 | `docker-compose.skyvern.yml` | - docker-compose.skyvern.yml → unified ✅ |
| `docs\50-ops\READY_FOR_COMMIT.md` | 39 | `docker-compose-complete-stack.yml` | - scripts/docker/docker-compose-complete-stack.yml → unif... |
| `docs\50-ops\READY_FOR_COMMIT.md` | 40 | `docker-compose-reactiveresume-only.yml` | - scripts/docker/docker-compose-reactiveresume-only.yml →... |
| `docs\50-ops\READY_FOR_COMMIT.md` | 84 | `start-local.ps1` | - start-local.ps1 (shimmed - 60 → 5 lines) |
| `docs\50-ops\READY_FOR_COMMIT.md` | 85 | `deploy-server.sh` | - deploy-server.sh (shimmed - 147 → 6 lines) |
| `docs\50-ops\READY_FOR_COMMIT.md` | 86 | `local-setup-complete-stack.ps1` | - scripts/development/local-setup-complete-stack.ps1 (shi... |
| `docs\50-ops\READY_FOR_COMMIT.md` | 87 | `local-setup-reactiveresume-only.ps1` | - scripts/development/local-setup-reactiveresume-only.ps1... |
| `docs\50-ops\Run-Paths-Catalog.md` | 196 | `docker-compose.skyvern.yml` | - **RP0131**: `-f docker-compose.skyvern.yml down` (docs-... |
| `docs\50-ops\Run-Paths-Catalog.md` | 197 | `docker-compose.skyvern.yml` | - **RP0132**: `-f docker-compose.skyvern.yml up -d` (docs... |
| `docs\50-ops\Run-Paths-Catalog.md` | 199 | `docker-compose.skyvern.yml` | - **RP0134**: `-f docker-compose.skyvern.yml up -d` (docs... |
| `docs\50-ops\Run-Paths-Catalog.md` | 253 | `docker-compose.skyvern.yml` | - **RP0036**: `skyvern-postgres` (docker-service) - docke... |
| `docs\50-ops\Run-Paths-Catalog.md` | 254 | `docker-compose.skyvern.yml` | - **RP0037**: `skyvern-redis` (docker-service) - docker-c... |
| `docs\50-ops\Run-Paths-Catalog.md` | 255 | `docker-compose.skyvern.yml` | - **RP0038**: `skyvern` (docker-service) - docker-compose... |
| `docs\50-ops\Run-Paths-Catalog.md` | 256 | `docker-compose.skyvern.yml` | - **RP0039**: `skyvern-ui` (docker-service) - docker-comp... |
| `docs\50-ops\Run-Paths-Catalog.md` | 279 | `docker-compose.skyvern.yml` | - **RP0035**: `services` (docker-service) - docker-compos... |
| `docs\50-ops\Run-Paths-Catalog.md` | 280 | `docker-compose.skyvern.yml` | - **RP0040**: `skyvern_postgres_data` (docker-service) - ... |
| `docs\50-ops\Run-Paths-Catalog.md` | 281 | `docker-compose.skyvern.yml` | - **RP0041**: `skyvern_chrome_data` (docker-service) - do... |
| `docs\50-ops\Run-Paths-Catalog.md` | 257 | `docker-compose-complete-stack.yml` | - **RP0086**: `postgres-main` (docker-service) - scripts/... |
| `docs\50-ops\Run-Paths-Catalog.md` | 258 | `docker-compose-complete-stack.yml` | - **RP0087**: `redis` (docker-service) - scripts/docker/d... |
| `docs\50-ops\Run-Paths-Catalog.md` | 259 | `docker-compose-complete-stack.yml` | - **RP0088**: `minio` (docker-service) - scripts/docker/d... |
| `docs\50-ops\Run-Paths-Catalog.md` | 260 | `docker-compose-complete-stack.yml` | - **RP0089**: `chrome` (docker-service) - scripts/docker/... |
| `docs\50-ops\Run-Paths-Catalog.md` | 261 | `docker-compose-complete-stack.yml` | - **RP0090**: `skyvern-postgres` (docker-service) - scrip... |
| `docs\50-ops\Run-Paths-Catalog.md` | 262 | `docker-compose-complete-stack.yml` | - **RP0091**: `skyvern-redis` (docker-service) - scripts/... |
| `docs\50-ops\Run-Paths-Catalog.md` | 263 | `docker-compose-complete-stack.yml` | - **RP0092**: `skyvern` (docker-service) - scripts/docker... |
| `docs\50-ops\Run-Paths-Catalog.md` | 264 | `docker-compose-complete-stack.yml` | - **RP0093**: `skyvern-ui` (docker-service) - scripts/doc... |
| `docs\50-ops\Run-Paths-Catalog.md` | 265 | `docker-compose-complete-stack.yml` | - **RP0094**: `ollama` (docker-service) - scripts/docker/... |
| `docs\50-ops\Run-Paths-Catalog.md` | 300 | `docker-compose-complete-stack.yml` | - **RP0085**: `services` (docker-service) - scripts/docke... |
| `docs\50-ops\Run-Paths-Catalog.md` | 301 | `docker-compose-complete-stack.yml` | - **RP0095**: `default` (docker-service) - scripts/docker... |
| `docs\50-ops\Run-Paths-Catalog.md` | 266 | `docker-compose-reactiveresume-only.yml` | - **RP0097**: `postgres` (docker-service) - scripts/docke... |
| `docs\50-ops\Run-Paths-Catalog.md` | 267 | `docker-compose-reactiveresume-only.yml` | - **RP0098**: `redis` (docker-service) - scripts/docker/d... |
| `docs\50-ops\Run-Paths-Catalog.md` | 268 | `docker-compose-reactiveresume-only.yml` | - **RP0099**: `minio` (docker-service) - scripts/docker/d... |
| `docs\50-ops\Run-Paths-Catalog.md` | 269 | `docker-compose-reactiveresume-only.yml` | - **RP0100**: `chrome` (docker-service) - scripts/docker/... |
| `docs\50-ops\Run-Paths-Catalog.md` | 302 | `docker-compose-reactiveresume-only.yml` | - **RP0096**: `services` (docker-service) - scripts/docke... |
| `docs\50-ops\Run-Paths-Catalog.md` | 303 | `docker-compose-reactiveresume-only.yml` | - **RP0101**: `postgres_data` (docker-service) - scripts/... |
| `docs\50-ops\Run-Paths-Catalog.md` | 304 | `docker-compose-reactiveresume-only.yml` | - **RP0102**: `redis_data` (docker-service) - scripts/doc... |
| `docs\50-ops\Run-Paths-Catalog.md` | 305 | `docker-compose-reactiveresume-only.yml` | - **RP0103**: `minio_data` (docker-service) - scripts/doc... |
| `docs\50-ops\Run-Paths-Catalog.md` | 306 | `docker-compose-reactiveresume-only.yml` | - **RP0104**: `default` (docker-service) - scripts/docker... |
| `docs\50-ops\Run-Paths-Catalog.md` | 151 | `start-local.ps1` | | RP0124 | `start-local.ps1` | root-script-ps1 | shim | -... |
| `docs\50-ops\Run-Paths-Catalog.md` | 315 | `start-local.ps1` | - **RP0124**: `start-local.ps1` (root-script-ps1) - . |
| `docs\50-ops\Run-Paths-Catalog.md` | 152 | `deploy-server.sh` | | RP0125 | `deploy-server.sh` | root-script-sh | shim | -... |
| `docs\50-ops\Run-Paths-Catalog.md` | 316 | `deploy-server.sh` | - **RP0125**: `deploy-server.sh` (root-script-sh) - . |
| `docs\50-ops\Run-Paths-Catalog.md` | 140 | `local-setup-complete-stack.ps1` | | RP0113 | `local-setup-complete-stack.ps1` | script-ps1 ... |
| `docs\50-ops\Run-Paths-Catalog.md` | 311 | `local-setup-complete-stack.ps1` | - **RP0113**: `local-setup-complete-stack.ps1` (script-ps... |
| `docs\50-ops\Run-Paths-Catalog.md` | 312 | `local-setup-reactiveresume-only.ps1` | - **RP0114**: `local-setup-reactiveresume-only.ps1` (scri... |
| `docs\50-ops\Smoke-Test-Results.md` | 131 | `docker-compose.skyvern.yml` | | `docker-compose.skyvern.yml` | `unified-docker-compose.... |
| `docs\50-ops\Smoke-Test-Results.md` | 132 | `docker-compose-complete-stack.yml` | | `scripts/docker/docker-compose-complete-stack.yml` | `u... |
| `docs\50-ops\Smoke-Test-Results.md` | 133 | `docker-compose-reactiveresume-only.yml` | | `scripts/docker/docker-compose-reactiveresume-only.yml`... |
| `docs\50-ops\Triage-Complete-Summary.md` | 50 | `local-setup-complete-stack.ps1` | | RP0113 | local-setup-complete-stack.ps1 | script-ps1   ... |
| `docs\automation\SETUP_AND_TROUBLESHOOTING.md` | 88 | `docker-compose.skyvern.yml` | The `docker-compose.skyvern.yml` file defines: |
| `docs\automation\SETUP_AND_TROUBLESHOOTING.md` | 132 | `docker-compose.skyvern.yml` | docker-compose -f docker-compose.skyvern.yml down |
| `docs\automation\SETUP_AND_TROUBLESHOOTING.md` | 190 | `docker-compose.skyvern.yml` | # Solution 3: Check volume mappings in docker-compose.sky... |
| `docs\automation\SETUP_AND_TROUBLESHOOTING.md` | 213 | `docker-compose.skyvern.yml` | docker-compose -f docker-compose.skyvern.yml down |
| `docs\automation\SETUP_AND_TROUBLESHOOTING.md` | 283 | `docker-compose.skyvern.yml` | Edit `docker-compose.skyvern.yml`: |
| `docs\automation\SETUP_AND_TROUBLESHOOTING.md` | 355 | `docker-compose.skyvern.yml` | docker-compose -f docker-compose.skyvern.yml pull |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | 13 | `docker-compose.skyvern.yml` | ├── docker-compose.skyvern.yml          ✅ (Our custom int... |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | 64 | `docker-compose.skyvern.yml` | ├── docker-compose.skyvern.yml           ← Our integratio... |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | 74 | `docker-compose.skyvern.yml` | Looking at `docker-compose.skyvern.yml` volumes: |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | 99 | `docker-compose.skyvern.yml` | - ✅ **`docker-compose.skyvern.yml`** - Our integration co... |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | 134 | `docker-compose.skyvern.yml` | Update `docker-compose.skyvern.yml`: |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | 167 | `docker-compose.skyvern.yml` | ├── docker-compose.skyvern.yml           ← Fixed volume m... |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | 191 | `docker-compose.skyvern.yml` | 2. **FIX** Docker volume mappings in `docker-compose.skyv... |
| `docs\AUTOMATION_INTEGRATION_SUMMARY.md` | 29 | `docker-compose.skyvern.yml` | - **File**: `docker-compose.skyvern.yml` |
| `docs\AUTOMATION_INTEGRATION_SUMMARY.md` | 76 | `docker-compose.skyvern.yml` | ├── docker-compose.skyvern.yml                           ... |
| `docs\AUTOMATION_INTEGRATION_SUMMARY.md` | 158 | `docker-compose.skyvern.yml` | 4. **docker-compose.skyvern.yml** - Scale with additional... |
| `docs\AUTOMATION_INTEGRATION_SUMMARY.md` | 174 | `docker-compose.skyvern.yml` | - `docker-compose.skyvern.yml` - Docker configuration |
| `SCRIPT_CLEANUP_PLAN.md` | 42 | `docker-compose.skyvern.yml` | docker-compose.skyvern.yml              # Skyvern-only se... |
| `SCRIPT_CLEANUP_PLAN.md` | 82 | `docker-compose.skyvern.yml` | │   └── docker-compose.skyvern.yml |
| `SCRIPT_CLEANUP_PLAN.md` | 41 | `docker-compose-complete-stack.yml` | docker-compose-complete-stack.yml       # Full Docker aut... |
| `SCRIPT_CLEANUP_PLAN.md` | 81 | `docker-compose-complete-stack.yml` | │   ├── docker-compose-complete-stack.yml |
| `SCRIPT_CLEANUP_PLAN.md` | 40 | `docker-compose-reactiveresume-only.yml` | docker-compose-reactiveresume-only.yml  # Lightweight Doc... |
| `SCRIPT_CLEANUP_PLAN.md` | 80 | `docker-compose-reactiveresume-only.yml` | │   ├── docker-compose-reactiveresume-only.yml |
| `SCRIPT_CLEANUP_PLAN.md` | 96 | `start-local.ps1` | start-local.ps1          # Wrapper for local development |
| `SCRIPT_CLEANUP_PLAN.md` | 35 | `local-setup-complete-stack.ps1` | local-setup-complete-stack.ps1          # Full local auto... |
| `SCRIPT_CLEANUP_PLAN.md` | 78 | `local-setup-complete-stack.ps1` | │   └── local-setup-complete-stack.ps1 |
| `SCRIPT_CLEANUP_PLAN.md` | 34 | `local-setup-reactiveresume-only.ps1` | local-setup-reactiveresume-only.ps1     # Lightweight loc... |
| `SCRIPT_CLEANUP_PLAN.md` | 77 | `local-setup-reactiveresume-only.ps1` | │   ├── local-setup-reactiveresume-only.ps1 |
| `SCRIPT_ORGANIZATION_ANALYSIS.md` | 20 | `docker-compose.skyvern.yml` | ### **Existing: `docker-compose.skyvern.yml`** |
| `SCRIPT_ORGANIZATION_ANALYSIS.md` | 57 | `local-setup-complete-stack.ps1` | **2. `local-setup-complete-stack.ps1`** |
| `SCRIPT_ORGANIZATION_ANALYSIS.md` | 51 | `local-setup-reactiveresume-only.ps1` | **1. `local-setup-reactiveresume-only.ps1`** |
| `SCRIPT_ORGANIZATION_ANALYSIS.md` | 174 | `local-setup-reactiveresume-only.ps1` | ./local-setup-reactiveresume-only.ps1 |
| `SERVER_DEPLOYMENT_STEPS.md` | 137 | `start-local.ps1` | - **Local development**: Use `.\start-local.ps1` |
| `SERVER_DEPLOYMENT_STEPS.md` | 47 | `deploy-server.sh` | ./deploy-server.sh |

**Action Required**: These references were already updated in Phase C for automation docs. Remaining references are in historical/context docs.

## 💡 Missing Cross-References

The following setup/deployment docs could benefit from linking to canonical commands:

| File | Reason |
|------|--------|
| `AUTOMATION_SETUP.md` | Setup/deployment doc without canonical command reference |
| `AUTOMATION_SYSTEM_COMPLETE.md` | Setup/deployment doc without canonical command reference |
| `BLOCK_TYPES_ANALYSIS.md` | Setup/deployment doc without canonical command reference |
| `CLEAN_SCRIPT_ORGANIZATION.md` | Setup/deployment doc without canonical command reference |
| `COMMIT_ORGANIZATION_PLAN.md` | Setup/deployment doc without canonical command reference |
| `COMPLETE_SCRIPT_FUNCTIONALITY_GUIDE.md` | Setup/deployment doc without canonical command reference |
| `COMPLETE_SERVER_HOSTING_ANALYSIS.md` | Setup/deployment doc without canonical command reference |
| `COMPLETE_SOLUTION_TIMELINE_AND_COSTS.md` | Setup/deployment doc without canonical command reference |
| `COST_EFFICIENCY_ANALYSIS.md` | Setup/deployment doc without canonical command reference |
| `DEPLOYMENT_GUIDE.md` | Setup/deployment doc without canonical command reference |
| `DEPLOYMENT_INSTRUCTIONS.md` | Setup/deployment doc without canonical command reference |
| `docs\ANTHROPIC_WEB_SEARCH_IMPLEMENTATION.md` | Setup/deployment doc without canonical command reference |
| `docs\automation\QUICKSTART.md` | Setup/deployment doc without canonical command reference |
| `docs\automation\SYSTEM_ARCHITECTURE_ANALYSIS.md` | Setup/deployment doc without canonical command reference |
| `docs\AUTOMATION_INTEGRATION_SUMMARY.md` | Setup/deployment doc without canonical command reference |
| `docs\COMPREHENSIVE_USER_FLOW_GUIDE.md` | Setup/deployment doc without canonical command reference |
| `docs\COVER_LETTER_MANUAL_TESTING_GUIDE.md` | Setup/deployment doc without canonical command reference |
| `docs\COVER_LETTER_SYSTEM_IMPLEMENTATION_COMPLETE.md` | Setup/deployment doc without canonical command reference |
| `docs\COVER_LETTER_USER_JOURNEY.md` | Setup/deployment doc without canonical command reference |
| `docs\ENHANCED_COMPANY_RESEARCH_IMPLEMENTATION.md` | Setup/deployment doc without canonical command reference |
| `docs\ENHANCED_RAG_ARCHITECTURE.md` | Setup/deployment doc without canonical command reference |
| `docs\final\api\generateTailoredResume-detailed-analysis.md` | Setup/deployment doc without canonical command reference |
| `docs\final\api\job-application-controller.md` | Setup/deployment doc without canonical command reference |
| `docs\final\FRONTEND_API_DOCUMENTATION.md` | Setup/deployment doc without canonical command reference |
| `docs\final\README.md` | Setup/deployment doc without canonical command reference |
| `docs\final\refactoring\surgical-cleanup-plan.md` | Setup/deployment doc without canonical command reference |
| `docs\LLM_SETUP.md` | Setup/deployment doc without canonical command reference |
| `docs\OPENAI_WHISPER_TRANSCRIPTION.md` | Setup/deployment doc without canonical command reference |
| `docs\PROJECT_CONTEXT.md` | Setup/deployment doc without canonical command reference |
| `docs\RAG_ENHANCEMENT_ROADMAP.md` | Setup/deployment doc without canonical command reference |
| `docs\README.md` | Setup/deployment doc without canonical command reference |
| `docs\RESUME_SECTIONS_DATA_STRUCTURE_REFERENCE.md` | Setup/deployment doc without canonical command reference |
| `docs\SECTION_SPECIFIC_AI_EDITING.md` | Setup/deployment doc without canonical command reference |
| `docs\TAILORED_COVER_LETTER_GENERATION.md` | Setup/deployment doc without canonical command reference |
| `docs\USER_JOURNEY_TESTING_GUIDE.md` | Setup/deployment doc without canonical command reference |
| `HAIKU_CONFIGURATION_SUCCESS_SUMMARY.md` | Setup/deployment doc without canonical command reference |
| `HYBRID_ARCHITECTURE_ANALYSIS.md` | Setup/deployment doc without canonical command reference |
| `IMMEDIATE_OLLAMA_SETUP.md` | Setup/deployment doc without canonical command reference |
| `logs\api-calls\research_research_1758639003268_3q96ar4g4_2025-09-23T14-50-03-268Z.md` | Setup/deployment doc without canonical command reference |
| `OLLAMA_CONFIGURATION_GUIDE.md` | Setup/deployment doc without canonical command reference |
| `ONE_WEEK_SPRINT_PLAN.md` | Setup/deployment doc without canonical command reference |
| `OPEN_SOURCE_LLM_HOSTING_RESEARCH.md` | Setup/deployment doc without canonical command reference |
| `REALISTIC_SYSTEM_ANALYSIS.md` | Setup/deployment doc without canonical command reference |
| `SCRIPT_CLEANUP_PLAN.md` | Setup/deployment doc without canonical command reference |
| `SCRIPT_ORGANIZATION_ANALYSIS.md` | Setup/deployment doc without canonical command reference |
| `SERVER_DEPLOYMENT_STEPS.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\AGENTS.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\alembic\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\CLAUDE.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\CONTRIBUTING.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\evaluation\results\webvoyager-Amazon.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\evaluation\results\webvoyager-BBC-News.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\evaluation\results\webvoyager-Coursera.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\evaluation\results\webvoyager-Github.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\evaluation\results\webvoyager-Google-Search.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\evaluation\results\webvoyager-Huggingface.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\integrations\langchain\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\integrations\llama_index\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\integrations\mcp\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\integrations\n8n\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\kubernetes-deployment\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\skyvern\webeye\README.md` | Setup/deployment doc without canonical command reference |
| `services\skyvern\skyvern-frontend\README.md` | Setup/deployment doc without canonical command reference |
| `tools\chatgpt-content-request.md` | Setup/deployment doc without canonical command reference |

**Recommendation**: Add links to `docs/00-foundation/Project-Overview.md` Run Workflows section.

---

## Canonical Commands Reference

For any setup/deployment documentation, ensure it references these canonical commands:

1. **Local (no Docker)**: `pnpm dev`
2. **Local (with Docker)**: `docker compose -f unified-docker-compose.yml up -d`
3. **Production**: `docker compose -f self-hosted-infrastructure.yml up -d`
4. **Testing**: `pnpm test`

**Golden Reference**: `docs/00-foundation/Project-Overview.md` → Run Workflows section

---

## Recommendations

### High Priority
- Update any remaining deprecated references to canonical commands
- Add cross-references to Project-Overview.md in setup docs

### Medium Priority
- Consolidate duplicate setup instructions into single canonical doc
- Add "See Project-Overview.md" banners to older docs

### Low Priority
- Archive truly historical docs to `docs/archive/`
- Create migration guide from old to new commands

---

**Next Steps**: Review flagged files and update as needed.
