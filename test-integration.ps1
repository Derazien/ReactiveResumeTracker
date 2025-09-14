#!/usr/bin/env pwsh
# Test Job Automation Integration

Write-Host ""
Write-Host "🧪 Testing Job Automation Integration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Test 1: Check Skyvern API
Write-Host ""
Write-Host "Testing Skyvern API..." -ForegroundColor Yellow

try {
    # Try different Skyvern endpoints to find the right one
    $skyvernResponse = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Skyvern API is responding" -ForegroundColor Green
    Write-Host "Response: $($skyvernResponse.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Skyvern API not ready yet" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 2: Check main server
Write-Host ""
Write-Host "Testing main ReactiveResumeTracker..." -ForegroundColor Yellow

$serverReady = $false
try {
    $mainResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Main server is running" -ForegroundColor Green
    $serverReady = $true
} catch {
    Write-Host "⚠️ Main server not running" -ForegroundColor Yellow
    Write-Host "Start with: pnpm dev" -ForegroundColor White
}

# Test 3: Check automation endpoint (if main server is running)
if ($serverReady) {
    Write-Host ""
    Write-Host "Testing automation integration..." -ForegroundColor Yellow
    
    try {
        $automationResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/automation/status" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Automation endpoint is available" -ForegroundColor Green
        Write-Host "Response: $($automationResponse.Content)" -ForegroundColor White
    } catch {
        Write-Host "❌ Automation endpoint failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 4: Simple Skyvern task test
Write-Host ""
Write-Host "Testing Skyvern task creation..." -ForegroundColor Yellow

$testTaskData = @{
    url = "https://example.com"
    navigation_goal = "Test navigation to example.com"
    data_extraction_goal = "Extract the page title"
} | ConvertTo-Json

try {
    $taskResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/tasks" -Method POST -Body $testTaskData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    if ($taskResponse.StatusCode -eq 200 -or $taskResponse.StatusCode -eq 201) {
        Write-Host "✅ Skyvern task creation working!" -ForegroundColor Green
        $taskResult = $taskResponse.Content | ConvertFrom-Json
        Write-Host "Task ID: $($taskResult.task_id)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Skyvern task creation returned: $($taskResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Skyvern task creation failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Message -match "Unauthorized") {
        Write-Host "💡 This might be an authentication issue" -ForegroundColor Cyan
        Write-Host "   Skyvern may need proper API key setup" -ForegroundColor White
    }
}

# Summary
Write-Host ""
Write-Host "🎯 Integration Status Summary" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check service status
$skyvernRunning = (docker ps --filter "name=skyvern-api" --filter "status=running" --quiet) -ne ""
$postgresRunning = (docker ps --filter "name=skyvern-postgres" --filter "status=running" --quiet) -ne ""
$redisRunning = (docker ps --filter "name=skyvern-redis" --filter "status=running" --quiet) -ne ""

Write-Host "Docker Services:" -ForegroundColor Yellow
if ($skyvernRunning) { Write-Host "  ✅ Skyvern API: Running on port 8000" -ForegroundColor Green } else { Write-Host "  ❌ Skyvern API: Not running" -ForegroundColor Red }
if ($postgresRunning) { Write-Host "  ✅ PostgreSQL: Running on port 5433" -ForegroundColor Green } else { Write-Host "  ❌ PostgreSQL: Not running" -ForegroundColor Red }  
if ($redisRunning) { Write-Host "  ✅ Redis: Running on port 6380" -ForegroundColor Green } else { Write-Host "  ❌ Redis: Not running" -ForegroundColor Red }

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
if (!$serverReady) {
    Write-Host "1. Start main server: pnpm dev" -ForegroundColor White
    Write-Host "2. Test automation: curl http://localhost:3000/api/automation/status" -ForegroundColor White
} else {
    Write-Host "1. ✅ Main server is running" -ForegroundColor Green
    Write-Host "2. Test job automation with your app!" -ForegroundColor White
}

Write-Host ""
if ($skyvernRunning -and $serverReady) {
    Write-Host "🎉 Job automation system is READY!" -ForegroundColor Green
    Write-Host "   You can now automate job applications on any job board!" -ForegroundColor White
} else {
    Write-Host "⚠️ Some services need attention" -ForegroundColor Yellow
    Write-Host "   Check the status above and start missing services" -ForegroundColor White
}

Write-Host ""






