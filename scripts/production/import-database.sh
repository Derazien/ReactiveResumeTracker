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

# Find the dump file (it should be in the project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DUMP_FILE=""

# Look for the dump file in common locations (prioritize .sql files)
for path in "$PROJECT_ROOT/postgres-backup.sql" "$SCRIPT_DIR/postgres-backup.sql" "./postgres-backup.sql" "postgres-backup.sql" "$PROJECT_ROOT/postgres-backup.dump" "$SCRIPT_DIR/postgres-backup.dump" "./postgres-backup.dump" "postgres-backup.dump"; do
    if [ -f "$path" ]; then
        DUMP_FILE="$path"
        break
    fi
done

if [ -z "$DUMP_FILE" ]; then
    echo -e "${RED}❌ postgres-backup.dump or postgres-backup.sql file not found${NC}"
    echo -e "${GRAY}  Searched in:${NC}"
    echo -e "${GRAY}    - $PROJECT_ROOT/postgres-backup.dump${NC}"
    echo -e "${GRAY}    - $SCRIPT_DIR/postgres-backup.dump${NC}"
    echo -e "${GRAY}    - ./postgres-backup.dump${NC}"
    echo -e "${GRAY}    - $PROJECT_ROOT/postgres-backup.sql${NC}"
    echo -e "${GRAY}    - $SCRIPT_DIR/postgres-backup.sql${NC}"
    echo -e "${GRAY}    - ./postgres-backup.sql${NC}"
    echo -e "${GRAY}  Make sure the dump file exists in one of these locations${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found dump file at: $DUMP_FILE${NC}"
echo -e "${GREEN}✓ File size: $(du -h "$DUMP_FILE" | cut -f1)${NC}"
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

# Check dump file version and handle compatibility
echo -e "${GRAY}  Checking dump file format...${NC}"

# Handle SQL files differently (no need to copy to container)
if [[ "$DUMP_FILE" == *.sql ]]; then
    echo -e "${GRAY}  Cleaning SQL file for encoding issues...${NC}"
    
    # Create a cleaned version of the SQL file
    CLEAN_SQL_FILE="${DUMP_FILE%.sql}-clean.sql"
    
    # Remove invalid UTF-8 sequences and fix common encoding issues
    sed 's/\xff//g' "$DUMP_FILE" | iconv -f UTF-8 -t UTF-8 -c > "$CLEAN_SQL_FILE" 2>/dev/null || \
    sed 's/\xff//g' "$DUMP_FILE" > "$CLEAN_SQL_FILE"
    
    echo -e "${GRAY}  Importing cleaned SQL file (showing all output)...${NC}"
    if docker exec -i reactive-resume-postgres psql -U reactive_resume -d reactive_resume < "$CLEAN_SQL_FILE"; then
        echo -e "${GREEN}✓ Database import completed successfully with SQL file${NC}"
        rm -f "$CLEAN_SQL_FILE"  # Clean up temporary file
    else
        echo -e "${RED}❌ SQL import failed - check errors above${NC}"
        echo -e "${GRAY}  Cleaned SQL file preserved at: $CLEAN_SQL_FILE${NC}"
        exit 1
    fi
else
    # For dump files, copy into container first
    echo -e "${GRAY}  Copying dump file into PostgreSQL container...${NC}"
    CONTAINER_DUMP_PATH="/tmp/postgres-backup.dump"
    docker cp "$DUMP_FILE" reactive-resume-postgres:"$CONTAINER_DUMP_PATH"

    # Try to extract dump info first
    DUMP_INFO=$(docker exec reactive-resume-postgres pg_restore --list "$CONTAINER_DUMP_PATH" 2>&1 | head -5)
    echo -e "${GRAY}  Dump info: $DUMP_INFO${NC}"

    # Method 1: Try pg_restore with version compatibility
    echo -e "${GRAY}  Attempting pg_restore import...${NC}"
    if docker exec reactive-resume-postgres pg_restore -U reactive_resume -d reactive_resume --clean --if-exists --no-owner --no-privileges --disable-triggers "$CONTAINER_DUMP_PATH" 2>/dev/null; then
        echo -e "${GREEN}✓ Database import completed successfully with pg_restore${NC}"
    else
        echo -e "${YELLOW}⚠ pg_restore failed, trying direct SQL import...${NC}"
    
    # Method 2: Convert to SQL and import
    echo -e "${GRAY}  Converting dump to SQL format...${NC}"
    
    # Create a temporary SQL file
    TEMP_SQL="/tmp/import.sql"
    
    # Try to convert the dump to SQL (this often works even with version mismatches)
    if docker exec reactive-resume-postgres pg_restore --no-owner --no-privileges --schema-only "$CONTAINER_DUMP_PATH" > "$TEMP_SQL" 2>/dev/null; then
        echo -e "${GRAY}  Schema converted, importing structure...${NC}"
        docker exec -i reactive-resume-postgres psql -U reactive_resume -d reactive_resume < "$TEMP_SQL" 2>/dev/null
        
        # Now try data import
        echo -e "${GRAY}  Importing data...${NC}"
        if docker exec reactive-resume-postgres pg_restore --no-owner --no-privileges --data-only --disable-triggers "$CONTAINER_DUMP_PATH" | docker exec -i reactive-resume-postgres psql -U reactive_resume -d reactive_resume 2>/dev/null; then
            echo -e "${GREEN}✓ Database import completed with SQL conversion method${NC}"
        else
            echo -e "${YELLOW}⚠ Data import failed, trying manual SQL extraction...${NC}"
            
            # Method 3: Extract as plain SQL
            if docker exec reactive-resume-postgres pg_restore --no-owner --no-privileges --disable-triggers --inserts "$CONTAINER_DUMP_PATH" > "$TEMP_SQL" 2>/dev/null; then
                echo -e "${GRAY}  Importing plain SQL dump...${NC}"
                if docker exec -i reactive-resume-postgres psql -U reactive_resume -d reactive_resume < "$TEMP_SQL" 2>/dev/null; then
                    echo -e "${GREEN}✓ Database import completed with plain SQL method${NC}"
                else
                    echo -e "${RED}❌ All import methods failed${NC}"
                    echo -e "${GRAY}  The dump file may be corrupted or incompatible${NC}"
                    rm -f "$TEMP_SQL"
                    exit 1
                fi
            else
                echo -e "${RED}❌ Could not convert dump to SQL format${NC}"
                rm -f "$TEMP_SQL"
                exit 1
            fi
        fi
        rm -f "$TEMP_SQL"
    else
        echo -e "${RED}❌ Could not extract schema from dump file${NC}"
        exit 1
    fi
fi
fi  # End of SQL vs dump file handling

echo ""

# Verify import
echo -e "${YELLOW}🔍 Verifying database import...${NC}"

# Check if container exists and is running
if ! docker ps | grep -q reactive-resume-postgres; then
    echo -e "${RED}❌ PostgreSQL container 'reactive-resume-postgres' is not running!${NC}"
    echo -e "${GRAY}  Available containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    exit 1
fi

# Test connection first
if ! docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to PostgreSQL database!${NC}"
    exit 1
fi

TABLE_COUNT=$(docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n')

if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Database contains $TABLE_COUNT tables${NC}"
    
    # Check for actual data in key tables
    echo -e "${GRAY}  Checking key table data counts:${NC}"
    
    # Check User table
    USER_COUNT=$(docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | tr -d ' \n')
    echo -e "${GRAY}    Users: $USER_COUNT${NC}"
    
    # Check Resume table  
    RESUME_COUNT=$(docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -t -c "SELECT COUNT(*) FROM \"Resume\";" 2>/dev/null | tr -d ' \n')
    echo -e "${GRAY}    Resumes: $RESUME_COUNT${NC}"
    
    # Check JobApplication table
    JOB_COUNT=$(docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -t -c "SELECT COUNT(*) FROM \"JobApplication\";" 2>/dev/null | tr -d ' \n')
    echo -e "${GRAY}    Job Applications: $JOB_COUNT${NC}"
    
    if [ "$USER_COUNT" -gt 0 ] || [ "$RESUME_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Database contains actual data${NC}"
    else
        echo -e "${YELLOW}⚠ Database has tables but no data in key tables${NC}"
    fi
else
    echo -e "${RED}❌ Database is empty or connection failed${NC}"
    exit 1
fi

# Cleanup
echo -e "${GRAY}  Cleaning up temporary files...${NC}"
docker exec reactive-resume-postgres rm -f "$CONTAINER_DUMP_PATH" 2>/dev/null || true
rm -f "$TEMP_SQL" 2>/dev/null || true

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
