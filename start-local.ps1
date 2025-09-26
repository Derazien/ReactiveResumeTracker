# 🚀 ReactiveResume Local Development Launcher
# =============================================
# Simple wrapper for organized local development scripts

param(
    [switch]$Full,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Help
)

if ($Help) {
    Write-Host "🚀 ReactiveResume Local Development Launcher" -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\start-local.ps1                # Start ReactiveResume only (lightweight)"
    Write-Host "  .\start-local.ps1 -Full          # Start complete automation stack"
    Write-Host "  .\start-local.ps1 -Stop          # Stop all local services"
    Write-Host "  .\start-local.ps1 -Status        # Check service status"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Green
    Write-Host "  Default: ReactiveResume only (SQLite, fast development)"
    Write-Host "  -Full:   Complete stack (ReactiveResume + Skyvern automation)"
    Write-Host ""
    Write-Host "All services run in BACKGROUND - terminal stays free!" -ForegroundColor Cyan
    Write-Host ""
    exit
}

Write-Host "🚀 ReactiveResume Local Development" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

if ($Full) {
    Write-Host "🤖 Starting complete automation stack..." -ForegroundColor Yellow
    Write-Host "   (ReactiveResume + Skyvern + Full automation)" -ForegroundColor Cyan
    
    if ($Stop) {
        & "scripts\development\local-setup-complete-stack.ps1" -Stop
    } elseif ($Status) {
        & "scripts\development\local-setup-complete-stack.ps1" -Status
    } else {
        & "scripts\development\local-setup-complete-stack.ps1"
    }
} else {
    Write-Host "⚡ Starting ReactiveResume only (lightweight)..." -ForegroundColor Yellow
    Write-Host "   (Fast SQLite development, no automation)" -ForegroundColor Cyan
    
    if ($Stop) {
        & "scripts\development\local-setup-reactiveresume-only.ps1" -Stop
    } elseif ($Status) {
        & "scripts\development\local-setup-reactiveresume-only.ps1" -Status
    } else {
        & "scripts\development\local-setup-reactiveresume-only.ps1"
    }
}

Write-Host ""
Write-Host "💡 For more options, add -Help to see all available flags" -ForegroundColor Green
