#!/usr/bin/env pwsh
# ReactiveResumeTracker + Job Automation - Complete Startup Script

param(
    [switch]$Help,
    [switch]$SkipAutomation,
    [switch]$OnlySetup,
    [switch]$RestartSkyvern
)

if ($Help) {
    Write-Host ""
    Write-Host "ReactiveResumeTracker + Automation Startup" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script intelligently starts your complete system:" -ForegroundColor White
    Write-Host "  1. ReactiveResumeTracker webapp (always restarted)" -ForegroundColor Green
    Write-Host "  2. Job automation engine (keeps running unless forced)" -ForegroundColor Green
    Write-Host "  3. Smart resource management for development" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\start-complete-system.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Help            Show this help" -ForegroundColor White
    Write-Host "  -SkipAutomation  Start regular app only" -ForegroundColor White
    Write-Host "  -OnlySetup       Setup only, don't start" -ForegroundColor White
    Write-Host "  -RestartSkyvern  Force restart Skyvern (otherwise keeps running)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\start-complete-system.ps1                  # Normal dev restart" -ForegroundColor White
    Write-Host "  .\start-complete-system.ps1 -RestartSkyvern  # Force restart all" -ForegroundColor White
    Write-Host "  .\start-complete-system.ps1 -SkipAutomation  # App only" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Development Tip:" -ForegroundColor Cyan
    Write-Host "  Skyvern stays running between restarts to save compute resources." -ForegroundColor White
    Write-Host "  Only your ReactiveResumeTracker code gets restarted for fast iteration." -ForegroundColor White
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

# Step 3: Check and start automation services (if enabled)
if (!$SkipAutomation -and $dockerAvailable) {
    Write-Host ""
    Write-Host "Checking automation services..." -ForegroundColor Yellow
    
    # Check if Skyvern containers are already running
    $runningContainers = docker ps --format "table {{.Names}}" 2>$null | Select-String "skyvern-"
    $skyvernRunning = ($runningContainers | Measure-Object).Count -ge 3  # API, UI, Postgres, Redis
    
    if ($skyvernRunning -and !$RestartSkyvern) {
        Write-Host "✅ Skyvern automation already running - keeping it up!" -ForegroundColor Green
        Write-Host "   PostgreSQL: localhost:5433" -ForegroundColor Green
        Write-Host "   Redis: localhost:6380" -ForegroundColor Green  
        Write-Host "   Skyvern API: localhost:8000" -ForegroundColor Green
        Write-Host "   Skyvern UI: localhost:8081" -ForegroundColor Green
        Write-Host "   Chrome Debug: localhost:9222" -ForegroundColor Green
        Write-Host "   VNC Access: localhost:5900 (no password)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 TIP: Use -RestartSkyvern to force restart if needed" -ForegroundColor Cyan
    } else {
        if ($RestartSkyvern) {
            Write-Host "🔄 Force restarting Skyvern automation..." -ForegroundColor Yellow
            docker-compose -f docker-compose.skyvern.yml down 2>$null
            Start-Sleep -Seconds 3
        } else {
            Write-Host "🚀 Starting Skyvern automation..." -ForegroundColor Yellow
        }
        
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
        
        # Start Skyvern with enhanced configuration
        docker-compose -f docker-compose.skyvern.yml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK: Automation services starting..." -ForegroundColor Green
            Write-Host "   PostgreSQL: localhost:5433" -ForegroundColor Green
            Write-Host "   Redis: localhost:6380" -ForegroundColor Green  
            Write-Host "   Skyvern API: localhost:8000" -ForegroundColor Green
            Write-Host "   Skyvern UI: localhost:8081" -ForegroundColor Green
            Write-Host "   Chrome Debug: localhost:9222" -ForegroundColor Green
            Write-Host "   VNC Access: localhost:5900 (no password)" -ForegroundColor Cyan
            
            # Setup VNC access for manual Chrome control (only on fresh start)
            Write-Host ""
            Write-Host "Setting up VNC access to Chrome..." -ForegroundColor Yellow
            
            # Wait for container to be fully ready
            Write-Host "   Waiting for container to be ready..." -ForegroundColor White
            Start-Sleep -Seconds 15
            
            # Enhanced VNC setup with proper error handling
            Write-Host "   Installing VNC server..." -ForegroundColor White
            $vncSetup = @"
echo 'Starting VNC setup...'
apt-get update -qq > /dev/null 2>&1
apt-get install -y x11vnc fluxbox xvfb > /dev/null 2>&1

# Start Xvfb for display :99 if not running
if ! pgrep -f "Xvfb :99" > /dev/null; then
    echo 'Starting Xvfb display server...'
    Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &
    sleep 3
fi

# Set up VNC (no password for reliability)
mkdir -p ~/.vnc

# Kill existing VNC servers
pkill x11vnc 2>/dev/null || true

# Start VNC server with proper configuration (no password)
echo 'Starting VNC server...'
x11vnc -display :99 -forever -nopw -shared -rfbport 5900 \
    -noxdamage -noxfixes -noxrandr -wait 50 -nap \
    -desktop skyvern-chrome -bg -o /tmp/vnc.log

# Wait and verify VNC is running
sleep 2
if pgrep x11vnc > /dev/null; then
    echo 'VNC server started successfully on :5900'
    echo 'Display :99 ready'
    ps aux | grep x11vnc | head -1
else
    echo 'ERROR: VNC server failed to start'
    cat /tmp/vnc.log || true
fi
"@
            
            Write-Host "   Configuring VNC server..." -ForegroundColor White
            $vncResult = $vncSetup | docker exec -i skyvern-api bash
            
            # Verify VNC is running
            Write-Host "   Verifying VNC server..." -ForegroundColor White
            $vncCheck = docker exec skyvern-api bash -c "pgrep x11vnc && echo 'VNC_RUNNING' || echo 'VNC_FAILED'"
            
            if ($vncCheck -contains "VNC_RUNNING") {
                Write-Host "✅ VNC access configured successfully!" -ForegroundColor Green
                Write-Host "   Connect with VNC Viewer to: localhost:5900" -ForegroundColor Cyan
                Write-Host "   No password required" -ForegroundColor Cyan
                Write-Host "   Display: Chrome will appear in VNC window" -ForegroundColor Cyan
            } else {
                Write-Host "❌ VNC setup failed - manual browser control unavailable" -ForegroundColor Red
                Write-Host "   You can still use automation without manual control" -ForegroundColor Yellow
                Write-Host "   Check container logs: docker logs skyvern-api" -ForegroundColor Yellow
            }
            
        } else {
            Write-Host "ERROR: Automation services failed to start" -ForegroundColor Red
            $SkipAutomation = $true
        }
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
    Write-Host "  VNC Chrome Access: localhost:5900 (no password)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Automation Features:" -ForegroundColor Cyan
    Write-Host "  LinkedIn workflow automation with manual login support" -ForegroundColor Green
    Write-Host "  AI-powered dynamic prompting and obstacle handling" -ForegroundColor Green
    Write-Host "  Direct Chrome access via VNC for manual intervention" -ForegroundColor Green
    Write-Host "  Complete job extraction with company and contact data" -ForegroundColor Green
    Write-Host ""
    Write-Host "Manual Browser Control:" -ForegroundColor Yellow
    Write-Host "  1. Install VNC Viewer (RealVNC, TigerVNC, or similar)" -ForegroundColor White
    Write-Host "  2. Connect to localhost:5900 when login needed" -ForegroundColor White
    Write-Host "  3. No password required - connect directly" -ForegroundColor White
    Write-Host "  4. Login manually in VNC Chrome window" -ForegroundColor White
    Write-Host "  5. Automation continues automatically" -ForegroundColor White
}

Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start the development servers
pnpm dev





