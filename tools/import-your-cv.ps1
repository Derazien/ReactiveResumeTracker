Write-Host "Import Your CV Content to ReactiveResume..." -ForegroundColor Cyan
Write-Host "Edit this script with your actual experience and run it!" -ForegroundColor Yellow

# ===== YOUR WORK EXPERIENCES =====
$experiences = @(
    @{
        title = "YOUR JOB TITLE"
        description = "Brief description of your role"
        content = @{
            responsibilities = @(
                "Key responsibility 1",
                "Key responsibility 2", 
                "Key responsibility 3"
            )
            technologies = @("Tech1", "Tech2", "Tech3")
            achievements = @(
                "Quantified achievement 1",
                "Quantified achievement 2"
            )
        }
        type = "WORK_EXPERIENCE"
        company = "COMPANY NAME"
        position = "YOUR POSITION"
        startDate = "2023-01-01T00:00:00Z"  # UPDATE DATE
        endDate = "2024-01-01T00:00:00Z"    # UPDATE DATE (or null for current)
        location = "CITY, STATE/COUNTRY"
        skills = @("Skill1", "Skill2", "Skill3")
        achievements = @("Achievement 1", "Achievement 2")
        tagIds = @()  # We'll create tags separately
    }
    # Add more experiences here...
)

# ===== YOUR PROJECTS =====
$projects = @(
    @{
        title = "PROJECT NAME"
        description = "Brief project description"
        content = @{
            description = "Detailed project description"
            features = @(
                "Feature 1",
                "Feature 2"
            )
            technologies = @("Tech1", "Tech2")
            metrics = @(
                "Performance metric",
                "Usage metric"
            )
        }
        type = "PROJECT"
        startDate = "2023-01-01T00:00:00Z"
        endDate = "2023-06-01T00:00:00Z"
        skills = @("Skill1", "Skill2")
        achievements = @("Achievement 1", "Achievement 2")
        tagIds = @()
    }
    # Add more projects...
)

# ===== YOUR SKILLS =====
$technicalSkills = @("JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker")

Write-Host "Adding your work experiences..." -ForegroundColor Yellow
foreach ($exp in $experiences) {
    $json = $exp | ConvertTo-Json -Depth 4
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "✅ Added: $($exp.title) at $($exp.company) - ID: $($result.id)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to add: $($exp.title)" -ForegroundColor Red
    }
}

Write-Host "`nAdding your projects..." -ForegroundColor Yellow
foreach ($project in $projects) {
    $json = $project | ConvertTo-Json -Depth 4
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $json -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "✅ Added project: $($project.title) - ID: $($result.id)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to add project: $($project.title)" -ForegroundColor Red
    }
}

Write-Host "`nAdding your technical skills..." -ForegroundColor Yellow
foreach ($skill in $technicalSkills) {
    $skillContent = @{
        title = $skill
        description = "Proficient in $skill"
        content = @{
            proficiencyLevel = "Advanced"  # UPDATE: Beginner/Intermediate/Advanced/Expert
            yearsOfExperience = 3          # UPDATE: Your actual years
            projects = @("Project where you used this")
        }
        type = "TECHNICAL_SKILL"
        skills = @($skill)
        achievements = @("Years of experience", "Projects completed")
        tagIds = @()
    } | ConvertTo-Json -Depth 4
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/content-library" -Method POST -Body $skillContent -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "  ✅ Added skill: $skill - ID: $($result.id)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to add skill: $skill" -ForegroundColor Red
    }
}

Write-Host "`n🎉 CV Import Complete!" -ForegroundColor Green
Write-Host "Next: Test job analysis with a real job posting!" -ForegroundColor Cyan 