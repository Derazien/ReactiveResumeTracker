#!/bin/bash

# 🚀 ReactiveResume Server Deployment Launcher
# ============================================
# 
# THIS IS THE MAIN SCRIPT TO USE FOR SERVER DEPLOYMENT
# 
# This launcher script calls the appropriate setup script based on your needs:
# - Complete Stack: ReactiveResume + Skyvern + Ollama + All services
# - Lite Mode: ReactiveResume only (PostgreSQL + Redis + MinIO + Chrome)
#
# The actual setup scripts are in scripts/production/ and handle all the heavy lifting
# including automatic conflict resolution, image updates, and hard resets.

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Help function
show_help() {
    echo -e "${BLUE}🚀 ReactiveResume Server Deployment Launcher${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ./deploy-server.sh                           # Deploy complete automation stack"
    echo -e "  ./deploy-server.sh --lite                    # Deploy ReactiveResume only (lightweight)"
    echo -e "  ./deploy-server.sh --hard-reset              # Complete cleanup + deploy complete stack"
    echo -e "  ./deploy-server.sh --update                  # Update images + deploy complete stack"
    echo -e "  ./deploy-server.sh --lite --hard-reset       # Complete cleanup + deploy lite"
    echo -e "  ./deploy-server.sh --lite --update           # Update images + deploy lite"
    echo -e "  ./deploy-server.sh --help                    # Show this help"
    echo ""
    echo -e "${GREEN}Deployment Options:${NC}"
    echo -e "  Default: Complete automation empire (ReactiveResume + Skyvern + Ollama)"
    echo -e "  --lite:  ReactiveResume only (faster, lighter deployment)"
    echo ""
    echo -e "${GREEN}Maintenance Options:${NC}"
    echo -e "  --hard-reset: Complete cleanup of all containers, images, and volumes"
    echo -e "  --update: Pull latest images for all services"
    echo ""
    echo -e "${CYAN}All services run in BACKGROUND with PM2 + Docker!${NC}"
    echo ""
    echo -e "${YELLOW}Script Hierarchy:${NC}"
    echo -e "  deploy-server.sh (this launcher) → calls the appropriate setup script"
    echo -e "  scripts/production/server-setup-complete-stack.sh (full stack)"
    echo -e "  scripts/production/server-setup-reactiveresume-only.sh (lite)"
    echo ""
    exit 0
}

# Parse arguments
LITE_MODE=false
HARD_RESET=false
UPDATE_IMAGES=false
SCRIPT_ARGS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --lite)
            LITE_MODE=true
            shift
            ;;
        --hard-reset)
            HARD_RESET=true
            SCRIPT_ARGS="$SCRIPT_ARGS --hard-reset"
            shift
            ;;
        --update)
            UPDATE_IMAGES=true
            SCRIPT_ARGS="$SCRIPT_ARGS --update"
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🚀 ReactiveResume Server Deployment${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Check if we're on the server
if [[ ! -f "/opt/reactive-resume/package.json" ]]; then
    echo -e "${YELLOW}⚠️  This script should be run on the server at /opt/reactive-resume${NC}"
    echo -e "${CYAN}💡 To deploy from local machine:${NC}"
    echo -e "   scp deploy-server.sh root@66.96.83.44:/opt/reactive-resume/"
    echo -e "   ssh root@66.96.83.44"
    echo -e "   cd /opt/reactive-resume && ./deploy-server.sh"
    exit 1
fi

cd /opt/reactive-resume

if [ "$LITE_MODE" = true ]; then
    echo -e "${YELLOW}⚡ Deploying ReactiveResume only (lightweight)...${NC}"
    echo -e "${CYAN}   (PostgreSQL + Redis + MinIO + Chrome)${NC}"
    if [ "$HARD_RESET" = true ]; then
        echo -e "${YELLOW}   🔄 With hard reset (complete cleanup)${NC}"
    fi
    if [ "$UPDATE_IMAGES" = true ]; then
        echo -e "${YELLOW}   📦 With image updates${NC}"
    fi
    chmod +x scripts/production/server-setup-reactiveresume-only.sh
    ./scripts/production/server-setup-reactiveresume-only.sh $SCRIPT_ARGS
else
    echo -e "${YELLOW}🤖 Deploying complete automation stack...${NC}"
    echo -e "${CYAN}   (ReactiveResume + Skyvern + Ollama + Everything)${NC}"
    if [ "$HARD_RESET" = true ]; then
        echo -e "${YELLOW}   🔄 With hard reset (complete cleanup)${NC}"
    fi
    if [ "$UPDATE_IMAGES" = true ]; then
        echo -e "${YELLOW}   📦 With image updates${NC}"
    fi
    chmod +x scripts/production/server-setup-complete-stack.sh
    ./scripts/production/server-setup-complete-stack.sh $SCRIPT_ARGS
fi

echo ""
echo -e "${GREEN}🎉 Deployment launcher completed!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "${CYAN}💻 Management Commands:${NC}"
echo -e "   Check status: ${GREEN}pm2 status${NC}"
echo -e "   View logs: ${GREEN}pm2 logs${NC}"
echo -e "   Docker status: ${GREEN}docker ps${NC}"
echo -e "   Restart services: ${GREEN}pm2 restart all${NC}"
echo ""
