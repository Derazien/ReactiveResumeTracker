#!/bin/bash

# 🚀 Server ReactiveResume Only Setup (Linux) 
# ===========================================
# Lightweight server deployment - ReactiveResume only, no Skyvern
# Uses Docker PostgreSQL for consistency

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SERVER_IP="66.96.83.44"
PROJECT_DIR="/opt/reactive-resume"

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }

echo -e "${BLUE}🚀 ReactiveResume Server Deployment${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

cd $PROJECT_DIR

# Check prerequisites
log_info "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not found"; exit 1; }
log_success "Prerequisites verified"

# Stop existing services
log_info "Stopping existing services..."
docker-compose down 2>/dev/null || true
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
docker-compose -f docker-compose-reactiveresume-only.yml up -d

# Wait for database
log_info "Waiting for PostgreSQL..."
sleep 20

# Set up database
log_info "Setting up database schema..."
cd apps/server
npx prisma generate
npx prisma db push

# Import data if available
cd /opt/reactive-resume
if [ -f "database-export.json" ]; then
    log_info "Importing database..."
    node complete-database-import.js
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
    script: 'dist/main.js',
    cwd: 'apps/server',
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
cd apps/server
pm2 start ../../ecosystem.config.js
pm2 save
pm2 startup
cd ../..

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
