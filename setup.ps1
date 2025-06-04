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
Write-Host "🚀 ReactiveResumeTracker Setup and Launch" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎯 Complete project setup with LLM integration" -ForegroundColor White

# Step 1: Check Dependencies
Write-Host ""
Write-Host "📋 Checking system dependencies..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 22.13.1+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm $pnpmVersion is available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-Host "✅ pnpm $pnpmVersion installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install pnpm. Please install manually: npm install -g pnpm" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Install Dependencies  
Write-Host ""
Write-Host "📋 Installing project dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor White

pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Step 3: Environment Setup
Write-Host ""
Write-Host "📋 Checking environment configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✅ Environment file (.env) exists" -ForegroundColor Green
}
elseif (Test-Path ".env.example") {
    Write-Host "⚠️  No .env file found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  Please configure your .env file with proper values before continuing" -ForegroundColor Yellow
}
else {
    Write-Host "⚠️  No .env file found. Creating basic .env..." -ForegroundColor Yellow
    
    $envLines = @()
    $envLines += "# Basic Configuration"
    $envLines += "NODE_ENV=development"
    $envLines += "PORT=3000"
    $envLines += "PUBLIC_URL=http://localhost:3000"
    $envLines += "CLIENT_URL=http://localhost:5173"
    $envLines += ""
    $envLines += "# Database (configure as needed)"
    $envLines += "DATABASE_URL=`"postgresql://username:password@localhost:5432/reactive_resume`""
    $envLines += ""
    $envLines += "# JWT Secrets (generate your own)"
    $envLines += "ACCESS_TOKEN_SECRET=your-access-token-secret-here"
    $envLines += "REFRESH_TOKEN_SECRET=your-refresh-token-secret-here"
    $envLines += ""
    $envLines += "# LLM Configuration"
    $envLines += "LLM_PROVIDER=anthropic"
    $envLines += "ANTHROPIC_API_KEY=your_claude_api_key_here"
    $envLines += "OPENAI_API_KEY=your_openai_api_key_here"
    $envLines += ""
    $envLines += "# Storage (optional)"
    $envLines += "STORAGE_PROVIDER=local"
    $envLines += "STORAGE_LOCAL_PATH=./uploads"
    $envLines += ""
    $envLines += "# Email (optional)"
    $envLines += "MAIL_FROM_NAME=`"Reactive Resume`""
    $envLines += "MAIL_FROM_EMAIL=noreply@localhost"
    $envLines += ""
    $envLines += "# Disable features that require external services"
    $envLines += "DISABLE_EMAIL_AUTH=true"
    $envLines += "DISABLE_SIGNUPS=false"
    $envLines += ""
    $envLines += "# Chrome/Puppeteer for PDF generation"
    $envLines += "CHROME_TOKEN=your_chrome_token_here"
    $envLines += "CHROME_URL=ws://localhost:3000"
    
    $envLines | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created basic .env file" -ForegroundColor Green
    Write-Host "⚠️  Please update the .env file with your actual configuration values" -ForegroundColor Yellow
}

# Step 4: Database Setup
Write-Host ""
Write-Host "📋 Setting up database schema..." -ForegroundColor Yellow

Write-Host "   Generating Prisma client..." -ForegroundColor White
pnpm prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green

Write-Host "   Running database migrations..." -ForegroundColor White
pnpm prisma:migrate:dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database migration failed. This might be expected if database is not configured yet." -ForegroundColor Yellow
    Write-Host "   You can run migrations later with: pnpm prisma:migrate:dev" -ForegroundColor White
}
else {
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
}

# Step 5: Build Project
if ($SkipBuild) {
    Write-Host ""
    Write-Host "⚠️  Build skipped (-SkipBuild flag used)" -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "📋 Building project..." -ForegroundColor Yellow
    Write-Host "   Building all applications and libraries..." -ForegroundColor White
    
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Project built successfully" -ForegroundColor Green
}

# Step 6: Setup Complete
Write-Host ""
Write-Host "🚀 Setup Complete!" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "✅ ReactiveResumeTracker is ready for development" -ForegroundColor Green

if ($OnlySetup) {
    Write-Host ""
    Write-Host "🚀 Setup complete! To start development servers, run:" -ForegroundColor White
    Write-Host "   pnpm dev" -ForegroundColor Green
    Write-Host ""
    Write-Host "📖 Or run this script without -OnlySetup to start servers automatically" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "📋 Starting development servers..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🌐 The application will be available at:" -ForegroundColor White
    Write-Host "   • Frontend (Client): http://localhost:5173" -ForegroundColor Green
    Write-Host "   • Backend (Server): http://localhost:3000" -ForegroundColor Green  
    Write-Host "   • Artboard (PDF): http://localhost:5174" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 LLM Integration Features:" -ForegroundColor White
    Write-Host "   • Job posting analysis from URLs" -ForegroundColor Green
    Write-Host "   • AI-powered resume generation" -ForegroundColor Green
    Write-Host "   • Smart content matching" -ForegroundColor Green
    Write-Host "   • Interview question generation" -ForegroundColor Green
    Write-Host ""
    Write-Host "🛠️  Configuration Notes:" -ForegroundColor White
    Write-Host "   • Set LLM_PROVIDER in .env (anthropic/openai/local)" -ForegroundColor White
    Write-Host "   • Configure API keys for your chosen provider" -ForegroundColor White
    Write-Host "   • Update DATABASE_URL for production use" -ForegroundColor White
    Write-Host ""
    Write-Host "⏹️  Press Ctrl+C to stop all servers" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Starting development servers..." -ForegroundColor White
    
    # Start development servers
    pnpm dev
} 