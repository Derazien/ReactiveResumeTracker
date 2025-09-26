# 🚀 Local Complete Stack Setup (Windows)
# ======================================
# ReactiveResume + Skyvern Automation + LLM
# All services in background - terminal stays free

param(
    [switch]$Stop,
    [switch]$Restart, 
    [switch]$Status,
    [switch]$SkipSkyvern,
    [switch]$Help
)

if ($Help) {
    Write-Host "🚀 Complete Automation Stack Setup" -ForegroundColor Blue
    Write-Host "==================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\local-setup-complete-stack.ps1              # Start everything"
    Write-Host "  .\local-setup-complete-stack.ps1 -SkipSkyvern # ReactiveResume only"
    Write-Host "  .\local-setup-complete-stack.ps1 -Stop        # Stop all services"
    Write-Host "  .\local-setup-complete-stack.ps1 -Status      # Check status"
    Write-Host ""
    Write-Host "Complete Stack Includes:" -ForegroundColor Green
    Write-Host "  - ReactiveResume (SQLite for local dev)"
    Write-Host "  - Skyvern Automation (Docker PostgreSQL)"
    Write-Host "  - All PDF and storage services"
    Write-Host "  - Background processes (terminal stays free)"
    Write-Host ""
    exit
}

if ($Stop) {
    Write-Host "🛑 Stopping Complete Stack..." -ForegroundColor Yellow
    
    # Stop Node.js processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop all Docker containers
    docker-compose -f docker-compose.skyvern.yml down 2>$null
    docker stop reactive-resume-chrome 2>$null
    docker rm reactive-resume-chrome 2>$null
    
    # Stop background jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    
    Write-Host "✅ Complete stack stopped" -ForegroundColor Green
    exit
}

if ($Status) {
    Write-Host "📊 Complete Stack Status" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Node.js Processes:" -ForegroundColor White
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Format-Table Name, Id, CPU, WorkingSet
    
    Write-Host ""
    Write-Host "Docker Services:" -ForegroundColor White
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host ""
    Write-Host "PowerShell Background Jobs:" -ForegroundColor White
    Get-Job | Format-Table Name, State
    
    Write-Host ""
    Write-Host "Service URLs:" -ForegroundColor White
    Write-Host "   ReactiveResume: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Skyvern UI: http://localhost:8081" -ForegroundColor Cyan
    Write-Host "   Chrome Debug: http://localhost:3001" -ForegroundColor Cyan
    
    exit
}

Write-Host "🚀 Complete Automation Stack Setup" -ForegroundColor Blue
Write-Host "===================================" -ForegroundColor Blue
Write-Host ""

# Prerequisites check
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

$missingTools = @()
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) { $missingTools += "Node.js" }
if (!(Get-Command "pnpm" -ErrorAction SilentlyContinue)) { $missingTools += "pnpm" }
if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) { $missingTools += "Docker" }

if ($missingTools.Count -gt 0) {
    Write-Host "❌ Missing tools: $($missingTools -join ', ')" -ForegroundColor Red
    Write-Host "Please install missing tools and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All prerequisites available" -ForegroundColor Green

# Cleanup existing services
Write-Host ""
Write-Host "🧹 Cleaning up existing services..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Job | Stop-Job -ErrorAction SilentlyContinue
Get-Job | Remove-Job -ErrorAction SilentlyContinue

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install --frozen-lockfile

# Set up database
Write-Host ""
Write-Host "🗄️ Setting up SQLite database..." -ForegroundColor Yellow
cd apps\server
npx prisma generate
if (!(Test-Path "prisma\dev.db")) {
    npx prisma db push
}
cd ..\..

# Start Skyvern (if not skipped)
if (!$SkipSkyvern) {
    Write-Host ""
    Write-Host "🤖 Starting Skyvern automation..." -ForegroundColor Yellow
    docker-compose -f docker-compose.skyvern.yml up -d
    
    Write-Host "   ⏳ Waiting for Skyvern to initialize..." -ForegroundColor Cyan
    Start-Sleep -Seconds 15
}

# Start Chrome service
Write-Host ""
Write-Host "🌐 Starting Chrome PDF service..." -ForegroundColor Yellow
docker run -d `
  --name reactive-resume-chrome `
  --restart unless-stopped `
  -p 3001:3000 `
  -e "TOKEN=chrome-token-12345" `
  browserless/chrome:latest

# Start ReactiveResume backend (background job)
Write-Host ""
Write-Host "🚀 Starting ReactiveResume backend (background)..." -ForegroundColor Yellow
$backendJob = Start-Job -Name "ReactiveResume-Backend" -ScriptBlock {
    Set-Location $using:PWD
    cd apps\server
    npm run dev
}

# Start ReactiveResume frontend (background job)  
Write-Host "🎨 Starting ReactiveResume frontend (background)..." -ForegroundColor Yellow
$frontendJob = Start-Job -Name "ReactiveResume-Frontend" -ScriptBlock {
    Set-Location $using:PWD
    cd apps\client
    npm run dev
}

# Wait for services
Write-Host ""
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Health checks
Write-Host ""
Write-Host "🏥 Health Check:" -ForegroundColor Cyan
$healthChecks = @()

try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 | Out-Null
    $healthChecks += "✅ Backend: Running"
} catch {
    $healthChecks += "⏳ Backend: Starting..."
}

try {
    Invoke-WebRequest -Uri "http://localhost:3001/json/version" -TimeoutSec 5 | Out-Null
    $healthChecks += "✅ Chrome: Running"
} catch {
    $healthChecks += "⚠️ Chrome: Check Docker"
}

if (!$SkipSkyvern) {
    try {
        Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 | Out-Null
        $healthChecks += "✅ Skyvern: Running"
    } catch {
        $healthChecks += "⏳ Skyvern: Starting..."
    }
}

foreach ($check in $healthChecks) {
    Write-Host "   $check" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your Applications:" -ForegroundColor Cyan
Write-Host "   ReactiveResume: http://localhost:3000" -ForegroundColor White
if (!$SkipSkyvern) {
    Write-Host "   Skyvern UI: http://localhost:8081" -ForegroundColor White
}
Write-Host "   Chrome Debug: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "💻 Process Management:" -ForegroundColor Cyan
Write-Host "   All services run in BACKGROUND" -ForegroundColor Green
Write-Host "   Terminal is FREE for other commands" -ForegroundColor Green
Write-Host "   Check status: .\local-setup-complete-stack.ps1 -Status" -ForegroundColor White
Write-Host "   Stop services: .\local-setup-complete-stack.ps1 -Stop" -ForegroundColor White
Write-Host ""
Write-Host "📋 View Logs:" -ForegroundColor Cyan  
Write-Host "   Get-Job | Receive-Job              # All background job logs" -ForegroundColor White
Write-Host "   Receive-Job ReactiveResume-Backend # Backend logs only" -ForegroundColor White
Write-Host "   docker logs skyvern-api            # Skyvern logs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Your terminal is now free for git, editing, testing!" -ForegroundColor Green
