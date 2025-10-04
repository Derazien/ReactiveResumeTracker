#!/usr/bin/env bash
set -e

# ============================================================================
# Reactive Resume - Development Server Deployment (CANONICAL)
# ============================================================================
# 
# This script handles development server deployment with PM2:
# 1. Stops existing PM2 processes
# 2. Cleans up Docker containers and ports
# 3. Pulls latest code and installs dependencies
# 4. Generates Prisma client (no build needed for dev mode)
# 5. Runs database migrations
# 6. Starts services with PM2 in DEVELOPMENT mode (pnpm dev)
# 7. Verifies health
#
# Environment: Production Linux server (Development mode)
# PM2 Process Name: reactive_resume_dev (runs both server and client together)
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Configuration
PM2_DEV_NAME="${PM2_DEV_NAME:-reactive_resume_dev}"
SERVER_PORT="${SERVER_PORT:-3000}"
CLIENT_PORT="${CLIENT_PORT:-5173}"
COMPOSE_FILE="unified-docker-compose.yml"

# Parse arguments
SKIP_DOCKER=false
CLEAN_INSTALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --clean)
            CLEAN_INSTALL=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 Reactive Resume - Development Server Deployment${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check Node version compatibility
NODE_VERSION=$(node --version | cut -d'v' -f2)
echo -e "${GRAY}Node version: v$NODE_VERSION${NC}"

if [[ "$(printf '%s\n' "22.13.1" "$NODE_VERSION" | sort -V | head -n1)" != "22.13.1" ]]; then
    echo -e "${YELLOW}⚠ WARNING: Node version v$NODE_VERSION is below recommended v22.13.1${NC}"
    echo -e "${YELLOW}  This may cause Prisma client generation issues${NC}"
    echo -e "${GRAY}  Update with: curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
    echo ""
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "   ${GRAY}Checking port $port...${NC}"
    
    if check_port $port; then
        echo -e "      ${YELLOW}Port $port in use - stopping...${NC}"
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            kill -9 $pids 2>/dev/null || true
            echo -e "      ${GREEN}Stopped processes on port $port${NC}"
        fi
    else
        echo -e "      ${GREEN}Port $port is free${NC}"
    fi
}

# Step 1: Stop PM2 processes
echo -e "${YELLOW}📦 Step 1: Stopping PM2 processes...${NC}"
echo ""

if command -v pm2 &> /dev/null; then
    echo -e "   ${GRAY}Stopping ALL PM2 processes...${NC}"
    pm2 stop all 2>/dev/null || echo -e "      ${GRAY}(no processes running)${NC}"
    
    echo -e "   ${GRAY}Deleting ALL PM2 processes...${NC}"
    pm2 delete all 2>/dev/null || true
    
    echo -e "   ${GRAY}Clearing PM2 cache...${NC}"
    pm2 kill 2>/dev/null || true
    
    echo -e "   ${GREEN}✓ All PM2 processes cleared${NC}"
else
    echo -e "   ${YELLOW}⚠ PM2 not installed - skipping${NC}"
fi
echo ""

# Step 2: Clean up ports
echo -e "${YELLOW}🧹 Step 2: Cleaning up ports...${NC}"
echo ""

kill_port $SERVER_PORT
kill_port $CLIENT_PORT

echo ""
echo -e "   ${GREEN}✓ Ports cleaned${NC}"
echo ""

# Step 3: Stop Docker containers (if not skipped)
if [ "$SKIP_DOCKER" = false ]; then
    echo -e "${YELLOW}🐳 Step 3: Managing Docker services...${NC}"
    echo ""
    
    echo -e "   ${GRAY}Stopping existing containers...${NC}"
    docker compose -f $COMPOSE_FILE down 2>/dev/null || true
    
    echo -e "   ${GRAY}Removing any remaining containers with same names...${NC}"
    docker stop reactive-resume-postgres reactive-resume-redis reactive-resume-minio reactive-resume-chrome ollama 2>/dev/null || true
    docker rm reactive-resume-postgres reactive-resume-redis reactive-resume-minio reactive-resume-chrome ollama 2>/dev/null || true
    
    echo -e "   ${GRAY}Starting infrastructure services...${NC}"
    docker compose -f $COMPOSE_FILE up -d
    
    echo ""
    echo -e "   ${GREEN}✓ Docker services started${NC}"
    echo ""
    
    # Wait for services
    echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
    sleep 10
    
    docker compose -f $COMPOSE_FILE ps
    echo ""
else
    echo -e "${GRAY}⏭️  Step 3: Skipping Docker management${NC}"
    echo ""
fi

# Step 4: Install dependencies
echo -e "${YELLOW}📦 Step 4: Installing dependencies...${NC}"
echo ""

if [ "$CLEAN_INSTALL" = true ]; then
    echo -e "   ${GRAY}Clean install: Removing node_modules and lock file...${NC}"
    rm -rf node_modules pnpm-lock.yaml
fi

echo -e "   ${GRAY}Running: pnpm install --no-frozen-lockfile${NC}"
pnpm install --no-frozen-lockfile

# Fix Prisma client if needed
echo -e "   ${GRAY}Ensuring Prisma client is properly installed...${NC}"
rm -rf node_modules/.pnpm/@prisma* 2>/dev/null || true
pnpm install @prisma/client prisma --force 2>/dev/null || true

# Install compatible nestjs-prisma version
echo -e "   ${GRAY}Installing compatible nestjs-prisma...${NC}"
pnpm install nestjs-prisma@0.25.0 --force 2>/dev/null || true

# Approve build scripts for Prisma (required for proper generation)
echo -e "   ${GRAY}Approving build scripts for Prisma...${NC}"
echo -e "      ${GRAY}Auto-selecting all packages for build...${NC}"
printf "a\n" | pnpm approve-builds 2>/dev/null || printf "a\n" | pnpm approve-builds || true

echo ""
echo -e "   ${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 5: Generate Prisma client (no build needed for dev mode)
echo -e "${YELLOW}🔧 Step 5: Generating Prisma client...${NC}"
echo ""

echo -e "   ${GRAY}Generating Prisma client...${NC}"

# Generate Prisma client (nuclear approach - force consistent versions)
echo -e "   ${GRAY}Generating Prisma client (forcing consistent versions)...${NC}"

# Step 1: Force install exact matching versions
echo -e "      ${GRAY}Installing exact matching Prisma versions...${NC}"
cd apps/server

# Remove existing Prisma installations
rm -rf node_modules/.pnpm/@prisma* 2>/dev/null || true
rm -rf node_modules/.pnpm/prisma* 2>/dev/null || true

# Install exact versions that match
pnpm install @prisma/client@6.16.3 prisma@6.16.3 --force

# Step 2: Force rebuild the client from scratch
echo -e "      ${GRAY}Forcing Prisma client rebuild...${NC}"

# Remove any existing generated client
rm -rf node_modules/@prisma/client 2>/dev/null || true
rm -rf node_modules/.prisma 2>/dev/null || true

# Generate with fresh installation
npx prisma generate

cd ../..

# NUCLEAR FIX: Force rebuild Prisma client in the correct location
echo -e "      ${GRAY}Applying nuclear Prisma fix...${NC}"
rm -rf node_modules/@prisma/client 2>/dev/null || true
rm -rf node_modules/.prisma 2>/dev/null || true
rm -rf node_modules/.pnpm/@prisma* 2>/dev/null || true

# Install exact versions and generate
pnpm install @prisma/client@6.16.3 prisma@6.16.3 --force
cd apps/server
npx prisma generate
cd ../..

# Copy generated client to the right place
if [ -d "apps/server/node_modules/@prisma/client" ]; then
    echo -e "      ${GRAY}Copying Prisma client to root node_modules...${NC}"
    cp -r apps/server/node_modules/@prisma/client node_modules/ 2>/dev/null || true
    cp -r apps/server/node_modules/.prisma node_modules/ 2>/dev/null || true
fi

echo ""
echo -e "   ${GREEN}✓ Prisma client generated${NC}"
echo ""

# Step 6: Run database migrations
echo -e "${YELLOW}🗄️  Step 6: Running database migrations...${NC}"
echo ""

# Check if migration_lock.toml exists and has wrong provider
if [ -f "apps/server/prisma/migrations/migration_lock.toml" ]; then
    LOCK_PROVIDER=$(grep 'provider = ' apps/server/prisma/migrations/migration_lock.toml | cut -d'"' -f2)
    if [ "$LOCK_PROVIDER" = "sqlite" ]; then
        echo -e "   ${YELLOW}⚠ Detected SQLite migrations, converting to PostgreSQL baseline...${NC}"
        echo -e "      ${GRAY}Removing old SQLite migration directory...${NC}"
        rm -rf apps/server/prisma/migrations
        
        echo -e "      ${GRAY}Creating PostgreSQL baseline migration...${NC}"
        cd apps/server
        npx prisma migrate deploy --skip-generate || {
            echo -e "      ${YELLOW}Creating baseline with prisma db push...${NC}"
            npx prisma db push --skip-generate --accept-data-loss
        }
        cd ../..
    else
        echo -e "   ${GRAY}Running: pnpm prisma:migrate${NC}"
        pnpm prisma:migrate
    fi
else
    echo -e "   ${GRAY}Running: pnpm prisma:migrate${NC}"
    pnpm prisma:migrate
fi

echo ""
echo -e "   ${GREEN}✓ Migrations complete${NC}"
echo ""

# Step 7: Start with PM2 in DEVELOPMENT mode
echo -e "${YELLOW}🚀 Step 7: Starting services with PM2 (DEVELOPMENT MODE)...${NC}"
echo ""

if ! command -v pm2 &> /dev/null; then
    echo -e "   ${RED}❌ ERROR: PM2 is not installed!${NC}"
    echo -e "   ${GRAY}Install with: npm install -g pm2${NC}"
    exit 1
fi

# Start development servers (same as start-local.ps1 - runs both server and client together)
echo -e "   ${GRAY}Starting development servers: $PM2_DEV_NAME${NC}"
echo -e "      ${GRAY}This will start both server and client together (same as local)${NC}"
pm2 start npm --name "$PM2_DEV_NAME" -- run dev --update-env

# Wait for services to be ready
echo -e "   ${GRAY}Waiting for services to be ready...${NC}"
sleep 15

# Verify backend is running
if curl -f http://localhost:$SERVER_PORT/api/health >/dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "   ${YELLOW}⚠ Backend health check failed (may still be starting)${NC}"
fi

# Verify frontend is running
if curl -f http://localhost:$CLIENT_PORT >/dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "   ${YELLOW}⚠ Frontend health check failed (may still be starting)${NC}"
fi

echo ""
echo -e "   ${GREEN}✓ Services started${NC}"
echo ""

# Step 8: Display status
echo -e "${YELLOW}📊 Step 8: Service Status${NC}"
echo ""

pm2 list

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Development Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Service URLs:${NC}"
echo -e "   • Frontend App: ${CYAN}http://localhost:$CLIENT_PORT${NC}"
echo -e "   • Backend API: ${CYAN}http://localhost:$SERVER_PORT${NC}"
echo -e "   • Health Check: ${CYAN}http://localhost:$SERVER_PORT/api/health${NC}"
echo -e "   • API Docs: ${CYAN}http://localhost:$SERVER_PORT/docs${NC}"
echo ""

echo -e "${GRAY}Useful commands:${NC}"
echo -e "   • View logs: ${CYAN}pm2 logs${NC}"
echo -e "   • Restart: ${CYAN}pm2 restart all${NC}"
echo -e "   • Stop: ${CYAN}pm2 stop all${NC}"
echo -e "   • Monitor: ${CYAN}pm2 monit${NC}"
echo ""

echo -e "${YELLOW}⚠ DEVELOPMENT MODE NOTES:${NC}"
echo -e "   • Backend runs with: ${CYAN}pnpm start:dev${NC} (hot reloading)"
echo -e "   • Frontend runs with: ${CYAN}pnpm dev${NC} (hot reloading)"
echo -e "   • No build step required - runs from source"
echo -e "   • Perfect for development and testing"
echo ""

# Save PM2 process list
pm2 save

echo -e "${GREEN}✓ PM2 process list saved${NC}"
echo ""
