#!/usr/bin/env pwsh
# scripts/migrate/fresh-postgres-import.ps1
# Complete fresh start: Wipe Postgres, recreate, import from SQLite

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  ⚠️  NUCLEAR OPTION: Fresh Postgres Import" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Stop all Node processes" -ForegroundColor Gray
Write-Host "  2. Remove ALL Postgres data (container + volume)" -ForegroundColor Gray
Write-Host "  3. Start fresh Postgres container" -ForegroundColor Gray
Write-Host "  4. Drop and recreate database" -ForegroundColor Gray
Write-Host "  5. Run Sequel migration from SQLite" -ForegroundColor Gray
Write-Host "  6. Fix NULL timestamps (set to CURRENT_TIMESTAMP)" -ForegroundColor Gray
Write-Host "  7. Verify data imported" -ForegroundColor Gray
Write-Host "  8. Clean Prisma cache and regenerate client" -ForegroundColor Gray
Write-Host "  9. Update DATABASE_URL with sslmode=disable" -ForegroundColor Gray
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Aborted" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 1: Stop all services" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Stop Node processes
Write-Host "Stopping Node processes..." -ForegroundColor Gray
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "✅ Node processes stopped" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 2: Remove old Postgres" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Stop and remove Postgres container
Write-Host "Removing Postgres container..." -ForegroundColor Gray
docker stop reactive-resume-postgres 2>$null
docker rm reactive-resume-postgres 2>$null
Write-Host "✅ Container removed" -ForegroundColor Green

# Remove Postgres volume
Write-Host "Removing Postgres volume..." -ForegroundColor Gray
docker volume rm reactive-resume_postgres_main_data 2>$null
Write-Host "✅ Volume removed" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 3: Start fresh Postgres" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Postgres..." -ForegroundColor Gray
docker compose -f unified-docker-compose.yml up -d postgres-main

Write-Host "Waiting for Postgres to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Wait for postgres to be healthy
$maxAttempts = 10
$attempt = 0
while ($attempt -lt $maxAttempts) {
    $ready = docker exec reactive-resume-postgres pg_isready -U reactive_resume -d reactive_resume 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Postgres is ready!" -ForegroundColor Green
        break
    }
    $attempt++
    Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if ($attempt -eq $maxAttempts) {
    Write-Host "❌ Postgres failed to start" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Postgres started" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 4: Prepare database" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dropping and recreating database..." -ForegroundColor Gray
docker exec reactive-resume-postgres psql -U reactive_resume -d postgres -c "DROP DATABASE IF EXISTS reactive_resume;" 2>$null
docker exec reactive-resume-postgres psql -U reactive_resume -d postgres -c "CREATE DATABASE reactive_resume;" 2>$null
Write-Host "✅ Fresh database created" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 5: Run Sequel migration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Migrating data with Prisma (proper timestamp handling)..." -ForegroundColor Gray
Write-Host ""

# Temporarily switch to SQLite to read data
Write-Host "   Step 5a: Preparing SQLite connection..." -ForegroundColor Gray
$schemaBackup = Get-Content "apps/server/prisma/schema.prisma" -Raw
$schemaBackup | Out-File "apps/server/prisma/schema.prisma.backup" -Encoding utf8 -Force

# Change to SQLite temporarily
(Get-Content "apps/server/prisma/schema.prisma" -Raw) -replace 'provider = "postgresql"', 'provider = "sqlite"' | Set-Content "apps/server/prisma/schema.prisma" -NoNewline

# Generate SQLite client
Write-Host "   Step 5b: Generating SQLite Prisma client..." -ForegroundColor Gray
pnpm prisma:generate 2>&1 | Select-String "Generated" | Out-Null

# Run migration
Write-Host "   Step 5c: Running Prisma migration..." -ForegroundColor Gray
node scripts/migrate/proper-migration.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    # Restore schema
    $schemaBackup | Set-Content "apps/server/prisma/schema.prisma" -NoNewline
    exit 1
}

# Restore PostgreSQL schema
Write-Host "   Step 5d: Restoring PostgreSQL schema..." -ForegroundColor Gray
$schemaBackup | Set-Content "apps/server/prisma/schema.prisma" -NoNewline

Write-Host "✅ Data migrated with proper timestamps!" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 6: Fix timestamps (SQLite→PostgreSQL conversion)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Converting SQLite integer timestamps to PostgreSQL..." -ForegroundColor Gray
Write-Host "   (SQLite stores as milliseconds, need to convert)" -ForegroundColor Gray
Write-Host ""

# Create SQL script to fix all timestamps
@"
-- Fix User table
UPDATE "User" 
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Resume table
UPDATE "Resume"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Company table
UPDATE "Company"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Content table
UPDATE "Content"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix CoverLetter table
UPDATE "CoverLetter"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix CoverLetterContent table
UPDATE "CoverLetterContent"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix JobApplication table
UPDATE "JobApplication"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Section table
UPDATE "Section"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Tag table (only has createdAt)
UPDATE "Tag"
SET "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Contact table
UPDATE "Contact"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix ContactMessage table
UPDATE "ContactMessage"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Interview table
UPDATE "Interview"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix JobApplicationQuestion table (only has createdAt)
UPDATE "JobApplicationQuestion"
SET "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix StoryBlock table
UPDATE "StoryBlock"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix AnswerSnippet table
UPDATE "AnswerSnippet"
SET 
  "createdAt" = to_timestamp(EXTRACT(EPOCH FROM "createdAt") / 1000000),
  "updatedAt" = to_timestamp(EXTRACT(EPOCH FROM "updatedAt") / 1000000)
WHERE EXTRACT(YEAR FROM "createdAt") > 2100;

-- Fix Secrets.lastSignedIn (special case)
UPDATE "Secrets"
SET "lastSignedIn" = to_timestamp(EXTRACT(EPOCH FROM "lastSignedIn") / 1000000)
WHERE "lastSignedIn" IS NOT NULL AND EXTRACT(YEAR FROM "lastSignedIn") > 2100;

-- Fix any remaining NULL timestamps
UPDATE "User" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
"@ | Out-File -FilePath "fix-timestamps.sql" -Encoding utf8 -Force

# Copy and execute the SQL script
docker cp fix-timestamps.sql reactive-resume-postgres:/tmp/fix-timestamps.sql 2>$null
docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -f /tmp/fix-timestamps.sql 2>$null | Out-Null

Write-Host "✅ Timestamps converted successfully" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 7: Verify data" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking table counts..." -ForegroundColor Gray
docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -c "\dt" 2>$null | Out-Null
Write-Host "✅ Tables exist" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 8: Clean Prisma cache" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Removing Prisma artifacts..." -ForegroundColor Gray
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\@prisma" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cache cleared" -ForegroundColor Green

Write-Host "Regenerating Prisma Client..." -ForegroundColor Gray
pnpm prisma:generate 2>&1 | Select-String "Generated" | Write-Host
Write-Host "✅ Client regenerated" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 9: Update DATABASE_URL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Update .env to add sslmode=disable
Write-Host "Adding sslmode=disable to DATABASE_URL..." -ForegroundColor Gray
$envContent = Get-Content .env -Raw
$envContent = $envContent -replace 'DATABASE_URL=postgresql://([^?]+)\?schema=public', 'DATABASE_URL=postgresql://$1?schema=public&sslmode=disable'
$envContent | Set-Content .env -NoNewline
Write-Host "✅ DATABASE_URL updated" -ForegroundColor Green

# Also update tools/.env
if (Test-Path "tools/.env") {
    Write-Host "Updating tools/.env..." -ForegroundColor Gray
    $toolsEnvContent = Get-Content tools/.env -Raw
    $toolsEnvContent = $toolsEnvContent -replace 'DATABASE_URL=postgresql://([^?]+)\?schema=public', 'DATABASE_URL=postgresql://$1?schema=public&sslmode=disable'
    $toolsEnvContent | Set-Content tools/.env -NoNewline
    Write-Host "✅ tools/.env updated" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ MIGRATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: pnpm dev" -ForegroundColor Cyan
Write-Host "  2. Wait 30 seconds" -ForegroundColor Gray
Write-Host "  3. Test: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "  4. Login and verify data" -ForegroundColor Cyan
Write-Host ""
