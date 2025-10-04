# Canonical Scripts Reference

**Last Updated**: 2025-10-03  
**Status**: These are the CANONICAL scripts - use these for all environments

---

## 🎯 Quick Reference

| Environment | Script | Purpose |
|-------------|--------|---------|
| **Windows Local** | `scripts/win/start-local.ps1` | Complete local development startup |
| **Linux/Mac Local** | `pnpm dev` | Simple local development |
| **Linux Server** | `scripts/production/deploy-server.sh` | Production deployment with PM2 |
| **Windows Server** | `scripts/production/deploy-server.ps1` | Production deployment with PM2 |

---

## 🖥️ Windows Local Development

### `scripts/win/start-local.ps1` ✅ CANONICAL

**Comprehensive local startup with automatic cleanup**

```powershell
# Standard startup (DEFAULT: CleanStart - stops everything and restarts)
.\scripts\win\start-local.ps1

# Skip Docker (if already running, just restart app)
.\scripts\win\start-local.ps1 -SkipDocker

# Fresh install (remove node_modules and reinstall)
.\scripts\win\start-local.ps1 -Clean
```

**What it does**:
0. ✅ Checks dependencies (auto-installs if missing):
   - `node_modules` → runs `pnpm install`
   - Prisma Client → runs `pnpm prisma:generate`
1. ✅ Checks and frees ports (3000, 5173, 6173)
2. ✅ Starts Docker services (Postgres, Redis, MinIO, Chrome, Ollama)
3. ✅ Waits for services to be healthy
4. ✅ Starts development servers (`pnpm dev`)

**Features**:
- **🆕 Automatic dependency installation** (safe for fresh clones!)
- **🆕 Prisma Client auto-generation**
- **🆕 `--Clean` flag for fresh installs**
- Automatic port cleanup (kills conflicting processes)
- Health checks for Docker services
- Colorful progress output
- Error handling

---

## 🐧 Linux/Mac Local Development

### `pnpm dev` ✅ CANONICAL

**Simple local development**

```bash
# Start Docker services first
docker compose up -d

# Then start dev servers
pnpm dev
```

---

## 🚀 Production Server Deployment

### `scripts/production/deploy-server.sh` ✅ CANONICAL (Linux)

**Complete production deployment with PM2**

```bash
# Standard deployment
./scripts/production/deploy-server.sh

# Skip build (use existing dist/)
./scripts/production/deploy-server.sh --skip-build

# Skip Docker management
./scripts/production/deploy-server.sh --skip-docker

# Clean install
./scripts/production/deploy-server.sh --clean
```

**What it does**:
1. ✅ Stops existing PM2 processes (`reactive_resume_server`, `reactive_resume_client`)
2. ✅ Cleans up ports (kills conflicting processes)
3. ✅ Stops and restarts Docker containers
4. ✅ Installs dependencies (`pnpm install --frozen-lockfile`)
5. ✅ Builds application (`pnpm build`)
6. ✅ Runs database migrations (`pnpm prisma:migrate`)
7. ✅ Starts services with PM2
8. ✅ Verifies health
9. ✅ Saves PM2 process list

**Configuration via Environment Variables**:
```bash
export PM2_BACKEND_NAME="reactive_resume_server"    # Default
export PM2_FRONTEND_NAME="reactive_resume_client"  # Default
export SERVER_PORT="3000"
export CLIENT_PORT="5173"
```

---

### `scripts/production/deploy-server.ps1` ✅ CANONICAL (Windows Server)

**Windows Server deployment with PM2**

```powershell
# Standard deployment
.\scripts\production\deploy-server.ps1

# Skip build
.\scripts\production\deploy-server.ps1 -SkipBuild

# Skip Docker
.\scripts\production\deploy-server.ps1 -SkipDocker

# Clean install
.\scripts\production\deploy-server.ps1 -Clean
```

Same functionality as Linux version, optimized for Windows PowerShell.

---

## 📋 Deployment Workflows

### Initial Server Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd ReactiveResumeTracker

# 2. Set up environment
cp env.template .env
# Edit .env with your values

# 3. Install PM2 globally
npm install -g pm2

# 4. First deployment
./scripts/production/deploy-server.sh

# 5. Set PM2 to start on boot
pm2 startup
pm2 save
```

### Regular Updates

```bash
# 1. Pull latest code
git pull origin main

# 2. Deploy
./scripts/production/deploy-server.sh

# PM2 will handle zero-downtime restart
```

### Quick Restart (No Build)

```bash
# Just restart PM2 processes
./scripts/production/deploy-server.sh --skip-build --skip-docker
```

---

## 🔧 PM2 Management

### View Logs
```bash
# All logs
pm2 logs

# Specific process
pm2 logs reactive_resume_server

# Last 100 lines
pm2 logs --lines 100
```

### Monitor Resources
```bash
pm2 monit
```

### Restart Services
```bash
# Restart all
pm2 restart all

# Restart specific
pm2 restart reactive_resume_server
```

### Stop Services
```bash
# Stop all
pm2 stop all

# Stop specific
pm2 stop reactive_resume_server
```

### View Status
```bash
pm2 list
pm2 status
```

---

## 🐳 Docker Management

### Start Services
```bash
# Development
docker compose up -d

# Production
docker compose -f self-hosted-infrastructure.yml up -d
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres-main
```

### Restart Services
```bash
docker compose restart
```

### Stop Services
```bash
docker compose down
```

---

## 🧹 Manual Cleanup (Emergency)

### Kill Processes on Ports

**Windows**:
```powershell
# Find process
netstat -ano | findstr :3000

# Kill by PID
Stop-Process -Id <PID> -Force
```

**Linux**:
```bash
# Find and kill
lsof -ti:3000 | xargs kill -9
```

### Clean Docker
```bash
# Stop all containers
docker compose down

# Remove volumes (DESTRUCTIVE)
docker compose down -v

# Prune everything (NUCLEAR)
docker system prune -a --volumes
```

### Clean Node Modules
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install --frozen-lockfile
```

---

## ❌ Deprecated Scripts

These scripts are **deprecated** and redirect to canonical commands:

- `start-local.ps1` (root) → Use `scripts/win/start-local.ps1`
- `deploy-server.sh` (root) → Use `scripts/production/deploy-server.sh`
- `scripts/development/local-setup-*.ps1` → Use `scripts/win/start-local.ps1`
- `scripts/production/server-setup-*.sh` → Use `scripts/production/deploy-server.sh`

---

## 🆘 Troubleshooting

### "Port already in use"
- Use the deployment scripts - they automatically clean ports
- Or manually: `lsof -ti:3000 | xargs kill -9` (Linux) / `Stop-Process` (Windows)

### "PM2 not found"
```bash
npm install -g pm2
```

### "Docker not running"
- Start Docker Desktop (Windows/Mac)
- Start Docker daemon (Linux): `sudo systemctl start docker`

### "Database migration failed"
```bash
# Reset and re-run
pnpm prisma:migrate:dev
```

### "Build failed"
```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

---

## 📚 See Also

- [Environment Migration Guide](../docs/00-foundation/ENV_MIGRATION_GUIDE.md)
- [Project Overview](../docs/00-foundation/Project-Overview.md)
- [Docker Services](../docs/50-ops/Docker-Services.md)
- [Run Paths Catalog](../docs/50-ops/Run-Paths-Catalog.md)

---

**Questions?** These are the canonical scripts maintained by the repository stewards.




