# Run Paths Catalog

> **Generated:** 2025-10-02T12:55:47.290Z
> 
> **Purpose:** Comprehensive inventory of all executable paths, commands, and services in the repository.
>
> **Status Legend:**
> - `untriaged` - Not yet reviewed for canonicalization
> - `canonical` - Official, documented entry point
> - `deprecated` - Marked for removal or shimming
> - `shim` - Redirects to canonical path
> - `duplicate` - Redundant with another entry

## Summary

- **Total Entries:** 136
- **NPM Scripts:** 34
- **Docker Services:** 74
- **Docker Profiles:** 0
- **Script Files:** 15
- **Root Scripts:** 5
- **Doc Commands:** 8

## Catalog

| ID | Entry | Type | Referenced By | Status |
|----|-------|------|---------------|--------|
| RP0001 | `dev` | npm-script | `package.json` | untriaged |
| RP0002 | `test` | npm-script | `package.json` | untriaged |
| RP0003 | `prebuild` | npm-script | `package.json` | untriaged |
| RP0004 | `build` | npm-script | `package.json` | untriaged |
| RP0005 | `prestart` | npm-script | `package.json` | untriaged |
| RP0006 | `start` | npm-script | `package.json` | untriaged |
| RP0007 | `lint` | npm-script | `package.json` | untriaged |
| RP0008 | `lint:fix` | npm-script | `package.json` | untriaged |
| RP0009 | `format` | npm-script | `package.json` | untriaged |
| RP0010 | `format:fix` | npm-script | `package.json` | untriaged |
| RP0011 | `crowdin:sync` | npm-script | `package.json` | untriaged |
| RP0012 | `prisma:generate` | npm-script | `package.json` | untriaged |
| RP0013 | `prisma:migrate` | npm-script | `package.json` | untriaged |
| RP0014 | `prisma:migrate:dev` | npm-script | `package.json` | untriaged |
| RP0015 | `prisma:studio` | npm-script | `package.json` | untriaged |
| RP0016 | `messages:extract` | npm-script | `package.json` | untriaged |
| RP0017 | `dev` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0018 | `build` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0019 | `lint` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0020 | `format` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0021 | `preview` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0022 | `prepare` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0023 | `precommit` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0024 | `run-artifact-server` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0025 | `serve` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0026 | `test` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0027 | `start` | npm-script | `services/skyvern/skyvern-frontend/pac...` | untriaged |
| RP0028 | `preinstall` | npm-script | `services/skyvern/integrations/n8n/pac...` | untriaged |
| RP0029 | `build` | npm-script | `services/skyvern/integrations/n8n/pac...` | untriaged |
| RP0030 | `dev` | npm-script | `services/skyvern/integrations/n8n/pac...` | untriaged |
| RP0031 | `format` | npm-script | `services/skyvern/integrations/n8n/pac...` | untriaged |
| RP0032 | `lint` | npm-script | `services/skyvern/integrations/n8n/pac...` | untriaged |
| RP0033 | `lintfix` | npm-script | `services/skyvern/integrations/n8n/pac...` | untriaged |
| RP0034 | `prepublishOnly` | npm-script | `services/skyvern/integrations/n8n/pac...` | untriaged |
| RP0035 | `services` | docker-service | `docker-compose.skyvern.yml` | untriaged |
| RP0036 | `skyvern-postgres` | docker-service | `docker-compose.skyvern.yml` | untriaged |
| RP0037 | `skyvern-redis` | docker-service | `docker-compose.skyvern.yml` | untriaged |
| RP0038 | `skyvern` | docker-service | `docker-compose.skyvern.yml` | untriaged |
| RP0039 | `skyvern-ui` | docker-service | `docker-compose.skyvern.yml` | untriaged |
| RP0040 | `skyvern_postgres_data` | docker-service | `docker-compose.skyvern.yml` | untriaged |
| RP0041 | `skyvern_chrome_data` | docker-service | `docker-compose.skyvern.yml` | untriaged |
| RP0042 | `services` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0043 | `postgres-main` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0044 | `redis` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0045 | `minio` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0046 | `chrome` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0047 | `skyvern-postgres` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0048 | `skyvern-redis` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0049 | `skyvern` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0050 | `skyvern-ui` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0051 | `ollama` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0052 | `postgres_main_data` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0053 | `redis_data` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0054 | `minio_data` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0055 | `skyvern_postgres_data` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0056 | `skyvern_data` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0057 | `ollama_data` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0058 | `default` | docker-service | `unified-docker-compose.yml` | untriaged |
| RP0059 | `services` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0060 | `ollama` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0061 | `ollama-loader` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0062 | `skyvern-db` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0063 | `skyvern-redis` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0064 | `skyvern-api` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0065 | `skyvern-ui` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0066 | `reactive-resume-db` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0067 | `reactive-resume-redis` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0068 | `reactive-resume-server` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0069 | `reactive-resume-client` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0070 | `n8n-db` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0071 | `n8n` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0072 | `prometheus` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0073 | `grafana` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0074 | `traefik` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0075 | `backup` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0076 | `ollama_data` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0077 | `skyvern_db_data` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0078 | `skyvern_downloads` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0079 | `reactive_resume_db_data` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0080 | `n8n_db_data` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0081 | `n8n_data` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0082 | `prometheus_data` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0083 | `grafana_data` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0084 | `default` | docker-service | `self-hosted-infrastructure.yml` | untriaged |
| RP0085 | `services` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0086 | `postgres-main` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0087 | `redis` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0088 | `minio` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0089 | `chrome` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0090 | `skyvern-postgres` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0091 | `skyvern-redis` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0092 | `skyvern` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0093 | `skyvern-ui` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0094 | `ollama` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0095 | `default` | docker-service | `scripts/docker/docker-compose-complet...` | untriaged |
| RP0096 | `services` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0097 | `postgres` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0098 | `redis` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0099 | `minio` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0100 | `chrome` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0101 | `postgres_data` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0102 | `redis_data` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0103 | `minio_data` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0104 | `default` | docker-service | `scripts/docker/docker-compose-reactiv...` | untriaged |
| RP0105 | `services` | docker-service | `services/skyvern/docker-compose.yml` | untriaged |
| RP0106 | `postgres` | docker-service | `services/skyvern/docker-compose.yml` | untriaged |
| RP0107 | `skyvern` | docker-service | `services/skyvern/docker-compose.yml` | untriaged |
| RP0108 | `skyvern-ui` | docker-service | `services/skyvern/docker-compose.yml` | untriaged |
| RP0109 | `runpaths.js` | script-js | `scripts/audit\runpaths.js` | untriaged |
| RP0110 | `setup-simple-vnc.ps1` | script-ps1 | `scripts/debug\setup-simple-vnc.ps1` | untriaged |
| RP0111 | `setup-vnc-access.ps1` | script-ps1 | `scripts/debug\setup-vnc-access.ps1` | untriaged |
| RP0112 | `setup-x11-forwarding.ps1` | script-ps1 | `scripts/debug\setup-x11-forwarding.ps1` | untriaged |
| RP0113 | `local-setup-complete-stack.ps1` | script-ps1 | `scripts/development\local-setup-compl...` | untriaged |
| RP0114 | `local-setup-reactiveresume-only.ps1` | script-ps1 | `scripts/development\local-setup-react...` | untriaged |
| RP0115 | `init-multiple-dbs.sh` | script-sh | `scripts/init-multiple-dbs.sh` | untriaged |
| RP0116 | `setup.ps1` | script-ps1 | `scripts/legacy\setup.ps1` | untriaged |
| RP0117 | `setup.sh` | script-sh | `scripts/legacy\setup.sh` | untriaged |
| RP0118 | `start-complete-system.ps1` | script-ps1 | `scripts/legacy\start-complete-system.ps1` | untriaged |
| RP0119 | `complete-database-import.js` | script-js | `scripts/production\complete-database-...` | untriaged |
| RP0120 | `export-current-database.js` | script-js | `scripts/production\export-current-dat...` | untriaged |
| RP0121 | `server-setup-complete-stack.sh` | script-sh | `scripts/production\server-setup-compl...` | untriaged |
| RP0122 | `server-setup-reactiveresume-only.sh` | script-sh | `scripts/production\server-setup-react...` | untriaged |
| RP0123 | `test-automation.sh` | script-sh | `scripts/test-automation.sh` | untriaged |
| RP0124 | `start-local.ps1` | root-script-ps1 | `.` | untriaged |
| RP0125 | `deploy-server.sh` | root-script-sh | `.` | untriaged |
| RP0126 | `test-import.ps1` | root-script-ps1 | `.` | untriaged |
| RP0127 | `test-local-postgres.ps1` | root-script-ps1 | `.` | untriaged |
| RP0128 | `copy-arc-to-docker.ps1` | root-script-ps1 | `.` | untriaged |
| RP0129 | `ps --filter name=skyvern` | docs-command | `docs/automation\LINKEDIN_AUTOMATION.md` | untriaged |
| RP0130 | `logs skyvern-api --tail 50` | docs-command | `docs/automation\LINKEDIN_AUTOMATION.md` | untriaged |
| RP0131 | `-f docker-compose.skyvern.yml down` | docs-command | `docs/automation\LINKEDIN_AUTOMATION.md` | untriaged |
| RP0132 | `-f docker-compose.skyvern.yml up -d` | docs-command | `docs/automation\LINKEDIN_AUTOMATION.md` | untriaged |
| RP0133 | `ps` | docs-command | `docs/automation\QUICKSTART.md` | untriaged |
| RP0134 | `-f docker-compose.skyvern.yml up -d` | docs-command | `docs/automation\SETUP_AND_TROUBLESHOO...` | untriaged |
| RP0135 | `ps --filter name=skyvern` | docs-command | `docs/automation\SETUP_AND_TROUBLESHOO...` | untriaged |
| RP0136 | `logs skyvern-api | findstr "API"` | docs-command | `docs/automation\SETUP_AND_TROUBLESHOO...` | untriaged |

## Detailed Entries

### docker-service (74 entries)

#### RP0035: `services`

- **Referenced By:** `docker-compose.skyvern.yml`
- **Command:** `docker compose -f docker-compose.skyvern.yml up services`
- **Description:** Service from docker-compose.skyvern.yml
- **Status:** untriaged

#### RP0036: `skyvern-postgres`

- **Referenced By:** `docker-compose.skyvern.yml`
- **Command:** `docker compose -f docker-compose.skyvern.yml up skyvern-postgres`
- **Description:** Service from docker-compose.skyvern.yml
- **Status:** untriaged

#### RP0037: `skyvern-redis`

- **Referenced By:** `docker-compose.skyvern.yml`
- **Command:** `docker compose -f docker-compose.skyvern.yml up skyvern-redis`
- **Description:** Service from docker-compose.skyvern.yml
- **Status:** untriaged

#### RP0038: `skyvern`

- **Referenced By:** `docker-compose.skyvern.yml`
- **Command:** `docker compose -f docker-compose.skyvern.yml up skyvern`
- **Description:** Service from docker-compose.skyvern.yml
- **Status:** untriaged

#### RP0039: `skyvern-ui`

- **Referenced By:** `docker-compose.skyvern.yml`
- **Command:** `docker compose -f docker-compose.skyvern.yml up skyvern-ui`
- **Description:** Service from docker-compose.skyvern.yml
- **Status:** untriaged

#### RP0040: `skyvern_postgres_data`

- **Referenced By:** `docker-compose.skyvern.yml`
- **Command:** `docker compose -f docker-compose.skyvern.yml up skyvern_postgres_data`
- **Description:** Service from docker-compose.skyvern.yml
- **Status:** untriaged

#### RP0041: `skyvern_chrome_data`

- **Referenced By:** `docker-compose.skyvern.yml`
- **Command:** `docker compose -f docker-compose.skyvern.yml up skyvern_chrome_data`
- **Description:** Service from docker-compose.skyvern.yml
- **Status:** untriaged

#### RP0042: `services`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up services`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0043: `postgres-main`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up postgres-main`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0044: `redis`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up redis`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0045: `minio`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up minio`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0046: `chrome`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up chrome`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0047: `skyvern-postgres`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up skyvern-postgres`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0048: `skyvern-redis`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up skyvern-redis`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0049: `skyvern`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up skyvern`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0050: `skyvern-ui`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up skyvern-ui`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0051: `ollama`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up ollama`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0052: `postgres_main_data`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up postgres_main_data`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0053: `redis_data`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up redis_data`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0054: `minio_data`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up minio_data`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0055: `skyvern_postgres_data`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up skyvern_postgres_data`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0056: `skyvern_data`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up skyvern_data`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0057: `ollama_data`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up ollama_data`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0058: `default`

- **Referenced By:** `unified-docker-compose.yml`
- **Command:** `docker compose -f unified-docker-compose.yml up default`
- **Description:** Service from unified-docker-compose.yml
- **Status:** untriaged

#### RP0059: `services`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up services`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0060: `ollama`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up ollama`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0061: `ollama-loader`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up ollama-loader`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0062: `skyvern-db`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up skyvern-db`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0063: `skyvern-redis`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up skyvern-redis`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0064: `skyvern-api`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up skyvern-api`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0065: `skyvern-ui`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up skyvern-ui`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0066: `reactive-resume-db`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up reactive-resume-db`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0067: `reactive-resume-redis`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up reactive-resume-redis`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0068: `reactive-resume-server`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up reactive-resume-server`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0069: `reactive-resume-client`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up reactive-resume-client`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0070: `n8n-db`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up n8n-db`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0071: `n8n`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up n8n`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0072: `prometheus`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up prometheus`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0073: `grafana`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up grafana`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0074: `traefik`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up traefik`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0075: `backup`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up backup`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0076: `ollama_data`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up ollama_data`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0077: `skyvern_db_data`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up skyvern_db_data`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0078: `skyvern_downloads`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up skyvern_downloads`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0079: `reactive_resume_db_data`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up reactive_resume_db_data`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0080: `n8n_db_data`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up n8n_db_data`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0081: `n8n_data`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up n8n_data`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0082: `prometheus_data`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up prometheus_data`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0083: `grafana_data`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up grafana_data`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0084: `default`

- **Referenced By:** `self-hosted-infrastructure.yml`
- **Command:** `docker compose -f self-hosted-infrastructure.yml up default`
- **Description:** Service from self-hosted-infrastructure.yml
- **Status:** untriaged

#### RP0085: `services`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up services`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0086: `postgres-main`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up postgres-main`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0087: `redis`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up redis`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0088: `minio`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up minio`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0089: `chrome`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up chrome`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0090: `skyvern-postgres`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up skyvern-postgres`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0091: `skyvern-redis`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up skyvern-redis`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0092: `skyvern`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up skyvern`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0093: `skyvern-ui`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up skyvern-ui`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0094: `ollama`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up ollama`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0095: `default`

- **Referenced By:** `scripts/docker/docker-compose-complete-stack.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-complete-stack.yml up default`
- **Description:** Service from scripts/docker/docker-compose-complete-stack.yml
- **Status:** untriaged

#### RP0096: `services`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up services`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0097: `postgres`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up postgres`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0098: `redis`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up redis`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0099: `minio`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up minio`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0100: `chrome`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up chrome`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0101: `postgres_data`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up postgres_data`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0102: `redis_data`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up redis_data`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0103: `minio_data`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up minio_data`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0104: `default`

- **Referenced By:** `scripts/docker/docker-compose-reactiveresume-only.yml`
- **Command:** `docker compose -f scripts/docker/docker-compose-reactiveresume-only.yml up default`
- **Description:** Service from scripts/docker/docker-compose-reactiveresume-only.yml
- **Status:** untriaged

#### RP0105: `services`

- **Referenced By:** `services/skyvern/docker-compose.yml`
- **Command:** `docker compose -f services/skyvern/docker-compose.yml up services`
- **Description:** Service from services/skyvern/docker-compose.yml
- **Status:** untriaged

#### RP0106: `postgres`

- **Referenced By:** `services/skyvern/docker-compose.yml`
- **Command:** `docker compose -f services/skyvern/docker-compose.yml up postgres`
- **Description:** Service from services/skyvern/docker-compose.yml
- **Status:** untriaged

#### RP0107: `skyvern`

- **Referenced By:** `services/skyvern/docker-compose.yml`
- **Command:** `docker compose -f services/skyvern/docker-compose.yml up skyvern`
- **Description:** Service from services/skyvern/docker-compose.yml
- **Status:** untriaged

#### RP0108: `skyvern-ui`

- **Referenced By:** `services/skyvern/docker-compose.yml`
- **Command:** `docker compose -f services/skyvern/docker-compose.yml up skyvern-ui`
- **Description:** Service from services/skyvern/docker-compose.yml
- **Status:** untriaged

### docs-command (8 entries)

#### RP0129: `ps --filter name=skyvern`

- **Referenced By:** `docs/automation\LINKEDIN_AUTOMATION.md`
- **Command:** `docker ps --filter name=skyvern`
- **Description:** Command referenced in docs/automation\LINKEDIN_AUTOMATION.md
- **Status:** untriaged

#### RP0130: `logs skyvern-api --tail 50`

- **Referenced By:** `docs/automation\LINKEDIN_AUTOMATION.md`
- **Command:** `docker logs skyvern-api --tail 50`
- **Description:** Command referenced in docs/automation\LINKEDIN_AUTOMATION.md
- **Status:** untriaged

#### RP0131: `-f docker-compose.skyvern.yml down`

- **Referenced By:** `docs/automation\LINKEDIN_AUTOMATION.md`
- **Command:** `docker-compose -f docker-compose.skyvern.yml down`
- **Description:** Command referenced in docs/automation\LINKEDIN_AUTOMATION.md
- **Status:** untriaged

#### RP0132: `-f docker-compose.skyvern.yml up -d`

- **Referenced By:** `docs/automation\LINKEDIN_AUTOMATION.md`
- **Command:** `docker-compose -f docker-compose.skyvern.yml up -d`
- **Description:** Command referenced in docs/automation\LINKEDIN_AUTOMATION.md
- **Status:** untriaged

#### RP0133: `ps`

- **Referenced By:** `docs/automation\QUICKSTART.md`
- **Command:** `docker ps`
- **Description:** Command referenced in docs/automation\QUICKSTART.md
- **Status:** untriaged

#### RP0134: `-f docker-compose.skyvern.yml up -d`

- **Referenced By:** `docs/automation\SETUP_AND_TROUBLESHOOTING.md`
- **Command:** `docker-compose -f docker-compose.skyvern.yml up -d`
- **Description:** Command referenced in docs/automation\SETUP_AND_TROUBLESHOOTING.md
- **Status:** untriaged

#### RP0135: `ps --filter name=skyvern`

- **Referenced By:** `docs/automation\SETUP_AND_TROUBLESHOOTING.md`
- **Command:** `docker ps --filter name=skyvern`
- **Description:** Command referenced in docs/automation\SETUP_AND_TROUBLESHOOTING.md
- **Status:** untriaged

#### RP0136: `logs skyvern-api | findstr "API"`

- **Referenced By:** `docs/automation\SETUP_AND_TROUBLESHOOTING.md`
- **Command:** `docker logs skyvern-api | findstr "API"`
- **Description:** Command referenced in docs/automation\SETUP_AND_TROUBLESHOOTING.md
- **Status:** untriaged

### npm-script (34 entries)

#### RP0001: `dev`

- **Referenced By:** `package.json`
- **Command:** `nx run-many -t serve`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0002: `test`

- **Referenced By:** `package.json`
- **Command:** `pnpm vitest run`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0003: `prebuild`

- **Referenced By:** `package.json`
- **Command:** `pnpm prisma:generate`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0004: `build`

- **Referenced By:** `package.json`
- **Command:** `nx run-many -t build`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0005: `prestart`

- **Referenced By:** `package.json`
- **Command:** `pnpm prisma:migrate`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0006: `start`

- **Referenced By:** `package.json`
- **Command:** `node dist/apps/server/main`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0007: `lint`

- **Referenced By:** `package.json`
- **Command:** `nx run-many -t lint`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0008: `lint:fix`

- **Referenced By:** `package.json`
- **Command:** `nx run-many -t lint --fix`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0009: `format`

- **Referenced By:** `package.json`
- **Command:** `pnpm exec prettier -c --log-level error .`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0010: `format:fix`

- **Referenced By:** `package.json`
- **Command:** `pnpm exec prettier -w --log-level error .`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0011: `crowdin:sync`

- **Referenced By:** `package.json`
- **Command:** `crowdin push && crowdin pull`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0012: `prisma:generate`

- **Referenced By:** `package.json`
- **Command:** `pnpm exec prisma generate`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0013: `prisma:migrate`

- **Referenced By:** `package.json`
- **Command:** `pnpm exec prisma migrate deploy`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0014: `prisma:migrate:dev`

- **Referenced By:** `package.json`
- **Command:** `pnpm exec prisma migrate dev`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0015: `prisma:studio`

- **Referenced By:** `package.json`
- **Command:** `pnpm exec prisma studio`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0016: `messages:extract`

- **Referenced By:** `package.json`
- **Command:** `pnpm exec lingui extract --clean --overwrite`
- **Description:** Script from package.json
- **Status:** untriaged

#### RP0017: `dev`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `vite & npm run run-artifact-server`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0018: `build`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `tsc --noEmit && vite build`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0019: `lint`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0020: `format`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `prettier --write .`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0021: `preview`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `vite preview`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0022: `prepare`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `cd .. && husky skyvern-frontend/.husky`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0023: `precommit`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `lint-staged`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0024: `run-artifact-server`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `node artifactServer.js`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0025: `serve`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `npm run build && node localServer.js`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0026: `test`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `vitest run`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0027: `start`

- **Referenced By:** `services/skyvern/skyvern-frontend/package.json`
- **Command:** `npm run serve & npm run run-artifact-server`
- **Description:** Script from services/skyvern/skyvern-frontend/package.json
- **Status:** untriaged

#### RP0028: `preinstall`

- **Referenced By:** `services/skyvern/integrations/n8n/package.json`
- **Command:** `npx only-allow pnpm`
- **Description:** Script from services/skyvern/integrations/n8n/package.json
- **Status:** untriaged

#### RP0029: `build`

- **Referenced By:** `services/skyvern/integrations/n8n/package.json`
- **Command:** `rimraf dist && tsc && gulp build:icons`
- **Description:** Script from services/skyvern/integrations/n8n/package.json
- **Status:** untriaged

#### RP0030: `dev`

- **Referenced By:** `services/skyvern/integrations/n8n/package.json`
- **Command:** `tsc --watch`
- **Description:** Script from services/skyvern/integrations/n8n/package.json
- **Status:** untriaged

#### RP0031: `format`

- **Referenced By:** `services/skyvern/integrations/n8n/package.json`
- **Command:** `prettier nodes credentials --write`
- **Description:** Script from services/skyvern/integrations/n8n/package.json
- **Status:** untriaged

#### RP0032: `lint`

- **Referenced By:** `services/skyvern/integrations/n8n/package.json`
- **Command:** `eslint nodes credentials package.json`
- **Description:** Script from services/skyvern/integrations/n8n/package.json
- **Status:** untriaged

#### RP0033: `lintfix`

- **Referenced By:** `services/skyvern/integrations/n8n/package.json`
- **Command:** `eslint nodes credentials package.json --fix`
- **Description:** Script from services/skyvern/integrations/n8n/package.json
- **Status:** untriaged

#### RP0034: `prepublishOnly`

- **Referenced By:** `services/skyvern/integrations/n8n/package.json`
- **Command:** `pnpm build && pnpm lint -c .eslintrc.prepublish.js nodes credentials package.json`
- **Description:** Script from services/skyvern/integrations/n8n/package.json
- **Status:** untriaged

### root-script-ps1 (4 entries)

#### RP0124: `start-local.ps1`

- **Referenced By:** `.`
- **Command:** `./start-local.ps1`
- **Description:** Root-level script: start-local.ps1
- **Status:** untriaged

#### RP0126: `test-import.ps1`

- **Referenced By:** `.`
- **Command:** `./test-import.ps1`
- **Description:** Root-level script: test-import.ps1
- **Status:** untriaged

#### RP0127: `test-local-postgres.ps1`

- **Referenced By:** `.`
- **Command:** `./test-local-postgres.ps1`
- **Description:** Root-level script: test-local-postgres.ps1
- **Status:** untriaged

#### RP0128: `copy-arc-to-docker.ps1`

- **Referenced By:** `.`
- **Command:** `./copy-arc-to-docker.ps1`
- **Description:** Root-level script: copy-arc-to-docker.ps1
- **Status:** untriaged

### root-script-sh (1 entries)

#### RP0125: `deploy-server.sh`

- **Referenced By:** `.`
- **Command:** `./deploy-server.sh`
- **Description:** Root-level script: deploy-server.sh
- **Status:** untriaged

### script-js (3 entries)

#### RP0109: `runpaths.js`

- **Referenced By:** `scripts/audit\runpaths.js`
- **Command:** `scripts/audit\runpaths.js`
- **Description:** Script file: scripts/audit\runpaths.js
- **Status:** untriaged

#### RP0119: `complete-database-import.js`

- **Referenced By:** `scripts/production\complete-database-import.js`
- **Command:** `scripts/production\complete-database-import.js`
- **Description:** Script file: scripts/production\complete-database-import.js
- **Status:** untriaged

#### RP0120: `export-current-database.js`

- **Referenced By:** `scripts/production\export-current-database.js`
- **Command:** `scripts/production\export-current-database.js`
- **Description:** Script file: scripts/production\export-current-database.js
- **Status:** untriaged

### script-ps1 (7 entries)

#### RP0110: `setup-simple-vnc.ps1`

- **Referenced By:** `scripts/debug\setup-simple-vnc.ps1`
- **Command:** `scripts/debug\setup-simple-vnc.ps1`
- **Description:** Script file: scripts/debug\setup-simple-vnc.ps1
- **Status:** untriaged

#### RP0111: `setup-vnc-access.ps1`

- **Referenced By:** `scripts/debug\setup-vnc-access.ps1`
- **Command:** `scripts/debug\setup-vnc-access.ps1`
- **Description:** Script file: scripts/debug\setup-vnc-access.ps1
- **Status:** untriaged

#### RP0112: `setup-x11-forwarding.ps1`

- **Referenced By:** `scripts/debug\setup-x11-forwarding.ps1`
- **Command:** `scripts/debug\setup-x11-forwarding.ps1`
- **Description:** Script file: scripts/debug\setup-x11-forwarding.ps1
- **Status:** untriaged

#### RP0113: `local-setup-complete-stack.ps1`

- **Referenced By:** `scripts/development\local-setup-complete-stack.ps1`
- **Command:** `scripts/development\local-setup-complete-stack.ps1`
- **Description:** Script file: scripts/development\local-setup-complete-stack.ps1
- **Status:** untriaged

#### RP0114: `local-setup-reactiveresume-only.ps1`

- **Referenced By:** `scripts/development\local-setup-reactiveresume-only.ps1`
- **Command:** `scripts/development\local-setup-reactiveresume-only.ps1`
- **Description:** Script file: scripts/development\local-setup-reactiveresume-only.ps1
- **Status:** untriaged

#### RP0116: `setup.ps1`

- **Referenced By:** `scripts/legacy\setup.ps1`
- **Command:** `scripts/legacy\setup.ps1`
- **Description:** Script file: scripts/legacy\setup.ps1
- **Status:** untriaged

#### RP0118: `start-complete-system.ps1`

- **Referenced By:** `scripts/legacy\start-complete-system.ps1`
- **Command:** `scripts/legacy\start-complete-system.ps1`
- **Description:** Script file: scripts/legacy\start-complete-system.ps1
- **Status:** untriaged

### script-sh (5 entries)

#### RP0115: `init-multiple-dbs.sh`

- **Referenced By:** `scripts/init-multiple-dbs.sh`
- **Command:** `scripts/init-multiple-dbs.sh`
- **Description:** Script file: scripts/init-multiple-dbs.sh
- **Status:** untriaged

#### RP0117: `setup.sh`

- **Referenced By:** `scripts/legacy\setup.sh`
- **Command:** `scripts/legacy\setup.sh`
- **Description:** Script file: scripts/legacy\setup.sh
- **Status:** untriaged

#### RP0121: `server-setup-complete-stack.sh`

- **Referenced By:** `scripts/production\server-setup-complete-stack.sh`
- **Command:** `scripts/production\server-setup-complete-stack.sh`
- **Description:** Script file: scripts/production\server-setup-complete-stack.sh
- **Status:** untriaged

#### RP0122: `server-setup-reactiveresume-only.sh`

- **Referenced By:** `scripts/production\server-setup-reactiveresume-only.sh`
- **Command:** `scripts/production\server-setup-reactiveresume-only.sh`
- **Description:** Script file: scripts/production\server-setup-reactiveresume-only.sh
- **Status:** untriaged

#### RP0123: `test-automation.sh`

- **Referenced By:** `scripts/test-automation.sh`
- **Command:** `scripts/test-automation.sh`
- **Description:** Script file: scripts/test-automation.sh
- **Status:** untriaged

---

## Next Steps (Phase B)

1. Review catalog and identify canonical commands per use-case
2. Mark duplicates and deprecated entries
3. Create shims for backward compatibility
4. Update documentation to reference canonical paths only

