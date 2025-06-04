Write-Host "Testing Job Analysis Feature..." -ForegroundColor Cyan

# Sample job posting text
$sampleJobPosting = @"
Senior Full Stack Developer - TechCorp Inc.

Location: Remote / San Francisco, CA
Salary: $120,000 - $160,000

About the Company:
TechCorp Inc. is a leading fintech company revolutionizing digital payments. We serve over 10 million users globally and are backed by top-tier VCs.

Role Description:
We're seeking a Senior Full Stack Developer to join our engineering team. You'll be responsible for building scalable web applications, working with cross-functional teams, and mentoring junior developers.

Requirements:
- 5+ years of experience in full-stack development
- Proficiency in React, Node.js, and TypeScript
- Experience with PostgreSQL and Redis
- Knowledge of AWS or similar cloud platforms
- Experience with microservices architecture
- Strong communication and leadership skills
- Bachelor's degree in Computer Science or related field

Nice to Have:
- Experience in fintech or payments industry
- Knowledge of Kubernetes and Docker
- Experience with GraphQL
- Previous team lead experience

What We Offer:
- Competitive salary and equity
- Remote-first culture
- Health, dental, and vision insurance
- $2,000 annual learning budget
"@

$jobAnalysisRequest = @{
    jobText = $sampleJobPosting
    url = "https://example.com/job/senior-fullstack-developer"
} | ConvertTo-Json

try {
    Write-Host "Analyzing job posting..." -ForegroundColor Yellow
    Write-Host "Job text preview: $($sampleJobPosting.Substring(0, 100))..." -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/job-applications/analyze-from-text" -Method POST -Body $jobAnalysisRequest -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
    
    Write-Host "✅ Job analysis completed!" -ForegroundColor Green
    $analysisResult = $response.Content | ConvertFrom-Json
    
    Write-Host "`n📊 Analysis Results:" -ForegroundColor Cyan
    Write-Host "Job Title: $($analysisResult.title)" -ForegroundColor White
    Write-Host "Company: $($analysisResult.company)" -ForegroundColor White
    Write-Host "Status: $($analysisResult.status)" -ForegroundColor White
    
    if ($analysisResult.requirements) {
        $requirements = $analysisResult.requirements | ConvertFrom-Json
        Write-Host "`n📋 Extracted Requirements:" -ForegroundColor Yellow
        foreach ($req in $requirements) {
            Write-Host "  • $req" -ForegroundColor White
        }
    }
    
    if ($analysisResult.extractedTags) {
        $tags = $analysisResult.extractedTags | ConvertFrom-Json
        Write-Host "`n🏷️  Extracted Tags:" -ForegroundColor Yellow
        foreach ($tag in $tags) {
            Write-Host "  • $tag" -ForegroundColor White
        }
    }
    
    Write-Host "`n🎯 Job Application Created!" -ForegroundColor Green
    Write-Host "Application ID: $($analysisResult.id)" -ForegroundColor White
    
    Write-Host "`n✨ Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Add your content to the library using the content script" -ForegroundColor White
    Write-Host "2. Generate a tailored resume for this job application" -ForegroundColor White
    Write-Host "3. Generate a personalized cover letter" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error analyzing job: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    
    Write-Host "`n💡 Note: This feature requires LLM configuration (OpenAI, Anthropic, etc.)" -ForegroundColor Yellow
    Write-Host "For now, you can manually create job applications and we'll set up LLM later." -ForegroundColor Yellow
} 