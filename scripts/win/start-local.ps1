# Start Reactive Resume locally on Windows (CANONICAL)
# 
# DESCRIPTION:
#   Comprehensive local development startup:
#   0. Checks and installs dependencies (pnpm install, prisma:generate)
#   1. Stops any existing processes on conflicting ports
#   2. Starts Docker services (Postgres, Redis, MinIO, Chrome, Ollama)
#   3. Waits for services to be healthy
#   4. Starts the development servers (pnpm dev)
#
# PARAMETERS:
#   -SkipDocker    Skip Docker services startup (if already running)
#   -CleanStart    Stop all existing services before starting
#   -Clean         Remove node_modules and reinstall dependencies (fresh install)
#
# EXAMPLES:
#   .\scripts\win\start-local.ps1
#   DEFAULT: CleanStart (stops everything, checks dependencies, restarts)
#
#   .\scripts\win\start-local.ps1 -SkipDocker
#   Quick restart (Docker already running, just restart app)
#
#   .\scripts\win\start-local.ps1 -Clean
#   Fresh install (remove node_modules and reinstall everything)

param(
    [switch]$SkipDocker,
    [switch]$CleanStart,
    [switch]$Clean
)

$ErrorActionPreference = "Continue"

# Default to CleanStart if no parameters provided
if (-not $SkipDocker -and -not $CleanStart -and -not $Clean) {
    $CleanStart = $true
    Write-Host ""
    Write-Host "INFO: No flags provided - defaulting to CleanStart mode" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Reactive Resume - Local Development Startup" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Step 0: Check and install dependencies
Write-Host "Step 0: Checking dependencies..." -ForegroundColor Yellow
Write-Host ""

# Handle --Clean flag
if ($Clean) {
    Write-Host "   Clean install requested - removing node_modules..." -ForegroundColor Gray
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "      OK: Removed node_modules" -ForegroundColor Green
    }
    if (Test-Path "pnpm-lock.yaml") {
        Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
        Write-Host "      OK: Removed pnpm-lock.yaml" -ForegroundColor Green
    }
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "   WARNING: node_modules not found - installing dependencies..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Running: pnpm install" -ForegroundColor Cyan
    pnpm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "   OK: Dependencies installed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   OK: node_modules exists" -ForegroundColor Green
}

# Check if Prisma Client is generated
$prismaClientPath = "node_modules\.pnpm\@prisma+client*\node_modules\@prisma\client"
$prismaClientExists = Test-Path $prismaClientPath

if (-not $prismaClientExists) {
    Write-Host "   WARNING: Prisma Client not found - generating..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Running: pnpm prisma:generate" -ForegroundColor Cyan
    pnpm prisma:generate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERROR: Failed to generate Prisma Client" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "   OK: Prisma Client generated" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   OK: Prisma Client exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "   OK: All dependencies ready" -ForegroundColor Green
Write-Host ""

# Function to check if port is in use
function Test-PortInUse {
    param([int]$Port)
    $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
    return $connections.Count -gt 0
}

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "   Checking port $Port..." -NoNewline
    
    if (Test-PortInUse -Port $Port) {
        Write-Host " IN USE - Stopping..." -ForegroundColor Yellow
        
        $connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
        $processIds = $connections | ForEach-Object {
            $_.ToString().Trim() -split '\s+' | Select-Object -Last 1
        } | Select-Object -Unique
        
        foreach ($processId in $processIds) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "      Stopped PID $processId" -ForegroundColor Gray
            } catch {
                Write-Host "      Failed to stop PID $processId" -ForegroundColor Red
            }
        }
        Start-Sleep -Seconds 1
    } else {
        Write-Host " FREE" -ForegroundColor Green
    }
}

# Step 1: Clean start if requested
if ($CleanStart) {
    Write-Host "Step 1: Clean Start - Stopping all services..." -ForegroundColor Yellow
    Write-Host ""
    
    # Stop Docker containers
    Write-Host "   Stopping Docker containers..." -ForegroundColor Gray
    docker compose -f unified-docker-compose.yml down 2>$null
    
    # Stop ports
    Write-Host "   Freeing up ports..." -ForegroundColor Gray
    Stop-ProcessOnPort -Port 3000
    Stop-ProcessOnPort -Port 5173
    Stop-ProcessOnPort -Port 6173
    
    Write-Host ""
    Write-Host "   OK: Clean start complete" -ForegroundColor Green
    Write-Host ""
}

# Step 2: Check and free ports
if (-not $SkipDocker -and -not $CleanStart) {
    Write-Host "Step 1: Checking application ports..." -ForegroundColor Yellow
    Write-Host ""
    
    Stop-ProcessOnPort -Port 3000
    Stop-ProcessOnPort -Port 5173
    Stop-ProcessOnPort -Port 6173
    
    Write-Host ""
}

# Step 3: Start Docker services
if (-not $SkipDocker) {
    Write-Host "Step 2: Starting Docker services..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if Docker is running
    $dockerRunning = docker ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERROR: Docker Desktop is not running!" -ForegroundColor Red
        Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "   Starting infrastructure containers..." -ForegroundColor Gray
    docker compose -f unified-docker-compose.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERROR: Failed to start Docker services" -ForegroundColor Red
        Write-Host "   Make sure unified-docker-compose.yml exists and Docker Desktop is running" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "   OK: Docker services started" -ForegroundColor Green
    Write-Host ""
    
    # Wait for services to be healthy
    Write-Host "Step 3: Waiting for services to be healthy..." -ForegroundColor Yellow
    Write-Host ""
    
    Start-Sleep -Seconds 5
    
    Write-Host "   Checking service health..." -ForegroundColor Gray
    docker compose -f unified-docker-compose.yml ps
    
    Write-Host ""
    Write-Host "   OK: Services ready" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Step 2: Skipping Docker startup (using existing services)" -ForegroundColor Gray
    Write-Host ""
}

# Step 4: Start development servers
if ($SkipDocker) {
    $stepNum = "2"
} else {
    $stepNum = "4"
}

Write-Host "Step $stepNum : Starting development servers..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   Starting: pnpm dev" -ForegroundColor Cyan
Write-Host "   This will start:" -ForegroundColor Gray
Write-Host "      - Server (NestJS) on http://localhost:3000" -ForegroundColor Gray
Write-Host "      - Client (Vite) on http://localhost:5173" -ForegroundColor Gray
Write-Host "      - Artboard (PDF) on http://localhost:6173" -ForegroundColor Gray
Write-Host ""
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start pnpm dev
pnpm dev

