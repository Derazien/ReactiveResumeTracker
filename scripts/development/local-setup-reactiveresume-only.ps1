# 🚀 Local ReactiveResume Only Setup (Windows)
# ============================================
# Lightweight development setup - ReactiveResume only, no Skyvern
# Uses SQLite for fastest local development

param(
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Status,
    [switch]$Help
)

if ($Help) {
    Write-Host "ReactiveResume Local Development Setup" -ForegroundColor Blue
    Write-Host "=========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\local-setup-reactiveresume-only.ps1        # Start ReactiveResume"
    Write-Host "  .\local-setup-reactiveresume-only.ps1 -Stop  # Stop all services"
    Write-Host "  .\local-setup-reactiveresume-only.ps1 -Status # Check status"
    Write-Host "  .\local-setup-reactiveresume-only.ps1 -Restart # Restart services"
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Green
    Write-Host "  - ReactiveResume Backend (SQLite database)"
    Write-Host "  - ReactiveResume Frontend (Vite dev server)"
    Write-Host "  - Chrome PDF service (Docker)"
    Write-Host ""
    exit
}

if ($Stop) {
    Write-Host "🛑 Stopping ReactiveResume services..." -ForegroundColor Yellow
    
    # Stop Node.js processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*ReactiveResume*"} | Stop-Process -Force
    
    # Stop Chrome Docker
    docker stop reactive-resume-chrome 2>$null
    docker rm reactive-resume-chrome 2>$null
    
    Write-Host "✅ ReactiveResume stopped" -ForegroundColor Green
    exit
}

if ($Status) {
    Write-Host "📊 ReactiveResume Service Status" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    
    # Check Node processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    Write-Host "Node.js processes: $($nodeProcesses.Count)" -ForegroundColor White
    
    # Check Docker containers
    Write-Host ""
    Write-Host "Docker containers:" -ForegroundColor White
    docker ps --filter "name=reactive-resume" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Check ports
    Write-Host ""
    Write-Host "Port usage:" -ForegroundColor White
    netstat -an | findstr ":3000\|:3001" | Select-Object -First 5
    
    exit
}

if ($Restart) {
    Write-Host "🔄 Restarting ReactiveResume..." -ForegroundColor Yellow
    & $PSCommandPath -Stop
    Start-Sleep -Seconds 3
    & $PSCommandPath
    exit
}

Write-Host "ReactiveResume Local Development Setup" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Check prerequisites
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

if (!(Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Host "WARNING: pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}

if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker not found. Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Prerequisites checked" -ForegroundColor Green

# Stop any existing services
Write-Host ""
Write-Host "INFO: Cleaning up existing services..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
docker stop reactive-resume-chrome 2>$null
docker rm reactive-resume-chrome 2>$null

# Install dependencies
Write-Host ""
Write-Host "INFO: Installing dependencies..." -ForegroundColor Yellow
pnpm install --frozen-lockfile

# Start Chrome service (Docker)
Write-Host ""
Write-Host "INFO: Starting Chrome PDF service..." -ForegroundColor Yellow
docker run -d `
  --name reactive-resume-chrome `
  --restart unless-stopped `
  -p 3001:3000 `
  -e "TOKEN=chrome-token-12345" `
  -e "CONCURRENT=10" `
  browserless/chrome:latest

Start-Sleep -Seconds 5

# Check if SQLite database needs setup
if (!(Test-Path "apps\server\prisma\dev.db")) {
    Write-Host ""
    Write-Host "INFO: Setting up SQLite database..." -ForegroundColor Yellow
    cd apps\server
    npx prisma db push
    cd ..\..
}

# Start ReactiveResume backend (background)
Write-Host ""
Write-Host "INFO: Starting ReactiveResume backend (background)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd apps\server
    npm run dev
}

# Start ReactiveResume frontend (background)
Write-Host "INFO: Starting ReactiveResume frontend (background)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd apps\client  
    npm run dev
}

# Wait for services to start
Write-Host ""
Write-Host "INFO: Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host ""
Write-Host "INFO: Health Check:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "   Backend: SUCCESS - Running" -ForegroundColor Green
} catch {
    Write-Host "   Backend: INFO - Starting..." -ForegroundColor Yellow
}

try {
    $chromeResponse = Invoke-WebRequest -Uri "http://localhost:3001/json/version" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "   Chrome: SUCCESS - Running" -ForegroundColor Green
} catch {
    Write-Host "   Chrome: WARNING - Check Docker" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SUCCESS: ReactiveResume Development Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "INFO: Access Your Application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3000/api" -ForegroundColor White
Write-Host "   Chrome Debug: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "INFO: Service Management:" -ForegroundColor Cyan
Write-Host "   Check status: .\local-setup-reactiveresume-only.ps1 -Status" -ForegroundColor White
Write-Host "   Stop services: .\local-setup-reactiveresume-only.ps1 -Stop" -ForegroundColor White
Write-Host "   Restart: .\local-setup-reactiveresume-only.ps1 -Restart" -ForegroundColor White
Write-Host ""
Write-Host "INFO: Background jobs started - terminal is free for other commands!" -ForegroundColor Green
Write-Host "INFO: Database: SQLite (fast local development)" -ForegroundColor Green
Write-Host "INFO: To view logs: Get-Job | Receive-Job" -ForegroundColor White
Write-Host ""
