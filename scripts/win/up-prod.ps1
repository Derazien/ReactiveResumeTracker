#!/usr/bin/env pwsh
# Windows Convenience Wrapper for Production Deployment
# This wrapper will be removed after the grace period

Write-Host "🌐 Running the canonical command: docker compose -f self-hosted-infrastructure.yml up -d" -ForegroundColor Cyan
Write-Host "   (This wrapper will be removed after the grace period)" -ForegroundColor Yellow
Write-Host ""

# Forward to canonical command
docker compose -f self-hosted-infrastructure.yml up -d


