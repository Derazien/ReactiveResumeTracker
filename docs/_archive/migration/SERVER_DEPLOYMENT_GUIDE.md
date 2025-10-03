# Server Deployment Guide - PostgreSQL Import

**Date**: 2025-10-03  
**Status**: Ready for Deployment

---

## Quick Start

You now have a **clean PostgreSQL dump** ready for server deployment:
- **File**: `postgres-backup.dump` (0.62 MB)
- **Format**: PostgreSQL custom format (binary, compressed)
- **Contents**: Full schema + all data from your local development

---

## Deployment Steps

### 1. Upload Backup to Server
```bash
scp postgres-backup.dump user@your-server:/tmp/
```

### 2. Start PostgreSQL on Server
```bash
cd /path/to/ReactiveResumeTracker

# Start Postgres service
docker compose -f self-hosted-infrastructure.yml up -d postgres

# Wait for it to be ready
docker exec reactive-resume-postgres pg_isready -U reactive_resume
```

### 3. Import the Dump
```bash
# Option A: Using docker exec (recommended)
docker exec -i reactive-resume-postgres pg_restore \
  -U reactive_resume \
  -d reactive_resume \
  --clean \
  --if-exists \
  < /tmp/postgres-backup.dump

# Option B: Using docker cp + restore
docker cp /tmp/postgres-backup.dump reactive-resume-postgres:/tmp/
docker exec reactive-resume-postgres pg_restore \
  -U reactive_resume \
  -d reactive_resume \
  --clean \
  --if-exists \
  /tmp/postgres-backup.dump
```

### 4. Verify Import
```bash
# Check row counts
docker exec reactive-resume-postgres psql -U reactive_resume -d reactive_resume -c "
  SELECT 'User' AS table, COUNT(*) FROM \"User\"
  UNION ALL SELECT 'Resume', COUNT(*) FROM \"Resume\"
  UNION ALL SELECT 'Company', COUNT(*) FROM \"Company\";
"

# Expected output:
#  table  | count
# --------+-------
#  User   |     1
#  Resume |     8
#  Company|     5
```

### 5. Update Server .env
```bash
nano .env

# Ensure this line exists:
DATABASE_URL=postgresql://reactive_resume:reactive_resume_2024@localhost:5432/reactive_resume?schema=public
```

### 6. Start/Restart Application
```bash
# With PM2
pm2 restart all

# Or with Docker
docker compose -f self-hosted-infrastructure.yml restart

# Or using deployment script
./scripts/production/deploy-server.sh
```

---

## Alternative: Fresh Migration on Server

If you prefer to run the migration directly on the server:

### 1. Upload SQLite Database
```bash
scp apps/server/prisma/dev.db user@server:/path/to/ReactiveResumeTracker/apps/server/prisma/
```

### 2. Run Sequel Migration
```bash
cd /path/to/ReactiveResumeTracker
./scripts/migrate/sequel-migration.sh
```

This will:
- Install Ruby gems in Docker (no server dependencies)
- Migrate SQLite → PostgreSQL automatically
- Reset sequences properly

---

## Troubleshooting

### Import Errors

**Error: "database ... does not exist"**
```bash
# Create database first
docker exec reactive-resume-postgres createdb -U reactive_resume reactive_resume
```

**Error: "role ... does not exist"**
```bash
# Create user first
docker exec reactive-resume-postgres psql -U postgres -c "
  CREATE USER reactive_resume WITH PASSWORD 'reactive_resume_2024';
  GRANT ALL PRIVILEGES ON DATABASE reactive_resume TO reactive_resume;
"
```

### Connection Issues

**Error: "Connection refused"**
```bash
# Check if Postgres is running
docker ps | grep postgres

# Check logs
docker logs reactive-resume-postgres
```

**Error: "Authentication failed"**
```bash
# Verify credentials in .env match docker-compose.yml
grep DATABASE_URL .env
grep POSTGRES_PASSWORD self-hosted-infrastructure.yml
```

---

## Files Reference

### Local (Windows)
- **Migration Script**: `scripts/migrate/sequel-migration.ps1`
- **Postgres Dump**: `postgres-backup.dump`
- **SQLite Backup**: `apps/server/prisma/dev.db`

### Server (Linux)
- **Migration Script**: `scripts/migrate/sequel-migration.sh`
- **Deployment Script**: `scripts/production/deploy-server.sh`
- **Docker Compose**: `self-hosted-infrastructure.yml`

---

## Success Criteria

✅ **Database Import Complete When:**
1. `pg_restore` completes without errors
2. Row counts match your local data
3. App starts without database connection errors
4. You can login and see your resumes/job applications

---

## Backup Strategy

After successful deployment:

### Automated Backups
```bash
# Add to crontab
0 2 * * * docker exec reactive-resume-postgres pg_dump -U reactive_resume -d reactive_resume -F c > /backups/postgres-$(date +\%Y\%m\%d).dump
```

### Manual Backup
```bash
docker exec reactive-resume-postgres pg_dump -U reactive_resume -d reactive_resume -F c > postgres-backup-$(date +%Y%m%d).dump
```

---

**Your database is ready for production!** 🚀



