#!/usr/bin/env pwsh
# Windows Convenience Wrapper for Local Development
# This wrapper will be removed after the grace period

Write-Host "🚀 Running the canonical command: pnpm dev" -ForegroundColor Cyan
Write-Host "   (This wrapper will be removed after the grace period)" -ForegroundColor Yellow
Write-Host ""

# Forward to canonical command
pnpm dev


