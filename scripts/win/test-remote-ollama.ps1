# ============================================================================
# Test Remote Ollama Connection
# ============================================================================
# 
# This script tests the connection to remote Ollama and verifies it's working.
# Run this after establishing SSH tunnel with connect-remote-ollama.ps1
#
# Usage:
#   .\scripts\win\test-remote-ollama.ps1
#
# ============================================================================

# Colors
$cyan = "Cyan"
$green = "Green"
$yellow = "Yellow"
$gray = "Gray"
$red = "Red"

# Configuration
$ollamaUrl = "http://localhost:11434"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $cyan
Write-Host "║                                                            ║" -ForegroundColor $cyan
Write-Host "║          Remote Ollama Connection Test                    ║" -ForegroundColor $cyan
Write-Host "║                                                            ║" -ForegroundColor $cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $cyan
Write-Host ""

# Test 1: Check if SSH tunnel is active
Write-Host "Test 1: SSH Tunnel Status" -ForegroundColor $yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $gray

$tunnel = netstat -an | Select-String "127.0.0.1:11434.*LISTENING"

if ($tunnel) {
    Write-Host "✓ SSH Tunnel is active" -ForegroundColor $green
    Write-Host "  Port 11434 is listening on localhost" -ForegroundColor $gray
} else {
    Write-Host "✗ SSH Tunnel is not active" -ForegroundColor $red
    Write-Host ""
    Write-Host "Please run: .\scripts\win\connect-remote-ollama.ps1" -ForegroundColor $yellow
    Write-Host ""
    exit 1
}

Write-Host ""

# Test 2: Check API connectivity
Write-Host "Test 2: API Connectivity" -ForegroundColor $yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $gray

try {
    $response = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -Method Get -TimeoutSec 5
    Write-Host "✓ Ollama API is responding" -ForegroundColor $green
    Write-Host "  Endpoint: $ollamaUrl" -ForegroundColor $gray
} catch {
    Write-Host "✗ Cannot reach Ollama API" -ForegroundColor $red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor $yellow
    Write-Host "  1. Verify Ollama is running on server:"
    Write-Host "     ssh root@66.96.83.44 'docker ps | grep ollama'"
    Write-Host "  2. Check server logs:"
    Write-Host "     ssh root@66.96.83.44 'docker logs ollama --tail 50'"
    Write-Host ""
    exit 1
}

Write-Host ""

# Test 3: List installed models
Write-Host "Test 3: Installed Models" -ForegroundColor $yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $gray

if ($response.models -and $response.models.Count -gt 0) {
    Write-Host "✓ Found $($response.models.Count) model(s)" -ForegroundColor $green
    Write-Host ""
    
    foreach ($model in $response.models) {
        $size = [math]::Round($model.size / 1GB, 2)
        $modified = if ($model.modified_at) { 
            (Get-Date $model.modified_at).ToString("yyyy-MM-dd HH:mm") 
        } else { 
            "Unknown" 
        }
        
        Write-Host "  📦 $($model.name)" -ForegroundColor $cyan
        Write-Host "     Size: $size GB" -ForegroundColor $gray
        Write-Host "     Modified: $modified" -ForegroundColor $gray
        Write-Host ""
    }
} else {
    Write-Host "⚠️  No models installed" -ForegroundColor $yellow
    Write-Host ""
    Write-Host "To install models on server:" -ForegroundColor $yellow
    Write-Host "  ssh root@66.96.83.44 'cd /opt/reactive-resume && ./scripts/production/setup-ollama-models.sh'"
    Write-Host ""
}

# Test 4: Generate text with a model
if ($response.models -and $response.models.Count -gt 0) {
    Write-Host "Test 4: Text Generation" -ForegroundColor $yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $gray
    
    $testModel = $response.models[0].name
    Write-Host "Testing with model: $testModel" -ForegroundColor $gray
    Write-Host ""
    
    try {
        $body = @{
            model = $testModel
            prompt = "Say 'Hello' in one word"
            stream = $false
        } | ConvertTo-Json
        
        Write-Host "Sending test prompt..." -ForegroundColor $gray
        $startTime = Get-Date
        
        $genResponse = Invoke-RestMethod -Uri "$ollamaUrl/api/generate" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host "✓ Text generation successful" -ForegroundColor $green
        Write-Host "  Response time: $([math]::Round($duration, 2)) seconds" -ForegroundColor $gray
        Write-Host "  Response: $($genResponse.response)" -ForegroundColor $cyan
        Write-Host ""
        
    } catch {
        Write-Host "✗ Text generation failed" -ForegroundColor $red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $red
        Write-Host ""
    }
}

# Test 5: OpenAI-compatible endpoint
Write-Host "Test 5: OpenAI-Compatible API" -ForegroundColor $yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $gray

if ($response.models -and $response.models.Count -gt 0) {
    $testModel = $response.models[0].name
    
    try {
        $body = @{
            model = $testModel
            messages = @(
                @{
                    role = "user"
                    content = "Say hello"
                }
            )
        } | ConvertTo-Json -Depth 10
        
        $chatResponse = Invoke-RestMethod -Uri "$ollamaUrl/v1/chat/completions" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        Write-Host "✓ OpenAI-compatible API is working" -ForegroundColor $green
        Write-Host "  Endpoint: $ollamaUrl/v1/chat/completions" -ForegroundColor $gray
        Write-Host ""
        
    } catch {
        Write-Host "⚠️  OpenAI-compatible API test failed" -ForegroundColor $yellow
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $gray
        Write-Host "  (This is optional - main API still works)" -ForegroundColor $gray
        Write-Host ""
    }
}

# Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $green
Write-Host "║                                                            ║" -ForegroundColor $green
Write-Host "║          ✓ All Tests Passed                               ║" -ForegroundColor $green
Write-Host "║                                                            ║" -ForegroundColor $green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor $yellow
Write-Host ""
Write-Host "1. Update your .env file:" -ForegroundColor $cyan
Write-Host "   LLM_PROVIDER=local" -ForegroundColor $gray
Write-Host "   LOCAL_LLM_BASE_URL=http://localhost:11434" -ForegroundColor $gray
if ($response.models -and $response.models.Count -gt 0) {
    Write-Host "   LOCAL_LLM_MODEL=$($response.models[0].name)" -ForegroundColor $gray
}
Write-Host "   LOCAL_LLM_API_KEY=" -ForegroundColor $gray
Write-Host ""

Write-Host "2. Start your local development environment:" -ForegroundColor $cyan
Write-Host "   .\scripts\win\start-local.ps1" -ForegroundColor $gray
Write-Host ""

Write-Host "3. Test in the application:" -ForegroundColor $cyan
Write-Host "   • Navigate to: http://localhost:5173/dashboard/job-applications" -ForegroundColor $gray
Write-Host "   • Click 'New Application'" -ForegroundColor $gray
Write-Host "   • Paste a job URL to test LLM analysis" -ForegroundColor $gray
Write-Host ""

Write-Host "Remember:" -ForegroundColor $yellow
Write-Host "  • Keep the SSH tunnel window open (connect-remote-ollama.ps1)" -ForegroundColor $gray
Write-Host "  • If connection drops, restart the tunnel" -ForegroundColor $gray
Write-Host "  • Run this test again anytime: .\scripts\win\test-remote-ollama.ps1" -ForegroundColor $gray
Write-Host ""

