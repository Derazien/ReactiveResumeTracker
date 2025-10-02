# Docker Services Catalog

**Last Updated**: 2025-10-02  
**Source**: Canonical compose files

---

## ⚠️ Development-Only Credentials

**CRITICAL**: All default credentials shown in this document are **FOR DEVELOPMENT ONLY**.

For production deployments:
- ✅ **ALWAYS** change default passwords
- ✅ **ALWAYS** use secrets from `.env` file
- ✅ **NEVER** commit `.env` to version control
- ✅ Use strong, randomly generated secrets

Default credentials in compose files are placeholders. Real secrets must come from your `.env` file.

---

## Canonical Compose Files

| File | Purpose | Services | Use Case |
|------|---------|----------|----------|
| `unified-docker-compose.yml` | Local development with full stack | 9 | Development + automation testing |
| `self-hosted-infrastructure.yml` | Production deployment | 16 | Self-hosted production environment |

---

## Services (unified-docker-compose.yml)

### postgres-main
**Image**: `postgres:16-alpine`  
**Container**: `reactive-resume-postgres`  
**Context**: Primary PostgreSQL database for ReactiveResume application

**Ports**:
- `5432:5432` — PostgreSQL server

**Environment Variables**:
- `POSTGRES_DB=reactive_resume`
- `POSTGRES_USER=reactive_resume`
- `POSTGRES_PASSWORD=reactive_resume_2024`

**Volumes**:
- `postgres_main_data:/var/lib/postgresql/data`

**Healthcheck**:
```bash
pg_isready -U reactive_resume -d reactive_resume
Interval: 30s, Timeout: 10s, Retries: 5
```

---

### redis
**Image**: `redis:7-alpine`  
**Container**: `reactive-resume-redis`  
**Context**: Cache and session storage for ReactiveResume

**Ports**:
- `6379:6379` — Redis server

**Volumes**:
- `redis_data:/data`

**Healthcheck**:
```bash
redis-cli ping
Interval: 30s, Timeout: 10s, Retries: 5
```

---

### minio
**Image**: `minio/minio:latest`  
**Container**: `reactive-resume-minio`  
**Context**: S3-compatible object storage for avatars, PDFs, uploads

**Ports**:
- `9000:9000` — MinIO API
- `9001:9001` — MinIO Console

**Environment Variables**:
- `MINIO_ROOT_USER=minioadmin`
- `MINIO_ROOT_PASSWORD=minioadmin123`

**Volumes**:
- `minio_data:/data`

**Command**: `server /data --console-address ":9001"`

**Healthcheck**:
```bash
curl -f http://localhost:9000/minio/health/live
Interval: 30s, Timeout: 10s, Retries: 3
```

---

### chrome
**Image**: `browserless/chrome:latest`  
**Container**: `reactive-resume-chrome`  
**Context**: Headless Chrome for PDF generation and preview rendering

**Ports**:
- `3001:3000` — Chrome automation API

**Environment Variables**:
- `TOKEN=chrome-token-12345`
- `CONCURRENT=10`
- `ENABLE_DEBUGGER=false`

**Healthcheck**:
```bash
curl -f http://localhost:3001/json/version
Interval: 30s, Timeout: 10s, Retries: 3
```

**Note**: Chrome is on port 3001 (host) but listens on 3000 internally. Healthcheck uses container's internal port.

---

### skyvern-postgres
**Image**: `postgres:14-alpine`  
**Container**: `skyvern-postgres`  
**Context**: PostgreSQL database for Skyvern automation engine

**Ports**:
- `5433:5432` — PostgreSQL (alternate port)

**Environment Variables**:
- `POSTGRES_USER=skyvern`
- `POSTGRES_PASSWORD=skyvern123`
- `POSTGRES_DB=skyvern`

**Volumes**:
- `skyvern_postgres_data:/var/lib/postgresql/data`

**Healthcheck**:
```bash
pg_isready -U skyvern -d skyvern
Interval: 30s, Timeout: 10s, Retries: 5
```

---

### skyvern-redis
**Image**: `redis:alpine`  
**Container**: `skyvern-redis`  
**Context**: Redis cache for Skyvern automation tasks

**Ports**:
- `6380:6379` — Redis (alternate port)

**Healthcheck**:
```bash
redis-cli ping
Interval: 30s, Timeout: 10s, Retries: 5
```

---

### skyvern
**Image**: `public.ecr.aws/skyvern/skyvern:latest`  
**Container**: `skyvern-api`  
**Context**: Skyvern automation engine API for LinkedIn job scraping

**Ports**:
- `8000:8000` — API server
- `9222:9222` — Chrome DevTools debugging
- `5900:5900` — VNC access for visual debugging

**Environment Variables**:
- `DATABASE_STRING=postgresql+psycopg://skyvern:skyvern123@skyvern-postgres:5432/skyvern`
- `REDIS_URL=redis://skyvern-redis:6379`
- `BROWSER_TYPE=chromium-headful`
- `CHROME_USER_DATA_DIR=/tmp/chrome-user-data`
- `ENABLE_CODE_BLOCK=true`
- `ENABLE_ANTHROPIC=true`
- `LLM_KEY=ANTHROPIC_CLAUDE3.5_HAIKU`
- `ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}`
- `SKYVERN_API_KEY=${SKYVERN_API_KEY}`
- `SKYVERN_TELEMETRY=false`
- `ALLOWED_HOSTS=["66.96.83.44", "localhost", "127.0.0.1"]`
- `BLOCKED_HOSTS=[]`
- `API_PORT=8000`

**Volumes**:
- `skyvern_data:/app/data`

**Dependencies**: skyvern-postgres, skyvern-redis

**Healthcheck**:
```bash
wget --quiet --tries=1 --spider http://localhost:8000/docs
Interval: 30s, Timeout: 10s, Retries: 5
```

---

### skyvern-ui
**Image**: `public.ecr.aws/skyvern/skyvern-ui:latest`  
**Container**: `skyvern-ui`  
**Context**: Skyvern web UI for workflow management

**Ports**:
- `8081:8080` — Web UI
- `9091:9090` — Artifact server

**Environment Variables**:
- `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- `VITE_WSS_BASE_URL=ws://localhost:8000/api/v1`
- `VITE_ARTIFACT_API_BASE_URL=http://localhost:9091`
- `VITE_SKYVERN_API_KEY=${SKYVERN_API_KEY}`
- `SKYVERN_API_URL=http://skyvern:8000`

**Dependencies**: skyvern

---

### ollama
**Image**: `ollama/ollama:latest`  
**Container**: `ollama`  
**Context**: Local LLM service for privacy-focused AI operations

**Ports**:
- `11434:11434` — Ollama API

**Volumes**:
- `ollama_data:/root/.ollama`

---

## Additional Production Services (self-hosted-infrastructure.yml)

### ollama-loader
**Image**: `curlimages/curl:latest`  
**Container**: `ollama-model-loader`  
**Context**: One-time model loader for Llama 3.1 8B

**Purpose**: Downloads and loads Llama 3.1 8B model on first startup

**Dependencies**: ollama (waits for healthy state)

**Restart**: `no` (runs once)

---

### reactive-resume-server
**Image**: `node:18-alpine`  
**Container**: `reactive-resume-server`  
**Context**: ReactiveResume backend in production mode

**Ports**:
- `3000:3000` — API server

**Environment Variables**:
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...`
- `JWT_SECRET=...`
- `OLLAMA_URL=http://ollama:11434`

**Command**: `npm install && npx prisma migrate deploy && npm run start:prod`

---

### reactive-resume-client
**Image**: `node:18-alpine`  
**Container**: `reactive-resume-client`  
**Context**: ReactiveResume frontend in production mode

**Ports**:
- `5173:5173` — Web server

**Environment Variables**:
- `NODE_ENV=production`
- `VITE_SERVER_URL=http://localhost:3000`

**Command**: `npm install && npm run build && npx serve -s dist -l 5173`

---

### n8n-db
**Image**: `postgres:15`  
**Container**: `n8n-postgres`  
**Context**: PostgreSQL for n8n workflow automation

**Environment Variables**:
- `POSTGRES_DB=n8n`
- `POSTGRES_USER=n8n`
- `POSTGRES_PASSWORD=n8n_password_change_this`

**Volumes**:
- `n8n_db_data:/var/lib/postgresql/data`

---

### n8n
**Image**: `n8nio/n8n:latest`  
**Container**: `n8n-automation`  
**Context**: Workflow automation platform

**Ports**:
- `5678:5678` — n8n web UI

**Environment Variables**:
- `DB_TYPE=postgresdb`
- `DB_POSTGRESDB_HOST=n8n-db`
- `N8N_BASIC_AUTH_ACTIVE=true`
- `N8N_BASIC_AUTH_USER=admin`
- `N8N_BASIC_AUTH_PASSWORD=change_this_password`
- `WEBHOOK_URL=http://localhost:5678`

**Volumes**:
- `n8n_data:/home/node/.n8n`
- `./n8n-workflows:/home/node/.n8n/workflows`

---

### prometheus
**Image**: `prom/prometheus:latest`  
**Container**: `prometheus`  
**Context**: Metrics collection for monitoring

**Ports**:
- `9090:9090` — Prometheus UI

**Volumes**:
- `./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml`
- `prometheus_data:/prometheus`

---

### grafana
**Image**: `grafana/grafana:latest`  
**Container**: `grafana`  
**Context**: Metrics visualization dashboards

**Ports**:
- `3001:3000` — Grafana UI

**⚠️ Port Clash Note**: Grafana (3001) and Chrome (3001) both use port 3001 on host. However, they exist in different stacks:
- **Chrome**: unified-docker-compose.yml (dev stack)
- **Grafana**: self-hosted-infrastructure.yml (prod stack)
- You won't run both simultaneously, so no actual conflict

**Environment Variables**:
- `GF_SECURITY_ADMIN_PASSWORD=admin_password_change_this`

**Volumes**:
- `grafana_data:/var/lib/grafana`
- `./monitoring/grafana-dashboards:/etc/grafana/provisioning/dashboards`

---

### traefik
**Image**: `traefik:v3.0`  
**Container**: `traefik`  
**Context**: Reverse proxy and load balancer

**Ports**:
- `80:80` — HTTP
- `443:443` — HTTPS
- `8080:8080` — Traefik dashboard

**Volumes**:
- `/var/run/docker.sock:/var/run/docker.sock:ro`
- `./traefik:/etc/traefik`

---

### backup
**Image**: `postgres:15`  
**Container**: `backup-service`  
**Context**: Automated database backups via cron

**Environment Variables**:
- `BACKUP_SCHEDULE=0 2 * * *` (Daily at 2 AM)

**Volumes**:
- `./backups:/backups`
- `./backup-scripts:/scripts`

**Command**: Runs cron for scheduled backups

---

## Named Volumes

### unified-docker-compose.yml (6 volumes)
- `postgres_main_data` — ReactiveResume PostgreSQL data
- `redis_data` — Redis persistence
- `minio_data` — Object storage files
- `skyvern_postgres_data` — Skyvern PostgreSQL data
- `skyvern_data` — Skyvern application data
- `ollama_data` — Ollama models and data

### self-hosted-infrastructure.yml (8 volumes)
- `ollama_data` — LLM models
- `skyvern_db_data` — Skyvern database
- `skyvern_downloads` — Skyvern file downloads
- `reactive_resume_db_data` — ReactiveResume database
- `n8n_db_data` — n8n database
- `n8n_data` — n8n workflows and data
- `prometheus_data` — Prometheus metrics
- `grafana_data` — Grafana dashboards

---

## Networks

### unified-docker-compose.yml
- `reactive_resume_network` (bridge) — All services communicate on this network

### self-hosted-infrastructure.yml
- `default` (bridge) — Default Docker bridge network

---

## Service Dependencies (Startup Order)

```
unified-docker-compose.yml:
1. postgres-main, redis, skyvern-postgres, skyvern-redis, ollama (no deps)
2. minio, chrome (no deps)
3. skyvern (depends on: skyvern-postgres, skyvern-redis)
4. skyvern-ui (depends on: skyvern)

self-hosted-infrastructure.yml:
1. Databases: ollama, skyvern-db, reactive-resume-db, n8n-db
2. Caches: skyvern-redis, reactive-resume-redis
3. ollama-loader (waits for ollama healthy)
4. APIs: skyvern-api, reactive-resume-server
5. UIs: skyvern-ui, reactive-resume-client, n8n
6. Infrastructure: prometheus, grafana, traefik, backup
```

---

## Quick Reference

### Starting Services
```bash
# Local development (all services)
docker compose -f unified-docker-compose.yml up -d

# Production (full stack)
docker compose -f self-hosted-infrastructure.yml up -d

# Specific service only
docker compose -f unified-docker-compose.yml up -d postgres-main redis minio chrome
```

### Checking Status
```bash
docker compose -f unified-docker-compose.yml ps
docker compose -f unified-docker-compose.yml logs [service-name]
```

### Stopping Services
```bash
docker compose -f unified-docker-compose.yml down
docker compose -f unified-docker-compose.yml down -v  # Remove volumes too
```

---

## Port Summary

| Port | Service | Purpose |
|------|---------|---------|
| 3000 | reactive-resume-server | API (via pnpm dev, not Docker) |
| 3001 | chrome (dev) OR grafana (prod) | PDF generation API OR Metrics visualization |
| 5173 | reactive-resume-client | Frontend (via pnpm dev, not Docker) |
| 5432 | postgres-main | ReactiveResume database |
| 5433 | skyvern-postgres | Skyvern database |
| 5678 | n8n | Workflow automation UI |
| 6173 | artboard | Template renderer (via pnpm dev, not Docker) |
| 6379 | redis | ReactiveResume cache |
| 6380 | skyvern-redis | Skyvern cache |
| 8000 | skyvern-api | Skyvern automation API |
| 8080 | traefik | Reverse proxy dashboard |
| 8081 | skyvern-ui | Skyvern web UI |
| 9000 | minio | Object storage API |
| 9001 | minio | Object storage console |
| 9090 | prometheus | Metrics UI |
| 9091 | skyvern-ui | Artifact server |
| 9222 | skyvern-api | Chrome DevTools debugging |
| 11434 | ollama | Local LLM API |

---

## Environment Variables Required

### Minimum for Development (.env)
```bash
# Database
DATABASE_URL=postgresql://reactive_resume:reactive_resume_2024@localhost:5432/reactive_resume

# Redis
REDIS_URL=redis://localhost:6379

# Storage
STORAGE_ENDPOINT=localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin123
STORAGE_BUCKET=reactive-resume

# Chrome/PDF
CHROME_URL=http://localhost:3001
CHROME_TOKEN=chrome-token-12345

# LLM (at least one)
ANTHROPIC_API_KEY=sk-ant-...
# OR
OPENAI_API_KEY=sk-...
# OR
OLLAMA_URL=http://localhost:11434

# Auth
JWT_SECRET=your-secret-change-this
ACCESS_TOKEN_SECRET=your-secret-change-this
```

### Additional for Skyvern
```bash
SKYVERN_API_KEY=your-skyvern-key
```

### Additional for Production
```bash
# Email (optional)
MAIL_FROM=noreply@example.com
SMTP_URL=smtp://user:pass@smtp.example.com:587

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## Deprecated Compose Files (Do Not Use)

The following files have been moved to `_scratch/compose/` and should not be used:

❌ `docker-compose.skyvern.yml` → Use `unified-docker-compose.yml`  
❌ `scripts/docker/docker-compose-complete-stack.yml` → Use `unified-docker-compose.yml`  
❌ `scripts/docker/docker-compose-reactiveresume-only.yml` → Use `unified-docker-compose.yml`  
❌ `services/skyvern/docker-compose.yml` → Use `unified-docker-compose.yml`

All deprecated compose files have full parity with canonical files (verified in Phase B).

---

## Troubleshooting

### Service Won't Start
1. Check logs: `docker compose -f unified-docker-compose.yml logs [service]`
2. Check health: `docker compose -f unified-docker-compose.yml ps`
3. Verify environment variables in `.env`
4. Check port conflicts: `docker ps` and `netstat -an | grep [port]`

### Database Connection Failed
1. Ensure postgres is healthy: `docker compose -f unified-docker-compose.yml ps postgres-main`
2. Check DATABASE_URL matches postgres credentials
3. Run migrations: `pnpm prisma:migrate:dev`

### PDF Generation Not Working
1. Check chrome service: `docker compose -f unified-docker-compose.yml logs chrome`
2. Verify CHROME_URL and CHROME_TOKEN in .env
3. Test endpoint: `curl http://localhost:3001/json/version`

---

**For detailed service configurations**, see:
- `unified-docker-compose.yml` (local development)
- `self-hosted-infrastructure.yml` (production)

