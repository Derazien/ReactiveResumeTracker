#!/usr/bin/env pwsh
# ReactiveResumeTracker + Job Automation - Complete Startup Script

param(
    [switch]$Help,
    [switch]$SkipAutomation,
    [switch]$OnlySetup
)

if ($Help) {
    Write-Host ""
    Write-Host "ReactiveResumeTracker + Automation Startup" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script starts your complete system:" -ForegroundColor White
    Write-Host "  1. ReactiveResumeTracker webapp" -ForegroundColor Green
    Write-Host "  2. Job automation engine (Skyvern)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\start-complete-system.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Help            Show this help" -ForegroundColor White
    Write-Host "  -SkipAutomation  Start regular app only" -ForegroundColor White
    Write-Host "  -OnlySetup       Setup only, don't start" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "ReactiveResumeTracker + Job Automation" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Step 1: Check prerequisites
Write-Host ""
Write-Host "Checking requirements..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    Write-Host "ERROR: Main app not configured" -ForegroundColor Red
    Write-Host "Please run ./setup.ps1 first" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Main app configured" -ForegroundColor Green

# Check Docker for automation
$dockerAvailable = $false
if (!$SkipAutomation) {
    try {
        docker --version | Out-Null
        $dockerAvailable = $true
        Write-Host "OK: Docker available for automation" -ForegroundColor Green
    } catch {
        Write-Host "WARNING: Docker not available - automation disabled" -ForegroundColor Yellow
        $SkipAutomation = $true
    }
}

# Step 2: Clean up existing processes
Write-Host ""
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow

# Stop Node processes that might be using port 3000
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "OK: Cleaned up existing processes" -ForegroundColor Green

# Step 3: Start automation services (if enabled)
if (!$SkipAutomation -and $dockerAvailable) {
    Write-Host ""
    Write-Host "Starting automation services..." -ForegroundColor Yellow
    
    # Get API keys from main app
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "ANTHROPIC_API_KEY=(.+)") {
        $env:ANTHROPIC_API_KEY = $matches[1].Trim()
        Write-Host "OK: Anthropic API key configured" -ForegroundColor Green
    } else {
        Write-Host "WARNING: No Anthropic API key found - automation may not work" -ForegroundColor Yellow
    }
    
    if ($envContent -match "SKYVERN_API_KEY=(.+)") {
        $env:SKYVERN_API_KEY = $matches[1].Trim()
        Write-Host "OK: Skyvern API key configured" -ForegroundColor Green
    } else {
        Write-Host "WARNING: No Skyvern API key found - get it from http://localhost:8081" -ForegroundColor Yellow
    }
    
    # Start Skyvern
    docker-compose -f docker-compose.skyvern.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Automation services starting..." -ForegroundColor Green
        Write-Host "   PostgreSQL: localhost:5433" -ForegroundColor Green
        Write-Host "   Redis: localhost:6380" -ForegroundColor Green  
        Write-Host "   Skyvern API: localhost:8000" -ForegroundColor Green
        Write-Host "   Skyvern UI: localhost:8081" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Automation services failed to start" -ForegroundColor Red
        $SkipAutomation = $true
    }
} else {
    Write-Host ""
    Write-Host "Automation services skipped" -ForegroundColor Yellow
}

# Step 4: Start ReactiveResume Docker services (Chrome & Minio)
Write-Host ""
Write-Host "Starting ReactiveResume Docker services..." -ForegroundColor Yellow

# Check if Docker services are already running
$runningServices = docker compose -f tools/compose/development.yml ps --services --filter status=running 2>$null

if ($runningServices -contains "chrome" -and $runningServices -contains "minio") {
    Write-Host "OK: PDF services (Chrome & Minio) already running" -ForegroundColor Green
} else {
    Write-Host "Starting PDF services (Chrome & Minio)..." -ForegroundColor White
    
    # Start only the required services for development
    docker compose -f tools/compose/development.yml --env-file .env up -d chrome minio
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: PDF services started" -ForegroundColor Green
        Write-Host "   Chrome (PDF generation): ws://localhost:3001" -ForegroundColor Green
        Write-Host "   Minio (File storage): http://localhost:9000" -ForegroundColor Green
        Write-Host "   Minio Console: http://localhost:9001" -ForegroundColor Green
    } else {
        Write-Host "WARNING: PDF services failed to start" -ForegroundColor Yellow
        Write-Host "PDF generation may not work properly" -ForegroundColor Yellow
    }
}

# Step 5: Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install --silent

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Dependencies installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Dependencies ready" -ForegroundColor Green

# Step 6: Build project
Write-Host ""
Write-Host "Building project..." -ForegroundColor Yellow
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Project built" -ForegroundColor Green

if ($OnlySetup) {
    Write-Host ""
    Write-Host "Setup Complete!" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your system is ready. To start:" -ForegroundColor White
    Write-Host "  pnpm dev" -ForegroundColor Green
    Write-Host ""
    if (!$SkipAutomation) {
        Write-Host "Automation Status:" -ForegroundColor Yellow
        Write-Host "  Skyvern API: http://localhost:8000" -ForegroundColor Green
        Write-Host "  Test endpoint: http://localhost:3000/api/automation/status" -ForegroundColor Green
    }
    Write-Host ""
    exit 0
}

# Step 7: Start the main application
Write-Host ""
Write-Host "Starting ReactiveResumeTracker..." -ForegroundColor Yellow

Write-Host ""
Write-Host "System URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend: http://localhost:3000" -ForegroundColor Green
Write-Host "  PDF Service: http://localhost:5174" -ForegroundColor Green
Write-Host "  Chrome (PDF): ws://localhost:3001" -ForegroundColor Green
Write-Host "  Minio Storage: http://localhost:9000" -ForegroundColor Green

if (!$SkipAutomation) {
    Write-Host "  Automation API: http://localhost:8000" -ForegroundColor Green
    Write-Host "  Automation UI: http://localhost:8081" -ForegroundColor Green
    Write-Host ""
    Write-Host "Automation Features:" -ForegroundColor Cyan
    Write-Host "  Universal job board automation" -ForegroundColor Green
    Write-Host "  Natural language instructions" -ForegroundColor Green
    Write-Host "  Intelligent resume generation" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start the development servers
pnpm dev





