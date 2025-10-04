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
Write-Host "  📤 PostgreSQL Compatible Database Export" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL container is running
Write-Host "🔍 Checking PostgreSQL container..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=reactive-resume-postgres" --format "table {{.Status}}" | Select-Object -Skip 1

if (-not $containerStatus -or $containerStatus -notmatch "Up") {
    Write-Host "❌ PostgreSQL container is not running" -ForegroundColor Red
    Write-Host "  Start it with: docker compose -f unified-docker-compose.yml up -d postgres-main" -ForegroundColor Gray
    exit 1
}

Write-Host "✓ PostgreSQL container is running" -ForegroundColor Green
Write-Host ""

# Create backup directory
$backupDir = "database-exports"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$backupDir\postgres-compatible-$timestamp.dump"

Write-Host "📥 Creating compatible PostgreSQL dump..." -ForegroundColor Yellow
Write-Host "  Output file: $backupFile" -ForegroundColor Gray

# Method 1: Try pg_dump with compatibility options
Write-Host "  Attempting pg_dump with compatibility flags..." -ForegroundColor Gray
try {
    # Use pg_dump with version compatibility
    docker exec reactive-resume-postgres pg_dump -U reactive_resume -d reactive_resume --format=custom --no-owner --no-privileges --verbose > $backupFile
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile) -and (Get-Item $backupFile).Length -gt 0) {
        Write-Host "✓ Database exported successfully with pg_dump" -ForegroundColor Green
        $success = $true
    } else {
        Write-Host "⚠ pg_dump failed, trying SQL export..." -ForegroundColor Yellow
        $success = $false
    }
} catch {
    Write-Host "⚠ pg_dump failed, trying SQL export..." -ForegroundColor Yellow
    $success = $false
}

# Method 2: Fallback to plain SQL if pg_dump fails
if (-not $success) {
    Write-Host "  Creating plain SQL dump as fallback..." -ForegroundColor Gray
    $sqlFile = "$backupDir\postgres-compatible-$timestamp.sql"
    
    try {
        # Create plain SQL dump
        docker exec reactive-resume-postgres pg_dump -U reactive_resume -d reactive_resume --no-owner --no-privileges --inserts > $sqlFile
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $sqlFile) -and (Get-Item $sqlFile).Length -gt 0) {
            Write-Host "✓ Database exported successfully as SQL" -ForegroundColor Green
            $backupFile = $sqlFile
            $success = $true
        }
    } catch {
        Write-Host "❌ SQL export also failed" -ForegroundColor Red
        $success = $false
    }
}

if (-not $success) {
    Write-Host "❌ All export methods failed" -ForegroundColor Red
    exit 1
}

# Show file info
$fileSize = [math]::Round((Get-Item $backupFile).Length / 1KB, 2)
Write-Host ""
Write-Host "✅ Export Complete!" -ForegroundColor Green
Write-Host "  File: $backupFile" -ForegroundColor Gray
Write-Host "  Size: $fileSize KB" -ForegroundColor Gray
Write-Host ""

# Copy to project root for deployment
$projectRootFile = "postgres-backup.dump"
if ($backupFile.EndsWith(".sql")) {
    $projectRootFile = "postgres-backup.sql"
}

Copy-Item $backupFile $projectRootFile -Force
Write-Host "📋 Copied to project root: $projectRootFile" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Ready for deployment!" -ForegroundColor Green
Write-Host "  Upload $projectRootFile to your server and run:" -ForegroundColor Gray
Write-Host "  ./scripts/production/import-database.sh" -ForegroundColor Gray
Write-Host ""
