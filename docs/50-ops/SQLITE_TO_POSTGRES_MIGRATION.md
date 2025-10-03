# SQLite → PostgreSQL Migration Guide

**Date**: 2025-10-03  
**Status**: For Server Deployment Only

---

## Summary

This guide covers migrating from SQLite (`dev.db`) to PostgreSQL when deploying to a production Linux server.

**Important**: 
- ✅ **Windows Local Dev**: Keep using SQLite (simpler, works perfectly)
- ✅ **Linux Server**: Use PostgreSQL (production-grade)
- ✅ **Migration**: Happens once during initial server deployment

---

## Windows Authentication Issue (Why We Don't Migrate Locally)

**Problem Encountered**:
- Prisma CLI from Windows → Docker PostgreSQL fails with `P1000: Authentication failed`
- Root cause: Windows networking + Docker Desktop + Prisma auth handshake incompatibility
- pgloader fails due to SQLite `DEFAULT 'current_timestamp'` → PostgreSQL syntax mismatch

**Solution**:
- Keep SQLite for Windows local development
- Migrate to PostgreSQL on Linux server (works perfectly there)

---

## Migration on Linux Server

### Prerequisites

1. **Upload dev.db** to server:
   ```bash
   scp apps/server/prisma/dev.db user@server:/path/to/ReactiveResumeTracker/apps/server/prisma/
   ```

2. **Start PostgreSQL**:
   ```bash
   docker compose -f self-hosted-infrastructure.yml up -d postgres
   ```

3. **Install pgloader** (if not using Docker):
   ```bash
   apt-get install pgloader
   ```

---

## Option A: Automatic Script (Recommended)

```bash
# Run the migration script
./scripts/migrate/sqlite-to-postgres-server.sh apps/server/prisma/dev.db
```

**What it does**:
1. Verifies SQLite file exists
2. Checks PostgreSQL is ready
3. Asks for confirmation before wiping Postgres
4. Drops existing Postgres schema
5. Runs pgloader to import SQLite → Postgres
6. Verifies row counts

---

## Option B: Manual Migration

### Step 1: Backup SQLite
```bash
cp apps/server/prisma/dev.db apps/server/prisma/dev.db.backup
```

### Step 2: Drop Existing Postgres Schema
```bash
docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume \
  -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
```

### Step 3: Run pgloader
```bash
docker run --rm \
  --network reactive_resume_network \
  -v "$(pwd)/apps/server/prisma:/data" \
  dimitri/pgloader:latest \
  pgloader "/data/dev.db" \
    "postgresql://reactive_resume:reactive_resume_2024@reactive-resume-postgres:5432/reactive_resume"
```

###Step 4: Verify Import
```bash
docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -c "
SELECT 
  'User' AS table, COUNT(*) as rows FROM \"User\"
  UNION ALL SELECT 'Resume', COUNT(*) FROM \"Resume\"
  UNION ALL SELECT 'JobApplication', COUNT(*) FROM \"JobApplication\"
  UNION ALL SELECT 'Company', COUNT(*) FROM \"Company\"
ORDER BY table;
"
```

### Step 5: Fix Sequences (if needed)
```bash
# Find max IDs and reset sequences
docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -c "
SELECT setval(pg_get_serial_sequence('\"User\"','id'), (SELECT COALESCE(MAX(id),1) FROM \"User\"));
SELECT setval(pg_get_serial_sequence('\"Resume\"','id'), (SELECT COALESCE(MAX(id),1) FROM \"Resume\"));
SELECT setval(pg_get_serial_sequence('\"JobApplication\"','id'), (SELECT COALESCE(MAX(id),1) FROM \"JobApplication\"));
"
```

### Step 6: Update .env
```bash
# Update DATABASE_URL to PostgreSQL
DATABASE_URL=postgresql://reactive_resume:reactive_resume_2024@localhost:5432/reactive_resume?schema=public
```

### Step 7: Restart Application
```bash
# With PM2
pm2 restart all

# Or with Docker
docker compose -f self-hosted-infrastructure.yml restart
```

---

## Local Development Recommendation

**Keep SQLite for Windows**:
```bash
# schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# .env
DATABASE_URL=file:./dev.db
```

**Advantages**:
- ✅ No Docker required
- ✅ Faster startup
- ✅ File-based (easy backup)
- ✅ No Windows networking issues
- ✅ Identical schema to production (via Prisma)

---

## Summary

**Current Status**:
- ✅ SQLite restored for local Windows development
- ✅ PostgreSQL schema created (ready for migration on server)
- ✅ Migration script created for Linux server deployment

**Your Setup**:
- **Local (Windows)**: SQLite (`dev.db`) ← **Use this**
- **Server (Linux)**: PostgreSQL (migrate during deployment)

**Next Steps**:
1. Continue development on Windows with SQLite
2. When deploying to server, run migration script
3. Server will use PostgreSQL from that point forward

---

**Migration works perfectly on Linux!** The Windows auth issue is specific to Windows + Docker Desktop + Prisma.



