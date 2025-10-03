#!/usr/bin/env bash
set -e

# ============================================================================
# SQLite → PostgreSQL Migration (For Linux Server Deployment)
# ============================================================================
#
# This script migrates your SQLite dev.db to PostgreSQL on the server.
# Run this ONCE during initial server deployment.
#
# Prerequisites:
# - PostgreSQL running (docker compose -f self-hosted-infrastructure.yml up -d)
# - dev.db file uploaded to server
#
# Usage:
#   ./scripts/migrate/sqlite-to-postgres-server.sh /path/to/dev.db
# ============================================================================

SQLITE_FILE="${1:-apps/server/prisma/dev.db}"
PG_HOST="${PG_HOST:-reactive-resume-postgres}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-reactive_resume}"
PG_PASS="${PG_PASS:-reactive_resume_2024}"
PG_DB="${PG_DB:-reactive_resume}"

echo "═══════════════════════════════════════"
echo "  SQLite → PostgreSQL Migration"
echo "═══════════════════════════════════════"
echo ""

# Step 1: Verify files
if [ ! -f "$SQLITE_FILE" ]; then
    echo "❌ ERROR: SQLite file not found: $SQLITE_FILE"
    exit 1
fi

echo "✓ SQLite file: $SQLITE_FILE ($(du -h $SQLITE_FILE | cut -f1))"
echo ""

# Step 2: Verify Postgres
echo "Checking PostgreSQL connection..."
docker exec reactive-resume-postgres pg_isready -U $PG_USER -d $PG_DB > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
    exit 1
fi
echo ""

# Step 3: Wipe Postgres (if needed)
echo "⚠️  WARNING: This will DROP all data in PostgreSQL!"
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi
echo ""

echo "Dropping public schema..."
docker exec reactive-resume-postgres psql -U $PG_USER -d $PG_DB -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
echo "✅ Postgres wiped clean"
echo ""

# Step 4: Import with pgloader
echo "Importing with pgloader..."
SQLITE_DIR=$(dirname "$SQLITE_FILE")
SQLITE_NAME=$(basename "$SQLITE_FILE")

docker run --rm \
  --network reactive_resume_network \
  -v "$(realpath $SQLITE_DIR):/data" \
  dimitri/pgloader:latest \
  pgloader "/data/$SQLITE_NAME" "postgresql://$PG_USER:$PG_PASS@$PG_HOST:$PG_PORT/$PG_DB"

echo ""
echo "═══════════════════════════════════════"
echo "  Verification"
echo "═══════════════════════════════════════"
echo ""

# Step 5: Verify import
echo "Checking row counts..."
docker exec reactive-resume-postgres psql -U $PG_USER -d $PG_DB -c "
SELECT 
  'User' AS table, COUNT(*) as rows FROM \"User\"
  UNION ALL SELECT 'Resume', COUNT(*) FROM \"Resume\"
  UNION ALL SELECT 'JobApplication', COUNT(*) FROM \"JobApplication\"
  UNION ALL SELECT 'Company', COUNT(*) FROM \"Company\"
  UNION ALL SELECT 'Contact', COUNT(*) FROM \"Contact\"
  UNION ALL SELECT 'CoverLetter', COUNT(*) FROM \"CoverLetter\"
  UNION ALL SELECT 'Content', COUNT(*) FROM \"Content\"
ORDER BY table;
"

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env: DATABASE_URL=postgresql://..."
echo "  2. Restart app: pm2 restart all"
echo ""



