# Backend startup script with Prisma fix

Write-Host "[BACKEND] Starting backend server..." -ForegroundColor Cyan

# Ensure database is ready
Write-Host "[STEP] Checking database..." -ForegroundColor Yellow
pnpm prisma db push --skip-generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Database setup failed" -ForegroundColor Red
    exit 1
}

# Try to generate Prisma client (skip errors)
Write-Host "[STEP] Attempting Prisma client generation..." -ForegroundColor Yellow
pnpm prisma generate 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Prisma client generated" -ForegroundColor Green
} else {
    Write-Host "[WARN] Prisma client generation failed, using existing client" -ForegroundColor Yellow
}

# Start only the backend server
Write-Host "[STEP] Starting backend server..." -ForegroundColor Yellow
pnpm nx serve server 