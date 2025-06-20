# Ensure we're in the project root
Set-Location $PSScriptRoot/../..

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
pnpm build

# Run the import script
Write-Host "Running import script..." -ForegroundColor Yellow
npx ts-node tools/db-scripts/import-content.ts

Write-Host "Import completed!" -ForegroundColor Green 