#!/usr/bin/env pwsh
# Windows Convenience Wrapper for Local Docker Development
# This wrapper will be removed after the grace period

Write-Host "🐳 Running the canonical command: docker compose -f unified-docker-compose.yml up -d" -ForegroundColor Cyan
Write-Host "   (This wrapper will be removed after the grace period)" -ForegroundColor Yellow
Write-Host ""

# Forward to canonical command
docker compose -f unified-docker-compose.yml up -d


