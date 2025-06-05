Write-Host "Adding Sample Content..." -ForegroundColor Cyan

# Simple work experience
$workExperience = @{
    title = "Senior Software Engineer"
    description = "Led development of web applications"
    content = @{
        responsibilities = @("Developed React apps", "Led team of 5")
    }
    type = "WORK_EXPERIENCE"
    company = "Tech Company"
    position = "Senior Engineer"
    skills = @("React", "Node.js", "TypeScript")
    achievements = @("Led team", "Improved performance")
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $workExperience -ContentType "application/json" -UseBasicParsing
    Write-Host "Work Experience added!" -ForegroundColor Green
    
    # Add a project
    $project = @{
        title = "E-commerce App"
        description = "Built an online store"
        content = @{
            features = @("Shopping cart", "Payment processing")
        }
        type = "PROJECT"
        skills = @("React", "Node.js")
        achievements = @("Handles 1000+ users")
    } | ConvertTo-Json -Depth 3
    
    $response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $project -ContentType "application/json" -UseBasicParsing
    Write-Host "Project added!" -ForegroundColor Green
    
    # Add skills
    $skills = @("JavaScript", "TypeScript", "React", "Node.js")
    foreach ($skill in $skills) {
        $skillData = @{
            title = $skill
            description = "Proficient in $skill"
            content = @{
                proficiencyLevel = "Advanced"
            }
            type = "TECHNICAL_SKILL"
            skills = @($skill)
            achievements = @("5+ years experience")
        } | ConvertTo-Json -Depth 3
        
        $response3 = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $skillData -ContentType "application/json" -UseBasicParsing
        Write-Host "Added skill: $skill" -ForegroundColor Yellow
    }
    
    Write-Host "`nContent added successfully!" -ForegroundColor Green
    Write-Host "Visit: http://localhost:5173/dashboard/content-library" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} 