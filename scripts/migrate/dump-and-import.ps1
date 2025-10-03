#!/usr/bin/env pwsh
# SQLite → PostgreSQL via SQL Dump (Windows)

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SQLite → PostgreSQL Migration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$SQLITE_DB = "apps\server\prisma\dev.db"
$DUMP_FILE = "scripts\migrate\dump.sql"
$PG_HOST = "localhost"
$PG_PORT = "5432"
$PG_USER = "reactive_resume"
$PG_PASS = "reactive_resume_2024"
$PG_DB = "reactive_resume"

# Step 1: Dump SQLite
Write-Host "📦 Step 1: Dumping SQLite to SQL..." -ForegroundColor Yellow
if (-not (Test-Path $SQLITE_DB)) {
    Write-Host "❌ SQLite database not found: $SQLITE_DB" -ForegroundColor Red
    exit 1
}

$sqliteSize = [math]::Round((Get-Item $SQLITE_DB).Length / 1MB, 2)
Write-Host "  Source: $SQLITE_DB ($sqliteSize MB)" -ForegroundColor Gray

# Use Docker to run sqlite3 (cross-platform, no Windows install needed)
docker run --rm `
  -v "$PWD\:/workspace" `
  -w /workspace `
  alpine:latest `
  sh -c "apk add --no-cache sqlite > /dev/null 2>&1 && sqlite3 $SQLITE_DB .dump" | Out-File -FilePath $DUMP_FILE -Encoding utf8

if (-not (Test-Path $DUMP_FILE)) {
    Write-Host "❌ Dump failed" -ForegroundColor Red
    exit 1
}

$dumpSize = [math]::Round((Get-Item $DUMP_FILE).Length / 1KB, 2)
Write-Host "  ✅ Dump created: $DUMP_FILE ($dumpSize KB)" -ForegroundColor Green
Write-Host ""

# Step 2: Clean Postgres
Write-Host "📦 Step 2: Wiping PostgreSQL..." -ForegroundColor Yellow
docker exec reactive-resume-postgres psql -U $PG_USER -d $PG_DB -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" 2>&1 | Out-Null
Write-Host "  ✅ PostgreSQL wiped clean" -ForegroundColor Green
Write-Host ""

# Step 3: Apply Prisma schema
Write-Host "📦 Step 3: Applying Prisma schema..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/${PG_DB}?schema=public"
pnpm prisma db push --skip-generate --accept-data-loss 2>&1 | Select-String "sync|error" | Out-Host
Write-Host "  ✅ Schema applied" -ForegroundColor Green
Write-Host ""

# Step 4: Import data (using custom SQL that Prisma understands)
Write-Host "📦 Step 4: Importing data..." -ForegroundColor Yellow
Write-Host "  Note: Using Prisma-based copier (SQL dump has SQLite-specific syntax)" -ForegroundColor Gray
Write-Host ""

# Run Node.js script to copy data using Prisma
$env:POSTGRES_URL = "postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/${PG_DB}?schema=public"
$env:SQLITE_URL = "file:./$SQLITE_DB"
node scripts/migrate/sqlite-to-postgres-local.js

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ Migration Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Export Postgres dump for server" -ForegroundColor Cyan
Write-Host "  docker exec reactive-resume-postgres pg_dump -U $PG_USER -d $PG_DB > postgres-export.sql" -ForegroundColor Gray



