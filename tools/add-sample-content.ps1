Write-Host "Adding Sample Content to Content Library..." -ForegroundColor Cyan

# Sample Work Experience
$workExperience = @{
    title = "Senior Software Engineer"
    description = "Led development of high-performance web applications"
    content = @{
        responsibilities = @(
            "Architected and developed scalable microservices using Node.js and TypeScript",
            "Led a team of 5 developers in agile development practices",
            "Implemented CI/CD pipelines reducing deployment time by 60%",
            "Mentored junior developers and conducted code reviews"
        )
        technologies = @("Node.js", "TypeScript", "React", "PostgreSQL", "Docker", "AWS")
        achievements = @(
            "Increased application performance by 40% through optimization",
            "Reduced bug reports by 50% through improved testing practices",
            "Successfully delivered 15+ features ahead of schedule"
        )
    } | ConvertTo-Json -Depth 3
    type = "WORK_EXPERIENCE"
    company = "Tech Company Inc"
    position = "Senior Software Engineer" 
    startDate = "2022-01-01T00:00:00Z"
    endDate = "2024-12-01T00:00:00Z"
    location = "San Francisco, CA"
    skills = @("Node.js", "TypeScript", "React", "Leadership", "Microservices") | ConvertTo-Json
    achievements = @(
        "Led team of 5 developers",
        "40% performance improvement", 
        "50% reduction in bugs"
    ) | ConvertTo-Json
} | ConvertTo-Json

try {
    Write-Host "Adding work experience..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $workExperience -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Work Experience added successfully!" -ForegroundColor Green
    $workId = ($response.Content | ConvertFrom-Json).id
    Write-Host "Work Experience ID: $workId" -ForegroundColor White
    
    # Add some tags for this content
    Write-Host "Adding tags..." -ForegroundColor Yellow
    
    $tags = @("backend", "leadership", "nodejs", "typescript", "senior-level")
    foreach ($tagName in $tags) {
        $tag = @{
            name = $tagName
            color = "#3B82F6"
        } | ConvertTo-Json
        
        try {
            $tagResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/tags" -Method POST -Body $tag -ContentType "application/json" -UseBasicParsing
            $tagId = ($tagResponse.Content | ConvertFrom-Json).id
            Write-Host "  ✅ Tag '$tagName' created with ID: $tagId" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Tag '$tagName' might already exist" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n🎉 Sample content added successfully!" -ForegroundColor Green
    Write-Host "Next: Add your own content using this structure" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error adding content: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
} 