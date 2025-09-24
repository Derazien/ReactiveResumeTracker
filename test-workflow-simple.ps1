# Simple Skyvern Workflow Creation Test
Write-Output "Testing Skyvern Workflow Creation"
Write-Output "================================="

$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDMwMDc5NDAsInN1YiI6Im9fNDM5NTk3MDE1ODQ1NDI5MTUwIn0.DxeP6hIUAyFwPablP34hMtx7I9eeFVNjuc2A6nTy7sk"
$baseUrl = "http://localhost:8000"

# Workflow Definition using official Skyvern API format
$workflow = @{
    json_definition = @{
        title = "Berlin Mobile Developer Test"
        description = "Test workflow for mobile developer job search"
        proxy_location = "RESIDENTIAL"
        persist_browser_session = $true
        workflow_definition = @{
            parameters = @(
                @{
                    key = "job_keywords"
                    description = "Job search keywords"
                    parameter_type = "workflow"
                    workflow_parameter_type = "string"
                    default_value = "Mobile Developer"
                },
                @{
                    key = "location"
                    description = "Job location"
                    parameter_type = "workflow"
                    workflow_parameter_type = "string"
                    default_value = "Berlin"
                },
                @{
                    key = "linkedin_username"
                    description = "LinkedIn username"
                    parameter_type = "workflow"
                    workflow_parameter_type = "string"
                    default_value = "raedzein.rz@gmail.com"
                },
                @{
                    key = "linkedin_password"
                    description = "LinkedIn password"
                    parameter_type = "workflow"
                    workflow_parameter_type = "string"
                    default_value = "123456Rz!"
                }
            )
            blocks = @(
                @{
                    label = "linkedin_job_search"
                    block_type = "navigation"
                    url = "https://www.linkedin.com/jobs/search"
                    title = "LinkedIn Job Search"
                    engine = "skyvern-1.0"
                    continue_on_failure = $true
                    max_retries = 3
                    navigation_goal = "Navigate to LinkedIn jobs. If login required, use credentials linkedin_username and linkedin_password. Search for job_keywords in location. Ensure search results are loaded."
                    parameter_keys = @()
                    cache_actions = $false
                }
            )
        }
    }
}

try {
    Write-Output "Creating workflow..."
    
    $json = $workflow | ConvertTo-Json -Depth 10
    $headers = @{"x-api-key" = $apiKey}
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/workflows" -Method Post -Body $json -ContentType "application/json" -Headers $headers
    
    Write-Output "SUCCESS!"
    Write-Output "Workflow ID: $($response.workflow_id)"
    Write-Output "Permanent ID: $($response.workflow_permanent_id)"
    Write-Output "Title: $($response.title)"
    Write-Output "Organization: $($response.organization_id)"
    
    Write-Output ""
    Write-Output "Monitor at: http://localhost:8081"
    Write-Output "Test completed successfully!"
    
} catch {
    Write-Output "FAILED: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Output "Error details: $errorBody"
    }
}




















