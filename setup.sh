#!/bin/bash

# ReactiveResumeTracker - Complete Project Setup & Launch Script
# The definitive script to set up and run ReactiveResumeTracker with LLM integration
# Author: ReactiveResumeTracker Setup Team
# Version: 1.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
ONLY_SETUP=false
SKIP_BUILD=false
HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --only-setup)
            ONLY_SETUP=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            HELP=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [ "$HELP" = true ]; then
    echo ""
    echo -e "${CYAN}ReactiveResumeTracker Setup Script${NC}"
    echo -e "${WHITE}Usage: ./setup.sh [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo -e "${WHITE}  --only-setup     Only run setup, don't start servers${NC}"
    echo -e "${WHITE}  --skip-build     Skip building the project${NC}"
    echo -e "${WHITE}  -h, --help       Show this help message${NC}"
    echo ""
    exit 0
fi

# Helper functions
print_header() {
    echo ""
    echo -e "${CYAN}🚀 $1${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 $((${#1} + 3))))${NC}"
}

print_step() {
    echo ""
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${WHITE}   $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        local required_version="22.13.1"
        
        # Simple version comparison
        if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Error handler
error_exit() {
    print_error "Setup failed: $1"
    echo ""
    echo -e "${YELLOW}🔍 Common solutions:${NC}"
    echo -e "${WHITE}   • Ensure Node.js 22.13.1+ is installed${NC}"
    echo -e "${WHITE}   • Check your internet connection for package downloads${NC}"
    echo -e "${WHITE}   • Configure your .env file with proper database settings${NC}"
    echo -e "${WHITE}   • Run with --help for usage information${NC}"
    exit 1
}

# Main script
main() {
    print_header "ReactiveResumeTracker Setup and Launch"
    echo -e "${WHITE}🎯 Complete project setup with LLM integration${NC}"

    # Step 1: Check Dependencies
    print_step "Checking system dependencies..."
    
    # Check Node.js
    if ! command_exists node; then
        error_exit "Node.js is not installed. Please install Node.js 22.13.1+ from https://nodejs.org/"
    fi
    
    if ! check_node_version; then
        print_warning "Node.js version might be outdated. Recommended: 22.13.1+"
        local node_version=$(node --version)
        print_info "Current version: $node_version"
    else
        local node_version=$(node --version)
        print_success "Node.js $node_version is installed"
    fi

    # Check pnpm
    if ! command_exists pnpm; then
        print_warning "pnpm not found. Installing pnpm..."
        npm install -g pnpm || error_exit "Failed to install pnpm. Please install manually: npm install -g pnpm"
    fi
    
    local pnpm_version=$(pnpm --version)
    print_success "pnpm $pnpm_version is available"

    # Step 2: Install Dependencies
    print_step "Installing project dependencies..."
    print_info "This may take a few minutes..."
    
    pnpm install || error_exit "Failed to install dependencies"
    print_success "Dependencies installed successfully"

    # Step 3: Environment Setup
    print_step "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning "No .env file found. Copying from .env.example..."
            cp ".env.example" ".env"
            print_success "Created .env file from template"
            print_warning "Please configure your .env file with proper values before continuing"
        else
            print_warning "No .env file found. Creating basic .env..."
            cat > .env << 'EOF'
# Basic Configuration
NODE_ENV=development
PORT=3000
PUBLIC_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

# Database (configure as needed)
DATABASE_URL="postgresql://username:password@localhost:5432/reactive_resume"

# JWT Secrets (generate your own)
ACCESS_TOKEN_SECRET=your-access-token-secret-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# LLM Configuration
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Storage (optional)
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads

# Email (optional)
MAIL_FROM_NAME="Reactive Resume"
MAIL_FROM_EMAIL=noreply@localhost

# Disable features that require external services
DISABLE_EMAIL_AUTH=true
DISABLE_SIGNUPS=false

# Chrome/Puppeteer for PDF generation
CHROME_TOKEN=your_chrome_token_here
CHROME_URL=ws://localhost:3000
EOF
            print_success "Created basic .env file"
            print_warning "Please update the .env file with your actual configuration values"
        fi
    else
        print_success "Environment file (.env) exists"
    fi

    # Step 4: Database Setup
    print_step "Setting up database schema..."
    
    print_info "Generating Prisma client..."
    pnpm prisma:generate || error_exit "Failed to generate Prisma client"
    print_success "Prisma client generated"

    print_info "Running database migrations..."
    if ! pnpm prisma:migrate:dev; then
        print_warning "Database migration failed. This might be expected if database is not configured yet."
        print_info "You can run migrations later with: pnpm prisma:migrate:dev"
    else
        print_success "Database migrations completed"
    fi

    # Step 5: Build Project (if not skipped)
    if [ "$SKIP_BUILD" = false ]; then
        print_step "Building project..."
        print_info "Building all applications and libraries..."
        
        pnpm build || error_exit "Build failed"
        print_success "Project built successfully"
    else
        print_warning "Build skipped (--skip-build flag used)"
    fi

    # Step 6: Setup Complete
    print_header "Setup Complete!"
    print_success "ReactiveResumeTracker is ready for development"
    
    if [ "$ONLY_SETUP" = false ]; then
        print_step "Starting development servers..."
        echo ""
        echo -e "${WHITE}🌐 The application will be available at:${NC}"
        echo -e "${GREEN}   • Frontend (Client): http://localhost:5173${NC}"
        echo -e "${GREEN}   • Backend (Server): http://localhost:3000${NC}"
        echo -e "${GREEN}   • Artboard (PDF): http://localhost:5174${NC}"
        echo ""
        echo -e "${WHITE}📚 LLM Integration Features:${NC}"
        echo -e "${GREEN}   • Job posting analysis from URLs${NC}"
        echo -e "${GREEN}   • AI-powered resume generation${NC}"
        echo -e "${GREEN}   • Smart content matching${NC}"
        echo -e "${GREEN}   • Interview question generation${NC}"
        echo ""
        echo -e "${WHITE}🛠️  Configuration Notes:${NC}"
        echo -e "${WHITE}   • Set LLM_PROVIDER in .env (anthropic/openai/local)${NC}"
        echo -e "${WHITE}   • Configure API keys for your chosen provider${NC}"
        echo -e "${WHITE}   • Update DATABASE_URL for production use${NC}"
        echo ""
        echo -e "${YELLOW}⏹️  Press Ctrl+C to stop all servers${NC}"
        echo ""
        print_info "Starting development servers..."
        
        # Start development servers
        pnpm dev
    else
        echo ""
        echo -e "${WHITE}🚀 Setup complete! To start development servers, run:${NC}"
        echo -e "${GREEN}   pnpm dev${NC}"
        echo ""
        echo -e "${WHITE}📖 Or run this script without --only-setup to start servers automatically${NC}"
    fi
}

# Trap errors and interrupts
trap 'error_exit "Script interrupted"' INT TERM

# Run main function
main "$@" 