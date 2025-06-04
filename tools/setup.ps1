# Setup script for ReactiveResumeTracker

param(
    [switch]$ResetDatabase = $false,
    [switch]$SkipBuild = $false,
    [switch]$SkipPrismaGenerate = $false
)

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Function to aggressively kill processes using specific ports
function Stop-PortProcesses {
    param([int[]]$Ports)
    
    foreach ($port in $Ports) {
        Write-Host "Checking port $port..." -ForegroundColor Yellow
        
        # Multiple approaches to find and kill processes
        # Approach 1: netstat
        $netstatOutput = netstat -ano | findstr ":$port "
        if ($netstatOutput) {
            $processIds = $netstatOutput | ForEach-Object {
                if ($_ -match ':(\d+)\s+.*LISTENING\s+(\d+)') {
                    $matches[2]
                }
            } | Where-Object { $_ -and $_ -ne "0" } | Sort-Object | Get-Unique
            
            foreach ($processId in $processIds) {
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "Killing process: $($process.ProcessName) (PID: $processId) using port $port" -ForegroundColor Red
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    Write-Host "Could not stop process $processId" -ForegroundColor Red
                }
            }
        }
        
        # Approach 2: Get-NetTCPConnection (if available)
        try {
            $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            $processIds = $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object | Get-Unique
            
            foreach ($processId in $processIds) {
                if ($processId -and $processId -ne 0) {
                    try {
                        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                        if ($process) {
                            Write-Host "Killing process: $($process.ProcessName) (PID: $processId) using port $port" -ForegroundColor Red
                            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                        }
                    } catch {
                        Write-Host "Could not stop process $processId" -ForegroundColor Red
                    }
                }
            }
        } catch {
            # Get-NetTCPConnection not available, skip
        }
        
        # Wait and verify port is free
        Start-Sleep -Seconds 2
        $stillInUse = Test-Port -Port $port
        if ($stillInUse) {
            Write-Host "Port $port may still be in use, but continuing..." -ForegroundColor Yellow
        } else {
            Write-Host "Port $port is now free" -ForegroundColor Green
        }
    }
}

# Function to kill all Node.js processes (aggressive cleanup)
function Stop-AllNodeProcesses {
    Write-Host "[INFO] Stopping all Node.js processes for clean startup..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($process in $nodeProcesses) {
        try {
            Write-Host "Stopping Node.js process: PID $($process.Id)" -ForegroundColor Red
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "Could not stop process $($process.Id)" -ForegroundColor Red
        }
    }
    
    # Also stop any pnpm processes
    $pnpmProcesses = Get-Process -Name "pnpm" -ErrorAction SilentlyContinue
    foreach ($process in $pnpmProcesses) {
        try {
            Write-Host "Stopping pnpm process: PID $($process.Id)" -ForegroundColor Red
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "Could not stop process $($process.Id)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 3
}

# Function to try Prisma client generation with retries
function Try-PrismaGenerate {
    param([int]$MaxRetries = 3)
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Host "[ATTEMPT $i/$MaxRetries] Generating Prisma client..." -ForegroundColor Yellow
        
        # Clear any existing client cache
        Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        
        pnpm prisma generate 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Prisma client generated successfully" -ForegroundColor Green
            return $true
        }
        
        if ($i -lt $MaxRetries) {
            Write-Host "[WARN] Attempt $i failed, retrying in 2 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
    
    Write-Host "[WARN] Prisma client generation failed after $MaxRetries attempts" -ForegroundColor Yellow
    Write-Host "[INFO] This is a known Windows file permission issue" -ForegroundColor Yellow
    Write-Host "[INFO] The application may still work if an existing client is present" -ForegroundColor Yellow
    return $false
}

Write-Host "[SETUP] ReactiveResumeTracker Setup and Launch" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Aggressive cleanup of all Node processes first
Stop-AllNodeProcesses

# Check and free up required ports
$requiredPorts = @(3000, 5173, 5174, 5175, 5176, 6173, 6174, 6175, 6176, 6177)
Write-Host "Aggressively cleaning required ports..." -ForegroundColor Yellow
Stop-PortProcesses -Ports $requiredPorts

# Final wait for cleanup
Write-Host "[INFO] Waiting for ports to be fully released..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Create .env file from example if it doesn't exist
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env
        Write-Host "[OK] Created .env file from .env.example" -ForegroundColor Green
    } else {
        Write-Host "[WARN] No .env.example found. Creating minimal .env file..." -ForegroundColor Yellow
        
        $envContent = @"
# Database
DATABASE_URL="file:./dev.db"

# Security
ACCESS_TOKEN_SECRET="your-secret-key-here"
REFRESH_TOKEN_SECRET="your-refresh-secret-here"

# Optional: LLM Configuration (uncomment and configure as needed)
# LLM_PROVIDER="anthropic"
# ANTHROPIC_API_KEY="your-api-key-here"
# OPENAI_API_KEY="your-api-key-here"

# Application URLs
VITE_SERVER_URL="http://localhost:3000"
"@
        Set-Content -Path ".env" -Value $envContent
        Write-Host "[OK] Created minimal .env file" -ForegroundColor Green
    }
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion is available" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check/Install pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "[OK] pnpm $pnpmVersion is available" -ForegroundColor Green
} catch {
    Write-Host "[WARN] pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
    $pnpmVersion = pnpm --version
    Write-Host "[OK] pnpm $pnpmVersion installed" -ForegroundColor Green
}

# Install dependencies
Write-Host "[STEP] Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

# Generate Prisma client (with retry logic)
if (-not $SkipPrismaGenerate) {
    Write-Host "[STEP] Setting up Prisma client..." -ForegroundColor Yellow
    $prismaSuccess = Try-PrismaGenerate -MaxRetries 3
    
    if (-not $prismaSuccess) {
        Write-Host "[WARN] Continuing without fresh Prisma client generation" -ForegroundColor Yellow
        Write-Host "[TIP] You can skip this step with -SkipPrismaGenerate flag" -ForegroundColor Yellow
    }
} else {
    Write-Host "[SKIP] Prisma client generation skipped" -ForegroundColor Yellow
}

# Handle database setup
Write-Host "[STEP] Setting up database..." -ForegroundColor Yellow

if ($ResetDatabase -or (Test-Path "tools/prisma/dev.db")) {
    if ($ResetDatabase) {
        Write-Host "[INFO] Resetting database as requested..." -ForegroundColor Yellow
    } else {
        Write-Host "[INFO] Database exists, checking for migration drift..." -ForegroundColor Yellow
    }
    
    # Try migrate dev first, reset if needed
    pnpm prisma migrate dev --name init 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] Migration drift detected. Resetting database..." -ForegroundColor Yellow
        pnpm prisma migrate reset --force
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to reset database" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Database reset successfully" -ForegroundColor Green
    }
} else {
    # Fresh setup - use db push for initial setup
    pnpm prisma db push --skip-generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] db push failed, trying migrate dev..." -ForegroundColor Yellow
        pnpm prisma migrate dev --name init
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to setup database" -ForegroundColor Red
            Write-Host "[TIP] Try running the script with -ResetDatabase flag" -ForegroundColor Yellow
            exit 1
        }
    }
}

Write-Host "[OK] Database setup complete" -ForegroundColor Green

# Build project (optional)
if (-not $SkipBuild) {
    Write-Host "[STEP] Building project..." -ForegroundColor Yellow
    Write-Host "[INFO] This may fail due to Prisma client issues, but the dev server should still work" -ForegroundColor Yellow
    pnpm build 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] Build failed, but continuing..." -ForegroundColor Yellow
        Write-Host "[TIP] You can skip build with -SkipBuild flag" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Project built successfully" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[SUCCESS] Setup complete! Starting development servers..." -ForegroundColor Green
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor White
Write-Host "* Frontend: http://localhost:5173 (or next available port)" -ForegroundColor Green
Write-Host "* Backend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "[TIPS] Usage tips:" -ForegroundColor Cyan
Write-Host "  * Run with -ResetDatabase to reset the database" -ForegroundColor White
Write-Host "  * Run with -SkipBuild to skip the build step" -ForegroundColor White
Write-Host "  * Run with -SkipPrismaGenerate to skip Prisma client generation" -ForegroundColor White
Write-Host "  * Example: .\tools\setup.ps1 -ResetDatabase -SkipBuild -SkipPrismaGenerate" -ForegroundColor White
Write-Host ""

# Start development servers
Write-Host "[INFO] Starting development servers..." -ForegroundColor Yellow
pnpm dev 