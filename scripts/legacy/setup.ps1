#!/usr/bin/env pwsh
# ReactiveResumeTracker - Complete Project Setup Script
# The definitive script to set up and run ReactiveResumeTracker with LLM integration
# Author: ReactiveResumeTracker Setup Team
# Version: 2.0 - Now with Docker PDF Generation Support

param(
    [switch]$OnlySetup,
    [switch]$SkipBuild,
    [switch]$Debug,
    [switch]$Help,
    [switch]$SkipDocker
)

if ($Help) {
    Write-Host ""
    Write-Host "ReactiveResumeTracker Setup Script" -ForegroundColor Cyan
    Write-Host "Usage: .\setup.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -OnlySetup     Only run setup, don't start servers" -ForegroundColor White
    Write-Host "  -SkipBuild     Skip building the project" -ForegroundColor White
    Write-Host "  -Debug         Start backend in debug mode (port 9229)" -ForegroundColor White
    Write-Host "  -SkipDocker    Skip Docker services (Chrome & Minio)" -ForegroundColor White
    Write-Host "  -Help          Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Debug Mode Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup.ps1 -Debug    # Start backend in debug mode" -ForegroundColor White
    Write-Host "  Then attach VS Code debugger to the running process" -ForegroundColor White
    Write-Host ""
    Write-Host "Docker-Free Mode:" -ForegroundColor Yellow
    Write-Host "  .\setup.ps1 -SkipDocker    # Skip Docker services (PDF generation disabled)" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "ReactiveResumeTracker Setup and Launch" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Complete project setup with LLM integration and PDF generation" -ForegroundColor White

# Step 1: Check Dependencies
Write-Host ""
Write-Host "Checking system dependencies..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "Node.js $nodeVersion is installed" -ForegroundColor Green
}
catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

try {
    $pnpmVersion = pnpm --version
    Write-Host "pnpm $pnpmVersion is available" -ForegroundColor Green
}
catch {
    Write-Host "pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-Host "pnpm $pnpmVersion installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to install pnpm. Please install manually: npm install -g pnpm" -ForegroundColor Red
        exit 1
    }
}

# Check Docker if not skipping
$dockerAvailable = $false
if (-not $SkipDocker) {
    try {
        $dockerVersion = docker --version
        Write-Host "Docker is available: $dockerVersion" -ForegroundColor Green
        try {
            $dockerComposeVersion = docker compose version
            Write-Host "Docker Compose is available: $dockerComposeVersion" -ForegroundColor Green
            $dockerAvailable = $true
        }
        catch {
            Write-Host "Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
            Write-Host "You can continue with -SkipDocker flag to disable PDF generation." -ForegroundColor Yellow
            exit 1
        }
    }
    catch {
        Write-Host "Docker is not installed or not running." -ForegroundColor Red
        Write-Host "Docker is required for PDF generation (Chrome & Minio services)." -ForegroundColor Yellow
        Write-Host "Options:" -ForegroundColor White
        Write-Host "  1. Install Docker Desktop and restart this script" -ForegroundColor Green
        Write-Host "  2. Run with -SkipDocker flag to continue without PDF generation" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Docker check skipped (-SkipDocker flag used)" -ForegroundColor Yellow
    Write-Host "PDF generation will not be available" -ForegroundColor Yellow
}

# Step 2: Install Dependencies  
Write-Host ""
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor White

pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencies installed successfully" -ForegroundColor Green

# Step 3: Environment Setup
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "Environment file (.env) exists" -ForegroundColor Green
}
elseif (Test-Path ".env.example") {
    Write-Host "No .env file found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file from template" -ForegroundColor Green
    Write-Host "Please configure your .env file with proper values before continuing" -ForegroundColor Yellow
}
else {
    Write-Host "No .env file found. Creating production-ready .env..." -ForegroundColor Yellow
    
    $chromeConfig = if ($dockerAvailable) {
        @"
# PDF Generation Mode (auto = detect based on NODE_ENV, local = no Docker, docker = requires Docker)
PDF_GENERATION_MODE=docker

# Chrome/Puppeteer for PDF generation (only needed when PDF_GENERATION_MODE=docker)
CHROME_TOKEN=chrome_token
CHROME_URL=ws://localhost:3001
"@
    } else {
        @"
# PDF Generation Mode (auto = detect based on NODE_ENV, local = no Docker, docker = requires Docker)
PDF_GENERATION_MODE=auto

# Chrome/Puppeteer for PDF generation (DISABLED - Docker not available)
# CHROME_TOKEN=chrome_token
# CHROME_URL=ws://localhost:3000
"@
    }
    
    $storageConfig = if ($dockerAvailable) {
        @"
# Storage (Minio via Docker)
STORAGE_ENDPOINT=localhost
STORAGE_PORT=9000
STORAGE_REGION=us-east-1
STORAGE_BUCKET=default
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_USE_SSL=false
STORAGE_SKIP_BUCKET_CHECK=false
"@
    } else {
        @"
# Storage (Local file storage - Docker not available)
STORAGE_ENDPOINT=localhost
STORAGE_PORT=9000
STORAGE_REGION=us-east-1
STORAGE_BUCKET=default
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_USE_SSL=false
STORAGE_SKIP_BUCKET_CHECK=false
"@
    }
    
    $envContent = @"
# =================================================================
# ReactiveResumeTracker - Environment Configuration
# =================================================================
# Generated by setup.ps1 on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# =================================================================
# CRITICAL REQUIRED VARIABLES (Server won't start without these)
# =================================================================

# Basic Configuration
NODE_ENV=development
PORT=3000
PUBLIC_URL=http://localhost:3000
STORAGE_URL=http://localhost:9000/default

# Database (SQLite for development)
DATABASE_URL=file:./apps/server/prisma/dev.db

# Authentication & Security (CHANGE THESE IN PRODUCTION!)
ACCESS_TOKEN_SECRET=dev-access-token-secret-change-in-production-$(Get-Random)
REFRESH_TOKEN_SECRET=dev-refresh-token-secret-change-in-production-$(Get-Random)

$chromeConfig

$storageConfig

# =================================================================
# OPTIONAL VARIABLES (AI Features & Integrations)
# =================================================================

# LLM Integration (Optional but recommended)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (Optional)
MAIL_FROM=noreply@localhost
# SMTP_URL=smtp://user:pass@smtp:587

# Feature Flags (Optional)
DISABLE_SIGNUPS=false
DISABLE_EMAIL_AUTH=false
CHROME_IGNORE_HTTPS_ERRORS=false

# =================================================================
# OAUTH PROVIDERS (Optional)
# =================================================================

# GitHub OAuth (Optional)
# GITHUB_CLIENT_ID=your_github_client_id
# GITHUB_CLIENT_SECRET=your_github_client_secret
# GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Google OAuth (Optional)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# =================================================================
# ADVANCED CONFIGURATION (Usually not needed)
# =================================================================

# Crowdin (Optional)
# CROWDIN_PROJECT_ID=your_project_id
# CROWDIN_PERSONAL_TOKEN=your_crowdin_token

# =================================================================
# SETUP NOTES
# =================================================================
# 1. Update ANTHROPIC_API_KEY and OPENAI_API_KEY for AI features
# 2. Docker services: $(if ($dockerAvailable) { "ENABLED" } else { "DISABLED" })
# 3. PDF Generation: $(if ($dockerAvailable) { "ENABLED" } else { "DISABLED" })
# 4. Database path: apps/server/prisma/dev.db
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host "Created comprehensive .env file" -ForegroundColor Green
    Write-Host "Please update LLM API keys in .env for AI features" -ForegroundColor Yellow
}

# Validate critical environment variables
Write-Host ""
Write-Host "Validating environment configuration..." -ForegroundColor Yellow

$envContent = Get-Content ".env" -Raw
$missingVars = @()

# Check critical variables
$criticalVars = @(
    "NODE_ENV", "PORT", "PUBLIC_URL", "STORAGE_URL", "DATABASE_URL", 
    "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"
)

if ($dockerAvailable) {
    $criticalVars += @("CHROME_TOKEN", "CHROME_URL", "STORAGE_ENDPOINT", "STORAGE_PORT")
}

foreach ($var in $criticalVars) {
    if (-not ($envContent -match "$var=.+")) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "Missing or empty critical environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "  - $var" -ForegroundColor Red
    }
    Write-Host "Please update your .env file before continuing" -ForegroundColor Yellow
} else {
    Write-Host "Environment configuration validated successfully" -ForegroundColor Green
}

# Step 4: Docker Services Setup
if ($dockerAvailable) {
    Write-Host ""
    Write-Host "Setting up Docker services for PDF generation..." -ForegroundColor Yellow
    
    # Check if Docker services are already running
    $runningServices = docker compose -f tools/compose/development.yml ps --services --filter status=running 2>$null
    
    if ($runningServices -contains "chrome" -and $runningServices -contains "minio") {
        Write-Host "Docker services (Chrome & Minio) are already running" -ForegroundColor Green
    } else {
        Write-Host "Starting Docker services (Chrome & Minio)..." -ForegroundColor White
        Write-Host "This may take a few minutes on first run..." -ForegroundColor White
        
        # Start only the required services for development
        docker compose -f tools/compose/development.yml --env-file .env up -d chrome minio
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker services started successfully" -ForegroundColor Green
            Write-Host "  - Chrome (PDF generation): Running on ws://localhost:3001" -ForegroundColor Green
            Write-Host "  - Minio (File storage): Running on http://localhost:9000" -ForegroundColor Green
            Write-Host "  - Minio Console: http://localhost:9001 (admin/admin123)" -ForegroundColor Green
        } else {
            Write-Host "Failed to start Docker services" -ForegroundColor Red
            Write-Host "You can continue without PDF generation or fix Docker and restart" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host ""
    Write-Host "Docker services skipped - PDF generation will not be available" -ForegroundColor Yellow
}

# Step 5: Database Setup
Write-Host ""
Write-Host "Setting up database schema..." -ForegroundColor Yellow

Write-Host "Generating Prisma client..." -ForegroundColor White
pnpm prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "Prisma client generated" -ForegroundColor Green

Write-Host "Syncing database schema..." -ForegroundColor White
pnpm prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to sync database schema" -ForegroundColor Red
    Write-Host "Tip: Make sure your DATABASE_URL is correct in .env" -ForegroundColor Yellow
    exit 1
}
Write-Host "Database schema synced successfully" -ForegroundColor Green

# Step 6: Check for existing users and create initial user if needed
Write-Host ""
Write-Host "Checking for existing users..." -ForegroundColor Yellow

# Create a temporary script to check for users
$checkUsersScript = @"
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
    const prisma = new PrismaClient();
    
    try {
        const userCount = await prisma.user.count();
        console.log(userCount);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    } finally {
        await prisma.`$disconnect();
    }
}

checkUsers();
"@

Set-Content -Path "temp-check-users.js" -Value $checkUsersScript

try {
    $userCount = node temp-check-users.js
    Remove-Item "temp-check-users.js" -Force
    
    $shouldImportContent = $false
    
    if ($userCount -eq "0") {
        Write-Host "No users found in database. Creating initial user..." -ForegroundColor Yellow
        Write-Host ""
        
        # Prompt for user details
        $username = Read-Host "Enter username for the initial user"
        while ([string]::IsNullOrWhiteSpace($username)) {
            Write-Host "Username cannot be empty" -ForegroundColor Red
            $username = Read-Host "Enter username for the initial user"
        }
        
        $email = Read-Host "Enter email for the initial user"
        while ([string]::IsNullOrWhiteSpace($email) -or $email -notmatch "^[^@]+@[^@]+\.[^@]+$") {
            Write-Host "Please enter a valid email address" -ForegroundColor Red
            $email = Read-Host "Enter email for the initial user"
        }
        
        $fullName = Read-Host "Enter full name for the initial user"
        while ([string]::IsNullOrWhiteSpace($fullName)) {
            Write-Host "Full name cannot be empty" -ForegroundColor Red
            $fullName = Read-Host "Enter full name for the initial user"
        }
        
        # Prompt for password securely
        $password = Read-Host "Enter password for the initial user" -AsSecureString
        $passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        while ([string]::IsNullOrWhiteSpace($passwordText) -or $passwordText.Length -lt 6) {
            Write-Host "Password must be at least 6 characters long" -ForegroundColor Red
            $password = Read-Host "Enter password for the initial user" -AsSecureString
            $passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        }
        
        # Create user creation script
        $createUserScript = @"
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUser() {
    const prisma = new PrismaClient();
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('$passwordText', 10);
        
        // Create the user
        const user = await prisma.user.create({
            data: {
                name: '$fullName',
                email: '$email',
                username: '$username',
                provider: 'email',
                emailVerified: true,
                secrets: {
                    create: {
                        password: hashedPassword
                    }
                }
            },
            include: {
                secrets: true
            }
        });
        
        console.log('User created successfully with ID:', user.id);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    } finally {
        await prisma.`$disconnect();
    }
}

createUser();
"@
        
        Set-Content -Path "temp-create-user.js" -Value $createUserScript
        
        # Install bcryptjs if not already installed
        Write-Host "Installing bcryptjs for password hashing..." -ForegroundColor White
        pnpm add bcryptjs
        
        # Run the user creation script
        node temp-create-user.js
        Remove-Item "temp-create-user.js" -Force
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Initial user created successfully!" -ForegroundColor Green
            Write-Host "You can now login with:" -ForegroundColor White
            Write-Host "  Username: $username" -ForegroundColor Green
            Write-Host "  Email: $email" -ForegroundColor Green
            $shouldImportContent = $true
        } else {
            Write-Host "Failed to create initial user" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Found $userCount existing user(s) in database" -ForegroundColor Green
    }
    
    # Import content if we created a new user or if no content exists
    Write-Host ""
    Write-Host "Checking for existing content..." -ForegroundColor Yellow
    
    $checkContentScript = @"
const { PrismaClient } = require('@prisma/client');

async function checkContent() {
    const prisma = new PrismaClient();
    
    try {
        const contentCount = await prisma.content.count();
        console.log(contentCount);
    } catch (error) {
        console.error('Error checking content:', error);
        process.exit(1);
    } finally {
        await prisma.`$disconnect();
    }
}

checkContent();
"@
    
    Set-Content -Path "temp-check-content.js" -Value $checkContentScript
    $contentCount = node temp-check-content.js
    Remove-Item "temp-check-content.js" -Force
    
    if ($shouldImportContent -or $contentCount -eq "0") {
        Write-Host "Importing sample content library..." -ForegroundColor Yellow
        
        # Check if the sample content file exists
        if (Test-Path "extracted_fullstack.json") {
            Write-Host "Found sample content file. Importing..." -ForegroundColor White
            node tools/db-scripts/import-content.js
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Sample content imported successfully!" -ForegroundColor Green
            } else {
                Write-Host "Warning: Content import failed, but continuing..." -ForegroundColor Yellow
            }
        } else {
            Write-Host "No sample content file found (extracted_fullstack.json)" -ForegroundColor Yellow
            Write-Host "You can manually import content later using:" -ForegroundColor White
            Write-Host "  node tools/db-scripts/import-content.js" -ForegroundColor Green
        }
    } else {
        Write-Host "Found $contentCount existing content items" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error checking users: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item "temp-check-users.js" -Force -ErrorAction SilentlyContinue
    exit 1
}

# Step 7: Build Project
if ($SkipBuild) {
    Write-Host ""
    Write-Host "Build skipped (-SkipBuild flag used)" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Building project..." -ForegroundColor Yellow
    Write-Host "Building all applications and libraries..." -ForegroundColor White
    
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "Project built successfully" -ForegroundColor Green
}

# Step 8: Setup Complete
Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "ReactiveResumeTracker is ready for development" -ForegroundColor Green

if ($OnlySetup) {
    Write-Host ""
    Write-Host "Setup complete! To start development servers, run:" -ForegroundColor White
    Write-Host "   pnpm dev" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or run this script without -OnlySetup to start servers automatically" -ForegroundColor White
    Write-Host ""
    Write-Host "To import resume content, run:" -ForegroundColor White
    Write-Host "   node tools/db-scripts/import-content.js" -ForegroundColor Green
    Write-Host ""
    Write-Host "Docker Services Status:" -ForegroundColor Yellow
    if ($dockerAvailable) {
        Write-Host "   Chrome (PDF): ENABLED - ws://localhost:3001" -ForegroundColor Green
        Write-Host "   Minio (Storage): ENABLED - http://localhost:9000" -ForegroundColor Green
        Write-Host "   PDF Generation: FULLY FUNCTIONAL" -ForegroundColor Green
    } else {
        Write-Host "   Docker Services: DISABLED" -ForegroundColor Red
        Write-Host "   PDF Generation: NOT AVAILABLE" -ForegroundColor Red
        Write-Host "   To enable: Install Docker and run setup again" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    if ($Debug) {
        Write-Host "Starting development servers in DEBUG MODE..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[DEBUG] DEBUG MODE ENABLED:" -ForegroundColor Cyan
        Write-Host "   Backend: Starting with debug inspector on port 9229" -ForegroundColor Yellow
        Write-Host "   Frontend: Starting normally on port 5173" -ForegroundColor Green  
        Write-Host "   Artboard: Starting normally on port 5174" -ForegroundColor Green
        Write-Host ""
        Write-Host "[STEPS] DEBUGGING STEPS:" -ForegroundColor Cyan
        Write-Host "   1. Wait for 'Debugger listening on ws://127.0.0.1:9229' message" -ForegroundColor White
        Write-Host "   2. Open VS Code and go to Run and Debug (Ctrl+Shift+D)" -ForegroundColor White
        Write-Host "   3. Select 'Attach to Debug Server' from dropdown" -ForegroundColor White
        Write-Host "   4. Click the green play button or press F5" -ForegroundColor White
        Write-Host "   5. Set breakpoints in your TypeScript code" -ForegroundColor White
        Write-Host ""
        Write-Host "[URLS] APPLICATION URLS:" -ForegroundColor Cyan
        Write-Host "   Frontend (Client): http://localhost:5173" -ForegroundColor Green
        Write-Host "   Backend (Server): http://localhost:3000 [DEBUG MODE]" -ForegroundColor Yellow  
        Write-Host "   Artboard (PDF): http://localhost:5174" -ForegroundColor Green
        Write-Host ""
        
        # Start backend in debug mode and frontend/artboard normally
        Write-Host "Starting backend in debug mode..." -ForegroundColor White
        $serverJob = Start-Job -ScriptBlock { 
            Set-Location $using:PWD
            & pnpm nx serve server --configuration=debug
        }
        
        Start-Sleep -Seconds 3
        
        Write-Host "Starting frontend applications..." -ForegroundColor White
        $clientJob = Start-Job -ScriptBlock { 
            Set-Location $using:PWD
            & pnpm nx serve client 
        }
        $artboardJob = Start-Job -ScriptBlock { 
            Set-Location $using:PWD
            & pnpm nx serve artboard 
        }
        
        Write-Host ""
        Write-Host "[SUCCESS] Debug mode started! Backend is waiting for debugger attachment." -ForegroundColor Green
        Write-Host "   Use VS Code 'Attach to Debug Server' configuration to attach" -ForegroundColor White
        Write-Host ""
        Write-Host "[WARNING] Press Ctrl+C to stop all servers" -ForegroundColor Yellow
        
        # Keep the script running
        try {
            Write-Host "All servers starting in background..." -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
            Write-Host ""
            
            # Monitor jobs and display output
            while ($true) {
                # Check if any jobs have output
                $jobs = @($serverJob, $clientJob, $artboardJob)
                foreach ($job in $jobs) {
                    if ($job.HasMoreData) {
                        Receive-Job $job
                    }
                }
                Start-Sleep -Seconds 1
            }
        }
        catch {
            Write-Host ""
            Write-Host "Stopping servers..." -ForegroundColor Yellow
            
            # Stop all background jobs
            Stop-Job $serverJob -ErrorAction SilentlyContinue
            Stop-Job $clientJob -ErrorAction SilentlyContinue  
            Stop-Job $artboardJob -ErrorAction SilentlyContinue
            
            # Remove jobs
            Remove-Job $serverJob -ErrorAction SilentlyContinue
            Remove-Job $clientJob -ErrorAction SilentlyContinue
            Remove-Job $artboardJob -ErrorAction SilentlyContinue
            
            Write-Host "All servers stopped." -ForegroundColor Green
        }
        
    } else {
    Write-Host "Starting development servers..." -ForegroundColor Yellow
    Write-Host ""
        Write-Host "[URLS] APPLICATION URLS:" -ForegroundColor Cyan
    Write-Host "   Frontend (Client): http://localhost:5173" -ForegroundColor Green
    Write-Host "   Backend (Server): http://localhost:3000" -ForegroundColor Green  
    Write-Host "   Artboard (PDF): http://localhost:5174" -ForegroundColor Green
    Write-Host ""
        Write-Host "[AI] AI/LLM INTEGRATION FEATURES:" -ForegroundColor Cyan
        Write-Host "   [CHECK] Job posting analysis from URLs" -ForegroundColor Green
        Write-Host "   [CHECK] AI-powered resume generation" -ForegroundColor Green
        Write-Host "   [CHECK] Smart content matching" -ForegroundColor Green
        Write-Host "   [CHECK] Interview question generation" -ForegroundColor Green
        Write-Host ""
        Write-Host "[PDF] SMART PDF GENERATION:" -ForegroundColor Cyan
        if ($dockerAvailable) {
            Write-Host "   [AUTO] Development: Local Puppeteer (fast)" -ForegroundColor Green
            Write-Host "   [AUTO] Production: Docker Chrome (scalable)" -ForegroundColor Green
            Write-Host "   [CHECK] Both modes available" -ForegroundColor Green
        } else {
            Write-Host "   [AUTO] Development: Local Puppeteer (fast)" -ForegroundColor Green
            Write-Host "   [WARN] Production: Docker unavailable" -ForegroundColor Yellow
            Write-Host "   [INFO] PDF generation will use local Puppeteer in production" -ForegroundColor White
        }
    Write-Host ""
        Write-Host "[CONTENT] CONTENT LIBRARY:" -ForegroundColor Cyan
    if ($contentCount -gt "0") {
            Write-Host "   [CHECK] $contentCount content items available" -ForegroundColor Green
            Write-Host "   [CHECK] Visit http://localhost:5173/dashboard/content-library to view" -ForegroundColor Green
    } else {
            Write-Host "   [INFO] No content items found" -ForegroundColor Yellow
            Write-Host "   [TIP] Import content using: node tools/db-scripts/import-content.js" -ForegroundColor White
    }
    Write-Host ""
        Write-Host "[CONFIG] CONFIGURATION NOTES:" -ForegroundColor Cyan
    Write-Host "   Database: apps/server/prisma/dev.db" -ForegroundColor White
    Write-Host "   Environment: .env (project root)" -ForegroundColor White
    Write-Host "   LLM Provider: Check .env file for current setting" -ForegroundColor White
    if ($dockerAvailable) {
        Write-Host "   Docker Services: RUNNING (Chrome + Minio)" -ForegroundColor Green
        Write-Host "   PDF Generation: ENABLED" -ForegroundColor Green
    } else {
        Write-Host "   Docker Services: DISABLED" -ForegroundColor Red
        Write-Host "   PDF Generation: NOT AVAILABLE" -ForegroundColor Red
    }
    Write-Host ""
        Write-Host "[START] GETTING STARTED:" -ForegroundColor Cyan
    Write-Host "   1. Wait for all servers to start" -ForegroundColor White
    Write-Host "   2. Open http://localhost:5173 in your browser" -ForegroundColor White
    Write-Host "   3. Login with your credentials" -ForegroundColor White
    Write-Host "   4. Create a new resume or explore the content library" -ForegroundColor White
    Write-Host ""
        Write-Host "[IMPORTANT] IMPORTANT:" -ForegroundColor Yellow
    Write-Host "   • Press Ctrl+C to stop all servers" -ForegroundColor White
    Write-Host "   • All data is saved locally in the SQLite database" -ForegroundColor White
    Write-Host "   • Configure LLM API keys in .env for AI features" -ForegroundColor White
    Write-Host ""
    Write-Host "Starting all development servers..." -ForegroundColor White
    Write-Host "This will start:" -ForegroundColor White
    Write-Host "  • Client (React frontend)" -ForegroundColor Green
    Write-Host "  • Server (NestJS backend)" -ForegroundColor Green
    Write-Host "  • Artboard (PDF generation)" -ForegroundColor Green
    Write-Host ""
    
    # Start development servers
    pnpm dev
    }
}
