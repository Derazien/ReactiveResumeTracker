#!/bin/bash

# Import PostgreSQL Database Dump
# ============================================================================
# DESCRIPTION:
#   Imports the postgres-backup.dump file into the PostgreSQL database
#   This should be run AFTER the deployment script has set up the database
#
# USAGE:
#   ./scripts/production/import-database.sh
#
# PREREQUISITES:
#   - PostgreSQL container must be running
#   - Database schema must be set up (run deploy-server.sh first)
#   - postgres-backup.dump file must exist in project root
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🗄️  PostgreSQL Database Import${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check if dump file exists
if [ ! -f "postgres-backup.dump" ]; then
    echo -e "${RED}❌ postgres-backup.dump file not found in project root${NC}"
    echo -e "${GRAY}  Make sure the dump file is in the same directory as this script${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found postgres-backup.dump (size: $(du -h postgres-backup.dump | cut -f1))${NC}"
echo ""

# Check if PostgreSQL is running
echo -e "${YELLOW}🔍 Checking PostgreSQL connection...${NC}"
if ! docker exec reactive-resume-postgres pg_isready -U reactive_resume -d reactive_resume > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL container is not running or not accessible${NC}"
    echo -e "${GRAY}  Make sure to run ./scripts/production/deploy-server.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is running and accessible${NC}"
echo ""

# Backup current database (if it has data)
echo -e "${YELLOW}💾 Creating backup of current database...${NC}"
BACKUP_FILE="postgres-backup-$(date +%Y%m%d-%H%M%S).dump"
docker exec reactive-resume-postgres pg_dump -U reactive_resume -d reactive_resume --format=custom --no-owner --no-privileges > "$BACKUP_FILE" 2>/dev/null || {
    echo -e "${GRAY}  Database appears to be empty or backup failed (this is normal for fresh installs)${NC}"
    rm -f "$BACKUP_FILE"
}

if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✓ Database backed up to $BACKUP_FILE${NC}"
else
    echo -e "${GRAY}✓ No existing data to backup (fresh database)${NC}"
    rm -f "$BACKUP_FILE"
fi

echo ""

# Import the dump file
echo -e "${YELLOW}📥 Importing database from postgres-backup.dump...${NC}"
echo -e "${GRAY}  This may take a few minutes depending on data size...${NC}"

# Use pg_restore to import the dump
if docker exec -i reactive-resume-postgres pg_restore -U reactive_resume -d reactive_resume --clean --if-exists --no-owner --no-privileges < postgres-backup.dump; then
    echo -e "${GREEN}✓ Database import completed successfully${NC}"
else
    echo -e "${RED}❌ Database import failed${NC}"
    echo -e "${GRAY}  Check the error messages above for details${NC}"
    
    # Try alternative import method
    echo -e "${YELLOW}⚠ Trying alternative import method...${NC}"
    if docker exec -i reactive-resume-postgres psql -U reactive_resume -d reactive_resume < postgres-backup.dump; then
        echo -e "${GREEN}✓ Database import completed with alternative method${NC}"
    else
        echo -e "${RED}❌ Both import methods failed${NC}"
        exit 1
    fi
fi

echo ""

# Verify import
echo -e "${YELLOW}🔍 Verifying database import...${NC}"
TABLE_COUNT=$(docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n')

if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Database contains $TABLE_COUNT tables${NC}"
    
    # Show sample data counts
    echo -e "${GRAY}  Sample table counts:${NC}"
    docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -t -c "
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as row_count
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public' 
        ORDER BY n_tup_ins DESC 
        LIMIT 5;
    " 2>/dev/null | sed 's/^/    /'
else
    echo -e "${YELLOW}⚠ Could not verify table count (database may be empty)${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Database Import Complete!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GRAY}Your Reactive Resume application should now have all the data from your local development environment.${NC}"
echo ""
echo -e "${GRAY}Next steps:${NC}"
echo -e "${GRAY}  • Test the application: http://66.96.83.44:3000${NC}"
echo -e "${GRAY}  • Check PM2 status: pm2 status${NC}"
echo -e "${GRAY}  • View logs: pm2 logs${NC}"
echo ""
