#!/bin/bash

# 🚀 Server ReactiveResume Only Setup (Linux) 
# ===========================================
# Lightweight server deployment - ReactiveResume only, no Skyvern
# Uses Docker PostgreSQL for consistency
# Enhanced with conflict resolution and update logic

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
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
      echo "  --update: Pull latest images for PostgreSQL and other services"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Docker conflict resolution functions
resolve_port_conflicts() {
    log_info "Resolving port conflicts..."
    
    # Check and resolve port 5432 (PostgreSQL)
    if lsof -i :5432 >/dev/null 2>&1; then
        log_warning "Port 5432 is in use, resolving conflict..."
        PID=$(lsof -ti :5432)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 5432"
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
    
    # Check and resolve port 9000 (MinIO)
    if lsof -i :9000 >/dev/null 2>&1; then
        log_warning "Port 9000 is in use, resolving conflict..."
        PID=$(lsof -ti :9000)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 9000"
        fi
    fi
    
    # Check and resolve port 9001 (MinIO Console)
    if lsof -i :9001 >/dev/null 2>&1; then
        log_warning "Port 9001 is in use, resolving conflict..."
        PID=$(lsof -ti :9001)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 9001"
        fi
    fi
    
    # Check and resolve port 3001 (Chrome)
    if lsof -i :3001 >/dev/null 2>&1; then
        log_warning "Port 3001 is in use, resolving conflict..."
        PID=$(lsof -ti :3001)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            log_success "Freed port 3001"
        fi
    fi
    
    log_success "Port conflicts resolved"
}

resolve_container_conflicts() {
    log_info "Resolving container conflicts..."
    
    # List of containers that might conflict
    CONTAINERS=("reactive-resume-postgres" "reactive-resume-redis" "reactive-resume-minio" "reactive-resume-chrome")
    
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
    
    # Pull latest PostgreSQL image
    log_info "Pulling latest PostgreSQL image..."
    docker pull postgres:16-alpine
    
    # Pull latest Redis image
    log_info "Pulling latest Redis image..."
    docker pull redis:7-alpine
    
    # Pull latest MinIO image
    log_info "Pulling latest MinIO image..."
    docker pull minio/minio:latest
    
    # Pull latest Chrome image
    log_info "Pulling latest Chrome image..."
    docker pull browserless/chrome:latest
    
    log_success "All images updated"
}

echo -e "${BLUE}🚀 ReactiveResume Server Deployment${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

cd $PROJECT_DIR

# Check prerequisites
log_info "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { log_error "Docker not found"; exit 1; }
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
docker-compose -f scripts/docker/docker-compose-reactiveresume-only.yml down 2>/dev/null || true
pkill -f "npm\|node" 2>/dev/null || true

# Check environment configuration
log_info "Checking environment configuration..."
if [ -f ".env" ]; then
    chmod 600 .env
    log_success "Environment found and secured"
else
    echo "❌ .env not found - please configure environment manually"
    echo "Copy your testenv.txt content to .env and run again"
    exit 1
fi

# Install dependencies
log_info "Installing dependencies..."
pnpm install --frozen-lockfile

# Start ReactiveResume-only Docker services
log_info "Starting ReactiveResume services..."
docker-compose -f scripts/docker/docker-compose-reactiveresume-only.yml up -d

# Wait for database
log_info "Waiting for PostgreSQL..."
sleep 20

# Set up database
log_info "Setting up database schema..."
cd apps/server
npx prisma generate
npx prisma db push
cd ../..

# Import data if available
cd /opt/reactive-resume
if [ -f "database-export.json" ]; then
    log_info "Importing database..."
    node scripts/production/complete-database-import.js
    log_success "Database imported"
fi

# Build project
log_info "Building project..."
pnpm build

# Set up PM2
npm install -g pm2

# Create PM2 config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'reactive-resume-backend',
    script: '/opt/reactive-resume/apps/server/dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
log_info "Starting ReactiveResume with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}🎉 REACTIVERESUME DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${CYAN}🌐 Your Application:${NC}"
echo -e "   ReactiveResume: http://$SERVER_IP:3000"
echo -e "   MinIO Console: http://$SERVER_IP:9001"
echo ""
echo -e "${CYAN}💻 Management Commands:${NC}"
echo -e "   Status: ${GREEN}pm2 status${NC}"
echo -e "   Logs: ${GREEN}pm2 logs${NC}"
echo -e "   Restart: ${GREEN}pm2 restart reactive-resume-backend${NC}"
echo -e "   Docker: ${GREEN}docker ps${NC}"
echo ""
echo -e "${GREEN}🎯 Lightweight deployment complete - terminal is free!${NC}"
