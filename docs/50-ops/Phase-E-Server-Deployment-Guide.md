# Phase E: Server Deployment Guide

**Status**: Production Ready  
**Last Updated**: 2025-10-03  
**Environment**: Linux Production Server

---

## Overview

This guide provides step-by-step instructions for deploying Reactive Resume Tracker to a production Linux server, including:
- Database migration from local to server
- Docker services configuration
- Ollama LLM setup
- User LLM provider configuration
- Health verification

---

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or similar Linux distribution
- **RAM**: 8GB minimum (16GB recommended for Ollama)
- **Storage**: 50GB minimum (more for Ollama models)
- **CPU**: 4 cores minimum
- **Ports**: 3000, 5173, 5432, 6379, 9000, 9001, 11434

### Software Requirements
```bash
# Install required software
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm pm2
sudo apt-get install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

### Access Requirements
- SSH access to server
- Git repository access
- Environment variables and secrets

---

## Step 1: Prepare Database Dump (Local)

### Export Current Database

The database has already been exported as `postgres-backup.dump`. To create a fresh dump:

```powershell
# Windows (PowerShell)
.\scripts\production\export-current-database.js

# Or manual export
docker exec reactive-resume-postgres pg_dump -U reactive_resume -Fc reactive_resume > postgres-backup.dump
```

### Verify Dump
```powershell
# Check file size (should be > 100KB if you have data)
Get-Item postgres-backup.dump | Select-Object Name, Length

# Quick validation
docker exec reactive-resume-postgres pg_restore --list postgres-backup.dump
```

### Transfer to Server
```bash
# From local machine
scp postgres-backup.dump user@server:/path/to/ReactiveResumeTracker/
```

---

## Step 2: Clone and Configure on Server

### Clone Repository
```bash
ssh user@server

# Navigate to deployment directory
cd /home/user/

# Clone or pull latest
git clone <your-repo-url> ReactiveResumeTracker
cd ReactiveResumeTracker
git pull origin main  # Or your branch
```

### Configure Environment

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   nano .env  # Or vim/vi
   ```

2. **Configure critical variables:**
   ```bash
   # Database
   DATABASE_URL=postgresql://reactive_resume:reactive_resume_2024@localhost:55432/reactive_resume?schema=public&sslmode=disable

   # Redis
   REDIS_URL=redis://localhost:6379

   # Storage (MinIO)
   STORAGE_ENDPOINT=localhost:9000
   STORAGE_ACCESS_KEY=minioadmin
   STORAGE_SECRET_KEY=minioadmin123
   STORAGE_BUCKET=reactive-resume

   # Chrome (PDF generation)
   CHROME_URL=http://localhost:3001
   CHROME_TOKEN=chrome-token-12345

   # LLM Providers (System-level defaults)
   # Option 1: Use Anthropic Claude (recommended)
   ANTHROPIC_API_KEY=<your-anthropic-key>

   # Option 2: Use local Ollama
   LLM_PROVIDER=local
   LOCAL_LLM_BASE_URL=http://localhost:11434/v1
   LOCAL_LLM_MODEL=llama3:8b

   # Embeddings (for content matching)
   COHERE_API_KEY=<your-cohere-key>

   # Skyvern (optional - set to false if not using)
   SKYVERN_ENABLED=false

   # JWT Secret (generate with: openssl rand -base64 32)
   JWT_SECRET=<generate-strong-secret>

   # Public URL
   PUBLIC_URL=http://your-server-ip:5173
   VITE_API_URL=http://your-server-ip:3000/api
   ```

---

## Step 3: Import Database

### Start PostgreSQL Service

```bash
# Start only Postgres (from unified-docker-compose.yml)
docker compose -f self-hosted-infrastructure.yml up -d reactive-resume-db

# Wait for Postgres to be ready
sleep 10

# Verify
docker exec reactive-resume-db pg_isready -U reactive_resume
```

### Import Database Dump

```bash
# Import the dump
docker cp postgres-backup.dump reactive-resume-db:/tmp/backup.dump

docker exec reactive-resume-db pg_restore \
  -U reactive_resume \
  -d reactive_resume \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  /tmp/backup.dump

# If you get errors about existing database, drop and recreate:
docker exec -it reactive-resume-db psql -U reactive_resume -c "DROP DATABASE IF EXISTS reactive_resume;"
docker exec -it reactive-resume-db psql -U reactive_resume -c "CREATE DATABASE reactive_resume;"

# Then retry import
docker exec reactive-resume-db pg_restore \
  -U reactive_resume \
  -d reactive_resume \
  /tmp/backup.dump
```

### Verify Data

```bash
# Check tables exist
docker exec -it reactive-resume-db psql -U reactive_resume -d reactive_resume -c "\dt"

# Check user count
docker exec -it reactive-resume-db psql -U reactive_resume -d reactive_resume -c "SELECT COUNT(*) FROM \"User\";"

# Check timestamps are correct (should show dates in 2025)
docker exec -it reactive-resume-db psql -U reactive_resume -d reactive_resume -c "SELECT id, email, \"createdAt\" FROM \"User\" LIMIT 5;"
```

---

## Step 4: Deploy Application

### Option A: Automatic Deployment (Recommended)

```bash
# Full deployment (stops old containers, rebuilds, migrates, starts PM2)
./scripts/production/deploy-server.sh

# Or with flags:
./scripts/production/deploy-server.sh --skip-build  # If already built
./scripts/production/deploy-server.sh --skip-docker  # If Docker already running
./scripts/production/deploy-server.sh --clean  # Fresh install
```

**What the script does:**
1. Stops existing PM2 processes (`imin_backend_dev`, `imin_frontend_dev`)
2. Cleans up ports (3000, 5173)
3. **Stops and removes old Docker containers** (`docker compose down`)
4. Starts fresh Docker services (`docker compose up -d`)
5. Installs dependencies (`pnpm install`)
6. Builds application (`pnpm build`)
7. Runs database migrations (`pnpm prisma:migrate`)
8. Starts services with PM2
9. Verifies health

### Option B: Manual Deployment

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Generate Prisma client
pnpm prisma:generate

# 3. Build applications
pnpm build

# 4. Start Docker services
docker compose -f self-hosted-infrastructure.yml up -d

# Wait for services
sleep 15

# 5. Run migrations (if needed - should already be in dump)
pnpm prisma:migrate

# 6. Start with PM2
pm2 start npm --name "imin_backend_dev" -- run start
pm2 save
```

---

## Step 5: Configure Ollama (Optional)

If you're using Ollama for local LLM instead of cloud providers:

### Start Ollama Service

Ollama is already configured in `self-hosted-infrastructure.yml`:

```yaml
ollama:
  image: ollama/ollama:latest
  container_name: ollama-llm
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
```

### Download Models

```bash
# Pull recommended model
docker exec -it ollama-llm ollama pull llama3:8b

# Or other models:
docker exec -it ollama-llm ollama pull qwen2.5:7b
docker exec -it ollama-llm ollama pull mistral:7b

# List installed models
docker exec -it ollama-llm ollama list
```

### Configure System Default

Update `.env`:
```bash
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://localhost:11434/v1
LOCAL_LLM_MODEL=llama3:8b
LOCAL_LLM_API_KEY=  # Leave empty for local Ollama
```

### Verify Ollama

```bash
# Check health
curl http://localhost:11434/api/version

# Test generation
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3:8b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## Step 6: User LLM Configuration

### How LLM Provider Selection Works

Reactive Resume supports **per-user LLM configuration**. Each user can choose their own provider and API keys.

#### System-Level vs User-Level

| Level | Purpose | Configuration Location |
|-------|---------|------------------------|
| **System** | Default/fallback when user has no keys | `.env` file (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.) |
| **User** | Per-user provider and keys | Settings → AI/LLM Integration |

#### Provider Priority

1. **User's provider** (if they have API keys configured)
2. **System fallback** (if user enables "Use system as backup")
3. **Error** (if user has no keys and backup is disabled)

### User Configuration Steps

**For each user on the platform:**

1. **Login to application:**
   ```
   http://your-server-ip:5173
   ```

2. **Navigate to Settings:**
   ```
   Dashboard → Settings → AI/LLM Integration
   ```

3. **Select Provider:**
   - **OpenAI** - Best for GPT-4 (requires OpenAI API key)
   - **Anthropic** - Best for Claude (recommended, requires Anthropic API key)
   - **Ollama (Local)** - Use server's Ollama instance

4. **Configure Provider-Specific Settings:**

#### Option 1: User's Own API Keys (Cloud)

**Anthropic (Recommended):**
```
Provider: Anthropic (Claude)
API Key: sk-ant-api03-<your-key>
Model: claude-3-5-sonnet-20241022
Max Tokens: 4000
Temperature: 0.1
```

**OpenAI:**
```
Provider: OpenAI
API Key: sk-proj-<your-key>
Model: gpt-4-turbo-preview
Base URL: (leave empty)
Max Tokens: 4000
Temperature: 0.1
```

#### Option 2: Use Server's Ollama (Free, Local)

**Ollama Configuration:**
```
Provider: Ollama (Local)
Base URL: http://localhost:11434/v1
Model: llama3:8b  # Or whichever model you installed
API Key: sk-1234567890abcdef  # Dummy key (required by UI, but ignored)
Max Tokens: 4000
Temperature: 0.1
```

**Important Notes for Ollama:**
- ✅ No API key cost - completely free
- ✅ Data privacy - all processing happens locally
- ⚠️ Requires server to have Ollama running (`docker ps | grep ollama`)
- ⚠️ Performance depends on server CPU/RAM
- ⚠️ Model quality may be lower than Claude/GPT-4

5. **Enable System Backup (Optional):**
   ```
   ☑ Use system default as backup
   ```
   This allows falling back to the system-level provider (from `.env`) if user's keys fail.

6. **Save Settings**

### Verify User Configuration

```bash
# Check user settings in database
docker exec -it reactive-resume-db psql -U reactive_resume -d reactive_resume -c \
  "SELECT \"userId\", provider, \"ollamaBaseUrl\", \"ollamaModel\", \"useSystemDefaultAsBackup\" FROM \"UserLLMSettings\";"
```

---

## Step 7: Verify Deployment

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "ok",
#   "info": {
#     "database": { "status": "up" },
#     "storage": { "status": "up" },
#     "browser": { "status": "up" }
#   }
# }

# Docker services
docker ps

# PM2 processes
pm2 list

# PM2 logs
pm2 logs

# Ollama (if configured)
curl http://localhost:11434/api/version
```

### Test Core Features

1. **Login**: http://your-server-ip:5173
2. **Create Resume**: Test resume builder
3. **Job Application**: Create a job application
4. **LLM Features**:
   - Analyze job description (uses user's LLM config)
   - Generate cover letter (uses user's LLM config)
   - Tailor resume (uses user's LLM config)

---

## Step 8: Post-Deployment

### Configure PM2 Startup

```bash
# Generate startup script
pm2 startup

# Follow the instructions (will output a command to run with sudo)

# Save current process list
pm2 save
```

### Configure Firewall

```bash
# Allow application ports
sudo ufw allow 3000/tcp  # Backend
sudo ufw allow 5173/tcp  # Frontend (or use reverse proxy)
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

### Set Up Reverse Proxy (Optional)

Use Nginx or Traefik to:
- Serve on port 80/443
- Add SSL/TLS
- Handle domains

**Example Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

### Monitor Services

```bash
# PM2 monitoring
pm2 monit

# Docker logs
docker compose -f self-hosted-infrastructure.yml logs -f

# System resources
htop
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check Postgres is running
docker ps | grep postgres

# Check connection
docker exec -it reactive-resume-db psql -U reactive_resume -d reactive_resume -c "SELECT 1;"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### PM2 Process Crashes

```bash
# Check logs
pm2 logs imin_backend_dev --lines 100

# Common issues:
# - Missing environment variables
# - Database not accessible
# - Port already in use

# Restart
pm2 restart all
```

### Ollama Not Working

```bash
# Check Ollama is running
docker ps | grep ollama

# Check models are installed
docker exec -it ollama-llm ollama list

# Test directly
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3:8b", "messages": [{"role": "user", "content": "test"}]}'

# Check user settings in app
# Settings → AI/LLM Integration → Provider: Ollama
# Base URL should be: http://localhost:11434/v1
```

### Port Conflicts

```bash
# Check what's using a port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or use the deployment script to clean up
./scripts/production/deploy-server.sh
```

---

## Maintenance

### Update Application

```bash
cd /path/to/ReactiveResumeTracker

# Pull latest code
git pull origin main

# Run deployment script
./scripts/production/deploy-server.sh
```

### Backup Database

```bash
# Automated backup
docker exec reactive-resume-db pg_dump -U reactive_resume -Fc reactive_resume > backup-$(date +%Y%m%d).dump

# Or use the backup script
node scripts/production/export-current-database.js
```

### Update Ollama Models

```bash
# Pull latest model version
docker exec -it ollama-llm ollama pull llama3:8b

# Restart to apply
docker restart ollama-llm
```

---

## Architecture Summary

```
┌─────────────────────────────────────────┐
│          Production Server              │
├─────────────────────────────────────────┤
│                                         │
│  PM2 Processes:                         │
│  ├─ imin_backend_dev (Node.js)         │
│  └─ imin_frontend_dev (Vite)           │
│                                         │
│  Docker Services:                       │
│  ├─ PostgreSQL (5432)                  │
│  ├─ Redis (6379)                       │
│  ├─ MinIO (9000, 9001)                 │
│  ├─ Chrome (3001)                      │
│  └─ Ollama (11434) [Optional]         │
│                                         │
│  User LLM Config (Per-User):           │
│  ├─ Provider: OpenAI/Anthropic/Ollama  │
│  ├─ API Keys: User-provided or system   │
│  └─ Fallback: System default (optional)│
│                                         │
└─────────────────────────────────────────┘
```

---

## See Also

- [Docker Services](./Docker-Services.md) - Complete service catalog
- [Service Health](./Service-Health.md) - Health check commands
- [Run Paths Catalog](./Run-Paths-Catalog.md) - All executable commands
- [Project Overview](../00-foundation/Project-Overview.md) - System architecture

---

**Questions?** Check logs with `pm2 logs` and `docker compose logs -f`

