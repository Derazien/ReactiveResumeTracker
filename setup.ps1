#!/usr/bin/env pwsh
# ReactiveResumeTracker - Complete Project Setup Script
# The definitive script to set up and run ReactiveResumeTracker with LLM integration
# Author: ReactiveResumeTracker Setup Team
# Version: 1.0

param(
    [switch]$OnlySetup,
    [switch]$SkipBuild,
    [switch]$Debug,
    [switch]$Help
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
    Write-Host "  -Help          Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Debug Mode Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup.ps1 -Debug    # Start backend in debug mode" -ForegroundColor White
    Write-Host "  Then attach VS Code debugger to the running process" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "ReactiveResumeTracker Setup and Launch" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Complete project setup with LLM integration" -ForegroundColor White

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
    Write-Host "No .env file found. Creating basic .env..." -ForegroundColor Yellow
    
    $envContent = @"
# Basic Configuration
NODE_ENV=development
PORT=3000
PUBLIC_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

# Database - SQLite for development
DATABASE_URL="file:./dev.db"

# JWT Secrets - generate your own for production
ACCESS_TOKEN_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here

# LLM Configuration - optional
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Storage - optional
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads

# Email - optional
MAIL_FROM_NAME="Reactive Resume"
MAIL_FROM_EMAIL=noreply@localhost

# Disable features that require external services
DISABLE_EMAIL_AUTH=true
DISABLE_SIGNUPS=false

# Chrome/Puppeteer for PDF generation
CHROME_TOKEN=your_chrome_token_here
CHROME_URL=ws://localhost:3000
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host "Created basic .env file" -ForegroundColor Green
    Write-Host "Please update the .env file with your actual configuration values" -ForegroundColor Yellow
}

# Step 4: Database Setup
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

# Step 5: Check for existing users and create initial user if needed
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

# Step 6: Build Project
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

# Step 7: Setup Complete
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
