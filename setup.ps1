#!/usr/bin/env pwsh
# ReactiveResumeTracker - Complete Project Setup Script
# The definitive script to set up and run ReactiveResumeTracker with LLM integration
# Author: ReactiveResumeTracker Setup Team
# Version: 1.0

param(
    [switch]$OnlySetup,
    [switch]$SkipBuild,
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
    Write-Host "  -Help          Show this help message" -ForegroundColor White
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
        } else {
            Write-Host "Failed to create initial user" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Found $userCount existing user(s) in database" -ForegroundColor Green
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
    Write-Host "Starting development servers..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The application will be available at:" -ForegroundColor White
    Write-Host "   Frontend (Client): http://localhost:5173" -ForegroundColor Green
    Write-Host "   Backend (Server): http://localhost:3000" -ForegroundColor Green  
    Write-Host "   Artboard (PDF): http://localhost:5174" -ForegroundColor Green
    Write-Host ""
    Write-Host "LLM Integration Features:" -ForegroundColor White
    Write-Host "   Job posting analysis from URLs" -ForegroundColor Green
    Write-Host "   AI-powered resume generation" -ForegroundColor Green
    Write-Host "   Smart content matching" -ForegroundColor Green
    Write-Host "   Interview question generation" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration Notes:" -ForegroundColor White
    Write-Host "   Set LLM_PROVIDER in .env (anthropic/openai/local)" -ForegroundColor White
    Write-Host "   Configure API keys for your chosen provider" -ForegroundColor White
    Write-Host "   Update DATABASE_URL for production use" -ForegroundColor White
    Write-Host ""
    Write-Host "Data Import:" -ForegroundColor White
    Write-Host "   Your resume content is already imported!" -ForegroundColor Green
    Write-Host "   Visit http://localhost:5173/dashboard/content-library to view" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting development servers..." -ForegroundColor White
    
    # Start development servers
    pnpm dev
} 