Write-Host "Testing Job Applications API..." -ForegroundColor Cyan

try {
    # Test GET /api/job-applications
    Write-Host "Testing GET /api/job-applications..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/job-applications" -Method GET -UseBasicParsing
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
    
    Write-Host "`nTesting POST /api/job-applications..." -ForegroundColor Yellow
    $body = @{
        title = "Software Engineer"
        company = "Test Company"
        status = "APPLIED"
        description = "Test job description"
    } | ConvertTo-Json
    
    $postResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/job-applications" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Status Code: $($postResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($postResponse.Content)" -ForegroundColor White
    
    Write-Host "`nAPI test completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "Error testing API: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
} 