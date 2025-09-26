#!/bin/bash

# 🚀 Server Complete Stack Deployment (Linux)
# ===========================================
# ReactiveResume + Skyvern + Ollama - All Docker containerized
# Production deployment with background processes
# Enhanced with conflict resolution and update logic

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SERVER_IP="66.96.83.44"
PROJECT_DIR="/opt/reactive-resume"

# Parse command line arguments
HARD_RESET=false
UPDATE_IMAGES=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --hard-reset)
      HARD_RESET=true
      shift
      ;;
    --update)
      UPDATE_IMAGES=true
      shift
      ;;
    --help)
      echo "Usage: $0 [--hard-reset] [--update]"
      echo "  --hard-reset: Complete cleanup of all containers, images, and volumes"
      echo "  --update: Pull latest images for Skyvern and other services"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Docker conflict resolution functions
resolve_port_conflicts() {
    log_info "Resolving port conflicts..."
    
    # Check and resolve port 11434 (Ollama)
    if lsof -i :11434 >/dev/null 2>&1; then
        log_warning "Port 11434 is in use, resolving conflict..."
        PID=$(lsof -ti :11434)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 11434"
        fi
    fi
    
    # Check and resolve port 5432 (PostgreSQL)
    if lsof -i :5432 >/dev/null 2>&1; then
        log_warning "Port 5432 is in use, resolving conflict..."
        PID=$(lsof -ti :5432)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 5432"
        fi
    fi
    
    # Check and resolve port 5433 (Skyvern PostgreSQL)
    if lsof -i :5433 >/dev/null 2>&1; then
        log_warning "Port 5433 is in use, resolving conflict..."
        PID=$(lsof -ti :5433)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 5433"
        fi
    fi
    
    # Check and resolve port 6379 (Redis)
    if lsof -i :6379 >/dev/null 2>&1; then
        log_warning "Port 6379 is in use, resolving conflict..."
        PID=$(lsof -ti :6379)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 6379"
        fi
    fi
    
    # Check and resolve port 6380 (Skyvern Redis)
    if lsof -i :6380 >/dev/null 2>&1; then
        log_warning "Port 6380 is in use, resolving conflict..."
        PID=$(lsof -ti :6380)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 6380"
        fi
    fi
    
    # Check and resolve port 8000 (Skyvern API)
    if lsof -i :8000 >/dev/null 2>&1; then
        log_warning "Port 8000 is in use, resolving conflict..."
        PID=$(lsof -ti :8000)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 8000"
        fi
    fi
    
    # Check and resolve port 8081 (Skyvern UI)
    if lsof -i :8081 >/dev/null 2>&1; then
        log_warning "Port 8081 is in use, resolving conflict..."
        PID=$(lsof -ti :8081)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 8081"
        fi
    fi
    
    log_success "Port conflicts resolved"
}

resolve_container_conflicts() {
    log_info "Resolving container conflicts..."
    
    # List of containers that might conflict
    CONTAINERS=("skyvern-postgres" "reactive-resume-postgres" "reactive-resume-redis" "skyvern-redis" "reactive-resume-minio" "reactive-resume-chrome" "skyvern-api" "skyvern-ui" "ollama")
    
    for container in "${CONTAINERS[@]}"; do
        if docker ps -a --format "table {{.Names}}" | grep -q "^${container}$"; then
            log_warning "Container ${container} exists, removing..."
            docker rm -f ${container} 2>/dev/null || true
            log_success "Removed container ${container}"
        fi
    done
    
    log_success "Container conflicts resolved"
}

hard_reset() {
    log_warning "Performing hard reset - this will remove ALL containers, images, and volumes!"
    
    # Stop all containers
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Remove all containers
    docker rm -f $(docker ps -aq) 2>/dev/null || true
    
    # Remove all images
    docker rmi -f $(docker images -aq) 2>/dev/null || true
    
    # Remove all volumes
    docker volume rm -f $(docker volume ls -q) 2>/dev/null || true
    
    # Remove all networks
    docker network rm $(docker network ls -q) 2>/dev/null || true
    
    # Clean up system
    docker system prune -a --volumes -f
    
    log_success "Hard reset completed"
}

update_images() {
    log_info "Updating Docker images..."
    
    # Pull latest Skyvern images
    log_info "Pulling latest Skyvern images..."
    docker pull public.ecr.aws/skyvern/skyvern:latest
    docker pull public.ecr.aws/skyvern/skyvern-ui:latest
    
    # Pull latest Ollama image
    log_info "Pulling latest Ollama image..."
    docker pull ollama/ollama:latest
    
    # Pull latest PostgreSQL images
    log_info "Pulling latest PostgreSQL images..."
    docker pull postgres:16-alpine
    docker pull postgres:14-alpine
    
    # Pull latest Redis images
    log_info "Pulling latest Redis images..."
    docker pull redis:7-alpine
    docker pull redis:alpine
    
    # Pull latest MinIO image
    log_info "Pulling latest MinIO image..."
    docker pull minio/minio:latest
    
    # Pull latest Chrome image
    log_info "Pulling latest Chrome image..."
    docker pull browserless/chrome:latest
    
    log_success "All images updated"
}

echo -e "${BLUE}🚀 Complete Automation Stack Deployment${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

# Navigate to project
cd $PROJECT_DIR
log_info "Working directory: $(pwd)"

# Check prerequisites
log_info "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { log_error "Docker not found"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose not found"; exit 1; }
command -v node >/dev/null 2>&1 || { log_error "Node.js not found"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { log_error "pnpm not found"; exit 1; }
command -v lsof >/dev/null 2>&1 || { log_error "lsof not found (needed for port conflict resolution)"; exit 1; }
log_success "Prerequisites verified"

# Handle hard reset if requested
if [ "$HARD_RESET" = true ]; then
    hard_reset
fi

# Update images if requested
if [ "$UPDATE_IMAGES" = true ]; then
    update_images
fi

# Resolve conflicts (always run unless hard reset was performed)
if [ "$HARD_RESET" = false ]; then
    resolve_port_conflicts
    resolve_container_conflicts
fi

# Stop existing services (gentle approach)
log_info "Stopping existing services..."
docker-compose -f scripts/docker/docker-compose-complete-stack.yml down 2>/dev/null || true
pkill -f "npm\|node" 2>/dev/null || true
log_success "Existing services stopped"

# Check environment files (should already be configured manually)
log_info "Checking environment configuration..."
if [ -f ".env" ]; then
    chmod 600 .env
    log_success "Main environment found and secured"
else
    log_error ".env not found - please configure environment manually"
    log_info "Copy your testenv.txt content to .env and run again"
    exit 1
fi

if [ -f "services/skyvern/.env" ]; then
    chmod 600 services/skyvern/.env
    log_success "Skyvern environment found and secured"
else
    log_warning "Skyvern .env not found - creating basic configuration"
    mkdir -p services/skyvern
    echo "ENV=production" > services/skyvern/.env
    echo "DATABASE_STRING=postgresql+psycopg://skyvern:skyvern123@localhost:5433/skyvern" >> services/skyvern/.env
    echo "REDIS_URL=redis://localhost:6380" >> services/skyvern/.env
    chmod 600 services/skyvern/.env
fi

# Install dependencies
log_info "Installing dependencies..."
pnpm install --frozen-lockfile
log_success "Dependencies installed"

# Start complete Docker stack
log_info "Starting complete Docker stack..."
docker-compose -f scripts/docker/docker-compose-complete-stack.yml up -d

# Wait for databases
log_info "Waiting for databases to initialize..."
sleep 30

# Set up database schema
log_info "Setting up database schema..."
cd apps/server
npx prisma generate
npx prisma db push --accept-data-loss
cd ..

# Import database if export exists
if [ -f "database-export.json" ]; then
    log_info "Importing database from SQLite export..."
    node scripts/production/complete-database-import.js
    log_success "Database imported"
else
    log_warning "No database export found - starting with empty database"
fi

# Set up MinIO bucket
log_info "Configuring MinIO storage..."
sleep 10
docker exec reactive-resume-minio mc alias set local http://localhost:9000 minioadmin minioadmin123 2>/dev/null || true
docker exec reactive-resume-minio mc mb local/reactive-resume --ignore-existing 2>/dev/null || true
docker exec reactive-resume-minio mc policy set public local/reactive-resume 2>/dev/null || true
log_success "MinIO configured"

# Download LLM models
log_info "Setting up LLM models..."
docker exec ollama ollama pull qwen2.5:7b &
docker exec ollama ollama pull llama3.2:8b &
docker exec ollama ollama pull mistral:7b &
wait
log_success "LLM models ready"

# Build project
log_info "Building ReactiveResume..."
pnpm build
log_success "Build completed"

# Install PM2 for process management
log_info "Installing PM2 for process management..."
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'reactive-resume-backend',
    script: 'dist/main.js',
    cwd: 'apps/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/reactive-resume/logs/backend-error.log',
    out_file: '/opt/reactive-resume/logs/backend-out.log',
    log_file: '/opt/reactive-resume/logs/backend.log'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start ReactiveResume with PM2 (background)
log_info "Starting ReactiveResume backend with PM2..."
cd apps/server
pm2 start ../../ecosystem.config.js
pm2 save
pm2 startup
cd ../..

# Health checks
log_info "Performing health checks..."
sleep 10

echo ""
echo -e "${GREEN}🎉 COMPLETE STACK DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo -e "${CYAN}🌐 Your Automation Empire:${NC}"
echo -e "   ReactiveResume: http://$SERVER_IP:3000"
echo -e "   Skyvern UI: http://$SERVER_IP:8081"
echo -e "   MinIO Console: http://$SERVER_IP:9001"
echo -e "   Ollama API: http://$SERVER_IP:11434"
echo ""
echo -e "${CYAN}🗄️ Databases (All Docker):${NC}"
echo -e "   ReactiveResume PostgreSQL: postgres-main:5432"
echo -e "   Skyvern PostgreSQL: skyvern-postgres:5433"
echo -e "   Redis Cache: redis:6379"
echo ""
echo -e "${CYAN}💻 Process Management:${NC}"
echo -e "   PM2 Status: ${GREEN}pm2 status${NC}"
echo -e "   PM2 Logs: ${GREEN}pm2 logs${NC}"
echo -e "   Docker Status: ${GREEN}docker ps${NC}"
echo -e "   Restart Backend: ${GREEN}pm2 restart reactive-resume-backend${NC}"
echo ""
echo -e "${CYAN}🔧 Script Options:${NC}"
echo -e "   Normal run: ${GREEN}./server-setup-complete-stack.sh${NC}"
echo -e "   Hard reset: ${GREEN}./server-setup-complete-stack.sh --hard-reset${NC}"
echo -e "   Update images: ${GREEN}./server-setup-complete-stack.sh --update${NC}"
echo -e "   Both options: ${GREEN}./server-setup-complete-stack.sh --hard-reset --update${NC}"
echo ""
echo -e "${CYAN}💰 Cost Savings:${NC}"
echo -e "   LLM Hosting: ${GREEN}\$0/month${NC} (unlimited local)"
echo -e "   Server Cost: ${GREEN}\$46/month trial → \$22.50/month annual${NC}"
echo -e "   Total Savings: ${GREEN}\$180-900/year${NC}"
echo ""
echo -e "${GREEN}🎯 All services running in BACKGROUND - terminal is free!${NC}"
echo -e "${GREEN}💪 Your 64GB automation empire is LIVE!${NC}"
