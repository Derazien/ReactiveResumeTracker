#!/bin/bash
# SQLite → PostgreSQL using Sequel (Ruby gem) - via Docker

set -e

echo "═══════════════════════════════════════"
echo "  SQLite → PostgreSQL (Sequel Gem)"
echo "═══════════════════════════════════════"
echo ""

# PostgreSQL connection details
PG_HOST="reactive-resume-postgres"
PG_PORT="5432"
PG_USER="reactive_resume"
PG_PASS="reactive_resume_2024"
PG_DB="reactive_resume"
SQLITE_FILE="/data/dev.db"

echo "📦 Step 1: Installing Ruby gems in Docker..."
docker run --rm \
  --network reactive_resume_network \
  -v "$(pwd)/apps/server/prisma:/data" \
  ruby:3-alpine \
  sh -c "
    apk add --no-cache build-base postgresql-dev sqlite-dev > /dev/null 2>&1
    gem install sequel pg sqlite3 --no-document > /dev/null 2>&1
    echo '✅ Gems installed'
  "

echo ""
echo "📦 Step 2: Running Sequel migration..."
echo "  Source: SQLite ($SQLITE_FILE)"
echo "  Target: PostgreSQL ($PG_HOST:$PG_PORT/$PG_DB)"
echo ""

docker run --rm \
  --network reactive_resume_network \
  -v "$(pwd)/apps/server/prisma:/data" \
  ruby:3-alpine \
  sh -c "
    apk add --no-cache build-base postgresql-dev sqlite-dev > /dev/null 2>&1
    gem install sequel pg sqlite3 --no-document > /dev/null 2>&1
    
    echo '🚀 Migrating data...'
    sequel -C sqlite://$SQLITE_FILE postgres://$PG_USER:$PG_PASS@$PG_HOST:$PG_PORT/$PG_DB
  "

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ Migration Complete!"
echo "═══════════════════════════════════════"
echo ""
echo "Verifying data..."
docker exec reactive-resume-postgres psql -U $PG_USER -d $PG_DB -c "
  SELECT 'User' AS table, COUNT(*) as rows FROM \"User\"
  UNION ALL SELECT 'Resume', COUNT(*) FROM \"Resume\"
  UNION ALL SELECT 'JobApplication', COUNT(*) FROM \"JobApplication\"
  UNION ALL SELECT 'Company', COUNT(*) FROM \"Company\"
  ORDER BY table;
"



