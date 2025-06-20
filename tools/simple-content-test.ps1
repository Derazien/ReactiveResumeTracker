Write-Host "Testing Content Library..." -ForegroundColor Cyan

# Simple work experience
$workExperience = @{
    title = "Senior Software Engineer"
    description = "Led development of high-performance web applications"
    content = @{
        responsibilities = @(
            "Developed microservices using Node.js",
            "Led team of 5 developers"
        )
    }
    type = "WORK_EXPERIENCE"
    company = "Tech Company Inc"
    position = "Senior Software Engineer"
    skills = @("Node.js", "TypeScript", "React")
    achievements = @("Led team", "Improved performance")
} | ConvertTo-Json -Depth 3

try {
    Write-Host "Adding work experience..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $workExperience -ContentType "application/json" -UseBasicParsing
    Write-Host "Success! Status Code: $($response.StatusCode)" -ForegroundColor Green
    $result = $response.Content | ConvertFrom-Json
    Write-Host "Content ID: $($result.id)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} 