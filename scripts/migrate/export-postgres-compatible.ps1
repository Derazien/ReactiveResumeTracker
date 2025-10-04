# Export PostgreSQL Database with Compatibility
# ============================================================================
# DESCRIPTION:
#   Creates a PostgreSQL dump that's compatible with older PostgreSQL versions
#   This ensures the dump can be imported on the server without version issues
#
# USAGE:
#   .\scripts\migrate\export-postgres-compatible.ps1
#
# PREREQUISITES:
#   - Local PostgreSQL container must be running
#   - Data must be in PostgreSQL (not SQLite)
# ============================================================================

$ErrorActionPreference = "Continue"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  PostgreSQL Compatible Database Export" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL container is running
Write-Host "Checking PostgreSQL container..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=reactive-resume-postgres" --format "table {{.Status}}" | Select-Object -Skip 1

if (-not $containerStatus -or $containerStatus -notmatch "Up") {
    Write-Host "PostgreSQL container is not running" -ForegroundColor Red
    Write-Host "  Start it with: docker compose -f unified-docker-compose.yml up -d postgres-main" -ForegroundColor Gray
    exit 1
}

Write-Host "PostgreSQL container is running" -ForegroundColor Green
Write-Host ""

# Create backup directory
$backupDir = "database-exports"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$backupDir\postgres-compatible-$timestamp.dump"

Write-Host "Creating compatible PostgreSQL dump..." -ForegroundColor Yellow
Write-Host "  Output file: $backupFile" -ForegroundColor Gray

# Force SQL format for maximum compatibility
Write-Host "  Creating plain SQL dump for maximum compatibility..." -ForegroundColor Gray
$sqlFile = "$backupDir\postgres-compatible-$timestamp.sql"
$success = $false

try {
    # Create plain SQL dump
    docker exec reactive-resume-postgres pg_dump -U reactive_resume -d reactive_resume --no-owner --no-privileges --inserts > $sqlFile
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $sqlFile) -and (Get-Item $sqlFile).Length -gt 0) {
        Write-Host "Database exported successfully as SQL" -ForegroundColor Green
        $backupFile = $sqlFile
        $success = $true
    } else {
        Write-Host "SQL export failed" -ForegroundColor Red
        $success = $false
    }
} catch {
    Write-Host "SQL export failed" -ForegroundColor Red
    $success = $false
}

if (-not $success) {
    Write-Host "All export methods failed" -ForegroundColor Red
    exit 1
}

# Show file info
$fileSize = [math]::Round((Get-Item $backupFile).Length / 1KB, 2)
Write-Host ""
Write-Host "Export Complete!" -ForegroundColor Green
Write-Host "  File: $backupFile" -ForegroundColor Gray
Write-Host "  Size: $fileSize KB" -ForegroundColor Gray
Write-Host ""

# Copy to project root for deployment
$projectRootFile = "postgres-backup.dump"
if ($backupFile.EndsWith(".sql")) {
    $projectRootFile = "postgres-backup.sql"
}

Copy-Item $backupFile $projectRootFile -Force
Write-Host "Copied to project root: $projectRootFile" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ready for deployment!" -ForegroundColor Green
Write-Host "  Upload $projectRootFile to your server and run:" -ForegroundColor Gray
Write-Host "  ./scripts/production/import-database.sh" -ForegroundColor Gray
Write-Host ""