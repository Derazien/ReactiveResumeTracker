# Run Paths Catalog

> **Generated:** 2025-10-02T14:59:39.725Z
> 
> **Purpose:** Comprehensive inventory of all executable paths, commands, and services in the repository.
>
> **Status Legend:**
> - `canonical` - Official, documented entry point
> - `active` - Used but not primary entry point  
> - `deprecated` - Marked for removal or shimming
> - `shim` - Redirects to canonical path
> - `duplicate` - Redundant with another entry

## Summary

- **Total Entries:** 136
- **Canonical:** 40
- **Active:** 33
- **Deprecated:** 28
- **Duplicate:** 29
- **Shim:** 6
- **Untriaged:** 0

## Catalog (with Scores)

| ID | Entry | Type | Status | Refs | Recent | Boot | Overlap | Platform | Replaced By |
|----|-------|------|--------|------|--------|------|---------|----------|-------------|
| RP0001 | `dev` | npm-script | canonical | - | - | - | - | - | - |
| RP0002 | `test` | npm-script | canonical | - | - | - | - | - | - |
| RP0003 | `prebuild` | npm-script | active | - | - | - | - | - | - |
| RP0004 | `build` | npm-script | canonical | - | - | - | - | - | - |
| RP0005 | `prestart` | npm-script | active | - | - | - | - | - | - |
| RP0006 | `start` | npm-script | active | - | - | - | - | - | - |
| RP0007 | `lint` | npm-script | canonical | - | - | - | - | - | - |
| RP0008 | `lint:fix` | npm-script | canonical | - | - | - | - | - | - |
| RP0009 | `format` | npm-script | canonical | - | - | - | - | - | - |
| RP0010 | `format:fix` | npm-script | canonical | - | - | - | - | - | - |
| RP0011 | `crowdin:sync` | npm-script | active | - | - | - | - | - | - |
| RP0012 | `prisma:generate` | npm-script | canonical | - | - | - | - | - | - |
| RP0013 | `prisma:migrate` | npm-script | canonical | - | - | - | - | - | - |
| RP0014 | `prisma:migrate:dev` | npm-script | canonical | - | - | - | - | - | - |
| RP0015 | `prisma:studio` | npm-script | canonical | - | - | - | - | - | - |
| RP0016 | `messages:extract` | npm-script | active | - | - | - | - | - | - |
| RP0017 | `dev` | npm-script | canonical | - | - | - | - | - | - |
| RP0018 | `build` | npm-script | canonical | - | - | - | - | - | - |
| RP0019 | `lint` | npm-script | deprecated | - | - | - | - | - | pnpm lint (root) |
| RP0020 | `format` | npm-script | deprecated | - | - | - | - | - | pnpm format (root) |
| RP0021 | `preview` | npm-script | canonical | - | - | - | - | - | - |
| RP0022 | `prepare` | npm-script | active | 12 | N/A | 0 | 0% | cross | - |
| RP0023 | `precommit` | npm-script | active | 1 | N/A | 0 | 0% | cross | - |
| RP0024 | `run-artifact-server` | npm-script | deprecated | - | - | - | - | - | Not needed - integrated |
| RP0025 | `serve` | npm-script | deprecated | - | - | - | - | - | npm run dev (skyvern-frontend) |
| RP0026 | `test` | npm-script | canonical | - | - | - | - | - | - |
| RP0027 | `start` | npm-script | deprecated | - | - | - | - | - | npm run dev (skyvern-frontend) |
| RP0028 | `preinstall` | npm-script | active | - | - | - | - | - | - |
| RP0029 | `build` | npm-script | active | - | - | - | - | - | - |
| RP0030 | `dev` | npm-script | active | - | - | - | - | - | - |
| RP0031 | `format` | npm-script | active | - | - | - | - | - | - |
| RP0032 | `lint` | npm-script | active | - | - | - | - | - | - |
| RP0033 | `lintfix` | npm-script | active | - | - | - | - | - | - |
| RP0034 | `prepublishOnly` | npm-script | active | - | - | - | - | - | - |
| RP0035 | `services` | docker-service | duplicate | - | - | - | - | - | - |
| RP0036 | `skyvern-postgres` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-postgres |
| RP0037 | `skyvern-redis` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-redis |
| RP0038 | `skyvern` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern |
| RP0039 | `skyvern-ui` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-ui |
| RP0040 | `skyvern_postgres_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0041 | `skyvern_chrome_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0042 | `services` | docker-service | duplicate | - | - | - | - | - | - |
| RP0043 | `postgres-main` | docker-service | canonical | - | - | - | - | - | - |
| RP0044 | `redis` | docker-service | canonical | - | - | - | - | - | - |
| RP0045 | `minio` | docker-service | canonical | - | - | - | - | - | - |
| RP0046 | `chrome` | docker-service | canonical | - | - | - | - | - | - |
| RP0047 | `skyvern-postgres` | docker-service | canonical | - | - | - | - | - | - |
| RP0048 | `skyvern-redis` | docker-service | canonical | - | - | - | - | - | - |
| RP0049 | `skyvern` | docker-service | canonical | - | - | - | - | - | - |
| RP0050 | `skyvern-ui` | docker-service | canonical | - | - | - | - | - | - |
| RP0051 | `ollama` | docker-service | canonical | - | - | - | - | - | - |
| RP0052 | `postgres_main_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0053 | `redis_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0054 | `minio_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0055 | `skyvern_postgres_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0056 | `skyvern_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0057 | `ollama_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0058 | `default` | docker-service | duplicate | - | - | - | - | - | - |
| RP0059 | `services` | docker-service | duplicate | - | - | - | - | - | - |
| RP0060 | `ollama` | docker-service | canonical | - | - | - | - | - | - |
| RP0061 | `ollama-loader` | docker-service | canonical | - | - | - | - | - | - |
| RP0062 | `skyvern-db` | docker-service | canonical | - | - | - | - | - | - |
| RP0063 | `skyvern-redis` | docker-service | canonical | - | - | - | - | - | - |
| RP0064 | `skyvern-api` | docker-service | canonical | - | - | - | - | - | - |
| RP0065 | `skyvern-ui` | docker-service | canonical | - | - | - | - | - | - |
| RP0066 | `reactive-resume-db` | docker-service | canonical | - | - | - | - | - | - |
| RP0067 | `reactive-resume-redis` | docker-service | canonical | - | - | - | - | - | - |
| RP0068 | `reactive-resume-server` | docker-service | canonical | - | - | - | - | - | - |
| RP0069 | `reactive-resume-client` | docker-service | canonical | - | - | - | - | - | - |
| RP0070 | `n8n-db` | docker-service | canonical | - | - | - | - | - | - |
| RP0071 | `n8n` | docker-service | canonical | - | - | - | - | - | - |
| RP0072 | `prometheus` | docker-service | canonical | - | - | - | - | - | - |
| RP0073 | `grafana` | docker-service | canonical | - | - | - | - | - | - |
| RP0074 | `traefik` | docker-service | canonical | - | - | - | - | - | - |
| RP0075 | `backup` | docker-service | canonical | - | - | - | - | - | - |
| RP0076 | `ollama_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0077 | `skyvern_db_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0078 | `skyvern_downloads` | docker-service | duplicate | - | - | - | - | - | - |
| RP0079 | `reactive_resume_db_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0080 | `n8n_db_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0081 | `n8n_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0082 | `prometheus_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0083 | `grafana_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0084 | `default` | docker-service | duplicate | - | - | - | - | - | - |
| RP0085 | `services` | docker-service | duplicate | - | - | - | - | - | - |
| RP0086 | `postgres-main` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:postgres-main |
| RP0087 | `redis` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:redis |
| RP0088 | `minio` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:minio |
| RP0089 | `chrome` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:chrome |
| RP0090 | `skyvern-postgres` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-postgres |
| RP0091 | `skyvern-redis` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-redis |
| RP0092 | `skyvern` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern |
| RP0093 | `skyvern-ui` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-ui |
| RP0094 | `ollama` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:ollama |
| RP0095 | `default` | docker-service | duplicate | - | - | - | - | - | - |
| RP0096 | `services` | docker-service | duplicate | - | - | - | - | - | - |
| RP0097 | `postgres` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:postgres-main |
| RP0098 | `redis` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:redis |
| RP0099 | `minio` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:minio |
| RP0100 | `chrome` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:chrome |
| RP0101 | `postgres_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0102 | `redis_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0103 | `minio_data` | docker-service | duplicate | - | - | - | - | - | - |
| RP0104 | `default` | docker-service | duplicate | - | - | - | - | - | - |
| RP0105 | `services` | docker-service | duplicate | - | - | - | - | - | - |
| RP0106 | `postgres` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-postgres |
| RP0107 | `skyvern` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern |
| RP0108 | `skyvern-ui` | docker-service | deprecated | - | - | - | - | - | unified-docker-compose.yml:skyvern-ui |
| RP0109 | `runpaths.js` | script-js | active | - | - | - | - | - | - |
| RP0110 | `setup-simple-vnc.ps1` | script-ps1 | active | 4 | 5d | 0 | 0% | win-only | - |
| RP0111 | `setup-vnc-access.ps1` | script-ps1 | active | 5 | 5d | 0 | 0% | win-only | - |
| RP0112 | `setup-x11-forwarding.ps1` | script-ps1 | active | 4 | 5d | 0 | 0% | win-only | - |
| RP0113 | `local-setup-complete-stack.ps1` | script-ps1 | shim | - | - | - | - | - | - |
| RP0114 | `local-setup-reactiveresume-...` | script-ps1 | shim | - | - | - | - | - | - |
| RP0115 | `init-multiple-dbs.sh` | script-sh | active | 1 | 21d | 0 | 0% | cross | - |
| RP0116 | `setup.ps1` | script-ps1 | deprecated | 17 | 5d | 0 | 90% | win-only | pnpm install + docker compose -f unified-docker-compose.yml up -d |
| RP0117 | `setup.sh` | script-sh | deprecated | 6 | 5d | 0 | 90% | cross | pnpm install + docker compose -f unified-docker-compose.yml up -d |
| RP0118 | `start-complete-system.ps1` | script-ps1 | deprecated | 11 | 5d | 0 | 90% | win-only | docker compose -f unified-docker-compose.yml up -d |
| RP0119 | `complete-database-import.js` | script-js | active | - | - | - | - | - | - |
| RP0120 | `export-current-database.js` | script-js | active | - | - | - | - | - | - |
| RP0121 | `server-setup-complete-stack.sh` | script-sh | shim | - | - | - | - | - | - |
| RP0122 | `server-setup-reactiveresume...` | script-sh | shim | - | - | - | - | - | - |
| RP0123 | `test-automation.sh` | script-sh | active | 3 | 21d | 0 | 0% | cross | - |
| RP0124 | `start-local.ps1` | root-script-ps1 | shim | - | - | - | - | - | - |
| RP0125 | `deploy-server.sh` | root-script-sh | shim | - | - | - | - | - | - |
| RP0126 | `test-import.ps1` | root-script-ps1 | active | 1 | 0d | 0 | 10% | win-only | - |
| RP0127 | `test-local-postgres.ps1` | root-script-ps1 | active | 1 | 0d | 0 | 10% | win-only | - |
| RP0128 | `copy-arc-to-docker.ps1` | root-script-ps1 | active | 4 | 0d | 0 | 10% | win-only | - |
| RP0129 | `ps --filter name=skyvern` | docs-command | active | 3 | 18d | 0 | 10% | cross | - |
| RP0130 | `logs skyvern-api --tail 50` | docs-command | active | 3 | 18d | 0 | 10% | cross | - |
| RP0131 | `-f docker-compose.skyvern.y...` | docs-command | active | 1 | 18d | 0 | 10% | cross | - |
| RP0132 | `-f docker-compose.skyvern.y...` | docs-command | active | 1 | 18d | 0 | 10% | cross | - |
| RP0133 | `ps` | docs-command | active | 412 | 18d | 0 | 10% | cross | - |
| RP0134 | `-f docker-compose.skyvern.y...` | docs-command | active | 1 | 8d | 0 | 10% | cross | - |
| RP0135 | `ps --filter name=skyvern` | docs-command | active | 3 | 8d | 0 | 10% | cross | - |
| RP0136 | `logs skyvern-api | findstr ...` | findstr "API"` | active | 2 | 8d | 0 | 10% | cross | - |

## Summary by Status

### active (33 entries)

- **RP0003**: `prebuild` (npm-script) - package.json
- **RP0005**: `prestart` (npm-script) - package.json
- **RP0006**: `start` (npm-script) - package.json
- **RP0011**: `crowdin:sync` (npm-script) - package.json
- **RP0016**: `messages:extract` (npm-script) - package.json
- **RP0022**: `prepare` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0023**: `precommit` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0028**: `preinstall` (npm-script) - services/skyvern/integrations/n8n/package.json
- **RP0029**: `build` (npm-script) - services/skyvern/integrations/n8n/package.json
- **RP0030**: `dev` (npm-script) - services/skyvern/integrations/n8n/package.json
- **RP0031**: `format` (npm-script) - services/skyvern/integrations/n8n/package.json
- **RP0032**: `lint` (npm-script) - services/skyvern/integrations/n8n/package.json
- **RP0033**: `lintfix` (npm-script) - services/skyvern/integrations/n8n/package.json
- **RP0034**: `prepublishOnly` (npm-script) - services/skyvern/integrations/n8n/package.json
- **RP0109**: `runpaths.js` (script-js) - scripts/audit\runpaths.js
- **RP0110**: `setup-simple-vnc.ps1` (script-ps1) - scripts/debug\setup-simple-vnc.ps1
- **RP0111**: `setup-vnc-access.ps1` (script-ps1) - scripts/debug\setup-vnc-access.ps1
- **RP0112**: `setup-x11-forwarding.ps1` (script-ps1) - scripts/debug\setup-x11-forwarding.ps1
- **RP0115**: `init-multiple-dbs.sh` (script-sh) - scripts/init-multiple-dbs.sh
- **RP0119**: `complete-database-import.js` (script-js) - scripts/production\complete-database-import.js
- **RP0120**: `export-current-database.js` (script-js) - scripts/production\export-current-database.js
- **RP0123**: `test-automation.sh` (script-sh) - scripts/test-automation.sh
- **RP0126**: `test-import.ps1` (root-script-ps1) - .
- **RP0127**: `test-local-postgres.ps1` (root-script-ps1) - .
- **RP0128**: `copy-arc-to-docker.ps1` (root-script-ps1) - .
- **RP0129**: `ps --filter name=skyvern` (docs-command) - docs/automation\LINKEDIN_AUTOMATION.md
- **RP0130**: `logs skyvern-api --tail 50` (docs-command) - docs/automation\LINKEDIN_AUTOMATION.md
- **RP0131**: `-f docker-compose.skyvern.yml down` (docs-command) - docs/automation\LINKEDIN_AUTOMATION.md
- **RP0132**: `-f docker-compose.skyvern.yml up -d` (docs-command) - docs/automation\LINKEDIN_AUTOMATION.md
- **RP0133**: `ps` (docs-command) - docs/automation\QUICKSTART.md
- **RP0134**: `-f docker-compose.skyvern.yml up -d` (docs-command) - docs/automation\SETUP_AND_TROUBLESHOOTING.md
- **RP0135**: `ps --filter name=skyvern` (docs-command) - docs/automation\SETUP_AND_TROUBLESHOOTING.md
- **RP0136**: `logs skyvern-api | findstr "API"` (findstr "API"`) - docs/automation\SETUP_AND_TROUBLESHOOTING.md

### canonical (40 entries)

- **RP0001**: `dev` (npm-script) - package.json
- **RP0002**: `test` (npm-script) - package.json
- **RP0004**: `build` (npm-script) - package.json
- **RP0007**: `lint` (npm-script) - package.json
- **RP0008**: `lint:fix` (npm-script) - package.json
- **RP0009**: `format` (npm-script) - package.json
- **RP0010**: `format:fix` (npm-script) - package.json
- **RP0012**: `prisma:generate` (npm-script) - package.json
- **RP0013**: `prisma:migrate` (npm-script) - package.json
- **RP0014**: `prisma:migrate:dev` (npm-script) - package.json
- **RP0015**: `prisma:studio` (npm-script) - package.json
- **RP0017**: `dev` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0018**: `build` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0021**: `preview` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0026**: `test` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0043**: `postgres-main` (docker-service) - unified-docker-compose.yml
- **RP0044**: `redis` (docker-service) - unified-docker-compose.yml
- **RP0045**: `minio` (docker-service) - unified-docker-compose.yml
- **RP0046**: `chrome` (docker-service) - unified-docker-compose.yml
- **RP0047**: `skyvern-postgres` (docker-service) - unified-docker-compose.yml
- **RP0048**: `skyvern-redis` (docker-service) - unified-docker-compose.yml
- **RP0049**: `skyvern` (docker-service) - unified-docker-compose.yml
- **RP0050**: `skyvern-ui` (docker-service) - unified-docker-compose.yml
- **RP0051**: `ollama` (docker-service) - unified-docker-compose.yml
- **RP0060**: `ollama` (docker-service) - self-hosted-infrastructure.yml
- **RP0061**: `ollama-loader` (docker-service) - self-hosted-infrastructure.yml
- **RP0062**: `skyvern-db` (docker-service) - self-hosted-infrastructure.yml
- **RP0063**: `skyvern-redis` (docker-service) - self-hosted-infrastructure.yml
- **RP0064**: `skyvern-api` (docker-service) - self-hosted-infrastructure.yml
- **RP0065**: `skyvern-ui` (docker-service) - self-hosted-infrastructure.yml
- **RP0066**: `reactive-resume-db` (docker-service) - self-hosted-infrastructure.yml
- **RP0067**: `reactive-resume-redis` (docker-service) - self-hosted-infrastructure.yml
- **RP0068**: `reactive-resume-server` (docker-service) - self-hosted-infrastructure.yml
- **RP0069**: `reactive-resume-client` (docker-service) - self-hosted-infrastructure.yml
- **RP0070**: `n8n-db` (docker-service) - self-hosted-infrastructure.yml
- **RP0071**: `n8n` (docker-service) - self-hosted-infrastructure.yml
- **RP0072**: `prometheus` (docker-service) - self-hosted-infrastructure.yml
- **RP0073**: `grafana` (docker-service) - self-hosted-infrastructure.yml
- **RP0074**: `traefik` (docker-service) - self-hosted-infrastructure.yml
- **RP0075**: `backup` (docker-service) - self-hosted-infrastructure.yml

### deprecated (28 entries)

- **RP0019**: `lint` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0020**: `format` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0024**: `run-artifact-server` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0025**: `serve` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0027**: `start` (npm-script) - services/skyvern/skyvern-frontend/package.json
- **RP0036**: `skyvern-postgres` (docker-service) - docker-compose.skyvern.yml
- **RP0037**: `skyvern-redis` (docker-service) - docker-compose.skyvern.yml
- **RP0038**: `skyvern` (docker-service) - docker-compose.skyvern.yml
- **RP0039**: `skyvern-ui` (docker-service) - docker-compose.skyvern.yml
- **RP0086**: `postgres-main` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0087**: `redis` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0088**: `minio` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0089**: `chrome` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0090**: `skyvern-postgres` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0091**: `skyvern-redis` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0092**: `skyvern` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0093**: `skyvern-ui` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0094**: `ollama` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0097**: `postgres` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0098**: `redis` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0099**: `minio` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0100**: `chrome` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0106**: `postgres` (docker-service) - services/skyvern/docker-compose.yml
- **RP0107**: `skyvern` (docker-service) - services/skyvern/docker-compose.yml
- **RP0108**: `skyvern-ui` (docker-service) - services/skyvern/docker-compose.yml
- **RP0116**: `setup.ps1` (script-ps1) - scripts/legacy\setup.ps1
- **RP0117**: `setup.sh` (script-sh) - scripts/legacy\setup.sh
- **RP0118**: `start-complete-system.ps1` (script-ps1) - scripts/legacy\start-complete-system.ps1

### duplicate (29 entries)

- **RP0035**: `services` (docker-service) - docker-compose.skyvern.yml
- **RP0040**: `skyvern_postgres_data` (docker-service) - docker-compose.skyvern.yml
- **RP0041**: `skyvern_chrome_data` (docker-service) - docker-compose.skyvern.yml
- **RP0042**: `services` (docker-service) - unified-docker-compose.yml
- **RP0052**: `postgres_main_data` (docker-service) - unified-docker-compose.yml
- **RP0053**: `redis_data` (docker-service) - unified-docker-compose.yml
- **RP0054**: `minio_data` (docker-service) - unified-docker-compose.yml
- **RP0055**: `skyvern_postgres_data` (docker-service) - unified-docker-compose.yml
- **RP0056**: `skyvern_data` (docker-service) - unified-docker-compose.yml
- **RP0057**: `ollama_data` (docker-service) - unified-docker-compose.yml
- **RP0058**: `default` (docker-service) - unified-docker-compose.yml
- **RP0059**: `services` (docker-service) - self-hosted-infrastructure.yml
- **RP0076**: `ollama_data` (docker-service) - self-hosted-infrastructure.yml
- **RP0077**: `skyvern_db_data` (docker-service) - self-hosted-infrastructure.yml
- **RP0078**: `skyvern_downloads` (docker-service) - self-hosted-infrastructure.yml
- **RP0079**: `reactive_resume_db_data` (docker-service) - self-hosted-infrastructure.yml
- **RP0080**: `n8n_db_data` (docker-service) - self-hosted-infrastructure.yml
- **RP0081**: `n8n_data` (docker-service) - self-hosted-infrastructure.yml
- **RP0082**: `prometheus_data` (docker-service) - self-hosted-infrastructure.yml
- **RP0083**: `grafana_data` (docker-service) - self-hosted-infrastructure.yml
- **RP0084**: `default` (docker-service) - self-hosted-infrastructure.yml
- **RP0085**: `services` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0095**: `default` (docker-service) - scripts/docker/docker-compose-complete-stack.yml
- **RP0096**: `services` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0101**: `postgres_data` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0102**: `redis_data` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0103**: `minio_data` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0104**: `default` (docker-service) - scripts/docker/docker-compose-reactiveresume-only.yml
- **RP0105**: `services` (docker-service) - services/skyvern/docker-compose.yml

### shim (6 entries)

- **RP0113**: `local-setup-complete-stack.ps1` (script-ps1) - scripts/development\local-setup-complete-stack.ps1
- **RP0114**: `local-setup-reactiveresume-only.ps1` (script-ps1) - scripts/development\local-setup-reactiveresume-only.ps1
- **RP0121**: `server-setup-complete-stack.sh` (script-sh) - scripts/production\server-setup-complete-stack.sh
- **RP0122**: `server-setup-reactiveresume-only.sh` (script-sh) - scripts/production\server-setup-reactiveresume-only.sh
- **RP0124**: `start-local.ps1` (root-script-ps1) - .
- **RP0125**: `deploy-server.sh` (root-script-sh) - .

---

## Score Legend

- **Refs**: Number of references in repo/docs/CI (git grep)
- **Recent**: Days since last change (lower = more recent)
- **Boot**: 1 if 60-sec smoke test succeeds, 0 otherwise
- **Overlap**: % overlap with canonical commands (higher = more redundant)
- **Platform**: `cross` (works everywhere) or `win-only` (Windows specific)

## Classification Rules

- **canonical**: Uniquely needed and widely referenced
- **active**: Useful supporting scripts/commands
- **deprecated**: Has overlap + low refs/recent or legacy
- **duplicate**: Exact duplicate of another path (e.g., volume definitions)
- **shim**: Win-only convenience forwarding to canonical

