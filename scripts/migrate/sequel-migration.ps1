#!/usr/bin/env pwsh
# SQLite → PostgreSQL using Sequel (Ruby gem) - Windows via Docker

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SQLite → PostgreSQL (Sequel Gem)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$PG_HOST = "reactive-resume-postgres"
$PG_PORT = "5432"
$PG_USER = "reactive_resume"
$PG_PASS = "reactive_resume_2024"
$PG_DB = "reactive_resume"
$SQLITE_FILE = "/data/dev.db"

Write-Host "📦 Step 1: Preparing Ruby environment in Docker..." -ForegroundColor Yellow
Write-Host "  (Installing sequel, pg, sqlite3 gems)" -ForegroundColor Gray
Write-Host ""

# Install gems (one-time setup)
docker run --rm `
  --network reactive_resume_network `
  -v "$PWD\apps\server\prisma:/data" `
  ruby:3-alpine `
  sh -c 'apk add --no-cache build-base postgresql-dev sqlite-dev > /dev/null 2>&1 && gem install sequel pg sqlite3 --no-document > /dev/null 2>&1 && echo "✅ Gems installed"' 2>&1 | Select-String "installed|error"

Write-Host ""
Write-Host "📦 Step 2: Running Sequel migration..." -ForegroundColor Yellow
Write-Host "  Source: SQLite ($SQLITE_FILE)" -ForegroundColor Gray
Write-Host "  Target: PostgreSQL ($PG_HOST`:$PG_PORT/$PG_DB)" -ForegroundColor Gray
Write-Host ""

# Run migration
docker run --rm `
  --network reactive_resume_network `
  -v "$PWD\apps\server\prisma:/data" `
  ruby:3-alpine `
  sh -c "apk add --no-cache build-base postgresql-dev sqlite-dev > /dev/null 2>&1 && gem install sequel pg sqlite3 --no-document > /dev/null 2>&1 && echo '🚀 Migrating data...' && sequel -C sqlite://$SQLITE_FILE postgres://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/${PG_DB}" 2>&1

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ Migration Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "Verifying data..." -ForegroundColor Cyan
docker exec reactive-resume-postgres psql -U $PG_USER -d $PG_DB -c "
  SELECT 'User' AS table, COUNT(*) as rows FROM \`"User\`"
  UNION ALL SELECT 'Resume', COUNT(*) FROM \`"Resume\`"
  UNION ALL SELECT 'JobApplication', COUNT(*) FROM \`"JobApplication\`"
  UNION ALL SELECT 'Company', COUNT(*) FROM \`"Company\`"
  UNION ALL SELECT 'Tag', COUNT(*) FROM \`"Tag\`"
  ORDER BY table;
" 2>&1

Write-Host ""
Write-Host "✅ Ready to export Postgres dump!" -ForegroundColor Green
Write-Host ""
Write-Host "To export for server:" -ForegroundColor Cyan
Write-Host "  docker exec reactive-resume-postgres pg_dump -U $PG_USER -d $PG_DB -F c -f /tmp/postgres-backup.dump" -ForegroundColor Gray
Write-Host "  docker cp reactive-resume-postgres:/tmp/postgres-backup.dump ./postgres-backup.dump" -ForegroundColor Gray

