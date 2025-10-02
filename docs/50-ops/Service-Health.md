# Service Health Checks

**Last Updated**: 2025-10-02  
**Purpose**: Curl-based health checks for all canonical services

---

## Quick Health Check (All Services)

```bash
# Source this script or copy commands below
source scripts/health-check-all.sh

# Or manually:
bash docs/50-ops/health-checks.sh
```

---

## Local Development Stack (unified-docker-compose.yml)

### PostgreSQL (ReactiveResume)
```bash
# Via Docker exec
docker exec reactive-resume-postgres pg_isready -U reactive_resume -d reactive_resume

# Expected: reactive-resume-postgres:5432 - accepting connections
# Status Code: 0 = healthy
```

### PostgreSQL (Skyvern)
```bash
docker exec skyvern-postgres pg_isready -U skyvern -d skyvern

# Expected: skyvern-postgres:5432 - accepting connections
# Status Code: 0 = healthy
```

### Redis (ReactiveResume)
```bash
docker exec reactive-resume-redis redis-cli ping

# Expected: PONG
# Status Code: 0 = healthy
```

### Redis (Skyvern)
```bash
docker exec skyvern-redis redis-cli ping

# Expected: PONG
# Status Code: 0 = healthy
```

### MinIO
```bash
curl -f http://localhost:9000/minio/health/live

# Expected: (empty 200 OK response)
# Status Code: 200 = healthy
```

**Console UI**:
```bash
curl -I http://localhost:9001

# Expected: 200 OK (MinIO Console)
# Status Code: 200 = healthy
```

### Chrome (Browserless)
```bash
curl -f http://localhost:3001/json/version

# Expected: {"Browser":"Chrome/xxx.x.xxxx.x","Protocol-Version":"x.x",...}
# Status Code: 200 = healthy
```

**WebSocket Check**:
```bash
curl -f http://localhost:3001/json

# Expected: JSON array of debugging targets
# Status Code: 200 = healthy
```

### Skyvern API
```bash
curl -f http://localhost:8000/api/v1/health

# Expected: {"status":"healthy",...}
# Status Code: 200 = healthy
```

**Swagger Docs**:
```bash
curl -f http://localhost:8000/docs

# Expected: HTML (Swagger UI)
# Status Code: 200 = healthy
```

### Skyvern UI
```bash
curl -I http://localhost:8081

# Expected: 200 OK (Frontend)
# Status Code: 200 = healthy
```

**Artifact Server**:
```bash
curl -I http://localhost:9091

# Expected: 200 OK (Artifact server)
# Status Code: 200 = healthy
```

### Ollama
```bash
curl http://localhost:11434/api/version

# Expected: {"version":"x.x.x"}
# Status Code: 200 = healthy
```

**List Models**:
```bash
curl http://localhost:11434/api/tags

# Expected: {"models":[...]}
# Status Code: 200 = healthy
```

---

## Application Services (via pnpm dev)

### ReactiveResume Server
```bash
curl -f http://localhost:3000/api/health

# Expected: {"status":"ok","info":{...},"details":{...}}
# Status Code: 200 = healthy
```

**Swagger Docs**:
```bash
curl -I http://localhost:3000/docs

# Expected: 200 OK (Swagger UI)
# Status Code: 200 = healthy
```

**OpenAPI JSON**:
```bash
curl http://localhost:3000/docs-json > docs/20-backend/openapi.json

# Exports full OpenAPI specification
```

### ReactiveResume Client
```bash
curl -I http://localhost:5173

# Expected: 200 OK (Vite dev server)
# Status Code: 200 = healthy
```

### Artboard
```bash
curl -I http://localhost:6173/artboard/

# Expected: 200 OK (Template renderer)
# Status Code: 200 = healthy
```

---

## Production-Only Services (self-hosted-infrastructure.yml)

### n8n
```bash
curl -I http://localhost:5678

# Expected: 200 OK (or 401 if basic auth enabled)
# Status Code: 200/401 = healthy
```

### Prometheus
```bash
curl -f http://localhost:9090/-/healthy

# Expected: Prometheus is Healthy.
# Status Code: 200 = healthy
```

**Metrics Endpoint**:
```bash
curl http://localhost:9090/api/v1/status/runtimeinfo

# Expected: JSON with runtime info
# Status Code: 200 = healthy
```

### Grafana
```bash
curl -f http://localhost:3001/api/health

# Expected: {"commit":"...","database":"ok","version":"..."}
# Status Code: 200 = healthy
```

**⚠️ Port Clash Note**: Grafana uses port 3001, same as Chrome. However:
- Chrome is in **unified-docker-compose.yml** (dev stack)
- Grafana is in **self-hosted-infrastructure.yml** (prod stack)
- These stacks are never run simultaneously, so no actual conflict

### Traefik
```bash
curl -f http://localhost:8080/api/overview

# Expected: JSON with router/service overview
# Status Code: 200 = healthy
```

**Dashboard**:
```bash
curl -I http://localhost:8080/dashboard/

# Expected: 200 OK (Traefik dashboard)
# Status Code: 200 = healthy
```

---

## Automated Health Check Script

Create `scripts/health-check-all.sh`:

```bash
#!/usr/bin/env bash
# Health Check All Services
# Checks all services in unified-docker-compose.yml

echo "🏥 Health Check - Unified Docker Stack"
echo "======================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
  local name=$1
  local url=$2
  
  printf "%-30s " "$name:"
  
  if curl -f -s -o /dev/null -w "%{http_code}" "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Healthy${NC}"
    return 0
  else
    echo -e "${RED}✗ Unhealthy${NC}"
    return 1
  fi
}

check_docker_exec() {
  local name=$1
  local container=$2
  local command=$3
  
  printf "%-30s " "$name:"
  
  if docker exec "$container" $command > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Healthy${NC}"
    return 0
  else
    echo -e "${RED}✗ Unhealthy${NC}"
    return 1
  fi
}

# Docker services
check_docker_exec "PostgreSQL (main)" "reactive-resume-postgres" "pg_isready -U reactive_resume"
check_docker_exec "PostgreSQL (Skyvern)" "skyvern-postgres" "pg_isready -U skyvern"
check_docker_exec "Redis (main)" "reactive-resume-redis" "redis-cli ping"
check_docker_exec "Redis (Skyvern)" "skyvern-redis" "redis-cli ping"
check_service "MinIO" "http://localhost:9000/minio/health/live"
check_service "Chrome" "http://localhost:3001/json/version"
check_service "Skyvern API" "http://localhost:8000/api/v1/health"
check_service "Skyvern UI" "http://localhost:8081"
check_service "Ollama" "http://localhost:11434/api/version"

echo ""
echo "======================================"
echo "Health check complete"
```

**Usage**:
```bash
# Make executable
chmod +x scripts/health-check-all.sh

# Run
./scripts/health-check-all.sh
```

---

## PowerShell Health Check Script

Create `scripts/health-check-all.ps1`:

```powershell
# Health Check All Services
Write-Host "🏥 Health Check - Unified Docker Stack" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

function Test-Service {
    param($Name, $Url)
    
    Write-Host -NoNewline ("{0,-30} " -f "${Name}:")
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Healthy" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ Unhealthy" -ForegroundColor Red
        return $false
    }
}

function Test-DockerExec {
    param($Name, $Container, $Command)
    
    Write-Host -NoNewline ("{0,-30} " -f "${Name}:")
    
    $result = docker exec $Container $Command 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Healthy" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Unhealthy" -ForegroundColor Red
        return $false
    }
}

# Check services
Test-DockerExec "PostgreSQL (main)" "reactive-resume-postgres" "pg_isready -U reactive_resume"
Test-DockerExec "PostgreSQL (Skyvern)" "skyvern-postgres" "pg_isready -U skyvern"
Test-DockerExec "Redis (main)" "reactive-resume-redis" "redis-cli ping"
Test-DockerExec "Redis (Skyvern)" "skyvern-redis" "redis-cli ping"
Test-Service "MinIO" "http://localhost:9000/minio/health/live"
Test-Service "Chrome" "http://localhost:3001/json/version"
Test-Service "Skyvern API" "http://localhost:8000/api/v1/health"
Test-Service "Skyvern UI" "http://localhost:8081"
Test-Service "Ollama" "http://localhost:11434/api/version"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Health check complete" -ForegroundColor Cyan
```

---

## CI/CD Integration

### GitHub Actions Matrix

```yaml
strategy:
  matrix:
    service:
      - name: postgresql-main
        check: docker exec reactive-resume-postgres pg_isready -U reactive_resume
      - name: redis-main
        check: docker exec reactive-resume-redis redis-cli ping
      - name: minio
        check: curl -f http://localhost:9000/minio/health/live
      - name: chrome
        check: curl -f http://localhost:3001/json/version
      - name: ollama
        check: curl -f http://localhost:11434/api/version
```

See **Phase D** for full CI implementation.

---

## Troubleshooting

### Service Reports Unhealthy

1. **Check logs**:
   ```bash
   docker compose -f unified-docker-compose.yml logs [service-name]
   ```

2. **Check if container is running**:
   ```bash
   docker compose -f unified-docker-compose.yml ps
   ```

3. **Restart service**:
   ```bash
   docker compose -f unified-docker-compose.yml restart [service-name]
   ```

### Port Already in Use

```bash
# Find what's using the port (Windows)
netstat -ano | findstr :9000

# Find what's using the port (Linux/Mac)
lsof -i :9000

# Or use Docker
docker ps --filter publish=9000
```

### Database Won't Connect

1. **Check database is running and healthy**:
   ```bash
   docker compose -f unified-docker-compose.yml ps postgres-main
   ```

2. **Check credentials match**:
   ```bash
   # .env file DATABASE_URL should match compose environment
   echo $DATABASE_URL
   ```

3. **Test connection directly**:
   ```bash
   docker exec -it reactive-resume-postgres psql -U reactive_resume -d reactive_resume
   ```

---

## Related Documentation

- **Service Catalog**: `docs/50-ops/Docker-Services.md`
- **Run Paths**: `docs/50-ops/Run-Paths-Catalog.md`
- **Project Overview**: `docs/00-foundation/Project-Overview.md`

---

**For automated health checks in CI**, see Phase D implementation.

