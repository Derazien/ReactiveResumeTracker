#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy Reactive Resume to Windows server with PM2

.DESCRIPTION
    Production deployment for Windows Server:
    1. Stops existing PM2 processes
    2. Cleans up ports
    3. Installs dependencies
    4. Builds application
    5. Runs migrations
    6. Starts services with PM2

.PARAMETER SkipBuild
    Skip the build step (use existing dist/)

.PARAMETER SkipDocker
    Skip Docker management

.PARAMETER Clean
    Clean install (remove node_modules)

.EXAMPLE
    .\scripts\production\deploy-server.ps1

.EXAMPLE
    .\scripts\production\deploy-server.ps1 -SkipBuild
#>

param(
    [switch]$SkipBuild,
    [switch]$SkipDocker,
    [switch]$Clean
)

$ErrorActionPreference = "Continue"

# Configuration
$PM2_BACKEND_NAME = $env:PM2_BACKEND_NAME ?? "imin_backend_dev"
$PM2_FRONTEND_NAME = $env:PM2_FRONTEND_NAME ?? "imin_frontend_dev"
$SERVER_PORT = $env:SERVER_PORT ?? 3000
$CLIENT_PORT = $env:CLIENT_PORT ?? 5173

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 Reactive Resume - Production Deployment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "   Checking port $Port..." -ForegroundColor Gray
    
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    if ($connections) {
        Write-Host "      Port $Port in use - stopping..." -ForegroundColor Yellow
        $pids = $connections | ForEach-Object {
            $_.ToString().Trim() -split '\s+' | Select-Object -Last 1
        } | Select-Object -Unique
        
        foreach ($pid in $pids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "      Stopped PID $pid" -ForegroundColor Green
            } catch {}
        }
    } else {
        Write-Host "      Port $Port is free" -ForegroundColor Green
    }
}

# Step 1: Stop PM2 processes
Write-Host "📦 Step 1: Stopping PM2 processes..." -ForegroundColor Yellow
Write-Host ""

$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue

if ($pm2Installed) {
    Write-Host "   Stopping $PM2_BACKEND_NAME..." -ForegroundColor Gray
    pm2 stop $PM2_BACKEND_NAME 2>$null
    
    Write-Host "   Stopping $PM2_FRONTEND_NAME..." -ForegroundColor Gray
    pm2 stop $PM2_FRONTEND_NAME 2>$null
    
    Write-Host "   Deleting old PM2 processes..." -ForegroundColor Gray
    pm2 delete $PM2_BACKEND_NAME 2>$null
    pm2 delete $PM2_FRONTEND_NAME 2>$null
    
    Write-Host "   ✓ PM2 processes stopped" -ForegroundColor Green
} else {
    Write-Host "   ⚠ PM2 not installed - skipping" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Clean up ports
Write-Host "🧹 Step 2: Cleaning up ports..." -ForegroundColor Yellow
Write-Host ""

Stop-ProcessOnPort -Port $SERVER_PORT
Stop-ProcessOnPort -Port $CLIENT_PORT

Write-Host ""
Write-Host "   ✓ Ports cleaned" -ForegroundColor Green
Write-Host ""

# Step 3: Docker management
if (-not $SkipDocker) {
    Write-Host "🐳 Step 3: Managing Docker services..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "   Stopping existing containers..." -ForegroundColor Gray
    docker compose -f self-hosted-infrastructure.yml down 2>$null
    
    Write-Host "   Starting infrastructure services..." -ForegroundColor Gray
    docker compose -f self-hosted-infrastructure.yml up -d
    
    Write-Host ""
    Write-Host "   ✓ Docker services started" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    docker compose -f self-hosted-infrastructure.yml ps
    Write-Host ""
} else {
    Write-Host "⏭️  Step 3: Skipping Docker management" -ForegroundColor Gray
    Write-Host ""
}

# Step 4: Install dependencies
Write-Host "📦 Step 4: Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

if ($Clean) {
    Write-Host "   Clean install: Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml -ErrorAction SilentlyContinue
}

Write-Host "   Running: pnpm install --frozen-lockfile" -ForegroundColor Gray
pnpm install --frozen-lockfile

Write-Host ""
Write-Host "   ✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 5: Build
if (-not $SkipBuild) {
    Write-Host "🔨 Step 5: Building application..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "   Generating Prisma client..." -ForegroundColor Gray
    pnpm prisma:generate
    
    Write-Host "   Building all apps..." -ForegroundColor Gray
    pnpm build
    
    Write-Host ""
    Write-Host "   ✓ Build complete" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⏭️  Step 5: Skipping build" -ForegroundColor Gray
    Write-Host ""
}

# Step 6: Migrations
Write-Host "🗄️  Step 6: Running database migrations..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   Running: pnpm prisma:migrate" -ForegroundColor Gray
pnpm prisma:migrate

Write-Host ""
Write-Host "   ✓ Migrations complete" -ForegroundColor Green
Write-Host ""

# Step 7: Start with PM2
Write-Host "🚀 Step 7: Starting services with PM2..." -ForegroundColor Yellow
Write-Host ""

if (-not $pm2Installed) {
    Write-Host "   ❌ ERROR: PM2 is not installed!" -ForegroundColor Red
    Write-Host "   Install with: npm install -g pm2" -ForegroundColor Gray
    exit 1
}

Write-Host "   Starting backend: $PM2_BACKEND_NAME" -ForegroundColor Gray
pm2 start npm --name $PM2_BACKEND_NAME -- run start --update-env

Write-Host "   Waiting for backend to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Verify
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$SERVER_PORT/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Backend health check failed (may still be starting)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "   ✓ Services started" -ForegroundColor Green
Write-Host ""

# Step 8: Status
Write-Host "📊 Step 8: Service Status" -ForegroundColor Yellow
Write-Host ""

pm2 list

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "   • Backend API: http://localhost:$SERVER_PORT" -ForegroundColor Cyan
Write-Host "   • Health Check: http://localhost:$SERVER_PORT/api/health" -ForegroundColor Cyan
Write-Host "   • API Docs: http://localhost:$SERVER_PORT/docs" -ForegroundColor Cyan
Write-Host ""

Write-Host "Useful commands:" -ForegroundColor Gray
Write-Host "   • View logs: pm2 logs" -ForegroundColor Cyan
Write-Host "   • Restart: pm2 restart all" -ForegroundColor Cyan
Write-Host "   • Stop: pm2 stop all" -ForegroundColor Cyan
Write-Host "   • Monitor: pm2 monit" -ForegroundColor Cyan
Write-Host ""

# Save PM2 process list
pm2 save

Write-Host "✓ PM2 process list saved" -ForegroundColor Green
Write-Host ""







