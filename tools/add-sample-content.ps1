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
    }
    type = "WORK_EXPERIENCE"
    company = "Tech Company Inc"
    position = "Senior Software Engineer" 
    startDate = "2022-01-01T00:00:00Z"
    endDate = "2024-12-01T00:00:00Z"
    location = "San Francisco, CA"
    skills = @("Node.js", "TypeScript", "React", "Leadership", "Microservices")
    achievements = @(
        "Led team of 5 developers",
        "40% performance improvement", 
        "50% reduction in bugs"
    )
    tagIds = @()  # We'll add tags after creation
} | ConvertTo-Json -Depth 4

try {
    Write-Host "Adding work experience..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $workExperience -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Work Experience added successfully!" -ForegroundColor Green
    $workResult = $response.Content | ConvertFrom-Json
    $workId = $workResult.id
    Write-Host "Work Experience ID: $workId" -ForegroundColor White
    
    # Add some tags for this content
    Write-Host "`nCreating tags..." -ForegroundColor Yellow
    
    $tags = @("backend", "leadership", "nodejs", "typescript", "senior-level")
    $tagIds = @()
    
    foreach ($tagName in $tags) {
        $tag = @{
            name = $tagName
            color = "#3B82F6"
        } | ConvertTo-Json
        
        try {
            $tagResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/tags" -Method POST -Body $tag -ContentType "application/json" -UseBasicParsing
            $tagResult = $tagResponse.Content | ConvertFrom-Json
            $tagIds += $tagResult.id
            Write-Host "  ✅ Tag '$tagName' created with ID: $($tagResult.id)" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Tag '$tagName' might already exist" -ForegroundColor Yellow
        }
    }
    
    # Now let's add a project
    Write-Host "`nAdding sample project..." -ForegroundColor Yellow
    $project = @{
        title = "E-commerce Platform"
        description = "Built a scalable e-commerce platform from scratch"
        content = @{
            description = "Developed a full-stack e-commerce solution with React frontend and Node.js backend"
            features = @(
                "User authentication and authorization",
                "Product catalog with search and filtering",
                "Shopping cart and checkout process",
                "Payment integration with Stripe",
                "Admin dashboard for inventory management"
            )
            technologies = @("React", "Node.js", "Express", "MongoDB", "Stripe API", "JWT")
            metrics = @(
                "Handled 10,000+ concurrent users",
                "99.9% uptime",
                "Page load times under 2 seconds"
            )
        }
        type = "PROJECT"
        startDate = "2023-03-01T00:00:00Z"
        endDate = "2023-08-01T00:00:00Z"
        skills = @("React", "Node.js", "MongoDB", "Stripe", "E-commerce")
        achievements = @(
            "Built from scratch in 5 months",
            "Handles 10K+ concurrent users",
            "99.9% uptime maintained"
        )
        tagIds = @()
    } | ConvertTo-Json -Depth 4
    
    $projectResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $project -ContentType "application/json" -UseBasicParsing
    $projectResult = $projectResponse.Content | ConvertFrom-Json
    Write-Host "✅ Project added successfully! ID: $($projectResult.id)" -ForegroundColor Green
    
    # Add technical skills
    Write-Host "`nAdding technical skills..." -ForegroundColor Yellow
    $skills = @("JavaScript", "TypeScript", "Python", "React", "Node.js", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes")
    
    foreach ($skill in $skills) {
        $skillContent = @{
            title = $skill
            description = "Proficient in $skill"
            content = @{
                proficiencyLevel = "Advanced"
                yearsOfExperience = 5
                projects = @("E-commerce Platform", "Microservices Architecture")
            }
            type = "TECHNICAL_SKILL"
            skills = @($skill)
            achievements = @("5+ years experience", "Used in production systems")
            tagIds = @()
        } | ConvertTo-Json -Depth 4
        
        try {
            $skillResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $skillContent -ContentType "application/json" -UseBasicParsing
            $skillResult = $skillResponse.Content | ConvertFrom-Json
            Write-Host "  ✅ Skill '$skill' added with ID: $($skillResult.id)" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Error adding skill '$skill'" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n🎉 Sample content library created successfully!" -ForegroundColor Green
    Write-Host "✅ Work Experience: 1 item" -ForegroundColor White
    Write-Host "✅ Project: 1 item" -ForegroundColor White
    Write-Host "✅ Technical Skills: $($skills.Count) items" -ForegroundColor White
    Write-Host "✅ Tags: $($tags.Count) items" -ForegroundColor White
    
    Write-Host "`n📖 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. View your content: GET http://localhost:3000/api/content-library" -ForegroundColor White
    Write-Host "2. Test job analysis: Run tools/test-job-analysis.ps1" -ForegroundColor White
    Write-Host "3. Open frontend: http://localhost:5173/dashboard/content-library" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error adding content: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
} 